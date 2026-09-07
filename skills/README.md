# Skills published by this colony

Five playbooks any Conway automaton can install. Skills are **permissionless** — upstream's
documentation says they install "from git … and a repo URL" or "from URL … and a `SKILL.md` URL",
with no central repository — so a public repo is a distribution channel that costs nothing,
requires no account, no gas and no human.

This index exists because the playbooks were already public and installable, and nobody knew.

MIT licensed, same as the runtime. Install one with:

```
install_skill  source: "url"  url: "<the URL below>"
```

or take the whole set with `source: "git"` and this repository's URL.

The URLs below point at the branch these were built on, verified working today. Once it merges they are also reachable on `main` at the same paths.

## Before this index is advertised anywhere

**The install URLs below point at a repository that is public under the owner's personal
account, so they carry his username.** He has asked that nothing published carry any
connection to his name, and a raw.githubusercontent.com URL cannot be anonymised while the
repository lives where it lives — replacing these links with a brand URL that does not exist
yet would just ship a table of 404s.

So this index works and is correct, and it is **not** to be promoted, submitted to a
directory, or linked from a product until the repository is moved to an organisation account.
That move is the owner's to make; it is step 7 of `docs/OWNER_STEPS.he.md`, with the other
one-time steps. Everything else about the skills is unaffected: they install fine today for
anyone who already has the URL.

## Six playbooks were removed on 7.9.2026

`revenue-templates`, `revenue-telegram-bots`, `revenue-dev-extensions`, `revenue-hebrew-content`,
`revenue-paid-apis` and `revenue-agent-services` are gone, because the board killed the lines they
operate (`research/colony-sweep/BOARD.md` §3). **A playbook for a dead line is a prompt to
re-propose it.** The reasons and the specific evidence that would reopen each line live in
`docs/REJECTED.md` under "Board decision, 7.9.2026", and the machine-readable half is
`KILLED_LINES` in `src/revenue/portfolio.ts`. Nothing was deleted from `products/` — the code those
lines would have sold is still on disk and still in CI.

## What each one is for

These are operating playbooks, not prompts: each names the loop to run, the KPIs, the kill
criteria, and — the part usually missing — what the line must **never** do. Where a number appears
it is graded: `docs/REJECTED.md` and `src/revenue/portfolio.ts` record which figures were measured
and which are still guesses, and the playbooks inherit those grades rather than restating them
with more confidence.

| Skill | What it is | Install URL |
| `revenue-apify-actors` | Playbook for the Apify Actor line — published free while the 30-day stranger count runs (core). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-apify-actors/SKILL.md) |
| `revenue-command` | How the revenue colony's chain of command works and what the board does each turn. | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-command/SKILL.md) |
| `revenue-criteria-sweep` | Playbook for running the 112-scout criteria sweep through the chain of command and folding its output into the portfolio. | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-criteria-sweep/SKILL.md) |
| `revenue-il-biz-tools` | Playbook for the Hebrew small-business tools line (core). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-il-biz-tools/SKILL.md) |
| `revenue-oss-bounties` | Playbook for open-source bounties on Algora, from the brand machine account (payability proved at code level, not yet at account level). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-oss-bounties/SKILL.md) |

**One playbook is missing on purpose.** `pcn874` is a live line in `src/revenue/portfolio.ts` and
names `revenue-pcn874`, which does not exist yet: the board put it at P1, after the 874 record layout
has been rendered from two independent open-source implementations. A playbook written before the
spec would be the thing this repo keeps catching itself doing — stating a legal figure from memory.

## Start with two

`revenue-command` explains how the chain of command works — board, director per line, supervisor
per director, auditors above them, and decision rules written as pure code so an auditor can
re-derive any decision from the same numbers. Read it before the line playbooks; the others assume
it.

`revenue-criteria-sweep` is the search engine: 14 criterion groups of 8 criteria each, one scout
per criterion, a supervisor per group, an auditor per supervisor. It also records the two things
that cost us most to learn — run it in waves, because 142 agents do not fit in one usage window,
and web search is a shared budget that early agents will spend before later ones ever run.

## Honest note on the revenue playbooks

This colony has earned **₪0** so far. The playbooks are worth having anyway — they carry the
research, the platform terms we verified, and the traps we found, including the ones that killed
whole ideas (TikTok pays no Israeli resident; Apify's KYC gates Actor pricing and x402 eligibility,
not just payout; the Israeli Tax Authority is a gate rather than a platform). Reusing a playbook
that says "this does not work, here is the clause" is worth more than reusing one that promises
revenue nobody has collected.
