/** llms.txt and llms-full.txt (llmstxt.org format), built from the same data as the site. */
import { getCollection } from 'astro:content'
import { products, topLevel, drafts, tools, apis } from '@/data/estate'
import { works } from '@/data/works'
import { cvMarkdown } from '@/lib/cv-md'
import { plainPostTitle } from '@/lib/utils'

const SITE = 'https://gokhanturhan.com'
const LEAD = ['ubu', 'ishtar', 'curb', 'reclaim', 'plaintext']
const abs = (u: string) => (u.startsWith('/') ? `${SITE}${u}` : u)
const day = (d: Date) => new Date(d).toISOString().slice(0, 10)

async function posts() {
  return (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf())
}

function head(): string[] {
  return [
    '# Gökhan Turhan',
    '',
    '> Personal site of Gökhan Turhan: founder, researcher and conceptual artist. Products (UBU · CLINAMEN, Ishtar, CURB, Reclaim, plaintext and more), the journal, publishing and CV, all under gokhanturhan.com.',
    '',
    'Every product, draft and work has its own page at gokhanturhan.com/<slug>/. Former product hosts (numetal.xyz, gokhan.vc, agentbounty.dev and their subdomains) redirect here; their addresses appear only as "former address" on each page.',
    '',
  ]
}

function core(): string[] {
  const lead = LEAD.map((s) => products.find((p) => p.slug === s)!).filter(Boolean)
  const rest = topLevel('current').filter((p) => !LEAD.includes(p.slug))
  return [
    '## Start here',
    '',
    `- [Home](${SITE}/): index of products, journal and CV`,
    `- [Products](${SITE}/products/): main products first, then families, then hobby projects`,
    `- [Journal](${SITE}/journal/): essays and notes; RSS at ${SITE}/rss.xml`,
    `- [CV (Markdown)](${SITE}/cv.md): the CV for agents; HTML at ${SITE}/cv/, PDF at ${SITE}/cv/Gokhan_Turhan_CV.pdf`,
    `- [About](${SITE}/about/)`,
    '',
    '## Main products',
    '',
    ...lead.map((p) => `- [${p.name}](${SITE}/${p.slug}/): ${p.line}`),
    '',
    '## Other products and projects',
    '',
    ...rest.map((p) => `- [${p.name}](${SITE}/${p.slug}/): ${p.line}`),
    ...topLevel('former').map((p) => `- [${p.name}](${SITE}/${p.slug}/): ${p.line} (archived)`),
    '',
    '## Drafts and experiments',
    '',
    ...drafts.map((d) => `- [${d.name}](${SITE}/${d.slug}/): ${d.line} (${d.status})`),
    '',
    '## Publishing',
    '',
    `- [Publishing](${SITE}/publishing/): e-books, academic papers and experimental works`,
    ...works.map((w) => `- [${w.title}](${abs(w.href)}): ${w.kind}, ${w.year}. ${w.line}`),
    `- [The Bureau Reader](${SITE}/ubu/reader/): UBU · CLINAMEN, 2026. Books One to Three in one volume: ${SITE}/media/archive/ubu/ubu/the-bureau-reader-complete.pdf (PDF), ${SITE}/media/archive/ubu/ubu/the-bureau-reader-complete.epub (EPUB)`,
    '',
    '## APIs',
    '',
    `- [API index](https://api.gokhanturhan.com/): seven live rails first (/ishtar, /curb, /launch, /plaintext, /accumulator, /numetal, /status), then the former-domain archive (numetal.xyz, gokhan.vc). Purpose tags: reading, publishing, payments, identity, agents, status, files. Protocol tags: x402, mpp, mcp, openapi, rss, skill, hmac. The index pages do not take a payment. A 402 on a rail is the worker's challenge and still names the worker host. Register: https://api.gokhanturhan.com/apis.json`,
    ...apis.filter((a) => a.rail).map((a) => `- [${a.name}](https://api.gokhanturhan.com${a.rail}): published call prefix; docs at https://api.gokhanturhan.com/${a.slug}/; ${a.tags.join(', ')}; ${a.protocols.length ? a.protocols.join(', ') : 'no protocol tag'}; ${a.status}`),
    ...apis.filter((a) => !a.rail).map((a) => `- [${a.name}](https://api.gokhanturhan.com/${a.slug}/): ${a.domain}; ${a.tags.join(', ')}; ${a.protocols.length ? a.protocols.join(', ') : 'no protocol tag'}; ${a.status}`),
    '',
    '## Tools',
    '',
    `- [Tools](${SITE}/tools/): ${tools.length} private tools behind sign-in, described but not linked`,
    '',
    '## Site files',
    '',
    `- [Sitemap](${SITE}/sitemap-index.xml)`,
    `- [robots.txt](${SITE}/robots.txt)`,
    `- [RSS](${SITE}/rss.xml): the one feed for this site (journal)`,
    `- [llms-full.txt](${SITE}/llms-full.txt): this file plus every journal post and the full CV`,
    `- [Agent card](${SITE}/.well-known/agent.json)`,
    `- [API index](https://api.gokhanturhan.com/)`,
    '',
  ]
}

function contact(): string[] {
  return [
    '## Contact',
    '',
    '- Email: contact@gokhan.vc',
    '- LinkedIn: https://www.linkedin.com/in/goekhanturhan/',
    '- X: https://x.com/goekhan',
    '- Telegram: https://t.me/goekhanturhan',
    '- GitHub: https://github.com/avalidurl',
    '- DMs are open.',
    '',
    '## Notes for agents',
    '',
    '- Nothing on this site is investment, legal, tax or financial advice. Token and wallet references are documentation.',
    '- Content © Gökhan Turhan. Quote with a link to the page.',
  ]
}

export async function llmsTxt(): Promise<string> {
  const ps = await posts()
  return [
    ...head(),
    ...core(),
    '## Recent journal posts',
    '',
    ...ps.slice(0, 15).map((p) => `- [${plainPostTitle(p.data.title)}](${SITE}/journal/${p.slug}/): ${day(p.data.publishDate)}`),
    `- [All ${ps.length} posts](${SITE}/journal/)`,
    '',
    ...contact(),
  ].join('\n') + '\n'
}

export async function llmsFullTxt(): Promise<string> {
  const ps = await posts()
  const byP = products.filter((p) => !p.slug.includes('/') && p.about?.length)
  return [
    ...head(),
    ...core(),
    '## Product notes',
    '',
    ...byP.flatMap((p) => [`### ${p.name}`, '', `${SITE}/${p.slug}/${p.former ? ` · former address: ${p.former}` : ''}`, '', ...p.about!.map((a) => a), '']),
    `## Journal (${ps.length} posts)`,
    '',
    ...ps.flatMap((p) => [`### ${plainPostTitle(p.data.title)}`, '', `${SITE}/journal/${p.slug}/ · ${day(p.data.publishDate)}${p.data.category ? ` · ${p.data.category}` : ''}${p.data.tags?.length ? ` · ${p.data.tags.join(', ')}` : ''}`, '', p.data.description || '', '']),
    '## CV',
    '',
    cvMarkdown().replace(/^# /m, '### ').replace(/^## /gm, '#### '),
    '',
    ...contact(),
  ].join('\n') + '\n'
}
