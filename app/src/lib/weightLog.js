import { supabase } from './supabase'
import { todayISO } from './foodLog'

export async function fetchWeightLog(userId) {
  const { data, error } = await supabase
    .from('body_weight_log')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function addWeightEntry(userId, { date, poids_kg, note }) {
  const { data, error } = await supabase
    .from('body_weight_log')
    .insert({ user_id: userId, date, poids_kg, note: note || null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWeightEntry(id) {
  const { error } = await supabase.from('body_weight_log').delete().eq('id', id)
  if (error) throw error
}

export { todayISO }
