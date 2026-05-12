import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2 } from 'lucide-react'
import AddIngresoModal from './AddIngresoModal'
import { AREAS, SOLICITANTES, PUESTOS, FUENTES_RECLUTAMIENTO } from '../../lib/constants'

const BOOL_OPTIONS = [
  { value: null, label: '—' },
  { value: true, label: '✓' },
  { value: false, label: '✗' },
]

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
      onClick={() => setEditing(true)}
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
      className="text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-400 rounded px-1 text-gray-700 cursor-pointer w-full"
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function IngresosTable({ tipo, year }) {
  const [rows, setRows] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRows()
  }, [tipo, year])

  const fetchRows = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ingresos')
      .select('*')
      .eq('tipo', tipo)
      .eq('year', year)
      .order('created_at', { ascending: true })
    setRows(data || [])
    setLoading(false)
  }

  const updateField = async (id, field, value) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
    await supabase.from('ingresos').update({ [field]: value, updated_at: new Date() }).eq('id', id)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este registro?')) {
      await supabase.from('ingresos').delete().eq('id', id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const HEADER_BASE = 'bg-blue-600 text-white text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const HEADER_EXTRA = 'bg-brand-100 text-brand-800 text-xs font-semibold px-3 py-2 whitespace-nowrap'
  const CELL = 'px-3 py-2 border-b border-gray-100 align-middle'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">{rows.length} registros en {year}</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar ingreso
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '1400px' }}>
            <thead>
              <tr>
                {/* Blue columns - basic info */}
                <th className={HEADER_BASE}>Área</th>
                <th className={HEADER_BASE}>Puesto</th>
                <th className={HEADER_BASE}>Quien lo solicita</th>
                <th className={HEADER_BASE}>Fuente de reclutamiento</th>
                <th className={HEADER_BASE}>Nombre y apellido del candidato</th>
                <th className={HEADER_BASE}>Fecha estimada de ingreso</th>
                {/* Purple columns - tracking */}
                <th className={HEADER_EXTRA}>Entrevista seguimiento 60 días</th>
                <th className={HEADER_EXTRA}>¿Se hizo entrevista seguimiento?</th>
                <th className={HEADER_EXTRA}>Fecha envío consulta período de prueba (4 meses)</th>
                <th className={HEADER_EXTRA}>¿Se envió consulta período de prueba?</th>
                <th className={HEADER_EXTRA}>¿Pasó el período de prueba?</th>
                <th className={HEADER_EXTRA}>Renuncia</th>
                <th className={HEADER_EXTRA}>¿Se entregó el Kit Tango?</th>
                <th className={HEADER_EXTRA}>¿Es referido?</th>
                <th className={HEADER_EXTRA}>¿Quién lo refirió?</th>
                <th className={HEADER_EXTRA}>Resultado psicotécnico</th>
                <th className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center text-gray-400 text-sm py-12">
                    No hay registros para {year}. Hacé clic en "Agregar ingreso".
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className={CELL}><SelectCell value={row.area} onChange={(v) => updateField(row.id, 'area', v)} options={AREAS} /></td>
                    <td className={CELL}><SelectCell value={row.puesto} onChange={(v) => updateField(row.id, 'puesto', v)} options={PUESTOS} /></td>
                    <td className={CELL}><SelectCell value={row.solicitado_por} onChange={(v) => updateField(row.id, 'solicitado_por', v)} options={SOLICITANTES} /></td>
                    <td className={CELL}><SelectCell value={row.fuente_reclutamiento} onChange={(v) => updateField(row.id, 'fuente_reclutamiento', v)} options={FUENTES_RECLUTAMIENTO} /></td>
                    <td className={CELL + ' font-medium'}><TextCell value={row.nombre_apellido} onChange={(v) => updateField(row.id, 'nombre_apellido', v)} /></td>
                    <td className={CELL}><DateCell value={row.fecha_estimada_ingreso} onChange={(v) => updateField(row.id, 'fecha_estimada_ingreso', v)} /></td>
                    <td className={CELL}><DateCell value={row.fecha_entrevista_seguimiento} onChange={(v) => updateField(row.id, 'fecha_entrevista_seguimiento', v)} /></td>
                    <td className={CELL + ' text-center'}><BoolCell value={row.entrevista_seguimiento_hecha} onChange={(v) => updateField(row.id, 'entrevista_seguimiento_hecha', v)} /></td>
                    <td className={CELL}><DateCell value={row.fecha_envio_consulta_prueba} onChange={(v) => updateField(row.id, 'fecha_envio_consulta_prueba', v)} /></td>
                    <td className={CELL + ' text-center'}><BoolCell value={row.consulta_prueba_enviada} onChange={(v) => updateField(row.id, 'consulta_prueba_enviada', v)} /></td>
                    <td className={CELL + ' text-center'}><BoolCell value={row.paso_periodo_prueba} onChange={(v) => updateField(row.id, 'paso_periodo_prueba', v)} /></td>
                    <td className={CELL + ' text-center'}><BoolCell value={row.renuncia} onChange={(v) => updateField(row.id, 'renuncia', v)} /></td>
                    <td className={CELL + ' text-center'}><BoolCell value={row.kit_tango_entregado} onChange={(v) => updateField(row.id, 'kit_tango_entregado', v)} /></td>
                    <td className={CELL + ' text-center'}><BoolCell value={row.es_referido} onChange={(v) => updateField(row.id, 'es_referido', v)} /></td>
                    <td className={CELL}><TextCell value={row.referido_por} onChange={(v) => updateField(row.id, 'referido_por', v)} /></td>
                    <td className={CELL}><TextCell value={row.resultado_psicotecnico} onChange={(v) => updateField(row.id, 'resultado_psicotecnico', v)} /></td>
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

      {showAddModal && (
        <AddIngresoModal
          tipo={tipo}
          year={year}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchRows}
        />
      )}
    </div>
  )
}
