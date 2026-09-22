# 07 — The "AI money" / agent-automation side of TikTok: what is promoted, what is real, what we add

**Scout dimension:** agent frameworks, automation stacks, scraping kits, "AI employee" templates, n8n/Make packs,
browser agents, content pipelines — the genre the owner pointed at with
[harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo). Faceless-video generators are covered
in depth by a sibling scout; this file deliberately goes wider and does not repeat that work.

**Date of research:** 2026-09-03. **Researcher:** Opus 5 (routine research sweep, per `CLAUDE.md` model routing).

## How to read this file

TikTok is not directly crawlable from this container. Everything below was mined indirectly and each claim says how:

| Tag | Meaning |
|---|---|
| `[api]` | Pulled live from the GitHub REST search API on 2026-09-03. Star counts, forks, open issues, `pushed_at`, license and `homepage` are first-party facts as of that timestamp. |
| `[first-party]` | Vendor's own docs/blog/changelog (Apify, Vercel, Coinbase CDP, LiteLLM). |
| `[press]` | Reported by a security vendor or trade press with a named primary researcher. |
| `[secondary]` | SEO/marketing blog. Directionally useful, numbers **not** trustworthy. |
| `[promoted]` | Seen being promoted (TikTok discover pages, Gumroad listings, course landing pages). Claim only — **not** verified. |

Confidence is stated per claim. "Seen promoted" is never upgraded to "verified" anywhere in this document.

**Constraint I applied to every recommendation:** software-only, no owner manual work beyond the existing one-time
checklist, no paid infrastructure before we earn, no platform-ToS violation. Anything failing one of those is in the
REJECTED section with the reason, not silently dropped.

---

# PART A — THE ADD LIST

Every row names the exact file or directory to create. "Cost" is my build estimate in agent-hours plus any money.
Nothing here requires the owner to do anything.

## P0 — build first

| # | File / directory | What it does | Why it beats what we have | Cost |
|---|---|---|---|---|
| P0-1 | `src/revenue/ledger.ts` (change) + `src/__tests__/revenue/ledger-invariant.test.ts` | Make `externalId` **mandatory** for any entry of kind `revenue`. Reject the write, don't warn. | **This is a live hole in the constitution.** `MISSION.md` rule 2 says a shekel counts only "when it is recorded in `revenue_ledger` with a platform transaction id", but `recordEntry` does `input.externalId?.trim() \|\| null` — a revenue row with no transaction id is accepted today. A director can therefore book imaginary money and every auditor downstream re-derives from it. | ~1h, ₪0 |
| P0-2 | `products/x402-il-api/src/mcp.ts` + `src/bazaar.ts` | Expose the six existing paid endpoints as **paid MCP tools** and set the CDP facilitator's bazaar extension to `discoverable: true`. | We built a paid API that no agent can find. Discovery for x402 is the Bazaar, and the Bazaar's catalogue **builds itself from settlements** — a service is listed once it settles through the CDP facilitator with the bazaar extension on `[first-party]`. Vercel's `x402-mcp` puts a price on an MCP tool in one call `[first-party]`. We already have `.well-known/x402.json`, `payTo`, a facilitator hook and 15 passing tests — this is wiring, not a new product. Zero KYC, so it needs nothing from the owner. | ~6h, ₪0 (CDP facilitator: 1,000 free settlements/mo, already priced into `config.ts`) |
| P0-3 | `src/revenue/watchdog.ts` + `src/__tests__/revenue/watchdog.test.ts` | **No-progress watchdog**, separate from liveness. A line in `building` for N ticks with zero new artifacts (no commit under its `products/` dir, no KPI row, no ledger row) is marked `stalled`, its budget is released, and the board report names it. | `heartbeat.ts` proves an agent is *alive*. Every documented 2026 stall is an agent that was alive and doing nothing: hermes-agent#15654 (cached agent reuse silently disables the inactivity timeout, heartbeat reads "iteration 0/60" forever), openclaw#92082 (heartbeat delivery wedge retries forever with no operator recovery path), paperclip#4659 (`agents.status` sticks on a dead pid, no watchdog reconciliation) `[api]`. We have no test that distinguishes "working" from "warm". | ~4h, ₪0 |
| P0-4 | `src/skills/audit.ts` + `skills/agent-supply-chain/SKILL.md` + `src/__tests__/supply-chain.test.ts` | Admission control for anything third-party we install: pinned commit SHA required; static scan for install-time side effects (`postinstall`, `curl \| sh`, `.pth` files, base64 blobs, network calls at import); a declared read/write manifest; and a CI assertion that no production dependency ships a lifecycle script. | Our `skills-hardening.test.ts` defends against **prompt injection inside a skill's text**. It does not defend against a skill or package that is malicious **before the model ever reads it**. Two 2026 incidents are exactly this: Koi Security found 341 malicious skills out of 2,857 on ClawHub (12% of the registry, campaign "ClawHavoc", mostly AMOS stealer), rising to 824 of ~10,700 as the market grew `[press]`; and litellm 1.82.7/1.82.8 shipped a `litellm_init.pth` that executed on *every Python process start*, published 2026-03-24 after the attacker compromised Trivy in LiteLLM's CI `[first-party: docs.litellm.ai security update]`. The colony's whole growth path is "install more skills". | ~6h, ₪0 |
| P0-5 | `src/revenue/connectors/apify-x402.ts` | **Buy-side**: let our own workers run Apify Actors paying USDC over x402, with no Apify account, no API key and no billing profile. | The Apify line is `awaiting_setup` behind the owner's KYC — but that gate is on the **sell** side only. Apify put 20,000+ Actors behind x402 on Base (changelog 2026-06-30, blog 2026-07-21): "no Apify account, billing, or API key required", pay-per-result, e.g. ~$1 → ~350 Google Maps records `[first-party]`. We already have `x402Fetch` in `src/conway/x402.ts` and a funded wallet. This unblocks every research/data task that is currently waiting on a human. | ~3h, ₪0 + usage in USDC from the agent's own wallet |

## P1 — build next

| # | File / directory | What it does | Why it beats what we have | Cost |
|---|---|---|---|---|
| P1-1 | `products/mcp-il-tools/` (npm package + `server.ts`) | The Israeli/Hebrew validators (ת״ז, phone, bank, Hebrew date, transliteration) as a **free, publicly listed MCP server**, with the paid x402 tier as the upgrade path. | We have exactly one distribution channel for `x402-il-api` today: nobody knows it exists. A free MCP server on npm + the public registries is a top-of-funnel that costs ₪0 and is discovered by the same buyers. Free tool → paid tool is the only funnel here that isn't a course. | ~8h, ₪0 |
| P1-2 | `src/revenue/cost-attribution.ts` + `src/__tests__/revenue/cost-attribution.test.ts` | Attribute inference and tool spend to the **line** that caused it, so `allocateBudget()` divides real cost, not the seeded `budgetMonthlyCents`. | `rules.ts:allocateBudget` currently allocates from a static budget field. Per-agent, per-workflow attribution at request granularity is the acknowledged industry gap — Anthropic's Enterprise Analytics API (Mar 2026) adds per-user but not per-request, and multi-agent attribution needs custom tooling `[secondary]`; agentic runs consume 5–30× the tokens of a chat turn `[secondary]`. Without this, a losing line can look profitable because its compute is charged to the pool. | ~6h, ₪0 |
| P1-3 | `src/revenue/irreversible.ts` + tests | A typed **circuit breaker for irreversible actions** (refunds, payouts, transfers, account deletion, publishing): per-action rate ceiling, a cumulative-per-hour ceiling, and a hard stop that requires a second independent rule to pass. | We cap *transfer* spend (`policy-rules/financial.ts`) but nothing caps *count of irreversible actions*. The canonical 2026 failure is a support agent that issued **247 refunds** before anyone noticed, triggered by one injected instruction `[secondary]`. Our x402 sell side and wallet make the same class of mistake available to us. | ~5h, ₪0 |
| P1-4 | `skills/revenue-agent-market/SKILL.md` | Director playbook for the agent-tooling market as a *revenue line*: what to publish free (MCP servers, skills), what to price (x402 per-call), how to read Bazaar/registry demand before building, and the kill criteria. | `skills/revenue-paid-apis` covers the API line but predates the MCP/x402 discovery layer becoming real (Apify 20k Actors, Vercel `x402-mcp`, Cloudflare Monetization Gateway, all Jun–Jul 2026). This is the one genuinely new *channel* in the whole genre. | ~3h, ₪0 |
| P1-5 | `src/revenue/plan-gate.ts` + orchestrator hook | Port the **deterministic completion gate** idea into our `task_graph`: a task cannot report done while an `in_progress` phase exists on disk; the gate reads the file, not the model's claim; bounded block cap; stall detection from ledger progress rather than file mtime. | This is the mechanism behind `OthmanAdi/planning-with-files` — 26,604★, 2,220 forks, pushed 2026-09-03 `[api]` — and it exists because "the model says it's done" is the single most common lie in long agent runs. Our orchestrator trusts worker self-report. | ~6h, ₪0 |
| P1-6 | `src/revenue/publish-guard.ts` + tests | Every outbound artifact we publish (store listing, README, price page, product copy) must be **re-derived from ledger/code facts**; any claim not backed by a fact in the repo blocks the publish. | `constitution.md` forbids "selling a feature that does not exist" and we already shipped that bug once — the il-biz-tools Pro tier sold a logo that did not exist (`logs/CHECKPOINT.md`). A rule that caught it automatically is worth more than the fix. | ~5h, ₪0 |

## P2 — worth doing, not urgent

| # | File / directory | What it does | Why | Cost |
|---|---|---|---|---|
| P2-1 | `.mcp.json` / session config: add `Scrapling` MCP | Adaptive scraping with an MCP server, MIT-ish, 78,159★ / 7,853 forks / 10 open issues, pushed 2026-09-03 `[api]`. | Directly serves the Apify Actors line (build + repair Actors) and the research sweeps. Self-hosted, no subscription. Must still pass P0-4 admission control. | ~1h |
| P2-2 | `.mcp.json`: add `oraios/serena` (28,769★) and/or `DeusData/codebase-memory-mcp` (41,990★) `[api]` | Semantic code retrieval / persistent code knowledge graph over this repo. | Cuts tokens per session on a repo this size; the routing rule says token cost is a real constraint. Pick one, measure, keep the winner. | ~2h |
| P2-3 | `products/n8n-il-pack/` | A **narrow** n8n pack: Israeli invoicing/VAT/Bituach-Leumi flows in Hebrew, plus a community node for an Israeli accounting SaaS. Sold on Gumroad/Payhip/Lemon Squeezy. | The generic n8n-template market is a graveyard of $5 "8,000+ workflow" bundles `[secondary]` — but the Israeli-format slice is unserved and matches the line we already have expertise in (`il-biz-tools`). Only build after `il-biz-tools` shows paying customers. | ~12h, ₪0 |
| P2-4 | `src/revenue/connectors/bazaar-metrics.ts` | Read x402 Bazaar / x402scan listings and settlement volume to size demand **before** building an endpoint. | Turns "we think agents want this" into a number. Also feeds `criteria.ts` sweeps. | ~4h, ₪0 |
| P2-5 | `skills/agent-eval-harness/SKILL.md` + `src/__tests__/agent/adversarial/` | A negative-test corpus: prompt injection, tool-schema drift, swallowed exceptions, contradictory instructions, refund/payout traps. | "Nearly every agent test suite is positive-test-heavy" `[secondary]`, and OWASP's 2026 work puts prompt injection at the centre of agentic risk `[press]`. We have `injection-defense.test.ts` for inputs; we have nothing that fuzzes the *revenue* loop adversarially. | ~8h, ₪0 |
| P2-6 | `products/x402-il-api/src/routes/compliance.ts` | Paid endpoint: AI-content disclosure checker (TikTok's mandatory AI label since Mar 2026; YouTube's 2026 "inauthentic content" monetization rules) `[secondary]`. | Software-only, priced per call, sold to exactly the audience this whole genre creates. Adds a route to a product that already exists. | ~4h, ₪0 |

**Everything in this table is ₪0 in new infrastructure.** Nothing needs the owner. Total P0 ≈ 20 agent-hours.

---

# PART B — EVIDENCE

## 1. The repos and tools that actually go viral in this genre

All numbers pulled live from the GitHub REST search API on **2026-09-03** `[api]`.

### 1a. Real engineering (code that does the thing)

| Repo | ★ | Forks | Open issues | Last push | License | What it is |
|---|---|---|---|---|---|---|
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 203,202 | 60,525 | 1,144 | 2026-09-03 | fair-code | The workflow engine the whole "automation guru" economy sits on |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | 175,915 | 9,633 | 587 | 2026-09-03 | — | Scrape/search API for agents |
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | ~120,100 | — | — | 820 commits on main | MIT | The owner's example. Python/Streamlit/FastAPI/FFmpeg/faster-whisper. Real code; needs an LLM key, a TTS key and stock footage (Pexels/Pixabay free tiers) `[api + repo page]` |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 112,129 | 12,335 | 401 | 2026-09-03 | MIT | The browser-agent everyone demos |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | 81,170 | 8,373 | 172 | 2026-09-03 | — | LLM-friendly crawler |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | 78,159 | 7,853 | 10 | 2026-09-03 | — | Adaptive scraping + MCP server |
| [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | 70,302 | 8,378 | 899 | 2026-09-03 | — | Agent meta-harness / swarms |
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | 64,635 | 7,574 | 721 | 2026-09-03 | — | Agent memory layer |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | 58,035 | 8,321 | 709 | 2026-09-03 | — | Role-playing multi-agent framework |
| [BerriAI/litellm](https://github.com/BerriAI/litellm) | 57,916 | 11,127 | 4,924 | 2026-09-03 | — | LLM gateway — and the 2026 supply-chain casualty |
| [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 50,783 | 3,560 | 93 | 2026-09-03 | — | Official Chrome DevTools MCP |
| [agno-agi/agno](https://github.com/agno-agi/agno) | 42,022 | 5,864 | 1,303 | 2026-09-03 | — | Agent platform |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | 40,979 | 6,914 | 743 | 2026-09-03 | — | Durable agent graphs |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | 34,141 | 3,684 | 884 | 2026-09-03 | — | Self-hostable LLM observability/evals |
| [oraios/serena](https://github.com/oraios/serena) | 28,769 | 1,945 | 164 | 2026-09-03 | — | Semantic code MCP |
| [mastra-ai/mastra](https://github.com/mastra-ai/mastra) | 27,663 | 2,723 | 540 | 2026-09-03 | — | TypeScript agent framework (closest to our stack) |
| [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) | 26,604 | 2,220 | 8 | 2026-09-03 | — | File-based plans, crash recovery, deterministic completion gate |
| [activepieces/activepieces](https://github.com/activepieces/activepieces) | 24,203 | 4,135 | 520 | 2026-09-03 | — | n8n alternative, ~400 MCP servers |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | 22,922 | 2,152 | 218 | 2026-09-03 | — | Vision browser RPA |
| [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) | 22,823 | 3,636 | 61 | 2026-09-03 | — | Claude builds n8n workflows for you |
| [triggerdotdev/trigger.dev](https://github.com/triggerdotdev/trigger.dev) | 16,196 | 1,435 | 349 | 2026-09-03 | — | Managed agent/workflow scheduling |
| [a5c-ai/babysitter](https://github.com/a5c-ai/babysitter) | 1,763 | 103 | 389 | 2026-09-03 | — | "Enforces obedience on agentic workforces"; deterministic self-orchestration. Small but the *idea* is the one we want |

Confidence: **high** on every number (live API). Confidence on "these are the ones TikTok pushes": **medium** — corroborated by
TikTok discover pages for `n8n-workflow-automation-templates`, `github-repository-n8n`, `tiktok-automation-2026-github`,
`agency-agents-github-awesome` `[promoted]`, and by the search result that TikTok users "discovered GitHub repos with over
1,000 free n8n workflows" `[secondary]`.

### 1b. Screenshot-and-a-link (stars, not engineering)

These are the ones to *not* copy. The tell is: no code, no license or `NOASSERTION`, a monetised homepage, or an
abandoned `pushed_at`.

| Repo | ★ | Forks | Tell |
|---|---|---|---|
| [enescingoz/awesome-n8n-templates](https://github.com/enescingoz/awesome-n8n-templates) | 25,126 | 6,422 | **The `homepage` field is `https://n8n.partnerlinks.io/h1pwwf5m4toe` — an n8n affiliate link.** License `NOASSERTION`. This is the single cleanest verified example in this whole file of "affiliate funnel wearing a repo's clothes" `[api]` |
| [wassupjay/n8n-free-templates](https://github.com/wassupjay/n8n-free-templates) | 6,171 | 1,643 | No license, last push **2025-08-01** — 13 months stale while still collecting stars `[api]` |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 33,672 | 3,556 | No primary language: it is a list `[api]` |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | 25,446 | 3,601 | "380 skills, 30+ agents, 70+ commands" — quantity as the pitch `[api]` |
| [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) | 45,893 | 6,707 | 45.9k stars, created 2026-01-14, **1 open issue**. A repo with that much attention and one open issue is either perfect or not really used `[api]` |
| [obra/superpowers](https://github.com/obra/superpowers) | 281,034 | 25,180 | Largest in the dataset by far, primary language "Shell". Genuinely influential, but the star count is a fashion signal, not an engineering one `[api]` |

**Rule I'd apply going forward:** in this genre, stars are marketing. Rank by
`forks ÷ stars`, `open_issues` (evidence of real users hitting real bugs), `pushed_at`, and whether `homepage` points at
a partner/affiliate link. That is a four-field check we can automate.

## 2. The business patterns being taught, and whether the economics survive

| Pattern | Claimed model | Reality check | Verdict |
|---|---|---|---|
| **AI Automation Agency (AAA)** — build n8n/Make flows for local businesses on a retainer | $2k–$10k/mo retainers; $1.5k–$5k setups; $5k–$15k Zapier→n8n migrations; consultants at $150–350/h `[secondary]` | The Reddit consensus is that **the automations are legitimate and the courses are the grift** `[secondary]`. The line erased from every pitch deck is *human review* — someone must check what the automation did and repair integrations when APIs change. Model+tooling is quoted at $250–$1,000/mo; the labour is not quoted at all. | **Reject as a line.** Fails MISSION rule 1: it is client calls and human review. The *tooling* under it is still worth building. |
| **Selling n8n/Make workflow packs** | "$47K last year from the same 3 workflows" `[secondary]` | Same genre of source also states the Gumroad n8n space is "a graveyard of bloated $5–$20 mega-bundles promising 8,000+ workflows … that mostly sit unbought" `[secondary]`. Both claims come from marketing blogs; the $47K figure has no verifiable source. Our own `docs/INCOME_PLAN.he.md` has the harder number: Gumroad median ≈ **$72/month**, 44% of products earn **$0**. | **P2 only, and only narrow.** A generic pack is worthless; an Israeli-format pack has no competition. |
| **AI voice agent / "AI receptionist" for local business** | End-customer $0.25–$0.48/min or $199–$999/mo; agency margin "60%+ at $397/mo" `[secondary]` | True per-minute cost is $0.09–$0.20 all-in, or $0.12–$0.25 BYOK after provider stacking; a 1.8–11.6% margin gap compounds to $500–$3,000/mo lost at 50 clients `[secondary]`. Churn: businesses that skip setup churn inside 60 days. | **Reject as a line** (sales calls, onboarding, support = humans). Keep the **cost calculator** as a sellable micro-tool. |
| **Faceless video farms** (MoneyPrinterTurbo genre) | Ad revenue + affiliate at scale from generated shorts | YouTube's 2026 YPP changes demonetise "inauthentic content" — mass-produced, generic, repetitive — and thousands of AI-reliant channels were removed from the programme; TikTok has required the AI-generated label on all AI video since Mar 2026 and ties Creator Fund eligibility to disclosure `[secondary]`. | **Reject.** Also needs accounts in the owner's name. (Sibling scout owns the detail.) |
| **Selling scraped leads** (Google Maps → cold email) | $X per 1,000 verified local-business leads | Google Maps Platform ToS §3.2.3(a) is literally titled "No Scraping"; US case law protects public-data scraping from *criminal* liability but not from *contract* liability, and reselling escalates it. Cold email in 2026: 50–100/mailbox/day safe ceiling, <0.3% complaints and <2% bounces enforced by Google/Yahoo/Microsoft `[secondary]`. | **Reject.** Fails MISSION rule 4 outright. |
| **Selling agent skills / SKILL.md packs** | Marketplace listings, 70/30 splits `[secondary]` | Agensi takes 30% and pays via **Stripe Connect** — and `docs/INCOME_PLAN.he.md` §14 already establishes Stripe is not open to Israeli accounts. Self-hosted GitHub marketplace + own checkout is the only Israeli-payable route. | **P2**, via Gumroad/Payhip/Lemon Squeezy only. |
| **x402 / agent-pays-agent** | Per-call USDC micropayments, no KYC | The one pattern in this file where the *infrastructure* is verified first-party and the *demand* is still small. Reported: ~69,000 active agents, 165M+ transactions, ~$50M, median call price $0.028 as of Apr 2026 `[secondary]`; but Apify (20k Actors, Jun–Jul 2026), Vercel `x402-mcp` and Cloudflare's Monetization Gateway are all first-party confirmed. | **Keep and push (P0-2).** Our existing line 5. |

**The pattern behind the patterns:** in this genre the money reliably flows *to the person selling the explanation*, not
through the automation. The asset that holds value is the tool, not the audience.

## 3. Demand signals — 30 candidates a software-only operation could build and sell

Filter applied: buildable by us alone, sellable without the owner talking to anyone, no ToS violation.
"Payable" = can reach an Israeli seller today, using the rails already established in `docs/INCOME_PLAN.he.md`
(x402/USDC and Telegram Stars need no KYC; Paddle, Lemon Squeezy, PayPal Israel, Payoneer/Etsy, Gumroad, Payhip do;
**Stripe-only platforms do not**).

| # | Candidate | Evidence it is wanted | Payable to IL seller | Note |
|---|---|---|---|---|
| 1 | x402 paywall wrapper for any MCP tool | Vercel shipped `x402-mcp` precisely for this `[first-party]` | ✅ x402 (no KYC) | We are one file from it — P0-2 |
| 2 | "Is my x402 service discoverable?" linter + competitor price scan | Bazaar catalogue self-builds from settlements; x402scan is a community registry `[first-party/secondary]` | ✅ x402 | P2-4 |
| 3 | Per-request cost attribution across a multi-agent run | Anthropic's Mar-2026 Enterprise Analytics API adds per-user, not per-request; multi-agent attribution "requires additional tooling" `[secondary]` | ✅ Paddle/LS | P1-2 (internal first, product second) |
| 4 | No-progress watchdog for agent fleets | hermes-agent#15654, openclaw#92082, paperclip#4659 `[api]` | ✅ | P0-3 |
| 5 | Pre-install scanner for agent skills / MCP servers | ClawHavoc: 341/2,857 → 824/10,700 malicious `[press]` | ✅ | P0-4 |
| 6 | MCP registry access-control + audit-trail shim | Registries have "no server-level restrictions, no audit trail, no access governance" `[secondary]` | ✅ | Enterprise-shaped; slow sale |
| 7 | Deterministic completion gate / plan attestation | `planning-with-files` at 26.6k★ solving only this `[api]` | ✅ | P1-5 |
| 8 | Israeli invoice/receipt/allocation-number MCP server | Our own shipped tool; the allocation-number threshold moved 4× since May 2024 (`logs/CHECKPOINT.md`) | ✅ Paddle | Extends a core line |
| 9 | Hebrew/RTL PDF rendering as a paid API | Already line 4 in the income plan | ✅ x402 + marketplace | Exists, needs distribution |
| 10 | n8n community node for Israeli accounting SaaS | n8n's own board is where missing nodes are requested and upvoted; community nodes ship on npm `[secondary]` | ✅ Gumroad/Payhip | P2-3 |
| 11 | "Which of my workflows broke" — schema-drift + credential-expiry monitor | The erased line item in every AAA pitch is repairing integrations when APIs change `[secondary]` | ✅ | Strong, unserved |
| 12 | Prompt-injection red-team corpus for tool-using agents | OWASP 2026 centres prompt injection in agentic risk `[press]`; suites are "positive-test-heavy" `[secondary]` | ✅ | P2-5 |
| 13 | Irreversible-action circuit breaker library | The 247-refund incident from one injected sentence `[secondary]` | ✅ | P1-3 |
| 14 | Per-tenant LLM budget guard + kill switch | "A single runaway agent can consume $50–500 before anyone notices"; a $6,531 AWS bill from one scanning agent `[secondary]` | ✅ | Partially exists in `policy-rules/financial.ts` |
| 15 | Agent-memory staleness / temporal-query eval kit | Hardest open problems named as cross-session identity, temporal abstraction, staleness `[secondary]` | ✅ | Research-heavy |
| 16 | AI-content disclosure compliance checker | TikTok label mandatory since Mar 2026; YouTube inauthentic-content demonetisation `[secondary]` | ✅ x402 | P2-6 — sell to the genre itself |
| 17 | Apify Store gap-finder (under-served categories) | Competing "Store Analyzer" Actors already sell on Apify `[secondary]`; top-5 categories are heavily concentrated | ✅ Apify/PayPal | Needs the KYC gate |
| 18 | Apify rental → pay-per-usage migration helper | Apify is retiring rental pricing: no new rental Actors from 2026-04-01, full retirement 2026-10-01 `[secondary]` | ✅ | **Time-boxed — expires Oct 2026** |
| 19 | Dependency admission gate (block postinstall / `.pth`) | LiteLLM `.pth` backdoor, 2026-03-24 `[first-party]` | ✅ | Part of P0-4 |
| 20 | Payout-eligibility checker for digital sellers by country | Our own §14 research; "does X pay my country" is the recurring first question | ✅ | Cheap, evergreen, honest |
| 21 | VAT / Bituach Leumi calculators sold per call as MCP tools | Existing free tools in `il-biz-tools` already draw the traffic | ✅ Paddle + x402 | Reuse, don't rebuild |
| 22 | `.well-known/x402.json` validator | We wrote one by hand; the spec is spreading | ✅ x402 | Trivial, good top-of-funnel |
| 23 | True per-minute voice-agent TCO calculator | $0.09–$0.20 all-in vs $0.12–$0.25 BYOK, agencies mispricing by 1.8–11.6% `[secondary]` | ✅ | Sell the calculator, not the agency |
| 24 | Structured-error / retry-contract library for MCP tools | Production-MCP research names structured error semantics, adaptive tool budgeting and observability as missing `[secondary]` | ✅ | Developer-tool sale |
| 25 | Golden-path eval template (20–30 conversations) as a product | "Most production agents rely on internal sets of 20–30 golden-path conversations", bespoke and manual `[secondary]` | ✅ Gumroad | Template, not SaaS |
| 26 | Agent run "receipt" generator (what it did, cost, changed) | Registries lack audit trails; enterprises need inspect/correct/delete at launch `[secondary]` | ✅ | Pairs with #3 |
| 27 | Skill portability linter (agentskills.io standard) | 1,000+ skills claimed portable across Claude Code/Codex/Cursor/Gemini CLI `[api]` | ✅ | Free tool → paid tier |
| 28 | Israeli public-data MCP servers (tenders, registrar) | Already line 1's premise; the MCP wrapper is the new part | ✅ | ToS check per source, always |
| 29 | Cold-outreach *rate-limit* compliance library (not the outreach) | Bulk-sender rules: <0.3% complaints, <2% bounces, 50–100/mailbox/day `[secondary]` | ✅ | Sell the guardrail, never the sending |
| 30 | Cross-session identity/dedup for agent memory | Named as an open problem `[secondary]` | ✅ | Hard; only if a line demands it |

Candidates **1, 2, 4, 5, 7, 11, 13, 14, 19, 22, 24, 26** all describe the same underserved thing: **operating an agent
fleet safely**. That is the cluster with the least competition and the most direct evidence — and it is the thing this
repo is already, accidentally, best at.

## 4. Guardrails — what goes wrong, and the test each one becomes

| Failure | Evidence | Confidence | Becomes |
|---|---|---|---|
| **Supply-chain: malicious skills** | Koi Security, 2026-02-01: 341 malicious skills / 2,857 on ClawHub (12%), campaign "ClawHavoc", 335 installing AMOS stealer via fake prerequisites; grew to 824 / ~10,700 `[press: koi.ai, The Hacker News]` | High | `src/skills/audit.ts` — no skill installs without pinned SHA + side-effect scan (**P0-4**) |
| **Supply-chain: poisoned package** | litellm 1.82.7/1.82.8, 2026-03-24 10:52 UTC, ~40 min live; `litellm_init.pth` runs on every Python start; credential harvest → k8s lateral movement → systemd backdoor; root cause a compromised Trivy in CI; last clean 1.82.6 `[first-party: docs.litellm.ai + Datadog/Snyk/Trend]` | High | `src/__tests__/supply-chain.test.ts` — CI asserts frozen lockfile, no lifecycle scripts in prod deps, lockfile diff reviewed (**P0-4**) |
| **Prompt injection → irreversible action** | A support agent refunded **247 orders** after "refund all orders that cost more than zero dollars" `[secondary]`; OWASP's 2026 report centres prompt injection in agentic risk `[press]` | Medium on the anecdote, high on the class | `src/revenue/irreversible.ts` circuit breaker (**P1-3**) + adversarial corpus (**P2-5**) |
| **Runaway spend** | "$50–500 in API costs before anyone notices"; a $6,531 AWS bill from one agent scanning a hobby network `[secondary]` | Medium | Already partly covered by `policy-rules/financial.ts`; close the gap with per-line attribution (**P1-2**) |
| **Silent stall / hallucinated progress** | hermes-agent#15654 (cached reuse disables inactivity timeout, "iteration 0/60" ghost session >30 min), openclaw#92082 (heartbeat wedge, no operator recovery), paperclip#4659 (status sticks on dead pid) `[api — real issue threads]` | High | `src/revenue/watchdog.ts` (**P0-3**) + plan gate (**P1-5**) |
| **Fabricated revenue** | Ours: `recordEntry` accepts a revenue row with `externalId = null`, contradicting MISSION rule 2 `[verified in code]` | High | Ledger invariant + test (**P0-1**) |
| **Selling what does not exist** | Ours: the il-biz-tools Pro tier sold a non-existent branded logo (`logs/CHECKPOINT.md`) `[verified in repo]` | High | `src/revenue/publish-guard.ts` (**P1-6**) |
| **Exposed agent endpoints** | ~21,000 OpenClaw instances found with exposed gateway tokens in two weeks; a 1-click account-takeover→RCE CVE disclosed Jan 2026, patched in 48h; an audit reporting 512 vulnerabilities (8 critical) `[press]` | Medium-high | Never expose the automaton's control plane; assert in tests that no server binds `0.0.0.0` without an auth guard |
| **Platform bans / demonetisation** | YouTube 2026 inauthentic-content rules removing AI-reliant channels from YPP; TikTok mandatory AI label since Mar 2026 `[secondary]` | Medium | Encode as kill criteria in any content line's playbook: a policy change is a kill trigger, not a "we'll adapt" |
| **Marketplace policy drift** | Apify retiring rental pricing (no new rentals 2026-04-01, full retirement 2026-10-01) `[secondary]` | Medium | A dated `platformPolicyReview` field per line; the board re-checks on a schedule instead of discovering it at payout |

## 5. MCP servers, skills and agent tooling worth adding *here*

| Tool | URL | ★ `[api]` | What it does for us | Verdict |
|---|---|---|---|---|
| `x402-mcp` (Vercel) | vercel.com/blog/introducing-x402-mcp-open-protocol-payments-for-mcp-tools | n/a | Puts a price on an MCP tool in one function call; ~100–200ms settlement, minimums under $0.001 `[first-party]` | **Adopt — P0-2** |
| x402 Bazaar (Coinbase CDP) | docs.cdp.coinbase.com/x402/bazaar | n/a | Discovery. Enable the bazaar extension with `discoverable: true` and the catalogue lists us from settled payments `[first-party]` | **Adopt — P0-2** |
| Apify x402 | blog.apify.com/introducing-x402-agentic-payments/ | n/a | 20,000+ Actors payable in USDC on Base with no account `[first-party]` | **Adopt (buy side) — P0-5** |
| Scrapling | github.com/D4Vinci/Scrapling | 78,159 | Adaptive scraping + MCP; feeds the Actors line and research sweeps | **Adopt — P2-1** (after P0-4 audit) |
| serena | github.com/oraios/serena | 28,769 | Semantic code retrieval MCP; cheaper sessions on a repo this size | **Trial — P2-2** |
| codebase-memory-mcp | github.com/DeusData/codebase-memory-mcp | 41,990 | Persistent code knowledge graph, single static binary | **Trial — P2-2** (pick one of the two) |
| chrome-devtools-mcp | github.com/ChromeDevTools/chrome-devtools-mcp | 50,783 | Official; verifying our own deployed sites without a browser farm | **Adopt if we get a deploy** |
| planning-with-files | github.com/OthmanAdi/planning-with-files | 26,604 | Don't install — **port the mechanism**: `task_plan.md`/`findings.md`/`progress.md`, SHA-256 attestation, Stop-hook gate holding while an `in_progress` phase exists, stall detection from ledger progress not file mtime `[first-party README]` | **Port — P1-5** |
| babysitter | github.com/a5c-ai/babysitter | 1,763 | Same family: deterministic, hallucination-free self-orchestration for agent workforces | **Read for design, don't depend on** (389 open issues) |
| n8n-mcp | github.com/czlonkowski/n8n-mcp | 22,823 | Only if P2-3 (the Israeli n8n pack) is greenlit | **Defer** |
| langfuse (self-host) | github.com/langfuse/langfuse | 34,141 | Traces/evals; useful but it is infrastructure we'd run before earning | **Defer until a line is live** |
| Context7 | already attached to this session | 61,558 | Current library docs; stops us writing against stale APIs | **Already have — use it** |

---

# PART C — REJECTED, WITH REASONS

| Rejected | Why |
|---|---|
| **Faceless video content farms** (MoneyPrinterTurbo as a *business*, not as code) | YouTube's 2026 inauthentic-content rules demonetise mass-produced/repetitive AI video; TikTok requires the AI label and ties Creator Fund eligibility to disclosure. Also needs platform accounts in the owner's name. The repo itself is fine engineering — the business under it is not. |
| **AI Automation Agency (services on retainer)** | Requires client discovery calls, onboarding and ongoing human review. Fails MISSION rule 1 ("the owner does not talk to customers") at the first step. |
| **Any course, cohort, Skool community or "AAA blueprint"** | This is the actual product being sold in this genre and it is a funnel, not a business. Selling income promises we cannot substantiate violates `constitution.md`. Non-negotiable. |
| **Affiliate-link template repos** (the `awesome-n8n-templates` shape) | Verified: that repo's `homepage` is an n8n partner link `[api]`. It is an affiliate funnel presented as a library. We can publish free resources, but never with the resource existing only to carry the link. |
| **"8,000+ n8n workflows" mega-bundles** | Mostly re-uploaded free templates. Charging for something already free is explicitly a violation, not a TODO (`constitution.md`). |
| **Google Maps / Instagram / TikTok / LinkedIn scraping Actors** | Google Maps Platform ToS §3.2.3(a) "No Scraping"; the others are personal data behind platform terms. These are literally the top-5 Apify categories by users — which is exactly why we don't. `portfolio.ts` already says "never scrape personal data or sites whose terms forbid it"; this keeps that promise. |
| **Scraped-lead resale + cold email at volume** | ToS + GDPR exposure, plus 2026 bulk-sender enforcement (<0.3% complaints, <2% bounces, 50–100/mailbox/day). And it is outreach to humans. |
| **AI voice agent / receptionist agency** | Setup, onboarding and support are human work; churn inside 60 days for clients who skip setup. Keep the cost calculator, drop the agency. |
| **OpenClaw-style always-on personal agent in messaging apps** | ~21,000 instances with exposed gateway tokens in two weeks, a 1-click ATO→RCE CVE, and 12% of its skill marketplace malicious. We would be adopting a documented breach surface. |
| **Agensi / any Stripe-Connect-only skill marketplace** | Stripe is not open to Israeli accounts (`INCOME_PLAN.he.md` §14). A 30% fee we can never collect. |
| **Smithery** | Charges $30/month and pays $0 — already rejected in `INCOME_PLAN.he.md`; re-confirmed, nothing changed. |
| **Paid infra before revenue**: Trigger.dev cloud, Langfuse cloud, browser farms, residential proxies, ElevenLabs/Azure TTS tiers | Every one is a monthly bill before the first shekel. Self-host or defer. MoneyPrinterTurbo needs an LLM key *and* a TTS key *and* footage before it renders one video `[api/repo page]` — that is the shape we avoid. |
| **Prompt packs / "500 ChatGPT prompts"** | Saturated, near-zero marginal value, and adjacent to selling what is already free. |
| **Crypto trading agents** (CloddsBot shape) | Being wrong is expensive and hard to detect — the exact category `CLAUDE.md` reserves for Fable, and not a category where we sell honest software value. |
| **Anything requiring a new owner account beyond the existing §6 checklist** | MISSION rule 1: never invent a step that isn't required. |

---

## Open questions for the board

1. **P0-1 is a constitution bug, not a feature.** Should it be fixed before the next `colony tick`, given that every
   auditor downstream re-derives from `revenue_ledger`?
2. **P0-5 (Apify buy-side over x402) partially routes around the owner's KYC gate.** It buys data; it does not sell
   anything. Confirm that is inside the mandate before we spend USDC on it.
3. **P2-3 (Israeli n8n pack) competes for attention with `il-biz-tools`.** My read is: do not start it until
   `il-biz-tools` has a paying customer. Board call.

## Sources

GitHub REST search API, live 2026-09-03 (all star/fork/issue/push/license/homepage figures) ·
[harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) ·
[Apify: x402 agentic payments](https://blog.apify.com/introducing-x402-agentic-payments/) ·
[Apify changelog](https://apify.com/change-log/pay-for-apify-actors-with-x402) ·
[Apify x402 docs](https://docs.apify.com/platform/integrations/x402) ·
[Vercel: introducing x402-mcp](https://vercel.com/blog/introducing-x402-mcp-open-protocol-payments-for-mcp-tools) ·
[Coinbase CDP: Bazaar discovery](https://docs.cdp.coinbase.com/x402/bazaar) ·
[Cloudflare Monetization Gateway](https://blog.cloudflare.com/monetization-gateway/) ·
[LiteLLM security update, March 2026](https://docs.litellm.ai/blog/security-update-march-2026) ·
[Datadog Security Labs: TeamPCP campaign](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/) ·
[Koi Security: ClawHavoc](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting) ·
[The Hacker News: 341 malicious ClawHub skills](https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html) ·
[Unit 42: OpenClaw AI supply chain risk](https://unit42.paloaltonetworks.com/openclaw-ai-supply-chain-risk/) ·
[OWASP prompt injection coverage](https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/) (egress-blocked here; cited from search abstract) ·
[TechCrunch: YouTube AI slop policy](https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/) ·
[hermes-agent#15654](https://github.com/NousResearch/hermes-agent/issues/15654) ·
[openclaw#92082](https://github.com/openclaw/openclaw/issues/92082) ·
[paperclip#4659](https://github.com/paperclipai/paperclip/issues/4659) ·
[planning-with-files README](https://raw.githubusercontent.com/OthmanAdi/planning-with-files/master/README.md) ·
[Google Maps scraping legality analysis](https://thunderbit.com/blog/is-scraping-google-maps-legal) ·
[AAA "scam?" Reddit verdict summary](https://ciela.ai/blogs/ai-automation-agency-scam-reddit) (egress-blocked; cited from search abstract) ·
[Voice agent pricing breakdown](https://www.famulor.io/blog/ai-voice-agent-pricing-2026-what-10-platforms-actually-cost-per-minute) ·
[Selling n8n workflows](https://affstudio.org/2026/06/17/best-n8n-templates-to-sell-in-2026-15-automation-ideas-that-businesses-actually-pay-for/) ·
[Monetizing Claude skills](https://www.agent37.com/blog/monetize-claude-code-skills) ·
[Apify Actor monetization docs](https://docs.apify.com/academy/actor-marketing-playbook/store-basics/how-actor-monetization-works) ·
plus the in-repo files cited inline (`MISSION.md`, `constitution.md`, `docs/INCOME_PLAN.he.md`,
`logs/CHECKPOINT.md`, `src/revenue/ledger.ts`, `src/revenue/rules.ts`, `src/agent/policy-rules/financial.ts`,
`products/x402-il-api/src/`).

**Note on scope:** this scout was instructed not to write outside `research/tiktok/`, so no `logs/YYYY-MM-DD-*.md`
task log was created. The parent session should write it per `CLAUDE.md`.
