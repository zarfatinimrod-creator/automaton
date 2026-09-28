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
| Last tick | tick 3: 28.9.2026 ~02:10 UTC — CrazyGames terms PDF read (no fail clause, no AI clause, non-exclusive by default, paid 30 days after invoice); Polar lists Israel for payouts; the Wix agreement body was not in the capture; 3 maintenance items fixed. 7 pages queued for tick 4 |
| Branch | `claude/new-session-j071dx`, restarted from `main` after PR #4 merged (`baab472`). The standing consent means the loop merges its own green PRs. |
| Routine | "Channel loop tick", every 6 h (`11 1,7,13,19 * * *` UTC), fires into this session; see §11 |
| Fable | available at 27.9 ~21:30 UTC (two agents ran). The daily sitting is the ~07:11 UTC tick. |
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

## 2. Caps and counts

| Cap | Now | Members |
|---|---|---|
| Built-but-unlaunched ≤ 6 | **6/6 — binding** | apify-il-open-data, il-biz-tools, pcn874, mcp-il-tools, T1 web page, T1 video |
| Experiments measuring ≤ 3 | 1/3 | faceless-youtube (in code, not yet measuring anything public) |
| Builds in flight ≤ 1 | 0/1 | none |
| Render dispatches this tick ≤ 1 | 0/1 | none |

Because the BBU cap binds, **no new product whose launch needs an owner step starts** until something launches. The loop's work is launch preparation, ₪0 tests, instruments and maintenance.

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
| apify-actors (Actor over data.gov.il, free) | parked-owner | Apify, `observable:false`; declared a ₪0 instrument | 6a (Apify sign-up + `APIFY_TOKEN`) | pre-write the "Publish" message; check on main that the publish job creates the Actor as private | secret present, so the publish job stops being a no-op |
| il-biz-tools (Hebrew business tools) | launch-ready except one gap | Gumroad connector wired (`colony.yml`) | deploy route: ask 1 (network) or the Netlify click in 6b | Done in tick 1: `_site` ships only files that shipped pages load; the accessibility statement is in; the Facebook/WhatsApp line is gone (364 tests). **The publish gate blocks until a brand-owned accessibility contact exists (proposed step 8, brand mailbox).** | the network allowlist is widened AND a brand contact exists |
| pcn874 (VAT detailed-report file) | admitted: free validator page to build | Gumroad (same account) | none for the free page; 2, 3, 6b, 5 for the paid builder | build a client-side validator page inside il-biz-tools (2-3 days) once that site's preparation is done | rides the il-biz-tools deploy |
| oss-bounties (Algora) | parked-window (week 1 of 4 read) | Algora via Stripe Express. **Stripe does not pay Israel self-serve** (`research/measurements/stripe-israel.md`), so the rail is in doubt. Fable, `FABLE_QUEUE` row 10. | step 4 held | Week 1 (27.9 23:43): **108 claimable, $74,065**, of 551 labelled (3 unserved), `research/measurements/algora-supply.md`. The board expected under 10. The next reading comes Mondays 06:23 UTC. | the week-4 mean AND a Fable ruling on the payout rail |
| mcp-il-tools (free MCP server) | building (preparation), then parked-owner | none, a ₪0 channel test | proposed step 9 (npm), 5, 7 | fix the two defects (`README.md:21`, `:32`); `mcp-publish.yml` gated on `NPM_TOKEN` | npm yes plus token |
| T1 web arm (faceless-YouTube experiment) | launch-ready but for a counter key | ₪0 experiment | deploy route (ask 1) + a PostHog project named after the brand, with 'Discard client IP data' on and GeoIP off | Tick 2: `page.py` has an optional anonymous counter, off by default and byte-identical (132 tests). Next: create the PostHog project through the attached connector, pre-register the reach floor, choose the sub-brand name. | deploy route open; day 56 counts from that deploy |
| T1 video | held by protocol | ₪0 experiment | Stage A, only after the day-56 web read | none | web arm passes at day 56 |

## 4. Ranked queue (candidates not yet channels)

The full reasoning for each is in `BOARD-LOOP.md`. The ₪0 test runs first and writes to `research/measurements/`.

| # | Candidate | ₪0 test | Status |
|---|---|---|---|
| 6 | CrazyGames Basic Launch: original HTML5 games under the brand | render the FAQ, payouts, developer terms and Basic Launch pages → `crazygames.md` | **NEEDS_MORE** after tick 3. The terms PDF (read 28.9) has no clause that fails the test: any physical person or entity may contract, no country clause, non-exclusive by default (+50% for an opt-in 2-month exclusivity), paid 30 days after invoice (NET 60 is the Payouts page, not the contract), no developer fee, and no AI or automation clause. Open: the binding "Publisher Guidelines" (ZERO-TESTS rows 22-24), the revenue rate (a formula with no number), Israel payability (Tipalti onboarding), a brand-name payee (the terms want the legal name in notices), and an uncapped IP indemnity for the board to weigh. |
| 7 | Paid Astro themes in Astro's Theme Catalogue, sold on Gumroad | render https://portal.astro.build/api/themes?price[]=paid and the unfiltered listing → read the ordering | returned 27.9: **NEEDS_MORE**. 638 paid themes; no stars or installs field; ordered by `updatedAt` within runs. Next: the astro.build source on GitHub for the display order and submission (`astro-themes.md`). |
| 8 | Mozilla Client Bug Bounty via Bugzilla REST | a 30-day private dry run, nothing filed; render the bounty page and the Bugzilla account policy | not run; stop if a private repo's Actions minutes would cost money |
| 9 | Polar.sh as a second merchant-of-record rail (rail research, not a channel) | render Stripe's country and cross-border pages, then Polar's supported-countries page | tick 1 **FAILS_TEST** (Stripe alone); tick 2 reopened (Global Payouts lists Israel); tick 3 **NEEDS_MORE**: Polar's own Payouts list names Israel (`polar-supported-countries.txt:246`), paid via Stripe Connect Express from a US platform under a recipient agreement; the page never names Global Payouts (`polar-rail.md`). Open: Israeli-individual onboarding (row 19), acceptable use (row 20), fees (row 21). The algora rail question stays with Fable (row 10). |
| 11 | Wix App Market app for Israeli compliance | render the payments FAQ, payout-account page, partner agreement and payouts dashboard | **NEEDS_MORE** after tick 3. The $200 threshold rolls over (tick 1); Tipalti (tick 2); a paid app cannot publish before payout setup, and a teammate with Manage Earnings can do it (tick 3). The partner-agreement capture was only the docs wrapper: the body is at https://dev.wix.com/app-market-partner-agreement (row 18). Israel still UNKNOWN (`wix-app-market.md`). |
| 12 | Topcoder auto-scored challenges | fetch https://api.topcoder.com/v6/challenges?status=ACTIVE and the member terms / AI policy | returned 27.9: **NEEDS_MORE, leaning FAILS_TEST**. There was one active challenge; it is human-reviewed Development, and none are auto-scored (`topcoder.md`). |
| — | **Bituach Leumi cost of step 2** (not a channel: the ₪0 rule's check before the owner is asked) | render https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx, https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx and https://www.kolzchut.org.il/he/%D7%93%D7%9E%D7%99_%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%9C%D7%90%D7%95%D7%9E%D7%99_%D7%9C%D7%A9%D7%9B%D7%99%D7%A8_%D7%A2%D7%9D_%D7%9E%D7%A7%D7%95%D7%A8%D7%95%D7%AA_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D → `research/measurements/step2-cost.md` | tick 1 dispatch |
| 13 | AI-allowed prize-event intake (instrument only) | weekly read of https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json | not built |
| 14 | HTML5 syndication (GameMonetize, GameDistribution, Playgama) | none until a game passes CrazyGames Basic Launch | waiting |

(Ranks 1-5 and 10 are the existing channels in §3.) Rejected from the queue, with reasons, in `BOARD-LOOP.md`:
- Higgsfield hosting;
- x402 as a channel;
- the Telegram bot;
- Devpost;
- registrar-reminder as a separate channel;
- Poki;
- portal licences;
- WordPress bounties;
- a second Actor, or more calculators, as "new channels" (constraint 6).

## 5. Measurement calendar

No read is dated yet, because every clock starts with an owner action:
- **Algora supply:** weeks 1-4 from the first Monday after PR #3 merges (06:23 UTC).
- **Apify stranger users:** day 30 from the Publish click.
- **il-biz-tools and pcn874 page views:** 8 weeks, and revenue at 90 days, from the domain deploy.
- **T1 web arm:** day 56 from its deploy.
- **K3:** day 112.

## 6. Owner-ask batch (single ordered list, under the ₪0 rule)

**Done 27.9:** "תמזג" plus the standing consent. PR #3 was merged as `61fae4e`.

**Free, no identity (about 7 minutes in all):**
1. **(2 min, a settings change)** Network access for this environment: cloud environment menu → Edit → Network
   access. Add `api.netlify.com`, `netlify-mcp.netlify.app` and `*.netlify.app`. The loop then deploys every static
   surface to free `*.netlify.app` hosting itself. The alternative is the Netlify "Link repository" click in step 6b,
   once per site.
2. **(5 min)** Step 6a: sign up at Apify with the username `mehudak` (the free plan), add the `APIFY_TOKEN` secret,
   then one Publish click when told.
3. **(15-20 min)** Step 7: create the GitHub organisation `mehudak` (Free plan), transfer the repo, re-grant the
   Claude GitHub connector, and create the `mehudak-ci` machine account. This also gives the MCP registry a free
   namespace (`io.github.mehudak`) in place of the domain.

**Only when a paid product is ready, and only after its cost is checked:**
4. Step 2, the עוסק פטור file and Bituach Leumi. Before it is asked for, the colony renders what registering costs
   someone in the owner's position (§4 row "Bituach Leumi"). One fact the colony cannot find itself: is the owner
   currently a salaried employee? The Bituach Leumi rules differ.
5. Step 3, Gumroad. It is free to open, and fees come only out of sales. It needs identity: ID, proof of address and
   an Israeli bank account.

**Frozen by the ₪0 rule:** step 5 (the domain). **A decision still open:** item 8 of the old list. The repo is
public, and its history on main carries the owner's real name and personal email as the merge author. Choose one:
make it private (Actions minutes become metered, possibly a cost) or accept the exposure knowingly.

**Proposed steps, each needing a yes (free):**
- a brand mailbox the agent can read (step 8);
- an npm account `@mehudak` and the `NPM_TOKEN` secret (step 9).

**Held, not asked:**
- step 4, until the week-4 supply read;
- YouTube Stage A, until the day-56 web read;
- Apify KYC, until 50 stranger users;
- the CrazyGames, Polar, Wix, Topcoder and Bugzilla accounts, until their ₪0 tests pass;
- `BRAND_GITHUB_TOKEN`, until step 4.

## 7. Kills and admissions made by the loop

None yet.

## 8. Open Fable items

These are in `logs/FABLE_QUEUE.md`, rows 8-11, for the ~07:11 UTC sitting:
- row 8: reconcile the kill floor in code (₪500 in 30 days after 45 days, `types.ts:214-216`) with the lines' own rules (₪200 or ₪150 after 90 days, `portfolio.ts:114,202`);
- row 9: rule on il-biz-tools' contradicted ₪400: waive the kill rule for the measurement, or plan it at ₪0;
- row 10: the Stripe rail and algora week 1's 108 claimable bounties (tick 3 adds: Polar pays Israel through Connect Express under a recipient agreement, `polar-rail.md`);
- row 11: pre-register the T1 web-arm reach floor before any deploy.

## 9. Maintenance backlog

Fixed in tick 3 (28.9, commit `4c73f67`):
- **"Runs hourly".** colony.yml is scheduled hourly; GitHub fired it 29 times in 122.6 hours (22.9 22:06 to 28.9 00:43 UTC), about every 4.4 h, gaps 2.4-6.7 h. Corrected in `docs/OWNER_STEPS.he.md` (and the PDF), `docs/INCOME_PLAN.he.md` and `src/revenue/owner-steps.ts`.
- **Stale scope.** `products/README.md` and `MISSION.md` now name `@mehudak/mcp-il-tools`.
- **Two ceilings.** `docs/INCOME_PLAN.he.md` §1ב carries a note that its 4.9 range is superseded by ₪1,500.
- **`setup-done` on main.** Already fixed: main's `REPORT.md:75` tells the owner to tell Claude, and Claude runs the command.

Open:
- **Kill-test wording.** `BOARD-LOOP.md:127` says "the €100 threshold plus NET-60" for CrazyGames. The contract says 30 days after invoice; NET 60 is the Payouts page. BOARD-LOOP is the Fable design, so the correction is noted here and left for the next Fable sitting to adopt.

## 10. Next tick's first action

**Tick 4 (~07:11 UTC, the Fable sitting):**
- The Fable sitting takes `FABLE_QUEUE` rows 8-11 (at most 2 agents).
- One render-watch dispatch for ZERO-TESTS rows 18-24: the Wix agreement body, Stripe's required verification information, Polar acceptable use and fees, and CrazyGames' requirements (intro, quality, ads).
- Read them into `wix-app-market.md`, `polar-rail.md` and `crazygames.md`.

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
