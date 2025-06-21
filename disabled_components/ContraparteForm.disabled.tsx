import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Contraparte, TipoContraparte } from '../../types'
import { useContrapartes } from '../../hooks/useContrapartes'
import { useAuthStore } from '../../stores/authStore'

interface ContraparteFormProps {
  contraparte?: Contraparte | null
  onClose: () => void
  onSuccess: () => void
}

const ContraparteForm: React.FC<ContraparteFormProps> = ({
  contraparte,
  onClose,
  onSuccess
}) => {
  const { usuario } = useAuthStore()
  const { createContraparte, updateContraparte, isCreating, isUpdating } = useContrapartes()
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: TipoContraparte.ORGANIZACION,
    email: '',
    telefono: '',
    direccion: '',
    pais: '',
    ciudad: '',
    rut: '',
    nit: '',
    giro: '',
    sitioWeb: '',
    contactoPrincipal: '',
    emailContacto: '',
    telefonoContacto: '',
    notas: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (contraparte) {
      setFormData({
        nombre: contraparte.nombre || '',
        tipo: contraparte.tipo || TipoContraparte.ORGANIZACION,
        email: contraparte.email || '',
        telefono: contraparte.telefono || '',
        direccion: contraparte.direccion || '',
        pais: contraparte.pais || '',
        ciudad: contraparte.ciudad || '',
        rut: contraparte.rut || '',
        nit: contraparte.nit || '',
        giro: contraparte.giro || '',
        sitioWeb: contraparte.sitioWeb || '',
        contactoPrincipal: contraparte.contactoPrincipal || '',
        emailContacto: contraparte.emailContacto || '',
        telefonoContacto: contraparte.telefonoContacto || '',
        notas: contraparte.notas || ''
      })
    }
  }, [contraparte])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido'
    }

    if (formData.emailContacto && !/\S+@\S+\.\S+/.test(formData.emailContacto)) {
      newErrors.emailContacto = 'El formato del email no es válido'
    }

    if (formData.sitioWeb && !formData.sitioWeb.match(/^https?:\/\/.+/)) {
      newErrors.sitioWeb = 'El sitio web debe comenzar con http:// o https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !usuario) return

    try {
      const contraparteData = {
        ...formData,
        organizacionId: usuario.organizacionId,
        creadoPor: usuario.id,
        modificadoPor: usuario.id,
        activo: true
      }

      if (contraparte) {
        await updateContraparte.mutateAsync({
          id: contraparte.id,
          updates: contraparteData
        })
      } else {
        await createContraparte.mutateAsync(contraparteData)
      }

      onSuccess()
    } catch (error) {
      console.error('Error al guardar contraparte:', error)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                {formData.tipo === TipoContraparte.ORGANIZACION ? (
                  <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                ) : (
                  <UserIcon className="h-6 w-6 text-primary-600" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {contraparte ? 'Editar Contraparte' : 'Nueva Contraparte'}
                </h1>
                <p className="text-gray-600">
                  {contraparte ? 'Modifica los datos de la contraparte' : 'Ingresa los datos de la nueva contraparte'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Nombre de la contraparte"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                {/* Tipo */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value as TipoContraparte)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={TipoContraparte.ORGANIZACION}>Organización</option>
                    <option value={TipoContraparte.PERSONA}>Persona</option>
                  </select>
                </div>

                {/* Giro */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giro / Actividad Económica
                  </label>
                  <input
                    type="text"
                    value={formData.giro}
                    onChange={(e) => handleInputChange('giro', e.target.value)}
                    placeholder="Ej: Desarrollo de software, Consultoría, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5" />
                <span>Información de Contacto</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Principal
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@ejemplo.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono Principal
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Contacto Principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contactoPrincipal}
                    onChange={(e) => handleInputChange('contactoPrincipal', e.target.value)}
                    placeholder="Nombre del contacto principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Email Contacto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={formData.emailContacto}
                    onChange={(e) => handleInputChange('emailContacto', e.target.value)}
                    placeholder="contacto@ejemplo.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.emailContacto ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.emailContacto && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailContacto}</p>
                  )}
                </div>

                {/* Teléfono Contacto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonoContacto}
                    onChange={(e) => handleInputChange('telefonoContacto', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Sitio Web */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={formData.sitioWeb}
                    onChange={(e) => handleInputChange('sitioWeb', e.target.value)}
                    placeholder="https://www.ejemplo.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.sitioWeb ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.sitioWeb && (
                    <p className="mt-1 text-sm text-red-600">{errors.sitioWeb}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location and Legal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5" />
                <span>Ubicación y Datos Legales</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                    placeholder="Chile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    placeholder="Santiago"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Calle Ejemplo 123, Oficina 456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* RUT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RUT (Chile)
                  </label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => handleInputChange('rut', e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* NIT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT / Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                    placeholder="Número de identificación tributaria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Notas y Observaciones</span>
              </h2>
            </div>
            <div className="p-6">
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                placeholder="Notas adicionales sobre la contraparte..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {contraparte ? 'Actualizar' : 'Crear'} Contraparte
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContraparteForm
