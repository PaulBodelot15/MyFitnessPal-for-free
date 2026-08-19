import { supabase } from './supabase'

// L'id d'un résultat de recherche est "<source>-<ref>" (ex: "ciqual-13005",
// "custom-<uuid>"). Le ref peut lui-même contenir des tirets (cas des uuid),
// donc on ne coupe que sur le premier "-".
export function parseFoodId(id) {
  const i = id.indexOf('-')
  return { source: id.slice(0, i), ref: id.slice(i + 1) }
}

export async function fetchPortionsForFood(userId, food) {
  const { source, ref } = parseFoodId(food.id)
  const { data, error } = await supabase
    .from('food_portions')
    .select('*')
    .eq('user_id', userId)
    .eq('food_source', source)
    .eq('food_ref', ref)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function addPortion(userId, food, { label, poids_g }) {
  const { source, ref } = parseFoodId(food.id)
  const { data, error } = await supabase
    .from('food_portions')
    .insert({
      user_id: userId,
      food_source: source,
      food_ref: ref,
      food_name: food.nom_aliment,
      label,
      poids_g,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePortion(id) {
  const { error } = await supabase.from('food_portions').delete().eq('id', id)
  if (error) throw error
}
