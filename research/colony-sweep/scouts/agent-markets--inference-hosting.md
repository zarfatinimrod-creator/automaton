# Scout notes — agent-markets / inference-hosting
Criterion: Hugging Face Spaces and Replicate — monetizable endpoints, pricing mechanics, what earns, payout rails, cost floor of serving a model.
Date of research: 2026-09-03. Scout model: Opus 5. Web searches spent: 6 of 8 allowed.

## Evidence-grade key
- **RENDERED** = I fetched the page and read it.
- **SNIPPET** = a search result summary quoting a page I could not open. Weaker.
- Memory is not used as evidence anywhere below.

## Network reality in this container
- `replicate.com` — **EGRESS_BLOCKED** (verified by attempt).
- `huggingface.co` — **EGRESS_BLOCKED** (verified by attempt, both /pricing and /terms-of-service).
- `raw.githubusercontent.com` — works. Hugging Face checks its whole documentation site into
  `huggingface/hub-docs`, so all HF docs below are primary-source rendered clauses.
- Replicate has no equivalent public docs repo I could find (`org:replicate` code search for
  pricing terms returned 0 hits), so every Replicate number below is SNIPPET-grade only.

## Primary sources rendered (no search budget spent)
1. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-gpus.md — RENDERED
   Full Spaces hardware price list, billed **per minute**, charged "for every minute the Space runs
   on the requested hardware, regardless of whether the Space is used". Not billed during builds.
   - CPU Basic (2 vCPU/16GB) — free, static only; suspends after 48h idle
   - CPU Upgrade — $0.03/hr
   - T4 small $0.40/hr · T4 medium $0.60/hr
   - 1x L4 $0.80/hr · 4x L4 $3.80/hr
   - 1x L40S $1.80/hr · 4x L40S $8.30/hr · 8x L40S $23.50/hr
   - A10G small $1.00/hr · A10G large $1.50/hr · 2x A10G $3.00/hr · 4x A10G $5.00/hr
   - A100 large $2.50/hr · 4x A100 $10.00/hr · 8x A100 $20.00/hr
   Sleep schedules stop the charge while asleep.
2. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-zerogpu.md — RENDERED
   ZeroGPU daily quota: unauthenticated 2 min, free account 5 min, PRO 40 min, Team 40, Enterprise 60.
   Extension credits: **$1 per 10 minutes** of ZeroGPU time (PRO/Team/Enterprise only) => $6/GPU-hour.
   Hardware: `large` = half an RTX Pro 6000 Blackwell (48GB VRAM); `xlarge` = full GPU (96GB), burns 2x quota.
   Hosting limits: free account 2 ZeroGPU Spaces (verified email, account 30+ days), PRO 10, Team/Enterprise 50.
   "Remaining quota directly impacts priority in ZeroGPU queues."
3. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/billing.md — RENDERED
   "The only payment method supported for Hugging Face compute services is credit cards." Stripe processes.
   Team subscription also payable by AWS account / AWS Marketplace.
   Pay-as-you-go services: Jobs, Inference Providers, Inference Endpoints, GPU Spaces, ZeroGPU extra quota,
   Private Storage. **No mention anywhere of creator payouts or revenue sharing.**
4. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/inference-providers/pricing.md — RENDERED
   Monthly credits: Free $0.10 (Inference Providers only), PRO $2.00, Team/Enterprise $2.00 per seat,
   usable across Inference Providers, Inference Endpoints, upgraded Spaces hardware, Jobs.
   "Hugging Face charges you the same rates as the provider, with no additional fees. We just pass through
   the provider costs directly." Custom provider key => billed directly by the provider.
5. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/inference-providers/register-as-a-provider.md — RENDERED
   The only documented route by which money flows *to* a third party through HF. Nine steps: implement HF
   task API schemas; PR into huggingface.js; register model mappings; **expose a billing HTTP endpoint that
   reports cost in nano-USD per request, which HF polls every minute**; PR into huggingface_hub; server-side
   registration + SVG icon; provider docs; hub-docs PR; joint promotion. Hard gate: "upgrade their Hub account
   to a Team or Enterprise plan" before model-mapping registration. Users pay standard provider rates, HF takes
   no markup. The doc does not say how HF is compensated.
6. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-api-endpoints.md — RENDERED
   "If you can use a Space in your browser, you can call it as an API." Python/JS clients + raw HTTP.
   Auth header required for private Spaces and gives better rate limits on public ones. ZeroGPU calls consume
   the **caller's** daily quota, so an unauthenticated third party hitting your Space uses the throttled
   anonymous pool, not your budget.
7. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-mcp-servers.md — RENDERED
   Gradio Spaces are usable directly as MCP servers by MCP clients; ZeroGPU quota is consumed by the caller.
   Cited example: a PRO account "lets you generate up to 600 images per day using FLUX.1-schnell" within 40 min.
8. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-agents.md — RENDERED
   "Most popular Spaces run on ZeroGPU, which uses the caller's daily quota. Agents should always pass an
   `$HF_TOKEN` so calls are billed to your account rather than a throttled anonymous pool."
9. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/enterprise.md — RENDERED (via code search)
   Enterprise: "5% of ACV included" as compute credits; other tiers get none, bulk purchase available.
10. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/pro.md — RENDERED
   PRO benefits list; the doc itself does **not** state the price, it links to huggingface.co/pro (blocked here).

## Search-snippet-grade claims (must be closed by opening the URL)
- Replicate public A100 ~**$0.0014/second** (= $5.04/hr). SNIPPET from
  https://www.spheron.network/blog/replicate-pricing-2026-per-second-cost/ and
  https://computeprices.com/providers/replicate . Close by opening https://replicate.com/pricing (blocked here).
- Replicate L40S / multi-GPU: rates "require committed spend contracts", not published. SNIPPET, same source.
- HF PRO **$9/month**, Team **$20/seat/month**, Enterprise **$50/seat/month**. SNIPPET from
  https://comparedge.com/tools/hugging-face/pricing and https://www.eesel.ai/blog/hugging-face-pricing .
  Close by opening https://huggingface.co/pricing .
- Whether Replicate shares revenue with model authors: **six searches found no source either way**, and
  Replicate's own billing/deploy docs are unreachable. One AI-written summary asserted HF "pays via Spaces
  revenue" — I treat that as unsupported and do not use it. Close by opening
  https://replicate.com/docs/topics/billing and https://replicate.com/terms .

## Searches run (6)
1. "Replicate pricing per second GPU Nvidia A100 L40S price 2026"
2. "Replicate does not pay model authors revenue share creators earn money publishing model" (expanded into
   several sub-searches by the tool and returned nothing usable — the single most wasteful call of the run)
3. "Hugging Face become an Inference Provider partner requirements onboard provider revenue"
4. ""Hugging Face" Spaces monetize paywall Stripe inside a Space allowed terms creator payout"
5. "Hugging Face PRO subscription price per month 2026"
(2 counted as multiple internally; treat the budget as spent.)

## The load-bearing conclusion
Neither Hugging Face nor Replicate is an income platform for a model/Space author. Every documented money
flow points **from** the account holder **to** the platform: Spaces hardware per minute, ZeroGPU credits,
Inference Endpoints, Jobs, storage, PRO/Team/Enterprise seats. There is no creator payout page, no payout
settings, no revenue-share clause anywhere in HF's own docs repo — and the only mechanism by which a third
party gets paid through HF is the Inference **Provider** registration, which is a B2B integration for a
company that already operates GPU serving, gated behind a Team/Enterprise plan, where HF explicitly takes no
markup and the provider bills through its own billing endpoint.

Therefore payability to Israel is not primarily a platform question here: there is nothing to be paid out.
Israel-payability only becomes relevant on the *own-rails* layer (Paddle/Stripe/x402), which this repo already
operates. HF's inbound side is credit-card only via Stripe, which an Israeli card handles.

## Cost floor of serving a model (the number the colony actually needs)
- Cheapest always-on GPU on HF Spaces: **1x L4 at $0.80/hr = ~$576/month = ~2,100 ILS/month** if never asleep.
  At an assumed ~3.6 ILS/USD. That is the break-even a hosted-model product must clear before any profit.
- Cheapest burst GPU on HF: **ZeroGPU at $1/10 min = $6/GPU-hour**, but only when the *operator's* quota is
  charged; if callers authenticate with their own tokens the compute is free to the operator and rate-limited
  to the caller (5 min/day free, 40 min/day PRO).
- Replicate: per-second, no idle charge — SNIPPET $0.0014/s A100. Structurally cheaper than an always-on Space
  below roughly one-third utilisation; more expensive above it.
- Consequence: **the only economically sane serving posture for this colony is burst/serverless with the
  caller's quota or per-second billing, never an always-on GPU Space.** An always-on L4 alone eats 10% of the
  20,000 ILS target before a single customer.
