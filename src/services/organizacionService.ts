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
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase'
import { Organizacion, ConfiguracionOrg } from '../types'

export class OrganizacionService {
  /**
   * Obtiene los datos de una organización por su ID
   */
  static async getOrganizacionById(organizacionId: string): Promise<Organizacion | null> {
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

  /**
   * Obtiene todas las organizaciones
   */
  static async getOrganizaciones(): Promise<Organizacion[]> {
    try {
      const organizacionesQuery = query(
        collection(db, 'organizaciones'),
        orderBy('nombre', 'asc')
      )
      const querySnapshot = await getDocs(organizacionesQuery)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date()
      })) as Organizacion[]
    } catch (error) {
      console.error('Error fetching organizations:', error)
      throw new Error('Error al obtener las organizaciones')
    }
  }

  /**
   * Crea una nueva organización
   */
  static async crearOrganizacion(organizacionData: Omit<Organizacion, 'id' | 'fechaCreacion'>): Promise<string> {
    try {
      const defaultConfig: ConfiguracionOrg = {
        tiposContratoPermitidos: [],
        flujoAprobacion: false,
        notificacionesEmail: true,
        retencionDocumentos: 365, // 1 año por defecto
        plantillasPersonalizadas: false
      }

      const docRef = await addDoc(collection(db, 'organizaciones'), {
        ...organizacionData,
        configuracion: organizacionData.configuracion || defaultConfig,
        fechaCreacion: Timestamp.now(),
        activa: true
      })
      
      return docRef.id
    } catch (error) {
      console.error('Error creating organization:', error)
      throw new Error('Error al crear la organización')
    }
  }

  /**
   * Actualiza una organización existente
   */
  static async actualizarOrganizacion(id: string, cambios: Partial<Organizacion>): Promise<boolean> {
    try {
      const organizacionRef = doc(db, 'organizaciones', id)
      
      // Filter out undefined values to prevent Firebase errors
      const filteredChanges = Object.fromEntries(
        Object.entries(cambios).filter(([_, value]) => value !== undefined)
      )
      
      await updateDoc(organizacionRef, filteredChanges)
      return true
    } catch (error) {
      console.error('Error updating organization:', error)
      throw new Error('Error al actualizar la organización')
    }
  }

  /**
   * Elimina una organización (marca como inactiva)
   */
  static async eliminarOrganizacion(id: string): Promise<boolean> {
    try {
      const organizacionRef = doc(db, 'organizaciones', id)
      await updateDoc(organizacionRef, { activa: false })
      return true
    } catch (error) {
      console.error('Error deleting organization:', error)
      throw new Error('Error al eliminar la organización')
    }
  }

  /**
   * Busca organizaciones por nombre
   */
  static async buscarOrganizaciones(searchTerm: string): Promise<Organizacion[]> {
    try {
      const organizaciones = await this.getOrganizaciones()
      return organizaciones.filter(org => 
        org.activa && (
          org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } catch (error) {
      console.error('Error searching organizations:', error)
      throw new Error('Error al buscar organizaciones')
    }
  }
}
