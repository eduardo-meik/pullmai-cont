import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FolderIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useProjects, useProjectOperations } from '../../hooks/useProjects'
import { Proyecto, EstadoProyecto, PrioridadProyecto } from '../../types'
import { useToast } from '../../contexts/ToastContext'
import { useAuthStore } from '../../stores/authStore'

interface ProjectSelectProps {
  selectedProject?: Proyecto | null
  onProjectSelect: (project: Proyecto | null) => void
  placeholder?: string
  showCreateOption?: boolean
  className?: string
  disabled?: boolean
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
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  selectedProject,
  onProjectSelect,
  placeholder = "Seleccionar proyecto",
  showCreateOption = false,
  className = "",
  disabled = false
}) => {
  const { data: proyectos, isLoading: loading, error } = useProjects()
  const { crearProyecto } = useProjectOperations()
  const { usuario } = useAuthStore()
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
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
    departamento: ''
  })

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter projects based on search term
  const filteredProjects = (proyectos || []).filter(project =>
    project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProjectSelect = (project: Proyecto) => {
    onProjectSelect(project)
    setIsOpen(false)
    setSearchTerm('')
  }
  const handleCreateProject = async () => {
    if (!newProjectForm.nombre.trim()) {
      showToast('El nombre del proyecto es requerido', 'error')
      return
    }

    if (!usuario) {
      showToast('Usuario no autenticado', 'error')
      return
    }

    try {
      // Create project using the real service
      const proyectoData: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'> = {
        nombre: newProjectForm.nombre,
        descripcion: newProjectForm.descripcion,
        estado: newProjectForm.estado,
        prioridad: newProjectForm.prioridad,
        fechaInicio: newProjectForm.fechaInicio ? new Date(newProjectForm.fechaInicio) : new Date(),
        fechaFinEstimada: newProjectForm.fechaFinEstimada ? new Date(newProjectForm.fechaFinEstimada) : undefined,
        presupuestoTotal: newProjectForm.presupuestoTotal,
        presupuestoGastado: 0,
        moneda: newProjectForm.moneda,
        responsableId: usuario.id,
        organizacionId: usuario.organizacionId || 'org-001', // TODO: Get from user service
        departamento: newProjectForm.departamento,
        equipoIds: [],
        numeroContratos: 0,
        valorTotalContratos: 0,
        contratosActivos: 0,
        contratosPendientes: 0,
        etiquetas: [],
        creadoPor: usuario.id,
        modificadoPor: usuario.id,
        icono: '📁',
        color: '#3B82F6'
      }

      const projectId: string = `temp-${Date.now()}` // Generate temporary ID since mutation returns void
      
      // Create the complete project object to return
      const newProject: Proyecto = {
        id: projectId,
        ...proyectoData,
        fechaCreacion: new Date(),
        fechaUltimaModificacion: new Date(),
        version: 1
      }

      onProjectSelect(newProject)
      setIsOpen(false)
      setShowCreateForm(false)
      setSearchTerm('')
        // Reset form
      setNewProjectForm({
        nombre: '',
        descripcion: '',
        estado: EstadoProyecto.PLANIFICACION,
        prioridad: PrioridadProyecto.MEDIA,
        fechaInicio: '',
        fechaFinEstimada: '',
        presupuestoTotal: 0,
        moneda: 'CLP',
        departamento: ''
      })

      showToast('Proyecto creado exitosamente', 'success')
    } catch (error) {
      showToast('Error al crear el proyecto', 'error')
    }
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onProjectSelect(null)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            {selectedProject ? (
              <>
                <FolderIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-gray-900 truncate">{selectedProject.nombre}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center">
            {selectedProject && !disabled && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1 text-gray-400 hover:text-gray-600 mr-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden"
          >
            {showCreateForm ? (
              /* Create Project Form */
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Crear Nuevo Proyecto</h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre del proyecto *"
                      value={newProjectForm.nombre}
                      onChange={(e) => setNewProjectForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      placeholder="Descripción (opcional)"
                      value={newProjectForm.descripcion}
                      onChange={(e) => setNewProjectForm(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newProjectForm.estado}
                      onChange={(e) => setNewProjectForm(prev => ({ ...prev, estado: e.target.value as EstadoProyecto }))}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.values(EstadoProyecto).map(estado => (
                        <option key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={newProjectForm.prioridad}
                      onChange={(e) => setNewProjectForm(prev => ({ ...prev, prioridad: e.target.value as PrioridadProyecto }))}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.values(PrioridadProyecto).map(prioridad => (
                        <option key={prioridad} value={prioridad}>
                          {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Project List */
              <>
                {/* Search */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar proyectos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      Cargando proyectos...
                    </div>
                  ) : error ? (
                    <div className="p-3 text-center text-sm text-red-500">
                      Error al cargar proyectos
                    </div>
                  ) : (
                    <>
                      {/* Create New Option */}
                      {showCreateOption && (
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(true)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-blue-600"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Crear nuevo proyecto
                        </button>
                      )}

                      {/* Clear Selection Option */}
                      {selectedProject && (
                        <button
                          type="button"
                          onClick={() => handleProjectSelect(null as any)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-gray-600"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Sin proyecto
                        </button>
                      )}

                      {/* Project Options */}
                      {filteredProjects.length === 0 && searchTerm ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          No se encontraron proyectos
                        </div>
                      ) : (
                        filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleProjectSelect(project)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center flex-1">
                              <FolderIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{project.nombre}</div>
                                {project.descripcion && (
                                  <div className="text-xs text-gray-500 truncate">{project.descripcion}</div>
                                )}
                              </div>
                            </div>
                            {selectedProject?.id === project.id && (
                              <CheckIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectSelect
