import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: [CSS.Transform.toString(transform), isDragging ? 'scale(1.015)' : ''].filter(Boolean).join(' '),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={`sortable-card ${isDragging ? 'sortable-card-dragging' : ''}`}>
      <div className="sortable-card-handle" {...attributes} {...listeners} aria-label="Déplacer cette carte">
        <span className="sortable-card-grip" />
      </div>
      {children}
    </div>
  )
}
