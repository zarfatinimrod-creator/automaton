# Scout notes — agent-markets / inference-hosting
**Criterion:** Hugging Face Spaces and Replicate: monetizable endpoints, pricing mechanics, what earns, payout rails, cost floor of serving a model.
**Date of research:** 2026-09-03. **Search budget used:** 6 of 8 allowed WebSearch calls.

## Evidence inventory (kind matters)

### RENDERED PRIMARY SOURCES (strong) — huggingface/hub-docs on raw.githubusercontent.com
All fetched 2026-09-03, `main` branch.

1. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-gpus.md
   - CPU Basic free; CPU Upgrade $0.03/hr.
   - T4-small $0.40/hr, T4-medium $0.60/hr, 1x L4 $0.80/hr, 4x L4 $3.80/hr, 1x L40S $1.80/hr,
     4x L40S $8.30/hr, 8x L40S $23.50/hr, A10G-small $1.00/hr, A10G-large $1.50/hr,
     2x A10G-large $3.00/hr, 4x A10G-large $5.00/hr, A100-large $2.50/hr, 4x A100 $10.00/hr, 8x A100 $20.00/hr.
   - Billed by the minute while running; build time free. "Upgraded Spaces run indefinitely by default,
     even if there is no usage" — sleep threshold must be set explicitly or you pay 24/7.
2. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/billing.md
   - Three billed areas: subscriptions (PRO/Team/Enterprise), compute usage (Spaces, Inference Endpoints,
     Inference Providers, Jobs), storage overage $18/TB/month in 1TB increments.
   - "The only payment method supported for Hugging Face compute services is credit cards." (Stripe.)
   - **Contains no mention whatsoever of payments to Space authors or creator revenue share.**
3. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-zerogpu.md
   - ZeroGPU = shared NVIDIA RTX Pro 6000 Blackwell, dynamically allocated. Free to host and to use.
   - Host limits: free verified account (30+ days old) 2 ZeroGPU Spaces; PRO 10; Team/Enterprise org 50.
   - Daily caller quota: anonymous 2 min, free 5 min, PRO 40 min, Team/Enterprise 40-60 min.
   - Extra quota purchasable at "$1 per 10 minutes".
4. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-api-endpoints.md
   - "If you can use a Space in your browser, you can call it as an API." Every Gradio Space auto-exposes
     an OpenAPI spec at `https://<sub>.hf.space/gradio_api/openapi.json`, POST `/gradio_api/call/{endpoint}`
     then poll/stream the event id. Public Spaces callable with no token; `Authorization: Bearer $HF_TOKEN`
     for better rate limits; private Spaces need a READ token.
5. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-mcp-servers.md
   - `pip install "gradio[mcp]"` + `launch(mcp_server=True)` turns a Gradio Space into an MCP server with an
     MCP badge; addable to Claude Code / Cursor / VSCode from Hub MCP settings with a READ token.
   - "ZeroGPU Spaces consume your quota when called" — i.e. the **caller's** quota, not the host's.
6. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/spaces-get-user-plan.md
   - A Space can `window.parent.postMessage({type:"USER_PLAN_REQUEST"})` and receive
     `{user: "anonymous"|"pro"|"free", plan: undefined|"team"|"enterprise"|"plus"|"academia"}`.
   - Documented use case: "gate premium features based on subscription tier". This is HF's own docs
     endorsing premium gating inside a Space — but it gates on *HF's* subscription, and HF pays the author nothing.
7. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/jobs-pricing.md
   - Jobs need a positive credit balance. Billed per minute while Starting/Running; build free.
   - CPU Basic (2 vCPU/16GB) $0.01/hr up to CPU Performance (32 vCPU/256GB) $1.90/hr.
   - GPU T4-small $0.40/hr up to 8x H200 $40/hr; 8x L40S $23.50/hr. Exposing ports +$0.01/hr.
   - Default 30-minute timeout.
8. https://raw.githubusercontent.com/huggingface/hub-docs/main/docs/hub/_toctree.yml
   - Full Spaces/billing/enterprise doc index. There is exactly one billing page and one jobs-pricing page,
     and **no page named monetization, payout, earnings, marketplace or revenue**. Negative evidence, but from
     the platform's own table of contents.

### SEARCH SNIPPETS ONLY (weaker — must be marked as such)
9. WebSearch 2026-09-03, "Replicate pricing per second GPU": snippets citing https://replicate.com/pricing and
   https://replicate.com/blog/nvidia-l40s-gpus-are-here give public-model rates **L40S $0.000975/sec ($3.51/hr)**
   and **A100 80GB $0.001400/sec ($5.04/hr)**; a 20s A100 run = $0.028. NOT independently rendered — replicate.com
   is egress-blocked. A human must open https://replicate.com/pricing to confirm.
10. WebSearch 2026-09-03, "Replicate deployments idle billing": snippets citing
   https://replicate.com/docs/topics/billing — public models bill only active prediction time; **private models
   and deployments bill setup + idle + active** ("you pay for all the time an instance is online"), exception:
   fast-booting fine-tunes. CPU-only $0.000025/sec ($0.09/hr) small, $0.000100/sec ($0.36/hr) standard.
   `min_instances: 1` on an H100 deployment ≈ **$36.60/day** (~$1,100/month). Snippet-only.
11. WebSearch 2026-09-03, "Replicate model authors get paid": the search returned Replicate's own
   https://replicate.com/docs/topics/models/publish-a-model and .../how-does-replicate-work and the summary was
   explicit that **no author-compensation or revenue-share information exists in the indexed docs**. Absence of
   evidence, from the pages where it would live. To close: open https://replicate.com/docs/topics/models/publish-a-model.
12. WebSearch 2026-09-03, "HF pay Space creators": snippets state HF has **no per-query revenue share** for
   creators; monetisation is indirect — gate features behind HF PRO, link to your own paid service, or use the
   Space as a top-of-funnel demo. Sources indexed: sacra.com/c/hugging-face, research.contrary.com/report/hugging-face,
   valueaddvc.com. Third-party commentary, not HF docs — weak, but consistent with items 2 and 8.
13. WebSearch 2026-09-03, "HF Inference Providers how providers get paid": snippets citing
   https://huggingface.co/docs/api-inference/main/en/pricing and https://huggingface.co/blog/baseten —
   HF is a **routing and billing layer with pass-through pricing and no markup**; partners are fal, Replicate,
   SambaNova, Together AI, Baseten, Public AI. "In the future HF may establish revenue-sharing agreements with
   provider partners, but this is not yet implemented." Monthly included credits: free <$0.10, PRO $2.00,
   Enterprise $2.00/seat. Snippet-only.
14. WebSearch 2026-09-03, HF ToS on monetizing a Space: no authoritative clause found. Only a forum thread
   (https://discuss.huggingface.co/t/rules-guidelines-best-practices-for-monetizing-a-hf-space/139230) where users
   ask the question; no staff answer surfaced in the snippet. **This question is OPEN.**

### BLOCKED (do not retry — EGRESS_BLOCKED confirmed this session)
huggingface.co, discuss.huggingface.co, replicate.com, techbytes.app, www.spheron.network.
GitHub MCP is scoped to zarfatinimrod-creator/automaton only; raw.githubusercontent.com is the working channel.

## URLs a human or unblocked agent must open to close the open questions
- https://huggingface.co/terms-of-service — is charging your own customers through a Space permitted?
- https://huggingface.co/content-guidelines — same question, content side.
- https://replicate.com/docs/topics/models/publish-a-model — does publishing earn anything? (expected: no)
- https://replicate.com/pricing — confirm per-second rates.
- https://replicate.com/docs/topics/billing — confirm idle billing on deployments.

## What the numbers mean for the colony
- **Cost floor of serving a model, honest version:** ~0 ILS/month if you fit on HF CPU Basic or ZeroGPU, because
  ZeroGPU burns the *caller's* daily quota rather than the host's. The moment you need a dedicated GPU it jumps to
  a hard $288/month (T4-small always-on) or ~$1,100/month (Replicate H100 deployment with min_instances=1).
  There is no middle. Everything we ship on these platforms should stay in the free tier by design.
- **Neither platform is a payout rail.** HF pays authors nothing; Replicate pays authors nothing. Both are
  *outbound* payments from an Israeli credit card. Any money must arrive through a rail we already own
  (Paddle, Telegram Stars, Apify pay-per-event, x402).
- **Reselling raw inference is a dead business.** Our cost equals the public list price of four commodity vendors
  that HF itself routes to at zero markup. There is no margin and no nameable buyer.
