# GitHub Actions spending limit: can a runner read it? (29.9.2026, tick 19)

This file checks one precondition in `RULING-2026-09-29-loop.md` (b). The ruling lets Mozilla's dry-run harness (CHANNEL_LOOP §4 row 8) run "only after a runner has read the account's Actions spending limit as $0 (so private-repo minutes can never bill) and only inside the free private-repo allowance" (`research/channel-loop/RULING-2026-09-29-loop.md:116-118`). The row itself says the harness "runs only after a runner reads the account's Actions spending limit as $0, inside the free private-repo allowance, nothing filed; tick 18 or later." (`logs/CHANNEL_LOOP.md:147`). The file reads GitHub's own documentation source to answer three questions: can a runner make that read, what would it read, and how large is the free allowance. Everything here is github grade. No rendered capture exists yet.

### Sources and grades

**Read 29.9.2026 by an Opus reader (tick 19).** The sources are raw copies of the `github/docs` repository (branch `main`), fetched with curl from raw.githubusercontent.com between 12:05 and 12:34 UTC (the last six rows of the table between 12:29 and 12:34), plus GitHub code search of `github/docs` (index ref `f4e8afc6979a`) and a sparse clone of the same commit (`f4e8afc6979a`) for full-text searches of `content/billing`, `data/reusables` and `src/rest/data/fpt-2026-03-10`.

Grades:
- **github**: these raw copies, cited `SHORT:n`, where n is the line in the raw file.
- **[inference]**: marked where used.
- Nothing in this file is rendered.

Every quote was checked with `grep -n -F` against the fetched copy. The docs are Liquid templates. `{% data variables.… %}` placeholders are resolved from `PV` and `VA`, for example `prodname_free_user: 'GitHub Free'` (PV:31) and `hosted_runner: 'larger runner'` (VA:2).

| Short | github: raw URL | Fetched (UTC) | sha256 (first 12) | Lines |
|---|---|---|---|---|
| GA | https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/product-billing/github-actions.md | 12:05 | `a40dc1897d60` | 215 |
| DOQ | https://raw.githubusercontent.com/github/docs/main/data/reusables/billing/default-over-quota-behavior.md | 12:05 | `ac1103c29240` | 3 |
| AIQ | https://raw.githubusercontent.com/github/docs/main/data/reusables/billing/actions-included-quotas.md | 12:05 | `cbeecf86285f` | 7 |
| PRICE | https://raw.githubusercontent.com/github/docs/main/data/reusables/billing/actions-standard-runner-prices.md | 12:05 | `fcd8be869b32` | 8 |
| PUI | https://raw.githubusercontent.com/github/docs/main/content/billing/reference/product-usage-included.md | 12:05 | `da16b2b79ce0` | 99 |
| RP | https://raw.githubusercontent.com/github/docs/main/content/billing/reference/actions-runner-pricing.md | 12:05 | `62f7f4c44a15` | 72 |
| BA | https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/budgets-and-alerts.md | 12:05 | `1528e37f6497` | 78 |
| SB | https://raw.githubusercontent.com/github/docs/main/content/billing/how-tos/set-up-budgets.md | 12:05 | `1e517fd1956d` | 173 |
| ABS | https://raw.githubusercontent.com/github/docs/main/data/reusables/user-settings/access_billing_settings_url.md | 12:15 | `5205eb52216c` | 1 |
| LFS | https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/product-billing/git-lfs.md | 12:08 | `819024f58957` | 147 |
| IB | https://raw.githubusercontent.com/github/docs/main/content/billing/get-started/introduction-to-billing.md | 12:08 | `f1348659b8c9` | 62 |
| HBW | https://raw.githubusercontent.com/github/docs/main/content/billing/get-started/how-billing-works.md | 12:34 | `b96c9ad0a6ff` | 86 |
| AUR | https://raw.githubusercontent.com/github/docs/main/content/billing/tutorials/automate-usage-reporting.md | 12:05 | `d287b411f5aa` | 205 |
| RB | https://raw.githubusercontent.com/github/docs/main/src/rest/data/fpt-2026-03-10/billing.json (byte-identical to `fpt-2022-11-28/billing.json`) | 12:06 | `3b299bcf579d` | 3,190 |
| RBU | https://raw.githubusercontent.com/github/docs/main/content/rest/billing/usage.md | 12:30 | `7474ab520792` | 22 |
| RBB | https://raw.githubusercontent.com/github/docs/main/content/rest/billing/budgets.md | 12:30 | `b5f50bdcb90b` | 36 |
| RACT | https://raw.githubusercontent.com/github/docs/main/src/rest/data/fpt-2026-03-10/actions.json | 12:11 | `48c544b811ad` | 53,487 |
| S2S | https://raw.githubusercontent.com/github/docs/main/src/github-apps/data/fpt-2026-03-10/server-to-server-permissions.json | 12:07 | `510f37bafc1f` | 12,327 |
| RA | https://raw.githubusercontent.com/github/docs/main/src/rest/components/RestAuth.tsx | 12:07 | `b4b444c43b6c` | 145 |
| UI | https://raw.githubusercontent.com/github/docs/main/data/ui.yml | 12:07 | `fdf408d81aa7` | 410 |
| EBP | https://raw.githubusercontent.com/github/docs/main/data/features/enhanced-billing-platform.yml | 12:16 | `59cf5461aae4` | 4 |
| GT | https://raw.githubusercontent.com/github/docs/main/content/actions/concepts/security/github_token.md | 12:07 | `e9bad7ea7f8c` | 42 |
| GTP | https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/github-token-available-permissions.md | 12:07 | `f33d4c386b31` | 40 |
| LRP | https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/larger-runner-permissions.md | 12:33 | `3b4a70dc640b` | 1 |
| UMB | https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/actions-usage-metrics-not-billing-metrics.md | 12:33 | `f182968b0473` | 3 |
| RS | https://raw.githubusercontent.com/github/docs/main/content/actions/how-tos/manage-runners/self-hosted-runners/run-scripts.md | 12:10 | `4a808c8725a8` | 89 |
| PV | https://raw.githubusercontent.com/github/docs/main/data/variables/product.yml | 12:05 | `ab65b5d80138` | 408 |
| VA | https://raw.githubusercontent.com/github/docs/main/data/variables/actions.yml | 12:29 | `1b96c55098b2` | 9 |

### 1. How GitHub Free controls paid Actions usage: budgets, not a "spending limit" (github)

- **"Spending limit" is the old name.** The old Actions spending-limit pages now redirect to the budgets how-to. Its `redirect_from` lists "/github/setting-up-and-managing-billing-and-payments-on-github/managing-your-spending-limit-for-github-actions" (SB:10). The Codespaces and Packages spending-limit pages redirect there too (SB:14-20).
  - [inference] So the ruling's "spending limit" now means an Actions **budget** with "Stop usage when budget limit is reached" selected.
- **A personal account can hold budgets.**
  - "personal account owners can set budgets for their own account" (BA:37).
  - SB has a section "## Managing budgets for your personal account" (SB:44), which says "Budgets can be set for a specific repository or for your whole account." (SB:46).
- **An Actions budget can stop usage.**
  - For metered products such as Actions, "you can set budgets to prevent usage once the budget threshold is reached." (BA:20).
  - Stopping is chosen per budget: "To stop any usage and further spending once the budget limit is reached, select **Stop usage when budget limit is reached**, if available." (SB:61). The same line adds "This option is not available for user-level budgets, which always enforce a hard stop." User-level budgets are the Copilot AI-credit kind (BA:27), so this does not touch Actions.
  - Without that option, "you will be notified by email if you exceed your budget, but usage **will not** be stopped." (SB:63).
  - Budgets stack: "Usage of metered products can count toward multiple applicable budgets at the same time, and if any budget with **Stop usage when budget limit is reached** enabled is exhausted, additional usage is blocked." (SB:34).
- **A budget counts only paid use.**
  - "Each budget has a type and a scope that define which paid use contributes to spending against the budget." (BA:24).
  - The included-usage page says that beyond the plan's amounts "you'll be charged for additional usage unless you've set a budget with the setting "Stop usage when budget limit is reached" enabled." (PUI:13).
  - The how-to's worked example counts only billed minutes against an Actions budget: "The organization has used all the included quota of actions minutes and an extra $50 of billed minutes." and that used "the full budget for the "Actions" product of $50" (SB:38).
  - [inference] So a $0 Actions budget with Stop usage leaves the free minutes usable and blocks only usage that would be billed.
- **The default depends on whether a payment method is on file.**
  - "If your account does not have a valid payment method on file, usage is blocked once you use up your quota. Usage of larger runners is always blocked until you set up a payment method." (GA:139). The first sentence is also the reusable DOQ:1, which GA includes at GA:208. The reusable's file name is `default-over-quota-behavior`.
  - "If you have a valid payment method on file, spending may be limited by one or more budgets." (DOQ:3).
  - Paid use is charged to that payment method: "You pay for any additional use above your quota using the payment method set up for your" GitHub account (GA:143).
- **No default budget amount is documented for Actions.**
  - A GitHub code search of `content/billing` for "$0" budget finds, apart from price tables, only the Git LFS page (a `grep -F '$0'` over the sparse clone's `content/billing` and `data/reusables/billing` gives the same single hit). It gives two cases:
    - "**Budget set to $0**: You are not charged for overages, but" LFS usage is blocked for the rest of the month (LFS:58).
    - "**Budget deleted**: There is no spending limit, and you are billed for all usage beyond the free quota." (LFS:59).
  - The budgets how-to warns, in its organization and enterprise section: "Deleting a budget may remove any limits on spending, depending on your other existing budgets." (SB:152).
  - [inference] On GitHub Free this gives two cases:
    - **No valid payment method on file:** Actions stops at the included quota and cannot bill.
    - **A payment method on file and no Actions budget with Stop usage:** usage over the quota is billed.
- **A new budget does not cover earlier usage.**
  - "the budget applies only to metered usage from the date of its creation onwards" (BA:70).
  - The same line says "you may exceed your budget in the first billing cycle after you create your budget, even if you select the option stop usage when the limit is reached." (BA:70).
  - [inference] A $0 budget must exist before the first private-repo run.
- **An earlier memory-grade claim is now confirmed at github grade.**
  - The breadth verifier wrote: "My claim that GitHub Free stops jobs at the minutes cap instead of billing when no payment method is on file is from memory (grade none)." (`research/breadth/verify/verdicts.json:8`). It gave the old about-billing URL.
  - That path now redirects to GA: "/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions" (GA:9).
  - GA:139 states the rule.

### 2. What GitHub Free includes, and what is free outright (github)

- **Private repositories draw on a quota.**
  - For private repositories, "Any usage beyond the included amounts is billed to your account." (GA:26).
  - "Minutes usage is charged to the repository owner, not the person who triggered the workflow runs." (GA:28). Also: "Anyone with write access to a repository can run actions. Any costs of running the actions are billed to the repository owner." (GA:32).
  - "At the start of each month, the minutes used by the account are reset to zero." (GA:121).
- **The included table** (AIQ, included at GA:123):
  - Header: "| Plan | Artifact storage | Minutes (per month) | Cache storage (per repository) | Custom image storage |" (AIQ:1).
  - GitHub Free row: "| 500 MB | 2,000 | 10 GB | Not applicable |" (AIQ:3). Its first column, `prodname_free_user`, is 'GitHub Free' (PV:31).
  - The plan table has the same figures, 500 MB and 2,000 (PUI:28, :36).
  - GitHub Free for organizations has the same row (AIQ:5; `prodname_free_team` is 'GitHub Free', PV:34). This matters after step 7.
- **Storage.**
  - The artifact allowance is shared with Packages: "The artifact storage amounts shown are **shared**" (GA:134).
  - Storage accrues hourly, and "Storage already accrued during the current billing cycle remains in your total and will appear on your bill" (GA:65).
  - Cache is a separate 10 GB per repository, and "The repository owner will only be charged if the repository cache storage limit has been configured higher than the included usage." (GA:117).
- **How minutes are counted.**
  - "If you run a workflow on a Linux runner and it takes 10 minutes to complete, you'll use 10 minutes of the repository owner's allowance." (GA:114).
  - GitHub "rounds the minutes and partial minutes each job uses up to the nearest whole minute." (RP:14).
  - The old minute-multiplier page now redirects to the runner-pricing reference (RP:11). Neither table says how Windows or macOS minutes count against the 2,000. Two other sources still speak of a multiplier without giving its size: the retiring timing endpoints say "The usage does not include the multiplier for macOS and Windows runners" (RACT:50126), and an Actions reusable says usage metrics "do not apply minute multipliers" and points to GA's baseline-minute-costs section (UMB:1, :3), which gives only per-minute prices (GA:155-159).
  - [inference] The harness should use Linux x64 standard runners only (`actions_linux`, "$0.006" a minute when billed, PRICE:4).
- **Free outright.**
  - Actions "usage is **free** for **self-hosted runners** and for **public repositories** that use standard" GitHub-hosted runners (GA:24).
  - "…hosted runners is free:" (GA:125), first "In public repositories" (GA:127), then for Pages and Dependabot (GA:128-129).
- **Never free, and not on the Free plan at all.**
  - "Larger runners are always charged for, even when used by public repositories or when you have quota available from your plan." (GA:133).
  - "Included minutes cannot be used for" larger runners (RP:68; `hosted_runner` is 'larger runner', VA:2).
  - Larger runners "are only available for organizations and enterprises using the" GitHub Team or GitHub Enterprise Cloud plans (LRP:1). So neither a GitHub Free personal account nor a GitHub Free organization can select one.
- **A hidden minute consumer.** "Each" Copilot code review "consumes" Actions "minutes in addition to" AI credits (GA:36), and in private repositories "Minutes are consumed from your account or organization's existing plan entitlement." (GA:38).
- [inference] The automaton repo's own workflows run in a public repo on standard runners, so they cost nothing and use none of the 2,000 minutes. All 27 `runs-on` lines in `.github/workflows` are `ubuntu-latest` (measured with `grep -rn 'runs-on' .github/workflows`).

### 3. Which REST endpoints read a budget or usage, and with which token (github)

RB is the REST reference data that the docs site renders for Free, Pro and Team. It lists 13 billing operations.

- **Budget endpoints exist for organizations only.**
  - All five budget operations are under `/organizations/{org}/settings/billing/budgets` (RB:6, :514, :776, :961, :1208). The docs page for them is "title: Budgets" (RBB:2), versioned for Free/Pro/Team and Enterprise Cloud.
  - "Gets all budgets for an organization. The authenticated user must be an organization admin or billing manager." (RB:64).
  - Token block (RB:500-508):
    - GitHub App user tokens: allowed.
    - GitHub App installation tokens: allowed (`"serverToServer": true`, RB:502).
    - Fine-grained PATs: allowed.
    - Required permission: `"\"Administration\" organization permissions": "read"` (RB:506).
  - The response fields (the thing a post-step-7 read would check):
    - `budget_amount`: "The budget amount limit in whole dollars" (RB:162).
    - `prevent_further_usage`: "The type of limit enforcement for the budget" (RB:166).
    - `budget_scope`, one of `enterprise`, `organization`, `repository`, `cost_center`, `multi_user_customer`, `multi_user_cost_center`, `user` (RB:168-179).
    - The SKU, for example `"actions"` (RB:83-88).
  - The API's `user` scope is "Budgets scoped to an individual user." (RB:40). User-scoped budgets are supported only for Copilot AI credits (BA:27).
- **No endpoint reads a personal account's budget.** None of the 13 operations reads a payment method either. This is a github-grade finding over the billing category of the fpt data. Across all 50 files of `src/rest/data/fpt-2026-03-10` in the sparse clone, "payment" appears only in error descriptions and links, never as an endpoint.
- **Usage for a personal account.**
  - `GET /users/{username}/settings/billing/usage` (RB:2762), titled "Get billing usage report for a user" (RB:2763).
  - "Gets a report of the total usage for a user." and "This endpoint is only available to users with access to the enhanced billing platform." (RB:2805). Its example response is an Actions line: `"product": "Actions"`, `"sku": "Actions Linux"` (RB:2823-2824).
  - The platform flag covers the Free/Pro/Team docs (`fpt: '*'`, EBP:4). The flag's comment names only the Enterprise and Team dates.
  - Token block (RB:2925-2931): `"serverToServer": false` (RB:2927), `"fineGrainedPat": true` (RB:2928), and `"\"Plan\" user permissions": "read"` (RB:2931).
  - `…/usage/summary` (RB:2939) says "This endpoint is in public preview and is subject to change." (RB:3009). It has the same token block (RB:3179-3185).
  - **The docs page for these endpoints narrows them to Copilot.** Its intro says "The endpoints on this page return usage that is billed to the account associated with the endpoint." (RBU:13) and "User endpoints return" Copilot "usage that is billed directly to an individual user’s personal account. These endpoints are only applicable if the user has purchased their own" Copilot "plan." (RBU:15). This conflicts with RB:2805 ("total usage") and the Actions example at RB:2823. Whether the user usage report includes Actions minutes is unsettled at github grade.
  - The usage tutorial limits user-level reports to the "account holder" (AUR:26).
- **The GitHub App permission data agrees.**
  - Under "User permissions for \"Plan\"" (S2S:12085), the entry `get-billing-usage-report-for-a-user` (S2S:12111) has `"server-to-server": false` (S2S:12117).
- **How the docs page shows this.**
  - The component lists "GitHub App installation access tokens" (UI:269) only when `progAccess.serverToServer` is true (RA:125-128).
  - [inference] So the page for the user usage endpoint lists "GitHub App user access tokens" (UI:268) and "Fine-grained personal access tokens" (UI:270), but not installation tokens.
- **No classic scope is stated.**
  - None of the four user billing endpoints' descriptions in RB mentions a scope or a classic token.
  - Actions endpoints do state one, for example "OAuth app tokens and personal access tokens (classic) need the <code>repo</code> scope to use this endpoint with a private repository." (RACT:50126).
- **The docs disagree about which token type works.**
  - The usage tutorial says "You authenticate using a" personal access token (classic), and "The billing usage endpoints do not support" fine-grained personal access tokens (AUR:31; variables at PV:131 and PV:128).
  - The billing introduction says "First you will need to create a fine-grained access token with the permissions defined by the end point" (IB:50).
  - The REST data marks fine-grained PATs as allowed (RB:2928).
  - This is unsettled at github grade. A render of the live REST page is the follow-up.
- **The older reads are gone or being retired.**
  - GitHub code search of `github/docs` finds 0 hits for "settings/billing/actions" and 0 for the title "Get GitHub Actions billing for a user". The sparse clone's `content`, `data` and fpt REST data also have none.
  - The per-workflow and per-run timing endpoints carry "This endpoint is in the process of closing down." (RACT:50126, :53397).
- **What a usage report returns:** a quantity, "* A **netAmount**, which represents the billed cost for that usage" (AUR:186), and a **discountAmount**, "usage covered by included quotas or discounts" (AUR:187).

### 4. What GITHUB_TOKEN can call (github, then [inference])

- **What the token is.**
  - "The `GITHUB_TOKEN` secret is a" GitHub App "installation access token." (GT:17).
  - "The token's permissions are limited to the repository that contains your workflow." (GT:17).
- **Its permission keys.**
  - The list runs from `actions: read|write|none` (GTP:5) to `vulnerability-alerts: read|none` (GTP:21). No key is `plan` or `administration` (GTP:4-21).
  - "If you specify the access for any of these permissions, all of those that are not specified are set to `none`." (GTP:24).
  - [inference] `read-all` and `write-all` (GTP:29, :33) apply to "all of the available permissions", that is, to the same list, so they add no `plan` or `administration` access.
- **[inference] What GITHUB_TOKEN cannot read:**
  - **The personal usage endpoints.** Installation tokens are excluded (RB:2927; S2S:12117), and "Plan" is a user permission that GITHUB_TOKEN has no key for.
  - **An organization's budgets after step 7.** They need organization "Administration" read (RB:506), which is not one of its keys. They also need an authenticated user who is an organization admin or billing manager (RB:64). A repository-scoped installation token is neither.
  - **Any personal-account budget.** No endpoint exists for one, for any token (§3).
- **What GITHUB_TOKEN can read:** its own repository's runs and jobs.
  - "List jobs for a workflow run" (RACT:40145-40146) allows installation tokens with `"\"Actions\" repository permissions": "read"` (RACT:40585-40591).
  - `actions: read` is one of GITHUB_TOKEN's keys (GTP:5).
  - [inference] This lets a harness measure its own job time, not the account's.

### 5. [inference] What this means for the ruling's precondition

1. **A runner cannot make the read without an owner step.**
   - Before step 7 the private repo belongs to the personal account: "the private repo moves at step 7" (RULING:118); the board's plan is to "create a PRIVATE repo under the existing GitHub account (it moves to the org at step 7)" (`research/channel-loop/BOARD-LOOP.md:139`).
   - No documented endpoint returns a personal account's budget or payment method, to any token.
   - GITHUB_TOKEN cannot reach even the usage report.
   - So "a runner has read the account's Actions spending limit as $0" (RULING:116-117) cannot be satisfied as written.
2. **A new owner-issued secret does not fix this.**
   - A fine-grained PAT with Plan: read would let a runner call the user usage report (`netAmount`, `discountAmount`). So would a classic PAT, if AUR:31 is right. Neither reads the limit. The report may not even carry Actions: its docs page says user endpoints return Copilot usage only (RBU:15).
   - Usage shows after the fact that nothing was billed. It cannot show that nothing can be billed.
   - It is not worth a new secret before step 7.
3. **The only read that settles it is one owner look.**
   - The page is the billing settings: `https://github.com/settings/billing` (ABS:1), then "Budgets and alerts" (SB:50). It takes about 2 minutes (estimate).
   - Either of two answers passes:
     - (a) **No valid payment method on file.** By GA:139, usage stops at the quota and cannot bill. This is stronger than a budget because it has no first-cycle gap (BA:70). But it is a state, not a setting: it lapses the moment any payment method is added to the account for any product, because each account has one payment method (HBW:50, :54) and with one on file only budgets limit spending (DOQ:3). The look would have to be repeated, or combined with (b).
     - (b) **An Actions product budget of $0,** scoped to the whole account, with "Stop usage when budget limit is reached" selected (SB:46, SB:61; PUI:13), created before the first run.
   - Optional: opt in to the included-usage alerts at 90% and 100% (SB:77).
   - Either look covers only the personal-account phase. After step 7 the repo belongs to the organization, which GitHub bills as a separate account with its own payment method (HBW:50, :54), so the check must be made again there.
   - This is an owner step, but the ruling called the harness "the one owner-free ₪0 test that is not a render" (RULING:116), and the breadth board's Q8 says "No owner step is asked before a qualifying finding." (`research/breadth/BOARD.md:185`). Replacing "a runner has read" with "the owner has looked", or waiting for step 7, changes a ruling. That decision belongs to the next sitting, not to the loop.
4. **After step 7 a runner can make the read only if step 7 is extended; GITHUB_TOKEN cannot make it.**
   - Step 7 creates the organisation `mehudak` on the Free plan, and "The same sitting creates `BRAND_GITHUB_TOKEN`." (`logs/CHANNEL_LOOP.md:210-212`).
   - That token is the machine account's: "In the same sitting the owner creates its personal access token, BRAND_GITHUB_TOKEN, pasted in step 6 with the others" (`src/revenue/owner-steps.ts:278`), and the account is only to be added to the organisation (`src/revenue/portfolio.ts:289`). No file makes `mehudak-ci` an organization owner or billing manager, or gives the token any organization permission.
   - So the budget read needs two additions to step 7's sitting: the machine account made a billing manager (or owner) of the organization (RB:64), and its token given organization Administration: read (RB:506). A GitHub App installation token with that permission also works (RB:502), but creating and installing the app is itself an owner step. No classic scope is stated for these endpoints (§3).
   - The read is `GET /organizations/mehudak/settings/billing/budgets`.
   - It passes only if it finds an `actions` product budget with `budget_scope` `organization`, `budget_amount` 0 and `prevent_further_usage` true. A `repository`-scoped budget covers only that repository. An empty list is **not** a pass (DOQ:3; SB:152).
   - Whether a payment method is on file still cannot be read.
5. **₪0 routes that use no private-repo minutes at all.**
   - **Session-only run.** A private repo with no workflow files runs no jobs, so it uses no minutes and cannot bill, whether or not a payment method is on file. This holds only if Copilot code review is also left off, because it consumes private-repo minutes without any workflow file of ours (GA:36, :38).
     - The harness would run in the agent's own session. The LLM review has to run there anyway: "Under the ₪0 rule the review must run inside the existing session, not on a metered API. This is inference." (`research/breadth/scouts/security-bounties.json:15`). Findings would be pushed as commits.
     - The limit is egress. This container gets through only to GitHub hosts: "in this container only GitHub-hosted feeds get through (verified)" (`CLAUDE.md:86`). The board's test fetches "mozilla-central ASan/fuzzing builds on a runner" (`research/channel-loop/BOARD-LOOP.md:139`).
     - So a session-only run is source review without the fuzz harness, unless those builds can be reached from GitHub. Whether that is "a meaningful run" is the ruling's own test (RULING:119).
   - **Public repos are ruled out.** They run free (GA:24), but the work "must run in a PRIVATE repo (the automaton repo is public) which meters Actions minutes" (`research/channel-loop/BOARD-LOOP.md:138`). GitHub's page on self-hosted runner job scripts warns that "anyone with read access to the repository might be able to see the output in the UI logs." (RS:42); in a public repo that is anyone.
   - **Self-hosted runners** are free (GA:24) but need a host the colony does not have. Not assessed.
6. **A second fence for any route that does use Actions:**
   - Linux x64 standard runners only.
   - No larger runners (GA:133). On GitHub Free they cannot be chosen anyway (LRP:1).
   - Copilot code review off in the private repo (GA:38).
   - Few or no artifacts: the 500 MB is shared with Packages (GA:134).
   - Cache under 10 GB (GA:117).
   - `timeout-minutes` on every job.
   - A monthly ceiling well under 2,000 minutes, counted from the repo's own job times with GITHUB_TOKEN (§4), each job rounded up to a whole minute as GitHub rounds it (RP:14). The ceiling cannot see minutes used by other private repos on the same account.
   - This keeps the board's stop rule: "if the private repo's minutes would cost money, stop (recurring cost)" (`research/channel-loop/BOARD-LOOP.md:139`).

**Short answer for row 8:** a runner cannot read a personal account's Actions limit, and a new token would not change that. The precondition can be met in two ways: the owner looks once (no payment method on file, which lapses if one is ever added, or a $0 Actions budget with Stop usage), or, after step 7, a runner reads the organisation's budget, which works only if step 7 also makes the machine account a billing manager and gives `BRAND_GITHUB_TOKEN` organization Administration: read. A session-only run with zero minutes needs no read at all, if it is meaningful without Mozilla's builds. Choosing between these amends ruling (b), and the owner-look route also crosses the board's "no owner step before a qualifying finding" (BOARD.md:185), so it goes to the next sitting.

### What this settles
- Nothing for FABLE_QUEUE row 17. This read concerns CHANNEL_LOOP §4 row 8 (Mozilla) and ruling (b)'s Actions spending-limit precondition, not the exempt-dealer document questions (FABLE_QUEUE.md:41).

---

## 29.9 (tick 20, rendered)

ZERO-TESTS rows 188-190 (captured 29.9 ~13:02 UTC by render-watch). Read by an Opus reader, checked by an adversarial verifier.

### 29.9 (tick 20, rendered): GitHub's billing docs, ZERO-TESTS rows 188-190

**Read by:** a tick-20 reader, from the render-watch captures of ZERO-TESTS rows 188-190 (FABLE_QUEUE row 18). Checked by an adversarial verifier.
- **What it read:** the three captures below. The text comes from each `.txt`. The per-endpoint token data comes from each `.html`'s `__NEXT_DATA__` script, because the text shows it only as lists.
- **Checking:** every quote was checked with `grep -n -F` against its `.txt`, and every `__NEXT_DATA__` path was decoded again by the verifier.
- **Github re-fetches, for comparison only:**
  - The reader re-fetched `GA` at 13:40 UTC. The verifier re-fetched it at 13:55 and got the same sha256, `a40dc1897d60` (215 lines), as the tick-19 copy. GitHub's source did not change between the tick-19 read and the render.
  - The verifier also read five other raw files for R1, R2 and R5 (the table after the capture table). They are github grade, cited `SHORT:n` as in tick 19.
- **Nothing was filed or run:** Mozilla's dry run (CHANNEL_LOOP §4 row 8) has not started. No budget was read or created, and no token was made.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Lines | Docs version |
|---|---|---|---|---|---|
| `R-GA` | `gh-docs-actions-billing.txt` | 2026-09-29 13:02:24 | `306428fd4c7a` | 526 | Free, Pro & Team |
| `R-RBU` | `gh-docs-rest-billing-usage.txt` | 2026-09-29 13:02:25 | `d7f961759ba8` | 1,383 | Free, Pro & Team; "API Version: 2022-11-28" (`R-RBU:19`) |
| `R-RBB` | `gh-docs-rest-billing-budgets.txt` | 2026-09-29 13:02:26 | `b88bac971fb5` | 1,112 | Free, Pro & Team; "API Version: 2022-11-28" (`R-RBB:19`) |

| Short | github: raw URL (verifier, 29.9) | Fetched (UTC) | sha256 (first 12) | Lines |
|---|---|---|---|---|
| BC | https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/billing-cycles.md | 13:55 | `acc2f3811a71` | 71 |
| FGP | https://raw.githubusercontent.com/github/docs/main/src/github-apps/data/fpt-2026-03-10/fine-grained-pat.json | 13:56 | `8d30dbd37f48` | 5,911 |
| PAT | https://raw.githubusercontent.com/github/docs/main/content/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens.md | 13:57 | `26e9215a3553` | 342 |
| BM | https://raw.githubusercontent.com/github/docs/main/content/organizations/managing-peoples-access-to-your-organization-with-roles/adding-a-billing-manager-to-your-organization.md | 13:58 | `97ea127f989c` | 53 |
| BR | https://raw.githubusercontent.com/github/docs/main/content/billing/reference/billing-roles.md | 13:59 | `d4bb86a40042` | 69 |

- **Capture status:** all three have status 200, `firstFetch: true` and `truncated: false` (their `.meta.json`).
- **Which file each sha256 covers:** as in the tick-19 tables, the capture sha256 is the `.meta.json` value, which is the stored `.html` body's. The `.txt` files hash differently.
- **Docs version:** `props.pageProps.mainContext.currentVersion` is `free-pro-team@latest` in each `.html`'s `__NEXT_DATA__`.
- **API version:**
  - The REST pages were requested at `apiVersion=2022-11-28`, but their curl samples send "X-GitHub-Api-Version: 2026-03-10" (for example `R-RBB:590`).
  - The site lists both versions for Free, Pro & Team (`props.pageProps.mainContext.allVersions["free-pro-team@latest"].apiVersions`).
  - Tick 19 found the two REST data files byte-identical (row `RB` of the tick-19 table).
- **Where the token data comes from:** token-block quotes cite the `.txt`. The same data, decoded, is at `props.pageProps.restOperations[i].progAccess` in the `.html`'s `__NEXT_DATA__`.
- **Terms:** the page footer says "All Docs are open source." (`R-GA:520`). That is not a reading of GitHub's terms on automated access, and this read does not replace a terms check.

### R1. Row 188, the Actions billing page: the three github-grade claims

1. **No payment method on file: usage stops at the quota. Confirmed word for word.**
   - The section "Using more than your included quota" (`R-GA:382`) says: "If your account does not have a valid payment method on file, usage is blocked once you use up your quota. Usage of larger runners is always blocked until you set up a payment method." (`R-GA:384`). This is GA:139.
   - The first sentence appears again under "Managing your budget for GitHub Actions" (`R-GA:498`, `:500`), where it is the DOQ:1 reusable.
   - The next line is DOQ:3 plus one more sentence: "If you have a valid payment method on file, spending may be limited by one or more budgets. Check the budgets set for your account to ensure they are appropriate for your usage needs." (`R-GA:502`).
   - Paid use is charged to that payment method: "You pay for any additional use above your quota using the payment method set up for your GitHub account." (`R-GA:388`; GA:143).
   - **Not on this page:** "stop usage" and "spending limit" have 0 matches, case-insensitive, in all three `.txt` files and all three `.html` files.
     - So the budget branch of the owner look stays github grade (SB:46, SB:61, PUI:13), and so does the first-cycle gap (BA:70).
     - The page only links to other pages, with "Setting up budgets to control spending on metered products" (`R-GA:502`) and "Budgets and alerts" (`R-GA:504`). The first link text also calls Actions a metered product.
2. **GitHub Free's 2,000 minutes and 500 MB. Confirmed.**
   - The table's columns are "Plan", "Artifact storage", "Minutes (per month)", "Cache storage (per repository)" and "Custom image storage" (`R-GA:330-334`; AIQ:1).
   - The GitHub Free row reads "500 MB", "2,000", "10 GB", "Not applicable" (`R-GA:336-340`). "GitHub Free for organizations" has the same four values (`R-GA:348-352`). These are AIQ:3 and AIQ:5.
   - The artifact figure is shared with Packages: "The artifact storage amounts shown are shared with GitHub Packages. This means your total storage across Actions artifacts and GitHub Packages storage cannot exceed the included amount for your plan." (`R-GA:378`; GA:134).
   - **The minute reset has two wordings, but they name one period.**
     - Tick 19 quoted "At the start of each month, the minutes used by the account are reset to zero." (`R-GA:328`; GA:121).
     - The same page also says "Your free minutes reset to the full amount at the start of each billing cycle." (`R-GA:212`). That sentence opens GA:28, which the verifier confirmed in the same-sha re-fetch. Tick 19 quoted only the second sentence of that line.
     - Elsewhere the page counts minutes by month: the column "Minutes (per month)" (`R-GA:332`) and "Minutes are calculated based on the total processing time used by each runner type during the month." (`R-GA:390`).
     - GitHub's billing-cycles source fixes the period for metered products: "Metered products, and all payments made using an Azure subscription ID, have a fixed **billing period** that starts at 00:00:00 UTC on the first day of each month and ends at 23:59:59 UTC on the last day of the month." (BC:26, github grade, verifier read).
     - [inference] Actions is metered (`R-GA:502`), so for Actions the "billing cycle" is the UTC calendar month. The two sentences name the same period, and this is not a correction to tick 19. The fence's monthly ceiling (tick 19 §5.6) stands, counted by UTC month; see R5.3.
   - **Also confirmed:**
     - Accrued storage stays on the bill (`R-GA:260`; GA:65). Storage charges also "reset to zero at the start of each billing cycle" (`R-GA:214`).
     - The cache is charged only if its limit is raised above 10 GB (`R-GA:324`; GA:117).
     - The 10-minute Linux example (`R-GA:318`; GA:114).
     - The standard Linux 2-core x64 SKU is "actions_linux" at "$0.006" a minute (`R-GA:414-416`; PRICE:4).
3. **Standard runners in public repositories are free. Confirmed.**
   - "GitHub Actions usage is free for self-hosted runners and for public repositories that use standard GitHub-hosted runners." (`R-GA:208`; GA:24).
   - "The use of standard GitHub-hosted runners is free:" (`R-GA:366`), followed by "In public repositories" (`:368`), "For GitHub Pages" (`:370`) and "For Dependabot" (`:372`).
   - Private repositories draw on the quota: "Any usage beyond the included amounts is billed to your account." (`R-GA:210`; GA:26). "Minutes usage is charged to the repository owner, not the person who triggered the workflow runs." (`R-GA:212`; GA:28).
   - The exception still holds: "Larger runners are always charged for, even when used by public repositories or when you have quota available from your plan." (`R-GA:376`; GA:133). Two related claims are not on this page and stay github grade: LRP:1 (larger runners exist only on GitHub Team and Enterprise Cloud) and RP:68.
   - **Copilot code review:**
     - "Each Copilot code review consumes GitHub Actions minutes in addition to AI credits." (`R-GA:222`) and "Private repositories: Minutes are consumed from your account or organization's existing plan entitlement." (`R-GA:224`) confirm GA:36 and GA:38.
     - The rendered page adds two lines: "Copilot code review consumes GitHub Actions minutes on private repositories." (`R-GA:380`) and "Copilot code review runs on standard GitHub-hosted Ubuntu Linux runners by default." (`R-GA:228`).
- **Two more lines bear on the owner look** (how they apply is [inference]):
  - "The billing dashboard may show your Actions usage as a dollar amount ("spend") rather than raw minutes." (`R-GA:398`).
  - "You can also receive email notifications when your included GitHub Actions usage reaches 90% and 100% during a billing period." (`R-GA:504`). This is the optional alert opt-in of tick 19 §5.3 (SB:77).

### R2. Row 189, the user usage endpoints

- **The page has four user endpoints, not one.**
  - Its list (`R-RBU:153-168`) holds four organization endpoints and four user endpoints. The user ones are "Get billing AI credit usage report for a user" (`:162`), "Get billing premium request usage report for a user" (`:164`), "Get billing usage report for a user" (`:166`) and "Get billing usage summary for a user" (`:168`).
  - Their paths are `/users/{username}/settings/billing/ai_credit/usage`, `…/premium_request/usage`, `…/usage` and `…/usage/summary` (`__NEXT_DATA__`, `props.pageProps.restOperations[4]` to `[7]`, `.requestPath`).
  - This confirms tick 19's count of four user billing endpoints (§3). None of them reads a budget, a limit or a payment method. "payment" has 0 matches on both REST pages (`.txt` and `.html`).
- **Token types for "Get billing usage report for a user":**
  - "This endpoint works with the following fine-grained token types :" (`R-RBU:1163`), then "GitHub App user access tokens" (`:1164`) and "Fine-grained personal access tokens" (`:1165`).
  - Decoded, `props.pageProps.restOperations[6].progAccess` is `{"userToServerRest": true, "serverToServer": false, "fineGrainedPat": true, "permissions": [{"\"Plan\" user permissions": "read"}]}`.
- **Permission:**
  - "The fine-grained token must have the following permission set:" (`R-RBU:1167`), then "\"Plan\" user permissions (read)" (`:1168`).
  - The other three user endpoints list the same two token types and the same permission (`:944-948`, `:1054-1058`, `:1264-1268`).
  - **What the permission reaches (github grade, verifier read):**
    - In GitHub's token page, `plan` is listed under "#### Account permissions" as "| `plan` | Plan | `read` |" (PAT:191).
    - That section says "Account permissions can only be used when the current user is the resource owner." (PAT:173).
    - [inference] So a Plan: read token reads only its own user's usage, which agrees with AUR:26 ("account holder"). `BRAND_GITHUB_TOKEN`, the machine account's token, could never read the owner's personal-account usage. Only a token from the owner's own account could.
- **GitHub App installation tokens are not listed, now at rendered grade.**
  - Every organization endpoint lists "GitHub App installation access tokens" (`R-RBU:505`, `:619`, `:733`, `:835`). No user endpoint lists them.
  - The decoded data agrees: `progAccess.serverToServer` is `false` for `restOperations[4]` to `[7]` and `true` for `[0]` to `[3]`.
  - Three github-grade records are now also rendered facts: RB:2927, S2S:12117, and the §3 inference drawn from UI:268-270 and RA:125-128.
  - That `GITHUB_TOKEN` is an installation token is still github grade (GT:17). So "GITHUB_TOKEN cannot call it" is rendered grade for the endpoint and github grade for the token.
- **Classic tokens: the page is silent.**
  - "classic" has 0 matches in the `.txt` and the `.html` of both REST pages, and no user endpoint names a scope.
  - The contradiction in tick 19 §3 is narrowed, not settled:
    - The rendered reference lists fine-grained PATs as working (`R-RBU:1165`; `fineGrainedPat: true`). IB:50 agrees (github grade).
    - GitHub's list of endpoints available to fine-grained PATs also includes `/users/{username}/settings/billing/usage` (FGP:1531, github grade). [inference] That list is generated from the same operation data as `progAccess`, so it is not an independent check.
    - The tutorial authenticates with a classic PAT and says the billing usage endpoints "do not support" fine-grained PATs (AUR:31, github grade, not rendered). The rendered page links to that tutorial: "For help deciding which level of usage to report on, see Automating usage reporting with the REST API ." (`R-RBU:489`).
    - [inference] The token block is generated from the operation's access data, while the tutorial is hand-written prose, so the reference is more likely to be current. Rendering the tutorial would bring its side to rendered grade. Only a live call would settle the question, and that needs a token nobody has created.
- **Whether user usage covers Actions is still unsettled, and the live page contradicts itself.**
  - The intro limits user endpoints to Copilot: "User endpoints return Copilot usage that is billed directly to an individual user’s personal account. These endpoints are only applicable if the user has purchased their own Copilot plan." (`R-RBU:491`).
  - It adds a line tick 19 did not quote: "If a user’s Copilot license is managed and billed through an organization or enterprise, their usage is not included in user-level endpoints." (`R-RBU:493`).
  - Against that, the endpoint says "Gets a report of the total usage for a user." (`R-RBU:1158`). Its example is an Actions line: "product": "Actions", "sku": "Actions Linux" (`R-RBU:1240-1241`), with "repositoryName": "user/example" (`:1248`). The summary's example is "product": "Actions", "sku": "actions_linux" (`:1355-1356`). The summary takes a `repository` filter, "The repository name to query for usage in the format owner/repository." (`:1292-1293`).
  - **The examples look stale and copied.**
    - They carry "date": "2023-08-01" (`R-RBU:1239`) and "pricePerUnit": 0.008 (`:1244`), while the Actions page prices actions_linux at "$0.006" (`R-GA:414-416`).
    - The organization report's example has the same date, product, SKU and price (`R-RBU:808-813`), and so does the organization summary's (`:923-926`).
  - [inference] So the user examples look like copies of the organization ones and are weak evidence that user endpoints report Actions. The intro is the page's only statement of what they cover, and it says Copilot.
- **Availability:** "Note: This endpoint is only available to users with access to the enhanced billing platform." (`R-RBU:1160`; RB:2805). The page does not say whether a GitHub Free personal account has that platform.
- **The organization usage endpoints ask for more than the budgets read.**
  - All four say "To use this endpoint, you must be an administrator of an organization within an enterprise or an organization account." (`R-RBU:498`, `:612`, `:726`, `:828`).
  - They need "\"Administration\" organization permissions (read)" (for example `:737`). The usage report carries the same enhanced-billing note (`:728`).
  - [inference] After step 7, a runner reading the organization's usage would need the machine account to be an organization administrator. The budgets read (R3) also accepts a billing manager.

### R3. Row 190, the budget endpoints

- **Organizations only, at rendered grade (Free, Pro & Team version).**
  - The page's intro is "Use the REST API to get budget information." (`R-RBB:481`).
  - Its five operations (`R-RBB:152-160`) are "Get all budgets for an organization", "Create a budget for an organization", "Get a budget by ID for an organization", "Update a budget for an organization" and "Delete a budget for an organization".
  - All five sit under `/organizations/{org}/settings/billing/budgets`, for example "get /organizations /{org} /settings /billing /budgets" (`R-RBB:577`; `restOperations[0..4].requestPath`).
  - "/users/" has 0 matches in the `.txt`. The `.html`'s 18 matches are all sidebar links to `/en/rest/users/…`.
  - Any enterprise budget endpoints would be in the Enterprise Cloud version of the page, which was not captured.
  - With the eight usage operations, this makes the 13 operations in RB. None of the 13 reads a payment method.
- **The `user` scope is not a personal account.**
  - "user : Budgets scoped to an individual user." (`R-RBB:548`). On create: "user : Apply the budget to a single user in the organization." (`:705`).
  - "user and multi_user_customer scopes are only supported when" / "budget_product_sku is ai_credits or premium_requests ." (`:707-708`).
  - The page's own example "limits a single user's monthly Copilot AI credits to $30 USD" (`:487`).
  - So a user-scoped budget is a Copilot budget for one member inside an organization. This refines BA:27, which named AI credits only, by adding premium requests.
- **Permissions:**
  - **Read:** "Gets all budgets for an organization. The authenticated user must be an organization admin or billing manager." (`R-RBB:504`), with "\"Administration\" organization permissions (read)" (`:514`). "Get a budget by ID" is the same (`:808`, `:817`).
  - **Write:** create (`:655-656`), update (`:898`) and delete (`:1020`) carry the same role sentence and need "\"Administration\" organization permissions (write)" (`:665`, `:907`, `:1029`).
  - **Token types:** all five accept "GitHub App user access tokens", "GitHub App installation access tokens" and "Fine-grained personal access tokens" (for example `:509-511`). `serverToServer` is `true` in all five `progAccess` blocks. No classic scope is named.
- **What the pass read must check** (refines tick 19 §5.4):
  - **The fields.** The rendered body parameter says `prevent_further_usage` means "Whether to prevent additional spending once the budget is exceeded." (`R-RBB:684`). The decoded list schema is at `props.pageProps.restOperations[0].codeExamples[0].response.schema.properties.budgets.items.properties`:
    - `budget_amount`: "The budget amount limit in whole dollars. For license-based products, this represents the number of licenses."
    - `prevent_further_usage`: "The type of limit enforcement for the budget".
    - `budget_scope`: the seven values of RB:168-179.
    - `budget_type`: `SkuPricing` or `ProductPricing`.
    - `budget_product_sku`: "A single product or sku to apply the budget to." The schema's `required` list names this singular field.
    - `consumed_amount` is described as "The amount consumed for a user-scoped budget, or for a multi-user budget when filtering by user." [inference] So the read shows that the fence exists, not how much of it has been used.
  - **The examples are unreliable, so the reader must check values exactly.**
    - The list example spells the field "budget_product_skus": [ (`R-RBB:605`) followed by "actions" (`:606`). The get-by-ID response has "budget_product_sku": "actions_linux" (`:883`). [inference] The reader must accept either spelling.
    - The get-by-ID and update examples pair "budget_type": "ProductPricing" with "actions_linux" (`:882-883`, `:1003-1004`), against the rule at `:722-724` below.
    - The second list example is printed only as "Example 2: Status Code 200" (`:575`). In `restOperations[0].codeExamples[1]` it shows a `multi_user_customer` ProductPricing `actions` budget, against `:707-708`.
  - **The budget type matters.** "ProductPricing : Covers all SKUs that belong to a product. Set budget_product_sku to a product such as actions or packages ." (`R-RBB:722`), against "SkuPricing : Covers a single, specific SKU. Set budget_product_sku to a SKU such as actions_linux ." (`:724`). [inference] A SkuPricing budget on actions_linux leaves the other Actions SKUs (storage, other runners) without a limit, so it is not a pass.
  - **Paging.** "Each page returns up to 100 budgets." (`:505`). `per_page` has "Default : 10" (`:537`). A `scope` filter offers "organization : Budgets scoped to the organization." (`:542`). The example includes "has_next_page" (`:650`). [inference] Read with `scope=organization&per_page=100` and follow `has_next_page`.
  - **Errors.** The get-all 404 is "Resource not found" (`:565-566`). The create 404 is "Feature not enabled or organization not found" (`:755`), and the update 404 is "Budget not found or feature not enabled" (`:964`). [inference] The feature can be switched off for an organization. A 403 or a 404 is a fail, and so is an empty list (tick 19 §5.4).
  - **A $0 value appears only in an example.** It is a repository-scoped actions_linux budget (typed ProductPricing) with "budget_amount": 0 and "prevent_further_usage": true (`:883-887`). [inference] This shows the field can hold 0. It does not show that GitHub accepts a $0 organization budget on the whole Actions product.
  - **The page admits a defect in its own schema:** "The request body schema below is missing a required field." (`:485`).
- **A runner could create the budget itself, but should not** [inference].
  - The create example has the fence's exact shape, at $500 instead of $0: `"budget_amount":500,"prevent_further_usage":true,"budget_scope":"organization","budget_entity_name":"","budget_type":"ProductPricing","budget_product_sku":"actions"` (`R-RBB:781`).
  - Creating needs Administration: write (`:665`). The same permission deletes a budget (`:1029`) and updates one, and the update example switches Stop usage off: `{"prevent_further_usage":false,"budget_amount":10,` (`:990`). A token that can undo the fence is a poor witness that the fence exists.
  - The safer grant is read-only. The owner creates the budget in the step-7 sitting, before the first run (BA:70, github grade).

### R4. Tick-19 claims after this capture

- **Now at rendered grade:**
  - GA:139 and DOQ:1 (`R-GA:384`, `:500`); DOQ:3 (`:502`); GA:143 (`:388`).
  - AIQ:1, AIQ:3 and AIQ:5 (`:330-352`).
  - GA:24, :26, :28 and :32 (`:208`, `:210`, `:212`, `:218`); GA:65 (`:260`); GA:114 (`:318`); GA:117 (`:324`); GA:121 (`:328`); GA:125-129 (`:366-372`); GA:133 (`:376`); GA:134 (`:378`); GA:36 and :38 (`:222`, `:224`).
  - PRICE:4 (`:414-416`).
  - RBU:13 and :15 (`R-RBU:489`, `:491`).
  - RB:2762-2763, :2805, :2823-2824 and :2925-2931 (`R-RBU:1157-1168`, `:1240-1241`); RB:2939, :3009 and :3179-3185 (`:1253-1268`).
  - The budget paths (RB:6, :514, :776, :961, :1208), RB:64 and RB:500-508 (`R-RBB:152-160`, `:504`, `:509-514`); RB:40 (`:548`).
  - RB:162, :166 and :168-179 (the decoded schema).
  - The facts in RB:2927 and S2S:12117, and the §3 inference that the user usage page omits installation tokens (`R-RBU:1164-1165`).
- **Refined:**
  - The minute reset: the page says both "billing cycle" (`R-GA:212`) and "month" (`:328`, `:332`, `:390`). BC:26 (github grade) makes the metered billing period the UTC calendar month.
  - User-scoped budgets: for Copilot AI credits or premium requests, for one user inside an organization (`R-RBB:705-708`).
  - Budget permissions: read for the two gets, write for create, update and delete.
  - The pass read: product type, exact values, both field spellings, paging and errors.
  - The user usage endpoints: there are four, two of them for AI credits and premium requests. Their Plan permission is an account permission, so a token reads only its own user (PAT:173, :191, github grade).
- **Unchanged and still github grade:** SB:34, :44, :46, :61, :63, :152; BA:20, :24, :27, :37, :70; PUI:13; LFS:58-59; HBW:50, :54; LRP:1; RP:14, :68; GT:17; GTP:4-33; AUR:26, :31; ABS:1; IB:50; EBP:4.
- **Still open:**
  - Classic versus fine-grained tokens for user usage (narrowed).
  - Whether user usage covers Actions (the live page contradicts itself).
  - Whether GitHub Free accounts have the enhanced billing platform.
  - Whether the machine account can hold the billing-manager role and a fine-grained token with the organization as resource owner (R5.2).

### R5. What this changes for ruling (b) and FABLE_QUEUE row 18 ([inference] unless cited)

1. **The short answer stands, and most of it is now rendered.**
   - A runner cannot read a personal account's Actions limit:
     - The budgets API covers organizations only (`R-RBB:152-160`).
     - The user endpoints read usage, do not list installation tokens (`R-RBU:1163-1168`), and read only the token user's own account (PAT:173, github grade).
     - None of the 13 operations reads a payment method.
   - One link is still github grade: `GITHUB_TOKEN` is an installation token (GT:17).
   - For the personal-account phase, "The precondition cannot be met as written" (`logs/CHANNEL_LOOP.md:147`) holds.
2. **Row 18's premises, as the board will read them:**
   - "With no payment method on file, usage stops at the included quota and cannot bill."
     - The first half is now rendered (`R-GA:384`, `:500`). "Cannot bill" is the inference drawn from it.
     - Option (i)'s first answer (tick 19 §5.3 (a)) rests on rendered text.
     - Its second answer, a $0 budget with Stop usage, still rests on SB:61 (github grade).
   - "A user usage endpoint needs a fine-grained Plan: read token and reads usage, not the limit" should become:
     - A fine-grained PAT or a GitHub App user access token, with "Plan" user permissions (read). Installation tokens are not listed, and the page is silent on classic tokens (`R-RBU:1163-1168`).
     - The token reads only its own user's account (PAT:173, github grade).
     - It reads usage, not the limit.
   - **Option (ii)'s grant:**
     - Name it exactly: Administration: **read** (`R-RBB:514`), with the machine account an organization admin or billing manager (`:504`). Never grant Administration: write (`:665`, `:990`, `:1029`).
     - Two points are open at github grade (verifier read), and the step-7 sitting would have to settle them:
       - **Membership:** a fine-grained PAT can take an organization as resource owner only for a member. The token form otherwise fails with "`Cannot find the specified resource owner: octodemo` because you're not a member of the `octodemo` organization" (PAT:139). Billing managers "**are not** able to:" "Create or access repositories in your organizations" or "Be seen in the list of organization members" (BM:28, :31, :33). The role itself exists on GitHub Free: organization owners and billing managers "Can manage billing for an organization on" GitHub Free "or" GitHub Team (BR:19). [inference] Whether one account can be both the member that runs the private repo and the billing manager that reads budgets is open.
       - **Approval:** if the organization requires approval, the token "will be marked as `pending` until it is reviewed by an organization administrator" and "will only be able to read public resources until it is approved" (PAT:118). "If you are an owner of the organization, your request is automatically approved." (PAT:118).
     - [inference] Making the machine account an owner, with a read-only token, avoids both points but gives the account far more than it needs. The runner holds the token, not the role.
   - **Option (ii)'s pass read:** `GET /organizations/mehudak/settings/billing/budgets?scope=organization&per_page=100`.
     - It passes only if one budget has `budget_type` `ProductPricing`, product exactly `actions` (in `budget_product_sku` or `budget_product_skus`), `budget_scope` `organization`, `budget_amount` 0 and `prevent_further_usage` `true`.
     - It fails on any 403 or 404, an empty list, only SkuPricing budgets, or a ProductPricing budget on any product value other than `actions`.
     - It should not use the organization usage report, which needs an organization administrator (`R-RBU:726`).
   - **Option (iii):** the minutes Copilot code review uses in private repositories are now rendered (`R-GA:222`, `:224`, `:380`). "Copilot code review off" stays a condition of the zero-minute route.
   - **Option (iv)** is unchanged.
3. **The fence needs no new window, only a UTC month.**
   - The page resets minutes both "at the start of each billing cycle" (`R-GA:212`) and "At the start of each month" (`R-GA:328`).
   - The metered billing period "starts at 00:00:00 UTC on the first day of each month" (BC:26, github grade), so the two name the same period.
   - Tick 19 §5.6's monthly ceiling stands, counted by UTC calendar month. A job that starts just after midnight Israel time on the 1st can still fall in the previous UTC month.
   - A rolling 31-day count is not needed. It stays available as an extra margin.
   - Rendering the billing-cycles page (R6) would bring BC:26 to rendered grade.
4. **Unchanged:**
   - Having no payment method on file is still a state, not a setting (tick 19 §5.3 (a)).
   - After step 7 the organization is a separate account, and no endpoint reads its payment method (tick 19 §5.4).
5. **The two open token questions are moot for (b).**
   - The questions are whether classic or fine-grained tokens work for user usage, and whether user usage carries Actions. Neither changes any option, because no user endpoint reads a limit.
   - The user endpoints read only the token's own account (PAT:173). So even an after-the-fact usage check (`netAmount` 0) would need a token from the owner's own account, not `BRAND_GITHUB_TOKEN`.
   - Tick 19 §5.2 already judged such a check not worth a new secret before step 7.
6. **Nothing is filed or run.** Mozilla's dry run stays parked on row 18 (`logs/CHANNEL_LOOP.md:147`).

### R6. Next-render URLs (not captured; each has a written source)

| URL | Slug | Source of the URL | What it settles |
|---|---|---|---|
| `https://docs.github.com/en/billing/how-tos/set-up-budgets` | `gh-docs-set-up-budgets` | `gh-docs-actions-billing.html`: the link "Setting up budgets to control spending on metered products" in `R-GA:502` (`href="/en/billing/how-tos/set-up-budgets"`); also the sidebar "Set up budgets" (`R-GA:101`); raw source SB in the tick-19 table | Budgets for a personal account (SB:44, :46); "Stop usage when budget limit is reached" and its note on user-level budgets (SB:61); no stop without that option (SB:63); stacking (SB:34); deletion (SB:152). Together these are the (b) branch of the owner look and option (ii)'s budget, at rendered grade. First priority. |
| `https://docs.github.com/en/billing/concepts/budgets-and-alerts` | `gh-docs-budgets-and-alerts` | `gh-docs-actions-billing.html`: the link "Budgets and alerts" in `R-GA:504` (`href="/en/billing/concepts/budgets-and-alerts#included-usage-alerts"`) and the sidebar (`R-GA:31`); raw BA | BA:20, :24, :27 and :37, and the first-cycle gap BA:70, which is why the $0 budget must exist before the first run. |
| `https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens` | `gh-docs-fine-grained-pat` | `gh-docs-rest-billing-budgets.html` and `gh-docs-rest-billing-usage.html`: every "Fine-grained personal access tokens" item links to `#creating-a-fine-grained-personal-access-token`; raw PAT (verifier) | PAT:108, :118, :139 (organization as resource owner, membership, approval) and PAT:173, :191 (Plan is an account permission for one's own account only), at rendered grade. This is option (ii)'s grant. |
| `https://docs.github.com/en/billing/reference/billing-roles` | `gh-docs-billing-roles` | `gh-docs-actions-billing.html` sidebar: "Billing roles" (`R-GA:160`, `href="/en/billing/reference/billing-roles"`); raw BR (verifier) | BR:19 (organization billing managers on GitHub Free) and what the role may do with budgets. This is the role half of option (ii). |
| `https://docs.github.com/en/billing/tutorials/automate-usage-reporting` | `gh-docs-automate-usage-reporting` | `gh-docs-rest-billing-usage.html`: the link in `R-RBU:489` (`href="/en/billing/tutorials/automate-usage-reporting#step-1-decide-what-level-to-report-on"`); also the `R-GA` sidebar (`:175`); raw AUR | The other side of the token contradiction (AUR:31, classic PAT only) and AUR:26 (account holder). |
| `https://docs.github.com/en/actions/concepts/security/github_token` | `gh-docs-github-token` | [inference] Derived from GT's raw path `content/actions/concepts/security/github_token.md` (tick-19 table). It uses the `content/<path>.md` → `/en/<path>` mapping that `R-GA`'s own `props.pageProps.articleContext.currentPath` shows for GA. No capture links it. | GT:17 (`GITHUB_TOKEN` is an installation access token): the last github-grade link in "GITHUB_TOKEN cannot read user usage". |
| `https://docs.github.com/en/billing/reference/actions-runner-pricing` | `gh-docs-actions-runner-pricing` | `gh-docs-actions-billing.html`: the link "Actions runner pricing" in `R-GA:434`; also the sidebar (`R-GA:152`); raw RP | RP:14 (each job rounded up to a whole minute) and RP:68 (included minutes cannot be used for larger runners). The fence uses both. |
| `https://docs.github.com/en/billing/concepts/billing-cycles` | `gh-docs-billing-cycles` | `gh-docs-actions-billing.html` sidebar: "Billing cycles" (`R-GA:29`, `href="/en/billing/concepts/billing-cycles"`); raw BC (verifier) | BC:26 (the metered billing period is the UTC calendar month), which ties "billing cycle" (`R-GA:212`) to "month" (`R-GA:328`) and sets the fence's counting window. |
| `https://docs.github.com/en/billing/reference/product-usage-included` | `gh-docs-product-usage-included` | `gh-docs-actions-billing.html` sidebar (`R-GA:170`, `href="/en/billing/reference/product-usage-included"`); raw PUI | PUI:13 (usage is charged unless a budget with "Stop usage when budget limit is reached" is set). Lower priority once set-up-budgets is rendered. |
| `https://docs.github.com/billing/using-the-new-billing-platform` | `gh-docs-enhanced-billing-platform` | `gh-docs-rest-billing-usage.html`: the link "About the enhanced billing platform" in the note at `R-RBU:728` | Whether a GitHub Free personal account has the enhanced billing platform, and so whether the user usage endpoint (`R-RBU:1160`) answers at all. Lowest priority, since usage is not the limit. |

### What rows 188-190 settle for FABLE_QUEUE row 18

- **Settled (rendered):**
  - With no valid payment method on file, usage is blocked at the quota, and larger runners are blocked outright (`R-GA:384`, `:500`).
  - GitHub Free includes 2,000 minutes, 500 MB (shared with Packages) and 10 GB of cache per repository. GitHub Free for organizations has the same (`R-GA:336-352`, `:378`).
  - Standard runners are free in public repositories (`R-GA:208`, `:366-368`). Larger runners are always charged (`:376`).
  - The budgets API covers organizations only. Reading needs Administration: read and an organization admin or billing manager, and installation tokens are accepted (`R-RBB:504`, `:509-514`).
  - The user usage endpoints take GitHub App user access tokens or fine-grained PATs with Plan: read. They do not list installation tokens (`R-RBU:1163-1168`).
- **Refined:**
  - "Billing cycle" and "month" name one reset. The metered billing period is the UTC calendar month (BC:26, github grade), so the fence counts by UTC month.
  - The exact pass read for option (ii), with exact type and product values.
  - Option (ii)'s grant is read-only, never write.
  - A Plan: read token reads only its own account (PAT:173, github grade).
- **Left to the board:**
  - The choice among (i)-(iv).
  - Whether (i) may rest on the no-payment-method state alone, now that it is rendered, given that it lapses if a payment method is ever added.
  - Whether option (ii)'s grant (billing manager or owner, plus a read-only Administration token, plus any organization approval of fine-grained PATs) joins the step-7 sitting.
- **Open for (ii), github grade:**
  - Whether a billing manager, who is not listed as an organization member (BM:33), can pick the organization as a fine-grained token's resource owner (PAT:139).
  - Whether the same account can also be the member that runs the private repo.
- **Open but moot for (b):**
  - Whether classic or fine-grained tokens work for user usage.
  - Whether user usage covers Actions.
  - Whether GitHub Free has the enhanced billing platform.

### What this adds for the sitting

- Rows 188-190 were rendered 29.9 at 13:02 UTC and read in tick 20. Row 18's premise 'with no payment method on file, usage stops at the included quota' is now rendered grade (research/rendered/gh-docs-actions-billing.txt:384, :500). 'Cannot bill' is the inference drawn from it. Larger runners are blocked outright until a payment method is set up (same line).
- Correct the row's 'a user usage endpoint needs a fine-grained Plan: read token' to: a fine-grained PAT or a GitHub App user access token with "Plan" user permissions (read). Installation tokens (so GITHUB_TOKEN) are not listed, and the page does not mention classic tokens (research/rendered/gh-docs-rest-billing-usage.txt:1163-1168; decoded progAccess.serverToServer is false for all four user endpoints). Plan is an account permission, usable only 'when the current user is the resource owner' (PAT:173, :191, github grade). So only the owner's own token could read the owner's usage.
- The budgets API is organization-only at rendered grade: five operations, all under /organizations/{org}/settings/billing/budgets (research/rendered/gh-docs-rest-billing-budgets.txt:152-160). The 'user' scope is one member inside an organization, for Copilot AI credits or premium requests only (:705-708). No endpoint reads a personal account's budget or payment method.
- Option (ii) grant: Administration organization permissions (read) (:514), with the machine account an organization admin or billing manager (:504). Never grant write (:665): it creates, deletes (:1029) and can switch Stop usage off (:990). Do not add the organization usage report, which needs an organization administrator (gh-docs-rest-billing-usage.txt:726).
- Option (ii) has two open points for the step-7 sitting (github grade, verifier read). First, a fine-grained PAT can target an organization only for a member ('Cannot find the specified resource owner ... because you're not a member', PAT:139), while billing managers are not able to 'Create or access repositories' or 'Be seen in the list of organization members' (BM:31, :33). Second, the organization may hold the token 'pending until it is reviewed by an organization administrator' (PAT:118). The role exists on GitHub Free (BR:19). Rendering the PAT page and billing roles would bring these to rendered grade.
- Option (ii) pass read: GET /organizations/mehudak/settings/billing/budgets?scope=organization&per_page=100, following has_next_page (:505, :537, :542, :650). It passes only on budget_type ProductPricing, product exactly 'actions' (in budget_product_sku or budget_product_skus; the page spells it both ways, :605 and :883), budget_scope organization, budget_amount 0 and prevent_further_usage true. The page's own examples mislabel types (ProductPricing with actions_linux, :882-883), so the values must be checked exactly. A 403, a 404 ('Feature not enabled', :755), an empty list or SkuPricing-only budgets (:724) fail.
- Option (i): answer (a), no payment method, now rests on rendered text. Answer (b), a $0 budget with 'Stop usage when budget limit is reached', still rests on SB:61 (github grade; 'stop usage' has 0 matches in the three captures). Rendering set-up-budgets is a ₪0 render that would close it before the sitting.
- The fence needs no rolling window. The page's 'billing cycle' (gh-docs-actions-billing.txt:212) and 'month' (:328, :332, :390) name one period: the metered billing period starts '00:00:00 UTC on the first day of each month' (BC:26, github grade). Keep tick 19 §5.6's monthly ceiling, counted by UTC calendar month.
- Option (iii) condition confirmed at rendered grade: Copilot code review consumes private-repo Actions minutes (gh-docs-actions-billing.txt:222, :224, :380) and runs on standard Ubuntu runners by default (:228).
- Moot for (b): whether classic or fine-grained tokens work for user usage (rendered reference :1165 against AUR:31), and whether user usage covers Actions (the intro at :491 against 'total usage' at :1158 and an Actions example copied from the organization one, :808-813 vs :1239-1244). No user endpoint reads a limit.
- Nothing was filed or run. Mozilla row 8 stays parked (logs/CHANNEL_LOOP.md:147).

---

## 29.9 (tick 22, rendered)

ZERO-TESTS rows 214-215 (captured 29.9 ~16:22 UTC). Read by an Opus reader, checked by an adversarial verifier.

### Budgets at rendered grade (tick 22)

**Read by:** a tick-22 Opus reader, from the render-watch captures of ZERO-TESTS rows 214-215 (`research/channel-loop/ZERO-TESTS.md:223-224`), for FABLE_QUEUE row 18 option (i)(b) (`logs/FABLE_QUEUE.md:42`). Checked by an adversarial verifier. Every quote below was checked with `grep -n -F` against its `.txt`.
- verifier: all 37 rendered quotes were re-checked with `grep -n -F`. Every line number holds.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12, `.html` per `.meta.json`) | Lines | Docs version |
|---|---|---|---|---|---|
| `R-SB` | `gh-docs-set-up-budgets.txt` | 2026-09-29 16:22:18 | `cefb4fccd9b6` | 401 | Free, Pro & Team |
| `R-BA` | `gh-docs-budgets-and-alerts.txt` | 2026-09-29 16:22:19 | `b0189522a494` | 301 | Free, Pro & Team |

- **Capture status:** both have status 200, `firstFetch: true` and `truncated: false`. `currentVersion` is `free-pro-team@latest` in both `.html` files.
- **Source unchanged:** the reader re-fetched raw SB and BA at 16:29 UTC and got sha256 `1e517fd1956d` (173 lines) and `1528e37f6497` (78 lines). These are the tick-19 hashes, so the tick-19 `SB:n` and `BA:n` line numbers still apply.
  - verifier: re-fetched raw SB, BA, LFS, ABS and PUI at 16:35 UTC. All five match the tick-19 table: `1e517fd1956d`, `1528e37f6497`, `819024f58957`, `5205eb52216c`, `da16b2b79ce0`.
- **Terms:** docs.github.com falls under `github.com`, which is `CONDITIONAL_MET` (`research/channel-loop/terms-verdicts.json:113-114`). The footer's "All Docs are open source." (`R-SB:395`) is not a terms reading.
  - verifier: the verdict stands. The audit row describes our use as "one GET per week of 7 public, non-personal pages" (`research/channel-loop/TERMS-AUDIT-2026-09-29.md:25`). The captures now hold 11 URLs on github.com hosts, 6 of them on docs.github.com. That is still one plain GET per page per week, but the count in the audit row is out of date.

**1. Personal-account budgets exist. Confirmed.**
- The heading "Managing budgets for your personal account" is at `R-SB:215` (SB:44; also in the page's contents list at `:197`).
- "Budgets can be set for a specific repository or for your whole account." (`R-SB:217`; SB:46, word for word).
- The concepts page says: "personal account owners can set budgets for their own account." (`R-BA:235`; BA:37).
- New at rendered grade: the page's "Who can use this feature?" (`R-SB:190`) is "Organization owners, billing managers, and personal account users" (`R-SB:192`).
- The owner's route is rendered too: "Open your billing overview page: https://github.com/settings/billing ." (`R-SB:219`; ABS:1), then "Click Budgets and alerts ." (`R-SB:221`; SB:50).
- The personal steps offer three types: "Under "Budget Type" select Product-level budget , SKU-level budget , or Bundled AI credits budget ." (`R-SB:225`). Scope and amount are separate steps: "Under "Budget scope", set the scope of spending for this budget." (`:233`) and "Under "Budget", set a budget amount." (`:235`).
- verifier: this confirms personal-account budgets **in the Free, Pro & Team docs**. It does not confirm them for the GitHub Free plan by name.
  - `R-SB:192` is the `fpt` branch of a reusable: "{% ifversion fpt %}Organization owners, billing managers, and personal account users" (PEBP:1, github grade: `data/reusables/permissions/enhanced-billing-platform.md`, fetched 16:38 UTC, sha256 `ea41455338a7`, 1 line).
  - Both pages are versioned `feature: enhanced-billing-platform` (SB:5, BA:6). That flag's comment names only "GitHub Enterprise plan from June 2024 and GitHub Team plan from Nov 2024" (EBP:1; re-fetched, same sha256 `59cf5461aae4`).
  - Neither capture names GitHub Free.
  - Tick 20's open point, "Whether GitHub Free accounts have the enhanced billing platform." (`actions-spending-limit.md:407`), is narrowed but not closed. The owner look settles it: either "Budgets and alerts" appears under `https://github.com/settings/billing` or it does not.

**2. "Stop usage when budget limit is reached": confirmed in the personal steps, but "if available". No rendered sentence names personal account, Actions and Stop usage together.**
- **In the personal steps:** "To stop any usage and further spending once the budget limit is reached, select Stop usage when budget limit is reached , if available. This option is not available for user-level budgets, which always enforce a hard stop." (`R-SB:237`; SB:61, word for word).
- **Without the option there is no stop:** "If you do not select Stop usage when budget limit is reached , you will be notified by email if you exceed your budget, but usage will not be stopped." (`R-SB:241`; SB:63).
- **The only rule for when it is available is in the organization/enterprise section, not the personal one:** "This option is available for metered products and for Advanced Security SKU-level budgets ." (`R-SB:335`, under "Managing budgets for your organization or enterprise", `:259`). The personal section gives no rule of its own.
  - verifier: the organization section says it a second time: "For budgets that control metered use of a product, you can also block further use when the budget is exhausted." (`R-SB:265`). Both statements are in the organization section.
- **Actions is a metered product that can be stopped. This sentence does not limit the account type:** "For metered products such as GitHub Actions, Copilot AI credits, or cloud sandboxes, you can set budgets to prevent usage once the budget threshold is reached." (`R-BA:215`; BA:20).
- **The personal steps never name Actions.** Their product example is Codespaces: "To limit spending at a Product-level, in "Product-level budget" choose a product from the dropdown, for example: Codespaces." (`R-SB:227`). In the article body, "Actions" appears only in the organization example (`R-SB:209`).
- **"User-level" budgets mean Copilot budgets:**
  - "For Copilot under usage-based billing, user-level budgets add another layer to consider." (`R-SB:213`).
  - "Users : Sets a per-user budget. Available when you select Bundled AI credits budget as the budget type." (`R-SB:315`).
  - "User-scoped budgets are currently only supported for Copilot AI credits, and have three scopes:" (`R-BA:223`; BA:27).
  - [inference] A personal Actions budget is scoped to a repository or to the whole account (`R-SB:217`), so it is not a user-level budget. Tick 19's reading (`actions-spending-limit.md:56`) stands. If someone read it the other way, the text says such budgets "always enforce a hard stop" (`R-SB:237`). Neither reading leaves an Actions budget unable to stop.
  - verifier: under that second reading, a personal budget with no checkbox would be a hard stop the look cannot see. The only rendered rule for a box that is not selected is `R-SB:241`: usage "will not be stopped". So a missing box still fails (b). That is the fail-closed choice.
- **Stacking and the Actions example (organization), confirmed:**
  - "if any budget with Stop usage when budget limit is reached enabled is exhausted, additional usage is blocked." (`R-SB:207`; SB:34).
  - "The organization has used all the included quota of actions minutes and an extra $50 of billed minutes." and "Members are now blocked from using all GitHub-hosted runners until the next billing cycle or until the "Actions" product budget is increased." (`R-SB:209`; SB:38).
- **Only paid use counts:** "Each budget has a type and a scope that define which paid use contributes to spending against the budget." (`R-BA:219`; BA:24). [inference] Together with `R-SB:209`, this means a $0 Actions budget should leave the free minutes usable. That inference now rests on rendered text.
- **Still not rendered: a $0 amount.** "$0" has 0 matches in both `.txt` files (verifier: and in both `.html` files). The $0 case is still documented only for Git LFS: "**Budget set to $0**: You are not charged for overages, but" LFS usage is blocked "for the rest of the calendar month" (LFS:58, github grade; re-fetched 16:29, same line; verifier: again at 16:35, same sha256). [inference] If GitHub treated a $0 Actions budget as used up from the start and blocked free minutes too, the fence fails closed: jobs are blocked and nothing is billed. The first dry-run job would show it.

**3. The first-cycle gap. Confirmed word for word.**
- Under "Your first billing cycle after creating a budget" (`R-BA:275`): "When you first create a budget, be aware that the budget applies only to metered usage from the date of its creation onwards. Any use made before you created the budget is not included in the calculations. This means that you may exceed your budget in the first billing cycle after you create your budget, even if you select the option stop usage when the limit is reached." (`R-BA:277`; BA:70). Tick 19 quoted only the first and last sentences. The middle one gives the cause.
- [inference] The gap comes from use made before the budget existed, and only paid use counts (`R-BA:219`). So the rule "a $0 budget must exist before the first private-repo run" (`actions-spending-limit.md:79`) now rests on rendered text, and it is enough to close the gap. Free minutes used earlier in the month are not paid use and do not open the gap. The page says "from the date of its creation" and does not give the granularity, so create the budget before the first run, not alongside it.
- Answer (a), no payment method on file, still has no such gap (tick 19 §5.3).
- verifier: neither page says how quickly a budget blocks usage once it is used up. "delay", "real time", "real-time" and "immediately" have 0 matches in both `.txt` files. [inference] With a $0 budget, a job that is running when the quota runs out might bill some minutes before the block. The monthly ceiling "well under 2,000 minutes" (`actions-spending-limit.md:218`) keeps usage below the quota, so it stays the first fence and the budget is the backstop. "It is enough" above applies to the first-cycle gap only, not to how fast the block takes effect.

**4. What this means for FABLE_QUEUE row 18, option (i)(b)** ([inference] unless cited)
1. **The github-grade dependency is closed.** Tick 20 said (b) "still rests on SB:61 (github grade)" (`actions-spending-limit.md:423`, `:503`). It now rests on `R-SB:237`, `:241` and `R-BA:215`, `:277`. Both answers of option (i) are now rendered: (a) on `R-GA:384`, `:500`, and (b) on these lines.
2. **What stays open. The owner look settles four points by sight. The first dry-run job settles a fifth.** The look should be written as a checklist:
   - Open `https://github.com/settings/billing`, then Budgets and alerts (`R-SB:219`, `:221`).
   - Budget type Product-level (`R-SB:225`) on product Actions, not a SKU-level budget. A SKU budget leaves the other Actions SKUs unfenced, as with SkuPricing in tick 20 (`R-RBB:724`).
   - Scope: the whole account, not a repository (`R-SB:217`). verifier: the organization section says "you cannot change the scope of a budget after creating it" (`R-SB:361`), and the personal section is silent. Set the scope correctly at creation.
   - Amount: $0 (`R-SB:235`).
   - "Stop usage when budget limit is reached" ticked (`R-SB:237`, `:241`).
   - Created before the first private-repo run (`R-BA:277`).
   - **By sight:**
     - (1) "Budgets and alerts" offers an Actions product-level budget on this account. This is the plan question in §1.
     - (2) The checkbox is offered ("if available").
     - (3) $0 is accepted.
     - (4) A budget can be created with no payment method on file. This matters only if (a) also holds.
   - If (1), (2) or (3) fails, (b) fails and only (a) remains.
   - **Not by sight:** whether a $0 budget leaves the free minutes usable. Only the first dry-run job shows that, and it fails closed (§2).
   - verifier: the reader wrote "The owner look settles all three by sight" and counted "whether $0 leaves the free minutes usable" among them. That cannot be seen on the settings page; §2's own inference says the first dry-run job would show it. Points (1) and (4) are added.
3. **(b) is also a snapshot, but a sturdier one than (a).**
   - "To edit or delete a budget, on the "Budget and alerts" page, click Edit or Delete next to the budget you want to edit or delete." (`R-SB:247`, personal section). The deletion warning, "Deleting a budget may remove any limits on spending, depending on your other existing budgets." (`R-SB:359`; SB:152), is only in the organization/enterprise section, as tick 19 noted.
   - The pages name only edit and delete as ways a personal budget ends. (a) lapses as soon as a payment method is added for any product (tick 19 §5.3). Setting (b) even while (a) holds covers a payment method added later.
   - verifier: the reader wrote "(b) lapses only if the owner edits or deletes it." The pages do not promise that. GitHub has changed budgets on its own: "Existing premium request budgets have been automatically converted to AI credit budgets." (`R-SB:263`). It also removes individual user-level budgets when they expire (`R-SB:327-329`). Neither touches an Actions product budget. [inference] (b) is sturdier than (a), but it is not permanent.
   - The pages do not say whether an account with no payment method can create a budget. verifier: "payment" (case-insensitive) appears only in the breadcrumb and sidebar: `R-SB:12`, `:18`, `:70`, `:76`, `:77`, `:87`, `:171`, and the same lines in `R-BA`. It never appears in either article body. The reader cited only `R-SB:76-77`. The look will find out (point (4) above).
4. **Alerts:**
   - [inference] A $0 budget's 75%/90%/100% threshold alerts carry no signal.
   - "Budget alerts are available for budgets scoped to your enterprise, a cost center, an organization, or a repository." (`R-BA:239`). That list has no personal whole-account scope, although the personal steps offer the alerts (`R-SB:243`).
   - The useful warning is the included-usage alert: "GitHub can send email notifications when the included usage for your plan reaches 90% and 100% during a billing period." (`R-BA:247`). It covers "GitHub Actions minutes" (`R-BA:251`) and "GitHub Actions storage" (`:253`), and it fires "regardless of whether you have set a budget" (`R-BA:273`). The owner opts in on the same page (`R-SB:257`; SB:77).
5. **After step 7 (option (ii)'s budget), now also rendered:**
   - "Organization budget scopes : the whole organization or a single repository within the organization" (`R-SB:267`).
   - "As the owner of an enterprise or organization account, or as a billing manager, you can set a budget at the account level, or at any level below this." (`R-SB:295`).
   - `R-SB:335` and `:265` apply there directly.
6. **Unchanged:**
   - (i) is still an owner step and crosses `research/breadth/BOARD.md:185`.
   - The choice among (i)-(iv) stays with the 1.10 sitting (`logs/FABLE_QUEUE.md:42`).
   - Nothing was filed, run or created. No budget was read or made.

**5. Grade changes to R4** (`actions-spending-limit.md:403`)
- **Now rendered:**
  - SB:34 (`R-SB:207`), :38 (`:209`), :44 (`:215`), :46 (`:217`), :50 (`:221`), :61 (`:237`), :63 (`:241`), :77 (`:257`), :152 (`:359`).
  - ABS:1 (`:219`).
  - BA:20 (`R-BA:215`), :24 (`:219`), :27 (`:223`), :37 (`:235`), :70 (`:277`).
- **Still github grade:**
  - SB:10. The "spending limit" redirect is front matter and does not appear on the page (0 matches for the redirect path in either `.html`). verifier: the same applies to SB:14-20 (the Codespaces and Packages redirects, tick 19 §1).
  - PUI:13. A render is now optional, since `R-SB:241` with `R-GA:502` carries its substance (verifier: with `R-GA:388` for the charge itself).
  - LFS:58-59, HBW:50, :54, LRP:1, RP:14, :68, GT:17, GTP:4-33, AUR:26, :31, IB:50, EBP:4.
  - verifier: new github-grade citations in this section: SB:5, BA:6, EBP:1 and PEBP:1 (§1).
- **R6 rows 1-2** (set-up-budgets, budgets-and-alerts) are captured and read.
- **Citation drift:**
  - This file cites Mozilla's row as `logs/CHANNEL_LOOP.md:147` (lines 3, 418, 453, 507). The row is now at `logs/CHANNEL_LOOP.md:149`. Line 147 is CrazyGames (row 6).
  - verifier: line 198 cites step 7 as `logs/CHANNEL_LOOP.md:210-212`. Step 7 is now at `:212-214`: it starts at `:212`, and "The same sitting creates `BRAND_GITHUB_TOKEN`." is at `:214`. Line 210 is now step 6a (Apify).

**For the sitting:** option (i)(b) is now rendered. It is a $0 Actions product-level budget on the whole personal account, with "Stop usage when budget limit is reached" (research/rendered/gh-docs-set-up-budgets.txt:215, :217, :237, :241; gh-docs-budgets-and-alerts.txt:215, :235, :277). The page qualifies the checkbox with "if available". Its only availability rules, "available for metered products" (:335) and "block further use" (:265), sit in the organization section. The page never shows a $0 amount, and neither page names the GitHub Free plan. The pages are gated on a billing-platform flag whose comment names only Enterprise and Team (EBP:1, github grade).

The owner look must confirm by sight:
- "Budgets and alerts" offers an Actions product-level budget on the account.
- The checkbox is offered, and it is ticked.
- $0 is accepted.
- The budget exists before the first private-repo run.

Whether $0 leaves the free minutes usable shows only on the first dry-run job, which fails closed. The pages give no timing for the block, so the monthly minute ceiling stays the first fence. verifier: the reader's list of three things replaced "Budgets and alerts offers an Actions budget" with nothing, and its §4.2 list differed from this one. The two lists now match.
