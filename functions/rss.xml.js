/**
 * GET /rss.xml stays the journal subscription URL.
 * The static file is the journal only. This function adds the latest
 * version of each Blyg post. Blyg links and guids stay on
 * blyg.gokhanturhan.com. If Blyg does not answer, the journal file
 * is returned unchanged.
 */

const BLYG_FEED = 'https://blyg.gokhanturhan.com/feed.xml'

function tagText(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? m[1].trim() : ''
}

function itemsOf(xml) {
  return xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/g) || []
}

function pubTime(item) {
  const raw = tagText(item, 'pubDate')
  const t = Date.parse(raw)
  return Number.isNaN(t) ? 0 : t
}

function blygIdentity(item) {
  const guid = tagText(item, 'guid')
  const versioned = guid.match(/^blyg:([^:]+):v(\d+)$/)
  if (versioned) return { id: versioned[1], version: Number(versioned[2]) }
  const link = tagText(item, 'link')
  const fromLink = link.match(/\/t\/([^/]+)\/?$/)
  if (fromLink) return { id: fromLink[1], version: 0 }
  return null
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function latestBlygItems(blygXml) {
  const chosen = new Map()
  for (const item of itemsOf(blygXml)) {
    const identity = blygIdentity(item)
    if (!identity) continue
    const prev = chosen.get(identity.id)
    if (!prev || identity.version > prev.version || (identity.version === prev.version && pubTime(item) > pubTime(prev.item))) {
      chosen.set(identity.id, { version: identity.version, item })
    }
  }
  const out = []
  for (const { item } of chosen.values()) {
    const link = tagText(item, 'link')
    if (!link.startsWith('https://blyg.gokhanturhan.com/')) continue
    const title = tagText(item, 'title')
    const pubDate = tagText(item, 'pubDate')
    const descMatch = item.match(/<description\b[^>]*>[\s\S]*?<\/description>/)
    const description = descMatch ? descMatch[0] : '<description></description>'
    out.push(
      `<item><title>${escapeXml(title)}</title><link>${escapeXml(link)}</link>` +
      `<guid isPermaLink="true">${escapeXml(link)}</guid>` +
      `<pubDate>${escapeXml(pubDate)}</pubDate><category>Blyg</category>${description}</item>`
    )
  }
  return out
}

export function mergeRss(journalXml, blygXml) {
  if (!journalXml.includes('<channel>') || !journalXml.includes('</channel>')) {
    return { xml: journalXml, added: 0 }
  }
  const blygItems = latestBlygItems(blygXml)
  if (blygItems.length === 0) return { xml: journalXml, added: 0 }
  const journalItems = itemsOf(journalXml)
  const combined = [...journalItems, ...blygItems].sort((a, b) => pubTime(b) - pubTime(a))
  const withoutItems = journalXml.replace(/<item\b[^>]*>[\s\S]*?<\/item>/g, '')
  let xml = withoutItems.replace('</channel>', `${combined.join('')}</channel>`)
  xml = xml.replace(
    '<description>The journal of Gökhan Turhan: essays and notes',
    '<description>The journal of Gökhan Turhan, including posts from the Blyg. Blyg links stay on blyg.gokhanturhan.com. Essays and notes',
  )
  return { xml, added: blygItems.length }
}

function rssResponse(xml, added, method) {
  const headers = new Headers()
  headers.set('content-type', 'application/rss+xml; charset=utf-8')
  const cache = added > 0 ? 'public, max-age=300' : 'public, max-age=60'
  headers.set('cache-control', cache)
  headers.set('cdn-cache-control', cache)
  if (method === 'HEAD') return new Response(null, { status: 200, headers })
  return new Response(xml, { status: 200, headers })
}

export async function onRequest(context) {
  const method = context.request.method
  if (method !== 'GET' && method !== 'HEAD') return context.next()
  const journalRes = await context.env.ASSETS.fetch(new URL('/rss.xml', context.request.url))
  if (!journalRes.ok) return journalRes
  const journalXml = await journalRes.text()
  if (!journalXml.includes('<rss')) return new Response(journalXml, { status: journalRes.status, headers: journalRes.headers })
  try {
    const blygRes = await fetch(BLYG_FEED, {
      headers: { accept: 'application/rss+xml, application/xml, text/xml', 'user-agent': 'gokhanturhan-rss' },
      signal: AbortSignal.timeout(4000),
    })
    if (!blygRes.ok) return rssResponse(journalXml, 0, method)
    const merged = mergeRss(journalXml, await blygRes.text())
    return rssResponse(merged.xml, merged.added, method)
  } catch {
    return rssResponse(journalXml, 0, method)
  }
}
