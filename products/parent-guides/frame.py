"""Scene and end-card frames, 1080x1920, laid out top to bottom:

  progress bar (one segment per step, filling from the right) -> the tag "סרטון עצמאי · נוצר בעזרת AI · ..." ->
  step badge ("שלב" over the number) and the series line, which opens with the brand ("מהודק · מדריך להורים") ->
  title (up to two balanced lines) -> body items (bullets; styles: lead, quote, callout_soft, callout_amber, url,
  plain; a "* " item is a footnote set small at the bottom) -> the scene's illustration, scaled into whatever space
  is left.

Safe zones. Shorts, Reels and TikTok draw their own interface over the video: tabs and icons across the top, and the
caption, channel name, sound ticker and a column of buttons across the bottom and down the right. So nothing is drawn
above SAFE_TOP (180 px) or below SAFE_BOTTOM (H - 420 = 1500 px), and the side margin is 120 px, which keeps text
clear of the right-hand button column. The AI and independence tag sits at the top, under the progress bar, where
no app covers it.

Every text box and the illustration are recorded; a frame reports a problem when a box leaves the side margins or the
vertical safe area, or when two boxes come within 12 px of each other. render.py refuses to assemble a video from
frames with problems.

Layers. scene_layers() draws each part on its own named layer (progress, tag, header, title, item<i> per body item,
illustration) so compose.py can reveal, move and redraw them per video frame; render_scene() composites them into the
settled still, which is the frame the checks above run on and the last frame of the scene in the video.
"""

from __future__ import annotations

import re

import art
from canvas import (AMBER, AMBER_BG, INK, MUTED, SS, TEAL, TEAL_SOFT, TRACK, W, H, Frame, display, measure,
                    metrics, wrap_balanced)
from spec import body_items, end_card_lines, split_title

MARGIN = 120
RIGHT = W - MARGIN
TEXT_W = W - 2 * MARGIN
SAFE_TOP = 180
SAFE_BOTTOM = H - 420
GAP = 12

PROGRESS_Y = 194
TAG_BASE = 258
TAG_SIZE = 28
BADGE_R = 58
HEADER_CY = 350
BODY_SIZES = (52, 48, 44, 40)
MIN_ART_H = 260
FOOT_SIZE = 30
BULLET_INDENT = 38
STYLES = {"bullet", "lead", "quote", "callout_soft", "callout_amber", "url", "plain", "footnote"}
URL = re.compile(r"^[a-z0-9.\-/]+$")


def frame_tag(spec: dict, ai_line: str) -> str:
    """The line on every frame: independence first, then the AI declaration."""
    return f"{spec['independent_tag']} · {ai_line}"


def fit_size(text: str, size: int, min_size: int, weight: int, width: float, engine: str) -> int:
    while size > min_size and measure(text, size, weight, engine) > width:
        size -= 2
    return size


def draw_progress(fr: Frame, filled: float, total: int, y: float, note: bool = True):
    """One segment per step, step 1 at the right. `filled` may be fractional (the motion layer fills the current
    step's segment continuously): a partly filled segment is teal from its right end, with a rounded head."""
    gap, h = 14, 10
    seg = (TEXT_W - gap * (total - 1)) / total
    for i in range(total):  # i = 0 is step 1, at the right edge
        x1 = RIGHT - i * (seg + gap)
        f = min(1.0, max(0.0, filled - i))
        fr.rrect((x1 - seg, y, x1, y + h), h / 2, fill=TEAL if f >= 1 else TRACK)
        if 0 < f < 1 and seg * f * SS >= 1:
            wf = seg * f
            fr.rrect((x1 - wf, y, x1, y + h), min(h, wf) / 2, fill=TEAL)
    if note:
        fr.note("progress", (MARGIN, y, RIGHT, y + h))


PROGRESS_STRIP = (0, PROGRESS_Y - 4, W, PROGRESS_Y + 14)  # the band the progress bar occupies, alone


def progress_strip(filled: float, total: int, engine: str):
    """The progress band as an opaque 1x image over paper, for pasting at PROGRESS_STRIP[:2] on every video frame.
    Drawn at the same supersampling phase as a full frame, so an integer fill matches render_scene's pixels."""
    x0, y0, x1, y1 = PROGRESS_STRIP
    fr = Frame(engine, size=(x1 - x0, y1 - y0))
    draw_progress(fr, filled, total, PROGRESS_Y - y0, note=False)
    return fr.final()


def draw_badge(fr: Frame, step: int, cx: float, cy: float, r: float):
    fr.circle(cx, cy, r, fill=TEAL)
    fr.note("badge", (cx - r, cy - r, cx + r, cy + r))
    fr.text((cx, cy - 18), "שלב", 27, 500, (255, 255, 255), anchor="ms")
    fr.text((cx, cy + 40), str(step), 66, 700, (255, 255, 255), anchor="ms", rtl=False)


def draw_series(fr: Frame, spec: dict, x_right: float, cy: float, engine: str):
    """The brand in ink, then the rest of the series line in teal, right to left: "מהודק · מדריך להורים"."""
    brand, series = spec["brand"], spec["series"]
    rest = series[len(brand):].strip()
    size = fit_size(series, 44, 30, 700, x_right - MARGIN, engine)
    bb = fr.text((x_right, cy), brand, size, 800, INK, "brand", anchor="rm", group="header")
    if rest:
        fr.text((bb[0] - measure(" ", size, 600, engine), cy), rest, size, 600, TEAL, "series", anchor="rm",
                group="header")


def item_style(i: int, item: str, styles: dict) -> str:
    if item.startswith("* "):
        return "footnote"
    st = styles.get(str(i), "bullet")
    if st not in STYLES:
        raise ValueError(f"unknown body style {st!r}")
    return st


def plan_block(item: str, style: str, size: int, engine: str) -> dict:
    """Wrap one body item for its style; return lines, font, pitch and height (no drawing)."""
    weight, color, width, pad, rtl = 400, INK, TEXT_W - BULLET_INDENT, 0, True
    if style == "lead":
        size, weight, width = size + 8, 700, TEXT_W
    elif style == "quote":
        size, weight, width = size + 2, 600, TEXT_W - 40
    elif style in ("callout_soft", "callout_amber"):
        size, pad = size - 2, 28
        width = TEXT_W - 2 * pad
    elif style == "url":
        size, weight, color, width, rtl = size + 4, 600, TEAL, TEXT_W, False
    elif style == "plain":
        width, color = TEXT_W, MUTED
    elif style == "footnote":
        size, color, width = FOOT_SIZE, MUTED, TEXT_W
    text = display(item)
    if rtl:
        # an unbreakable run (a quoted label, a name) wider than the column shrinks the item instead of overflowing
        while True:
            lines = wrap_balanced(text, size, weight, width, engine)
            if size <= 30 or max(measure(ln, size, weight, engine) for ln in lines) <= width:
                break
            size -= 2
    else:
        lines = [text]
        size = fit_size(text, size, 30, weight, width, engine)
    cap, desc = metrics(size, weight, engine)
    pitch = round(size * (1.3 if style == "footnote" else 1.36))
    height = (len(lines) - 1) * pitch + cap + desc + 2 * pad
    return {"style": style, "lines": lines, "size": size, "weight": weight, "color": color, "pitch": pitch,
            "cap": cap, "desc": desc, "pad": pad, "height": height, "rtl": rtl}


def draw_block(fr: Frame, b: dict, top: float, name: str):
    style, pad = b["style"], b["pad"]
    group = None
    if style in ("callout_soft", "callout_amber"):
        box = (MARGIN, top, RIGHT, top + b["height"])
        if style == "callout_amber":
            fr.rrect(box, 24, fill=AMBER_BG, outline=AMBER, width=4)
        else:
            fr.rrect(box, 24, fill=TEAL_SOFT)
        group = name
        fr.note(name, box, group)
    x = RIGHT - pad
    if style in ("bullet",):
        fr.circle(RIGHT - 9, top + b["cap"] * 0.55, 8, fill=TEAL)
        x = RIGHT - BULLET_INDENT
    if style == "quote":
        fr.rrect((RIGHT - 8, top - 4, RIGHT, top + b["height"] + 4), 4, fill=TEAL)
        x = RIGHT - 40
    base = top + pad + b["cap"]
    for j, ln in enumerate(b["lines"]):
        fr.text((x, base + j * b["pitch"]), ln, b["size"], b["weight"], b["color"], f"{name}[{j}]",
                anchor="rs", rtl=b["rtl"], group=group)
    return top + b["height"]


def check(fr: Frame) -> list[str]:
    problems = []
    for name, (x0, y0, x1, y1), _ in fr.boxes:
        if x0 < MARGIN - 1 or x1 > W - MARGIN + 1:
            problems.append(f"{name} outside side margin: x {x0}..{x1}")
        if y0 < SAFE_TOP - 1 or y1 > SAFE_BOTTOM + 1:
            problems.append(f"{name} outside vertical safe area: y {y0}..{y1}")
    for i, (na, a, ga) in enumerate(fr.boxes):
        for nb, b, gb in fr.boxes[i + 1:]:
            if ga is not None and ga == gb:
                continue
            if not (a[2] + GAP <= b[0] or b[2] + GAP <= a[0] or a[3] + GAP <= b[1] or b[3] + GAP <= a[1]):
                problems.append(f"{na} collides with {nb}")
    return problems


def scene_layers(scene: dict, spec: dict, engine: str, ai_line: str, filled: float, total: int):
    """Lay out a scene on named layers: "progress", "tag", "header" (step badge and series line), "title", one
    "item<i>" per body item (footnotes included; i is the item's index in on_screen_body) and "illustration" (a 1x
    layer: the settled picture). Returns (frame, report). The report adds "art" = {kind, labels, box} for the
    motion layer, which redraws the picture per beat inside the same integer box, and "item_boxes"/"title_box"."""
    fr = Frame(engine)
    step, title = split_title(scene["on_screen_title"])
    fr.use("progress")
    draw_progress(fr, filled, total, PROGRESS_Y)
    tag = frame_tag(spec, ai_line)
    fr.use("tag")
    fr.text((RIGHT, TAG_BASE), tag, fit_size(tag, TAG_SIZE, 22, 500, TEXT_W, engine), 500, MUTED, "tag")

    fr.use("header")
    if step is not None:
        bcx = RIGHT - BADGE_R
        draw_badge(fr, step, bcx, HEADER_CY, BADGE_R)
        sx = RIGHT - 2 * BADGE_R - 28
    else:
        sx = RIGHT
    draw_series(fr, spec, sx, HEADER_CY, engine)

    tsize = 92
    while True:
        tlines = wrap_balanced(display(title), tsize, 800, TEXT_W, engine)
        if len(tlines) <= 2 or tsize <= 66:
            break
        tsize -= 2
    cap, desc = metrics(tsize, 800, engine)
    tpitch = round(tsize * 1.16)
    base = HEADER_CY + BADGE_R + 40 + cap
    fr.use("title")
    for j, ln in enumerate(tlines):
        fr.text((RIGHT, base + j * tpitch), ln, tsize, 800, INK, f"title[{j}]")
    title_bottom = base + (len(tlines) - 1) * tpitch + desc

    styles = scene.get("layout", {}).get("styles", {})
    items = body_items(scene)
    kinds = [item_style(i, it, styles) for i, it in enumerate(items)]

    body_top = title_bottom + 48
    chosen = None
    for size in BODY_SIZES:
        blocks = [plan_block(it, k, size, engine) | {"item": i}
                  for i, (it, k) in enumerate(zip(items, kinds)) if k != "footnote"]
        feet = [plan_block(it, k, size, engine) | {"item": i}
                for i, (it, k) in enumerate(zip(items, kinds)) if k == "footnote"]
        body_h = sum(b["height"] for b in blocks) + 30 * max(0, len(blocks) - 1)
        foot_h = sum(b["height"] for b in feet) + 16 * max(0, len(feet) - 1)
        floor = SAFE_BOTTOM - (foot_h + 40 if feet else 0)
        slot = floor - (body_top + body_h) - 2 * 44
        chosen = (size, blocks, feet, body_h, foot_h, floor, slot)
        if slot >= MIN_ART_H:
            break
    size, blocks, feet, body_h, foot_h, floor, slot = chosen

    y = body_top
    for bi, b in enumerate(blocks):
        fr.use(f"item{b['item']}")
        y = draw_block(fr, b, y, f"body{bi}") + 30
    body_bottom = y - 30
    fy = SAFE_BOTTOM - foot_h
    for k, b in enumerate(feet):
        fr.use(f"item{b['item']}")
        fy = draw_block(fr, b, fy, f"footnote{k}") + 16

    ill = scene.get("illustration")
    art_box, art_spec = None, None
    if ill:
        top, bottom = body_bottom + 44, floor - 44
        labels = ill.get("labels", [])
        lw, lh = art.nominal_size(ill["kind"])
        scale = min(TEXT_W / lw, (bottom - top) / lh, 1.1)
        if scale * lh >= 180:
            w, h = round(lw * scale), round(lh * scale)
            x0, y0 = round((W - w) / 2), round(top + (bottom - top - h) / 2)
            art_box = (x0, y0, x0 + w, y0 + h)
            art_spec = {"kind": ill["kind"], "labels": labels, "box": art_box}
            fr.add_layer_1x("illustration", art.render(ill["kind"], engine, labels, w, h), x0, y0)
            fr.note("illustration", art_box)
    problems = check(fr)
    if len(tlines) > 2:
        problems.append(f"title needs {len(tlines)} lines at {tsize}px; shorten it")
    if ill and art_box is None:
        problems.append(f"illustration {ill['kind']!r} omitted: only {slot:.0f} px left")

    def union(bs):
        return [min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)]

    item_boxes: dict[int, list] = {}
    item_lines: dict[int, list] = {}  # each body item's text lines, top first (for the highlight marker)
    for prefix, group in (("body", blocks), ("footnote", feet)):
        for k, b in enumerate(group):
            item_boxes[b["item"]] = union([bx for n, bx, _ in fr.boxes
                                           if n == f"{prefix}{k}" or n.startswith(f"{prefix}{k}[")])
            item_lines[b["item"]] = [list(bx) for n, bx, _ in fr.boxes if n.startswith(f"{prefix}{k}[")]
    report = {"engine": engine, "body_size": size, "title_size": tsize, "title_lines": tlines,
              "body_lines": [b["lines"] for b in blocks], "footnotes": [b["lines"] for b in feet],
              "illustration_box": list(art_box) if art_box else None,
              "boxes": [(n, list(b)) for n, b, _ in fr.boxes],
              "item_boxes": dict(sorted(item_boxes.items())),
              "item_lines": dict(sorted(item_lines.items())),
              "title_box": union([bx for n, bx, _ in fr.boxes if n.startswith("title[")]),
              "art": art_spec, "texts": dict(fr.texts), "problems": problems}
    return fr, report


def render_scene(scene: dict, spec: dict, engine: str, ai_line: str, filled: float, total: int):
    """The settled frame of a scene (every text revealed, every beat at rest) and its layout report."""
    fr, report = scene_layers(scene, spec, engine, ai_line, filled, total)
    return fr.final(), report


def render_end_card(spec: dict, engine: str, ai_line: str):
    """The brand wordmark and the end-card lines, centred inside the safe area. The AI line is swapped for the silent
    wording when the video has no narration, so the card never claims a synthetic voice that is not there. A line
    that is a bare address (support.google.com/youtubekids) is set left to right in the accent colour."""
    fr = Frame(engine)
    fr.use("card")
    lines = end_card_lines(spec)
    brand, rest = lines[0], lines[1:]
    rest = [ai_line if ln == spec["ai_line"] else ln for ln in rest]
    fr.text((W / 2, 520), brand, 168, 800, INK, "wordmark", anchor="ms")
    fr.rrect((W / 2 - 60, 590, W / 2 + 60, 598), 4, fill=TEAL)
    y = 680
    for i, ln in enumerate(rest):
        url = bool(URL.match(ln))
        size, weight, color = (40, 700, TEAL) if ln == ai_line else ((38, 600, TEAL) if url else (34, 400, INK))
        if url:
            wrapped = [ln]
            size = fit_size(ln, size, 26, weight, TEXT_W, engine)
        else:
            wrapped = wrap_balanced(display(ln), size, weight, TEXT_W, engine)
        cap, desc = metrics(size, weight, engine)
        pitch = round(size * 1.4)
        for j, wl in enumerate(wrapped):
            fr.text((W / 2, y + cap + j * pitch), wl, size, weight, color, f"card{i}[{j}]", anchor="ms", rtl=not url)
        y += cap + desc + (len(wrapped) - 1) * pitch + (24 if url else 40)
    report = {"engine": engine, "texts": dict(fr.texts), "boxes": [(n, list(b)) for n, b, _ in fr.boxes],
              "problems": check(fr)}
    return fr.final(), report
