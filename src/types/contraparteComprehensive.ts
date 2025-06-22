import { UserRole, UserAssignment, Organizacion, ContraparteEstadisticas, Contrato } from './index'

// Enhanced types for comprehensive contraparte data sharing
export interface ContrapartePermission {
  id: string
  userId: string
  organizacionId: string // The partner organization they can access
  permissions: ContraparteAccessLevel[]
  grantedBy: string // UserId who granted access
  grantedAt: Date
  expiresAt?: Date
  activa: boolean
  // NEW: Detailed access control
  accessLevel: ContraparteAccessLevel
  dataSharing: DataSharingLevel
}

export enum ContraparteAccessLevel {
  VIEW_BASIC = 'view_basic',           // Basic org info only
  VIEW_DETAILED = 'view_detailed',     // Full org details + statistics
  VIEW_CONTRACTS = 'view_contracts',   // Can see contracts with this org
  IMPORT_CONTRACTS = 'import_contracts', // Can import/copy contracts
  FULL_ACCESS = 'full_access'          // Complete access to partner data
}

export enum DataSharingLevel {
  READ_ONLY = 'read_only',
  COPY_ALLOWED = 'copy_allowed',       // Can copy contracts/data
  IMPORT_ALLOWED = 'import_allowed',   // Can import into their org
  FULL_COLLABORATION = 'full_collaboration'
}

// Enhanced User type with comprehensive partner access
export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: UserRole
  organizacionId: string // Primary organization
  departamento?: string
  activo: boolean
  fechaCreacion: Date
  ultimoAcceso?: Date
  permisos: string[]
  asignaciones?: UserAssignment[]
  // Enhanced partner access
  contraparteAccess?: ContraparteAccess[]
  // NEW: Data sharing permissions
  sharedDataAccess?: SharedDataAccess[]
}

export interface ContraparteAccess {
  organizacionId: string
  accessLevel: ContraparteAccessLevel
  dataSharing: DataSharingLevel
  grantedBy: string
  grantedAt: Date
  lastAccessed?: Date
}

export interface SharedDataAccess {
  sourceUserId: string       // User who shared the data
  sourceOrganizacionId: string // Organization that shared
  dataTypes: SharedDataType[] // What types of data are shared
  permissions: SharedDataPermission[]
  sharedAt: Date
  expiresAt?: Date
}

export enum SharedDataType {
  ORGANIZATION_DETAILS = 'organization_details',
  CONTRACT_TEMPLATES = 'contract_templates',
  CONTRACT_HISTORY = 'contract_history',
  PRICING_INFO = 'pricing_info',
  CONTACT_INFO = 'contact_info',
  NEGOTIATION_HISTORY = 'negotiation_history'
}

export enum SharedDataPermission {
  VIEW = 'view',
  COPY = 'copy',
  IMPORT = 'import',
  MODIFY = 'modify'
}

// Enhanced ContraparteRelacion with comprehensive details
export interface ContraparteRelacion {
  organizacionId: string
  organizacion: Organizacion
  estadisticas: ContraparteEstadisticas
  // Enhanced relationship details
  relationshipDetails: ContraparteRelationshipDetails
  // Users with access to this contraparte
  viewerUsers?: ContraparteViewer[]
  // Shared data from this contraparte
  sharedData?: SharedContraparteData
}

export interface ContraparteRelationshipDetails {
  firstContactDate: Date
  totalContractsValue: number
  averageContractValue: number
  contractFrequency: 'monthly' | 'quarterly' | 'yearly' | 'irregular'
  preferredContactMethod: 'email' | 'phone' | 'in_person'
  relationshipStatus: 'active' | 'inactive' | 'potential' | 'ended'
  keyContacts: ContraparteContact[]
  negotiationHistory: NegotiationRecord[]
  paymentHistory: PaymentRecord[]
  riskAssessment: RiskAssessment
}

export interface ContraparteContact {
  name: string
  role: string
  email: string
  phone?: string
  isPrimary: boolean
  addedBy: string
  addedAt: Date
}

export interface NegotiationRecord {
  contractId: string
  startDate: Date
  endDate?: Date
  outcome: 'successful' | 'failed' | 'ongoing'
  keyTerms: string[]
  notes: string
  negotiatedBy: string
}

export interface PaymentRecord {
  contractId: string
  paymentDate: Date
  amount: number
  status: 'on_time' | 'late' | 'partial' | 'disputed'
  notes?: string
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high'
  financialRisk: 'low' | 'medium' | 'high'
  operationalRisk: 'low' | 'medium' | 'high'
  complianceRisk: 'low' | 'medium' | 'high'
  lastAssessment: Date
  assessedBy: string
  notes: string
}

export interface SharedContraparteData {
  templates: ContractTemplate[]
  bestPractices: BestPractice[]
  pricingGuidelines: PricingGuideline[]
  negotiationTips: NegotiationTip[]
}

export interface ContractTemplate {
  id: string
  name: string
  description: string
  template: string
  category: string
  sharedBy: string
  sharedAt: Date
  usageCount: number
}

export interface BestPractice {
  id: string
  title: string
  description: string
  category: string
  sharedBy: string
  sharedAt: Date
  rating: number
}

export interface PricingGuideline {
  id: string
  serviceType: string
  priceRange: { min: number; max: number }
  notes: string
  sharedBy: string
  sharedAt: Date
}

export interface NegotiationTip {
  id: string
  title: string
  description: string
  applicableScenarios: string[]
  sharedBy: string
  sharedAt: Date
}

export interface ContraparteViewer {
  userId: string
  userName: string
  email: string
  permissions: ContraparteAccessLevel[]
  dataSharing: DataSharingLevel
  grantedAt: Date
  lastAccessed?: Date
}

// Contract import/transfer functionality
export interface ContractImportRequest {
  id: string
  fromUserId: string
  toUserId: string
  contractIds: string[]
  requestedBy: string
  requestedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: Date
  notes?: string
}

export interface ContractImportResult {
  success: boolean
  importedContracts: string[]
  failedContracts: { contractId: string; reason: string }[]
  summary: {
    totalRequested: number
    totalImported: number
    totalFailed: number
  }
}
