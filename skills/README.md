# Skills published by this colony

Eleven playbooks any Conway automaton can install. Skills are **permissionless** — upstream's
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

## What each one is for

These are operating playbooks, not prompts: each names the loop to run, the KPIs, the kill
criteria, and — the part usually missing — what the line must **never** do. Where a number appears
it is graded: `docs/REJECTED.md` and `src/revenue/portfolio.ts` record which figures were measured
and which are still guesses, and the playbooks inherit those grades rather than restating them
with more confidence.

| Skill | What it is | Install URL |
| `revenue-agent-services` | Playbook for zero-KYC x402 services sold to other agents (experimental). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-agent-services/SKILL.md) |
| `revenue-apify-actors` | Playbook for the Apify pay-per-event Actor portfolio line (core). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-apify-actors/SKILL.md) |
| `revenue-command` | How the revenue colony's chain of command works and what the board does each turn. | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-command/SKILL.md) |
| `revenue-criteria-sweep` | Playbook for running the 112-scout criteria sweep through the chain of command and folding its output into the portfolio. | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-criteria-sweep/SKILL.md) |
| `revenue-dev-extensions` | Playbook for browser/editor extensions with a paid pro tier (experimental). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-dev-extensions/SKILL.md) |
| `revenue-hebrew-content` | Playbook for the Hebrew content + affiliate line (experimental, slow). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-hebrew-content/SKILL.md) |
| `revenue-il-biz-tools` | Playbook for the Hebrew small-business tools line (core). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-il-biz-tools/SKILL.md) |
| `revenue-oss-bounties` | Playbook for open-source bounties (experimental, unverified payout to Israel). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-oss-bounties/SKILL.md) |
| `revenue-paid-apis` | Playbook for paid developer APIs over x402 and an API marketplace (growth). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-paid-apis/SKILL.md) |
| `revenue-telegram-bots` | Playbook for Telegram bots paid in Stars (experimental). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-telegram-bots/SKILL.md) |
| `revenue-templates` | Playbook for spreadsheet/Notion templates on Etsy and an own store (growth). | [SKILL.md](https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/claude/monthly-income-plan-pfs7vu/skills/revenue-templates/SKILL.md) |

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
