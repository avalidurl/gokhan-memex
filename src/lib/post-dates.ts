import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const POSTS_DIR = join(ROOT, 'src/content/blog')

const gitCache = new Map<string, Date | null>()
const DATES_FILE = join(ROOT, 'src/generated/source-dates.json')
let dateMap: Record<string, string> | null = null
let shallowCache: boolean | null = null

/** A Pages checkout has one commit, and git then dates every file to that commit. */
function historyIsShallow(): boolean {
  if (shallowCache !== null) return shallowCache
  try {
    const out = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    shallowCache = out === 'true'
  } catch {
    shallowCache = true
  }
  return shallowCache
}

/** Commit dates recorded in the repo. Pages clones are shallow, so git log
 *  cannot see an older commit, and a fresh checkout's mtime is the build time. */
function committedSourceDate(filePath: string): Date | null {
  if (!dateMap) {
    try {
      dateMap = JSON.parse(readFileSync(DATES_FILE, 'utf8')) as Record<string, string>
    } catch {
      dateMap = {}
    }
  }
  const rel = relative(ROOT, filePath).split('\\').join('/')
  const iso = dateMap ? dateMap[rel] : undefined
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

function trackedInHead(filePath: string): boolean {
  const rel = relative(ROOT, filePath).split('\\').join('/')
  try {
    execFileSync('git', ['cat-file', '-e', `HEAD:${rel}`], {
      cwd: ROOT,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

export function dayStamp(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function gitCommitDate(filePath: string): Date | null {
  const key = filePath
  if (gitCache.has(key)) return gitCache.get(key) ?? null
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: ROOT,
    }).trim()
    if (!out) {
      gitCache.set(key, null)
      return null
    }
    const d = new Date(out)
    if (Number.isNaN(d.getTime())) {
      gitCache.set(key, null)
      return null
    }
    gitCache.set(key, d)
    return d
  } catch {
    gitCache.set(key, null)
    return null
  }
}

/** dateModified = updatedDate ?? last git commit ?? publishDate */
export function modifiedDate(opts: {
  updatedDate?: Date
  publishDate: Date
  filePath?: string
}): Date {
  if (opts.updatedDate) return opts.updatedDate
  if (opts.filePath) {
    const git = gitCommitDate(opts.filePath)
    if (git) return git
  }
  return opts.publishDate
}

export function datesDiffer(a: Date, b: Date): boolean {
  return dayStamp(a) !== dayStamp(b)
}

/** REV stamp for the masthead. The date is the last commit of the page's own source. */
export function pageRevLabel(pathname: string): string {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`
  const rel = path.replace(/^\/+|\/+$/g, '')
  const candidates: string[] = []
  if (!rel) candidates.push(join(ROOT, 'src/pages/index.astro'))
  else {
    candidates.push(join(ROOT, 'src/pages', rel, 'index.astro'))
    candidates.push(join(ROOT, 'src/pages', `${rel}.astro`))
    if (rel.startsWith('journal/')) {
      const id = rel.slice('journal/'.length)
      if (id && !id.includes('/')) candidates.push(journalFilePath(id))
    }
    candidates.push(join(ROOT, 'src/archive', rel, 'index.html'))
  }
  candidates.push(join(ROOT, 'src/layouts/BaseLayout.astro'))
  for (const file of candidates) {
    if (!existsSync(file)) continue
    if (!historyIsShallow()) {
      const git = gitCommitDate(file)
      if (git) return `REV ${dayStamp(git)}`
    }
    const recorded = committedSourceDate(file)
    if (recorded) return `REV ${dayStamp(recorded)}`
    if (historyIsShallow()) {
      const tip = gitCommitDate(file)
      if (tip) return `REV ${dayStamp(tip)}`
    }
    // A tracked file with no date yet is missing from this clone's history.
    // Its checkout mtime is the build clock, so keep looking.
    if (trackedInHead(file)) continue
    try {
      return `REV ${dayStamp(statSync(file).mtime)}`
    } catch {
      /* try the next candidate */
    }
  }
  return 'REV 2026-07-17'
}

export function journalFilePath(id: string): string {
  const direct = join(POSTS_DIR, id)
  if (existsSync(direct)) return direct
  for (const ext of ['.mdx', '.md']) {
    const p = join(POSTS_DIR, id.endsWith(ext) ? id : `${id}${ext}`)
    if (existsSync(p)) return p
  }
  return direct
}

/** Map of canonical journal URLs to lastmod dates, for the sitemap. */
export function journalLastmodByUrl(): Record<string, Date> {
  const out: Record<string, Date> = {}
  if (!existsSync(POSTS_DIR)) return out
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  for (const file of files) {
    const path = join(POSTS_DIR, file)
    const raw = readFileSync(path, 'utf8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) continue
    const fm = m[1]
    if (/^draft:\s*true\s*$/m.test(fm)) continue
    const pub = fm.match(/^publishDate:\s*['"]?(.+?)['"]?\s*$/m)
    if (!pub) continue
    const publishDate = new Date(pub[1].trim())
    if (Number.isNaN(publishDate.getTime())) continue
    const upd = fm.match(/^updatedDate:\s*['"]?(.+?)['"]?\s*$/m)
    const updatedDate = upd ? new Date(upd[1].trim()) : undefined
    const slug = file.replace(/\.mdx?$/, '')
    const mod = modifiedDate({
      updatedDate: updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate : undefined,
      publishDate,
      filePath: path,
    })
    out[`https://gokhanturhan.com/journal/${slug}/`] = mod
  }
  return out
}
