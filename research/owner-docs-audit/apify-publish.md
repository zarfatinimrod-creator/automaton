# Owner-doc claim audit: `products/apify-il-open-data/docs/PUBLISH.md`

Plus the automation it describes: `.github/workflows/apify-publish.yml` and `scripts/apify-runs.mjs`.

- Audited 2026-09-25 against the working tree on branch `claude/new-session-j071dx` (HEAD `245a19e`). Where it
  matters I also checked `origin/main`, read-only. The clone is shallow, so git history cannot date when a claim
  went stale. STALE here means that a newer artifact in the repo supersedes the claim.
- Method: every checkable claim was checked against the repo only. Commands were read-only. The Actor's tests were
  run on a scratch copy, and `colony.db` was queried from copies. No network call was made to Apify, and nothing
  was published.
- Nothing in the repo was edited except this report.

## Commands run, with their output

| # | Command | Result |
|---|---|---|
| R1 | scratch copy of `products/apify-il-open-data`, `vitest run` (root vitest 2.1.9) | `ckan 15, normalize 12, run 14` — **Tests 41 passed (41)**, 466 ms |
| R2 | same copy, `tsc --noEmit -p tsconfig.json` | one error only: `src/main.ts(5,28): TS2307: Cannot find module 'apify'` (package not installed here; environmental) |
| R3 | `npx vitest run src/__tests__/revenue/apify-runs.test.ts` | **27 passed (27)** |
| R4 | the workflow's guard `grep -oE '"[A-Za-z0-9_]*[Pp]ric[A-Za-z0-9_]*"[[:space:]]*:'` on `.actor/actor.json` | `FOUND=["suggestedPriceUsd"] UNEXPECTED=[]`, so the guard passes |
| R5 | same regex on `{"PRICE_USD":1,"unit-price":2,"pricingModel":"X"}` | matches only `"pricingModel":`. `PRICE_USD` and `unit-price` are not caught |
| R6 | `git check-ignore -v state/colony/measurements/apify-runs.json` | exit 1 (not ignored), so the workflow's plain `git add` works |
| R7 | copy of `state/colony/colony.db` (HEAD, and `git show origin/main:state/colony/colony.db`) → `select … from revenue_lines` | `apify-actors`: `status awaiting_setup`, `human_setup_done 0`, `target_monthly_agorot 20000` (= ₪200) on both |
| R8 | `git log origin/main` | `31cda66 2026-09-22 Merge pull request #2 …`. Colony-bot ticks are on main through 2026-09-25 13:44. `origin/main` carries `.github/workflows/apify-publish.yml` and `scripts/apify-runs.mjs`, and `state/colony/` holds no `measurements/` directory (no measurement has ever been committed) |
| R9 | `ls src/revenue/connectors` | `gumroad.ts index.ts lemonsqueezy.ts stripe.ts types.ts x402-local.ts`. There is **no** `apify-stats.ts`. Nothing outside `portfolio.ts` mentions `strangerUsers30d` or `strangerRuns30d` |

## Every claim checked, one line each

`PUBLISH.md` claims (line numbers are the document's):

| # | Line | Claim (short) | Status |
|---|---|---|---|
| 1 | 3 | This is the first thing to do before any other build | CORRECT — BOARD.md:267 "APPROVED, build #1"; CHECKPOINT.md:275 |
| 2 | 5-7 | Two independent auditors on different groups reached the same recommendation (`productized-services.md` §6, `agent-markets.md`) | CORRECT — productized-services.md:487-489; agent-markets.md:226-228 |
| 3 | 9 | The quote "Publish `apify-il-open-data` free, today, and count runs from strangers for 30 days." | CORRECT, verbatim — productized-services.md:489 |
| 4 | 11 | The cheapest test of the constraint that decides everything | CORRECT — productized-services.md:491-492 |
| 5 | 12-13 | MISSION constraint 7: nobody knows how a stranger finds this; until then every ceiling is ₪0 | CORRECT — MISSION.md:172-173 |
| 6 | 13 | The Actor is already built and already tested | CORRECT — R1 41/41; R2 only fails for want of the `apify` package; log 2026-09-07-apify-publish-and-measure.md:114 `npm run build` 0 |
| 7 | 13-14 | Costs "no owner time beyond account creation" | **WRONG** — F4 |
| 8 | 15 | ₪3,000 is the `apify-actors` target | **STALE** — F7 |
| 9 | 16 | ₪1,500 from the `store-promotion` audit | CORRECT — store-promotion.md:36, :70 |
| 10 | 16 | ₪500 from one of "the two audits above" | **WRONG** — F10 |
| 11 | 16 | ₪200 from the other audit (agent-markets) | CORRECT — agent-markets.md:43, :460 |
| 12 | 18-19 | Apify requires identity verification before an Actor can carry any price | CORRECT, research-grade — risk-governance--owner-kyc-catalogue.md:85-90; portfolio.ts:90-92; README.md:111 |
| 13 | 20 | Publishing free is the one thing possible before KYC | CORRECT — portfolio.ts:89-92; agent-markets.md:224-226 |
| 14 | 24 | Six steps | CORRECT as a count, but three of them are superseded (F1, F2) |
| 15 | 24 | Nothing here is KYC; nothing costs money | CORRECT |
| 16 | 24-25 | "none of it is reversible in a way that matters" | **WRONG** (wording) — F12 |
| 17 | 27 | Create the Apify account "in your own name" | **WRONG** — F3 |
| 18 | 27-28 | Email and password; no identity documents at this stage | CORRECT — OWNER_STEPS.he.md:208; portfolio.ts:95 |
| 19 | 29-33 | Owner installs `apify-cli` and runs `apify login` on a machine with the repo checked out | **STALE** — F1 |
| 20 | 31 | `npm install -g apify-cli` (unpinned) | **STALE** — F1 (the repo pins 1.10.0 and only verified that version) |
| 21 | 34-38 | Owner runs `apify push` from `products/apify-il-open-data` | **STALE** — F1 |
| 22 | 39-40 | `actor.json` already carries name, title, description, input schema, dataset views and Dockerfile | CORRECT — actor.json:3-5, :11-12, :14-30 |
| 23 | 41 | Console path "Actor → Publication → *Publish to Store*" | **UNSUPPORTED** — F11 |
| 24 | 42 | Leave pricing Free; set no price; do not start KYC | CORRECT — consistent with portfolio.ts:95, BOARD §6.3.1 |
| 25 | 43-46 | `pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "…"` (syntax) | CORRECT syntax — colony.ts:8, :70, :105-106, :292-311 |
| 26 | 43 | "Tell the colony it is live" | **WRONG** — F2 |
| 27 | 43 | "so the loop stops treating it as blocked" | **WRONG** as written — F2 |
| 28 | 47 | "Send back the Store URL. That is the whole handover." | **WRONG** — F1 (the `APIFY_TOKEN` secret the automation depends on is never mentioned) |
| 29 | 49 | "What happens then, without you" | **WRONG** under this doc's own steps — F5 |
| 30 | 51 | "the only thing that matters is the run count" | **STALE** — F6 (the board reads distinct stranger *users*) |
| 31 | 51-52 | Apify's Console shows runs and unique users per Actor | CORRECT at snippet grade — agent-markets.md:216-219 (see F5 for who would read it) |
| 32 | 54-55 | If strangers run it, KYC becomes worth doing and pricing is switched on | **STALE** — F8 |
| 33 | 55 | The pricing table is already written into the README | CORRECT — README.md:116-119 |
| 34 | 56-59 | A zero "would kill several ₪-thousand ceilings in this repo" | **STALE** — F13 |
| 35 | 66 | The listing says the Actor is free and pricing is planned but not enabled | Partly CORRECT — README.md:16, :106. `actor.json:5` (the Store description) says "configured", not "planned". See F9 |
| 36 | 66-67 | "It does not promise a price" | **WRONG** — F9 |
| 37 | 67-68 | The repo already shipped a product that sold a feature that did not exist | CORRECT, second-hand — research/tiktok/07-ai-money-tooling.md:54, :196 (the cited CHECKPOINT entry is no longer in the current CHECKPOINT) |
| 38 | 72-74 | The niche is not empty: Actors wrap the same `data.gov.il` endpoint, and one creator runs an Israeli-dataset family (see `docs/REJECTED.md`) | CORRECT, snippet grade — REJECTED.md:329-337, :449-453. The path is repo-root `docs/REJECTED.md`; there is no `products/apify-il-open-data/docs/REJECTED.md` |
| 39 | 74 | This publish is a measurement, not a land grab | CORRECT |
| 40 | 75 | The underlying API is free and keyless | CORRECT — `src/ckan.ts` sends no key or Authorization header; MISSION.md:207 |
| 41 | 75-76 | What it sells is English keying, typing and pagination | CORRECT — INPUT_SCHEMA.json `translateFields`, `coerceTypes`, `pageSize`; src/normalize.ts, src/ckan.ts |

Claims in the automation the document relies on:

| # | Where | Claim (short) | Status |
|---|---|---|---|
| 42 | apify-publish.yml:27-29 | "WHAT THE OWNER HAS TO DO: paste one repository secret … APIFY_TOKEN. That is docs/OWNER_STEPS.he.md step 6" | CORRECT reference — OWNER_STEPS.he.md:208-217. Incomplete: see F14 |
| 43 | apify-publish.yml:29-30 | "Until he does, every job here prints a notice and exits 0" | Mostly CORRECT — the publish job runs the guard, `npm ci`, `npm test`, `npm run build` and `validate-schema` (lines 100-123) *before* the token check, so a failure there still turns it red. LOW, and not a finding |
| 44 | apify-publish.yml:33-44 | Triggers: push to main on product paths, dispatch, daily `41 5 * * *` | CORRECT — matches README.md:169-173 |
| 45 | apify-publish.yml:69, :199 | publish never runs on schedule; count-runs never on push | CORRECT |
| 46 | apify-publish.yml:95-97 | The guard catches `pricingModel`, `pricingInfos`, `pricePerUnitUsd`, `pricingPerEvent` | CORRECT — R5 and log:63, :108 |
| 47 | apify-publish.yml:96-97 | "or any future key with 'pric' in its name" | **WRONG** (edge) — F15 |
| 48 | apify-publish.yml:115 | The suite is offline fixtures and costs seconds | CORRECT — R1 466 ms |
| 49 | apify-publish.yml:141-149, :175-177 | apify-cli 1.10.0: `push` ignores env `APIFY_TOKEN`; `login` exits 0 on a rejected token; `--no-wait-for-finish` is rejected | CORRECT per log 2026-09-07-apify-publish-and-measure.md:46-54 (cannot be re-run offline) |
| 50 | apify-publish.yml:171 | `-w 900` is 15 minutes | CORRECT |
| 51 | apify-publish.yml:248-249 | The hourly colony tick also commits under `state/colony/` | CORRECT — colony.yml:23, :80 |
| 52 | apify-publish.yml:226, :238 | The measurement path can be `git add`-ed without `-f` | CORRECT — R6 |
| 53 | apify-runs.mjs:23, :30 | With no token: one notice, exit 0, nothing written | CORRECT — apify-runs.mjs:294-301; R3 |
| 54 | apify-runs.mjs:31-32 | Actor 404: notice, exit 0, nothing written | CORRECT — apify-runs.mjs:312-325 |
| 55 | apify-runs.mjs:92-99, :240-246 | Stranger runs are visible in `/v2/actors/{id}/runs` and split by `run.userId` | **UNSUPPORTED** — F16 |
| 56 | apify-runs.mjs:48 | Apify caps a list page at 1000 | CORRECT, consistent with the rendered `/v2/store` response (`limit 1000, count 1000, total 1401`), research/rendered/apify-store-accessibility.json |

56 claims were checked: 41 in `PUBLISH.md` and 15 in the automation. 22 are not CORRECT (WRONG, STALE, UNSUPPORTED, or partly correct); 17 findings below cover them.

## Findings in detail, most expensive first

### F1 — STALE, HIGH. Steps 2, 3 and 6 describe the manual CLI deploy that CI replaced, and the doc never mentions `APIFY_TOKEN`

**Claims (lines 29-47):** "**Install the CLI and log in**, from a machine with the repo checked out: `npm install -g apify-cli` / `apify login`"; "**Push the Actor** … `apify push`"; "**Send back the Store URL.** That is the whole handover."

**What the repo says:**
- `products/apify-il-open-data/README.md:164`: "Deploying is not a manual step any more. `.github/workflows/apify-publish.yml` does it, and the only thing it needs is one repository secret named exactly **`APIFY_TOKEN`** … this is step 6 of the owner checklist". README.md:188 labels the CLI route "Deploy steps by hand (fallback)".
- `apify-publish.yml:150-162` runs `apify-cli@1.10.0 login --token "$APIFY_TOKEN"`, and `:184-192` runs `push --wait-for-finish=900` from `products/apify-il-open-data`.
- `docs/OWNER_STEPS.he.md:206-222` (step 6, parts B and C) asks the owner to create a token, paste it as `APIFY_TOKEN`, and make one Console click. It asks for no CLI, no push and no terminal.
- `src/revenue/owner-steps.ts:165`: "Converts every 'the owner must push' recurring operation into a one-time step." The early part at `:168-172` is sign-up plus `APIFY_TOKEN`.
- `logs/CHECKPOINT.md:294`: "הפעלה בפועל: בעלים מדביק `APIFY_TOKEN` + קליק 'Publish to Store'."
- MISSION.md:322-323 (rule 1): batch every unavoidable step into one checklist (`docs/OWNER_STEPS.he.md`), and "Never invent a step that isn't required."
- The doc's `npm install -g apify-cli` installs whatever version is latest. The workflow pins 1.10.0 because its three verified behaviours are version-dependent (apify-publish.yml:164-169; log:58).

**Why it costs:** the owner installs Node and a CLI and logs in from a terminal, which is work the checklist does not ask of him. And because the doc never mentions `APIFY_TOKEN`, the daily stranger count (`count-runs`) can never start: apify-runs.mjs:294-301 exits 0 and writes nothing without the token. Following this doc to the letter publishes the Actor and leaves it unmeasured.

**Proposed wording for "What the owner does":**
> Four things, all inside `docs/OWNER_STEPS.he.md` step 6. No KYC, no money, no terminal.
> 1. **Create an Apify account** at `console.apify.com`, email and password, **with the brand as the username**. The Store URL is `apify.com/<username>/israel-open-data-api` and it is public. The legal identity stays yours; the public name does not. No identity documents.
> 2. **Create a Personal API token** (Settings → Integrations 🔍) and paste it into GitHub as a repository secret named exactly `APIFY_TOKEN`. Do not paste it in chat.
> 3. **Tell me "done".** I run the `apify-publish` workflow. Pasting a secret triggers nothing by itself. I tell you when the push has finished.
> 4. **Make it public**: in the Console, Actor → Publication → *Publish to Store* 🔍 (menu names unverified from here). Leave it free and do not start KYC. Then tell me "published". I record the setup in the colony, with your message as the evidence.
>
> The CLI route (`npx apify-cli@1.10.0 login --token … && npx apify-cli@1.10.0 push`) is a fallback for when CI is unavailable. See the README, "Deploy steps by hand (fallback)".

### F2 — WRONG, HIGH. Step 5 does not tell the colony the line is live, and as written it does not reach the loop at all

**Claim (lines 43-46):** "**Tell the colony it is live**, so the loop stops treating it as blocked: `pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "…"`"

**What the repo says:**
- `scripts/colony.ts:70`: "setup-done <lineId>  Mark a line's one-time owner setup as done and queue its build goal." At `:302-311` it calls `setHumanSetupDone(…, true)`, and if the status is `awaiting_setup` it moves it to **`proposed`**, not `live`, then `enqueueGoal({ phase: "build" })`.
- MISSION.md:329-332 (rule 2): "A line becomes `live` when money lands, not when a director declares it."
- The loop does not run on the owner's machine. `.github/workflows/colony.yml:23` ticks hourly on GitHub. At `:80-99` it `git add -f state/colony` and pushes the **binary** `state/colony/colony.db` to main. Running the command locally changes only the owner's local copy (R7 shows main's copy at `awaiting_setup`, `human_setup_done 0`). The doc says nothing about committing or pushing. If he did push, the bot rewrites the same binary file every hour, and a rebase cannot merge two versions of a binary file.
- The command needs a `pnpm install` of the repo root (tsx, the native `better-sqlite3`), which the doc never mentions.
- `docs/OWNER_STEPS.he.md:224` has the owner report "צעד 6 בוצע" in chat. MISSION.md:324-326 forbids the agent from marking setup done "on our own initiative". Once the owner has confirmed, running the command with his message as `--evidence` is not our own initiative. The owner step is invented (MISSION.md:323).

**Proposed wording:** replace step 5 with: "**Tell me it is published.** I run `setup-done apify-actors --evidence "<your message, date>"` in the loop's own state on `main`. That moves the line from `awaiting_setup` to `proposed`. It becomes `live` only when money lands in the ledger."

### F3 — WRONG, HIGH. "Create an Apify account … in your own name" exposes the owner's name in the public Store URL

**Claim (line 27):** "**Create an Apify account** at `apify.com` in your own name."

**What the repo says:**
- `src/revenue/portfolio.ts:95` (the line's own `humanSetup`): "Sign up at Apify **with the brand as the username** — the Store URL apify.com/<username>/… is public". The same text is in main's `colony.db` (R7).
- `src/revenue/owner-steps.ts:170`: "Apify sign-up with the BRAND as the username (the Store URL apify.com/<username>/… is public)".
- `docs/OWNER_STEPS.he.md:22`: "בכל אתר: השם הציבורי יהיה שם מותג, לא השם שלך."
- MISSION.md:274-279: "Nothing we publish carries the owner's name, username, or personal identifiers. Not a package name, not a registry namespace…"
- `scripts/apify-runs.mjs:310` and `:332` build `actorId = ${me.username}~${actorName}` and `storeUrl = https://apify.com/${me.username}/${actorName}`. The username is the public Store namespace.

**Why it costs:** it is the one step in the doc whose result is public, and it directly breaks the owner's own verbatim instruction (MISSION.md:274).

**Proposed wording:** "Create an Apify account at `console.apify.com`, email and password. The legal identity is yours, but **the username must be the brand**: the Store URL is `apify.com/<username>/…` and it is public. No identity documents at this stage."

### F4 — WRONG, MEDIUM. "No owner time beyond account creation"

**Claim (lines 13-14):** "Publishing it costs no build hours, no money, and no owner time beyond account creation".

**Evidence:** the same document then lists six owner steps (lines 27-47): account, CLI install and login, push, Console publish, colony command, sending the URL. Even on the CI path the owner creates a token, pastes a secret and makes one Console click (OWNER_STEPS.he.md:206-222; README.md:142-150). The agent-markets audit (:222-228) and the productized-services audit (:489-490, "Zero owner involvement") say that no *KYC* is needed; neither says the owner does nothing beyond account creation.

**Proposed wording:** "Publishing it costs no build hours and no money, and about five minutes of owner time: an account, one token pasted as a GitHub secret, and one click in the Apify Console (`docs/OWNER_STEPS.he.md` step 6)."

### F5 — WRONG, HIGH. "What happens then, without you": under this doc's steps the count needs a human

**Claim (lines 49-52):** "What happens then, without you … Apify's Console shows runs and unique users per Actor."

**Evidence:**
- The only automated count is `count-runs` in apify-publish.yml:198-221, and it needs `APIFY_TOKEN` (apify-runs.mjs:294-301). This doc never asks for the token (F1).
- Without the token the Console is the only reading. The colony cannot read it: `agent-markets.md:161-172` says "`apify.com` **and** `api.apify.com` are EGRESS_BLOCKED from the container … Either the owner reads the dashboard (a recurring manual op MISSION forbids)…"
- There is also no path from the measurement file into the colony's decision. `portfolio.ts:44` says "a daily stats job writes strangerRuns30d and strangerUsers30d through recordKpi", but no code outside `portfolio.ts` references either KPI, and `src/revenue/connectors/apify-stats.ts`, planned at CHECKPOINT.md:264, does not exist (R9). `apify-runs.mjs` writes `state/colony/measurements/apify-runs.json`, and nothing reads that file.
- The sub-claim "Console shows runs and unique users" is supported only at snippet grade (agent-markets.md:216-219: "builds and runs, total users, active users (7/30/90 days)").

**Proposed wording:** "Once `APIFY_TOKEN` is set, a GitHub Actions job (`apify-publish.yml`, `count-runs`, daily 05:41 UTC) writes `state/colony/measurements/apify-runs.json` to `main`. You read nothing. (Open gap: the colony does not yet read that file into its KPIs, so the day-30 decision is taken by hand from that file.)"

### F6 — STALE, MEDIUM. The board reads distinct stranger users; the doc (and the script) count runs

**Claim (line 51):** "For 30 days the only thing that matters is the run count from people we did not tell."

**Evidence:**
- `research/colony-sweep/BOARD.md` §6.3.1 (:267-273): "Readout rule: `strangerUsers30d` = distinct users minus the brand account. Under 10 stranger users at day 30…" BOARD.md:328 sets the re-open triggers at "50 / 50 / 200 stranger **users**".
- `portfolio.ts:73`, `:80-81`: the kill and scale criteria are all on `strangerUsers30d`.
- `apify-runs.mjs:130-200` (`summariseRuns`) outputs `runsLast30Days`, `strangerRunsLast30Days` and `byStarter` (runs). It computes **no distinct-user count**. The workflow's commit subject and summary (apify-publish.yml:244, :272-279) report runs only. One stranger running the Actor 20 times reads as 20.

**Proposed wording:** "For 30 days the only thing that matters is how many **distinct people who are not us** run it. The board's readout is `strangerUsers30d` (BOARD.md §6.3.1), not the run count."

### F7 — STALE, MEDIUM. ₪3,000 is no longer the `apify-actors` target

**Claim (lines 15-16):** "₪3,000 (`apify-actors` target)".

**Evidence:** `src/revenue/portfolio.ts:84-87`: "Board §3: RETARGET ₪3,000 → ₪200", and `targetMonthlyAgorot: agorotFromIls(200)`. TARGET_BASIS (`portfolio.ts:272-278`) says: "There is no argument for ₪3,000 the board was willing to sign". Main's `colony.db` has `target_monthly_agorot 20000` (R7). `docs/REJECTED.md:1214` records `apify-actors | ₪3,000 | **₪200**`.

**Proposed wording:** "… every Apify estimate in the repo at once: ₪200 (the `apify-actors` target, retargeted from ₪3,000 by the board), ₪1,500 (the `store-promotion` audit, kept as the contested upper bound) and ₪200 (the `agent-markets` audit)."

### F8 — STALE, MEDIUM. "If strangers run it … KYC becomes worth doing, and pricing gets switched on"

**Claim (lines 54-55).**

**Evidence:**
- BOARD.md §6.3.1 and :328, and `portfolio.ts:73`, `:80-81`, set the thresholds. Under 10 stranger users at day 30, the line stays an instrument: no second Actor and no KYC request. 10-49: keep counting. **50+**: one more Actor, and KYC is put to the owner. **200+**: "pricing is designed". So pricing is not simply switched on from the existing README table, and at 200+ the listing "must state that the source is free at `data.gov.il`".
- A pricing switch is itself slow: "'significant changes' (switching pricing model, raising prices, adding paid events) require a 14-day notice, are limited to once per month per Actor" (research/colony-sweep/scouts/risk-governance--automation-tos.md:95).

**Proposed wording:** "**If 50 or more strangers run it in 30 days:** Apify KYC is put to you as the next step. At 200 or more, pricing is designed, and the listing must say the source is free at `data.gov.il`. Between 10 and 49, we keep counting. Under 10, the line stays a measuring instrument (BOARD.md §6.3.1)."

### F9 — WRONG, MEDIUM. "It does not promise a price": the listing states future prices, and in two places says users are charged

**Claim (lines 66-67):** "The listing says the Actor is free and that pricing is planned but not enabled. It does not promise a price, because the listing cannot carry one yet".

**Evidence:** the listing is `README.md` (`actor.json:13` `"readme": "../README.md"`), the Store description (`actor.json:5`) and the input schema.
- README.md:108: "The table below is the pricing that will be turned on later, published here so nobody is surprised by it", followed by `$0.005` / `$0.002 (= $2 per 1,000 records)` at :116-119, and at :123 "Tip: 1,000 companies for $2".
- `.actor/INPUT_SCHEMA.json:40` (`maxRecords`): "You are charged only for what is returned." README.md:37 says the same thing ("You are charged only for returned items"). On a free Actor this is present-tense and untrue.
- `actor.json:5`: "pay-per-event pricing is **configured** but not enabled". Pricing is not configured anywhere on Apify. `ppeEvents` is documentation only (apify-publish.yml:88-93).
- The board's threshold for designing pricing is 200 stranger users (F8), so the README table is not yet the board's price.

**Proposed wording:** "The listing says the Actor is free, and shows a *suggested* future price table that is not enabled. Two strings still read as if users are charged today, and should be fixed before publishing: `INPUT_SCHEMA.json` `maxRecords` ('You are charged only for what is returned') and the `actor.json` description ('pricing is configured')."

### F10 — WRONG, LOW. ₪500 is not either audit's figure

**Claim (line 16):** "₪500 and ₪200 (the two audits above)".

**Evidence:** "the two audits above" are productized-services and agent-markets (lines 6-7). Agent-markets gives ₪200 (agent-markets.md:43, :460). The productized-services audit gives **₪0 net-new**, rising to ₪150–250 at 12 months only if four gates clear (productized-services.md:68, :296-311, :333). The ₪500 is that group's *supervisor* headline, which the same audit refutes: "## 2. The group headline ("₪500/month") — **REFUTED as a portfolio number**" (:314).

**Proposed wording:** "₪0 net-new (productized-services, ₪150–250 only if four gates clear) and ₪200 (agent-markets)".

### F11 — UNSUPPORTED, LOW. Console menu path given as fact

**Claim (line 41):** "Actor → Publication → *Publish to Store*". The repo's own owner checklist marks the menu names unverified: OWNER_STEPS.he.md:24-26 ("🔍 … שמות התפריטים וסדר הלחיצות — לא [אומתו]") and :221 ("Publish to Store 🔍"). No rendered Apify page in `research/rendered/` covers it; the only Apify file there is a `/v2/store` search result. README.md:150 and apify-publish.yml:180-182 repeat the same path without a source. "Leave the pricing model as **Free**" assumes a pricing selector in that flow, which nothing in the repo shows.

**Proposed wording:** add "🔍 menu names are not verified from here; look for the function *publish to Store*, not the exact words."

### F12 — WRONG (wording), LOW. "none of it is reversible in a way that matters"

**Claim (lines 24-25).** Read literally this says nothing can be undone, the opposite of the reassurance intended. The one step whose effect is sticky and public is the choice of username (F3).

**Proposed wording:** "…and nothing here is hard to undo, except the Apify username, which becomes part of the public Store URL. Choose the brand name."

### F13 — STALE, LOW. "several ₪-thousand ceilings … rest on the opposite assumption"

**Claim (lines 57-59).** The board has already cut them. The committed portfolio is `apify-actors` ₪200, `il-biz-tools` ₪400, `oss-bounties` ₪300 and `pcn874` ₪600, ₪1,500 in total (portfolio.ts:87, TARGET_BASIS; CHECKPOINT.md:242, :272; R7). The only ₪-thousand Apify figure left is the ₪1,500 *contested upper bound* (portfolio.ts:278).

**Proposed wording:** "…it settles the ₪1,500 contested upper bound the board refused to commit to (`TARGET_BASIS['apify-actors']`), and it tests the assumption that platform search delivers a first user at all (MISSION constraint 7)."

### F14 — MEDIUM (workflow). Pasting `APIFY_TOKEN` alone publishes nothing

**Claims:** apify-publish.yml:27-29 says "WHAT THE OWNER HAS TO DO: paste one repository secret named exactly APIFY_TOKEN". `src/revenue/owner-steps.ts:170` says: "This alone starts the 30-day stranger count".

**Evidence:** the `publish` job runs only on a push to `main` touching `products/apify-il-open-data/**` or the workflow file, or on `workflow_dispatch` (apify-publish.yml:33-39; `if: github.event_name != 'schedule'` at :69). Adding a secret is neither. The daily schedule runs only `count-runs`, which on an unpushed Actor takes the 404 path at apify-runs.mjs:316-322: a notice, exit 0, nothing written. That repeats every day, and green checks hide it. `origin/main` has no measurement yet (R8). Someone has to dispatch the workflow once, and no document names who. OWNER_STEPS.he.md:222 implies the agent does.

**Proposed wording (workflow header):** "WHAT THE OWNER HAS TO DO: paste APIFY_TOKEN (OWNER_STEPS step 6). Adding the secret does not trigger this workflow: after it is set, run it once by hand (Actions → apify-publish → Run workflow). The agent does this. Then make the Actor public with one Console click."

### F15 — WRONG (edge), LOW. The pricing guard does not catch "any future key with 'pric' in its name"

**Claim (apify-publish.yml:96-97).** The regex `"[A-Za-z0-9_]*[Pp]ric[A-Za-z0-9_]*"` is case-sensitive apart from the first `P`, and excludes `-`. R5: `PRICE_USD` and `unit-price` pass unflagged; only `pricingModel` matches. The named examples are all caught (R4, R5, log:108).

**Proposed wording:** "…or any future camelCase or snake_case key containing `pric`/`Pric` (not upper-case or hyphenated keys)". Or make the grep case-insensitive and allow `-` in the class.

### F16 — UNSUPPORTED, HIGH. The stranger split assumes the Actor's runs list includes other accounts' runs, and the repo never shows that

**Claims:** `scripts/apify-runs.mjs:92-99`: "`userId` on a run is the account that started it, so subtracting our own id is the honest split". The whole script also assumes `GET /v2/actors/{username~name}/runs`, called with the *owner's* token, returns runs that *strangers* started. `PUBLISH.md` line 51 ("the run count from people we did not tell") depends on this, and so does README.md:183-186.

**Evidence that nothing in the repo supports it:**
- apify-runs.mjs:240-243: "This container cannot reach api.apify.com at all … neither path could be exercised against the real service here".
- logs/2026-09-07-apify-publish-and-measure.md:22-23 checked only the response *shape* (`data.items`, `userId`, `meta.origin`) through Context7. :117-119 says: "מה שלא ניתן היה לאמת … תשובת ה-API האמיתית". The own/stranger test (:110) ran against a mocked API.
- The only rendered Apify data in the repo, `research/rendered/apify-store-accessibility.json` (from `https://api.apify.com/v2/store`, fetched by render-watch from a runner), exposes public per-Actor aggregates instead: `stats.totalUsers30Days`, `stats.totalUsers7Days` and `stats.publicActorRunStats30Days`. The script uses none of them.

**Why HIGH:** if the runs list is scoped to the caller's own runs, `strangerRunsLast30Days` is 0 by construction. The script would then commit a "real zero" to `main` (apify-runs.mjs:34-35), and the owner and board would read it as "nobody wanted it". That is the confident-looking zero the script's header (:26-32) says it exists to prevent, and it would end the line under the "under 10 at day 30" rule. This is flagged UNSUPPORTED, not WRONG: the repo holds no rendered statement either way.

**Proposed wording / fix (do not apply):** state it as an assumption in apify-runs.mjs and README.md:183. Also take the board's metric from the public Store aggregate, which the repo has rendered evidence for: `GET /v2/store?search=israel-open-data-api`, then that item's `stats.totalUsers30Days`, minus 1 if the brand account ran it. Record both numbers until the first real response settles which one sees strangers.

### F17 — note, LOW. The `docs/REJECTED.md` reference is repo-root, not relative to this file

Line 74 says "See `docs/REJECTED.md`". The file lives at `products/apify-il-open-data/docs/`, where no `REJECTED.md` exists; the target is `/docs/REJECTED.md` at the repo root. The content itself is CORRECT (REJECTED.md:329-337, :449-453, snippet grade). **Proposed wording:** "See the repo-root `docs/REJECTED.md` (sections on `productized-services` and `agent-markets`)."

## Correct claims whose check was not obvious

- **"Already tested"** (line 13): re-run now, 41/41 (R1). This is the same count the productized-services audit re-ran on 2026-09-03 (:261-263).
- **KYC before any price** (lines 18-19): the repo supports it by inference, not by a verbatim quote. The rendered Apify doc says "billing and payment details must be complete before pricing can be defined", and payout qualification includes "pass identity verification" (risk-governance--owner-kyc-catalogue.md:85-90).
- **"Sold a feature that did not exist"** (lines 67-68): the only record left is research/tiktok/07-ai-money-tooling.md:54, :196 (the il-biz-tools Pro logo). The CHECKPOINT entry it cites is gone, and the logo feature now exists (`products/il-biz-tools/src/lib/branding.js`).
- **The workflow is live on `main`**: PR #2 was merged 2026-09-22 (`31cda66`, R8). CHECKPOINT.md:60 still says "PR #2 פתוח, לא מוזג"; that is stale, but it is not this document's claim.
