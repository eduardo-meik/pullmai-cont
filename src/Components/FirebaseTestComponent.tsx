import React, { useState, useEffect } from 'react'
import { testFirebaseConnection, addTestContract } from '../utils/firebaseTest'
import { useContracts } from '../hooks/useContracts'
import { Contrato } from '../types'

const FirebaseTestComponent: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false)
  const [message, setMessage] = useState('')
  const { data, isLoading, error, refetch } = useContracts()

  // Test connection on component mount
  useEffect(() => {
    handleTestConnection()
  }, [])

  const handlePopulateTestData = async () => {
    setIsPopulating(true)
    setMessage('Adding test contract...')
    
    try {
      const result = await addTestContract()
      
      if (result.success) {
        setMessage(`✅ Contract added successfully with ID: ${result.id}`)
        // Wait a moment then refresh
        setTimeout(() => {
          refetch()
        }, 1000)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
      
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPopulating(false)
    }
  }

  const handleTestConnection = async () => {
    setMessage('Testing Firebase connection...')
    try {
      const result = await testFirebaseConnection()
      
      if (result.success) {
        setMessage(`✅ Firebase connected! Found ${result.count} contracts in database.`)
      } else {
        setMessage(`❌ Connection failed: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      
      {/* Test buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={handleTestConnection}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Test Connection
        </button>
        
        <button
          onClick={handlePopulateTestData}
          disabled={isPopulating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPopulating ? 'Adding...' : 'Add Test Contract'}
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div className="mb-4 p-3 rounded bg-gray-50 border">
          {message}
        </div>
      )}

      {/* Data Display */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Contract Data:</h3>
        
        {isLoading && (
          <div className="text-blue-600">Loading contracts...</div>
        )}        {error ? (
          <div className="text-red-600 bg-red-50 p-3 rounded">
            Error: {error instanceof Error ? error.message : 'Failed to load contracts'}
          </div>
        ) : null}
        
        {data && (
          <div>
            <p className="text-green-600 font-medium">
              ✅ Successfully loaded {data.contratos.length} contracts!
            </p>
            
            {data.contratos.length > 0 && (
              <div className="mt-4 space-y-2">
                {data.contratos.map((contract: Contrato, index: number) => (
                  <div key={contract.id || index} className="border p-3 rounded bg-gray-50">
                    <div className="font-medium">{contract.titulo}</div>
                    <div className="text-sm text-gray-600">
                      {contract.contraparte} - {contract.monto?.toLocaleString()} {contract.moneda}
                    </div>
                    <div className="text-xs text-gray-500">
                      Estado: {contract.estado} | Categoría: {contract.categoria}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {data && data.contratos.length === 0 && (
          <div className="text-yellow-600">
            No contracts found. Try adding test data first.
          </div>
        )}
      </div>
      
      {/* Refresh Button */}
      <div className="mt-4">
        <button
          onClick={() => refetch()}
          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}

export default FirebaseTestComponent
