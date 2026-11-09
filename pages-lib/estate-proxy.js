/**
 * Preview-only bridge for the two interactive products (Reclaim, plaintext).
 *
 * The product backends still run on their original Workers. This Pages Function
 * serves each app under its gokhanturhan.com path (/reclaim/…, /plaintext/…):
 * pages and API calls are fetched from the original host and served same-origin,
 * so the apps' own JavaScript (scan, wallet, write, publish) runs unchanged and
 * no CORS is involved. Root-relative links are rewritten onto the path prefix.
 *
 * If the original host fails (timeout or 5xx, e.g. its daily database quota),
 * HTML requests fall back to the static copy built into this site.
 */
const OLD_HOSTS = [
  ['https://numetal.xyz/', '/numetal/'],
  ['https://www.numetal.xyz/', '/numetal/'],
  ['https://gokhan.vc/', '/gokhan-vc/'],
  ['https://www.gokhan.vc/', '/gokhan-vc/'],
  ['https://reclaim.numetal.xyz', '/reclaim'],
  ['https://plaintext.numetal.xyz', '/plaintext'],
]

export function rewriteText(text, prefix, host) {
  let t = text.split(`https://${host}`).join(prefix)
  for (const [a, b] of OLD_HOSTS) t = t.split(a).join(b)
  // root-relative URLs in attributes, including ones built inside JS strings
  t = t.replace(/(\s(?:href|src|action|poster|content)=\\?["'])\/(?![\/])(?!(?:reclaim|plaintext|numetal|gokhan-vc|products)(?:[\/"'?#]|$))/g, `$1${prefix}/`)
  t = t.replace(/(\bfetch\(\s*["'`])\/(?!\/)/g, `$1${prefix}/`)
  t = t.replace(/(location\.href\s*=\s*\(?\s*["'`])\/(?!\/)/g, `$1${prefix}/`)
  t = t.replace(/(url\(\s*["']?)\/(?!\/)/g, `$1${prefix}/`)
  return t
}

const BAR_CSS = `.gt-bar{all:initial;display:block;box-sizing:border-box;width:100%;border-bottom:1px solid #141414;background:#f6f5f1;color:#141414;font:12px/1.5 ui-monospace,Menlo,monospace;padding:6px 12px;letter-spacing:.02em}
.gt-bar a{color:#002fa7;text-decoration:none}.gt-bar a:hover{text-decoration:underline}.gt-bar b{font-weight:600}.gt-bar i{font-style:normal;color:#4a4a46}
@media (prefers-color-scheme:dark){.gt-bar{background:#141414;color:#f3f2ec;border-color:#f3f2ec}.gt-bar a{color:#8eb0ff}.gt-bar i{color:#b4b3ab}}`

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
  h.set('x-robots-tag', 'noindex')
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
