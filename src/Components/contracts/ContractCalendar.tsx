import React, { useState, useMemo } from 'react'
import { useContracts } from '../../hooks/useContracts'
import { Contrato, EstadoContrato } from '../../types'
import { motion } from 'framer-motion'
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'start' | 'end' | 'review'
  contract: Contrato
  color: string
}

const ContractCalendar: React.FC = () => {
  const { data, isLoading } = useContracts()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const contracts = data?.contratos || []

  // Generate calendar events from contracts
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = []
    
    contracts
      .filter((contract: Contrato) => {
        const matchesSearch = 
          contract.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.contraparte.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || contract.estado === statusFilter
        
        return matchesSearch && matchesStatus
      })
      .forEach((contract: Contrato) => {
        const getEventColor = (status: EstadoContrato) => {
          switch (status) {
            case EstadoContrato.ACTIVO:
              return 'bg-green-500'
            case EstadoContrato.APROBADO:
              return 'bg-blue-500'
            case EstadoContrato.VENCIDO:
              return 'bg-red-500'
            case EstadoContrato.REVISION:
              return 'bg-yellow-500'
            case EstadoContrato.CANCELADO:
              return 'bg-gray-500'
            default:
              return 'bg-gray-400'
          }
        }

        const color = getEventColor(contract.estado)

        // Start date event
        if (contract.fechaInicio) {
          events.push({
            id: `${contract.id}-start`,
            title: contract.titulo,
            date: contract.fechaInicio,
            type: 'start',
            contract,
            color
          })
        }

        // End date event
        if (contract.fechaTermino) {
          events.push({
            id: `${contract.id}-end`,
            title: contract.titulo,
            date: contract.fechaTermino,
            type: 'end',
            contract,
            color
          })
        }

        // Review events (30 days before end)
        if (contract.fechaTermino && contract.estado === EstadoContrato.ACTIVO) {
          const reviewDate = new Date(contract.fechaTermino)
          reviewDate.setDate(reviewDate.getDate() - 30)
          
          if (reviewDate > new Date()) {
            events.push({
              id: `${contract.id}-review`,
              title: contract.titulo,
              date: reviewDate,
              type: 'review',
              contract,
              color: 'bg-orange-500'
            })
          }
        }
      })

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [contracts, searchTerm, statusFilter])

  // Get current month dates
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))

  const calendarDays = []
  const current = new Date(startDate)
  while (current <= endDate) {
    calendarDays.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'start':
        return 'Inicio'
      case 'end':
        return 'Fin'
      case 'review':
        return 'Revisión'
      default:
        return type
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'end':
        return <ClockIcon className="h-4 w-4" />
      case 'review':
        return <CalendarDaysIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
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
      {/* Filters and Controls */}
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
                <option value="revision">Revisión</option>
                <option value="aprobado">Aprobado</option>
                <option value="activo">Activo</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semana
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('es-MX', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day)
                  const isCurrentMonth = isSameMonth(day)
                  const isTodayDate = isToday(day)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-24 p-1 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                      } ${
                        isTodayDate ? 'bg-blue-50 border-blue-200' : ''
                      } ${
                        selectedDate?.toDateString() === day.toDateString() ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        !isCurrentMonth ? 'text-gray-400' : 
                        isTodayDate ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate text-white ${event.color}`}
                            title={`${getEventTypeLabel(event.type)}: ${event.title}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getEventTypeIcon(event.type)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayEvents.length - 3} más
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                {formatDate(selectedDate)}
              </h3>
              
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <div className="flex items-start space-x-2">
                      <div className={`p-1 rounded text-white ${event.color}`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getEventTypeLabel(event.type)} • {event.contract.contraparte}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          {formatCurrency(event.contract.monto)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay eventos para esta fecha
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Próximos Eventos</h3>
            
            <div className="space-y-3">
              {calendarEvents
                .filter(event => event.date >= new Date())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full text-white ${event.color}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.date.toLocaleDateString('es-MX')} • {getEventTypeLabel(event.type)}
                      </p>
                    </div>
                  </div>
                ))}
              
              {calendarEvents.filter(event => event.date >= new Date()).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay eventos próximos
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Leyenda</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Aprobado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Revisión</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Revisión próxima</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Vencido</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Cancelado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractCalendar
