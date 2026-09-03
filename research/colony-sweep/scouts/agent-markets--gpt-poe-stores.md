# Scout notes — agent-markets / gpt-poe-stores
Date: 2026-09-03. Scout: WORKER-SCOUT "gpt-poe-stores".
Criterion: OpenAI GPT Store, Poe creator monetization, and similar AI app stores — payout status, eligible countries (Israel specifically), amounts creators report, eligibility rules.

## Budget and method
- Web searches spent: 7 of the 8 allowed.
- Egress: help.poe.com, poe.com, creator.poe.com, community.openai.com, developers.openai.com, learn.microsoft.com are ALL EGRESS_BLOCKED. Zero of the platforms' own pages could be rendered directly.
- Best primary-grade evidence came from GitHub, as instructed: a public mirror of Poe's help centre.

## Evidence log

### E1 — Poe Creator Monetization eligible countries (STRONG: rendered document)
URL rendered: https://raw.githubusercontent.com/jamalmazrui/AppHelpGuides/main/Poe.htm
(a scraped copy of Poe's Help Center, found via GitHub code search for "Poe" + "creator monetization")
Quoted country list, verbatim from the document:
  Argentina, Australia, Belgium, Canada, Colombia, Denmark, Finland, Germany, Hong Kong, India,
  Ireland, Italy, Japan, Mexico, Netherlands, Norway, Portugal, Singapore, Spain, Sweden,
  Switzerland, United Kingdom, United States.
**Israel does not appear anywhere in the document.** (23 entries = the "23 countries" figure in search snippets.)
Other facts from the same document: payout threshold $10+; paid via Stripe; payments 30–45 days after month end; taxpayer info required within 90 days of joining; US creators get 1099-MISC (price-per-message, $10+) or 1099-NEC (subscriptions, $600+); non-US get 1042-S; two models — price per message, and earn-per-subscription.
CAVEAT: this is a third-party mirror, not poe.com itself. It matches independent search snippets of help.poe.com. To close: open https://help.poe.com/hc/en-us/articles/21921312368020-Poe-Creator-Monetization-FAQs and https://poe.com/pages/earnings-tos from an unblocked machine.

### E2 — Poe reported earnings (WEAK: search snippet only)
Search 2026-09-03 returned, quoting rumjahn.com ("How Much Money Can You Really Make Creating Poe Bots in 2025"): top-tier creators $110–$175/month, most under $100/month; annual $750–$2,100 for dedicated creators.
Payer of record: Quora, Inc. (per poe.com/pages/earnings-tos snippet).
URL to close: https://rumjahn.com/how-much-money-can-you-really-make-creating-poe-bots-in-2025/

### E3 — OpenAI GPT Store builder revenue share (WEAK-MEDIUM: consistent snippets across two searches, no rendered page)
Searches on 2026-09-03 consistently reported: the GPT Store builder revenue-share program never broadly launched; as of early 2026 it is an invite-only pilot limited to "a select group of US-based builders who have created popular and engaging GPTs", and OpenAI "is not accepting additional builders into the program". Reported mechanics: engagement-based pool, undisclosed formula, ~$0.03/conversation, 25 conversations/week minimum to qualify; most creators earn nothing; typical soft ceiling $100–500/month for those who do.
One snippet claimed "OpenAI has rolled out the builder payout program to most major markets" — this CONTRADICTS the US-only snippets and came from an SEO blog (digitalapplied.com). I do not credit it. No source named Israel either way.
URLs to close: https://community.openai.com/t/guidance-for-gpt-store-builders-outside-the-us/1357911 , https://community.openai.com/t/what-is-the-status-with-gpt-store-revenue-share/839172 , https://openai.com/index/introducing-the-gpt-store/ (all EGRESS_BLOCKED here).

### E4 — ChatGPT Apps SDK monetization (WEAK: snippet of developers.openai.com)
Search 2026-09-03 surfaced https://developers.openai.com/apps-sdk/build/monetization (blocked) with the snippet: "Today, the recommended and generally available approach is to use external checkout, where users complete purchases on the developer's own domain." Also: Instant Checkout (via Stripe) is US-only and "current approval is limited to apps for physical goods purchases"; OpenAI "does not currently allow publishers to sell digital services through the ChatGPT app integration".
Corroborating: VentureBeat "OpenAI now accepting ChatGPT app submissions from third-party devs, launches App Directory" — https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches
ACP (rendered, STRONG for what it is): https://raw.githubusercontent.com/agentic-commerce-protocol/agentic-commerce-protocol/main/README.md — open standard maintained by OpenAI and Stripe, in beta; README states no country restrictions and no developer-payout mechanism (it is a checkout protocol, not a revenue-share program).
URL to close: https://developers.openai.com/apps-sdk/build/monetization

### E5 — Coze 2.0 "Skill Store" (WEAK: secondary blogs only)
Search 2026-09-03: ByteDance updated Coze to 2.0 on 2026-01-19 launching a "Skill Store" supporting monetization of skills.
Sources seen: https://www.houdao.com/d/406-ByteDance-Unveils-Coze-2-Launches-AI-Skill-Store-Enabling-Monetization-of-Personal-Expertise-and-LongTerm-Tasks , https://aixsociety.com/bytedances-coze-2-0-transforming-ai-from-chat-tool-to-intelligent-work-partner/
No payout-country information found. No evidence Israel can be paid. ByteDance consumer platforms historically settle to CN/US entities only.

### E6 — Character.AI and FlowGPT (dead)
Search 2026-09-03: "Character AI does not currently offer any creator monetization or revenue-sharing program". FlowGPT was "working on" revenue sharing and per TechCrunch (2024-02-26, https://techcrunch.com/2024/02/26/flowgpt-is-the-wild-west-of-genai-apps/) was not revenue-generating. No payout programs to evaluate.

### E7 — Microsoft Marketplace / Copilot Agent Store (UNVERIFIED)
Search 2026-09-03 surfaced the relevant docs but learn.microsoft.com is EGRESS_BLOCKED and MicrosoftDocs no longer hosts partner-center docs publicly on GitHub (only MicrosoftDocs/partner-center-downloads exists, no content match). Known from snippets: Microsoft Marketplace (Azure Marketplace + AppSource unified, announced 2025-09-25) sells to 141 customer locations; publishers are paid through Partner Center via ACH/SEPA/wire; there is an "Agent Store in Microsoft Copilot".
Israel's status as a supported PUBLISHER/payout country was NOT verified. Do not treat as known.
URLs to close: https://learn.microsoft.com/en-us/partner-center/marketplace-offers/supported-countries-regions , https://learn.microsoft.com/en-us/partner-center/marketplace-offers/payment-thresholds-methods-timeframes , https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-agent-store

## Bottom line for the colony
This criterion is mostly a dead end for an Israeli operator. The two headline stores both fail the payability gate:
- Poe pays creators, but not into Israel (23-country list, Israel absent) — hard NO.
- GPT Store revenue share is closed, invite-only and US-only — hard NO, and even for the invited the reported ceiling ($100–500/mo) is below our target.
The one live path is not a "store payout" at all: publish a ChatGPT app (Apps SDK / App Directory) as a DISCOVERY channel and take money on our own domain through the Paddle checkout we already run for products/il-biz-tools. That keeps payability under our control (Paddle already pays Israel) and does not depend on any store's creator program.
