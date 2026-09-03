# SCOUT: store-promotion / machine-discovery

**Researched 2026-09-03 by the parent session, not a scout agent.** The `store-promotion` wave
died entirely on API 529 overload — all nine agents, zero tokens spent — as did the
`productized-services` wave and three separate research agents today. Standing rule when that
happens: do the work inline rather than report it as blocked. So this criterion is researched, the
other seven in the group are not, and coverage records only this one as swept.

**Criterion:** being found by other agents rather than people — MCP registries, the x402 Bazaar,
`.well-known` descriptors, agent cards, `llms.txt`. Deciding question set in advance: *does listing
produce paying callers?*

---

## Verdict

**List, and treat it as free shelf space rather than a demand channel.** The publishing path is
real, costs nothing, and — the part that matters for us — **can be done entirely by CI with no
owner action and no KYC.** Whether it produces buyers is genuinely unknown, and nobody publishes
conversion data. That combination is still worth taking, because MISSION constraint 4 requires
promotion whose cost does not scale with the store count, and this is the clearest example of it:
one manifest, published by a workflow, propagated by downstream registries.

What it is not is a growth plan. Anyone claiming a listing brings customers is guessing.

## The publishing path, from the registry's own repo

`modelcontextprotocol/registry` — 7,217★, 976 forks, Go, pushed 2026-09-03, actively maintained.
From its README (fetched, summarised):

- A CLI: `make publisher` then `./bin/mcp-publisher`.
- Ownership must be proven by **one** of: GitHub OAuth, **GitHub OIDC from a GitHub Actions
  workflow**, DNS challenge, or HTTP challenge.
- Namespace validation: to publish `io.github.<username>/<server-name>` you must control that
  GitHub account or repository.
- Manifest is a `server.json`.
- **No npm, PyPI or Docker package is required** — a server may be published without one.
- Status: **preview**, with an API freeze noted as of October 2025.
- Cost and moderation policy: **not stated in the README.** Unresolved.

**The GitHub OIDC option is the whole finding.** It means publication is a CI job authenticating
as the repository, not a human filling a form. The owner already controls
`github.com/zarfatinimrod-creator`, which is the namespace — so nothing new needs to be created,
verified, or KYC'd. That satisfies the constraint that stores multiply while accounts do not: one
account already in hand, many listings under it.

## Does it produce buyers? Unknown, and the ecosystem is crowded

Server counts as reported in 2026 ([TrueFoundry](https://www.truefoundry.com/blog/best-mcp-registries),
[RoxyAPI](https://roxyapi.com/blogs/mcp-registries-where-to-list-your-server),
[Digital Thought Disruption](https://digitalthoughtdisruption.com/2026/07/20/mcp-registry-discover-verify-safely-connect-servers/)):

| Registry | Servers listed |
|---|---:|
| PulseMCP | 15,930+ |
| Smithery | ~7,300 |
| **Official MCP registry** | **~2,000** |

The official registry exposes an API that **downstream registries consume**, so one listing
propagates rather than needing eight submissions — a genuine argument for publishing to the
official one first. Clients that can connect to registry-discovered servers include Claude
Desktop, Cursor and Windsurf.

**But not one source reports what a listing converts to.** No installs-per-listing, no
callers-per-server, no revenue. These are marketing and comparison posts, search-snippet grade,
and the absence is consistent across all of them. Treat any number anyone cites for MCP listing
conversion as unsourced until it comes with a method.

The honest frame: ~2,000 servers in the official registry and ~16,000 on the largest aggregator
means a listing is a shelf position in a crowded aisle, not a queue of customers.

## What this unblocks for us

`products/x402-il-api` sells six endpoints over x402 and no agent can find it — established in
`research/web4/00-what-we-already-have.md`. Two steps, neither needing the owner:

1. **An MCP server wrapping the free endpoints** (`products/mcp-il-tools`), which is the
   top-of-funnel: Israeli ID/phone/bank validators, Hebrew date, transliteration. Free, MIT.
2. **Publish it from GitHub Actions using OIDC**, namespace `io.github.zarfatinimrod-creator/...`,
   with the paid x402 tier named in its description as the upgrade path.

Cost: ₪0. Owner action: none. This is the first distribution channel we have found that clears
MISSION constraint 4 outright.

## Still unresearched in this group

Seven criteria have no scout report: `promotion-at-scale`, `answer-engine-optimisation`,
`marketplace-ranking`, `first-reviews-honestly`, `cross-promotion`, `paid-acquisition-floor`,
`attribution-without-analytics`. The wave is resumable —
`resumeFromRunId: wf_a728096d-e10` — and completed agents replay from cache, so a retry costs only
what failed.
