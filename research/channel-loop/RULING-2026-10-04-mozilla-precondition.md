# Ruling — Mozilla's precondition (loop row 8), 4.10.2026 — `logs/FABLE_QUEUE.md` row 18

**Sitting.** The Fable sitting planned for 1.10.2026 ~07:11 UTC, held 4.10.2026 ~07:25 UTC: it was delayed three days
by a usage limit. Model Fable 5.1, one decider, no subagents, no web fetch, no git write, no edit outside this file; the
main thread folds on Opus. Row 23 is ruled separately; Part A of the brief was not read here. The owner is "the owner".

**Tree.** `f2fca6d` on `claude/new-session-j071dx` (`git -C . log -1 --format=%h`). The brief was assembled at `e6c7a2f`;
ticks 31-37 landed between them (`git log --oneline e6c7a2f..f2fca6d`, 38 commits, PRs #35-#39). Every pointer below was
re-opened with `sed -n` or `grep -n -F` at `f2fca6d`. `research/measurements/actions-spending-limit.md` ("the note") and
the five `gh-docs-*` captures are not in `git diff --stat e6c7a2f f2fca6d`, so their lines hold; `logs/CHANNEL_LOOP.md`,
`src/revenue/owner-steps.ts`, `src/revenue/portfolio.ts`, `terms-verdicts.json` and `urls.txt` changed and are re-pointed
in "Pointers moved".

**Read.** `MISSION.md` in full; `logs/FABLE_QUEUE.md:42`; `research/channel-loop/SITTING-2026-10-01-BRIEF.md:1-148`,
`:590-834` (Part B), `:835-948` (Part C); the note, all 627 lines (its keys resolve at `:16-45` and `:250-254`);
`research/channel-loop/RULING-2026-09-29-loop.md:1-26`, `:27-64` ((a), Firefox), `:66-135` ((b)), `:474-519`;
`logs/CHANNEL_LOOP.md` §0-§2, §4 row 8 (`:150`), §6 (`:198-259`), §9 (`:330-346`), `:381`, `:420`;
`research/channel-loop/terms-verdicts.json` `_about` (`:2`), `extensionworkshop.com` (`:84-88`), `github.com`
(`:114-118`), `mozilla.org` (`:245-249`); `research/breadth/BOARD.md:181-185`; `research/channel-loop/BOARD-LOOP.md:17`,
`:65-68`, `:136-141`; `research/channel-loop/TERMS-AUDIT-2026-09-29.md:9`, `:25-27`, `:43`, `:112`, `:138`, `:197`;
`research/channel-loop/RULING-2026-09-30-video.md:65`, `:82`, `:136-137`, `:374-377`; the five captures at every line
cited; `scripts/render-watch.mjs:420-462`; `scripts/queue-zero-test.mjs` (`termsGate`, `applyVerdicts`), run read-only on
eleven URLs; `src/__tests__/revenue/render-watch-terms-barred.test.ts`; `research/rendered/urls.txt:329-337`;
`research/channel-loop/ZERO-TESTS.md:43-46`, `:71`, `:197-199`, `:223-224`; `research/breadth/scouts/security-bounties.json:10-20`;
`research/channel-loop/scouts.json:244-246`; `.github/workflows/colony.yml:23`; `src/revenue/owner-steps.ts:331-337`,
`:381`; `src/revenue/portfolio.ts:324`; `docs/OWNER_STEPS.he.md:283-290`, `:398`; `CLAUDE.md:86`.

**Grades** as the brief defines them (`:12-14`): `rendered`, `github`, `snippet`, `repo`, `inference`, `none`. No
`[against-bar]` or `[no-terms]` source is used. Every rendered source is a docs.github.com capture held under github.com's
`CONDITIONAL_MET` (`terms-verdicts.json:114-118`, repo). Where the brief's paraphrase and a file differ, the file is cited.

**Standing rules applied.** The owner does one-time identity and payout steps only, "Everything else is ours"
(`MISSION.md:432-433`); every unavoidable step is batched into one checklist (`:435`); "Never invent a step that isn't
required." (`:436`); never an account in the owner's name (`:437`, `:339`); never a per-item owner action
(`logs/CHANNEL_LOOP.md:76`; KILL-4, `BOARD-LOOP.md:67`); "no selling, no talking, no camera, no manual ops" (`MISSION.md:211`);
no ToS violations (`:455`); ₪0: "Nothing is bought" (`:354`), fees out of a sale allowed (`:359-360`), the standing consent
"does not reach the owner's own clicks" (`:349-350`); the brand as the only public face (`:310-311`); one platform banning us
must not take the company down (`:44-45`); killing as automatic as building (`:151`), "Compute budget follows performance"
(`:463-464`); owner steps named "once per summary, without nagging" (`:401-403`); "Waiting is not a reason to stop"
(`:332`). For Mozilla in particular: "No owner step is asked before a qualifying finding." (`research/breadth/BOARD.md:185`,
repo) and "if the private repo's minutes would cost money, stop" (`BOARD-LOOP.md:139`, repo). Fetching: no fetch of "a site
whose terms are unread or refused" (`CHANNEL_LOOP.md:78`; 16(d) D2(iv), `RULING-2026-09-30-video.md:82`). Verification
before completion (`CLAUDE.md`): evidence before assertions.

**Money today:** ₪0.00 in the ledger, 0 channels running (`CHANNEL_LOOP.md:26`, repo); BBU 6/6 binding (`:107`); builds in
flight 0/1 (`:109`). Nothing in this file is revenue, and nothing in it opens an account, spends or publishes.

---

## 1. The precondition as written cannot be met by anything the colony holds

**Facts.**
1. Ruling (b) admits the harness "only after a runner has read the account's Actions spending limit as $0 (so private-repo
   minutes can never bill) and only inside the free private-repo allowance" (`RULING-2026-09-29-loop.md:116-118`, repo). The
   phrase is carried in row 8 (`CHANNEL_LOOP.md:150`), the tick-17 plan (`:381`) and `:420`.
2. "Spending limit" is the old name; its pages redirect to budgets (SB:10, github, note `:49`). A personal account can hold
   budgets (`gh-docs-set-up-budgets-2026-09-29.txt:215-217`, rendered), but the REST budgets API has five operations, all under
   `/organizations/{org}/settings/billing/budgets` (`gh-docs-rest-billing-budgets-2026-09-29.txt:152-160`, rendered). No endpoint reads a
   personal account's budget or any payment method: "payment" has 0 matches on both REST pages (note `:308`, `:353`, rendered
   basis).
3. The four user usage endpoints take GitHub App user access tokens or fine-grained PATs with "Plan" user permissions (read)
   and list no installation token (`gh-docs-rest-billing-usage-2026-09-29.txt:1163-1168`, rendered). Plan is an account permission,
   usable "only ... when the current user is the resource owner" (PAT:173, :191, github), so only the owner's own token
   could read the owner's usage. They return "total usage" (`:1158`, rendered), never a limit, and the page limits them to
   Copilot (`:491-493`, rendered). `GITHUB_TOKEN` is a repository-scoped installation token with no `plan` or
   `administration` key (GT:17, GTP:4-21, github).
4. "If your account does not have a valid payment method on file, usage is blocked once you use up your quota."
   (`gh-docs-actions-billing-2026-09-29.txt:384`, `:500`, rendered); "cannot bill" is the note's inference (`:421`). With one on file,
   "spending may be limited by one or more budgets" (`:502`, rendered). Which state the owner's account is in is held in no
   file (Part C row 18 item 1, none).
5. A runner can read only its own repository's jobs (`actions: read`, GTP:5, github): the harness's minutes, never the
   account's limit, and "The ceiling cannot see minutes used by other private repos on the same account" (note `:218`,
   inference).

**Consequence.** The precondition is a verification the colony cannot perform on a personal account with any token the
owner could issue (note `:180-188`, inference on github and rendered basis). Running private-repo minutes without it would
rest the ₪0 rule on an unobserved account state, the defect this repo names first ("a confident claim nobody checked",
`CLAUDE.md`). Ruling (b)'s own fallback applies: "If the free allowance cannot hold a meaningful run, the tick records that
and does not extend it" (`RULING-2026-09-29-loop.md:119`).

**RULING (apply as written).**
1. The words "only after a runner has read the account's Actions spending limit as $0" are struck from ruling (b) and from
   row 8, and replaced by section 2's rule 1.
2. No private repository for Mozilla is created under the owner's personal account, and no GitHub-hosted runner minute is
   spent for row 8 on that account, ever. The personal-account phase of row 8 ("create a PRIVATE repo under the existing
   GitHub account (it moves to the org at step 7)", `BOARD-LOOP.md:139`) is closed.
3. Nothing in this section asks the owner anything.

## 2. The four options: (i) rejected, (iii) rejected as not meaningful, (iv) with (ii) folded into step 7

**(i) One owner look at the personal account's billing settings: REJECTED.**
- It is an owner step for Mozilla before a qualifying finding, which the breadth board barred in terms ("No owner step is
  asked before a qualifying finding.", `BOARD.md:185`, repo) for a venue it kept only as queue #8 because its shape is "one
  payer, lumpy, rare — the opposite of the 28.9 directive" (`:183-184`). Its hit rate "is unmeasured and must be assumed
  low" (`BOARD-LOOP.md:138`). Two minutes of the owner's attention is attention spent on the venue the board ranked last,
  and a step not required is not invented (`MISSION.md:436`).
- It would be asked twice: the look "covers only the personal-account phase"; after step 7 the organisation is billed as a
  separate account, "so the check must be made again there" (note `:195`; HBW:50, :54, github). Step 7 is already item 4 of
  the free batch (`CHANNEL_LOOP.md:216-218`, repo).
- Its (a) answer, no payment method on file, is a state that lapses when any payment method is added for any product (note
  `:192`; HBW:50, :54, github): a fence the colony could not see fall. Its (b) answer rests on by-sight items the pages do
  not settle: the personal section never names Actions (its example is Codespaces, `gh-docs-set-up-budgets-2026-09-29.txt:227`,
  rendered); the checkbox is "if available" (`:237`) and its only availability rules sit in the organisation section
  (`:335`, `:265`); "$0" has 0 matches in both captures (`grep -c -F '$0'`, re-run at `f2fca6d`: 0 and 0); neither page
  names GitHub Free, and the feature flag's comment names Enterprise and Team only (EBP:1, github; note `:538-542`).
- [inference] A look that may fail by sight, must be repeated at the organisation and crosses a standing board decision
  buys nothing that step 7's sitting does not buy anyway.

**(iii) A zero-minute, session-only run: REJECTED as the dry run.**
- A private repository with no workflow files runs no jobs, provided Copilot code review is off: it consumes private-repo
  minutes and runs on Ubuntu runners by default (`gh-docs-actions-billing-2026-09-29.txt:222-228`, `:380`, rendered). The minutes
  question disappears. But the dry run counts "reproducible, minimised, non-duplicate findings that meet the bounty bar"
  (`BOARD-LOOP.md:139`, repo), and reproduction needs Mozilla's ASan/fuzzing builds, which the design fetches "on a runner"
  (`:139`).
- No file names the host that serves those builds (Part C row 18 item 7, none). At `f2fca6d`, `termsGate` answers `BARRED`
  for every `*.mozilla.org` host tried (www, bugzilla, ftp, archive, hg), "no verdict: read its terms first" for
  `firefox-ci-tc.services.mozilla.com`, and `CONDITIONAL_MET` for `github.com/mozilla/gecko-dev` (run read-only; repo). This
  container reaches only GitHub hosts (`CLAUDE.md:86`, repo; chromium.googlesource.com was "CONNECT 403",
  `TERMS-AUDIT-2026-09-29.md:26`). The Never list bars "a fetch of ... a site whose terms are unread or refused"
  (`CHANNEL_LOOP.md:78`) and D2(iv) reads "Unread or silent terms: no fetch." (`RULING-2026-09-30-video.md:82`). **Ruled:** a
  harness download of a build is "a fetch" in that sense; the gate governs every automated request the colony makes, not
  only render-watch. So no build is fetched from any host until that host's terms are read and its verdict admits it
  (section 3 corrects mozilla.org's verdict; mozilla.com has none).
- What a session can do is read the mozilla-central mirror on GitHub, with the LLM review that must run in-session anyway
  under ₪0 ("LLM-guided review running in CI would need a paid API key", `research/breadth/scouts/security-bounties.json:15`,
  repo, self-marked inference). A candidate found by reading cannot be reproduced or minimised there, so it cannot be a
  qualifying finding and cannot earn step 11 ("Only after a qualifying finding", `BOARD-LOOP.md:140`). The build estimate
  is "5-10 agent-days" (`research/channel-loop/scouts.json:246`, estimate); Mozilla "reserves 'a seven-day period for
  internal automated methods to find the same bug'" and pays nothing for bugs its fuzzers also find (`:244`, github via the
  scout). [inference] Agent-days on a run that cannot produce the thing it counts is building to look busy, which the
  move-on rule forbids (`BOARD-LOOP.md:17`, "rather than building to look busy"), and it fails ruling (b)'s own test: it is
  not "a meaningful run" (`RULING-2026-09-29-loop.md:119`).

**(ii) with (iv): ADOPTED together. Row 8 parks on step 7; step 7's sitting gains the organisation's ₪0 fence and its read;
Mozilla itself asks for nothing.**
- After step 7 the private repository belongs to the organisation `mehudak` (`CHANNEL_LOOP.md:216-218`; `BOARD-LOOP.md:139`),
  whose Free plan has the same 2,000 minutes, 500 MB and 10 GB (`gh-docs-actions-billing-2026-09-29.txt:348-352`, rendered). An
  organisation's budgets are readable: "The authenticated user must be an organization admin or billing manager"
  (`gh-docs-rest-billing-budgets-2026-09-29.txt:504`, rendered) with "Administration" organization permissions (read) (`:514`), by GitHub
  App user tokens, installation tokens or fine-grained PATs (`:509-511`). Write needs Administration (write) and can delete
  the budget (`:1029`) or switch Stop usage off (the update example, `:990`): never granted (note `:380-383`).
- **The budget is not a Mozilla step.** The §6 open decision reads "make it private (Actions minutes become metered,
  possibly a cost) or accept the exposure knowingly" (`CHANNEL_LOOP.md:236-238`, repo). `colony.yml` is scheduled hourly
  (`cron: "17 * * * *"`, `.github/workflows/colony.yml:23`, repo), about 720-744 runs a month, each job rounded up to a whole
  minute (RP:14, github), across 27 `runs-on: ubuntu-latest` lines (grep, repo). [inference] If the owner ever chooses
  "private", the organisation meters those minutes whether or not Mozilla exists. A $0 Actions product-level budget scoped
  to the whole organisation with "Stop usage when budget limit is reached" (`gh-docs-set-up-budgets-2026-09-29.txt:259-267`, `:295`,
  `:335`, rendered; stopping is for metered products "such as GitHub Actions", `gh-docs-budgets-and-alerts-2026-09-29.txt:215`) turns
  "possibly a cost" into "jobs stop", at ₪0, in the sitting where the owner is already in the organisation's settings. It
  is the ₪0 rule (`MISSION.md:352-354`) made enforceable by GitHub for the organisation's account; Mozilla inherits it.
  `BOARD.md:185` is kept in letter and purpose: no owner attention goes to Mozilla before a finding.
- **The read is required** before the first metered-capable minute, because a fence nobody read is a claim nobody checked
  (section 1). It is `GET /organizations/mehudak/settings/billing/budgets?scope=organization&per_page=100`, following
  `has_next_page` (`:505`, `:537`, `:542`, `:650`, rendered), and it passes only on one budget with `budget_type`
  `ProductPricing`, product exactly `actions` in `budget_product_sku` or `budget_product_skus` (the page spells it both ways,
  `:605`, `:883`), `budget_scope` `organization`, `budget_amount` 0 and `prevent_further_usage` true; a 403, a 404 ("Feature
  not enabled or organization not found", `:755`), an empty list, SkuPricing-only budgets (`:724`) or any other product value
  fails (note `:434-437`, rendered basis). It never uses the organisation usage report, which needs an administrator
  (`gh-docs-rest-billing-usage-2026-09-29.txt:726`, rendered).
- **Who holds the read-only token** is settled in the step-7 sitting, in this order, both at ₪0. **Shape A:** the machine
  account, already a member of the organisation for the repository (it is "add[ed] to the organisation",
  `src/revenue/portfolio.ts:324`, repo; billing managers cannot "Create or access repositories", BM:31, github), is also made
  a billing manager (the role exists on GitHub Free, BR:19, github), and a fine-grained PAT of that account takes the
  organisation as resource owner with Administration: read and nothing else. The sitting learns by doing whether one
  account may hold both roles and target the organisation (open at github grade: PAT:139 is a refusal for a non-member;
  BM:33, billing managers are not "seen in the list of organization members"; note `:431`, `:488-489`) and whether the
  organisation holds the token "pending" (PAT:118). **Shape B**, if GitHub refuses A: a fine-grained PAT of the owner's own
  account, the organisation's owner ("If you are an owner of the organization, your request is automatically approved.",
  PAT:118, github), with that one permission. A token is a secret, not a public face (`MISSION.md:310-311`); it is stored
  with the step-6 tokens. The machine account is never made an organisation owner for this (far more than the read needs,
  note `:433`), and no second machine account is created ("the ONE brand machine account GitHub's terms allow alongside a
  personal account", `src/revenue/owner-steps.ts:336`, repo).
- **The owner's by-sight list for the organisation budget, reconciled into one** (the note's two lists differ in item 4,
  `:579-582` against `:621-625`; Part C row 18 item 12): (1) "Budgets and alerts" offers an Actions product-level budget on
  the organisation; (2) scope is the whole organisation, not a repository, since scope "cannot [be] change[d] ... after
  creating it" (`gh-docs-set-up-budgets-2026-09-29.txt:361`, rendered); (3) $0 is accepted; (4) "Stop usage when budget limit is
  reached" is offered and ticked (`:335`; without it "usage will not be stopped", `:241`); (5) it is created before the
  first private repository exists in the organisation, because a budget "applies only to metered usage from the date of
  its creation onwards" (`gh-docs-budgets-and-alerts-2026-09-29.txt:277`, rendered) and only paid use counts (`:219`). Optional, same
  screen: the included-usage alerts at 90% and 100% (`gh-docs-set-up-budgets-2026-09-29.txt:257`), which fire "regardless of whether
  you have set a budget" (`gh-docs-budgets-and-alerts-2026-09-29.txt:273`, rendered). If (1), (3) or (4) fails by sight, the owner
  records what the page showed; no private repository is then created in the organisation, Mozilla stays parked, and the
  §6 decision's "possibly a cost" stands as written.
- **The fence on any Actions route** stays as the note sets it (`:211-219`, inference on rendered and github basis):
  Linux standard runners only; Copilot code review off; few artifacts (the 500 MB is shared with Packages, `R-GA:378`);
  cache under 10 GB; `timeout-minutes` on every job; a monthly ceiling well under 2,000 minutes, counted by UTC calendar
  month (BC:26, github) from the repository's own jobs. The ceiling is the first fence, the budget the backstop, and the
  read is what lets the colony say the backstop exists.

**RULING (apply as written).**
1. **The precondition now reads:** "Mozilla's dry-run harness runs only in a private repository owned by the organisation
   `mehudak` (after step 7); only after a runner has read the organisation's budgets through
   `GET /organizations/mehudak/settings/billing/budgets?scope=organization&per_page=100` and found one `ProductPricing`
   budget on product `actions`, scope `organization`, amount 0, `prevent_further_usage` true (a 403, a 404, an empty list,
   SKU-only or other-product budgets fail; the read is repeated at the start of every tick that runs a job, and a fail stops
   the harness that tick); only after the host serving Mozilla's builds has a verdict that admits the fetch; and only
   inside the free allowance under the note's fence. Nothing is filed."
2. **Who satisfies it and how it is verified:** the owner creates the budget in the step-7 sitting against the five-item
   list above and grants the read-only token (shape A, else B); the runner verifies by the read. The owner's confirmation
   alone starts no job; the read does.
3. **Step 7's text** (`docs/OWNER_STEPS.he.md:398` and `:283-290`; `src/revenue/owner-steps.ts:331-337`, `:381`;
   `CHANNEL_LOOP.md:216-218`) gains these items inside the same sitting, presented as the organisation's ₪0 fence for the
   open repo-visibility decision, with Mozilla named only as one line that would use it. No new step number. Before the
   owner page names the billing-manager role, a runner reads what that role is able to do: the repo holds only its "not
   able to" list (BM:28-33, github); the "able to" list is read from the same github/docs source at github grade and
   summarised in one line of the step text.
4. **Option (i) is rejected** and is not asked as a step on the personal account. **Option (iii) is rejected** as the dry
   run; no session-only source review is built for row 8.
5. **Row 8 is PARKED on step 7 and on the read.** It stays queue #8 at ₪0 under the cash-event rule (`BOARD.md:183-185`).
   Step 11 (the Bugzilla account) stays "only after a qualifying finding" (`BOARD-LOOP.md:140`).
6. **Pre-registered kill** (KILL-5's shape, `BOARD-LOOP.md:68`; `MISSION.md:151`): if, 90 days after step 7 is marked done,
   the harness has not completed its 30-day dry run — because the read could not be arranged, the build host's terms are
   unread or bar the fetch, or the allowance cannot hold a meaningful run — row 8 is killed as "no ₪0 route", with a
   `docs/REJECTED.md` entry; REOPEN if the colony is given a self-hosted runner host (free, GA:24, github) or a build host
   with an admitting verdict while the read is in place. The date is written into §5 the tick step 7 is marked done.
7. **Meanwhile the loop spends no agent-days on row 8:** no pipeline is built before the read passes. Ruling (b)'s "Mozilla
   harness meanwhile" (`:479`) becomes "the Mozilla harness waits on step 7". The fold below is the whole of this tick's
   row-8 work; it adds no owner ask of its own.

## 3. §9 tick-36 item 4: the AMO policy line and mozilla.org's verdict

**Facts.**
- `urls.txt:331` is **active, not paused**: `https://extensionworkshop.com/documentation/publish/add-on-policies/` with
  slug `amo-add-on-policies`, no `#` (`research/rendered/urls.txt:331`, repo, at `f2fca6d`). `termsGate` passes it,
  `{"ok":true,"site":"extensionworkshop.com","verdict":"CONDITIONAL_MET"}` (run read-only; `terms-verdicts.json:84-88`). So
  the weekly run on Tuesday 6.10 would fetch it and rewrite the capture. The item's premise, "keep the line paused", does
  not match the file.
- The line serves ZERO-TESTS row 34, Firefox Add-ons (loop row 16) (`research/channel-loop/ZERO-TESTS.md:43`, repo).
  Firefox was **killed 29.9** on G4 at rendered grade (`RULING-2026-09-29-loop.md:27-30`), and that ruling ordered "no
  render dispatch for AMO" (`:52`). Its REOPEN needs renders of AMO's `q=invoice` search pages 2-6 or the cohort's daily
  users (`:57-63`; `docs/REJECTED.md:1296-1311`), on `addons.mozilla.org`, which stays in `TERMS_BARRED`
  (`scripts/render-watch.mjs:433`), never the policy page. The policy capture has done its work: it is cited by line as
  rendered evidence in the kill ("paid features allowed with disclosure", `amo-add-on-policies-2026-09-28.txt:2051`; "machine-generated
  code allowed with source", `:2069`; `RULING-2026-09-29-loop.md:46-47`) and in the terms audit (`.html:3251`, `:2177`,
  `:3252`; `TERMS-AUDIT-2026-09-29.md:43`). Tick 36 retired the lines of the other killed candidates (Superteam Earn's
  three, Trolley's two; `CHANNEL_LOOP.md:334`). The page's source is on GitHub under a Creative Commons licence
  (`mozilla/extension-workshop`, `TERMS-AUDIT-2026-09-29.md:43`, `:112`), so any later re-read needs no fetch.
- `mozilla.org` is `BARRED` with the source "addons.mozilla.org is in TERMS_BARRED (personal data); mozilla.org's other
  pages have no active line" (`terms-verdicts.json:245-249`, repo). That is a statement about our lines, not a terms
  reading, and the file defines itself as a "Terms verdict for every site" (`:2`). The audit's reading is CONDITIONAL:
  Mozilla's Websites & Communications Terms of Use and Acceptable Use Policy (mozilla/legal-docs `en/websites_tou.md`,
  `en/acceptable_use_policy.md`; github via the auditor) bar no automated access; the condition is the AUP item "Collect or
  harvest personally identifiable information without permission. This includes, but is not limited to, account names and
  email addresses" (`acceptable_use_policy.md:14`; `TERMS-AUDIT-2026-09-29.md:27`, `:138`), which the three AMO search lines
  did not meet (authors and support emails in every result, redacted 29.9, `:9`). The same two documents are already
  recorded for `extensionworkshop.com` as `CONDITIONAL_MET`, "personal-data condition met (round 2)"
  (`terms-verdicts.json:84-88`; `TERMS-AUDIT:197`). The test pins `www.mozilla.org` as not caught by the `addons.mozilla.org`
  entry (`render-watch-terms-barred.test.ts:102-106`) and pins no verdict for `mozilla.org` (grep, repo).
- Row 8's render half, "render the bounty page and the Bugzilla account policy" (`CHANNEL_LOOP.md:150`), was never queued
  (no bounty or Bugzilla URL in `urls.txt`, grep). Its facts are held at github grade from `mozilla/bedrock` and BMO's
  templates (`research/breadth/scouts/security-bounties.json:11-12`, `:15`, `:20`, repo; "BMO etiquette.html.tmpl:121 has an
  'AI-Assisted Bug Reporting' clause", `:12`). 16(d) D3 moves a venue the runner cannot read "to its written answer and to
  GitHub-hosted copies" (`RULING-2026-09-30-video.md:136-137`); Mozilla is not among its seven venues, and its pattern is
  applied here.

**RULING (apply as written).**
1. **Retire `urls.txt:331`** in the house form (`urls.txt:43`, `:252` are the models): `# retired (ruling 4.10 row 18 §3:
   Firefox Add-ons (loop row 16) was killed 29.9, RULING-2026-09-29-loop.md (a); the capture stays as the kill's rendered
   evidence; the page's source is mozilla/extension-workshop on GitHub) — https://extensionworkshop.com/documentation/publish/add-on-policies/	amo-add-on-policies`.
   ZERO-TESTS row 34 (`:43`) takes the same status. `extensionworkshop.com`'s verdict does not change.
2. **Freeze the capture before 6.10:** `amo-add-on-policies` joins tick 38's freeze list (§9 tick-36 item 2), because two
   files cite it by line.
3. **`mozilla.org` → `CONDITIONAL_UNMET`.** Source: "Mozilla Websites & Communications Terms of Use (mozilla/legal-docs
   en/websites_tou.md, scope :12) and Acceptable Use Policy (en/acceptable_use_policy.md:14): no access bar; condition: a
   capture may store no account names or email addresses (TERMS-AUDIT-2026-09-29.md:27, :138; github via the audit)". Note:
   "Unmet as last exercised: the three AMO search lines stored authors[] and support_email (redacted 29.9), so
   addons.mozilla.org stays in TERMS_BARRED (scripts/render-watch.mjs). A bug record names its reporter and assignee, so no
   bugzilla.mozilla.org /rest/ line is ever active under this condition (grade none: no capture holds the schema; presumed
   to fail until one shows otherwise). The verdict moves to CONDITIONAL_MET only in the fold that queues a line whose
   capture lists no accounts or addresses (a static policy page such as the client bug bounty page or BMO's etiquette page,
   or a build artifact), with capture-check and the reader checking the first capture for names and addresses before it
   is kept. Today no line needs it: row 8's render half is held at github grade from mozilla/bedrock and mozilla-bteam/bmo
   (16(d) D3's pattern), and no mozilla.org render is queued before a qualifying finding." The gate's behaviour does not
   change: `CONDITIONAL_UNMET` is not active-eligible (`terms-verdicts.json:2`), no active mozilla.org line exists, and the
   paused AMO comments name `TERMS_BARRED`, which is unchanged.
4. Row 8's ₪0-test column replaces "render the bounty page and the Bugzilla account policy" with "the bounty page and BMO's
   etiquette and account rules are held at github grade (`security-bounties.json:11-12`); a rendered copy is not needed
   before a qualifying finding".
5. §9 tick-36 item 4 (`CHANNEL_LOOP.md:340`) is marked done by this ruling.

## 4. The repo-public decision changes no choice here and adds one fact

- If the automaton repository goes private: `github.com` becomes `CONDITIONAL_UNMET` (`terms-verdicts.json:118`;
  `RULING-2026-09-30-video.md:374-377`, repo), which closes the GitHub-hosted route this ruling leans on twice — every
  rendered source in section 1 is a docs.github.com capture, and the only reachable Mozilla source is the mirror on
  github.com (section 2) — and it puts the colony's own hourly workflows on metered minutes, on the personal account until
  step 7 and on the organisation after it (section 2). [inference] Under section 1 the colony may not spend
  metered-capable minutes on the personal account on an unread fence, so "private" is safely choosable only after step 7
  with the budget created and read. That is a fact for the owner's existing decision, in the form 16(d) used ("Not an ask;
  a fact for the existing decision", `RULING-2026-09-30-video.md:377`), stated once in §6's decision line.
- If it stays public: nothing here moves. The harness still needs a private repository (`BOARD-LOOP.md:138`), so the
  organisation, so step 7.
- Whether a separate private harness repository affects GitHub's open-access research condition is held in no file (Part C
  row 18 item 8). The harness would read mozilla-central from github.com for research whose outputs are security reports
  filed to Bugzilla and hidden until fixed. [inference] Whether such a report is a "publication" that must be open access
  under AUP §7 (`TERMS-AUDIT-2026-09-29.md:25`) is a reading nobody has made; it is a precondition of the harness reading
  from github.com at all.

**RULING (apply as written).**
1. The amendment stands under either outcome of the repo-visibility decision; no part of it is conditional on that
   decision.
2. §6's decision line (`CHANNEL_LOOP.md:236-238`) gains one sentence: "A private repository also meters the colony's own
   hourly workflows; under the 4.10 ruling no metered-capable minute runs on the personal account on an unread fence, so
   'private' is choosable only after step 7 with the organisation's $0 Actions budget created and read."
3. Before the harness reads mozilla-central from github.com, a runner reads GitHub's AUP §7 at github grade (github/docs
   `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`, the audit's source,
   `TERMS-AUDIT-2026-09-29.md:25`) and Mozilla's disclosure practice for bounty bugs (mozilla/bedrock, mozilla-bteam/bmo),
   and records whether a privately filed security report meets "publications ... open access". Until that is recorded,
   the harness does not read from github.com for this line.

## Amendment text for RULING-2026-09-29-loop.md (b)

> **Amended 4.10.2026 (`RULING-2026-10-04-mozilla-precondition.md`, FABLE_QUEUE row 18).** The "Tick 18+" item's
> precondition, "only after a runner has read the account's Actions spending limit as $0", cannot be met by a runner on a
> personal account: no REST endpoint reads a personal account's budget or payment method
> (`gh-docs-rest-billing-budgets-2026-09-29.txt:152-160`, rendered); the user usage endpoints read usage, with a Plan: read token of
> the account's own owner (`gh-docs-rest-billing-usage-2026-09-29.txt:1158-1168`, rendered; PAT:173, github); `GITHUB_TOKEN` is an
> installation token with no plan permission (GT:17, github). It now reads: *Mozilla's dry-run harness runs only in a
> private repository owned by the organisation `mehudak` (after step 7); only after a runner has read the organisation's
> budgets through `GET /organizations/mehudak/settings/billing/budgets?scope=organization&per_page=100` and found one
> `ProductPricing` budget on product `actions`, scope `organization`, amount 0, `prevent_further_usage` true (a 403, a 404,
> an empty list, SKU-only or other-product budgets fail; the read is repeated at the start of every tick that runs a job);
> only after the host serving Mozilla's builds has a verdict that admits the fetch (`CHANNEL_LOOP.md:78` covers a harness
> download); and only inside the free allowance under the note's fence (`actions-spending-limit.md:211-219`). Nothing is
> filed.* The owner creates that budget in the step-7 sitting (five by-sight items, ruling 4.10 §2) as the organisation's
> ₪0 fence for the open repo-visibility decision, and grants a read-only token (the machine account as billing manager,
> else the owner's own; Administration: read only, never write); Mozilla asks for nothing before a qualifying finding
> (`BOARD.md:185`). No private repository is created and no runner minute is spent for row 8 on the personal account. A
> session-only source review is not "a meaningful run" (`:119`) and is not built. Pre-registered kill: 90 days after step 7
> is done without a completed 30-day dry run, row 8 is killed as "no ₪0 route". The summary row's "instruments and Mozilla
> harness meanwhile" (`:479`) reads "instruments meanwhile; the Mozilla harness waits on step 7".

## Fold actions for Opus

Each item: file — change — grade of what it rests on. Mechanical. Before "done": `scripts/verify.sh`,
`npx vitest run src/__tests__/revenue/render-watch-terms-barred.test.ts` and the owner-steps tests pass; `parseUrlList` on
the real `urls.txt`; a grep of every edited owner-facing file for the owner's identifiers returns 0.

1. `research/channel-loop/RULING-2026-09-29-loop.md` — append the amendment note above under (b), after `:119`, and a
   one-line pointer at the summary row `:479` — rendered, github and repo as cited in the note.
2. `logs/CHANNEL_LOOP.md` §4 row 8 (`:150`) — status: "PARKED on step 7 + the budgets read (ruling 4.10,
   `RULING-2026-10-04-mozilla-precondition.md` §2): no personal-account repo or minute, ever; the organisation's $0 Actions
   budget and a read-only token join step 7's sitting; (i) rejected, (iii) rejected; render half held at github grade
   (`security-bounties.json:11-12`); pre-registered kill at step 7 + 90 days"; the ₪0-test column per §3 rule 4 — repo.
3. `logs/CHANNEL_LOOP.md` §6 item 4 (`:216-218`) — add inside step 7: "in the same sitting, on the organisation's Budgets
   and alerts: a $0 Actions product-level budget, scope the whole organisation, 'Stop usage when budget limit is reached'
   ticked, created before any private repository exists in the organisation; opt in to the included-usage alerts; and a
   read-only token: make `mehudak-ci` a billing manager and create its fine-grained PAT with the organisation as resource
   owner and Administration: read only — if GitHub refuses, a PAT of the owner's own account with that one permission.
   Never Administration: write." — rendered (`gh-docs-set-up-budgets-2026-09-29.txt:259-267`, `:335`, `:361`;
   `gh-docs-budgets-and-alerts-2026-09-29.txt:277`; `gh-docs-rest-billing-budgets-2026-09-29.txt:504-514`), github (BM:31, BR:19, PAT:118, :139).
4. `logs/CHANNEL_LOOP.md` §6 decision line (`:236-238`) — the one sentence of §4 rule 2 — repo, inference marked.
5. `logs/CHANNEL_LOOP.md` §9 — tick-36 item 4 (`:340`) marked done by this ruling; §5 (`:185`) gains "row 8 kill check:
   step 7 + 90 days (date set when step 7 is done)" — repo.
6. `logs/CHANNEL_LOOP.md:381` and `:420` (historic plans) — leave as history with "(superseded 4.10)" after the phrase — repo.
7. `src/revenue/owner-steps.ts` step 7 (`:331-337`, `:381`) and `docs/OWNER_STEPS.he.md` step 7 (`:398`; the token
   paragraph `:283-290`) — the items of action 3 in the owner's language, framed as the organisation's ₪0 fence for the
   repo-visibility decision, Mozilla named as one user of it; one line on what a billing manager is able to do, read first
   at github grade from github/docs (BM); regenerate the PDF — rendered, github, repo.
8. `research/rendered/urls.txt:331` — retire in the form of §3 rule 1; `research/channel-loop/ZERO-TESTS.md:43` row 34 —
   status retired — repo.
9. `research/channel-loop/terms-verdicts.json:245-249` — `mozilla.org` → `CONDITIONAL_UNMET` with the source and note of §3
   rule 3 — github via the audit (`TERMS-AUDIT-2026-09-29.md:27`, `:138`, `:197`).
10. Tick 38's freeze list — add `amo-add-on-policies` — repo (`RULING-2026-09-29-loop.md:46-47`; `TERMS-AUDIT:43`).
11. `research/measurements/actions-spending-limit.md` — append a dated "4.10 (ruling)" section: the reconciled five-item
    list replaces both earlier lists (`:579-582`, `:621-625`) and the verifier line `:627` is marked overtaken; pointer
    corrections `CHANNEL_LOOP.md:147`/`:149` → `:150`, `:210-212` → `:216-218`, `portfolio.ts:289` → `:324`,
    `owner-steps.ts:312` → `:381`, `terms-verdicts.json:113-114` → `:114-118` — repo.
12. `logs/FABLE_QUEUE.md:42` — row 18 → DONE 4.10, pointing here, with the fold commit; the question column's "a
    fine-grained Plan: read token" → the status column's wording — repo.
13. `research/breadth/scouts/security-bounties.json:11` cites `docs/REJECTED.md:1169`; the Google OSS VRP row is at `:1413`
    — repo (drift only; fix when the file is next touched).
14. `logs/2026-10-04-fable-sitting-row-18-applied.md` in Hebrew, the eight `CLAUDE.md` sections, by the agent that applies
    this. `logs/CHECKPOINT.md` is the main thread's.

## Not ruled here

1. Whether the owner's GitHub account has a payment method on file, which plan it is on, whether any budget exists, and
   whether Copilot code review is on anywhere (none). Not needed under this ruling: no personal-account minute runs.
2. Whether a billing manager can hold an organisation-targeted fine-grained PAT, and whether one account can be both
   member and billing manager (github, open: PAT:139; BM:31, :33). Check: the step-7 sitting does it; shape B is the
   fallback.
3. What a billing manager is able to do; the repo holds only the "not able to" list (BM:28-33, github). Check: a runner
   reads BM's "able to" list at github grade before the owner page names the role.
4. Whether the organisation's "Budgets and alerts" offers an Actions product-level budget, accepts $0 and shows the
   checkbox on GitHub Free (EBP:1 names Enterprise and Team only, github; "$0" is unrendered). Check: the five by-sight
   items in the step-7 sitting; a fail is recorded, never worked around.
5. Whether a $0 budget leaves the free minutes usable (inference from `gh-docs-budgets-and-alerts-2026-09-29.txt:219` and
   `gh-docs-set-up-budgets-2026-09-29.txt:209`, rendered basis). Check: the first dry-run job; it fails closed.
6. How fast a block takes effect ("delay", "real time", "immediately": 0 matches, note `:567`; none). Check: none
   available; the ceiling keeps usage under the quota, so the question stays moot.
7. Which host serves mozilla-central's builds and what its terms say (none; `*.mozilla.com` has no verdict). Check: when
   the harness is designed after step 7, read that host's terms and add its verdict; a `*.mozilla.org` host falls under
   §3's condition.
8. Whether a privately filed Bugzilla security report is a "publication" that must be open access under GitHub's AUP §7
   (none). Check: §4 rule 3.
9. Whether a separate private research repository affects github.com's `CONDITIONAL_MET` (none). Check: the same AUP §7
   read.
10. Mozilla's payout method and whether paperwork repeats per award (UNKNOWN, `security-bounties.json:19-20`; KILL-4 if per
    award, `BOARD-LOOP.md:140`). Check: a GitHub-hosted statement when the session's scope allows a code search (§9
    tick-36 item 6 names that limit); otherwise known only at a first award.
11. How many minutes a meaningful run needs (none; "5-10 agent-days" is build effort, `scouts.json:246`). Check: the
    harness's own job counts in its first week, under the ceiling.
12. Whether a fine-grained PAT expires, which would make the read a recurring owner action (none in any file read). Check:
    the PAT page (R6 row 3, note `:461`) in the step-7 sitting; if expiry is unavoidable, the read token shares
    `BRAND_GITHUB_TOKEN`'s renewal moment so no new owner cadence is created.
13. Row 23 and the sitting's other rows: not read.

## Pointers moved (beyond Part C's housekeeping)

- `terms-verdicts.json`: `mozilla.org` is at `:245-249`, not `:238-241` (the brief's header and B(f)); `extensionworkshop.com`
  at `:84-88`; `github.com` still at `:114-118`.
- `logs/CHANNEL_LOOP.md`: step 7 is at `:216-218`, not `:214-216`; the repo-visibility decision at `:236-238`, not
  `:234-236`; the tick-36 "retired 20 lines" paragraph at `:334`; the Never list (`:76-79`), row 8 (`:150`), §9 item 4
  (`:340`), `:381` and `:420` hold.
- `src/revenue/owner-steps.ts`: step 7 is at `:331-337` (`number: 7` at `:331`, `lines` at `:337`) and `BRAND_GITHUB_TOKEN`
  at `:381` (comment `:72`), not `:312-313`.
- `src/revenue/portfolio.ts`: "add it to the organisation (owner step 7)" is at `:324`, not `:288`.
- `logs/CHECKPOINT.md`: the row-8 lines are at `:267` and `:307`, not `:119` and `:159`.
- `research/breadth/scouts/security-bounties.json:11` → `docs/REJECTED.md:1169` is stale; the Google OSS VRP row is at `:1413`.
- `docs/OWNER_STEPS.he.md`: step 7's heading is at `:398`; the `BRAND_GITHUB_TOKEN` paragraph the brief cites as `:287` runs
  `:283-290`.
- §9 tick-36 item 4's premise, "paused": `urls.txt:331` is active and passes the gate (§3).
- Unchanged and verified: the note's lines; the five `gh-docs-*` captures at every line cited; `urls.txt:331`;
  `BOARD.md:183-185`; `BOARD-LOOP.md:17`, `:67-68`, `:138-141`; `CLAUDE.md:86`; `TERMS-AUDIT:25-27`, `:43`;
  `RULING-2026-09-30-video.md:82`, `:136-137`, `:374-377`; `RULING-2026-09-29-loop.md:116-119`, `:479`;
  `.github/workflows/colony.yml:23`.
