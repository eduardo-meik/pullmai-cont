import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import OrganizacionForm from './OrganizacionForm'
import { Organizacion } from '../../types'

interface OrganizacionModalProps {
  isOpen: boolean
  onClose: () => void
  organizacion?: Organizacion | null
  onSubmit: (data: Omit<Organizacion, 'id' | 'fechaCreacion'>) => Promise<void>
  isLoading?: boolean
}

const OrganizacionModal: React.FC<OrganizacionModalProps> = ({
  isOpen,
  onClose,
  organizacion,
  onSubmit,
  isLoading = false
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {organizacion ? 'Editar Organización' : 'Nueva Organización'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <OrganizacionForm
            organizacion={organizacion}
            onSubmit={async (data) => {
              await onSubmit(data)
              onClose()
            }}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default OrganizacionModal
