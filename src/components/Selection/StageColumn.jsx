import { Droppable } from '@hello-pangea/dnd'
import CandidateCard from './CandidateCard'

const STAGE_COLORS = {
  'CV Recibido': 'bg-gray-100 border-gray-300 text-gray-700',
  'Screening': 'bg-blue-50 border-blue-300 text-blue-700',
  'Test': 'bg-yellow-50 border-yellow-300 text-yellow-700',
  'Entrevista con Líder': 'bg-orange-50 border-orange-300 text-orange-700',
  '2da Entrevista con Líder': 'bg-amber-50 border-amber-300 text-amber-700',
  'Psicotécnico': 'bg-purple-50 border-purple-300 text-purple-700',
  'Preocupacional': 'bg-pink-50 border-pink-300 text-pink-700',
  'Propuesta Laboral': 'bg-indigo-50 border-indigo-300 text-indigo-700',
  'Ingreso': 'bg-green-50 border-green-300 text-green-700',
}

export default function StageColumn({ stage, candidates, onCardClick }) {
  const colorClass = STAGE_COLORS[stage] || 'bg-gray-100 border-gray-300 text-gray-700'

  return (
    <div className="flex-shrink-0 w-56 flex flex-col">
      <div className={`rounded-t-lg px-3 py-2 border-t border-x font-medium text-xs ${colorClass}`}>
        <span>{stage}</span>
        <span className="ml-2 bg-white bg-opacity-70 rounded-full px-1.5 py-0.5 text-xs">{candidates.length}</span>
      </div>
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-32 p-2 border rounded-b-lg space-y-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-50 border-brand-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={index}
                onClick={() => onCardClick(candidate)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
