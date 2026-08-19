import { supabase } from './supabase'
import { rankByRelevance } from './foodSearch'

// Recherche dans les aliments créés manuellement par l'utilisateur.
export async function searchCustomFoods(userId, query) {
  const { data, error } = await supabase
    .from('custom_foods')
    .select('id, nom_aliment, kcal_100g, proteines_100g, lipides_100g, glucides_100g')
    .eq('user_id', userId)
    .ilike('nom_aliment', `%${query}%`)
    .limit(30)

  if (error) throw error

  return rankByRelevance(data, query, 'nom_aliment')
    .slice(0, 10)
    .map((f) => ({
      source: 'custom',
      id: `custom-${f.id}`,
      nom_aliment: f.nom_aliment,
      kcal_100g: f.kcal_100g,
      proteines_100g: f.proteines_100g,
      lipides_100g: f.lipides_100g,
      glucides_100g: f.glucides_100g,
    }))
}

export async function addCustomFood(userId, { nom_aliment, kcal_100g, proteines_100g, lipides_100g, glucides_100g }) {
  const { data, error } = await supabase
    .from('custom_foods')
    .insert({
      user_id: userId,
      nom_aliment,
      kcal_100g,
      proteines_100g: proteines_100g || 0,
      lipides_100g: lipides_100g || 0,
      glucides_100g: glucides_100g || 0,
    })
    .select()
    .single()

  if (error) throw error

  return {
    source: 'custom',
    id: `custom-${data.id}`,
    nom_aliment: data.nom_aliment,
    kcal_100g: data.kcal_100g,
    proteines_100g: data.proteines_100g,
    lipides_100g: data.lipides_100g,
    glucides_100g: data.glucides_100g,
  }
}
