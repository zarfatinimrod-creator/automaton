# Scout notes — vertical-niches / accountants
**Criterion:** Tools bookkeepers and accountants pay for: reconciliation, document intake, client portals, deadline tracking. What is missing at the small end.
**Date:** 2026-09-05. **Search budget used:** 8 of 8 (cap reached — stopped).

## Evidence-strength key
- **[R]** rendered page I actually fetched (strong)
- **[S]** search-result snippet quoting a page I could NOT render (weaker — must be re-opened to close)
- **[C]** code I read in a public repo (code-grade, first-hand)
- **[I]** my inference (not evidence)

## Egress reality for this criterion (report to supervisor)
Every commercially decisive domain in this vertical is blocked:
`developer.xero.com`, `apps.xero.com`, `developer.intuit.com`, `financial-cents.com` — all EGRESS_BLOCKED.
**The mirror route in the brief did not work here either**: `www.rivhit.co.il` and `www.h-erp.co.il`
(named in the brief as unblocked mirrors of the PCN874 spec) both returned EGRESS_BLOCKED on 2026-09-05.
That claim in the brief should be corrected.
**What did work: GitHub.** `search_code` for `PCN874` returned 38 hits across independent repos and
`raw.githubusercontent.com` rendered them. All the strongest evidence below is code-grade, from GitHub.

---

## Searches run (8)
1. bank statement PDF to CSV converter for bookkeepers pricing DocuClipper MoneyThumb 2026
2. reddit bookkeepers small firm "wish there was" tool gap reconciliation client chasing 2026
3. Xero App Store developer revenue share 15% listing requirements payout countries
4. Intuit QuickBooks App Store developer revenue share percentage publish app payout international developers
5. Uncat pricing per client bookkeepers uncategorized transactions alternative Keeper price 2026
6. accountants reconciling Stripe PayPal Shopify payouts A2X alternative Etsy Gumroad payout reconciliation gap 2026
7. Xero developer API pricing tiers 2026 cost per connection Starter Core Plus Advanced Enterprise price
8. (Hebrew) מנהלי חשבונות ישראל תוכנה PCN874 המרת קובץ מבנה אחיד כלי בתשלום מחיר רואי חשבון

---

## THE CHANNEL FACT THAT REPRICES THIS WHOLE VERTICAL

**Xero changed developer economics on 2 March 2026 and it cuts against exactly the product shape
this criterion points at (a cheap per-client bookkeeper add-on).**

- [S] Xero retired the 15% App Store revenue-share model on 2 March 2026 and replaced it with five
  paid API tiers — Starter, Core, Plus, Advanced, Enterprise — priced on **connections and data egress**.
  Range quoted: **$0 (Starter, 5 connections) to AUD 1,445/month (Advanced, 10,000 connections)**;
  Enterprise negotiated. Egress allowances 10 GB (Core) / 50 GB (Plus) / 250 GB (Advanced), overage
  **AUD 2.40/GB**. All existing apps must transition by **1 July 2026**.
  - https://www.accountingtoday.com/news/xero-shifts-to-tiered-pricing-model-for-developers
  - https://truto.one/blog/xero-api-pricing-changes-2026-costs-tiers-and-how-to-minimize-egress/
  - https://www.accountantsdaily.com.au/technology/21986-all-you-can-eat-xero-data-buffet-comes-to-abrupt-end
  - https://docs.codat.io/updates/260116-xero-pricing/
  - **Must be opened to close this:** https://developer.xero.com/pricing and
    https://developer.xero.com/faq/pricing-and-policy-updates (both EGRESS_BLOCKED here)
- **Why it matters (I):** a bookkeeper connects **one Xero organisation per client**. The free Starter
  tier is capped at 5 connections. So a bookkeeper-facing per-client app is over the free line at
  **client #6** and starts paying Xero before it has meaningful revenue. Uncat charges $9/mo/client;
  that margin now has a platform tax on it that did not exist in 2025.
- [S] **Xero App Store Subscriptions (billing through Xero) is available only in Australia, New Zealand
  and the UK**, with US/Canada "in the next 12 months", then Asia and South Africa.
  - https://www.accountingweb.co.uk/tech/accounting-software/xero-app-store-revamp-ups-commission-rate
  - https://developer.xero.com/documentation/xero-app-store/app-partner-guides/faqs/ (blocked)
  - **Consequence:** an Israeli seller cannot expect to be paid *by Xero*. Billing must be our own rail
    (Paddle), which is fine — but the App Store is a listing/discovery channel, not a payout channel, for us.
- **QuickBooks/Intuit: UNKNOWN.** Search 4 failed to surface any revenue-share percentage or developer
  payout-country list. [S] Intuit announced an **App Partner Program on 15 May 2025 introducing tiered
  platform service fees, live 28 July 2025**, and a "Rest-of-World" marketplace (2023) reaching 200+ countries.
  - https://report.woodard.com/articles/intuits-app-partner-program-marks-new-phase-in-developer-ecosystem-fpwr
  - https://www.accountingtoday.com/news/quickbooks-wants-developers-to-go-global-in-new-app-store
  - **Must be opened to close this:**
    https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/technical-requirements and
    https://developer.intuit.com/app/developer/qbo/docs/legal-agreements/intuit-terms-of-service-for-intuit-developer-services/intuit-data-services-quickbooks (both EGRESS_BLOCKED)

**Israeli payment rail (internal, first-hand):** `/home/user/automaton/products/il-biz-tools/README.md`
states Pro is sold "via Paddle overlay checkout. Paddle is the merchant of record and handles Israeli VAT
on the digital sale… Alternative processors that work for an individual in Israel: PayPal Business,
Payoneer Checkout. **Stripe is not available in Israel.**" That is the repo's own claim, not something I
independently verified this session — but it is the rail every finding below assumes.

---

## FINDING 1 — PCN874 / OPENFRMT (מבנה אחיד) file builder + validator for Israeli bookkeeping offices
**Strongest finding in this sweep, and the only one where payability is not in question.**

**Code-grade evidence [C]** — GitHub `search_code` for `PCN874`, 38 hits, 2026-09-05:
- `amitpo23/cfo` — a full Israeli CFO/bookkeeping backend with `src/cfo/services/pcn874.py`
  (`build_pcn874(...)` emitting fixed-width O/S1/L/X records), `openfrmt.py`, `filing_verification.py`,
  `expense_filing_service.pcn874_readiness()`, SUMIT integration, expense OCR pipeline.
- `matanmalka1/YM_Backend` — an Israeli tax **obligations + deadline rules engine**
  (`tax_rules_config/app/tax_rules/`): `ObligationKind.VAT_DETAILED_REPORT_PCN874`, `requires_pcn874` scope flags,
  validators (`validate_pcn874_requires_flag`), and dated deadline overrides.
- `EsthiF/pcn_converter` — [R] https://github.com/EsthiF/pcn_converter — a bare 3-file repo
  (`PCN874.TXT`, `vat_processor.py`, `vat_report.xlsx`), **0 stars, no description, 1 commit**.
  A bookkeeper writing a throwaway converter by hand. That is the demand signal in its rawest form.
- `skills-il/tax-and-finance` and `squadcodercom/squadcoder` both vendor an
  `israeli-price-quote-generator` whose code comments warn about "double-rounding drifts on PCN874 cross-totals".
- `operator-ita/b1sl-python` — SAP Business One OData bindings expose `PCN874ReportRelevant` as a
  per-GL-account field: even enterprise ERP models this as a flag someone has to get right.

**The gap, quoted verbatim from the code [C]** —
[R] https://raw.githubusercontent.com/amitpo23/cfo/main/src/cfo/services/openfrmt.py
> "DRAFT — כמו pcn874.py: סוגי הרשומות (A100/B100/C100/D110/D120/Z900) והשדות עוקבים אחרי המפרט הציבורי,
> אך רוחבי/סדר השדות המדויקים *לא* אומתו מול 'בודק קבצים להפקת מסמכים ממוחשבים' של רשות המסים"

Translation: the record types follow the public spec, but the exact field widths and ordering were
**never validated against the Tax Authority's official file-checker**. A working Israeli developer,
building this for real, shipped it flagged as a draft because validation was the hard part.
That is the missing product: **not the generator — the validator.**

**Reinforcing [S]** (search 8): Rivhit publishes knowledge-base articles on *manually editing and merging*
PCN874 files across multiple עוסקים, and Hashavshevet/H-ERP publishes an FAQ on producing the report from
journal entries. Manual merge/edit of a fixed-width statutory file is exactly the repeated manual work a
tool removes.
- https://www.rivhit.co.il/knowledgebase/עריכה-ואיחוד-עוסקים-קובץ-pcn874/ (blocked — must be opened)
- https://www.h-erp.co.il/מידע-ללקוחות/שאלות-נפוצות/דוח-מעמ-pcn874/ (blocked — must be opened)

**Buyer:** small Israeli bookkeeping offices (משרדי הנהלת חשבונות) with 20–150 client files, and the small
Israeli invoicing/ERP vendors who must emit PCN874 and מבנה אחיד but do not want to own the spec.
**Money model:** free web validator (drop a PCN874.TXT, get a line-by-line error report) as the SEO funnel;
paid tier for multi-עוסק merge, CSV/Excel → PCN874 build, and a paid API for vendors. Paddle one-time +
subscription, exactly the il-biz-tools pattern that already ships.
**ToS/legal: GREEN** — the spec is a published Tax Authority requirement; no scraping, no account access,
files are uploaded by their owner. **Privacy note:** the uploads contain supplier tax IDs; process in-browser
where possible and never retain.
**Honest ceiling:** ₪2,000–6,000/mo. Israeli bookkeepers are a few thousand offices, price tolerance is low,
and the free tier eats most of it. It is not a 20k line on its own.
**Kill criterion:** if 60 days after launch the free validator has not processed 100 distinct real PCN874
files from strangers, kill it — nobody has the pain badly enough to upload.
**Biggest risk:** we cannot validate our own field widths any better than `amitpo23/cfo` could. Shipping a
validator that is wrong about the spec is worse than shipping nothing, and would breach the honesty
constitution. **Step zero is obtaining and running the Tax Authority's "בודק קבצים להפקת מסמכים ממוחשבים"
against a known-good file.** If that cannot be obtained, do not build.

## FINDING 2 — Israeli statutory deadline data as a machine-readable feed
**Code-grade evidence [C]** — [R] https://raw.githubusercontent.com/matanmalka1/YM_Backend/main/tax_rules_config/app/tax_rules/calendars/calendar_2026.py
returns a full 2026 Israeli filing calendar with **base vs effective dates** (i.e. official deferrals modelled
separately), e.g. `base_vat_detailed_pcn874: 2026-03-23` / `effective_vat_detailed_pcn874: 2026-03-26`,
annual: individuals (1301) 2027-05-31, companies (1214) 2027-07-31, VAT-exempt annual 2027-01-31,
form 126 2027-04-30, form 856 2027-03-31, BTL employer due day 15.
[R] https://raw.githubusercontent.com/matanmalka1/YM_Backend/main/tax_rules_config/app/tax_rules/sources.py
cites 14 primary sources with `checked_at=2026-04-29`, including gov.il/he/service/pcn874,
gov.il/he/pages/pa151025-2 (מועדי הדיווח והתשלום שנת המס 2026), btl.gov.il rate pages and kolzchut.
**This is the "deadline tracking" half of the criterion, and it is being hand-maintained, repeatedly,
by separate developers.** Nobody publishes it as a feed.
**Buyer:** the same small Israeli vendors as Finding 1, plus practice-management tools. Bookkeepers
themselves will not pay for a calendar.
**Money model:** paid API / annual data licence to vendors; free ICS calendar as the funnel.
**Payability YES** (Paddle / x402 — the repo already ships an x402 paid API).
**ToS GREEN** (public government dates, our own compilation).
**Honest ceiling:** ₪500–2,000/mo. Few buyers, each paying little. Best value is as a **moat and funnel for
Finding 1**, not as a standalone line. **Confidence medium** — I have proof the data is hand-maintained,
zero proof anyone pays for it.

## FINDING 3 — Uncat-shaped per-client "chase the client" add-on (QBO/Xero)
**[S] Pricing that exists and is paid:** Uncat **$9/month per client**, syncing QuickBooks Online, Xero and
QuickBooks Desktop, with document requests/uploads and a follow-up dashboard.
Financial Cents' Month-End Close add-on **$5/month per client**.
- https://www.capterra.com/p/247759/Uncat/
- https://financial-cents.com/financial-cents-vs-uncat/ (blocked)
- https://www.businesswire.com/news/home/20230112005186/en/Uncat-Helps-Accountants-and-Bookkeepers-Fix-More-Than-450-Million-Dollars-in-Uncategorized-Transactions-With-Their-Small-Business-Clients
**[S] The stated gap**, from Financial Cents' 2026 Bookkeeping Firm Tech Stack Report: asked "if you could
wave a magic wand and fix one thing about how your tools work together", firms asked for seamless
integration, a **unified client dashboard showing status and pending items**, and consolidation of document
storage/invoicing/payments; **spreadsheets rank as the second-most used tool, ahead of dedicated practice
management and client portal tools.** I could NOT render this report (financial-cents.com blocked) and it is
a **vendor-published survey about its own category** — treat as marketing, not neutral evidence.
- **Must be opened to close this:** https://financial-cents.com/resources/guides/2026-bookkeeping-firm-tech-stack-report/
**Verdict for us: do not build.** Three blockers stack:
1. The Xero connection tax above bites at client #6, on a $9/client price point.
2. QBO/Xero app publication requires a security review and an app listing — an approval process, not a
   deploy — and Intuit's developer terms are unrenderable from here, so ToS is **AMBER by ignorance**.
3. Distribution in this category is accountant-community, webinar and ProAdvisor-relationship driven.
   An owner who never appears has no route to the buyer, and the survey's own answer ("consolidate my
   tools") is an argument for incumbents, against a new point tool.
**Payability of the channel: NO/UNKNOWN** (Xero store billing AU/NZ/UK only; Intuit unknown).

## FINDING 4 — Bank-statement PDF → CSV/QBO/OFX conversion
**[S] Real, paid, and already crowded.** DocuClipper **$29/mo for 60 pages ($20/mo annual)**, Business from
**$159/mo ($111 annual) for 640 pages**; MoneyThumb **$29–99** per edition. Outputs Excel/CSV/QBO/OFX/Xero.
A single 2026 search returns **at least eight competing products** each publishing a "10 best converters"
listicle — the SEO surface is fully occupied by the incumbents.
- https://www.docuclipper.com/solutions/bank-statement-converter/
- https://www.docuclipper.com/blog/best-bank-statement-to-csv-converter/
- https://www.bank-statements.co/blog/best-bank-statement-converters-2026
- https://capyparse.com/blog/best-bank-statement-to-csv-converters-2026
- https://www.bankstatementlab.com/en/blog/en-best-bank-statement-converter-software
**Verdict:** demand proven, buyer nameable (bookkeepers doing catch-up/clean-up work), payability YES via
Paddle, ToS GREEN (user uploads their own statement). But a no-brand entrant has **no distribution wedge**:
the query is owned, accuracy is the whole product, and accuracy on scanned statements is far more than 40
hours. **Only defensible narrow slice: Israeli bank statements** (Hapoalim / Leumi / Discount / Mizrahi PDF
and Hebrew RTL layouts) exported to Hashavshevet/Rivhit import format — a slice the eight US-centric
incumbents do not serve. That slice is unverified and I had no search budget left to test it.
**Honest ceiling as a generic entrant:** ₪0–500/mo. As the Israeli slice: unknown, plausibly ₪1,000–4,000/mo.

## FINDING 5 — Payout reconciliation for the long tail of platforms A2X does not cover
**[S] The pain is real and documented:** a single Shopify payout bundles hundreds of orders net of fees and
refunds, arriving as one lump sum; accountants describe selling £1,000 and receiving £962.40.
A2X fetches payout data per channel, splits sales/fees/refunds/taxes and matches the bank deposit.
- https://linkmybooks.com/blog/reconciling-multiple-ecommerce-payment-gateways-without-spreadsheets-a-guide-for-accountants
- https://www.socialcommerceaccountants.com/blog/shopify-payout-reconciliation
- https://www.bluecopa.com/blog/ecommerce-payment-reconciliation-softwares
**[S] Coverage of incumbents:** A2X covers Amazon, Shopify, eBay, Walmart, **Etsy** and PayPal;
Synder, Bookkeep, Webgility and Reconciler compete.
**The gap [I — inference, not evidence]:** the **creator/digital-goods platforms** — Gumroad, Lemon Squeezy,
Paddle, Ko-fi, Patreon, Stripe Connect marketplaces — are not in any incumbent's channel list I saw.
Their payouts have the same net-of-fees problem and their sellers increasingly have bookkeepers.
**We have a genuine first-hand asset here:** this repo already receives Paddle payouts, so we know that
payout shape without asking anyone.
**Verdict:** interesting, **but I could not evidence a paying buyer** and I had no budget left to look.
Payability YES (Paddle). **ToS AMBER** — each platform's API terms govern whether a third party may pull
payout data on a seller's behalf, and I verified none of them. Do not build before that check.
**Build:** 40h+ (one connector each, plus a QBO/Xero write path that re-triggers the Xero connection tax).
**Confidence low.**

## FINDING 6 (negative) — Client portals and practice management: closed to us
TaxDome, Karbon, Financial Cents and Client Hub own this. [S] The Financial Cents 2026 survey answer is
"consolidate my tools", which is a mandate for the incumbents. Selling practice management is
relationship-led — demos, accountant communities, conference presence — and the mission forbids the owner
appearing at any of it. There is no self-serve wedge. **Recorded as a dead end so the colony stops looking.**

---

## What a human or unblocked agent must open to close the open questions
1. https://developer.xero.com/pricing — exact Core/Plus tier prices (I only have "$0 to AUD 1,445" as a range)
2. https://developer.xero.com/documentation/xero-app-store/app-partner-guides/faqs/ — whether an Israeli
   entity can list and be paid at all
3. https://developer.intuit.com/app/developer/qbo/docs/legal-agreements/intuit-terms-of-service-for-intuit-developer-services/intuit-data-services-quickbooks — Intuit developer terms and fees
4. https://financial-cents.com/resources/guides/2026-bookkeeping-firm-tech-stack-report/ — sample size of
   the survey I quoted second-hand
5. https://www.gov.il/he/service/pcn874 and the Tax Authority's "בודק קבצים להפקת מסמכים ממוחשבים" —
   the single fact Finding 1 lives or dies on
6. Whether Israeli bookkeepers pay for anything at all beyond Hashavshevet/Rivhit licences — I never got
   a price point for the Israeli market; my ceiling numbers there are judgement, not measurement.
