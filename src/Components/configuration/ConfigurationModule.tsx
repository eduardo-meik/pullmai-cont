import React, { useState } from 'react'
import {
  CogIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  PaintBrushIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types'

type ConfigSection = 'general' | 'organization' | 'security' | 'notifications' | 'branding' | 'templates'

const ConfigurationModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ConfigSection>('general')
  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()

  const canManageConfig = usuario?.rol === UserRole.ORG_ADMIN || usuario?.rol === UserRole.SUPER_ADMIN

  const configSections = [
    {
      id: 'general' as ConfigSection,
      name: 'General',
      icon: CogIcon,
      description: 'Configuraciones básicas del sistema'
    },
    {
      id: 'organization' as ConfigSection,
      name: 'Organización',
      icon: BuildingOfficeIcon,
      description: 'Datos y configuración de la organización'
    },
    {
      id: 'security' as ConfigSection,
      name: 'Seguridad',
      icon: ShieldCheckIcon,
      description: 'Políticas de seguridad y acceso'
    },
    {
      id: 'notifications' as ConfigSection,
      name: 'Notificaciones',
      icon: BellIcon,
      description: 'Configuración de alertas y notificaciones'
    },
    {
      id: 'branding' as ConfigSection,
      name: 'Marca',
      icon: PaintBrushIcon,
      description: 'Personalización visual y branding'
    },
    {
      id: 'templates' as ConfigSection,
      name: 'Plantillas',
      icon: DocumentTextIcon,
      description: 'Configuración de plantillas del sistema'
    }
  ]

  if (!canManageConfig) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <div className="text-yellow-800 text-lg font-medium mb-2">
              Acceso Restringido
            </div>
            <p className="text-yellow-700">
              No tienes permisos para acceder a la configuración del sistema.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración General</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Configuraciones básicas del sistema - Implementación pendiente
              </p>
            </div>
          </div>
        )
      case 'organization':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Organización</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Datos y configuración de la organización - Implementación pendiente
              </p>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Políticas de seguridad y acceso - Implementación pendiente
              </p>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Configuración de alertas y notificaciones - Implementación pendiente
              </p>
            </div>
          </div>
        )
      case 'branding':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Marca</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Personalización visual y branding - Implementación pendiente
              </p>
            </div>
          </div>
        )
      case 'templates':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Plantillas</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Configuración de plantillas del sistema - Implementación pendiente
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <CogIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
              <p className="text-gray-600">Gestiona la configuración del sistema y la organización</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Configuraciones</h2>
              </div>
              <nav className="p-2 space-y-1">
                {configSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs text-gray-500">{section.description}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              <div className="p-6">
                {renderSectionContent()}
              </div>

              {/* Coming Soon Features */}
              <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Próximas Funcionalidades</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>• Configuración de roles personalizados</div>
                  <div>• Políticas de retención de documentos</div>
                  <div>• Integración con sistemas externos</div>
                  <div>• Configuración de flujos de aprobación</div>
                  <div>• Personalización de campos</div>
                  <div>• Configuración de backup automático</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigurationModule