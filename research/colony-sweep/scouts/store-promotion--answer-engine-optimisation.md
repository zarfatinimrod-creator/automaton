# Scout notes — store-promotion / answer-engine-optimisation
Date: 2026-09-03. Agent: WORKER-SCOUT (Opus 5). Search budget spent: 12 WebSearch, 5 WebFetch attempts (3 blocked).

## Evidence-strength key
- **RENDERED** = page actually fetched and read by me.
- **SNIPPET** = search-result summary quoting a page I could NOT open (egress-blocked). Weaker: the number is second-hand.
- Memory is not used as evidence anywhere below.

## Blocked hosts confirmed this session
ahrefs.com, apps.shopify.com, developers.openai.com — all EGRESS_BLOCKED. github.com renders.

---

## Q1. Does an AI citation actually send traffic and buyers?

Two facts that must be held together:

**(a) Volume is tiny.** SNIPPET, Similarweb via aisearch.similarweb.com / thedigitalbloom, Feb 2026: AI platforms drive **0.15%–0.25% of total global internet traffic**. Across studies AI referrals are **0.1%–2.8% of a site's sessions**; IT/B2B SaaS is the top vertical at 2.8%; some sources claim 5–8% on tech/ecommerce sites. Conductor data cited at 1.08% of all traffic.
- URLs a human must open to close this: https://aisearch.similarweb.com/blog/gen-ai-stats/ , https://searchsignal.online/research/ai-search-referrals-citations-2026 , https://thedigitalbloom.com/learn/gen-ai-website-traffic-share-february-2026/

**(b) Per-visit quality is unusually high, on *large retailers*.** SNIPPET, Adobe Analytics via digitalcommerce360 (2026): AI-referred traffic to US retail sites grew **393% YoY in Q1 2026**; converts **42% better than non-AI (March)**, **60% better by July**; revenue per visit **+37% (March) / +53% (July)**; 11 straight months of outperformance; +48% time on site, +13% pages/visit.
- https://www.digitalcommerce360.com/2026/08/19/adobe-ai-referral-traffic-data-july-2026/
- https://www.digitalcommerce360.com/2026/06/17/adobe-ai-referred-traffic-to-retail-sites-doubles-in-a-year/
- https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable

First Page Sage (SNIPPET): 160+ companies, May 2025–Jul 2026, ChatGPT referrals convert ~15.9%, "9x organic". This is an agency dataset, not peer-reviewed — treat as directional.
- https://firstpagesage.com/seo-blog/chatgpt-conversion-rates/

**(c) But the answer engine mostly keeps the user.** SNIPPET, Pew Research via multiple summaries: users clicked through on **8% of searches with an AI Overview vs 15% without**; roughly **1% of AI Overview views produce a click on a cited source**. Zero-click rate on AIO queries ~83% vs ~60% otherwise. SparkToro 2026: fewer than one third of Google searches send a click.
- https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/
- https://www.similarweb.com/blog/marketing/geo/zero-click-marketing/

**Verdict:** a citation is a low-volume, high-quality channel. Honest reading for a no-brand new storefront: AI answers will not replace a traffic source; they can add a small stream of unusually motivated visitors. Anyone selling "AI traffic will replace SEO" is selling the conversion number while hiding the volume number.

**Creator-reported (preferred evidence class), SNIPPET:** Zigpoll, solo founder, ~$125K MRR mid-2026, reports **14% of new signups came from ChatGPT**. Single self-reported case, B2B SaaS, established brand — the highest credible ceiling I found, and not typical.
- https://note.com/lagless/n/n5d69c10af6c1?hl=en
- https://www.indiehackers.com/post/tech/hitting-125k-mrr-as-a-solo-founder-by-doubling-down-on-the-right-segment-c4o2Tfs6mjdpip5yZhaO

## Q2. Is llms.txt read by anyone? — No.
SNIPPET, Ahrefs May 2026 study of 137,000+ domains: **97% of llms.txt files are never fetched by an AI crawler**. Independent log studies: 500M AI bot visits / 90 days → 408 llms.txt requests; 62,100 bot visits → 84 (0.1%); one site: 151 crawler hits in 14 days, file never requested. Crawlers do not probe for it on domains lacking it. Google documentation update June 2026: llms.txt has **no effect** on Search rankings or AI Overviews.
- https://saaslinks.net/blog/llms-txt-server-log-study (log study, must be opened to confirm)
- https://www.1clickreport.com/blog/llms-txt-evidence-2026 , https://ariashaw.com/does-llms-txt-actually-work
- Ahrefs original (BLOCKED here): https://ahrefs.com/blog/llms-txt/

RENDERED primary source: https://github.com/AnswerDotAI/llms-txt — Jeremy Howard's proposal. It claims "The AI labs themselves publish llms.txt files for their own developer docs: OpenAI, Anthropic, and Gemini." Note the asymmetry: labs **publish** the file for their docs; no lab has stated its production retrieval **consumes** it. Publishing ≠ consuming, and the marketing conflates the two.

**Verdict: dead end as a product; free as a 5-minute hygiene step, worth nothing more.**

## Q3. Does structured data help citations? — Barely, and not the way it's sold.
SNIPPET, Ahrefs experiment (via Search Engine Journal, 2026): **1,885 pages that added JSON-LD schema vs matched controls**. Citation change after adding schema: Google AI Overviews **−4.6%**, AI Mode **+2.4%**, ChatGPT **+2.2%** — all insignificant. Schema is *correlated* with cited pages but adding it did not cause citations.
- https://www.searchenginejournal.com/schema-markup-didnt-move-ai-citations-in-ahrefs-test/574568/
- https://www.stanventures.com/news/schema-markup-has-no-meaningful-impact-on-ai-citations-7231/

Where structured data DOES matter is a different mechanism: machine-readable product data is a hard requirement for **shopping feeds/agentic commerce**, not for prose citations. Adobe: retail sites "not machine-readable". SNIPPET audit claim: of 2,400 products audited, only **11% had the structured data required for ChatGPT Shopping recommendations**.
- https://www.adsx.com/blog/shopify-apps-ai-visibility

## Q4. What does correlate with being cited?
SNIPPET (Princeton/Georgia Tech GEO line of work, as summarised by machinerelations.ai and others): inline citations to primary sources **+40%**, specific statistics **+37%**, named expert quotations **+22%** citation likelihood. Freshness: content updated within 3 months ~2x more likely to be cited by ChatGPT; cited pages ~25.7% fresher than organic results. Branded web mentions correlate with AIO visibility at r≈0.664.
- https://machinerelations.ai/research/ai-search-citation-factors-2026
- The underlying academic paper (GEO, Aggarwal et al.) should be opened at arxiv by an unblocked agent to verify the +40/+37/+22 numbers — every source I could reach is a secondary summary.

**Source mix is the decisive structural fact.** SNIPPET, multi-study: Reddit ≈40% of citations overall; top 15 domains ≈68% of consolidated citation share; Perplexity June 2026 YouTube 32.4% / Reddit 16.6%; Google AIO social citations 44% Reddit; Gemini cites Reddit 0.1%; **Claude cites brand sites 64% and Reddit ~0%**. ~85% of brand mentions originate on third-party pages, not owned domains.
- https://sanbi.ai/blog/ai-engine-citation-trends-source-affinity-reddit (120K-citation study — open this to confirm)
- https://everything-pr.com/ai-platform-citation-source-index-2026 , https://wellows.com/blog/social-media-ai-citations-report-2026/

Consequence for us: on ChatGPT/Perplexity/AIO, a new no-brand storefront page competes against Reddit/YouTube/Wikipedia and mostly loses. On **Claude**, brand-owned pages are the majority of citations — the only engine where owning a good page is itself the strategy.

## Q5. ChatGPT Shopping / agentic commerce — the storefront-specific channel
RENDERED primary: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol — ACP is an open standard maintained by **OpenAI and Stripe** (beta). Merchants implement a Checkout API + Delegate Payment endpoints; a "feed" component appears in the 2026-04-17 spec version listing. Integration docs live at developers.openai.com/commerce (BLOCKED here).
SNIPPET on access: merchants apply at chatgpt.com/merchants, OpenAI **verifies the business**, then issues SFTP credentials; feeds in JSONL/CSV/TSV/Parquet; ~100-product validation batch; refresh up to every 15 min. **Currently US merchants only**, expansion outside the US "planned throughout 2026". ACP carries a 4% fee.
- https://www.lengow.com/get-to-know-more/chatgpt-product-feed/ , https://www.retail-q.com/guides/how-to-submit-an-openai-product-feed
- Must be opened by an unblocked agent: https://developers.openai.com/commerce/ and https://chatgpt.com/merchants

**Israel gate:** US-only + business verification means our own Israeli storefronts almost certainly cannot enrol today, and enrolment is a human application (owner blocker). This is a NO for us as a seller-side channel, and only a YES as software we sell to US merchants who apply themselves.

## Q6. The market for AEO tooling — who is already there
SNIPPET pricing: Otterly $29 / $189 / $989 per month; Peec AI €89–199; Profound $499+. Peec AI: $29M raised, reported 0→$10M ARR in 16 months. Profound: $155M raised, $1B valuation. Shopify-side apps exist (RankerGPT, Geoify, Lexsis). Agencies: small-business AEO retainers ~$1,500–3,000/mo, one-off audits $1,500–5,000.
- https://acromatico.com/ai-visibility-tool-pricing-compared , https://discoveredlabs.com/blog/profound-vs-peec-vs-otterly-which-ai-visibility-platform-should-you-buy
- https://thedigitalelevator.com/blog/aeo-and-geo-pricing-guide/ , https://www.stackmatix.com/blog/aeo-optimization-cost
Creator-reported: "Mentions", an AI-search monitoring SaaS, reports $20K MRR (SNIPPET, same Medium/IH roundups as Q1).

**ToS landmine:** monitoring tools answer "does ChatGPT mention me?" by *asking the model repeatedly*. Doing that by driving the consumer web UI is against OpenAI/Anthropic terms (automated access / scraping). Doing it through the paid APIs is permitted but samples a **different surface** than the consumer product with browsing — so an API-only tool must say so plainly or it deceives the buyer. Only the API-only, honestly-labelled variant is GREEN.

## Q7. Israel / Hebrew specifics
Almost nothing measured. One Israeli-market GEO research page and one Israeli agency page exist (SNIPPET only):
- https://www.5wpr.com/research/ai-israeli-brand/ (claims a "$680M reallocation opportunity" — unverified agency research)
- https://localseoisrael.co.il/services/ai-visibility/ (Israeli agency already selling AI-visibility services — i.e. the local niche is not empty)
No study I could find measures Hebrew-language AI answer behaviour, Hebrew citation sources, or Israeli AI referral share. **Genuine gap; also means no evidence of a paying Hebrew market.**

## Constitution check on the "obvious" play
The single highest-leverage lever the data shows is Reddit/YouTube presence (40%/32% of citations). Manufacturing that presence — seeded threads, sockpuppets, paid mentions posing as users — is astroturfing: it violates Reddit's content policy, breaks our honest-value constitution, and would be RED. Genuine participation by a human is exactly what the owner does not do. So the biggest lever in this criterion is closed to us by design. This is the central negative result of this scout.

## Ownership / payability notes
- Paddle already pays this operation (products/il-biz-tools ships with it) → self-serve SaaS is payable to Israel. YES.
- Shopify App Store payouts to Israel: NOT verified this session (apps.shopify.com blocked). UNKNOWN — must be confirmed before building a Shopify app.
- ChatGPT merchant feed: US-only → NO for our own stores.
