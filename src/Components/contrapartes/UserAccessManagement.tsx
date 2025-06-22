import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { ContraparteComprehensiveService } from '../../services/contraparteComprehensiveService'
import { ContraparteAccessLevel, DataSharingLevel, ContraparteViewer } from '../../types/contraparteComprehensive'
import { Usuario } from '../../types'
import { useToast } from '../../contexts/ToastContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UserAccessManagementProps {
  isOpen: boolean
  onClose: () => void
  organizacionId: string
  organizacionName: string
  currentUserId: string
}

const UserAccessManagement: React.FC<UserAccessManagementProps> = ({
  isOpen,
  onClose,
  organizacionId,
  organizacionName,
  currentUserId
}) => {
  const [viewers, setViewers] = useState<ContraparteViewer[]>([])
  const [availableUsers, setAvailableUsers] = useState<Usuario[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<ContraparteAccessLevel>(ContraparteAccessLevel.VIEW_BASIC)
  const [selectedDataSharing, setSelectedDataSharing] = useState<DataSharingLevel>(DataSharingLevel.READ_ONLY)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadViewers()
      loadAvailableUsers()
    }
  }, [isOpen])

  const loadViewers = async () => {
    try {
      const viewerData = await ContraparteComprehensiveService.getContraparteViewers(organizacionId)
      setViewers(viewerData)
    } catch (error) {
      console.error('Error loading viewers:', error)
      showToast('Error al cargar usuarios con acceso', 'error')
    }
  }

  const loadAvailableUsers = async () => {
    // In a real implementation, this would fetch users from the same organization
    // who don't already have access to this contraparte
    setAvailableUsers([])
  }

  const handleGrantAccess = async () => {
    if (!selectedUser) {
      showToast('Selecciona un usuario', 'warning')
      return
    }

    try {
      setLoading(true)
      await ContraparteComprehensiveService.grantDetailedContraparteAccess(
        selectedUser,
        organizacionId,
        selectedAccessLevel,
        selectedDataSharing,
        currentUserId
      )

      showToast('Acceso otorgado exitosamente', 'success')
      setSelectedUser('')
      setShowAddForm(false)
      loadViewers()
    } catch (error) {
      console.error('Error granting access:', error)
      showToast('Error al otorgar acceso', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (userId: string) => {
    try {
      await ContraparteComprehensiveService.revokeContraparteAccess(userId, organizacionId)
      showToast('Acceso revocado exitosamente', 'success')
      loadViewers()
    } catch (error) {
      console.error('Error revoking access:', error)
      showToast('Error al revocar acceso', 'error')
    }
  }

  const getAccessLevelColor = (level: ContraparteAccessLevel) => {
    switch (level) {
      case ContraparteAccessLevel.VIEW_BASIC:
        return 'bg-gray-100 text-gray-800'
      case ContraparteAccessLevel.VIEW_DETAILED:
        return 'bg-blue-100 text-blue-800'
      case ContraparteAccessLevel.VIEW_CONTRACTS:
        return 'bg-purple-100 text-purple-800'
      case ContraparteAccessLevel.IMPORT_CONTRACTS:
        return 'bg-green-100 text-green-800'
      case ContraparteAccessLevel.FULL_ACCESS:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDataSharingColor = (level: DataSharingLevel) => {
    switch (level) {
      case DataSharingLevel.READ_ONLY:
        return 'bg-gray-100 text-gray-800'
      case DataSharingLevel.COPY_ALLOWED:
        return 'bg-yellow-100 text-yellow-800'
      case DataSharingLevel.IMPORT_ALLOWED:
        return 'bg-green-100 text-green-800'
      case DataSharingLevel.FULL_COLLABORATION:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Acceso de Usuarios</h2>
              <p className="text-gray-600">Gestiona quién puede ver información de {organizacionName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Agregar Usuario</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add User Form */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Otorgar Acceso a Usuario</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar usuario...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nombre} {user.apellido}
                      </option>
                    ))}
                  </select>
                  {availableUsers.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay usuarios disponibles para agregar.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Acceso
                  </label>
                  <select
                    value={selectedAccessLevel}
                    onChange={(e) => setSelectedAccessLevel(e.target.value as ContraparteAccessLevel)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={ContraparteAccessLevel.VIEW_BASIC}>Básico - Solo información general</option>
                    <option value={ContraparteAccessLevel.VIEW_DETAILED}>Detallado - Información completa</option>
                    <option value={ContraparteAccessLevel.VIEW_CONTRACTS}>Ver Contratos - Incluye contratos</option>
                    <option value={ContraparteAccessLevel.IMPORT_CONTRACTS}>Importar - Puede importar datos</option>
                    <option value={ContraparteAccessLevel.FULL_ACCESS}>Completo - Acceso total</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compartir Datos
                  </label>
                  <select
                    value={selectedDataSharing}
                    onChange={(e) => setSelectedDataSharing(e.target.value as DataSharingLevel)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={DataSharingLevel.READ_ONLY}>Solo Lectura</option>
                    <option value={DataSharingLevel.COPY_ALLOWED}>Permitir Copiar</option>
                    <option value={DataSharingLevel.IMPORT_ALLOWED}>Permitir Importar</option>
                    <option value={DataSharingLevel.FULL_COLLABORATION}>Colaboración Completa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGrantAccess}
                  disabled={!selectedUser || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Otorgando...' : 'Otorgar Acceso'}
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Usuarios con Acceso ({viewers.length})
              </h3>
            </div>

            {viewers.length > 0 ? (
              <div className="space-y-3">
                {viewers.map((viewer) => (
                  <div key={viewer.userId} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <UsersIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{viewer.userName}</h4>
                            <p className="text-sm text-gray-600">{viewer.email}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-2">
                          {viewer.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccessLevelColor(permission)}`}
                            >
                              {permission.replace('_', ' ')}
                            </span>
                          ))}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDataSharingColor(viewer.dataSharing)}`}>
                            {viewer.dataSharing.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Acceso otorgado el {format(new Date(viewer.grantedAt), 'dd/MM/yyyy')}
                          {viewer.lastAccessed && (
                            <span> • Último acceso: {format(new Date(viewer.lastAccessed), 'dd/MM/yyyy HH:mm')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRevokeAccess(viewer.userId)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Revocar acceso"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-gray-200 rounded-lg">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios con acceso</h3>
                <p className="text-gray-600 mb-4">
                  Agrega usuarios para que puedan ver información de esta organización contraparte.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Agregar Primer Usuario</span>
                </button>
              </div>
            )}
          </div>

          {/* Access Level Descriptions */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Niveles de Acceso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Básico:</span>
                <span className="text-gray-600 ml-2">Solo nombre y descripción</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Detallado:</span>
                <span className="text-gray-600 ml-2">Información completa y estadísticas</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ver Contratos:</span>
                <span className="text-gray-600 ml-2">Incluye historial de contratos</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Importar:</span>
                <span className="text-gray-600 ml-2">Puede solicitar importación de datos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAccessManagement
