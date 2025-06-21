import { useContext, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '../stores/authStore'
import { 
  canAccessOrganization, 
  canAccessProject, 
  canAccessContract,
  canPerformAction,
  getUserSpecificPermissions,
  hasPermission
} from '../types/roles'
import type { UserAssignment, Usuario } from '../types'

export const usePermissions = () => {
  const { currentUser } = useAuth()
  const { usuario: user } = useAuthStore() // Use real user from store

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
      canManageUsers: () => hasPermission(user.rol, 'users', 'manage'),
      canViewReports: () => hasPermission(user.rol, 'reports', 'read'),

      // Utilidades
      hasRolePermission: (
        role: string
      ) => user.rol === role,

      getUserPermissions: () => user.permisos || [],
    }
  }, [user, currentUser])
  return {
    ...permissions,
    userRole: user?.rol,
    userOrganizationId: user?.organizacionId,
    isLoggedIn: !!user && !!currentUser
  }
}

export default usePermissions
