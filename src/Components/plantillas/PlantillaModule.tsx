import React, { useState } from 'react'
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types'

type ViewMode = 'table' | 'cards'

interface PlantillaContrato {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  fechaCreacion: Date
  creadoPor: string
  activa: boolean
  usos: number
}

const PlantillaModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()

  // Mock data for now - in real implementation, fetch from service
  const plantillas: PlantillaContrato[] = []
  const isLoading = false
  const error = null

  const canManagePlantillas = usuario?.rol === UserRole.ORG_ADMIN || usuario?.rol === UserRole.SUPER_ADMIN || usuario?.rol === UserRole.MANAGER

  const handleCreatePlantilla = () => {
    setShowCreateForm(true)
  }

  const handleUsePlantilla = (plantilla: PlantillaContrato) => {
    console.log('Usar plantilla:', plantilla.nombre)
    // TODO: Navigate to contract creation with this template
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error al cargar las plantillas
            </div>
            <p className="text-red-500 mb-4">{(error as Error)?.message || 'Error desconocido'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plantillas de Contratos</h1>
                <p className="text-gray-600">Crea y gestiona plantillas reutilizables para contratos</p>
              </div>
            </div>

            {canManagePlantillas && (
              <button
                onClick={handleCreatePlantilla}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Nueva Plantilla</span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Plantillas</p>
                  <p className="text-2xl font-bold text-gray-900">{plantillas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DocumentDuplicateIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Plantillas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plantillas.filter((p) => p.activa).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(plantillas.map(p => p.categoria)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MagnifyingGlassIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Usos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plantillas.reduce((sum, p) => sum + p.usos, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando plantillas...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && plantillas.length === 0 && (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
              <p className="text-gray-600 mb-4">
                {canManagePlantillas 
                  ? 'Crea tu primera plantilla para agilizar la creación de contratos'
                  : 'No hay plantillas disponibles en tu organización'
                }
              </p>
              {canManagePlantillas && (
                <button
                  onClick={handleCreatePlantilla}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Crear Primera Plantilla
                </button>
              )}
            </div>
          )}

          {/* Content */}
          {!isLoading && plantillas.length > 0 && (
            <div className="p-6">
              {viewMode === 'table' ? (
                <div className="text-center py-8 text-gray-500">
                  Tabla de plantillas - Implementación pendiente
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Vista de tarjetas - Implementación pendiente
                </div>
              )}
            </div>
          )}

          {/* Coming Soon Features */}
          {!isLoading && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Próximas Funcionalidades</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div>• Editor de plantillas con campos dinámicos</div>
                <div>• Categorización y etiquetado</div>
                <div>• Versionado de plantillas</div>
                <div>• Compartir plantillas entre organizaciones</div>
                <div>• Análisis de uso y estadísticas</div>
                <div>• Plantillas predefinidas del sistema</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlantillaModule
