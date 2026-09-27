"""One 1920x1080 chart per scene. Geometry comes from the Analysis; every number drawn comes from figures.json.

Plain and legible on purpose: DejaVu Sans, a light surface, recessive grid, axis labels with units, a legend for two
or more series plus direct labels, and a source-and-licence footer on every frame. No logos, no stock imagery, no
brand. Colours follow the entity — TypeScript is always blue, JavaScript always orange — and were checked with the
dataviz palette validator (blue/orange: all checks pass; aqua/violet for the two periods: aqua is below 3:1 on the
surface, so its bars carry visible count labels).

Every number a frame shows is read from figures.json (`labels`, built by figures.labels_from_json), where it has a
name, a raw value, half-up rounding and the code that computed it. `untraced_chart_numbers()` walks every text on a
drawn frame and refuses any number figures.json does not hold; render_scene_chart runs it before saving.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Callable

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.figure import Figure as MplFigure  # noqa: E402

from figures import HIST_BIN_WIDTH, Analysis, histogram_bins, slug  # noqa: E402

WIDTH, HEIGHT, DPI = 1920, 1080, 100
FONT = "DejaVu Sans"

SURFACE = "#fcfcfb"
TEXT = "#0b0b0b"
TEXT_2 = "#52514e"
GRID = "#e4e3df"
NEUTRAL = "#b9b8b2"
COLOUR_A = "#2a78d6"  # categorical slot 1 — language A (TypeScript)
COLOUR_B = "#eb6834"  # categorical slot 2 — language B (JavaScript)
PERIOD_FIRST = "#1baf7a"  # slot 3
PERIOD_LAST = "#4a3aa7"  # slot 7


def _setup_fonts() -> None:
    # fallback_to_default=False: if DejaVu Sans is missing this raises instead of silently rendering another font.
    font_manager.findfont(font_manager.FontProperties(family=FONT), fallback_to_default=False)
    plt.rcParams.update(
        {
            "font.family": FONT,
            "font.size": 22,
            "axes.edgecolor": TEXT_2,
            "axes.labelcolor": TEXT,
            "axes.labelsize": 24,
            "xtick.color": TEXT_2,
            "ytick.color": TEXT_2,
            "xtick.labelsize": 22,
            "ytick.labelsize": 22,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "legend.fontsize": 22,
            "legend.frameon": False,
        }
    )


def footer_text(spec: dict[str, Any]) -> str:
    d = spec["dataset"]
    ex = ", ".join(spec["params"]["excludeEconomies"])
    return (
        f"Source: {d['name']} ({d['homepage'].removeprefix('https://')}), {d['file']} at commit {d['commit'][:7]}.\n"
        f"Licence: {d['licence']} (Creative Commons CC0 1.0 Universal). Chart computed from the data; "
        f"the {ex} aggregate is excluded; public activity only."
    )


def _fit(fig: MplFigure, artist, max_frac: float = 0.9, min_size: float = 14) -> None:
    """Shrink a text artist until it fits inside `max_frac` of the frame width: a clipped title is a broken frame."""
    renderer = fig.canvas.get_renderer()
    while artist.get_window_extent(renderer=renderer).width > WIDTH * max_frac and artist.get_fontsize() > min_size:
        artist.set_fontsize(artist.get_fontsize() - 1)


def _frame(title: str, subtitle: str, spec: dict[str, Any], left: float = 0.085) -> tuple[MplFigure, Any]:
    fig = plt.figure(figsize=(WIDTH / DPI, HEIGHT / DPI), dpi=DPI, facecolor=SURFACE)
    for text, y, size, weight, colour in ((title, 0.925, 40, "bold", TEXT), (subtitle, 0.855, 24, "normal", TEXT_2)):
        _fit(fig, fig.text(0.05, y, text, fontsize=size, fontweight=weight, color=colour, va="center"))
    _fit(fig, fig.text(0.05, 0.045, footer_text(spec), fontsize=17, color=TEXT_2, va="center", linespacing=1.5))
    ax = fig.add_axes([left, 0.19, 0.915 - left, 0.60], facecolor=SURFACE)
    ax.grid(axis="y", color=GRID, linewidth=1.2)
    ax.set_axisbelow(True)
    ax.tick_params(length=0, pad=10)
    return fig, ax


def _x(q: tuple[int, int]) -> float:
    return q[0] + (q[1] - 1) / 4


def _quarter_axis(ax, an: Analysis) -> None:
    years = sorted({y for y, _ in an.quarters})
    ax.set_xticks(years)
    ax.set_xticklabels([str(y) for y in years])
    ax.set_xlim(_x(an.first) - 0.15, _x(an.last) + 0.9)
    ax.set_xlabel("Quarter (ticks mark the first quarter of each year)", labelpad=12)


Labels = dict[str, dict[str, Any]]


class ChartError(RuntimeError):
    pass


def _cap(text: str) -> str:
    return text[:1].upper() + text[1:]


def _t(labels: Labels, name: str) -> str:
    return labels[name]["text"]


def pushers_lines(an: Analysis, L: Labels, spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"Summed over the {_t(L, 'panel_economies')} economies reported for both languages "
                     f"in every quarter", spec)
    xs = [_x(q) for q in an.quarters]
    for series, name, colour, key in ((an.b_series, an.b, COLOUR_B, "pushers_lines.b_last_millions"),
                                      (an.a_series, an.a, COLOUR_A, "pushers_lines.a_last_millions")):
        ys = [v / 1e6 for v in series]
        ax.plot(xs, ys, color=colour, linewidth=4, label=name, solid_capstyle="round")
        ax.plot(xs[-1], ys[-1], "o", color=colour, markersize=11, markeredgecolor=SURFACE, markeredgewidth=2)
        ax.annotate(f"{name}\n{_t(L, key)}", (xs[-1], ys[-1]), xytext=(16, 0), textcoords="offset points",
                    va="center", fontsize=22, color=TEXT)
    _quarter_axis(ax, an)
    ax.set_ylim(0, max(an.b_series) / 1e6 * 1.12)
    ax.set_ylabel("Developers who pushed (millions)", labelpad=12)
    ax.legend(loc="upper left")
    return fig


def ratio_line(an: Analysis, L: Labels, spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"{an.a} pushers as % of {an.b} pushers, same {_t(L, 'panel_economies')} economies", spec)
    xs = [_x(q) for q in an.quarters]
    ax.plot(xs, an.ratio_pct, color=COLOUR_A, linewidth=4, solid_capstyle="round", label=f"{an.a} as % of {an.b}")
    for i, key in ((0, "ratio_first_pct"), (-1, "ratio_last_pct")):
        ax.plot(xs[i], an.ratio_pct[i], "o", color=COLOUR_A, markersize=12, markeredgecolor=SURFACE,
                markeredgewidth=2)
        ax.annotate(_t(L, key), (xs[i], an.ratio_pct[i]), xytext=(0, 22), textcoords="offset points",
                    ha="center", fontsize=28, fontweight="bold", color=TEXT)
    _quarter_axis(ax, an)
    ax.set_ylim(0, max(an.ratio_pct) * 1.25)
    ax.set_ylabel(f"{an.a} pushers as % of {an.b} (%)", labelpad=12)
    return fig


def growth_bars(an: Analysis, L: Labels, spec: dict[str, Any], title: str) -> MplFigure:
    rows = []
    for lang in an.top_languages():
        g, n = L[f"growth_bars.growth.{slug(lang)}"], L[f"growth_bars.economies.{slug(lang)}"]
        rows.append((lang, g["value"], g["text"], n["value"], n["text"]))
    rows.sort(key=lambda r: r[1])
    fig, ax = _frame(title, f"Top {_t(L, 'top_n')} languages by pushers in {_t(L, 'last_quarter')}; "
                     f"pushers then ÷ pushers in {_t(L, 'first_quarter')}", spec, left=0.2)
    ax.grid(axis="y", visible=False)
    ax.grid(axis="x", color=GRID, linewidth=1.2)
    colours = [COLOUR_A if r[0] == an.a else COLOUR_B if r[0] == an.b else NEUTRAL for r in rows]
    ax.barh([r[0] for r in rows], [r[1] for r in rows], color=colours, height=0.62, edgecolor=SURFACE, linewidth=2)
    panel = _t(L, "panel_economies")
    for i, (lang, value, text, n, n_text) in enumerate(rows):
        ax.annotate(text, (value, i), xytext=(10, 0), textcoords="offset points", va="center",
                    fontsize=22, color=TEXT, fontweight="bold" if lang in (an.a, an.b) else "normal")
        if n != len(an.panel):
            ax.annotate(f"   ({n_text} of the {panel} economies reported at both ends)", (value, i), xytext=(70, 0),
                        textcoords="offset points", va="center", fontsize=18, color=TEXT_2)
    ax.set_xlim(0, max(r[1] for r in rows) * 1.15)
    ax.set_xlabel(f"Growth multiple (×), pushers summed over the {panel} economies", labelpad=12)
    ax.tick_params(axis="y", labelsize=22, labelcolor=TEXT)
    return fig


def yearly_gain_bars(an: Analysis, L: Labels, spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"Change in {an.a} pushers as % of {an.b}, from each year's quarter to the same quarter "
                     f"a year later", spec)
    keys = [f"{a[0]}_{b[0]}" for a, b, _ in an.yearly_gain]
    gains = [L[f"yearly_gain_bars.gain.{k}"] for k in keys]
    ax.bar([_t(L, f"yearly_gain_bars.label.{k}") for k in keys], [g["value"] for g in gains],
           color=[NEUTRAL] * (len(gains) - 1) + [COLOUR_A], width=0.62, edgecolor=SURFACE, linewidth=2)
    for i, g in enumerate(gains):
        ax.annotate(g["text"], (i, g["value"]), xytext=(0, 10), textcoords="offset points", ha="center",
                    fontsize=24, color=TEXT, fontweight="bold" if i == len(gains) - 1 else "normal")
    ax.set_ylim(0, max(g["value"] for g in gains) * 1.2)
    ax.set_ylabel("Change (percentage points)", labelpad=12)
    ax.set_xlabel("Year (first quarter to first quarter)", labelpad=12)
    return fig


def ratio_histogram(an: Analysis, L: Labels, spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"Each of the {_t(L, 'panel_economies')} economies: {an.a} pushers as % of {an.b} "
                     f"pushers", spec)
    lows = histogram_bins(an)
    for period, key, colour, offset in (("first", "first_quarter", PERIOD_FIRST, -1.2),
                                        ("last", "last_quarter", PERIOD_LAST, 1.2)):
        bins = [L[f"ratio_histogram.{period}.{lo:02d}_{lo + HIST_BIN_WIDTH:02d}"] for lo in lows]
        centres = [lo + HIST_BIN_WIDTH / 2 + offset for lo in lows]
        ax.bar(centres, [b["value"] for b in bins], width=2.3, color=colour, edgecolor=SURFACE, linewidth=2,
               label=_cap(_t(L, key).removeprefix("the ")))
        for c, b in zip(centres, bins):
            if b["value"]:
                ax.annotate(b["text"], (c, b["value"]), xytext=(0, 6), textcoords="offset points", ha="center",
                            fontsize=18, color=TEXT)
    t = float(spec["params"]["thresholdPct"])
    ymax = ax.get_ylim()[1] * 1.3
    ax.set_ylim(0, ymax)
    ax.axvline(t, color=TEXT_2, linewidth=2, linestyle=(0, (6, 4)))
    ax.annotate(f"{_t(L, 'econ_at_threshold_last')} economies at or above {_t(L, 'threshold_pct')} in "
                f"{_t(L, 'last_year')}  →", (t, ymax), xytext=(-12, -10), textcoords="offset points", ha="right",
                va="top", fontsize=22, color=TEXT)
    edges = lows + [lows[-1] + HIST_BIN_WIDTH]
    ax.set_xlim(0, edges[-1])
    ax.set_xticks(edges)
    ax.set_xlabel(f"{an.a} pushers as % of {an.b} pushers (%), per economy", labelpad=12)
    ax.set_ylabel("Economies (count)", labelpad=12)
    ax.legend(loc="upper left", bbox_to_anchor=(0.36, 0.86))
    return fig


def coverage_lines(an: Analysis, L: Labels, spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, "GitHub publishes an economy only when enough developers are active in the quarter",
                     spec)
    xs = [_x(q) for q in an.quarters]
    for lang, colour, key in ((an.b, COLOUR_B, "coverage_lines.b_reported_last"),
                              (an.a, COLOUR_A, "econ_reported_a_last")):
        ys = [an.reported_count(lang, q) for q in an.quarters]
        if ys[-1] != L[key]["value"]:
            raise ChartError(f"{key} in figures.json is {L[key]['value']}, the series ends at {ys[-1]}")
        ax.plot(xs, ys, color=colour, linewidth=4, label=lang, solid_capstyle="round")
        ax.annotate(f"{lang}: {_t(L, key)}", (xs[-1], ys[-1]), xytext=(16, 0), textcoords="offset points",
                    va="center", fontsize=22, color=TEXT)
    ax.axhline(len(an.panel), color=TEXT_2, linewidth=2, linestyle=(0, (6, 4)))
    ax.annotate(f"Fixed set followed here: {_t(L, 'panel_economies')}", (xs[0], len(an.panel)),
                xytext=(0, -30), textcoords="offset points", fontsize=22, color=TEXT)
    _quarter_axis(ax, an)
    ax.set_ylim(0, max(an.reported_count(an.b, q) for q in an.quarters) * 1.15)
    ax.set_ylabel("Economies reported (count)", labelpad=12)
    ax.legend(loc="upper left")
    return fig


CHARTS: dict[str, Callable[..., MplFigure]] = {
    "pushers_lines": pushers_lines,
    "ratio_line": ratio_line,
    "growth_bars": growth_bars,
    "yearly_gain_bars": yearly_gain_bars,
    "ratio_histogram": ratio_histogram,
    "coverage_lines": coverage_lines,
}

_NUMBER = re.compile(r"\d+(?:[.,]\d+)*")


def _is_scale_tick(text: str, position: float) -> bool:
    """A tick whose label is its own position (0, 2, 4 … or 2020 at x=2020) is axis scale, not a data label."""
    try:
        return abs(float(text.replace("−", "-").replace(",", "")) - float(position)) < 1e-9
    except ValueError:
        return False


def chart_texts(fig: MplFigure, spec: dict[str, Any]) -> list[str]:
    """Every text on a drawn frame except the footer and scale ticks."""
    fig.canvas.draw()
    footer = footer_text(spec)
    texts = [t.get_text() for t in fig.texts if t.get_text() != footer]
    for ax in fig.axes:
        texts += [t.get_text() for t in ax.texts]
        texts += [ax.get_xlabel(), ax.get_ylabel(), ax.get_title()]
        legend = ax.get_legend()
        if legend:
            texts += [t.get_text() for t in legend.get_texts()]
        for labels, positions in ((ax.get_xticklabels(), ax.get_xticks()), (ax.get_yticklabels(), ax.get_yticks())):
            texts += [lbl.get_text() for lbl, pos in zip(labels, positions) if not _is_scale_tick(lbl.get_text(), pos)]
    return texts


def untraced_chart_numbers(fig: MplFigure, labels: Labels, spec: dict[str, Any]) -> list[str]:
    """Numbers on the frame that no figure or chart figure in figures.json shows. Empty means every one traces."""
    allowed = {n for e in labels.values() for n in _NUMBER.findall(str(e["text"]))}
    return [n for t in chart_texts(fig, spec) for n in _NUMBER.findall(t) if n not in allowed]


def draw_scene_chart(scene: dict[str, Any], an: Analysis, labels: Labels, spec: dict[str, Any]) -> MplFigure:
    _setup_fonts()
    return CHARTS[scene["chart"]](an, labels, spec, scene["chartTitle"])


def render_scene_chart(scene: dict[str, Any], an: Analysis, labels: Labels, spec: dict[str, Any], out: Path) -> Path:
    """Draw, refuse any untraced number, save at exactly WIDTH x HEIGHT (no tight bbox: that would change the size)."""
    fig = draw_scene_chart(scene, an, labels, spec)
    untraced = untraced_chart_numbers(fig, labels, spec)
    if untraced:
        plt.close(fig)
        raise ChartError(f"{scene['id']}: numbers on the chart that figures.json does not hold: {untraced}")
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=DPI, facecolor=SURFACE)
    plt.close(fig)
    return out
