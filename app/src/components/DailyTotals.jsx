import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const MACRO_COLORS = {
  proteines: '#e0518a',
  lipides: '#4f8ef7',
  glucides: '#f5a623',
}

export default function DailyTotals({ entries, goal, onEditGoal }) {
  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      proteines_g: acc.proteines_g + e.proteines_g,
      lipides_g: acc.lipides_g + e.lipides_g,
      glucides_g: acc.glucides_g + e.glucides_g,
    }),
    { kcal: 0, proteines_g: 0, lipides_g: 0, glucides_g: 0 }
  )

  const kcalRestant = Math.round(goal.kcal_cible - totals.kcal)

  const kcalProteines = totals.proteines_g * 4
  const kcalLipides = totals.lipides_g * 9
  const kcalGlucides = totals.glucides_g * 4
  const kcalConsommes = kcalProteines + kcalLipides + kcalGlucides

  const donutData = [
    { name: 'Protéines', value: kcalProteines, color: MACRO_COLORS.proteines },
    { name: 'Lipides', value: kcalLipides, color: MACRO_COLORS.lipides },
    { name: 'Glucides', value: kcalGlucides, color: MACRO_COLORS.glucides },
  ]

  return (
    <div className="goals-card">
      <div className="goals-card-header">
        <div>
          <h2>Aujourd'hui</h2>
          <p className="goals-date">
            Objectif : {goal.kcal_cible} kcal ·{' '}
            <button type="button" className="link-btn" onClick={onEditGoal}>
              Modifier
            </button>
          </p>
        </div>
        <div className={`kcal-remaining ${kcalRestant < 0 ? 'kcal-over' : ''}`}>
          {kcalRestant >= 0 ? `${kcalRestant} kcal restants` : `${Math.abs(kcalRestant)} kcal en trop`}
        </div>
      </div>

      <div className="daily-progress-track">
        <div
          className="daily-progress-fill"
          style={{ width: `${Math.min(100, (totals.kcal / goal.kcal_cible) * 100)}%` }}
        />
      </div>

      <div className="goals-body">
        <div className="goals-donut">
          {kcalConsommes > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="goals-donut-empty">Rien ajouté pour l'instant</div>
          )}
          {kcalConsommes > 0 && (
            <div className="goals-donut-center">
              <span className="goals-donut-kcal">{Math.round(totals.kcal)}</span>
              <span className="goals-donut-label">kcal consommés</span>
            </div>
          )}
        </div>

        <div className="goals-macros">
          <MacroProgress
            color={MACRO_COLORS.proteines}
            label="Protéines"
            value={totals.proteines_g}
            target={goal.proteines_g}
          />
          <MacroProgress
            color={MACRO_COLORS.lipides}
            label="Lipides"
            value={totals.lipides_g}
            target={goal.lipides_g}
          />
          <MacroProgress
            color={MACRO_COLORS.glucides}
            label="Glucides"
            value={totals.glucides_g}
            target={goal.glucides_g}
          />
        </div>
      </div>
    </div>
  )
}

function MacroProgress({ color, label, value, target }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div className="macro-row">
      <div className="macro-row-top">
        <span className="macro-dot" style={{ background: color }} />
        <span className="macro-label">{label}</span>
        <span className="macro-grams">
          {Math.round(value)} / {target} g
        </span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
