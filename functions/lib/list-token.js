const enc = new TextEncoder()

export function b64url(bytes) {
  let s = btoa(String.fromCharCode(...bytes))
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlToStr(s) {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'))
}

async function hmac(key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg))
  return b64url(new Uint8Array(sig))
}

export async function mintToken(secret, id, salt, channel) {
  const payload = b64url(enc.encode(JSON.stringify({ id, channel, iat: Date.now() })))
  const sig = await hmac(`${secret}:${salt}`, payload)
  return `${payload}.${sig}`
}

export async function verifyToken(secret, db, token) {
  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  let body
  try { body = JSON.parse(b64urlToStr(payload)) } catch { return null }
  if (!body?.id) return null
  const row = await db.prepare('SELECT unsub_token FROM subscribers WHERE id=?1').bind(body.id).first()
  if (!row?.unsub_token) return null
  const expect = await hmac(`${secret}:${row.unsub_token}`, payload)
  if (expect.length !== sig.length) return null
  let diff = 0
  for (let i = 0; i < expect.length; i++) diff |= expect.charCodeAt(i) ^ sig.charCodeAt(i)
  if (diff !== 0) return null
  return { id: body.id, channel: body.channel || 'email' }
}
