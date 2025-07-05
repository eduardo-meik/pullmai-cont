import {
  collection,
  doc,
  getDocs,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
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
      searchTerm?: string
    },
    pageSize = 50,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    records: RegistroAuditoria[]
    hasMore: boolean
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
  }> {
    try {
      let records: RegistroAuditoria[] = []

      // Simplified approach: Use single queries with proper indexes
      if (currentUser.rol === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN puede ver todo - simple query
        const constraints: any[] = [orderBy('fecha', 'desc'), limit(pageSize)]
        
        // Apply specific filters if provided
        if (filters?.contratoId) {
          constraints.splice(0, 0, where('contratoId', '==', filters.contratoId))
        }
        if (filters?.usuarioId) {
          constraints.splice(0, 0, where('usuarioId', '==', filters.usuarioId))
        }
        if (filters?.accion) {
          constraints.splice(0, 0, where('accion', '==', filters.accion))
        }
        
        const q = query(collection(db, this.collection), ...constraints)
        const querySnapshot = await getDocs(q)
        
        records = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            fecha: data.fecha?.toDate() || new Date()
          } as RegistroAuditoria
        })

        // Enrich records with user and organization information
        records = await this.enrichRecordsWithUserInfo(records)
        
      } else {
        // For other roles, get all records and filter on the client side to avoid complex queries
        // This is acceptable for demo purposes. In production, consider using Cloud Functions for complex filtering
        
        const constraints: any[] = [orderBy('fecha', 'desc'), limit(200)] // Get more records to filter
        
        // Apply specific filters if provided to reduce the dataset
        if (filters?.contratoId) {
          constraints.splice(0, 0, where('contratoId', '==', filters.contratoId))
        }
        if (filters?.usuarioId) {
          constraints.splice(0, 0, where('usuarioId', '==', filters.usuarioId))
        }
        if (filters?.accion) {
          constraints.splice(0, 0, where('accion', '==', filters.accion))
        }
        
        const q = query(collection(db, this.collection), ...constraints)
        const querySnapshot = await getDocs(q)
        
        let allRecords = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            fecha: data.fecha?.toDate() || new Date()
          } as RegistroAuditoria
        })

        // Enrich records with user and organization information
        allRecords = await this.enrichRecordsWithUserInfo(allRecords)
        
        // Client-side filtering based on organization
        // Get contract IDs for the user's organization
        const contractsQuery = query(
          collection(db, 'contratos'),
          where('organizacionId', '==', currentUser.organizacionId)
        )
        
        const contractsSnapshot = await getDocs(contractsQuery)
        const contractIds = new Set(contractsSnapshot.docs.map(doc => doc.id))
        
        // Filter records: show user's own records + records from organization's contracts
        allRecords = allRecords.filter(record => 
          record.usuarioId === currentUser.id || 
          (record.contratoId && contractIds.has(record.contratoId))
        )
        
        // Apply date filters on client side
        if (filters?.fechaInicio) {
          allRecords = allRecords.filter(record => record.fecha >= filters.fechaInicio!)
        }
        if (filters?.fechaFin) {
          allRecords = allRecords.filter(record => record.fecha <= filters.fechaFin!)
        }
        
        // Paginate on client side
        const startIndex = 0 // Simplified pagination for now
        records = allRecords.slice(startIndex, startIndex + pageSize)
      }

      // Apply search term filtering on client side if provided
      if (filters?.searchTerm && filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase()
        records = records.filter(record =>
          record.descripcion.toLowerCase().includes(searchLower) ||
          record.accion.toLowerCase().includes(searchLower) ||
          record.usuarioId.toLowerCase().includes(searchLower) ||
          (record.contratoId && record.contratoId.toLowerCase().includes(searchLower))
        )
      }

      // Aplicar filtros según el rol del usuario
      records = this.filterRecordsByRole(records, currentUser)

      return {
        records,
        hasMore: false, // Simplified for now
        lastDoc: null
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

  /**
   * Crea un nuevo registro de auditoría
   */
  async createAuditRecord(
    usuarioId: string,
    accion: string,
    descripcion: string,
    contratoId?: string,
    metadatos?: any
  ): Promise<string> {
    try {
      const registroAuditoria = {
        usuarioId,
        accion,
        descripcion,
        fecha: Timestamp.now(),
        contratoId: contratoId || null,
        metadatos: metadatos || {}
      }

      const docRef = await addDoc(collection(db, this.collection), registroAuditoria)
      return docRef.id
    } catch (error) {
      console.error('Error al crear registro de auditoría:', error)
      throw new Error('Error al crear el registro de auditoría')
    }
  }

  /**
   * Enriquece los registros de auditoría con información de usuarios y organizaciones
   */
  private async enrichRecordsWithUserInfo(records: RegistroAuditoria[]): Promise<RegistroAuditoria[]> {
    if (records.length === 0) return records

    try {
      // Get unique user IDs and contract IDs
      const userIds = [...new Set(records.map(r => r.usuarioId).filter(Boolean))]
      const contractIds = [...new Set(records.map(r => r.contratoId).filter(Boolean))]

      // Fetch users information
      const usersMap = new Map<string, any>()
      if (userIds.length > 0) {
        // Batch fetch users (up to 10 at a time due to Firestore 'in' query limit)
        const batchSize = 10
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize)
          try {
            const usersQuery = query(
              collection(db, 'usuarios'),
              where('__name__', 'in', batch)
            )
            const usersSnapshot = await getDocs(usersQuery)
            usersSnapshot.forEach(doc => {
              usersMap.set(doc.id, { id: doc.id, ...doc.data() })
            })
          } catch (error) {
            console.warn('Error fetching users batch:', error)
          }
        }
      }

      // Fetch contracts and organizations information
      const contractsMap = new Map<string, any>()
      const organizationsMap = new Map<string, any>()
      
      if (contractIds.length > 0) {
        // Batch fetch contracts
        const batchSize = 10
        for (let i = 0; i < contractIds.length; i += batchSize) {
          const batch = contractIds.slice(i, i + batchSize)
          try {
            const contractsQuery = query(
              collection(db, 'contratos'),
              where('__name__', 'in', batch)
            )
            const contractsSnapshot = await getDocs(contractsQuery)
            contractsSnapshot.forEach(doc => {
              const contractData = { id: doc.id, ...doc.data() } as any
              contractsMap.set(doc.id, contractData)
              
              // Also collect organization IDs from contracts
              if (contractData.organizacionId) {
                organizationsMap.set(contractData.organizacionId, null) // Mark for loading
              }
            })
          } catch (error) {
            console.warn('Error fetching contracts batch:', error)
          }
        }

        // Fetch organizations
        const orgIds = Array.from(organizationsMap.keys())
        if (orgIds.length > 0) {
          const batchSize = 10
          for (let i = 0; i < orgIds.length; i += batchSize) {
            const batch = orgIds.slice(i, i + batchSize)
            try {
              const orgsQuery = query(
                collection(db, 'organizaciones'),
                where('__name__', 'in', batch)
              )
              const orgsSnapshot = await getDocs(orgsQuery)
              orgsSnapshot.forEach(doc => {
                organizationsMap.set(doc.id, { id: doc.id, ...doc.data() })
              })
            } catch (error) {
              console.warn('Error fetching organizations batch:', error)
            }
          }
        }
      }

      // Enrich records with the fetched information
      return records.map(record => {
        const user = usersMap.get(record.usuarioId)
        const contract = contractsMap.get(record.contratoId || '')
        const organization = contract ? organizationsMap.get(contract.organizacionId) : null

        return {
          ...record,
          // Add enriched user information
          usuarioNombre: user ? `${user.nombre} ${user.apellido || ''}`.trim() : record.usuarioId,
          usuarioEmail: user?.email,
          // Add enriched organization information
          organizacionNombre: organization?.nombre,
          contratoTitulo: contract?.titulo,
          contratoProyecto: contract?.proyecto,
          contratoContraparte: contract?.contraparte
        }
      })

    } catch (error) {
      console.warn('Error enriching records with user info:', error)
      return records // Return original records if enrichment fails
    }
  }
}

export default AuditService.getInstance()
