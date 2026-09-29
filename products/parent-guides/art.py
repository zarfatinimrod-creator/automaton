"""Generic, abstract illustrations for the parent-guide frames.

Brand safety is the design brief: no logo, no screenshot, no imitation of any app's look, no red, no
play-button triangle, no faces. Phones are plain rounded rectangles; videos are plain coloured tiles; icons
(key, calendar, padlock, magnifier, stopwatch, flag) are built from circles, bars and lines. Layouts are
mirrored for a right-to-left interface: the first thing sits on the right.

Each illustration draws on its own transparent layer at a nominal size; frame.py scales it into the space
left between the body text and the brand line.
"""

from __future__ import annotations

import math

from canvas import (AMBER, AMBER_BG, BAR, DIM, INK, LINE, MUTED, SKY_SOFT, TEAL, TEAL_MID, TEAL_SOFT, WHITE,
                    YELLOW, YELLOW_SOFT, Frame, s, star_points)

# ---------------------------------------------------------------- primitives


def phone(fr: Frame, x0, y0, w, h, screen=WHITE):
    """Plain phone: dark rounded body, screen inset, speaker pill. Returns the screen box."""
    fr.rrect((x0, y0, x0 + w, y0 + h), w * 0.16, fill=INK)
    b = w * 0.04
    sb = (x0 + b, y0 + b, x0 + w - b, y0 + h - b)
    fr.rrect(sb, w * 0.13, fill=screen)
    cx = x0 + w / 2
    fr.rrect((cx - w * 0.12, sb[1] + w * 0.045, cx + w * 0.12, sb[1] + w * 0.085), w * 0.02,
             fill=INK if screen == WHITE else (40, 50, 72))
    return sb


def check_mark(fr: Frame, cx, cy, r, color=WHITE, width=None):
    width = width or max(3, r * 0.28)
    fr.line([(cx - r * 0.45, cy + r * 0.02), (cx - r * 0.12, cy + r * 0.36), (cx + r * 0.5, cy - r * 0.34)],
            color, width, caps=True)


def check_badge(fr: Frame, cx, cy, r, fill=TEAL):
    fr.circle(cx, cy, r, fill=fill)
    check_mark(fr, cx, cy, r * 0.8)


def key_icon(fr: Frame, cx, cy, size, color=TEAL):
    """A plain key: round bow on the right, shaft to the left, two teeth."""
    br = size * 0.24
    bx = cx + size * 0.26
    fr.circle(bx, cy, br, outline=color, width=size * 0.1)
    t = size * 0.1
    x_end = cx - size * 0.48
    fr.rrect((x_end, cy - t / 2, bx - br + t * 0.3, cy + t / 2), t / 2, fill=color)
    fr.rect((x_end, cy, x_end + t, cy + size * 0.2), fill=color)
    fr.rect((x_end + t * 2, cy, x_end + t * 3, cy + size * 0.14), fill=color)


def calendar_icon(fr: Frame, x0, y0, w, h):
    fr.rrect((x0, y0, x0 + w, y0 + h), w * 0.1, fill=WHITE, outline=INK, width=5)
    fr.rrect((x0, y0, x0 + w, y0 + h * 0.26), w * 0.1, fill=TEAL)
    fr.rect((x0, y0 + h * 0.16, x0 + w, y0 + h * 0.26), fill=TEAL)
    for fx in (0.3, 0.7):
        fr.rrect((x0 + w * fx - 6, y0 - 14, x0 + w * fx + 6, y0 + 22), 6, fill=INK)
    cols, rows = 4, 3
    gx0, gy0 = x0 + w * 0.14, y0 + h * 0.4
    dx, dy = w * 0.72 / (cols - 1), h * 0.46 / (rows - 1)
    for r in range(rows):
        for c in range(cols):
            x, y = gx0 + c * dx, gy0 + r * dy
            if (r, c) == (1, 2):
                check_badge(fr, x, y, w * 0.1)
            else:
                fr.circle(x, y, w * 0.035, fill=BAR)


def avatar(fr: Frame, cx, cy, r, shape: str, fill):
    fr.circle(cx, cy, r, fill=fill)
    if shape == "star":
        fr.poly(star_points(cx, cy, r * 0.55, r * 0.23), fill=INK)
    elif shape == "moon":
        fr.circle(cx, cy, r * 0.5, fill=INK)
        fr.circle(cx + r * 0.24, cy - r * 0.16, r * 0.44, fill=fill)
    elif shape == "leaf":
        pts = []
        for i in range(0, 181, 10):  # a pointed oval (vesica), tilted
            a = math.radians(i)
            pts.append((math.cos(a), math.sin(a) * 0.55))
        pts += [(-x, -y) for x, y in pts]
        rot = math.radians(-35)
        pp = [(cx + r * 0.55 * (x * math.cos(rot) - y * math.sin(rot)),
               cy + r * 0.55 * (x * math.sin(rot) + y * math.cos(rot))) for x, y in pts]
        fr.poly(pp, fill=TEAL)
        fr.line([pp[0], pp[len(pp) // 2]], WHITE, 3)
    elif shape == "plus":
        fr.circle(cx, cy, r, fill=WHITE, outline=LINE, width=5)
        t = r * 0.12
        fr.rrect((cx - r * 0.38, cy - t, cx + r * 0.38, cy + t), t, fill=MUTED)
        fr.rrect((cx - t, cy - r * 0.38, cx + t, cy + r * 0.38), t, fill=MUTED)


def radio(fr: Frame, cx, cy, r, on: bool):
    if on:
        fr.circle(cx, cy, r * 1.55, fill=TEAL_MID)  # tap halo
        check_badge(fr, cx, cy, r)
    else:
        fr.circle(cx, cy, r, outline=BAR, width=max(3, r * 0.22))


def magnifier(fr: Frame, cx, cy, r, color=INK, width=None):
    width = width or r * 0.28
    fr.circle(cx, cy, r, outline=color, width=width)
    a = r * 0.72
    fr.line([(cx + a, cy + a), (cx + r * 1.55, cy + r * 1.55)], color, width * 1.2, caps=True)


def slash(fr: Frame, cx, cy, r, color=INK, width=None):
    width = width or r * 0.2
    a = r * 0.9
    fr.line([(cx - a, cy - a), (cx + a, cy + a)], color, width, caps=True)


def ban_icon(fr: Frame, cx, cy, r, color=INK):
    fr.circle(cx, cy, r, outline=color, width=r * 0.2)
    a = r * 0.62
    fr.line([(cx - a, cy + a), (cx + a, cy - a)], color, r * 0.2)


def flag_icon(fr: Frame, cx, cy, size, color=TEAL):
    x = cx - size * 0.3
    fr.line([(x, cy - size * 0.5), (x, cy + size * 0.5)], INK, size * 0.08, caps=True)
    top, bot = cy - size * 0.46, cy + size * 0.02
    fr.poly([(x, top), (cx + size * 0.4, top), (cx + size * 0.2, (top + bot) / 2),
             (cx + size * 0.4, bot), (x, bot)], fill=color)


def padlock(fr: Frame, cx, cy, w, color=TEAL, open_=False, body=None):
    """Body centred on (cx, cy); shackle above it. open_ lifts the shackle's left leg."""
    bh = w * 0.78
    x0, y0, x1, y1 = cx - w / 2, cy - bh / 2, cx + w / 2, cy + bh / 2
    sw = w * 0.13
    sr = w * 0.3
    lift = w * 0.22 if open_ else 0
    top = y0 - sr * 2 - w * 0.04 - lift
    # shackle: a U upside down, legs at cx +- sr
    fr.arc((cx - sr, top, cx + sr, top + 2 * sr), 180, 360, color, sw)
    fr.line([(cx + sr - sw / 2, top + sr), (cx + sr - sw / 2, y0 + 4)], color, sw)
    fr.line([(cx - sr + sw / 2, top + sr), (cx - sr + sw / 2, y0 + 4 - lift * 1.6)], color, sw)
    fr.rrect((x0, y0, x1, y1), w * 0.14, fill=body or color)
    kh = WHITE if (body or color) != WHITE else INK
    fr.circle(cx, cy - bh * 0.06, w * 0.09, fill=kh)
    fr.rrect((cx - w * 0.035, cy - bh * 0.06, cx + w * 0.035, cy + bh * 0.22), w * 0.03, fill=kh)


def toggle(fr: Frame, x0, cy, w, h, on: bool):
    """RTL switch: ON has a teal track with the knob on the left; OFF is grey with the knob on the right."""
    fr.rrect((x0, cy - h / 2, x0 + w, cy + h / 2), h / 2, fill=TEAL if on else BAR)
    kx = x0 + h / 2 if on else x0 + w - h / 2
    fr.circle(kx, cy, h / 2 - 7, fill=WHITE)


def tile(fr: Frame, box, fill, bar=True):
    x0, y0, x1, y1 = box
    th = (y1 - y0) * (0.72 if bar else 1)
    fr.rrect((x0, y0, x1, y0 + th), 14, fill=fill)
    if bar:
        fr.rrect((x1 - (x1 - x0) * 0.78, y0 + th + 12, x1, y0 + th + 26), 7, fill=BAR)


def stopwatch(fr: Frame, cx, cy, r):
    fr.rrect((cx - r * 0.16, cy - r * 1.3, cx + r * 0.16, cy - r * 1.08), r * 0.06, fill=INK)
    fr.rrect((cx - r * 0.06, cy - r * 1.12, cx + r * 0.06, cy - r * 0.9), r * 0.03, fill=INK)
    fr.line([(cx + r * 0.72, cy - r * 0.72), (cx + r * 0.9, cy - r * 0.9)], INK, r * 0.12, caps=True)
    fr.circle(cx, cy, r, fill=WHITE, outline=INK, width=r * 0.12)
    for k in range(12):
        a = math.radians(k * 30)
        r0 = r * (0.7 if k % 3 == 0 else 0.76)
        fr.line([(cx + r0 * math.sin(a), cy - r0 * math.cos(a)),
                 (cx + r * 0.82 * math.sin(a), cy - r * 0.82 * math.cos(a))], BAR if k % 3 else MUTED,
                r * 0.05)
    # a filled sector for the time set, drawn as a fan of thin lines
    fr.d.pieslice((s(cx - r * 0.62), s(cy - r * 0.62), s(cx + r * 0.62), s(cy + r * 0.62)), -90, 30,
                  fill=TEAL_SOFT)
    a = math.radians(120)
    fr.line([(cx, cy), (cx + r * 0.6 * math.sin(a), cy - r * 0.6 * math.cos(a))], TEAL, r * 0.09, caps=True)
    fr.circle(cx, cy, r * 0.09, fill=INK)


def slider(fr: Frame, x0, x1, cy, frac):
    """RTL slider: fills from the right."""
    h = 16
    fr.rrect((x0, cy - h / 2, x1, cy + h / 2), h / 2, fill=BAR)
    kx = x1 - (x1 - x0) * frac
    fr.rrect((kx, cy - h / 2, x1, cy + h / 2), h / 2, fill=TEAL)
    fr.circle(kx, cy, 26, fill=WHITE, outline=TEAL, width=6)


def bubble(fr: Frame, box, text, size=46):
    x0, y0, x1, y1 = box
    fr.poly([(x1 - 70, y1 - 2), (x1 - 30, y1 + 34), (x1 - 26, y1 - 2)], fill=WHITE)
    fr.rrect(box, 26, fill=WHITE)
    fr.line([(x1 - 70, y1), (x1 - 30, y1 + 34), (x1 - 26, y1)], TEAL, 5)
    fr.rrect(box, 26, outline=TEAL, width=5)
    fr.rect((x1 - 66, y1 - 6, x1 - 30, y1 - 1), fill=WHITE)
    fr.text(((x0 + x1) / 2, (y0 + y1) / 2), text, size, 700, INK, anchor="mm")


def kebab(fr: Frame, cx, cy, r, color=INK):
    for dy in (-2.6 * r, 0, 2.6 * r):
        fr.circle(cx, cy + dy, r, fill=color)


def cards_icon(fr: Frame, cx, cy, size):
    w, h = size * 0.9, size * 0.2
    for i, fill in enumerate((WHITE, WHITE, TEAL_SOFT)):
        y = cy - size * 0.36 + i * h * 1.35
        fr.rrect((cx - w / 2, y, cx + w / 2, y + h), h * 0.3, fill=fill, outline=TEAL if i == 2 else LINE,
                 width=4)
        fr.circle(cx + w / 2 - h * 0.55, y + h / 2, h * 0.24, fill=TEAL if i == 2 else BAR)


def checklist_icon(fr: Frame, cx, cy, size):
    w, h = size * 0.78, size
    fr.rrect((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), size * 0.08, fill=WHITE, outline=INK, width=6)
    fr.rrect((cx - w * 0.2, cy - h / 2 - 12, cx + w * 0.2, cy - h / 2 + 16), 8, fill=INK)
    for i in range(3):
        y = cy - h * 0.2 + i * h * 0.22
        check_mark(fr, cx + w * 0.26, y, size * 0.07, TEAL, width=6)
        fr.rrect((cx - w * 0.36, y - 7, cx + w * 0.12, y + 7), 7, fill=BAR)


# ---------------------------------------------------------------- illustrations (one per scene kind)


def _layer(engine, w, h):
    return Frame(engine, size=(w, h), bg=(0, 0, 0, 0), mode="RGBA")


def hook(engine, labels):
    fr = _layer(engine, 760, 760)
    sb = phone(fr, 200, 20, 380, 720)
    fr.rrect((sb[0] + 40, sb[1] + 110, sb[2] - 40, sb[1] + 330), 26, fill=SKY_SOFT)
    for i, wdt in enumerate((230, 170, 200)):
        y = sb[1] + 380 + i * 60
        fr.rrect((sb[2] - 40 - wdt, y, sb[2] - 40, y + 22), 11, fill=BAR)
    label = labels[0] if labels else ""
    fr.circle(580, 190, 150, fill=YELLOW)
    fr.circle(580, 190, 150, outline=WHITE, width=10)
    fr.text((580, 196), label, 190, 800, INK, anchor="mm", rtl=False)
    return fr


def account(engine, labels):
    fr = _layer(engine, 900, 780)
    sb = phone(fr, 500, 20, 380, 740)
    # sign-in card: key and a check, no brand marks
    fr.rrect((sb[0] + 30, sb[1] + 100, sb[2] - 30, sb[1] + 270), 26, fill=TEAL_SOFT)
    key_icon(fr, sb[2] - 110, sb[1] + 185, 120)
    check_badge(fr, sb[0] + 88, sb[1] + 185, 38)
    calendar_icon(fr, sb[0] + 80, sb[1] + 340, 200, 200)
    for i, wdt in enumerate((220, 160)):
        y = sb[1] + 600 + i * 50
        fr.rrect((sb[2] - 36 - wdt, y, sb[2] - 36, y + 20), 10, fill=BAR)
    # profile avatars: shapes, never faces
    for (cx, cy), shape, fill in zip(((350, 150), (150, 150), (350, 360), (150, 360)),
                                     ("star", "moon", "leaf", "plus"),
                                     (TEAL_SOFT, YELLOW_SOFT, SKY_SOFT, WHITE)):
        avatar(fr, cx, cy, 82, shape, fill)
    if labels:
        fr.rrect((110, 510, 390, 610), 50, fill=TEAL)
        fr.text((250, 562), labels[0], 58, 700, WHITE, anchor="mm")
    return fr


def content(engine, labels):
    fr = _layer(engine, 900, 780)
    sb = phone(fr, 470, 20, 400, 740)
    rx0, rx1 = sb[0] + 26, sb[2] - 26
    fr.rrect((rx1 - 170, sb[1] + 90, rx1, sb[1] + 108), 9, fill=MUTED)
    for i, wdt in enumerate((150, 190, 170, 210)):
        y0 = sb[1] + 140 + i * 132
        sel = i == 3
        fr.rrect((rx0, y0, rx1, y0 + 110), 22, fill=TEAL_SOFT if sel else WHITE, outline=TEAL if sel else LINE,
                 width=5 if sel else 3)
        cy = y0 + 55
        radio(fr, rx1 - 46, cy, 20, sel)
        fr.rrect((rx1 - 90 - wdt, cy - 10, rx1 - 90, cy + 10), 10, fill=INK if sel else BAR)
    checklist_icon(fr, 230, 200, 200)
    magnifier(fr, 205, 555, 70, color=MUTED)
    slash(fr, 230, 580, 120, color=INK, width=18)
    return fr


def keypad(fr: Frame, cx, cy, pitch, r):
    """A generic 3x4 keypad of plain dots: says "a code", not how many digits it has."""
    for row in range(4):
        for col in range(3):
            if row == 3 and col != 1:
                continue
            x, y = cx + (col - 1) * pitch, cy + (row - 1.5) * pitch
            fr.circle(x, y, r, fill=WHITE, outline=TEAL, width=5)


def passcode(engine, labels):
    """A padlock over a generic keypad (the code), "או", and a made-up sum card (the multiplication question)."""
    fr = _layer(engine, 900, 560)
    padlock(fr, 720, 200, 150, open_=True)
    keypad(fr, 720, 400, 62, 22)
    sum_label = next((l for l in labels if any(ch.isdigit() for ch in l)), "")
    word = next((l for l in labels if l != sum_label), "")
    fr.text((450, 330), word, 72, 700, MUTED, anchor="mm")
    fr.rrect((40, 230, 360, 430), 30, fill=WHITE, outline=INK, width=6)
    fr.text((200, 332), sum_label, 64, 700, INK, anchor="mm", rtl=False)
    return fr


def search(engine, labels):
    fr = _layer(engine, 900, 640)
    fills = (TEAL_SOFT, YELLOW_SOFT, SKY_SOFT, SKY_SOFT, TEAL_SOFT, YELLOW_SOFT, YELLOW_SOFT, SKY_SOFT, TEAL_SOFT)
    for i, f in enumerate(fills):  # before: a loose grid, on the right
        c, r = i % 3, i // 3
        x1 = 880 - c * 128
        y0 = 40 + r * 150
        tile(fr, (x1 - 112, y0, x1, y0 + 120), f)
    magnifier(fr, 690, 230, 95, color=INK)
    # the switch that turns search off, then an arrow leftwards (RTL reading order)
    toggle(fr, 400, 250, 120, 62, on=False)
    fr.line([(505, 350), (415, 350)], MUTED, 10, caps=True)
    fr.poly([(395, 350), (430, 322), (430, 378)], fill=MUTED)
    # after: fewer tiles, and nothing on them - a tick would read as "checked", which the help center does not say
    for i, f in enumerate((TEAL_SOFT, YELLOW_SOFT, SKY_SOFT, TEAL_SOFT)):
        c, r = i % 2, i // 2
        x1 = 350 - c * 170
        y0 = 150 + r * 190
        tile(fr, (x1 - 150, y0, x1, y0 + 150), f)
    return fr


def history_icon(fr: Frame, cx, cy, r):
    """A clock face with a counter-clockwise arrow: "history"."""
    fr.arc((cx - r, cy - r, cx + r, cy + r), 200, 520, INK, r * 0.14)
    fr.poly([(cx - r * 1.12, cy - r * 0.42), (cx - r * 0.62, cy - r * 0.2), (cx - r * 1.02, cy + r * 0.12)], fill=INK)
    fr.line([(cx, cy), (cx, cy - r * 0.55)], INK, r * 0.12, caps=True)
    fr.line([(cx, cy), (cx + r * 0.4, cy + r * 0.2)], INK, r * 0.12, caps=True)


def history(engine, labels):
    """Left: a few tiles, one of them with an amber "!" (unwanted content can still turn up). Right: the history
    list, its rows struck through (turning search off deletes the profile's watch and search history)."""
    fr = _layer(engine, 900, 600)
    history_icon(fr, 790, 110, 70)
    for i, wdt in enumerate((300, 250, 280, 220)):
        y = 230 + i * 90
        fr.rrect((860 - wdt, y, 860, y + 30), 15, fill=BAR)
        fr.line([(860 - wdt - 14, y + 15), (874, y + 15)], MUTED, 7, caps=True)
    for i, f in enumerate((TEAL_SOFT, SKY_SOFT, YELLOW_SOFT, TEAL_SOFT)):
        c, r = i % 2, i // 2
        x1 = 420 - c * 190
        y0 = 90 + r * 230
        tile(fr, (x1 - 170, y0, x1, y0 + 180), f)
        if i == 1:
            fr.circle(x1 - 30, y0 + 30, 34, fill=AMBER_BG, outline=AMBER, width=6)
            fr.rrect((x1 - 35, y0 + 10, x1 - 25, y0 + 36), 5, fill=AMBER)
            fr.circle(x1 - 30, y0 + 47, 6, fill=AMBER)
    return fr


def timer(engine, labels):
    fr = _layer(engine, 900, 760)
    stopwatch(fr, 230, 250, 150)
    slider(fr, 70, 400, 520, 0.62)
    sb = phone(fr, 500, 20, 380, 720, screen=DIM)
    padlock(fr, (sb[0] + sb[2]) / 2, sb[1] + 250, 130, color=WHITE, body=WHITE)
    if labels:
        bubble(fr, (sb[0] + 20, sb[1] + 420, sb[2] - 20, sb[1] + 530), labels[0], 46)
    return fr


def block(engine, labels):
    """Blocking: a video tile with a generic three-dot button, a plain two-row menu, and the tile greyed out."""
    fr = _layer(engine, 900, 600)
    # the video tile and its generic three-dot button (top corner, left in RTL)
    fr.rrect((470, 30, 870, 270), 24, fill=SKY_SOFT)
    fr.rrect((520, 290, 870, 306), 8, fill=BAR)
    fr.circle(520, 80, 34, fill=WHITE)
    kebab(fr, 520, 80, 6)
    # menu: two plain rows
    fr.rrect((500, 330, 870, 560), 24, fill=WHITE, outline=LINE, width=4)
    rows = labels or ["", ""]
    for i, (lab, icon) in enumerate(zip(rows, ("ban", "flag"))):
        cy = 390 + i * 110
        if icon == "ban":
            ban_icon(fr, 820, cy, 26)
        else:
            flag_icon(fr, 820, cy, 58)
        fr.text((770, cy + 16), lab, 46, 600, INK)
        if i == 0:
            fr.line([(530, cy + 55), (840, cy + 55)], LINE, 3)
    # outcome of blocking: the tile greys out
    fr.rrect((40, 130, 400, 370), 24, fill=BAR)
    fr.circle(220, 250, 68, fill=WHITE)
    ban_icon(fr, 220, 250, 52)
    fr.line([(462, 250), (438, 250)], MUTED, 8, caps=True)  # an arrow from the video to the result, leftwards
    fr.poly([(418, 250), (442, 234), (442, 266)], fill=MUTED)
    return fr


def report(engine, labels):
    """Reporting: a flag and three plain reason chips; signed in, the reported video is also blocked (a key, then a
    greyed tile with the ban sign)."""
    fr = _layer(engine, 900, 560)
    flag_icon(fr, 760, 90, 110)
    for i, wdt in enumerate((330, 270, 200)):
        y = 190 + i * 100
        fr.rrect((880 - wdt, y, 880, y + 70), 35, fill=WHITE, outline=TEAL, width=4)
        fr.rrect((880 - wdt + 44, y + 27, 836, y + 43), 8, fill=BAR)
    fr.circle(360, 110, 80, fill=TEAL_SOFT)
    key_icon(fr, 360, 110, 110)
    fr.rrect((170, 250, 460, 450), 24, fill=BAR)
    fr.circle(315, 350, 60, fill=WHITE)
    ban_icon(fr, 315, 350, 46)
    return fr


def recap(engine, labels):
    fr = _layer(engine, 900, 330)
    draws = (lambda cx, cy: key_icon(fr, cx, cy, 86),
             lambda cx, cy: cards_icon(fr, cx, cy, 90),
             lambda cx, cy: padlock(fr, cx, cy + 16, 62),
             lambda cx, cy: magnifier(fr, cx - 10, cy - 10, 26, color=TEAL),
             lambda cx, cy: stopwatch(fr, cx, cy + 8, 34),
             lambda cx, cy: flag_icon(fr, cx, cy, 70))
    for i, draw in enumerate(draws):  # first step on the right; the grid is centred on the 900 px layer
        cx = 720 - (i % 3) * 270
        cy = 80 + (i // 3) * 170
        fr.circle(cx, cy, 72, fill=TEAL_SOFT)
        draw(cx, cy)
    return fr


KINDS = {"hook": hook, "account": account, "content": content, "passcode": passcode, "search": search,
         "history": history, "timer": timer, "block": block, "report": report, "recap": recap}


def illustration(kind: str, engine: str, labels: list[str]) -> Frame:
    if kind not in KINDS:
        raise ValueError(f"unknown illustration kind {kind!r}; known: {sorted(KINDS)}")
    return KINDS[kind](engine, labels)
