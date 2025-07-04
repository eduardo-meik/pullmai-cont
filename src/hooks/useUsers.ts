import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserService } from '../services/userService'
import { Usuario, UserRole } from '../types'
import { useAuthStore } from '../stores/authStore'
import { CACHE_KEYS, useCacheInvalidation } from './useCacheInvalidation'

export const useUsers = () => {
  const { usuario } = useAuthStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [CACHE_KEYS.USERS, usuario?.organizacionId, usuario?.rol],
    queryFn: async () => {
      if (!usuario) return []

      let fetchedUsers: Usuario[] = []
      
      if (usuario.rol === UserRole.SUPER_ADMIN) {
        // Super admin can see all users
        fetchedUsers = await UserService.getAllUsers()
      } else if (usuario.rol === UserRole.ORG_ADMIN) {
        // Org admin can see users from their organization
        if (usuario.organizacionId) {
          fetchedUsers = await UserService.getUsersByOrganization(usuario.organizacionId)
        }
      } else {
        // Regular users cannot see other users
        fetchedUsers = []
      }
      
      return fetchedUsers
    },
    enabled: !!usuario,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })

  const refetchUsers = () => {
    query.refetch()
  }

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetchUsers,
    isRefetching: query.isRefetching
  }
}

// Hook for managing user operations with cache invalidation
export const useUserOperations = () => {
  const { invalidateUsers, invalidateUser, invalidateOrganizationData } = useCacheInvalidation()
  const queryClient = useQueryClient()
  const { usuario } = useAuthStore()

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<Usuario> }) => 
      UserService.updateUserProfile(userId, userData),
    onSuccess: (_, { userId }) => {
      invalidateUser(userId)
      if (usuario?.organizacionId) {
        invalidateUsers(usuario.organizacionId)
      }
    }
  })

  // Invalidate users cache manually
  const invalidateUsersCache = () => {
    if (usuario?.organizacionId) {
      invalidateUsers(usuario.organizacionId)
    }
  }

  // Invalidate all organization data
  const invalidateOrgData = () => {
    if (usuario?.organizacionId) {
      invalidateOrganizationData(usuario.organizacionId)
    }
  }

  return {
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    invalidateUsersCache,
    invalidateOrgData
  }
}

export default useUsers
