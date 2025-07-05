import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Service to handle default organization management
 */
export class DefaultOrganizationService {
  
  /**
   * Gets the correct organization ID for MEIK LABS
   * This ensures we use the proper document ID instead of the name
   */
  static async getMeikLabsOrganizationId(): Promise<string> {
    try {
      const orgsQuery = query(
        collection(db, 'organizaciones'), 
        where('nombre', '==', 'MEIK LABS')
      )
      const orgsSnapshot = await getDocs(orgsQuery)
      
      if (!orgsSnapshot.empty) {
        const orgDoc = orgsSnapshot.docs[0]
        console.log('✅ Found MEIK LABS organization:', orgDoc.id)
        return orgDoc.id
      } else {
        console.warn('⚠️ MEIK LABS organization not found, using default ID')
        // The organization ID is actually "MEIK LABS" as discovered
        return 'MEIK LABS'
      }
    } catch (error) {
      console.error('❌ Error getting MEIK LABS organization ID:', error)
      // Fallback to the actual known ID
      return 'MEIK LABS'
    }
  }

  /**
   * Gets the default organization for new users
   */
  static async getDefaultOrganizationId(): Promise<string> {
    return this.getMeikLabsOrganizationId()
  }
}
