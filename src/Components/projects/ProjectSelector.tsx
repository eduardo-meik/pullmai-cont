import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  XMarkIcon,
  FolderIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useProjects } from '../../hooks/useProjects'
import { Proyecto, EstadoProyecto, PrioridadProyecto } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface ProjectSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: (project: Proyecto) => void
  onCreateProject: (projectData: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>) => void
  selectedProjectId?: string
  title?: string
  allowCreate?: boolean
}

interface NewProjectForm {
  nombre: string
  descripcion: string
  estado: EstadoProyecto
  prioridad: PrioridadProyecto
  fechaInicio: string
  fechaFinEstimada: string
  presupuestoTotal: number
  moneda: string
  departamento: string
  etiquetas: string[]
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onCreateProject,
  selectedProjectId,
  title = "Seleccionar Proyecto",
  allowCreate = true
}) => {  const { data: proyectos, isLoading: loading, error } = useProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>({
    nombre: '',
    descripcion: '',
    estado: EstadoProyecto.PLANIFICACION,
    prioridad: PrioridadProyecto.MEDIA,
    fechaInicio: '',
    fechaFinEstimada: '',
    presupuestoTotal: 0,
    moneda: 'CLP',
    departamento: '',
    etiquetas: []
  })
  const projects = proyectos || []

  // Filter projects based on search term
  const filteredProjects = projects.filter((project: Proyecto) =>
    project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = async () => {
    if (!newProjectForm.nombre.trim()) return

    const projectData = {
      ...newProjectForm,
      fechaInicio: new Date(newProjectForm.fechaInicio),
      fechaFinEstimada: newProjectForm.fechaFinEstimada ? new Date(newProjectForm.fechaFinEstimada) : undefined,
      presupuestoGastado: 0,
      responsableId: 'current-user-id', // Should come from auth context
      organizacionId: 'org_001', // Should come from auth context
      equipoIds: [],
      numeroContratos: 0,
      valorTotalContratos: 0,
      contratosActivos: 0,
      contratosPendientes: 0,
      color: '#3B82F6',
      icono: 'folder',
      creadoPor: 'current-user-id',
      modificadoPor: 'current-user-id'
    }

    await onCreateProject(projectData)
    setShowCreateForm(false)
    resetForm()
  }

  const resetForm = () => {
    setNewProjectForm({
      nombre: '',
      descripcion: '',
      estado: EstadoProyecto.PLANIFICACION,
      prioridad: PrioridadProyecto.MEDIA,
      fechaInicio: '',
      fechaFinEstimada: '',
      presupuestoTotal: 0,
      moneda: 'CLP',
      departamento: '',
      etiquetas: []
    })
  }

  const getStatusBadge = (estado: EstadoProyecto) => {
    const colors = {
      [EstadoProyecto.PLANIFICACION]: 'bg-blue-100 text-blue-800',
      [EstadoProyecto.EN_CURSO]: 'bg-green-100 text-green-800',
      [EstadoProyecto.PAUSADO]: 'bg-yellow-100 text-yellow-800',
      [EstadoProyecto.COMPLETADO]: 'bg-gray-100 text-gray-800',
      [EstadoProyecto.CANCELADO]: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[estado]}`}>
        {estado.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (prioridad: PrioridadProyecto) => {
    const colors = {
      [PrioridadProyecto.BAJA]: 'bg-gray-100 text-gray-800',
      [PrioridadProyecto.MEDIA]: 'bg-blue-100 text-blue-800',
      [PrioridadProyecto.ALTA]: 'bg-orange-100 text-orange-800',
      [PrioridadProyecto.CRITICA]: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[prioridad]}`}>
        {prioridad}
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(80vh-120px)] overflow-y-auto">
          {!showCreateForm ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Create Project Button */}
              {allowCreate && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Crear Nuevo Proyecto
                  </Button>
                </div>
              )}

              {/* Projects List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando proyectos...</p>
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="space-y-3">
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onSelectProject(project)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedProjectId === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FolderIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">{project.nombre}</h3>
                              {selectedProjectId === project.id && (
                                <CheckIcon className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.descripcion}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusBadge(project.estado)}
                              {getPriorityBadge(project.prioridad)}
                              <span className="text-xs text-gray-500">
                                {project.numeroContratos} contratos
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {project.presupuestoTotal.toLocaleString()} {project.moneda}
                          </p>
                          <p className="text-xs text-gray-500">{project.departamento}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron proyectos</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mt-1">
                      Intenta con términos de búsqueda diferentes
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Create Project Form */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium">Crear Nuevo Proyecto</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Nombre del Proyecto"
                    value={newProjectForm.nombre}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, nombre: e.target.value })}
                    placeholder="Ingresa el nombre del proyecto"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newProjectForm.descripcion}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el proyecto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={newProjectForm.estado}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, estado: e.target.value as EstadoProyecto })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(EstadoProyecto).map(estado => (
                      <option key={estado} value={estado}>
                        {estado.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newProjectForm.prioridad}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, prioridad: e.target.value as PrioridadProyecto })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(PrioridadProyecto).map(prioridad => (
                      <option key={prioridad} value={prioridad}>
                        {prioridad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Fecha de Inicio"
                    type="date"
                    value={newProjectForm.fechaInicio}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, fechaInicio: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Fecha Fin Estimada"
                    type="date"
                    value={newProjectForm.fechaFinEstimada}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, fechaFinEstimada: e.target.value })}
                  />
                </div>

                <div>
                  <Input
                    label="Presupuesto Total"
                    type="number"
                    value={newProjectForm.presupuestoTotal}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, presupuestoTotal: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Input
                    label="Departamento"
                    value={newProjectForm.departamento}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, departamento: e.target.value })}
                    placeholder="Ej: IT, Marketing, Ventas"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateProject} disabled={!newProjectForm.nombre.trim()}>
                  Crear Proyecto
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ProjectSelector
