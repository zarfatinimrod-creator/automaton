"""No chart label holds a number that figures.json does not hold (G4, R2)."""

import json
import re

import pytest

import charts
import figures
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
