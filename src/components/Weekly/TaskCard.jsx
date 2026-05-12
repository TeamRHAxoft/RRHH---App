import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Trash2, ChevronDown, ChevronUp, User } from 'lucide-react'

export default function TaskCard({ task, index, onDelete, onUpdate, readOnly, currentUser }) {
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

  const isOwn = task.assigned_to === currentUser

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={readOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border transition-all ${
            snapshot.isDragging
              ? 'border-brand-400 shadow-lg'
              : 'border-gray-200 hover:border-brand-200'
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
              <input
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                placeholder="Asignado a (email)"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
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

              {task.assigned_to && (
                <div className="flex items-center gap-1 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isOwn ? 'bg-brand-400' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-400 truncate">{task.assigned_to.split('@')[0]}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
