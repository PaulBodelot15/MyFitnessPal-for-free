import { useState } from 'react'
import { dateToISO } from '../lib/dates'
import { statusForKcal } from '../lib/streak'
import { HEATMAP_WEEKS, OVER_TOLERANCE_KCAL } from '../constants/heatmap'

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH_LABELS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
]

const STATUS_LABEL = {
  none: 'Rien inscrit',
  under: "Sous l'objectif",
  ok: 'Objectif atteint',
  over: `Dépassé de plus de ${OVER_TOLERANCE_KCAL} kcal`,
}

export default function CalorieHeatmap({ dailyTotals, kcalCible }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = dateToISO(today)

  const [selectedIso, setSelectedIso] = useState(todayIso)

  const currentMonday = new Date(today)
  currentMonday.setDate(currentMonday.getDate() - ((currentMonday.getDay() + 6) % 7))

  const firstMonday = new Date(currentMonday)
  firstMonday.setDate(firstMonday.getDate() - (HEATMAP_WEEKS - 1) * 7)

  const weeks = []
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstMonday)
      date.setDate(date.getDate() + w * 7 + d)
      const iso = dateToISO(date)
      const isFuture = date > today
      days.push({
        iso,
        date,
        isFuture,
        kcal: dailyTotals[iso] || 0,
        status: isFuture ? null : statusForKcal(dailyTotals[iso], kcalCible, OVER_TOLERANCE_KCAL),
      })
    }
    weeks.push(days)
  }

  let lastMonth = null
  const monthLabels = weeks.map((week) => {
    const month = week[0].date.getMonth()
    if (month !== lastMonth) {
      lastMonth = month
      return MONTH_LABELS[month]
    }
    return ''
  })

  const flatDays = weeks.flat()
  const selectedDay = flatDays.find((d) => d.iso === selectedIso)

  return (
    <div className="heatmap-wrapper">
      {selectedDay && !selectedDay.isFuture && (
        <div className="heatmap-detail">
          <span className={`heatmap-detail-dot heatmap-cell-${selectedDay.status}`} />
          <span className="heatmap-detail-date">{formatFullDate(selectedDay.date)}</span>
          <span className="heatmap-detail-sep">·</span>
          <span className="heatmap-detail-kcal">
            {selectedDay.kcal > 0 ? `${Math.round(selectedDay.kcal)} kcal` : STATUS_LABEL[selectedDay.status]}
          </span>
          {selectedDay.kcal > 0 && <span className="heatmap-detail-status">{STATUS_LABEL[selectedDay.status]}</span>}
        </div>
      )}

      <div className="heatmap-scroll">
        <div className="heatmap-body">
          <div className="heatmap-day-labels">
            <span className="heatmap-month-spacer" />
            {DAY_LETTERS.map((l, i) => (
              <span key={i} className="heatmap-day-label">
                {l}
              </span>
            ))}
          </div>
          <div>
            <div className="heatmap-months">
              {monthLabels.map((label, i) => (
                <span key={i} className="heatmap-month-label">
                  {label}
                </span>
              ))}
            </div>
            <div className="heatmap-grid">
              {weeks.map((week, wi) => (
                <div key={wi} className="heatmap-col">
                  {week.map((day) => (
                    <button
                      key={day.iso}
                      type="button"
                      disabled={day.isFuture}
                      onClick={() => setSelectedIso(day.iso)}
                      title={day.isFuture ? undefined : formatFullDate(day.date)}
                      className={[
                        'heatmap-cell',
                        day.isFuture ? 'heatmap-cell-future' : `heatmap-cell-${day.status}`,
                        day.iso === todayIso ? 'heatmap-cell-today' : '',
                        day.iso === selectedIso ? 'heatmap-cell-selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>
          <i className="heatmap-cell heatmap-cell-none" /> Rien inscrit
        </span>
        <span>
          <i className="heatmap-cell heatmap-cell-under" /> Sous l'objectif
        </span>
        <span>
          <i className="heatmap-cell heatmap-cell-ok" /> Objectif atteint
        </span>
        <span>
          <i className="heatmap-cell heatmap-cell-over" /> Dépassé (+{OVER_TOLERANCE_KCAL} kcal)
        </span>
      </div>
    </div>
  )
}

function formatFullDate(date) {
  const label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
