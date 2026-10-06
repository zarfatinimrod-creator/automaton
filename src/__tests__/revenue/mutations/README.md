# Mutation plans

One JSON plan per script, in `scripts/mutate.mjs`'s `--plan` format: the mutations the builds of that script were
reviewed with, kept here so a reviewer or a fixer runs the same list again instead of rebuilding it from a log's prose
(ticks 47-50 each did, because the plan died with its builder's scratch folder).

| Plan | Script(s) | Tests | From |
| --- | --- | --- | --- |
| `address-kinds.json` | `scripts/address-kinds.mjs` (render-dispatch.sh's step 7 runs it) | `address-kinds.test.ts` (+ `render-dispatch` for the five entries moved from its plan) | ticks 52, 53 |
| `capture-check.json` | `scripts/capture-check.mjs` | `capture-check.test.ts` | ticks 33, 34, 35 |
| `freeze-capture.json` | `scripts/freeze-capture.mjs` | `freeze-capture.test.ts` (+ `remask-captures`, `frozen-citations`) | ticks 38, 50 |
| `loop-edit.json` | `scripts/loop-edit.mjs` | `loop-edit.test.ts` | tick 43 |
| `mutate.json` | `scripts/mutate.mjs` (`--check`) | `mutate.test.ts` | tick 51 |
| `prize-apply-reading.json` | `scripts/prize-apply-reading.mjs` | `prize-apply-reading.test.ts` | tick 52 |
| `prize-dispatch.json` | `scripts/prize-dispatch.mjs`, `src/revenue/ai-allowed-events.ts` | `prize-dispatch.test.ts` | tick 47 |
| `remask-captures.json` | `scripts/remask-captures.mjs` (+ `freeze-capture.mjs`'s `maskedMeta`) | `remask-captures.test.ts` | ticks 49, 50 |
| `remask-run.json` | `scripts/remask-run.sh` | `remask-run.test.ts` | tick 53 |
| `render-dispatch.json` | `scripts/render-dispatch.sh` | `render-dispatch.test.ts` | tick 52 |
| `render-watch.json` | `scripts/render-watch.mjs` (the address mask) | `render-watch.test.ts` | ticks 48, 50 |
| `sim-tree.json` | `scripts/sim-tree.sh` | `sim-tree.test.ts` | ticks 51, 52 |

## An entry

```json
{ "id": "T34-C2", "file": "scripts/capture-check.mjs", "find": "if (length >= MIN_TERMS_TEXT) {",
  "replace": "if (length > MIN_TERMS_TEXT) {", "test": "src/__tests__/revenue/capture-check.test.ts",
  "note": "tick 34 C2: a text of exactly MIN_TERMS_TEXT characters is no longer enough" }
```

- `find` must occur exactly once in `file`, or carry `"nth": <k>` (1-based) when it occurs more than once; `replace`
  must differ. Each mutation is applied alone to the committed file, so two entries may share a `find`.
- `test` is a path or an array of paths, the vitest files that must fail when the mutation is applied.
- `note` says which behaviour the mutation breaks, and where it came from (`tick 49 M7`, `tick 50 fixer F3`). An id is
  unique in its plan; the ids keep the build logs' names where there was one.
- A mutation that is not a change of behaviour (an equivalent one) or that no test can observe is not kept: say so in
  the build's log instead.

## Adding a plan, or entries

1. Write the entries; run `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/<script>.json`
   from the repository root. It runs no test and takes no lock: exit 0 when every mutation would apply, 1 naming each
   one that would not (a find text not found or found twice, a replacement equal to it, a missing test path, a file
   with uncommitted changes unless `--allow-dirty`).
2. Commit the script and the tests (mutate.mjs mutates only committed, unmodified files), then run the plan for real:
   `node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/<script>.json`. Every mutation must be killed. A
   survivor means a test is missing: add it (it fails on the mutant, passes on the code), or drop the entry if the
   mutation is not a real change of behaviour.
3. Do not touch the checkout while a plan runs: mutate.mjs stops with exit 4 when the tree changes under it.

## What runs where

- `src/__tests__/revenue/mutation-plans.test.ts` runs `--check --allow-dirty` over every plan here on every test run
  (CI included): a refactor that moves a find text fails it until the plan follows the code. `--allow-dirty` because
  the question there is whether each plan still fits the code on disk, also while a script is being edited.
- A full run (every mutation, the baseline before and after) is for a build's review; the build log records the
  counts and the time. Measured in ticks 51 and 52 (one full run each, seconds; two numbers where the plan ran twice;
  tick 52's inside sim-tree.sh: the builder's two at a time, the fixer's prize-apply-reading and render-dispatch at the
  same time as each other, the fixer's sim-tree alone):

  | Plan | Entries | Full run |
  | --- | --- | --- |
  | `prize-dispatch.json` | 28 | 69 |
  | `render-watch.json` | 53 | 117 |
  | `freeze-capture.json` | 23 | 171 |
  | `loop-edit.json` | 46 | 188, 191 |
  | `address-kinds.json` | 22 | 198 (tick 53 fixer, beside the whole revenue suite; the builder's 17 entries: 156) |
  | `remask-run.json` | 23 | 210 (tick 53 fixer; the builder's 14 entries: 87, after a first run of 94 s left one survivor) |
  | `mutate.json` | 11 | 393 (243-249 with the first 6) |
  | `remask-captures.json` | 45 | 523 |
  | `prize-apply-reading.json` | 40 | 580 (208 with the first 21) |
  | `render-dispatch.json` | 26 | 591 (184 with the first 14); 21 entries since tick 53, its five address-report entries moved to `address-kinds.json` |
  | `capture-check.json` | 42 | 785, 827 (its test file alone takes about 18 s) |
  | `sim-tree.json` | 36 | 927 (501 with the first 28, 349 with the first 24, 182-184 with the first 14) |

- A long plan can run in a throwaway copy of the checkout, so the worktree stays free (mutate.mjs holds the
  checkout's lock for the whole run and stops with exit 4 when the checkout changes under it):
  `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/<script>.json`. The copy is
  the last commit, so commit first. When a mutation survives, mutate.mjs exits non-zero and sim-tree keeps the copy
  and prints a removal command for it.
- `scripts/sim-tree.sh -- <command>` is also how a command that writes for real (`remask-captures.mjs --apply`,
  `freeze-capture.mjs --apply`) is simulated before anyone runs it on the repository.
- In a sim tree, node_modules is a link to the checkout's own: whatever the command writes there lands in the
  checkout (vitest's results cache in node_modules/.vite is written through it on every run). Never install into it
  or delete from it from inside a sim tree; `git status` would not show the damage.
