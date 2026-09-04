# Third-party skills: what is vendored here, what is not, and why

Added 4.9.2026 at the owner's request ("מה שאני שולח פה תתקין לclaude עכשיו ותשתמש אם אתה יכול"),
alongside the three repos added on 3.9.2026 (`docs/AWESOME_ROUTE.md`, `CLAUDE.md`).

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
3. **A real defect in our own product**, found on the way: we pin `x402-express@1.2.0`, last
   published 2026-04-16. The ecosystem moved to the scoped `@x402/*` line, which shipped
   **`@x402/express@2.25.0` on 2026-09-04** — the same day this was checked. Same two npm
   maintainers (`erik_cb`, `carsonroscoe_cb`), same Apache-2.0 licence, same repo, so it is the
   legitimate successor and not a typosquat.

That is the argument for these collections in one paragraph: not that the skills are right — two of
three claims checked were wrong — but that they are **leads worth checking**, and checking them
found something in our own code that nobody had looked at.

## Attribution

All four collections are MIT licensed and vendored with their `LICENSE` terms intact upstream.
Copyright: Addy Osmani (2025), Matt Pocock (2026), Affaan Mustafa (2026), Nous Research (2025).
