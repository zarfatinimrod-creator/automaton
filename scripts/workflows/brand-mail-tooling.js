export const meta = {
  name: 'brand-mail-tooling',
  description: 'Launch prep for owner step 8: stdlib-only sender for the four drafted venue questions and an unread/accessibility probe for the colony report, gated on the brand mailbox existing (Opus, worktree), adversarial review, one fix pass.',
  phases: [
    { title: 'Build', detail: 'one Opus builder in an isolated worktree', model: 'opus' },
    { title: 'Review', detail: 'two adversarial Opus reviewers: honesty/exposure and code/tests', model: 'opus' },
    { title: 'Fix', detail: 'one fix pass', model: 'opus' },
  ],
}

const BASE = (typeof args !== 'undefined' && args && args.base) ? args.base : 'HEAD'

const TRAILER = `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VRCJXMqMdAnbYz2TwWreJn`

const BUILD = `You are an Opus builder in an ISOLATED git worktree of /home/user/automaton (base branch claude/new-session-j071dx).
FIRST, before touching any file: run \`git log --oneline -1\` and \`ls research/owner-asks src/revenue scripts\`. If \`git merge-base --is-ancestor ${BASE} HEAD\` fails, run \`git reset --hard claude/new-session-j071dx\` and check again (worktrees here have started on stale bases).
Rules: never run \`git stash\`; never push; commit only in your worktree branch; do NOT edit logs/CHECKPOINT.md, logs/CHANNEL_LOOP.md, logs/FABLE_QUEUE.md, MISSION.md, CLAUDE.md or docs/OWNER_STEPS.he.md. Test-first (invoke the test-driven-development skill). No personal names or personal email addresses anywhere; the only public face is the brand Mehudak / מהודק. Every commit ends with exactly:
${TRAILER}

CONTEXT (read first): research/breadth/BOARD.md Q2 (lines ~90-115: owner step 8, the brand mailbox; the agent reads it, the owner never answers anyone; the tick's probe gains an unread count and an accessibility-mail blocker after 7 days unanswered; every written question discloses the automated operator); research/owner-asks/brand-mailbox-questions.md (four drafted one-question emails to CrazyGames, Wix, Spreadshirt, n8n, with sending, follow-up and recording rules; Gmail tools in this environment can draft but not send, so sending is SMTP from CI with the brand app password); src/revenue/owner-steps.ts step 8 and src/revenue/runner.ts / report code (how blockers and probes reach the colony report); src/revenue/bounties/disclosure.ts (the disclosure wording standard); .github/workflows/colony.yml and render-watch.yml (workflow style).

TASK — make step 8 pay off the hour it exists, with nothing sent today:
1. A single machine-readable source for the four messages (e.g. research/owner-asks/questions.json: venue, to, subject, body, heldQuestion, followUpAfterDays), extracted from brand-mailbox-questions.md; the .md keeps the rationale and points to the JSON; a test proves the md's quoted messages and the JSON agree or the md no longer duplicates them. Each body must contain the operator disclosure and the brand signature, and no personal name, phone or postal address (test).
2. scripts/brand_mail.py, Python 3 standard library only (smtplib, imaplib, email) — no new dependency. Commands:
   - \`send --venue <id>\` (dry run by default; \`--really-send\` to send): builds the message from the JSON, refuses unless BRAND_MAIL_ADDRESS is set and its local part contains "mehudak" (never a personal address), refuses a venue already in research/owner-asks/sent.json (one message per venue) except a single follow-up after followUpAfterDays with no reply recorded, sends over SMTP SSL (smtp.gmail.com:465 by default, overridable) with BRAND_MAIL_APP_PASSWORD, and prints a JSON record (venue, UTC time, Message-ID, subject, to) for the workflow to append to sent.json. Dry run prints the full message and the record it would write.
   - \`probe\`: IMAP SSL, read-only (EXAMINE, never STORE/flags), returns JSON counts only — unread total, replies to Message-IDs in sent.json (count per venue, no bodies), and accessibility-contact mails (define how they are recognised, e.g. sent to the +a11y/+accessibility plus-address or subject keywords; document the choice) older than 7 days with no reply from the brand address. No mail body, sender name or address is ever printed or written (test).
   - Both commands exit 0 with {"configured": false} when the secrets are absent, so CI stays green before step 8.
3. .github/workflows/brand-mail.yml: workflow_dispatch only (inputs: command send|probe, venue, really_send default false); secrets BRAND_MAIL_ADDRESS and BRAND_MAIL_APP_PASSWORD read only through env; a real send only from refs/heads/main; after a real send, commit the record to research/owner-asks/sent.json with the repo's commit style ([skip ci]). The probe's JSON is written to state/colony/brand-mail.json (numbers only) and committed; the colony report shows it as a line, and an accessibility mail unanswered for 7+ days becomes a blocker (wire this in src/revenue with a test, following how other probes/blockers are reported). No schedule yet (a comment says to add the probe to colony.yml once step 8 is done).
4. Tests: Python unittest (tests/ beside the script or products-style; make \`python3 -m unittest\` discoverable and add it to an existing CI job if one runs Python, else to products-ci.yml's pattern) using fake SMTP/IMAP classes — no network; root vitest for the report wiring and the JSON/md agreement. Mutation-check the guards in a scratch copy under /tmp.
5. Docs: a short section in research/owner-asks/brand-mailbox-questions.md: "How it is sent" (the workflow, dry run first, the secrets step 8 creates, the one-message and follow-up rules as enforced in code).
Run: \`python3 -m unittest\` for the script, \`pnpm typecheck\` and \`npx vitest run src/__tests__/revenue\` at the root. Write the Hebrew per-task log logs/2026-09-28-brand-mail-tooling.md (the 8 sections CLAUDE.md lists) and commit.
Final reply: worktree path, branch, \`git log --oneline ${BASE}..HEAD\`, test tails, and every requirement NOT met with the reason.`

const build = await agent(BUILD, { label: 'build:brand-mail', phase: 'Build', isolation: 'worktree', model: 'opus' })

const LENSES = [
  { key: 'exposure', text: 'HONESTY AND EXPOSURE lens: could anything send from, print or commit the owner\'s personal address, a staff member\'s name, a mail body or a sender address (logs, sent.json, state files, workflow output, test fixtures)? Is the operator disclosure in every message and truthful? Can a message go twice, go before step 8, or go from a non-main branch? Is the follow-up rule (once, after N days, no reply recorded) enforced exactly? Does the probe stay read-only on IMAP (EXAMINE, BODY.PEEK, no flag changes)? Would a CI run before step 8 stay green and silent? Any price, sales push, or claim the brand cannot back?' },
  { key: 'code', text: 'CODE AND TESTS lens: stdlib only (no pip install)? Do the tests pin each guard (mutate one in a scratch copy under /tmp: does a test fail)? Correct Message-ID, Date, MIME encoding for Hebrew or RTL text, SMTP SSL and IMAP SSL handling, timeouts, and error paths that never print secrets? Is the report wiring tested and does it follow the existing probe/blocker pattern? Do python unittest, root typecheck and root revenue tests pass when you re-run them? Protected files untouched, commit trailers exact.' },
]
const reviews = await parallel(LENSES.map(l => () => agent(`You are an adversarial Opus reviewer. Do not edit files; do not run state-changing git commands (no stash, commit, checkout, reset).
A builder added brand-mailbox tooling (a sender for four drafted venue questions and a read-only probe) in a git worktree. Its report:
${build}
Go to the builder's worktree and read \`git diff ${BASE}..HEAD\`. ${l.text}
Return a numbered list of concrete defects (file:line, what is wrong, the fix), most severe first, or "NO DEFECTS".`, { label: `review:${l.key}`, phase: 'Review', model: 'opus' })))

const fix = await agent(`You are an Opus fixer. Never git stash; never push; commit only in the builder's worktree branch; do not edit logs/CHECKPOINT.md, logs/CHANNEL_LOOP.md, logs/FABLE_QUEUE.md, MISSION.md, CLAUDE.md, docs/OWNER_STEPS.he.md. Commits end with:
${TRAILER}
Builder's report (cd to its worktree and work only there):
${build}
Reviews:
--- exposure ---
${reviews[0] || '(none)'}
--- code ---
${reviews[1] || '(none)'}
Fix every defect that holds up against the task and the code; for any you reject, say why in the per-task log. Re-run python unittest, root \`pnpm typecheck\` and \`npx vitest run src/__tests__/revenue\`; commit. Reply with worktree path, branch, new commits, test tails, defects rejected with reasons.`,
  { label: 'fix:brand-mail', phase: 'Fix', model: 'opus' })

return { build, reviews, fix }
