# Ruling — the loop board, 29.9.2026 (FABLE_QUEUE row 14)

**Sitting:** 29.9.2026, ~07:11 UTC tick; one of the day's two Fable agents. No subagents. No git writes, no edits to
`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md` or `docs/REJECTED.md`:
the main thread folds this file (see "Edits for the Opus fold").
**Read:** `MISSION.md` in full; `research/channel-loop/SITTING-2026-09-29-BRIEF.md` header, Part A, Part C;
`logs/CHANNEL_LOOP.md` §1-§10; `research/channel-loop/BOARD-LOOP.md`; `research/breadth/BOARD.md`; and every pointer
below was opened, not taken from the brief's paraphrase.
**Grades.** `rendered` = a stored capture, cited with its line or byte offset; `github` = a platform's own source or
docs read from GitHub; `snippet` = a search-engine snippet; `repo` = this repo's own notes and code; `inference` =
this board's reasoning, marked.
**Hashes.** git was available. Every commit the brief marked UNVERIFIED exists with the date claimed: `ec3d259`
(29.9, four URLs retired), `9c0204c` (29.9, prize intake list-count), `a91d45e` (28.9, pcn874 page), `19f63cf` (28.9,
brand-mail tooling; `sent.json` empty), `bfaadc1` (29.9, TikTok NOW actions), `ebbfce0`, `61fae4e`, `baab472`, `4c73f67`,
`b2cfd48`, `aca0900` (`git show --stat`). The working tree carries one uncommitted modification, `scripts/merge-worktree.sh`.
**Standing rules applied.** Admission only for a candidate whose ₪0 test has returned (`BOARD.md:38-39`, repo); the
built-but-unlaunched cap is 6/6 and binding (`CHANNEL_LOOP.md:91, :96`); the owner does one-time identity and payout
steps only (`MISSION.md:411-420`), never a per-item action (`CHANNEL_LOOP.md:75`), "no manual ops" (`MISSION.md:211`);
steps are named "once per summary, without nagging" (`MISSION.md:401-403`); charging for something already free is a
violation (`MISSION.md:434-439`); ₪0 with fees taken out of a sale allowed (`:352-360`); no account opened in the
owner's name by us (`:339`); nothing public carries the owner's name (`:275-279`). Hard constraints on every action
below: ₪0, no camera step, no tiktok.com fetch, no per-item owner action.
**Money today:** ₪0.00 in the ledger, 0 channels running (`CHANNEL_LOOP.md:25`, repo). Nothing in this file is revenue.

---

## (a) Firefox Add-ons (queue row 16): KILL

**RULING.** Firefox Add-ons is **KILLED** on G4, at rendered grade, with the reopen condition below. Proposed step 14
(a Mozilla add-ons account) leaves §6.

**BASIS.**
- The admission gate was set in writing: "Before admission, name in writing one Pro feature that is free nowhere (our
  own il-biz-tools included); none → not admitted (G4)" (`BOARD.md:72`, repo). The sweep made that condition a venue kill
  by itself (`BREADTH-SWEEP.md:473-474`, repo).
- The only Pro feature the colony has, "your logo and accent colour on the printed document"
  (`products/il-biz-tools/README.md:21`, repo), is refuted on **evidence, not absence**: a logo on the invoice is free
  in `free-invoice-generator`, `merabill-gst-invoice-generator`, `estimate-invoice-maker` and SnapInvoice's free tier,
  plus two AliExpress generators at 696 and 219 users (`firefox-amo.md:132-137`, read from
  `research/rendered/amo-search-invoice.json`; rendered). The accent colour rests on absence from 50 of 281 results
  (`:135-136`), which is why it cannot carry a PARK: reading the other 231 results can only add free colour pickers, it
  cannot un-free the logo.
- The market reading points the same way: nine general invoice makers, median 1 daily user, maximum 20, created
  2019-2026; the closest analogue (offline, logo free, one-time PRO) has 0 users after 29 days (`:139-142`; inference on
  rendered counts). The empty slot on AMO is the free Hebrew/RTL receipt base, already free on our own site
  (`:144-146`).
- The policies are friendly and are not the reason: no fee, paid features allowed with disclosure
  (`amo-add-on-policies.txt:2051`, rendered), machine-generated code allowed with source (`:2069`, rendered). A friendly
  venue with nothing to sell is still nothing to sell.
- PARK was the alternative. It fails on the loop's own economics: a parked row keeps a proposed owner step alive
  (`CHANNEL_LOOP.md:220`) for a venue whose sole Pro feature is refuted, and MISSION rule 1 says never keep a step that
  is not required (`MISSION.md:415-416`).

**WHAT THE LOOP DOES NEXT.** Opus main thread: a `docs/REJECTED.md` entry (grade rendered, this reopen condition); §4 row
16 marked killed; a §7 line; step 14 removed from §6 "held, not asked" (`CHANNEL_LOOP.md:220`); no render dispatch for AMO.
This kill does **not** touch il-biz-tools' own Pro; that is row 15(a)'s question and its ruling is not read here.

**REOPEN IF** either holds, checkable later without this board: (i) `RULING-2026-09-29-lines.md` (a) names a Pro feature
for il-biz-tools that is free nowhere, **and** a later render of AMO's `q=invoice` pages 2-6 (231 results) shows no add-on
offering that feature free, and the free-elsewhere register (`firefox-amo.md`) records the check; or (ii) a later render
of the same AMO search shows the general invoice-maker cohort at a median of ≥ 30 daily users (the Obsidian analogue,
`BREADTH-SWEEP.md:474-475`). Either reopens Firefox as a **candidate for a ₪0 test**, not as an admission.

---

## (b) The loop's policy when every ₪0 test returns NEEDS_MORE and the answers need the brand mailbox

**RULING.** **No third refill.** **No "asking harder."** Step 8 moves to **first** in the free batch, stated once with the
count of what waits on it. Rendering continues **only where a render can kill or admit without step 8**; otherwise the
render cap is left unused and "idle-by-cap" is written honestly. Agent capacity goes to instruments and one tooling
change (a JavaScript-capable render mode), which count as rendering for this rule. A third refill runs only under the
trigger and filter in item 4.

**BASIS.**
1. *The parking lot is real and it has one gate.* Of 25 venue rows, 7 are parked on step 8 with nothing left to render, in
   their notes' own words (Wix `CHANNEL_LOOP.md:134` "docs exhausted"; Spreadshirt `:141`; n8n `:144` "forum exhausted";
   Indiebook `indiebook.md:199-201` "No more indiebook.co.il renders"; Displate `CHANNEL_LOOP.md:150` "Nothing left to
   render but the sign-up page"; Teach Simple `:152`; CrazyGames `:130`; all repo). Seven one-question emails are drafted
   with recipients, disclosure lines and pre-send conditions (`research/owner-asks/questions.json`, repo: crazygames, wix,
   spreadshirt, n8n (web form only, `to: null`), indiebook, displate, teachsimple), the sender is built (`19f63cf`,
   github/repo), and **nothing has been sent** (`sent.json` `"sent": []`, repo). Step 8 also gates il-biz-tools' publish
   (`CHANNEL_LOOP.md:117`), the pcn874 page that rides it (`:118`), npm step 9's account email (`:210`), and Displate's
   login email (`:150`).
2. *Two refills already ran into the same gate.* 42 venues examined, 9 queued, 0 admitted; of the 9, three park on step 8,
   two on today's rulings, two have no route, two are proposed killed (`CHANNEL_LOOP.md:233, :236`, repo). A third refill
   under the same rules would add rows to the same lot and spend Opus tokens on venues that also need a mailbox.
3. *"Harder" is bounded by the mandate.* Owner steps are named "once per summary, without nagging" (`MISSION.md:401-403`).
   What the loop may change is **order and information**, not tone or frequency. Step 8 unblocks more items than any other
   free step (item 1 above), so it is honest to list it first.
4. *Not every test is exhausted, and the brief's list needs one correction.* Astro's two GitHub reads (`astro-themes.md:186-196`)
   **were done on 29.9** (§"29.9 (GitHub read)" and Tick 15, `:482-590`, repo), so Astro is not "never queued": it now
   turns on (e2). Topcoder's `status=COMPLETED` render (`topcoder.md:163-166`) was never run and is a pre-registrable kill
   (fewer than three auto-scored paid challenges a month, `BOARD-LOOP.md:169`). Mozilla's 30-day dry run never started
   (`CHANNEL_LOOP.md:132`). Trolley's identity page, GameDistribution's payment FAQ and n8n's Creator Hub are JavaScript
   shells the plain-GET runner cannot read (`topcoder.md` Tick 15; `html5-syndication.md:235`; `CHANNEL_LOOP.md:144`).
5. *A JavaScript-capable fetch is rendering* for the purposes of this rule (the brief's open question). It is a tooling
   change to `scripts/render-watch.mjs` (no `playwright`/`puppeteer`/`headless` string exists in it today; repo grep), it
   runs on a GitHub runner at ₪0, and it is a plain read of public pages under the same terms gate as every render (the
   TikTok pause `CHANNEL_LOOP.md:245` stands verbatim). It is the only ₪0 route to two decisions the mailbox would
   otherwise carry: Topcoder's selfie (Trolley) and GameDistribution's rail.

**WHAT THE LOOP DOES NEXT** (concrete; all runner or agent work unless marked owner):
- **Tick 16 (this fold):** apply this ruling and row 15's. §6 free batch becomes: 1 step 8 (brand mailbox, ~10 min);
  2 network allowlist (2 min); 3 step 6a Apify; 4 step 7 organisation. The summary's one line about step 8 states the
  count: "7 written questions, il-biz-tools' publish gate, pcn874's page, npm's account and Displate's login wait on it."
  Nothing else about step 8 is written anywhere else in the tick. Owner: nothing new.
- **Tick 16-17, instruments (outside the BBU cap, `BOARD.md:131`):** wire the il-biz-tools / pcn874 page-view KPI read path
  (the counter is off and nothing reads it, `CHANNEL_LOOP.md:118`) so the 100-view kill can run from D0; build the
  prize-intake rules-page half (BOARD-LOOP §13; the list-count half is `9c0204c`).
- **Tick 17-18, tooling:** a JavaScript-capable render mode in `render-watch` (Playwright on the runner; opt-in per URL by a
  flag in `urls.txt`; the target's terms must already be rendered and must not bar automated access, exactly as for a
  plain GET; never a tiktok.com URL). Then one dispatch for: Trolley identity verification (Topcoder), the GameDistribution
  payment FAQ (rail), the n8n Creator Hub. **Pre-registered:** if Trolley's rendered text names a selfie, liveness or video
  step, Topcoder is killed on the camera rule without a sitting; if it names document-only verification, Topcoder's
  `COMPLETED` render is queued next (its own pre-registered kill: < 3 auto-scored paid challenges in the last 30 days).
- **Tick 18+, the one owner-free ₪0 test that is not a render:** Mozilla's dry-run harness, only after a runner has read the
  account's Actions spending limit as $0 (so private-repo minutes can never bill) and only inside the free private-repo
  allowance; nothing filed; the private repo moves at step 7. It is agent work, not a product build, and does not enter
  BBU. If the free allowance cannot hold a meaningful run, the tick records that and does not extend it.
- **Standing:** one render dispatch per tick only when a queued URL exists that can kill or admit; otherwise record
  "idle-by-cap: awaiting step 8" and move to instruments, prep and maintenance (`BOARD-LOOP.md:17` order (i)-(vi)).
- **The hour step 8 lands (owner one-time step):** send in the drafted order 1-7 after each `preSend` check (n8n's web form
  is a browser session and waits for the runner mode above); add to Wix's held list the exempt-dealer question from (e);
  Facer gets **no** question (killed in (f); no face product exists).
- **A third refill runs only when both hold:** (i) every unrendered ZERO-TESTS row for a queued candidate has been rendered
  or retired (rendering exhausted, not a date), and (ii) the refill is **filtered to venues decidable without a mailbox**:
  a documented submission API or CLI, a payout rail already rendered for Israel with no camera, and terms readable by the
  runner. A venue that would need a written question is not queued by a refill while step 8 is undone.

**REOPEN IF** step 8 is done (the parking lot drains and the ordinary protocol resumes), or 14 days pass with step 8
undone **and** the instrument and tooling items above are finished, in which case the next sitting revisits whether a
filtered refill is worth its tokens.

---

## (c) The next admission candidate: none today; a pre-registered order for the next sitting

**RULING.** **Nothing is admitted.** No queued venue has a returned ₪0 test with every gate passing (`BOARD.md:38-39`);
Firefox, the board's named candidate (`BOARD.md:84-85`), is killed in (a). The **pre-registered order** for the next
admission sitting, each conditional on its own step-8 answer, is: **1 Displate (26), 2 Indiebook (22), 3 Teach Simple
(28), 4 CrazyGames (6)**. Displate carries a pre-registered kill: a written **no** to its drafted question is KILL-4 without
a sitting (the Spreadshirt pattern, `BOARD.md:75`).

**BASIS.**
- **Displate.** Most gates pass at rendered grade: free to join, no portfolio review; no AI ban (AI bars only the Verified
  Creator badge); fixed $4.50/$9.00/$14.50 per sale; PayPal from $50; pseudonym accepted; G7 pass (public profile shows
  what the holder selects) (`CHANNEL_LOOP.md:150`, repo, citing `displate-about-regulations.txt` and the privacy chunk).
  Open: kill (d), automation, UNSETTLED on two clauses read today: accounts "created using automated tools (e.g., bots)"
  may be deleted (`displate-about-regulations.txt:471`, rendered) and the site must not be used "in a way that does not
  distort its functioning, in particular through the use of certain software" (`:561`, rendered). Under (e2) below neither
  clause bars a runner operating an owner-opened account, but Displate's own reading governs, so the drafted question
  (`questions.json` venue `displate`) decides. Owner steps it would need, all one-time: the SMS code at first publication
  (`:455`, rendered; identity-lite, camera-free, the same class as step 8's phone check, `BOARD.md:100-101`); step 2, because
  an Artist "is not a consumer" (`:98`, rendered); step 13 (PayPal), whose condition (i) is confirmed in (g). The shop opens
  on the brand mailbox (`CHANNEL_LOOP.md:150`).
- **Indiebook.** G2 passes and the store is the merchant of record (`indiebook-terms.txt:127`, rendered); the quarterly
  document is settled in (e)/(h). The pre-admission bar, "name one Hebrew title and what it gives that is not already
  free" (`CHANNEL_LOOP.md:146`), is unmet (`indiebook.md:202-203`, repo). Behind Displate because supply is unnamed.
- **Teach Simple.** G3 passes at rendered grade because the platform's own team uploads (`teacher-and-ebook-stores.md:30-34`,
  repo citing `become-a-contributor.txt:264-265`); G5 leans FAIL (a points-share subscription pool, `:42`); the originality
  warranty is a real honesty risk for purely AI output (`:39`); admission by application. Third.
- **CrazyGames.** Waits on (e2) and its written question; step 10 is identity plus Tipalti onboarding; a game costs 5-10
  agent-days (`BOARD-LOOP.md:125`). Fourth: the most expensive first build in the queue.
- With the cap at 6/6, admitting anything today would start no build (`CHANNEL_LOOP.md:96`); this order therefore changes
  sequence, not timing, and the sitting says so rather than admitting on paper.

**WHAT THE LOOP DOES NEXT.** Opus: record this order in `CHANNEL_LOOP.md` §8 ("the next admission sitting takes the first
of Displate, Indiebook, Teach Simple, CrazyGames whose written answer returns"); Displate's `preSend` in `questions.json`
gains the pre-registered kill on a written no. No build. Owner: nothing new.

**REOPEN IF** a written answer returns for any of the four (the next sitting admits or kills on it), or a candidate not
on this list returns a PASS on every gate first.

---

## (d) The §9 wording fix: already adopted at Q9 — confirmed, the stale line goes, and two corrections are adopted

**RULING.** **Confirmed.** The breadth board adopted the `BOARD-LOOP.md:127` wording at Q9: "the €100 threshold; payment
30 days after invoice per the developer terms, NET 60 per the payouts page" (`BOARD.md:197-198`, repo). `CHANNEL_LOOP.md:257`
records it; `:264` still sits under "Open" and is deleted. The two further corrections noted at `CHANNEL_LOOP.md:130` are
**adopted** into §4 row 6 and §9 (BOARD-LOOP is the design and is not rewritten):
1. "≥500 real players" → Basic Launch "ends once your game has been live for at least 7 days and has reached at least 500
   plays. Both thresholds need to be met … the period ends automatically after 21 days"
   (`crazygames-basic-launch-metrics.txt:199`, rendered). Plays, not players.
2. The kill "two consecutive games below Basic Launch benchmarks (10 min, 10-15% D1, 80% conversion)" is **re-based**: the
   page frames those numbers as "What success looks like" (`:216, :234, :252`, rendered), not pass lines. The measurable
   verdict is CrazyGames' own: the kill becomes "two consecutive games that end Basic Launch (7 days and 500 plays, or 21
   days) without a Full Launch invitation"; the three numbers stay as diagnostics beside the reading.

**BASIS.** "due and owing thirty (30) days after the date of Publisher's invoice" (`crazygames-developer-terms.txt:284-285`,
rendered); "NET 60 payment terms" (`crazygames-payouts.txt:305`, rendered); €100 (`:299, :301`, rendered).

**WHAT THE LOOP DOES NEXT.** Opus: §4 row 6 and §9 text; delete `:264`. Nothing else.

---

## (e) The replenish pass's proposed kills

### (e)1 Y8 kill (a): does NOT fire; Y8 PARKS behind CrazyGames

**RULING.** Y8's proposed kill (a) is met **as worded** on rendered text but the wording assumed the answer to the invoice
question; under (e)3 a colony-issued invoice after step 2 is not owner paperwork, so **(a) does not fire.** Y8 **parks**
behind CrazyGames per `BOARD-LOOP.md:178` and rides the (e2) conditions for its portal.

**BASIS.** "You need a valid invoice to receive payments directly from Y8" (`y8-revshare.txt:393`, rendered); payment
"after accepting a complete and valid invoice" (`:397`); the two routes are Y8's managed partnership (YMP) or the
developer's own AdSense (`:385`). The AdSense route is closed to us (an ad account in the owner's identity with a postal
PIN; not asked). Whether the portal generates the invoice is UNKNOWN: the docs "deliberately" do not mirror the portal
(`y8-docs-overview.txt:91-93`, rendered). Either way the document goes privately to the payer, which is the payout identity
MISSION already allows (`MISSION.md:299-301`). Y8's automation clause bars "Bots, automated plays, fake traffic, invalid
clicks" on live games (`y8-revshare.txt:429`, rendered): traffic, not portal operation; it does not bar (e2)'s route and it
does bind our watchers (no synthetic plays, ever).

**WHAT THE LOOP DOES NEXT.** §4 row 14: Y8 "parked behind CrazyGames; kill (a) does not fire (29.9 ruling (e)); portal per
(e2)"; the Y8 portal question is drafted only when a game exists. No render.

**REOPEN IF** a game passes CrazyGames Basic Launch (Y8's ₪0 test then finishes: its portal question, Israel payability, and
whether the invoice is portal-generated), or Y8 publishes a rule barring automated portal use (KILL-4).

### (e)2 GameDistribution's per-game publish request: decided by (e2); `:183` does NOT fire today

**RULING.** The per-game chain (upload, open the iframe, watch the demo ad, copy the game ID, request publishing) is a set
of **portal acts**, none written as a person's act, and the ad is a fake demo so no billable impression is created. Under
(e2) that is not a "per-game human step". GameDistribution **parks behind CrazyGames**, subject to (e2)'s conditions and
one written yes.

**BASIS.** "A demo VAST tag for calling a fake advertisement is already enabled" (`gamedistribution-sdk-implementation.txt:275`,
rendered); watching it completely approves the SDK (`:281`); the 2018 FAQ places the watch "only … within your
Gamedistribution.com control panel" (`gamedistribution-wiki-faq.txt:180`, rendered) and the publish request is "clicking the
designated button" (`:182`); publishing is gated on the SDK (`gamedistribution-developer-terms.txt:141-142`, rendered);
no upload API (`html5-syndication.md:226`, repo); tick 8 withdrew the lean to kill (`:175-177`, repo). The terms' one access
clause, "No monitoring. You may not access the Distribution Platform, including the Games, for monitoring availability,
performance, or functionality" (`:20`, rendered), bars our watchers from polling a live game: the plays KPI must come from
GameDistribution's own dashboard or reports, a PUBLISH-3 constraint, not a kill. GameDistribution self-bills ("sends a
credit invoice to the Developer", `:187`, rendered), so no invoice question arises.

**WHAT THE LOOP DOES NEXT.** §4 row 14 text: `:183` does not fire on the ad-watch or the publish click; parked behind
CrazyGames; rail UNKNOWN until the JavaScript-capable render of the payment FAQ ((b) tick 17-18). No question drafted before
a game exists.

**REOPEN IF** the rail renders as excluding Israel or requiring a camera (kill), or a game passes CrazyGames (the ₪0 test
finishes).

### (e)3 Is an invoice the colony issues in the owner's legal name after step 2 owner paperwork? NO, under six conditions (covers Y8, Wix, Indiebook)

**RULING.** A payment demand, receipt or invoice that the **runner generates and sends** to a paying platform after step 2
is **not owner paperwork**, and `BOARD.md:78` ("settled after step 2, never by owner paperwork") is confirmed, provided all
six hold:
1. **Step 2 is done** (the עוסק exists). Before it, nothing is issued and no line is put up for sale (PUBLISH-6).
2. **The number is read, never typed:** the amount comes from the platform's own statement, report or credit note (Y8's
   portal status, Indiebook's royalty report, Wix's payout dashboard), and the ledger row for that payout cites it.
3. **The document carries only what the law requires** of an עוסק פטור (`MISSION.md:302-303`: the name is law, "never
   volunteered beyond what the law requires"): the עוסק's name and number, a sequential number, date, payer, amount,
   period. No personal contact details beyond the brand mailbox.
4. **Sent from the brand mailbox (step 8) to the payer's finance address**, with the standing disclosure that it was
   produced and sent by the company's automated operator (`BOARD.md:106-107`).
5. **The owner does nothing per document**: no click, no signature, no review. They see the total in the report.
6. **Only the registered route.** Indiebook's unregistered route (a demand carrying the payee's full name **and ID number**,
   with maximum withholding, `indiebook-royalty-guide.txt:73`, rendered) is **never used**: a runner writing the owner's ID
   number into a recurring document is an identity datum handled per item, and maximum withholding is the owner's money
   held back. After step 2 the exempt-dealer route applies (`:69`, rendered).

**BASIS.** The mandate minimises the owner's involvement, not the company's paperwork (`MISSION.md:411-413`); a document
produced by software and sent by the company's operator costs the owner zero minutes, which is the test `CHANNEL_LOOP.md:75`
applies. The colony already ships exactly this generator with per-type auto numbering (`products/il-biz-tools/README.md:21`,
repo). Payers split two ways on rendered text: **self-billing** (CrazyGames, `crazygames-payouts.txt:339`; GameDistribution,
`gamedistribution-developer-terms.txt:187`) needs nothing from us; **payee-billing** (Y8 `y8-revshare.txt:393`; Wix, "against
a lawful tax invoice to be issued by the Party receiving", `wix-partner-agreement-body.txt:385`; Indiebook, a payment request
and tax invoice after each quarter, `indiebook-royalty-guide.txt:35`) is covered by the six conditions.

**Two things this board could not render, stated so they are not mistaken for settled:**
- **Wix's "lawful tax invoice".** An עוסק פטור issues a receipt or a transaction invoice, not a חשבונית מס. Whether Wix's
  finance accepts an exempt dealer's document is not rendered. **Condition, not kill:** Wix's held-question list gains
  "Does Wix accept a receipt from an Israeli exempt dealer (עוסק פטור) in place of a tax invoice?", sent only after Wix's
  first written yes. A written no makes Wix's payout depend on VAT registration, which is a cost decision for the owner
  under the ₪0 rule, not a per-payout step.
- **Whether Israeli bookkeeping rules let software issue the עוסק's receipts.** Not rendered here. **The one check:** a render
  of a kolzchut.org.il page on the documents an עוסק פטור issues (kolzchut rendered for step 2; the page is found by its
  site search, never guessed) or the Tax Authority's page on computerised bookkeeping if gov.il renders. Until it does,
  the six conditions apply and the first document is produced only after that read.

**WHAT THE LOOP DOES NEXT.** Opus: `CHANNEL_LOOP.md` §4 rows 11, 14, 22 carry "invoice: runner-issued after step 2 under
ruling (e)3"; `questions.json` Wix `heldQuestions` gains the exempt-dealer question; a ZERO-TESTS row for the kolzchut
read (plain GET; kolzchut rendered before). The owner page's step 2 section gains one sentence: after step 2 the company
issues its own payout documents; the owner signs nothing per payout.

**REOPEN IF** the bookkeeping read shows the עוסק must personally sign or issue each document (then every payee-billing venue
is per-item owner paperwork and Y8, Wix and Indiebook are killed under KILL-4 together), or a payer refuses a software-issued
document in writing.

---

## (e2) One portal ruling: CrazyGames, GameMonetize, GameDistribution, Y8, and the Astro theme catalogue

**RULING.** A per-item step that exists only in a web admin with no API, performed by a runner (headless browser, brand
login), is **not a "per-game human step" under `BOARD-LOOP.md:183`.** The word "human" in `:183` names **who must act**,
not where the act happens: it fires for steps a runner cannot honestly perform (a messenger or phone conversation, a
signature by the legal person, a camera, a CAPTCHA built to exclude machines, a review conversation). **But** BUILD-6 and
`:125` still require terms that **allow** a brand account operated by our runner (`BOARD-LOOP.md:49, :125`), and silence is
not allowance. So the route is **allowed only when C1-C8 all hold**; where the terms are silent, **C1 is met by one written
yes from the venue** (the CrazyGames route), never by inference. Where the terms forbid it, KILL-4 (`:67`).

**The conditions (all required):**
- **C1 Terms.** The venue's rendered terms either permit automated or non-human operation of the account, or are silent
  **and** the venue has answered the brand's written question with a yes or "no rule against it". A clause that bars only
  scraping, crawling, data-mining or **collecting others' content** does not bar operating one's own account (Indiebook's
  robots clause, `indiebook.md:203`; Teach Simple's scrape ban, `teacher-and-ebook-stores.md`; repo). A clause that names
  "agent", "software", "tool" or "automated means" for **any access** other than a browser does bar it (Facer, (f) row 11).
  A clause barring **bots creating accounts** (Displate `:471`) is not triggered, because the owner opens every account
  once (C5); a clause barring **automated plays or traffic** (Y8 `:429`) binds our watchers, not our submissions.
- **C2 Disclosure, no evasion.** The venue is told in writing that the account is operated by an automated agent for the
  brand (the `questions.json` disclosure lines), and the account's public "About" field says so where one exists. No
  randomised delays "to avoid detection", no anti-detect browsers, no copied cookies, no undocumented private routes:
  those are the RED class (`docs/REJECTED.md:282`; the CurseForge and TeePublic evidence, (f) rows 5 and 12).
- **C3 Credentials.** The login lives only in a GitHub **environment** secret limited to `main` with a required reviewer
  (the `npm-publish` pattern, `CHANNEL_LOOP.md:210`), never in the container, never a repository secret; the runner's
  session is not persisted.
- **C4 Login completes without the owner.** TOTP two-factor with its seed in the same environment secret is allowed; a
  one-time code sent to the brand mailbox (step 8) is allowed; **SMS to the owner's phone per login is a per-item owner
  action and is not** (a one-time SMS at account setup, Displate `:455`, is). A CAPTCHA the runner cannot pass is a human
  step: the tick stops, records it, and never uses a paid solver or the owner; if it recurs on the per-item path, `:183`
  fires for that venue. No capture of the four networks mentions a CAPTCHA or two-factor (grep of every `crazygames-*`,
  `y8-*`, `gamedistribution-*` text: 0 hits; absence, not proof).
- **C5 The account is the owner's one-time step.** Never opened by us (`MISSION.md:339`); only per-item operation is the
  runner's.
- **C6 Enforcement kills.** Any venue action against the brand account on grounds of automation or inauthenticity kills the
  channel the same day and pauses launches on that platform (KILL-3, `BOARD-LOOP.md:66`).
- **C7 Human steps stay human.** A per-item NDA or contract in the legal name, a signed non-acceptance notice, a phone call,
  a video, a messenger, or a review conversation kills under `:183` regardless of this ruling.
- **C8 It is a build.** Browser automation against a web admin is fragile code with tests; it takes the one build-in-flight
  slot when written, and it is written for a venue **only after that venue's C1 is met**. No speculative portal module.

**Applied to the five:**
- **CrazyGames.** Terms silent: "Silence neither allows nor forbids runner-operated submission" (`crazygames.md:388`, repo,
  on `crazygames-developer-terms.txt:50-51`). C1 turns on the drafted question, which asks exactly this ("an automated
  browser session run on the developer's behalf", `questions.json` venue `crazygames`). Parked on step 8, unchanged.
- **GameDistribution.** Every per-game act is a portal act ((e)2); terms silent on portal automation; "No monitoring"
  (`:20`) constrains the KPI, not the route. Parked behind CrazyGames; its question is drafted when a game exists.
- **Y8.** All portal (`y8-docs-overview.txt:77-80`); `:429` binds traffic only. Parked behind CrazyGames; same.
- **GameMonetize.** Nothing rendered (`BOARD-LOOP.md:181`). The ruling applies to it when its two URLs render, after a
  game passes CrazyGames.
- **Astro theme catalogue (row 7).** Two halves. **The login half passes at github grade:** the portal's only door is
  "Sign in with GitHub" (`astro-portal-themes-submit.txt:9, :11`, rendered), and GitHub's own Terms permit machine accounts:
  "A machine account is an Account set up by an individual human who accepts the Terms on behalf of the Account … used
  exclusively for performing automated tasks … You may maintain no more than one free machine account in addition to your
  free Personal Account" (`github/docs` `main`, `github-terms-of-service.md:84-86`, sha256 `7e2a7a7317a8…`, read 29.9;
  github). That account is step 7's `mehudak-ci` (`CHANNEL_LOOP.md:191-193`), opened by the owner (C5). **The venue half is
  silent:** the review guidelines regulate the listing, not the submitter ("Machine/AI translations are OK!"
  `astro-themes-guidelines-hackmd.txt:173`; Gumroad links accepted `:224`; every fix a portal re-save `:101`; rendered), and
  Astro's per-theme human review is **Astro's** act, not ours (the Teach Simple standard). So **Tick 15's KILL-PROPOSED on
  G3/G6 is NOT confirmed**; G3 and G6 move to UNKNOWN pending C1. The written question has no captured Astro address; the
  honest channel is a GitHub Discussion or issue on `withastro/astro.build` from the machine account, so it waits on **step
  7**, not step 8. Astro stays a **candidate**, ranked last among the parked: no colony product is a theme, a Hebrew RTL
  theme is 30-45 agent-hours (`CHANNEL_LOOP.md:131`), and the BBU cap is binding, so nothing is built before a written yes
  **and** a free slot.

**BASIS for the reading of `:183`.** The mandate's minimand is the owner's involvement (`MISSION.md:411-413`), and its
"no manual ops" (`:211`) is about the owner. `CHANNEL_LOOP.md:75` forbids "a per-item **owner** action". KILL-4's own wording
is "Terms forbid automated submission so every upload is an owner click" (`BOARD-LOOP.md:127`): the kill is the owner
click, which exists only when the terms forbid the runner. Reading "human step" as "web form" would also make BUILD-6's
alternative, "a brand account operated by our runner", meaningless, since a runner operating an account is exactly a runner
in a web form. The requirement that terms **allow** (not merely not forbid) is kept because the honest-value rule outranks
the target (`MISSION.md:434-439`) and a venue's objection after the fact is KILL-3 with brand contagion.

**WHAT THE LOOP DOES NEXT.** Opus: `CHANNEL_LOOP.md` §1 "Never" gains "a portal operated by the runner without the venue's
written yes (ruling 29.9 (e2), C1-C8)"; §4 rows 6, 7, 14 carry the applied lines above; row 7's status: "KILL-PROPOSED not
confirmed; G3/G6 UNKNOWN pending a written yes via a GitHub Discussion from the step-7 machine account; ranked last; no
build". The portal module is not written. Owner: nothing new (steps 7 and 8 are already asked).

**REOPEN IF** a venue's written answer is a no (KILL-4 for that venue, no sitting), a rendered clause names agents or
automated means for any access (KILL-4), or a CAPTCHA or SMS-per-login is met on the per-item path (`:183` for that venue).

---

## (f) The nineteen gate refutations in `docs/REJECTED.md`

The table is at `docs/REJECTED.md:1222-1234` (first refill, Wavedash, Facer), `:1243-1251` (second refill), `:1256-1263`
(StreetLib). Evidence sources: **R1** `research/breadth/REPLENISH-2026-09-28.md:235-305`; **R2**
`REPLENISH-2026-09-28-2.md:341-426`; both opened. Where (e2) bears, the rule is: **a G3 refutation on "web form only, no
API" is confirmed as it stands today** (silent terms plus no written yes fail C1), **with the reopen trigger widened** by
one clause, "or the venue's written yes to a brand account operated by an automated browser, with disclosure". The
widening changes nothing now: none of these venues is on the §4 queue with a product, so none receives a question.

| # | Venue | Ruling | Basis (grade) and note | Reopen |
|---|---|---|---|---|
| 1 | Shiur Hofshi | **CONFIRM** G5 | Absent from all 20 Israel CrUX monthly lists (R1:237-240, github). The DNS failure proves nothing (a made-up .co.il failed the same way, R1:241-242); the kill rests on CrUX alone and that is enough for a venue with no product. | a 200 render **and** a CrUX IL entry |
| 2 | Teachers Pay Teachers | **CONFIRM** G1, **at github-quoting grade, not TPT's own page** | $29 one-time Basic, $59.95/yr Premium, a third-party note quoting TPT's fees page (R1:245-250, github); the confirming render was 403 (`hebrew-teacher-sites.md:72-75`, repo). Any up-front fee is a kill under the ₪0 rule (`MISSION.md:352-355`). | the rendered fees page shows a free seller tier |
| 3 | Fitbit Gallery (+ KiezelPay) | **CONFIRM**, re-based | G3/G6 as stated is C1-shaped ("its own dashboard session", R1:257-261, github) and is confirmed as it stands; the kill also rests on G5: current watches "take no third-party apps" (R1:262, github) and KiezelPay's FAQ has no date after 2016 (`kiezelpay-faq.txt:221`, rendered for Pebble). | a submission API or CLI publish, **or** a written yes **and** a current Fitbit device that takes third-party faces |
| 4 | Nexus Mods | **CONFIRM** | One web step per mod before the API can be used (R1:264-268, github): C1 fails today; no mod product exists. | the v3 API adds mod creation, **or** a written yes |
| 5 | CurseForge | **CONFIRM** | The token API covers existing projects only (R1:272-274, github); the only creation route seen uses the owner's copied cookies, which is the RED shape (R1:275-277; `REJECTED.md:282`). The brief is right that a brand login in an ordinary browser is **not** cookie reuse (C2), so the RED note describes the tool, not our route; C1 still fails (no API, no written yes). | a project-creation API, **or** a written yes |
| 6 | SeaArt | **CONFIRM** | No publish command in the official CLI; web App Builder only (R1:280-284, github, absence). C1 fails today. | a publish endpoint, **or** a written yes **and** G2 rendered |
| 7 | Apple Books direct | **CONFIRM** at snippet grade, marked "dead until rendered" | The legal entity name is the default public seller name; a different name needs a DBA-type document (R1:286-292, snippet; a live listing shows a personal seller name, github). A snippet-grade kill is a kill only until Apple's page renders; the brand-only rule (`MISSION.md:275-279`) makes the basis decisive if the text holds. | the rendered help page shows a seller display name settable without a legal document, then G2 rendered |
| 8 | Apple via PublishDrive / Draft2Digital | **CONFIRM**; the D2D half **upgraded to G1 at rendered grade** | PublishDrive $9.99/month (R1:295, github; a subscription, twice forbidden). D2D: "a one-time Account Activation Fee is required" plus $12/yr (`draft2digital-com-terms-of-service.txt:490-491`, rendered), so D2D fails G1 rendered and its snippet-grade G4 is no longer load-bearing. | a commission-only aggregator reaching Apple that takes disclosed AI (StreetLib was the candidate and fails G1, row 19) |
| 9 | LottieFiles | **CONFIRM** G4 | Loaders, icons and micro-interactions are free everywhere, LottieFiles' own library included (R1:299-303, snippet + github); the standing zero-price floor (`REJECTED.md:1000-1001`). | a Lottie product with a named feature free nowhere |
| 10 | Wavedash | **CONFIRM** G3 as it stands; `:183` reading replaced by (e2) | The CLI never writes store metadata; "Set these under Metadata in the Developer Portal" (`wavedash-llms-full.txt:4731, :4738`, rendered; `wavedash.md:162-164`, github). Under (e2) that portal step is a runner step, not a human step, so the recorded sentence "That is 'a per-game human step'" is **withdrawn**; the kill stands on C1 (silent terms, no written yes; the reader itself declined to propose driving an undocumented portal route, `:166-167`). No game exists. | a CLI/API metadata write, **or** a written yes |
| 11 | Facer | **CONFIRM** G3 at rendered grade; the anti-scraping question answered: **barred** | The clause bars attempting to "access or search the Services or Content … through the use of any engine, software, tool, agent, device or mechanism (including spiders, robots, crawlers, data mining tools or the like) other than the software and/or search agents provided by Little Labs or other generally available third-party web browsers" (`facer-templates-js.bin` bytes 475268-475582, decoded by this board; rendered). **Ruling on the wording:** wording that bars only crawlers collecting content does not bar operating one's own account through a browser (C1); wording that names "agent" and "software" as prohibited **means for any access**, with the carve-out covering the browser and not what drives it, does. Facer's is the second kind: the list is "including", not exhaustive, and an agent operating a browser attempts access "through the use of" an agent. When the plain words go both ways, the honest-value rule decides against us (`MISSION.md:434-439`). Also one web form per face, `.face` import admin-only, no API (`facer.md:127-152`). Fitbit fallback (`facer.md:151-152`) is (e2)-shaped and not needed. | a creator upload API, **or** Facer's written yes to an agent operating Facer Creator for a brand account |
| 12 | TeePublic | **CONFIRM** G3 as it stands, with the weakness recorded | No upload API (R2:343-345, github, absence); the one tool evades detection (R2:345-347), which says nothing about an open agent (C2) and is not our route; TeePublic's own rule is unread (R2:351-352). C1 fails today. Its rail is Payoneer, camera-gated at scout grade (`BOARD.md` Part C row 3). | an upload API, **or** a written rule or yes permitting automated uploads, **and** a camera-free rail rendered |
| 13 | WordPress.org plugin directory | **CONFIRM** | Survives (e2): G5 fails regardless, ranking multiplies install history (R2:368-369, github; `REJECTED.md:690-731`). The 2FA and nonce form are C4-shaped, not a kill by themselves. | a submission API, or a sitting accepting one owner upload per plugin; G5 would still stand |
| 14 | WordPress.org theme directory | **CONFIRM** as it stands | Login, 2FA, nonce form (R2:373-376, github): C4 handles the mechanics, C1 fails (silent, no yes); no theme product; nothing is lost. | a theme submission API, **or** a written yes **and** a theme product |
| 15 | WooCommerce.com | **CONFIRM** on G6 | A standing vendor support duty with ratings and removal on failure (R2:386-388, github), the Atlassian precedent; a business review per product; bars outside upsell links (R2:389). G3 alone would be (e2)-shaped; G6 carries the kill. | Woo drops the vendor support duty **and** adds a submission API |
| 16 | MCPize | **CONFIRM** G5 | Absent from all 40 CrUX lists (R2:394-395, github). "CrUX measures traffic, not buyers" cuts toward the kill: no traffic, no buyers, and a paid plan is bought on its website (R2:396-397). | enters CrUX **and** an Israeli payout with no camera is rendered |
| 17 | AgenticMarket | **CONFIRM** G5 (G2 recorded as likely) | Absent from all 40 CrUX lists (R2:416, github) suffices; the G2 half (commit `93ec039` made calls free, R2:408-413) carries the recorded weakness that the lower README still describes payouts and the dates were not re-checked. | `/pricing` renders paid calls and payouts with a route to Israel **and** the origin enters CrUX |
| 18 | MCP Marketplace | **CONFIRM** G5 | Absent from all 40 CrUX lists (R2:421, github). | enters CrUX **and** an Israeli payout is rendered |
| 19 | StreetLib | **CONFIRM** G1 at rendered grade; now **board-registered** | "authors and publishers located internationally … are subject to our membership plans" (`help-streetlib-com-article-425-account.txt:69`, rendered): "$99 per year" (`:73`) or "$299 one-time payment" (`:85`), "only to accounts created on or after March 17, 2026" (`:99`). It was a refill proposal, not a board kill (`REPLENISH-2026-09-28-2.md:217-218`); this sitting registers it. Its partial reopen of the Apple aggregator kill (row 8) falls with it. | a rendered free path for a new international account, or the owner lifts the ₪0 rule for this fee |

**Drift in `REJECTED.md`'s own `:NNN` references, verified today** (the file warns of it at `:1238`): cited `:1253` and
`:1275` (the "unsettled" TPT/MCPize/AgenticMarket line) → now `:1307`; cited `:274` (the RED anti-detect precedent) → `:282`;
cited `:991-997` (the zero-price floor) → `:1000-1001`; cited `:1251` (Draft2Digital) → `:1254`; `facer.md:152`'s `:1218`
(Fitbit) → `:1226`. The Playgama kill the breadth board confirmed is at `:1284`, while `CHANNEL_LOOP.md:138` still names it
in row 14 and says "three networks" (`:138`, verified) where there are four.

**WHAT THE LOOP DOES NEXT.** Opus: one dated paragraph under the three tables in `docs/REJECTED.md`: "Confirmed by the loop
board 29.9.2026 (`RULING-2026-09-29-loop.md` (f)): all nineteen; D2D re-based to G1 rendered; Fitbit re-based to G5;
Wavedash's `:183` sentence withdrawn under (e2); Facer's wording ruled to bar an agent-driven browser; StreetLib
board-registered; G3 reopen triggers widened by 'or the venue's written yes to a brand account operated by an automated
browser, with disclosure'"; fix the five drifted references in place; delete the Playgama strike-through and the word
"three" in `CHANNEL_LOOP.md:138`. No question is sent to any of the nineteen.

---

## (g) PayPal Israel, condition (i): PASS confirmed; it unlocks nothing yet

**RULING.** Board Q3 condition (i), verification with no selfie, liveness or video (`BOARD.md:116-117`), **PASSES at
rendered grade**, with its scope stated. Step 13 stays **held** on (ii) an admitted PayPal-paid engine and (iii) step 2
(`BOARD.md:118-119`). The kill at the step itself stays live (`:121-122`).

**BASIS.** To restore full access the user must "upload proof of identity (for example a copy of your driving licence or
ID card) … in your Message Center" (translated; `paypal-il-help534-limited.txt:56`, rendered; the note cites `:54`, drift
of two lines). A copy is a document upload, not a live capture (`paypal-israel.md:140-141`, inference). The 328 KB HTML has
0 hits for selfie, photo, camera, liveness, biometric and their Hebrew forms (`:143-149`, rendered). The browse-topics render
could only kill and did not (`:238-241`). **Scope:** HELP534 covers a limited account, not sign-up; the in-account request is
not captured (`:184-191`); the agreement keeps "other identifying documents at any time" open
(`paypal-il-user-agreement-mpp.txt:1198`, rendered). So the finding is "PayPal IL's public text names no camera step", which
is what condition (i) asks; it is not a view of the request the owner would see.

**What it unlocks.** Nothing today. What it **changes**: PayPal is no longer a shared camera threat to the PayPal legs of
Displate, Teach Simple, Y8, GameMonetize and possibly Spreadshirt (`BOARD.md:81`); those legs now fail only on their own
venue's evidence. Displate's held question about a photo or video at payout (`questions.json` venue `displate`) stays, since
it asks about Displate's check, not PayPal's. Condition (ii) is nearest through (c)'s order: Displate or Teach Simple.

**WHAT THE LOOP DOES NEXT.** Opus: §4 row 21 → "PASS (i) confirmed 29.9; rail research closed until (ii)"; §6 step 13 → "(i)
met; held on (ii) and (iii)"; the owner page's step-13 line says the same. No render. Owner: nothing.

**REOPEN IF** the in-account request asks for a selfie when the owner reaches step 13 (they stop; the PayPal leg dies, as
pre-decided), or a PayPal IL sign-up verification article renders with a camera step.

---

## (h) Indiebook's quarterly invoice: runner-issued after step 2, per (e)3

**RULING.** The quarterly "payment request and tax invoice" (`indiebook-royalty-guide.txt:35`, rendered) is **not owner
paperwork**: after step 2 the runner issues an exempt dealer's payment demand or receipt (`:69`, rendered) under (e)3's six
conditions. The unregistered route (`:73`, name and ID number, maximum withholding) is **never used** (condition 6).
Indiebook's recurring-step objection is closed; its remaining bar is supply (a named Hebrew title) and the step-8 question.

**BASIS.** The store is the merchant of record and issues every buyer's tax invoice (`indiebook-terms.txt:127`, rendered),
so our document goes only to the store, privately. The amount is read from the store's royalty report (condition 2), whose
login arrives by email "with the initial connection" (`indiebook.md:231`, repo citing `:47`) and therefore goes to the brand
mailbox. Bank details are sent once (`:67`, rendered): an owner one-time payout step, allowed. The guide's divisor "1.17
(when VAT is 17%)" (`:69`) is stale against 18% (`indiebook.md:142-143`, inference): the runner uses the divisor the store
states at the time and the first held question already asks about the share; the ~0.85% difference is recorded, not
decided here. Four documents a year at ~10 minutes each (`indiebook.md:223-230`, inference) is the owner's cost under the
other reading; under this one it is zero owner minutes.

**WHAT THE LOOP DOES NEXT.** Opus: `CHANNEL_LOOP.md:146` → "quarterly demand: runner-issued after step 2 (ruling (h));
unregistered route never used"; `questions.json` Indiebook `preSend` unchanged; the owner page's Indiebook mention (if any)
loses "four invoices a year". Admission still waits on a named title and the written AI answer ((c) order 2).

**REOPEN IF** the store's written answer requires the author's own signature on each demand, or the bookkeeping read in (e)3
shows the עוסק must issue personally (KILL-4, together with Y8 and Wix).

---

## Summary table

| Item | Ruling | Next action (who) |
|---|---|---|
| (a) Firefox | **KILL** on G4, rendered; reopen on a free-nowhere Pro feature named by row 15(a) and confirmed on AMO pages 2-6, or a cohort median ≥ 30 | REJECTED entry; §4 row 16 killed; step 14 out of §6 (Opus) |
| (b) NEEDS_MORE policy | No third refill; no nagging; step 8 first in the free batch with a count; render only what can kill or admit; JS-capable render counts as rendering; instruments and Mozilla harness meanwhile; refill only when rendering is exhausted **and** filtered to mailbox-free venues | §6 reorder; KPI read path; prize-intake half 2; render-watch JS mode; Trolley/GD/n8n renders with pre-registered Topcoder kill (Opus/runner) |
| (c) Admission | **None.** Pre-registered order: Displate → Indiebook → Teach Simple → CrazyGames, each on its written answer; Displate's written no = KILL-4 | §8 line; Displate `preSend` (Opus) |
| (d) §9 wording | **Confirmed** (Q9); delete `:264`; adopt "500 plays / 21 days" and re-base the benchmark kill to "no Full Launch invitation" | §4 row 6, §9 (Opus) |
| (e)1 Y8 kill (a) | **Does not fire**; PARK behind CrazyGames | §4 row 14 (Opus) |
| (e)2 GD publish request | `:183` **does not fire**; PARK behind CrazyGames; KPI from GD reports (no monitoring) | §4 row 14 (Opus) |
| (e)3 Runner invoice | **Not owner paperwork** after step 2, six conditions; Wix exempt-dealer held question; kolzchut read | §4 rows 11/14/22; `questions.json`; ZERO-TESTS row (Opus) |
| (e2) Portal ruling | A runner's web-admin step is **not a human step**; allowed only under C1-C8, C1 by written yes where terms are silent; Astro's KILL-PROPOSED **not confirmed** (GitHub machine accounts permitted, github grade; Astro silent; question via step 7) | §1 Never; §4 rows 6, 7, 14 (Opus); no portal module built |
| (f) 19 refutations | **All 19 confirmed**; D2D → G1 rendered; Fitbit re-based to G5; Wavedash's `:183` sentence withdrawn; Facer's wording bars an agent-driven browser; StreetLib board-registered; G3 reopens widened; 5 drifted `:NNN` fixed | REJECTED dated paragraph and reference fixes; `CHANNEL_LOOP.md:138` (Opus) |
| (g) PayPal (i) | **PASS confirmed**, scope stated; unlocks nothing until (ii) and (iii) | §4 row 21; §6 step 13; owner page (Opus) |
| (h) Indiebook invoice | **Runner-issued after step 2**; unregistered route never used | §4 row 22; owner page (Opus) |

## Edits for the Opus fold

- `logs/CHANNEL_LOOP.md`: §1 "Never" (+ the (e2) line); §4 rows 6 (plays; re-based kill), 7 (Astro not killed; step-7
  question; ranked last), 11 (invoice per (e)3), 14 (Y8 and GD park; `:183` does not fire; drop the Playgama strike-through;
  "four networks"), 16 (killed), 21 (PASS (i) confirmed), 22 ((h)); §6 free batch order 8 → 1 → 6a → 7 with the one
  count line; step 13 "(i) met"; step 14 removed; §7 the 29.9 lines; §8 the admission order; §9 delete `:264`, add the two
  CrazyGames corrections; §10 the (b) tick plan.
- `logs/FABLE_QUEUE.md`: row 14 → DONE 29.9, pointing here, with the fold commit.
- `docs/REJECTED.md`: Firefox entry (a); the (f) dated paragraph; five reference fixes (`:1253`/`:1275` → `:1307`;
  `:274` → `:282`; `:991-997` → `:1000-1001`; `:1251` → `:1254`; and `facer.md:152`'s `:1218` → `:1226`).
- `research/owner-asks/questions.json` (+ `brand-mailbox-questions.md`, kept in sync by `owner-asks.test.ts`): Wix
  `heldQuestions` + exempt-dealer receipt; Displate `preSend` + pre-registered KILL-4 on a written no.
- `research/channel-loop/ZERO-TESTS.md` / `urls.txt` (via `scripts/queue-zero-test.mjs`): the kolzchut exempt-dealer page
  (found by site search); Trolley identity, GD payment FAQ and n8n Creator Hub re-added **only** under the JS-render flag
  once it exists; Topcoder `COMPLETED` after Trolley renders document-only.
- `scripts/render-watch.mjs` (+ tests): the opt-in JavaScript-capable mode, same terms gate, never tiktok.com.
- Instruments: the il-biz-tools/pcn874 page-view KPI read path; prize-intake half 2 (`src/revenue/prize-intake.ts`).
- `docs/OWNER_STEPS.he.md` (+ PDF, `src/revenue/owner-steps.ts`): step 8 first among the free steps with the count line;
  step 13 "(i) met"; step 14 removed; one sentence under step 2 on company-issued payout documents. Regenerate the PDF.
- `logs/2026-09-29-loop-board-applied.md` in Hebrew (the eight `CLAUDE.md` sections), by the agent that applies this.
- Verification before "done": `pnpm typecheck`; `npx vitest run src/__tests__/revenue`; `owner-asks.test.ts`;
  `parseUrlList` on the real `urls.txt`; a grep of every edited owner-facing file for the owner's identifiers returns 0.

**What this board did not verify, stated so it is not mistaken for verified.** Whether Israeli bookkeeping rules let
software issue an עוסק פטור's documents ((e)3, the kolzchut read); whether Wix's finance accepts an exempt dealer's receipt;
whether any of the four HTML5 portals or Astro's portal presents a CAPTCHA or two-factor at login (0 hits in the captures is
absence); whether Astro's portal accepts a GitHub machine account (nothing bars it in the captures); Topcoder's selfie
(snippet grade until the JS render); the AgenticMarket commit dates. Every venue fact in (f) rests on the grade recorded in
R1/R2 and re-read here, not on a fresh read of the platforms, except Facer's clause, StreetLib's plans, D2D's fee and
GitHub's Terms, which this board read itself.
