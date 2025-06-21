import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit 
} from 'firebase/firestore'
import { db } from '../firebase'
import { Contrato, Organizacion, ContraparteRelacion, ContraparteEstadisticas } from '../types'

/**
 * Servicio para gestionar contrapartes basado en organizaciones
 * Las contrapartes son organizaciones con las que tenemos contratos
 */
export class ContraparteOrganizacionService {
  
  /**
   * Obtiene todas las organizaciones que son contrapartes de una organización específica
   */
  static async getContrapartes(organizacionId: string): Promise<ContraparteRelacion[]> {
    try {
      // 1. Obtener todos los contratos de la organización
      const contractsQuery = query(
        collection(db, 'contratos'),
        where('organizacionId', '==', organizacionId)
      )
      
      const contractsSnapshot = await getDocs(contractsQuery)
      const contratos: Contrato[] = []
      
      contractsSnapshot.forEach((doc) => {
        contratos.push({ id: doc.id, ...doc.data() } as Contrato)
      })
      
      // 2. Extraer IDs únicos de contrapartes
      const contraparteIds = [...new Set(contratos.map(c => c.contraparteId).filter(Boolean))]
        // 3. Obtener datos de las organizaciones contrapartes
      const contrapartes: ContraparteRelacion[] = []
      
      for (const contraparteId of contraparteIds) {
        // Skip if contraparteId is undefined or empty
        if (!contraparteId) continue
        
        try {
          const orgDoc = await getDoc(doc(db, 'organizaciones', contraparteId))
          
          if (orgDoc.exists()) {
            const organizacion = { id: orgDoc.id, ...orgDoc.data() } as Organizacion
            
            // Calcular estadísticas para esta contraparte
            const estadisticas = this.calcularEstadisticas(contratos, contraparteId)
            
            contrapartes.push({
              organizacionId: contraparteId,
              organizacion,
              estadisticas
            })
          }
        } catch (error) {
          console.warn(`Error fetching organization ${contraparteId}:`, error)
        }
      }
      
      // Ordenar por monto total descendente
      return contrapartes.sort((a, b) => b.estadisticas.montoTotal - a.estadisticas.montoTotal)
      
    } catch (error) {
      console.error('Error fetching contrapartes:', error)
      throw new Error('Error al obtener contrapartes')
    }
  }
  
  /**
   * Obtiene una relación específica de contraparte
   */
  static async getContraparte(organizacionId: string, contraparteId: string): Promise<ContraparteRelacion | null> {
    try {
      // Obtener datos de la organización contraparte
      const orgDoc = await getDoc(doc(db, 'organizaciones', contraparteId))
      
      if (!orgDoc.exists()) {
        return null
      }
      
      const organizacion = { id: orgDoc.id, ...orgDoc.data() } as Organizacion
      
      // Obtener contratos con esta contraparte
      const contractsQuery = query(
        collection(db, 'contratos'),
        where('organizacionId', '==', organizacionId),
        where('contraparteId', '==', contraparteId)
      )
      
      const contractsSnapshot = await getDocs(contractsQuery)
      const contratos: Contrato[] = []
      
      contractsSnapshot.forEach((doc) => {
        contratos.push({ id: doc.id, ...doc.data() } as Contrato)
      })
      
      const estadisticas = this.calcularEstadisticas(contratos, contraparteId)
      
      return {
        organizacionId: contraparteId,
        organizacion,
        estadisticas
      }
      
    } catch (error) {
      console.error('Error fetching contraparte:', error)
      throw new Error('Error al obtener contraparte')
    }
  }
  
  /**
   * Busca contrapartes por nombre
   */
  static async buscarContrapartes(organizacionId: string, termino: string): Promise<ContraparteRelacion[]> {
    const contrapartes = await this.getContrapartes(organizacionId)
    
    if (!termino.trim()) {
      return contrapartes
    }
    
    const terminoLower = termino.toLowerCase()
    
    return contrapartes.filter(contraparte =>
      contraparte.organizacion.nombre.toLowerCase().includes(terminoLower) ||
      contraparte.organizacion.descripcion?.toLowerCase().includes(terminoLower)
    )
  }
  
  /**
   * Obtiene contratos con una contraparte específica
   */
  static async getContratosConContraparte(
    organizacionId: string, 
    contraparteId: string
  ): Promise<Contrato[]> {
    try {
      const contractsQuery = query(
        collection(db, 'contratos'),
        where('organizacionId', '==', organizacionId),
        where('contraparteId', '==', contraparteId),
        orderBy('fechaCreacion', 'desc')
      )
      
      const contractsSnapshot = await getDocs(contractsQuery)
      const contratos: Contrato[] = []
      
      contractsSnapshot.forEach((doc) => {
        contratos.push({ id: doc.id, ...doc.data() } as Contrato)
      })
      
      return contratos
      
    } catch (error) {
      console.error('Error fetching contracts with contraparte:', error)
      throw new Error('Error al obtener contratos con contraparte')
    }
  }
  
  /**
   * Calcula estadísticas para una contraparte específica
   */
  private static calcularEstadisticas(contratos: Contrato[], contraparteId: string): ContraparteEstadisticas {
    const contratosContraparte = contratos.filter(c => c.contraparteId === contraparteId)
    
    const totalContratos = contratosContraparte.length
    const montoTotal = contratosContraparte.reduce((sum, c) => sum + c.monto, 0)
    const montoPromedio = totalContratos > 0 ? montoTotal / totalContratos : 0
    
    const contratosActivos = contratosContraparte.filter(c => c.estado === 'activo').length
    const contratosVencidos = contratosContraparte.filter(c => c.estado === 'vencido').length
    
    // Contratos que vencen en los próximos 30 días
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + 30)
    
    const contratosProximosVencer = contratosContraparte.filter(c => 
      c.fechaTermino <= fechaLimite && c.estado === 'activo'
    ).length
    
    // Último contrato
    const contratosSorted = contratosContraparte.sort((a, b) => 
      b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
    )
    const ultimoContrato = contratosSorted.length > 0 ? contratosSorted[0].fechaCreacion : undefined
    
    // Próximo vencimiento
    const contratosActivosSorted = contratosContraparte
      .filter(c => c.estado === 'activo')
      .sort((a, b) => a.fechaTermino.getTime() - b.fechaTermino.getTime())
    const proximoVencimiento = contratosActivosSorted.length > 0 ? contratosActivosSorted[0].fechaTermino : undefined
    
    // Categorías principales
    const categorias = contratosContraparte.map(c => c.categoria)
    const categoriaCount = categorias.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const categoriasPrincipales = Object.entries(categoriaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoria]) => categoria)
    
    // Departamentos involucrados
    const departamentos = [...new Set(contratosContraparte.map(c => c.departamento))]
    
    return {
      totalContratos,
      montoTotal,
      montoPromedio,
      contratosActivos,
      contratosVencidos,
      contratosProximosVencer,
      ultimoContrato,
      proximoVencimiento,
      categoriasPrincipales,
      departamentosInvolucrados: departamentos
    }
  }
}
