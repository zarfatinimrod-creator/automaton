# AUDIT — group `productized-services`

Auditor: AUDITOR agent, independent of the group supervisor. Date: 2026-09-03.
Mandate: **refute, not agree.** Default verdict where evidence cannot be opened is NOT confirmed.
Standard matched: `research/colony-sweep/audits/store-promotion.md`.

## Evidence rules used here

- **RENDERED** = I fetched the page in this container and read it.
- **SNIPPET** = a search-result summary of a page the egress proxy blocks. Never presented as a page.
- **REPO** = a file in this repository, read and where possible executed.

**Domains I could not open from this container (confirmed by attempt, this session):**
`apify.com` (EGRESS_BLOCKED), `www.kaggle.com` (EGRESS_BLOCKED).
Not attempted, blocked per sibling reports: `gov.il`, `nevo.co.il`, `help.shopify.com`,
`wordpress.org`, `api.wordpress.org`, all Israeli vendor domains.

**What did render:** `github.com`, `raw.githubusercontent.com`, and this repository.
**Search budget: 1 WebSearch of the 5 permitted.** 5 WebFetch (4 rendered, 2 blocked).

---

## Headline of this audit

**The supervisor's pessimism is right, its discipline is genuinely better than the last
supervisor I audited, and its single ranked line is still dead — killed by the one test the
brief told every auditor to run on the TOP candidate and that this supervisor ran only on
candidates it had already decided to reject.**

The ranked line is "Israeli statutory price-transparency files, normalised and sold
pay-per-event on Apify Store." Two things I rendered in twenty minutes, both one click from
sources the supervisor itself used:

1. **The price floor is zero.** The same GitHub organisation whose scraper README the
   supervisor fetched (`OpenIsraeliSupermarkets`) also runs
   `daily-publish-supermarket-data` — *"Daily Cron job to publish the supermarkets data to
   Kaggle"* — publishing a **new dataset version every midnight**, plus a public website
   (`openisraelisupermarkets.co.il`), a **public API host** (`data.openisraelisupermarkets.co.il`)
   and a **FastAPI REST server** over the parsed data. The supervisor opened one file in that
   org and missed the free, maintained, normalised, daily competitor sitting in the org
   listing beside it.
2. **The slot on the named channel is already occupied.** A WebSearch of Apify Store returns
   **`apify.com/swerve/supermarket-prices` — "Israeli Supermarket Prices Scraper – Cross-Chain
   Compare"**, described as *built directly on the price files chains are required to publish
   by law*, **25 chains**, "normalizes the different portal dialects into one schema", updated
   daily, emitting barcode / itemName / manufacturer / unitPrice / chainId / storeId. That is
   the supervisor's product specification, shipped, by a creator (`swerve`) who also runs
   `madlan-analytics` and `yad2-scraper` — i.e. **an Israeli-dataset Actor portfolio already
   exists on Apify Store**, which is precisely the "thin niche where the knowledge is already
   ours" that `docs/REJECTED.md` and this report both claim nobody has constructed.

The supervisor never checked either. Its verification table has three rows; none of them asks
"does this already exist, free or paid?" about its own #1.

**Corrected group result: ₪0/month, not ₪500/month — and ₪0 net-new to the portfolio in any
case,** because the report itself concedes the line is a slice of the ₪1,500 Apify ceiling
`docs/REJECTED.md` already assigned to `store-promotion`. A board reading the ranked list will
add ₪500 to the portfolio. It must not.

What survives, and is worth more than the ranked line: the group's structural finding (the
engine is always free, the paid layer is always brand-and-sales), five well-argued RED calls,
and one buried rail note (**Freemius**) that belongs in the rails catalogue today.

---

## 1. Israeli legally-published open data as Apify Actors (rank 1, score 42) — **REFUTED**

Corrected ceiling: **₪0/month today**; a conditional **₪150–250/month at 12 months** only if
four gates clear (below), all currently open. Corrected Israel payability: **YES survives, but
not for the reason given, and never net of fees.** Corrected build: **not 30 hours** — the
30 hours were never the constraint.

### 1.1 The price-floor-of-zero test, run on the top candidate

RENDERED, `github.com/orgs/OpenIsraeliSupermarkets/repositories` (2026-09-03):

| Repo | Description | Updated |
|---|---|---|
| `israeli-supermarket-scarpers` | scraper client (the one the supervisor read), 40★ | 2026-09-02 |
| `israeli-supermarket-parsers` | parsers to process the data, 10★ | 2026-09-02 |
| **`daily-publish-supermarket-data`** | **"Daily Cron job to publish the supermarkets data to Kaggle"** | 2026-09-02 |
| **`Status`** | **"Public status page for Open Israeli Supermarkets (website, API, Kaggle freshness)"** | 2026-08-26 |
| `product-matching-service` | (no description) | 2026-06-15 |

RENDERED, `raw.githubusercontent.com/OpenIsraeliSupermarkets/Status/main/README.md`:
monitored services are the **website `https://www.openisraelisupermarkets.co.il/`**, the
**API endpoint `https://data.openisraelisupermarkets.co.il/ping`**, and the **Kaggle dataset
`erlichsefi/israeli-supermarkets-2024`**.

RENDERED, `raw.githubusercontent.com/OpenIsraeliSupermarkets/daily-publish-supermarket-data/main/README.md`:
a **new Kaggle version at midnight**, version number bound to the scrape date, and *"a FastAPI
server offering REST endpoints for accessing scraped supermarket data."*

So the free alternative is not a library the buyer must operate. It is **already-parsed data,
versioned daily, on a public dataset host, with a REST API and a public status page.** The
proposed product — parsed price rows, per-record billing, on Apify — is a strictly smaller
offer at a strictly higher price.

This is the exact test the supervisor applied, correctly and at length, to kill five other
criteria in §3.10 ("changedetection.io at 33,538★ is free", "MDN HTTP Observatory is a free
public API from Mozilla", "free OSS models score better than several paid services"). It did
not apply it to its own #1. That is the same inconsistency the `store-promotion` audit
recorded as error #7, repeated one group later.

**One caveat stated plainly, because I will not overstate my own evidence:** `kaggle.com` is
EGRESS_BLOCKED here, so I could not read the dataset's licence, freshness in practice, or
download count. The two READMEs are rendered; the dataset page is not. A human must open
`https://www.kaggle.com/datasets/erlichsefi/israeli-supermarkets-2024`. But the burden here is
the supervisor's, not mine: it ranked a paid product without ever asking what the free one
costs, and the free one exists.

### 1.2 The named acquisition channel already has this exact listing on it

SNIPPET, WebSearch 2026-09-03 (apify.com is EGRESS_BLOCKED — I did not render these pages and
do not claim to):

- **`https://apify.com/swerve/supermarket-prices`** — "Israeli Supermarket Prices Scraper –
  Cross-Chain Compare". Description quoted in the result: *"built directly on the price files
  chains are required to publish by law (the Food Price Transparency regulations), so the data
  is official, complete, and refreshed daily"*; *"logs in where needed, downloads the relevant
  store file per chain, stream-parses it, normalizes the different portal dialects into one
  schema"*; **25 chains** named (Shufersal, Rami Levy, Carrefour, Tiv Taam, Osher Ad,
  Yochananof, Keshet Taamim, Stop Market, Super Yuda…); output fields shelf price, unitPrice
  (ILS), barcode, itemName, manufacturer, weight/unit, priceUpdateDate, chainName/chainId/
  storeId/sourceFile.
- Same creator: `apify.com/swerve/madlan-analytics` ("Israel Property Market Data & Prices
  API"), `apify.com/swerve/yad2-scraper` ("Israel Real Estate API").
- `apify.com/ragu/shufersal-product-scraper` — **[DEPRECATED]** in its own title.

Three consequences, each fatal on its own:

1. **The differentiator is gone.** "Israeli statutory price data, English-keyed and typed, on
   Apify" is a description of a listing that exists. The supervisor's whole case for ranking
   this over everything else was that it is *"on our home turf… the intersection the
   `store-promotion` ranking never constructed."* Someone else constructed it.
2. **The "thin niche" claim is refuted at the portfolio level too.** `swerve` runs an
   Israeli-dataset Actor family. The repo's standing hypothesis — that Israeli data on Apify
   is unoccupied ground where a no-brand entrant can rank — is not merely untested, it is
   contradicted by the first search anyone ran.
3. **The ranking mechanism now works against us, per this colony's own rendered evidence.**
   `docs/REJECTED.md` (REPO, lines 297–300) records from Apify's own
   `how_store_works.md` / `quality_score.mdx` that store search ranking correlates with a
   quality score whose categories include **Popularity** (users running, save counts, return
   usage) and **History of success**. A zero-run listing must out-rank a live incumbent on
   categories defined by accumulated usage. The supervisor quoted the same passage as
   *"disadvantaged, not invisible"* — true, and irrelevant once the disadvantage is against a
   specific working competitor on the same query rather than against the void.

The deprecated `ragu` actor is the other half of the picture: this category has already been
entered and abandoned once. That is the `store-promotion` audit's "portfolio decay" finding
showing up in the wild.

### 1.3 The "risk nobody in my group named" is smaller than claimed — and that is worse

The supervisor's proudest verification is the geo-block: *"some chains' sites are blocked from
being accessed from outside of Israel"* — RENDERED by me too, verbatim, in the scraper README.
It made this "the single highest-value unknown in my group" and kill criterion (a).

But an actor doing exactly this **runs on Apify's cloud today**. Either the fence is partial,
or the incumbent pays for Israeli egress. Both readings hurt the ranked line:

- if partial, the supervisor's headline risk is over-weighted and the real risk (occupancy)
  went unexamined;
- if the incumbent pays for Israeli proxies, then so must we — a **recurring per-run cost**,
  which the supervisor itself says kills the line on MISSION constraint 1.

The thirty-minute probe is still worth running. It is no longer the decisive question.

### 1.4 ToS: **GREEN is not earned. Corrected to AMBER.**

The report grades ToS **GREEN** and, four lines later, writes: *"Before build, check that no
individual chain's site terms forbid automated retrieval; that check is cheap and it is not
optional."* A grade and an admission that the grade's precondition is unchecked cannot both
stand. Under this audit's default rule, unchecked = not confirmed.

Two further questions nobody in the group asked:

- **Statutory publication ≠ licence to resell.** The transparency regulations exist so
  consumers can compare prices. Whether per-record commercial redistribution is permitted by
  each chain's site terms is unexamined by every scout and by the supervisor.
- **The FTP logins.** `url.retail.publishedprices.co.il` with per-chain usernames
  (`doralon`, `SuperCofixApp`) are described by the supervisor as *"published credentials
  intended for public access."* That is an inference, not a rendered term of service. The
  incumbent actor's own description says it *"logs in where needed"* — same unexamined
  question, now with a competitor doing it.

### 1.5 The legal-mandate corroboration is overstated

The supervisor: *"The 'chains with 3+ stores must publish XML' wording comes from three
third-party repos that agree with each other (`LiorVainer/data-israel`,
`Danielrouach/SmartCart`, plus the older aggregators)."*

Against the scout it drew this from (`monitoring-alerting` §5, REPO):

- `LiorVainer/data-israel` **does** state "chains with 3+ stores must publish product prices as XML".
- `Danielrouach/SmartCart` states something **different and broader**: *"כל רשת מזון בישראל
  מחויבת לפרסם מחירים בזמן אמת"* — no store-count threshold at all.
- "the older aggregators" (`fluhus/prices`, `ganoti/prices`, `TheGiftsProject/FastPrice`) are
  listed by the scout as code, with **no quoted legal claim**.

So one repo supports the 3-store wording, one supports a different claim, and one group
supports nothing. "Three repos that agree with each other" is corroboration inflation on the
one factual pillar the supervisor calls repo-tier.

### 1.6 A cited URL that matches no source

The report cites the government index as
`gov.il/he/departments/legalInfo/cpfta_prices_regulations`.
Its scout (`monitoring-alerting` §5, REPO) cites `https://www.gov.il/he/pages/cpfta_prices_regulations`.
Different path. gov.il is egress-blocked, so neither can be opened from here — but the
supervisor changed a URL it could not open and presented the changed form as the citation.

### 1.7 The ceiling is above the mean of the portfolio it is a slice of

The supervisor derives ₪500 from: the audited Apify **portfolio** ceiling of ₪1,500/month, and
a platform mean of ~$470/developer/month on a power law. The `store-promotion` audit set
₪1,500 for *"a small, genuinely maintained set"* — 5–8 Actors. That is **₪190–300 per Actor**.
₪500 for **one brand-new listing** is 1.7–2.6× the per-Actor mean of the very portfolio the
report says it is slicing, from a zero-history account, on a query an incumbent occupies.

This is the "ceiling above the platform-wide mean" error at one level of recursion down, and
it is the specific error the brief told me to look for.

Also an evidence-grade double standard: the report has a section titled *"Numbers I refuse to
use"* which correctly rejects Apify's "$10k MRR" marketing — and then rests its entire
denominator on **$1.4M/month across ~3,000 developers**, which its own `api-middleware` scout
recorded as *"a third-party blog (agentbyline.com) claimed… treat as unverified"*. The
direction is conservative, so it does not inflate the number, but the report cannot claim to
refuse platform-adjacent snippets and then anchor on one.

### 1.8 Israel payability — verdict survives, stated basis does not

The report writes **"Israel payability: YES, but by absence"** and, two lines later,
**"Absence is not permission."** Those are contradictory in a field that is a hard MISSION
gate. Under the default rule, absence-of-a-country-list yields **UNKNOWN**, not YES.

I let **YES stand**, on evidence the supervisor did not use: the `store-promotion` audit
established two independent routes (PayPal Israel withdrawing to an Israeli bank/card in ILS
at the $20 minimum; Apify SWIFT wire from the Czech Republic at $100), and Apify's terms carry
only a sanctions clause, which Israel does not trigger.

What is missing on both sides of that number, and appears nowhere in this group report:

- **Apify platform usage cost is deducted before the 80%.** A price-file Actor downloads and
  stream-parses gzipped XML for ~25 chains per run. Nobody in this group costed a single run.
  At $0.002/record this is the difference between margin and loss, and it is unmodelled.
- **PayPal Israel, from 6 July 2026:** services moved to *PayPal Israel Payment Services Ltd.*
  and **18% Israeli VAT is charged on PayPal fees** (`payment-rails--paypal-israel.md` §F3, REPO).
- **The forfeiture clause:** accrued payout below the minimum for twelve continuous months is
  deemed abandoned (`store-promotion` audit, RENDERED from Apify's T&C). At ₪150–250/month
  gross this clause is live, not theoretical.

Every ceiling in this report is gross. There is no net-of-fees figure anywhere in the group.

### 1.9 The firstStep — the code exists, and the sequencing is wrong

**Credit where it is due, and I checked it rather than assuming:** step 3 says the shipped
Actor *"costs nothing because the code exists and passes 41 tests."* I ran it (REPO):

```
✓ test/ckan.test.ts (15 tests)   ✓ test/normalize.test.ts (12 tests)   ✓ test/run.test.ts (14 tests)
Test Files 3 passed (3)          Tests 41 passed (41)
```

Exactly 41. `.actor/actor.json`, `.actor/INPUT_SCHEMA.json`, `Dockerfile` and a README are all
present and Actor-shaped, with `ppeEvents` documented at $0.005/search and $0.002/record. **No
invented symbol, no phantom endpoint, no inflated test count.** This is the first supervisor
in this colony whose build claim survived execution.

**But the three steps are in the wrong order, and the error costs owner involvement.**

The report's own text says Apify KYC gates *pricing*, not only payout — corroborated in
`risk-governance--owner-kyc-catalogue.md` §C3 (REPO): *"billing and payment details must be
complete before pricing can be defined."* It then sequences:

> 1. geo-block probe → 2. **owner KYC** → 3. publish, monetise, and measure whether a stranger arrives.

The constraint-7 measurement — *does Apify Store search send a run from a stranger?* — does
**not require monetisation**, and therefore does not require KYC. Publishing the finished
Actor **free** and counting runs from strangers over 30 days answers the same question at
**zero owner involvement**. MISSION §1 says the owner's involvement is the thing we minimise;
this plan puts an owner step on the critical path of a test that does not need one.

**Corrected first step:** publish `apify-il-open-data` unmonetised, today, and count runs.
That is the cheapest test that a stranger can find us, it costs the owner nothing, and it is
the only action in this entire group report I would fund.

### 1.10 Maintenance is absent, again

`store-promotion`'s audit rendered Apify's own guidance: *"reserve approximately 2 hours per
week"* per public Actor, and *"respond promptly to issues through the Issues tab, where your
response time is publicly visible."* This report has a 30-hour build line and **no maintenance
line at all** for a scraper over ~25 third-party portals that change without notice. The
identical omission was flagged one group ago in the same colony.

### 1.11 Corrected verdict

**REFUTED as a ranked line.** Ceiling **₪0** until, in this order and all of them:

- (a) a free public listing of the existing Actor draws a run from a stranger in 30 days;
- (b) `apify.com/swerve/supermarket-prices` is opened by a human and a differentiator survives
  contact with it;
- (c) the Kaggle dataset's licence and freshness are read, and a reason a buyer pays per record
  for what is free daily is written down in one sentence;
- (d) chain terms and the geo-block are settled, and one run is costed net of Apify platform
  usage, PayPal fees and 18% VAT.

If all four clear, **₪150–250/month at 12 months**, ₪0 in month one, and still **₪0 net-new**
to the portfolio because it shares the account, the rail and the audited ceiling with
`store-promotion`'s #1.

---

## 2. The group headline ("₪500/month") — **REFUTED as a portfolio number**

The report says both of these:

> *"The group's honest ceiling is about ₪500/month"* (§1, headline)
> *"My single survivor is a slice of that ₪1,500, not an addition to it."* (§1, four paragraphs later)

The second sentence is the correct one and it means the group's contribution to the ₪20,000
target is **₪0 net-new**. The headline states a number that a board synthesising groups will
add. This is a milder form of the `store-promotion` supervisor's error #12 — arithmetic that
contradicts its own headline — and it is more dangerous here precisely because the rest of the
report is careful enough to be trusted.

Worse, the report **rejects §3.3 (the dedup Actor) explicitly for double-counting**: *"it
shares the Apify account, the KYC, the rail and the ₪1,500 audited portfolio ceiling with my
ranked line — ranking it separately would double-count the same ceiling."* That reasoning
applies with identical force to the relationship between its own rank 1 and
`store-promotion`'s rank 1. Applied to a rejected candidate; not applied to its own.

**Corrected group ceiling: ₪0/month net-new. ₪0 in month one. ₪0 at twelve months** unless the
four gates in §1.11 clear, and even then the number belongs to the Apify portfolio line that
already exists in the ledger's plan, not to this group.

---

## 3. Rejections I checked and would keep

I attacked these looking for a candidate the supervisor buried. I did not find one here — these
four kills are sound, and two of them are better-argued than anything in the ranked section.

- **§3.5 contact / lead / people-data enrichment — CONFIRMED RED.** Two independent legal
  grounds (Amendment 13 data-broker registration + a **named human DPO**, which is an ongoing
  human role and therefore a MISSION §1 violation, not a KYC step; GDPR Art. 14 with the
  15 May 2025 CNIL fines). The scout's framing — *"the money and the legality sit on opposite
  sides of this criterion"* — is the single best sentence produced by this group.
- **§3.6 overlay / "instant compliance" widget — CONFIRMED RED.** FTC v. accessiBe,
  $1,000,000, final order April 2025, plus Tel Aviv District Court rulings from 2022. Correct,
  and correctly framed as a constitution question rather than a risk question.
- **§3.7 personalised Hebrew legal documents / tax representation — CONFIRMED RED.** s.20 of
  חוק לשכת עורכי הדין and the 2005 tax-representation law, with the ע"א 4223/12 discretion test.
  Repo-tier evidence, correctly graded as such by both scout and supervisor.
- **§3.2 everything gated on Shopify — CONFIRMED as parked, not ranked.** Four scouts hit the
  same unknown payout gate; refusing to rank a line whose rail is unknown is exactly what
  MISSION requires. This is the supervisor's best judgement call.

**§3.1 (Hebrew WordPress accessibility checker) — CONFIRMED kill, and for a fifth reason the
supervisor did not reach:** even setting aside occupancy and the missing `active_installs`
reading, `docs/REJECTED.md` records the WordPress plugin review queue at **4,715 plugins,
3,854 older than 7 days** (31 Aug 2026) — an unbounded human-gated wait before the channel
even opens. The kill stands.

---

## 4. Supervisor's own errors

1. **The price-floor-of-zero test was never run on the top candidate.** Free, daily, normalised
   Israeli supermarket price data with a REST API and a public status page is published by the
   same GitHub org the supervisor fetched from. Two clicks from its own verification row #1.
2. **The occupancy test was never run on the top candidate.** `apify.com/swerve/supermarket-prices`
   ships the exact product specification, on the exact named channel, with 25 chains. The
   supervisor ran occupancy checks on §3.1 and §3.3 — candidates it was rejecting — and not on
   the one it ranked.
3. **"On our home turf, the intersection nobody constructed" is false.** The creator `swerve`
   runs an Israeli-dataset Actor portfolio (supermarket prices, Madlan, Yad2). The repo's
   standing hypothesis that Israeli data on Apify is unoccupied ground is contradicted.
4. **ToS graded GREEN while its own precondition is stated as unchecked and "not optional".**
   Corrected to AMBER.
5. **Corroboration inflated.** "Three third-party repos that agree with each other" on the
   3-store publication threshold: one states it, one states a materially different claim, one
   states nothing. This is the load-bearing legal pillar of the ranked line.
6. **A citation URL altered.** `gov.il/he/departments/legalInfo/cpfta_prices_regulations`
   against the scout's `gov.il/he/pages/cpfta_prices_regulations`. Neither is openable from
   here; only one is what the source said.
7. **Ceiling above the mean of its own comparable.** ₪500 for one new listing against
   ₪190–300 per Actor implied by the audited ₪1,500 / 5–8-Actor portfolio it says it is slicing.
8. **Evidence-grade double standard.** Refuses Apify's "$10k MRR" marketing by name, then
   anchors its denominator on the $1.4M/~3,000 figure its own scout marked "treat as unverified".
9. **Israel payability asserted YES on absence of evidence, in a field MISSION makes a hard
   gate,** with "absence is not permission" written directly underneath. The verdict survives on
   other evidence; the reasoning does not.
10. **Owner KYC placed on the critical path of a test that does not need it.** The
    constraint-7 discovery measurement runs on a free listing at zero owner involvement. The
    report's own text ("KYC gates pricing") contains the fact that makes its own ordering wrong.
11. **No maintenance line and no cost-of-goods line anywhere in the group.** Apify's own ~2h/week
    per public Actor plus a publicly-visible support response time; Apify platform usage cost
    deducted before the 80%; PayPal fees and 18% Israeli VAT since 6 July 2026. Every number in
    the report is gross.
12. **Headline states a group ceiling the report elsewhere concedes is not additive** — while
    rejecting another candidate explicitly for that same double-count.
13. **Two GREEN, Israel-payable, same-rail candidates from its own scouts were dropped without
    a single sentence** (see §5.1 and §5.2). The report's `rejected` section is otherwise
    exemplary in showing its working, which makes silent omission the harder failure to catch.

**What the supervisor got right, stated because an auditor that only prosecutes is useless:**
the scout inventory is accurate to the byte against `ls`; the "41 tests" claim executes and is
exactly 41; the structural finding (free engine, branded packaging) is correct and load-bearing;
five RED calls are properly evidenced; the "Numbers I refuse to use" section is the right habit;
and §6 ("where to attack this first") named the Apify channel hypothesis as its own weakest
point. Nobody in this group padded or invented a source.

---

## 5. Angles the group missed entirely

### 5.1 The European Accessibility Act — the demand engine its own scout called the biggest, dropped without a word

`compliance-scanners` (REPO, §2) reports the **EAA applying from 28 June 2025**, reaching
e-commerce services sold to EU consumers **regardless of where the seller is located**, with a
narrow microenterprise exemption (<10 employees AND ≤€2m, services only) and EN 301 549 /
WCAG 2.1 AA as the conformance standard. The scout wrote: *"That is the single biggest reason a
scanning product has buyers in 2026."* Its finding #2 was **"EAA / EN 301 549 scan-as-API on
rails we already own (Apify pay-per-event, x402). GREEN."**

The word "EAA" does not appear once in the group report. Neither does "European". The
supervisor killed the *Israeli/Hebrew* accessibility product on Israeli/Hebrew grounds (§3.1)
and never engaged with the EU-driven, same-rail, same-shape candidate its scout ranked second.
This is structurally identical to the ranked line — compute over a free engine, sold
pay-per-event on Apify — and it addresses a market two orders of magnitude larger with a dated
statutory trigger. It may well fail the same occupancy test. **It was never given one.**

### 5.2 Pre-consent tracker scanning, and non-operative Israeli business documents

Two more GREEN scout findings vanish without mention:

- `compliance-scanners` finding #3: **pre-consent tracker scanner** (what fires before the
  cookie banner is answered), white-label agency report. The scout's own comparable is
  CookieRisk at **€149/month for 25 monitored sites**, agency-shaped and self-serve.
- `document-generation` finding #3: **non-operative Israeli business documents** —
  הצעת מחיר / proforma / דרישת תשלום / delivery note — explicitly *outside* the allocation-number
  regime and outside the incumbent accounting platforms' monopoly, and on the safe side of both
  the s.20 and tax-representation lines the supervisor documented so well.

Neither appears in §3's fifteen numbered rejections. A rejected-with-reasons section that omits
two of its own scouts' GREEN findings is not a complete disposal.

### 5.3 Freemius is the group's most valuable output and it is filed under "scout quality"

`localization` found: **Freemius — Israeli-founded, supports ILS payouts with no conversion
fee, pays via Wire / Wise / Payoneer / PayPal, fully self-serve checkout, no buyer contact.**
The supervisor recognised it (*"belongs in the rails catalogue and should outlive this group"*)
and then left it in §5, a section about how good the scouts were, with no action, no owner step,
and no entry in the ranked or rejected lists.

MISSION requires that one rail failing must not take the company down, and this repo's Israeli
rails are thin (PayPal — now with 18% VAT on fees; Payoneer; Etsy/Gumroad ILS deposit). An
ILS-native, self-serve, Israeli-founded rail is a direct answer to the hard gate that killed
four candidates in this very group. **It should be in `docs/` today, not in a scout report card.**

### 5.4 Nobody asked whether an agent may operate the seller-support obligation

Apify requires public Actors to answer issues with a **publicly visible response time**. Every
Apify-shaped candidate in this repo assumes an agent does that. Whether Apify's terms permit an
automated account to hold that obligation, and whether an agent answering a stranger's support
ticket is inside or outside "the owner does not talk to customers", is unexamined across the
whole colony. It is the hidden human-shaped work in the one line sold as needing no human.

### 5.5 Nobody costed a single run

Not one number in this group is net. Apify platform usage is deducted **before** the 80%; the
ranked line's workload is bulk gzipped-XML download and parse across ~25 portals; the payout
minimum is $20 with a 12-month forfeiture clause; PayPal fees now carry 18% Israeli VAT. A
₪150–250/month gross line can be a ₪0 net line, and nothing in this report would reveal it.

### 5.6 The group never asked what it contributes to a portfolio

MISSION's design requirement is *several stores, each with its own buyer, its own rail and its
own kill criteria*. This group returns one candidate that shares a buyer surface, an account, a
KYC, a rail and a ceiling with a line another group already ranked. Under MISSION constraint 2
that is not a store. The honest one-line summary of this group is: **it found no store, and it
found one good rail and one good rule.**

---

## 6. For the chief auditor — the three things that actually matter here

1. **Publish `apify-il-open-data` free, today, and count runs from strangers for 30 days.**
   Zero owner involvement, zero build, zero money. It is the cheapest test of MISSION
   constraint 7 available anywhere in this repo, and every Apify ceiling in the colony —
   ₪1,500, ₪500, mine — resolves to ₪0 or to a measurement on its result.
2. **Open `https://apify.com/swerve/supermarket-prices` and
   `https://www.kaggle.com/datasets/erlichsefi/israeli-supermarkets-2024`.** Both are
   EGRESS_BLOCKED here. They decide whether the ranked line has any residual value, and they
   also test the repo-wide assumption that Israeli data on Apify is unoccupied ground.
3. **Put Freemius in the rails catalogue.** It is the only durable asset this group produced and
   it is currently buried in a paragraph grading a scout.
