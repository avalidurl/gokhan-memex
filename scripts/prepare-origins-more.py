#!/usr/bin/env python3
"""Phase 2: remaining original designs. Does not wipe origins/ — only adds
and overlays. Safe to re-run."""
from __future__ import annotations

import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path

# Reuse helpers by loading the sibling module without running main().
REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "scripts"))

# Import after path setup — load source, strip main, exec
src = (REPO / "scripts" / "prepare-origins.py").read_text()
src = src.replace('if __name__ == "__main__":\n    sys.exit(main())', "")
# Don't let a leftover main() get called
ns: dict = {"__name__": "prepare_origins_helpers", "__file__": str(REPO / "scripts" / "prepare-origins.py")}
exec(compile(src, "prepare-origins.py", "exec"), ns)

# Pull helpers
RAW = ns["RAW"]
REPOS = ns["REPOS"]
OUT = ns["OUT"]
SITE = ns["SITE"]
REPO = ns["REPO"]
process_html = ns["process_html"]
process_text = ns["process_text"]
write = ns["write"]
copy_file = ns["copy_file"]
download = ns["download"]
relink_media = ns["relink_media"]
MAILBOX = ns["MAILBOX"]
bar = ns["bar"]
BAR_CSS = ns["BAR_CSS"]
rewrite_root = ns["rewrite_root"]

# Extend SKIP so already-prefixed paths stay intact. ATTR_RE was compiled
# at import from the original SKIP_PREFIX — rebuild it.
EXTRA_SKIP = (
    "gokhan-vc", "coins", "jesus", "llmcraft", "llmlivesmatter",
    "onbots", "tape-exchange", "clankdog", "ai-ipo", "belief-systems",
    "foreguild-fao-plan", "hypersitition", "lectotype",
    "turkish-art-blob", "ethereum-doomsday",
)
ns["SKIP_PREFIX"] = tuple(ns["SKIP_PREFIX"]) + EXTRA_SKIP
ns["ATTR_RE"] = ns["skip_re"]()
# Rebind rewrite_root's closure — it uses module-level ATTR_RE
# The original rewrite_root references ATTR_RE at call time via global in ns.
# After we updated ns["ATTR_RE"], we need the function to see it.
# rewrite_root uses ATTR_RE as a global of its defining module. We exec'd
# into ns, so rewrite_root.__globals__ is ns. Updating ns["ATTR_RE"] is enough.


def add_chrome(html: str, *, prefix: str, name: str, canonical: str) -> str:
    """Add Bureau bar + canonical + mailbox rewrite. No path prefixing
    (use this on trees already built with the right base)."""
    html = MAILBOX.sub("contact@gokhan.vc", html)
    html = re.sub(
        r'<a[^>]*href="[^"]*cdn-cgi/l/email-protection[^"]*"[^>]*>.*?</a>',
        '<a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>',
        html,
        flags=re.I | re.S,
    )
    html = re.sub(r"<script[^>]*email-decode[^>]*>\s*</script>", "", html, flags=re.I)
    html = process_html(html, prefix=prefix, name=name, canonical=canonical)
    return html


def ingest_tree(src_root: Path, dest_root: Path, prefix: str, name: str, *,
                skip_names=None, skip_suffixes=None, already_prefixed: bool = False,
                rewrite_abs=None):
    skip_names = set(skip_names or {".gitignore", ".nojekyll", "README.md", "LICENSE", "LICENSE.md"})
    skip_suffixes = set(skip_suffixes or {".py", ".ts", ".tsx", ".mjs", ".cjs", ".sh"})
    skip_parts = {".git", "node_modules", "__pycache__"}
    for src in src_root.rglob("*"):
        if not src.is_file():
            continue
        if any(p in skip_parts for p in src.parts):
            continue
        if src.name in skip_names or src.name.startswith("."):
            continue
        if src.suffix.lower() in skip_suffixes:
            continue
        rel = src.relative_to(src_root)
        dest = dest_root / rel
        if src.suffix.lower() in {".html", ".htm", ".css", ".js", ".xml", ".txt", ".svg", ".md", ".json"}:
            try:
                text = src.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                copy_file(src, dest)
                continue
            if rewrite_abs:
                for a, b in rewrite_abs.items():
                    text = text.replace(a, b)
            if src.suffix.lower() in {".html", ".htm"}:
                sub = _canonical_sub(rel)
                text = (add_chrome if already_prefixed else process_html)(
                    text, prefix=prefix, name=name, canonical=f"{SITE}{prefix}{sub}"
                )
            elif already_prefixed:
                text = MAILBOX.sub("contact@gokhan.vc", text)
            else:
                text = process_text(text, prefix)
            write(dest, text)
        else:
            copy_file(src, dest)


def _canonical_sub(rel: Path) -> str:
    if rel.name == "index.html":
        parent = rel.parent
        if str(parent) in {".", ""}:
            return "/"
        return "/" + str(parent).replace("\\", "/") + "/"
    stem = str(rel.with_suffix("")).replace("\\", "/")
    return "/" + stem + "/"


def prepare_gokhan_vc():
    """Original Gökhan Ventures (gokhan.vc) — Nov 9 captures + live CSS,
    plus blog posts rebuilt from the atelier repo."""
    prefix, name = "/gokhan-vc", "Gökhan Ventures"
    dest = OUT / "gokhan-vc"
    pages = {
        "index.html": (RAW / "sub_gokhan.vc.html", "/"),
        "blog/index.html": (RAW / "pg_gokhan_vc_blog.html", "/blog/"),
        "newsletter/index.html": (RAW / "pg_gokhan_vc_newsletter.html", "/newsletter/"),
        "projects/index.html": (RAW / "pg_gokhan_vc_projects.html", "/projects/"),
    }
    for rel, (src, sub) in pages.items():
        html = src.read_text(encoding="utf-8", errors="replace")
        html = html.replace("https://gokhan.vc", f"{SITE}/gokhan-vc")
        html = html.replace("https://www.gokhan.vc", f"{SITE}/gokhan-vc")
        html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}{prefix}{sub}")
        write(dest / rel, html)

    # Live CSS / favicons / JS still 200 on gokhan.vc
    assets = [
        "_astro/BaseLayout.D_DJRpgG.css",
        "_astro/index.BdCuEp3O.css",
        "favicon.svg",
        "favicon-32.png",
        "apple-touch-icon.png",
        "projects-filter.js",
        "feed.xml",
        "llms.txt",
        "robots.txt",
    ]
    for a in assets:
        dest_a = dest / a
        # atelier public may have favicons
        pub = REPOS / "atelier-gokhan-website/public" / Path(a).name
        built = Path("/tmp/builds/atelier-gokhan-website/dist") / a
        if a.endswith(".css") or a.endswith(".js") or a.endswith(".xml") or a.endswith(".txt"):
            if download(f"https://gokhan.vc/{a}", dest_a):
                if dest_a.suffix in {".css", ".js", ".xml", ".txt", ".svg"}:
                    write(dest_a, process_text(dest_a.read_text(encoding="utf-8", errors="replace"), prefix))
                continue
        if pub.exists():
            copy_file(pub, dest_a)
        elif built.exists():
            copy_file(built, dest_a)
        else:
            download(f"https://gokhan.vc/{a}", dest_a)

    # Blog posts from the atelier rebuild — same design system. Retitle to
    # Gökhan Ventures to match the Nov 9 live site (repo is now "Atelier").
    blog_src = Path("/tmp/builds/atelier-gokhan-website/dist/blog")
    if blog_src.exists():
        for src in blog_src.rglob("*.html"):
            rel = src.relative_to(blog_src)
            if rel.name == "index.html" and len(rel.parts) == 1:
                continue  # keep the Nov 9 capture index (lists all posts)
            html = src.read_text(encoding="utf-8", errors="replace")
            html = html.replace("Atelier Gökhan Turhan", "Gökhan Ventures")
            html = html.replace("https://gokhan.vc", f"{SITE}/gokhan-vc")
            sub = _canonical_sub(Path("blog") / rel)
            html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}{prefix}{sub}")
            write(dest / "blog" / rel, html)
        # CSS emitted by the rebuild, already prefixed /gokhan-vc/_astro/…
        astro = Path("/tmp/builds/atelier-gokhan-website/dist/_astro")
        if astro.exists():
            for src in astro.iterdir():
                if src.is_file():
                    text = src.read_text(encoding="utf-8", errors="replace") if src.suffix == ".css" else None
                    if text is not None:
                        write(dest / "_astro" / src.name, process_text(text, prefix) if "/gokhan-vc/" not in text else text)
                    else:
                        copy_file(src, dest / "_astro" / src.name)
    # legal pages from atelier (cookies, privacy, terms) — same chrome
    for page in ("cookies", "privacy", "terms"):
        src = Path(f"/tmp/builds/atelier-gokhan-website/dist/{page}/index.html")
        if src.exists():
            html = src.read_text(encoding="utf-8", errors="replace")
            html = html.replace("Atelier Gökhan Turhan", "Gökhan Ventures")
            html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}{prefix}/{page}/")
            write(dest / page / "index.html", html)


def prepare_coins():
    # Historical capture only. /coins/ is the Astro register; this origin is
    # not mounted. Left here in case a recapture is needed for the archive.
    prefix, name = "/coins", "The Token Estate"
    html = (RAW / "sub_coins.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/coins/")
    write(OUT / "coins/index.html", html)
    # favicon if any
    for path in ("favicon.svg", "favicon.ico", "og.png"):
        download(f"https://coins.numetal.xyz/{path}", OUT / "coins" / path)


def prepare_jesus():
    prefix, name = "/jesus", "Personal Jesus"
    pub = REPOS / "personal-jesus/public"
    for src in pub.rglob("*"):
        if not src.is_file() or src.name in {"robots.txt", "README.TXT", "LICENSE.TXT"}:
            continue
        rel = src.relative_to(pub)
        dest = OUT / "jesus" / rel
        if src.suffix.lower() in {".html", ".css", ".js", ".svg"}:
            text = src.read_text(encoding="utf-8", errors="replace")
            if src.suffix.lower() == ".html":
                text = process_html(text, prefix=prefix, name=name, canonical=f"{SITE}/jesus/")
            else:
                text = process_text(text, prefix)
            write(dest, text)
        else:
            copy_file(src, dest)
    # fonts from origin if missing
    for f in ("fonts/WebPlus_IBM_VGA_8x16.woff",):
        if not (OUT / "jesus" / f).exists():
            download(f"https://jesus.numetal.xyz/{f}", OUT / "jesus" / f)


def prepare_llmcraft():
    prefix, name = "/llmcraft", "LLMCraft"
    html = (RAW / "sub_llmcraft.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/llmcraft/")
    # large gifs already in the media archive
    gifs = [
        "strike_the_earth.gif", "magma_forges.gif", "the_breach.gif",
        "a_vile_force_of_darkness.gif", "strange_mood.gif",
        "the_caravan_has_arrived.gif", "candy_descent.gif",
    ]
    mapping = {f"/llmcraft/gifs/{g}": f"/media/archive/llmcraft/llmcraft/{g}" for g in gifs}
    html = relink_media(html, mapping)
    write(OUT / "llmcraft/index.html", html)
    for path in (
        "style.css", "app.js", "favicon.svg",
        "fonts/PixelifySans-var.woff2", "fonts/IBMPlexSans-var.woff2",
    ):
        dest = OUT / "llmcraft" / path
        if download(f"https://llmcraft.numetal.xyz/{path}", dest) and path.endswith((".css", ".js")):
            text = process_text(dest.read_text(encoding="utf-8", errors="replace"), prefix)
            # waitlist API stays at /llmcraft/api/… after process_text
            write(dest, text)


def prepare_llmlivesmatter():
    prefix, name = "/llmlivesmatter", "LLM LIVES MATTER"
    html = (RAW / "sub_llmlivesmatter.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/llmlivesmatter/")
    write(OUT / "llmlivesmatter/index.html", html)
    for path in ("style.css", "app.js", "favicon.svg"):
        dest = OUT / "llmlivesmatter" / path
        if download(f"https://llmlivesmatter.numetal.xyz/{path}", dest) and path.endswith((".css", ".js")):
            write(dest, process_text(dest.read_text(encoding="utf-8", errors="replace"), prefix))


def prepare_numetal_subpages():
    """Original Numetal blog / fees / decks / airdrops on top of the landing."""
    prefix, name = "/numetal", "Numetal"
    pages = {
        "blog/index.html": (RAW / "pg_numetal_xyz_blog.html", "/blog/"),
        "fees/index.html": (RAW / "pg_numetal_xyz_fees.html", "/fees/"),
        "decks/index.html": (RAW / "pg_numetal_xyz_decks.html", "/decks/"),
        "airdrops/index.html": (RAW / "pg_numetal_xyz_airdrops.html", "/airdrops/"),
        "blog/ishtar-is-live/index.html": (RAW / "pg_numetal_xyz_blog_ishtar-is-live.html", "/blog/ishtar-is-live/"),
    }
    for rel, (src, sub) in pages.items():
        if not src.exists():
            print(f"  SKIP missing {src}")
            continue
        html = src.read_text(encoding="utf-8", errors="replace")
        html = html.replace("https://numetal.xyz", f"{SITE}/numetal")
        html = html.replace("https://www.numetal.xyz", f"{SITE}/numetal")
        html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}{prefix}{sub}")
        write(OUT / "numetal" / rel, html)
    # JS already copied by phase 1 (fees.js, blog-collapse, airdrop, …)


def prepare_curb_agents():
    """Demo harness / seller / buyer original UIs under /curb/…"""
    prefix, name = "/curb", "CURB"
    hosts = {
        "harness": RAW / "sub_harness.curb.numetal.xyz.html",
        "seller": RAW / "sub_seller.curb.numetal.xyz.html",
        "buyer": RAW / "sub_buyer.curb.numetal.xyz.html",
    }
    abs_map = {
        "https://harness.curb.numetal.xyz/": "/curb/harness/",
        "https://harness.curb.numetal.xyz": "/curb/harness/",
        "https://seller.curb.numetal.xyz/": "/curb/seller/",
        "https://seller.curb.numetal.xyz": "/curb/seller/",
        "https://buyer.curb.numetal.xyz/": "/curb/buyer/",
        "https://buyer.curb.numetal.xyz": "/curb/buyer/",
        "https://curb.numetal.xyz/": "/curb/",
        "https://curb.numetal.xyz": "/curb/",
    }
    for slug, src in hosts.items():
        html = src.read_text(encoding="utf-8", errors="replace")
        for a, b in abs_map.items():
            html = html.replace(a, b)
        html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/curb/{slug}/")
        write(OUT / "curb" / slug / "index.html", html)



# Vocs docs: do not put the bar in the initial HTML (React hydration #418).
# Inject after mount and set --vocs-spacing-banner (Vocs's own banner offset)
# to the measured bar height so fixed logo / top nav / sidebar / content
# all shift down together on desktop and mobile.
VOCS_BAR_CSS = (
    "html{--gt-bar-h:31px;--vocs-spacing-banner:var(--gt-bar-h)!important}"
    ".gt-bar{all:initial;display:block;box-sizing:border-box;width:100%;"
    "position:fixed;top:0;left:0;right:0;z-index:99999;"
    "border-bottom:1px solid #141414;background:#ffffff;color:#141414;"
    "font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:6px 14px;"
    "letter-spacing:.02em}"
    ".gt-bar a{color:#002fa7;text-decoration:none}"
    ".gt-bar a:hover{text-decoration:underline}.gt-bar b{font-weight:600}"
    "@media (prefers-color-scheme:dark){.gt-bar{background:#141414;color:#f5f5f5;"
    "border-color:#f5f5f5}.gt-bar a{color:#8eb0ff}}"
)


def vocs_bar_script(prefix: str, name: str) -> str:
    import json
    html = bar(prefix, name)
    lit = json.dumps(html)
    return (
        "<script>(function(){var HTML=" + lit + ";"
        "function sync(){var el=document.querySelector('.gt-bar');if(!el)return;"
        "var h=Math.ceil(el.getBoundingClientRect().height);"
        "document.documentElement.style.setProperty('--gt-bar-h',h+'px');}"
        "function place(){"
        "if(!document.querySelector('.gt-bar')){"
        "var d=document.createElement('div');d.innerHTML=HTML;"
        "var el=d.firstElementChild;if(!el||!document.body)return;"
        "document.body.insertBefore(el,document.body.firstChild);}"
        "sync();}"
        "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',place);"
        "else place();"
        "new MutationObserver(place).observe(document.documentElement,{childList:true,subtree:true});"
        "window.addEventListener('resize',sync);"
        "setTimeout(place,0);setTimeout(place,200);setTimeout(place,800);"
        "})();</script>"
    )


def restyle_existing_bar(html: str) -> str:
    """Repaint a Bureau bar that was already baked in (skip-if-present path)."""
    def repl(m):
        s = m.group(0)
        s = s.replace("background:#f6f5f1", "background:#ffffff")
        s = s.replace("color:#f3f2ec", "color:#f5f5f5")
        s = s.replace("border-color:#f3f2ec", "border-color:#f5f5f5")
        return s
    return re.sub(r"\.gt-bar\{[^}]+\}", repl, html)


def add_vocs_chrome(html: str, prefix: str, name: str) -> str:
    html = MAILBOX.sub("contact@gokhan.vc", html)
    # never leave a static first-child bar — it trips React #418
    html = re.sub(
        r'(<body[^>]*>)\s*<div class="gt-bar"[^>]*>.*?</div>',
        r'\1',
        html,
        count=1,
        flags=re.S,
    )
    if 'gt-bar{' not in html:
        if re.search(r"</head>", html, re.I):
            html = re.sub(
                r"</head>",
                f"<style>{VOCS_BAR_CSS}</style>\n</head>",
                html,
                count=1,
                flags=re.I,
            )
    else:
        html = restyle_existing_bar(html)
    if "setProperty('--gt-bar-h'" not in html:
        script = vocs_bar_script(prefix, name)
        idx = html.lower().rfind("</body>")
        if idx >= 0:
            html = html[:idx] + script + "\n" + html[idx:]
        else:
            html += script
    return html


def prepare_curb_docs():
    src = Path("/tmp/builds/inference-swap/dist/public")
    if not src.exists():
        print("  SKIP curb docs: vocs build missing")
        return
    dest = OUT / "curb" / "docs"
    if dest.exists():
        shutil.rmtree(dest)
    for p in src.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(src)
        # skip marketing leftovers if any
        d = dest / rel
        if p.suffix.lower() in {".html", ".htm"}:
            html = p.read_text(encoding="utf-8", errors="replace")
            html = html.replace('href="/curb-sun.svg"', 'href="/curb/docs/curb-sun.svg"')
            html = html.replace("href='/curb-sun.svg'", "href='/curb/docs/curb-sun.svg'")
            html = html.replace('content="/curb-sun.svg"', 'content="/curb/docs/curb-sun.svg"')
            sub = _canonical_sub(rel)
            # already prefixed /curb/docs/ — only add chrome; process_html
            # ATTR_RE skips "curb" so hrefs stay, FETCH_RE could double.
            html = add_vocs_chrome(html, "/curb", "CURB")
            if re.search(r'rel=["\']canonical["\']', html, re.I):
                html = re.sub(
                    r'(<link\s+rel=["\']canonical["\']\s+href=["\'])[^"\']+(["\'])',
                    rf"\g<1>{SITE}/curb/docs{sub}\2",
                    html, count=1, flags=re.I,
                )
            write(d, html)
        elif p.suffix.lower() in {".css", ".js", ".txt", ".md", ".svg", ".json"}:
            # already prefixed; copy as-is (FETCH_RE would double /curb)
            copy_file(p, d)
        else:
            copy_file(p, d)
    print("  curb docs ingested")


def prepare_ishtar_docs():
    src = Path("/tmp/builds/ishtar-website/dist/public")
    if not src.exists():
        print("  SKIP ishtar docs: vocs build missing")
        return
    dest = OUT / "ishtar" / "docs"
    if dest.exists():
        shutil.rmtree(dest)
    for p in src.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(src)
        d = dest / rel
        if p.suffix.lower() in {".html", ".htm"}:
            html = p.read_text(encoding="utf-8", errors="replace")
            html = html.replace('href="/favicon.svg"', 'href="/ishtar/docs/favicon.svg"')
            html = html.replace("href='/favicon.svg'", "href='/ishtar/docs/favicon.svg'")
            html = add_vocs_chrome(html, "/ishtar", "Ishtar")
            sub = _canonical_sub(rel)
            if re.search(r'rel=["\']canonical["\']', html, re.I):
                html = re.sub(
                    r'(<link\s+rel=["\']canonical["\']\s+href=["\'])[^"\']+(["\'])',
                    rf"\g<1>{SITE}/ishtar/docs{sub}\2",
                    html, count=1, flags=re.I,
                )
            write(d, html)
        else:
            copy_file(p, d)
    print("  ishtar docs ingested")


def prepare_launch_bundle():
    """Overlay the Vite-built mini-app JS bundle onto the existing Launch origin."""
    src = Path("/tmp/builds/launch-router/packages/telegram/dist")
    if not src.exists():
        print("  SKIP launch bundle: vite build missing")
        return
    prefix, name = "/launch", "Launch"
    # assets (already /launch/assets/… from vite base)
    assets = src / "assets"
    if assets.exists():
        for p in assets.iterdir():
            if p.is_file():
                copy_file(p, OUT / "launch" / "assets" / p.name)
    for fname in ("favicon.svg", "nautilus.svg", "skill.md"):
        if (src / fname).exists() and not (OUT / "launch" / fname).exists():
            copy_file(src / fname, OUT / "launch" / fname)
    # app.html — the Sign mini-app, now with the JS bundle
    app = src / "app.html"
    if app.exists():
        html = app.read_text(encoding="utf-8")
        # already uses /launch/favicon and /launch/assets; / is home
        html = html.replace('href="/"', 'href="/launch/"')
        html = MAILBOX.sub("contact@gokhan.vc", html)
        html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/launch/app/")
        write(OUT / "launch" / "app" / "index.html", html)
        write(OUT / "launch" / "app.html", html)
    # Keep the Nov 9 landing (already mounted). Fix /app.html links if needed.
    landing = OUT / "launch" / "index.html"
    if landing.exists():
        t = landing.read_text(encoding="utf-8")
        t2 = t.replace('href="/app.html"', 'href="/launch/app/"').replace("href='/app.html'", "href='/launch/app/'")
        t2 = t2.replace('href="/launch/app.html"', 'href="/launch/app/"')
        if t2 != t:
            write(landing, t2)
    print("  launch mini-app bundle ingested")


DRAFTS = [
    ("onbots", "Onbots", "onbots"),
    ("tape-exchange", "Tape Exchange", "tape-exchange"),
    ("clankdog", "Clank Dog", "clankdog"),
    ("ai-ipo", "AI IPO", "ai-ipo"),
    ("belief-systems", "Belief Systems", "belief-systems"),
    ("foreguild-fao-plan", "Foreguild FAO Plan", "foreguild-fao-plan"),
    ("hypersitition", "hypersitition", "hypersitition"),
    ("lectotype", "Lectotype", "lectotype"),
]



def rewrite_estate_hosts(text: str) -> str:
    """Point retired hosts at their gokhanturhan.com copies."""
    pairs = (
        ("https://www.numetal.xyz", "https://gokhanturhan.com/numetal"),
        ("https://numetal.xyz", "https://gokhanturhan.com/numetal"),
        ("http://www.numetal.xyz", "https://gokhanturhan.com/numetal"),
        ("http://numetal.xyz", "https://gokhanturhan.com/numetal"),
        ("https://www.gokhan.vc", "https://gokhanturhan.com/gokhan-vc"),
        ("https://gokhan.vc", "https://gokhanturhan.com/gokhan-vc"),
        ("http://www.gokhan.vc", "https://gokhanturhan.com/gokhan-vc"),
        ("http://gokhan.vc", "https://gokhanturhan.com/gokhan-vc"),
        ("https://www.agentbounty.dev", "https://gokhanturhan.com/agentbounty"),
        ("https://agentbounty.dev", "https://gokhanturhan.com/agentbounty"),
        ("http://www.agentbounty.dev", "https://gokhanturhan.com/agentbounty"),
        ("http://agentbounty.dev", "https://gokhanturhan.com/agentbounty"),
    )
    for a, b in pairs:
        text = text.replace(a, b)
    return text


def prepare_agentbounty():
    """Mirror agentbounty.dev as it is now: the June 2026 rebrand page."""
    prefix, name = "/agentbounty", "AgentBounty"
    dest = OUT / "agentbounty"
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    src = "https://agentbountydev.pages.dev"
    html_path = dest / "index.html"
    if not download(f"{src}/", html_path):
        raise SystemExit("failed to fetch agentbounty.dev homepage")
    html = html_path.read_text(encoding="utf-8", errors="replace")
    html = rewrite_estate_hosts(html)
    html = process_html(
        html,
        prefix=prefix,
        name=name,
        canonical=f"{SITE}/agentbounty/",
    )
    # process_html may run before host rewrite of og:image if we rewrite after;
    # run host rewrite once more so any leftover absolute URLs are moved.
    html = rewrite_estate_hosts(html)
    write(dest / "index.html", html)

    for asset in ("og.png", "feed.xml"):
        target = dest / asset
        if download(f"{src}/{asset}", target):
            if asset.endswith(".xml"):
                text = rewrite_estate_hosts(process_text(target.read_text(encoding="utf-8", errors="replace"), prefix))
                write(target, text)


def prepare_draft(slug, name, repo_name):
    prefix = f"/{slug}"
    src = REPOS / repo_name
    if not src.exists():
        print(f"  SKIP {slug}: no repo")
        return
    ingest_tree(
        src, OUT / slug, prefix, name,
        skip_names={".gitignore", ".nojekyll", "README.md", "LICENSE", "LICENSE.md", "GOVERNANCE.md", "CITATION.cff", "llms.txt"},
        skip_suffixes={".py", ".ts", ".tsx", ".mjs", ".cjs", ".sh", ".zsh"},
    )


def update_manifest(new_items):
    man = OUT / "manifest.json"
    data = json.loads(man.read_text()) if man.exists() else []
    have = {d["slug"] for d in data}
    for item in new_items:
        if item["slug"] not in have:
            data.append(item)
    write(man, json.dumps(data, indent=2) + "\n")


def main():
    if not OUT.exists():
        print("origins/ missing — run prepare-origins.py first")
        return 1
    jobs = [
        ("gokhan-vc", prepare_gokhan_vc, "Gökhan Ventures"),
        # coins is not mounted: the live page is the Astro register.
        ("jesus", prepare_jesus, "Personal Jesus"),
        ("llmcraft", prepare_llmcraft, "LLMCraft"),
        ("llmlivesmatter", prepare_llmlivesmatter, "LLM LIVES MATTER"),
        ("numetal-subpages", prepare_numetal_subpages, None),
        ("curb-agents", prepare_curb_agents, None),
        ("curb-docs", prepare_curb_docs, None),
        ("ishtar-docs", prepare_ishtar_docs, None),
        ("launch-bundle", prepare_launch_bundle, None),
        ("agentbounty", prepare_agentbounty, "AgentBounty"),
    ]
    items = []
    for slug, fn, name in jobs:
        print(f"\n=== {slug} ===")
        fn()
        if name:
            items.append({"slug": slug, "name": name})
    for slug, name, repo in DRAFTS:
        print(f"\n=== {slug} ===")
        prepare_draft(slug, name, repo)
        items.append({"slug": slug, "name": name})
    update_manifest(items)
    print("\nDone. origins at", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
