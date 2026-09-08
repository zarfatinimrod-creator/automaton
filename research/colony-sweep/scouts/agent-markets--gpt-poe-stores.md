# Scout notes — agent-markets / gpt-poe-stores
Date: 2026-09-03. Scout: WORKER-SCOUT "gpt-poe-stores".
Criterion: OpenAI GPT Store, Poe creator monetization, and similar AI app stores — payout status,
eligible countries (Israel specifically), amounts creators report, eligibility rules.

## Evidence budget and what happened
- Web searches used: 8 of 8 allowed. No search was refused.
- WebFetch results: `help.poe.com`, `creator.poe.com`, `developers.openai.com` are ALL EGRESS_BLOCKED.
  The only page I actually rendered is a GitHub raw file (ACP README).
- Therefore: almost every claim below rests on **search snippets**, not on a rendered page.
  Marked as such per claim. Nothing here should be treated as confirmed until a human or an
  unblocked agent opens the URLs listed under "must-open URLs".

## Must-open URLs (blocked here, needed to close the questions)
1. https://help.poe.com/hc/en-us/articles/21921312368020-Poe-Creator-Monetization-FAQs
   -> the authoritative list of eligible countries. Does it contain Israel? THIS IS THE GATE.
2. https://poe.com/pages/earnings-tos  -> Poe earnings terms (payout mechanics, tax, eligibility).
3. https://creator.poe.com/docs/resources/creator-monetization -> price-per-message + compute points.
4. https://developers.openai.com/apps-sdk/build/monetization -> what monetization ChatGPT apps may use.
5. https://community.openai.com/t/guidance-for-gpt-store-builders-outside-the-us/1357911
   -> OpenAI's own statement to non-US GPT builders.

## 1. Poe (Quora) creator monetization
Evidence type: SEARCH SNIPPETS ONLY (help.poe.com blocked twice).
- Program pays via **Stripe**, threshold **$10+ earnings**, paid **30-45 days after month end**;
  taxpayer info required within 90 days of joining. (snippet of help.poe.com FAQ, seen 2026-09-03)
- Model: **price per message** set by the creator; snippet says max **$10,000 per 1,000 messages**;
  Poe also covers model compute costs ("how we cover your costs" doc).
- Country coverage: snippet aggregation said "currently available in 23 countries" but the list the
  snippets could actually enumerate was ~18: USA, Argentina, Australia, Belgium, Canada, Colombia,
  Germany, Hong Kong, India, Ireland, Italy, Japan, Mexico, Portugal, Singapore, Spain, Switzerland,
  United Kingdom. **Israel does not appear in any snippet I saw.**
- Amounts: the only aggregate figure I saw in a snippet was "over $100,000 paid out to bot makers by
  mid-2026" — that is a *platform-wide lifetime* number and, if true, it is tiny. Snippet also said
  "most bots earn very little". I found **no** credible individual monthly earnings report.
- Verdict: Israel payability **UNKNOWN, leaning NO**. A no-brand new bot's realistic ceiling is
  near zero even where it is eligible; $100k lifetime across the whole creator base is the tell.
Sources (search results seen 2026-09-03):
  https://help.poe.com/hc/en-us/articles/21921312368020-Poe-Creator-Monetization-FAQs
  https://poe.com/pages/earnings-tos
  https://creator.poe.com/docs/resources/creator-monetization
  https://creator.poe.com/docs/resources/how-we-cover-your-costs
  https://quorablog.quora.com/New-on-Poe-Creator-monetization-via-price-per-message
  https://x.com/poe_platform/status/1737526951966122343 (Dec 2023 expansion to 17 new countries)

## 2. OpenAI GPT Store builder revenue program
Evidence type: SEARCH SNIPPETS ONLY. Several top results are SEO farms
(gptstorerevenueprogram.com, thegptshop.online, wildnetedge.com) — I do NOT treat those as evidence.
- The only reputable-source claim: revenue sharing was announced as "still to come" at launch
  (VentureBeat, Jan 2024) and, per snippets in Sep 2026, remains an **invite-only pilot limited to a
  small group of US-based builders**, not accepting new builders.
- Engagement-based pool, formula never published. Snippets claiming "$100-500/month ceiling" come
  from SEO blogs — **not usable as evidence**, recorded only as rumour.
- Israel: there is **no open application path at all**, for anyone, anywhere. Payability is moot.
- Verdict: **not buildable**. This is a dead end for our operation.
Sources: https://venturebeat.com/ai/openai-launches-gpt-store-but-revenue-sharing-is-still-to-come
  https://openai.com/index/introducing-the-gpt-store/
  https://community.openai.com/t/guidance-for-gpt-store-builders-outside-the-us/1357911
  https://community.openai.com/t/chat-gpt-revenue-for-creators/1100233

## 3. Apps in ChatGPT (Apps SDK) — the successor surface to GPT Store
Evidence type: SEARCH SNIPPETS + one rendered GitHub README.
- Apps SDK is MCP-based; OpenAI said monetization details would come "later".
- Snippets of developers.openai.com/apps-sdk/build/monetization and of the OpenAI dev forum say the
  supported route today is **external checkout on the developer's own domain**, and that developers
  **cannot submit an app with monetization for digital products/services**. Those two statements are
  in tension; I could not render the page to resolve it. LOW confidence.
- Instant Checkout / Agentic Commerce Protocol: ACP README (RENDERED, raw.githubusercontent.com)
  confirms ACP is an open standard maintained by OpenAI + Stripe for agent-mediated purchases; the
  README states **no** country/eligibility requirements. Trade press snippets (digitalcommerce360,
  Mar 2026) say OpenAI is scaling back native checkout in favour of merchant-run ChatGPT apps.
- Verdict: no creator payout program to join. AMBER on policy; do not build against it blind.
Sources: https://raw.githubusercontent.com/agentic-commerce-protocol/agentic-commerce-protocol/main/README.md (RENDERED)
  https://openai.com/index/introducing-apps-in-chatgpt/
  https://developers.openai.com/apps-sdk/build/monetization (BLOCKED here)
  https://community.openai.com/t/chatgpt-app-monetization-apps-sdk/1372343
  https://community.openai.com/t/clarity-on-monetization-policy/1380478
  https://stripe.com/newsroom/news/stripe-openai-instant-checkout
  https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/

## 4. MCP / agent-tool marketplaces that actually pay (MCPize, Apify, Agensi)
Evidence type: SEARCH SNIPPETS from vendor blogs and directories — WEAK.
- Snippets: MCPize claims 85% rev share, Stripe payouts, $100 minimum withdrawal; Apify 80% with
  pay-per-event; Agensi 70/30 and still "building". Realistic first-year figures quoted by these
  blogs ($500-5,000/mo) are vendor marketing, not evidence.
- Relevance: the colony has ALREADY shipped products/apify-il-open-data on exactly this model, so
  this criterion mostly re-discovers an existing line rather than opening a new one. MCPize is the
  only genuinely new name and I have no independent confirmation it pays Israel.
Sources: https://mcpize.com/blog/make-money-with-mcp  https://www.agensi.io/learn/ai-agent-marketplace-landscape-2026
  https://godberrystudios.com/posts/how-to-monetize-mcp-servers-2026/

## 5. Other AI app stores — checked, all empty for creator cash-out
Evidence type: SEARCH SNIPPETS.
- Character.AI: no creator monetization / no cash-out. "Charms" virtual currency introduced ~early
  2026 for tipping inside the app; no payout rail. NOT payable.
- Coze (ByteDance): snippets show subscription/billing docs for *users*; no creator payout program.
- Hugging Face: no creator payout program; revenue is Pro/inference/enterprise. Creators are unpaid.
- FlowGPT: "bounties and tips" mentioned in review blogs; no documented payout rail or country list.
Sources: https://en.wikipedia.org/wiki/Character.ai  https://www.coze.com/docs/guides/billing
  https://huggingface.co/docs/hub/en/billing  https://autogpt.net/ai-tool/flowgpt/

## Bottom line for the supervisor
This criterion is close to a **dead end**. The two headline programs (GPT Store revenue share, Poe
creator monetization) are respectively closed-to-new-entrants/US-only and probably not open to
Israel, and both have tiny disclosed payout pools. Nothing here clears the bar of "a nameable buyer
pays a no-brand new entrant real money within 40 hours of build". The one cheap action worth taking
is having an unblocked agent open the five must-open URLs above — specifically the Poe FAQ country
list — because that single page converts the Poe line from UNKNOWN to a decided YES/NO for ~zero cost.
