import type { APIRoute } from 'astro'
import { cvRawHtmlDocument } from '@/data/cv'

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://gokhanturhan.com')
  const html = cvRawHtmlDocument(base)
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
