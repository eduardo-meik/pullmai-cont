import React, { useState } from 'react'
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import ContraparteTable from './ContraparteTable'
import OrganizacionModal from './OrganizacionModal'
import ContraparteDetailedView from './ContraparteDetailedView'
import ContractImportModal from './ContractImportModal'
import UserAccessManagement from './UserAccessManagement'
import { useContrapartesOrganizacion } from '../../hooks/useContrapartesOrganizacion'
import { useOrganizaciones } from '../../hooks/useOrganizaciones'
import { useAuth } from '../../contexts/AuthContext'
import { ContraparteRelacion, Organizacion } from '../../types'

type ViewMode = 'table' | 'cards'

const ContraparteModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [showOrganizacionModal, setShowOrganizacionModal] = useState(false)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [selectedOrganizacion, setSelectedOrganizacion] = useState<Organizacion | null>(null)
  const [editingOrganizacion, setEditingOrganizacion] = useState<Organizacion | null>(null)

  const { data: contrapartes = [], isLoading, error, refetch } = useContrapartesOrganizacion()
  const { 
    crearOrganizacion, 
    actualizarOrganizacion, 
    eliminarOrganizacion,
    isCreating,
    isUpdating,
    isDeleting 
  } = useOrganizaciones()
  const { currentUser } = useAuth()
  // Filtrar contrapartes basado en el término de búsqueda
  const filteredContrapartes = contrapartes.filter((contraparte: ContraparteRelacion) =>
    contraparte.organizacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contraparte.organizacion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleCreateContraparte = () => {
    setEditingOrganizacion(null)
    setShowOrganizacionModal(true)
  }

  const handleEditContraparte = (contraparte: ContraparteRelacion) => {
    setEditingOrganizacion(contraparte.organizacion)
    setShowOrganizacionModal(true)
  }
  const handleViewContraparte = (contraparte: ContraparteRelacion) => {
    setSelectedOrganizacion(contraparte.organizacion)
    setShowDetailedView(true)
  }

  const handleRequestImport = (organizacionId: string) => {
    const organizacion = contrapartes.find(c => c.organizacionId === organizacionId)?.organizacion
    if (organizacion) {
      setSelectedOrganizacion(organizacion)
      setShowImportModal(true)
    }
  }

  const handleManageUsers = (contraparte: ContraparteRelacion) => {
    setSelectedOrganizacion(contraparte.organizacion)
    setShowUserManagement(true)
  }

  const handleCreateOrganizacion = async (organizacionData: Omit<Organizacion, 'id' | 'fechaCreacion'>) => {
    await crearOrganizacion(organizacionData)
    refetch()
  }
  const handleUpdateOrganizacion = async (organizacionData: Omit<Organizacion, 'id' | 'fechaCreacion'>) => {
    if (!editingOrganizacion?.id) return
    await actualizarOrganizacion(editingOrganizacion.id, organizacionData)
    refetch()
  }

  const handleDeleteOrganizacion = async (organizacion: Organizacion) => {
    await eliminarOrganizacion(organizacion.id)
    refetch()
  }
  const handleCloseModals = () => {
    setShowOrganizacionModal(false)
    setShowDetailedView(false)
    setShowImportModal(false)
    setShowUserManagement(false)
    setSelectedOrganizacion(null)
    setEditingOrganizacion(null)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error al cargar las contrapartes
            </div>
            <p className="text-red-500 mb-4">{(error as Error)?.message || 'Error desconocido'}</p>
            <button
              onClick={() => refetch()}
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
                <UsersIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contrapartes</h1>
                <p className="text-gray-600">Organizaciones con las que tienes contratos activos</p>
              </div>
            </div>            <button
              onClick={handleCreateContraparte}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              disabled={isCreating}
            >
              <PlusIcon className="h-5 w-5" />
              <span>{isCreating ? 'Creando...' : 'Nueva Organización'}</span>
            </button>
          </div>          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Contrapartes</p>
                  <p className="text-2xl font-bold text-gray-900">{contrapartes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Contratos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contrapartes.reduce((sum, c) => sum + c.estadisticas.contratosActivos, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Contratos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contrapartes.reduce((sum, c) => sum + c.estadisticas.totalContratos, 0)}
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
                  <p className="text-sm font-medium text-gray-600">Filtradas</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredContrapartes.length}</p>
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
                  placeholder="Buscar contrapartes..."
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
              <p className="mt-4 text-gray-600">Cargando contrapartes...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && contrapartes.length === 0 && (
            <div className="p-8 text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contrapartes</h3>
              <p className="text-gray-600 mb-4">Las contrapartes aparecerán aquí cuando tengas contratos con otras organizaciones</p>
              <button
                onClick={() => {}}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                disabled
              >
                Crear Primer Contrato
              </button>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && contrapartes.length > 0 && filteredContrapartes.length === 0 && (
            <div className="p-8 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
            </div>
          )}          {/* Content */}
          {!isLoading && filteredContrapartes.length > 0 && (
            <>
              {viewMode === 'table' ? (
                <ContraparteTable
                  contrapartes={filteredContrapartes}
                  onView={handleViewContraparte}
                  onEdit={handleEditContraparte}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Cards view temporarily disabled. Please use table view.
                </div>
              )}
            </>          )}
        </div>
      </div>      {/* Modals */}
      <OrganizacionModal
        isOpen={showOrganizacionModal}
        onClose={handleCloseModals}
        organizacion={editingOrganizacion}
        onSubmit={editingOrganizacion ? handleUpdateOrganizacion : handleCreateOrganizacion}
        isLoading={isCreating || isUpdating}
      />

      {selectedOrganizacion && (
        <>
          <ContraparteDetailedView
            isOpen={showDetailedView}
            onClose={handleCloseModals}
            organizacion={selectedOrganizacion}
            userId={currentUser?.uid || ''}
            onEdit={(org: Organizacion) => {
              setEditingOrganizacion(org)
              setShowDetailedView(false)
              setShowOrganizacionModal(true)
            }}
            onRequestImport={handleRequestImport}
          />

          <ContractImportModal
            isOpen={showImportModal}
            onClose={handleCloseModals}
            organizacionId={selectedOrganizacion.id}
            currentUserId={currentUser?.uid || ''}
          />

          <UserAccessManagement
            isOpen={showUserManagement}
            onClose={handleCloseModals}
            organizacionId={selectedOrganizacion.id}
            organizacionName={selectedOrganizacion.nombre}
            currentUserId={currentUser?.uid || ''}
          />
        </>
      )}
    </div>
  )
}

export default ContraparteModule
