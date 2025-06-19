import { useContext, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  canAccessOrganization, 
  canAccessProject, 
  canAccessContract,
  canPerformAction,
  getUserSpecificPermissions,
  hasPermission
} from '../types/roles'
import type { UserAssignment, Usuario } from '../types'

// Simulando el usuario actual hasta que tengas la integración completa con Firebase
// En una implementación real, esto vendría de tu base de datos
const getCurrentUser = (): Usuario | null => {
  // Esto debería venir de tu contexto de usuario o base de datos
  // Por ahora devuelvo un usuario de ejemplo
  return {
    id: 'user-1',
    email: 'admin@example.com',
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: 'super_admin' as any,
    organizacionId: 'org-1',
    departamento: 'Administración',
    activo: true,
    fechaCreacion: new Date(),
    permisos: [],
    asignaciones: []
  }
}

export const usePermissions = () => {
  const { currentUser } = useAuth()
  const user = getCurrentUser() // En el futuro, esto vendrá de tu contexto de usuario

  const permissions = useMemo(() => {
    if (!user || !currentUser) {
      return {
        canViewOrganization: () => false,
        canEditOrganization: () => false,
        canViewProject: () => false,
        canEditProject: () => false,
        canCreateProject: () => false,
        canDeleteProject: () => false,
        canViewContract: () => false,
        canEditContract: () => false,
        canCreateContract: () => false,
        canDeleteContract: () => false,
        canManageUsers: () => false,
        canViewReports: () => false,
        hasRolePermission: () => false,
        getUserPermissions: () => [],
      }
    }

    const userAssignments = user.asignaciones || []

    return {
      // Permisos de organización
      canViewOrganization: (organizationId: string) => 
        canAccessOrganization(user.rol, user.organizacionId, organizationId),
      
      canEditOrganization: (organizationId: string) => 
        canPerformAction(user.rol, 'organizations', 'update', user.organizacionId, organizationId),

      // Permisos de proyecto
      canViewProject: (projectOrganizationId: string, projectId?: string) => 
        canAccessProject(user.rol, user.organizacionId, projectOrganizationId, userAssignments, projectId),
      
      canEditProject: (projectOrganizationId: string, projectId?: string) => {
        if (!canAccessProject(user.rol, user.organizacionId, projectOrganizationId, userAssignments, projectId)) {
          return false
        }
        
        // Para usuarios específicos, verificar permisos de edición
        if (user.rol === 'user' && projectId) {
          const specificPermissions = getUserSpecificPermissions(userAssignments, 'projects', projectId)
          return specificPermissions.includes('edit')
        }
        
        return hasPermission(user.rol, 'projects', 'update')
      },
      
      canCreateProject: (organizationId: string) => 
        canPerformAction(user.rol, 'projects', 'create', user.organizacionId, organizationId),
      
      canDeleteProject: (projectOrganizationId: string, projectId?: string) => {
        if (!canAccessProject(user.rol, user.organizacionId, projectOrganizationId, userAssignments, projectId)) {
          return false
        }
        return hasPermission(user.rol, 'projects', 'delete')
      },

      // Permisos de contrato
      canViewContract: (contractOrganizationId: string, contractProjectId?: string, contractId?: string) => 
        canAccessContract(user.rol, user.organizacionId, contractOrganizationId, contractProjectId, userAssignments, contractId),
      
      canEditContract: (contractOrganizationId: string, contractProjectId?: string, contractId?: string) => {
        if (!canAccessContract(user.rol, user.organizacionId, contractOrganizationId, contractProjectId, userAssignments, contractId)) {
          return false
        }
        
        // Para usuarios específicos, verificar permisos de edición
        if (user.rol === 'user' && contractId) {
          const specificPermissions = getUserSpecificPermissions(userAssignments, 'contracts', contractId)
          return specificPermissions.includes('edit')
        }
        
        return hasPermission(user.rol, 'contracts', 'update')
      },
      
      canCreateContract: (organizationId: string) => 
        canPerformAction(user.rol, 'contracts', 'create', user.organizacionId, organizationId),
      
      canDeleteContract: (contractOrganizationId: string, contractProjectId?: string, contractId?: string) => {
        if (!canAccessContract(user.rol, user.organizacionId, contractOrganizationId, contractProjectId, userAssignments, contractId)) {
          return false
        }
        return hasPermission(user.rol, 'contracts', 'delete')
      },

      // Permisos generales
      canManageUsers: (organizationId: string) => 
        canPerformAction(user.rol, 'users', 'manage', user.organizacionId, organizationId),
      
      canViewReports: (organizationId: string) => 
        canPerformAction(user.rol, 'reports', 'read', user.organizacionId, organizationId),

      // Utilidades
      hasRolePermission: (
        resource: 'organizations' | 'projects' | 'contracts' | 'users' | 'reports' | 'settings',
        action: 'create' | 'read' | 'update' | 'delete' | 'manage'
      ) => hasPermission(user.rol, resource, action),

      getUserPermissions: (resourceType: 'projects' | 'contracts', resourceId: string) =>
        getUserSpecificPermissions(userAssignments, resourceType, resourceId),
    }
  }, [user, currentUser])

  return {
    user,
    ...permissions,
    // Información adicional del usuario
    userRole: user?.rol,
    userOrganizationId: user?.organizacionId,
    isLoggedIn: !!currentUser && !!user,
  }
}

export default usePermissions
