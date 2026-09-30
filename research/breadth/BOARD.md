# Ruling — the breadth board (FABLE_QUEUE rows 12 and 13) and the constraint-cost ranking for the owner

**Board sitting:** 28.9.2026, third Fable agent of the day, convened for the owner's directive of 28.9 ("הרבה מקומות,
הרבה מכירות"). One board. No git, no code edits, no edits to `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`,
`logs/FABLE_QUEUE.md`, `MISSION.md` or `CLAUDE.md`: Opus applies §"Exact changes".
**Read:** `MISSION.md` in full (3.9, 27.9, 28.9 additions); `research/measurements/step2-cost.md` (the owner is not
salaried); `research/breadth/BREADTH-SWEEP.md` (revised) with `REVIEW.md`, `verify/verdicts.json`, `critic.json`;
`logs/CHANNEL_LOOP.md` §2-§6 and §9-§10; `research/channel-loop/BOARD-LOOP.md`; `FORECAST.md`;
`RULING-2026-09-28-bounty-rail.md` §2-§7; `RULING-2026-09-28-floors.md` Row 9; `ZERO-TESTS.md`; `urls.txt`;
`src/revenue/bounties/intake.ts` (the floor), `src/revenue/owner-steps.ts`, `src/revenue/portfolio.ts` (targets and
budgets), `docs/OWNER_STEPS.he.md` (step 4), `logs/2026-09-28-bounty-rail-ruling-applied.md`,
`logs/2026-09-28-rulings-review-fixes.md`, `docs/REJECTED.md` (:273, :820, :1068, :1105-1121, :1308-1320),
`research/colony-sweep/BOARD.md` §4.1, `BOARD-2.md` §3.
**Grades used.** RENDERED = a stored capture with its line; CODE = a platform's own source read from GitHub; REPO = this
repo's own research; SCOUT = the 28.9 scouts, not adversarially verified; INFERENCE = the board's reasoning.
**Standing rule applied throughout:** money is a `revenue_ledger` row with a transaction id. Every figure below is a
forecast or a ceiling, never revenue. The ledger today: ₪0.00, zero rows.

---

## סיכום לבעלים

1. תשע זירות חדשות נבדקו לעומק. **אף אחת לא נכנסת לבנייה היום**; כולן נכנסות לתור רק למבחן ₪0 (קריאת עמודים חינמיים), כי בשום זירה לא הוכח עדיין שהיא משלמת לישראל בלי מצלמה ושקונים ימצאו בה מוצר חדש. ArrangeMe (תווים) לא נכנס גם לתור.
2. סדר התור: Firefox Add-ons, Superteam Earn, CrazyGames, Spreadshirt, Google Play Books, Pebble, Wix, ואחריהם GameMonetize; n8n מקבל שני עמודים לקריאה. הזירה הראשונה שמבחניה יחזרו תעלה לישיבת הקבלה הבאה.
3. **הצעד היחיד שמבוקש עכשיו, בנוסף ל-3 החינמיים שכבר ברשימה:** תיבת דואר של המותג (צעד 8, כ-10 דקות, חינם, בלי זהות) — חשבון Google בשם המותג, כי אותו חשבון ישמש אחר כך גם ל-Play Books ול-YouTube. ארבעת הצעדים החינמיים יחד: כ-30 דקות, והם משחררים עד ארבעה מוצרים בנויים לפרסום.
4. צעד 4א (התחברות ל-Algora) **יורד מהרשימה**: הקוד של Algora יוצר את המשתמש בעצמו ברגע התביעה, אז זה צעד שאינו נדרש. נשאר רק 4ב (טופס Stripe), מושהה כמו קודם.
5. PayPal ישראל ייהפך לצעד 13, מותנה: רק אחרי שעמוד האימות של PayPal יראה שאין סלפי, ואחרי שזירה אחת שמשלמת דרכו עברה את מבחניה.
6. **תחזית כנה, בשקלים שנכנסים לבנק:** ₪0 עד ₪250 בחודש בחודש 12; תקרה חשבונית של כ-₪925 שכל שיעור בה מונח ולא נמדד. זה רחוק מאוד מ-₪20,000, ושום דבר שנמדד לא תומך ביותר. USDC מ-Superteam (עד ~₪555) נספר בנפרד ולא מתווסף.
7. **מה מהמגבלות שלך עולה הכי הרבה, לפי כסף מול טרחה (המלצה, לא החלטה):** (א) הזמן עד לכל צעד חינמי — כ-30 דקות עכשיו ו-2–3 שעות לאורך החודשים הקרובים משחררות את כל התקרה שלמעלה, ובלעדיהן התחזית היא ₪0 בוודאות; (ב) הדומיין (כ-₪50–70 לשנה) — הצעד הזול ביותר ביחס למה שהוא פותח, ומתאים לרגע שהשקל הראשון נכנס; (ג) כלל המצלמה — סלפי אחד לכל מסילה היה פותח Polar (עמלה נמוכה בכל מכירה), Etsy ותוכניות באג-באונטי, בסך תקרות של ₪0–1,500 שאף אחת מהן לא נמדדה; (ד) שיחה עם לקוחות — המגבלה שלפי הניתוח שלנו קובעת מחיר רצפה אפס, אבל אין לנו שום מדידה של מה היא שווה, והיא משנה את צורת החברה.
8. הכסף בלדג'ר עדיין ₪0.00. שום מספר בקובץ הזה אינו הכנסה.

---

## Part A — Row 12: the breadth plan's questions Q1-Q10

### The frame this board applies

- **Entering the §4 queue is not admission.** Admission stays one candidate per Fable sitting, and only for a candidate
  whose ₪0 test has *returned* (BUILD-1, `BOARD-LOOP.md`). No engine's test has returned, so **nothing is admitted today.**
- **Constraint 2 is applied before ceilings, as MISSION orders**: a plan needing an account per handful of listings is
  rejected "before anyone asks whether it would earn" (`MISSION.md:126-131`). That reorders two engines below.
- **The 28.9 directive is a shape, not a licence to flood.** Many honest listings in venues that bring their own buyers;
  no listing without a named non-free feature; every cap in code before the first listing (Q7).

### Q1 — Queue order and weighting: ACCEPTED with three amendments

**Decision.** The weighting stands: hard gates (G1, G2, G3, G4, G7) that hold at github grade or better, minus those
leaning to fail; then honest listings and buyers per *new* owner step; GameMonetize last by sequencing. The nine enter
`logs/CHANNEL_LOOP.md` §4 **for their ₪0 tests only.** Three amendments:

1. **ArrangeMe is not queued.** G2 is grade n, G3 leans F at github grade (every automation seen rides a human cookie;
   the SDK has no login), G7 is U with the arranger name shown on retailer pages, its only measured sales rate belongs to
   the flooding pattern MISSION forbids, and honest supply is "UNKNOWN, possibly ~0" (`BREADTH-SWEEP.md` §2.3 item 8).
   A new account plus payout plus W-8BEN for a supply nobody has shown to exist is the constraint-2 shape. It is recorded
   as **deferred, not queued** (not a kill: KILL-5 needs a refuting test). Reopen trigger: a render of ArrangeMe's own
   terms allowing automated access and AI-made arrangements, **and** an occupancy count from the retailers' pages (only if
   their terms allow it) showing at least 20 honest cells with sales history and no free equivalent. Its terms URL may be
   rendered in Batch C when nothing else is pending.
2. **Pebble drops below Spreadshirt and Google Play Books.** Two new accounts plus PayPal for 2-4 faces at a ₪0-25 figure
   with no saved arithmetic is again the constraint-2 shape; a snippet-grade G4 does not lift it. It stays in the queue
   only because its test is one free render, with a **pre-registered kill**: if KiezelPay's FAQ does not show Pebble apps
   being onboarded in 2026, or shows any fee, Pebble is dead without another sitting (recorded in `REJECTED.md` with the
   reopen trigger "KiezelPay or a successor documents Pebble unlocks with Israel payable and no camera").
3. **n8n paid templates enter the first render batch** (second tier, render only): they ride existing step 3 plus one
   creator account, and their buyers come from inside the n8n editor, a source not gated on a Gumroad sale — the best
   listings-per-step shape in §2.4, and the plan's own "most worth a render".

**The queue, as ruled** (numbers continue `CHANNEL_LOOP.md` §4; existing rows keep theirs):

| Rank | Candidate | §4 row | ₪0 test (this board's wording) |
|---|---|---|---|
| 1 | Firefox Add-ons (AMO) + Gumroad Pro licence | **16 (new)** | Render the four AMO URLs (Batch A). **Before admission, name in writing one Pro feature that is free nowhere** (our own il-biz-tools included); none → not admitted (G4). Read the newest cohort's daily users and the Hebrew langpack's. |
| 2 | Superteam Earn agent bounties | 15 (existing) | T1-T4 as ruled (`RULING §6.3`), plus: T2 adds `terms-of-use.pdf`; T4 adds the SOL-gas / Privy question. Pre-decisions in Q6. |
| 3 | CrazyGames | 6 (existing) | **Tipalti first**: the payees FAQ render gates step 10 (the developer account **plus Tipalti onboarding**, an identity step, before any submission). Then the Basic-Launch metrics and gameplay pages (rows 26-27, already queued); the portal question in writing once step 8 exists. |
| 4 | Spreadshirt | **17 (new)** | Render the six Spreadshirt URLs (Batch A) and DSA Arts 30-31 (Q10). One written question on automated uploads from the step-8 mailbox; "no" is KILL-4. |
| 5 | Google Play Books | **18 (new)** | Render table 6052428 and answers 3250840, 4490848 (Batch B). Israel absent from the payment-country list → dead. |
| 6 | Pebble + KiezelPay | **19 (new)** | Render the KiezelPay FAQ and `apps.repebble.com/faces` (Batch A). Pre-registered kill above. |
| 7 | Wix App Market | 11 (existing) | Row 28 (security test) as queued; add the Tipalti US-ROW coverage page, the App Market guidelines and the company-info page (Batch B). Who issues the per-payout tax invoice is settled after step 2, never by owner paperwork. |
| 8 | GameMonetize | 14 (existing) | Waiting: only after a game passes CrazyGames Basic Launch. Its two URLs render only then. |
| 9 | n8n paid templates | **20 (new, second tier)** | Render `api.n8n.io/api/templates/search?rows=100&page=1` and `n8n.io/creators/` (with Batch A). Read the Creator Hub's AI rule and the paid-unlock condition. |
| — | PayPal Israel receiving (rail research, not a channel) | **21 (new)** | Render the three recorded PayPal IL URLs (Batch A); the verification article is followed from the user agreement. A selfie or liveness step kills the PayPal leg of Pebble, Spreadshirt and GameMonetize together. |
| — | Mozilla Client Bug Bounty | 8 (existing) | Unchanged (Q8). |

Ranks are for test order and for the next sitting's admission candidate; the first engine whose tests return is
that candidate. On today's evidence it is Firefox: four free URLs, one identity-free account, payout on existing step 3.

### Q2 — Step 8 (brand mailbox) now: YES

**Decision.** Proposed step 8 is admitted as an owner step and asked **now**, second in the free batch after the network
allowlist. It is the highest-leverage free step in the sweep: it removes il-biz-tools' last publish gate (the brand-owned
accessibility contact), it is the inbox every new-account venue needs for verification mail and OTPs, and it lets the
colony ask the written questions that decide CrazyGames and Spreadshirt.

**Specification (an architecture decision, so it is fixed here):**

- **A brand Google account** (Gmail under the brand name), not a mailbox on another provider, because the same account
  later serves Google Play Books Partner Center (rank 5), YouTube Stage A (the brand Google account `T1-PROTOCOL.md`
  already names) and Search Console. Constraint 2: one account, several venues. If Google's sign-up demands more than a
  phone number — an ID document, a video, a payment — stop and fall back to a free Outlook.com mailbox (IMAP available). **Note, 30.9.2026:** YouTube Stage A no longer uses this account; T1's channel gets its own dedicated brand Google account under the sub-brand name, opened at Stage A (`research/channel-loop/RULING-2026-09-30-video.md` 16(c)), and Play Books was killed on 28.9, so this account's later use is Search Console. The text above is left as the board wrote it.
- The owner's own phone number for the sign-up check is an identity-lite, private, camera-free step and is allowed. The
  owner's personal Gmail is never used (PUBLISH-9).
- **The agent reads it, the owner never answers anyone.** A second Gmail connector for the brand account in this
  environment; for CI, an OAuth token or app password in a repository secret. The tick's probe step gains: unread mail
  count; any accessibility-contact mail unanswered after 7 days is a blocker in the report. The colony answers
  accessibility mail itself.
- Every written question the colony sends a platform from this address discloses that it comes from the company's
  automated operator (the same honesty as `disclosure.ts`).
- The address is published only as the brand's accessibility contact. Cost: ₪0. Minutes: ~10 (INFERENCE).

It enters `src/revenue/owner-steps.ts` as step 8 (the eighth-step test is changed deliberately, citing this ruling), and
`docs/OWNER_STEPS.he.md` gains one section for it and one row in the summary table. Nothing else in that document is
re-rendered for this ruling except step 4 (Part B) and the two lines named in §"Exact changes".

### Q3 — PayPal Israel: YES, as a named conditional step 13

**Decision.** PayPal Israel (receiving) becomes **proposed step 13**, held. It is asked only when all three hold:
(i) the PayPal IL render shows identity verification with no selfie, liveness or video (an ID upload is allowed);
(ii) one PayPal-paid engine has passed its ₪0 tests **and** been admitted by a sitting; (iii) step 2 is done, since the
account receives business income. The ₪8 withdrawal fee under ₪1,000 and the 18% VAT on PayPal's fees come out of the
money, never up front, so the ₪0 rule holds. It would be the first rail outside the seven steps shared by three engines,
which is exactly the "one owner step, many listings" arithmetic the directive asks for — and exactly why a selfie in
the render kills three engines' PayPal leg at once (they may survive only on another rail).

### Q4 — The built-but-unlaunched cap and listing packs: keep 6; one pack = one slot; at most 5 items

**Decision.** The cap stays at 6. An admitted engine's listing pack counts as **one** slot, because the cap exists to
stop work piling up behind owner steps and a pack behind one owner step is one blocked thing. **At most 5 items are built
per pack before its owner step**, not 10: every first build in §4 of the plan is 1-4 items (1-2 add-ons, 2-4 faces, 2-4
titles, one game, one app), so a cap of 10 would cap nothing, and constraint 7 says the first thing built on a line is
the cheapest stranger-find test, not inventory. Designs generated for Spreadshirt before its written yes count toward the
5. ₪0 tests, supply counters and occupancy scans stay outside the cap. A pack's slot frees when its owner step is done
and a runner probe sees the listing public under the brand.

### Q5 — Apify visibility: the instrument stays, labelled biased-low; identity verification is pulled forward only if it is camera-free

**Finding accepted** (CODE, held up on review): Apify's default Store-API search excludes Actors from developers who have
not passed KYC. So a near-zero 30-day stranger count can mean "hidden", not "unwanted", and `docs/REJECTED.md:820` /
`BOARD-LOOP.md:89-92` (free publishing needs no KYC; KYC deferred to 50 users) are partly circular.

**Decision.**
1. The instrument is kept, and its KPI is **labelled** wherever it is printed: *"stranger runs — biased low while the
   developer is unverified: hidden from default Store-API search"*. A reading under 10 is ruled **TEST_MORE (hidden or
   unwanted, indistinguishable)**, never "permanent instrument", until item 3 is settled.
2. Two free reads first: the Store-API pair the plan names (`?search=israel&limit=1000` with and without
   `includeUnrunnableActors=true`) to quantify the hidden share, and Apify's identity-verification requirements read from
   the GitHub-hosted `apify-docs` repository (a GitHub read, not a render). The repo's own owner doc lists ID, proof of
   address, a tax document and ownership information and no selfie (REPO grade, `docs/OWNER_STEPS.he.md:418`).
3. **If the read shows document-only verification** (no selfie, liveness or video), Apify identity verification moves
   from "after 50 stranger users" to **the Publish-click sitting** (existing step 6, part ג — the same sitting, no new
   sitting), so the day-30 count measures demand and not visibility. It stays an identity step asked after the free batch.
   **If any camera step appears**, verification is never asked, the "≥ 50 → KYC" rule is moot, the line stays a
   biased-low ₪0 instrument, and the constraint-8 "history of success" clock is noted as *unverified to accrue while
   hidden*.
4. `docs/REJECTED.md:820` and the seed's criteria get a dated note; `BOARD-LOOP.md` is not rewritten (its design), the
   correction lives in `CHANNEL_LOOP.md` §9 and here.

### Q6 — Superteam: the brand rule, and ranking on unconverted USDC

**(a) Legal name on the public talent profile.** A first and last name shown publicly beside wins is a byline, and MISSION
forbids bylines ("never volunteered beyond what the law requires"; Superteam's requirement is a platform's, not the
law's). **The G7 kill in `RULING §6.5` stands** unless T2/T3 show that a display name or handle can stand publicly while
the legal name stays private to the platform and the paying sponsor. Sponsor-visible and private is allowed — that is
what an invoice does. An owner who wishes to accept their own name there may say so; the colony never assumes it.

**(b) Ranking on USDC booked unconverted is accepted for queue purposes only.** Converted shekels are ₪0 by construction
until T4, and the ₪20,000 test counts converted money (`RULING §6.2`). **Pre-decision for §6.5's open board call:** if T4
finds both Israeli exchanges camera-gated, Superteam is **not admitted as a line**; T1 keeps counting as a supply
instrument, and the venue re-enters admission only when a camera-free off-ramp is rendered or the owner, told plainly
(Part C, item 4), says they accept an exchange identity check with a camera. A SOL purchase for gas, if Privy does not
sponsor it, is the owner's own spend decision after income under the ₪0 rule; it never blocks booking a receipt.

### Q7 — Honesty caps as code gates: YES, before the first listing

**Decision.** No admitted engine lists anything before its caps are in code with tests, refused by the publish or listing
job and logged to the report — the `publication-gate.ts` pattern: per-week and per-listing limits, per-template-family
limits, the venue's AI-disclosure text, Superteam's one-submission-per-listing and two-in-flight rules, and a
**free-elsewhere register**: each item names the free equivalents checked (our own sites first) and why it is not one.
This is BUILD-11 for the loop; `CHANNEL_LOOP.md` §1's "Never" list gains *"a listing beyond a cap that is not in code"*.
The module is written when the first engine is admitted, not today.

### Q8 — Mozilla: CONFIRMED

It leaves the breadth ranking (its shape is one payer, lumpy, rare — the opposite of the 28.9 directive), is counted at
₪0 under the cash-event rule, and stays queue #8 with its own ₪0 test (a 30-day private dry run, nothing filed). The dry
run stops if private-repository Actions minutes would cost money. No owner step is asked before a qualifying finding.

### Q9 — Corrections to record: ALL, plus one adopted wording

- **Whop** (`docs/REJECTED.md:1068`, "a one-time ID upload", rail reusable) → re-recorded as **camera-gated**: the
  official SDK requires a face photo with every document type (CODE, `whopio/whopsdk-typescript`). The rail is not reusable.
- **Odoo, iCount, Code4rena**: scout ratings that contradict standing verdicts are overridden by the verdicts
  (`REJECTED.md:1204`, `:1103`; `SWEEP-2.md:264`). Recorded so the next sweep does not re-open them on a rating.
- **`BOARD-LOOP.md:124,126`** (Tipalti "after a Full Launch invitation only") is wrong at rendered grade: billing
  onboarding is required before the first submission (`crazygames-payouts.txt:337-339`). BOARD-LOOP is the design and is
  not rewritten; the correction goes into `CHANNEL_LOOP.md` §4 row 6 and §9, and step 10's wording everywhere becomes
  "developer account **plus Tipalti billing onboarding** (identity; 'hold payments' allowed)".
- **`BOARD-LOOP.md:127`** ("the €100 threshold plus NET-60"), left by tick 4 for this sitting: **adopted** as *"the €100
  threshold; payment 30 days after invoice per the developer terms, NET 60 per the payouts page"*.
- **Shopify** (`REJECTED.md:1430`, "parked, not rejected"; a third-party copy cites a $19 listing fee): pre-ruled — if
  the render (Batch C) shows a mandatory listing fee, parked becomes killed under the ₪0 rule without another sitting.
- The six verifier kills in the plan's §6.1 are **confirmed** at their stated grades (Apify fleet; Gumroad as a
  buyer-bringing venue — it stays the rail; itch.io; e-vrit at snippet grade, so a render of its help page confirms or
  reopens; Apify affiliate §8 as a venue, with the salvage note: tick the open-source box on Actor #1 during step 6a's
  visit; PromptBase, with its Stripe route left U). The §6.3 kills are confirmed (YesWeHack, 0DIN, Playgama with its MCP
  reopen, Cults3D, Edge Add-ons, Workspace Marketplace, KDP, Leanpub, Zepp OS, Garmin + KiezelPay, PartnerStack and
  Gumroad global affiliates, Freemius/Creem/Dodo as venues — Freemius stays the recorded backup rail). §6.2's list is
  recorded as *dead at scout grade* where the grade is s, and as killed at github grade where it is g; nothing at scout
  grade is called a kill.

### Q10 — EU trader display (DSA): YES, and it is the owner's choice, never assumed

**Decision.** Before any EU marketplace venue is admitted (Spreadshirt first): render DSA Articles 30-31 (the URL in the
plan) and the venue's own trader-information policy. If the venue must display the trader's name and address to buyers,
that is law, which MISSION says cannot be anonymised — but whether to enter such a venue at all is the owner's decision,
put to them as a yes/no with the rendered text attached (Part C, item 4). A "no" removes every EU-marketplace engine from
the queue with the reopen trigger *"a brand legal entity, or a venue-provided imprint service that satisfies the Article"*.

### What this part did not do

- Admit anything. No test has returned.
- Change the one-admission-per-sitting rule, the 6-hourly cadence, or PUBLISH-10.
- Save the three missing scout families and the verifier and critic notes under `research/breadth/` (Review item 19):
  the main thread's open task, restated here so it is not lost.

---

## Part B — Row 13: the bounty pay floor's capacity base, and owner step 4a

### (a) The capacity base: derived from the portfolio, not held as a constant — and it comes out at ₪1,500 today

**The question.** `intake.ts` derives the floor a bounty must clear as (capacity base ÷ 160 agent-hours) ÷ the 25% kill
acceptance rate. The base was ₪1,500 (the 7.9 committed portfolio); the 28.9 floors ruling planned il-biz-tools at ₪0 but
kept its build budget, cutting the committed sum to ₪1,100. Re-deriving from ₪1,100 would lower the floor 27%
(₪37.50 → ₪27.50/h). The review fix held ₪1,500 as a constant and asked the board how a ₪0 line that still takes build
hours counts.

**Decision.** The base is **derived in code from the portfolio**, by this rule:

> For each committed line: its target if the target is above ₪0; **else, if the board planned it at ₪0 while keeping a
> build budget** (`budgetMonthlyCents > 0`), its `contestedUpperBoundIls`; a line with a ₪0 target and no budget, or a
> killed line, contributes 0. Contested bounds are used only in place of a ₪0 target, never to raise a positive one.

Today: apify-actors 200 + il-biz-tools **400** (contested bound, budget kept) + oss-bounties 300 + pcn874 600 =
**₪1,500**, floor **₪37.50/h** — unchanged, but no longer held. It now moves with the board's numbers: a week-4 retarget
of oss-bounties to ₪100 → base ₪1,300, floor ₪32.50; a kill of that line → ₪1,200, ₪30.00; il-biz-tools paused at ₪0 at
day 56 with its build budget withdrawn → its 400 leaves. Rounding to the agora stays.

**Reasoning.**
- The derivation's own meaning: the floor is the colony's planned value of an agent-hour, divided by the acceptance rate.
  A line the board still spends hours on is valued at the figure the board "records but refused to commit to" — which is
  precisely what `contestedUpperBoundIls` exists for (floors ruling Row 9, item 1). Pausing a line for measurement did not
  decide that the colony's hours are worth 27% less; re-deriving from ₪1,100 would have decided it by accident.
- A constant "held until the board rules" was the right stopgap and the wrong permanent state: the floor is meant to move
  when the board's numbers move and to be re-derivable by an auditor (`intake.ts` "every input is a parameter").
- The line's own target does not enter the floor (the algebra cancels it), so this rule is the whole floor. Stating that
  in the comment prevents the next reader from expecting the ₪300 to matter.

**Exact change (Opus).** `intake.ts`: replace `FLOOR_CAPACITY_BASE_ILS = 1500` with `capacityBaseIls(seeds =
DEFAULT_PORTFOLIO, basis = TARGET_BASIS)` implementing the rule, exported; `deriveBountyFloor` defaults
`portfolioTargetIls` to it; the doc comment states the rule and the algebra (the floor equals base ÷ 40); the reasoning
string drops "held until the board rules on how a ₪0 line that still takes build hours counts" and says "derived from the
committed portfolio, with a ₪0-planned line that keeps a build budget counted at its contested upper bound". Tests
(`bounties-intake.test.ts`): keep the ₪37.50 case; assert `capacityBaseIls()` is 1,500 today with the four addends named;
add the ₪1,300 → ₪32.50 case (oss-bounties at 100); add a case where a ₪0 line with no budget contributes 0; keep the
agora-rounding test. `skills/revenue-oss-bounties/SKILL.md` and `docs/INCOME_PLAN.he.md` wherever the floor's basis is
described. Any `state/colony` text that prints the floor's reasoning regenerates via `report`.

### (b) Owner step 4a: DROPPED as a separate part; step 4 is 4b alone, held

**The question.** The bounty-rail ruling (§4.1) created 4a — a two-minute sign-in to algora.io as the brand machine
account in step 7's sitting — because "it creates the Algora user record that a reward's credit needs a `user_id` for".
Opus then verified in Algora's code that `/claim` creates the solver's user from the GitHub login if none exists
(`workspace.ex` `ensure_user` → `create_user_from_github`) and that a reward records its credit without checking
`payouts_enabled` (`bounties.ex` `create_payment_session` → `create_transaction_pairs`).

**Decision.** 4a's only stated reason is refuted at code grade, and MISSION rule 1 says *never invent a step that isn't
required*. **Step 4 loses its early part.** It is **4b only**: the Stripe Connect Express form, 15 minutes, held by the same
precondition (corrected week-4 mean ≥ 3 **and** a reward Algora holds as a credit), with the same three stop rules. Since
4b necessarily begins with the sign-in, "sign in to algora.io with the brand machine account" becomes 4b's first
instruction and nothing is lost. Step 7's sitting keeps only `BRAND_GITHUB_TOKEN`.

Two facts checked so this is not undone later: the terms question does not need a sign-in either (our code never touches
algora.io; the `/claim` is a GitHub comment, `algora-terms-question.md`); and if Algora were ever found to require a prior
sign-in before honouring a `/claim` (not seen in the code read), the sign-in happens at 4b — no separate step is created.

**Exact change (Opus).** `src/revenue/owner-steps.ts` step `algora-stripe`: remove `earlyPart`; `minutes: [15, 15]`;
`unlocks` and `precondition.what/short` drop the 4a sentences and add that the form begins with the sign-in; step
`github-org` `unlocks` drops "and signs in to Algora once as that account (step 4a, two minutes)". Tests: the
`owner-steps.test.ts` assertion of 4a's `earlyPart` becomes "no `earlyPart` on `algora-stripe`"; the `runner.test.ts`
quote of `short` is updated. `docs/OWNER_STEPS.he.md`: the 28.9 header note (lines 12-13), step 4's time line and "מה
לעשות" (4א block removed, the sign-in becomes 4ב's first item), the REPORT quote, summary-table rows 4 and 7; regenerate
the PDF. `src/revenue/portfolio.ts` `oss-bounties.humanSetup` → 4b and the token with step 7. `skills/revenue-oss-bounties/
SKILL.md` if it names 4a. `logs/CHANNEL_LOOP.md` §3 (oss-bounties: "4b held") and §6 item 3 (drop the 4a sentence). Then
`sync-portfolio` + `report`.

---

## Part C — For the owner: which of your constraints costs the most, and what relaxing each would unlock

**This is a board recommendation, not a decision.** Every constraint below is yours; the colony keeps each one until you
say otherwise. Nothing here recommends spending before you choose to, and nothing here loosens the honest-value rule.
Ranked by **money unlocked per unit of your time, money or discomfort**, on the repo's own evidence. Grades: RENDERED /
CODE / REPO (the repo's audits and rulings) / SCOUT / INFERENCE / NONE (no evidence exists in this repo).

| # | Constraint (as you set it) | What it costs you to relax | What relaxing it unlocks | Honest range at month 12 | Grade |
|---|---|---|---|---|---|
| 0 | *Not a constraint — the free steps waiting on you* | ~30 minutes now (network allowlist, step 8 mailbox, step 7 organisation + token, step 6a Apify); ₪0; no identity | Up to four of the six built products go public and start measuring; the first stranger measurements in the repo; the mailbox that unlocks three engines' written questions | Without them: **₪0 with certainty** in every scenario (`FORECAST.md` scenario 1). With them: the measurements that decide everything else | REPO |
| 1 | **Owner involvement kept minimal** — one account at a time, each asked only when needed | ~2-3 hours in total over the coming months, in 5-30 minute sittings, all free and camera-free (Mozilla account, Superteam claim, CrazyGames + Tipalti, PayPal Israel, Spreadshirt, Play Books); what you can relax is the *latency*: doing each within days of being asked | The whole breadth ceiling: likely ₪0-250/month converted, arithmetic ceiling ~₪925, every rate assumed; plus USDC ₪0-555 unconverted, never added | ₪0-250 likely; ~₪925 ceiling | INFERENCE (`BREADTH-SWEEP.md` §5) |
| 2 | **The ₪0 rule, on the domain** (step 5) | ~₪50-70 once for the first year (`FORECAST.md:29,76`), then a yearly renewal that is your decision each time | SEO hours on il-biz-tools and pcn874 and their kill clocks (today both are paused-at-₪0 shapes on a `*.netlify.app` null read); the MCP registry namespace `com.mehudak`; 301s from netlify.app. Their ceilings — ₪400 contested, ₪600 inferred — are unreachable by construction without it | ₪0-150 likely (FORECAST scenario 2 for the two lines); ₪1,000 ceiling. The SERP evidence argues for ₪0, so this buys a **test** more than revenue | REPO / INFERENCE |
| 2b | The ₪0 rule, elsewhere | Google Play $25 once; Wix's third-party security test (cost unknown); private-repository Actions minutes for the Mozilla dry run; Shopify $19 | Wear OS / Android listings (scout ₪0-100); Wix's submission; Mozilla's dry run if the free allowance runs out | Small; each scout grade | SCOUT |
| 3 | **No camera** (selfie, liveness, video) | One selfie or liveness check per rail, 2-5 minutes each — but a boundary you set deliberately | **Polar** as a second merchant-of-record rail: ~5% + 50¢ against Gumroad's ~22% at $9, about 9-10 points more net on every Gumroad-rail sale, and native licence keys (RENDERED; today a share of ₪0). **Etsy** single shop (Persona selfie; also $0.20 per listing → the ₪0 rule; ranking conversion-history-locked; former `templates` target ₪3,000 was killed on multi-shop and ranking grounds, a single shop is unmeasured). **HackerOne / Bugcrowd / Intigriti** (the security-bounty family Mozilla proxies at ₪0-900 averaged; the colony's hit rate is unmeasured and the Mozilla dry run measures it first at ₪0). **Fragment / Telegram** (former target ₪1,500, also dead on the off-ramp). **Payoneer**-paid venues (monday.com, TeePublic, Freepik, Draft2Digital). **Amazon** (video call, also $39.99/month). **Superteam's** conversion leg if T4 shows both exchanges camera-gated. | Sum of the repo's former and proxy ceilings ₪0-1,500/month; **none measured**; most unlocked venues have a second kill | REPO / SCOUT / INFERENCE |
| 4 | **The brand is the only public face** (no name anywhere public) | Your legal name on a talent profile (Superteam) or an EU trader imprint (Spreadshirt, DSA Arts 30-31) | Superteam if T2 shows no brand display option (USDC ₪0-555 unconverted); EU marketplaces (Spreadshirt ₪0-370, its 35 sales a month assumed) | ₪0-370 converted + ₪0-555 unconverted | INFERENCE |
| 5 | **No per-item paperwork** (per-win forms, W-8BEN per win, per-deal e-signatures) | 10-20 minutes per win or deal | Devpost/Kaggle conditional +₪400 (`BOARD.md` §4.1); Metaculus a few hundred dollars a season; Poki / CoolmathGames licences at unpublished amounts | +₪400 conditional | REPO (inferred) |
| 6 | **You do not talk to customers, sell, or appear** | The shape of the company: a person who answers, quotes, or is named | This is the constraint MISSION's own analysis says sets the price floor at zero ("the mandate causes it", constraint 8) and makes every ceiling ₪0 without an owner-free acquisition channel (the home-turf audit). It is the only relaxation whose upside is not bounded by the ceilings above — services and sales are priced by people, not by platform search. **The repo has never measured what it would earn**, because the brief excluded it from the first day | **Unknown.** Any number here would be invented | NONE |
| 7 | **More money** (a monthly float instead of a one-off) | ₪ per month | Almost nothing: paid acquisition is rejected on portfolio arithmetic at any budget (`docs/REJECTED.md` "Paid advertising, at any budget"; `BOARD.md` §4.1 item 4). The small one-off fees in rows 2 and 2b are the whole list | ~₪0 | REPO |

**The board's reading of this table, plainly.** Items 0-2 are cheap and decide whether anything is ever measured; the
board would do item 0 today and would rank the domain as the first ₪50 worth spending after the first shekel lands, which
is the timing you set. Item 3 is a real but modest unlock with a real boundary behind it; the board does not ask you to
cross it, it prices it. Item 6 is the honest answer to "which constraint costs the most": it is also the one that changes
what the company is, and the board has no measurement to offer for it — so it is named, not recommended. **None of
these, on the evidence, is a path to ₪20,000 a month.** The forecast's ~1% for that within 12 months (`FORECAST.md`)
stands after this sweep; what would move it is the first ledger row and, after it, a line with a non-public input ten
times larger than anything two sweeps of 139 candidates and this one of 15 families have found.

---

## Part D — Kills, deferrals and admissions made by this board

- **Admitted:** nothing.
- **Deferred, not queued:** ArrangeMe (Q1.1), with its reopen trigger.
- **Pre-registered kill:** Pebble on the KiezelPay render (Q1.2).
- **Pre-ruled conditional kill:** Shopify on a rendered mandatory listing fee (Q9).
- **Confirmed kills:** the plan's §6.1 and §6.3 lists at their stated grades (Q9); scout-grade deaths recorded as such.
- **Kill condition kept:** Superteam's legal-name byline (Q6a); Superteam not admitted on a camera-gated off-ramp (Q6b).
- **Nothing killed on a ceiling.** Every kill above is a gate, a rendered fee, or a mandate collision.

---

## Exact changes Opus applies (one PR under the standing consent; then `sync-portfolio` + `report`)

Checklist by file. Worktree agents do not touch `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` or `logs/FABLE_QUEUE.md`;
the main thread applies those three.

### `logs/CHANNEL_LOOP.md` (main thread, next tick)

- [ ] **§1 "Never":** add *"a listing beyond a cap that is not in code"* (Q7, BUILD-11). **§1 step 2 (probes):** add the
      brand-mailbox probe once step 8 exists (unread count; accessibility mail unanswered > 7 days = blocker).
- [ ] **§2:** under the BBU row, the rule *"an admitted engine's listing pack is one slot; ≤ 5 items before its owner step;
      ₪0 tests, counters and scans outside the cap"* (Q4).
- [ ] **§3 oss-bounties:** owner-steps cell → *"4b held (corrected week-4 mean ≥ 3 AND a held reward); step 7 creates
      `BRAND_GITHUB_TOKEN`"*; drop 4a. **§3 apify-actors:** next action gains *"KPI labelled biased-low; Store-API pair and
      the apify-docs KYC read before the Publish click; verification pulled to the Publish sitting only if document-only"*.
- [ ] **§4:** row 6 text → Tipalti before the first submission; the payees FAQ render gates step 10 (Q1, Q9). Row 11 →
      add the three Batch-B Wix/Tipalti URLs. Row 15 → *"T2 also reads `terms-of-use.pdf`; T4 adds the SOL-gas/Privy
      question; admission pre-decisions in `research/breadth/BOARD.md` Q6"*. **New rows 16-21** exactly as the Q1 table
      (Firefox 16, Spreadshirt 17, Play Books 18, Pebble 19 with its pre-registered kill, n8n 20 second tier, PayPal Israel
      21 rail research), each with status *"queued 28.9 (breadth board); ₪0 test in ZERO-TESTS rows …"*. Under the
      "Rejected from the queue" list: **ArrangeMe — deferred, not queued** with the reopen trigger.
- [ ] **§6:** the free list becomes: 1 network allowlist (2 min); **2 step 8, brand mailbox — Google account under the
      brand, ~10 min, spec per Q2**; 3 step 6a Apify (5 min); 4 step 7 organisation + `BRAND_GITHUB_TOKEN` (drop the 4a
      sentence). "Only when a paid product is ready": unchanged. "Held, not asked": add **proposed step 13 PayPal Israel**
      (Q3 conditions), **proposed step 14 Mozilla add-ons account** (after Firefox's tests and admission), step 10 reworded
      *"CrazyGames developer account plus Tipalti billing onboarding — identity — after the Tipalti render and a written
      yes on runner-operated submission"*, and *"Apify identity verification — at the Publish sitting only if the read
      shows no camera (Q5)"*. The "proposed steps needing a yes" list loses step 8 (now asked) and keeps step 9 (npm).
- [ ] **§7:** *"28.9 breadth board: nothing admitted; ArrangeMe deferred-not-queued; Pebble pre-registered kill; §6.1/§6.3
      kills confirmed"* with a pointer here.
- [ ] **§8:** rows 12 and 13 done → pointer to this file. **§9:** BOARD-LOOP:127 wording adopted (Q9); BOARD-LOOP:124,126
      Tipalti correction recorded; the `REJECTED.md:820` Apify note.
- [ ] **§10:** next tick's first actions: dispatch Batch A (below); apply Part B on Opus; add step 8 to the ask.

### `logs/FABLE_QUEUE.md` (main thread)

- [ ] Rows 12 and 13 → **DONE 28.9**, pointing to `research/breadth/BOARD.md` (Part A; Part B), with the commit.

### `research/channel-loop/ZERO-TESTS.md` — new rows (the file ends at 32; take the next free numbers if it moved)

Only URLs the plan or the rulings already name. Terms first everywhere; no login or search page unless the venue's terms
allow automated access; `algora.io` is never rendered.

- [ ] Row 30 (Superteam T2) gains `https://superteam.fun/earn/terms-of-use.pdf`.
- [ ] Row 32 (Superteam T4) gains *"and whether Privy sponsors transaction fees for platform-created wallets (docs root
      `https://docs.privy.io/`; the exact page is followed from there)"*.
- [ ] **33** CrazyGames (6) and Wix (11) — `https://help.tipalti.com/hc/en-us/articles/30607242003223-Payees-FAQs` —
      Israel as a payee country; any selfie, liveness or video; forms. Gates step 10.
- [ ] **34** Firefox (16) — `https://extensionworkshop.com/documentation/publish/add-on-policies/` — AI, automation,
      paid-feature and data-disclosure rules.
- [ ] **35** Firefox (16) — `https://addons.mozilla.org/api/v5/addons/search/?app=firefox&type=extension&sort=created&page_size=50`
      — the newest cohort's daily users.
- [ ] **36** Firefox (16) — `https://addons.mozilla.org/api/v5/addons/search/?app=firefox&type=extension&q=hebrew&page_size=50`
      — Hebrew utilities and their users (the free-equivalent register).
- [ ] **37** Firefox (16) — `https://addons.mozilla.org/api/v5/addons/addon/hebrew-il-language-pack/` — the Hebrew
      audience's size.
- [ ] **38** Pebble (19) — `https://kiezelpay.com/faq/` — Pebble apps onboarded in 2026; Israel; camera; any fee.
      **Pre-registered kill on a no.**
- [ ] **39** Pebble (19) — `https://apps.repebble.com/faces` — whether the store lists and ranks new faces.
- [ ] **40-45** Spreadshirt (17) — `https://www.spreadshirt.com/terms-and-conditions-for-shop-partner-C2376`;
      `https://help.spreadshirt.com/hc/en-us/articles/207905515-Payment-of-Your-Commission`;
      `https://help.spreadshirt.com/hc/en-us/articles/11874067093404-Tax-Form-Information-for-Non-US-Partners`;
      `https://www.spreadshirt.com/blog/2024/12/03/simplified-partner-taxation-and-payout-process/`;
      `https://www.spreadshirt.com/blog/2024/06/07/ai-and-designs-dos-donts/`; `https://developer.spreadshirt.net/` —
      automation and AI terms, payout rail and Israel, W-8BEN, EU/NA account split, any upload API.
- [ ] **46-48** PayPal Israel (21) — `https://www.paypal.com/il/legalhub/paypal/useragreement-full?locale.x=en_IL`;
      `https://www.paypal.com/il/webapps/mpp/ua/useragreement-full`;
      `https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183?locale.x=en_IL`
      — verification requirements (the identity article is followed from the agreement's verification section, never
      guessed); ILS withdrawal; fees.
- [ ] **49-50** n8n (20) — `https://api.n8n.io/api/templates/search?rows=100&page=1`; `https://n8n.io/creators/` —
      ordering, the paid-unlock condition, the AI rule.
- [ ] **51** Apify visibility (Q5) — `https://api.apify.com/v2/store?search=israel&limit=1000&includeUnrunnableActors=true`
      and the same URL without the parameter — the hidden share. (Apify's KYC requirements: a GitHub read of `apify-docs`,
      noted in the row, not a render.)
- [ ] **52** Spreadshirt (17) / any EU venue (Q10) — `https://eur-lex.europa.eu/eli/reg/2022/2065/oj` — Articles 30-31.
- [ ] **53-55** Play Books (18), Batch B — `https://support.google.com/books/partner/table/6052428?hl=en`;
      `https://support.google.com/books/partner/answer/3250840?hl=en`;
      `https://support.google.com/books/partner/answer/4490848?hl=en` — Israel on the payment-country list; fees.
- [ ] **56-58** Wix (11), Batch B — `https://help.tipalti.com/hc/en-us/articles/31314361313815-Payment-methods-coverage-US-ROW`;
      `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-market-guidelines`;
      `https://dev.wix.com/docs/build-apps/launch-your-app/market-listing/add-your-company-info` — payout coverage,
      guidelines, what the listing publishes about the company.
- [ ] **Batch C** (later ticks, in the plan's §6.5 order): the second-tier URLs (WordPress.org guidelines, Shiur Hofshi,
      GameDistribution, Wavedash, Zazzle, TeePublic, LottieFiles, Facer, SeaArt, Tensor.art, Nexus Mods, CurseForge,
      Teachers Pay Teachers, MCPize, Apple Books), ArrangeMe's terms only (`https://www.arrangeme.com/terms`), and the
      e-vrit help page. GameMonetize's two URLs only after a game passes CrazyGames.

### `research/rendered/urls.txt`

- [ ] Each new URL with a citing comment `# ZERO-TESTS.md row N — <venue> (<queue row>)`, in the file's existing format.
      **Dispatch 1 (this tick):** rows 33-52 plus the row-30 terms PDF. **Dispatch 2 (next tick):** rows 53-58.
      **Dispatch 3+:** Batch C. `parseUrlList` must still pass on the real file.

### `src/revenue/owner-steps.ts`, `src/__tests__/revenue/owner-steps.test.ts`, `runner.test.ts`, `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`

- [ ] **Step 8 added** (`id: "brand-mailbox"`, number 8, ordered second after `merge-pr` in the ask-now sequence): title,
      minutes ~10, `unlocks` per Q2 (Google account under the brand; Outlook.com fallback; a second Gmail connector plus a
      CI token in a secret; the colony answers accessibility mail; disclosure line on every written question; the address
      published only as the accessibility contact), `lines: ["il-biz-tools"]` plus the candidates it unblocks in prose.
      The "an eighth step needs a decision, not a commit" test is changed **deliberately**, citing this ruling and the date.
- [ ] **Step 4:** Part B(b) exactly. **Step 7:** drop the 4a sentence.
- [ ] `docs/OWNER_STEPS.he.md`: a new "צעד 8" section in gender-neutral Hebrew (infinitives, no second-person gender), the
      step-4 edits of Part B(b), the header note at lines 12-13, summary-table rows 4, 7 and a new row 8, the "סך הכול"
      line; in "מה מגיע רק אם קו מתחיל להרוויח": PayPal → *"proposed step 13, conditional (Q3)"*; Apify verification →
      *"at the Publish sitting if document-only, else never (Q5)"*. Nothing else in the document is re-rendered.
      Regenerate the PDF (`node scripts/owner-steps-pdf.mjs`); the doc–code order test passes with the new order.

### `src/revenue/bounties/intake.ts`, `src/__tests__/revenue/bounties-intake.test.ts`, `skills/revenue-oss-bounties/SKILL.md`, `docs/INCOME_PLAN.he.md`

- [ ] Part B(a) exactly: `capacityBaseIls()` replaces the constant; the tests named there; the prose that describes the
      floor's basis follows the code.

### `src/revenue/portfolio.ts`

- [ ] `oss-bounties.humanSetup`: 4b and the token with step 7; no 4a.
- [ ] `apify-actors`: the stranger-runs criterion and its basis gain the biased-low label and the Q5 rule (TEST_MORE under
      10 until verification is settled; verification at the Publish sitting only if document-only). `report`/`dashboard`
      print the label beside the KPI.
- [ ] No new seed. Nothing is admitted.

### `docs/REJECTED.md` (dated paragraphs, 28.9 breadth board)

- [ ] Whop (`:1068`) re-recorded camera-gated; Apify hidden-Actor note under `:820`; ArrangeMe deferred-not-queued with
      its reopen trigger; Pebble's pre-registered kill; Shopify's pre-ruled conditional kill; the confirmed §6.1 and §6.3
      kills with grades; the scout-grade deaths listed as such (not kills); the Odoo/iCount/Code4rena note.

### `research/breadth/`

- [ ] Save the three missing scout families' JSONs and the verifier and critic notes from the run (Review item 19) — the
      main thread's task; note in `BREADTH-SWEEP.md`'s header when done.

### Logs

- [ ] `logs/2026-09-28-breadth-board-applied.md` in Hebrew (the eight sections of `CLAUDE.md`), by the agent that applies
      this; the main thread's tick log points here.

### Verification before "done"

- [ ] `pnpm typecheck`; `npx vitest run src/__tests__/revenue`; `render-watch.test.ts`; `parseUrlList` on the real
      `urls.txt`; `sync-portfolio` then `report`; the PDF regenerated and its first page checked; a grep of every edited
      owner-facing file for the owner's identifiers returns 0 hits.

---

## What this board did not verify, stated so it is not mistaken for verified

- Every venue fact in Part A rests on the sweep's grades as recorded (github, snippet, rendered); the board re-read the
  plan and its review, not the platforms. The Batch A renders are what would refute any of it.
- That Google's brand-account sign-up asks only for a phone number — INFERENCE; the fallback is written for the case it asks
  for more.
- That Apify's identity verification is document-only — REPO grade from `docs/OWNER_STEPS.he.md:418`; the GitHub read in
  Q5 settles it.
- The Polar fee figure (5% + 50¢) is quoted from `CHANNEL_LOOP.md` §4 row 9's rendered reading; the comparison to Gumroad
  is arithmetic on a ₪79 sale.
- Part C's ranges are the repo's former targets, audited ceilings and the sweep's arithmetic, none of them measured by a
  buyer; the grade column says which.
