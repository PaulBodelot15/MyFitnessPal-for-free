const MACRO_COLORS = {
  proteines: '#e0518a',
  lipides: '#4f8ef7',
  glucides: '#f5a623',
}

export default function DailyTotals({ entries, goal }) {
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

  return (
    <div className="goals-card">
      <div className="goals-card-header">
        <div>
          <h2>Aujourd'hui</h2>
          <p className="goals-date">
            {Math.round(totals.kcal)} / {goal.kcal_cible} kcal
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

      <div className="goals-macros" style={{ marginTop: '1.25rem' }}>
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
