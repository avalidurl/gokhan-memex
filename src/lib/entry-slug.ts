import { slug as githubSlug } from 'github-slugger'

/** Public URL slug for a legacy content-collection entry.
 *
 * With collectionsBackwardsCompat, Astro 7 stores the source path, extension
 * included, on entry.id, and no longer sets entry.slug. This follows
 * getContentEntryIdAndSlug: drop one markdown extension, github-slugger each
 * path segment, then drop a trailing /index.
 */
export function entrySlug(entry: { id: string }): string {
  const withoutExt = entry.id.replace(/\.(md|mdx)$/i, '')
  return withoutExt
    .split('/')
    .map((segment) => githubSlug(segment))
    .join('/')
    .replace(/\/index$/, '')
}
