import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

/**
 * Cache invalidation keys for different data types
 */
export const CACHE_KEYS = {
  CONTRACTS: 'contratos',
  CONTRACT: 'contrato',
  USERS: 'users',
  USER: 'user',
  PROJECTS: 'projects',
  PROJECT: 'project',
  CONTRAPARTES: 'contrapartes',
  CONTRAPARTE: 'contraparte',
  ORGANIZATIONS: 'organizations',
  ORGANIZATION: 'organization',
  AUDIT: 'audit',
  AUDIT_STATS: 'audit-stats',
  CURRENT_USER: 'current-user'
} as const

/**
 * Hook to provide cache invalidation utilities
 */
export const useCacheInvalidation = () => {
  const queryClient = useQueryClient()

  // Invalidate all data for a specific organization
  const invalidateOrganizationData = useCallback((organizacionId: string) => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRACTS, organizacionId] })
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USERS, organizacionId] })
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECTS, organizacionId] })
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRAPARTES, organizacionId] })
  }, [queryClient])

  // Invalidate contracts data
  const invalidateContracts = useCallback((organizacionId?: string) => {
    if (organizacionId) {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRACTS, organizacionId] })
    } else {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRACTS] })
    }
  }, [queryClient])

  // Invalidate specific contract
  const invalidateContract = useCallback((contractId: string) => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRACT, contractId] })
  }, [queryClient])

  // Invalidate users data
  const invalidateUsers = useCallback((organizacionId?: string) => {
    if (organizacionId) {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USERS, organizacionId] })
    } else {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USERS] })
    }
  }, [queryClient])

  // Invalidate specific user
  const invalidateUser = useCallback((userId: string) => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER, userId] })
  }, [queryClient])

  // Invalidate projects data
  const invalidateProjects = useCallback((organizacionId?: string) => {
    if (organizacionId) {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECTS, organizacionId] })
    } else {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECTS] })
    }
  }, [queryClient])

  // Invalidate specific project
  const invalidateProject = useCallback((projectId: string) => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PROJECT, projectId] })
  }, [queryClient])

  // Invalidate contrapartes data
  const invalidateContrapartes = useCallback((organizacionId?: string) => {
    if (organizacionId) {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRAPARTES, organizacionId] })
    } else {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRAPARTES] })
    }
  }, [queryClient])

  // Invalidate specific contraparte
  const invalidateContraparte = useCallback((contraparteId: string) => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CONTRAPARTE, contraparteId] })
  }, [queryClient])

  // Invalidate audit data
  const invalidateAudit = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.AUDIT] })
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.AUDIT_STATS] })
  }, [queryClient])

  // Invalidate current user data
  const invalidateCurrentUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] })
  }, [queryClient])

  // Optimistic update for contracts
  const updateContractInCache = useCallback((
    contractId: string, 
    updater: (oldContract: any) => any
  ) => {
    queryClient.setQueryData([CACHE_KEYS.CONTRACT, contractId], updater)
  }, [queryClient])

  // Optimistic update for users
  const updateUserInCache = useCallback((
    userId: string, 
    updater: (oldUser: any) => any
  ) => {
    queryClient.setQueryData([CACHE_KEYS.USER, userId], updater)
  }, [queryClient])

  // Remove specific items from cache
  const removeFromCache = useCallback((queryKey: string[]) => {
    queryClient.removeQueries({ queryKey })
  }, [queryClient])

  // Clear all cache
  const clearAllCache = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  return {
    // Invalidation methods
    invalidateOrganizationData,
    invalidateContracts,
    invalidateContract,
    invalidateUsers,
    invalidateUser,
    invalidateProjects,
    invalidateProject,
    invalidateContrapartes,
    invalidateContraparte,
    invalidateAudit,
    invalidateCurrentUser,
    
    // Optimistic updates
    updateContractInCache,
    updateUserInCache,
    
    // Cache management
    removeFromCache,
    clearAllCache,
    
    // Direct access to query client
    queryClient
  }
}
