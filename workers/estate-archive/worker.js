/**
 * Archive page for the retired apex/www of numetal.xyz, gokhan.vc
 * and agentbounty.dev.
 *
 * Routes: numetal.xyz/*, www.numetal.xyz/*, gokhan.vc/*, www.gokhan.vc/*,
 * agentbounty.dev/*, www.agentbounty.dev/*
 *
 * Exact roots serve a 10-second archive page. Every other path that is not
 * an excluded API path 301s to the gokhanturhan.com copy. Mapped page
 * paths never reach this worker: they are handled first by the
 * old_estate_moved Bulk Redirect list.
 *
 * API paths (/api, /health, /fees/data, etc.) on numetal.xyz are passed
 * through to the numetal-site Worker via a service binding so the Pages
 * Functions on gokhanturhan.com can still reach the original backends
 * where Bulk Redirects already leave those paths alone.
 */

const HOME = 'https://gokhanturhan.com/'
const ARCHIVE_HOSTS = new Set([
  'numetal.xyz',
  'www.numetal.xyz',
  'gokhan.vc',
  'www.gokhan.vc',
  'agentbounty.dev',
  'www.agentbounty.dev',
])
const API_PREFIXES = [
  '/api',
  '/v1/',
  '/mcp',
  '/.well-known/',
  '/health',
  '/admin',
  '/x402-live',
  '/cdn-cgi/',
  '/vault',
  '/fees/data',
  '/fees/events',
  '/join',
]

function escapeHost(host) {
  return String(host).replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function html(host) {
  const h = escapeHost(host)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Archived — now at gokhanturhan.com</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="This website has been archived. Everything now lives at gokhanturhan.com.">
<link rel="canonical" href="${HOME}">
<meta http-equiv="refresh" content="10;url=${HOME}">
<style>
  html { color-scheme: light dark; }
  body {
    margin: 0;
    background: #fafafa;
    color: #111;
    font: 16px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  }
  main { max-width: 40rem; margin: 18vh auto; padding: 0 1.5rem 4rem; }
  h1 { font-size: 1.15rem; font-weight: 700; margin: 0 0 1.25rem; }
  p { margin: 0 0 1rem; }
  a { color: #00e; }
  @media (prefers-color-scheme: dark) {
    body { background: #111; color: #eee; }
    a { color: #8eb0ff; }
  }
</style>
</head>
<body>
<main>
<h1>This website has been archived.</h1>
<p>${h} is no longer served here. Everything now lives at <a href="${HOME}">gokhanturhan.com</a>.</p>
<p>Redirecting in <span id="t">10</span> seconds.</p>
<p><a href="${HOME}">Go there now</a>.</p>
</main>
<script>
(function () {
  var n = 10;
  var el = document.getElementById('t');
  var id = setInterval(function () {
    n -= 1;
    if (el) el.textContent = String(n);
    if (n <= 0) {
      clearInterval(id);
      location.href = 'https://gokhanturhan.com/';
    }
  }, 1000);
})();
</script>
</body>
</html>`
}

function isExactRoot(url) {
  const path = url.pathname
  return ARCHIVE_HOSTS.has(url.hostname.toLowerCase()) && (path === '/' || path === '')
}

function isApi(url, method) {
  if (!['GET', 'HEAD'].includes(method)) return true
  const p = url.pathname
  return API_PREFIXES.some((x) => p === x || p.startsWith(x.endsWith('/') ? x : x + '/'))
}

function fallbackTarget(url) {
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const prefix = host === 'gokhan.vc' ? '/gokhan-vc' : host === 'agentbounty.dev' ? '/agentbounty' : '/numetal'
  let path = url.pathname || '/'
  if (path.length > 1 && !path.endsWith('/') && !/\.[a-zA-Z0-9]{1,8}$/.test(path)) {
    path += '/'
  }
  return HOME.replace(/\/$/, '') + prefix + path + url.search
}

const HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (isExactRoot(url)) {
      return new Response(html(url.hostname.toLowerCase()), { status: 200, headers: HEADERS })
    }
    if (isApi(url, request.method) && env && env.NUMETAL_SITE) {
      const host = url.hostname.toLowerCase().replace(/^www\./, '')
      if (host === 'numetal.xyz') return env.NUMETAL_SITE.fetch(request)
    }
    return Response.redirect(fallbackTarget(url), 301)
  },
}
