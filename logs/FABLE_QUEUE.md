# Fable queue — what waits for the deciding model

Per the model rule in `CLAUDE.md`: Opus drives; Fable decides where being wrong is expensive and hard
to detect. When Fable's quota is out, the Opus work goes on and the Fable steps wait **here** — one
file, not scattered across the checkpoint and a routine's text.

**Every item is a script in the repo that runs from a clean clone.** Workflow scripts and resume
caches under `/root/.claude` die with the container (the 8.9 and 22.9 caches did), so nothing below
depends on one. Each script opens with a one-word Fable probe and stops there, at the cost of one
call, if the quota is still out.

How to run an item:

```
Workflow({scriptPath: "/home/user/automaton/scripts/workflows/<script>"})
```

Run them in order, one at a time (each is one or two Fable agents — a Fable fan-out is how the quota
died twice). When one finishes, mark it done here with the date and the commit that holds its output.

## Queue (oldest first)

| # | Script | Fable agents | Reads | Writes | Then (on Opus, main thread) | Status |
|---|---|---|---|---|---|---|
| 1 | `fable-faceless-youtube-judge.js` | judge, red-team | `research/faceless-youtube/DIGEST.md`, `REGRADE.md` | `VERDICT.md`, `RED-TEAM.md` there | fold into `docs/REJECTED.md`; if REOPEN, the pilot workflow (task #4); update `logs/2026-09-25-faceless-youtube-reel.md` | waiting since 25.9 16:00 UTC |
| 2 | `fable-owner-docs-judgement.js` | one refuter (+ Opus editors) | `research/owner-docs-audit/APPLIED.md` §Queued (26 rows) | `JUDGEMENT.md` there; edits to 8 owner docs | regenerate `docs/OWNER_STEPS.he.pdf` (`node scripts/owner-steps-pdf.mjs`); apply any `codeChange` | waiting since 25.9 23:20 UTC |
| 3 | `fable-license-choice.js` | one decider | `research/measurements/gumroad-native-licenses.md` | `gumroad-license-decision.md` there | build the chosen option on Opus against its acceptance tests; drop the per-sale owner step | waiting since 25.9 23:40 UTC |
| 4 | `fable-sweep-2-board.js` | one board (plays chief auditor too) | `research/colony-sweep/SCREEN-2.md`, `screen-2/*.md` (Opus screeners, 26.9), `research/measurements/algora-terms-question.md` (a committed line) | `research/colony-sweep/BOARD-2.md` | kills → `docs/REJECTED.md`; admissions → `src/revenue/portfolio.ts`; approved tests → CI jobs | ready — `screen-2/` complete 26.9 (9 of 9 KILL, `SCREEN-2.md`) |

## What already ran on Opus instead of waiting

The checking tier never waits for Fable — only the deciding tier does:

- faceless-YouTube: 7 scouts + 7 auditors, then `DIGEST.md` and `REGRADE.md` (60 re-grades, every quote machine-checked).
- owner documents: 851 claims checked, 131 mechanical findings confirmed and applied (`APPLIED.md`).
- Gumroad licence: the research, an independent check, and the live CORS measurement from a runner.
- sweep 2: the 9 screeners, one per candidate (`scripts/workflows/sweep-2-screen.js`) — the 22.9 design
  had put all 27 screeners on Fable, which is where that quota died.

## Probe log

| When (UTC) | Result |
|---|---|
| 25.9 ~16:00 | 429 — the judge died mid-run |
| 25.9 16:05, 17:37, 19:38, 22:40, 23:40 | 429 |
| 26.9 07:42 | 429 — first probe run from `fable-faceless-youtube-judge.js` (run `wf_7b3ae66a-267`): one call, 288 ms, stopped as designed; nothing else ran |
| 26.9 15:42 | 429 (run `wf_ada0bd46-4a7`, one call, stopped as designed) — about 24 hours out now |
| next | 26.9 ~23:43, then every 8 hours while it fails |
