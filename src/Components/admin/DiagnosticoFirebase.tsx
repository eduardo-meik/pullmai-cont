import React, { useState } from 'react'
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Button from '../ui/Button'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DiagnosticResult {
  step: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string[]
}

const DiagnosticoFirebase: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result])
  }

  const diagnosticar = async () => {
    setIsRunning(true)
    setResults([])

    try {
      // 1. Verificar variables de entorno
      addResult({ step: 'Variables de Entorno', status: 'success', message: 'Iniciando verificación...' })
      
      const envVars = {
        'VITE_API_KEY': import.meta.env.VITE_API_KEY,
        'VITE_AUTH_DOMAIN': import.meta.env.VITE_AUTH_DOMAIN,
        'VITE_PROJECT_ID': import.meta.env.VITE_PROJECT_ID,
        'VITE_STORAGE_BUCKET': import.meta.env.VITE_STORAGE_BUCKET,
        'VITE_MESSAGING_SENDER_ID': import.meta.env.VITE_MESSAGING_SENDER_ID,
        'VITE_APP_ID': import.meta.env.VITE_APP_ID,
        'VITE_MEASUREMENT_ID': import.meta.env.VITE_MEASUREMENT_ID
      }

      const missingVars = []
      const configuredVars = []
      
      for (const [key, value] of Object.entries(envVars)) {
        if (!value || value === 'undefined') {
          missingVars.push(key)
        } else {
          configuredVars.push(`${key}: ${value.substring(0, 10)}...`)
        }
      }

      if (missingVars.length > 0) {
        addResult({
          step: 'Variables de Entorno',
          status: 'error',
          message: `Faltan ${missingVars.length} variables de entorno`,
          details: [
            `Variables faltantes: ${missingVars.join(', ')}`,
            'Solución: Crear archivo .env con la configuración de Firebase',
            'Obtener valores desde: https://console.firebase.google.com'
          ]
        })
        setIsRunning(false)
        return
      }

      addResult({
        step: 'Variables de Entorno',
        status: 'success',
        message: 'Todas las variables están configuradas',
        details: configuredVars
      })

      // 2. Verificar conexión con Firestore
      addResult({ step: 'Conexión Firestore', status: 'success', message: 'Verificando conexión...' })
      
      try {
        const testCollection = collection(db, 'test-connection')
        const snapshot = await getDocs(testCollection)
        
        addResult({
          step: 'Conexión Firestore',
          status: 'success',
          message: `Conexión exitosa. Documentos existentes: ${snapshot.size}`
        })

        // 3. Verificar permisos de escritura
        addResult({ step: 'Permisos de Escritura', status: 'success', message: 'Verificando permisos...' })
        
        try {
          const testDoc = await addDoc(collection(db, 'test-connection'), {
            timestamp: new Date(),
            test: true,
            message: 'Test de conexión exitoso desde React'
          })

          addResult({
            step: 'Permisos de Escritura',
            status: 'success',
            message: `Escritura exitosa. ID: ${testDoc.id.substring(0, 8)}...`
          })

          // Limpiar documento de test
          await deleteDoc(testDoc)

        } catch (writeError: any) {
          addResult({
            step: 'Permisos de Escritura',
            status: 'error',
            message: 'Error de escritura en Firestore',
            details: [
              `Error: ${writeError.message}`,
              'Posibles causas:',
              '- Reglas de seguridad muy restrictivas',
              '- Usuario no autenticado',
              '- Permisos insuficientes en Firebase'
            ]
          })
          setIsRunning(false)
          return
        }

      } catch (connectionError: any) {
        addResult({
          step: 'Conexión Firestore',
          status: 'error',
          message: 'Error de conexión con Firestore',
          details: [
            `Error: ${connectionError.message}`,
            'Posibles causas:',
            '- Configuración incorrecta de Firebase',
            '- Proyecto no existe o no es accesible',
            '- Problemas de red'
          ]
        })
        setIsRunning(false)
        return
      }

      // Si llegamos aquí, todo está bien
      addResult({
        step: 'Diagnóstico Completo',
        status: 'success',
        message: '🎉 Firebase está configurado correctamente y listo para usar'
      })

    } catch (error: any) {
      addResult({
        step: 'Error General',
        status: 'error',
        message: `Error inesperado: ${error.message}`
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Diagnóstico de Firebase
        </h2>
        <p className="text-gray-600">
          Verifica que Firebase esté configurado correctamente antes de poblar la base de datos.
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={diagnosticar}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? 'Ejecutando Diagnóstico...' : 'Ejecutar Diagnóstico'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Resultados del Diagnóstico:</h3>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{result.step}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{result.message}</p>
                  
                  {result.details && (
                    <div className="mt-2">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {result.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isRunning && results.length > 0 && results[results.length - 1]?.status === 'success' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-800">¡Listo para poblar la base de datos!</span>
          </div>
          <p className="mt-2 text-sm text-green-700">
            Firebase está configurado correctamente. Ahora puedes usar el componente "Poblar Base de Datos" 
            para agregar contratos de ejemplo.
          </p>
        </div>
      )}
    </div>
  )
}

export default DiagnosticoFirebase
