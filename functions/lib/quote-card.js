/** Shared quote-card helpers for the Pages Function (no Node APIs). */

export const MAX_QUOTE = 320
export const INK = '#141414'
export const PAPER = '#ffffff'
export const DIM = '#4a4a4a'
export const FAINT = '#e0e0e0'
export const RED = '#e10600'
export const IKB = '#002FA7'

export function sanitizeQuote(q) {
  let s = String(q ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (s.length > MAX_QUOTE) s = s.slice(0, MAX_QUOTE - 1).replace(/\s+\S*$/, '') + '…'
  return s
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function decodeEntities(s) {
  return String(s ?? '').replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (v) => {
    const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }
    if (named[v]) return named[v]
    return String.fromCodePoint(v[2].toLowerCase() === 'x' ? parseInt(v.slice(3, -1), 16) : parseInt(v.slice(2, -1), 10))
  })
}

/** Conservative width estimate for EB Garamond italic / Source Sans. */
function charW(ch, size, italic) {
  if (ch === ' ') return size * 0.3
  if ('.,;:\'’!|'.includes(ch)) return size * 0.28
  if ('mwMW@'.includes(ch)) return size * 0.88
  if ('iljI1tfr'.includes(ch)) return size * 0.32
  return size * (italic ? 0.5 : 0.55)
}

export function wrapApprox(text, size, width, maxLines, italic) {
  const words = String(text ?? '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const widthOf = (s) => [...s].reduce((n, c) => n + charW(c, size, italic), 0)
  const lines = []
  let line = ''
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word
    if (line && widthOf(trial) > width) {
      lines.push(line)
      line = word
    } else {
      line = trial
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1]
    while (last && widthOf(last + '…') > width) {
      last = last.replace(/\s+\S+$/u, '')
      if (last.length < 4) break
    }
    kept[maxLines - 1] = `${last}…`
    return kept
  }
  return lines
}

export function cardSvg({ quote, source, kicker, footer, meta, avatarBase64 }) {
  const innerLeft = 88
  const colW = 1112 - 88
  const q = String(quote || '').trim()
  const qSize = q.length <= 80 ? 54 : q.length <= 160 ? 44 : q.length <= 260 ? 36 : 32
  const qLines = wrapApprox(q, qSize, colW - 24, q.length <= 80 ? 4 : 6, true)
  const firstY = 230
  const quoteText = qLines
    .map((l, i) => `<text x="${innerLeft + 8}" y="${firstY + i * qSize * 1.2}" font-size="${qSize}" font-family="EB Garamond" font-style="italic" fill="${INK}">${esc(l)}</text>`)
    .join('')
  const srcLines = source ? wrapApprox(source, 22, colW, 2, false) : []
  const srcY = Math.min(528 - Math.max(0, srcLines.length - 1) * 28, firstY + qLines.length * qSize * 1.2 + 36)
  const kick = (kicker || 'QUOTE  ·  GÖKHAN TURHAN').toUpperCase()
  const foot = footer || 'gokhanturhan.com/journal'
  const right = (meta || 'HIGHLIGHT').toUpperCase()
  const hairY = 548
  const footerY = 580
  const frameBottom = 604

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect x="36" y="28" width="1128" height="${frameBottom - 28}" fill="none" stroke="${INK}" stroke-width="3"/>
  <image x="88" y="54" width="80" height="80" href="data:image/png;base64,${avatarBase64}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="88" y="54" width="80" height="80" fill="none" stroke="${INK}" stroke-width="2"/>
  <rect x="184" y="70" width="12" height="12" fill="${RED}"/>
  <text x="204" y="82" font-size="22" font-family="Source Sans 3" font-weight="600" fill="${INK}" letter-spacing="2.2">GÖKHAN TURHAN</text>
  <text x="184" y="116" font-size="18" font-family="Source Sans 3" fill="${DIM}" letter-spacing="2.4">${esc(kick)}</text>
  <text x="${innerLeft - 4}" y="208" font-size="110" font-family="EB Garamond" fill="${IKB}">“</text>
  ${quoteText}
  ${srcLines.map((l, i) => `<text x="${innerLeft}" y="${srcY + i * 28}" font-size="22" font-family="Source Sans 3" fill="${DIM}">${esc(l)}</text>`).join('')}
  <line x1="88" y1="${hairY}" x2="1112" y2="${hairY}" stroke="${FAINT}" stroke-width="1.5"/>
  <text x="88" y="${footerY}" font-size="22" font-family="Source Sans 3" font-weight="600" fill="${RED}" letter-spacing="0.4">${esc(foot)}</text>
  <text x="1112" y="${footerY}" font-size="16" font-family="Source Sans 3" font-weight="600" fill="${IKB}" letter-spacing="2.2" text-anchor="end">${esc(right)}</text>
  <rect x="0" y="614" width="1200" height="16" fill="${INK}"/>
  <rect x="0" y="614" width="168" height="16" fill="${IKB}"/>
  <rect x="168" y="614" width="40" height="16" fill="${RED}"/>
</svg>`
}

function setMeta(html, attr, key, value) {
  const tag = `<meta ${attr}="${key}" content="${escAttr(value)}" />`
  const re = new RegExp(`<meta\\s[^>]*(?:${attr}\\s*=\\s*["']${key}["'])[^>]*>`, 'i')
  if (re.test(html)) return html.replace(re, tag)
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
}

export function rewriteHead(html, { quote, title, image, url }) {
  const clipped = quote.length > 140 ? `${quote.slice(0, 137)}…` : quote
  const ogTitle = `“${clipped}” — ${title || 'Gökhan Turhan'}`
  let out = html
  out = setMeta(out, 'property', 'og:title', ogTitle)
  out = setMeta(out, 'property', 'og:description', quote)
  out = setMeta(out, 'property', 'og:image', image)
  out = setMeta(out, 'property', 'og:image:type', 'image/png')
  out = setMeta(out, 'property', 'og:image:width', '1200')
  out = setMeta(out, 'property', 'og:image:height', '630')
  out = setMeta(out, 'property', 'og:image:alt', ogTitle)
  out = setMeta(out, 'property', 'og:url', url)
  out = setMeta(out, 'property', 'og:type', 'article')
  out = setMeta(out, 'name', 'twitter:card', 'summary_large_image')
  out = setMeta(out, 'name', 'twitter:title', ogTitle)
  out = setMeta(out, 'name', 'twitter:description', quote)
  out = setMeta(out, 'name', 'twitter:image', image)
  out = setMeta(out, 'name', 'twitter:image:alt', ogTitle)
  return out
}
