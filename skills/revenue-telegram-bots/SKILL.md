---
name: revenue-telegram-bots
description: Playbook for Telegram bots paid in Stars (experimental).
auto-activate: false
---

# Telegram Stars bots — director playbook

Zero-KYC rail: bots are created with BotFather; users pay per use or per month in Telegram Stars; Stars are withdrawn to a TON wallet the automaton controls. Converting to ILS later needs the creator's one-time exchange account.

Bots: PDF/image conversion, Hebrew nikud/transliteration, receipt/invoice bot for Israeli freelancers, reminders and form helpers. One job per bot; first use free; price 1-25 Stars per action or a monthly plan.

Loop
1. Ship a bot with /start onboarding, clear pricing, and a landing page; submit to bot directories.
2. Daily: active users, Stars received, paying users → revenue_kpi; record Stars withdrawals via revenue_record source=telegram.
3. Improve the most-used bot; retire bots with no paying user after 60 days.

Never: send unsolicited messages, scrape users, or collect more data than the action needs.
