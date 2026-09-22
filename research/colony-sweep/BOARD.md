# BOARD DECISION — the revenue colony after the fifteen-group sweep

Board: Fable 5.1, board-only wave. Date: 2026-09-07. Branch `claude/monthly-income-plan-pfs7vu`.
Read in full, in this order and nothing else: `MISSION.md`; `research/colony-sweep/CHIEF-AUDIT.md`;
`src/revenue/portfolio.ts`; `docs/INCOME_PLAN.he.md` §6 and `docs/OWNER_STEPS.he.md`; the headings and first
paragraph of every section of `docs/REJECTED.md`; `products/README.md` and `state/colony/REPORT.md`. The
`groups/` and `audits/` directories were deliberately not opened: two earlier boards died re-reading them, and
the chief audit's numbers are taken as authoritative here. Where this board disagrees with the chief audit it
says so and says why; it does not re-derive its ceilings.

Evidence this board generated itself (structural, from disk): `state/colony/REPORT.md` still says "measured
₪6,500" against a `TARGET_BASIS` that grades nothing measured; `.github/workflows/` holds no Apify publish job
and `products-ci.yml` only builds; `src/revenue/connectors/` holds gumroad, lemonsqueezy, stripe and x402-local
readers and no Apify stats reader; `.claude/agents/` is empty; `rails.ts` carries Gumroad as `rendered` and
Freemius as `snippet`; `growth.ts` exports `storesNeededFor`, `checkHonestStorePlan` and the audited-ceiling
table. Nothing below is a WebSearch result.

---

## תקציר מנהלים לבעלים

**המצב.** הלדג'ר ריק: ₪0. 121 קריטריונים נסרקו ו-15 קבוצות בוקרו. אחרי הביקורת נשארו שישה קווים שיחד שווים
**כ-₪2,200 לחודש בעוד 12 חודשים**, ו-₪0 בחודש הראשון. זה 11% מהיעד. אף קונה לא נמדד עדיין — לא באף קו.

**מה נבנה עכשיו, לפי סדר.** (1) פרסום `apify-il-open-data` חינם דרך CI וספירת הרצות של זרים במשך 30 יום;
(2) מסנן באונטי ב-Algora ו-PR ראשון מחשבון GitHub של המותג; (3) מחולל PCN874 — הקו היחיד שקהלו נוצר בחוק;
(4) פריסת `il-biz-tools` עם Gumroad במקום Paddle ומדידת ביקורים; (5) רישום `mcp-il-tools` ב-MCP Registry
והפצה דרך GitHub; (6) דף אגרת רשם החברות. הכול נבנה בתוכנה בלבד.

**מה נסגר.** `telegram-bots` (KYC עם סלפי — מתנגש במנדט), `templates` (Etsy), `dev-extensions`,
`hebrew-content`, `paid-apis` ו-`agent-services` (x402: כ-₪6 לספק לחודש). `apify-actors` יורד ל-₪200,
`il-biz-tools` ל-₪400, `oss-bounties` ל-₪300, ונוסף `pcn874` ב-₪600. סכום היעדים: **₪1,500**, לא ₪16,500.

**החשבון הכן.** ₪20,000 דורש פי 9 ממה שנמדד. מיליון בשנה דורש 1,200–3,300 חנויות נפרדות לפי הנוסחה
ב-`MISSION.md`, ומהסריקה יצאו שש. עם הראיות הקיימות היעדים אינם ניתנים להשגה. מה שיכול לשנות את המספר —
מוצר באנגלית לחובה חוקית (EAA) והפצה דרך GitHub — נמדד קודם, לא נבנה קודם.

**הצ'קליסט שלך.** שבעה צעדים נשארים שבעה, בסדר מתוקן: 1, 2, 3, 5, 7, 4, 6 — וטוקן Apify (חצי מצעד 6) מיד אחרי 1. תיקון מהותי אחד: PR-ים של
באונטי יוצאים מחשבון GitHub של המותג, לא משלך. רואה חשבון ו-Paddle — לא ברשימה. דומיין `.com` עם הסתרת WHOIS.

---

## 1. Standing facts this board rules on

| Fact | Value | Source |
|---|---|---|
| Money in the ledger | ₪0, 0 rows | chief audit, read from `colony.db` |
| Audited survivors | 6 lines, ₪2,200/month at month 12 (₪3,500 if Apify's contested ₪1,500 holds) | chief audit §2.1 |
| Month one, every line | ₪0 | chief audit §2.1 |
| Targets currently in `portfolio.ts` | 9 lines, ₪16,500 summed; graded 0 measured / 6,000 inferred / 7,000 unevidenced / 3,500 contradicted | `TARGET_BASIS` |
| What `REPORT.md` tells the owner | "measured ₪6,500" | stale since 09-03 |
| Verified ILS rail | Gumroad only (rendered) | `rails.ts` |
| Code-level Israel payability | Algora → Stripe Connect Express (rendered twice) | chief audit §2.1 #6 |
| Owner one-time steps that gate a first transaction id | six (chief audit §4A) | chief audit |

The chief audit's haircut (supervisors ₪39,400 → auditors ₪2,200–3,500) is accepted in full. So is its
rule that the auditor's number always wins, and its reversal of the `data-apis` auditor on AWS Data Exchange.

---

## 2. Decision 1 — what gets built now, in order

Rules applied: buildable by software alone; payable to an Israeli on evidence at least as good as a rendered
page; an acquisition channel **named**, and the first thing built on the line is the cheapest test that a
stranger can find it (MISSION constraint 7). A ₪0 month one does not disqualify. No named channel does.
Six items, not eight: the board will not pad the list to the cap with lines it does not believe in.

| # | Build | Group (merged) | Audited ceiling, 12 mo | Month 1 | Acquisition channel | Rail | First build step |
|---|---|---|---|---|---|---|---|
| 1 | **Publish `apify-il-open-data` free through CI; count stranger runs for 30 days** | distribution + agent-markets + store-promotion + productized-services + half of israel-bureaucracy | **₪200** (₪1,500 recorded as the contested upper bound) | ₪0 | Apify Store search and Apify MCP-server search — platform search that ranks on history, which is exactly why the clock starts now | Apify → PayPal or Wise (deferred: KYC only after runs exist) | `.github/workflows/apify-publish.yml` running `apify push` from `products/apify-il-open-data` on `main` with `APIFY_TOKEN`; README and `.actor` metadata say **free**; a daily stats job writes `strangerRuns30d` and `strangerUsers30d` through `recordKpi` |
| 2 | **Algora bounty intake filter, then the first PR from a brand GitHub account** | bounties-grants | **₪300** | ₪0 (2–5 days after the first rewarded PR, which is weeks away) | The payer posts the job: bounties are GitHub issues carrying `algora-pbc[bot]` bounty comments, found by GitHub search — the only host this container reaches | Stripe Connect Express via Algora, `connect_countries.ex` rendered | `src/revenue/bounties/intake.ts`: search, then exclude repos whose CONTRIBUTING/policy bans AI-authored PRs, require TypeScript/Python/docs/tests, emit at most two candidates; disclosed AI authorship on every PR; stop on first request |
| 3 | **PCN874 builder** — spreadsheet → validated מע״מ detailed-report file | israel-bureaucracy #1 (+ vertical-niches duplicate) | **₪600** (band ₪300–600) | ₪0 | (a) Hebrew long-tail organic on the exact statutory terms — measured by the SERP pull *before* the build; (b) an open-source `pcn874` core under the brand GitHub org / npm scope, so GitHub and npm search carry the free tier | Gumroad, ILS rendered | Render the 874 record layout from at least two independent open-source implementations found by GitHub code search (rule 9 of the scout brief) into `products/pcn874/spec/FORMAT.md` with both sources cited; build the **validator** with fixtures first; no legal figure ships until two sources agree |
| 4 | **Deploy `il-biz-tools` under the domain with Gumroad in place of Paddle and cookieless page-view measurement** | israel-bureaucracy #3 + content-seo B + distribution #2 + risk-governance redaction as a feature | **₪400** (band ₪200–400) | ₪0 through month 12 as things stand | Hebrew long-tail organic, measured (SERP pull now; page views from the PostHog connector attached to this session; Search Console only later, see §6.3) | Gumroad | Retire the Paddle block in `products/il-biz-tools/src/config/site.json`; Gumroad checkout link on the Pro box instead of "בקרוב"; keep every page that depends on `tax-2026.json` **unpublished** until its rates are confirmed against two independent GitHub-hosted implementations and `verified` flips to true (rule 4) |
| 5 | **List `products/mcp-il-tools` in the MCP Registry under the brand namespace; make every product repo a GitHub storefront** | distribution (the two unlocked doors) + the GitHub-native angle | **₪0** — this is a channel test, not a line | ₪0 | MCP Registry search (publishes with no human review); GitHub topics and search; awesome-list PRs per `docs/AWESOME_ROUTE.md` | none — free; the paid products behind it are lines 3 and 4 | `products/mcp-il-tools/server.json` and `.github/workflows/mcp-publish.yml` with `mcp-publisher` DNS verification; blocked on the domain (owner step 5) and the org (step 7); stars, clones and registry installs recorded as KPIs |
| 6 | **Company-registrar annual-fee page, then a paid deadline reminder only if the page gets traffic** | israel-bureaucracy #2 | **₪300** (band ₪150–300; at the bar, not above it) | ₪0 | Same Hebrew long-tail (term measured in the same SERP pull) | Gumroad | A static fee/deadline page on `il-biz-tools` with the audited arithmetic (₪1,338 → ₪1,777 on 1.4.2026), §30א disclosure at capture and Amendment 13 handling in the form; the reminder product is not built until the page shows 100 weekly views |

Deliberately **not** on the list, and why:

- **Devpost sponsored AI hackathons (₪400).** Two mandate collisions, not one. Every win requires owner paperwork
  within ~2 business days (eligibility form, W-8BEN, affidavit) — recurring, not one-time, and MISSION §1 makes
  everything recurring ours. And the "meaningful human creativity" attestations the auditor found cannot be signed
  honestly for agent-built work; an intake filter that excludes both may leave an empty set. Deferred, with a
  re-open trigger in §7 and one question for the owner in §8. Its ₪400 is not counted.
- **The multi-vertical statutory-declaration clock, EAA scanner, tenders alerting, TaskBounty.** Leads without a
  ceiling. Each gets a measurement (§6.3), not a build.
- **A second Apify Actor.** Not before the first one's 30-day count is read.

Rail concentration after this list: Apify/PayPal (1), Stripe Express (2), Gumroad (3, 4, 6), none (5). Three
rails, two of them unverified at the account level until the owner's steps 3 and 4 succeed. The board accepts
this knowingly because exactly one rendered ILS rail exists; the mitigation is to render Freemius (§6.1, P1),
not to invent a fourth rail.

---

## 3. Decision 2 — every existing line in `portfolio.ts`

| id | Current target / grade | Ruling | Measured against | Reason |
|---|---|---|---|---|
| `apify-actors` | ₪3,000 / inferred | **RETARGET** to ₪200; grade `inferred`; ₪1,500 recorded in the basis as the contested upper bound | ₪200 | Five groups' survivors collapse to one creator account; the ₪1,500 rests on an unverified marketing mean, the ₪200 on the only real base rate (8.7 users/Actor). Split `humanSetup`: the free publish needs only `APIFY_TOKEN`; KYC and PayPal move to the deferred catalogue (§4B.7–8) and are raised only when stranger runs exist. Remove "register as osek patur" from this and every line — it is owner step 2, not a per-line item. Kill criteria rewritten on ledger/KPI fields (§6.1). |
| `il-biz-tools` | ₪1,500 / contradicted | **RETARGET** to ₪400; grade stays `contradicted` until a page-view or Search Console reading exists; rail Paddle → Gumroad | ₪400 | Audited band ₪200–400 with ₪0 through month 12; three preconditions (deploy, domain, one SERP read) before any SEO hour. Absorbs the risk-governance redaction feature. The registrar page (build #6) lives on this site but is not a line until it shows demand. |
| `oss-bounties` | ₪1,500 / inferred | **RETARGET** to ₪300; operating loop amended: PRs from the brand machine account, never the owner's handle; Algora only; Devpost optional and conditional | ₪300 | Whole audited group ₪800, Algora ₪300. The only line whose acquisition runs backwards and the only code-level Israeli payability proof in the sweep. Keeps its rank on constraint 7, not on ceiling. |
| `pcn874` (new) | — | **ADD** at ₪600, grade `inferred`, basis = chief audit §2.1 #2, `skillName: revenue-pcn874` | ₪600 | The only line with a verified, dated, legally created cohort. Own buyer (VAT-registered עוסקים and bookkeepers), own kill criteria, shared rail (accepted above). |
| `templates` | ₪3,000 / unevidenced | **KILL** | — | Etsy needs an identity-verified shop plus Payoneer KYC (Israel payability unverified) and is an account-per-store platform (MISSION constraint 2); the storefronts audit closed Etsy. No channel, no rail, no evidence. |
| `paid-apis` | ₪1,200 / contradicted | **KILL** as a revenue line | — | Its own basis divides x402 out to ~₪6 per provider per month; 91% of listings never reach ten calls. `products/x402-il-api` may stay deployed only at ₪0/month cost, as a rail on standby: any USDC that arrives is booked through `connectors/x402-local.ts`, nothing is planned on it. |
| `agent-services` | ₪800 / contradicted | **KILL** | — | Same evidence as `paid-apis` without the marketplace tier. Also fails "never sell what is already free": the Israeli identifier detector it would meter exists free inside this repo. |
| `telegram-bots` | ₪1,500 / unevidenced | **KILL** | — | Fragment's payout KYC is ID **plus selfie** — a camera step the mandate forbids, the same collision that closed Bugcrowd and the Paddle liveness video. Withdrawal to an Israeli resident is also unverified. A product whose only rail collides with the mandate is not a line. `products/telegram-il-tools-bot` stays on disk, out of the CI matrix. |
| `dev-extensions` | ₪2,500 / unevidenced | **KILL** | — | Chrome Web Store rejected twice; the VS Code marketplace was never audited and its ranking is unread; no auditor ranked it; the basis still says "plugin-ecosystems has not been swept" — it has, and its one survivor (WordPress) is ₪0–200 behind a 100–200× day-one handicap. No named channel with evidence. |
| `hebrew-content` | ₪1,500 / inferred | **KILL** | — | `content-seo`: fifteen criteria, zero survivors; every money model is a multiplier on traffic the colony has no channel to bring. The working tools it would have written are build #4. |

Portfolio after this ruling: **four lines, ₪1,500 committed** (`apify-actors` 200, `oss-bounties` 300,
`il-biz-tools` 400, `pcn874` 600), plus ₪700 conditional (registrar ₪300 on traffic, Devpost ₪400 on the
owner's answer) — which is the chief audit's ₪2,200 with the conditions made explicit. Skills of killed lines
(`skills/revenue-templates`, `-telegram-bots`, `-dev-extensions`, `-hebrew-content`, `-paid-apis`,
`-agent-services`) are removed; a playbook for a dead line is a prompt to re-propose it, and `docs/REJECTED.md`
is the memory.

---

## 4. Decision 3 — the arithmetic to ₪20,000/month and to ₪1,000,000/year

Written as arithmetic. Every input is an audited figure or MISSION's own formula.

### 4.1 ₪20,000/month

| | ₪/month | share of ₪20,000 |
|---|---|---|
| In the ledger today | 0 | 0.0% |
| Month one, every line | 0 | 0.0% |
| Committed portfolio at month 12 (four lines) | 1,500 | 7.5% |
| With the two conditionals | 2,200 | 11.0% |
| With Apify's contested ₪1,500 as well | 3,500 | 17.5% |
| **Gap at month 12, best audited case** | **16,500–18,500** | — |

Cumulative first-year ledger if every line ramps linearly from ₪0 to its ceiling by month 12: ₪1,500 × 6 =
**₪9,000 for the whole year** (₪13,200 with the conditionals). Not per month — for the year.

Ways to close a ₪17,800 gap, each costed:

1. **More lines of the same quality.** The mean audited survivor is ₪367/month. Closing the gap needs ~49 more
   survivors. The sweep produced 6 survivors from 121 criteria (5%), so 49 more implies ~980 more criteria —
   eight full sweeps of a criterion space that has been swept once and whose every cell is now covered (chief
   audit §0). The 121-criterion sweep exhausted two Fable quotas and needed 150 agents. Not credible.
2. **Fewer, bigger lines.** Four lines at ₪5,000 would do it. The sweep found **zero** lines above ₪600 at
   product level and one at ₪1,500 at platform level, contested. Every group that looked for a bigger line hit
   the price floor of zero (eleven of fifteen), because the mandate selects for public-input products.
3. **MISSION's own store formula**, scaled to ₪20,000 (24% of ₪83,333), net of ₪5 upkeep at a 5% hit rate:
   ₪500 per winner → 1,000 launches; ₪600 (best product-level ceiling) → 800; ₪1,500 → 286. Each launch must
   be a distinct dataset, tool or audience (constraint 6). Distinct sources found by the sweep: six.
4. **Relaxations the owner could grant**, and what each buys on the evidence: signing per-win paperwork
   (Devpost/Kaggle) +₪400; a registered company (ח.פ.) opens partner directories and B2B invoicing but no
   measured demand; more money buys nothing, because paid acquisition is rejected on portfolio arithmetic
   regardless of budget (`docs/REJECTED.md`). None reaches ₪20,000.

Two structural facts on the way there, so the owner is not surprised later: the עוסק פטור ceiling is
₪122,833/year ≈ ₪10,236/month, so ₪20,000 forces עוסק מורשה and VAT at roughly half the target; and every
ceiling above is gross of platform take (Gumroad ~12.9% + $0.80, Stripe fees, Apify's share), so net is
80–87% of the numbers shown.

**Verdict, plainly: this portfolio cannot reach ₪20,000/month. Nothing measured supports it, and nothing in
the repo could establish it either way yet, because no buyer has been measured on any line.** The single thing
that would change the arithmetic is a line with a non-public input (MISSION constraint 8) that a stranger can
find — and the one candidate two orders of magnitude larger than our home turf, an English-language product
around the European Accessibility Act obligation, has never been occupancy-tested. That test is ordered in
§6.3. Until it returns, the honest planning number is ₪1,500–2,200 at month 12, and the board reports the
target as 7.5–11% covered, in those words.

### 4.2 ₪1,000,000/year (₪83,333/month)

| ₪ per winning store (audited) | net per launch at 5% hit rate, ₪5 upkeep | launches needed | distinct sources needed |
|---|---|---|---|
| ₪1,500 — best platform-level line, contested | ₪70 | 1,191 | 1,191 |
| ₪600 — best product-level line | ₪25 | 3,334 | 3,334 |
| ₪500 — modal audited survivor | ₪20 | 4,167 | 4,167 |

₪83,333 is **38×** the audited portfolio. The launches column is `storesNeededFor` in `growth.ts` with the
audited ceilings; the sources column is constraint 6 with `STORES_PER_DISTINCT_DATASET = 1`. The sweep found six
sources. At 3,334 stores the promotion ceiling (constraint 4) is under three minutes per store per month.

To make the final goal arithmetically possible the per-winner figure has to move, not the store count: at
₪5,000 per winner and 5% it is 341 launches; at ₪5,000 and a 20% hit rate, 84. Both require products with
non-public inputs — accumulated platform history, a statutory obligation with a large payer base, or work for a
named payer — at ten times the size the sweep found. **Verdict: ₪1,000,000/year is not reachable by multiplying
any shape the sweep found, and the board will not plan against it.** It stays on the manager's screen as
0.0%, and it is re-examined only if an English-market obligation product measures a buyer.

---

## 5. Decision 4 — ruling on the 7-step owner checklist (`docs/OWNER_STEPS.he.md`)

Read against chief audit §4A (six items) and MISSION §1 (only one-time identity, KYC and payout steps a platform
legally requires; never invent a step). Nothing is added. One step is amended in substance because the draft
itself contains a mandate leak it tried and failed to solve.

| Step (draft) | Ruling | Reason |
|---|---|---|
| 1. Merge PR #2 | **keep, amended** | Not a §4A identity step, and correctly not in that catalogue: it is the owner's consent that puts `colony.yml` and every future workflow on `main`. Nothing CI-executed — the Apify push (build #1), Netlify deploys, ledger sync — runs before it, so it is the critical path for the first measurement. The agent does not merge on its own initiative (`CLAUDE.md`: push only when asked). Amend the wording to say "consent, not identity" and that it gates the measurements, not only the hourly report. |
| 2. תיק עוסק פטור + ביטוח לאומי | **keep** | §4A.1 verbatim. The עוסק מורשה note is right and rightly deferred; the board turns it into a watchdog trigger at ₪8,000 rolling 30-day revenue (§6.1) so it is raised by a number, never by a conversation. The "no accountant" ruling inside it is confirmed (§7). |
| 3. Gumroad + token | **keep, amended** | §4A.2. Two amendments: the sentence "Gumroad's terms forbid selling AI services" is unverified by any audit this board read — keep it as *our* rule (only downloadable files and software go there), not as a Gumroad fact, until rendered; and state that the store name is the brand (rule 2 of the preamble already implies it). Bank-holder name in Latin letters stands. |
| 4. Stripe Connect Express via Algora | **amend and reorder** | §4A.3 stands. But the draft's own note — "do step 7 first so the public name is not yours" — rests on a false premise: an organisation cannot sign in anywhere; the public name on Algora and on every bounty PR is the **user** handle, and the org move does not change it. Ruling: step 4 moves after step 7 and is done signed in as the brand machine account created there (below); the Stripe form inside it stays in the owner's legal identity, which is exactly what the mandate allows. |
| 5. Domain | **keep, amended** | §4A.4. Amend: (a) a gTLD (`.com` or similar) at a registrar with WHOIS privacy on by default (Cloudflare Registrar, Namecheap) — a registrant name in public WHOIS is a published identifier; `.co.il` only if ISOC-IL WHOIS privacy is confirmed first; (b) the first year is the one card payment from the float, receipt id into the ledger; the renewal is a recurring cost, which MISSION says is the owner's decision every time — the watchdog raises it 30 days before expiry. |
| 6. Netlify + tokens | **keep, amended, split** | §4A.5. Split into 6a and 6b. **6a (5 minutes, immediately after step 1):** Apify sign-up with the brand as the username — the Store URL is `apify.com/<username>/…` and is public — and `APIFY_TOKEN` into GitHub secrets. This alone starts build #1's 30-day count a month earlier. **6b (at the end):** Netlify link, `GUMROAD_ACCESS_TOKEN`, and `BRAND_GITHUB_TOKEN` (below). |
| 7. GitHub organisation | **keep, amended** | §4A.6. Amend to include the one brand **machine account** GitHub's terms allow alongside a personal account — the identity that authors bounty PRs and signs in to Algora, since a PR under the owner's handle is a byline the mandate forbids. Same step, about five extra minutes, email only, no KYC; its personal access token is `BRAND_GITHUB_TOKEN` in 6b. Before this sentence is written into the checklist a session must render the machine-account clause from `github/site-policy` (reachable) and check Algora's source for any account-type gate. |

- **Missing from §4A:** nothing. All six catalogue items map to steps 2–7.
- **On the list but not required:** nothing. The two removals the draft already made — the accountant
  conversation and Paddle — are confirmed. Google Search Console is correctly absent (see §6.3 for why it is not
  "agent-doable" either). Apify KYC is correctly deferred.
- **Order, as ruled:** **1 → 6a → 2 → 3 → 5 → 7 → 4 → 6b.** Reasons: the domain name and the org name are the
  same brand, so buy the name before creating the org; the org and machine account must exist before Algora; 6b
  collects tokens produced by 3 and 7.
- **A step that is a mandate conflict rather than a step:** none as written. The conflict hidden inside step 4
  (the handle leak) is resolved by the step-7 amendment; the latent one in step 5 (WHOIS) by the gTLD ruling.
- **The "what happens after" section** of the draft promises PCN874 in 1–2 days and a first shekel in 4–8 weeks.
  Amend to the build order in §2 and to "first transaction id 4–10 weeks after the checklist, if a stranger
  finds anything at all; month one ₪0 on every line".
- `docs/INCOME_PLAN.he.md` §6 becomes a pointer to `docs/OWNER_STEPS.he.md`; MISSION §1 names §6 as the
  checklist and should name the new file instead. One checklist, as the mandate requires.

---

## 6. Decision 5 — additions to this repository, and the chief audit's recommendations

### 6.1 Additions, by priority

P0 = before any build, no owner dependency, this week. P1 = the builds in §2 and what they need. P2 = after the
owner's steps land. Model per `CLAUDE.md`: build work on Opus; the two verification items marked (F) on Fable.

| Path | Priority | What and why |
|---|---|---|
| `src/revenue/portfolio.ts` + `src/__tests__/revenue/target-basis.test.ts` | P0 | Apply §3: four lines, `pcn874` added, targets ₪200/300/400/600, bases citing the chief audit; per-line `humanSetup` reduced to what is line-specific; the existing test enforces basis = target. |
| `state/colony/REPORT.md`, `src/revenue/dashboard.ts`, `src/__tests__/revenue/dashboard.test.ts` | P0 | Regenerate; the "measured" line must print `summarizeTargetBasis().measuredIls` (₪0) and the report must open with the ₪0 earned banner. Test: the dashboard can never print a measured figure above the basis summary. MISSION: a dashboard showing money nobody earned is worse than none. |
| `docs/OWNER_STEPS.he.md`, `docs/INCOME_PLAN.he.md` §6, `MISSION.md` table row | P0 | Apply §5 (order 1, 6a, 2, 3, 5, 7, 4, 6b; step 4/7 fix; WHOIS; Apify username; renewal note; tokens table with `BRAND_GITHUB_TOKEN`). §6 becomes a pointer. |
| `src/revenue/owner-steps.ts` + `src/__tests__/revenue/owner-steps.test.ts` | P0 | The checklist as data (`id`, `catalogueRef`, `unlocks[]`, `order`), and a test that every `humanSetup` string in the portfolio maps to a step id and that the doc's headings match the code's order. The checklist becomes code, like `rules.ts`, so it cannot drift or grow by accident. |
| `docs/REJECTED.md` | P0 | Fold in: the six kills of §3 with their re-open triggers (§7); the auditor-narrowed walls for `licensing-ip`, `content-seo`, `crypto-native`; AWS DX kept closed (three renderings beat one snippet); the Stripe/Israel reconciliation note (merchant NO, Connect Express YES, cross-border-payout claim provisional). |
| `src/revenue/rails.ts` + `rails.test.ts` | P0 | Paddle demoted to "option, owner's choice, three named risks"; Gumroad promoted to the default MoR; Freemius stays a candidate with a render task by GitHub code search (not an owner check). |
| `.github/workflows/apify-publish.yml`, `src/revenue/connectors/apify-stats.ts`, `src/__tests__/revenue/apify-publish.test.ts` | P1 | Build #1. Push on changes under `products/apify-il-open-data/**` on `main`; daily stats → `recordKpi`. Test asserts the Actor carries no pricing and the workflow needs only `APIFY_TOKEN`. |
| `src/revenue/bounties/intake.ts`, `src/__tests__/revenue/bounties-intake.test.ts`, `skills/revenue-oss-bounties/SKILL.md` | P1 | Build #2. Search, hostility filter, disclosure template, two-in-parallel cap, stop-on-request; runs inside the colony tick and writes `state/colony/bounties.json`. Skill rewritten: Algora only, brand account only. |
| `products/pcn874/` (`spec/FORMAT.md`, `src/validate.ts`, `src/build.ts`, `test/`), `skills/revenue-pcn874/SKILL.md`, `products-ci.yml` matrix | P1 (F for the spec cross-check) | Build #3. Validator first; two independent sources or no legal figure ships. |
| `products/il-biz-tools/src/config/site.json`, `VERIFICATION.md` beside `tax-2026.json`, the Pro box, PostHog snippet, `registrar-fee.html` | P1 (F for the rate verification) | Builds #4 and #6. Paddle out, Gumroad in; unverified-rate pages stay unpublished; cookieless page views. |
| `src/revenue/types.ts`, `rules.ts`, `rules.test.ts` | P1 | Kill and scale criteria become structured `{kpi, op, value, afterDays}` that `decideLine` evaluates from `revenue_ledger` and the KPI table. Chief audit §3.10: not one kill criterion in the sweep names a ledger field; a criterion nobody can compute will not fire. |
| `src/revenue/watchdog.ts` + `watchdog.test.ts` | P1 | Four new stalls: domain renewal 30 days out; עוסק פטור ceiling at ₪8,000 rolling 30-day revenue (annualises to ~80% of ₪122,833); Apify twelve-month forfeiture fuse; Gumroad balance under $100 for 90 days. Each surfaces on the manager's screen as "needs the owner", with the reason. |
| `src/revenue/constraints.ts` + `constraints.test.ts` | P1 | Eighth screen: a proposal whose channel publishes under the owner's handle or requires a face (selfie, liveness, camera) is RED until a brand identity or a camera-free rail exists. The `telegram-bots` and Algora-handle cases become checkable rather than arguable. |
| `products/mcp-il-tools/server.json`, `.github/workflows/mcp-publish.yml` | P2 | Build #5. Blocked on the domain and the org. |
| `src/revenue/sweep-workflow.ts` — two small waves, `eaa-occupancy` and `tenders-occupancy`, model `opus`, GitHub-first, ≤10 WebSearch calls each | P1 | The measurements in §6.3. Two scouts and one auditor each; the auditor on Fable per the routing rule, nothing else. |
| `research/measurements/serp/`, `research/measurements/eaa-occupancy.md`, `research/measurements/tenders-occupancy.md`; `state/colony/` KPI rows for Apify runs and GitHub traffic | P1 | Where measurements live. Hand pulls in `research/`, CI-generated series in `state/`. Every ceiling in the repo is an estimate of an untested market until these have rows. |
| `products/README.md`, `.github/workflows/products-ci.yml` | P0 | Table reflects §3 (killed products stay on disk, leave the CI matrix; `pcn874` joins). |
| `skills/revenue-templates`, `-telegram-bots`, `-dev-extensions`, `-hebrew-content`, `-paid-apis`, `-agent-services` | P0 | Removed. Reasons live in `docs/REJECTED.md`. |
| `skills/revenue-measurement/SKILL.md` | P1 | The constraint-7 playbook every director loads: what counts as a stranger, which KPI names to write, where the file goes, and the rule that the channel test ships before the product. |

No new agents under `.claude/agents/`: the sweep machinery lives in `sweep-workflow.ts` and that is where the two
waves go. No new watchdog for model quotas: `CHECKPOINT.md` already carries the rule.

### 6.2 The chief audit's §5, item by item

| § | Recommendation | Ruling | Reason |
|---|---|---|---|
| 5.1 | Say "₪2,200 at twelve months, ₪0 today, ₪0 month one" to the owner | **Accept, amended** | Said, in the Hebrew summary above. Amended to distinguish the ₪1,500 the portfolio now commits to from the ₪700 that is conditional, so the owner is not told a conditional number as a plan. |
| 5.2 | Reorder INCOME_PLAN §6: tax → Gumroad → Algora → domain → CI → org; Paddle an option; accountant a flagged conflict | **Accept, amended** | The canonical checklist is now `OWNER_STEPS.he.md`; §6 becomes a pointer. Order amended to 1, 6a, 2, 3, 5, 7, 4, 6b for the reasons in §5 (the org and the machine account must precede Algora). |
| 5.3 | Regenerate REPORT.md; retire "measured ₪6,500"; Apify to ₪200 with ₪1,500 as the contested bound, or say why ₪3,000 | **Accept** | ₪200. There is no argument for ₪3,000 the board is willing to sign; "what the board measures against" was a target fitted to the goal, which is the failure `TARGET_BASIS` exists to prevent. |
| 5.4 | Run the two cheapest measurements before any build | **Accept, amended** | Ruled in §6.3: Apify free publish yes, as build #1; the SERP pull yes, by the WebSearch tool and never by automated scraping; Search Console amended to "PostHog now, GSC later and optional". |
| 5.5 | Fold narrowed walls into REJECTED.md; record BILS, CARF, Adobe re-open triggers | **Accept** | P0 in §6.1; triggers consolidated in §7. |
| 5.6 | Reverse the `data-apis` AWS DX "correction"; keep it closed | **Accept** | Three renderings of AWS's own eligibility file beat one snippet that almost certainly describes a different programme. |
| 5.7 | Sweep the unsearched §0 cells as small GitHub-first waves: tenders, EAA, TaskBounty, English property, GitHub distribution | **Accept, amended** | Order fixed: EAA first (the only lead two orders larger than home turf and a constraint-8 shape), tenders second (Govi at ₪249+VAT/month is the strongest willingness-to-pay evidence in the whole audit, and our Actor already lists tenders), TaskBounty third, Israeli SaaS partner directories fourth. **Rejected without research:** Apple App Store — a $99/year subscription plus Apple developer identity and human app review; the float may not fund a subscription and the shape fails the mandate before any ceiling. Deferred: hospitality and the ecommerce-sellers question (no channel named), Getty/Alamy/Creative Fabrica (the licensing walls apply; Canva Creators stays a lead), Kaggle hackathons (same paperwork shape as Devpost — decided together in §8). |

### 6.3 The two cheapest measurements, decided

1. **Publish `apify-il-open-data` free through CI and count runs for 30 days — APPROVED, build #1.** Readout
   rule: `strangerUsers30d` = distinct users minus the brand account. Under 10 stranger users at day 30: the line
   stays an instrument, no second Actor, no KYC request to the owner. 10–49: keep counting, fix what the runs
   show, still no second Actor. 50 or more: build one more Actor on the most-requested dataset and put §4B.7
   (Apify KYC) to the owner as the next step. 200 or more: pricing is designed — and the listing must state that
   the source is free at `data.gov.il` and that the price is for the maintained, English-keyed normalisation and
   uptime, or it is charging for something free (§7). Blocked on owner step 1 and 6a; nothing else.
2. **One Hebrew SERP pull — APPROVED, before build #3.** Done with the WebSearch tool, one call per term, at most
   six terms (the PCN874 terms in Hebrew and Latin, the VAT and net-salary calculator heads, the registrar
   annual-fee term, the עוסק פטור ceiling term), results written verbatim to `research/measurements/serp/`. Not
   automated from CI: scraping Google results violates Google's terms and the mandate forbids ToS violations;
   the licensed search tool does not. **Search Console — AMENDED.** The chief audit removed GSC verification from
   the owner catalogue as "agent-doable by committing a file". The file is agent-doable; the property is not — it
   must live in a Google account, and the API export needs a credential minted there. So: page views now, from
   the PostHog connector attached to this session (cookieless mode, no PII, Amendment-13 safe), written weekly
   as KPIs; the GSC DNS TXT record rides along in the DNS lines the owner pastes at step 5 **only if** he chooses
   to add the property in his own Google account (two minutes, backend-only, no public name); the export is
   asked for only after `il-biz-tools` shows 100 weekly views. Not a checklist step.

### 6.4 The two angles every group missed, decided

- **An English-language property — YES.** Every gate that killed `content-seo` was geography; Devpost and Algora,
  the two lines whose acquisition runs backwards, are already English. Ruling: every brand-published artefact
  (README, npm package, MCP listing, Actor description) is English-first with Hebrew where the buyer is Israeli;
  and the next *new* product after the four retained lines is English-market, chosen by the EAA occupancy wave
  (≤3 API-first scanners under $50/month found → build it as scan-as-report on Gumroad; otherwise record and
  close). Nothing is built on this angle before that wave returns.
- **GitHub-native distribution — YES.** The only host this container reaches, the only channel that needs no
  face, voice or launch, and the origin of the one comparable with real revenue the sweep found. Ruling: one
  public repository per genuine product under the brand org (never forks, never variants — GitHub's own
  spam rules and constraint 6 both forbid it), README as storefront, topics set, awesome-list PRs per
  `docs/AWESOME_ROUTE.md`, npm under the brand scope, MCP Registry under the brand namespace; stars, clones and
  referrers from the GitHub traffic API recorded as KPIs. Blocked on owner step 7.

---

## 7. Decision 6 — mandate-conflict rulings and re-open triggers

### 7.1 Rulings, so nothing is left as "the board should decide"

| Conflict | Ruling |
|---|---|
| "One paid conversation with an Israeli accountant" (INCOME_PLAN §6 step 3) | **Not a step.** The owner's brief is verbatim "אני לא מדבר עם אנשים". Default: treat all income as taxable, do not zero-rate under §30(א)(5). The עוסק מורשה switch is raised by the watchdog at a number. If the owner wants the two questions answered, the async routes are a written online accountant service or a written ITA pre-ruling — his choice, never on the list. |
| Paddle (Sumsub may demand a selfie video; discretionary approval; no ILS payout) | **Option, not a step.** Only if the owner prefers it knowing the three risks; Gumroad does the same job with rendered proof. |
| Fragment KYC = ID plus selfie (Telegram Stars) | **Mandate collision.** `telegram-bots` killed. Re-open only if a camera-free payout to an Israeli resident is rendered. |
| Devpost per-win paperwork and human-creativity attestations | **Deferred, two collisions.** Recurring owner paperwork breaks MISSION §1's one-time rule; the attestation cannot be signed honestly for agent-built work. Not built. Owner question in §8. |
| Bounty PRs under the owner's GitHub handle | **Mandate collision the draft missed.** A PR is a published byline. Resolved by the brand machine account in step 7; the owner may instead accept the leak for this one line (§8). |
| Domain registrant in public WHOIS | **Leak.** gTLD with WHOIS privacy; `.co.il` only if privacy is confirmed. |
| Domain renewal is recurring | First year from the float with receipt id; renewal is the owner's decision each time, surfaced by the watchdog. The float never becomes a subscription. |
| Charging per record for free keyless `data.gov.il` data (Apify AMBER) | **Free until measured.** If ever priced: the listing names the free source with a link and states that the price is for maintained normalisation and uptime; the same rule applies to any hosted API over open data. Selling the data itself is a violation. |
| `tax-2026.json` carries `verified: false` | **Not a conflict, an order.** Pages that depend on it stay unpublished until two independent GitHub-hosted implementations agree and the flag flips (rule 4). |
| Israeli tax invoices name the owner | Unavoidable by law, listed as such in MISSION; never volunteered beyond it. |
| The repo under the owner's personal account | Owner step 7. Until then the skills index is not advertised (MISSION). |
| "Register as osek patur" repeated in every line's `humanSetup` | Deduplicated: it is owner step 2, once. |
| `REPORT.md` shows "measured ₪6,500" | Regenerated at P0; the test in §6.1 makes the regression impossible. |
| Apify's no-funnel rule vs GitHub/MCP distribution | The rule is per-platform (`constraints.ts` #7): no Actor links out; GitHub READMEs and the MCP Registry may link to the paid products. |

### 7.2 Re-open triggers, each with the evidence that fires it

| Closed thing | Re-opens when |
|---|---|
| Second Apify Actor / Apify KYC / Apify pricing | 50 / 50 / 200 stranger users in 30 days respectively (§6.3.1). Under 10 at day 30: instrument only, permanently, unless the count later crosses 50. |
| `telegram-bots` | A rendered Fragment page offering withdrawal to an Israeli resident without a selfie or liveness step. |
| `paid-apis`, `agent-services`, x402→ILS | A rendered per-provider median ≥ ₪100/month on x402scan or the Bazaar series; **or** BILS opening beyond the institutional pilot (chief audit's trigger, adopted). Any USDC that arrives before then is booked, not planned. |
| Israeli crypto tax-report line | CARF data landing in 2027 against the corrected reason (adopted). |
| Adobe Stock / `licensing-ip` | Adobe's generative-AI declaration settable by API without a per-batch human (adopted). Canva Creators stays a lead. |
| Stripe-gated kills (Substack, beehiiv, Medium Partner, Polar) | Owner step 4 succeeds → the Israel question is settled YES and each is re-examined on its *other* gates only (the AI-content bans stand); step 4 fails → Algora dies and the kills stand. One form answers all of them. |
| Paddle | Only if the owner chooses it and passes without a liveness video. |
| Freemius as a second ILS rail | Rendered ILS payout terms and acceptance of an עוסק פטור seller, found by GitHub code search. |
| WordPress.org plugin | A rendered change to `class-plugin-search.php` removing the `active_installs` weight. Practically never. |
| AWS Data Exchange | A rendered AWS eligibility page listing Israel. A snippet does not count. |
| Devpost / Kaggle hackathons | The owner answers yes to per-win paperwork **and** the intake wave finds ≥3 events per quarter that explicitly permit AI-built entries with no human-authorship attestation. |
| EAA English property | ≤3 API-first scanners priced under $50/month in the occupancy wave → build; otherwise closed with the count recorded. |
| Tenders alerting (#25) | The wave finds a payer segment Govi does not serve (English-language foreign bidders, API buyers, or a niche filter) with a channel named. |
| Registrar reminder as a paid product | The fee page reaches 100 weekly views. |
| The whole ₪20,000 plan | The first transaction id in the ledger. Every ceiling above is re-based on that measurement, not before. |

---

## 8. Questions that are the owner's, stated once

Not steps. Each is a choice only he can make; the board's default is stated and applies until he says otherwise.

1. **Devpost/Kaggle paperwork.** Will he sign a winner form, W-8BEN and affidavit within ~2 business days of any
   win? Default: no; the line stays deferred. Even a yes only re-opens events that permit AI-built entries.
2. **The bounty handle.** Brand machine account (default, in step 7) or accept his GitHub username on bounty
   PRs for this one line?
3. **Paddle.** Not on the list. Only if he prefers it, knowing the selfie-video risk, discretionary approval and
   USD-only payout.
4. **The ₪200.** Read as a one-time total (MISSION). If he meant monthly, the ceiling moves; the domain renewal
   at month 12 is the first thing that would draw on it.
5. **Search Console.** Two minutes in his own Google account, optional, asked for only after the site shows
   traffic.

---

## 9. What this board did not verify, so the next rank knows

The board did not open `groups/` or `audits/`; it accepted the chief audit's ceilings and its auditor-of-auditors
findings whole. It did not render GitHub's machine-account clause, Algora's account handling, ISOC-IL's WHOIS
rules, Gumroad's prohibited-content list or the PCN874 layout — each is assigned above as a render task before
the sentence that depends on it ships to the owner. It did not run a WebSearch. It did not check PR #2. The
₪1,500 committed figure is a sum of audited ceilings that no buyer has confirmed; it is the honest planning
number and it is still a hypothesis.
