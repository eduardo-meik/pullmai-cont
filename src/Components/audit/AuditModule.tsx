import React, { useState, useEffect, useMemo } from 'react'
import { 
  ClockIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'
import { useAuditRecords } from '../../hooks/useAuditRecords'
import { formatDateTime } from '../../utils/dateUtils'
import { RegistroAuditoria, AccionAuditoria } from '../../types'
import { AuditService } from '../../services/auditService'

const AuditModule: React.FC = () => {
  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<AccionAuditoria | ''>('')
  const [contratoId, setContratoId] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isCreatingTestRecord, setIsCreatingTestRecord] = useState(false)

  // Memoize the params object to prevent infinite re-renders
  const auditParams = useMemo(() => ({
    searchTerm,
    accion: selectedAction || undefined,
    contratoId: contratoId || undefined,
    usuarioId: usuarioId || undefined,
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined
  }), [searchTerm, selectedAction, contratoId, usuarioId, fechaInicio, fechaFin])

  const {
    records,
    loading,
    error,
    currentPage,
    totalPages,
    totalRecords,
    loadRecords,
    nextPage,
    prevPage
  } = useAuditRecords(auditParams)

  const { stats, loading: statsLoading } = { stats: null, loading: false }

  const actions: AccionAuditoria[] = [
    AccionAuditoria.CREACION,
    AccionAuditoria.MODIFICACION,
    AccionAuditoria.VISUALIZACION,
    AccionAuditoria.DESCARGA,
    AccionAuditoria.ELIMINACION,
    AccionAuditoria.CAMBIO_ESTADO,
    AccionAuditoria.SUBIDA_DOCUMENTO,
    AccionAuditoria.APROBACION,
    AccionAuditoria.RECHAZO
  ]

  const handleApplyFilters = () => {
    loadRecords()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedAction('')
    setContratoId('')
    setUsuarioId('')
    setFechaInicio('')
    setFechaFin('')
  }

  const createTestAuditRecord = async () => {
    if (!usuario || !currentUser) {
      alert('Usuario no autenticado')
      return
    }

    setIsCreatingTestRecord(true)
    try {
      const auditService = AuditService.getInstance()
      
      // First, ensure the user exists in the usuarios collection
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', usuario.id))
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'usuarios', usuario.id), {
            nombre: usuario.nombre,
            apellido: usuario.apellido || '',
            email: usuario.email,
            rol: usuario.rol,
            organizacionId: usuario.organizacionId,
            departamento: usuario.departamento,
            activo: true,
            fechaCreacion: new Date(),
            ultimoAcceso: new Date()
          })
          console.log('Test user created in usuarios collection')
        }
      } catch (userError) {
        console.warn('Error creating/checking user:', userError)
      }
      
      // Create a test audit record with a real contract ID if available
      // For testing purposes, we'll use a placeholder contract ID
      const testContractId = 'test-contract-001'
      
      await auditService.createAuditRecord(
        usuario.id,
        AccionAuditoria.VISUALIZACION,
        `Registro de prueba - Acceso al módulo de auditoría por ${usuario.nombre}`,
        testContractId, // Include a contract ID for testing
        {
          origen: 'test',
          organizacion: usuario.organizacionId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: 'test-ip'
        }
      )
      
      // Reload records to show the new one
      await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay to ensure record is created
      loadRecords()
      alert('Registro de auditoría de prueba creado exitosamente!')
      
    } catch (error) {
      console.error('Error creating test audit record:', error)
      alert('Error al crear el registro de prueba: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsCreatingTestRecord(false)
    }
  }

  const getActionLabel = (action: AccionAuditoria): string => {
    const labels: Record<AccionAuditoria, string> = {
      [AccionAuditoria.CREACION]: 'Creación',
      [AccionAuditoria.MODIFICACION]: 'Modificación',
      [AccionAuditoria.VISUALIZACION]: 'Visualización',
      [AccionAuditoria.DESCARGA]: 'Descarga',
      [AccionAuditoria.ELIMINACION]: 'Eliminación',
      [AccionAuditoria.CAMBIO_ESTADO]: 'Cambio de Estado',
      [AccionAuditoria.SUBIDA_DOCUMENTO]: 'Subida de Documento',
      [AccionAuditoria.APROBACION]: 'Aprobación',
      [AccionAuditoria.RECHAZO]: 'Rechazo'
    }
    return labels[action] || action
  }

  const getActionBadgeColor = (action: AccionAuditoria): string => {
    if (action === AccionAuditoria.CREACION) return 'bg-green-100 text-green-800'
    if (action === AccionAuditoria.MODIFICACION) return 'bg-blue-100 text-blue-800'
    if (action === AccionAuditoria.ELIMINACION) return 'bg-red-100 text-red-800'
    if (action === AccionAuditoria.APROBACION) return 'bg-purple-100 text-purple-800'
    if (action === AccionAuditoria.DESCARGA) return 'bg-green-100 text-green-800'
    if (action === AccionAuditoria.VISUALIZACION) return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Determine what details to show based on user role
  const getUserRole = () => {
    // For now, return a default role since currentUser from Firebase Auth doesn't have custom claims
    // This should be implemented when proper user management is in place
    return 'ORG_ADMIN'
  }

  const shouldShowUserDetails = (record: RegistroAuditoria): boolean => {
    const userRole = getUserRole()
    
    // SUPER_ADMIN sees everything
    if (userRole === 'SUPER_ADMIN') return true
    
    // ORG_ADMIN and MANAGER see all details for their org
    if (userRole === 'ORG_ADMIN' || userRole === 'MANAGER') return true
    
    // USER only sees their own details
    if (userRole === 'USER') {
      return record.usuarioId === currentUser?.uid
    }
    
    return false
  }

  const shouldShowActionDetails = (record: RegistroAuditoria): boolean => {
    const userRole = getUserRole()
    
    // SUPER_ADMIN sees everything
    if (userRole === 'SUPER_ADMIN') return true
    
    // ORG_ADMIN and MANAGER see all action details
    if (userRole === 'ORG_ADMIN' || userRole === 'MANAGER') return true
    
    // USER only sees limited details
    return false
  }

  // Load records on mount
  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Debug logging
  useEffect(() => {
    console.log('AuditModule Debug Info:')
    console.log('currentUser:', currentUser)
    console.log('usuario from store:', usuario)
    console.log('records:', records)
    console.log('loading:', loading)
    console.log('error:', error)
  }, [currentUser, usuario, records, loading, error])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Registro de Auditoría
                </h1>
                <p className="text-sm text-gray-500">
                  Historial de actividades y cambios en el sistema
                </p>
              </div>
            </div>
            
            {/* Debug: Test button to create audit records */}
            {usuario && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  Usuario: {usuario.nombre} ({usuario.organizacionId})
                </div>
                <button
                  onClick={createTestAuditRecord}
                  disabled={isCreatingTestRecord}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTestRecord ? 'Creando...' : 'Crear Registro Prueba'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics - Disabled for now */}
      {false && !statsLoading && stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Registros
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Registros Hoy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Esta Semana
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Este Mes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros de Búsqueda</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar en registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Buscar
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acción
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as AccionAuditoria | '')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas las acciones</option>
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {getActionLabel(action)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Contrato
                </label>
                <input
                  type="text"
                  value={contratoId}
                  onChange={(e) => setContratoId(e.target.value)}
                  placeholder="ID del contrato"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Usuario
                </label>
                <input
                  type="text"
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                  placeholder="ID del usuario"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Registros de Auditoría
            {totalRecords > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({totalRecords} registros)
              </span>
            )}
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay registros
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron registros de auditoría con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(record.accion)}`}
                      >
                        {getActionLabel(record.accion)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(record.fecha)}
                      </span>
                      {(record.contratoContraparte || record.organizacionNombre) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          Contraparte: {record.contratoContraparte || record.organizacionNombre}
                        </span>
                      )}
                    </div>
                    {shouldShowUserDetails(record) && (
                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <span className="font-medium">
                          {record.usuarioNombre || `Usuario: ${record.usuarioId}`}
                        </span>
                        {record.usuarioEmail && (
                          <span className="text-xs text-gray-400">
                            {record.usuarioEmail}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {record.descripcion && (
                    <p className="mt-2 text-sm text-gray-700">
                      {record.descripcion}
                    </p>
                  )}

                  {shouldShowActionDetails(record) && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-gray-500">
                      {record.contratoId && (
                        <div>
                          <span className="font-medium">Contrato:</span> 
                          {record.contratoTitulo ? (
                            <span className="ml-1">{record.contratoTitulo}</span>
                          ) : (
                            <span className="ml-1 text-gray-400">{record.contratoId}</span>
                          )}
                        </div>
                      )}
                      {record.contratoProyecto && (
                        <div>
                          <span className="font-medium">Proyecto:</span> {record.contratoProyecto}
                        </div>
                      )}
                      {record.metadatos?.contraparteId && (
                        <div>
                          <span className="font-medium">Contraparte:</span> {record.metadatos.contraparteId}
                        </div>
                      )}
                      {record.ipAddress && (
                        <div>
                          <span className="font-medium">IP:</span> {record.ipAddress}
                        </div>
                      )}
                      {record.userAgent && (
                        <div className="sm:col-span-3">
                          <span className="font-medium">User Agent:</span> {record.userAgent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditModule