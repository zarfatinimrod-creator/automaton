# Brief for the Fable sitting of 7.10.2026 (~07:11 UTC): FABLE_QUEUE rows 24 and 25

**What this is.** Opus clerks gathered the evidence and point to it here: two facets for row 24 (T1's P1 and P2 through
the Data API, 16(d) and `stayedPublic()`; the kids sub-brand pick) and one for row 25 (the PostHog organisation step).
Opus checkers then re-opened every pointer with `sed -n` or `grep -n -F` against the tree at `19d203a` and corrected what
had moved or overreached. HEAD was the same at the start and the end of their reads, `git status --short` was empty both
times, and they wrote nothing. The only code a checker ran was a read-only import of `termsBarred()` from
`scripts/render-watch.mjs`. An Opus assembler wrote this file on `19d203a` [asm: in a worktree on `build/tick57-brief`,
cut from `origin/claude/new-session-j071dx` at that commit]. It re-opened every header pointer and a sample of more than
twenty others, and marks what it added or corrected **[asm]**. Nobody here rules or recommends. No web fetch was made for
this brief, no connector was called and nothing was created anywhere; the assembler's own code runs were the same
`termsBarred()` import and `activeSlugs()` from `scripts/freeze-capture.mjs`, both read-only [asm].

**Grades.** `rendered`: a render-watch capture that a session read. `github`: code or docs read on GitHub at a pinned
commit; where a note quotes GitHub, the note is the pointer ("github, via note"). `rendered via note`: a note quoting a
capture; the note's line is the pointer and the capture was not re-opened unless said. `snippet`: a search-engine
snippet. `repo`: our own code or notes. `inference`: reasoning, not a text, always marked. `none`: no source. [asm] There
is no live grade: a note's own line that records a read of the PostHog account through the connector is graded `repo`,
and the note calls that read "live account state, not a text" (`research/measurements/posthog-free-tier.md:199`).

**Provenance marks.**
- `[against-bar]` (D1(1), `research/channel-loop/RULING-2026-09-30-video.md:27-31`) marks a capture fetched from a site
  whose terms, read afterwards, bar automated access: in the ruling's words every tiktok.com and gumroad.com capture, "and
  by the same rule the youtube.com, support.google.com and wix.com pages fetched before their bars" (`:27-28`). It is
  readable and citable at rendered grade for "(i) a question about our own compliance" and "(ii) a decision not to do
  something", and not "an input to a product, a listing, content, a ranking or a line's growth" (`:29-31`). The
  developers.google.com captures this brief describes (the YouTube Data API pages and the Developer Policies) fall under
  google.com's bar through `termsBarred()` (run here: `developers.google.com` → `google.com`), but D1 names only
  support.google.com, so their mark is inference (`research/channel-loop/SITTING-2026-10-01-BRIEF.md:23-25`). [asm] The
  6.10 robots ruling reads D1's "may not be quoted in anything public" as "the product, listing and content surfaces, not
  the research record's cited lines, which are quotations with the source named"
  (`research/channel-loop/RULING-2026-10-06-robots-and-terms.md:360-362`).
- `[D1(1)(ii)]` marks the YouTube column of `research/measurements/t1-subbrand-check.md`, a 30.9 run made after the bar.
  That column "stays on disk under D1(1)(ii), as the record of the breach and the reason not to re-probe" (`:10-11`).
- **Live captures only.** [asm] `research/rendered/FROZEN.sha256` (244 lines) has no YouTube, Google-developer or PostHog
  entry; its only "google" lines are the three files of a 22.9 sweep copy of Google's VRP FAQ (`:183-185`). Every capture in
  this brief is therefore live: it is described in words, with `grep -c -F` counts, and never cited by line. None is
  trimmed: youtube.com, google.com, blog.youtube and upload-post.com carry `"copying": "unread"` in
  `research/channel-loop/terms-verdicts.json`, and no meta named here has a `trimmed` block. The six developers.google.com
  captures described in substance carry fetchedAt 28.9 23:21:48Z (`yk2-dev-made-for-kids-status`) and 29.9 11:26:43Z to
  11:27:02Z (`youtube-api-quota-cost`, `youtube-api-compliance-audits`, `youtube-api-videos-insert`,
  `youtube-api-revision-history`, `youtube-developer-policies`); the four `yt-analytics-*` captures, counted for one link
  only, carry 27.9 09:47:31Z to 09:47:35Z. All are before the 29.9 14:01:49Z bar. None of these slugs has an active
  `urls.txt` line.
- **PostHog sources.** 23 of the 26 files the PostHog note read are kept byte for byte in
  `research/measurements/posthog-free-tier-sources/` (with `SOURCES.json`), so their lines are `github`; PC's three `src/`
  files carry "Please do not duplicate, copy, or use our website" (PC `LICENSE:5-6`) and are quoted, not copied, so lines
  quoting them are "github, via note" (`posthog-free-tier.md:63-69`). The terms are excerpted as exact original line ranges with their
  sha256 in `research/channel-loop/terms/posthog-terms-2026-10-04.md` (github). No file under `research/rendered/` names
  PostHog, and `FROZEN.sha256` has no PostHog entry.
- **Where the bars are.** youtube.com, blog.youtube and google.com sit at `scripts/render-watch.mjs:536-538`, all three
  first added in `52dafb4` (29.9 14:01:49Z; `git log -S`). `termsBarred()` is `:578-584` (doc line `:578`): a host is
  barred when it equals a listed domain or ends in "." plus it. Run here [asm: the checker's run, widened]: `null` for
  `www.googleapis.com`, `youtubeanalytics.googleapis.com`, `oauth2.googleapis.com`, `posthog.com`, `eu.posthog.com`,
  `us.posthog.com`, `rdap.verisign.com`, `api.github.com` and `il-biz-tools.netlify.app`; `google.com` for
  `developers.google.com` and `accounts.google.com`; `youtube.com` for `www.youtube.com`. The list's comment: "A host on
  this list gets no request of any kind — not its pages, and not its robots.txt either" (`:518-519`) [asm: a checker gave
  `:517-518`; `:517` is a bare comment line].

**Short names.** `KIDS-RULING` is `research/channel-loop/RULING-2026-10-04-kids-youtube.md`; `VIDEO-RULING` is
`research/channel-loop/RULING-2026-09-30-video.md`; `DOCS-RULING` is `research/channel-loop/RULING-2026-09-30-documents.md`
(the row's "ruling (c)"); `LINES-RULING` is `research/channel-loop/RULING-2026-09-29-lines.md`; `ROBOTS-RULING` is
`research/channel-loop/RULING-2026-10-06-robots-and-terms.md`; `CLOCK-RULING` is
`research/channel-loop/RULING-2026-10-06-domain-clock.md`. `T1-PROTOCOL` is `research/faceless-youtube/T1-PROTOCOL.md`;
`KIDS-LINE` is `research/youtube-kids/KIDS-LINE.md`; `ASSESSMENT` is `research/youtube-kids/ASSESSMENT.md`; `TERMS-AUDIT`
is `research/channel-loop/TERMS-AUDIT-2026-09-29.md`; `discovery.md`, `upload-automation.md` and `policy.md` are under
`research/faceless-youtube/scouts/`. "The read-back" is `src/revenue/youtube-madeforkids.ts` and "the read-back script"
`scripts/youtube-madeforkids-readback.ts`; `experiments.ts`, `publisher-guard.ts`, `owner-steps.ts`,
`page-views-reader.ts` and `page-views.ts` are under `src/revenue/`, and their tests under `src/__tests__/revenue/`. "The
PostHog note" is `research/measurements/posthog-free-tier.md`; `PC` and `PH` are its pins, `PostHog/posthog.com` at
`4c27ff7` and `PostHog/posthog` at `526d64d` (`posthog-free-tier.md:29-30`); "the pinned copies" are
`research/measurements/posthog-free-tier-sources/`; "the terms reference" is
`research/channel-loop/terms/posthog-terms-2026-10-04.md`. `OWNER_STEPS.he.md` is `docs/OWNER_STEPS.he.md`; `site.json`
is `products/il-biz-tools/src/config/site.json`; `page.py` is `products/chart-explainer/page.py`. "The kids list" is
`research/measurements/kids-subbrand-candidates.txt`, with its answers `kids-subbrand-candidates.json` and
`kids-subbrand-check.md` beside it. A bare capture name is `research/rendered/<name>`.

**Who reads what.** The row-24 decider reads Parts A and C. The row-25 decider reads Parts B and C. Both read the header
blocks: this one, the standing rules and the links.
- The seats: row 24 is "one decider (7.10 ~07:11; 5.10 and 6.10 are full)" (`logs/FABLE_QUEUE.md:48`); row 25 is "one
  decider (7.10 ~07:11, beside row 24)" (`:49`). The schedule is at `logs/CHANNEL_LOOP.md:26`. [asm] Tick 57's plan says
  "The 7.10 ~07:11 sitting takes rows 24 and 25" (`CHANNEL_LOOP.md:426`); it names no brief build.
- The outputs: both write "a ruling in `research/channel-loop/`". Row 24 folds "into `T1-PROTOCOL.md:74-77`,
  `experiments.ts` readings, `KIDS-LINE.md` "Not ruled here" 11" (`FABLE_QUEUE.md:48`). Row 25 folds "into
  `src/revenue/owner-steps.ts`, `docs/OWNER_STEPS.he.md`, `CHANNEL_LOOP.md` §6, `site.json`" (`:49`).
- The statuses: row 24 "queued 4.10 (tick 39, from the row-23 fold)"; row 25 "queued 4.10 (tick 40)". `1789ad8` wrote
  row 24 at `:48` (author time 2026-10-04T09:34:39Z, commit 09:35:29Z; `git log -S'| 24 |'`).
- The rows' own pointers that moved: row 24's `T1-PROTOCOL.md:74-77` is now P1 `:77`, P2 `:78`, P4 `:80`, and its
  `render-watch.mjs:426` is `:536`; row 25's `DOCS-RULING` `:250-270` has call 4's heading one line up, at `:249` (Part C).

**Standing rules (repo).**
- **MISSION first.** `MISSION.md` is read before anything else (`CLAUDE.md:4`). The owner's brief, verbatim: "בדרכים אני
  לא רוצה ולא אצטרך לעשות כלום — זה רק אתה." (`MISSION.md:11`) and "אני לא מדבר עם אנשים. יש לך את כל האישורים. אני רוצה
  דרכים בלי שאני צריך אישור של עורך דין" (`:12`).
- **The sitting.** At most 2 agents (`CHANNEL_LOOP.md:51`).
- **The owner's involvement.** "A small number of one-time identity and payout steps are legally unavoidable. Everything
  else is ours." (`MISSION.md:432-433`); "Batch every unavoidable step into **one ordered checklist**" (`:435`); "Never
  invent a step that isn't required." (`:436`); "**Never** open an account in the owner's name, answer an identity check,
  or mark setup done on our own initiative." (`:437-439`) [asm: the 5.10 brief gave `:437-438`; the sentence runs into
  `:439`]; "The owner does not talk to customers." (`:440`).
- **₪0 and the owner's clicks.** "The ceiling in `src/revenue/budget.ts` is ₪0" (`:352-353`); "**Nothing is bought.**"
  (`:354`); "**No step that costs the owner anything is asked for until its cost is checked** from the official source."
  (`:356`). The standing consent "does not reach the owner's own clicks: identity, payout, and anything bought."
  (`:349-350`).
- **Accounts.** Constraint 2, "Stores multiply; accounts do not.": "Every *platform account* costs one owner KYC", and
  "any plan requiring an account per store is rejected on that ground alone" (`MISSION.md:126-131`). Constraint 3,
  "Multiplying must never become an account farm." (`:133`): duplication is "legitimate only where each store is genuinely
  its own product for its own buyer on a platform whose terms permit it" (`:136-137`).
- **Honest value.** "No spam, no scams, no fake reviews, no manipulation, no ToS violations, nothing that deceives a buyer."
  (`MISSION.md:455-456`).
- **The owner's name.** "**Nothing we publish carries the owner's name, username, or personal identifiers.**" (`:276`);
  "the brand is the only public face" (`:310`).
- **Never** (`CHANNEL_LOOP.md:74-86`): "an account farm" (`:76`); "a per-item owner action" (`:77`); "an account opened in
  the owner's name" (`:78`); "a fetch of any tiktok.com or gumroad.com page, or of a site whose terms are unread or refused
  (ruling 30.9 16(d), …)" (`:79`); "a subscription or any spend beyond the one-off ₪200" (`:80`).
- **Caps** (`CHANNEL_LOOP.md:106-111`): built-but-unlaunched "**6/6 — binding**", with the T1 web page and T1 video among
  the members (`:108`); builds in flight 0/1 (`:110`).
- **[asm] Owner asks.** ACCOUNT CAP: "a candidate whose launch needs a NEW owner account or step beyond the seven may be
  TESTED at ₪0 and queued, but never built until the owner has said yes to that step in the batched list"; the same clause
  adds "the kids channel is a click-set inside Stage A on T1's account, not a new account" (`research/channel-loop/
  BOARD-LOOP.md:17`). "No owner step is asked before a qualifying finding." (`research/breadth/BOARD.md:185`). The kids
  ruling's held click-set is asked "in the batched list, never alone, never as a reminder (`MISSION.md:401-403`)"
  (`KIDS-RULING:345-346`).

**Links between the two rows. Read these before ruling.**
1. **One sitting, two agents.** The cap is 2 (`CHANNEL_LOOP.md:51`); rows 24 and 25 sit together (`:26`).
2. **[asm] One chain, two ends.** T1's web arm is counted by a PostHog counter on its page (`page.py:9-24`), and its
   "D0 = public deploy **and** a recorded discovery submission" (`T1-PROTOCOL.md:30`). Stage A, which creates the Data API
   key, "is NOT asked before that read" (`BOARD-LOOP.md:118`; `T1-PROTOCOL.md:89`), and P1 and P2 are read after the first
   upload, after Stage A. [inference] So the PostHog project row 25 asks about comes before, in time, every read row 24
   asks about.
3. **[asm] `chartsplained` sits under both.** Row 24 (e) picks the kids sub-brand with "the owner's veto stands as for T1"
   (`FABLE_QUEUE.md:48`); row 25 (c) asks whether `chartsplained`, T1's sub-brand, "needs its own organisation"
   (`:49`). Both rest on the sub-brand rule: "The channel name is a sub-brand, not the company name, so a failed experiment
   does not sit on the brand's search results" (`research/faceless-youtube/RED-TEAM.md:112-113`). The kids line has "No
   web arm" (`KIDS-RULING:388`), and no file gives it a PostHog counter [inference: the kids sub-brand needs no PostHog
   project].
4. **[asm] Both rows touch Stage A.** Row 24's key is a Stage A line (`T1-PROTOCOL.md:116-120`), and row 24 (e)'s handle is
   tried by the owner there (`:123-125`); row 25's organisation click is proposed outside Stage A, in §6's proposed list
   (`CHANNEL_LOOP.md:245`), while Stage A sits in §6's held list (`:252-254`).

---

## Part A — Row 24: T1's watch-page reads after the youtube.com bar, and the kids sub-brand (`FABLE_QUEUE.md:48`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:48`): "`research/faceless-youtube/T1-PROTOCOL.md:74-77` (P1 reads "the
video's public URL", P2 the watch page; both flagged 4.10, P4 reads no watch page);
`research/channel-loop/RULING-2026-10-04-kids-youtube.md` fold 7 and "Not ruled here" 11;
`scripts/youtube-madeforkids-readback.ts` and `src/revenue/youtube-madeforkids.ts` (videos.list part=status, folded 4.10);
`scripts/render-watch.mjs:426` (youtube.com BARRED); `RULING-2026-09-30-video.md` 16(d) D2".

**The row's question, verbatim** (`FABLE_QUEUE.md:48`): "T1's pre-registered reads P1 and P2 fetch the video's public
watch page from a runner, and youtube.com has been BARRED since 29.9 14:01 UTC. The kids ruling suggests both move to the
same Data API call the read-back makes (an API key, not a page fetch), "for T1's own row to confirm". Rule it: does the
Data API read answer P1/P2 as written (public, not auto-privated, the designation), is the API a fetch of a barred site
under 16(d) (the terms gate reads pages; the API has its own terms, unread: a GitHub-hosted copy of the YouTube API
Services Terms is the premise to read first), and what T1-PROTOCOL's rows should say. Also `stayedPublic()` (72 hours
later) as the K-T1k read. (e) Pick the kids sub-brand from `research/measurements/kids-subbrand-candidates.json` (the 4.10
probe: 2 of 5 free on .com and GitHub, YouTube not probed while barred, first all-free `worldincharts`; §7 rule 4
criteria; the owner's veto stands as for T1)."

**[asm] The labels.** The row labels only (e). This brief labels the four questions before it (a) to (d), in the row's
order: (a) "does the Data API read answer P1/P2 as written (public, not auto-privated, the designation)"; (b) "is the API
a fetch of a barred site under 16(d)"; (c) "what T1-PROTOCOL's rows should say"; (d) "`stayedPublic()` (72 hours later) as
the K-T1k read"; (e) the kids sub-brand.

**The row's own pointers.** `T1-PROTOCOL.md:74-77` is now P1 `:77`, P2 `:78`, P4 `:80`; `:74` is blank. The rows moved at
`dc2b45d` (2026-10-04T09:18:07Z); `4048db4` (09:26:55Z) touched the file without moving them. [asm] Row 24 was written
after both (`1789ad8`, 09:34:39Z), so its range was already stale when the row was written: `git show <commit>:T1-PROTOCOL.md`
puts the P rows at `:74-78` in `cd445e6` and at `:77-81` in `dc2b45d`, `4048db4` and `1789ad8`. `render-watch.mjs:426` is
`:536`; `:426` now holds `urls.txt`'s "not a valid URL" error, and the `TERMS_BARRED` array opens at `:521`.

### A(0) T1-PROTOCOL today, which the fold would change (repo)

- **The pass rule.** "YouTube publishes no list of audited clients, so "the publisher is audited" is not a pass criterion.
  T1 **passes** when all of these are true, recorded with timestamps:" (`T1-PROTOCOL.md:72-73`). The table is `:75-81`.
- **P1** (`:77`): "The upload returns public, not private | the publisher's API response and the video's public URL",
  then the flag: "[flag, 4.10.2026: reading the video's public URL is a watch-page fetch, and youtube.com is barred
  (`TERMS_BARRED`, `scripts/render-watch.mjs:426`), so that half of the read must move off the watch page; the 4.10 kids
  ruling suggests the same Data API call as P2 (`videos.list`, `part=status`, `privacyStatus`), for T1's own row to
  confirm. The ruling names P2 and P4 as the watch-page reads (fold 7; "Not ruled here" 11), but the second one is this
  row, not P4. Not ruled: T1's own protocol, row 16's domain]".
- **P2** (`:78`): "It is still public 72 hours later | the public URL, fetched from a runner at +72 h", then a flag: "so
  this read must move off the watch page; the 4.10 kids ruling suggests the same Data API call as the made-for-kids
  read-back (`videos.list`, `part=status`, `privacyStatus`, on the Stage A API key below), for T1's own row to confirm".
- **P3** (`:79`): "No "locked as private" email reached the channel mailbox | the brand mailbox (the manager account's)".
- **P4** (`:80`): "No auto-privating and no forced sign-out within 72 h | channel state via the publisher; the manager
  account", then a note: "it reads no watch page (channel state comes through the publisher and the manager account), so
  it carries no flag; the second watch-page read is P1's, flagged there. If an auto-privating read is ever added here, it
  uses P2's Data API call (`privacyStatus`), never the watch page (youtube.com is barred)".
- **P5** (`:81`): the instrument, "the publisher's analytics API if it has one; otherwise the analytics-only consent below".
- **Before the flags.** At `f2fca6d`: P1 `:74`, P2 `:75`, P3 `:76`, P4 `:77`, P5 `:78`, the texts as above with no flags;
  the table header `:72` and the fail paragraph `:80-84`.
- **Fail.** "T1 **fails** on any of P1-P4" (`:83`); "An experiment nobody can read is not an experiment" (`:86-87`).
- **Upload parameters.** "`privacyStatus = public`" (`:59`); "**No `youtube_publish_at`:** a scheduled video stays private
  until its time, which is indistinguishable from a lock." (`:63-64`).
- **The Data API key, a Stage A line.** "One API key created in the same analytics-only Cloud project on the brand
  account, about a minute (`research/youtube-kids/ASSESSMENT.md:427-430`). The `madeForKids` read-back after every upload
  (`videos.list`, `part=status`) runs on it; the analytics-only consent does not cover the Data API (`ASSESSMENT.md:423-426`).
  Stage A is not asked before that reader is built and fixture-tested (ruling §10 rule 1)." (`:116-120`). The minute is
  counted at `:91`; the section is "Stage A — what the owner would be asked, as amended (NOT asked yet)" (`:89`), running
  to `:133`. The ASSESSMENT lines `:117` and `:120` cite still hold.

### A(a) Does the Data API read answer P1 and P2 as written?

**What the read-back reads (repo).**
- **The host.** "The only host this reader talks to: Google's API host, never youtube.com (barred,
  scripts/render-watch.mjs)." `READ_HOST = "www.googleapis.com"` (`youtube-madeforkids.ts:31-33`). The request is `part:
  "id,status"`, the ids and `key` (`:90-96`); 50 ids a call is "Inference (grade none)" (`:34-35`).
- **The fields.** One reading keeps `id`, `madeForKids`, `privacyStatus` and `readAt` (`:45-53`), nothing else.
- **The parse.** "A video the response does not carry, or whose status has no boolean `madeForKids`, reads as null — never
  as false" (`:100-101`; doc comment `:99-102`). In the code `privacyStatus` is null whenever the status has no string
  `privacyStatus` (`:113`), not only when the video was not returned. An error body throws (`:105-107`), and so does a body
  with no `items` list (`:108`).
- **Its own grades** (`:21-28`): the field and the guide's steps are "Rendered, read for our own compliance only (D1(1)(i);
  `[against-bar]`)"; "Inference until the first live read ("Not ruled here" 4): the endpoint URL, the response envelope
  (`items[].id`, `items[].status`), that an API key without OAuth returns the field for a public video (ASSESSMENT.md:427-430
  grades it so), and the 50-id ceiling per call."
- **What it keeps per upload** (`:55-69`; the merge `:141-145`): the first read that carried a designation, the latest
  read, `contradictedAt`, and `leftPublicAt`, "When a read first found the upload not public (private, unlisted, or not
  returned) right after a read found it public" (`:67`); neither is ever cleared. A video not returned counts as not
  public (test `youtube-madeforkids.test.ts:206`).
- **The script.** `YOUTUBE_DATA_API_KEY`, made at Stage A, "never hard-coded, never committed, never printed"
  (`scripts/youtube-madeforkids-readback.ts:7-10`; the name at `:48`); without it the script refuses, exit 2 (`:73-77`);
  every request's host is checked against `READ_HOST` (`:101`); it writes `state/colony/measurements/<line>-madeforkids.json`
  (`:15`, `:53-57`, `:123-125`). "NO LIVE CALL BEFORE STAGE A. No workflow runs this script and no package script names it"
  (`:21-23`), asserted at `youtube-madeforkids.test.ts:376-382`; the host is asserted at `:49-52` ("is never a youtube.com
  request, and its host is not terms-barred"). The tests were not run for this brief.
  `state/colony/measurements/` holds only `algora-supply.json`.

**What P1 and P2 ask, against those fields.**
- **P1's publisher half.** Upload-Post's quoted response is
  `{"success":true,"results":{"youtube":{"success":true,…,"status":"completed"}}}`
  (`research/faceless-youtube/T1-PRECHECK.md:50`, github via note); it is elided. `experiments.ts:55-56` says Upload-Post's
  quoted response "carries no audience field". Whether it carries `privacyStatus` is in no file (Part C).
- **P2.** "still public 72 hours later" (`T1-PROTOCOL.md:78`); the field the flags name is `privacyStatus`.
- **"Not auto-privated".** [chk] The read-back keeps `privacyStatus` alone and no cause, so a "private" reading does not say
  who made the video private. The live `youtube-api-videos-insert` capture names `status.privacyStatus`, `status.publishAt`
  and `status.selfDeclaredMadeForKids` (1 match each) and has 0 matches for `status.madeForKids`, `status.uploadStatus`,
  `status.rejectionReason` and `status.failureReason` (rendered, `[against-bar]` by inference; live, counts only).
- **The designation.** The live `youtube-api-revision-history` capture says the `madeForKids` property lets any user
  retrieve a channel's or video's made-for-kids status (`grep -c -F "enables any user to retrieve"` = 1); the live
  `yk2-dev-made-for-kids-status` capture's steps are to call the "videos.list endpoint." (3 matches), include "at minimum,
  the id and status parts" (1) and read "status.madeForKids" (2). Rendered, `[against-bar]` by inference; the read-back
  cites both by line (`youtube-madeforkids.ts:21-25`).
- **The grade of the keyed read.** "Grade: rendered that any user may read the field; inference that a keyed,
  unauthenticated `videos.list` returns it for a public video. §11 #9 (the made-for-kids status guide) settles it."
  (`ASSESSMENT.md:428-430`); the route is chosen at `:427-428`, and the analytics consent "does not cover the Data API"
  (`:423-426`) (repo).
- **The kids ruling's evidence.** "For now, please use YouTube Studio to upload made for kids content.", "while the
  API lists `status.selfDeclaredMadeForKids` … and `madeForKids` is readable by "any user"" (`KIDS-RULING:245-247`, rendered
  via the ruling, which cites the captures by line). Grade [a checker's correction]: rendered via note; the ruling marks
  its youtube.com and support.google.com lines `[against-bar]` (`KIDS-RULING:240`), so the two developers.google.com
  captures are `[against-bar]` by inference. §6 rule 2: "After each upload a reader fetches `status.madeForKids`
  (`videos.list`, `part=status`, the route ASSESSMENT names, `:421-430`). `true` is the only passing reading."
  (`KIDS-RULING:279-280`).
- **Not known before the first upload.** "Whether the machine route carries the designation (`selfDeclaredMadeForKids`
  honoured; channel-level inheritance; `containsSyntheticMedia` likewise): known only at T1's first-upload read-back and the
  kids channel's first upload" (`KIDS-RULING:546-548`, "Not ruled here" 4; `KIDS-LINE.md:302`).
- **Quota.** [chk] The live `youtube-api-quota-cost` capture (fetchedAt 29.9 11:26:43Z) has a method-table row `videos` /
  `list` / `1`: a `videos.list` call costs 1 unit; its default-allocation sentence names "10,000 units per day combined for
  all other endpoints" (1 match). Rendered, `[against-bar]` by inference, no line. The same sentence is quoted at
  `upload-automation.md:74-76` (rendered via note) and upheld at `research/faceless-youtube/DIGEST.md:217` (repo).

### A(b) Is the Data API a fetch of a barred site under 16(d)?

**The bars and the gate (repo).**
- **youtube.com.** "YouTube's terms bar accessing the Service "using any automated means (such as robots, botnets or
  scrapers)" except search engines or with written permission (research/faceless-youtube/scouts/discovery.md:209-211; terms
  audit 29.9)" (`render-watch.mjs:536`).
- **google.com.** "YouTube's terms bar the YouTube Help pages outright (…); Google's own terms allow automated access only
  while respecting robots.txt (…), which render-watch reads since 30.9, but the Help pages' bar stands" (`:538`).
- **What the list is for.** "Sites whose rendered terms bar automated access, so render-watch never fetches them"; "The
  Gumroad API is not a web page and is not fetched by this script." (`:508-516`). Pexels: "The Pexels API is not fetched by
  this script" (`:556`). Upload-Post: "terms bar automated access beyond normal API usage, and scraping" (`:553`).
- **The verdicts.** youtube.com `BARRED` (`terms-verdicts.json:852-857`), google.com (`:256-260`), blog.youtube
  (`:100-104`), upload-post.com (`:779-783`), each sourced to `TERMS_BARRED`. No entry for googleapis.com,
  developers.google.com, support.google.com or accounts.google.com (grep, 0).
- **The gate reads `urls.txt` lines.** "A line may be queued, and stay active, only when its site's terms were read and
  allow a runner (NOT_BARRED or CONDITIONAL_MET), or when it is a TERMS_PENDING site's own terms page"
  (`scripts/queue-zero-test.mjs:71-75`); a barred host always fails (`:197-198`, `:236-237`); the rule restated at
  `terms-verdicts.json:2`.
- **The loop's Never.** "a fetch of any tiktok.com or gumroad.com page, or of a site whose terms are unread or refused
  (ruling 30.9 16(d), …)" (`CHANNEL_LOOP.md:79`).
- **Hosts.** See the header: `termsBarred()` returns `null` for every googleapis.com host tried and `google.com` for
  `accounts.google.com`.

**16(d) (`VIDEO-RULING`, repo).**
- **D1(1)** at `:27-31` (header).
- **D2(i).** "P4 is retired too, since youtube.com is `BARRED`" (`:69-72`): that P4 is the TikTok note's "P4 — TJ's
  YouTube" (`research/tiktok/08-sales-marketing-lessons.md:847`), not T1's P4.
- **D2(ii).** "**The API, `api.gumroad.com`, stays outside the bar**: it is the interface Gumroad provides to sellers, not
  "a web page contained in the Services", and `gumroad-pro-product.js` may keep calling it" (`:75-77`).
- **D2(iii).** One fetch for terms, bounded; "Never for a site already `BARRED`." (`:81-82`).
- **D2(iv).** "**Unread or silent terms: no fetch.** … Silence is not allowance, and fetch-then-read is this repo's
  twice-recorded failure" (`:83-84`).
- **D2(v).** "`google.com` stays `BARRED` (YouTube's terms bar the Help pages outright, …)" (`:96-97`).
- **BASIS, on TikTok.** "oEmbed: the Developer Terms are unread (`:53-56`, none), so it sits inside the bar." (`:106`).
- **D3.** "render-watch *reads others' pages*; C1 is about *operating our own account*" (`:113-114`); "A clause naming
  automated means, or "any means", for **any access** to the site or to accounts bars both, until a written yes."
  (`:115-116`). Wix: "C1 bar for a runner-driven browser on the Dev Center; not a bar for Wix's documented developer APIs and
  CLI", "which are publicly supported interfaces" (`:123-126`). Gumroad: "a provided interface is not "other means"."
  (`:135-136`).
- **What 16(d) does not say.** `VIDEO-RULING` names no googleapis host and no "Data API" (grep, 0); 16(c) item 3 is at
  `:224-225`.

**The API's own terms.**
- **No copy is kept.** The YouTube API Services Terms of Service are held in no file of the repo: no stored GitHub-hosted
  copy, no capture, no `urls.txt` line, no note quoting a clause. `research/channel-loop/terms/` holds GitHub-grade copies
  for other sites (for example `posthog-terms-2026-10-04.md`, `github-terms-of-service-2026-10-05.md`), none for YouTube or
  Google; a find for `*developer*terms*` and `*api-services*` turns up only CrazyGames and GameDistribution captures.
- **Where a GitHub-hosted copy was read.** The discovery scout downloaded Open Terms Archive's `YouTube/Developer Terms.md`
  (`OpenTermsArchive/vlopses-us-versions`), and "This file bundles the YouTube API Services Terms and the Developer
  Policies" (`discovery.md:10-15`, the bundle sentence at `:14`; github, via note). Its quotes are Developer Policies
  sections: III.E.6 Scraping (`:212-214`), III.D.7, III.E.2, III.E.4.h and III.L (`:215-227`), and III.E.4.b, "must not
  store statistics retrieved as Non-Authorized Data for more than 30 days" (`:228-229`). [chk] The scout's own reading of a
  keyed `search.list` read "as-is": "Arguably yes … once a project and API key exist", marked as its reading (`:237`).
- **The upload scout** (github, via note): credentials must not be "embed[ded] … in open source projects"
  (`upload-automation.md:256-259`); quota "may be curtailed after **90 consecutive days of inactivity**" (`:260-261`);
  "**exactly one API project per API client**" (`:262-263`). Its source is OTA `pga-versions`'s `YouTube/Developer Terms.md`,
  "copy of https://developers.google.com/youtube/terms/developer-policies" (`:475`): the Developer Policies, not the API
  Services ToS.
- **What binds an API client** [chk] (`research/faceless-youtube/REGRADE.md:76-80`, rendered via note): YouTube "may share
  your primary email address" (`:76`); "the Developers Console might require you to provide certain other information,
  such as identification or contact details" (`:77`); after a suspension, "must not access or attempt to access YouTube API
  Services via any means" (`:78`); API clients "must display a link to YouTube's Terms of Service" and "must require users
  to agree to a privacy policy" (`:79`). Each phrase is in the live `youtube-developer-policies` capture (`grep -c -F` = 1
  each).
- **The live Developer Policies capture,** in words (rendered, `[against-bar]` by inference; fetchedAt 29.9
  11:27:02.946Z, not frozen, no trimmed block, 800 lines, 435 non-empty). Matching-line counts [a checker's correction:
  lines, not occurrences]: "YouTube API Services" 67 lines (81 occurrences); "API Services Terms" 7; "unauthorized" 2,
  both data-protection duties; "quota" 7 (11 occurrences); "scrape" 1 (3 occurrences); "api key" (any case) 0. [chk] It
  says the Policies are "a component of the Agreement"; it defines "Terms of Service" as the YouTube API Services Terms of
  Service at `/youtube/terms/api-services-terms-of-service`; it defines "Non-Authorized Data" as API Data a client can reach
  without user credentials, kept no longer than 30 calendar days, then deleted or refreshed; "Public search engines may
  scrape data only in accordance with YouTube's robots.txt file or with YouTube's prior written permission" (1 match); and
  it has a 90-consecutive-days inactivity clause.
- **The ToS URL in the captures** [a checker's correction]. The link `/youtube/terms/api-services-terms-of-service` appears
  16 times on 14 lines of `youtube-developer-policies.html`, 4 times in `youtube-api-revision-history.html`, twice in
  `youtube-api-videos-insert.html`, once each in `yk2-dev-made-for-kids-status.html`, `youtube-api-compliance-audits.html`,
  `youtube-api-quota-cost.html` and the four `yt-analytics-*.html` captures, and twice in `youtube-developer-policies.txt`,
  as the URL in the definitions of "Agreement" and "Terms of Service". `research/rendered/urls.txt` has 0 lines for it; the
  developers.google.com YouTube lines are paused as google.com (`urls.txt:145-146`, `:172-174`).
- **The terms audit's reading** (github via note for the OTA line; repo for the rest). `TERMS-AUDIT:119`: "Uncertainty: the
  YouTube ToS 'Service' is 'the YouTube platform and the products, services and features we make available to you as part
  of the platform' (live OTA line 63)"; the Developer Policies' scraping bar "binds only an API developer, and the project
  has ruled out its own API project (research/faceless-youtube/VERDICT.md:227; …:506)". [asm] The line breaks off
  mid-sentence at "If it ever". `research/faceless-youtube/VERDICT.md:227-228`: "Not owner steps, by decision: own Google
  Cloud project + API audit (needs per-item/batch confirmation and audit correspondence → mandate violation; …)". Beside it,
  since 4.10, the Data API key is "created in the same analytics-only Cloud project on the brand account"
  (`T1-PROTOCOL.md:116-118`).
- **The ToS's own exceptions, as a scout quoted them.** Users may not "access, reproduce, download … or otherwise use any
  part of the Service or any Content except: (a) as expressly authorized by the Service; or (b) with prior written
  permission" (`policy.md:317-322` [a checker's correction: the quote starts at `:317`], citing OTA ToS `:118`, `:120`;
  github, via note).

**googleapis.com today (repo).** [a checker's OVERREACH] "A googleapis host is already read elsewhere" is wrong.
- `src/revenue/youtube-analytics.ts` "fetches nothing" (`:6-7`); it names the endpoint
  `https://youtubeanalytics.googleapis.com/v2/reports` (`:20`, `:23`).
- `scripts/youtube-analytics.ts:5`: "NEEDS, and none of it exists yet (T1-PROTOCOL.md, Stage A — not asked)".
- No workflow and no package script names `youtube-analytics`, `youtube-madeforkids` or googleapis (grep, 0). No
  googleapis call has been made; the code targets that host once Stage A exists.
- [chk] `scripts/youtube-analytics.ts:35`: `OPENID_DISCOVERY = "https://accounts.google.com/.well-known/openid-configuration"`,
  and `termsBarred("accounts.google.com")` returns `google.com` (run here).

### A(c) What T1-PROTOCOL's rows should say

- **The kids ruling's fold 7** (`KIDS-RULING:508-513`): "`T1-PROTOCOL.md:75`, `:77`: the P2/P4 reads move off the watch
  page to the same API call (youtube.com is barred) — for T1's own row to confirm, flagged here." (`:512-513`).
- **"Not ruled here" 11** (`KIDS-RULING:564-565`): "**T1's P2/P4 reads of the watch page** (`T1-PROTOCOL.md:75`, `:77`)
  after the youtube.com bar: T1's own protocol, row 16's domain; flagged in fold 7 for the main thread, not ruled here."
  The pointers section repeats it (`:582-583`). The ruling gives no replacement wording for any row.
- **Where the P2/P4 attribution came from.** [chk] `KIDS-RULING:382-383` (§8 evidence): "T1's P2 and P4 read "the public
  URL, fetched from a runner" (`T1-PROTOCOL.md:75`, `:77`) — a youtube.com fetch, barred since 29.9 (`render-watch.mjs:426`);
  T1's protocol is not this row's, but the kids line's mirror of P1-P4 must not inherit it." At that tree `:77` (P4) read
  "channel state via the publisher; the manager account", so the quoted phrase matches P2 only.
- **"Row 16's domain".** [chk] Row 16 is DONE 30.9, as `VIDEO-RULING` (`FABLE_QUEUE.md:40`).
- **The design file's correction.** "T1's reads of the watch page: the ruling names P2 and P4 (`T1-PROTOCOL.md:75`, `:77`),
  but the rows that read the video's public URL are P1 (`:74`) and P2 (`:75`); P4 reads channel state through the
  publisher and the manager account, not the watch page." (`KIDS-LINE.md:311-314`); its pointers are now `:77`, `:78`, `:80`.
- **K-T1k, the kids mirror.** "the kids channel's own first-upload window, P1-P4 as T1's (`T1-PROTOCOL.md:72-82`) but read
  through the publisher's response and the Data API (`videos.list part=status`, `privacyStatus`), never a fetch of the
  watch page (youtube.com is barred) — fails → kill." (`KIDS-RULING:401-403`, §8 rule 3; `KIDS-LINE.md:251-253`). The code
  [a checker's wording correction]: "P1-P4 as T1's, read through the publisher's response and `videos.list part=status`,
  never the watch page" (`experiments.ts:164-165`); "… never a fetch of the watch page" (`:246`); the T1 note beside it
  (`:247`).
- **K-policy.** "any warning, strike, removal, auto-privating, age-gating, … kills the line the same day"
  (`KIDS-RULING:399-400`) [asm: a checker gave `:398-399`; `:398` ends K-mfk-designation]. `policySignal` is "Any warning,
  strike, auto-privating, or YPP rejection citing inauthentic, reused or spam content" (`experiments.ts:37-38`). [chk]
  `:250-252` push `K-policy` for any true `policySignal`; it is a boolean the caller supplies, not read from the API.
- **What `experiments.ts` reads for P1-P4.** `t1Passed: boolean | null`, "one honest test video through the audited
  publisher stayed public for 72 h" (`:23-28`); P1-P4 appear only at `:164` and `:246`. `madeForKidsReadback`, "THE READ IS
  A PRECONDITION OF UPLOADING" (`:54-56`, `:62`). The module has no `^import` line and does not call `stayedPublic`.
- **Who consumes `t1Passed`.** [chk] `publisher-guard.ts:173-182`: the kids line's first upload waits until `t1Passed ===
  true` and T1's first read-back is `"false"`, the order of §8 rule 2, "T1's first upload passes P1-P4 and its `madeForKids`
  read-back returns `false`" (`KIDS-RULING:390-392`). No code in `src/` or `scripts/` produces `t1Passed`.
- **The fold targets.** `T1-PROTOCOL.md:74-77` (now `:77-80`), `experiments.ts` readings, `KIDS-LINE.md` "Not ruled here" 11
  (`:311-314`).

### A(d) `stayedPublic()` as the K-T1k read (repo)

- **The doc and the code** (`youtube-madeforkids.ts:165-175`): "Whether an upload stayed public for `hours` (K-T1k, and T1's
  P2 "still public 72 hours later", read through the API, never the watch page): true once its first designation read and
  its latest read, at least `hours` apart, both found it public and no read since a public one found it otherwise; false
  once one did …; null while that is not yet known. Reads are periodic, so the answer is as good as their spacing."
- **Its clock.** [chk] `first` is the first read that carried a `madeForKids` boolean (`:58`, `:141`). If no read carries
  one, `first` stays null and the function returns null however many reads say "public" (`:173`). [asm] It can still
  return false then: `leftPublicAt` does not depend on `first` (`:144`), so a public read followed by a not-public one sets
  it and `:172` returns false. With no designation read it can return false or null, never true.
- **Its start.** [chk] `scripts/youtube-analytics.ts:8` gives `state/colony/measurements/youtube-videos.json` as "[{ id,
  durationSeconds, publishedAt }]", the file the read-back reads for faceless-youtube (`youtube-madeforkids-readback.ts:11-12`).
  `stayedPublic(v, hours)` takes only the stored read-back and never sees `publishedAt` (`youtube-madeforkids.ts:171-175`).
  P2 reads "at +72 h" (`T1-PROTOCOL.md:78`).
- **The tests.** `youtube-madeforkids.test.ts:194` (null, not known yet), `:196`, `:199` (true at 72 hours), `:204` (false,
  `leftPublicAt` never cleared), `:206` (false: "not returned is not public"), `:208` (null: never public). [chk] No test
  covers a reading with `madeForKids` null and `privacyStatus` "public": the merge fixtures with a null designation also
  have a null `privacyStatus` (`:119`, `:170`, `:205`) [asm: and the parse fixture at `:80` has a null designation with
  `privacyStatus` "private"].
- **Callers.** `stayedPublic` is called only in its test (grep of `src/` and `scripts/`).

### A(e) The kids sub-brand

**The measurement (repo, runner measurement).**
- `research/measurements/kids-subbrand-candidates.json`: `measuredAt` 2026-10-04T09:28:53.632Z (`:2`); probes `com`,
  `github`, `netlify` (`:4-8`); `refused.youtube` "YouTube: not probed (terms barred, ruling 30.9 16(d) D2; the handle is
  tried at Stage A)" (`:9-11`); the note (`:12`); `allFree` `worldincharts`, `askthechart` and `firstAllFree`
  `worldincharts` (`:13-18`); one row per name at `:20-37`, `:38-55`, `:56-73`, `:74-91`, `:92-109`.
- `research/measurements/kids-subbrand-check.md:7-16`: `worldincharts` and `askthechart` free on .com, GitHub and Netlify
  (404 each); `chartfacts`, `graphfacts` and `chartcorner` taken on .com (200), free on GitHub and Netlify; "First all-free
  name in list order: `worldincharts`." "No probe answered unknown."
- [a checker's correction] The row's "2 of 5 free on .com and GitHub" is short: all 5 are free on GitHub, and the 2 are
  free on all three probes, Netlify included (`218ffca`'s subject: "brand-check: kids-subbrand: 2 of 5 free on all 3
  probes"). `CHANNEL_LOOP.md:140` says the workflow ran "4.10 ~09:40"; `measuredAt` is 09:28:53Z and `218ffca` 09:28:54Z.
- Two commits touch the three files: `727692f` (08:32:08Z, the list and the YouTube refusal in the same commit) and
  `218ffca` (09:28:54Z).

**The list and its rule (repo).**
- The rule, in the list's header: "The FIRST name free on all three is the kids sub-brand. At Stage A the owner tries its
  YouTube handle inside the one sitting; if the handle is taken, the next name in list order that is free on all three is
  used. If none of the five is free, the loop writes the next five by the same criteria and re-runs; no owner action at
  any point." (`kids-subbrand-candidates.txt:8-10`). The names, in order: `worldincharts`, `askthechart`, `chartfacts`,
  `graphfacts`, `chartcorner` (`:16-20`).
- The criteria: "short topic words a child can read, plain English, usable as a YouTube handle and a .com; sayable,
  spelled one obvious way, no owner name, no claim the colony cannot back; no "kids" or "children" in the name, and none of
  §2 rule 2's words …, so nothing in the name claims to be for children who cannot yet read (ruling §3 rule 1 …)"
  (`:11-15`, citing `brand-candidates.txt:1-4`). [chk] The name is "never chartsplained, never the brand's own name (ruling
  §7 rule 1)" (`:3-4`).
- The Netlify reading is "grade none until a fold reads the first result" (`:6`); the check file: "This file is a
  measurement, not a choice: the fold records the name, and the owner may veto it." (`kids-subbrand-check.md:19-20`).
- §7 rule 4: "**A sub-brand name without the YouTube probe.** `research/measurements/kids-subbrand-candidates.txt` is
  written (short topic words a child can read; no "kids" or "children" in the name; none of §2 rule 2's words) and checked
  by `brand-check.mjs` on three probes only (.com, GitHub, netlify.app); the YouTube handle is tried by the owner at Stage
  A, and if taken the next name in list order is used." (`KIDS-RULING:350-353`); `:353-355` carry the refusal and the 30.9
  run. `KIDS-LINE.md:175-178` restates it, and `:179-184` say why the list was written with the brand-check fix.
  `research/faceless-youtube/KIDS-LINE.md` does not exist.
- §2 rule 2's excluded words: `KIDS-RULING:129-132`; the audience: "children who can read the declaration"
  (`KIDS-RULING:149`); "No file says at which age a child can read or understand the declaration" (`:140`) [a checker's
  correction: `:140`, and `:128`, not `:139-141`].
- Stage A: the kids channel is created "under the kids sub-brand (never `chartsplained`, never `mehudak`; the YouTube handle
  is tried here, and if it is taken the next name in list order is used)" (`T1-PROTOCOL.md:123-125`, in `:121-126`).
- The test: `brand-check.test.ts:251` asserts `toHaveLength(5)` for the kids list; `:262-270` bar the brand, the T1
  sub-brand and every T1 candidate; `:272-275` bar a word list (kid, child, toy, song, story, colour, number, learn, school
  and others); `:285-287` let the T1 list grow in rounds of five (the `% 5` assertion at
  `:287`) and `:290` pins the T1 ruling [asm: a checker gave `:285` and `:287`]. [inference] Appending a next round of five
  to the kids list would fail `:251`. Each of the five names has 0 hits for the banned list; lengths 13, 11, 10, 10, 11
  (shell check).

**Who picks.**
- The list says "The FIRST name free on all three is the kids sub-brand" (`kids-subbrand-candidates.txt:8`); the loop's
  row says "the pick is a sitting's call, as T1's was: FABLE_QUEUE row 24 (e)" (`CHANNEL_LOOP.md:140`); the row says "Pick
  the kids sub-brand" (`FABLE_QUEUE.md:48`).
- [chk] How T1's name was set. The lines ruling set the list and the rule, "the first candidate free on all four probes is
  the name" (`LINES-RULING:240-241`), and APPLY 3 recorded it: "On the first all-free name: record it in
  `PREREG-DECISIONS.md` §3.5 …, `T1-PROTOCOL.md` item 4, the identity kit …; If none of the five is free, the loop writes the
  next five … The owner may veto by saying so; nothing is asked." (`:273-276`). The fold `29418de` (2026-09-29T08:58:24Z):
  "T1 sub-brand recorded: chartsplained …, the first name free on all four probes in round 2 (a7efa2b) … the owner may
  veto". The rule is restated at `T1-PROTOCOL.md:36-39`. No sitting picked among free names. The lines ruling's basis: "The
  loop chooses the name (`research/channel-loop/BOARD-LOOP.md:118`, repo)" (`LINES-RULING:247`).
- [chk] The company brand, by contrast: "The choice among the survivors is Fable's; the owner may veto."
  (`research/measurements/brand-candidates.txt:3`); "**The choice goes to Fable.** … The owner can veto it; the owner is not
  asked to research it." (`research/measurements/brand-name-check.md:34`).
- [chk, `[D1(1)(ii)]`] In T1's 30.9 run, 3 of the 5 names free on .com, GitHub and Netlify had their YouTube handle taken
  (`t1-subbrand-check.md:15`, `:19`, `:24`, against `:21`, `:23`). That run came after the bar, and its YouTube column
  "stays on disk under D1(1)(ii), as the record of the breach and the reason not to re-probe" (`:10-11`). Whether any other
  use of that column is allowed is not the checker's call.
- **The owner's veto.** The only veto line for the kids name is `kids-subbrand-check.md:20`; "veto" has no hit in the kids
  list or `KIDS-LINE.md`. `docs/OWNER_STEPS.he.md` and `owner-steps.ts` have 0 hits for "worldincharts", "sub-brand" or
  "kids". The owner meets the name when trying the handle at Stage A (`T1-PROTOCOL.md:123-125`).
- **Why a sub-brand.** "a failed experiment must not sit on the brand's search results, so T1 runs under a sub-brand
  (`RED-TEAM.md:112-113`; `research/measurements/brand-name-decision.md:80`); AI kids content is the named target of a
  public campaign (…)" (`KIDS-RULING:322-324`, which cites a fortune.com capture by line, rendered, no verdict); the
  four-probe rule (`:324-326`). The fortune.com capture was not re-opened for this brief.
- **What the probes reach.** `brand-check.mjs`: `PROBES` (`:49`); `lookups` (`:81-86`) — `rdap.verisign.com`,
  `api.github.com`, `www.youtube.com` (`:84`) and `<name>.netlify.app`; the YouTube refusal (`:5-9`, `:70-79`).
  `.github/workflows/brand-check.yml` runs on a push to a non-main branch that changes the workflow, the script or a
  `*-candidates.txt` (`:24-29`, the list glob at `:29`). `termsBarred()` returns `null` for the three probe hosts used
  (header). No terms verdict exists for `rdap.verisign.com` or `*.netlify.app`; github.com is `CONDITIONAL_MET`
  (`terms-verdicts.json:249-254`).
- **The kids line has no web arm** (`KIDS-RULING:388`), yet its list carries a netlify.app probe (Part C).

---

## Part B — Row 25: the PostHog organisation step (`FABLE_QUEUE.md:49`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:49`): "`research/measurements/posthog-free-tier.md` (tick 40: ruling (c)
MET on the text; the live check: free plan, no trial, one project of one allowed, in use by another product);
`research/channel-loop/RULING-2026-09-30-documents.md` (c) (`:250-270`: the project is agent work on the free-tier
condition); `logs/CHANNEL_LOOP.md` §6 "PostHog organisation for the brand (proposed 4.10)";
`research/channel-loop/BOARD-LOOP.md:17` (ACCOUNT CAP); `research/breadth/BOARD.md:185` (no owner step before a qualifying
finding)".

**The row's question, verbatim** (`FABLE_QUEUE.md:49`): "Ruling (c) assigned the brand's PostHog project to agent work; the
free plan allows one project per organisation and the owner's only organisation already uses its project for another
product, so the colony cannot create the brand project without an owner click: a second free organisation in the same
PostHog account. Confirm (a) that the click is a one-time step inside the mandate (free, no identity check, the login
already exists) and its place in §6 (after step 8, before any deploy's D0: the page-view instrument needs the project
before D0); (b) the colony's minute-after list (switch the connector's organisation, create the project with session
recording off, GeoIP off, IP discard on, cookieless mode, write the token to `site.json`); (c) whether `chartsplained`
needs its own organisation (one project per free organisation; a shared token would link the sub-brand to the brand in
public) or shares the brand's; (d) what the REOPEN is if PostHog starts charging for the query API (announced)."

**The row's own pointer.** `DOCS-RULING` (c) `:250-270`: section (c) heads at `:219`, call 4 at `:249`, its REOPEN at `:267`,
and `:270` is the section's `---`.

### B(0) The step as proposed today

**The PostHog note (repo).**
- **Status.** Ruling (c)'s condition is "MET on the text" at PC `4c27ff7` / PH `526d64d`; it is "a "today" answer, and
  PostHog has announced the change that would end it"; "Nothing was created in PostHog and no connector was called"
  (`posthog-free-tier.md:3-9`).
- **The live check** (`:199`, "Read-only calls through the attached PostHog connector (`project-get`, `organization-get`,
  `projects-get`, `billing-overview-get`, `read-data-schema`), 4.10 ~10:35 UTC. Grade: live account state, not a text.";
  `repo`, recording that read):
  - plan: "`billing_plan: free`, `subscription_level: free`, `has_active_subscription: false`, `trial: null`,
    `free_trial_until: null`" (`:201`);
  - projects: "the free plan's `organizations_projects` feature has `limit: 1`; the organisation holds exactly one project,
    created 20.8.2026", which carries another product's telemetry, "session recording on, 8 recordings", and "the brand
    never shares it: mixed data, and its public project token already identifies that other product's site" (`:202`);
  - consequence: "the colony cannot create the brand's project in this organisation on the free plan (`project-create`
    would be refused or push toward the paid "Boost" add-on, which the ₪0 rule forbids). Organisations are free and
    unlimited (`organizations.mdx`, above), but the MCP server has no tool that creates one, so a second organisation is an
    owner click in PostHog: one time, free, no identity check, inside an account the owner already holds. Proposed as a §6
    free step (after step 8, before any deploy's D0); FABLE_QUEUE row 25 confirms its place." (`:203`);
  - after the click: "the colony switches the connector's active organisation (`switch-organization`), creates the project
    (`project-create`) with session recording off, GeoIP off (every new project gets it on, above), "Discard client IP
    data" on and cookieless mode, and writes the project token to `products/il-biz-tools/src/config/site.json`. Nothing was
    created on 4.10." (`:204`); "REOPEN (unchanged)" (`:205`).
- **The tick-40 log** (`logs/2026-10-04-channel-loop-tick-40.md`, Hebrew): "ארגון אחד, פרויקט אחד (המגבלה)" (one organisation,
  one project, the limit; `:8`); the decision is labelled "(Fable, ה-thread הראשי)" (Fable, the main thread; `:9`); the
  no-share reason, mixed data and a shared token linking the two in public (`:19`); "ארגון שני = צעד בעלים … בתוך המנדט;
  מקומו … לאישור ישיבה (שורה 25)" (a second organisation is an owner step inside the mandate; its place is for a sitting to
  confirm, row 25; `:20`).
- **§6 today** (`CHANNEL_LOOP.md:245`, under "Proposed steps, each needing a yes (free):" at `:243`): "**PostHog
  organisation for the brand (proposed 4.10, tick 40; about two minutes, free, no identity check; after step 8, before any
  page deploys):** in the PostHog account the connector already reaches, create a second organisation named Mehudak
  (organisations are free and unlimited; the free plan allows one project per organisation, …), and say so here. The colony
  then switches the connector to it and creates the project itself: session recording off, GeoIP off (every new project
  gets it switched on), "Discard client IP data" on, cookieless mode; its public project token goes into `site.json`. The
  existing organisation's one project carries another product's telemetry and is never shared. … A sitting confirms the
  step's place (FABLE_QUEUE row 25)." [chk] §6 says "before any page deploys" where the row says "before any deploy's D0".
- **Not built before the ruling.** "The PostHog owner step is NOT built before the 7.10 sitting confirms it (FABLE_QUEUE row
  25): §6 is a single ordered list and a new owner step enters `owner-steps.ts` and the owner page only on a ruling, as step
  7's items did" (`CHANNEL_LOOP.md:458`; the same in Hebrew at `logs/CHECKPOINT.md:135`). `owner-steps.ts` and
  `OWNER_STEPS.he.md` have no PostHog organisation entry.

**The ruling it replaces in part (`DOCS-RULING`, repo).**
- Call 4: "**`POSTHOG_READ_KEY` joins step 6: YES, one row, on one condition.**" (`:249`); "the board … assigned the PostHog
  project to agent work through the connector attached to the session (`research/colony-sweep/BOARD.md:281`;
  `BOARD-LOOP.md:97`)" (`:252-253`); the paste is the owner's click in any case, and minting the key "is one more click in
  the same sitting" (`:255-256`).
- "**Condition:** the project and the query API stay on PostHog's free tier — … if a query key needs a paid plan, the row
  is not asked and the reader stays a no-op." (`:258-260`).
- "Order: the agent creates the project through the connector first (cookieless, brand name, no PII — `BOARD-LOOP.md:97`)
  and writes `projectKey` and `projectId` into `site.json`; only then is the row asked, so the owner is never asked for a
  key to a project that does not exist." (`:260-262`). [chk] "Alternative rejected for now: reading page views from a
  scheduled session through the connector — unscheduled in CI terms and not auditable from the repo." (`:262-263`).
- "**REOPEN IF.** PostHog's query API turns out to need a paid plan (the row is withdrawn); …" (`:267`).
- Fold 3 gates the row on `site.json` `posthog.projectId` (`:346-349`); owner ask 1 ends "Checked against every
  constraint above: passes." (`:395-396`); still open: "PostHog's free-tier coverage of the query API (grade none; the (c)
  condition)" (`:410`). The ruling has 0 hits for "organi" and for "one project".

### B(a) A one-time step inside the mandate? And its place in §6

**What PostHog's own texts say (github, the pinned copies).**
- **Organisations.** `multipleOrgs:` … `free: true` (`PC/contents/docs/settings/organizations.mdx:11-13`); "PostHog Cloud
  users can create, manage, and join organizations without limits." (`:28`). [chk] The click path: "Use the organization
  dropdown in the top bar to switch between organizations or create a new one." (`:26`; the note read `:1-28` and did not
  cite it). The page's availability is `free: partial` (`:5-6`).
- **One project per free organisation.** "Since free organizations are limited to one project, you may need to temporarily
  upgrade your plan and add billing details to create a second project." (`PC/contents/docs/settings/projects.mdx:66`).
  [a checker's context] It sits under "Moving projects between organizations" → "Requirements" (`:56-67`); the next line is
  "After the move is complete, you can downgrade the original organization back to the free plan if desired" (`:67`). That
  page's availability is `free: partial` too (`:5-6`).
- **A new organisation's project.** [chk] "Every new organization (including the one created for you on account creation)
  comes with a fresh project named "Default Project". You can rename or delete it as you see fit." (`projects.mdx:15`).
  `grep -F 'Default Project'` finds it in no repo note. "To switch between projects … or create new projects, use the
  project switcher in the middle of the top bar." (`:17`). [asm, inference] With the free plan's one-project limit (note
  `:202`) and a Default Project already in a new organisation, a `project-create` there would meet the same limit; no file
  says so.
- **Identity and card.** No PostHog text read says that creating an organisation needs no card or identity check; the
  claim rests on the note's `:203` (repo, recording a live read). Which plan a new organisation starts on is not in the
  source; the note's REOPEN 3 counts a trial as paid: "trials count as paid while active" (`posthog-free-tier.md:185-187`,
  citing PC `queries.mdx:449`, in the read-budget paragraph).
- **Terms.** 2.1(d): the Customer will not "access or use the Licensed Materials in a manner intended to circumvent or exceed
  any usage limits, service capacity limits, account limitations, or other restrictions applicable to Customer's
  subscription or Order Form" (the terms reference `:129-131`, heading `:114`; github). No file weighs it against a second
  free organisation made to hold a second free project.

**What the mandate says (repo).** The standing rules above: one-time steps only (`MISSION.md:432-433`), one checklist
(`:435`), no invented step (`:436`), never an account in the owner's name or an identity answer (`:437-439`), the owner's
own clicks outside the standing consent (`:349-350`), constraint 2 (accounts) and 3 (no farm) (`:126-138`), and the loop's
"an account farm" (`CHANNEL_LOOP.md:76`).
- **The nearest ruled precedent** [chk]: the kids channel inside an existing owner account. It is created in Stage A's
  sitting, "written into `T1-PROTOCOL.md`'s Stage A text, not a new numbered step. If not, it is one click-set added to the
  held list (…), asked only after a qualifying finding (`research/breadth/BOARD.md:185`) in the batched list, never alone,
  never as a reminder (`MISSION.md:401-403`)." (`KIDS-RULING:341-346`). Its reading of constraints 2-3: "two channels, each
  its own product for its own audience, are not a farm" (`:318-319`); "a second Stage A is a step the mandate does not
  require (`MISSION.md:436`)" (`:338`). `BOARD-LOOP.md:17` carries it in the ACCOUNT CAP note.
- **ACCOUNT CAP** (`BOARD-LOOP.md:17`): "a candidate whose launch needs a NEW owner account or step beyond the seven may be
  TESTED at ₪0 and queued, but never built until the owner has said yes to that step in the batched list (owner-steps.ts:18-19:
  an eighth step needs a decision, not a commit)". [chk] It says "beyond the seven" against "EIGHT" at `owner-steps.ts:18`.
- **"No owner step is asked before a qualifying finding."** (`research/breadth/BOARD.md:185`), in Q8, Mozilla
  (`:181-185`); the file has 0 PostHog mentions.

**How owner steps are held in code (repo).**
- "There are exactly EIGHT steps. Adding another fails the build, which is the point — a new step needs a decision, not a
  commit." (`owner-steps.ts:18-21`); `toHaveLength(8)` at `owner-steps.test.ts:41` and `:980`; the Hebrew `## צעד N —`
  headings must equal the code's numbers (`:470-473`).
- Proposed steps live outside the code: "the proposed Mozilla add-ons step (14) is gone with Firefox's kill, and PayPal's
  proposed step 13 has condition (i) met; both live only in the Hebrew document's "later" section and in
  logs/CHANNEL_LOOP.md, never here." (`owner-steps.ts:99-101`) [a checker's correction: it names Mozilla and PayPal, not
  npm; npm appears only in step 8's `unlocks` (`:278`) and at `OWNER_STEPS.he.md:39`, "חשבון npm שעוד לא מבוקש", the npm
  account not yet asked].
- The secret-row gate: "The colony makes it true, never the owner." and "The agent creates the brand's PostHog project
  through the connector and writes the id there first" (`owner-steps.ts:130-132`); a gate's report text is "a reason, never
  something for the owner to do" (`:137`); `POSTHOG_READ_KEY`'s row, "in the account that holds the brand's project"
  (`:404-409`, the source at `:407`); `isSecretRowAsked` reads `site.projectId` (`:463-471`, `:469`).
- [chk] An unnumbered owner settings change already exists in the Hebrew list: the four free steps asked now include the
  environment's network setting, "בלי מספר ברשימה הזאת" (without a number in this list) (`OWNER_STEPS.he.md:516-517`).
- PostHog appears in `OWNER_STEPS.he.md` only at `:357` and `:384` (the `POSTHOG_READ_KEY` row).

**Its place in §6 (repo).**
- §6 is "Owner-ask batch (single ordered list, under the ₪0 rule)" (`CHANNEL_LOOP.md:201`). "**Free, no identity (about 30
  minutes in all; order set by the loop board, 29.9 (b)):**" (`:205`); "Step 8 unblocks the most: seven written venue
  questions, il-biz-tools' publish gate, the pcn874 page, npm's account and Displate's login wait on it." (`:207-208`); items
  1 step 8 (`:210-212`), 2 network (`:213-216`), 3 step 6a (`:217-218`), 4 step 7 (`:219-221`). The proposed list opens at
  `:243`: step 9, npm (`:244`), then the PostHog organisation (`:245`). The held list's `POSTHOG_READ_KEY` line: "asked only
  after the brand's PostHog project exists and PostHog's free tier is shown to cover the query API" (`:255-256`).
- Step 8's `unlocks` (`owner-steps.ts:278`) lists "seven written questions, il-biz-tools' publish gate, the pcn874 page,
  npm's account (proposed step 9, not yet asked) and Displate's login"; no PostHog item [chk].
- **Why "after step 8".** No file gives a reason: the note's `:203`, `CHANNEL_LOOP.md:245` and the tick-40 log's `:20` state
  the order only; no file says the click needs the brand mailbox.
- **Why before D0.** D0 is recorded "only with the counter live on the deployed site (posthog.projectKey set in the
  site.json that shipped): weeks from a D0 with the counter off would be read as zeros nobody measured"
  (`state/colony/page-view-clock.json:2`); PUBLISH-3: "the instrument is wired before the surface goes up — … the PostHog
  cookieless key in site.json" (`BOARD-LOOP.md:56`). Both clocks' `d0` are `null` (`page-view-clock.json:3-4`).
- **What gates which deploy.** il-biz-tools' deploy, and so its D0, already waits on step 8 through the publish gate
  (`CHANNEL_LOOP.md:134`; `owner-steps.ts:278`). The T1 arm's deploy route is "ask 1" (`CHANNEL_LOOP.md:138`). [inference,
  a checker's] T1's D0 does not wait on step 8. [asm] `page.py:4-5` still says the page "is not deployed: that waits on the
  brand domain (owner step 5)"; `BOARD-LOOP.md:117` puts the arm on its own netlify.app subdomain.

### B(b) The colony's minute-after list

**As proposed.** Switch the connector (`switch-organization`), `project-create` with session recording off, GeoIP off,
"Discard client IP data" on and cookieless mode, the token into `site.json` (note `:204`; `CHANNEL_LOOP.md:245`). The
documents ruling's order adds `projectId` (`DOCS-RULING:261`).

**Each item against the texts (github unless marked).**
- **Session recording.** [chk] A per-project field, default off: `session_recording_opt_in =
  field_access_control(models.BooleanField(default=False), "project", "admin")` (`PH/posthog/models/team/team.py:368`; the
  note grepped `team.py` only for `anonymize_ips` and the server-hash field). In cookieless mode, "Session replay and
  surveys: Both are disabled if the user has not given cookie consent" (`PC/contents/tutorials/cookieless-tracking.md:112`).
  The il-biz-tools snippet sets `disable_session_recording: true` (`products/il-biz-tools/src/lib/analytics.js:49`, repo).
  The existing project has session recording on (note `:202`).
- **GeoIP.** On by default in every new project: `enabled_default_hog_functions_for_new_team` … `"enabled": True,`
  (`PH/products/cdp/backend/models/hog_functions/hog_function.py:423`, `:466`); the docs list "Disabling default GeoIP
  enrichment transformations" (`PC/contents/docs/privacy/data-storage.mdx:31`). Discarding the IP does not stop it:
  transformations "can **still use the IP** before it is discarded" (`data-storage.mdx:43-44`; note `:147`). In cookieless
  mode "the IP is stripped before transformations run, so GeoIP enrichment and bot detection won't enrich your events"
  (`data-storage.mdx:48`). The note: "the disclosure on the T1 page is false until it is" turned off (`:167-168`, repo).
  `page.py:34-38` says the same for the T1 page.
- **"Discard client IP data".** A project toggle (`data-storage.mdx:39`); "**EU organizations**: Automatically default to IP
  data capture disabled for GDPR compliance." (`PC/contents/docs/privacy/data-collection.mdx:157`); a new project's
  `anonymize_ips` comes from `organization.default_anonymize_ips` (`team.py:124`). [chk] The organisation-level default
  "automatically applies to all new projects created within the organization" (`organizations.mdx:56`); "Existing projects
  are not affected by this setting - only newly created projects will inherit the organization's default." (`:63`); the
  project override (`:65`; `projects.mdx:46`); inheritance at creation (`projects.mdx:32-39`).
- **Cookieless mode.** "Before configuring cookieless tracking, you need to enable "Cookieless server hash mode" in your
  PostHog project settings under **Project Settings** > **Web analytics**." (`data-collection.mdx:286`); a per-project field,
  default `DISABLED` (`team.py:616-618`). Whether server-hash mode covers the T1 page's raw event is "Not in the source"
  (note `:151`, none). The il-biz-tools snippet: `cookieless_mode: 'always'`, `persistence: 'memory'` (`analytics.js:45-46`),
  and "Every capture below falls back to the PostHog PROJECT's settings when the page leaves it unset …; Each is pinned off
  in code." (`:50-54`, repo).
- **Paid or not.** "nothing read marks any of the four settings as paid" (note `:153`). [a checker's correction] The note
  never lists "the four"; reading them as cookieless/memory, server hash, discard IP and GeoIP (`:143-150`) is inference.
- **The token and the id.** "Every project has its own distinct write-only token, … You can always regenerate this
  token, but keep in mind that the old one will be immediately revoked." (`projects.mdx:13`). `site.json:18-23`:
  `projectKey` "", `apiHost` "https://eu.i.posthog.com", `projectId` "", and the comment "Filling it also needs
  'Cookieless server hash mode' enabled in the PostHog project settings" (`:22`). The reader: the NEEDS block
  (`page-views-reader.ts:8-16`); the host map, "Anything else is refused" (`:65-69`); `not_configured` (`:310`);
  `counter_off` when `projectKey` is empty (`:313-315`); `no_clock` (`:327`). The tick passes `POSTHOG_READ_KEY` and
  `POSTHOG_PROJECT_ID` (`.github/workflows/colony.yml:64-70`).
- **The list names the token only.** Note `:204` and `CHANNEL_LOOP.md:245` name "the project token"; the gate reads
  `projectId` (`owner-steps.ts:469`). Files that do say `projectId` is written: `DOCS-RULING:261`, note `:174`,
  `products/il-biz-tools/README.md:395-396` and `:792`, `owner-steps.ts:131-132`, `site.json:22`.
- **Who does what, in three texts.** The project is the colony's: "never the owner" (`owner-steps.ts:130`), "it is not an
  owner step" (`products/il-biz-tools/README.md:395-399`), "ours to set" (`:792`). `README.md:400-405` says
  `POSTHOG_READ_KEY` "is not on the owner's list", which is stale against `owner-steps.ts:404-409` [chk].

### B(c) `chartsplained`: its own organisation, or the brand's?

- **The note** (repo): "So il-biz-tools with pcn874 (one host) fits one free project; **if the T1 sub-brand
  (`chartsplained`) gets its own project, it needs its own free organization, never a paid plan.** Shared or separate is a
  decision for the main thread with a consequence it should weigh [none, inference]: the project token is public in each
  page's source (`products/chart-explainer/page.py:26-30`), so one shared project would print the same `phc_` token on the
  brand's site and the sub-brand's, linking the two in public, which the sub-brand exists to avoid
  (`research/channel-loop/BOARD-LOOP.md:117`)." (`posthog-free-tier.md:161-166`).
- **The page's counter** (repo): `counter={"host": …, "key": "phc_..."}` (`page.py:14`); "The key is PostHog's project
  token. It is public by design: it appears in the page source" (`:26-27`); the project must have "Discard client IP data"
  on and GeoIP off before deploy (`:34-38`); `render.py:101` builds the page with no counter. No chart-explainer `site.json`
  exists; no field anywhere holds a chartsplained token.
- **The loop's row** (`CHANNEL_LOOP.md:138`): T1 web arm needs "deploy route (ask 1) + a PostHog project named after the
  brand, with 'Discard client IP data' on and GeoIP off"; "Next: create the PostHog project through the attached
  connector, pre-register the reach floor, choose the sub-brand name." [chk] The need column asks for a project "named after
  the brand" while the arm runs under the sub-brand (`BOARD-LOOP.md:117`). chartsplained was "chosen 29.9, pending" the
  owner's veto (`products/chart-explainer/netlify_files.py:30-31`; `CHANNEL_LOOP.md:138`).
- **PostHog's own layout advice** [chk] (github): "We also **strongly recommend** keeping your apps and marketing website on
  the same production project", filtering "by the `host` property" to separate them (`projects.mdx:28`, `:30`); "It's best
  to use separate projects for: Apps that are entirely separate products with unlinked authentication systems" (`:50-51`).
- **The sub-brand's purpose** (repo): the arm "goes on its own netlify.app subdomain under a SUB-BRAND name (RED-TEAM §2.2's
  reasoning: a failed experiment must not sit on the company's brand)" (`BOARD-LOOP.md:117`).
- **The clock if the instrument changes** [asm] (repo): the 6.10 domain-clock ruling holds that a domain deploy is a new
  clock, not a new instrument: "The domain deploy as designed is the same build, the same project token and the same
  snippet" (`CLOCK-RULING:75-76`); "A domain deploy that changes the instrument — a new PostHog project or token, a different
  snippet, or the counter off on the new host. That is a new instrument" (`:111-112`). `page-views.ts:41-43` carries the
  fold.

### B(d) The REOPEN if PostHog charges for the query API

- **Announced** (github): "The SQL API is free to use while it's in the public beta … we plan to charge a competitive rate
  for heavy usage." (`PC/contents/docs/sql/index.mdx:148`); "We strongly discourage Query API usage and will eventually
  charge for it." (`PC/contents/docs/endpoints/endpoints-vs-query-api.mdx:16`); availability `free: full` (`sql/index.mdx:5-6`).
- **Not gated today** (github): no plan gate on `create` (`PH/posthog/api/query.py:288`); the read budget's code default is
  20 GB an hour free and ×10 paid (`PH/posthog/settings/web.py:1027-1031`); its deployed value is "not in the source" (note
  `:105`, repo).
- **Breakage is not cost.** "Pipelines built on `/query` may break at any time." (`PC/contents/docs/api/queries.mdx:22`); the
  note reads it as a `reader_down` risk, not a cost (`:108`, `:117-119`).
- **The fallback named.** Endpoints: "free during beta. When pricing ships, it will be usage-based with a generous monthly
  free tier" (note `:110`, citing PC `src/hooks/productData/endpoints.tsx:31-32`; github, via note).
- **The note's REOPEN list** (`:177-191`): each "withdraws the step-6 row and leaves the reader a no-op". 1: PostHog prices
  the query API in a way that reaches a free project at one weekly query, gates `create`, or cuts the free read budget —
  "Then the route to weigh is Endpoints' free tier …, not a paid plan." (`:179-182`); 2: allowance or retention falls
  (`:183-184`); 3: the organisation is not on the free plan, a trial included (`:185-187`); 4: the Terms (`:188-190`); 5: "A
  second project is wanted and the free route (a second organization) is refused." (`:191`). "What it does not settle"
  (`:193-195`).
- **The Terms** [a checker's correction] (github): 6.1, PostHog "may increase Fees or introduce new charges at the end of the
  Initial Credit Term (as defined below) or any then-current renewal term upon thirty (30) days' prior notice" (the terms
  reference `:231-233`, heading `:211`); 7.1, termination on thirty days' notice of a Customer without "any existing and
  usable Prepaid Credits" (`:282-285`, heading `:270`).
- **The terms verdict** [chk] (repo): posthog.com `NOT_BARRED` (`terms-verdicts.json:572-578`), its note: "The page-view
  reader's calls to eu.posthog.com are customer use of the query API, not a render line: they are held to 2.1 and to the
  API's documented limits" (`:576`).
- **The ruling's REOPEN** (`DOCS-RULING:267`) and its rejected alternative, a connector read from a scheduled session
  (`:262-263`). The other REOPEN lines: `CHANNEL_LOOP.md:256` (the free-tier condition) and `:356` ("announced pricing as the
  REOPEN").
- **Retention and volume** (github): 1 year on the free plan (`PC/contents/docs/data/events-retention.mdx:16-18`) against a
  16-week need (note `:125`, `:129`); 1M events a month, and on the free plan events over it "are permanently dropped", not
  billed (note `:74-76`, github via note).
- **Region** (github): "To use this, sign up at eu.posthog.com" (`PC/contents/docs/product-analytics/privacy.mdx:9`); a US to
  EU move is available only on the boost, scale or enterprise plans (`:11`); "Cross-region migration is only available to
  customers on the **Scale** or **Enterprise** plan" (`projects.mdx:86`). `site.json:20` defaults to EU, and the reader
  refuses any other host (`page-views-reader.ts:65-69`, `:317-318`).

---

## Part C — What is not for this sitting, what no file holds, and housekeeping

**Not for this sitting.**
- Row 26 (the ledger's raw sale ids) and row 27 sit on 8.10 (`CHANNEL_LOOP.md:26`; `FABLE_QUEUE.md:50-51`).
- The kids ruling stands: admission, kills, the account and the sub-brand rule (`KIDS-RULING` §§7-11). Row 24 asks only
  about T1's P1/P2 reads, the API under 16(d), T1-PROTOCOL's rows, `stayedPublic()` and the pick among the measured names.
- Ruling (c)'s `POSTHOG_READ_KEY` row and its condition stand, the condition MET on the text and on the live plan (note
  `:172-175`, `:201`). Row 25 asks about the organisation click, the list after it, `chartsplained`'s project and the
  REOPEN.
- [asm] The `copying` field of the YouTube-side sites is `"unread"`. The 6.10 robots ruling's audit pass reads the
  copying clauses of `NOT_BARRED`, `CONDITIONAL_MET` and `NO_TERMS` sites (fold 10, `ROBOTS-RULING:413-415`); of two
  `BARRED` sites the same ruling says "TikTok's and Gumroad's copying clauses were not read this sitting; their `copying`
  field is set by the audit" (`:370-371`). The YouTube-side fields are not this sitting's.

**What a ruling would need that no file holds.**

*Row 24.*
1. **The API's terms.** The YouTube API Services Terms of Service in any copy kept in the repo: no stored GitHub-hosted
   file, no capture, no `urls.txt` line, no note quoting a clause. The OTA bundle is only described (`discovery.md:13-14`),
   and its quotes are Developer Policies sections; the live Developer Policies capture only names the ToS and its URL.
2. **Unauthorized access.** Any clause about unauthorized access to the API itself; the capture's two hits are
   data-protection duties.
3. **Verdicts.** A terms verdict for googleapis.com, developers.google.com, support.google.com or accounts.google.com.
4. **16(d) and a keyed call.** Any ruling on whether a keyed Data API call is a "fetch of a site" under 16(d) or
   `CHANNEL_LOOP.md:79`. D2 rules on the Gumroad API and TikTok's oEmbed; D3 on provided interfaces for operating our own
   accounts (Wix, Gumroad).
5. **"Service".** Whether YouTube's "Service" (`TERMS-AUDIT:119`, "live OTA line 63") covers the Data API, or whether a
   keyed call is "expressly authorized by the Service" (`policy.md:317-322`).
6. **The Developer Policies' reach.** Whether they bind the colony once Stage A creates the key. The audit's "binds only an
   API developer, and the project has ruled out its own API project" (`TERMS-AUDIT:119`; `VERDICT.md:227-228`) predates
   the key at `T1-PROTOCOL.md:116-118`.
7. **Money.** Any money cost of the Data API key or the Cloud project. The per-call quota of `videos.list`, 1 unit, is held
   only in a live capture (A(a)).
8. **The keyed read.** That an API key without OAuth returns `status.privacyStatus` or `madeForKids` for a public video;
   every file grades it inference.
9. **Auto-privating.** Whether a `videos.list` status read can tell auto-privating by YouTube apart from any other private
   state; the code keeps no cause field.
10. **The publisher's response.** Whether Upload-Post's response carries `privacyStatus`; the quoted one is elided.
11. **P1-P4 in code.** Any reading for P1, P2 or P4 in `experiments.ts` (only `t1Passed`), and any producer of `t1Passed`.
12. **`stayedPublic()`.** Any caller outside its test. Whether its first-to-latest span matches P2's "72 hours later": it
    counts from the first read that carried a designation, never from `publishedAt`, and with no designation read it never
    returns true [asm: a checker wrote "returns null forever"; `:172` returns false once a public read is followed by a
    not-public one].
13. **The declaration sent.** Any read of `selfDeclaredMadeForKids` in the code [asm: `publication-gate.ts:79`, `:715` and
    `experiments.ts:93`, `:162` name it as what the publisher sends; nothing reads it back].
14. **The ruling's wording.** Replacement wording from the kids ruling for P1, P2 or P4; its P2/P4 attribution comes from a
    quote that matches P2 only (A(c)).
15. **The pick.** Any weighing of `worldincharts` against `askthechart`, or why the fold agent ordered the list as it did.
16. **Who picks.** Which rule governs the kids name: the list's "the first … is the kids sub-brand"
    (`kids-subbrand-candidates.txt:8`) or "a sitting's call" (`CHANNEL_LOOP.md:140`; `FABLE_QUEUE.md:48`). For T1 the rule
    governed and a fold recorded the name (A(e)).
17. **Existing users of the names.** A web search for an existing business, channel or trademark under any of the five.
18. **Handles.** Any YouTube handle reading for the five names, and YouTube's handle-format rules at a permitted grade;
    "usable as a YouTube handle" is untested [inference].
19. **Both handles taken.** What Stage A does if both all-free names' handles are taken, beyond the list's re-run rule
    (`kids-subbrand-candidates.txt:10`); the test pins five names (`brand-check.test.ts:251`).
20. **Netlify's 404.** A fold that upgrades the Netlify reading from grade none, for either list.
21. **A web probe without a web arm.** Why the kids list needs a netlify.app probe when the line has no web arm
    (`KIDS-RULING:388`).
22. **The probes' hosts.** A terms verdict for rdap.verisign.com or `*.netlify.app`; api.github.com has no entry of its own
    (github.com is `CONDITIONAL_MET`, `terms-verdicts.json:249-254`).
23. **Where the name goes.** A fold location for the kids name naming files, as T1's APPLY 3 did (`LINES-RULING:273-276`).
24. **Telling the owner.** How or when the owner is told the kids name. The only veto line is `kids-subbrand-check.md:20`;
    the owner meets the name when trying the handle at Stage A (`T1-PROTOCOL.md:123-125`); owner documents carry no
    sub-brand.
25. **Renaming.** Whether a YouTube channel name or handle can be changed after Stage A, or at what cost; only a snippet
    speaks to a Brand Account's channel name (`upload-automation.md:351`).
26. **Reading age.** Any evidence for "short topic words a child can read" (`KIDS-RULING:140`, "Part C 4").

*Row 25.*
1. **Why "after step 8".** The note's `:203`, `CHANNEL_LOOP.md:245` and the tick-40 log's `:20` give no reason, and no file
   says the click needs the brand mailbox. The nearby facts are in B(a), "What gates which deploy".
2. **Which cloud.** No file records the connector account's or organisation's cloud (EU or US), or whether a second
   organisation can be made in the other region from the same login. `site.json` defaults to EU (`:20`), and the reader
   refuses any other host (`page-views-reader.ts:65-69`, `:317-318`).
3. **The new organisation's plan.** No file says whether a new organisation starts on the free plan or on a trial; the
   note's REOPEN 3 counts a trial as paid (`queries.mdx:449`).
4. **No identity check.** No PostHog text says creating an organisation needs no card or identity check; the claim rests
   only on the note's `:203` (repo, recording a live read).
5. **The Default Project.** Nothing says what the minute-after list does with the "Default Project" a new organisation
   comes with (`projects.mdx:15`); the note's `:204` says `project-create`, and §6 that the colony "creates the project
   itself" (`:245`). Nothing says whether that project
   has GeoIP on at creation, or whether an organisation-level IP default set after creation reaches it (`organizations.mdx:63`
   says only newly created projects inherit).
6. **Terms 2.1(d).** No file weighs it ("circumvent or exceed … account limitations") against a second free organisation
   made to obtain a second free project. The only PostHog text tying a second project to payment is `projects.mdx:66`, in the
   project-move context; `terms-verdicts.json:576` holds only the reader's calls to 2.1; `MISSION.md:126-138` and
   `CHANNEL_LOOP.md:76` are applied to the organisation nowhere.
7. **Boost.** No source ties "Boost" to the project count. It appears only at `organizations.mdx:82` and `:110` (member
   governance; member-list visibility) and in `product-analytics/privacy.mdx:11` (US to EU migration).
8. **The connector's tools.** The repo has no record of the connector's tool list showing that no tool creates an
   organisation; `switch-organization` appears only at the note's `:204`.
9. **What a public token reveals.** Nothing says whether a `phc_` token or its project publicly reveals the organisation's
   name or the account behind it.
10. **ACCOUNT CAP's "NEW owner account".** No file applies it to a PostHog organisation inside an existing account; the
    nearest reading is the kids ruling's "click-set … not a new account" (`KIDS-RULING:341-346`; `BOARD-LOOP.md:17`).
11. **A proposed click in code.** Nothing in `owner-steps.ts` represents a proposed, not yet admitted owner click;
    `:99-101` keeps proposed steps out of the code. No PostHog organisation entry exists in `owner-steps.ts` or
    `OWNER_STEPS.he.md`. Three code texts say the project is the colony's, "never the owner" (`owner-steps.ts:130`), "not
    an owner step" (`products/il-biz-tools/README.md:398`) and "ours to set" (`:792`); no file reconciles them with an owner
    click before it.
12. **If the query API is charged.** No file says what happens to the organisation step itself; the REOPENs (note
    `:177-191`, `:205`; `DOCS-RULING:267`) speak only of the step-6 row and the reader. Nothing weighs the ruling's
    rejected-for-now alternative, a connector read from a scheduled session (`DOCS-RULING:262-263`), as a fallback beside
    Endpoints (note `:182`).
13. **`chartsplained`.** No config field holds its token, and no decision on shared or separate projects exists;
    `chartsplained` itself is pending the owner's veto (`netlify_files.py:30-31`; `CHANNEL_LOOP.md:138`).
14. **`projectId` in the list.** Files do say `projectId` is written (`DOCS-RULING:261`; note `:174`; README `:395-396`,
    `:792`; `owner-steps.ts:131-132`; `site.json:22`). The gap is narrower: the minute-after list at §6 `:245` and the
    note's `:204` name only "the project token", while the gate reads `projectId` (`owner-steps.ts:469`).

**Housekeeping for the Opus fold, not rulings.**

*Row 24's pointer drift* (repo; the checkers', confirmed):
- `FABLE_QUEUE.md:48`'s `T1-PROTOCOL.md:74-77` → P1 `:77`, P2 `:78`, P4 `:80` (moved at `dc2b45d`, 09:18:07Z, before the
  row was written; `:74` is blank). Its `render-watch.mjs:426` → `:536`.
- `render-watch.mjs:426` → `:536` also at `KIDS-RULING:329`, `:383`, `:515`, `:555` (`:555` gives `:426-428` → `:536-538`)
  [asm: and in the flags of `T1-PROTOCOL.md:77` and `:78`]. `:426` now holds `urls.txt`'s "not a valid URL" error; the
  array opens at `:521`. `termsBarred` → `:579-584` (doc line `:578`), cited as `:458-463` at `KIDS-RULING:515`.
- `KIDS-RULING:510`'s Stage A (`T1-PROTOCOL.md:86-114`) → `:89-132`; the section runs to `:133`, `## Recording` at `:134`.
  `KIDS-RULING:447`'s `T1-PROTOCOL.md:83-84` → `:86-87`.
- `KIDS-RULING:382` (`T1-PROTOCOL.md:75`, `:77` → `:78`, `:80`); `KIDS-RULING:366` and `:401` (`T1-PROTOCOL.md:72-84`,
  `:72-82` → table `:75-81`, fail rule `:83-87`) [chk]. [asm] Fold 7 (`:512`), "Not ruled here" 11 (`:564`) and the
  pointers note (`:582-583`) cite `T1-PROTOCOL.md:75`, `:77` the same way.
- The youtube.com verdict → `terms-verdicts.json:852-857`, cited as `:460-464` at `KIDS-RULING:354`, `:516` and
  `KIDS-LINE.md:182`. `KIDS-RULING:569-570`'s verdict pointers: youtube.com → `:852-857`, google.com → `:256-260` [asm:
  github.com `:114-118` → `:249-254`].
- `KIDS-LINE.md:311-313` (`:74`, `:75`, `:77`) → `:77`, `:78`, `:80`; `KIDS-LINE.md:251`'s `T1-PROTOCOL.md:72-82` → table
  `:75-81`, fail rule `:83-87`.
- `VIDEO-RULING:71` (`render-watch.mjs:350`) → `:536`; `VIDEO-RULING:224` (`:350-352`) → `:536-538`; `VIDEO-RULING:75`
  (`:337`, Gumroad) → `:522-527`.
- The 1.10 brief: `SITTING-2026-10-01-BRIEF.md:23-24` (`render-watch.mjs:426-428`, `termsBarred` `:458-462`) →
  `:536-538`, `:578-584`; its `:31-32` (google.com `:119-123`, youtube.com `:452-456`) → `:256-260`, `:852-857`.
- `brand-check.mjs`: `PROBES` `:49`, `lookups` `:81-86`, the YouTube URL `:84`, the refusal `:5-9` and `:70-79`;
  `KIDS-RULING:326-327` cite `:40-48` and `:46`, and `KIDS-LINE.md:181` `:46` [asm: the citing lines].
- `brand-check.yml`'s push trigger → `:24-29`, the `*-candidates.txt` glob at `:29`; cited as `:20-25` at
  `KIDS-RULING:330` and `KIDS-LINE.md:180` [asm: the citing lines].
- §6's Stage A item → `CHANNEL_LOOP.md:252-254`, cited as `:246-248` at `KIDS-RULING:308`, `:344` and `:478`.
- Every "still holds" entry of both checkers checked out (for example `ASSESSMENT.md:423-430`, which `T1-PROTOCOL.md:117`
  and `:120` cite).

*Row 25's pointer drift* (repo; the checker's, confirmed):
- Row 25's own `DOCS-RULING` `:250-270` → call 4 at `:249` [asm].
- `DOCS-RULING:257` and `:346` (`OWNER_STEPS.he.md:372-376`) → `:378-384` (rows `:380-384`; `:372-376` now hold part ב items
  1-4); `owner-steps.ts:316-321` → `:390-410` (the row `:404-409`).
- `DOCS-RULING:334` → `owner-steps.ts:283-304`.
- `DOCS-RULING:251` (`CHANNEL_LOOP.md:132`) → `:134` (`:132` is now a table separator); `page-views-reader.ts:305` is
  `const projectId`, and the no-op is at `:310`.
- `BOARD-LOOP.md:97`'s `README.md:180-196` → `:545-571` (the setup list `:392-405`).
- `BOARD-LOOP.md:17` says "beyond the seven" against "EIGHT" at `owner-steps.ts:18`.
- In the PostHog note: `page-views.ts` `:152` → `:158`; `:177-187` → `:178-193`; `:189-217` → `:195-223`; `:50` → `:52-55`
  (`:50` is the domain-period kill); `:41-48` → `:44-49`; `:424` → `:442`, `:446`, `:449`.
- `PREREG-DECISIONS.md:482`'s `page.py:32-36` → `:34-38`.
- Not moved: the reader's `:62`, `:264-269`, `:348`; `analytics.js:13-25`, `:45-46`; `site.json:22`; `page.py:26-30`;
  `PREREG-DECISIONS.md:591-596`.

*Corrections the checkers made to the clerks* (recorded so the fold does not re-introduce them):
- Row 24: the developers.google.com captures are `[against-bar]` by inference (`KIDS-RULING:240` names youtube.com and
  support.google.com lines only); "never as false" is at `youtube-madeforkids.ts:101`, `privacyStatus` is null whenever the
  status has no string value, and a body with no `items` list throws (`:108`); `experiments.ts:164-165` says "never the
  watch page" and `:246` "never a fetch of the watch page"; the Developer Policies counts are matching lines, not
  occurrences; `youtube-api-videos-insert.html` holds the ToS link twice, and `youtube-developer-policies.txt` holds the URL
  twice in its definitions; the policy scout's quote is `policy.md:317-322`; no googleapis call has been made (OVERREACH
  corrected); "Nothing is bought." is `MISSION.md:354`; the kids probe found 2 of 5 free on all three probes (all 5 on
  GitHub), and `CHANNEL_LOOP.md:140`'s "~09:40" does not match `measuredAt` 09:28:53Z; "no reading age" is at
  `KIDS-RULING:140` (and `:128`).
- Row 25: Terms 6.1's new charges come "at the end of the Initial Credit Term … or any then-current renewal term"; the
  clerks dropped that timing; `owner-steps.ts:99-101` names Mozilla (14) and PayPal (13), not npm (9); `netlify_files.py:30`
  → `:30-31`; the "query API" grep also hits `terms-verdicts.json:576`, and `CHANNEL_LOOP.md:341` and `:352` do not mention
  charging; the note never lists "four settings"; items resting on pinned copies are `github`, not "github, via note"; the
  connector-read lines are `repo`.

*Pointers this brief corrected or added* [asm]: the row-24 range was stale when the row was written (moved at `dc2b45d`,
written at `1789ad8`); `render-watch.mjs`'s "no request of any kind" sentence is `:518-519`; `K-policy` is
`KIDS-RULING:399-400`; the brand-check test's T1 rounds are `:285-287` and its ruling pin `:290`; `stayedPublic()` can
return false with no designation read (`:144`, `:172`), and the parse fixture `youtube-madeforkids.test.ts:80` pairs a
null designation with "private"; `MISSION.md`'s never-sentence runs to `:439`; `TERMS-AUDIT:119` breaks off at "If it
ever"; the 6.10 robots ruling's reading of "anything public" (`ROBOTS-RULING:360-362`) and its fold 10's scope
(`:413-415`); the domain-clock ruling's "a new PostHog project or token … is a new instrument" (`CLOCK-RULING:111-112`);
the `termsBarred()` run widened to the PostHog, RDAP, GitHub API and Netlify hosts; no YouTube-side capture is frozen or
trimmed, and their fetch times; the Default Project against the one-project limit (inference); `page.py:4-5` against
`BOARD-LOOP.md:117` on the deploy host; tick 57's plan names no brief build (`CHANNEL_LOOP.md:426`).
