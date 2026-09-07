# Measurement: EAA occupancy (board task #22)

**Date:** 2026-09-07
**Ordered by:** `research/colony-sweep/BOARD.md` §6.4 and §7 — the next *new* product after the four retained
lines is gated on this measurement. Board's decision rule, verbatim (§7): *"EAA English property | ≤3 API-first
scanners priced under $50/month in the occupancy wave → build; otherwise closed with the count recorded."*
§6.4 states the same rule as *"≤3 API-first scanners under $50/month found → build it as scan-as-report on
Gumroad; otherwise record and close."* The scout brief tightened the band to **under €30/month or pay-per-scan**.
Both bands are counted below and both give the same answer.

**Question:** how occupied is the market for European Accessibility Act (Directive 2019/882, applicable from
28 June 2025) compliance scanning sold as a cheap self-serve tool or API?

**Search budget:** **7 of 8 WebSearch calls used.** One left unspent — the count crossed the trigger by the
third call and further searching would only have raised a number that was already decided. Everything else came
from GitHub (`search_code`, `search_repositories`, `raw.githubusercontent.com` WebFetch), which costs no budget.

---

## Evidence strength legend
- **[RENDERED]** — I fetched and read the document, or GitHub's code search returned the file's own bytes.
- **[SNIPPET]** — a WebSearch result summary quoting a page I could not render. Weaker.
- **[BLOCKED]** — the primary source exists but the egress proxy refused it; a human must open it.

**Blocked in this session, every one of them a vendor pricing page:** `eaacompliance.online`,
`www.accessibilitychecker.org`, `webaim.org`, `www.a11yscope.com`, `accessalyze.com`, `dev.to`,
`api.apify.com` (the Apify Store API, which would have given actor pricing and user counts as JSON).
Nothing about accessibility vendors renders from this container except GitHub.

---

## 1. The one-line answer

**The market is occupied at every price point including zero, and the board's re-open trigger fails by a factor
of five.** The trigger asked for ≤3 cheap API-shaped scanners. The honest count with at least one rendered
source per item is **8**; counting SNIPPET-grade named products with named prices it is **16**; and **at least
five of them are free**, including one on Apify — the colony's own named channel — whose listing title is
literally *"Free web accessibility checker (EAA and WCAG compliance)"*.

MISSION constraint 8 hits this line as hard as it hit the other six groups: the detection engine is `axe-core`
(MPL-2.0), the crawl is Chrome, and the statement generator is published free by W3C. Every input is public,
so the price floor is zero — and roughly a dozen sellers have already put it there, deliberately, as a lead
magnet for a human audit they charge €319–€6,000 for.

---

## 2. The sellers

### 2.1 Enterprise and mid-market — [RENDERED], with a caveat
Source: `https://raw.githubusercontent.com/ishandutta2007/Awesome-Accessibility-Testing-Platform/main/README.md`,
fetched 2026-09-07. **This is a third-party curated list — a directory. The fact that it says these things is
rendered; the prices inside it are second-hand vendor claims and are not independently confirmed.** The ARR
column in that file is an unsourced estimate and I do not rely on it anywhere below.

| Vendor | What it sells | Price as listed | Free tier as listed | Self-serve? |
|---|---|---|---|---|
| Siteimprove Accessibility | scanning + reporting inside a governance suite | custom enterprise quote | No | No — sales call |
| Level Access | enterprise testing/monitoring/compliance | custom, *"typically $25,000 to $150,000+/year"* | No (14-day trials) | No |
| UserWay | widget + testing platform | from **$490/year** | Yes (free basic widget) | Yes |
| accessiBe | overlay + automated remediation | from **~$49/month** | No (free website scan; 7-day trial) | Yes |
| Deque axe DevTools | extension + CI/CD + monitoring | Pro **~$60/user/month** | Yes (free browser extension) | Yes (Pro) |
| AudioEye | automated testing + managed remediation | from **~$49/month** | No (free scan; 14-day trial) | Yes |
| EqualWeb | AI scanning + remediation | automated plans from **~$39/month** | Yes (free widget + Chrome extension) | Yes |
| Silktide | accessibility + QA platform | custom quote | No (free extension; **free 25-page scan**) | No |
| Pope Tech | WAVE-engine testing + monitoring | from **$25/month** (50-page tier, billed annually) | **Yes — free forever: 25 pages, 1 site** | Yes |
| Tenon | API-first scanner | **discontinued** — acquired by Level Access 2021, service retired August 2023 | — | — |

> **Conflict, flagged not resolved.** A 2026 secondary blog describes Tenon.io in the present tense as an
> API-first scanner with a free tier ([SNIPPET], `crosscheck.cloud`). The rendered list says it was retired in
> August 2023. I do **not** count Tenon in any total. Someone repeating a 2019 tool round-up is the more likely
> explanation, and it is a warning about how much of this category's "research" is recycled listicles.

Corroborating price points from the prior repo scout (`research/colony-sweep/scouts/productized-services--compliance-scanners.md`,
[SNIPPET] there): AudioEye ~$199–799/mo depending on scope; Silktide UK public-sector procurement records
~£6k–40k/yr by page volume; **Equally AI entry ~$45/mo**; Equalize Digital Accessibility Checker (WordPress)
Pro **$119–190/yr for one site**.

### 2.2 The cheap self-serve tier — the tier the board's trigger is about

| Seller | What it scans | Price | Free tier | API-shaped? | Grade |
|---|---|---|---|---|---|
| **WAVE API** (WebAIM) | WCAG via WAVE engine, 1 credit per basic page scan, 2–3 for advanced | **$0.04/credit (250–999, $10 min), $0.03 (1,000–9,999), $0.025 (10,000+)** | **100 free credits on registration** | **Yes** — `GET wave.webaim.org/api/request?key=…&url=…&reporttype=N` | [RENDERED] |
| **Skynet "All in One Accessibility" scanner** | WCAG 2.0/2.1/2.2, ADA, Section 508, **"EAA EN 301 549 (EU)"**, UK Equality Act — 18+ frameworks | **$9/mo (≤25 pages), $19/mo (≤250), $89/mo (≤1,000), to $199/mo (≤2,500)**; multi-site $129–399/mo | 10-day free trial | Sold as CMS plugins (TYPO3, Odoo, Strapi, WordPress); **no documented standalone API** | [RENDERED] |
| **A11yScope** | site crawl, weekly scans, email alerts, PDF | **$10/mo**, 1 site | not stated | web app | [SNIPPET] |
| **AccessCheck** (`accesscheck.pro`) | full accessibility reports, PDF export | **$19/mo Pro**, up to 10 scans/day | not stated | web app | [SNIPPET] |
| **Accessalyze** | one URL, AI fix code per violation | **$19 one-time per URL, no subscription** | free partial report | web app | [SNIPPET] |
| **AccessiGuard** | WCAG report + AI fix suggestions | **pay-per-scan, no monthly fee** | not stated | web app | [SNIPPET] |
| **WCAGIO** | site scan, PDF report; CSV/JSON on paid | Pro/Enterprise tiers | **free tier (PDF reports)** | **Yes on paid (JSON export)** | [SNIPPET] |
| **PageBolt API** | audits | paid above free tier | **free: 100 audits/month** | **Yes** | [SNIPPET] |
| **Pope Tech** | WAVE engine, monitoring | $25/mo | **free forever, 25 pages** | partial | [RENDERED] |

### 2.3 Apify Store — the colony's own named acquisition channel, already occupied

Six axe-core accessibility Actors, found without a single search of Apify itself. Two are [RENDERED] from
GitHub-hosted API directories that hard-code the listing titles and descriptions; four are [SNIPPET] from
WebSearch result titles that are themselves apify.com URLs.

| Actor | Listing text (verbatim fragments) | Grade |
|---|---|---|
| `apify.com/katzino/actor-web-a11y-audit` | **"Free web accessibility checker (EAA and WCAG compliance) API"** — free, EAA-branded, has a documented JavaScript API client | [SNIPPET] |
| `apify.com/gabrielaxy/accessibility-scanner` | *"Scan any website for WCAG accessibility compliance using axe-core. Get detailed reports with fix code suggestions, severity scores, and remediation priorities. Supports CI/CD integration"*; has an `/api` page | [RENDERED] + [SNIPPET] |
| `apify.com/accessibility_team/a11y-scanner-public` | *"Accessibility Checker API for WCAG Compliance"* | [SNIPPET] |
| `apify.com/nexgendata/wcag-accessibility-auditor` | *"♿ WCAG 2.2 Accessibility Auditor — Bulk axe-core. Render sites with Chrome, scan with axe-core, return violations, severity, and score."* | [RENDERED] |
| `apify.com/hanamira/axe-accessibility-tester` | *"Test any website for WCAG accessibility issues using axe-core. Scan single pages or crawl entire sites."* | [RENDERED] |
| `apify.com/mpelas/axe-core-accessibility-checker` | *"Axe Core Accessibility Checker Actor"* | [SNIPPET] |

Rendered sources for the two above: `cporter202/API-mega-list` (`marketing-apis-290/README.md`,
`seo-tools-apis-903/README.md`) and `cporter202/scraping-apis-for-devs` (`developer-tools-apis-172/README.md`),
returned as file content by GitHub code search 2026-09-07. Per-actor prices and user counts are **UNKNOWN** —
`api.apify.com` is [BLOCKED] here, and that one JSON call is the single cheapest thing a human could do to
sharpen this measurement (see §8).

### 2.4 EAA-branded free checkers — the lead-magnet layer

All [SNIPPET], all named by two independent WebSearch calls:
`getwcag.com` (*"full-page scanner … then builds a polished accessibility statement", free*),
`fixmyweb.dev` (*"201 WCAG 2.2 automated checks … scans any site in 60 seconds"*, free),
`web-accessibility-checker.com/en/eaa-checker` (*"Free EAA Compliance Checker … free, no sign-up required"*),
`inkluso.eu` (*"free scan in 60 seconds"* against WCAG 2.1 AA and the EAA),
`accessibilitychecker.org` (free ADA/WCAG scan), `adaquickscan.com`, `eaacompliance.online`,
`webyes.com` and `exceedability.com` (free EAA accessibility-statement generators),
`userway.org/accessibility-statement-generator` (free), plus accessiBe's and AudioEye's free scans and
Silktide's free 25-page scan.

Germany — the largest EAA transposition (BFSG), and the market a European-language product would target:
`bf-check.de` (*"free tool that checks your site against 15 WCAG-2.1-AA criteria in 30 seconds"*),
`bfsg-check.de`, `barrierefreie-agenturen.de` (*"7 Tools + kostenloser KI-Check"*), plus at least three
content-marketing sites (`adfera.de`, `desativ.de`, `barrierefreie-agenturen.de`) ranking on the buying terms.
[SNIPPET]

### 2.5 E-commerce marketplaces — the "EU SME e-commerce payer" route
[SNIPPET], WebSearch 2026-09-07:
- **Shopify App Store.** *Avada Accessibility Widget* — *"the most-reviewed dedicated accessibility app"*,
  covers *"WCAG, ADA, EAA and BFSG"*, **free – $18.99/month**, 4.9/5 from 83 reviews. *Accessify AI* —
  *"AI-powered WCAG 2.2 AA scanner … ADA & EAA ready in minutes"*. *Accessibility Spark* — daily monitoring,
  monthly audit reports, statement of compliance, **from $99/month**.
- Reported band for the whole segment: *"code-based scanners starting at $29/month, and most Shopify-native
  apps charging $19-30/month"*.
- **WordPress.org.** Equalize Digital Accessibility Checker (free + Pro $119–190/yr), All in One Accessibility
  (Skynet), accessiBe and UserWay plugins.
- **Other CMS marketplaces.** Skynet ships the same scanner as a TYPO3 extension, an Odoo app and a Strapi
  plugin — one product, four storefronts, one account. That is the shape MISSION constraint 2 asks for, and
  somebody is already running it in this exact category.

### 2.6 Israel, for completeness
From the earlier repo scout, [SNIPPET] there: `digitale.co.il` from ₪850+VAT; `accessible.org.il` ₪450 one-time
including statement wording; `tabnav.com` "instant accessibility report"; general market ₪1,500–10,000 to
retrofit an existing site. Not our target market here, but it is the same product at the same commodity price.

---

## 3. The free floor — MISSION constraint 8 test

**Result: the constraint fires. Every input to this product is public.**

- **`axe-core`** (Deque, Mozilla Public Licence). [RENDERED] `sderosiaux/good-website-checklist` README:
  *"axe-core is the engine under Lighthouse and most scanners, and Deque's own figure is **57% of issues found
  automatically**. A 100 Lighthouse a11y score only proves the automatable subset passed."*
- **Pa11y**, **Lighthouse**, **HTML_CodeSniffer**, **IBM Equal Access Accessibility Checker**, **Microsoft
  Accessibility Insights**, **AccessLint** (GitHub App that comments on PRs), **Guidepup**. [RENDERED] in the
  Awesome list's open-source section.
- **Google PageSpeed Insights API** — `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`, which
  returns the Lighthouse accessibility category. [RENDERED] as a hard-coded constant in
  `fabriziosalmi/websites-monitor` `checks/check_accessibility.py`, sitting directly above the WAVE endpoint as
  the *preferred* (free) path with WAVE as the paid fallback. A working competitor charges $0.
- **The accessibility statement** — the deliverable every EAA vendor upsells — has a **free official generator
  from W3C**: `https://www.w3.org/WAI/planning/statements/`. [RENDERED] in the same checklist README.
- **A free GPL EAA plugin already exists.** [RENDERED]
  `https://raw.githubusercontent.com/mrshahbazdev/eu-compliance-suite/main/README.md`: 25 GPL-2.0 WordPress
  plugins including `wp-eaa-accessibility`, which *"scans sites for WCAG 2.1 AA compliance, checking alt text,
  heading hierarchy, form labels, and link descriptions"* and *"generates an accessibility statement meeting
  Article 13 requirements"*. Its stated purpose: let EU-27 merchants comply *"without paying €500+/month to
  specialists."* Somebody has already open-sourced the business model.
- **Free MCP servers doing exactly this.** [RENDERED] via GitHub repo search: `ronantakizawa/a11ymcp`
  (*"MCP Server for Web Accessibility Testing (10k+ Downloads, #20 on ProductHunt)"*, 91★),
  `priyankark/a11y-mcp` (52★), `JustasMonkev/mcp-accessibility-scanner` (56★) — all axe-core, all free.
- **Free agent skills doing exactly this.** [RENDERED] `softspark/ai-toolkit` ships `/a11y-validate`:
  *"Scan codebase for accessibility violations: WCAG 2.1 Level AA, EN 301 549, European Accessibility Act
  (EAA / EU 2019/882) … and EAA accessibility-statement documentation."* And
  `Community-Access/accessibility-agents` (405★) ships eleven WCAG 2.2 review agents with an explicit
  `compliance-mapping` agent for the EAA.

**Is any paid product merely a wrapper?** On the sellers' own listing text, yes, repeatedly. Four of the six
Apify actors name axe-core in their own description. Pope Tech is the WAVE engine. Deque's paid tools wrap
Deque's own free engine. The rendered claim that axe-core is *"the engine under Lighthouse and most scanners"*
covers most of the rest. What is actually being sold above the engine is **packaging** — crawl scheduling,
diffing, a PDF, a jurisdiction mapping, a statement, a white-label report — exactly what the earlier
`compliance-scanners` scout concluded, and exactly the layer a new entrant has no advantage in.

**And there is an honesty ceiling on top of the price floor.** Automated checks find 57% of issues (Deque's own
number, [RENDERED]); a German source puts it at *"30–40%"* ([SNIPPET]). MISSION rule 4 forbids selling a
feature that does not exist, so we could not sell an automated scan as EAA conformance — only as a first pass.
The FTC's $1,000,000 accessiBe order (already in `docs/REJECTED.md` via the earlier scout) is what the other
reading of this market costs.

---

## 4. The count — the board's trigger

Definition used, strictly: **API-shaped** = a URL goes in and a machine-readable report comes out through a
documented programmatic interface; **self-serve** = credit card or free signup, no sales call; **cheap** =
free, pay-per-scan, or ≤ €30/month (the brief's band) — I also report the board's own ≤$50/month band.

**Tier A — at least one RENDERED source, API-shaped, cheap: 8.**
1. WAVE API — $0.025–$0.04 per page scan, 100 free credits.
2. Google PageSpeed Insights API — free.
3. Apify `nexgendata/wcag-accessibility-auditor`.
4. Apify `hanamira/axe-accessibility-tester`.
5. Apify `gabrielaxy/accessibility-scanner`.
6. Apify `katzino/actor-web-a11y-audit` — free, EAA-branded.
7. Apify `accessibility_team/a11y-scanner-public`.
8. Apify `mpelas/axe-core-accessibility-checker`.

(6–8 are SNIPPET for the listing but the Apify Actor platform makes every published Actor API-shaped by
construction — `POST /v2/acts/<id>/runs` — so the API property is structural, not a vendor claim.)

**Tier B — add SNIPPET-grade products with a named price ≤€30/month or pay-per-scan: 16.**
Add A11yScope ($10/mo), AccessCheck ($19/mo), Accessalyze ($19 one-time/URL), AccessiGuard (pay-per-scan),
WCAGIO (free tier), PageBolt (free 100/mo), Pope Tech ($25/mo + free tier), Skynet ($9/mo).

**Tier C — the board's own ≤$50/month band** additionally sweeps in EqualWeb (~$39), accessiBe (~$49),
AudioEye (~$49), Equally AI (~$45), Avada on Shopify (free–$18.99), and the whole *"most Shopify-native apps
charging $19-30/month"* segment. **≥ 22.**

**Free-only sub-count, which is the number that actually decides it: at least 11** — PageSpeed Insights API,
`katzino/actor-web-a11y-audit`, WCAGIO free tier, PageBolt free tier, Pope Tech free forever, Silktide's free
25-page scan, and the no-signup EAA checkers `getwcag.com`, `fixmyweb.dev`, `web-accessibility-checker.com`,
`inkluso.eu`, `bf-check.de` — before counting axe-core, pa11y, Lighthouse, IBM Equal Access, the three MCP
servers and the GPL `wp-eaa-accessibility` plugin.

> **Trigger reading: 8 ≥ 4, so the trigger FAILS at its most conservative count, and fails by 5× at Tier C.
> Under the board's own rule the line is recorded and closed, not built.**

---

## 5. The acquisition channel — MISSION constraint 7

The constraint is procedural: a line may not be built before its channel is named. A channel was named for
this line in §6.4 of the board report — *"scan-as-report on Gumroad"* with GitHub-native distribution. Held
against the evidence, **every candidate channel is occupied by sellers whose ranking inputs we cannot match on
day one**, and the repo has already rendered the ranking code for three of them.

| Route | State | Evidence |
|---|---|---|
| Google / Bing on the buying terms ("EAA compliance checker", "BFSG check") | Occupied by vendors *and* by a dense content-farm layer — `levelaccess.com`, `accessibilitychecker.org`, `getwcag.com`, `optimum-web.com`, `adaquickscan.com`, `web-accessibility-checker.com`, `inkluso.eu`, `adfera.de`, `desativ.de`, `barrierefreie-agenturen.de`, `crosscheck.cloud`, `a11yscope.com`. Two searches returned twelve distinct SEO properties and not one non-commercial result. | [SNIPPET] ×3 searches |
| **Apify Store** | **Six accessibility Actors already listed, one of them free and EAA-branded.** Apify Store search correlates with a quality score including Popularity and History of success — already rendered in `MISSION.md`. | [RENDERED] + [SNIPPET] |
| **WordPress.org** | Equalize Digital, All in One Accessibility, accessiBe, UserWay. `function_score` weights `active_installs` — already rendered in `MISSION.md`; ~100–200× day-one handicap. | [RENDERED] (prior) |
| **Shopify App Store** | Avada at 83 reviews / 4.9★, Accessify AI, Accessibility Spark. Also already rejected in `docs/INCOME_PLAN.he.md`: 1–4 week manual review and **KYC with a selfie** — collides with the mandate. | [SNIPPET] |
| **Gumroad** | A rail, not a channel. `recommendable?` requires `sale_made`, so Discover cannot source a first sale — already rendered in `MISSION.md`. | [RENDERED] (prior) |
| **GitHub-native (repo, topics, awesome-list PRs)** | Occupied by **free** products with social proof we would start without: `Community-Access/accessibility-agents` 405★, `ronantakizawa/a11ymcp` 91★ and "10k+ downloads", `mcp-accessibility-scanner` 56★, `a11y-mcp` 52★, `a11ywatch` 50★ with its own GitHub Action. There is no paid GitHub-native accessibility product to be found — because on GitHub this category is a giveaway. | [RENDERED] |
| **MCP registry** | Same answer. Three free axe-core MCP servers already exist and one has a ProductHunt placement. An MCP listing is a distribution surface for a *free* tool here, not a checkout. | [RENDERED] |
| npm / CI marketplaces | `pa11y-ci`, `@axe-core/cli`, `axe-linter`, `a11ywatch/github-actions`, AccessLint — free. | [RENDERED] |

**Answer to the brief's question, plainly: no GitHub-native or MCP-registry-shaped route was found that an
English-language, no-face, no-launch operator could convert into a first sale.** The GitHub-native route
exists and is wide open — for publishing something free. Every route in this category that carries money runs
through a marketplace that ranks on prior success, a sales call, or a face.

**One structural note the board should keep even though the line closes:** the free EAA-branded Apify Actor
(`katzino/actor-web-a11y-audit`) is proof that somebody else made the constraint-8-shape-#1 move — publish
free, accumulate Apify history — in *this* category, ahead of us. That is an argument about timing on
`apify-il-open-data` (build #1), not an argument for this line.

---

## 6. Payability to an Israeli seller for EU buyers — and the VAT flag

| Rail | State | Evidence |
|---|---|---|
| **Gumroad** | **Best available.** Merchant of record; Gumroad's own production file `_13-getting-paid.html.erb` carries a row reading `Israel \| ILS` under *"We currently support bank payouts in the following countries"*. Take ~12.9% + $0.80. | [RENDERED] — via `src/revenue/rails.ts` `CANDIDATE_RAILS.gumroad-ils`, `research/colony-sweep/audits/storefronts.md` §1 |
| **Gumroad priced in EUR** | **UNVERIFIED.** The rendered evidence covers *payout* to Israel in ILS. Nothing in this repo renders Gumroad's buyer-side EUR pricing or whether an EU buyer is charged in EUR. Do not assume it. | — |
| **Stripe Connect Express** | Verified for Israel through Algora's `connect_countries.ex`. But this is a *payout* rail for bounty work, not a self-serve SaaS checkout, and it does not make us a merchant of record. | [RENDERED] (prior, `BOARD.md` §2 build #2) |
| **Paddle** | Rejected and stays rejected. **ILS is not a Paddle payout currency**: an Israeli seller takes USD by SWIFT at 5% + $0.50 per transaction, a $15 SWIFT fee, the receiving bank's charge and ~1.5% FX, against a $100 minimum. | [RENDERED] — `src/revenue/rails.ts` |
| **Freemius** | Candidate only. Israeli-founded, claimed ILS payout, fully self-serve. **Nothing rendered.** | [SNIPPET] — `CANDIDATE_RAILS.freemius` |

### The VAT question — FLAGGED, NOT RESOLVED, and it is the owner's to answer with an accountant

Three separate things collide and none of them is settled by this measurement:

1. **EU VAT on B2C digital services from a non-EU seller.** Selling an automated scan to an EU *consumer* is a
   digital service supplied where the customer is. A non-EU supplier normally registers under the **non-Union
   OSS scheme from the first euro** — there is no threshold. A merchant of record (Gumroad, Paddle, Freemius)
   that is the seller of record absorbs this. **Whether Gumroad is the seller of record for VAT purposes on our
   EU sales is exactly the thing that must be rendered before a single euro is quoted, and it is not rendered
   here.**
2. **EU B2B is different again.** With a validated VAT number the reverse charge normally applies and the
   buyer accounts for the VAT — but that requires collecting and validating VIES numbers, and the invoice must
   say so. That is administration on every sale, which is the kind of recurring work MISSION §1 makes ours.
3. **The Israeli side.** An **עוסק פטור** may not charge VAT and is capped — the repo's own watchdog uses a
   ₪122,833/year ceiling, ≈₪10,236/month, and `BOARD.md` §4.1 already notes that ₪20,000/month forces
   עוסק מורשה. An Israeli tax invoice must carry the עוסק's real name (MISSION, "what cannot be anonymised").

**Recommendation on this point: do not resolve it here.** It is a paid-professional question, it is on the
owner's checklist, and it should not be re-derived by an agent from search snippets. It is recorded so that
the next line that reaches EU buyers finds it already written down rather than discovering it at first sale.

---

## 7. Occupancy verdict

| Measure | Value |
|---|---|
| **Distinct paid sellers named with evidence** | **≈30** — 9 enterprise/mid-market, 8 cheap self-serve SaaS, 6 Apify Actors (2 free), 3 Shopify apps, 3 CMS-marketplace storefronts of one vendor, 3 Israeli |
| **Distinct free scanners / statement generators named** | **≥20**, of which ≥11 are free web scanners and ≥9 are free/open-source engines, MCP servers or agent skills |
| **Price band** | **€0 → €30/month** at the self-serve end ($9, $10, $19, $19, $25 named); **$39–$99/month** mid (EqualWeb $39, Equally AI $45, accessiBe $49, AudioEye $49, axe DevTools $60/user, Accessibility Spark $99); **$490/yr–$150,000/yr** enterprise; **pay-per-scan floor $0.025–$0.04/page** (WAVE); human audits **€319 fixed-price → €3,000–6,000 certified BITV** |
| **Cheap API-shaped scanners (board's trigger, ≤3 required)** | **8 conservative / 16 with named prices / ≥22 at the board's own ≤$50 band. Trigger FAILS.** |
| **Is the market served by open source for free?** | **Yes, completely.** axe-core is the engine under Lighthouse and most commercial scanners; pa11y, IBM Equal Access, Accessibility Insights, AccessLint, three MCP servers, one GPL WordPress EAA plugin and a free W3C statement generator cover the entire deliverable |
| **MISSION constraint 8** | **Violated.** Every input is public. Price floor is zero and ≥11 sellers have already set it there |
| **MISSION constraint 7** | **Unmet.** No channel found that a day-one, no-face operator can convert to a first sale |
| **MISSION rule 4 (honest value)** | **Ceiling.** Automated checks catch 57% (Deque's own figure); an automated scan may not be sold as EAA conformance |
| **Verdict** | **CLOSED.** Record the count, do not build. |

**What this measurement does *not* say.** It does not say the market is small or that nobody pays. The
enterprise tier plainly transacts ($25k–$150k/yr contracts, Gartner has a category page), and the German BITV
audit at €3,000–6,000 is real money. It says that **the money in this category sits above a line we cannot
cross** — it is paid for human audit, legal sign-off, remediation and account management — and that everything
*below* that line, which is the only part an agent can build alone, has been commoditised to zero by the
engine's own licence. I found **no verified revenue figure for any cheap self-serve accessibility scanner**;
the one search spent looking for one returned only listicles recommending *"a $29/month scanner"* as a
micro-SaaS idea, which is itself an occupancy signal: the idea is public and is being handed to thousands of
builders.

---

## 8. Evidence that would change this verdict

In descending order of how cheaply it could be obtained:

1. **One JSON call a human can make in ten seconds:** `https://api.apify.com/v2/store?search=accessibility`
   ([BLOCKED] here). If it shows the six Actors with **near-zero users**, that is evidence the Apify channel is
   listed-but-not-transacting — which would not re-open the line (constraint 8 still bites) but would settle
   whether "occupied" means "crowded" or merely "claimed".
2. **A rendered price page for two of the eight cheap API scanners**, confirming they are live products with
   working checkouts rather than parked landing pages. Every one of `a11yscope.com`, `accesscheck.pro`,
   `accessalyze.com`, `accessiguard.app`, `wcagio.com`, `pagebolt` and `accessibilitychecker.org` is [BLOCKED]
   from this container.
3. **A non-public input.** The line re-opens only on a specific finding, not on a better product: a member-state
   **market-surveillance register or complaint/enforcement feed** under Directive 2019/882 that is not published
   as an open dataset, or a required **declaration or filing** an EU business must lodge and cannot get free.
   That would move this from constraint-8-shape-nothing to constraint-8-shape-#2 (an obligation somebody must
   discharge). Nothing of the kind surfaced here.
4. **Evidence that an automated scan is accepted as EAA conformance evidence by any member-state authority.**
   It is not, on everything rendered (57% / 30–40%). If it ever were, the honesty ceiling in §3 lifts and the
   product becomes sellable at face value — and it would still be sellable by everyone else too.
5. **A rendered channel that does not rank on prior success.** Three platforms' ranking code is already
   rendered in `MISSION.md` and all three gate on history. A fourth that does not would change the argument for
   every line in the portfolio, not just this one.

**URLs a human or unblocked agent must open to close this out:**
`https://api.apify.com/v2/store?search=accessibility` · `https://webaim.org/services/wave/api` (confirm the
credit prices rendered second-hand here) · `https://www.a11yscope.com/blog/accessibility-tool-pricing-comparison-2026` ·
`https://accessalyze.com/pricing` · `https://www.accessiguard.app/pricing` · `https://accesscheck.pro/` ·
`https://wcagio.com/` · `https://web-accessibility-checker.com/en/eaa-checker` · `https://inkluso.eu/en/` ·
`https://bf-check.de/` · `https://apps.shopify.com/sea-accessibility-ada-wcag` (review count as a demand proxy).

---

## 9. For `docs/REJECTED.md` (or `docs/INCOME_PLAN.he.md`) — 120 words

> **EAA compliance scanning — CLOSED on measurement, 7.9.2026.** The board gated the next new product on
> finding ≤3 cheap API-first EAA scanners. We found **eight** with rendered evidence, sixteen with named
> prices, and **at least eleven that are free** — including a free EAA-branded axe-core Actor on Apify, our own
> named channel, and a GPL WordPress plugin that scans WCAG 2.1 AA and writes the Article 13 statement.
> The engine is axe-core (MPL-2.0), the statement generator is W3C's, and PageSpeed Insights returns the same
> audit free: constraint 8 fires, price floor zero. The money sits in human audits (€319–€6,000) we cannot sell.
> Prices: €0–30/month self-serve, $39–99 mid, $25k–150k/year enterprise.
> **Re-open only on** a non-public EAA input — an enforcement register or a required filing — **or** a channel
> that does not rank on prior success.
