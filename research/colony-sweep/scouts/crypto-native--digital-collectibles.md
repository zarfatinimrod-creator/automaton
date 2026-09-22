# Scout notes — crypto-native / digital-collectibles

**Criterion:** NFTs and digital collectibles in 2026: market reality, and whether anything here is honest value rather than hype.
**Date of research:** 2026-09-03
**Search budget:** 7 of 8 allowed WebSearch calls used. 2 WebFetch (GitHub only) + 1 GitHub code search (no search budget).

## Evidence ledger

| # | Source | How obtained | Strength |
|---|---|---|---|
| E1 | https://dappradar.com/blog/nft-arts-shocking-collapse-from-2-9-billion-boom-to-23-8-million-bust-what-went-wrong | search snippet only (page not rendered) | weak — snippet quoting DappRadar |
| E2 | https://decrypt.co/301053/nft-market-hits-three-year-low-in-trading-and-sales-report | search snippet only | weak |
| E3 | https://decrypt.co/328668/cheaper-nfts-mean-sales-are-surging-but-trading-volume-is-plummeting-dappradar | search snippet only | weak |
| E4 | https://cryptobriefing.com/poap-shuts-down-five-years/ | search snippet only | weak |
| E5 | https://www.nftculture.com/nft-news/poap-is-winding-down-after-five-years-of-turning-moments-into-onchain-memories/ | search snippet only | weak |
| E6 | https://getgems.io/top-gifts | listed in search results; NOT rendered | weak |
| E7 | https://telegram.org/blog/wear-gifts-blockchain-and-more | listed in search results; NOT rendered | weak |
| E8 | https://ton-adoption.xyz/en/blog/telegram-gifts-2026-how-the-market-works/ | search snippet only | weak |
| E9 | https://www.theblock.co/post/354274/ton-based-nft-marketplace-mrkt-telegram-mini-app | search result title only | weak |
| E10 | https://dappradar.com/nft-collection/courtyard + https://www.cryptoslam.io/courtyard | search results; NOT rendered | weak |
| E11 | https://blockchainreporter.net/top-10-nft-performers-by-weekly-sales-volume-courtyard-outshines/ | search snippet | weak |
| E12 | https://decrypt.co/152878/opensea-make-creator-royalties-optional-nft-trades | search snippet | weak |
| E13 | https://www.theblock.co/post/246095/opensea-disables-royalty-enforcement-tool-makes-creator-fees-optional | search snippet | weak |
| E14 | https://www.crowe.com/il/insights/taxation-of-cryptocurrencies | search snippet only | weak |
| E15 | https://www.step.org/industry-news/israel-proposes-new-digital-assets-tax-regime | search result title only | weak |
| E16 | GitHub code search across python-telegram-bot, aiogram, pyTelegramBotAPI, kurigram/pyrogram forks | **rendered code, primary-ish** (libraries mirror the official Bot API/MTProto surface) | strong-ish |
| E17 | https://raw.githubusercontent.com/bleach-hub/portalsmp/main/README.md | **rendered via WebFetch** | strong |
| E18 | https://github.com/kloveren/morgan-gift-plugins | **rendered via WebFetch** | strong |

### E16 detail — what the official APIs actually expose for gifts
GitHub code search (`getAvailableGifts sendGift language:python`, 365 hits) shows, in first-party-tracking
libraries:
- Bot API (python-telegram-bot `src/telegram/ext/_extbot.py`, pyTelegramBotAPI `telebot/apihelper.py`,
  aiogram `aiogram/methods/__init__.py`): `getAvailableGifts`, `sendGift`, `GetBusinessAccountGifts`,
  `giftPremiumSubscription`, `convertGiftToStars`, `upgradeGift`, `transferGift`.
- MTProto client layer (kurigram `pyrogram/methods/payments/__init__.py`): `SearchGiftsForResale`,
  `SendGiftPurchaseOffer`, `SendGift`, `SellGift`, `GetUpgradedGift`, `GetChatGifts`, `ToggleGiftIsSaved`.
So: a bot can read the gift catalogue and send/upgrade/transfer gifts through the official Bot API.
Resale-market search exists only at the MTProto/user-account layer, not the Bot API.

### E17 detail — Portals marketplace access is unofficial
portalsmp README (rendered): every request needs `authData` obtained either by **extracting the
authorization header from web.telegram.org** (valid 1-7 days) or by programmatic auth with a user
account's `api_id`/`api_hash`. Functions include `search`, `giftsFloors`, `collections`,
`marketActivity`, `buy`, `sale`, `bulkList`, `makeOffer`, `withdrawPortals`. The README documents **no
rate limits, no pricing, and no published terms** — i.e. this is a reverse-engineered private API driven
by a hijacked user session, not a sanctioned developer API.

### E18 detail — the tooling niche is already occupied
morgan-gift-plugins (rendered): agent plugins doing cross-market analytics over GetGems, MarketApp,
Fragment, Portals, Tonnel, MRKT; price comparison and arbitrage detection; whale tracking; chart
generation; and direct buy/list execution signing from the agent's own TON wallet. Data sources named:
Giftstat, GetGems GraphQL, MarketApp REST, DYOR.io, GeckoTerminal. This is open source and free.

## Market reality (2026)

- Aggregate NFT trading volume: $57.2B (2022) → $13.7B (2024) → ~$1.6B/quarter through late 2025;
  Oct 2025 at $546M/month (+30% MoM). Snippet-only (E2, E3). **Must be confirmed by opening
  https://dappradar.com/reports.**
- Art NFTs: volume -93% from the 2021 peak ($2.9B → $197M in 2024 → $23.8M in Q1 2025); traders
  529,101 (2022) → 19,575 (Q1 2025), -96%. Snippet-only (E1).
- POAP — the flagship "utility NFT" — entered maintenance mode 2026-03-16 and announced full wind-down
  2026-08-03, after ~7.6M collectibles from 46,000+ issuers, customers including Coinbase, American
  Express, Warner Music and Bayer, and $10M raised in 2022. Cause given: no sustainable monetisation.
  Snippet-only (E4, E5). **Open https://cryptobriefing.com/poap-shuts-down-five-years/ to confirm.**
- Creator royalties are optional, not enforced, since OpenSea disabled its enforcement filter (E12, E13).
  A "mint and earn royalties" line has no enforceable revenue mechanism.
- The two segments that still show real weekly money are (a) **physically-backed RWA collectibles** —
  Courtyard reported top-of-chart weekly volumes around $7.4M-$8.7M on Polygon in Apr/May 2026, backed by
  graded cards in a Brink's vault (E10, E11); and (b) **Telegram Gifts on TON** — reported ~$292M
  cumulative in the first 11 months to Feb 2026 per Getgems analytics, ~$128M market cap Nov 2025
  (E6, E8). Both figures are snippet-only and the second is explicitly flagged in the same snippet as
  possibly inflated by mini-app internal-balance accounting.

## Israel payability

NFT/collectible proceeds land in a self-custody wallet — there is no platform fiat payout gate to fail,
so payability is structurally YES for the *receiving* step. The friction is downstream and real:
- Israeli CGT on crypto disposals is 25% with no holding-period discount; frequent/systematic activity is
  reclassified as business income at marginal rates 10-50% (E14, snippet only).
- A new digital-assets tax regime has been proposed (E15, title only — **open https://www.step.org/industry-news/israel-proposes-new-digital-assets-tax-regime**).
- Israeli banks routinely refuse deposits of crypto proceeds without a full source-of-funds trail; the same
  snippet mentions Form 909 for paying tax directly to the ITA when the bank refuses. Weak evidence,
  needs a rendered source.
Net: **YES for receiving, UNKNOWN-with-friction for converting to shekels in a bank account.** For our
purposes the Telegram Stars route is the exception: the owner already operates
`products/telegram-il-tools-bot` on Stars, so a Stars-priced product inherits a rail already proven here.

## Dead ends (say so plainly)

1. **Minting and selling our own NFT art/collection.** Art volume -93%, traders -96%, royalties
   unenforceable. Also fails the constitution test: selling a speculative token to a buyer whose only
   plausible thesis is resale is not honest value.
2. **NFT ticketing / proof-of-attendance / "utility NFTs".** POAP had the brand, the enterprise logos,
   7.6M mints and $10M and still could not monetise. A no-brand entrant will not.
3. **Royalty-collection or royalty-analytics SaaS for NFT creators.** The underlying cash flow was made
   optional in 2023; there is little left to collect or analyse.
4. **Physically-backed collectibles (the one growing segment).** Requires vaulting, grading, insurance
   and shipping — Courtyard uses Brink's. Not shippable by a software-only, owner-does-nothing operation.
5. **Automated gift trading / sniping bots (Portals, Tonnel).** Technically easy and there is money in the
   market, but it depends on reverse-engineered private APIs driven by an extracted user session (E17),
   which is the classic ToS-violation shape, and it is a zero-sum speculation product. RED under our
   constitution.
6. **NFT storage/metadata infrastructure (IPFS pinning, metadata APIs).** Not searched — search budget
   exhausted at 7 calls. No claim made either way; flagged for a later scout.
