import { useState } from 'react'
import { MEALS } from '../constants/meals'
import FoodLogList from './FoodLogList'
import FoodSearch from './FoodSearch'

export default function MealsJournal({ entries, goal, onAdd, onDelete }) {
  const [expanded, setExpanded] = useState(null)
  const [addingToMeal, setAddingToMeal] = useState(null)

  function toggleMeal(key) {
    setAddingToMeal(null)
    setExpanded((prev) => (prev === key ? null : key))
  }

  async function handleAdd(food, poidsG) {
    await onAdd(food, poidsG, addingToMeal)
    setAddingToMeal(null)
  }

  return (
    <div className="meals-journal-card">
      <h2 className="meals-journal-title">Journal du jour</h2>

      {MEALS.map((meal) => {
        const mealEntries = entries.filter((e) => e.repas === meal.key)
        const totalKcal = mealEntries.reduce((sum, e) => sum + e.kcal, 0)
        const targetKcal = goal.kcal_cible * meal.pct
        const pct = targetKcal ? Math.min(100, Math.round((totalKcal / targetKcal) * 100)) : 0
        const isExpanded = expanded === meal.key

        return (
          <div key={meal.key} className="meal-row-wrapper">
            <button
              type="button"
              className={`meal-row ${isExpanded ? 'meal-row-expanded' : ''}`}
              onClick={() => toggleMeal(meal.key)}
            >
              <span className="meal-row-emoji">{meal.emoji}</span>
              <span className="meal-row-info">
                <span className="meal-row-label">{meal.label}</span>
                <span className="meal-row-track">
                  <span className="meal-row-fill" style={{ width: `${pct}%` }} />
                </span>
              </span>
              <span className="meal-row-kcal">
                {Math.round(totalKcal)} <span className="meal-row-kcal-target">/ {Math.round(targetKcal)} kcal</span>
              </span>
              <span className="meal-row-chevron">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div className="meal-row-details">
                {addingToMeal === meal.key ? (
                  <FoodSearch onAdd={handleAdd} onClose={() => setAddingToMeal(null)} />
                ) : (
                  <>
                    <FoodLogList entries={mealEntries} onDelete={onDelete} emptyMessage="Rien ajouté pour ce repas." />
                    <button type="button" className="btn-primary meal-row-add-btn" onClick={() => setAddingToMeal(meal.key)}>
                      + Ajouter un aliment
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
