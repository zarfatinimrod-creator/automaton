# Scout notes — payment-rails / payoneer-wise
Scout: WORKER-SCOUT "payoneer-wise", group "payment-rails"
Date of research: 2026-09-03
Criterion: Payoneer and Wise for receiving marketplace payouts in Israel: account
requirements, fees, currency conversion, and which marketplaces pay through them.

## Evidence strength note
The egress proxy blocked every host I tried to render (wise.com returned
EGRESS_BLOCKED; only github.com is fetchable). **Every claim below rests on
WebSearch result snippets, not on a rendered page.** Snippets that quote an
official help-centre page are the strongest evidence I could obtain and are
marked [snippet-of-official]. Third-party blogs are marked [snippet-of-blog] and
should be treated as weak. Nothing here comes from memory.

## URLs seen in results (to be opened by a human or an unblocked agent)
Payoneer official:
- https://www.payoneer.com/about/pricing/  (fee table — MUST be opened to confirm fees)
- https://payoneer.custhelp.com/app/answers/detail/a_id/44310/~/faq---annual-fees
- https://payoneer.custhelp.com/app/answers/detail/a_id/18786/~/receiving-accounts---faq
- https://payoneer.custhelp.com/app/answers/detail/a_id/27626/~/manage-currencies-faq
- https://payoneer.custhelp.com/app/answers/detail/a_id/44966/ (connect account to a partner marketplace)
- https://www.payoneer.com/receive-marketplace-payouts/
- https://www.payoneer.com/marketplace/get-paid-by-marketplaces/
- https://www.payoneer.com/receiving-accounts/
- https://www.payoneer.com/get-paid-by-fiverr/
- https://www.payoneer.com/resources/how-open-a-payoneer-account-how-much-does-it-cost/
- https://www.payoneer.com/developers/ , https://www.payoneer.com/developers-docs/mass-payout/
- https://developer.payoneer.com/docs/white-label-registration-payouts.html
Wise official:
- https://wise.com/help/articles/2813542/where-do-i-need-to-live-to-hold-money-with-wise  (KEY: Israel-registered businesses cannot hold money)
- https://wise.com/help/articles/6NpTb4T6tqnDiY1hA2icDI/getting-verified-in-israel  (BLOCKED for me)
- https://wise.com/il/receive-money
- https://wise.com/help/articles/2571907/what-currencies-can-i-send-to-and-from
- https://wise.com/help/articles/2968914/how-do-i-receive-money-from-amazon-with-wise
- https://wise.com/help/articles/2977935/how-do-i-receive-money-from-stripe-with-wise
- https://x.com/Wise/status/1651869597551964160 (Wise: business transactions in a personal account are against the Terms of Use)
- https://wise.com/gb/blog/payoneer-israel (Wise's own blog on Payoneer in Israel — competitor-written, weak)
- https://wise.com/il/blog/payoneer-guide-israel (Hebrew)
Platform payout docs:
- https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid  (wire or Payoneer)
- https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts
- https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle
- https://help.apify.com/en/articles/10057167-how-developer-payouts-work (bank transfer or PayPal; KYC required)
- https://docs.apify.com/legal/store-publishing-terms-and-conditions
- https://help.gumroad.com/article/152-can-i-use-gumroad-in-my-country
- https://gumroad.com/help/article/13-getting-paid  (bank deposit or PayPal; no Payoneer/Wise)
- https://help.fiverr.com/hc/en-us/articles/14257019400465-Setting-up-Payoneer-as-a-payout-method
- https://help.fiverr.com/hc/en-us/articles/360010530058-Withdrawing-your-earnings-managing-payout-methods
- https://support.upwork.com/hc/en-us/articles/211063988-How-to-use-Payoneer-to-withdraw-your-earnings
- https://support.upwork.com/hc/en-us/articles/211064008-How-quickly-Payoneer-pays-and-what-fees-apply

## What I established

### 1. Payoneer works for an Israeli operator; Wise Business does not
[snippet-of-official, wise.com/help/articles/2813542] Businesses registered in
Bahrain, **Israel** and Malaysia cannot hold money in a Wise Business account —
in those countries you can only hold money in a personal account.
[snippet-of-official, Wise on X] Wise's Terms of Use forbid business transactions
in a personal account; freelancers are told to open a Business account.
Those two together mean Wise is a **dead end as the receiving rail for an Israeli
osek/company**: the account type that is allowed to hold money is the one that is
not allowed to receive business income. Wise remains usable for *sending* to
Israel and (per a separate snippet) for holding/converting ILS in a personal
account, but not, on our reading, for our business income. This is the single
most valuable thing this scout found and it must be confirmed by opening
wise.com/help/articles/2813542 plus the Wise Business terms.

Payoneer, by contrast, is available in Israel (Payoneer is an Israeli-founded
company with an Israeli operation): withdrawal to a local Israeli bank account is
described in Payoneer's own community and in the Hebrew guide; minimum withdrawal
cited as $50 [snippet-of-blog/community — weak].

### 2. Payoneer account requirements
[snippet-of-official, payoneer.com/resources/how-open-a-payoneer-account...]
- Individual account: passport or national ID, address, description of activity.
- Company account: certificate of incorporation / registration documents, ID of
  the authorised person, UBO/director documents, bank account.
- Verification 1-3 business days, up to 5-7 if extra documents are requested.
This is a one-time human KYC step — a legitimate ownerBlocker under MISSION.md.

### 3. Payoneer fees (all [snippet], the pricing page itself was not renderable)
- Annual account fee **$29.95**, waived if the account received >= $2,000 in the
  previous rolling 12 months. [snippet-of-official custhelp a_id/44310]
- Marketplace receiving fee: ~1% on payouts from platforms such as Upwork/Fiverr
  [snippet-of-blog — weak, verify].
- Credit-card payment request: ~3% (Israel-origin card payments quoted "up to
  3.99%") [snippet-of-blog — weak].
- Withdrawal to bank, same currency: **$1.50** flat (some sources say $4 under
  $400) [snippet-of-blog].
- Currency conversion: **0.5% above mid-market** when converting between own
  Payoneer balances [snippet-of-official "Manage Currencies FAQ"]; withdrawing to
  a bank in a *different* currency can carry up to ~2% (headline maximum quoted
  as 3.5%) [snippet-of-blog].
- **Payoneer cannot hold an ILS balance.** Receiving-account currencies quoted:
  USD, EUR, GBP, CAD, AUD, JPY, CNH (a longer list including SGD, HKD, AED, MXN,
  BRL, KRW, IDR appears on the receiving-accounts page). ILS is not among them.
  So every shekel we ever see has crossed one USD→ILS conversion.

Cost model for our target: at 20,000 ILS/month (~$5,400) received in USD and
withdrawn to an Israeli bank in ILS, the conversion spread (0.5%-2%) is roughly
$27-$108/month, plus $1.50-$4 per withdrawal, plus any 1% marketplace receiving
fee. Annual fee is waived at our volume. Call it 1-3% of gross.

### 4. Which marketplaces pay through Payoneer / Wise
Pay through **Payoneer** (official or near-official snippets): Upwork, Fiverr,
Amazon, eBay, Airbnb, Etsy, AliExpress, Walmart, Wayfair, Shopify; Payoneer
claims 2,000+ connected platforms. **Paddle pays sellers by wire transfer or
Payoneer** — this directly covers our shipped products/il-biz-tools Pro tier.
Accept **Wise account details** as a bank destination (not as a named payout
method): Amazon (local currency accounts only — USD details for Amazon US, EUR
IBAN for Amazon EU), Stripe (CAD, CHF, DKK, HKD, HUF, JPY, NOK, NZD, PLN, RON,
SEK, SGD, USD, ZAR). Google AdSense + Wise: unresolved, only forum threads found.
**Do NOT pay through either**: Gumroad (bank deposit or PayPal only — explicitly
no Payoneer/Wise/cheque/wire), Apify (bank transfer or PayPal, min $20 PayPal /
$100 other, KYC required).

### 5. Automation surface
Payoneer has a public developer platform (Payment/Mass Payout API, webhooks for
payout status, sandbox, white-label registration+payouts). That is a payer-side
API for platforms disbursing to many payees — it is *not* a way to automate our
own receiving account, and it does not remove the human KYC step. It is, however,
the thing that makes "payouts as a service" products buildable later.

## Dead ends
- Wise as our receiving rail (see 1) — a genuine NO, first-class finding.
- Holding ILS at Payoneer — not offered.
- Automating the account opening — impossible by design; KYC is a human step.
- Gumroad / Apify via Payoneer or Wise — not supported by those platforms.
