import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { ebooks } from '@/data/ebooks'

type SearchDocument = {
  title: string
  link: string
  description: string
  excerpt: string
  date: string
  tags: string[]
  category: string
  content: string
}

const stripMarkdown = (value: string) =>
  value
    .replace(/^import\s.+$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog'))
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf())

  const documents: SearchDocument[] = posts.map(post => ({
    title: post.data.title,
    link: `/journal/${post.slug}/`,
    description: post.data.description,
    excerpt: post.data.excerpt ?? '',
    date: post.data.publishDate.toISOString(),
    tags: post.data.tags ?? [],
    category: post.data.category,
    content: stripMarkdown(post.body ?? '')
  }))

  const staticDocuments: SearchDocument[] = [
    {
      title: 'Publishing',
      link: '/publishing/',
      description: 'Digital editions, browser-readable texts, and downloadable books by Gökhan Turhan.',
      excerpt: 'Publishing section for digital editions and e-books.',
      date: new Date('2026-04-04').toISOString(),
      tags: ['publishing', 'ebooks', 'books'],
      category: 'Publishing',
      content: 'Publishing, e-books, digital editions, EPUB downloads, browser reading, Cloudflare Pages.'
    },
    {
      title: 'E-books',
      link: '/publishing/ebooks/',
      description: 'Downloadable EPUBs and browser-readable digital books.',
      excerpt: 'E-books index with downloadable and browser-readable editions.',
      date: new Date('2026-04-04').toISOString(),
      tags: ['publishing', 'ebooks', 'epub'],
      category: 'Publishing',
      content: 'E-books, EPUB, browser edition, static HTML, Cloudflare Pages.'
    },
    ...ebooks.map((ebook) => ({
      title: ebook.title,
      link: `/publishing/ebooks/${ebook.slug}/`,
      description: ebook.description,
      excerpt: ebook.blurb,
      date: new Date(ebook.publishedOn).toISOString(),
      tags: ['publishing', 'ebook', ...ebook.protocols],
      category: 'Publishing',
      content: `${ebook.title} ${ebook.subtitle} ${ebook.blurb} ${ebook.protocols.join(' ')}`
    })),
  ]

  return new Response(JSON.stringify([...staticDocuments, ...documents]), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  })
}
