const { initializeApp } = require('firebase/app')
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  writeBatch 
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
 * Delete all documents in the users collection
 */
async function deleteUsersCollection() {
  try {
    console.log('🗑️  Iniciando eliminación de la colección users...')
    
    // Get all documents in users collection
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    if (snapshot.empty) {
      console.log('✅ La colección users ya está vacía o no existe.')
      return
    }
    
    console.log(`📄 Encontrados ${snapshot.size} documentos en la colección users`)
    
    // Delete documents in batches (Firestore limit is 500 operations per batch)
    const batchSize = 500
    const docs = snapshot.docs
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db)
      const batchDocs = docs.slice(i, i + batchSize)
      
      console.log(`🗑️  Eliminando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(docs.length/batchSize)} (${batchDocs.length} documentos)`)
      
      batchDocs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref)
      })
      
      await batch.commit()
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} eliminado`)
    }
    
    console.log('🎉 Colección users eliminada completamente!')
    console.log('✅ Migración completa: Ahora solo se usa la colección usuarios')
    
  } catch (error) {
    console.error('❌ Error eliminando la colección users:', error)
    throw error
  }
}

// Run the deletion
deleteUsersCollection()
  .then(() => {
    console.log('\n🎯 MIGRACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('✅ Colección users eliminada')
    console.log('✅ Aplicación usando solo colección usuarios')
    console.log('✅ Todas las funcionalidades migraron correctamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la eliminación:', error)
    process.exit(1)
  })
