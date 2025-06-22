import { UserRole, UserAssignment, Organizacion, ContraparteEstadisticas } from './index'

// Enhanced types for contraparte permissions
export interface ContrapartePermission {
  id: string
  userId: string
  organizacionId: string // The partner organization they can view
  permissions: ContraparteAccessLevel[]
  grantedBy: string // UserId who granted access
  grantedAt: Date
  expiresAt?: Date
  activa: boolean
}

export enum ContraparteAccessLevel {
  VIEW = 'view',
  VIEW_CONTRACTS = 'view_contracts',
  EDIT_BASIC = 'edit_basic' // For future expansion
}

// Enhanced User type
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
  // NEW: Access to partner organizations as "viewer"
  contraparteAccess?: string[] // Array of organization IDs they can view
}

// Enhanced ContraparteRelacion with user access info
export interface ContraparteRelacion {
  organizacionId: string
  organizacion: Organizacion
  estadisticas: ContraparteEstadisticas
  // NEW: Users with viewer access to this contraparte
  viewerUsers?: ContraparteViewer[]
}

export interface ContraparteViewer {
  userId: string
  userName: string
  email: string
  permissions: ContraparteAccessLevel[]
  grantedAt: Date
}
