"""Attributed statements from other sources, and the one narrow exception to "no hand-typed numbers".

A narration sentence may report what another publication said, e.g. GitHub's Octoverse 2025 report. Such a sentence is
not a figure: nothing in it is computed from our dataset. It lives in the analysis spec as an external source with its
URL, a rendered snapshot under research/rendered/, the line number and the verbatim quote. It enters the narration
only through a `{src:<id>}` placeholder, and it is checked here:

- the quote must be on that line of the rendered snapshot;
- every phrase in `mustMatchQuote` must appear in the quote, so the sentence says nothing the page does not;
- the sentence may contain exactly one kind of number: the source's own `year` (e.g. "2025" in "Octoverse 2025" and
  "August 2025"). Any other digit, and any number word, fails. That is the whole exception.

Citations work the same way without the year: a spec `citations` entry is a quote that must sit on a given line of a
rendered file (e.g. the counting rule, datasheet l.37).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from figures import NUMBER_WORDS, FigureError

SOURCE_PLACEHOLDER = re.compile(r"\{src:([a-z][a-z0-9_]*)\}")
_NUMBER_WORD = re.compile(r"\b(" + "|".join(NUMBER_WORDS) + r")\b", re.IGNORECASE)
_NUMBER_TOKEN = re.compile(r"\d+(?:[.,]\d+)*")


def quote_on_line(repo_root: Path, path: str, line: int, quote: str) -> None:
    lines = (Path(repo_root) / path).read_text(encoding="utf-8").splitlines()
    if not 1 <= line <= len(lines):
        raise FigureError(f"{path} has no line {line}")
    if quote not in lines[line - 1]:
        raise FigureError(f"{path}:{line} does not contain the quote {quote!r}")


def source_sentence_problems(source: dict[str, Any]) -> list[str]:
    """What is wrong with an attributed sentence, without touching the file system. Empty means it passes."""
    sentence, quote, year = source["sentence"], source["quote"], str(source["year"])
    problems = []
    for token in _NUMBER_TOKEN.findall(sentence):
        if token != year:
            problems.append(f"number {token!r} is not the source's year {year}")
    for m in _NUMBER_WORD.finditer(sentence):
        problems.append(f"number word {m.group(0)!r}")
    if year not in quote:
        problems.append(f"the year {year} is not in the quote")
    for phrase in source["mustMatchQuote"]:
        if phrase.lower() not in quote.lower():
            problems.append(f"phrase {phrase!r} is not in the quote")
        if phrase.lower() not in sentence.lower():
            problems.append(f"phrase {phrase!r} is not in the sentence")
    return problems


def check_sources(spec: dict[str, Any], repo_root: Path) -> list[dict[str, Any]]:
    """Verify every external source and citation in the spec against its rendered snapshot. Raises on the first
    failure; returns a record of what was checked for render-report.json."""
    checked = []
    for sid, src in spec.get("externalSources", {}).items():
        problems = source_sentence_problems(src)
        if problems:
            raise FigureError(f"external source {sid}: {problems}")
        for ref in [src, *src.get("supporting", [])]:
            quote_on_line(repo_root, ref["rendered"], ref["line"], ref["quote"])
        checked.append({"id": sid, "url": src["url"], "rendered": src["rendered"], "line": src["line"], "ok": True})
    for c in spec.get("citations", []):
        quote_on_line(repo_root, c["rendered"], c["line"], c["quote"])
        checked.append({"id": c["id"], "rendered": c["rendered"], "line": c["line"], "ok": True})
    return checked


def fill_sources(text: str, spec: dict[str, Any]) -> str:
    sources = spec.get("externalSources", {})
    unknown = [s for s in SOURCE_PLACEHOLDER.findall(text) if s not in sources]
    if unknown:
        raise FigureError(f"unknown source(s) {unknown} in: {text!r}")
    return SOURCE_PLACEHOLDER.sub(lambda m: sources[m.group(1)]["sentence"], text)


def source_years(spec: dict[str, Any]) -> set[str]:
    return {str(s["year"]) for s in spec.get("externalSources", {}).values()}
