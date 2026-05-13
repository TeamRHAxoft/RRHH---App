import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, GripVertical, ExternalLink, Pencil, X, Check } from 'lucide-react'

const AREAS = ['Desarrollo', 'Comercial', 'Administración', 'Backoffice', 'Servicios', 'Tfactura']

function RecursoRow({ recurso, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ titulo: recurso.titulo, donde_encontrarlo: recurso.donde_encontrarlo || '' })

  const handleSave = async () => {
    await onUpdate(recurso.id, form)
    setEditing(false)
  }

  const handleCancel = () => {
    setForm({ titulo: recurso.titulo, donde_encontrarlo: recurso.donde_encontrarlo || '' })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 border-b border-gray-100">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <input
          autoFocus
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder="Título del recurso"
          className="flex-1 text-sm border border-brand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
        <input
          value={form.donde_encontrarlo}
          onChange={(e) => setForm({ ...form, donde_encontrarlo: e.target.value })}
          placeholder="Dónde encontrarlo (link, plataforma, carpeta...)"
          className="flex-1 text-sm border border-brand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 hover:bg-gray-50 group">
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{recurso.titulo}</p>
        {recurso.donde_encontrarlo && (
          recurso.donde_encontrarlo.startsWith('http') ? (
            <a
              href={recurso.donde_encontrarlo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
            >
              <ExternalLink className="w-3 h-3" />
              {recurso.donde_encontrarlo}
            </a>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">{recurso.donde_encontrarlo}</p>
          )
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-brand-500 p-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(recurso.id)} className="text-gray-300 hover:text-red-400 p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function AddRecursoRow({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ titulo: '', donde_encontrarlo: '' })

  const handleAdd = async () => {
    if (!form.titulo.trim()) return
    await onAdd(form)
    setForm({ titulo: '', donde_encontrarlo: '' })
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar recurso
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-brand-50">
      <Plus className="w-4 h-4 text-brand-400 flex-shrink-0" />
      <input
        autoFocus
        value={form.titulo}
        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="Título del recurso *"
        className="flex-1 text-sm border border-brand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
      <input
        value={form.donde_encontrarlo}
        onChange={(e) => setForm({ ...form, donde_encontrarlo: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="Dónde encontrarlo (link, plataforma, carpeta...)"
        className="flex-1 text-sm border border-brand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
      <button onClick={handleAdd} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
      <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
    </div>
  )
}

function EquipoSection({ area, equipo, recursos, onAdd, onDelete, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false)
  const filtered = recursos.filter((r) => r.equipo === equipo)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 text-sm">{equipo || 'General'}</span>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{filtered.length} recursos</span>
        </div>
        <span className="text-gray-400 text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>
      {!collapsed && (
        <div className="bg-white">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">Sin recursos todavía.</p>
          ) : (
            filtered.map((r) => (
              <RecursoRow key={r.id} recurso={r} onDelete={onDelete} onUpdate={onUpdate} />
            ))
          )}
          <AddRecursoRow onAdd={(form) => onAdd({ ...form, equipo })} />
        </div>
      )}
    </div>
  )
}

function AreaSection({ area, equipos, recursos, onAdd, onDelete, onUpdate, onAddEquipo }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showNewEquipo, setShowNewEquipo] = useState(false)
  const [newEquipo, setNewEquipo] = useState('')
  const isDev = area === 'Desarrollo'

  const handleAddEquipo = () => {
    if (!newEquipo.trim()) return
    onAddEquipo(newEquipo.trim())
    setNewEquipo('')
    setShowNewEquipo(false)
  }

  const areaRecursos = recursos.filter((r) => r.area === area)
  const totalRecursos = areaRecursos.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800">{area}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{totalRecursos} recursos</span>
        </div>
        <span className="text-gray-400 text-sm">{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {isDev ? (
            <>
              {equipos.map((eq) => (
                <EquipoSection
                  key={eq}
                  area={area}
                  equipo={eq}
                  recursos={areaRecursos}
                  onAdd={onAdd}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
              {showNewEquipo ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newEquipo}
                    onChange={(e) => setNewEquipo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEquipo()}
                    placeholder="Nombre del equipo"
                    className="flex-1 text-sm border border-brand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  />
                  <button onClick={handleAddEquipo} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setShowNewEquipo(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewEquipo(true)}
                  className="flex items-center gap-2 text-sm text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg w-full transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar equipo
                </button>
              )}
            </>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-white">
                {areaRecursos.length === 0 ? (
                  <p className="text-sm text-gray-400 px-4 py-3">Sin recursos todavía.</p>
                ) : (
                  areaRecursos.map((r) => (
                    <RecursoRow key={r.id} recurso={r} onDelete={onDelete} onUpdate={onUpdate} />
                  ))
                )}
                <AddRecursoRow onAdd={(form) => onAdd({ ...form, equipo: null })} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OnboardingView() {
  const [recursos, setRecursos] = useState([])
  const [equiposDesarrollo, setEquiposDesarrollo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('onboarding_recursos')
      .select('*')
      .order('orden', { ascending: true })
    setRecursos(data || [])
    const devEquipos = [...new Set((data || []).filter((r) => r.area === 'Desarrollo' && r.equipo).map((r) => r.equipo))]
    setEquiposDesarrollo(devEquipos)
    setLoading(false)
  }

  const handleAdd = async ({ titulo, donde_encontrarlo, equipo, area }) => {
    await supabase.from('onboarding_recursos').insert([{ area, equipo: equipo || null, titulo, donde_encontrarlo: donde_encontrarlo || null }])
    fetchData()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este recurso?')) {
      await supabase.from('onboarding_recursos').delete().eq('id', id)
      fetchData()
    }
  }

  const handleUpdate = async (id, fields) => {
    await supabase.from('onboarding_recursos').update({ ...fields, updated_at: new Date() }).eq('id', id)
    fetchData()
  }

  const handleAddEquipo = (nombre) => {
    setEquiposDesarrollo((prev) => [...prev, nombre])
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Onboarding</h2>
        <p className="text-sm text-gray-500 mt-0.5">Recursos y cursos por área para nuevos ingresos</p>
      </div>
      {AREAS.map((area) => (
        <AreaSection
          key={area}
          area={area}
          equipos={area === 'Desarrollo' ? equiposDesarrollo : []}
          recursos={recursos}
          onAdd={(form) => handleAdd({ ...form, area })}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onAddEquipo={handleAddEquipo}
        />
      ))}
    </div>
  )
}
