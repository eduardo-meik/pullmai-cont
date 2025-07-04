// Simple Firebase connection test
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
}

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration error: Missing required environment variables!')
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...')
    
    // Try to read from contratos collection
    const snapshot = await getDocs(collection(db, 'contratos'))
    console.log(`✅ Successfully connected! Found ${snapshot.size} contracts`)
    
    return { success: true, count: snapshot.size }
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function addTestContract() {
  try {
    const testContract = {
      titulo: "Contrato de Prueba Firebase",
      descripcion: "Contrato creado para probar la conexión a Firebase",
      contraparte: "Empresa Test",
      fechaInicio: new Date("2024-01-15"),
      fechaTermino: new Date("2024-12-15"),
      monto: 25000,
      moneda: "CLP",
      categoria: "servicios",
      periodicidad: "mensual",
      tipo: "egreso",
      proyecto: "Proyecto Test",
      proyectoId: "proj_test",
      estado: "activo",
      fechaCreacion: new Date(),
      organizacionId: "org_001",
      departamento: "IT",
      responsableId: "user_001",
      version: 1,
      etiquetas: ["test", "firebase"],
      metadatos: {},
      auditoria: [],
      pdfUrl: "https://example.com/test-contract.pdf"
    }
    
    const docRef = await addDoc(collection(db, 'contratos'), testContract)
    console.log('✅ Test contract added with ID:', docRef.id)
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('❌ Failed to add test contract:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Auto-test when this module loads (for debugging)
if (typeof window !== 'undefined') {
  testFirebaseConnection()
}
