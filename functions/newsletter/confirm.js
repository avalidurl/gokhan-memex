import { verifyToken } from '../lib/list-token.js'

const SEGMENT = 'faa1e144-89b7-49a7-9f5c-e51d99534401'

function page(title, body) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#fff;color:#111;font:16px/1.45 system-ui,sans-serif}main{max-width:36rem;margin:4rem auto;padding:0 1.25rem}a{color:inherit}</style><main><h1>${title}</h1>${body}<p><a href="/journal/">Back to the journal</a></p></main>`
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.FEEDHUB || !env.UNSUB_SECRET) return page('Not ready', '<p>This link could not be checked. Write to <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>.</p>')
  const token = new URL(request.url).searchParams.get('t') || ''
  const verified = await verifyToken(env.UNSUB_SECRET, env.FEEDHUB, token)
  if (!verified) return page('Link not valid', '<p>That confirmation link is not valid. Use the form on the <a href="/journal/#subscribe">journal</a> again.</p>')
  await env.FEEDHUB.prepare("UPDATE subscribers SET email_status='active', confirmed_at=?2 WHERE id=?1").bind(verified.id, Date.now()).run()
  const row = await env.FEEDHUB.prepare('SELECT email FROM subscribers WHERE id=?1').bind(verified.id).first()
  if (row?.email && env.RESEND_API_KEY) {
    await fetch(`https://api.resend.com/audiences/${SEGMENT}/contacts`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ email: row.email, unsubscribed: false }),
    }).catch(() => {})
  }
  return page('You are subscribed', '<p>The address is on the journal list. You can close this tab.</p>')
}
