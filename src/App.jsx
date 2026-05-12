import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Auth/Login'
import Header from './components/Layout/Header'
import SelectionBoard from './components/Selection/SelectionBoard'
import WeeklyBoard from './components/Weekly/WeeklyBoard'
import HistoryView from './components/History/HistoryView'
import { GitMerge, CalendarDays, Archive } from 'lucide-react'

const TABS = [
  { id: 'selection', label: 'Selección', icon: GitMerge },
  { id: 'weekly', label: 'Semana', icon: CalendarDays },
  { id: 'history', label: 'Historial', icon: Archive },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weekly')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={session.user} />

      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-x-auto overflow-y-auto">
        {activeTab === 'selection' && <SelectionBoard user={session.user} />}
        {activeTab === 'weekly' && <WeeklyBoard user={session.user} />}
        {activeTab === 'history' && <HistoryView />}
      </main>
    </div>
  )
}
