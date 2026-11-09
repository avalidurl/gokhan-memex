#!/usr/bin/env python3
"""Rewrite links to archived estate hosts to their pages on this site.

Run from the repo root: python3 scripts/rewrite-estate-links.py [--check]
Email addresses, newsletter endpoints, code blocks, CSS comments and the
frontmatter originalUrl field are left alone on purpose.
"""
import os, re, sys

SITE = 'https://gokhanturhan.com'
API = 'https://api.gokhanturhan.com'
BLOG = set(os.path.splitext(f)[0] for f in os.listdir('src/content/blog') if f.endswith(('.md', '.mdx')))
ASSETS = {
    'https://assets.numetal.xyz/deck/ishtar-deck-not-a-preseed.pdf': '/media/archive/ishtar/ishtar-deck-not-a-preseed.pdf',
    'https://curb.numetal.xyz/deck': '/media/archive/curb/curb-deck.pdf',
    'https://curb.numetal.xyz/assets/og-curb-launch.png': '/media/archive/curb/og-curb-launch.png',
    'https://numetal.xyz/og-tickerline.png': '/media/archive/numetal/og-tickerline.png',
    'https://gokhan.vc/og-x402-economy-2026-07.png': '/media/archive/gokhan-vc/og-x402-economy-2026-07.png',
    'https://gokhan.vc/og-the-model-that-dreams-itself.png': '/media/archive/gokhan-vc/og-the-model-that-dreams-itself.png',
    'https://ubu.numetal.xyz/hrl-1.1.txt': '/media/archive/ubu/hrl-1.1.txt',
}
for i, n in enumerate(['base-transfers-forecast', 'payment-size-distribution', 'vendor-revenue', 'facilitators', 'surprise-index', 'npm-funnel'], 1):
    ASSETS[f'https://gokhan.vc/x402-report/fig-0{i}-{n}.svg'] = f'/media/archive/gokhan-vc/fig-0{i}-{n}.svg'

HOST = r'(?:(?:[a-z0-9-]+\.)*numetal\.xyz|(?:[a-z0-9-]+\.)?gokhan\.vc|(?:www\.)?agentbounty\.dev)'
URL_RE = re.compile(r'https?://' + HOST + r'''[^\s"'()<>\]`]*''')
# Left as they are: the newsletter (kept running for unsubscribe), the retired x402-live panel.
KEEP = re.compile(r'^https?://(api\.gokhan\.vc/newsletter|gokhan\.vc/x402-live)')

def journal(slug, own):
    slug = slug.strip('/').split('/')[0]
    if slug in BLOG and slug != own:
        return f'/journal/{slug}/'
    return None

def target(url, own):
    bare = url.rstrip('.,;:*')
    tail = url[len(bare):]
    if KEEP.match(bare):
        return None
    if bare.rstrip('/') in ASSETS:
        return ASSETS[bare.rstrip('/')] + tail
    m = re.match(r'https?://([^/?#]+)(/[^?#]*)?', bare)
    host, path = m.group(1).lower(), (m.group(2) or '/')
    host = host[4:] if host.startswith('www.') else host
    p = path.rstrip('/')
    def J(prefix, fallback):
        if p.startswith(prefix + '/'):
            j = journal(p[len(prefix) + 1:], own)
            if j: return j
        return fallback
    if host == 'api.gokhan.vc':
        if p in ('/feed.xml', '/feed.json', '/feed'): return '/rss.xml' + tail
        return f'{API}/feedhub/' + tail
    if host == 'api.ishtar.numetal.xyz': return f'{API}/ishtar/' + tail
    if host == 'api.curb.numetal.xyz': return f'{API}/curb/' + tail
    if host in ('harness.curb.numetal.xyz', 'buyer.curb.numetal.xyz', 'seller.curb.numetal.xyz'): return '/curb/harness/' + tail
    if host == 'curb.numetal.xyz':
        if p in ('/mcp', '/skill.md', '/openapi.json') or p.startswith('/.well-known'): return f'{API}/curb/' + tail
        if p in ('/feed.xml', '/rss.xml'): return '/rss.xml' + tail
        if p == '/dispatch': return '/journal/' + tail
        return J('/dispatch', '/curb/') + tail
    if host == 'launch.numetal.xyz':
        if p in ('/mcp', '/skill.md', '/openapi.json') or p.startswith('/.well-known'): return f'{API}/launch/' + tail
        return '/launch/' + tail
    if host == 'ishtar.numetal.xyz':
        if p.startswith('/heartbench'): return '/ishtar/heartbench/' + tail
        if p.startswith('/window'): return '/ishtar/window/' + tail
        if p.startswith('/docs'): return '/ishtar/docs/' + tail
        if p == '/blog': return '/journal/' + tail
        return J('/blog', '/ishtar/') + tail
    if host == 'status.numetal.xyz': return '/numetal/status/' + tail
    if host == 'docs.rebase.numetal.xyz': return '/rebase/docs/' + tail
    if host == 'numetal.xyz':
        if p == '/blog': return '/journal/' + tail
        return J('/blog', '/numetal/') + tail
    if host == 'gokhan.vc':
        if p == '/blog': return '/journal/' + tail
        if p == '/llms.txt': return '/llms.txt' + tail
        return J('/blog', '/gokhan-vc/') + tail
    if host == 'agentbounty.dev':
        if p.startswith('/rss'): return '/rss.xml' + tail
        return '/agentbounty/' + tail
    if host.endswith('.numetal.xyz'):
        return '/' + host.split('.')[0] + '/' + tail
    return None

def absolute(t, mode):
    # Static HTML and machine-readable files need absolute URLs.
    return SITE + t if mode == 'abs' and t.startswith('/') else t

def rewrite_text(s, own, mode):
    def sub(m):
        t = target(m.group(0), own)
        return absolute(t, mode) if t else m.group(0)
    return URL_RE.sub(sub, s)

def process(path, mode):
    src = open(path, encoding='utf-8').read()
    own = os.path.splitext(os.path.basename(path))[0] if '/content/blog/' in path else None
    out, in_code, in_fm, fm_seen = [], False, False, 0
    for line in src.split('\n'):
        if line.strip() == '---' and fm_seen < 2 and path.endswith(('.md', '.mdx')):
            fm_seen += 1; in_fm = fm_seen == 1; out.append(line); continue
        if line.lstrip().startswith('```'):
            in_code = not in_code; out.append(line); continue
        if in_code or (in_fm and line.startswith('originalUrl:')):
            out.append(line); continue
        out.append(rewrite_text(line, own, mode))
    new = '\n'.join(out)
    if new != src:
        if '--check' not in sys.argv:
            open(path, 'w', encoding='utf-8').write(new)
        return True
    return False

TARGETS = []
for root, _, files in os.walk('src'):
    if root.startswith('src/legal'):
        continue  # archived legal copies stay as published
    for f in files:
        if f.endswith(('.astro', '.ts', '.js', '.md', '.mdx', '.json')):
            TARGETS.append(os.path.join(root, f))
SKIP = {'src/data/estate.ts', 'src/content/blog/archive-2026-11.md'}
changed = [p for p in sorted(TARGETS) if p not in SKIP and process(p, 'rel')]
changed += [p for p in ['public/index.html', 'public/llms.txt'] if process(p, 'abs' if p.endswith('.txt') else 'rel')]
print('\n'.join(changed))
