"""Frames: 1080x1920, no layout problems (margins, safe area, 12 px spacing), and no red anywhere - the brief
forbids imitating a red play button, so the palette has no red and the pixels are checked."""

import colorsys

import pytest

pytest.importorskip("PIL")

import frame  # noqa: E402
from canvas import PALETTE, engine_auto  # noqa: E402


def _reddish(rgb) -> bool:
    h, sat, v = colorsys.rgb_to_hsv(*(c / 255 for c in rgb))
    return (h < 20 / 360 or h > 340 / 360) and sat > 0.45 and v > 0.35


def test_palette_has_no_red():
    assert not [k for k, v in PALETTE.items() if _reddish(v)]


@pytest.mark.parametrize("engine", ["raqm", "basic"])
def test_every_frame_lays_out_cleanly(sample, engine):
    from PIL import features

    if engine == "raqm" and not features.check("raqm"):
        pytest.skip("Pillow without raqm")
    for sc in sample["scenes"]:
        img, rep = frame.render_scene(sc, sample, engine, sample["ai_line"], 1, 6)
        assert img.size == (1080, 1920)
        assert rep["problems"] == [], (sc["id"], rep["problems"])
        assert len(rep["title_lines"]) <= 2
        if sc.get("illustration"):
            assert rep["illustration_box"], f"{sc['id']}: illustration omitted"
    img, rep = frame.render_end_card(sample, engine, sample["ai_line"])
    assert img.size == (1080, 1920) and rep["problems"] == []


def test_no_red_pixels(sample):
    import numpy as np

    eng = engine_auto()
    for sc in sample["scenes"]:
        img, _ = frame.render_scene(sc, sample, eng, sample["ai_line"], 3, 6)
        a = np.asarray(img.convert("RGB")).astype(int)
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        red = (r > 150) & (g < 100) & (b < 100)
        assert int(red.sum()) == 0, f"{sc['id']}: {int(red.sum())} red pixels"


def test_a_long_title_wraps_to_two_lines_without_problems(sample):
    sc = dict(sample["scenes"][4])
    sc["on_screen_title"] = "4. החיפוש: להשאיר אותו פתוח לילדים, או להשבית?"
    _, rep = frame.render_scene(sc, sample, engine_auto(), sample["ai_line"], 4, 6)
    assert len(rep["title_lines"]) == 2 and rep["problems"] == []


def test_a_title_too_long_for_two_lines_is_reported(sample):
    sc = dict(sample["scenes"][4])
    sc["on_screen_title"] = "4. החיפוש: להשאיר אותו פתוח לילדים, או להשבית אותו בהגדרות ההורים?"
    _, rep = frame.render_scene(sc, sample, engine_auto(), sample["ai_line"], 4, 6)
    assert any("title needs 3 lines" in p for p in rep["problems"])


def test_product_name_never_splits(sample):
    eng = engine_auto()
    for sc in sample["scenes"]:
        _, rep = frame.render_scene(sc, sample, eng, sample["ai_line"], 1, 6)
        for ln in rep["title_lines"] + [x for b in rep["body_lines"] for x in b]:
            assert not ln.rstrip().endswith("YouTube") and not ln.lstrip().startswith("Kids"), ln


def test_overflowing_copy_is_reported_not_clipped(sample):
    sc = dict(sample["scenes"][2])
    sc["on_screen_body"] = "\n".join([sample["scenes"][2]["on_screen_body"]] * 4)
    _, rep = frame.render_scene(sc, sample, engine_auto(), sample["ai_line"], 2, 6)
    assert rep["problems"]


def test_nothing_sits_where_short_video_apps_draw_their_interface(sample):
    """Shorts, Reels and TikTok cover the top ~180 px, the bottom ~420 px and a column of buttons at the right. Every
    box stays inside y 180..1500 and x 120..960; the first cut put the AI line and the brand at y 1620-1710."""
    for sc in sample["scenes"]:
        _, rep = frame.render_scene(sc, sample, engine_auto(), sample["ai_line"], 2, 6)
        for name, (x0, y0, x1, y1) in rep["boxes"]:
            assert 179 <= y0 and y1 <= 1920 - 420 + 1, (sc["id"], name, y0, y1)
            assert 119 <= x0 and x1 <= 1080 - 120 + 1, (sc["id"], name, x0, x1)
    _, rep = frame.render_end_card(sample, engine_auto(), sample["ai_line"])
    assert all(179 <= b[1] and b[3] <= 1501 for _, b in rep["boxes"])


def test_a_step_arrow_never_ends_a_line_and_a_quoted_label_never_splits(sample):
    for sc in sample["scenes"]:
        _, rep = frame.render_scene(sc, sample, engine_auto(), sample["ai_line"], 2, 6)
        for block in rep["body_lines"]:
            for ln in block:
                assert not ln.rstrip().endswith("›"), (sc["id"], ln)
                assert ln.count("„") == ln.count("”"), (sc["id"], ln)


def test_recap_icons_are_centred_on_their_layer():
    import numpy as np

    import art

    layer = art.illustration("recap", engine_auto(), [])
    alpha = np.asarray(layer.img)[..., 3]
    xs = np.nonzero(alpha.max(axis=0))[0]
    centre = (xs[0] + xs[-1]) / 2 / layer.img.width
    assert abs(centre - 0.5) < 0.02, centre
