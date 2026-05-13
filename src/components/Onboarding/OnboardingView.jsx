import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Pencil, X, Check, ChevronUp, ChevronDown } from 'lucide-react'

// ── Estructura completa ──────────────────────────────────────────────────────
const ESTRUCTURA = {
  principal: {
    label: 'Empresa Principal',
    areas: {
      'Desarrollo': {
        equipos: ['EECC','Framework','Plataforma','Restó','Nexo/Empleados','E-commerce','TeamQ','Pedidos','Pagos digitales','Facturador','Ventas','Stock','Tesorería','Compras'],
        puestos: ['Programador','QA','Analista Funcional'],
      },
      'Comercial': {
        equipos: ['Venta Canal','Venta Directa'],
        puestos: ['Ejecutivo de Cuentas'],
      },
      'Administración': {},
      'Backoffice': {
        equipos: ['Infraestructura','Desarrollo interno'],
        puestosMap: {
          'Infraestructura': ['Sysadmin','Técnico'],
          'Desarrollo interno': ['Programador','QA'],
        },
      },
      'Servicios': {
        equipos: ['Soporte EECC','Soporte Canal','Soporte Técnico','Soporte ERP','Soporte Restó','Tango University','Recepción Soporte'],
      },
    },
  },
  tfactura: {
    label: 'Tfactura',
    areas: {
      'Desarrollo': { puestos: ['Programador','QA'] },
      'Soporte': {},
      'Comercial': {},
      'Diseño': {},
      'Funcional': {},
    },
  },
}

function getPuestos(config, equipo) {
  if (!config) return []
  if (config.puestosMap && equipo) return config.puestosMap[equipo] || []
  return config.puestos || []
}

// ── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, index, total, onDelete, onUpdate, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ titulo: step.titulo, donde_encontrarlo: step.donde_encontrarlo || '' })

  const handleSave = async () => {
    await onUpdate(step.id, form)
    setEditing(false)
  }

  return (
    <div className="flex gap-3 group">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center z-10 shadow">
          {index + 1}
        </div>
        {index < total - 1 && <div className="w-0.5 bg-brand-200 flex-1 my-1" style={{ minHeight: '24px' }} />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 rounded-xl border transition-all ${editing ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white hover:border-brand-200'}`}>
        {editing ? (
          <div className="p-3 space-y-2">
            <input
              autoFocus
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Título del paso"
              className="w-full text-sm border border-brand-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <input
              value={form.donde_encontrarlo}
              onChange={(e) => setForm({ ...form, donde_encontrarlo: e.target.value })}
              placeholder="Dónde encontrarlo (link, plataforma, carpeta...)"
              className="w-full text-sm border border-brand-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-1 text-xs bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700">
                <Check className="w-3 h-3" /> Guardar
              </button>
              <button onClick={() => setEditing(false)} className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{step.titulo}</p>
              {step.donde_encontrarlo && (
                step.donde_encontrarlo.startsWith('http') ? (
                  <a href={step.donde_encontrarlo} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-600 hover:underline mt-0.5 block truncate">
                    🔗 {step.donde_encontrarlo}
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">{step.donde_encontrarlo}</p>
                )
              )}
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={onMoveUp} disabled={index === 0} className="text-gray-300 hover:text-brand-500 p-1 disabled:opacity-20">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={onMoveDown} disabled={index === total - 1} className="text-gray-300 hover:text-brand-500 p-1 disabled:opacity-20">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-brand-500 p-1">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(step.id)} className="text-gray-300 hover:text-red-400 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Roadmap ──────────────────────────────────────────────────────────────────
function Roadmap({ empresa, area, equipo, puesto }) {
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newDonde, setNewDonde] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchSteps() }, [empresa, area, equipo, puesto])

  const fetchSteps = async () => {
    setLoading(true)
    let q = supabase.from('onboarding_recursos').select('*')
      .eq('empresa', empresa).eq('area', area)
    if (equipo) q = q.eq('equipo', equipo); else q = q.is('equipo', null)
    if (puesto) q = q.eq('puesto', puesto); else q = q.is('puesto', null)
    const { data } = await q.order('orden', { ascending: true })
    setSteps(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    const orden = steps.length > 0 ? Math.max(...steps.map((s) => s.orden)) + 1 : 1
    await supabase.from('onboarding_recursos').insert([{
      empresa, area,
      equipo: equipo || null,
      puesto: puesto || null,
      titulo: newTitle.trim(),
      donde_encontrarlo: newDonde.trim() || null,
      orden,
    }])
    setNewTitle('')
    setNewDonde('')
    setAdding(false)
    fetchSteps()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este paso?')) {
      await supabase.from('onboarding_recursos').delete().eq('id', id)
      fetchSteps()
    }
  }

  const handleUpdate = async (id, fields) => {
    await supabase.from('onboarding_recursos').update({ ...fields, updated_at: new Date() }).eq('id', id)
    fetchSteps()
  }

  const handleMove = async (index, direction) => {
    const newSteps = [...steps]
    const swapIdx = index + direction
    const a = newSteps[index]
    const b = newSteps[swapIdx]
    await Promise.all([
      supabase.from('onboarding_recursos').update({ orden: b.orden }).eq('id', a.id),
      supabase.from('onboarding_recursos').update({ orden: a.orden }).eq('id', b.id),
    ])
    fetchSteps()
  }

  if (loading) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Cargando...</div>

  return (
    <div className="pt-2">
      {steps.length === 0 && !adding && (
        <p className="text-sm text-gray-400 mb-4">Sin pasos todavía. Agregá el primero.</p>
      )}

      {steps.map((step, i) => (
        <StepCard
          key={step.id}
          step={step}
          index={i}
          total={steps.length}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onMoveUp={() => handleMove(i, -1)}
          onMoveDown={() => handleMove(i, 1)}
        />
      ))}

      {adding ? (
        <div className="flex gap-3">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-brand-200 text-brand-700 text-sm font-bold flex items-center justify-center">
              {steps.length + 1}
            </div>
          </div>
          <div className="flex-1 bg-brand-50 border border-brand-200 rounded-xl p-3 space-y-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Título del paso *"
              className="w-full text-sm border border-brand-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <input
              value={newDonde}
              onChange={(e) => setNewDonde(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Dónde encontrarlo (link, plataforma, carpeta...)"
              className="w-full text-sm border border-brand-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex items-center gap-1 text-xs bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700">
                <Check className="w-3 h-3" /> Agregar
              </button>
              <button onClick={() => setAdding(false)} className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar paso
        </button>
      )}
    </div>
  )
}

// ── Main view ────────────────────────────────────────────────────────────────
export default function OnboardingView() {
  const [empresa, setEmpresa] = useState('principal')
  const [area, setArea] = useState(null)
  const [equipo, setEquipo] = useState(null)
  const [puesto, setPuesto] = useState(null)

  const empresaData = ESTRUCTURA[empresa]
  const areaConfig = area ? empresaData.areas[area] : null
  const equipos = areaConfig?.equipos || []
  const puestos = getPuestos(areaConfig, equipo)
  const needsEquipo = equipos.length > 0
  const needsPuesto = puestos.length > 0

  const handleEmpresa = (e) => { setEmpresa(e); setArea(null); setEquipo(null); setPuesto(null) }
  const handleArea = (a) => { setArea(a); setEquipo(null); setPuesto(null) }
  const handleEquipo = (e) => { setEquipo(e); setPuesto(null) }

  const canShowRoadmap = area && (!needsEquipo || equipo) && (!needsPuesto || puesto)

  const breadcrumb = [area, equipo, puesto].filter(Boolean).join(' › ')

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Onboarding</h2>
        <p className="text-sm text-gray-500 mt-0.5">Roadmap de incorporación por área y puesto</p>
      </div>

      {/* Empresa tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {Object.entries(ESTRUCTURA).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleEmpresa(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              empresa === key ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Área */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Área</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(empresaData.areas).map((a) => (
            <button
              key={a}
              onClick={() => handleArea(a)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                area === a
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Equipo */}
      {area && needsEquipo && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Equipo</p>
          <div className="flex flex-wrap gap-2">
            {equipos.map((e) => (
              <button
                key={e}
                onClick={() => handleEquipo(e)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  equipo === e
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Puesto */}
      {area && (!needsEquipo || equipo) && needsPuesto && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Puesto</p>
          <div className="flex flex-wrap gap-2">
            {puestos.map((p) => (
              <button
                key={p}
                onClick={() => setPuesto(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  puesto === p
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      {canShowRoadmap && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <h3 className="font-semibold text-gray-800">{breadcrumb}</h3>
          </div>
          <Roadmap
            key={`${empresa}-${area}-${equipo}-${puesto}`}
            empresa={empresa}
            area={area}
            equipo={equipo}
            puesto={puesto}
          />
        </div>
      )}

      {area && !canShowRoadmap && (
        <p className="text-sm text-gray-400">
          {needsEquipo && !equipo ? '← Seleccioná un equipo' : '← Seleccioná un puesto'}
        </p>
      )}
    </div>
  )
}
