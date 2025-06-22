import React, { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores/authStore'
import { Proyecto } from '../../types'
import ProjectList from './ProjectList'
import ProjectForm from './ProjectForm'
import ProjectDetail from './ProjectDetail'
import { useToast } from '../../contexts/ToastContext'

type ProjectView = 'list' | 'form' | 'detail'

const ProjectModule: React.FC = () => {
  const { usuario } = useAuthStore()
  const { crearProyecto, actualizarProyecto, refetchProjects } = useProjects(usuario?.organizacionId)
  const { showToast } = useToast()
  
  const [currentView, setCurrentView] = useState<ProjectView>('list')
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    try {
      if (selectedProject) {
        // Editar proyecto existente
        await actualizarProyecto(selectedProject.id, projectData)
      } else {
        // Crear nuevo proyecto
        await crearProyecto(projectData)
      }
      await refetchProjects() // Force refresh after create/edit
      setCurrentView('list')
      setSelectedProject(null)
    } catch (error) {
      console.error('Error saving project:', error)
      throw error // Re-throw para que ProjectForm pueda manejarlo
    } finally {
      setIsLoading(false)
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
            isLoading={isLoading}
          />
        )
      case 'detail':
        return selectedProject ? (
          <ProjectDetail 
            projectId={selectedProject.id}
            onEdit={() => handleEditProject(selectedProject)}
            onBack={handleCancel}
          />
        ) : null
      case 'list':
      default:
        return (
          <ProjectList
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onViewProject={handleViewProject}
          />
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
