# Maintaining mcp-il-tools

Notes for this repository, not for the npm page. `package.json` `files` does not list this file and npm
does not add it by itself, so it never ships. The publish workflow's tarball check fails the run if it
ever does. `README.md` does ship, and npm keeps each version's README for good. That is why the README
carries no status line, no runbook and no path into this repository, and why the workflow fails a run
whose README does.

## Status

**On 28.9.2026: not published.** The npm registry answered 404 for `@mehudak/mcp-il-tools`, and
`io.github.mehudak/il-tools` is not in the MCP Registry. The README describes the package as it will be
once it is published.

## Publishing

One workflow publishes both the npm package and the MCP Registry listing:
`.github/workflows/mcp-il-tools-publish.yml`. Start it by hand: Actions → mcp-il-tools-publish → Run
workflow. It has no other trigger. Anything with `actions:write` on the repository can start it, including
an agent's GitHub tool. The locks below therefore do not depend on who presses the button.

1. **Dry run first**, from any branch. `dry_run` is ticked by default, and a dry run needs no owner step. It:
   - installs the dependencies with `--ignore-scripts`, tests, builds and packs the package;
   - checks that `package.json`, `server.json`, `README.md` and the tarball agree;
   - asks npm whether this version exists and who published it;
   - downloads the pinned `mcp-publisher`, checks its sha256, and validates `server.json` against the
     registry.

   It publishes nothing, and its summary lists what a real run would publish. It never enters the
   `npm-publish` environment, so it cannot see or check the npm token.
2. **Then a real run, on `main`, with `dry_run` unticked.** In order:
   1. The `check` job fails the run when step 7 is not done or the run did not start from `main`. It also
      fails the run when `NPM_TOKEN` is stored as a repository or organisation secret.
   2. The `npm-publish` job waits for the reviewer's approval in the `npm-publish` environment, then:
      - checks that the token authenticates as the npm user `mehudak`;
      - publishes the exact tarball the `check` job packed, after comparing its sha512. It passes no
        `--provenance` and runs no lifecycle scripts;
      - waits until `registry.npmjs.org` serves the version with its `mcpName`.
   3. The `registry-publish` job, the only one with `id-token: write`, logs in with GitHub OIDC and
      publishes `server.json`.

A version already on npm is not published again. The run goes on to the registry only if that version
was published by the npm user `mehudak` and is byte-identical to the tarball this commit packs. Otherwise
it stops.

### The owner steps a real run needs

- **Step 7:** the GitHub organisation `mehudak` owns this repository. The registry's GitHub login grants
  names under `io.github.<repository owner>/` only (case-sensitive). This step is what makes
  `io.github.mehudak/il-tools` publishable.
- **Step 9 (proposed; not yet in `docs/OWNER_STEPS.he.md` or `src/revenue/owner-steps.ts`):**
  1. **The npm user `mehudak`.** Sign up at npmjs.com with the username `mehudak` and the brand mailbox
     from step 8, never a personal address. npm writes the publishing user's name and email into every
     version's public metadata (`_npmUser`, `maintainers`), for good. The user `mehudak` owns the
     `@mehudak` scope. Do not instead create an npm *organisation* named `mehudak` from a personal
     account: the token would then belong to the personal account, and the workflow refuses it.
  2. **A granular access token of that user.** Profile → Access Tokens → Generate New Token:
     - Packages and scopes: Permissions **Read and write (publish and stage)**, and **All Packages** under
       Select packages. The package does not exist yet, so it cannot be picked by name. A **Read and write
       (stage only)** token cannot publish; `npm publish` fails with `E_STAGE_REQUIRED`.
     - Tick **Bypass two-factor authentication**. npm now requires 2FA, or a granular token with bypass 2FA,
       to publish.
     - Organizations: No access. Expiration: a date a few weeks out. When the token expires, the run fails
       at the token check and names this step.
  3. **The GitHub environment `npm-publish`.** Repository → Settings → Environments → New environment
     `npm-publish`:
     - Deployment branches and tags: **Selected branches**, `main`.
     - Required reviewers: the machine account from step 7.
     - Environment secrets: `NPM_TOKEN`, set to the token.

     Store it as an environment secret, not a repository secret: every run fails while `NPM_TOKEN` is
     readable outside that environment. On a public repository anyone can open a run's page, and it
     names the account that started the run. It probably also shows who approved it, though that was
     not verified from here. So start and approve the run as the machine account.

Sources, read 28.9.2026:
- The npm token settings: npm/documentation@d1cbe2e, `about-access-tokens.mdx`,
  `creating-and-viewing-access-tokens.mdx` and
  `requiring-2fa-for-package-publishing-and-settings-modification.mdx`.
- Environments on a public repository: github/docs@b5f08dd,
  `deployments-and-environments.md`, and `data/reusables/gated-features/environments.md`. Environment
  secrets, deployment branches and required reviewers are available on every plan for a public
  repository.

### Deadline: January 2027

npm's documentation (`about-access-tokens.mdx`, "Direct publishing is being deprecated") says granular
tokens lose the ability to publish new versions directly in **January 2027**. After that, the npm step
needs one of two things. One is a stage-only token: `npm stage publish`, then a maintainer's
`npm stage approve` with 2FA. The other is trusted publishing, which attaches provenance naming this
repository. This workflow does neither yet. A real run before then needs no change.

### A new version

Change `version` in `package.json`, both `version` fields in `server.json`, and the server's own version
in `src/server.ts`, together. The workflow's consistency check and the root test
`src/__tests__/revenue/mcp-il-tools-publish.test.ts` fail if they differ.

## Development

```bash
npm install     # a committed lockfile is required: plain `npm install` cannot
npm test        # resolve vitest's peer graph from scratch on npm 10.9.7
npm run build
```

## The x402 sibling

The same logic is exposed per call over the x402 protocol in `products/x402-il-api`. That API is not
deployed, and it has not been a revenue line since 7.9.2026 (`KILLED_LINES` in `src/revenue/portfolio.ts`).
It is kept as a rail on standby, so nothing is sold there today. This package is not crippled to sell that
one: identical validators, no rate limit, no telemetry, nothing withheld.

`src/israeli.ts` here is a byte-identical copy of the API's `src/israeli.ts`, because a published package
has to stand alone. `tests/server.test.ts` asserts the two files match, so the copy cannot drift.
