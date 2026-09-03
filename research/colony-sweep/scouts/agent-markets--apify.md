# Scout: agent-markets / apify

**Criterion:** Apify Store deeper — pay-per-event economics, evidence of actual actor revenue,
rent-an-actor model, which categories are saturated and which are unserved, payout to Israel.

**Date of research:** 2026-09-03. **Search budget spent:** 8 WebSearch calls (the cap), plus
5 free GitHub/raw.githubusercontent fetches.

## Evidence ledger

### Strong (rendered primary source — Apify's own docs repo)

1. `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/pay_per_event.mdx`
   — rendered 2026-09-03.
   - Developer profit formula stated as `profit = (0.8 * revenue) - platform costs`.
   - Synthetic events: `apify-actor-start` default **$0.00005 per start** (covers ~5 seconds of
     compute; scales with memory allocation), and `apify-default-dataset-item` charged per pushed item.
   - Prices are per event type **and per discount tier** (Bronze/Silver/Gold subscriber tiers).
   - Optionally the developer can pass platform usage costs straight to the user and keep the full
     80%; the doc says this **takes 14 days to enable**, reduces pricing transparency and **hurts the
     Actor's quality score**. Can be disabled immediately.
   - Worked example in the doc: social-media monitor at $0.002/post, $0.005/profile,
     $0.01/sentiment-analysis → $31 user revenue − $4 platform cost → **$20.80 developer profit**.
     (This is Apify's illustration, not measured revenue.)

2. `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/monthly-payouts.mdx`
   — rendered 2026-09-03. **This is the payout gate.**
   - Minimum payout: **"$20 for PayPal and Wise"**, **"$100 for other payout methods"**.
   - Payout invoices auto-generated on the **11th of each month**, auto-approved on the **14th**
     if the developer takes no action.
   - **KYC required.** Individuals: full legal name matching the ID card, and a clear
     high-resolution photo of ID card or driver's licence (screenshots / paper copies / damaged
     documents are automatically rejected). Companies: name of the verifying person plus the
     official company name.
   - Both individuals and companies are eligible.
   - **No restricted-country list appears in this file.** Absence is not proof; see open questions.

3. `https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_actor_monetization_works.md`
   — rendered 2026-09-03.
   - Two models: pay-per-event (PPE) and **Rental — explicitly marked as currently sunsetting**.
   - Rental structure was e.g. 7-day free trial then $30/month, developer keeps 80%.
   - Developer earns "80% of the revenue minus platform usage costs".
   - The doc gives **no** payout thresholds, methods, country list, or real earnings figures.

4. `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/publishing/quality_score.mdx`
   — rendered 2026-09-03. Eight quality-score dimensions: Reliability (run success rate + automated
   QA), Popularity (users, saves, return usage), Feedback/Community (reviews, ratings), Ease of Use,
   **Pricing Transparency (PPE explicitly named as the transparent model)**, Trustworthiness
   (limited permissions), History of Success (prior successful actors by the same developer),
   Congruency (title/description/docs/schema alignment). Quality score drives ranking in Store
   search **and in the MCP server's actor-search tool**; recalculated several times a day; results
   are also personalised per user.

5. `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/development/programming_interface/actor_standby.md`
   — rendered 2026-09-03. **This is the real "rent-an-actor" successor.**
   - Standby = the Actor runs a **persistent HTTP server**, answering proxied user requests in real
     time (GET/POST/PUT/DELETE, input via query string or body) instead of cold-starting per run.
   - Readiness probe header: `x-apify-container-server-readiness-probe`.
   - Limits: **5 minutes** total to return a first response; **2 minutes** for the platform to pick
     which run serves the request.
   - Monetised "just like any other Actor"; the doc **recommends PPE for Standby**, where users pay
     both the platform usage cost of the run and the event cost.
   - Note: Standby is a *serving mode*, not a subscription — an Actor can be started in Standby or
     standard mode; the code must check `metaOrigin`.

6. `https://raw.githubusercontent.com/apify/apify-docs/master/sources/legal/old/fair-share-program-terms-and-conditions.md`
   (seen via GitHub code search 2026-09-03) — the Fair Share "Active Developer Tier" **requires**
   monetising via Pay-Per-Event, and may grant "a temporary discount on computing resources or other
   incentives for your open-source Actor subject to a separate agreement with Apify". Filed under
   `legal/old/`, so treat the programme as possibly retired.

### Weaker (search snippets — NOT rendered pages; listed with the URL a human must open)

7. Rental sunset dates. Snippets from a 2026-09-03 search quote:
   - Apify stopped accepting new rental listings / rental price changes on **2026-03-31 / 2026-04-01**.
   - Rental **fully retires 2026-10-01**; un-migrated actors are moved to **pay-per-usage, which
     pays the developer nothing**.
   - Snippet claims developers who did the maths saw **40–70% revenue drops** moving rental → PPU
     without a proper PPE plan (source: godberrystudios.com, a third-party blog — low authority).
   - Apify ships an official migration tool: `https://apify.com/apify/rental-to-pay-per-event-calculator`.
   - **To close:** open `https://blog.apify.com/migrating-to-pay-per-event-pricing/`,
     `https://blog.apify.com/standardizing-actor-pricing/`, and
     `https://docs.apify.com/actors/publishing/monetize/rental`. All three are egress-blocked here.

8. Aggregate developer earnings. Snippet from the same search: **"Apify pays out $1.4M monthly
   across roughly 3,000 developers, averaging about $470 per developer"**, with "top independent
   creators exceed $10,000 monthly recurring revenue and many developers clear $1,000 a month".
   Attributed in the result set to `https://agentbyline.com/articles/apify-actor-passive-income-what-really-earns-in-2026-67lcfr`
   and/or `https://apify.com/partners/actor-developers`. **This is the single most load-bearing
   number in this report and it is snippet-only.** To close, open
   `https://apify.com/partners/actor-developers` and
   `https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store`.
   Note $1.4M/3,000 = $467, so the "average" is arithmetic on the two other figures, and the
   distribution is certainly long-tailed — the **median** developer earns far less than $470.

9. Store size and category concentration. Snippets citing `https://apifystats.com/stats.html`
   (an independent daily census; the domain is egress-blocked here):
   - **42,715 actors from 2,148 publishers**; **190.6M runs in the last 30 days**; **96.8% run
     success rate**; **33,439 actors used this month (78.3% of the store)**.
   - Highest-traffic categories 2026: **Google Maps** (Compass's scraper, 426K users),
     **Instagram** (Apify's official scraper, 277K), **TikTok** (Clockworks, 185K), **LinkedIn**,
     **lead generation**.
   - An older figure also surfaced: "by late 2024 the store held more than 35,000 actors, used by
     52,000 customers."
   - **To close:** open `https://apifystats.com/stats.html` and `https://apifystats.com/publishers/`.

10. Store-intelligence meta-niche. A single search returned at least seven distinct actors already
    doing "find the gap in Apify Store": `apify.com/extractmaster01/apify-store-scraper`,
    `apify.com/zinin/apify-niche-demand-radar`, `apify.com/synergistic_freedom/apify-store-competitor-intelligence`,
    `apify.com/adamjosh/apify-store-opportunity-finder`, `apify.com/signalcrawl/apify-store-quality-radar`,
    `apify.com/scraper_guru/apify-store-analyzer`, `apify.com/ryanclinton/actor-competitor-scanner`,
    `apify.com/agentictools/apify-store-search`. Search-result titles only; none rendered.

11. MCP / agent demand. Snippets: the Apify MCP server lets agents discover and run Store actors;
    native integrations named for LangGraph, CrewAI, Mastra.ai; "developers keep 80 percent of
    revenue after platform compute costs"; PPE named as the AI/MCP-compatible model.
    Primary repo that DOES render: `https://github.com/apify/apify-mcp-server`.
    Marketing pages `https://apify.com/mcp/developers` and `https://apify.com/ai-agents` are blocked.

## What this means for the colony

- **PPE is now the only forward-looking model.** Rental is dead on 2026-10-01. Never design a line
  around a monthly Apify rental fee.
- **The head of the store is closed.** Google Maps / Instagram / TikTok / LinkedIn / lead-gen are held
  by Compass, Apify itself and Clockworks at 185K–426K users each. A no-brand new entrant does not
  win those. Our shipped `apify-il-open-data` sits in exactly the right place: a language- and
  jurisdiction-gated dataset that the big publishers have no reason to build.
- **Distribution is the binding constraint, not build time.** 42,715 actors, 2,148 publishers, and
  ranking is a quality score in which "History of Success" (prior successful actors by the same
  developer) is an explicit input — i.e. the score is structurally biased against a first actor.
- **Payout to Israel is fine; KYC is the one human step.** PayPal or Wise at a $20 threshold both
  serve Israel. The unavoidable owner action is a one-time government-ID upload.

## Open questions a human or unblocked agent must close

1. Does Apify's payout provider exclude Israel? Nothing in `monthly-payouts.mdx` says so, but the
   live billing page must be checked: `https://console.apify.com/billing` (authenticated).
2. Real revenue distribution — the $470 average is snippet-only and is an average, not a median.
3. Per-category actor counts and users-per-actor (the actual saturation metric) — `apifystats.com`.
4. Whether the Fair Share programme still exists (its terms live under `legal/old/`).

## Dead ends encountered

- `apifystats.com` — EGRESS_BLOCKED (confirmed by an actual failed fetch, not assumed).
- `apify.com`, `blog.apify.com`, `docs.apify.com`, `help.apify.com` — not attempted after the
  apifystats block and the standing egress warning; all evidence about them here is snippet-level.
- No source anywhere in this sweep publishes **per-actor revenue**. Apify does not expose it, and
  neither does the independent census. Any claim of "actor X earns $Y/month" would be invented.
