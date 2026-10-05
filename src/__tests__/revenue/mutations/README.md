# Mutation plans

One JSON plan per script, in `scripts/mutate.mjs`'s `--plan` format: the mutations the builds of that script were
reviewed with, kept here so a reviewer or a fixer runs the same list again instead of rebuilding it from a log's prose
(ticks 47-50 each did, because the plan died with its builder's scratch folder).

| Plan | Script(s) | Tests | From |
| --- | --- | --- | --- |
| `capture-check.json` | `scripts/capture-check.mjs` | `capture-check.test.ts` | ticks 33, 34, 35 |
| `freeze-capture.json` | `scripts/freeze-capture.mjs` | `freeze-capture.test.ts` (+ `remask-captures`, `frozen-citations`) | ticks 38, 50 |
| `loop-edit.json` | `scripts/loop-edit.mjs` | `loop-edit.test.ts` | tick 43 |
| `mutate.json` | `scripts/mutate.mjs` (`--check`) | `mutate.test.ts` | tick 51 |
| `prize-dispatch.json` | `scripts/prize-dispatch.mjs`, `src/revenue/ai-allowed-events.ts` | `prize-dispatch.test.ts` | tick 47 |
| `remask-captures.json` | `scripts/remask-captures.mjs` (+ `freeze-capture.mjs`'s `maskedMeta`) | `remask-captures.test.ts` | ticks 49, 50 |
| `render-watch.json` | `scripts/render-watch.mjs` (the address mask) | `render-watch.test.ts` | ticks 48, 50 |
| `sim-tree.json` | `scripts/sim-tree.sh` | `sim-tree.test.ts` | tick 51 |

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
- A full run (every mutation, the baseline before and after) is for a build's review: one plan takes from about a
  minute (`render-watch.json`, `prize-dispatch.json`) to about fifteen (`capture-check.json`, whose test file takes
  18 s); the build log records the counts and the time.
- To simulate a command that writes for real (`remask-captures.mjs --apply`, `freeze-capture.mjs --apply`) before
  anyone runs it on the repository, use `scripts/sim-tree.sh -- <command>`: a throwaway copy of the checkout at a ref.
