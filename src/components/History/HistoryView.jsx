import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { format, startOfWeek, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react'

const STATUS_ICONS = {
  'Hecho': <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
  'En progreso': <Clock className="w-3.5 h-3.5 text-blue-500" />,
  'Por hacer': <Circle className="w-3.5 h-3.5 text-gray-400" />,
}

function getCurrentWeekStart() {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

export default function HistoryView() {
  const [allTasks, setAllTasks] = useState([])
  const [openWeeks, setOpenWeeks] = useState({})
  const [loading, setLoading] = useState(true)

  const currentWeekStart = format(getCurrentWeekStart(), 'yyyy-MM-dd')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .lt('week_start', currentWeekStart)
      .order('week_start', { ascending: false })
    setAllTasks(data || [])
    setLoading(false)
  }

  const groupedByWeek = allTasks.reduce((acc, task) => {
    if (!acc[task.week_start]) acc[task.week_start] = []
    acc[task.week_start].push(task)
    return acc
  }, {})

  const weeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a))

  const toggleWeek = (week) => {
    setOpenWeeks((prev) => ({ ...prev, [week]: !prev[week] }))
  }

  const formatWeekLabel = (weekStart) => {
    const d = new Date(weekStart + 'T12:00:00')
    const end = addWeeks(d, 1)
    return `${format(d, "d 'de' MMMM", { locale: es })} — ${format(addWeeks(d, 0), "d", { locale: es })+6} de ${format(d, "MMMM yyyy", { locale: es })}`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Cargando historial...</div>
  }

  if (weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Clock className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">No hay historial de semanas anteriores todavía.</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Historial de semanas</h2>
        <p className="text-sm text-gray-500">{weeks.length} semanas registradas</p>
      </div>

      <div className="space-y-3">
        {weeks.map((week) => {
          const weekTasks = groupedByWeek[week]
          const isOpen = openWeeks[week]
          const done = weekTasks.filter((t) => t.status === 'Hecho').length
          const total = weekTasks.length

          return (
            <div key={week} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleWeek(week)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-sm capitalize">{formatWeekLabel(week)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{total} tareas · {done} completadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-400 h-1.5 rounded-full transition-all"
                      style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-4 space-y-2">
                  {['Por hacer', 'En progreso', 'Hecho'].map((status) => {
                    const statusTasks = weekTasks.filter((t) => t.status === status)
                    if (statusTasks.length === 0) return null
                    return (
                      <div key={status}>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{status}</p>
                        <div className="space-y-1">
                          {statusTasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-2 py-1.5 px-2 rounded-lg bg-gray-50">
                              <span className="mt-0.5 flex-shrink-0">{STATUS_ICONS[task.status]}</span>
                              <div className="min-w-0">
                                <p className="text-sm text-gray-700">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                                )}
                                {task.assigned_to && (
                                  <p className="text-xs text-brand-500 mt-0.5">{task.assigned_to.split('@')[0]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
