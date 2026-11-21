/**
 * Every public page, from the sitemaps just written to dist/.
 * Regenerates /api/site/pages.json and /.well-known/api-catalog.
 * Run after sitemap-extras, on every site build.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const DIST = join(root, 'dist')
const SITE = 'https://gokhanturhan.com'
const STATUS = [{ href: 'https://status.gokhanturhan.com/', type: 'text/html' }]

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name)
    if (name.isDirectory()) walk(path, out)
    else if (name.name.includes('sitemap') && name.name.endsWith('.xml')) out.push(path)
  }
  return out
}

function titleOf(file) {
  if (!existsSync(file)) return null
  const head = readFileSync(file, 'utf8').slice(0, 20000)
  const m = head.match(/<title>([^<]*)<\/title>/i)
  if (!m) return null
  return m[1].replace(/\s+/g, ' ').replace(/\s*[|·—-]\s*Gökhan Turhan\s*$/u, '').trim() || null
}

function fileFor(pathname) {
  let path = pathname
  if (path.endsWith('/')) path += 'index.html'
  else if (!path.split('/').pop().includes('.')) path += '/index.html'
  return join(DIST, path)
}

function kindOf(pathname) {
  const seg = pathname.split('/').filter(Boolean)[0] || 'home'
  return seg
}

const urls = new Set()
for (const file of walk(DIST)) {
  const xml = readFileSync(file, 'utf8')
  for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let parsed
    try { parsed = new URL(loc[1].trim()) } catch { continue }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'gokhanturhan.com') continue
    if (parsed.pathname.endsWith('.xml') || parsed.pathname.startsWith('/cdn-cgi/')) continue
    parsed.hash = ''
    urls.add(parsed.href)
  }
}

const pages = [...urls].sort().map((url) => {
  const path = url.slice(SITE.length) || '/'
  const file = fileFor(path)
  const type = path.endsWith('.json') ? 'application/json' : path.endsWith('.txt') ? 'text/plain' : path.endsWith('.xml') ? 'application/xml' : 'text/html'
  return { url, path, kind: kindOf(path), title: titleOf(file), type }
})

const pagesDoc = {
  name: 'Every public page',
  description: 'Built from the sitemap at the end of each site build. A new journal post, product, or page is included the next time the site is published.',
  count: pages.length,
  url: `${SITE}/api/site/pages.json`,
  pages,
}

function writeBoth(rel, text) {
  for (const base of ['public', 'dist']) {
    const dest = join(root, base, rel)
    mkdirSync(join(dest, '..'), { recursive: true })
    writeFileSync(dest, text)
  }
}

writeBoth('api/site/pages.json', JSON.stringify(pagesDoc) + '\n')

const spec = [{ href: `${SITE}/api/site/openapi.json`, type: 'application/json' }]
const api = (anchor, doc, desc = spec) => ({
  anchor,
  'service-desc': desc,
  'service-doc': [{ href: doc, type: 'text/html' }],
  status: STATUS,
})

const catalog = {
  linkset: [
    {
      anchor: `${SITE}/`,
      'service-desc': spec,
      'service-doc': [{ href: `${SITE}/api/site/`, type: 'text/html' }],
      describedby: [
        { href: `${SITE}/llms.txt`, type: 'text/plain' },
        { href: `${SITE}/api/site/pages.json`, type: 'application/json' },
      ],
      index: [{ href: `${SITE}/api/site/pages.json`, type: 'application/json' }],
      status: STATUS,
      item: pages.map((p) => ({ href: p.url, type: p.type, title: p.title || undefined })),
    },
    api(`${SITE}/api/site/`, `${SITE}/api/site/`),
    api(`${SITE}/api/site/pages.json`, `${SITE}/`),
    api(`${SITE}/api/site/journal.json`, `${SITE}/journal/`),
    api(`${SITE}/api/site/cv.json`, `${SITE}/cv/`),
    api(`${SITE}/api/site/products.json`, `${SITE}/products/`),
    api(`${SITE}/api/site/about.json`, `${SITE}/about/`),
    api(`${SITE}/api/site/links.json`, `${SITE}/links/`),
    api(`${SITE}/api/site/publishing.json`, `${SITE}/publishing/`),
    api(`${SITE}/mcp`, `${SITE}/api/site/`),
    api(`${SITE}/api/`, `${SITE}/api/`, [{ href: `${SITE}/api/openapi.json`, type: 'application/json' }]),
    api(`${SITE}/ishtar/`, `${SITE}/api/ishtar/`, [{ href: `${SITE}/ishtar/openapi.json`, type: 'application/json' }]),
    api(`${SITE}/curb/`, `${SITE}/curb/docs/reference/api/`, [{ href: `${SITE}/curb/openapi.json`, type: 'application/json' }]),
  ],
}
catalog.linkset[2].alternate = [{ href: `${SITE}/sitemap-index.xml`, type: 'application/xml' }]
catalog.linkset[3].alternate = [{ href: `${SITE}/rss.xml`, type: 'application/rss+xml' }]
writeBoth('.well-known/api-catalog', JSON.stringify(catalog) + '\n')

for (const base of ['public', 'dist']) {
  const indexPath = join(root, base, 'api/site/index.json')
  if (!existsSync(indexPath)) continue
  const index = JSON.parse(readFileSync(indexPath, 'utf8'))
  const href = `${SITE}/api/site/pages.json`
  index.resources = [{ slug: 'pages', name: 'Every public page', href, page: `${SITE}/` }, ...(index.resources || []).filter((r) => r.slug !== 'pages')]
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n')
  const specPath = join(root, base, 'api/site/openapi.json')
  if (existsSync(specPath)) {
    const spec = JSON.parse(readFileSync(specPath, 'utf8'))
    spec.paths['/api/site/pages.json'] = {
      get: { operationId: 'site_pages_get', summary: 'Every public page', responses: { 200: { description: 'JSON' } }, security: [] },
    }
    spec.paths['/mcp'] = {
      post: { operationId: 'site_mcp', summary: 'Read-only MCP JSON-RPC', responses: { 200: { description: 'JSON-RPC' } }, security: [] },
    }
    writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n')
  }
}

const kinds = {}
for (const page of pages) kinds[page.kind] = (kinds[page.kind] || 0) + 1
console.log(JSON.stringify({ pages: pages.length, art: kinds.art || 0, publishing: kinds.publishing || 0, journal: kinds.journal || 0, 'ethereum-doomsday': kinds['ethereum-doomsday'] || 0 }))
