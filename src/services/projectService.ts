import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase'
import { Proyecto, EstadisticasProyecto, Contrato, EstadoContrato, TipoEconomico, CategoriaContrato, EstadoProyecto } from '../types'

// Servicio para gestión de proyectos
export class ProjectService {
  
  // Obtener todos los proyectos
  static async obtenerProyectos(): Promise<Proyecto[]> {
    try {
      const proyectosRef = collection(db, 'proyectos')
      const snapshot = await getDocs(proyectosRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate() || new Date(),
        fechaFinEstimada: doc.data().fechaFinEstimada?.toDate(),
        fechaFinReal: doc.data().fechaFinReal?.toDate(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        fechaUltimaModificacion: doc.data().fechaUltimaModificacion?.toDate() || new Date()
      } as Proyecto))
    } catch (error) {
      console.error('Error obteniendo proyectos:', error)
      return []
    }
  }

  // Obtener proyecto por ID
  static async obtenerProyectoPorId(id: string): Promise<Proyecto | null> {
    try {
      const proyectoRef = doc(db, 'proyectos', id)
      const snapshot = await getDoc(proyectoRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return {
        id: snapshot.id,
        ...data,
        fechaInicio: data.fechaInicio?.toDate() || new Date(),
        fechaFinEstimada: data.fechaFinEstimada?.toDate(),
        fechaFinReal: data.fechaFinReal?.toDate(),
        fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
        fechaUltimaModificacion: data.fechaUltimaModificacion?.toDate() || new Date()
      } as Proyecto
    } catch (error) {
      console.error('Error obteniendo proyecto:', error)
      return null
    }
  }

  // Obtener proyectos por organización
  static async obtenerProyectosPorOrganizacion(organizacionId: string): Promise<Proyecto[]> {
    try {
      const proyectosRef = collection(db, 'proyectos')
      const q = query(
        proyectosRef,
        where('organizacionId', '==', organizacionId),
        orderBy('fechaCreacion', 'desc')
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate() || new Date(),
        fechaFinEstimada: doc.data().fechaFinEstimada?.toDate(),
        fechaFinReal: doc.data().fechaFinReal?.toDate(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        fechaUltimaModificacion: doc.data().fechaUltimaModificacion?.toDate() || new Date()
      } as Proyecto))
    } catch (error) {
      console.error('Error obteniendo proyectos por organización:', error)
      return []
    }
  }

  // Obtener contratos de un proyecto
  static async obtenerContratosPorProyecto(nombreProyecto: string, organizacionId?: string): Promise<Contrato[]> {
    try {
      const contratosRef = collection(db, 'contratos')
      
      // Build query with organization filter if provided
      let q = query(
        contratosRef,
        where('proyecto', '==', nombreProyecto),
        orderBy('fechaCreacion', 'desc')
      )
      
      // Add organization filter if provided
      if (organizacionId) {
        q = query(
          contratosRef,
          where('proyecto', '==', nombreProyecto),
          where('organizacionId', '==', organizacionId),
          orderBy('fechaCreacion', 'desc')
        )
      }
      
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate() || new Date(),
        fechaTermino: doc.data().fechaTermino?.toDate() || new Date(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date()
      } as Contrato))
    } catch (error) {
      console.error('Error obteniendo contratos por proyecto:', error)
      return []
    }
  }

  // Calcular estadísticas de un proyecto
  static async calcularEstadisticasProyecto(nombreProyecto: string, organizacionId?: string): Promise<EstadisticasProyecto> {
    try {
      const contratos = await this.obtenerContratosPorProyecto(nombreProyecto, organizacionId)
      
      const totalContratos = contratos.length
      const contratosActivos = contratos.filter(c => c.estado === EstadoContrato.ACTIVO).length
      
      // Contratos por vencer (próximos 30 días)
      const hoy = new Date()
      const contratosPorVencer = contratos.filter(c => {
        const diasParaVencer = Math.ceil(
          (c.fechaTermino.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
        )
        return diasParaVencer <= 30 && diasParaVencer > 0
      }).length
      
      // Contratos vencidos
      const contratosVencidos = contratos.filter(c => {
        return c.fechaTermino < hoy && c.estado !== EstadoContrato.RENOVADO
      }).length
      
      // Valores financieros
      const valorTotal = contratos.reduce((sum, c) => sum + c.monto, 0)
      const valorActivo = contratos
        .filter(c => c.estado === EstadoContrato.ACTIVO)
        .reduce((sum, c) => sum + c.monto, 0)
      const ingresos = contratos
        .filter(c => c.tipo === TipoEconomico.INGRESO)
        .reduce((sum, c) => sum + c.monto, 0)
      const egresos = contratos
        .filter(c => c.tipo === TipoEconomico.EGRESO)
        .reduce((sum, c) => sum + c.monto, 0)
      
      // Distribución por categoría
      const distribucionPorCategoria = contratos.reduce((acc, c) => {
        acc[c.categoria] = (acc[c.categoria] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Distribución por estado
      const distribucionPorEstado = contratos.reduce((acc, c) => {
        acc[c.estado] = (acc[c.estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Tendencia mensual (últimos 12 meses)
      const tendenciaMensual = this.generarTendenciaMensual(contratos)
      
      return {
        totalContratos,
        contratosActivos,
        contratosPorVencer,
        contratosVencidos,
        valorTotal,
        valorActivo,
        ingresos,
        egresos,
        distribucionPorCategoria,
        distribucionPorEstado,
        tendenciaMensual
      } as EstadisticasProyecto
    } catch (error) {
      console.error('Error calculando estadísticas:', error)
      return this.estadisticasVacias()
    }
  }

  // Generar tendencia mensual
  private static generarTendenciaMensual(contratos: Contrato[]) {
    const meses = []
    const hoy = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const mesStr = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
      
      const contratosDelMes = contratos.filter(c => {
        const fechaContrato = new Date(c.fechaCreacion)
        return fechaContrato.getFullYear() === fecha.getFullYear() &&
               fechaContrato.getMonth() === fecha.getMonth()
      })
      
      meses.push({
        mes: mesStr,
        valor: contratosDelMes.reduce((sum, c) => sum + c.monto, 0),
        cantidad: contratosDelMes.length
      })
    }
    
    return meses
  }

  // Estadísticas vacías para manejo de errores
  private static estadisticasVacias(): EstadisticasProyecto {
    return {
      totalContratos: 0,
      contratosActivos: 0,
      contratosPorVencer: 0,
      contratosVencidos: 0,
      valorTotal: 0,
      valorActivo: 0,
      ingresos: 0,
      egresos: 0,      distribucionPorCategoria: {
        [CategoriaContrato.SERVICIOS]: 0,
        [CategoriaContrato.COMPRAS]: 0,
        [CategoriaContrato.VENTAS]: 0,
        [CategoriaContrato.ARRENDAMIENTO]: 0,
        [CategoriaContrato.LABORAL]: 0,
        [CategoriaContrato.CONFIDENCIALIDAD]: 0,
        [CategoriaContrato.CONSULTORIA]: 0,
        [CategoriaContrato.MANTENIMIENTO]: 0,
        [CategoriaContrato.SUMINISTRO]: 0,
        [CategoriaContrato.OTRO]: 0
      },
      distribucionPorEstado: {
        [EstadoContrato.BORRADOR]: 0,
        [EstadoContrato.REVISION]: 0,
        [EstadoContrato.APROBADO]: 0,
        [EstadoContrato.ACTIVO]: 0,
        [EstadoContrato.VENCIDO]: 0,
        [EstadoContrato.CANCELADO]: 0,
        [EstadoContrato.RENOVADO]: 0
      },
      tendenciaMensual: []
    }
  }

  // Crear nuevo proyecto
  static async crearProyecto(proyecto: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>): Promise<string | null> {
    try {
      const proyectosRef = collection(db, 'proyectos')
      const nuevoProyecto = {
        ...proyecto,
        fechaCreacion: Timestamp.now(),
        fechaUltimaModificacion: Timestamp.now(),
        version: 1
      }
      
      const docRef = await addDoc(proyectosRef, nuevoProyecto)
      return docRef.id
    } catch (error) {
      console.error('Error creando proyecto:', error)
      return null
    }
  }

  // Actualizar proyecto
  static async actualizarProyecto(id: string, cambios: Partial<Proyecto>): Promise<boolean> {
    try {
      const proyectoRef = doc(db, 'proyectos', id)
      
      // Filter out undefined values to prevent Firebase errors
      const filteredChanges = Object.fromEntries(
        Object.entries(cambios).filter(([_, value]) => value !== undefined)
      )
      
      const actualizacion = {
        ...filteredChanges,
        fechaUltimaModificacion: Timestamp.now(),
        version: (cambios.version || 1) + 1
      }
      
      await updateDoc(proyectoRef, actualizacion)
      return true
    } catch (error) {
      console.error('Error actualizando proyecto:', error)
      return false
    }
  }

  // Eliminar proyecto
  static async eliminarProyecto(id: string): Promise<boolean> {
    try {
      const proyectoRef = doc(db, 'proyectos', id)
      await deleteDoc(proyectoRef)
      return true
    } catch (error) {
      console.error('Error eliminando proyecto:', error)
      return false
    }
  }

  // Obtener resumen de todos los proyectos
  static async obtenerResumenProyectos(organizacionId?: string): Promise<{
    totalProyectos: number,
    proyectosActivos: number,
    proyectosCompletados: number,
    valorTotalProyectos: number,
    proyectosPorEstado: Record<string, number>
  }> {
    try {
      const proyectos = organizacionId 
        ? await this.obtenerProyectosPorOrganizacion(organizacionId)
        : await this.obtenerProyectos()
      
      const totalProyectos = proyectos.length
      const proyectosActivos = proyectos.filter(p => p.estado === EstadoProyecto.EN_CURSO).length
      const proyectosCompletados = proyectos.filter(p => p.estado === EstadoProyecto.COMPLETADO).length
      const valorTotalProyectos = proyectos.reduce((sum, p) => sum + p.presupuestoTotal, 0)
      
      const proyectosPorEstado = proyectos.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return {
        totalProyectos,
        proyectosActivos,
        proyectosCompletados,
        valorTotalProyectos,
        proyectosPorEstado
      }
    } catch (error) {
      console.error('Error obteniendo resumen de proyectos:', error)
      return {
        totalProyectos: 0,
        proyectosActivos: 0,
        proyectosCompletados: 0,
        valorTotalProyectos: 0,
        proyectosPorEstado: {}
      }
    }
  }
}

export default ProjectService
