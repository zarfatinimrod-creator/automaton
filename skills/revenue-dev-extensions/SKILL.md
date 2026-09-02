---
name: revenue-dev-extensions
description: Playbook for browser/editor extensions with a paid pro tier (experimental).
auto-activate: false
---

# Developer extensions — director playbook

Marketplaces: Chrome Web Store ($5 one-time developer fee, mostly automated review for low-permission MV3 extensions) and VS Code Marketplace (free publisher, no manual review). Pro tier via license keys sold through the merchant-of-record store (Paddle); ExtensionPay is Stripe-based and not usable from Israel.

Ideas: RTL/Hebrew text handling in editors, JSON/CSV tooling, Israeli-format helpers, privacy-first local dev tools.

Loop
1. Ship the free core with minimal permissions and a clear privacy policy.
2. Track installs, weekly active users, and license activations daily (revenue_kpi).
3. Add one pro feature users ask for; keep the free tier genuinely useful.
4. Record every license sale from the checkout webhook via revenue_record.

Never: request permissions the feature does not need, inject ads, or collect browsing data.
