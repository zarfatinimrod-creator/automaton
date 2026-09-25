#!/usr/bin/env python3
"""Check that every quote an agent calls CONFIRMED is actually in the file it cites.

Why this exists. The recurring defect in this repo is a confident claim nobody checked. Agents grade
facts CONFIRMED with a verbatim quote and a path; this script re-opens the path and looks for the
quote, so "verbatim" is tested rather than trusted. It was written inline twice on 25.9 (REGRADE.md,
60/60 quotes) before becoming a file.

Input: a JSON file holding objects with `grade` and `evidence` keys, at any depth (a workflow's
structured result, a list of facts, a journal record's `result`). Only facts graded CONFIRMED,
CONTRADICTED or RENDERED are checked. From each `evidence` string it takes:
  - quotes: text between '...', "...", or “...” of at least MIN_QUOTE characters;
  - paths: repo-relative paths (e.g. research/rendered/x.txt:42, docs/REJECTED.md) that exist.
A quote passes if, whitespace-collapsed, it occurs in any cited path. Evidence that cites only a
command and its output cannot be checked here and is reported as UNCHECKABLE, not as a pass.

Usage: python3 scripts/verify-quotes.py <results.json> [--root DIR] [--strict]
Exit 1 with --strict when any checkable quote is missing.
"""
import json
import os
import re
import sys

MIN_QUOTE = 20
CHECKED_GRADES = {"CONFIRMED", "CONTRADICTED", "RENDERED"}
QUOTE_RES = [
    re.compile(r"'([^']{%d,})'" % MIN_QUOTE),
    re.compile(r'"([^"]{%d,})"' % MIN_QUOTE),
    re.compile(r"“([^”]{%d,})”" % MIN_QUOTE),
]
PATH_RE = re.compile(r"(?<![\w/.-])((?:[\w.-]+/)+[\w.-]+\.\w+)(?::(\d+)(?:-(\d+))?)?")


def norm(text):
    return re.sub(r"\s+", " ", text).strip()


def walk(node):
    if isinstance(node, dict):
        if "grade" in node and "evidence" in node:
            yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def check(fact, root, cache):
    evidence = fact.get("evidence") or ""
    quotes = [m for rx in QUOTE_RES for m in rx.findall(evidence)]
    # An ellipsis marks an elided quote; check each side on its own.
    parts = [p.strip() for q in quotes for p in re.split(r"\s*(?:\.\.\.|…)\s*", q) if len(p.strip()) >= MIN_QUOTE]
    paths = []
    for m in PATH_RE.finditer(evidence):
        rel = m.group(1)
        full = os.path.join(root, rel)
        if os.path.isfile(full):
            paths.append(rel)
    if not parts:
        return "NO_QUOTE", [], paths
    if not paths:
        return "UNCHECKABLE", parts, paths
    missing = []
    for part in parts:
        target = norm(part)
        found = False
        for rel in paths:
            if rel not in cache:
                with open(os.path.join(root, rel), encoding="utf-8", errors="replace") as fh:
                    cache[rel] = norm(fh.read())
            if target in cache[rel]:
                found = True
                break
        if not found:
            missing.append(part)
    return ("MISSING" if missing else "VERIFIED"), missing, paths


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    strict = "--strict" in argv
    root = "."
    if "--root" in argv:
        root = argv[argv.index("--root") + 1]
        args = [a for a in args if a != root]
    if len(args) != 1:
        print(__doc__)
        return 2
    with open(args[0], encoding="utf-8") as fh:
        data = json.load(fh)
    cache = {}
    tally = {}
    for fact in walk(data):
        if str(fact.get("grade", "")).upper() not in CHECKED_GRADES:
            continue
        status, missing, paths = check(fact, root, cache)
        tally[status] = tally.get(status, 0) + 1
        if status == "MISSING":
            label = (fact.get("fact") or fact.get("claim") or "")[:100]
            print(f"MISSING  {label}")
            for part in missing:
                print(f"         not in {', '.join(paths)}: {part[:160]!r}")
    print("tally: " + json.dumps(tally, sort_keys=True))
    return 1 if strict and tally.get("MISSING") else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
