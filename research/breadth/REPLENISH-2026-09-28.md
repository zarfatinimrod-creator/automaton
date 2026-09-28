# Refilling the §4 queue: a check of the second-tier venues (28.9.2026)

**Written by:** an Opus agent in the loop's continuous mode (`logs/CHANNEL_LOOP.md` §1, "Continuous mode").
**Wrote:** this file only. No git, and no edits to `CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`,
`MISSION.md` or `CLAUDE.md`. The main thread applies §4 and §6.
**Read first:** `research/breadth/BREADTH-SWEEP.md` §1.2, §2.4, §6; `research/breadth/BOARD.md` (Q1, Part D);
`research/breadth/verify/verdicts.json`; `research/breadth/REVIEW.md` item 20; `docs/REJECTED.md` :1171-1253;
`research/channel-loop/BOARD-LOOP.md` :178-183; `research/channel-loop/ZERO-TESTS.md` (the last row is 67);
`logs/CHANNEL_LOOP.md` §2-§8.
**Evidence grades:** **g** = github (a file in a GitHub repo, fetched); **s** = snippet (a WebSearch snippet);
**repo** = this repository's own research; **n** = none. One DNS result is a direct observation, and it carries no
grade.
**Search budget:** the five group agents used 10 WebSearch calls (2 each). This note used **0**. It used two GitHub
code searches and raw GitHub fetches instead.

**What this note re-checked itself at github grade (28.9.2026):**
- **CrUX Israel lists.** I fetched all 20 monthly lists from `zakird/crux-top-lists`
  (`data/country/il/202501..202608.csv.gz`), each holding 147,861-170,640 origins, and grepped them.
- **Nexus Mods.** `Resources/Markdown/Using.md:91` in `Nexus-Mods/NexusModsAuthorToolsUE@master`.
- **Fitbit.** The command imports of the Fitbit CLI (`Google-Health-API/developer-bridge@master`,
  `packages/sdk-cli/src/cli.ts:17-27`).
- **Modrinth.** `rules.vue` §6-6.2 (`modrinth/code@main`, lines 202-226).
- **Y8.** `Y8Games/y8-construct3-sdk` `README.md:28-39`.
- **CurseForge.** `bedrock-core/ui` `scripts/curseforge-upload.mjs:5-6`.
- **GameDistribution.** The GD-HTML5 wiki F.A.Q., lines 21-30.
- **SeaArt.** The `SeaCloudAI/seacloud-cli` README command list.
- **Teachers Pay Teachers.** A third-party pricing note that quotes TPT's own fees page
  (`sernl/listing-sync`, below).

Nothing in this note is revenue. The ledger is ₪0.00.

---

## 1. Why this pass ran

The owner ordered on 27.9 that income channels keep opening "without stopping". On 28.9 came "תמיד תמשיך... לא לעצור"
(`MISSION.md`; `CHANNEL_LOOP.md` §1, continuous mode). That clause also says that when the candidate queue thins, the
loop's next item is refilling it from `research/breadth/`, not stopping. After ticks 5-6, most of the breadth board's nine
queued engines were dead or failing:

- **Killed:** Pebble, Superteam and Google Play Books.
- **Failed G4:** Firefox Add-ons.
- **Unread:** Spreadshirt (every route refused).
- **NEEDS_MORE:** CrazyGames, Wix, n8n and PayPal.
- **Waiting on a game:** GameMonetize.

So this pass took the second-tier venues of `BREADTH-SWEEP.md` §2.4 and a few siblings the scouts named. It checked each
one against the seven gates at github or snippet grade. It re-checked the load-bearing claims above, and it applied one
mechanical rule. A venue is **QUEUE-worthy** only if two things hold: no gate is FAIL at github or snippet grade, and
G3 or G5 is PASS. An UNKNOWN payout is not a pass. Entering the queue buys a free render and nothing else: admission
stays one candidate per Fable sitting.

---

## 2. Every venue checked

The gates are those in `research/breadth/BOARD.md` and `MISSION.md`:

| Gate | Meaning |
|---|---|
| G1 | ₪0 up front; a cut of each sale is fine |
| G2 | An Israeli individual is paid with no camera step |
| G3 | The colony lists with no per-item owner click |
| G4 | Honest value: not already free everywhere, and AI use declared where asked |
| G5 | The venue brings its own buyers |
| G6 | One owner step unlocks many listings |
| G7 | The brand is the only public name |

**How to read the gate cells:** P = PASS, F = FAIL, U = UNKNOWN, U↘ = UNKNOWN leaning FAIL (on an absence, so not a
FAIL). The grade follows in brackets.

| # | Venue | Gate line | Verdict | Reason |
|---|---|---|---|---|
| 1 | שיעור חופשי (Shiur Hofshi), Hebrew teacher-materials shop, `shiurhofshi.co.il` | G1 P(s) · G2 U(s) · G3 U(s) · G4 U(n) · **G5 F(g)** · G6 U(n) · G7 U(n) | **DEAD** | Absent from all 20 monthly Israel CrUX lists, Jan 2025 to Aug 2026 (re-checked here: 0 hits in 20 files). The same lists carry the free Hebrew sites it competes with every month. The domain does not resolve (observed 28.9: `ENOTFOUND`, with controls). |
| 2 | Teachers Pay Teachers (TPT), incl. its Hebrew angle | **G1 F(g)** · G2 U(s) · G3 U(g, absence) · G4 U(s) · G5 P(g) · G6 U(n) · G7 U(n) | **DEAD** (changed by this note from UNSETTLED) | New github-grade evidence, a copy of TPT's own fees page (§4.2): **Basic is a one-time $29**, non-refundable. Premium is $59.95 a year. No seller tier costs ₪0 up front. G5 was a real PASS (in the CrUX global 5,000 bucket; Israel 10,000-50,000). |
| 3 | MyProduct / "שופלנד מרקטפלייס", `myproduct.co.il` | G1 P(s) · G2 U(s) · G3 U(s) · G4 U(n) · G5 U(g) · G6 U(n) · G7 U(n) | UNSETTLED | Real Israeli traffic: the CrUX IL 50,000 bucket each month from 2025-10 to 2026-08, re-checked for 2026-08. But the homepage is a free classifieds board, so there is no evidence of buyers of digital goods. Low priority. |
| 4 | Free Israeli teacher-to-teacher sites: kanlomdim, achiyayeda, hanoch.info, studyourway | G1 U(n) · **G2 F(s)** · G3 U(n) · **G4 F(s+g)** · **G5 F(s)** · G6 U · G7 U | **DEAD** (standing, reconfirmed) | They give materials away, so no seller is paid. They are the free floor any paid Hebrew worksheet must beat: achiyayeda.org is in the IL 5,000 bucket and kanlomdim in the 50,000 bucket (2026-08, re-checked). Standing scout-grade death at `docs/REJECTED.md:1249-1251`; nothing reopens it. |
| 5 | Lead: Hebrew teacher and kindergarten origins in CrUX IL (ganim-mall.co.il, haganenet.co.il, worksheets4kids.co.il, lomdiml.co.il, lemidatova.com, lomdimhofshi.co.il) | all U(n), except G5 U(g) | UNSETTLED | Steady Israeli traffic (re-checked for 2026-08: worksheets4kids 10,000, lomdiml 10,000, haganenet 50,000, ganim-mall 50,000, lemidatova 50,000). Whether any is a paid multi-seller marketplace is unknown. "mall" is a name-only inference. Six homepage renders decide it. |
| 6 | GameDistribution (Azerion) | G1 P(g) · G2 U(g) · G3 U↘(g) · G4 U(n) · **G5 P(g)** · G6 P(g) · G7 U(n) | **QUEUE** (render only; sequenced behind CrazyGames) | Queue-worthy by the rule. Its embed host `html5.gamedistribution.com` is in the IL 50,000 bucket in all 20 months (re-checked). The official FAQ makes each game's activation a dashboard ad-watch plus a publication request, with no API. That is the same runner-operates-the-portal question as CrazyGames and GameMonetize, and `BOARD-LOOP.md:183` kills on a "per-game human step". |
| 7 | Wavedash (browser games, CLI, YC beta) | G1 P(g+s) · G2 U(n) · G3 U(g) · G4 U(g) · G5 U(s) · G6 P(g) · G7 U(g) | UNSETTLED | Neither G3 nor G5 passes. The store page and paid offers are set in a portal, there is no player figure, and the payout rail is unknown. It has no ad inventory, so an ad-funded build earns ₪0 there. |
| 8 | Y8 (y8.com, id.net) | G1 P(g) · G2 U(g) · G3 U(g) · G4 U(n) · **G5 P(g)** (upgraded here from s) · G6 P(g) · G7 U(n) | **QUEUE** (render only; sequenced behind CrazyGames) | Queue-worthy by the rule. New github-grade G5: Y8's **Hebrew** subdomain `he.y8.com` is in the IL 5,000 bucket for 18 of 20 months and the 10,000 bucket for the last two, and `www.y8.com` is at 50,000 (re-checked). G2 is the likely killer. The SDK README (re-checked) offers only two routes: payment through the developer's own AdSense account (a new owner identity step), or manual invoices per payout. |
| 9 | Facer creator marketplace (Wear OS 6, Galaxy Watch 8, Apple Watch) | G1 U(s) · G2 U(s) · G3 U↘(g, absence) · G4 U(s) · **G5 P(s+g)** · G6 U(s) · G7 U(n) | **QUEUE** (render only) | Queue-worthy by the rule: "over $1 million" paid to "75+ independent designers" (s). Since Wear OS 6 it is the route to Galaxy Watch faces (g, copy of an Android Central article). Likely killed by its render: no upload API or import path found, and paid sales need 5,000 syncs plus invite-only admission. |
| 10 | Fitbit Gallery (+ KiezelPay) | G1 U(g) · G2 U(repo) · **G3 F(g)** · G4 U(n) · G5 U↘(g) · **G6 F(g)** · G7 U(n) | **DEAD** (new) | The official CLI has no publish or submit command (re-checked: `cli.ts:17-27` imports build, buildAndInstall, connect, heapSnapshot, hosts, install, logout, mockHost, repl, screenshot and setAppPackage). Each face is created and uploaded by hand in the Gallery App Manager. Versa 4 and Sense 2 take no third-party apps. |
| 11 | Garmin Connect IQ (both routes) | **G1 F(s)** native · **G2 F(s)** native · **G3 F(g)** · G4 U↘(g) · G5 P(g) · **G6 F(g)** · G7 U | **DEAD** (standing) | `docs/REJECTED.md:1233-1234` stands. The only new fact is that KiezelPay onboards Garmin sellers (`research/rendered/kiezelpay-faq.txt:229-231`). That touches payout, not G3. |
| 12 | Zepp OS / Zepp Store | **G2 F(g)** native · **G3 F(g)** · G5 U(g) · **G6 F(g)** · others U | **DEAD** (standing) | `docs/REJECTED.md:1233` stands, re-read 28.9: the zeus CLI has no publish command, and paid faces are for mainland-China corporate developers only. |
| 13 | Samsung Galaxy Store (watch faces) | G3 U↘(g) · **G5 F(s)** · others U(n) | **DEAD** (standing) | Faces for Watch4 and later go to Google Play outside China (`docs/REJECTED.md:1249`). |
| 14 | Google Play (Wear OS faces) | **G1 F(repo)** · others U | **DEAD** (standing) | The $25 fee (`docs/REJECTED.md:1247`, `:1525`). Wear OS demand is reachable through Facer (row 9) instead. |
| 15 | Modrinth | G1 P(g) · G2 U(g) · G3 P(g) · **G4 F(g)** · G5 P(g) · G6 P(g) · G7 U(n) | **DEAD** (standing) | Re-read here: `rules.vue` §6.2(b), "Projects may not be published publicly if the contents are primarily or entirely a product of AI output." §6.2(a) bars AI images anywhere on a project page. Stands at `docs/REJECTED.md:1244`. |
| 16 | Nexus Mods (Donation Points) | G1 P(s) · G2 U(g) · **G3 F(g)** · G4 P(s) · G5 P(g) · **G6 F(g)** · G7 U(n) | **DEAD** (new) | Nexus's own repo, re-checked (`Using.md:91`): "you have to have created a mod page and uploaded a file before you can automate uploads for it. This is a limitation we are aware of." The v3 OpenAPI has no mod-creation path. |
| 17 | CurseForge Authors Rewards | G1 P(s) · G2 U(g) · **G3 F(g)** · G4 U(g) · G5 P(g) · **G6 F(g)** · G7 U(n) | **DEAD** (new) | The token API only adds files to existing projects. Re-checked: "CurseForge's author API can create files and set their changelog, and nothing else" (`bedrock-core/ui` `scripts/curseforge-upload.mjs:5-6`). Project creation is only reverse-engineered with the owner's browser cookies, which is the RED precedent. |
| 18 | SeaArt Creator Incentive Program | G1 P(s) · G2 U(s) · **G3 F(g, absence)** · G4 P(s) · G5 P(g) · G6 P(s) · G7 U(n) | **DEAD** (new) | The official CLI has no publish command (re-checked: auth, account, models, run, run-async, task, llm, skills and others). A third-party publishing skill says publishing is only through the web App Builder, and it tells agents not to invent endpoints. This is the same shape as the Zepp kill. |
| 19 | Tensor.art (TenStar Fund, Pro incentives) | G1 U(s) · G2 U(s) · G3 U↘(g) · G4 P(s) · G5 U(g) · G6 U(s) · G7 U(n) | UNSETTLED | No gate fails, and neither G3 nor G5 passes. The deciders are whether the Pro segment needs a paid creator tier, and any non-web publish route. Plain HTTP gets a Cloudflare challenge. |
| 20 | Apple Books direct (iTMSTransporter) | G1 P(g) · G2 U(s) · G3 P(g) · G4 U(n) · G5 P(n) · G6 P(g) · **G7 F(s; g corroborates)** | **DEAD** (new) | Apple shows the legal entity name as the default seller name on Apple Books. A different seller name needs a DBA or trade-name certificate (s). A live listing on GitHub shows a personal seller name beside a pen name (g). Delivery by API is proven (G3 PASS), so a reopen turns on G7 and G2 only. |
| 21 | Apple Books via aggregators (PublishDrive, Draft2Digital) | PublishDrive **G1 F(g)** ($9.99/month); Draft2Digital **G4 F(s)** (standing) | **DEAD** | PublishDrive is a subscription. Draft2Digital's AI rule stands (`docs/REJECTED.md:1251`). StreetLib was named but not checked: it is a lead, not a verdict. |
| 22 | Indiebook (אינדיבוק), Hebrew ebook store with a self-publishing category | G1 U(s) · G2 U(s) · G3 U(g, absence) · G4 U(n) · **G5 P(g)** (upgraded here) · G6 U(n) · G7 U(n) | **QUEUE** (changed by this note from UNSETTLED; render only) | New github-grade G5, re-checked across all 20 files: `indiebook.co.il` is in the Israel CrUX **5,000** bucket every month from Jan to Nov 2025 and the **10,000** bucket every month from Dec 2025 to Aug 2026. That is traffic to a store whose purpose is selling ebooks; that the visitors buy is inferred, supported by its per-title Google Ads script (g). No gate fails. |
| 23 | LottieFiles marketplace (→ IconScout contributors) | G1 U(s) · G2 U(n) · G3 U↘(g) · **G4 F(s+g)** · G5 P(s) · G6 U(n) · G7 P weak(g) | **DEAD** (new) | Everything the colony could make (loaders, UI icons, micro-interactions) is free. LottieFiles runs its own free library and free packs (g), and at least 12 free commercial-use Lottie sites exist (s). This is the standing zero-price floor for generic assets (`docs/REJECTED.md:991-997`). |

**Count:** 4 QUEUE, 15 DEAD (9 new gate refutations and 6 standing kills reconfirmed) and 4 UNSETTLED.

### 2.1 What this note changed from the group results, and citation fixes

1. **Teachers Pay Teachers: UNSETTLED → DEAD on G1 at github grade.** This is new evidence, not a re-reading of the
   old snippet (§4.2).
2. **Indiebook: UNSETTLED → QUEUE.** G5 was UNKNOWN leaning PASS. The 20-month CrUX IL series makes it PASS at github
   grade. The TPT row used the same standard.
3. **Y8: G5 moves from snippet to github grade.** It is in the Israel lists under a Hebrew subdomain.
4. **Line drift in `docs/REJECTED.md`.** Several group citations point at the wrong lines:

   | Content | The group cited | Now at |
   |---|---|---|
   | Israeli teacher-to-teacher sites | :1244 | :1249-1251 |
   | Teachers Pay Teachers, "unsettled" | :1246 | :1253 |
   | "never sell what is already free" (the sweep's :1271) | :1271 | :1370 |
   | The licensing zero price floor and $0.04-0.07 a download | :997, :990-992 | :991-997 |

   `BOARD-LOOP.md:178` (the sequencing rule) and `:183` (the kill clause) are correct as cited.

---

## 3. Venues recommended to ENTER the §4 queue (queue only; ₪0 tests)

Nothing here is admitted. Entry buys a free render. Admission stays one candidate per Fable sitting, and only after a
candidate's ₪0 test has returned (`BOARD.md` Part A frame; `BOARD-LOOP.md` BUILD-1). Every entry below has G2 UNKNOWN,
and none has shown that a new listing with no sales is found. Stated plainly, **the modal month-12 figure for each is
₪0**. The immediately testable additions are **Indiebook and Facer**. GameDistribution and Y8 can be rendered now, but
they cannot be admitted until a game passes CrazyGames Basic Launch (`BOARD-LOOP.md:178`), and no game exists.

The kill clauses below are **proposals for the sitting to adopt**, in the pre-registered form the board used for Pebble.
Opus does not decide kills.

### 3.1 Indiebook (אינדיבוק): proposed new row 22 (take the next free number)

**Gate line.** G1 U(s) · G2 U(s) · G3 U(g, absence) · G4 U(n) · **G5 P(g)** · G6 U(n) · G7 U(n).

**Evidence.**
- CrUX IL 5,000 → 10,000 in 20 of 20 months (re-checked).
- A Google Ads script buys exact-match keywords per title, read from the store's own `seoReport.csv` (`RcBuilder/Scripts`,
  "(R) IndieBook Keywords Creator.adwords", g; date unknown).
- A snippet: the store "does not provide publishing services", so no paid package is sold.

**What it adds.** The only Hebrew consumer store in the sweep with github-grade traffic. That matters after e-vrit
(pay-to-publish) and Play Books (Israel absent) died.

**The ₪0 test.** Render its homepage, the independent-author royalty-report guide and the self-publishing category
(§6). The terms page is taken from the rendered footer, not guessed. The title list `seoReport.csv` is rendered only
after the terms are read.

**Before admission.** Name one Hebrew title in writing, and say what it gives that is not already free. Titles that
restate free state content are barred (`docs/REJECTED.md:170-175`; `:1370`). This is the same bar Firefox failed.

**Proposed kills.**
- (a) Any listing fee or paid publishing package is required.
- (b) The payout needs a camera step, or cannot reach an Israeli individual or עוסק פטור.
- (c) The terms bar AI-written books, or the store publishes the author's legal name with no brand or pen-name option.
- (d) Every title is a per-title web form, and the terms forbid automated access.

**What we would list.** At most five (`BOARD.md` Q4) Hebrew, AI-declared reference ebooks that pass the free-content
test. **None is identified yet**, so supply is the second open question after the gates.

### 3.2 Facer creator marketplace: proposed new row 23

**Gate line.** G1 U(s) · G2 U(s) · G3 U↘(g) · G4 U(s) · **G5 P(s+g)** · G6 U(s) · G7 U(n).

**Evidence.**
- "Over $1 MILLION in payout" to "75+ independent designers" (s, news.facer.io).
- Paid faces are sold individually or synced through Facer Premium (s).
- Since Wear OS 6, Facer syncs Watch Face Format faces to Galaxy Watch 8 "through dedicated storefronts". Most of its
  compatible faces are paid (g, a GitHub copy of Android Central, 24.7.2025).

**What it adds.** The one route left to Wear OS and Galaxy Watch buyers now that Google Play (the $25 fee) and the Galaxy
Store (faces moved to Play) are closed.

**The ₪0 test.** Render the nine URLs in §6, terms first.

**Proposed kills** (the group's four):
- (a) Faces can be created or published only by hand in the web editor: a G3 FAIL, like Garmin, Zepp and Fitbit.
- (b) The payout options exclude Israel or need a camera step.
- (c) Any creator fee.
- (d) AI-made designs are banned or cannot be declared.

**Honest outlook.** Paid sales open only after a free collection reaches 5,000 syncs and passes an invite-only tier (s).
So even a surviving Facer is a slow free-first test.

**What we would list.** Two to four functionally distinct original faces under the brand. They start free and become paid
only after admission. Colour variants do not count as separate listings (BUILD-3).

### 3.3 Y8: proposed as a venue under row 14 (renders now; admission after CrazyGames)

**Gate line.** G1 P(g) · G2 U(g) · G3 U(g) · G4 U(n) · **G5 P(g)** · G6 P(g) · G7 U(n).

**What it adds.** A second, independent portal audience. In Israel it has its own Hebrew subdomain in the CrUX top
5,000-10,000. It pays a 50% ad share, plus Y8's embed syndication.

**What it costs.** It forgoes CrazyGames' opt-in +50% two-month exclusivity (`research/rendered/crazygames-developer-terms.txt:262-274`, §5.5).

**Likely killer: G2.** The official SDK README (re-checked, `:28-36`) names two routes. One is Google paying through
**the developer's own AdSense account**, applied for once the studio is approved: a new Google identity step in the owner's
legal name. An Israeli developer's AdSense application was rejected twice (github, per the html5 scout). The other is
**manual invoices per payout**, which is settled only after step 2 and never by owner paperwork (`BOARD.md:78`).

**The ₪0 test.** Render the revshare, studios, SDK-intro and new-games pages. `y8.com/upload` is a login form; it is
rendered only if Y8's terms allow automated access, and then only grepped for captcha.

**Proposed kills.**
- (a) The revshare page shows no route beyond a new owner AdSense account or per-payout invoices.
- (b) Any fee.
- (c) The terms bar AI-made games.
- (d) The `BOARD-LOOP.md:183` clauses.

### 3.4 GameDistribution: already inside row 14; this pass sets its test

**Gate line.** G1 P(g) · G2 U(g) · G3 U↘(g) · G4 U(n) · **G5 P(g)** · G6 P(g) · G7 U(n).

**Evidence (re-checked in the official wiki F.A.Q.).**
- "It is mandatory to completely watch a video advertisement within your uploaded game. This is only possible from the
  page within your Gamedistribution.com control panel" (:21).
- "request your game to be published by clicking the designated button" (:23).
- A 50-euro minimum and a payment term of up to 8 weeks (:26-27).
- Cross-promotion "decided by our content team; based on engagement …" (:30).

**The ₪0 test.** Render the four URLs in §6. `BREADTH-SWEEP.md` §6.5 Batch C already names the developer terms, which is
the breadth board's authority to render before a game exists.

**The kill clause.** `BOARD-LOOP.md:183` applies unchanged. Whether a dashboard ad-watch that a runner performs counts as
a "per-game human step" is the same open ruling as CrazyGames' portal question. It should be ruled once for all three
networks.

---

## 4. Venues DEAD, with the evidence (for `docs/REJECTED.md`; the main thread records them)

Every kill below is a gate refuted at the stated grade, and none rests on a ceiling. They are recorded as the sweep's
§6.1 kills were: the next sitting may confirm. Each carries its reopen trigger.

### 4.1 New gate refutations (9)

1. **שיעור חופשי (Shiur Hofshi), `shiurhofshi.co.il`: G5 FAIL (github).**
   - **Evidence.** The origin is in none of the 20 monthly Israel CrUX lists (`zakird/crux-top-lists`
     `data/country/il/202501..202608.csv.gz`, 147,861-170,640 origins each). This note re-checked it: 0 hits in all 20
     files. The same lists carry the free Hebrew sites it competes with every month, and they carry TPT.
   - **Also observed.** On 28.9.2026 WebFetch got `getaddrinfo ENOTFOUND` for both the apex and `www`. As controls, a
     real .co.il host resolved and a made-up .co.il name gave the same error. The only indexed page is `/faq/`, still
     titled "faq – Teachers Woocommerce" (s).
   - **Reopens if** a runner render of `/faq/` returns 200 AND the origin appears in a later CrUX IL monthly file.
2. **Teachers Pay Teachers: G1 FAIL (github); this settles the item held "unsettled, not dead" at `docs/REJECTED.md:1253`.**
   - **Evidence.** A third-party research note dated 2026-09-20 (`sernl/listing-sync`,
     `docs/notes/design/research/2026-09-20-pricing-evidence-market.md:29-31`, commit 8f0494d) quotes TPT's own "Seller
     Fees and Payout Rates" page (help article 360044219891, "primary, updated 2026-07-22"):
     - **TPT Basic: "one-time $29, non-refundable, not creditable toward Premium"**, with a 55% share and a 30¢ fee per
       resource;
     - **TPT Premium: $59.95 a year**, with an 80% share.
   - **Why this outweighs the earlier doubt.** It agrees with the earlier snippet ("TPT's Basic Membership is a one-time
     non-refundable fee of $29 USD"). The doubt that kept TPT open was a recollection at grade none (`REVIEW.md` item 20).
   - **What is lost.** G5 was a real PASS (github: in the CrUX global 5,000 bucket; Israel 10,000-50,000), so a Hebrew
     angle dies with it.
   - **Reopens if** the rendered fees page (§6, one URL, to confirm) shows a seller tier with no up-front fee.
3. **Fitbit Gallery (Fitbit OS clock faces), with KiezelPay: G3 and G6 FAIL (github).**
   - **Evidence.** The official CLI's command set has no publish or submit command (re-checked:
     `Google-Health-API/developer-bridge@master` `packages/sdk-cli/src/cli.ts:17-27`). Publishing is "Sign in to the
     Fitbit Gallery App Manager (GAM) … create an app entry … Upload the build … Submit for review" (a 2026 README on
     GitHub). Each face is its own dashboard session, the same shape as Garmin and Zepp.
   - **Also.** The current watches (Versa 4, Sense 2) take no third-party apps (g).
   - **Reopens if** Fitbit or Google ships a submission API or a CLI publish command.
4. **Nexus Mods (Donation Points): G3 and G6 FAIL (github).**
   - **Evidence.** "Yes, this does mean you have to have created a mod page and uploaded a file before you can automate
     uploads for it. This is a limitation we are aware of, and are working on providing solutions for"
     (`Nexus-Mods/NexusModsAuthorToolsUE@master` `Resources/Markdown/Using.md:91`, re-checked). The v3 OpenAPI in
     `Nexus-Mods/Vortex` (`packages/nexus-api-v3/schema/openapi.yaml`) creates files only under an existing `mod_id`.
   - **Correction to the scout.** The quote "cannot create new mod pages" is not in `upload-action`'s README. Its line 56
     says the same thing in other words.
   - **Reopens if** the v3 API adds mod creation.
5. **CurseForge Authors Rewards: G3 and G6 FAIL (github).**
   - **Evidence.** The token API posts files only to existing projects (`POST /api/projects/{projectId}/upload-file`).
     "CurseForge's author API can create files and set their changelog, and nothing else" (`bedrock-core/ui`
     `scripts/curseforge-upload.mjs:5-6`, re-checked).
   - **The only creation route seen.** It uses the owner's copied browser cookies against `authors.curseforge.com/_api/projects`.
     Its own README calls it "reverse-engineered website interactions" (`PackUploader`, g). That is the RED
     browser-session precedent (`docs/REJECTED.md:274`).
   - **Reopens if** a project-creation API appears. Then render the moderation-policy and rewards-terms pages.
6. **SeaArt Creator Incentive Program: G3 FAIL (github, resting on an absence; the Zepp precedent).**
   - **Evidence.** The official `SeaCloudAI/seacloud-cli` has no publish command (re-checked in its README: auth,
     account, models, run, run-async, task, llm, skills and others). A third-party publishing skill checked 2026-09-12
     (`seaart-app-publisher` `references/platform-workflow.md`) says publishing goes through the web App Builder, and it
     tells agents not to invent private endpoints or export cookies.
   - **Reopens if** SeaArt ships a publish endpoint. Then render the FAQ for the real-name payout method.
7. **Apple Books direct: G7 FAIL (snippet; github corroborates).**
   - **Evidence.** Apple's help (per the snippet) says the legal entity name "is also the default seller name that
     displays on Apple Books". A different seller name comes only through a Contact Us request "with proof … such as a
     DBA/fictitious business name certificate". GitHub shows a live listing whose "Seller name on Apple:" is a personal
     name, not the author's pen name (code search for that phrase).
   - **What is not in doubt.** Delivery is proven at github grade (iTMSTransporter runs on Linux; batch deliveries are
     documented).
   - **Reopens if** the brand gains a legal entity or a trade-name document that Apple accepts, and G2 (Israel on the bank
     list, no camera) is then rendered.
8. **Apple Books via aggregators: PublishDrive G1 FAIL (github: "$9.99/month flat fee"); Draft2Digital G4 FAIL (standing, snippet).**
   - **Reopens if** a commission-only aggregator is found that reaches Apple, accepts disclosed AI work without
     extensive human editing, and stands as the public seller.
   - **Unchecked lead.** StreetLib needs its own scout before any verdict.
9. **LottieFiles marketplace (IconScout contributors): G4 FAIL (snippet and github).**
   - **Evidence.** LottieFiles runs its own free library ("LottieFiles Free Animations", g) and free packs (g), and at
     least 12 free commercial-use Lottie sites exist (s). So loaders, UI icons and micro-interactions are free
     everywhere, the standing zero-price floor (`docs/REJECTED.md:991-997`).
   - **Also.** Its public GraphQL has one create mutation, for a free public animation with no price field (g).
   - **Reopens if** a Lottie product has a named feature that is free nowhere. Then render IconScout's contributor terms
     (fee, payout country, camera, AI rule, bulk upload).

### 4.2 Standing kills reconfirmed: no new evidence against the reason, so no change

- **Israeli teacher-to-teacher sites.** The scout-grade death stands (`:1249-1251`). New github weight shows them as the
  free floor (CrUX IL).
- **Garmin Connect IQ.** `:1233-1234` stands. KiezelPay's Garmin onboarding (`kiezelpay-faq.txt:229-231`) touches
  payout, not G3.
- **Zepp OS.** `:1233` stands, re-read 28.9 in `zepp-health/zeppos-docs`.
- **Samsung Galaxy Store.** `:1249` stands.
- **Google Play for Wear OS.** `:1247` and `:1525` stand.
- **Modrinth.** `:1244` stands. `rules.vue` §6.2 was re-read here.
- **Draft2Digital.** `:1251` stands.

---

## 5. Unsettled: what decides each

| Venue | Decided by | Priority |
|---|---|---|
| Hebrew teacher and kindergarten origins in CrUX IL (lead) | Six homepage renders: is any a paid multi-seller marketplace? A yes makes it a scout target, since it could be the live Hebrew teacher marketplace Shiur Hofshi is not. | next dispatch |
| Wavedash | `llms-full.txt` (payout rail and countries, creator fund, content rules). G5 stays UNKNOWN unless a player figure appears, so QUEUE needs a player figure too. | next dispatch (one URL) |
| MyProduct (`myproduct.co.il`) | A digital-goods category with buyers, plus a documented import path | held |
| Tensor.art | Whether the Pro segment needs a paid creator tier (G1), and any non-web publish route (G3). A plain render may capture only the Cloudflare challenge. | held |

**Not covered by this pass** (still second tier, for a later refill):
- WordPress.org plugin plus Freemius;
- Zazzle, TeePublic, Society6, Threadless, Displate;
- MCPize and AgenticMarket (their Batch C URLs stand).

A StreetLib scout and a Teach Simple scout (an English teacher marketplace seen in the TPT source, grade n) are
unstarted leads.

---

## 6. Render URLs for the next dispatch (one per line, with the venue)

**Rows.** Proposed ZERO-TESTS rows start at **68**; take the next free numbers if the file moved.

**Rules.** Terms first; no login or search page unless the venue's terms allow automated access; `algora.io` is never
rendered. This is a single render-watch dispatch (the cap is one per tick). The URLs come from the group results or,
for Indiebook's homepage, from its verified CrUX origin; none is guessed.

```
Indiebook (new row) — https://indiebook.co.il/ — footer links: terms, author sign-up, contact (terms URL taken from here)
Indiebook (new row) — https://indiebook.co.il/97/%D7%9E%D7%93%D7%A8%D7%99%D7%9A-%D7%9C%D7%94%D7%A4%D7%A7%D7%AA-%D7%93%D7%95%D7%97-%D7%AA%D7%9E%D7%9C%D7%95%D7%92%D7%99%D7%9D--%D7%A1%D7%95%D7%A4%D7%A8%D7%99%D7%9D-%D7%A2%D7%A6%D7%9E%D7%90%D7%99%D7%99%D7%9D — royalty-report guide: rail, share, fees
Indiebook (new row) — https://indiebook.co.il/product-category/%D7%94%D7%95%D7%A6%D7%90%D7%AA-%D7%A1%D7%A4%D7%A8%D7%99%D7%9D/%D7%94%D7%95%D7%A6%D7%90%D7%94-%D7%A2%D7%A6%D7%9E%D7%99%D7%AA — self-publishing category: count, prices, author names shown
Facer (new row) — https://www.facer.io/terms — creator fee, AI, payout, automation
Facer (new row) — https://www.facer.io/creator/partner — the paid tier and its conditions
Facer (new row) — https://community.facer.io/t/premium-designer-program-admission-rankings-and-revenue-sharing-terms/25147 — admission and share
Facer (new row) — https://community.facer.io/t/how-to-become-a-premium-designer-and-sell-your-watch-face-designs-on-facer/3540 — the 5,000-sync route
Facer (new row) — https://community.facer.io/t/payment-options/53518 — payout methods, countries, identity
Facer (new row) — https://help.facer.io/hc/en-us/articles/16559872033819-Facer-Community-Guidelines — AI and originality
Facer (new row) — https://help.facercreator.io/hc/en-us/articles/4412573509403-Getting-Started-with-Facer-Creator — any import or upload path (G3)
Facer (new row) — https://community.facer.io/t/software-to-create-watch-faces-here-on-facer/86976 — third-party tools or import (G3)
Facer (new row) — https://news.facer.io/celebrating-1-million-in-designer-payouts-and-launching-our-first-facer-creator-partner-program-85bd2e11baff?gi=5c49d09ba159 — payout scale and partner programme
Y8 (row 14) — https://www.y8.com/revshare — payout routes (AdSense only? invoices?), Israel, fees
Y8 (row 14) — https://www.y8.com/studios — studio sign-up and approval; public studio name (G7)
Y8 (row 14) — https://docs.y8.com/sdk/intro/ — SDK duties, per-game Game ID, AI rules
Y8 (row 14) — https://www.y8.com/new/games — recency lane for new games
GameDistribution (row 14) — https://static.gamedistribution.com/terms/developer.html — automation, AI, fees, countries
GameDistribution (row 14) — https://static.gamedistribution.com/developer/developers-guidelines.html — per-game steps, content rules
GameDistribution (row 14) — https://gamedistribution.com/developers/faq/getting-started/setting-up-and-receiving-your-payment/ — payout rail, Israel, identity
GameDistribution (row 14) — https://gamedistribution.com/developers/partnership/ — revenue share, exclusivity
Teachers Pay Teachers (kill confirmation) — https://help.teacherspayteachers.com/hc/en-us/articles/360044219891-Seller-Fees-and-Payout-Rates — is any seller tier free up front?
Wavedash (unsettled) — https://docs.wavedash.com/llms-full.txt — payout rail and countries, creator fund, content rules, metadata
Hebrew teacher-site lead (unsettled) — https://ganim-mall.co.il — a multi-seller paid marketplace?
Hebrew teacher-site lead (unsettled) — https://www.haganenet.co.il — a multi-seller paid marketplace?
Hebrew teacher-site lead (unsettled) — https://worksheets4kids.co.il — a multi-seller paid marketplace?
Hebrew teacher-site lead (unsettled) — https://lomdiml.co.il — a multi-seller paid marketplace?
Hebrew teacher-site lead (unsettled) — https://lemidatova.com — a multi-seller paid marketplace?
Hebrew teacher-site lead (unsettled) — https://lomdimhofshi.co.il — a multi-seller paid marketplace? (appears once in CrUX IL, 2026-05)
```

28 URLs in all. **Held for a later dispatch**, each on the condition shown:

```
Indiebook — https://indiebook.co.il/images/site/seoReport.csv — only after its terms are read (title list, for the free-equivalent check)
Y8 — https://www.y8.com/upload — only if Y8's terms allow automated access; grep for recaptcha/hcaptcha/turnstile only, no session
Wavedash — https://docs.wavedash.com/publishing/monetization — only if llms-full.txt omits it
Wavedash — https://docs.wavedash.com/publishing/creator-fund — only if llms-full.txt omits it
Wavedash — https://docs.wavedash.com/publishing/content-guidelines — only if llms-full.txt omits it
Wavedash — https://docs.wavedash.com/publishing/metadata — only if llms-full.txt omits it
Wavedash — https://docs.wavedash.com/api — only if llms-full.txt omits it
Wavedash — https://wavedash.com/developers — player figures, if any
MyProduct — https://myproduct.co.il/marketplace_clean.php/ — digital-goods category with buyers?
MyProduct — https://myproduct.co.il/about.php — seller terms
MyProduct — https://myproduct.co.il/product-import.php — an import path with no per-item owner click?
Tensor.art — https://tensor.art/articles/1021600128873589993 — Pro-segment incentives (expect a Cloudflare challenge)
Tensor.art — https://tensor.art/event/vipmodels-learn-more — is the Pro segment a paid creator tier?
Tensor.art — https://tensor.art/event/TenStarFund — TenStar Fund terms
Tensor.art — https://tensor.art/en-US/event/tenstar — TenStar Fund terms (locale variant)
```

---

## 7. What this note did not verify

- **Snippet-grade claims.** Every claim at snippet grade was taken from the group agents' searches; this note ran none.
  The Apple Books G7 kill rests on a snippet with github corroboration. A render of
  `https://authors.apple.com/support/3967-create-itunes-connect-account` would raise it to rendered grade if the main
  thread wants that before recording.
- **The TPT fee.** It is quoted by a third party that cites the primary page. The one render in §6 confirms it at
  rendered grade.
- **CrUX measures traffic, not buyers.** It counts Chrome page loads. G5 PASS for Indiebook and Y8 infers buyers from the
  venue's nature (a store; a game portal with ads). Whether a new listing with no sales is ever found is unmeasured for
  every venue here.
- **Payout.** No venue in §3 has a verified payout path to an Israeli individual without a camera. That gate decides
  most of them.
