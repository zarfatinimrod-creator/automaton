---
name: revenue-il-biz-tools
description: Playbook for the Hebrew small-business tools line — free calculators, one Pro feature, Gumroad rail (core).
auto-activate: false
---

# Hebrew small-business tools — director playbook

**Audited ceiling: ₪400/month at twelve months** (`research/colony-sweep/CHIEF-AUDIT.md` §2.1 row 3; band
₪200–400). **Month one: ₪0.** Board decision 7.9.2026: keep, retargeted from the old ₪3,000; rail Gumroad.

Product: `products/il-biz-tools` — a static RTL site of free calculators for Israeli freelancers (VAT,
advance payments, net salary, Bituach Leumi, osek patur threshold) plus **one** paid feature, the branded
invoice/receipt PDF, unlocked by an offline-verifiable licence key. The Pro copy promises that feature and
nothing else — the tier once sold a PDF that did not exist and two features that were already free, and that
is why `MISSION.md` rule 4 exists.

## Rails, as the board ruled

- **Gumroad is the merchant of record and the default rail** (`src/revenue/rails.ts`): the only one with
  rendered proof of ILS payout to an Israeli bank (`Israel | ILS` in Gumroad's own source). Fee 12.9% + $0.80,
  plus 2.9% + $0.30 because an Israeli seller cannot connect their own Stripe — about 22% at $9, 17% at $19.
  Price accordingly: nothing under $9 is worth listing there. Gumroad Discover cannot source a new product's
  first sale (its own `sale_made` gate), so it is a rail, not a channel.
- **Paddle is an option the owner may choose, never a step**: Sumsub may demand a selfie video, approval is
  discretionary and pre-revenue sellers have been refused, and ILS is not a payout currency.
- "Stripe does not serve Israeli accounts" is **not** an established fact — it was reopened in
  `docs/REJECTED.md`; Algora's source lists Israel for Stripe Connect Express. Owner step 4 settles it.
- Gumroad forbids selling AI services fulfilled outside Gumroad. The Pro feature is a downloadable
  capability behind a licence key, which is allowed; nothing hosted or AI-fulfilled goes on Gumroad.

## Gates that hold before any figure is published

- `src/config/tax-2026.json` carries `verified: false`. **No page renders an unverified rate as fact.**
  The build refuses or banners such pages; nobody marks a rate verified without a rendered source.
- Every URL is still `*.netlify.app` until owner step 5 (domain). Every published link carries the owner's
  GitHub username until step 7 (organisation). Do not promote before both.

## Loop

1. **Deploy through CI, not by hand:** Netlify linked to the repo (owner step 6), base `products/il-biz-tools`,
   build `node scripts/build-site.js`, publish `_site` — the allowlist `netlify.toml` declares.
2. **Measure before pricing:** page views and tool uses (PostHog cookieless, only when a project key is set),
   checkout starts, paid conversions → `revenue_kpi` daily. One Hebrew SERP pull for the calculator terms
   goes to `research/measurements/serp/` verbatim; it is never automated (Google's terms).
3. **Ship one tool per SEO page in Hebrew** (title, meta, FAQ, schema.org). The registrar annual-fee page
   (board build #6) is the next one: a deadline calculator and a **free** reminder sign-up that stays disabled
   until 100 weekly views are measured, with the §30א(ג) disclosure at capture and Amendment 13 handling.
4. **Pricing:** Pro as a one-time licence; test two prices and keep the better revenue per visitor. Annual
   before monthly, because of the fee floor.
5. **Record money only as money:** every Gumroad sale enters the ledger through the Gumroad connector with
   its sale id (`GUMROAD_ACCESS_TOKEN`, hourly); refunds too. A checkout start is a KPI, never revenue.

## Compliance

State on every export that the user is responsible for their own filings; never present the site as an
accountant or a licensed bookkeeping service; store no ID numbers beyond what a document needs, and nothing
server-side (the site is static). Nothing on the site or in its metadata carries the owner's name.
