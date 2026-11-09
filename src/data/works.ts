/** Every publishing work (e-books, academic, experimental) with its own page, for listings and tag pages. */
import { ebooks } from '@/data/ebooks'
import { academicPublications, experimentalWorks } from '@/data/publishing'

export type WorkKind = 'E-book' | 'Academic' | 'Experimental'
export interface Work { kind: WorkKind; slug: string; title: string; href: string; year: string; line: string; tags: string[]; cover?: string; external?: { label: string; href: string } }

export const academicSlug = (title: string) =>
  title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 8).join('-')

const ACADEMIC_TAGS: Record<string, string[]> = {
  'Book Chapter': ['academic', 'publishing', 'hyperstition', 'memes', 'social'],
  'MA Thesis': ['academic', 'publishing', 'electronic-literature', 'art'],
}
const EBOOK_TAGS: Record<string, string[]> = {
  'the-guy-with-compute': ['publishing', 'poetry', 'ai', 'book'],
  'gradient-descent-into-chaotic-happiness': ['publishing', 'poetry', 'ai', 'book'],
  'an-essay-concerning-the-inbox': ['publishing', 'poetry', 'book'],
}

export const works: Work[] = [
  ...ebooks.map((e) => ({
    kind: 'E-book' as const, slug: e.slug, title: e.title, href: `/publishing/ebooks/${e.slug}/`,
    year: e.publishedOn.slice(0, 4), line: e.subtitle, tags: EBOOK_TAGS[e.slug] ?? ['publishing', 'book'], cover: e.coverImage,
  })),
  ...academicPublications.map((a) => ({
    kind: 'Academic' as const, slug: academicSlug(a.title), title: a.title, href: `/publishing/academic/${academicSlug(a.title)}/`,
    year: a.year, line: `${a.type} · ${a.venue}`, tags: ACADEMIC_TAGS[a.type] ?? ['academic', 'publishing'],
    external: { label: a.linkLabel, href: a.href },
  })),
  ...experimentalWorks.map((w) => ({
    kind: 'Experimental' as const, slug: w.detailHref.split('/').filter(Boolean).pop()!, title: w.title, href: w.detailHref,
    year: w.year, line: `${w.creators}${w.commissionedByName ? ` · commissioned by ${w.commissionedByName}` : ''}`,
    tags: ['publishing', 'experimental', 'sound', 'poetry', 'art', 'nfts'], cover: w.coverImage,
    external: w.sourceHref ? { label: w.sourceLabel ?? 'Source', href: w.sourceHref } : undefined,
  })),
]
export const workByTitle = (t: string) => works.find((w) => w.title === t || t.includes(w.title))
