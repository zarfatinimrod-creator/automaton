# CLAUDE.md — working conventions for this repository

## Read this first
- `MISSION.md` is the heart of this repo: the owner's mandate and the rules it implies. Read it before anything else, every session.
- Then `logs/CHECKPOINT.md` for where the last session stopped.

## Checkpoint (always)
- `logs/CHECKPOINT.md` is the single "where we stopped" file. Update it before ending any session or long task: current branch, what is done, what is in progress, exact next steps, open questions for the owner.
- Read it first at the start of every session and continue from there.

## Per-task log (always, at the end of every task)
Create `logs/YYYY-MM-DD-<task-slug>.md` with these sections, in this order:
1. מה המשתמש ביקש (what the user asked)
2. הפעולות המרכזיות שביצעתי (key actions)
3. קבצים/מערכות ששונו (files and systems changed)
4. החלטות והנחות משמעותיות (decisions and assumptions)
5. שגיאות וניסיונות שנכשלו (errors and failed attempts)
6. בדיקות ופעולות ולידציה (tests and validation)
7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית (repeated manual work worth automating)
8. על מה בוזבזו אסימונים, לפי פעולה (token waste per action)

Write the log in Hebrew (the owner's language); code identifiers stay in English. Commit logs together with the work.

## Model routing rule (owner's instruction)

The owner authorised routing work between models at our own discretion. **Claude Opus 5
is the driver; Claude Fable 5.1 is reserved for the hard thinking.** Fable costs exactly
twice as much ($10/$50 per 1M tokens versus $5/$25) and its quota has died mid-run twice
on this project, so spending it on routine work buys nothing and costs the session.

| Route to **Opus 5** (default) | Route to **Fable 5.1** (reserved) |
|---|---|
| Writing and wiring code, tests, CI | Adversarial verification of research findings |
| Documentation, READMEs, playbooks | Deciding where money goes: portfolio synthesis, kill/scale calls |
| Product build-out and refactors | Architecture decisions with long-lived consequences |
| Routine research sweeps and data gathering | Subtle bug hunts and security review |
| Anything mechanical or well-specified | Anything where being wrong is expensive and hard to detect |

How to apply it:
- **In subagents and workflows**, set the model explicitly per agent: `model: 'opus'` for
  sweeps and build work, `model: 'fable'` for verification and judgement stages. This is
  the main lever and needs no owner action.
- **For the session model**, only the owner can switch. Say plainly when a step deserves
  Fable and let them decide; never stall waiting for it.
- **When Fable's quota runs out**, do not stop the project. Record it in
  `logs/CHECKPOINT.md`, continue the Opus-suitable work, and queue the Fable-suitable
  steps for when it renews.
- Never downgrade below these two for project work. Haiku and Sonnet are not in the rota.

**Fleets (many agents at once).** The same split scales: the searching tier runs on Opus,
the deciding tier on Fable. In the 142-agent criteria sweep that means 112 scouts, 14
supervisors and 14 auditors on Opus, and exactly two agents — the chief auditor and the
board — on Fable. Putting Fable in the fan-out is how the quota died before; putting it
at the top is what the rule is for. Set `model` explicitly on every agent in a fleet:
inheriting the session model means a session switch silently re-tiers a hundred agents.

## Build / test
- `pnpm install`, `pnpm typecheck`, `pnpm test` (full suite takes >10 minutes here; run targeted files with `npx vitest run <path>` while iterating).
- Revenue colony: `src/revenue/`, docs in `docs/CHAIN_OF_COMMAND.md` and `docs/INCOME_PLAN.he.md`, playbooks in `skills/`.
