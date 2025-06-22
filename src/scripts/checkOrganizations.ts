import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Organizacion, ConfiguracionOrg, TipoContrato } from '../types'

/**
 * Script to check and create organizations
 */
export async function checkAndCreateOrganizations() {
  try {
    console.log('Checking existing organizations...')
    
    // Get all organizations
    const orgsSnapshot = await getDocs(collection(db, 'organizaciones'))
    const existingOrgs: Organizacion[] = []
    
    orgsSnapshot.forEach((doc) => {
      existingOrgs.push({ id: doc.id, ...doc.data() } as Organizacion)
    })
    
    console.log('Existing organizations:', existingOrgs)
    
    // Check if MEIK LABS exists
    const meikLabsExists = existingOrgs.some(org => org.id === 'MEIK LABS')
    
    if (!meikLabsExists) {
      console.log('MEIK LABS organization not found. Creating it...')
      
      const meikLabsOrg: Organizacion = {
        id: 'MEIK LABS',
        nombre: 'MEIK LABS',
        descripcion: 'Organización principal para gestión de contratos',
        activa: true,
        fechaCreacion: new Date(),        configuracion: {
          tiposContratoPermitidos: [
            TipoContrato.SERVICIO,
            TipoContrato.COMPRA,
            TipoContrato.VENTA,
            TipoContrato.CONFIDENCIALIDAD,
            TipoContrato.LABORAL,
            TipoContrato.ARRENDAMIENTO,
            TipoContrato.OTRO
          ],
          flujoAprobacion: true,
          notificacionesEmail: true,
          retencionDocumentos: 365,
          plantillasPersonalizadas: true
        }
      }
      
      await setDoc(doc(db, 'organizaciones', 'MEIK LABS'), meikLabsOrg)
      console.log('MEIK LABS organization created successfully!')
    } else {
      console.log('MEIK LABS organization already exists')
    }
    
  } catch (error) {
    console.error('Error checking/creating organizations:', error)
  }
}

// Run the function if this script is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  checkAndCreateOrganizations()
}
