import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { supabase } from '../../lib/supabase'
import StageColumn from './StageColumn'
import AddCandidateModal from './AddCandidateModal'
import CandidateDetailModal from './CandidateDetailModal'
import { Plus } from 'lucide-react'

const STAGES = [
  'CV Recibido',
  'Screening',
  'Test',
  'Entrevista con Líder',
  '2da Entrevista con Líder',
  'Psicotécnico',
  'Preocupacional',
  'Propuesta Laboral',
  'Ingreso',
]

export default function SelectionBoard() {
  const [candidates, setCandidates] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
    const channel = supabase
      .channel('candidates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, fetchCandidates)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchCandidates = async () => {
    const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: true })
    setCandidates(data || [])
    setLoading(false)
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStage = destination.droppableId

    setCandidates((prev) =>
      prev.map((c) => (c.id === draggableId ? { ...c, stage: newStage } : c))
    )

    await supabase.from('candidates').update({ stage: newStage, updated_at: new Date() }).eq('id', draggableId)
  }

  const handleDelete = async (id) => {
    await supabase.from('candidates').delete().eq('id', id)
    setSelectedCandidate(null)
  }

  const handleUpdate = async (id, updates) => {
    await supabase.from('candidates').update({ ...updates, updated_at: new Date() }).eq('id', id)
    setSelectedCandidate(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Cargando candidatos...</div>
  }

  return (
    <div className="p-4 flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Pipeline de Selección</h2>
          <p className="text-sm text-gray-500">{candidates.length} candidatos en proceso</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo candidato
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
          {STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              candidates={candidates.filter((c) => c.stage === stage)}
              onCardClick={setSelectedCandidate}
            />
          ))}
        </div>
      </DragDropContext>

      {showAddModal && (
        <AddCandidateModal
          stages={STAGES}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchCandidates}
        />
      )}

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          stages={STAGES}
          onClose={() => setSelectedCandidate(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
