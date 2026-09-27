# chart-explainer

The code path for the faceless-YouTube experiment's videos (`research/faceless-youtube/VERDICT.md` §12,
`T1-PROTOCOL.md`): one question, one openly licensed dataset, every chart drawn by matplotlib from the data, Kokoro-82M
narration, no music, no stock, no generative imagery. It renders and gate-checks a video and **holds it unpublished**.
There is no upload code here, by design; `tests/test_page_and_scope.py` fails if any appears.

## T1

`analyses/t1.json`: *Is TypeScript catching up with JavaScript on GitHub?* It uses the GitHub Innovation Graph
(`data/languages.csv` pinned to commit `078fb62`, CC0-1.0, DATASETS.md candidate C1). The licence snapshot for G1 is
`research/rendered/github-innovationgraph-licence.txt`, with the dataset's datasheet beside it.

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/python render.py analyses/t1.json --out out/t1      # ~2-3 min on 4 cores; downloads 350 MB of model once
.venv/bin/python -m pytest -q                                   # no network, no model needed
pnpm exec tsx scripts/publication-check.ts products/chart-explainer/out/t1/manifest.json --expect G3,G4,G5   # from the repo root
```

On a runner: `.github/workflows/chart-explainer-render.yml` (dispatch-only) renders it and keeps the MP4, SRT, page,
figures and manifest as the run's artifact.

## The rule that makes the fact-check mechanical

The narration is a template with **no digits and no number words** (`figures.hand_typed_numbers`). Every number is a
placeholder such as `{fig:ratio_last_pct}`, filled from a figure computed in `figures.py` with its rounding (half-up) and
unit in code. Word claims ("the gap widened", "fastest in the last year") are predicates in `figures.CLAIMS`; the render
stops if one is false. `figures.json` lists each figure's name, value, spoken text and the source of the function that
computes it, for the G4 auditor.

## Files

| File | Does |
|---|---|
| `fetch.py` | pinned GitHub URLs only; sha256 must match or the file is discarded; cache in `.cache/` (gitignored) |
| `figures.py` | loads the CSV, computes every figure and claim, fills the templates |
| `charts.py` | one 1920x1080 PNG per scene, DejaVu Sans, source and licence footer |
| `tts.py` | Kokoro narration per scene, sentence by sentence, with the fork's pinned model URLs and verified hashes |
| `assemble.py` | frame-exact scenes (image length = narration length), one H.264/AAC encode, SRT sidecar, probe |
| `page.py` | the web comparison arm: one self-contained HTML page, `{{BRAND}}` placeholder, no scripts |
| `manifest.py` | `manifest.json` in the exact `VideoManifest` shape; auditor fields left null for the auditors |
| `render.py` | runs all of it and writes `render-report.json` (timings, probe, runner minutes) |

`out/` and `.cache/` are never committed.
