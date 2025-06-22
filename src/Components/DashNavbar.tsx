import { Disclosure, Menu } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DropdownMenu, { IMenuOption } from './Atoms/DropdownMenu'
import { FiLogOut, FiEdit2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast, EToastTypes } from '../contexts/ToastContext'
import { useCurrentOrganization } from '../hooks/useCurrentOrganization'

export default function DashNavbar() {
  const { logout } = useAuth()
  const { showError } = useToast()
  const { organizacion, loading: orgLoading } = useCurrentOrganization()

  const navigate = useNavigate()
  const menuOptions: IMenuOption[] = [
    {
      icon: <FiEdit2 />,
      label: 'Editar Perfil',
      onClick: () => navigate('/update-profile'),
    },
    {
      icon: <FiLogOut />,
      label: `Cerrar Sesión`,
      onClick: () => handleLogout(),
    },
  ]

  async function handleLogout(): Promise<void> {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      showError(err)
    }
  }  const ProfilePicture = (
    <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
      <span className="sr-only">Abrir menú de usuario</span>
      <img
        className="h-8 w-8 rounded-full"
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt=""
      />
    </Menu.Button>
  )
  
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">                  <img
                    className="block h-8 w-auto lg:hidden"
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
                    alt="ContractHub"
                  />                  <img
                    className="hidden h-8 w-auto lg:block"
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
                    alt="ContractHub"
                  />
                  {/* Mobile Organization Display */}
                  <div className="ml-3 sm:hidden">
                    {orgLoading ? (
                      <div className="animate-pulse">
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs font-medium">
                        {organizacion?.nombre || 'Org'}
                      </span>
                    )}
                  </div>
                </div>                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-white text-lg font-semibold">
                      ContractHub
                    </h1>
                    {/* Organization Display */}
                    <div className="flex items-center">
                      <span className="text-gray-300 text-sm">|</span>
                      <div className="ml-3">
                        {orgLoading ? (
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-600 rounded w-24"></div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm font-medium">
                            {organizacion?.nombre || 'Organización'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute gap-4 inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">                <button
                  type="button"
                  className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">Ver notificaciones</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <DropdownMenu
                  dropDownButtonComponent={ProfilePicture}
                  options={menuOptions}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  )
}
