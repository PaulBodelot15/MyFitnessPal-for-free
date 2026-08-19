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

// Recherche via l'API publique Open Food Facts (produits emballés/marques).
// Note : cette API publique renvoie des 503 de façon intermittente (vérifié : environ
// 1 requête sur 4 en échec). On retente une fois automatiquement avant d'abandonner —
// l'appelant gère ensuite l'échec définitif sans bloquer la recherche CIQUAL.
export async function searchOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(
    query
  )}&page_size=15&fields=code,product_name,product_name_fr,nutriments`

  const json = await fetchWithRetry(url)

  return (json.products || [])
    .filter((p) => (p.product_name || p.product_name_fr) && p.nutriments?.['energy-kcal_100g'] != null)
    .map((p) => ({
      source: 'openfoodfacts',
      id: `off-${p.code}`,
      nom_aliment: p.product_name_fr || p.product_name,
      kcal_100g: round(p.nutriments['energy-kcal_100g']),
      proteines_100g: round(p.nutriments['proteins_100g']),
      lipides_100g: round(p.nutriments['fat_100g']),
      glucides_100g: round(p.nutriments['carbohydrates_100g']),
    }))
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
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
