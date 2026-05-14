import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { supabase } from '../../lib/supabase'
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import TaskColumn from './TaskColumn'
import AddTaskModal from './AddTaskModal'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUSES = ['Por hacer', 'En progreso', 'Hecho']

const STATUS_COLORS = {
  'Por hacer': 'bg-gray-100 border-gray-300 text-gray-600',
  'En progreso': 'bg-blue-50 border-blue-300 text-blue-700',
  'Hecho': 'bg-green-50 border-green-300 text-green-700',
}

function getWeekStart(offset = 0) {
  const d = addWeeks(new Date(), offset)
  return startOfWeek(d, { weekStartsOn: 1 })
}

export default function WeeklyBoard({ user }) {
  const [tasks, setTasks] = useState([])
  const [profiles, setProfiles] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const weekStart = getWeekStart(weekOffset)
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const weekLabel = `${format(weekStart, "d 'de' MMMM", { locale: es })} — ${format(weekEnd, "d 'de' MMMM", { locale: es })}`
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const currentWeekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const isCurrentWeek = weekOffset === 0

  useEffect(() => {
    fetchProfiles()
  }, [user])

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel('tasks-weekly')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [weekOffset])

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('display_name')
    setProfiles(data || [])
    const mine = (data || []).find((p) => p.id === user?.id)
    setCurrentProfile(mine || null)
  }

  const fetchTasks = async () => {
    setLoading(true)
    let q = supabase.from('tasks').select('*')
    if (isCurrentWeek) {
      q = q.or(`week_start.eq.${weekKey},pinned.eq.true`)
    } else {
      q = q.eq('week_start', weekKey)
    }
    q = q.or('archived.eq.false,archived.is.null')
      .order('pinned', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: true })
    const { data } = await q
    setTasks(data || [])
    setLoading(false)
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId

    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    )
    await supabase.from('tasks').update({ status: newStatus, updated_at: new Date() }).eq('id', draggableId)
  }

  const handleDelete = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
  }

  const handleUpdate = async (id, updates) => {
    await supabase.from('tasks').update({ ...updates, updated_at: new Date() }).eq('id', id)
  }

  const handleTogglePin = async (id, currentPinned) => {
    await supabase.from('tasks').update({ pinned: !currentPinned, updated_at: new Date() }).eq('id', id)
    fetchTasks()
  }

  const handleArchive = async (id) => {
    await supabase.from('tasks').update({ archived: true, pinned: false, updated_at: new Date() }).eq('id', id)
    fetchTasks()
  }

  const handleMoveToCurrentWeek = async (id) => {
    await supabase.from('tasks').update({ week_start: currentWeekKey, updated_at: new Date() }).eq('id', id)
    fetchTasks()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Cargando tareas...</div>
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isCurrentWeek ? 'Semana Actual' : weekOffset < 0 ? 'Semana Anterior' : 'Semana Siguiente'}
            </h2>
            <p className="text-sm text-gray-500 capitalize">{weekLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs px-3 py-1.5 rounded-lg border border-brand-300 text-brand-600 hover:bg-brand-50"
            >
              Hoy
            </button>
          )}
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {isCurrentWeek && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva tarea
            </button>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              colorClass={STATUS_COLORS[status]}
              tasks={tasks.filter((t) => t.status === status)}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onTogglePin={handleTogglePin}
              onArchive={handleArchive}
              onMoveToCurrentWeek={handleMoveToCurrentWeek}
              readOnly={!isCurrentWeek}
              currentProfile={currentProfile}
              profiles={profiles}
            />
          ))}
        </div>
      </DragDropContext>

      {showAddModal && (
        <AddTaskModal
          weekStart={weekKey}
          currentProfile={currentProfile}
          profiles={profiles}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchTasks}
        />
      )}
    </div>
  )
}
