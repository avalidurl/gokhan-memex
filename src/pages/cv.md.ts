import type { APIRoute } from 'astro'
import { cvMarkdown } from '@/lib/cv-md'

export const GET: APIRoute = () =>
  new Response(cvMarkdown(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
