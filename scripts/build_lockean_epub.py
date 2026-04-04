#!/usr/bin/env python3

from __future__ import annotations

import html
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
BOOK_SLUG = "an-essay-concerning-the-inbox"
OUT_DIR = ROOT / "public" / "publishing" / "ebooks" / BOOK_SLUG

TITLE = "An Essay Concerning the Inbox"
SUBTITLE = "A Lockean poem in twenty cantos and one thousand lines"
AUTHOR = "Gökhan Turhan"
LANG = "en-US"

LEGACY_NAMES = [
    "fetchpop",
    "PopTart",
    "get-mail",
    "gwpop",
    "pimp",
    "pop-perl",
    "popc",
    "popmail",
    "upop",
    "popclient",
    "fetchmail",
    "movemail",
    "rpop",
    "pine",
    "elm",
    "mutt",
    "mailx",
    "MH",
    "exmh",
    "procmail",
]

TOOL_PAIRS = [
    ("procmail", "sendmail"),
    ("mailx", "uucico"),
    ("elm", "pine"),
    ("mutt", "formail"),
    ("cron", "inetd"),
    ("ed", "nroff"),
    ("grep", "awk"),
    ("rc.local", "syslog"),
    ("MH", "exmh"),
    ("slocal", "vacation"),
    ("rmail", "binmail"),
    ("imapd", "ipop3d"),
    ("sed", "tr"),
    ("aliases", "newaliases"),
    ("talkd", "finger"),
]

THOUGHTS = [
    "a simple idea",
    "a complex idea",
    "judgment",
    "duration",
    "identity",
    "association",
    "memory",
    "consent",
    "property",
    "personhood",
    "evidence",
    "reflection",
]

PHILOSOPHICAL = [
    "sensation",
    "reflection",
    "experience",
    "recollection",
    "attention",
    "comparison",
    "deliberation",
    "habit",
]


@dataclass(frozen=True)
class Canto:
    title: str
    scenes: list[str]
    subjects: list[str]
    transports: list[str]
    techs: list[str]
    refrain: str


CANTOS = [
    Canto(
        "Tabula Rasa at Login",
        ["cold login", "Bell Labs midnight", "the first prompt", "boot hush", "a blank buffer"],
        ["cursor", "header", "maildrop", "prompt", "empty page"],
        ["serial dusk", "copper rain", "modem static", "an unclaimed line", "port 110"],
        ["POP2", "POP3", "stty", "mailx", "getty"],
        "The soul began as a screen awaiting login",
    ),
    Canto(
        "Port 110 at Dawn",
        ["ethernet dawn", "a thawing rack room", "the gray hour before coffee", "sun on the modem lights", "a quiet NOC"],
        ["packet", "reply", "greeting", "banner", "checksum"],
        ["PPP hiss", "SLIP weather", "a routed morning", "thin copper", "a dialup hymn"],
        ["port 110", "APOP", "POP3", "inetd", "tcpdump"],
        "Experience arrived before doctrine",
    ),
    Canto(
        "Labor in /var/spool",
        ["the machine room aisle", "the floor under the raised tiles", "the spool directory", "a fan-lined corridor", "the backup hour"],
        ["inode", "mailbox", "lockfile", "queue", "ownership"],
        ["UUCP dusk", "a bang path", "ethernet drizzle", "leased-line weather", "late shift traffic"],
        ["procmail", "formail", "sendmail", "rmail", "binmail"],
        "What the hand maintained, the hand might claim",
    ),
    Canto(
        "Substance, Header, Body",
        ["a phosphor chamber", "the long green screen", "the editor margin", "the draft window", "the pager glow"],
        ["subject line", "body text", "date stamp", "return path", "envelope"],
        ["a careful route", "slow copper", "office backbone", "night traffic", "a patient socket"],
        ["RFC 937", "RFC 1081", "SMTP", "POP3", "headers"],
        "Essence hid; only properties were legible",
    ),
    Canto(
        "Midnight and Personal Identity",
        ["the maintenance window", "the graveyard shift", "the sleepless terminal", "the polling interval", "post-midnight hush"],
        ["session", "account", "operator", "maildrop", "reply chain"],
        ["after-hours traffic", "a soft retry", "repeated polling", "modem weather", "an unseen route"],
        ["fetchmail", "popclient", "cron", "logrotate", "syslog"],
        "Memory, not metal, carried the person through",
    ),
    Canto(
        "Consent of Daemons",
        ["rc scripts at dawn", "the daemon table", "a process list", "the root console", "an orderly boot"],
        ["pid", "service", "daemon", "socket", "queue runner"],
        ["lantern-light ethernet", "local traffic", "loopback quiet", "a trusted subnet", "a system bus"],
        ["inetd", "cron", "atd", "sendmail", "smail"],
        "Small processes formed a commonwealth in the dark",
    ),
    Canto(
        "GNU Weather, BSD Light",
        ["a GNU workstation", "a BSD shell", "the open-source noon", "the admin's desk", "the mailing list archive"],
        ["fork", "patch", "release", "mirror", "source tree"],
        ["ftp current", "rsync rain", "usenet wind", "listserv weather", "mirrored light"],
        ["GNU", "BSD", "patch", "diff", "tar"],
        "Freedom took the shape of interoperable patience",
    ),
    Canto(
        "UUCP Roads and Bang Paths",
        ["country-node midnight", "the relay hop", "the rural exchange", "a long-distance queue", "the telephone dark"],
        ["route", "hop", "bang path", "relay", "handoff"],
        ["UUCP dusk", "telephone weather", "long-haul copper", "relay static", "night tariff traffic"],
        ["uux", "uucico", "rnews", "bang paths", "neighbors"],
        "Distance was a grammar, not an obstacle",
    ),
    Canto(
        "The Nine Candidates",
        ["a code search by lamplight", "the second grep", "the naming hour", "the table of candidates", "a yellow pad by the keyboard"],
        ["candidate", "syllable", "program name", "source file", "daemon sketch"],
        ["reuse across the wire", "mailing-list weather", "the Linux bazaar", "the Unix commons", "shared source air"],
        ["fetchpop", "PopTart", "get-mail", "gwpop", "pimp"],
        "Even comic names may bear serious letters",
    ),
    Canto(
        "Fetchmail after Empiricism",
        ["the release note", "a polished tarball", "the handoff from one maintainer to another", "a modest changelog", "the archive mirror"],
        ["merge", "patchset", "daemon mode", "release", "manual page"],
        ["POP over dawn", "a steady route", "maintenance traffic", "the public net", "a mailbox wind"],
        ["fetchmail", "daemon mode", "multidrop", "ETRN", "polling"],
        "To poll again was to believe in evidence",
    ),
    Canto(
        "The Archive of Impressions",
        ["the backup shelf", "the tape closet", "the archive room", "an rsync mirror", "the index rebuild"],
        ["impression", "copy", "archive", "checksum", "restored letter"],
        ["retention traffic", "mirror current", "quiet replication", "restoration light", "incremental weather"],
        ["tar", "cpio", "gzip", "rsync", "restore"],
        "No message stayed unchanged once recollected",
    ),
    Canto(
        "Errors, Retries, and Human Understanding",
        ["packet loss at dusk", "the warning bell", "a retry loop", "the monitor wall", "the red line in syslog"],
        ["timeout", "retry", "warning", "checksum miss", "partial read"],
        ["jitter", "lossy weather", "a noisy line", "congested routing", "storm traffic"],
        ["EAGAIN", "timeout", "errno", "retry", "backoff"],
        "Failure taught the wire its manners",
    ),
    Canto(
        "Pine Needles, Elm Shade, Mutt Footsteps",
        ["the campus lab", "the student shell account", "a public terminal room", "the late-night study hall", "the help desk quiet"],
        ["inbox", "thread", "menu", "keybinding", "reply"],
        ["campus ethernet", "dorm-room static", "modem patience", "shared account traffic", "late semester weather"],
        ["pine", "elm", "mutt", "mailx", "tin"],
        "Clients differ; the appetite for news persists",
    ),
    Canto(
        "On Property in the Mailbox",
        ["the home directory", "the quota report", "the user's shelf", "the chown command", "a private account"],
        ["quota", "folder", "saved reply", "address book", "ownership bit"],
        ["home-net traffic", "quiet LAN weather", "routine sync", "private bandwidth", "careful retrieval"],
        ["Maildir", "mbox", "chmod", "chown", "quota"],
        "The kept letter became a labor of the self",
    ),
    Canto(
        "Commonwealth under Cron",
        ["03:00 in the machine room", "the quarter-hour tick", "a scheduled dawn", "the unattended rack", "the minute hand over the logbook"],
        ["schedule", "interval", "tick", "job", "receipt"],
        ["predictable traffic", "hourly polling", "interval weather", "nightly sync", "timed retrieval"],
        ["cron", "anacron", "at", "sleep", "watch"],
        "Regularity is mercy disguised as schedule",
    ),
    Canto(
        "Sleep of the Operator",
        ["the empty swivel chair", "the coffee ring beside the keyboard", "the sleeping office", "the dim cube farm", "the darkened monitor"],
        ["dream", "silence", "lamp", "note", "unread mail"],
        ["background traffic", "a keeper line", "the unattended net", "dreaming bandwidth", "low midnight current"],
        ["daemon", "nohup", "screen", "tmux", "uptime"],
        "Even unattended systems dream of acknowledgment",
    ),
    Canto(
        "Green Screen Republic",
        ["a phosphor republic", "the amber margin", "the editor status bar", "the ruler line", "the command prompt"],
        ["status line", "page ruler", "menu bar", "cursor block", "insert mode"],
        ["terminal current", "glass-tube weather", "scanline dusk", "keyboard traffic", "screenlight"],
        ["ed", "vi", "emacs", "WordStar", "nroff"],
        "The cursor is the smallest visible form of hope",
    ),
    Canto(
        "Deletion, Mercy, and Retention",
        ["the trash folder", "the expunge prompt", "the warning dialog", "the retention policy", "the cleanup script"],
        ["deletion", "mercy", "retention", "archive flag", "purge"],
        ["cleanup traffic", "last-chance weather", "archive current", "deferred deletion", "compliance wind"],
        ["expunge", "rm", "rmm", "trash", "archive"],
        "To spare or expunge is an ethics of storage",
    ),
    Canto(
        "Dawn over the Post Office",
        ["sun through the server-room window", "the first coffee steam", "the morning queue", "the postmaster's desk", "the mail route map"],
        ["postbag", "queue", "receipt", "route slip", "arrival bell"],
        ["daybreak traffic", "fresh ethernet", "sunlit routing", "newly quiet copper", "the office subnet"],
        ["postfix", "sendmail", "smtpd", "mailq", "postmaster"],
        "At morning, old protocols looked almost pastoral",
    ),
    Canto(
        "Essay Concerning the Inbox",
        ["the final shell", "the closing prompt", "the saved transcript", "the remembered login", "the last page of the draft"],
        ["memory", "reply", "archive", "self", "common inbox"],
        ["shared bandwidth", "a remembered route", "the human network", "the final poll", "the quiet after transmission"],
        ["fetchmail", "procmail", "POP3", "IMAP", "SMTP"],
        "What we remember together outlives the session",
    ),
]


def pick(items: list[str], index: int, offset: int = 0) -> str:
    return items[(index + offset) % len(items)]


def line_one(scene: str, subject: str, stanza_index: int) -> str:
    variants = [
        f"At {scene}, the {subject} entered as a first impression on the waiting screen.",
        f"I met the {subject} in {scene}, where the cursor blinked like cautious dawn.",
        f"Through {scene}, the {subject} arrived, not innate, not promised, only present.",
        f"{scene} taught the {subject} its outline, the way experience teaches the mind.",
    ]
    return variants[stanza_index % len(variants)]


def line_two(legacy: str, transport: str, tech: str, stanza_index: int) -> str:
    variants = [
        f"{legacy} came by {transport}, while {tech} kept count with clerkly patience.",
        f"Across {transport}, {legacy} hailed {tech}, and the wire answered in green.",
        f"Even {legacy}, strange in syllable, bore grave dispatch through {transport}.",
        f"{tech} listened at {transport} for {legacy}, as if evidence itself had learned to poll.",
    ]
    return variants[stanza_index % len(variants)]


def line_three(thought: str, faculty: str, stanza_index: int) -> str:
    variants = [
        f"From {faculty} rose {thought}; from reflection, the rule for keeping it.",
        f"No innate letter survived this contact; {thought} was written only after touch.",
        f"Thus {thought} assembled itself from headers, pauses, and the conscience of reply.",
        f"I called it {thought} because the mind, once touched, must sort what it has received.",
    ]
    return variants[stanza_index % len(variants)]


def line_four(tool_a: str, tool_b: str, stanza_index: int) -> str:
    variants = [
        f"Meanwhile {tool_a} and {tool_b} tended /var/spool/mail more faithfully than kings tend borders.",
        f"In the aisle between {tool_a} and {tool_b}, the machine practiced modest politics.",
        f"{tool_a}, {tool_b}, and a quiet inode disputed substance under the phosphor fan.",
        f"Beneath green glass, {tool_a} with {tool_b} made order from waiting and delay.",
    ]
    return variants[stanza_index % len(variants)]


def line_five(refrain: str, stanza_index: int) -> str:
    variants = [
        f"{refrain}.",
        f"{refrain}, and the cursor held its narrow breath.",
        f"{refrain}, one poll farther into the dark.",
        f"{refrain}, until dawn accepted the packet as evidence.",
    ]
    return variants[stanza_index % len(variants)]


def special_opening() -> list[str]:
    return [
        "Blank was the screen before the hand found Enter.",
        "Blanker the inward slate, if Locke still has a claim upon us.",
        "Then fetchpop knocked across the wire like weather at a chapel door.",
        "Somewhere in Bell Labs dusk, a maildrop dreamed of being known.",
        "The soul began as a screen awaiting login.",
    ]


def special_nine_candidates() -> list[str]:
    names = ["fetchpop", "PopTart", "get-mail", "gwpop", "pimp", "pop-perl", "popc", "popmail", "upop", "fetchmail"]
    lines: list[str] = [
        "I spread the yellow pad beside the keyboard and counted names as if they were weather fronts.",
        "The Linux bazaar kept no single throne; it offered candidates, and judgment had to walk among them.",
    ]
    for name in names:
        lines.append(f"{name} stepped forward, odd in title yet earnest in service, asking only to be tried against the wire.")
    lines.extend(
        [
            "Their comedy of naming did not cancel their seriousness; the packet does not blush for its courier.",
            "What matters is not a regal banner but whether the mail arrives intact before memory cools.",
            "So the grep grew theological, and every source file became a disputed gospel of polling.",
            "Even comic names may bear serious letters.",
        ]
    )
    return lines


def special_closing() -> list[str]:
    return [
        "What endured the session was never the metal, only the order remembered through use.",
        "No old daemon asked for immortality; it asked to finish the queue before the office woke.",
        "PopTart, gwpop, popmail, and upop passed into archive light without embarrassment.",
        "fetchpop and get-mail kept their minor republics in the margins of the larger story.",
        "pimp, pop-perl, and popc survived as syllables carrying labor farther than fashion.",
        "The subject line faded; the act of attending did not.",
        "The spool was emptied, the person not.",
        "I closed the shell and kept the self that recollection had composed from contact.",
        "Morning touched the glass, and every old protocol looked briefly pastoral.",
        "What we remember together outlives the session.",
    ]


def build_poem_lines() -> tuple[list[str], list[list[str]]]:
    all_lines: list[str] = []
    by_canto: list[list[str]] = []

    legacy_offset = 0
    pair_offset = 0
    thought_offset = 0
    faculty_offset = 0

    for canto_index, canto in enumerate(CANTOS):
        canto_lines: list[str] = []

        for stanza_index in range(10):
            scene = pick(canto.scenes, stanza_index)
            subject = pick(canto.subjects, stanza_index)
            transport = pick(canto.transports, stanza_index)
            tech = pick(canto.techs, stanza_index)
            legacy = pick(LEGACY_NAMES, stanza_index, legacy_offset)
            tool_a, tool_b = TOOL_PAIRS[(stanza_index + pair_offset) % len(TOOL_PAIRS)]
            thought = pick(THOUGHTS, stanza_index, thought_offset)
            faculty = pick(PHILOSOPHICAL, stanza_index, faculty_offset)

            canto_lines.extend(
                [
                    line_one(scene, subject, stanza_index),
                    line_two(legacy, transport, tech, stanza_index),
                    line_three(thought, faculty, stanza_index),
                    line_four(tool_a, tool_b, stanza_index),
                    line_five(canto.refrain, stanza_index),
                ]
            )

        if canto_index == 0:
            canto_lines[:5] = special_opening()
        if canto_index == 8:
            special = special_nine_candidates()
            canto_lines[10:10 + len(special)] = special
        if canto_index == len(CANTOS) - 1:
            canto_lines[-10:] = special_closing()

        legacy_offset += 3
        pair_offset += 2
        thought_offset += 1
        faculty_offset += 1

        if len(canto_lines) != 50:
            raise ValueError(f"{canto.title} produced {len(canto_lines)} lines instead of 50")

        by_canto.append(canto_lines)
        all_lines.extend(canto_lines)

    if len(all_lines) != 1000:
        raise ValueError(f"Poem produced {len(all_lines)} total lines instead of 1000")

    required = {"fetchpop", "PopTart", "get-mail", "gwpop", "pimp", "pop-perl", "popc", "popmail", "upop"}
    body = "\n".join(all_lines)
    missing = [name for name in sorted(required) if name not in body]
    if missing:
        raise ValueError(f"Missing required historical names: {', '.join(missing)}")

    return all_lines, by_canto


def write_text_source(lines: Iterable[str]) -> Path:
    path = OUT_DIR / "poem.txt"
    numbered = "\n".join(f"{index:04d}  {line}" for index, line in enumerate(lines, start=1))
    path.write_text(numbered + "\n", encoding="utf-8")
    return path


def build_cover_svg() -> str:
    guide_lines = []
    for row, y in enumerate(range(1020, 1830, 70), start=1):
        label = f"{row:02d}"
        guide_lines.append(
            f'<text x="190" y="{y}" fill="#5ef18b" font-size="26" opacity="0.34">{label}</text>'
            f'<text x="250" y="{y}" fill="#80ff9b" font-size="26" opacity="0.28">'
            f'| {pick(LEGACY_NAMES, row)} :: {pick(THOUGHTS, row)} :: /var/spool/mail</text>'
        )
    guide = "\n      ".join(guide_lines)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2400" viewBox="0 0 1600 2400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#021108"/>
      <stop offset="100%" stop-color="#081c0d"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#042414"/>
      <stop offset="100%" stop-color="#0b2a18"/>
    </linearGradient>
    <pattern id="scanlines" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="4" fill="rgba(0,0,0,0.0)"/>
      <rect y="4" width="8" height="4" fill="rgba(0,0,0,0.15)"/>
    </pattern>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1600" height="2400" fill="url(#bg)"/>
  <rect x="90" y="90" width="1420" height="2220" rx="30" fill="#0c140e" stroke="#395842" stroke-width="6"/>
  <rect x="150" y="150" width="1300" height="2100" rx="22" fill="url(#screen)" stroke="#93ffb2" stroke-width="5"/>
  <rect x="150" y="150" width="1300" height="2100" rx="22" fill="url(#scanlines)" opacity="0.7"/>

  <text x="200" y="230" fill="#b7ffc8" font-family="Courier New, monospace" font-size="32">TEXT PROCESSOR :: DRAFT 001 :: PAGE 001</text>
  <text x="200" y="278" fill="#8ef9a7" font-family="Courier New, monospace" font-size="22">F1=HELP   ^K^S=SAVE   ^Q^F=FIND   INS=INSERT   PORT=110   STATUS:READY</text>

  <text x="210" y="430" fill="#d7ffe0" font-family="Courier New, monospace" font-size="104" filter="url(#glow)">AN ESSAY</text>
  <text x="210" y="550" fill="#d7ffe0" font-family="Courier New, monospace" font-size="104" filter="url(#glow)">CONCERNING</text>
  <text x="210" y="670" fill="#d7ffe0" font-family="Courier New, monospace" font-size="104" filter="url(#glow)">THE INBOX</text>

  <text x="214" y="762" fill="#9cffb1" font-family="Courier New, monospace" font-size="34">A LOCKEAN POEM IN 1000 LINES</text>
  <text x="214" y="810" fill="#d7ffe0" font-family="Courier New, monospace" font-size="28">BY GÖKHAN TURHAN</text>
  <text x="214" y="858" fill="#86ffac" font-family="Courier New, monospace" font-size="28">fetchpop   PopTart   get-mail   gwpop</text>
  <text x="214" y="906" fill="#86ffac" font-family="Courier New, monospace" font-size="28">pimp   pop-perl   popc   popmail   upop</text>

  <rect x="210" y="950" width="1180" height="960" rx="12" fill="rgba(0,0,0,0.12)" stroke="#67f390" stroke-width="2"/>
  <text x="240" y="1002" fill="#b0ffc2" font-family="Courier New, monospace" font-size="22">001....|....010....|....020....|....030....|....040....|....050</text>
      {guide}

  <rect x="210" y="1970" width="1180" height="160" rx="12" fill="rgba(0,0,0,0.20)" stroke="#67f390" stroke-width="2"/>
  <text x="245" y="2030" fill="#d7ffe0" font-family="Courier New, monospace" font-size="28">No innate letter arrives; contact writes the mind.</text>
  <text x="245" y="2082" fill="#9cffb1" font-family="Courier New, monospace" font-size="24">Green phosphor, page ruler, command bar: an homage to early text processors.</text>

  <text x="210" y="2200" fill="#8ef9a7" font-family="Courier New, monospace" font-size="24">AUTHOR: GÖKHAN TURHAN   FORMAT: EPUB   EDITION: DIGITAL</text>
</svg>
"""


def write_cover() -> tuple[Path, Path]:
    svg_path = OUT_DIR / "cover.svg"
    png_path = OUT_DIR / "cover.png"
    svg_path.write_text(build_cover_svg(), encoding="utf-8")

    subprocess.run(
        [
            "magick",
            "-density",
            "300",
            str(svg_path),
            "-resize",
            "1600x2400",
            str(png_path),
        ],
        check=True,
        cwd=ROOT,
    )

    return svg_path, png_path


def build_html(by_canto: list[list[str]]) -> str:
    sections: list[str] = []
    line_number = 1

    for canto, lines in zip(CANTOS, by_canto, strict=True):
        stanza_chunks = []
        for line in lines:
            stanza_chunks.append(
                f'<p class="line"><span class="ln">{line_number:04d}</span><span class="text">{html.escape(line)}</span></p>'
            )
            line_number += 1
        sections.append(
            "\n".join(
                [
                    f'<section class="canto" id="{slugify(canto.title)}">',
                    f"  <h2>{html.escape(canto.title)}</h2>",
                    f"  <div class=\"poem\">",
                    *[f"    {chunk}" for chunk in stanza_chunks],
                    "  </div>",
                    "</section>",
                ]
            )
        )

    toc_items = "\n".join(
        f'<li><a href="#{slugify(canto.title)}">{html.escape(canto.title)}</a></li>' for canto in CANTOS
    )
    sections_html = "\n\n".join(sections)

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{html.escape(TITLE)}</title>
    <meta name="author" content="{html.escape(AUTHOR)}" />
    <meta name="language" content="{html.escape(LANG)}" />
    <link rel="stylesheet" href="lockean-mail.css" />
  </head>
  <body>
    <section class="title-page">
      <img src="cover.png" alt="Cover art for {html.escape(TITLE)}" class="cover" />
      <h1>{html.escape(TITLE)}</h1>
      <p class="subtitle">{html.escape(SUBTITLE)}</p>
      <p class="credit">By {html.escape(AUTHOR)}</p>
    </section>

    <section class="inside-cover">
      <h2>Inside Cover</h2>
      <p><strong>{html.escape(TITLE)}</strong></p>
      <p>{html.escape(SUBTITLE)}</p>
      <p>By {html.escape(AUTHOR)}</p>
      <p>First digital edition.</p>
    </section>

    <nav class="toc">
      <h2>Table of Contents</h2>
      <ol>
        {toc_items}
      </ol>
    </nav>

    {sections_html}
  </body>
</html>
"""


def write_html(by_canto: list[list[str]]) -> Path:
    html_path = OUT_DIR / "browser-edition.html"
    html_path.write_text(build_html(by_canto), encoding="utf-8")
    return html_path


def write_css() -> Path:
    css_path = OUT_DIR / "lockean-mail.css"
    css_path.write_text(
        """body {
  font-family: Georgia, serif;
  line-height: 1.34;
  margin: 5%;
  color: #171717;
}

h1,
h2,
.subtitle,
.credit {
  text-align: center;
}

.title-page {
  page-break-after: always;
}

.inside-cover {
  page-break-after: always;
  text-align: center;
}

.cover {
  display: block;
  margin: 0 auto 2rem;
  width: 100%;
  max-width: 32rem;
}

.subtitle {
  font-size: 1.05rem;
  margin-top: 0.5rem;
}

.credit {
  font-size: 0.95rem;
  color: #444;
}

.toc {
  page-break-after: always;
}

.poem {
  margin-top: 1.25rem;
}

.line {
  margin: 0;
  text-indent: 0;
  display: flex;
  gap: 0.8rem;
}

.ln {
  min-width: 3.8rem;
  color: #6f6f6f;
  font-family: "Courier New", monospace;
  font-size: 0.88rem;
}

.text {
  flex: 1;
}

.canto {
  page-break-before: always;
}
""",
        encoding="utf-8",
    )
    return css_path


def slugify(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-")


def build_epub(html_path: Path, css_path: Path, cover_path: Path) -> Path:
    epub_path = OUT_DIR / f"{BOOK_SLUG}.epub"
    subprocess.run(
        [
            "pandoc",
            str(html_path),
            "--resource-path",
            str(OUT_DIR),
            "--css",
            str(css_path),
            "--epub-cover-image",
            str(cover_path),
            "--metadata",
            f"title={TITLE}",
            "--metadata",
            f"author={AUTHOR}",
            "--metadata",
            f"lang={LANG}",
            "--metadata",
            "rights=Original poem and cover generated in this repository.",
            "--toc",
            "-o",
            str(epub_path),
        ],
        check=True,
        cwd=ROOT,
    )
    return epub_path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    poem_lines, by_canto = build_poem_lines()
    text_path = write_text_source(poem_lines)
    css_path = write_css()
    html_path = write_html(by_canto)
    svg_path, png_path = write_cover()
    epub_path = build_epub(html_path, css_path, png_path)

    print(f"Wrote {len(poem_lines)} poem lines to {text_path}")
    print(f"Wrote cover assets to {svg_path} and {png_path}")
    print(f"Wrote EPUB to {epub_path}")


if __name__ == "__main__":
    main()
