import React, { useState, useEffect } from 'react'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'
import { UserService } from '../../services/userService'
import { OrganizacionService } from '../../services/organizacionService'
import { DefaultOrganizationService } from '../../services/defaultOrganizationService'
import { Organizacion } from '../../types'

interface FirstTimeWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

enum WizardStep {
  WELCOME = 'welcome',
  ORGANIZATION = 'organization',
  PREFERENCES = 'preferences',
  COMPLETE = 'complete'
}

const FirstTimeWizard: React.FC<FirstTimeWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.WELCOME)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { usuario, setUsuario } = useAuthStore()
  
  // Organization form state
  const [organizationData, setOrganizationData] = useState({
    nombre: '',
    descripcion: '',
    createNew: true
  })
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    defaultView: 'dashboard',
    theme: 'light'
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(WizardStep.WELCOME)
      setError(null)
    }
  }, [isOpen])

  const handleNext = () => {
    const stepOrder = [
      WizardStep.WELCOME,
      WizardStep.ORGANIZATION,
      WizardStep.PREFERENCES,
      WizardStep.COMPLETE
    ]
    
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const stepOrder = [
      WizardStep.WELCOME,
      WizardStep.ORGANIZATION,
      WizardStep.PREFERENCES,
      WizardStep.COMPLETE
    ]
    
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleSkipLater = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mark wizard as completed without setting up organization
      if (currentUser && usuario) {
        // Get the correct MEIK LABS organization ID instead of using the name
        const defaultOrgId = await DefaultOrganizationService.getDefaultOrganizationId()
        
        const updatedUser = {
          ...usuario,
          organizacionId: defaultOrgId // Use proper organization ID
        }
        
        await UserService.updateUserProfile(currentUser.uid, updatedUser)
        setUsuario(updatedUser)
        
        // Store wizard completion in localStorage to avoid showing again
        localStorage.setItem('wizardCompleted', 'true')
      }
      
      // Close the wizard
      onComplete()
      onClose()
    } catch (err) {
      console.error('Error skipping wizard:', err)
      setError('Error al saltar la configuración. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentUser || !usuario) {
        throw new Error('Usuario no autenticado')
      }

      // Get the correct default organization ID instead of using the name
      let organizationId = await DefaultOrganizationService.getDefaultOrganizationId()

      // Create organization if requested
      if (organizationData.createNew && organizationData.nombre.trim()) {
        const newOrganization: Omit<Organizacion, 'id' | 'fechaCreacion'> = {
          nombre: organizationData.nombre.trim(),
          descripcion: organizationData.descripcion.trim() || `Organización de ${usuario.nombre}`,
          activa: true,
          configuracion: {
            tiposContratoPermitidos: [],
            flujoAprobacion: false,
            notificacionesEmail: preferences.notifications,
            retencionDocumentos: 365,
            plantillasPersonalizadas: false
          }
        }
        
        const createdOrgId = await OrganizacionService.crearOrganizacion(newOrganization)
        organizationId = createdOrgId
      }

      // Update user profile
      const updatedUser = {
        ...usuario,
        organizacionId: organizationId
      }
      
      await UserService.updateUserProfile(currentUser.uid, updatedUser)
      setUsuario(updatedUser)
      
      // Store wizard completion and preferences in localStorage
      localStorage.setItem('wizardCompleted', 'true')
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      
      // Move to completion step first
      setCurrentStep(WizardStep.COMPLETE)
      
      // After a brief delay, complete the wizard
      setTimeout(() => {
        onComplete()
        onClose()
      }, 2000)
      
    } catch (err) {
      console.error('Error completing wizard:', err)
      setError(err instanceof Error ? err.message : 'Error al completar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case WizardStep.WELCOME:
        return (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a PullMai!
            </h3>
            <p className="text-gray-600 mb-8">
              Te ayudaremos a configurar tu cuenta en unos simples pasos. 
              Puedes completar este proceso ahora o configurarlo más tarde.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleNext}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Comenzar configuración
              </button>
              <button
                onClick={handleSkipLater}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Configurar más tarde'}
              </button>
            </div>
          </div>
        )

      case WizardStep.ORGANIZATION:
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Configurar Organización
            </h3>
            <p className="text-gray-600 mb-6">
              Puedes crear una nueva organización o usar la organización por defecto.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orgOption"
                    checked={!organizationData.createNew}
                    onChange={() => setOrganizationData(prev => ({ ...prev, createNew: false }))}
                    className="mr-3"
                  />
                  <span>Usar organización por defecto (MEIK LABS)</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orgOption"
                    checked={organizationData.createNew}
                    onChange={() => setOrganizationData(prev => ({ ...prev, createNew: true }))}
                    className="mr-3"
                  />
                  <span>Crear nueva organización</span>
                </label>
              </div>
              
              {organizationData.createNew && (
                <div className="ml-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la organización
                    </label>
                    <input
                      type="text"
                      value={organizationData.nombre}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Mi Empresa S.A."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={organizationData.descripcion}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="Descripción de la organización..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case WizardStep.PREFERENCES:
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Preferencias
            </h3>
            <p className="text-gray-600 mb-6">
              Personaliza tu experiencia en la plataforma.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Recibir notificaciones por email</span>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                  className="rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vista por defecto
                </label>
                <select
                  value={preferences.defaultView}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultView: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="contracts">Contratos</option>
                  <option value="projects">Proyectos</option>
                </select>
              </div>
            </div>
          </div>
        )

      case WizardStep.COMPLETE:
        return (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Configuración completada!
            </h3>
            <p className="text-gray-600">
              Tu cuenta ha sido configurada exitosamente. 
              Serás redirigido al dashboard en unos segundos.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  const getStepNumber = () => {
    const stepOrder = [WizardStep.WELCOME, WizardStep.ORGANIZATION, WizardStep.PREFERENCES, WizardStep.COMPLETE]
    return stepOrder.indexOf(currentStep) + 1
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && currentStep !== WizardStep.COMPLETE) {
      // Only allow closing by backdrop if not in final step
      handleSkipLater()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 mr-4">
              Configuración inicial
            </h2>
            {currentStep !== WizardStep.COMPLETE && (
              <span className="text-sm text-gray-500">
                Paso {getStepNumber()} de 4
              </span>
            )}
          </div>
          {currentStep !== WizardStep.COMPLETE && (
            <button
              onClick={handleSkipLater}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {currentStep !== WizardStep.COMPLETE && (
          <div className="px-6 py-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getStepNumber() / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Footer */}
        {currentStep !== WizardStep.WELCOME && currentStep !== WizardStep.COMPLETE && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={loading}
              className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Atrás
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSkipLater}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Configurar más tarde'}
              </button>
              
              {currentStep === WizardStep.PREFERENCES ? (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Completando...' : 'Completar'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FirstTimeWizard
