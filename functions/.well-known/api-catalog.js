const HEADERS = {
  "content-type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  "link": '</.well-known/api-catalog>; rel="api-catalog"',
  "cache-control": "public, max-age=300",
  "x-content-type-options": "nosniff",
}

export async function onRequest(context) {
  const assetUrl = new URL("/.well-known/api-catalog", context.request.url)
  const asset = await context.env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }))
  if (context.request.method === "HEAD") {
    return new Response(null, { status: asset.ok ? 200 : asset.status, headers: HEADERS })
  }
  if (context.request.method !== "GET") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } })
  }
  return new Response(asset.body, { status: asset.status, headers: HEADERS })
}
