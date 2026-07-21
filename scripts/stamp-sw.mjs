#!/usr/bin/env node
/**
 * Stamp the service worker's CACHE_VERSION with a content hash of the built
 * site, so every deploy gets fresh cache names. When the browser fetches the
 * updated /sw.js, its `activate` handler deletes the previous caches (their
 * names no longer match), and users get the new pages/media instead of stale
 * cached copies. The hash only changes when the build output changes, so no-op
 * rebuilds don't needlessly bust caches.
 *
 * Runs last in `npm run build`, after astro build + the CV PDF, so it hashes the
 * final dist. Rewrites dist/sw.js in place (public/sw.js keeps its 'v1' default
 * for dev).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const SW_PATH = join(DIST, 'sw.js')

const hash = createHash('sha256')

/** Fold every built file (path + bytes) into one hash — excluding sw.js itself,
 *  which we're about to rewrite (keeps the hash deterministic). */
function walk(dir) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) {
      walk(full)
    } else if (full !== SW_PATH) {
      hash.update(relative(DIST, full))
      hash.update(readFileSync(full))
    }
  }
}

walk(DIST)
const version = 'b' + hash.digest('hex').slice(0, 12)

let sw = readFileSync(SW_PATH, 'utf8')
const before = sw
sw = sw.replace(/const CACHE_VERSION = '[^']*';/, `const CACHE_VERSION = '${version}';`)

if (sw === before) {
  console.error('✗ stamp-sw: could not find CACHE_VERSION line in dist/sw.js')
  process.exit(1)
}

writeFileSync(SW_PATH, sw)
console.log(`✓ Stamped service worker CACHE_VERSION = ${version}`)
