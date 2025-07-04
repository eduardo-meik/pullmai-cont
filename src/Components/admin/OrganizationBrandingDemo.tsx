import React, { useState } from 'react'
import { useCurrentOrganization } from '../../hooks/useCurrentOrganization'
import { OrganizationBrandingService } from '../../services/organizationBrandingService'
import { useToast } from '../../contexts/ToastContext'
import BrandSettings from './BrandSettings'
import { BrandingConfig } from '../../types'

const OrganizationBrandingDemo: React.FC = () => {
  const { organizacion } = useCurrentOrganization()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSaveBranding = async (branding: BrandingConfig) => {
    if (!organizacion?.id) {
      showError('No se pudo encontrar la organización')
      return
    }

    try {
      setLoading(true)
      await OrganizationBrandingService.updateBranding(organizacion.id, branding)
      showSuccess('Configuración de marca actualizada correctamente')
      
      // Force a page reload to apply the new branding
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error saving branding:', error)
      showError('Error al guardar la configuración de marca')
    } finally {
      setLoading(false)
    }
  }

  const handleResetBranding = async () => {
    if (!organizacion?.id) {
      showError('No se pudo encontrar la organización')
      return
    }

    try {
      setLoading(true)
      await OrganizationBrandingService.resetBranding(organizacion.id)
      showSuccess('Configuración de marca restablecida')
      
      // Force a page reload to apply the default branding
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error resetting branding:', error)
      showError('Error al restablecer la configuración de marca')
    } finally {
      setLoading(false)
    }
  }

  if (!organizacion) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración de Marca
          </h2>
          <p className="text-gray-600 mt-2">
            Personaliza la apariencia de la aplicación para tu organización <strong>{organizacion.nombre}</strong>
          </p>
        </div>

        <BrandSettings
          currentBranding={organizacion.branding}
          onSave={handleSaveBranding}
          loading={loading}
        />

        {organizacion.branding && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleResetBranding}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Restablecer a Configuración Predeterminada'}
            </button>
          </div>
        )}
      </div>

      {/* CSS Preview */}
      {organizacion.branding && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            CSS Generado
          </h3>
          <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
            <code>
              {OrganizationBrandingService.generateCustomCSS(organizacion.branding)}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}

export default OrganizationBrandingDemo
