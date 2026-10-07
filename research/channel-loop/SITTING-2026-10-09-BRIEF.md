# Brief for the Fable sitting of 9.10.2026 (~07:11 UTC): FABLE_QUEUE row 28

**What this is.** Opus clerks gathered the evidence for row 28 (derived metrics under the YouTube API Services Terms) in
three lists, and an Opus checker re-opened every pointer with `sed -n`, `awk 'NR>=…'`, `grep -n -F` or `git show` against
the tree at `74b9bce` and corrected what had moved or overreached. `git log -1 --format=%h` gave `74b9bce` at the start and
the end of the checker's reads, and `git status --short` was empty both times. The checker ran no git write and no stash,
made no network call and started no subagent; it wrote one scratch file outside the repository, in its own session
scratchpad (a list mapping each line of the excerpt to its original line), and recorded that as a breach of its
read-only rule. An Opus assembler wrote this file on `74b9bce` [asm: in a worktree on `build/tick63-brief`, cut from
`origin/claude/new-session-j071dx` at that commit]. It re-opened every header pointer and a sample of more than twenty
others, and marks what it added or corrected **[asm]**. Nobody here rules or recommends. No web fetch was made for this
brief, no connector was called and nothing was created anywhere. [asm] The assembler's own code runs were read-only:
`activeSlugs()` from `scripts/freeze-capture.mjs` over `research/rendered/urls.txt`; `git check-ignore` on the three
YouTube state paths; `git show` and `git merge-base --is-ancestor` on past commits; and `grep -c` over the rendered
Developer Policies capture (counts only, no line read).

**Grades** (as `research/channel-loop/SITTING-2026-10-05-BRIEF.md:15-18`, with the 8.10 brief's additions).
- `rendered`: a render-watch capture that a session read.
- `github`: code or docs read on GitHub at a pinned commit; where a note quotes GitHub, the note is the pointer ("github,
  via note"). Every `OTA:n` below is github, via note: the note is EX (short names). `rendered via note`: a note quoting
  a capture; the note's line is the pointer.
- `repo`: our own code or notes, EX's own answers and memo among them. `repo (git objects)`: a past version read from the
  local object store, as of the last local fetch; no fetch was made.
- `inference`: reasoning, not a text, always marked. `none`: no source.

**Provenance marks.**
- **The Terms copy.** EX is "a GitHub-hosted text (github grade)" (EX:1) pinned at commit `80db0630` (EX:6). It was
  fetched into a scratch folder and "never committed" (EX:8); its sha256 is at EX:9. It quotes "68 of the 1,270 original
  lines" (EX:12), each block one line, with headings at EX:16-485; EX:12 also says the address line is never quoted.
  googleapis.com carries `"copying": "barred"` (`research/channel-loop/terms-verdicts.json:267`), so this brief: writes
  `OTA:n` only for a line EX quotes, always with EX's own line beside it; quotes at most one short clause of any OTA line;
  never cites the address line; and describes in words, with EX's line, a clause EX cites by pointer only.
  Open Terms Archive's own repository licence is unread (EX:11, :547).
- **`[against-bar]`** (D1(1), `research/channel-loop/RULING-2026-09-30-video.md:27-31`) marks the developers.google.com
  captures taken before the bar: "those stay barred and their captures stay D1(1)" (T1-RULING:254-255). They are
  readable for "(i) a question about our own compliance" and "(ii) a decision not to do something" (VIDEO-RULING:29-30).
  This brief names two kinds and cites neither by line: the rendered Developer Policies capture
  (`research/rendered/youtube-developer-policies`) and the ten developers.google.com/youtube captures.
- **Frozen, live and trimmed** [asm]. `research/rendered/FROZEN.sha256` is 255 lines and holds no youtube or
  developers.google.com entry; `activeSlugs()` over `urls.txt` gives 66 active slugs, none a YouTube capture; the ten
  developers.google.com/youtube metas carry no `trimmed` block. So every capture here is described in words, with counts.
- **The older download** (github, via note). A 25.9 scout note quotes an earlier download of the same file (sha256
  `af8ea9ab…`, commit `8fd72b3`; `research/faceless-youtube/scouts/discovery.md:13` [asm: the provenance line]). Its
  bracketed line numbers belong to that file, not to EX's `OTA:n`.

**Short names.**
- `EX` is `research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md`. `OTA:n` is original line n of the pinned
  file. EX's six answers (i)-(vi) are EX:496-518; "the memo" is its Verdict, EX:520-538 (conditions 1-8 at EX:529-536);
  "EX's notes" (a)-(e) are EX:540.
- `T1-RULING` is `research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md`; `VIDEO-RULING` is
  `research/channel-loop/RULING-2026-09-30-video.md`.
- `T1-PROTOCOL.md` is `research/faceless-youtube/T1-PROTOCOL.md`; `KIDS-LINE.md` and `ASSESSMENT.md` are under
  `research/youtube-kids/`.
- "The module" is `src/revenue/youtube-madeforkids.ts`; "the read-back" is `scripts/youtube-madeforkids-readback.ts`;
  `experiments.ts` and `publisher-guard.ts` are under `src/revenue/`. "The analytics reader" is
  `scripts/youtube-analytics.ts`; "the analytics module" is `src/revenue/youtube-analytics.ts`. "The colony workflow" is
  `.github/workflows/colony.yml`. The tests are under `src/__tests__/revenue/`.
- "The state file" is `state/colony/measurements/<line>-madeforkids.json` (the read-back's `:99-103`); "the analytics
  output" is `state/colony/measurements/youtube-analytics.json`; "the uploads file" is
  `state/colony/measurements/youtube-videos.json`.
- P-2 is the override kill (`experiments.ts:199-210`); P1-P5 are T1-PROTOCOL's checks (`:79-83`); K-mfk-designation is
  the kids line's kill (`experiments.ts:270-277`).

**Who reads what.** The row-28 decider reads Part A and Part C, and the header blocks: this one, the standing rules and
the links. [asm] There is no Part B: one row sits.
- **The seat.** "one decider (9.10 ~07:11, the next free seat; 8.10 holds rows 26 and 27)" (`logs/FABLE_QUEUE.md:52`).
  The tick-63 plan: "9.10 ~07:11: row 28 (derived metrics under the YouTube API Terms), whose brief is built in a tick of
  8.10; then tick-61 item 1's two builds." (`logs/CHANNEL_LOOP.md:461`); `:463` names the seat too. [asm] This brief was
  built on 7.10, in tick 63. The schedule line `CHANNEL_LOOP.md:26` runs to 8.10 and does not name row 28.
- **The output.** "a ruling in `research/channel-loop/`". Then: "fold into `youtube-madeforkids.ts`, `experiments.ts`,
  the read-back's state shape, the googleapis.com note and Stage A's key line (`T1-PROTOCOL.md:116-120`)"
  (`FABLE_QUEUE.md:52`).
- **The status.** "queued 7.10 (tick 61, from the API terms read under row 24's ruling §2 decision 2)".
- **The row's own pointers.** EX holds. T1-RULING §2 decision 2 and amendment 1 hold. `experiments.ts:285` is stale, and
  was stale when the row was written; `T1-PROTOCOL.md:116-120` has moved (both under Part A and Part C).

**Standing rules (repo).**
- **MISSION first.** `MISSION.md` is read before anything else (`CLAUDE.md:4`).
- **Rule 1.** One ordered checklist; "Never invent a step that isn't required."; "**Never** open an account in the
  owner's name, answer an identity check, or mark setup done on our own initiative." (`MISSION.md:435-439`, heading `:431`).
- **Rule 3.** Decisions live in code "precisely so any auditor can recompute them from the same numbers and catch drift"
  (`MISSION.md:450-451`).
- **Rule 4.** "Honest value only — this outranks the target"; "no ToS violations" (`MISSION.md:454-455`).
- **Rule 5.** "Every line carries KPIs, kill criteria and scale criteria" (`MISSION.md:462`).
- **The standing consent** "does not reach the owner's own clicks: identity, payout, and anything bought"
  (`MISSION.md:349-350` [asm: the sentence ends at `:350`]); "**Nothing is bought.**" (`:354`); "No step that costs the
  owner anything is asked for until its cost is checked" (`:356`).
- **Never** (`CHANNEL_LOOP.md:79`): "a keyed API call to a host whose API terms are unread (ruling 7.10 row 24 (b), …)".
- **The sitting.** At most 2 agents (`CHANNEL_LOOP.md:51`).
- **The repository.** "The repo is public" (`CHANNEL_LOOP.md:255-256`), not checked live; its visibility is the owner's
  open decision (`:255-257`).

**How the three questions touch. Read these before ruling.**
1. **The second turns on the first.** EX's answer (iii) splits what the state keeps into raw values, the colony's own
   timestamps and verdicts, and derived data, and leaves the last to a sitting: whether the derived verdicts, times and
   override count "may be made and kept at all … is not decided here" (EX:506).
2. **The third is the one-client ruling's consequence.** The memo rules the colony one API Client and sends the analytics
   output's exclusion from the public repository to "condition 2's build" (EX:534), the same build as the read-back's
   30-day retention.
3. **Both builds wait on this row.** "the privacy-policy and terms page and the read-back's 30-day retention both turn on
   what the derived-metric ruling allows to be stored and for how long, so building either first would build twice; they
   are the first build after row 28's fold" (`CHANNEL_LOOP.md:399` item (2); in Hebrew,
   `logs/2026-10-07-channel-loop-tick-62.md:22`).
4. **Before Stage A.** "Ruled before Stage A is asked." (`FABLE_QUEUE.md:52`); memo condition 2 (EX:530). Stage A is
   "(NOT asked yet)" (`T1-PROTOCOL.md:91`).
5. [asm] **Handed to this sitting beside the row.** `CHANNEL_LOOP.md:395` item (6) gives this sitting google.com's
   `copying` field, or the trim's reach (Part C, first block).

---

## Part A — Row 28: derived metrics under the YouTube API Terms (`FABLE_QUEUE.md:52`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:52`): "`research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md`
(OTA:596(ii), :598, :303, :602, :1176 — the derived-metrics clause and the Made-for-Kids reads the Terms expect),
`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` §2 decision 2 and amendment 1,
`src/revenue/experiments.ts:285` (the per-channel override count, kill at two), `src/revenue/youtube-madeforkids.ts` (the
stored verdicts, times and `firstRead`), `research/channel-loop/terms-verdicts.json` (googleapis.com, CONDITIONAL_UNMET)".

**The row's question, verbatim** (`FABLE_QUEUE.md:52`): "The YouTube API Services Developer Policies bar creating "new or
derived data or metrics" from API Data (OTA:596(ii), absolute under :303; the example at :598 is "a score that factors in
… any other API Data"), while the Terms expect clients to read Made-for-Kids status through the Data API and act on it
(OTA:602, :1176). The colony's state keeps per-upload verdicts and times derived from `status` reads and a per-channel
override count with a kill at two. Which of these, if any, is a derived metric the Policies bar; what the state may keep
past 30 days (OTA:584) — the colony's own timestamps and verdicts, or only raw values refreshed each run; and whether the
one-API-Client ruling (OTA:448) brings the analytics reader's Authorized Data duties (OTA:550, :576-578) onto the same
state file. Ruled before Stage A is asked."

[asm] The row's OTA lines in EX: :596 is EX:307, :598 EX:314, :303 EX:146, :602 EX:321, :1176 EX:489, :584 EX:300, :448
EX:216, :550 EX:272, :576 EX:279 and :578 EX:286.

**[asm] The labels.** The row asks three questions. This brief gives each its own section: A(1) which of the stored
verdicts, the times and the override count, if any, is a derived metric the Policies bar; A(2) what the state may keep
past 30 days; A(3) whether the one-client ruling brings the analytics reader's Authorized Data duties onto the same state
file. A(0) is what exists today, which all three read.

**The row's own pointers, re-opened.**
- EX: every OTA line the row names is quoted at the EX line above.
- T1-RULING §2 decision 2 is `:256-277`, in §2 (`:161-301`): its RULING is `:249-293` and "What this does not decide"
  `:295-301`. Amendment 1 is `:658-685`: its decisions `:670-683`, and the build's note `:685`.
- `experiments.ts:285` → `:289`, moved before the row's commit (Part C).
- The module holds: the stored types are `:47-94`, the merge `:147-173`.
- `terms-verdicts.json`: googleapis.com is `:262-268`, `"verdict": "CONDITIONAL_UNMET"` at `:263`.
- The fold's `T1-PROTOCOL.md:116-120` → `:118-122` (Part C).

### A(0) The state today (repo unless marked)

**What one read stores** (`MadeForKidsReading`, the module `:47-60`): `{id, returned, madeForKids, privacyStatus,
readAt}`. `madeForKids` is the API's boolean re-encoded as the strings "true"/"false", or null (`:131`); `privacyStatus`
is the API's string, or null (`:132`); `returned` is the colony's own `item !== undefined` (`:133`); `readAt` is the run's
`now` (`parseVideosList`'s argument, `:121`; the read-back passes `run.now` at its `:176` and `:211`).

**What the state keeps per upload** (`UploadReadback`, `:62-86`; merged at `:147-173`).
- `firstRead` `{readAt, returned, privacyStatus}`: "Written once and never changed." (`:68-69`; type `:71`; write `:163`).
- `first`: the first read that carried a designation (`:72-76`, `:164`).
- `latest`: every read replaces it (`:77-78`, `:165`).
- `contradictedAt`: when a read first carried the designation the line does not declare; "Never cleared by a later read
  or by the one appeal." (`:79-83`, `:166`).
- `leftPublicAt`: when a read first found the upload not public right after a public one (`:84-85`, `:167`); never
  cleared, as the header says (`:18-19`).
- File level: `experiment`, `declaresMadeForKids`, `updatedAt` and `videos` (`:89-94`); `updatedAt` is the run's `now`
  (`:172`).
- De-listed uploads: "any earlier entry whose upload left the list (kept as it was)" (`:141`; `:171`).

**Stored value → source → reader** [asm: the assembler's table, from the code; the checker confirmed clerk A's table at
HEAD with two notes, that `first` and `latest` also carry `id` and `returned` and that no code reads `firstRead.readAt` or
`updatedAt`, and both are carried here].

| Stored field | Set from | Its kind | Read by |
|---|---|---|---|
| `firstRead.privacyStatus` | the first read's `status.privacyStatus` (`:132`, `:163`) | raw API value | `firstUploadWindow`, P1 (`:245-246`) |
| `firstRead.returned` | `item !== undefined` (`:133`, `:163`) | the colony's fact about the response | `firstUploadWindow`, P1 (`:245`) |
| `firstRead.readAt` | the run's `now` (`:163`) | the colony's clock | no code |
| `first`, `latest` | a whole reading (`:164-165`): `id`, `returned`, `madeForKids`, `privacyStatus`, `readAt` | raw API values with the colony's fields | `readbackOf` (`first.madeForKids`, `:185`); `stayedPublic` (`privacyStatus`, `readAt`, `:200-201`); the merge (`latest.privacyStatus`, `:167`) |
| `contradictedAt` | `r.readAt`, when a designated read differs from the declaration (`:166`) | a colony timestamp set by an API-value condition | `readbackOf` (`:185`) |
| `leftPublicAt` | `r.readAt`, when the last read was public and this one is not (`:167`) | a colony timestamp set by an API-value condition | `stayedPublic` (`:199`) |
| `updatedAt` | the run's `now` (`:172`) | the colony's clock | no code |
| `experiment`, `declaresMadeForKids` | the line (`:102-104`; `DECLARES`, `:44`) | the colony's own | the merge (`:153`); `readbackOf` (`:181`) |

**Computed in memory, never stored.**
- `readbackOf` (`:180-186`): per upload, the contrary designation once `contradictedAt` is set, else `first.madeForKids`,
  else null. It is `ExperimentReadings.madeForKidsReadback` (`experiments.ts:66`).
- `stayedPublic` (`:198-202`): P2 and K-T1k. `firstUploadWindow` (`:235-253`): P1-P4 and `passed`, which is `t1Passed`
  (`experiments.ts:32`).
- **The override count:** `readback.filter((v) => v === "true").length` (`experiments.ts:289`), against `mfkKillAt`
  (`:283`), which is `MADE_FOR_KIDS_OVERRIDES = { killAt: 2 }` (`:210`), pre-registered 30.9 (`:200`). At two or more it
  fires K-mfk (`:290-292`), whose note carries the number (`:292`); at one, K-mfk-override (`:293-295`), whose note carries
  none. The field's doc is `:45-65` and the field `:66`; "since 4.10 the count is derived from this list, never typed in
  beside it" (`:55-56`).
- On the kids line any "false" kills (K-mfk-designation, `:270-277`).

**What is stored can differ from YouTube's current value** [checker's addition]. The readback entry keeps the contrary
designation once a read carried it: "that read is kept whatever later reads or the one appeal say" (`experiments.ts:48-50`).
P-2 counts "when YouTube sets them, whatever the one appeal later decides" (`:54-55`; the module's header `:13-15`).
[inference] A stored or derived value can then disagree with what YouTube now returns.

**Where the state would go.**
- The read-back reads the uploads (`:147`) and the prior state (`:148-150`), then merges and writes the state file
  (`:183-185`). `readbackOf` is printed to stdout only (`:186-190`).
- The colony workflow runs `git add -f state/colony` (`colony.yml:87`) on an hourly cron (`:23`); it "commits the resulting
  state and report back, so the owner can read every decision in the git history" (`:3-5`).
- Nothing ignores it. None of `.gitignore`'s 25 lines matches the state file, the uploads file or the analytics output; the
  only state rule is `*.db` with the `!state/colony/colony.db` exception (`:6-8`). `git check-ignore` exits 1 for all three
  [asm: re-run].

**What runs today.**
- **The gates.** The read-back refuses unless googleapis.com's verdict is active-eligible (`:123-131`); `ACTIVE_VERDICTS`
  is NOT_BARRED, CONDITIONAL_MET and NO_TERMS_ROBOTS_OK (`scripts/queue-zero-test.mjs:110`), and googleapis.com is
  CONDITIONAL_UNMET (`terms-verdicts.json:263`), checked 2026-10-07 (`:265`). It refuses next without the key (`:133-137`).
  It checks the host (`:161`), fetches with `redirect: "error"` (`:163`), and redacts the key in log lines (`:142`, `:173`,
  `:178`).
- **No workflow.** No workflow or package script runs the read-back (`youtube-madeforkids.test.ts:645-651`; the read-back
  `:27-28`). [asm] No workflow and no `package.json` names `YOUTUBE_DATA_API_KEY`.
- **The file has never existed** (repo; repo (git objects)). `git ls-files state/` lists six files, and
  `state/colony/measurements/` holds only `algora-supply.json` (last commit `2a2d422`, 2026-10-05). `git log --all` finds no
  YouTube state path ever. "the read-back has never run live" (T1-RULING:685).
- **Who would read it.** `evaluateExperiment` (`experiments.ts:239`) is called by `experimentStateOf` and `assertMayUpload`
  (`publisher-guard.ts:122-125`, `:242`). "No publisher exists." (`:4`). Nothing in that module reads a file or the network
  (`:37-38`). No non-test code calls `assertMayUpload`, `experimentStateOf` or `firstUploadWindow` (`git grep`; the other
  hits are comments, rulings and logs).
- **Ingest.** The tick ingests only `apify-runs.json` and `algora-supply.json` (`src/revenue/measurements.ts:73`, `:101`);
  `state/colony/colony.db` and `state/colony/REPORT.md` hold 0 YouTube strings.

**The horizon.** On `FACELESS_YOUTUBE_EXPERIMENT`, `k3Day: 112` (`experiments.ts:149`) and `k3ExtensionDay: 196` (`:152`);
the kids spec has the same values (`:190`, `:193`). [inference] P-2's count runs past 30 days.

**Embedding.** The web-arm tests forbid `<iframe>` and `<embed>` (`products/chart-explainer/tests/test_page_and_scope.py:30-31`;
`products/chart-explainer/tests/test_page_counter.py:74`). KIDS-LINE says the kids channel has "no embedding page with a
counter" (`:139-140`), which is not a statement that no page embeds [checker's correction]; the kids line has no web arm,
and "a page embedding a made-for-kids video must have tracking off" (`:244-246`). [inference] No current page embeds a
YouTube video; that rests on the chart-explainer tests only.

### A(1) Which of the stored verdicts, the times and the override count, if any, is a derived metric the Policies bar?

**The clause** (github, via note).
- **OTA:596 (EX:307)**, III.E.4.h. Part (i) bars replacing API Data with similar data the client calculated itself. Part
  (ii) bars using API Data to create "new or derived data or metrics". The second sentence requires a clear and prominent
  disclosure wherever information or metrics not based on API Data are shown beside API Data.
- **OTA:598 (EX:314)**, the example. A client displays the number the API returns and does not substitute its own count.
  It may not use the returned number to calculate other metrics; the examples are a percentage made through the client and
  "a score that factors in … any other API Data". Its own count may be shown beside YouTube's total if the client says
  clearly that it calculated it.
- **OTA:303 (EX:146)**: the term *must not* "refers to an absolute prohibition". **OTA:302 (EX:139)**: the term *must*
  names an absolute requirement.
- **Aggregation. OTA:538 (EX:265)** bars aggregating API Data except for channels "under the same content owner" that
  YouTube recognises under content licensing agreements, and then viewable by that owner only.
- **III.L. OTA:774 (EX:391)** applies its policies only to "audited developers with analytics use cases" who have applied,
  through the quota extension request (from June 1, 2026), to create additional metrics or store statistical data. The page
  it links to, on derived metrics and data storage, is unread (EX:545).
- **By pointer only.** EX:518 cites a clause barring the use of API Data to gain insight into YouTube's business, and reads
  the measure of YouTube's overrides under it as "[inference, weak]". The clause is not in EX.

**The reads the Terms expect** (github, via note).
- **OTA:602 (EX:321)**, III.E.4.j: a client must look up the Made for Kids status of "each YouTube video that it embeds",
  and for each one designated made for kids turn off tracking and keep data collection lawful (COPPA and GDPR are named).
- **OTA:1176 (EX:489)**, the Revision History: check the status through the Data API "before embedding it".
- [checker's addition] **OTA:437 (EX:209)**: some services support non-authorized requests. **OTA:457 (EX:230)**: the Data
  API example is a search for public videos that needs no user authorization. [asm] EX relies on the two at EX:518 (answer
  (vi)) and in the memo's "Why not BARRED" (EX:526), not at EX:506; answer (iii) classifies the keyed reads through OTA:793,
  :797, :789 and :783 (EX:426, :440, :419, :405), with its own inference that a key is an API Credential.

**The candidates, as the code has them** (A(0)).
- Per-upload verdicts computed in memory: `readbackOf` (`:180-186`), `stayedPublic` (`:198-202`) and `firstUploadWindow`
  (`:235-253`), whose `passed` is `t1Passed`.
- Stored times set by an API-value condition: `contradictedAt` (`:166`) and `leftPublicAt` (`:167`).
- The per-channel count (`experiments.ts:289`), with its kill at two (`:210`, `:290-292`). [asm] The count is stored
  nowhere today; `ExperimentState` would store the readings and the verdict they give (A(3)).

**What EX says of each** (repo).
- **Answer (iii), part (3)** (EX:506). The count "fits that example on its literal words, and is arguably an aggregate"
  (OTA:598, :538; EX:314, :265). The per-video lookup-and-act checks (P1, K-mfk-designation) "have the better argument",
  from OTA:602 and :1176 (EX:321, :489). The colony's timestamps and verdicts "are not API Data on the definition"
  (OTA:799 (iii), EX:447), but a field that only restates a returned value is that value in another form, and "the safe
  reading keeps it under the same 30-day limit [inference]" (part (2)).
- **Answer (iii)'s bearing** (EX:506). Whether the derived verdicts, times and count "may be made and kept at all … is not
  decided here: a Fable sitting rules before Stage A, and until then the literal reading stands".
- **Answer (vi), part (3)** (EX:518). The read-back would derive `contradictedAt` and `leftPublicAt`, `readbackOf` and
  `stayedPublic`, and the count fits OTA:598's example (EX:314) and is arguably an aggregate. Its bearing: "the derived
  count is barred on the literal words of OTA:596 (ii) and :598 until the sitting rules" (EX:307, :314).
- **The memo, condition 2** (EX:530). It puts the derived verdicts and times and the count under OTA:596 (ii), :598 and
  :303 (EX:307, :314, :146), and says "NOT decided here: a Fable sitting rules before Stage A (new FABLE_QUEUE row)".
  Its `experiments.ts:285` is `:289` (EX's note (a), EX:540). The googleapis.com note cites `experiments.ts:289`
  (`terms-verdicts.json:266`).

**What rests on the count** (repo).
- P-2: the first override sends the video private with one appeal and flags the board; the `killAt`-th kills that channel's
  line (`experiments.ts:199-210`). MISSION rule 5 asks for kill criteria (`MISSION.md:462`), and rule 3 for decisions an
  auditor can recompute (`:450-451`).
- [asm] The code's own doc calls the count "derived from this list" (`experiments.ts:55-56`), in the code's sense (computed
  from the read-back, not typed in). No file reads that word against OTA:596 (EX:307).

**The analytics reader's own derived readings** [checker's addition] (repo).
- `medianStrangerViews` and `strangerWatchHours28d` are computed from the Analytics API's tables (the analytics module
  `:129-145`); K0 and K3 read them (`experiments.ts:311-342`).
- The Search diagnostic `averageViewPercentage` is "DERIVED — not the API's `averageViewPercentage`" (the analytics module
  `:137-142`). T1-PROTOCOL: the diagnostic "is derived (minutes over views × our video length) and labelled so"
  (`:113-116`).
- No file weighs these against OTA:596 or :598 (EX:307, :314; Part C).

**Older and rendered texts** (not read by line here).
- The 25.9 note quotes, from the older download, the business-insight clause (`discovery.md:220-221`) and records the
  Revision History's examples of derived metrics (`:225-227`) (github, via note; older file).
- The rendered Developer Policies capture (`[against-bar]`, D1(1); its text last committed `6a2dadd` on 25.9, its meta
  re-fetched 29.9 at 11:27 UTC in `f9a41c6`) holds, by `grep -c` alone, wording that matches section IV's definitions and
  the consistency and business-insight clauses EX cites by pointer only.

### A(2) What may the state keep past 30 days?

**The rule** (github, via note).
- **OTA:584 (EX:300)**, III.E.4.d. Non-Authorized Data may be stored temporarily, in limited amounts, for as long as the
  client needs it but "not longer than 30 calendar days", then deleted or refreshed.
- **Definitions.** Non-Authorized Data is API Data a client can reach without User Credentials (OTA:793, EX:426).
  Authorized Data is API Data an active user expressly authorizes a client to use through User Credentials (OTA:789,
  EX:419). User Credentials are those issued to users so a client can act on their behalf (OTA:797, EX:440).
- **For Authorized Data (III.E.4.b-c).** Data of the statistics kind may be kept past 30 days with a check every 30 days
  that the authorization still stands (OTA:576, EX:279); the example is view counts, with a check every 30 days that "the
  video has not been deleted" (OTA:578, EX:286). Other Authorized Data is kept for "no longer than 30 calendar days", then
  deleted or refreshed (OTA:582, EX:293). [checker] The III.E.4.b line that names statistics is not in EX; EX:506 cites it
  by pointer only.
- **On a suspension.** On "any suspension, notice of any discontinuance, or termination", stop using all YouTube Property
  and delete all API Data, and certify the deletion on request (OTA:245, EX:118; YouTube Property is defined at OTA:163,
  EX:97).

**EX's answer (iii)** (EX:506; repo).
- The status read without user credentials is Non-Authorized Data, under III.E.4.d and not the statistics line.
- **(1) Raw values.** Refreshing satisfies "refresh" in the working tree, but every committed value stays in git history,
  stored past 30 days "whatever the refresh [inference: git history is storage]"; "raw values should not be committed at
  all". `firstRead`, `first` and the de-listed entries are never refreshed and break the rule after 30 days even outside
  git. [checker: missed by the clerks] "a purge must run even when the reads stop, or "latest" goes stale after 30 days".
- **(2) The colony's own timestamps and verdicts.** Not API Data on the definition, but kept under the same limit on the
  safe reading [inference]. `contradictedAt` is "Never cleared" by design, and "P-2's kill-at-two needs an override record
  that can outlive 30 days: the 72-hour checks (P2, K-T1k) fit inside 30 days, P-2 does not".
- **(3) Derived data.** A(1).
- **(4)** [checker: missed] Reading through the owner's OAuth instead of the key "would not help": OTA:582 (EX:293) caps that
  data at 30 days, and OTA:550 (EX:272) is added.
- **The conclusion.** "only the colony's own facts that encode no API value are safely kept past 30 days; raw values, and
  verdicts that restate them, are not".
- **The bearing** [checker: missed]. Unmet in today's code (memo condition 2). "A stated code change meets the storage
  part: raw values stay in the run's memory and are never committed, and anything stored is purged at 30 days by a purge
  that runs even when the reads stop." The derived items' fate "is not decided here" (A(1)).

**EX's other answers on storage** (repo).
- **Answer (vi)** (EX:518): once live, the read-back writes the raw values into the state file the workflow commits,
  against OTA:584 (EX:300) [inference: git history is storage], doubtful under ToS §8 and III.E.5 (OTA:86, :606, :608,
  :610; EX:76, :328, :335, :342), and on a literal reading against III.G.1.a, the bar on redistributing "all or any
  portion of YouTube API Services" (OTA:661, EX:363), API Data being part of them (OTA:799 (iii), EX:447). It keeps
  `firstRead`, `first` and de-listed entries forever (the module `:163`, `:164`, `:171`).
- **Answer (v)** (EX:514) [checker's addition]: on any suspension the colony must at once delete all API Data and certify
  the deletion on request; "that kill path is not built".
- **The memo, condition 2** (EX:530): the never-refreshed first read and the kept de-listed entries break the 30-day rule;
  raw field values must never be committed to the public repository [inference: git history is storage]; "code change
  (Opus build, queued)".

**What the colony's own texts ask to keep** (repo).
- **T1-PROTOCOL's Recording:** every reading "is kept in the repo with its timestamp and source" (`:138-139`).
- **T1-RULING §4 decision 3:** "The four readings and their `readAt` are recorded beside `t1Passed`" in the experiment's
  state when the publisher build writes it, so an auditor re-derives the verdict (`:444-446`). §4 leaves open "the shape of
  the state file past 30 days" (`:451`); the collected list repeats it (`:590`).
- **T1-RULING decision 3(iv):** the Developer Policies bind the colony as an API Client from the day the key exists, with
  "the retention rule as the reader settles it under decision 2(iii)" (`:286-289`); "every answer under decision 2 is the
  reader's" (`:295-296`).
- **MISSION rule 3** (`MISSION.md:450-451`), and P-2's horizon past 30 days (A(0)) [inference].

**What the queued build would do** (`CHANNEL_LOOP.md:395` item (1)): "an Opus build on the read-back's state: refresh or
purge at 30 days, de-listed entries purged, raw fields never committed; the analytics reader's Authorized Data output
likewise, OTA:550, :576-578" (EX:272, :279, :286). It waits on this row (`:399` item (2)).

**Purge code today.** Grepping the four reader files for purge, 30 days, delete, expire or retention finds only the
token-expiry hint at `scripts/youtube-analytics.ts:69` [asm: re-run].

**Whether `readAt` is API Data.** Only EX:506's inference answers it (Part C).

### A(3) Does the one-client ruling bring the analytics reader's Authorized Data duties onto the same state file?

**The clause** (github, via note).
- **OTA:448 (EX:216)**, III.D.1.c: "exactly one (1) API Project" per API Client, and one project may not be shared between
  clients. API Client (OTA:781, EX:398), API Credentials (OTA:783, EX:405) and API Project (OTA:787, EX:412) are defined in
  section IV. The Upload Project exception is OTA:757 (EX:384).
- **OTA:550 (EX:272)**, III.E.3.b: no display of, or access to, Authorized Data for "anyone other than the authorizing user"
  or agents that user expressly approved.
- **OTA:576, :578 and :582 (EX:279, :286, :293)**: A(2).
- **Suspension.** A suspension may cover the credentials (OTA:57, EX:48); while the credentials or the Google account that
  created them are suspended, no access by any means (OTA:516, EX:258).

**The ruling it rests on** (repo).
- **The memo, condition 6** (EX:534): "ruled here — the colony is ONE API Client (one repository, one owner, one purpose)";
  the two readers share the one analytics-only project, with no second project. Its consequence: the analytics reader's
  Authorized Data duties bind the same client, and "its output must not reach the public repository: queued with condition
  2's build". EX's note (e) (EX:540) qualifies the memo's shorthand for OTA:550 (EX:272).
- **Answer (ii)** (EX:502). The text "gives no test for where one client ends"; the Upload Project exception "is not
  this case"; one client is "the natural one [inference]". Its consequences: one privacy policy covers both readers,
  with the owner as the user of the analytics consent; one suspension stops both (OTA:57, EX:48); and OTA:550, :576,
  :578 and :582 (EX:272, :279, :286, :293) bind the client. Once wired, the analytics output "would be shown to anyone
  [inference: a public repository is display]". [checker] OTA:582's 30-day cap (EX:293) comes from answer (ii);
  condition 6 names only OTA:550 and :576/:578 (EX:272, :279, :286).
- **Answer (i)** (EX:498): the user-facing duties are owed, because the owner holds User Credentials for the analytics
  consent (OTA:797, EX:440); "None of it is met today".

**The analytics reader** (repo).
- **Credentials.** `YT_ANALYTICS_CLIENT_ID` and `YT_ANALYTICS_CLIENT_SECRET` belong to "an analytics-only Google Cloud project
  on the brand account"; `YT_ANALYTICS_REFRESH_TOKEN` is "one consent for `yt-analytics.readonly`, nothing else" (`:6-7`,
  checked at `:83`). Without them it prints a notice and exits 0 (`:84-87`).
- **Output.** It writes the analytics output (`:110-115`) as `{ measuredAt, window, readings, raw: { trafficTable,
  watchTable } }` (`:114`), overwritten each run (`:112`). The readings are defined at the analytics module `:129-145`; the
  queries are at `:69-76` and `:83`.
- **Gates.** No terms or verdict gate exists in the script (grep: 0).
- **Endpoints.** The discovery document on accounts.google.com (`:35`, `:51`), then a refresh-token grant (`:54-63`), then
  the reports endpoint (the analytics module `:23`; the script `:75`). T1-RULING: the discovery document is "under
  `google.com`", and "a document on a barred host is not this row's; the main thread queues it with the terms read"
  (`:298-301`). google.com is in `TERMS_BARRED` (`scripts/render-watch.mjs:537`). No queue item names it [asm: grep of
  `CHANNEL_LOOP.md`, `FABLE_QUEUE.md` and `logs/CHECKPOINT.md` for accounts.google.com: 0].
- **Revocation.** The token is refreshed every run; `invalid_grant` is the only revocation signal in code (`:50-72`)
  [inference]. OTA:490 (EX:237) asks every client to delete a user's API Data when consent is revoked and to reconfirm its
  tokens periodically.
- **Wiring.** No workflow sets `YT_ANALYTICS_*` or runs the script [asm: grep of `.github/` and `package.json`: 0]; the
  colony's env names are at `colony.yml:61-70`. `youtube-analytics.test.ts` has no workflow assertion.

**What the two readers share** (repo).
- **One input.** Both read the uploads file: the analytics reader (`:8`, `:88-97`) and, for faceless-youtube, the read-back
  (`:11-13`, `:101`). No code writes it (T1-RULING:590).
- **One project.** Both name it: the analytics reader `:6`; the read-back `:7-8`; T1-PROTOCOL `:107`, `:119`.
- **One type** [checker's addition]. `ExperimentReadings` (`experiments.ts:20-69`) holds values from both readers: from the
  analytics reader `medianStrangerViews` (`:36`), `strangerWatchHours28d` (`:38`) and `averageViewPercentage` (`:40`), which
  K0 and K3 read (`:311-342`); from the read-back `madeForKidsReadback` (`:66`) and `t1Passed` (`:32`, `:246`).
  `ExperimentState` (`publisher-guard.ts:46-51`) is "What a publisher stores for a line": `{line, readings, verdict}`. No
  publisher exists, and no file names a path for that state.
- **Two files.** Neither reader writes the other's file: the analytics output (`:110`) and the state file (the read-back
  `:102`).

**Around the question** (repo; RED-TEAM is rendered via note).
- `research/faceless-youtube/VERDICT.md:227-228`: an own Google Cloud project and API audit are "Not owner steps, by
  decision".
- `research/faceless-youtube/RED-TEAM.md:77-82`: if the colony clicks the project, the Developer Policies apply to that
  client too (a privacy policy and ToS link, compliance mail to the console account, a possible identity request).
- `ASSESSMENT.md:423-430`: the key in the same analytics-only project; that a keyed read returns the field is inference.
- No owner step creates the Cloud project or the key (`src/revenue/owner-steps.ts:80`, `:297`, `:406`, `:426`;
  `docs/OWNER_STEPS.he.md:380`, `:543`).
- The brand mailbox reader reads the brand mailbox (`scripts/brand_mail.py:123-125`, `:161-162`), and its only responder is
  `gumroad-refund` (`:38`; `.github/workflows/brand-mail.yml:31`). Nothing reads the Console account's mailbox (OTA:510,
  EX:251; memo condition 4, EX:532).
- `scripts/brand-check.mjs:3-8`, `:24`: the other YouTube gate on `terms-verdicts.json`, which keeps no page body, only a
  status.

**The duties on every client** (github, via note; the privacy-and-terms build's, listed for reference).
- Privacy and terms: OTA:81 (EX:69, "a published privacy policy"); OTA:324 (EX:153); OTA:340 (EX:160), the ToS link and the
  client's own terms; OTA:342, :346, :348, :358, :360 (EX:167, :174, :181, :188, :195); OTA:490 (EX:237).
- Security: OTA:86 (EX:76); OTA:606, :608, :610 (EX:328, :335, :342). Redistribution: OTA:661 (EX:363).
- Contact and credentials: OTA:510 (EX:251), the compliance mail; OTA:450 (EX:223), credential sharing.
- Monitoring and quota: OTA:433 (EX:202); OTA:76 (EX:62); OTA:692 (EX:370); OTA:694 (EX:377); OTA:156 (EX:90); OTA:498
  (EX:244).
- Acceptance: nobody may use the Services without agreeing (OTA:46, EX:34); who may not accept (OTA:59, EX:55); the EMEA
  version, unread (OTA:1125, EX:468).

---

## Part C — What is not for this sitting, what no file holds, and housekeeping

**Not row 28's question.**
- [asm] **Handed to this sitting beside the row.** google.com's `copying` field, or the trim's reach over the ten
  developers.google.com/youtube captures: "a decision for the sitting that rules row 28, not before Stage A either way (the
  captures predate the bar and are D1(1))" (`CHANNEL_LOOP.md:395` item (6)). google.com is BARRED with `"copying":
  "unread"` (`terms-verdicts.json:256-261`); the trim assigns a capture to its own host's site, so the googleapis.com entry
  does not reach them (EX's note (b), EX:540). The bar they would meet from the owner's acceptance is OTA:661 (EX:363) with
  OTA:799 (ii) (EX:447) (memo condition 3, EX:531). The ten are committed; none is frozen or trimmed [asm].
- **Stage A's key-line re-brief** (`CHANNEL_LOOP.md:395` item (1)): the ₪0 privacy and ToS page; 30-day retention with no
  raw values committed; the same for the analytics output; a compliance-mail reader; acceptance and the regional version;
  the suspension risk; "main thread, after the two builds".
- **The two builds.** They wait on this row and are the first build after its fold (`CHANNEL_LOOP.md:399` item (2)).
- **The first live read** (EX:546): whether a bare key returns the fields, the envelope and the quota cost.
- **The regional version** (EX:544; memo condition 5, EX:533): which version binds the owner is Stage A's.
- **Suspension's reach** (EX:514; memo condition 8, EX:536): "a risk stated to the owner inside the Stage A ask, not a bar".
- **The accounts.google.com discovery document** (T1-RULING:298-301, :591): not this row's.
- **The repository's visibility** (`CHANNEL_LOOP.md:255-257`): the owner's.
- [asm] **Tick 61's items (4) and (5)** (`CHANNEL_LOOP.md:395`) are done in part: the refusal is now the log call at the
  read-back `:126-130`, the WRITES paragraph (`:15-20`) names `firstRead` (`:17`), and `stayedPublic`'s doc names it
  (the module `:193`); the latest-read list gained `returned` in tick 63 (merge `8ab3e66`, the script's `:18`) [main thread, after assembly].

**What a ruling would need that no file holds.**

*The first question.*
1. **A ruling.** Whether the stored verdicts, the times or the override count are "new or derived data or metrics". Every
   file defers to this sitting (EX:506, :530, :545; `terms-verdicts.json:266`; T1-RULING:295-296).
2. **A definition.** A github-grade definition of "derived" or "metric": EX's nine section IV definitions contain neither
   word. The pre-bar rendered capture holds section IV (D1(1), not read by line here).
3. **The additional-policies page** OTA:774 (EX:391) links to, at any grade: no capture exists.
4. **The pointer-only clauses** at github grade (statistics, consistency with current data, business insights, no further
   rights): only the D1(1) capture and the 25.9 note, at an older version, hold such text.
5. **The appeal.** Any file weighing whether a kept contrary designation that the one appeal later reverses
   (`experiments.ts:48-50`) still counts as current data.
6. **The embedding trigger.** Any file applying OTA:602's (EX:321) embedding trigger to status reads of the colony's own
   uploads, beyond EX:506's "better argument".
7. **The analytics readings.** Any file weighing the analytics reader's own derived readings against OTA:596 (i) or (ii)
   (EX:307), or against OTA:598 (EX:314): `medianStrangerViews`, `strangerWatchHours28d`, and the "DERIVED"
   `averageViewPercentage`, named like the API's metric but not it. The same for OTA:661 (EX:363) and the committed `raw`
   tables.

*The second question.*
8. **Purge code.** Any purge, refresh-by-age, expiry or revocation-deletion code in either reader; and any kill path that
   deletes API Data on a suspension (EX:514).
9. **A reconciliation** between T1-PROTOCOL's Recording ("kept in the repo with its timestamp and source", `:138-139`) and
   T1-RULING §4 decision 3 (`:444-446`) on one side, and EX:506's "raw values should not be committed at all" on the other.
10. **A horizon.** A stated retention horizon for P-2's count, or a stated start of the 30-day clock for each field.
11. **`readAt` and the verdicts.** A non-inference answer on whether `readAt` (the run's own clock) or the colony's
    verdicts are API Data (EX:506 only).
12. **An ignore rule.** Any rule keeping YouTube files under `state/colony/measurements/` out of git.

*The third question.*
13. **"The same state file".** Whether the publisher's `ExperimentState`, which would hold both readers' values (A(3)),
    counts as "the same state file" for the third question. No path for it exists, no writer exists, and no publisher exists.
14. **A client test.** A test for where one API Client ends.
15. **The uploads file.** A writer of `youtube-videos.json`, and whether its ids and `publishedAt` are API Data.
16. **A gate on the analytics reader.** A terms gate on it; the accounts.google.com discovery fetch has no queue item.
17. **A workflow test.** A test keeping `youtube-analytics.ts` out of workflows.

*Before Stage A, outside the three questions.*
18. **A privacy or terms page** carrying the YouTube ToS link (grep of `products/` and `docs/`: 0).
19. **A compliance-mail reader** for the Console account's mailbox.
20. **An owner step** that creates the Cloud project or the key.
21. **An III.L application.**
22. **A first live read.**
23. **Unread texts.** The regional ToS, GitHub's terms on secrets and Open Terms Archive's licence (EX:544, :547).
24. **Visibility today.** A live check of the repository's visibility.

**Housekeeping for the Opus fold, not rulings.**

*Row 28's pointer drift* (repo (git objects); the checker's, confirmed):
- **`experiments.ts:285` → `:289`.** It moved in `71decf4` (07:53), part of fold `1008e81` (merged 08:23), before row 28's
  commit `4795dee` (09:04); it was still `:285` at `c5ee52e` and `ac637a3`. The stale `:285` stands in `FABLE_QUEUE.md:52`,
  `CHANNEL_LOOP.md:395` item (2) and EX:530; EX:540 and `terms-verdicts.json:266` already give `:289`.
- **`T1-PROTOCOL.md:116-120` → `:118-122`.** `079ddce` (08:02) inserted two lines at `:32-33`. `079ddce` is not an ancestor
  of `4795dee`; it reached HEAD through merge `91dd850`. The stale pointer stands in `FABLE_QUEUE.md:52`,
  `CHANNEL_LOOP.md:395` item (1), EX:538 and T1-RULING `:218`, `:280`.
- **T1-RULING's other T1-PROTOCOL pointers.** `:279`'s `:93-99` → `:95-101`. `:310`'s `:77`, `:78`, `:80` → `:79`, `:80`,
  `:82`.
- **EX's read-back pointers** (written at `4795dee`; shifted by `682caab`):

  | EX cites | Now |
  |---|---|
  | `:117-124` | `:123-131` |
  | `:126-130` | `:133-137` |
  | `:151-172` (cited at EX:510) | `:158-179` |
  | `:156` | `:163` |
  | `:176-178` | `:183-185` |
  | `:135`, `:166`, `:171` | `:142`, `:173`, `:178` |
  | `:7-10` | unchanged |

  In the module, `stayedPublic` moved `:197` → `:198`. EX's other pointers into the module hold.
- **T1-RULING's read-back pointers, checked at `692e905^`.** The script's `:73-77` (T1-RULING `:274`) → `:133-137`;
  `:111-119` (`:284`) → `:171-179`; `:101` (`:285`) → `:161`; the test's `:377-383` (T1-RULING `:276`, `:634`) →
  `youtube-madeforkids.test.ts:645-651`.
- **`CHANNEL_LOOP.md:395`.** Item (4)'s `:15-19` → `:15-20`. Item (5)'s `:121-122`: the quoted phrase is gone; the refusal
  is now the log call at `:126-130`, with its message at `:127-129`.
- **The 8.10 brief.** `SITTING-2026-10-08-BRIEF.md:707` cites `CHANNEL_LOOP.md:457` → now `:461` and `:463`. It was `:457`
  at `88a1fd9`.
- **OTA lines do not move.** Row 28's OTA lines are at EX:307, :314, :146, :321, :489, :300, :216, :272, :279 and :286.

*Corrections the checker made to the clerks* (recorded so the fold does not re-introduce them):
- EX's "68 of the 1,270 original lines" is at EX:12, not EX:10. The address line is not cited by number.
- The count's doc range is `experiments.ts:45-66` (doc `:45-65`, field `:66`), not `:44-66`; the count's number appears in
  a note only when K-mfk fires (`:292`), since the one-override note (`:295`) carries none.
- KIDS-LINE does not say no page embeds (`:139-140` is about an embedding page with a counter); `:244-246` added. The
  inference that no current page embeds rests on the chart-explainer tests only.
- The Developer Policies capture's text dates from 25.9 (`6a2dadd`); only its meta is from 29.9. Its text also matches
  section IV and the pointer-only clauses (`grep -c` only).
- The read-back's `:117-124` → `:123-131` (not `:123-132`); `:151-172` → `:158-179` (not `:157-179`). The count was at
  `:289` from `71decf4`, not from `b426467`. `079ddce`'s two lines are at `:32-33`, not `:31-32`.
- The III.E.4.b statistics line is not in EX; it is described, not cited.
- `.gitignore` holds other, unrelated entries; none matches the YouTube paths.
- `ExperimentState` is `publisher-guard.ts:46-51`, not `:45-50`.
- The OTA licence and GitHub's terms on secrets are at EX:547, not :546.
- Question (iii)'s heading is EX:504 and its answer EX:506; answer (vi) is EX:518, not :516; answer (v) is EX:514, not
  :512, and OTA:245's (EX:118) trigger includes suspension and notice of discontinuance, not termination alone; the EMEA
  line is EX:468, not :466, and OTA:59 (EX:55) is about who may not accept, not acceptance before access.
- OTA:582's 30-day cap (EX:293) comes from answer (ii) (EX:502); condition 6 (EX:534) names only OTA:550 and :576/:578
  (EX:272, :279, :286).
- T1-RULING's test pointer is at `:276` and `:634`, not `:274-275` and `:634-635`.
- The checker's additions: OTA:437 and :457 (EX:209, :230); answer (iii)'s purge, OAuth and storage-part sentences;
  answer (v); the kept designation and the appeal (`experiments.ts:48-50`, `:54-55`); `ExperimentReadings` across both
  readers; the Search diagnostic's "derived" label; and item (6)'s "not before Stage A either way".

*Pointers this brief corrected or added* [asm]:
- OTA:437 and :457 (EX:209, :230) are relied on at EX:518 and EX:526, not at EX:506 (the checker placed them at
  EX:506); answer (iii) classifies the keyed reads through OTA:793, :797, :789 and :783 (EX:426, :440, :419, :405).
- This brief was built on 7.10 (tick 63), not in a tick of 8.10 (`CHANNEL_LOOP.md:461`); `CHANNEL_LOOP.md:26` does not
  name row 28.
- The stored-value table in A(0) is the assembler's, from the code.
- `activeSlugs()` over `urls.txt`: 66 active slugs, none a YouTube capture; `FROZEN.sha256` (255 lines) has no youtube or
  developers.google.com line; the ten developers.google.com/youtube metas carry no `trimmed` block.
- `git check-ignore` exits 1 for the three YouTube paths (re-run); no workflow or `package.json` names
  `YOUTUBE_DATA_API_KEY` or `YT_ANALYTICS_*`; no loop file names accounts.google.com.
- Tick 61's items (4) and (5) are done in part (Part C, first block).
- The 25.9 note's provenance line is `discovery.md:13`.
- The standing consent's sentence is `MISSION.md:349-350` (the checker gave `:349`).
- The code's own doc calls the count "derived" in its own sense (`experiments.ts:55-56`).
- The header's link blocks 1-5, the label block of Part A, and the "Around the question" block of A(3).
