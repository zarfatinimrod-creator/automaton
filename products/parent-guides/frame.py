"""Scene and end-card frames, 1080x1920, laid out top to bottom:

  progress bar (one segment per step, filling from the right) -> step badge ("שלב" over the number) and the
  series line -> title (up to two balanced lines) -> body items (bullets; styles: lead, quote, callout_soft,
  callout_amber, url, plain; a "* " item is a footnote set small above the brand) -> the scene's illustration,
  scaled into whatever space is left -> brand "מהודק" and the AI line, on every frame.

Every text box and the illustration are recorded; a frame reports a problem when a box leaves the 96 px side
margin or the vertical safe area, or when two boxes come within 12 px of each other. render.py refuses to
assemble a video from frames with problems.
"""

from __future__ import annotations

import art
from canvas import (AMBER, AMBER_BG, INK, MUTED, TEAL, TEAL_SOFT, TRACK, W, H, Frame, display, measure,
                    metrics, wrap_balanced)
from spec import body_items, end_card_lines, split_title

MARGIN = 96
RIGHT = W - MARGIN
TEXT_W = W - 2 * MARGIN
SAFE_TOP = 120
SAFE_BOTTOM = H - 220
GAP = 12

BADGE_R = 72
HEADER_CY = 262
BODY_SIZES = (52, 48, 44, 40)
MIN_ART_H = 300
FOOT_SIZE = 30
BULLET_INDENT = 38
STYLES = {"bullet", "lead", "quote", "callout_soft", "callout_amber", "url", "plain", "footnote"}


def fit_size(text: str, size: int, min_size: int, weight: int, width: float, engine: str) -> int:
    while size > min_size and measure(text, size, weight, engine) > width:
        size -= 2
    return size


def draw_progress(fr: Frame, filled: int, total: int, y: float):
    gap, h = 14, 10
    seg = (TEXT_W - gap * (total - 1)) / total
    for i in range(total):  # i = 0 is step 1, at the right edge
        x1 = RIGHT - i * (seg + gap)
        fr.rrect((x1 - seg, y, x1, y + h), h / 2, fill=TEAL if i < filled else TRACK)
    fr.note("progress", (MARGIN, y, RIGHT, y + h))


def draw_badge(fr: Frame, step: int, cx: float, cy: float, r: float):
    fr.circle(cx, cy, r, fill=TEAL)
    fr.note("badge", (cx - r, cy - r, cx + r, cy + r))
    fr.text((cx, cy - 22), "שלב", 30, 500, (255, 255, 255), anchor="ms")
    fr.text((cx, cy + 46), str(step), 76, 700, (255, 255, 255), anchor="ms", rtl=False)


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
    lines = [text] if not rtl else wrap_balanced(text, size, weight, width, engine)
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


def draw_brand(fr: Frame, spec: dict, ai_line: str):
    bb = fr.text((W / 2, SAFE_BOTTOM - 44), spec["brand"], 46, 700, INK, "brand", anchor="ms")
    fr.text((W / 2, SAFE_BOTTOM + 2), ai_line, 30, 400, MUTED, "ai_line", anchor="ms")
    return bb


def check(fr: Frame) -> list[str]:
    problems = []
    for name, (x0, y0, x1, y1), _ in fr.boxes:
        if x0 < MARGIN - 1 or x1 > W - MARGIN + 1:
            problems.append(f"{name} outside side margin: x {x0}..{x1}")
        if y0 < SAFE_TOP - 40 or y1 > H - 160:
            problems.append(f"{name} outside vertical safe area: y {y0}..{y1}")
    for i, (na, a, ga) in enumerate(fr.boxes):
        for nb, b, gb in fr.boxes[i + 1:]:
            if ga is not None and ga == gb:
                continue
            if not (a[2] + GAP <= b[0] or b[2] + GAP <= a[0] or a[3] + GAP <= b[1] or b[3] + GAP <= a[1]):
                problems.append(f"{na} collides with {nb}")
    return problems


def render_scene(scene: dict, spec: dict, engine: str, ai_line: str, filled: int, total: int):
    fr = Frame(engine)
    step, title = split_title(scene["on_screen_title"])
    draw_progress(fr, filled, total, SAFE_TOP + 20)

    if step is not None:
        bcx = RIGHT - BADGE_R
        draw_badge(fr, step, bcx, HEADER_CY, BADGE_R)
        sx = RIGHT - 2 * BADGE_R - 30
    else:
        sx = RIGHT
    series = display(spec["series"])
    fr.text((sx, HEADER_CY), series, fit_size(series, 42, 30, 600, sx - MARGIN, engine), 600, TEAL, "series",
            anchor="rm")

    tsize = 92
    while True:
        tlines = wrap_balanced(display(title), tsize, 800, TEXT_W, engine)
        if len(tlines) <= 2 or tsize <= 66:
            break
        tsize -= 2
    cap, desc = metrics(tsize, 800, engine)
    tpitch = round(tsize * 1.16)
    base = HEADER_CY + BADGE_R + 44 + cap
    for j, ln in enumerate(tlines):
        fr.text((RIGHT, base + j * tpitch), ln, tsize, 800, INK, f"title[{j}]")
    title_bottom = base + (len(tlines) - 1) * tpitch + desc

    brand_bb = draw_brand(fr, spec, ai_line)
    styles = scene.get("layout", {}).get("styles", {})
    items = body_items(scene)
    kinds = [item_style(i, it, styles) for i, it in enumerate(items)]

    body_top = title_bottom + 52
    chosen = None
    for size in BODY_SIZES:
        blocks = [plan_block(it, k, size, engine) for it, k in zip(items, kinds) if k != "footnote"]
        feet = [plan_block(it, k, size, engine) for it, k in zip(items, kinds) if k == "footnote"]
        body_h = sum(b["height"] for b in blocks) + 30 * max(0, len(blocks) - 1)
        foot_h = sum(b["height"] for b in feet) + 16 * max(0, len(feet) - 1)
        floor = brand_bb[1] - 44 - (foot_h + 40 if feet else 0)
        slot = floor - (body_top + body_h) - 2 * 52
        chosen = (size, blocks, feet, body_h, foot_h, floor, slot)
        if slot >= MIN_ART_H:
            break
    size, blocks, feet, body_h, foot_h, floor, slot = chosen

    y = body_top
    bi = 0
    for b in blocks:
        y = draw_block(fr, b, y, f"body{bi}") + 30
        bi += 1
    body_bottom = y - 30
    fy = brand_bb[1] - 44 - foot_h
    for k, b in enumerate(feet):
        fy = draw_block(fr, b, fy, f"footnote{k}") + 16

    ill = scene.get("illustration")
    art_box = None
    if ill:
        top, bottom = body_bottom + 52, floor - 52
        layer = art.illustration(ill["kind"], engine, ill.get("labels", []))
        lw, lh = layer.w, layer.h
        scale = min(TEXT_W / lw, (bottom - top) / lh, 1.1)
        if scale * lh >= 180:
            w, h = lw * scale, lh * scale
            x0, y0 = (W - w) / 2, top + (bottom - top - h) / 2
            art_box = (x0, y0, x0 + w, y0 + h)
            fr.paste_layer(layer.img, art_box)
            fr.note("illustration", art_box)
    problems = check(fr)
    if len(tlines) > 2:
        problems.append(f"title needs {len(tlines)} lines at {tsize}px; shorten it")
    if ill and art_box is None:
        problems.append(f"illustration {ill['kind']!r} omitted: only {slot:.0f} px left")
    report = {"engine": engine, "body_size": size, "title_size": tsize, "title_lines": tlines,
              "body_lines": [b["lines"] for b in blocks], "footnotes": [b["lines"] for b in feet],
              "illustration_box": [round(v) for v in art_box] if art_box else None,
              "texts": dict(fr.texts), "problems": problems}
    return fr.final(), report


def render_end_card(spec: dict, engine: str, ai_line: str):
    """The brand wordmark and the end-card lines, centred. The AI line is swapped for the silent wording when
    the video has no narration, so the card never claims a synthetic voice that is not there."""
    fr = Frame(engine)
    lines = end_card_lines(spec)
    brand, rest = lines[0], lines[1:]
    rest = [ai_line if ln == spec["ai_line"] else ln for ln in rest]
    fr.text((W / 2, 700), brand, 168, 800, INK, "wordmark", anchor="ms")
    fr.rrect((W / 2 - 60, 770, W / 2 + 60, 778), 4, fill=TEAL)
    y = 880
    for i, ln in enumerate(rest):
        size, weight, color = (42, 700, TEAL) if ln == ai_line else (36, 400, INK)
        wrapped = wrap_balanced(display(ln), size, weight, TEXT_W, engine)
        cap, desc = metrics(size, weight, engine)
        pitch = round(size * 1.4)
        for j, wl in enumerate(wrapped):
            fr.text((W / 2, y + cap + j * pitch), wl, size, weight, color, f"card{i}[{j}]", anchor="ms")
        y += cap + desc + (len(wrapped) - 1) * pitch + 44
    report = {"engine": engine, "texts": dict(fr.texts), "problems": check(fr)}
    return fr.final(), report
