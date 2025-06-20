import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  LinkIcon,
  FolderPlusIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Contrato, Proyecto } from '../../types'
import Button from '../ui/Button'
import ProjectSelector from '../projects/ProjectSelector'
import ContractProjectAssociationService from '../../services/contractProjectAssociationService'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

interface ContractProjectAssociationProps {
  isOpen: boolean
  onClose: () => void
  contracts: Contrato[]
  onAssociateContracts: (contractIds: string[], project: Proyecto) => Promise<void>
  title?: string
}

const ContractProjectAssociation: React.FC<ContractProjectAssociationProps> = ({
  isOpen,
  onClose,
  contracts,
  onAssociateContracts,
  title = "Asociar Contratos a Proyecto"
}) => {
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([])
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null)
  const [isAssociating, setIsAssociating] = useState(false)
  const { showToast } = useToast()
  const { currentUser } = useAuth()

  const handleContractToggle = (contractId: string) => {
    setSelectedContractIds(prev => 
      prev.includes(contractId)
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    )
  }

  const handleSelectAllContracts = () => {
    if (selectedContractIds.length === contracts.length) {
      setSelectedContractIds([])
    } else {
      setSelectedContractIds(contracts.map(c => c.id))
    }
  }

  const handleProjectSelect = (project: Proyecto) => {
    setSelectedProject(project)
    setShowProjectSelector(false)
  }

  const handleCreateProject = async (projectData: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>) => {
    try {
      // This would typically create the project via a service
      // For now, we'll create a mock project
      const newProject: Proyecto = {
        ...projectData,
        id: `proj_${Date.now()}`,
        fechaCreacion: new Date(),
        fechaUltimaModificacion: new Date(),
        version: 1
      }
      
      setSelectedProject(newProject)
      setShowProjectSelector(false)
      showToast('Proyecto creado exitosamente', 'success')
    } catch (error) {
      showToast('Error al crear el proyecto', 'error')
    }
  }
  const handleAssociate = async () => {
    if (!selectedProject || selectedContractIds.length === 0) return
    if (!currentUser) {
      showToast('Usuario no autenticado', 'error')
      return
    }

    setIsAssociating(true)
    try {      // Use real backend service to associate contracts
      await ContractProjectAssociationService.associateContractsToProject(
        selectedContractIds,
        selectedProject.id,
        currentUser.uid,
        'org-001' // TODO: Get actual organization ID from user profile
      )
      
      // Also call the callback for UI updates
      await onAssociateContracts(selectedContractIds, selectedProject)
      
      showToast(
        `${selectedContractIds.length} contrato(s) asociado(s) al proyecto "${selectedProject.nombre}"`,
        'success'
      )
      onClose()
    } catch (error) {
      console.error('Error associating contracts:', error)
      showToast('Error al asociar contratos al proyecto', 'error')
    } finally {
      setIsAssociating(false)
    }
  }

  const getStatusBadge = (estado: string) => {
    const colors: Record<string, string> = {
      'activo': 'bg-green-100 text-green-800',
      'borrador': 'bg-gray-100 text-gray-800',
      'revision': 'bg-yellow-100 text-yellow-800',
      'aprobado': 'bg-blue-100 text-blue-800',
      'vencido': 'bg-red-100 text-red-800',
      'cancelado': 'bg-red-100 text-red-800',
      'renovado': 'bg-purple-100 text-purple-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[estado] || 'bg-gray-100 text-gray-800'}`}>
        {estado}
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <>
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
          <div className="px-6 py-4 max-h-[calc(80vh-160px)] overflow-y-auto">
            {/* Step 1: Select Contracts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  1. Seleccionar Contratos ({selectedContractIds.length} de {contracts.length})
                </h3>
                <Button
                  variant="outline"
                  onClick={handleSelectAllContracts}
                  size="sm"
                >
                  {selectedContractIds.length === contracts.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                      selectedContractIds.includes(contract.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleContractToggle(contract.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedContractIds.includes(contract.id)}
                        onChange={() => handleContractToggle(contract.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{contract.titulo}</h4>
                          {getStatusBadge(contract.estado)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{contract.contraparte}</span>
                          <span>{contract.monto.toLocaleString()} {contract.moneda}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {contract.categoria}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select or Create Project */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                2. Seleccionar o Crear Proyecto
              </h3>

              {selectedProject ? (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">{selectedProject.nombre}</h4>
                      <p className="text-sm text-green-700">{selectedProject.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {selectedProject.estado.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-green-600">
                          {selectedProject.departamento}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(null)}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowProjectSelector(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="h-5 w-5" />
                    Seleccionar Proyecto Existente
                  </Button>
                  <Button
                    onClick={() => setShowProjectSelector(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FolderPlusIcon className="h-5 w-5" />
                    Crear Nuevo Proyecto
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssociate}
              disabled={!selectedProject || selectedContractIds.length === 0 || isAssociating}
              loading={isAssociating}
            >
              Asociar {selectedContractIds.length} Contrato(s)
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
        onSelectProject={handleProjectSelect}
        onCreateProject={handleCreateProject}
        title="Seleccionar o Crear Proyecto"
        allowCreate={true}
      />
    </>
  )
}

export default ContractProjectAssociation
