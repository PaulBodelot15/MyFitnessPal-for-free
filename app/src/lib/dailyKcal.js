import { supabase } from './supabase'

// Totaux kcal par jour sur une plage de dates, pour alimenter la heatmap de suivi.
export async function fetchDailyKcalTotals(userId, fromISO, toISO) {
  const { data, error } = await supabase
    .from('food_log')
    .select('date, kcal')
    .eq('user_id', userId)
    .gte('date', fromISO)
    .lte('date', toISO)

  if (error) throw error

  const totals = {}
  for (const row of data) {
    totals[row.date] = (totals[row.date] || 0) + row.kcal
  }
  return totals
}
