/** Cloudflare Images. An image id is the site path without the leading slash. */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const IMAGE_CDN = 'https://imagedelivery.net/6y1i3FNnwnl61Xv3wGE82g'

/** Zone Image Transformations, used for build-hashed /og/v/* cards. */
export const ORIGIN_TRANSFORM = '/cdn-cgi/image/format=auto,width=1200,fit=scale-down'

const SITE_HOST = /^(https?:\/\/)?(www\.)?gokhanturhan\.com/i
const ICON_OR_VECTOR = /(favicon|apple-touch-icon|\.ico($|\?)|\.svg($|\?))/i
const RASTER = /\.(png|jpe?g|webp|avif|gif)($|\?)/i

function pathFromSrc(src: string): string | null {
  if (!src) return null
  let path = src.trim()
  if (SITE_HOST.test(path)) {
    try {
      path = new URL(path).pathname
    } catch {
      return null
    }
  }
  if (path.startsWith('//')) return null
  if (!path.startsWith('/')) return null
  return path
}

let readyIds: Set<string> | null = null

function loadReadyIds(): Set<string> {
  if (readyIds) return readyIds
  readyIds = new Set()
  try {
    const file = resolve(process.cwd(), 'cf-images-manifest.json')
    if (!existsSync(file)) return readyIds
    const data = JSON.parse(readFileSync(file, 'utf8')) as { images?: Record<string, unknown> }
    for (const id of Object.keys(data.images || {})) readyIds.add(id)
  } catch {
    readyIds = new Set()
  }
  return readyIds
}

export function isCdnManaged(src: string): boolean {
  if (!src || ICON_OR_VECTOR.test(src)) return false
  if (/^https?:\/\//i.test(src) && !SITE_HOST.test(src)) return false
  if (src.includes('imagedelivery.net') || src.includes('/cdn-cgi/image/')) return false
  const path = pathFromSrc(src)
  if (!path || !RASTER.test(path)) return false
  if (path === '/og-default.png' || path.startsWith('/og/')) return false
  return loadReadyIds().has(path.slice(1))
}

/**
 * Serve a local raster from Cloudflare Images.
 * External URLs, SVGs, and favicons are returned unchanged.
 */
export function cdnImage(src: string, width = 1200): string {
  if (!isCdnManaged(src)) return src
  const path = pathFromSrc(src)
  if (!path) return src
  return `${IMAGE_CDN}/${path.slice(1)}/w=${width},format=auto`
}

export function cdnSrcset(src: string, widths: number[] = [400, 800, 1200]): string | undefined {
  if (!isCdnManaged(src)) return undefined
  const path = pathFromSrc(src)
  if (!path) return undefined
  const id = path.slice(1)
  return widths.map((w) => `${IMAGE_CDN}/${id}/w=${w},format=auto ${w}w`).join(', ')
}

/**
 * Build-generated social cards (/og/..., /og-default.png) change hash every
 * deploy, so they stay on the zone and go through Image Transformations.
 * Other same-origin rasters use Cloudflare Images.
 */
export function socialImage(src: string, site?: string | URL): string {
  if (!src) return src
  if (src.includes('imagedelivery.net') || src.includes('/cdn-cgi/image/')) {
    if (site && src.startsWith('/')) return new URL(src, site).toString()
    return src
  }
  if (!isCdnManaged(src)) {
    if (site && src.startsWith('/')) return new URL(src, site).toString()
    return src
  }
  const path = pathFromSrc(src)!
  // Build-hashed /og/v/* cards are wrapped by scripts/gen-og.mjs after the
  // hash is known. Wrapping here would hide the original path from that script.
  if (path === '/og-default.png' || path.startsWith('/og/')) {
    if (site) return new URL(path, site).toString()
    return path
  }
  const next = cdnImage(path, 1200)
  if (site) return new URL(next, site).toString()
  return next
}
