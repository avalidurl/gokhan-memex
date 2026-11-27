import { b64url, mintToken } from '../lib/list-token.js'

function page(title, body) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#fff;color:#111;font:16px/1.45 system-ui,sans-serif}main{max-width:36rem;margin:4rem auto;padding:0 1.25rem}a{color:inherit}</style><main><h1>${title}</h1>${body}<p><a href="/journal/">Back to the journal</a></p></main>`
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
}

async function sendConfirm(env, email, link) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Journal by Gökhan Turhan <contact@gokhan.vc>',
      to: [email],
      subject: 'Confirm your subscription',
      html: `<p>Confirm you want letters from the journal at gokhanturhan.com.</p><p><a href="${link}">Confirm subscription</a></p><p>If this was not you, ignore this email.</p>`,
      text: `Confirm your subscription: ${link}`,
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}`)
}


// Rate limits stand in for a captcha: per address (below, one pending confirmation a day), per visitor and overall.
// Counts live in the list's own D1 database. Visitor addresses are stored only as a salted hash.
const LIMITS = [
  { scope: 'ip', per: 60 * 60 * 1000, max: 3 },
  { scope: 'ip', per: 24 * 60 * 60 * 1000, max: 6 },
  { scope: 'all', per: 60 * 60 * 1000, max: 30 },
  { scope: 'all', per: 24 * 60 * 60 * 1000, max: 150 },
]

async function allowed(env, request) {
  const db = env.FEEDHUB
  const now = Date.now()
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.UNSUB_SECRET}:rl:${ip}`))
  const who = Array.from(new Uint8Array(digest)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
  await db.prepare('CREATE TABLE IF NOT EXISTS signup_hits (who TEXT NOT NULL, at INTEGER NOT NULL)').run()
  await db.prepare('DELETE FROM signup_hits WHERE at < ?1').bind(now - 24 * 60 * 60 * 1000).run()
  for (const l of LIMITS) {
    const row = l.scope === 'ip'
      ? await db.prepare('SELECT COUNT(*) AS n FROM signup_hits WHERE who = ?1 AND at > ?2').bind(who, now - l.per).first()
      : await db.prepare('SELECT COUNT(*) AS n FROM signup_hits WHERE at > ?1').bind(now - l.per).first()
    if ((row?.n || 0) >= l.max) return false
  }
  await db.prepare('INSERT INTO signup_hits (who, at) VALUES (?1, ?2)').bind(who, now).run()
  return true
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.FEEDHUB || !env.RESEND_API_KEY || !env.UNSUB_SECRET) {
    return page('Not ready', '<p>The list could not take an address just now. Write to <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>.</p>')
  }
  const form = await request.formData()
  if ((form.get('company') || '').toString().trim()) return page('Check your inbox', '<p>If the address can receive mail, a confirmation is on its way.</p>')
  const email = (form.get('email') || '').toString().trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('A real email address is required.', { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  }
  const db = env.FEEDHUB
  if (!(await allowed(env, request).catch(() => true))) {
    return new Response('Too many sign-ups from here. Try again later.', { status: 429, headers: { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '3600' } })
  }
  const existing = await db.prepare('SELECT id, email_status, unsub_token, created_at FROM subscribers WHERE email=?1').bind(email).first()
  if (existing?.email_status === 'active') {
    return page('You are on the list', '<p>That address already gets the journal letters.</p>')
  }
  const day = 24 * 60 * 60 * 1000
  if (existing?.email_status === 'pending' && existing.created_at && Date.now() - Number(existing.created_at) < day) {
    return page('Check your inbox', '<p>A confirmation was already sent to that address. It is waiting to be opened.</p>')
  }
  const id = existing?.id || crypto.randomUUID().replace(/-/g, '')
  const salt = existing?.unsub_token || b64url(crypto.getRandomValues(new Uint8Array(16)))
  if (!existing) {
    await db.prepare(
      `INSERT INTO subscribers (id,email,wallet,email_status,xmtp_status,unsub_token,source,created_at)
       VALUES (?1,?2,NULL,'pending','unreachable',?3,'form:memex',?4)`,
    ).bind(id, email, salt, Date.now()).run()
  }
  const token = await mintToken(env.UNSUB_SECRET, id, salt, 'email')
  const link = `https://gokhanturhan.com/newsletter/confirm?t=${encodeURIComponent(token)}`
  await sendConfirm(env, email, link)
  return page('Check your inbox', '<p>A confirmation is on its way. Open it and the address is on the list.</p>')
}

export async function onRequestGet() {
  return Response.redirect('https://gokhanturhan.com/journal/#subscribe', 302)
}
