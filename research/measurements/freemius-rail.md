# Measurement: Freemius as a second Israeli payment rail (board task #21)

**Date:** 2026-09-07
**Ordered by:** `src/revenue/rails.ts` — `CANDIDATE_RAILS.freemius.beforeUse`, verbatim: *"RENDER IT, do not ask
the owner. The board's ruling of 7.9.2026 turned this from an owner check into a research task with a method: find
Freemius's ILS payout terms and its acceptance of an osek patur seller by GITHUB CODE SEARCH."* The rail exists in
the catalogue as the named mitigation for the Gumroad concentration `railConcentration()` reports: ₪1,000 of the
₪1,500 committed portfolio rides one Gumroad seller account, and `MISSION.md` requires that one rail failing must
not take the company down.

**Question:** does Freemius pay out to an Israeli individual seller — in what currency, by what method, at what
minimum and schedule, at what fee, under what identity verification, and what may not be sold? Plus: is Freemius
itself Israeli, and does that change the invoicing shape?

**Search budget: 6 of 6 WebSearch calls used.** Everything else came from GitHub (`search_code`,
`search_repositories`, `raw.githubusercontent.com` via curl), which costs no budget.

---

## Evidence strength legend
- **[RENDERED]** — I fetched and read the document, or GitHub's code search returned the file's own bytes.
- **[SNIPPET]** — a WebSearch result summary quoting a page I could not render. Weaker.
- **[BLOCKED]** — the primary source exists but the egress proxy refused it; a human must open it.

**Blocked in this session, verified by one attempt each:**
- `freemius.com` — `WebFetch https://freemius.com/help/documentation/selling-with-freemius/supported-countries/`
  returned `{"error_type":"EGRESS_BLOCKED","domain":"freemius.com"}`. The prior `plugin-ecosystems--wordpress`
  scout recorded the same on 2026-09-04; still true.
- `web.archive.org` and `archive.org` — **new finding, not previously recorded in this repo.** Both return
  `curl: (56) CONNECT tunnel failed, response 403` from the egress proxy. So the usual rescue for a blocked
  vendor page (fetch the Wayback snapshot) is **not available in this container**, for Freemius or for anything
  else. Per `/root/.ccr/README.md` I did not retry or route around it.

---

## 1. The one-line answer

**UNKNOWN, and the rail therefore stays unusable.** Six searches and eleven GitHub code searches produced **no
source of any grade — not rendered, not snippet, not third-party — that names Israel on Freemius's seller
supported-countries or payout list.** What the session did settle is everything *around* the gate: the fee, the
payout mechanics, the schedule, what may be sold, and who the merchant of record legally is. It also **refuted**
rather than merely doubted the claim in `src/revenue/rails.ts` that Freemius *"pays out in ILS with no conversion
fee"* — from Freemius's own source code.

The board's mitigation for the Gumroad concentration is not available yet. `railConcentration()` should keep
reporting `concentrated`.

---

## 2. What was refuted — from Freemius's own code [RENDERED]

`src/revenue/rails.ts` says Freemius *"pays out in ILS with no conversion fee, by wire, Wise, Payoneer or PayPal"*.
The `plugin-ecosystems` supervisor already flagged the ILS half as a probable misreading (group report §4,
correction 2). It is now **settled against the claim**, by three files in Freemius's own repositories:

| File | What it contains |
|---|---|
| `Freemius/wordpress-sdk` → `includes/entities/class-fs-payment.php` | `const CURRENCY_USD = 'usd'; const CURRENCY_GBP = 'gbp'; const CURRENCY_EUR = 'eur'; const CURRENCY_ILS = 'ils'; const CURRENCY_CAD = 'cad'; const CURRENCY_AUD = 'aud'; const CURRENCY_PLN = 'pln';` — the currency of a **payment**, i.e. what the buyer is charged |
| `Freemius/freemius-checkout-js` → `src/lib/contracts/CheckoutPopupOptions.ts` | `export type CheckoutCurrency = LiteralUnion<'usd' \| 'gbp' \| 'eur' \| 'ils' \| 'aud' \| 'cad' \| 'pln' \| 'chf' \| 'rsd'>` — explicitly **checkout** currency |
| `Freemius/pricing-page` → `src/entities/Pricing.js` | `USD: '$', GBP: '£', EUR: '€', ILS: '₪', CAD: '$', AUD: '$', PLN: 'zł'` — a **pricing-page symbol table** |

Every ILS occurrence in Freemius's public code is buyer-side. **Nothing anywhere describes ILS as a payout
currency**, and the one payout string in the whole SDK says the opposite (§4 below). The rails.ts wording should
be corrected to *"selling/checkout currency includes ILS; payout currency unverified and probably USD"*.

### The inference trap, named so it is not walked into again
The rendered country dropdown `'IL' => 'Israel'` in `Freemius/wordpress-sdk` →
`templates/account/billing.php` is **not** evidence of payability. I fetched the file: it is the plugin
*customer's* billing-address form, and the list is a complete ISO set that also contains Iran, Syria and North
Korea. Anyone code-searching "Freemius Israel" hits it first. It proves nothing.

The same trap appeared inside a WebSearch summary this session, which volunteered: *"Freemius Checkout now
supports Israeli Shekels as a currency, **suggesting Israel is among the supported countries**."* That is the
exact syllogism that produced the wrong line in `rails.ts` in the first place, generated fresh by a language
model. It is recorded here as an anti-finding.

---

## 3. Who the merchant of record actually is — [RENDERED], and this is new to the repo

A complete Freemius-generated EULA is mirrored on GitHub at
`bigmikesolutions/flex-top-bar` → `plugins/flex-top-bar/assets/doc/EULA_freemius.md` (52 KB, effective
25 March 2026, and it names its own canonical home: `https://freemius.com/product/26477/flex-top-bar/legal/eula/`).
It is a real production artefact of the Freemius checkout, not a template. Verbatim:

- **“Freemius, Inc. is an authorized reseller of [product] and is the 'merchant of record' for your purchase.”**
- **“The agreement is between you and Freemius, Inc. on behalf of the Vendor.”**
- Fees: *“Pricing for the Software is exclusive of all applicable sales, use, consumption, VAT, GST, and other
  taxes… except for taxes based upon Freemius' net income”*, and all amounts *“are stated, and are to be paid, in
  **US Dollars**”* unless the Checkout says otherwise.
- Governing law: **“the laws of the State of New York, USA”**.
- Arbitration venue: Americas residents → New York City; **“if You are a resident of any other country in the
  world, the arbitration will take place in Tel Aviv-Jaffa, Israel”**, falling back to New York only if JAMS
  cannot seat an arbitrator in Israel.

Corroborating the entity: `Freemius/freemius-js` README closes *“MIT © Freemius Inc”*; the WordPress SDK's file
headers read *“Copyright (c) 2016, Freemius, Inc.”*; and the 2019 privacy-policy snapshot archived in
`citp/privacy-policy-historical` → `f/fr/fre/freemius.com.md` opens *“Freemius, Inc. (the ‘Company’)”*.

**So: the contracting party, the governing law and the default settlement currency are all American; the
arbitration venue for most of the world is Israeli.** That is the sharpest evidence this repo holds either way on
"is Freemius Israeli", and it points both directions at once — see §8.

---

## 4. Payout mechanics

| Item | Value | Grade |
|---|---|---|
| Methods | PayPal (default, via **PayPal MassPay**), Payoneer, bank wire (IBAN/SWIFT), **Wise** | [SNIPPET] ×2 searches, **plus** [RENDERED] third-party: `HelpMe-Pls/Life-Engineering` → `Notes/breakglass-research/RAILS-INTEL.md`, an unrelated author's rails table reading *“Freemius (WP/plugin MoR) … payouts via PayPal MassPay (default), Payoneer, wire/SWIFT, or Wise”*. Third independent author to say the same thing; still nobody rendering Freemius itself |
| Minimum | **$100 account balance** before a payout is issued | [SNIPPET] |
| Frequency | **Monthly** | [SNIPPET], and consistent with the SDK string below |
| Schedule / lag | *“Earnings generated during January are calculated on March 1st and… become eligible for payout on March 10th”* — a **~40-day hold plus a 10-day settlement, i.e. roughly 40–70 days from sale to money** | [SNIPPET] |
| Payout currency | **Not stated anywhere for sellers. USD is the only currency any rendered Freemius document names.** The nearest rendered string is the SDK's *affiliate* payout copy (§ below) | — |
| PayPal transfer fee | *“transfers to U.S.-based accounts are free… for non-U.S. accounts, PayPal incorporates a 2% fee (maximum of $20 USD)”* — this would apply to an Israeli account | [SNIPPET] |

**The one payout string Freemius ships in its own code** is in `Freemius/wordpress-sdk` →
`templates/forms/affiliation.php` [RENDERED], and it is about the **affiliate** programme, not seller earnings:

> `'%s minimum payout amount.'` rendered with `'$100'`
> `'Payouts are in USD and processed monthly via PayPal.'`
> `'As we reserve 30 days for potential refunds, we only pay commissions that are older than 30 days.'`

Do not quote this as seller terms — it is a different programme. It is worth recording only because the numbers
Freemius chose for affiliates ($100, monthly, USD, 30-day refund hold) match the snippet-grade seller numbers
exactly, which makes the seller snippets more plausible without making them rendered.

---

## 5. Cost of the rail

| Component | Value | Grade |
|---|---|---|
| Platform base | **4.7%** | [RENDERED] third-party: `Spidy092/grovia-wordpress-theme` → `research/business/monetization-stack.md`, citing `freemius.com/pricing/` and `freemius.com/help/documentation/getting-started/our-pricing/` |
| WordPress & Templates solution | **+2.3%** | same file |
| **WordPress platform share** | **7.0% + gateway processing fees** (that file's own bolded conclusion) | same file |
| Gateway fees | *“variable… card processing around 2.9% + a fixed fee, plus possible international/subscription additions”* | same file |
| **All-in, entry level** | **≈10–11% of revenue** | derived — matches the prior scout's independent snippet-grade estimate to the point |
| Volume tiering | down to 0.5% above $100k/month | [SNIPPET], prior scout — irrelevant at our scale |

This is an **independent, differently-sourced confirmation** of the number the `plugin-ecosystems--wordpress`
scout produced from search snippets on 2026-09-04. For comparison, `rails.ts` records Gumroad at ~12.9% + $0.80
and Paddle at 5% + $0.50 plus a $15 SWIFT fee. Freemius is cheaper than Gumroad and dearer than Paddle, and the
$100 minimum plus the ~40–70-day lag matters more than the percentage at portfolio-scale ticket sizes.

---

## 6. What may and may not be sold

Freemius publishes a page titled **“Allowed & Prohibited Products”**
(`https://freemius.com/help/documentation/selling-with-freemius/allowed-prohibited-products/`) and an
**Acceptable Use Policy** (`https://freemius.com/terms/acceptable-use/`). Both [BLOCKED]; contents [SNIPPET]:

**Allowed** — *“Software-as-a-Service (‘SaaS’), meaning cloud-based software accessed through the Internet,
including analytics tools, APIs, design platforms, productivity applications, **AI-powered software**, and
web-based games; Downloadable Software… and Static Software Code-based products.”*

**Prohibited**, as summarised from that page:
1. **Health/medical AI without the regulatory apparatus** — *“software or AI tools that provide medical,
   diagnostic, treatment, prescription, mental-health, or other professional health-related advice where required
   regulatory compliance, licenses, professional oversight, disclosures, safeguards… are not in place.”*
2. **Anything you do not own** — no PLR (Private Label Rights), no MRR (Master Resell Rights), *“any resold
   product, even with a reseller certificate.”*
3. **Whatever the processors ban** — products on **Stripe's restricted businesses** list, on **PayPal's
   prohibited** list, or violating **Visa/Mastercard** network rules.
4. **Content piracy** — illicit streaming services, streaming downloaders, media-burning copy tools.

> **The SaaS/AI answer is stronger than snippet grade, because Freemius's own repositories prove it.**
> `Freemius/ai-chat-nextjs-example` [RENDERED] is Freemius's official demo of *“a real AI credit-based product…
> Better Auth for users, Prisma for data, **Freemius for subscriptions, one-off credit top-ups, trials,
> entitlements**”*, priced $4.99–$24.99/month with $8 and $30 credit top-ups. `Freemius/freemius-ai` [RENDERED]
> ships four Freemius agent skills for Claude Code and a Hono SaaS example. `Freemius/freemius-js` [RENDERED] is
> an entire SaaS SDK. **So "downloadable software only" is false: SaaS is a first-class product type and
> AI-metered SaaS is Freemius's own showcase.** For this colony that matters — it means Freemius is not
> WordPress-only and could carry a non-plugin line.

**Not answered:** whether an *agency-style AI service* (work performed for a client, as opposed to software) is
permitted. Both the allowed list and the prohibited list are framed around *products*. The Acceptable Use Policy
was not rendered. Treat services as unverified.

---

## 7. Identity verification (KYC) — UNKNOWN, and the owner-step question stays open

The one relevant return was *“You can start selling as an individual with Freemius”* [SNIPPET], unattributed to a
specific page and hedged by the search model itself, which then said it *“doesn't contain comprehensive details.”*
That is not enough to write down as a fact, and it is the weakest item in this report.

**Nothing was found about:** what documents are required, whether a company is needed, whether an **עוסק פטור**
qualifies, whether a W-8BEN or equivalent is collected, or whether a selfie/government-ID step exists. The
`plugin-ecosystems` group's owner-blocker line — *“Freemius (only if adopted as a rail): seller identity and tax
registration, and it is unverified whether an osek patur qualifies without a registered company”* — stands
unchanged after this session.

---

## 8. Invoicing — FLAGGED, NOT RESOLVED

The brief said flag, not resolve. Here is exactly what to flag, and it is more specific than expected because one
search surfaced a Freemius feature nobody in this repo had seen.

**Freemius auto-generates the seller's invoice.** From `freemius.com/blog/changelog/new-feature-reverse-invoices-for-your-payouts/`
[SNIPPET]: *“As the merchant of record, Freemius is essentially a reseller of your software and is officially
**your sole customer**. This setup used to mean that makers had to issue payout invoices as proof of funds.
Freemius now automatically generates payout invoices on behalf of vendors — formatted exactly as if you'd issued
them yourself… The payout email includes a link to a reverse invoice… In practice, this is the invoice you are
expected to send to Freemius for the payout; however, we generate it on your behalf.”*

Four things collide, and none is ours to settle:

1. **Our seller has exactly one customer, and it is American.** Not hundreds of end buyers — **Freemius, Inc.**,
   a US corporation under New York law ([RENDERED], §3). One export invoice per monthly payout. That is a
   *simpler* shape than Gumroad, not a harder one, and it is the first genuinely favourable structural difference
   this measurement found.
2. **But it is an export of services, which reopens the §30(a)(5) zero-rating question the repo already has
   open.** `research/colony-sweep/groups/payment-rails.md` records two scouts disagreeing about whether Israeli
   export zero-rating applies cleanly, with an *“Israeli resident is also a beneficiary”* trap, and the group
   flagged it as *“an accountant question, not a fact.”* Freemius does not change that; it just makes the
   counterparty concrete.
3. **A reverse invoice is a self-billing document, and Israel has its own rules about who may issue a
   חשבונית מס.** Whether a document Freemius generates satisfies the Israeli requirements — including the
   invoice-allocation-number regime the tax authority now runs — is a question for the owner's accountant. Do not
   assume the auto-generated PDF is a valid Israeli tax invoice. Do not assume it is not.
4. **“Freemius is Israeli” cuts the wrong way if taken literally.** Freemius is widely described as
   Israeli-founded and the rendered evidence supports an Israeli operational home (Tel Aviv-Jaffa arbitration
   venue for the entire non-Americas world; the founder listed under Israel in `gayanvoice/top-github-users`
   [RENDERED, weak]). **But the entity on the contract is Freemius, Inc. under New York law.** If the payer were
   an Israeli entity, the supply would be domestic and carry 18% VAT rather than being a zero-rateable export —
   materially worse. So the "Israeli company" framing that made Freemius attractive in `rails.ts` is, on the only
   rendered document, not the operative fact. **Whether a Freemius Israeli subsidiary is ever the paying entity
   on our payout is a question to ask, not to answer here.**

---

## 9. Verdict

| Field | Answer |
|---|---|
| **PAYS ISRAEL** | **UNKNOWN.** No source at any grade names Israel on the seller supported-countries or payout list. `freemius.com` [BLOCKED]; `web.archive.org` [BLOCKED]; GitHub holds no mirror of the page. The "190+ countries, excluding US-sanctioned" claim is [SNIPPET] and Israel's absence from a sanctions list is not presence on a payout list — this repo has been burned by that inference before |
| **Currency (buyer)** | USD, GBP, EUR, **ILS**, CAD, AUD, PLN, CHF, RSD — [RENDERED] from Freemius's own code |
| **Currency (payout)** | **UNKNOWN, presumed USD.** No document of any grade states a seller payout currency; USD is the only currency any rendered Freemius text names, and the EULA fixes buyer amounts in US Dollars. **ILS payout is refuted as an unsupported reading, not confirmed** |
| **Method** | PayPal (default, MassPay), Payoneer, bank wire IBAN/SWIFT, Wise — [SNIPPET] ×2 + [RENDERED] third-party. All four independently reach Israel; that is a syllogism, not a finding |
| **Minimum** | **$100** account balance — [SNIPPET] |
| **Schedule** | Monthly, with a ~40-day earnings hold: January earnings calculated 1 March, payable 10 March. **~40–70 days sale-to-cash** — [SNIPPET] |
| **Fee** | **4.7% base + 2.3% WordPress solution = 7.0% platform + gateway (~2.9% + fixed) ≈ 10–11% all-in.** Plus PayPal's 2% (max $20) on non-US transfers — [RENDERED] third-party + [SNIPPET] |
| **KYC** | **UNKNOWN.** One hedged snippet says an individual can sell. Nothing on documents, company requirement, **עוסק פטור** eligibility, or tax forms |
| **Prohibited content** | Health/medical AI without regulatory cover; PLR/MRR/resold or unowned products; anything on Stripe's restricted or PayPal's prohibited lists or against Visa/Mastercard rules; piracy tooling. **SaaS and AI-powered software are explicitly ALLOWED** — [SNIPPET] for the list, [RENDERED] for the SaaS/AI permission via Freemius's own `ai-chat-nextjs-example`, `freemius-ai` and `freemius-js` repositories |
| **Invoicing flag** | **FLAGGED, NOT RESOLVED.** MoR is **Freemius, Inc.**, New York law, and it is the seller's *“sole customer”*; Freemius auto-issues a **reverse invoice** per payout. So the Israeli side is one export invoice per month to a US company — which reopens the repo's existing §30(a)(5) zero-rating question and raises a new one: whether an auto-generated reverse invoice is a valid Israeli **חשבונית מס**. Accountant question, on the owner's checklist, not ours |
| **VERDICT** | **UNKNOWN → the rail stays unusable and task #21 stays OPEN.** Freemius may not be adopted, may not be written into `RAIL_BY_LINE`, and may not be counted as diversification against the Gumroad concentration. `railConcentration()` keeps reporting `concentrated` |

---

## 10. What would close this, in ascending cost

1. **One page, twenty seconds, by a human or an unblocked agent:**
   `https://freemius.com/help/documentation/selling-with-freemius/supported-countries/` — search for "Israel", and
   while there record **which payout methods** the page shows against it and **what currency** an Israeli account
   receives. That single page converts this whole report from UNKNOWN to a verdict.
2. **Second question on the same visit:** `https://freemius.com/help/documentation/selling-with-freemius/your-earnings/`
   — confirm the $100 minimum, the monthly schedule, the ~40-day hold and the payout currency, all of which are
   snippet-grade here.
3. **Third question on the same visit, and it is the owner-step one:** does the vendor sign-up accept an
   **individual** with no registered company, and what identity/tax documents does it demand? `https://freemius.com/terms/vendor/`
   is the binding document and nobody has read it.
4. **A rendered acceptable-use page** — `https://freemius.com/terms/acceptable-use/` — settling whether a
   *service* (as opposed to a software product) may be sold at all.
5. **An existence proof.** One Israeli seller publicly stating they are paid by Freemius would do more than any
   documentation page. None was found; GitHub is not where people discuss their payouts.

**URLs a human or unblocked agent must open:**
`https://freemius.com/help/documentation/selling-with-freemius/supported-countries/` ·
`https://freemius.com/help/documentation/selling-with-freemius/your-earnings/` ·
`https://freemius.com/help/payout-methods/` ·
`https://freemius.com/terms/vendor/` ·
`https://freemius.com/terms/acceptable-use/` ·
`https://freemius.com/help/documentation/selling-with-freemius/allowed-prohibited-products/` ·
`https://freemius.com/blog/changelog/new-feature-reverse-invoices-for-your-payouts/`

---

## 11. Sources rendered this session

**Freemius's own repositories** (via GitHub code search + `raw.githubusercontent.com`):
- `Freemius/wordpress-sdk` → `includes/entities/class-fs-payment.php` (currency constants incl. `CURRENCY_ILS`)
- `Freemius/wordpress-sdk` → `templates/forms/affiliation.php` ($100 minimum, "Payouts are in USD and processed
  monthly via PayPal", 30-day refund hold — **affiliate** programme)
- `Freemius/wordpress-sdk` → `templates/account/billing.php` (the buyer-side ISO country dropdown containing
  `'IL' => 'Israel'` — the inference trap, §2)
- `Freemius/freemius-checkout-js` → `src/lib/contracts/CheckoutPopupOptions.ts` (`CheckoutCurrency` union)
- `Freemius/pricing-page` → `src/entities/Pricing.js` (currency symbol table incl. `ILS: '₪'`)
- `Freemius/freemius-js` → `README.md` (SaaS SDK; "MIT © Freemius Inc")
- `Freemius/ai-chat-nextjs-example` → `README.md` (AI credit-metered SaaS on Freemius, with prices)
- `Freemius/freemius-ai` → `README.md` (Freemius agent skills; Hono SaaS example)
- `Freemius` org repository listing (26 repos)

**Third-party, rendered:**
- `bigmikesolutions/flex-top-bar` → `plugins/flex-top-bar/assets/doc/EULA_freemius.md` — a complete
  Freemius-generated EULA: "Freemius, Inc. … merchant of record", New York governing law, USD, Tel Aviv-Jaffa
  arbitration for non-Americas residents
- `Spidy092/grovia-wordpress-theme` → `research/business/monetization-stack.md` — 4.7% + 2.3% = 7.0% + gateway
- `HelpMe-Pls/Life-Engineering` → `Notes/breakglass-research/RAILS-INTEL.md` — payout methods, Vietnam-specific
- `citp/privacy-policy-historical` → `f/fr/fre/freemius.com.md` — 2019 snapshot, "Freemius, Inc. (the 'Company')",
  and the existence of a separate vendor-terms URL
- `gayanvoice/top-github-users` → `markdown/*/israel.md` — `@freemius` / `vovafeldman` listed under Israel (weak)

**Blocked:** `freemius.com` (one attempt, `EGRESS_BLOCKED`) · `web.archive.org` / `archive.org`
(`CONNECT tunnel failed, response 403`).

**Searches spent: 6 of 6.** (1) Freemius supported countries payout Israel seller. (2) Freemius "your earnings"
payout minimum/schedule/currency. (3) Freemius reverse invoice / self-billing / VAT. (4) Freemius vendor terms
prohibited products / SaaS / AI. (5) Freemius supported-countries list "Israel", `allowed_domains: freemius.com`.
(6) Freemius seller KYC / individual / sole proprietor / W-8BEN.

Eleven GitHub `search_code` calls and one `search_repositories` call, at zero search budget.

---

## 12. For `src/revenue/rails.ts` (`beforeUse`) and `docs/REJECTED.md` — 100 words

> **Freemius — UNKNOWN, rail unusable, 7.9.2026.** GitHub settled everything except the gate. Freemius's own SDK
> lists `CURRENCY_ILS` as a *checkout* currency, so "pays out in ILS" is refuted, not merely doubted. A mirrored
> EULA names **Freemius, Inc.** merchant of record under New York law, buyer amounts in US Dollars, arbitration in
> Tel Aviv. Payouts: monthly, $100 minimum, PayPal/Payoneer/wire/Wise, roughly 40–70 days late, ~10–11% all-in.
> SaaS and AI-powered software are permitted; resold, PLR and unregulated medical products are not. **No source
> names Israel on the payout list; freemius.com and web.archive.org are both blocked.** Do not adopt.


## 12. Rendered 7.9.2026, after this report — by `render-watch.yml`

The supported-countries page was fetched by a GitHub Actions runner and stored as
`research/rendered/freemius-supported-countries.{html,txt,meta.json}` (HTTP 200, 69,706 bytes). **[RENDERED]**
"Supported Countries for Payouts" contains **Israel** (line 308 of the text extraction); the "Unsupported
Countries" list (from line 574) holds Cuba, Iran and the other US-sanctioned states. Payout methods on the same
page: PayPal MassPay (default), Payoneer, wire transfer (IBAN/SWIFT), Wise; "at least one payout method is
available" per listed country. **Verdict revised: PAYS ISRAEL = YES (rendered).** Currency, fee, hold, KYC and
the prohibited list remain as graded above; the pages that settle them (`/your-earnings/`,
`/allowed-prohibited-products/`) are queued in `research/rendered/urls.txt`.


## 13. Second render, same evening — earnings and prohibited-products pages

`research/rendered/freemius-your-earnings.txt` (HTTP 200, 78,140 bytes) and
`freemius-allowed-prohibited.txt` (HTTP 200, 67,521 bytes). **[RENDERED]**
- **Currency:** "For USD, GBP, and EUR, you can set up separate payout methods. However, other currencies, such
  as AUD, CAD, **ILS**, CHF, RSD and PLN, are converted to USD at the time of purchase and added to your USD
  balance" (lines 141–143). "Only Wise and wire transfers support payout conversion currencies … you can convert
  payouts to your local currency" (147–154). So: ILS sales → USD balance → ILS bank payout possible via Wise or
  wire. The original "pays in ILS with no conversion fee" claim stays refuted as stated.
- **Schedule:** "$100 minimum payout threshold", "processed automatically on the 10th of each month"; January
  earnings calculated 1 March, eligible 10 March (166–176); transfers 3–6 business days (227); "minus Freemius
  fees" (170) — the fee figure is not on this page. No Stripe Connect onboarding (184).
- **Allowed:** "SaaS (Software-as-a-Service) — Examples: Analytics tools, REST APIs, design platforms,
  productivity apps, AI-powered services" and downloadable software, plugins, extensions (100–106).
  **Prohibited:** non-software products, "SaaS products requiring fulfillment through human services",
  harmful/infringing AI content generation, medical advice, adult (114–135).
- **Queued next:** `/selling-with-freemius/verification/` (KYC) and `/getting-started/our-pricing/` (fee).

**Verdict now:** PAYS ISRAEL YES (rendered); USD balance with ILS payout via Wise/wire; $100 / 10th monthly /
~40–70 days; SaaS and AI-powered services allowed; fee and KYC still snippet-grade pending the two queued pages.
