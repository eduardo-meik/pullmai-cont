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
import { Contrato, EstadoContrato, TipoContrato } from '../../types'
import Button from '../ui/Button'

interface ContractCardProps {
  contrato: Contrato
  onEliminar: () => void
}

const ContractCard: React.FC<ContractCardProps> = ({ contrato, onEliminar }) => {
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

  const getTipoLabel = (tipo: TipoContrato) => {
    const labels = {
      servicio: 'Servicio',
      compra: 'Compra',
      venta: 'Venta',
      confidencialidad: 'Confidencialidad',
      laboral: 'Laboral',
      arrendamiento: 'Arrendamiento',
      otro: 'Otro'
    }
    return labels[tipo] || tipo
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

  const isProximoVencer = () => {
    const hoy = new Date()
    const diasRestantes = Math.ceil(
      (contrato.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diasRestantes <= 30 && diasRestantes > 0
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
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
              <p className="text-sm text-gray-500">{getTipoLabel(contrato.tipo)}</p>
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
              Vence: {format(contrato.fechaVencimiento, 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          
          {contrato.valor && (
            <div className="flex items-center text-sm text-gray-500">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              <span>
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: contrato.moneda || 'EUR'
                }).format(contrato.valor)}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>{contrato.departamento}</span>
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
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<EyeIcon className="h-4 w-4" />}
              onClick={() => {/* Ver contrato */}}
            >
              Ver
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={() => {/* Editar contrato */}}
            >
              Editar
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={onEliminar}
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