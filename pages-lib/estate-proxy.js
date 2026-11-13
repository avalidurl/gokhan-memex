/**
 * Estate origin bridge.
 *
 * Product backends still run on their original Workers. Pages Functions under
 * each product path proxy API (and WebSocket) calls to that worker so the
 * original UI, served as static files from this site, can talk to live APIs
 * same-origin and without CORS issues. When a `service` binding is set
 * (NUMETAL → numetal-site, JESUS → personal-jesus), the Function calls the
 * worker directly and never touches the retired hostname. HTML is never
 * fetched from a retired origin — those hosts 301 back here, which would
 * loop — and is served from the built original-design copy via context.next().
 *
 * The older `proxy()` helper can still fetch HTML from a live origin and
 * rewrite it; prefer `originOnRequest()` for the mounted original designs.
 */
const OLD_HOSTS = [
  ['https://numetal.xyz/', '/numetal/'],
  ['https://www.numetal.xyz/', '/numetal/'],
  ['https://gokhan.vc/', '/gokhan-vc/'],
  ['https://www.gokhan.vc/', '/gokhan-vc/'],
  ['https://reclaim.numetal.xyz', '/reclaim'],
  ['https://plaintext.numetal.xyz', '/plaintext'],
]

// The site shows one public mailbox; rewrite any other address the live apps print.
const MAILBOX = /\b[A-Za-z0-9._%+-]+@(?:[a-z0-9-]+\.)*(?:numetal\.xyz|gokhan\.vc|gokhanturhan\.com)\b/g

export function rewriteText(text, prefix, host) {
  let t = text.replace(MAILBOX, 'contact@gokhan.vc')
  t = t.split(`https://${host}`).join(prefix)
  for (const [a, b] of OLD_HOSTS) t = t.split(a).join(b)
  // root-relative URLs in attributes, including ones built inside JS strings
  t = t.replace(/(\s(?:href|src|action|poster|content)=\\?["'])\/(?![\/])(?!(?:reclaim|plaintext|numetal|gokhan-vc|products)(?:[\/"'?#]|$))/g, `$1${prefix}/`)
  t = t.replace(/(\bfetch\(\s*["'`])\/(?!\/)/g, `$1${prefix}/`)
  t = t.replace(/(location\.href\s*=\s*\(?\s*["'`])\/(?!\/)/g, `$1${prefix}/`)
  t = t.replace(/(url\(\s*["']?)\/(?!\/)/g, `$1${prefix}/`)
  return t
}

const BAR_CSS = `.gt-bar{all:initial;display:block;box-sizing:border-box;width:100%;border-bottom:1px solid #141414;background:#ffffff;color:#141414;font:12px/1.5 ui-monospace,Menlo,monospace;padding:6px 12px;letter-spacing:.02em}
.gt-bar a{color:#002fa7;text-decoration:none}.gt-bar a:hover{text-decoration:underline}.gt-bar b{font-weight:600}.gt-bar i{font-style:normal;color:#4a4a4a}
@media (prefers-color-scheme:dark){.gt-bar{background:#141414;color:#f5f5f5;border-color:#f5f5f5}.gt-bar a{color:#8eb0ff}.gt-bar i{color:#b3b3b3}}`

function bar(prefix, name, host) {
  return `<div class="gt-bar" role="navigation" aria-label="Site"><a href="/">Gökhan Turhan</a> · <a href="/products/">Products</a> · <b>${name}</b> · <a href="${prefix}/">gokhanturhan.com${prefix}/</a> · <i>former address ${host}</i></div>`
}

function rewriteHeaders(src, prefix, host) {
  const h = new Headers()
  for (const [k, v] of src) {
    const key = k.toLowerCase()
    if (['content-length', 'content-encoding', 'transfer-encoding', 'set-cookie', 'alt-svc', 'report-to', 'nel', 'strict-transport-security'].includes(key)) continue
    if (key === 'location') { h.set('location', rewriteLocation(v, prefix, host)); continue }
    h.set(k, v)
  }
  const cookies = typeof src.getSetCookie === 'function' ? src.getSetCookie() : (src.get('set-cookie') ? [src.get('set-cookie')] : [])
  for (const c of cookies) {
    h.append('set-cookie', c.replace(/;\s*domain=[^;]*/i, '').replace(/;\s*path=\/(?=;|$)/i, `; Path=${prefix}/`))
  }
  h.set('cache-control', 'no-store')
  return h
}

function rewriteLocation(v, prefix, host) {
  if (v.startsWith(`https://${host}`)) return prefix + (v.slice(`https://${host}`.length) || '/')
  if (v.startsWith('/') && !v.startsWith('//')) return prefix + v
  return v
}

export async function proxy(context, { prefix, host, name }) {
  const { request } = context
  const url = new URL(request.url)
  let rest = url.pathname.slice(prefix.length) || '/'
  if (rest === '/__gtbar.css') return new Response(BAR_CSS, { headers: { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
  const isApi = /^\/(api|pin|mcp|ipfs|dl|og)(\/|$)/.test(rest)
  const isAsset = /\.[a-z0-9]{2,5}$/i.test(rest) && !rest.endsWith('.html')
  // memex paths end in a slash; the original apps do not (except the root)
  if (!isApi && !isAsset && rest.length > 1 && rest.endsWith('/')) rest = rest.slice(0, -1)
  const upstream = `https://${host}${rest}${url.search}`

  const fwd = new Headers()
  for (const k of ['accept', 'accept-language', 'content-type', 'cookie', 'user-agent', 'authorization', 'payment-signature', 'x-payment']) {
    const v = request.headers.get(k); if (v) fwd.set(k, v)
  }
  const init = { method: request.method, headers: fwd, redirect: 'manual' }
  if (!['GET', 'HEAD'].includes(request.method)) init.body = await request.arrayBuffer()
  const wantsHtml = request.method === 'GET' && !isApi && !isAsset
  if (wantsHtml) init.signal = AbortSignal.timeout(9000)

  let res
  try {
    res = await fetch(upstream, init)
  } catch (e) {
    if (wantsHtml) return fallback(context, null)
    return Response.json({ error: `The ${name} service did not answer (${e && e.name === 'TimeoutError' ? 'timeout' : 'network error'}). Try again in a minute.` }, { status: 504, headers: { 'cache-control': 'no-store' } })
  }
  // A retired origin that now redirects back to this site would loop; serve the built copy.
  const loc = res.headers.get('location') || ''
  if (res.status >= 300 && res.status < 400 && /^https?:\/\/(?:www\.)?gokhanturhan\.com(?:[\/?#]|$)/i.test(loc)) return context.next()
  const ct = res.headers.get('content-type') || ''
  if (wantsHtml && res.status >= 500) return fallback(context, { res, prefix, host, name })

  const headers = rewriteHeaders(res.headers, prefix, host)
  if (/text\/html/.test(ct)) {
    let body = rewriteText(await res.text(), prefix, host)
    body = body.replace(/<\/head>/i, `<link rel="stylesheet" href="${prefix}/__gtbar.css"></head>`)
    body = body.replace(/<body([^>]*)>/i, (m) => `${m}${bar(prefix, name, host)}`)
    return new Response(body, { status: res.status, headers })
  }
  if (/javascript|json|text\/css/.test(ct)) {
    let body = await res.text()
    // keep same-origin asset paths (Vite bundles, JSON redirect targets) on the prefix
    body = body.split(`https://${host}`).join(prefix).replace(/(["'`])\/(join|assets)\//g, `$1${prefix}/$2/`)
    if (/javascript/.test(ct)) {
      body = body.replace(MAILBOX, 'contact@gokhan.vc')
      // app code: same-origin fetches, links and redirects (e.g. fetch(`/api/…`), href:"/~name", location.href="/")
      body = body
        .replace(/(\bfetch\(\s*["'`])\/(?![\/])(?!(?:reclaim|plaintext)\/)/g, `$1${prefix}/`)
        .replace(/(\bhref:\s*["'`])\/(?![\/])(?!(?:reclaim|plaintext)\/)/g, `$1${prefix}/`)
        .replace(/(location\.href\s*=\s*\(?\s*["'`])\/(?![\/])(?!(?:reclaim|plaintext)\/)/g, `$1${prefix}/`)
    }
    if (/text\/css/.test(ct)) body = rewriteText(body, prefix, host)
    return new Response(body, { status: res.status, headers })
  }
  return new Response(res.body, { status: res.status, headers })
}

async function fallback(context, up) {
  const s = await context.next()
  if (s.status < 400 || !up) return s
  const headers = rewriteHeaders(up.res.headers, up.prefix, up.host)
  const body = rewriteText(await up.res.text(), up.prefix, up.host)
  return new Response(body, { status: up.res.status, headers })
}


const API_HEADERS = [
  'accept', 'accept-language', 'content-type', 'cookie', 'user-agent',
  'authorization', 'payment-signature', 'x-payment',
  'upgrade', 'connection', 'sec-websocket-key', 'sec-websocket-version',
  'sec-websocket-protocol', 'sec-websocket-extensions', 'sec-websocket-extensions',
]

/**
 * Proxy only API / WebSocket traffic to the original worker. JSON is passed
 * through untouched so contract addresses and seller endpoints stay intact.
 * HTML and everything else is served from the built original-design copy.
 */
export function originOnRequest({ prefix, host, name, api, service }) {
  return async (context) => {
    const { request } = context
    const url = new URL(request.url)
    const rest = url.pathname.slice(prefix.length) || '/'
    const isWs = (request.headers.get('upgrade') || '').toLowerCase() === 'websocket'
    if (!isWs && !api.test(rest)) return context.next()
    return proxyApi(context, { prefix, host, name, rest, isWs, service })
  }
}

/**
 * Call the original worker through a Pages service binding when one is
 * configured, so we never hit Bulk Redirects on the retired hostname.
 * The request URL is rewritten to the path the worker originally served
 * (method, body, headers and query are preserved). If the binding is
 * missing, fall back to fetching the public host.
 */
function upstreamFetch(env, service, upstream, requestLike) {
  const binding = service && env && env[service]
  const req = new Request(upstream, requestLike)
  if (binding) return binding.fetch(req)
  return fetch(req)
}

async function proxyApi(context, { prefix, host, name, rest, isWs, service }) {
  const { request, env } = context
  const url = new URL(request.url)
  let path = rest || url.pathname.slice(prefix.length) || '/'
  if (path.length > 1 && path.endsWith('/') && !isWs) path = path.slice(0, -1)
  const upstream = `https://${host}${path}${url.search}`

  if (isWs) {
    try {
      const res = await upstreamFetch(env, service, upstream, request)
      return res
    } catch (e) {
      return new Response('WebSocket upstream failed', { status: 504 })
    }
  }

  const fwd = new Headers()
  for (const k of API_HEADERS) {
    const v = request.headers.get(k)
    if (v) fwd.set(k, v)
  }
  // Same-origin on this site; do not send the retired origin as Origin.
  // Keep the original host so workers that compare Origin to request.url
  // (e.g. personal-jesus /join) still accept the proxied call.
  fwd.set('Origin', `https://${host}`)
  const init = { method: request.method, headers: fwd, redirect: 'manual' }
  if (!['GET', 'HEAD'].includes(request.method)) init.body = await request.arrayBuffer()

  let res
  try {
    res = await upstreamFetch(env, service, upstream, init)
  } catch (e) {
    return Response.json({ error: `The ${name} service did not answer (${e && e.name === 'TimeoutError' ? 'timeout' : 'network error'}). Try again in a minute.` }, { status: 504, headers: { 'cache-control': 'no-store' } })
  }
  const loc = res.headers.get('location') || ''
  if (res.status >= 300 && res.status < 400 && /^https?:\/\/(?:www\.)?gokhanturhan\.com(?:[\/?#]|$)/i.test(loc)) {
    return Response.json({ error: `The ${name} API redirected away from the original host.` }, { status: 502, headers: { 'cache-control': 'no-store' } })
  }

  const headers = new Headers()
  for (const [k, v] of res.headers) {
    const key = k.toLowerCase()
    if (['content-length', 'content-encoding', 'transfer-encoding', 'alt-svc', 'report-to', 'nel', 'strict-transport-security'].includes(key)) continue
    if (key === 'location') { headers.set('location', rewriteLocation(v, prefix, host)); continue }
    headers.set(k, v)
  }
  headers.set('cache-control', 'no-store')
  return new Response(res.body, { status: res.status, headers })
}
