import React, { useState, useMemo } from 'react'
import { useContracts } from '../../hooks/useContracts'
import { Contrato } from '../../types'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface GanttBar {
  id: string
  title: string
  startDate: Date
  endDate: Date
  progress: number
  status: string
  provider: string
  amount: number
}

const ContractGantt: React.FC = () => {
  const { data, isLoading } = useContracts()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const contracts = data?.contratos || []

  // Transform contracts to Gantt bars
  const ganttBars: GanttBar[] = useMemo(() => {
    return contracts      .filter((contract: Contrato) => {
        const matchesSearch = 
          contract.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.contraparte.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || contract.estado === statusFilter
        
        return matchesSearch && matchesStatus && contract.fechaInicio && contract.fechaTermino
      })
      .map((contract: Contrato) => {
        const startDate = contract.fechaInicio
        const endDate = contract.fechaTermino
        const today = new Date()
          // Calculate progress based on dates and status
        let progress = 0
        if (contract.estado === 'aprobado' || contract.estado === 'renovado') {
          progress = 100
        } else if (contract.estado === 'activo') {
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          progress = Math.max(0, Math.min(100, (daysPassed / totalDays) * 100))
        }
        
        return {
          id: contract.id,
          title: contract.titulo,
          startDate,
          endDate,
          progress,
          status: contract.estado,
          provider: contract.contraparte,
          amount: contract.monto
        }
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }, [contracts, searchTerm, statusFilter])

  // Generate timeline dates
  const timelineStart = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    return start
  }, [currentMonth])

  const timelineEnd = useMemo(() => {
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0)
    return end
  }, [currentMonth])

  const timelineDays = useMemo(() => {
    const days = []
    const current = new Date(timelineStart)
    while (current <= timelineEnd) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [timelineStart, timelineEnd])

  const getBarPosition = (bar: GanttBar) => {
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    const startOffset = Math.max(0, Math.ceil((bar.startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)))
    const endOffset = Math.min(totalDays, Math.ceil((bar.endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)))
    
    const left = (startOffset / totalDays) * 100
    const width = ((endOffset - startOffset) / totalDays) * 100
    
    return { left: `${left}%`, width: `${Math.max(width, 1)}%` }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'borrador': 'bg-gray-400',
      'activo': 'bg-green-500',
      'pendiente': 'bg-yellow-500',
      'finalizado': 'bg-blue-500',
      'cancelado': 'bg-red-500',
    }
    return colors[status as keyof typeof colors] || colors.borrador
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      notation: 'compact'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              <div className="flex items-center space-x-1 text-sm font-medium min-w-32 justify-center">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {currentMonth.toLocaleDateString('es-MX', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Timeline Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex">
                <div className="w-80 px-6 py-4 font-semibold text-gray-900 border-r border-gray-200">
                  Contratos
                </div>
                <div className="flex-1 relative">
                  <div className="flex h-16">
                    {/* Month Headers */}
                    {Array.from({ length: 3 }, (_, i) => {
                      const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1)
                      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
                      const monthWidth = (daysInMonth / timelineDays.length) * 100

                      return (
                        <div 
                          key={i}
                          className="border-r border-gray-300 flex items-center justify-center bg-gray-100"
                          style={{ width: `${monthWidth}%` }}
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {monthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Day Headers */}
                  <div className="flex h-8 border-t border-gray-200">
                    {timelineDays.map((day, index) => {
                      const isToday = day.toDateString() === new Date().toDateString()
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6
                      
                      return (
                        <div
                          key={index}
                          className={`flex-1 text-xs text-center py-1 border-r border-gray-100 ${
                            isToday ? 'bg-blue-100 text-blue-800 font-semibold' : 
                            isWeekend ? 'bg-gray-50 text-gray-500' : 'text-gray-600'
                          }`}
                          style={{ minWidth: '20px' }}
                        >
                          {day.getDate()}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Gantt Bars */}
            <div className="divide-y divide-gray-200">
              {ganttBars.map((bar, index) => {
                const position = getBarPosition(bar)
                
                return (
                  <motion.div
                    key={bar.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex hover:bg-gray-50 group"
                  >
                    {/* Contract Info */}
                    <div className="w-80 px-6 py-4 border-r border-gray-200">
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {bar.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {bar.provider}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-green-600">
                            {formatCurrency(bar.amount)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            bar.status === 'activo' ? 'bg-green-100 text-green-800' :
                            bar.status === 'finalizado' ? 'bg-blue-100 text-blue-800' :
                            bar.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            bar.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {bar.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative py-6">
                      <div className="absolute inset-0 flex items-center">
                        <div
                          className="relative h-6 rounded-md shadow-sm"
                          style={position}
                        >
                          {/* Bar Background */}
                          <div className={`h-full rounded-md ${getStatusColor(bar.status)} opacity-20`} />
                          
                          {/* Progress Bar */}
                          <div
                            className={`absolute top-0 left-0 h-full rounded-md ${getStatusColor(bar.status)} transition-all duration-300`}
                            style={{ width: `${bar.progress}%` }}
                          />
                          
                          {/* Bar Content */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white px-2 truncate">
                              {bar.progress > 0 && `${Math.round(bar.progress)}%`}
                            </span>
                          </div>
                          
                          {/* Hover Tooltip */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="text-center">
                              <div className="font-medium">{bar.title}</div>
                              <div>{formatDate(bar.startDate)} - {formatDate(bar.endDate)}</div>
                              <div>{formatCurrency(bar.amount)}</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Today Line */}
                      {(() => {
                        const today = new Date()
                        if (today >= timelineStart && today <= timelineEnd) {
                          const todayOffset = Math.ceil((today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
                          const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
                          const leftPosition = (todayOffset / totalDays) * 100
                          
                          return (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                              style={{ left: `${leftPosition}%` }}
                            />
                          )
                        }
                        return null
                      })()}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {ganttBars.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contratos para mostrar</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron contratos con los filtros aplicados en este período.'
              : 'Los contratos aparecerán aquí cuando tengan fechas de inicio y fin definidas.'
            }
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Borrador</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Activo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Finalizado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Cancelado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-0.5 h-4 bg-red-500"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractGantt
