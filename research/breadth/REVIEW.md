# Adversarial review of BREADTH-SWEEP.md (28.9.2026)

The review stage's findings, then the revision stage's summary of what it changed.

## Review

1. **Gumroad fee "correction" double-counts card processing.** Lines 137, 248, 645-646 and Appendix A.3 (659-662).
   - The sweep adds 2.9% + $0.30 on top of 12.9% + $0.80. But `docs/OWNER_STEPS.he.md:187` says 12.9% + $0.80 *already includes* the 2.9% + $0.30 processing (repo).
   - The sweep's own scout agrees: `research/breadth/scouts/storefront-rails.json:16` gives 10% + $0.50 per direct sale (github, `pricing.html.erb`). `docs/REJECTED.md:1413`'s "17-22% at small tickets" is exactly 12.9% + $0.80 at $9-19.
   - The real take is $1.96 on $9 (21.8%) and $1.45 on $5 (28.9%). It is not 28% and 38%.
   - Fix: delete A.3 and the Gumroad part of Q10. Change §3.1 to "~22% at $9, ~29% at $5". The Firefox cut from ₪400 to ₪150 must then rest only on the stock-versus-flow point, with that arithmetic shown. If anything, reword `rails.ts:105`; the number there is right.

2. **CrazyGames: Tipalti is placed at Full Launch, but it is required before the first game is submitted.** Line 136 ("plus Tipalti at Full Launch") and line 274 ("Tipalti at Full Launch").
   - Rendered: `research/rendered/crazygames-payouts.txt:337-339` asks "Why am I unable to submit my game without completing the payment setup?". Personal information, address and country are required; only the payment method can be put on hold.
   - Repo: `research/measurements/crazygames.md:310-313` already superseded the Full Launch reading. The sweep's own scout has it right (`html5-games.json`, owner_step).
   - Fix: step 10 = developer account plus Tipalti billing onboarding (an identity step, not "5-10 min"). The Tipalti render (Batch A) and its camera and Israel questions become preconditions of step 10, before any game is built.

3. **The aggregate high is built from highs that have no basis.** Lines 37, 133-140, 330 and 335-337.
   - CrazyGames ₪600: the sweep itself says it rests on "an invented pass rate". The scout's basis assumes about 10 agent-built games by month 12, which contradicts one build in flight and "about one game a month" (`html5-games.json` estimate_basis).
   - Superteam ₪540: one ~$150 win a month, with "no measured base rate" (`code-bounties.json`). RULING §6.1 says no base rate exists.
   - Spreadshirt ₪370: an "assumed ceiling of ~35 sales a month … no measured sale rate" (POD scout).
   - Firefox ₪150, Wix ₪400, Play Books ₪100 and Pebble ₪25 show no arithmetic at all.
   - Fix: show the arithmetic per row, or mark the row "no basis" and leave it out of the sum. At minimum, dropping CrazyGames makes the sum ₪1,770. State plainly that the high is mostly unquantified.

4. **USDC and converted shekels are added into one number.** Lines 37-38 and the "Top ten together" row at line 330.
   - RULING-2026-09-28-bounty-rail.md §6.2 says converted and unconverted money are "two numbers, never one" and that "no target rests on unconverted money". `OWNER_STEPS.he.md:426` repeats this.
   - Fix: lead §0.6 and §5.1 with converted ILS only. Show the USDC line separately and never sum it.

5. **GameMonetize arithmetic does not follow from its own basis.** Line 141.
   - The basis is $0.004-0.005 per game per day, which is $0.12-0.15 per game per month.
   - Reaching $30 in 10-17 months needs about 12-25 games, and ₪15 a month needs about 28-35 games. The engine only syndicates games that passed CrazyGames, at most about one a month, and the one comparable failed.
   - With 1-3 games the threshold takes years, so nothing lands in the ledger.
   - Fix: month 12 = ₪0, and remove the 15 from §5.2.

6. **ArrangeMe (rank 3): the base rate comes from the flooding pattern, and honest supply is unknown.** Lines 135, 166-170 and 300.
   - The 0.0155 sales per title per month comes from 8,522 public-domain Piano Solo PDFs at the $5.99 floor, which line 166 says MISSION forbids. It is then applied to "1,000 public-domain or original titles".
   - §4 limits the catalogue to cells with no free equivalent, which are low-demand cells by construction. §5.3 says copyrighted arrangements are honest only with a melody source the colony does not have. A 1,000-title AI catalogue built at 25 a week is itself a smaller version of the flood.
   - G2 is grade n. G3 leans toward fail at github grade: every automation rides a human cookie and the SDK has no login method.
   - Fix: mark the ₪170 as having no transferable basis. State the honest supply as UNKNOWN (possibly ~0). Demote ArrangeMe below engines whose G1-G3 are settled.

7. **The order contradicts the stated ranking criterion.** Lines 20-30 and table §2.1.
   - Firefox (#5) has G1-G4 at P and needs one new account.
   - Spreadshirt (#2) needs 2-4 new owner steps: a partner account, a new PayPal step, a W-8BEN, and possibly separate EU and NA accounts. Its G2 is unknown, and G3 leans toward fail at github grade: there is no design-upload API, and the only uploader uses the owner's password.
   - ArrangeMe (#3) has G2 at grade n.
   - No stated weighting produces this order.
   - Fix: state the weighting (hard gates settled first, then listings and buyers per *new* owner step) and re-sort. Firefox and CrazyGames rise above Spreadshirt and ArrangeMe.

8. **The gate table leaves out G6-G8, and G7 is the likeliest kill for ranks 1-3.** Lines 116-127, against the claim at line 67 that every candidate was scored on every gate.
   - Superteam: the talent profile requires a first and last name, and wins show on it (github, `claim.ts:98-103`). RULING §6.5 lists "legal name on the public profile with no brand option" as a pre-admission kill.
   - Spreadshirt: a possible EU imprint showing a name and address (DSA).
   - ArrangeMe: the arranger name on retailer pages.
   - Spreadshirt's possible EU and NA accounts are a G8 issue.
   - Fix: add G6, G7 and G8 columns. Set Superteam G7 to "U, leaning F (g)".

9. **Superteam's per-step metric omits the step that turns USDC into shekels.** Lines 133, 270 and 281.
   - Getting to ILS needs an Israeli exchange account, which is an identity step with an UNKNOWN camera check. RULING §6.1 calls this "the killed leg of every crypto plan so far" (citing `BOARD-LOOP.md:180,188`).
   - INFERENCE: moving USDC off a Solana wallet needs SOL for gas, which is an up-front purchase unless Privy sponsors it.
   - Fix: count the exchange account as a conditional owner step, or rank Superteam explicitly on unconverted money with converted = ₪0 by construction. Add the gas question to T4.

10. **Superteam T1 is described as dispatched, but it is only queued.** Lines 148 and 298, and the "T1 to pass in late October" assumption at line 339.
    - There is no Superteam workflow, code, or `research/measurements/superteam-earn.md` in the repo (`grep -ril superteam .github src scripts` returns nothing).
    - `CHANNEL_LOOP.md:129` says the tests were "dispatched as ZERO-TESTS rows" (rows 29-32), and the `apply-rulings-28-9` work that carries them is unmerged (`CHANNEL_LOOP.md:227`).
    - Fix: write "queued, not running". Date the month-3 high from T1's first actual run: four readings, then the board, step 12 and a free BBU slot.

11. **The Algora points are presented as new and needing a ruling, but they were already ruled, and one is graded too high.** Lines 44-47, 225-235 and Q9 (643-644).
    - RULING-2026-09-28-bounty-rail.md:20-26 already struck week 1 under KILL-1, and `algora-supply.md:5,31` records it as STRUCK.
    - "No Algora comment after 2026-05-27" is marked UNCHECKED in RULING:42 (the search API returned 403), but the sweep grades it "(github)".
    - RULING:198 already keeps ₪300 as the pre-registered number, and the 10/3 thresholds exist.
    - Fix: remove it from §0.7's "needs a ruling", downgrade the date claim to probable, cite RULING §3, and drop Q9.

12. **§5.3 gives a false reason for the lower likely band.** Lines 354-356.
    - FORECAST.md:35 explicitly excludes a second Actor, and FORECAST.md:25 and :71 say Gumroad Discover cannot bring a first sale. FORECAST never counted either engine.
    - Fix: delete the clause. The lower band comes from the verifiers' modal ₪0.

13. **Firefox G4 is graded P against the sweep's own G4 definition.** Line 122 against line 74 ("nothing that is already free sold as paid") and line 137.
    - The planned add-ons (`app-plugin-marketplaces.json` candidates[1]) are a Hebrew-date overlay (free ones exist, line 182), a VAT calculator (free on our own il-biz-tools), a gov.il helper (affiliation risk) and an RTL fixer. No paid feature is named that is not already free.
    - Fix: G4 = U. The ₪0 test must name a Pro feature that is not free anywhere before the engine is admitted.

14. **Firefox: the nearest standing verdict is not cited, and the reasoning around it is backwards.** Lines 183-184.
    - `docs/REJECTED.md:273` killed a single Chrome Web Store extension because ranking is install-count-locked with no cold-start lane. The sweep argues "AMO's is install-gated, so this is a new venue", but install-gating is exactly the reason given at :273 and :1312.
    - The honest route is :273's reopen trigger: AMO publishes its ranking code, and text relevance is an input a new listing can influence. The log(users) term keeps the prior-success law, as the scout's own reopen_basis admits.
    - Fix: cite :273 and argue the reopen on its trigger.

15. **Stripe-based kills go further than the rendered page supports.** Lines 400 (PromptBase) and 427 (MCPize and AgenticMarket).
    - `stripe-cross-border-payouts.txt:96,140` rules out only self-serve cross-border payouts, and names Global Payouts as the alternative. Global Payouts lists Israel (`stripe-israel.md:5`, rendered), and `rails.ts` keeps oss-bounties alive on an Israeli Connect Express account (code grade).
    - Fix: regrade these to U, pending each platform's own payout-country list.

16. **Step 2 is presented as ~₪0 without its known exception.** Line 273, and line 260 ("no step costs money").
    - `step2-cost.md:3` says it adds about ₪0 "unless the owner is in an exempt group". `CHANNEL_LOOP.md:173-175` puts that at up to ~₪265 a month, with one private yes/no question still open.
    - Step 2 applies to every engine (`BOARD-LOOP.md:59,126`).
    - Fix: carry the caveat and the pending question.

17. **Wix: two gates already recorded in the repo are left out.** Lines 123, 138 and 192-193.
    - Every payout needs a tax invoice (agreement `:385`), which `wix-app-market.md:416` records as "recurring paperwork". KILL-4 (`BOARD-LOOP.md:67`) names per-item owner paperwork as a kill.
    - Agreement `:165` limits Wix data to GCP, IBM, AWS, Azure, Salesforce or Oracle (`wix-app-market.md:438`). Netlify would need Wix's written consent, and those clouds are a possible cost (INFERENCE).
    - Fix: G3 = "U, leaning F unless the colony can issue the invoice". Add the hosting cost risk to G1.

18. **The render plan applies the terms-first rule only to Algora.** Lines 521, 537-542, 552-554 and 575-576.
    - Batch A probes `arrangeme.com/login` to record session-cookie lifetime and scrapes Sheet Music Plus and Sheet Music Direct search pages. The ArrangeMe terms that would forbid this are in the same batch and still unread. Batch B includes HackerOne pages.
    - PayPal IL verification is given with no exact URL, although it decides three engines.
    - T4 omits Bit2C, which `ZERO-TESTS.md:41` includes.
    - Fix: render terms first, and render login or search pages only where the terms allow automated access. Drop the cookie-lifetime probe. Give the exact PayPal URLs and add https://bit2c.co.il/.

19. **Decisive evidence is not saved in the repo.** Lines 5-7.
    - The sheet-music family (ArrangeMe #3), watch faces (Pebble #8), AI-native markets, and all verifier and critic notes "exist only in the run's results".
    - Several github-grade claims have no URL: the Birdywen SDK rate, the Spreadshirt archived uploader, "fleets of 23 and 4 Actors", "free Hebrew-date add-ons exist", "10 hearts", and the Whop SDK face photo.
    - Fix: save those JSONs and notes under `research/breadth/` and add a GitHub URL to each github-grade claim.

20. **Minor slips:**
    - **Gumroad's grade:** line 16 implies Gumroad is proven camera-free at rendered grade. The evidence is github grade and rests on an absence (0 hits in code; `OWNER_STEPS:177` says "not reported in any source").
    - **§6.1 header:** line 391 says "github or repo grade", but it includes e-vrit at snippet grade.
    - **50M users:** line 171 says "rendered terms show 50M+". That figure is marketing copy in `crazygames-faq.txt:675`, not the terms.
    - **HackerOne citation:** line 415 cites `REJECTED.md:515-518` for a HackerOne camera check. Those lines attribute the selfie to Bugcrowd.
    - **Teachers Pay Teachers:** line 461 lists it as dead on a "$29 seller fee (s)". My own recollection (grade none) is that TpT has a free Basic seller tier and the fee is optional Premium. Keep it unsettled until the render.
    - **Exchange rate:** rows use 3.6 in some places and 3.7 in others. Use one rate.
    - **Agent-days:** line 311's "20-35" is the minimum reading. The table's own ranges, with uploaders and two add-ons, give 22-43.
    - **Mozilla in the breadth ten:** RULING §7 records Mozilla as "the opposite of the 28.9 directive", counted at ₪0. Remove it from the ranking.
    - **"Admission" wording:** Q1's "admitted to ₪0 tests" conflicts with `BOARD-LOOP.md:9` item (2), one admission per Fable sitting. The right wording is "enter the `CHANNEL_LOOP` §4 queue".

**Held up on check:**
- The Apify KYC visibility claim is correct. The `store.yaml` fetched from GitHub says the default search excludes Actors "from developers who haven't passed KYC", and `includeUnrunnableActors` defaults to false.
- The MISSION.md and REJECTED.md line citations are accurate.
- CrazyGames' 50M-user figure, the basic-launch "small segment" wording and the uncapped indemnity are rendered as stated.

## Revision summary

Revised `/home/user/automaton/research/breadth/BREADTH-SWEEP.md`, the only file edited. All 20 review items held up on re-reading the file and the repo; 19 and part of 18 could not be fully applied (last line).
New order: 1 Firefox Add-ons, 2 Superteam Earn (converted ₪0 until T4), 3 CrazyGames, 4 Pebble, 5 Spreadshirt, 6 Play Books, 7 Wix, 8 ArrangeMe, 9 GameMonetize (last because it only starts after a game passes CrazyGames). Mozilla is out of the ranking (RULING §7) and stays queue #8 at ₪0.
Stated weighting: first, hard gates (G1-G4, G7) that pass at github grade or better, minus any leaning toward fail. Then honest listings and buyers per new owner step. Scores are Firefox 3, Superteam 2, CrazyGames, Pebble and GameMonetize 1, the rest −1.
Owner steps now (free, no identity, about 30 minutes): network allowlist, step 8 brand mailbox (highest leverage), step 7 plus 4a, step 6a.
Owner steps later, in order: Mozilla AMO account (after Firefox's ₪0 test), step 3 Gumroad, step 2, step 12 Superteam, an Israeli exchange account only if T4 shows no camera, step 10, PayPal Israel, then one venue account per admitted engine.
Step 10 is now the CrazyGames developer account plus Tipalti onboarding, an identity step. It is asked only after the Tipalti render clears Israel and camera, and before any game is built.
Step 2 now says it is ~₪0 unless the owner is in a Bituach Leumi exempt group (up to ~₪265 a month); one private yes/no is still open.
Forecast, converted ILS only, month 12: ₪0 low, ₪0-250 likely. The high is about ₪925 (Firefox 130 + Spreadshirt 370 + Play Books 100 + Wix 325), and every rate in it is assumed.
USDC is shown on its own line and never added: ₪0 / ₪0 / ~₪555. Month 3 is dated from T1's first actual run; T1 is now "queued, not running".
Dropped from the sum: CrazyGames (no basis), ArrangeMe (its only sales rate comes from a flooding catalogue), Pebble (arithmetic not saved) and GameMonetize (₪0; needs 12-35 games). Gumroad's take is corrected to ~22% at $9 and ~29% at $5; Appendix A.3 is deleted.
Firefox's high is ₪130 (users counted as a monthly flow, not a stock). Its G4 is now U: the ₪0 test must name a Pro feature that is free nowhere. It is argued as a reopen of `REJECTED.md:273` on that entry's own reopen condition.
The gate table gained G6-G8. Superteam G7 is "U, leaning F", Spreadshirt and ArrangeMe G3 lean F, and Wix G3 leans F unless the colony can issue the tax invoice. Wix G1 carries the hosting-consent cost risk.
Algora is recorded as already ruled (RULING §3; the date claim is only probable), and its question is gone. The false clause in §5.3 is removed. PromptBase's Stripe route and MCPize/AgenticMarket are regraded to U, and Teachers Pay Teachers is unsettled until its render.
Render plan: terms first everywhere, no cookie probe, Bit2C and the SOL-gas question added to T4, HackerOne and Mozilla pages moved out, and the recorded PayPal IL URLs listed. Also fixed: the HackerOne citation, the 50M source, one rate (3.7), agent-days 19-43, and "enter the §4 queue" wording.
Not applied (Review notes): the missing families' JSONs and the verifier notes are not on disk here and I could only edit this file, so saving them is left to the main thread. Six github-grade claims still have no URL and are marked "URL not saved". No exact PayPal IL identity-verification URL is in the repo, and I did not guess one.
