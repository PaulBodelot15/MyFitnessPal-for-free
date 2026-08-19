import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const q = url.searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return new Response(JSON.stringify({ hits: [] }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const offUrl = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(
    q
  )}&page_size=15&langs=fr&fields=code,product_name,nutriments`

  try {
    const res = await fetch(offUrl)
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Open Food Facts a répondu ${res.status}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }
    const data = await res.json()
    return new Response(JSON.stringify({ hits: data.hits ?? [] }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
