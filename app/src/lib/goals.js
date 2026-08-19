import { supabase } from './supabase'

// L'objectif "actif" = la ligne avec la date_debut la plus récente.
export async function fetchActiveGoal(userId) {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('date_debut', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// Chaque sauvegarde crée une nouvelle ligne (historique des objectifs dans le temps).
export async function saveGoal(userId, goal) {
  const { data, error } = await supabase
    .from('user_goals')
    .insert({
      user_id: userId,
      date_debut: new Date().toISOString().slice(0, 10),
      poids_depart: goal.poids_depart,
      poids_cible: goal.poids_cible,
      tdee_estime: goal.tdee_estime,
      kcal_cible: goal.kcal_cible,
      proteines_g: goal.proteines_g,
      lipides_g: goal.lipides_g,
      glucides_g: goal.glucides_g,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
