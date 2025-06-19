// Script de diagnóstico para Node.js (sin import.meta.env)
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración de Firebase usando process.env
const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const diagnosticarFirebase = async () => {
  console.log('🔍 Iniciando diagnóstico de Firebase...\n')

  // 1. Verificar variables de entorno
  console.log('📋 Verificando variables de entorno:')
  const envVars = {
    'VITE_API_KEY': process.env.VITE_API_KEY,
    'VITE_AUTH_DOMAIN': process.env.VITE_AUTH_DOMAIN,
    'VITE_PROJECT_ID': process.env.VITE_PROJECT_ID,
    'VITE_STORAGE_BUCKET': process.env.VITE_STORAGE_BUCKET,
    'VITE_MESSAGING_SENDER_ID': process.env.VITE_MESSAGING_SENDER_ID,
    'VITE_APP_ID': process.env.VITE_APP_ID,
    'VITE_MEASUREMENT_ID': process.env.VITE_MEASUREMENT_ID
  }

  let missingVars = []
  for (const [key, value] of Object.entries(envVars)) {
    if (!value || value === 'undefined') {
      console.log(`   ❌ ${key}: NO CONFIGURADA`)
      missingVars.push(key)
    } else {
      console.log(`   ✅ ${key}: ${value.substring(0, 15)}...`)
    }
  }

  if (missingVars.length > 0) {
    console.log(`\n❌ PROBLEMA ENCONTRADO: Faltan ${missingVars.length} variables de entorno`)
    console.log('📝 Variables faltantes:', missingVars.join(', '))
    console.log('\n📖 SOLUCIÓN:')
    console.log('1. Verifica que el archivo .env existe en la raíz del proyecto')
    console.log('2. Agrega las variables de Firebase faltantes')
    console.log('3. Obtén los valores desde tu consola de Firebase: https://console.firebase.google.com')
    return false
  }

  console.log('\n✅ Todas las variables de entorno están configuradas\n')

  // 2. Verificar conexión con Firestore
  console.log('🔗 Verificando conexión con Firestore...')
  try {
    // Intentar leer una colección (aunque esté vacía)
    const testCollection = collection(db, 'test-connection')
    const snapshot = await getDocs(testCollection)
    console.log(`   ✅ Conexión exitosa con Firestore`)
    console.log(`   📊 Documentos en colección test: ${snapshot.size}`)

    // 3. Verificar permisos de escritura
    console.log('\n✍️ Verificando permisos de escritura...')
    try {
      const testDoc = await addDoc(collection(db, 'test-connection'), {
        timestamp: new Date(),
        test: true,
        message: 'Test de conexión exitoso desde Node.js',
        diagnostico: true
      })
      console.log(`   ✅ Escritura exitosa. ID del documento: ${testDoc.id}`)
      
      // Limpiar el documento de test inmediatamente
      await deleteDoc(testDoc)
      console.log(`   🧹 Documento de test eliminado`)    } catch (writeError: any) {
      console.log(`   ❌ Error de escritura:`, writeError.message)
      console.log('\n📖 POSIBLES CAUSAS:')
      console.log('- Reglas de seguridad de Firestore muy restrictivas')
      console.log('- Usuario no autenticado (si las reglas lo requieren)')
      console.log('- Permisos insuficientes en el proyecto Firebase')
      console.log('\n🔧 SOLUCIÓN SUGERIDA:')
      console.log('Ve a Firestore Database > Reglas y configura reglas de test:')
      console.log('rules_version = "2";')
      console.log('service cloud.firestore {')
      console.log('  match /databases/{database}/documents {')
      console.log('    match /{document=**} {')
      console.log('      allow read, write: if true;')
      console.log('    }')
      console.log('  }')
      console.log('}')
      return false
    }

    // 4. Verificar colección de contratos
    console.log('\n📄 Verificando colección de contratos...')
    const contractsCollection = collection(db, 'contratos')
    const contractsSnapshot = await getDocs(contractsCollection)
    console.log(`   📊 Contratos existentes: ${contractsSnapshot.size}`)
  } catch (connectionError: any) {
    console.log(`   ❌ Error de conexión:`, connectionError.message)
    console.log('\n📖 POSIBLES CAUSAS:')
    console.log('- Configuración incorrecta de Firebase')
    console.log('- Proyecto Firebase no existe o no es accesible')
    console.log('- Problemas de red o firewall')
    console.log('- Variables de entorno incorrectas')
    console.log('\n🔧 VERIFICAR:')
    console.log('1. Proyecto ID es correcto:', firebaseConfig.projectId)
    console.log('2. El proyecto existe en: https://console.firebase.google.com')
    console.log('3. Firestore Database está habilitado')
    return false
  }

  console.log('\n🎉 ¡Diagnóstico completado exitosamente!')
  console.log('✅ Firebase está configurado correctamente y listo para usar')
  console.log('\n🚀 Siguiente paso: Ejecutar población de base de datos')
  console.log('   npm run populate-db')
  return true
}

// Ejecutar diagnóstico
diagnosticarFirebase()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 Error crítico durante el diagnóstico:', error.message)
    process.exit(1)
  })
