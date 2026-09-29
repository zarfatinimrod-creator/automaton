"""Parent-guide spec: loading and the checks the renderer runs before it draws anything.

Standard library only, so the refusal path works on a machine with nothing installed.

A spec is the script (verbatim) plus machine-checked evidence. The renderer refuses a spec when:
  * a scene (or the end card) has no evidence entry, or any entry fails: the file must sit under
    research/rendered/, exist, and carry the quote on the cited line (a fixed-string match, as grep -F);
    a meta entry must match the stored <slug>.meta.json; every cited capture must have returned HTTP 200;
  * any number in a scene's on-screen text, narration or illustration labels is not in that scene's quotes,
    unless it is a declared derived number that checks out (the step prefix "N. ", the video's own step count,
    the capture date in Israel time, or an illustrative label number);
  * a quote comes from a capture of the help center's Computer tab (its title reads " - מחשב - " or
    " - Computer - ") and the entry does not say why a desktop page may back it (`desktop_ok`): the app's steps
    differ by device, and a desktop step chain drawn beside a phone is wrong;
  * steps are out of order: step titles "N. ..." must run 1..N; consecutive scenes may share a number (pages of
    one step), a number may not come back later;
  * a narration line is not vowelised (the voice needs nikud; unvowelised Hebrew phonemises to consonants), or a
    caption says anything other than its narration line in standard spelling;
  * a scene's `motion` keys do not fit it: `reveal` needs one anchor per body item, `art` may only name its
    illustration's beats (motion.ART_BEATS) and `highlight` only its body items, each anchored to "start", an
    existing narration line n, [n, seconds] or [n, "end"];
  * the end card lacks the AI line or the non-affiliation line, or the spec has no independence tag (drawn on
    every frame beside the AI line, so a viewer who swipes away early still sees it).

Captures are dated in Israel time (Asia/Jerusalem): the audience is Israeli, and the captures of 28.9.2026 at
22:00-22:03 UTC were made at 01:00-01:03 on 29.9 in Israel.
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from motion import validate_motion  # stdlib only

PRODUCT_DIR = Path(__file__).resolve().parent
REPO_ROOT = PRODUCT_DIR.parents[1]
EVIDENCE_DIR = "research/rendered"

# Hebrew points and cantillation marks, including the Phonikud marks U+05AB (stress), U+05BD (meteg)
# and U+05C7 (kamatz katan). U+05BE (maqaf) and U+05C0/U+05C3/U+05C6 are punctuation and are kept.
NIKUD = re.compile("[֑-ׇֽֿׁׂׅׄ]")
HEB_LETTER = re.compile("[א-ת]")
# A number token: 28.9.2026 is one token; "5–8" is two (the en dash is not part of a token).
NUMBER = re.compile(r"\d+(?:[.:,]\d+)*")
STEP_PREFIX = re.compile(r"^(\d+)\.\s+(.*)$", re.S)
NON_AFFILIATION = re.compile(r"ללא קשר|אינו קשור|לא קשור")
DERIVED_KINDS = {"step_count", "capture_date", "illustrative"}
CAPTURE_TZ = ZoneInfo("Asia/Jerusalem")
DESKTOP_TITLE = re.compile(r" - (מחשב|Computer) - ")


class SpecError(Exception):
    """Raised with the full list of problems when a spec must not be rendered."""

    def __init__(self, problems: list[str]):
        super().__init__("\n".join(problems))
        self.problems = problems


def load(path: Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def strip_nikud(text: str) -> str:
    return NIKUD.sub("", text)


def narration_lines(scene: dict) -> list[str]:
    return [ln for ln in scene.get("narration", "").split("\n") if ln.strip()]


def body_items(scene: dict) -> list[str]:
    return [ln for ln in scene.get("on_screen_body", "").split("\n") if ln.strip()]


def split_title(title: str) -> tuple[int | None, str]:
    """'2. בוחרים הגדרת תוכן' -> (2, 'בוחרים הגדרת תוכן'); a title without the prefix -> (None, title)."""
    m = STEP_PREFIX.match(title)
    return (int(m.group(1)), m.group(2)) if m else (None, title)


def end_card_lines(spec: dict) -> list[str]:
    """On-screen lines of the end card. A line wrapped in parentheses is a direction to the editor
    (duration, what to show), not text for the screen."""
    out = []
    for ln in spec.get("end_card", "").split("\n"):
        s = ln.strip()
        if s and not (s.startswith("(") and s.endswith(")")):
            out.append(s)
    return out


def reading_chars(scene: dict, title_seen: bool = False) -> int:
    """Characters a viewer has to read in a scene: the title as drawn (without its "N. " step prefix, which the
    badge shows), every body item including footnotes, and the illustration's labels, one space between each.
    title_seen: the scene is a later page of a step and repeats the title the viewer has just read."""
    title = "" if title_seen else split_title(scene.get("on_screen_title", ""))[1]
    parts = [title] + body_items(scene)
    parts += list(scene.get("illustration", {}).get("labels", []))
    parts = [p for p in parts if p]
    return sum(len(p) for p in parts) + max(0, len(parts) - 1)


def scene_text(scene: dict) -> str:
    """Everything a viewer reads or hears in the scene, excluding illustration labels."""
    return "\n".join([scene.get("on_screen_title", ""), scene.get("on_screen_body", ""),
                      strip_nikud(scene.get("narration", ""))])


def _rel_ok(root: Path, rel: str) -> Path | None:
    base = (root / EVIDENCE_DIR).resolve()
    p = (root / rel).resolve()
    try:
        p.relative_to(base)
    except ValueError:
        return None
    return p


def meta_path_for(capture: Path) -> Path:
    """research/rendered/yk-timer-iw.txt -> research/rendered/yk-timer-iw.meta.json"""
    name = capture.name
    if name.endswith(".meta.json"):
        return capture
    return capture.with_name(name.rsplit(".", 1)[0] + ".meta.json")


_file_cache: dict[Path, list[str]] = {}


def _lines(p: Path) -> list[str]:
    if p not in _file_cache:
        _file_cache[p] = p.read_text(encoding="utf-8").split("\n")
    return _file_cache[p]


def check_evidence(entry: dict, root: Path = REPO_ROOT) -> str | None:
    """None when the entry holds, else the reason it does not."""
    rel = entry.get("file")
    if not rel:
        return "evidence entry without a file"
    p = _rel_ok(root, rel)
    if p is None:
        return f"{rel}: not under {EVIDENCE_DIR}/"
    if not p.is_file():
        return f"{rel}: no such file"
    meta = meta_path_for(p)
    if not meta.is_file():
        return f"{rel}: no {meta.name} beside it (HTTP status unknown)"
    try:
        m = json.loads(meta.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return f"{meta.name}: not JSON"
    if m.get("status") != 200:
        return f"{rel}: capture status {m.get('status')}, not 200"
    title = _lines(p)[0] if p.suffix == ".txt" else ""
    if DESKTOP_TITLE.search(title) and not entry.get("desktop_ok"):
        return (f"{rel}: this capture is the help center's Computer tab ({title[:60]!r}); the app's steps differ by "
                "device. Capture the Android/iPhone tab, or say in desktop_ok why this quote holds on every device")
    if "meta" in entry:
        for k, want in entry["meta"].items():
            if m.get(k) != want:
                return f"{rel}: meta {k} is {m.get(k)!r}, not {want!r}"
        return None
    line, quote = entry.get("line"), entry.get("quote")
    if not isinstance(line, int) or line < 1 or not quote:
        return f"{rel}: evidence needs a 1-based line and a quote"
    lines = _lines(p)
    if line > len(lines):
        return f"{rel}:{line}: file has {len(lines)} lines"
    if quote not in lines[line - 1]:
        return f"{rel}:{line}: quote not on that line: {quote[:60]!r}"
    return None


def capture_date(fetched_at: str) -> str:
    """'2026-09-28T22:03:10.809Z' -> '29.9.2026': the date in Israel when the capture was made."""
    d = datetime.fromisoformat(fetched_at.replace("Z", "+00:00")).astimezone(CAPTURE_TZ)
    return f"{d.day}.{d.month}.{d.year}"


def capture_dates(spec: dict, root: Path = REPO_ROOT) -> set[str]:
    """Israel-time dates (D.M.YYYY) on which the captures this spec cites were fetched."""
    dates = set()
    for ev in all_evidence(spec):
        p = _rel_ok(root, ev.get("file", ""))
        if p is None or not p.exists():
            continue
        meta = meta_path_for(p)
        if meta.is_file():
            ts = json.loads(meta.read_text(encoding="utf-8")).get("fetchedAt")
            if ts:
                dates.add(capture_date(ts))
    return dates


def all_evidence(spec: dict) -> list[dict]:
    out = [ev for sc in spec.get("scenes", []) for ev in sc.get("evidence", [])]
    return out + list(spec.get("end_card_evidence", []))


def titles_seen(spec: dict) -> list[bool]:
    """Per scene: True when it repeats the title of the scene before it (a later page of the same step)."""
    scenes = spec.get("scenes", [])
    return [i > 0 and sc.get("on_screen_title") == scenes[i - 1].get("on_screen_title") for i, sc in enumerate(scenes)]


def step_scenes(spec: dict) -> list[dict]:
    return [sc for sc in spec.get("scenes", []) if split_title(sc.get("on_screen_title", ""))[0] is not None]


def step_numbers(spec: dict) -> list[int]:
    """The steps in order, one entry per step: consecutive scenes with the same number are pages of one step."""
    out: list[int] = []
    for sc in step_scenes(spec):
        n = split_title(sc["on_screen_title"])[0]
        if not out or out[-1] != n:
            out.append(n)
    return out


def _numbers(text: str) -> list[str]:
    return NUMBER.findall(text)


def _check_derived(entries: list[dict], spec: dict, root: Path, where: str) -> tuple[dict[str, str], list[str]]:
    """Return ({value: kind} for derived numbers that check out, problems)."""
    ok, problems = {}, []
    for d in entries:
        v, kind = str(d.get("value", "")), d.get("kind")
        if kind not in DERIVED_KINDS:
            problems.append(f"{where}: derived number {v!r} has unknown kind {kind!r}")
            continue
        if not d.get("why"):
            problems.append(f"{where}: derived number {v!r} gives no reason")
            continue
        if kind == "step_count" and v != str(len(step_numbers(spec))):
            problems.append(f"{where}: step_count {v} but the spec has {len(step_numbers(spec))} steps")
            continue
        if kind == "capture_date":
            dates = capture_dates(spec, root)
            if dates != {v}:
                problems.append(f"{where}: capture_date {v} but the cited captures were fetched on {sorted(dates)} "
                                "(Israel time)")
                continue
        ok[v] = kind
    return ok, problems


def check_numbers(scene: dict, spec: dict, root: Path = REPO_ROOT) -> list[str]:
    sid = scene.get("id", "?")
    quotes = " ".join(ev.get("quote", "") for ev in scene.get("evidence", []))
    sourced = set(_numbers(quotes))
    derived, problems = _check_derived(scene.get("derived_numbers", []), spec, root, sid)

    step, rest = split_title(scene.get("on_screen_title", ""))
    if step is not None:
        order = step_numbers(spec)
        if order != list(range(1, len(order) + 1)):
            problems.append(f"{sid}: step prefixes run {order}, not 1..{len(order)} in order (pages of one step "
                            "must be consecutive)")
    text = "\n".join([rest, scene.get("on_screen_body", ""), strip_nikud(scene.get("narration", ""))])
    for n in _numbers(text):
        if n in sourced:
            continue
        if n in derived and derived[n] != "illustrative":
            continue
        problems.append(f"{sid}: number {n!r} is not in any of the scene's quotes")
    for label in scene.get("illustration", {}).get("labels", []):
        for n in _numbers(label):
            if n not in sourced and n not in derived:
                problems.append(f"{sid}: illustration number {n!r} is neither quoted nor declared")
    return problems


CAPTION_NAMES = (("YouTube Kids", "יוטיוב קידס"),)
MATRES = set("וי")


def _only_matres_added(plain: str, full: str) -> bool:
    """True when `full` is `plain` with only ו/י inserted (defective -> standard spelling)."""
    i = 0
    for ch in full:
        if i < len(plain) and ch == plain[i]:
            i += 1
        elif ch not in MATRES:
            return False
    return i == len(plain)


def caption_matches(caption: str, narration_line: str) -> bool:
    """A caption is the narration line in standard spelling: same words, same punctuation, each word differing from
    the unvowelised narration only by added ו or י; the product name may be written in Latin letters."""
    for latin, heb in CAPTION_NAMES:
        caption = caption.replace(latin, heb)
    a, b = caption.split(), strip_nikud(narration_line).split()
    return len(a) == len(b) and all(_only_matres_added(y, x) for x, y in zip(a, b))


def _vowelised(line: str) -> bool:
    letters = len(HEB_LETTER.findall(line))
    return letters == 0 or len(NIKUD.findall(line)) >= letters * 0.5


def validate(spec: dict, root: Path = REPO_ROOT) -> list[str]:
    problems: list[str] = []
    scenes = spec.get("scenes") or []
    if not scenes:
        return ["spec has no scenes"]
    for key in ("brand", "ai_line", "series", "independent_tag"):
        if not spec.get(key):
            problems.append(f"spec lacks {key!r}")
    if spec.get("brand") and not spec.get("series", "").startswith(spec["brand"]):
        problems.append("the series line must open with the brand, so no frame reads as an official guide")
    ids = [sc.get("id") for sc in scenes]
    if len(set(ids)) != len(ids) or None in ids:
        problems.append(f"scene ids must be present and unique: {ids}")
    for sc in scenes:
        sid = sc.get("id", "?")
        for key in ("on_screen_title", "on_screen_body", "narration", "sources"):
            if not sc.get(key):
                problems.append(f"{sid}: missing {key!r}")
        evidence = sc.get("evidence") or []
        if not evidence:
            problems.append(f"{sid}: unsourced scene (no evidence entry)")
        for ev in evidence:
            why = check_evidence(ev, root)
            if why:
                problems.append(f"{sid}: {why}")
        for ln in narration_lines(sc):
            if not _vowelised(ln):
                problems.append(f"{sid}: narration line is not vowelised: {ln}")
        if "captions" in sc:
            caps, lines = sc["captions"], narration_lines(sc)
            if len(caps) != len(lines):
                problems.append(f"{sid}: {len(caps)} captions for {len(lines)} narration lines")
            else:
                for c, ln in zip(caps, lines):
                    if not caption_matches(c, ln):
                        problems.append(f"{sid}: caption does not match its narration line: {c}")
        problems += check_numbers(sc, spec, root)
        problems += validate_motion(sc)

    card = end_card_lines(spec)
    if not card:
        problems.append("end card is empty")
    else:
        if not any(spec.get("ai_line", "\0") in ln or spec.get("ai_line_silent", "\0") in ln for ln in card):
            problems.append("end card lacks the AI line")
        if not any(NON_AFFILIATION.search(ln) for ln in card):
            problems.append("end card lacks the non-affiliation line")
        if card[0] != spec.get("brand"):
            problems.append("end card must open with the brand wordmark")
    card_ev = spec.get("end_card_evidence") or []
    if not card_ev:
        problems.append("end card: unsourced (no evidence entry)")
    for ev in card_ev:
        why = check_evidence(ev, root)
        if why:
            problems.append(f"end card: {why}")
    card_quotes = set(_numbers(" ".join(ev.get("quote", "") for ev in card_ev)))
    card_derived, p = _check_derived(spec.get("end_card_derived_numbers", []), spec, root, "end card")
    problems += p
    for n in _numbers("\n".join(card)):
        if n not in card_quotes and (n not in card_derived or card_derived[n] == "illustrative"):
            problems.append(f"end card: number {n!r} is not in its quotes")
    return problems


def require_valid(spec: dict, root: Path = REPO_ROOT) -> None:
    problems = validate(spec, root)
    if problems:
        raise SpecError(problems)
