import { db } from '../firebase'
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'

// Script de diagnóstico para verificar la conexión con Firebase
export const diagnosticarFirebase = async () => {
  console.log('🔍 Iniciando diagnóstico de Firebase...\n')

  // 1. Verificar variables de entorno
  console.log('📋 Verificando variables de entorno:')
  const envVars = {
    'VITE_API_KEY': import.meta.env.VITE_API_KEY,
    'VITE_AUTH_DOMAIN': import.meta.env.VITE_AUTH_DOMAIN,
    'VITE_PROJECT_ID': import.meta.env.VITE_PROJECT_ID,
    'VITE_STORAGE_BUCKET': import.meta.env.VITE_STORAGE_BUCKET,
    'VITE_MESSAGING_SENDER_ID': import.meta.env.VITE_MESSAGING_SENDER_ID,
    'VITE_APP_ID': import.meta.env.VITE_APP_ID,
    'VITE_MEASUREMENT_ID': import.meta.env.VITE_MEASUREMENT_ID
  }

  let missingVars = []
  for (const [key, value] of Object.entries(envVars)) {
    if (!value || value === 'undefined') {
      console.log(`   ❌ ${key}: NO CONFIGURADA`)
      missingVars.push(key)
    } else {
      console.log(`   ✅ ${key}: ${value.substring(0, 10)}...`)
    }
  }

  if (missingVars.length > 0) {
    console.log(`\n❌ PROBLEMA ENCONTRADO: Faltan ${missingVars.length} variables de entorno`)
    console.log('📝 Variables faltantes:', missingVars.join(', '))
    console.log('\n📖 SOLUCIÓN:')
    console.log('1. Crea un archivo .env en la raíz del proyecto')
    console.log('2. Agrega las variables de Firebase (usa .env.example como referencia)')
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
        message: 'Test de conexión exitoso'
      })
      console.log(`   ✅ Escritura exitosa. ID del documento: ${testDoc.id}`)
    } catch (writeError) {
      console.log(`   ❌ Error de escritura:`, writeError)
      console.log('\n📖 POSIBLES CAUSAS:')
      console.log('- Reglas de seguridad de Firestore muy restrictivas')
      console.log('- Usuario no autenticado (si las reglas lo requieren)')
      console.log('- Permisos insuficientes en el proyecto Firebase')
      return false
    }

  } catch (connectionError) {
    console.log(`   ❌ Error de conexión:`, connectionError)
    console.log('\n📖 POSIBLES CAUSAS:')
    console.log('- Configuración incorrecta de Firebase')
    console.log('- Proyecto Firebase no existe o no es accesible')
    console.log('- Problemas de red o firewall')
    return false
  }

  console.log('\n🎉 ¡Diagnóstico completado exitosamente!')
  console.log('✅ Firebase está configurado correctamente y listo para usar')
  return true
}

// Función para limpiar documentos de test
export const limpiarTest = async () => {
  try {
    const testCollection = collection(db, 'test-connection')
    const snapshot = await getDocs(testCollection)
      for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref)
    }
    
    console.log(`🧹 Limpieza completada: ${snapshot.size} documentos de test eliminados`)
  } catch (error) {
    console.log('❌ Error durante la limpieza:', error)
  }
}

// Ejecutar diagnóstico si se llama directamente
if (typeof window === 'undefined') {
  diagnosticarFirebase()
    .then(success => {
      if (success) {
        console.log('\n🚀 Puedes proceder a poblar la base de datos')
        // Opcional: limpiar documentos de test
        return limpiarTest()
      }
    })
    .catch(error => {
      console.error('💥 Error durante el diagnóstico:', error)
      process.exit(1)
    })
}
