#!/usr/bin/env node
/**
 * Build-time OG cards for gokhanturhan.com.
 *
 * Journal posts get /og/<slug>.png; the homepage gets /og/home.png (and
 * /og-default.png as a backward-compatible alias); every other page whose
 * og:image points at /og/pages/<key>.png gets a card generated from its
 * title and description. Product original-design cards (Ishtar, CURB, …)
 * and other custom imagery are left alone.
 *
 * After the cards are written, each one is also copied to a content-hashed
 * path /og/v/<sha256-12>.png, and og:image / twitter:image / JSON-LD image
 * URLs in the built HTML are rewritten to that path. The unhashed paths
 * remain, so old links do not 404. `--stamp` does only the hash-and-rewrite
 * pass (used after mount-origins so origin-mounted HTML is versioned too).
 *
 * Uses @resvg/resvg-js and the house fonts — no Chrome, so this runs on
 * Cloudflare Pages' Linux build image. Invoked after `astro build`.
 *
 *   node scripts/gen-og.mjs
 *   node scripts/gen-og.mjs --only=slug
 *   node scripts/gen-og.mjs --stamp
 */
import { writeFile, mkdir, readdir, readFile, copyFile } from 'node:fs/promises'
import { existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import { renderCard } from './og-render.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const POSTS_DIR = join(ROOT, 'src/content/blog')
const DIST = join(ROOT, 'dist')
const PUBLIC = join(ROOT, 'public')
const OUT_ROOT = existsSync(DIST) ? DIST : PUBLIC

const args = process.argv.slice(2)
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice('--only='.length)
const STAMP_ONLY = args.includes('--stamp')
const HASH_LEN = 12

function sha12(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, HASH_LEN)
}

function isQuotePath(pathname) {
  return pathname === '/og/quote.png' || pathname.startsWith('/og/quote.png') || pathname.startsWith('/og/quote?')
}

async function collectCardFiles(root) {
  const out = []
  async function walk(dir, urlBase) {
    const ents = await readdir(dir, { withFileTypes: true })
    for (const ent of ents) {
      const abs = join(dir, ent.name)
      const url = `${urlBase}/${ent.name}`
      if (ent.isDirectory()) {
        if (ent.name === 'v') continue
        await walk(abs, url)
      } else if (ent.name.endsWith('.png')) {
        out.push({ abs, urlPath: url })
      }
    }
  }
  const ogDir = join(root, 'og')
  if (existsSync(ogDir)) await walk(ogDir, '/og')
  const def = join(root, 'og-default.png')
  if (existsSync(def)) out.push({ abs: def, urlPath: '/og-default.png' })
  return out
}

/**
 * walkHtml skips origin-mounted product trees, so filing, legal, and docs
 * pages under those prefixes never got a card. Journal slugs with punctuation
 * can also disagree with the filename. Fill any missing /og/*.png that HTML
 * still points at, using the page's own title and description.
 */
async function generateMissingCards(root) {
  let made = 0
  async function* walkAll(dir) {
    const ents = await readdir(dir, { withFileTypes: true })
    for (const ent of ents) {
      const path = join(dir, ent.name)
      if (ent.isDirectory()) {
        if (['fonts', 'media', 'icons', 'og-lib', 'og', 'node_modules'].includes(ent.name)) continue
        yield* walkAll(path)
      } else if (ent.name.endsWith('.html')) {
        yield path
      }
    }
  }
  for await (const path of walkAll(root)) {
    const html = await readFile(path, 'utf8')
    const image = meta(html, 'og:image') || meta(html, 'twitter:image')
    if (!image) continue
    let imagePath
    try {
      const abs = new URL(image, 'https://gokhanturhan.com')
      imagePath = decodeURIComponent(abs.pathname)
    } catch {
      continue
    }
    if (!imagePath.endsWith('.png')) continue
    if (!(imagePath.startsWith('/og/') || imagePath === '/og-default.png')) continue
    if (imagePath.startsWith('/og/v/') || isQuotePath(imagePath)) continue
    const output = resolve(root, '.' + imagePath)
    const rel = relative(root, output)
    if (rel.startsWith('..')) throw new Error(`invalid card path ${imagePath}`)
    if (existsSync(output)) continue

    const rawTitle = (meta(html, 'og:title') || '').replace(/\s*\|\s*Gökhan Turhan\s*$/u, '')
    const description = meta(html, 'og:description') || ''
    let route = '/'
    const url = meta(html, 'og:url') || meta(html, 'twitter:url')
    try {
      route = url ? new URL(url).pathname : '/' + relative(root, dirname(path)).split('\\').join('/') + '/'
    } catch {
      route = '/' + relative(root, dirname(path)).split('\\').join('/') + '/'
    }
    if (!route.endsWith('/')) route += '/'
    const section = sectionOf(route)
    const footerPath = route === '/' ? 'gokhanturhan.com' : `gokhanturhan.com${route}`.replace(/\/$/, '')
    await writePng(
      output,
      renderCard({
        kind: route === '/' || imagePath === '/og/home.png' || imagePath === '/og-default.png' ? 'home' : imagePath.startsWith('/og/pages/') ? 'page' : 'post',
        title: rawTitle || section,
        description,
        kicker: section,
        footer: footerPath,
        meta: section,
      }),
    )
    made++
  }
  if (made) console.log(`[og] generated ${made} missing cards referenced by HTML`)
}

/**
 * Copy each generated card to /og/v/<hash>.png and rewrite image URLs in the
 * built HTML (and xml/json/txt) so crawlers fetch a new URL when the bytes change.
 * Source files under public/ are never rewritten — only the output tree.
 */
async function stampAndRewrite(root) {
  await generateMissingCards(root)
  const files = await collectCardFiles(root)
  const vdir = join(root, 'og', 'v')
  await mkdir(vdir, { recursive: true })
  const manifest = new Map()
  const seenHash = new Set()
  for (const { abs, urlPath } of files) {
    if (urlPath.startsWith('/og/v/')) continue
    const buf = await readFile(abs)
    const hash = sha12(buf)
    const vPath = `/og/v/${hash}.png`
    if (!seenHash.has(hash)) {
      await writeFile(join(vdir, `${hash}.png`), buf)
      seenHash.add(hash)
    }
    manifest.set(urlPath, vPath)
  }

  const replaceUrl = (full) => {
    let parsed
    try {
      parsed = new URL(full, 'https://gokhanturhan.com')
    } catch {
      return full
    }
    const path = decodeURIComponent(parsed.pathname)
    if (isQuotePath(path) || path.startsWith('/og/v/')) return full
    const versioned = manifest.get(path)
    if (!versioned) return full
    if (/^https?:\/\//i.test(full)) {
      const host = parsed.hostname.replace(/^www\./, '')
      const origin = host === 'gokhanturhan.com' ? 'https://gokhanturhan.com' : parsed.origin
      return `${origin}${versioned}`
    }
    return versioned
  }

  // Absolute or root-relative URLs of unhashed generated cards. Negative
  // lookahead keeps /og/v/* and /og/quote.png from being rewritten.
  const re = /(?:https?:\/\/(?:www\.)?gokhanturhan\.com)?\/og(?:-default\.png|\/(?!v\/|quote\.png)[^"'\s<>#?]+?\.png)/g

  let rewrites = 0
  async function walkText(dir) {
    const ents = await readdir(dir, { withFileTypes: true })
    for (const ent of ents) {
      const abs = join(dir, ent.name)
      if (ent.isDirectory()) {
        if (['fonts', 'media', 'icons', 'og-lib', 'og', 'node_modules'].includes(ent.name)) continue
        await walkText(abs)
        continue
      }
      if (!/\.(html|xml|json|txt)$/i.test(ent.name)) continue
      const before = await readFile(abs, 'utf8')
      const after = before.replace(re, (m) => {
        const next = replaceUrl(m)
        if (next !== m) rewrites++
        return next
      })
      if (after !== before) await writeFile(abs, after)
    }
  }
  await walkText(root)
  console.log(
    `[og] stamped ${manifest.size} cards into ${seenHash.size} hashed files, rewrote ${rewrites} URL references`,
  )
}

const plainTitle = (t) => String(t ?? '').replace(/~~([^~]+)~~/g, '$1')

const decode = (s) =>
  s.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (v) => {
    const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }
    if (named[v]) return named[v]
    return String.fromCodePoint(v[2].toLowerCase() === 'x' ? parseInt(v.slice(3, -1), 16) : parseInt(v.slice(2, -1), 10))
  })

function meta(html, key) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]))
    if (attrs.property === key || attrs.name === key) return attrs.content ?? ''
  }
  return ''
}

async function* walkHtml(dir) {
  const ents = (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))
  for (const ent of ents) {
    const path = join(dir, ent.name)
    if (ent.isDirectory()) {
      // Origin-mounted product sites keep their own cards.
      if (['ishtar', 'curb', 'numetal', 'jesus', 'ubu', 'plaintext', 'reclaim', 'accumulator', 'apex', 'launch', 'llmcraft', 'clankdog', 'belief-systems', 'clank-tape', 'gokhan-vc', 'media', 'fonts', 'icons'].includes(ent.name) && dir === DIST) {
        continue
      }
      yield* walkHtml(path)
    } else if (ent.name.endsWith('.html')) {
      yield path
    }
  }
}

async function loadPosts() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  const posts = []
  for (const file of files) {
    const raw = await readFile(join(POSTS_DIR, file), 'utf8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) continue
    let data
    try {
      data = yaml.load(m[1])
    } catch (e) {
      console.warn(`  ! ${file}: unparseable frontmatter (${e.message}) — skipped`)
      continue
    }
    if (!data || data.draft) continue
    const slug = file.replace(/\.mdx?$/, '')
    posts.push({ slug, data })
  }
  const ordered = [...posts].sort((a, b) => {
    const d = new Date(a.data.publishDate) - new Date(b.data.publishDate)
    return d !== 0 ? d : a.slug.localeCompare(b.slug)
  })
  const docNumber = new Map(ordered.map((p, i) => [p.slug, i + 1]))
  for (const p of posts) p.docNumber = docNumber.get(p.slug)
  return posts
}

function sectionOf(route) {
  const first = route.split('/').filter(Boolean)[0] || 'home'
  const names = {
    home: 'Home',
    journal: 'Journal',
    archive: 'Archive',
    writing: 'Writing',
    publishing: 'Publishing',
    products: 'Products',
    'product-drafts': 'Drafts',
    tools: 'Tools',
    about: 'About',
    art: 'Art',
    lists: 'Lists',
    links: 'Links',
    newsletter: 'Newsletter',
    haleanbar: 'Haleanbar',
    cv: 'CV',
    raises: 'Raises',
    agents: 'Agents',
    consulting: 'Consulting',
    privacy: 'Privacy',
    disclaimer: 'Disclaimer',
    offline: 'Offline',
  }
  return names[first] || first.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function writePng(path, png) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, png)
}


async function copyOgLib(root) {
  const dest = join(root, 'og-lib')
  await mkdir(dest, { recursive: true })
  const files = [
    [join(ROOT, 'scripts/fonts/EBGaramond-SemiBold.ttf'), 'EBGaramond-SemiBold.ttf'],
    [join(ROOT, 'scripts/fonts/EBGaramond-Italic.ttf'), 'EBGaramond-Italic.ttf'],
    [join(ROOT, 'scripts/fonts/SourceSans3-Regular.ttf'), 'SourceSans3-Regular.ttf'],
    [join(ROOT, 'scripts/fonts/SourceSans3-Semibold.ttf'), 'SourceSans3-Semibold.ttf'],
    [join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm'), 'index_bg.wasm'],
  ]
  for (const [src, name] of files) {
    if (!existsSync(src)) throw new Error(`og-lib source missing: ${src}`)
    await copyFile(src, join(dest, name))
  }
}

async function main() {
  const t0 = Date.now()
  if (STAMP_ONLY) {
    if (!existsSync(DIST)) throw new Error('dist/ missing; run a full build before --stamp')
    await stampAndRewrite(DIST)
    console.log(`[og] stamp finished in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
    return
  }
  await mkdir(join(OUT_ROOT, 'og', 'pages'), { recursive: true })
  await copyOgLib(OUT_ROOT)

  let posts = await loadPosts()
  if (ONLY) {
    posts = posts.filter((p) => p.slug === ONLY)
    if (!posts.length) throw new Error(`no published post with slug "${ONLY}"`)
  }

  let made = 0

  // Homepage identity card.
  if (!ONLY) {
    const home = renderCard({
      kind: 'home',
      title: 'Gökhan Turhan',
      description:
        'Full-stack builder — one person, a fleet of agents. Agent-native venues, rails, and benchmarks live in production on x402: Ishtar, CURB, HeartBench. Journal, CV, publishing.',
      kicker: 'Full-stack builder  ·  Journal  ·  Products',
      footer: 'gokhanturhan.com',
      meta: 'Journal  ·  Products  ·  CV',
    })
    await writePng(join(OUT_ROOT, 'og', 'home.png'), home)
    await writePng(join(OUT_ROOT, 'og-default.png'), home)
    // Alias used by a few older references.
    await writePng(join(OUT_ROOT, 'og', 'gokhan-turhan-v2.png'), home)
    made += 3
    console.log('[og] home.png')
  }

  for (const post of posts) {
    const d = post.data
    const title = plainTitle(d.title)
    const date = new Date(d.publishDate).toISOString().slice(0, 10)
    const cat = (d.category || 'journal').toString()
    const png = renderCard({
      kind: 'post',
      title,
      description: d.excerpt || d.description || '',
      kicker: `Journal  ·  ${date}  ·  Gökhan Turhan`,
      footer: 'gokhanturhan.com/journal',
      meta: cat,
    })
    await writePng(join(OUT_ROOT, 'og', `${post.slug}.png`), png)
    made++
    console.log(`[og] ${post.slug}.png`)
  }

  // After an Astro build, fill every /og/pages/*.png referenced by HTML.
  if (existsSync(DIST) && !ONLY) {
    const seen = new Set()
    for await (const path of walkHtml(DIST)) {
      const html = await readFile(path, 'utf8')
      const url = meta(html, 'og:url') || meta(html, 'twitter:url')
      const image = meta(html, 'og:image') || meta(html, 'twitter:image')
      if (!image) continue
      let imagePath
      try {
        const abs = new URL(image, 'https://gokhanturhan.com')
        if (!['gokhanturhan.com', 'www.gokhanturhan.com', 'localhost'].includes(abs.hostname) && abs.protocol !== 'http:' && abs.protocol !== 'https:') continue
        // Localhost and the production host both count — path is what matters.
        if (abs.hostname && !['gokhanturhan.com', 'www.gokhanturhan.com', 'localhost'].includes(abs.hostname)) continue
        imagePath = decodeURIComponent(abs.pathname)
      } catch {
        continue
      }
      if (!imagePath.startsWith('/og/pages/') || !imagePath.endsWith('.png')) continue
      if (seen.has(imagePath)) continue
      seen.add(imagePath)

      const output = resolve(DIST, '.' + imagePath)
      if (!output.startsWith(DIST + '/') && output !== join(DIST, imagePath.replace(/^\//, ''))) {
        // Path traversal guard.
        const rel = relative(DIST, output)
        if (rel.startsWith('..')) throw new Error(`invalid card path ${imagePath}`)
      }

      const rawTitle = (meta(html, 'og:title') || '').replace(/\s*\|\s*Gökhan Turhan\s*$/u, '')
      const description = meta(html, 'og:description') || ''
      let route = '/'
      try {
        route = url ? new URL(url).pathname : '/' + relative(DIST, dirname(path)).split('\\').join('/') + '/'
      } catch {
        route = '/' + relative(DIST, dirname(path)).split('\\').join('/') + '/'
      }
      if (!route.endsWith('/')) route += '/'
      const section = sectionOf(route)
      const footerPath = route === '/' ? 'gokhanturhan.com' : `gokhanturhan.com${route}`.replace(/\/$/, '')
      await writePng(
        output,
        renderCard({
          kind: route === '/' ? 'home' : 'page',
          title: rawTitle || section,
          description,
          kicker: section,
          footer: footerPath,
          meta: section,
        }),
      )
      made++
    }
    console.log(`[og] ${seen.size} page cards from HTML`)
  }

  if (existsSync(DIST) && OUT_ROOT === DIST) {
    await stampAndRewrite(DIST)
  }

  console.log(`[og] ${made} cards written to ${relative(ROOT, OUT_ROOT)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

main().catch((e) => {
  console.error('[og] failed:', e)
  process.exit(1)
})
