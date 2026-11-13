/**
 * Live data and stock-price API for the S&P 100 tracker served at
 * /sp100-capex-dashboard/. HTML/CSS/JS come from the mounted origin.
 *
 * /data/* is proxied to the upstream Pages project (GH Actions refresh
 * the JSON on weekdays). If that fetch fails, the bundled snapshot is
 * served. /api/stock-price is answered here from Yahoo Finance.
 */

const UPSTREAM = 'https://sp100-financial-tracker.pages.dev'
const UA = 'gokhanturhan.com/sp100-capex-dashboard (+https://gokhanturhan.com)'

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? 'public, max-age=30, s-maxage=60' : 'no-store',
      ...extra,
    },
  })
}

async function stockPrice(request) {
  const url = new URL(request.url)
  const symbol = (url.searchParams.get('symbol') || '').trim().toUpperCase()
  if (!symbol || !/^[A-Z0-9.^]{1,12}$/.test(symbol)) {
    return json({ error: 'Symbol parameter required' }, 400)
  }
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    )
    if (!res.ok) {
      return json({ error: `Yahoo Finance returned ${res.status}` }, 502)
    }
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) {
      return json({ error: 'Unable to fetch stock price from Yahoo Finance' }, 502)
    }
    return json({
      price: meta.regularMarketPrice,
      changePercent: meta.regularMarketChangePercent || 0,
      source: 'Yahoo Finance (FREE)',
      symbol,
      marketCap: meta.marketCap || null,
      volume: meta.regularMarketVolume || null,
      dayHigh: meta.regularMarketDayHigh || null,
      dayLow: meta.regularMarketDayLow || null,
    })
  } catch (err) {
    return json({ error: String(err && err.message ? err.message : err) }, 502)
  }
}

async function proxyData(context, rest, search) {
  try {
    const up = await fetch(`${UPSTREAM}${rest}${search}`, {
      headers: { Accept: 'application/json', 'User-Agent': UA },
    })
    const ct = up.headers.get('content-type') || ''
    if (up.ok && (/json|text|javascript/i.test(ct) || rest.endsWith('.json'))) {
      const body = await up.arrayBuffer()
      // Upstream 200s HTML for missing files; only pass real JSON through.
      const head = new TextDecoder().decode(body.slice(0, 32)).trim()
      if (head.startsWith('{') || head.startsWith('[')) {
        return new Response(body, {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
          },
        })
      }
    }
  } catch (err) {
    console.warn('sp100 data proxy failed', rest, err)
  }
  return context.next()
}

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const rest = url.pathname.replace(/^\/sp100-capex-dashboard/, '') || '/'
  if (rest === '/api/stock-price' || rest === '/api/stock-price/') {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    return stockPrice(request)
  }
  if (rest.startsWith('/data/')) {
    return proxyData(context, rest, url.search)
  }
  return context.next()
}
