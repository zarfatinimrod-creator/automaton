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

**Charts obey the same rule.** Every number drawn on a chart is a `chartFigures` entry in `figures.json` (value, half-up
rounding, code); `charts.py` draws from the file the render just wrote, and `charts.untraced_chart_numbers()` refuses a
frame that shows any other number. Axis scale ticks and the footer (spec metadata only) are the two exemptions.

**One narrow exception: an attributed source's year.** A sentence reporting what another publication said (e.g. GitHub's
Octoverse 2025) enters through `{src:<id>}` from the spec's `externalSources`, with URL, rendered snapshot, line and
quote. `sources.py` checks the quote is on that line, every `mustMatchQuote` phrase is in both quote and sentence, and
the sentence carries no number but the source's own year. Spec `citations` (e.g. the counting rule, datasheet l.37)
are checked against their rendered lines the same way. G5's timing promise (`promise`) is checked on the timeline.

## Files

| File | Does |
|---|---|
| `fetch.py` | pinned GitHub URLs only; sha256 must match or the file is discarded; cache in `.cache/` (gitignored) |
| `figures.py` | loads the CSV, computes every figure, chart figure and claim, fills the templates |
| `sources.py` | verifies attributed statements and citations against `research/rendered/`; the year-only exception |
| `charts.py` | one 1920x1080 PNG per scene, DejaVu Sans, source and licence footer; numbers only from `figures.json` |
| `tts.py` | Kokoro narration per scene, sentence by sentence, with the fork's pinned model URLs and verified hashes |
| `assemble.py` | frame-exact scenes (image length = narration length), one H.264/AAC encode, SRT sidecar, probe |
| `page.py` | the web comparison arm: one self-contained HTML page with the brand from the spec (`page.brand`); the video carries no brand. By default no scripts (byte-identical to before, pinned by `tests/fixtures/t1-page-no-counter.golden.html`). `build_page(..., counter={"host", "key"})` adds one inline script that, on the visit's first scroll and never on load, sends one anonymous `$pageview` to PostHog (no cookie, no storage, random per-visit id, person profiles off) and says so on the page; only a `phc_` project token and the EU/US cloud hosts are accepted. `render.py` does not switch it on. Before a counter page is deployed, the PostHog project must discard client IP data and have GeoIP off (the page says it does). The reach floor it feeds is pre-registered in `research/faceless-youtube/PREREG-DECISIONS.md` §3 (`evaluateWebArm` in `src/revenue/experiments.ts`) |
| `netlify_files.py` | `netlify_files(origin)`: the `_redirects` (`/preview/` rewrite), `_headers` (noindex on `/preview/*`), `robots.txt` and `sitemap.xml` (canonical URL only) deployed beside the page on the web arm's host (PREREG-DECISIONS.md §3.6). No host is hard-coded in this module: the host is an argument, which the deploy configuration passes in (none exists yet; `research/channel-loop/RULING-2026-09-29-lines.md` (e), APPLY 3). The host itself is decided: `https://chartsplained.netlify.app`, the sub-brand name `chartsplained` chosen 29.9, pending the owner's veto (`research/faceless-youtube/PREREG-DECISIONS.md:547`; probes in `research/measurements/t1-subbrand-check.md`) |
| `manifest.py` | `manifest.json` in the exact `VideoManifest` shape; auditor fields left null for the auditors |
| `render.py` | runs all of it and writes `render-report.json` (timings, probe, runner minutes) |

`out/` and `.cache/` are never committed.
