/**
 * For ?q= share URLs: rewrite og/twitter meta on the static HTML so social
 * crawlers (which do not run JS) preview the quote card. All other requests
 * pass through, including the product API proxies.
 */
import { sanitizeQuote, decodeEntities, rewriteHead } from './lib/quote-card.js'

const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|js|css|woff2?|ttf|otf|ico|xml|txt|json|map|wasm|pdf|mp4|webm|md)$/i
const API_HOST = 'api.gokhanturhan.com'
const API_PASS = new Set(['/fonts.css', '/favicon.svg', '/favicon.ico', '/register-boot.js'])
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
  ['/launch', 'launch.numetal.xyz', /^\/(api|telegram|mcp|openapi\.json|llms\.txt|skill\.md|\.well-known)(\/|$)/],
  ['/plaintext', 'plaintext.numetal.xyz', /^\/(api|health|mcp|feed\.xml)(\/|$)/],
  ['/accumulator', 'accumulator.numetal.xyz', /^\/api(\/|$)/],
  ['/numetal', 'numetal.xyz', /^\/(fees\/data|fees\/events|api)(\/|$)/],
  ['/status', 'status.numetal.xyz', /^\/(health|status\.json|api)(\/|$)/],
]

function matchRail(pathname) {
  for (const [prefix, host, api] of RAILS) {
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) continue
    const rest = pathname.slice(prefix.length) || '/'
    if (api.test(rest)) return { host, rest }
  }
  return null
}

async function proxyRail(request, { host, rest }) {
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
  const init = { method: request.method, headers: fwd, redirect: 'manual' }
  if (!['GET', 'HEAD'].includes(request.method)) init.body = await request.arrayBuffer()
  let res
  try {
    res = await fetch(upstream, init)
  } catch (e) {
    return Response.json({ error: `The service at ${host} did not answer.` }, { status: 504, headers: { 'cache-control': 'no-store' } })
  }
  const headers = new Headers(res.headers)
  for (const k of ['content-length', 'content-encoding', 'transfer-encoding', 'alt-svc', 'report-to', 'nel', 'strict-transport-security']) headers.delete(k)
  headers.set('cache-control', 'no-store')
  return new Response(res.body, { status: res.status, headers })
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  // Catalog HTML stays under /api. A real API path on this host is fetched
  // from the worker that still signs the 402. ASSETS.fetch does not re-enter
  // Pages Functions, so this proxy is the rail.
  if (url.hostname === API_HOST && !API_PASS.has(url.pathname)) {
    const rail = matchRail(url.pathname)
    if (rail) return proxyRail(context.request, rail)
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
  if (!raw) return context.next()
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
  return new Response(html, { status: res.status, statusText: res.statusText, headers })
}
