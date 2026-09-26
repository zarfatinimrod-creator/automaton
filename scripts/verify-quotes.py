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
A quote passes if, whitespace- and emphasis-collapsed, it occurs in any cited path (VERIFIED). If not,
every tracked text file is searched: a hit elsewhere is MISCITED (the quote is real, the path is
wrong), no hit anywhere is MISSING (the quote may come from a live fetch outside the repo, or may not
exist; either way nobody can re-read it here). Evidence that cites no existing path is UNCHECKABLE, not
a pass. Fragments that look like command residue (`;`, `->`, `|` inside) are skipped.

Usage: python3 scripts/verify-quotes.py <results.json> [--root DIR] [--exclude PREFIX ...] [--strict]
--exclude drops files from the repo-wide search; pass the agents' own output directory, or a report
will vouch for the quotes it repeats.
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
    # Markdown emphasis is presentation, not text: *priced* and priced are the same quote.
    text = re.sub(r"(?<!\w)[*_]{1,2}(?=\S)|(?<=\S)[*_]{1,2}(?!\w)", "", text)
    return re.sub(r"\s+", " ", text).strip()


def is_residue(part):
    return part.startswith((";", "|", "->")) or "->" in part or " | " in part


def repo_texts(root, exclude=()):
    import subprocess
    try:
        names = subprocess.run(["git", "-C", root, "ls-files"], capture_output=True, text=True, check=True).stdout.split("\n")
    except (OSError, subprocess.CalledProcessError):
        return {}
    texts = {}
    for rel in names:
        if rel.startswith(tuple(exclude)) or not rel.endswith((".md", ".txt", ".ts", ".js", ".mjs", ".json", ".yml", ".yaml", ".py", ".html")):
            continue
        full = os.path.join(root, rel)
        try:
            if os.path.getsize(full) > 3_000_000:
                continue
            with open(full, encoding="utf-8", errors="replace") as fh:
                texts[rel] = norm(fh.read())
        except OSError:
            continue
    return texts


def walk(node):
    if isinstance(node, dict):
        if "grade" in node and "evidence" in node:
            yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def check(fact, root, cache, everywhere, exclude=()):
    evidence = fact.get("evidence") or ""
    quotes = [m for rx in QUOTE_RES for m in rx.findall(evidence)]
    # An ellipsis marks an elided quote; check each side on its own.
    parts = [p.strip() for q in quotes for p in re.split(r"\s*(?:\.\.\.|…)\s*", q) if len(p.strip()) >= MIN_QUOTE]
    parts = [p for p in parts if not is_residue(p)]
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
    if not missing:
        return "VERIFIED", [], paths
    if everywhere is not None:
        if not everywhere:
            everywhere.update(repo_texts(root, exclude))
        elsewhere = [rel for rel, text in everywhere.items() if all(norm(p) in text for p in missing)]
        if elsewhere:
            return "MISCITED", missing, elsewhere[:3]
    return "MISSING", missing, paths


def main(argv):
    args, exclude, root = [], [], "."
    strict = "--strict" in argv
    i = 1
    while i < len(argv):
        a = argv[i]
        if a in ("--root", "--exclude") and i + 1 < len(argv):
            if a == "--root":
                root = argv[i + 1]
            else:
                exclude.append(argv[i + 1])
            i += 2
            continue
        if not a.startswith("--"):
            args.append(a)
        i += 1
    if len(args) != 1:
        print(__doc__)
        return 2
    with open(args[0], encoding="utf-8") as fh:
        data = json.load(fh)
    cache = {}
    everywhere = {}
    tally = {}
    for fact in walk(data):
        if str(fact.get("grade", "")).upper() not in CHECKED_GRADES:
            continue
        status, missing, paths = check(fact, root, cache, everywhere, exclude)
        tally[status] = tally.get(status, 0) + 1
        if status in ("MISSING", "MISCITED"):
            label = (fact.get("fact") or fact.get("claim") or "")[:100]
            print(f"{status:8} {label}")
            where = "found in" if status == "MISCITED" else "not in cited"
            for part in missing:
                print(f"         {where} {', '.join(paths) or '(none)'}: {part[:160]!r}")
    print("tally: " + json.dumps(tally, sort_keys=True))
    return 1 if strict and tally.get("MISSING") else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
