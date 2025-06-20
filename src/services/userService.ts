import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Usuario } from '../types'

export class UserService {
  /**
   * Gets user profile data from Firestore based on Firebase Auth UID
   */
  static async getUserProfile(uid: string): Promise<Usuario | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
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
   * Updates user profile data in Firestore
   */
  static async updateUserProfile(uid: string, userData: Partial<Usuario>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          ...userData,
          ultimoAcceso: new Date()
        })
      } else {
        await setDoc(userRef, {
          id: uid,
          ...userData,
          fechaCreacion: new Date(),
          ultimoAcceso: new Date(),
          permisos: userData.permisos || [],
          asignaciones: userData.asignaciones || []
        })
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Gets organization ID for the current user
   */
  static async getUserOrganizationId(uid: string): Promise<string> {
    try {
      const userProfile = await this.getUserProfile(uid)
      return userProfile?.organizacionId || 'MEIK LABS' // Updated fallback
    } catch (error) {
      console.error('Error getting user organization:', error)
      return 'MEIK LABS' // Updated fallback
    }
  }

  /**
   * Gets default organization ID
   */
  static getDefaultOrganizationId(): string {
    return 'MEIK LABS'
  }
}

export default UserService
