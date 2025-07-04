import { useState, useEffect } from 'react'
import { UserService } from '../services/userService'
import { Usuario, UserRole } from '../types'
import { useAuthStore } from '../stores/authStore'

export const useUsers = () => {
  const [users, setUsers] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { usuario } = useAuthStore()

  const fetchUsers = async () => {
    if (!usuario) return

    setIsLoading(true)
    setError(null)
    
    try {
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
      
      setUsers(fetchedUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [usuario?.id, usuario?.organizacionId, usuario?.rol])

  const refetchUsers = () => {
    fetchUsers()
  }

  return {
    users,
    isLoading,
    error,
    refetchUsers
  }
}

export default useUsers
