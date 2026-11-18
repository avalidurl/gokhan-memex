import { verifyToken } from '../lib/list-token.js'

function page(title, body, status = 200) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#fff;color:#111;font:18px/1.45 Georgia,serif}main{max-width:36rem;margin:4rem auto;padding:0 1.25rem}a{color:#00e}label,input,button{font:16px/1.4 "Courier New",monospace}input[type=email]{display:block;width:100%;max-width:24rem;margin:.5rem 0 1rem;padding:.4rem}button{background:#fff;color:#111;border:1px solid #111;padding:.35rem .7rem;cursor:pointer}.hp{position:absolute;left:-9999px}</style><main><h1>${title}</h1>${body}<p><a href="/journal/">Back to the journal</a></p></main>`
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
}

const FORM = '<form method="post" action="/newsletter/unsubscribe"><p>Enter the address that receives the journal letters.</p><label>Email <input type="email" name="email" required autocomplete="email"></label><label class="hp">Company <input type="text" name="company" tabindex="-1" autocomplete="off"></label><button type="submit">Unsubscribe</button></form>'

const DONE = '<p>If that address was on the list, the letters stop.</p>'

async function unsubByToken(env, token) {
  if (!env.FEEDHUB || !env.UNSUB_SECRET) {
    return page('Not ready', '<p>This link could not be checked. Write to <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>.</p>')
  }
  const verified = await verifyToken(env.UNSUB_SECRET, env.FEEDHUB, token)
  if (!verified) return page('Link not valid', '<p>That unsubscribe link is not valid. Use the form on this page, or write to <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>.</p>' + FORM, 400)
  await env.FEEDHUB.prepare("UPDATE subscribers SET email_status='unsubscribed' WHERE id=?1").bind(verified.id).run()
  return page('Unsubscribed', '<p>That address will not get further journal letters.</p>')
}

export async function onRequestGet(context) {
  const token = new URL(context.request.url).searchParams.get('t') || ''
  if (token) return unsubByToken(context.env, token)
  return page('Unsubscribe', FORM)
}

export async function onRequestPost(context) {
  const { request, env } = context
  const token = new URL(request.url).searchParams.get('t') || ''
  if (token) return unsubByToken(env, token)
  if (!env.FEEDHUB) {
    return page('Not ready', '<p>The list could not be changed just now. Write to <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>.</p>')
  }
  const form = await request.formData()
  if ((form.get('company') || '').toString().trim()) return page('Unsubscribed', DONE)
  const email = (form.get('email') || '').toString().trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return page('Unsubscribe', '<p>A real email address is required.</p>' + FORM, 400)
  }
  await env.FEEDHUB.prepare("UPDATE subscribers SET email_status='unsubscribed' WHERE lower(email)=?1").bind(email).run()
  return page('Unsubscribed', DONE)
}
