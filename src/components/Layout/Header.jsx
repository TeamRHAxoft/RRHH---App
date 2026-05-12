import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { LogOut, Users, History } from 'lucide-react'
import HistoryPanel from '../History/HistoryPanel'

export default function Header({ user }) {
  const [showHistory, setShowHistory] = useState(false)
  const handleLogout = () => supabase.auth.signOut()

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
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
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
    </>
  )
}
