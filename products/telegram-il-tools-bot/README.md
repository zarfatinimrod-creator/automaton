# telegram-il-tools-bot

A Hebrew utility bot for Telegram, paid with **Telegram Stars** (currency `XTR`). Sells small, honest checks Israelis need every day: ID checksum validation, phone number validation and E.164 normalisation, Hebrew ↔ Gregorian date conversion. Three free uses per day, then a 30-day pro pass or a pack of credits.

Revenue line: `telegram-bots` in the automaton's revenue colony. Payments are appended to `payments.jsonl` with the tag `[line:telegram-bots]` so the ledger can import them.

## What the owner does once (no KYC)
1. Open Telegram, talk to **@BotFather**, `/newbot`, choose a name and username, copy the token.
2. Provide the token as `TELEGRAM_BOT_TOKEN` to the automaton (env var).
3. That's it. Stars payments need no provider account. Withdrawal facts (2026): Stars earned by a bot can be withdrawn to TON via Fragment only, minimum 1,000 Stars, 21 days after they were earned; purchases made on iOS/Android lose ~30% to the app stores, so the pro pass is priced for that.

## Run
```bash
npm install
npm test
npm run build
TELEGRAM_BOT_TOKEN=123:abc node dist/index.js
```
Env (all optional except the token): `FREE_DAILY` (3), `PRO_STARS` (50), `PRO_DAYS` (30), `CREDITS_STARS` (10), `CREDITS_COUNT` (20), `STATE_FILE` (./state.json), `PAYMENTS_LOG` (./payments.jsonl).

Deploy anywhere Node 20+ runs (Conway sandbox, Fly, Railway, a VPS). Long polling; no public URL needed.

## Commands
`/id`, `/phone`, `/hebdate`, `/gregdate`, `/pro`, `/credits`, `/status`, `/help`.

## Honesty notes
The bot validates formats and checksums only; it never verifies identity against any registry, and it stores only per-user counters. No marketing messages are sent.

## עברית
בוט טלגרם לכלים ישראליים (תעודת זהות, טלפון, תאריך עברי) בתשלום בכוכבי טלגרם. הבעלים יוצר את הבוט פעם אחת ב-BotFather ומוסר את הטוקן; אין צורך בשום חשבון תשלום. משיכת הכוכבים ל-TON דרך Fragment (מינימום 1,000 כוכבים, 21 יום החזקה).
