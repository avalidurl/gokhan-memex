/** Cloudflare Images. An image id is the site path without the leading slash. */
export const IMAGE_CDN = 'https://imagedelivery.net/6y1i3FNnwnl61Xv3wGE82g'

/**
 * Serve a local raster from Cloudflare Images.
 * External URLs and SVGs are returned unchanged.
 */
export function cdnImage(src: string, width = 1200): string {
  if (!src || /^https?:\/\//i.test(src) || /\.svg$/i.test(src) || !src.startsWith('/')) return src
  return `${IMAGE_CDN}/${src.slice(1)}/w=${width},format=auto`
}
