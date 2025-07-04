import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
}

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration error: Missing required environment variables!')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testProjectQuery() {
  try {
    console.log('🔍 Testing projects query by organization...')
    
    // This is the query that was failing
    const proyectosRef = collection(db, 'proyectos')
    const q = query(
      proyectosRef,
      where('organizacionId', '==', 'MEIK LABS'), // Use a test organization ID
      orderBy('fechaCreacion', 'desc')
    )
    
    const snapshot = await getDocs(q)
    console.log(`✅ Query successful! Found ${snapshot.size} projects`)
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log(`- Project: ${data.nombre || 'No name'} (${doc.id})`)
    })
    
  } catch (error) {
    console.error('❌ Query failed:', error)
    if (error.code === 'failed-precondition') {
      console.log('This error indicates the index is still being built or missing.')
    }
  }
}

testProjectQuery()
