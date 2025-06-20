import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

// Use the same config as the main app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_PROJECT_ID || "pullmai-e0bb0",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_APP_ID || "your-app-id"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const testContracts = [
  {
    titulo: "Contrato de Servicios de Desarrollo",
    descripcion: "Desarrollo de aplicación web y móvil",
    contraparte: "TechCorp Solutions",
    fechaInicio: new Date("2024-01-15"),
    fechaTermino: new Date("2024-12-15"),
    monto: 75000,
    moneda: "CLP",
    categoria: "servicios",
    periodicidad: "mensual",
    tipo: "egreso",
    proyecto: "Proyecto App Móvil",
    proyectoId: "proj_001",
    estado: "activo",
    fechaCreacion: new Date(),
    organizacionId: "org_001",
    departamento: "IT",
    responsableId: "user_001",
    version: 1,
    etiquetas: ["tecnologia", "desarrollo"],
    metadatos: {},
    auditoria: [],
    pdfUrl: "https://example.com/contract1.pdf"
  },
  {
    titulo: "Contrato de Consultoría Marketing",
    descripcion: "Estrategia de marketing digital y branding",
    contraparte: "Marketing Masters",
    fechaInicio: new Date("2024-02-01"),
    fechaTermino: new Date("2024-08-31"),
    monto: 45000,
    moneda: "CLP",
    categoria: "consultoria",
    periodicidad: "trimestral",
    tipo: "egreso",
    proyecto: "Campaña Digital 2024",
    proyectoId: "proj_002",
    estado: "activo",
    fechaCreacion: new Date(),
    organizacionId: "org_001",
    departamento: "Marketing",
    responsableId: "user_002",
    version: 1,
    etiquetas: ["marketing", "consultoria"],
    metadatos: {},
    auditoria: [],
    pdfUrl: "https://example.com/contract2.pdf"
  },
  {
    titulo: "Contrato de Venta Licencias Software",
    descripcion: "Venta de licencias de software empresarial",
    contraparte: "Enterprise Corp",
    fechaInicio: new Date("2024-03-01"),
    fechaTermino: new Date("2025-02-28"),
    monto: 120000,
    moneda: "CLP",
    categoria: "ventas",
    periodicidad: "anual",
    tipo: "ingreso",
    proyecto: "Ventas Software 2024",
    proyectoId: "proj_003",
    estado: "activo",
    fechaCreacion: new Date(),
    organizacionId: "org_001",
    departamento: "Ventas",
    responsableId: "user_003",
    version: 1,
    etiquetas: ["software", "licencias"],
    metadatos: {},
    auditoria: [],
    pdfUrl: "https://example.com/contract3.pdf"
  }
]

export async function populateTestContracts() {
  try {
    console.log("Adding test contracts to Firebase...")
    
    for (let i = 0; i < testContracts.length; i++) {
      const contract = testContracts[i]
      const docRef = await addDoc(collection(db, 'contratos'), contract)
      console.log(`Contract ${i + 1} added with ID:`, docRef.id)
    }
    
    console.log("✅ All test contracts added successfully!")
    return true
  } catch (error) {
    console.error("❌ Error adding test contracts:", error)
    return false
  }
}

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  console.log("Contract population script loaded. Call populateTestContracts() to add test data.")
}
