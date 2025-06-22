import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Proyecto, EstadoProyecto, PrioridadProyecto } from '../../types'
import { useAuthStore } from '../../stores/authStore'
import Input from '../ui/Input'
import { useToast } from '../../contexts/ToastContext'

interface ProjectFormProps {
  proyecto?: Proyecto | null
  onSubmit: (data: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const projectSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').min(3, 'Mínimo 3 caracteres'),
  descripcion: yup.string().required('La descripción es requerida').min(10, 'Mínimo 10 caracteres'),
  departamento: yup.string().required('El departamento es requerido'),
  estado: yup.string().required('El estado es requerido'),
  prioridad: yup.string().required('La prioridad es requerida'),
  presupuestoTotal: yup.number().required('El presupuesto es requerido').min(0, 'Debe ser mayor a 0'),
  fechaInicio: yup.date().required('La fecha de inicio es requerida'),
  fechaFinEstimada: yup.date().nullable(),
  responsableId: yup.string().required('El responsable es requerido'),
  icono: yup.string().default('📋'),
  color: yup.string().default('#3B82F6')
})

type ProjectFormData = yup.InferType<typeof projectSchema>

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  proyecto, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { usuario } = useAuthStore()
  const { showToast } = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProjectFormData>({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      nombre: proyecto?.nombre || '',
      descripcion: proyecto?.descripcion || '',
      departamento: proyecto?.departamento || usuario?.departamento || '',
      estado: proyecto?.estado || EstadoProyecto.PLANIFICACION,
      prioridad: proyecto?.prioridad || PrioridadProyecto.MEDIA,
      presupuestoTotal: proyecto?.presupuestoTotal || 0,
      fechaInicio: proyecto?.fechaInicio || new Date(),
      fechaFinEstimada: proyecto?.fechaFinEstimada || null,
      responsableId: proyecto?.responsableId || usuario?.id || '',
      icono: proyecto?.icono || '📋',
      color: proyecto?.color || '#3B82F6'
    }
  })

  const selectedIcon = watch('icono')
  const selectedColor = watch('color')

  const iconOptions = [
    '📋', '🚀', '💼', '🏗️', '⚡', '🎯', '🔧', '📊', 
    '💡', '🌟', '🔥', '⭐', '🎨', '📈', '🏆', '💎'
  ]

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ]

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {      const projectData = {
        ...data,
        estado: data.estado as EstadoProyecto,
        prioridad: data.prioridad as PrioridadProyecto,
        organizacionId: usuario?.organizacionId || '',
        moneda: 'CLP',
        presupuestoGastado: proyecto?.presupuestoGastado || 0,
        numeroContratos: proyecto?.numeroContratos || 0,
        contratosActivos: proyecto?.contratosActivos || 0,
        contratosPendientes: proyecto?.contratosPendientes || 0,
        valorTotalContratos: proyecto?.valorTotalContratos || 0,
        fechaInicio: new Date(data.fechaInicio),
        fechaFinEstimada: data.fechaFinEstimada ? new Date(data.fechaFinEstimada) : undefined,
        fechaFinReal: proyecto?.fechaFinReal || undefined,
        equipoIds: proyecto?.equipoIds || [],
        etiquetas: proyecto?.etiquetas || [],
        creadoPor: proyecto?.creadoPor || usuario?.id || '',
        modificadoPor: usuario?.id || ''
      }

      await onSubmit(projectData)
      showToast(proyecto ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente', 'success')
    } catch (error) {
      console.error('Error en formulario:', error)
      showToast('Error al guardar el proyecto', 'error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {proyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="md:col-span-2">
              <Input
                label="Nombre del Proyecto"
                {...register('nombre')}
                error={errors.nombre?.message}
                placeholder="Ej: Sistema ERP, Renovación Oficina"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción detallada del proyecto..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Estado y Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                {...register('estado')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={EstadoProyecto.PLANIFICACION}>Planificación</option>
                <option value={EstadoProyecto.EN_CURSO}>En Curso</option>
                <option value={EstadoProyecto.PAUSADO}>Pausado</option>
                <option value={EstadoProyecto.COMPLETADO}>Completado</option>
                <option value={EstadoProyecto.CANCELADO}>Cancelado</option>
              </select>
              {errors.estado && (
                <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                {...register('prioridad')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={PrioridadProyecto.BAJA}>Baja</option>
                <option value={PrioridadProyecto.MEDIA}>Media</option>
                <option value={PrioridadProyecto.ALTA}>Alta</option>
                <option value={PrioridadProyecto.CRITICA}>Crítica</option>
              </select>
              {errors.prioridad && (
                <p className="mt-1 text-sm text-red-600">{errors.prioridad.message}</p>
              )}
            </div>

            {/* Información organizacional */}
            <Input
              label="Departamento"
              {...register('departamento')}
              error={errors.departamento?.message}
              placeholder="Ej: Tecnología, RRHH, Finanzas"
            />

            <Input
              label="Responsable ID"
              {...register('responsableId')}
              error={errors.responsableId?.message}
              placeholder="ID del usuario responsable"
            />

            {/* Presupuesto */}
            <Input
              label="Presupuesto Total"
              type="number"
              {...register('presupuestoTotal')}
              error={errors.presupuestoTotal?.message}
              placeholder="0"
            />

            {/* Fechas */}
            <Input
              label="Fecha de Inicio"
              type="date"
              {...register('fechaInicio')}
              error={errors.fechaInicio?.message}
            />

            <Input
              label="Fecha Fin Estimada"
              type="date"
              {...register('fechaFinEstimada')}
              error={errors.fechaFinEstimada?.message}
            />

            {/* Personalización visual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono
              </label>
              <div className="grid grid-cols-8 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue('icono', icon)}
                    className={`w-10 h-10 text-xl border rounded-md hover:bg-gray-50 ${
                      selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className={`w-10 h-10 rounded-md border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Guardando...' : (proyecto ? 'Actualizar' : 'Crear')} Proyecto
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
