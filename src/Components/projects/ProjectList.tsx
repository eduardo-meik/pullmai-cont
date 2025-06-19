import React from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import { EstadoProyecto, PrioridadProyecto } from '../../types'
import LoadingSpinner from '../ui/LoadingSpinner'

const ProjectList: React.FC = () => {
  const { proyectos, loading, error } = useProjects()

  if (loading) {
    return (      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error cargando proyectos</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proyectos</h2>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea todos los proyectos de la organización
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Nuevo Proyecto
        </button>
      </div>

      {/* Grid de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.map((proyecto) => {
          const progreso = calcularProgreso(proyecto.presupuestoGastado, proyecto.presupuestoTotal)
          
          return (
            <Link
              key={proyecto.id}
              to={`/projects/${proyecto.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              {/* Header del proyecto */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${proyecto.color}20`, color: proyecto.color }}
                  >
                    {proyecto.icono}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                      {proyecto.nombre}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {proyecto.departamento}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {proyecto.descripcion}
              </p>

              {/* Estados y prioridad */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(proyecto.estado)}`}>
                  {proyecto.estado.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(proyecto.prioridad)}`}>
                  {proyecto.prioridad}
                </span>
              </div>

              {/* Métricas principales */}
              <div className="space-y-3">
                {/* Presupuesto */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Presupuesto</span>
                    <span className="text-sm font-medium text-gray-900">
                      {progreso}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(progreso, 100)}%`,
                        backgroundColor: progreso > 90 ? '#EF4444' : progreso > 70 ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatCurrency(proyecto.presupuestoGastado, proyecto.moneda)}</span>
                    <span>{formatCurrency(proyecto.presupuestoTotal, proyecto.moneda)}</span>
                  </div>
                </div>

                {/* Contratos */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contratos</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {proyecto.contratosActivos} activos
                    </span>
                    <span className="text-gray-500">
                      {proyecto.numeroContratos} total
                    </span>
                  </div>
                </div>

                {/* Valor total contratos */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor contratos</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(proyecto.valorTotalContratos, proyecto.moneda)}
                  </span>
                </div>
              </div>

              {/* Footer con fechas */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Inicio: {proyecto.fechaInicio.toLocaleDateString('es-CL')}
                  </span>
                  {proyecto.fechaFinEstimada && (
                    <span>
                      Fin: {proyecto.fechaFinEstimada.toLocaleDateString('es-CL')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Estado vacío */}
      {proyectos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay proyectos
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza creando tu primer proyecto para organizar los contratos
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Crear Primer Proyecto
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectList
