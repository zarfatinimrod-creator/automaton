# Brief for the Fable sitting of 10.10.2026 (~07:11 UTC): FABLE_QUEUE row 29

**What this is.** Opus clerks gathered the evidence for row 29 (which order of the owner steps binds) in three lists:
clerk A a step table and items 1-43, clerk B items 1-39, clerk C items 1-67. An Opus checker re-opened every pointer and
corrected what had moved or overreached. Its task named `92e2a7c`; `git log -1 --format=%h` gave `6229781` at the start
and the end of its reads, so every pointer was read at `6229781`, one colony tick commit after `92e2a7c` (the report it
wrote was generated 2026-10-07T20:33:58Z). `git diff --name-only 92e2a7c 6229781` lists only `state/colony/REPORT.md`,
`state/colony/colony.db` and `state/colony/dashboard.html`, so every other pointer is the same on both trees, and REPORT
pointers are given at both. `git status --short` was empty both times. The checker made no write and no git write, used
no stash in any form, made no network call and started no subagent. An Opus assembler wrote this file on `6229781`
[asm: in a worktree on `build/tick66-brief`, cut from `origin/claude/new-session-j071dx` at that commit]. It re-opened
every header pointer and a sample of more than twenty others, and marks what it added or corrected **[asm]**. Nobody
here rules or recommends. No web fetch was made for this brief, no connector was called and nothing was created
anywhere. [asm] The assembler's own runs were read-only: `sed -n`, `awk 'NR>=…'`, `grep -n`, `grep -c` and `grep -o`
over the tree, and `git show`, `git log` and `git diff --name-only` on past commits.

**Grades** (as `research/channel-loop/SITTING-2026-10-05-BRIEF.md:15-18`, with the 8.10 brief's additions).
- `rendered`: a render-watch capture that a session read.
- `github`: code or docs read on GitHub at a pinned commit. `rendered via note`: a note quoting a capture; the note's
  line is the pointer and the capture was not re-opened.
- `snippet`: a search-engine snippet.
- `repo`: our own code or notes. `repo (git objects)`: a past version read from the local object store, as of the last
  local fetch; no fetch was made.
- `inference`: reasoning, not a text, always marked. `none`: no source.

Everything below is `repo` unless marked.

**Provenance marks.**
- Unmarked statements are items the checker confirmed. **[CORR]** marks the checker's correction of a clerk, **[OVER]**
  a claim its cited source does not make, and **[NEW]** the checker's own addition. Clerk tags such as (A26) appear only
  in Part C's list of corrections.
- **`[against-bar]`** (D1(1), `research/channel-loop/RULING-2026-09-30-video.md:27-31`) marks a gumroad.com capture. It
  "stays on disk, readable and citable at rendered grade with the mark kept" for "(i) a question about our own
  compliance" and "(ii) a decision not to do something" (`:29-30`). One such text is used here, Gumroad's fee article,
  only through a note's line (A(2)). [asm] The note grades its Gumroad captures so at
  `research/measurements/refund-law-il.md:1140`. No capture is cited by line in this brief.

**Short names.**
- `owner-steps.ts`, `portfolio.ts`, `runner.ts` ("the runner"), `dashboard.ts` and `owner-report.ts` ("the owner-report
  module") are under `src/revenue/`. `scripts/owner-report.ts` ("the owner-report script") prints the module.
- "The test" is `src/__tests__/revenue/owner-steps.test.ts`; `runner.test.ts` and `owner-report.test.ts` are beside it.
- "The document" is `docs/OWNER_STEPS.he.md`. "The box" is its ₪0 box, `:29-66`, with its ordered list at `:41-54`.
- "§6" is `logs/CHANNEL_LOOP.md` §6, `:201-279`. "The channel table" is the same file's §3, `:117-140` [asm].
- "REPORT" is `state/colony/REPORT.md` at `6229781`; "the dashboard page" is `state/colony/dashboard.html`.
- "The 7.9 board" is `research/colony-sweep/BOARD.md`. "The breadth board" is `research/breadth/BOARD.md`. "The loop
  board's design" is `research/channel-loop/BOARD-LOOP.md`. [asm] A bare `BOARD.md:n` is the 7.9 board's; the breadth
  board's is always written in full.
- Under `research/channel-loop/`: "the floors ruling" is `RULING-2026-09-28-floors.md` [asm]; "the loop ruling" is
  `RULING-2026-09-29-loop.md`; "the documents ruling" is `RULING-2026-09-30-documents.md`; "ruling 7.10" is
  `RULING-2026-10-07-posthog-organisation.md`.
- "The status report" is `logs/2026-10-07-owner-status-report.md` (its appendix opens at `:38`). "The tick-64 log" is
  `logs/2026-10-07-channel-loop-tick-64-owner-report.md`.
- "The code's order" is `order` as the code sets it: 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6. "The ₪0 sequence" is the row's name
  for the order of §6, the box and the status report. A(0) shows that these are not one list.
- "Asked now": `isOwnerStepOpen` is true, that is not done, not frozen and not held (`owner-steps.ts:458-461`). "Held": a
  `precondition` without `metOn`. "Frozen": `frozen` set.
- Step 6's parts have two sets of names. §6 says 6a for Apify (`:233`) and 6b for the Netlify click (`:231`). The 7.9
  board's 6b is "Netlify link, `GUMROAD_ACCESS_TOKEN`, and `BRAND_GITHUB_TOKEN`" (`BOARD.md:201`) [asm]. The document
  says א for Netlify (`:366`), ב for the tokens, with Apify at item 2 (`:379-381`), ג for the Publish click (`:393`) and
  ד for the PostHog organisations (`:398`).

**Who reads what.** The row-29 decider reads Part A and Part C, and the header blocks: this one, the standing rules and
the links. [asm] There is no Part B: one row sits.
- **The seat.** "one decider (10.10 ~07:11, the next free seat; 8.10 holds rows 26 and 27, 9.10 row 28)"
  (`logs/FABLE_QUEUE.md:53`). [asm] The schedule line still reads "brief not yet built" (`CHANNEL_LOOP.md:26`). The
  tick-66 plan names this file (`:473`). This brief was built on 7.10, in tick 66.
- **The output.** "a ruling in `research/channel-loop/`". Then: "fold into `owner-steps.ts` (`order`, the asked-now
  gates), `owner-steps.test.ts`, `docs/OWNER_STEPS.he.md:60`, §6 if it changes, and a one-line correction to the owner in
  the next batched list if the code's order stands" (`FABLE_QUEUE.md:53`).
- **The status.** "queued 7.10 (tick 64, from the owner-report build's finding)". The finding is `CHANNEL_LOOP.md:407`
  item (1), and in Hebrew the tick-64 log `:24`.
- **The row's own pointers.** All hold at both trees. Two of the row's glosses are not in their sources, and its claim
  about the dashboard is not what the code does (Part A, "The row's own pointers, re-opened").

**Standing rules.**
- **MISSION first.** `MISSION.md` is read before anything else (`CLAUDE.md:4`).
- **Rule 1.** "**one ordered checklist**" (`MISSION.md:435`); "Never invent a step that isn't required." (`:436`);
  "**Never** open an account in the owner's name, answer an identity check, or mark setup done on our own initiative."
  (`:437-438`; heading `:431`). [asm] `:431-439` sets no order among the steps.
- **The checklist's own rule.** "There are exactly EIGHT steps. Adding another fails the build … a new step needs a
  decision, not a commit" (`owner-steps.ts:18-21`).
- **The standing consent** "does not reach the owner's own clicks: identity, payout, and anything bought"
  (`MISSION.md:349-350`).
- **The ₪0 rule.** "**Nothing is bought.**" (`:354`). "No step that costs the owner anything is asked for until its cost
  is checked … Step 2 … is asked only when a paid product is ready" (`:356-357`). "Platform fees that come out of a sale
  are not the owner paying", and "A line that needs the owner to pay first waits." (`:359-360`). "platform fees taken out
  of a sale are allowed; nothing is paid up front" (`:386-387`).
- **Once per summary.** Owner steps are named "once per summary, without nagging" (`:402-403`). What the loop may change
  is "order and information, not tone or frequency" (loop ruling `:88`).
- **Rule 3.** Decisions live in code "precisely so any auditor can recompute them from the same numbers and catch drift"
  (`MISSION.md:450-451`).
- **The loop's protocol.** "Rebuild §6 from the channel table. Only list steps that a channel is actually blocked on."
  (`CHANNEL_LOOP.md:58`).
- **The sitting.** At most 2 agents (`CHANNEL_LOOP.md:51`).

**How the three questions touch. Read these before ruling.**
1. **[asm] `order` sorts; the gates choose.** `order` only sorts: `ownerStepsInOrder` (`owner-steps.ts:439-442`) and
   `ownerStepsForLine` (`:449-451`). Whether a step is asked now is `isOwnerStepOpen` (`:458-461`). The four steps asked
   now (8, 3, 7, 6) and the 63-73 minutes come from the gates; `order` sets only the sequence they print in. [inference]
   So the first question and the gate half of the second can be answered apart in code. A new order alone leaves step 3
   asked now, and a gate on step 3 alone leaves the code's order.
2. **The ₪0 sequence is two texts.** The box and §6 differ (the table in A(0)), and the row's "₪0 sequence" names both.
   [asm] Neither places all eight steps.
3. **The third question meets a field with no record of its own.** Step 6's early part has no `doneOn`
   (`owner-steps.ts:226`), and a step 6 recorded done before steps 3 and 7 fails the build (A(3)).
4. **The owner has been told one list.** The status report gave §6's free list and put Gumroad later (`:92-97`, `:111`).
   Ruling 7.10's fold 12 sends the next owner summary in §6's order (`:831-832`). The row's fold adds "a one-line
   correction to the owner in the next batched list if the code's order stands" (`FABLE_QUEUE.md:53`).
5. **[asm] One ruling already sets step 3's timing for one line.** The floors ruling of 28.9 puts il-biz-tools' paid-tier
   steps, step 3 among them, into the ask batch at the day-56 reach pass (A(2), "Rulings on when step 3 is asked").
   None of the three clerks' lists or the checker's names it.

---

## Part A — Row 29: which order of the owner steps binds (`FABLE_QUEUE.md:53`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:53`): "`src/revenue/owner-steps.ts:54-59` (the Hebrew document leads
with the free steps; "Re-sequencing is the board's call") and `:205-206` (the `order` field: 1, 8, 2, 3, 5, 7, 4, 6, the
7.9 board order with step 8 second), `docs/OWNER_STEPS.he.md:60` (the code's order "awaits" the board),
`logs/CHANNEL_LOOP.md` §6 (the free batch: step 8, step 6 part ד, the network setting, step 6's Apify half, step 7; step
3, Gumroad, under "Only when a paid product is ready"), `research/channel-loop/RULING-2026-09-29-loop.md` (b) `:66`,
`:499` (step 8 first in the free batch; no re-sequencing of the code), `state/colony/REPORT.md` (per line: il-biz-tools
8, 3, 6; pcn874 3, 7, 6; oss-bounties 7, 6; apify-actors 6), `scripts/owner-report.ts` (tick 64: steps 8, 3, 7, 6 asked
now, 63-73 minutes), `logs/2026-10-07-owner-status-report.md` appendix (the owner was told ~38 free minutes, Gumroad
later)".

**The row's question, verbatim** (`FABLE_QUEUE.md:53`): "Two orders are in force and the owner sees both: the code's
`order` (the 7.9 board, step 8 put second on 28.9) drives the hourly `REPORT.md`, the dashboard and the owner-report
script, and asks steps 8, 3, 7 and 6 now, Gumroad (identity: ID, proof of address, an Israeli bank account) included;
the ₪0 sequence of §6, the Hebrew document and the 7.10 status report asks only the free, no-identity steps now and step
3 only when a paid product is ready. Which order binds; whether `order` changes to the ₪0 sequence (and step 3's
asked-now gate becomes "a paid product is ready", like step 2's); and whether step 6 part ד and step 6's Apify half are
asked ahead of step 7 in the code as they are in §6."

**[asm] The labels.** The row asks three questions, and each has its own section. A(1) is which order binds. A(2) is
whether `order` changes to the ₪0 sequence, and whether step 3's asked-now gate becomes "a paid product is ready". A(3)
is whether step 6 part ד and the Apify half are asked ahead of step 7 in the code. A(0) is what exists today, which all
three read.

**The row's own pointers, re-opened.**
- `owner-steps.ts:54-59` holds: the box bullet is `:54-56` and the order bullet `:57-59`.
- `:205-206` is the `order` doc comment; the field is at `:208`.
- `OWNER_STEPS.he.md:60` holds; the sentence runs `:59-61`.
- §6 holds: the free batch is `:205-237`, "Only when a paid product is ready" is `:239`, and step 3 is `:251-253`.
- The loop ruling's `:66` is the (b) heading; the ruling sentence is `:68-69`. `:499` holds and says "§6 reorder".
  [OVER] "no re-sequencing of the code" is not in the ruling. The words "no step added, removed, renumbered or reordered
  in code" are the code's own summary of that ruling (`owner-steps.ts:90-91`).
- REPORT holds: `:71`, `:75`, `:82`, `:87` at `6229781`, and `:70`, `:74`, `:81`, `:86` at `92e2a7c`, with the same text.
- [asm] `scripts/owner-report.ts` is the 57-line script; the asked-now code is in the module (`owner-report.ts:251-255`,
  `:384-395`). Tick 64's figures are in the tick-64 log (`:12`, `:24`, `:68`).
- The status report's appendix opens at `:38`. The free list is `:92-97` and "Gumroad later" is `:111`.
- [OVER] The row says the ₪0 sequence "of §6, the Hebrew document and the 7.10 status report … asks … step 3 only when a
  paid product is ready". §6 says so (`:239`, `:251`), and so does the status report (`:111`). The document does not:
  its box lists step 3 fifth among the free steps, with only "שום מוצר בתשלום לא עולה שם למכירה לפני צעד 2"
  (`OWNER_STEPS.he.md:52-53`). Its table row 3 has no gate (`:605`). Only `:547-550` keeps step 3 out of "asked now",
  and only by not naming it. `logs/CHECKPOINT.md:21` repeats the row's claim.
- [OVER] [NEW] The row, `CHANNEL_LOOP.md:407` and `CHECKPOINT.md:21` all say the code's `order` drives "the dashboard".
  `dashboard.ts:25` imports only `openSetupItems` from owner-steps. The dashboard lists each line's setup items in stored
  order (`:79-84`) and drops every blocker containing "waiting on the owner" (`:139`). A grep finds only `runner.ts` and
  `owner-report.ts` calling `ownerStepsInOrder`, `openOwnerStepsForLine` or `isOwnerStepOpen`.

### A(0) The state today

**The steps as the code holds them** (`owner-steps.ts`; every cell confirmed).

| Step (id) | `order` | Minutes | Identity, as the files state it | Asked now today |
|---|---|---|---|---|
| 1 merge-pr | 1 (`:276`) | 2 (`:278`) | "Consent, not identity" (`:280`); catalogueRef null (`:282`) | done 2026-09-22 (`:283-287`) |
| 8 brand-mailbox | 2 (`:293`; comment `:292`) | 10 (`:295`) | "no identity step"; the owner's own phone for the sign-up check is allowed (`:297`); catalogueRef null (`:300`), "Not an identity step and not in the chief audit's catalogue" (`:299`) | yes: no gate (test `:109-111`) |
| 2 tax-file | 3 (`:305`) | 60-90 (`:307`) | "CHIEF-AUDIT §4A.1" (`:311`) | held: `precondition` without `metOn` (`:312-320`) |
| 3 gumroad | 4 (`:327`) | 20 (`:329`) | §4A.2 (`:333`). ID front and back, and Israeli proof of address (`OWNER_STEPS.he.md:202-203`); an Israeli bank (`:201`); "in your legal identity" (`portfolio.ts:282`) | yes: no `precondition`, no `frozen` (`:324-336`; test `:393`) |
| 5 domain | 5 (`:340`) | 10 (`:342`) | §4A.4 (`:346`) | frozen since 2026-09-27 (`:349-358`) |
| 7 github-org | 6 (`:363`) | 15-20 (`:365`) | §4A.6 (`:370`). §6 lists it under "Free, no identity" (`CHANNEL_LOOP.md:205`, `:235`) | yes: no gate |
| 4 algora-stripe | 7 (`:377`) | 15 (`:381`) | §4A.3 (`:385`); "the Stripe form stays in the owner's legal identity" (`:383`) | held (`:386-392`), with three `stopIf` rules (`:393-397`) |
| 6 ci-tokens | 8 (`:402`) | 18-23 (`:404`) | §4A.5 (`:408`); the early part: "Neither needs identity verification." (`:432`) | yes. Early part: `afterStep` "merge-pr", 8 minutes (`:430-435`). `GUMROAD_ACCESS_TOKEN` has `madeIn` "gumroad" and no gate (`:410`); `BRAND_GITHUB_TOKEN` and `ORG_BUDGETS_READ_TOKEN` have `madeIn` "github-org" (`:412-422`); `POSTHOG_READ_KEY` has `askedOnlyWhen` (`:423-428`) |

Lines each step unlocks: 1, 2 and 6 unlock all four lines (`:281`, `:310`, `:407`); 8 unlocks il-biz-tools only
(`:298`); 3 and 5 unlock il-biz-tools and pcn874 (`:332`, `:345`); 7 unlocks oss-bounties and pcn874 (`:369`); 4
unlocks oss-bounties (`:384`). [asm] The `lines` field is "Revenue line ids that cannot earn until this step is done."
(`:215`).
- [inference] Read literally, the `catalogueRef` doc "or null where it is not an identity step" (`:217`) makes steps 7
  and 6 identity steps, while §6 lists step 7 and 6a as "Free, no identity" (`CHANNEL_LOOP.md:205`). [NEW] The 7.9
  board calls the catalogue the "§4A identity step" list (`BOARD.md:196`), gives step 7's machine account as "email
  only, no KYC" (`:202`), and step 5 (the domain) also carries a catalogue ref (`owner-steps.ts:346`).

**How the gates work.**
- `isOwnerStepOpen`: a step is asked when it is "not done, not frozen, and not held by a pending precondition"
  (`:458-461`). The per-line asked, frozen and held lists are `:464-480`. `ownerStepsForLine` sorts by `order`
  (`:449-451`) through `ownerStepsInOrder` (`:439-442`).
- [NEW] The `precondition` shape: "While `metOn` is unset the step is HELD: it still gates its lines … but the report
  does not ask for it — it names it outside the asked-now list, with `short`" (`:244-254`). It is the only mechanism in
  the code for a "paid product is ready" gate. The only "paid product" text in `src/revenue/*.ts` is step 2's
  (`:314-316`) and the header's (`:49`, `:56`).
- [NEW] `openSetupItems` drops an item only once every one of its steps has a `doneOn` (`:564-575`, `isDone` at `:565`),
  and never consults `isOwnerStepOpen`. While step 4 is held, its 4b item still prints as a checkbox (REPORT `:84`) and
  on the dashboard page (the 4b `<li>`). [asm] The doc above it says "Every surface the owner reads uses this — the
  report's checklist and blockers, the board's decision and action lines, the dashboard" (`:556-563`).

**How `order` reaches the owner.**

| Surface | What it prints | In `order`? | Where |
|---|---|---|---|
| REPORT, "Blocked on" | "`${line.id} is waiting on the owner: steps ${askedNowList(line.id)}`", the not-asked note, then the open setup items | the step list and the note, yes | `runner.ts:469-478`; `askedNowList` from `openOwnerStepsForLine` (`:799-807`); REPORT `:61-64` |
| REPORT, per line | "Owner steps still open for …" and the not-asked note; then one checkbox per setup item (`:694`) | the step list and the note, yes; the checkboxes are in stored order | `runner.ts:681-696`; frozen and held steps sorted by `order` (`:888-896`); REPORT `:71`, `:75`, `:82`, `:87` |
| REPORT, held rows | "Not asked yet: …" | yes | `runner.ts:829-837`; REPORT `:68` |
| The owner-report script | "N asked now, min-max minutes in all", one numbered line per step; the early part as "may follow step ${afterStep}", an id (`merge-pr`) | yes | `owner-report.ts:251-255` (`ownerStepsInOrder`, `isOwnerStepOpen`, waiting lines, `ownerStepMinutes`), `:384-395`, `:390`; module doc `:10-13` |
| The dashboard page | each line's setup items | no: stored order; owner blockers dropped | `dashboard.ts:25`, `:79-84`, `:139` |
| The document | the code's order as text (`:68`), parsed by the test; the box's order (`:41-54`) | `:68` must equal `order` | test `:479-487`, `:517-542` |

- `grep -n -F earlyPart src/revenue/runner.ts` finds nothing: the runner never prints the early part.
- [NEW] `ownerStepMinutes` sums the whole steps' `minutes`, with no early-part offset (`owner-steps.ts:601-606`).
  `owner-report.test.ts:204-205` derives the asked list from `isOwnerStepOpen` and `ownerStepMinutes`, not from fixed
  numbers.
- Tick 64 found four steps asked now, "(8, 3, 7, 6)" (the tick-64 log `:12`), and "63-73 דקות, כולל Gumroad (צעד 3) וצעד
  6 כולו" (`:24`). The rerun gave the same (`:68`). `:24` closes "היישור הוא החלטה, לא תיקון של הכלי". [inference]
  10+20+15+18 = 63 and 10+20+20+23 = 73.

**The setup items** (`portfolio.ts`).
- apify-actors: one item, "(owner step 6; this half may be done straight after step 1)", `steps [6]`, `contextSteps [1]`
  (`:229-231`).
- il-biz-tools: the mailbox `[8]` (`:271-272`); part ד `[6]` (`:278-279`), with the comment "Second here, as in the ₪0
  order of docs/OWNER_STEPS.he.md (after step 8, before Gumroad)" (`:274-276`); Gumroad "in your legal identity" `[3]`
  (`:282-283`); Netlify and the `GUMROAD_ACCESS_TOKEN` paste `[6]` (`:289-290`).
- oss-bounties: `[7, 6]` (`:345-346`) and 4b `[4]` (`:352-353`).
- pcn874: `[3]` (`:386-387`), `[7]` (`:390-391`), and `[6]` with `contextSteps [5]` (`:394-396`).
- [NEW] A test pins il-biz-tools' item order: `items.map((i) => i.steps)` equals `[[8], [6], [3], [6]]`, "after the
  mailbox and before Gumroad (the ₪0 order)" (test `:913-917`). [inference] So the ₪0 order already binds this one
  line's checklist in code. No line has both a step-7 item and a step-6-early item, so no checklist places either ahead
  of step 7.

**What REPORT shows** (at `6229781`, generated 2026-10-07T20:33:58Z).
- Blockers at `:61-64`. "Owner steps still open": apify-actors "6" (`:71`), il-biz-tools "8, 3, 6" (`:75`),
  oss-bounties "7, 6" (`:82`), pcn874 "3, 7, 6" (`:87`).
- il-biz-tools' checklist runs mailbox, PostHog, Gumroad, Netlify (`:76-79`). The dashboard page lists the same four,
  and the 4b item under oss-bounties [NEW].
- The `POSTHOG_READ_KEY` row is "Not asked yet" (`:68`). "GUMROAD_ACCESS_TOKEN is not set" (`:52`). The ledger has
  "[none configured]" (`:51`). Page views are no_clock for il-biz-tools and pcn874 (`:56-57`).
- At `92e2a7c` (generated 16:48:59Z) the same lines sit one higher: `:60-63`, `:70`, `:74`, `:81`, `:86`, `:67`, `:52`,
  `:51` and `:55-56`.

**The two orders side by side** [asm: the assembler's table, from the files named in its cells]. The code's column is
`owner-steps.ts` unless named; §6's column is `CHANNEL_LOOP.md`; the box's column is `OWNER_STEPS.he.md`.

| Place | The code's `order`: step, minutes, identity, asked now | §6 (and the status report `:92-97`, `:111`) | The box (`:41-54`) |
|---|---|---|---|
| 1 | step 1, 2 min; consent, not identity; done | step 8, ~10 min (`:210`); under "Free, no identity" (`:205`); Outlook.com if Google asks for more than a phone (`:211`) | step 8, "כ-10 דקות", "חינם, בלי זהות" (`:42`) |
| 2 | step 8, 10 min; no identity step; asked | step 6 part ד, ~3 min (`:213`); "no card, no identity, nothing pasted" (`:219`) | step 6, the Apify and PostHog parts; PostHog "כ-3 דקות"; "חינם, בלי אימות זהות" (`:45-47`) |
| 3 | step 2, 60-90 min; §4A.1, with an ID ("עם תעודת זהות", `OWNER_STEPS.he.md:140`); held | the network setting, 2 min, a settings change (`:229-232`); not a code step | step 7, the GitHub organisation and the machine account (`:48-49`) |
| 4 | step 3, 20 min; §4A.2, ID front and back, proof of address, an Israeli bank; asked | step 6a, Apify, 5 min (`:233`) | step 6, the Netlify link, "אחרי צעד 7" (`:50-51`) |
| 5 | step 5, 10 min; §4A.4; frozen | step 7, 15-20 min (`:235-237`) | step 3: "פתיחת החשבון חינם"; no paid product before step 2 (`:52-53`); the box names no identity need |
| 6 | step 7, 15-20 min; §4A.6; asked | under "Only when a paid product is ready, and only after its cost is checked" (`:239`): step 2 (`:240-250`) | step 2, "רק כשמוצר בתשלום מוכן למכירה" (`:54`) |
| 7 | step 4 (4b), 15 min; §4A.3, the Stripe form in the owner's legal identity; held | step 3: "It needs identity: ID, proof of address and an Israeli bank account." (`:251-252`) | not in the list: 4b is described after it, held (`:56-58`) |
| 8 | step 6, 18-23 min (early part 8, after merge-pr); §4A.5, the early part needs no identity; asked | not in the list: step 5 frozen (`:255`), 4b held (`:263-265`); step 6's Netlify click only as item 3's alternative (`:231-232`) | not in the list: step 5 frozen (`:39-40`) |
| Asked now | 8, 3, 7, 6: 63-73 min (tick-64 log `:12`), step 3's identity check included | items 1-5: "about 30 minutes in all" (`:205`); 35-40 by the items [inference]; "בערך 38 דקות" in the status report (`:92`) | the box gives no total; "ארבעת הצעדים החינמיים שמבוקשים עכשיו" are step 8, the network setting, the Apify and PostHog parts and step 7, "כ-38" (`:547-550`) |

- [asm] §6 has no item for the rest of step 6: the Netlify link appears only as item 3's alternative (`:231-232`), and
  `ORG_BUDGETS_READ_TOKEN` is named as "(step 6)" inside item 5 (`:237`). The box places step 6's Netlify part fourth,
  and the document asks for the Gumroad token "כשצעד 3 בוצע" (`:363-364`).
- [asm] [inference] Under the code's gates without step 3, `ownerStepMinutes` would give 43-53 (steps 8, 7 and 6 whole).
  The free batch's own parts add to 33-38 without the network setting (10, 8 and 15-20), because only step 6's early
  part is in it.

### A(1) Which order binds?

**What each text says of its own order.**
- **The code.** "The `order` field is still the board's 7.9 ruling, and the tests still pin it. Re-sequencing is the
  board's call; until it re-rules, the ₪0 sequence lives in the document as text and says that it awaits the board"
  (`owner-steps.ts:57-59`). The field's doc: "Execution order, 1..8, as ruled by the boards: 1, 8, 2, 3, 5, 7, 4, 6"
  (`:205-206`); the field is `:208`, and `:439` repeats the order. `number` is "Deliberately NOT the execution order"
  (`:198-202`). The header asks to "batch every unavoidable step into ONE ordered checklist" (`:7-8`) and calls the
  code "the structure that document must not drift from, and the test parses the document to check that it has not"
  (`:27-29`).
- **The tests.** The order is pinned as `[1, 8, 2, 3, 5, 7, 4, 6]` (`:46-55`), and again under the title "keeps the
  board's pinned order: the ₪0 sequence is text until the board re-rules" (`:468-470`). The document must state the
  code's order (`:479-487`). [CORR] The box must run step 8, then step 6's Apify and PostHog part, then step 7, then step
  6's Netlify part, then step 3, then step 2, and must contain "ממתין לפסיקה" (`:517-542`). Step 8's order must stay below
  step 3's (`:572-573`), with the comment "Step 8 comes first in both orders".
- **The document.** "הסדר שלמעלה הוא ההמלצה שלי לפי הכלל שלך" (`:59`). The code's order "הוא ממתין לפסיקה מחדש של
  הדירקטוריון" (`:60-61`), and only a board ruling changes it (`:61-62`). [NEW] "בשני הסדרים — אף צעד לא מבקש ממך כסף"
  (`:62-63`). The code's order is stated as "1 → 8 → 2 → 3 → 5 → 7 → 4 → 6" (`:68`); the Apify token may follow "מיד
  אחרי צעד 1" (`:70`); and "עובדים לפי הסדר שבתיבה למעלה" (`:71`).
- **§6.** "order set by the loop board, 29.9 (b)" (`CHANNEL_LOOP.md:205`). [NEW] Part ד's place comes from ruling 7.10.
- **Fold notes, not rulings.** "until it rules, the batched list in §6 is what the owner is asked" (`CHANNEL_LOOP.md:407`,
  an Opus fold note), and the same in Hebrew at `logs/CHECKPOINT.md:21`.
- **What the owner was told.** "עכשיו, בחינם, בלי תעודת זהות, בערך 38 דקות, לפי הסדר:" (the status report `:92`), then
  step 8, part ד, the network setting, Apify and step 7 (`:93-97`). "אחר כך, לא עכשיו: Gumroad, צעד 3 … את שניהם אבקש
  רק כשמוצר בתשלום יהיה מוכן" (`:111`). "כסף ראשון עדיין ידרוש Gumroad ותיק עוסק פטור" (`:113`).

**The rulings behind each order.**
- **The 7.9 board** sat 2026-09-07 (`BOARD.md:3`). Decision 4 is §5 (`:188`). "Order, as ruled: **1 → 6a → 2 → 3 → 5 →
  7 → 4 → 6b.**", with its reasons, is `:208-210`. Gumroad is "keep, amended" (`:198`); 6a is "(5 minutes, immediately
  after step 1)" (`:201`). [NEW] [inference] The 7.9 ruling put 6a inside the order itself, ahead of 2, 3, 5 and 7. The
  code carries it only as a permission, `earlyPart.afterStep` (`owner-steps.ts:33-34`, `:430-435`).
- **The breadth board** sat 28.9 (`research/breadth/BOARD.md:3`). Q2: step 8 is asked "**now**, second in the free batch
  after the network allowlist" (`:89-90`), and "ordered second after `merge-pr` in the ask-now sequence" (`:435`). Its
  §6 edit: 1 the network allowlist, 2 step 8, 3 step 6a, 4 step 7, and "'Only when a paid product is ready': unchanged"
  (`:360-362`). [CORR] Step 8 is "second" in both places, but after different steps: in §6 after the network allowlist,
  which is not a code step, and in code after merge-pr. [NEW] This ruling puts 6a ahead of step 7 in §6. The code
  records it at `owner-steps.ts:78-83`, and "1, 8, 2, 3, 5, 7, 4, 6" entered the code in `8c09fb0`
  (2026-09-28T10:24Z; repo (git objects)).
- **The loop ruling (b), 29.9.** The heading is `:66`. "Step 8 moves to **first** in the free batch, stated once with
  the count" is `:68-69`; "order and information, not tone or frequency" is `:88`. Its §6 batch is "1 step 8 …; 2
  network allowlist (2 min); 3 step 6a Apify; 4 step 7 organisation" (`:103-104`), with no step 3. The summary row
  (`:499`) gives the next action "§6 reorder"; the amendment row (`:500`) is about the Mozilla harness only. The fold
  "§6 free batch order 8 → 1 → 6a → 7" is `:515` [inference: "1" is the old item 1, the network allowlist, per
  `:103-104`]. The fold "`docs/OWNER_STEPS.he.md` (+ PDF, `src/revenue/owner-steps.ts`): step 8 first among the free
  steps" is `:528`. A case-insensitive grep for "step 3" finds nothing, and "gumroad" appears only at an unrelated
  line. The code records this ruling as "text only — no step added, removed, renumbered or reordered in code"
  (`owner-steps.ts:90-91`).
- **Ruling 7.10.** "So the click is item 2, the network setting item 3" and "what binds is the gate, not the list's
  order" (`:196-198`). "It is not a ninth step. EIGHT holds; numbers and order are unchanged"; part ד joins the early
  part, `afterStep: "merge-pr"`, "asked now, in the batched free list" (`:229-231`). "**item 2 — after step 8 … and
  before the network setting**" (`:236`), [NEW] "with the Apify part (item 3 today) and step 7 following" (`:237`).
  [NEW] Fold 12: "the next owner summary carries the batched free list with part ד once, in §6's order (step 8; part ד;
  the network setting; the Apify part; step 7), never as a reminder" (`:831-832`). [NEW] `:122-123` quotes the loop file:
  "§6 is a single ordered list and a new owner step enters `owner-steps.ts` and the owner page only on a ruling" (now
  `CHANNEL_LOOP.md:523`).
- The code records the rulings of 4.10 and 7.10 as "no step added, removed, renumbered or reordered" (`owner-steps.ts:104`,
  `:116`).

**The loop's own rule for §6.** Step 10 of the protocol: "Rebuild §6 from the channel table. Only list steps that a
channel is actually blocked on." (`CHANNEL_LOOP.md:58`). [NEW] The loop board's design says the same, and adds "if it
changed, the report's per-line open-steps text follows (the branch's generator already lists them)"
(`BOARD-LOOP.md:38`).
- [asm] The channel table's column "Owner steps it waits on" (`CHANNEL_LOOP.md:131`) gives il-biz-tools "deploy route:
  ask 1 (network) or the Netlify click in 6b" (`:134`), and pcn874 "none for the free page; 2, 3, 6b, 5 for the paid
  builder" (`:135`). The code's `lines` names the lines that "cannot earn" without a step (`owner-steps.ts:215`).
  [inference] The two lists count different things: what a channel's free surface waits on, and what a line needs before
  it can earn.

**History** (repo (git objects)).
- The loop board's design batch (`BOARD-LOOP.md:197`), added in `01b8ecd` (27.9 22:27Z): step 2 (`:202`); step 3, "(20
  min, identity: ID photos, proof of address, Israeli bank)" (`:203`); the domain bought from the ₪200 float (`:204`);
  step 7 (`:205`). [asm] That commit precedes `9e75aff` (22:43Z), the commit that brought the ₪0 rule into MISSION.
- In `9e75aff`, §6's free list read "about 7 minutes in all": the network setting, 6a and 7
  (`git show 9e75aff:logs/CHANNEL_LOOP.md`, `:154-163`). "Only when a paid product is ready" is at `:165`, and step 3,
  with the same identity sentence, at `:169-170`.
- The box first appeared in `8788b8a` (authored 27.9 22:58Z, committed 23:30Z) in the order Apify, 7, Netlify, 3, then 2
  "רק כשמוצר בתשלום מוכן" (`git show 8788b8a:docs/OWNER_STEPS.he.md`, `:24-32`). The same commit wrote "Re-sequencing is
  the board's call" into the code. [inference] The box and §6 have disagreed about step 3 since 27.9.
- MISSION requires "one ordered checklist" (`:435`) and sets no order among the steps.

### A(2) Does `order` change to the ₪0 sequence, and does step 3's asked-now gate become "a paid product is ready"?

**What a change to `order` touches.**
- The values: `owner-steps.ts:276`, `:293`, `:305`, `:327`, `:340`, `:363`, `:377`, `:402`. [asm] The test requires them
  to be 1 to 8, each once (`:54`).
- The pins: the test `:46-55`, `:468-470`, `:572-573`, and `:479-487`, which matches the document's first arrow line
  of eight numbers (the regex at `:483`; today `OWNER_STEPS.he.md:68`) against the code. [CORR] `runner.test.ts` pins
  il-biz-tools' "8, 3, 6 (not asked now: …" at `:305`, and pcn874's "3, 7, 6" at `:247` and `:306`. Its comment `:528`
  and constant `:529-530` (`STEP_6_REACHED` = gumroad, github-org, ci-tokens) are confirmed.
- [asm] [inference] The box lists step 6 twice (items 2 and 4), and the code gives step 6 one place; the box's early half
  rides `earlyPart` today. Neither the box nor §6 places steps 1, 4 and 5 in their sequence: step 1 is done, step 4 is
  held and step 5 is frozen, and both texts say so beside their lists.

**Step 3's gate today.**
- No `precondition` and no `frozen` (`owner-steps.ts:324-336`): open (test `:393`), and in the asked lists of
  il-biz-tools and pcn874 (test `:149`, `:400`; REPORT `:75`, `:87`).
- [asm] The test pins the set of steps with a pending precondition to exactly `["algora-stripe", "tax-file"]` (`:451`).
  With step 2's precondition met, it pins pcn874's asked list to `[2, 3, 7, 6]` (`:455-466`).
- Step 2's precondition: `what` (`:313-314`); `short`, "only when a paid product is ready, after the official cost
  check" (`:315`); and "metOn stays unset until BOTH hold … Setting it is what makes the hourly report ask the owner for
  step 2" (`:316-319`). The document's step 2: "לא עכשיו, ולא לפני שבדקתי" (`:142`); it quotes the report's note
  (`:150`) and `metOn` (`:151-152`). Step 3 in the document: "שום מוצר בתשלום — גם לא מוצר ה-Pro — לא עולה שם למכירה לפני
  צעד 2" (`:193-194`).
- `research/measurements/step2-cost.md:3` is "MOSTLY SETTLED 28.9.2026". The status line is the note's own words (repo);
  the Bituach Leumi reading inside it is rendered via note [CORR grade]. A grep for "Tax Authority|רשות המסים|taxes.gov"
  finds 0 lines. Its `:40-41` adds a condition ("and a stranger has shown interest in one of the free surfaces"), which
  `:137-138` lacks.

**What gates step 3 in each text.**
- §6: under "**Only when a paid product is ready, and only after its cost is checked:**" (`:239`); step 3 "is free to
  open, and fees come only out of sales. It needs identity: ID, proof of address and an Israeli bank account."
  (`:251-252`). The 30.9 row 17 (d) text follows (`:252-253`).
- The status report: "את שניהם אבקש רק כשמוצר בתשלום יהיה מוכן" (`:111`).
- The document: the box lists step 3 among the free steps (`:52-53`); step 3's own ₪0 note (`:192-194`); table row 3 has
  no gate (`:605`), while row 2 has "רק כשמוצר בתשלום מוכן" (`:604`); `:547-550` leaves step 3 out of the four asked now.
- The breadth board's §6 fold kept "Only when a paid product is ready" "unchanged" (`research/breadth/BOARD.md:362`).
  That keeps step 3 there without naming it.
- MISSION's gate is cost-based (`:356-360`). It names "a paid product is ready" for step 2 only, and says platform fees
  out of a sale are not the owner paying.

**[asm] Rulings on when step 3 is asked** (repo; not in any clerk's list or the checker's).
- **The floors ruling, row 9 (28.9, il-biz-tools; committed in `e6c2469`, 2026-09-28T07:35Z).** Decision 2: the line
  moves to `measuring` on the day its netlify.app deploy is public, "(a ₪0 measurement surface needs no identity step;
  the Gumroad steps for the paid tier stay pending)" (`RULING-2026-09-28-floors.md:213-216`). Decision 3, M-reach at
  D0+56: under 5 stranger page views, "no owner step is asked on this line's account" (`:223-225`); at or above 100 a
  week over weeks 5-8, "the paid tier's owner steps (2, 3, 6b) join the ask batch as "a paid product is ready", with the
  reading attached" (`:225-228`).
- Its fold is a `killCriteria` string on il-biz-tools: "… 100/week or more over weeks 5-8 → the paid tier's owner steps
  (2, 3, 6b) join the ask batch" (`portfolio.ts:252`). `page-views.ts` computes the M-reach `pass` (`:414-415`, `:452`,
  `:511`); a grep of `page-views.ts` and `page-views-reader.ts` for "owner step", "ask batch" or "paid tier" finds 0
  lines. Nothing in `owner-steps.ts` reads the pass.
- **The documents ruling (30.9)** reads a second "between" as a pause: "the paid-tier steps (2, 3, 6b) are not asked on
  its account" (`RULING-2026-09-30-documents.md:243-245`).
- **Ruling 5.10 on VAT services** does not say when step 3 is asked. It keeps "Step 3's rule that no paid product, Pro
  included, goes on sale before step 2" (`RULING-2026-10-05-vat-services.md:295-296`), and records "no change" to
  `owner-steps.ts` and the document (`:421`).
- **The loop board's design** (27.9) foresaw step 3 before step 2: "if the owner completes step 3 (Gumroad) before
  confirming step 2, paid activation … is held and the owner is told why" (`BOARD-LOOP.md:75`).
- [inference] The floors and documents rulings name step 3's timing for il-biz-tools' paid tier only. No ruling found
  names it for pcn874, whose channel-table row lists 2, 3, 6b and 5 "for the paid builder" (`CHANNEL_LOOP.md:135`). The
  status report's "שעון 56 הימים מתחיל" (`:113`) is the clock whose reach read Decision 3 names.

**What "a paid product is ready" rests on.**
- No code defines it. Besides step 2's hand-set `metOn` (`owner-steps.ts:316-319`) there is no code gate for it.
- Pro is described as built, at ₪79 (`CHANNEL_LOOP.md:134`; the status report `:54`: "שכבת Pro ב-₪79. לא פורסם … מכירה
  בפועל צריכה גם Gumroad ותיק עוסק פטור"). No Gumroad product exists: `site.json` has an empty `productUrl` and
  `productId` and a null `priceCents` (`products/il-biz-tools/src/config/site.json:5-10`). pcn874 has no price
  (`products/README.md:9`, `:65`).
- The Pro product is created with step 3's token. `gumroad-pro-product.yml`: create (`:23-27`); enable "refuses unless
  state/colony/brand-mail.json shows the brand mailbox of owner step 8 configured and green" (`:34-38`); "nothing new.
  GUMROAD_ACCESS_TOKEN is already step 6" (`:56-57`); [NEW] "The owner mints it once at docs/OWNER_STEPS.he.md step 3
  and pastes it at step 6 … Until then Pro stays on 'בקרוב' and nothing can be bought." (`:114`). [asm] [inference] So
  if "ready" means "created on Gumroad", it cannot hold before step 3 is done.
- The cap "**6/6 — binding**" (`CHANNEL_LOOP.md:108`): "no new product whose launch needs an owner step starts until
  something launches" (`:113`). Both are in §2 (`:104`) [CORR].
- Both page-view clocks have a null `d0` (`state/colony/page-view-clock.json:3-4`; what `d0` means is `:2`).

**What step 3 is needed for.**
- `GUMROAD_ACCESS_TOKEN` appears in `.github/workflows/colony.yml:78`, `brand-mail.yml:311`, `gumroad-pro-product.yml:110`
  and `gumroad-pro-probe.yml:119`. The connector checks `isConfigured` (`src/revenue/connectors/gumroad.ts:28`) and reads
  `/v2/sales` (`:35`). The refund rate returns not_configured without the token (`src/revenue/heartbeat.ts:254-255`).
- Step 3 unlocks il-biz-tools and pcn874 (`owner-steps.ts:332`). Its own text: the account is opened with the brand
  mailbox, so "לכן צעד 8 בא לפני צעד 3" (`OWNER_STEPS.he.md:197-198`).
- After opening: "אחר כך יש להם ביקורת של 1–3 שבועות אחרי 3–4 המכירות הראשונות" (`:190`; no source at that line).

**What step 3 asks of the owner.**
- Identity: ID front and back, and an Israeli proof of address, "מאומת ממקורות Gumroad" with no pointer at that line
  (`OWNER_STEPS.he.md:202-203`); Israel and an Israeli bank (`:201`); the name and Support instruction (`:200`); "in your
  legal identity" (`portfolio.ts:282`, `:386`). MISSION: the consent "does not reach the owner's own clicks: identity,
  payout, and anything bought" (`:349-350`); never "answer an identity check" on our own initiative (`:437-438`).
- Cost: "free to open" in English is only at `owner-steps.ts:55` and `CHANNEL_LOOP.md:251` (repo-wide grep); the Hebrew
  equivalents are `OWNER_STEPS.he.md:52` and `:192`, where the pricing page "לא נשמר מכאן" (`:193`). No ruling says it.
  The fee is "12.9% + $0.80" (`:213`). Gumroad's fee article, as a note quotes it: "There are no monthly payments or
  other hidden charges." (`research/measurements/refund-law-il.md:1429`; rendered via note, `[against-bar]`; the capture
  was not opened). The pricing page is "Not fetchable: paused" (`:1510`).
- The documents ruling, row 17 (d): the Support-email guard is "an **instruction in step 3**; sales do not wait"
  (`RULING-2026-09-30-documents.md:274-276`; the RULING `:295-302`; fold 2 `:344-345`); "Not asks: … step 3's change is
  an instruction inside an existing step" (`:398-399`). As folded: `OWNER_STEPS.he.md:200`, `owner-steps.ts:331`,
  `CHANNEL_LOOP.md:252-253`, and `requireBrandAccount` (`products/il-biz-tools/scripts/gumroad-pro-product.js:511-529`).

**What a gate on step 3 would meet in the code.**
- [inference] A precondition on step 3 alone would take "3" out of the asked-now lists, and would leave the Gumroad items
  in the checklists (REPORT `:78`, `:88`) and on the dashboard page, as 4b's item stays today (REPORT `:84`).
- [CORR] A record of step 6 done before step 3 fails the build. `GUMROAD_ACCESS_TOKEN` has no gate (`owner-steps.ts:410`);
  `secretRowsPastedBeforeMade` (`:529-554`; why it matters, `:535-537`) is asserted `[]` on the checklist as recorded
  (test `:313-315`); and `heldRows` may name only gated rows (test `:979-988`, comment `:302-306`).

### A(3) Are step 6 part ד and the Apify half asked ahead of step 7 in the code?

**How the code holds them.**
- One field: `earlyPart`, "A half of the step that may be done earlier than its place in the order … Only step 6 has
  one" (`owner-steps.ts:219-226`). Its value: the Apify sign-up and part ד, `afterStep: "merge-pr"`, 8 minutes
  (`:430-435`). [NEW] The type is `{ what; afterStep; minutes }` with no `doneOn` (`:226`); `doneOn` exists per step only
  (`:243`).
- [NEW] The test pins it: only ci-tokens has one, `afterStep` is "merge-pr", `what` matches APIFY_TOKEN and PostHog, and
  the minutes are 8 (`:57-71`). `:154` pins step 8's `unlocks` to "first among the free steps".

**Where the early part reaches the owner.**
- The runner never prints it (the grep in A(0)). The owner-report module prints "may follow step merge-pr"
  (`owner-report.ts:390`).
- The apify-actors item says "this half may be done straight after step 1" (`portfolio.ts:229`; REPORT `:72`).
- il-biz-tools' checklist puts part ד second, before Gumroad (`portfolio.ts:274-279`, pinned at test `:913-917`; REPORT
  `:77`, and the dashboard page).
- Neither item places its part ahead of step 7, because no line lists both.

**What each text says of their place.**
- The 7.9 board put 6a inside the order (`BOARD.md:201`, `:208`).
- The 28.9 and 29.9 rulings put 6a ahead of step 7 in §6 (`research/breadth/BOARD.md:360-361`; the loop ruling
  `:103-104`).
- Ruling 7.10 put part ד ahead of both (`:236-237`), and called the binding thing "the gate, not the list's order"
  (`:198`).
- None of these orders `owner-steps.ts`.
- §6: part ד is item 2 (`:213`) and 6a item 4 (`:233`), with step 7 item 5 (`:235`).
- The document: the box's item 2 (`:45-47`). Step 6's ₪0 split: Apify "ראשון, כבר עכשיו"; part ד "גם עכשיו, באותה
  ישיבה"; Netlify "אחרי צעד 7"; the Gumroad token "כשצעד 3 בוצע" (`:361-364`). Part ב item 1 is "טוקן Gumroad — מצעד 3"
  (`:379`) [NEW], and Apify is "בלי אימות זהות" (`:380-381`). Part ד's heading is `:398` and its stop rule `:413`;
  [NEW] part ד is reported alone "כשהוא נעשה לפני השאר" (`:422`). Step 7: "בסדר המומלץ זה רק `APIFY_TOKEN`, ואת השאר
  מדביקים בצעד 6, שבא אחרי זה" (`:449-450`); Netlify is not yet linked "בסדר של כלל ה-0 ₪" (`:452-453`).
- The document's update header of 7.10: part ד "מבוקש עכשיו, יחד עם החלק של Apify ולפני הגדרת הרשת", and step 6 goes to
  18–23 (`:26`).

**Recording and minutes.**
- [inference] Nothing records the Apify half or part ד done apart from step 6 as a whole, and step 6 cannot be recorded
  done before steps 3 and 7 (A(2), last block). Until then the runner and the owner-report module keep asking step 6
  whole, at 18-23 minutes (tick-64 log `:24`: "וצעד 6 כולו").
- The early part is 8 minutes in code (`owner-steps.ts:430-435`). §6 gives part ד ~3 and 6a 5 (`:213`, `:233`). Step 6
  is "18 דקות" at `OWNER_STEPS.he.md:356` and in table row 6 (`:608`), against 18-23 in code (`owner-steps.ts:404`) and
  in the document's own `:26` and `:612`.

---

## Part C — What is not for this sitting, what no file holds, and housekeeping

**Not row 29's question.**
- [asm] **The network setting as a step.** It is not an owner step: the id union has eight ids (`owner-steps.ts:136-144`),
  and a grep of `owner-steps.ts` and `portfolio.ts` for network access or allowlist finds nothing. A new step "needs a
  decision, not a commit" (`:18-21`). The row does not ask for one.
- [asm] **Step 2's own gate and its sources** (`owner-steps.ts:312-320`; `step2-cost.md`). The row asks whether step 3's
  gate becomes "like step 2's"; it does not reopen step 2's.
- [asm] **Step 5's freeze and step 4b's hold** (`owner-steps.ts:349-358`, `:386-397`). Both stay outside the asked list
  in every text.
- [asm] **The proposed steps** 9, 12 and 13 and the other held items (`CHANNEL_LOOP.md:259-279`).
- [asm] **The repository's visibility** (`CHANNEL_LOOP.md:255-257`): the owner's open decision.
- [asm] **The owner-report build's open ends** (`CHANNEL_LOOP.md:407` items (2)-(5)).

**What a ruling would need that no file holds.**

*The first question.*
1. **A ruling on which order binds.** None re-rules `order` after the breadth board of 28.9.
   - `owner-steps.ts:57-59` defers to "the board". The document calls its box "ההמלצה שלי" (`:59`) and tells the owner to
     work by it (`:71`). `CHANNEL_LOOP.md:407` and `CHECKPOINT.md:21` say §6 is what is asked, as fold notes.
   - The nearest ruling texts are ruling 7.10's "what binds is the gate, not the list's order" (`:198`) and its fold 12,
     which sends the next owner summary in §6's order (`:831-832`). Both are about the batched list, not about `order`.
   - The protocol rebuilds §6 each tick (`CHANNEL_LOOP.md:58`), and the design says "the report's per-line open-steps
     text follows" (`BOARD-LOOP.md:38`).
   - MISSION requires "one ordered checklist" (`MISSION.md:435`) and sets no order among the steps.
   - No file revisits the 7.9 reason for step 5 before step 7 ("buy the name before creating the org", `BOARD.md:209`;
     `owner-steps.ts:35`) since step 5 was frozen. A repo-wide grep finds only those two lines.
2. **A reconciliation of the box and §6.** The box runs 8; Apify with ד; 7; Netlify; 3; 2. §6 runs 8; ד; the network
   setting; Apify; 7; then 2 and 3. The test pins only the box (`:517-542`) and the code's order (`:46-55`, `:468-470`,
   `:479-487`).
3. [asm] **A full ₪0 order of the eight steps.** No file states one. The box gives six items with step 6 twice; §6 gives
   five free items, one of them not a step, then 2 and 3; neither places 1, 4 or 5.
4. **A reconciliation of the minutes.** §6 says "about 30" (`:205`); its items add up to 35-40 [inference]. The document
   says "כ-38" (`OWNER_STEPS.he.md:549`), and so does the status report (`:92`); `:24` there records that the collector
   counted "כ-30 דקות" and the items add to 35-40 [CORR]. The code's asked-now total is 63-73 (the tick-64 log `:12`).
   Step 6 is "18 דקות" at `OWNER_STEPS.he.md:356` and `:608`, against 18-23 in code (`owner-steps.ts:404`) and in the
   document's own `:26` and `:612`.

*The second question.*
5. **When step 3 is asked.** [asm] [CORR of the checker's "No ruling or board text decides when step 3 is asked"]
   One ruling does, for one line: the floors ruling puts il-biz-tools' paid-tier steps (2, 3, 6b) into the ask batch at
   the day-56 reach pass, and asks none of them below 5 views (`RULING-2026-09-28-floors.md:213-216`, `:223-228`); the
   documents ruling repeats it for a second "between" (`:243-245`). No file found names step 3's timing for pcn874. No
   code carries it: step 3 has no gate (`owner-steps.ts:324-336`), and the ruling lives in a `killCriteria` string
   (`portfolio.ts:252`).
   - §6's placement dates from `9e75aff` (27.9), and the breadth board left that section "unchanged"
     (`research/breadth/BOARD.md:362`).
   - The box has listed step 3 among the free steps since `8788b8a`.
   - MISSION's gate is cost-based (`MISSION.md:356-360`).
6. **What "a paid product is ready" means.** [asm] [CORR of the checker's "Nothing defines when 'a paid product is
   ready' is met"] For il-biz-tools' paid tier, the floors ruling equates the ask with the reach pass
   (`RULING-2026-09-28-floors.md:227`). Nothing
   defines it for pcn874 or for step 2, whose `metOn` is set by hand (`owner-steps.ts:316-319`). Pro is described as
   built at ₪79 but is not created on Gumroad (`site.json:5-10`).
7. **A held step's setup items.** If step 3 gained a precondition, no file says what happens to its setup items.
   `openSetupItems` prints the items of held steps (`owner-steps.ts:564-575`; REPORT `:84` for 4b).
8. **Gumroad's cost and identity, at a better grade.**
   - That opening is free rests on two repo sentences (`owner-steps.ts:55`, `CHANNEL_LOOP.md:251`), the Hebrew
     `OWNER_STEPS.he.md:52` and `:192`, and one `[against-bar]` quote via a note (`refund-law-il.md:1429`). The pricing
     page was never captured (`:1510`).
   - The identity list ("מאומת ממקורות Gumroad", `OWNER_STEPS.he.md:202`) has no pointer at that line.
   - No file says whether Gumroad's identity check may be done before step 2. The box's order implies it is
     [inference]; the loop board's design foresaw it (`BOARD-LOOP.md:75`) [asm].
9. **Step 2's second source.** Step 2's precondition needs two official sources, and only one has been read. No Tax
   Authority page on the cost of opening the file is in the repo (`step2-cost.md` covers Bituach Leumi only).
10. [asm] **One meaning for "6b".** The 7.9 board's 6b is the Netlify link with the Gumroad and brand tokens
    (`BOARD.md:201`), and the floors ruling counts 6b among the paid tier's steps (`RULING-2026-09-28-floors.md:227`).
    §6 offers 6b's Netlify click now, as item 3's alternative (`CHANNEL_LOOP.md:231-232`), and the box asks step 6's
    Netlify part fourth among the free steps (`OWNER_STEPS.he.md:50-51`). No file reconciles them.

*The third question.*
11. **An early record.** In code, step 6's early part and part ד are not asked ahead of step 7.
    - They exist only as `earlyPart.afterStep: "merge-pr"` (`owner-steps.ts:430-435`), which the runner never prints and
      the owner-report module prints as "may follow step merge-pr" (`owner-report.ts:390`).
    - `earlyPart` has no `doneOn` of its own (`owner-steps.ts:226`). Nothing records the Apify half or part ד done
      before the whole of step 6, and step 6 cannot be done before steps 3 and 7 (test `:313-315`).
    - The 7.9 board put 6a inside the order (`BOARD.md:208`). The 28.9 and 29.9 rulings put 6a ahead of step 7 in §6
      (`research/breadth/BOARD.md:360-361`; the loop ruling `:103-104`). Ruling 7.10 put part ד ahead of both
      (`:236-237`). None of these orders `owner-steps.ts`.
12. **A code place for the network setting.** No code `order` exists for it, and the box omits it too
    (`OWNER_STEPS.he.md:41-54`).

**Housekeeping for the Opus fold, not rulings.**

*Pointer drift* (repo (git objects); the checker's, confirmed, and the assembler's where marked).
- Row 29's own pointers all hold at both trees (Part A).
- REPORT moved one line down between `92e2a7c` and `6229781`: `:60-63` → `:61-64`; `:70`, `:74`, `:81`, `:86` → `:71`,
  `:75`, `:82`, `:87`; `:67` → `:68`; `:55-56` → `:56-57`.
- In ruling 7.10:
  - `:145` and `:190` cite `owner-steps.ts:200-207` → `:219-226`. [NEW] `:146` cites `:411-416` for the early part →
    `:430-435`.
  - `:180` cites `owner-steps.test.ts:465` → `:469` (also `:50`).
  - `:189` cites `OWNER_STEPS.he.md:355-357` → `:361-364`.
  - `:155` cites `CHANNEL_LOOP.md:213-216` (the network setting as item 2) → `:229-232`, item 3. [NEW] [asm: at `:156`,
    not `:155`] It also cites `OWNER_STEPS.he.md:516-517` ("בלי מספר ברשימה הזאת") → `:547-548`.
  - [NEW] `:219` cites `owner-steps.ts:374-378` (step 4's `stopIf`) → `:393-397`.
  - [NEW] `:220` cites `owner-steps.test.ts:152-158` → the test at `:157`, its body `:158-160`.
  - [NEW] `:123` cites `CHANNEL_LOOP.md:478` → `:523`.
- `CHANNEL_LOOP.md:356` records step 2's range as `owner-steps.ts:283-304` → now `:302-323`.
- `CHANNEL_LOOP.md:250` cites `OWNER_STEPS.he.md:134`, `:149`, `:151`, `:160` → `:140`, `:155`, `:157`, `:166`, each +6.
  [CORR] At `:155`, reg 2(א)(1) names delivery by hand or through a listed professional, as `:250`'s gloss says.
- `RULING-2026-10-05-refund-state.md:353` (`:186-188`) → `:192-194`; `:350` (`:191-194`) → `:197-200`.
- The documents ruling: `:302` and `:344` cite `OWNER_STEPS.he.md:187-189` → the heading `:188`, the instructions
  `:197-200`; `:297` cites `gumroad-pro-product.js:448-462` → `:511-529`; `:346` cites `owner-steps.ts:316-321` →
  `:409-428`, and [NEW] `OWNER_STEPS.he.md:372-376` → the table, now `:385-391`.
- The loop ruling: `:82` cites `CHANNEL_LOOP.md:210` (npm, proposed step 9) → `:260`, and `:117` → `:134`. `:82` and
  `:108` cite `:118` → `:135` (`:117` is now the §3 heading and `:118` is blank).
- [asm] `CHANNEL_LOOP.md:26` says row 29's brief is "not yet built"; this file is that brief.

*Corrections the checker made to the clerks* (recorded so the fold does not re-introduce them).
1. Row 29's gloss "no re-sequencing of the code" on the loop ruling's `:66` and `:499` is not in the ruling; the words
   are the code's own summary (`owner-steps.ts:90-91`).
2. Row 29 credits the document with gating step 3 on a paid product. The box lists step 3 among the free steps
   (`OWNER_STEPS.he.md:52-53`) and table row 3 has no gate (`:605`); only §6 (`:239`, `:251`) and the status report
   (`:111`) gate it. `CHECKPOINT.md:21` repeats the claim.
3. Row 29, `CHANNEL_LOOP.md:407` and `CHECKPOINT.md:21` say `order` drives the dashboard. The dashboard uses only
   `openSetupItems` (`dashboard.ts:25`, `:79-84`, `:139`); only `runner.ts` and `owner-report.ts` consume `order`.
4. (A14) The inference that step 6 cannot be recorded done before step 3 is repo grade: test `:313-315` with `:979-988`.
5. (A26) The box's order is restated (A(1), "The tests").
6. (A29) In `runner.test.ts`, il-biz-tools is at `:305`; pcn874 is at `:247` and `:306`.
7. (A31) Step 8 is "second" in both places, but after different steps: the network allowlist in §6, merge-pr in code.
8. (A42) The status report's `:24` names the collector's count, not §6.
9. (C32) The range is `OWNER_STEPS.he.md:547-550`, not `:546-549`.
10. (C45) The sentence is at `CHANNEL_LOOP.md:113`, not `:112`, which is blank.
11. (C49) The grade: the step-2 note's status line is repo; its Bituach Leumi contents are rendered via note.
12. (C) The `:149` → `:155` mapping above.
13. (A) "Re-sequencing" is not only at `owner-steps.ts:58`: it is quoted at `FABLE_QUEUE.md:53` and `CHANNEL_LOOP.md:407`.
    "₪0 sequence" is also the test title at `owner-steps.test.ts:468`. No ruling, board or `docs/*.md` file holds
    either phrase.
14. (A) Code does put part ד or the Apify half early outside the owner-report module: il-biz-tools' checklist puts part
    ד second, before Gumroad (`portfolio.ts:274-279`, pinned at test `:913-917`, printed at REPORT `:77` and on the
    dashboard page), and the apify-actors item says "may be done straight after step 1" (`portfolio.ts:229`, REPORT
    `:72`). Neither places them ahead of step 7.
15. (C) A file does speak of Gumroad's review: `OWNER_STEPS.he.md:190` puts a 1–3 week review after the first 3–4 sales
    (no source at that line).
16. (C) Files do say whether step 6 could be recorded done without the Gumroad row: test `:313-315` and `:979-988` forbid
    it.
17. (C) "No product is priced": Pro is planned at ₪79 (`CHANNEL_LOOP.md:134`; the status report `:54`). No Gumroad
    product exists (`site.json:5-10`), and pcn874 has no price (`products/README.md:9`, `:65`).
18. (B, C) The breadth board's §6 fold kept "Only when a paid product is ready" "unchanged"
    (`research/breadth/BOARD.md:362`), which keeps step 3 there without naming it. [asm] The checker's "No ruling text
    names when step 3 is asked" is itself corrected in item 5 of "What a ruling would need that no file holds": the
    floors ruling names it for il-biz-tools.
19. (B) `9e75aff`'s author role is not shown in the repo; what is verified is that the text entered in that commit.

*Pointers and additions this brief corrected or made* [asm].
- The floors ruling's row 9 (`RULING-2026-09-28-floors.md:213-228`), its fold at `portfolio.ts:252` and the documents
  ruling's `:243-245`: a ruling text on when step 3 is asked for il-biz-tools' paid tier, missed by the clerks and the
  checker. It corrects two of the checker's "What no file holds" items (items 5 and 6 of that list). Beside them, ruling 5.10
  on VAT services (`:295-296`, `:421`) and the loop board's design (`BOARD-LOOP.md:75`).
- The channel table's owner-step column (`CHANNEL_LOOP.md:131`, `:134-135`), which §6 is rebuilt from, and the `lines`
  doc (`owner-steps.ts:215`).
- The test's precondition-set pin (`:451`) and its met-precondition pin (`:455-466`).
- Step 2's precondition lines given exactly: `what` `:313-314`, `short` `:315`, the `metOn` comment `:316-319`.
- `openSetupItems`'s doc names the dashboard among the surfaces it serves (`owner-steps.ts:556-563`).
- §6 has no item for the rest of step 6 (`:231-232`, `:237`); the box places step 6's Netlify part fourth.
- The box names no identity need for step 3 (`OWNER_STEPS.he.md:52-53`).
- Ruling 7.10's second citation of `OWNER_STEPS.he.md:516-517` is at its `:156`.
- The side-by-side table and the minutes under the code's gates without step 3 (A(0)) are the assembler's
  [inference].
- `MISSION.md:431-439` sets no order among the steps; the schedule line `CHANNEL_LOOP.md:26` still says "brief not yet
  built".
- The header's blocks, the labels of Part A and "How the three questions touch" items 1, 2 and 5.
