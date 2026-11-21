import { getCollection, type CollectionEntry } from 'astro:content'
import { products, catalog, categoryOf, tools, apis, toolTags, apiTags, TAXONOMY, tagSlug, type Tool, type ApiEntry, type TagDef } from '@/data/estate'
import { humanizeKebab } from '@/lib/utils'
import { works, type Work } from '@/data/works'

export interface TagBucket {
  slug: string
  label: string
  def?: TagDef
  projects: { slug: string; name: string; line: string; href: string; tags: string[]; group: string }[]
  posts: CollectionEntry<'blog'>[]
  tools: Tool[]
  apis: ApiEntry[]
  works: Work[]
}

export const total = (b: TagBucket) => b.projects.length + b.posts.length + b.tools.length + b.apis.length + b.works.length

/** One index for every tag on the site: journal posts, projects and products, tools and APIs. */
export async function tagIndex(): Promise<Map<string, TagBucket>> {
  const map = new Map<string, TagBucket>()
  const bucket = (raw: string) => {
    const slug = tagSlug(raw)
    let b = map.get(slug)
    if (!b) {
      const def = TAXONOMY[slug]
      b = { slug, label: def?.label ?? humanizeKebab(raw), def, projects: [], posts: [], tools: [], apis: [], works: [] }
      map.set(slug, b)
    }
    return b
  }
  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
  for (const p of posts) for (const t of new Set((p.data.tags ?? []).map(tagSlug))) bucket(t).posts.push(p)
  // Every listed project and product, plus the child pages (docs, boards) under them.
  const listed = new Set(catalog.map((e) => e.slug))
  const entries = [
    ...catalog.map((e) => ({ slug: e.slug, name: e.name, line: e.line, href: e.href, tags: e.tags, group: categoryOf(e.slug)?.name ?? '' })),
    ...products.filter((p) => !listed.has(p.slug)).map((p) => ({ slug: p.slug, name: p.name, line: p.line, href: `/${p.slug}/`, tags: p.tags, group: categoryOf(p.slug.split('/')[0])?.name ?? p.family })),
  ]
  for (const e of entries) for (const t of new Set(e.tags.map(tagSlug))) bucket(t).projects.push(e)
  for (const t of tools) for (const g of toolTags[t.name] ?? []) bucket(g).tools.push(t)
  for (const w of works) for (const t of w.tags) bucket(t).works.push(w)
  for (const a of apis) for (const g of apiTags[a.slug] ?? []) bucket(g).apis.push(a)
  return map
}
