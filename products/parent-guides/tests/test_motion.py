"""The motion layer (v2): texts reveal with the narration line that speaks them, the picture plays its beats (none
under a slide), scenes slide a short way and cross-fade, the progress bar fills continuously, the hook's question is
whole on the first frame while the rest of the hook moves from 0.0 s, the end card holds fully opaque for its whole
hold - and nothing is drawn where short-video apps draw their interface, no illustration part is cut off by its box,
the settled frames are the layout-checked frames, and the output is byte-identical.

The frame tests use the sample on silent timing (captions spread over each scene, as --voice none renders it), so
they need no voice model."""

import hashlib
import math
from pathlib import Path

import pytest

pytest.importorskip("PIL")

import numpy as np  # noqa: E402

import art  # noqa: E402
import compose  # noqa: E402
import frame  # noqa: E402
import motion as M  # noqa: E402
import render  # noqa: E402
import spec as S  # noqa: E402
from canvas import PAPER, engine_auto  # noqa: E402

PRODUCT = Path(__file__).resolve().parents[1]
FPS = render.FPS


def silent_timeline(sp: dict) -> list[dict]:
    tl, t0 = [], 0.0
    for i, (sc, seen) in enumerate(zip(sp["scenes"], S.titles_seen(sp))):
        dur, cues, _ = render.silent_scene(sc, seen, slide_in=i > 0)
        tl.append({"id": sc["id"], "start": t0, "duration": dur, "cues": cues})
        t0 += dur
    tl.append({"id": "end-card", "start": t0, "duration": render.end_card_duration(sp), "cues": []})
    return tl


@pytest.fixture(scope="module")
def sp() -> dict:
    return S.load(PRODUCT / "specs" / "yt-kids-setup.he.json")


@pytest.fixture(scope="module")
def video(sp):
    return compose.Video(sp, silent_timeline(sp), engine_auto(), sp["ai_line"])


@pytest.fixture(scope="module")
def settled(sp):
    """The layout-checked still of every scene (render_scene), keyed by scene id."""
    total = len(S.step_numbers(sp))
    return {sc["id"]: frame.render_scene(sc, sp, engine_auto(), sp["ai_line"], 0, total) for sc in sp["scenes"]}


def arr(img) -> np.ndarray:
    return np.asarray(img.convert("RGB")).astype(int)


def region(a: np.ndarray, box) -> np.ndarray:
    x0, y0, x1, y1 = box
    return a[y0:y1, x0:x1]


# the narration measured on 29.9.2026 (manifest of the rendered v2): per scene, each line's (start, end), local
MEASURED = {"s0-hook": [(0.15, 2.369), (2.819, 4.867)],
            "s1-account-profile": [(0.15, 2.795), (3.245, 5.187), (5.637, 8.261)],
            "s2-content-setting": [(0.15, 2.454), (2.904, 6.04), (6.49, 8.666)],
            "s3-passcode": [(0.15, 2.475), (2.925, 4.824)],
            "s4-search": [(0.15, 3.115), (3.565, 6.083), (6.533, 9.029)],
            "s4b-search-caveat": [(0.15, 2.326), (2.776, 5.741)],
            "s5-timer": [(0.15, 2.518), (2.968, 5.549), (5.999, 9.69), (10.14, 12.743)],
            "s6-block": [(0.15, 2.774), (3.224, 5.336), (5.786, 8.303), (8.753, 11.484)],
            "s6b-report": [(0.15, 3.307), (3.757, 6.829)],
            "s7-outro": [(0.15, 2.646)]}
NARRATED = {"s0-hook": 5.317, "s1-account-profile": 8.711, "s2-content-setting": 9.116, "s3-passcode": 5.274,
            "s4-search": 9.479, "s4b-search-caveat": 6.191, "s5-timer": 13.193, "s6-block": 11.934,
            "s6b-report": 7.279, "s7-outro": 3.096}


def measured_cues(sid: str) -> list[dict]:
    return [{"start": s, "end": e} for s, e in MEASURED[sid]]


# ------------------------------------------------------------------ the plan (no drawing)


def test_reveals_ease_in_over_250_ms_and_transitions_stay_under_300_ms():
    assert M.REVEAL_S == 0.25 and M.TRANSITION_S <= 0.30 and M.SLIDE_FRAC <= 0.35
    assert M.reveal_progress(1.0, 1.0) == 0 and M.reveal_progress(1.25, 1.0) == 1
    assert 0 < M.reveal_progress(1.1, 1.0) < 1
    assert [M.reveal_progress(1.0 + k / 30, 1.0) for k in range(9)] == sorted(
        M.reveal_progress(1.0 + k / 30, 1.0) for k in range(9))


def expected_anchor(a, cues) -> float:
    if a == M.START:
        return 0.0
    if isinstance(a, list):
        n, off = a
        return cues[n]["end"] if off == "end" else cues[n]["start"] - M.REVEAL_LEAD_S + off
    return cues[a]["start"] - M.REVEAL_LEAD_S


def test_each_body_item_reveals_with_the_narration_line_that_speaks_it(sp):
    """Anchor n starts REVEAL_LEAD_S before line n is heard, [n, s] s seconds after that, [n, "end"] when line n
    stops; items on one anchor follow each other by STAGGER_S. Checked for every scene of the sample with its own
    motion keys."""
    for sc in sp["scenes"]:
        lines = S.narration_lines(sc)
        cues = [{"start": 0.15 + 2.5 * k, "end": 2.0 + 2.5 * k} for k in range(len(lines))]
        anchors = sc["motion"]["reveal"]
        assert len(anchors) == len(S.body_items(sc)), sc["id"]
        times, seen = M.reveal_times(sc, cues), {}
        for a, t in zip(anchors, times):
            key = tuple(a) if isinstance(a, list) else a
            k = seen.get(key, 0)
            seen[key] = k + 1
            assert t == pytest.approx(expected_anchor(a, cues) + k * M.STAGGER_S), (sc["id"], a)


def test_offset_and_end_anchors_land_inside_and_after_a_line():
    cues = [{"start": 0.15, "end": 2.4}, {"start": 2.85, "end": 5.0}]
    assert M.anchor_time([1, 1.0], cues) == pytest.approx(2.85 - M.REVEAL_LEAD_S + 1.0)
    assert M.anchor_time([0, "end"], cues) == pytest.approx(2.4)
    assert M.anchor_time([0, -0.5], cues) == 0.0  # never before the scene starts


def test_the_hook_moves_from_0_s(sp):
    hook = sp["scenes"][0]
    cues = measured_cues("s0-hook")
    assert hook["motion"]["reveal"][0] == M.START and M.reveal_times(hook, cues)[0] == 0.0  # the promise
    beats = M.beat_times(hook, cues)
    assert beats["pop"] == 0.0 and beats["phone"] == 0.0  # the "6" pops and the phone rises from 0.0 s
    # the rows move while "YouTube Kids" is said, and the "6" swells again on "שישה"
    assert 0.9 < beats["rows"] < 1.3 and beats["pulse"] == pytest.approx(cues[1]["start"] - M.REVEAL_LEAD_S)


def test_no_beat_starts_while_its_scene_is_still_sliding_in(sp):
    """A beat that starts under the slide is hidden by it (review of v2): in every scene after the hook, beats start
    once the slide has come to rest."""
    for i, sc in enumerate(sp["scenes"]):
        beats = M.beat_times(sc, measured_cues(sc["id"]), slide_in=i > 0)
        if i > 0:
            assert min(beats.values()) >= M.TRANSITION_S + M.BEAT_AFTER_SLIDE_S - 1e-9, sc["id"]


def test_body_items_appear_top_to_bottom(sp):
    """No hole: an item never appears below one that is still missing (the v2 s6b page left a gap for 3.7 s)."""
    for sc in sp["scenes"]:
        times = M.reveal_times(sc, measured_cues(sc["id"]))
        assert times == sorted(times), (sc["id"], times)


def test_motion_keys_are_validated(sample):
    assert S.validate(sample) == []
    sc = sample["scenes"][6]  # the timer: 3 body items, 4 narration lines
    sc["motion"]["reveal"] = [0, 2]
    sc["motion"]["art"]["wobble"] = 0
    sample["scenes"][1]["motion"]["reveal"] = [0, 1, 7]
    sample["scenes"][2]["motion"]["art"]["select"] = "later"
    sample["scenes"][3]["motion"]["art"]["open"] = [1, "soon"]
    sample["scenes"][4]["motion"]["art"]["switch"] = [5, 0.5]
    sample["scenes"][6]["motion"]["highlight"] = {"7": 0, "1": [3, 0.4]}
    sample["scenes"][8]["motion"]["reveal"] = [0, [1, "end"], [1, 0.8]]  # well-formed anchors pass
    problems = S.validate(sample)
    assert any("s5-timer: motion.reveal needs one anchor per body item (3)" in p for p in problems)
    assert any("beat 'wobble'" in p for p in problems)
    assert any("s1-account-profile: motion.reveal[2] = 7" in p for p in problems)
    assert any("motion.art['select'] = 'later'" in p for p in problems)
    assert any("motion.art['open'] = [1, 'soon']" in p for p in problems)
    assert any("motion.art['switch'] = [5, 0.5]" in p for p in problems)
    assert any("motion.highlight names body item '7'" in p for p in problems)
    assert not any("s6b-report" in p for p in problems)
    assert not any("highlight['1']" in p for p in problems)


def test_the_reading_rule_counts_from_when_a_text_appears():
    sc = {"on_screen_title": "קצר", "on_screen_body": "א" * 40 + "\n" + "ב" * 100,
          "narration": "אַחַת\nשְׁתַּיִם", "motion": {"reveal": [0, 1]}}
    cues = [{"start": 0.15, "end": 2.0}, {"start": 6.0, "end": 8.0}]
    # all at once it is 145 characters, 10.4 s; revealed with line 2 at 5.9 s the last item is read at 13.1 s
    assert render.reading_time(sc) == pytest.approx(145 / 14)
    assert render.revealed_reading_time(sc, False, cues) == pytest.approx(5.9 + 101 / 14)
    assert render.scene_timing(10.5, sc)["too_dense"] is False
    assert render.scene_timing(10.5, sc, cues=cues)["too_dense"] is True
    sc["motion"]["reveal"] = [0, 0]  # shown with the first line, it fits
    assert render.scene_timing(10.5, sc, cues=cues)["too_dense"] is False
    sc["motion"]["reveal"] = ["start", "start"]  # everything at 0: exactly the old rule
    assert render.revealed_reading_time(sc, False, cues) == pytest.approx(render.reading_time(sc))


def test_every_scene_of_the_sample_is_readable_in_reveal_order(sp):
    """With the narration measured on 29.9.2026, every scene's text can be read, in the order it appears, within its
    narration plus MAX_HOLD_S, and its motion rests inside the scene."""
    for i, (sc, seen) in enumerate(zip(sp["scenes"], S.titles_seen(sp))):
        t = render.scene_timing(NARRATED[sc["id"]], sc, seen, measured_cues(sc["id"]), slide_in=i > 0)
        assert not t["too_dense"], (sc["id"], t)
        assert t["motion_rest_s"] <= t["duration"], (sc["id"], t)


def test_s6_reveals_the_block_path_with_the_question_it_answers(sp):
    """Revealing the ~80-character block path with the line after the question left the scene 0.53 s longer, all of
    it a dead tail (review of v2); with the question it is read in time and the narration sets the length again."""
    i, sc = next((i, sc) for i, sc in enumerate(sp["scenes"]) if sc["id"] == "s6-block")
    t = render.scene_timing(NARRATED["s6-block"], sc, False, measured_cues("s6-block"), slide_in=True)
    assert t["duration"] == render.quantize(NARRATED["s6-block"])


def test_progress_fills_continuously_and_monotonically(video):
    fills = [M.progress_fill(n / FPS, video.spans) for n in range(video.first[-1])]
    assert all(b >= a for a, b in zip(fills, fills[1:]))
    assert fills[0] == 0 and fills[video.first[1] - 1] == 0  # the hook: nothing filled
    assert fills[-1] == video.total_steps  # the outro: every step done
    fractional = [f for f in fills if f != int(f)]
    assert len(fractional) > 0.8 * (video.first[-2] - video.first[1])  # it moves on almost every frame of the steps
    steps = [f2 - f1 for f1, f2 in zip(fills, fills[1:])]
    assert max(steps) < 0.02  # no jumps, also across the two pages of steps 4 and 6


def _dx(op) -> int:
    return op[4]  # ("layer", i, name, q, dx, dy) and ("art", i, key, q, dx, dy)


def test_scenes_slide_in_from_the_left_and_rest_by_300_ms(video):
    n0 = video.first[1]
    ops = [op for op in video.ops_at(n0 + 4) if op[0] in ("layer", "art")]
    assert any(op[1] == 1 and _dx(op) < 0 for op in ops)  # the new scene enters from the left
    assert any(op[1] == 0 and _dx(op) > 0 for op in ops)  # the hook leaves to the right
    assert all(op[3] < 255 for op in ops)  # ... while they cross-fade
    rest = n0 + math.ceil(M.TRANSITION_S * FPS)
    assert all(_dx(op) == 0 for op in video.ops_at(rest) if op[0] in ("layer", "art"))
    assert all(op[1] == 1 for op in video.ops_at(rest) if op[0] in ("layer", "art"))


def test_the_slide_moves_little_enough_per_frame_not_to_strobe(video):
    """A full-width slide in 280 ms moved sharp text ~330 px between two frames (review of v2). The slide now
    travels SLIDE_FRAC of the width: no layer moves more than 70 px from one frame to the next."""
    for f0 in video.first[1:-1]:
        pos = {}
        for n in range(f0 - 1, f0 + math.ceil(M.TRANSITION_S * FPS) + 1):
            for op in video.ops_at(n):
                if op[0] in ("layer", "art"):
                    pos.setdefault((op[1], op[2] if op[0] == "layer" else "art"), []).append((n, _dx(op)))
        for key, seq in pos.items():
            for (na, a), (nb, b) in zip(seq, seq[1:]):
                if nb == na + 1:
                    assert abs(b - a) <= 70, (f0, key, a, b)


def test_a_later_page_of_a_step_keeps_its_header_and_title_still(video):
    i = [sc["id"] for sc in video.scenes].index("s4b-search-caveat")
    ops = video.ops_at(video.first[i] + 4)
    still = [op for op in ops if op[0] == "layer" and op[2] in ("header", "title")]
    assert still and all(op[1] == i and op[4] == 0 for op in still)
    assert any(op[0] == "layer" and op[2].startswith("item") and op[4] != 0 for op in ops)


# ------------------------------------------------------------------ frames


def test_the_question_is_whole_on_the_first_frame_and_the_hook_moves_from_0_s(video, settled):
    """The hook's script says "The question is on screen from the first frame" (review of v2: frame 0 was nearly
    blank, and it is also the poster frame and the frame a Short loops back to). The promise, the phone and the "6"
    move from 0.0 s, and by 0.2 s the "6" is there."""
    rep = settled["s0-hook"][1]
    still, f0 = arr(settled["s0-hook"][0]), arr(video.frame(0))
    title = rep["title_box"]
    assert (region(f0, title) == region(still, title)).all()
    assert video.reveal_state(0)[("s0-hook", "title")] == 1.0
    box = rep["illustration_box"]
    assert (region(arr(video.frame(1)), box) != region(f0, box)).any()  # the picture moves from the first frame
    assert 0 < video.reveal_state(1)[("s0-hook", "item0")] < 1  # and so does the promise
    yellow = lambda a: int(((a[..., 0] > 200) & (a[..., 1] > 150) & (a[..., 2] < 110)).sum())  # noqa: E731
    assert yellow(region(arr(video.frame_at(0.2)), box)) >= 0.6 * yellow(region(still, box))  # the "6" disc


def test_frames_show_each_text_only_from_the_line_that_speaks_it(video, settled):
    """For every body item: the frame before its reveal starts shows only paper where it will be; the frame after
    its reveal has settled shows it exactly as the layout-checked still."""
    checked = 0
    for i, (sc, plan) in enumerate(zip(video.scenes, video.plans)):
        still, rep = arr(settled[sc["id"]][0]), settled[sc["id"]][1]
        t0 = video.first[i] / FPS
        for k, t in enumerate(plan["reveal"]):
            box = rep["item_boxes"][k]
            before = math.floor((t0 + t) * FPS) - 1
            if before >= video.first[i] and (i == 0 or before / FPS - t0 >= M.TRANSITION_S):  # no slide on the hook
                assert (region(arr(video.frame(before)), box) == PAPER).all(), (sc["id"], k, "before")
                checked += 1
            after = math.ceil((t0 + t + M.REVEAL_S) * FPS) + 1
            assert after < video.first[i + 1]
            assert (region(arr(video.frame(after)), box) == region(still, box)).all(), (sc["id"], k, "after")
    assert checked >= 10  # every item not revealed on a scene's first frame or while it is still sliding in


def test_the_settled_frame_of_every_scene_is_its_layout_checked_still(video, settled):
    """The last frame of each scene equals render_scene's still outside the progress band (which fills
    continuously), so the layout checks (margins, safe area, spacing, no red) hold for what the video shows."""
    y0, y1 = frame.PROGRESS_STRIP[1], frame.PROGRESS_STRIP[3]
    for i, sc in enumerate(video.scenes):
        f, still = arr(video.frame(video.first[i + 1] - 1)), arr(settled[sc["id"]][0])
        assert (f[:y0] == still[:y0]).all() and (f[y1:] == still[y1:]).all(), sc["id"]


def test_motion_never_draws_above_y_180_or_below_y_1500(video):
    """Every frame of the first 2 s and of every transition, and every 4th frame otherwise: rows above 180 and from
    1500 down are paper, and no frame has red."""
    ns = set(range(0, 2 * FPS)) | set(range(0, video.n_frames, 4))
    for f in video.first[1:]:
        ns |= set(range(f, min(video.n_frames, f + math.ceil(M.TRANSITION_S * FPS) + 1)))
    paper = np.array(PAPER, dtype=np.uint8)
    for n in sorted(ns):
        a = np.asarray(video.frame(n))
        assert (a[:180] == paper).all() and (a[1500:] == paper).all(), n
        red = (a[..., 0] > 150) & (a[..., 1] < 100) & (a[..., 2] < 100)
        assert not red.any(), n


def test_a_highlight_runs_along_its_item_and_leaves_no_trace(video, settled):
    """s5: while "כדי לפתוח, נכנסים שוב להגדרות" is said, a marker runs behind the unlock chain, right to left, and
    fades away; outside its window the item is exactly the still."""
    i = [sc["id"] for sc in video.scenes].index("s5-timer")
    plan, (still_img, rep) = video.plans[i], settled["s5-timer"]
    (k, start), = plan["highlights"].items()
    box = [v + d for v, d in zip(rep["item_boxes"][k], (-12, -8, 12, 8))]
    t0 = video.first[i] / FPS
    mid = round((t0 + start + M.HIGHLIGHT_S[0] + 0.2) * FPS)
    assert any(op[0] == "mark" for op in video.ops_at(mid))
    assert (region(arr(video.frame(mid)), box) != region(arr(still_img), box)).any()
    first_line = rep["item_lines"][k][0]
    part = round((t0 + start + 0.3) * FPS)  # a third of the way: the marker is under the right end only
    a = arr(video.frame(part))
    y = (first_line[1] + first_line[3]) // 2
    right, left = a[y, first_line[2] - 40:first_line[2]], a[y, first_line[0]:first_line[0] + 40]
    assert (right == (214, 234, 228)).all(axis=-1).any() and not (left == (214, 234, 228)).all(axis=-1).any()
    after = math.ceil((t0 + start + sum(M.HIGHLIGHT_S)) * FPS) + 1
    assert after < video.first[i + 1]
    assert (region(arr(video.frame(after)), box) == region(arr(still_img), box)).all()


def test_the_end_card_holds_fully_opaque_for_its_whole_hold(sp, video):
    """The cross-fade used to eat 0.28 s of the card's 5 s (review of v2): the card now fades in and then stays
    fully opaque for end_card_hold_s, so the AI and non-affiliation lines get the whole hold."""
    hold = float(sp["end_card_hold_s"])
    assert render.end_card_duration(sp) >= hold + M.TRANSITION_S
    card = [video.ops_at(n) for n in range(video.first[-1], video.n_frames)]
    assert sum(ops == (("card", 255),) for ops in card) >= round(hold * FPS)
    assert card[0][0][1] < 255  # it does fade in


def test_no_illustration_part_is_cut_off_by_its_layer_at_any_beat(sp):
    """The hook's rising phone was sliced flat at the bottom for its first 7 frames (review of v2): the layer's own
    edge cut it, which the safe-area tests cannot see. Every kind, at every beat state, leaves its layer's border
    transparent."""
    labels = {sc["illustration"]["kind"]: sc["illustration"].get("labels", []) for sc in sp["scenes"]}
    eng = engine_auto()
    for kind, beats in M.ART_BEATS.items():
        states = [{b: p for b in beats} for p in (0.0, 0.03, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0)]
        states += [{**{b: 1.0 for b in beats}, one: p} for one in beats for p in (0.03, 0.2, 0.5, 0.8)]
        for st in states:
            a = np.asarray(art.illustration(kind, eng, labels.get(kind, []), st).img.getchannel("A"))
            edge = np.concatenate([a[:3].ravel(), a[-3:].ravel(), a[:, :3].ravel(), a[:, -3:].ravel()])
            assert edge.max() == 0, (kind, st)


def test_a_rising_text_is_clipped_at_the_safe_area():
    """compose.blit keeps a layer inside the band even when its position would take it out."""
    from PIL import Image

    dst = Image.new("RGBA", (1080, 1920), PAPER + (255,))
    ink = Image.new("RGBA", (200, 100), (20, 33, 61, 255))
    compose.blit(dst, ink, 100, 1450)  # would reach y 1550
    compose.blit(dst, ink, 100, 120)   # would start at y 120
    a = arr(dst)
    assert (a[:180] == PAPER).all() and (a[1500:] == PAPER).all()
    assert (a[1450:1500, 100:300] != PAPER).all() and (a[180:220, 100:300] != PAPER).all()


def test_every_illustration_beat_draws_and_settles_on_the_still(sp):
    """Each kind draws at every beat state, and with every beat at 1.0 it is exactly the still picture."""
    labels = {sc["illustration"]["kind"]: sc["illustration"].get("labels", []) for sc in sp["scenes"]}
    eng = engine_auto()
    for kind, beats in M.ART_BEATS.items():
        lab = labels.get(kind, [])
        still = np.asarray(art.render(kind, eng, lab, 300, 260))
        assert (np.asarray(art.render(kind, eng, lab, 300, 260, {b: 1.0 for b in beats})) == still).all(), kind
        before = np.asarray(art.render(kind, eng, lab, 300, 260, {b: 0.0 for b in beats}))
        assert (before != still).any(), f"{kind}: nothing moves"
        for p in (0.1, 0.33, 0.5, 0.77, 0.95):
            art.render(kind, eng, lab, 300, 260, {b: p for b in beats})


def test_the_keypad_sweep_never_rests_on_a_count():
    """The code's digit count is not sourced (logs/2026-09-29-yt-kids-sample-review-fixes.md): the light runs over
    all ten keys and none stays lit before or after it."""
    eng = engine_auto()
    lit = lambda p: np.asarray(art.illustration("passcode", eng, ["3 × 4 = ?", "או"], {"keys": p}).img)  # noqa
    assert (lit(0.0) == lit(1.0)).all()
    moving = [lit(p) for p in (0.2, 0.5, 0.8)]
    assert all((m != lit(1.0)).any() for m in moving)


# ------------------------------------------------------------------ determinism


def _digest(v, ns) -> str:
    h = hashlib.sha256()
    for n in ns:
        h.update(v.frame(n).tobytes())
    return h.hexdigest()


def test_frames_are_deterministic(sp, video):
    other = compose.Video(sp, silent_timeline(sp), engine_auto(), sp["ai_line"])
    ns = list(range(0, 60)) + list(range(60, video.n_frames, 37)) + [video.n_frames - 1]
    assert _digest(other, ns) == _digest(video, ns)


def test_the_encoded_video_is_byte_identical_on_a_re_render(sp, tmp_path):
    tl = silent_timeline(sp)
    stop = 45
    outs = []
    for k in range(2):
        v = compose.Video(sp, tl, engine_auto(), sp["ai_line"])
        mp4 = tmp_path / f"clip{k}.mp4"
        render.encode(v, None, None, stop / FPS, "מהודק · בדיקה", "מהודק", mp4, stop=stop)
        outs.append(mp4.read_bytes())
    assert outs[0] == outs[1] and len(outs[0]) > 10_000
