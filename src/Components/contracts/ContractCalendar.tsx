import React, { useState, useMemo } from 'react'
import { useContracts } from '../../hooks/useContracts'
import { Contrato, EstadoContrato } from '../../types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  addDays,
  isToday
} from 'date-fns'
import { es } from 'date-fns/locale'
import ContractPDFViewer from './ContractPDFViewer'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'start' | 'end' | 'renewal'
  contract: Contrato
  color: string
  description: string
}

interface ContractDetailModalProps {
  isOpen: boolean
  onClose: () => void
  contract: Contrato
  onViewPDF: (url: string, title: string) => void
}

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ isOpen, onClose, contract, onViewPDF }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case EstadoContrato.ACTIVO: return 'bg-green-100 text-green-800'
      case EstadoContrato.APROBADO: return 'bg-blue-100 text-blue-800'
      case EstadoContrato.REVISION: return 'bg-yellow-100 text-yellow-800'
      case EstadoContrato.RENOVADO: return 'bg-purple-100 text-purple-800'
      case EstadoContrato.VENCIDO: return 'bg-gray-100 text-gray-800'
      case EstadoContrato.CANCELADO: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Detalles del Contrato</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{contract.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1">{contract.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contraparte</label>
                    <p className="text-sm text-gray-900">{contract.contraparte}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monto</label>
                    <p className="text-sm text-gray-900">{formatAmount(contract.monto)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Inicio</label>
                    <p className="text-sm text-gray-900">{format(contract.fechaInicio, 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Término</label>
                    <p className="text-sm text-gray-900">{format(contract.fechaTermino, 'dd/MM/yyyy')}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.estado)}`}>
                    {contract.estado.charAt(0).toUpperCase() + contract.estado.slice(1)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proyecto</label>
                  <p className="text-sm text-gray-900">{contract.proyecto || 'Sin asignar'}</p>
                </div>

                {contract.etiquetas.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Etiquetas</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contract.etiquetas.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  {contract.pdfUrl && (
                    <button
                      onClick={() => onViewPDF(contract.pdfUrl, contract.titulo)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <DocumentIcon className="h-4 w-4" />
                      <span>Ver PDF</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

const ContractCalendar: React.FC = () => {
  const { data, isLoading } = useContracts()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedContract, setSelectedContract] = useState<Contrato | null>(null)
  const [viewingPDF, setViewingPDF] = useState<{ url: string; title: string } | null>(null)

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
            case EstadoContrato.ACTIVO: return 'bg-green-500'
            case EstadoContrato.APROBADO: return 'bg-blue-500'
            case EstadoContrato.REVISION: return 'bg-yellow-500'
            case EstadoContrato.RENOVADO: return 'bg-purple-500'
            case EstadoContrato.VENCIDO: return 'bg-gray-500'
            case EstadoContrato.CANCELADO: return 'bg-red-500'
            default: return 'bg-gray-400'
          }
        }

        const color = getEventColor(contract.estado)

        // Add start date event
        events.push({
          id: `${contract.id}-start`,
          title: contract.titulo,
          date: contract.fechaInicio,
          type: 'start',
          contract,
          color,
          description: `Inicio: ${contract.contraparte}`
        })

        // Add end date event
        events.push({
          id: `${contract.id}-end`,
          title: contract.titulo,
          date: contract.fechaTermino,
          type: 'end',
          contract,
          color,
          description: `Término: ${contract.contraparte}`
        })

        // Add renewal event (30 days before end)
        const renewalDate = addDays(contract.fechaTermino, -30)
        if (renewalDate > new Date()) {
          events.push({
            id: `${contract.id}-renewal`,
            title: contract.titulo,
            date: renewalDate,
            type: 'renewal',
            contract,
            color: 'bg-orange-500',
            description: `Renovación: ${contract.contraparte}`
          })
        }
      })

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [contracts, searchTerm, statusFilter])

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.date, date))
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const previousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const nextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'start': return <CalendarDaysIcon className="h-3 w-3" />
      case 'end': return <ClockIcon className="h-3 w-3" />
      case 'renewal': return <DocumentTextIcon className="h-3 w-3" />
      default: return <CalendarDaysIcon className="h-3 w-3" />
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'start': return 'Inicio'
      case 'end': return 'Término'
      case 'renewal': return 'Renovación'
      default: return 'Evento'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando calendario...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              {Object.values(EstadoContrato).map(estado => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
            <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes anterior"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hoy
          </button>
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
            <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
          </div>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes siguiente"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="p-4 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isDayToday = isToday(day)

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-32 p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                      isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    } ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isDayToday ? 'text-blue-600 font-bold' : ''}`}>
                      {format(day, 'd')}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white truncate cursor-pointer ${event.color} hover:opacity-80 transition-opacity`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedContract(event.contract)
                          }}
                          title={`${getEventTypeLabel(event.type)}: ${event.title}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getEventTypeIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's events */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">
              {selectedDate ? `Eventos - ${format(selectedDate, 'dd/MM/yyyy')}` : 'Eventos de Hoy'}
            </h3>
            <div className="space-y-2">
              {(selectedDate ? selectedDateEvents : getEventsForDate(new Date())).length > 0 ? (
                (selectedDate ? selectedDateEvents : getEventsForDate(new Date())).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                    onClick={() => setSelectedContract(event.contract)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-block w-3 h-3 rounded-full ${event.color}`} />
                      <span className="text-sm font-medium text-gray-900">{getEventTypeLabel(event.type)}</span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium truncate">{event.title}</div>
                    <div className="text-xs text-gray-500 truncate">{event.description}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay eventos para {selectedDate ? 'esta fecha' : 'hoy'}
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Leyenda</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Inicio de contrato</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Término de contrato</span>
              </div>
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Renovación pendiente</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total contratos</span>
                <span className="text-sm font-medium text-gray-900">{contracts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Eventos este mes</span>
                <span className="text-sm font-medium text-gray-900">
                  {calendarEvents.filter(event => isSameMonth(event.date, currentDate)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Renovaciones pendientes</span>
                <span className="text-sm font-medium text-orange-700">
                  {calendarEvents.filter(event => event.type === 'renewal').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          isOpen={true}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
          onViewPDF={(url, title) => {
            setViewingPDF({ url, title })
            setSelectedContract(null)
          }}
        />
      )}

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <ContractPDFViewer
          isOpen={true}
          onClose={() => setViewingPDF(null)}
          pdfUrl={viewingPDF.url}
          contractTitle={viewingPDF.title}
        />
      )}
    </div>
  )
}

export default ContractCalendar
