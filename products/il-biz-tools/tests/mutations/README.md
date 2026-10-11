# Mutation plans for il-biz-tools

Plans in `scripts/mutate.mjs`'s `--plan` format, kept beside the product's tests (the repository's own plans live in
`src/__tests__/revenue/mutations/`; that folder's README has the format and the rules). The product has its own vitest
(`package.json`: 4.1.11, the root has 2.x), so an entry names no test paths: every mutation runs the product's whole suite
with the `--cmd` below, about 11 s a run.

| Plan | What it mutates | From |
| --- | --- | --- |
| `osek-patur-2026.json` | the osek patur ceiling's pending 2026 (`src/config/osek-patur.json`, `src/config/osek-patur-unverified.json`, `src/lib/osek-patur.js`, `src/lib/source-line.js`, `src/lib/publish-gate.js`, `osek-patur.html`, `index.html`, `README.md`) | ruling 11.10 row 27 fold 10 (`T68-OP1` to `OP22`, tick 68 builder); the review's `T68R-X1` to `X7` (tick 68 fixer) |

## Running a plan

From the repository root, after committing (the tree is the last commit):

```bash
node scripts/mutate.mjs --check --plan products/il-biz-tools/tests/mutations/osek-patur-2026.json --cmd "node products/il-biz-tools/node_modules/vitest/vitest.mjs run --root products/il-biz-tools"
scripts/sim-tree.sh -- bash -c 'ln -s "$0/products/il-biz-tools/node_modules" products/il-biz-tools/node_modules && exec node scripts/mutate.mjs --plan products/il-biz-tools/tests/mutations/osek-patur-2026.json --cmd "node products/il-biz-tools/node_modules/vitest/vitest.mjs run --root products/il-biz-tools"' "$PWD"
```

- `--cmd` is split on spaces and run without a shell, so it cannot be `cd products/il-biz-tools && npx vitest run`
  (the form the ruling's fold 10 wrote); `--root` does the same.
- `scripts/sim-tree.sh` links only the root's `node_modules` into its tree, so the product's own is linked first (`$0`
  is the checkout, passed as the argument after the script). The checkout must have run `npm install` in
  `products/il-biz-tools`. As with the root's link, whatever vitest writes into `node_modules` lands in the checkout's.
- `src/__tests__/revenue/mutation-plans.test.ts` runs `--check --allow-dirty` with this `--cmd` over every plan here on
  every test run, so a find text that moves fails there until the plan follows the code.

| Plan | Entries | Full run (s) |
| --- | --- | --- |
| `osek-patur-2026.json` | 29 | 448 (tick 68 fixer, in sim-tree.sh with the product's `node_modules` linked, beside the full `scripts/verify.sh` and then the `owner-steps.json` and `freeze-capture.json` plans, the tree's setup included; all 29 killed; baselines 18.3 and 13.5); about 270 for the first 22 (tick 68 builder: all killed, baselines 10.9 and 10.8) |
