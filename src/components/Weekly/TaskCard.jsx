import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Trash2, ChevronDown, ChevronUp, Pin, Archive, CornerUpLeft, Pencil, Calendar } from 'lucide-react'

const AVATAR_COLORS = ['bg-brand-400', 'bg-teal-400', 'bg-orange-400', 'bg-pink-400', 'bg-indigo-400']

const CARD_STYLES = {
  'Por hacer':   'bg-amber-50 border-amber-200',
  'En progreso': 'bg-blue-50 border-blue-200',
  'Hecho':       'bg-green-50 border-green-200',
}

function Avatar({ name, size = 'sm' }) {
  if (!name) return null
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length
  const sz = size === 'sm' ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-xs'
  return (
    <div className={`${sz} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function TaskCard({ task, index, onDelete, onUpdate, onTogglePin, onArchive, onMoveToCurrentWeek, readOnly, currentProfile, profiles }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: task.title, description: task.description || '', assigned_to: task.assigned_to || '', due_date: task.due_date || '' })

  const handleSave = async () => {
    await onUpdate(task.id, { ...form, due_date: form.due_date || null })
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      await onDelete(task.id)
    }
  }

  const isOwn = task.assigned_to === currentProfile?.display_name

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={readOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border transition-all ${
            snapshot.isDragging ? 'border-brand-400 shadow-lg bg-white' : `${CARD_STYLES[task.status] || CARD_STYLES['Por hacer']} hover:border-brand-200`
          } ${task.pinned ? 'ring-1 ring-brand-300' : ''}`}
        >
          {editing ? (
            <div className="p-3 space-y-2">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Descripción..."
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
              />
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              >
                <option value="">— Sin asignar —</option>
                {(profiles || []).map((p) => (
                  <option key={p.id} value={p.display_name}>{p.display_name}</option>
                ))}
                <option value="Selva y Lucila">Selva y Lucila</option>
              </select>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 text-xs border border-gray-300 rounded py-1 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} className="flex-1 text-xs bg-brand-600 text-white rounded py-1 hover:bg-brand-700">Guardar</button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {task.pinned && <Pin className="w-3 h-3 text-brand-400 flex-shrink-0" />}
                  <p className="text-sm font-medium text-gray-800 flex-1 cursor-pointer" onClick={() => !readOnly && setEditing(true)}>{task.title}</p>
                  {!readOnly && (
                    <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-brand-500 flex-shrink-0">
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {task.description && (
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
                      {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {readOnly ? (
                    <button
                      onClick={() => onMoveToCurrentWeek && onMoveToCurrentWeek(task.id)}
                      title="Mover a semana actual"
                      className="text-gray-300 hover:text-brand-500 p-0.5"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onTogglePin && onTogglePin(task.id, task.pinned)}
                        title={task.pinned ? 'Desfijar' : 'Fijar en todas las semanas'}
                        className={`p-0.5 ${task.pinned ? 'text-brand-400 hover:text-brand-600' : 'text-gray-300 hover:text-brand-400'}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      {task.pinned ? (
                        <button
                          onClick={() => onArchive && onArchive(task.id)}
                          title="Archivar en historial"
                          className="text-gray-300 hover:text-orange-400 p-0.5"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={handleDelete} className="text-gray-300 hover:text-red-400 p-0.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {expanded && task.description && (
                <p className="text-xs text-gray-500 mt-1.5">{task.description}</p>
              )}

              {task.due_date && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Calendar className="w-3 h-3 text-brand-400 flex-shrink-0" />
                  <span className="text-xs text-brand-500 font-medium">
                    {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {task.assigned_to && (
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${isOwn ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                    <Avatar name={task.assigned_to} />
                    <span>{task.assigned_to}</span>
                  </div>
                )}
                {task.created_by && task.created_by !== task.assigned_to && (() => {
                  const assignedToMe = isOwn
                  const assignedByMe = task.created_by === currentProfile?.display_name
                  if (assignedToMe && !assignedByMe) {
                    return (
                      <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full font-medium">
                        ← de {task.created_by}
                      </span>
                    )
                  }
                  if (!assignedToMe && assignedByMe) {
                    return (
                      <span className="text-xs bg-brand-50 text-brand-500 border border-brand-200 px-1.5 py-0.5 rounded-full font-medium">
                        → vos
                      </span>
                    )
                  }
                  return (
                    <span className="text-xs text-gray-400">de {task.created_by}</span>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
