import { supabase } from './supabase'

// Recherche dans la base CIQUAL (référence française, aliments bruts/génériques).
export async function searchCiqual(query) {
  const { data, error } = await supabase
    .from('ciqual_foods')
    .select('code_ciqual, nom_aliment, kcal_100g, proteines_100g, lipides_100g, glucides_100g')
    .ilike('nom_aliment', `%${query}%`)
    .limit(15)

  if (error) throw error

  return data.map((f) => ({
    source: 'ciqual',
    id: `ciqual-${f.code_ciqual}`,
    nom_aliment: f.nom_aliment,
    kcal_100g: f.kcal_100g,
    proteines_100g: f.proteines_100g,
    lipides_100g: f.lipides_100g,
    glucides_100g: f.glucides_100g,
  }))
}

// Recherche Open Food Facts, via une Supabase Edge Function (off-search) qui relaie
// vers l'API officielle "search-a-licious" (search.openfoodfacts.org/search).
// Pourquoi un relais et pas un appel direct depuis le navigateur : search-a-licious
// fait une vraie recherche plein texte et est fiable, mais ne renvoie pas les en-têtes
// CORS nécessaires — un navigateur bloque donc la réponse (testé : ça marche en curl,
// pas dans l'app). L'ancien essai direct sur world.openfoodfacts.org/api/v2/search
// avait le CORS mais ignorait silencieusement le terme de recherche. L'edge function
// contourne les deux problèmes : elle appelle search-a-licious côté serveur (pas de
// CORS entre serveurs) et renvoie le résultat à l'app avec les en-têtes corrects.
export async function searchOpenFoodFacts(query) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/off-search?q=${encodeURIComponent(query)}`

  const json = await fetchWithRetry(url, {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  })

  return (json.hits || [])
    .filter((p) => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
    .map((p) => ({
      source: 'openfoodfacts',
      id: `off-${p.code}`,
      nom_aliment: p.product_name,
      kcal_100g: round(p.nutriments['energy-kcal_100g']),
      proteines_100g: round(p.nutriments['proteins_100g']),
      lipides_100g: round(p.nutriments['fat_100g']),
      glucides_100g: round(p.nutriments['carbohydrates_100g']),
    }))
}

async function fetchWithRetry(url, headers = {}, attempts = 3) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok) return await res.json()
      lastError = new Error(`Open Food Facts a répondu ${res.status}`)
    } catch (err) {
      lastError = err
    }
    if (i < attempts - 1) await sleep(600)
  }
  throw new Error('Open Food Facts est indisponible pour le moment.', { cause: lastError })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function round(n) {
  return n == null ? 0 : Math.round(n * 10) / 10
}
