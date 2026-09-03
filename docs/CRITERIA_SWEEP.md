# The criteria sweep — 112 scouts under the chain of command

The owner's instruction: *"at least 100 agents that search by criteria, and for each
group of criteria a supervisor — use the chain of command loop."* This document is how
that is implemented, and how to run it again.

## Shape

```
                          board            decides what gets built
                            ▲
                     chief auditor         checks the auditors
                            ▲
        ┌───────────────────┼───────────────────┐
     auditor             auditor             auditor          14 of them, one per group
        ▲                   ▲                   ▲             their job is to refute
    supervisor          supervisor          supervisor        14 of them, one per group
        ▲                   ▲                   ▲             merge, verify, rank, reject
   ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
  8 scouts   …        8 scouts   …        8 scouts   …        112 of them, one per criterion
```

**112 scouts, 14 supervisors, 14 auditors, 1 chief auditor, 1 board = 142 agents.**

Each level's mandate and its "must never" list come from `src/revenue/org.ts`, the same
chain of command the live revenue lines run under. A scout can search and write notes; it
cannot spend, cannot record money, cannot decide. A supervisor ranks but never searches.
An auditor checks but cannot edit any record. That separation is what makes the output
worth trusting.

## The search space

`src/revenue/criteria.ts` holds 14 groups of 8 criteria. Each criterion is a
self-contained search brief — a scout receives one and needs no other context, which is
exactly what lets 112 of them run at once.

| Group | What it searches |
|---|---|
| `storefronts` | Marketplaces that will actually pay an Israeli software-only seller |
| `plugin-ecosystems` | Chrome, Figma, Notion, IDE, Shopify, WordPress, chat-app directories |
| `agent-markets` | MCP registries, GPT/Poe stores, Apify, RapidAPI, x402, agent registries |
| `data-apis` | Open data, registries, financial, geo, transport, tax-reference feeds |
| `israel-bureaucracy` | VAT, allocation numbers, National Insurance, income tax, rights, registration |
| `vertical-niches` | SMB verticals worldwide: e-commerce, accountants, trades, recruiting, legal |
| `content-seo` | Calculator sites, directories, ad networks, affiliate, Hebrew SEO |
| `bounties-grants` | OSS bounties, bug bounty, competitions, protocol grants, creator funds |
| `crypto-native` | Paid agent services, infrastructure, analytics — judged sceptically |
| `licensing-ip` | Stock media, fonts, datasets, dual licensing, white-label |
| `productized-services` | Automated audits, monitoring, compliance scanning, OCR, localization |
| `distribution` | Launch platforms, directories, SEO, Israeli channels, short video |
| `payment-rails` | Paddle, PayPal, Payoneer, Telegram Stars, Israeli tax registration |
| `risk-governance` | Platform ToS, AI disclosure, the owner-KYC catalogue, agent failure modes |

Two groups exist because they gate everything else: **`payment-rails`** (a line that
cannot pay an Israeli is worth zero however good the idea) and **`risk-governance`**
(which produces the owner-blocker catalogue and the guardrails this repo needs).

## Running it

The sweep runs as a Workflow script. A Workflow script cannot import anything, so the
criteria are inlined into it — and generated, never hand-edited, so the inlined copy
cannot drift from the registry:

```bash
pnpm exec tsx scripts/gen-sweep-workflow.ts          # regenerate after editing criteria.ts
pnpm exec tsx scripts/gen-sweep-workflow.ts --check  # CI: fail if stale
```

Then run `workflows/colony-criteria-sweep.js` through the Workflow tool. Results land in
`research/colony-sweep/`: `scouts/<group>--<criterion>.md`, `groups/<group>.md`,
`audits/<group>.md`, `CHIEF-AUDIT.md`, `BOARD.md`.

### Run it in waves. This is not optional.

The first full run died on the usage limit with **123 of 128 agents unstarted** — five
scout reports out of 112, and the chief auditor and board never ran at all. 142 agents do
not fit inside one window. So the script takes `args`:

| `args` | What runs |
|---|---|
| `{ groups: ["storefronts", "payment-rails"] }` | Those groups only: their scouts, supervisors and auditors. The board is skipped. |
| `{ board: true }` | No scouts. The chief auditor and board read the group reports off disk and decide. |
| omitted | Everything. Only sane on a fresh window with nothing else running. |

Two or three groups per wave (roughly 20-30 agents) is the size that reliably lands. The
board is deliberately skipped inside a wave: it decides across the whole portfolio, and a
board that judges a slice is deciding without the evidence it needs. Run the board wave
once every group has been swept — and it is told to name the groups still missing, because
an unsearched group is not an empty one.

A run that dies can also be replayed rather than repeated: `Workflow({scriptPath,
resumeFromRunId})` returns every completed agent from cache and only re-runs what failed.

Track coverage from the CLI:

```bash
pnpm exec tsx scripts/colony.ts criteria                    # coverage per group
pnpm exec tsx scripts/colony.ts criteria --due --briefs     # what to search next, with the briefs
pnpm exec tsx scripts/colony.ts criteria --mark <id|group>  # record a completed search
pnpm exec tsx scripts/colony.ts criteria --supervised <id>  # record a supervisor report
```

A criterion goes stale after `SWEEP_INTERVAL_DAYS` (30). Coverage is stored in the
colony database's `kv` table, so it survives across sessions and machines.

## Model routing

Per `CLAUDE.md`: the 112 scouts, 14 supervisors and 14 auditors run on **Opus 5** — they
are sweeps and mechanical verification. The **chief auditor and the board run on Fable
5.1**, because those two are the judgement calls: which findings survive, and where the
money goes. Two Fable agents at the top of a 142-agent fleet is the whole point of the
rule — Fable costs twice as much and its quota has died mid-run before, so it is spent
only where being wrong is expensive and hard to detect.

## What the scouts can actually reach

The egress proxy blocks `WebFetch` for nearly every domain — paddle.com, dev.to, news
sites, vendor docs all return `EGRESS_BLOCKED`. What works is **WebSearch** (snippets plus
a synthesized answer) and **WebFetch against github.com**. `curl` never works.

That is an evidence ceiling, not a detail. A scout can usually establish *what a page
says* through a snippet quoting it, but not read the page itself, so claims come back one
grade weaker than they look. The scout prompt therefore requires each claim to name the
kind of evidence under it — rendered page, search snippet, or nothing — and, where a claim
matters and only a snippet was available, to print the exact URL a human or an unblocked
agent must open to settle it.

The first sweep's Paddle scout did this correctly and it is the model: it marked "is Israel
on Paddle's supported-seller list" as UNKNOWN-leaning-YES rather than YES, and named the
two pages that would close the question. Read a scout that reports no such limits with
suspicion.

## Why a scout cannot lie usefully

Every scout is required to return a URL it actually opened, and to answer three questions
that cannot be bluffed past the next level: who the buyer is, whether the money can reach
an Israeli, and what the ToS says. The supervisor spot-checks the strongest claims. The
auditor is instructed to *refute*, is told to default to scepticism, and is checked in
turn by a chief auditor whose first job is to name auditors who rubber-stamped. An
optimistic number has to survive four levels, each with a different incentive.

That is the difference between 142 agents and 142 opinions.
