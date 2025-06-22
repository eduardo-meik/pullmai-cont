import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProject, useProjects } from '../../hooks/useProjects'
import { useDeleteContract, useUnlinkContractFromProject } from '../../hooks/useContracts'
import { EstadoProyecto, PrioridadProyecto, EstadoContrato } from '../../types'
import LoadingSpinner from '../ui/LoadingSpinner'
import ContractCard from '../contracts/ContractCard'
import { useToast } from '../../contexts/ToastContext'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { proyecto, contratos, estadisticas, loading, error, refetch } = useProject(id!)
  const { eliminarProyecto } = useProjects()
  const unlinkContractMutation = useUnlinkContractFromProject()
  const { showToast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteProject = async () => {
    if (!proyecto) return
    
    setIsDeleting(true)
    try {
      await eliminarProyecto(proyecto.id)
      showToast('Proyecto eliminado exitosamente', 'success')
      navigate('/projects')
    } catch (error) {
      console.error('Error eliminando proyecto:', error)
      showToast('Error al eliminar el proyecto', 'error')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteContract = async (contractId: string) => {
    try {
      await unlinkContractMutation.mutateAsync(contractId)
      await refetch() // Refresh project/contracts after unlink
    } catch (error) {
      console.error('Error desvinculando contrato del proyecto:', error)
      // Error toast will be shown by the hook automatically
    }
  }

  if (loading) {
    return (      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error cargando proyecto</div>
        <div className="text-red-600 text-sm mt-1">{error || 'Proyecto no encontrado'}</div>
      </div>
    )
  }

  const getEstadoColor = (estado: EstadoProyecto): string => {
    switch (estado) {
      case EstadoProyecto.PLANIFICACION:
        return 'bg-blue-100 text-blue-800'
      case EstadoProyecto.EN_CURSO:
        return 'bg-green-100 text-green-800'
      case EstadoProyecto.PAUSADO:
        return 'bg-yellow-100 text-yellow-800'
      case EstadoProyecto.COMPLETADO:
        return 'bg-emerald-100 text-emerald-800'
      case EstadoProyecto.CANCELADO:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadColor = (prioridad: PrioridadProyecto): string => {
    switch (prioridad) {
      case PrioridadProyecto.BAJA:
        return 'bg-gray-100 text-gray-700'
      case PrioridadProyecto.MEDIA:
        return 'bg-blue-100 text-blue-700'
      case PrioridadProyecto.ALTA:
        return 'bg-orange-100 text-orange-700'
      case PrioridadProyecto.CRITICA:
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'CLP'): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calcularProgreso = (gastado: number, total: number): number => {
    return total > 0 ? Math.round((gastado / total) * 100) : 0
  }

  const progreso = calcularProgreso(proyecto.presupuestoGastado, proyecto.presupuestoTotal)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/projects" className="text-gray-500 hover:text-gray-700">
              Proyectos
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li className="text-gray-900 font-medium">
            {proyecto.nombre}
          </li>
        </ol>
      </nav>

      {/* Header del proyecto */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${proyecto.color}20`, color: proyecto.color }}
            >
              {proyecto.icono}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {proyecto.nombre}
              </h1>
              <p className="text-gray-500 mt-1">
                {proyecto.departamento} • {proyecto.responsableId}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(proyecto.estado)}`}>
                  {proyecto.estado.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPrioridadColor(proyecto.prioridad)}`}>
                  Prioridad {proyecto.prioridad}
                </span>
              </div>
            </div>
          </div>          <div className="flex space-x-3">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Editar
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Eliminar
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Nuevo Contrato
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-700 text-base leading-relaxed">
            {proyecto.descripcion}
          </p>
        </div>

        {/* Etiquetas */}
        {proyecto.etiquetas.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {proyecto.etiquetas.map((etiqueta, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {etiqueta}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contratos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas?.totalContratos || 0}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contratos Activos</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas?.contratosActivos || 0}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(estadisticas?.valorTotal || 0, proyecto.moneda)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Por Vencer</p>
              <p className="text-2xl font-bold text-orange-600">{estadisticas?.contratosPorVencer || 0}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del proyecto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información general */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Proyecto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Fechas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio:</span>
                  <span className="text-gray-900">{proyecto.fechaInicio.toLocaleDateString('es-CL')}</span>
                </div>
                {proyecto.fechaFinEstimada && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin estimado:</span>
                    <span className="text-gray-900">{proyecto.fechaFinEstimada.toLocaleDateString('es-CL')}</span>
                  </div>
                )}
                {proyecto.fechaFinReal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin real:</span>
                    <span className="text-gray-900">{proyecto.fechaFinReal.toLocaleDateString('es-CL')}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Equipo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Responsable:</span>
                  <span className="text-gray-900">{proyecto.responsableId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Miembros:</span>
                  <span className="text-gray-900">{proyecto.equipoIds.length} personas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progreso presupuestario */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Presupuesto
          </h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {progreso}%
              </div>
              <div className="text-sm text-gray-600">
                Ejecutado
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(progreso, 100)}%`,
                  backgroundColor: progreso > 90 ? '#EF4444' : progreso > 70 ? '#F59E0B' : '#10B981'
                }}
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gastado:</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(proyecto.presupuestoGastado, proyecto.moneda)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Presupuesto:</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(proyecto.presupuestoTotal, proyecto.moneda)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Disponible:</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(proyecto.presupuestoTotal - proyecto.presupuestoGastado, proyecto.moneda)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de contratos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Contratos del Proyecto ({contratos.length})
          </h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Nuevo Contrato
          </button>
        </div>

        {contratos.length > 0 ? (          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contratos.map((contrato) => (
              <ContractCard 
                key={contrato.id} 
                contrato={contrato} 
                onEliminar={() => handleDeleteContract(contrato.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📄</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay contratos
            </h4>
            <p className="text-gray-600 mb-4">
              Este proyecto aún no tiene contratos asociados
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Crear Primer Contrato
            </button>
          </div>        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar eliminación
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar el proyecto <strong>"{proyecto?.nombre}"</strong>? 
              Se eliminarán todos los datos asociados, incluyendo contratos y documentos.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Eliminar Proyecto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
