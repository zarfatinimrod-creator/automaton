# Scout: agent-markets / mcp-registries
Date: 2026-09-03. Scout: WORKER-SCOUT "mcp-registries".
Criterion: MCP server registries and directories in 2026 — how many are listed, whether anyone
pays for MCP servers, hosted-MCP business models, and whether distribution converts to money
or only to attention.

Search budget used: 6 of 8 allowed WebSearch calls. Remaining evidence gathered from
github.com / raw.githubusercontent.com / registry.modelcontextprotocol.io (no search cost).

## Evidence strength key
- **[RENDERED]** = I fetched the page/file and read it.
- **[SNIPPET]** = a WebSearch result summary quoting a page I could NOT open (egress-blocked).
  Treat every number marked [SNIPPET] as unverified.

## Blocked hosts (confirmed EGRESS_BLOCKED this session)
www.pulsemcp.com, smithery.ai, glama.ai, mcp.so, claude.com, docs.x402.org.
So *every* directory-size and directory-pricing number below is snippet-level only.
Hosts that DO render: github.com, raw.githubusercontent.com, registry.modelcontextprotocol.io,
static.modelcontextprotocol.io.

## Primary sources actually rendered

1. https://github.com/modelcontextprotocol/registry — [RENDERED 2026-09-03]
   "The MCP registry provides MCP clients with a list of MCP servers, like an app store for
   MCP servers." Still a **preview** release, "breaking changes or data resets may occur.
   A general availability (GA) release will follow later." Working group led by Radoslav
   Dimitrov (Stacklok) with PulseMCP, TeamSpark, Ravenmail. No monetization mentioned anywhere.

2. https://raw.githubusercontent.com/modelcontextprotocol/registry/main/README.md — [RENDERED]
   Publishing is free and self-serve: GitHub OAuth / GitHub OIDC / DNS / HTTP domain
   verification, namespace ownership enforced (io.github.<user>/<name> or me.<domain>/<name>).
   No server-count statistic published. No payment concept.

3. https://registry.modelcontextprotocol.io/v0/servers?limit=1 — [RENDERED, live JSON]
   Live API works from this container. Returns `metadata.count` = page size only, plus
   `nextCursor`; **there is no total-count or stats endpoint** (limit=5000 -> HTTP 422).
   Sample entry shows schema `2025-12-11` and `_meta["io.modelcontextprotocol.registry/official"]`
   with status/publishedAt. So the official registry's true size cannot be read without paging
   the whole cursor chain. TO CLOSE: an unblocked agent should page /v0/servers or open
   https://registry.modelcontextprotocol.io/ and read the published count.

4. https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json — [RENDERED]
   Top-level ServerDetail properties: $schema, _meta, description, icons, name, packages,
   remotes, repository, title, version, websiteUrl.
   **There is no price, payment, billing, plan, or commercial-terms field anywhere in the
   official server schema.** This is the single hardest fact in this report: the official MCP
   registry is a discovery index, not a store. It cannot take money and does not model it.

5. https://github.com/docker/mcp-registry — [RENDERED] Curated catalog surfaced in Docker Hub /
   Docker Desktop. Requirements are security/documentation/Docker-build quality gates.
   Docker-built images get "cryptographic signatures, provenance tracking, SBOMs, and automatic
   security updates". **No monetization or payout for publishers is mentioned.** Repo: 546 stars,
   1.3k forks. Server count not stated on the repo page.

6. Cloudflare docs, in their own docs repo (rendered from raw.githubusercontent.com):
   - src/content/docs/agents/tools/payments/x402/charge-for-mcp-tools.mdx — [RENDERED]
     `withX402` + `this.server.paidTool("square", "Squares a number", 0.01 /* USD */, ...)`.
     X402Config = network (`base` prod / `base-sepolia` test), recipient wallet address,
     facilitator URL `https://x402.org/facilitator`. Unpaid call -> HTTP 402 with payment
     requirements; client pays, submits proof, gets the result. Free and paid tools can mix.
   - src/content/docs/agents/tools/payments/index.mdx — [RENDERED]
     x402 = "on-chain stablecoin payments (USDC on Base, Ethereum, Solana...)", created by
     Coinbase; MPP (Machine Payments Protocol) adds cards via Stripe and recurring billing and
     is backwards-compatible with x402. Both settle in USDC / via facilitator.
   - src/content/docs/ai-crawl-control/reference/worker-templates.mdx — [RENDERED] links
     "x402 payments — Gate resources, **charge for MCP tools**, add payments to coding agents".
   => Charging per MCP tool call is a first-class, documented, permitted capability at
   Cloudflare. It is GREEN on ToS. What it does not prove is that anyone pays.

7. Apify docs repo (apify/apify-docs), via GitHub code search — [RENDERED search matches]
   - sources/platform/actors/monetizing/pay_per_event.mdx: PPE gives "Unlimited revenue
     scalability" and "AI/MCP compatibility".
   - sources/academy/build-and-publish/why_publish.md: "Pay-per-event (PPE): ... (maximum
     flexibility, AI/MCP compatible, **priority store placement**)".
   - sources/academy/build-and-publish/how-to-build/actorization_playbook.mdx: "Your Actor can
     serve as a tool for AI agents through Apify's MCP server ... while you **earn 80% of all
     revenues**."
   - sources/platform/actors/publishing/quality_score.mdx: discovery surfaces are "Apify Store
     search" AND "The Apify MCP server `search-actors` tool used by external AI agents".
   - sources/platform/actors/monetizing/monthly-payouts.mdx and
     sources/legal/latest/terms/store-publishing-terms-and-conditions.md §10.3.2:
     minimum payout **USD 20 for PayPal and Wise, USD 100 for other methods**; below-minimum
     balances roll over and are forfeited after 12 continuous months. §10.1.5: Apify "reserve
     the right to suspend payouts ... if you fail to pass or maintain the **KYC** process".
   => This is the ONLY MCP-adjacent channel I could verify from primary sources that has a
   real, documented, revenue-sharing money path — and the repo already ships
   products/apify-il-open-data there.

8. https://raw.githubusercontent.com/mcccsm/x402-list-mcp/main/README.md — [RENDERED]
   x402-list.com tracks services accepting x402 and reports "on-chain-verified settlement
   volume per facilitator, not self-reported numbers" (tool `x402_facilitator_volumes`,
   today/7d/30d/all, USD + tx counts). The README publishes no figures. This is the right
   place to get *non-self-reported* x402 demand numbers. TO CLOSE: open https://x402-list.com
   (blocked here) or run that MCP server and read facilitator volumes.

## Snippet-level evidence (unverified — the source page was blocked)

Directory sizes, all [SNIPPET], WebSearch 2026-09-03:
- mcp.so ~20,222 servers (mid-2026) — via zplatform.ai / mcpize snippets.
- Glama 22,775 servers as of May 2026, "most being weekend projects" — snippet.
- Smithery "3,305+ servers" — snippet from mcpize.com (a competitor's marketing page).
- ">10,000 active MCP servers" from a 2026 production-MCP research paper — snippet.
- zplatform.ai says only 76 servers in the official registry pass its bar of "a working
  install method and real adoption" (2026-08-03) — snippet.
Reading: the ecosystem is tens of thousands of listings and a very thin layer of real ones.

Monetization, all [SNIPPET]:
- "fewer than 5% of 12,000 servers successfully monetized as of March 2026" — mcpize.com,
  a vendor selling monetization, so treat as marketing.
- Smithery: "creators pay $30/month and earn $0 from MCP server income" — mcpize.com snippet,
  i.e. a competitor describing Smithery. Directionally consistent with Smithery being a free
  directory + paid hosting, not a revenue-share store, but NOT confirmed.
- MCPize claims an 80/20 creator revenue share. Self-reported by MCPize.
- 21st.dev "hit $10K MRR in 6 weeks with zero marketing" via MCP-directory discovery; other
  devs "$50/month", "$2,000+", "$400 MRR from a Crypto Data MCP"; a dev.to post titled
  "Pricing an MCP Server in 2026: Why We Charge $19/mo When the Market Average is $0".
  All snippet-level, all self-reported, dev.to is blocked here.
- "Most MCP directories are free listing boards, and only a few support payments."
- "Developers often wonder why their server has free users but no revenue" — the install-to-
  revenue gap is the consensus complaint.
- x402 scale claims: "~69,000 active agents had processed 165M+ transactions worth $50M by
  April 2026", "10,000+ active public servers, 75+ Claude connectors, 97M monthly SDK
  downloads". Snippet only, provenance unclear, and $50M/165M tx = ~$0.30 average, i.e.
  micro-payments. Do NOT quote these numbers as fact.
- Claude Connectors Directory: submission is "self-serve and review-gated, with no separate
  paid tier"; remote-MCP submission now happens inside Claude.ai under **organization admin
  settings**, requiring "a Team or Enterprise organization. Individual plans do not have the
  required admin settings"; a missing/incomplete privacy policy is an immediate rejection;
  you must prove you own the API/domain the connector touches. All [SNIPPET] — claude.com is
  egress-blocked. TO CLOSE: open https://claude.com/docs/connectors/building/submission

## Verdict on the criterion
- **How many are listed:** tens of thousands of listings across mcp.so / Glama / Smithery
  (20k+ each, snippet-level); the *official* registry publishes no count and no stats endpoint,
  and third-party filtering suggests only double digits meet an "install + adoption" bar.
- **Does anyone pay for MCP servers:** rarely, and essentially never *through a registry*.
  The official registry schema has no price field at all. Docker's catalog has no payouts.
  Payment happens beside the registry — x402/MPP per tool call (Cloudflare, GREEN, real code
  path, unproven demand), or an ordinary SaaS key/subscription, or a marketplace that already
  had billing before MCP existed (Apify).
- **Hosted-MCP business models:** three shapes. (a) Hosting-as-cost: Smithery/Cloudflare —
  the platform charges the developer, the developer earns nothing from the platform.
  (b) Marketplace revenue share: Apify 80/20, verified in Apify's own docs, with MCP used as a
  *discovery surface* (`search-actors`) into an existing billing system. (c) Per-call payments:
  x402/MPP, technically permitted and documented, buyer-side adoption unproven.
- **Distribution -> money or attention:** for the registries themselves, **attention only**.
  A registry listing is free traffic with no billing rail attached. The only converted path I
  could verify from primary sources is the marketplace whose billing predates MCP.

## Dead ends (do not re-search)
- Building an MCP directory/registry of our own. 20k+ listings exist across at least four
  incumbents; the money model would be sponsored placement, i.e. selling attention, and we
  have no audience. Zero.
- Expecting the official MCP registry, or Docker's catalog, to pay anything. Verified from
  their own schema/repo: no payment concept exists.
- Smithery-style hosted MCP as an income line: the flow of money is developer -> platform.
- Any plan that requires listing in Anthropic's Connectors Directory as the revenue mechanism:
  no revenue share exists there, and it appears to require a Team/Enterprise org plus proof of
  API ownership. It is a distribution ask, not an income line.
