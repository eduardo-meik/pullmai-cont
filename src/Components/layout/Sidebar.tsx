import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  FolderIcon,
  ClockIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false, 
  onToggleCollapsed 
}) => {
  const { currentUser } = useAuth()

  const navigation = [
    {
      name: 'Panel de Control',
      href: '/',
      icon: ChartBarIcon,
    },
    {
      name: 'Proyectos',
      href: '/projects',
      icon: BriefcaseIcon,
    },
    {
      name: 'Contratos',
      href: '/contratos',
      icon: DocumentTextIcon,
    },
    {
      name: 'Plantillas',
      href: '/plantillas',
      icon: FolderIcon,
    },
    {
      name: 'Auditoría',
      href: '/auditoria',
      icon: ClockIcon,
    },
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UsersIcon,
    },
    {
      name: 'Configuración',
      href: '/configuracion',
      icon: CogIcon,
    }
  ]

  // Show all navigation items for now since we're using Firebase Auth
  const filteredNavigation = navigation

  if (!currentUser) {
    return null
  }

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>      {/* Botón de Colapsar/Expandir */}
      <div className="flex justify-end p-4 border-b border-gray-200">
        <button
          onClick={onToggleCollapsed}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="mt-4 px-3">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isCollapsed ? '' : 'mr-3'
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
                {isCollapsed && (
                  <span className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </span>
                )}
              </NavLink>
            </li>          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar