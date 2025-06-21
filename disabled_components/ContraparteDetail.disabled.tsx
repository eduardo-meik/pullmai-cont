import React from 'react'
import { 
  XMarkIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  DocumentTextIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { Contraparte, TipoContraparte } from '../../types'
import { useContraparteDetail } from '../../hooks/useContrapartes'

interface ContraparteDetailProps {
  contraparte: Contraparte
  onClose: () => void
  onEdit: () => void
}

const ContraparteDetail: React.FC<ContraparteDetailProps> = ({
  contraparte,
  onClose,
  onEdit
}) => {
  const { 
    contratos, 
    estadisticas, 
    isLoadingContratos, 
    isLoadingEstadisticas 
  } = useContraparteDetail(contraparte.nombre)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number, currency: string = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getTipoIcon = (tipo: TipoContraparte) => {
    return tipo === TipoContraparte.ORGANIZACION ? (
      <BuildingOfficeIcon className="h-8 w-8" />
    ) : (
      <UserIcon className="h-8 w-8" />
    )
  }

  const getEstadoContractoBadge = (estado: string) => {
    const colors = {
      activo: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      cancelado: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[estado as keyof typeof colors] || colors.pendiente
      }`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 h-16 w-16 rounded-lg flex items-center justify-center ${
                contraparte.tipo === TipoContraparte.ORGANIZACION 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-green-100 text-green-600'
              }`}>
                {getTipoIcon(contraparte.tipo)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contraparte.nombre}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                    contraparte.tipo === TipoContraparte.ORGANIZACION 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {contraparte.tipo === TipoContraparte.ORGANIZACION ? (
                      <BuildingOfficeIcon className="h-4 w-4" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                    <span>{contraparte.tipo === TipoContraparte.ORGANIZACION ? 'Organización' : 'Persona'}</span>
                  </span>
                  {contraparte.giro && (
                    <span className="text-gray-600">{contraparte.giro}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5" />
                  <span>Información de Contacto</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {contraparte.email && (
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email Principal</p>
                      <a 
                        href={`mailto:${contraparte.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contraparte.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {contraparte.telefono && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono Principal</p>
                      <a 
                        href={`tel:${contraparte.telefono}`}
                        className="text-gray-900 hover:text-gray-700"
                      >
                        {contraparte.telefono}
                      </a>
                    </div>
                  </div>
                )}

                {contraparte.contactoPrincipal && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Persona de Contacto</p>
                      <p className="text-gray-900">{contraparte.contactoPrincipal}</p>
                    </div>
                  </div>
                )}

                {contraparte.emailContacto && (
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email de Contacto</p>
                      <a 
                        href={`mailto:${contraparte.emailContacto}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contraparte.emailContacto}
                      </a>
                    </div>
                  </div>
                )}

                {contraparte.telefonoContacto && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono de Contacto</p>
                      <a 
                        href={`tel:${contraparte.telefonoContacto}`}
                        className="text-gray-900 hover:text-gray-700"
                      >
                        {contraparte.telefonoContacto}
                      </a>
                    </div>
                  </div>
                )}

                {contraparte.sitioWeb && (
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Sitio Web</p>
                      <a 
                        href={contraparte.sitioWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contraparte.sitioWeb.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Legal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>Ubicación y Datos Legales</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {(contraparte.ciudad || contraparte.pais) && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="text-gray-900">
                        {[contraparte.ciudad, contraparte.pais].filter(Boolean).join(', ')}
                      </p>
                      {contraparte.direccion && (
                        <p className="text-sm text-gray-500 mt-1">{contraparte.direccion}</p>
                      )}
                    </div>
                  </div>
                )}

                {contraparte.rut && (
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">RUT</p>
                      <p className="text-gray-900 font-mono">{contraparte.rut}</p>
                    </div>
                  </div>
                )}

                {contraparte.nit && (
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">NIT / Tax ID</p>
                      <p className="text-gray-900 font-mono">{contraparte.nit}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Creación</p>
                    <p className="text-gray-900">{formatDate(contraparte.fechaCreacion)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {contraparte.notas && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Notas</span>
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{contraparte.notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Statistics and Contracts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            {isLoadingEstadisticas ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : estadisticas && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Estadísticas de Contratos</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{estadisticas.totalContratos}</div>
                      <div className="text-sm text-gray-600">Total Contratos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{estadisticas.contratoActivo}</div>
                      <div className="text-sm text-gray-600">Activos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{estadisticas.contratoVencido}</div>
                      <div className="text-sm text-gray-600">Vencidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{estadisticas.contratoProximo}</div>
                      <div className="text-sm text-gray-600">Por Vencer</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Monto Total</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mt-1">
                        {formatCurrency(estadisticas.montoTotal)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Monto Promedio</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mt-1">
                        {formatCurrency(estadisticas.montoPromedio)}
                      </div>
                    </div>
                  </div>

                  {(estadisticas.ultimoContrato || estadisticas.proximoVencimiento) && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {estadisticas.ultimoContrato && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Último Contrato</span>
                          </div>
                          <div className="text-lg font-semibold text-blue-900 mt-1">
                            {formatDate(estadisticas.ultimoContrato)}
                          </div>
                        </div>
                      )}
                      {estadisticas.proximoVencimiento && (
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">Próximo Vencimiento</span>
                          </div>
                          <div className="text-lg font-semibold text-orange-900 mt-1">
                            {formatDate(estadisticas.proximoVencimiento)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contracts List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Contratos Asociados</h2>
              </div>
              <div className="p-6">
                {isLoadingContratos ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : contratos.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos</h3>
                    <p className="text-gray-600">Esta contraparte no tiene contratos asociados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contratos.map((contrato) => (
                      <div key={contrato.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-medium text-gray-900 truncate">
                              {contrato.titulo}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {contrato.descripcion}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {formatDate(contrato.fechaInicio)} - {formatDate(contrato.fechaTermino)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {formatCurrency(contrato.monto, contrato.moneda)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            {getEstadoContractoBadge(contrato.estado)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContraparteDetail
