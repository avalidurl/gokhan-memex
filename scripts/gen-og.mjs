#!/usr/bin/env node
/**
 * Journal OG cards — real 1200×630 PNGs, warm cream & International Klein Blue editorial register.
 *
 * Usage:
 *   node scripts/gen-og.mjs              # generate only missing cards
 *   node scripts/gen-og.mjs --force      # regenerate everything
 *   node scripts/gen-og.mjs --only=slug  # one post (implies --force)
 */
import { execFile } from 'node:child_process'
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import yaml from 'js-yaml'

const execFileP = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const POSTS_DIR = join(ROOT, 'src/content/blog')
const OUT_DIR = join(ROOT, 'public/og')
const TMP_DIR = join(ROOT, 'tmp/og')
const FONT_DIR = join(ROOT, 'node_modules/@fontsource-variable/jetbrains-mono/files')

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

function findChrome() {
  for (const c of CHROME_CANDIDATES) {
    if (existsSync(c)) return c
  }
  return null
}

const args = process.argv.slice(2)
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice('--only='.length)
const FORCE = args.includes('--force') || Boolean(ONLY)

// Warm editorial tokens matching Turkish Art Blob
const INK = '#2a1a1e'
const PAPER = '#fbf6f3'
const CARD = '#ffffff'
const DIM = '#5d5a66'
const LINE = '#dfe2ec'
const SOFT = '#eef1fa'
const ACC = '#002FA7'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const plainTitle = (t) => String(t ?? '').replace(/~~([^~]+)~~/g, '$1')

async function fontFace(file, weightRange = '100 800') {
  const b64 = (await readFile(join(FONT_DIR, file))).toString('base64')
  return `@font-face{font-family:'JetBrains Mono Variable';font-style:normal;font-weight:${weightRange};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2-variations')}`
}

function template({ fonts, docId, category, date, title, description, tags }) {
  const n = title.length
  const titleSize = n <= 28 ? 72 : n <= 46 ? 58 : n <= 70 ? 48 : n <= 100 ? 42 : 36
  const tagLine = tags.slice(0, 4).join(' · ')
  return `<!doctype html><meta charset="utf-8"><style>
${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{
  background:${PAPER};color:${INK};
  font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Inter,Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
  position:relative;overflow:hidden;
}
.plate{position:absolute;inset:44px;border:1.5px solid ${LINE};border-left:8px solid ${ACC};border-radius:28px;background:${CARD};
  display:flex;flex-direction:column;padding:38px 48px 34px}
.strip{display:flex;justify-content:space-between;align-items:center;
  font-size:17px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${ACC}}
.strip .pill{background:${SOFT};border:1px solid ${LINE};border-radius:999px;padding:6px 16px}
.strip .pub{color:${DIM};font-weight:500;font-size:16px}
.body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:10px 0}
h1{font-family:Georgia,"Iowan Old Style","Palatino Linotype",serif;font-size:${titleSize}px;font-weight:700;line-height:1.12;letter-spacing:-.015em;color:${INK};
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
p{margin-top:20px;font-size:22px;line-height:1.48;font-weight:400;color:${DIM};
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hair{height:1px;background:${LINE}}
.foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:18px;
  font-size:17px;font-weight:600;color:${INK}}
.foot .domain span{color:${ACC}}
.foot .tags{color:${DIM};font-weight:500;font-size:15px;
  max-width:620px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
</style>
<div class="plate">
  <div class="strip">
    <span class="pill">${esc(docId)} · ${esc(category)}</span>
    <span class="pub">${esc(date)}</span>
  </div>
  <div class="body">
    <h1>${esc(title)}</h1>
    ${description ? `<p>${esc(description)}</p>` : ''}
  </div>
  <div class="hair"></div>
  <div class="foot">
    <span class="domain">Gökhan <span>Turhan</span> · gokhanturhan.com/journal</span>
    <span class="tags">${esc(tagLine)}</span>
  </div>
</div>`
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

async function render(chrome, html, out) {
  const tmp = join(TMP_DIR, `og-${Math.random().toString(36).slice(2)}.html`)
  await writeFile(tmp, html)
  try {
    await execFileP(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=6000',
      `--screenshot=${out}`,
      `file://${tmp}`,
    ])
    if (existsSync('/usr/bin/sips')) {
      await execFileP('sips', ['-z', '630', '1200', out], { encoding: 'buffer' })
    }
  } finally {
    await rm(tmp, { force: true })
  }
}

async function main() {
  const chrome = findChrome()
  if (!chrome) {
    console.warn(`[og] Chrome not found — skipping OG generation.`)
    console.warn('[og] Set CHROME_PATH to render cards locally.')
    return
  }
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(TMP_DIR, { recursive: true })

  const fonts = [
    await fontFace('jetbrains-mono-latin-wght-normal.woff2'),
    await fontFace('jetbrains-mono-latin-ext-wght-normal.woff2'),
  ].join('\n')

  let posts = await loadPosts()
  if (ONLY) {
    posts = posts.filter((p) => p.slug === ONLY)
    if (!posts.length) throw new Error(`no published post with slug "${ONLY}"`)
  }

  let made = 0
  let skipped = 0
  for (const post of posts) {
    const out = join(OUT_DIR, `${post.slug}.png`)
    if (!FORCE && existsSync(out)) {
      skipped++
      continue
    }
    const d = post.data
    const html = template({
      fonts,
      docId: `JOURNAL-${String(post.docNumber).padStart(3, '0')}`,
      category: d.category || 'journal',
      date: new Date(d.publishDate).toISOString().slice(0, 10),
      title: plainTitle(d.title),
      description: d.excerpt || d.description || '',
      tags: Array.isArray(d.tags) ? d.tags : [],
    })
    await render(chrome, html, out)
    made++
    console.log(`[og] ${post.slug}.png`)
  }
  console.log(`[og] ${made} rendered, ${skipped} already present (${posts.length} published posts).`)
}

main().catch((e) => {
  console.error('[og] failed:', e)
  process.exit(1)
})
