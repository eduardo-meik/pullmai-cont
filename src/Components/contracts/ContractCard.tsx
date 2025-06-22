import React from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Contrato, EstadoContrato, CategoriaContrato, TipoEconomico, Periodicidad } from '../../types'
import Button from '../ui/Button'

interface ContractCardProps {
  contrato: Contrato
  onEliminar: () => void
  onVer?: () => void
  onEditar?: () => void
  onClick?: () => void
}

const ContractCard: React.FC<ContractCardProps> = ({ 
  contrato, 
  onEliminar, 
  onVer, 
  onEditar, 
  onClick 
}) => {
  const getEstadoColor = (estado: EstadoContrato) => {
    const colores = {
      borrador: 'bg-gray-100 text-gray-800 border-gray-200',
      revision: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprobado: 'bg-blue-100 text-blue-800 border-blue-200',
      activo: 'bg-green-100 text-green-800 border-green-200',
      vencido: 'bg-red-100 text-red-800 border-red-200',
      cancelado: 'bg-gray-100 text-gray-800 border-gray-200',
      renovado: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
  }
  const getCategoriaLabel = (categoria: CategoriaContrato) => {
    const labels = {
      servicios: 'Servicios',
      compras: 'Compras',
      ventas: 'Ventas',
      arrendamiento: 'Arrendamiento',
      laboral: 'Laboral',
      confidencialidad: 'Confidencialidad',
      consultoria: 'Consultoría',
      mantenimiento: 'Mantenimiento',
      suministro: 'Suministro',
      otro: 'Otro'
    }
    return labels[categoria] || categoria
  }

  const getTipoEconomicoLabel = (tipo: TipoEconomico) => {
    const labels = {
      compra: 'Compra',
      venta: 'Venta',
      ingreso: 'Ingreso',
      egreso: 'Egreso'
    }
    return labels[tipo] || tipo
  }

  const getPeriodicidadLabel = (periodicidad: Periodicidad) => {
    const labels = {
      unico: 'Único',
      mensual: 'Mensual',
      trimestral: 'Trimestral',
      semestral: 'Semestral',
      anual: 'Anual',
      bianual: 'Bianual'
    }
    return labels[periodicidad] || periodicidad
  }

  const getEstadoLabel = (estado: EstadoContrato) => {
    const labels = {
      borrador: 'Borrador',
      revision: 'En Revisión',
      aprobado: 'Aprobado',
      activo: 'Activo',
      vencido: 'Vencido',
      cancelado: 'Cancelado',
      renovado: 'Renovado'
    }
    return labels[estado] || estado
  }

  const isProximoVencer = () => {    const hoy = new Date()
    const diasRestantes = Math.ceil(
      (contrato.fechaTermino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diasRestantes <= 30 && diasRestantes > 0
  }
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {contrato.titulo}
              </h3>
              <p className="text-sm text-gray-500">{getCategoriaLabel(contrato.categoria)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(
                contrato.estado
              )}`}
            >
              {getEstadoLabel(contrato.estado)}
            </span>
            {isProximoVencer() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Próximo a vencer
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {contrato.descripcion}
        </p>

        {/* Información adicional */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              Vence: {format(contrato.fechaTermino, 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
            {contrato.monto && (
            <div className="flex items-center text-sm text-gray-500">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              <span>
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: contrato.moneda || 'EUR'
                }).format(contrato.monto)}
              </span>
            </div>
          )}          <div className="flex items-center text-sm text-gray-500">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>{contrato.departamento}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            <span>Contraparte: {contrato.contraparte}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            <span>Proyecto: {contrato.proyecto}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Periodicidad: {getPeriodicidadLabel(contrato.periodicidad)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getTipoEconomicoLabel(contrato.tipo)}
            </span>
          </div>
        </div>

        {/* Etiquetas */}
        {contrato.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {contrato.etiquetas.slice(0, 3).map((etiqueta, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {etiqueta}
              </span>
            ))}
            {contrato.etiquetas.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                +{contrato.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}        {/* Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<EyeIcon className="h-4 w-4" />}
              onClick={(e) => {
                e.stopPropagation()
                onVer?.()
              }}
            >
              Ver
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={(e) => {
                e.stopPropagation()
                onEditar?.()
              }}
            >
              Editar
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation()
              onEliminar()
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default ContractCard