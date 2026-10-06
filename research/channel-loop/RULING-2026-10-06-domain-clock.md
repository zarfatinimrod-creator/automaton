# RULING 2026-10-06 — the domain clock

Fable sitting, `logs/FABLE_QUEUE.md` row 22 (queued 30.9, tick 28). One decider. Read-only apart from this file.

## Question

Verbatim from row 22: "The day-21 instrument deadline also runs from the domain deploy day: with no week written by domain
day 21 and weeks 1-3 read on day 25, the gates return `instrument_fault` for the domain period and tell the board to
restart the clock. Is the domain deploy a new instrument that must pass M-instrument again (the deadline applies), or
only a new clock under PUBLISH-10 (it should not)? Ruling (c) said wording only, so the behaviour was left as it is."

Readings on the table: **(A)** a new instrument, the deadline rightly applies to the domain period; **(B)** a new clock
only, the deadline must not run from the domain deploy day and the `instrument_fault` there is a bug; **(C)** a third
reading — the deadline applies but is measured from the first readable week or from when the domain day was recorded,
or the domain period inherits the netlify period's instrument pass.

## Sources read

- `MISSION.md:151-153` (constraint 5: killing as automatic as building), `:447-452` (rule 3: decisions in code so an
  auditor recomputes them), `:461-464` (rule 5: lines judged on their stated terms).
- `logs/2026-09-30-page-views-reader-down.md:68-77` (§5, the fixer's reproduction and the two options offered). The row
  cites a §9; the log ends at §8, and the reproduction is §5 (validation in §6, `:80-98`).
- `src/revenue/page-views.ts` in full: `:30-33` (the anchor moves to the domain deploy day), `:36-40` (M-instrument),
  `:47-56` (the domain kill, `reader_down`), `:287-288` (`instrumentByDay`), `:303-308` (`PageViewClock`), `:318-322`
  (verdict comments), `:347-348` (`instrumented`), `:396-397` (`period`, `anchorDay = domainDeployDay ?? d0`),
  `:413-415` (the deadline from the current anchor), `:429-438` (`uninstrumented` / `instrument_fault`), `:440-450`
  (the domain branch).
- `src/__tests__/revenue/page-views.test.ts:185-190`, `:214-233`, `:313-318`, `:335-343`, `:364-404` (the domain block).
- `src/__tests__/revenue/page-views-reader.test.ts:466-486`, `:503-512`; `src/revenue/page-views-reader.ts:15-16`,
  `:29-31`, `:143-180` (the clock file: a day needs its evidence; a domain day before D0 is refused), `:186-213` (rows are
  keyed by host, anchor and week), `:323`, `:393`; `src/revenue/runner.ts:360-362`, `:369-378`, `:653`.
- `state/colony/page-view-clock.json:2` (the `_comment`: a restart is "write the new d0"; `domainDeployDay` is set "in
  the same commit that moves siteUrl to the domain, since the reader counts the host of siteUrl").
- `research/channel-loop/RULING-2026-09-30-documents.md:219-231` ((c) call 1), `:233-236` (call 2), `:247`, `:268`
  (REOPEN: "the clock restarts there by PUBLISH-10, nothing else to rule"), `:372-375` (fold 8).
- `research/channel-loop/RULING-2026-09-28-floors.md:218-228` (row 9 item 3: "the measurement (D0 = that deploy day;
  instrument = the site's cookieless posthog-js snippet …)", M-instrument "by D0+21", M-reach), `:232-233` (item 4:
  "PUBLISH-10 stands: the domain-period clocks (₪-floor after 90 days live; under 100 views/week for 8 weeks → kill)
  start at the domain deploy"), `:240-241`, `:247-248`.
- `research/channel-loop/BOARD-LOOP.md:63` (PUBLISH-10), `:64` (KILL-1), `:65` (KILL-2), `:99`, `:113`, `:117` (rank 5:
  "its clock starts at that deploy, and a later 301 to the domain does not restart it").
- `research/channel-loop/SITTING-2026-09-30-BRIEF.md:535-550`; `research/faceless-youtube/PREREG-DECISIONS.md:447-449`,
  `:520-521` ("an instrument that does not depend on the host"); `products/il-biz-tools/README.md:372-381`, `:408-411`;
  `src/revenue/portfolio.ts:77-79`, `:239`; `src/revenue/experiments.ts:232`; `logs/CHANNEL_LOOP.md:64`, `:405`;
  `logs/2026-09-30-channel-loop-tick-28.md:17`; `logs/2026-09-29-pageview-kpi-reader-fixes.md:57-72`.
- `docs/CHAIN_OF_COMMAND.md` and `docs/INCOME_PLAN.he.md`: a grep for M-instrument, PUBLISH-10 and "instrument" finds
  nothing; neither defines either term, so neither was read further.
- A scratch `tsx` script (not committed) ran `evaluatePageViewGates` on the row's scenario with the test file's clock
  (D0 2026-10-05, domain 2027-01-04). Results: domain day 5, nothing written → `uninstrumented`; day 10, week 1 overdue
  since day 8¼ → still `uninstrumented` ("no gate is read"); day 21 → `instrument_fault`, "restart the clock (a new d0
  with its evidence)"; day 25, weeks 1-3 written that day → `instrument_fault`; **day 60, weeks 1-8 all under 100 (1-3
  written on day 25, 4-8 on time) → `instrument_fault`, not `kill`**. The same shape under D0 → `instrument_fault`, as
  the rule intends there.

## Ruling

**(B).** The domain deploy is a new clock under PUBLISH-10, not a new instrument. M-instrument is a gate of the
netlify.app measurement and runs from D0 only; no day-21 deadline runs from the domain deploy day, so `uninstrumented`
and `instrument_fault` are never returned for the domain period. An unwritten domain week is `reader_down` once overdue
(from domain day 8¼), a blocker that clears when the reader reads it, and a measured 8-week kill is returned as `kill`
whatever day its weeks were written. The current `instrument_fault` for the row's scenario is a bug, and the fold below
is a behaviour change — ruling (c) call 1 left behaviour alone because the question was outside fold 8, not because it
had been decided.

1. **The rules place M-instrument in the netlify period and nowhere else.** Floors row 9 item 3 defines "the
   measurement" with D0 = the netlify.app deploy day and the instrument = the site's snippet, and puts M-instrument inside
   it, "by D0+21" (`RULING-2026-09-28-floors.md:218-222`). Item 4 then names the domain-period clocks exhaustively — the
   ₪-floor and the 8-week kill (`:232-233`) — and M-instrument is not among them. PUBLISH-10 starts "kill clocks" at the
   domain deploy and calls the netlify.app deploy a measurement surface (`BOARD-LOOP.md:63`). `portfolio.ts:79` says
   "M-instrument by D0+21". Running the deadline from `anchorDay = domainDeployDay ?? d0` (`page-views.ts:397`, `:413`) is
   the code's generalisation, not a rule anyone wrote; ruling (c) confirmed the day-21 boundary on D0-anchored weeks
   (`RULING-2026-09-30-documents.md:233-236`) and said nothing about a second deadline.
2. **The board has already ruled that a host move is not a new instrument, for this very instrument.** PUBLISH-10's own
   reason for T1's clock is that "its instrument (PostHog) does not depend on the host" (`BOARD-LOOP.md:63`; PREREG
   `:520-521`), and rank 5 adds "a later 301 to the domain does not restart it" (`:117`). The domain deploy as designed is
   the same build, the same project token and the same snippet; what changes is the counted host, set in the same commit
   as `domainDeployDay` (`page-view-clock.json:2`). A hostname is a clock parameter. The instrument is "the counter on the
   site and PostHog's store" (`RULING-2026-09-30-documents.md:222-223`), and neither changes.
3. **The deadline's job has no object in the domain period.** M-instrument protects a dated read: without two writes by
   day 21, the D0+56 read over weeks 1-8 would come due unmeasurable, and "a clock without an instrument is a fault, not a
   pass" (`README.md:408-411`; KILL-1's "an unmeasured gate that is due counts as failed", `experiments.ts:232`). The
   domain period has no dated read. Its only page-view gate is a rolling kill over 8 consecutive *measured* weeks
   (`page-views.ts:440-447`), which an unwritten week can never satisfy, and `reader_down` already names every unwritten
   week from day 8¼ (`:49-52`, `:448`). Nothing is left for a deadline to catch.
4. **As it stands, a reader outage becomes a clock restart — exactly what (c) call 1 forbade.** The fixer saw it
   (`reader-down.md:68-70`: "a reader fault postpones the eight-week kill"), and the scratch run shows the worst case:
   weeks 1-8 measured under 100, the line's pre-registered kill (`portfolio.ts:239`), returned as `instrument_fault`
   with "restart the clock". That is softer than the criterion, which KILL-2 forbids (`BOARD-LOOP.md:65`), and it is a kill
   that is not automatic (`MISSION.md:151-153`). Before day 21 the same outage reads `uninstrumented` — "no gate is read" —
   so the runner lists no blocker for it (`runner.ts:376-378`), and the outage is hidden for two weeks before it turns
   into a restart.
5. **The remedy the verdict prescribes cannot be carried out in the domain period.** "Restart the clock (a new d0 with
   its evidence)" (`page-views.ts:436`; `page-view-clock.json:2`) does nothing once `domainDeployDay` is set, because the
   anchor is `domainDeployDay ?? d0` (`:397`). The only way to clear the fault would be to re-date `domainDeployDay`, and
   the clock file refuses a day without the fact behind it (`page-views-reader.ts:166-167`): the domain deploy is the
   owner's recorded event, not a date the board may move. A gate whose instruction cannot be followed is a defect.
6. **"Instrumented" is a property of the channel, not of each clock.** CHANNEL_LOOP §2 defines it as "at least 2
   consecutive scheduled KPI writes" (`logs/CHANNEL_LOOP.md:64`). The channel proves its instrument once, on D0; a new
   hostname does not un-prove it. Where the netlify period never passed (no key ever pasted), the domain period under this
   ruling says the true thing from day 8¼ — the reader is down, fix the reader — beside the runner's "not configured
   while a clock runs" blocker (`runner.ts:369-373`). Nothing to restart.

**Why not (A).** Its one real worry — the counter may not fire on the new host — is not something M-instrument detects:
two writes of zero pass it (`page-views.test.ts:219`, `weeks(0, 0)` at day 21 → `measuring`). (A) would keep a gate that
cannot catch the risk it is invoked for, at the cost of reasons 4 and 5. **Why not (C).** A deadline measured from the
first readable week, or from the day the domain day was recorded, still ends in a restart that cannot be executed
(reason 5) and still lets a reader fault void measured weeks; and the recording day is not in the clock file. Inheriting
the netlify pass is right in spirit but needs D0-anchored rows on another host inside the domain evaluation, for no
outcome the kill-plus-`reader_down` pair does not already give. The fold reaches the inheritance by not re-testing.

**What would make me wrong.** A domain deploy that changes the instrument — a new PostHog project or token, a different
snippet, or the counter off on the new host. That is a new instrument, and the loop must record it as one in the clock
file's evidence and bring the question back; this ruling covers the deploy as designed (same build, same token, new
canonical host, `page-view-clock.json:2`). Or a ruling I did not find that starts "the measurement", not "the kill
clocks", at the domain deploy: the grep over `research/channel-loop/`, `docs/` and `logs/` for PUBLISH-10 and
M-instrument found none.

## Folds

Behaviour change, one builder (Opus), one worktree. `git log --oneline -1` and `ls products/ src/revenue/` first
(CLAUDE.md, agent worktrees). No edit to `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` or `logs/FABLE_QUEUE.md` by the
builder; the main thread marks row 22 done with `scripts/loop-edit.mjs`.

1. **`src/revenue/page-views.ts`, `evaluatePageViewGates` (`:389-484`).**
   - Replace `:413-415` so the deadline test is netlify-only: keep `deadlineMs` and `writtenByDeadline`; set
     `instrumented` to `hasConsecutiveWrites(writtenByDeadline, g.instrumentedWrites)` when `period === "netlify"` and
     to `hasConsecutiveWrites(sorted.map((w) => w.week), g.instrumentedWrites)` when `period === "domain"` (two
     consecutive writes under the domain anchor, no deadline).
   - Move the `if (period === "domain") { … }` block (`:440-450`) above the `if (!instrumented) { … }` block
     (`:429-438`), so `uninstrumented` and `instrument_fault` are returned only in the netlify period. The domain order
     stays: measured kill → overdue `reader_down` → `continue`. Append to the `continue` note (`:449`) how many weeks are
     measured, e.g. `; ${sorted.length} week(s) measured`, so a `continue` with no rows reads honestly.
   - Verdict strings unchanged: `PAGE_VIEW_VERDICTS` (`:315-329`) keeps its eleven members and order
     (`page-views.test.ts:335` stays as is). The netlify-period `instrument_fault` note (`:435-436`) is unchanged.
   - Wording: header `:36-40` gains "A netlify-period gate: it runs from D0 only. The domain deploy is a new clock, not a
     new instrument (PUBLISH-10; RULING-2026-10-06-domain-clock): no deadline runs from the domain deploy day, and an
     unwritten domain week is `reader_down` once overdue, never `instrument_fault`." `instrumentByDay` (`:287`),
     `uninstrumented` and `instrument_fault` (`:318-321`) are marked "netlify period only"; `instrumented` (`:347`) reads
     "netlify period: two consecutive weekly writes made by the M-instrument deadline (or, before it, so far); domain
     period: two consecutive weekly writes under the domain anchor, no deadline".
2. **`src/__tests__/revenue/page-views.test.ts`, inside the domain `describe` (`:364-404`).** Existing domain cases stay
   unchanged (their rows are written on time). Add:
   - "M-instrument runs from D0 only: the domain deploy is a new clock, not a new instrument": `[]` at `atDomain(5)` →
     `continue`, `instrumented` false, notes not matching `/M-instrument|instrument fault|restart the clock/`; `[]` at
     `atDomain(10)` → `reader_down` with `/week\(s\) 1 still have no reading/` (a blocker from day 8¼, not
     `uninstrumented`); `[]` at `atDomain(21)` → `reader_down` with `/week\(s\) 1, 2 /` and no `/restart the clock/`;
     weeks 1-3 written at `new Date(DOMAIN_MS + 25 * DAY_MS).toISOString()`, read at `atDomain(25)` → `continue`,
     `instrumented` true, no `/instrument fault|restart the clock/`.
   - "a reader that starts late cannot hide a measured kill": weeks 1-3 written on domain day 25 and 4-8 on time, all
     under 100, at `atDomain(60)` → `kill`, `notes[0]` matching `/weeks 1-8 after the domain deploy each under 100/`.
   - The netlify-period tests `:214-233` and `:313-318` stay exactly as they are: they are the rule in its own period.
   - The README assertion `:343` must still match after fold 4.
3. **`src/__tests__/revenue/page-views-reader.test.ts`** (one case, recommended): a clock file with `d0`, `d0Evidence`,
   `domainDeployDay`, `domainEvidence` and no `POSTHOG_READ_KEY`, ticked at domain day 21 → the line's verdict is
   `reader_down`, `result.blockers` matches `/page views il-biz-tools: reader down/` and not `/instrument fault/`.
   `:466-471` (D0 only) stays unchanged.
4. **Documentation, same commit.** `products/il-biz-tools/README.md:373-374`: after "(fixed, clock restarted, never a
   fail - a week read late does not undo it)" add "- a netlify-period gate: the domain deploy starts the kill clock, not a
   new instrument, so no day-21 deadline runs from the domain deploy day (`RULING-2026-10-06-domain-clock.md`)"; keep the
   sentence `page-views.test.ts:343` asserts byte for byte. `src/revenue/page-views-reader.ts:29-31`: add "(netlify period
   only; the domain clock has no instrument deadline)". `state/colony/page-view-clock.json` `_comment`: add "The domain
   deploy is a new clock, not a new instrument: no M-instrument deadline runs from domainDeployDay, and it is never
   re-dated (RULING-2026-10-06-domain-clock)." `runner.ts` and `portfolio.ts:79` need no change.
5. **Mutations** (`src/__tests__/revenue/mutations/README.md`; no `page-views.json` exists yet — create it, `find`
   strings copied from the committed file, `node scripts/mutate.mjs --check --plan …` before running): M1 — compute
   `instrumented` with the deadline in both periods (fold 2's late-start kill test must fail); M2 — move the domain
   block back below the `!instrumented` block (same test fails); M3 — drop the `overdue.length` check in the domain branch
   (fold 2's day-10 and day-21 cases fail). Run on the two page-view test files only, through `scripts/sim-tree.sh` if
   the checkout's lock is in use.
6. **Verification before "done":** `scripts/verify.sh src/__tests__/revenue/page-views.test.ts
   src/__tests__/revenue/page-views-reader.test.ts src/__tests__/revenue/runner.test.ts` (exit code, never a grep), then
   the product's `npx vitest run tests/option-c-site.test.js` (it reads the README). Log in
   `logs/2026-10-06-<slug>.md`.

## Not decided

1. **The host switch as an instrument risk.** The domain deploy moves the counted host (`siteUrl`). If the counter does
   not fire there, eight weeks of measured zeros are a `kill` no gate distinguishes from no readers — and M-instrument
   never guarded this either (zeros pass). Today's safeguard is the clock file's own rule, "only with the counter live on
   the deployed site" (`page-view-clock.json:2`), applied by the loop at the domain deploy. Whether page views need a
   zero-detection guard like T1's (`PREREG-DECISIONS.md:447-449`) is for a later sitting, not this one.
2. **A standing netlify-period fault at the domain deploy.** Under this ruling it is replaced by `reader_down` and the
   "not configured while a clock runs" blocker (`runner.ts:369-373`), which say the operative thing. Whether the report
   should also carry the netlify period's unresolved fault as a line of its own is left to the board.
3. **The T1 web arm.** Rank 5 already says a 301 to the domain does not restart its clock (`BOARD-LOOP.md:117`); whether
   `src/revenue/experiments.ts` follows that was not checked here.
4. **The word for a domain clock with fewer than two writes and nothing overdue.** This ruling returns `continue` with
   the measured count in its note rather than widening the verdict union; if the board wants a distinct word, that is a
   wording call for a later sitting.
