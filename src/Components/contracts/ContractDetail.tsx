import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  DocumentIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Contrato } from '../../types'
// import ContractPDFViewer from './ContractPDFViewer' // Will be lazy loaded
import authenticatedPDFService from '../../services/authenticatedPDFService'
import LoadingSpinner from '../ui/LoadingSpinner' // For Suspense fallback
import React, { useState, lazy, Suspense } from 'react' // Added lazy and Suspense

const ContractPDFViewer = lazy(() => import('./ContractPDFViewer'))

interface ContractDetailProps {
  isOpen: boolean
  onClose: () => void
  contract: Contrato | null
}

const ContractDetail: React.FC<ContractDetailProps> = ({
  isOpen,
  onClose,
  contract
}) => {
  const [showPDFViewer, setShowPDFViewer] = useState(false)

  if (!contract) return null

  const formatCurrency = (amount: number, currency = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800'
      case 'borrador':
        return 'bg-yellow-100 text-yellow-800'
      case 'terminado':
        return 'bg-gray-100 text-gray-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-lg"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {contract.titulo}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Detalles del contrato
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Contract Information */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Información General
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contraparte</p>
                            <p className="text-sm text-gray-900">{contract.contraparte}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Monto</p>
                            <p className="text-sm text-gray-900">
                              {formatCurrency(contract.monto, contract.moneda)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <TagIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Estado</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.estado)}`}>
                              {contract.estado.charAt(0).toUpperCase() + contract.estado.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Departamento</p>
                            <p className="text-sm text-gray-900">{contract.departamento || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Fechas
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Fecha de Inicio</p>
                            <p className="text-sm text-gray-900">{formatDate(contract.fechaInicio)}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Fecha de Término</p>
                            <p className="text-sm text-gray-900">{formatDate(contract.fechaTermino)}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <ClockIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Fecha de Creación</p>
                            <p className="text-sm text-gray-900">{formatDate(contract.fechaCreacion)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Detalles Adicionales
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Categoría</p>
                          <p className="text-sm text-gray-900 capitalize">{contract.categoria}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Tipo Económico</p>
                          <p className="text-sm text-gray-900 capitalize">{contract.tipo}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Periodicidad</p>
                          <p className="text-sm text-gray-900 capitalize">{contract.periodicidad}</p>
                        </div>

                        {contract.proyecto && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Proyecto</p>
                            <p className="text-sm text-gray-900">{contract.proyecto}</p>
                          </div>
                        )}

                        {contract.etiquetas && contract.etiquetas.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Etiquetas</p>
                            <div className="flex flex-wrap gap-1">
                              {contract.etiquetas.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Description and PDF */}
                  <div className="space-y-6">
                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Descripción
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {contract.descripcion || 'Sin descripción disponible'}
                      </p>
                    </div>

                    {/* PDF Document */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Documento PDF
                      </h4>
                      
                      {contract.pdfUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-white rounded-md border">
                            <DocumentIcon className="h-8 w-8 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {contract.documentoNombre || 'Documento del contrato'}
                              </p>
                              {contract.documentoTamaño && (
                                <p className="text-xs text-gray-500">
                                  {(contract.documentoTamaño / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setShowPDFViewer(true)}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Ver PDF
                            </button>
                              <button
                              onClick={async () => {
                                try {
                                  const storagePath = authenticatedPDFService.extractStoragePath(contract.pdfUrl)
                                  const authenticatedDownloadUrl = await authenticatedPDFService.getAuthenticatedPDFUrl(storagePath)
                                  
                                  const link = document.createElement('a')
                                  link.href = authenticatedDownloadUrl
                                  link.download = `${contract.titulo}.pdf`
                                  link.click()
                                } catch (error) {
                                  console.error('Error downloading PDF:', error)
                                }
                              }}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              Descargar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">
                            No hay documento PDF asociado a este contrato
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Viewer */}
      {contract.pdfUrl && showPDFViewer && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"><LoadingSpinner /></div>}>
          <ContractPDFViewer
            isOpen={showPDFViewer}
            onClose={() => setShowPDFViewer(false)}
            pdfUrl={contract.pdfUrl}
            contractTitle={contract.titulo}
          />
        </Suspense>
      )}
    </>
  )
}

export default ContractDetail
