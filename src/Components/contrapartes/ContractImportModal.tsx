import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  UsersIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { ContraparteComprehensiveService } from '../../services/contraparteComprehensiveService'
import { ContractImportRequest, ContractImportResult } from '../../types/contraparteComprehensive'
import { Contrato, Usuario } from '../../types'
import { useToast } from '../../contexts/ToastContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContractImportModalProps {
  isOpen: boolean
  onClose: () => void
  organizacionId: string
  currentUserId: string
}

const ContractImportModal: React.FC<ContractImportModalProps> = ({
  isOpen,
  onClose,
  organizacionId,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'pending' | 'history'>('request')
  const [availableUsers, setAvailableUsers] = useState<Usuario[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [userContracts, setUserContracts] = useState<Contrato[]>([])
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [pendingRequests, setPendingRequests] = useState<ContractImportRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestNotes, setRequestNotes] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadPendingRequests()
      loadAvailableUsers()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedUser) {
      loadUserContracts(selectedUser)
    } else {
      setUserContracts([])
      setSelectedContracts([])
    }
  }, [selectedUser])

  const loadAvailableUsers = async () => {
    // In a real implementation, this would fetch users who have contracts with this organization
    // For now, we'll simulate it
    setAvailableUsers([])
  }

  const loadUserContracts = async (userId: string) => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch contracts from the selected user
      // that are related to the current organization
      setUserContracts([])
    } catch (error) {
      console.error('Error loading user contracts:', error)
      showToast('Error al cargar contratos del usuario', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const requests = await ContraparteComprehensiveService.getImportRequests(currentUserId)
      setPendingRequests(requests)
    } catch (error) {
      console.error('Error loading pending requests:', error)
      showToast('Error al cargar solicitudes pendientes', 'error')
    }
  }

  const handleContractSelection = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId) 
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    )
  }

  const handleRequestImport = async () => {
    if (!selectedUser || selectedContracts.length === 0) {
      showToast('Selecciona un usuario y al menos un contrato', 'warning')
      return
    }

    try {
      setLoading(true)
      const requestId = await ContraparteComprehensiveService.requestContractImport(
        selectedUser,
        currentUserId,
        selectedContracts,
        currentUserId,
        requestNotes
      )

      showToast('Solicitud de importación enviada exitosamente', 'success')
      setSelectedUser('')
      setSelectedContracts([])
      setRequestNotes('')
      setActiveTab('pending')
      loadPendingRequests()
    } catch (error) {
      console.error('Error requesting import:', error)
      showToast('Error al enviar solicitud de importación', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveImport = async (requestId: string) => {
    try {
      const result = await ContraparteComprehensiveService.approveContractImport(requestId, currentUserId)
      
      if (result.success) {
        showToast(`Importación completada: ${result.summary.totalImported} contratos importados`, 'success')
      } else {
        showToast(`Importación parcial: ${result.summary.totalImported}/${result.summary.totalRequested} contratos importados`, 'warning')
      }
      
      loadPendingRequests()
    } catch (error) {
      console.error('Error approving import:', error)
      showToast('Error al aprobar la importación', 'error')
    }
  }

  const filteredContracts = userContracts.filter(contract =>
    contract.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div className="bg-green-100 p-2 rounded-lg">
              <ArrowDownTrayIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Importar Contratos</h2>
              <p className="text-gray-600">Importa contratos y datos de otros usuarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'request', label: 'Nueva Solicitud', icon: DocumentTextIcon },
              { id: 'pending', label: 'Solicitudes Pendientes', icon: ClockIcon },
              { id: 'history', label: 'Historial', icon: CheckCircleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'pending' && pendingRequests.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {pendingRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'request' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Solicitar Importación de Contratos</h3>
                <p className="text-gray-600 mb-6">
                  Selecciona un usuario con experiencia en esta organización para importar sus contratos y datos.
                </p>
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Usuario
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Selecciona un usuario...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} {user.apellido} - {user.email}
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No hay usuarios disponibles con contratos de esta organización.
                  </p>
                )}
              </div>

              {/* Contract Selection */}
              {selectedUser && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Contratos Disponibles ({userContracts.length})
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar contratos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando contratos...</p>
                    </div>
                  ) : filteredContracts.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredContracts.map((contract) => (
                        <div
                          key={contract.id}
                          className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                            selectedContracts.includes(contract.id) ? 'bg-green-50' : ''
                          }`}
                          onClick={() => handleContractSelection(contract.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedContracts.includes(contract.id)}
                              onChange={() => handleContractSelection(contract.id)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{contract.titulo}</h4>
                                <span className="text-sm text-gray-500">
                                  {contract.monto ? `${contract.moneda} ${contract.monto.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{contract.descripcion}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {format(new Date(contract.fechaInicio), 'MMM yyyy')} - {format(new Date(contract.fechaTermino), 'MMM yyyy')}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  contract.estado === 'activo' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {contract.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm ? 'No se encontraron contratos' : 'Este usuario no tiene contratos disponibles'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de la Solicitud (Opcional)
                  </label>
                  <textarea
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Explica por qué necesitas estos contratos..."
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {selectedContracts.length > 0 && (
                    <span>{selectedContracts.length} contrato(s) seleccionado(s)</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRequestImport}
                    disabled={!selectedUser || selectedContracts.length === 0 || loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Solicitar Importación</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Solicitudes Pendientes</h3>
              
              {pendingRequests.filter(r => r.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium text-gray-900">
                              Solicitud de importación
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Pendiente
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.contractIds.length} contrato(s) solicitado(s)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Solicitado el {format(new Date(request.requestedAt), 'dd/MM/yyyy HH:mm')}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{request.notes}"</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveImport(request.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Aprobar
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay solicitudes pendientes</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Historial de Importaciones</h3>
              
              {pendingRequests.filter(r => r.status !== 'pending').length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.filter(r => r.status !== 'pending').map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {request.status === 'approved' ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-medium text-gray-900">
                              Importación {request.status === 'approved' ? 'aprobada' : 'rechazada'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              request.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.contractIds.length} contrato(s)
                          </p>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p>Solicitado el {format(new Date(request.requestedAt), 'dd/MM/yyyy HH:mm')}</p>
                            {request.approvedAt && (
                              <p>Procesado el {format(new Date(request.approvedAt), 'dd/MM/yyyy HH:mm')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay historial de importaciones</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContractImportModal
