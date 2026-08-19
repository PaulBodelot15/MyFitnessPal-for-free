import { useState } from 'react'
import { todayISO } from '../lib/weightLog'

export default function WeightForm({ onAdd, onCancel, saving }) {
  const [date, setDate] = useState(todayISO())
  const [poids, setPoids] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const poidsNum = Number(poids)
    if (!poidsNum || poidsNum <= 0) return
    onAdd({ date, poids_kg: poidsNum, note })
  }

  return (
    <form className="weight-form" onSubmit={handleSubmit}>
      <div className="weight-form-row">
        <label className="goals-form-field">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} required />
        </label>
        <label className="goals-form-field">
          Poids (kg)
          <input
            type="number"
            step="0.1"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            placeholder="ex: 72.3"
            autoFocus
            required
          />
        </label>
      </div>
      <label className="goals-form-field">
        Note (optionnel)
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex: à jeun, après entraînement..." />
      </label>
      <div className="goals-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}
