import { useState } from 'react'

export default function ManualFoodForm({ onSubmit, onCancel, saving }) {
  const [values, setValues] = useState({
    nom_aliment: '',
    kcal_100g: '',
    proteines_100g: '',
    lipides_100g: '',
    glucides_100g: '',
  })

  function set(key, v) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!values.nom_aliment.trim() || !values.kcal_100g) return
    onSubmit({
      nom_aliment: values.nom_aliment.trim(),
      kcal_100g: Number(values.kcal_100g),
      proteines_100g: Number(values.proteines_100g) || 0,
      lipides_100g: Number(values.lipides_100g) || 0,
      glucides_100g: Number(values.glucides_100g) || 0,
    })
  }

  return (
    <form className="goals-form" onSubmit={handleSubmit} style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
      <h2>Créer un aliment</h2>
      <p className="goals-form-hint">
        Renseigne les valeurs nutritionnelles pour 100 g — il sera ensuite disponible dans tes recherches.
      </p>

      <label className="goals-form-field">
        Nom de l'aliment
        <input
          type="text"
          value={values.nom_aliment}
          onChange={(e) => set('nom_aliment', e.target.value)}
          placeholder="ex: Barre protéinée maison"
          autoFocus
          required
        />
      </label>

      <div className="goals-form-grid" style={{ marginTop: '0.85rem' }}>
        <label className="goals-form-field">
          Kcal / 100 g
          <input type="number" step="1" value={values.kcal_100g} onChange={(e) => set('kcal_100g', e.target.value)} required />
        </label>
        <label className="goals-form-field">
          Protéines / 100 g
          <input type="number" step="0.1" value={values.proteines_100g} onChange={(e) => set('proteines_100g', e.target.value)} />
        </label>
        <label className="goals-form-field">
          Lipides / 100 g
          <input type="number" step="0.1" value={values.lipides_100g} onChange={(e) => set('lipides_100g', e.target.value)} />
        </label>
        <label className="goals-form-field">
          Glucides / 100 g
          <input type="number" step="0.1" value={values.glucides_100g} onChange={(e) => set('glucides_100g', e.target.value)} />
        </label>
      </div>

      <div className="goals-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Création…' : 'Créer et continuer'}
        </button>
      </div>
    </form>
  )
}
