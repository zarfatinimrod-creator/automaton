# Third-party skills: what is vendored here, what is not, and why

Added 4.9.2026 at the owner's request ("מה שאני שולח פה תתקין לclaude עכשיו ותשתמש אם אתה יכול"),
alongside the three repos added on 3.9.2026 (`docs/AWESOME_ROUTE.md`, `CLAUDE.md`), and extended
6.9.2026 with three more the owner sent (second section below).

## The five repos the owner sent

| Repo | What it is | What happened |
|---|---|---|
| [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | 25 engineering-lifecycle skills, MIT | **All 25 vendored** |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | 37 skills, MIT | **23 vendored** (`engineering/` + `productivity/`) |
| [`affaan-m/ECC`](https://github.com/affaan-m/ECC) | 286 skills + 68 agents, MIT | **37 vendored** of 286 |
| [`NousResearch/hermes-agent`](https://github.com/NousResearch/hermes-agent) | 58 core + ~138 optional skills/MCPs, MIT | **16 vendored** of 196 |
| [`mrdoob/three.js`](https://github.com/mrdoob/three.js) | A WebGL 3D rendering library | **Not installed — it is not a skill.** See below |

101 skills vendored into `.claude/skills/`, joining the 14 Superpowers skills already there.
All four skill repos are MIT; each vendored directory keeps its upstream `SKILL.md` verbatim except
for the `name:` field, which is prefixed to match its directory.

## The three repos sent on 6.9.2026 ("את כל הקישורים ששלחתי לך דרך github אני רוצה שתכניס לclaude")

| Repo | What it is | What happened |
|---|---|---|
| [`Panniantong/Agent-Reach`](https://github.com/Panniantong/Agent-Reach) | A Python CLI (`pip install agent-reach`) that picks, installs and health-checks a read backend per platform — Twitter/X, Reddit, YouTube, Instagram, LinkedIn, GitHub, RSS, the Chinese platforms — plus **one skill** that routes the agent to them. MIT | **The skill vendored** as `agent-reach`, from its English twin `SKILL_en.md` (the primary is Chinese). The CLI was installed into a venv and exercised — see below |
| [`diegosouzapw/OmniRoute`](https://github.com/diegosouzapw/OmniRoute) | An OpenAI-compatible AI gateway over 356 providers, 150+ of them free tiers, with 47 skills that are its generated operator manual (`omniroute …` and `curl` against its own REST API). MIT | **7 vendored** as `or-*`: the six needed to stand it up and meter it (`cli-setup`, `cli-serve`, `cli-providers`, `omni-inference`, `omni-combos-routing`, `cli-cost-usage`) and `ponytail`, an external MIT skill it bundles |
| [`AgriciDaniel/claude-obsidian`](https://github.com/AgriciDaniel/claude-obsidian) | A Claude Code plugin for source-cited Obsidian knowledge bases: capture → source and claim ledgers → linked pages → deterministic lint and BM25 retrieval. 15 skills over a stdlib-only Python 3.11 core. MIT | **All 15 vendored** as `co-*`, and the core vendored to `vendor/claude-obsidian/` (861 KB) so they run from a fresh clone |

23 more skills, 124 vendored in total. Measured cost of the set now carried: **~10,300 tokens per
session** (was ~8,200). The installer now measures the wholesale alternative from the clones it is
given rather than quoting a number: all 1,220 `SKILL.md` files across the seven repos would be
~78,800 tokens per session. ECC alone has grown from 393 to 898 files since 4.9.2026.

**Why 7 of OmniRoute's 47.** The 47 are generated from the gateway's CLI and OpenAPI surface, and
every one of them is a set of commands against a running OmniRoute. Nothing runs it here — it needs
Node ≥22.22, 82 dependencies, provider accounts, and egress this container does not have. What the
gateway *could* be for the colony is a single OpenAI-compatible endpoint fanning across free tiers
for the automaton runtime, which has no inference keys yet. So the skills carried are the ones that
stand it up, connect providers, route with fallback, expose the inference API and meter the cost;
the other 40 (tunnels, webhooks, backups, A2A, MCP, eval, version manager, and two stubs whose body
is "No endpoints mapped for this area yet") are one edit of the allowlist away. `ponytail` is the
exception: it is not about OmniRoute at all — it is DietrichGebert's "laziest solution that works"
discipline, and it names the failure mode of the vitest/arborist episode exactly.

**What the installer had to learn for these three.** A skill entry can now name the file to install
as `SKILL.md` (Agent-Reach keeps an English twin), can set its final name outright (`agent-reach`,
not `reach-skill`), and a source can carry literal rewrites and a runtime to vendor. claude-obsidian
needed both: its skills hard-code `PRODUCT_ROOT=/absolute/path/to/installed/claude-obsidian` and
link to each other by upstream directory name (`../wiki/references/…`), so the installer rewrites
the placeholder to `"$(git rev-parse --show-toplevel)/vendor/claude-obsidian"` and the links to the
prefixed names. Every rewritten link was checked to resolve.

**What was verified, not assumed, on 6.9.2026:**

- The vendored claude-obsidian core runs from `vendor/`: `--version` → 2.1.1; a scratch vault was
  initialised through its two-step plan-then-apply (the apply refuses without the dry-run's
  SHA-256), `doctor` returned `ok: true`, and `lint --format markdown` returned a clean report.
- `pip install agent-reach` succeeds here (PyPI is reachable), the `rss` channel installs, and
  `agent-reach get rss <GitHub atom feed>` returned this branch's commit log as clean text. The same
  command against `hnrss.org` fails with `Tunnel connection failed: 403 Forbidden` — the egress proxy,
  as expected. Two things to know before relying on the skill: the PyPI wheel's channel index lists
  only `rss` and `youtube` (the 15-platform routing table in the skill describes the GitHub HEAD,
  which its own guide installs from the archive URL), and the skill's description says **MUST USE**
  for any URL or platform mention, so on a host without the CLI it will fire and fail. Its own rule 1
  — run `agent-reach doctor --json` before acting — is the guard.
- OmniRoute was **not** run. `npm view omniroute version` answers 3.8.50 against the clone's 3.8.51,
  so the package is live; standing it up is a decision for when the automaton runtime needs an
  endpoint, and it will need provider accounts — which the owner's constraints put on the owner.
- The repo copy of `.claude/skills/` registers on its own. This install wrote nothing to
  `~/.claude/skills/` and all 23 new skills were offered in the same session — the question left
  open in `CLAUDE.md` since 3.9.2026 is closed.

## Why not all 651

A skill's `name` and `description` sit in the context of **every session**, invoked or not. Measured
across the four repos:

| Collection | Skills | Tokens per session if taken whole |
|---|---:|---:|
| `addyosmani/agent-skills` | 25 | ~2,000 |
| `mattpocock/skills` | 37 | ~1,500 |
| `NousResearch/hermes-agent` | 196 | ~3,400 |
| `affaan-m/ECC` | 393 | ~25,700 |
| **Total** | **651** | **~32,600** |

Against the 101 actually installed: **~8,200 tokens per session**. The ~24,400 saved is not a
rounding error — `MISSION.md` exists to spend tokens on finding money, and a permanent per-session
tax on that budget has to earn its place. ECC is the whole story here: it is by far the largest and
the most uneven, carrying Kotlin Exposed patterns, homelab WireGuard, HIPAA compliance and Manim
video next to the material that is genuinely useful to us.

The selection rule, applied to every skill, is in `scripts/install-skills.mjs` as an explicit
allowlist. A skill is in if it plausibly serves one of:

- **money** — finding, building, pricing, selling, or getting paid for something
- **colony** — running the chain of command (loops, councils, budgets, evaluation)
- **discipline** — guarding a failure mode this repo has actually had

Nothing is lost. To install any skill that was skipped:

```bash
git clone --depth 1 --filter=blob:none https://github.com/affaan-m/ECC /tmp/ecc
cp -r /tmp/ecc/skills/<name> .claude/skills/ecc-<name>   # then fix the frontmatter `name:`
```

Or edit the allowlist in `scripts/install-skills.mjs` and re-run it:

```bash
node scripts/install-skills.mjs --clone-dir /tmp/clones --user
```

## `three.js` is not a skill, and installing it would have been a mistake

`mrdoob/three.js` is a WebGL 3D rendering library — a JavaScript dependency, not agent instructions.
There is no `SKILL.md` in it and nothing for the skill loader to register. It could only enter this
repo as an npm dependency of something that renders 3D in a browser, and **no line in
`src/revenue/portfolio.ts` renders 3D**. Adding ~1.3 GB of clone (or a dependency nothing imports)
to serve nothing is the opposite of what the mandate asks for.

If a future line ever needs it — a product with a 3D configurator, say — it installs in one command
at that time. Recorded rather than silently dropped, because "the owner sent five and I used four"
should be visible, not buried.

## The most useful thing these skills produced on day one

`hermes-mpp-agent` pointed at the Machine Payments Protocol as a rail separate from x402, naming
AgentCash's "300+ pre-priced APIs" as a discovery surface. Chasing it down produced two verified
corrections and one live defect — see `products/x402-il-api/README.md` and `logs/CHECKPOINT.md`:

1. **The skill conflated two rails.** `agentcash` on npm describes itself as *"Generic MCP server for
   calling x402-protected APIs"* and depends on `@x402/core` and `@x402/evm`. AgentCash is an **x402**
   directory, not an MPP one — so this repo's existing Bazaar finding (91.2% of listings under ten
   calls a month) already covers its demand side.
2. **The skill's Express claim is wrong.** It lists `mppx/express` among the server middlewares.
   `mppx@0.9.2` exports `./hono`, `./elysia`, `./nextjs`, `./server` — **there is no `./express`**.
   `products/x402-il-api` is an Express app, so MPP is not a drop-in for it.
3. **A real defect in our own product**, found on the way (**migrated 5.9.2026**, see the product README): we pinned `x402-express@1.2.0`, last
   published 2026-04-16. The ecosystem moved to the scoped `@x402/*` line, which shipped
   **`@x402/express@2.25.0` on 2026-09-04** — the same day this was checked. Same two npm
   maintainers (`erik_cb`, `carsonroscoe_cb`), same Apache-2.0 licence, same repo, so it is the
   legitimate successor and not a typosquat.

That is the argument for these collections in one paragraph: not that the skills are right — two of
three claims checked were wrong — but that they are **leads worth checking**, and checking them
found something in our own code that nobody had looked at.

## Attribution

All seven collections are MIT licensed and vendored with their `LICENSE` terms intact upstream.
Copyright: Addy Osmani (2025), Matt Pocock (2026), Affaan Mustafa (2026), Nous Research (2025),
Agent Eyes / Neo Reid (2025, Agent-Reach), diegosouzapw (2026, OmniRoute), Dietrich Gebert (ponytail),
AgriciDaniel / AI Marketing Hub (2026, claude-obsidian — its `LICENSE` travels in
`vendor/claude-obsidian/`).
