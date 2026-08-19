import { useEffect, useState } from 'react'
import { fetchPortionsForFood, addPortion } from '../lib/foodPortions'

// Portions génériques toujours proposées, même avant que l'utilisateur n'en ait
// créé une pour cet aliment précis. Approximatives par nature (une "cuillère à
// soupe" varie selon la densité de l'aliment), mais un bon point de départ.
const GENERIC_PORTIONS = [
  { label: 'Cuillère à café', poids_g: 5 },
  { label: 'Cuillère à soupe', poids_g: 15 },
  { label: 'Petite portion', poids_g: 50 },
  { label: 'Portion moyenne', poids_g: 100 },
  { label: 'Grande portion', poids_g: 150 },
]

export default function PortionPicker({ food, userId, adding, onConfirm, onCancel }) {
  const [mode, setMode] = useState('grams') // 'grams' | 'portion'
  const [savedPortions, setSavedPortions] = useState([])
  const [portionsLoading, setPortionsLoading] = useState(true)
  const [poids, setPoids] = useState('')
  const [selectedKey, setSelectedKey] = useState(null)
  const [creatingPortion, setCreatingPortion] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newGrams, setNewGrams] = useState('')
  const [savingPortion, setSavingPortion] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPortionsForFood(userId, food)
      .then((data) => !cancelled && setSavedPortions(data))
      .finally(() => !cancelled && setPortionsLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [food.id, userId])

  function selectPortion(key, grams) {
    setSelectedKey(key)
    setPoids(String(grams))
  }

  function handleGramsChange(v) {
    setSelectedKey(null)
    setPoids(v)
  }

  async function handleSaveNewPortion() {
    const grams = Number(newGrams)
    if (!newLabel.trim() || !grams || grams <= 0) return
    setSavingPortion(true)
    try {
      const portion = await addPortion(userId, food, { label: newLabel.trim(), poids_g: grams })
      setSavedPortions((prev) => [...prev, portion])
      selectPortion(`saved-${portion.id}`, portion.poids_g)
      setCreatingPortion(false)
      setNewLabel('')
      setNewGrams('')
    } finally {
      setSavingPortion(false)
    }
  }

  const ratio = (Number(poids) || 0) / 100

  return (
    <div>
      <div className="weight-mode-tabs">
        <button
          type="button"
          className={`weight-mode-tab ${mode === 'grams' ? 'weight-mode-tab-active' : ''}`}
          onClick={() => setMode('grams')}
        >
          Poids (g)
        </button>
        <button
          type="button"
          className={`weight-mode-tab ${mode === 'portion' ? 'weight-mode-tab-active' : ''}`}
          onClick={() => setMode('portion')}
        >
          Portion
        </button>
      </div>

      {mode === 'grams' && (
        <label className="goals-form-field" style={{ marginTop: '0.85rem' }}>
          Poids (g)
          <input type="number" autoFocus value={poids} onChange={(e) => handleGramsChange(e.target.value)} placeholder="ex: 150" />
        </label>
      )}

      {mode === 'portion' && (
        <div style={{ marginTop: '0.85rem' }}>
          {!portionsLoading && (
            <div className="portion-chips">
              {savedPortions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`portion-chip ${selectedKey === `saved-${p.id}` ? 'portion-chip-active' : ''}`}
                  onClick={() => selectPortion(`saved-${p.id}`, p.poids_g)}
                >
                  {p.label} <span className="portion-chip-grams">· {p.poids_g} g</span>
                </button>
              ))}
              {GENERIC_PORTIONS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={`portion-chip ${selectedKey === `generic-${p.label}` ? 'portion-chip-active' : ''}`}
                  onClick={() => selectPortion(`generic-${p.label}`, p.poids_g)}
                >
                  {p.label} <span className="portion-chip-grams">· ~{p.poids_g} g</span>
                </button>
              ))}
            </div>
          )}

          {!creatingPortion ? (
            <button type="button" className="food-search-manual-btn" onClick={() => setCreatingPortion(true)}>
              + Créer une portion perso pour cet aliment
            </button>
          ) : (
            <div className="portion-create">
              <label className="goals-form-field">
                Nom de la portion
                <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="ex: ma tranche de pain" />
              </label>
              <label className="goals-form-field">
                Poids (g)
                <input type="number" value={newGrams} onChange={(e) => setNewGrams(e.target.value)} placeholder="ex: 35" />
              </label>
              <div className="goals-form-actions" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setCreatingPortion(false)} disabled={savingPortion}>
                  Annuler
                </button>
                <button type="button" className="btn-primary" onClick={handleSaveNewPortion} disabled={savingPortion}>
                  {savingPortion ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {poids > 0 && (
        <div className="food-preview">
          <span>{round(food.kcal_100g * ratio)} kcal</span>
          <span>{round(food.proteines_100g * ratio)} g prot.</span>
          <span>{round(food.lipides_100g * ratio)} g lip.</span>
          <span>{round(food.glucides_100g * ratio)} g gluc.</span>
        </div>
      )}

      <div className="goals-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="button" className="btn-primary" onClick={() => onConfirm(Number(poids))} disabled={!poids || adding}>
          {adding ? 'Ajout…' : 'Ajouter au journal'}
        </button>
      </div>
    </div>
  )
}

function round(n) {
  return Math.round((n || 0) * 10) / 10
}
