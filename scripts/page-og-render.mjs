import { create } from 'fontkit'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

export const fontPath = fileURLToPath(new URL('./fonts/DejaVuSans.ttf', import.meta.url))
const font = create(readFileSync(fontPath))
export const textWidth = (text, size) => font.layout(text).advanceWidth * size / font.unitsPerEm
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))

// Measure actual glyph advances, including Turkish characters. Split oversized
// tokens at code-point boundaries; never clip the headline or silently ellipsize.
export function wrap(text, size, width) {
  const lines = []; let line = ''
  for (const word of String(text).trim().split(/\s+/u)) {
    if (line && textWidth(`${line} ${word}`, size) <= width) { line += ` ${word}`; continue }
    if (line) { lines.push(line); line = '' }
    for (const char of word) {
      if (line && textWidth(line + char, size) > width) { lines.push(line); line = '' }
      line += char
    }
  }
  if (line) lines.push(line)
  return lines
}
export function layout(title, description) {
  let size = 64; let lines
  for (; size >= 14; size -= 2) {
    lines = wrap(title, size, 1000)
    if (lines.length * size * 1.22 <= 245) break
  }
  if (size < 14) throw new Error(`Headline too long to render legibly: ${title}`)
  const desc = wrap(description, 24, 1000)
  return { size, lines, desc: desc.length > 2 ? [desc[0], desc[1].replace(/.{0,3}$/u, '…')] : desc }
}
export function renderCard({title, description, section}) {
  const {size, lines, desc} = layout(title, description)
  const text = (x,y,size,value,fill='#111') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${esc(value)}</text>`
  const firstBaseline = 290 - (lines.length - 1) * size * 1.22 / 2
  const headline = lines.map((s,i) => text(90,firstBaseline+i*size*1.22,size,s)).join('')
  const footer = wrap(`gokhanturhan.com / ${section}`, 18, 1000).slice(0, 2)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#deded8"/></pattern></defs><rect width="1200" height="630" fill="#f4f4f2"/><rect width="1200" height="630" fill="url(#g)"/><rect x="52" y="50" width="1096" height="530" fill="#f4f4f2" stroke="#111" stroke-width="2"/><g font-family="DejaVu Sans">${text(90,108,25,'Gökhan Turhan','#555')}<path d="M90 140H1110" stroke="#111" stroke-width="2"/>${headline}${desc.map((s,i)=>text(90,452+i*32,24,s,'#555')).join('')}<path d="M90 510H1110" stroke="#ccc"/>${footer.map((s,i)=>text(90,540+i*25,18,s,'#555')).join('')}</g></svg>`
  return new Resvg(svg,{font:{loadSystemFonts:false,fontFiles:[fontPath]}}).render().asPng()
}
