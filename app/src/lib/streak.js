import { dateToISO } from './dates'

export function statusForKcal(kcal, kcalCible, overTolerance) {
  if (!kcal) return 'none'
  if (kcal < kcalCible) return 'under'
  if (kcal <= kcalCible + overTolerance) return 'ok'
  return 'over'
}

// Jours consécutifs, en partant d'aujourd'hui, où l'objectif a été strictement
// atteint. Un jour manqué (objectif non atteint, y compris "rien inscrit" ou
// journée en cours) casse le streak immédiatement — pas de rattrapage possible.
export function computeStreak(dailyTotals, kcalCible, overTolerance, todayIso) {
  const cursor = new Date(todayIso)
  let streak = 0
  while (true) {
    const iso = dateToISO(cursor)
    const status = statusForKcal(dailyTotals[iso], kcalCible, overTolerance)
    if (status !== 'ok') break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
