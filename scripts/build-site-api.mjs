/**
 * Build the read-only site content API into public/api/site and the linkset.
 * Run from the estate root: node --experimental-strip-types scripts/build-site-api.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { products, journalProducts, catalog as estateCatalog, CATEGORIES, CATEGORY_OF } from '../src/data/estate.ts'
import { guides, QUADS } from '../src/data/guides.ts'
import { ebooks } from '../src/data/ebooks.ts'
import { academicPublications, experimentalWorks } from '../src/data/publishing.ts'
const academicSlug = (title) =>
  title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 8).join('-')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://gokhanturhan.com'
const outDirs = [join(root, 'public/api/site')]
const distSite = join(root, 'dist/api/site')
if (existsSync(join(root, 'dist'))) outDirs.push(distSite)
for (const dir of outDirs) mkdirSync(dir, { recursive: true })
const out = outDirs[0]

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|amp|lt|gt);/g, (m) => ENTITIES[m] || m).replace(/\s+/g, ' ').trim()
const abs = (href) => {
  if (!href) return href
  if (href.startsWith('mailto:')) return href.toLowerCase() === 'mailto:contact@gokhan.vc' ? href : null
  if (href.startsWith('/')) return SITE + href
  return href
}
const keepLink = (href) => {
  const url = abs(href)
  return url ? { href: url } : null
}

function parsePost(file, raw) {
  if (!raw.startsWith('---')) return null
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return null
  const fm = raw.slice(3, end)
  const body = raw.slice(end + 4).replace(/^\r?\n/, '')
  const grab = (key) => {
    const m = fm.match(new RegExp('^' + key + ':\\s*(.*)$', 'm'))
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
  }
  if (/^draft:\s*true\s*$/m.test(fm)) return null
  const tags = []
  const inline = fm.match(/^tags:\s*\[(.*)\]\s*$/m)
  const tagBlock = fm.match(/^tags:\s*\n((?:[ \t]*- .+\n)*)/m)
  const rawTags = inline ? inline[1].split(',') : tagBlock ? tagBlock[1].split('\n').map((line) => line.replace(/^\s*-\s*/, '')) : []
  for (const item of rawTags) {
    const tag = item.trim().replace(/^['"]|['"]$/g, '')
    if (tag) tags.push(tag)
  }
  const slug = file.replace(/\.mdx?$/, '')
  return {
    slug,
    title: grab('title'),
    description: grab('description'),
    published: grab('publishDate').slice(0, 10),
    updated: grab('updatedDate').slice(0, 10) || null,
    category: grab('category'),
    tags,
    url: `${SITE}/journal/${slug}/`,
    body,
  }
}

const journal = readdirSync(join(root, 'src/content/blog'))
  .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
  .map((name) => parsePost(name, readFileSync(join(root, 'src/content/blog', name), 'utf8')))
  .filter(Boolean)
  .sort((a, b) => (a.published < b.published ? 1 : -1))

const productOf = (p) => ({
  slug: p.slug,
  name: p.name,
  line: p.line,
  status: p.status,
  family: p.family,
  category: CATEGORIES.find((c) => c.id === CATEGORY_OF[p.slug.split('/')[0]])?.name || null,
  former: p.former || null,
  tags: p.tags,
  url: `${SITE}/${p.slug}/`,
  about: p.about || [],
  functions: p.functions || [],
  links: (p.links || []).map((l) => ({ label: l.label, href: abs(l.href) })).filter((l) => l.href),
})

// Projects & Products: every listed item, grouped by category in site order,
// plus full records for the products that carry about/functions/links.
const productSlugs = new Set(products.map((p) => p.slug))
const categoryName = (id) => CATEGORIES.find((c) => c.id === id)?.name || null
const productsJson = {
  name: 'Projects & Products',
  url: `${SITE}/products/`,
  categories: [...new Set(estateCatalog.map((e) => e.category))].map((id) => ({
    id,
    name: categoryName(id),
    items: estateCatalog.filter((e) => e.category === id).map((e) => ({ slug: e.slug, name: e.name, line: e.line, url: abs(e.href), former: e.former || null, tags: e.tags })),
  })),
  products: [
    ...products.filter((p) => !p.noindex).map(productOf),
    ...estateCatalog.filter((e) => !productSlugs.has(e.slug) && !e.href.startsWith('/journal/')).map((e) => ({
      slug: e.slug, name: e.name, line: e.line, status: 'current', family: null, category: categoryName(e.category),
      former: e.former || null, tags: e.tags, url: abs(e.href), about: [], functions: [], links: [],
    })),
  ],
  journal_products: journalProducts.map((p) => ({ name: p.name, line: p.line, url: abs(p.href) })),
}

const about = {
  name: 'About',
  url: `${SITE}/about/`,
  description: 'How to find your way around this site: tutorials, how-to guides, explanation and reference.',
  quads: QUADS.map((q) => ({
    key: q.key,
    title: q.title,
    mode: q.mode,
    guides: guides.filter((g) => g.quad === q.key).map((g) => ({
      title: g.title,
      lead: g.lead,
      url: `${SITE}/about/${g.slug}/`,
      tags: g.tags || [],
      steps: (g.steps || []).map(textOf),
      rows: (g.rows || []).map(([label, value]) => ({ label, value: textOf(value) })),
      notes: (g.notes || []).map(textOf),
      next: g.next.map((n) => ({ label: n.label, href: abs(n.href) })),
    })),
  })),
}

const linksSrc = readFileSync(join(root, 'src/pages/links.astro'), 'utf8')
const secStart = linksSrc.indexOf('const sections: Section[] = ')
const secEnd = linksSrc.indexOf('\nconst nav')
const sections = Function(`"use strict"; const sections = ${linksSrc.slice(secStart + 'const sections: Section[] = '.length, secEnd).trim().replace(/;$/, '')}; return sections`)()

const wallets = []

const links = {
  name: 'Links',
  url: `${SITE}/links/`,
  description: 'Where to find Gökhan Turhan: profiles, writing, and communities.',
  sections: sections.map((s) => ({
    id: s.id,
    title: s.title,
    hint: s.hint,
    groups: s.groups.map((g) => ({
      name: g.name,
      tag: g.tag || null,
      links: g.handles.map((h) => ({ href: h.href, label: h.label || null, note: h.note || null })).filter((h) => keepLink(h.href)),
    })),
  })),
  wallets,
}

const publishing = {
  name: 'Publishing',
  url: `${SITE}/publishing/`,
  works: [
    ...ebooks.map((e) => ({ kind: 'E-book', slug: e.slug, title: e.title, year: e.publishedOn.slice(0, 4), line: e.subtitle, url: `${SITE}/publishing/ebooks/${e.slug}/` })),
    ...academicPublications.map((a) => ({ kind: 'Academic', slug: academicSlug(a.title), title: a.title, year: a.year, line: `${a.type} · ${a.venue}`, url: `${SITE}/publishing/academic/${academicSlug(a.title)}/`, external: { label: a.linkLabel, href: a.href } })),
    ...experimentalWorks.map((w) => ({ kind: 'Experimental', slug: w.detailHref.split('/').filter(Boolean).pop(), title: w.title, year: w.year, line: w.creators, url: abs(w.detailHref), external: w.sourceHref ? { label: w.sourceLabel || 'Source', href: w.sourceHref } : null })),
  ],
}

const cvPath = existsSync(join(root, 'dist/cv.json')) ? join(root, 'dist/cv.json') : join(root, 'public/cv.json')
const cv = {
  name: 'CV',
  url: `${SITE}/cv/`,
  markdown: `${SITE}/cv.md`,
  pdf: `${SITE}/cv/Gokhan_Turhan_CV.pdf`,
  plain: `${SITE}/cv/plain.txt`,
  cv: JSON.parse(readFileSync(cvPath, 'utf8')),
}

const resources = [
  ['index', 'Index', `${SITE}/api/site/index.json`, `${SITE}/api/`],
  ['journal', 'Journal', `${SITE}/api/site/journal.json`, `${SITE}/journal/`],
  ['cv', 'CV', `${SITE}/api/site/cv.json`, `${SITE}/cv/`],
  ['products', 'Projects & Products', `${SITE}/api/site/products.json`, `${SITE}/products/`],
  ['about', 'About', `${SITE}/api/site/about.json`, `${SITE}/about/`],
  ['links', 'Links', `${SITE}/api/site/links.json`, `${SITE}/links/`],
  ['publishing', 'Publishing', `${SITE}/api/site/publishing.json`, `${SITE}/publishing/`],
]

const index = {
  name: 'Gökhan Turhan — site content',
  description: 'Read-only JSON for the public site: journal, CV, projects and products, about, links, and publishing.',
  docs: `${SITE}/api/site/`,
  openapi: `${SITE}/api/site/openapi.json`,
  page: `${SITE}/`,
  resources: resources.map(([slug, name, href, page]) => ({ slug, name, href, page })),
}

const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Gökhan Turhan site content',
    version: '2026-11-18',
    description: 'Read-only JSON for the public site. Journal posts, the CV, the projects and products index, the about guides, every public link, and publishing. No payment. Contact: contact@gokhan.vc.',
    contact: { email: 'contact@gokhan.vc', url: `${SITE}/` },
  },
  servers: [{ url: SITE }],
  paths: Object.fromEntries(resources.map(([slug, name]) => [`/api/site/${slug}.json`, {
    get: {
      operationId: `site_${slug}_get`,
      summary: name,
      responses: { 200: { description: 'JSON' } },
      security: [],
    },
  }])),
}
openapi.paths['/mcp'] = {
  post: {
    operationId: 'site_mcp',
    summary: 'Read-only MCP JSON-RPC for the public site',
    responses: { 200: { description: 'JSON-RPC' } },
    security: [],
  },
}

const files = {
  'index.json': index,
  'journal.json': { name: 'Journal', url: `${SITE}/journal/`, rss: `${SITE}/rss.xml`, count: journal.length, posts: journal },
  'cv.json': cv,
  'products.json': productsJson,
  'about.json': about,
  'links.json': links,
  'publishing.json': publishing,
  'openapi.json': openapi,
}
for (const [name, data] of Object.entries(files)) {
  const body = JSON.stringify(data, null, 2) + '\n'
  for (const dir of outDirs) writeFileSync(join(dir, name), body)
}

const rows = resources.filter(([slug]) => slug !== 'index').map(([slug, name, href, page]) =>
  `<div class="cx-r"><span>/${slug}.json</span><span><a class="nm" href="/api/site/${slug}.json">${name}</a> — <a href="${page}">page</a></span></div>`
).join('') + '<div class="cx-r"><span>POST /mcp</span><span><a class="nm" href="/mcp">Site MCP</a> — read-only tools for these same pages</span></div>'
const html = `<!doctype html><html lang="en"><head><link rel="stylesheet" href="/fonts.css"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Site content · API index · Gökhan Turhan</title>
<meta name="description" content="Read-only JSON for the journal, CV, products, about guides, links, and publishing.">
<meta name="robots" content="index, follow"><link rel="canonical" href="https://gokhanturhan.com/api/site/"><link rel="alternate" type="application/json" href="https://gokhanturhan.com/api/site/index.json">
<style>:root{--ink:#1a1a1a;--paper:#ffffff;--dim:#4a4a4a;--hair:#e0e0e0;--ikb:#002fa7;--bg:#fff;--mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;--serif:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.5 var(--serif)}
.sheet{max-width:980px;margin:0 auto;padding:22px 28px 48px}a{color:var(--ikb)}
.mast{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;border-bottom:2px solid var(--ink);padding-bottom:10px}
.mast h1{margin:0;font-size:22px}.mast h1 a{color:var(--ink);text-decoration:none}
.role,.doc{margin:2px 0 0;font:11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}.doc b{color:var(--ink)}
nav{display:flex;flex-wrap:wrap;gap:14px;font:12px var(--mono);text-transform:uppercase;letter-spacing:.06em;padding:8px 0 4px;border-bottom:1px solid var(--ink);margin-bottom:18px}
nav a{color:var(--ink);text-decoration:none}
h2{font-size:24px;margin:8px 0 12px}.lead{font-size:19px;max-width:64ch}
.cx{border:1px solid var(--ink);background:var(--bg);margin:0 0 16px}
details.cx>summary{cursor:pointer;list-style:none}details.cx>summary::-webkit-details-marker{display:none}details.cx>summary::before{content:"▸";color:#C41E3A;padding:7px 0 7px 8px}details.cx[open]>summary::before{content:"▾"}details.cx:not([open])>summary{border-bottom:0}details.cx:not([open])>:not(summary){display:none!important}
.cx-h{display:flex;flex-wrap:wrap;border-bottom:1px solid var(--ink);font:500 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase}
.cx-h b{background:var(--ink);color:var(--paper);padding:7px 9px;font-weight:500}
.cx-h span{padding:7px 9px;color:var(--dim);letter-spacing:.02em;text-transform:none}
.cx-r{display:grid;grid-template-columns:13rem 1fr;gap:0 14px;padding:7px 10px;font-size:15px;line-height:1.4}
.cx-r+.cx-r{border-top:1px dotted var(--ink)}
.cx-r>:first-child{font:12px var(--mono);color:var(--dim)}
.cx-r a.nm{font-weight:600;text-decoration:none}
footer{margin-top:28px;border-top:1px solid var(--ink);padding-top:10px;font:12px var(--mono);color:var(--dim)}
@media (max-width:720px){.cx-r{grid-template-columns:1fr}}
</style><link rel="stylesheet" href="/api-skin.css?v=1"></head><body><div class="sheet">
<header class="mast"><div><h1><a href="/api/site/">Site content</a></h1><p class="role">Gökhan Turhan · read-only JSON</p></div>
<p class="doc"><b>API-SITE</b> · 2026-11-18</p></header>
<nav><a href="/api/">Index</a><a href="/api/site/">Site</a><a href="/api/site/openapi.json">OpenAPI</a><a href="/api/site/index.json">index.json</a><a href="/journal/">Journal</a><a href="/cv/">CV</a><a href="/links/">Links</a></nav>
<main><p class="lead">A read-only API for the public site. The journal, the CV, the projects and products index, the about guides, every public link, and publishing. No payment. Contact is <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>.</p>
<details class="cx fold" open><summary class="cx-h"><b>Resources</b><span>GET · application/json</span></summary>${rows}</details>
</main>
<footer><p><a href="/api/">API index</a> · <a href="/sitemap-index.xml">Sitemap</a> · <a href="/robots.txt">robots.txt</a> · <a href="/llms.txt">llms.txt</a> · <a href="/api/apis.json">apis.json</a> · <a href="/api/openapi.json">openapi.json</a> · <a href="/.well-known/api-catalog">api-catalog</a></p></footer>
</div><script src="/fold-sections.js" defer></script></body></html>
`
for (const dir of outDirs) writeFileSync(join(dir, 'index.html'), html)

const status = [{ href: 'https://status.gokhanturhan.com/', type: 'text/html' }]
const spec = [{ href: `${SITE}/api/site/openapi.json`, type: 'application/json' }]
const entry = (anchor, doc) => ({
  anchor,
  'service-desc': spec,
  'service-doc': [{ href: doc, type: 'text/html' }],
  status,
})
const catalog = {
  linkset: [
    entry(`${SITE}/api/site/`, `${SITE}/api/site/`),
    entry(`${SITE}/api/site/journal.json`, `${SITE}/journal/`),
    entry(`${SITE}/api/site/cv.json`, `${SITE}/cv/`),
    entry(`${SITE}/api/site/products.json`, `${SITE}/products/`),
    entry(`${SITE}/api/site/about.json`, `${SITE}/about/`),
    entry(`${SITE}/api/site/links.json`, `${SITE}/links/`),
    entry(`${SITE}/api/site/publishing.json`, `${SITE}/publishing/`),
    entry(`${SITE}/mcp`, `${SITE}/api/site/`),
    entry(`${SITE}/api/`, `${SITE}/api/`),
    entry(`${SITE}/ishtar/`, `${SITE}/api/ishtar/`),
    entry(`${SITE}/curb/`, `${SITE}/curb/docs/reference/api/`),
  ],
}
catalog.linkset[8]['service-desc'] = [{ href: `${SITE}/api/openapi.json`, type: 'application/json' }]
catalog.linkset[9]['service-desc'] = [{ href: `${SITE}/ishtar/openapi.json`, type: 'application/json' }]
catalog.linkset[10]['service-desc'] = [{ href: `${SITE}/curb/openapi.json`, type: 'application/json' }]
catalog.linkset[1].alternate = [{ href: `${SITE}/rss.xml`, type: 'application/rss+xml' }]
catalog.linkset[0].describedby = [{ href: `${SITE}/llms.txt`, type: 'text/plain' }]
const catalogJson = JSON.stringify(catalog, null, 2) + '\n'
writeFileSync(join(root, 'public/.well-known/api-catalog'), catalogJson)
if (existsSync(join(root, 'dist'))) {
  mkdirSync(join(root, 'dist/.well-known'), { recursive: true })
  writeFileSync(join(root, 'dist/.well-known/api-catalog'), catalogJson)
}

const linkCount = links.sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.links.length, 0), 0)
const walletCount = links.wallets.reduce((n, w) => n + w.items.length, 0)
console.log(JSON.stringify({ posts: journal.length, products: productsJson.products.length, categories: productsJson.categories.length, guides: guides.length, links: linkCount, wallets: walletCount, works: publishing.works.length }))
