# SCOUT: store-promotion / paid-acquisition-floor

**Researched 2026-09-03 by the parent session, not a scout agent** — the `store-promotion` wave
died on API 529 overload, as did six other fan-outs today. Researched inline instead.

**Criterion:** with a total float of ₪200, is any paid channel reachable at all? Measure it
precisely enough that nobody re-proposes paid ads for a year.

---

## Verdict: no — and the budget is the *less* interesting reason

₪200 is about **$54**. Against the platforms' own published minimums
([Meta](https://www.stackmatix.com/blog/meta-ads-minimum-daily-budget-2026),
[Reddit](https://www.stackmatix.com/blog/reddit-ads-minimum-budget-requirements-2026),
[Google](https://www.get-ryze.ai/blog/google-ads-minimum-budget-guide-2026)):

| Platform | Stated minimum | What ₪200 buys |
|---|---|---|
| Meta, impressions | $1/day | 54 days |
| Meta, clicks or conversions | $5/day | 11 days |
| Reddit | $5/day, $25 lifetime | 11 days |
| Meta, *practical* floor for the algorithm to function | $50–150/day | **0.4–1.1 days** |
| Reddit, *practical* floor for conversions | $75–150/day | **under a day** |
| Google Ads, enough data for campaign learning | $1,000–2,500/month | **5.4%** of one month at the low end |
| Google Ads, enough for Smart Bidding (30+ conversions) | $5,000–10,000/month | **1.1%** of one month |

So at the technical minimums ₪200 buys a few days of the smallest campaign the platform will
accept, and at the budgets where the auction algorithms actually optimise it buys **less than a
single day**. There is no configuration in which it produces a sale.

## The reason that outlives the budget

Raising the float would not fix this, and that is the finding worth keeping.

Every one of these platforms optimises against **conversion volume**. A brand-new store has no
conversion history, so the entire budget is consumed by the learning phase and the campaign exits
before it has learned anything. Money spent below the learning threshold does not buy a smaller
result; it buys **no signal at all**. That is a threshold effect, not a linear one.

And then the portfolio arithmetic finishes it. MISSION constraint 1 requires marginal cost per
store to approach zero. Paid acquisition is a *recurring per-store cost*, which is the opposite:

- 100 stores at even $1/day = **$3,000/month**
- 878 stores at even $1/day = **$26,340/month**, against a target of ₪83,333 (~$22,500)

At the store count the final goal requires, the cheapest possible ad spend on every store exceeds
the revenue those stores are supposed to produce. **Paid acquisition is incompatible with the
portfolio model itself**, at any budget, and would remain so if the float were a hundred times
larger. It is not a "later, when we can afford it" — it is a different business.

## What this leaves

Only promotion whose cost does not scale with the store count, which is precisely MISSION
constraint 4: one hub, one sitemap, one machine-readable catalogue, one registry listing covering
many stores. The MCP registry finding
(`store-promotion--machine-discovery.md`) is the working example — free, and one listing
propagates to downstream registries.

## Recorded honestly

- The figures above are **search-snippet grade**, from marketing blogs that cite the platforms
  rather than from the platforms' own pages, which are egress-blocked here. They agree with each
  other and with the platforms' widely-known published minimums, and the conclusion survives an
  order-of-magnitude error in any of them — ₪200 against a $1,000/month learning threshold does
  not become viable if the threshold is really $300.
- **Not researched:** LinkedIn and Telegram Ads minimums, the Israeli ad networks, and whether
  each platform accepts an Israeli advertiser without a registered business entity. They do not
  change the verdict, since the portfolio argument is independent of platform, but they are
  genuinely unchecked and the group's report should not imply otherwise.
