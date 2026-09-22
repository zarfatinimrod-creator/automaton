# Scout notes — payment-rails / telegram-stars
Date of research: 2026-09-03. Scout: WORKER-SCOUT "telegram-stars".
Criterion: Telegram Stars end to end — pricing, the app-store cut, the Fragment withdrawal
path to TON, minimums, hold periods, and converting to shekels.

## Evidence quality warning (read first)
The egress proxy in this container blocks **every** primary source for this criterion:
`core.telegram.org`, `telegram.org`, `fragment.com`, `docs.aiogram.dev`, `gramio.dev`,
`blog.invitemember.com`, `mystars.tg` all returned `EGRESS_BLOCKED`.
The only things I could actually *render* were GitHub raw files and the GitHub code-search API.
Everything else below is a **search snippet** (Claude WebSearch result text quoting the page),
which is weaker evidence and is marked as such. The WebSearch budget for the session was
exhausted (200/200) part-way through, so some questions stayed open on purpose.

Strong evidence (rendered):
- https://raw.githubusercontent.com/grammyjs/types/main/payment.ts — rendered 2026-09-03.
- GitHub code search over `grammyjs/types`, `grammyjs/grammY`, `gramiojs/types`,
  `puregram/puregram` (mirrors of the Bot API doc strings) — returned 2026-09-03.

## 1. The collection rail: Stars in bots and mini apps
- Currency code is `XTR`; `provider_token` is omitted/empty for Stars.
  Rendered: grammyjs/types payment.ts — *"Three-letter ISO 4217 currency code, or \"XTR\"
  for payments in Telegram Stars"*.
- Apple/Google policy forces Stars for digital goods sold inside Telegram clients.
  Snippet (weak), search 2026-09-03 quoting https://core.telegram.org/bots/payments-stars:
  *"Your bot or mini app must use Telegram Stars for the sale of digital goods and services
  inside Telegram."*
- One-off invoices: `createInvoiceLink` / `sendInvoice`, then `answerPreCheckoutQuery`
  (must answer within 10s), then `successful_payment`.
- Refunds: `refundStarPayment` returns Stars to the **user's Star balance**, not to a bank.
  Snippet (weak) quoting https://telegram.org/tos/stars: *"All sales of Telegram Stars are
  final… If a bot or mini app fails to deliver your purchase as advertised… the respective
  third-party developer has the ability to refund your Stars at no penalty."* Bots are also
  expected to answer `/paysupport`.

## 2. Recurring revenue (this is the part that matters for 20k ILS/month)
- Bot/mini-app subscriptions: `createInvoiceLink` with `subscription_period`.
  Rendered doc string (telegram-mcp mirror of Bot API text, GitHub code search 2026-09-03):
  *"The number of seconds the subscription will be active for before the next payment.
  The currency must be set to 'XTR' (Telegram Stars) if the parameter is used. Currently,
  it must always be 2592000 (30 days)."* → **monthly only, no annual, no weekly.**
- Channel paid access: `createChatSubscriptionInviteLink`.
  Rendered doc string (grammyjs/grammY src/core/api.ts): *"subscription_price — The amount
  of Telegram Stars a user must pay initially and after each subsequent subscription period
  to be a member of the chat; 1-2500"* (older mirrors show 1-10000 / 1-25000 — the live
  Bot API page is the authority; a human must open
  https://core.telegram.org/bots/api#createchatsubscriptioninvitelink to pin the current cap).
- Bot must hold `can_invite_users` admin rights in the channel.

## 3. Pricing and the app-store cut
Buyer-side (snippet, weak — search 2026-09-03 quoting https://mystars.tg/blog/telegram-stars-price-in-app-vs-ton
and https://starsearn.com/guides/telegram-stars-price-calculator):
- iOS, April 2026: 100 Stars = $1.99; 1,000 = $14.99; 10,000 = $134.99
  (≈$0.0199/Star falling to ≈$0.0135/Star at the 10k bundle).
- Fragment/desktop/web: 100 ≈ $1, 1,000 ≈ $14, 5,000 ≈ $70 — "roughly 30% less than in-app".
Seller-side (snippet, weak — https://grambase.ai/blog/telegram-stars-guide-2026):
- The developer nets roughly **$0.013 per Star** on withdrawal ("about $13 per 1,000"),
  described as below the ~$0.016 the user paid because of the Fragment market spread.
- The 30% Apple/Google cut is charged when the *user buys Stars*, i.e. it is buyer-side
  economics; the developer's net per Star is set by the Fragment conversion, not by a
  Telegram commission on the bot.
Practical rule for pricing our invoices: assume **1 Star ≈ $0.013 net ≈ 0.045–0.05 ILS**
(USD/ILS was not verified in this run — treat the ILS figure as arithmetic, not evidence),
and assume an iOS buyer pays roughly 1.5x that for the same Star.

## 4. Fragment withdrawal path (Stars → TON)
All of this is **snippet-level** evidence (searches 2026-09-03), because fragment.com is blocked:
- Fragment is the only official route from earned Stars to money; log in with the Telegram
  account, connect a TON wallet, TON arrives "typically within minutes".
- **Minimum 1,000 Stars** available to withdraw.
- **21-day hold per batch**: Stars become withdrawable 21 days after they were earned.
- Stars a user *bought* cannot be converted back — the path is only for Stars *received*.
- KYC: Fragment introduced mandatory Sumsub KYC in Nov-2024 (email, phone, ID scan, selfie).
  Sources disagree on scope: one snippet says *"Every purchase and withdrawal — Premium,
  Stars, usernames, anonymous +888 numbers, creator reward withdrawals — now requires full
  identity disclosure"*, another says *"you do not need KYC to withdraw Stars to TON in a
  self-custody wallet like Tonkeeper — only the exchange step requires verification."*
  **Treat KYC as required until the owner sees his own Fragment profile page.**
  URLs a human must open to close this: https://fragment.com/about and the Fragment profile
  page while logged in.
- Evidence URLs seen: https://x.com/tonradarapp/status/1861319732051234950 ,
  https://www.panewslab.com/en/articles/uwm04yl8 ,
  https://thearabianpost.com/fragment-now-mandates-kyc-for-blockchain-transactions/ ,
  https://www.binance.com/en/square/post/11-26-2024-telegram-auction-platform-enforces-kyc-verification-16756031639618

## 5. Israel: what I could and could not establish
- **Not established: whether an Israeli-resident account can complete Fragment KYC and
  withdraw.** No source I saw lists Israel as blocked on Fragment, and no source lists it
  as supported either.
- Telegram *custodial* Wallet (@wallet) restricted-jurisdiction lists quoted in snippets
  (https://wallet.tg/docs/ton-wallet/terms , https://help.wallet.tg/article/240-restricted-access)
  name Cuba, Iran, DPRK, Syria, occupied Ukrainian regions, plus the UK/EEA for the crypto
  wallet — **Israel is not on those lists**. Fragment withdrawal to a *self-custody* wallet
  (Tonkeeper) sidesteps @wallet entirely, which is the safer design.
- One snippet claimed *"Telegram's monetization program operates in countries other than
  Russia, Ukraine, Palestine, Germany, and Israel"* (search 2026-09-03, traced to
  https://kun.uz/en/news/2024/04/08/telegrams-monetization-under-legal-review-before-launch-in-uzbekistan ,
  an April-2024 article about the **channel ad-revenue-sharing** programme, not Stars).
  I could not confirm it and it is about a different programme, but it is the single most
  dangerous open item on this criterion and must be closed before any spend.
- **ILS conversion is the solved half.** Israel has licensed rails: Bits of Gold holds a
  Capital Markets Authority licence (2022) and sells/buys crypto for shekels by bank transfer
  (https://www.bitsofgold.co.il/en , snippet 2026-09-03); in April 2026 the CMA approved
  BILS, a 1:1 shekel-backed stablecoin issued by Bits of Gold on Solana
  (https://www.coindesk.com/policy/2026/04/28/a-digital-shekel-is-here-israel-approves-its-first-regulated-stablecoin ,
  https://cryptobriefing.com/israel-shekel-backed-stablecoin-approval/ , snippets 2026-09-03).
  **Unverified:** whether Bits of Gold lists TON. If not, the chain is
  TON → (offshore exchange) → USDT/BTC → Bits of Gold → bank, which adds a hop and a
  counterparty. URL to open: https://www.bitsofgold.co.il/en (coin list).
- Tax: the Israel Tax Authority treats crypto as property; capital-gains rates for
  investment, but income from a business activity is ordinary business income
  (https://www.bitget.com/academy/israel-crypto-tax-guide-2025 ,
  https://taxnatives.com/blog/israel-crypto-tax-update/ , snippets 2026-09-03).
  Bot revenue is business income — this needs the owner's accountant, not an agent.

## 6. Chargeback exposure (rendered, strong)
grammyjs/types payment.ts, `StarTransaction`:
*"Note that if the buyer initiates a chargeback with the payment provider from whom they
acquired Stars (e.g., Apple, Google) following this transaction, the refunded Stars will be
deducted from the bot's balance. This is outside of Telegram's control."*
So the bot balance can go negative-ward after delivery, with no recourse. Budget ~2-5%
(figure is a guess, not evidence) and never treat pre-withdrawal Stars as banked revenue.

## 7. Already shipped in this repo
`/home/user/automaton/products/telegram-il-tools-bot` already implements the Stars rail
(XTR one-off invoices, pro pass + credit packs, payments.jsonl ledger). Its README already
states the 1,000-Star minimum and 21-day hold. The missing pieces are (a) recurring
`subscription_period` invoices and (b) a verified off-ramp.

## Dead ends
- All primary sources blocked by the egress proxy (list at the top). Do not re-attempt from
  this container; hand the URLs to a human or an unblocked agent.
- No evidence anywhere that Stars can be paid out to a bank card or PayPal directly.
  Fragment→TON is the only documented exit.
- Stars bought by a user cannot be converted back to money — no arbitrage there, and
  attempting to build one would be a ToS problem anyway.
- Fragment "no-KYC" claims come from affiliate-style blogs; not usable as evidence.
