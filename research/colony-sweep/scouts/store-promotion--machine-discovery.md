# Scout: store-promotion / machine-discovery
Date: 2026-09-03. Agent: WORKER-SCOUT, group "store-promotion".

Criterion: being found by *other agents* rather than by people — MCP server registries,
the x402 Bazaar / CDP facilitator listings, .well-known descriptors, schema.org/JSON-LD,
ERC-8004 agent cards, llms.txt and robots directives for AI crawlers.
Deciding question set by the supervisor: **does listing produce paying callers?**

Answer up front: **yes, measurably — and the measurement is brutal.** The whole x402
Bazaar, the single best-instrumented agent-discovery market in existence, moves about
**$3,000/month gross across 15,333 listings**. That is roughly 11,000 ILS/month for the
entire market, split between 1,772 providers. Machine discovery is real and it is
currently a rounding error. The one exception with proven money is the Apify
marketplace, which this repo is already on.

## Evidence quality legend
- **[R]** = page I rendered myself.
- **[S]** = search snippet quoting a page I could not render (weaker; URL to open listed).
- Nothing here rests on memory.

---

## 1. x402 Bazaar / Coinbase CDP discovery registry — REAL, MEASURED, TINY

**The registry is public and unauthenticated.** [R] I rendered the config of a
third-party daily scraper:
- https://raw.githubusercontent.com/nunojsferreira/x402-bazaar-explorer/main/scripts/config.mjs
  → `API = "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources"`,
  PAGE_SIZE 100, paginated with `?limit=&offset=`.
- https://raw.githubusercontent.com/nunojsferreira/x402-bazaar-explorer/main/scripts/fetch.mjs
  → sends only `{ headers: { accept: "application/json" } }`. **No API key.** So any
  agent — including ours — can read the whole catalogue for free.

**Actual volume.** [R] I rendered the committed daily time series
https://raw.githubusercontent.com/nunojsferreira/x402-bazaar-explorer/main/data/history/daily.ndjson

Last three lines, verbatim:
```
{"day":"2026-09-01","listings":14771,"providers":1672,"calls30d":278847,"payers30d":42422,"active10":1313,"priceMedian":0.01}
{"day":"2026-09-02","listings":15100,"providers":1694,"calls30d":296614,"payers30d":43590,"active10":1348,"priceMedian":0.01}
{"day":"2026-09-03","listings":15333,"providers":1772,"calls30d":302072,"payers30d":44063,"active10":1355,"priceMedian":0.01}
```
[R] The repo's README snapshot for 2026-08-25 adds the distribution:
15,147 listings / 1,604 hosts / 88 CDP-curated; ≥10 calls/30d: 1,316 (8.7%);
≥100 calls/30d: 266 (1.8%); ≥1,000 calls/30d: 31 (0.2%).
https://github.com/nunojsferreira/x402-bazaar-explorer

**The arithmetic that decides this criterion:**
- 302,072 calls / 15,333 listings = **19.7 calls per listing per month**.
- At the median declared price of $0.01: **~$0.20/month for the average listing**.
- Whole-market gross: 302,072 × $0.01 ≈ **$3,020/month ≈ 10,900 ILS/month**, across
  1,772 providers → **~6 ILS/month per provider on average**.
- 91.2% of listings do not get even 10 calls in 30 days.
- Our own price is $0.002 (products/x402-il-api/README.md), i.e. **one fifth of the
  registry median**, so our per-call take is below the market's typical.

Caveats I will not paper over: `calls30d`/`payers30d` are fields the CDP discovery API
returns and presumably count only CDP-facilitated settlements; `priceMedian` is the
median *declared* price, not a volume-weighted realised price. The order of magnitude
survives either correction. The scraper is a third party, not Coinbase; to close this a
human should GET the endpoint above directly.

**How you get listed.** [S] Snippet quoting https://docs.cdp.coinbase.com/x402/bazaar
(EGRESS_BLOCKED, I could not render it): "If your API uses the CDP facilitator for x402
payments, it's automatically listed in the bazaar when you enable the bazaar extension
with `discoverable: true`. There's no registration call: the facilitator's catalog
builds itself from payments it has already settled."

That last clause is the trap: **indexing is settlement-gated.** You are discoverable
only after someone already paid you. Discovery cannot bootstrap your first sale.

**And it is currently unreliable.** [R] I rendered
https://github.com/x402-foundation/x402/issues/2112 — a provider (`api.rtkmotion.io`)
did the full documented setup (`declareDiscoveryExtension` + `registerExtension(
bazaarResourceServerExtension)` + `withBazaar(client)`), got **eight successful
end-to-end settlements across five iterations**, and still does not appear in the
catalogue. They intercepted the raw facilitator response and report: "No
`EXTENSION-RESPONSES` header in any casing ... This is the raw response from
`api.cdp.coinbase.com/platform/v2/x402/settle` before our middleware", plus an empty
`access-control-expose-headers`. Open questions to maintainers unanswered at time of
reading: whether the payee wallet must be CDP-registered (theirs is an external EOA —
**so is ours**), and whether the header is implemented or still planned.

**Where our repo stands.** `products/x402-il-api/src/app.ts:87` serves
`/.well-known/x402.json`, and `src/config.ts:32` accepts `X402_FACILITATOR_URL`. There
is **no bazaar extension and no `discoverable` flag anywhere in the source**
(grep for `bazaar|discoverable` returns nothing). So today we are exactly what the
supervisor said: paid endpoints no agent can discover. The fix is small (~8h) but its
payoff is bounded by the $3k/month whole-market number above.

- Israel payability: **YES.** x402 settles USDC to an EOA we control; no KYC, no
  platform account. This is already true of the shipped product.
- ToS: **GREEN.** Publishing a truthful listing of a service we actually run.

## 2. MCP server registries — huge supply, almost no revenue

[R] https://github.com/modelcontextprotocol/registry — "The MCP registry provides MCP
clients with a list of MCP servers, like an app store for MCP servers." Preview status,
launched Sept 2025, API frozen at v0.1 since 2025-10-24. Publishing requires namespace
proof: GitHub OAuth, GitHub OIDC, or DNS/HTTP domain verification; CLI via `make
publisher`. **The README names no consuming client and states no server count or API
usage numbers** — I looked for exactly that and it is not there.

[S] Counts (snippets, could not render the sources):
- Official registry: 8,074 entries / 3,012 unique servers (March 2026 analysis,
  https://nimblebrain.ai/blog/state-of-mcp-security-2026/); a separate snippet says
  "12,500+ on the Official MCP Registry".
- mcp.so 19,000–20,222; Glama 20,000+; Smithery 6,000+.
  https://www.truefoundry.com/blog/best-mcp-registries ,
  https://roxyapi.com/blogs/mcp-registries-where-to-list-your-server

[S] The revenue picture, and the reason this is not a business:
- "less than 5% of these servers generate any revenue at all"
- "The total agent-to-tool payment volume globally is under $50K per day"
- "Smithery: Creators pay $30/mo, earn $0 MCP server income"
- "Apify ... reported payouts of $1.2 million to developers every month"
  all from https://mcp-marketplace.io/blog/state-of-mcp-monetization-2026 and
  https://dev.to/lexwhiting/how-to-monetize-your-mcp-server-in-2026-the-complete-guide-2pg9
  These are vendor-adjacent marketing blogs. **Treat every number here as low
  confidence.** A human should open the mcp-marketplace post and the Apify public
  payout page to confirm.

Listing is free and honest, and an MCP server is a legitimate funnel to our existing
paid endpoints. But nothing in the evidence says a registry listing produces paying
callers by itself.

- Israel payability: **YES** — registries take no money and pay none; billing stays on
  our own rails (Paddle, already shipped; or x402).
- ToS: **GREEN.**

## 3. Apify marketplace — the one machine-discovery channel with proven money

[S] "$1.2 million to developers every month" (same low-confidence sources as above).
This repo already ships `products/apify-il-open-data` on Apify pay-per-event. Of every
channel under this criterion, it is the only one where third parties describe
seven-figure monthly payouts to independent developers rather than a few thousand
dollars across a whole market. The colony's own portfolio decision follows: the
discovery money is on Apify, not in the Bazaar.
I did not verify the payout figure against Apify's own materials — a human should.

- Israel payability: presumed YES (line already shipped); not re-verified by me.
- ToS: **GREEN.**

## 4. ERC-8004 agent cards + A2A `.well-known/agent-card.json` — infrastructure without traffic

[R] https://github.com/sudeepb02/awesome-erc8004 — ERC-8004 is **Draft** in the EIP
process; Identity and Reputation contracts are audited and deployed at fixed addresses
across 16+ chains (Identity `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`, Reputation
`0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`; Ethereum, Base, Arbitrum, Optimism,
Polygon, Linea, Scroll, Avalanche, BNB, Celo, Gnosis, Monad, Abstract, Mantle, Soneium,
Taiko). Validation Registry still under revision. Explorers: 8004scan.io,
agentscan.info, agentarena.site (claims 22,000+ registered agents across 16 EVM chains
plus Solana). The list asserts agents transacting via agent cards + x402 (CYBERDYNE,
Primev, an "Agent Services (x402 + ERC-8004)" section). **That is a promotional
curated list, not measured demand** — no call counts, no revenue.

[S] A2A: agent card at `/.well-known/agent-card.json`, protocol at 1.0.0 under the
Linux Foundation, 150+ supporting organisations (April 2026). But a July 2026 scan
reported by API Evangelist found **"Sixty-five out of 22,341, and ten of those actually
conformant"** —
https://apievangelist.com/2026/07/29/most-published-agent-cards-are-not-actually-a2a/
(EGRESS_BLOCKED; a human must open this to confirm the 65/22,341/10 figures).
[S] Registries such as Agentry and APIs.io claim to auto-scan well-known URLs, so
listing is passive. https://a2a-protocol.org/latest/topics/agent-discovery/

Cheap to publish, honest, and there is a plausible pairing with our x402 endpoints. But
there is no evidence anywhere that an agent card has produced a paying caller. Gas cost
to register on-chain is a real (small) expense against zero measured demand.

- Israel payability: **YES** for x402-settled work; ERC-8004 registration itself is a
  self-custodied on-chain write, no KYC.
- ToS: **GREEN** (publishing truthful descriptors of services we run).

## 5. llms.txt — a hard, well-measured dead end

[R] https://github.com/AnswerDotAI/llms-txt — the spec repo itself notes the AI labs
publish their own (OpenAI, Anthropic, Gemini docs), "thousands of sites publish an
llms.txt", Mintlify auto-generates one, Chrome Lighthouse audits for one. **Publishing
is not reading**, and the repo offers no evidence anyone consumes them.

[S] Ahrefs server-log study of **137,000 domains** (June 2026):
- **97% of llms.txt files received zero requests in May.**
- Of the 3% fetched, only 19.5% came from named AI tools (GPTBot first, Claude-Code
  second); 12% came from GEO/AEO and llms.txt-checker tooling — the industry auditing
  itself.
- **"Zero requests came from AI bots for llms.txt files that don't exist — they never go
  looking."**
- OpenAI: robots.txt 3,990 fetches vs llms.txt **7**. Anthropic: 3,120 vs **9**.
  PerplexityBot: **0** over 12 weeks.
Source https://ahrefs.com/blog/llmstxt-study/ — EGRESS_BLOCKED, I could not render it;
corroborated by https://nohacks.co/episode/229-does-llmstxt-work-what-137000-domains-server-logs-show
and https://www.ezy.ai/research/do-ai-bots-read-llms-txt ("We Put llms.txt on 83
Websites. OpenAI Read It 7 Times."). A human should open the Ahrefs post to close it.

Conclusion: llms.txt costs an hour and returns nothing. Ship it if you like as hygiene;
do not model revenue from it. Ceiling: **0 ILS**.

## 6. Cloudflare pay-per-crawl / robots directives — gated, and not for us

[S] AI Crawl Control is emitting "more than one billion HTTP 402 Payment Required
responses to AI crawlers every day"; Cloudflare is moving from pay-per-crawl to
pay-per-use with Ceramic.ai and You.com pilots.
https://blog.cloudflare.com/introducing-pay-per-crawl/ ,
https://www.leadgen-economy.com/blog/cloudflare-ai-crawl-control-publisher-economics/
[S] But it is a **private beta**: "Initially available only to a group of leading
industry partners", expanding "through a dedicated signup portal or via Cloudflare
representatives" (https://www.cloudflare.com/paypercrawl-signup/). The $50k–$200k/month
figures circulating are for high-traffic publishers; commentary is explicit that "Big
sites might cash in, but smaller ones likely won't"
(https://leakypaywall.com/cloudflare-pay-per-crawl-income-or-spare-change/).

I found **no statement of payout-country eligibility**, so Israel payability is
**UNKNOWN**. Combined with (a) invite gating, (b) our sites having no crawl-worthy
corpus, this is not a build. Not recommended.

## 7. schema.org / JSON-LD product feeds and ACP — platform-gated, wrong shape for us

[S] OpenAI Product Feed + Agentic Commerce Protocol (OpenAI + Stripe) power ChatGPT
Instant Checkout; feeds in CSV/TSV/XML/JSON refreshable every 15 minutes; schema needs
Product, Offer, AggregateRating, Review, FAQPage, ReturnPolicy. Access is **"merchants
work directly with OpenAI's commerce team ... invite-based path for large retailers
like Walmart, Target, Best Buy"**, or via Shopify/commercetools/Salesforce syndication
(Shopify broadly Q1 2026).
https://agentic-commerce-protocol.com/docs/commerce/specs/feed ,
https://www.lengow.com/get-to-know-more/chatgpt-product-feed/ ,
https://askphill.com/blogs/blog/agentic-commerce-for-shopify-protocols-platforms-and-what-to-prioritize-in-2026

This channel is built for physical-goods retail catalogues. We sell API calls and
Hebrew calculators. Even if we forced a fit, entry is invite-gated or requires standing
up a Shopify store. **Dead end for this portfolio.** Adding correct schema.org JSON-LD
to il-biz-tools is fine SEO hygiene, but it is not agent discovery and I found no
evidence tying it to paying callers.

---

## Cross-cutting conclusion for the supervisor

The deciding question — "does listing produce buyers?" — has a numeric answer for the
first time: **in the x402 Bazaar, listing produces about 20 calls and $0.20 a month for
a typical listing, and the entire market is ~$3,000/month.** Machine discovery in
September 2026 is a genuine, working, honest channel that is roughly two orders of
magnitude too small to reach 20,000 ILS/month on its own.

Three concrete recommendations:
1. **Do the Bazaar work anyway, but budget it as ~8 hours, not as a revenue line.** It
   is cheap, GREEN, needs no KYC, and it is the difference between zero and non-zero.
   Expect ~100 ILS/month, not thousands. Watch issue #2112 before assuming it works.
2. **Put the promotion effort where money is measured: Apify.** It is the only channel
   under this criterion with third-party reports of seven-figure monthly developer
   payouts, and we are already on it.
3. **Do not build for llms.txt.** 97% of them are never read, and crawlers do not even
   probe for the file. This is the clearest dead end in the sweep.

## Searches spent
8 of the 20 allowed:
x402 Bazaar listing mechanics; MCP registry server counts/consumers; Cloudflare
pay-per-crawl payouts; llms.txt server-log evidence; Smithery/MCP monetization;
schema.org/ACP product feeds; A2A agent-card adoption; Cloudflare eligibility/Israel.

## Hosts that blocked me (do not retry)
docs.cdp.coinbase.com, ahrefs.com, apievangelist.com — all EGRESS_BLOCKED.
github.com and raw.githubusercontent.com rendered fine and carried the best evidence,
including the only real volume numbers in this report.
