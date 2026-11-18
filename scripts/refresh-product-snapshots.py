#!/usr/bin/env python3
"""Refresh the brochure pages that still come from product source.

Writes origins/ for the CURB pages other than the home page and the docs,
and the plaintext pages that are not the join app.

Jesus and accumulator already match their public files aside from the
Bureau bar. This script leaves them alone.

Does not crawl. Does not copy package manifests, lockfiles, wrangler
config, source maps, or the plaintext join app. A product patch does not
move the apex until this output is committed and pushed.

Example:
  python3 scripts/refresh-product-snapshots.py \\
    --curb <inference-swap> \\
    --plaintext <plaintext/site> \\
    --board board.json --hands hands.json

board.json and hands.json are the JSON from `wrangler d1 execute --json`
for the public board (gid, title, created_at, body, name) and the public
hand names. Leave them out to keep the saved plaintext board.
"""
from __future__ import annotations

import argparse
import importlib.util
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "origins"
SITE = "https://gokhanturhan.com"
# Longest first. api.curb.numetal.xyz does not match these.
SNAPSHOT_HOSTS = (
    ("https://seller.curb.numetal.xyz", "/curb/seller"),
    ("https://buyer.curb.numetal.xyz", "/curb/buyer"),
    ("https://harness.curb.numetal.xyz", "/curb/harness"),
    ("https://curb.numetal.xyz", "/curb"),
)


def load_prep():
    path = REPO / "scripts" / "prepare-origins.py"
    spec = importlib.util.spec_from_file_location("prepare_origins", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    # Do not rewrite every address. Example placeholders stay as written.
    mod.MAILBOX = re.compile(r"a^")
    return mod


def render(node: str, out: Path, args: argparse.Namespace) -> None:
    cmd = [
        node,
        "--experimental-strip-types",
        str(REPO / "scripts" / "render-product-pages.mjs"),
        "--out",
        str(out),
        "--curb",
        str(args.curb),
        "--plaintext",
        str(args.plaintext),
    ]
    if args.board:
        cmd += ["--board", str(args.board)]
    if args.hands:
        cmd += ["--hands", str(args.hands)]
    subprocess.run(cmd, check=True)


def place_html(prep, src: Path, dest: Path, prefix: str, name: str, canonical: str) -> None:
    html = src.read_text(encoding="utf-8")
    html = prep.process_html(html, prefix=prefix, name=name, canonical=canonical)
    if prefix == "/curb":
        for src_host, dest_host in SNAPSHOT_HOSTS:
            html = html.replace(src_host, dest_host)
    prep.write(dest, html)


def place_text(prep, src: Path, dest: Path, prefix: str) -> None:
    prep.write(dest, prep.process_text(src.read_text(encoding="utf-8"), prefix))


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--curb", type=Path, required=True)
    p.add_argument("--plaintext", type=Path, required=True)
    p.add_argument("--board", type=Path)
    p.add_argument("--hands", type=Path)
    p.add_argument("--node", default="node")
    args = p.parse_args()
    for label, path in (("curb", args.curb), ("plaintext", args.plaintext)):
        if not path.is_dir():
            print(f"{label} checkout is not a directory", file=sys.stderr)
            return 1

    prep = load_prep()
    scratch = Path(tempfile.mkdtemp(prefix="snapshot-render-"))
    try:
        render(args.node, scratch, args)
        pages = [
            ("curb/fees/index.html", "/curb", "CURB", f"{SITE}/curb/fees/"),
            ("curb/install/index.html", "/curb", "CURB", f"{SITE}/curb/install/"),
            ("curb/harness/index.html", "/curb", "CURB", f"{SITE}/curb/harness/"),
            ("curb/terms/index.html", "/curb", "CURB", f"{SITE}/curb/terms/"),
            ("curb/privacy/index.html", "/curb", "CURB", f"{SITE}/curb/privacy/"),
            ("curb/deck/index.html", "/curb", "CURB", f"{SITE}/curb/deck/"),
            ("curb/seller/index.html", "/curb", "CURB", f"{SITE}/curb/seller/"),
            ("curb/buyer/index.html", "/curb", "CURB", f"{SITE}/curb/buyer/"),
        ]
        for rel in scratch.joinpath("plaintext").rglob("*.html"):
            rel_s = rel.relative_to(scratch).as_posix()
            if rel_s == "plaintext/index.html":
                canon = f"{SITE}/plaintext/"
            else:
                parent = rel.relative_to(scratch / "plaintext").parent.as_posix()
                canon = f"{SITE}/plaintext/{parent}/"
            pages.append((rel_s, "/plaintext", "plaintext", canon))
        if (scratch / "plaintext" / "style.css").exists():
            place_text(prep, scratch / "plaintext" / "style.css", OUT / "plaintext" / "style.css", "/plaintext")
        for rel, prefix, name, canon in pages:
            place_html(prep, scratch / rel, OUT / rel, prefix, name, canon)
        deck = args.curb / "public" / "deck" / "curb-deck.pdf"
        if deck.is_file():
            prep.copy_file(deck, OUT / "curb" / "deck.pdf")
    finally:
        shutil.rmtree(scratch, ignore_errors=True)
        leftover = OUT / "plaintext" / "_plaintext-pages.mjs"
        if leftover.exists():
            leftover.unlink()
    return 0


if __name__ == "__main__":
    sys.exit(main())
