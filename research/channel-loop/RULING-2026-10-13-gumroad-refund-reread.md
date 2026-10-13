# Ruling — the late-refund re-read of Gumroad sales: once a UTC day, over the ledger's whole reach, its stop said steadily and reopened at the cap; a hand-booked Gumroad sale carries Gumroad's own time or is refused, and one no listing returns is placed on Gumroad's day by the colony, never by the owner; a refund and a fee go on their sale's line on every path, 13.10.2026 — `logs/FABLE_QUEUE.md` row 32

**Sitting.** 13.10.2026 ~07:11 UTC (this file begun ~07:15), the seat row 32 was given at tick 74 ("a free seat before
`enable` opens the Pro sale or `GUMROAD_ACCESS_TOKEN` is asked", `FABLE_QUEUE.md:56`), the first sitting since 12.10.
One decider: the deciding model of the sitting. No subagents, no web fetch, no connector, no `gh`, no live API call, no
git command that writes and no `git stash` in any form, no test run, no edit outside this file; the main thread folds on
Opus. The owner is "the owner", they/them. No name, login, address, token or real sale id appears here; the ids quoted
from the test suite are its own invented strings. `git status --short` printed nothing at the start, after
`git log --oneline -1`.

**Tree.** `c8ee637` on `claude/new-session-j071dx` (`git log --oneline -1`, read-only: tick 76's logs commit, "Actions
still disabled"). Every pointer this file rests on was re-opened at `c8ee637` with `sed -n`, `grep -n -F`/`-E`, `cat -n`
or `git log` (read-only) and is cited at the line seen there; the ones the row and the two build logs cite that moved are
under "Pointers that moved". GitHub Actions has been disabled on this repository since about 8.10 22:03 UTC (who disabled
it is not known; `logs/CHANNEL_LOOP.md:23`, "422 at 01:14"): no colony tick, hourly sync or CI has run since;
`GUMROAD_ACCESS_TOKEN` has never been set and the Pro sale has never been enabled, so none of the code read here has run
against Gumroad; the folds are proved locally (`scripts/verify.sh`), as the 11.10 and 12.10 folds were. Nothing here
assumes the stop is permanent.

**Read.** `MISSION.md` in full (493 lines); `logs/FABLE_QUEUE.md:1-24`, `:50`, `:54-56` (row 32 word by word);
`logs/2026-10-12-channel-loop-tick-74-late-refund.md` in full (327 lines: the builder's facts (a)-(c) `:34-70`, the design
`:72-90`, decisions `:115-131`, the open questions `:133-143`; the fixer's section `:191-327`, the blocking finding
`:205-224`, fix 2 `:231-235`, its open questions `:275-283`); `logs/2026-10-13-channel-loop-tick-76-refund-guard.md` in
full (303 lines: the probe `:61-63`, (a)-(d) `:88-134`, the open questions `:143-154`, the review's fixes `:203-298`);
`src/revenue/connectors/gumroad.ts` in full (540 lines); `src/revenue/heartbeat.ts:1-403` (the sync; `:404-863` by
heading); `src/revenue/connectors/types.ts` in full (74 lines); `src/__tests__/revenue/gumroad-connector.test.ts` in full
(1,083 lines); `src/revenue/ledger.ts:440-520` (`recordLedgerEntry`), `:596-700` (`gumroadHandRefundRefusal`,
`gumroadSaleFamily`), `:724-735`, `:791`, `:811`; `src/revenue/tools.ts:150-240`; `scripts/colony.ts:300-385`, `:86`,
`:143`, `:177-180`; `src/revenue/gumroad-verify.ts:1-40`; `src/revenue/runner.ts:65`, `:286`, `:363-369`, `:392-396`,
`:495-504`; `src/revenue/types.ts:67`, `:144-153`; `src/state/schema.ts:712-728`; `.github/workflows/colony.yml:1-35`,
`:70-95`; `.github/workflows/brand-mail.yml:62`, `:311`; `.github/workflows/gumroad-pro-product.yml:4`, `:34`, `:56`,
`:68-70`, `:110-129`; `research/measurements/refund-law-il.md:84-90`, `:120-133`, `:905-912`, `:968-976`, `:1440-1448`;
`products/il-biz-tools/scripts/gumroad-pro-product.js:110-130`, `:795-875`; `scripts/brand_mail.py:40-90`, `:185-200`;
`research/measurements/gumroad-license-decision.md:20-30`; `research/channel-loop/RULING-2026-10-05-refund-state.md` in
full (500 lines; §2.4, §3, §5(a), §6 item 5 bear here); `research/channel-loop/RULING-2026-10-11-ledger-sale-ids.md` in
full (504 lines; C1-C4, decision 6, "does not decide" 6); `research/channel-loop/RULING-2026-10-12-owner-step-order.md`
in full (551 lines, the house form); `src/__tests__/revenue/mutations/gumroad.json` in full (770 lines, 96 entries) and
`mutations/README.md:12`, `:15-16`, `:82-84`; `logs/CHANNEL_LOOP.md:19-28` (§0), `:309-313` (§8), `:454`, `:455-470`
(§9: the tick-74, tick-75 and tick-76 queued blocks), `:522-528` (§10); `logs/CHECKPOINT.md:1-30`; `scripts/loop-edit.mjs:1-60`;
`skills/revenue-il-biz-tools/SKILL.md:69`; `grep -rn -F "UPDATE revenue_ledger" src/ scripts/` (nothing).

**Grades.** `repo`: our own code, documents, rulings and logs, read at HEAD. `github via note`: a Gumroad source quoted
by a repo note (`refund-law-il.md`, `gumroad-license-decision.md`, the `gumroad.ts` header's `purchase.rb` and
`sales_controller.rb` lines); the note is the pointer, and nothing from GitHub is read here. `inference`: reasoning,
always marked. `none`: no source. There is no `rendered` or live grade in this ruling: nothing outside the repository was
read and no capture is cited.

**Standing rules applied.** MISSION first (`CLAUDE.md:4`). Rule 1: the owner's involvement is minimised and is not zero
(`MISSION.md:431-434`); "Never invent a step that isn't required" (`:436`); "The owner does not talk to customers"
(`:440`); "no selling, no talking, no camera, no manual ops" (`:211`). Rule 2: "A shekel counts when it is recorded in
`revenue_ledger` with a platform transaction id" (`:443-444`); a manager's screen "that can show a number nobody earned
is worse than no dashboard" (`:50-52`). Rule 3: decisions in code so an auditor can recompute them (`:450-451`).
Rule 4: honest value, nothing that deceives a buyer (`:455-459`). The ₪0 rule of 27.9 (`:352-360`): platform fees out of
a sale are not the owner paying. 28.9: owner steps named "once per summary, without nagging" (`:401-403`). Constraint 1:
"static output over servers" (`:123`). The 11.10 ruling's C1-C4 (the digest is the platform transaction id) and its
decision 6(2) (our own work sequenced before an existing owner step is not a new step). The 12.10 ruling §2: step 3 is
held until the day-56 PASS, and step 6's Gumroad-token row is "not asked yet" until step 3 is done.

**Money today.** ₪0.00 in the ledger (`CHANNEL_LOOP.md:27`); `revenue_ledger` holds 0 rows (tick-76 log `:81-82`, a
read-only read of `state/colony/colony.db`; RULING-2026-10-11 decision 5 for every committed version). Nothing in this
file is revenue, spends, fetches or publishes.

**Short names.** "The own listing" is `fetchSince`'s listing from the day before its cursor (`gumroad.ts:139-174`); "the
re-read" is `readLateGumroadRefunds` (`:242-313`); "an open sale" is a Gumroad sale the ledger holds with no `:refund`
row (`openGumroadSales`, `heartbeat.ts:292-304`); "unlisted" is a line of `LateRefundRead.unlisted` (`gumroad.ts:192-198`,
`:218-223`); "the guard" is `gumroadHandRefundRefusal` (`ledger.ts:622`); "the responder" is `respond-refunds` in
`scripts/brand_mail.py`; "the cap" is `MAX_LEDGER_SYNC_PAGES`, 500 pages of ten (`gumroad.ts:119`).

---

## 1. (1) How often: the re-read runs once per UTC day, at the first hourly sync of that day; the own listing stays hourly; a refused or looping re-read is tried again at the next sync, a complete or capped one is not; what it found and where it stopped is kept and said at every sync

**RULING.**
1. **The re-read runs at the first `runLedgerSync` of each UTC day** — the day of the sync's clock (`options.nowIso`,
   else `Date`, as `heartbeat.ts:262` and `:392` take it) — and at no other sync of that day. The own listing, the
   refund-rate read, the cursor and `verify-gumroad` are untouched: the sync itself stays hourly (`heartbeat.ts:75`;
   `colony.yml:27`).
2. **Its record is a kv row**, `revenue.gumroad_late_reread.last` (the shape `GUMROAD_REFUND_RATE_LAST_READ_KEY` has,
   `heartbeat.ts:153-176`): the day, the `after` it asked from, the pages and sales it read, the refunds it booked, its
   unlisted lines and its `problem`. It is written **after** the re-read, only when a listing was made, and only when
   that listing was complete or ran past the cap. A refused or looping re-read writes nothing, so the next hourly sync
   tries again (one request to the refused page; two for a loop, `gumroad.ts:536`) — the rule the own listing already
   has ("the next sync asks again from the same day", `:129`). A capped re-read is recorded: tried again hourly it
   would be 12,000 requests a day, the very thing the row names.
3. **On a sync where it does not run**, the sync says what the last re-read said: its `problem`, led by "last late-refund
   re-read, <day>: ", and its unlisted lines for sales still open and not returned by the own listing (once per sale per
   sync). So a capped or stopped re-read is a steady blocker in every report, never one that flickers for 23 hours.
   The skipped branch's own check (`gumroad.ts:285`, `:281`: an open sale the complete own listing should have returned
   by its day) still runs at every sync.
4. **Nothing else moves**: `after >= listedFrom` still asks nothing (`:285`); a sync with no open sale makes no listing
   and writes no record; `unlisted` and `problem` keep their words but for Fold 2's two changes.

**BASIS.**
1. *Today's cost and the lever.* The re-read lists at every hourly sync from the day before the oldest open sale
   (`gumroad.ts:272`, `heartbeat.ts:359-372`), one page per ten sales since that day (`:30-33`), under the cap (`:294`).
   Most sales are never refunded, so the oldest open sale is in effect the first sale on the account and the reach is
   the account's whole history. With N sales that is 24·⌈N/10⌉ requests a day hourly — 720 a day at 300 sales — and
   ⌈N/10⌉ daily. The reach may not be shortened (§2), so cadence is the one lever that misses nothing. [repo; arithmetic
   inference]
2. *When a refund lands.* The colony's own refunds happen at the responder's two runs, `17 5,17 * * *` UTC
   (`brand-mail.yml:62`), by `PUT /v2/sales/:id/refund` (`gumroad-pro-product.js:833-847`); Gumroad's own are
   discretionary and unscheduled (`refund-law-il.md:123-128`, github via note). The first sync of the UTC day (00:17 by
   `colony.yml:27`) reads both of the previous day's runs, 7 and 19 hours after them. A refund made at any hour is in
   the ledger within 25 hours. [repo; the lag is inference over the two crons]
3. *A delay is not a miss.* The ledger's windows are by `occurred_at` (`ledger.ts:729`); the supervisor reads them
   6-hourly, the board daily, the audit weekly (`heartbeat.ts:4-7`, `:74-79`); the Pro refund rate the board sees is
   read from Gumroad directly at every sync, not from the ledger (`heartbeat.ts:241-285`), so its hourly rhythm is
   untouched; the own listing's own lag is up to an hour. A bounded, self-correcting lag of a day on a row that then
   lands once is the kind of lag the hourly sync already has, not the overstatement rule 2 forbids. [repo; inference]
4. *The latest sale stays hourly whatever the cadence.* The own listing asks from the day before its cursor, the newest
   booked sale's day (`gumroad.ts:144-148`, `:160-166`), so on a slow line the most recent sale — the one a buyer is
   most likely to be asking about — is inside the own listing until the next sale arrives, and its refund is booked by
   the hour. Only sales older than the latest depend on the re-read. [repo; inference]
5. *The shared token and the unrecorded limit.* The token is the tick's (`colony.yml:77`), the responder's
   (`brand-mail.yml:311`) and the product job's (`gumroad-pro-product.yml:110`, `:129`); no rate limit is recorded —
   "Still no number anywhere … third-party pages say limits exist and are unpublished, and to back off on 429"
   (`gumroad-license-decision.md:25`, github via note; the row's `:25`, re-opened). A read that grows with the ledger
   and runs 24 times a day on the token that pays refunds is the exposure the row names; once a day it is the same size
   as `verify-gumroad`'s one read (`gumroad-verify.ts:21`). [repo]
6. *A day key, written after the run.* `dueByInterval` (`heartbeat.ts:100-109`) stamps before it runs and would stamp a
   refused re-read too. The record here is the re-read's own result, so it can be re-said (item 3), and the first sync of
   a UTC day is a fixed hour after both responder runs; a 24-hour interval would drift. The tests pin `Date`, so the day
   is testable (`gumroad-connector.test.ts:617-623`). [repo; inference]
7. *The report.* A tick's blockers are the sync's errors (`runner.ts:369`, `:495-504`), and a render prints the stored
   last sync's with a "last ledger sync, <time>: " lead (`:392-393`); a blocker that appears one hour in 24 would read
   as fixed in between. Item 3 keeps it true at every sync, which is what the capped line already promises ("this is
   said at every sync", `gumroad.ts:210-211`). [repo]

---

## 2. (2) How far back: the ledger's whole reach — the day before the oldest open sale — with no time window; a sale past the cap stays open and is said at every sync, with the created-day span of what was read, and that line reopens the question for a sitting; it is not closed and not read by another route

**RULING.**
1. **No window.** The re-read keeps asking from the day before the oldest open sale (`gumroad.ts:272`). No age closes a
   sale to it, and no bound is set now.
2. **Past the cap** (5,000 sales since that day, `:114-119`): the re-read books the refunds among the pages it read, is
   recorded (§1 item 2), and its stop is said at every sync. The stop line gains the first and last `created_at` day of
   the sales it read (as `verify-gumroad` names its `readBeforeStop`, `gumroad-verify.ts:21-23`), so the index's order —
   the one unrecorded fact that decides whether a rotation could ever progress — is on record from the colony's own run.
   The sales on the unread pages stay open; nothing closes them and nothing invents a route to them.
3. **That line is REOPEN 1.** The cap itself stays at 500 pages: not raised (no recorded limit to raise it against; 500
   requests once a day is already the colony's largest single read) and not lowered (nothing recorded argues a number).

**BASIS.**
1. *No recorded source bounds when a refund lands.* The period Gumroad applies — none, 7, 14, 30 or 183 days, 30 by
   default (`refund-law-il.md:85-89`, the row's pointer, re-opened; `MIN_REFUND_DAYS = 14` kept as the floor,
   `gumroad-pro-product.js:119-124`) — bounds the **request**, measured at the request: `insideWindow` is
   `t <= asked && asked - t <= days * DAY_MS` (`gumroad-pro-product.js:813-816`), "a request made on day 29 and read on
   day 31 is still inside" (`:864-865`). The responder reads requests up to `REFUND_LOOKBACK_DAYS = 60` after they came
   (`brand_mail.py:46-49`, `:197`) and retries a refund refused for balance "until it happens" (`:82-83`;
   RULING-2026-10-05 §5(a)2, `:282-283`). On a new account the first refund is that refund: one ₪79 sale credits about
   ₪65.93 and "two unpaid sales cover one refund" (`refund-law-il.md:1443-1447`; "If your balance is too low you will
   need to make additional sales", `:131-132`), so it waits for the next sale, which on a slow line can be months.
   Gumroad refunds "within 90 days of purchase, at its discretion" (`:123-124`) and handles disputes "in Gumroad's sole
   discretion" (`:127-128`); its API refuses only "Purchase is already refunded" (`:969`), no age. Every candidate bound
   in the record is a bound on something other than the refund. [repo; github via note]
2. *A missed refund is permanent; a wasted listing is requests.* Rule 2 and the manager's screen (`MISSION.md:443-444`,
   `:50-52`); the ledger holds the refunded money in every sum from then on (`ledger.ts:724-735`). `verify-gumroad`
   would show it as a refund-state finding (`gumroad-verify.ts:12-13`) but only when run, from a day before the oldest
   row under a 100-page cap (`:21-22`) — a shallower read, not a deeper one. §1 cut the listing's cost 24-fold without
   touching the reach. The row's own weighing comes out this way. [repo]
3. *No other route, and no chunking.* A licence verify needs the buyer's key, `GET /v2/sales/:id` the raw id the ledger
   does not keep (RULING-2026-10-11 C1), `?email=` the buyer's address the ledger never holds, a ping a server
   (`MISSION.md:123`) — the tick-74 builder's (c) (`:61-70`), confirmed at HEAD by the header (`gumroad.ts:33-35`). The
   index takes `after` alone; "no recorded source shows an upper bound the index accepts, or the order it lists sales
   in" (`gumroad-verify.ts:23-24`), so a listing from an old day necessarily reads everything after it. [repo]
4. *Why "closed with a recorded reason" is refused.* Closing an unrefunded sale to the re-read at an age asserts that it
   will not be refunded; the balance-retried first refund on this very account is the counter-example (basis 1), and
   the assertion would be made without a source. "Read by another route": none (basis 3). What remains is "stays open
   and reported" — made steady (§1 item 3) and informative (item 2). [repo; inference]
5. *How far away the cap is.* The reach is the account's lifetime sales (§1 basis 1). The best audited line ceiling is
   ₪1,500 a month and the home-turf group's ₪4,000-7,000 (`MISSION.md:96-97`, `:38-39`); at ₪79 a sale
   (`DEFAULT_PRICE_CENTS`, `gumroad-pro-product.js:114`) that is about 19 to 89 sales a month on the whole account, so
   5,000 sales lies between roughly 4.7 and 22 years out, and the colony will by then hold what no file holds today: the
   index's order (item 2) and Gumroad's behaviour under the daily read. A rotation designed now on an unrecorded order
   would be a guess that a test can only fake both ways (`gumroad-connector.test.ts:205-231` already runs both). [repo;
   arithmetic inference]

---

## 3. (3) A hand-booked sale no complete listing returns: prevented at the hand paths — a Gumroad sale booked by hand carries the time Gumroad made it or is refused; an existing one is closed by the colony placing it on the day Gumroad's own listing gives, through a command the tick's workflow can dispatch, never by the owner; the record of the closing is the row's own `occurred_at`, taken from the platform, with the old value in the committed history

**RULING.**
1. **Prevention.** `revenue_record` and `colony.ts record` refuse a `kind sale`, `source gumroad` entry whose
   `occurred_at` is missing, blank or not a time `Date.parse` reads, before anything is written — a sibling of the
   guard, called where the guard is called (`tools.ts:206-207`; `colony.ts:351-352`). The refusal says why: both
   reaches are taken from the ledger's day for the sale (`gumroad.ts:35-39`, `:237-240`; `heartbeat.ts:292-301`), and a
   sale dated at its booking lies where no listing returns it. The tool's `occurred_at` text and the CLI usage say the
   time is Gumroad's `created_at` for that sale, as `GET /v2/sales` returns it. Other sources and kinds keep their
   default of now (`tools.ts:177`, `:203`; `colony.ts:143`).
2. **Who closes an unlisted sale: the colony**, a session on Opus or the tick's own workflow — never the owner, who does
   no manual ops and never touches a customer or a sale (`MISSION.md:211`, `:440`); no owner step is added (`:436`).
3. **With what evidence, and what records it.** The sale is **placed** on the day Gumroad made it: the row's
   `occurred_at` — and that of its `:refund` and `:fee` rows, which the connector dates at the sale (`gumroad.ts:73`,
   `:82`, `:86`) — is set to the `created_at` of the one listed sale whose digest equals the row's stored id. The value
   comes from the live listing alone, never from a day typed by hand; the day typed only says where to list from. The
   command, `colony.ts place-gumroad-sale --id sha256:<hex> --listed-from <YYYY-MM-DD>` (the name is the builder's; the
   behaviour is this ruling's), lists through the shared pager under the sync's cap, writes only when exactly one listed
   sale matches and the listing was complete, prints the stored form and the old and new days and nothing else, and
   runs where the token is: a `workflow_dispatch` input of `colony.yml`, in the job that holds the token (`:77`),
   before the tick. After it the next re-read returns the sale and the unlisted line ends by itself; `verify-gumroad`'s
   `differing: day` on it ends too (`gumroad-verify.ts:10-11`). The old value stays in the history of the committed
   `colony.db` (`colony.yml:5-6`; RULING-2026-10-11 decision 3). This is the first write to an existing ledger row
   (`grep -rn -F "UPDATE revenue_ledger"` finds none at HEAD), and it is confined to one column, one source, one
   sale-family, a value the platform gives.
4. **The unlisted line's advice changes.** Today it says "Check it with verify-gumroad; if Gumroad reports it refunded,
   book the refund by hand as <id>:refund" (`gumroad.ts:221-222`). `verify-gumroad` lists from a day before the oldest
   **row**'s ledger day (`gumroad-verify.ts:21`; T69-V6), the same reach: for the very sale the line names it would report
   the row as unexplained, not its refund state. The line says instead to place the sale (item 3), after which its
   refund, if any, is booked by the next re-read.

**BASIS.**
1. *How an unlisted sale arises, and who makes one.* The tick-74 review's blocking finding: the hand paths date a row
   at now unless told otherwise (tick-74 log `:205-208`; `tools.ts:177`, `:203`; `colony.ts:143`), and both reaches
   start from the ledger's day (`gumroad.ts:35-39`). The connector dates every sale it books at `created_at` (`:73`), so
   only a hand booking — or the index ceasing to return a sale (REOPEN 4) — can produce one. The connector books every
   sale on the account from the token's first hour (`:93-96`, `:146`, `:163`), and no Gumroad sale can precede the token
   (the product is created with it, `gumroad-pro-product.yml:4`, `:56`), so a hand booking of a Gumroad sale is a
   correction of a listing gap a session found — with the listing in front of it, and so with `created_at` in front of
   it. Requiring the time costs that session nothing and removes the only ordinary way the case arises. [repo;
   inference]
2. *Why place the row rather than flag it or silence it.* A kv flag that excused the sale from the unlisted line would
   leave the reach where it is (the sale is the oldest open one, or the line would not fire) — a silenced gap, the
   defect this repo names first (`CLAUDE.md`, "verification-before-completion"). A kv day the reaches honour but the row
   contradicts is two truths: `sumWindow` (`ledger.ts:729`), the dashboard and `verify-gumroad`'s day comparison read
   the row. A row whose `occurred_at` is wrong is a wrong fact in the audit trail; correcting it from the platform's own
   record, with the history kept, is what an auditor re-deriving "from the raw ledger" (`MISSION.md:448-449`) would ask
   for. Rule 3's "the builder never edits the ledger's verdict" (`:453`) is about decisions; no amount, id, line or kind
   moves here. [repo; inference]
3. *Why the value may not be typed.* The guard family's whole design is that an id or a line a hand gives is checked
   against what the ledger or the platform holds (tick-76 log `:88-107`); a date a hand gives would be the one field
   that is not. The digest match is exact (`storedExternalId`, RULING-2026-10-11 C1), and `created_at` is Gumroad's.
   [repo; inference]
4. *Why the owner is not the closer and no step is named.* MISSION rule 1 and `:440`; a closing that needed the owner
   would be a cost at every stray booking, for a case the colony itself created. The command runs under the token the
   colony already holds in `colony.yml` (`:77`); the dispatch is the colony's hand, as `enable` is
   (`gumroad-pro-product.yml:34`). [repo]
5. *What the committed ledger holds today: nothing.* 0 rows (Money today), so no existing case; item 1 keeps it so.
   A hand booking whose id is mistyped is not placed (no digest matches) and stays reported and, in verify, unexplained;
   its remedy is a ledger-design question ("does not decide" 3). [repo]

---

## 4. (4) The refund's line: a refund and a fee go on the line their sale is booked on, on every path; the listing path changes

**RULING.** A `:refund` and a `:fee` of a Gumroad sale the ledger already holds are booked on **that sale's line**,
whichever path books them: the re-read (already so, `gumroad.ts:303`), the hand paths (already so, the guard,
`ledger.ts:666-672`), and now `fetchSince`. `runLedgerSync` passes `fetchSince` a resolver over every booked Gumroad sale,
`lineOfBookedSale(storedSaleId) → lineId | undefined` (built beside `openGumroadSales` from every `source = 'gumroad'`,
`kind = 'sale'` row, keyed as that function keys, `heartbeat.ts:297-301`), as a new optional field of the connector's
`fetchSince` params (`types.ts:36-41`); `fetchSince` books a listed sale's whole family on `lineOfBookedSale(saleId)` when
it answers, else on the line the product map or `GUMROAD_DEFAULT_LINE` gives (`gumroad.ts:163`). A sale not yet booked is
booked with its family on the map's line as today. `unmapped` keeps naming a product the map does not place (`:164`): the
family's line is the ledger's, and the board still maps the product. Stripe and Lemon Squeezy ignore the field. Nothing is
said when the map's line and the sale's differ: the ledger is right, and the map governs new sales.

**BASIS.**
1. *The disagreement, measured.* The tick-76 builder's probe: a sale booked with `GUMROAD_DEFAULT_LINE=line-b`, re-listed
   refunded under `line-a`, put the refund on `line-a` while the sale sat on `line-b` (tick-76 log `:61-63`, `:90-91`);
   the code at HEAD does exactly that (`gumroad.ts:161-167` with `gumroadSaleEntries`, `:76`, `:82`, `:86`). The re-read
   books on `booked.lineId` (`:303`; tick-74 decision 3, `:125-126`), the guard refuses another line and names the sale's
   (`ledger.ts:666-672`). Two paths follow the rule and one does not. [repo]
2. *Why the sale's line.* Board and supervisor decisions rest on per-line sums (`ledger.ts:724-735`, `:791`, `:811`;
   `heartbeat.ts:426-432`): a refund on another line shows one line's income without its refund and another's refund
   without income — the tick-76 builder's (b) (`:103-107`), with no recorded reason against. [repo]
3. *Why in `fetchSince` with a resolver, not in `recordLedgerEntry`.* A refusal inside the sync's loop would lose the
   rest of the pass (tick-76 (a)1, `:90-94`; `heartbeat.ts:348-351`, `:373-375`); a silent re-lining inside the ledger
   would be the ledger changing what it is told, which no auditor can see. The connector chooses the line; it is given
   the fact it lacks, as it is given `resolveLine` (`types.ts:39`). [repo; inference]

---

## 5. (5) Sequencing: Folds 1-5 are on `main` before `GUMROAD_ACCESS_TOKEN` is added to the tick's secrets; Fold 6 before `enable`; nothing waits for the first sale except the REOPEN checks, and nothing is asked of the owner

**RULING.** The cadence, its record, the line rule and the hand-sale time guard (Folds 1-5) are on `main` before the
Gumroad token is added to the tick's secrets — the same sequencing sentence RULING-2026-10-11 decision 6(2) put in the
checkpoint, extended by one clause; not a new owner step, and `owner-steps.ts` is not edited for it. The placement
command and its dispatch (Fold 6) are on `main` before `enable` opens the Pro sale, since an unlisted sale needs sales
to exist and the command needs the token to run. Nothing here waits on the first sale: the first real late refund, the
first capped line and the first unlisted line are the recorded checks (REOPEN 1, 3, 4), not preconditions.

**BASIS.** The first tick after the token books every sale on the account from 31 days back and runs the re-read from
then on (`gumroad.ts:93-96`, `:146`; `heartbeat.ts:359`); the line rule can bite from the first change of the product map
(`revenue_map_product`, `heartbeat.ts:789`), the time guard from the first hand booking. The token is step 6's Gumroad row,
"not asked yet" until step 3 is done, and step 3 is held until the day-56 page-view PASS (RULING-2026-10-12 §2 items 2
and 5), for which no D0 exists yet (`state/colony/page-view-clock.json`, per that ruling's basis 3) — so the folds precede
the token by the owner's own timetable, and the sentence only records it. `enable` is a later dispatch from `main`
(`gumroad-pro-product.yml:34`, `:68-70`) and already waits on step 8, step 2 and the fine print (RULING-2026-10-05 §6
items 1-4). [repo]

---

## 6. What the owner is told: nothing new, no message; one clause in the checkpoint's sequencing sentence

**RULING.** Nothing is sent and nothing is added to the next batched owner list. The checkpoint's standing sentence — the
Gumroad token is asked only once the 11.10 fold is on `main` — gains "and the 13.10 re-read folds (row 32)". The owner's
open question on GitHub Actions (`logs/CHECKPOINT.md`, (א)) rides the next summary as before.

**BASIS.** No money moved, no account or step is asked, no public surface changes; MISSION requires a message for none of
these, and owner steps are named "once per summary, without nagging" (`:401-403`). The token's timing is already the
owner's (§5), so the clause changes no date the owner holds. [repo]

---

## What this does not decide

1. **The day a late refund is booked at.** The re-read books the refund at its sale's `occurredAt` (`gumroad.ts:82`;
   tick-74 log `:137-138`: the sale object carries no refund time). The ledger's windows are by `occurred_at`
   (`ledger.ts:729`), so a refund of a sale older than 30 days enters **no** 30-day window of any line: the line's
   trailing net never sees it, while the lifetime sum and the closed month do (§9 tick-74 item (3) names the second half).
   The row asked cadence, reach, closing and line; this is a FABLE_QUEUE row of its own (Fold 11 names it), queued, not
   decided.
2. **Partial refunds, chargebacks, a `:fee` by hand, a refund above its sale, a refund of Gumroad money under another
   source before its sale is booked** — §9 "Queued 13.10 (tick 76)" item (2) and the tick-74 open items; `chargedback`
   is read for the KPI and booked as nothing (`gumroad.ts:45-47`, `:345`, `:391`). Each needs its own written rule.
3. **A hand-booked sale under a mistyped id** (§9 tick-76 item (2)): not placed (no digest matches), reported and
   unexplained for good; its remedy is a reversal or a removal in a ledger with no such path, a ledger-design decision.
4. **`verify-gumroad`'s own reach and cap** (a day before the oldest row, 100 pages, `gumroad-verify.ts:21-22`): it
   inherits the reach property this ruling leaves whole; a `--since <day>` option is housekeeping the builder may add
   with Fold 6, read-only, and is not required.
5. **The first read's 31-day window when the token arrives late** (`gumroad.ts:93-96`): a sale older than it is never
   booked by the sync; `verify-gumroad`'s "unbooked" count is the detector (RULING-2026-10-11 decision 2 item 8). Not this
   row's.
6. **Stripe's and Lemon Squeezy's refunds and lines**: no re-read and no line rule is applied to them (RULING-2026-10-11
   "does not decide" 2 stands).
7. **The `unassigned` line in `colony.ts record`** (§9 tick-76 item (4)) and **kind/suffix mismatches under source
   gumroad** (item (3)): untouched.
8. **The index's order and Gumroad's rate limit**: unrecorded (`gumroad.ts:17`; `gumroad-license-decision.md:25`); the
   design rests on neither, and REOPEN 1, 2 and 7 name what a record of either changes.
9. **The responder's schedule** (`brand-mail.yml:62`) and its token: RULING-2026-10-05's.

---

## REOPEN triggers

1. **The capped line appears** ("runs past 500 pages", with its created-day span): a sitting, with that span as the
   record of the index's order, decides a rotation, a higher cap or a split by product — not before, and not an Opus
   guess.
2. **A 429 or a refusal on the re-read in the same hour as a refused responder run, or the refund-rate read failing in
   the hour the re-read ran**: the shared token is being limited; a sitting moves the re-read's hour away from the
   responder's (`17 5,17`) or spaces the reads; the record is the two workflows' logs.
3. **The first real late refund** (the recorded check of fact (a), tick-74 log `:45`, `:142`): if the responder's log says
   refunded and the next day's re-read books nothing while the sale stays open, the premise that the listing reports a
   later refund in `refunded` fails; the design returns here.
4. **Unlisted lines for sales the connector itself booked** (dated at `created_at`): the index has stopped returning
   fully refunded purchases (the inherited premise, §9 tick-74 item (3)) — the placement command is not the remedy; the
   re-read's whole design is a sitting's.
5. **The first unlisted line, with Actions disabled**: the command cannot be dispatched; the line stays, honestly, until
   it can. No hand edit of the row.
6. **A ruling on the refund's date** ("does not decide" 1) moves the `occurredAt` the re-read books; the fold's tests
   follow it.
7. **A Gumroad text read under the loop's rules states a rate limit or the index's order**: the cadence and the cap are
   re-derived from it in one fold.
8. **A second Gumroad product on the account** (pcn874's paid builder): nothing here changes — the reach is the
   account's — but the arithmetic in §2 basis 5 is re-run with its price.

---

## Pointers that moved (row and build logs → HEAD `c8ee637`)

The row's four sources hold at their lines: `refund-law-il.md:85-89` (the five periods and the default; `:89` is the
API's five values) and `:122-128` (Gumroad's 90 days `:123-124`, the 30 days of silence `:125`, "sole discretion"
`:127-128`); `gumroad-pro-product.js:119-124` (`MIN_REFUND_DAYS`); `brand_mail.py:46-49` and `:82-83`;
`gumroad-license-decision.md:25`. The tick-76 log's `ledger.ts:616` for the guard is `:622` at HEAD (the review's fixes
added lines above it; `gumroadSaleFamily` `:681-688`; its `tools.ts:208-209` for the guard's call is `:206-207`, and
RULING-2026-10-11's `tools.ts:165` and `:176` for the tool's description and `occurred_at` text are `:164` and `:177`); its `heartbeat.ts:287-403` holds (`openGumroadSales` `:292-304`,
`runLedgerSync` `:306-403`); its `gumroad.ts:84-87`, `:188`, `:300-303`, `:303` hold. The tick-74 fixer's
`heartbeat.ts:355-367` is the block `:355-372`; its `gumroad.ts:242`, `:276-284`, `:285`, `:218`, `:169` and
`types.ts:23` hold. RULING-2026-10-11's `gumroad.ts:52-58` is history (the pre-fold connector; the family is `:74-86`
now). RULING-2026-10-05 §5(a)2 is at `:282-283` as the builder cites it. The mutation README's `gumroad.json` row is
`:15` and its timing row `:82`.

---

## Folds for Opus

Every fold is ₪0, on Opus, in one worktree with the base check first (`CLAUDE.md`, "Agent worktrees": `git log
--oneline -1` and `ls products/ src/revenue/`; `git reset --hard <branch>` if anything is missing); never `git stash`, in
any form, in any subagent. Worktree agents do not edit `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` or
`logs/FABLE_QUEUE.md` (the main thread applies Fold 11 with `scripts/loop-edit.mjs`). Tests first, in their own commit,
failing on the base. Before the push: `scripts/verify.sh src/__tests__/revenue` (typecheck, then vitest on the whole
revenue suite — `mutation-plans.test.ts` must see every new plan entry apply); merge with `scripts/merge-worktree.sh`.
No CI runs while Actions is disabled, so the local run is the proof, as for the 11.10 and 12.10 folds. Folds 1-5 are one
build (builder → adversarial reviewer → fixer) and go in together; Fold 6 may ride with it or follow, before `enable`.
Line numbers are HEAD `c8ee637`'s. Entry ids below say `T77-`; the builder uses its own tick's number if it is not 77.

1. **`src/revenue/heartbeat.ts` — the cadence and its record (§1).**
   - `export const GUMROAD_LATE_REREAD_LAST_KEY = "revenue.gumroad_late_reread.last"`; `export interface
     GumroadLateRereadLast { day: string; after: string; pages: number; read: number; refundsBooked: number; unlisted:
     Array<{ id: string; day: string; from: string }>; problem: string | null }`; `export function
     lastGumroadLateReread(db): GumroadLateRereadLast | null`, validating as `lastGumroadRefundRateRead` does
     (`:163-176`): a malformed row reads as none.
   - In `runLedgerSync`, inside the Gumroad branch (`:359-372`): `const day = (options.nowIso ?? new
     Date().toISOString()).slice(0, 10)`; `const last = lastGumroadLateReread(db)`; `const due = last === null ||
     last.day !== day`; pass `reread: due` and `carried: due ? [] : (last?.unlisted ?? [])` to `readLateGumroadRefunds`;
     after it, when `late.after !== null` and `late.stop !== "refused" && late.stop !== "looped"`, `setKv` the record
     (`day`, `late.after`, `late.pages`, `late.read`, the refunds recorded this pass, `late.unlistedSales`, `late.problem`);
     when `!due && last.problem`, push `` `${connector.source}: last late-refund re-read, ${last.day}: ${last.problem}` ``
     to `result.errors`. The errors from `late.unlisted` are pushed as today (`:367`).
   - `bookedGumroadSales(db): Map<string, string>` (stored sale id → line) over every `source = 'gumroad' AND kind =
     'sale'` row with a non-null id, keyed by `storedExternalId("gumroad", …)` as `:300` keys; `openGumroadSales` may be
     derived from it or stand beside it unchanged. Passed to `connector.fetchSince` as `lineOfBookedSale: (id) =>
     booked.get(id)` for the Gumroad connector only (Fold 4).
   - The header comment (`:1-11`) and the Gumroad branch comment (`:355-358`) say the cadence, the retry rule and the
     line rule, naming this ruling.
2. **`src/revenue/connectors/gumroad.ts` (§1, §2, §3 item 4, §4).**
   - `readLateGumroadRefunds` gains `reread: boolean` and `carried: ReadonlyArray<{ id: string; day: string; from:
     string }>`; with `reread === false` it makes no listing and returns as the skipped branch does (`:285`), `after:
     null`; in both branches `unlisted` is the union of its own lines and, for each carried sale still in `open` and not
     returned this sync and not already named, `unlistedSale(id, day, from)` with " (from the last re-read, <its day>)" —
     one line per sale per sync. `LateRefundRead` gains `stop: "refused" | "looped" | "too_many_pages" | null`, `pages:
     number`, `read: number` and `unlistedSales: Array<{ id; day; from }>` beside the lines.
   - `lateRefundStop` for `too_many_pages`: after "runs past ${pages} pages" add ", the sales read created ${first} to
     ${last}" (the first and last `created_at` day among the sales read, by date and not by listing order, as
     `gumroad-verify.ts` builds `readBeforeStop`; "no readable day" when none); the rest of the line unchanged.
   - `unlistedSale` (`:218-223`): replace "Check it with verify-gumroad; if Gumroad reports it refunded, book the refund
     by hand as ${id}:refund. Said at every sync while it has no refund row" with "Place it on the day Gumroad made it
     with colony.ts place-gumroad-sale, which takes that day from Gumroad's own listing; its refund, if any, is then
     booked by the next re-read. Said at every sync while it is open".
   - `fetchSince` (`:139-174`) takes `lineOfBookedSale?: (storedSaleId: string) => string | undefined` and books each
     listed sale's family on `(saleId && lineOfBookedSale?.(saleId)) ?? lineId`, `saleId` the stored form
     `gumroadSaleEntries` computes (`:74`; compute it once before the call, or have `gumroadSaleEntries` export a
     `storedSaleId(sale)` helper). `unmapped` (`:164`) unchanged.
   - The header (`:20-39`): the cadence (once a UTC day, the first sync; refused or looping tried again next sync; capped
     recorded and said at every sync), the reach kept whole and why, the line rule, the hand-sale time rule, this
     ruling's path.
3. **`src/revenue/connectors/types.ts`** — `fetchSince`'s params (`:36-41`) gain `lineOfBookedSale?: (externalId: string)
   => string | undefined` with a doc comment: "The line a sale already in the ledger was booked on, by its stored id: a
   refund or fee of that sale goes there, not on the line the product map gives at this sync (RULING-2026-10-13 §4);
   Gumroad only today." Stripe and Lemon Squeezy do not read it.
4. **`src/revenue/heartbeat.ts` — the line rule's wiring** is in Fold 1's third bullet; listed apart so the reviewer
   checks it: the resolver is built **before** `fetchSince` runs (as `openGumroadSales` is, `:338`), from the ledger as
   it stands.
5. **`src/revenue/ledger.ts`, `src/revenue/tools.ts`, `scripts/colony.ts` — the hand-sale time guard (§3 item 1).**
   - `export function gumroadHandSaleRefusal(input: Pick<LedgerEntryInput, "kind" | "source" | "occurredAt">): string |
     null` beside the guard (`:622`): `null` unless `kind === "sale"` and `source.trim().toLowerCase() === "gumroad"`;
     then, when `occurredAt` is missing, blank or `Number.isNaN(Date.parse(occurredAt))`, the refusal: "a gumroad sale
     booked by hand carries the time Gumroad made it — the sale's created_at as GET /v2/sales returns it — as
     occurred_at: the hourly sync's listing and its late-refund re-read take their reach from that day, and a sale dated
     at its booking lies where no listing returns it, so its refund could never be read (RULING-2026-10-13 §3). Nothing
     was recorded." No id in the text.
   - `tools.ts:206-207` and `colony.ts:351-352`: call it beside the guard, refuse the same way. `tools.ts:177` (the
     `occurred_at` parameter text), the description (`:164`) and `colony.ts:143` (`--occurred-at`) each gain one
     sentence: a gumroad sale's occurred_at is Gumroad's created_at and is required.
6. **`scripts/colony.ts place-gumroad-sale` + `src/revenue/gumroad-place.ts` + `.github/workflows/colony.yml` (§3 item 3).**
   - `placeGumroadSale(db, { id, listedFrom, token, fetchImpl, nowIso })`: refuse without a token ("not configured",
     exit 2, no fetch); `id` must match `STORED_EXTERNAL_ID_RE` with no suffix; `listedFrom` a real day (`isCursorDay`'s
     check, exported or duplicated); the ledger must hold exactly one `source = 'gumroad'`, `kind = 'sale'` row whose
     stored id is `id`; list through `listGumroadSalesSince({ token, after: listedFrom, maxPages: MAX_LEDGER_SYNC_PAGES
     })`; a listing that stops short is exit 3 and writes nothing; exactly one listed sale whose
     `storedExternalId("gumroad", String(sale.id))` equals `id`, with a readable `created_at`, or exit 3; then one
     transaction: `UPDATE revenue_ledger SET occurred_at = ? WHERE source = 'gumroad' AND external_id IN (?, ?, ?)` for
     the sale, `${id}:refund` and `${id}:fee` (rows from before the digest ruling, their raw ids, found by digest as
     `gumroadSaleFamily` finds them); print `placed ${id}: ${oldDay} → ${newDay}` and the family rows moved; exit 0;
     when the day already equals Gumroad's, print so and exit 0 with nothing written. Never a raw id, an address or the
     token in any line. `rendersOnly` (`colony.ts:177-180`) stays false for it: it writes.
   - `colony.yml`: a `workflow_dispatch` input `place_sale` (string, default empty, description "<stored id>
     <YYYY-MM-DD>: place one hand-booked Gumroad sale on the day Gumroad made it (RULING-2026-10-13 §3)"); a step before
     the tick, in the job that holds the token (`:70-79`), runs the command only when the input is non-empty and fails
     the job on exit 2 or 3. The usage text (`colony.ts:86-124`) gains the command.
7. **Optional, read-only:** `verify-gumroad --since <day>` to list from a given day instead of a day before the oldest row
   (`gumroad-verify.ts:21`); its help says why ("the reach a hand-booked sale may lie before"). Not required.
8. **Tests** (`src/__tests__/revenue/`), through the real `runLedgerSync`, `recordLedgerEntry`, the tick-74 suite's fake
   index and pinned `Date`; no test reaches Gumroad; every id and token invented:
   - `gumroad-connector.test.ts`, a new describe for §1: (a) two sales booked (day 1 on line a, day 5 on line b, cursor
     day 5, as `twoSalesBooked`); a sync at `2026-10-10T00:17Z` asks `["2026-10-04", "2026-09-30"]`; syncs at `01:17Z` and
     `12:17Z` the same day ask `["2026-10-04"]` only; a sync at `2026-10-11T00:17Z` asks both again; sale 1 flipped
     `refunded` at `2026-10-10T06:00Z` is booked at the `2026-10-11T00:17Z` sync, on line a, once, `-7900`; the kv record
     holds `day: "2026-10-10"` then `"2026-10-11"`, `after: "2026-09-30"`, `pages: 1`, `read` the count. (b) The re-read
     refused at `00:17Z`: the refused line in `errors`, no record written; the `01:17Z` sync asks both days and books the
     refund; the record is then written. (c) A looping re-read likewise (two requests, no record, retried next sync).
     (d) A capped re-read (`endless` from 2026-09-30) at `00:17Z`: 500 requests, `errors[0]` the stop line with "runs past
     500 pages, the sales read created 2026-10-01 to 2026-10-05" (the fixture's days), no token or id in it; the record
     written with `problem`; the `01:17Z` sync makes one request and its `errors` equal `["gumroad: last late-refund
     re-read, 2026-10-10: " + the same stop]`; `tick(...)`'s blockers carry it (as `:493-498` does); the next day's `00:17Z`
     sync re-reads (500 requests again). (e) A sale on the cursor's day flipped `refunded` is booked at the next hourly
     sync regardless of the record (the own listing's reach). (f) The hand-booked-late sale of `:866-895`: its unlisted
     line at the `00:17Z` sync and again, once, at `01:17Z` (carried; `errors` has exactly one line naming its digest);
     gone at the first sync after its refund is booked by hand; (g) after `placeGumroadSale` (Fold 6) moves its day to
     Gumroad's, the next re-read asks from the day before that day, returns it, and `errors` is `[]`.
   - `gumroad-connector.test.ts`, a new describe for §4: (h) a sale booked by the sync with `GUMROAD_DEFAULT_LINE:
     "fake-line-b"` on its own listing's day, then the next sync with `GUMROAD_DEFAULT_LINE: "fake-line-a"` lists it
     `refunded`: the `:refund` row is on `fake-line-b` and `fetchSince`'s own `entries` carried that line; a hand-booked
     sale (with a time) on line b without a fee row, listed by the own listing with `gumroad_fee > 0` under default line
     a: the `:fee` row is on line b; a new sale under default line a and an unmapped product still books on a and names
     the product in `unmapped`.
   - `ledger.test.ts`: (i) `revenue_record` with `kind: "sale", source: "gumroad"` and no `occurred_at` → `Error: a
     gumroad sale booked by hand carries the time Gumroad made it…`, 0 rows; with `occurred_at: "not-a-time"` → the same;
     with a time → "Recorded sale", dated at it; `source: "manual"` or `"stripe"` without `occurred_at` → recorded, dated
     now (regression); a gumroad `cost` without a time → unchanged behaviour; the description and parameter texts contain
     "created_at".
   - `colony-cli.test.ts` (`spawnSync`, as the tick-76 tests): `record --kind sale --source gumroad` without
     `--occurred-at` → exit 1, the refusal on stderr, the ledger unchanged; with it → recorded; `place-gumroad-sale`
     without a token → exit 2 and no fetch (an env with no token and a fetch that throws); with a fake fetch serving one
     sale whose digest is the hand-booked row's and `created_at` 2026-10-01T10:00:00Z, the row dated 2026-10-04 →
     exit 0, `occurred_at` of the sale and of a pre-booked `:refund` row both `2026-10-01T10:00:00.000Z`, stdout holds the
     stored form and both days and not the raw id or the token; no match → exit 3 and both rows unchanged; two listed
     sales matching (a fixture repeating the id) → exit 3; a listing refused at page 1 → exit 3; the command on a
     `rendersOnly` handle would throw on the write — asserted by the row changing.
   - `runner.test.ts` or the connector suite: a readOnly render after a capped re-read prints the carried stop with the
     "last ledger sync" lead (`:392-393`).
9. **Mutation plans** (`node scripts/mutate.mjs --check --plan <file>` first; run inside `scripts/sim-tree.sh`; the
   `README.md` rows and timing rows updated): **`gumroad.json`** gains T77-H1 `due` always true (the re-read at every
   sync; killed by (a)'s request counts); T77-H2 the record written on a refused re-read (killed by (b)); T77-H3 the
   record not written on a capped one (killed by (d)'s `01:17Z` request count); T77-H4 the carried stop not re-said
   (killed by (d)'s `01:17Z` errors); T77-H5 the day compared as the full ISO time (killed by (a)); T77-H6
   `lineOfBookedSale` not passed (killed by (h)); T77-H7 `bookedGumroadSales` built from open sales only (killed by (h)'s
   fee case on a sale whose refund is booked — add that case); T77-G1 `fetchSince` ignoring `lineOfBookedSale` (killed by
   (h)); T77-G2 `reread: false` still listing (killed by (a)); T77-G3 the span dropped from the capped line (killed by
   (d)); T77-G4 carried lines dropped (killed by (f)); T77-G5 a carried sale named twice in one sync (killed by (f)'s
   count); T77-G6 the unlisted advice text restored to "verify-gumroad" (killed by the hand-booked tests' exact line).
   **`ledger.json`** gains T77-L1 the time check removed; T77-L2 the guard applied to every source (killed by the stripe
   regression); T77-L3 the `Date.parse` check dropped (killed by "not-a-time"). **`colony.json`** gains T77-C1 the CLI
   not calling `gumroadHandSaleRefusal`; T77-C2 `place-gumroad-sale` writing when no listed sale matches; T77-C3 the
   new day taken from `--listed-from` instead of `created_at`; T77-C4 the family rows not moved with the sale; T77-C5
   the command writing on a refused listing; T77-T1 `revenue_record` not calling the sale guard. Every entry's `find`
   is checked with `--check` before the run, and `mutation-plans.test.ts` passes on the final tree.
10. **Docs and comments.** `skills/revenue-il-biz-tools/SKILL.md:69`: "refunds too" → "refunds too: within the hour for
    the latest sale, within a day for older ones (RULING-2026-10-13)"; `products/il-biz-tools/README.md`, beside the
    digest sentence the 11.10 fold added: one sentence that a refund made later is read once a day; `docs/CHAIN_OF_COMMAND.md:31`,
    after the digest clause: "; a refund or fee is booked on its sale's line on every path". `pnpm -s typecheck` after.
11. **Loop files (main thread, `scripts/loop-edit.mjs` only, after the merge).**
    - `logs/FABLE_QUEUE.md:56`: `set-status --row 32` "**DONE 13.10** (sitting ~07:11, one decider):
      `research/channel-loop/RULING-2026-10-13-gumroad-refund-reread.md` — the re-read runs once a UTC day at the first
      hourly sync (refused or looping ones tried again next sync, capped ones recorded in kv and said at every sync); the
      reach stays the ledger's whole reach, no window (no recorded source bounds a refund; the balance-retried first
      refund waits for the next sale); past the cap the stop and the created-day span of what was read are said at every
      sync and reopen the question for a sitting; a hand-booked Gumroad sale carries Gumroad's created_at or is refused,
      and an unlisted one is placed on Gumroad's day by `colony.ts place-gumroad-sale` from the live listing (the
      colony's dispatch, never the owner); a refund and a fee go on their sale's line on every path, `fetchSince`
      included; folds 1-5 before the Gumroad token, fold 6 before `enable`; nothing told to the owner. Folds: tick N
      (merge <sha>)."
    - `logs/CHANNEL_LOOP.md:462` (§9 "Queued 13.10 (tick 76)" item (1)): `replace-in-line` prefixing "**Ruled 13.10**
      (row 32 §4: a refund and a fee go on their sale's line on every path; `fetchSince` takes `lineOfBookedSale`;
      folds tick N): " before "the sync's own listing (`fetchSince`) books a refund". `:454` (§9 "Queued 12.10 (tick
      74)" item (1)): prefix "**Ruled 13.10** (`RULING-2026-10-13-gumroad-refund-reread.md`: once a UTC day, the whole
      reach, the cap a REOPEN, the hand-sale time guard and `place-gumroad-sale`; folds tick N): "; its item (3)'s
      "a late refund is dated at its sale, so it changes a month already reported" gains " — and enters no 30-day window
      of any line when the sale is older than 30 days; a FABLE_QUEUE row (the ruling's 'does not decide' 1)".
    - `logs/CHANNEL_LOOP.md:311` (§8): prefix "**Row 32 done 13.10** (`research/channel-loop/RULING-2026-10-13-gumroad-refund-reread.md`;
      folds from tick N); "; `:26` (§0's Fable cell): the 13.10 ~07:11 sitting, row 32 returned, one decider, no 429;
      `:23` and §10: the folds.
    - **A new FABLE_QUEUE row** (the next number) for the refund's date: reads `src/revenue/connectors/gumroad.ts:69-89`
      (`gumroadSaleEntries`, `occurredAt`), `src/revenue/ledger.ts:724-760`, `:791`, `:811`, the tick-74 log `:137-138`,
      this ruling's "does not decide" 1; question: "The re-read books a late refund at its sale's `occurred_at`. The
      ledger's 30-day windows are by `occurred_at`, so a refund of a sale older than 30 days enters no window of any line
      and the line's trailing net is overstated by it for good, while the lifetime sum and a closed month move. Rule the
      refund's date — the sale's, the sync's read time, or a third — given that the sale object carries no refund time
      (`refunded: stripe_refunded` is a flag)."; output: a ruling; fold: `gumroad.ts`, the connector tests,
      `gumroad-verify.ts`'s refund-state check and `mutations/gumroad.json`; seat: a free 07:11 seat, no brief needed
      beyond this ruling and the tick-74 log.
    - `logs/CHECKPOINT.md`: the sequencing sentence of RULING-2026-10-11 decision 6(2) gains "and the 13.10 re-read
      folds (row 32)"; the owner summary gains nothing (§6).
12. **The Hebrew log** for the fold tick, per `CLAUDE.md`; the sitting's own log is the main thread's.

**Checks before "done" (`verification-before-completion`).** `grep -n -F "gumroad_late_reread" src/revenue/heartbeat.ts`
prints the key and its reader; `grep -n -F "lineOfBookedSale" src/revenue/connectors/gumroad.ts src/revenue/connectors/types.ts
src/revenue/heartbeat.ts` prints the three sites; `grep -rn -F "UPDATE revenue_ledger" src/ scripts/` prints the one site in
`gumroad-place.ts` and no other; `node scripts/mutate.mjs --check` on the three plans exits 0; `scripts/verify.sh
src/__tests__/revenue` exits 0 by the runners' codes; the fold's diff greps clean for the owner's name pattern and for the at
sign; and this file still does.
