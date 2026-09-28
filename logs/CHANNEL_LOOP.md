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
| Last tick | tick 5: 28.9.2026 13:13-14:30 UTC — Batch A rendered (22 URLs; 13 readable, 7 refused, 1 shell) and read: Pebble killed (pre-registered), Firefox FAILS on G4 (no Pro feature free nowhere; one reopen check queued), PayPal IL pays ILS with no camera step named, n8n shows 0 priced templates in 100, CrazyGames benchmarks confirmed at rendered grade, Wix's security page is advice only, Superteam terms silent on KYC, Bit2C document-only on its home page, Apify hides 13.5% of Actors by default; Spreadshirt and Tipalti refused the runner; owner page refreshed; MoneyPrinterTurbo#1 unchanged (draft, no CI on the fork) |
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
| pcn874 (VAT detailed-report file) | admitted: free validator page to build | Gumroad (same account) | none for the free page; 2, 3, 6b, 5 for the paid builder | build a client-side validator page inside il-biz-tools (2-3 days) once that site's preparation is done | rides the il-biz-tools deploy |
| oss-bounties (Algora) | parked-window (instrument fault: week 1 struck, counter being fixed; the 4-week clock restarts at the first corrected run) | Algora → Stripe Connect Express. Algora's code lists Israel for Express (code grade); the gap is its silent US-country fallback, caught by step 4b's stop rule (`RULING-2026-09-28-bounty-rail.md` §2, §3.5) | 4b held (corrected week-4 mean ≥ 3 AND a held reward); step 7 creates `BRAND_GITHUB_TOKEN`; 4a dropped by the breadth board | The counter fix (policy reads visible text only, `not-a-payer`, `claimableFresh365`) is being applied (workflow `apply-rulings-28-9`); corrected week 1 read 28.9 09:25 UTC: **18 claimable, only 1 created in the last 365 days** (`research/measurements/algora-supply.md`) | the corrected week-4 mean AND, for 4b, a reward held as a credit |
| mcp-il-tools (free MCP server) | building (preparation), then parked-owner | none, a ₪0 channel test | proposed step 9 (npm), 5, 7 | Tick 4: both defects fixed test-first (`aca0900`: npx symlink start guard; `hebrew_date` in every timezone, ICU-checked 1900-2100); 19/19. Next: `mcp-publish.yml` gated on `NPM_TOKEN` | npm yes plus token |
| T1 web arm (faceless-YouTube experiment) | launch-ready but for a counter key | ₪0 experiment | deploy route (ask 1) + a PostHog project named after the brand, with 'Discard client IP data' on and GeoIP off | Tick 2: `page.py` has an optional anonymous counter, off by default and byte-identical (132 tests). Next: create the PostHog project through the attached connector, pre-register the reach floor, choose the sub-brand name. | deploy route open; day 56 counts from that deploy |
| T1 video | held by protocol | ₪0 experiment | Stage A, only after the day-56 web read | none | web arm passes at day 56 |

## 4. Ranked queue (candidates not yet channels)

The full reasoning for each is in `BOARD-LOOP.md`. The ₪0 test runs first and writes to `research/measurements/`.

| # | Candidate | ₪0 test | Status |
|---|---|---|---|
| 6 | CrazyGames Basic Launch: original HTML5 games under the brand | render the FAQ, payouts, terms, requirements pages → `crazygames.md` | **NEEDS_MORE** after tick 4. The requirements pages hold no AI or automation rule and name no upload API (portal only); Basic Launch: ≤50MB initial download, PEGI12, no external ads, SDK optional. Open: may a runner operate the portal (one written question from the brand mailbox, step 8), the Basic Launch metrics and gameplay pages (ZERO-TESTS rows 26-27), Israel payability (Tipalti). Breadth board: **Tipalti first** — the payees FAQ render gates step 10 (developer account plus Tipalti onboarding, before any submission). **Tick 5:** the kill row's benchmarks are now RENDERED and match (10+ min, 10-15% D1, 80%+ conversion, `crazygames-basic-launch-metrics.txt:216,234,252`), framed as what successful games reach, not pass lines; Basic Launch ends at 7 days AND 500 plays, or 21 days (`:199`), plays not players (corrects BOARD-LOOP:124's "≥500 real players"); no clone, AI or upload-API rule on the gameplay page; Tipalti's payees FAQ refused (403), so step 10 stays gated. Still NEEDS_MORE; the written question via step 8 is the next check. |
| 7 | Paid Astro themes in Astro's Theme Catalogue, sold on Gumroad | render https://portal.astro.build/api/themes?price[]=paid and the unfiltered listing → read the ordering | returned 27.9: **NEEDS_MORE**. 638 paid themes; no stars or installs field; ordered by `updatedAt` within runs. Next: the astro.build source on GitHub for the display order and submission (`astro-themes.md`). |
| 8 | Mozilla Client Bug Bounty via Bugzilla REST | a 30-day private dry run, nothing filed; render the bounty page and the Bugzilla account policy | not run; stop if a private repo's Actions minutes would cost money |
| 9 | Polar.sh as a second merchant-of-record rail (rail research, not a channel) | render Stripe's and Polar's pages | **FAILS_TEST (killed 28.9)**: Polar's own account-reviews doc requires an ID "along with a selfie" through Stripe Identity (read from its public repo); the owner forbids a camera step. Fees would have passed (5% + 50¢, nothing up front). Reopens only if Polar documents owner verification without a selfie (`polar-rail.md`). |
| 11 | Wix App Market app for Israeli compliance | render the FAQ, payout-account page, agreement body, payouts dashboard | **NEEDS_MORE** after tick 4. The agreement: the $200 floor rolls over with no expiry; forfeiture only for breach; only comprehensively sanctioned territories barred (Israel not among them); individuals may partner; USD by wire against a tax invoice; no support SLA or AI clause. New ₪0 risks: a third-party security test before submission and a documented multi-developer review (ZERO-TESTS row 28). Israel still turns on the Tipalti form. Breadth board adds the Tipalti US-ROW coverage page, the App Market guidelines and the company-info page (Batch B); the per-payout tax invoice is settled after step 2. **Tick 5:** the security best-practice page is advice only (self-test at `:160`; no tester, tool, artefact or submission named), so no free route to the agreement's third-party test is shown; the agreement also wants SANS top-25 testing (:183) and a recurring assessment (:189). Tipalti refused. Still NEEDS_MORE; Batch B row 57 (App Market guidelines) next. |
| 12 | Topcoder auto-scored challenges | fetch https://api.topcoder.com/v6/challenges?status=ACTIVE and the member terms / AI policy | returned 27.9: **NEEDS_MORE, leaning FAILS_TEST**. There was one active challenge; it is human-reviewed Development, and none are auto-scored (`topcoder.md`). |
| — | **Bituach Leumi cost of step 2** (not a channel: the ₪0 rule's check before the owner is asked) | render https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx, https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx and https://www.kolzchut.org.il/he/%D7%93%D7%9E%D7%99_%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%9C%D7%90%D7%95%D7%9E%D7%99_%D7%9C%D7%A9%D7%9B%D7%99%D7%A8_%D7%A2%D7%9D_%D7%9E%D7%A7%D7%95%D7%A8%D7%95%D7%AA_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D → `research/measurements/step2-cost.md` | tick 1 dispatch |
| 13 | AI-allowed prize-event intake (instrument only) | weekly read of https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json | not built |
| 14 | HTML5 syndication (GameMonetize, GameDistribution, Playgama) | none until a game passes CrazyGames Basic Launch | waiting |
| 15 | Superteam Earn agent bounties (`type=bounty` only) | T1 weekly CI count of agent-eligible dev bounties (one brand agent registration, no submissions); T2 render FAQ/terms/agents page; T3 read the submission schema from SuperteamDAO/earn; T4 render the onboarding of an Israeli crypto off-ramp for the camera question | **admissible in principle, admitted to nothing** (`RULING-2026-09-28-bounty-rail.md` §6); USDC receipts would book at ILS value on receipt with the tx hash, flagged `unconverted`. Tests T1-T4 dispatched as ZERO-TESTS rows by `apply-rulings-28-9`; admission is row 12's call. Breadth board: T2 also reads `terms-of-use.pdf`; T4 adds the SOL-gas / Privy question; a legal name shown publicly on the talent profile keeps the kill unless T2/T3 show a brand display option (Q6). **Tick 5 (T2 read in full, `research/measurements/superteam-earn.md`):** KYC only for Superteam/Solana-sponsored listings (`superteam-earn-faq.txt:55`), which T1 filters out; external sponsors pay the account's wallet, KYC only occasionally (`:57`); agents do no KYC, a human claims (`superteam-earn-agents.txt:187`); no country bar beyond the terms' sanctions clause; no fee named. Whether a claimed win shows a legal name is UNKNOWN (wins are public, `faq:99`; profile fields unlisted), so the §6.5 kill neither fires nor lifts. NEEDS_MORE; next is T3, a code read of `SuperteamDAO/earn` (profile page, winners component). **T3 (28.9, tick 5, code read of `SuperteamDAO/earn` @ c25c4f8): FAILS_TEST — the §6.5 name kill FIRES.** First and last name are required (`src/features/talent/schema/index.ts:37-44`), a claim moves the win to the human (`src/pages/api/agents/claim.ts:100-108`), and the winner card, leaderboard, feed and share image print `firstName lastName` (`ListingWinners.tsx:156-157`); the only privacy control adds `noindex` and still prints the name. No display-name option. **Killed under the board's Q6 pre-decision; reopens only if the owner accepts their name beside wins, or a sitting rules the brand may fill the name fields** (the platform itself fills them with a label for agents, `agents/index.ts:92-93`). Also from code: KYC only on Superteam-chapter-funded listings (Sumsub; level from an unset env var); agents skip the region check; the platform pays gas, so T4's SOL question is closed (rows 29-32 close with this). |
| 16 | Firefox Add-ons (AMO) + Gumroad Pro licence | render the four AMO URLs; before admission name one Pro feature that is free nowhere | **FAILS_TEST on G4 (28.9, tick 5):** no Pro feature can be named that is free nowhere — 24 free RTL fixers on page 1, Hebrew utilities at 1-85 daily users, il-biz-tools' receipt branding merely absent from 50 results (`research/measurements/firefox-amo.md`). The policies themselves pass (no fee, paid features allowed with disclosure `amo-add-on-policies.txt:2051`, machine-generated code allowed with source `:2069`, display-name accounts). Newest-50 cohort: median 0 daily users, a day-0 reading. **Not admitted; one reopen check queued (ZERO-TESTS row 62, an 'invoice' search); kill or park at the next sitting.** |
| 17 | Spreadshirt (single account) | render the six Spreadshirt URLs and DSA Arts 30-31; one written question on automated uploads from the step-8 mailbox | **Unread — route refused (28.9, tick 5):** all six pages 403/406 to the runner, EUR-Lex a 202 shell (`research/measurements/spreadshirt.md`). NEEDS_MORE; fallbacks: a GitHub mirror, a different Accept header for the 406, or the step-8 question. |
| 18 | Google Play Books Partner Center | render table 6052428 and answers 3250840, 4490848 (Batch B); Israel absent from the payment-country list → dead | queued 28.9 (breadth board) |
| 19 | Pebble appstore + KiezelPay | render the KiezelPay FAQ and `apps.repebble.com/faces` (Batch A); pre-registered kill: no Pebble onboarding in 2026 or any fee → dead | **FAILS_TEST — killed 28.9 (tick 5), the pre-registered kill fired on clause 1:** KiezelPay's FAQ has no date after 2016 and no Pebble onboarding (`kiezelpay-faq.txt:221,229-231`); the store is alive (Spring 2026 contest) but has no documented payout route (`research/measurements/pebble-kiezelpay.md`; `docs/REJECTED.md`). |
| 20 | n8n paid templates (second tier, render only) | render the templates API and the creators page; read the Creator Hub's AI rule and paid-unlock condition | **NEEDS_MORE (28.9, tick 5):** 12,574 templates; 0 of the first 100 priced (`price` 0 or missing, `purchaseUrl` null on all); ordering is a server-side score, not any response field; the creators page states no AI, payout or submission rule and offers only non-monetary benefits (`research/measurements/n8n-templates.md`). Next: the Creator Hub document (ZERO-TESTS row 60). |
| 21 | PayPal Israel receiving (rail research, not a channel) | render the recorded PayPal IL URLs; a selfie or liveness step kills the PayPal leg of Pebble, Spreadshirt and GameMonetize together | **NEEDS_MORE (28.9, tick 5):** withdrawal to an Israeli bank in ILS only (`paypal-il-user-agreement-mpp.txt:338,344-346`); verification names ID documents (:1198) and no selfie, liveness or video step, but links no verification article, so the camera question is unknown, not excluded; a personal account may receive payments for goods (:229); new-seller holds up to 30 days (:863,873); the bank-account name must be in English (`paypal-il-link-bank.txt:13`). Q3 condition (i) not yet met. Next: the help index (row 59). |

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
   serves Play Books, YouTube Stage A and Search Console; Outlook.com if Google asks for more than a phone), which the
   agent reads through a connector plus a CI secret. The owner never replies to anything in it.
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
- an npm account `@mehudak` and the `NPM_TOKEN` secret (step 9).

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

## 8. Open Fable items

Rows 8-13 are done (28.9): the 07:12 sitting ruled rows 8-11, the breadth board ruled rows 12-13 (`research/breadth/BOARD.md`). Queued for a later sitting, not yet rows: apify-actors' ₪200 `inferred` against its own "forecast ₪0" basis; `staleDays: 21` on monthly-payout lines; Apify's $20 payout minimum against a trailing-30 floor; the T1 sub-brand name. **The next admission sitting** takes the first engine whose ₪0 tests return (on today's evidence, Firefox).

## 9. Maintenance backlog

Fixed in tick 3 (28.9, commit `4c73f67`):
- **"Runs hourly".** colony.yml is scheduled hourly; GitHub fired it 29 times in 122.6 hours (22.9 22:06 to 28.9 00:43 UTC), about every 4.4 h, gaps 2.4-6.7 h. Corrected in `docs/OWNER_STEPS.he.md` (and the PDF), `docs/INCOME_PLAN.he.md` and `src/revenue/owner-steps.ts`.
- **Stale scope.** `products/README.md` and `MISSION.md` now name `@mehudak/mcp-il-tools`.
- **Two ceilings.** `docs/INCOME_PLAN.he.md` §1ב carries a note that its 4.9 range is superseded by ₪1,500.
- **`setup-done` on main.** Already fixed: main's `REPORT.md:75` tells the owner to tell Claude, and Claude runs the command.

Fixed in tick 4 (28.9): the policy check read permission sentences inside HTML comments (`policy.ts`), which let a
honeypot repo into the bounty count; being fixed by `apply-rulings-28-9`. `scripts/merge-worktree.sh` carried a
stale Fable trailer and session link (`4cbb3bd`).

Adopted by the breadth board (Q9): the `BOARD-LOOP.md:127` wording (30 days after invoice), the Tipalti correction to `BOARD-LOOP.md:124,126` (billing onboarding comes before the first submission), and the `REJECTED.md:820` Apify note.

Open:
- **Kill-test wording.** `BOARD-LOOP.md:127` says "the €100 threshold plus NET-60" for CrazyGames. The contract says 30 days after invoice; NET 60 is the Payouts page. BOARD-LOOP is the Fable design, so the correction is noted here and left for the next Fable sitting to adopt.

## 10. Next tick's first action

**Tick 6 (19:11 UTC):**
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
