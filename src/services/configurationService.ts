import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'
import { 
  SystemConfiguration, 
  OrganizationConfiguration, 
  UserPreferences, 
  ConfigurationChange,
  ConfigurationValidation,
  ConfigurationTemplate,
  GeneralConfig,
  SecurityConfig,
  NotificationConfig
} from '../types/configuration'

/**
 * Servicio principal para gestión de configuraciones del sistema
 */
export class ConfigurationService {
  
  // ==================== CONFIGURACIÓN DEL SISTEMA ====================
  
  /**
   * Obtiene la configuración global del sistema
   */
  static async getSystemConfiguration(): Promise<SystemConfiguration | null> {
    try {
      const configRef = doc(db, 'systemConfiguration', 'global')
      const configDoc = await getDoc(configRef)
      
      if (!configDoc.exists()) {
        return await this.createDefaultSystemConfiguration()
      }
      
      const data = configDoc.data()
      return {
        id: configDoc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as SystemConfiguration
    } catch (error) {
      console.error('Error getting system configuration:', error)
      return null
    }
  }
  
  /**
   * Actualiza la configuración del sistema
   */
  static async updateSystemConfiguration(
    config: Partial<SystemConfiguration>,
    userId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      // Validar configuración
      const validation = await this.validateSystemConfiguration(config)
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`)
      }
      
      const configRef = doc(db, 'systemConfiguration', 'global')
      const currentConfig = await this.getSystemConfiguration()
      
      // Registrar cambios para auditoría
      if (currentConfig) {
        await this.logConfigurationChange(
          'system',
          'global',
          currentConfig,
          config,
          userId,
          reason
        )
      }
      
      await updateDoc(configRef, {
        ...config,
        lastUpdated: Timestamp.now(),
        updatedBy: userId,
        version: (currentConfig?.version || '1.0.0')
      })
      
      return true
    } catch (error) {
      console.error('Error updating system configuration:', error)
      return false
    }
  }
  
  /**
   * Crea una configuración de sistema por defecto
   */
  private static async createDefaultSystemConfiguration(): Promise<SystemConfiguration> {
    const defaultConfig: SystemConfiguration = {
      id: 'global',
      version: '1.0.0',
      environment: 'production',
      lastUpdated: new Date(),
      updatedBy: 'system',
      general: {
        appName: 'ContractHub',
        appVersion: '2.0.0',
        defaultLanguage: 'es',
        timezone: 'America/Santiago',
        dateFormat: 'DD/MM/YYYY',
        currency: 'CLP',
        paginationSize: 25,
        sessionTimeout: 480, // 8 horas
        maxFileSize: 50, // 50MB
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
          idleTimeout: 30,
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
          hashingAlgorithm: 'bcrypt'
        }
      },
      notifications: {
        email: {
          enabled: true,
          provider: 'smtp',
          settings: {
            smtp: {
              host: '',
              port: 587,
              secure: false,
              username: '',
              password: ''
            }
          },
          fromAddress: 'noreply@contracthub.com',
          fromName: 'ContractHub',
          enableTracking: true,
          enableDeliveryReceipts: true,
          rateLimiting: {
            maxPerHour: 100,
            maxPerDay: 1000
          }
        },
        inApp: {
          enabled: true,
          maxNotifications: 50,
          autoMarkRead: true,
          autoMarkReadDelay: 30,
          enableSound: true,
          enableBadges: true,
          groupSimilar: true
        },
        webhooks: {
          enabled: false,
          endpoints: [],
          retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
            maxBackoffTime: 300
          },
          timeoutMs: 30000
        },
        templates: {
          contractExpiring: {
            id: 'contract-expiring',
            name: 'Contrato por vencer',
            subject: 'Contrato {contractTitle} vence en {daysLeft} días',
            bodyHtml: '<p>Su contrato <strong>{contractTitle}</strong> vence el {expirationDate}.</p>',
            bodyText: 'Su contrato {contractTitle} vence el {expirationDate}.',
            variables: ['contractTitle', 'expirationDate', 'daysLeft'],
            enabled: true,
            channels: ['email', 'in-app']
          },
          contractExpired: {
            id: 'contract-expired',
            name: 'Contrato vencido',
            subject: 'Contrato {contractTitle} ha vencido',
            bodyHtml: '<p>Su contrato <strong>{contractTitle}</strong> venció el {expirationDate}.</p>',
            bodyText: 'Su contrato {contractTitle} venció el {expirationDate}.',
            variables: ['contractTitle', 'expirationDate'],
            enabled: true,
            channels: ['email', 'in-app']
          },
          projectDeadline: {
            id: 'project-deadline',
            name: 'Plazo de proyecto',
            subject: 'Proyecto {projectName} - Plazo próximo',
            bodyHtml: '<p>El proyecto <strong>{projectName}</strong> tiene plazo el {deadline}.</p>',
            bodyText: 'El proyecto {projectName} tiene plazo el {deadline}.',
            variables: ['projectName', 'deadline'],
            enabled: true,
            channels: ['email', 'in-app']
          },
          userRegistration: {
            id: 'user-registration',
            name: 'Registro de usuario',
            subject: 'Bienvenido a ContractHub',
            bodyHtml: '<p>Bienvenido <strong>{userName}</strong> a ContractHub.</p>',
            bodyText: 'Bienvenido {userName} a ContractHub.',
            variables: ['userName'],
            enabled: true,
            channels: ['email']
          },
          passwordReset: {
            id: 'password-reset',
            name: 'Reseteo de contraseña',
            subject: 'Restablece tu contraseña',
            bodyHtml: '<p>Haz clic <a href="{resetLink}">aquí</a> para restablecer tu contraseña.</p>',
            bodyText: 'Visita este enlace para restablecer tu contraseña: {resetLink}',
            variables: ['resetLink'],
            enabled: true,
            channels: ['email']
          },
          loginAlert: {
            id: 'login-alert',
            name: 'Alerta de acceso',
            subject: 'Nuevo acceso a tu cuenta',
            bodyHtml: '<p>Se detectó un nuevo acceso desde {location} el {timestamp}.</p>',
            bodyText: 'Se detectó un nuevo acceso desde {location} el {timestamp}.',
            variables: ['location', 'timestamp'],
            enabled: false,
            channels: ['email']
          },
          systemMaintenance: {
            id: 'system-maintenance',
            name: 'Mantenimiento del sistema',
            subject: 'Mantenimiento programado',
            bodyHtml: '<p>Mantenimiento programado desde {startTime} hasta {endTime}.</p>',
            bodyText: 'Mantenimiento programado desde {startTime} hasta {endTime}.',
            variables: ['startTime', 'endTime'],
            enabled: true,
            channels: ['email', 'in-app']
          },
          auditAlert: {
            id: 'audit-alert',
            name: 'Alerta de auditoría',
            subject: 'Evento de auditoría detectado',
            bodyHtml: '<p>Se detectó el evento: {eventType} por {userName}.</p>',
            bodyText: 'Se detectó el evento: {eventType} por {userName}.',
            variables: ['eventType', 'userName'],
            enabled: true,
            channels: ['email']
          }
        }
      },
      integrations: {
        api: {
          baseUrl: '',
          version: 'v1',
          rateLimiting: {
            enabled: true,
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          authentication: {
            methods: ['jwt'],
            jwtExpiration: 24,
            refreshTokenEnabled: true,
            refreshTokenExpiration: 30
          },
          cors: {
            enabled: true,
            allowedOrigins: ['*'],
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
          },
          documentation: {
            enabled: true,
            autoGenerate: true
          }
        },
        storage: {
          provider: 'local',
          settings: {
            local: {
              basePath: '/uploads',
              permissions: '755'
            }
          },
          backup: {
            enabled: true,
            frequency: 'daily',
            retention: 30,
            compression: true
          },
          cleanup: {
            enabled: true,
            orphanedFilesCleanup: true,
            tempFilesCleanup: true,
            cleanupSchedule: '0 2 * * *'
          }
        },
        external: {
          analytics: {
            enabled: false,
            provider: 'google-analytics',
            settings: {},
            trackEvents: []
          },
          monitoring: {
            enabled: false,
            provider: 'sentry',
            settings: {
              environment: 'production'
            },
            alerting: {
              enabled: false,
              errorThreshold: 10,
              performanceThreshold: 2000,
              notificationChannels: []
            }
          },
          sso: {
            enabled: false,
            providers: [],
            allowLocalAuth: true
          },
          erp: []
        }
      },
      backup: {
        enabled: true,
        schedule: '0 3 * * *',
        retention: {
          daily: 7,
          weekly: 4,
          monthly: 12,
          yearly: 5
        },
        storage: {
          provider: 'local',
          settings: {
            local: {
              basePath: '/backups',
              permissions: '755'
            }
          },
          encryption: true
        },
        notifications: {
          onSuccess: false,
          onFailure: true,
          recipients: []
        },
        compression: true,
        incremental: true
      }
    }
    
    // Guardar configuración por defecto
    const configRef = doc(db, 'systemConfiguration', 'global')
    await setDoc(configRef, {
      ...defaultConfig,
      lastUpdated: Timestamp.now()
    })
    
    return defaultConfig
  }
  
  // ==================== CONFIGURACIÓN DE ORGANIZACIÓN ====================
  
  /**
   * Obtiene la configuración de una organización
   */
  static async getOrganizationConfiguration(organizacionId: string): Promise<OrganizationConfiguration | null> {
    try {
      const configRef = doc(db, 'organizationConfiguration', organizacionId)
      const configDoc = await getDoc(configRef)
      
      if (!configDoc.exists()) {
        return await this.createDefaultOrganizationConfiguration(organizacionId)
      }
      
      const data = configDoc.data()
      return {
        id: configDoc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as OrganizationConfiguration
    } catch (error) {
      console.error('Error getting organization configuration:', error)
      return null
    }
  }
  
  /**
   * Utility function to remove undefined values from objects recursively
   */
  private static removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item)).filter(item => item !== undefined)
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          const cleanedValue = this.removeUndefinedValues(value)
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue
          }
        }
      }
      return cleaned
    }
    
    return obj
  }

  /**
   * Actualiza la configuración de una organización
   */
  static async updateOrganizationConfiguration(
    organizacionId: string,
    config: Partial<OrganizationConfiguration>,
    userId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const configRef = doc(db, 'organizationConfiguration', organizacionId)
      const currentConfig = await this.getOrganizationConfiguration(organizacionId)
      
      // Registrar cambios para auditoría
      if (currentConfig) {
        await this.logConfigurationChange(
          'organization',
          organizacionId,
          currentConfig,
          config,
          userId,
          reason
        )
      }
      
      // Filter out undefined values to prevent Firestore errors
      const cleanConfig = this.removeUndefinedValues(config)
      
      await updateDoc(configRef, {
        ...cleanConfig,
        lastUpdated: Timestamp.now(),
        updatedBy: userId
      })
      
      return true
    } catch (error) {
      console.error('Error updating organization configuration:', error)
      return false
    }
  }
  
  /**
   * Crea configuración por defecto para una organización
   */
  private static async createDefaultOrganizationConfiguration(
    organizacionId: string
  ): Promise<OrganizationConfiguration> {
    // Obtener datos básicos de la organización
    const orgRef = doc(db, 'organizaciones', organizacionId)
    const orgDoc = await getDoc(orgRef)
    const orgData = orgDoc.exists() ? orgDoc.data() : { nombre: 'Organización' }
    
    const defaultConfig: OrganizationConfiguration = {
      id: organizacionId,
      organizacionId,
      lastUpdated: new Date(),
      updatedBy: 'system',
      general: {
        name: organizacionId,
        displayName: orgData.nombre || 'Organización',
        description: orgData.descripcion || '',
        logo: orgData.logo || null,
        contactInfo: {
          email: orgData.contacto?.email || '',
          phone: orgData.contacto?.telefono || '',
          address: orgData.contacto?.direccion || ''
        },
        timezone: 'America/Santiago',
        language: 'es',
        currency: 'CLP',
        fiscalYearStart: '01-01'
      },
      contracts: {
        approvalWorkflow: {
          enabled: orgData.configuracion?.flujoAprobacion || false,
          stages: []
        },
        numbering: {
          format: 'CON-{YYYY}-{####}',
          startNumber: 1,
          resetFrequency: 'yearly'
        },
        retention: {
          activeContracts: 7,
          expiredContracts: 5,
          archivedContracts: 10
        },
        notifications: {
          expirationWarning: [30, 15, 7, 1],
          approvalReminders: [3, 1],
          renewalNotifications: [60, 30, 15]
        },
        categories: [
          'servicios',
          'compras',
          'ventas',
          'arrendamiento',
          'laboral',
          'consultoria',
          'mantenimiento',
          'otro'
        ],
        customFields: []
      },
      projects: {
        phases: [
          { id: 'initiation', name: 'Iniciación', order: 1, estimatedDuration: 7 },
          { id: 'planning', name: 'Planificación', order: 2, estimatedDuration: 14 },
          { id: 'execution', name: 'Ejecución', order: 3, estimatedDuration: 60 },
          { id: 'monitoring', name: 'Monitoreo', order: 4, estimatedDuration: 30 },
          { id: 'closure', name: 'Cierre', order: 5, estimatedDuration: 7 }
        ],
        statuses: [
          { id: 'draft', name: 'Borrador', color: '#gray-500', isActive: false, isCompleted: false, order: 1 },
          { id: 'active', name: 'Activo', color: '#blue-500', isActive: true, isCompleted: false, order: 2 },
          { id: 'on-hold', name: 'En Pausa', color: '#yellow-500', isActive: false, isCompleted: false, order: 3 },
          { id: 'completed', name: 'Completado', color: '#green-500', isActive: false, isCompleted: true, order: 4 },
          { id: 'cancelled', name: 'Cancelado', color: '#red-500', isActive: false, isCompleted: true, order: 5 }
        ],
        priorities: [
          { id: 'low', name: 'Baja', color: '#green-500', level: 3 },
          { id: 'medium', name: 'Media', color: '#yellow-500', level: 2 },
          { id: 'high', name: 'Alta', color: '#red-500', level: 1 }
        ],
        customFields: [],
        notifications: {
          deadlineWarning: [7, 3, 1],
          milestoneReminders: true,
          statusChangeNotifications: true
        }
      },
      users: {
        registration: {
          enabled: false,
          requireApproval: true,
          defaultRole: 'user'
        },
        profile: {
          requiredFields: ['nombre', 'email'],
          allowProfilePicture: true,
          allowContactInfoEdit: true
        },
        permissions: {
          allowRoleChange: false,
          allowOrgTransfer: false,
          sessionLimits: {
            maxConcurrent: 3,
            timeoutMinutes: 480
          }
        },
        notifications: {
          welcomeEmail: true,
          passwordChangeAlert: true,
          loginNotifications: false,
          activityDigest: 'weekly'
        }
      },
      branding: orgData.branding || {
        primaryColor: '#0ea5e9',
        secondaryColor: '#64748b',
        navBackgroundColor: '#075985',
        navTextColor: '#ffffff'
      },
      integrations: {
        calendar: {
          enabled: false,
          provider: 'google',
          settings: {},
          syncEvents: {
            contractDeadlines: true,
            projectMilestones: true,
            meetingSchedules: false
          }
        },
        accounting: {
          enabled: false,
          provider: 'quickbooks',
          settings: {},
          syncConfig: {
            customers: false,
            invoices: false,
            payments: false,
            expenses: false,
            frequency: '0 2 * * *'
          }
        },
        crm: {
          enabled: false,
          provider: 'salesforce',
          settings: {},
          syncConfig: {
            contacts: false,
            companies: false,
            deals: false,
            activities: false,
            frequency: '0 3 * * *'
          }
        },
        documentSigning: {
          enabled: false,
          provider: 'docusign',
          settings: {},
          workflow: {
            autoSend: false,
            reminderFrequency: 3,
            expirationDays: 30
          }
        }
      }
    }
    
    // Guardar configuración por defecto (filter undefined values)
    const configRef = doc(db, 'organizationConfiguration', organizacionId)
    const cleanConfig = this.removeUndefinedValues(defaultConfig)
    await setDoc(configRef, {
      ...cleanConfig,
      lastUpdated: Timestamp.now()
    })
    
    return defaultConfig
  }
  
  // ==================== PREFERENCIAS DE USUARIO ====================
  
  /**
   * Obtiene las preferencias de un usuario
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const prefsRef = doc(db, 'userPreferences', userId)
      const prefsDoc = await getDoc(prefsRef)
      
      if (!prefsDoc.exists()) {
        return await this.createDefaultUserPreferences(userId)
      }
      
      const data = prefsDoc.data()
      return {
        id: prefsDoc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as UserPreferences
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }
  
  /**
   * Actualiza las preferencias de un usuario
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const prefsRef = doc(db, 'userPreferences', userId)
      
      await updateDoc(prefsRef, {
        ...preferences,
        lastUpdated: Timestamp.now()
      })
      
      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }
  
  /**
   * Crea preferencias por defecto para un usuario
   */
  private static async createDefaultUserPreferences(userId: string): Promise<UserPreferences> {
    const defaultPrefs: UserPreferences = {
      id: userId,
      userId,
      lastUpdated: new Date(),
      general: {
        language: 'es',
        timezone: 'America/Santiago',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'CLP',
        startPage: '/dashboard',
        itemsPerPage: 25
      },
      notifications: {
        email: {
          contractExpiring: true,
          projectDeadlines: true,
          systemUpdates: true,
          securityAlerts: true,
          weeklyDigest: true
        },
        inApp: {
          realTimeNotifications: true,
          soundEnabled: true,
          badgeCount: true,
          popupNotifications: true
        },
        frequency: {
          immediate: ['securityAlerts'],
          daily: ['contractExpiring', 'projectDeadlines'],
          weekly: ['weeklyDigest'],
          monthly: ['systemUpdates'],
          never: []
        }
      },
      ui: {
        theme: 'light',
        sidebarCollapsed: false,
        density: 'normal',
        animations: true,
        dashboardLayout: [
          {
            id: 'contracts-overview',
            type: 'chart',
            title: 'Resumen de Contratos',
            position: { x: 0, y: 0, width: 6, height: 4 },
            config: { chartType: 'donut' },
            visible: true
          },
          {
            id: 'recent-activity',
            type: 'list',
            title: 'Actividad Reciente',
            position: { x: 6, y: 0, width: 6, height: 4 },
            config: { maxItems: 10 },
            visible: true
          }
        ]
      },
      privacy: {
        profileVisibility: 'organization',
        showOnlineStatus: true,
        allowContactByEmail: true,
        shareUsageData: false,
        enableSessionTracking: true,
        dataRetention: {
          deleteInactiveDays: 365,
          anonymizeAfterDays: 1095
        }
      }
    }
    
    // Guardar preferencias por defecto
    const prefsRef = doc(db, 'userPreferences', userId)
    await setDoc(prefsRef, {
      ...defaultPrefs,
      lastUpdated: Timestamp.now()
    })
    
    return defaultPrefs
  }
  
  // ==================== UTILIDADES Y VALIDACIÓN ====================
  
  /**
   * Valida una configuración del sistema
   */
  private static async validateSystemConfiguration(
    config: Partial<SystemConfiguration>
  ): Promise<ConfigurationValidation> {
    const errors: any[] = []
    const warnings: any[] = []
    
    // Validaciones básicas
    if (config.general?.sessionTimeout && config.general.sessionTimeout < 15) {
      errors.push({
        path: 'general.sessionTimeout',
        message: 'El timeout de sesión debe ser de al menos 15 minutos',
        code: 'MIN_SESSION_TIMEOUT',
        severity: 'error'
      })
    }
    
    if (config.general?.maxFileSize && config.general.maxFileSize > 100) {
      warnings.push({
        path: 'general.maxFileSize',
        message: 'Tamaño máximo de archivo muy grande puede afectar el rendimiento',
        recommendation: 'Considere un límite menor a 100MB'
      })
    }
    
    if (config.security?.passwordPolicy?.minLength && config.security.passwordPolicy.minLength < 8) {
      errors.push({
        path: 'security.passwordPolicy.minLength',
        message: 'La longitud mínima de contraseña debe ser de al menos 8 caracteres',
        code: 'MIN_PASSWORD_LENGTH',
        severity: 'error'
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  /**
   * Registra cambios de configuración para auditoría
   */
  private static async logConfigurationChange(
    configType: 'system' | 'organization' | 'user',
    configId: string,
    oldConfig: any,
    newConfig: any,
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      const changes: any[] = []
      
      // Comparar configuraciones y generar diff
      // (implementación simplificada - en producción usar una librería de diff más robusta)
      Object.keys(newConfig).forEach(key => {
        if (JSON.stringify(oldConfig[key]) !== JSON.stringify(newConfig[key])) {
          changes.push({
            path: key,
            oldValue: oldConfig[key],
            newValue: newConfig[key],
            type: oldConfig[key] === undefined ? 'create' : 'update'
          })
        }
      })
      
      if (changes.length > 0) {
        const changeLog: ConfigurationChange = {
          id: `${configType}-${configId}-${Date.now()}`,
          timestamp: new Date(),
          userId,
          configType,
          configId,
          changes,
          reason,
          approved: true, // En un entorno de producción, esto podría requerir aprobación
          appliedAt: new Date()
        }
        
        const changeRef = doc(collection(db, 'configurationChanges'))
        await setDoc(changeRef, {
          ...changeLog,
          timestamp: Timestamp.fromDate(changeLog.timestamp),
          appliedAt: Timestamp.fromDate(changeLog.appliedAt!)
        })
      }
    } catch (error) {
      console.error('Error logging configuration change:', error)
    }
  }
  
  /**
   * Obtiene el historial de cambios de configuración
   */
  static async getConfigurationHistory(
    configType: 'system' | 'organization' | 'user',
    configId: string,
    limitResults = 50
  ): Promise<ConfigurationChange[]> {
    try {
      const changesQuery = query(
        collection(db, 'configurationChanges'),
        where('configType', '==', configType),
        where('configId', '==', configId),
        orderBy('timestamp', 'desc'),
        limit(limitResults)
      )
      
      const changesSnapshot = await getDocs(changesQuery)
      
      return changesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        appliedAt: doc.data().appliedAt?.toDate()
      } as ConfigurationChange))
    } catch (error) {
      console.error('Error getting configuration history:', error)
      return []
    }
  }
  
  /**
   * Exporta configuración en formato JSON
   */
  static async exportConfiguration(
    type: 'system' | 'organization',
    id?: string
  ): Promise<string | null> {
    try {
      let config: any
      
      if (type === 'system') {
        config = await this.getSystemConfiguration()
      } else {
        if (!id) throw new Error('Organization ID required for organization config export')
        config = await this.getOrganizationConfiguration(id)
      }
      
      if (!config) return null
      
      return JSON.stringify(config, null, 2)
    } catch (error) {
      console.error('Error exporting configuration:', error)
      return null
    }
  }
  
  /**
   * Importa configuración desde JSON
   */
  static async importConfiguration(
    configJson: string,
    type: 'system' | 'organization',
    userId: string,
    organizacionId?: string
  ): Promise<boolean> {
    try {
      const config = JSON.parse(configJson)
      
      if (type === 'system') {
        return await this.updateSystemConfiguration(config, userId, 'Imported from JSON')
      } else {
        if (!organizacionId) throw new Error('Organization ID required for organization config import')
        return await this.updateOrganizationConfiguration(
          organizacionId,
          config,
          userId,
          'Imported from JSON'
        )
      }
    } catch (error) {
      console.error('Error importing configuration:', error)
      return false
    }
  }
  
  /**
   * Resetea configuración a valores por defecto
   */
  static async resetToDefaults(
    type: 'system' | 'organization',
    userId: string,
    organizacionId?: string
  ): Promise<boolean> {
    try {
      if (type === 'system') {
        // Eliminar configuración actual y crear nueva por defecto
        const configRef = doc(db, 'systemConfiguration', 'global')
        await setDoc(configRef, { deleted: true }) // Marcar como eliminada para auditoría
        
        const defaultConfig = await this.createDefaultSystemConfiguration()
        return true
      } else {
        if (!organizacionId) throw new Error('Organization ID required')
        
        const configRef = doc(db, 'organizationConfiguration', organizacionId)
        await setDoc(configRef, { deleted: true })
        
        await this.createDefaultOrganizationConfiguration(organizacionId)
        return true
      }
    } catch (error) {
      console.error('Error resetting configuration to defaults:', error)
      return false
    }
  }
}

export default ConfigurationService
