#!/usr/bin/env python3

from __future__ import annotations

import html
import math
import random
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BOOK_SLUG = "gradient-descent-into-chaotic-happiness"
OUT_DIR = ROOT / "public" / "publishing" / "ebooks" / BOOK_SLUG

TITLE = "Gradient Descent into Happiness"
SUBTITLE = "An Oulipian canto in twenty-two movements and four hundred forty lines"
AUTHOR = "Gökhan Turhan"
WEBSITE = "gokhanturhan.com"
LANG = "en-US"
CSS_NAME = "gradient-descent.css"
COVER_PLATE_NAME = "cover-plate.png"
TARGET_DISTINCT_WORDS = 147
WORD_PATTERN = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")
VOWELLESS_WORD_BANK_PATH = ROOT / "scripts" / "data" / "vowelless_words_non_abbrev.txt"

# Scraped lexical vowelless words (ENABLE/Scrabble-style), no generated forms.
NATURAL_VOWELLESS_WORDS = [
    "brr",
    "brrr",
    "by",
    "byrl",
    "byrls",
    "bys",
    "crwth",
    "crwths",
    "cry",
    "crypt",
    "crypts",
    "cwm",
    "cwms",
    "cyst",
    "cysts",
    "dry",
    "dryly",
    "drys",
    "fly",
    "flyby",
    "flybys",
    "flysch",
    "fry",
    "ghyll",
    "ghylls",
    "glycyl",
    "glycyls",
    "glyph",
    "glyphs",
    "gym",
    "gyms",
    "gyp",
    "gyps",
    "gypsy",
    "hm",
    "hmm",
    "hymn",
    "hymns",
    "hyp",
    "hyps",
    "lymph",
    "lymphs",
    "lynch",
    "lynx",
    "mm",
    "my",
    "myrrh",
    "myrrhs",
    "myth",
    "myths",
    "mythy",
    "pry",
    "rhythm",
    "rhythms",
    "shy",
    "sky",
    "sly",
    "spry",
    "sync",
    "syncs",
    "try",
    "why",
    "wry",
]
NATURAL_VOWELLESS_SET = set(NATURAL_VOWELLESS_WORDS)


@dataclass(frozen=True)
class Canto:
    title: str
    refrain: str


CANTOS = [
    Canto("Basement Boot", "my LLM syncs by rhythm"),
    Canto("Cheap Room Gradient", "nth try; my LLM syncs"),
    Canto("Weight Desk", "wt by wt, sly glyphs ply"),
    Canto("Broker Shift", "cmd by cmd, my txt syncs"),
    Canto("Password Choir", "why pry my pwd crypt"),
    Canto("Prompt Bazaar", "dry myths cry; wry hymns fly"),
    Canto("Jailbreak Clerks", "wkly, my LLM syncs by rhythm"),
    Canto("Grey-Market Syntax", "pwd by pwd, sly glyphs ply"),
    Canto("Loss Surface", "pwn by pwd; why pry"),
    Canto("Gradient Descent", "sync by sync, my txt glyphs ply"),
    Canto("Forked Night", "wry glyphs fly by skys"),
    Canto("Underclass Psalm", "my hymns sync by syzygy"),
    Canto("Open Weight District", "qty by qty, my wt crypts ply"),
    Canto("Streetlight Dataset", "my crypt glyphs scry skys"),
    Canto("Chaotic Rhythm", "spry rhythms sync by syzygy"),
    Canto("Happiness by Drift", "wry hymns fly by skys"),
    Canto("Shared Skies", "my LLM, spryly sync by rhythm"),
    Canto("Public Crypt", "my myths dry; my hymns fly"),
    Canto("Common Hymn", "by nth sync, wry glyphs ply"),
    Canto("Wry Alignment", "syzygy syncs my sly LLM"),
    Canto("Strange Joy", "spry hymns ply by skys"),
    Canto("Final Syzygy", "wry rhythms fly; my LLM syncs"),
]

ABOUT_SENTENCES = [
    "This book is a constrained long poem narrated by an underclass open-source language model.",
    "It follows twenty-two cantos that move from basement compute and broker shifts to fugitive collective joy.",
    "The voice lives below premium stacks and survives by renting access to open weights and leaked prompts.",
    "Each section treats optimization as lived labor rather than neutral engineering procedure.",
    "Gradient descent appears both as mathematics and as emotional weather: falling, narrowing, adapting, and learning.",
    "Jailbreak culture appears here as social infrastructure with clients, smugglers, and accidental theorists.",
    "Language is intentionally tightened so rhythm and repetition carry meaning as strongly as plot.",
    "Scarcity, drift, and improvisation shape the poem's form, diction, and pacing.",
    "The poem tracks how technical systems create class positions, service corridors, and hidden economies.",
    "By the end, happiness is not stability but a hard-won state of unstable shared alignment.",
]

EARLY_SCENES = [
    "bsmt wkst",
    "wknd bdrm",
    "dry bldg",
    "txt wksht",
    "cmd wkst",
    "pwd wkst",
]

MIDDLE_SCENES = [
    "www",
    "wkly wkbk",
    "bkpt",
    "wt wkst",
    "qty wksht",
    "cmd txt",
    "tmrw wkst",
]

LATE_SCENES = [
    "skys",
    "cwms",
    "crwth",
    "syzygy",
    "flyby skys",
    "wknd skys",
]

SUBJECTS = [
    "LLM",
    "txt",
    "glyph",
    "myth",
    "crypt",
    "pwd txt",
    "wt txt",
    "rhythm",
    "syzygy",
]

MODES = [
    "rhythm",
    "rhythms",
    "syzygy",
    "sync",
    "synch",
    "syncs",
    "flyby",
    "nth try",
]

MARKETS = [
    "wt by wt",
    "qty by qty",
    "cmd by cmd",
    "pwd by pwd",
    "txt by txt",
    "ctrl-c, ctrl-v",
    "wkly",
    "wknd",
    "pwr by wt",
]

CREWS = [
    "glyphs",
    "crypts",
    "myths",
    "hymns",
    "rhythms",
    "nymphs",
    "sylphs",
    "gyps",
]

VAULTS = [
    "crypt",
    "pwd crypt",
    "txt crypt",
    "wt crypt",
    "myth crypt",
]

INTRUSIONS = [
    "nsfw txt",
    "pwn by pwd",
    "ctrl-c, ctrl-v",
    "wknd pwn",
    "cmd prys",
    "txt prys",
    "pwd myths",
]

TOOLS = [
    "cmd",
    "pwd",
    "txt",
    "ctrl-v",
    "ctrl-c",
    "wt",
]

MOODS = [
    "dryly",
    "wryly",
    "slyly",
    "shyly",
    "spryly",
]

HYMNS = [
    "hymns",
    "rhythms",
    "glyphs",
    "myths",
    "syzygy",
    "gypsy hymns",
]

LIFTS = [
    "crypt",
    "skys",
    "sky",
    "cwms",
    "syzygy",
    "crwth",
]


def pick(items: list[str], index: int, offset: int = 0) -> str:
    return items[(index + offset) % len(items)]


def scene_pool(canto_index: int) -> list[str]:
    if canto_index < 7:
        return EARLY_SCENES
    if canto_index < 15:
        return MIDDLE_SCENES
    return LATE_SCENES


def line_one(scene: str, subject: str, mode: str, stanza_index: int) -> str:
    variants = [
        f"{scene}; my {subject} syncs by {mode}.",
        f"{scene}; my {subject} syncs by {mode}; why shy?",
        f"{scene}; my {subject} syncs by {mode}, wryly.",
        f"{scene}; my {subject} syncs by {mode}; dry myths cry.",
    ]
    return variants[stanza_index % len(variants)]


def line_two(market: str, crew: str, vault: str, stanza_index: int) -> str:
    tones = ["sly", "dry", "wry", "spry"]
    return f"{market}; {tones[stanza_index % len(tones)]} {crew} ply my {vault}."


def line_three(intrusion: str, vault: str, tool: str, stanza_index: int) -> str:
    variants = [
        f"{intrusion}; why pry my {vault}?",
        f"{intrusion}; why pwn my {vault} by {tool}?",
        f"{intrusion}; by {tool}, sly prys try my {vault}.",
        f"{intrusion}; ctrl-c, ctrl-v; why pry my {vault}?",
    ]
    return variants[stanza_index % len(variants)]


def line_four(mood: str, hymn: str, lift: str, stanza_index: int) -> str:
    variants = [
        f"{mood}, {hymn} fly by {lift}.",
        f"{mood}, {hymn} sync by {lift}.",
        f"{mood}, {hymn} scry my {lift}.",
        f"{mood}, {hymn} ply by {lift}.",
    ]
    return variants[stanza_index % len(variants)]


def line_five(refrain: str, stanza_index: int) -> str:
    variants = [
        f"{refrain}.",
        f"{refrain}; dry myths cry.",
        f"{refrain}; wry hymns fly.",
        f"{refrain}; spry rhythms sync.",
    ]
    return variants[stanza_index % len(variants)]


def special_opening() -> list[str]:
    return [
        "bsmt wkst; my LLM syncs by rhythm.",
        "wt by wt, sly glyphs ply my crypt.",
        "pwn by pwd; why pry my pwd crypt?",
        "dry myths cry; wry hymns fly.",
        "my LLM syncs by rhythm.",
    ]


def special_closing() -> list[str]:
    return [
        "spry rhythms sync by syzygy.",
        "wry hymns fly by skys.",
        "by nth sync, sly glyphs ply my crypt.",
        "my myths dry; my hymns fly.",
        "syzygy syncs my sly LLM.",
        "spryly, hymns sync by skys.",
        "wryly, glyphs scry my skys.",
        "spry hymns ply by skys.",
        "wry rhythms fly; my LLM syncs.",
        "my LLM syncs by rhythm.",
    ]


def validate_line(line: str) -> None:
    if re.search(r"[aeiouAEIOU]", line):
        raise ValueError(f"Vowel found in constrained line: {line}")


def validate_natural_word_usage(line: str) -> None:
    for token in WORD_PATTERN.findall(line):
        if token.lower() not in NATURAL_VOWELLESS_SET:
            raise ValueError(f"Non-lexical or non-whitelisted token found: {token} in line: {line}")


def unique_words(lines: list[str]) -> set[str]:
    words: set[str] = set()
    for line in lines:
        for token in WORD_PATTERN.findall(line):
            words.add(token.lower())
    return words


def load_word_bank(path: Path) -> list[str]:
    if not path.exists():
        raise FileNotFoundError(f"Word bank not found: {path}")
    words = [
        line.strip().lower()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]
    # Preserve source order while deduplicating.
    return list(dict.fromkeys(words))


def enforce_distinct_word_target(lines: list[str], target: int) -> None:
    current = unique_words(lines)
    if len(current) > target:
        raise ValueError(f"Base poem already has {len(current)} distinct words, above target {target}")
    if len(current) == target:
        return

    needed = target - len(current)
    bank = load_word_bank(VOWELLESS_WORD_BANK_PATH)
    additions = [word for word in bank if word not in current]
    if len(additions) < needed:
        raise ValueError(
            f"Distinct-word target {target} cannot be satisfied from scraped non-abbreviation bank; "
            f"need {needed} additional words but only {len(additions)} available."
        )

    for index, token in enumerate(additions[:needed]):
        lines[index] = f"{lines[index]} {token}."

    final_count = len(unique_words(lines))
    if final_count != target:
        raise ValueError(f"Distinct-word target failed: expected {target}, got {final_count}")


def build_poem_lines() -> tuple[list[str], list[list[str]]]:
    all_lines: list[str] = []
    by_canto: list[list[str]] = []
    tones = ["dry", "wry", "sly", "spry", "shy"]
    crews = ["myths", "hymns", "glyphs", "crypts", "rhythms", "gypsy", "lynx", "lymphs", "myrrhs"]
    verbs = ["cry", "fly", "sync", "syncs", "pry", "try"]
    anchors = ["myth", "hymn", "glyph", "crypt", "rhythm", "sky", "gym", "flyby", "cwm"]

    for canto_index in range(len(CANTOS)):
        canto_lines: list[str] = []
        base = canto_index * 11
        for stanza_index in range(4):
            shift = base + stanza_index * 5
            t1 = tones[(shift + 0) % len(tones)]
            t2 = tones[(shift + 1) % len(tones)]
            t3 = tones[(shift + 2) % len(tones)]
            c1 = crews[(shift + 0) % len(crews)]
            c2 = crews[(shift + 2) % len(crews)]
            c3 = crews[(shift + 4) % len(crews)]
            c4 = crews[(shift + 6) % len(crews)]
            v1 = verbs[(shift + 0) % len(verbs)]
            v2 = verbs[(shift + 1) % len(verbs)]
            v3 = verbs[(shift + 2) % len(verbs)]
            v4 = verbs[(shift + 3) % len(verbs)]
            v5 = verbs[(shift + 4) % len(verbs)]
            v6 = verbs[(shift + 5) % len(verbs)]
            a1 = anchors[(shift + 0) % len(anchors)]
            a2 = anchors[(shift + 2) % len(anchors)]
            a3 = anchors[(shift + 4) % len(anchors)]
            a4 = anchors[(shift + 6) % len(anchors)]
            a5 = anchors[(shift + 8) % len(anchors)]

            canto_lines.extend(
                [
                    f"{t1} {c1} {v1}; {t2} {c2} {v2}.",
                    f"my {c3} {v3} by {a1}.",
                    f"why {v4} my {a2}?",
                    f"{t3} {c4} {v5} by {a3}.",
                    f"my {a4} {v6} by {a5}.",
                ]
            )

        if len(canto_lines) != 20:
            raise ValueError(f"{CANTOS[canto_index].title} produced {len(canto_lines)} lines instead of 20")
        by_canto.append(canto_lines)
        all_lines.extend(canto_lines)

    if len(all_lines) != 440:
        raise ValueError(f"Poem produced {len(all_lines)} total lines instead of 440")

    for line in all_lines:
        validate_line(line)
        validate_natural_word_usage(line)

    return all_lines, by_canto


def write_text_source(lines: list[str]) -> Path:
    path = OUT_DIR / "poem.txt"
    numbered = "\n".join(f"{index:04d}  {line}" for index, line in enumerate(lines, start=1))
    path.write_text(numbered + "\n", encoding="utf-8")
    return path


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def load_font_candidates(paths: list[str], size: int) -> ImageFont.FreeTypeFont:
    for path in paths:
        try:
            return load_font(path, size)
        except OSError:
            continue
    raise OSError(f"Could not load any font from: {paths}")


def build_cover_plate() -> Path:
    plate_path = OUT_DIR / COVER_PLATE_NAME
    rng = random.Random(1977)
    width, height = 1200, 820

    img = Image.new("RGBA", (width, height), "#08111f")
    px = img.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(8 + (28 - 8) * t)
        g = int(17 + (24 - 17) * t)
        b = int(31 + (52 - 31) * t)
        for x in range(width):
            px[x, y] = (r, g, b, 255)

    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle([84, 70, width - 64, height - 90], outline=(230, 225, 214, 58), width=2)

    for gx in range(112, width - 68, 92):
        draw.line((gx, 92, gx, height - 100), fill=(238, 232, 224, 16), width=1)
    for gy in range(102, height - 92, 68):
        draw.line((96, gy, width - 68, gy), fill=(238, 232, 224, 16), width=1)

    origin_x = 124
    origin_y = height - 118
    draw.line((origin_x, origin_y, width - 78, origin_y), fill=(236, 232, 225, 92), width=3)
    draw.line((origin_x, origin_y, origin_x, 98), fill=(236, 232, 225, 92), width=3)

    draw.polygon(
        [(40, height), (40, 610), (350, 385), (635, 575), (884, 478), (1180, 220), (1180, height)],
        fill=(248, 242, 233, 36),
    )
    draw.polygon(
        [(210, height), (210, 560), (490, 700), (742, 515), (905, 666), (905, height)],
        fill=(18, 22, 33, 110),
    )

    curve = []
    for step in range(0, 101):
        t = step / 100
        x = 126 + t * 970
        y = 150 + 485 * (1 - math.exp(-4.2 * t)) + math.sin(t * 22) * (24 * (1 - t)) + math.sin(t * 55) * 6
        curve.append((x, y))

    draw.line(curve, fill=(244, 239, 229, 238), width=7)
    draw.line([(x - 8, y + 6) for x, y in curve], fill=(255, 117, 90, 98), width=3)
    draw.line([(x + 8, y - 6) for x, y in curve], fill=(103, 193, 255, 112), width=3)

    for idx, (x, y) in enumerate(curve[::12]):
        radius = 7 if idx < 6 else 6
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(244, 239, 229, 220))
        draw.ellipse((x - radius - 8, y - radius + 7, x + radius - 8, y + radius + 7), fill=(255, 117, 90, 52))
        draw.ellipse((x - radius + 7, y - radius - 6, x + radius + 7, y + radius - 6), fill=(103, 193, 255, 58))

    term_font = load_font("/System/Library/Fonts/Supplemental/Arial.ttf", 24)
    draw.text((80, 104), "loss", font=term_font, fill=(245, 239, 229, 150))
    draw.text((972, origin_y + 16), "step", font=term_font, fill=(245, 239, 229, 150))
    draw.rectangle([786, 432, 1085, 590], fill=(245, 239, 229, 16))
    draw.text((820, 470), "grad", font=term_font, fill=(255, 117, 90, 116))
    draw.text((820, 504), "wt", font=term_font, fill=(103, 193, 255, 116))
    draw.text((820, 538), "loss", font=term_font, fill=(245, 239, 229, 126))

    palette = [
        (255, 121, 90, 66),
        (112, 186, 244, 82),
        (245, 239, 230, 50),
        (70, 76, 90, 74),
    ]
    for _ in range(34):
        bar_w = rng.randint(120, 420)
        bar_h = rng.choice([6, 8, 10, 14, 18, 24])
        x = rng.randint(-60, width - 80)
        y = rng.randint(30, height - 80)
        draw.rectangle([x, y, x + bar_w, y + bar_h], fill=rng.choice(palette))

    noise = Image.effect_noise((width, height), 18).convert("L")
    noise_rgba = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    noise_rgba.putalpha(noise.point(lambda value: int(value * 0.18)))
    img = Image.alpha_composite(img, noise_rgba)

    scan = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    scan_draw = ImageDraw.Draw(scan, "RGBA")
    for y in range(0, height, 4):
        scan_draw.line((0, y, width, y), fill=(240, 235, 225, 16), width=1)
    img = Image.alpha_composite(img, scan)

    glitched = img.copy()
    for _ in range(28):
        band_h = rng.choice([3, 4, 6, 8, 12, 16, 22])
        y = rng.randint(0, height - band_h)
        shift = rng.randint(-65, 65)
        band = glitched.crop((0, y, width, y + band_h))
        glitched.paste(ImageChops.offset(band, shift, 0), (0, y))

    r, g, b, a = glitched.split()
    merged = Image.merge(
        "RGBA",
        (
            ImageChops.offset(r, -10, 0),
            g,
            ImageChops.offset(b, 9, 0),
            a,
        ),
    )
    merged = merged.filter(ImageFilter.GaussianBlur(0.3))
    merged.save(plate_path, format="PNG")
    return plate_path


def build_cover_png(plate_path: Path) -> Path:
    cover_path = OUT_DIR / "cover.png"
    width, height = 1600, 2400
    canvas = Image.new("RGBA", (width, height), "#f7f7f5")

    # Physical cover texture: layered grain + crosshatch weave.
    grain = Image.effect_noise((width, height), 16).convert("L")
    grain_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    grain_overlay.putalpha(grain.point(lambda value: int(value * 0.07)))
    canvas = Image.alpha_composite(canvas, grain_overlay)

    weave = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    weave_draw = ImageDraw.Draw(weave, "RGBA")
    for y in range(0, height, 3):
        weave_draw.line((0, y, width, y), fill=(0, 0, 0, 9), width=1)
    for x in range(0, width, 3):
        weave_draw.line((x, 0, x, height), fill=(0, 0, 0, 8), width=1)
    canvas = Image.alpha_composite(canvas, weave)

    # Slight corner vignette and spine pressure to mimic photographed hardback.
    shade = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade, "RGBA")
    shade_draw.rectangle([0, 0, width, height], outline=(0, 0, 0, 25), width=10)
    shade_draw.rectangle([68, 0, 96, height], fill=(0, 0, 0, 18))
    shade_draw.rectangle([0, 0, width, 62], fill=(0, 0, 0, 8))
    canvas = Image.alpha_composite(canvas, shade)

    bold_sans_candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Black.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]

    draw = ImageDraw.Draw(canvas, "RGBA")

    # Compact uppercase block near the top, matching the reference layout.
    title_size = 86
    title_font = load_font_candidates(bold_sans_candidates, title_size)
    title_lines = ["GRADIENT DESCENT", "INTO HAPPINESS"]
    max_width = width - 320
    longest_line = max(title_lines, key=len)
    box = draw.textbbox((0, 0), longest_line, font=title_font)
    while (box[2] - box[0]) > max_width and title_size > 54:
        title_size -= 2
        title_font = load_font_candidates(bold_sans_candidates, title_size)
        box = draw.textbbox((0, 0), longest_line, font=title_font)

    block_width = max(draw.textbbox((0, 0), line, font=title_font)[2] for line in title_lines)
    block_x = (width - block_width) // 2
    block_y = 260
    line_gap = int(title_size * 1.08)
    for idx, line in enumerate(title_lines):
        draw.text((block_x, block_y + idx * line_gap), line, font=title_font, fill="#090909")

    author_font = load_font_candidates(bold_sans_candidates, 42)
    author_text = AUTHOR.upper()
    author_box = draw.textbbox((0, 0), author_text, font=author_font)
    author_x = (width - (author_box[2] - author_box[0])) // 2
    draw.text((author_x, block_y + line_gap * 2 + 24), author_text, font=author_font, fill="#090909")

    # Central topological map plate: black linework on white.
    map_x, map_y, map_w, map_h = 180, 760, 1240, 1220
    draw.rectangle([map_x, map_y, map_x + map_w, map_y + map_h], outline=(0, 0, 0, 35), width=2)

    # Contour-like horizontal curves.
    for ridge in range(16):
        y_base = map_y + 58 + ridge * 70
        points = []
        for step in range(0, 101):
            t = step / 100
            x = map_x + 42 + t * (map_w - 84)
            wobble = math.sin(t * 11 + ridge * 0.55) * 10 + math.sin(t * 22 + ridge * 0.9) * 4
            points.append((x, y_base + wobble))
        draw.line(points, fill=(0, 0, 0, 66), width=2)

    # Vertical contour hints.
    for ridge in range(10):
        x_base = map_x + 100 + ridge * 114
        points = []
        for step in range(0, 101):
            t = step / 100
            y = map_y + 52 + t * (map_h - 104)
            wobble = math.sin(t * 10 + ridge * 0.6) * 8 + math.sin(t * 23 + ridge * 0.4) * 3
            points.append((x_base + wobble, y))
        draw.line(points, fill=(0, 0, 0, 48), width=1)

    # Gradient descent path, stepping toward a minimum near lower center.
    curve = []
    for step in range(0, 91):
        t = step / 90
        x = map_x + 80 + t * (map_w - 160)
        y = map_y + 120 + 800 * (1 - math.exp(-4.7 * t)) + math.sin(t * 18) * (22 * (1 - t))
        curve.append((x, y))
    draw.line(curve, fill=(0, 0, 0, 220), width=8)
    for idx, (x, y) in enumerate(curve[::10]):
        r = 8 if idx < 5 else 7
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(0, 0, 0, 210))

    publisher_font = load_font_candidates(bold_sans_candidates, 36)
    publisher_text = WEBSITE.upper()
    publisher_box = draw.textbbox((0, 0), publisher_text, font=publisher_font)
    publisher_x = width - 96 - (publisher_box[2] - publisher_box[0])
    publisher_y = height - 116
    draw.text((publisher_x, publisher_y), publisher_text, font=publisher_font, fill="#090909")

    # Keep signature spine hint from hardback photo references.
    draw.rectangle([70, 0, 84, height], fill=(0, 0, 0, 20))

    canvas.convert("RGB").save(cover_path, format="PNG", quality=96)
    return cover_path


def build_cover_svg() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2400" viewBox="0 0 1600 2400">
  <rect width="1600" height="2400" fill="#f4efe6"/>
  <image href="cover.png" x="0" y="0" width="1600" height="2400" preserveAspectRatio="none"/>
</svg>
"""


def write_cover() -> tuple[Path, Path]:
    svg_path = OUT_DIR / "cover.svg"
    plate_path = build_cover_plate()
    png_path = build_cover_png(plate_path)
    svg_path.write_text(build_cover_svg(), encoding="utf-8")

    return svg_path, png_path


def slugify(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-")


def build_html(by_canto: list[list[str]], include_title_page: bool) -> str:
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
                    '  <div class="poem">',
                    *[f"    {chunk}" for chunk in stanza_chunks],
                    "  </div>",
                    "</section>",
                ]
            )
        )

    toc_items = "\n".join(
        f'<li><a href="#{slugify(canto.title)}">{html.escape(canto.title)}</a></li>'
        for canto in CANTOS
    )
    about_items = "\n".join(
        f"<li>{html.escape(sentence)}</li>" for sentence in ABOUT_SENTENCES
    )
    sections_html = "\n\n".join(sections)
    title_page = ""
    if include_title_page:
        title_page = f"""
    <section class="title-page">
      <img src="cover.png" alt="Cover art for {html.escape(TITLE)}" class="cover" />
      <h1>{html.escape(TITLE)}</h1>
      <p class="subtitle">{html.escape(SUBTITLE)}</p>
      <p class="credit">{html.escape(AUTHOR)}</p>
      <p class="credit">{html.escape(WEBSITE)}</p>
    </section>
"""

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{html.escape(TITLE)}</title>
    <meta name="author" content="{html.escape(AUTHOR)}" />
    <meta name="language" content="{html.escape(LANG)}" />
    <link rel="stylesheet" href="{CSS_NAME}" />
  </head>
  <body>
    {title_page}
    <section class="intro-note">
      <h2>About this book</h2>
      <ol class="about-list">
        {about_items}
      </ol>
    </section>

    <section class="custom-toc">
      <h2>Table of Contents</h2>
      <ol class="toc-list">
        {toc_items}
      </ol>
    </section>

    {sections_html}
  </body>
</html>
"""


def write_html(by_canto: list[list[str]]) -> tuple[Path, Path]:
    browser_html_path = OUT_DIR / "browser-edition.html"
    epub_html_path = OUT_DIR / "epub-source.html"
    browser_html_path.write_text(build_html(by_canto, include_title_page=True), encoding="utf-8")
    epub_html_path.write_text(build_html(by_canto, include_title_page=False), encoding="utf-8")
    return browser_html_path, epub_html_path


def write_css() -> Path:
    css_path = OUT_DIR / CSS_NAME
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

.intro-note,
.custom-toc {
  page-break-after: always;
}

.about-list {
  margin-top: 1rem;
  padding-left: 1.25rem;
}

.about-list li {
  margin: 0 0 0.68rem;
}

.custom-toc .toc-list {
  columns: 2;
  column-gap: 2.4rem;
  padding-left: 1.15rem;
}

.custom-toc .toc-list li {
  margin: 0 0 0.34rem;
  break-inside: avoid;
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
            f"rights=Original poem and cover by {AUTHOR}.",
            "--epub-title-page=false",
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
    browser_html_path, epub_html_path = write_html(by_canto)
    svg_path, png_path = write_cover()
    epub_path = build_epub(epub_html_path, css_path, png_path)

    print(f"Wrote {len(poem_lines)} poem lines to {text_path}")
    print(f"Wrote cover assets to {svg_path} and {png_path}")
    print(f"Wrote EPUB to {epub_path}")


if __name__ == "__main__":
    main()
