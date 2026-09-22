# Group report — `productized-services`

**Supervisor:** SUPERVISOR `productized-services` (Opus 5). **Date:** 2026-09-03.
**Scouts read: 8 of 8 on disk.** Counted with `ls`, not inferred from the brief:

1. `productized-services--api-middleware.md` (5.7 KB)
2. `productized-services--automated-audits.md` (10.6 KB)
3. `productized-services--compliance-scanners.md` (12.8 KB)
4. `productized-services--data-enrichment.md` (13.2 KB)
5. `productized-services--document-generation.md` (17.4 KB)
6. `productized-services--localization.md` (7.2 KB)
7. `productized-services--monitoring-alerting.md` (11.1 KB)
8. `productized-services--pdf-ocr.md` (14.2 KB)

Also read: `MISSION.md`, `docs/REJECTED.md`, `products/apify-il-open-data/README.md`.

**Verification I did myself (not inherited):** 2 free GitHub raw fetches, 1 WebSearch of the 5
permitted. Results in §4 — one of them changed a ranking and one of them killed a candidate.

---

## 1. Headline

**One line survives. The group's honest ceiling is about ₪500/month, and ₪0 in month one.**

That is the whole result and I am not going to dress it up. Seven of the eight criteria in this
group describe the same market structure, and the structure is hostile in a specific,
checkable way:

> **The engine is always free and the packaging is always sold by someone with a brand.**
> Lighthouse, axe-core, MDN HTTP Observatory, Splink, changedetection.io (33,538 stars),
> MinerU/PaddleOCR-VL, DeepL's RTL-preserving document translation, three separate MIT RTL
> text packages shipped in 2026 — every detection, extraction, dedup, scan and translation
> engine in this group is free, and several free ones score *better* than the paid services
> (OmniDocBench: free OSS 0.125–0.145 vs Mistral OCR 0.268 at $1/1,000 pages). What is
> actually paid for — client portals, white-label PDFs, scheduling, account management,
> agency reselling — is the brand-and-sales layer that MISSION §1 forbids us to staff.

Three scouts reached that conclusion independently (`automated-audits` §"structural finding",
`pdf-ocr` §6, `localization` §"judgement"), and I could not find a counter-example.

The one place a software-only, brandless seller demonstrably gets paid is a marketplace whose
own search does the distribution. In this group that is **Apify**, and `docs/REJECTED.md`
already audited the whole-portfolio ceiling there to **₪1,500/month**. My single survivor is a
slice of that ₪1,500, not an addition to it.

**This group does not reach ₪20,000/month. It does not reach ₪2,000/month.** Recorded plainly
so no future session re-derives optimism from the same files.

---

## 2. The one ranked line

### 1. Israeli legally-published open data as Apify Actors — score 42

**What it is.** Extend the already-built `products/apify-il-open-data` Actor family with a
second data source: the retail price and promotion files that Israeli chains are *required by
law* to publish machine-readably (`תקנות קידום התחרות בענף המזון (שקיפות מחירים), תשע"ה-2014`).
Sold pay-per-event on Apify, English-keyed and typed, the same shape as the shipped data.gov.il
Actor.

**Why this one and nothing else.** It is the only candidate in the group that is simultaneously:

- **compute + normalisation over data with no owner** — the exact durable shape the
  `api-middleware` scout derived from the obsolescence evidence (wrappers over *someone's* API
  die: Reddit 2023, Tesla's official API, Apple Ads shutting the old Campaign Management API on
  2027-01-26). Nobody can deprecate a statutory publication duty on us;
- **on a channel we can name** (below);
- **on our home turf**, which is the intersection `docs/REJECTED.md` says the `store-promotion`
  ranking never constructed: *"Israeli-dataset Actors on Apify Store, extending
  `products/apify-il-open-data`, where the niche is thin and the knowledge is already ours."*
  Four of that group's five survivors competed with the whole world on generic ground. This
  does not.

**Acquisition channel, per MISSION constraint 7.** Apify Store's own search and category
ranking. This is nameable at the level the constraint demands, and the naming is *audited*
rather than asserted: `docs/REJECTED.md` records that `how_store_works.md` ties store search
ranking to a quality score whose categories include Popularity and History of success, and
that **five of the eight categories are controllable on day one** — "disadvantaged, not
invisible". A brand-new listing with a complete README, input schema, examples and a clean
build is not structurally excluded, which is more than any other channel in this group can say.
It is still a hypothesis, which is why the first step tests it before anything is built.

**Money model.** Apify pay-per-event, developer share 80% of revenue minus platform usage cost
(rendered by the `api-middleware` scout from Apify's own docs repo). Store prices commonly
$1–10 per 1,000 results.

**Israel payability: YES, but by absence.** I re-fetched
`apify-docs/sources/platform/actors/monetizing/monthly-payouts.mdx` myself: payout minimum
**$20 for PayPal and Wise**, $100 for other methods, funds below roll over, and KYC is required
("Apify verifies that everyone receiving payments is who they say they are"). **No supported-
or restricted-country list appears in that file and Israel is not mentioned.** Absence is not
permission. Confirm at first payout.

**Honest ceiling: ₪500/month at 12-month maturity, ₪0 in month one.** Derivation, so an auditor
can attack the arithmetic rather than the vibe: the audited ceiling for an *entire* Apify
multi-Actor portfolio is ₪1,500/month; Apify pays ~$1.4M/month across ~3,000 developers, a mean
of ~$470 on a power-law distribution, so the median earns far less than the mean; a new
Israeli-data listing is one slice of one portfolio. Anything above ₪500 would be putting a
brand-new entrant above the mean of everyone already there, which is the exact error
`store-promotion` was corrected for.

**Numbers I refuse to use, and why.** Two of my scouts quoted Apify's help page claiming "top
independent creators exceed $10k MRR" and "many exceed $1k/mo". That is a platform advertising
its best creators. It is not a benchmark for a new listing and it is not in my ceiling.

**Build: ~30 hours.** The scraper layer already exists as maintained open source
(`OpenIsraeliSupermarkets/israeli-supermarket-scarpers`, ~35 chains enumerated). The work is
normalisation, typing, PPE metering and the listing — not scraping.

**The risk nobody in my group named, which I found while verifying.** That repo's README says
plainly: **"some chains' sites are blocked from being accessed from outside of Israel."** Apify
Actors run on Apify's cloud, outside Israel. If the chain portals geo-fence, this line either
does not work at all or needs Israeli residential proxies — a *recurring per-run cost*, which
is a direct hit on MISSION constraint 1 (marginal cost per store approaching zero) and would
kill it. **This is the single highest-value unknown in my group and it is testable in about
thirty minutes.**

**ToS: GREEN.** The data is published under a statutory transparency duty for public
consumption, and the government maintains an index of the retailer URLs
(`gov.il/he/departments/legalInfo/cpfta_prices_regulations`, linked from the scraper repo).
Some chains publish over FTP with per-chain public usernames (`doralon`, `SuperCofixApp`) —
published credentials intended for public access. Before build, check that no individual
chain's site terms forbid automated retrieval; that check is cheap and it is not optional.

**Evidence grade: repo-tier for the legal mandate.** I fetched the scraper repo's README
myself and it does **not** state the legal requirement in its own words — it links the gov.il
regulations page. The "chains with 3+ stores must publish XML" wording comes from three
*third-party* repos that agree with each other (`LiorVainer/data-israel`,
`Danielrouach/SmartCart`, plus the older aggregators). gov.il and nevo.co.il are egress-blocked.
The mandate is not in doubt; its exact scope and update-frequency clause are.

**Owner blockers.** One-time Apify KYC (government photo ID) — a legitimate MISSION §1
exception, **not assumed done**. Note the `risk-governance` finding that Apify KYC gates Actor
*pricing*, not only payout: we cannot monetise before it. Plus the ordinary Israeli tax-status
step already catalogued elsewhere. Nothing here needs the owner to talk to anyone or appear on
camera.

**First step — and it is deliberately not the product.** MISSION constraint 7: *"the first
thing built on any line is the cheapest test that a stranger can find it."*

1. (30 min, today, free) Probe two chain endpoints from this container and from an Apify run to
   settle the geo-block question. If they are fenced and only Israeli-IP proxies work, **stop
   here** — the line is dead on constraint 1.
2. (owner, one-time) Apify KYC, so the existing Actor can be priced.
3. (0 build hours) Publish and monetise the **already-built** `apify-il-open-data` Actor and
   measure, for 30 days, whether Apify Store search sends a single run from a stranger.

Step 3 costs nothing because the code exists and passes 41 tests. It converts constraint 7 from
an assumption into a measurement, on an asset we already own, **before** anyone writes the
price-transparency code. If zero strangers arrive in 30 days on a finished, well-documented
Actor, the channel hypothesis is refuted and every Apify ceiling in this repo — mine included
— goes to ₪0.

**Kill criteria.** Any one of these ends it: (a) chain portals require Israeli-IP proxies,
i.e. a recurring per-run cost; (b) the existing Actor draws zero runs from strangers in 30 days
after monetisation; (c) 90 days after listing, cumulative revenue is under $20, i.e. below the
PayPal payout threshold; (d) any chain's terms are found to forbid automated retrieval.

---

## 3. Rejected, with reasons

Ordered by how close each came.

### 3.1 Hebrew-first WordPress accessibility checker (ת"י 5568 + הצהרת נגישות generator)

This was my intended second rank and **my own verification killed it.** It is the closest call
in the group, so the working is written out.

What made it attractive: the Israeli legal obligation is real and rendered from four
independent third-party repos that agree — `תקנה 35` of the 2013 service-accessibility
regulations, `ת"י 5568` level AA, compliance due since October 2017, **statutory damages up to
₪50,000 per claim without proof of harm**, and suits are common in practice. Incumbents
transact at ₪450–850 one-time. wordpress.org directory search is a genuine channel where a new
entrant is ranked on relevance rather than install history.

What killed it, in order:

1. **The slot is occupied and I checked.** My one WebSearch returned `wp-accessibility-helper`
   (Hebrew language support **and** a DOM scanner) and `wp-accessibility` (Hebrew support), plus
   Editoria11y (free, open source, multilingual) and Equalize Digital. So the differentiator is
   not "Hebrew accessibility checker" — that exists. It shrinks to "5568/regulation-35 mapping
   plus a correctly-worded statement draft", which is a thin wedge on a low-volume Hebrew query.
   I cannot say why a no-brand new entrant places on any query with volume, and constraint 7
   says that is exactly the sentence I must be able to write.
2. **Demand is unmeasurable from here, in either direction.** `api.wordpress.org` and
   `wordpress.org` are egress-blocked, so there is no `active_installs` reading.
   `docs/REJECTED.md` already cut a WordPress plugin to ₪200 for precisely this and said "there
   is no demand number at all, in either direction". Re-proposing a WP plugin without closing
   that gate would be the supervisor failure that file exists to prevent.
3. **Guideline 5 forbids trialware in the directory** (audited, in `docs/REJECTED.md`), so the
   paid code must ship outside the directory — a real design cost the compliance scout never
   costed.
4. **The honest product cannot sell what the buyer wants.** axe-core's own docs say automated
   testing finds ~57% of WCAG issues; certification requires a licensed מורשה נגישות, a human
   act. The buyer wants compliance; we can only sell findings. Selling more than that is the
   FTC/accessiBe fact pattern — **$1,000,000, final order April 2025** — and Tel Aviv District
   Court rulings from 2022 say an accessibility menu does **not** satisfy 5568 on its own.

**Reopens if:** an `active_installs` reading and a directory search-volume reading are obtained
from an unblocked network and show a real Hebrew query with no 5568-specific incumbent.

### 3.2 Everything gated on Shopify — the group's loudest unresolved gate

**Four of my eight scouts independently hit the same wall** (`automated-audits` §11,
`data-enrichment` §E6/Q1, `monitoring-alerting` §4, `localization` dead-end 5): **Shopify
Partner payouts to Israel are UNKNOWN**, payouts are PayPal-or-real-bank via Hyperwallet, and
virtual accounts such as Payoneer are reportedly not supported — which removes the workaround
this repo established as the Israeli rail. Shopify *Payments* separately does not serve Israeli
merchants (39 countries as of June 2026, Israel not among them), which also shrinks the
Israeli-merchant buyer pool.

This blocks the two best-priced buyers anyone in my group found: the duplicate-customer /
order-merge app niche (visible pricing at $9.99/mo) and competitor price tracking ($1.99–$49.99/mo,
one app at 4.6★ with 68 reviews). Payability to Israel is a hard gate in MISSION, so these are
**parked, not ranked**. I will not rank a line whose rail is unknown.

**Reopens if:** a human opens `help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method`
from an Israeli account and Israel is supported. That single page unblocks more measured
willingness-to-pay than anything else in this group.

### 3.3 Generic dedup / data-cleaning Actor

GREEN, Israel-payable, ~15h, engine free and excellent (Splink: ~1M records linked on a laptop
in about a minute, government-built). Rejected as a **line** for two reasons. First, the
category is already occupied on Apify ("Dataset Cleaner & Formatter"). Second and decisively,
it shares the Apify account, the KYC, the rail and the ₪1,500 audited portfolio ceiling with my
ranked line — it is not an independent storefront under MISSION's "several stores" rule, so
ranking it separately would double-count the same ceiling. Keep it as a *mode inside* the
ranked Actor family at near-zero incremental build.

### 3.4 Israeli record normalisation (ת.ז. checksum, Hebrew name variants, phone/address)

Same double-counting problem, plus its own scout wrote **"unknown, no demand evidence"**. Also
worth stating so the moat is never claimed: the detector already exists in this repo —
`products/x402-il-api/src/israeli.ts` implements the ת״ז checksum, the phone regex set and the
Bank of Israel institution codes. That makes it cheap to add, not defensible to sell.

### 3.5 Contact / lead / people-data enrichment — RED on law, twice

The only part of the enrichment criterion with real money, and it is closed on two independent
legal grounds. Israel's Privacy Protection Law **Amendment 13 (in force 14 August 2025)** keeps
registration mandatory for databases commercialising personal data, with a data-broker trigger
at >10,000 data subjects, and requires a **named human DPO** — an ongoing human role, not a
one-time KYC step, so MISSION §1 forbids it. GDPR **Article 14** requires notifying people whose
data we obtained from third parties, which a company with no humans cannot satisfy; CNIL fined
CALOGA €80,000 and SOLOCAL €900,000 on 15 May 2025 for exactly this shape. **The money and the
legality sit on opposite sides of this criterion.** Reopens if: nothing.

### 3.6 Overlay / "instant compliance" accessibility widget — RED

The highest-margin, lowest-build idea in the group. FTC fined accessiBe **$1,000,000** (final
order April 2025) over "automatically comply" claims. Israeli district court rulings (2022+)
say an accessibility menu, overlay or otherwise, does not alone satisfy ת"י 5568. Recorded so
nobody rediscovers it. Reopens if: nothing.

### 3.7 Personalised Hebrew legal documents; filing or representing before רשות המסים — RED

`s.20` of חוק לשכת עורכי הדין reserves drafting legal documents for another person;
חוק הסדרת העיסוק בייצוג על ידי יועצי מס reserves representation before the tax authority. The
controlling test (ע"א 4223/12, 25.6.2014) turns on **discretion exercised on behalf of an
identified person** — form completion is permitted, strategy selection is not. Licence wall,
not a market gap. The FTC's DoNotPay order ($193,000, prohibited from claiming lawyer-like
performance without evidence) is the binding copy rule for anything we ever ship near this line.

### 3.8 Hebrew/RTL document templates sold as files (Etsy / Gumroad)

**No nameable channel.** Etsy ranking is conversion-history-locked for a shop with no sales, and
Israeli buyers do not shop Etsy for a Hebrew lease contract; Gumroad has no meaningful discovery
surface. The one Hebrew demand datum — `חוזה שכירות`, 3,600/month at KD 18, "wide open" — comes
from *one competitor's private SEMrush export committed to a public GitHub repo*, and cashing it
would require ranking a new no-brand Hebrew domain in Google, which constraint 7 explicitly says
is not a channel. An Israeli operator (`The-new-ben/justice-theme`) already runs 50 Hebrew
document tools monetised as lawyer lead-gen — a model requiring humans, which we cannot copy.

### 3.9 Hebrew/RTL PDF rendering API

The sharpest *technical* finding in the group and still not a line. `foliojs/pdfkit#219`
("RTL support for Hebrew and Arabic") has been **open since 5 April 2014** — twelve years in the
most-used Node PDF library, rendered evidence. But the same scout records the consensus fix:
**headless Chrome implements the Unicode bidi algorithm correctly**, so every serious developer
already has a free workaround. An npm package pays ₪0 (npm has no payment rail), and a hosted
API would land on Apify or RapidAPI — the same rail and ceiling as my ranked line. Keep the
knowledge; do not open a store for it.

### 3.10 The commodity floor — five criteria that end at ~₪0

Recorded together so they are not re-searched. **Uptime monitoring**: free tiers at 10–50
monitors, plus Gatus (11,974★) and Uptime Kuma self-hosted. **Website change monitoring**:
changedetection.io at 33,538★ is free, self-hostable *and* already monetised. **Security-headers
audits**: MDN HTTP Observatory is a free public API from Mozilla. **Core Web Vitals**:
DebugBear/Calibre/Treo hold $75–79/mo with RUM infrastructure and brand. **Email verification**:
$0.002–0.01 per email from vendors with years of SMTP reputation. **Raw OCR**: $1–1.50 per 1,000
pages, and free OSS models score better than several paid services. **TLS/domain expiry**: ships
free inside the self-hosted tools. None of these is a business for a brandless entrant; several
are fine as lead magnets, which is not what this sweep is for.

### 3.11 Sales-led tiers, and marketplace gig delivery

**Regulatory-change monitoring at $200–2,000/mo** and **enterprise accessibility/GRC** are bought
after a demo — a human on the sell side, forbidden by MISSION §1. **AWS Marketplace** is the same
shape (and note the useful payability datum below). **Fiverr/Upwork** data-cleaning at $45–50 and
SEO audits at $10–20 are real clearing prices, but delivery is buyer conversation, scope
negotiation and revisions; an agent operating a seller persona would deceive the buyer and breach
both the marketplace's terms and our constitution. **Cold outreach off scan results** is doubly
out: fear-selling, and תיקון 40 to the communications law sets ₪1,000 per message in statutory
damages without proof of harm.

---

## 4. What I verified myself, and what it changed

Budget: 5 WebSearch permitted, **1 used**. Two free GitHub raw fetches (github.com and
raw.githubusercontent.com are the only reliably unblocked hosts, which is also why the
GitHub-first pattern is the one future scouts should lead with).

| # | Check | Result | Effect |
|---|---|---|---|
| 1 | `raw.githubusercontent.com/OpenIsraeliSupermarkets/israeli-supermarket-scarpers/master/README.md` | ~35 chains enumerated; links the gov.il transparency-regulations page rather than stating the mandate itself; **"some chains' sites are blocked from being accessed from outside of Israel"** | Added the geo-block kill criterion and demoted the legal claim to repo-tier. No scout had this. |
| 2 | `raw.githubusercontent.com/apify/apify-docs/.../monthly-payouts.mdx` | $20 PayPal/Wise, $100 other, rollover, KYC required; **no country list, Israel not mentioned** | `israelPayable` stated as YES-by-absence, flagged, confirm at first payout. The 80% share is not in that file — it is in `how_actor_monetization_works.md`, which the `api-middleware` scout rendered. |
| 3 | WebSearch, Hebrew WordPress accessibility plugins | `wp-accessibility-helper` already ships Hebrew **and** a DOM scanner; Editoria11y and Equalize Digital hold the checker slot | Killed my intended second rank (§3.1). |

**Claims I demoted for lack of support**, as required:

- "Etsy shops with 20–30 listings hit $3,000–$6,000/month" — from a site that sells advice to
  Etsy sellers. Its own scout flagged it. Not used.
- "Top Apify creators exceed $10k MRR / many exceed $1k/mo" — the platform advertising its best
  creators. Quoted by two of my scouts. Not used; `docs/REJECTED.md` already corrects it to a
  ~$470 mean on a power-law across ~3,000 developers.
- FinBot's "97% accuracy", Mistral OCR 4's Hebrew claims, and "a $29/mo proposal generator at
  $5k–$20k MRR" — all vendor marketing or content-farm listicles with no named product. Not used.
- The Israeli accessibility exemption threshold is **contradictory inside a single rendered
  source** (₪100,000 statutory text vs an unsourced ~₪1,075,000 indexed estimate). Unresolved.
  No marketing copy may rest on either figure.
- The DebugBear entry price is given as $39, $49 and $79 by three aggregators. Unresolved.

---

## 5. Scout quality — named honestly, because my auditor will check

**Thin:**

- **`api-middleware`** — the shortest file in the group (5.7 KB) and the weakest per byte. Its
  one load-bearing payability claim (AWS Marketplace lists Israel as an eligible seller
  jurisdiction) rests on a **third-party skill file, explicitly not an AWS primary source**, and
  the scout said so. Everything else is snippet. It produced no quantified finding of its own.
  Its structural read on obsolescence is genuinely good and I used it — but a structural read is
  not evidence, and this scout returned almost none.
- **`localization`** — 7.2 KB, and its own verdict is "the criterion is thin". Fair and
  self-declared. Its rendered evidence is three small GitHub repos (max 23 stars); every
  commercial claim is snippet. Its lasting value is one rail note, not a candidate: **Freemius
  is Israeli-founded, supports ILS payouts with no conversion fee, and pays via
  Wire/Wise/Payoneer/PayPal, fully self-serve.** That belongs in the rails catalogue and should
  outlive this group.

**Not thin, and said so about themselves:** `data-enrichment` reported that GitHub search
returned 0 results for two unrelated queries in its session — the lever that carried its
siblings was unavailable to it — and it still rendered Splink and built the legal case that
closed the criterion. That is the right way to fail a search.

**Best-evidenced:** `document-generation` (17.4 KB, an actual controlling case with a citation,
a rendered 12-year-old GitHub issue, per-claim evidence tiers), `compliance-scanners` (four
rendered sources, and it spent only 6 of its 8 searches by leading with GitHub),
`monitoring-alerting` and `pdf-ocr` (both graded every claim and listed the exact URLs a human
must open). `pdf-ocr` also names its own biggest hole out loud — no character-error-rate figure
for Hebrew was obtained from any source — which is the standard.

**Nobody in this group padded, invented a URL, or quoted a number without marking its grade.**
Given that two supervisors have now been caught ranking candidates they had argued against, I
will state the converse plainly: my ranked list has one entry because one entry is what the
evidence supports, and its ceiling is ₪500 because ₪500 is what the audited comparables give.

---

## 6. For the auditor — where to attack this first

1. **The geo-block.** If Israeli chain portals fence non-Israeli IPs, my only ranked line dies
   on MISSION constraint 1. Thirty minutes settles it and I did not have the egress to.
2. **The Apify channel hypothesis itself.** My whole ranking rests on Apify Store search sending
   runs to a zero-history listing. That is untested by this colony, and my first step is designed
   to test it on an asset we already own before anything new is built. If it fails, this group's
   result is not "₪500" — it is **₪0**, and so is every other Apify ceiling in the repo.
3. **The Shopify payout page.** One page unblocks the two best-priced buyers my scouts found. It
   is the highest-value single URL in this group and it needs a human on an Israeli connection.
