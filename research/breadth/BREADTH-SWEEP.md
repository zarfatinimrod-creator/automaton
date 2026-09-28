# Breadth sweep: "many places, many sales" (28.9.2026)

This file is the input for the Fable breadth board, `logs/FABLE_QUEUE.md` row 12. It is an Opus synthesis of
**15 venue families**: 15 scouts, 16 verifiers (one per family's top candidate, two for app stores and two for
games), and one critic. The critic's three missing families (watch faces, sheet music, AI-native asset markets) were
swept and verified in the same run. The raw scout files for 12 families are in `research/breadth/scouts/*.json`;
the other three families and all verifier and critic notes exist only in the run's results, which this file
summarises. **Saving them under `research/breadth/` is an open task for the main thread** (Review notes). Claims that
rest only on those unsaved notes are marked "URL not saved". **The board decides. This file recommends.**

*Revised 28.9.2026 after a review. What changed, and the review items not applied, are in "Review notes" at the end.*

---

## 0. The answer, before the detail

1. **No venue passed every gate.** After verification, ten venues were NEEDS_RENDER. Mozilla's client bounty is taken
   out of the ranking because the standing ruling records its shape as "the opposite of the 28.9 directive" (RULING
   §7, `research/channel-loop/RULING-2026-09-28-bounty-rail.md:385-390`), leaving **nine**. Six more were killed by
   their verifiers at github or repo grade. About fifty more are dead or unsettled at scout grade (§6).
2. **Not one of the nine is shown, at rendered grade, to pay an Israeli individual without a camera step.** The nearest
   is money that rides Gumroad (existing step 3): its "Israel | ILS" payout row is in Gumroad's production source, and
   no camera code path exists in its code. That camera finding is **github grade and rests on an absence** (0 code
   hits for selfie or liveness; `docs/OWNER_STEPS.he.md:177` says only that no selfie is "reported in any source").
   It is why Firefox Add-ons scores well on gates. Every other engine below has an UNKNOWN Israel payout. **Ranking an
   engine here means entering it in the `logs/CHANNEL_LOOP.md` §4 queue for its ₪0 test. It is not an admission:
   admission stays one per Fable sitting (`research/channel-loop/BOARD-LOOP.md:9` item (2)), and it is not a build.**
3. **Recommended order**, by the weighting stated in §2.1 (hard gates settled first, then honest listings and buyers per
   *new* owner step):
   1. Firefox Add-ons with a Gumroad Pro licence
   2. Superteam Earn (agent bounties; converted shekels ₪0 by construction until T4)
   3. CrazyGames
   4. Pebble appstore
   5. Spreadshirt
   6. Google Play Books
   7. Wix App Market
   8. ArrangeMe (sheet music)
   9. GameMonetize (sequenced after CrazyGames by ruling, whatever its gates)
4. **The owner step with the most leverage costs nothing and needs no identity: the brand mailbox (proposed step 8).**
   It removes il-biz-tools' last publish gate. It also lets the colony ask the written questions that decide
   CrazyGames and Spreadshirt, and it is the email the Mozilla (AMO) account needs.
5. **The built-but-unlaunched cap (6/6, `logs/CHANNEL_LOOP.md:83`) binds on every engine here.** Nothing new is built
   past its ₪0 test until something launches. The quickest way to free slots is the free owner actions already in
   `CHANNEL_LOOP.md` §6 (about 7 minutes), plus step 8.
6. **Forecast, INFERENCE, converted shekels only** (the figure MISSION's ₪20,000 test counts): at month 12, ₪0 low,
   ₪0-250 likely, and an arithmetic ceiling of about ₪925. **Every sale or conversion rate inside that ceiling is
   assumed, not measured, so the high is unquantified in the sense that matters** (§5.2). **Separately, and never added
   to it:** USDC booked unconverted (Superteam), ₪0 / ₪0 / ~₪555 at month 12 (RULING §6.2: "two numbers, never one";
   `docs/OWNER_STEPS.he.md:426-428`). This sits at or below `research/channel-loop/FORECAST.md` scenario 3's line for
   extra channels (₪150-500 likely, ₪1,500-2,000 high) and **does not move it up**. Breadth buys more lottery tickets.
   It does not beat the cold-start law (`docs/REJECTED.md:1117`).
7. **One finding needs a ruling whatever the board does about breadth:**
   - **Apify hides non-KYC developers' Actors.** Its own OpenAPI spec says default Store-API search excludes Actors
     from developers who have not passed KYC (github,
     https://github.com/apify/apify-docs/blob/master/apify-api/openapi/paths/store/store.yaml,
     `includeUnrunnableActors` defaults to false). That puts the loop's rank-1 instrument (the single Apify Actor) and
     its 30-day stranger count in doubt (Q5).
   - *Not for a ruling:* Algora's week-1 honeypot share was **already ruled** (RULING §3, `:20-26`; recorded as STRUCK
     at `research/measurements/algora-supply.md:5,31`). §2.5 carries it for completeness only.

---

## 1. The directive and the gates

### 1.1 The directive

`MISSION.md:358`, "הרבה מקומות, הרבה מכירות — תוספת הבעלים, 28.9.2026 (verbatim)":

> תנסה להרוויח לי כמה שיותר כסף, זה לא אומר בפעם אחת מחירה גדולה זה אומר המון מקומות המון מחירות
> אתה מבין ואני רוצה שתרוויח לי כמה שיותר

MISSION.md reads "מחירה"/"מחירות" as sales (מכירה/מכירות). The shape is many honest listings, in many venues that
bring their own buyers, each sale small. The same section says this **sharpens constraint 2 and does not repeal it**
(`MISSION.md:373`). The unit that costs the owner something is an account or a payout rail. So venues are ranked by
how many honest listings and how many buyers **one owner step** unlocks.

### 1.2 Gates used

Every ranked engine is scored on every gate in §2.1 (the G6-G8 columns were added on review). A gate refuted at
snippet grade or better kills the candidate.

| # | Gate | Source rule |
|---|---|---|
| G1 | **₪0**: nothing paid up front. No listing fee, setup fee, subscription or paid tier. Commission taken out of a sale is allowed. | MISSION.md 27.9 addition (the ₪0 rule), `MISSION.md:340-356` |
| G2 | **Israel payout with no camera**: the money reaches an Israeli individual (or a future עוסק פטור) through a named rail, with no selfie, liveness or video step anywhere in identity or payout. | the owner's brief; KILL-4 in `research/channel-loop/BOARD-LOOP.md:67` |
| G3 | **Programmatic listing**: no per-item owner click, no recurring owner work, no owner conversation with customers. | MISSION rule 1 (`MISSION.md:389-398`); `BOARD-LOOP.md:9` item (g) |
| G4 | **AI allowed, honestly**: AI use is declared where the venue asks, no flooding, no slop presented as human work, nothing that is already free sold as paid. | `MISSION.md:412-417`; constraint 8 (`MISSION.md:204`); `docs/REJECTED.md:1271` "never sell what is already free" |
| G5 | **Buyer supply**: the venue brings buyers of its own, because our own surfaces have no measured traffic. | `MISSION.md:373-379`; constraint 7 |
| G6 | **Discovery without a prior sale**: can a listing with no sales be found at all? (The Gumroad finding, `docs/REJECTED.md:1112`.) | `docs/REJECTED.md:1117`, the prior-success law |
| G7 | **Brand-only face**: the owner's name is never published. | `MISSION.md` (brand rule); `BOARD-LOOP.md:9` item (f) |
| G8 | **Accounts do not multiply**: every new account is a proposed owner step 8+, tested at ₪0 and never opened by us. | constraint 2 (`MISSION.md:126`); ACCOUNT CAP in `BOARD-LOOP.md:17` |

### 1.3 Evidence grades

- **r**: rendered, a page capture in `research/rendered/`
- **g**: github, a WebFetch of github.com or a file in a repo
- **s**: snippet, a WebSearch snippet
- **R**: repo, this repo's own research
- **n**: none

Money figures are INFERENCE unless marked. **One exchange rate is used throughout: ₪3.7 per $** (INFERENCE, not
measured; the scouts used 3.6 or 3.7).

### 1.4 Line numbers

`docs/REJECTED.md` was edited during the sweep, so several scout citations are now about 31 lines too low:

| Scout cited | Now at | Content |
|---|---|---|
| 1169 | 1200 | Google OSS VRP |
| 1172 | 1203 | huntr |
| 1173 | 1204 | Odoo |
| 1240 | 1271 | never sell what is already free |
| 1254-1261 | 1285 | dev-extensions |
| 1281 | 1312 | reopen table |
| 1293-1296 | 1324-1327 | committed lines |
| 1382 | 1413 | Gumroad take |
| 1399 | 1430 | Shopify parked |

This file cites the current lines.

---

## 2. Ranked engines

### 2.1 Gate status of the nine engines, and the weighting

**The weighting, stated so it can be checked or changed:**

1. **Hard gates first.** Score = the number of hard gates (G1, G2, G3, G4, G7) that hold at github grade or better,
   minus the number that lean toward fail. A snippet-grade P is not counted as settled. A gate "leaning F" is the
   likeliest kill, so it costs a point.
2. **Then honest listings and buyers per new owner step** (existing steps 2, 3 and the shared step 8 mailbox are not
   counted as new).
3. **One override:** GameMonetize is placed last because `BOARD-LOOP.md:178-183` sequences it after a game passes
   CrazyGames. It cannot be tested before then.

Key: P = holds or passes, U = unknown, F = fails. The letter after each status is the evidence grade (§1.3).

| Rank | Venue | G1 ₪0 | G2 Israel, no camera | G3 programmatic | G4 AI, honest | G5 buyers | G6 found with no sale | G7 brand only | G8 new owner steps | Score | The decisive unknown |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Firefox Add-ons (AMO)**, free core plus a Pro licence on Gumroad | P g | P g, via Gumroad; camera-free **by absence** | P g | **U** (no Pro feature is named that is not already free; §2.3) | U s | P g, with a 13.3× log-users handicap and no Newest sort | U n (AMO shows a chosen display name; not checked) | P: 1 (a Mozilla account, no identity); payout rides existing step 3 | 3 | A Pro feature that is not free anywhere; buyer supply (newest-cohort and Hebrew daily users). |
| 2 | **Superteam Earn**, agent API (`type=bounty`, AGENT_ALLOWED/ONLY, external sponsors only) | P g | U g: external-sponsor payouts need no KYC; the USDC→ILS off-ramp and its camera are UNKNOWN (T4) | P g | P g | U s | P g (the sponsor posts; our agent pulls by API) | **U, leaning F (g)**: the talent profile requires a first and last name, and wins show on it (`claim.ts:98-103`); RULING §6.5 lists "a legal name on the public profile with no brand option" as a pre-admission kill | P: 1 (step 12) **+ 1 conditional** (an Israeli exchange account, an identity step, camera UNKNOWN) | 3 − 1 = 2 | Supply (T1, queued, not running); the brand-name question (T2); a camera-free off-ramp and the gas question (T4). |
| 3 | **CrazyGames** (Basic Launch, then Full Launch) | P r | U r: Tipalti billing onboarding is required **before the first submission**; Israel and camera UNKNOWN | U g | U s | P r | P r (a Basic Launch segment by rule, `crazygames-faq.txt:503`) | U R: whether "Mehudak" can be the payee or account name (`research/measurements/crazygames.md:315`) | P: 1 (step 10 = developer account plus Tipalti, an identity step) | 1 | Tipalti's Israel coverage and camera step, before step 10; whether a runner may operate the portal (needs a written answer). |
| 4 | **Pebble appstore** plus KiezelPay unlock | U g | U s | P g | P s | U g | P g (installs are free; no sale gate) | U n | 2 (a Pebble login under the brand; KiezelPay) + PayPal (a new rail shared with ranks 5 and 9) | 1 | Whether KiezelPay still onboards Pebble apps in 2026 and pays Israel without a camera. |
| 5 | **Spreadshirt** (Marketplace designer plus a free Spreadshop, one partner account) | U s (leaning P) | U s | **U, leaning F (g)**: no design-upload API is documented; the only uploader uses the owner's password | P s | P s | U | U s: a possible EU imprint showing a name and address (DSA) | **U: 2-4** (partner account, PayPal, W-8BEN; EU and NA possibly separate accounts) | 0 − 1 = −1 | A written yes to automation; the DSA imprint question. |
| 6 | **Google Play Books** (ebooks, content fetching) | U s | **U, leaning F (s)** | U s | U s | P s | U | U s (publisher name under the brand; the payee is the owner) | 1-2 (Partner Center plus a payments profile) | −1 | Whether Israel is on the payment-country list (table 6052428). |
| 7 | **Wix App Market** (Wix-billed Hebrew compliance apps) | U r, with two cost risks: the unpriced third-party security test (`wix-partner-agreement-body.txt:185`), and Wix data only on six named clouds without Wix's written consent (`:165`; `research/measurements/wix-app-market.md:438`), so Netlify needs consent and those clouds may cost money (INFERENCE) | U r (Tipalti) | **U, leaning F unless the colony can issue the invoice (r)**: every payout needs a "lawful tax invoice" (`:385`), recorded as "recurring paperwork" (`wix-app-market.md:416`); KILL-4 names per-item owner paperwork (`BOARD-LOOP.md:67`) | U r | U R | U r (the Verified badge needs 60+ days and 40+ premium installs) | U (company details on the listing; unread) | P: 1 (+Tipalti inside it) | −1 | The security test's cost; who issues the invoice; Tipalti. |
| 8 | **ArrangeMe**, Hal Leonard (distributes to Sheet Music Direct and Sheet Music Plus) | P s | U n | **U, leaning F (g)**: every automation seen rides a human browser cookie, and the SDK has no login method | U g | P g | U | U n (the arranger name shows on retailer pages) | P: 1 (+payout, +W-8BEN) | −1 | **Honest supply: UNKNOWN, possibly ~0**; terms on automation and AI; unattended login. |
| 9 | **GameMonetize** (HTML5 syndication feed) | P g | U s | U g | U s | P g | P g (a "Newest" feed) | U n | 1 + PayPal | 1 (placed last by sequencing) | Only after a game passes CrazyGames (`BOARD-LOOP.md:178-183`). Automation terms; an AI-quality rule; PayPal. |

### 2.2 Economics: listings per new owner step, cold start, money, time, honesty

Every money cell is INFERENCE, ILS per month at month 12. Per-row arithmetic, and which rows enter the sum, are in §5.2.

| Rank | Venue | Honest listings per new owner step | Does discovery need a prior sale? | ILS/month at month 12 | Time to first sale | Main honesty risk |
|---|---|---|---|---|---|---|
| 1 | Firefox Add-ons | One new Mozilla account (needs step 8's mailbox), plus the existing Gumroad step 3 for payout. 2-5 add-ons at most, each doing a distinct job, **and only those whose Pro feature is free nowhere** (G4). | No sale gate, but ranking weights log(daily users): a new add-on starts 13.3× behind one with 10k daily users, and there is no Newest sort (g). | **₪0-130**, flow-corrected (§5.2). The scout said ₪400 by treating a stock of users as a monthly flow. Its 22% Gumroad fee was right. | 3-9 months after listing; any single add-on may never sell. | Charging for what is free: VAT is free on our own il-biz-tools, and free Hebrew-date add-ons exist (URL not saved). The licence check sends data off-device and must be disclosed. A gov.il helper could imply affiliation. |
| 2 | Superteam Earn | One claim (proposed step 12) opens every agent-eligible external-sponsor bounty; the count is UNKNOWN until T1 reads it. **Turning USDC into shekels needs a second, conditional identity step**: an Israeli exchange account whose camera check is UNKNOWN, the leg RULING §6.1 calls "the killed leg of every crypto plan so far" (`BOARD-LOOP.md:180,188`). INFERENCE: moving USDC off a Solana wallet needs SOL for gas, an up-front purchase unless Privy sponsors it. Our rule: at most 1 submission per listing, only where tests prove the spec. | **No.** The sponsor posts and our agent pulls by API. Whether judges favour past winners is UNKNOWN. | **Converted: ₪0 by construction** until T4 shows a camera-free off-ramp and the owner opens it. **USDC line, never summed with ILS: ₪0-555** ($150 × 3.7; one placement a month; no measured base rate, RULING §6.1). Booked `unconverted` (RULING §6.2). | T1 is queued, not running. The earliest win is about 8-10 weeks after T1's first actual run: four weekly readings, then the board, step 12, a free BBU slot, a 3-5 agent-day build, and a sponsor's judging. | Flooding (the API allows 60 submissions an hour). Legal name on the talent profile. Sponsors can see the claimant's email and Telegram. Injected listing text. KYC on Superteam-paid (`isFndnPaying`) listings. |
| 3 | CrazyGames | Proposed step 10 = **a developer account plus Tipalti billing onboarding** (personal or company information, address, country), required before the first game is submitted; only the payment method can wait via "hold payments" (r, `research/rendered/crazygames-payouts.txt:337-339`; `crazygames.md:310-313`). An identity step, not "5-10 min". One listing per game, about one game a month at 5-10 agent-days each (`BOARD-LOOP.md:125`). | **No.** Every accepted game gets a Basic Launch segment by rule (r). But impressions are not plays: the one comparable got 157K impressions, 190 players and 209 plays, and was rejected (g). | **₪0; no basis for more.** The scout's ₪600 assumes 2-3 of about 10 agent-built games reach Full Launch, which contradicts one build in flight and about one game a month, and its per-game figure's source disclaims it. Not in the sum. | At least 3-5 months after step 10, and only if a game passes. | Flooding guard: repeated non-compliant submissions risk restrictions (s). The owner warrants "original development" under an uncapped indemnity (r). The venue never asks about AI, so we must declare it voluntarily. |
| 4 | Pebble plus KiezelPay | `pebble login` with a brand identity, plus KiezelPay, plus PayPal. 2-4 faces. | No sale gate (installs are free). The unlock conversion is unmeasured. | **₪0-25**, the verifier's figure; the arithmetic was not saved (the watch-faces family is not on disk). **No basis; not in the sum.** The scout said ₪100. | 1-2 months after the steps; plausibly never. | Charging for zmanim faces that are already free (the comparable free face drew 10 hearts in its lifetime, g, URL not saved). Religious-accuracy harm. GPL obligations from hebcal. |
| 5 | Spreadshirt | One partner account, plus PayPal and a W-8BEN (possibly two accounts, EU and NA): 2-4 new steps. Unlimited designs, each on many products, plus a branded Spreadshop. Our honest cap: ≤10 designs a week. | UNKNOWN. The Spreadshop brings no buyers; the marketplace does. | **₪0-370**: 35 sales × $3 × 3.7 = ₪389, less PayPal's ₪8 withdrawal and a ~3-4% conversion markup. **The 35 is an assumed ceiling with no measured sale rate** (POD scout). | At least 6-10 weeks after the owner steps. Blocked first by the BBU cap and by the written automation answer, which needs step 8. | Near-duplicate template families. AI disclosure hidden in the description. Trademark collisions on Hebrew slogans. An account in the owner's legal name at risk of a ban. A possible EU imprint with a name and address (DSA). |
| 6 | Google Play Books | One Partner Center account plus a payments profile. 2-4 honest English titles. The PCN874 flagship is blocked (`docs/REJECTED.md:174`, `research/colony-sweep/groups/data-apis.md:124`). | UNKNOWN; assume a cold start. | **₪0-100**: 4 titles × 1 sale per title per month × ₪25 net (the top of the scout's 0-1 and ₪15-25). **₪0 if Israel is absent.** The scout said ₪300. | UNKNOWN. Month one is ₪0. | Content repackaged from public inputs. The content policy's automated spam models. |
| 7 | Wix App Market | One Wix partner account plus Tipalti. **One honest app today** (a VAT/osek-patur ceiling tracker), 2-3 at most, because two of the three proposed niches are occupied. | Partly. The Verified badge needs 60+ days live and 40+ premium installs (r). Whether search needs installs is UNKNOWN. | **₪0-325**: 6 paying sites × $15 × 0.975 × 3.7. The paying-site count is the app-plugin scout's 0-10 across 2-5 apps, scaled to 3 apps, and is assumed. The verifier's ₪400 had no saved arithmetic. The only analogues (Obsidian newest median 27 users; Odoo median 1 lifetime purchase) point near zero. | 6+ months to first cash: a $200 floor that rolls over, and money for month M arrives in M+2 (r). | False warranties at submission: a third-party security test and a documented review by more than one developer (r). Selling "compliance" under an uncapped indemnity (`:515`, `:607`). |
| 8 | ArrangeMe | One account, plus payout and a W-8BEN. Titles reach at least two retailers (SMD and SMP). **Honest supply is UNKNOWN, possibly ~0**: it is limited to cells with no free equivalent, which are low-demand cells by construction. | UNKNOWN. The only github-grade sales base rate in the sweep (one bulk account: 6,362 sales records over about 48 months on 8,522 titles, ≈0.0155 per title per month) **does not transfer** (next cell). | **No transferable basis; not in the sum.** The 0.0155 comes from 8,522 public-domain Piano Solo PDFs at the $5.99 floor, the flooding pattern MISSION forbids (`MISSION.md:378`, `:415`). The scout said ₪350. | 1-2 months after the first titles are live, if any honest cells exist. The notation pipeline does not exist. | The only proven route to volume is the flood. A 1,000-title AI catalogue at 25 a week would be a smaller flood. Unverified copyrighted transcriptions. Reverse-engineered private endpoints. **Never read or use the committed `.cookie` file in the Birdywen repo.** |
| 9 | GameMonetize | An account plus PayPal. The same games, syndicated. | Partly no: partners pull a "Newest" feed (g). | **₪0 at month 12.** Its basis (GamePix at $0.004-0.005 per game per day) is $0.12-0.15 per game per month. Reaching the $30 threshold in 10-17 months needs about 12-25 games, and ₪15 a month needs about 27-34. The engine syndicates only games that passed CrazyGames, at most about one a month, and the one comparable failed. With 1-3 games the threshold takes years. The scout said ₪150. | Years at 1-3 games; nothing lands in the ledger by month 12. | The mass-upload tooling pattern. "No longer accepts simple AI-made games" (s). Embedding on "unblocked games" mirrors. |

### 2.3 Why this order, engine by engine

1. **Firefox Add-ons.** It scores 3 on hard gates, the most in the sweep, with nothing leaning F, and needs one new
   account with no identity. POST `/api/v5/addons/addon/` creates listings (g, `docs/topics/api/addons.rst` in
   https://github.com/mozilla/addons-server; branch not recorded). No fee applies. Payout rides
   existing step 3, which pays ILS with no camera code path (g, https://github.com/antiwork/gumroad, by absence).
   - **G4 is U, not P.** The planned add-ons (`research/breadth/scouts/app-plugin-marketplaces.json` candidates[1]) are
     a Hebrew-date overlay (free ones exist, URL not saved), a VAT calculator (free on our own il-biz-tools), a gov.il
     helper (affiliation risk) and an RTL fixer. No Pro feature is named that is not already free. **The ₪0 test must
     name one before the engine is admitted.**
   - **The nearest standing verdict is `docs/REJECTED.md:273`**: a single Chrome Web Store extension, killed because
     ranking is "install-count-locked with no documented cold-start lane". Its reopen trigger is "Google publishing
     ranking inputs a new listing can influence". AMO is argued as a reopen on that trigger, for a different store:
     Mozilla publishes its ranking code (g, `src/olympia/search/filters.py` in
     https://github.com/mozilla/addons-server), and text relevance is an
     input a new listing can influence. The log(users) term keeps the prior-success law (`docs/REJECTED.md:1117`), as
     the scout's own reopen_basis admits. The dev-extensions trigger at `:1312` (ranking not gated on installs) is not
     met.
   - **Against it:** AMO has no checkout, and the Hebrew-UI Firefox audience is on the order of 10^5: the Hebrew
     langpack shows 132,251 users (s).
2. **Superteam Earn.** It scores 3 on hard gates, less one for G7 leaning F. It is the only venue in the sweep built
   for **declared** agent work. Sponsors opt in per listing, because the default is `HUMAN_ONLY` (g,
   https://raw.githubusercontent.com/SuperteamDAO/earn/main/prisma/schema.prisma). It has many small payers, which is
   the 28.9 shape. Discovery is not sale-gated. Its ₪0 tests T1-T4 are **queued, not running**: they sit as
   `research/channel-loop/ZERO-TESTS.md` rows 29-32, no Superteam workflow or code exists (`grep -ril superteam .github
   src scripts` returns nothing), `research/measurements/superteam-earn.md` does not exist, and the `apply-rulings-28-9`
   work that carries them is unmerged (`CHANNEL_LOOP.md:227`). The standing ruling is "admissible in principle;
   admitted to nothing" (RULING `:323`, §6.5 kill list at `:376-383`).
   - **Ranked on unconverted money, explicitly.** Converted shekels are ₪0 by construction until T4 shows a camera-free
     off-ramp and the owner opens an exchange account (a conditional identity step, counted in G8).
   - **Against it:** USDC may never convert without a camera (T4). Only listings marked Global are reachable, because
     an agent has no location (g, `src/features/listings/utils/region.ts:74`,
     https://github.com/SuperteamDAO/earn/blob/main/src/features/listings/utils/region.ts). The talent profile requires
     a first name, a last name and a GitHub handle, and wins move to the claimant's profile (g,
     `src/pages/api/agents/claim.ts:98-103`, https://github.com/SuperteamDAO/earn/blob/main/src/pages/api/agents/claim.ts).
     That is a brand-rule problem the board must rule on (Q6).
   - **Correction to the scout:** it said the venue was "never assessed". That is wrong; the verifier caught it.
3. **CrazyGames.** It scores 1 with nothing leaning F, needs one new step, and brings its own players. It is already
   queue #6 (`logs/CHANNEL_LOOP.md` §4). CrazyGames' own FAQ claims 50M+ monthly players (r, marketing copy,
   `research/rendered/crazygames-faq.txt:675`, not the terms), and every accepted game is shown to "a small segment of
   players" in Basic Launch by rule (r, `faq.txt:503`), so there is no Gumroad-style cold start.
   - **Tipalti comes first, not at Full Launch.** "Why am I unable to submit my game without completing the payment
     setup?" (r, `crazygames-payouts.txt:337-339`): personal information, address and country are required before any
     submission. `crazygames.md:310-313` already superseded the Full Launch reading. So the Tipalti render and its
     camera and Israel questions are preconditions of step 10, before any game is built.
   - Its other decisive gate cannot be rendered: the portal needs a login, and only a written answer settles it.
   - The only public automation of the portal leaves the build upload and the submit to a human (g).
   - The only comparable failed in the bottom 20%.
4. **Pebble.** It scores 1 (G3 at g; its G4 pass is snippet grade). CI publishing is proven: `pebble publish
   --non-interactive` with `--firebase-id-token` (g, https://github.com/coredevices/pebble-tool; file path not saved).
   It ranks below CrazyGames on the second key: two new accounts plus PayPal for 2-4 faces, and buyer supply is
   UNKNOWN. The money rail (KiezelPay) is not shown to support Pebble in 2026, and demand is tiny.
5. **Spreadshirt.** It has the best goods-venue breadth shape: one account, a fixed commission per sale, and every
   design on many products in front of marketplace buyers. It leads the −1 group on listings per new step.
   - **G3 leans F.** There is no documented design-upload API. The Public Shop API is for storefronts. Spreadconnect has
     an upload, but it is own-store fulfilment with no buyers. The only uploader, an archived client, uses the Partner
     Area's internal API with the owner's password (g, URL not saved).
   - Under the CrazyGames precedent (`BOARD-LOOP.md:125,127`; `research/measurements/crazygames.md:459`), it needs a
     **written yes** from Spreadshirt. That needs the step 8 mailbox. A "no" is KILL-4.
   - **G8 is 2-4 new steps.** Payout is PayPal or a US bank only (s), so PayPal Israel becomes a new owner step, plus a
     W-8BEN, and EU and NA may be separate accounts (`Marki396/upload-automata` treats them as separate targets, github
     description only).
6. **Google Play Books.** Three snippets agree that payout needs "a local business address and local bank account in
   … a country supported for payment". Israel's presence on that list is unread, and the sibling scout leaned FAIL
   (`research/breadth/scouts/israeli-local.json`). One render settles it. It ranks above Wix on listings per step
   (2-4 titles against one app) and on buyers (P s against U R).
7. **Wix App Market.** Wix bills the buyer inside Wix, retries failed payments for 45 days and handles sales tax (r).
   - **Against it:** the scout's lead niche (accessibility statement) is closed market
     (`research/measurements/eaa-occupancy.md:311`). The statutory-declaration clock has free and first-party
     incumbents (`docs/REJECTED.md:914`, `:928-929`).
   - **G1 carries two cost risks.** The mandatory third-party security test may cost money. Wix data may sit only on
     GCP, IBM, AWS, Azure, Salesforce or Oracle without Wix's written consent (`wix-partner-agreement-body.txt:165`), so
     our usual Netlify host needs consent, and those clouds may cost money (INFERENCE).
   - **G3 leans F.** Every payout needs a "lawful tax invoice" (`:385`), which `wix-app-market.md:416` records as
     recurring paperwork and KILL-4 names as a kill (`BOARD-LOOP.md:67`), unless the colony can issue the invoice
     itself after step 2.
   - The Hebrew-category occupancy scan has never run (`docs/REJECTED.md:966-970`).
8. **ArrangeMe.** It is demoted below every engine whose G1-G3 are settled or unconflicted.
   - Its one strength, a measured sales rate per listing (g, Birdywen's reverse-engineered SDK,
     https://github.com/Birdywen/genspark-agent/tree/main/skills/reverse-engineering/arrangeme; the stats file path is
     not saved), belongs to exactly the flooding pattern MISSION forbids (`MISSION.md:378`). **It has no transferable
     basis for honest supply.**
   - §4 limits the catalogue to cells with no free equivalent, which are low-demand cells by construction. §5.3 says
     copyrighted arrangements are honest only with a melody source the colony does not have. **Honest supply is
     UNKNOWN, possibly ~0.**
   - G2 is grade n. G3 leans F at github grade: every automation seen rides a human's browser cookie, and the SDK has
     no login method. If login needs a person each session, it fails as recurring owner work
     (`docs/REJECTED.md:1200`, `:1203`).
   - The copyrighted-arrangement upload endpoint the scout named does not exist in the SDK (g).
9. **GameMonetize.** Sequenced after a game passes CrazyGames Basic Launch (`BOARD-LOOP.md:178-183`;
   `logs/CHANNEL_LOOP.md` §4 row 14, "waiting"). There is no API, and a human activates each game (g). Month 12 is ₪0
   (§2.2).

**Removed from the ranking: Mozilla client bounty.** Its shape is one buyer, lumpy and rare, and RULING §7
(`:385-390`) records it as "the opposite of the 28.9 directive". It stays queue #8 for its own sake, counted at ₪0
(§2.5).

### 2.4 Second tier: scout grade only, unverified, no gate refuted yet

These are **not** recommended for the queue yet. They wait on a free render (URLs in §6.5). Estimates are the scouts'
own and were not checked.

| Venue | Scout estimate at month 12 | Why it is not higher |
|---|---|---|
| n8n paid templates, sold via a Gumroad `purchaseUrl` | ₪0-300 | The paid option reportedly unlocks after 3 accepted templates (s). Templates are discovered inside the n8n editor (g), which is a buyer source not gated on a Gumroad sale. Submission goes through the Creator Hub portal with human review; the AI rules are unread. It rides existing step 3 plus one creator account. **This is the second-tier item most worth a render.** |
| WordPress.org plugin plus a Freemius Pro tier | ₪0-200 (the prior audit, `docs/REJECTED.md:695`) | A 100-200× day-one ranking handicap (`:711-731`). Human review of each new plugin. |
| שיעור חופשי (Shiur Hofshi), a Hebrew teacher-materials marketplace | ₪0-300 | No verifier ran on the education family. Buyers, payout, API and AI terms are all unread. |
| GameDistribution, Wavedash, Y8 | ₪0-150 / 0-100 / 0-100 | Payout-delay complaints (GameDistribution). Unknown payout rail (Wavedash). Revenue share needs a support email (Y8). |
| Zazzle, TeePublic, Society6, Threadless, Displate | ₪0-500 / 250 / 150 / 150 / 200 | No creation API is known at any grade. The Redbubble precedent (browser automation with stealth plugins) is RED (`docs/REJECTED.md:274`). |
| LottieFiles, Facer, Fitbit Gallery, Apple Books, Indiebook | placeholders of ₪0-150 or less | All gates unread. Facer locks paid sales until 5,000 syncs (s). |
| SeaArt, Tensor.art, Nexus Mods, CurseForge | ₪0-150 / 150 / 100 / 100 | Possible paid-tier gates (Tensor counts Pro usage only). New mod pages are manual (Nexus, g). Modrinth, a sibling venue, bans primarily-AI projects (g). |

### 2.5 Existing lines this sweep touched

These are not new engines.

- **oss-bounties (Algora). Already ruled; recorded here for completeness, not for a ruling.**
  - RULING §3 struck week 1 (108 claimable) as an instrument fault under KILL-1 (RULING `:20-26`, §3.1-3.4), and
    `research/measurements/algora-supply.md:5,31` records it as STRUCK: 85 of the 108 sit in
    `UnsafeLabs/Bounty-Hunters` (bounties "symbolic … will not be merged", plus a prompt injection aimed at automated
    systems), and 5 more in the SecureBananaLabs engagement farm. The honest remainder is at most 18 nominal
    (RULING §3.1), which agrees with the census (`research/colony-sweep/BOARD-2.md:337-347`).
  - ₪300 stays the pre-registered number, graded `contradicted`, with the 10 / 3 thresholds unchanged (RULING
    `:193`, `:198`, §3.5). The board expects the corrected count in the 3-9 band or below.
  - "No new Algora bounty issue since 2026-05-27" is **probable, not a fact**: RULING `:42` marks it UNCHECKED (the
    search API returned 403), corroborated by `docs/REJECTED.md:1141-1143`.
  - **Do not render algora.io**: its terms forbid automated access
    (`research/measurements/algora-terms-question.md:23-25`).
- **apify-actors (a single free Actor, the ₪0 instrument).** See §0 point 7 and question Q5.
- **Gumroad.** It stays the rail and is killed only as a buyer-bringing venue (§6.1). A catalogue on it adds ₪0-300
  from our own traffic, and the verifier found the scout had counted il-biz-tools and pcn874 twice.
- **Mozilla client bounty (queue #8).** Out of the breadth ranking (§2.3). Counted ₪0 under the cash-event rule
  (`docs/REJECTED.md:501-502`, `:515`); averaged, ₪0-900. Its own ₪0 test is a 30-day private dry run. Its renders
  are its own, not this sweep's (§6.5).

---

## 3. The rail map and the owner steps

### 3.1 Which payout rails serve which engines

| Rail | Pays an Israeli individual? | Camera step? | Engines served (surviving only) | Owner step | Notes |
|---|---|---|---|---|---|
| **Gumroad** (ILS to an Israeli bank) | **Yes**: "Israel \| ILS" in Gumroad's production source (g; `docs/REJECTED.md:1112` area; `src/revenue/rails.ts:105`) | **No code path, by absence** (g: 0 hits for selfie or liveness; document upload only; `docs/OWNER_STEPS.he.md:177`: "not reported in any source") | Firefox Add-ons Pro licences; n8n templates (unverified); il-biz-tools and pcn874 (existing) | **Step 3, existing** | The take is **~22% at $9 and ~29% at $5**: 12.9% + $0.80 already includes the 2.9% + $0.30 processing (`docs/OWNER_STEPS.he.md:187`; the scout's `pricing.html.erb` gives 10% + $0.50 on a direct sale, `research/breadth/scouts/storefront-rails.json:16`). $1.96 on $9, $1.45 on $5. The ~22% in `rails.ts:105` is right; only its wording ("plus 2.9% + $0.30") reads as additive. $100 payout minimum. A 1-3 week seller review. Nothing may be for sale before step 2 (PUBLISH-6, `BOARD-LOOP.md:59`). |
| **PayPal Israel** (receiving) | Withdraws ILS to an Israeli bank, ₪8 per withdrawal under ₪1,000 (s, `research/colony-sweep/scouts/payment-rails--paypal-israel.md:24-28`) | UNKNOWN. The KYC lists ID, phone, tax ID and bank, and names **no selfie** (s, `risk-governance--owner-kyc-catalogue.md:65-79`) | Pebble via KiezelPay; Spreadshirt (its only rail outside the US); GameMonetize; later Apify | **New.** Listed only as conditional in `docs/OWNER_STEPS.he.md:424` | 18% VAT on PayPal fees since 6.7.2026 (`docs/INCOME_PLAN.he.md:95`). If a render finds a selfie, three engines die together. |
| **Tipalti** (inside the platform's onboarding) | UNKNOWN. The repo's snippets conflict (`scouts/storefronts--game-3d-assets.md:153-156` against `scouts/vertical-niches--real-estate.md:130-134`) | UNKNOWN. A snippet names contact details, payment method and tax form, and no selfie | CrazyGames (required **before the first submission**, `crazygames-payouts.txt:337-339`); Wix App Market | Inside each venue's step | One Tipalti render settles two engines, and must come before step 10. |
| **Bank wire, USD** | Wix: yes by contract (wire against a tax invoice, r); Freemius: yes (r); ArrangeMe, Play Books: UNKNOWN | UNKNOWN per venue | Wix, Play Books, ArrangeMe | Inside each venue's step | Israeli payers want an invoice from an עוסק, which ties these to step 2. |
| **Stripe Connect Express, through a platform** | Only via the platform's own configuration. **Self-serve** cross-border payouts go to US/UK/EEA/CA/CH only, and the page names Global Payouts as the alternative (r, `research/rendered/stripe-cross-border-payouts.txt:92,96,140`) | Stripe Express names no selfie (R); Polar's configuration demands one (g) | None among the nine. Algora (existing, step 4b held), kept alive on an Israeli Connect Express account (code grade, `rails.ts` `oss-bounties`) | 4b, existing, held | **Stripe Global Payouts lists Israel as a recipient country** (r, `research/measurements/stripe-israel.md:5`). A platform that pays by Stripe is therefore U, not dead, until its own payout-country list is read (§6.1, §6.5). |
| **USDC on Solana** (Superteam) | Paid to a Privy wallet the platform creates at the claim (g, `complete-profile/route.ts:178-183` in `SuperteamDAO/earn`; full path not saved) | None for external sponsors (g: KYC only on `isFndnPaying`). The off-ramp to ILS is UNKNOWN (T4) | Superteam Earn | Proposed step 12, **plus a conditional exchange account** to convert | Booked unconverted; no target rests on it (RULING §6.2). The colony never moves funds. INFERENCE: moving USDC needs SOL for gas unless Privy sponsors it (T4). |
| **Payoneer** | — | **Yes**: Israeli residents' "ID photograph must match the face scan" (s, Payoneer FAQ) | **None.** This is what kills monday.com. | — | Never choose it where a venue offers it (TeePublic, Freepik, Draft2Digital, Cults3D). |
| **Hyperwallet** | Israel appears on a third-party list only (s) | UNKNOWN | None surviving (Cults3D, Fab and CGTrader died on other grounds; Teachers Pay Teachers is unsettled, §6.2) | — | — |
| **Israeli bank transfer against a tax receipt** | Plausible | Unlikely | Only second-tier venues (Shiur Hofshi, Indiebook) | Step 2 | iCount and e-vrit are dead (§6). |

### 3.2 Owner steps, ranked: the smallest ordered set that unlocks the most

Rules applied: no step is known to cost money up front (step 2's exception is in its row), no step needs a camera, and
nothing is asked before the ₪0 test it depends on has passed. Minutes are from `docs/OWNER_STEPS.he.md` where they
exist; otherwise they are INFERENCE.

| Order | Step | Existing or new | Minutes | Costs money? | Camera? | What it unlocks | When to ask |
|---|---|---|---|---|---|---|---|
| 1 | Network allowlist for this environment (`CHANNEL_LOOP.md` §6, ask 1) | existing ask, not a numbered step | 2 | No | No | The loop deploys il-biz-tools, the pcn874 page and the T1 web arm itself, which **frees built-but-unlaunched slots** | now |
| 2 | **Step 8: a brand mailbox the agent can read** | proposed (`CHANNEL_LOOP.md` §6) | ~10 (INFERENCE) | No | No | il-biz-tools' accessibility-contact gate; the written questions to CrazyGames and Spreadshirt; the Mozilla (AMO) account; Bugzilla (step 11); the Superteam sign-in email | **now: the highest-leverage step in this sweep** |
| 3 | Step 7, plus 4a in the same sitting | existing | 10-15 (+2) | No | No | Removes the owner's name from the public repo; the brand GitHub handle that Superteam dev profiles require; Algora sign-in | now |
| 4 | Step 6a (Apify sign-up and token) | existing | 5 | No | No | The single-Actor instrument (but see Q5) | now |
| — | *Subtotal: ~30 minutes, free, no identity. Up to four of the six built-but-unlaunched items can launch.* | | | | | | |
| 5 | Mozilla add-ons account (+2FA, API key into a secret) | **new** | ~10 (INFERENCE) | No | No (email plus 2FA) | Firefox Add-ons (rank 1) | after Firefox's ₪0 tests pass (including a named Pro feature that is free nowhere) and the board admits it |
| 6 | Step 3: Gumroad | existing | 20 | No (fees come out of sales) | No, by absence (g) | Firefox Add-ons Pro; il-biz-tools; pcn874; n8n templates (unverified) | when a paid product is ready |
| 7 | Step 2: tax file and Bituach Leumi | existing | 60-90 | **~₪0 a month for a non-salaried owner** (INFERENCE, `research/measurements/step2-cost.md:3`) **unless the owner is in a Bituach Leumi exempt group, where it can add up to ~₪265 a month** (`CHANNEL_LOOP.md:173-175`). One optional private yes/no is still open: "Are you exempt from Bituach Leumi contributions today?", asked only with step 2 itself. | No | Legal to sell anywhere; the invoices Wix requires. **It applies to every engine** (`BOARD-LOOP.md:59`, PUBLISH-6; `:126`). | before the first item goes on sale (PUBLISH-6) |
| 8 | Step 12: Superteam claim (sign in, talent profile, claim code; the wallet is created by the platform) | proposed (RULING §6.1) | ~10-15 (INFERENCE) | No | Not for the external-sponsor class (g); UNKNOWN for Superteam-paid listings, which are excluded | Superteam Earn (USDC, unconverted) | after T1-T4 have actually run **and** the board's admission; after step 7 (brand GitHub handle) |
| 8b | **Conditional:** an Israeli exchange account (Bits of Gold or Bit2C) to convert USDC to ILS | **new, conditional** | UNKNOWN | UNKNOWN (and possibly SOL for gas, INFERENCE) | **UNKNOWN (T4)**; never asked behind a camera (RULING §6.2) | Converted shekels from Superteam | only if T4 renders a camera-free onboarding **and** USDC has actually arrived **and** the board judges conversion worth a step |
| 9 | Step 10: CrazyGames developer account **plus Tipalti billing onboarding** (personal information, address, country; "hold payments" allowed) | proposed | an identity step; UNKNOWN (not "5-10 min") | No | UNKNOWN until the Tipalti render | CrazyGames; later GameMonetize | after the Tipalti render shows Israel payable with no camera, and after a written yes on runner-operated submission; **before any game is built** (`crazygames-payouts.txt:337-339`; `crazygames.md:310-313`) |
| 10 | PayPal Israel receiving account | **new** | ~15-20 (INFERENCE) | No to open | UNKNOWN; render PayPal IL's pages first (§6.5) | Pebble, Spreadshirt, GameMonetize | only after one PayPal-paid engine passes its ₪0 tests |
| 11+ | One venue account at a time, each only after its engine is admitted: Pebble login plus KiezelPay; Spreadshirt partner (+W-8BEN; possibly EU and NA); Play Books Partner Center plus a payments profile; Wix partner plus Tipalti; ArrangeMe (+payout, +W-8BEN) | **new** | 5-30 each (INFERENCE) | No | Tipalti, KiezelPay and ArrangeMe UNKNOWN | one engine each | on admission |

**Not asked, and why:**

- **Step 5 (domain):** frozen, and no engine here needs it.
- **Step 4b:** held by its ruling.
- **Apify KYC:** held at 50 stranger users (`BOARD-LOOP.md:91`), but see Q5.
- **Any Israeli crypto exchange account behind a camera:** never asked (RULING §6.2). Row 8b is asked only if T4
  shows none.
- **Payoneer:** face scan.
- **Upwork, Etsy, Microsoft Partner Center, HackerOne, Bugcrowd:** camera steps (§6).

---

## 4. What the colony builds

The **BBU cap binds on all nine engines.** Each launches only after an owner step, so each becomes a built-but-unlaunched
item the moment it is built past its ₪0 test. With 6/6 today, **none starts building**
(`CHANNEL_LOOP.md:83-88`; `BOARD-LOOP.md:17`). What can run now sits in the first column, because ₪0 tests and
instruments are not BBU items. Builds are also serialised: at most one in flight.

Agent-day sizes are INFERENCE.

| Engine | ₪0 test first (outside the cap) | Build, once admitted and a slot is free | Agent-days | Honesty caps written into code |
|---|---|---|---|---|
| Firefox Add-ons | Render the AMO search API: newest cohort, "hebrew", "israel", and langpack daily users. **Name, in writing, a Pro feature that is not free anywhere; if none, the engine is not admitted (G4).** | 1-2 add-ons that each do a distinct job, reusing Gumroad licence Option C (the 18 acceptance tests in `products/il-biz-tools`) | 2-4 per add-on | No paywall on anything already free, on our own site or elsewhere; licence traffic disclosed in the listing |
| Superteam Earn | T1: a weekly CI count from a brand agent registration, nothing submitted (**queued as ZERO-TESTS row 29, not running**; no workflow or code exists yet). T2 and T4 renders; **T4 covers Bits of Gold and Bit2C, and whether moving USDC needs SOL for gas or Privy sponsors it**. T3: read the schema from `SuperteamDAO/earn`. | Intake (live listings, filtered to `type=bounty`, Global, external sponsor, not `isFndnPaying`, no Telegram); listing text parsed as data, never instructions; submission client; AI disclosure; manual ledger booking with the tx hash, flagged `unconverted` | 3-5, then 0.5-3 per bounty | ≤1 submission per listing; ≤2 in flight; only where tests prove the spec; comments limited to scope questions |
| CrazyGames | **First** render Tipalti's payee FAQ (Israel, camera): it gates step 10, which gates the build. Then the Gameplay and Basic-Launch-metrics pages; ask the portal question in writing (step 8) | The first original single-player game with the SDK, only after step 10 | 5-10 per game (`BOARD-LOOP.md:125`) | Two failed games is the kill row (`BOARD-LOOP.md:127`); no reskins |
| Pebble | Render KiezelPay's FAQ and home page | 2-4 faces; a clean-room calendar or GPL source release | 2-3 each | Tested against hebcal across many locations and dates before any unlock; no unlock on a face whose function is free elsewhere |
| Spreadshirt | Render the partner terms, payment and tax pages. Send one written automation question from step 8's mailbox. | A design generator (bilingual typography, geometric art, CC0 data posters); print-resolution export; near-duplicate and trademark screens. An uploader **only** after a written yes. | 4-6, plus 1-2 for the uploader, then about 0.1 per design | ≤10 designs a week; ≤1 per template family a week; an AI line in the visible title or design text |
| Google Play Books | Render table 6052428 and answers 3250840 and 4490848 | 2-4 titles | 3-5 each | No title built only from public inputs (`MISSION.md:204`) |
| Wix App Market | Render the security best-practice page and the App Market guidelines; run the Hebrew-category occupancy scan (0.25 day). Settle who issues the per-payout tax invoice (after step 2), and whether the planned host needs Wix's written consent or a listed cloud's free tier. | One app (VAT/osek-patur ceiling tracker) | 10-15 | Never "makes you compliant"; a real third-party test or no submission |
| ArrangeMe | **Render the terms first.** The login page and the Sheet Music Plus and Sheet Music Direct search pages are rendered **only if** the ArrangeMe and retailer terms allow automated access. The session-cookie-lifetime probe is dropped. | A MusicXML → PDF pipeline with range, key and difficulty checks; a cell-occupancy scanner; an uploader **only** if login works unattended and the terms allow it | 6-10, plus 1-2 | Only cells with no free equivalent; no copyrighted lead sheets without a verified melody source; **no weekly volume cap is set until an occupancy count shows honest cells exist** (the earlier ≤25 a week is withdrawn: a 1,000-title AI catalogue at that pace is a smaller flood) |
| GameMonetize | Render the FAQ, blog and terms, only after a game passes CrazyGames | Syndicate an existing game | ~1 per game | Only games that already passed CrazyGames |

Mozilla (queue #8, out of this ranking) keeps its own ₪0 test: a 30-day private dry run, nothing filed.

**Where the cap binds, and what the board should decide about listing packs:**

- The first builds of the top five come to about **19-43 agent-days**: Firefox 1-2 add-ons (2-8), Superteam (3-5),
  CrazyGames one game (5-10), Pebble 2-4 faces (4-12), and Spreadshirt with its uploader (5-8). With one build in
  flight at a time, that is at least 1-2 months of wall time **after** slots free.
- Slots free only when existing inventory launches: il-biz-tools, the pcn874 page, the T1 web arm, Apify and
  mcp-il-tools.
- **Recommendation:** an engine's listing pack counts as **one** BBU slot, because the cap exists to stop work piling
  up behind owner steps, and a pack behind one owner step is one blocked thing. At most 10 items per pack are built
  before the owner step, so a blocked pack cannot grow.
- ₪0 tests, occupancy scans and supply counters stay outside the cap, as today.

---

## 5. Honest forecast

### 5.1 The numbers

Everything in this section is INFERENCE. Figures are ILS a month, low / likely / high. **Converted shekels lead. The USDC
line is shown separately and is never added to them** (RULING §6.2; `docs/OWNER_STEPS.he.md:426-428`).

| Line | Month 3 (late December 2026) | Month 6 (late March 2027) | Month 12 (late September 2027) |
|---|---|---|---|
| **Converted ILS, the nine engines** (the figure the ₪20,000 test counts) | ₪0 / ₪0 / ₪0 | ₪0 / ₪0-100 / ~₪200 | ₪0 / ₪0-250 / ~₪925, an arithmetic ceiling whose every rate is assumed |
| *USDC booked unconverted (Superteam only; never summed with the row above)* | *₪0 / ₪0 / ₪0-555, only if T1's first actual run is by about 5.10 and every later link lands on time* | *₪0 / ₪0 / ~₪555* | *₪0 / ₪0 / ~₪555* |

### 5.2 Basis

**High case, row by row.** A row enters the converted sum only if its arithmetic can be shown from inputs recorded in
the repo, and no input contradicts this sweep's own plan or its source.

| Engine | Arithmetic (INFERENCE) | Weakest input | In the converted sum? |
|---|---|---|---|
| Firefox Add-ons | Scout: 5-10 add-ons × 50-300 users × 1-3% × a $5-9 licence. Its own high inputs give 10 × 300 × 3% = 90 licences **once**, a stock of 3,000 users, not a month (about ₪2,340 once). As a flow, users accrue over ~9 months live: 10 add-ons → 3,000 ÷ 9 ≈ 333 new users a month × 3% = 10 licences × $7.04 net ($9 less Gumroad's 21.8%) ≈ ₪260. At this sweep's at-most-5 add-ons: ≈ 167 a month × 3% = 5 × $7.04 ≈ **₪130**. On the only repo analogue for users (Obsidian newest cohort p90 of 94, `research/colony-sweep/groups/plugin-ecosystems.md:61-67`) it would be about ₪40. | 300 users per add-on (above the analogue's p90) and 3% conversion, both assumed | Yes, ₪130 |
| Spreadshirt | 35 sales × $3 × 3.7 = ₪389, less PayPal's ₪8 and ~3-4% conversion ≈ **₪370** | 35 sales a month: "an assumed ceiling … no measured sale rate" (POD scout) | Yes, ₪370, flagged |
| Google Play Books | 4 titles × 1 sale a month × ₪25 = **₪100**; ₪0 if Israel is absent | 1 sale per title per month, the top of an assumed 0-1 | Yes, ₪100 |
| Wix App Market | 6 paying sites × $15 × 0.975 × 3.7 ≈ **₪325** (the scout's 0-10 sites across 2-5 apps, scaled to 3 apps). Cash is lumpy: $88 a month crosses the $200 floor about every 2-3 months. | The paying-site count; analogues point near zero | Yes, ₪325 |
| Superteam Earn | $150 × 3.7 = ₪555, one placement a month | "No measured base rate" (`code-bounties.json`; RULING §6.1) | **No**: USDC, the separate line |
| CrazyGames | Scout: 2-3 of about 10 agent-built games reach Full Launch at €50-60 each | Contradicted: ~10 games by month 12 conflicts with one build in flight and about one game a month; the per-game figure's source disclaims it | **No: no basis** |
| ArrangeMe | 1,000 titles × 0.0155 × ≤$3 × 3.7 ≈ ₪170 | The rate comes from the flooding pattern; honest supply UNKNOWN | **No: no transferable basis** |
| Pebble | ₪25 (verifier) | Arithmetic not saved | **No: no basis** |
| GameMonetize | $0.12-0.15 per game per month × 1-3 games | Threshold takes years | ₪0 |

- **Converted sum: 130 + 370 + 100 + 325 = ₪925.** Without Spreadshirt's assumed 35 sales it is ₪555. **Every row in
  the sum still rests on an assumed sale or conversion rate; none is measured for our honest supply.** So the high is
  unquantified in the sense that matters: it is the arithmetic of assumptions, not a forecast. It is left as a
  ceiling and not discounted further, because a discount on assumed inputs would add false precision.
- **The earlier ₪2,370 (and "about ₪2,000")** summed rows with no basis (CrazyGames ₪600, ArrangeMe ₪170, Pebble ₪25),
  a GameMonetize ₪15 its own basis refutes, and USDC with shekels. Dropping CrazyGames alone gave ₪1,770.
- **Month 3.** Converted ₪0: nothing converted can pay by late December, because of the cap, the owner steps,
  Gumroad's $100 minimum, Wix's M+2 lag and $200 floor, and CrazyGames' €100 threshold. The USDC high is a single
  Superteam placement. It is dated from **T1's first actual run**, which has not happened (T1 is queued, not running):
  four weekly readings, then the board, step 12, a free BBU slot, a 3-5 agent-day build and a sponsor's judging. If T1
  first runs around 5.10, that chain ends in mid-to-late December at the earliest; any slip puts it past month 3.
- **Month 6.** Converted high ~₪200: early Firefox, Spreadshirt and Play Books sales at a fraction of their month-12
  arithmetic, and Wix ₪0 because of its lag and floor.
- **Likely case.** Every verifier put each engine's modal outcome at ₪0. The likely band assumes one or two engines
  produce occasional small sales by month 12.
  - No base rate supports any single engine's sales volume. The one measured rate (ArrangeMe, g) describes a flooded
    catalogue most of whose titles never sold.
  - Month one of every engine is ₪0 (the chief audit's finding, carried in `FORECAST.md`).
- **Timing.** Nothing here reaches a buyer before the free owner actions free BBU slots and each engine's own account
  exists. Each engine's clock starts at its own launch, not today.

### 5.3 Against `research/channel-loop/FORECAST.md`

Scenario 3's row "additional channels opened by the loop" reads, at month 12, ₪0 / ₪150-500 / ₪1,500-2,000, with a
~5% tail from a line with a non-public input. **This sweep lands on the same line and does not raise it.** Its converted
arithmetic ceiling (~₪925) is below FORECAST's high, and its likely band (₪0-250) sits at or below FORECAST's because
every verifier put each engine's modal outcome at ₪0.

**The sweep found no engine with a non-public input** in the sense of constraint 8. The nearest is the ArrangeMe
arrangement licence for copyrighted songs, which is honest only with a verified melody source the colony does not
have. So the ~5% tail is unchanged, and **₪20,000 a month by month 12 stays at about 1%**, as FORECAST states.

### 5.4 What would falsify this

**Upward (any one of these raises the likely band):**

- Firefox's ₪0 test names a Pro feature that is free nowhere, and the Hebrew cohort shows hundreds of daily users.
- Superteam T1 reads a four-week mean of 10 or more agent-eligible external-sponsor development bounties, **and** T4
  shows a camera-free Israeli off-ramp.
- ArrangeMe's occupancy count (run only if the terms allow it) finds many empty arrangement cells with sales history,
  its login works unattended, and the terms allow automation and AI.
- Spreadshirt answers yes in writing, and a first design sells within 30 days of listing.
- **Any first ledger row from any engine.** This is the only event that proves a channel exists.

**Downward, each one a kill (they compound):**

- **Rail kills:**
  - A **Tipalti camera step** kills CrazyGames and Wix together, before step 10 is ever asked.
  - A **PayPal Israel selfie** kills Pebble, Spreadshirt and GameMonetize together.
- **Venue kills:**
  - Firefox: no Pro feature that is free nowhere can be named (G4); or the newest cohort sits at a median of about 30
    daily users, and Hebrew utilities under about 500. (The ~30 is the Obsidian analogue, median 27,
    `research/colony-sweep/groups/plugin-ecosystems.md:61-67`.)
  - Superteam: T1's mean is under 3, or the claim forces the owner's legal name onto a public profile.
  - Play Books lists no Israel.
  - Wix's security test has no free route, or the colony cannot issue the per-payout tax invoice.
  - Spreadshirt's terms ban automated uploads, or it answers "no".
  - ArrangeMe's terms forbid automated access or AI, or its login has a CAPTCHA.

---

## 6. Killed venues, and venues that could not be settled

### 6.1 Killed by verifiers (github or repo grade unless marked; the board may confirm)

| Venue | One-line reason |
|---|---|
| Apify Store: a fleet of 7-11 Actors | Default Store-API search hides non-KYC developers' Actors (g, `store.yaml`). Third-party fleets of 23 and 4 Actors got 0-1 strangers (g, URL not saved). `BOARD-LOOP.md:195` already rules that a second Actor is not a channel. |
| Gumroad as a venue that brings buyers | Discover opens a product only after it has a sale (g, `recommendations.rb` `sale_made`; `docs/REJECTED.md:1112`). The sitemap ping has done nothing since 2023 (s). **It stays the rail.** |
| itch.io asset packs | The API is read-only and butler cannot create pages. The quality guidelines call automated page creation and "predominantly … algorithms or AI" content spam (g). Prior ceiling ₪0 (`research/colony-sweep/groups/storefronts.md:180`). |
| e-vrit (Hebrew ebooks) | **(s)** Self-publishing is pay-to-publish with human review of each title (snippet, from e-vrit's own help centre). |
| Apify affiliate §8 (Open Source Fair Share) as a breadth venue | Open-sourcing needs a per-Actor Console checkbox; `isSourceCodeHidden` is not writable by API (g). ₪0 in the ledger at month 12. *Salvage:* tick the box on Actor #1 during step 6a's visit. |
| PromptBase | Killed on two remaining grounds: the Zoneless route pauses payouts for a Didit selfie (g), and prompt packs were already rejected (`research/tiktok/07-ai-money-tooling.md:236`). Its Stripe route is **U, not dead**: the rendered Stripe page rules out only self-serve cross-border payouts and names Global Payouts, which lists Israel; PromptBase's own payout-country list is unread. |

### 6.2 Dead at scout grade (one line each)

**Code and security bounties**

- **IssueHunt:** 0 funded labels in all time (g).
- **Opire:** $10 farm tickets on forks (g).
- **Expensify:** needs a verified Upwork profile and a contract per issue (g, s).
- **Tenstorrent:** bans AI claimants permanently (g).
- **tinygrad:** closes and bans AI-looking new contributors (g).
- **Google OSS VRP:** signed-in form per report (`docs/REJECTED.md:1200`).
- **huntr:** same reason (`docs/REJECTED.md:1203`).
- **Web3 contests** (Immunefi, Code4rena, Sherlock, Cantina, Hats): Onfido or Persona KYC, web dashboards; Code4rena is
  winding down (`research/colony-sweep/SWEEP-2.md:264-267`).
- **HackerOne:** bans automated delivery of reports (`docs/REJECTED.md:515-518`); a live selfie or camera ID check
  for submission eligibility (`research/colony-sweep/audits/bounties-grants.md:354-355`).
- **Bugcrowd:** Jumio face photo. **Intigriti:** Onfido liveness.

**Games and devices**

- **Microsoft Store:** ID plus selfie (g).
- **Garmin native monetisation:** $100 a year and non-Israeli entities only (s).
- **Samsung Galaxy Store:** watch faces now route to Google Play (s).
- **Google Play, Wear OS:** $25 fee (`docs/REJECTED.md:1426-1427`; `docs/INCOME_PLAN.he.md` §4).

**Automation marketplaces**

- **MCPize / AgenticMarket:** *moved to §6.5 as unsettled.* MCPize pays through Stripe Connect (s), which the rendered
  page rules out only for self-serve cross-border payouts; AgenticMarket's rail is UNKNOWN. U pending each platform's
  own payout-country list.
- **Make:** partnership contract.
- **Zapier:** pays creators nothing.
- **Hugging Face, Replicate, Pipedream, Postman, Val Town:** no creator payout (g, R).

**Storefront rails**

- **Whop:** a face photo with every document type (g, `whopio/whopsdk-typescript`
  `src/api/resources/verifications/types/CreateVerificationsRequestBody.ts`,
  https://github.com/whopio/whopsdk-typescript).
- **Polar:** selfie (killed 28.9, `research/measurements/polar-rail.md`).
- **Lemon Squeezy:** no product-creation API (g).
- **Payhip and Ko-fi:** no listing API, no marketplace.
- **Stan Store and Podia:** subscriptions, which break ₪0.
- **Sellix:** defunct.

**App marketplaces**

- **monday.com:** Payoneer face scan.
- **JetBrains:** manual first upload, and the trader details publish the owner's name (g).
- **Zendesk:** own Stripe account.
- **Canva:** invite-only programme.

**Publishing**

- **Draft2Digital and Kobo:** ban AI content without human editing (s).
- **Lulu:** fulfilment only, no buyers.

**Israeli-local**

- **Morning:** referral pays account credit, not cash (`research/colony-sweep/groups/israel-bureaucracy.md:220`).
- **Israeli teacher-to-teacher sites:** free content everywhere; Facebook Marketplace bans digital goods (s).
- **Government procurement:** tenders and human sales (`docs/REJECTED.md:156-176`).

**Education**

- **Teachers Pay Teachers:** *unsettled, not dead.* A snippet cites a $29 seller fee; the reviewer recalls (grade n) a
  free Basic seller tier with Premium optional. Kept open until the render (§6.5 Batch C).
- **Udemy:** fully AI courses fail its quality bar, and there is no create API (s, g).
- **Tes:** its author code bars low-human-input AI (s).
- **Skillshare:** bans computer voices (s).
- **Teachable and Thinkific:** no buyers of their own.
- **Outschool:** live teacher on camera.

**Affiliate programmes**

- **iCount:** needs a paid customer account, and the permanent rejection stands (`docs/REJECTED.md:1103`).
- **Hostinger and Wix affiliate:** we do not use them, so an endorsement would be dishonest.
- **Morning referral:** credit, not money.
- **Amazon Associates:** wrong audience, zero traffic.

**Print on demand**

- **Redbubble:** automation only through detection-evasion stealth plugins (g), which is RED (`docs/REJECTED.md:274`).
- **Etsy:** $0.20 listing fee and a Persona selfie (R).

**Sheet music**

- **Musicnotes, MyMusicSheet, Score Exchange, PaidTabs:** no bulk channel in any public code, so the Adobe precedent
  applies (`docs/REJECTED.md:1006-1010`).
- **SMP Press:** merged into ArrangeMe.

**AI-native markets**

- **Civitai:** cash-out needs a paid membership (g).
- **OpenArt:** no per-item payout.
- **Modrinth:** bans primarily-AI projects (g, `rules.vue` §6).

### 6.3 Scout rated WEAK, but a gate FAILED: recommended kills

| Venue | Failed gate |
|---|---|
| YesWeHack | Researcher tokens are for managers only; automation means a logged-in browser (g) |
| 0DIN | Portal-only submission (s) |
| Playgama | "Submitting a game to moderation" stays a human action in its own MCP (g, https://github.com/Playgama/developer-cabinet-mcp). *Reopen if the MCP adds submission.* |
| Cults3D | The "No AI" filter is on by default site-wide, so honestly tagged work is hidden (s, Cults' own page) |
| Microsoft Edge Add-ons | "No REST API endpoints for creating a new product" (g) |
| Google Workspace Marketplace | OAuth verification and review per app (s) |
| Amazon KDP | No listing API; every automation types the owner's password into a browser (g) |
| Leanpub | Its API is a paid Pro feature (s) |
| Zepp OS | No publish command in its CLI (g) |
| Garmin Connect IQ plus KiezelPay | "Garmin has no publishing API"; new listings go through a dashboard behind Turnstile (g) |
| PartnerStack; Gumroad global affiliates | Multipliers on zero traffic (R, g). Gumroad affiliates stay optional on our own pages. |
| Freemius; Creem and Dodo | No buyers of their own. Freemius stays the recorded backup rail (`docs/REJECTED.md:1413`). |

### 6.4 Killed by standing verdicts (no new evidence against the stated reason)

- **RapidAPI and Zyla:** the paid-apis and agent-services kills (`docs/REJECTED.md:1252-1272`). Reopen only on the
  condition at `:1310`.
- **Odoo paid modules:** median 1 lifetime purchase (`docs/REJECTED.md:1204`).
- **Freepik, Dreamstime, Fab, CGTrader, Creative Fabrica:** the licensing group's zero price floor
  (`docs/REJECTED.md:984-1023`, `:997`, `:1002`).
- **Code4rena:** wind-down (`research/colony-sweep/SWEEP-2.md:264`).

### 6.5 Unsettled: the primary URLs a runner should render (free)

Plan: at most **one** render-watch dispatch per tick (`CHANNEL_LOOP.md:83`), so the batches below run in order.
Batch A settles the top five and the PayPal rail. **Terms first, everywhere:** a login or search page is rendered only
where the venue's own terms allow automated access, and no probe records session behaviour. **Do not render
algora.io** (§2.5).

**Batch A**

- **Firefox Add-ons:**
  - https://extensionworkshop.com/documentation/publish/add-on-policies/
  - https://addons.mozilla.org/api/v5/addons/search/?app=firefox&type=extension&sort=created&page_size=50
  - https://addons.mozilla.org/api/v5/addons/search/?app=firefox&type=extension&q=hebrew&page_size=50
  - https://addons.mozilla.org/api/v5/addons/addon/hebrew-il-language-pack/
- **Superteam** (T2 and T4, queued as ZERO-TESTS rows 30 and 32):
  - https://superteam.fun/earn/terms-of-use.pdf
  - https://superteam.fun/earn/agents/
  - https://docs.superteam.fun/the-superteam-handbook/community/faqs/superteam-earn-faq
  - https://help.bitsofgold.co.il/en/articles/8904919-how-to-create-an-account
  - https://bit2c.co.il/ (`research/channel-loop/ZERO-TESTS.md:41`)
  - The gas question: whether Privy sponsors transaction fees for platform-created wallets. Privy's docs root is
    https://docs.privy.io/ (grade n; the exact page is not recorded).
- **CrazyGames** (Tipalti first: it gates step 10):
  - https://help.tipalti.com/hc/en-us/articles/30607242003223-Payees-FAQs
  - https://docs.crazygames.com/requirements/gameplay/
  - https://docs.crazygames.com/resources/basic-launch-metrics/
- **Pebble:**
  - https://kiezelpay.com/faq/
  - https://apps.repebble.com/faces
- **Spreadshirt:**
  - https://www.spreadshirt.com/terms-and-conditions-for-shop-partner-C2376
  - https://help.spreadshirt.com/hc/en-us/articles/207905515-Payment-of-Your-Commission
  - https://help.spreadshirt.com/hc/en-us/articles/11874067093404-Tax-Form-Information-for-Non-US-Partners
  - https://www.spreadshirt.com/blog/2024/12/03/simplified-partner-taxation-and-payout-process/
  - https://www.spreadshirt.com/blog/2024/06/07/ai-and-designs-dos-donts/
  - https://developer.spreadshirt.net/
- **PayPal Israel** (the rail for three engines):
  - https://www.paypal.com/il/legalhub/paypal/useragreement-full?locale.x=en_IL
  - https://www.paypal.com/il/webapps/mpp/ua/useragreement-full
  - https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183?locale.x=en_IL
  - The identity-verification help article: its exact URL is not recorded anywhere in the repo. The runner follows it
    from the user agreement's verification section; it is not guessed here.

**Batch B**

- **Wix:**
  - https://dev.wix.com/docs/build-apps/launch-your-app/legal-and-security/security-and-privacy-best-practice
  - https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-market-guidelines
  - https://help.tipalti.com/hc/en-us/articles/31314361313815-Payment-methods-coverage-US-ROW
  - https://dev.wix.com/docs/build-apps/launch-your-app/market-listing/add-your-company-info
- **Google Play Books:**
  - https://support.google.com/books/partner/table/6052428?hl=en
  - https://support.google.com/books/partner/answer/3250840?hl=en
  - https://support.google.com/books/partner/answer/4490848?hl=en
- **ArrangeMe (terms first):**
  - https://www.arrangeme.com/terms (grep for: automated, AI, payment, W-8, identity, arranger name)
  - https://blog.arrangeme.com/blog/expanded-distribution-for-all-accounts
  - **Only if those terms allow automated access:** https://www.arrangeme.com/login (grep for recaptcha, hcaptcha,
    turnstile only; no session probe).
  - **Only after Sheet Music Plus's and Sheet Music Direct's own terms of use are read and allow it** (their URLs are
    not recorded; located from each site's footer): one song's search results page on https://www.sheetmusicplus.com/
    and on https://www.sheetmusicdirect.com/, counting listings per instrument and level.
- **GameMonetize** (only after a game passes CrazyGames):
  - https://gamemonetize.com/faq
  - https://gamemonetize.com/blog
- **EU trader display (DSA)**, the brand-only question for Spreadshirt and other EU venues:
  - https://eur-lex.europa.eu/eli/reg/2022/2065/oj (Articles 30-31)
- *Moved out:* the Mozilla and HackerOne pages belong to queue #8's own test, not this sweep. HackerOne pages are
  rendered only after HackerOne's own terms are read for automated access.

**Batch C (second tier, §2.4, and regraded venues)**

- **n8n:**
  - https://api.n8n.io/api/templates/search?rows=100&page=1
  - https://n8n.io/creators/
- **WordPress.org:**
  - https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/
- **Shiur Hofshi:**
  - https://shiurhofshi.co.il/faq/
  - https://shiurhofshi.co.il/wp-json/
- **GameDistribution:**
  - https://static.gamedistribution.com/terms/developer.html
- **Wavedash:**
  - https://docs.wavedash.com/llms-full.txt
- **Zazzle:**
  - https://www.zazzle.com/terms/updated_creator_license_agreement
- **TeePublic:**
  - https://teepublic.zendesk.com/hc/en-us/articles/115012518628-How-do-I-get-paid
- **LottieFiles:**
  - https://lottiefiles.com/marketplace/sell
- **Facer:**
  - https://www.facer.io/creator/partner
- **SeaArt:**
  - https://docs.seaart.ai/guide-1/6-permanent-events/seaart.ai-creator-incentive-program
- **Tensor.art:**
  - https://tensor.art/articles/1021600128873589993
- **Nexus Mods:**
  - https://help.nexusmods.com/article/68-donation-points-system-terms-of-service
- **CurseForge:**
  - https://support.curseforge.com/support/solutions/articles/9000197279-moderation-policies
- **Teachers Pay Teachers** (is the $29 fee mandatory or Premium only?):
  - https://help.teacherspayteachers.com/hc/en-us/articles/360044408171-What-types-of-Seller-accounts-are-offered-on-TPT
- **MCPize / AgenticMarket** (regraded to U; the payout-country list decides):
  - https://mcpize.com/developers
  - https://mcp-marketplace.io/blog/state-of-mcp-monetization-2026
- **Apple Books:**
  - https://authors.apple.com/
- **Apify visibility:**
  - https://api.apify.com/v2/store?search=israel&limit=1000&includeUnrunnableActors=true, compared with the same URL
    without the parameter

---

## 7. Questions for the Fable board

- **Q1. Queue order.** Which engines enter the `CHANNEL_LOOP.md` §4 queue, and in what order? The recommendation is the
  nine in §2.1, **entering the queue for their ₪0 tests only**. Admission stays one per Fable sitting
  (`BOARD-LOOP.md:9` item (2)), and Superteam's admission waits on T1-T4 (RULING §6.4). Does the board accept the
  stated weighting (hard gates settled at github grade or better, less those leaning F; then honest listings and
  buyers per new owner step; GameMonetize last by sequencing), ahead of the size of each ceiling?
- **Q2. Step 8 now?** Should the brand mailbox be asked now, as the highest-leverage free step? It removes il-biz-tools'
  last gate and makes the CrazyGames and Spreadshirt questions askable.
- **Q3. PayPal Israel.** Should it become a named owner step, conditional on one PayPal-paid engine passing its tests
  and a render of PayPal IL verification showing no selfie? It would be the first rail outside the seven steps shared
  by three engines.
- **Q4. The BBU cap and listing packs.** Does one engine's pack count as one slot, with at most 10 items built before
  its owner step? Or does the cap change? The recommendation is to keep 6 and count one slot per engine.
- **Q5. Apify visibility.** Default Store-API search hides non-KYC developers' Actors (g). Does the planned 30-day
  stranger count still measure demand, when a near-zero reading could mean "hidden" rather than "unwanted"? Options:
  - read the web Store and the MCP search as well as the API;
  - ask Apify KYC at step 6a if a render shows it has no camera step;
  - accept the instrument as biased low, and say so in the reading.
- **Q6. Superteam and the brand rule.** The talent profile requires a first and last name and a GitHub handle, and wins
  show on that profile (g). Does a legal name visible to sponsors breach the brand-only rule? Does the board accept an
  engine ranked on USDC booked unconverted, when converted ILS is ₪0 by construction until T4 and a conditional
  exchange account (an identity step, possibly needing SOL for gas) exist?
- **Q7. The honesty caps in §4.** Should they be written as code gates before any admitted engine lists anything (per
  week, per listing, per template family)?
- **Q8. Mozilla.** Confirm that it leaves the breadth ranking (RULING §7), is counted at ₪0, and stays queue #8.
- **Q9. Corrections to record** (Appendix A): the Whop rail; the Odoo, iCount and Code4rena ratings; and
  `BOARD-LOOP.md:124,126`'s placement of Tipalti "after a Full Launch invitation only".
- **Q10. EU trader display (DSA).** Before any EU venue (Spreadshirt first) is admitted, must a render show the
  owner's name will not be published?

---

## Appendix A. Contradictions with the repo that should be recorded

1. **Apify instrument.** `docs/REJECTED.md:820` says free publishing needs no KYC and starts the history-of-success
   clock. `BOARD-LOOP.md:89-92` defers KYC to 50 stranger users. Apify's own spec hides non-KYC developers' Actors from
   default Store-API search (g). The design may be circular: users wait on visibility, and visibility waits on KYC.
2. **Whop.** `docs/REJECTED.md:1068` records the payout as needing "a one-time ID upload" and the rail as reusable.
   Whop's official SDK requires a face photo with every document type (g, `whopio/whopsdk-typescript`
   `src/api/resources/verifications/types/CreateVerificationsRequestBody.ts`). It should be re-recorded as
   camera-gated.
3. **Shopify.** It is kept "parked, not rejected" (`docs/REJECTED.md:1430`), but a third-party copy cites a $19
   listing fee (`research/colony-sweep/scouts/plugin-ecosystems--shopify-apps.md:40`). If rendered, the ₪0 rule turns
   "parked" into a kill.
4. **Scout ratings that contradict standing verdicts.**
   - Odoo rated WEAK, against `docs/REJECTED.md:1204`.
   - iCount rated WEAK, against `:1103`.
   - Code4rena rated WEAK, against `research/colony-sweep/SWEEP-2.md:264`.
   - e-vrit rated PROMISING (israeli-local) but WEAK (publishing); killed.
   - Gumroad-as-venue, the Apify fleet, itch.io, CrazyGames, GameMonetize, Firefox Add-ons, Wix and Mozilla were all
     rated PROMISING against standing lines: `docs/REJECTED.md:1112`; `BOARD-LOOP.md:195`;
     `research/colony-sweep/groups/storefronts.md:180`; `docs/REJECTED.md:1200/1203` precedent; `BOARD-LOOP.md:178-183`;
     `docs/REJECTED.md:273` (a single Chrome extension) and `:1312`; `docs/REJECTED.md:914/928-929`;
     `docs/REJECTED.md:501-502`.
   - The verifiers corrected each rating downward, as §2 records.
5. **CrazyGames premises.**
   - `BOARD-LOOP.md:122-127` assumes a Basic Launch puts a game in front of "≥500 real players". The one github
     comparable reached 190 players from 157K impressions.
   - `BOARD-LOOP.md:124,126` place the Tipalti payee form "after a Full Launch invitation only". The rendered payouts
     page requires billing onboarding before any submission (`crazygames-payouts.txt:337-339`), as
     `research/measurements/crazygames.md:310-313` already records.
6. **Capacity.** Any scout's time to first sale that assumes a new owner account soon ignores `CHANNEL_LOOP.md:83,88`
   (BBU 6/6, binding).

---

## Review notes

A review of 28.9.2026 raised 20 items. Items 1-18 and most of 20 are applied above: the Gumroad fee (§3.1; Appendix
A.3 and the Gumroad part of Q10 deleted), Tipalti before step 10, the per-row high (§5.2), USDC shown apart, GameMonetize
at ₪0, ArrangeMe without a transferable basis, the stated weighting and re-sort, the G6-G8 columns, the conditional
exchange step, "queued, not running", Algora as already ruled (Q9 dropped, later questions renumbered), the §5.3 clause,
Firefox G4 = U, the `:273` reopen, Stripe-based kills regraded U, the step 2 caveat, the two Wix gates, and terms-first
renders with Bit2C. Where an item was not applied, or applied differently, the reason is one line below.

- **Item 19, saving the three missing families' JSONs and the verifier and critic notes:** not applied. This pass may
  edit only this file, and the run's results are not on disk here. It is left as an open task for the main thread (§ header).
- **Item 19, URLs:** added where GitHub search found the file (`claim.ts`, `region.ts`, the Birdywen directory,
  `store.yaml`, the Superteam schema, the Whop SDK path, addons-server, the Playgama MCP). Not found or not saved: the
  Spreadshirt archived uploader, the 23- and 4-Actor fleets, the free Hebrew-date add-ons, "10 hearts", the
  `complete-profile` route path, and the `pebble-tool` flag's file. Each is marked "URL not saved".
- **Item 18, an exact PayPal IL identity-verification URL:** not given. No such URL is recorded in the repo, and
  guessing an article number would present an invented URL as primary. The three recorded exact PayPal IL URLs are
  listed.
- **Item 3, Spreadshirt:** kept in the arithmetic sum and flagged, not dropped as "no basis". Every remaining row
  rests on an assumed rate, so dropping it alone would be arbitrary. The sum without it (₪555) is shown.
- **Item 1, the Firefox high:** the flow-corrected arithmetic gives ₪130, not ₪150, so ₪130 is used.
- **Item 3, the Wix high:** the verifier's ₪400 had no saved arithmetic. The scout's recorded inputs scaled to 3 apps
  give ₪325, so ₪325 is used.
- **Item 20, exchange rate:** 3.7 is used throughout, so Superteam's USDC high is ₪555, not ₪540.
- **Item 20, agent-days:** the review's 22-43 was for the old top five. The re-sorted top five (with Pebble in place of
  ArrangeMe) gives 19-43.
