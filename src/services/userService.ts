import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Usuario } from '../types'

export class UserService {
  /**
   * Gets user profile data from Firestore based on Firebase Auth UID
   */
  static async getUserProfile(uid: string): Promise<Usuario | null> {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid))
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as Usuario
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Gets organization ID for the current user
   * TODO: This should be integrated with the auth context
   */
  static async getUserOrganizationId(uid: string): Promise<string> {
    try {
      const userProfile = await this.getUserProfile(uid)
      return userProfile?.organizacionId || 'org-001' // Fallback to default org
    } catch (error) {
      console.error('Error getting user organization:', error)
      return 'org-001' // Fallback to default org
    }
  }

  /**
   * Gets default organization ID - temporary solution
   * TODO: Replace with actual user organization lookup
   */
  static getDefaultOrganizationId(): string {
    return 'org-001'
  }
}

export default UserService
