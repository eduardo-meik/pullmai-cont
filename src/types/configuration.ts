// Tipos completos para el sistema de configuración
import { BrandingConfig } from './index'

export interface SystemConfiguration {
  id: string
  version: string
  environment: 'development' | 'staging' | 'production'
  lastUpdated: Date
  updatedBy: string
  general: GeneralConfig
  security: SecurityConfig
  notifications: NotificationConfig
  integrations: IntegrationConfig
  backup: BackupConfig
}

export interface GeneralConfig {
  appName: string
  appVersion: string
  defaultLanguage: string
  timezone: string
  dateFormat: string
  currency: string
  paginationSize: number
  sessionTimeout: number // minutos
  maxFileSize: number // MB
  allowedFileTypes: string[]
  maintenanceMode: boolean
  maintenanceMessage?: string
}

export interface SecurityConfig {
  passwordPolicy: PasswordPolicy
  sessionConfig: SessionConfig
  accessControl: AccessControlConfig
  auditConfig: AuditConfig
  encryptionConfig: EncryptionConfig
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // días
  preventReuse: number // últimas N contraseñas
  lockoutAttempts: number
  lockoutDuration: number // minutos
}

export interface SessionConfig {
  maxConcurrentSessions: number
  idleTimeout: number // minutos
  absoluteTimeout: number // horas
  requireReauthentication: boolean
  rememberMeDuration: number // días
}

export interface AccessControlConfig {
  enableRBAC: boolean
  defaultRole: string
  allowSelfRegistration: boolean
  requireEmailVerification: boolean
  enableMFA: boolean
  mfaMethods: ('sms' | 'email' | 'totp' | 'backup-codes')[]
  allowedDomains: string[]
  blockedDomains: string[]
}

export interface AuditConfig {
  enableAuditLog: boolean
  logLevel: 'minimal' | 'standard' | 'detailed' | 'comprehensive'
  retentionPeriod: number // días
  logFailedAttempts: boolean
  logDataChanges: boolean
  logSystemEvents: boolean
  logUserActions: boolean
  exportEnabled: boolean
}

export interface EncryptionConfig {
  algorithm: string
  keyRotationPeriod: number // días
  encryptAtRest: boolean
  encryptInTransit: boolean
  hashingAlgorithm: string
}

export interface NotificationConfig {
  email: EmailConfig
  inApp: InAppConfig
  webhooks: WebhookConfig
  templates: NotificationTemplates
}

export interface EmailConfig {
  enabled: boolean
  provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun'
  settings: EmailProviderSettings
  fromAddress: string
  fromName: string
  replyToAddress?: string
  enableTracking: boolean
  enableDeliveryReceipts: boolean
  rateLimiting: {
    maxPerHour: number
    maxPerDay: number
  }
}

export interface EmailProviderSettings {
  smtp?: {
    host: string
    port: number
    secure: boolean
    username: string
    password: string
  }
  sendgrid?: {
    apiKey: string
  }
  ses?: {
    region: string
    accessKeyId: string
    secretAccessKey: string
  }
  mailgun?: {
    domain: string
    apiKey: string
  }
}

export interface InAppConfig {
  enabled: boolean
  maxNotifications: number
  autoMarkRead: boolean
  autoMarkReadDelay: number // segundos
  enableSound: boolean
  enableBadges: boolean
  groupSimilar: boolean
}

export interface WebhookConfig {
  enabled: boolean
  endpoints: WebhookEndpoint[]
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffTime: number
  }
  timeoutMs: number
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  secret?: string
  events: string[]
  enabled: boolean
  headers?: Record<string, string>
}

export interface NotificationTemplates {
  contractExpiring: NotificationTemplate
  contractExpired: NotificationTemplate
  projectDeadline: NotificationTemplate
  userRegistration: NotificationTemplate
  passwordReset: NotificationTemplate
  loginAlert: NotificationTemplate
  systemMaintenance: NotificationTemplate
  auditAlert: NotificationTemplate
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  variables: string[]
  enabled: boolean
  channels: ('email' | 'in-app' | 'webhook')[]
}

export interface IntegrationConfig {
  api: APIConfig
  storage: StorageConfig
  external: ExternalIntegrations
}

export interface APIConfig {
  baseUrl: string
  version: string
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  authentication: {
    methods: ('jwt' | 'api-key' | 'oauth')[]
    jwtExpiration: number // horas
    refreshTokenEnabled: boolean
    refreshTokenExpiration: number // días
  }
  cors: {
    enabled: boolean
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    credentials: boolean
  }
  documentation: {
    enabled: boolean
    autoGenerate: boolean
    customEndpoint?: string
  }
}

export interface StorageConfig {
  provider: 'local' | 'aws-s3' | 'google-cloud' | 'azure-blob'
  settings: StorageProviderSettings
  backup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retention: number // días
    compression: boolean
  }
  cleanup: {
    enabled: boolean
    orphanedFilesCleanup: boolean
    tempFilesCleanup: boolean
    cleanupSchedule: string // cron expression
  }
}

export interface StorageProviderSettings {
  local?: {
    basePath: string
    permissions: string
  }
  s3?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }
  gcs?: {
    bucket: string
    projectId: string
    keyFilename: string
  }
  azure?: {
    accountName: string
    accountKey: string
    containerName: string
  }
}

export interface ExternalIntegrations {
  analytics: AnalyticsIntegration
  monitoring: MonitoringIntegration
  sso: SSOIntegration
  erp: ERPIntegration[]
}

export interface AnalyticsIntegration {
  enabled: boolean
  provider: 'google-analytics' | 'mixpanel' | 'amplitude' | 'custom'
  settings: {
    trackingId?: string
    apiKey?: string
    customEndpoint?: string
  }
  trackEvents: string[]
}

export interface MonitoringIntegration {
  enabled: boolean
  provider: 'sentry' | 'datadog' | 'newrelic' | 'custom'
  settings: {
    dsn?: string
    apiKey?: string
    environment: string
  }
  alerting: {
    enabled: boolean
    errorThreshold: number
    performanceThreshold: number
    notificationChannels: string[]
  }
}

export interface SSOIntegration {
  enabled: boolean
  providers: SSOProvider[]
  defaultProvider?: string
  allowLocalAuth: boolean
}

export interface SSOProvider {
  id: string
  name: string
  type: 'saml' | 'oauth' | 'oidc' | 'ldap'
  settings: Record<string, any>
  enabled: boolean
  autoProvision: boolean
  attributeMapping: {
    email: string
    firstName: string
    lastName: string
    groups?: string
  }
}

export interface ERPIntegration {
  id: string
  name: string
  type: 'sap' | 'oracle' | 'dynamics' | 'custom'
  enabled: boolean
  settings: {
    endpoint: string
    apiKey?: string
    username?: string
    password?: string
    customSettings?: Record<string, any>
  }
  syncConfig: {
    enabled: boolean
    frequency: string // cron expression
    entities: string[]
    bidirectional: boolean
  }
}

export interface BackupConfig {
  enabled: boolean
  schedule: string // cron expression
  retention: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  storage: {
    provider: 'local' | 'aws-s3' | 'google-cloud' | 'azure-blob'
    settings: StorageProviderSettings
    encryption: boolean
  }
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    recipients: string[]
  }
  compression: boolean
  incremental: boolean
}

// Configuración específica de organización
export interface OrganizationConfiguration {
  id: string
  organizacionId: string
  lastUpdated: Date
  updatedBy: string
  general: OrganizationGeneralConfig
  contracts: ContractConfig
  projects: ProjectConfig
  users: UserConfig
  branding: BrandingConfig
  integrations: OrganizationIntegrations
}

export interface OrganizationGeneralConfig {
  name: string
  displayName: string
  description?: string
  logo?: string
  website?: string
  contactInfo: {
    email: string
    phone?: string
    address?: string
  }
  timezone: string
  language: string
  currency: string
  fiscalYearStart: string // MM-DD format
}

export interface ContractConfig {
  defaultTemplate?: string
  approvalWorkflow: {
    enabled: boolean
    stages: ApprovalStage[]
  }
  numbering: {
    format: string // e.g., "CON-{YYYY}-{####}"
    startNumber: number
    resetFrequency: 'never' | 'yearly' | 'monthly'
  }
  retention: {
    activeContracts: number // años
    expiredContracts: number // años
    archivedContracts: number // años
  }
  notifications: {
    expirationWarning: number[] // días antes del vencimiento
    approvalReminders: number[] // días para recordatorios
    renewalNotifications: number[] // días antes de renovación
  }
  categories: string[]
  customFields: CustomField[]
}

export interface ApprovalStage {
  id: string
  name: string
  order: number
  required: boolean
  approvers: string[] // user IDs or roles
  conditions?: {
    minAmount?: number
    maxAmount?: number
    categories?: string[]
    departments?: string[]
  }
  parallelApproval: boolean
  escalation?: {
    timeoutHours: number
    escalateTo: string[]
  }
}

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file'
  required: boolean
  options?: string[] // para select/multiselect
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  description?: string
  applicableCategories?: string[]
}

export interface ProjectConfig {
  defaultTemplate?: string
  phases: ProjectPhase[]
  statuses: ProjectStatus[]
  priorities: ProjectPriority[]
  customFields: CustomField[]
  notifications: {
    deadlineWarning: number[] // días antes del deadline
    milestoneReminders: boolean
    statusChangeNotifications: boolean
  }
}

export interface ProjectPhase {
  id: string
  name: string
  order: number
  description?: string
  estimatedDuration?: number // días
  dependencies?: string[] // IDs de fases previas
}

export interface ProjectStatus {
  id: string
  name: string
  color: string
  isActive: boolean
  isCompleted: boolean
  order: number
}

export interface ProjectPriority {
  id: string
  name: string
  color: string
  level: number // 1 = más alta
  escalationRules?: {
    timeoutDays: number
    escalateTo: string[]
  }
}

export interface UserConfig {
  registration: {
    enabled: boolean
    requireApproval: boolean
    defaultRole: string
    allowedDomains?: string[]
  }
  profile: {
    requiredFields: string[]
    allowProfilePicture: boolean
    allowContactInfoEdit: boolean
  }
  permissions: {
    allowRoleChange: boolean
    allowOrgTransfer: boolean
    sessionLimits: {
      maxConcurrent: number
      timeoutMinutes: number
    }
  }
  notifications: {
    welcomeEmail: boolean
    passwordChangeAlert: boolean
    loginNotifications: boolean
    activityDigest: 'daily' | 'weekly' | 'monthly' | 'never'
  }
}

export interface OrganizationIntegrations {
  calendar: CalendarIntegration
  accounting: AccountingIntegration
  crm: CRMIntegration
  documentSigning: DocumentSigningIntegration
}

export interface CalendarIntegration {
  enabled: boolean
  provider: 'google' | 'outlook' | 'caldav'
  settings: Record<string, any>
  syncEvents: {
    contractDeadlines: boolean
    projectMilestones: boolean
    meetingSchedules: boolean
  }
}

export interface AccountingIntegration {
  enabled: boolean
  provider: 'quickbooks' | 'xero' | 'sage' | 'custom'
  settings: Record<string, any>
  syncConfig: {
    customers: boolean
    invoices: boolean
    payments: boolean
    expenses: boolean
    frequency: string // cron expression
  }
}

export interface CRMIntegration {
  enabled: boolean
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom'
  settings: Record<string, any>
  syncConfig: {
    contacts: boolean
    companies: boolean
    deals: boolean
    activities: boolean
    frequency: string // cron expression
  }
}

export interface DocumentSigningIntegration {
  enabled: boolean
  provider: 'docusign' | 'adobe-sign' | 'hellosign' | 'custom'
  settings: Record<string, any>
  workflow: {
    autoSend: boolean
    reminderFrequency: number // días
    expirationDays: number
  }
}

// Configuración de usuario individual
export interface UserPreferences {
  id: string
  userId: string
  lastUpdated: Date
  general: UserGeneralPreferences
  notifications: UserNotificationPreferences
  ui: UserUIPreferences
  privacy: UserPrivacyPreferences
}

export interface UserGeneralPreferences {
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  startPage: string
  itemsPerPage: number
}

export interface UserNotificationPreferences {
  email: {
    contractExpiring: boolean
    projectDeadlines: boolean
    systemUpdates: boolean
    securityAlerts: boolean
    weeklyDigest: boolean
  }
  inApp: {
    realTimeNotifications: boolean
    soundEnabled: boolean
    badgeCount: boolean
    popupNotifications: boolean
  }
  frequency: {
    immediate: string[]
    daily: string[]
    weekly: string[]
    monthly: string[]
    never: string[]
  }
}

export interface UserUIPreferences {
  theme: 'light' | 'dark' | 'auto'
  sidebarCollapsed: boolean
  density: 'compact' | 'normal' | 'comfortable'
  animations: boolean
  dashboardLayout: DashboardWidget[]
  customCSS?: string
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'list' | 'calendar'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: Record<string, any>
  visible: boolean
}

export interface UserPrivacyPreferences {
  profileVisibility: 'public' | 'organization' | 'private'
  showOnlineStatus: boolean
  allowContactByEmail: boolean
  shareUsageData: boolean
  enableSessionTracking: boolean
  dataRetention: {
    deleteInactiveDays: number
    anonymizeAfterDays: number
  }
}

// Tipos para validación y cambios de configuración
export interface ConfigurationChange {
  id: string
  timestamp: Date
  userId: string
  configType: 'system' | 'organization' | 'user'
  configId: string
  changes: ConfigurationDiff[]
  reason?: string
  approved: boolean
  approvedBy?: string
  appliedAt?: Date
}

export interface ConfigurationDiff {
  path: string
  oldValue: any
  newValue: any
  type: 'create' | 'update' | 'delete'
}

export interface ConfigurationValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  path: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  path: string
  message: string
  recommendation: string
}

// Tipos para templates de configuración
export interface ConfigurationTemplate {
  id: string
  name: string
  description: string
  type: 'system' | 'organization'
  category: string
  template: Partial<SystemConfiguration | OrganizationConfiguration>
  isDefault: boolean
  version: string
  createdBy: string
  createdAt: Date
}
