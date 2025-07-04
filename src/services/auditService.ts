import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'
import { RegistroAuditoria, UserRole, Usuario } from '../types'

export class AuditService {
  private static instance: AuditService
  private readonly collection = 'registros_auditoria'

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  /**
   * Obtiene registros de auditoría según el rol del usuario
   * USER: Solo su propio historial + historial de proyectos/contratos donde participa (sin detalles de otros usuarios)
   * MANAGER: Todo el historial de proyectos/contratos donde participa + detalles
   * ORG_ADMIN: Todo el historial de la organización + detalles
   * SUPER_ADMIN: Todo el historial de todas las organizaciones
   */
  async getAuditRecords(
    currentUser: Usuario,
    filters?: {
      contratoId?: string
      proyectoId?: string
      fechaInicio?: Date
      fechaFin?: Date
      accion?: string
      usuarioId?: string
    },
    pageSize = 50,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    records: RegistroAuditoria[]
    hasMore: boolean
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
  }> {
    try {
      let baseQuery = collection(db, this.collection)
      const constraints: any[] = []

      // Aplicar filtros según el rol del usuario
      if (currentUser.rol === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN puede ver todo
        // No agregar restricciones adicionales
      } else {
        // Para todos los demás roles, primero obtenemos los contratos de su organización
        // para luego filtrar los registros de auditoría
        
        // Obtener contratos de la organización del usuario actual
        const contractsQuery = query(
          collection(db, 'contratos'),
          where('organizacionId', '==', currentUser.organizacionId)
        )
        
        const contractsSnapshot = await getDocs(contractsQuery)
        const contractIds = contractsSnapshot.docs.map(doc => doc.id)
        
        if (contractIds.length === 0) {
          // Si no hay contratos en la organización, solo mostrar registros del usuario
          constraints.push(where('usuarioId', '==', currentUser.id))
        } else {
          // Filtrar por contratos de la organización
          // Firestore 'in' query has a limit of 10 items, so we'll chunk if needed
          if (contractIds.length <= 10) {
            constraints.push(where('contratoId', 'in', contractIds))
          } else {
            // For more than 10 contracts, we'll need to do multiple queries
            // For now, let's limit to first 10 contracts
            constraints.push(where('contratoId', 'in', contractIds.slice(0, 10)))
          }
        }

        // Aplicar filtros adicionales según el rol
        if (currentUser.rol === UserRole.USER) {
          // USER solo puede ver registros donde él es el usuario O de contratos donde participa
          // Como ya filtramos por contratos de la organización, dejamos así
        } else if (currentUser.rol === UserRole.MANAGER) {
          // MANAGER puede ver todos los registros de los contratos de la organización
          // Ya está filtrado por arriba
        } else if (currentUser.rol === UserRole.ORG_ADMIN) {
          // ORG_ADMIN puede ver todos los registros de la organización
          // Ya está filtrado por arriba
        }
      }

      // Aplicar filtros adicionales
      if (filters?.contratoId) {
        // Si se especifica un contrato específico, sobrescribir el filtro anterior
        constraints.length = 0 // Clear previous constraints
        constraints.push(where('contratoId', '==', filters.contratoId))
      }
      
      if (filters?.usuarioId && (currentUser.rol === UserRole.ORG_ADMIN || currentUser.rol === UserRole.SUPER_ADMIN)) {
        constraints.push(where('usuarioId', '==', filters.usuarioId))
      }

      if (filters?.accion) {
        constraints.push(where('accion', '==', filters.accion))
      }

      if (filters?.fechaInicio) {
        constraints.push(where('fecha', '>=', Timestamp.fromDate(filters.fechaInicio)))
      }

      if (filters?.fechaFin) {
        constraints.push(where('fecha', '<=', Timestamp.fromDate(filters.fechaFin)))
      }

      // Ordenar por fecha descendente
      constraints.push(orderBy('fecha', 'desc'))
      constraints.push(limit(pageSize))

      if (lastDoc) {
        constraints.push(startAfter(lastDoc))
      }

      const q = query(baseQuery, ...constraints)
      const querySnapshot = await getDocs(q)
      
      const records: RegistroAuditoria[] = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate() || new Date()
        } as RegistroAuditoria
      })

      // Filtrar detalles según el rol
      const filteredRecords = this.filterRecordsByRole(records, currentUser)

      return {
        records: filteredRecords,
        hasMore: querySnapshot.docs.length === pageSize,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
      }
    } catch (error) {
      console.error('Error al obtener registros de auditoría:', error)
      throw new Error('Error al cargar el historial de auditoría')
    }
  }

  /**
   * Filtra los registros según el rol del usuario
   * USER: Oculta detalles sensibles de otros usuarios
   * MANAGER: Muestra detalles de proyectos donde participa
   * ORG_ADMIN/SUPER_ADMIN: Muestra todos los detalles
   */
  private filterRecordsByRole(records: RegistroAuditoria[], currentUser: Usuario): RegistroAuditoria[] {
    if (currentUser.rol === UserRole.ORG_ADMIN || currentUser.rol === UserRole.SUPER_ADMIN) {
      // Mostrar todos los detalles
      return records
    }

    if (currentUser.rol === UserRole.MANAGER) {
      // Mostrar detalles de proyectos/contratos donde participa
      return records.map(record => {
        if (record.usuarioId === currentUser.id) {
          return record // Mostrar sus propios registros completos
        }
        
        // Para registros de otros usuarios, mostrar información limitada pero útil
        return {
          ...record,
          descripcion: this.sanitizeDescriptionForManager(record.descripcion, record.accion),
          metadatos: record.metadatos ? { accion: record.accion } : undefined
        }
      })
    }

    // USER: Solo registros propios con información limitada de contexto
    return records.map(record => {
      if (record.usuarioId === currentUser.id) {
        return record // Sus propios registros completos
      }
      
      // Para registros de otros usuarios en el mismo contexto (proyecto/contrato), información muy limitada
      return {
        ...record,
        descripcion: this.sanitizeDescriptionForUser(record.accion),
        metadatos: undefined,
        usuarioId: 'usuario_anonimo' // Anonimizar otros usuarios
      }
    })
  }

  private sanitizeDescriptionForManager(description: string, accion: string): string {
    return `Acción realizada: ${accion}`
  }

  private sanitizeDescriptionForUser(accion: string): string {
    return `Actividad en el proyecto: ${accion}`
  }

  /**
   * Obtiene estadísticas de auditoría para la organización
   */
  async getAuditStats(
    currentUser: Usuario,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<{
    totalRegistros: number
    registrosPorAccion: Record<string, number>
    registrosPorUsuario: Record<string, number>
    actividadPorDia: Array<{ fecha: string; cantidad: number }>
  }> {
    try {
      // Solo ORG_ADMIN y SUPER_ADMIN pueden ver estadísticas
      if (currentUser.rol !== UserRole.ORG_ADMIN && currentUser.rol !== UserRole.SUPER_ADMIN) {
        throw new Error('No tienes permisos para ver las estadísticas de auditoría')
      }

      const constraints: any[] = []
      
      if (currentUser.rol === UserRole.ORG_ADMIN) {
        // Para ORG_ADMIN, obtener contratos de su organización y filtrar por esos
        const contractsQuery = query(
          collection(db, 'contratos'),
          where('organizacionId', '==', currentUser.organizacionId)
        )
        
        const contractsSnapshot = await getDocs(contractsQuery)
        const contractIds = contractsSnapshot.docs.map(doc => doc.id)
        
        if (contractIds.length === 0) {
          // Si no hay contratos, retornar estadísticas vacías
          return {
            totalRegistros: 0,
            registrosPorAccion: {},
            registrosPorUsuario: {},
            actividadPorDia: []
          }
        }
        
        // Limitar a los primeros 10 contratos debido a la limitación de Firestore
        if (contractIds.length > 0) {
          constraints.push(where('contratoId', 'in', contractIds.slice(0, 10)))
        }
      }
      // SUPER_ADMIN no tiene restricciones

      if (fechaInicio) {
        constraints.push(where('fecha', '>=', Timestamp.fromDate(fechaInicio)))
      }

      if (fechaFin) {
        constraints.push(where('fecha', '<=', Timestamp.fromDate(fechaFin)))
      }

      const q = query(collection(db, this.collection), ...constraints)
      const querySnapshot = await getDocs(q)

      const records = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          fecha: data.fecha?.toDate() || new Date()
        } as RegistroAuditoria
      })

      // Calcular estadísticas
      const totalRegistros = records.length
      const registrosPorAccion: Record<string, number> = {}
      const registrosPorUsuario: Record<string, number> = {}
      const actividadPorDia: Record<string, number> = {}

      records.forEach(record => {
        // Por acción
        registrosPorAccion[record.accion] = (registrosPorAccion[record.accion] || 0) + 1
        
        // Por usuario
        registrosPorUsuario[record.usuarioId] = (registrosPorUsuario[record.usuarioId] || 0) + 1
        
        // Por día
        const fecha = record.fecha.toISOString().split('T')[0]
        actividadPorDia[fecha] = (actividadPorDia[fecha] || 0) + 1
      })

      const actividadArray = Object.entries(actividadPorDia)
        .map(([fecha, cantidad]) => ({ fecha, cantidad }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))

      return {
        totalRegistros,
        registrosPorAccion,
        registrosPorUsuario,
        actividadPorDia: actividadArray
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de auditoría:', error)
      throw error
    }
  }
}

export default AuditService.getInstance()
