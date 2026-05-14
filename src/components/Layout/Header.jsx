import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LogOut, Users, History, KeyRound, X, Pencil } from 'lucide-react'
import HistoryPanel from '../History/HistoryPanel'

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('Mínimo 6 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-800">Cambiar contraseña</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {success ? (
            <p className="text-green-600 text-sm text-center font-medium">¡Contraseña actualizada!</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Repetí la contraseña"
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

function EditNameModal({ currentName, userId, onClose, onSaved }) {
  const [name, setName] = useState(currentName || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre no puede estar vacío'); return }
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', userId)
    setLoading(false)
    if (error) { setError(error.message); return }
    onSaved(name.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-800">Editar nombre</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Ej: Lucila"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Header({ user }) {
  const [showHistory, setShowHistory] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showEditName, setShowEditName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const handleLogout = () => supabase.auth.signOut()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('display_name').eq('id', user.id).single()
      .then(({ data }) => { if (data) setDisplayName(data.display_name) })
  }, [user])

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">TeamRH</h1>
            <p className="text-xs text-gray-400">Axoft</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 group">
            <span className="text-sm text-gray-500">{displayName || user?.email}</span>
            <button
              onClick={() => setShowEditName(true)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-brand-500 transition-opacity p-0.5"
              title="Editar nombre"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
            title="Cambiar contraseña"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
            title="Historial de semanas"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:block">Historial</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </header>

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showEditName && (
        <EditNameModal
          currentName={displayName}
          userId={user?.id}
          onClose={() => setShowEditName(false)}
          onSaved={(name) => setDisplayName(name)}
        />
      )}
    </>
  )
}
