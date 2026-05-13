import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, X, BarChart2, Download } from 'lucide-react'
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

function MetricCard({ label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red:    'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-brand-50 text-brand-700 border-brand-200',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 flex flex-col gap-1 ${colors[color]}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </div>
  )
}

function exportCSV(rows, year) {
  const headers = [
    'Nombre y apellido','Área anterior','Puesto anterior','Líder anterior',
    'Fecha ingreso nuevo puesto','Área actual','Puesto actual','Líder actual',
    'Entrevista status (90 días)','¿Entrevista hecha?','Fecha consulta período de prueba',
    '¿Consulta enviada?','¿Pasó período de prueba?','Renuncia','Despido',
  ]
  const bool = (v) => v === true ? 'Sí' : v === false ? 'No' : ''
  const csvRows = rows.map((r) => [
    r.nombre_apellido, r.area_anterior, r.puesto_anterior, r.lider_anterior,
    r.fecha_nuevo_puesto || '', r.area_actual, r.puesto_actual, r.lider_actual,
    r.entrevista_status_90dias || '', bool(r.entrevista_status_hecha),
    r.fecha_envio_consulta_prueba || '', bool(r.consulta_prueba_enviada),
    bool(r.paso_periodo_prueba), bool(r.renuncia), bool(r.despido),
  ].map((v) => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...csvRows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `promociones_internas_${year}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ReporteModal({ rows, year, onClose }) {
  const total = rows.length
  const pasaron = rows.filter((r) => r.paso_periodo_prueba === true).length
  const entrevistas = rows.filter((r) => r.entrevista_status_hecha === true).length
  const renuncias = rows.filter((r) => r.renuncia === true).length
  const despidos = rows.filter((r) => r.despido === true).length

  const byArea = AREAS.reduce((acc, area) => {
    const list = rows.filter((r) => r.area_actual === area)
    if (list.length > 0) acc[area] = list
    return acc
  }, {})

  const maxCount = Math.max(...Object.values(byArea).map((l) => l.length), 1)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-800">Reporte de Promociones Internas</h3>
            <p className="text-xs text-gray-400 mt-0.5">Año {year} · {total} registro{total !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          {/* Métricas */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Métricas generales</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard label="Total promovidos" value={total} color="blue" />
              <MetricCard label="Pasaron período de prueba" value={pasaron} color="green" />
              <MetricCard label="Entrevistas de status realizadas" value={entrevistas} color="purple" />
              <MetricCard label="Renuncias" value={renuncias} color="orange" />
              <MetricCard label="Despidos" value={despidos} color="red" />
              {total > 0 && (
                <MetricCard
                  label="% aprobación período de prueba"
                  value={`${Math.round((pasaron / total) * 100)}%`}
                  color="green"
                />
              )}
            </div>
          </div>

          {/* Desglose por área */}
          {Object.keys(byArea).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Desglose por área actual</p>
              <div className="space-y-2">
                {Object.entries(byArea)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([area, list]) => (
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-36 flex-shrink-0 truncate">{area}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full transition-all"
                        style={{ width: `${(list.length / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-4 text-right">{list.length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalle */}
          {total > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Detalle</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Nombre</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Área actual</th>
                      <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">Prueba</th>
                      <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">Renuncia</th>
                      <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">Despido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-1.5 font-medium text-gray-800">{r.nombre_apellido}</td>
                        <td className="px-3 py-1.5 text-gray-600">{r.area_actual || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-1.5 text-center">{r.paso_periodo_prueba === true ? '✓' : r.paso_periodo_prueba === false ? '✗' : '—'}</td>
                        <td className="px-3 py-1.5 text-center">{r.renuncia === true ? '✓' : '—'}</td>
                        <td className="px-3 py-1.5 text-center">{r.despido === true ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex-shrink-0">
          <button
            onClick={() => exportCSV(rows, year)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PromocionesView() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [rows, setRows] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showReporte, setShowReporte] = useState(false)
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowReporte(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Ver reporte
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar promoción
            </button>
          </div>
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

      {showReporte && (
        <ReporteModal
          rows={rows}
          year={year}
          onClose={() => setShowReporte(false)}
        />
      )}
    </div>
  )
}
