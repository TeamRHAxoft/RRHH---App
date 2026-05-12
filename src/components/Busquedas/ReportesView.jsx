import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, Briefcase, TrendingUp, Building2 } from 'lucide-react'

const STAGES = [
  'CV Recibido', 'Screening', 'Test', 'Entrevista con Líder',
  '2da Entrevista con Líder', 'Psicotécnico', 'Preocupacional',
  'Propuesta Laboral', 'Ingreso',
]

const COLORS = ['#8b5cf6', '#6d28d9', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6', '#4c1d95', '#ddd6fe', '#ede9fe']

export default function ReportesView() {
  const [searches, setSearches] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from('searches').select('*'),
      supabase.from('candidates').select('*'),
    ])
    setSearches(s || [])
    setCandidates(c || [])
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Cargando reportes...</div>

  // Candidates per stage
  const stageData = STAGES.map((stage) => ({
    stage: stage.length > 14 ? stage.substring(0, 14) + '…' : stage,
    fullStage: stage,
    cantidad: candidates.filter((c) => c.stage === stage).length,
  }))

  // Candidates per consultora
  const consultoraMap = {}
  candidates.forEach((c) => {
    const key = c.consultora || 'Sin consultora'
    consultoraMap[key] = (consultoraMap[key] || 0) + 1
  })
  const consultoraData = Object.entries(consultoraMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Stats
  const totalSearches = searches.length
  const externalSearches = searches.filter((s) => s.type === 'externa').length
  const internalSearches = searches.filter((s) => s.type === 'interna').length
  const ingresados = candidates.filter((c) => c.stage === 'Ingreso').length

  const STAT_CARDS = [
    { label: 'Total búsquedas', value: totalSearches, icon: Briefcase, color: 'bg-brand-100 text-brand-700' },
    { label: 'Búsquedas externas', value: externalSearches, icon: Building2, color: 'bg-blue-100 text-blue-700' },
    { label: 'Búsquedas internas', value: internalSearches, icon: Users, color: 'bg-purple-100 text-purple-700' },
    { label: 'Total candidatos', value: candidates.length, icon: Users, color: 'bg-orange-100 text-orange-700' },
    { label: 'Ingresos concretados', value: ingresados, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel by stage */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Candidatos por etapa</h3>
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stageData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name, props) => [value, props.payload.fullStage]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="cantidad" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By consultora */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Candidatos por consultora</h3>
          {consultoraData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={consultoraData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {consultoraData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per search detail */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Detalle por búsqueda</h3>
        {searches.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sin búsquedas todavía</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium pb-2 pr-4">Búsqueda</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-2 pr-4">Tipo</th>
                  <th className="text-center text-xs text-gray-500 font-medium pb-2 pr-4">Candidatos</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-2">Etapa más avanzada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {searches.map((s) => {
                  const searchCandidates = candidates.filter((c) => c.search_id === s.id)
                  const mostAdvanced = searchCandidates.reduce((max, c) => {
                    const idx = STAGES.indexOf(c.stage)
                    return idx > STAGES.indexOf(max) ? c.stage : max
                  }, 'CV Recibido')
                  return (
                    <tr key={s.id}>
                      <td className="py-2 pr-4 font-medium text-gray-800">{s.name}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.type === 'externa' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {s.type === 'externa' ? 'Externa' : 'Interna'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-center text-gray-600">{searchCandidates.length}</td>
                      <td className="py-2">
                        {searchCandidates.length > 0 ? (
                          <span className="text-xs text-gray-600">{mostAdvanced}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
