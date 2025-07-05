import React, { useState } from 'react'
import DashboardStats from './dashboard/DashboardStats';
import DashboardVerification from './dashboard/DashboardVerification';
import ContractTable from './contracts/ContractTable'
import FirebaseTestComponent from './FirebaseTestComponent'
import { checkAndCreateOrganizations } from '../scripts/checkOrganizations'

export default function Dashboard() {
  const [showVerification, setShowVerification] = useState(false)

  const handleCreateOrg = async () => {
    await checkAndCreateOrganizations()
    // Refresh the page to reload organization data
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Resumen general de la gestión de contratos
          </p>
        </div>
        <button
          onClick={() => setShowVerification(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Verificar Datos
        </button>
      </div>

      {/* Temporary Organization Setup Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-700">
              Si no ves el nombre de tu organización en la barra de navegación, haz clic aquí para configurar las organizaciones.
            </p>
          </div>
          <div className="ml-3">
            <button
              onClick={handleCreateOrg}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium"
            >
              Configurar Organizaciones
            </button>
          </div>
        </div>
      </div>

      {/* Firebase Connection Test */}
      <FirebaseTestComponent />

      {/* Estadísticas */}
      <DashboardStats />

      {/* Lista de contratos recientes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Contratos Recientes
        </h2>
        <ContractTable />
      </div>

      {/* Dashboard Verification Modal */}
      {showVerification && (
        <DashboardVerification onClose={() => setShowVerification(false)} />
      )}
    </div>
  )
}
