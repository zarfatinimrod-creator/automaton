# Scout notes — licensing-ip / white-label

Date: 2026-09-05. Scout: WORKER-SCOUT "white-label", group `licensing-ip`.

Criterion: **white-labelling and reselling our own tools to accountants, bookkeepers and Israeli
SaaS vendors** — how such deals are normally structured, and whether any can close without a human
conversation.

Search budget spent: **8 of 8 allowed** WebSearch calls. GitHub `search_code` and WebFetch attempts
were free and are marked as such.

---

## 1. Evidence ledger

### Rendered primary sources (strong)
- `mcp__github__search_code` (free, 2026-09-05) over public GitHub for `morning.co.il api invoice`
  returned first-hand code and skill files from **`skills-il/accounting`** (`green-invoice/SKILL.md`,
  `green-invoice/SKILL_HE.md`), **`urielTrachter/NexusCore`** (`app/Services/Strategies/Invoice/MorningInvoiceStrategy.php`,
  `config/nexus.php`), **`Yuval-Steimberg/gift_card_system`** (`lib/accounting/greeninvoice.ts`,
  `docs/GO-LIVE-PRODUCTION.md`), **`yylevy171/DeniDin`** (`specs/done/v0.0.1/005-mcp-morning-green-receipt/phase-0-research.md`).
  What this proves first-hand: Morning / Green Invoice exposes a **documented public API with
  user-generated API keys** (`api.greeninvoice.co.il`, key + secret from the dashboard, API access
  gated to higher plans). Third parties integrate with it by holding *the end customer's own* API
  key. **Nothing in any of these sources describes an app store, a listing, a partner tier or a
  payment flowing from the vendor to a third-party developer.**
- Repo-internal (strong, our own systems): `products/il-biz-tools` already collects money through
  **Paddle** and `products/telegram-il-tools-bot` through Telegram Stars — i.e. an Israeli-resident
  seller is demonstrably payable through a merchant-of-record checkout. This is the payment rail any
  self-serve white-label tier of ours would reuse.

### Search snippets only (weaker — every underlying domain below is egress-blocked here)
- **monday.com marketplace monetization** (search 2026-09-05). Snippets quoting
  `https://developer.monday.com/apps/changelog/announcing-the-revshare-program`,
  `https://developer.monday.com/apps/docs/subscriptions-payments-and-billing`,
  `https://developer.monday.com/apps/docs/implementing-monetization`, and monday.com's 20-F filing
  `https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm`:
  - Revenue share activates **only after $200,000 lifetime accumulated app revenue**; from then
    **85% developer / 15% monday**.
  - From **July 2024** all new marketplace apps **must** use monday's built-in monetization; monday
    handles billing, currency conversion, renewals, refunds, invoices, taxes and payouts.
  - **Payout requires a Payoneer account.**
  - Scale, from the filing: **869 apps in the marketplace as of 31 Dec 2025, 704 with native
    monetization.**
  - URLs a human or unblocked agent must open to close this: the three developer.monday.com pages
    above.
- **Wix App Market** (search 2026-09-05). Snippets quoting
  `https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/about-monetizing-your-app`,
  `https://support.wix.com/en/article/wix-studio-tracking-your-earnings`,
  `https://www.wix.com/studio/partner-program`: developer receives **100% of revenue in the first
  year, 80% thereafter**; **no processing fees**; payouts **monthly once a $200 threshold is
  reached**, **net 30 EOM**; four pricing models (free / freemium / premium / dynamic); payouts
  tracked in the Wix Studio workspace Payouts tab. URL to open:
  `https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/about-monetizing-your-app`.
- **Priority Software Marketplace** (search 2026-09-05). `https://market.priority-software.com/`,
  `https://market.priority-software.com/become-vendor/`, `https://market.priority-software.com/v/`
  exist. Snippet summary: marketplace products **must be developed by authorised Priority partners**
  using Priority's official tools and APIs; there is an ISV programme. **WebFetch of
  `market.priority-software.com/become-vendor/` returned EGRESS_BLOCKED** (free attempt, 2026-09-05),
  so the exact onboarding path is unverified. URL to open: the become-vendor page.
- **Israeli accounting-software field** (Hebrew search 2026-09-05 for "מיתוג לבן" + software for
  accountants/bookkeepers). Returned only vendor product pages —
  `rivhit.co.il` (תוכנה לרואי חשבון, מנהלי חשבונות ויועצי מס), `liram.co.il` (רמפלוס),
  `minisoft.co.il`, `home.paperless.tax`, `finsite.co.il`, `bringup.io` — plus `cpahub.co.il/tools/`,
  an Israeli accountants' hub that publishes a *tools* section. **No Hebrew result offered a
  white-label / OEM / reseller programme, and none offered a developer or partner portal.**
- **Morning / Green Invoice third-party ecosystem** (Hebrew search 2026-09-05). Snippets quoting
  `https://www.greeninvoice.co.il/api-docs/`, `.../help-center/api/`,
  `.../help-center/generating-api-key/`, `https://www.e-c.co.il/morning/`, `https://cpahub.co.il/tools/…`:
  API keys are created by the *end customer* under My Account → Developer Tools → API Keys, and API
  access is limited to business plans. Notably: an existing third-party **Make app for Morning "is
  not available in the Make application marketplace and needs to be added manually to the account"**
  — i.e. even the integrations that exist are not distributed through a store.
- **White-label / OEM deal norms** (search 2026-09-05). Snippets quoting
  `https://www.getmonetizely.com/articles/white-label-amp-oem-deals-crafting-winning-pricing-strategies-for-licensing-your-saas`,
  `https://www.getmonetizely.com/articles/white-label-pricing-models-maximizing-value-when-licensing-your-technology`,
  `https://saasdash.ai/blog/white-label-saas-licensing-economics`,
  `https://licensesaas.com/blog/how-to-license-your-saas-product-pricing-models-contracts-2026`:
  - Four standard structures: **wholesale price + partner markup; revenue share; flat platform
    licence; per-seat / per-account**.
  - Flat licences quoted at **$200/month for simple tools up to $5,000–$20,000/month** for full
    branding removal + SLA; a common hybrid is **$2,000–$10,000/month flat plus $5–$20 per active
    end-tenant**, with a **12-month minimum term** and a **ramp** (reduced fee months 1–3).
  - Revenue share: **30–40% to the technology provider** cited to OpenView benchmarks; an
    alternative framing is **10–20% of the partner's resale revenue**, or none in exchange for a
    higher flat fee.
  - **Exclusivity priced at a 40–100% premium** on the base fee.
  These are secondary commercial blogs, not primary contracts — grade: snippet-level, medium.
- **White-label buyer side, accounting vertical** (search 2026-09-05). Snippets quoting
  `https://suitedash.com/best-client-portal-for-accountants/`, `https://linkmybooks.com/blog/white-label-bookkeeping-softwares`,
  `https://www.remotebooksonline.com/white-label-bookkeeping`, `https://stephsbooks.com/blog/white-label-bookkeeping-cpa-firms`:
  white-label **is** a normal purchase for accounting firms, and at the low end it is bought
  self-serve: SuiteDash tiers cited at **$19/month (Start) and $99/month (Pinnacle)** with white-label
  capability, "transparent online pricing without requiring a sales call". This is evidence about the
  **US/global** accounting market, not the Israeli one. No Israeli equivalent was found.
- **Freemius as a partner/affiliate rail** (search 2026-09-05). Snippets quoting
  `https://freemius.com/help/documentation/affiliate-platform/paying-affiliates-commission/`,
  `https://freemius.com/help/documentation/selling-with-freemius/supported-countries/`,
  `https://freemius.com/affiliate-program/`: a **built-in affiliate platform** with **automated
  net+60 monthly payouts via PayPal**; seller payouts also via **Payoneer, Wise and bank wire**, with
  a **$100 minimum**; "you can sell with Freemius if you live or operate from any of the supported
  countries … all countries where at least one payout method is available". The snippet did **not**
  render the country list, so Israel is inferred, not verified — the repo already carries this as
  open task #21. URL to open: `https://freemius.com/help/documentation/selling-with-freemius/supported-countries/`.

### Fetches that failed (free attempts)
- `market.priority-software.com` — EGRESS_BLOCKED.
- `developer.monday.com` — EGRESS_BLOCKED.
- `raw.githubusercontent.com/skills-il/accounting/main/README.md` — HTTP 404 (branch/name differs;
  the same repo's files were reachable through `search_code`, which is how the Morning evidence was
  obtained).
- GitHub `search_code` for white-label/reseller licence language returned only unrelated CSV datasets
  — platforms and vendors do not check white-label contracts into public repos. Do not repeat it.

---

## 2. The answer to the criterion, stated plainly

**How these deals are normally structured.** Four shapes, and they sort cleanly by whether a person
must talk:

| Shape | Normal terms | Closes without a conversation? |
|---|---|---|
| **A. Self-serve white-label *tier*** on the vendor's own SaaS (SuiteDash-style: pay more, remove our brand, use your domain) | $19–$99/month at the low end; published price, card checkout | **YES** — it is just a plan |
| **B. Marketplace listing with platform billing** (monday.com, Wix) | Platform collects, pays out; monday 100% dev until $200k lifetime then 85/15, Payoneer; Wix 100% year 1 then 80%, $200 threshold, net-30 EOM | **YES to the money**, but an app **review** stands between submission and listing. A review is not a conversation, but it is a gate we do not control |
| **C. OEM / true white-label licence to another vendor** | $2k–$10k/month flat + $5–$20 per active tenant, or 10–20% (sometimes 30–40%) rev share; 12-month minimum; ramp months 1–3; exclusivity +40–100% | **NO.** Every one of those numbers is a negotiated variable. Contract, legal review, a named counterpart. Structurally forbidden by MISSION |
| **D. Affiliate / referral programme we run** (accountant recommends, gets a cut) | Coupon or link, revenue-share commission, automated payout (Freemius: net+60 PayPal) | **YES** — the accountant self-onboards; nobody negotiates |

**The finding that decides the criterion:** the only white-label deals that close without a human
conversation are the ones where **white-label is a product feature we sell, not a partnership we
negotiate**. Shape C — the thing people mean by "white-label deal" — is negotiation by construction
and is closed to this operation. Shapes A, B and D are open, and A is the only one that is entirely
ours to build and price.

**And the Israeli-vendor half of the criterion is largely empty.** Israel's accounting-software
vendors (Rivhit, Minisoft, Paperless, FinSite, Liram/Ramplus, Morning/Green Invoice) publish
*customer* APIs, not *developer economies*. There is no Israeli equivalent of the HubSpot or Shopify
app store where a third party lists a paid app and the vendor remits money — Morning's own ecosystem
is so store-less that a third-party Make connector for it must be side-loaded by hand. Priority
Software has a marketplace, and it is gated on being an authorised partner, i.e. shape C.

The two Israeli SaaS vendors that **do** pay third-party developers automatically are the two large
horizontal platforms — **monday.com** and **Wix** — and there the buyer is not an accountant, it is
their end user. Selling to "Israeli SaaS vendors" in the sense the criterion asks about is a dead
end; selling *through* two of them is not.

---

## 3. Israel payability

- **Paddle** (shape A): already paying us — internal, verified by our own shipped product. **YES.**
- **monday.com** (shape B): payout requires a **Payoneer** account. Payoneer is available to Israeli
  residents; monday.com is itself an Israeli-headquartered company. **YES, medium-high confidence** —
  the payout-country page was not rendered (domain blocked).
- **Wix** (shape B): Wix is Israeli, payouts run through the Wix Studio workspace. **YES, medium
  confidence** — page blocked, no country list rendered.
- **Freemius** (shape D): payouts via PayPal / Payoneer / Wise / wire, $100 minimum. **UNKNOWN until
  the supported-countries page is opened** (repo task #21 already tracks this).

---

## 4. Owner blockers (one-time, identity/KYC/payout only)

- Paddle seller account already exists — no new blocker for shape A beyond what is already live.
- monday.com: create a **Payoneer** account and complete its KYC; accept the marketplace developer
  terms. One-time, human, unavoidable.
- Wix: a Wix account with payout details and tax identity for the Payouts tab. One-time.
- Any shape-C deal would additionally need signature on a commercial contract — which is exactly why
  it is out.

---

## 5. Dead ends (record these so the colony does not re-search them)

1. **Israeli accounting/invoicing vendors as distribution partners.** No public developer programme,
   no app store, no third-party payout mechanism at Rivhit, Minisoft, Paperless, FinSite, Liram or
   Morning/Green Invoice. Their APIs are for the *customer's own* automation. Reopening condition:
   any of them announcing a partner marketplace with revenue share.
2. **Priority Software Marketplace.** Real, but vendor status runs through an authorised-partner
   route. AMBER, and the page is egress-blocked so it could not even be read. Do not build.
3. **Classic OEM / white-label licensing.** Terms are documented above precisely so nobody has to
   research them again; the structure itself (12-month minimums, negotiated per-tenant fees,
   exclusivity premiums) requires a human counterpart. Permanently closed under MISSION unless the
   owner changes the no-conversation rule.
4. **GitHub as a source for white-label contract terms.** `search_code` returned nothing usable.
   Commercial terms of this kind live on blocked marketing domains.
5. **Demand evidence for Israeli accountants buying branded client-facing tools.** Not found. The
   white-label-for-accountants demand evidence that exists is US/global (SuiteDash, RemoteBooksOnline,
   Booxkeeping). Every Israeli-side finding here about *demand* is therefore low confidence, and the
   honest next step is an occupancy test, not a build.
