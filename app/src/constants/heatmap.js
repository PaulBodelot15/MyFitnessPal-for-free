import { dateToISO } from '../lib/dates'

export const HEATMAP_WEEKS = 18
// Tolérance au-dessus de l'objectif avant de considérer que c'est un dépassement.
export const OVER_TOLERANCE_KCAL = 200

export function getHeatmapRange() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dow = (today.getDay() + 6) % 7 // 0 = lundi
  const monday = new Date(today)
  monday.setDate(monday.getDate() - dow)
  const first = new Date(monday)
  first.setDate(first.getDate() - (HEATMAP_WEEKS - 1) * 7)
  return { fromISO: dateToISO(first), toISO: dateToISO(today) }
}
