import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3ztV7FhKaLT6bFexZP0s72z_YGe9W5aY",
  authDomain: "pullmai-8a5a9.firebaseapp.com",
  projectId: "pullmai-8a5a9",
  storageBucket: "pullmai-8a5a9.appspot.com",
  messagingSenderId: "664875001625",
  appId: "1:664875001625:web:3739066d74e6e8c71e5aaf",
  measurementId: "G-22B44K50EP"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Migrates all documents from 'users' collection to 'usuarios' collection
 */
async function migrateUsersToUsuarios() {
  console.log('🔄 Iniciando migración de users a usuarios...')
  
  try {
    // 1. Get all documents from 'users' collection
    console.log('📥 Obteniendo documentos de la colección users...')
    const usersSnapshot = await getDocs(collection(db, 'users'))
    
    if (usersSnapshot.empty) {
      console.log('✅ No hay documentos en la colección users para migrar.')
      return
    }
    
    console.log(`📊 Encontrados ${usersSnapshot.size} documentos en users`)
    
    // 2. Check if 'usuarios' collection already has documents
    console.log('🔍 Verificando colección usuarios existente...')
    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'))
    const existingUsuarios = new Set()
    
    usuariosSnapshot.forEach(doc => {
      existingUsuarios.add(doc.id)
    })
    
    console.log(`📋 Encontrados ${usuariosSnapshot.size} documentos existentes en usuarios`)
    
    // 3. Migrate documents in batches
    const batch = writeBatch(db)
    let migratedCount = 0
    let skippedCount = 0
    
    console.log('🚀 Iniciando migración...')
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const userData = userDoc.data()
      
      // Skip if already exists in usuarios
      if (existingUsuarios.has(userId)) {
        console.log(`⏭️  Saltando ${userId} - ya existe en usuarios`)
        skippedCount++
        continue
      }
      
      // Add to usuarios collection
      const usuarioRef = doc(db, 'usuarios', userId)
      batch.set(usuarioRef, {
        ...userData,
        // Ensure required fields are present
        fechaCreacion: userData.fechaCreacion || new Date(),
        ultimoAcceso: userData.ultimoAcceso || new Date(),
        permisos: userData.permisos || [],
        asignaciones: userData.asignaciones || [],
        contraparteAccess: userData.contraparteAccess || []
      })
      
      migratedCount++
      console.log(`✅ Preparando migración: ${userId}`)
    }
    
    // Commit the batch
    if (migratedCount > 0) {
      console.log(`💾 Guardando ${migratedCount} documentos en usuarios...`)
      await batch.commit()
      console.log('✅ Migración completada exitosamente!')
    }
    
    // 4. Summary
    console.log('\n📊 RESUMEN DE MIGRACIÓN:')
    console.log(`  • Documentos migrados: ${migratedCount}`)
    console.log(`  • Documentos saltados (ya existían): ${skippedCount}`)
    console.log(`  • Total procesados: ${usersSnapshot.size}`)
    
    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANTE:')
      console.log('1. Verifica los datos en la consola de Firebase')
      console.log('2. Ejecuta las pruebas de la aplicación')
      console.log('3. Una vez confirmado, ejecuta deleteUsersCollection() para eliminar la colección users')
    }
    
    return {
      migrated: migratedCount,
      skipped: skippedCount,
      total: usersSnapshot.size
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  }
}

/**
 * Deletes all documents from the 'users' collection
 * ONLY run this after confirming the migration was successful
 */
async function deleteUsersCollection() {
  console.log('🗑️  Iniciando eliminación de la colección users...')
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    
    if (usersSnapshot.empty) {
      console.log('✅ La colección users ya está vacía.')
      return
    }
    
    console.log(`🗂️  Encontrados ${usersSnapshot.size} documentos para eliminar`)
    
    // Delete in batches
    const batch = writeBatch(db)
    let deleteCount = 0
    
    for (const userDoc of usersSnapshot.docs) {
      batch.delete(doc(db, 'users', userDoc.id))
      deleteCount++
      console.log(`🗑️  Preparando eliminación: ${userDoc.id}`)
    }
    
    if (deleteCount > 0) {
      console.log(`💥 Eliminando ${deleteCount} documentos...`)
      await batch.commit()
      console.log('✅ Colección users eliminada exitosamente!')
    }
    
    return deleteCount
    
  } catch (error) {
    console.error('❌ Error eliminando la colección users:', error)
    throw error
  }
}

/**
 * Validates that the migration was successful
 */
async function validateMigration() {
  console.log('🔍 Validando migración...')
  
  try {
    const [usersSnapshot, usuariosSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'usuarios'))
    ])
    
    console.log('\n📊 ESTADO ACTUAL:')
    console.log(`  • Documentos en users: ${usersSnapshot.size}`)
    console.log(`  • Documentos en usuarios: ${usuariosSnapshot.size}`)
    
    // Check for any users not in usuarios
    const usersIds = new Set(usersSnapshot.docs.map(doc => doc.id))
    const usuariosIds = new Set(usuariosSnapshot.docs.map(doc => doc.id))
    
    const missingInUsuarios = [...usersIds].filter(id => !usuariosIds.has(id))
    
    if (missingInUsuarios.length > 0) {
      console.log('\n⚠️  USUARIOS FALTANTES EN USUARIOS:')
      missingInUsuarios.forEach(id => console.log(`  • ${id}`))
    } else {
      console.log('\n✅ Todos los usuarios de users están presentes en usuarios')
    }
    
    return {
      usersCount: usersSnapshot.size,
      usuariosCount: usuariosSnapshot.size,
      missingInUsuarios: missingInUsuarios.length
    }
    
  } catch (error) {
    console.error('❌ Error validando la migración:', error)
    throw error
  }
}

// Export functions for manual execution
export { migrateUsersToUsuarios, deleteUsersCollection, validateMigration }

// Auto-run migration if script is executed directly
if (typeof window === 'undefined') {
  // Running in Node.js environment
  migrateUsersToUsuarios()
    .then(result => {
      console.log('\n🎉 Migración completada!')
      console.log('👉 Siguiente paso: Verifica los datos en Firebase Console')
      console.log('👉 Luego ejecuta: deleteUsersCollection()')
    })
    .catch(error => {
      console.error('💥 Error en la migración:', error)
      process.exit(1)
    })
}
