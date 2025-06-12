import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Usuario, UserRole } from '../types'

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  permisos: string[]
  
  // Actions
  setUsuario: (usuario: Usuario | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  hasPermission: (permiso: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      isAuthenticated: false,
      isLoading: true,
      permisos: [],

      setUsuario: (usuario) => set({
        usuario,
        isAuthenticated: !!usuario,
        permisos: usuario?.permisos || []
      }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({
        usuario: null,
        isAuthenticated: false,
        permisos: []
      }),

      hasPermission: (permiso) => {
        const { permisos } = get()
        return permisos.includes(permiso) || permisos.includes('*')
      },

      hasRole: (roles) => {
        const { usuario } = get()
        if (!usuario) return false
        
        const rolesArray = Array.isArray(roles) ? roles : [roles]
        return rolesArray.includes(usuario.rol)
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
        permisos: state.permisos
      })
    }
  )
)