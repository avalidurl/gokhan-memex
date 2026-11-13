import { initWasm, Resvg } from '@resvg/resvg-wasm'
import { sanitizeQuote, cardSvg } from '../lib/quote-card.js'

let wasmReady
let cache

function u8b64(u8) {
  let s = ''
  const chunk = 0x8000
  for (let i = 0; i < u8.length; i += chunk) {
    s += String.fromCharCode.apply(null, u8.subarray(i, i + chunk))
  }
  return btoa(s)
}

async function loadBytes(env, request, path) {
  const res = await env.ASSETS.fetch(new URL(path, request.url))
  if (!res.ok) throw new Error(`missing ${path} (${res.status})`)
  return new Uint8Array(await res.arrayBuffer())
}

async function boot(env, request) {
  if (!wasmReady) {
    const wasmRes = await env.ASSETS.fetch(new URL('/og-lib/index_bg.wasm', request.url))
    if (!wasmRes.ok) throw new Error(`wasm ${wasmRes.status}`)
    const buf = await wasmRes.arrayBuffer()
    wasmReady = initWasm(buf)
  }
  await wasmReady
  if (!cache) {
    const [garamond, garamondItalic, sans, sansSemi, avatar] = await Promise.all([
      loadBytes(env, request, '/og-lib/EBGaramond-SemiBold.ttf'),
      loadBytes(env, request, '/og-lib/EBGaramond-Italic.ttf'),
      loadBytes(env, request, '/og-lib/SourceSans3-Regular.ttf'),
      loadBytes(env, request, '/og-lib/SourceSans3-Semibold.ttf'),
      loadBytes(env, request, '/og-lib/avatar-gray.png'),
    ])
    cache = { garamond, garamondItalic, sans, sansSemi, avatar, avatarB64: u8b64(avatar) }
  }
  return cache
}

export async function onRequest(context) {
  try {
    if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
      return new Response('method not allowed', { status: 405 })
    }
    const url = new URL(context.request.url)
    const quote = sanitizeQuote(url.searchParams.get('q') || url.searchParams.get('quote') || '')
    if (!quote) return new Response('missing q', { status: 400, headers: { 'content-type': 'text/plain' } })
    const title = sanitizeQuote(url.searchParams.get('t') || url.searchParams.get('title') || '')
    let path = url.searchParams.get('p') || '/journal/'
    path = String(path).replace(/[^a-zA-Z0-9/._-]/g, '')
    if (!path.startsWith('/')) path = `/${path}`
    const f = await boot(context.env, context.request)
    const svg = cardSvg({
      quote,
      source: title ? `from ${title}` : '',
      kicker: 'Quote  ·  Gökhan Turhan',
      footer: `gokhanturhan.com${path}`.replace(/\/$/, ''),
      meta: 'Highlight',
      avatarBase64: f.avatarB64,
    })
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        loadSystemFonts: false,
        fontBuffers: [f.garamond, f.garamondItalic, f.sans, f.sansSemi],
        defaultFontFamily: 'Source Sans 3',
      },
      background: '#ffffff',
    })
    const png = resvg.render().asPng()
    return new Response(png, {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=31536000, immutable',
        'cdn-cache-control': 'public, max-age=31536000',
      },
    })
  } catch (err) {
    console.error('quote card', err)
    const msg = (err && (err.stack || err.message)) ? String(err.stack || err.message) : String(err)
    return new Response('quote card failed: ' + msg.slice(0, 2000), { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  }
}
