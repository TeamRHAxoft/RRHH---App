import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isToday, isSameDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

const STATUS_TEXT = {
  'Por hacer': 'text-gray-600 bg-gray-100',
  'En progreso': 'text-blue-700 bg-blue-50',
  'Hecho': 'text-green-700 bg-green-50',
}
const STATUS_COLORS = {
  'Por hacer': 'bg-gray-400',
  'En progreso': 'bg-blue-400',
  'Hecho': 'bg-green-400',
}

function getWeekStart(date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

function AddTaskModal({ date, currentUser, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Por hacer',
    assigned_to: currentUser || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('tasks').insert([{
      ...form,
      due_date: format(date, 'yyyy-MM-dd'),
      week_start: getWeekStart(date),
    }])
    onAdded()
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-semibold text-gray-800">Nueva tarea</h3>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarea *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="¿Qué hay que hacer?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option>Por hacer</option>
              <option>En progreso</option>
              <option>Hecho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
            <input
              type="text"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
              {loading ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CalendarView({ user }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [currentMonth])

  const fetchTasks = async () => {
    setLoading(true)
    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .or(`due_date.gte.${monthStart},week_start.gte.${monthStart}`)
      .or(`due_date.lte.${monthEnd},week_start.lte.${monthEnd}`)
      .order('created_at', { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }

  const getTasksForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const weekStr = getWeekStart(day)
    return tasks.filter((t) => {
      if (t.due_date) return t.due_date === dayStr
      return t.week_start === weekStr && isSameDay(day, startOfWeek(day, { weekStartsOn: 1 }))
    })
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
            className={`min-h-24 p-1.5 border-b border-r cursor-pointer transition-colors ${
              !isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-brand-50'
            } ${isSelected ? 'ring-2 ring-inset ring-brand-400' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                today ? 'bg-brand-600 text-white' : isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {format(d, 'd')}
              </span>
              {isCurrentMonth && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedDay(d); setShowAddModal(true) }}
                  className="opacity-0 hover:opacity-100 group-hover:opacity-100 text-gray-300 hover:text-brand-500 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {dayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${STATUS_TEXT[task.status]}`}>
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && <p className="text-xs text-gray-400 pl-1">+{dayTasks.length - 3} más</p>}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(<div key={day.toString()} className="grid grid-cols-7">{week}</div>)
    }
    return rows
  }

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Hoy</button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 border-r last:border-r-0">{d}</div>
          ))}
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <div>{renderDays()}</div>
        )}
      </div>

      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 capitalize">
              {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar tarea
            </button>
          </div>
          {selectedDayTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No hay tareas pendientes para este día.</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                    {task.assigned_to && <p className="text-xs text-brand-500 mt-0.5">{task.assigned_to.split('@')[0]}</p>}
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

      <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
        {[['bg-gray-400', 'Por hacer'], ['bg-blue-400', 'En progreso'], ['bg-green-400', 'Hecho']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {showAddModal && selectedDay && (
        <AddTaskModal
          date={selectedDay}
          currentUser={user?.email}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { fetchTasks(); setShowAddModal(false) }}
        />
      )}
    </div>
  )
}
