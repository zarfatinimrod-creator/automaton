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
        assert 0 <= box.y0 and box.y1 <= charts.HEIGHT, scene["id"]
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
    ("on the title", (0.6, 0.925), "overlaps the text"),
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


def test_a_tag_on_t1s_line_is_refused(drawn):
    spec, _, _, out = drawn
    fig = out[0][1]
    fig.text(0.95, 0.968, manifest.KIDS_ON_SCREEN_TAG, gid=charts.TAG_GID)
    assert charts.tag_problems(fig, spec) != []


def test_the_tag_is_burned_into_the_pixels(tmp_path):
    """The saved kids frame differs from T1's only where the tag is drawn: the band above the title."""
    from PIL import Image, ImageChops

    t1_spec, kids_spec = small_spec(), _kids_spec()
    an, labels, filled, out = _draw_all(tmp_path, kids_spec)
    _close(out)
    scene = filled.scenes[0]
    a = Image.open(charts.render_scene_chart(scene, an, labels, t1_spec, tmp_path / "t1.png")).convert("RGB")
    b = Image.open(charts.render_scene_chart(scene, an, labels, kids_spec, tmp_path / "kids.png")).convert("RGB")
    diff = ImageChops.difference(a, b).getbbox()
    assert diff is not None, "the kids frame is pixel-identical to T1's: no tag was drawn"
    x0, y0, x1, y1 = diff
    assert y1 <= int(0.05 * charts.HEIGHT), diff  # the top 5% of the frame (PIL counts y from the top edge)
    assert x0 >= int(0.05 * charts.WIDTH) and x1 <= int(0.95 * charts.WIDTH) + 1, diff
