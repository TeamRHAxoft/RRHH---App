import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X } from 'lucide-react'

export default function AddIngresoModal({ tipo, year, onClose, onAdded }) {
  const [form, setForm] = useState({
    nombre_apellido: '',
    area: '',
    puesto: '',
    solicitado_por: '',
    fuente_reclutamiento: '',
    fecha_estimada_ingreso: '',
  })
  const [loading, setLoading] = useState(false)

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

  const field = (key, label, required = false, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input
        type={type}
        required={required}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-800">Nuevo ingreso</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {field('nombre_apellido', 'Nombre y apellido', true)}
          {field('area', 'Área')}
          {field('puesto', 'Puesto')}
          {field('solicitado_por', 'Quien lo solicita')}
          {field('fuente_reclutamiento', 'Fuente de reclutamiento')}
          {field('fecha_estimada_ingreso', 'Fecha estimada de ingreso', false, 'date')}
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
