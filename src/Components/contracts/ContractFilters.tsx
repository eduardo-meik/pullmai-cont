import React from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useContractStore } from '../../stores/contractStore'
import { EstadoContrato, TipoContrato } from '../../types'
import Button from '../ui/Button'

const ContractFilters: React.FC = () => {
  const { filtros, setFiltros, clearFiltros } = useContractStore()

  const estadosContrato = [
    { value: EstadoContrato.BORRADOR, label: 'Borrador' },
    { value: EstadoContrato.REVISION, label: 'En Revisión' },
    { value: EstadoContrato.APROBADO, label: 'Aprobado' },
    { value: EstadoContrato.ACTIVO, label: 'Activo' },
    { value: EstadoContrato.VENCIDO, label: 'Vencido' },
    { value: EstadoContrato.CANCELADO, label: 'Cancelado' },
    { value: EstadoContrato.RENOVADO, label: 'Renovado' }
  ]

  const tiposContrato = [
    { value: TipoContrato.SERVICIO, label: 'Servicio' },
    { value: TipoContrato.COMPRA, label: 'Compra' },
    { value: TipoContrato.VENTA, label: 'Venta' },
    { value: TipoContrato.CONFIDENCIALIDAD, label: 'Confidencialidad' },
    { value: TipoContrato.LABORAL, label: 'Laboral' },
    { value: TipoContrato.ARRENDAMIENTO, label: 'Arrendamiento' },
    { value: TipoContrato.OTRO, label: 'Otro' }
  ]

  const handleEstadoChange = (estado: EstadoContrato, checked: boolean) => {
    const estadosActuales = filtros.estado || []
    if (checked) {
      setFiltros({ estado: [...estadosActuales, estado] })
    } else {
      setFiltros({ estado: estadosActuales.filter(e => e !== estado) })
    }
  }

  const handleTipoChange = (tipo: TipoContrato, checked: boolean) => {
    const tiposActuales = filtros.tipo || []
    if (checked) {
      setFiltros({ tipo: [...tiposActuales, tipo] })
    } else {
      setFiltros({ tipo: tiposActuales.filter(t => t !== tipo) })
    }
  }

  const tieneActivosFiltros = Object.keys(filtros).some(key => {
    const value = filtros[key as keyof typeof filtros]
    return Array.isArray(value) ? value.length > 0 : !!value
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        {tieneActivosFiltros && (
          <Button
            variant="ghost"
            size="sm"
            icon={<XMarkIcon className="h-4 w-4" />}
            onClick={clearFiltros}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Estados */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Estado</h4>
          <div className="space-y-2">
            {estadosContrato.map((estado) => (
              <label key={estado.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.estado?.includes(estado.value) || false}
                  onChange={(e) => handleEstadoChange(estado.value, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{estado.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tipos */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tipo</h4>
          <div className="space-y-2">
            {tiposContrato.map((tipo) => (
              <label key={tipo.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.tipo?.includes(tipo.value) || false}
                  onChange={(e) => handleTipoChange(tipo.value, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{tipo.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fechas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Rango de fechas</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={filtros.fechaInicio ? filtros.fechaInicio.toISOString().split('T')[0] : ''}
                onChange={(e) => setFiltros({ fechaInicio: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={filtros.fechaFin ? filtros.fechaFin.toISOString().split('T')[0] : ''}
                onChange={(e) => setFiltros({ fechaFin: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Departamento */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Departamento</h4>
          <select
            value={filtros.departamento || ''}
            onChange={(e) => setFiltros({ departamento: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos los departamentos</option>
            <option value="legal">Legal</option>
            <option value="compras">Compras</option>
            <option value="ventas">Ventas</option>
            <option value="rrhh">Recursos Humanos</option>
            <option value="it">Tecnología</option>
            <option value="finanzas">Finanzas</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}

export default ContractFilters