import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  FolderIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types'

const Sidebar: React.FC = () => {
  const { hasRole } = useAuthStore()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: ChartBarIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.MANAGER, UserRole.USER]
    },
    {
      name: 'Contratos',
      href: '/contratos',
      icon: DocumentTextIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.MANAGER, UserRole.USER]
    },
    {
      name: 'Plantillas',
      href: '/plantillas',
      icon: FolderIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.MANAGER]
    },
    {
      name: 'Auditoría',
      href: '/auditoria',
      icon: ClockIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.MANAGER]
    },
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UsersIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]
    },
    {
      name: 'Configuración',
      href: '/configuracion',
      icon: CogIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]
    }
  ]

  const filteredNavigation = navigation.filter(item =>
    item.roles.some(role => hasRole(role))
  )

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar