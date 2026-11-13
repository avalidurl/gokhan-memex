/**
 * For ?q= share URLs: rewrite og/twitter meta on the static HTML so social
 * crawlers (which do not run JS) preview the quote card. All other requests
 * pass through, including the product API proxies.
 */
import { sanitizeQuote, decodeEntities, rewriteHead } from './lib/quote-card.js'

const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|js|css|woff2?|ttf|otf|ico|xml|txt|json|map|wasm|pdf|mp4|webm|md)$/i

export async function onRequest(context) {
  const url = new URL(context.request.url)
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
