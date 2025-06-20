import { doc, updateDoc, writeBatch, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { Contrato, Proyecto, RegistroAuditoria, AccionAuditoria } from '../types'

export interface ContractProjectAssociation {
  contractId: string
  projectId: string
  associatedBy: string
  associatedAt: Date
}

export class ContractProjectAssociationService {
  
  /**
   * Asocia múltiples contratos a un proyecto
   */
  static async associateContractsToProject(
    contractIds: string[],
    projectId: string,
    userId: string,
    organizationId: string
  ): Promise<void> {
    const batch = writeBatch(db)
    const now = new Date()
    
    try {
      // Actualizar cada contrato con el nuevo projectId
      for (const contractId of contractIds) {
        const contractRef = doc(db, 'contratos', contractId)
        batch.update(contractRef, {
          proyectoId: projectId,
          fechaUltimaModificacion: now,
          modificadoPor: userId,
          version: 1 // Incrementar version si existe
        })
          // Crear registro de auditoría para cada asociación
        const auditRef = doc(collection(db, 'registros_auditoria'))
        const auditRecord: Omit<RegistroAuditoria, 'id'> = {
          contratoId: contractId,
          usuarioId: userId,
          accion: AccionAuditoria.MODIFICACION,
          descripcion: `Contrato asociado al proyecto ${projectId}`,
          fecha: now,
          metadatos: {
            origen: 'contract-project-association',
            version: '1.0',
            proyectoId: projectId,
            campo: 'proyectoId',
            valorAnterior: null,
            valorNuevo: projectId
          },
          ipAddress: 'system',
          userAgent: 'ContractHub System'
        }
        batch.set(auditRef, auditRecord)
      }
      
      // Actualizar el proyecto con la nueva información de contratos
      const projectRef = doc(db, 'proyectos', projectId)
      batch.update(projectRef, {
        fechaUltimaModificacion: now,
        modificadoPor: userId,
        numeroContratos: contractIds.length, // TODO: Incrementar en lugar de sobrescribir
        'metadatos.ultimaAsociacion': now
      })
      
      // Ejecutar todas las operaciones en batch
      await batch.commit()
      
      console.log(`Successfully associated ${contractIds.length} contracts to project ${projectId}`)
      
    } catch (error) {
      console.error('Error associating contracts to project:', error)
      throw new Error(`Failed to associate contracts to project: ${error}`)
    }
  }
  
  /**
   * Desasocia un contrato de un proyecto
   */
  static async disassociateContractFromProject(
    contractId: string,
    userId: string,
    organizationId: string
  ): Promise<void> {
    const batch = writeBatch(db)
    const now = new Date()
    
    try {
      // Actualizar el contrato removiendo el projectId
      const contractRef = doc(db, 'contratos', contractId)
      batch.update(contractRef, {
        proyectoId: null,
        fechaUltimaModificacion: now,
        modificadoPor: userId
      })
        // Crear registro de auditoría
      const auditRef = doc(collection(db, 'registros_auditoria'))
      const auditRecord: Omit<RegistroAuditoria, 'id'> = {
        contratoId: contractId,
        usuarioId: userId,
        accion: AccionAuditoria.MODIFICACION,
        descripcion: `Contrato desasociado del proyecto`,
        fecha: now,
        metadatos: {
          origen: 'contract-project-disassociation',
          version: '1.0',
          campo: 'proyectoId',
          valorAnterior: 'unknown',
          valorNuevo: null
        },
        ipAddress: 'system',
        userAgent: 'ContractHub System'
      }
      batch.set(auditRef, auditRecord)
      
      await batch.commit()
      
      console.log(`Successfully disassociated contract ${contractId} from project`)
      
    } catch (error) {
      console.error('Error disassociating contract from project:', error)
      throw new Error(`Failed to disassociate contract from project: ${error}`)
    }
  }
  
  /**
   * Mueve contratos de un proyecto a otro
   */
  static async moveContractsBetweenProjects(
    contractIds: string[],
    fromProjectId: string,
    toProjectId: string,
    userId: string,
    organizationId: string
  ): Promise<void> {
    const batch = writeBatch(db)
    const now = new Date()
    
    try {
      for (const contractId of contractIds) {
        // Actualizar contrato con nuevo proyecto
        const contractRef = doc(db, 'contratos', contractId)
        batch.update(contractRef, {
          proyectoId: toProjectId,
          fechaUltimaModificacion: now,
          modificadoPor: userId
        })
          // Registro de auditoría
        const auditRef = doc(collection(db, 'registros_auditoria'))
        const auditRecord: Omit<RegistroAuditoria, 'id'> = {
          contratoId: contractId,
          usuarioId: userId,
          accion: AccionAuditoria.MODIFICACION,
          descripcion: `Contrato movido del proyecto ${fromProjectId} al proyecto ${toProjectId}`,
          fecha: now,
          metadatos: {
            origen: 'contract-project-move',
            version: '1.0',
            proyectoOrigen: fromProjectId,
            proyectoDestino: toProjectId,
            campo: 'proyectoId',
            valorAnterior: fromProjectId,
            valorNuevo: toProjectId
          },
          ipAddress: 'system',
          userAgent: 'ContractHub System'
        }
        batch.set(auditRef, auditRecord)
      }
      
      await batch.commit()
      
      console.log(`Successfully moved ${contractIds.length} contracts from project ${fromProjectId} to ${toProjectId}`)
      
    } catch (error) {
      console.error('Error moving contracts between projects:', error)
      throw new Error(`Failed to move contracts between projects: ${error}`)
    }
  }
}

export default ContractProjectAssociationService
