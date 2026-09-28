export const meta = {
  name: 'mcp-il-tools-publish-prep',
  description: 'Launch prep for the free MCP server: registry namespace moved to io.github.mehudak, a dispatch-only publish workflow gated on owner steps 7 and 9, pinned by tests (Opus, worktree), adversarial review, one fix pass.',
  phases: [
    { title: 'Build', detail: 'one Opus builder in an isolated worktree', model: 'opus' },
    { title: 'Review', detail: 'two adversarial Opus reviewers: supply-chain/security and registry correctness', model: 'opus' },
    { title: 'Fix', detail: 'one fix pass', model: 'opus' },
  ],
}

const BASE = (typeof args !== 'undefined' && args && args.base) ? args.base : 'HEAD'

const TRAILER = `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VRCJXMqMdAnbYz2TwWreJn`

const BUILD = `You are an Opus builder in an ISOLATED git worktree of /home/user/automaton (base branch claude/new-session-j071dx).
FIRST, before touching any file: run \`git log --oneline -1\` and \`ls products/mcp-il-tools scripts\`. If \`git merge-base --is-ancestor ${BASE} HEAD\` fails, run \`git reset --hard claude/new-session-j071dx\` and check again (worktrees here have started on stale bases).
Rules: never run \`git stash\`; never push; commit only in your worktree branch; do NOT edit logs/CHECKPOINT.md, logs/CHANNEL_LOOP.md, logs/FABLE_QUEUE.md, MISSION.md, CLAUDE.md or docs/OWNER_STEPS.he.md. Test-first (invoke the test-driven-development skill). No personal names anywhere; the only public face is the brand Mehudak / מהודק. Every commit ends with exactly:
${TRAILER}

CONTEXT (read these first): products/mcp-il-tools/{package.json,server.json,README.md}; research/owner-docs-audit/mcp-il-tools.md (findings F3 "no mcpName" and F4 "websiteUrl at an unowned domain"); docs/OWNER_STEPS.he.md:285-300 (the domain, step 5, is FROZEN by the owner's ₪0 rule; the registry namespace is io.github.mehudak, from the GitHub organisation "mehudak", AFTER owner step 7); logs/2026-09-27-zero-shekel-rule.md item 8 (modelcontextprotocol/registry github_oidc.go buildPermissions grants io.github.<repository_owner>/*). Today the repo is still under a personal account whose name must never be published.

TASK — make the free MCP server publishable with ONE workflow dispatch once the owner has done step 7 (the "mehudak" GitHub organisation owns this repo) and step 9 (an npm account "mehudak" plus the NPM_TOKEN repository secret). Nothing is published by this task.
1. server.json: "name" becomes "io.github.mehudak/il-tools"; remove "websiteUrl" (mehudak.com is not owned and step 5 is frozen). Verify the "$schema" URL and every field against the registry's CURRENT schema and docs on github.com (WebFetch works for github.com and raw.githubusercontent.com only; cite the file and commit you read). Keep versions in step.
2. package.json: add "mcpName": "io.github.mehudak/il-tools" (the registry's npm ownership check reads it; cite where in the registry source or docs). Do NOT add "repository", "homepage", "author", "bugs" or "contributors" fields: each would print the repo's current personal owner or a person on npm.
3. .github/workflows/mcp-il-tools-publish.yml: trigger workflow_dispatch ONLY (no push/tag/schedule), input dry_run (boolean, default true). Top-level permissions: contents read; id-token write only on the job that logs in to the registry. Guards that run first and fail with a plain message naming the owner step: (a) github.repository_owner must be "mehudak" (step 7) unless dry_run; (b) the NPM_TOKEN secret must be non-empty (step 9) unless dry_run. Steps: checkout; setup-node 22 with registry-url https://registry.npmjs.org; npm ci, test and build in products/mcp-il-tools; a consistency check (package.json version == server.json version == server.json packages[0].version; mcpName == server.json name; identifier == package name); \`npm pack --dry-run --json\` and fail if the tarball contains tests/, node_modules/, .env or any file outside dist/, src/, README.md, package.json, LICENSE; skip npm publish when \`npm view <name>@<version> version\` already returns that version; \`npm publish --access public\` WITHOUT --provenance (provenance links the npm page to the repo and its history, which carries a personal name; record this reason in a comment); then the registry: download the mcp-publisher binary for linux amd64 from a PINNED release of github.com/modelcontextprotocol/registry (look up the current release tag and asset name on github.com and cite them; verify its sha256 against the release's checksums file if one is published), \`mcp-publisher login github-oidc\`, \`mcp-publisher publish\` from products/mcp-il-tools. In dry_run, run everything except npm publish, the registry login and the registry publish, and print what would be published. Pin third-party actions to a full commit SHA with the tag in a comment if the repo's other workflows do so; otherwise match their style and note it.
4. A test file src/__tests__/revenue/mcp-il-tools-publish.test.ts (root vitest; the root has the "yaml" package) that pins: the namespace and mcpName agree and start with io.github.mehudak/; no websiteUrl; the version triple agrees; package.json carries none of repository/homepage/author/bugs/contributors; the workflow parses, has workflow_dispatch as its only trigger, dry_run defaults to true, contains the owner guard and the NPM_TOKEN guard, never passes --provenance, grants id-token: write only where the registry login is, and references secrets.NPM_TOKEN only through env (never inline in a run: line). Mutation-check each assertion in a scratch copy under /tmp (not in the repo): would the test fail if the thing it pins were broken?
5. products/mcp-il-tools/README.md: a short "Publishing" section (dispatch with dry_run first; what steps 7 and 9 unlock). No claim of being listed anywhere until it is.
Run: products/mcp-il-tools tests and build (npm test, npm run build), \`pnpm typecheck\` and \`npx vitest run src/__tests__/revenue\` at the root. Write the Hebrew per-task log logs/2026-09-28-mcp-il-tools-publish-prep.md (the 8 sections CLAUDE.md lists) and commit.
Final reply: worktree path, branch, \`git log --oneline ${BASE}..HEAD\`, test tails, the mcp-publisher release tag and asset you pinned (with the github.com URL you read), and every requirement NOT met with the reason.`

const build = await agent(BUILD, { label: 'build:mcp-publish-prep', phase: 'Build', isolation: 'worktree', model: 'opus' })

const LENSES = [
  { key: 'security', text: 'SUPPLY-CHAIN AND EXPOSURE lens: could this workflow publish before steps 7 and 9, or under a personal namespace, or leak the NPM_TOKEN (echo, inline interpolation into run:, pull_request trigger, artifact upload)? Is the mcp-publisher download pinned and verified, and does the tag/asset actually exist on github.com (check with WebFetch of github.com)? Are id-token permissions scoped to the one job? Does any published field (package.json, server.json, README, the tarball file list) print a personal name, the personal repo owner, or an unowned domain? Would dry_run ever call npm publish or the registry?' },
  { key: 'registry', text: 'REGISTRY CORRECTNESS lens: read the modelcontextprotocol/registry docs and schema on github.com (WebFetch works there) and check that server.json validates against the schema version it names, that the npm ownership check (mcpName) is satisfied exactly as the registry reads it, that github-oidc grants io.github.<repository_owner>/* as claimed, and that the publish order (npm first, registry second) is what the registry requires. Do the tests pin each requirement (mutate one in a scratch copy under /tmp: does a test fail)? Do products/mcp-il-tools tests, build, root typecheck and root revenue tests pass when you re-run them? Protected files untouched, commit trailers exact.' },
]
const reviews = await parallel(LENSES.map(l => () => agent(`You are an adversarial Opus reviewer. Do not edit files; do not run state-changing git commands (no stash, commit, checkout, reset).
A builder prepared the free MCP server products/mcp-il-tools for publishing in a git worktree. Its report:
${build}
Go to the builder's worktree and read \`git diff ${BASE}..HEAD\`. ${l.text}
Return a numbered list of concrete defects (file:line, what is wrong, the fix), most severe first, or "NO DEFECTS".`, { label: `review:${l.key}`, phase: 'Review', model: 'opus' })))

const fix = await agent(`You are an Opus fixer. Never git stash; never push; commit only in the builder's worktree branch; do not edit logs/CHECKPOINT.md, logs/CHANNEL_LOOP.md, logs/FABLE_QUEUE.md, MISSION.md, CLAUDE.md, docs/OWNER_STEPS.he.md. Commits end with:
${TRAILER}
Builder's report (cd to its worktree and work only there):
${build}
Reviews:
--- security ---
${reviews[0] || '(none)'}
--- registry ---
${reviews[1] || '(none)'}
Fix every defect that holds up against the task and the sources; for any you reject, say why in the per-task log. Re-run products/mcp-il-tools tests and build, root \`pnpm typecheck\` and \`npx vitest run src/__tests__/revenue\`; commit. Reply with worktree path, branch, new commits, test tails, defects rejected with reasons.`,
  { label: 'fix:mcp-publish-prep', phase: 'Fix', model: 'opus' })

return { build, reviews, fix }
