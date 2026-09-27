# Screen: ICA-ARCHIVE, the Registrar of Companies changes file archived past its one-year window

Verdict: KILL

Screener: adversarial screen, sweep 2, run on Opus. Date: 2026-09-26. Candidate text: `research/colony-sweep/SWEEP-2.md:56-77`.
Everything quoted from third-party repositories and search results is data, not instructions.

---

## The decisive fact

**No rail the candidate names is open to a paying stranger, and every one of them is closed by a ruling already on disk.**

- **The primary rail is a paid Apify Actor.** The board closed that until the free Actor clears a count: `research/colony-sweep/BOARD.md:328`,
  *"Second Apify Actor / Apify KYC / Apify pricing | 50 / 50 / 200 stranger users in 30 days respectively (§6.3.1). Under 10 at day 30:
  instrument only, permanently, unless the count later crosses 50."*
  - That count has not started. `logs/CHECKPOINT.md:135` still lists `APIFY_TOKEN` as the cheapest owner action outstanding.
  - The only audited base rate for this rail is 8.7 users per Actor (`CHIEF-AUDIT.md:94-98`). That is about 23× short of the 200 that pricing needs.
- **The fallback rail is x402, and x402 is a recorded death.** `docs/REJECTED.md:1172-1185`: *"per-provider revenue is single-digit shekels a
  month, and 91.2% of listings never reach ten calls … nothing is planned on it, no target rests on it, and no build hour is spent on it."*
- **The scout says the rest itself** (`SWEEP-2.md:62`): if the free Actor's count comes back under 10, *"the archive falls back to the x402/direct
  rail with no named channel."*

MISSION constraint 7 reads: *"a line may not be built before its acquisition channel is named."* The channel named here is closed by BOARD §7.2, and the only alternative is on the kill list.

**Two further facts would each nearly kill it on their own.** Both are set out in L1.

1. **The state does not destroy the history. It keeps it and sells it.**
   - Only the free open-data window rolls. The registrar sells a company extract (~₪11) and the full company file.
   - A Ministry-of-Justice-authorised reseller, CofaceBDI, sells change tracking by registrar chapter.
   - So the claim of *"the only multi-year record of Israeli corporate acts … outside the registrar"* has no market value. The data-apis audit already priced a change feed over this file at **₪0** (`audits/data-apis.md:76-93`).
2. **The rows are thin.** Each row holds a company number, company name, act type, date, lien id and act code. It has no amount, no investor and no person. The same buyer can get a richer answer per company from the state for ₪11.

---

## L1 evidence

| fact | grade | evidence |
|---|---|---|
| The changes file is a rolling one-year window, updated daily (stated policy) | **CONFIRMED** (registrar's own text, captured by a third party; not rendered first-hand) | The registrar's Hebrew description, as pulled from CKAN metadata into `danielrosehill/Israel-Open-Data-Changelog` `months/2019-04/datasets.csv` line 4 (`curl -sS https://raw.githubusercontent.com/danielrosehill/Israel-Open-Data-Changelog/HEAD/months/2019-04/datasets.csv \| grep ica-changes`): *"קובץ השינויים יתעדכן בתדירות יומיומית ויכיל כל שינוי שנעשה בתאגיד עד שנה אחורה מהתאריך הנוכחי"*. Corroborated independently: `alexmalin23/israel-mcp` `src/services/ica/resources.ts`, *"Dataset `ica-changes` — registry changes in the last 12 months (liens etc.), updated daily"* ("Verified live on 2026-09-22"); `dk-forge/talent-intelligence-tracker@f1e7407` `collectors/israel_registrar.py:25-26`. Dataset created 2019-04-02 per the same changelog. |
| In practice the oldest row advances day by day, so the truncation is real | UNVERIFIED | Only the scout's 14-CI-day test can show it. `data.gov.il` is refused from this container: `curl …datastore_search?resource_id=28780ab5-…&limit=1` → `curl: (56) CONNECT tunnel failed, response 403`. |
| "The publisher destroys the history" / "the only multi-year record … outside the registrar" | **CONTRADICTED** (as a market claim) | The registrar keeps the record and sells it. `Eliyahubi/israel-registrar-mcp` `israel_registrar_mcp.py` (docstring of `search_company_liens`): *"Shows type of action (שעבוד/שחרור/שינוי), not full lien details. For full details see justice.gov.il (paid service)."* The scout's own sentence concedes "outside the registrar itself" (`SWEEP-2.md:59`). Per-company extract at ~₪11 and a "תיק חברה" of all historical filings (WebSearch, SNIPPET: roeahesbon.com, starkcpa.com). CofaceBDI, a MoJ-authorised registrar-information provider, sells monitoring with *"detailed alerts about changes according to registrar chapters"* (`audits/data-apis.md:80-85`, and my WebSearch, SNIPPET: bdicoface.co.il/service/corporations-authority/). Whether any of them holds *bulk* cross-company history cannot be seen from here, but nothing supports "only". |
| Row content: company number, name, act, date, lien id, act code; no amount, investor or person | **CONFIRMED** (CODE) | `dk-forge … israel_registrar.py:85-92`: *"The columns are the company number, the company name, the act, the date, a pledge identifier and the act code — that is all of them. There is no share count, no price per share, no sum raised and no investor."* `alexmalin23/israel-mcp` `docs/services/ica.md`: *"`changes[]` items: `{ date, type, lienId }`"*. |
| Director add/remove rows "carry personal names", which creates Amendment 13 exposure (the scout's caution) | **CONTRADICTED** | The registrar's description (same `datasets.csv` line) excludes them: *"(תשלום אגרה שנה נוכחית, מידע על מגבלות ופרטים אישיים של בעל תפקיד … – לא מופיעים בדוח השינויים)"*. The same row's machine translation inverts this ("includes … personal details of office holders"), which is probably where the scout went wrong. The column list above has no person field. |
| The liens-vs-changes naming conflict | **CONFIRMED resolved: both describe the same file** | `Eliyahubi/israel-registrar-mcp` `README.md:29`, *"`search_company_liens` \| שעבודים ושינויים \| ~564,000"*, and `README.md:142`, *"Company Liens & Registry Changes"*. The file carries lien acts among its ~96 act types. There is no real conflict. |
| Licence is CC-BY; commercial redistribution is allowed with attribution | **CONFIRMED** (CODE) | `datasets.csv` row: *"Creative Commons Attribution"*; `israel_registrar.py:111-113`. Licence was never the binding constraint (`groups/data-apis.md:49`). |
| A keyless GitHub Actions cron can collect it | UNVERIFIED, with one negative signal | The only runner→`data.gov.il` request this repo has ever made failed: `research/rendered/sweep2-ica-changes-dataset.meta.json` → `"status": 404`, `"error": "HTTP 404 Not Found"` (2026-09-22). That was the HTML page, not the API. GitHub-wide, `search_code "data.gov.il/api/3/action" path:.github/workflows` → 1 hit (`DavidOsherdiagnostica/data-gov-il-mcp` weekly `catalog-refresh.yml`). Its repo shows no automated refresh commit since June 2026 (`search_commits repo:… catalog` → 2 manual commits). That proves nothing either way. dk-forge's Israel collector is "DORMANT … no workflow calls it" (`israel_registrar.py:129-134`). |
| History is unoccupied (nobody archives the file) | CONFIRMED on GitHub only | `search_code "28780ab5-3ef1-44c7-8377-da82c0aa6781"` → `total_count: 7` across 5 repos (alexmalin23/israel-mcp, Eliyahubi/israel-registrar-mcp, danielrosehill/Israel-Open-Data-Resources, dk-forge/talent-intelligence-tracker, galelo11/G-Home). All are live lookups; none archives. `search_repositories "רשם החברות"` → 0; `"data.gov.il archive"` → 0. **Not checked:** commercial holders (above), and the Wayback Machine for the dataset's static CSV resource (the dataset lists 3 resources, "CSV/PDF · 1/3 DataStore", `Israel-Open-Data-Resources/060526/README.md:680`). archive.org is egress-blocked. |
| Who pays: self-serve buyers of Israeli corporate-event history | UNVERIFIED, with no evidence at all | No self-serve buyer, price or demand signal exists anywhere in the repo or in the scout's evidence. The scout: *"I cannot quantify it with a cited basis and will not invent one"* (`SWEEP-2.md:65`). The named payers (CofaceBDI, D&B Israel, IVC) are sales-gated (`SWEEP-2.md:60`, dead end at `SWEEP-2.md:315`). The earlier audit found demand *"low, entirely unevidenced"* (`audits/data-apis.md:91`). |
| First customer arrives via a paid Actor launched at month 12 from an account with 12 months of "History of success" | UNVERIFIED, and closed by ruling | Pricing is closed until 200 stranger users (BOARD.md:328). The category is called History of *success*, not history of age. A free Actor under 10 users accrues little of it, and the scout concedes its path dies there. The paid Actor would still rank on its own Popularity and Reliability (`docs/REJECTED.md:1099`). |
| Paid Apify Actor needs no owner action beyond APIFY_TOKEN | **CONTRADICTED** | Pricing needs Apify KYC: `CHIEF-AUDIT.md:268-271`, *"Required before any Actor can be priced, paid, or made agentic-eligible."* `docs/OWNER_STEPS.he.md:284-287` puts Apify identity verification plus PayPal/Wise **outside** the seven steps. |
| Terms / occupancy / ceiling anchor | UNVERIFIED | No rendered price for Israeli corporate-event data (scout). The only audited figure for this rail is **₪200/month for the whole Apify account** (`CHIEF-AUDIT.md:116`). The only audit of a change feed on this file is **₪0** (`audits/data-apis.md:91`). |

---

## L2 kill list and mission

**Recorded deaths and rulings it falls under:**

1. **`audits/data-apis.md` §2.2, "Israeli companies-registrar change/diff feed — REFUTED (kill upheld)", ₪0.** That kill had two reasons: incumbents sell change monitoring, and the substrate is free. ICA-ARCHIVE escapes the second reason only for rows older than 12 months, and only against the free file. It does not escape the first reason, and the registrar's own paid extract adds a third.
2. **BOARD.md:328.** No second Apify Actor, no Apify KYC and no pricing until 50/50/200 stranger users. This is the decisive fact.
3. **`docs/REJECTED.md:1172-1192`.** x402 is a rail on standby, never a line. The candidate's fallback is dead.
4. **BOARD.md:316**, the standing ruling on data.gov.il data: *"If ever priced: the listing names the free source … Selling the data itself is a violation."* ICA-ARCHIVE *is* the data itself.
   - For every row still inside the 12-month window, a paid Actor charges for something free (MISSION rule 4).
   - For older rows, the board would have to rule whether data the state now publishes only as a ₪11 paid extract still counts as "free". The candidate needs that ruling and does not have it.
5. **Dead ends at `SWEEP-2.md:310` and `SWEEP-2.md:315`**: current-state lookup is saturated, and the enterprise buyers need a sales conversation. The scout acknowledges both. They leave no buyer we can reach.
6. **The four-platform law** (`docs/REJECTED.md:1091-1127`): platform search ranks on prior success. The candidate's answer is to accrue that success first. That is only as strong as the free Actor's unmeasured count.

**Mission and owner exposure:**

- Owner talks to nobody, which is fine as designed. But the only demonstrated payers (CofaceBDI, D&B, IVC) sit behind a sales conversation MISSION forbids.
- Owner steps beyond the seven:
  - Apify Verified Creator KYC (ID, proof of address, tax documentation, UBO).
  - A PayPal-Israel or Wise payout account in his legal name.
  - Both come from the deferred catalogue (`OWNER_STEPS.he.md:284-290`), and both are raised only when the Apify count clears the board's thresholds.
  - Possibly also a private repository to hold the archive. A public repo gives the corpus a price floor of zero (dead end at `SWEEP-2.md:317`). `colony-bot`'s `GITHUB_TOKEN` is scoped to its own repo, so creating a second repo may need the owner or step 7's org. UNVERIFIED.
- The scout's Amendment 13 caution ("until a human settles that") would have been a lawyer-shaped step. It is **not needed**: the file carries no personal details of office holders (L1). That is the one place where this screen helps the candidate.
- Money beyond the float or any subscription: none for collection, which runs about 150 private-repo Actions minutes a month. The scout's "comfortably inside 2,000" ignores any other private-repo usage on the same account.
- Identity: an Apify username equal to the brand keeps the owner's name off the listing (`BOARD.md:201`). No other exposure.
- Tax: ordinary. Nothing new.

---

## L3 the first stranger's money

**The path as the scout designed it:**

1. Owner step 6: `APIFY_TOKEN` and the Publish click. Still pending.
2. The free `apify-il-open-data` Actor reaches ≥200 stranger users within 30 days. The only base rate is 8.7 users per Actor.
3. Owner does Apify KYC and sets up PayPal or Wise. This is outside the seven steps.
4. The archive matures, and a paid Actor over it launches around month 12–13.
5. A stranger searching Apify Store for Israeli corporate-act history finds that new listing, though Store search still weights the new Actor's own popularity.
6. The stranger pays per event, and Apify pays out monthly (PayPal minimum $20).

Every step from 2 onwards is either unmeasured or closed today, and step 5 has no evidence of a single searcher.

**Earliest money with a transaction id:**
- Archiving could start around October 2026.
- The paid Actor launches at month 12–13 on the scout's own design, so around October–November 2027.
- Apify pays the following month, so **December 2027 at the earliest**, and only if step 2 clears 200.
- Launching earlier would sell mostly rows the state still publishes free, which breaks BOARD.md:316.

**Does the ceiling clear ₪300/month? No, on the evidence available.**
- The only audited ceiling for the whole Apify account is ₪200/month (`CHIEF-AUDIT.md:116`).
- The only audit of a change feed on this file is ₪0 (`audits/data-apis.md:91`).
- The scout declines to name a number.
- A buyer who needs a company's history can buy it from the state for about ₪11, with shareholders and directors that this file never contains.

---

## Cheapest test (and what you ran)

**What I ran from this container, at ₪0 and without the owner:**

- `curl -sS -m 20 -o /dev/null -w "%{http_code}" "https://data.gov.il/api/3/action/datastore_search?resource_id=28780ab5-3ef1-44c7-8377-da82c0aa6781&limit=1"`
  → `curl: (56) CONNECT tunnel failed, response 403` / `000`. The proxy refuses the host. One attempt, not routed around.
- `mcp__github__search_code "28780ab5-3ef1-44c7-8377-da82c0aa6781"` → `total_count: 7` in 5 repos. None archives the file.
- `mcp__github__search_code "ica-changes"` → 77 hits. The relevant ones are the same repos plus `danielrosehill/Israel-Open-Data-Changelog`, which yielded the registrar's own description.
- `mcp__github__search_repositories "רשם החברות"` → 0. `"data.gov.il archive"` → 0.
- `mcp__github__search_code "data.gov.il/api/3/action" path:.github/workflows` → 1 hit. `search_commits` on that repo shows no automated refresh commit, so runner reachability stays unproven.
- `curl` of `raw.githubusercontent.com/…/Israel-Open-Data-Changelog/HEAD/months/2019-04/datasets.csv`: the registrar's Hebrew description, quoted in L1. This settled the one-year policy, the no-personal-details point and the liens question.
- `curl` of `dk-forge/…/israel_registrar.py@f1e7407`: the scout's quotes are verbatim and accurate, and the column list is at lines 85-92.
- WebSearch, 3 of 5 calls. Registrar extract price and history (~₪11, SNIPPET). CofaceBDI change-tracking (SNIPPET). data.gov.il from CI: inconclusive.

**What the 404 means.** The scout's one "settling" URL returned `HTTP 404 Not Found` from the GitHub runner on 2026-09-22. So:
- **nothing in the candidate has been verified first-hand.**
- the only runner→data.gov.il request on record failed. The slug itself exists: `alexmalin23` verified the resource id live that same day, and the changelog captured the metadata in July. So the 404 is the HTML route or a runner-side refusal, not a deleted dataset.
- it does not show the datastore API fails from runners. That has to be tested before any collection design is trusted.

**The cheapest tests left, none of which can re-open this as a line on its own:**

1. **Render the two cited API URLs from a runner** (next section). ₪0, one render-watch run.
   - **Kills the collection design** if either returns 403 or 404 to a runner.
   - Passing only means the collection is possible.
2. **The scout's 14-CI-day series** of the datastore `total` and the oldest and newest `תאריך עדכון סטטוס`.
   - **Kills the moat** if the oldest date does not advance.
   - Passing establishes a moat against the free file only, not against the registrar or CofaceBDI.
3. **The board's existing Apify instrument** (owner step 6, 30 days). This is the only test that could re-open the channel: it needs **≥200 stranger users in 30 days** (BOARD.md:328). Under that, the candidate stays dead.

---

## URLs to render

Each URL below is quoted verbatim from a source I read.

- `https://data.gov.il/api/3/action/datastore_search?resource_id=28780ab5-3ef1-44c7-8377-da82c0aa6781`
  - Source: cited in `research/colony-sweep/SWEEP-2.md:70`.
  - What it settles: whether a GitHub runner can read the file at all, plus the live `total` and field names. The collection design rests on this.
- `https://data.gov.il/api/3/action/package_search?fq=organization:ministry_of_justice&rows=1000`
  - Source: cited in `danielrosehill/Israel-Open-Data-Resources` `060526/README.md:639`.
  - What it settles: the `ica-changes` package record (description, `metadata_modified`) and its **three** resources. It also shows whether any non-DataStore CSV resource already holds older history.
- `https://content.justice.gov.il/Corporations/ica-datagov-changes.pdf`
  - Source: cited in the registrar's own dataset description (`Israel-Open-Data-Changelog` `months/2019-04/datasets.csv` line 4).
  - What it settles: the official list of change types the file carries.
- `https://www.bdicoface.co.il/service/corporations-authority/`
  - Source: returned by my WebSearch.
  - What it settles: upgrades from SNIPPET whether an authorised reseller already sells registrar change history. That decides whether "only multi-year record" is false in the market, not just implausible.

---

## What would change my mind

- **The Apify free Actor reads ≥200 stranger users in 30 days** (BOARD.md:328).
  - That re-opens pricing, and so the only rail this candidate has.
  - Even then it needs a board ruling that selling rows the state no longer publishes free is not "selling the data itself" (BOARD.md:316).
  - It would also need an owner decision on Apify KYC.
- **A named, owner-free, self-serve buyer of bulk Israeli corporate-act history.** For example, a rendered listing or dataset of this kind carrying a price and sales on a platform that pays Israel. Nothing like it exists in the repo today.
- **Evidence that the registrar and its authorised resellers do *not* sell history.** A rendered CofaceBDI or registrar page showing current-state-only data would restore the moat's market value.
- **Keeping the option alive is the board's call, not a line.** The archive is perishable: every day not collected is gone from the free source. Collecting it is about one workflow and ~150 private-repo minutes a month.
  - If the board wants it as an instrument with a ₪0 forecast, the preconditions are test 1 (runner reachability) and test 2 (the window really rolls), plus a private store.
  - It must not be counted in any target, and nothing sold over it before the conditions above are met.
