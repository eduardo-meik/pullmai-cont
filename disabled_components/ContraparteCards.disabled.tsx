import React, { useState } from 'react'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { Contraparte, TipoContraparte } from '../../types'
import { useContrapartes } from '../../hooks/useContrapartes'

interface ContraparteCardsProps {
  contrapartes: Contraparte[]
  onView: (contraparte: Contraparte) => void
  onEdit: (contraparte: Contraparte) => void
}

const ContraparteCards: React.FC<ContraparteCardsProps> = ({
  contrapartes,
  onView,
  onEdit
}) => {
  const { deleteContraparte, isDeleting } = useContrapartes()
  const [contraparteToDelete, setContraparteToDelete] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta contraparte?')) {
      setContraparteToDelete(id)
      try {
        await deleteContraparte.mutateAsync(id)
      } finally {
        setContraparteToDelete(null)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const getTipoIcon = (tipo: TipoContraparte) => {
    return tipo === TipoContraparte.ORGANIZACION ? (
      <BuildingOfficeIcon className="h-5 w-5" />
    ) : (
      <UserIcon className="h-5 w-5" />
    )
  }

  const getTipoBadge = (tipo: TipoContraparte) => {
    const isOrganizacion = tipo === TipoContraparte.ORGANIZACION
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        isOrganizacion 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {getTipoIcon(tipo)}
        <span>{isOrganizacion ? 'Organización' : 'Persona'}</span>
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contrapartes.map((contraparte) => (
          <div
            key={contraparte.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${
                    contraparte.tipo === TipoContraparte.ORGANIZACION 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {getTipoIcon(contraparte.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {contraparte.nombre}
                    </h3>
                    {contraparte.giro && (
                      <p className="text-sm text-gray-500 truncate">
                        {contraparte.giro}
                      </p>
                    )}
                  </div>
                </div>
                {getTipoBadge(contraparte.tipo)}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {contraparte.contactoPrincipal && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span>{contraparte.contactoPrincipal}</span>
                  </div>
                )}
                {contraparte.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`mailto:${contraparte.email}`}
                      className="text-blue-600 hover:text-blue-800 truncate"
                    >
                      {contraparte.email}
                    </a>
                  </div>
                )}
                {contraparte.telefono && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${contraparte.telefono}`} className="hover:text-gray-800">
                      {contraparte.telefono}
                    </a>
                  </div>
                )}
                {contraparte.sitioWeb && (
                  <div className="flex items-center space-x-2 text-sm">
                    <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                    <a 
                      href={contraparte.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate"
                    >
                      {contraparte.sitioWeb.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Location */}
              {(contraparte.ciudad || contraparte.pais || contraparte.direccion) && (
                <div className="space-y-1">
                  {(contraparte.ciudad || contraparte.pais) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span>
                        {[contraparte.ciudad, contraparte.pais].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {contraparte.direccion && (
                    <div className="text-xs text-gray-500 ml-6">
                      {contraparte.direccion}
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-1">
                {contraparte.rut && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">RUT:</span> {contraparte.rut}
                  </div>
                )}
                {contraparte.nit && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">NIT:</span> {contraparte.nit}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Creado:</span> {formatDate(contraparte.fechaCreacion)}
                </div>
              </div>

              {/* Notes */}
              {contraparte.notas && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {contraparte.notas}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => onView(contraparte)}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded hover:bg-gray-100"
                title="Ver detalles"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(contraparte)}
                className="text-primary-600 hover:text-primary-900 transition-colors p-2 rounded hover:bg-primary-50"
                title="Editar"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(contraparte.id)}
                disabled={isDeleting || contraparteToDelete === contraparte.id}
                className="text-red-600 hover:text-red-900 transition-colors p-2 rounded hover:bg-red-50 disabled:opacity-50"
                title="Eliminar"
              >
                {contraparteToDelete === contraparte.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContraparteCards
