# `scripts/workflows/` — Claude Code workflow scripts

These are not Node scripts. They run inside Claude Code's `Workflow` tool, which supplies `agent()`,
`parallel()`, `pipeline()`, `phase()` and `log()`:

```
Workflow({scriptPath: "/home/user/automaton/scripts/workflows/<file>.js"})
```

They live in the repo because the tool's own copies and resume caches live under `/root/.claude` and
die with the container; the 8.9 and 22.9 runs could not be resumed for that reason. A script here reads
only repo files and writes only the output paths it names, so any container with a clean clone can run it.

Every agent sets `model` explicitly (CLAUDE.md: inheriting the session model silently re-tiers a fleet).
Scripts named `fable-*` are the deciding tier and open with a one-word Fable probe; their order and
status are in [`logs/FABLE_QUEUE.md`](../../logs/FABLE_QUEUE.md).

| Script | Tier | What |
|---|---|---|
| `sweep-2-screen.js` | Opus | one adversarial screener per sweep-2 candidate → `research/colony-sweep/screen-2/` |
| `fable-faceless-youtube-judge.js` | Fable | judge + red-team for the owner's faceless-YouTube reel |
| `fable-owner-docs-judgement.js` | Fable → Opus | the 26 JUDGEMENT findings in the owner documents; Opus editors apply |
| `fable-license-choice.js` | Fable | how il-biz-tools Pro licences are issued without a per-sale owner step |
| `fable-sweep-2-board.js` | Fable | the sweep-2 board: audits the screeners, admits / tests / kills |
