import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  Timestamp,
  writeBatch 
} from 'firebase/firestore'
import { db } from '../firebase'
import { Organizacion, ConfiguracionOrg, TipoContrato } from '../types'

/**
 * Service for automatically creating contraparte organizations
 */
export class ContraparteAutoCreationService {
  
  /**
   * Check if a contraparte organization already exists by name
   */
  static async findContraparteByName(nombre: string): Promise<Organizacion | null> {
    try {
      const organizacionesRef = collection(db, 'organizaciones')
      const q = query(organizacionesRef, where('nombre', '==', nombre.trim()))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data(),
          fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date()
        } as Organizacion
      }
      
      return null
    } catch (error) {
      console.error('Error searching for contraparte by name:', error)
      return null
    }
  }
  
  /**
   * Create a new contraparte organization automatically
   */
  static async createContraparteOrganization(
    nombre: string, 
    createdByUserId: string
  ): Promise<string> {
    try {
      // Check if organization already exists
      const existingOrg = await this.findContraparteByName(nombre)
      if (existingOrg) {
        console.log(`Organization '${nombre}' already exists with ID: ${existingOrg.id}`)
        return existingOrg.id
      }
      
      // Create default configuration for contraparte organization
      const defaultConfig: ConfiguracionOrg = {
        tiposContratoPermitidos: [
          TipoContrato.SERVICIO,
          TipoContrato.COMPRA,
          TipoContrato.VENTA,
          TipoContrato.CONSULTORIA
        ],
        flujoAprobacion: false,
        notificacionesEmail: false,
        retencionDocumentos: 365, // 1 year default
        plantillasPersonalizadas: false
      }
      
      // Create new organization data
      const organizacionData: Omit<Organizacion, 'id'> = {
        nombre: nombre.trim(),
        descripcion: `Organización contraparte creada automáticamente para ${nombre}`,
        configuracion: defaultConfig,
        fechaCreacion: new Date(),
        activa: true,
        // Optional branding config - can be customized later
        branding: {
          primaryColor: '#2563eb', // Default blue
          secondaryColor: '#64748b', // Default gray
          navBackgroundColor: '#ffffff',
          navTextColor: '#1f2937'
        }
      }
      
      // Create the organization document
      const organizacionesRef = collection(db, 'organizaciones')
      const docRef = await addDoc(organizacionesRef, {
        ...organizacionData,
        fechaCreacion: Timestamp.fromDate(organizacionData.fechaCreacion)
      })
      
      console.log(`Created new contraparte organization '${nombre}' with ID: ${docRef.id}`)
      return docRef.id
      
    } catch (error) {
      console.error('Error creating contraparte organization:', error)
      throw new Error(`Error al crear la organización contraparte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }
  
  /**
   * Get or create a contraparte organization
   * Returns the organization ID for linking to contracts
   */
  static async getOrCreateContraparte(
    contraparteNombre: string,
    createdByUserId: string
  ): Promise<string> {
    try {
      if (!contraparteNombre || contraparteNombre.trim() === '') {
        throw new Error('El nombre de la contraparte es requerido')
      }
      
      // First, try to find existing organization
      const existingOrg = await this.findContraparteByName(contraparteNombre)
      if (existingOrg) {
        return existingOrg.id
      }
      
      // If not found, create new one
      return await this.createContraparteOrganization(contraparteNombre, createdByUserId)
      
    } catch (error) {
      console.error('Error in getOrCreateContraparte:', error)
      throw error
    }
  }
  
  /**
   * Link a contraparte organization to a user's accessible contrapartes
   * This allows the user to see this contraparte in their lists
   */
  static async linkContraparteToUser(
    userId: string,
    contraparteId: string,
    accessLevel: 'read' | 'write' = 'read'
  ): Promise<void> {
    try {
      // This could be extended to create user-contraparte relationship records
      // For now, we'll rely on the contract relationship to show contrapartes
      console.log(`Linking contraparte ${contraparteId} to user ${userId} with ${accessLevel} access`)
      
      // Future enhancement: Create user-contraparte access records
      // for more granular permission management
      
    } catch (error) {
      console.error('Error linking contraparte to user:', error)
      // Don't throw error here - contract creation should not fail if linking fails
    }
  }
}
