"""Drawing surface, palette and right-to-left text for the parent-guide frames.

Recipe (carried over from the frame prototype of 28.9.2026):
  * engine="raqm"  -> Pillow's libraqm (FriBiDi + HarfBuzz). Text stays in logical order and is drawn with
                      direction="rtl", language="he" on every line, so a line that starts with "YouTube Kids"
                      is not guessed LTR.
  * engine="basic" -> fallback without raqm: lines are wrapped in logical order first, then each finished line
                      goes through bidi.algorithm.get_display(base_dir="R") (the pure-Python UBA, which mirrors
                      brackets; the top-level Rust get_display in python-bidi 0.6.11 does not) and is drawn
                      with the BASIC layout.
  * Wrapping breaks only at U+0020, balanced so the last line is not a lone word. display() joins with no-break
    spaces what must not split: the product names ("YouTube Kids", "YouTube For Families"), a quoted label
    („הגדרת טיימר”), a short parenthesis ("(גרסת Android)"), a step arrow and the item after it (so "›" starts a line and never ends one), and a " · "
    separator and the item before it. A maqaf or hyphen never breaks.
  * Everything is drawn at 2x and downsampled with LANCZOS.
Palette: warm paper, deep navy ink, calm teal, warm yellow. No red anywhere (tests/test_frames.py checks pixels).
"""

from __future__ import annotations

import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, features

HERE = Path(__file__).resolve().parent
FONT_PATH = HERE / "fonts" / "heebo" / "Heebo[wght].ttf"  # OFL 1.1, OFL.txt beside it

W, H = 1080, 1920
SS = 2  # supersampling factor

PAPER = (247, 244, 238)
INK = (20, 33, 61)
MUTED = (84, 94, 112)
TEAL = (31, 107, 92)
TEAL_SOFT = (214, 234, 228)
TEAL_MID = (172, 211, 200)
TRACK = (226, 220, 208)
WHITE = (255, 255, 255)
LINE = (205, 211, 220)
BAR = (196, 203, 214)
YELLOW = (240, 186, 58)
YELLOW_SOFT = (252, 236, 190)
AMBER_BG = (253, 241, 212)
AMBER = (196, 138, 22)
SKY_SOFT = (221, 229, 242)
DIM = (58, 68, 92)
PALETTE = {k: v for k, v in dict(globals()).items() if isinstance(v, tuple) and len(v) == 3 and k.isupper()}

NBSP = " "


def engine_auto() -> str:
    return "raqm" if features.check("raqm") else "basic"


QUOTED = re.compile("„[^”]*”")
PAREN = re.compile(r"\([^()]{1,24}\)")  # a short parenthesis, "(גרסת Android)", stays on one line


def display(text: str) -> str:
    """Display-only joins (see the module docstring); the words are unchanged."""
    t = text.replace("YouTube Kids", f"YouTube{NBSP}Kids").replace("YouTube For Families",
                                                                    f"YouTube{NBSP}For{NBSP}Families")
    t = QUOTED.sub(lambda m: m.group(0).replace(" ", NBSP), t)
    t = PAREN.sub(lambda m: m.group(0).replace(" ", NBSP), t)
    t = t.replace(" › ", f" ›{NBSP}")
    return t.replace(" · ", f"{NBSP}· ")


def s(v: float) -> int:
    return int(round(v * SS))


_font_cache: dict[tuple[int, int, str], ImageFont.FreeTypeFont] = {}


def font(size: int, weight: int, engine: str) -> ImageFont.FreeTypeFont:
    key = (size, weight, engine)
    if key not in _font_cache:
        layout = ImageFont.Layout.RAQM if engine == "raqm" else ImageFont.Layout.BASIC
        f = ImageFont.truetype(str(FONT_PATH), s(size), layout_engine=layout)
        f.set_variation_by_axes([weight])
        _font_cache[key] = f
    return _font_cache[key]


def visual(line: str, engine: str) -> str:
    if engine == "raqm":
        return line
    from bidi.algorithm import get_display

    return get_display(line, base_dir="R")


def text_kwargs(engine: str) -> dict:
    return {"direction": "rtl", "language": "he"} if engine == "raqm" else {}


def measure(line: str, size: int, weight: int, engine: str) -> float:
    """Advance width at 1x."""
    f = font(size, weight, engine)
    return f.getlength(visual(line, engine), **text_kwargs(engine)) / SS


def wrap(text: str, size: int, weight: int, max_w: float, engine: str) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = w if not cur else cur + " " + w
        if measure(trial, size, weight, engine) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def wrap_balanced(text: str, size: int, weight: int, max_w: float, engine: str) -> list[str]:
    lines = wrap(text, size, weight, max_w, engine)
    if len(lines) < 2:
        return lines
    lo, hi = max_w * 0.4, max_w
    while hi - lo > 4:
        mid = (lo + hi) / 2
        if len(wrap(text, size, weight, mid, engine)) == len(lines):
            hi = mid
        else:
            lo = mid
    return wrap(text, size, weight, hi, engine)


def metrics(size: int, weight: int, engine: str) -> tuple[float, float]:
    """(cap, descent) at 1x: how far glyphs reach above and below the baseline."""
    f = font(size, weight, engine)
    top = f.getbbox("לYKbdlה", anchor="ls")[1] / SS
    bottom = f.getbbox("ךןףץקgy,", anchor="ls")[3] / SS
    return -top, bottom


class Frame:
    """A drawing surface in 1x coordinates, backed by an SSx image.

    Layers (for the motion layer): after use(name), drawing goes to a transparent SSx layer of that name instead of
    the background. layers_1x() gives each layer downsampled to 1x and cropped to what it draws, with its position;
    final() composites them over the background in the order they were first used. compose.py moves, fades and
    re-draws those same layers per video frame, so a settled video frame and final() come from one path."""

    def __init__(self, engine: str, size=(W, H), bg=PAPER, mode="RGB"):
        self.engine = engine
        self.w, self.h = size
        self.bg = bg
        self.img = Image.new(mode, (s(size[0]), s(size[1])), bg)
        self.d = ImageDraw.Draw(self.img)
        self.boxes: list[tuple[str, tuple[int, int, int, int], str | None]] = []
        self.texts: list[tuple[str, str]] = []  # (name, text) for reports and tests
        self.layers: dict[str, Image.Image] = {}
        self.extra: list[tuple[str, Image.Image, int, int]] = []  # ready-made 1x RGBA layers (the illustration)
        self._layers_1x = None

    def use(self, name: str):
        """Draw on the named layer from now on (created transparent on first use)."""
        if name not in self.layers:
            self.layers[name] = Image.new("RGBA", self.img.size, (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.layers[name])
        self._layers_1x = None

    def add_layer_1x(self, name: str, img: Image.Image, x: int, y: int):
        self.extra.append((name, img, x, y))
        self._layers_1x = None

    def layers_1x(self) -> list[tuple[str, Image.Image, int, int]]:
        """[(name, RGBA image at 1x, x, y)]: each SSx layer cropped (with a margin wider than the LANCZOS kernel,
        aligned to whole 1x pixels, so the crop downsamples exactly as the full layer would) and downsampled."""
        if self._layers_1x is None:
            out, pad = [], 4 * SS
            for name, im in self.layers.items():
                bb = im.getchannel("A").getbbox()
                if not bb:
                    continue
                x0, y0 = max(0, (bb[0] // SS) * SS - pad), max(0, (bb[1] // SS) * SS - pad)
                x1 = min(im.width, -(-bb[2] // SS) * SS + pad)
                y1 = min(im.height, -(-bb[3] // SS) * SS + pad)
                crop = im.crop((x0, y0, x1, y1)).resize(((x1 - x0) // SS, (y1 - y0) // SS), Image.LANCZOS)
                out.append((name, crop, x0 // SS, y0 // SS))
            self._layers_1x = out + list(self.extra)
        return self._layers_1x

    def note(self, name: str, box, group: str | None = None):
        self.boxes.append((name, tuple(int(round(v)) for v in box), group))

    def text(self, xy, line: str, size: int, weight: int, fill, name: str | None = None,
             anchor: str = "rs", rtl: bool = True, group: str | None = None):
        f = font(size, weight, self.engine)
        vis = visual(line, self.engine) if rtl else line
        kw = text_kwargs(self.engine) if rtl else {}
        p = (s(xy[0]), s(xy[1]))
        self.d.text(p, vis, font=f, fill=fill, anchor=anchor, **kw)
        bb = [v / SS for v in self.d.textbbox(p, vis, font=f, anchor=anchor, **kw)]
        if name:
            self.note(name, bb, group)
            self.texts.append((name, line))
        return bb

    def rrect(self, box, r, fill=None, outline=None, width=0):
        """A rounded rectangle. A box with no area is skipped and the radius is capped at half the shorter side
        (a part that is still popping in can be tiny); no still picture relies on anything beyond that cap."""
        x0, y0, x1, y1 = box
        if x1 <= x0 or y1 <= y0:
            return
        r = min(r, (x1 - x0) / 2, (y1 - y0) / 2)
        self.d.rounded_rectangle((s(x0), s(y0), s(x1), s(y1)), radius=s(r), fill=fill,
                                 outline=outline, width=s(width) if width else 0)

    def rect(self, box, fill):
        x0, y0, x1, y1 = box
        if x1 < x0 or y1 < y0:
            return
        self.d.rectangle((s(x0), s(y0), s(x1), s(y1)), fill=fill)

    def circle(self, cx, cy, r, fill=None, outline=None, width=0):
        self.d.ellipse((s(cx - r), s(cy - r), s(cx + r), s(cy + r)), fill=fill,
                       outline=outline, width=s(width) if width else 0)

    def line(self, pts, fill, width, caps=False):
        self.d.line([(s(x), s(y)) for x, y in pts], fill=fill, width=s(width), joint="curve")
        if caps:
            for x, y in (pts[0], pts[-1]):
                self.circle(x, y, width / 2, fill=fill)

    def poly(self, pts, fill=None, outline=None, width=0):
        self.d.polygon([(s(x), s(y)) for x, y in pts], fill=fill, outline=outline,
                       width=s(width) if width else 1)

    def arc(self, box, start, end, fill, width):
        x0, y0, x1, y1 = box
        self.d.arc((s(x0), s(y0), s(x1), s(y1)), start, end, fill=fill, width=s(width))

    def paste_layer(self, layer: Image.Image, box):
        """Paste an RGBA layer (drawn at SSx) scaled into box (1x coordinates)."""
        x0, y0, x1, y1 = box
        lay = layer.resize((s(x1 - x0), s(y1 - y0)), Image.LANCZOS)
        self.img.paste(lay, (s(x0), s(y0)), lay)
        self.d = ImageDraw.Draw(self.img)

    def final(self) -> Image.Image:
        base = self.img.resize((self.w, self.h), Image.LANCZOS)
        if not self.layers and not self.extra:
            return base
        out = base.convert("RGBA")
        for _, im, x, y in self.layers_1x():
            out.alpha_composite(im, (x, y))
        return out.convert(base.mode)


def star_points(cx, cy, r_out, r_in, n=5, rot=-90):
    pts = []
    for i in range(2 * n):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts
