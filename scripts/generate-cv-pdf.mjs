#!/usr/bin/env node
/**
 * Regenerate the downloadable CV PDF from the freshly built /cv/ page.
 * Runs as part of `npm run build`, so the PDF can never lag src/data/cv.ts:
 * every deploy re-prints it from the same DOM the site serves.
 * Output: public/cv/Gokhan_Turhan_CV.pdf (repo copy) + dist/cv/… (deployed copy).
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { copyFile, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const OUT_PDF = join(ROOT, 'public/cv/Gokhan_Turhan_CV.pdf')
const DIST_PDF = join(DIST, 'cv/Gokhan_Turhan_CV.pdf')

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
  'chromium-browser',
].filter(Boolean)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

function findChrome() {
  for (const bin of CHROME_CANDIDATES) {
    if (bin.includes('/') && existsSync(bin)) return bin
  }
  return CHROME_CANDIDATES.find((b) => !b.includes('/')) ?? null
}

function serveDist() {
  return createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(req.url?.split('?')[0] ?? '/')
      if (path.endsWith('/')) path += 'index.html'
      const file = normalize(join(DIST, path.replace(/^\//, '')))
      if (!file.startsWith(DIST)) {
        res.writeHead(403)
        res.end('forbidden')
        return
      }
      await stat(file)
      const body = await readFile(file)
      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      })
      res.end(body)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  })
}

function runChrome(chrome, url, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=15000',
      `--print-to-pdf=${outPath}`,
      '--print-to-pdf-no-header',
      url,
    ]
    const proc = spawn(chrome, args, { stdio: 'inherit' })
    proc.on('error', reject)
    proc.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`Chrome exited ${code}`))
    )
  })
}

async function main() {
  const chrome = findChrome()
  if (!chrome) {
    console.error('✘ Chrome/Chromium not found. Set CHROME_PATH or install Google Chrome.')
    process.exit(1)
  }
  if (!existsSync(join(DIST, 'cv/index.html'))) {
    console.error('✘ dist/cv/index.html missing — run astro build first.')
    process.exit(1)
  }

  const server = serveDist()
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const { port } = server.address()
  const url = `http://127.0.0.1:${port}/cv/`

  console.log(`→ Printing CV via ${chrome}`)
  await runChrome(chrome, url, OUT_PDF)
  server.close()

  await copyFile(OUT_PDF, DIST_PDF)
  const { size } = await stat(OUT_PDF)
  console.log(`✓ CV PDF regenerated: ${OUT_PDF} (${Math.round(size / 1024)} KB) + dist copy`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
