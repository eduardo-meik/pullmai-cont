import React, { useState } from 'react'
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline'
import { useCacheInvalidation } from '../../hooks/useCacheInvalidation'
import { useUsers } from '../../hooks/useUsers'
import { useProjects } from '../../hooks/useProjects'
import { useContracts } from '../../hooks/useContracts'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../contexts/ToastContext'

/**
 * Demo component to showcase cache invalidation functionality
 * This component allows testing of the cache invalidation system
 */
const CacheInvalidationDemo: React.FC = () => {
  const { usuario } = useAuthStore()
  const { showTypedToast } = useToast()
  const {
    invalidateUsers,
    invalidateProjects,
    invalidateContracts,
    invalidateOrganizationData,
    clearAllCache
  } = useCacheInvalidation()

  // Get current data states
  const { users, isLoading: usersLoading } = useUsers()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: contracts, isLoading: contractsLoading } = useContracts()

  const [lastAction, setLastAction] = useState<string>('')

  const handleInvalidateUsers = () => {
    if (usuario?.organizacionId) {
      invalidateUsers(usuario.organizacionId)
      setLastAction('Users cache invalidated')
      showTypedToast('success', 'Cache de usuarios invalidado')
    }
  }

  const handleInvalidateProjects = () => {
    if (usuario?.organizacionId) {
      invalidateProjects(usuario.organizacionId)
      setLastAction('Projects cache invalidated')
      showTypedToast('success', 'Cache de proyectos invalidado')
    }
  }

  const handleInvalidateContracts = () => {
    if (usuario?.organizacionId) {
      invalidateContracts(usuario.organizacionId)
      setLastAction('Contracts cache invalidated')
      showTypedToast('success', 'Cache de contratos invalidado')
    }
  }

  const handleInvalidateAllOrgData = () => {
    if (usuario?.organizacionId) {
      invalidateOrganizationData(usuario.organizacionId)
      setLastAction('All organization data cache invalidated')
      showTypedToast('success', 'Todo el cache de la organización invalidado')
    }
  }

  const handleClearAllCache = () => {
    clearAllCache()
    setLastAction('All cache cleared')
    showTypedToast('warning', 'Todo el cache ha sido borrado')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ArrowPathIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cache Invalidation Demo</h2>
            <p className="text-gray-600">Test the cache invalidation system for immediate data updates</p>
          </div>
        </div>

        {/* Current Data Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Users</h3>
              {usersLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {users.length} usuarios cargados
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Projects</h3>
              {projectsLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {projects?.length || 0} proyectos cargados
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Contracts</h3>
              {contractsLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {contracts?.contratos?.length || 0} contratos cargados
            </p>
          </div>
        </div>

        {/* Invalidation Controls */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Cache Invalidation Controls</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={handleInvalidateUsers}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Invalidate Users
            </button>

            <button
              onClick={handleInvalidateProjects}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Invalidate Projects
            </button>

            <button
              onClick={handleInvalidateContracts}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Invalidate Contracts
            </button>

            <button
              onClick={handleInvalidateAllOrgData}
              className="flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Invalidate All Org Data
            </button>

            <button
              onClick={handleClearAllCache}
              className="flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Clear All Cache
            </button>
          </div>
        </div>

        {/* Last Action */}
        {lastAction && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Last action: {lastAction}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Cache invalidation automatically triggers when you create, update, or delete data</li>
            <li>• Use the buttons above to manually test cache invalidation</li>
            <li>• Watch the loading indicators to see when data is being refetched</li>
            <li>• All CRUD operations in the app now use this system for immediate updates</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CacheInvalidationDemo
