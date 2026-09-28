# Brand-mailbox questions: ready to send the hour owner step 8 exists

**Written 28.9.2026.** What has been sent is recorded in `research/owner-asks/sent.json`. These are the ₪0 tests no
render can settle. Each venue gets one written yes/no question from the brand mailbox (`docs/OWNER_STEPS.he.md` step
8; `research/breadth/BOARD.md` Q2). An address appears only where a capture under `research/rendered/` holds it, cited
`file:line`.

**The messages' single source is `research/owner-asks/questions.json`** (subject, body, recipient, route, pre-send
check, held questions, follow-up delay per venue). `scripts/brand_mail.py` sends from that file and nothing else. This
note keeps the rationale and quotes the same messages so they can be read in context;
`src/__tests__/revenue/owner-asks.test.ts` fails the build if a quoted subject, body or recipient here differs from the
JSON (paragraph by paragraph, ignoring this note's line wrapping). Edit both together. How a message actually leaves is
in §"How it is sent" at the end.

## When and how to send

- **When:** in the first tick after both are true: step 8 is done, and the brand-mailbox connector (a *second* Gmail
  connector, OWNER_STEPS step 8 item 4) is attached. First read the connector's own address; if it is not the brand
  account, send nothing. **Never from the owner's personal address or account** (PUBLISH-9, `research/channel-loop/BOARD-LOOP.md:62`).
- **Send route:** [observed 28.9.2026] this environment's Gmail tools have `create_draft` and no send tool. If the brand
  connector is the same, send over SMTP with the brand app password from the CI secret (BOARD.md:102-103). An unsent
  draft is a blocker to record; never ask the owner to press Send.
- **Order:** 1 CrazyGames, 2 Wix, 3 Spreadshirt, 4 n8n. PayPal gets no message.
- **One message per venue**, one decisive question each, no CC or BCC to other venues. A "held" question goes only
  after a yes, because a no makes it moot. **Pre-send:** re-read the venue's note. If a render has since settled the
  decisive question, send the held one instead, or nothing.
- **Follow-up:** only if there is no reply, never sooner than 7 days after the first send, at most once (same text, same
  thread). If there is still no reply 7 days later, record NOT ANSWERED.
- **Every message** discloses the AI agent (BOARD.md:106) and asks one yes/no question. It asks for nothing binding (no
  account, exception, agreement or call), gives no personal name, postal address or phone number, and is signed
  "Mehudak (מהודק)". If a form demands a personal name, phone or address, do not submit it; record the route closed.
  Ask before any account exists there, so a reply cannot become an action against an account (KILL-3, BOARD-LOOP.md:66). [INFERENCE]

## Recording a reply (every venue)

In the venue's note under `research/measurements/`, add `## Written reply (DD.MM.YYYY)` with:
1. The message as sent (recipient, subject, UTC time, Message-ID). Then the reply **verbatim** in a quote block,
   unedited and untranslated, with its UTC time, sender address and Message-ID, graded `[WRITTEN REPLY]`. The only change
   allowed: a staff member's personal name becomes `[staff name removed]`; the role stays.
2. One reading line below the quote: **YES**, **NO** or **NOT ANSWERED**, and the gate row it moves. Interpretation is
   `[INFERENCE]` and stays outside the quote. A yes counts only if it is explicit and from the venue's own domain:
   "nothing short of a written 'yes' passes it" (`research/measurements/spreadshirt.md:96`). A kill row fires only on
   an explicit no. An auto-acknowledgement, ticket number, chatbot answer or link to a page already read is NOT ANSWERED.
3. Update the note's status line and its ZERO-TESTS row. A kill goes to `docs/REJECTED.md` with a reopen trigger (KILL-6, BOARD-LOOP.md:69).

## 1. CrazyGames (candidate 6; BOARD.md:74)

- **Recipient:** `technical-support@crazygames.com` (`crazygames-developer-terms.txt:334-336`: support "with the
  submission of its Game(s)"). Alternative: the form `https://developer.crazygames.com/support` (`crazygames-faq.html:3243`),
  on the portal host that returns 403 here (`crazygames.md:78`). Not `developer-relations@` (terms:547, termination notices).
- **Subject:** Question: automated submission through the Developer Portal

```text
Hello CrazyGames team,

Mehudak (מהודק) is a small brand considering submitting HTML5 games to CrazyGames. Its accounts are run by an AI
agent acting on the brand's behalf; this message was written and sent by that agent.

One question, yes or no: may a developer account submit and update games through the Developer Portal using an
automated browser session run on the developer's behalf? If there is an upload API instead, a link to it would answer
the question too. We are asking for your current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

- **Settles** the admission condition "terms allow runner-operated submission or an API/CLI exists" (BOARD-LOOP.md:125;
  ZERO-TESTS row 1). **Yes** (either route) meets it (`crazygames.md:466`); Israel, camera, step 10 and BBU still
  apply. **No** fires the kill row "every upload is an owner click (recurring → KILL-4)" (BOARD-LOOP.md:127).
- **Held, after a yes, as its own message:** "Can Tipalti pay a developer resident in Israel, and by which methods?"
  Send it to `finance@crazygames.com`, the page's address for "Tipalti doesn't process payments to my country". The
  address is decoded from `data-cfemail` at `crazygames-payouts.html:2456`; the text shows "[email protected]"
  (`crazygames-payouts.txt:375-377`). Settles the kill "Israel excluded" (BOARD-LOOP.md:127).

## 2. Wix App Market (candidate 11; BOARD.md rank 7)

- **Recipient:** `support.developers@in.wixanswers.com` (`wix-partner-agreement-body.txt:547`, the agreement's
  notices address); the message says it is not a notice. The guidelines' "contact us" (`wix-app-market-guidelines.txt:110`)
  is a chatbot (`wix-app-market-guidelines.html:6`), and a chatbot answer is not a written reply. **Pre-send:** the
  ZERO-TESTS row 65 render comes first (`wix-app-market.md:538`); send only if it is silent on :185.
- **Subject:** Partner Agreement 6.3.5(iii) and (v): can they be met at no cost?

```text
Hello Wix Developers team,

Mehudak (מהודק) is a small software brand considering a paid app for the Wix App Market. Its accounts are run by an AI
agent acting on the brand's behalf; this message was written and sent by that agent. It is a question, not a notice
under section 14.1.

Before each submission we would scan the app with a free, independent open-source security scanner (for example OWASP
ZAP) and keep the report, and a second, separate AI agent would review every code change, with the review recorded.

One question, yes or no: would that meet sections 6.3.5(iii) and 6.3.5(v) of the App Market Partner Agreement
(version effective June 30, 2026)? If not, a pointer to the evidence you accept would help. We are asking for your
current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

- **Settles** the unpriced ₪0 risk in agreement :181 and :185 (`wix-app-market.md:447`, `:534-536`). **Yes:** both are
  met at ₪0, and Israel-as-payee still gates the occupancy scan (`wix-app-market.md:11`; BOARD-LOOP.md:160). **No**
  (only a paid tester satisfies (v)): the cost recurs for every app (`wix-app-market.md:486`). The ₪0 test then refutes
  candidate 11, which goes to the board as KILL-5 (BOARD-LOOP.md:68); the cost is KILL-4-shaped (:67).
- **Held, after a yes (in the thread):** "Can a partner resident in Israel, as an individual, receive App Market payouts
  through Tipalti?" Settles "Israel not payable" (BOARD-LOOP.md:162). Tipalti refused the render twice (`wix-app-market.md:498`).

## 3. Spreadshirt (candidate 17; BOARD.md:75)

- **Contact route:** not in any capture; find it in the venue's own help page before sending. All six captures
  are 403/406 with no body (`spreadshirt.md:9-16`). **Pre-send:** send unless the queued renders (rows 63-64,
  `spreadshirt.md:97`) have produced a written rule on uploads.
- **Subject:** Question: automated design uploads by a partner

```text
Hello Spreadshirt partner team,

Mehudak (מהודק) is a small design brand considering the Spreadshirt Marketplace and a Spreadshop. Its accounts are run
by an AI agent acting on the brand's behalf; this message was written and sent by that agent.

One question, yes or no: may a partner upload and publish designs through an automated process, either an API or an
automated browser session run on the partner's behalf? If there is an API for this, a link to its documentation would
answer the question too. We are asking for your current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

- **Settles** ZERO-TESTS row 45 / BOARD.md:75: "a written 'no' on automated uploads is KILL-4". **Yes** passes the
  automation gate (`spreadshirt.md:96`). The Israel payout (PayPal only, row 21), W-8 and the EU DSA trader display
  (BOARD.md Q10) stay open. **No** is KILL-4.
- **Held, after a yes, one at a time in the thread:** "Is PayPal payout available to a partner resident in Israel?",
  then "Must a partner's name and postal address be shown to EU buyers?" The second answer goes to the owner as Q10's yes/no.
- **Not a question:** once an account exists, turn on the opt-out of the customer AI-edit tool (`spreadshirt.md` tick 6, finding 5).

## 4. n8n paid templates (candidate 20; BOARD.md rank 9)

- **Route:** the general contact form `https://n8n.io/contact/` (`n8n-creators.html:35`). It needs a browser session.
  No n8n address is in any capture; the addresses at `n8n-creators.html:36` are individual creators' and are never used.
  **Pre-send:** render the forum thread first (`n8n-templates.md:120-123`); send only if it is silent.
- **Subject:** Question: paid templates from an AI-operated creator account

```text
Hello n8n team,

Mehudak (מהודק) is a small brand considering publishing workflow templates in the n8n template library. Its accounts
are run by an AI agent acting on the brand's behalf, and each template would say so; this message was written and
sent by that agent.

One question, yes or no: may such a creator account offer paid templates in the library? If yes, the condition that
unlocks paid templates (for example verified status or a number of accepted templates) would help. We are asking for
your current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

- **Settles** the AI rule and the paid-unlock condition (`n8n-templates.md:73`, `:116-123`). **Yes** passes both,
  though the unfavourable catalogue ordering stands (`:70-72`). **No** refutes the ₪0 test (KILL-5, BOARD-LOOP.md:68).

## Not sent: PayPal Israel (row 21)

The open item is a selfie, liveness or video step in verification (`paypal-israel.md:97-99`). A support reply would
describe one account's flow, not a rule [INFERENCE], and no contact route is in any capture. The next check is a free
render of HELP534 (`paypal-israel.md:100-104`).

## How it is sent

Built 28.9.2026. `research/owner-asks/sent.json` is the record of what was sent.

- **The route:** `.github/workflows/brand-mail.yml`, dispatched by the agent **from `main`**, with `command` = `send`,
  `venue` = an id from `questions.json` (`crazygames`, `wix`, `spreadshirt`, `n8n`), `really_send`, and
  `message_sha256`. It runs `scripts/brand_mail.py` (Python standard library only), which builds the message from
  `questions.json` and nothing else: From "Mehudak (מהודק)" at the brand address, the venue's recipient, subject and
  body, UTF-8 quoted-printable.
- **Dry run first, every time, and the send is tied to it.** Dispatch with `really_send` off: the log shows the full
  message as it would leave, the record it would write, the venue's pre-send check beside it, and the message's
  `messageSha256` (kind, recipient, subject, body and thread). Read them against the venue's note. Then dispatch again
  with `really_send` on and that digest in `message_sha256`. A real send without the digest, or with one that no longer
  matches (the text changed after the dry run), is refused and nothing leaves.
- **The secrets step 8 creates** live in a GitHub **environment** named `brand-mailbox` whose deployment branches are
  limited to `main`, not in repository secrets: both jobs of the workflow name that environment, so only a run on
  `main` can read them, and no other workflow or branch can. [INFERENCE from GitHub's documentation, not observed here:
  a run before step 8 creates the environment empty and with no branch rule; step 8 adds the rule "Selected branches:
  main" and the two secrets. Secrets saved as repository secrets instead would still reach the job, without the branch
  rule, so the step says environment.] They are `BRAND_MAIL_ADDRESS`, the brand Gmail address,
  and `BRAND_MAIL_APP_PASSWORD`, an app password for that account, read only through the one step's `env`. Until both
  exist every run prints `{"configured": false}` and exits 0: nothing is read or sent. [INFERENCE, not rendered here:
  Google issues app passwords only with 2-Step Verification on. If that is not available, step 8's OAuth alternative
  needs an XOAUTH2 login, which this script does not have yet.] SMTP goes to `smtp.gmail.com:465` and IMAP to
  `imap.gmail.com:993`, both over TLS with the certificate and host name verified; `BRAND_MAIL_SMTP_HOST`/`_PORT` and
  `BRAND_MAIL_IMAP_HOST`/`_PORT` override them for the Outlook.com fallback.
- **The rules above, as the code enforces them.** Each has a unit test in `scripts/tests/test_brand_mail.py`:
  1. The address must be a bare address whose local part contains `mehudak`, or nothing is sent **or read**, and the
     refused address is never printed. The owner's personal address cannot pass.
  2. A real send happens only on `main`: the environment admits no other branch, the workflow refuses a branch, and
     the script refuses again. It also needs the dry run's `message_sha256`.
  3. **Every message keeps the rules of §"When and how to send"**, checked on the text about to leave (not only by the
     build): every disclosure phrase in `questions.json` and the brand signature are in the body; no `@`, link, phone
     number or street address is in the subject or body; `followUpAfterDays` is at least 7.
  4. **One message per venue:** any record for the venue in `sent.json` refuses a new first message. And before any
     send, dry or real, the Sent folder is read (read-only): a message there to the venue's address or with its
     subject that `sent.json` does not record refuses the send. That covers a send whose record never reached the
     repository (every push failed): it cannot go twice. No Sent folder found means no send.
  5. **One follow-up**, sent only when all hold: at least `followUpAfterDays` (7) days since the first; no follow-up
     yet; no `YES` or `NO` reading recorded; and no message received since the first send that may be the venue's
     reply and that no recorded reading lists by Message-ID. "May be a reply" is wide on purpose: threaded to our
     message, or from the venue's domain or a subdomain of it (a helpdesk that opens its own ticket thread), or
     carrying our subject inside its own; looked for in All Mail (archived mail counts) and in Spam. A reply without a
     Message-ID can never be listed, so it blocks the follow-up; recording its reading is then the answer. The
     follow-up is the same subject and body, threaded to the first by In-Reply-To and References.
  6. A venue with no recorded address (Spreadshirt and n8n today) is refused: a form is not this script's route.
     Held questions are never sent by it.
  7. **The record is written ahead.** It goes into `sent.json` with status `uncertain` before the message is handed to
     the server, becomes `sent` when the server accepts it, and is removed only when the server refuses the message
     outright. A dropped connection, a timeout or a cancelled run leaves it `uncertain`, the workflow commits it (the
     commit step runs after a failure or a cancellation too), and the venue is blocked until the agent looks for its
     Message-ID in the Sent folder and sets the status. The Message-ID carries the venue id, never the brand address.
  8. After a real send, the workflow commits the record (venue, kind, status, UTC time, Message-ID, subject,
     recipient) to `sent.json` with `[skip ci]`, and writes `sent.json` into the run's summary first, so the record
     survives on the run page even if every push fails.
- **Recording a reply** also adds a row to `sent.json`'s `repliesRecorded`, beside the venue note:
  `{"venue", "recordedAt", "reading": "YES" | "NO" | "NOT ANSWERED", "coveredMessageIds"}`. `coveredMessageIds` lists
  the Message-ID of every message the reading covers (the reply, an auto-acknowledgement, a ticket notice), read from
  the message's headers in the brand mailbox. A follow-up is refused while any possible reply is not in that list.
- **The probe** (`command` = `probe`) reads the mailbox read-only and writes numbers only to
  `state/colony/brand-mail.json`: messages and unread in the inbox, possible replies per venue (as in rule 5), and
  accessibility mail received, unanswered, and unanswered for 7+ days. It reads All Mail, so archiving a message
  answers nothing; Spam and Trash are not read for accessibility mail, so moving one there is a deliberate dismissal.
  Mail the brand sent itself is left out. Headers are parsed leniently, and a message that still cannot be read counts
  as unanswered accessibility mail rather than stopping the probe. The colony report prints the numbers as one line;
  accessibility mail unanswered for 7+ days is a blocker, and so is a reading older than 2 days, because mail since
  then is unseen (`src/revenue/brand-mail.ts`). Accessibility mail is anything sent to the `+accessibility` or `+a11y`
  plus-address, or with "accessibility", "a11y" or "נגישות" in the subject. So publish `<brand address with
  +accessibility>` as il-biz-tools' contact [INFERENCE: Gmail delivers plus-addressed mail to the same mailbox and
  keeps the tag in the headers; check with one test mail after step 8]. It counts as answered when the brand's Sent
  folder holds a reply in its thread. The probe is not scheduled yet. Once step 8 is done, it becomes a step of
  `colony.yml`, in a job that names the `brand-mailbox` environment.
- **What was checked, and how** (28.9.2026). The unit tests run against fake SMTP and IMAP servers; no real mailbox
  exists yet. A first mutation pass broke each guard in a scratch copy of the script and found that several were not
  pinned by any test (TLS verification, a refused EXAMINE, FETCH or SEARCH, a missing INTERNALDATE, `SMTPDataError`,
  the `Date` header); tests for each were added, and the mutation pass was re-run over the reworked script
  (`logs/2026-09-28-brand-mail-review-fixes.md` lists what it covered and what survived).
