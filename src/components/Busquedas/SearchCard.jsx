import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ChevronDown, ChevronUp, Plus, Trash2, User, Building2, UserCheck } from 'lucide-react'
import AddCandidateModal from './AddCandidateModal'
import AddIngresoModal from '../Ingresos/AddIngresoModal'
import { STAGES_EXTERNAL, STAGES_INTERNAL, RESULTADO_OPTIONS } from '../../lib/constants'

const STAGE_STYLES = {
  'CV Recibido':                    { pill: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  'Screening':                      { pill: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  'Test':                           { pill: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  'Entrevista con Líder':           { pill: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  '2da Entrevista con Líder':       { pill: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  'Psicotécnico':                   { pill: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  'Preocupacional':                 { pill: 'bg-pink-100 text-pink-700',    dot: 'bg-pink-400' },
  'Propuesta Laboral':              { pill: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  'Ingreso':                        { pill: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'Entrevista individual':          { pill: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  'Test o Assessment Center (opcional)': { pill: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  'Entrevista con el Líder':        { pill: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  'Devolución':                     { pill: 'bg-teal-100 text-teal-700',    dot: 'bg-teal-400' },
  'No continua':                    { pill: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
  'Aceptó otra propuesta':          { pill: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
  'En standby':                     { pill: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
}

const DEFAULT_STYLE = { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }

export default function SearchCard({ search, candidates, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [ingresoCandidate, setIngresoCandidate] = useState(null)
  const isInternal = search.type === 'interna'
  const currentYear = new Date().getFullYear()
  const STAGES = isInternal ? STAGES_INTERNAL : STAGES_EXTERNAL

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

  const handleUpdate = async (candidateId, fields) => {
    await supabase.from('candidates').update({ ...fields, updated_at: new Date() }).eq('id', candidateId)
    onRefresh()
  }

  const stagesWithCandidates = STAGES.filter((s) => candidates.some((c) => c.stage === s))

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{search.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{candidates.length} candidato{candidates.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button onClick={(e) => { e.stopPropagation(); handleDeleteSearch() }} className="text-gray-300 hover:text-red-400 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {!expanded && candidates.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {stagesWithCandidates.map((stage) => {
            const count = candidates.filter((c) => c.stage === stage).length
            const { pill, dot } = STAGE_STYLES[stage] || DEFAULT_STYLE
            return (
              <div key={stage} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {stage}
                {count > 1 && <span className="ml-0.5 font-bold">×{count}</span>}
              </div>
            )
          })}
        </div>
      )}

      {expanded && (
        <div className="border-t border-gray-100">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin candidatos aún</p>
          ) : (
            <div>
              {STAGES.map((stage) => {
                const stageCandidates = candidates.filter((c) => c.stage === stage)
                if (stageCandidates.length === 0) return null
                const { pill, dot } = STAGE_STYLES[stage] || DEFAULT_STYLE
                return (
                  <div key={stage}>
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold ${pill}`}>
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {stage}
                      <span className="ml-auto opacity-60">{stageCandidates.length}</span>
                    </div>
                    {stageCandidates.map((c) => (
                      <div key={c.id} className="px-4 py-2.5 border-b border-gray-50 last:border-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="bg-brand-50 rounded-full p-1.5 flex-shrink-0">
                            <User className="w-3 h-3 text-brand-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                            {!isInternal && c.consultora && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-400 truncate">{c.consultora}</p>
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleDeleteCandidate(c.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pl-8">
                          <select
                            value={c.stage}
                            onChange={(e) => handleUpdate(c.id, { stage: e.target.value })}
                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400 ${pill}`}
                          >
                            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>

                          <input
                            type="date"
                            value={c.stage_date || ''}
                            onChange={(e) => handleUpdate(c.id, { stage_date: e.target.value || null })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-400"
                            title="Fecha en esta etapa"
                          />

                          {!isInternal && c.stage === 'Ingreso' && c.stage_date && (
                            <button
                              onClick={() => setIngresoCandidate(c)}
                              className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-full font-medium transition-colors"
                              title="Crear ingreso con estos datos"
                            >
                              <UserCheck className="w-3 h-3" />
                              Crear ingreso
                            </button>
                          )}

                          {isInternal && (
                            <select
                              value={c.resultado || ''}
                              onChange={(e) => handleUpdate(c.id, { resultado: e.target.value || null })}
                              className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400 ${
                                c.resultado === 'Quedó seleccionado para el puesto' ? 'bg-green-100 text-green-700' :
                                c.resultado === 'Quedó en la terna' ? 'bg-indigo-100 text-indigo-700' :
                                c.resultado === 'No avanza' ? 'bg-red-100 text-red-600' :
                                'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {RESULTADO_OPTIONS.map((r) => <option key={r} value={r}>{r || '— Resultado —'}</option>)}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => setShowAddCandidate(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-brand-600 hover:bg-brand-50 py-2 rounded-lg transition-colors"
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
          isInternal={isInternal}
          onClose={() => setShowAddCandidate(false)}
          onAdded={onRefresh}
        />
      )}

      {ingresoCandidate && (
        <AddIngresoModal
          tipo="general"
          year={currentYear}
          initialData={{
            nombre_apellido: ingresoCandidate.name,
            puesto: search.name,
            fuente_reclutamiento: ingresoCandidate.consultora || '',
            fecha_estimada_ingreso: ingresoCandidate.stage_date || '',
          }}
          onClose={() => setIngresoCandidate(null)}
          onAdded={() => setIngresoCandidate(null)}
        />
      )}
    </div>
  )
}
