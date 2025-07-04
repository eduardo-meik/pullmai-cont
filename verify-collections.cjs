const { initializeApp } = require('firebase/app')
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  limit 
} = require('firebase/firestore')

// Firebase configuration - SECURE VERSION
// Use environment variables instead of hardcoded keys
require('dotenv').config()

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID
}

// Validate that required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing required Firebase environment variables!')
  console.error('Please ensure .env file contains VITE_API_KEY and VITE_PROJECT_ID')
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Verify the current state of user collections
 */
async function verifyCollections() {
  try {
    console.log('🔍 Verificando estado de las colecciones de usuarios...\n')
    
    // Check users collection
    console.log('📁 Colección USERS:')
    try {
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(query(usersRef, limit(5)))
      console.log(`   📊 Documentos encontrados: ${usersSnapshot.size}`)
      
      if (!usersSnapshot.empty) {
        console.log('   📄 Primeros documentos:')
        usersSnapshot.forEach(doc => {
          console.log(`      - ID: ${doc.id}`)
          console.log(`      - Data: ${JSON.stringify(doc.data(), null, 8)}`)
        })
      }
    } catch (error) {
      console.log('   ❌ Error accediendo a users:', error.message)
    }
    
    console.log('\n📁 Colección USUARIOS:')
    try {
      const usuariosRef = collection(db, 'usuarios')
      const usuariosSnapshot = await getDocs(query(usuariosRef, limit(5)))
      console.log(`   📊 Documentos encontrados: ${usuariosSnapshot.size}`)
      
      if (!usuariosSnapshot.empty) {
        console.log('   📄 Primeros documentos:')
        usuariosSnapshot.forEach(doc => {
          const data = doc.data()
          console.log(`      - ID: ${doc.id}`)
          console.log(`      - Email: ${data.email || 'N/A'}`)
          console.log(`      - Nombre: ${data.nombre || 'N/A'}`)
          console.log(`      - Organización: ${data.organizacionId || 'N/A'}`)
          console.log(`      - Rol: ${data.rol || 'N/A'}`)
          console.log(`      - Activo: ${data.activo !== undefined ? data.activo : 'N/A'}`)
          console.log('      ---')
        })
      } else {
        console.log('   ⚠️  Colección usuarios está vacía!')
      }
    } catch (error) {
      console.log('   ❌ Error accediendo a usuarios:', error.message)
    }
    
    console.log('\n🎯 RESUMEN:')
    console.log('=====================================')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Run verification
verifyCollections()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en verificación:', error)
    process.exit(1)
  })
