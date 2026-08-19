import { useState } from 'react'

const FIELDS = [
  { key: 'poids_depart', label: 'Poids de départ (kg)', step: 0.1 },
  { key: 'poids_cible', label: 'Poids cible (kg)', step: 0.1 },
  { key: 'tdee_estime', label: 'TDEE estimé (kcal)', step: 1 },
  { key: 'kcal_cible', label: 'Objectif calorique (kcal)', step: 1 },
  { key: 'proteines_g', label: 'Protéines (g)', step: 1 },
  { key: 'lipides_g', label: 'Lipides (g)', step: 1 },
  { key: 'glucides_g', label: 'Glucides (g)', step: 1 },
]

export default function GoalsForm({ initialValues, onCancel, onSave, saving }) {
  const [values, setValues] = useState(initialValues)

  function handleChange(key, raw) {
    setValues((v) => ({ ...v, [key]: raw === '' ? '' : Number(raw) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(values)
  }

  const kcalCalcules = values.proteines_g * 4 + values.lipides_g * 9 + values.glucides_g * 4
  const ecart = Math.round(kcalCalcules - values.kcal_cible)

  return (
    <form className="goals-form" onSubmit={handleSubmit}>
      <h2>Modifier mes objectifs</h2>
      <p className="goals-form-hint">
        Une nouvelle ligne sera enregistrée — ton historique d'objectifs précédents reste conservé.
      </p>

      <div className="goals-form-grid">
        {FIELDS.map((field) => (
          <label key={field.key} className="goals-form-field">
            {field.label}
            <input
              type="number"
              step={field.step}
              value={values[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required
            />
          </label>
        ))}
      </div>

      {Math.abs(ecart) >= 20 && (
        <p className="goals-form-warning">
          ⚠️ Tes macros ({Math.round(kcalCalcules)} kcal calculées) ne correspondent pas exactement à ton
          objectif calorique ({values.kcal_cible} kcal) — écart de {ecart > 0 ? '+' : ''}{ecart} kcal.
        </p>
      )}

      <div className="goals-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
