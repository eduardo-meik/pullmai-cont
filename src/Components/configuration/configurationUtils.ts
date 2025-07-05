/**
 * Configuration Management Utilities
 * 
 * Helper functions and constants for configuration management
 */

import { UserRole } from '../../types'
import { 
  SystemConfiguration, 
  OrganizationConfiguration, 
  GeneralConfig,
  SecurityConfig,
  NotificationConfig
} from '../../types/configuration'

// Configuration section permissions
export const CONFIGURATION_PERMISSIONS = {
  general: {
    view: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN] as UserRole[],
    edit: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN] as UserRole[]
  },
  organization: {
    view: [UserRole.ORG_ADMIN] as UserRole[],
    edit: [UserRole.ORG_ADMIN] as UserRole[]
  },
  security: {
    view: [UserRole.SUPER_ADMIN] as UserRole[],
    edit: [UserRole.SUPER_ADMIN] as UserRole[]
  },
  notifications: {
    view: [UserRole.SUPER_ADMIN] as UserRole[],
    edit: [UserRole.SUPER_ADMIN] as UserRole[]
  },
  branding: {
    view: [UserRole.ORG_ADMIN] as UserRole[],
    edit: [UserRole.ORG_ADMIN] as UserRole[]
  },
  templates: {
    view: [UserRole.SUPER_ADMIN] as UserRole[],
    edit: [UserRole.SUPER_ADMIN] as UserRole[]
  }
}

export type ConfigSection = keyof typeof CONFIGURATION_PERMISSIONS

// Default configuration values
export const DEFAULT_SYSTEM_CONFIG: Partial<SystemConfiguration> = {
  version: '1.0.0',
  environment: 'production',
  general: {
    appName: 'Sistema de Gestión',
    appVersion: '1.0.0',
    defaultLanguage: 'es',
    timezone: 'America/Santiago',
    dateFormat: 'DD/MM/YYYY',
    currency: 'CLP',
    paginationSize: 20,
    sessionTimeout: 60,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
    maintenanceMode: false
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      maxAge: 90,
      preventReuse: 5,
      lockoutAttempts: 5,
      lockoutDuration: 30
    },
    sessionConfig: {
      maxConcurrentSessions: 3,
      idleTimeout: 60,
      absoluteTimeout: 8,
      requireReauthentication: true,
      rememberMeDuration: 30
    },
    accessControl: {
      enableRBAC: true,
      defaultRole: 'user',
      allowSelfRegistration: false,
      requireEmailVerification: true,
      enableMFA: false,
      mfaMethods: ['email'],
      allowedDomains: [],
      blockedDomains: []
    },
    auditConfig: {
      enableAuditLog: true,
      logLevel: 'standard',
      retentionPeriod: 365,
      logFailedAttempts: true,
      logDataChanges: true,
      logSystemEvents: true,
      logUserActions: true,
      exportEnabled: true
    },
    encryptionConfig: {
      algorithm: 'AES-256-GCM',
      keyRotationPeriod: 90,
      encryptAtRest: true,
      encryptInTransit: true,
      hashingAlgorithm: 'SHA-256'
    }
  }
}

export const DEFAULT_ORG_CONFIG: Partial<OrganizationConfiguration> = {
  general: {
    name: 'Mi Organización',
    displayName: 'Mi Organización',
    description: 'Descripción de la organización',
    contactInfo: {
      email: 'contacto@miorganizacion.com'
    },
    timezone: 'America/Santiago',
    language: 'es',
    currency: 'CLP',
    fiscalYearStart: '01-01'
  },
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    navBackgroundColor: '#F9FAFB',
    navTextColor: '#1F2937',
    logoUrl: '',
    customCSS: ''
  }
}

// Validation functions
export const validateGeneralConfig = (config: Partial<GeneralConfig>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!config.appName || config.appName.trim().length < 2) {
    errors.push('El nombre de la aplicación debe tener al menos 2 caracteres')
  }

  if (config.sessionTimeout && (config.sessionTimeout < 15 || config.sessionTimeout > 480)) {
    errors.push('El tiempo de sesión debe estar entre 15 y 480 minutos')
  }

  if (config.maxFileSize && (config.maxFileSize < 1 || config.maxFileSize > 100)) {
    errors.push('El tamaño máximo de archivo debe estar entre 1 y 100 MB')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateSecurityConfig = (config: Partial<SecurityConfig>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (config.passwordPolicy) {
    const { passwordPolicy } = config
    
    if (passwordPolicy.minLength && (passwordPolicy.minLength < 6 || passwordPolicy.minLength > 32)) {
      errors.push('La longitud mínima de contraseña debe estar entre 6 y 32 caracteres')
    }

    if (passwordPolicy.lockoutAttempts && (passwordPolicy.lockoutAttempts < 3 || passwordPolicy.lockoutAttempts > 10)) {
      errors.push('Los intentos de bloqueo deben estar entre 3 y 10')
    }

    if (passwordPolicy.maxAge && passwordPolicy.maxAge < 30) {
      errors.push('La edad máxima de contraseña debe ser al menos 30 días')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Permission checking utilities
export const canUserAccessSection = (userRole: UserRole, section: ConfigSection): boolean => {
  const permissions = CONFIGURATION_PERMISSIONS[section]
  return permissions?.view.includes(userRole) || false
}

export const canUserEditSection = (userRole: UserRole, section: ConfigSection): boolean => {
  const permissions = CONFIGURATION_PERMISSIONS[section]
  return permissions?.edit.includes(userRole) || false
}

// Configuration diff utilities
export const getConfigurationDiff = (oldConfig: any, newConfig: any): Record<string, { old: any; new: any }> => {
  const diff: Record<string, { old: any; new: any }> = {}

  const compareObjects = (obj1: any, obj2: any, path = '') => {
    for (const key in obj2) {
      const currentPath = path ? `${path}.${key}` : key
      
      if (obj1[key] !== obj2[key]) {
        if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
          compareObjects(obj1[key] || {}, obj2[key], currentPath)
        } else {
          diff[currentPath] = {
            old: obj1[key],
            new: obj2[key]
          }
        }
      }
    }
  }

  compareObjects(oldConfig, newConfig)
  return diff
}

// Configuration backup utilities
export const createConfigurationBackup = (config: SystemConfiguration | OrganizationConfiguration) => {
  return {
    ...config,
    backupTimestamp: new Date().toISOString(),
    backupVersion: '1.0.0'
  }
}

export const validateConfigurationBackup = (backup: any): boolean => {
  return (
    backup &&
    typeof backup === 'object' &&
    backup.id &&
    backup.backupTimestamp &&
    backup.backupVersion
  )
}

// Form field definitions for dynamic form generation
export const FORM_FIELDS = {
  general: {
    system: [
      { key: 'appName', label: 'Nombre de la Aplicación', type: 'text', required: true },
      { key: 'defaultLanguage', label: 'Idioma por Defecto', type: 'select', options: [
        { value: 'es', label: 'Español' },
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Français' }
      ]},
      { key: 'timezone', label: 'Zona Horaria', type: 'select', options: [
        { value: 'America/Santiago', label: 'America/Santiago' },
        { value: 'America/New_York', label: 'America/New_York' },
        { value: 'Europe/Madrid', label: 'Europe/Madrid' },
        { value: 'UTC', label: 'UTC' }
      ]},
      { key: 'currency', label: 'Moneda', type: 'select', options: [
        { value: 'CLP', label: 'Peso Chileno (CLP)' },
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' }
      ]},
      { key: 'sessionTimeout', label: 'Tiempo de Sesión (minutos)', type: 'number', min: 15, max: 480 },
      { key: 'maxFileSize', label: 'Tamaño Máximo de Archivo (MB)', type: 'number', min: 1, max: 100 },
      { key: 'maintenanceMode', label: 'Modo de Mantenimiento', type: 'boolean' }
    ],
    organization: [
      { key: 'name', label: 'Nombre de la Organización', type: 'text', required: true },
      { key: 'displayName', label: 'Nombre para Mostrar', type: 'text' },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'website', label: 'Sitio Web', type: 'url' },
      { key: 'contactInfo.email', label: 'Email de Contacto', type: 'email', required: true },
      { key: 'contactInfo.phone', label: 'Teléfono', type: 'tel' },
      { key: 'contactInfo.address', label: 'Dirección', type: 'textarea' }
    ]
  }
}

// Export utilities
export const exportConfigurationToJSON = (config: any): string => {
  return JSON.stringify(config, null, 2)
}

export const exportConfigurationToCSV = (config: any): string => {
  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {}
    
    for (const key in obj) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey))
      } else {
        flattened[newKey] = value
      }
    }
    
    return flattened
  }

  const flatConfig = flattenObject(config)
  const headers = Object.keys(flatConfig).join(',')
  const values = Object.values(flatConfig).map(v => 
    typeof v === 'string' && v.includes(',') ? `"${v}"` : v
  ).join(',')

  return `${headers}\n${values}`
}

// Import utilities
export const parseConfigurationFromJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}

// Configuration monitoring utilities
export const getConfigurationMetrics = (config: SystemConfiguration | OrganizationConfiguration) => {
  const metrics = {
    lastUpdated: config.lastUpdated,
    updatedBy: config.updatedBy,
    configurationSize: JSON.stringify(config).length,
    sectionsConfigured: 0
  }

  // Count configured sections
  if ('general' in config && config.general) metrics.sectionsConfigured++
  if ('security' in config && config.security) metrics.sectionsConfigured++
  if ('notifications' in config && config.notifications) metrics.sectionsConfigured++
  if ('branding' in config && config.branding) metrics.sectionsConfigured++

  return metrics
}

export default {
  CONFIGURATION_PERMISSIONS,
  DEFAULT_SYSTEM_CONFIG,
  DEFAULT_ORG_CONFIG,
  validateGeneralConfig,
  validateSecurityConfig,
  canUserAccessSection,
  canUserEditSection,
  getConfigurationDiff,
  createConfigurationBackup,
  validateConfigurationBackup,
  FORM_FIELDS,
  exportConfigurationToJSON,
  exportConfigurationToCSV,
  parseConfigurationFromJSON,
  getConfigurationMetrics
}
