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
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'
import { ContrapartePermission, ContraparteAccessLevel, Usuario, ContraparteViewer } from '../types/contraparteEnhanced'

/**
 * Enhanced service for managing contraparte permissions and user access
 * This approach maintains the current efficient structure while adding granular access control
 */
export class ContrapartePermissionService {
  
  /**
   * Grant a user viewer access to a partner organization
   */
  static async grantContraparteAccess(
    userId: string,
    organizacionId: string,
    permissions: ContraparteAccessLevel[],
    grantedBy: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // 1. Create permission record
      const permissionRef = doc(collection(db, 'contrapartePermissions'))
      const permissionData: Omit<ContrapartePermission, 'id'> = {
        userId,
        organizacionId,
        permissions,
        grantedBy,
        grantedAt: new Date(),
        activa: true
      }
      
      batch.set(permissionRef, {
        ...permissionData,
        grantedAt: Timestamp.fromDate(permissionData.grantedAt)
      })
      
      // 2. Update user document to include contraparte access
      const userRef = doc(db, 'usuarios', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Usuario
        const currentAccess = userData.contraparteAccess || []
        
        if (!currentAccess.includes(organizacionId)) {
          batch.update(userRef, {
            contraparteAccess: [...currentAccess, organizacionId]
          })
        }
      }
      
      await batch.commit()
    } catch (error) {
      console.error('Error granting contraparte access:', error)
      throw new Error('Error al otorgar acceso a la contraparte')
    }
  }
  
  /**
   * Get all users who have access to view a specific organization as contraparte
   */
  static async getContraparteViewers(organizacionId: string): Promise<ContraparteViewer[]> {
    try {
      const permissionsQuery = query(
        collection(db, 'contrapartePermissions'),
        where('organizacionId', '==', organizacionId),
        where('activa', '==', true)
      )
      
      const permissionsSnapshot = await getDocs(permissionsQuery)
      const viewers: ContraparteViewer[] = []
      
      for (const permissionDoc of permissionsSnapshot.docs) {
        const permission = { id: permissionDoc.id, ...permissionDoc.data() } as ContrapartePermission
        
        // Get user details
        const userDoc = await getDoc(doc(db, 'usuarios', permission.userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          viewers.push({
            userId: permission.userId,
            userName: `${userData.nombre} ${userData.apellido}`,
            email: userData.email,
            permissions: permission.permissions,
            grantedAt: permission.grantedAt
          })
        }
      }
      
      return viewers
    } catch (error) {
      console.error('Error getting contraparte viewers:', error)
      throw new Error('Error al obtener visualizadores de la contraparte')
    }
  }
}
