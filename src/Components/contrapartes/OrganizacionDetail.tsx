import React, { useState } from 'react'
import { 
  XMarkIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Organizacion, Contrato, EstadoContrato } from '../../types'
import { useContracts } from '../../hooks/useContracts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface OrganizacionDetailProps {
  isOpen: boolean
  onClose: () => void
  organizacion: Organizacion
  onEdit: (organizacion: Organizacion) => void
  onDelete: (organizacion: Organizacion) => void
}

const OrganizacionDetail: React.FC<OrganizacionDetailProps> = ({
  isOpen,
  onClose,
  organizacion,
  onEdit,
  onDelete
}) => {  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { data: contractsData } = useContracts()
  
  // Extract contracts array from the data structure
  const contratos: Contrato[] = Array.isArray(contractsData) ? contractsData : contractsData?.contratos || []
  // Filtrar contratos de esta organización
  const contratosOrganizacion = contratos.filter(
    (contrato: Contrato) => contrato.contraparteId === organizacion.id
  )
  
  const contratosActivos = contratosOrganizacion.filter(
    (contrato: Contrato) => contrato.estado === EstadoContrato.ACTIVO
  )

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDelete = () => {
    onDelete(organizacion)
    setShowDeleteConfirm(false)
    onClose()
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
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{organizacion.nombre}</h2>
              <div className="flex items-center space-x-2 mt-1">
                {organizacion.activa ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    Inactiva
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(organizacion)}
              className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="Editar organización"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Eliminar organización"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información General</h3>
                <div className="space-y-3">
                  {organizacion.logo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Logo</label>
                      <img 
                        src={organizacion.logo} 
                        alt={`Logo de ${organizacion.nombre}`}
                        className="h-16 w-16 object-contain border border-gray-200 rounded-lg p-2"
                      />
                    </div>
                  )}
                  
                  {organizacion.descripcion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                      <p className="text-gray-900">{organizacion.descripcion}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Creación</label>
                    <div className="flex items-center text-gray-900">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(organizacion.fechaCreacion), 'dd MMMM yyyy', { locale: es })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-2xl font-bold text-blue-900">{contratosOrganizacion.length}</p>
                      <p className="text-sm text-blue-600">Total Contratos</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-2xl font-bold text-green-900">{contratosActivos.length}</p>
                      <p className="text-sm text-green-600">Contratos Activos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Configuración</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Flujo de aprobación</span>
                  {organizacion.configuracion?.flujoAprobacion ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notificaciones por email</span>
                  {organizacion.configuracion?.notificacionesEmail ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Plantillas personalizadas</span>
                  {organizacion.configuracion?.plantillasPersonalizadas ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Retención de documentos</span>
                  <span className="text-sm font-medium text-gray-900">
                    {organizacion.configuracion?.retencionDocumentos || 365} días
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contratos recientes */}
          {contratosOrganizacion.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contratos Recientes</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contrato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contratosOrganizacion.slice(0, 5).map((contrato) => (                        <tr key={contrato.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{contrato.titulo}</div>
                            <div className="text-sm text-gray-500">{contrato.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contrato.estado === EstadoContrato.ACTIVO 
                                ? 'bg-green-100 text-green-800'
                                : contrato.estado === EstadoContrato.REVISION
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {contrato.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(contrato.fechaInicio), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contrato.monto ? `$${contrato.monto.toLocaleString()} ${contrato.moneda}` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {contratosOrganizacion.length > 5 && (
                  <div className="bg-gray-50 px-6 py-3 text-center">
                    <span className="text-sm text-gray-500">
                      Y {contratosOrganizacion.length - 5} contratos más...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que deseas eliminar la organización "{organizacion.nombre}"? 
                Esta acción no se puede deshacer.
              </p>
              {contratosOrganizacion.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> Esta organización tiene {contratosOrganizacion.length} contrato(s) asociado(s).
                    Al eliminar la organización, estos contratos quedarán sin contraparte asignada.
                  </p>
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrganizacionDetail
