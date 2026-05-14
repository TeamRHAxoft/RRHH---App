import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

const AREAS = ['Desarrollo', 'Comercial', 'Administración', 'Backoffice', 'Servicios', 'Tfactura']

const EQUIPOS_POR_AREA = {
  'Desarrollo':     ['EECC (AB)','EECC (JV)','EECC (AR)','Plataforma','Restó','Nexo','Empleados','TeamQ','E-Commerce','Framework','ERP Stock','ERP Tesorería','ERP Compras','Ventas','Facturador (MF)','Facturador (LY)','Pagos digitales','Pedidos'],
  'Comercial':      ['Venta Directa','Venta Canal'],
  'Administración': ['Administración'],
  'Backoffice':     ['Desarrollo interno','Infraestructura'],
  'Servicios':      ['Soporte Técnico','Soporte Canal','Soporte Restó','Soporte EECC','Tango University','Recepción Soporte'],
  'Tfactura':       ['Programadores','QA','Comercial/Soporte'],
}
const ESTADO_OPTIONS = ['', 'COMPLETO', 'En proceso', 'RECLAMADO']
const ESTADO_STYLES = {
  COMPLETO:     'bg-green-100 text-green-700',
  'En proceso': 'bg-yellow-100 text-yellow-700',
  RECLAMADO:    'bg-red-100 text-red-600',
  '':           'bg-gray-50 text-gray-400',
}

function TextCell({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value || '')

  const handleBlur = () => {
    setEditing(false)
    if (local !== (value || '')) onChange(local || null)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        className="text-xs border border-brand-300 rounded px-2 py-1 focus:outline-none w-full min-w-28"
      />
    )
  }
  return (
    <span
      onClick={() => { setLocal(value || ''); setEditing(true) }}
      className="cursor-pointer text-xs text-gray-700 hover:bg-brand-50 px-1 py-0.5 rounded block min-w-24 min-h-5"
    >
      {value || <span className="text-gray-300">—</span>}
    </span>
  )
}

function BoolCell({ value, onChange }) {
  return (
    <select
      value={value === null || value === undefined ? '' : value.toString()}
      onChange={(e) => {
        const v = e.target.value === '' ? null : e.target.value === 'true'
        onChange(v)
      }}
      className={`text-center text-sm rounded px-1 py-0.5 border-0 focus:outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer w-12 ${
        value === true ? 'bg-green-50 text-green-700' :
        value === false ? 'bg-red-50 text-red-600' :
        'bg-gray-50 text-gray-400'
      }`}
    >
      <option value="">—</option>
      <option value="true">✓</option>
      <option value="false">✗</option>
    </select>
  )
}

function NumberCell({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value ?? '')

  const handleBlur = () => {
    setEditing(false)
    const num = local === '' ? null : Number(local)
    if (num !== value) onChange(isNaN(num) ? null : num)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min="0"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        className="text-xs border border-brand-300 rounded px-1 py-1 focus:outline-none w-14 text-center"
      />
    )
  }
  return (
    <span
      onClick={() => { setLocal(value ?? ''); setEditing(true) }}
      className="cursor-pointer text-xs text-gray-700 hover:bg-brand-50 px-1 py-0.5 rounded block text-center min-h-5 min-w-10"
    >
      {value ?? <span className="text-gray-300">—</span>}
    </span>
  )
}

function AddEquipoModal({ area, year, tipo, trimestre, onClose, onAdded }) {
  const equipos = EQUIPOS_POR_AREA[area] || []
  const [nombre, setNombre] = useState(equipos.length > 0 ? equipos[0] : '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('evaluacion_desempeno').insert([{
      area, year, tipo, trimestre: trimestre || null, nombre_mando_medio: nombre,
    }])
    onAdded()
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-800">Agregar equipo — {area}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo *</label>
            {equipos.length > 0 ? (
              <select
                autoFocus
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {equipos.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            ) : (
              <input
                autoFocus
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Nombre del equipo"
              />
            )}
          </div>
          <div className="flex gap-3 pt-1">
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

function AreaTable({ area, year, tipo, trimestre }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { fetchRows() }, [area, year, tipo, trimestre])

  const buildQuery = () => {
    let q = supabase
      .from('evaluacion_desempeno')
      .select('*')
      .eq('area', area)
      .eq('year', year)
      .eq('tipo', tipo)
      .order('created_at', { ascending: true })
    if (trimestre) q = q.eq('trimestre', trimestre)
    else q = q.is('trimestre', null)
    return q
  }

  const fetchRows = async () => {
    setLoading(true)
    const { data } = await buildQuery()

    if ((data || []).length === 0 && (EQUIPOS_POR_AREA[area] || []).length > 0) {
      const toInsert = EQUIPOS_POR_AREA[area].map((equipo) => ({
        area, year, tipo,
        trimestre: trimestre || null,
        nombre_mando_medio: equipo,
      }))
      await supabase.from('evaluacion_desempeno').insert(toInsert)
      const { data: seeded } = await buildQuery()
      setRows(seeded || [])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  const updateField = async (id, field, value) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
    await supabase.from('evaluacion_desempeno').update({ [field]: value, updated_at: new Date() }).eq('id', id)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este registro?')) {
      await supabase.from('evaluacion_desempeno').delete().eq('id', id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const totals = {
    completo: rows.filter((r) => r.estado === 'COMPLETO').length,
    en_proceso: rows.filter((r) => r.estado === 'En proceso').length,
    reclamado: rows.filter((r) => r.estado === 'RECLAMADO').length,
  }

  const H = 'bg-blue-600 text-white text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const CELL = 'px-3 py-2 border-b border-gray-100 align-middle'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-800">{area}</h3>
          <div className="flex gap-3 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Completo: {totals.completo}</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">En proceso: {totals.en_proceso}</span>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Reclamado: {totals.reclamado}</span>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar equipo
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '1100px' }}>
            <thead>
              <tr>
                <th className={H}>Equipo</th>
                <th className={H}>¿Evaluaciones subidas?</th>
                <th className={H}>¿Feedback de colaboradores?</th>
                <th className={H}>¿Período de prueba subido?</th>
                <th className={H}>¿Cuál evaluación falta?</th>
                <th className={H}>Estado</th>
                <th className={H + ' text-center'}>Total Completo</th>
                <th className={H + ' text-center'}>Total Reclamado</th>
                <th className={H + ' text-center'}>Total En proceso</th>
                <th className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-400 text-sm py-8">
                    Sin datos. Hacé clic en "Agregar".
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className={CELL + ' font-medium'}>
                      <TextCell value={row.nombre_mando_medio} onChange={(v) => updateField(row.id, 'nombre_mando_medio', v)} />
                    </td>
                    <td className={CELL + ' text-center'}>
                      <BoolCell value={row.evaluaciones_subidas} onChange={(v) => updateField(row.id, 'evaluaciones_subidas', v)} />
                    </td>
                    <td className={CELL + ' text-center'}>
                      <BoolCell value={row.feedback_colaboradores} onChange={(v) => updateField(row.id, 'feedback_colaboradores', v)} />
                    </td>
                    <td className={CELL}>
                      <TextCell value={row.periodo_prueba_subido} onChange={(v) => updateField(row.id, 'periodo_prueba_subido', v)} />
                    </td>
                    <td className={CELL}>
                      <TextCell value={row.evaluacion_faltante} onChange={(v) => updateField(row.id, 'evaluacion_faltante', v)} />
                    </td>
                    <td className={CELL}>
                      <select
                        value={row.estado || ''}
                        onChange={(e) => updateField(row.id, 'estado', e.target.value || null)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400 ${ESTADO_STYLES[row.estado || '']}`}
                      >
                        {ESTADO_OPTIONS.map((o) => <option key={o} value={o}>{o || '— Estado —'}</option>)}
                      </select>
                    </td>
                    <td className={CELL + ' text-center'}>
                      <NumberCell value={row.total_completo} onChange={(v) => updateField(row.id, 'total_completo', v)} />
                    </td>
                    <td className={CELL + ' text-center'}>
                      <NumberCell value={row.total_reclamado} onChange={(v) => updateField(row.id, 'total_reclamado', v)} />
                    </td>
                    <td className={CELL + ' text-center'}>
                      <NumberCell value={row.total_en_proceso} onChange={(v) => updateField(row.id, 'total_en_proceso', v)} />
                    </td>
                    <td className={CELL + ' text-center'}>
                      <button onClick={() => handleDelete(row.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddEquipoModal
          area={area}
          year={year}
          tipo={tipo}
          trimestre={trimestre}
          onClose={() => setShowAdd(false)}
          onAdded={fetchRows}
        />
      )}
    </div>
  )
}

export default function DesempenoView() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Evaluación de Desempeño Anual</h2>
          <p className="text-sm text-gray-500 mt-0.5">Octubre / noviembre — seguimiento por área y equipo</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {AREAS.map((area) => (
          <AreaTable key={area} area={area} year={year} tipo="evaluacion_anual" trimestre={null} />
        ))}
      </div>
    </div>
  )
}

