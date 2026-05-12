import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Auth/Login'
import Header from './components/Layout/Header'
import WeeklyBoard from './components/Weekly/WeeklyBoard'
import CalendarView from './components/Calendar/CalendarView'
import BusquedasBoard from './components/Busquedas/BusquedasBoard'
import IngresosView from './components/Ingresos/IngresosView'
import DesempenoView from './components/Desempeno/DesempenoView'
import { Home, Search, CalendarDays, UserCheck, ClipboardList } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'weekly', label: 'Semana', icon: CalendarDays },
  { id: 'busquedas', label: 'Búsquedas', icon: Search },
  { id: 'ingresos', label: 'Ingresos', icon: UserCheck },
  { id: 'desempeno', label: 'Evaluación de Desempeño', icon: ClipboardList },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

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

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <CalendarView user={session.user} />}
        {activeTab === 'weekly' && <WeeklyBoard user={session.user} />}
        {activeTab === 'busquedas' && <BusquedasBoard />}
        {activeTab === 'ingresos' && <IngresosView />}
        {activeTab === 'desempeno' && <DesempenoView />}
      </main>
    </div>
  )
}
