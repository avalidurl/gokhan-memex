/**
 * Shared OG card renderer for gokhanturhan.com.
 *
 * Ishtar-inspired filed plate: white ground, black frame, EB Garamond headline,
 * Source Sans 3 labels, the face photo in grayscale, and two house accents
 * used sparingly — signal red (#e10600) and International Klein Blue (#002FA7).
 * No cream or yellow. 1200×630 PNG via @resvg/resvg-js.
 */
import { create } from 'fontkit'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_DIR = join(__dirname, 'fonts')

export const FONTS = {
  garamond: join(FONT_DIR, 'EBGaramond-SemiBold.ttf'),
  garamondItalic: join(FONT_DIR, 'EBGaramond-Italic.ttf'),
  sans: join(FONT_DIR, 'SourceSans3-Regular.ttf'),
  sansSemi: join(FONT_DIR, 'SourceSans3-Semibold.ttf'),
}
export const FONT_FILES = Object.values(FONTS)

const kit = {
  garamond: create(readFileSync(FONTS.garamond)),
  garamondItalic: create(readFileSync(FONTS.garamondItalic)),
  sans: create(readFileSync(FONTS.sans)),
  sansSemi: create(readFileSync(FONTS.sansSemi)),
}

const AVATAR = readFileSync(join(FONT_DIR, 'avatar-gray.png')).toString('base64')

// House tokens — exact values from src/styles/critical.css (light).
export const INK = '#141414'
export const PAPER = '#ffffff'
export const DIM = '#4a4a4a'
export const FAINT = '#e0e0e0'
export const RED = '#e10600'
export const IKB = '#002FA7'

export const WIDTH = 1200
export const HEIGHT = 630

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export function textWidth(font, text, size) {
  if (!text) return 0
  return kit[font].layout(String(text)).advanceWidth * size / kit[font].unitsPerEm
}

export function wrap(font, text, size, width, maxLines = 8) {
  const words = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  const lines = []
  let line = ''
  const push = () => {
    if (line) {
      lines.push(line)
      line = ''
    }
  }
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word
    if (line && textWidth(font, trial, size) > width) {
      push()
      // Split an oversized token at code points.
      if (textWidth(font, word, size) > width) {
        let chunk = ''
        for (const ch of word) {
          if (chunk && textWidth(font, chunk + ch, size) > width) {
            lines.push(chunk)
            chunk = ''
          }
          chunk += ch
        }
        line = chunk
      } else {
        line = word
      }
    } else {
      line = trial
    }
  }
  push()
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1]
    while (last && textWidth(font, last + '…', size) > width) {
      last = last.replace(/\s+\S+$/u, '').replace(/[.,;:–—-]$/u, '')
      if (last.length < 4) break
    }
    kept[maxLines - 1] = `${last}…`
    return kept
  }
  return lines
}

function fitHeadline(title, width, maxBlock = 250) {
  let size = 86
  let lines
  for (; size >= 36; size -= 2) {
    lines = wrap('garamond', title, size, width, 4)
    const block = lines.length * size * 1.08
    if (lines.length <= 3 && block <= maxBlock) break
  }
  return { size, lines }
}

function periodSplit(title) {
  const raw = String(title ?? '').trim()
  // A decorative red period, in Ishtar's spirit, if the title has no end mark.
  if (/[.!?…:]$/u.test(raw)) return { head: raw, period: false }
  return { head: raw, period: true }
}

/**
 * @param {object} opts
 * @param {'page'|'post'|'quote'|'home'} opts.kind
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.kicker]
 * @param {string} [opts.footer]
 * @param {string} [opts.meta]
 * @param {string} [opts.quote]
 * @param {string} [opts.source]
 */
export function cardSvg(opts) {
  const kind = opts.kind || 'page'
  const rawTitle = String(opts.title || '').trim()
  const usePeriod = (kind === 'post' || kind === 'quote') && rawTitle.length >= 20 && !/[.!?…:]$/u.test(rawTitle)
  const head = rawTitle
  const kicker = (opts.kicker || '').toUpperCase()
  const footer = opts.footer || 'gokhanturhan.com'
  const meta = (opts.meta || '').toUpperCase()

  const innerLeft = 88
  const innerRight = 1112
  const colW = innerRight - innerLeft
  // Reserved zone: hairline at 548, footer 578, frame ends 604, accent 610–630.
  const hairY = 548
  const footerY = 580
  const frameBottom = 604
  const descLimit = 528

  let body = ''
  if (kind === 'quote') {
    const quote = String(opts.quote || '').trim()
    const qSize = quote.length <= 80 ? 54 : quote.length <= 160 ? 44 : quote.length <= 260 ? 36 : 32
    const qLines = wrap('garamondItalic', quote, qSize, colW - 24, quote.length <= 80 ? 4 : 6)
    const firstY = 230
    const quoteText = qLines
      .map((l, i) => `<text x="${innerLeft + 8}" y="${firstY + i * qSize * 1.2}" font-size="${qSize}" font-family="EB Garamond" font-style="italic" fill="${INK}">${esc(l)}</text>`)
      .join('')
    const source = opts.source ? wrap('sans', opts.source, 22, colW, 2) : []
    const srcY = Math.min(descLimit - (source.length - 1) * 28, firstY + qLines.length * qSize * 1.2 + 36)
    body = `
      <text x="${innerLeft - 4}" y="208" font-size="110" font-family="EB Garamond" fill="${IKB}">“</text>
      ${quoteText}
      ${source.map((l, i) => `<text x="${innerLeft}" y="${srcY + i * 28}" font-size="22" font-family="Source Sans 3" fill="${DIM}">${esc(l)}</text>`).join('')}
    `
  } else {
    const { size, lines } = fitHeadline(head, colW - (usePeriod ? 30 : 0), opts.description ? 210 : 280)
    const lh = size * 1.08
    const firstY = 214
    const headline = lines
      .map((l, i) => {
        const y = firstY + i * lh
        const isLast = i === lines.length - 1
        const w = textWidth('garamond', l, size)
        const periodMark = isLast && usePeriod
          ? `<circle cx="${innerLeft + w + 18}" cy="${y - size * 0.18}" r="${Math.max(6, size * 0.085)}" fill="${RED}"/>`
          : ''
        return `<text x="${innerLeft}" y="${y}" font-size="${size}" font-family="EB Garamond" font-weight="600" fill="${INK}">${esc(l)}</text>${periodMark}`
      })
      .join('')
    const ruleY = firstY + (lines.length - 1) * lh + Math.max(26, size * 0.32)
    const desc = opts.description ? wrap('sans', opts.description, 26, colW, 2) : []
    let descY = ruleY + 46
    if (descY + Math.max(0, desc.length - 1) * 36 > descLimit) {
      // Prefer dropping a description line over colliding with the IKB rule.
      if (desc.length > 1) desc.length = 1
    }
    if (descY < ruleY + 36) descY = ruleY + 36
    body = `
      ${headline}
      <rect x="${innerLeft}" y="${ruleY}" width="72" height="4" fill="${IKB}"/>
      ${desc.map((l, i) => `<text x="${innerLeft}" y="${descY + i * 36}" font-size="26" font-family="Source Sans 3" fill="${DIM}">${esc(l)}</text>`).join('')}
    `
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}"/>
  <rect x="36" y="28" width="1128" height="${frameBottom - 28}" fill="none" stroke="${INK}" stroke-width="3"/>
  <image x="88" y="54" width="80" height="80" href="data:image/png;base64,${AVATAR}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="88" y="54" width="80" height="80" fill="none" stroke="${INK}" stroke-width="2"/>
  <rect x="184" y="70" width="12" height="12" fill="${RED}"/>
  <text x="204" y="82" font-size="22" font-family="Source Sans 3" font-weight="600" fill="${INK}" letter-spacing="2.2">GÖKHAN TURHAN</text>
  ${kicker ? `<text x="184" y="116" font-size="18" font-family="Source Sans 3" fill="${DIM}" letter-spacing="2.4">${esc(kicker)}</text>` : ''}
  ${body}
  <line x1="88" y1="${hairY}" x2="1112" y2="${hairY}" stroke="${FAINT}" stroke-width="1.5"/>
  <text x="88" y="${footerY}" font-size="22" font-family="Source Sans 3" font-weight="600" fill="${RED}" letter-spacing="0.4">${esc(footer)}</text>
  ${meta ? `<text x="1112" y="${footerY}" font-size="16" font-family="Source Sans 3" font-weight="600" fill="${IKB}" letter-spacing="2.2" text-anchor="end">${esc(meta)}</text>` : ''}
  <rect x="0" y="614" width="1200" height="16" fill="${INK}"/>
  <rect x="0" y="614" width="168" height="16" fill="${IKB}"/>
  <rect x="168" y="614" width="40" height="16" fill="${RED}"/>
</svg>`
}

export function renderCard(opts) {
  const svg = cardSvg(opts)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    font: {
      loadSystemFonts: false,
      fontFiles: FONT_FILES,
      defaultFontFamily: 'Source Sans 3',
    },
    background: PAPER,
  })
  return resvg.render().asPng()
}

export const VERSION = 'card-v2-mono-accent'
