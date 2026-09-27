"""Every narration number comes from a named, computed figure; rounding and units are explicit."""

from decimal import Decimal

import pytest

import figures
from figures import Analysis, FigureError, compute_figures, fill, format_figure, hand_typed_numbers, round_half_up

from helpers import NINE_QUARTERS, PARAMS, SPEC, small_dataset, write_csv


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


# --- attributed sources: the one narrow exception -----------------------------------------------------------------


def test_a_source_placeholder_is_filled_from_the_spec_and_needs_it():
    filled = fill("Before. {src:octoverse_2025} After.", {}, SPEC)
    assert SPEC["externalSources"]["octoverse_2025"]["sentence"] in filled
    with pytest.raises(FigureError, match="needs the spec"):
        fill("Before. {src:octoverse_2025} After.", {})
    with pytest.raises(FigureError, match="unknown source"):
        fill("{src:no_such_source}", {}, SPEC)


def test_the_filled_t1_script_holds_no_number_outside_figures_except_the_source_year(tmp_path):
    an = Analysis(figures.load_languages(small_dataset(tmp_path), ["EU"]), PARAMS)
    figs = compute_figures(an)
    script = figures.fill_spec(SPEC, figs).script
    assert "2025" in script
    assert figures.untraced_numbers(script, figs, {"2025"}) == []
    assert figures.untraced_numbers(script, figs) == ["2025", "2025"]  # without the exception, the year is caught


# --- chart figures: every number drawn is a figure, rounded half-up -----------------------------------------------


def test_chart_labels_round_half_up_where_format_would_round_half_even():
    assert f"{2.25:.1f}" == "2.2" and f"{0.125:.2f}" == "0.12"  # what charts.py used to draw
    assert format_figure("signed", 2.25, 1)[0] == "+2.3"
    assert format_figure("times_sign", 0.25, 1)[0] == "0.3×"
    assert format_figure("millions", 125_000, 2)[0] == "0.13 million"
    assert format_figure("signed", -1.25, 1)[0] == "−1.3"


def test_chart_figures_on_a_known_dataset(tmp_path):
    an = Analysis(figures.load_languages(small_dataset(tmp_path), ["EU"]), PARAMS)
    cf = figures.compute_chart_figures(an)
    assert cf["pushers_lines.a_last_millions"].value == 780 and cf["pushers_lines.a_last_millions"].text == "0.00 million"
    assert cf["growth_bars.growth.typescript"].text == "2.6×"
    assert cf["growth_bars.economies.typescript"].value == 2
    assert [k for k in cf if k.startswith("yearly_gain_bars.label.")] == [
        "yearly_gain_bars.label.2020_2021", "yearly_gain_bars.label.2021_2022"]
    assert cf["yearly_gain_bars.label.2020_2021"].text == "2020–21"
    first = sum(f.value for k, f in cf.items() if k.startswith("ratio_histogram.first."))
    assert first == len(an.panel)  # every panel economy lands in exactly one bin
    assert cf["coverage_lines.b_reported_last"].value == 3  # AA, BB, CC
    assert all(f.chart for f in cf.values()) and all("def _chart_" in f.code for f in cf.values())
    fj = figures.figures_json(compute_figures(an), [], SPEC, an, cf)
    assert sum(fj["chartFigureCounts"].values()) == len(fj["chartFigures"]) == len(cf)
