import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProject, useProjects } from '../../hooks/useProjects'
import { useDeleteContract, useUnlinkContractFromProject } from '../../hooks/useContracts'
import { EstadoProyecto, PrioridadProyecto, EstadoContrato, CategoriaContrato, Periodicidad, TipoEconomico } from '../../types'
import LoadingSpinner from '../ui/LoadingSpinner'
import ContractCard from '../contracts/ContractCard'
import { useToast } from '../../contexts/ToastContext'
import ContractSelectModal from '../contracts/ContractSelectModal'
import ContractForm from '../contracts/ContractForm'
import ProjectForm from './ProjectForm'
import { useMutation } from '@tanstack/react-query'
import { contractService } from '../../services/contractService'
import { ProjectService } from '../../services/projectService'
import { useAuth } from '../../contexts/AuthContext'
import { ContratoYaVinculadoError } from '../../services/contractService'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { proyecto, contratos, estadisticas, loading, error, refetch } = useProject(id!)
  const { eliminarProyecto } = useProjects()
  const unlinkContractMutation = useUnlinkContractFromProject()
  const { showToast } = useToast()
  const { currentUser } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showContractForm, setShowContractForm] = useState(false)
  const [showContractSelect, setShowContractSelect] = useState(false)
  
  const linkContractMutation = useMutation({
    mutationFn: async (contrato: any) => {
      await contractService.actualizarContrato(contrato.id, {
        proyectoId: proyecto?.id || '',
        proyecto: proyecto?.nombre || '',
      }, currentUser?.uid || '')
    },
    onSuccess: async () => {
      await refetch()
      setShowContractSelect(false)
      showToast('Contrato agregado al proyecto', 'success')
    },
    onError: (error: any) => {
      if (error?.name === 'ContratoYaVinculadoError') {
        showToast('Este contrato ya está vinculado a otro proyecto. Desvincúlalo antes de asociarlo a este proyecto.', 'error')
      } else {
        showToast('Error al agregar contrato', 'error')
      }
    }
  })
  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (!proyecto) throw new Error('No project to update')
      await ProjectService.actualizarProyecto(proyecto.id, projectData)
    },
    onSuccess: async () => {
      await refetch()
      setShowEditForm(false)
      showToast('Proyecto actualizado exitosamente', 'success')
    },
    onError: (error: any) => {
      console.error('Error updating project:', error)
      showToast('Error al actualizar el proyecto', 'error')
    }
  })

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      if (!proyecto) throw new Error('No project to delete')
      
      // Only delete the project, not the contracts
      // Contracts will be unlinked automatically by the service
      await eliminarProyecto(proyecto.id)
    },
    onSuccess: () => {
      showToast('Proyecto eliminado exitosamente. Los contratos han sido desvinculados.', 'success')
      navigate('/projects')
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error)
      showToast('Error al eliminar el proyecto', 'error')
    }
  })

  const handleEditProject = async (projectData: any) => {
    return new Promise<void>((resolve, reject) => {
      updateProjectMutation.mutate(projectData, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error)
      })
    })
  }

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate()
    setShowDeleteConfirm(false)
  }

  const handleCreateContract = () => {
    setShowContractForm(false)
    refetch() // Refresh the project data to show the new contract
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

  const handleAddContractToProject = (contrato: any) => {
    linkContractMutation.mutate(contrato)
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
            <button 
              onClick={() => setShowEditForm(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Editar
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Eliminar
            </button>
            <button 
              onClick={() => setShowContractForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Nuevo Contrato
            </button>
            <button 
              onClick={() => setShowContractSelect(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Vincular Contrato
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
              {proyecto.etiquetas.map((etiqueta) => (
                <span key={etiqueta} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {etiqueta}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progreso financiero */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              Presupuesto: {formatCurrency(proyecto.presupuestoTotal)}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Gastado: {formatCurrency(proyecto.presupuestoGastado)}
            </div>
          </div>
          <div className="mt-2 h-2.5 bg-gray-200 rounded-full">
            <div
              className="h-2.5 bg-green-600 rounded-full"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Estadísticas del proyecto */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Estadísticas del Proyecto
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-700 text-sm font-medium">
              Presupuesto Total
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatCurrency(proyecto.presupuestoTotal)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-700 text-sm font-medium">
              Presupuesto Gastado
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatCurrency(proyecto.presupuestoGastado)}
            </div>
          </div>          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-700 text-sm font-medium">
              Contratos Activos
            </div>
            <div className="mt-1 text-2xl font-bold">
              {estadisticas?.contratosActivos || 0}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-red-700 text-sm font-medium">
              Contratos Finalizados
            </div>
            <div className="mt-1 text-2xl font-bold">
              {estadisticas?.contratosVencidos || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de contratos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Contratos Asociados
          </h2>
          <button 
            onClick={() => setShowContractSelect(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Agregar Contrato
          </button>
        </div>

        <div className="mt-4">
          {contratos.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No hay contratos asociados a este proyecto.
            </div>
          ) : (            <div className="space-y-4">
              {contratos.map((contrato) => (
                <ContractCard
                  key={contrato.id}
                  contrato={contrato}
                  onEliminar={() => handleDeleteContract(contrato.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmar Eliminación del Proyecto
            </h3>
            <div className="text-gray-700 text-sm mt-3 space-y-2">
              <p>¿Estás seguro de que deseas eliminar este proyecto?</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 font-medium text-xs">
                  ⚠️ Importante:
                </p>
                <ul className="text-yellow-700 text-xs mt-1 space-y-1">
                  <li>• El proyecto será eliminado permanentemente</li>
                  <li>• Los contratos asociados NO serán eliminados</li>
                  <li>• Los contratos quedarán desvinculados del proyecto</li>
                  <li>• Esta acción no se puede deshacer</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleteProjectMutation.isPending}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  deleteProjectMutation.isPending
                    ? 'bg-red-300 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {deleteProjectMutation.isPending ? 'Eliminando...' : 'Eliminar Proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}      {/* Modal para seleccionar contrato existente */}
      {showContractSelect && (
        <ContractSelectModal
          isOpen={showContractSelect}
          onClose={() => setShowContractSelect(false)}
          onSelect={handleAddContractToProject}
          proyecto={proyecto}
        />
      )}

      {/* Modal para editar proyecto */}
      {showEditForm && proyecto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Proyecto</h2>
              <ProjectForm
                proyecto={proyecto}
                onSubmit={handleEditProject}
                onCancel={() => setShowEditForm(false)}
                isLoading={updateProjectMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}      {/* Modal para crear nuevo contrato */}
      {showContractForm && proyecto && (
        <ContractForm
          isOpen={showContractForm}
          onClose={() => setShowContractForm(false)}
          onSuccess={handleCreateContract}
          contractToEdit={{
            titulo: '',
            descripcion: '',
            contraparte: '',
            fechaInicio: '',
            fechaTermino: '',
            monto: 0,
            moneda: 'CLP',
            categoria: 'SERVICIOS' as CategoriaContrato,
            periodicidad: 'UNICO' as Periodicidad,
            tipo: 'EGRESO' as TipoEconomico,
            proyecto: proyecto.nombre,
            proyectoId: proyecto.id,
            estado: 'BORRADOR' as EstadoContrato,
            departamento: proyecto.departamento || '',
            etiquetas: []
          }}
        />
      )}
    </div>
  )
}

export default ProjectDetail
