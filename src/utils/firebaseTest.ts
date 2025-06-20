// Simple Firebase connection test
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "AIzaSyDAg1XbyB55RDNEQGkYDnot7epo94tadhA",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "pullmai-e0bb0.firebaseapp.com",
  projectId: import.meta.env.VITE_PROJECT_ID || "pullmai-e0bb0",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "pullmai-e0bb0.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "14877592509",
  appId: import.meta.env.VITE_APP_ID || "1:14877592509:web:5ad44fb6413d0e5f9ae0d4",
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
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
