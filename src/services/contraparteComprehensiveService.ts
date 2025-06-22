import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase'
import { 
  ContrapartePermission, 
  ContraparteAccessLevel, 
  DataSharingLevel,
  Usuario, 
  ContraparteViewer,
  ContraparteRelationshipDetails,
  ContractImportRequest,
  ContractImportResult,
  SharedContraparteData
} from '../types/contraparteComprehensive'
import { Contrato, Organizacion } from '../types'

/**
 * Comprehensive service for detailed contraparte management and data sharing
 * Enables users to access detailed partner organization information and import contracts
 */
export class ContraparteComprehensiveService {
  
  /**
   * Grant comprehensive access to a partner organization
   */
  static async grantDetailedContraparteAccess(
    userId: string,
    organizacionId: string,
    accessLevel: ContraparteAccessLevel,
    dataSharing: DataSharingLevel,
    grantedBy: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // 1. Create comprehensive permission record
      const permissionRef = doc(collection(db, 'contrapartePermissions'))
      const permissionData: Omit<ContrapartePermission, 'id'> = {
        userId,
        organizacionId,
        permissions: [accessLevel],
        grantedBy,
        grantedAt: new Date(),
        activa: true,
        accessLevel,
        dataSharing
      }
      
      batch.set(permissionRef, {
        ...permissionData,
        grantedAt: Timestamp.fromDate(permissionData.grantedAt)
      })
      
      // 2. Update user document with enhanced contraparte access
      const userRef = doc(db, 'usuarios', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Usuario
        const currentAccess = userData.contraparteAccess || []
        
        const newAccess = {
          organizacionId,
          accessLevel,
          dataSharing,
          grantedBy,
          grantedAt: new Date()
        }
        
        // Remove existing access to this org and add new one
        const updatedAccess = currentAccess.filter(access => access.organizacionId !== organizacionId)
        updatedAccess.push(newAccess)
        
        batch.update(userRef, {
          contraparteAccess: updatedAccess
        })
      }
      
      await batch.commit()
    } catch (error) {
      console.error('Error granting detailed contraparte access:', error)
      throw new Error('Error al otorgar acceso detallado a la contraparte')
    }
  }
  
  /**
   * Get comprehensive details about a partner organization
   */
  static async getContraparteDetailedInfo(
    userId: string, 
    organizacionId: string
  ): Promise<{
    organization: Organizacion
    relationshipDetails: ContraparteRelationshipDetails
    contracts: Contrato[]
    sharedData: SharedContraparteData
    accessLevel: ContraparteAccessLevel
  } | null> {
    try {
      // 1. Check user has access
      const hasAccess = await this.hasDetailedAccess(userId, organizacionId)
      if (!hasAccess) {
        throw new Error('No tienes acceso a esta información')
      }
      
      // 2. Get organization details
      const orgDoc = await getDoc(doc(db, 'organizaciones', organizacionId))
      if (!orgDoc.exists()) {
        return null
      }
      
      const organization = { id: orgDoc.id, ...orgDoc.data() } as Organizacion
      
      // 3. Get user's organization ID
      const userDoc = await getDoc(doc(db, 'usuarios', userId))
      const userOrganizacionId = userDoc.data()?.organizacionId
      
      // 4. Get contracts between organizations
      const contractsQuery = query(
        collection(db, 'contratos'),
        where('organizacionId', '==', userOrganizacionId),
        where('contraparteId', '==', organizacionId)
      )
      
      const contractsSnapshot = await getDocs(contractsQuery)
      const contracts: Contrato[] = []
      contractsSnapshot.forEach(doc => {
        contracts.push({ id: doc.id, ...doc.data() } as Contrato)
      })
      
      // 5. Get relationship details
      const relationshipDetails = await this.getRelationshipDetails(userOrganizacionId, organizacionId, contracts)
      
      // 6. Get shared data
      const sharedData = await this.getSharedData(organizacionId)
      
      // 7. Get user's access level
      const accessLevel = await this.getUserAccessLevel(userId, organizacionId)
      
      return {
        organization,
        relationshipDetails,
        contracts,
        sharedData,
        accessLevel
      }
      
    } catch (error) {
      console.error('Error getting detailed contraparte info:', error)
      throw new Error('Error al obtener información detallada de la contraparte')
    }
  }
  
  /**
   * Request to import contracts from another user/organization
   */
  static async requestContractImport(
    fromUserId: string,
    toUserId: string,
    contractIds: string[],
    requestedBy: string,
    notes?: string
  ): Promise<string> {
    try {
      const importRequest: Omit<ContractImportRequest, 'id'> = {
        fromUserId,
        toUserId,
        contractIds,
        requestedBy,
        requestedAt: new Date(),
        status: 'pending',
        notes
      }
      
      const docRef = await addDoc(collection(db, 'contractImportRequests'), {
        ...importRequest,
        requestedAt: Timestamp.fromDate(importRequest.requestedAt)
      })
      
      return docRef.id
    } catch (error) {
      console.error('Error requesting contract import:', error)
      throw new Error('Error al solicitar importación de contratos')
    }
  }
  
  /**
   * Approve and execute contract import
   */
  static async approveContractImport(
    requestId: string,
    approvedBy: string
  ): Promise<ContractImportResult> {
    try {
      const batch = writeBatch(db)
      
      // 1. Get import request
      const requestDoc = await getDoc(doc(db, 'contractImportRequests', requestId))
      if (!requestDoc.exists()) {
        throw new Error('Solicitud de importación no encontrada')
      }
      
      const importRequest = { id: requestDoc.id, ...requestDoc.data() } as ContractImportRequest
      
      // 2. Get contracts to import
      const importedContracts: string[] = []
      const failedContracts: { contractId: string; reason: string }[] = []
      
      for (const contractId of importRequest.contractIds) {
        try {
          const contractDoc = await getDoc(doc(db, 'contratos', contractId))
          if (contractDoc.exists()) {
            const contractData = contractDoc.data() as Contrato
            
            // Create new contract for the requesting user
            const newContractRef = doc(collection(db, 'contratos'))
            const newContractData = {
              ...contractData,
              // Update ownership and metadata
              organizacionId: (await getDoc(doc(db, 'usuarios', importRequest.toUserId))).data()?.organizacionId,
              responsableId: importRequest.toUserId,
              fechaCreacion: new Date(),
              version: 1,
              // Add import metadata
              importedFrom: {
                originalContractId: contractId,
                importedFrom: importRequest.fromUserId,
                importedAt: new Date(),
                approvedBy
              }
            }
            
            batch.set(newContractRef, {
              ...newContractData,
              fechaCreacion: Timestamp.fromDate(newContractData.fechaCreacion),
              importedFrom: {
                ...newContractData.importedFrom,
                importedAt: Timestamp.fromDate(newContractData.importedFrom.importedAt)
              }
            })
            
            importedContracts.push(newContractRef.id)
          } else {
            failedContracts.push({ contractId, reason: 'Contrato no encontrado' })
          }
        } catch (error) {
          failedContracts.push({ contractId, reason: `Error: ${error}` })
        }
      }
      
      // 3. Update import request status
      batch.update(doc(db, 'contractImportRequests', requestId), {
        status: 'approved',
        approvedBy,
        approvedAt: Timestamp.fromDate(new Date())
      })
      
      await batch.commit()
      
      return {
        success: failedContracts.length === 0,
        importedContracts,
        failedContracts,
        summary: {
          totalRequested: importRequest.contractIds.length,
          totalImported: importedContracts.length,
          totalFailed: failedContracts.length
        }
      }
      
    } catch (error) {
      console.error('Error approving contract import:', error)
      throw new Error('Error al aprobar importación de contratos')
    }
  }
  
  /**
   * Get all import requests for a user
   */
  static async getImportRequests(userId: string): Promise<ContractImportRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, 'contractImportRequests'),
        where('toUserId', '==', userId),
        orderBy('requestedAt', 'desc')
      )
      
      const snapshot = await getDocs(requestsQuery)
      const requests: ContractImportRequest[] = []
      
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() } as ContractImportRequest)
      })
      
      return requests
    } catch (error) {
      console.error('Error getting import requests:', error)
      throw new Error('Error al obtener solicitudes de importación')
    }
  }
  
  /**
   * Get all users who have access to view a specific contraparte
   */
  static async getContraparteViewers(organizacionId: string): Promise<ContraparteViewer[]> {
    try {
      // Get all permissions for this organization
      const permissionsQuery = query(
        collection(db, 'contrapartePermissions'),
        where('organizacionId', '==', organizacionId),
        where('activa', '==', true)
      )
      
      const permissionsSnapshot = await getDocs(permissionsQuery)
      const viewers: ContraparteViewer[] = []
      
      for (const permissionDoc of permissionsSnapshot.docs) {
        const permission = permissionDoc.data() as ContrapartePermission
        
        // Get user details
        const userDoc = await getDoc(doc(db, 'usuarios', permission.userId))
        if (userDoc.exists()) {
          const userData = userDoc.data() as Usuario
            viewers.push({
            userId: permission.userId,
            userName: userData.nombre || 'Usuario',
            email: userData.email,
            permissions: [permission.accessLevel],
            dataSharing: permission.dataSharing,
            grantedAt: permission.grantedAt
          })
        }
      }
      
      return viewers
    } catch (error) {
      console.error('Error getting contraparte viewers:', error)
      throw new Error('Error al obtener usuarios con acceso')
    }
  }

  /**
   * Revoke user access to a contraparte
   */
  static async revokeContraparteAccess(userId: string, organizacionId: string): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // 1. Update permission record
      const permissionsQuery = query(
        collection(db, 'contrapartePermissions'),
        where('userId', '==', userId),
        where('organizacionId', '==', organizacionId),
        where('activa', '==', true)
      )
      
      const permissionsSnapshot = await getDocs(permissionsQuery)
      permissionsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { activa: false })
      })
      
      // 2. Update user document
      const userRef = doc(db, 'usuarios', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Usuario
        const currentAccess = userData.contraparteAccess || []
        
        // Remove access to this organization
        const updatedAccess = currentAccess.filter(access => access.organizacionId !== organizacionId)
        
        batch.update(userRef, {
          contraparteAccess: updatedAccess
        })
      }
      
      await batch.commit()
    } catch (error) {
      console.error('Error revoking contraparte access:', error)
      throw new Error('Error al revocar acceso a la contraparte')
    }
  }

  // Private helper methods
  private static async hasDetailedAccess(userId: string, organizacionId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId))
      if (!userDoc.exists()) return false
      
      const userData = userDoc.data() as Usuario
      const contraparteAccess = userData.contraparteAccess || []
      
      return contraparteAccess.some(access => 
        access.organizacionId === organizacionId && 
        [ContraparteAccessLevel.VIEW_DETAILED, ContraparteAccessLevel.FULL_ACCESS].includes(access.accessLevel)
      )
    } catch (error) {
      console.error('Error checking detailed access:', error)
      return false
    }
  }
  
  private static async getUserAccessLevel(userId: string, organizacionId: string): Promise<ContraparteAccessLevel> {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId))
      if (!userDoc.exists()) return ContraparteAccessLevel.VIEW_BASIC
      
      const userData = userDoc.data() as Usuario
      const contraparteAccess = userData.contraparteAccess || []
      
      const access = contraparteAccess.find(access => access.organizacionId === organizacionId)
      return access?.accessLevel || ContraparteAccessLevel.VIEW_BASIC
    } catch (error) {
      console.error('Error getting user access level:', error)
      return ContraparteAccessLevel.VIEW_BASIC
    }
  }
  
  private static async getRelationshipDetails(
    userOrgId: string, 
    partnerOrgId: string, 
    contracts: Contrato[]
  ): Promise<ContraparteRelationshipDetails> {
    // Implementation for gathering comprehensive relationship details
    // This would analyze contracts, payment history, etc.
    
    const totalValue = contracts.reduce((sum, contract) => sum + (contract.monto || 0), 0)
    const avgValue = contracts.length > 0 ? totalValue / contracts.length : 0
    
    return {
      firstContactDate: contracts.length > 0 ? contracts[0].fechaCreacion : new Date(),
      totalContractsValue: totalValue,
      averageContractValue: avgValue,
      contractFrequency: 'irregular', // Would be calculated based on contract dates
      preferredContactMethod: 'email',
      relationshipStatus: contracts.some(c => c.estado === 'activo') ? 'active' : 'inactive',
      keyContacts: [],
      negotiationHistory: [],
      paymentHistory: [],
      riskAssessment: {
        overallRisk: 'low',
        financialRisk: 'low',
        operationalRisk: 'low',
        complianceRisk: 'low',
        lastAssessment: new Date(),
        assessedBy: 'system',
        notes: 'Auto-generated assessment'
      }
    }
  }
  
  private static async getSharedData(organizacionId: string): Promise<SharedContraparteData> {
    // Implementation for getting shared templates, best practices, etc.
    return {
      templates: [],
      bestPractices: [],
      pricingGuidelines: [],
      negotiationTips: []
    }
  }
}
