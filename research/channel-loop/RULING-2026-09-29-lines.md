# Ruling of the lines decider, 29.9.2026 — `logs/FABLE_QUEUE.md` row 15

**Sitting.** The 29.9.2026 Fable sitting, second of two agents (the first writes `RULING-2026-09-29-loop.md`). Model Fable
5.1, one decider, no subagents. Brief: `research/channel-loop/SITTING-2026-09-29-BRIEF.md` Parts B and C; every pointer
relied on below was reopened, and where the brief's paraphrase differs from the file, the file is what is cited.

**Standards.** Evidence before assertion. Grades as the brief defines them: `rendered` (a runner capture a session read),
`github` (code or docs read on GitHub; the pointer is the dated note that read it), `snippet` (a search-engine snippet),
`repo` (our own code or notes), `none`. Where the deciding fact is missing, the ruling is conditional and names the one
check.

**Hard constraints on everything prescribed here.** ₪0 spend (fees taken out of a sale are allowed, `MISSION.md:359-360`,
repo); no account in the owner's name; nothing public carrying the owner's name; no camera or selfie step; no per-item
owner action (`logs/CHANNEL_LOOP.md:75`, repo); no tiktok.com fetch (`CHANNEL_LOOP.md:245`, repo). The owner is referred
to only as the owner.

**Hashes the brief marked UNVERIFIED, verified today with `git show --stat`:** `bfaadc1` (29.9 00:44 UTC, the TikTok
NOW-actions merge: `gumroad-pro-product.js` +291 lines, the pricing FAQ, `enable` gated on the brand mailbox and a matching
offer); `a91d45e` (28.9, the pcn874 free validator page); `19f63cf` (28.9, brand-mail tooling, nothing sent). Working tree
at `ec3d259` on `claude/new-session-j071dx`, clean.

---

## 0. A reading the items depend on: what "charging for something already free" means

`MISSION.md:437-438` (repo): "Selling a feature that does not exist, or charging for something already free, is a
violation." The brief asks whether a feature is "already free" when other tools give it away and ours does not. This
ruling reads the rule as follows, and (a) and (f) apply it.

**Reading.** "Already free" means free *to this buyer, from us*: the buyer already has it, or the same site gives the same
thing away and then sells it, or the paid thing is the free input itself rather than work added to it. It does **not**
mean "some other vendor gives a comparable thing away". Basis:

- The rule was written from an incident of the first kind: the Pro tier once "advertised those free features as Pro and
  also promised branding that did not exist" (`products/il-biz-tools/README.md:512-516`, repo), and the README states the
  standard as "charging for something the buyer already has is a scam whatever the price" (`:515-516`).
- The mandate treats "free elsewhere" as an economics fact, not an honesty fact: constraint 8 says a line whose every
  input is public "has a price floor of zero" (`MISSION.md:204-215`, repo) and then names what to *build*, not what is
  forbidden. The apify line applies the same distinction in code: "anything ever charged for is the maintained,
  English-keyed normalisation and uptime — never the data itself" (`src/revenue/portfolio.ts:103`, repo).
- The other reading would bar every line the colony can build: by the owner's mandate every input is public
  (`MISSION.md:211-215`), free VAT calculators exist beside `vat.html`, and a free simulator exists beside the pcn874
  validator. A rule that forbids the whole portfolio is not the rule the owner wrote.

**What the reading still forbids.** Claiming a paid feature is unavailable free elsewhere when it is; selling the free
input itself; selling on one page what the same site gives away on another; a paid offer whose copy hides a stated
boundary. Those are the tests applied below. The G4 gate of the breadth board ("name one Pro feature that is free
nowhere", `research/breadth/BOARD.md:72`, repo) is a venue **admission** test about whether a listing can earn on a new
platform; it is not rule 4, and failing it does not make an existing offer dishonest.

---

## (a) il-biz-tools Pro: free nowhere else, at what price, or does it change or go?

**RULING.** Pro stays, unchanged in offer and price: one one-time ₪79 licence for the logo and accent colour on the
printed document, sold through Gumroad, read back from Gumroad, one fixed price and no price test; the offer is reframed
in the basis as the line's constraint-7 stranger-pays measurement, not as income. Whether an Israeli invoicing service
gives a logo free is not rendered; that check settles only the FAQ wording and A(a)'s trigger, never the offer's
existence.

**BASIS.**
- What Pro sells, exactly: "your logo and accent colour on the printed document"; everything else "free and stay free"
  (`README.md:510-516`; `invoice.html:143`, repo). The page makes no exclusivity claim: FAQ (a) opens "לא חייבים"
  (`invoice.html:237`, repo). Under §0 the offer is honest as worded.
- Free elsewhere, what is known: a logo on the invoice is free in four general AMO makers (`research/measurements/
  firefox-amo.md:132-137`, rendered from `amo-search-invoice.json`), none Hebrew or Israeli (`:114-116`, rendered); the
  accent colour is named by none of the 50 read (`:135-136`, absence in 50 of 281). YPAY advertises free digital invoice
  issuance on page one of the Hebrew SERP (`research/measurements/serp/2026-09-07-hebrew-calculators.md:94-96`, snippet).
  Whether any Israeli service includes a logo on a קבלה in a free tier is **not rendered** (`greeninvoice.co.il` returned
  403 to the runner, `research/tiktok/08-reads/hebrew-israel.md:54`, repo); it is the one check.
- Why keep it rather than drop it: the line is already planned at ₪0 with ₪400 contested (`portfolio.ts:394-408`,
  repo; `RULING-2026-09-28-floors.md:202-235`, repo), so the forecast ₪0 (`research/channel-loop/FORECAST.md:25`, repo)
  is already the plan. What Pro is *for* under the mandate is the measurement: "the first transaction id in the ledger is
  worth more than the next ten ceilings" (`MISSION.md:190-192`, repo), and Pro is the only paid offer whose rail, key
  minting, offer check and refund switch-off are built (`README.md:517-575`, repo). Dropping it would also make
  `pcn874.html:123`'s funding sentence false and remove the one paid line that can test whether a stranger pays. Its cost
  is ₪0 (Gumroad's cut comes out of the sale, `MISSION.md:359-360`).
- Why ₪79 and not another number: no source bears on the number (`research/tiktok/08-sales-marketing-lessons.md:344`,
  repo); Gumroad's take is about 22% at $9 and 17% at $19, so "nothing under $9 is worth listing"
  (`skills/revenue-il-biz-tools/SKILL.md:26-29`, repo); ₪79 is the price the script asks for and the page shows only what
  Gumroad reads back (`scripts/gumroad-pro-product.js:59, :204-229`, repo). ₪79 dates from the Paddle-era README
  (`research/owner-docs-audit/il-biz-tools.md:447-448`, repo) and no reading has ever tested it; changing an untested
  number to another untested number is not a decision, it is a guess. The number changes from a reading.
- The internal contradiction: `SKILL.md:65` says "test two prices and keep the better revenue per visitor";
  `README.md:551-552` and `readBackPrice` refuse any option that changes the charge (`gumroad-pro-product.js:204-223`,
  repo). The code is right: a static page with no measured traffic cannot read a price test, and two prices for one thing
  shown to different buyers is the shape §8.4 rejects. `SKILL.md:65` is struck.
- One honesty gap found on the way: the Gumroad product description says what Pro is and is not
  (`gumroad-pro-product.js:86-93`, repo) but does not carry the AI declaration every site page carries
  (`invoice.html:248`, `pcn874.html:123`, repo). The product page is a public brand surface; it gets the same sentence.

**APPLY.**
1. `skills/revenue-il-biz-tools/SKILL.md:65`: replace "test two prices and keep the better revenue per visitor. Annual
   before monthly, because of the fee floor" with "one fixed one-time price, read back from Gumroad and shown as read
   back; a price change is a board decision recorded in `TARGET_BASIS`, never a page experiment (RULING-2026-09-29-lines
   (a))".
2. `products/il-biz-tools/scripts/gumroad-pro-product.js` `productDescription()`: add the site's AI-declaration sentence
   as the last paragraph — `<p>האתר והכלים שבו נבנו ומתוחזקים על ידי סוכני בינה מלאכותית (AI) הפועלים מטעם המותג
   מהודק.</p>` — and assert it in `tests/gumroad-pro-product.test.js` next to the existing description assertions.
3. `src/revenue/portfolio.ts` `TARGET_BASIS["il-biz-tools"].basis`: append one sentence: "Pro (₪79 one-time, RULING
   2026-09-29 (a)) is kept as the line's stranger-pays measurement, not as income; its price moves only from a reading."
4. Queue one render dispatch (`scripts/queue-zero-test.mjs`): the pricing pages of Green Invoice / Morning, iCount, YPAY
   and Invoice4u, to settle whether a logo on a קבלה is in a free tier. `greeninvoice.co.il` was 403 to the runner; use a
   GitHub-hosted mirror or the search snippet as fallback. Result goes to `research/measurements/il-invoicing-free-
   tiers.md`. If a free tier includes a logo without an account, FAQ (a) on `invoice.html:237` gains one true sentence
   naming what Pro adds over it (the document never leaves the browser, no account); if the free tiers need an account,
   no wording changes. Either way the offer stands.
5. No change to `DEFAULT_PRICE_CENTS`, `site.json`, `tests/pro-faq.test.js`, `pcn874.html:123` or the Pro box.

**REOPEN IF.** (i) Gumroad refuses an ILS price on the first `create` run (`README.md:570-573`) — the currency, and with
it the number, return to a sitting with Gumroad's read-back in hand; (ii) the D0+56 M-reach read PASSES (≥100 views a
week over weeks 5-8, `RULING-2026-09-28-floors.md:223-227`) and eight further weeks pass with zero sales — the *offer*,
not the price, is then the question; (iii) the first sale lands — the board sets the target from the reading in the same
sitting (row 9, already ruled); (iv) the render in APPLY 4 shows a logo free without an account and the FAQ has not been
amended.

---

## (b) apify-actors: ₪200 `inferred` against its own "forecast ₪0" basis

**RULING.** Plan the line at ₪0, graded `inferred`, with **₪200** as the contested upper bound; the ₪1,500 leaves the
field and stays in the basis text as the figure the board refused. Same shape as row 9 for il-biz-tools. The committed
portfolio sum becomes ₪900.

**BASIS.**
- The contradiction is in one object: `ils: 200, grade: "inferred", contestedUpperBoundIls: 1500` (`portfolio.ts:380-382`,
  repo) beside "The line is kept as the constraint-7 instrument at forecast ₪0" (`:384`, repo). The floors ruling queued
  exactly this fix, "₪0 with ₪200 contested, and the day-30 stranger count as the reading that sets a number"
  (`RULING-2026-09-28-floors.md:312-314`, repo).
- Why ₪200 and not ₪1,500 as the contested figure: the field is printed beside the target in the report
  (`src/revenue/runner.ts:417-419`, repo). The ₪1,500 "rests on … an unverified marketing mean ($470/developer/month …
  a power-law MEAN and not in Apify's own documentation)"; the ₪200 "rests on the only real base rate anyone rendered:
  8.7 users per Actor" (`portfolio.ts:384`, repo). Printing ₪1,500 beside a ₪0 line would print the figure the basis
  itself discredits as the line's upper bound. The contested upper bound is defined as "a larger figure that exists in
  the evidence and that the board refused to commit to" (`RULING-2026-09-28-floors.md:210-211`, repo); ₪200 is that
  figure once the target is ₪0, and ₪1,500 is recorded in words, where its grade can be read.
- Nothing in the rules breaks at ₪0 before `live`: `rules.ts:84-89` (repo) escalates `target_unset` only on a live line,
  and the board then sets the target from the reading. The line is `awaiting_setup` (`CHANNEL_LOOP.md:116`, repo) and
  FORECAST puts ledger money by month 12 at about 1% (`FORECAST.md:24`, repo).

**APPLY.**
- `src/revenue/portfolio.ts`: `:151` `targetMonthlyAgorot: agorotFromIls(0)`; `:148-150` comment: "Board 29.9.2026
  (RULING-2026-09-29-lines (b)): planned at ₪0 as the constraint-7 instrument; ₪200 is the contested upper bound (the 8.7
  users/Actor base rate); ₪1,500 is the refused marketing-mean figure, recorded in the basis text only."
  `TARGET_BASIS["apify-actors"]`: `ils: 0`, `contestedUpperBoundIls: 200`; the basis text keeps its ₪1,500 sentences
  verbatim and adds "The target is ₪0 until the day-30 stranger count exists; ₪200 is the contested upper bound and
  returns only from that reading, never by being smaller."
- `src/__tests__/revenue/target-basis.test.ts`: `:107` `committedTargetIls()` → `900`; `:108` `portfolioTargetAgorot()`
  → `90_000`; `:111` `byId` → `{ "apify-actors": 0, "oss-bounties": 300, "il-biz-tools": 0, pcn874: 600 }`; `:122-123`
  the ₪2,200 identity becomes `committedTargetIls() + conditionalTargetIls() + il-biz-tools contested (400) + apify
  contested (200) === 2200`, with the comment updated; `:181-184` `apify.ils` → `0`, `contestedUpperBoundIls` → `200`,
  and add `expect(apify.basis).toMatch(/1,500/)` so the refused figure stays readable.
- Then `pnpm exec tsx scripts/colony.ts sync-portfolio` and `report`; `docs/INCOME_PLAN.he.md:60` "סכום היעדים
  המחויב: ₪1,100 (Apify 200, …)" → ₪900 (Apify 0, contested 200); grep `docs/` and `skills/` for "1,100" and fix prose
  the generator does not own.

**REOPEN IF.** The day-30 stranger count reads at or above 50 (`portfolio.ts:144`, repo) or a first payout statement
exists — the board sets a target from the reading in that sitting, graded by what it measures.

---

## (c) `staleDays: 21` on monthly-payout lines

**RULING.** Keep the default at 21 for per-sale rails; add a per-line `staleDays` override to `TARGET_BASIS`, resolved by
`policyForLine` exactly as `killFloorFraction` is, and set apify-actors to **45** (one monthly cycle of at most 31 days,
plus a 14-day margin so one late statement does not escalate). It bites only on a live line.

**BASIS.**
- The rule escalates a live line with no revenue for `staleDays` days (`src/revenue/rules.ts:141-152`, repo); the default
  is 21 (`src/revenue/types.ts:230`, repo). Apify invoices on the 11th and auto-approves on the 14th (`portfolio.ts:109-
  111`, repo; apify-docs, github per that comment), so a monthly-payout line would trigger `stale_revenue` between about
  day 22 and the next statement, every month. The floors ruling saw it and left it ("an escalation, not a kill; noted,
  not changed", `RULING-2026-09-28-floors.md:315`, repo).
- Every other line books per event: Gumroad books each sale by `sale.id` (`FORECAST.md:65`, repo), so 21 stays right
  for il-biz-tools, pcn874 and oss-bounties. The only monthly rail is apify-actors (`observable: false`,
  `src/revenue/rails.ts:99`, repo). No line is live (`CHANNEL_LOOP.md:25`, repo), so the change costs nothing today and
  saves one Fable item the month a line goes live — Fable sittings are what die when the quota does.
- The override pattern exists: `policyForLine` merges `killFloorFraction` from `TARGET_BASIS` (`portfolio.ts:450-458`,
  repo); every caller already goes through it (`src/revenue/heartbeat.ts:196, :258, :440`, repo).

**APPLY.**
- `src/revenue/portfolio.ts` `TargetBasis` interface (`:350-372`): add `staleDays?: number` with the doc comment "Days
  without revenue on a live line before `stale_revenue` escalates; set only for rails that pay monthly (apify: 45 = one
  cycle ≤ 31 days + 14, RULING-2026-09-29-lines (c))". `TARGET_BASIS["apify-actors"]`: `staleDays: 45`. `policyForLine`:
  merge `staleDays` when defined, alongside `killFloorFraction`.
- Tests: `target-basis.test.ts:244-251`: `expect(policyForLine("apify-actors").staleDays).toBe(45)` and
  `expect(policyForLine("il-biz-tools").staleDays).toBe(21)`; `rules.test.ts:132-136`: a live line with
  `daysSinceLastRevenue: 40` under `policyForLine("apify-actors")` holds, `46` escalates with `stale_revenue`; the
  existing 25-day escalation under the default policy stays.
- `types.ts:230` unchanged. Nothing in the report changes.

**REOPEN IF.** A monthly statement is booked (item (d)) and a live line escalates `stale_revenue` inside a normal cycle —
then the number is wrong and the statement dates say by how much.

---

## (d) Apify's $20 payout minimum against a trailing-30 floor

**RULING.** The connector, when pricing is admitted, books Apify's **approved monthly statement** (its invoice id, approved
on the 14th) as the revenue event, in the statement's currency, and books the PayPal or Wise transfer as a payout
reconciliation that is never counted twice. "Money lands" is read as the Gumroad connector already reads it: the platform's
own dated record of the earning, with its id. The $20 minimum then cannot empty a trailing-30 window. No code is written
now; the rail note records the rule so the connector is built to it.

**BASIS.**
- Facts: $20 minimum by PayPal or Wise, $100 by other methods (`portfolio.ts:109-110`, repo; apify-docs, github); the
  balance is forfeited after twelve months without KYC (`rails.ts:97`, repo); the floors ruling called the trailing-30
  window safe for monthly rails because "Apify's payout on the 11th-14th is always inside it"
  (`RULING-2026-09-28-floors.md:66-67`, repo) and its own open item admits a sub-$20 month pays out every second month
  (`:316-319`, repo). Rule 2: a shekel counts "when it is recorded in `revenue_ledger` with a platform transaction id"
  (`MISSION.md:422-425`, repo).
- The precedent that decides the reading: "The Gumroad connector books each SALE with `sale.id` as external id … so one
  ₪79 Pro sale is a ledger shekel the tick after it happens" (`FORECAST.md:65`, repo), although Gumroad holds funds seven
  days and pays out above a $100 balance (`owner-steps.ts:229`, repo). The repo's standard is therefore the platform's
  transaction record, not the bank transfer. Apify's approved statement is the platform's record that the developer earned
  the month's sum; the transfer is the rail's timing. Reading it the other way would make the Gumroad ledger wrong too.
- The ledger already requires an `externalId` for platform-mediated kinds and is idempotent on `(source, externalId)`
  (`src/revenue/ledger.ts:394-424`, repo), so a statement row and a later transfer row cannot collide if they carry
  different kinds and ids. Conversion: `toAgorot` uses a stored FX rate or a hard default of 3.6 (`src/revenue/money.ts:
  32-44`, repo; the default is grade none). A USD statement booked at a default rate would be a number nobody rendered.

**APPLY.**
- `src/revenue/rails.ts` `LINE_RAILS["apify-actors"].note`: append "LEDGER EVENT (RULING-2026-09-29-lines (d)): the
  connector books the approved monthly statement (invoice id, the 14th) as revenue in USD and the PayPal/Wise transfer as
  payout reconciliation, never both as revenue; the trailing-30 window therefore reads the statement, not the $20
  minimum."
- Before that connector is written (the pricing sitting, `scaleCriteria` 200 stranger users, `portfolio.ts:145`): render
  the Bank of Israel representative USD/ILS rate endpoint from a runner and have the connector call `setFxRate` from it,
  dated, so no USD row is converted at the 3.6 default. One ZERO-TESTS row, when that sitting is queued; not now.
- No code, no test now.

**REOPEN IF.** Apify's statement carries no stable id, or its docs show the approved statement can be reversed before
payout — then the statement is not a transaction record and only the transfer is booked, with `staleDays` re-derived
for a two-month cadence.

---

## (e) The T1 sub-brand name

**RULING.** Name it now, from an ordered list, by the brand check's own method extended with a Netlify probe; the first
candidate free on all four probes is the name for both the `*.netlify.app` host and, later, the YouTube channel. Order:
`chartexplained`, `plotnotes`, `axisnotes`, `dataplotted`, `linesandbars`. `tikufi` is excluded (it is the company's own
fallback). The brand Google-account conflict (one account for several venues vs a dedicated account) is **deferred** to
the row-16 sitting; nothing in the naming depends on it.

**BASIS.**
- The loop chooses the name (`research/channel-loop/BOARD-LOOP.md:118`, repo). It is a sub-brand "so a failed experiment
  does not sit on the brand's search results" and "the channel name is a sub-brand, not the company name"
  (`research/faceless-youtube/RED-TEAM.md:112-113`, repo), so host and channel share it. The host does not change the
  pre-registered number and a later 301 does not restart the clock (`PREREG-DECISIONS.md:518-544`, repo). The origin must
  be a bare lowercase `https://<name>.netlify.app` (`products/chart-explainer/netlify_files.py:43-45`, repo). T1 is in
  English for English-speaking strangers (`VERDICT.md:246`, repo). No candidate list exists (brief B(e); confirmed by
  grep of `research/faceless-youtube/` and `research/channel-loop/`).
- Criteria, from the brand list that produced the company name (`research/measurements/brand-candidates.txt:1-4`,
  repo): sayable, spelled one obvious way, no owner name, no claim the colony cannot back. For an English data-explainer
  the name should say what the page is; these five do, and none claims authority. `netlify.app` is on the Public Suffix
  List, so the host inherits nothing from other Netlify sites (`PREREG-DECISIONS.md:522-526`, rendered per that note).
- Why now and not at deploy: the protocol puts preparation first "so a parked channel launches the minute the owner
  acts" (`CHANNEL_LOOP.md:42`, repo); the deploy route is the only thing the web arm waits on (`CHANNEL_LOOP.md:121`,
  repo), and a name check is a runner job, not a build.
- The account conflict: `BOARD.md:96-98` (repo) gives the one step-8 Google account YouTube Stage A and Search Console;
  `RED-TEAM.md:110-112` (repo) wants T1's Google account dedicated. Both are about the account behind the channel, a
  YouTube question, and the brief's Part C already places it in row 16(c). Deferred there; the name is the same under
  either answer.

**APPLY.**
1. `research/measurements/t1-subbrand-candidates.txt`: the five names above, in that order, with this ruling as the
   header comment.
2. `scripts/brand-check.mjs`: add a fourth lookup, `netlify: https://<name>.netlify.app` — record the status only; a
   404 is read as free, anything else as taken or unknown (the "Site not found" reading is from memory, grade none, so
   the fold reads the first result before trusting it). `allFree` requires all four. Run it from `.github/workflows/
   brand-check.yml` with the candidates file as input; write `research/measurements/t1-subbrand-check.md`.
3. On the first all-free name: record it in `PREREG-DECISIONS.md` §3.5 (one dated line, "sub-brand host: <name>"),
   `T1-PROTOCOL.md` item 4, the identity kit (`VERDICT.md:385`), and pass `https://<name>.netlify.app` to
   `netlify_files()` in the deploy configuration. If none of the five is free, the loop writes the next five by the same
   criteria and re-runs; no owner action at any point. The owner may veto by saying so; nothing is asked.
4. Do not touch the Google-account wording in `BOARD.md`, `RED-TEAM.md` or `owner-steps.ts:195`; row 16 owns it.

**REOPEN IF.** The runner shows every candidate taken twice over, or row 16 rules that the T1 channel must not share the
step-8 account — then the identity kit changes, not the host name.

---

## (f) The pcn874 paid offer

**RULING.** A paid generator is honest to sell **only** as a one-time licence to a browser generator page whose offer
prints the boundary in GENERATOR.md's own words; **per filing period is rejected**; the free validator **may** be promised
to stay free in the words `invoice.html:143` already uses ("חינמי ונשאר חינמי"), never "לתמיד" or "לכל החיים". Nothing is
built or priced now: the paid page waits for the free validator page's D0+56 read to PASS the bar it rides on. The ₪600
target is not moved.

**BASIS.**
- The boundary: the validator "cross-checks no amount at all"; the refusal is "a statement about the file's shape and its
  counts — not about its totals being the ones your books hold"; it does not compute `reportedVat`; it promises no
  acceptance and names the Authority's free simulator (`products/pcn874/docs/GENERATOR.md:10-28`, repo). A boundary
  printed at the point of sale is a disclosed limit, not a defect; the work sold is real (the CSV hazards it refuses:
  a decimal comma read as ₪180,000, a split row, `README.md:83-85`, repo). Under §0 this is honest to sell **if** the
  copy carries the boundary. Without it, it is "selling a feature that does not exist".
- Already free? The Authority's simulator validates, it does not generate (`GENERATOR.md:25-28`). Six of nine SERP
  results are vendors whose paid software emits the file (`serp/…:271-277`, snippet) — free to their subscribers, not to
  the buyer. The generator's source is MIT in this public repository (`products/pcn874/package.json` `"license": "MIT"`,
  `"private": true`, repo), exactly as Pro's branding code is public (`README.md:540-541`, repo); the repo's accepted
  position is that the licence buys use on the page, and that stands. What must not happen: publishing `generate` in the
  free npm core while selling the same generator on the page without saying so. The free core the basis names is the
  validator (`portfolio.ts:276`, `:285` "npm downloads of the free core", repo); `generate` stays out of the published
  package until the paid page exists, and the paid page's FAQ then says the source is open — the repo link only after
  step 7 (`08-sales-marketing-lessons.md` §8.4 "Linking the repo … before step 7", repo).
- Per period: a per-filing-period licence is a recurring charge by another name. The product script refuses memberships
  and recurring prices (`gumroad-pro-product.js:204-223`, repo); the licence classifier revokes on a subscription end
  (`research/measurements/gumroad-license-decision.md:81`, repo); a per-period key would need new code and would sell a
  promise across periods the colony's own kill rules cannot guarantee (§8.4 "לכל החיים", repo). One-time, as Pro.
- "Stays free": the precedent is `invoice.html:143`; the TikTok note held "ונשאר חינמי" for this ruling
  (`08-sales-marketing-lessons.md:649-651`, repo). The validator is the line's acquisition channel by design
  (`portfolio.ts:276`, repo) and the free core is MIT, so "stays free" is structural, not a hope. "Stays free" is not
  "stays up"; the words chosen say the former.
- Why nothing now: nothing is priced (`products/pcn874/README.md:7`, repo); the page-view KPI is not wired
  (`CHANNEL_LOOP.md:118`, repo); BBU is 6/6 and binding (`:91, :96`, repo); constraint 7 orders "the first thing built on
  any line is the cheapest test that a stranger can find it", not the product (`MISSION.md:188-190`, repo). The pcn874
  page rides il-biz-tools' deploy (`CHANNEL_LOOP.md:118`), so its reading is the same D0+56 M-reach read
  (`RULING-2026-09-28-floors.md:223-227`, repo). The SERP note's own advice: "publish the free validator, count who
  downloads it" (`serp/…:277`, snippet-grade note, repo advice).
- The ₪600: its basis says month one ₪0, band ₪300-600 (`portfolio.ts:430-442`, repo); it does not say "forecast ₪0", so
  the row-9 contradiction is absent and no retarget is queued. It moves at the reading.

**APPLY.**
- `products/pcn874/README.md:7`: after "no price is set", add "A paid offer, if any, is a one-time licence to a browser
  generator page and is priced only after the free validator page's D0+56 read passes (RULING-2026-09-29-lines (f));
  per-period pricing is rejected; the published free core is the validator."
- `src/revenue/portfolio.ts` `TARGET_BASIS.pcn874.basis`: append "Pricing gate (RULING-2026-09-29-lines (f)): one-time
  licence only, boundary printed at the point of sale, no price before the D0+56 PASS of the validator page."
- `products/il-biz-tools/pcn874.html:123` FAQ "למה הבודק חינמי?": the answer may now say the validator "חינמי ונשאר
  חינמי" (same words as `invoice.html:143`); the funding sentence stays as it is until a generator is priced, when it
  must change (it would otherwise be false). `tests/pcn874-page.test.js`: assert the phrase and assert the page carries
  no "לתמיד" / "לכל החיים" and no price.
- No Gumroad product path, no page, no FAQ about a generator now. `TARGET_BASIS.pcn874.ils` unchanged.

**REOPEN IF.** The D0+56 read PASSES — the pricing sitting then sets the number from the reading and reviews the boundary
copy; or the read shows under 5 stranger views — the paid offer is closed with the line's pause, not built.

---

## (g) Accountants as a segment: Appendix B or not

**RULING.** Do not build Appendix B. The page's honest line stands ("a representatives' file is named as unsupported").
Reopen only on a demand signal that costs nothing to collect: a written request from a representative reaching the brand
mailbox, or Appendix-B refusals counted on the validator page once its counter is on (an anonymous event, no file
content).

**BASIS.**
- Appendix B is the "Structure of file for consecutive multiple user reporting by representative", an initial entry with
  the representative's VAT number and summary entries counting users and accounting entries
  (`research/rendered/pcn874-gov-il-874-eng.txt:194-215`, rendered). The page says it is not checked
  (`pcn874.html:124`, repo). N15 keeps accountant copy honest and §8.4 rejects pitching the tool for representatives'
  files (`08-sales-marketing-lessons.md:686`, `:757`, repo).
- Demand: none is read — no page views, no count of accountants (brief B(g), confirmed: the counter is off,
  `CHANNEL_LOOP.md:118`). The one market fact points the other way: representatives file many clients and are the buyers
  most likely to already own software that emits the file (six of nine SERP results, `serp/…:271-277`, snippet).
- Caps: builds in flight ≤ 1 and BBU 6/6 (`CHANNEL_LOOP.md:91-93`, repo); constraint 7 puts the stranger test before
  inventory (`MISSION.md:188-190`, repo). Appendix B changes the buyer, so it is a second product's first build, not a
  feature of this one.

**APPLY.** No change to `products/pcn874/` or the page. When the page-view counter is wired (already required by
`CHANNEL_LOOP.md:118`), `assets/page-pcn874.js` sends one anonymous event `pcn874_appendixB_refused` when a file is
refused for an `A` initial entry — the event carries no field from the file; `tests/pcn874-page.test.js` asserts the
payload shape. `research/owner-asks/questions.json` is not touched.

**REOPEN IF.** A representative writes to the brand mailbox asking for it, or the counter shows Appendix-B refusals in
two consecutive weekly reads once the page is public. Either is a reading; a board then decides.

---

## (h) The refund policy for the Pro licence

**RULING.** Do **not** set "no refunds". Keep a bounded refund window of at least 14 days — Gumroad's 30-day default as
it stands, so no policy call is needed — and change the gate: `enable` refuses unless (1) Gumroad's policy in effect is a
bounded period ≥ 14 days, (2) the deployed page shows that period in the A1 line, read back from Gumroad exactly as the
price is, and (3) the brand-mail probe reports a scheduled refund responder. The page names Gumroad's policy and no law.
The primary text of חוק הגנת הצרכן 14ג(ד) is the one check; until it is rendered, ≥ 14 days is the option that is lawful
under both readings the repo holds.

**BASIS.**
- Facts: `enable` refuses unless `refund_period === 'none'` (`gumroad-pro-product.js:334-365, :437-448`, repo); a new
  account defaults to a 30-day guarantee (`RefundPolicy::DEFAULT_REFUND_PERIOD_IN_DAYS`, `:336-338`, github per the
  script's 29.9 read); "no refunds" is one `PUT /v2/refund_policy` (`logs/2026-09-28-tiktok-now-actions.md:354`, repo).
  The page makes **no** refund statement (grep of `products/il-biz-tools/*.html`; `invoice.html:168` says a refunded
  payment switches branding off, repo). Refunds can be issued by API through `edit_sales`
  (`08-sales-marketing-lessons.md:390-408`, github, "has not been run"); that needs step 8, a responder and a balance
  (`:402-407`, repo). Gumroad is the merchant of record (`invoice.html:242`, `README.md:38`, repo). Gumroad's period
  values seen in the repo's own test are `7`, `14`, `30`, `183` and `none` (`tests/gumroad-pro-product.test.js:309`,
  repo, from the author's Gumroad read).
- Israeli law, all secondary (`research/colony-sweep/scouts/risk-governance--consumer-protection.md:14-27`, repo): the
  sources disagree on whether "information" is excluded from distance-sale cancellation outright or only once packaging
  is opened (`:40-53` vs `:100-112`); they agree on a 14-day refund, a fee cap of 5% or ₪100, disclosure "on invoices,
  receipts" and the homepage, and channels the seller cannot limit (`:59-72, :88-90`). One rendered store's terms make
  cancellation "subject to the consumer protection law" and allow return of digital content only if defective or unused,
  with the 5%/₪100 fee (`research/rendered/indiebook-terms.txt:85-97`, rendered) — one store's reading, not law.
- The lawful-by-default argument: under the "excluded" reading both options are lawful; under the "not excluded"
  reading only a window ≥ 14 days with no more than the statutory fee is. A bounded window therefore dominates on
  lawfulness, and it also dominates on honesty: "no refunds" on a digital licence is a stated term, not a deception, but it
  is the one term the colony cannot show is lawful toward an Israeli consumer, and MISSION rule 4 bars ToS and legal
  violations before it counts revenue (`MISSION.md:434-439`, repo). Charging no cancellation fee at all keeps us under
  any cap.
- Why this is not §8.4's "advertising a guarantee before A1's gates": the two harms named there are requests reaching the
  owner's inbox and words that do not match the mechanism (`08-sales-marketing-lessons.md` §8.4, repo). The first is
  already closed by the enable gate on the brand mailbox (`gumroad-pro-product.js:457-468`, repo; step 8 is not done —
  `research/owner-asks/sent.json` empty, no `state/colony/brand-mail.json`); the second is closed by requiring the
  responder before enable. A1's third gate, "the first real refund confirms the balance covers it" (`:693`, repo), is
  circular before a sale and is struck as a pre-sale gate; it becomes the recorded check on the first refund.
- Why 30 and not 14 or 7: 30 is what Gumroad prints today with no call; 14 would need the same API call as "none" and
  buys only a smaller window on a ₪79 client-side licence whose refund switches Pro off within a week
  (`README.md:534-535`, repo); 7 fails the stricter reading. The gate requires ≥ 14 so a later dashboard change to 7 or
  none is caught by `check`, as a price change is.
- Effect today: identical — nothing sells before step 8. Effect after step 8: the responder is the one owner-free build
  that opens the sale, and it is launch preparation for an existing BBU slot, not a new product.

**APPLY.**
1. `products/il-biz-tools/scripts/gumroad-pro-product.js`: `refundPolicyGate(product, accountPolicy)` returns
   `{ok, reason, days}`; `ok` when the period in force parses to an integer ≥ 14 (`MIN_REFUND_DAYS = 14`, with this
   ruling in the comment), refuses `'none'`, `'7'`, unreadable and not-in-effect exactly as today. `create
   --write-site-json` also writes `gumroad.refundPeriodDays` (from `GET /v2/refund_policy` when `in_effect`, else the
   product's own block; `null` when unreadable). `checkOffer` compares the deployed `refundPeriodDays` with the live
   period as it compares the price, and refuses on mismatch. `enableProduct` additionally requires
   `brandMail.responders` to include `"gumroad-refund"` (fails closed when the key is absent). New command `refund
   --email <addr>`: `GET /v2/sales?email=` for the product id, `PUT /v2/sales/:id/refund` for a sale inside the window,
   log sale id and refund id, never the address. Header comment and README §"The Pro tier" (`README.md:558-564`)
   rewritten to this ruling; no "No refunds allowed" anywhere.
2. `src/config/site.json`: `gumroad.refundPeriodDays: null` with its `_comment`. `src/lib/gumroad.js`: expose it beside
   `gumroadPrice`. `invoice.html` FAQ: a seventh `data-pro-sale` entry, "אפשר לקבל החזר?" — "החזר כספי בתוך {n} ימים
   מהרכישה, לפי מדיניות ההחזרים של Gumroad: משיבים למייל הקבלה מ-Gumroad. מדיניות מלאה בדף המוצר ב-Gumroad." — with
   its JSON-LD twin, rendered only when `refundPeriodDays` is a number and the button is `ready`; never "בלי שאלות",
   never a law. `scripts/build-site.js` fills `{n}` as `withProPrice` fills the price.
3. `scripts/brand_mail.py`: `probe` writes `responders: ["gumroad-refund"]` only when the `respond-refunds` command
   exists in the same script and `brand-mail.yml` schedules it; `respond-refunds` reads mail to the Gumroad-account
   address that replies to a Gumroad receipt or names החזר/refund, calls the `refund` command above, and answers with one
   fixed sentence. `src/revenue/brand-mail.ts` reads `responders` (absent → "responders: none", not invalid).
   `brand-mail.yml`: option `respond-refunds`, scheduled with `probe` once step 8 is done.
4. Kill rule, in `TARGET_BASIS["il-biz-tools"].basis` and the README: if Pro is disabled or the line killed, the responder
   keeps running for `refundPeriodDays + 7` days after the last sale.
5. Tests: `tests/gumroad-pro-product.test.js:286-316` — `noRefunds` is no longer the accepting fixture: `'none'` and
   `'7'` refuse, `'14'`, `'30'`, `'183'` accept with `days`; `:473-477` the 30-day account now passes `checkOffer` when
   the deployed `refundPeriodDays` is 30 and fails when it is 14 or null; new tests for `refund --email` against a fake
   Gumroad and for `enable` refusing without `responders`. `tests/pro-faq.test.js:39-45, :153-180` — seven questions, the
   refund entry marked `data-pro-sale`, dropped with no `refundPeriodDays`. `src/__tests__/revenue/brand-mail-parity.
   test.ts` — fixtures with and without `responders`, both readers agree. `tests/gumroad-analytics.test.js` `READY`
   fixture gains `refundPeriodDays: 30`.
6. Queue the renders (`scripts/queue-zero-test.mjs`), one dispatch: (i) the consolidated text of חוק הגנת הצרכן at
   `https://www.nevo.co.il/law_html/law01/055_001.htm` (never attempted, `risk-governance--consumer-protection.md:114-
   116`) and the Knesset legislation database entry as fallback — to settle 14ג(ד); (ii) Gumroad's help-centre article on
   refund policies, its URL taken from Gumroad's help index, not guessed — to settle the buyer-facing terms and whether
   the merchant of record is the trader. Results to `research/measurements/refund-law-il.md`.

**REOPEN IF.** (i) The primary text of 14ג(ד) is rendered: if it excludes digital information outright, the board may
shorten the window (14 stays the floor this ruling sets, "none" would need its own sitting); if it grants a right, 30 days
and a zero fee already comply and the disclosure duty on receipts is checked against Gumroad's receipt. (ii) Gumroad's
refund terms show it refunds from a zero balance by clawing back payouts — then the balance note becomes a cost rule.
(iii) The first real refund: record whether the balance covered it (A1's struck gate, kept as a check).

---

## Summary table

| Item | Ruling | Apply |
|---|---|---|
| (a) il-biz-tools Pro | Keep, ₪79 one-time, one fixed price, offer unchanged; Pro is the stranger-pays measurement, not income. Free-tier logo check settles wording only | `SKILL.md:65` struck; AI declaration in `productDescription`; basis sentence; one render of Israeli invoicing free tiers |
| (b) apify-actors | `ils: 0`, `inferred`, contested ₪200; ₪1,500 stays in text as refused; committed sum ₪900 | `portfolio.ts:148-151, :380-384`; `target-basis.test.ts:107-123, :181-184`; `sync-portfolio`, `report`; `INCOME_PLAN.he.md:60` |
| (c) `staleDays` | Default 21 stays; per-line override; apify-actors 45 | `TargetBasis.staleDays?`, `policyForLine`, `TARGET_BASIS["apify-actors"]`; tests in `target-basis` and `rules` |
| (d) Apify $20 minimum | Book the approved monthly statement as revenue, the transfer as reconciliation; FX rate rendered before any USD row | `rails.ts` note now; connector and BoI render at the pricing sitting |
| (e) T1 sub-brand | Name now from `chartexplained`, `plotnotes`, `axisnotes`, `dataplotted`, `linesandbars`; four probes; account conflict deferred to row 16 | candidates file; `brand-check.mjs` + Netlify probe; PREREG §3.5, T1-PROTOCOL 4, identity kit |
| (f) pcn874 paid offer | Honest only as a one-time licence with the boundary printed; per-period rejected; validator "חינמי ונשאר חינמי"; nothing built before the D0+56 PASS; ₪600 unchanged | `pcn874/README.md:7`; `TARGET_BASIS.pcn874.basis`; `pcn874.html:123` wording + test |
| (g) Appendix B | Do not build; reopen on a mailbox request or counted Appendix-B refusals | anonymous refusal event when the counter is wired; nothing else |
| (h) Refunds | No "no refunds"; keep Gumroad's 30-day default, gate ≥ 14 days + page line read back + responder; no law cited; render 14ג(ד) | `gumroad-pro-product.js` gate/`refund`/site.json field; FAQ entry; `brand_mail.py respond-refunds`; tests; two renders |

## Edits for the Opus fold

**Code.**
- `src/revenue/portfolio.ts`: apify seed `:148-151` (₪0, comment); `TARGET_BASIS["apify-actors"]` (`ils 0`, contested 200,
  `staleDays: 45`, basis sentences); `TargetBasis` interface `staleDays?`; `policyForLine` merges it;
  `TARGET_BASIS["il-biz-tools"].basis` and `TARGET_BASIS.pcn874.basis` sentences.
- `src/revenue/rails.ts`: apify note, ledger-event sentence.
- `products/il-biz-tools/scripts/gumroad-pro-product.js`: `refundPolicyGate` (≥ 14, returns `days`), `MIN_REFUND_DAYS`,
  `writeSiteJson` + `checkOffer` for `refundPeriodDays`, `enableProduct` requires `responders`, new `refund` command,
  AI-declaration paragraph in `productDescription`, header comment.
- `products/il-biz-tools/src/config/site.json` (`refundPeriodDays`), `src/lib/gumroad.js`, `invoice.html` FAQ (seventh
  entry + JSON-LD), `scripts/build-site.js`, `README.md` §Pro (`:558-564`) and pricing note.
- `products/il-biz-tools/pcn874.html:123` wording ("חינמי ונשאר חינמי"); `assets/page-pcn874.js` Appendix-B event, only
  when the counter is wired.
- `scripts/brand_mail.py` (`respond-refunds`, `responders` in probe), `src/revenue/brand-mail.ts`,
  `.github/workflows/brand-mail.yml`.
- `scripts/brand-check.mjs` (Netlify probe), `research/measurements/t1-subbrand-candidates.txt`,
  `.github/workflows/brand-check.yml` input.
- `products/pcn874/README.md:7`; `skills/revenue-il-biz-tools/SKILL.md:65`; `docs/INCOME_PLAN.he.md:60`.

**Tests that must change.** `src/__tests__/revenue/target-basis.test.ts` (`:107-111, :122-123, :181-184, :244-251`);
`src/__tests__/revenue/rules.test.ts` (`:132-136`, monthly-rail case); `src/__tests__/revenue/brand-mail-parity.test.ts`
(`responders` fixtures); `products/il-biz-tools/tests/gumroad-pro-product.test.js` (`:286-316, :473-477`, refund command,
enable without responders, description declaration); `tests/pro-faq.test.js` (`:39-45, :153-180`, seventh entry);
`tests/gumroad-analytics.test.js` (`READY` fixture); `tests/pcn874-page.test.js` (wording, no "לתמיד", refusal event).

**Then.** `pnpm exec tsx scripts/colony.ts sync-portfolio` and `report`; `pnpm typecheck`; the il-biz-tools and pcn874
product suites; grep `docs/` and `skills/` for "1,100" and for "No refunds allowed".

**Renders to queue (one dispatch each, in this order).** (1) חוק הגנת הצרכן 14ג(ד) at nevo, Knesset fallback, plus
Gumroad's refund-policy help article; (2) Israeli invoicing services' pricing pages; (3) the T1 sub-brand check via
`brand-check.yml`. The Bank of Israel rate render waits for the Apify pricing sitting.

**Records.** `logs/CHANNEL_LOOP.md` §3 (il-biz-tools: enable now waits on step 8 and the refund responder; T1 web arm:
name chosen or pending the check), §7/§8 (row 15 done), and a §9 note that A(a)'s trigger (i) did not fire (15(a) names
no new feature) — the main thread's file. `FABLE_QUEUE.md` row 15 marked DONE with this path.
