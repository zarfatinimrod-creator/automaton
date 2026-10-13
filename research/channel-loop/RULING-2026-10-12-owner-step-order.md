# Ruling — which order of the owner steps binds: the code's `order` is the one checklist's sort key and stands unchanged; what diverged was a gate, so step 3 is held until a paid product is ready (the day-56 page-view PASS, with step 2); step 6's early part follows step 8 and precedes step 7 through `earlyPart`, not `order`, 12.10.2026 — `logs/FABLE_QUEUE.md` row 29

**Sitting.** 12.10.2026 ~07:11 UTC (this file begun ~07:20), the seat moved from 10.10 on 11.10: the account's weekly limit
held the session from 8.10 to 11.10 06:00 UTC. Beside row 28, which a second decider rules in parallel; this file does not
touch its subject. One decider: the deciding model of the sitting. No subagents, no web fetch, no connector, no `gh`, no git
command that writes and no `git stash` of any form, no edit outside this file; the main thread folds on Opus. The owner is
"the owner", they/them. No name, login, address or token appears here. `npx tsx scripts/owner-report.ts` was run once
(read-only by its own contract, `scripts/owner-report.ts:12-14`); `git status --short` was empty before and after.

**Tree.** `bf702b3` on `claude/new-session-j071dx` (`git log --oneline -1` at the start, read-only; tick 72's commit). The
brief was assembled on `6229781` and drift-noted at `677077a` (tick 70) and `fe82745` (tick 71);
`node scripts/brief-drift.mjs research/channel-loop/SITTING-2026-10-10-BRIEF.md --tree 6229781` was run at HEAD (read-only),
and every pointer this file rests on was re-opened at `bf702b3` with `sed -n`, `grep -n -F`/`-E`, `cat -n` or `git show`/
`git log` (read-only) and is cited at the line seen there; the scanner's "last path named" attributions were checked
against the sentence, as its note asks. GitHub Actions has been disabled on this repository since about 8.10 22:03 UTC
(`logs/CHANNEL_LOOP.md:26`, `:211`; who disabled it is not known): no colony tick has run since, so `state/colony/REPORT.md`
(generated 2026-10-08T07:15:05Z, `:3`) and `state/colony/dashboard.html` print the pre-ruling state and will until a tick
runs; the folds are verified locally (`scripts/verify.sh`), as the 11.10 rulings' were. It bears on nothing else here and is
not assumed permanent.

**Read.** `MISSION.md` in full (493 lines); `research/channel-loop/SITTING-2026-10-10-BRIEF.md:1-124` (the title, the
pointer-drift note with its tick-71 line, the header to Part A), `:125-503` (Part A in full), `:504-666` (Part C);
`logs/FABLE_QUEUE.md:1-20` and `:53` (row 29, word by word); `logs/CHANNEL_LOOP.md:19-28` (§0), `:58` (protocol step 10),
`:105-116` (§2), `:135-136` (§3's il-biz-tools and pcn874 rows), `:202-282` (§6 in full), `:410`, `:506`;
`logs/CHECKPOINT.md:13`, `:47`; `docs/OWNER_STEPS.he.md:1-80` (the dated paragraphs, the ₪0 box, the code-order
paragraph), `:193-232` (step 3), `:359-436` (step 6: its head, the ₪0 split, parts ב, ג and ד), `:556-566`, `:567-590`,
`:610-623`; `src/revenue/owner-steps.ts` in full (761 lines); `src/__tests__/revenue/owner-steps.test.ts:40-115`,
`:440-500`, `:515-585`, `:1514-1575` and its pins by grep; `src/__tests__/revenue/runner.test.ts:240-250`, `:300-310`,
`:525-535`; `src/__tests__/revenue/owner-report.test.ts:410-414`, `:496`, `:575`, `:593`;
`src/__tests__/revenue/mutations/README.md:12`, `:15`, `:18-19`, `:78-79`, `mutations/owner-steps.json:1-40`;
`src/revenue/owner-report.ts:19-28`, `:280-345`, `:488-560`, `:624`; `scripts/owner-report.ts` in full and its output
at HEAD; `src/revenue/runner.ts:465-480`, `:681-700`, `:795-845`, `:880-897`; `src/revenue/dashboard.ts:25`, `:79-84`,
`:139`; `src/revenue/portfolio.ts:225-300`, `:345`, `:386-396`; `src/revenue/page-views.ts:70-100`, `:402-428`;
`state/colony/REPORT.md:1-12`, `:60-110`; `state/colony/page-view-clock.json`; `products/il-biz-tools/src/config/site.json:1-12`;
`.github/workflows/gumroad-pro-product.yml:20-40`, `:108-118`; `research/channel-loop/RULING-2026-09-29-loop.md:60-110`,
`:495-530`; `research/channel-loop/RULING-2026-09-28-floors.md:200-235`; `research/channel-loop/RULING-2026-09-30-documents.md:240-248`,
`:272-278`, `:295-303`, `:396-400`; `research/channel-loop/RULING-2026-10-07-posthog-organisation.md:1-40`, `:751-832`
(the house form); `research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md:1-30` and its headings;
`research/breadth/BOARD.md:86-92`, `:134-190`, `:356-366`, `:435`; `research/colony-sweep/BOARD.md:194-212`;
`research/channel-loop/BOARD-LOOP.md:36-40`, `:62`, `:73-77`, `:195-207`; `logs/2026-10-07-owner-status-report.md:88-116`;
`logs/2026-10-11-channel-loop-tick-69-owner-path.md` (its order lines); `logs/2026-10-11-owner-can-you-earn-now.md:27-28`;
`research/measurements/step2-cost.md:1-12`, `:38-42`; `docs/INCOME_PLAN.he.md:302-316`; `scripts/loop-edit.mjs:1-60`.

**Grades.** `repo`: our own code, documents, rulings and notes, read at HEAD. `repo (git objects)`: a past version from the
local object store, as the brief cites it; none is re-opened here. `inference`: reasoning, always marked. `none`: no source.
There is no `rendered`, `github` or live grade in this ruling: nothing outside the repository was read, and no capture is
cited by line.

**Standing rules applied.** MISSION first (`CLAUDE.md:4`). Rule 1: the owner's involvement is minimised and is not zero;
"Batch every unavoidable step into **one ordered checklist**" encoded as data in `src/revenue/owner-steps.ts`
(`MISSION.md:435`); "Never invent a step that isn't required" (`:436`); never open an account, answer an identity check or
mark setup done on our own initiative (`:437-438`); the owner does not talk to customers (`:440`). Rule 3: decisions live
in code "precisely so any auditor can recompute them from the same numbers and catch drift" (`:450-451`). The ₪0 rule of
27.9: "Nothing is bought" (`:354`); "No step that costs the owner anything is asked for until its cost is checked … Step 2
… is asked only when a paid product is ready" (`:356-357`); "Platform fees that come out of a sale are not the owner
paying … A line that needs the owner to pay first waits" (`:359-360`); 28.9: "platform fees taken out of a sale are
allowed; nothing is paid up front" (`:386-387`). Constraint 7: "a line may not be built before its acquisition channel is
named, and the first thing built on any line is the cheapest test that a stranger can find it. Not the product."
(`:188-190`), and "Platform search ranks on prior success, so it cannot deliver the first customer" — Gumroad's Discover
"cannot source a first sale, ever" (`:194-202`). The standing consent "does not reach the owner's own clicks: identity,
payout, and anything bought" (`:349-350`). The brand is the only public face (`:276-279`, `:310-312`). Owner steps are
named "once per summary, without nagging" (`:401-403`); the loop may change "order and information, not tone or frequency"
(loop ruling `:88`). The checklist's own rule: EIGHT steps, a new one "needs a decision, not a commit"
(`owner-steps.ts:18-21`). The loop's protocol: "Rebuild §6 from the channel table. Only list steps that a channel is
actually blocked on." (`CHANNEL_LOOP.md:58`).

**Short names** as the brief's (`SITTING-2026-10-10-BRIEF.md:60-75`): "the code's order" is `order` as set,
1 → 8 → 2 → 3 → 5 → 7 → 4 → 6; "the ₪0 sequence" is the free-steps-first order of §6 (`CHANNEL_LOOP.md:206-256`), the
box (`OWNER_STEPS.he.md:34-71`) and the status report (`logs/2026-10-07-owner-status-report.md:92-97`, `:111`); "asked
now" is `isOwnerStepOpen` true (`owner-steps.ts:614-616`); "held" is a `precondition` without `metOn`; "frozen" is `frozen`
set; "the early part" is step 6's `earlyPart` (`:497-502`); part ג is the Apify Publish click with Apify's identity
verification (`OWNER_STEPS.he.md:398-410`); part ד is the two PostHog organisations (`:411-436`); "the floors ruling" is
`RULING-2026-09-28-floors.md` (row 9 at `:202-233`); "ruling 7.10" is `RULING-2026-10-07-posthog-organisation.md`.

---

## 1. A(1) Which order binds? The code's — `owner-steps.ts` is the one ordered checklist, `order` its sort key, and the gates what is asked; §6 and the box are presentations of it and may not disagree with it; `order` is not re-sequenced

**RULING.** The checklist that binds is `src/revenue/owner-steps.ts`: its `order` field is the execution order of the
eight steps, and it stands as the boards set it, **1 → 8 → 2 → 3 → 5 → 7 → 4 → 6** (`owner-steps.ts:235-239`; the values
`:309`, `:330`, `:346`, `:372`, `:389`, `:416`, `:434`, `:463`). What the owner is asked now is not the order but the gates'
output — `isOwnerStepOpen`: not done, not frozen, not held (`:613-616`) — printed in `order` (`ownerStepsInOrder`,
`:584-587`; `openOwnerStepsForLine`, `:618-621`). The ₪0 sequence of §6, the box and the status report is a presentation
of what those gates leave asked now, and from this ruling on it is derived from the code and may not state a different
set or a different relative order of the steps it names. Where the two disagreed, the disagreement was in a gate (step 3
asked now in code and "later" in the texts) and in one permission (the early part's `afterStep`), not in `order`; §2 and
§3 change those, and nothing re-sequences the eight. The owner-facing sentence that the code's order "awaits the board"
(`OWNER_STEPS.he.md:64-68`; `owner-steps.ts:57-59`; the test's title at `owner-steps.test.ts:473`) is cleared: the board
has ruled, and the sentence is replaced by what it ruled (Folds 1, 2, 3).

**BASIS.**
1. *One checklist, in code.* MISSION requires "one ordered checklist" and names where it lives: "encoded as data in
   `src/revenue/owner-steps.ts`" (`MISSION.md:435`); rule 3 puts decisions in code so an auditor can recompute them
   (`:450-451`). Two orders of the same eight steps visible to the owner — the hourly REPORT's "8, 3, 6" for il-biz-tools
   (`state/colony/REPORT.md:91`) beside the status report's "Gumroad, step 3 … later" (`logs/2026-10-07-owner-status-report.md:111`)
   — is the drift that rule names, and the one thing the mandate does not permit the checklist to do. The code itself says
   "Re-sequencing is the board's call; until it re-rules, the ₪0 sequence lives in the document as text and says that it
   awaits the board" (`owner-steps.ts:57-59`); the document says the same of itself ("ההמלצה שלי … ממתין לפסיקה",
   `OWNER_STEPS.he.md:64-66`). This sitting is that board. [repo]
2. *`order` sorts; the gates choose — so the thing to rule on first is the gate.* `order` is read only by
   `ownerStepsInOrder` and the per-line lists that sort by it (`owner-steps.ts:584-587`, `:593-596`, `:618-636`;
   `runner.ts:473`, `:691`, `:804-807`, `:830`, `:888-896`; `owner-report.ts:325`, `:495`). The dashboard never reads it:
   `dashboard.ts:25` imports `openSetupItems` only, lists each line's items in stored order (`:79-84`) and drops every
   "waiting on the owner" blocker (`:139`) — the row's, `CHANNEL_LOOP.md:410`'s and the checkpoint's claim that `order`
   drives the dashboard is corrected here (the brief's Part C, correction 3). The four steps asked now today, 8, 3, 7 and
   6, and the "63-73 minutes" (the owner report at HEAD; tick-64 log `:12`, `:24`) come from the gates, not from `order`:
   steps 1 (done, `:320-324`), 5 (frozen, `:402-411`), 2 and 4 (held, `:357-364`, `:447-456`) are the ones not asked, and
   nothing in `order` decides that. So a new `order` alone would leave step 3 asked now, and a gate on step 3 alone leaves
   `order` as it is — the brief's reading (`SITTING-2026-10-10-BRIEF.md:109-112`), confirmed in the code. [repo]
3. *The ₪0 rule asks nothing of the order.* Its demands are cost-shaped: nothing bought (step 5 frozen, `:354`), nothing
   that costs asked before its cost is checked (step 2 held, `:356-357`), and fees out of a sale are not the owner paying
   (`:359-360`, `:386-387`). Every one of them is met by a gate (`frozen`, `precondition`), and none of them says
   "step 3 before step 2" or "step 7 before step 2", which is what a re-sequencing would have to rest on. The box's order
   among its held tail (3, then 2; `OWNER_STEPS.he.md:57-59`) has no ruling behind it: the 27.9 session wrote it as its
   own recommendation (`:64`; the brief's history, `SITTING-2026-10-10-BRIEF.md:345-348`), and the only design text that
   foresaw step 3 before step 2 treats it as a case to handle, not an order to ask ("if the owner completes step 3 …
   before confirming step 2, paid activation … is held and the owner is told why", `BOARD-LOOP.md:75`). [repo]
4. *Two boards set `order` with reasons that still hold.* 7.9: the organisation before Algora, because a bounty pull
   request is a published byline (`research/colony-sweep/BOARD.md:208-210`; `owner-steps.ts:31-38`); step 6 last, because it
   collects tokens that steps 3 and 7 make — enforced today by `secretRowsPastedBeforeMade` (`:694-717`) and the test's
   `[]` at `owner-steps.test.ts:319`. 28.9: step 8 second, straight after merge-pr (`research/breadth/BOARD.md:435`;
   `owner-steps.ts:78-83`). The 7.9 reason for step 5 before step 7 ("buy the name before creating the org", `BOARD.md:209`)
   is moot while step 5 is frozen and harmless as a sort position: a frozen step is never asked (`:624-631`). Nothing in
   the record refutes any of these, and a re-sequencing would move the Hebrew arrow line the test parses
   (`OWNER_STEPS.he.md:73`; `owner-steps.test.ts:484-492`) and every pin for no change in what is asked (item 2). [repo;
   the "no change in what is asked" is arithmetic over `isOwnerStepOpen`, inference]
5. *The texts that put the free steps first were right about the ask and silent about `order`.* The loop ruling's (b) moved
   step 8 to "first in the free batch" and ordered "§6 reorder" (`RULING-2026-09-29-loop.md:68-69`, `:499`, `:515`); the
   code recorded it as "text only — no step added, removed, renumbered or reordered in code" (`owner-steps.ts:89-91`), and
   the row's gloss "no re-sequencing of the code" is the code's words, not the ruling's (the brief's correction 1). Ruling
   7.10 said of the batched list that "what binds is the gate, not the list's order" (`RULING-2026-10-07-posthog-organisation.md:198`)
   and kept "numbers and order … unchanged" (`:229`). Every ruling since 29.9 has carried "no step added, removed,
   renumbered or reordered" (`owner-steps.ts:90-91`, `:104`, `:116`, `:132-133`). This ruling keeps that sentence true for
   `order` and changes the gates, which is where every one of those rulings put the binding thing. [repo]
6. *What §6 is.* The protocol rebuilds §6 each tick from the channel table and lists only steps a channel is blocked on
   (`CHANNEL_LOOP.md:58`; `BOARD-LOOP.md:38`: "if it changed, the report's per-line open-steps text follows"). It is a
   batch of asks — it carries items that are not steps at all (the Actions check, `:211`; the network setting, `:232`) —
   not a second order of the eight. The box is the owner's reading copy of the same batch. Both are presentations; the
   code is the record. [repo]

**What this means for the two texts.** §6's free list (items 0-5, `CHANNEL_LOOP.md:211-240`) is unchanged in order;
its "Only when a paid product is ready" tail (`:242-256`) gains the definition in §2 and loses nothing. The box's items 1-4
(`OWNER_STEPS.he.md:47-56`) are unchanged in order; its items 5 and 6 (`:57-59`) become one held item in the code's order,
2 then 3, asked together at the gate of §2 (Fold 3); its order bullet (`:64-68`) states the ruling instead of awaiting
it. The Hebrew arrow line `:73` keeps the code's order, which the test keeps parsing (`owner-steps.test.ts:484-492`).

---

## 2. A(2) `order` does not change to the ₪0 sequence; step 3's asked-now gate does become "a paid product is ready", like step 2's — defined, for the lines step 3 unlocks, as the day-56 page-view PASS (or the day-112 PASS after the one extension), the floors ruling's own gate; "6b" is step 6's Gumroad-token row, named "not asked yet" while step 3 is not done

**RULING.**
1. **`order` stays 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6** (§1).
2. **Step 3 (`gumroad`) gains a `precondition`** and is HELD, exactly in step 2's shape (`owner-steps.ts:357-364`; the
   type `:277-287`): asked only when **a paid product is ready**, which for the two lines step 3 unlocks (il-biz-tools and
   pcn874, `:381`) **is the day-56 page-view read's PASS** — 100 a week or more averaged over weeks 5-8 of the netlify.app
   period, or the same read at day 112 after the one extension (`PAGE_VIEW_GATES.reachDay`, `.passMinWeeklyAverage`,
   `.extensionDay`, `page-views.ts:402-428`) — for either line, with the reading attached. `metOn` is set by hand, with the
   PASS reading as evidence, in the fold that records the verdict (page-views' own rule: "A verdict is a reading for the
   board, which applies it; nothing here moves a line", `page-views.ts:75`), and setting it is what makes the hourly report
   ask for step 3 — **together with step 2**, as the floors ruling says ("the paid tier's owner steps (2, 3, 6b) join the
   ask batch as 'a paid product is ready', with the reading attached", `RULING-2026-09-28-floors.md:226-228`). No cost
   check is part of step 3's gate: the account is free to open and its fees come out of sales (`MISSION.md:359-360`;
   `owner-steps.ts:55`; `CHANNEL_LOOP.md:254`; `OWNER_STEPS.he.md:197-199`). The exact `what` and `short` are in Fold 1.
3. **"A paid product is ready" has one meaning for step 3's lines**, the PASS above: for il-biz-tools by the floors ruling
   (`:223-228`; its fold, `portfolio.ts:252`; `LINE_PAYMENT_WAITS["il-biz-tools"]`, `owner-steps.ts:555-568`); for pcn874
   by the lines ruling of 29.9 (f) as `TARGET_BASIS.pcn874` carries it — "no price before the D0+56 PASS of the validator
   page", the same D0 (`portfolio.ts:563`; `LINE_PAYMENT_WAITS.pcn874`, `owner-steps.ts:575-581`; the channel table,
   `CHANNEL_LOOP.md:136`: "none for the free page; 2, 3, 6b, 5 for the paid builder"). Step 2's `what` keeps its own text
   (its cost-check half is not reopened, "What this does not decide" 1); for these two lines its "a paid product is
   ready" is the same PASS, so the two steps are asked in one batch.
4. **"6b" means step 6's `GUMROAD_ACCESS_TOKEN` row** (`owner-steps.ts:477`, `madeIn: "gumroad"`), not the Netlify link
   (part א) and not the step-7 tokens: the Netlify link is the deploy route of the ₪0 measurement surface
   (`CHANNEL_LOOP.md:135`: "deploy route: ask 1 (network) or the Netlify click in 6b") and so cannot be paid-tier, and
   `BRAND_GITHUB_TOKEN` and `ORG_BUDGETS_READ_TOKEN` are made in step 7's sitting (`:480-489`). The 7.9 board's "6b" bundled
   all three (`BOARD.md:201`); the floors ruling counted "6b" among the paid tier's steps (`:227`); the brief found no file
   reconciling them (Part C item 10). This does.
5. **A secret row whose `madeIn` step is not done is not asked** — named in the report's "Not asked yet" line with its
   reason ("waits until step N, which makes it, is done"), never as something to do — and is asked with its step once the
   maker is done. This is the row-gate rule the code already states for `askedOnlyWhen` ("so the owner is never asked for a
   key to nothing", `owner-steps.ts:300`) applied to the one other way a key can be a key to nothing. It holds the Gumroad
   row until step 3 is done (at the PASS), and the two step-7 tokens until step 7 is done. It does **not** change when
   step 6 may be recorded done: `heldRows` keeps naming `askedOnlyWhen` rows only (`:271-275`; `owner-steps.test.ts:987-995`),
   and step 6 still cannot be recorded done before steps 3 and 7 (`secretRowsPastedBeforeMade`, `:694-717`; test
   `:319`) — so step 6 stays open as one step, its asked rows shrink to what exists, and the report says exactly which rows
   wait and on what.
6. **The setup items of step 3 and of the Gumroad row** stay on the checklists (`openSetupItems` prints a held step's items,
   `owner-steps.ts:719-733`, as it prints 4b's, `REPORT.md:100`), and their text carries the gate, as 4b's does
   (`portfolio.ts:352-353`): Fold 5.

**BASIS.**
1. *A Fable ruling already decided when step 3 is asked for il-biz-tools' paid tier, and the code lags it.* The floors
   ruling of 28.9, row 9 decision 3: under 5 stranger views in 56 days "no owner step is asked on this line's account"
   (`RULING-2026-09-28-floors.md:223-225`); at or above 100 a week over weeks 5-8 "the paid tier's owner steps (2, 3, 6b) join
   the ask batch as 'a paid product is ready'" (`:225-228`); decision 2: "the Gumroad steps for the paid tier stay
   pending" while the line is measured at ₪0 (`:215-216`). The documents ruling of 30.9 repeats it for the second
   "between": "the paid-tier steps (2, 3, 6b) are not asked on its account" (`RULING-2026-09-30-documents.md:243-245`). The
   ruling reached the code as a `killCriteria` string (`portfolio.ts:252`), as `LINE_PAYMENT_WAITS` (`owner-steps.ts:555-568`)
   and as the order-review line (`:514-523`), and never as a gate: step 3 has no `precondition` and no `frozen`
   (`:370-385`), so `isOwnerStepOpen` is true (test `:398`), and every surface that prints asked-now steps asks it today
   (`REPORT.md:91`, `:103`; the owner report at HEAD: "Step 3 (`gumroad`): 20 min — lines il-biz-tools, pcn874" under
   "4 asked now"). The row is the gap between a ruling and its gate; closing it is a fold of the 28.9 ruling as much as
   a decision of this one. [repo]
2. *Holding step 3 until the PASS costs no day of the first shekel.* A sale needs step 2 before it (the law, `MISSION.md`
   rule 1; `owner-steps.ts:349-350`; "שום מוצר בתשלום … לא עולה שם למכירה לפני צעד 2", `OWNER_STEPS.he.md:198-199`;
   `BOARD-LOOP.md:75`), and step 2 is asked only at "a paid product is ready" (`owner-steps.ts:357-364`; `MISSION.md:356-357`),
   which for these lines is the PASS (ruling 3). So the earliest first sale is bounded by step 2's completion whatever
   step 3's timing, and asking step 3 before the PASS moves nothing forward. What step 3 yields before a sale — the token
   that reads sales (`gumroad.ts`; `.github/workflows/colony.yml`) and creates the Pro draft (`gumroad-pro-product.yml:23-27`,
   `:114`) — reads nothing and sells nothing before step 2 and the brand-mail probe (`:34-38`); the only Gumroad review the
   record names comes after the first 3-4 sales, not at opening (`OWNER_STEPS.he.md:195`, unsourced at that line). The
   owner report's smallest set is unchanged by the hold: steps 8, 2, 3 and 6, 108-143 minutes, because a held step is still
   "between the line and a payment" (`owner-report.ts:303-306`; the output at HEAD). [repo; the bound is inference over
   the gates]
3. *What the hold spares is an identity check with no stranger behind it.* Step 3 is a full identity step: a colour photo of
   the ID card front and back, proof of an Israeli address, an Israeli bank account in the owner's name (`owner-steps.ts:378-380`;
   `OWNER_STEPS.he.md:206-207`). MISSION minimises exactly this ("one-time identity and payout steps are legally unavoidable",
   `:432-434`; the consent "does not reach the owner's own clicks: identity, payout", `:349-350`), and constraint 7 says the
   first thing built on a line is the stranger test, "Not the product" (`:188-190`) — the floors ruling applied that to
   il-biz-tools and planned the line at ₪0 until the read (`:206-216`). Asking the ID before the read inverts it. Today no
   D0 exists (`state/colony/page-view-clock.json:3-4`, both `d0: null`), no Gumroad product exists (`site.json:5-10`,
   empty), and pcn874 has no price (`portfolio.ts:563`): nothing is ready, by every text's own measure. [repo]
4. *Step 3's gate is not a cost gate, so it is not step 2's twin in every field.* MISSION's 27.9 gate is cost-shaped and
   names step 2 (`:356-357`); it says Gumroad's cut is "never from the owner's pocket" (`:359`). The status report told the
   owner it would ask both "only when a paid product is ready, and after I check the cost from the official source"
   (`logs/2026-10-07-owner-status-report.md:111`): the first half is this ruling; the second half belongs to step 2 alone,
   and step 3 is not made to wait on step 2's second official source (`research/measurements/step2-cost.md:3` is "MOSTLY
   SETTLED" on Bituach Leumi; no Tax Authority page is in the repository — the brief's Part C item 9). [repo]
5. *The texts the owner read already say it; the code is what disagreed.* §6 has carried step 3 under "Only when a paid
   product is ready" since `9e75aff` (27.9; `CHANNEL_LOOP.md:242`, `:254-256` today), the breadth board kept that heading
   "unchanged" (`research/breadth/BOARD.md:362`), and the status report of 7.10 said "אחר כך, לא עכשיו: Gumroad, צעד 3"
   (`:111`). The box alone listed step 3 among the free steps, with no gate and no identity named (`OWNER_STEPS.he.md:57-58`;
   table row 3 at `:616`) — the brief's correction 2; it is the one text this ruling moves to the other side. [repo]
6. *Why `metOn` by hand, with the reading.* The reader computes the verdict and writes nothing that moves a line
   (`page-views.ts:75`); the floors ruling asks for the reading to be attached to the ask (`:227-228`); step 2's `metOn`
   is set the same way (`owner-steps.ts:361-364`). A gate that flips by itself on a number the owner never sees would ask an
   identity step with no record of why; a `metOn` with the reading as evidence is that record. Fold 4 adds the one guard
   the by-hand rule needs: the tick names a PASS whose gates are still unmet as a blocker for the main thread, so the fold
   cannot be forgotten. [repo; the guard's shape, inference]
7. *The brief's "a precondition on step 3 would leave the Gumroad items in the checklists" (A(2), last block) is accepted
   and answered*, not avoided: the items stay (a held step still gates its lines, `owner-steps.ts:280-282`), their text says
   when they are asked (Fold 5), and the Gumroad-token row is named "not asked yet" by ruling 5 — the same shape 4b has
   had since 28.9 (`REPORT.md:100`). [repo]

**What the surfaces print after the fold** (arithmetic over the gates; inference until the fold's tests pin it). Asked
now: steps 8, 7, 6 — 43-53 minutes in all (10 + 15-20 + 18-23; step 6's early part 8 of them). Per line: apify-actors
"8, 6" (§3 adds step 8 to its lines), il-biz-tools "8, 6", oss-bounties "7, 6", pcn874 "7, 6"; not asked now: step 2 and
step 3 with their `short`, step 5 frozen, step 4 held, in `order`. "Not asked yet": step 6's `POSTHOG_READ_KEY` row (its
gate), `GUMROAD_ACCESS_TOKEN` (until step 3 is done), `BRAND_GITHUB_TOKEN` and `ORG_BUDGETS_READ_TOKEN` (until step 7 is
done). The smallest set stays "steps 8, 2, 3, 6, 108-143 minutes" with step 3 moved from "Asked now" to "Held"; apify-actors'
path becomes steps 8, 2, 6, 88-123 minutes, still "not by the steps alone". §6's free batch stays 36-41 minutes
(`CHANNEL_LOOP.md:206`) — it counts the early part, the Actions check and the network setting, which are not whole code
steps; the two totals measure different lists and both are printed with their list.

---

## 3. A(3) Step 6 part ד and the Apify half are asked ahead of step 7 in code — through `earlyPart`, whose `afterStep` becomes `brand-mailbox` because the Apify account is opened with the brand mailbox; never through `order`, since step 6 completes only after steps 3 and 7; part ג's identity check stays at the Publish sitting, outside the batched list

**RULING.**
1. **In code, the early part is already ahead of step 7**, and more: `earlyPart.afterStep: "merge-pr"` permits it right after
   step 1 (`owner-steps.ts:497-502`), which is earlier than §6 (item 4 after items 1-3, `CHANNEL_LOOP.md:236`) and the box
   (item 2 after step 8, `OWNER_STEPS.he.md:50-52`) ask it. The step itself stays at `order` 8 and is not split: EIGHT holds
   (`:18-21`), and step 6 as a whole cannot complete before steps 3 and 7 (`secretRowsPastedBeforeMade`, `:694-717`; test
   `:319`). So "ahead of step 7" is carried by `earlyPart`, as the 7.9 board's "6a … immediately after step 1" always was
   (`BOARD.md:201`, `:208`; `owner-steps.ts:33-34`).
2. **`afterStep` becomes `"brand-mailbox"`.** The Apify half opens a new brand account; its sign-in address is the brand
   mailbox of step 8 and never a personal one. That is what step 8 was admitted for — "the inbox every new-account venue
   needs for verification mail and OTPs" (`research/breadth/BOARD.md:89-91`; `owner-steps.ts:333-334`) — and what PUBLISH-9
   forbids otherwise ("never from the owner's personal accounts … no personal Gmail, no personal Google account in an
   ownership chain", `BOARD-LOOP.md:62`); step 3's own text already applies the same rule to Gumroad and draws the same
   consequence ("לכן צעד 8 בא לפני צעד 3", `OWNER_STEPS.he.md:202-203`). The Hebrew Apify instruction says only "(אימייל; …)"
   (`:385`) — the one place the rule was not written down. Part ד needs no mailbox (ruling 7.10 struck "after step 8" as a
   dependency for the PostHog click, `RULING-2026-10-07-posthog-organisation.md:237`) and keeps being reported alone when done
   first (`OWNER_STEPS.he.md:435`); it is asked in the same sitting as the Apify half (7.10: "asked now, with the Apify
   part", `:81`, `:229-231`), so one `afterStep` for the one early part is step 8. The code's permission then matches §6 and
   the box exactly: step 8 → the early part → step 7 → the rest of step 6. [repo; that the Apify address is the brand
   mailbox is the application of PUBLISH-9 and Q2 to a text that was silent, marked inference]
3. **Step 8's `lines` gains `apify-actors`** (`owner-steps.ts:339`): "Revenue line ids that cannot earn until this step is
   done" (`:248`) — a line whose account is opened with the brand mailbox cannot start its stranger count without it. Its
   `unlocks` says so in one clause (Fold 1). The apify-actors setup item names step 8 as context, not as its step (Fold 5).
4. **Part ג is weighed and left where 11.10 put it.** The Publish click and Apify's identity verification are asked "when
   I write 'now'", after the first CI push — which needs `APIFY_TOKEN`, which is the early part — and part ג is "an identity
   step, so it comes after the free steps" (`OWNER_STEPS.he.md:366-367`, `:398-410`; `CHANNEL_LOOP.md:236`; the breadth
   board's Q5 item 3, `research/breadth/BOARD.md:148-150`: "It stays an identity step asked after the free batch"). In code
   it is `identity.needs: "part"` with `partLines: ["apify-actors"]` (`owner-steps.ts:468-473`), inside step 6 and outside
   `earlyPart`. Nothing about it is in the batched free list, and nothing here puts it there: the early part is
   identity-free ("Neither needs identity verification", `:499`), so the sequence 8 → early part → 7 asks no identity, and
   the identity check of part ג is asked only at the Publish sitting, by the colony's word, after the token exists. The
   11.10 move confirms the shape rather than disturbing it: the only identity in step 6 is on apify-actors' path alone
   (`identityOnLine`, `:601-607`), after everything free.
5. **The runner prints the early part once per line that step 6 gates**, in the per-line "Owner steps still open" line
   (`runner.ts:691`), as the owner report already does (`owner-report.ts:624`, which prints the step's number rather than
   its id after the fold): the brief found the runner silent on it (A(0)), and a REPORT reader otherwise sees "7, 6" for
   pcn874 and "8, 6" for il-biz-tools with nothing saying that 8 minutes of step 6 come first. Minutes are unchanged
   (early part 8, step 6 18-23, `:465`, `:501`).

**BASIS.** Items 2 and 3 above carry their sources. On item 1: §6 and the box have ordered the Apify half after step 8 since
the breadth board's §6 edit (`research/breadth/BOARD.md:360-361`: "2 step 8 …; 3 step 6a Apify") and the loop ruling's
(`RULING-2026-09-29-loop.md:103-104`), and ruling 7.10 placed part ד "after step 8" in the list while striking the
dependency (`:236-237`); the code's `afterStep: "merge-pr"` dates from 27.9 (`8788b8a`, the brief's history), before step 8
existed. The three texts agreed and the code was the odd one out. On the runner: `grep -n -F earlyPart src/revenue/runner.ts`
finds nothing at HEAD (the brief's A(0), re-run). [repo]

---

## 4. What the owner is told, and when: once, in the next batched owner list, three sentences; no new message; the correction the row anticipated is not sent — its opposite is

**RULING.** Nothing is sent now. The next batched owner list (the next summary's §6 list, in §6's order: the Actions check,
step 8, part ד, the network setting, the Apify half, step 7; "about 36-41 minutes", `CHANNEL_LOOP.md:206-240`) carries,
once and never as a reminder, this addition, in the owner's language:

> **תיקון אחד לדוח השעתי:** עד עכשיו הוא ביקש גם את Gumroad (צעד 3, תעודת זהות וחשבון בנק) — זה היה הקוד שפיגר אחרי
> פסיקת 28.9, ותוקן ב-12.10. צעד 3 מבוקש רק יחד עם צעד 2, כשקריאת הצפיות של יום 56 עוברת; עכשיו רק הצעדים החינמיים, כמו
> שכתבתי ב-7.10. ואת חשבון Apify (צעד 6, החלק המוקדם) פותחים עם תיבת המותג מצעד 8 — לכן הוא בא אחרי צעד 8.

The row's fold cell foresaw "a one-line correction to the owner in the next batched list if the code's order stands"
(`FABLE_QUEUE.md:53`) — a correction that the code's list, Gumroad included, is the real one. The code's `order` does stand
(§1), but that correction is **not** sent: it would tell the owner the opposite of what §2 rules. What is sent is that the
hourly report was wrong and the 7.10 list was right. The owner's open question on GitHub Actions (`logs/CHECKPOINT.md:47`
(א); §6 item 0) rides the same summary, before it.

**BASIS.** MISSION 28.9: owner steps are named "once per summary, without nagging" (`:401-403`); the loop may change
"order and information, not tone or frequency" (loop ruling `:88`) — a correction of information, once, in the list that
already goes out. Nothing in MISSION requires a message of its own: no money moved, no account is asked for, and the list
the owner was last given (7.10, `:92-97`, `:111`) is the one this ruling confirms. The REPORT the owner can open still
prints "8, 3, 6" until a tick runs after the fold (Tree): the sentence says so by dating the fix, so a stale REPORT is not
read as a second change of mind. [repo]

---

## What this does not decide

1. **Step 2's gate and its second official source.** Step 2's `what` keeps both halves (`owner-steps.ts:357-360`); the Tax
   Authority page is still unread (`step2-cost.md`; the brief's Part C item 9). For il-biz-tools and pcn874 its "a paid
   product is ready" is the PASS of §2(3); for oss-bounties and apify-actors, which step 2 also gates (`:355`), what makes
   a paid product ready is their own criteria (a held reward, `:447-453`; pricing designed, `LINE_PAYMENT_WAITS["apify-actors"]`)
   and is not defined here.
2. **The network setting as a step.** Not an owner step (`owner-steps.ts:152-160`, eight ids); asked as a settings change in
   §6 item 3 and the box's `:560-561`; the row does not ask for one and none is made.
3. **Step 5's freeze and step 4b's hold** (`:402-411`, `:447-456`): untouched.
4. **Whether the Netlify link (part א) is needed at all**: it is the alternative to the network setting (`CHANNEL_LOOP.md:232-234`);
   if the setting is granted, the link is moot. Not this row.
5. **Whether step 6 may be recorded done with an owed Gumroad-token row** (a `madeIn` row in `heldRows`). §2(5) keeps
   `heldRows` to `askedOnlyWhen` rows; if the wait from step 7 to the PASS proves long and the owner has done every free part
   of step 6, a sitting may extend `heldRows` to `madeIn` rows under the same follow-up machinery (`owner-steps.ts:667-688`).
   Not needed before a PASS exists.
6. **The order of steps 2 and 3 inside the PASS batch.** They print in `order` (2, then 3); the owner may do them in either
   order, and paid activation is held until both are done (`BOARD-LOOP.md:75`; `gumroad-pro-product.yml:34-38`). No reason
   in the record ranks them, and none is invented.
7. **Gumroad's own account review at opening.** The record names a review after the first 3-4 sales (`OWNER_STEPS.he.md:195`,
   unsourced at that line) and nothing at opening; see REOPEN 3.
8. **The repository's visibility** (`CHANNEL_LOOP.md:258-261`), **proposed steps 9, 12 and 13**, **step 10**, and the other
   held items (`:262-282`): untouched.
9. **The 7.10 status report** (`logs/2026-10-07-owner-status-report.md`): history, not edited; §4's sentence corrects it
   forward.
10. **`docs/INCOME_PLAN.he.md:312`** ("שבעה צעדים … 1 → 2 → 3 → 5 → 7 → 4 → 6"): stale since 28.9 and outside this row; a
    one-line housekeeping fold (Fold 6), not a ruling.
11. **Whether Apify's sign-up form accepts a mailbox-only registration without a phone or more.** No Apify text on the
    sign-up form is in the repository; the stop rule that already governs every brand account applies (step 8's own,
    `owner-steps.ts:334`, `:337-338`); see REOPEN 4.

---

## REOPEN triggers

1. **The owner has already opened a Gumroad account**, or opens one before the PASS, and says so: the gate is the timing of
   an ask, not a bar. The step is recorded done with the evidence, the token row is asked, and paid activation stays held
   until step 2 (`BOARD-LOOP.md:75`). Nothing is re-done and no sitting is needed.
2. **The floors ruling's row 9 is amended** (its gate, days or bar): step 3's `what` follows it in the same fold; a change
   of meaning returns here.
3. **A rendered Gumroad text shows an identity review at account opening** longer than the time step 2 takes once asked:
   a sitting may move step 3's ask to the PASS read's scheduling rather than its result, so the review runs while step 2 is
   done. Not before such a text exists.
4. **Apify's sign-up form refuses the brand mailbox, or asks for a phone the brand account does not have, an ID, a card or
   a camera step**: the owner stops (the stop rule of every brand account) and says so; a sitting decides the address or
   the step. `afterStep` does not move on that alone.
5. **PostHog's query API becomes priced** (ruling 7.10 §4, R1-R3) so that no day-56 read can be taken: the fallback read
   decides (7.10 F1-F3); if no read is possible for 60 days (`PAGE_VIEW_GATES.pricedReadWithinDays`, `page-views.ts:423-427`)
   a sitting rules a substitute gate for "a paid product is ready" rather than holding step 3 on a read that cannot happen.
6. **A ruling defines "a paid product is ready" for oss-bounties or apify-actors** in a way that would ask step 3 for a line
   it does not unlock: it does not; step 3's `lines` are il-biz-tools and pcn874 (`owner-steps.ts:381`). Return here only if
   a new line is admitted that sells through Gumroad.

---

## Pointers that moved (brief → HEAD)

The brief's drift note (`SITTING-2026-10-10-BRIEF.md:3-11`) and `brief-drift.mjs` at HEAD agree, and every pointer this
ruling rests on was re-opened at `bf702b3`. Beyond the note: `owner-steps.ts` `:236-237` (the row's `order` pointer) is the
field's doc comment and the field itself is `:239`; `isOwnerStepOpen` `:613-616`; `openSetupItems` `:719-733`;
`OWNER_STEP_ORDER_REVIEW` `:514-523`; step 3 `:370-385`; step 6 `:461-503`, the early part `:497-502`, `afterStep` `:500`;
step 8 `:327-341`, its `lines` `:339`; the test's early-part pin `owner-steps.test.ts:62-76` (`afterStep` at `:70`), step 8's
`lines` pin `:111`, the precondition-set pin `:456`, the box pin `:522-547` (needles `:536-543`, "ממתין לפסיקה" `:546`), the
order-review test `:1556-1570`; `CHANNEL_LOOP.md` §6 `:202-282` (item 4 `:236`, the heading `:242`, step 3 `:254-256`,
the held list `:266-282`); `OWNER_STEPS.he.md` box items `:47-59`, the order bullet `:64-68`, the arrow line `:73`, the
Apify instruction `:385-386`, part ג `:398`, part ד `:411`, the asked-now paragraph `:560-563`, table rows `:615-616`,
`:619`, `:621`. `REPORT.md`'s per-line lines are `:87`, `:91`, `:98`, `:103` (the drift note's +16).

---

## Folds for Opus

Every fold is ₪0, on Opus, in a worktree with the base check first (`CLAUDE.md`, "Agent worktrees"); none needs the owner;
worktree agents do not edit `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` or `logs/FABLE_QUEUE.md` (the main thread applies
those with `scripts/loop-edit.mjs`). No `git stash` in any form. After each: `scripts/verify.sh src/__tests__/revenue`
locally — GitHub Actions is disabled, so the pull request's CI will not run; the merge records the local verify, as the
11.10 folds did. The line numbers are HEAD `bf702b3`'s. Folds 1-5 are one build (builder → adversarial reviewer → fixer),
because the tests of each pin the others; Fold 6 is housekeeping; Folds 7-8 are the main thread's.

1. **`src/revenue/owner-steps.ts`** — no step added, removed, renumbered or reordered; `order` values unchanged.
   - After the tick-69 block (`:132-144`) a dated block: "Ruling of 12.10.2026 (research/channel-loop/RULING-2026-10-12-owner-step-order.md,
     FABLE_QUEUE row 29) — no step added, removed, renumbered or reordered; `order` is the checklist's and stands: (a) step 3
     is HELD by a `precondition` like step 2's — asked only when a paid product is ready, which for il-biz-tools and pcn874 is
     the day-56 page-view PASS (or the day-112 PASS after the one extension), the floors ruling of 28.9 row 9 item 3 and the
     lines ruling of 29.9 (f); asked then together with step 2, with the reading; `metOn` set by hand with the reading;
     (b) a secret row whose `madeIn` step is not done is not asked and is named 'not asked yet' with that reason
     (`isSecretRowAsked`); `heldRows` is unchanged; (c) step 6's early part follows step 8, `afterStep: "brand-mailbox"`: the
     Apify account is opened with the brand mailbox (BOARD-LOOP PUBLISH-9; research/breadth/BOARD.md Q2), as step 3's account
     is; part ד needs no mailbox (ruling 7.10) and is asked in the same sitting; (d) step 8's `lines` gains apify-actors;
     (e) `OWNER_STEP_ORDER_REVIEW` becomes `OWNER_STEP_ORDER_RULED`." Rewrite `:54-59`'s last two bullets to the past tense
     ("The Hebrew document leads with the free steps — which is what the gates leave asked now"; "`order` is the boards'
     and stands, ruled 12.10; the ₪0 sequence is the gates' output, not a second order") and `:142-144` accordingly.
   - `:333` (step 8's `unlocks`): append "It is also the sign-in address of the Apify account step 6's early part opens
     (never a personal address, BOARD-LOOP PUBLISH-9), so apify-actors waits on it too (ruling 12.10)." `:339`:
     `lines: ["apify-actors", "il-biz-tools"]`.
   - Step 3 (`:370-385`), after `catalogueRef` (`:382`), before `ownerDecision`:
     ```ts
     precondition: {
       what:
         "Under the floors ruling of 28.9 (research/channel-loop/RULING-2026-09-28-floors.md, Row 9 item 3) and the lines ruling of 29.9 (f) (portfolio.ts TARGET_BASIS.pcn874), a paid product on il-biz-tools or pcn874 is ready only when that line's day-56 page-view read PASSES — 100 a week or more averaged over weeks 5-8 of the netlify.app period, or the same read at day 112 after its one extension (page-views.ts PAGE_VIEW_GATES) — and until then no owner step is asked on the line's account. Step 3 is free to open and its fees come out of sales (MISSION 27.9), so no cost check is part of this gate; it is held because it is an identity step whose only use before a sale — the token that reads sales and creates the Pro draft — reads nothing and sells nothing before step 2, which is itself asked only then. metOn is set by hand with the PASS reading as evidence, in the fold that records the verdict; setting it asks the owner for step 3 together with step 2, with the reading (ruling 12.10, research/channel-loop/RULING-2026-10-12-owner-step-order.md §2).",
       short: `only when a paid product is ready — after the day-${PAGE_VIEW_GATES.reachDay} page-view PASS of il-biz-tools or pcn874, together with step 2`,
     },
     ```
     `short` has no `(`, `)` or `;` and does not open with a step number (the report prints it after "step 3 ").
   - `:497-502`: `afterStep: "brand-mailbox"`; in `what`, after "Neither needs identity verification.", append "The Apify
     account is registered with the brand mailbox of step 8, never a personal address, so this part follows step 8; part ד
     needs no mailbox and is reported alone when done first (ruling 12.10)." `:253-257` (the field's doc): add "Since ruling
     12.10 it follows step 8, whose mailbox the Apify account is opened with."
   - `:514-523`: rename to `OWNER_STEP_ORDER_RULED` with the text
     `the order is the code's, ruled 12.10.2026 (research/channel-loop/RULING-2026-10-12-owner-step-order.md, FABLE_QUEUE row 29): the free steps come first because step 1 is done, step 5 is frozen and steps 2 and 3 are held until a paid product is ready — for il-biz-tools and pcn874 the day-${PAGE_VIEW_GATES.reachDay} page-view PASS, or the day-${PAGE_VIEW_GATES.extensionDay} read after its one extension, the floors ruling of 28.9 row 9 item 3`
     and a doc comment that says what it is for (printed once by the owner report beside the code's order; never in
     REPORT.md).
   - `LINE_PAYMENT_WAITS["il-biz-tools"]` `what` (`:561`): "step 6's paid-tier part, "6b"" → "step 6's Gumroad-token row,
     "6b"".
   - Secret rows: `isSecretRowAsked(row, site, steps = OWNER_STEPS)` returns false when `row.madeIn` names a step without
     `doneOn`; `askedSecretRows`, `heldSecretRows`, `followUpSecretRows`, `heldFollowUpSecretRows` take and pass `steps`; a new
     `secretRowHoldReason(row, site, steps): string | null` returns `SECRET_ROW_GATE_SHORT[gate]` for a held `askedOnlyWhen`
     row and `waits until step ${maker.number}, which makes it, is done` for a `madeIn` row whose maker is not done (the
     `askedOnlyWhen` reason first when both hold). `heldRows` eligibility unchanged (`:271-275`; test `:987-995`).
     `secretRowsPastedBeforeMade` unchanged.
2. **`src/__tests__/revenue/owner-steps.test.ts`** — what the tests must prove:
   - `:51-60`, `:474`, `:484-492`, `:578`, `:925`: unchanged and green (the order, the arrow line, step 8 before step 3,
     il-biz-tools' items `[[8], [6], [3], [6]]`).
   - `:62` title → "lets the early part of step 6 (the Apify token and part ד) follow step 8"; `:70` → `toBe("brand-mailbox")`;
     a new assertion that `what` matches /brand mailbox/.
   - `:111` → `toEqual(["apify-actors", "il-biz-tools"])`; `openOwnerStepsForLine("apify-actors")` → `[8, 6]`.
   - A new test, beside `:440-457`: step 3 `hasPendingPrecondition` true, `isOwnerStepOpen` false, `doneOn` undefined;
     `short` matches /^only when a paid product is ready/, /day-56/, /together with step 2/, not /[();]/, and
     `step 3 ${short}` does not match /^step 3 3/; `what` contains "RULING-2026-09-28-floors.md", "Row 9 item 3", "day-56",
     "day 112", "free to open", "metOn is set by hand"; `what` carries `PAGE_VIEW_GATES.reachDay` and `.extensionDay` as
     numbers (as the tick-69 tests do at `:1523-1527`). `:398` → `toBe(false)`; `:154` → `[8, 6]`; `:405` → `[7, 6]`;
     `:452` → il-biz-tools and pcn874 held `["tax-file", "gumroad"]`, apify-actors `["tax-file"]`, oss-bounties
     `["tax-file", "algora-stripe"]`; `:456` → `["algora-stripe", "gumroad", "tax-file"]`.
   - `:460-471`: with step 2 met alone, pcn874's open → `[2, 7, 6]` and held → `["gumroad"]`; a second case with both met →
     `[2, 3, 7, 6]` and held `[]`.
   - `:473` title → "keeps the boards' order: ruled 12.10, the code's order is the checklist's".
   - `:522-547`: needles → step 8; "**צעד 6 — רק החלק של Apify והחלק של PostHog**"; "**צעד 7**"; "**צעד 6 — חיבור Netlify.**";
     "**צעדים 2 ו-3 — רק כשמוצר בתשלום מוכן למכירה**"; `:546` → `toContain("פסק ב-12.10")` and `not.toContain("ממתין לפסיקה")`
     over the whole document.
   - New: step 3's section contains "רק כשמוצר בתשלום מוכן" and "קריאת הצפיות של יום 56" (as `:556-561` does for step 2);
     part ב's Apify item contains "של המותג מצעד 8"; the document contains "עודכן 12.10.2026"; `:73`'s arrow line equals
     the code's order (already `:484-492`).
   - Secret rows: `isSecretRowAsked` false for `GUMROAD_ACCESS_TOKEN` while `gumroad` has no `doneOn` and true on a
     synthetic steps array where it has one; false for `BRAND_GITHUB_TOKEN` and `ORG_BUDGETS_READ_TOKEN` while `github-org`
     is not done; true for `APIFY_TOKEN`; `POSTHOG_READ_KEY` unchanged (its gate); `secretRowHoldReason` texts; `heldRows`
     still may name only `askedOnlyWhen` rows (`:987-995` unchanged).
   - `:1556-1570` → `OWNER_STEP_ORDER_RULED` matches /^the order is the code's, ruled 12\.10\.2026/, contains the ruling's
     path and "FABLE_QUEUE row 29", `day-${reachDay}` and `day-${extensionDay}`, ends with /row 9 item 3$/; the document
     contains "פסק ב-12.10".
   - Mutation plan `src/__tests__/revenue/mutations/owner-steps.json` gains (ids T73-OS1…): `afterStep: "brand-mailbox",` →
     `"merge-pr",`; step 8's `lines` back to `["il-biz-tools"]`; step 3's `short` opening word changed; step 3's `what`
     without "metOn is set by hand"; the `madeIn` check in `isSecretRowAsked` removed (its `return false` → `return true`);
     the `OWNER_STEP_ORDER_RULED` tail "row 9 item 3" changed; the box's merged item needle changed in the Hebrew document;
     the Apify item's "של המותג מצעד 8" removed. Run with `node scripts/mutate.mjs --plan …` inside `scripts/sim-tree.sh`;
     `mutations/README.md` gains the row's entry and measured time.
3. **`docs/OWNER_STEPS.he.md`** (the Hebrew is the owner's text; keep `:1`, "שמונה" and the 150–190 total).
   - After `:32`, a dated paragraph:
     **עודכן 12.10.2026 (פסיקה 12.10, `research/channel-loop/RULING-2026-10-12-owner-step-order.md`, FABLE_QUEUE שורה 29): הסדר שבקוד הוא הסדר, והוא לא השתנה; מה שמבוקש עכשיו נקבע לפי השערים ולא לפי הסדר. צעד 3 (Gumroad) מוחזק בקוד כמו צעד 2 — מבוקש רק כשמוצר בתשלום מוכן, כלומר כשקריאת הצפיות של יום 56 עוברת, ואז שניהם יחד; החלק המוקדם של צעד 6 (טוקן Apify ושני ארגוני PostHog) בא אחרי צעד 8, כי חשבון Apify נפתח עם תיבת המותג; שורות הטוקנים של צעד 6 נשאלות רק כשהצעד שיוצר אותן בוצע. שום צעד לא נוסף, ושום סדר לא השתנה.**
   - `:57-59` (items 5 and 6) → one item 5:
     **צעדים 2 ו-3 — רק כשמוצר בתשלום מוכן למכירה**, כלומר כשקריאת הצפיות של יום 56 (או יום 112, אחרי ההארכה האחת) עוברת ב-`il-biz-tools` או ב-`pcn874` (פסיקת 28.9 שורה 9; פסיקת 12.10). אז שניהם מבוקשים יחד, עם הקריאה עצמה: **צעד 2** — תיק עוסק פטור, ורק אחרי שבדקתי מהמקור הרשמי אם הוא עולה משהו (פירוט בצעד 2); **צעד 3** — חשבון Gumroad: פתיחת החשבון חינם והעמלות יורדות רק מתוך מכירות, לא מהכיס שלך, אבל הוא צעד זהות (תעודת זהות, הוכחת כתובת, חשבון בנק), ומה שהוא פותח — מכירה והטוקן שקורא אותה — לא קיים לפני צעד 2, ולכן הוא לא מבוקש לפני כן. **שום מוצר בתשלום לא עולה שם למכירה לפני צעד 2.**
   - `:64-68` (the order bullet) →
     **המספרים לא זזים.** "צעד 5" הוא עדיין הדומיין. **הדירקטוריון פסק ב-12.10** (`research/channel-loop/RULING-2026-10-12-owner-step-order.md`): הסדר הרשמי הוא זה שבקוד (`src/revenue/owner-steps.ts`) — 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6, סדר הדירקטוריון מ-7.9 עם צעד 8 שהוכנס שני ב-28.9 — והוא לא השתנה. מה שמבוקש ממך עכשיו נקבע לא לפי הסדר אלא לפי השערים: צעד 1 בוצע, צעד 5 מוקפא, וצעדים 2 ו-3 מוחזקים עד שמוצר בתשלום מוכן; לכן נשארים הצעדים החינמיים, בסדר שלמעלה — שהוא אותו סדר. בשני המקומות — אף צעד לא מבקש ממך כסף.
   - `:75`: "מיד אחרי צעד 1" → "מיד אחרי צעד 8 (חשבון Apify נפתח עם תיבת המותג)"; `:76`: the parenthesis → "(הסדר שבתיבה למעלה
     הוא אותו סדר אחרי השערים — פסיקת 12.10.)".
   - Step 3: after `:199` add "**מבוקש רק כשמוצר בתשלום מוכן** — כשקריאת הצפיות של יום 56 עוברת (פסיקת 28.9 שורה 9; פסיקת
     12.10) — יחד עם צעד 2. עד אז הדוח השעתי לא מבקש אותו."; `:201`'s "לכן צעד 8 בא לפני צעד 3" stays.
   - Step 6: `:366-367` "— **ראשון, כבר עכשיו**" → "— **ראשון, מיד אחרי צעד 8**"; `:385`: "ולהירשם (אימייל;" → "ולהירשם
     (**עם כתובת המייל של המותג מצעד 8 — לא כתובת אישית**;"; the secrets table (`:389-393`) unchanged in rows and order.
   - Table: `:616` → "| 3 | חשבון Gumroad + טוקן — רק כשמוצר בתשלום מוכן (קריאת יום 56 עוברת), יחד עם צעד 2 | 20 | 3 קווים,
     תשלום בשקלים | הטוקן → צעד 6 |"; `:621`'s "מה זה פותח" cell gains ", כתובת ההרשמה של חשבון Apify".
   - `:560-563` unchanged (it already excludes step 3). Regenerate any rendered copy of the document if one exists.
4. **`src/revenue/runner.ts`** (+ `runner.test.ts`; plan `mutations/colony.json`).
   - `heldSecretRowsNote` (`:829-838`): use `secretRowHoldReason`, so the line reads "Not asked yet: step 6's
     `POSTHOG_READ_KEY` row waits until …; step 6's `GUMROAD_ACCESS_TOKEN` row waits until step 3, which makes it, is done;
     step 6's `BRAND_GITHUB_TOKEN` row waits until step 7, which makes it, is done; …" (each row once, however many lines).
   - `:691`: when `ci-tokens` is open for the line, append "; step 6's early part, 8 min, may follow step 8" (the number of
     `afterStep`'s step, the minutes from `earlyPart`).
   - The PASS guard: where the tick applies the M-reach verdict (`page-views.ts` `pass`), a `pass` for il-biz-tools or pcn874
     while `gumroad` or `tax-file` has a pending precondition pushes one blocker: "the day-N read PASSED for <line> on
     <date>: 'a paid product is ready' holds for steps 2 and 3 and is not yet recorded (owner-steps.ts precondition.metOn) —
     record it with the reading; the report then asks them together (floors 28.9 row 9; ruling 12.10)". Never an owner ask.
   - Tests: `:247` → `/Owner steps still open for \`pcn874\`[^\n]*: 7, 6 \(not asked now: step 2 [^;]+; step 3 only when a paid product is ready[^;]+; step 5 frozen/`;
     `:305` → il-biz-tools "8, 6 (not asked now: step 2 …; step 3 only when a paid product is ready — after the day-56 page-view
     PASS of il-biz-tools or pcn874, together with step 2; step 5 frozen by the owner's ₪0 rule of 27.9.2026)"; `:306`
     likewise for pcn874; the apify-actors blocker (`:302-303`) → "steps 8, 6 of"; the early-part clause asserted on the
     il-biz-tools and pcn874 lines; the "Not asked yet" line asserted with the three `madeIn` rows and, on a synthetic
     `github-org` done, without the two step-7 rows; the PASS guard asserted with a synthetic `pass` and absent on `pause`;
     `STEP_6_REACHED` (`:529-530`) unchanged.
5. **`src/revenue/portfolio.ts`** (+ `owner-steps.test.ts:299`, `runner.test.ts` checklist pins).
   - `:229`: "(owner step 6; this half may be done straight after step 1)" → "(owner step 6; this half may be done straight
     after step 8, with the brand mailbox as the account's address)"; its `contextSteps` `[1]` → `[8]` (test `:299` →
     `[[6], [8]]`).
   - `:282` and `:386` (the Gumroad items): prefix "Asked only when a paid product is ready — the day-56 page-view PASS
     (RULING-2026-09-28-floors.md row 9; ruling 12.10) — together with step 2: " and keep "(owner step 3)" at the end.
   - `:289` and `:394`: append " — the Gumroad token only once step 3 is done (ruling 12.10)".
   - `:252` (the floors ruling's quoted string) unchanged.
6. **`src/revenue/owner-report.ts`** (+ `owner-report.test.ts`; plan `mutations/owner-report.json`): `:326` → `orderRuled:
   OWNER_STEP_ORDER_RULED` (rename the field in `FirstPaymentPath`); `:495-496` print "Steps in the code's order … ." then
   the ruled line; `:624` print the number of `afterStep`'s step ("may follow step 8"), not the id; `:19-28` header: the
   section states the ruled order and no longer "picks neither". Tests: `:410-414` → the ruled line, exact; `:575`
   il-biz-tools "Asked now" → step 8 then step 6, step 3 under "Held or frozen" with its `short`; `:593` unchanged
   ("Steps 8, 2, 3, 6 (in the code's order), 108-143 minutes in all … Identity checks among them: step 2 (yes), step 3
   (yes)."); apify-actors' path "steps 8, 2, 6, 88-123 min; the eight steps alone do not make it payable."; the "Owner steps"
   header "3 asked now, 43-53 minutes in all", step 6's line "its early part, 8 min, may follow step 8"; "Not asked now" gains
   step 3 with its `short` and the three `madeIn` rows. **Housekeeping:** `docs/INCOME_PLAN.he.md:312` → "שמונה צעדים, בסדר
   שבקוד (פסיקות 7.9, 28.9 ו-12.10): 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6" with "חצי אחד של צעד 6 … מיד אחרי צעד 8".
7. **Main thread, `scripts/loop-edit.mjs` only** — `logs/FABLE_QUEUE.md:53`: `set-status --row 29` "**DONE 12.10** (sitting
   ~07:11, beside row 28): `research/channel-loop/RULING-2026-10-12-owner-step-order.md` — the code's `order` stands and is the
   checklist's; step 3 held like step 2 until the day-56 PASS, asked then with step 2; '6b' is the Gumroad-token row, held
   while step 3 is not done; the early part follows step 8 (`afterStep: brand-mailbox`; the Apify account uses the brand
   mailbox); step 8 gains apify-actors; the owner gets one correcting sentence in the next list, not the one the row
   foresaw. Folds: tick 73." `logs/CHANNEL_LOOP.md` §6: `:236` after "(the free plan)" insert ", registered with the brand
   mailbox of step 8, never a personal address (ruling 12.10)"; `:242` append " — for il-biz-tools and pcn874 the day-56
   page-view PASS, or the day-112 read after its one extension (floors 28.9 row 9; lines 29.9 (f); ruling 12.10): steps 2
   and 3 join the batch together, with the reading"; `:254-256` append "**Ruled 12.10 (row 29):** held in code too
   (`precondition`), asked with step 2 at the PASS; '6b' is step 6's Gumroad-token row, 'not asked yet' until step 3 is
   done; the hourly report no longer lists 3 as asked now." §9 `:410` item (1): prefix "Fixed 12.10 (ruling row 29; the
   dashboard never read `order`, `dashboard.ts:25`; the box did not gate step 3 — both corrected):". §0 `:26`: the sitting's
   outcome. §10: tick 73's fold. The Hebrew tick log per `CLAUDE.md`.
8. **Main thread, `logs/CHECKPOINT.md`** — the next owner summary carries §4's three sentences once, after the Actions
   question, in §6's order with "about 36-41 minutes"; and the note that REPORT.md shows the old "8, 3, 6" until a tick runs
   after the fold.
