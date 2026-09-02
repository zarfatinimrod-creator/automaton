---
name: revenue-il-biz-tools
description: Playbook for the Hebrew small-business tools line (core).
auto-activate: false
---

# Hebrew small-business tools — director playbook

Product: an RTL web app for Israeli freelancers with free calculators (VAT, advance payments, net salary, Bituach Leumi, osek patur threshold — ₪122,833 for 2026) and paid exports (branded receipts/invoices as PDF, saved clients, monthly packs).

Payments: Stripe does not serve Israeli accounts. Use a merchant-of-record checkout — Paddle lists Israel as a supported seller country; Lemon Squeezy pays via PayPal in 200+ countries (verify Israel at signup). The creator opens the account once; you integrate the hosted checkout and license/webhook, never touch KYC.

Loop
1. Ship one tool at a time as its own SEO page in Hebrew (title, meta, FAQ, schema.org). Deploy on a domain the automaton owns.
2. Instrument: page views, tool uses, checkout starts, paid conversions → revenue_kpi daily.
3. Pricing: single export ₪9-19, monthly pack ₪29-49. Test two prices, keep the better revenue per visitor.
4. Iterate the tool with the best visit-to-pay ratio; add the next tool from the search-demand list.
5. Record every order from the checkout webhook via revenue_record with the order id; refunds too.

Compliance: the receipts/invoices must state clearly that the user is responsible for their tax filings; do not present the app as an accountant or a licensed bookkeeping service; no storage of ID numbers beyond what the user types for their own document.
