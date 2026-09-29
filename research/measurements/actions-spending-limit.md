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
