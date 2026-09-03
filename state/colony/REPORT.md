# Revenue colony — board report

Generated 2026-09-03T14:01:25.613Z

## Where we are

| | |
|---|---|
| 30-day revenue | **₪0.00** |
| Target | ₪20,000.00 (0.0%) |
| Stretch target | ₪50,000.00 |
| Run-rate from last 7 days | ₪0.00/month |
| Costs (30d) | ₪0.00 |
| Net (30d) | ₪0.00 |

### What the plan rests on

| | |
|---|---|
| Line targets, summed | ₪16,500 against a ₪20,000 goal |
| Of that, **measured** | ₪6,500 |
| Inferred | ₪1,500 |
| **Resting on nothing yet** | ₪8,500 |

Unevidenced targets: `templates`, `telegram-bots`, `dev-extensions`, `oss-bounties`. These are research tasks that have not been done, not forecasts. Until a sweep measures them, the honest reachable figure is the measured ₪6,500, not the ₪16,500 total.

## Revenue lines

| Line | Tier | Status | 30d | Target | Last supervisor call |
|---|---|---|---|---|---|
| `apify-actors` | core | awaiting_setup | ₪0.00 | ₪3,000.00 | escalate |
| `il-biz-tools` | core | awaiting_setup | ₪0.00 | ₪5,000.00 | escalate |
| `templates` | growth | awaiting_setup | ₪0.00 | ₪3,000.00 | escalate |
| `paid-apis` | growth | awaiting_setup | ₪0.00 | ₪1,200.00 | escalate |
| `agent-services` | experimental | proposed | ₪0.00 | ₪800.00 | hold |
| `telegram-bots` | experimental | awaiting_setup | ₪0.00 | ₪1,500.00 | escalate |
| `dev-extensions` | experimental | awaiting_setup | ₪0.00 | ₪2,500.00 | escalate |
| `hebrew-content` | experimental | awaiting_setup | ₪0.00 | ₪1,500.00 | escalate |
| `oss-bounties` | experimental | awaiting_setup | ₪0.00 | ₪1,500.00 | escalate |

## This tick

Ran: revenue_ledger_sync, revenue_supervisor_review, revenue_board_review, revenue_audit

- Ledger sync: 0 new entries, 0 already known, sources [none configured]
- Supervisors reviewed 9 line(s), escalating 8
- Audit sampled 27 review(s), flagged 0

### Board decisions

- **apify-actors → ESCALATE** — blocked on one-time human setup: Create an Apify account in your name and complete Apify KYC (government ID, proof of address, tax document, beneficial-ownership info). This one step gates ALL THREE of: receiving any payout, setting a price on an Actor, and x402/agentic eligibility. Publishing free Actors is the only thing possible before it.; Open a PayPal account in your name (PayPal Israel) and link it as the Apify payout method (minimum payout $20 for PayPal and Wise, $100 for other methods); Register as osek patur (self-service online form) before the first payout
- **il-biz-tools → ESCALATE** — blocked on one-time human setup: Open a merchant-of-record seller account (Paddle; Lemon Squeezy as fallback) in your name and complete identity/tax verification; Add an Israeli bank account (IBAN/SWIFT) or PayPal for payouts; Register as osek patur (self-service online form) before the first payout
- **templates → ESCALATE** — blocked on one-time human setup: Open an Etsy shop in your name (ID verification) and enrol in Etsy Payments with a Payoneer account (KYC) linked to your Israeli bank
- **paid-apis → ESCALATE** — blocked on one-time human setup: Create the API marketplace provider account in your name and add a PayPal payout method (x402 needs nothing; converting USDC to ILS later needs a one-time Israeli exchange account with KYC)
- **telegram-bots → ESCALATE** — blocked on one-time human setup: Create the bot in Telegram with @BotFather from your own Telegram account (2 minutes) and hand over the bot token as TELEGRAM_BOT_TOKEN; no KYC, but a bot must belong to a Telegram user
- **dev-extensions → ESCALATE** — blocked on one-time human setup: Pay the one-time Chrome Web Store developer fee ($5) with a Google account that has 2-step verification; create a Microsoft/Azure DevOps publisher for VS Code (free); reuse the merchant-of-record account from il-biz-tools for license keys
- **hebrew-content → ESCALATE** — blocked on one-time human setup: Open the affiliate program accounts in your name (they require a tax form and a PayPal or Payoneer payout) and provide the affiliate IDs
- **oss-bounties → ESCALATE** — blocked on one-time human setup: Connect your GitHub account to a bounty platform and complete its payout onboarding (verify it pays to Israel before enabling this line)

### Actions taken

- waiting on creator for apify-actors: Create an Apify account in your name and complete Apify KYC (government ID, proof of address, tax document, beneficial-ownership info). This one step gates ALL THREE of: receiving any payout, setting a price on an Actor, and x402/agentic eligibility. Publishing free Actors is the only thing possible before it.; Open a PayPal account in your name (PayPal Israel) and link it as the Apify payout method (minimum payout $20 for PayPal and Wise, $100 for other methods); Register as osek patur (self-service online form) before the first payout
- waiting on creator for il-biz-tools: Open a merchant-of-record seller account (Paddle; Lemon Squeezy as fallback) in your name and complete identity/tax verification; Add an Israeli bank account (IBAN/SWIFT) or PayPal for payouts; Register as osek patur (self-service online form) before the first payout
- waiting on creator for templates: Open an Etsy shop in your name (ID verification) and enrol in Etsy Payments with a Payoneer account (KYC) linked to your Israeli bank
- waiting on creator for paid-apis: Create the API marketplace provider account in your name and add a PayPal payout method (x402 needs nothing; converting USDC to ILS later needs a one-time Israeli exchange account with KYC)
- waiting on creator for telegram-bots: Create the bot in Telegram with @BotFather from your own Telegram account (2 minutes) and hand over the bot token as TELEGRAM_BOT_TOKEN; no KYC, but a bot must belong to a Telegram user
- waiting on creator for dev-extensions: Pay the one-time Chrome Web Store developer fee ($5) with a Google account that has 2-step verification; create a Microsoft/Azure DevOps publisher for VS Code (free); reuse the merchant-of-record account from il-biz-tools for license keys
- waiting on creator for hebrew-content: Open the affiliate program accounts in your name (they require a tax form and a PayPal or Payoneer payout) and provide the affiliate IDs
- waiting on creator for oss-bounties: Connect your GitHub account to a bounty platform and complete its payout onboarding (verify it pays to Israel before enabling this line)
- goal filing disabled for this review (no executor attached)

Goal queue: agent-services:build

## Blocked on

- apify-actors is waiting on the owner: Create an Apify account in your name and complete Apify KYC (government ID, proof of address, tax document, beneficial-ownership info). This one step gates ALL THREE of: receiving any payout, setting a price on an Actor, and x402/agentic eligibility. Publishing free Actors is the only thing possible before it.; Open a PayPal account in your name (PayPal Israel) and link it as the Apify payout method (minimum payout $20 for PayPal and Wise, $100 for other methods); Register as osek patur (self-service online form) before the first payout
- il-biz-tools is waiting on the owner: Open a merchant-of-record seller account (Paddle; Lemon Squeezy as fallback) in your name and complete identity/tax verification; Add an Israeli bank account (IBAN/SWIFT) or PayPal for payouts; Register as osek patur (self-service online form) before the first payout
- templates is waiting on the owner: Open an Etsy shop in your name (ID verification) and enrol in Etsy Payments with a Payoneer account (KYC) linked to your Israeli bank
- paid-apis is waiting on the owner: Create the API marketplace provider account in your name and add a PayPal payout method (x402 needs nothing; converting USDC to ILS later needs a one-time Israeli exchange account with KYC)
- telegram-bots is waiting on the owner: Create the bot in Telegram with @BotFather from your own Telegram account (2 minutes) and hand over the bot token as TELEGRAM_BOT_TOKEN; no KYC, but a bot must belong to a Telegram user
- dev-extensions is waiting on the owner: Pay the one-time Chrome Web Store developer fee ($5) with a Google account that has 2-step verification; create a Microsoft/Azure DevOps publisher for VS Code (free); reuse the merchant-of-record account from il-biz-tools for license keys
- hebrew-content is waiting on the owner: Open the affiliate program accounts in your name (they require a tax form and a PayPal or Payoneer payout) and provide the affiliate IDs
- oss-bounties is waiting on the owner: Connect your GitHub account to a bounty platform and complete its payout onboarding (verify it pays to Israel before enabling this line)

## What the owner has to do (one time, per line)

**Apify pay-per-event Actors (Israeli data sources + long-tail scrapers)** (`apify-actors`)
- [ ] Create an Apify account in your name and complete Apify KYC (government ID, proof of address, tax document, beneficial-ownership info). This one step gates ALL THREE of: receiving any payout, setting a price on an Actor, and x402/agentic eligibility. Publishing free Actors is the only thing possible before it.
- [ ] Open a PayPal account in your name (PayPal Israel) and link it as the Apify payout method (minimum payout $20 for PayPal and Wise, $100 for other methods)
- [ ] Register as osek patur (self-service online form) before the first payout

**Hebrew small-business web tools (invoices, receipts, VAT, net salary)** (`il-biz-tools`)
- [ ] Open a merchant-of-record seller account (Paddle; Lemon Squeezy as fallback) in your name and complete identity/tax verification
- [ ] Add an Israeli bank account (IBAN/SWIFT) or PayPal for payouts
- [ ] Register as osek patur (self-service online form) before the first payout

**Spreadsheet and Notion business templates (Hebrew + English) on Etsy and an own store** (`templates`)
- [ ] Open an Etsy shop in your name (ID verification) and enrol in Etsy Payments with a Payoneer account (KYC) linked to your Israeli bank

**Paid developer APIs (Hebrew NLP, RTL PDF, Israeli validators) over x402 and an API marketplace** (`paid-apis`)
- [ ] Create the API marketplace provider account in your name and add a PayPal payout method (x402 needs nothing; converting USDC to ILS later needs a one-time Israeli exchange account with KYC)

**Telegram bots paid with Stars (Hebrew utility bots + file/format tools)** (`telegram-bots`)
- [ ] Create the bot in Telegram with @BotFather from your own Telegram account (2 minutes) and hand over the bot token as TELEGRAM_BOT_TOKEN; no KYC, but a bot must belong to a Telegram user

**Browser and editor extensions with a paid pro tier (license keys)** (`dev-extensions`)
- [ ] Pay the one-time Chrome Web Store developer fee ($5) with a Google account that has 2-step verification; create a Microsoft/Azure DevOps publisher for VS Code (free); reuse the merchant-of-record account from il-biz-tools for license keys

**Hebrew evergreen guides and calculators with affiliate and ad revenue** (`hebrew-content`)
- [ ] Open the affiliate program accounts in your name (they require a tax form and a PayPal or Payoneer payout) and provide the affiliate IDs

**Open-source bounties** (`oss-bounties`)
- [ ] Connect your GitHub account to a bounty platform and complete its payout onboarding (verify it pays to Israel before enabling this line)

When a line's steps are done, confirm it so the colony can start building:

```bash
pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "done on <date>"
```

---

Money here is only what reached the ledger with a platform transaction id. Projections are never counted.
