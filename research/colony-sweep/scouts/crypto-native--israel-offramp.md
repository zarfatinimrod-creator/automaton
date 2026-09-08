# Scout notes — crypto-native / israel-offramp

**Criterion:** Crypto to ILS in practice — exchanges serving Israel, bank acceptance of crypto
proceeds, reporting duties, and the friction that would block us receiving stablecoin revenue.
**Date of research:** 2026-09-03. **Search budget spent:** 8 of 8 (cap). **Pages rendered: 0.**

## Evidence quality warning — read this first

Every domain that holds a primary source for this criterion is blocked by the container's egress
proxy. Confirmed `EGRESS_BLOCKED` this session: `www.gov.il`, `www.legal500.com`, `barlaw.co.il`,
`blockeden.xyz`. `lexology.com`, `practiceguides.chambers.com`, `boi.org.il` and `bitsofgold.co.il`
were returned by search but not attempted after four consecutive blocks (would have burned turns for
nothing). GitHub code search produced **no** platform-owned or government primary source on this
criterion — only third-party agent-skill repos that themselves cite the same exchanges.

So: **everything below rests on WebSearch snippets, not on a rendered page.** Snippets are quoted
summaries. Nothing here is strong evidence. Confidence is capped at `medium` for anything with two
independent snippets and `low` for anything with one.

## URLs a human or unblocked agent must open to close this

| Question | URL |
|---|---|
| Tax Authority's own position on digital assets | https://www.gov.il/en/pages/faq-digital-assets |
| Form 909 — paying tax when the bank refuses crypto money | https://www.gov.il/en/service/reporting-cryptocurrency-activity |
| Directive 411 text (Proper Conduct of Banking Business) | https://www.boi.org.il/en/economic-roles/supervision-and-regulation/proper_conduct/ |
| Banks may not unreasonably refuse crypto transactions | https://www.lexology.com/library/detail.aspx?g=ae91550b-496d-4031-a74b-770414582270 |
| "The jury is still out" — banks in practice | https://www.lexology.com/library/detail.aspx?g=89bbf508-878e-410d-ab62-994e96608a96 |
| Israeli crypto tax snapshot | https://www.lexology.com/library/detail.aspx?g=7f28b0b6-5de1-4329-922c-dc879f42227a |
| Country guide: licensing, banks, tax | https://www.legal500.com/guides/chapter/israel-blockchain-crypto-assets/ |
| Blockchain 2025 — Israel trends | https://practiceguides.chambers.com/practice-guides/blockchain-2025/israel/trends-and-developments/O21417 |
| BILS approval detail | https://www.coindesk.com/policy/2026/04/28/a-digital-shekel-is-here-israel-approves-its-first-regulated-stablecoin |
| Bits of Gold fees, business accounts, USDC pairs | https://www.bitsofgold.co.il/en |
| Kraken ILS / Israeli bank withdrawal reality | https://support.kraken.com/articles/usd-funding-guide |
| VAT treatment of crypto revenue | https://www.crowe.com/il/insights/taxation-of-cryptocurrencies |

## 1. The rail exists and it got materially better in April 2026 (BILS)

Search (2026-09-03) on Bits of Gold / Capital Market Authority returned a cluster of April 2026
stories: the Capital Market Authority approved **BILS**, a shekel-pegged stablecoin issued by
**Bits of Gold**, a licensed financial asset service provider, after a roughly two-year pilot; it
runs on Solana and its stated uses include **FX against major stablecoins such as USDC**, real-time
payments, smart-contract execution and global shekel-denominated transfers.

Sources seen as search results (none rendered):
- https://www.coindesk.com/policy/2026/04/28/a-digital-shekel-is-here-israel-approves-its-first-regulated-stablecoin
- https://www.ynetnews.com/business/article/r1xsovtp11e
- https://www.financemagnates.com/cryptocurrency/israel-approves-first-shekel-pegged-stablecoin-framework-after-two-year-regulatory-pilot/
- https://cryptobriefing.com/israel-shekel-backed-stablecoin-approval/
- https://blockeden.xyz/blog/2026/04/29/israel-bils-shekel-stablecoin-solana-bits-of-gold/ (BLOCKED)

What this does **not** establish, and must not be assumed: that BILS is open to a retail/small
business account today, that USDC→BILS→ILS-in-a-bank-account is a self-serve flow, what it costs,
or whether an automated (API) conversion is available without an institutional agreement. Snippets
mention "institutional clients through dedicated B2B solutions with API integrations" — that phrasing
suggests a sales conversation, which the owner will not have (MISSION: no talking to people).

## 2. Exchanges serving Israel

- **Bits of Gold** (bitsofgold.co.il) — Israeli, operating since 2013, described in snippets as
  holding a **Currency Service Provider licence from the Ministry of Finance** and a **financial
  asset service provider licence from the Capital Market Authority**, supporting BTC/ETH/**USDC**,
  buying with ILS by bank transfer and card. This is the canonical ILS on/off-ramp.
- **Bit2C** (bit2c.co.il) — named as the other Israeli exchange in two independent third-party
  repos (skills-il/tax-and-finance, RonTuretzky/p2peace-zkemail). Directory-grade evidence only.
- **Coinbase** — a snippet states Coinbase "does NOT support customers in Israel" and "Israeli New
  Sheqel is not currently available through Coinbase", but the snippet itself is dated to a 2020
  claim on buybitcoinworldwide.com. Treat as **unverified and probably stale**; the direction
  (no ILS fiat rail at Coinbase) is nonetheless consistent with everything else.
- **Kraken** — third-party country lists say Kraken serves Israel; Kraken's own USD funding guide
  lists SWIFT via Bank Frick. **No ILS.** Whether an Israeli bank account is accepted as the SWIFT
  beneficiary for USD withdrawal is UNKNOWN and is the single cheapest thing to verify next.
  https://www.datawallet.com/crypto/kraken-countries , https://support.kraken.com/articles/usd-funding-guide

## 3. Bank acceptance — the real friction

Snippet-level, two independent search summaries agree:
- **Directive 411** (Proper Conduct of Banking Business) requires banks to adopt a written policy
  and a **risk-based** approach to crypto-sourced funds and **forbids blanket refusal**; relevant
  factors include the type of coin, degree of anonymity, volume, the identity of the VASP and the
  customer's profile. Funds arriving from a **licensed** VASP is the favourable case.
- In practice "crypto-related transactions are still very often turned away despite this directive",
  and banks refused deposits for years on AML grounds — to the point that **the Israel Tax Authority
  created Form 909** so a taxpayer can pay tax on crypto profits **directly into an ITA account at
  the Bank of Israel when the banking system refuses the transfer**. The snippet says this procedure
  is temporary and valid **until 31 August 2026**.

Read that backwards: the state built a workaround because the banks do not reliably work. That is
the honest state of "crypto to ILS in practice" — legal, licensed, and still bank-dependent.

## 4. Reporting and tax duties (what receiving USDC actually triggers)

From two search summaries (STEP, Crowe, Bitget, y-tax, Tax Natives, ITA FAQ — none rendered):
- **Tax event on receipt.** Liability arises upon *receipt of virtual currency in consideration for
  a service*, not only on conversion. Our x402/USDC revenue is taxable when the USDC lands, even if
  it is never converted to shekels. This directly contradicts any plan of "earn USDC now, worry
  about ILS later".
- **25% capital gains** for an individual's disposals, *unless* the activity has business
  characteristics — in which case ordinary income/corporate rates apply. Selling API calls for USDC
  is business activity by any reading.
- **VAT:** crypto is treated as a means of payment, not goods, so it is not itself VATable; but a
  person whose crypto activity is business-like is registered as a **"financial institution"** for
  VAT — VAT on inputs not deductible, plus a **wage-and-profit tax** (17% cited in one snippet).
  Whether selling software services *priced in* USDC makes the seller a financial institution, or
  merely a normal dealer who happens to be paid in crypto, is **the open question** and it is worth
  professional advice before scaling this line. Not resolvable from snippets.
- **Reporting:** annual reporting obligation cited where crypto holdings exceed **200,000 ILS**;
  holdings on foreign exchanges/wallets to be reported on the asset declaration form.
- **Voluntary disclosure** procedure for unreported crypto income runs **25 Aug 2025 → end Aug 2026**.

## 5. What this means for the colony

1. `products/x402-il-api`'s README says converting USDC to shekels "needs a one-time Israeli exchange
   account with KYC" and that this is only needed to *cash out, never to earn*. The second half is
   **wrong on tax**: receipt of USDC for a service is itself a taxable event. The line is still
   legitimate; the claim in the README is not, and a sibling agent should fix it.
2. The off-ramp is not a blocker to *starting*, but it is a blocker to *scaling quietly*. At small
   sums the friction is a one-time KYC; at 20,000 ILS/month of crypto revenue the bank question,
   the financial-institution VAT question and the reporting question all become live.
3. Nothing in this criterion is a product for us to sell. The only adjacent product with a nameable
   buyer is an Israeli crypto tax-report generator, and its demand evidence here is one third-party
   skills repo plus a disclosure window — thin.

## Searches run (8)
1. Bank of Israel Supervisor of Banks directive banks accepting crypto proceeds deposit 2025 411
2. Israel Tax Authority crypto reporting obligation 2026 digital assets capital gains 25% VAT business income
3. Bits of Gold license Israel Capital Market Authority financial asset service provider convert USDC to shekels bank transfer 2025
4. Coinbase Kraken Israel ILS fiat withdrawal Israeli bank account supported shekel 2026
5. Israeli bank refuses deposit of crypto proceeds 2025 Directive 411 practice tax authority approval transfer shekels
6. Bits of Gold business corporate account sell USDC to shekels fee percentage KYC requirements Israel
7. Kraken supported countries Israel residents accepted USD wire withdrawal to Israeli bank 2026
8. receiving cryptocurrency as payment for services Israel VAT invoice obligation "financial institution" registration business crypto revenue

## GitHub attempts (no search budget, low yield)
- `search_code` for Coinbase offramp country lists — 0 results.
- `search_code` for "Bits of Gold"/bit2c — 5 hits, all third-party skill repos (skills-il/tax-and-finance,
  squadcodercom/squadcoder, RonTuretzky/p2peace-zkemail). Directory-grade only.
- `search_code` for Hebrew regulator terms ("מטבע וירטואלי", "ניהול בנקאי תקין") — 0 results.
- `search_code` for offramp/ILS fiat configs — hits were Uniswap/Meld/Transak plumbing with no
  Israel-specific country data.
