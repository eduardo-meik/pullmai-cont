import React from 'react'
import DashboardStats from './dashboard/DashboardStats'
import ContractList from './contracts/ContractList'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general de la gestión de contratos
        </p>
      </div>

      {/* Estadísticas */}
      <DashboardStats />

      {/* Lista de contratos recientes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Contratos Recientes
        </h2>
        <ContractList />
      </div>
    </div>
  )
}
