"""Every number the narration speaks, computed from the dataset — and the rule that no other number gets in.

The narration in an analysis spec is a template. It may not contain a digit or an English number word; each number is a
placeholder such as `{fig:ratio_last_pct}` that is filled from a figure computed here, with its rounding and unit
stated in code. That makes the G4 fact-check partly mechanical: `figures.json` lists every figure with its name, the
source of the function that computes it, the raw value, the rounded value and the exact text that was spoken.

Word claims ("the gap widened", "fastest in the last year") are numbers in disguise, so they are checked too: each
is a named predicate in CLAIMS, and a render stops if any is false for the data it was given.

Rounding is half-up on the decimal value (`Decimal.quantize`), never Python's banker's `round()`.
"""

from __future__ import annotations

import csv
import inspect
import re
import statistics
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path
from typing import Any, Callable

Quarter = tuple[int, int]

EXPECTED_COLUMNS = ["num_pushers", "language", "language_type", "iso2_code", "year", "quarter"]

PLACEHOLDER = re.compile(r"\{fig:([a-z][a-z0-9_]*)\}")
# `{src:<id>}` fills an attributed sentence from another publication (sources.py). It is not a figure, and its one
# permitted number, the source's year, is checked there — the only exception to the rule below.
ANY_PLACEHOLDER = re.compile(r"\{(?:fig|src):[a-z][a-z0-9_]*\}")

# A number typed by hand is a number nobody computed. Digits are caught directly; these words are how the same
# thing slips in as prose ("doubled", "half", "ten languages").
NUMBER_WORDS = (
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
    "seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred hundreds thousand "
    "thousands million millions billion billions first second third fourth fifth sixth seventh eighth ninth tenth "
    "half halved halves twice double doubled triple tripled quadruple quadrupled dozen dozens percent none"
).split()
_NUMBER_WORD = re.compile(r"\b(" + "|".join(NUMBER_WORDS) + r")\b", re.IGNORECASE)
_DIGIT = re.compile(r"\d")
_NUMBER_TOKEN = re.compile(r"\d+(?:,\d{3})*(?:\.\d+)?")

_ORDINAL = {1: "first", 2: "second", 3: "third", 4: "fourth"}


class FigureError(ValueError):
    """A template, figure or claim that would let an unchecked number into the narration."""


# ---------------------------------------------------------------------------------------------------------------
# Data


@dataclass
class LanguageData:
    """languages.csv as lang -> quarter -> economy -> num_pushers, with excluded aggregates dropped."""

    quarters: list[Quarter]
    counts: dict[str, dict[Quarter, dict[str, int]]]
    excluded_rows: int = 0

    def reported(self, lang: str, q: Quarter) -> dict[str, int]:
        return self.counts.get(lang, {}).get(q, {})


def load_languages(path: Path, exclude: list[str] | tuple[str, ...] = ()) -> LanguageData:
    counts: dict[str, dict[Quarter, dict[str, int]]] = {}
    quarters: set[Quarter] = set()
    excluded = 0
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != EXPECTED_COLUMNS:
            raise FigureError(f"languages.csv columns changed: {reader.fieldnames} != {EXPECTED_COLUMNS}")
        for row in reader:
            if row["iso2_code"] in exclude:
                excluded += 1
                continue
            q = (int(row["year"]), int(row["quarter"]))
            quarters.add(q)
            econ = counts.setdefault(row["language"], {}).setdefault(q, {})
            if row["iso2_code"] in econ:
                raise FigureError(f"duplicate row for {row['language']} {row['iso2_code']} {q}")
            econ[row["iso2_code"]] = int(row["num_pushers"])
    return LanguageData(sorted(quarters), counts, excluded)


class Analysis:
    """The derived series every figure and chart reads, computed once so the video and the page cannot disagree.

    The panel is the set of economies reported for BOTH languages in EVERY quarter. Economies enter the file as they
    cross GitHub's reporting threshold, so summing whatever is reported each quarter would mix real growth with
    coverage growth; a fixed set does not.
    """

    def __init__(self, data: LanguageData, params: dict[str, Any]):
        self.data = data
        self.params = params
        self.a: str = params["languageA"]
        self.b: str = params["languageB"]
        self.quarters = data.quarters
        if len(self.quarters) < 5:
            raise FigureError("need at least five quarters for a year-on-year comparison")
        sets = [set(data.reported(self.a, q)) & set(data.reported(self.b, q)) for q in self.quarters]
        self.panel: list[str] = sorted(set.intersection(*sets))
        if not self.panel:
            raise FigureError(f"no economy is reported for both {self.a} and {self.b} in every quarter")
        self.a_series = [self._panel_sum(self.a, q) for q in self.quarters]
        self.b_series = [self._panel_sum(self.b, q) for q in self.quarters]
        self.ratio_pct = [100 * x / y for x, y in zip(self.a_series, self.b_series)]
        # Year steps anchored on the latest quarter, going back four quarters at a time.
        last = len(self.quarters) - 1
        self.year_idx = list(range(last, -1, -4))[::-1]
        self.yearly_gain = [
            (self.quarters[i], self.quarters[j], self.ratio_pct[j] - self.ratio_pct[i])
            for i, j in zip(self.year_idx, self.year_idx[1:])
        ]

    def _panel_sum(self, lang: str, q: Quarter) -> int:
        rep = self.data.reported(lang, q)
        missing = [e for e in self.panel if e not in rep]
        if missing:
            raise FigureError(f"panel economies {missing} missing for {lang} in {q}")
        return sum(rep[e] for e in self.panel)

    @property
    def first(self) -> Quarter:
        return self.quarters[0]

    @property
    def last(self) -> Quarter:
        return self.quarters[-1]

    @property
    def prev_year(self) -> Quarter:
        return self.quarters[self.year_idx[-2]]

    def growth(self, lang: str) -> tuple[float, int]:
        """Pushers at the last quarter / at the first, over panel economies reported for `lang` at both ends."""
        f, l = self.data.reported(lang, self.first), self.data.reported(lang, self.last)
        econ = [e for e in self.panel if e in f and e in l]
        if not econ:
            raise FigureError(f"{lang}: no panel economy reported at both ends")
        return sum(l[e] for e in econ) / sum(f[e] for e in econ), len(econ)

    def top_languages(self) -> list[str]:
        """The topN languages by pushers at the last quarter, over the panel economies reported for each."""
        totals = {
            lang: sum(n for e, n in by_q.get(self.last, {}).items() if e in set(self.panel))
            for lang, by_q in self.data.counts.items()
        }
        return sorted(totals, key=lambda k: (-totals[k], k))[: int(self.params["topN"])]

    def ratio_by_economy(self, q: Quarter) -> dict[str, float]:
        a, b = self.data.reported(self.a, q), self.data.reported(self.b, q)
        return {e: 100 * a[e] / b[e] for e in self.panel}

    def reported_count(self, lang: str, q: Quarter) -> int:
        return len(self.data.reported(lang, q))


# ---------------------------------------------------------------------------------------------------------------
# Figures


def round_half_up(value: float, decimals: int) -> Decimal:
    return Decimal(repr(float(value))).quantize(Decimal(1).scaleb(-decimals), rounding=ROUND_HALF_UP)


def _num(d: Decimal, decimals: int) -> str:
    return f"{d:.{decimals}f}"


def format_figure(kind: str, value: Any, decimals: int) -> tuple[str, Any]:
    """Return (text as spoken and shown, rounded value). The unit is part of the text, so it cannot be dropped."""
    if kind == "count":
        if isinstance(value, bool) or not isinstance(value, int):
            raise FigureError(f"a count must be an int, got {value!r}")
        return f"{value:,}", value
    if kind == "year":
        return str(int(value)), int(value)
    if kind == "quarter":
        y, q = value
        return f"the {_ORDINAL[q]} quarter of {y}", None
    if kind == "text":
        return str(value), None
    if kind == "millions":
        r = round_half_up(value / 1_000_000, decimals)
        return f"{_num(r, decimals)} million", float(r)
    r = round_half_up(value, decimals)
    if kind == "pct":
        return f"{_num(r, decimals)}%", float(r)
    if kind == "times":
        return f"{_num(r, decimals)} times", float(r)
    if kind == "times_sign":
        return f"{_num(r, decimals)}×", float(r)
    if kind == "signed":
        return (f"+{_num(r, decimals)}" if r >= 0 else f"−{_num(-r, decimals)}"), float(r)
    if kind == "pts":
        unit = "percentage point" if r == 1 else "percentage points"
        return f"{_num(r, decimals)} {unit}", float(r)
    raise FigureError(f"unknown figure kind {kind!r}")


ROUNDED_KINDS = ("pct", "times", "pts", "millions", "times_sign", "signed")

UNITS = {
    "count": "count",
    "year": "calendar year",
    "quarter": "calendar quarter",
    "text": "name",
    "millions": "developers, millions",
    "pct": "percent",
    "times": "multiple (last quarter / first quarter)",
    "pts": "percentage points",
    "times_sign": "multiple (×), chart label",
    "signed": "percentage points, signed chart label",
}


@dataclass(frozen=True)
class FigureDef:
    name: str
    kind: str
    decimals: int
    description: str
    fn: Callable[[Analysis], Any]


@dataclass(frozen=True)
class Figure:
    name: str
    kind: str
    decimals: int
    unit: str
    value: Any
    rounded: Any
    text: str
    description: str
    code: str
    chart: str = ""

    def as_json(self) -> dict[str, Any]:
        v = list(self.value) if isinstance(self.value, tuple) else self.value
        return {
            "name": self.name,
            "text": self.text,
            "value": v,
            "rounded": self.rounded,
            "decimals": self.decimals,
            "rounding": "half-up" if self.kind in ROUNDED_KINDS else "none",
            "unit": self.unit,
            "description": self.description,
            "code": self.code,
        }


FIGURES: dict[str, FigureDef] = {}


def figure(name: str, kind: str, description: str, decimals: int = 0):
    def deco(fn: Callable[[Analysis], Any]):
        if name in FIGURES:
            raise FigureError(f"figure {name} defined twice")
        FIGURES[name] = FigureDef(name, kind, decimals, description, fn)
        return fn

    return deco


@figure("panel_economies", "count", "Economies reported for both languages in every quarter (the fixed set).")
def _panel_economies(an: Analysis) -> int:
    return len(an.panel)


@figure("first_quarter", "quarter", "The first quarter in the file.")
def _first_quarter(an: Analysis) -> Quarter:
    return an.first


@figure("last_quarter", "quarter", "The latest quarter in the file.")
def _last_quarter(an: Analysis) -> Quarter:
    return an.last


@figure("prev_year_quarter", "quarter", "The same quarter one year before the latest.")
def _prev_year_quarter(an: Analysis) -> Quarter:
    return an.prev_year


@figure("first_year", "year", "Calendar year of the first quarter.")
def _first_year(an: Analysis) -> int:
    return an.first[0]


@figure("last_year", "year", "Calendar year of the latest quarter.")
def _last_year(an: Analysis) -> int:
    return an.last[0]


@figure("span_years", "count", "Whole years from the first quarter to the latest (quarters / 4).")
def _span_years(an: Analysis) -> int:
    n = len(an.quarters) - 1
    if n % 4:
        raise FigureError(f"{n} quarters between first and last is not a whole number of years")
    return n // 4


@figure("ratio_first_pct", "pct", "Panel sum of language A pushers / panel sum of language B pushers x 100, first quarter.")
def _ratio_first(an: Analysis) -> float:
    return an.ratio_pct[0]


@figure("ratio_last_pct", "pct", "Panel sum of language A pushers / panel sum of language B pushers x 100, latest quarter.")
def _ratio_last(an: Analysis) -> float:
    return an.ratio_pct[-1]


@figure("gap_first_millions", "millions", "Panel B pushers minus panel A pushers, first quarter, in millions.", 1)
def _gap_first(an: Analysis) -> float:
    return an.b_series[0] - an.a_series[0]


@figure("gap_last_millions", "millions", "Panel B pushers minus panel A pushers, latest quarter, in millions.", 1)
def _gap_last(an: Analysis) -> float:
    return an.b_series[-1] - an.a_series[-1]


@figure("a_growth_x", "times", "Panel A pushers in the latest quarter / in the first quarter.", 1)
def _a_growth(an: Analysis) -> float:
    return an.a_series[-1] / an.a_series[0]


@figure("b_growth_x", "times", "Panel B pushers in the latest quarter / in the first quarter.", 1)
def _b_growth(an: Analysis) -> float:
    return an.b_series[-1] / an.b_series[0]


@figure("top_n", "count", "How many of the largest languages the growth comparison covers (spec parameter topN).")
def _top_n(an: Analysis) -> int:
    return int(an.params["topN"])


@figure(
    "fastest_top_language",
    "text",
    "Of the topN languages by panel pushers in the latest quarter, the one with the largest growth multiple "
    "(each language summed over the panel economies reported for it at both ends).",
)
def _fastest_top(an: Analysis) -> str:
    return max(an.top_languages(), key=lambda lang: an.growth(lang)[0])


@figure("ratio_gain_last_pts", "pts", "Change in the A/B ratio (percent) over the latest year.")
def _gain_last(an: Analysis) -> float:
    return an.yearly_gain[-1][2]


@figure("ratio_gain_max_earlier_pts", "pts", "Largest change in the A/B ratio over any earlier year (same-quarter steps).")
def _gain_max_earlier(an: Analysis) -> float:
    if len(an.yearly_gain) < 2:
        raise FigureError("need at least two year steps")
    return max(g for _, _, g in an.yearly_gain[:-1])


@figure("median_ratio_first_pct", "pct", "Median over panel economies of A/B x 100, first quarter.")
def _median_first(an: Analysis) -> float:
    return statistics.median(an.ratio_by_economy(an.first).values())


@figure("median_ratio_last_pct", "pct", "Median over panel economies of A/B x 100, latest quarter.")
def _median_last(an: Analysis) -> float:
    return statistics.median(an.ratio_by_economy(an.last).values())


@figure("threshold_pct", "pct", "The ratio threshold the economy count uses (spec parameter thresholdPct).")
def _threshold(an: Analysis) -> float:
    return float(an.params["thresholdPct"])


@figure("econ_at_threshold_first", "count", "Panel economies whose A/B ratio is at or above the threshold, first quarter.")
def _at_threshold_first(an: Analysis) -> int:
    t = float(an.params["thresholdPct"])
    return sum(1 for r in an.ratio_by_economy(an.first).values() if r >= t)


@figure("econ_at_threshold_last", "count", "Panel economies whose A/B ratio is at or above the threshold, latest quarter.")
def _at_threshold_last(an: Analysis) -> int:
    t = float(an.params["thresholdPct"])
    return sum(1 for r in an.ratio_by_economy(an.last).values() if r >= t)


@figure("max_ratio_last_pct", "pct", "Highest A/B ratio x 100 among panel economies, latest quarter.")
def _max_last(an: Analysis) -> float:
    return max(an.ratio_by_economy(an.last).values())


@figure("econ_reported_a_first", "count", "Economies (all, not only the panel) reported for language A, first quarter.")
def _reported_a_first(an: Analysis) -> int:
    return an.reported_count(an.a, an.first)


@figure("econ_reported_a_last", "count", "Economies (all, not only the panel) reported for language A, latest quarter.")
def _reported_a_last(an: Analysis) -> int:
    return an.reported_count(an.a, an.last)


def compute_figures(an: Analysis) -> dict[str, Figure]:
    out: dict[str, Figure] = {}
    for name, d in FIGURES.items():
        value = d.fn(an)
        text, rounded = format_figure(d.kind, value, d.decimals)
        out[name] = Figure(
            name=name,
            kind=d.kind,
            decimals=d.decimals,
            unit=UNITS[d.kind],
            value=value,
            rounded=rounded,
            text=text,
            description=d.description,
            code=inspect.getsource(d.fn),
        )
    return out


# ---------------------------------------------------------------------------------------------------------------
# Chart figures: every number drawn on a chart, with the same half-up rounding as the narration (G4, R2).
# charts.py reads these back from figures.json and draws their `text`; charts.untraced_chart_numbers() refuses a frame
# that shows any number figures.json does not hold. Axis scale ticks (a label equal to its own tick position) and the
# footer (spec metadata only) are the two things not registered here.

HIST_BIN_WIDTH = 5  # percentage points per histogram bin; bins include their lower edge


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower().replace("+", "p")).strip("_")


def histogram_bins(an: Analysis) -> list[int]:
    """Lower edges of the histogram bins, wide enough for both quarters."""
    top = max(max(an.ratio_by_economy(q).values()) for q in (an.first, an.last))
    return list(range(0, int(top // HIST_BIN_WIDTH + 1) * HIST_BIN_WIDTH, HIST_BIN_WIDTH))


def _chart_pushers_lines(an: Analysis, add) -> None:
    add("pushers_lines.a_last_millions", "millions", an.a_series[-1], 2, f"{an.a} pushers, panel sum, latest quarter.")
    add("pushers_lines.b_last_millions", "millions", an.b_series[-1], 2, f"{an.b} pushers, panel sum, latest quarter.")


def _chart_growth_bars(an: Analysis, add) -> None:
    for lang in an.top_languages():
        multiple, n = an.growth(lang)
        add(f"growth_bars.growth.{slug(lang)}", "times_sign", multiple, 1,
            f"{lang}: pushers latest / first quarter, over panel economies reported for it at both ends.")
        add(f"growth_bars.economies.{slug(lang)}", "count", n, 0,
            f"{lang}: panel economies reported for it in both the first and the latest quarter.")


def _chart_yearly_gain_bars(an: Analysis, add) -> None:
    for a, b, gain in an.yearly_gain:
        key = f"{a[0]}_{b[0]}"
        add(f"yearly_gain_bars.gain.{key}", "signed", gain, 1,
            f"A/B ratio (percent) at {b[0]} Q{b[1]} minus at {a[0]} Q{a[1]}, percentage points.")
        add(f"yearly_gain_bars.label.{key}", "text", f"{a[0]}–{str(b[0])[2:]}", 0, "Bar label: the year step.")


def _chart_ratio_histogram(an: Analysis, add) -> None:
    for period, q in (("first", an.first), ("last", an.last)):
        values = list(an.ratio_by_economy(q).values())
        for lo in histogram_bins(an):
            n = sum(1 for v in values if lo <= v < lo + HIST_BIN_WIDTH)
            add(f"ratio_histogram.{period}.{lo:02d}_{lo + HIST_BIN_WIDTH:02d}", "count", n, 0,
                f"Panel economies with A/B x 100 in [{lo}, {lo + HIST_BIN_WIDTH}), {q[0]} Q{q[1]}.")


def _chart_coverage_lines(an: Analysis, add) -> None:
    add("coverage_lines.b_reported_last", "count", an.reported_count(an.b, an.last), 0,
        f"Economies (all, EU excluded) reported for {an.b}, latest quarter.")


CHART_BLOCKS = {
    "pushers_lines": _chart_pushers_lines,
    "growth_bars": _chart_growth_bars,
    "yearly_gain_bars": _chart_yearly_gain_bars,
    "ratio_histogram": _chart_ratio_histogram,
    "coverage_lines": _chart_coverage_lines,
}


def compute_chart_figures(an: Analysis, charts: list[str] | None = None) -> dict[str, Figure]:
    out: dict[str, Figure] = {}
    for chart, block in CHART_BLOCKS.items():
        if charts is not None and chart not in charts:
            continue
        code = inspect.getsource(block)

        def add(name, kind, value, decimals, description, _chart=chart, _code=code):
            if name in out:
                raise FigureError(f"chart figure {name} defined twice")
            text, rounded = format_figure(kind, value, decimals)
            out[name] = Figure(name, kind, decimals, UNITS[kind], value, rounded, text, description, _code, _chart)

        block(an, add)
    return out


# ---------------------------------------------------------------------------------------------------------------
# Claims: the words in the narration that assert something about the numbers.


@dataclass(frozen=True)
class Claim:
    name: str
    statement: str
    check: Callable[[Analysis, dict[str, Figure]], bool]


CLAIMS: list[Claim] = [
    Claim("ratio_rose", "'As a share of JavaScript, yes': the A/B ratio is higher at the end than at the start.",
          lambda an, f: an.ratio_pct[-1] > an.ratio_pct[0]),
    Claim("gap_widened", "'in raw numbers, no: JavaScript's lead grew': B minus A is larger at the end than at the start.",
          lambda an, f: f["gap_last_millions"].value > f["gap_first_millions"].value),
    Claim("both_grew", "'because both languages grew' and 'grew ... over': both growth multiples exceed 1.",
          lambda an, f: f["a_growth_x"].value > 1 and f["b_growth_x"].value > 1),
    Claim("fastest_is_a", "The alt text pairs the fastest top language with A's multiple: they must be the same language.",
          lambda an, f: f["fastest_top_language"].value == an.a),
    Claim("last_year_fastest", "'The ratio moved fastest in the last year': the latest yearly gain is the largest.",
          lambda an, f: f["ratio_gain_last_pts"].value > f["ratio_gain_max_earlier_pts"].value),
    Claim("no_earlier_gain_exceeds_spoken",
          "'in no earlier year did it rise more than X': the unrounded maximum is at most the spoken, rounded X.",
          lambda an, f: f["ratio_gain_max_earlier_pts"].value <= f["ratio_gain_max_earlier_pts"].rounded),
    Claim("picture_same", "'Economy by economy, the picture is the same': the median economy's ratio also rose.",
          lambda an, f: f["median_ratio_last_pct"].value > f["median_ratio_first_pct"].value),
    Claim("threshold_up_from", "'up from X': more economies at the threshold at the end than at the start.",
          lambda an, f: f["econ_at_threshold_last"].value > f["econ_at_threshold_first"].value),
    Claim("reported_rose", "'the economies it reports for TypeScript rose': more reported at the end than at the start.",
          lambda an, f: f["econ_reported_a_last"].value > f["econ_reported_a_first"].value),
]


def check_claims(an: Analysis, figs: dict[str, Figure]) -> list[dict[str, Any]]:
    results = [{"name": c.name, "statement": c.statement, "holds": bool(c.check(an, figs))} for c in CLAIMS]
    failed = [r["name"] for r in results if not r["holds"]]
    if failed:
        raise FigureError(f"narration claims do not hold for this data: {failed}")
    return results


# ---------------------------------------------------------------------------------------------------------------
# Templates


def hand_typed_numbers(template: str) -> list[str]:
    """Digits or number words in a template outside its placeholders. Empty means every number is a figure (or the
    year of an attributed source, which sources.py checks on its own)."""
    bare = ANY_PLACEHOLDER.sub(" ", template)
    return _DIGIT.findall(bare) + [m.group(0) for m in _NUMBER_WORD.finditer(bare)]


def placeholders(template: str) -> list[str]:
    return PLACEHOLDER.findall(template)


def fill(template: str, figs: dict[str, Figure], spec: dict[str, Any] | None = None) -> str:
    """Replace every `{fig:name}` with that figure's text and every `{src:id}` with the spec's attributed sentence.
    A hand-typed number, an unknown figure or an unknown source is an error."""
    typed = hand_typed_numbers(template)
    if typed:
        raise FigureError(f"hand-typed number(s) {typed} in: {template!r}")
    unknown = [n for n in placeholders(template) if n not in figs]
    if unknown:
        raise FigureError(f"unknown figure(s) {unknown} in: {template!r}")
    filled = PLACEHOLDER.sub(lambda m: figs[m.group(1)].text, template)
    if "{src:" in filled:
        if spec is None:
            raise FigureError(f"a source placeholder needs the spec: {template!r}")
        from sources import fill_sources  # sources imports this module

        filled = fill_sources(filled, spec)
    if "{" in filled or "}" in filled:
        raise FigureError(f"malformed placeholder left in: {filled!r}")
    return filled


def untraced_numbers(filled: str, figs: dict[str, Figure], allowed: set[str] | frozenset[str] = frozenset()) -> list[str]:
    """Numbers in filled text that no figure's text contains (and that are not an attributed source's year)."""
    texts = [f.text for f in figs.values()]
    return [n for n in _NUMBER_TOKEN.findall(filled) if n not in allowed and not any(n in t for t in texts)]


@dataclass
class FilledSpec:
    title: str
    scenes: list[dict[str, Any]] = field(default_factory=list)

    @property
    def script(self) -> str:
        return " ".join(s["narration"] for s in self.scenes)


TEXT_FIELDS = ("narration", "alt", "chartTitle")


def fill_spec(spec: dict[str, Any], figs: dict[str, Figure]) -> FilledSpec:
    """Fill every text field of every scene, plus the title and question; each goes through the same rule."""
    title = fill(spec["title"], figs, spec)
    fill(spec["question"], figs, spec)
    scenes = []
    for s in spec["scenes"]:
        filled = dict(s)
        for key in TEXT_FIELDS:
            filled[key] = fill(s[key], figs, spec)
        scenes.append(filled)
    return FilledSpec(title=title, scenes=scenes)


def figures_json(figs: dict[str, Figure], claims: list[dict[str, Any]], spec: dict[str, Any], analysis: Analysis,
                 chart_figs: dict[str, Figure] | None = None) -> dict[str, Any]:
    used = sorted({n for s in spec["scenes"] for k in TEXT_FIELDS for n in placeholders(s[k])})
    chart_figs = chart_figs or {}
    counts: dict[str, int] = {}
    for f in chart_figs.values():
        counts[f.chart] = counts.get(f.chart, 0) + 1
    return {
        "analysis": spec["id"],
        "dataset": {k: spec["dataset"][k] for k in ("name", "url", "commit", "sha256", "licence")},
        "panel": {
            "definition": f"economies reported for both {analysis.a} and {analysis.b} in every quarter",
            "economies": analysis.panel,
        },
        "excludedEconomies": spec["params"]["excludeEconomies"],
        "usedInNarration": used,
        "figures": [figs[n].as_json() for n in FIGURES],
        "claims": claims,
        "chartFigureCounts": counts,
        "chartFigures": [dict(f.as_json(), chart=f.chart) for f in chart_figs.values()],
    }


def labels_from_json(fj: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Name -> entry for every figure and chart figure in a loaded figures.json: what charts.py draws from."""
    return {e["name"]: e for e in fj["figures"] + fj.get("chartFigures", [])}
