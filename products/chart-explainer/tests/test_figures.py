"""Every narration number comes from a named, computed figure; rounding and units are explicit."""

import json
from decimal import Decimal
from pathlib import Path

import pytest

import figures
from figures import Analysis, FigureError, compute_figures, fill, format_figure, hand_typed_numbers, round_half_up

PRODUCT = Path(__file__).resolve().parent.parent
SPEC = json.loads((PRODUCT / "analyses" / "t1.json").read_text())
PARAMS = {"languageA": "TypeScript", "languageB": "JavaScript", "topN": 2, "thresholdPct": 50,
          "excludeEconomies": ["EU"]}


def write_csv(path: Path, rows: list[tuple[int, str, str, int, int]]) -> Path:
    lines = ["num_pushers,language,language_type,iso2_code,year,quarter"]
    lines += [f"{n},{lang},programming,{econ},{y},{q}" for n, lang, econ, y, q in rows]
    path.write_text("\n".join(lines) + "\n")
    return path


NINE_QUARTERS = [(2020 + i // 4, i % 4 + 1) for i in range(9)]  # two whole year steps


def small_dataset(tmp_path: Path) -> Path:
    """Two panel economies (AA, BB) over nine quarters, one economy (CC) missing a quarter, and an EU aggregate."""
    quarters = NINE_QUARTERS
    rows = []
    for i, (y, q) in enumerate(quarters):
        rows += [(100 + 10 * i, "TypeScript", "AA", y, q), (400, "JavaScript", "AA", y, q)]
        rows += [(200 + 50 * i, "TypeScript", "BB", y, q), (400 + 20 * i, "JavaScript", "BB", y, q)]
        rows += [(9999, "TypeScript", "EU", y, q), (9999, "JavaScript", "EU", y, q)]
        rows += [(150, "Python", "AA", y, q), (150, "Python", "BB", y, q)]
        if i != 2:
            rows += [(500, "TypeScript", "CC", y, q), (500, "JavaScript", "CC", y, q)]
    return write_csv(tmp_path / "languages.csv", rows)


# --- the rule: no hand-typed numbers ----------------------------------------------------------------------------


def test_every_text_field_of_t1_has_no_hand_typed_number():
    fields = [SPEC["title"], SPEC["question"]]
    fields += [s[k] for s in SPEC["scenes"] for k in figures.TEXT_FIELDS]
    for text in fields:
        assert hand_typed_numbers(text) == [], text


def test_every_placeholder_in_t1_names_a_defined_figure():
    used = {n for s in SPEC["scenes"] for k in figures.TEXT_FIELDS for n in figures.placeholders(s[k])}
    assert used, "the narration must use figures"
    assert used <= set(figures.FIGURES)


@pytest.mark.parametrize(
    "template",
    [
        "TypeScript had 18% as many pushers.",
        "It grew {fig:a_growth_x} over 6 years.",
        "In 2020 it was smaller.",
        "Its pushers doubled.",
        "Ten languages grew.",
        "It reached half of JavaScript.",
        "None of them overtook it.",
    ],
)
def test_a_hand_typed_number_fails_the_fill(template):
    figs = {"a_growth_x": figures.Figure("a_growth_x", "times", 1, "x", 9.5, 9.5, "9.5 times", "", "")}
    with pytest.raises(FigureError, match="hand-typed"):
        fill(template, figs)


def test_words_that_merely_contain_a_number_word_pass():
    assert hand_typed_numbers("Anyone and someone, oneself, often; a phone.") == []


def test_unknown_placeholder_fails():
    with pytest.raises(FigureError, match="unknown figure"):
        fill("It rose {fig:no_such_figure}.", {})


def test_untraced_numbers_finds_a_number_no_figure_holds():
    figs = {"x": figures.Figure("x", "pct", 0, "percent", 18.2, 18.0, "18%", "", "")}
    assert figures.untraced_numbers("It had 18% then 49% later.", figs) == ["49"]
    assert figures.untraced_numbers("It had 18%, as noted.", figs) == []


# --- rounding and units -----------------------------------------------------------------------------------------


@pytest.mark.parametrize(
    "value,decimals,expected",
    [(0.5, 0, "1"), (2.5, 0, "3"), (17.7255, 0, "18"), (9.45, 1, "9.5"), (9.502, 1, "9.5"), (4.5386, 0, "5")],
)
def test_round_half_up_not_bankers(value, decimals, expected):
    assert str(round_half_up(value, decimals)) == expected
    assert round_half_up(2.5, 0) == Decimal(3)  # round(2.5) would be 2


@pytest.mark.parametrize(
    "kind,value,decimals,text",
    [
        ("pct", 17.72552, 0, "18%"),
        ("pct", 48.9125, 0, "49%"),
        ("times", 9.50205, 1, "9.5 times"),
        ("times", 3.44347, 1, "3.4 times"),
        ("pts", 12.04, 0, "12 percentage points"),
        ("pts", 1.2, 0, "1 percentage point"),
        ("millions", 1_147_998, 1, "1.1 million"),
        ("millions", 2_454_635, 1, "2.5 million"),
        ("count", 1234, 0, "1,234"),
        ("quarter", (2026, 1), 0, "the first quarter of 2026"),
        ("year", 2020, 0, "2020"),
        ("text", "TypeScript", 0, "TypeScript"),
    ],
)
def test_format_figure_states_rounding_and_unit(kind, value, decimals, text):
    assert format_figure(kind, value, decimals)[0] == text


def test_a_count_must_be_an_integer():
    with pytest.raises(FigureError):
        format_figure("count", 92.0, 0)


def test_fill_uses_the_figure_text():
    figs = {"r": figures.Figure("r", "pct", 0, "percent", 48.9, 49.0, "49%", "", "")}
    assert fill("By then it had {fig:r}.", figs) == "By then it had 49%."


# --- computation on a small, known dataset ----------------------------------------------------------------------


def test_figures_on_a_known_dataset(tmp_path):
    data = figures.load_languages(small_dataset(tmp_path), ["EU"])
    assert data.excluded_rows == 18
    an = Analysis(data, PARAMS)
    assert an.panel == ["AA", "BB"]  # CC is missing a quarter; EU is excluded
    figs = compute_figures(an)
    # First quarter: TS 100+200=300, JS 400+400=800 -> 37.5%. Last: TS 180+600=780, JS 400+560=960 -> 81.25%.
    assert figs["ratio_first_pct"].value == pytest.approx(37.5)
    assert figs["ratio_first_pct"].text == "38%"  # half-up
    assert figs["ratio_last_pct"].value == pytest.approx(81.25)
    assert figs["a_growth_x"].value == pytest.approx(780 / 300)
    assert figs["a_growth_x"].text == "2.6 times"
    assert figs["gap_first_millions"].value == 500
    assert figs["span_years"].value == 2
    assert figs["prev_year_quarter"].value == (2021, 1)
    assert figs["panel_economies"].text == "2"
    assert figs["econ_reported_a_first"].value == 3  # AA, BB, CC (EU excluded)
    assert figs["econ_at_threshold_last"].value == 1  # BB: 600/560 = 107%; AA: 180/400 = 45%
    assert figs["fastest_top_language"].value == "TypeScript"  # top 2 by pushers: JavaScript, TypeScript
    assert "def _ratio_first" in figs["ratio_first_pct"].code


def test_a_claim_that_the_data_contradicts_stops_the_render(tmp_path):
    # JavaScript grows faster than TypeScript here, so "the ratio rose" is false.
    rows = []
    for i, (y, q) in enumerate(NINE_QUARTERS):
        rows += [(300, "TypeScript", "AA", y, q), (400 + 100 * i, "JavaScript", "AA", y, q)]
    an = Analysis(figures.load_languages(write_csv(tmp_path / "l.csv", rows)), PARAMS)
    with pytest.raises(FigureError, match="ratio_rose"):
        figures.check_claims(an, compute_figures(an))


def test_a_changed_csv_schema_is_refused(tmp_path):
    p = tmp_path / "l.csv"
    p.write_text("pushers,language,iso2_code,year,quarter\n1,Go,AA,2020,1\n")
    with pytest.raises(FigureError, match="columns changed"):
        figures.load_languages(p)
