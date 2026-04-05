import type { APIRoute } from 'astro'
import { cvPlainText } from '@/data/cv'

export const GET: APIRoute = () => {
  return new Response(cvPlainText(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
