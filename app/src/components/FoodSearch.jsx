import { useEffect, useRef, useState } from 'react'
import { searchCiqual, searchOpenFoodFacts } from '../lib/foodSearch'
import { searchCustomFoods, addCustomFood } from '../lib/customFoods'
import { fetchPortionsForFood, addPortion } from '../lib/foodPortions'
import { useAuth } from '../context/AuthContext'
import ManualFoodForm from './ManualFoodForm'
import PortionPicker from './PortionPicker'

export default function FoodSearch({ onAdd, onClose }) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [offDown, setOffDown] = useState(false)
  const [selected, setSelected] = useState(null)
  const [creatingManual, setCreatingManual] = useState(false)
  const [adding, setAdding] = useState(false)
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
      const [ciqual, off, custom] = await Promise.allSettled([
        searchCiqual(query),
        searchOpenFoodFacts(query),
        searchCustomFoods(user.id, query),
      ])
      const combined = [
        ...(custom.status === 'fulfilled' ? custom.value : []),
        ...(ciqual.status === 'fulfilled' ? ciqual.value : []),
        ...(off.status === 'fulfilled' ? off.value : []),
      ]
      setResults(combined)
      if (ciqual.status === 'rejected' && off.status === 'rejected' && custom.status === 'rejected') {
        setError('La recherche a échoué. Réessaie dans un instant.')
      } else if (off.status === 'rejected') {
        setOffDown(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleManualCreate(values) {
    setAdding(true)
    try {
      const food = await addCustomFood(user.id, values)
      setCreatingManual(false)
      setSelected(food)
    } finally {
      setAdding(false)
    }
  }

  async function handleAdd(poidsG) {
    setAdding(true)
    try {
      await onAdd(selected, poidsG)
      setSelected(null)
      setQuery('')
      setResults([])
    } finally {
      setAdding(false)
    }
  }

  if (creatingManual) {
    return (
      <div className="food-search-panel">
        <button type="button" className="food-search-back" onClick={() => setCreatingManual(false)}>
          ← Retour à la recherche
        </button>
        <ManualFoodForm onSubmit={handleManualCreate} onCancel={() => setCreatingManual(false)} saving={adding} />
      </div>
    )
  }

  if (selected) {
    return (
      <div className="food-search-panel">
        <button type="button" className="food-search-back" onClick={() => setSelected(null)}>
          ← Retour à la recherche
        </button>
        <h3>{selected.nom_aliment}</h3>
        <div className="food-result-macros">
          <span>{selected.kcal_100g} kcal</span>
          <span>P {selected.proteines_100g} g</span>
          <span>L {selected.lipides_100g} g</span>
          <span>G {selected.glucides_100g} g</span>
          <span className="food-result-macros-note">/ 100 g</span>
        </div>

        <PortionPicker
          food={selected}
          userId={user.id}
          adding={adding}
          onConfirm={handleAdd}
          onCancel={onClose}
        />
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

      <button type="button" className="food-search-manual-btn" onClick={() => setCreatingManual(true)}>
        + Créer un aliment manuellement
      </button>

      {loading && <p className="dashboard-placeholder">Recherche…</p>}
      {error && <p className="auth-error">{error}</p>}
      {offDown && (
        <p className="food-search-notice">
          Open Food Facts est momentanément indisponible — résultats CIQUAL/perso uniquement pour l'instant.
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
              <span className="food-result-macros">
                <span>{food.kcal_100g} kcal</span>
                <span>P {food.proteines_100g} g</span>
                <span>L {food.lipides_100g} g</span>
                <span>G {food.glucides_100g} g</span>
                <span className="food-result-macros-note">/ 100 g</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

