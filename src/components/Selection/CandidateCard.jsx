import { Draggable } from '@hello-pangea/dnd'
import { User, Briefcase } from 'lucide-react'

export default function CandidateCard({ candidate, index, onClick }) {
  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg p-3 border cursor-pointer transition-all ${
            snapshot.isDragging
              ? 'border-brand-400 shadow-lg rotate-1'
              : 'border-gray-200 hover:border-brand-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="bg-brand-100 rounded-full p-1.5 mt-0.5 flex-shrink-0">
              <User className="w-3 h-3 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{candidate.name}</p>
              {candidate.position && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-500 truncate">{candidate.position}</p>
                </div>
              )}
            </div>
          </div>
          {candidate.notes && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{candidate.notes}</p>
          )}
        </div>
      )}
    </Draggable>
  )
}
