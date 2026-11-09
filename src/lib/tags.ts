import { getCollection, type CollectionEntry } from 'astro:content'
import { products, drafts, tools, apis, draftTags, toolTags, apiTags, TAXONOMY, tagSlug, type Product, type Draft, type Tool, type ApiEntry, type TagDef } from '@/data/estate'
import { humanizeKebab } from '@/lib/utils'
import { works, type Work } from '@/data/works'

export interface TagBucket {
  slug: string
  label: string
  def?: TagDef
  projects: Product[]
  posts: CollectionEntry<'blog'>[]
  drafts: Draft[]
  tools: Tool[]
  apis: ApiEntry[]
  works: Work[]
}

export const total = (b: TagBucket) => b.projects.length + b.posts.length + b.drafts.length + b.tools.length + b.apis.length + b.works.length

/** One index for every tag on the site: journal posts, products, drafts, tools and APIs. */
export async function tagIndex(): Promise<Map<string, TagBucket>> {
  const map = new Map<string, TagBucket>()
  const bucket = (raw: string) => {
    const slug = tagSlug(raw)
    let b = map.get(slug)
    if (!b) {
      const def = TAXONOMY[slug]
      b = { slug, label: def?.label ?? humanizeKebab(raw), def, projects: [], posts: [], drafts: [], tools: [], apis: [], works: [] }
      map.set(slug, b)
    }
    return b
  }
  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
  for (const p of posts) for (const t of new Set((p.data.tags ?? []).map(tagSlug))) bucket(t).posts.push(p)
  for (const p of products) for (const t of p.tags) bucket(t).projects.push(p)
  for (const d of drafts) for (const t of draftTags[d.slug] ?? []) bucket(t).drafts.push(d)
  for (const t of tools) for (const g of toolTags[t.name] ?? []) bucket(g).tools.push(t)
  for (const w of works) for (const t of w.tags) bucket(t).works.push(w)
  for (const a of apis) for (const g of apiTags[a.slug] ?? []) bucket(g).apis.push(a)
  return map
}
