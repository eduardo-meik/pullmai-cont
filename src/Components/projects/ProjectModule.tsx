import React, { useState } from 'react'
import { useProjects, useProjectOperations } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores/authStore'
import { Proyecto } from '../../types'
import ProjectList from './ProjectList'
import ProjectForm from './ProjectForm'
import ProjectDetail from './ProjectDetail'
import { useToast } from '../../contexts/ToastContext'

type ProjectView = 'list' | 'form' | 'detail'

const ProjectModule: React.FC = () => {
  const { usuario } = useAuthStore()
  const { data: proyectos, isLoading: loadingProjects, error, refetch } = useProjects(usuario?.organizacionId)
  const { crearProyecto, actualizarProyecto, isCreating, isUpdating } = useProjectOperations()
  const { showTypedToast } = useToast()
  
  const [currentView, setCurrentView] = useState<ProjectView>('list')
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null)

  const handleCreateProject = () => {
    setSelectedProject(null)
    setCurrentView('form')
  }

  const handleEditProject = (project: Proyecto) => {
    setSelectedProject(project)
    setCurrentView('form')
  }

  const handleViewProject = (project: Proyecto) => {
    setSelectedProject(project)
    setCurrentView('detail')
  }

  const handleFormSubmit = async (projectData: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>) => {
    try {
      if (selectedProject) {
        // Editar proyecto existente
        await actualizarProyecto({ id: selectedProject.id, cambios: projectData })
      } else {
        // Crear nuevo proyecto
        await crearProyecto(projectData)
      }
      setCurrentView('list')
      setSelectedProject(null)
    } catch (error) {
      console.error('Error saving project:', error)
      throw error // Re-throw para que ProjectForm pueda manejarlo
    }
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedProject(null)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'form':
        return (
          <ProjectForm
            proyecto={selectedProject}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={selectedProject ? isUpdating : isCreating}
          />
        )
      case 'detail':
        return selectedProject ? (
          <ProjectDetail />        ) : null
      case 'list':
      default:
        return (
          <ProjectList />
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderCurrentView()}
    </div>
  )
}

export default ProjectModule
