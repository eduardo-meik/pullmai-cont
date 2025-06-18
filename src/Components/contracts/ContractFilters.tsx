import React from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useContractStore } from '../../stores/contractStore'
import { EstadoContrato, CategoriaContrato, TipoEconomico, Periodicidad } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'

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
  const categoriasContrato = [
    { value: CategoriaContrato.SERVICIOS, label: 'Servicios' },
    { value: CategoriaContrato.COMPRAS, label: 'Compras' },
    { value: CategoriaContrato.VENTAS, label: 'Ventas' },
    { value: CategoriaContrato.ARRENDAMIENTO, label: 'Arrendamiento' },
    { value: CategoriaContrato.LABORAL, label: 'Laboral' },
    { value: CategoriaContrato.CONFIDENCIALIDAD, label: 'Confidencialidad' },
    { value: CategoriaContrato.CONSULTORIA, label: 'Consultoría' },
    { value: CategoriaContrato.MANTENIMIENTO, label: 'Mantenimiento' },
    { value: CategoriaContrato.SUMINISTRO, label: 'Suministro' },
    { value: CategoriaContrato.OTRO, label: 'Otro' }
  ]

  const tiposEconomicos = [
    { value: TipoEconomico.COMPRA, label: 'Compra' },
    { value: TipoEconomico.VENTA, label: 'Venta' },
    { value: TipoEconomico.INGRESO, label: 'Ingreso' },
    { value: TipoEconomico.EGRESO, label: 'Egreso' }
  ]

  const handleEstadoChange = (estado: EstadoContrato, checked: boolean) => {
    const estadosActuales = filtros.estado || []
    if (checked) {
      setFiltros({ estado: [...estadosActuales, estado] })
    } else {
      setFiltros({ estado: estadosActuales.filter(e => e !== estado) })
    }
  }
  const handleCategoriaChange = (categoria: CategoriaContrato, checked: boolean) => {
    const categoriasActuales = filtros.categoria || []
    if (checked) {
      setFiltros({ categoria: [...categoriasActuales, categoria] })
    } else {
      setFiltros({ categoria: categoriasActuales.filter(c => c !== categoria) })
    }
  }

  const handleTipoEconomicoChange = (tipo: TipoEconomico, checked: boolean) => {
    const tiposActuales = filtros.tipo || []
    if (checked) {
      setFiltros({ tipo: [...tiposActuales, tipo] })
    } else {
      setFiltros({ tipo: tiposActuales.filter(t => t !== tipo) })
    }
  }

  const handleProyectoChange = (proyecto: string) => {
    setFiltros({ proyecto: proyecto || undefined })
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
        </div>        {/* Categorías */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Categoría</h4>
          <div className="space-y-2">
            {categoriasContrato.map((categoria) => (
              <label key={categoria.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.categoria?.includes(categoria.value) || false}
                  onChange={(e) => handleCategoriaChange(categoria.value, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{categoria.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tipos Económicos */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tipo Económico</h4>
          <div className="space-y-2">
            {tiposEconomicos.map((tipo) => (
              <label key={tipo.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filtros.tipo?.includes(tipo.value) || false}
                  onChange={(e) => handleTipoEconomicoChange(tipo.value, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{tipo.label}</span>
              </label>
            ))}
          </div>
        </div>        {/* Proyecto */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Proyecto</h4>
          <Input
            label=""
            type="text"
            placeholder="Filtrar por proyecto..."
            value={filtros.proyecto || ''}
            onChange={(e) => handleProyectoChange(e.target.value)}
            className="w-full"
          />
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