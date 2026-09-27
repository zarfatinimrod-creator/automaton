"""Attributed statements are verified against their rendered pages; the year is the only number they may carry."""

import json

import pytest

import sources
from figures import FigureError
from helpers import REPO_ROOT, SPEC

OCTO = SPEC["externalSources"]["octoverse_2025"]


def test_every_source_and_citation_in_t1_is_on_its_rendered_line():
    checked = sources.check_sources(SPEC, REPO_ROOT)
    ids = {c["id"] for c in checked}
    assert {"octoverse_2025", "counting-rule-repository-languages", "counting-rule-datasheet",
            "octoverse-count-definition"} <= ids


def test_the_counting_rule_is_cited_to_githubs_own_pages():
    by_id = {c["id"]: c for c in SPEC["citations"]}
    assert by_id["counting-rule-repository-languages"]["line"] == 257
    assert by_id["counting-rule-repository-languages"]["quote"].startswith("The files and directories within a repository")
    assert by_id["counting-rule-datasheet"]["line"] == 37


def test_the_octoverse_sentence_passes_as_written():
    assert sources.source_sentence_problems(OCTO) == []
    assert OCTO["rendered"].startswith("research/rendered/") and OCTO["line"] == 672


@pytest.mark.parametrize(
    "sentence,problem",
    [
        ("GitHub's Octoverse 2025 report named TypeScript the most used language on GitHub in August 2025, by "
         "contributor counts, with 2.15 million JavaScript contributors.", "2.15"),
        ("GitHub's Octoverse 2026 report named TypeScript the most used language on GitHub in August 2025, by "
         "contributor counts.", "2026"),
        ("GitHub's Octoverse 2025 report named TypeScript the most used language on GitHub twice in August 2025, "
         "by contributor counts.", "twice"),
        ("GitHub's Octoverse 2025 report named TypeScript the most popular language in August 2025, by contributor "
         "counts.", "most used language on GitHub"),
    ],
)
def test_the_exception_is_the_year_and_nothing_else(sentence, problem):
    src = dict(OCTO, sentence=sentence)
    problems = sources.source_sentence_problems(src)
    assert problems and any(problem in p for p in problems), problems


def test_a_phrase_the_page_does_not_say_is_refused():
    src = dict(OCTO, mustMatchQuote=OCTO["mustMatchQuote"] + ["ahead of JavaScript"])
    assert any("not in the quote" in p for p in sources.source_sentence_problems(src))


def test_a_quote_on_the_wrong_line_is_refused():
    spec = json.loads(json.dumps(SPEC))
    spec["externalSources"]["octoverse_2025"]["line"] = 671
    with pytest.raises(FigureError, match="does not contain the quote"):
        sources.check_sources(spec, REPO_ROOT)
    spec = json.loads(json.dumps(SPEC))
    spec["citations"][0]["quote"] += " (edited)"
    with pytest.raises(FigureError, match="does not contain the quote"):
        sources.check_sources(spec, REPO_ROOT)
