import { supabase } from './supabase'

export function todayISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export async function fetchLogForDate(userId, date) {
  const { data, error } = await supabase
    .from('food_log')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// `food` = un résultat de recherche (kcal_100g, proteines_100g, ...), `poidsG` = poids pesé en grammes.
export async function addFoodLogEntry(userId, date, food, poidsG) {
  const ratio = poidsG / 100
  const { data, error } = await supabase
    .from('food_log')
    .insert({
      user_id: userId,
      date,
      nom_aliment: food.nom_aliment,
      source: food.source,
      poids_g: poidsG,
      kcal: round(food.kcal_100g * ratio),
      proteines_g: round(food.proteines_100g * ratio),
      lipides_g: round(food.lipides_100g * ratio),
      glucides_g: round(food.glucides_100g * ratio),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFoodLogEntry(id) {
  const { error } = await supabase.from('food_log').delete().eq('id', id)
  if (error) throw error
}

function round(n) {
  return Math.round((n || 0) * 10) / 10
}
