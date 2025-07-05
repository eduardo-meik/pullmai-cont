import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Organizacion, ConfiguracionOrg, TipoEntidad } from '../../types'
import Input from '../ui/Input'
import { useToast } from '../../contexts/ToastContext'

interface OrganizacionFormProps {
  organizacion?: Organizacion | null
  onSubmit: (data: Omit<Organizacion, 'id' | 'fechaCreacion'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const organizacionSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  rut: yup.string().optional(),
  direccion: yup.string().optional(),
  ciudad: yup.string().optional(),
  telefono: yup.string().optional(),
  email: yup.string().email('Email inválido').optional(),
  representanteLegal: yup.string().optional(),
  rutRepresentanteLegal: yup.string().optional(),
  tipoEntidad: yup.string().oneOf(Object.values(TipoEntidad) as string[]).optional(),
  descripcion: yup.string().optional(),
  logo: yup.string().url('Debe ser una URL válida').optional(),
  activa: yup.boolean().default(true)
})

type OrganizacionFormData = yup.InferType<typeof organizacionSchema>

const OrganizacionForm: React.FC<OrganizacionFormProps> = ({
  organizacion,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { showToast } = useToast()
  const [configuracion, setConfiguracion] = useState<ConfiguracionOrg>(
    organizacion?.configuracion || {
      tiposContratoPermitidos: [],
      flujoAprobacion: false,
      notificacionesEmail: true,
      retencionDocumentos: 365,
      plantillasPersonalizadas: false
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OrganizacionFormData>({
    resolver: yupResolver(organizacionSchema),
    defaultValues: {
      nombre: organizacion?.nombre || '',
      rut: organizacion?.rut || '',
      direccion: organizacion?.direccion || '',
      ciudad: organizacion?.ciudad || '',
      telefono: organizacion?.telefono || '',
      email: organizacion?.email || '',
      representanteLegal: organizacion?.representanteLegal || '',
      rutRepresentanteLegal: organizacion?.rutRepresentanteLegal || '',
      tipoEntidad: organizacion?.tipoEntidad || 'empresa',
      descripcion: organizacion?.descripcion || '',
      logo: organizacion?.logo || '',
      activa: organizacion?.activa ?? true
    }
  })

  const handleFormSubmit = async (data: OrganizacionFormData) => {
    try {
      const organizacionData = {
        ...data,
        configuracion,
        activa: data.activa ?? true,
        tipoEntidad: data.tipoEntidad as 'empresa' | 'persona_natural' | undefined
      }

      await onSubmit(organizacionData)
      showToast(
        organizacion ? 'Organización actualizada exitosamente' : 'Organización creada exitosamente',
        'success'
      )
    } catch (error) {
      console.error('Error en formulario:', error)
      showToast('Error al guardar la organización', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="space-y-4">
            <Input
              label="Nombre de la Organización"
              placeholder="Ej: ACME Corporation"
              error={errors.nombre?.message}
              {...register('nombre')}
            />

            <Input
              label="RUT"
              placeholder="Ej: 12.345.678-9"
              error={errors.rut?.message}
              {...register('rut')}
            />

            <Input
              label="Dirección"
              placeholder="Dirección completa"
              error={errors.direccion?.message}
              {...register('direccion')}
            />

            <Input
              label="Ciudad"
              placeholder="Ciudad"
              error={errors.ciudad?.message}
              {...register('ciudad')}
            />

            <Input
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              error={errors.telefono?.message}
              {...register('telefono')}
            />

            <Input
              label="Email"
              placeholder="contacto@empresa.cl"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Representante Legal"
              placeholder="Nombre del representante legal"
              error={errors.representanteLegal?.message}
              {...register('representanteLegal')}
            />

            <Input
              label="RUT Representante Legal"
              placeholder="Ej: 12.345.678-9"
              error={errors.rutRepresentanteLegal?.message}
              {...register('rutRepresentanteLegal')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Entidad
              </label>
              <select
                {...register('tipoEntidad')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="empresa">Empresa</option>
                <option value="persona_natural">Persona Natural</option>
              </select>
              {errors.tipoEntidad && (
                <p className="mt-1 text-sm text-red-600">{errors.tipoEntidad.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                placeholder="Descripción opcional de la organización..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            <Input
              label="Logo (URL)"
              placeholder="https://ejemplo.com/logo.png"
              error={errors.logo?.message}
              {...register('logo')}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activa"
                {...register('activa')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activa" className="ml-2 block text-sm text-gray-900">
                Organización activa
              </label>
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="flujoAprobacion"
                checked={configuracion.flujoAprobacion}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  flujoAprobacion: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="flujoAprobacion" className="ml-2 block text-sm text-gray-900">
                Requiere flujo de aprobación para contratos
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificacionesEmail"
                checked={configuracion.notificacionesEmail}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  notificacionesEmail: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notificacionesEmail" className="ml-2 block text-sm text-gray-900">
                Enviar notificaciones por email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="plantillasPersonalizadas"
                checked={configuracion.plantillasPersonalizadas}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  plantillasPersonalizadas: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="plantillasPersonalizadas" className="ml-2 block text-sm text-gray-900">
                Permitir plantillas personalizadas
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retención de documentos (días)
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                value={configuracion.retencionDocumentos}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  retencionDocumentos: parseInt(e.target.value) || 365
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Tiempo que se mantendrán los documentos almacenados (mínimo 30 días)
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : organizacion ? 'Actualizar' : 'Crear Organización'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganizacionForm
