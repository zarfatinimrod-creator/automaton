"""Generic, abstract illustrations for the parent-guide frames, and their motion.

Brand safety is the design brief: no logo, no screenshot, no imitation of any app's look, no red, no
play-button triangle, no faces. Phones are plain rounded rectangles; videos are plain coloured tiles; icons
(key, calendar, padlock, magnifier, stopwatch, flag) are built from circles, bars and lines. Layouts are
mirrored for a right-to-left interface: the first thing sits on the right.

Each illustration draws on its own transparent layer at a nominal size (NOMINAL); frame.py scales it into the
space left between the body text and the bottom of the safe area.

Motion. Every illustration takes `beats`: {beat name: linear progress 0..1} for the beats motion.ART_BEATS lists
for its kind (a toggle sliding off, a list item highlighting, a lock closing, parts popping in). A missing beat,
or beats=None, is 1.0: the settled picture, which is the scene's layout-checked still. Motion only moves, grows or
recolours what the still picture shows, or swells a soft halo behind the part that acts while it acts (gone before
and after); it adds nothing the still does not (no digit count on the keypad, no tick on a card the source does not
tick). Every part stays inside its layer at every beat (tests/test_motion.py checks the layer's edges), so nothing
is cut off by the box.

The drawings at rest are v1's, with five changes made on review (29.9.2026): the s4 switch is larger and search off
is also shown as the struck-out magnifier s2 taught, the smaller grid's tiles are the size of the loose grid's (so it
reads "fewer", not "bigger"), the timer's slider knob is larger, the blocking picture gains a stack behind the
greyed tile for "or a whole channel", and the recap's two rows of icons sit 12 px closer, so their pop stays inside
the layer.
"""

from __future__ import annotations

import math

from PIL import Image

from canvas import (AMBER, AMBER_BG, BAR, DIM, INK, LINE, MUTED, SKY_SOFT, TEAL, TEAL_MID, TEAL_SOFT, WHITE,
                    YELLOW, YELLOW_SOFT, Frame, s, star_points)
from motion import ease_back, ease_in_out, ease_out, lerp, lerp_rgb, window

TINY = 0.05  # a part scaled below this is not drawn (it is still invisible, and tiny shapes can invert)
HALO = TEAL_MID

# ---------------------------------------------------------------- primitives


def phone(fr: Frame, x0, y0, w, h, screen=WHITE):
    """Plain phone: dark rounded body, screen inset, speaker pill. Returns the screen box."""
    fr.rrect((x0, y0, x0 + w, y0 + h), w * 0.16, fill=INK)
    b = w * 0.04
    sb = (x0 + b, y0 + b, x0 + w - b, y0 + h - b)
    fr.rrect(sb, w * 0.13, fill=screen)
    cx = x0 + w / 2
    fr.rrect((cx - w * 0.12, sb[1] + w * 0.045, cx + w * 0.12, sb[1] + w * 0.085), w * 0.02,
             fill=INK if tuple(screen) == WHITE else (40, 50, 72))
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


def calendar_icon(fr: Frame, x0, y0, w, h, check=1.0, glow=1.0):
    """check: scale of the tick on one day (0 = a plain dot like the others, 1 = the tick badge); glow: a halo swells
    behind that day while 0 < glow < 1."""
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
                halo(fr, x, y, w * 0.26, glow)
                if check < 1:
                    fr.circle(x, y, w * 0.035, fill=BAR)
                if check > TINY:
                    check_badge(fr, x, y, w * 0.1 * check)
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


def radio(fr: Frame, cx, cy, r, on: float):
    """on: 0 = an empty ring; above 0 the tap halo and the tick badge pop in, scaled by `on`."""
    if on < 1:
        fr.circle(cx, cy, r, outline=BAR, width=max(3, r * 0.22))
    if on > TINY:
        fr.circle(cx, cy, r * 1.55 * on, fill=TEAL_MID)  # tap halo
        check_badge(fr, cx, cy, r * on)


def magnifier(fr: Frame, cx, cy, r, color=INK, width=None):
    width = width or r * 0.28
    fr.circle(cx, cy, r, outline=color, width=width)
    a = r * 0.72
    fr.line([(cx + a, cy + a), (cx + r * 1.55, cy + r * 1.55)], color, width * 1.2, caps=True)


def slash(fr: Frame, cx, cy, r, color=INK, width=None, drawn=1.0):
    """A diagonal stroke from top left to bottom right; `drawn` is how much of it is drawn."""
    width = width or r * 0.2
    a = r * 0.9
    fr.line([(cx - a, cy - a), (cx - a + 2 * a * drawn, cy - a + 2 * a * drawn)], color, width, caps=True)


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


def padlock(fr: Frame, cx, cy, w, color=TEAL, open_: float = 0.0, body=None):
    """Body centred on (cx, cy); shackle above it. open_ (0..1) lifts the shackle's left leg."""
    bh = w * 0.78
    x0, y0, x1, y1 = cx - w / 2, cy - bh / 2, cx + w / 2, cy + bh / 2
    sw = w * 0.13
    sr = w * 0.3
    lift = w * 0.22 * float(open_)
    top = y0 - sr * 2 - w * 0.04 - lift
    # shackle: a U upside down, legs at cx +- sr
    fr.arc((cx - sr, top, cx + sr, top + 2 * sr), 180, 360, color, sw)
    fr.line([(cx + sr - sw / 2, top + sr), (cx + sr - sw / 2, y0 + 4)], color, sw)
    fr.line([(cx - sr + sw / 2, top + sr), (cx - sr + sw / 2, y0 + 4 - lift * 1.6)], color, sw)
    fr.rrect((x0, y0, x1, y1), w * 0.14, fill=body or color)
    kh = WHITE if tuple(body or color) != WHITE else INK
    fr.circle(cx, cy - bh * 0.06, w * 0.09, fill=kh)
    fr.rrect((cx - w * 0.035, cy - bh * 0.06, cx + w * 0.035, cy + bh * 0.22), w * 0.03, fill=kh)


def toggle(fr: Frame, x0, cy, w, h, on: float):
    """RTL switch: ON (1) has a teal track with the knob on the left; OFF (0) is grey with the knob on the right.
    In between, the knob slides and the track colour blends."""
    on = float(on)
    fr.rrect((x0, cy - h / 2, x0 + w, cy + h / 2), h / 2, fill=lerp_rgb(BAR, TEAL, on))
    kx = lerp(x0 + w - h / 2, x0 + h / 2, on)
    fr.circle(kx, cy, h / 2 - 7, fill=WHITE)


def tile(fr: Frame, box, fill, bar=True, scale=1.0):
    """A plain video tile (and its title bar), scaled about the centre of its box."""
    x0, y0, x1, y1 = box
    if scale != 1.0:
        cx, cy, hw, hh = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 * scale, (y1 - y0) / 2 * scale
        x0, y0, x1, y1 = cx - hw, cy - hh, cx + hw, cy + hh
    th = (y1 - y0) * (0.72 if bar else 1)
    fr.rrect((x0, y0, x1, y0 + th), 14 * min(1.0, scale), fill=fill)
    if bar:
        fr.rrect((x1 - (x1 - x0) * 0.78, y0 + th + 12 * scale, x1, y0 + th + 26 * scale), 7 * scale, fill=BAR)


def stopwatch(fr: Frame, cx, cy, r, sweep=1.0):
    """sweep: how much of the set time is drawn (the sector and the hand turn from 12 o'clock to 4 o'clock)."""
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
    deg = 120 * sweep
    if deg >= 0.5:  # the filled sector for the time set
        fr.d.pieslice((s(cx - r * 0.62), s(cy - r * 0.62), s(cx + r * 0.62), s(cy + r * 0.62)), -90, -90 + deg,
                      fill=TEAL_SOFT)
    a = math.radians(deg)
    fr.line([(cx, cy), (cx + r * 0.6 * math.sin(a), cy - r * 0.6 * math.cos(a))], TEAL, r * 0.09, caps=True)
    fr.circle(cx, cy, r * 0.09, fill=INK)


def slider(fr: Frame, x0, x1, cy, frac, glow=1.0):
    """RTL slider: fills from the right. glow: a halo swells behind the knob while 0 < glow < 1 (it is moving)."""
    h = 16
    fr.rrect((x0, cy - h / 2, x1, cy + h / 2), h / 2, fill=BAR)
    kx = x1 - (x1 - x0) * frac
    halo(fr, kx, cy, 64, glow)
    fr.rrect((kx, cy - h / 2, x1, cy + h / 2), h / 2, fill=TEAL)
    fr.circle(kx, cy, 34, fill=WHITE, outline=TEAL, width=7)


def bubble(fr: Frame, box, text, size=46, scale=1.0):
    """A speech bubble with its tail at the bottom right, scaled about the centre of its box."""
    bx0, by0, bx1, by1 = box
    cx, cy, k = (bx0 + bx1) / 2, (by0 + by1) / 2, scale
    x0, y0, x1, y1 = cx + (bx0 - cx) * k, cy + (by0 - cy) * k, cx + (bx1 - cx) * k, cy + (by1 - cy) * k
    fr.poly([(x1 - 70 * k, y1 - 2 * k), (x1 - 30 * k, y1 + 34 * k), (x1 - 26 * k, y1 - 2 * k)], fill=WHITE)
    fr.rrect((x0, y0, x1, y1), 26 * k, fill=WHITE)
    fr.line([(x1 - 70 * k, y1), (x1 - 30 * k, y1 + 34 * k), (x1 - 26 * k, y1)], TEAL, 5)
    fr.rrect((x0, y0, x1, y1), 26 * k, outline=TEAL, width=5)
    fr.rect((x1 - 66 * k, y1 - 6 * k, x1 - 30 * k, y1 - 1 * k), fill=WHITE)
    fr.text(((x0 + x1) / 2, (y0 + y1) / 2), text, max(1, round(size * k)), 700, INK, anchor="mm")


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
    k = size / 200  # the fixed offsets below were drawn for size 200
    fr.rrect((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), size * 0.08, fill=WHITE, outline=INK, width=6 * k)
    fr.rrect((cx - w * 0.2, cy - h / 2 - 12 * k, cx + w * 0.2, cy - h / 2 + 16 * k), 8 * k, fill=INK)
    for i in range(3):
        y = cy - h * 0.2 + i * h * 0.22
        check_mark(fr, cx + w * 0.26, y, size * 0.07, TEAL, width=6 * k)
        fr.rrect((cx - w * 0.36, y - 7 * k, cx + w * 0.12, y + 7 * k), 7 * k, fill=BAR)


def arrow_left(fr: Frame, x_from, x_to, y, width, tip, back, half, drawn=1.0):
    """A plain arrow pointing left (the reading direction): a shaft from x_from to x_to and a head whose point is
    `tip` px beyond the shaft's end and whose base is `back` px behind it. `drawn` (0..1) draws the shaft out."""
    x = lerp(x_from, x_to, drawn)
    fr.line([(x_from, y), (x, y)], MUTED, width, caps=True)
    fr.poly([(x - tip, y), (x + back, y - half), (x + back, y + half)], fill=MUTED)


def halo(fr: Frame, cx, cy, r, p: float, fill=HALO):
    """A soft disc behind a part while it acts: it swells from nothing to radius r and back as p runs 0..1, and is not
    drawn before or after, so the settled picture has no trace of it."""
    if 0 < p < 1:
        rr = r * math.sin(math.pi * p)
        if rr > 1:
            fr.circle(cx, cy, rr, fill=fill)


def with_alpha(fr: Frame, a: float, draw):
    """Draw on a transparent layer of fr's size, then composite it onto fr at opacity a (a fade-in for a group of
    parts). At a >= 1 it draws straight onto fr, so the settled picture takes the same path as the still."""
    if a >= 1:
        return draw(fr)
    tmp = Frame(fr.engine, size=(fr.w, fr.h), bg=(0, 0, 0, 0), mode="RGBA")
    out = draw(tmp)
    if a > 0:
        q = round(a * 255)
        tmp.img.putalpha(tmp.img.getchannel("A").point([(v * q + 127) // 255 for v in range(256)]))
        fr.img.alpha_composite(tmp.img)
    return out


# ---------------------------------------------------------------- illustrations (one per scene kind)


def _layer(engine, w, h):
    return Frame(engine, size=(w, h), bg=(0, 0, 0, 0), mode="RGBA")


def _beat(beats, name) -> float:
    return 1.0 if beats is None else float(beats.get(name, 1.0))


def hook(engine, labels, beats=None):
    """A phone fading in as it rises into place with a blank screen, and the video's own count ("6") popping in on a
    yellow disc, which swells once more when the narration says "שישה". The phone rises only 16 px, inside the
    layer's 20 px of headroom below it, so no frame shows it cut off at the bottom."""
    fr = _layer(engine, 760, 760)
    ph = ease_out(_beat(beats, "phone"))

    def draw_phone(f):
        sb = phone(f, 200, 20 + (1 - ph) * 16, 380, 720)  # 16 of the 20 px below the phone
        f.rrect((sb[0] + 40, sb[1] + 110, sb[2] - 40, sb[1] + 330), 26, fill=SKY_SOFT)
        return sb
    sb = with_alpha(fr, ph, draw_phone)
    rows = _beat(beats, "rows")
    for i, wdt in enumerate((230, 170, 200)):  # plain lines of text filling in from the right
        e = ease_out(window(rows, i * 0.2, i * 0.2 + 0.6))
        if e <= 0:
            continue
        y = sb[1] + 380 + i * 60
        fr.rrect((sb[2] - 40 - max(22, wdt * e), y, sb[2] - 40, y + 22), 11, fill=BAR)
    label = labels[0] if labels else ""
    # the pop's overshoot (~1.1) and the pulse (1.12) never meet in the video; capped so they cannot leave the layer
    k = min(1.13, ease_back(_beat(beats, "pop")) * (1 + 0.12 * math.sin(math.pi * _beat(beats, "pulse"))))
    if k > TINY:
        fr.circle(580, 190, 150 * k, fill=YELLOW)
        fr.circle(580, 190, 150 * k, outline=WHITE, width=10)
        fr.text((580, 190 + 6 * k), label, max(1, round(190 * k)), 800, INK, anchor="mm", rtl=False)
    return fr


def account(engine, labels, beats=None):
    """Sign-in card (a key, then a tick), the calendar's date tick, the profile avatars popping in 0.4 s apart, and
    then the "עד 8" pill."""
    fr = _layer(engine, 900, 780)
    sb = phone(fr, 500, 20, 380, 740)
    # sign-in card: key and a check, no brand marks
    fr.rrect((sb[0] + 30, sb[1] + 100, sb[2] - 30, sb[1] + 270), 26, fill=TEAL_SOFT)
    si = _beat(beats, "signin")
    k = ease_back(window(si, 0, 0.6))
    if k > TINY:
        key_icon(fr, sb[2] - 110, sb[1] + 185, 120 * k)
    k = ease_back(window(si, 0.4, 1.0))
    if k > TINY:
        check_badge(fr, sb[0] + 88, sb[1] + 185, 38 * k)
    cal = _beat(beats, "calendar")
    calendar_icon(fr, sb[0] + 80, sb[1] + 340, 200, 200, check=ease_back(window(cal, 0, 0.8)), glow=cal)
    for i, wdt in enumerate((220, 160)):
        y = sb[1] + 600 + i * 50
        fr.rrect((sb[2] - 36 - wdt, y, sb[2] - 36, y + 20), 10, fill=BAR)
    # profile avatars: shapes, never faces
    pr = _beat(beats, "profiles")
    for i, ((cx, cy), shape, fill) in enumerate(zip(((350, 150), (150, 150), (350, 360), (150, 360)),
                                                    ("star", "moon", "leaf", "plus"),
                                                    (TEAL_SOFT, YELLOW_SOFT, SKY_SOFT, WHITE))):
        k = ease_back(window(pr, i * 0.4 / 1.65, (i * 0.4 + 0.45) / 1.65))  # 0.4 s apart over the 1.65 s beat
        if k > TINY:
            avatar(fr, cx, cy, 82 * k, shape, fill)
    k = ease_back(_beat(beats, "limit"))
    if labels and k > TINY:
        fr.rrect((250 - 140 * k, 560 - 50 * k, 250 + 140 * k, 560 + 50 * k), 50 * k, fill=TEAL)
        fr.text((250, 560 + 2 * k), labels[0], max(1, round(58 * k)), 700, WHITE, anchor="mm")
    return fr


def content(engine, labels, beats=None):
    """Four plain option cards drop in; a highlight runs down them and settles on the fourth, which is ticked
    (the approved-content option); a checklist pops in; a stroke crosses out the magnifier (no search)."""
    fr = _layer(engine, 900, 780)
    sb = phone(fr, 470, 20, 400, 740)
    rx0, rx1 = sb[0] + 26, sb[2] - 26
    fr.rrect((rx1 - 170, sb[1] + 90, rx1, sb[1] + 108), 9, fill=MUTED)
    cards, sel = _beat(beats, "cards"), _beat(beats, "select")
    chosen = window(sel, 0.7, 1.0)
    cx = (rx0 + rx1) / 2
    for i, wdt in enumerate((150, 190, 170, 210)):
        k = ease_back(window(cards, i * 0.13, i * 0.13 + 0.5))
        if k <= TINY:
            continue
        y0 = sb[1] + 140 + i * 132
        cy = y0 + 55
        on = i == 3 and chosen > 0
        X = lambda x: cx + (x - cx) * k  # noqa: E731 - scale about the card's centre
        fr.rrect((X(rx0), cy - 55 * k, X(rx1), cy + 55 * k), 22 * k, fill=TEAL_SOFT if on else WHITE,
                 outline=TEAL if on else LINE, width=5 if on else 3)
        radio(fr, X(rx1 - 46), cy, 20 * k, ease_back(chosen) if i == 3 else 0.0)
        fr.rrect((X(rx1 - 90 - wdt), cy - 10 * k, X(rx1 - 90), cy + 10 * k), 10 * k,
                 fill=INK if on else BAR)
    if 0 < sel < 1:  # the moving highlight
        y0 = sb[1] + 140 + ease_in_out(window(sel, 0, 0.7)) * 3 * 132
        fr.rrect((rx0, y0, rx1, y0 + 110), 22, outline=TEAL, width=5)
    k = ease_back(window(sel, 0, 0.5))
    if k > TINY:
        checklist_icon(fr, 230, 200, 200 * k)
    nosearch = _beat(beats, "nosearch")
    halo(fr, 215, 565, 130, nosearch)
    magnifier(fr, 205, 555, 70, color=MUTED)
    ns = ease_out(window(nosearch, 0, 0.75))
    if ns > 0:
        slash(fr, 230, 580, 120, color=INK, width=18, drawn=ns)
    return fr


def keypad(fr: Frame, cx, cy, pitch, r, sweep=1.0):
    """A generic 3x4 keypad of plain dots: says "a code", not how many digits it has. `sweep` runs a light across
    every key in reading order (right to left, top to bottom), so it never stops on a count."""
    k = 0
    for row in range(4):
        for col in (2, 1, 0):
            if row == 3 and col != 1:
                continue
            x, y = cx + (col - 1) * pitch, cy + (row - 1.5) * pitch
            glow = 0.0 if not 0 < sweep < 1 else max(0.0, 1 - abs(sweep - (0.12 + 0.76 * k / 9)) / 0.14)
            fr.circle(x, y, r, fill=lerp_rgb(WHITE, TEAL_MID, glow), outline=TEAL, width=5)
            k += 1


def passcode(engine, labels, beats=None):
    """A padlock over a generic keypad (the code), "או", and a made-up sum card (the multiplication question).
    A light runs over the keypad, the sum card pops in beside "או", and the padlock opens: either one opens the
    settings."""
    fr = _layer(engine, 900, 560)
    op = _beat(beats, "open")
    halo(fr, 720, 175, 150, op)
    padlock(fr, 720, 200, 150, open_=ease_out(window(op, 0, 0.75)))
    keypad(fr, 720, 400, 62, 22, sweep=_beat(beats, "keys"))
    sum_label = next((l for l in labels if any(ch.isdigit() for ch in l)), "")
    word = next((l for l in labels if l != sum_label), "")
    k = ease_back(_beat(beats, "or"))
    if k > TINY:
        fr.text((450, 330), word, max(1, round(72 * k)), 700, MUTED, anchor="mm")
        fr.rrect((200 - 160 * k, 330 - 100 * k, 200 + 160 * k, 330 + 100 * k), 30 * k, fill=WHITE, outline=INK,
                 width=6)
        fr.text((200, 330 + 2 * k), sum_label, max(1, round(64 * k)), 700, INK, anchor="mm", rtl=False)
    return fr


def search(engine, labels, beats=None):
    """A loose grid of plain tiles under a magnifier; a generic switch slides off and the magnifier is struck out, as
    in step 2 (no search); an arrow draws out leftwards to a smaller grid of the same tiles: fewer, not bigger, and
    carrying nothing: fewer, not "checked"."""
    fr = _layer(engine, 900, 640)
    grid = _beat(beats, "grid")
    fills = (TEAL_SOFT, YELLOW_SOFT, SKY_SOFT, SKY_SOFT, TEAL_SOFT, YELLOW_SOFT, YELLOW_SOFT, SKY_SOFT, TEAL_SOFT)
    for i, f in enumerate(fills):  # before: a loose grid, on the right
        c, r = i % 3, i // 3
        x1 = 880 - c * 128
        y0 = 40 + r * 150
        k = ease_back(window(grid, i * 0.05, i * 0.05 + 0.5))
        if k > TINY:
            tile(fr, (x1 - 112, y0, x1, y0 + 120), f, scale=k)
    k = ease_back(window(grid, 0.4, 1.0))
    if k > TINY:
        magnifier(fr, 690, 230, 95 * k, color=INK)
    # the switch that turns search off (a halo behind it while it slides), and the magnifier struck out
    sw = _beat(beats, "switch")
    halo(fr, 406, 170, 100, sw)
    toggle(fr, 316, 170, 180, 93, on=1 - ease_in_out(window(sw, 0, 0.55)))
    st = ease_out(window(sw, 0.35, 1.0))
    if st > 0:
        slash(fr, 724, 264, 163, color=INK, width=24, drawn=st)
    # then an arrow leftwards (RTL reading order) to four tiles the size of the grid's nine
    fewer = _beat(beats, "fewer")
    a = ease_out(window(fewer, 0, 0.4))
    if a > TINY:
        arrow_left(fr, 500, 330, 330, 10, tip=20, back=15, half=28, drawn=a)
    for i, f in enumerate((TEAL_SOFT, YELLOW_SOFT, SKY_SOFT, TEAL_SOFT)):
        c, r = i % 2, i // 2
        x1 = 300 - c * 128
        y0 = 190 + r * 150
        k = ease_back(window(fewer, 0.3 + i * 0.1, 0.7 + i * 0.1))
        if k > TINY:
            tile(fr, (x1 - 112, y0, x1, y0 + 120), f, scale=k)
    return fr


def history_icon(fr: Frame, cx, cy, r):
    """A clock face with a counter-clockwise arrow: "history"."""
    fr.arc((cx - r, cy - r, cx + r, cy + r), 200, 520, INK, r * 0.14)
    fr.poly([(cx - r * 1.12, cy - r * 0.42), (cx - r * 0.62, cy - r * 0.2), (cx - r * 1.02, cy + r * 0.12)], fill=INK)
    fr.line([(cx, cy), (cx, cy - r * 0.55)], INK, r * 0.12, caps=True)
    fr.line([(cx, cy), (cx + r * 0.4, cy + r * 0.2)], INK, r * 0.12, caps=True)


def history(engine, labels, beats=None):
    """Left: a few tiles; an amber "!" pops onto one (unwanted content can still turn up). Right: the history list,
    struck through row by row, right to left (turning search off deletes the profile's watch and search history)."""
    fr = _layer(engine, 900, 600)
    history_icon(fr, 790, 110, 70)
    erase = _beat(beats, "erase")
    for i, wdt in enumerate((300, 250, 280, 220)):
        y = 230 + i * 90
        fr.rrect((860 - wdt, y, 860, y + 30), 15, fill=BAR)
        e = ease_out(window(erase, i * 0.18, i * 0.18 + 0.46))
        if e > 0:
            fr.line([(lerp(874, 860 - wdt - 14, e), y + 15), (874, y + 15)], MUTED, 7, caps=True)
    warn = ease_back(_beat(beats, "warn"))
    for i, f in enumerate((TEAL_SOFT, SKY_SOFT, YELLOW_SOFT, TEAL_SOFT)):
        c, r = i % 2, i // 2
        x1 = 420 - c * 190
        y0 = 90 + r * 230
        tile(fr, (x1 - 170, y0, x1, y0 + 180), f)
        if i == 1 and warn > TINY:
            cx, cy, k = x1 - 30, y0 + 30, warn
            fr.circle(cx, cy, 34 * k, fill=AMBER_BG, outline=AMBER, width=6)
            fr.rrect((cx - 5 * k, cy - 20 * k, cx + 5 * k, cy + 6 * k), 5 * k, fill=AMBER)
            fr.circle(cx, cy + 17 * k, 6 * k, fill=AMBER)
    return fr


def timer(engine, labels, beats=None):
    """The stopwatch starts to sweep; when the slider moves (choosing the time) the stopwatch's sector follows it to
    the time set; at the end the speech bubble pops up (the message), then the phone screen dims and its padlock
    closes (viewing stops)."""
    fr = _layer(engine, 900, 760)
    slide = _beat(beats, "slide")
    se = ease_in_out(window(slide, 0, 0.8))
    stopwatch(fr, 230, 250, 150, sweep=lerp(0.35 * ease_out(_beat(beats, "sweep")), 1.0, se))
    slider(fr, 70, 400, 520, lerp(0.12, 0.62, se), glow=slide)
    lock = _beat(beats, "lock")
    dim = ease_in_out(window(lock, 0, 0.6))
    sb = phone(fr, 500, 20, 380, 720, screen=lerp_rgb(WHITE, DIM, dim))
    lock_colour = lerp_rgb(TEAL, WHITE, dim)
    padlock(fr, (sb[0] + sb[2]) / 2, sb[1] + 250, 130, color=lock_colour, body=lock_colour,
            open_=1 - ease_out(window(lock, 0.2, 1.0)))
    k = ease_back(_beat(beats, "message"))
    if labels and k > TINY:
        bubble(fr, (sb[0] + 20, sb[1] + 420, sb[2] - 20, sb[1] + 530), labels[0], 46, scale=k)
    return fr


def block(engine, labels, beats=None):
    """Blocking: a video tile whose generic three-dot button is tapped, a plain two-row menu that opens, and an
    arrow to the same tile greyed out with a ban sign; then two more greyed tiles rise from behind it and the ban
    sign swells (the video, or a whole channel)."""
    fr = _layer(engine, 900, 600)
    # the video tile and its generic three-dot button (top corner, left in RTL)
    fr.rrect((470, 30, 870, 270), 24, fill=SKY_SOFT)
    fr.rrect((520, 290, 870, 306), 8, fill=BAR)
    tap = _beat(beats, "tap")
    if 0 < tap < 1:  # a tap halo that grows and shrinks behind the button
        fr.circle(520, 80, 34 + 22 * math.sin(math.pi * tap), fill=TEAL_MID)
    fr.circle(520, 80, 34, fill=WHITE)
    kebab(fr, 520, 80, 6)
    # menu: two plain rows, opening downwards
    mh = 230 * ease_out(_beat(beats, "menu"))
    if mh > 8:
        fr.rrect((500, 330, 870, 330 + mh), 24, fill=WHITE, outline=LINE, width=4)
        rows = labels or ["", ""]
        for i, (lab, icon) in enumerate(zip(rows, ("ban", "flag"))):
            cy = 390 + i * 110
            if 330 + mh < cy + 40:
                continue  # the menu has not opened this far yet
            if icon == "ban":
                ban_icon(fr, 820, cy, 26)
            else:
                flag_icon(fr, 820, cy, 58)
            fr.text((770, cy + 16), lab, 46, 600, INK)
            if i == 0:
                fr.line([(530, cy + 55), (840, cy + 55)], LINE, 3)
    # outcome of blocking: the tile greys out; for a channel, a stack of greyed tiles rises from behind it
    bl, ch = _beat(beats, "blocked"), _beat(beats, "channel")
    rise = ease_out(window(ch, 0, 0.7))
    if rise > 0:
        for depth, half_w in ((2, 144), (1, 162)):  # the back card first
            dy = 22 * depth * rise
            fr.rrect((220 - half_w, 130 - dy, 220 + half_w, 370 - dy), 24, fill=BAR, outline=WHITE, width=5)
    k = ease_back(window(bl, 0.3, 0.8))
    if k > TINY:
        fr.rrect((220 - 180 * k, 250 - 120 * k, 220 + 180 * k, 250 + 120 * k), 24 * k, fill=BAR,
                 outline=WHITE if rise > 0 else None, width=5 if rise > 0 else 0)
    k = ease_back(window(bl, 0.5, 1.0)) * (1 + 0.15 * math.sin(math.pi * window(ch, 0.3, 1.0)))
    if k > TINY:
        fr.circle(220, 250, 68 * k, fill=WHITE)
        ban_icon(fr, 220, 250, 52 * k)
    a = ease_out(window(bl, 0, 0.35))
    if a > TINY:  # an arrow from the video to the result, leftwards
        arrow_left(fr, 462, 438, 250, 8, tip=20, back=4, half=16, drawn=a)
    return fr


def report(engine, labels, beats=None):
    """Reporting: a flag and three plain reason chips growing in; signed in (a key pops in), the reported video is
    also blocked (then a greyed tile with the ban sign)."""
    fr = _layer(engine, 900, 560)
    chips = _beat(beats, "chips")
    k = ease_back(window(chips, 0, 0.45))
    if k > TINY:
        flag_icon(fr, 760, 90, 110 * k)
    for i, wdt in enumerate((330, 270, 200)):
        e = ease_out(window(chips, 0.25 + i * 0.15, 0.7 + i * 0.15))
        if e <= TINY:
            continue
        y = 190 + i * 100
        w = max(70, wdt * e)  # a chip grows from its right end
        fr.rrect((880 - w, y, 880, y + 70), 35, fill=WHITE, outline=TEAL, width=4)
        if w - 88 > 16:
            fr.rrect((880 - w + 44, y + 27, 836, y + 43), 8, fill=BAR)
    k = ease_back(_beat(beats, "signed"))
    if k > TINY:
        fr.circle(360, 110, 80 * k, fill=TEAL_SOFT)
        key_icon(fr, 360, 110, 110 * k)
    blocked = _beat(beats, "blocked")
    k = ease_back(window(blocked, 0, 0.6))
    if k > TINY:
        fr.rrect((315 - 145 * k, 350 - 100 * k, 315 + 145 * k, 350 + 100 * k), 24 * k, fill=BAR)
    k = ease_back(window(blocked, 0.25, 1.0))
    if k > TINY:
        fr.circle(315, 350, 60 * k, fill=WHITE)
        ban_icon(fr, 315, 350, 46 * k)
    return fr


def recap(engine, labels, beats=None):
    """The six step icons popping in one after another, first step on the right."""
    fr = _layer(engine, 900, 330)
    draws = (lambda cx, cy, k: key_icon(fr, cx, cy, 86 * k),
             lambda cx, cy, k: cards_icon(fr, cx, cy, 90 * k),
             lambda cx, cy, k: padlock(fr, cx, cy + 16 * k, 62 * k),
             lambda cx, cy, k: magnifier(fr, cx - 10 * k, cy - 10 * k, 26 * k, color=TEAL),
             lambda cx, cy, k: stopwatch(fr, cx, cy + 8 * k, 34 * k),
             lambda cx, cy, k: flag_icon(fr, cx, cy, 70 * k))
    icons = _beat(beats, "icons")
    for i, draw in enumerate(draws):  # first step on the right; the grid is centred on the 900 px layer
        k = ease_back(window(icons, i * 0.1, i * 0.1 + 0.5))
        if k <= TINY:
            continue
        cx = 720 - (i % 3) * 270
        cy = 86 + (i // 3) * 158  # rows 14 px inside the layer at rest, so the pop's overshoot stays inside too
        fr.circle(cx, cy, 72 * k, fill=TEAL_SOFT)
        draw(cx, cy, k)
    return fr


KINDS = {"hook": hook, "account": account, "content": content, "passcode": passcode, "search": search,
         "history": history, "timer": timer, "block": block, "report": report, "recap": recap}
NOMINAL = {"hook": (760, 760), "account": (900, 780), "content": (900, 780), "passcode": (900, 560),
           "search": (900, 640), "history": (900, 600), "timer": (900, 760), "block": (900, 600),
           "report": (900, 560), "recap": (900, 330)}


def nominal_size(kind: str) -> tuple[int, int]:
    if kind not in KINDS:
        raise ValueError(f"unknown illustration kind {kind!r}; known: {sorted(KINDS)}")
    return NOMINAL[kind]


def illustration(kind: str, engine: str, labels: list[str], beats: dict[str, float] | None = None) -> Frame:
    nominal_size(kind)
    return KINDS[kind](engine, labels, beats)


def render(kind: str, engine: str, labels: list[str], w: int, h: int, beats: dict[str, float] | None = None):
    """The illustration at the given beats as a w x h RGBA image (1x), ready to composite at its box."""
    return illustration(kind, engine, labels, beats).img.resize((w, h), Image.LANCZOS)
