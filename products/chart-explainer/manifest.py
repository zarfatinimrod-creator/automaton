"""`manifest.json` in the exact `VideoManifest` shape `checkPublication()` reads (src/revenue/publication-gate.ts).

What the author may fill, it fills. What only someone else may fill stays null: `originality`, `factCheck` and
`promiseMatch` are verdicts by separate auditor agents (G3-G5), and the gate rejects any the author signs.

The constants below mirror `publication-gate.ts`: the board's three (research/faceless-youtube/PREREG-DECISIONS.md §2)
and the kids line's three pinned sentences (research/channel-loop/RULING-2026-10-04-kids-youtube.md §4). Python cannot
import them, so `tests/test_manifest.py` reads the TypeScript source and fails if any drifts.

Which YouTube line a video is for, and its made-for-kids designation, come from the spec (`line`, `madeForKids`); the
gate's G11 judges them. On the kids line the renderer burns KIDS_ON_SCREEN_TAG into every frame (charts.py) and the
manifest records it as `onScreenTagEveryFrame`; the description opens with KIDS_AUDIENCE_SENTENCE, then the voice
sentence. No kids spec exists yet (ruling §9): this is the code path one will use.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
from typing import Any

from figures import FilledSpec
from tts import KOKORO_MODEL, KOKORO_VOICES

AUTHOR = "opus-builder"

CHART_TTS_SYNTHETIC_MEDIA = True
SYNTHETIC_VOICE_DISCLOSURE = (
    "Narration: a synthetic voice (Kokoro text-to-speech), not a recording of any person and not an imitation of "
    "anyone. Charts are drawn by code from the data cited below. Produced with AI systems."
)
ALLOWED_NARRATION_ENGINES = frozenset({"kokoro-82m"})

# Ruling 4.10 §4 rules 1-2, verbatim; publication-gate.ts holds the originals (G7-k).
KIDS_SPOKEN_DECLARATION = (
    "This video was made by a computer program, not by a person. The voice is a computer voice, not a real person. "
    "Every number comes from real data, listed under the video."
)
KIDS_ON_SCREEN_TAG = "Made by a computer program · computer voice · not a person"
KIDS_AUDIENCE_SENTENCE = "Made for children who can read. This channel is set as made for kids."

# The YouTube lines a manifest may be written for (publication-gate.ts YoutubeLine). The kids line burns the tag.
KIDS_LINE = "kids-explainers"
LINES = ("faceless-youtube", KIDS_LINE)

# VideoManifest, in declaration order. tests/test_manifest.py checks this against the interface itself.
MANIFEST_FIELDS = (
    "id",
    "author",
    "line",
    "title",
    "description",
    "tags",
    "thumbnailBrief",
    "topic",
    "script",
    "datasets",
    "originality",
    "factCheck",
    "promiseMatch",
    "containsSyntheticMedia",
    "madeForKids",
    "onScreenTagEveryFrame",
    "narration",
    "scheduledAt",
    "runnerMinutes",
    "tokenCostIls",
)


def line_of(spec: dict[str, Any]) -> str:
    """The spec's YouTube line. A manifest is written only for a line the gate knows."""
    line = spec.get("line")
    if line not in LINES:
        raise ValueError(f"the spec's line is {line!r}; a manifest is written only for {', '.join(LINES)}")
    return line


def on_screen_tag(spec: dict[str, Any]) -> str | None:
    """The tag burned into every frame: KIDS_ON_SCREEN_TAG on the kids line, none on T1's (ruling 4.10 §4 rule 1)."""
    return KIDS_ON_SCREEN_TAG if line_of(spec) == KIDS_LINE else None


def description(spec: dict[str, Any]) -> str:
    """The opening, the board's voice sentence, then the data attribution the sentence points to ("cited below").

    T1 opens with a summary. The kids line opens with KIDS_AUDIENCE_SENTENCE and goes straight on to the voice sentence
    (ruling 4.10 §4 rule 2: the parent reads who it is for, then what made it, then the data)."""
    d = spec["dataset"]
    excluded = ", ".join(spec["params"]["excludeEconomies"])
    opening = (
        KIDS_AUDIENCE_SENTENCE
        if line_of(spec) == KIDS_LINE
        else f"{spec['question']} An explainer computed from GitHub's own quarterly counts of developers pushing code, "
        f"economy by economy."
    )
    return "\n\n".join(
        [
            opening,
            SYNTHETIC_VOICE_DISCLOSURE,
            f"Data: {d['name']}, {d['file']} at commit {d['commit']} ({d['homepage']}). "
            f"Licence: {d['licence']} (Creative Commons CC0 1.0 Universal), as GitHub states it in the dataset's "
            f"README and datasheet. GitHub did not produce, endorse or approve this video.",
            f"Method: every number is computed from that file; the {excluded} aggregate is excluded; the comparison "
            f"follows the economies reported for both languages in every quarter. Public activity only. Not advice.",
            "Counting: GitHub counts the developers in each economy who push to repositories containing each "
            "language, so a repository that holds both languages counts for both (GitHub Docs, "
            "\"About repository languages\"; the dataset's datasheet).",
            *(
                f"Context: {src['sentence']} That is a different count from the quarterly pushers in this video. ({src['url']})"
                for src in spec.get("externalSources", {}).values()
            ),
        ]
    )


def datasets(spec: dict[str, Any]) -> list[dict[str, Any]]:
    d = spec["dataset"]
    return [
        {
            "name": d["name"],
            "licence": d["licence"],
            "licenceSnapshot": d["licenceSnapshot"],
            "upstream": [{"source": u["source"], "licence": u["licence"]} for u in d["upstream"]],
        }
    ]


def build_manifest(
    spec: dict[str, Any],
    filled: FilledSpec,
    *,
    runner_minutes: float,
    token_cost_ils: float,
    scheduled_at: str,
) -> dict[str, Any]:
    voice = spec["voice"]
    if voice["engine"] not in ALLOWED_NARRATION_ENGINES:
        raise ValueError(f"narration engine {voice['engine']!r} is not allowed; a voice imitating a person is never made")
    if spec["author"] != AUTHOR:
        raise ValueError(f"the spec's author is {spec['author']!r}; this builder writes as {AUTHOR!r}")
    m = {
        "id": spec["id"],
        "author": AUTHOR,
        "line": line_of(spec),
        "title": filled.title,
        "description": description(spec),
        "tags": list(spec.get("tags", [])),
        "thumbnailBrief": spec.get("thumbnailBrief"),
        "topic": spec["topic"],
        "script": filled.script,
        "datasets": datasets(spec),
        "originality": None,
        "factCheck": None,
        "promiseMatch": None,
        "containsSyntheticMedia": CHART_TTS_SYNTHETIC_MEDIA,
        # G11 (ruling 4.10 §6 rule 1): from the spec as written; a spec that does not decide it writes null, which fails.
        "madeForKids": spec.get("madeForKids"),
        # G7-k: the tag charts.py burned into, and asserted on, every frame (render_scene_chart refuses a frame without it).
        "onScreenTagEveryFrame": on_screen_tag(spec),
        # P-1 (ruling 30.9 16(c) item 7): the archive and model tts.py loads, each fetched only against its sha256 pin;
        # the gate refuses a manifest that does not name both (publication-gate.ts, NARRATION_VOICE_LICENCES).
        "narration": {
            "engine": voice["engine"],
            "voiceId": voice["voice"],
            "voicesFile": KOKORO_VOICES.filename,
            "modelFile": KOKORO_MODEL.filename,
        },
        "scheduledAt": scheduled_at,
        "runnerMinutes": math.ceil(runner_minutes * 100) / 100,
        "tokenCostIls": token_cost_ils,
    }
    assert tuple(m) == MANIFEST_FIELDS
    return m


# G3-G5 verdicts come only from auditor files in products/chart-explainer/audits/, never from this builder.
AUDIT_FIELDS = {"G3": "originality", "G4": "factCheck", "G5": "promiseMatch"}
AUDITS_DIR = Path(__file__).resolve().parent / "audits"


def script_sha256(script: str) -> str:
    return hashlib.sha256(script.encode("utf-8")).hexdigest()


def merge_audits(m: dict[str, Any], audits_dir: Path = AUDITS_DIR) -> tuple[dict[str, Any], dict[str, str]]:
    """Fill originality / factCheck / promiseMatch from auditor verdict files — only those bound to THIS script.

    A verdict file carries `gate`, `auditor`, `verdict`, (`figuresChecked` for G4) and `auditedScriptSha256`, the
    sha256 of the exact script the auditor read. A verdict for another script — an earlier draft, before a fix — is
    never carried over, and neither is one the author signed. The gate re-checks the author rule on its side.
    Returns the manifest and one note per field saying which file filled it or why none did.
    """
    notes: dict[str, str] = {}
    current = script_sha256(m["script"])
    for p in sorted(audits_dir.glob("*.json")) if audits_dir.is_dir() else []:
        a = json.loads(p.read_text(encoding="utf-8"))
        field = AUDIT_FIELDS.get(a.get("gate"))
        if field is None:
            continue
        if a.get("auditedScriptSha256") != current:
            notes.setdefault(field, f"{p.name}: audited a different script (hash mismatch) — not carried over")
            continue
        if not a.get("auditor") or a["auditor"] == m["author"]:
            notes[field] = f"{p.name}: auditor missing or the author itself — not carried over"
            continue
        if a.get("verdict") not in ("PASS", "FAIL"):
            raise ValueError(f"{p.name}: verdict must be PASS or FAIL, got {a.get('verdict')!r}")
        if m[field] is not None:
            raise ValueError(f"{p.name}: a second {a['gate']} verdict for the same script; one auditor per gate")
        verdict: dict[str, Any] = {"auditor": a["auditor"], "verdict": a["verdict"]}
        if field == "factCheck":
            verdict["figuresChecked"] = int(a.get("figuresChecked", 0))
        m[field] = verdict
        notes[field] = f"{p.name}: {a['verdict']} by {a['auditor']}"
    return m, notes


def build_notes(manifest: dict[str, Any], render: dict[str, Any]) -> dict[str, str]:
    """Why each non-obvious field holds what it holds. A sibling file, so manifest.json stays the exact shape."""
    return {
        "originality": "null on purpose: G3 needs a PASS from an auditor agent other than the author.",
        "factCheck": "null on purpose: G4 needs a separate auditor to recompute every figure in figures.json "
        "against the CSV at the pinned commit.",
        "promiseMatch": "null on purpose: G5 needs an auditor to confirm the first 30 seconds answer the title.",
        "containsSyntheticMedia": "true: board ruling 27.9.2026 (PREREG-DECISIONS.md §2a) for every chart + "
        "synthetic-narration video; the description carries SYNTHETIC_VOICE_DISCLOSURE verbatim (§2b).",
        "madeForKids": f"{json.dumps(manifest['madeForKids'])}: the spec's designation for the {manifest['line']} line, "
        "sent as selfDeclaredMadeForKids; G11 requires true on kids-explainers and false on faceless-youtube "
        "(ruling 4.10 §6 rule 1), and the read-back after upload must say the same.",
        "onScreenTagEveryFrame": f"{json.dumps(manifest['onScreenTagEveryFrame'], ensure_ascii=False)}: the tag "
        "charts.py burned into every frame and checked on each before saving (kids line only; ruling 4.10 §4 rule 1).",
        "narration": "Kokoro-82M stock voice; no cloned or imitated voice (PREREG-DECISIONS.md §2c). voicesFile "
        "and modelFile are the files tts.py loads, each fetched only against its sha256 pin; P-1 (ruling 30.9 "
        "16(c) item 7) refuses a manifest that does not name both.",
        "scheduledAt": "NOT a schedule. T1 is held unpublished until Stage A; this is the render's finish time, the "
        "earliest moment a publish could happen, so G6 has a real date. The publish step must re-run the gate with "
        "the actual time, and must not schedule a later publish time: a scheduled video stays private until then "
        "(T1-PROTOCOL.md).",
        "runnerMinutes": f"wall-clock minutes measured by render.py from {render['clockStartedBy']} to the end of "
        f"the render, rounded up to 0.01 (G9 cap: 60).",
        "tokenCostIls": "0: no API-billed tokens. The script template was written by an Opus builder agent in a "
        "subscription session, and rendering calls no model API. Session tokens were not metered per video.",
    }


def main(argv: list[str] | None = None) -> int:
    """Merge auditor verdicts into an already-rendered manifest, without re-rendering.

        python manifest.py out/t1        # rewrites out/t1/manifest.json and manifest.notes.json
    """
    import sys

    args = sys.argv[1:] if argv is None else argv
    if len(args) != 1:
        print("usage: python manifest.py <render-out-dir>", file=sys.stderr)
        return 2
    out = Path(args[0])
    m = json.loads((out / "manifest.json").read_text(encoding="utf-8"))
    for field in AUDIT_FIELDS.values():
        m[field] = None  # re-derived from the audit files every time, never kept from a previous merge
    m, notes = merge_audits(m)
    (out / "manifest.json").write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    notes_path = out / "manifest.notes.json"
    old = json.loads(notes_path.read_text(encoding="utf-8")) if notes_path.exists() else {}
    notes_path.write_text(json.dumps({**old, **notes}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for field in AUDIT_FIELDS.values():
        print(f"{field}: {notes.get(field, 'no verdict file for this script')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
