export default function FoodLogList({ entries, onDelete, emptyMessage = "Aucun aliment ajouté aujourd'hui." }) {
  if (entries.length === 0) {
    return <p className="dashboard-placeholder">{emptyMessage}</p>
  }

  return (
    <ul className="food-log-list">
      {entries.map((e) => (
        <li key={e.id} className="food-log-item">
          <div className="food-log-item-main">
            <span className="food-log-item-name">{e.nom_aliment}</span>
            <span className="food-log-item-meta">
              {e.poids_g} g · {Math.round(e.kcal)} kcal
            </span>
          </div>
          <button
            type="button"
            className="food-log-delete"
            aria-label={`Supprimer ${e.nom_aliment}`}
            onClick={() => onDelete(e.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
