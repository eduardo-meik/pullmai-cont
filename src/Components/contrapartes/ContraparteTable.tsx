import React, { useState } from 'react'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { ContraparteRelacion } from '../../types'

interface ContraparteTableProps {
  contrapartes: ContraparteRelacion[]
  onView: (contraparte: ContraparteRelacion) => void
  onEdit: (contraparte: ContraparteRelacion) => void
}

const ContraparteTable: React.FC<ContraparteTableProps> = ({
  contrapartes,
  onView,
  onEdit
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organización
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contratos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Contrato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contrapartes.map((contraparte) => (
              <tr key={contraparte.organizacionId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contraparte.organizacion.nombre}
                      </div>
                      {contraparte.organizacion.descripcion && (
                        <div className="text-sm text-gray-500">
                          {contraparte.organizacion.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {contraparte.estadisticas.contratosActivos}
                        </div>
                        <div className="text-xs text-gray-500">Activos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {contraparte.estadisticas.totalContratos}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      {contraparte.estadisticas.contratosProximosVencer > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {contraparte.estadisticas.contratosProximosVencer}
                          </div>
                          <div className="text-xs text-gray-500">Por vencer</div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-semibold text-lg">
                      {formatCurrency(contraparte.estadisticas.montoTotal)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Promedio: {formatCurrency(contraparte.estadisticas.montoPromedio)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    {contraparte.estadisticas.ultimoContrato && (
                      <div className="font-medium">
                        {formatDate(contraparte.estadisticas.ultimoContrato)}
                      </div>
                    )}
                    {contraparte.estadisticas.proximoVencimiento && (
                      <div className="text-xs text-orange-600 mt-1">
                        Próximo vencimiento: {formatDate(contraparte.estadisticas.proximoVencimiento)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {contraparte.estadisticas.contratosActivos > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Activo
                      </span>
                    )}
                    {contraparte.estadisticas.contratosVencidos > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                        {contraparte.estadisticas.contratosVencidos} vencidos
                      </span>
                    )}
                    {contraparte.estadisticas.contratosProximosVencer > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
                        {contraparte.estadisticas.contratosProximosVencer} por vencer
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(contraparte)}
                      className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(contraparte)}
                      className="text-primary-600 hover:text-primary-900 transition-colors p-1 rounded hover:bg-primary-50"
                      title="Ver contratos"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContraparteTable
