import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types'

interface AdminRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

/**
 * AdminRoute component that restricts access to admin-only routes
 * Only allows Super Admin and Org Admin by default
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  allowedRoles = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN] 
}) => {
  const { usuario } = useAuthStore()

  // Check if user has required role
  const hasAccess = usuario && allowedRoles.includes(usuario.rol)

  if (!hasAccess) {
    // Redirect to dashboard if no access
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AdminRoute
