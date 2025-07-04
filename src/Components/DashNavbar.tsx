import { Disclosure, Menu } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DropdownMenu, { IMenuOption } from './Atoms/DropdownMenu'
import { FiLogOut, FiEdit2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast, EToastTypes } from '../contexts/ToastContext'
import { useCurrentOrganization } from '../hooks/useCurrentOrganization'
import { useOrganizationBranding } from '../hooks/useOrganizationBranding'
import UserAvatar from './common/UserAvatar'
import pullmaiLogo from '../assets/pullmailogo.svg'

export default function DashNavbar() {
  const { logout } = useAuth()
  const { showError } = useToast()
  const { organizacion, loading: orgLoading } = useCurrentOrganization()
  
  // Apply organization branding
  useOrganizationBranding()

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
    <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-colors" style={{ backgroundColor: '#f59e0b' }}>
      <span className="sr-only">Abrir menú de usuario</span>
      <UserAvatar size="md" />
    </Menu.Button>
  )
  
  return (
    <Disclosure as="nav" className="shadow-lg border-b border-nav-border" style={{ backgroundColor: '#f59e0b' }}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="block h-8 w-auto lg:hidden"
                    src={pullmaiLogo}
                    alt="Pullmai"
                  />
                  <img
                    className="hidden h-8 w-auto lg:block"
                    src={pullmaiLogo}
                    alt="Pullmai"
                  />
                  {/* Mobile Organization Display */}
                  <div className="ml-3 sm:hidden">
                    {orgLoading ? (
                      <div className="animate-pulse">
                        <div className="h-3 bg-orange-300 rounded w-16"></div>
                      </div>
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {organizacion?.nombre || 'Org'}
                      </span>
                    )}
                  </div>
                </div>                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-white text-lg font-semibold tracking-wide">
                      Pullmai
                    </h1>
                    {/* Organization Display */}
                    <div className="flex items-center">
                      <span className="text-gray-200 text-sm">|</span>
                      <div className="ml-3">
                        {orgLoading ? (
                          <div className="animate-pulse">
                            <div className="h-4 bg-orange-300 rounded w-24"></div>
                          </div>
                        ) : (
                          <span className="text-gray-200 text-sm font-medium">
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
                  className="rounded-full p-1 text-gray-200 hover:text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-colors"
                  style={{ backgroundColor: '#f59e0b' }}
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
