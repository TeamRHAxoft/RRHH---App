import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isToday, isSameDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'

const STATUS_COLORS = {
  'Por hacer': 'bg-gray-400',
  'En progreso': 'bg-blue-400',
  'Hecho': 'bg-green-400',
}

const STATUS_TEXT = {
  'Por hacer': 'text-gray-600 bg-gray-100',
  'En progreso': 'text-blue-700 bg-blue-50',
  'Hecho': 'text-green-700 bg-green-50',
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [currentMonth])

  const fetchTasks = async () => {
    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .gte('week_start', monthStart)
      .lte('week_start', monthEnd)
      .neq('status', 'Hecho')
      .order('created_at', { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }

  const getTasksForDay = (day) => {
    const weekStart = format(startOfWeek(day, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    return tasks.filter((t) => t.week_start === weekStart)
  }

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows = []
    let day = calStart

    while (day <= calEnd) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const d = day
        const dayTasks = getTasksForDay(d)
        const isCurrentMonth = isSameMonth(d, currentMonth)
        const isSelected = selectedDay && isSameDay(d, selectedDay)
        const today = isToday(d)

        week.push(
          <div
            key={d.toString()}
            onClick={() => setSelectedDay(isSameDay(d, selectedDay) ? null : d)}
            className={`min-h-24 p-2 border-b border-r cursor-pointer transition-colors ${
              !isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-brand-50'
            } ${isSelected ? 'ring-2 ring-inset ring-brand-400' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                today
                  ? 'bg-brand-600 text-white'
                  : isCurrentMonth
                  ? 'text-gray-800'
                  : 'text-gray-300'
              }`}>
                {format(d, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <span className="text-xs text-brand-600 font-medium">{dayTasks.length}</span>
              )}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              {dayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${STATUS_TEXT[task.status]}`}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <p className="text-xs text-gray-400 pl-1">+{dayTasks.length - 3} más</p>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {week}
        </div>
      )
    }
    return rows
  }

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 border-r last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <div>{renderDays()}</div>
        )}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3 capitalize">
            Semana del {format(startOfWeek(selectedDay, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}
          </h3>
          {selectedDayTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No hay tareas pendientes esta semana.</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    )}
                    {task.assigned_to && (
                      <p className="text-xs text-brand-500 mt-0.5">{task.assigned_to.split('@')[0]}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_TEXT[task.status]}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
        {Object.entries(STATUS_COLORS).filter(([s]) => s !== 'Hecho').map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {status}
          </div>
        ))}
      </div>
    </div>
  )
}
