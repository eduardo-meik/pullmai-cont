import React, { useState, useEffect } from 'react'
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
  XCircleIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Organizacion, Contrato, EstadoContrato } from '../../types'
import { ContraparteAccessLevel } from '../../types/contraparteComprehensive'
import { ContraparteComprehensiveService } from '../../services/contraparteComprehensiveService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '../../contexts/ToastContext'

interface ContraparteDetailedViewProps {
  isOpen: boolean
  onClose: () => void
  organizacion: Organizacion
  userId: string
  onEdit: (organizacion: Organizacion) => void
  onRequestImport: (organizacionId: string) => void
}

const ContraparteDetailedView: React.FC<ContraparteDetailedViewProps> = ({
  isOpen,
  onClose,
  organizacion,
  userId,
  onEdit,
  onRequestImport
}) => {
  const [detailedInfo, setDetailedInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'relationship' | 'shared'>('overview')
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen && organizacion.id) {
      loadDetailedInfo()
    }
  }, [isOpen, organizacion.id])

  const loadDetailedInfo = async () => {
    setLoading(true)
    try {
      const info = await ContraparteComprehensiveService.getContraparteDetailedInfo(userId, organizacion.id)
      setDetailedInfo(info)
    } catch (error) {
      console.error('Error loading detailed info:', error)
      showToast('Error al cargar información detallada', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestImport = async () => {
    try {
      onRequestImport(organizacion.id)
      showToast('Solicitud de importación enviada', 'success')
    } catch (error) {
      showToast('Error al solicitar importación', 'error')
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const canImportContracts = detailedInfo?.accessLevel === ContraparteAccessLevel.IMPORT_CONTRACTS || 
                           detailedInfo?.accessLevel === ContraparteAccessLevel.FULL_ACCESS

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{organizacion.nombre}</h2>
              <div className="flex items-center space-x-3 mt-1">
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
                {detailedInfo?.accessLevel && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {detailedInfo.accessLevel.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canImportContracts && (
              <button
                onClick={handleRequestImport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                title="Solicitar importación de contratos"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Importar Datos</span>
              </button>
            )}
            <button
              onClick={() => onEdit(organizacion)}
              className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="Editar organización"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información detallada...</p>
          </div>
        )}

        {/* Content */}
        {!loading && detailedInfo && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
                  { id: 'contracts', label: 'Contratos', icon: DocumentTextIcon },
                  { id: 'relationship', label: 'Relación', icon: UsersIcon },
                  { id: 'shared', label: 'Recursos Compartidos', icon: ArrowDownTrayIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-2xl font-bold text-blue-900">{detailedInfo.contracts.length}</p>
                          <p className="text-sm text-blue-600">Total Contratos</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-2xl font-bold text-green-900">
                            {detailedInfo.contracts.filter((c: Contrato) => c.estado === EstadoContrato.ACTIVO).length}
                          </p>
                          <p className="text-sm text-green-600">Contratos Activos</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-2xl font-bold text-purple-900">
                            ${detailedInfo.relationshipDetails.totalContractsValue.toLocaleString()}
                          </p>
                          <p className="text-sm text-purple-600">Valor Total</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-orange-600" />
                        <div className="ml-3">
                          <p className="text-2xl font-bold text-orange-900">
                            {Math.round((new Date().getTime() - new Date(detailedInfo.relationshipDetails.firstContactDate).getTime()) / (1000 * 60 * 60 * 24))}
                          </p>
                          <p className="text-sm text-orange-600">Días de Relación</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organization Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Organización</h3>
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
                          <label className="block text-sm font-medium text-gray-500 mb-1">Estado de Relación</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            detailedInfo.relationshipDetails.relationshipStatus === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {detailedInfo.relationshipDetails.relationshipStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluación de Riesgo</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Riesgo General', value: detailedInfo.relationshipDetails.riskAssessment.overallRisk },
                          { label: 'Riesgo Financiero', value: detailedInfo.relationshipDetails.riskAssessment.financialRisk },
                          { label: 'Riesgo Operacional', value: detailedInfo.relationshipDetails.riskAssessment.operationalRisk },
                          { label: 'Riesgo de Cumplimiento', value: detailedInfo.relationshipDetails.riskAssessment.complianceRisk }
                        ].map((risk) => (
                          <div key={risk.label} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{risk.label}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              risk.value === 'low' 
                                ? 'bg-green-100 text-green-800'
                                : risk.value === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {risk.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <strong>Última evaluación:</strong> {format(new Date(detailedInfo.relationshipDetails.riskAssessment.lastAssessment), 'dd/MM/yyyy')}
                        </p>
                        {detailedInfo.relationshipDetails.riskAssessment.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notas:</strong> {detailedInfo.relationshipDetails.riskAssessment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Historial de Contratos</h3>
                    <span className="text-sm text-gray-500">{detailedInfo.contracts.length} contratos</span>
                  </div>
                  
                  {detailedInfo.contracts.length > 0 ? (
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
                                Valor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Periodo
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {detailedInfo.contracts.map((contrato: Contrato) => (
                              <tr key={contrato.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{contrato.titulo}</div>
                                  <div className="text-sm text-gray-500">{contrato.descripcion}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    contrato.estado === EstadoContrato.ACTIVO 
                                      ? 'bg-green-100 text-green-800'
                                      : contrato.estado === EstadoContrato.BORRADOR
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {contrato.estado}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contrato.monto ? `${contrato.moneda} ${contrato.monto.toLocaleString()}` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {format(new Date(contrato.fechaInicio), 'dd/MM/yyyy')} - {format(new Date(contrato.fechaTermino), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                  {canImportContracts && (
                                    <button className="text-green-600 hover:text-green-900">
                                      <ArrowDownTrayIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay contratos registrados con esta organización</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'relationship' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de la Relación</h3>
                  
                  {/* Relationship Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Cronología de la Relación</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-blue-600 mr-3" />
                          <span className="text-sm font-medium text-blue-900">Primer Contacto</span>
                        </div>
                        <span className="text-sm text-blue-700">
                          {format(new Date(detailedInfo.relationshipDetails.firstContactDate), 'dd MMMM yyyy', { locale: es })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-3" />
                          <span className="text-sm font-medium text-green-900">Valor Promedio por Contrato</span>
                        </div>
                        <span className="text-sm text-green-700">
                          ${detailedInfo.relationshipDetails.averageContractValue.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-purple-600 mr-3" />
                          <span className="text-sm font-medium text-purple-900">Frecuencia de Contratos</span>
                        </div>
                        <span className="text-sm text-purple-700 capitalize">
                          {detailedInfo.relationshipDetails.contractFrequency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Contacts */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Contactos Clave</h4>
                    {detailedInfo.relationshipDetails.keyContacts.length > 0 ? (
                      <div className="space-y-3">
                        {detailedInfo.relationshipDetails.keyContacts.map((contact: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{contact.name}</p>
                              <p className="text-sm text-gray-600">{contact.role}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-700">
                                  <EnvelopeIcon className="h-4 w-4" />
                                </a>
                              )}
                              {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="text-green-600 hover:text-green-700">
                                  <PhoneIcon className="h-4 w-4" />
                                </a>
                              )}
                              {contact.isPrimary && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay contactos registrados</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'shared' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recursos Compartidos</h3>
                  
                  {/* Shared Templates */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Plantillas de Contratos</h4>
                    {detailedInfo.sharedData.templates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detailedInfo.sharedData.templates.map((template: any) => (
                          <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900">{template.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Usado {template.usageCount} veces
                              </span>
                              {canImportContracts && (
                                <button className="text-blue-600 hover:text-blue-700 text-sm">
                                  Importar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay plantillas compartidas</p>
                    )}
                  </div>

                  {/* Best Practices */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Mejores Prácticas</h4>
                    {detailedInfo.sharedData.bestPractices.length > 0 ? (
                      <div className="space-y-3">
                        {detailedInfo.sharedData.bestPractices.map((practice: any) => (
                          <div key={practice.id} className="border-l-4 border-blue-500 pl-4">
                            <h5 className="font-medium text-gray-900">{practice.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{practice.description}</p>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {practice.category}
                              </span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${i < practice.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay mejores prácticas compartidas</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ContraparteDetailedView
