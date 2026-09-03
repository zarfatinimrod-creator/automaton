# SCOUT: store-promotion / marketplace-ranking

**Researched 2026-09-03 by the parent session, inline** — the `store-promotion` wave died on API
529 overload (one of seven fan-out failures today). Evidence is **first-party**: Apify's own
documentation repository on GitHub, which is reachable when `docs.apify.com` is not.

**Criterion:** what ranks a listing with zero sales, zero reviews and no history, and is ranking
driven by existing usage — which would make a new listing structurally invisible?

---

## Verdict: the cold start is real but **not total**, and we had this wrong

Apify's Actor quality score has **eight categories**
([apify/apify-docs `quality_score.mdx`](https://github.com/apify/apify-docs/blob/master/sources/platform/actors/publishing/quality_score.mdx)).
Five of them are fully controllable by an Actor with zero users on the day it is published:

| Category | What it measures | New Actor can control? |
|---|---|---|
| Reliability | "operational stability and consistency" | **Yes** — input schemas, testing |
| Ease of use | "how quickly users can understand and successfully run your Actor" | **Yes** — title, description, README |
| Pricing transparency | "how clearly users can understand and predict the costs" | **Yes** |
| Trustworthiness | "whether your Actor follows the principle of least privilege" | **Yes** — permissions |
| Congruency | "the consistency and coherence across your Actor's components" | **Yes** — schema and docs aligned |
| Popularity | "user engagement and adoption" | No — needs users |
| Feedback and community | reviews and ratings from repeat users | No — needs "users who have run your Actor multiple times" |
| History of success | developers with proven track records | No — needs a track record |

The score "recalculates several times per day", and the documentation says nothing about how a
new Actor is initially scored — an honest gap.

**One score, three surfaces.** The same parameters drive Apify Store search, Apify AI search, and
the **MCP server's `search-actors` tool**: *"Search ranking evaluates parameters similar to those
in the Actor quality score… Actors with higher quality scores tend to rank higher in Apify Store
search and the Apify MCP server `search-actors` tool, though no specific position is guaranteed."*
So quality work pays into human and agent discovery at once.

## The correction this forces on our own portfolio

`src/revenue/portfolio.ts` carried this comment: *"Store ranking is driven by existing usage,
which makes a new actor structurally invisible."* That is **too strong**, and it mattered — it was
the justification for a kill criterion. Five of eight categories are ours from day one. A new
Actor is disadvantaged, not invisible, and the disadvantage is concentrated in exactly three
categories that a good launch eventually earns.

Corrected in the same commit as this file.

## The trap worth naming

From Apify's permissions documentation: *"Actors requiring full permissions may receive a lower
Actor Quality score, which can reduce their ranking in Apify Store, and in some situations
(autonomous agent workflows) they might even be excluded from search results."*

**Excluded, not merely demoted.** For a colony whose buyers are meant to be agents, asking for
broad permissions is not a minor quality deduction — it removes the Actor from the surface where
those buyers look. Minimum permissions is a launch requirement, not a nicety.

## What this means for how we publish

1. Ship with a complete input schema and real field descriptions. Apify's discoverability guidance
   treats *"vague field names and missing descriptions in input schemas"* as a discoverability
   problem now that agents read them.
2. Request the narrowest permissions the Actor can work with.
3. Make pricing legible before launch, not after the first invoice.
4. Keep README, schema and behaviour saying the same thing — that is what Congruency measures, and
   it is free.

Together those are five of eight categories, earned before a single user arrives.

## Evidence grade

**Strong** for everything quoted: read from Apify's own docs repository. **Unknown** for how the
score initialises for a brand-new Actor, and for the relative weight of each category — neither is
published. The 2026 secondary sources found alongside (`use-apify.com`, `agentbyline.com`) are
marketing pages and were not used for any claim here.
