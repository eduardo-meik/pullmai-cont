import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Organizacion } from '../types'

export class OrganizacionService {
  /**
   * Obtiene los datos de una organización por su ID
   */  static async getOrganizacionById(organizacionId: string): Promise<Organizacion | null> {
    try {
      console.log('DEBUG: Attempting to fetch organization from Firestore:', organizacionId)
      const orgDoc = await getDoc(doc(db, 'organizaciones', organizacionId))
      
      console.log('DEBUG: Organization document exists:', orgDoc.exists())
      if (orgDoc.exists()) {
        const orgData = { id: orgDoc.id, ...orgDoc.data() } as Organizacion
        console.log('DEBUG: Organization data:', orgData)
        return orgData
      }
      
      console.log('DEBUG: Organization not found in Firestore')
      return null
    } catch (error) {
      console.error('Error fetching organization:', error)
      throw new Error('Error al obtener información de la organización')
    }
  }
}
