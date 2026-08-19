import { useEffect, useRef, useState } from 'react'
import { searchCiqual, searchOpenFoodFacts } from '../lib/foodSearch'

export default function FoodSearch({ onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [poids, setPoids] = useState('')
  const [adding, setAdding] = useState(false)
  const [offDown, setOffDown] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(runSearch, 400)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  async function runSearch() {
    setLoading(true)
    setError(null)
    setOffDown(false)
    try {
      const [ciqual, off] = await Promise.allSettled([
        searchCiqual(query),
        searchOpenFoodFacts(query),
      ])
      const combined = [
        ...(ciqual.status === 'fulfilled' ? ciqual.value : []),
        ...(off.status === 'fulfilled' ? off.value : []),
      ]
      setResults(combined)
      if (ciqual.status === 'rejected' && off.status === 'rejected') {
        setError('La recherche a échoué. Réessaie dans un instant.')
      } else if (off.status === 'rejected') {
        setOffDown(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    const poidsNum = Number(poids)
    if (!poidsNum || poidsNum <= 0) return
    setAdding(true)
    try {
      await onAdd(selected, poidsNum)
      setSelected(null)
      setPoids('')
      setQuery('')
      setResults([])
    } finally {
      setAdding(false)
    }
  }

  if (selected) {
    const ratio = (Number(poids) || 0) / 100
    return (
      <div className="food-search-panel">
        <button type="button" className="food-search-back" onClick={() => setSelected(null)}>
          ← Retour à la recherche
        </button>
        <h3>{selected.nom_aliment}</h3>
        <span className="food-source-tag">{sourceLabel(selected.source)}</span>

        <label className="goals-form-field" style={{ marginTop: '1rem' }}>
          Poids pesé (g)
          <input
            type="number"
            autoFocus
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            placeholder="ex: 150"
          />
        </label>

        {poids > 0 && (
          <div className="food-preview">
            <span>{round(selected.kcal_100g * ratio)} kcal</span>
            <span>{round(selected.proteines_100g * ratio)} g prot.</span>
            <span>{round(selected.lipides_100g * ratio)} g lip.</span>
            <span>{round(selected.glucides_100g * ratio)} g gluc.</span>
          </div>
        )}

        <div className="goals-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn-primary" onClick={handleAdd} disabled={!poids || adding}>
            {adding ? 'Ajout…' : 'Ajouter au journal'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="food-search-panel">
      <div className="food-search-top">
        <input
          type="text"
          className="food-search-input"
          placeholder="Rechercher un aliment (ex: poulet, riz, yaourt...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="button" className="btn-secondary" onClick={onClose}>
          Fermer
        </button>
      </div>

      {loading && <p className="dashboard-placeholder">Recherche…</p>}
      {error && <p className="auth-error">{error}</p>}
      {offDown && (
        <p className="food-search-notice">
          Open Food Facts est momentanément indisponible — résultats CIQUAL uniquement pour l'instant.
        </p>
      )}
      {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="dashboard-placeholder">Aucun résultat.</p>
      )}

      <ul className="food-results">
        {results.map((food) => (
          <li key={food.id}>
            <button type="button" className="food-result-item" onClick={() => setSelected(food)}>
              <span className="food-result-name">{food.nom_aliment}</span>
              <span className="food-result-meta">
                <span className="food-source-tag">{sourceLabel(food.source)}</span>
                {food.kcal_100g} kcal/100g
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function sourceLabel(source) {
  return source === 'ciqual' ? 'CIQUAL' : 'Open Food Facts'
}

function round(n) {
  return Math.round((n || 0) * 10) / 10
}
