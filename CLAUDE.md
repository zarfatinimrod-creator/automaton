# CLAUDE.md — working conventions for this repository

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

## Model rule (owner's instruction)
- Work only with Claude Fable 5.1 (`claude-fable-5-1`). When its quota is exhausted, stop, write "waiting for Fable 5.1 quota" in `logs/CHECKPOINT.md`, and resume after the quota renews. Never switch to another model to keep going.

## Build / test
- `pnpm install`, `pnpm typecheck`, `pnpm test` (full suite takes >10 minutes here; run targeted files with `npx vitest run <path>` while iterating).
- Revenue colony: `src/revenue/`, docs in `docs/CHAIN_OF_COMMAND.md` and `docs/INCOME_PLAN.he.md`, playbooks in `skills/`.
