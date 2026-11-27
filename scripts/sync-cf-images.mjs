#!/usr/bin/env node
/**
 * Upload new or changed public rasters to Cloudflare Images and keep
 * cf-images-manifest.json in sync. The site build rewrites only IDs whose
 * local content hash still matches this manifest.
 *
 * Auth (first match): CLOUDFLARE_IMAGES_API_TOKEN or CLOUDFLARE_API_TOKEN.
 * Optional: CLOUDFLARE_ACCOUNT_ID, CF_IMAGES_SYNC_URL (Images-binding Worker).
 * Upload failures are logged and the build continues with the local file.
 * Secret values are never printed.
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

const ROOT = process.cwd()
const PUBLIC_DIR = resolve(ROOT, 'public')
const MANIFEST_PATH = resolve(ROOT, 'cf-images-manifest.json')
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'f67860843758c41ea966d6658df62ca8'
const API_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`
const DEFAULT_SYNC_URL = 'https://gokhan-memex-images-sync.gokhanturhan.workers.dev'
const RASTER = /\.(png|jpe?g|webp|avif|gif)$/i
const ICON = /(favicon|apple-touch-icon|^avatar-icon-)/i
const SKIP_PREFIXES = ['ethereum-doomsday/', 'media/archive/', 'og/']
const SEED_ONLY = process.argv.includes('--seed')

function token() {
  return process.env.CLOUDFLARE_IMAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || ''
}

function syncUrl() {
  return process.env.CF_IMAGES_SYNC_URL || DEFAULT_SYNC_URL
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex')
}

function isAnimatedWebp(buf) {
  if (buf.length < 16 || buf.subarray(0, 4).toString() !== 'RIFF' || buf.subarray(8, 12).toString() !== 'WEBP') {
    return false
  }
  let i = 12
  while (i + 8 <= buf.length) {
    const chunk = buf.subarray(i, i + 4).toString()
    const size = buf.readUInt32LE(i + 4)
    if (chunk === 'ANIM' || chunk === 'ANMF') return true
    if (chunk === 'VP8X' && i + 8 < buf.length) return Boolean(buf[i + 8] & 0x02)
    i += 8 + size + (size & 1)
    if (i > buf.length) break
  }
  return false
}

function shouldSkip(id) {
  const name = basename(id)
  if (ICON.test(name) || ICON.test(id)) return true
  if (id === 'og-default.png' || SKIP_PREFIXES.some((p) => id.startsWith(p))) return true
  if (!RASTER.test(id)) return true
  return false
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (RASTER.test(entry)) out.push(full)
  }
  return out
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return { version: 1, images: {} }
  try {
    const data = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
    return { version: 1, images: data.images && typeof data.images === 'object' ? data.images : {} }
  } catch {
    console.warn('sync-cf-images: could not parse manifest, starting empty')
    return { version: 1, images: {} }
  }
}

function writeManifest(manifest) {
  const images = Object.fromEntries(
    Object.entries(manifest.images).sort(([a], [b]) => a.localeCompare(b)),
  )
  writeFileSync(MANIFEST_PATH, `${JSON.stringify({ version: 1, images }, null, 2)}\n`)
}

function apiId(id) {
  return encodeURIComponent(id)
}

async function api(method, path, { body, headers } = {}) {
  const t = token()
  if (!t) throw new Error('no token')
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${t}`, ...headers },
    body,
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { ok: res.ok, status: res.status, json, message: json?.errors?.[0]?.message || res.statusText }
}

async function imageExists(id) {
  const res = await api('GET', `/${apiId(id)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(res.message || `GET failed (${res.status})`)
  return res.json?.result || null
}

async function deleteImage(id) {
  const res = await api('DELETE', `/${apiId(id)}`)
  if (res.status === 404) return
  if (!res.ok) throw new Error(res.message || `DELETE failed (${res.status})`)
}

async function uploadViaApi(id, bytes, hash) {
  const form = new FormData()
  form.append('id', id)
  form.append('file', new Blob([bytes]), basename(id))
  form.append('metadata', JSON.stringify({ sha256: hash, source: 'gokhan-memex' }))
  const existing = await imageExists(id)
  if (existing) {
    const existingHash = existing.meta?.sha256
    if (existingHash === hash) return { skipped: true }
    await deleteImage(id)
  }
  const res = await api('POST', '', { body: form })
  if (!res.ok) throw new Error(res.message || `POST failed (${res.status})`)
  return { skipped: false }
}

async function uploadViaWorker(id, hash) {
  const sha = process.env.CF_PAGES_COMMIT_SHA || ''
  if (!sha) throw new Error('no commit sha for worker upload')
  const url = syncUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, sha256: hash, sha }),
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `worker failed (${res.status})`)
  }
  return { skipped: Boolean(json.skipped) }
}

async function upload(id, bytes, hash) {
  if (token()) return uploadViaApi(id, bytes, hash)
  return uploadViaWorker(id, hash)
}

function canUpload() {
  return Boolean(token() || (syncUrl() && process.env.CF_PAGES_COMMIT_SHA))
}

async function main() {
  const manifest = loadManifest()
  const next = { version: 1, images: {} }
  const files = walk(PUBLIC_DIR)
    .map((full) => ({ full, id: relative(PUBLIC_DIR, full).replaceAll('\\', '/') }))
    .filter((f) => !shouldSkip(f.id))
    .sort((a, b) => a.id.localeCompare(b.id))

  let uploaded = 0
  let skipped = 0
  let failed = 0
  let unchanged = 0
  let leftLocal = 0

  for (const { full, id } of files) {
    const bytes = readFileSync(full)
    const hash = sha256(bytes)
    const prev = manifest.images[id]
    if (prev?.sha256 === hash) {
      next.images[id] = prev
      unchanged++
      continue
    }
    if (SEED_ONLY) {
      // Record hashes for images already stored in Cloudflare Images,
      // including animated WebPs that were uploaded earlier.
      next.images[id] = { sha256: hash, uploaded: prev?.uploaded || new Date().toISOString() }
      unchanged++
      continue
    }
    if (isAnimatedWebp(bytes) && !prev) {
      console.warn(`sync-cf-images: skip animated WebP ${id}`)
      leftLocal++
      continue
    }
    if (!canUpload()) {
      console.warn(`sync-cf-images: no credentials, leave ${id} on the local file`)
      leftLocal++
      continue
    }
    try {
      const result = await upload(id, bytes, hash)
      next.images[id] = { sha256: hash, uploaded: new Date().toISOString() }
      if (result.skipped) {
        skipped++
        console.log(`sync-cf-images: already stored ${id}`)
      } else {
        uploaded++
        console.log(`sync-cf-images: uploaded ${id}`)
      }
    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : 'upload failed'
      console.warn(`sync-cf-images: ${id}: ${message}; falling back to the local file`)
    }
  }

  writeManifest(next)
  console.log(
    `sync-cf-images: ready ${Object.keys(next.images).length}, unchanged ${unchanged}, uploaded ${uploaded}, already-stored ${skipped}, failed ${failed}, local ${leftLocal}`,
  )
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : 'sync failed'
  console.warn(`sync-cf-images: ${message}; continuing with the current manifest`)
  process.exit(0)
})
