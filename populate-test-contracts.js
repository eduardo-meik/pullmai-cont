// Script to test Firebase connection and populate test contracts
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

// Firebase config (you'll need to replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Test contracts data
const testContracts = [
  {
    titulo: "Contrato de Servicios IT",
    descripcion: "Servicios de desarrollo y mantenimiento de sistemas",
    contraparte: "TechCorp Solutions",
    fechaInicio: new Date("2024-01-15"),
    fechaTermino: new Date("2024-12-15"),
    monto: 50000,
    moneda: "USD",
    categoria: "servicios",
    periodicidad: "mensual",
    tipo: "egreso",
    proyecto: "Sistema CRM",
    proyectoId: "proj_001",
    estado: "activo",
    fechaCreacion: new Date(),
    organizacionId: "org_001",
    departamento: "IT",
    responsableId: "user_001",
    version: 1,
    etiquetas: ["tecnologia", "desarrollo"],
    metadatos: {},
    auditoria: []
  },
  {
    titulo: "Contrato de Consultoría Legal",
    descripcion: "Asesoría legal para contratos y compliance",
    contraparte: "Bufete Jurídico Asociados",
    fechaInicio: new Date("2024-02-01"),
    fechaTermino: new Date("2024-07-31"),
    monto: 25000,
    moneda: "USD",
    categoria: "consultoria",
    periodicidad: "trimestral",
    tipo: "egreso",
    proyecto: "Compliance Legal",
    proyectoId: "proj_002",
    estado: "activo",
    fechaCreacion: new Date(),
    organizacionId: "org_001",
    departamento: "Legal",
    responsableId: "user_002",
    version: 1,
    etiquetas: ["legal", "consultoria"],
    metadatos: {},
    auditoria: []
  },
  {
    titulo: "Contrato de Venta Software",
    descripción: "Licencia de software para cliente corporativo",
    contraparte: "MegaCorp Industries",
    fechaInicio: new Date("2024-03-01"),
    fechaTermino: new Date("2025-02-28"),
    monto: 75000,
    moneda: "USD",
    categoria: "ventas",
    periodicidad: "anual",
    tipo: "ingreso",
    proyecto: "Ventas Q1",
    proyectoId: "proj_003",
    estado: "activo",
    fechaCreacion: new Date(),
    organizacionId: "org_001",
    departamento: "Ventas",
    responsableId: "user_003",
    version: 1,
    etiquetas: ["venta", "software"],
    metadatos: {},
    auditoria: []
  }
]

async function populateTestData() {
  try {
    console.log("Attempting to sign in anonymously...")
    await signInAnonymously(auth)
    console.log("Successfully signed in!")

    console.log("Adding test contracts...")
    
    for (const contract of testContracts) {
      const docRef = await addDoc(collection(db, 'contratos'), contract)
      console.log("Contract added with ID: ", docRef.id)
    }
    
    console.log("Test data populated successfully!")
    
  } catch (error) {
    console.error("Error populating test data:", error)
  }
}

// Run the population script
populateTestData()
