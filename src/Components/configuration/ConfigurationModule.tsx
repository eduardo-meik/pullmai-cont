import React, { useState, useEffect } from 'react'
import {
  CogIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'
import { UserRole, BrandingConfig, Organizacion } from '../../types'
import { ConfigurationService } from '../../services/configurationService'
import { OrganizacionService } from '../../services/organizacionService'
import { 
  SystemConfiguration, 
  OrganizationConfiguration, 
  UserPreferences,
  GeneralConfig,
  SecurityConfig,
  NotificationConfig,
  NotificationTemplates,
  ConfigurationTemplate
} from '../../types/configuration'
import { useToast } from '../../contexts/ToastContext'

type ConfigSection = 'general' | 'organization' | 'security' | 'notifications' | 'branding' | 'templates'

interface LoadingStates {
  system: boolean
  organization: boolean
  saving: boolean
  exporting: boolean
  importing: boolean
}

const ConfigurationModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ConfigSection>('general')
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(null)
  const [orgConfig, setOrgConfig] = useState<OrganizationConfiguration | null>(null)
  const [organizationData, setOrganizationData] = useState<Organizacion | null>(null)
  const [loading, setLoading] = useState<LoadingStates>({
    system: true,
    organization: true,
    saving: false,
    exporting: false,
    importing: false
  })
  const [hasChanges, setHasChanges] = useState(false)
  
  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()
  const { addToast } = useToast()

  const canManageConfig = usuario?.rol === UserRole.ORG_ADMIN || usuario?.rol === UserRole.SUPER_ADMIN
  const isSuperAdmin = usuario?.rol === UserRole.SUPER_ADMIN

  // Load configurations on mount
  useEffect(() => {
    if (canManageConfig) {
      loadConfigurations()
    }
  }, [canManageConfig])

  const loadConfigurations = async () => {
    try {
      setLoading(prev => ({ ...prev, system: true, organization: true }))
      
      // Load system configuration (Super Admin only)
      if (isSuperAdmin) {
        const systemData = await ConfigurationService.getSystemConfiguration()
        setSystemConfig(systemData)
      }
      
      // Load organization configuration and data
      if (usuario?.organizacionId) {
        const [orgData, organizationInfo] = await Promise.all([
          ConfigurationService.getOrganizationConfiguration(usuario.organizacionId),
          OrganizacionService.getOrganizacionById(usuario.organizacionId)
        ])
        setOrgConfig(orgData)
        setOrganizationData(organizationInfo)
      }
      
    } catch (error) {
      console.error('Error loading configurations:', error)
      addToast('Error al cargar configuraciones', 'error')
    } finally {
      setLoading(prev => ({ ...prev, system: false, organization: false }))
    }
  }

  const saveConfiguration = async (section: ConfigSection, data: any) => {
    if (!canManageConfig || !currentUser) return

    try {
      setLoading(prev => ({ ...prev, saving: true }))
      
      switch (section) {
        case 'general':
          if (isSuperAdmin && systemConfig) {
            await ConfigurationService.updateSystemConfiguration(
              { ...systemConfig, general: data },
              currentUser.uid,
              `Updated general configuration`
            )
            setSystemConfig(prev => prev ? { ...prev, general: data } : null)
          } else if (orgConfig && usuario?.organizacionId) {
            await ConfigurationService.updateOrganizationConfiguration(
              usuario.organizacionId,
              { ...orgConfig, general: data },
              currentUser.uid,
              `Updated general configuration`
            )
            setOrgConfig(prev => prev ? { ...prev, general: data } : null)
          }
          break
          
        case 'security':
          if (isSuperAdmin && systemConfig) {
            await ConfigurationService.updateSystemConfiguration(
              { ...systemConfig, security: data },
              currentUser.uid,
              `Updated security configuration`
            )
            setSystemConfig(prev => prev ? { ...prev, security: data } : null)
          }
          break
          
        case 'notifications':
          if (isSuperAdmin && systemConfig) {
            await ConfigurationService.updateSystemConfiguration(
              { ...systemConfig, notifications: data },
              currentUser.uid,
              `Updated notification configuration`
            )
            setSystemConfig(prev => prev ? { ...prev, notifications: data } : null)
          } else {
            addToast('Solo los super administradores pueden configurar notificaciones', 'warning')
          }
          break
          
        case 'organization':
          if (orgConfig && usuario?.organizacionId) {
            // Update both configuration and organization data
            await Promise.all([
              ConfigurationService.updateOrganizationConfiguration(
                usuario.organizacionId,
                { ...orgConfig, general: data },
                currentUser.uid,
                `Updated organization configuration`
              ),
              OrganizacionService.actualizarOrganizacion(usuario.organizacionId, {
                nombre: data.name,
                descripcion: data.description,
                logo: data.logo,
                configuracion: {
                  ...organizationData?.configuracion,
                  ...data.configuracion
                }
              })
            ])
            setOrgConfig(prev => prev ? { ...prev, general: data } : null)
            // Reload organization data to reflect changes
            if (organizationData) {
              const updatedOrgData = await OrganizacionService.getOrganizacionById(usuario.organizacionId)
              setOrganizationData(updatedOrgData)
            }
          }
          break
          
        case 'branding':
          if (orgConfig && usuario?.organizacionId) {
            await ConfigurationService.updateOrganizationConfiguration(
              usuario.organizacionId,
              { ...orgConfig, branding: data },
              currentUser.uid,
              `Updated branding configuration`
            )
            setOrgConfig(prev => prev ? { ...prev, branding: data } : null)
          }
          break
          
        case 'templates':
          if (isSuperAdmin && systemConfig) {
            // Templates would be part of notifications for now
            addToast('Configuración de plantillas será implementada próximamente', 'info')
          }
          break
          
        // Add other cases as needed
      }
      
      setHasChanges(false)
      addToast('Configuración guardada exitosamente', 'success')
      
    } catch (error) {
      console.error('Error saving configuration:', error)
      addToast('Error al guardar configuración', 'error')
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  const exportConfiguration = async () => {
    try {
      setLoading(prev => ({ ...prev, exporting: true }))
      
      let configJson: string | null = null
      
      if (isSuperAdmin) {
        configJson = await ConfigurationService.exportConfiguration('system')
      } else if (usuario?.organizacionId) {
        configJson = await ConfigurationService.exportConfiguration('organization', usuario.organizacionId)
      }
      
      if (!configJson) {
        addToast('No hay configuración para exportar', 'warning')
        return
      }
      
      // Create and download JSON file
      const blob = new Blob([configJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `configuration-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      addToast('Configuración exportada exitosamente', 'success')
      
    } catch (error) {
      console.error('Error exporting configuration:', error)
      addToast('Error al exportar configuración', 'error')
    } finally {
      setLoading(prev => ({ ...prev, exporting: false }))
    }
  }

  const importConfiguration = async (file: File) => {
    if (!currentUser) return
    
    try {
      setLoading(prev => ({ ...prev, importing: true }))
      
      const text = await file.text()
      
      let success = false
      if (isSuperAdmin) {
        success = await ConfigurationService.importConfiguration(
          text,
          'system',
          currentUser.uid
        )
      } else if (usuario?.organizacionId) {
        success = await ConfigurationService.importConfiguration(
          text,
          'organization',
          currentUser.uid,
          usuario.organizacionId
        )
      }
      
      if (success) {
        await loadConfigurations()
        addToast('Configuración importada exitosamente', 'success')
      } else {
        addToast('Error al importar configuración', 'error')
      }
      
    } catch (error) {
      console.error('Error importing configuration:', error)
      addToast('Error al importar configuración', 'error')
    } finally {
      setLoading(prev => ({ ...prev, importing: false }))
    }
  }

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
    if (loading.system || loading.organization) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando configuración...</span>
        </div>
      )
    }

    switch (activeSection) {
      case 'general':
        return <GeneralConfigSection 
          systemConfig={systemConfig} 
          orgConfig={orgConfig} 
          organizationData={organizationData}
          isSuperAdmin={isSuperAdmin}
          onSave={(data: any) => saveConfiguration('general', data)}
          loading={loading.saving}
        />
      case 'organization':
        return <OrganizationConfigSection 
          orgConfig={orgConfig} 
          organizationData={organizationData}
          onSave={(data: any) => saveConfiguration('organization', data)}
          loading={loading.saving}
        />
      case 'security':
        return <SecurityConfigSection 
          systemConfig={systemConfig} 
          isSuperAdmin={isSuperAdmin}
          onSave={(data: any) => saveConfiguration('security', data)}
          loading={loading.saving}
        />
      case 'notifications':
        return <NotificationConfigSection 
          systemConfig={systemConfig} 
          isSuperAdmin={isSuperAdmin}
          onSave={(data: any) => saveConfiguration('notifications', data)}
          loading={loading.saving}
        />
      case 'branding':
        return <BrandingConfigSection 
          orgConfig={orgConfig} 
          onSave={(data: any) => saveConfiguration('branding', data)}
          loading={loading.saving}
        />
      case 'templates':
        return <TemplateConfigSection 
          systemConfig={systemConfig} 
          isSuperAdmin={isSuperAdmin}
          onSave={(data: any) => saveConfiguration('templates', data)}
          loading={loading.saving}
        />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <CogIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600">Gestiona la configuración del sistema y la organización</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Import/Export buttons */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      importConfiguration(file)
                      e.target.value = '' // Reset input
                    }
                  }}
                  className="hidden"
                  id="import-config"
                />
                <label
                  htmlFor="import-config"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  {loading.importing ? 'Importando...' : 'Importar'}
                </label>
                
                <button
                  onClick={exportConfiguration}
                  disabled={loading.exporting}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  {loading.exporting ? 'Exportando...' : 'Exportar'}
                </button>
              </div>
              
              {hasChanges && (
                <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  Cambios sin guardar
                </div>
              )}
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

// Configuration Section Components
interface ConfigSectionProps {
  loading: boolean
  onSave: (data: any) => void
}

// General Configuration Section
interface GeneralConfigSectionProps extends ConfigSectionProps {
  systemConfig: SystemConfiguration | null
  orgConfig: OrganizationConfiguration | null
  organizationData: Organizacion | null
  isSuperAdmin: boolean
}

const GeneralConfigSection: React.FC<GeneralConfigSectionProps> = ({ 
  systemConfig, 
  orgConfig, 
  organizationData,
  isSuperAdmin, 
  onSave, 
  loading 
}) => {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (isSuperAdmin && systemConfig) {
      setFormData(systemConfig.general)
    } else if (orgConfig || organizationData) {
      // Merge data from organization configuration and organization data
      setFormData({
        // From organization configuration
        ...orgConfig?.general,
        // From organization record - use as defaults if not in config
        name: orgConfig?.general?.name || organizationData?.nombre || '',
        displayName: orgConfig?.general?.displayName || organizationData?.nombre || '',
        description: orgConfig?.general?.description || organizationData?.descripcion || '',
        logo: orgConfig?.general?.logo || organizationData?.logo || '',
        website: orgConfig?.general?.website || '',
        contactInfo: {
          email: orgConfig?.general?.contactInfo?.email || '',
          phone: orgConfig?.general?.contactInfo?.phone || '',
          address: orgConfig?.general?.contactInfo?.address || ''
        },
        language: orgConfig?.general?.language || 'es',
        timezone: orgConfig?.general?.timezone || 'America/Santiago',
        currency: orgConfig?.general?.currency || 'CLP',
        fiscalYearStart: orgConfig?.general?.fiscalYearStart || '01-01'
      })
    }
  }, [systemConfig, orgConfig, organizationData, isSuperAdmin])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuración General</h3>
        <div className="text-sm text-gray-500">
          {isSuperAdmin ? 'Configuración del Sistema' : 'Configuración de la Organización'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isSuperAdmin ? 'Nombre de la Aplicación' : 'Nombre de la Organización'}
            </label>
            <input
              type="text"
              value={isSuperAdmin ? (formData.appName || '') : (formData.name || '')}
              onChange={(e) => handleChange(isSuperAdmin ? 'appName' : 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={isSuperAdmin ? 'Mi Aplicación' : 'Mi Organización'}
              required
            />
          </div>

          {!isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre para Mostrar
              </label>
              <input
                type="text"
                value={formData.displayName || ''}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre comercial o para mostrar"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma por Defecto
            </label>
            <select
              value={formData.defaultLanguage || formData.language || 'es'}
              onChange={(e) => handleChange(isSuperAdmin ? 'defaultLanguage' : 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona Horaria
            </label>
            <select
              value={formData.timezone || 'America/Santiago'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/Santiago">America/Santiago</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              value={formData.currency || 'CLP'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CLP">Peso Chileno (CLP)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          {!isSuperAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.contactInfo?.email || ''}
                  onChange={(e) => handleChange('contactInfo', { 
                    ...formData.contactInfo, 
                    email: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Descripción de la organización..."
                />
              </div>
            </>
          )}

          {isSuperAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Sesión (minutos)
                </label>
                <input
                  type="number"
                  value={formData.sessionTimeout || 60}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="15"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño Máximo de Archivo (MB)
                </label>
                <input
                  type="number"
                  value={formData.maxFileSize || 10}
                  onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="100"
                />
              </div>
            </>
          )}
        </div>

        {isSuperAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.maintenanceMode || false}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="mr-3"
              />
              <label className="text-sm font-medium text-gray-700">
                Modo de Mantenimiento
              </label>
            </div>
            {formData.maintenanceMode && (
              <div className="mt-3">
                <textarea
                  value={formData.maintenanceMessage || ''}
                  onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                  placeholder="Mensaje para mostrar durante el mantenimiento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  )
}

// Organization Configuration Section
interface OrganizationConfigSectionProps extends ConfigSectionProps {
  orgConfig: OrganizationConfiguration | null
  organizationData: Organizacion | null
}

const OrganizationConfigSection: React.FC<OrganizationConfigSectionProps> = ({ 
  orgConfig, 
  organizationData,
  onSave, 
  loading 
}) => {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (orgConfig || organizationData) {
      // Merge data from both configuration and organization records
      setFormData({
        // From organization record
        name: organizationData?.nombre || '',
        description: organizationData?.descripcion || '',
        logo: organizationData?.logo || '',
        website: '', // Not in current org schema, add if needed
        // From organization configuration
        language: orgConfig?.general?.language || 'es',
        timezone: orgConfig?.general?.timezone || 'America/Santiago',
        currency: orgConfig?.general?.currency || 'CLP',
        // Contact info structure
        contactInfo: {
          email: '', // Add to org schema if needed
          phone: '',
          address: ''
        },
        // Organization specific settings
        configuracion: organizationData?.configuracion || {}
      })
    }
  }, [orgConfig, organizationData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Organización</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Organización
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre para Mostrar
            </label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sitio Web
            </label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              value={formData.contactInfo?.email || ''}
              onChange={(e) => handleChange('contactInfo', { 
                ...formData.contactInfo, 
                email: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  )
}

// Security Configuration Section
interface SecurityConfigSectionProps extends ConfigSectionProps {
  systemConfig: SystemConfiguration | null
  isSuperAdmin: boolean
}

const SecurityConfigSection: React.FC<SecurityConfigSectionProps> = ({ 
  systemConfig, 
  isSuperAdmin, 
  onSave, 
  loading 
}) => {
  const [formData, setFormData] = useState<any>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      lockoutAttempts: 5
    }
  })

  useEffect(() => {
    if (systemConfig?.security) {
      setFormData(systemConfig.security)
    }
  }, [systemConfig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updatePasswordPolicy = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value
      }
    }))
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Solo los super administradores pueden configurar la seguridad</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Políticas de Contraseña</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud Mínima
              </label>
              <input
                type="number"
                value={formData.passwordPolicy?.minLength || 8}
                onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="6"
                max="32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intentos de Bloqueo
              </label>
              <input
                type="number"
                value={formData.passwordPolicy?.lockoutAttempts || 5}
                onChange={(e) => updatePasswordPolicy('lockoutAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="3"
                max="10"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { key: 'requireUppercase', label: 'Requerir mayúsculas' },
              { key: 'requireLowercase', label: 'Requerir minúsculas' },
              { key: 'requireNumbers', label: 'Requerir números' },
              { key: 'requireSpecialChars', label: 'Requerir caracteres especiales' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.[key] || false}
                  onChange={(e) => updatePasswordPolicy(key, e.target.checked)}
                  className="mr-3"
                />
                <label className="text-sm text-gray-700">{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  )
}

// Notification Configuration Section
interface NotificationConfigSectionProps extends ConfigSectionProps {
  systemConfig: SystemConfiguration | null
  isSuperAdmin: boolean
}

const NotificationConfigSection: React.FC<NotificationConfigSectionProps> = ({ 
  systemConfig, 
  isSuperAdmin, 
  onSave, 
  loading 
}) => {
  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Solo los super administradores pueden configurar notificaciones</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Configuración de notificaciones - Próximamente disponible
        </p>
      </div>
    </div>
  )
}

// Branding Configuration Section
interface BrandingConfigSectionProps extends ConfigSectionProps {
  orgConfig: OrganizationConfiguration | null
}

const BrandingConfigSection: React.FC<BrandingConfigSectionProps> = ({ 
  orgConfig, 
  onSave, 
  loading 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Marca</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Configuración de branding - Próximamente disponible
        </p>
      </div>
    </div>
  )
}

// Template Configuration Section
interface TemplateConfigSectionProps extends ConfigSectionProps {
  systemConfig: SystemConfiguration | null
  isSuperAdmin: boolean
}

const TemplateConfigSection: React.FC<TemplateConfigSectionProps> = ({ 
  systemConfig, 
  isSuperAdmin, 
  onSave, 
  loading 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Plantillas</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Configuración de plantillas - Próximamente disponible
        </p>
      </div>
    </div>
  )
}

export default ConfigurationModule