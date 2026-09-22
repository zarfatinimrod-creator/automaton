# Scout notes — plugin-ecosystems / notion-templates

Date: 2026-09-04. Scout: WORKER-SCOUT "notion-templates".
Criterion: Notion template economy — where sold, real price points, top-seller evidence,
saturation, and whether an agent can produce genuinely useful templates at scale.

Search budget used: **8 of 8** (the cap). Web searches stopped after the eighth.

## Evidence quality warning (read before using any number below)

**Zero Notion primary pages were rendered.** `www.notion.com` is egress-blocked
(EGRESS_BLOCKED on both `/help/selling-on-marketplace` and
`/help/template-gallery-guidelines-and-terms`). So is `stripe.com` and `gumroad.com`.
Every claim about Notion's own fees, payout countries and submission rules below rests on
**search snippets that quote those pages**, not on the pages themselves. They are marked
SNIPPET. Nothing here is strong evidence by the sweep's own standard.

The two payability facts that *are* strong are already in this repository, rendered by
earlier scouts from platform source code, and I reuse them rather than re-spending budget.

## URLs a human or unblocked agent must open to close this criterion

1. https://www.notion.com/help/selling-on-marketplace — the eligible-countries list. Is
   Israel on it? This single page decides findings 1 and 2.
2. https://www.notion.com/help/template-gallery-guidelines-and-terms — originality rules,
   AI-generated-content stance, and whether bulk submission is permitted.
3. https://www.notion.com/help/guides/getting-started-as-a-template-creator-on-marketplace —
   is the paid-creator waitlist still open/unbounded (the repo's existing rejection reason)?
4. https://stripe.com/global — Israel's status as a Stripe *business* country.

## What I found

### Where they are sold
- **Notion Marketplace** (notion.com/templates) — first-party, "tens of thousands of
  templates" per a vendor blog quoting it (SNIPPET, notionsender.com, weak).
- **Etsy** — "50,000+ listings for Notion templates" (SNIPPET, sendowl/whop blogs).
- **Gumroad** — where Thomas Frank and Easlo actually sell (their own Gumroad pages appear
  in results, e.g. notioneric.gumroad.com).
- Aggregators: Prototion, Notionery, NotionSender listicles — directories, not evidence of
  demand.

### Real price points (best number I obtained)
From a search snippet quoting Etsy market analysis: Notion templates on Etsy sell **$1.90–$79,
median $12.38, average $16.27**. Tiering quoted the same way: single-page $5–9; multi-page
systems $10–19; comprehensive business tools (CRM, PM suites) $19–39. One named example:
"The Ultimate Notion Planner" at $19.98, 200+ copies, ~$4k gross.
Source: search results for "Notion template price points ... Etsy price range best sellers",
2026-09-04, pointing to rankhero.com/keywords/notion-templates and sendowl.com blog. SNIPPET.

### Notion's own economics (SNIPPET, from notion.com/help/selling-on-marketplace)
- Notion fee: **8% + $0.40 per transaction**.
- Payments processed **via Stripe**; creator must **join a waitlist, be approved by Notion
  staff, then onboard with Stripe**.
- Sales in USD; non-US creators paid in local currency with an extra **1% FX fee**.
- Payouts biweekly Thursdays, **minimum $20 balance**.
- "If your country is ineligible, you can still list a paid template as long as it links to a
  third-party site for payment." ← this sentence is the whole viable route for us.

### Top-seller evidence
- **Thomas Frank**: crossed **$1,000,508** in Notion template revenue in 2022; Ultimate Brain
  alone $760,000 of it; later reporting says **$2.5M+** cumulative.
  (SNIPPET: easy.tools/blog/thomas-frank, stormy.ai playbook, markwils.medium.com.)
- **Easlo**: **$500,000+** cumulative, **$20,000/month** by Oct 2022.
  (SNIPPET: goodreads author blog post, kupkaike.com.)
- Typical creators: "$0 to about $3,000 a month ... after six to twelve months of consistent
  building" (SNIPPET, kupkaike.com). Treat the $500–$50,000 range quoted by vendor blogs as
  marketing.

**The structural fact under those numbers:** both top sellers are *audience* businesses.
Thomas Frank is a YouTuber with millions of subscribers; Easlo built on X/Twitter. The
template is the product; the face is the distribution. MISSION forbids the owner appearing,
selling or talking to people, so the top-seller evidence is evidence *against* this criterion,
not for it.

### Saturation
- "Generic Notion templates are saturated ... profession-specific and life-event templates
  are still wide open" and "'Notion productivity template' is saturated, 'Notion template for
  independent speech therapists' has a handful of sellers at most" (SNIPPET, sendowl.com and
  kupkaike.com — both vendors selling to template creators, so self-interested; weak).
- Etsy's 50,000+ listings and the $12.38 median are the honest saturation signal: the median
  price is what a commodity costs.

### Can an agent produce genuinely useful templates at scale?
Production: plausible — a Notion template is pages + databases + views, and the Notion API
creates pages and databases programmatically. **I did not render the API docs, so this is
unverified.**
Distribution: **no programmatic publish path found** for Marketplace listing; submission is a
web form behind a staff review. Selling *paid* additionally needs waitlist approval.
Quality gate: Notion's guidelines demand originality and "unique value compared to existing
content" (SNIPPET) — mass-produced near-duplicates are exactly what that clause rejects, and
producing them anyway would breach the constitution regardless of what Notion catches.

### Payability to Israel
- **Notion's own rail: likely NO.** Notion pays via Stripe; a search for Stripe's Israel
  status returned "Israel is not officially listed as a supported country by Stripe" and
  "Israel isn't on the list of countries currently supported by Stripe"
  (SNIPPET: cs-cart.com/blog/stripe-supported-countries/, linkedin.com/pulse "How To Use
  Stripe In Israel"). stripe.com itself is blocked. Confidence: medium-low; page 1 above
  settles it.
- **External checkout: YES, already proven in this repo.**
  - Gumroad: `docs/REJECTED.md` line ~612 — a row `Israel | ILS` rendered from Gumroad's own
    production source `_13-getting-paid.html.erb`. Strong.
  - Paddle: `products/il-biz-tools/README.md` — merchant of record, supports Israeli
    individuals, already the shipped rail.
- **Etsy Payments for Israel: UNVERIFIED** (`docs/REJECTED.md` line 288). Multi-shop Etsy is
  already RED in this repo (line 260); a single shop is open but blocked on payability.

## Prior repo verdict I am not overturning
`docs/REJECTED.md` line 271 already rejected **"Notion Marketplace localized templates"**:
"a creator waitlist reviewed by Notion staff on an unbounded timeline. A channel gated behind
an unbounded human queue is not agent-operable." Nothing I found contradicts it. My addition
is that there is a *second* blocker underneath it (Stripe/Israel) and one narrow route around
both (free listing + external Paddle/Gumroad checkout), which is worth exactly the modest
number I give it and no more.

## Searches run (8)
1. Notion Template Marketplace creator payouts Stripe supported countries paid templates
2. Notion template seller revenue Easlo Thomas Frank how much templates earn 2025
3. "Notion" Marketplace "eligible countries" template creator payouts Israel
4. Notion Marketplace guidelines terms template quality review rejected duplicate AI-generated
5. Stripe Israel supported country accept payments payouts businesses available
6. Gumroad payouts Israel PayPal supported countries creators get paid
7. how many templates on Notion Marketplace saturation competition thousands creators oversaturated 2026
8. Notion template price points average paid template $19 $29 Etsy Notion template price range best sellers

## Fetches attempted
- www.notion.com/help/selling-on-marketplace — EGRESS_BLOCKED
- www.notion.com/help/template-gallery-guidelines-and-terms — EGRESS_BLOCKED
- stripe.com/global — EGRESS_BLOCKED
- gumroad.com/help/article/13-getting-paid — EGRESS_BLOCKED
(No Notion, Stripe or Gumroad host is reachable from this container. GitHub was not useful
here: Notion's help content is not checked into a public repo that I could locate without
spending search budget.)
