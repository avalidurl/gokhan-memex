import type { APIRoute } from 'astro'
import { cvStructuredJson } from '@/data/cv'

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://gokhanturhan.com')
  const body = JSON.stringify(cvStructuredJson(base), null, 2)
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
