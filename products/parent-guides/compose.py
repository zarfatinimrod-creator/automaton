"""Per-frame compositor: turns the scenes' layers and the motion plan (motion.py) into 1080x1920 RGB frames.

Each scene is laid out once by frame.scene_layers(); its layers (tag, header, title, one per body item, the
illustration) are 1x RGBA crops with positions. A video frame is paper, the tag, the progress band, and the scene's
layers at their state for that instant: a body item faded and risen by its reveal progress (with its highlight
marker behind it while one runs), the illustration redrawn at its beats' progress, and during a transition the
outgoing and incoming scenes offset sideways by up to motion.SLIDE_FRAC of the width while they cross-fade.

Nothing is drawn above frame.SAFE_TOP or below frame.SAFE_BOTTOM: every layer is clipped to that band when it is
composited, so a rising text or a sliding scene can never reach where Shorts, Reels and TikTok draw their interface.
The end card (all inside the band) cross-fades in whole.

Deterministic: every value is a function of the frame number, Pillow's drawing and resampling are deterministic,
and the frames go to ffmpeg as raw RGB, so the same spec, narration and tools give the same bytes.
"""

from __future__ import annotations

from collections import OrderedDict

from PIL import Image, ImageDraw

import art
import frame
import motion as M
import spec as S
from canvas import PAPER, SS, TEAL_SOFT, W, H

FPS = 30
BAND = (0, frame.SAFE_TOP, W, frame.SAFE_BOTTOM)
CHROME = ("progress", "tag")  # drawn per frame, never moved
FADE_OUT = 0.7  # in a transition the outgoing scene is gone by 70% of it, and the incoming one starts at 30%
MARK_PAD = (10, 6)  # a highlight marker reaches this far beyond its text line (x, y)


def blit(dst: Image.Image, src: Image.Image, x: int, y: int, clip=BAND):
    """Alpha-composite src onto dst with its top left at (x, y), keeping only what falls inside clip."""
    cx0, cy0, cx1, cy1 = clip
    sx0, sy0 = max(0, cx0 - x), max(0, cy0 - y)
    sx1, sy1 = min(src.width, cx1 - x), min(src.height, cy1 - y)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    dst.alpha_composite(src, dest=(x + sx0, y + sy0), source=(sx0, sy0, sx1, sy1))


class _LRU(OrderedDict):
    def __init__(self, size):
        super().__init__()
        self.size = size

    def get_or(self, key, make):
        if key in self:
            self.move_to_end(key)
            return self[key]
        v = self[key] = make()
        if len(self) > self.size:
            self.popitem(last=False)
        return v


class Video:
    """The whole video as frames. timeline: one entry per scene and then the end card, as render.py builds it:
    {"id", "start", "duration", "cues": [{"start", "end", ...}]} with times in seconds, scene durations whole frames."""

    def __init__(self, spec: dict, timeline: list[dict], engine: str, ai_line: str, fps: int = FPS):
        self.spec, self.engine, self.fps = spec, engine, fps
        scenes = spec["scenes"]
        self.scenes = scenes
        segs, end = timeline[:len(scenes)], timeline[len(scenes)]
        self.total_steps = len(S.step_numbers(spec))
        self.seen = S.titles_seen(spec)
        self.first = [round(seg["start"] * fps) for seg in segs] + [round(end["start"] * fps)]
        self.n_frames = round((end["start"] + end["duration"]) * fps)
        steps = [S.split_title(sc["on_screen_title"])[0] for sc in scenes]
        self.spans = M.step_spans(steps, [seg["start"] for seg in segs], [seg["duration"] for seg in segs])
        self.plans = []
        for i, (sc, seg) in enumerate(zip(scenes, segs)):
            fr, rep = frame.scene_layers(sc, spec, engine, ai_line, 0, self.total_steps)
            layers = fr.layers_1x()
            self.plans.append({
                "scene": sc, "report": rep, "order": [n for n, *_ in layers],
                "layers": {n: (im, x, y) for n, im, x, y in layers},
                "reveal": M.reveal_times(sc, seg["cues"]),
                "beats": M.beat_times(sc, seg["cues"], slide_in=i > 0),  # the hook has no slide in
                "highlights": M.highlight_times(sc, seg["cues"]),
                "duration": round(seg["duration"] * fps) / fps,
            })
        card, _ = frame.render_end_card(spec, engine, ai_line)
        self.card = card.convert("RGB")
        self._faded = _LRU(96)
        self._art = _LRU(24)
        self._marks = _LRU(8)
        self._last_ops, self._content = None, None
        self._outro_last = None

    # -------------------------------------------------------------- state

    def locate(self, n: int) -> tuple[int, float]:
        """(scene index, local time) of frame n; index len(scenes) is the end card."""
        i = max(k for k, f in enumerate(self.first) if f <= n)
        return i, (n - self.first[i]) / self.fps

    def _scene_ops(self, i: int, local: float, dx: int, skip=(), alpha: float = 1.0) -> list[tuple]:
        """The scene's layers at local time `local`, offset by dx and faded by alpha (a transition)."""
        plan, ops = self.plans[i], []
        if alpha <= 0:
            return ops
        for name in plan["order"]:
            if name in CHROME or name in skip:
                continue
            if name == "illustration":
                p = M.beat_progress(plan["scene"], plan["beats"], local)
                ops.append(("art", i, tuple(round(v, 4) for v in p.values()), round(alpha * 255), dx, 0))
                continue
            r = 1.0  # the header and the title (on the hook, the question: on screen from the first frame)
            if name.startswith("item"):
                k = int(name[4:])
                r = M.reveal_progress(local, plan["reveal"][k])
                if k in plan["highlights"]:
                    run, a = M.highlight_state(local, plan["highlights"][k])
                    if a > 0 and run > 0:
                        ops.append(("mark", i, k, round(run * 255), round(a * alpha * 255), dx))
            q = round(r * alpha * 255)
            if q > 0:
                ops.append(("layer", i, name, q, dx, round(M.RISE_PX * (1 - r))))
        return ops

    def ops_at(self, n: int) -> tuple:
        """Everything that decides frame n's picture apart from the progress band, as a comparable tuple."""
        i, local = self.locate(n)
        if i == len(self.scenes):
            if local < M.TRANSITION_S:
                return (("card", round(M.ease_in_out(local / M.TRANSITION_S) * 255)),)
            return (("card", 255),)
        ops = [("chrome", i)]
        if i > 0 and local < M.TRANSITION_S:
            u = local / M.TRANSITION_S
            p = M.ease_sine(u)
            travel = M.SLIDE_FRAC * W
            fixed = ("header", "title") if self.seen[i] else ()
            # right to left: the next scene comes in from the left, the previous one leaves to the right; they
            # cross-fade, so the travel can stay short enough not to strobe
            ops += self._scene_ops(i - 1, self.plans[i - 1]["duration"], round(travel * p), skip=fixed,
                                   alpha=1 - M.clamp(u / FADE_OUT))
            ops += self._scene_ops(i, local, -round(travel * (1 - p)), skip=fixed,
                                   alpha=M.clamp((u - (1 - FADE_OUT)) / FADE_OUT))
            ops += [("layer", i, name, 255, 0, 0) for name in fixed if name in self.plans[i]["layers"]]
        else:
            ops += self._scene_ops(i, local, 0)
        return tuple(ops)

    def reveal_state(self, n: int) -> dict[tuple[str, str], float]:
        """{(scene id, layer name): opacity 0..1} of every text layer drawn on frame n (tests and the manifest)."""
        out = {}
        for op in self.ops_at(n):
            if op[0] == "layer":
                out[(self.scenes[op[1]]["id"], op[2])] = op[3] / 255
        return out

    # -------------------------------------------------------------- drawing

    @staticmethod
    def _fade(im: Image.Image, q: int) -> Image.Image:
        out = im.copy()
        out.putalpha(im.getchannel("A").point([(v * q + 127) // 255 for v in range(256)]))
        return out

    def _layer(self, i: int, name: str, q: int) -> Image.Image:
        im = self.plans[i]["layers"][name][0]
        if q >= 255:
            return im
        return self._faded.get_or((i, name, q), lambda: self._fade(im, q))

    def _mark(self, i: int, k: int, run_q: int, a_q: int) -> tuple[Image.Image, int, int]:
        """The highlight marker behind body item k: soft rounded bars behind its lines, filled in reading order (top
        line first, each from the right) up to run_q/255 of their total length, at opacity a_q/255. Drawn at SSx and
        downsampled, as the text is. Returns (image, x, y)."""
        lines = self.plans[i]["report"]["item_lines"][k]
        px, py = MARK_PAD
        bars = [(x0 - px, y0 - py, x1 + px, y1 + py) for x0, y0, x1, y1 in lines]
        X0, Y0 = min(b[0] for b in bars), min(b[1] for b in bars)
        X1, Y1 = max(b[2] for b in bars), max(b[3] for b in bars)

        def draw():
            im = Image.new("RGBA", ((X1 - X0) * SS, (Y1 - Y0) * SS), (0, 0, 0, 0))
            d = ImageDraw.Draw(im)
            left = sum(b[2] - b[0] for b in bars) * run_q / 255
            for x0, y0, x1, y1 in bars:
                w = min(left, x1 - x0)
                left -= w
                if w <= 0:
                    break
                r = min((y1 - y0) / 2, 14, w / 2)
                d.rounded_rectangle(((x1 - w - X0) * SS, (y0 - Y0) * SS, (x1 - X0) * SS, (y1 - Y0) * SS),
                                    radius=r * SS, fill=TEAL_SOFT + (255,))
            im = im.resize((X1 - X0, Y1 - Y0), Image.LANCZOS)
            return self._fade(im, a_q) if a_q < 255 else im
        return self._marks.get_or((i, k, run_q, a_q), draw), X0, Y0

    def _art_img(self, i: int, key: tuple, q: int = 255) -> Image.Image:
        plan = self.plans[i]
        a = plan["report"]["art"]

        def draw():
            beats = dict(zip(M.ART_BEATS[a["kind"]], key))
            x0, y0, x1, y1 = a["box"]
            return art.render(a["kind"], self.engine, a["labels"], x1 - x0, y1 - y0, beats)
        im = self._art.get_or((i, key), draw)
        return im if q >= 255 else self._fade(im, q)

    def _compose(self, ops: tuple) -> Image.Image:
        if ops[0][0] == "card":
            q = ops[0][1]
            if q >= 255:
                return self.card
            if self._outro_last is None:
                self._outro_last = self.frame(self.first[-1] - 1)
            return Image.blend(self._outro_last, self.card, q / 255)
        base = Image.new("RGBA", (W, H), PAPER + (255,))
        for op in ops:
            if op[0] == "chrome":
                im, x, y = self.plans[op[1]]["layers"]["tag"]
                blit(base, im, x, y)
            elif op[0] == "layer":
                _, i, name, q, dx, dy = op
                _, x, y = self.plans[i]["layers"][name]
                blit(base, self._layer(i, name, q), x + dx, y + dy)
            elif op[0] == "mark":
                _, i, k, run_q, a_q, dx = op
                im, x, y = self._mark(i, k, run_q, a_q)
                blit(base, im, x + dx, y)
            elif op[0] == "art":
                _, i, key, q, dx, dy = op
                x0, y0, *_ = self.plans[i]["report"]["art"]["box"]
                blit(base, self._art_img(i, key, q), x0 + dx, y0 + dy)
        return base.convert("RGB")

    def frame(self, n: int) -> Image.Image:
        """Frame n (0-based) as an RGB image."""
        ops = self.ops_at(n)
        if ops != self._last_ops:
            content = self._compose(ops)
            self._last_ops, self._content = ops, content
        img = self._content
        if ops[0][0] == "card":
            return img
        img = img.copy()
        fill = M.progress_fill(n / self.fps, self.spans)
        img.paste(frame.progress_strip(fill, self.total_steps, self.engine), frame.PROGRESS_STRIP[:2])
        return img

    def frame_at(self, t: float) -> Image.Image:
        return self.frame(round(t * self.fps))

    def write(self, stream, start: int = 0, stop: int | None = None):
        """Write frames [start, stop) to stream as raw rgb24 (what ffmpeg reads with -f rawvideo)."""
        for n in range(start, self.n_frames if stop is None else stop):
            stream.write(self.frame(n).tobytes())

    def schedule(self) -> list[dict]:
        """Per scene, the absolute times things move (for the manifest)."""
        out = []
        for sc, plan, f0 in zip(self.scenes, self.plans, self.first):
            t0 = f0 / self.fps
            out.append({"id": sc["id"],
                        "transition_in_s": None if f0 == 0 else [round(t0, 3), round(t0 + M.TRANSITION_S, 3)],
                        "reveals_s": {f"item{k}": round(t0 + t, 3) for k, t in enumerate(plan["reveal"])},
                        "highlights_s": {f"item{k}": round(t0 + t, 3) for k, t in plan["highlights"].items()},
                        "beats_s": {b: round(t0 + t, 3) for b, t in plan["beats"].items()}})
        return out
