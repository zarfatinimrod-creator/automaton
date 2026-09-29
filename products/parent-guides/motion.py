"""The motion plan: when each piece of a scene moves, driven by the spec and the narration's measured timings.

Standard library only (spec.py validates the `motion` keys on a bare machine); compose.py draws the frames.

Anchors. Every timed thing in a scene's `motion` keys is anchored to the narration:
  * "start"        - the scene's first frame (on the hook: frame 0);
  * n              - narration line n (0-based), REVEAL_LEAD_S before its first sound, so words are on screen as
                     they are heard;
  * [n, seconds]   - the same point moved by that many seconds, for a beat that lands inside a line
                     ("או ערוץ שלם" is about a second into its line);
  * [n, "end"]     - the moment line n stops: for on-screen text that no narration line says, shown in the pause
                     after the line before it rather than on top of an unrelated line.

What moves, and when (times are local to the scene unless noted):
  * text reveals   - every body item eases in (fade + a RISE_PX rise, REVEAL_S, cubic ease-out) at its anchor,
                     spec `motion.reveal[i]`. Items that share an anchor are staggered by STAGGER_S, top to bottom.
  * highlights     - spec `motion.highlight` {"i": anchor}: a soft marker runs behind body item i in reading order
                     (right to left, line by line) and fades away again (HIGHLIGHT_S in all), so a step chain can be
                     followed while it is spoken. Emphasis only: nothing stays drawn.
  * the picture    - each illustration kind has named beats (ART_BEATS: a toggle sliding, a list item highlighting,
                     a lock closing ...); spec `motion.art` anchors each beat. Before its beat a part is in its
                     "before" state; at 1.0 it is the settled picture. In a scene that slides in, no beat starts
                     before the slide has come to rest (BEAT_AFTER_SLIDE_S after it), so the slide cannot hide it.
  * transitions    - a scene slides in from the left by SLIDE_FRAC of the width over TRANSITION_S (sine
                     ease-in-out, at most ~60 px a frame at 30 fps) while it fades in, and the previous one slides out to the right while it fades out: forward in
                     a right-to-left interface, and short enough a travel not to strobe at 30 fps. Later pages of
                     one step keep the header and title still. The end card cross-fades in.
  * progress bar   - the segment of the current step fills continuously across the step's pages.
  * the hook       - the first scene's title (the question) is on screen, whole, from the first frame (its script
                     says so); its "start" items and beats begin moving at 0.0 s.

Reading time. A viewer cannot read a line before it appears, so the reading rule (render.CPS characters a second)
is applied in reveal order: reading_need() walks the title, the body items and the illustration labels in the order
they appear and returns when the last one has been read. With everything shown at 0 it equals the old rule
(spec.reading_chars / CPS).
"""

from __future__ import annotations

import math

REVEAL_S = 0.25        # a text eases in over this long
REVEAL_LEAD_S = 0.10   # ... starting this long before its narration line is heard
STAGGER_S = 0.12       # items that share an anchor, one after another
RISE_PX = 28           # a revealed text rises this far into place
TRANSITION_S = 0.28    # scene-to-scene slide and the end-card cross-fade (the brief allows 300 ms)
SLIDE_FRAC = 0.30      # ... travelling this share of the width (a full width in 280 ms jumps ~330 px a frame)
BEAT_AFTER_SLIDE_S = 0.05  # in a scene that slides in, beats start no earlier than this after the slide rests
HIGHLIGHT_S = (1.0, 0.5, 0.4)  # a highlight runs along its item, holds, and fades out (seconds)
START = "start"
END = "end"

# Beats per illustration kind: name -> duration in seconds. Order is the order they normally play.
ART_BEATS: dict[str, dict[str, float]] = {
    "hook": {"phone": 0.40, "pop": 0.45, "rows": 0.60, "pulse": 0.30},
    "account": {"signin": 0.50, "calendar": 0.55, "profiles": 1.65, "limit": 0.45},
    "content": {"cards": 0.60, "select": 0.70, "nosearch": 0.60},
    "passcode": {"keys": 0.80, "or": 0.40, "open": 0.60},
    "search": {"grid": 0.60, "switch": 0.70, "fewer": 0.60},
    "history": {"warn": 0.45, "erase": 0.90},
    "timer": {"sweep": 0.90, "slide": 0.70, "message": 0.55, "lock": 0.60},
    "block": {"tap": 0.50, "menu": 0.45, "blocked": 0.60, "channel": 0.70},
    "report": {"chips": 0.70, "signed": 0.45, "blocked": 0.60},
    "recap": {"icons": 1.00},
}
# The beat that first shows an illustration's labels (for the reading rule); a kind not listed shows them at 0.
LABEL_BEAT = {"hook": "pop", "account": "limit", "passcode": "or", "timer": "message", "block": "menu"}


# ------------------------------------------------------------------ easing


def clamp(p: float) -> float:
    return 0.0 if p <= 0 else 1.0 if p >= 1 else p


def ease_out(p: float) -> float:
    p = clamp(p)
    return 1 - (1 - p) ** 3


def ease_in_out(p: float) -> float:
    p = clamp(p)
    return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def ease_sine(p: float) -> float:
    """Sine ease-in-out: its top speed is pi/2 times the average (a cubic's is 3 times), for the scene slide."""
    p = clamp(p)
    return 0.5 - 0.5 * math.cos(math.pi * p)


def ease_back(p: float) -> float:
    """Ease-out with a small overshoot (peaks about 1.1), for things that pop into place."""
    p = clamp(p)
    c1 = 1.70158
    return 1 + (c1 + 1) * (p - 1) ** 3 + c1 * (p - 1) ** 2


def window(p: float, a: float, b: float) -> float:
    """The part of a beat's progress p that falls between a and b, rescaled to 0..1 (for staggered sub-steps)."""
    return clamp((p - a) / (b - a))


def lerp(a: float, b: float, p: float) -> float:
    return a + (b - a) * p


def lerp_rgb(c0, c1, p: float) -> tuple[int, int, int]:
    return tuple(int(round(lerp(x, y, clamp(p)))) for x, y in zip(c0, c1))


# ------------------------------------------------------------------ the spec's motion keys


def _lines(scene: dict) -> int:
    return len([ln for ln in scene.get("narration", "").split("\n") if ln.strip()])


def _items(scene: dict) -> int:
    return len([ln for ln in scene.get("on_screen_body", "").split("\n") if ln.strip()])


def scene_motion(scene: dict) -> dict:
    """The scene's motion keys with defaults: body item i at line min(i, last line); every beat at "start"; no
    highlight."""
    m = scene.get("motion", {})
    n = max(1, _lines(scene))
    reveal = m.get("reveal", [min(i, n - 1) for i in range(_items(scene))])
    kind = scene.get("illustration", {}).get("kind")
    art = {b: START for b in ART_BEATS.get(kind, {})}
    art.update(m.get("art", {}))
    return {"reveal": list(reveal), "art": art, "highlight": {int(k): a for k, a in m.get("highlight", {}).items()}}


def _anchor_ok(a, n_lines: int) -> bool:
    def line_ok(x):
        return isinstance(x, int) and not isinstance(x, bool) and 0 <= x < n_lines

    if a == START or line_ok(a):
        return True
    if isinstance(a, list) and len(a) == 2 and line_ok(a[0]):
        off = a[1]
        return off == END or (isinstance(off, (int, float)) and not isinstance(off, bool) and -1.0 <= off <= 10.0)
    return False


ANCHOR_HELP = '"start", a narration line 0..{last}, [line, seconds] or [line, "end"]'


def validate_motion(scene: dict) -> list[str]:
    sid = scene.get("id", "?")
    m = scene.get("motion")
    if m is None:
        return []
    if not isinstance(m, dict) or set(m) - {"reveal", "art", "highlight"}:
        return [f"{sid}: motion must be an object with only 'reveal', 'art' and 'highlight'"]
    problems, n = [], _lines(scene)
    help_ = ANCHOR_HELP.format(last=n - 1)
    rev = m.get("reveal")
    if rev is not None:
        if not isinstance(rev, list) or len(rev) != _items(scene):
            problems.append(f"{sid}: motion.reveal needs one anchor per body item ({_items(scene)})")
        else:
            problems += [f"{sid}: motion.reveal[{i}] = {a!r} is not {help_}" for i, a in enumerate(rev)
                         if not _anchor_ok(a, n)]
    art = m.get("art")
    if art is not None:
        kind = scene.get("illustration", {}).get("kind")
        known = ART_BEATS.get(kind, {})
        if not isinstance(art, dict):
            problems.append(f"{sid}: motion.art must be an object")
        else:
            for beat, a in art.items():
                if beat not in known:
                    problems.append(f"{sid}: motion.art beat {beat!r} is not one of {kind!r}'s: {sorted(known)}")
                elif not _anchor_ok(a, n):
                    problems.append(f"{sid}: motion.art[{beat!r}] = {a!r} is not {help_}")
    hl = m.get("highlight")
    if hl is not None:
        if not isinstance(hl, dict):
            problems.append(f"{sid}: motion.highlight must be an object")
        else:
            for k, a in hl.items():
                if not (isinstance(k, str) and k.isdigit() and int(k) < _items(scene)):
                    problems.append(f"{sid}: motion.highlight names body item {k!r}; there are {_items(scene)}")
                elif not _anchor_ok(a, n):
                    problems.append(f"{sid}: motion.highlight[{k!r}] = {a!r} is not {help_}")
    return problems


# ------------------------------------------------------------------ the scene's schedule


def anchor_time(anchor, cues: list[dict]) -> float:
    """Local time an anchor starts moving: 0 for "start"; REVEAL_LEAD_S before line n is heard for n; that plus the
    offset for [n, seconds]; the line's end for [n, "end"]."""
    if anchor == START:
        return 0.0
    if isinstance(anchor, list):
        n, off = anchor
        if off == END:
            return float(cues[n]["end"])
        return max(0.0, cues[n]["start"] - REVEAL_LEAD_S + off)
    return max(0.0, cues[anchor]["start"] - REVEAL_LEAD_S)


def _key(anchor):
    return tuple(anchor) if isinstance(anchor, list) else anchor


def reveal_times(scene: dict, cues: list[dict]) -> list[float]:
    """Local start time of each body item's reveal. Items on one anchor follow each other by STAGGER_S."""
    out, used = [], {}
    for a in scene_motion(scene)["reveal"]:
        k = used.get(_key(a), 0)
        used[_key(a)] = k + 1
        out.append(round(anchor_time(a, cues) + k * STAGGER_S, 4))
    return out


def beat_times(scene: dict, cues: list[dict], slide_in: bool = False) -> dict[str, float]:
    """Local start time of each illustration beat. slide_in: the scene enters with a slide, so no beat starts before
    the slide has come to rest."""
    floor = TRANSITION_S + BEAT_AFTER_SLIDE_S if slide_in else 0.0
    return {b: round(max(floor, anchor_time(a, cues)), 4) for b, a in scene_motion(scene)["art"].items()}


def highlight_times(scene: dict, cues: list[dict]) -> dict[int, float]:
    return {i: round(anchor_time(a, cues), 4) for i, a in scene_motion(scene)["highlight"].items()}


def highlight_state(t_local: float, start: float) -> tuple[float, float]:
    """(how far along its item the marker has run 0..1, its opacity 0..1) at t_local; (0, 0) outside its window."""
    run, hold, fade = HIGHLIGHT_S
    u = t_local - start
    if u <= 0 or u >= run + hold + fade:
        return 0.0, 0.0
    if u < run:
        return ease_in_out(u / run), 1.0
    if u < run + hold:
        return 1.0, 1.0
    return 1.0, 1.0 - ease_in_out((u - run - hold) / fade)


def reveal_progress(t_local: float, start: float) -> float:
    """Eased reveal (0 = not yet, 1 = in place) of a text whose reveal starts at `start`."""
    return ease_out((t_local - start) / REVEAL_S)


def beat_progress(scene: dict, beats: dict[str, float], t_local: float) -> dict[str, float]:
    """Raw (linear) progress of every beat of the scene's illustration at t_local; art.py eases each part."""
    kind = scene.get("illustration", {}).get("kind")
    return {b: clamp((t_local - beats[b]) / d) for b, d in ART_BEATS.get(kind, {}).items()}


def reading_elements(scene: dict, title_seen: bool, cues: list[dict],
                     slide_in: bool = False) -> list[tuple[float, int, str]]:
    """(time it appears, characters, what) for everything a viewer reads in the scene, in the order it appears."""
    from spec import body_items, split_title  # stdlib-only module

    title = "" if title_seen else split_title(scene.get("on_screen_title", ""))[1]
    els = [(0.0, len(title), "title")] if title else []
    for i, (item, t) in enumerate(zip(body_items(scene), reveal_times(scene, cues))):
        els.append((t, len(item), f"item{i}"))
    ill = scene.get("illustration", {})
    labels = [lb for lb in ill.get("labels", []) if lb]
    if labels:
        beat = LABEL_BEAT.get(ill.get("kind"))
        t = beat_times(scene, cues, slide_in).get(beat, 0.0) if beat else 0.0
        els += [(t, len(lb), f"label{j}") for j, lb in enumerate(labels)]
    return sorted(els, key=lambda e: e[0])  # stable: title, then items top to bottom, then labels


def reading_need(elements: list[tuple[float, int, str]], cps: float) -> float:
    """Seconds until the last element is read, reading at cps in the order the elements appear (one space between
    parts, as spec.reading_chars counts them)."""
    f = 0.0
    for k, (t, chars, _) in enumerate(elements):
        f = max(f, t) + (chars + (1 if k else 0)) / cps
    return f


def motion_end(scene: dict, cues: list[dict], slide_in: bool = False) -> float:
    """Local time the scene's last reveal, highlight or beat comes to rest."""
    ends = [t + REVEAL_S for t in reveal_times(scene, cues)]
    ends += [t + sum(HIGHLIGHT_S) for t in highlight_times(scene, cues).values()]
    kind = scene.get("illustration", {}).get("kind")
    ends += ([t + ART_BEATS[kind][b] for b, t in beat_times(scene, cues, slide_in).items()]
             if kind in ART_BEATS else [])
    return max(ends, default=0.0)


# ------------------------------------------------------------------ the video's schedule


def step_spans(steps: list[int | None], starts: list[float], durations: list[float]) -> list[tuple[int, float, float]]:
    """(step number, start, end) per step; consecutive scenes with one number are pages of one step."""
    spans: list[list] = []
    for n, s, d in zip(steps, starts, durations):
        if n is None:
            continue
        if spans and spans[-1][0] == n:
            spans[-1][2] = s + d
        else:
            spans.append([n, s, s + d])
    return [tuple(x) for x in spans]


def progress_fill(t: float, spans: list[tuple[int, float, float]]) -> float:
    """How many progress segments are filled at video time t, fractionally: the current step's segment fills
    continuously across its pages; before the first step nothing is filled, after the last everything is."""
    filled = 0.0
    for k, (_, s, e) in enumerate(spans):
        if t >= e:
            filled = k + 1.0
        elif t >= s:
            return k + (t - s) / (e - s)
        else:
            break
    return filled
