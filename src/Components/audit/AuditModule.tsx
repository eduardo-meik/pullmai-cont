import React, { useState, useEffect } from 'react'
import {
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types'

interface AuditEntry {
  id: string
  timestamp: Date
  action: string
  resource: string
  resourceId: string
  userId: string
  userName: string
  userEmail: string
  organizationId: string
  details: Record<string, any>
  ipAddress?: string
}

type FilterType = 'all' | 'create' | 'update' | 'delete' | 'view' | 'login'
type TimeRange = '24h' | '7d' | '30d' | '90d' | 'custom'

const AuditModule: React.FC = () => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()

  const canViewAudit = usuario?.rol === UserRole.ORG_ADMIN || usuario?.rol === UserRole.SUPER_ADMIN

  const actionTypes = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'create', label: 'Creación' },
    { value: 'update', label: 'Actualización' },
    { value: 'delete', label: 'Eliminación' },
    { value: 'view', label: 'Visualización' },
    { value: 'login', label: 'Inicio de sesión' }
  ]

  const timeRanges = [
    { value: '24h', label: 'Últimas 24 horas' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: 'custom', label: 'Rango personalizado' }
  ]

  useEffect(() => {
    if (canViewAudit) {
      // TODO: Load audit entries from service
      // For now, we'll use mock data
      setIsLoading(true)
      setTimeout(() => {
        setAuditEntries([])
        setIsLoading(false)
      }, 1000)
    }
  }, [canViewAudit])

  useEffect(() => {
    let filtered = auditEntries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.resource.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by action type
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.action.toLowerCase().includes(filterType))
    }

    setFilteredEntries(filtered)
  }, [auditEntries, searchTerm, filterType])

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp)
  }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 bg-green-50'
    if (action.includes('update')) return 'text-blue-600 bg-blue-50'
    if (action.includes('delete')) return 'text-red-600 bg-red-50'
    if (action.includes('view')) return 'text-gray-600 bg-gray-50'
    if (action.includes('login')) return 'text-purple-600 bg-purple-50'
    return 'text-gray-600 bg-gray-50'
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting audit data...')
  }

  if (!canViewAudit) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <DocumentMagnifyingGlassIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <div className="text-yellow-800 text-lg font-medium mb-2">
              Acceso Restringido
            </div>
            <p className="text-yellow-700">
              No tienes permisos para acceder al módulo de auditoría.
            </p>
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
                <DocumentMagnifyingGlassIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
                <p className="text-gray-600">Registro completo de actividades y cambios</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por usuario, acción..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acción
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {actionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Mostrando {filteredEntries.length} de {auditEntries.length} registros
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {timeRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Cargando registros de auditoría...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentMagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin registros de auditoría</h3>
              <p className="text-gray-600 mb-4">
                {auditEntries.length === 0 
                  ? 'No hay registros de auditoría para mostrar'
                  : 'No se encontraron registros que coincidan con los filtros aplicados'
                }
              </p>
              
              {/* Coming Soon Features */}
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Próximas Funcionalidades</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>• Registro automático de actividades</div>
                  <div>• Filtros avanzados por usuario</div>
                  <div>• Exportación a Excel/PDF</div>
                  <div>• Alertas de actividad sospechosa</div>
                  <div>• Retención configurable de logs</div>
                  <div>• Dashboard de métricas de auditoría</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(entry.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.resource}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {JSON.stringify(entry.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditModule
