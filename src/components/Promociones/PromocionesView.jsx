import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, X } from 'lucide-react'
import { AREAS, SOLICITANTES, PUESTOS } from '../../lib/constants'

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

function DateCell({ value, onChange }) {
  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-400 rounded px-1 w-32 text-gray-700"
    />
  )
}

function TextCell({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value || '')

  const handleBlur = () => {
    setEditing(false)
    if (local !== (value || '')) onChange(local)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        className="text-xs border border-brand-300 rounded px-2 py-1 focus:outline-none w-full min-w-24"
      />
    )
  }
  return (
    <span
      onClick={() => { setLocal(value || ''); setEditing(true) }}
      className="cursor-pointer text-xs text-gray-700 hover:bg-brand-50 px-1 py-0.5 rounded block min-w-20 min-h-5"
    >
      {value || <span className="text-gray-300">—</span>}
    </span>
  )
}

function SelectCell({ value, onChange, options }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-400 rounded pr-5 pl-1 text-gray-700 cursor-pointer w-full appearance-auto"
      style={{ minWidth: '100px' }}
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function AddPromocionModal({ year, onClose, onAdded }) {
  const [form, setForm] = useState({ nombre_apellido: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('promociones_internas').insert([{ ...form, year }])
    onAdded()
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-800">Nueva promoción interna</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y apellido *</label>
            <input
              autoFocus
              required
              value={form.nombre_apellido}
              onChange={(e) => setForm({ ...form, nombre_apellido: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Nombre Apellido"
            />
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

export default function PromocionesView() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [rows, setRows] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

  useEffect(() => { fetchRows() }, [year])

  const fetchRows = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('promociones_internas')
      .select('*')
      .eq('year', year)
      .order('created_at', { ascending: true })
    setRows(data || [])
    setLoading(false)
  }

  const updateField = async (id, field, value) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
    await supabase.from('promociones_internas').update({ [field]: value, updated_at: new Date() }).eq('id', id)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este registro?')) {
      await supabase.from('promociones_internas').delete().eq('id', id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const H1 = 'bg-blue-600 text-white text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const HANT = 'bg-orange-400 text-white text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const HACT = 'bg-teal-500 text-white text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const H2 = 'bg-brand-100 text-brand-800 text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const CELL = 'px-3 py-2 border-b border-gray-100 align-middle'

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Promociones Internas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Seguimiento de colaboradores promovidos</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{rows.length} registro{rows.length !== 1 ? 's' : ''} en {year}</p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar promoción
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1600px' }}>
              <thead>
                <tr>
                  <th className={H1}>Nombre y apellido</th>
                  <th className={HANT}>Área anterior</th>
                  <th className={HANT}>Puesto anterior</th>
                  <th className={HANT}>Líder anterior</th>
                  <th className={H1}>Fecha ingreso nuevo puesto</th>
                  <th className={HACT}>Área actual</th>
                  <th className={HACT}>Puesto actual</th>
                  <th className={HACT}>Líder actual</th>
                  <th className={H2}>Entrevista status RH (90 días)</th>
                  <th className={H2}>¿Se hizo entrevista de status?</th>
                  <th className={H2}>Fecha envío consulta período de prueba (3 meses)</th>
                  <th className={H2}>¿Se envió consulta período de prueba?</th>
                  <th className={H2}>¿Pasó el período de prueba?</th>
                  <th className={H2}>Renuncia</th>
                  <th className={H2}>Despido</th>
                  <th className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center text-gray-400 text-sm py-12">
                      No hay registros para {year}. Hacé clic en "Agregar promoción".
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className={CELL + ' font-medium'}><TextCell value={row.nombre_apellido} onChange={(v) => updateField(row.id, 'nombre_apellido', v)} /></td>
                      <td className={CELL}><SelectCell value={row.area_anterior} onChange={(v) => updateField(row.id, 'area_anterior', v)} options={AREAS} /></td>
                      <td className={CELL}><SelectCell value={row.puesto_anterior} onChange={(v) => updateField(row.id, 'puesto_anterior', v)} options={PUESTOS} /></td>
                      <td className={CELL}><SelectCell value={row.lider_anterior} onChange={(v) => updateField(row.id, 'lider_anterior', v)} options={SOLICITANTES} /></td>
                      <td className={CELL}><DateCell value={row.fecha_nuevo_puesto} onChange={(v) => updateField(row.id, 'fecha_nuevo_puesto', v)} /></td>
                      <td className={CELL}><SelectCell value={row.area_actual} onChange={(v) => updateField(row.id, 'area_actual', v)} options={AREAS} /></td>
                      <td className={CELL}><SelectCell value={row.puesto_actual} onChange={(v) => updateField(row.id, 'puesto_actual', v)} options={PUESTOS} /></td>
                      <td className={CELL}><SelectCell value={row.lider_actual} onChange={(v) => updateField(row.id, 'lider_actual', v)} options={SOLICITANTES} /></td>
                      <td className={CELL}><DateCell value={row.entrevista_status_90dias} onChange={(v) => updateField(row.id, 'entrevista_status_90dias', v)} /></td>
                      <td className={CELL + ' text-center'}><BoolCell value={row.entrevista_status_hecha} onChange={(v) => updateField(row.id, 'entrevista_status_hecha', v)} /></td>
                      <td className={CELL}><DateCell value={row.fecha_envio_consulta_prueba} onChange={(v) => updateField(row.id, 'fecha_envio_consulta_prueba', v)} /></td>
                      <td className={CELL + ' text-center'}><BoolCell value={row.consulta_prueba_enviada} onChange={(v) => updateField(row.id, 'consulta_prueba_enviada', v)} /></td>
                      <td className={CELL + ' text-center'}><BoolCell value={row.paso_periodo_prueba} onChange={(v) => updateField(row.id, 'paso_periodo_prueba', v)} /></td>
                      <td className={CELL + ' text-center'}><BoolCell value={row.renuncia} onChange={(v) => updateField(row.id, 'renuncia', v)} /></td>
                      <td className={CELL + ' text-center'}><BoolCell value={row.despido} onChange={(v) => updateField(row.id, 'despido', v)} /></td>
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
      </div>

      {showAdd && (
        <AddPromocionModal
          year={year}
          onClose={() => setShowAdd(false)}
          onAdded={fetchRows}
        />
      )}
    </div>
  )
}
