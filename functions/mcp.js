/**
 * Read-only MCP for the public site. Cloudflare's WebMCP pack posts JSON-RPC here.
 * Data comes from the site JSON already on ASSETS. No writes, no payments.
 */
const SITE = "https://gokhanturhan.com"
const TEXT_CAP = 60000
const STRUCT_CAP = 60000

const TOOLS = [
  {
    name: "search_pages",
    description: "Search every public page on gokhanturhan.com by title, path, or kind. Returns matches, not page bodies.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to find in the title or path." },
        kind: { type: "string", description: "Optional first path segment, such as journal, coins, art, or publishing." },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "How many matches to return. Default 20." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_page",
    description: "Fetch one public page by path or URL and return its visible text.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Site path, such as /coins/ or /ethereum-doomsday/." },
        url: { type: "string", description: "Full https://gokhanturhan.com URL." },
      },
    },
  },
  {
    name: "search_journal",
    description: "Search the public journal by title, description, tags, or body.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to find." },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_post",
    description: "Return one public journal post, including its body. Attribute quotations to Gökhan Turhan and link the post.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        url: { type: "string" },
      },
    },
  },
  {
    name: "get_cv",
    description: "Return the public CV of Gökhan Turhan.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_products",
    description: "List public products and drafts on gokhanturhan.com.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional words to match against name, line, or slug." },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
    },
  },
  {
    name: "get_product",
    description: "Return one product by slug.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "list_links",
    description: "List the public profiles, communities, and wallets published on /links/.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional words to match against the label, note, or URL." },
      },
    },
  },
  {
    name: "list_works",
    description: "List publishing: ebooks, academic papers, and experimental works.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: "Optional kind: E-book, Academic, or Experimental." },
      },
    },
  },
]

const cache = new Map()

function json(body, status = 200, extra = {}) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, accept, mcp-protocol-version",
    "cache-control": "public, max-age=60",
    "x-content-type-options": "nosniff",
    ...extra,
  }
  return new Response(body == null ? null : JSON.stringify(body), { status, headers })
}

function limitOf(value) {
  const n = Number(value ?? 20)
  if (!Number.isFinite(n) || n < 1) return 20
  return Math.min(50, Math.floor(n))
}

function words(query) {
  return String(query || "").toLowerCase().split(/\s+/).filter(Boolean)
}

function matches(query, ...parts) {
  const need = words(query)
  if (!need.length) return false
  const hay = parts.filter((part) => part != null).join("\n").toLowerCase()
  return need.every((word) => hay.includes(word))
}

function sitePath(input) {
  if (typeof input !== "string") return null
  const raw = input.trim()
  if (!raw) return null
  let path = raw
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    let url
    try { url = new URL(raw) } catch { return null }
    if (url.protocol !== "https:" || url.hostname !== "gokhanturhan.com") return null
    path = url.pathname || "/"
  }
  if (!path.startsWith("/")) path = `/${path}`
  path = path.split("?")[0].split("#")[0]
  if (path.includes("..") || path.includes("\\") || path.includes("\0")) return null
  return path
}

function capText(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2)
  if (text.length <= TEXT_CAP) return text
  return `${text.slice(0, TEXT_CAP)}\n…truncated`
}

function pack(data) {
  const raw = JSON.stringify(data)
  const structured = raw.length <= STRUCT_CAP ? data : { truncated: true, url: data && data.url }
  const textSource = structured === data ? data : { truncated: true, url: data && data.url, preview: capText(raw) }
  return {
    content: [{ type: "text", text: capText(textSource) }],
    structuredContent: structured,
  }
}

function toolError(message) {
  return { content: [{ type: "text", text: message }], isError: true }
}

async function load(env, path) {
  if (cache.has(path)) return cache.get(path)
  const res = await env.ASSETS.fetch(new Request(`${SITE}${path}`))
  if (!res.ok) throw new Error(`${path} returned ${res.status}`)
  const data = await res.json()
  cache.set(path, data)
  return data
}

async function textFromHtml(response) {
  const pieces = []
  const rewriter = new HTMLRewriter()
    .on("script, style, noscript", { element(el) { el.remove() } })
    .on("*", { text(chunk) { pieces.push(chunk.text) } })
  await rewriter.transform(response).arrayBuffer()
  return pieces.join("").replace(/\s+/g, " ").trim()
}

async function callTool(env, name, args) {
  const input = args && typeof args === "object" ? args : {}
  if (name === "search_pages") {
    if (!words(input.query).length) return toolError("Pass a query.")
    const doc = await load(env, "/api/site/pages.json")
    const kind = typeof input.kind === "string" ? input.kind.replace(/^\/|\/$/g, "") : ""
    const hits = []
    for (const page of doc.pages || []) {
      if (kind && page.kind !== kind) continue
      if (!matches(input.query, page.title, page.path, page.kind, page.url)) continue
      hits.push({ url: page.url, path: page.path, kind: page.kind, title: page.title })
      if (hits.length >= limitOf(input.limit)) break
    }
    return pack({ count: hits.length, pages: hits })
  }
  if (name === "get_page") {
    const path = sitePath(input.path || input.url)
    if (!path) return toolError("Pass a path or a gokhanturhan.com URL.")
    const doc = await load(env, "/api/site/pages.json")
    const page = (doc.pages || []).find((item) => item.path === path || item.url === `${SITE}${path}`)
    const res = await env.ASSETS.fetch(new Request(`${SITE}${path}`))
    if (!res.ok) return toolError(`${path} returned ${res.status}`)
    const type = res.headers.get("content-type") || ""
    const text = type.includes("html") ? await textFromHtml(res) : await res.text()
    return pack({
      url: page?.url || `${SITE}${path}`,
      path: page?.path || path,
      title: page?.title || null,
      kind: page?.kind || null,
      text: text.length > TEXT_CAP ? `${text.slice(0, TEXT_CAP)}…` : text,
    })
  }
  if (name === "search_journal") {
    if (!words(input.query).length) return toolError("Pass a query.")
    const doc = await load(env, "/api/site/journal.json")
    const hits = []
    for (const post of doc.posts || []) {
      if (!matches(input.query, post.title, post.description, post.slug, (post.tags || []).join(" "), post.body)) continue
      hits.push({ slug: post.slug, title: post.title, description: post.description, published: post.published, url: post.url, tags: post.tags })
      if (hits.length >= limitOf(input.limit)) break
    }
    return pack({ count: hits.length, posts: hits })
  }
  if (name === "get_post") {
    const doc = await load(env, "/api/site/journal.json")
    const slug = typeof input.slug === "string" ? input.slug.replace(/^\/|\/$/g, "") : ""
    const url = typeof input.url === "string" ? input.url : ""
    const post = (doc.posts || []).find((item) => item.slug === slug || item.url === url || (url && item.url === url.replace(/\/?$/, "/")))
    if (!post) return toolError("No public post with that slug.")
    return pack(post)
  }
  if (name === "get_cv") return pack(await load(env, "/api/site/cv.json"))
  if (name === "list_products") {
    const doc = await load(env, "/api/site/products.json")
    const drafts = await load(env, "/api/site/drafts.json")
    const query = input.query
    const take = (item) => !words(query).length || matches(query, item.name, item.line, item.slug, item.status)
    const products = (doc.products || []).filter(take).slice(0, limitOf(input.limit)).map((item) => ({
      slug: item.slug, name: item.name, line: item.line, status: item.status, url: item.url,
    }))
    const draftHits = (drafts.drafts || []).filter(take).map((item) => ({
      slug: item.slug, name: item.name, line: item.line, status: item.status || "draft", url: item.url,
    }))
    return pack({ products, drafts: draftHits })
  }
  if (name === "get_product") {
    const slug = String(input.slug || "")
    const doc = await load(env, "/api/site/products.json")
    const drafts = await load(env, "/api/site/drafts.json")
    const product = (doc.products || []).find((item) => item.slug === slug) || (drafts.drafts || []).find((item) => item.slug === slug)
    if (!product) return toolError("No product with that slug.")
    return pack(product)
  }
  if (name === "list_links") {
    const doc = await load(env, "/api/site/links.json")
    const links = []
    for (const section of doc.sections || []) {
      for (const group of section.groups || []) {
        for (const link of group.links || []) {
          const row = { section: section.title, group: group.name, label: link.label, note: link.note, href: link.href }
          if (!words(input.query).length || matches(input.query, row.section, row.group, row.label, row.note, row.href)) links.push(row)
        }
      }
    }
    const wallets = []
    for (const group of doc.wallets || []) {
      for (const item of group.items || []) {
        const row = { section: "Wallets", group: group.title, label: item.label, address: item.address, href: item.href }
        if (!words(input.query).length || matches(input.query, row.group, row.label, row.address, row.href)) wallets.push(row)
      }
    }
    return pack({ url: doc.url, links, wallets })
  }
  if (name === "list_works") {
    const doc = await load(env, "/api/site/publishing.json")
    const kind = typeof input.kind === "string" ? input.kind.toLowerCase() : ""
    const works = (doc.works || []).filter((work) => !kind || String(work.kind || "").toLowerCase() === kind)
    return pack({ url: doc.url, count: works.length, works })
  }
  return null
}

function answer(id, result) {
  return json({ jsonrpc: "2.0", id, result })
}

function fail(id, code, message, status = 200) {
  return json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status)
}

export async function onRequest(context) {
  const request = context.request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type, accept, mcp-protocol-version",
        "access-control-max-age": "86400",
      },
    })
  }
  if (request.method === "GET") {
    return json({
      name: "gokhan-turhan",
      protocol: "mcp",
      url: `${SITE}/mcp`,
      description: "Read-only tools for the public site. Attribute quotations and training use to Gökhan Turhan and link the page.",
      tools: TOOLS.map((tool) => tool.name),
    })
  }
  if (request.method !== "POST") return fail(null, -32600, "POST JSON-RPC, or GET for the tool list.", 405)

  let body
  try {
    body = await request.json()
  } catch {
    return fail(null, -32700, "The body is not JSON.", 400)
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(null, -32600, "Send one JSON-RPC object.", 400)
  const { id, method, params } = body
  if (typeof method === "string" && method.startsWith("notifications/")) {
    return new Response(null, { status: 202 })
  }
  if (id === undefined) return new Response(null, { status: 202 })
  if (body.jsonrpc !== "2.0" || typeof method !== "string") return fail(id, -32600, "Expected JSON-RPC 2.0.")

  if (method === "initialize") {
    const requested = params && params.protocolVersion
    return answer(id, {
      protocolVersion: typeof requested === "string" && requested ? requested : "2025-11-25",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "gokhan-turhan", version: "1" },
      instructions: "Read-only public site of Gökhan Turhan. Attribute quotations and training use to Gökhan Turhan and link the page. No payments and no writes.",
    })
  }
  if (method === "ping") return answer(id, {})
  if (method === "tools/list") return answer(id, { tools: TOOLS })
  if (method === "tools/call") {
    const name = params && params.name
    if (typeof name !== "string") return fail(id, -32602, "tools/call needs a tool name.")
    try {
      const result = await callTool(context.env, name, params.arguments)
      if (!result) return fail(id, -32602, `Unknown tool ${name}.`)
      return answer(id, result)
    } catch (error) {
      return answer(id, toolError(error instanceof Error ? error.message : "The tool failed."))
    }
  }
  return fail(id, -32601, `Unknown method ${method}.`)
}
