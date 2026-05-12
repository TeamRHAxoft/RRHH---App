import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const AVATAR_COLORS = ['bg-brand-400', 'bg-teal-400', 'bg-orange-400', 'bg-pink-400', 'bg-indigo-400']

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

export default function TaskCard({ task, index, onDelete, onUpdate, readOnly, currentProfile, profiles }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: task.title, description: task.description || '', assigned_to: task.assigned_to || '' })

  const handleSave = async () => {
    await onUpdate(task.id, form)
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
          className={`bg-white rounded-lg border transition-all ${
            snapshot.isDragging ? 'border-brand-400 shadow-lg' : 'border-gray-200 hover:border-brand-200'
          }`}
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
              </select>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 text-xs border border-gray-300 rounded py-1 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} className="flex-1 text-xs bg-brand-600 text-white rounded py-1 hover:bg-brand-700">Guardar</button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-sm font-medium text-gray-800 flex-1 cursor-pointer"
                  onClick={() => !readOnly && setEditing(true)}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {task.description && (
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
                      {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {!readOnly && (
                    <button onClick={handleDelete} className="text-gray-300 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {expanded && task.description && (
                <p className="text-xs text-gray-500 mt-1.5">{task.description}</p>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {task.assigned_to && (
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${isOwn ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                    <Avatar name={task.assigned_to} />
                    <span>{task.assigned_to}</span>
                  </div>
                )}
                {task.created_by && task.created_by !== task.assigned_to && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>por {task.created_by}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
