"""No chart label holds a number that figures.json does not hold (G4, R2)."""

import json
import re

import pytest

import charts
import figures
import manifest
from helpers import PARAMS, small_dataset, small_spec


@pytest.fixture()
def drawn(tmp_path):
    """Every chart of the T1 spec drawn from the small dataset, labels read back from a written figures.json."""
    spec = small_spec()
    an = figures.Analysis(figures.load_languages(small_dataset(tmp_path), ["EU"]), PARAMS)
    figs = figures.compute_figures(an)
    fj_path = tmp_path / "figures.json"
    cf = figures.compute_chart_figures(an, [s["chart"] for s in spec["scenes"]])
    fj_path.write_text(json.dumps(figures.figures_json(figs, [], spec, an, cf)))
    labels = figures.labels_from_json(json.loads(fj_path.read_text()))
    filled = figures.fill_spec(spec, figs)
    out = []
    for scene in filled.scenes:
        out.append((scene, charts.draw_scene_chart(scene, an, labels, spec)))
    yield spec, an, labels, out
    for _, fig in out:
        charts.plt.close(fig)


def test_every_number_on_every_chart_is_in_figures_json(drawn):
    spec, _, labels, out = drawn
    assert len(out) == 6
    for scene, fig in out:
        assert charts.untraced_chart_numbers(fig, labels, spec) == [], scene["id"]


def test_a_number_drawn_outside_figures_json_is_caught(drawn):
    spec, _, labels, out = drawn
    scene, fig = out[2]
    fig.axes[0].annotate("4.73×", (0, 0))
    assert charts.untraced_chart_numbers(fig, labels, spec) == ["4.73"]


def test_render_refuses_a_frame_with_an_untraced_number(drawn, tmp_path, monkeypatch):
    spec, an, labels, out = drawn
    scene = out[0][0]
    original = charts.CHARTS[scene["chart"]]

    def leaky(*args):
        fig = original(*args)
        fig.axes[0].set_title(f"{an.a_series[-1] / 1e6:.3f} million")  # a number formatted by the chart itself
        return fig

    monkeypatch.setitem(charts.CHARTS, scene["chart"], leaky)
    with pytest.raises(charts.ChartError, match="figures.json does not hold"):
        charts.render_scene_chart(scene, an, labels, spec, tmp_path / "x.png")
    assert not (tmp_path / "x.png").exists()


def test_scale_ticks_are_exempt_but_category_labels_are_not(drawn):
    spec, _, labels, out = drawn
    texts = charts.chart_texts(out[3][1], spec)  # yearly gain bars: category ticks carry years
    assert any(re.fullmatch(r"\d{4}–\d{2}", t) for t in texts)
    assert charts._is_scale_tick("2020", 2020) and charts._is_scale_tick("−2", -2)
    assert not charts._is_scale_tick("2020–21", 0)


def test_the_footer_carries_only_spec_metadata(drawn):
    spec = drawn[0]
    footer = charts.footer_text(spec)
    allowed = re.findall(r"\d+", spec["dataset"]["commit"][:7] + " " + spec["dataset"]["licence"] + " CC0 1.0")
    assert set(re.findall(r"\d+", footer)) <= set(allowed)


def test_the_charts_carry_no_brand(drawn):
    spec, _, _, out = drawn
    brand = spec["page"]["brand"].lower()
    for _, fig in out:
        assert not any(brand in t.lower() for t in charts.chart_texts(fig, spec) + [charts.footer_text(spec)])


def test_chart_frames_are_exactly_1920_by_1080(drawn, tmp_path):
    from PIL import Image

    spec, an, labels, out = drawn
    p = charts.render_scene_chart(out[0][0], an, labels, spec, tmp_path / "s1.png")
    assert Image.open(p).size == (1920, 1080)


# --- The kids line's on-screen tag (ruling 4.10 §4 rule 1(ii); fold action 9) -----------------------------------------
# assemble.py loops each scene's PNG for its frames and concatenates them, so a tag in every scene PNG is a tag in every
# video frame (tests/test_tts_assemble.py: the MP4 has exactly the timeline's frames).

def _draw_all(tmp_path, spec):
    an = figures.Analysis(figures.load_languages(small_dataset(tmp_path), ["EU"]), PARAMS)
    figs = figures.compute_figures(an)
    cf = figures.compute_chart_figures(an, [s["chart"] for s in spec["scenes"]])
    labels = figures.labels_from_json(json.loads(json.dumps(figures.figures_json(figs, [], spec, an, cf))))
    filled = figures.fill_spec(spec, figs)
    return an, labels, filled, [(s, charts.draw_scene_chart(s, an, labels, spec)) for s in filled.scenes]


def _close(out):
    for _, fig in out:
        charts.plt.close(fig)


def _kids_spec():
    spec = small_spec()
    spec.update({"line": "kids-explainers", "madeForKids": True})
    return spec


def test_every_kids_frame_carries_the_tag_once_inside_the_frame_and_clear_of_every_other_text(tmp_path):
    spec = _kids_spec()
    _, _, _, out = _draw_all(tmp_path, spec)
    assert len(out) == 6
    for scene, fig in out:
        fig.canvas.draw()
        renderer = fig.canvas.get_renderer()
        tags = [t for t in fig.texts if t.get_gid() == charts.TAG_GID]
        assert [t.get_text() for t in tags] == [manifest.KIDS_ON_SCREEN_TAG], scene["id"]
        box = tags[0].get_window_extent(renderer=renderer)
        assert 0.05 * charts.WIDTH <= box.x0 and box.x1 <= 0.95 * charts.WIDTH, scene["id"]  # the 5% side margins
        assert 0.05 * charts.HEIGHT <= box.y0 and box.y1 <= 0.95 * charts.HEIGHT, scene["id"]  # and top and bottom
        others = [t.get_window_extent(renderer=renderer) for t in fig.texts if t is not tags[0] and t.get_text()]
        assert not any(box.overlaps(o) for o in others), scene["id"]
        assert charts.tag_problems(fig, spec) == [], scene["id"]
    _close(out)


def test_t1_frames_carry_no_tag(drawn):
    spec, _, _, out = drawn
    for _, fig in out:
        assert [t for t in fig.texts if t.get_gid() == charts.TAG_GID] == []
        assert charts.tag_problems(fig, spec) == []


def test_render_refuses_a_kids_frame_without_the_tag(tmp_path, monkeypatch):
    spec = _kids_spec()
    an, labels, filled, out = _draw_all(tmp_path, spec)
    _close(out)
    scene = filled.scenes[0]
    original = charts.CHARTS[scene["chart"]]

    def untagged(*args):
        fig = original(*args)
        for t in [t for t in fig.texts if t.get_gid() == charts.TAG_GID]:
            t.remove()
        return fig

    monkeypatch.setitem(charts.CHARTS, scene["chart"], untagged)
    with pytest.raises(charts.ChartError, match="KIDS_ON_SCREEN_TAG"):
        charts.render_scene_chart(scene, an, labels, spec, tmp_path / "k.png")
    assert not (tmp_path / "k.png").exists()


@pytest.mark.parametrize("text", ["", "Made by a computer program", "AI video"])
def test_render_refuses_a_kids_frame_whose_tag_is_not_the_pinned_text(tmp_path, monkeypatch, text):
    spec = _kids_spec()
    an, labels, filled, out = _draw_all(tmp_path, spec)
    _close(out)
    scene = filled.scenes[1]
    original = charts.CHARTS[scene["chart"]]

    def altered(*args):
        fig = original(*args)
        for t in fig.texts:
            if t.get_gid() == charts.TAG_GID:
                t.set_text(text)
        return fig

    monkeypatch.setitem(charts.CHARTS, scene["chart"], altered)
    with pytest.raises(charts.ChartError, match="KIDS_ON_SCREEN_TAG"):
        charts.render_scene_chart(scene, an, labels, spec, tmp_path / "k.png")


@pytest.mark.parametrize("where, position, problem", [
    ("off the right edge", (1.2, 0.968), "leaves the frame's margins"),
    ("past the right margin", (0.97, 0.968), "leaves the frame's margins"),
    ("past the left margin", (0.3, 0.968), "leaves the frame's margins"),
    ("over the top edge", (0.95, 1.0), "leaves the frame's margins"),
    ("in the top 5% band, where it sat until 4.10", (0.95, 0.968), "leaves the frame's margins"),
    ("in the bottom 5% band", (0.95, 0.02), "leaves the frame's margins"),
    ("on the title", (0.6, charts.KIDS_HEADER["title"]), "overlaps the text"),
    ("on the subtitle", (0.6, charts.KIDS_HEADER["subtitle"]), "overlaps the text"),
])
def test_render_refuses_a_kids_frame_whose_tag_is_cut_off_or_covers_text(tmp_path, monkeypatch, where, position, problem):
    spec = _kids_spec()
    an, labels, filled, out = _draw_all(tmp_path, spec)
    _close(out)
    scene = filled.scenes[2]
    original = charts.CHARTS[scene["chart"]]

    def moved(*args):
        fig = original(*args)
        for t in fig.texts:
            if t.get_gid() == charts.TAG_GID:
                t.set_position(position)
        return fig

    monkeypatch.setitem(charts.CHARTS, scene["chart"], moved)
    with pytest.raises(charts.ChartError, match=f"KIDS_ON_SCREEN_TAG.*{problem}|{problem}"):
        charts.render_scene_chart(scene, an, labels, spec, tmp_path / "k.png")


@pytest.mark.parametrize("edge", ["top", "bottom"])
def test_a_tag_inside_the_frame_but_outside_the_top_or_bottom_margin_is_refused(tmp_path, edge):
    """Between the frame's edge and the 5% margin, vertically: inside the picture, outside the safe area. YouTube's player
    draws its title band over the top of a video when its controls show (the parent-guides pattern keeps tags clear of
    what a platform draws over the frame, products/parent-guides/README.md:43-48; the 5% figure is the renderer's own side
    margin, applied to all four sides — inference, no YouTube source gives a number)."""
    spec = _kids_spec()
    _, _, _, out = _draw_all(tmp_path, spec)
    fig = out[0][1]
    fig.canvas.draw()
    tag = next(t for t in fig.texts if t.get_gid() == charts.TAG_GID)
    height = tag.get_window_extent(renderer=fig.canvas.get_renderer()).height
    # va="center": the position is the box's middle. Put the box 2% of the frame from the chosen edge.
    y = (0.98 * charts.HEIGHT - height / 2) if edge == "top" else (0.02 * charts.HEIGHT + height / 2)
    tag.set_position((charts.TAG_X, y / charts.HEIGHT))
    box = tag.get_window_extent(renderer=fig.canvas.get_renderer())
    assert 0 < box.y0 and box.y1 < charts.HEIGHT  # still inside the frame
    assert any("leaves the frame's margins" in p for p in charts.tag_problems(fig, spec)), edge
    _close(out)


@pytest.mark.parametrize("side", ["left", "right"])
def test_a_tag_inside_the_frame_but_outside_a_side_margin_is_refused(tmp_path, side):
    """Between the frame's edge and the 5% margin: inside the picture, outside the safe area the renderer keeps."""
    spec = _kids_spec()
    _, _, _, out = _draw_all(tmp_path, spec)
    fig = out[0][1]
    fig.canvas.draw()
    tag = next(t for t in fig.texts if t.get_gid() == charts.TAG_GID)
    width = tag.get_window_extent(renderer=fig.canvas.get_renderer()).width
    # ha="right": the position is the right edge. Put the box 2% of the frame from the chosen edge.
    x1 = 0.02 * charts.WIDTH + width if side == "left" else 0.98 * charts.WIDTH
    tag.set_position((x1 / charts.WIDTH, charts.TAG_Y))
    box = tag.get_window_extent(renderer=fig.canvas.get_renderer())
    assert 0 < box.x0 and box.x1 < charts.WIDTH  # still inside the frame
    assert any("leaves the frame's margins" in p for p in charts.tag_problems(fig, spec)), side
    _close(out)


def test_a_tag_on_t1s_line_is_refused(drawn):
    spec, _, _, out = drawn
    fig = out[0][1]
    fig.text(0.95, 0.968, manifest.KIDS_ON_SCREEN_TAG, gid=charts.TAG_GID)
    assert charts.tag_problems(fig, spec) != []


def test_the_tag_is_burned_into_the_pixels_inside_the_safe_area(tmp_path):
    """The saved kids frame differs from the same frame with its tag hidden only where the tag is drawn, and that is
    inside the 5% margins on all four sides (PIL counts y from the top edge)."""
    from PIL import Image, ImageChops

    spec = _kids_spec()
    an, labels, filled, out = _draw_all(tmp_path, spec)
    _close(out)
    scene = filled.scenes[0]
    tagged = Image.open(charts.render_scene_chart(scene, an, labels, spec, tmp_path / "kids.png")).convert("RGB")
    fig = charts.draw_scene_chart(scene, an, labels, spec)
    next(t for t in fig.texts if t.get_gid() == charts.TAG_GID).set_visible(False)
    fig.savefig(tmp_path / "hidden.png", dpi=charts.DPI, facecolor=charts.SURFACE)
    charts.plt.close(fig)
    hidden = Image.open(tmp_path / "hidden.png").convert("RGB")
    diff = ImageChops.difference(tagged, hidden).getbbox()
    assert diff is not None, "the saved kids frame has no tag pixels"
    x0, y0, x1, y1 = diff
    assert y0 >= int(0.05 * charts.HEIGHT) and y1 <= int(0.95 * charts.HEIGHT) + 1, diff
    assert x0 >= int(0.05 * charts.WIDTH) and x1 <= int(0.95 * charts.WIDTH) + 1, diff


def test_t1_frames_keep_the_27_9_layout(drawn):
    """The kids header moves down to make room for the tag; T1's frames are drawn exactly as rendered on 27.9."""
    _, _, _, out = drawn
    for scene, fig in out:
        texts = [t for t in fig.texts if t.get_text()]
        assert [t.get_position() for t in texts] == [(0.05, 0.925), (0.05, 0.855), (0.05, 0.045)], scene["id"]
        left = 0.2 if scene["chart"] == "growth_bars" else 0.085
        assert fig.axes[0].get_position().bounds == pytest.approx((left, 0.19, 0.915 - left, 0.60)), scene["id"]
