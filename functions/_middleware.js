/**
 * For ?q= share URLs: rewrite og/twitter meta on the static HTML so social
 * crawlers (which do not run JS) preview the quote card. All other requests
 * pass through, including the product API proxies.
 */
import { sanitizeQuote, decodeEntities, rewriteHead } from './lib/quote-card.js'

const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|js|css|woff2?|ttf|otf|ico|xml|txt|json|map|wasm|pdf|mp4|webm|md)$/i
const API_HOST = 'api.gokhanturhan.com'
const API_PASS = new Set(['/fonts.css', '/favicon.svg', '/favicon.ico', '/register-boot.js', '/.well-known/api-catalog', '/mcp'])
const DISCOVERY_LINK = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</api/site/openapi.json>; rel="service-desc"; type="application/json"',
  '</api/site/>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</mcp>; rel="service"; type="application/json"',
  '</api/site/pages.json>; rel="index"; type="application/json"',
  '</api/site/pages.json>; rel="contents"; type="application/json"',
  '</api/site/journal.json>; rel="item"; type="application/json"',
  '</api/site/cv.json>; rel="item"; type="application/json"',
  '</api/site/products.json>; rel="item"; type="application/json"',
  '</api/site/about.json>; rel="item"; type="application/json"',
  '</api/site/links.json>; rel="item"; type="application/json"',
  '</api/site/publishing.json>; rel="item"; type="application/json"',
  '</rss.xml>; rel="alternate"; type="application/rss+xml"',
].join(', ')

function withDiscovery(response, url) {
  if (url.pathname !== '/' && url.pathname !== '/index.html') return response
  const headers = new Headers(response.headers)
  const prior = headers.get('link')
  if (prior && prior.includes('/api/site/pages.json')) return response
  headers.set('link', DISCOVERY_LINK)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}
const RAIL_HEADERS = [
  'accept', 'accept-language', 'content-type', 'cookie', 'user-agent',
  'authorization', 'payment-signature', 'x-payment',
  'upgrade', 'connection', 'sec-websocket-key', 'sec-websocket-version',
  'sec-websocket-protocol', 'sec-websocket-extensions',
]
// Live workers keep the payable resource URL. A proxied 402 is passed through
// unchanged: rewriting it would break the signature inside the challenge.
const RAILS = [
  ['/curb', 'curb.numetal.xyz', /^\/(v1|health|mcp|skill\.md|openapi\.json|llms\.txt|llms-full\.txt|\.well-known)(\/|$)/],
  ['/ishtar', 'api.ishtar.numetal.xyz', /^\/(api|health|mcp|skill|openapi\.json|llms\.txt|llms-full\.txt|\.well-known)(\/|$)/],
  ['/plaintext', 'plaintext.numetal.xyz', /^\/(api|health|mcp|feed\.xml)(\/|$)/],
  // Public numetal.xyz/fees/data is a bulk redirect. The site already reaches
  // the fee JSON through the NUMETAL service binding. Use that same binding.
  ['/numetal', 'numetal.xyz', /^\/(fees\/data|fees\/events|api)(\/|$)/, 'NUMETAL'],
  ['/status', 'status.numetal.xyz', /^\/(health|status\.json|api)(\/|$)/],
]

function matchRail(pathname) {
  for (const [prefix, host, api, service] of RAILS) {
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) continue
    const rest = pathname.slice(prefix.length) || '/'
    if (api.test(rest)) return { host, rest, service }
  }
  return null
}

async function proxyRail(request, env, { host, rest, service }) {
  const url = new URL(request.url)
  let path = rest || '/'
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  const upstream = `https://${host}${path}${url.search}`
  const fwd = new Headers()
  for (const k of RAIL_HEADERS) {
    const v = request.headers.get(k)
    if (v) fwd.set(k, v)
  }
  fwd.set('Origin', `https://${host}`)
  const init = { method: request.method, headers: fwd, redirect: 'manual', cache: 'no-store' }
  if (!['GET', 'HEAD'].includes(request.method)) init.body = await request.arrayBuffer()
  let res
  try {
    const binding = service && env && env[service]
    res = binding ? await binding.fetch(new Request(upstream, init)) : await fetch(upstream, init)
  } catch (e) {
    return Response.json({ error: `The service at ${host} did not answer.` }, { status: 504, headers: { 'cache-control': 'no-store' } })
  }
  const headers = new Headers(res.headers)
  for (const k of ['content-length', 'content-encoding', 'transfer-encoding', 'alt-svc', 'report-to', 'nel', 'strict-transport-security']) headers.delete(k)
  headers.set('cache-control', 'no-store')
  headers.set('cdn-cache-control', 'no-store')
  headers.set('cloudflare-cdn-cache-control', 'no-store')
  return new Response(res.body, { status: res.status, headers })
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  // These product routes were removed. A stale Pages CDN object can still
  // answer the exact URL; return a 404 here before assets are fetched.
  const removed = [
    '/llmcraft', '/llmlivesmatter', '/launch', '/accumulator', '/rebase',
    '/apex', '/booster', '/api/launch', '/api/accumulator',
    '/media/archive/gokhan-vc/launch',
  ]
  if (removed.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
    const headers = { 'cache-control': 'no-store', 'cdn-cache-control': 'no-store', 'cloudflare-cdn-cache-control': 'no-store' }
    try {
      const notFound = await context.env.ASSETS.fetch(new Request(new URL('/404', url), context.request))
      const out = new Headers(notFound.headers)
      for (const [k, v] of Object.entries(headers)) out.set(k, v)
      out.delete('content-length')
      return new Response(notFound.body, { status: 404, statusText: 'Not Found', headers: out })
    } catch {
      return new Response('Not found', { status: 404, headers })
    }
  }

  // Product drafts were folded into Projects & Products. A stale CDN object can
  // still answer the old listing, so redirect here before assets are fetched.
  if (url.pathname === '/product-drafts' || url.pathname.startsWith('/product-drafts/') || url.pathname === '/api/site/drafts.json') {
    const to = url.pathname === '/api/site/drafts.json' ? '/api/site/products.json' : '/products/'
    return new Response(null, { status: 301, headers: { location: to, 'cache-control': 'no-store', 'cdn-cache-control': 'no-store', 'cloudflare-cdn-cache-control': 'no-store' } })
  }

  // Catalog HTML stays under /api. A real API path on this host is fetched
  // from the worker that still signs the 402. ASSETS.fetch does not re-enter
  // Pages Functions, so this proxy is the rail.
  if (url.hostname === API_HOST && !API_PASS.has(url.pathname)) {
    const rail = matchRail(url.pathname)
    if (rail) return proxyRail(context.request, context.env, rail)
    const onCatalog = url.pathname === '/api' || url.pathname.startsWith('/api/')
    if (!onCatalog) {
      const dest = new URL(context.request.url)
      let path = url.pathname
      if (path !== '/' && !path.endsWith('/') && !path.split('/').pop().includes('.')) path += '/'
      dest.pathname = path === '/' ? '/api/' : `/api${path}`
      return context.env.ASSETS.fetch(new Request(dest, context.request))
    }
  }
  if (url.pathname.startsWith('/og/quote')) return context.next()
  if (STATIC_EXT.test(url.pathname)) return context.next()
  const raw = url.searchParams.get('q')
  if (!raw) return withDiscovery(await context.next(), url)
  const quote = sanitizeQuote(raw)
  if (!quote) return context.next()

  const res = await context.next()
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('text/html') || res.status !== 200) return res

  let html = await res.text()
  const rawTitle =
    (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i) ||
      [])[1] ||
    (html.match(/<title>([^<]+)<\/title>/i) || [])[1] ||
    'Gökhan Turhan'
  const title = decodeEntities(rawTitle).replace(/\s*\|\s*Gökhan Turhan\s*$/u, '')
  const img = new URL('/og/quote.png', url.origin)
  img.searchParams.set('q', quote)
  if (title) img.searchParams.set('t', title)
  img.searchParams.set('p', url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`)
  const share = `${url.origin}${url.pathname}${url.pathname.endsWith('/') ? '' : '/'}?q=${encodeURIComponent(quote)}`
  html = rewriteHead(html, { quote, title, image: img.toString(), url: share })

  const headers = new Headers(res.headers)
  headers.set('cache-control', 'public, max-age=300, s-maxage=86400')
  headers.delete('content-length')
  return withDiscovery(new Response(html, { status: res.status, statusText: res.statusText, headers }), url)
}
