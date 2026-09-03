---
name: revenue-criteria-sweep
description: Playbook for running the 112-scout criteria sweep through the chain of command and folding its output into the portfolio.
auto-activate: false
---

# Criteria sweep — board playbook

Why this exists: the owner asked for at least a hundred agents searching by criteria, a supervisor over each group of criteria, and the chain of command running the loop. The sweep is how the colony widens its search space without the board inventing opportunities from its own head. 112 scouts, 14 supervisors, 14 auditors, a chief auditor and the board — see `docs/CRITERIA_SWEEP.md` for the shape and `src/revenue/criteria.ts` for the registry.

Loop
1. Decide the scope: `pnpm exec tsx scripts/colony.ts criteria --due` lists what has gone stale (30 days). A full sweep is 142 agents; a partial sweep of the due groups is the normal cadence.
2. Regenerate the script if the registry changed: `pnpm exec tsx scripts/gen-sweep-workflow.ts`. Never hand-edit `workflows/colony-criteria-sweep.js` — a test asserts it matches the registry.
3. Run `workflows/colony-criteria-sweep.js` through the Workflow tool **in waves of two or three groups**: `args = { groups: [...] }`. A full 142-agent fan-out does not fit in one usage window — the first attempt died with 123 of 128 agents unstarted. Once every group is swept, run `args = { board: true }` for the chief auditor and board, which read the group reports off disk. Scouts on Opus, chief auditor and board on Fable, per the routing rule in CLAUDE.md. A run that dies mid-way is replayed with `resumeFromRunId`, not restarted.
4. Read `research/colony-sweep/CHIEF-AUDIT.md` first, not the group reports. The chief auditor names the auditors who rubber-stamped and the systemic optimism; the group rankings mean less before you know which ones were checked properly.
5. Fold the board's decisions in: new lines into `src/revenue/portfolio.ts`, retargets and kills applied to existing lines, the owner checklist into `logs/CHECKPOINT.md`, repo additions into `skills/` and `src/`.
6. Record coverage: `colony criteria --mark <group>` and `--supervised <group>` for every group that completed, so the next sweep searches what is actually stale.

What the board is allowed to promote
- Payable to Israel with evidence. "The marketplace serves Israeli buyers" is not evidence that it pays Israeli sellers; those are different questions and the auditors are told to attack exactly this.
- GREEN on terms of service. AMBER and RED are recorded as rejected with the reason, never built.
- A named buyer. A candidate whose buyer is "small businesses" has not been researched, it has been imagined.
- Auditor-corrected numbers, never the supervisor's originals.

Reality: most criteria return nothing worth building, and that is the point — a group that honestly yields dead ends has saved the colony from re-searching it for 30 days. Expect single-digit survivors from 112 criteria. A sweep that promotes forty candidates was not audited, it was agreed with.

Never: promote a finding whose URL nobody opened; let a scout's number reach the portfolio without an auditor's correction; add an owner setup step that no platform actually demands; re-run a full sweep when only two groups are stale.
