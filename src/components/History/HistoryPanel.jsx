import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { format, startOfWeek, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, RotateCcw } from 'lucide-react'

const STATUS_ICONS = {
  'Hecho': <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
  'En progreso': <Clock className="w-3.5 h-3.5 text-blue-500" />,
  'Por hacer': <Circle className="w-3.5 h-3.5 text-gray-400" />,
}

function getCurrentWeekStart() {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

export default function HistoryPanel({ onClose }) {
  const [allTasks, setAllTasks] = useState([])
  const [openWeeks, setOpenWeeks] = useState({})
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)

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

  const handleRestore = async (task) => {
    setRestoring(task.id)
    await supabase.from('tasks').update({ week_start: currentWeekStart, status: 'Por hacer', updated_at: new Date() }).eq('id', task.id)
    await fetchHistory()
    setRestoring(null)
  }

  const groupedByWeek = allTasks.reduce((acc, task) => {
    if (!acc[task.week_start]) acc[task.week_start] = []
    acc[task.week_start].push(task)
    return acc
  }, {})

  const weeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a))

  const toggleWeek = (week) => setOpenWeeks((prev) => ({ ...prev, [week]: !prev[week] }))

  const formatWeekLabel = (weekStart) => {
    const d = new Date(weekStart + 'T12:00:00')
    return `${format(d, "d 'de' MMMM", { locale: es })} — ${Number(format(d, 'd')) + 6} de ${format(d, "MMMM yyyy", { locale: es })}`
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Historial de semanas</h2>
            <p className="text-xs text-gray-400 mt-0.5">{weeks.length} semanas registradas</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400">Cargando...</div>
          ) : weeks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Clock className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No hay historial todavía.</p>
            </div>
          ) : (
            weeks.map((week) => {
              const weekTasks = groupedByWeek[week]
              const isOpen = openWeeks[week]
              const done = weekTasks.filter((t) => t.status === 'Hecho').length
              const total = weekTasks.length

              return (
                <div key={week} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleWeek(week)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <div className="text-left">
                        <p className="font-medium text-gray-800 text-sm capitalize">{formatWeekLabel(week)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{total} tareas · {done} completadas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-7 text-right">{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-200 p-3 space-y-1 bg-white">
                      {['Por hacer', 'En progreso', 'Hecho'].map((status) => {
                        const statusTasks = weekTasks.filter((t) => t.status === status)
                        if (statusTasks.length === 0) return null
                        return (
                          <div key={status}>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{status}</p>
                            {statusTasks.map((task) => (
                              <div key={task.id} className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                                <span className="mt-0.5 flex-shrink-0">{STATUS_ICONS[task.status]}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-gray-700">{task.title}</p>
                                  {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                                  {task.assigned_to && <p className="text-xs text-brand-500 mt-0.5">{task.assigned_to.split('@')[0]}</p>}
                                </div>
                                {task.status !== 'Hecho' && (
                                  <button
                                    onClick={() => handleRestore(task)}
                                    disabled={restoring === task.id}
                                    title="Restaurar a semana actual"
                                    className="flex-shrink-0 flex items-center gap-1 text-xs text-brand-600 hover:bg-brand-50 px-2 py-1 rounded-lg disabled:opacity-40"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    {restoring === task.id ? '...' : 'Restaurar'}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
