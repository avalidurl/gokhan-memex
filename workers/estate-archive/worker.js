/**
 * Archive page for the retired apex/www roots of numetal.xyz and gokhan.vc.
 *
 * Routes should be the exact roots only:
 *   numetal.xyz/, www.numetal.xyz/, gokhan.vc/, www.gokhan.vc/
 *
 * Every other path on those hosts is handled by the existing Bulk Redirect
 * list (old_estate_moved) or by a zone Redirect Rule that falls back to
 * /numetal/ or /gokhan-vc/. This worker must not be bound to /* or it
 * would steal API traffic from the original Workers (numetal-site, etc.).
 *
 * If this worker does receive a non-root path (mis-routed), it 301s to the
 * matching gokhanturhan.com copy and never serves the archive page.
 */

const HOME = 'https://gokhanturhan.com/'
const ARCHIVE_HOSTS = new Set([
  'numetal.xyz',
  'www.numetal.xyz',
  'gokhan.vc',
  'www.gokhan.vc',
])

const HTML = (host) => `<!DOCTYPE html>
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
<p>${escapeHost(host)} is no longer served here. Everything now lives at <a href="${HOME}">gokhanturhan.com</a>.</p>
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
</html>
`

function escapeHost(host) {
  return String(host).replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function isExactRoot(url) {
  const path = url.pathname
  return ARCHIVE_HOSTS.has(url.hostname.toLowerCase()) && (path === '/' || path === '')
}

function fallbackTarget(url) {
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const prefix = host === 'gokhan.vc' ? '/gokhan-vc' : '/numetal'
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
  async fetch(request) {
    const url = new URL(request.url)
    if (isExactRoot(url)) {
      return new Response(HTML(url.hostname.toLowerCase()), { status: 200, headers: HEADERS })
    }
    return Response.redirect(fallbackTarget(url), 301)
  },
}
