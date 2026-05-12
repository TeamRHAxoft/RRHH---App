import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X } from 'lucide-react'
import { AREAS, SOLICITANTES, PUESTOS, FUENTES_RECLUTAMIENTO } from '../../lib/constants'

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <option value="">— Seleccionar —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function AddIngresoModal({ tipo, year, onClose, onAdded, initialData = {} }) {
  const [form, setForm] = useState({
    nombre_apellido: initialData.nombre_apellido || '',
    area: initialData.area || '',
    puesto: initialData.puesto || '',
    solicitado_por: initialData.solicitado_por || '',
    fuente_reclutamiento: initialData.fuente_reclutamiento || '',
    fecha_estimada_ingreso: initialData.fecha_estimada_ingreso || '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('ingresos').insert([{
      ...form,
      fecha_estimada_ingreso: form.fecha_estimada_ingreso || null,
      tipo,
      year,
    }])
    onAdded()
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-800">Nuevo ingreso</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y apellido *</label>
            <input
              type="text"
              required
              value={form.nombre_apellido}
              onChange={(e) => set('nombre_apellido')(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Nombre Apellido"
            />
          </div>
          <SelectField label="Área" value={form.area} onChange={set('area')} options={AREAS} />
          <SelectField label="Puesto" value={form.puesto} onChange={set('puesto')} options={PUESTOS} />
          <SelectField label="Quien lo solicita" value={form.solicitado_por} onChange={set('solicitado_por')} options={SOLICITANTES} />
          <SelectField label="Fuente de reclutamiento" value={form.fuente_reclutamiento} onChange={set('fuente_reclutamiento')} options={FUENTES_RECLUTAMIENTO} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha estimada de ingreso</label>
            <input
              type="date"
              value={form.fecha_estimada_ingreso}
              onChange={(e) => set('fecha_estimada_ingreso')(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
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
