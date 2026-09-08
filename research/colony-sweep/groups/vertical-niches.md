# Group report — vertical-niches

**Group:** Vertical SMB niches worldwide
**Criteria covered:** 8 — `accountants`, `real-estate`, `hospitality`, `fitness-wellness`,
`trades-contractors`, `recruiting-hr`, `legal-admin` (this wave) and `ecommerce-sellers`
(earlier wave, read from disk so the group is judged whole).
**Date:** 2026-09-05. Supervisor verification: 12 WebSearch/WebFetch calls of my own.

---

## Headline

**This group is close to empty, and the one thing it produced that is genuinely worth
keeping is a payment channel, not a product.** Seven scouts proposed roughly forty
opportunities. Thirty-eight die on the mission's own gates — not payable to Israel, AMBER
terms, an approval conversation, a free incumbent, or a ceiling under ₪300/month. Two
survive, both weakly, and **neither scores above 50**. Three of the four best-looking
proposals in the wave were killed by *my* verification, not by the scouts':

- the **PCN874 validator** (accountants' #1) is a duplicate of a line the `israel-bureaucracy`
  group already ranked, and its differentiating half — validation — **is published free by the
  Tax Authority**, which I confirmed;
- the **Wix restaurant-reservations app** (hospitality's #1) is competing against **Eat App and
  Hostme**, specialist incumbents already listed in that exact Wix category, which the scout
  did not check;
- the **Wix wellness intake/waiver app** (fitness's #2) is **already shipped by Wix itself** as
  the first-party *Wix Intake Forms* app, whose help page names "gym health forms" and
  "liability waivers" and supports filling them "once or on a regular basis";
- and the **GoHighLevel marketplace app** (real-estate's #1, the highest-scoring channel
  finding in the wave) appears to require the **$297/month Unlimited plan for API access** —
  ~₪1,100/month of fixed cost before the first customer, on zero demand evidence.

The useful residue is a fact no scout established and I did: **the Wix App Market is the only
marketplace this group examined that is verifiably payable to an Israeli, free to enter, and
bills the customer for us.** That is worth more to the board than any of the products proposed
on top of it.

---

## Verification I ran myself (not taken on the scouts' word)

| # | Claim checked | Result | Effect |
|---|---|---|---|
| 1 | Wix pays app-developer revenue share to Israel | **UPGRADED to YES.** Wix's own Marketplace terms, quoted in search: revenue share is paid in USD by wire "or any other method chosen by Wix", and **"revenue share payments are not issued to banks located in Russia and Pakistan"** — Israel is not excluded. Wix is itself an Israeli company. `dev.wix.com`, `support.wix.com` and `www.wix.com` are all EGRESS_BLOCKED, so this is quoted-snippet grade, not rendered. | Turned the fitness scout's `israelPayable: UNKNOWN` into YES and made this the group's headline asset |
| 2 | The Wix $200 payout floor forfeits sub-floor months | **FALSE as the scout stated it.** Earnings **accumulate and roll over** until $200 is reached, then a payout is scheduled 30 days after month end. | The floor delays the first payout; it does not destroy revenue. Kill criteria rewritten |
| 3 | Wix's first-party apps leave a reservations gap | **Half true, and the wrong half.** Wix Table Reservations is indeed **3.7/5 from 101 reviews** — but the same category already lists **Eat App** and **Hostme**, restaurant-reservation specialists. The scout named only a 13-template menu app. | Killed hospitality finding #1 |
| 4 | Wix Bookings lacks intake forms / waivers | **FALSE.** Wix ships **Wix Intake Forms**, installed from the App Market, explicitly for "waivers or questionnaires… parent consent to liability waivers or gym health forms", integrated into the Bookings flow, fillable "once or on a regular basis". | Killed fitness finding #2 outright |
| 5 | The Tax Authority publishes a free PCN874 file checker | **CONFIRMED** (Hebrew search, multiple independent vendor help pages): "ניתן לבדוק אותו באמצעות הסימולטור של רשות המיסים לפני השידור… לבדיקה חינם של הקובץ". | Killed the accountants scout's #1 ("the missing product is the VALIDATOR"). Matches `israel-bureaucracy`'s existing rejection of a standalone paid validator |
| 6 | Israeli gyms must re-collect a health declaration periodically | **CONFIRMED** against the regulation itself (תקנות מכוני כושר (רישוי ופיקוח)(הצהרת בריאות ותעודה רפואית), תשע"ו-2015): the gym must demand **a health declaration once every two years**, and **a medical certificate once a year** from a trainee who supplied one; a minor needs written parental consent attached. | This is the only *verified recurring legal trigger* in the whole group. It is why survivor #1 ranks first |
| 7 | GoHighLevel pays Israeli developers | **YES on the rail** — 15% revenue share, monthly, paid on the 15th via **Tipalti**, and Tipalti's global-ACH coverage includes Israel (two independent sources). | Payability was never the problem |
| 8 | GoHighLevel development is free to enter | **NO — and this kills it.** Two independent third-party developer guides state API access requires the **Unlimited plan at $297/month**. A sandbox exists for marketplace developers; whether it removes the requirement is unverified. | ~₪1,100/month fixed cost before customer #1, on an app with zero evidenced demand. Rejected, with a precise reopening condition |
| 9 | NYC LL144 enforcement has teeth in 2026 | **Partly.** The **NY State Comptroller audit of DCWP dated 2 Dec 2025** found complaint-handling weaknesses and recommended proactive enforcement; DCWP concurred. Penalties $500–$1,500/day. But the compliance-pack product is **already sold** by named vendors (aicompliancedocuments.com sells "NYC Local Law 144 — Compliance Documents"; Warden AI sells the platform), and the scout's own counter-evidence stands: **18 of 391** NYC employers had posted audit results. | Rejected. Stricter enforcement is a forecast; 95% non-compliance with two incumbents already selling the paperwork is a measurement |
| 10 | Jobber marketplace listing is self-serve | **NO.** Jobber's own help centre: an app in **Draft state has API access blocked once it connects to more than 5 paying Jobber accounts**, and marketplace apps go through a "Technology Partner" review. `developer.getjobber.com` is EGRESS_BLOCKED, so partner-country eligibility is still unknown. | Stays AMBER → rejected under the group brief |
| 11 | Etsy digital downloads are open to us | **Already closed by another group.** `storefronts` verified Etsy Payments reaches Israel **and rejected the line anyway**: buyer messaging and disputes are dashboard-only, so the owner would have to talk to buyers. | Killed the trades scout's template-pack line |
| 12 | Israeli privacy law tolerates an unattended health-data service | **Constraint, not a kill.** Amendment 13 to חוק הגנת הפרטיות is in force since **14 Aug 2025**; DPO appointment attaches to bodies processing **sensitive data at significant scale** (מידע רגיש בהיקף ניכר). Health status is sensitive data. | Forced an architecture constraint onto survivor #1 (do not retain the answers) and is the reason its ceiling is capped at ₪800, not the ₪3,000 the scout claimed |

**Egress note.** `dev.wix.com`, `support.wix.com`, `www.wix.com`, `help.gohighlevel.com`,
`aicompliancedocuments.com`, `warden-ai.com` are all EGRESS_BLOCKED from this container. Every
verification above that is marked "quoted in search" is a search engine quoting the vendor's own
page, not a page I rendered. I have said so per row rather than laundering it.

---

## Merges and deduplication

- **PCN874 (accountants #1) ≡ `israel-bureaucracy` survivor #1 "PCN874 Builder" (score 72).**
  Same file format, same buyer, same Paddle rail. The accountants scout proposed the *validator*
  as the novel half; that half is free from the ITA. **Not re-ranked here.** The board already
  has it; ranking it again would inflate the portfolio with one product counted twice.
- **Israeli filing-deadline feed (accountants #2) ≡ `israel-bureaucracy`'s rejected "standalone
  VAT deadline calendar"**, already folded there into a free funnel feature. Merged and dropped.
- **Wix App Market appears in two criteria** (hospitality #1, fitness #2) as two different apps.
  Merged into a single *channel* finding, because the channel verified well and both apps died.
- **"Cheap add-on riding an incumbent vertical SaaS's API"** appears five times — Xero/QBO
  (accountants), Mindbody (fitness), Jobber (trades), Mews/Cloudbeds (hospitality), Follow Up
  Boss (real-estate). Merged into one structural conclusion, below.
- **"Statutory compliance paperwork as a product"** appears four times — LL144/AEDT
  (recruiting), EU AI Act (recruiting), SES.Hospedajes and AlloggiatiWeb (hospitality), Israeli
  health declaration (fitness). Only the Israeli one survives, and only because the obligation
  is verified, recurring, and in our language and market.

### The structural finding that explains most of the rejections

**Vertical SaaS incumbents make third-party integration a relationship on purpose, and 2026 made
it more expensive.** Every route in this group that looked like free distribution turned out to
have a toll or a gate: Mindbody wants a paid subscription plus named existing customers; Mews
wants a certification call and a live-property pilot; Cloudbeds routes partners to a person;
Xero retired its 15% App Store share on 2 March 2026 for **connection-metered API tiers** and
pays sellers only in AU/NZ/UK; Amazon SP-API now charges third-party developers **$1,400/year**;
GoHighLevel wants **$297/month**; Jobber caps unlisted apps at 5 paying accounts. Against that
list, **Wix — free to build, bills the customer for you, keeps 0% for a year then 20%, excludes
only Russian and Pakistani banks — is an outlier**, and that is the single most transferable
fact this group produced.

---

## Ranked survivors

Two. Not six. Both score under 50, and I would tell the owner plainly that this group does not
contain a line worth reordering the roadmap for.

### 1. Israeli gym / studio health-declaration service with the statutory expiry clock (score 44)

A Hebrew self-serve service for Israeli gyms, studios, boxes and country clubs: send the
statutory הצהרת בריאות to a trainee by link, capture a signature on a phone, hand the signed PDF
to the gym, and **automatically re-request it when the two-year clock expires** — plus the
one-year medical-certificate clock and the parental-consent attachment for minors.

- **Why it ranks first:** it is the only line in the group whose demand driver I verified *in the
  primary instrument*. The regulation compels the document, compels its renewal every two years,
  and compels an annual medical certificate for the trainees who needed one. Four Israeli vendors
  already sell the *signature*; **none of them sells the clock**, and the clock is the only part
  a gym owner cannot do with a free PDF and a filing cabinet.
- **Buyer:** owner-operators of small Israeli gyms and studios — the segment Arbox prices at
  ₪135–789/month and the "Base" challenger at ₪99/month.
- **Money:** Paddle (proven rail in `products/il-biz-tools`). Free tier ~20 declarations/month;
  ₪49–79/month paid.
- **Honest ceiling ₪800/month**, not the scout's ₪3,000. Three reasons, stated so nobody
  re-inflates it: 2sign / tofes101 / fillfaster / easydo already sell the form; Arbox and Base
  bundle it; and **Wix Intake Forms gives a version away** to any studio already on Wix.
- **Mandatory architecture constraint (this is a condition of it being GREEN, not advice):**
  the signed document goes to the gym and we retain **the expiry date and a document reference,
  never the health answers**. Health status is sensitive data under Amendment 13, in force since
  14 Aug 2025, and a service that succeeded while holding it at scale would acquire a DPO
  obligation — a permanent human role the mission forbids. Build it so growth cannot create
  that obligation.
- **Build 30h. ToS GREEN. Israel-payable YES.**

### 2. Wix App Market entry — the channel is verified, the app is not chosen (score 36)

Ranked as a **channel with an occupancy test as step one, not as a product**. I am not asking
the board to fund a build; I am asking it to spend two hours finding out whether a gap exists,
because the rail underneath is the best one this group found.

- **What is verified:** developer keeps **100% of app revenue for year one, 80% after**; payout
  monthly in USD once **$200 has accumulated** (it rolls over, it is not forfeited); **no upfront
  fee**; Wix bills the merchant, so no separate checkout for us; and **the only bank exclusions
  named in Wix's terms are Russia and Pakistan**. Wix is Israeli-domiciled.
- **What is not:** which app. Both apps my scouts proposed for this market are dead — reservations
  is occupied by Eat App and Hostme, and intake forms/waivers is a first-party Wix app. A third
  candidate must be found by looking, not by guessing, and `www.wix.com` is blocked from here.
- **Honest ceiling ₪1,200/month** for one small niche app, unmeasured and speculative — it is the
  channel's plausible size, not a measurement of anything.
- **Build 40h *after* the occupancy scan**; 2h for the scan itself.
- **ToS GREEN. Israel-payable YES** (best-evidenced payability in the group).
- **This ranks second, below a line with a verified legal trigger, precisely because its product
  is undetermined.** If the occupancy scan finds every candidate job already served by a Wix
  first-party app or by a category specialist — which is what happened to both scout proposals —
  it dies there and costs us two hours.

---

## Rejected, and why

| Rejected | Reason |
|---|---|
| **PCN874 file builder / validator** (accountants) | **Duplicate** — `israel-bureaucracy` survivor #1, already ranked at 72. Its novel half (validation) is **published free by רשות המסים**; I confirmed the free simulator |
| **Israeli statutory filing-deadline feed** (accountants) | Duplicate of a line `israel-bureaucracy` already rejected and folded into a free funnel feature. The scout itself found **zero paying buyer** |
| **Uncat-style per-client QBO/Xero add-on** (accountants) | Xero retired the 15% App Store share on 2 Mar 2026 for connection-metered API tiers — a per-client app pays Xero from client #6 at a $9/client price — and **Xero App Store billing exists only in AU/NZ/UK**, so it will not pay an Israeli. Intuit's economics unrenderable |
| **Bank-statement PDF→CSV converter** (accountants) | Eight incumbents with 2026 SEO and a $20–29/month anchor. Ceiling ₪500. The untested Israeli-bank slice is a research task, not a line |
| **Creator-platform payout reconciliation** (accountants) | AMBER: not one target platform's API terms were read. Low confidence, no named buyer |
| **Client portals / practice management** (accountants) | Demo-and-community sales. Forbidden by MISSION §1 |
| **GoHighLevel marketplace app** (real-estate) | **API access requires the $297/month Unlimited plan** (~₪1,100/month fixed cost) on **zero** evidence any third-party real-estate app there earns anything. Same shape as the Amazon SP-API $1,400/year kill. Payability itself is fine (15% share, Tipalti, Israel covered) — the entry cost is what kills it. **Reopens if** the free marketplace sandbox is confirmed sufficient to build *and publish*, **and** an occupancy scan names an unserved job |
| **Follow Up Boss embedded app** (real-estate) | No evidenced paid third-party ecosystem. My check found FUB integrations are "connection free, the other tool paid" — i.e. FUB is a connector directory for products that already have buyers, not a channel that produces them. GREEN and payable, but with no demand evidence and no channel it is a build with nothing behind it |
| **AI listing-description generator** (real-estate) | Free specialist tiers plus ChatGPT/Claude at $20/month do the job. The scout said do not build; I agree |
| **US comparables / CMA (MLS data)** (real-estate) | Per-MLS signed data-use agreements, hundreds of times, usually conditioned on broker sponsorship. Recurring human negotiation — fails MISSION §1 before ToS |
| **Israeli Nadlan comparables** (real-estate) | Six free open-source wrappers plus a free hosted MCP already expose the static tier; the paid-worthy tier is behind reCAPTCHA Enterprise and the only way in is replaying a front-end token — circumvention, forbidden |
| **Israeli broker CRM** (real-estate) | Five named local incumbents at ₪99–199/month, sold by phone and demo |
| **Wix restaurant reservations/menu app** (hospitality) | **Eat App and Hostme already occupy that Wix category.** The scout's "less crowded" claim did not survive one search |
| **Spain SES.HOSPEDAJES filing** (hospitality) | Seven-plus Spanish incumbents; price floor €0.95/guest or €5/property/month; a foreign no-brand asking for passport data |
| **Italy AlloggiatiWeb / ISTAT / tourist tax** (hospitality) | Seven-plus Italian incumbents, all bundling the three obligations together |
| **Google Business Profile review tooling** (hospitality) | Discretionary human-reviewed API approval, requires a verified 60-day-old profile we do not have, and covers only locations you own. The alternative is scraping — RED |
| **Mews / Cloudbeds PMS marketplaces** (hospitality) | Certification call and a live-property pilot (Mews); a partner success contact (Cloudbeds). Dead on MISSION §1 regardless of economics |
| **Allergen / menu-labelling tool** (hospitality) | A free-forever incumbent sets the price at zero, and any version that infers rather than renders allergens creates physical-harm liability we cannot stand behind |
| **Wix wellness intake/waiver/deposit add-on** (fitness) | **Wix ships it first-party** — the Wix Intake Forms app names liability waivers, parental consent and gym health forms, and supports recurring re-filling. This was the scout's own proposed differentiator |
| **Mindbody ecosystem add-on** (fitness) | Requires a paid Mindbody subscription, a manual review in which you must **name existing Mindbody customers you are building for**, and per-studio activation by each studio owner. Three human gates |
| **Shopify booking/membership app** (fitness) | Shopify Billing API is mandatory for public apps, so all money is a Partner payout, and **Israeli partner payout eligibility is unresolved** across two groups. Unknown payability = worth zero |
| **"Cheaper than SimplePractice" therapist intake** (fitness) | No self-serve channel exists in that market, and retaining clinical intake answers pulls in HIPAA and Israeli medical-privacy duties an unattended operation must not carry |
| **Jobber App Marketplace add-on** (trades) | AMBER and staying AMBER: `developer.getjobber.com` is blocked, partner-country eligibility unknown, and an unlisted app's API access is **cut off above 5 paying accounts**, so listing approval is load-bearing, not optional |
| **Etsy contractor template pack** (trades) | Closed by the `storefronts` group: Etsy buyer messaging and disputes are dashboard-only, so the line requires the owner to talk to buyers. Payability was never the problem |
| **Standalone solo quoting/invoicing app** (trades) | Price floor $10/month set by Joist; five funded incumbents with mobile apps and review history |
| **Permit data / permit-requirement lookup** (trades) | The buyer of permit data is lead-gen and insurers, not solo trades, and the only evidenced supply is a sales-gated API reported at $599/month input cost |
| **QuickBooks App Store listing** (trades) | Developer-country eligibility and who bills the customer both unverified; security review plus an **annual compliance re-review** is a recurring obligation |
| **NYC LL144 / AEDT compliance evidence pack** (recruiting) | Two named vendors already sell exactly this pack; the thing buyers must actually buy is the **independent** bias audit, which is a human engagement we cannot sell; and **18 of 391** NYC employers had posted audit results. **Reopens if** DCWP publishes a first named enforcement action with a fine |
| **GDPR candidate-retention layer** (recruiting) | Gated on Google restricted-scope OAuth verification, which may demand a paid third-party CASA security assessment — not ordinary KYC, and it breaks both the hour budget and the no-human-ops rule |
| **EU AI Act Annex III documentation kit** (recruiting) | The deadline moved **16 months to 2 Dec 2027**. Compliance products sell in the months before a deadline; by then the harmonised standards exist and GRC vendors have shipped. Re-evaluate Q1 2027 |
| **Automated candidate screening / CV ranking** (recruiting) | Closed by law and by the constitution: LL144's independent-auditor requirement is unsatisfiable by a software-only shop; Illinois HB 3773 live since 1 Jan 2026 |
| **ATS job-postings Apify actor** (recruiting) | Eight-plus incumbent actors, one publishing $1.00 per 1,000 jobs — a commodity floor — and ATS endpoint terms unread (AMBER) |
| **Israeli HR document pack** (recruiting) | A free generator already exists for the exact statutory document; the paid layer is signature/payroll infrastructure |
| **US court-deadline / docketing calculators** (legal) | A missed deadline is a malpractice claim; incumbents sell licensed attorneys maintaining rulesets plus insurance. Would require **E&O insurance in the owner's name — an ongoing human obligation**, not a one-time KYC step |
| **E-filing pre-flight format checker** (legal) | The nearest miss in the group. UPL-safe, GREEN, Paddle-payable — and its **entire demand evidence is one number (3.7% of e-filings rejected) published by e-filing vendors who sell the fix**. An interested party's marketing is not a market. Maintaining a per-court rules corpus accurately, unattended, is also the exact failure the same scout used to kill docketing. **Reopens if** the LA Superior Court EFSP rejection report is rendered and independently supports the rate |
| **Word-template document assembly** (legal) | Squeezed between free Docassemble/AssemblyLine below and funded Gavel above |
| **Docassemble implementation for courts / legal aid** (legal) | Real money, sold to institutions through human procurement |
| **Consumer self-help court-form filling** (legal) | UPL. *Upsolve v. James* confirms individualised form help is unauthorized practice even when free and charitable; the Texas software safe harbor is statutory, state-by-state, and conditioned on a conspicuous disclaimer |
| **Bates / exhibit stamping tool** (legal) | A free, no-signup client-side tool already exists |
| **Etsy API-based seller tools** (ecommerce) | Etsy's API terms prohibit charging for the API-integrated part of an application — which is where every such tool's value sits. AMBER at best |
| **Shopify seller app** (ecommerce) | Mandatory Billing API + unresolved Israeli partner payout. Also: 18,062 apps, 610 added in 30 days, and the two channels that work are partnership and agency networks — both forbidden |
| **Amazon SP-API seller tool** (ecommerce) | **$1,400/year** third-party developer subscription from 31 Jan 2026, before the first customer |

---

## Owner blockers found

Only what a platform legally requires of a human. **None may be assumed done.**

1. **Paddle seller account** — one-time identity/KYC plus payout bank details. Believed already
   completed for `products/il-biz-tools`; **confirm from the account, do not assume**. Gates
   survivor #1.
2. **Wix developer payout registration** — bank details and a tax form (a W-8BEN or equivalent is
   the norm for a non-US individual on a marketplace; **not confirmed for Wix specifically**, and
   `dev.wix.com` is blocked). One-time. Gates survivor #2. The Wix app-review submission before
   listing is a submission, not a conversation, but it is an approval we cannot guarantee passing.
3. **Tipalti payee registration (GoHighLevel only)** — identity/tax form plus Israeli bank
   details. Recorded because the rail verified cleanly; **not scheduled**, because the line is
   rejected on the $297/month entry cost.

**Explicitly NOT catalogued as owner blockers, because they disqualify their lines rather than
gate them** — writing these down as "steps the owner could take" would violate MISSION §1:
Mews certification call and live-property pilot; Cloudbeds partner success contact; a paid
Mindbody subscription plus naming existing Mindbody customers; per-MLS data-use agreements;
Google Business Profile discretionary API approval; professional indemnity / E&O insurance for
court-deadline software; a paid permit-data supplier contract; Etsy buyer messaging and dispute
handling.

---

## Scouts whose work was thin or unsourced

- **`accountants`** — the most consequential failure, and not a research failure but a memory
  failure. Its #1 finding duplicates a line another group had already ranked, and it asserted
  "nobody sells a standalone cross-vendor validator" without checking whether the Tax Authority
  publishes one. It does, free. The scout never read `docs/REJECTED.md` or the
  `israel-bureaucracy` group report, both of which are on disk and both of which contain the
  answer. Its GitHub-code evidence was genuinely the best in the wave; its commercial reasoning
  was not checked against the colony's own memory.
- **`real-estate`** — honest about it, but the honesty does not fix it: **no public number —
  installs, revenue, review count — for a single third-party app on either channel it proposed.**
  Both findings rest on "the marketplace exists and pays". It also missed the $297/month
  GoHighLevel entry cost, which is the fact that decides its own top finding.
- **`hospitality`** — strong, disciplined dead-end work on Spain and Italy, and then its one
  *recommended* build missed that Eat App and Hostme already sit in the target Wix category. It
  also left the Israeli hospitality market entirely unswept and said so.
- **`fitness-wellness`** — its best finding rested on a snippet of a regulation it never opened
  (I opened it; it held, and it is now the group's #1). Its second finding proposed building a
  product Wix already ships first-party — one search away.
- **`ecommerce-sellers`** (earlier wave) — covered platform economics well and **explicitly did
  not cover the criterion's actual question**, "repeatedly requested gaps". It produced no
  product proposal at all. Reported honestly, but the criterion should be treated as half-swept.
- **`recruiting-hr`** and **`legal-admin`** — the two most rigorous reports in the wave. Both
  graded every claim, both named the URLs a human must open, and both concluded against their own
  best findings where the evidence demanded it. `recruiting-hr`'s statement that **no finding in
  its criterion has a named acquisition channel** is the kind of admission this sweep needs more
  of. Neither is thin; both are snippet-bound because no regulator or vendor domain renders here.
- **`trades-contractors`** — sound, self-limiting, correctly flagged that all its vendor pricing
  is comparison-blog grade.

---

## What I would tell the board in one line

Vertical SMB niches worldwide are, for this operation, a **channel problem disguised as a product
problem**. The products are all buildable; almost none of them are reachable, because every
vertical incumbent turns distribution into a relationship and 2026 added a toll on top. The one
door that is open, free and pays Israelis is the Wix App Market — and we have not yet found
anything to sell through it. **Two hours of occupancy scanning inside that market is worth more
than forty hours of building anything else in this report.**
