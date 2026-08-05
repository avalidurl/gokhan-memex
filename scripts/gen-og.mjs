#!/usr/bin/env node
/**
 * Journal OG cards — real 1200×630 PNGs, house "filed document" register.
 *
 * Replaces the old `src/pages/og/[...slug].png.js` route, which wrote SVG
 * source bytes into a file named `.png`. Cloudflare Pages then served those
 * bytes as `content-type: image/png`, so every card was invalid: X, LinkedIn,
 * Slack, Facebook and iMessage all reject SVG for link previews.
 *
 * Renders one HTML per post and screenshots it with headless Chrome at 2×,
 * then normalises to exactly 1200×630 with sips (supersample → crisp text).
 *
 * Usage:
 *   node scripts/gen-og.mjs              # generate only missing cards
 *   node scripts/gen-og.mjs --force      # regenerate everything
 *   node scripts/gen-og.mjs --only=slug  # one post (implies --force)
 *
 * Runs as a build pre-step. If Chrome is absent it warns and exits 0 so a
 * build never breaks on a missing local browser.
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

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const args = process.argv.slice(2)
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice('--only='.length)
const FORCE = args.includes('--force') || Boolean(ONLY)

// House tokens — src/styles/critical.css, light theme.
const INK = '#0a0a0a'
const PAPER = '#f4f4f2'
const DIM = '#5c5c5c'
const FAINT = '#d8d8d4'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Mirrors plainPostTitle() in src/lib/utils.ts — strikethrough is decorative.
const plainTitle = (t) => String(t ?? '').replace(/~~([^~]+)~~/g, '$1')

async function fontFace(file, weightRange = '100 800') {
  const b64 = (await readFile(join(FONT_DIR, file))).toString('base64')
  return `@font-face{font-family:'JetBrains Mono Variable';font-style:normal;font-weight:${weightRange};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2-variations')}`
}

function template({ fonts, docId, category, date, title, description, tags }) {
  // Title size steps down as the headline grows, so long titles still fit the
  // plate without clipping. Measured against the 1040px content column.
  const n = title.length
  const titleSize = n <= 28 ? 76 : n <= 46 ? 62 : n <= 70 ? 52 : n <= 100 ? 44 : 38
  const tagLine = tags.slice(0, 4).join(' · ')
  return `<!doctype html><meta charset="utf-8"><style>
${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{
  background:${PAPER};color:${INK};
  font-family:'JetBrains Mono Variable',ui-monospace,SFMono-Regular,Menlo,monospace;
  -webkit-font-smoothing:antialiased;
  position:relative;overflow:hidden;
}
/* Faint ruled ground — the filed-document register, not decoration. */
.grid{position:absolute;inset:0;
  background-image:linear-gradient(${FAINT} 1px,transparent 1px),linear-gradient(90deg,${FAINT} 1px,transparent 1px);
  background-size:40px 40px;opacity:.5}
.plate{position:absolute;inset:56px;border:2px solid ${INK};
  display:flex;flex-direction:column;padding:34px 44px 30px}
.strip{display:flex;justify-content:space-between;align-items:baseline;
  font-size:19px;font-weight:600;letter-spacing:.09em;text-transform:uppercase}
.strip .pub{color:${DIM};font-weight:500}
.rule{height:2px;background:${INK};margin:22px 0 0}
.body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:6px 0}
h1{font-size:${titleSize}px;font-weight:700;line-height:1.1;letter-spacing:-.02em;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
p{margin-top:24px;font-size:23px;line-height:1.45;font-weight:400;color:${DIM};
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hair{height:1px;background:${FAINT}}
.foot{display:flex;justify-content:space-between;align-items:baseline;padding-top:20px;
  font-size:18px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.foot .tags{color:${DIM};font-weight:500;letter-spacing:.05em;
  max-width:620px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.tick{display:inline-block;width:13px;height:13px;background:${INK};margin-right:12px;
  transform:translateY(-1px)}
</style>
<div class="grid"></div>
<div class="plate">
  <div class="strip">
    <span><span class="tick"></span>DOC · ${esc(docId)} · ${esc(category)}</span>
    <span class="pub">Published · ${esc(date)}</span>
  </div>
  <div class="rule"></div>
  <div class="body">
    <h1>${esc(title)}</h1>
    ${description ? `<p>${esc(description)}</p>` : ''}
  </div>
  <div class="hair"></div>
  <div class="foot">
    <span>gokhanturhan.com / journal</span>
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
    // Astro derives the slug from the filename.
    const slug = file.replace(/\.mdx?$/, '')
    posts.push({ slug, data })
  }
  // Doc numbers must match src/pages/journal/[...slug].astro exactly:
  // published posts ordered by publishDate ascending, slug as tiebreak.
  const ordered = [...posts].sort((a, b) => {
    const d = new Date(a.data.publishDate) - new Date(b.data.publishDate)
    return d !== 0 ? d : a.slug.localeCompare(b.slug)
  })
  const docNumber = new Map(ordered.map((p, i) => [p.slug, i + 1]))
  for (const p of posts) p.docNumber = docNumber.get(p.slug)
  return posts
}

async function render(html, out) {
  const tmp = join(TMP_DIR, `og-${Math.random().toString(36).slice(2)}.html`)
  await writeFile(tmp, html)
  try {
    await execFileP(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=2',
      '--window-size=1200,630',
      '--virtual-time-budget=6000',
      `--screenshot=${out}`,
      `file://${tmp}`,
    ])
    // 2× supersample → normalise to exactly 1200×630.
    await execFileP('sips', ['-z', '630', '1200', out], { encoding: 'buffer' })
  } finally {
    await rm(tmp, { force: true })
  }
}

async function main() {
  if (!existsSync(CHROME)) {
    console.warn(`[og] Chrome not found at ${CHROME} — skipping OG generation.`)
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
    await render(html, out)
    made++
    console.log(`[og] ${post.slug}.png`)
  }
  console.log(`[og] ${made} rendered, ${skipped} already present (${posts.length} published posts).`)
}

main().catch((e) => {
  console.error('[og] failed:', e)
  process.exit(1)
})
