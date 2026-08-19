import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const MACRO_COLORS = {
  proteines: '#e0518a', // rose/rouge — convention protéines
  lipides: '#4f8ef7', // bleu — convention lipides
  glucides: '#f5a623', // orange — convention glucides
}

export default function GoalsCard({ goal, onEdit }) {
  const kcalProteines = goal.proteines_g * 4
  const kcalLipides = goal.lipides_g * 9
  const kcalGlucides = goal.glucides_g * 4
  const kcalTotal = kcalProteines + kcalLipides + kcalGlucides

  const data = [
    { name: 'Protéines', value: kcalProteines, color: MACRO_COLORS.proteines },
    { name: 'Lipides', value: kcalLipides, color: MACRO_COLORS.lipides },
    { name: 'Glucides', value: kcalGlucides, color: MACRO_COLORS.glucides },
  ]

  return (
    <div className="goals-card">
      <div className="goals-card-header">
        <div>
          <h2>Objectif actuel</h2>
          <p className="goals-date">Depuis le {formatDate(goal.date_debut)}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onEdit}>
          Modifier
        </button>
      </div>

      <div className="goals-body">
        <div className="goals-donut">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="goals-donut-center">
            <span className="goals-donut-kcal">{goal.kcal_cible}</span>
            <span className="goals-donut-label">kcal / jour</span>
          </div>
        </div>

        <div className="goals-macros">
          <MacroRow color={MACRO_COLORS.proteines} label="Protéines" grams={goal.proteines_g} kcal={kcalProteines} total={kcalTotal} />
          <MacroRow color={MACRO_COLORS.lipides} label="Lipides" grams={goal.lipides_g} kcal={kcalLipides} total={kcalTotal} />
          <MacroRow color={MACRO_COLORS.glucides} label="Glucides" grams={goal.glucides_g} kcal={kcalGlucides} total={kcalTotal} />
        </div>
      </div>

      <div className="goals-footer">
        <div className="goals-stat">
          <span className="goals-stat-label">Poids départ</span>
          <span className="goals-stat-value">{goal.poids_depart} kg</span>
        </div>
        <div className="goals-stat-arrow">→</div>
        <div className="goals-stat">
          <span className="goals-stat-label">Poids cible</span>
          <span className="goals-stat-value">{goal.poids_cible} kg</span>
        </div>
        <div className="goals-stat goals-stat-tdee">
          <span className="goals-stat-label">TDEE estimé</span>
          <span className="goals-stat-value">{goal.tdee_estime} kcal</span>
        </div>
      </div>
    </div>
  )
}

function MacroRow({ color, label, grams, kcal, total }) {
  const pct = total ? Math.round((kcal / total) * 100) : 0
  return (
    <div className="macro-row">
      <div className="macro-row-top">
        <span className="macro-dot" style={{ background: color }} />
        <span className="macro-label">{label}</span>
        <span className="macro-grams">{grams} g</span>
        <span className="macro-pct">{pct}%</span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
