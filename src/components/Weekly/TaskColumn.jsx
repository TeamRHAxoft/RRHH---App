import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'

export default function TaskColumn({ status, colorClass, tasks, onDelete, onUpdate, onTogglePin, onArchive, onMoveToCurrentWeek, readOnly, currentProfile, profiles }) {
  return (
    <div className="flex flex-col">
      <div className={`rounded-t-lg px-3 py-2 border-t border-x font-medium text-xs ${colorClass}`}>
        <span>{status}</span>
        <span className="ml-2 bg-white bg-opacity-70 rounded-full px-1.5 py-0.5 text-xs">{tasks.length}</span>
      </div>
      <Droppable droppableId={status} isDropDisabled={readOnly}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-48 p-2 border rounded-b-lg space-y-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-50 border-brand-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onTogglePin={onTogglePin}
                onArchive={onArchive}
                onMoveToCurrentWeek={onMoveToCurrentWeek}
                readOnly={readOnly}
                currentProfile={currentProfile}
                profiles={profiles}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
