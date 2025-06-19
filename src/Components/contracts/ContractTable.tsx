import React, { useState, useMemo } from 'react'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useContracts, useDeleteContract } from '../../hooks/useContracts'
import { Contrato, FormularioContrato } from '../../types'
import ContractForm from './ContractForm'
import { motion, AnimatePresence } from 'framer-motion'
import usePermissions from '../../hooks/usePermissions'

interface SortConfig {
  key: keyof Contrato
  direction: 'asc' | 'desc'
}

const ContractTable: React.FC = () => {
  const { data, isLoading } = useContracts()
  const deleteContractMutation = useDeleteContract()
  const [editingContract, setEditingContract] = useState<Contrato | null>(null)
  const [viewingPDF, setViewingPDF] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fechaInicio', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Permission hooks
  const { 
    canViewContract, 
    canEditContract, 
    canDeleteContract,
    userRole,
    userOrganizationId 
  } = usePermissions()

  const contracts = data?.contratos || []
  // Convert Contrato to FormularioContrato for editing
  const convertToFormulario = (contrato: Contrato): FormularioContrato => {
    return {
      titulo: contrato.titulo,
      descripcion: contrato.descripcion,
      contraparte: contrato.contraparte,
      fechaInicio: contrato.fechaInicio.toISOString().split('T')[0], // Convert Date to string
      fechaTermino: contrato.fechaTermino.toISOString().split('T')[0], // Convert Date to string
      monto: contrato.monto,
      moneda: contrato.moneda,
      categoria: contrato.categoria,
      periodicidad: contrato.periodicidad,
      tipo: contrato.tipo,
      proyecto: contrato.proyecto,
      proyectoId: contrato.proyectoId, // New field for hierarchy
      estado: contrato.estado,
      departamento: contrato.departamento,
      etiquetas: contrato.etiquetas
    }
  }
  // Filter and search contracts
  const filteredContracts = useMemo(() => {
    let filtered = contracts.filter((contract: Contrato) => {
      // Permission check: only show contracts the user can view
      const canView = canViewContract(contract.organizacionId, contract.proyectoId, contract.id)
      if (!canView) return false
      
      const matchesSearch = 
        contract.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contraparte.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || contract.estado === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort contracts
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue
      }
      
      return 0
    })

    return filtered
  }, [contracts, searchTerm, statusFilter, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage)
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const handleSort = (key: keyof Contrato) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contrato?')) {
      try {
        await deleteContractMutation.mutateAsync(id)
      } catch (error) {
        console.error('Error al eliminar contrato:', error)
        alert('Error al eliminar el contrato')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'borrador': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
      'activo': { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      'finalizado': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Finalizado' },
      'cancelado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.borrador
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('titulo')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Título</span>
                    {sortConfig.key === 'titulo' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>                <th 
                  onClick={() => handleSort('contraparte')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Contraparte</span>
                    {sortConfig.key === 'contraparte' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('monto')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Monto</span>
                    {sortConfig.key === 'monto' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fechaInicio')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Fecha Inicio</span>
                    {sortConfig.key === 'fechaInicio' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>                <th 
                  onClick={() => handleSort('fechaTermino')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Fecha Fin</span>
                    {sortConfig.key === 'fechaTermino' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('estado')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    {sortConfig.key === 'estado' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4" /> : 
                        <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {paginatedContracts.map((contract) => (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.titulo}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {contract.descripcion}
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.contraparte}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(contract.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contract.fechaInicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contract.fechaTermino)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">                      <div className="flex items-center justify-end space-x-2">
                        {contract.pdfUrl && (
                          <button
                            onClick={() => setViewingPDF(contract.pdfUrl)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver PDF"
                          >
                            <DocumentIcon className="h-5 w-5" />
                          </button>
                        )}                        {canEditContract(contract.organizacionId, contract.proyectoId, contract.id) && (
                          <button
                            onClick={() => setEditingContract(contract)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                        {canDeleteContract(contract.organizacionId, contract.proyectoId, contract.id) && (
                          <button
                            onClick={() => handleDelete(contract.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredContracts.length)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{filteredContracts.length}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contratos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron contratos con los filtros aplicados.'
              : 'Comienza creando tu primer contrato.'
            }
          </p>
        </div>
      )}      {/* Edit Modal */}
      {editingContract && (
        <ContractForm
          isOpen={!!editingContract}
          onClose={() => setEditingContract(null)}
          contractToEdit={convertToFormulario(editingContract)}
          onSuccess={() => {
            setEditingContract(null)
            // Refresh logic would go here
          }}
        />
      )}

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Vista previa del contrato</h3>
              <button
                onClick={() => setViewingPDF(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="h-96 overflow-auto">
              <iframe
                src={viewingPDF}
                className="w-full h-full"
                title="Contract PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContractTable
