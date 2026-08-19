export default function WeightLogList({ entries, onDelete }) {
  const recent = [...entries].reverse().slice(0, 8)

  if (recent.length === 0) return null

  return (
    <ul className="food-log-list">
      {recent.map((e) => (
        <li key={e.id} className="food-log-item">
          <div className="food-log-item-main">
            <span className="food-log-item-name">{e.poids_kg} kg</span>
            <span className="food-log-item-meta">
              {formatDate(e.date)}
              {e.note ? ` · ${e.note}` : ''}
            </span>
          </div>
          <button
            type="button"
            className="food-log-delete"
            aria-label={`Supprimer la pesée du ${e.date}`}
            onClick={() => onDelete(e.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
