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
  ChevronRightIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { useContracts, useDeleteContract } from '../../hooks/useContracts'
import { useCacheInvalidation } from '../../hooks/useCacheInvalidation'
import { Contrato, FormularioContrato, Proyecto } from '../../types'
import ContractForm from './ContractForm'
import ContractPDFViewer from './ContractPDFViewer'
import ContractProjectAssociation from './ContractProjectAssociation'
import ContractDetail from './ContractDetail'
import { motion, AnimatePresence } from 'framer-motion'
import usePermissions from '../../hooks/usePermissions'
import Button from '../ui/Button'
import { useToast } from '../../contexts/ToastContext'

interface SortConfig {
  key: keyof Contrato
  direction: 'asc' | 'desc'
}

const ContractTable: React.FC = () => {
  const { data, isLoading } = useContracts()
  const deleteContractMutation = useDeleteContract() // Reactivated delete functionality
  const { invalidateContracts } = useCacheInvalidation()
  const [editingContract, setEditingContract] = useState<Contrato | null>(null)
  const [viewingPDF, setViewingPDF] = useState<{ url: string; title: string } | null>(null)
  const [viewingContractDetail, setViewingContractDetail] = useState<Contrato | null>(null)
  const [showProjectAssociation, setShowProjectAssociation] = useState(false)
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fechaInicio', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [jumpToPage, setJumpToPage] = useState('')
  const { showToast } = useToast()

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
    })    // Sort contracts
    filtered.sort((a: Contrato, b: Contrato) => {
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

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage)
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
      setJumpToPage('')
    }
  }

  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show around current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contrato?')) {
      try {
        await deleteContractMutation.mutateAsync(id) // Reactivated delete functionality
        console.log('Contract deleted successfully')
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

  // Contract selection functions
  const handleContractSelect = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId)
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    )
  }

  const handleSelectAllContracts = () => {
    if (selectedContracts.length === paginatedContracts.length) {
      setSelectedContracts([])
    } else {
      setSelectedContracts(paginatedContracts.map((c: Contrato) => c.id))
    }
  }

  // Project association function
  const handleAssociateContracts = async (contractIds: string[], project: Proyecto) => {
    try {
      // Here you would typically call a service to associate contracts with the project
      // For now, we'll just show a success message
      console.log('Associating contracts:', contractIds, 'to project:', project.id)
      
      // In a real implementation, you might:
      // await contractService.associateContractsToProject(contractIds, project.id)
      
      // Clear selections
      setSelectedContracts([])
      setShowProjectAssociation(false)
      
      showToast(`${contractIds.length} contrato(s) asociado(s) al proyecto "${project.nombre}"`, 'success')
    } catch (error) {
      console.error('Error associating contracts:', error)
      throw error
    }
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
          </div>        </div>
      </div>

      {/* Actions Toolbar */}
      {selectedContracts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                {selectedContracts.length} contrato(s) seleccionado(s)
              </span>
              <button
                onClick={() => setSelectedContracts([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Limpiar selección
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowProjectAssociation(true)}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Asociar a Proyecto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContracts.length === paginatedContracts.length && paginatedContracts.length > 0}
                    onChange={handleSelectAllContracts}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
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
                {paginatedContracts.map((contract: Contrato) => (                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedContracts.includes(contract.id)}
                        onChange={() => handleContractSelect(contract.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <button
                          onClick={() => setViewingContractDetail(contract)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                          title="Ver detalles del contrato"
                        >
                          {contract.titulo}
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {contract.descripcion}
                      </div>
                    </td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">                      <div className="flex items-center justify-end space-x-2">                        {contract.pdfUrl && (
                          <button
                            onClick={() => {
                              console.log('Opening PDF:', contract.pdfUrl)
                              setViewingPDF({ url: contract.pdfUrl, title: contract.titulo })
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver PDF"
                          >
                            <DocumentIcon className="h-5 w-5" />
                          </button>
                        )}{canEditContract(contract.organizacionId, contract.proyectoId, contract.id) && (
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

        {/* Pagination */}        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 space-y-3 sm:space-y-0">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">
                Mostrar:
              </label>
              <select
                id="pageSize"
                value={itemsPerPage}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">por página</span>
            </div>

            {/* Mobile pagination */}
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700 flex items-center">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>

            {/* Desktop pagination info */}
            <div className="hidden sm:flex sm:items-center">
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredContracts.length)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{filteredContracts.length}</span>
                {' '}contratos
              </p>
            </div>

            {/* Desktop pagination controls */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {/* Jump to page */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Ir a:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                  className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={currentPage.toString()}
                />
                <button
                  onClick={handleJumpToPage}
                  disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
                  className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ir
                </button>
              </div>

              {/* Page navigation */}
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* First page button */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Primera página"
                >
                  <span className="sr-only">Primera página</span>
                  ⏮
                </button>

                {/* Previous page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {/* Page numbers with smart truncation */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span
                      key={`dots-${index}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 hover:bg-blue-100'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>

                {/* Last page button */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  <span className="sr-only">Última página</span>
                  ⏭
                </button>
              </nav>
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
            // Invalidate contracts cache to refresh the table
            invalidateContracts()
          }}
        />
      )}      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <ContractPDFViewer
          isOpen={!!viewingPDF}
          onClose={() => setViewingPDF(null)}
          pdfUrl={viewingPDF.url}
          contractTitle={viewingPDF.title}        />
      )}      {/* Project Association Modal */}
      {showProjectAssociation && (
        <ContractProjectAssociation
          isOpen={showProjectAssociation}
          onClose={() => setShowProjectAssociation(false)}
          contracts={contracts.filter((c: Contrato) => selectedContracts.includes(c.id))}
          onAssociateContracts={handleAssociateContracts}
          title="Asociar Contratos a Proyecto"
        />
      )}

      {/* Contract Detail Modal */}
      {viewingContractDetail && (
        <ContractDetail
          isOpen={!!viewingContractDetail}
          onClose={() => setViewingContractDetail(null)}
          contract={viewingContractDetail}
        />
      )}
    </div>
  )
}

export default ContractTable
