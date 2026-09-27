"""One 1920x1080 chart per scene, drawn by matplotlib from the same Analysis the figures come from.

Plain and legible on purpose: DejaVu Sans, a light surface, recessive grid, axis labels with units, a legend for two
or more series plus direct labels, and a source-and-licence footer on every frame. No logos, no stock imagery, no
brand. Colours follow the entity — TypeScript is always blue, JavaScript always orange — and were checked with the
dataviz palette validator (blue/orange: all checks pass; aqua/violet for the two periods: aqua is below 3:1 on the
surface, so its bars carry visible count labels).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.figure import Figure as MplFigure  # noqa: E402

from figures import Analysis, Figure  # noqa: E402

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


def _cap(text: str) -> str:
    return text[:1].upper() + text[1:]


def pushers_lines(an: Analysis, figs: dict[str, Figure], spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"Summed over the {figs['panel_economies'].text} economies reported for both languages "
                     f"in every quarter", spec)
    xs = [_x(q) for q in an.quarters]
    for series, name, colour in ((an.b_series, an.b, COLOUR_B), (an.a_series, an.a, COLOUR_A)):
        ys = [v / 1e6 for v in series]
        ax.plot(xs, ys, color=colour, linewidth=4, label=name, solid_capstyle="round")
        ax.plot(xs[-1], ys[-1], "o", color=colour, markersize=11, markeredgecolor=SURFACE, markeredgewidth=2)
        ax.annotate(f"{name}\n{ys[-1]:.2f} million", (xs[-1], ys[-1]), xytext=(16, 0), textcoords="offset points",
                    va="center", fontsize=22, color=TEXT)
    _quarter_axis(ax, an)
    ax.set_ylim(0, max(an.b_series) / 1e6 * 1.12)
    ax.set_ylabel("Developers who pushed (millions)", labelpad=12)
    ax.legend(loc="upper left")
    return fig


def ratio_line(an: Analysis, figs: dict[str, Figure], spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"{an.a} pushers ÷ {an.b} pushers × 100, same {figs['panel_economies'].text} economies",
                     spec)
    xs = [_x(q) for q in an.quarters]
    ax.plot(xs, an.ratio_pct, color=COLOUR_A, linewidth=4, solid_capstyle="round", label=f"{an.a} as % of {an.b}")
    for i, key in ((0, "ratio_first_pct"), (-1, "ratio_last_pct")):
        ax.plot(xs[i], an.ratio_pct[i], "o", color=COLOUR_A, markersize=12, markeredgecolor=SURFACE,
                markeredgewidth=2)
        ax.annotate(figs[key].text, (xs[i], an.ratio_pct[i]), xytext=(0, 22), textcoords="offset points",
                    ha="center", fontsize=28, fontweight="bold", color=TEXT)
    _quarter_axis(ax, an)
    ax.set_ylim(0, max(an.ratio_pct) * 1.25)
    ax.set_ylabel(f"{an.a} pushers as % of {an.b} (%)", labelpad=12)
    return fig


def growth_bars(an: Analysis, figs: dict[str, Figure], spec: dict[str, Any], title: str) -> MplFigure:
    rows = sorted(((lang, *an.growth(lang)) for lang in an.top_languages()), key=lambda r: r[1])
    fig, ax = _frame(title, f"Top {figs['top_n'].text} languages by pushers in {figs['last_quarter'].text}; "
                     f"pushers then ÷ pushers in {figs['first_quarter'].text}", spec, left=0.2)
    ax.grid(axis="y", visible=False)
    ax.grid(axis="x", color=GRID, linewidth=1.2)
    colours = [COLOUR_A if r[0] == an.a else COLOUR_B if r[0] == an.b else NEUTRAL for r in rows]
    ax.barh([r[0] for r in rows], [r[1] for r in rows], color=colours, height=0.62, edgecolor=SURFACE, linewidth=2)
    for i, r in enumerate(rows):
        note = "" if r[2] == len(an.panel) else f"   ({r[2]} of the {len(an.panel)} economies reported at both ends)"
        ax.annotate(f"{r[1]:.1f}×", (r[1], i), xytext=(10, 0), textcoords="offset points", va="center",
                    fontsize=22, color=TEXT, fontweight="bold" if r[0] in (an.a, an.b) else "normal")
        if note:
            ax.annotate(note, (r[1], i), xytext=(70, 0), textcoords="offset points", va="center", fontsize=18,
                        color=TEXT_2)
    ax.set_xlim(0, max(r[1] for r in rows) * 1.15)
    ax.set_xlabel(f"Growth multiple (×), pushers summed over the {figs['panel_economies'].text} economies",
                  labelpad=12)
    ax.tick_params(axis="y", labelsize=22, labelcolor=TEXT)
    return fig


def yearly_gain_bars(an: Analysis, figs: dict[str, Figure], spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"Change in {an.a} pushers as % of {an.b}, from each year's quarter to the same quarter "
                     f"a year later", spec)
    labels = [f"{a[0]}–{str(b[0])[2:]}" for a, b, _ in an.yearly_gain]
    gains = [g for _, _, g in an.yearly_gain]
    colours = [NEUTRAL] * (len(gains) - 1) + [COLOUR_A]
    ax.bar(labels, gains, color=colours, width=0.62, edgecolor=SURFACE, linewidth=2)
    for i, g in enumerate(gains):
        ax.annotate(f"+{g:.1f}", (i, g), xytext=(0, 10), textcoords="offset points", ha="center", fontsize=24,
                    color=TEXT, fontweight="bold" if i == len(gains) - 1 else "normal")
    ax.set_ylim(0, max(gains) * 1.2)
    ax.set_ylabel("Change (percentage points)", labelpad=12)
    ax.set_xlabel("Year (first quarter to first quarter)", labelpad=12)
    return fig


def ratio_histogram(an: Analysis, figs: dict[str, Figure], spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, f"Each of the {figs['panel_economies'].text} economies: {an.a} pushers as % of {an.b} "
                     f"pushers", spec)
    width = 5
    top = max(max(an.ratio_by_economy(an.last).values()), max(an.ratio_by_economy(an.first).values()))
    edges = list(range(0, int(top // width + 1) * width + width, width))
    for q, key, colour, offset in ((an.first, "first_quarter", PERIOD_FIRST, -1.2),
                                   (an.last, "last_quarter", PERIOD_LAST, 1.2)):
        values = list(an.ratio_by_economy(q).values())
        counts = [sum(1 for v in values if lo <= v < lo + width) for lo in edges[:-1]]
        centres = [lo + width / 2 + offset for lo in edges[:-1]]
        ax.bar(centres, counts, width=2.3, color=colour, edgecolor=SURFACE, linewidth=2,
               label=_cap(figs[key].text.removeprefix("the ")))
        for c, n in zip(centres, counts):
            if n:
                ax.annotate(str(n), (c, n), xytext=(0, 6), textcoords="offset points", ha="center", fontsize=18,
                            color=TEXT)
    t = float(spec["params"]["thresholdPct"])
    ymax = ax.get_ylim()[1] * 1.3
    ax.set_ylim(0, ymax)
    ax.axvline(t, color=TEXT_2, linewidth=2, linestyle=(0, (6, 4)))
    ax.annotate(f"{figs['econ_at_threshold_last'].text} economies at or above {figs['threshold_pct'].text} in "
                f"{an.last[0]}  →", (t, ymax), xytext=(-12, -10), textcoords="offset points", ha="right", va="top",
                fontsize=22, color=TEXT)
    ax.set_xlim(0, edges[-1])
    ax.set_xticks(edges)
    ax.set_xlabel(f"{an.a} pushers as % of {an.b} pushers (%), per economy", labelpad=12)
    ax.set_ylabel("Economies (count)", labelpad=12)
    ax.legend(loc="upper left", bbox_to_anchor=(0.36, 0.86))
    return fig


def coverage_lines(an: Analysis, figs: dict[str, Figure], spec: dict[str, Any], title: str) -> MplFigure:
    fig, ax = _frame(title, "GitHub publishes an economy only when enough developers are active in the quarter",
                     spec)
    xs = [_x(q) for q in an.quarters]
    for lang, colour in ((an.b, COLOUR_B), (an.a, COLOUR_A)):
        ys = [an.reported_count(lang, q) for q in an.quarters]
        ax.plot(xs, ys, color=colour, linewidth=4, label=lang, solid_capstyle="round")
        ax.annotate(f"{lang}: {ys[-1]}", (xs[-1], ys[-1]), xytext=(16, 0), textcoords="offset points", va="center",
                    fontsize=22, color=TEXT)
    ax.axhline(len(an.panel), color=TEXT_2, linewidth=2, linestyle=(0, (6, 4)))
    ax.annotate(f"Fixed set followed here: {figs['panel_economies'].text}", (xs[0], len(an.panel)),
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


def render_scene_chart(scene: dict[str, Any], an: Analysis, figs: dict[str, Figure], spec: dict[str, Any],
                       out: Path) -> Path:
    """Draw the scene's chart and save it at exactly WIDTH x HEIGHT (no tight bbox: that would change the size)."""
    _setup_fonts()
    fig = CHARTS[scene["chart"]](an, figs, spec, scene["chartTitle"])
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=DPI, facecolor=SURFACE)
    plt.close(fig)
    return out
