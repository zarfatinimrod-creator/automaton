# CHANNEL_LOOP — the non-stop channel loop

> **The owner's order (27.9.2026, verbatim in `MISSION.md`):** open income channels without limit and
> without stopping; when a channel is ready and running, build the next one — in a loop.
>
> **The owner's second order (27.9.2026, verbatim in `MISSION.md`):** a standing consent to merge and publish under
> the brand, and **₪0**: nothing the owner pays for, not even a shekel, until the ledger shows it works.
>
> **Status in brief:** 0 channels running · ledger ₪0.00 · 6 built but not launched, which is the cap. PR #3 was
> merged on 27.9 (`61fae4e`). What goes live next waits on two free owner actions with no identity check (items 1-2
> below, about 7 minutes).

This file is **rewritten on every tick** from probes, never from memory. It records where the loop stopped.
The reasoning behind each rule is the board's design, `research/channel-loop/BOARD-LOOP.md` (Fable, 27.9).
The forecast is in `research/channel-loop/FORECAST.md`.

## 0. Header

| | |
|---|---|
| Last tick | tick 6 (continuous since 28.9 16:07 UTC): Batch B read (Play Books killed, pre-registered; Firefox's reopen check confirms G4, reader recommends KILL; Wix, PayPal, n8n, Spreadshirt NEEDS_MORE); the replenish pass queued Indiebook (22), Facer (23), Y8 and GameDistribution (14) and recorded 9 gate refutations; the pcn874 free validator page merged (`a91d45e`); the step-8 questions drafted; the owner's 28.9 order "תמיד תמשיך" recorded. Next build running: mcp-il-tools publish prep |
| Branch | `claude/new-session-j071dx`, restarted from `main` after PR #4 merged (`baab472`). The standing consent means the loop merges its own green PRs. |
| Routine | "Channel loop tick", every 6 h (`11 1,7,13,19 * * *` UTC), fires into this session; see §11 |
| Fable | the 28.9 07:12 sitting ran two agents (rows 8-11), no 429. Next sitting: the breadth board (row 12) when the sweep lands, else 29.9 ~07:11. |
| Running channels / ledger | 0 / ₪0.00 |

## 1. Protocol (short form; the full text is in `BOARD-LOOP.md` §The tick protocol)

1. **Ground.** Read `MISSION.md`, then `logs/CHECKPOINT.md`, then this file. Run `git log --oneline -1` and `git status`. If the owner said "עצור", write state, disable the routine and stop.
2. **Probe what is true on `origin/main`, not on the branch.**
   - the latest colony tick and its blockers;
   - KPI rows and `state/colony/measurements/*.json`;
   - PR #3's state, CI and comments;
   - render-watch outputs since the last tick;
   - a one-word Fable probe.

   Write every result here before doing any work.
3. **Unpark.** Any parked channel whose condition is now met (an owner word, a file that appeared, a date) goes to the top.
4. **Reviews due.** Code-derived kill, scale or retarget verdicts and dated reads become Fable items in `logs/FABLE_QUEUE.md`. If Fable skips 48 h, a code-derived kill stands.
5. **Recount the caps.** Built-but-unlaunched (BBU) at most 6; experiments measuring at most 3; builds in flight at most 1; render-watch dispatches per tick at most 1.
6. **Pick work, in this order:**
   1. preparation, so a parked channel launches the minute the owner acts;
   2. ₪0 tests for queued candidates, in **one** render-watch dispatch plus GitHub-hosted reads;
   3. instruments and measurement plumbing;
   4. the top admitted build, only if every cap allows it and it needs no unapproved owner step;
   5. maintenance, otherwise record "idle-by-cap".
7. **Execute on Opus.** Every agent sets `model` explicitly. Builders work in worktrees, and every brief opens with the base check. Worktree agents never edit this file or the checkpoint.
8. **Verify before claiming.** Typecheck, targeted tests, product tests. "Public" is claimed only from a runner probe (200) plus a grep of the built artefact for owner identifiers. "Running" and "live" are never claimed from the container.
9. **Fable sitting, once a day** (~07:11 UTC), at most 2 agents:
   - admission of the top candidate whose ₪0 test returned;
   - rulings on queued kills and scales;
   - verification that a "running-claimed" channel is really running;
   - any proposed owner step.

   If Fable answers 429, queue the item and continue on Opus. Never decide a kill or an admission on Opus.
10. **Owner-ask batch.** Rebuild §6 from the channel table. Only list steps that a channel is actually blocked on.
11. **Write state.** This file, a pointer in `CHECKPOINT.md`, and a Hebrew tick log `logs/YYYY-MM-DD-channel-loop-tick.md`; then commit and push.
12. **Re-arm.** If owner-free work remains, `send_later` about 60 min to continue. Otherwise the 6-hourly routine is the heartbeat.

**When a channel counts as "ready and running":** all six conditions hold, from `origin/main` or a runner.
- **Public:** HTTP 200 from a runner under the brand, with 0 owner identifiers in the artefact.
- **Instrumented:** at least 2 consecutive scheduled KPI writes.
- **Money path declared:** a ledger connector is wired, or the channel is coded as a ₪0 instrument.
- **Governed in code:** kill and scale criteria plus a TARGET_BASIS entry.
- **Smooth:** 2 consecutive colony ticks with no blocker.
- **Verified by Fable.**

"Running" is not "live": a channel is live only when money lands in the ledger.

**Moving on:** the loop starts the next channel when the current one is verified running, when it waits on the owner with its launch preparation complete, when it waits on a dated read that is in the calendar, or when it is killed and recorded. Waiting never holds the loop. The BBU cap keeps built but unseen products from piling up.

**Never:**
- a variant of an existing store counted as a new channel;
- an account farm;
- a per-item owner action;
- an account opened in the owner's name;
- a subscription or any spend beyond the one-off ₪200.

**Added 28.9 (breadth board Q7):** never a listing beyond a cap that is not in code (BUILD-11). Once step 8 exists, the probe step also reads the brand mailbox (unread count; an accessibility mail unanswered for more than 7 days is a blocker).

**Continuous mode (owner, 28.9.2026: "תמיד תמשיך... לא לעצור"):** a tick ends by starting the next owner-free item, never by
waiting for the routine. When every open item waits on a background run, the tick arms a `send_later` continuation (~60
min) before it ends; the 6-hourly routine is the heartbeat for a lost session. Each continuation counts as a tick for the
caps in §2 (so one render dispatch per continuation). When the candidate queue thins, the loop's next item is replenishing
it (verifying second-tier venues from `research/breadth/`), not stopping.

## 2. Caps and counts

| Cap | Now | Members |
|---|---|---|
| Built-but-unlaunched ≤ 6 | **6/6 — binding** | apify-il-open-data, il-biz-tools, pcn874, mcp-il-tools, T1 web page, T1 video |
| Experiments measuring ≤ 3 | 1/3 | faceless-youtube (in code, not yet measuring anything public) |
| Builds in flight ≤ 1 | 0/1 | none |
| Render dispatches this tick ≤ 1 | 0/1 | none |

Because the BBU cap binds, **no new product whose launch needs an owner step starts** until something launches. The loop's work is launch preparation, ₪0 tests, instruments and maintenance.

**Listing packs (breadth board Q4, 28.9):** an admitted engine's listing pack is ONE BBU slot, with at most 5 items built before its owner step; ₪0 tests, counters and scans stay outside the cap.

## 3. Channel table

Stages run in this order:

1. candidate
2. testing
3. admitted
4. building
5. launch-ready
6. parked-owner or parked-window
7. running-claimed
8. running
9. live, or killed at any point

| Channel | Stage | Rail / ledger path | Owner steps it waits on | Next action (loop) | Unpark when |
|---|---|---|---|---|---|
| apify-actors (Actor over data.gov.il, free) | parked-owner | Apify, `observable:false`; declared a ₪0 instrument | 6a (Apify sign-up + `APIFY_TOKEN`) | pre-write the "Publish" message; check on main that the publish job creates the Actor as private. Breadth board Q5: the stranger-runs KPI is labelled biased-low while unverified (Apify's Store API hides non-KYC developers by default); the Store-API pair and the apify-docs KYC read come before the Publish click; identity verification is pulled to the Publish sitting only if document-only. **Tick 5 reading (`research/measurements/apify-visibility.md`):** default Store search hides 64 of 474 Actors (13.5%); all rental and 8 of 9 FREE Actors are hidden, so our FREE unverified Actor would be near-invisible; Apify's own docs describe KYC as document-only (legal name + ID photo), which meets the Q5 condition for asking verification at the Publish sitting | secret present, so the publish job stops being a no-op |
| il-biz-tools (Hebrew business tools) | launch-ready except one gap | Gumroad connector wired (`colony.yml`) | deploy route: ask 1 (network) or the Netlify click in 6b | Done in tick 1: `_site` ships only files that shipped pages load; the accessibility statement is in; the Facebook/WhatsApp line is gone (364 tests). **The publish gate blocks until a brand-owned accessibility contact exists (proposed step 8, brand mailbox).** | the network allowlist is widened AND a brand contact exists |
| pcn874 (VAT detailed-report file) | **free validator page built, merged 28.9 (tick 6, `a91d45e`)**; launches with il-biz-tools | Gumroad (same account) | none for the free page; 2, 3, 6b, 5 for the paid builder | `il-biz-tools/pcn874.html`: reads the file in the browser, uploads nothing, checks structure only (Appendix A; a representatives' file is named as unsupported), refuses files over 25 MB, tells a non-UTF-8 or BOM file apart; the validator is bundled from pcn874's own source and a test proves the copy matches. 447 il-biz-tools + 327 pcn874 tests. Two reviewers found 3 HIGH honesty defects (a warning that would have flipped a credit's sign, an acceptance claim, the representatives' file), all fixed. **The page-view KPI is not wired:** the counter is off and nothing reads it, so the "under 100 views a week" kill must not run until it is. | rides the il-biz-tools deploy (same blocker: the accessibility contact, step 8) |
| oss-bounties (Algora) | parked-window (instrument fault: week 1 struck, counter being fixed; the 4-week clock restarts at the first corrected run) | Algora → Stripe Connect Express. Algora's code lists Israel for Express (code grade); the gap is its silent US-country fallback, caught by step 4b's stop rule (`RULING-2026-09-28-bounty-rail.md` §2, §3.5) | 4b held (corrected week-4 mean ≥ 3 AND a held reward); step 7 creates `BRAND_GITHUB_TOKEN`; 4a dropped by the breadth board | The counter fix (policy reads visible text only, `not-a-payer`, `claimableFresh365`) is being applied (workflow `apply-rulings-28-9`); corrected week 1 read 28.9 09:25 UTC: **18 claimable, only 1 created in the last 365 days** (`research/measurements/algora-supply.md`) | the corrected week-4 mean AND, for 4b, a reward held as a credit |
| mcp-il-tools (free MCP server) | building (preparation), then parked-owner | none, a ₪0 channel test | proposed step 9 (npm), 5, 7 | Tick 4: both defects fixed test-first (`aca0900`: npx symlink start guard; `hebrew_date` in every timezone, ICU-checked 1900-2100); 19/19. Next: `mcp-publish.yml` gated on `NPM_TOKEN` | npm yes plus token **Tick 7 (`ebbfce0`): publishable by one reviewed dispatch after steps 7 and 9, nothing published.** `.github/workflows/mcp-il-tools-publish.yml` is dispatch-only; a real run needs `main`, the owner `mehudak` exactly, the approved `npm-publish` environment and `npm whoami` = `mehudak`; registry name `io.github.mehudak/il-tools` (valid against the registry's own validator, v1.8.1; the old 167-character description would have been rejected); `mcp-publisher` pinned by tag and sha256; README written for the npm page (status moved to `MAINTAINING.md`); 91 workflow tests. The domain (step 5) is no longer needed for the listing. |
| T1 web arm (faceless-YouTube experiment) | launch-ready but for a counter key | ₪0 experiment | deploy route (ask 1) + a PostHog project named after the brand, with 'Discard client IP data' on and GeoIP off | Tick 2: `page.py` has an optional anonymous counter, off by default and byte-identical (132 tests). Next: create the PostHog project through the attached connector, pre-register the reach floor, choose the sub-brand name. | deploy route open; day 56 counts from that deploy |
| T1 video | held by protocol | ₪0 experiment | Stage A, only after the day-56 web read | none | web arm passes at day 56 |

## 4. Ranked queue (candidates not yet channels)

The full reasoning for each is in `BOARD-LOOP.md`. The ₪0 test runs first and writes to `research/measurements/`.

| # | Candidate | ₪0 test | Status |
|---|---|---|---|
| 6 | CrazyGames Basic Launch: original HTML5 games under the brand | render the FAQ, payouts, terms, requirements pages → `crazygames.md` | **NEEDS_MORE** after tick 4. The requirements pages hold no AI or automation rule and name no upload API (portal only); Basic Launch: ≤50MB initial download, PEGI12, no external ads, SDK optional. Open: may a runner operate the portal (one written question from the brand mailbox, step 8), the Basic Launch metrics and gameplay pages (ZERO-TESTS rows 26-27), Israel payability (Tipalti). Breadth board: **Tipalti first** — the payees FAQ render gates step 10 (developer account plus Tipalti onboarding, before any submission). **Tick 5:** the kill row's benchmarks are now RENDERED and match (10+ min, 10-15% D1, 80%+ conversion, `crazygames-basic-launch-metrics.txt:216,234,252`), framed as what successful games reach, not pass lines; Basic Launch ends at 7 days AND 500 plays, or 21 days (`:199`), plays not players (corrects BOARD-LOOP:124's "≥500 real players"); no clone, AI or upload-API rule on the gameplay page; Tipalti's payees FAQ refused (403), so step 10 stays gated. Still NEEDS_MORE; the written question via step 8 is the next check. |
| 7 | Paid Astro themes in Astro's Theme Catalogue, sold on Gumroad | render https://portal.astro.build/api/themes?price[]=paid and the unfiltered listing → read the ordering | returned 27.9: **NEEDS_MORE**. 638 paid themes; no stars or installs field; ordered by `updatedAt` within runs. **29.9 GitHub read (`astro-themes.md`): NEEDS_MORE, leaning a G3/G6 fail.** Submission is a portal web form behind GitHub sign-in with human review (`withastro/astro.build` `submit/index.astro:2`); a paid theme's Buy button can point to Gumroad (G2 via Gumroad); no AI rule; featured slots are paid sponsors (out under ₪0). No colony product is a theme; the honest candidate is a Hebrew RTL theme (0 of 638 paid themes mention Hebrew), 30-45 agent-hours. Pre-set kill: the form is the only route, or each theme needs something only a person can give. Next: rows 150-152. **Tick 15 (rows 150-152): KILL-PROPOSED on G3/G6.** The submit page is only "Sign in with GitHub" (`astro-portal-themes-submit.txt:9,11`) and every fix is a portal re-save (guidelines, `astro-themes-guidelines-hackmd.txt`); nothing per theme needs a person beyond that login, AI is allowed ("Machine/AI translations are OK!"), Gumroad is named for paid themes. So it stands or falls with the portal ruling, FABLE_QUEUE row 14 (e2): whether a runner may log in to a brand GitHub account and submit. |
| 8 | Mozilla Client Bug Bounty via Bugzilla REST | a 30-day private dry run, nothing filed; render the bounty page and the Bugzilla account policy | not run; stop if a private repo's Actions minutes would cost money |
| 9 | Polar.sh as a second merchant-of-record rail (rail research, not a channel) | render Stripe's and Polar's pages | **FAILS_TEST (killed 28.9)**: Polar's own account-reviews doc requires an ID "along with a selfie" through Stripe Identity (read from its public repo); the owner forbids a camera step. Fees would have passed (5% + 50¢, nothing up front). Reopens only if Polar documents owner verification without a selfie (`polar-rail.md`). |
| 11 | Wix App Market app for Israeli compliance | render the FAQ, payout-account page, agreement body, payouts dashboard | **NEEDS_MORE** after tick 4. The agreement: the $200 floor rolls over with no expiry; forfeiture only for breach; only comprehensively sanctioned territories barred (Israel not among them); individuals may partner; USD by wire against a tax invoice; no support SLA or AI clause. New ₪0 risks: a third-party security test before submission and a documented multi-developer review (ZERO-TESTS row 28). Israel still turns on the Tipalti form. Breadth board adds the Tipalti US-ROW coverage page, the App Market guidelines and the company-info page (Batch B); the per-payout tax invoice is settled after step 2. **Tick 5:** the security best-practice page is advice only (self-test at `:160`; no tester, tool, artefact or submission named), so no free route to the agreement's third-party test is shown; the agreement also wants SANS top-25 testing (:183) and a recurring assessment (:189). Tipalti refused. Still NEEDS_MORE; Batch B row 57 (App Market guidelines) next. **Tick 6:** the guidelines add no kill: Wix runs its own review (an automated AI review plus a team) and asks for a demo account, not a security report; the listing's company fields (logo, a 23-character company name, address, website) take the brand, not a personal name; support needs a monitored email and no clock; no AI rules; no price anywhere. But Wix's own review cannot stand in for the agreement's third-party test (`:185`), and the agreement prevails (`guidelines:106`). Tipalti 403 a second time. Still NEEDS_MORE; next check row 65 (the security-and-privacy submission step). **Tick 7:** the submission step asks self-declared data-security answers with an accuracy checkbox; no tester, tool, upload or fee is named; the full form sits behind a developer account. Still NEEDS_MORE; next row 100 (the submit-your-first-version page), then the step-8 written question. **Tick 8: docs exhausted, parked on step 8.** The submit page (updated 28.7.2026, after the June agreement) never asks for the third-party test or evidence of it, and Wix's own review checklist on GitHub (78 items, 16 security) has no such item; no fee, call, video or ID step. The drafted step-8 question to the developer-support address decides it; Israel-as-payee follows only after a yes. |
| 12 | Topcoder auto-scored challenges | fetch https://api.topcoder.com/v6/challenges?status=ACTIVE and the member terms / AI policy | returned 27.9: **NEEDS_MORE, leaning FAILS_TEST**. There was one active challenge; it is human-reviewed Development, and none are auto-scored (`topcoder.md`). **29.9 GitHub read: KILL-PROPOSED on G2, pending one render.** Auto-scored Marathon Matches do exist (github: an active MM type and a v6 scorer), so "none are auto-scored" is withdrawn; but every withdrawal requires identity verification through Trolley, whose help pages (snippet) describe a live selfie. Next: rows 147-149; if row 147 shows the selfie, the kill stands for the sitting. **Tick 15: UNSETTLED.** Trolley's help articles are an empty Salesforce JavaScript shell the runner can never render (`trolley-identity-verification.txt:4`), no GitHub mirror exists, and the terms page returned 404. The kill stays proposed at snippet grade; it can be settled only by a written question at step 8 or a JavaScript-capable render. |
| — | **Bituach Leumi cost of step 2** (not a channel: the ₪0 rule's check before the owner is asked) | render https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx, https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx and https://www.kolzchut.org.il/he/%D7%93%D7%9E%D7%99_%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%9C%D7%90%D7%95%D7%9E%D7%99_%D7%9C%D7%A9%D7%9B%D7%99%D7%A8_%D7%A2%D7%9D_%D7%9E%D7%A7%D7%95%D7%A8%D7%95%D7%AA_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D → `research/measurements/step2-cost.md` | tick 1 dispatch |
| 13 | AI-allowed prize-event intake (instrument only) | weekly read of https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json | **list-count half built 29.9** (merge `9c0204c`: a weekly ₪0 job writing numbers only to `state/colony/prize-intake.json`; first live read: 30 open of 397, 24 with a stated USD prize). The list has no AI-rule field, so the AI-allowed count stays null; the rules-page read (BOARD-LOOP §13) is not built. |
| 14 | HTML5 syndication (GameMonetize, GameDistribution, ~~Playgama~~ (killed by the breadth board: submission stays a human action, `docs/REJECTED.md:1284`), **Y8**) | renders allowed now (ZERO-TESTS rows 80-87: Y8 revshare, studios, SDK, new-games lane; GameDistribution terms, guidelines, payment, partnership); **admission only after a game passes CrazyGames Basic Launch** (`BOARD-LOOP.md:178`) | waiting for a game. **Replenish pass (28.9, tick 6):** GameDistribution and Y8 are QUEUE-worthy (G5 PASS at github grade: `he.y8.com` in the Israel CrUX top 5,000-10,000; GameDistribution's embed host at 50,000). GameDistribution's FAQ makes each game's activation a dashboard ad-watch plus a publish request (the `BOARD-LOOP.md:183` question, to be ruled once for all three networks); Y8's likely killer is G2 (the owner's own AdSense account, or manual invoices per payout). Proposed kills in `research/breadth/REPLENISH-2026-09-28.md` §3.3-3.4. **Tick 7** (`research/measurements/html5-syndication.md`): **Y8** pays 50% by PayPal ($100 minimum) or bank ($500) only against "a valid invoice" from us each time, which meets proposed kill (a) as worded (for the 29.9 sitting); AI tools allowed, "mass-generated games" may be rejected; non-exclusive; studio name, no company needed. **GameDistribution** confirms a publish request per game and a review of up to a week (the `:183` question); 33% share, credit invoice issued by them, EUR 100 minimum; a "no monitoring" clause bars our watchers from polling a live game there. Next rows 101-102. |
| 15 | Superteam Earn agent bounties (`type=bounty` only) | T1 weekly CI count of agent-eligible dev bounties (one brand agent registration, no submissions); T2 render FAQ/terms/agents page; T3 read the submission schema from SuperteamDAO/earn; T4 render the onboarding of an Israeli crypto off-ramp for the camera question | **admissible in principle, admitted to nothing** (`RULING-2026-09-28-bounty-rail.md` §6); USDC receipts would book at ILS value on receipt with the tx hash, flagged `unconverted`. Tests T1-T4 dispatched as ZERO-TESTS rows by `apply-rulings-28-9`; admission is row 12's call. Breadth board: T2 also reads `terms-of-use.pdf`; T4 adds the SOL-gas / Privy question; a legal name shown publicly on the talent profile keeps the kill unless T2/T3 show a brand display option (Q6). **Tick 5 (T2 read in full, `research/measurements/superteam-earn.md`):** KYC only for Superteam/Solana-sponsored listings (`superteam-earn-faq.txt:55`), which T1 filters out; external sponsors pay the account's wallet, KYC only occasionally (`:57`); agents do no KYC, a human claims (`superteam-earn-agents.txt:187`); no country bar beyond the terms' sanctions clause; no fee named. Whether a claimed win shows a legal name is UNKNOWN (wins are public, `faq:99`; profile fields unlisted), so the §6.5 kill neither fires nor lifts. NEEDS_MORE; next is T3, a code read of `SuperteamDAO/earn` (profile page, winners component). **T3 (28.9, tick 5, code read of `SuperteamDAO/earn` @ c25c4f8): FAILS_TEST — the §6.5 name kill FIRES.** First and last name are required (`src/features/talent/schema/index.ts:37-44`), a claim moves the win to the human (`src/pages/api/agents/claim.ts:100-108`), and the winner card, leaderboard, feed and share image print `firstName lastName` (`ListingWinners.tsx:156-157`); the only privacy control adds `noindex` and still prints the name. No display-name option. **Killed under the board's Q6 pre-decision; reopens only if the owner accepts their name beside wins, or a sitting rules the brand may fill the name fields** (the platform itself fills them with a label for agents, `agents/index.ts:92-93`). Also from code: KYC only on Superteam-chapter-funded listings (Sumsub; level from an unset env var); agents skip the region check; the platform pays gas, so T4's SOL question is closed (rows 29-32 close with this). |
| 16 | Firefox Add-ons (AMO) + Gumroad Pro licence | render the four AMO URLs; before admission name one Pro feature that is free nowhere | **FAILS_TEST on G4 (28.9, tick 5):** no Pro feature can be named that is free nowhere — 24 free RTL fixers on page 1, Hebrew utilities at 1-85 daily users, il-biz-tools' receipt branding merely absent from 50 results (`research/measurements/firefox-amo.md`). The policies themselves pass (no fee, paid features allowed with disclosure `amo-add-on-policies.txt:2051`, machine-generated code allowed with source `:2069`, display-name accounts). Newest-50 cohort: median 0 daily users, a day-0 reading. **Not admitted; one reopen check queued (ZERO-TESTS row 62, an 'invoice' search); kill or park at the next sitting.** **Tick 6: the reopen check confirms G4.** Logo branding is free in at least four AMO invoice add-ons; the nine general invoice makers have a median of 1 daily user and a maximum of 20; the closest match to our plan (offline, logo free, one-time paid tier) has 0 users after 29 days. No Hebrew or Israeli invoice add-on exists among the 50. **Reader's recommendation: KILL at the 29.9 sitting** (`firefox-amo.md`, Tick 6). |
| 17 | Spreadshirt (single account) | render the six Spreadshirt URLs and DSA Arts 30-31; one written question on automated uploads from the step-8 mailbox | **Unread — route refused (28.9, tick 5):** all six pages 403/406 to the runner, EUR-Lex a 202 shell (`research/measurements/spreadshirt.md`). NEEDS_MORE; fallbacks: a GitHub mirror, a different Accept header for the 406, or the step-8 question. **Tick 7:** the only readable host gives a 2018 rule of 50 designs a day, a ban on stock art unless reworked, and nothing on automation, AI, fees or eligibility; the API page is 406 again. NEEDS_MORE; next row 99 (Spreadshop legal information), then the step-8 question. **Tick 8: parked on step 8.** The legal page is an imprint only; it names the contracting entity by region (North America/Oceania vs Europe; Israel in neither) and a contact address, which the step-8 question should now use. KILL-4 remains untested. |
| 18 | Google Play Books Partner Center | render table 6052428 and answers 3250840, 4490848 (Batch B); Israel absent from the payment-country list → dead | **KILLED 28.9 (tick 6), pre-registered:** Israel is absent from every column of the 75-row supported-countries table (seller sign-ups, purchases, payments; not even the USD-wire route Jordan and Lebanon get). "Israel" occurs 0 times in the text and the HTML (`research/measurements/google-play-books.md`). Reopens only if Google adds Israel; render-watch records any new version of the table. |
| 19 | Pebble appstore + KiezelPay | render the KiezelPay FAQ and `apps.repebble.com/faces` (Batch A); pre-registered kill: no Pebble onboarding in 2026 or any fee → dead | **FAILS_TEST — killed 28.9 (tick 5), the pre-registered kill fired on clause 1:** KiezelPay's FAQ has no date after 2016 and no Pebble onboarding (`kiezelpay-faq.txt:221,229-231`); the store is alive (Spring 2026 contest) but has no documented payout route (`research/measurements/pebble-kiezelpay.md`; `docs/REJECTED.md`). |
| 20 | n8n paid templates (second tier, render only) | render the templates API and the creators page; read the Creator Hub's AI rule and paid-unlock condition | **NEEDS_MORE (28.9, tick 5):** 12,574 templates; 0 of the first 100 priced (`price` 0 or missing, `purchaseUrl` null on all); ordering is a server-side score, not any response field; the creators page states no AI, payout or submission rule and offers only non-monetary benefits (`research/measurements/n8n-templates.md`). Next: the Creator Hub document (ZERO-TESTS row 60). **Tick 6:** the Notion Creator Hub is a JavaScript shell that plain GET renders can never read; the GitHub docs stub (three sentences, carried through 24.7.2026) says the marketplace is "an ongoing project" and states no paid-template, fee, identity or AI rule. Still NEEDS_MORE; next check row 67 (the verified-creator thread). **Tick 7:** pricing a template needs verified-creator status, and a non-staff 2025 post says verification follows about three free templates; no fee, payout, identity or template AI rule is stated. NEEDS_MORE; next row 104. **Tick 9: forum exhausted, parked.** The one n8n-staff reply is a one-line "submit → verified → profit" pointing to the unrenderable Notion hub (dated 10.6.2025, before the policy change); no rule on brand or AI-operated accounts. Next is the held question through n8n's contact form, which needs a browser session (not the mail script); the question's current wording, which does not assume the unlock condition, stands. |
| 21 | PayPal Israel receiving (rail research, not a channel) | render the recorded PayPal IL URLs; a selfie or liveness step kills the PayPal leg of Pebble, Spreadshirt and GameMonetize together | **NEEDS_MORE (28.9, tick 5):** withdrawal to an Israeli bank in ILS only (`paypal-il-user-agreement-mpp.txt:338,344-346`); verification names ID documents (:1198) and no selfie, liveness or video step, but links no verification article, so the camera question is unknown, not excluded; a personal account may receive payments for goods (:229); new-seller holds up to 30 days (:863,873); the bank-account name must be in English (`paypal-il-link-bank.txt:13`). Q3 condition (i) not yet met. Next: the help index (row 59). **Tick 6:** the help index names no sign-up verification article; the only identity article is HELP534 (restoring a limited account, "upload proof of identity"), camera unknown. Still NEEDS_MORE; next check row 66. **Tick 7: PASS_TEST on the camera gate (board Q3 condition (i)), for the board to confirm:** HELP534 names proof of identity as an uploaded copy of a driving licence or ID card through the Message Center; no selfie, liveness, video or photo step is named in the page or its 328 KB HTML, and the user agreement and help index agree. Conditions (ii) and (iii) still hold step 13. One confirmatory render queued (row 103; it can only kill). |
| 22 | Indiebook (אינדיבוק), a Hebrew ebook store with a self-publishing category | render the homepage (terms from its footer), the royalty-report guide and the self-publishing category (ZERO-TESTS rows 68-70); before admission name one Hebrew title and what it gives that is not already free | queued 28.9 (replenish pass, tick 6). G5 PASS at github grade: `indiebook.co.il` in the Israel CrUX top 5,000 (Jan-Nov 2025) and 10,000 (Dec 2025-Aug 2026). G1-G4, G6, G7 unknown. Proposed kills: any listing fee or paid package; payout needs a camera or cannot reach an Israeli individual; the terms bar AI-written books or print the author's legal name with no pen-name option; per-title web forms with automated access forbidden (`REPLENISH-2026-09-28.md` §3.1). No title is identified yet. **Tick 7 (`research/measurements/indiebook.md`): NEEDS_MORE, promising.** G2 passes: quarterly royalty against an invoice or payment demand, paid by Israeli bank transfer, an עוסק פטור explicitly accepted, no camera step named. G7 leans pass: pen-name and blank author labels appear. G5: 8 of 51 homepage titles are self-published, 3 of them on the bestseller shelf. Unknown: any fee, the share, how titles are submitted, AI. **A recurring step:** four invoices a year, which is owner work unless the colony can issue them after step 2 (for the sitting). Next rows 96-97. **Tick 8: NEEDS_MORE, parked on step 8.** The author page is a form link and an email only; the terms are buyer terms. No kill fires: no author fee is named; the robots clause bars data collection, not submission; no AI or author-name rule. **The store is the merchant of record** (it issues every buyer's tax invoice, `indiebook-terms.txt:127`) and sets prices. Nothing left to render (the title list is the store's property and robots are barred, so `seoReport.csv` is dropped). The rest (author cost and share, AI, the brand as the only author label, exclusivity, email-only contact) goes in one written question to the store's office address from the brand mailbox, drafted in `research/measurements/indiebook.md` (Tick 8), to join the step-8 send list when the mail tooling merges. The quarterly payment demand remains the sitting's question (FABLE_QUEUE row 14 (h)). |
| 23 | Facer creator marketplace (Wear OS and Galaxy Watch faces) | render the nine URLs, terms first (ZERO-TESTS rows 71-79) | queued 28.9 (replenish pass, tick 6). G5 PASS ("over $1 million" to 75+ designers, snippet; the Wear OS 6 route to Galaxy Watch 8, github). Likely killed by its render: no upload API found, and paid sales open only after 5,000 syncs plus an invite-only tier. Proposed kills: face creation only by hand in the web editor; payout excludes Israel or needs a camera; any creator fee; AI designs banned or undeclarable (§3.2). **Tick 7 (`research/measurements/facer.md`): NEEDS_MORE, leaning G3 fail** (a forum member: the Facer Creator editor "is the only way"); terms and partner pages are JavaScript shells; payouts reach $1M but only through an invite-only programme; the replenish note's "5,000 syncs" is in no capture (2017 bar: 3,000 in 30 days). Next row 98 (the app's template cache), else the step-8 question. **Tick 8: proposed kill (a) met — recorded in `REJECTED.md` for the sitting to confirm.** The template cache holds the full Terms: reaching the Services through any agent or tool other than Facer's software or an ordinary browser is barred; one web form per face; `.face` import admin-only; no API. G1 passes (basic use free; Pro free for partners); G2, G4, G7 unknown. Weakness: standard anti-scraping wording. Reopens on an upload API or a written yes to an agent operating Facer Creator. |
| 24 | StreetLib (commission-only ebook aggregator: Apple, Google Play, Kobo) | render ZERO-TESTS rows 109-116, terms first | queued 28.9 (second refill, tick 9). G1 passes at snippet grade (no up-front fee, 10% per sale); G5 passes (it reaches Apple and Kobo); its BILL API names PayPal. Proposed kills: (a) any distribution plan, subscription or per-title fee; (b) the payout cannot reach an Israeli individual by PayPal or bank, or needs a camera step; (c) the content policy bars declared AI books or demands human editing; (d) every title is a web form and the terms forbid automated access (if silent, it parks on a step-8 question). It meets part of the reopen trigger of the Apple aggregator kill. No product fits yet (`research/breadth/REPLENISH-2026-09-28-2.md` §3.1). **Tick 9 (`research/measurements/streetlib.md`): NEEDS_MORE.** Kill (c) ruled out: only undeclared or low-quality AI books are blocked (`421.txt:87`). Kill (a) open and leaning to fire: the March-2026 earnings page offers "Subscription and Lifetime Access" options at 85% royalty, price unrendered; the Jan-2025 policy said no up-front costs. Payout unread; titles go in through a dashboard form. **New risk for the sitting:** the author field must be "Surname, Name" and bookstores may refuse nicknames, so the brand alone may not fit. Apple is not named in any capture. **Row 129 read: still NEEDS_MORE.** The FAQ covers the February-2024 BookRix move, not the 2026 plans; the old pointer to it was a header menu item, not a link from the earnings text. New: every help page's footer names a "Lifetime Pro Plan" (`streetlib-faq-platform-changeover.html:395-396`). Kill (a) leans a little more toward firing, but no price and no "required" is rendered; the payout words have 0 hits. Next: rows 132 (plans and prices) and 133 (payments category). **Tick 10 (rows 132-133): still NEEDS_MORE.** Row 132 is an empty JavaScript shell, byte-identical to the streetlib.com captures (`streetlib-it-prezzi-servizi.html:28`): no marketing page renders on the runner, so no price can be read there. Row 133 lists nine payout article titles (`help-streetlib-com-category-97-payments.html:1658-1674`) with no text; kills (a), (b), (d) UNSETTLED. Next: rows 136-139 (getting paid, billing profile, tax interview, account category). **Tick 11 (rows 136-139): NEEDS_MORE; kill (a) now decides the row.** The payout half of (b) does not fire: outside the USA and Canada payment is "bank transfer or Paypal" (`help-streetlib-com-article-699-billing-profile.txt:87`), PayPal from €30 less 2% (capped €12), bank from €200, 60 days after an invoice the account holder approves in the dashboard (at most one a month, `670.txt:61,63,75`). The W-8BEN is signed digitally (`433.txt:63`); no camera step seen. (a) is still unpriced. Next: rows 141-143 (capabilities, onboarding, distribution agreement); if 141 is silent on fees, the held fee question goes at step 8. **Tick 12 (rows 141-143): NEEDS_MORE.** "Create your account for free" (`help-streetlib-com-article-706-what-you-can-do.txt:61`) with no plan step before a sale, but the article is partly stale and the footer still lists "Lifetime Pro Plan", so (a) stays UNSETTLED (leaning less toward firing). Onboarding is profile, PayPal email, billing profile, agreement, with no ID, photo or video (`700.txt:57-73`): (b) does not fire. Titles go in only by Hub upload (706.txt:73, :127): (d) parks. Apple is named for the first time (706.txt:129), so G5 passes at rendered grade. Correction: kills (a)-(e) were proposed by the refill, not board-registered (`REPLENISH-2026-09-28-2.md:217-218`). Next: row 144 (the Hub agreement PDF) decides whether the fee question is still needed; then it joins the step-8 list as venue 8 (to `support@streetlib.de`, the only captured address, `706.html:612`). **Tick 13 (rows 144-146): KILL-PROPOSED on G1 (rendered).** International authors "are subject to our membership plans", $99/year or $299 one-time, for accounts opened from 17.3.2026 (`help-streetlib-com-article-425-account.txt:69,73,85,99`); the 2025 agreement's "No activation price" was superseded under its change clause. Recorded in `docs/REJECTED.md` for the sitting (FABLE_QUEUE row 14 (f), now nineteen). (b), (c), (e) do not fire (real name never public, pen names supported, `425.txt:63`). The fee question is answered: StreetLib does NOT join the step-8 list. |
| 25 | Zazzle (designer store; the Create-a-Product API) | render rows 117-121 | queued 28.9 (second refill). G5 passes (CrUX global top 10,000 in every month); AI work must carry the #generativecontent tag. Its two routes never meet: the CAP API needs no per-item click but its products live only behind our own link (no Zazzle buyers); store products bring buyers but have no write API. Proposed kills: (a) the terms bar automated store creation and CAP products can never enter the marketplace; (b) the payout excludes Israel or needs a camera step; (c) any creator fee; (d) the store shows the legal name (§3.2). **Tick 9 (`research/measurements/wall-art-pod.md`): route refused (all five pages 403); parked.** The step-8 question is drafted (may a creator publish marketplace products through an automated process?), but no capture holds a Zazzle address, and the mailbox sends only to captured addresses. |
| 26 | Displate (metal posters; a portfolio review) | render rows 122-123 | queued 28.9 (second refill). G5 passes (global and Israel top 50,000 in every month); the AI evidence conflicts. Proposed kills: (a) AI-generated art barred (the Modrinth precedent); (b) the review requires a named human artist; (c) the payout excludes Israel or needs a camera step; (d) manual upload only and automation forbidden (§3.3). **Tick 9: NEEDS_MORE, promising.** No kill fires: joining is free with no portfolio review (kill (b) contradicted, `displate-com-about-faq.txt:1048-1050`); no AI ban (AI only bars the Verified Creator badge, `:1207-1208`); fixed $4.50/$9.00/$14.50 per sale; PayPal only from $50 (kill (c) not met); a recognisable pseudonym accepted. Uploads by web button, no API; whether automation is forbidden sits in Terms 3.2-3.3. The shop's login email can never change, so it must open on the brand mailbox. **Row 131 read (Terms 3.2-3.3, `displate-about-regulations.txt:211-233`): still promising.** No AI rule for artists (AI appears only in the buyers' Custom Displates feature, `:166`); PayPal plus a tax form, identity by SMS code, no camera step (`:277-279`, `:455`), so kills (a)-(c) do not fire. Kill (d) UNSETTLED: no general automation ban, but accounts "created using automated tools (e.g., bots)" can be deleted (`:471`) and site-distorting software is barred (`:561`). Buyers contract with Displate; the artist shows a nickname only (`:138`, `:447`). **For the sitting:** an artist must be a business, "not a consumer" (`:98`), which ties Displate to step 2; the SMS code is a one-time owner step. A written question to the artists' address (drafted in `wall-art-pod.md`) settles (d). Next: row 134 (privacy policy). **Tick 10 (row 134): still promising.** An artist gives name, email, picture and phone, all voluntary (`displate-com-about-privacy.txt:103-107`); accounts are private by default and the holder chooses what is public (`:123`), so proposed kill (e) does not fire and G7 improves; (d) stays UNSETTLED, so the drafted question to the artists' address should go at step 8. The collapsed per-purpose sections (e.g. "Financial settlement", `:218`) are empty in the capture. Next: row 140 (the script chunk that may hold them). **Tick 11 (row 140): still promising; G7 passes at rendered grade.** The chunk holds the collapsed sections: a public profile shows only what the holder selects ("nickname, avatar, and your work"), first and last name are voluntary, no payout-country rule, 0 hits for Israel. (d) automation stays UNSETTLED, which the drafted question to the artists' address settles at step 8. Nothing left to render but the sign-up page. |
| 27 | Society6 (curated since 18.3.2025) | render rows 124-125 | queued 28.9 (second refill). G1 passes (artist plans ended 2025); G5 passes in Israel, but global traffic fell a bucket after curation began. Proposed kills: (a) admission closed to new or AI-declared artists; (b) the terms bar AI work; (c) the payout excludes Israel or needs a camera step; (d) per-design approval only by web form with automation forbidden (§3.4). **Tick 9: both help URLs 404; parked.** The admission question is drafted, but no capture holds a Society6 address or help index. |
| 28 | Teach Simple (English teacher-materials subscription pool) | render row 130 (terms of use) | queued 28.9 (tick 9, `research/measurements/teacher-and-ebook-stores.md`). **G3 passes at rendered grade:** the platform's own team uploads contributors' products for free; no fee; PayPal monthly from $50. G5 leans fail (a subscription pool paying by points used; little traffic); items must be the contributor's original creations, a risk for purely AI output; public credit uses the profile name. Admission by application. Payout reaches ~13 months after an annual sale. **Row 130 read: QUEUE-ON.** The Terms of Use are generic shop terms (`teachsimple-terms-of-service.txt:267`); none of the three cheap kills fires (only a scrape ban on the site, `:363`; a case-by-case right to limit sales, `:313`; no AI rule). All three were PROPOSED, not pre-registered. A written question to the support address (drafted in `teacher-and-ebook-stores.md`) asks about the ongoing upload service and payment to Israel. Next: row 135 (licence agreement; it can only kill). **Tick 10 (row 135): QUEUE-ON, unchanged.** It is the subscribers' download licence (`teachsimple-com-license-agreement.txt:274`), not the contributor "Membership Agreement" (0 hits); no AI, automation or US-only clause. The drafted question's pre-send condition is met: it goes at step 8. |

(Ranks 1-5 and 10 are the existing channels in §3.) Rejected from the queue, with reasons, in `BOARD-LOOP.md`:
- Higgsfield hosting;
- x402 as a channel;
- the Telegram bot;
- Devpost;
- registrar-reminder as a separate channel;
- Poki;
- portal licences;
- WordPress bounties;
- a second Actor, or more calculators, as "new channels" (constraint 6);
- **ArrangeMe (sheet music): deferred, not queued** (breadth board Q1: reopens on a render of its terms allowing automated access and AI-made arrangements AND an occupancy count showing ≥20 honest cells with sales history and no free equivalent).

## 5. Measurement calendar

No read is dated yet, because every clock starts with an owner action:
- **Algora supply:** week 1 (27.9) struck as an instrument fault; weeks 1-4 restart at the first corrected run after the counter fix lands on main (expected read late October 2026).
- **Superteam Earn T1:** weeks 1-4 from its first CI count.
- **il-biz-tools:** measuring from its public deploy (D0): 2 weekly KPI writes by D0+21, reach read at D0+56 (<5 stranger page views → paused at ₪0 until the domain), first Gumroad sale → live (floors ruling, Row 9).
- **Apify stranger users:** day 30 from the Publish click.
- **il-biz-tools and pcn874 page views:** 8 weeks, and revenue at 90 days, from the domain deploy.
- **T1 web arm:** day 56 from its public deploy plus a recorded discovery submission; fewer than 5 engaged stranger page views → Stage A is never asked (PREREG §3).
- **K3:** day 112.

## 6. Owner-ask batch (single ordered list, under the ₪0 rule)

**Done 27.9:** "תמזג" plus the standing consent. PR #3 was merged as `61fae4e`.

**Free, no identity (about 30 minutes in all):**
1. **(2 min, a settings change)** Network access for this environment: cloud environment menu → Edit → Network
   access. Add `api.netlify.com`, `netlify-mcp.netlify.app` and `*.netlify.app`. The loop then deploys every static
   surface to free `*.netlify.app` hosting itself. The alternative is the Netlify "Link repository" click in step 6b,
   once per site.
2. **(~10 min) Step 8, the brand mailbox (asked now, breadth board Q2):** a Google account under the brand (it also
   serves YouTube Stage A and Search Console; Play Books no longer, killed 28.9; Outlook.com if Google asks for more than a phone), which the
   agent reads through a connector; CI sends and probes with an app password saved as a secret of the GitHub environment `brand-mailbox` limited to `main` (not a repository secret). The owner never replies to anything in it. **The sender and probe are built (tick 8, `19f63cf`): the hour step 8 is done, five one-question emails can go out (CrazyGames, Wix, Spreadshirt, Indiebook; n8n has a web form only).**
3. **(5 min)** Step 6a: sign up at Apify with the username `mehudak` (the free plan), add the `APIFY_TOKEN` secret,
   then one Publish click when told.
4. **(15-20 min)** Step 7: create the GitHub organisation `mehudak` (Free plan), transfer the repo, re-grant the
   Claude GitHub connector, and create the `mehudak-ci` machine account. This also gives the MCP registry a free
   namespace (`io.github.mehudak`) in place of the domain. The same sitting creates `BRAND_GITHUB_TOKEN`.

**Only when a paid product is ready, and only after its cost is checked:**
4. Step 2, the עוסק פטור file and Bituach Leumi. Before it is asked for, the colony renders what registering costs
   someone in the owner's position (§4 row "Bituach Leumi"). **Answered 28.9: the owner is not salaried.** Opening the file
   then replaces the ₪266 non-working minimum with a ~₪265 self-employed floor, so it adds about ₪0 a month [INFERENCE,
   `step2-cost.md`]. Tick 4 read Bituach Leumi's exempt groups: for anyone liable for the minimum today the file adds ~₪0;
   for some exempt groups up to ~₪265. One optional private yes/no settles it: "Are you exempt from Bituach Leumi
   contributions today?" Asked only with step 2 itself.
5. Step 3, Gumroad. It is free to open, and fees come only out of sales. It needs identity: ID, proof of address and
   an Israeli bank account.

**Frozen by the ₪0 rule:** step 5 (the domain). **A decision still open:** item 8 of the old list. The repo is
public, and its history on main carries the owner's real name and personal email as the merge author. Choose one:
make it private (Actions minutes become metered, possibly a cost) or accept the exposure knowingly.

**Proposed steps, each needing a yes (free):**
- **step 9, npm (free, ~10 min, after step 8 and step 7):** an npm **user** account named `mehudak`, registered with the brand mailbox (never the personal email: npm prints the publisher's name and email on every version, permanently); its token saved as a secret of a GitHub **environment** `npm-publish` limited to `main` with a required reviewer, not as a repository secret (the workflow fails a run if it finds one). The workflow checks `npm whoami` is `mehudak` before publishing. npm stops direct publishing with granular tokens in January 2027, so the first real run should come before then (`products/mcp-il-tools/MAINTAINING.md`).

**Held, not asked:**
- step 4b (the Stripe form, identity), until the corrected week-4 mean is at least 3 AND a first reward is held as a
  credit; three stop rules are printed on it (US country/bank/SSN shown, any camera step, any fee);
- proposed step 12 (Superteam Earn claim: sign-in, talent profile, claim code, wallet address; free), until its
  tests T1-T4 pass and row 12 admits it;
- YouTube Stage A, until the day-56 web read;
- Apify KYC, until 50 stranger users;
- **proposed step 13, PayPal Israel:** only after (i) a render showing no selfie, (ii) an admitted PayPal-paid engine, (iii) step 2;
- **proposed step 14, a Mozilla add-ons account:** after Firefox's tests and its admission;
- **step 10, the CrazyGames developer account plus Tipalti billing onboarding (identity):** after the Tipalti render and a written yes on runner-operated submission;
- **Apify identity verification:** at the Publish sitting only if the read shows no camera (Q5);
- the Wix, Topcoder and Bugzilla accounts, until their ₪0 tests pass (Polar was killed 28.9: selfie).

## 7. Kills and admissions made by the loop

- **28.9, Polar (candidate 9) killed:** its owner verification needs a selfie (`polar-rail.md`, last section).
- **28.9, oss-bounties week 1 struck** (not a kill): an instrument fault, per the bounty ruling §3.
- **28.9, breadth board** (`research/breadth/BOARD.md`): nothing admitted; ArrangeMe deferred, not queued; Pebble carries a pre-registered kill; the sweep's verifier kills confirmed (Apify Store fleet, Gumroad as a buyer source, itch.io, e-vrit, Apify affiliate, PromptBase).
- **28.9 (tick 5), Superteam Earn (candidate 15) killed** by the board's Q6 pre-decision: T3 shows a legal name public beside every win and no display-name option (`superteam-earn.md`).
- **28.9 (tick 5), Firefox Add-ons (candidate 16): FAILS_TEST on G4, not admitted**; one reopen check queued; kill or park is the next sitting's call.
- **28.9 (tick 5), Pebble + KiezelPay (candidate 19) killed:** the pre-registered kill fired on its first clause; no sitting needed (`pebble-kiezelpay.md`).
- **28.9 (tick 9), the second refill** (`research/breadth/REPLENISH-2026-09-28-2.md`, Opus, 19 venues): 4 QUEUE (StreetLib 24, Zazzle 25, Displate 26, Society6 27), 7 new gate refutations recorded in `docs/REJECTED.md` for the sitting (TeePublic, the WordPress.org plugin and theme directories, WooCommerce.com, MCPize, AgenticMarket, MCP Marketplace), Tes upgraded to github grade, Smashwords dead at scout grade, 2 unsettled (Threadless, Teach Simple). **No paid MCP marketplace survives:** the free server's value is reach, not revenue. Renders queued as rows 109-128.
- **28.9 (tick 8):** Facer's proposed kill (a) met on the rendered Terms (for the sitting to confirm); Y8 kill (a) still met; GameDistribution's `:183` lean withdrawn (the activation ad is a fake demo ad), so one portal ruling covers all four HTML5 networks; PayPal's camera-gate PASS survived its confirmatory render; Indiebook parked on the step-8 question.
- **28.9 (tick 7), no kill fired:** Y8 met its proposed kill (a) and GameDistribution leans to `:183`, both for the 29.9 sitting; the Hebrew teacher-site lead closed (no marketplace among four readable sites); Wavedash DEAD on G3 at github grade (its CLI source never writes store-page metadata, so every game needs a portal step; recorded in `REJECTED.md` for the sitting to confirm). **PayPal Israel passed the camera gate** (board to confirm).
- **28.9 (tick 6), the replenish pass** (`research/breadth/REPLENISH-2026-09-28.md`, Opus, 23 second-tier venues): 4 QUEUE (Indiebook row 22, Facer row 23, Y8 and GameDistribution under row 14), 9 new gate refutations recorded in `docs/REJECTED.md` for the next sitting to confirm (Shiur Hofshi, Teachers Pay Teachers, Fitbit Gallery, Nexus Mods, CurseForge, SeaArt, Apple Books direct, Apple Books aggregators, LottieFiles), 6 standing kills reconfirmed, 4 unsettled (MyProduct, Wavedash, Tensor.art, a Hebrew teacher-site lead; the Wavedash and teacher-site renders are queued as rows 89-95).
- **28.9 (tick 6), Google Play Books (candidate 18) killed:** the board's pre-registered clause fired; Israel is not in Google's supported-countries table in any column (`google-play-books.md`).

## 8. Open Fable items

Rows 8-13 are done (28.9): the 07:12 sitting ruled rows 8-11, the breadth board ruled rows 12-13 (`research/breadth/BOARD.md`). **Rows 14-15 are queued for the 29.9 ~07:11 sitting (two agents):** row 14 the loop board (Firefox kill or park, what to do when every ₪0 test returns NEEDS_MORE, the next admission candidate, the §9 wording); row 15 line economics (il-biz-tools' ₪79 Pro, the three apify/payout items, the T1 sub-brand name). Earlier notes, now inside rows 14-15: apify-actors' ₪200 `inferred` against its own "forecast ₪0" basis; `staleDays: 21` on monthly-payout lines; Apify's $20 payout minimum against a trailing-30 floor; the T1 sub-brand name; **il-biz-tools' ₪79 Pro** (its main feature, logo branding on receipts, is free in other invoice tools, including four on AMO; tick 6, `firefox-amo.md`), a pricing question for the owner and the board, not a loop kill. **The next admission sitting** takes the first engine whose ₪0 tests return (on today's evidence, Firefox).

## 9. Maintenance backlog

- **PAUSED 28.9 (tick 11): no tiktok.com URL in any render list or override** until the Fable sitting rules on FABLE_QUEUE row 16 (d). TikTok's terms ban automated scraping, crawling or extraction "for any purpose" without written approval (`research/tiktok/08-reads/tt2-render-check.md`); the runner fetched about 110 TikTok pages on 28.9 for the owner's research before this was read. Research on TikTok continues only from GitHub mirrors (e.g. Open Terms Archive) and search snippets.

Fixed in tick 3 (28.9, commit `4c73f67`):
- **"Runs hourly".** colony.yml is scheduled hourly; GitHub fired it 29 times in 122.6 hours (22.9 22:06 to 28.9 00:43 UTC), about every 4.4 h, gaps 2.4-6.7 h. Corrected in `docs/OWNER_STEPS.he.md` (and the PDF), `docs/INCOME_PLAN.he.md` and `src/revenue/owner-steps.ts`.
- **Stale scope.** `products/README.md` and `MISSION.md` now name `@mehudak/mcp-il-tools`.
- **Two ceilings.** `docs/INCOME_PLAN.he.md` §1ב carries a note that its 4.9 range is superseded by ₪1,500.
- **`setup-done` on main.** Already fixed: main's `REPORT.md:75` tells the owner to tell Claude, and Claude runs the command.

Fixed in tick 4 (28.9): the policy check read permission sentences inside HTML comments (`policy.ts`), which let a
honeypot repo into the bounty count; being fixed by `apply-rulings-28-9`. `scripts/merge-worktree.sh` carried a
stale Fable trailer and session link (`4cbb3bd`).

Adopted by the breadth board (Q9): the `BOARD-LOOP.md:127` wording (30 days after invoice), the Tipalti correction to `BOARD-LOOP.md:124,126` (billing onboarding comes before the first submission), and the `REJECTED.md:820` Apify note.

Fixed in tick 7 (28.9, `b2cfd48`): render-watch's text extractor dropped `<noscript>` (where Discourse forums put every post) and ended tags at a `>` inside a quoted attribute, so forum captures came out as 8-10 lines; both fixed test-first, 123 stored pages re-extract with none losing text. The next render rewrites the thin forum `.txt` files.

Fixed in tick 6 (28.9): ZERO-TESTS rows and `urls.txt` lines are now queued by `scripts/queue-zero-test.mjs` (numbering, four columns, no duplicate URL or slug; 6 tests), replacing the per-tick Python snippet.

Open:
- ~~**Kill-test wording.**~~ **Adopted 28.9** by the breadth board (`research/breadth/BOARD.md` Q9, lines 196-197): "the €100 threshold; payment 30 days after invoice per the developer terms, NET 60 per the payouts page". FABLE_QUEUE row 14 (d) is therefore already settled (found by the sitting brief, 29.9).

## 10. Next tick's first action

**Tick 16 (next):** the Fable sitting at the ~07:12 6-hourly tick with `research/channel-loop/SITTING-2026-09-29-BRIEF.md`; rule row 14 (e2) before (f) — Astro (row 7) now rides on (e2) too; fold the rulings. Also: take rows 147, 148 and 151 off `urls.txt` (JavaScript shells the runner can never render). No tiktok.com URL in any render.

**Tick 15 (done 04:25 29.9):** sitting brief written; loop rows 7 (Astro, KILL-PROPOSED on G3/G6 pending (e2)), 12 (Topcoder, selfie unsettled), 13 (prize intake list-count half built) read or built. Log: `logs/2026-09-29-channel-loop-tick-15.md`.

**Was planned for tick 15:** the Fable sitting at ~07:11: FABLE_QUEUE rows 14-15 (two agents; row 16 the sitting after), then fold its rulings: confirm or reject the nineteen refutations in `docs/REJECTED.md`, the loop's NEEDS_MORE policy (row 14 (b)) which decides whether a third queue refill runs, the il-biz-tools Pro price and refund policy (row 15 (a), (h)), pcn874's offer (15 (f)). Until then, owner-free polish only; no new product (the built-but-unlaunched cap is 6/6). No tiktok.com URL in any render (§9).

**Tick 14 (done 03:00 29.9):** merged the il-biz-tools AI declaration, the parent-guides CI and v2 with motion (sent to the owner, unpublished), and the בעל עסק זעיר self-check (`osek-zair.html`, 2024-2025 from primary text, 2026 refused). Log: `logs/2026-09-29-channel-loop-tick-14.md`.

**Was planned for tick 14:** owner-free build work while every venue waits on step 8 or a ruling: (1) merge the il-biz-tools AI declaration (`wf_00486acf-f29`) and the parent-guides v2 (`wf_ed0b41c6-a96`) with `scripts/merge-worktree.sh`; (2) build the TikTok note's A11, a "פטור + בעל עסק זעיר, או דיווח רגיל?" self-check page in il-biz-tools, from the primary text in `research/tiktok/08-reads/tt2-render-check.md` (2024-2025 cap ₪120,000; the 2026 cap is not rendered, so it goes in as a sourced config marked unverified); (3) a products-ci job for `products/parent-guides`. At the Fable sitting (~07:11): rows 14-15 (row 14 (b) decides what the loop does when every ₪0 test returns NEEDS_MORE; a third queue refill waits on that answer). No tiktok.com URL in any render (§9).

**Ticks 12-13 (done 01:20 29.9):** StreetLib read to the end: KILL-PROPOSED on a $99/year or $299 membership plan (G1, rendered); recorded for the sitting. Log: `logs/2026-09-29-channel-loop-ticks-12-13.md`.

**Tick 10 (done 22:25):** rows 132-135 rendered with the YouTube Kids help hubs (`d6fffe6`) and read; no kill fired; rows 136-140 queued. **Tick 11 (next):** ONE render-watch dispatch for ZERO-TESTS rows 136-140 (StreetLib payout and account articles, the Displate privacy chunk) plus the URLs the TikTok and YouTube Kids notes list. **Was planned for tick 10:** ONE render-watch dispatch for ZERO-TESTS rows 132-135 (StreetLib plans and payments, Displate privacy, Teach Simple licence), plus any next-render URLs the TikTok stage-2 readers list (`research/tiktok/08-reads/*.md` §5), in the same dispatch. Then one Opus reader per venue. Zazzle (25) and Society6 (27) stay parked: no capture holds an address to write to. Displate and Teach Simple join the step-8 send list (orders 6-7) if the builder's tests pass. Queue with `scripts/queue-zero-test.mjs`, never by hand. The Fable sitting on 29.9 at ~07:11 takes `FABLE_QUEUE.md` rows 14-15, plus the TikTok note's queued questions (parasite SEO on a UGC platform).

**Done in tick 9:** the second refill was folded (rows 24-27; seven gate refutations; no paid MCP marketplace survives). Two renders (31: rows 108-128; 32: the TikTok override and rows 129-131). Readings: n8n exhausted; StreetLib NEEDS_MORE; Displate promising; Teach Simple queued (row 28) and QUEUE-ON; Smashwords/D2D dead on an activation fee. Log: `logs/2026-09-28-channel-loop-tick-9.md`.

**Done in tick 8:** the brand-mail tooling merged (`19f63cf`; `scripts/brand_mail.py`, `.github/workflows/brand-mail.yml`, dispatch only, dry run first). The Spreadshirt recipient and Indiebook's question are being added to `research/owner-asks/questions.json`. **Previously planned:** add to its question list (one message per venue) the Spreadshirt recipient now found (`spreadshop-legal-information.txt:34-36`), and a fifth message, Indiebook's five-item question drafted in `research/measurements/indiebook.md` (Tick 8). Four venues are now parked on step 8 with nothing left to render: Wix, Spreadshirt, Indiebook, and Facer's reopen question.

**Continuation (~17:16 UTC 28.9) and after:**
- One render-watch dispatch for ZERO-TESTS rows 63-95 (Spreadshirt second route, Wix security step, PayPal HELP534,
  n8n verified-creator thread, and the replenish pass's 28 URLs: Indiebook, Facer, Y8, GameDistribution, TPT fees,
  Wavedash, six Hebrew teacher-site homepages). Then one Opus reader per venue family.
- Merge the mcp-il-tools publish-prep worktree when its review and fix pass return (`scripts/workflows/mcp-il-tools-publish-prep.js`).
- The Fable sitting 29.9 ~07:11 takes `FABLE_QUEUE.md` rows 14-15.
- Queue in `scripts/queue-zero-test.mjs`, never by hand.


**Tick 6 (done in continuous mode, 16:07-~17:05 UTC; its planned items were):**
- One render-watch dispatch for the tick-5 follow-ups (ZERO-TESTS rows 59-62: PayPal IL help index, n8n Creator Hub
  document, Bit2C FAQ, the AMO 'invoice' search) together with Batch B (rows 53-58: uncomment the six lines in
  `urls.txt`). Then read them into the notes.
- Try the two free routes for the Spreadshirt 406/403 (a GitHub mirror; a different Accept header) before spending a
  step-8 question on it.
- The next Fable sitting (29.9 ~07:11): kill or park Firefox (row 16) on the 'invoice' reading; take the first engine
  whose tests returned as the admission candidate — on today's evidence none has passed, so the sitting also rules on
  what the loop does when every ₪0 test returns NEEDS_MORE (more renders, or the step-8 questions).

**Tick 5 (done 28.9):** Batch A rendered and read (13 of 22 readable); Pebble killed; Firefox failed G4; five candidates
stay NEEDS_MORE with their next checks queued (rows 59-62); owner page refreshed.

**Tick 4 (done 28.9):** Fable rows 8-11 ruled; 8 pages read (Polar killed, Wix and CrazyGames NEEDS_MORE, Bituach
Leumi exempt groups); mcp-il-tools defects fixed; the owner's breadth directive recorded and swept.

**Tick 3 (done 28.9):** the CrazyGames terms PDF, the Wix partner pages and Polar's country list read; 3 maintenance items fixed; rows 18-24 queued.

**Tick 2 (done 28.9):** 5 pages read; T1 counter merged (`87c7459`).


**Tick 2:**
- Render the Bituach Leumi salaried-plus-self-employed page (`urls.txt` §12, last line) and the next pages for CrazyGames (developer terms PDF, /payouts/), Wix (payout account) and Stripe Global Payouts recipient requirements, all in ONE dispatch.
- Add a cookieless-analytics option to `page.py` for the T1 web arm.
- The Fable sitting at 07:11 UTC takes `FABLE_QUEUE` rows 8-10. Row 10 now carries both the Stripe finding and week 1's 108.

**Tick 1 (done 27.9):**

**Tick 1:**
- In il-biz-tools, fix the `build-site.js:32` leak: `src/config` is copied into `_site` wholesale, so the unverified `tax-2026.json` would ship.
- Add the accessibility statement and delete the Facebook/WhatsApp line.
- Add the ₪0-test URLs from §4 to `research/rendered/urls.txt`, each with a citing comment that points here.
- Dispatch one render-watch.

## 11. Resume

- **Routine:** "Channel loop tick", trigger id in `logs/CHECKPOINT.md`. It fires into this session every 6 h. A tick with work left re-arms itself about 60 min out with `send_later`.
- **Stopping it:** the owner says "עצור", and the tick disables the routine.
- **After a lost container:** a fresh session reads `MISSION.md`, then `logs/CHECKPOINT.md`, then this file, and runs §1 by hand.
- **PR checks:** the ad-hoc hourly PR #3 check folded into the tick.
