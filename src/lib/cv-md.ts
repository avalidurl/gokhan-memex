/** The CV as Markdown for agents, built from the same data as /cv/, with links to the current product pages. */
import { cvMeta, contact, profile, experience, education, publications, skillGroups, languages } from '@/data/cv'
import { topLevel } from '@/data/estate'
import { works, workByTitle } from '@/data/works'

const SITE = 'https://gokhanturhan.com'
const abs = (u: string) => (u.startsWith('/') ? `${SITE}${u}` : u)
const ORG_PAGE: Record<string, string> = { 'Gökhan Ventures': '/gokhan-vc/', Numetal: '/numetal/' }
const LEAD = ['ubu', 'ishtar', 'curb', 'reclaim', 'plaintext']

export function cvMarkdown(): string {
  const L: string[] = []
  L.push(`# ${cvMeta.name} — CV`, '', `**${cvMeta.title}**`, '', `> ${cvMeta.tagline}`, '')
  L.push(`Updated ${cvMeta.lastUpdated} · HTML: ${SITE}/cv/ · PDF: ${SITE}${cvMeta.pdfUrl} · JSON: ${SITE}/cv.json · Plain text: ${SITE}/cv/plain.txt`, '')

  L.push('## Contact', '')
  for (const c of contact) {
    const page = c.url && c.url.startsWith('/') ? abs(c.url) : c.url
    const label = c.value
    L.push(page ? `- ${c.label}: [${label}](${page})` : `- ${c.label}: ${c.value}`)
  }
  L.push('')

  L.push('## Profile', '')
  for (const p of profile) L.push(p, '')

  L.push('## Experience', '')
  for (const j of experience) {
    const org = ORG_PAGE[j.org] ? `[${j.org}](${abs(ORG_PAGE[j.org])})` : j.org
    L.push(`### ${j.role} — ${org}${j.location ? `, ${j.location}` : ''}`, '', `*${j.start} – ${j.end}*`, '')
    for (const b of j.bullets) L.push(`- ${b}`)
    L.push('')
  }

  const main = topLevel('former')
  const ordered = [...LEAD.map((s) => main.find((p) => p.slug === s)!).filter(Boolean), ...main.filter((p) => !LEAD.includes(p.slug))]
  L.push('## Products', '', `Each has its own page with its site, docs and data. Full list: ${SITE}/products/`, '')
  for (const p of ordered) L.push(`- [${p.name}](${SITE}/${p.slug}/) — ${p.line}`)
  L.push('', '### Hobby and personal projects', '')
  for (const p of topLevel('current')) L.push(`- [${p.name}](${SITE}/${p.slug}/) — ${p.line}`)
  L.push('')

  L.push('## Education', '')
  for (const ed of education) {
    L.push(`- **${ed.degree}**${'honors' in ed && ed.honors ? ` — ${ed.honors}` : ''} — ${ed.school} (${ed.years})`)
    if ('detail' in ed && ed.detail) L.push(`  ${ed.detail}`)
    if ('link' in ed && ed.link) L.push(`  [${ed.linkLabel ?? 'Link'}](${ed.link})`)
  }
  L.push('')

  L.push('## Publications & exhibitions', '')
  for (const p of publications) { const w = workByTitle(p.replace(/^"|"$/g, '')); L.push(w ? `- [${p}](${SITE}${w.href})` : `- ${p}`) }
  L.push('', '### Publishing', '', `All works: ${SITE}/publishing/`, '')
  for (const w of works) L.push(`- [${w.title}](${SITE}${w.href}) — ${w.kind}, ${w.year}. ${w.line}${w.external ? ` · [${w.external.label}](${w.external.href})` : ''}`)
  L.push('', '## Skills', '')
  for (const g of skillGroups) {
    L.push(`### ${g.name}`, '')
    for (const i of g.items) L.push(`- ${i}`)
    L.push('')
  }
  L.push('## Languages', '')
  for (const l of languages) L.push(`- ${l.name}: ${l.level}`)
  return L.join('\n').trim() + '\n'
}
