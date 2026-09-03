# Scout notes — agent-markets / mcp-registries
Date: 2026-09-03. Scout: WORKER-SCOUT "mcp-registries".
Criterion: MCP server registries and directories in 2026 — how many are listed, whether anyone
pays for MCP servers, hosted-MCP business models, and whether distribution there converts to
money or only to attention.

## Evidence budget actually spent
- WebSearch calls: 8 (the cap). No searches were refused.
- WebFetch: 12 attempts. Rendered: github.com, raw.githubusercontent.com,
  registry.modelcontextprotocol.io. Blocked (EGRESS_BLOCKED): smithery.ai, www.pulsemcp.com,
  mcpqueen.com, www.truefoundry.com, blog.cloudflare.com, apify.com.

## Evidence grade key
- [RENDERED] I fetched the page/API myself and read the text.
- [SNIPPET] a search-result summary quoting a page I could NOT open. Weaker. URL to open is given.
- [REPO] a file inside /home/user/automaton (prior colony work, not an external primary source).

## 1. The official registry is real, live, free, and pays nobody
[RENDERED] https://registry.modelcontextprotocol.io/v0/servers?limit=1 — fetched 2026-09-03.
Returned a live server record (`ac.inference.sh/mcp`) with
`_meta["io.modelcontextprotocol.registry/official"]` = status "active",
publishedAt 2026-04-13T17:32:20Z, schema
https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json .
The API is cursor-paginated and returns **no total count**, so I could not verify a total
myself without dozens of calls.
[RENDERED] https://github.com/modelcontextprotocol/registry — "app store for MCP servers",
community working group (Stacklok, PulseMCP, TeamSpark, Ravenmail), API frozen at v0.1, still
pre-GA. Publishing is a CLI + GitHub OAuth / GitHub OIDC / DNS / HTTP namespace verification.
**No fee, no billing, no revenue share anywhere in it.**
[SNIPPET] "18,849 servers (18,650 active), 9,312 (49.9%) advertising a remote endpoint" —
attributed to the State of the MCP Ecosystem, July 2026 report. To close this a human must open
https://mcpqueen.com/reports/state-of-mcp-2026-07 (blocked here). A competing snippet said
"nearly 2,000", so the figure is contested; treat 18.8k as unverified.

## 2. Directory counts seen (all [SNIPPET] unless marked)
- Official registry: ~18,849 (contested) [SNIPPET]
- Smithery: "3,305+" in one snippet, "5,000+" in another [SNIPPET] — https://smithery.ai (blocked)
- Anthropic Claude connectors: **1,625 listed + 72 held, snapshot 2026-08-10** [RENDERED]
  https://raw.githubusercontent.com/rdmgator12/awesome-claude-connectors/main/README.md
  ("A" = built by Anthropic, "C" = in-app Community badge, not vetted like web-directory entries.
  README mentions **no paid tier of any kind**.)
- Private/managed catalogues [RENDERED]
  https://raw.githubusercontent.com/bh-rat/awesome-mcp-enterprise/main/README.md :
  Composio "500+ managed MCP servers", ACI.dev "600+ tools", Pipedream "2,800+ APIs and 10,000+
  tools", Workato "12,000+ apps". Directories listed: Smithery, Awesome MCP Servers, Dexter MCP,
  FastMCP.me, MCP Market, MCP SO, OpenTools, PulseMCP. Hosting: Alpic, Blaxel, Cloudflare Agents,
  Manufact ("like Vercel, but for MCP"), FastMCP Cloud. That README mentions **no x402, no Stripe,
  no creator revenue share**.

## 3. Registry-building itself is saturated with dead repos
[RENDERED] GitHub repo search "MCP server registry directory" (mcp__github__search_repositories,
2026-09-03): the top matches are near-zero-star hobby directories —
sunnamed434/awesome-mcp-registry (2 stars), AgentSafe-AI/tooltrust-directory (7),
dev48v/public-mcp-servers (0), 0xelitesystem/mcp-server-registry (0),
Isxaaq-Cabdiqani/mcp-list (0), rootz-global/mcp-registry (0), bon5co/stillworks (0),
Microck/registry-directory-mcp (0). Dozens of people are building the same directory and none of
them has traction. Building another MCP directory is a confirmed dead end.

## 4. Does anyone pay for MCP servers?
[SNIPPET, vendor-biased] "Fewer than 5% of the 12,000+ MCP servers published as of March 2026
have successfully monetized"; "most public servers earning real money sit in the $500–$3,000/mo
range". Sources are all vendor content-marketing (mcpize.com, agenticmarket.dev, dev.to,
godberrystudios.com), i.e. companies selling MCP monetization. Directionally credible (free is
the market default), numerically untrustworthy. URLs a human should open:
https://dev.to/lexwhiting/how-to-monetize-your-mcp-server-in-2026-the-complete-guide-2pg9 ,
https://mcpize.com/blog/make-money-with-mcp .
[SNIPPET] One operator's stated economics: pays ~$14/mo (Cloudflare + CoinGecko Pro), charges
end users $19/mo — https://dev.to/whoffagents/pricing-an-mcp-server-in-2026-why-we-charge-19mo-when-the-market-average-is-0-nig
(headline itself concedes "the market average is $0").

## 5. Hosted-MCP business models observed
- **Creator-pays hosting** (Smithery): [SNIPPET] "creators pay $30/mo and earn $0 MCP server
  income" — that phrasing comes from a competitor (mcpize.com/alternatives/smithery), so it is
  hostile testimony; Smithery also advertises free hosting for side projects. Open
  https://smithery.ai/pricing to close this.
- **Marketplace 80/20 revenue share**: Apify (see 6), MCPize ("80%, 85% founding members"),
  AgenticMarket ("earn 80% of every call") — the last two [SNIPPET] only, unknown scale, unknown
  payout countries. I found **no evidence at all** that MCPize or AgenticMarket can pay an
  Israeli; treat as UNKNOWN, not YES.
- **Infra pay-per-use**: Cloudflare Workers paid plan from $5/mo, pay-per-request [SNIPPET].
- **Monetization Gateway / x402**: Cloudflare announced a "Monetization Gateway ... the ability
  to charge for any asset protected by Cloudflare: web pages, datasets, APIs, or MCP tools" via
  x402 [SNIPPET]. Blocked page to open: https://blog.cloudflare.com/monetization-gateway/ .
  This is the one rail where an MCP tool call itself is the billable unit.
- **Anthropic**: connectors directory is free, review-gated, no paid placement; monetization and
  an "Agentic Commerce" purchase flow are described as *planned* [SNIPPET]. Nothing to sell into
  today. Policy: April 2026 the MCP Directory Policy was folded into the Software Directory
  Policy; custom connectors need a paid Claude plan (Pro/Max/Team/Enterprise).

## 6. Apify is the only MCP distribution channel I could tie to an Israel-payable rail
[SNIPPET] https://docs.apify.com/actors/publishing/monetize/pay-per-event and
https://apify.com/mcp/developers (apify.com blocked here): MCP servers deploy as Actors, use the
pay-per-event model, ~80% creator revenue share, rental model retiring (no new listings after
2026-04-01, fully retired 2026-10-01).
[REPO] /home/user/automaton/products/apify-il-open-data/README.md documents the payout path we
already validated: "Apify pays creators via **PayPal** or bank transfer/**Payoneer**; Stripe is
not required from your side. An Israeli individual can receive PayPal payouts" — plus the
one-time human step: Apify account, email verification, Settings -> Payouts.

## 7. Attention vs money — the honest read
Registries are a **discovery surface with no cash register**. The official registry, Anthropic's
connectors directory, PulseMCP, mcp.so, Glama and the awesome-lists all pass zero money to the
author. Money enters only when (a) a marketplace with its own billing hosts the server
(Apify), (b) the author charges directly (Stripe/Paddle subscription or per-call), or (c) a
per-call rail like x402 sits in front of the tool. Registry rank buys installs; installs bill
nothing. Everything in this criterion that is not (a), (b) or (c) is attention only.

## All URLs touched
RENDERED: https://registry.modelcontextprotocol.io/v0/servers?limit=1 ,
https://github.com/modelcontextprotocol/registry ,
https://raw.githubusercontent.com/rdmgator12/awesome-claude-connectors/main/README.md ,
https://raw.githubusercontent.com/bh-rat/awesome-mcp-enterprise/main/README.md ,
GitHub repo search API (mcp__github__search_repositories, query "MCP server registry directory").
BLOCKED (a human/unblocked agent must open these): https://mcpqueen.com/reports/state-of-mcp-2026-07 ,
https://smithery.ai/pricing , https://www.pulsemcp.com/servers , https://blog.cloudflare.com/monetization-gateway/ ,
https://www.truefoundry.com/blog/best-mcp-registries , https://apify.com/mcp/developers ,
https://docs.apify.com/actors/publishing/monetize/pay-per-event .
SNIPPET-ONLY (seen in search results, not opened): https://dev.to/lexwhiting/... ,
https://mcpize.com/blog/make-money-with-mcp , https://agenticmarket.dev/blog/monetize-mcp-servers ,
https://mcpize.com/alternatives/smithery , https://nordicapis.com/7-mcp-registries-worth-checking-out/ ,
https://roxyapi.com/blogs/mcp-registries-where-to-list-your-server ,
https://sunpeak.ai/blogs/claude-connector-directory-submission/ .
