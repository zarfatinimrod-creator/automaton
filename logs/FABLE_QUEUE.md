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
| 1 | `fable-faceless-youtube-judge.js` | judge, red-team | `research/faceless-youtube/DIGEST.md`, `REGRADE.md` | `VERDICT.md`, `RED-TEAM.md` there | fold into `docs/REJECTED.md`; if REOPEN, the pilot workflow (task #4); update `logs/2026-09-25-faceless-youtube-reel.md` | **DONE 27.9** (run `wf_80e3a5c4-aa1`, commit `020688a`): REOPEN_AS_EXPERIMENT; red team — decision survives, 6 MAJOR amendments to the design |
| 2 | `fable-owner-docs-judgement.js` | one refuter (+ Opus editors) | `research/owner-docs-audit/APPLIED.md` §Queued (26 rows) | `JUDGEMENT.md` there; edits to 8 owner docs | regenerate `docs/OWNER_STEPS.he.pdf` (`node scripts/owner-steps-pdf.mjs`); apply any `codeChange` | **DONE 27.9** (run `wf_9e50d5ef-d16`): 26/26 CONFIRMED, 0 refuted; 25 document edits applied by Opus editors + step-6 token row; PDF regenerated. Code changes listed in `JUDGEMENT.md` follow separately |
| 3 | `fable-license-choice.js` | one decider | `research/measurements/gumroad-native-licenses.md` | `gumroad-license-decision.md` there | build the chosen option on Opus against its acceptance tests; drop the per-sale owner step | **DONE 27.9** (run `wf_0fcea9b7-c3b`, `ebe0d8d`): **Option C** — Gumroad's own key, verified once in the browser, cached, re-checked ≤7 days, never revoked on a transient failure; 18 acceptance tests. **Built 27.9 on Opus** (`619c4d7`, `298b1bc`, `41cd2ba`; report `products/il-biz-tools/docs/OPTION-C-BUILD.md`): AT-1..14, 17, 18 pass (217/217, mutation-checked, headless-browser check); AT-15/16 written, not runnable until the owner's GUMROAD_ACCESS_TOKEN exists. Six departures, all toward keeping a paying buyer's Pro on (e.g. only Gumroad's three exact "invalid key" 404s revoke) — reviewed and accepted |
| 4 | `fable-sweep-2-board.js` | one board (plays chief auditor too) | `research/colony-sweep/SCREEN-2.md`, `screen-2/*.md` (Opus screeners, 26.9), `research/measurements/algora-terms-question.md` (a committed line) | `research/colony-sweep/BOARD-2.md` | kills → `docs/REJECTED.md`; admissions → `src/revenue/portfolio.ts`; approved tests → CI jobs | **DONE 27.9** (run `wf_b0841911-064`, `9d8d72c`): 9/9 screeners upheld; 8 KILL, Metaculus TEST_FIRST; nothing admitted; Algora clause does not fire (conditions attached); oss-bounties gets a weekly supply count that decides its ₪300 |
| 5 | (Agent tool, not a script) | one decider | `research/faceless-youtube/DATASETS.md` B1-B2, `publication-gate.ts`, the CC BY 3.0 IGO legal code | `research/faceless-youtube/LICENCE-IGO-DECISION.md` | apply the code change to `ALLOWED_DATA_LICENCES` if ADD | **DONE 27.9**: ADD_WITH_CONDITIONS (C1-C5, enforced in G1/G7); UNESCO UIS stays FAIL as ShareAlike; B2 upheld with the MIT reason corrected. Applied on Opus the same day |
| 6 | (Agent tool, not a script) | one decider | RED-TEAM §2.4, `youtube-analytics.ts`, `youtube-altered-synthetic-disclosure.txt`, `upload-post-ai-content-labeling.txt` | `research/faceless-youtube/PREREG-DECISIONS.md` | set `PINNED_VIEW_METRIC`; set the synthetic-media value where the ruling says | **DONE 27.9**: K0 reads `engagedViews`, the 35 stays, all-zero engaged beside real plays = instrument fault; `containsSyntheticMedia = true`, a fixed disclosure sentence, Kokoro the only engine (a real-person voice is never made). Applied on Opus the same day |
| 7 | (Agent tool, not a script) | one decider | `research/measurements/brand-name-check.md`, `brand-candidates.{txt,json}` (6 free of 16) | `research/measurements/brand-name-decision.md` | rename `products/mcp-il-tools` placeholders and `portfolio.ts:216`; give the owner the name the steps promise | **DONE 27.9**: `mehudak` (Mehudak / מהודק), runner-up `tikufi`; placeholders renamed and the owner steps carry the name the same day |
| 8 | (Agent tool, not a script) | one decider | `src/revenue/types.ts:214-216` (DEFAULT_DECISION_POLICY ₪500/30 d after 45 d), `portfolio.ts:114,202` (₪200/₪150 after 90 d), `rules.ts` auditDecision | a ruling in `research/channel-loop/` | apply the governing floor in code before any line goes live (channel loop KILL-2) | queued 27.9 (channel loop) |
| 9 | (Agent tool, not a script) | one decider | `portfolio.ts:106-126,308-310` (il-biz-tools ₪400 graded contradicted; basis says ₪0 through month 12; kill at day 90) | a ruling in `research/channel-loop/` | waive the kill rule for the measurement, or plan the line at ₪0; `sync-portfolio` + `report` | queued 27.9 (channel loop) |
| 10 | (Agent tool, not a script) | one decider | `research/measurements/stripe-israel.md` (RENDERED: Israel not a Stripe account country; self-serve Connect cross-border payouts only US/UK/EEA/CA/CH), `src/revenue/rails.ts:91-97` (Algora rail `unknown`), `portfolio.ts` oss-bounties, BOARD-2 §2 Tick 3 (28.9): Polar's own Payouts list names Israel and pays through Stripe Connect Express from a US platform under a recipient agreement, without naming Global Payouts (`research/measurements/polar-rail.md`). | a ruling in `research/channel-loop/` | ALSO (tick 2, 28.9) Stripe Global Payouts DOES list Israel as a recipient country (individual and company, local bank, from a US or UK sender; `stripe-israel.md` Tick 2) — the self-serve Connect cross-border route stays closed, so whether Algora pays through Global Payouts decides the rail. ALSO week 1 of the supply count came in at 108 claimable ($74,065, `research/measurements/algora-supply.md`) against the board's expectation of under 10 — weigh supply against the rail. Whether oss-bounties' payout rail is closed, retargeted or kept pending the Global Payouts recipient page; what step 4 becomes; `sync-portfolio` + `report` | queued 27.9 (channel loop tick 1) |
| 11 | (Agent tool, not a script) | one decider | `research/faceless-youtube/RED-TEAM.md` §2.1(c) and §2.5, `T1-PROTOCOL.md`, `PREREG-DECISIONS.md`, `products/chart-explainer/page.py` counter (anonymous `$pageview`, no referrer) | the web-arm reach floor pre-registered in `research/faceless-youtube/PREREG-DECISIONS.md` BEFORE any deploy: the day-56 stranger page-view number under which Stage A is never asked, how our own and bot views are excluded, and whether a `*.netlify.app` sub-brand host changes it | the loop deploys the T1 page only after this row is done | queued 28.9 (channel loop tick 3) |
| 12 | (Agent tool, not a script) | one board | `research/breadth/BREADTH-SWEEP.md` (Opus sweep of 12 venue families for the owner's 28.9 directive, MISSION.md "הרבה מקומות, הרבה מכירות"), `logs/CHANNEL_LOOP.md` §2-§6, `research/channel-loop/FORECAST.md` | a ruling in `research/breadth/BOARD.md`: which engines are admitted to the channel loop's queue and in what order, the ordered owner steps that unlock them (none may cost money or need a camera), and whether the built-but-unlaunched cap changes for listing packs | fold the admitted engines into `logs/CHANNEL_LOOP.md` §4 and the owner-ask batch §6; re-render `docs/OWNER_STEPS.he.md` only for steps the board admits | queued 28.9 (owner directive) |

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
| 26.9 23:43 | 429 (run `wf_071169cc-d06`, one call) — ~32 hours out |
| 27.9 07:44 | **OK — Fable answered** (probe 3.7 s). Items 1-4 all ran, 07:44-09:45 UTC. **The queue is empty.** |
