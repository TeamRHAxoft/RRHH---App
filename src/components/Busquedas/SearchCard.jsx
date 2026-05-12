import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ChevronDown, ChevronUp, Plus, Trash2, User, Building2 } from 'lucide-react'
import AddCandidateModal from './AddCandidateModal'

const STAGES = [
  'CV Recibido', 'Screening', 'Test', 'Entrevista con Líder',
  '2da Entrevista con Líder', 'Psicotécnico', 'Preocupacional',
  'Propuesta Laboral', 'Ingreso',
]

const STAGE_COLORS = {
  'CV Recibido': 'bg-gray-100 text-gray-600',
  'Screening': 'bg-blue-100 text-blue-700',
  'Test': 'bg-yellow-100 text-yellow-700',
  'Entrevista con Líder': 'bg-orange-100 text-orange-700',
  '2da Entrevista con Líder': 'bg-amber-100 text-amber-700',
  'Psicotécnico': 'bg-purple-100 text-purple-700',
  'Preocupacional': 'bg-pink-100 text-pink-700',
  'Propuesta Laboral': 'bg-indigo-100 text-indigo-700',
  'Ingreso': 'bg-green-100 text-green-700',
}

export default function SearchCard({ search, candidates, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)

  const handleDeleteSearch = async () => {
    if (confirm(`¿Eliminar la búsqueda "${search.name}"? Se eliminarán todos sus candidatos.`)) {
      await supabase.from('searches').delete().eq('id', search.id)
      onRefresh()
    }
  }

  const handleDeleteCandidate = async (id) => {
    await supabase.from('candidates').delete().eq('id', id)
    onRefresh()
  }

  const handleStageChange = async (candidateId, newStage) => {
    await supabase.from('candidates').update({ stage: newStage, updated_at: new Date() }).eq('id', candidateId)
    onRefresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{search.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{candidates.length} candidatos</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteSearch() }}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="px-4 pb-3 flex gap-0.5">
        {STAGES.map((stage) => {
          const count = candidates.filter((c) => c.stage === stage).length
          return (
            <div
              key={stage}
              title={`${stage}: ${count}`}
              className={`h-1.5 flex-1 rounded-full ${count > 0 ? 'bg-brand-400' : 'bg-gray-100'}`}
            />
          )
        })}
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin candidatos aún</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {candidates.map((c) => (
                <div key={c.id} className="flex items-center gap-2 px-4 py-2.5">
                  <div className="bg-brand-50 rounded-full p-1.5 flex-shrink-0">
                    <User className="w-3 h-3 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    {c.consultora && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400 truncate">{c.consultora}</p>
                      </div>
                    )}
                  </div>
                  <select
                    value={c.stage}
                    onChange={(e) => handleStageChange(c.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400 ${STAGE_COLORS[c.stage]}`}
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => handleDeleteCandidate(c.id)}
                    className="text-gray-300 hover:text-red-400 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-50">
            <button
              onClick={() => setShowAddCandidate(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-brand-600 hover:text-brand-800 hover:bg-brand-50 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar candidato
            </button>
          </div>
        </div>
      )}

      {showAddCandidate && (
        <AddCandidateModal
          searchId={search.id}
          searchName={search.name}
          onClose={() => setShowAddCandidate(false)}
          onAdded={onRefresh}
        />
      )}
    </div>
  )
}
