# Scout: `licensing-ip / dual-licensing`

**Criterion.** Dual-licensing open-source libraries (AGPL plus commercial): who succeeds at it,
the revenue shape, and whether it needs a sales human.

**Date:** 2026-09-05. **Searches spent:** 7 of the 8 allowed. **Free GitHub fetches:** 8.

## Evidence strength key
- **rendered** — I fetched the page/file and read its text.
- **snippet** — a WebSearch result quoting the page. Weaker. The URL to open is named.
- Nothing below rests on memory. Where I could only reason, it says so.

---

## 1. The structural precondition: you must own all the copyright (CLA)

You cannot dual-license code you do not wholly own. Every dual-licensed project either takes a
CLA or was written by one person.

| Claim | Evidence | Source |
|---|---|---|
| CLA exists *specifically* to enable AGPL + commercial dual licensing | **rendered** (GitHub `search_code`, 44 hits) | `ha7ilm/csdr/CONTRIBUTING.md`: *"The ICLA is needed because it will allow me to dual license the OpenWebRX project under AGPL and a commercial license."* |
| Same pattern, academic project | **rendered** | https://raw.githubusercontent.com/FLAMEGPU/FLAMEGPU2/master/CONTRIBUTING.md — *"AGPL-3.0-only license for open source usage"* + *"A commercial licenses for cases where the use of the open source AGPL-licensed version is not possible or desirable"*, CLA required via CLA-assistant |
| Same pattern, commercial | **rendered** | `TestPlanIt/testplanit/CONTRIBUTING.md`: *"Sign the Contributor License Agreement (CLA): This allows us to distribute your contributions under our dual license model."* |

**Consequence for us:** a solo-authored library is *free* of this problem, and it is the one part
of dual licensing that costs an agent-run operation nothing. The moment an outside PR is merged
without a CLA, the commercial licence becomes unsellable.

---

## 2. Who actually succeeds — four distinct revenue shapes, only two of which are sales-free

### 2a. Escape-hatch licence sold self-serve to app developers — **lightGallery** (the only solo case with a number)

| Claim | Evidence | Source |
|---|---|---|
| GPLv3 + commercial dual licence, commercial licence for "commercial sites, themes, projects, and applications" | **rendered** | https://raw.githubusercontent.com/sachinchoolur/lightGallery/master/README.md |
| Purchase is **self-serve, no human**: *"You'll receive a license key via email one you purchase a license"*, `licenseKey: 'your_license_key'` in the init code | **rendered** | same README |
| Licence terms page | not fetched (host not tried) | https://www.lightgalleryjs.com/license/ — **open this to get the actual price points** |
| "over $350K from a simple commercial open-source (COSS) project using dual licensing" | **snippet only** — paritydeals.com is EGRESS_BLOCKED | https://www.paritydeals.com/blog/monetize-open-source-dual-licensing/ — **a human must open this to confirm the figure, the period and whether it is lightGallery** |
| The adoption behind it: **7,054 stars, 1,296 forks, repo created 2014-02-28**, still pushed 2026-09-05 | **rendered** (GitHub API via `search_repositories`) | https://github.com/sachinchoolur/lightGallery |

**This is the most mission-relevant case in the whole criterion and it is also the warning.** The
sales motion is fully automated — buy, get a key by email. The *distribution* took twelve years and
7,000 stars. The licence is the monetisation of an audience, not a substitute for one.

### 2b. Copyleft core + proprietary paid add-on, sold self-serve — **Sidekiq**

| Claim | Evidence | Source |
|---|---|---|
| Pro/Enterprise EULA is a per-organisation / per-worker proprietary licence; delivery is a download URL issued at purchase: *"Software shall be deemed delivered when it is made available for download by you"* — no negotiation implied | **rendered** | https://raw.githubusercontent.com/sidekiq/sidekiq/main/COMM-LICENSE.txt |
| "$7 million" bootstrapped solo; earlier "close to $80,000 a month" | **snippet only** | https://saas.group/podcasts/saas-unbound-interview-mike-perham-sidekiq/ , https://www.indiehackers.com/podcast/016-mike-perham-of-sidekiq |

Note this is **open-core, not AGPL escape**: the core is LGPL and the money is a separate proprietary
gem. One person, no sales team. Same precondition as lightGallery — Sidekiq was the default Rails
background-job library before it charged for anything.

### 2c. AGPL as a moat, money from hosting — **Plausible** (the shape that actually scales)

| Claim | Evidence | Source |
|---|---|---|
| AGPLv3, Community Edition self-hostable free | **snippet** + repo | https://plausible.io/blog/open-source-licenses , https://github.com/plausible/analytics |
| $1M ARR June 2022; "$400 MRR to $3.1M ARR in ~5 years", 14,000+ paying subscribers; bootstrapped team of four; revenue is **cloud subscriptions**, not licence sales | **snippet only** | https://plausible.io/blog/open-source-saas — **open this to confirm the ARR figures** |

**Plausible does not sell an AGPL escape hatch at all.** The AGPL is there to stop a competitor
closing a fork; the revenue is a self-serve SaaS subscription. Zero sales humans.

Grafana is the same shape and I confirmed it in their own repo: **rendered**
https://raw.githubusercontent.com/grafana/grafana/main/LICENSING.md — default `AGPL-3.0-only`,
some packages Apache-2.0, and **no commercial alternative licence is documented anywhere in it**.

### 2d. Enterprise dual licence — **needs a sales human, confirmed in the vendors' own words**

| Vendor | Evidence | Quote |
|---|---|---|
| Element / Synapse | **rendered** https://raw.githubusercontent.com/element-hq/synapse/develop/README.rst | *"(1) for free under the terms of the GNU Affero General Public License … OR (2) under the terms of a paid-for Element Commercial License agreement"*, *"the terms of which may vary depending on what you and Element have agreed to"*, *"Please contact licensing@element.io to purchase"* |
| Metabase | **rendered** https://raw.githubusercontent.com/metabase/metabase/master/LICENSE.txt | *"variously licensed under the GNU Affero General Public License (AGPL), or the Metabase Commercial License"* — AGPL outside `enterprise/`, commercial inside |
| Dosyago | **rendered** https://raw.githubusercontent.com/staticagent/dual-licensing/master/README.md | targets *"OEMs, ISVs, VARs"* who *"must enter into a commercial license agreement"*; contact a named person |
| Artifex (Ghostscript), iText | **snippet only** | https://artifex.com/licensing , https://itextpdf.com/how-buy/AGPLv3-license |

"Terms may vary depending on what you and Element have agreed to" is the definition of a sales
motion. **This entire tier is closed to a no-human operation.**

### 2e. Where the self-serve floor sits — **Qt**

| Claim | Evidence | Source |
|---|---|---|
| Qt for Application Development Enterprise **546 EUR/yr** small-business tier; capped at companies under 1M EUR revenue, max 3 licences, 5 support tickets/yr | **snippet only** | https://www.qt.io/development/qt-for-small-business — **open this for the current price** |
| Above that tier, *"pricing is quote-based and negotiated through Qt's sales team or authorized resellers"* | **snippet only** | same search, plus https://www.qt.io/development/qt-framework/commercial-qt |

The canonical dual-licence business publishes a self-serve price only for a deliberately capped
small tier and puts a human in front of everything else. That is the industry's own answer to the
question this criterion asks.

---

## 3. Adjacent, sales-free: Tidelift (paid for maintaining, not for licences)

| Claim | Evidence | Source |
|---|---|---|
| Pays maintainers **monthly, in USD**, allocated from subscriber SBOM usage; amounts per package "aren't huge yet"; no public rate card | **snippet only** | https://support.tidelift.com/hc/en-us/articles/4406294816916-How-we-pay-lifters |
| Payouts run through **Hyperwallet**; eligibility screened against sanctions/high-risk country lists; no explicit country list found | **snippet only** | https://support.tidelift.com/hc/en-us/articles/9899525707028-Getting-paid-with-Hyperwallet — **open this to settle Israel** |

Israel is not a sanctioned country, so this is UNKNOWN-leaning-YES. It also requires an
already-depended-upon package, so it inherits the same distribution precondition.

---

## 4. Payability to Israel for this money model

Selling a commercial licence is an ordinary digital-goods sale. The gate is the payment rail, and
this repo has already been honest about it:

- `docs/CRITERIA_SWEEP.md:184-185` — the earlier Paddle scout recorded "is Israel on Paddle's
  supported-seller list" as **UNKNOWN-leaning-YES**, not YES.
- `docs/REJECTED.md:685-694` — *"Paddle code ships. No Paddle account exists."* No rail is proven.
- `research/colony-sweep/scouts/licensing-ip--fonts-icons.md` — Israel is a PayPal-receivable
  country and is **absent** from the Payoneer list of countries that cannot receive via PayPal.
- Merchant-of-record alternatives that generate **licence keys** natively (the exact mechanic
  lightGallery uses): Lemon Squeezy (bank payouts to 79 countries, PayPal for buyers in 200+) and
  Polar (Stripe Connect Express; supports everywhere except Cuba, Russia, Iran, North Korea,
  Syria). **snippet only**, Israel not named either way. URLs to open:
  https://docs.lemonsqueezy.com/help/getting-started/supported-countries and
  https://polar.sh/docs/merchant-of-record/supported-countries

**Verdict: UNKNOWN-leaning-YES.** Nothing found says Israel cannot be paid; nothing rendered says
it can. Three named URLs would close it.

## 5. ToS / legal risk

GREEN throughout. Dual licensing your own copyright is the licensor's undisputed right, and none of
it touches the constitution. The only AMBER anywhere near it would be *enforcing* AGPL against
non-compliant users — a legal-threat business, which needs lawyers and is not proposed here.

---

## 6. Honest ceiling for this owner

The criterion's own evidence says the licence is the last step, not the first. Every case with a
number attached — lightGallery (7,054 stars, 12 years), Sidekiq (the default Rails job queue),
Plausible (7 years, 14,000 subscribers) — monetised an audience that already existed. There is no
case in anything I rendered of a new library earning from commercial licences without prior
adoption, and my searches surfaced none. A no-brand library published this month should be
budgeted at **₪0/month for the first 12 months**, with the whole bet resting on distribution that
this criterion does not supply.

## 7. Dead ends and what I could not close

1. **No self-serve AGPL-escape marketplace exists.** A direct search for one returned only vendors
   with contact-sales pages; the search's own summary said examples "specifically marketing
   self-serve buy online with no sales team" were not prominent.
2. **paritydeals.com is EGRESS_BLOCKED** — the $350K figure, the single most useful number in this
   criterion, could not be rendered.
3. **No public revenue data for any other solo dual-licensor.** Two searches for indie dual-licence
   outcomes returned licence *explainers* (FOSSA, TermsFeed, Revenera) and no financials.
4. **licensezero / Kyle Mitchell's licence-selling infrastructure** — not investigated; budget gone.
5. **lightgalleryjs.com/license/ price points** — not fetched, so no price is asserted here.

## URLs used
- https://raw.githubusercontent.com/sidekiq/sidekiq/main/COMM-LICENSE.txt (rendered)
- https://raw.githubusercontent.com/element-hq/synapse/develop/README.rst (rendered)
- https://raw.githubusercontent.com/calcom/cal.com/main/LICENSE (rendered — MIT at root, *not* the AGPL structure often reported; the enterprise licence is not in this file)
- https://raw.githubusercontent.com/grafana/grafana/main/LICENSING.md (rendered)
- https://raw.githubusercontent.com/metabase/metabase/master/LICENSE.txt (rendered)
- https://raw.githubusercontent.com/staticagent/dual-licensing/master/README.md (rendered)
- https://raw.githubusercontent.com/FLAMEGPU/FLAMEGPU2/master/CONTRIBUTING.md (rendered)
- https://raw.githubusercontent.com/sachinchoolur/lightGallery/master/README.md (rendered)
- https://github.com/sachinchoolur/lightGallery (rendered, GitHub API)
- GitHub `search_code`: `"Contributor License Agreement" "dual license" AGPL filename:CONTRIBUTING.md` — 44 results (rendered)
- https://plausible.io/blog/open-source-saas (snippet)
- https://saas.group/podcasts/saas-unbound-interview-mike-perham-sidekiq/ (snippet)
- https://www.indiehackers.com/podcast/016-mike-perham-of-sidekiq (snippet)
- https://www.qt.io/development/qt-for-small-business (snippet)
- https://support.tidelift.com/hc/en-us/articles/4406294816916-How-we-pay-lifters (snippet)
- https://support.tidelift.com/hc/en-us/articles/9899525707028-Getting-paid-with-Hyperwallet (snippet)
- https://docs.lemonsqueezy.com/help/getting-started/supported-countries (snippet)
- https://polar.sh/docs/merchant-of-record/supported-countries (snippet)
- https://www.paritydeals.com/blog/monetize-open-source-dual-licensing/ (BLOCKED)
- https://artifex.com/licensing , https://itextpdf.com/how-buy/AGPLv3-license (snippet)
