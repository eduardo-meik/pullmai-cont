import React, { useState } from 'react'
import { 
  DocumentTextIcon, 
  TableCellsIcon,
  ChartBarIcon,
  CalendarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import ContractTable from './ContractTable'
import ContractGantt from './ContractGantt'
import ContractCalendar from './ContractCalendar'
import ContractForm from './ContractForm'
import { motion } from 'framer-motion'
import usePermissions from '../../hooks/usePermissions'

type ViewType = 'table' | 'gantt' | 'calendar'

const ContractModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('table')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { canCreateContract, userOrganizationId, isLoggedIn } = usePermissions()

  const views = [
    {
      id: 'table' as ViewType,
      name: 'Tabla',
      icon: TableCellsIcon,
      description: 'Vista en tabla con filtros'
    },
    {
      id: 'gantt' as ViewType,
      name: 'Gantt',
      icon: ChartBarIcon,
      description: 'Línea de tiempo de contratos'
    },
    {
      id: 'calendar' as ViewType,
      name: 'Calendario',
      icon: CalendarIcon,
      description: 'Vista de calendario'
    }
  ]

  const renderView = () => {
    switch (currentView) {
      case 'table':
        return <ContractTable />
      case 'gantt':
        return <ContractGantt />
      case 'calendar':
        return <ContractCalendar />
      default:
        return <ContractTable />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
          <p className="text-gray-600 mt-2">
            Administra todos los contratos de la organización
          </p>
        </div>        {isLoggedIn && userOrganizationId && canCreateContract(userOrganizationId) && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Contrato</span>
          </button>
        )}
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex space-x-1">
          {views.map((view) => {
            const Icon = view.icon
            return (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${
                  currentView === view.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{view.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Current View */}
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-96"
      >
        {renderView()}
      </motion.div>

      {/* Contract Creation Modal */}
      {showCreateForm && (
        <ContractForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            // Refresh data logic would go here
          }}
        />
      )}
    </div>
  )
}

export default ContractModule
