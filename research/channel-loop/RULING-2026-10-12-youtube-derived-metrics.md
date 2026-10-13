# Ruling — derived metrics under the YouTube API Services Terms: the made-for-kids state, the 30-day rule and the one-client consequence, 12.10.2026 — `logs/FABLE_QUEUE.md` row 28

**Sitting.** 12.10.2026 ~07:11 UTC, beside row 29 (ruled by a second decider; nothing here touches its subject). One
decider: the deciding model of the sitting. No subagents, no web fetch, no connector call, no `gh`, no git command that
writes, no `git stash` in any form, no edit outside this file; the main thread folds on Opus. The owner is "the owner",
they/them. No name, no login, no address and no token appears here. GitHub Actions has been disabled on this repository
since about 8.10 22:03 UTC (who disabled it is not known); it bears on this row only in that no colony run has committed
anything since, and the state files this row is about have never existed (§2, facts).

**Tree.** `bf702b3` on `claude/new-session-j071dx` (`git log --oneline -1`, read-only), the tick-72 commit. Every pointer
below was opened in that tree with `sed -n`, `cat -n`, `grep -n -F` or a read-only `git diff --stat`, and the line cited
is the one seen at HEAD. The brief (`research/channel-loop/SITTING-2026-10-09-BRIEF.md`) was assembled on `74b9bce`; its
pointer-drift note (`:3-11`, ticks 70 and 71) was read first and holds; `node scripts/brief-drift.mjs
research/channel-loop/SITTING-2026-10-09-BRIEF.md --tree 74b9bce` (read-only) was run and agrees with it, its two
"invalid" rows (`scripts/youtube-madeforkids-readback.ts:246`, `scripts/youtube-analytics.ts:311-342`) being the scanner's
misattributions the note already names (both are `src/revenue/experiments.ts`). Since the note's last tree (`fe82745`)
only loop files, the two briefs' tick-71 lines and `scripts/brief-drift.mjs` with its tests changed (`git diff --stat
fe82745 bf702b3`). Of the files this ruling rests on, only `.github/workflows/colony.yml`, `research/channel-loop/
terms-verdicts.json` and the read-back's `:18` differ from `74b9bce` (`git diff --stat 74b9bce HEAD -- <the files>`); the
module, `experiments.ts`, the analytics reader and module, `publisher-guard.ts`, `T1-PROTOCOL.md`, EX, the tests and the
mutation plan are byte-identical.

**Read.** `MISSION.md` in full; `research/channel-loop/SITTING-2026-10-09-BRIEF.md` in full (`:1-120` the drift note and
header, `:121-464` Part A, `:465-604` Part C); `logs/FABLE_QUEUE.md:1-25`, `:50-53` (row 28 is `:52`);
`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (T1-RULING) `:1`, its headings, `:249-301`
(§2's RULING and "What this does not decide"), `:436-453`, `:582-657`, `:658-685` (amendment 1);
`research/channel-loop/RULING-2026-09-30-video.md:1`, `:22-45` (D1); `research/channel-loop/RULING-2026-10-07-posthog-
organisation.md:1-492`, `:774-832` and its headings, as the house form;
`research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md` (EX) in full, `:1-547`;
`src/revenue/youtube-madeforkids.ts` in full (253 lines); `scripts/youtube-madeforkids-readback.ts` in full (224 lines);
`src/revenue/experiments.ts:1-70`, `:140-215`, `:236-345`; `scripts/youtube-analytics.ts:1-120`;
`src/revenue/youtube-analytics.ts:15-30`, `:60-90`, `:120-150`; `research/faceless-youtube/T1-PROTOCOL.md:75-95`,
`:103-126`, `:134-139`; `research/channel-loop/terms-verdicts.json:262-276`; `src/revenue/publisher-guard.ts:1-8`,
`:40-55`, `:115-246`; `.github/workflows/colony.yml:1-10`, `:24-30`, `:100-106`; `.gitignore` in full;
`logs/CHANNEL_LOOP.md:26`, `:51`, `:79`, `:256-262`, `:398-399`, `:506` and its headings; `logs/CHECKPOINT.md:1-60`;
`research/channel-loop/RULING-2026-10-04-kids-youtube.md` headings and `:440-460` (§10), with `grep -n` over `:238-304`
and `:362-418`; `research/youtube-kids/ASSESSMENT.md:415-432`; `research/faceless-youtube/scouts/discovery.md:13`,
`:218-228`; `src/__tests__/revenue/youtube-madeforkids.test.ts` (its describe/it index, `:124-175`, `:640-660`);
`src/__tests__/revenue/mutations/youtube-madeforkids.json:1-80` and `mutations/README.md:30`, `:32`, `:98`;
`src/__tests__/revenue/t1-made-for-kids-kill.test.ts` (index, `:119-120`); `kids-explainers-kills.test.ts:60-73`;
`experiments.test.ts` and `youtube-analytics.test.ts` (their indexes); `scripts/trim-capture.mjs:3-16`, `:85-90`,
`:203-212`; `scripts/render-watch.mjs:520-528`; `scripts/queue-zero-test.mjs:108-110`; `src/revenue/measurements.ts:50-58`;
the names of the ten `research/rendered/*.meta.json` whose url is under developers.google.com/youtube (no body read);
`research/rendered/FROZEN.sha256` (254 lines, counted; no youtube or developers.google.com line). Read-only git: `git
ls-files state/` (six files, no YouTube path), `git log --all` on the three YouTube state paths (nothing, ever).

**Grades** as the brief defines them (`SITTING-2026-10-09-BRIEF.md:27-35`): `repo` (our own code, notes and EX's own
answers and memo); `github, via note` (every `OTA:n`: the note is EX, pinned at commit `80db0630`, EX:6; an older
download quoted by the 25.9 scout note is "github, via note (older file)"); `rendered` — no capture is cited by line here,
none being frozen (`FROZEN.sha256` holds no youtube entry) and the ten developers.google.com/youtube captures being
`[against-bar]`, D1(1); `inference` (reasoning, always marked); `none`.

**Provenance marks.** googleapis.com carries `"copying": "barred"` (`research/channel-loop/terms-verdicts.json:274`), so
this file writes `OTA:n` only for a line EX quotes, always with EX's own line beside it, quotes at most one short clause of
any OTA line, never cites the address line, and describes in words, with EX's line, a clause EX cites by pointer only.
The row's OTA lines in EX: :596 is EX:307, :598 EX:314, :303 EX:146, :602 EX:321, :1176 EX:489, :584 EX:300, :448 EX:216,
:550 EX:272, :576 EX:279, :578 EX:286 (checked at HEAD against EX's own headings).

**Standing rules applied.** "Honest value only — this outranks the target": "no ToS violations" (`MISSION.md:454-459`);
decisions "live in code ... precisely so any auditor can recompute them from the same numbers and catch drift"
(`:450-451`); "Every line carries KPIs, kill criteria and scale criteria" (`:462`); "Never invent a step that isn't
required." (`:436`); the YouTube addition of 30.9: "YouTube's own made-for-kids and synthetic-content rules all hold"
(`:422-423`); the brand as the only public face (`:276-279`); the repository is public (`logs/CHANNEL_LOOP.md:258-259`); the
loop's Never: "a keyed API call to a host whose API terms are unread" (`:79`). The fail-closed default of ruling 7.10 row
24 §2 decision 2 (T1-RULING `:256-277`): the read-back refuses until googleapis.com's verdict is active-eligible, and it is
`CONDITIONAL_UNMET` (`terms-verdicts.json:270`), so nothing here changes what runs today: nothing runs.

**Money today.** ₪0. Nothing in this file is revenue; nothing in it fetches, publishes, creates or spends (the tick-72
entry of `logs/CHECKPOINT.md` ends "לדג'ר ₪0; לא ננקט צעד בעלים; לא נפתח חשבון", found with `grep -n -F`).

**How the three questions touch, as ruled here.** §1 fixes a test for "derived data or metrics" and applies it to each
stored or computed item; §2 follows from it and from III.E.4.d: the state keeps the colony's own facts and nothing the
API returned; §3 follows from the one-client memo: the duties travel with the kind of data, not with the file. §4 decides
the item the main thread handed to this seat beside the row (`CHANNEL_LOOP.md:398` item (6)). §5 gives Stage A's key line.

---

## 1. A(1) Which of the stored verdicts, the times and the override count is a derived metric the Policies bar? None, on a stated test and three conditions — and the analytics reader's own readings are a separate row

**The question as asked** (`logs/FABLE_QUEUE.md:52`): "Which of these, if any, is a derived metric the Policies bar".

**Facts read.**

- *The clause* (github, via note). III.E.4.h (OTA:596, EX:307) has two bars and a display rule: (i) replacing API Data
  with similar data the client calculated itself; (ii) using API Data to create "new or derived data or metrics"; and,
  where a client shows information not based on API Data beside API Data, a clear and prominent disclosure that it is the
  client's own. "Must not" is "an absolute prohibition" (OTA:303, EX:146). The example (OTA:598, EX:314) is entirely about
  display: when showing a video's likes, use the number returned; do not substitute your own; do not use the returned
  number to calculate other metrics, such as a percentage made through the client or "a score that factors in likes,
  total views, or any other API Data"; you may show your own independently measured count beside YouTube's total if you
  say clearly that you calculated it. III.L (OTA:774, EX:391) applies its policies only to "audited developers with
  analytics use cases" who applied, from June 1, 2026, to create additional metrics or store statistical data; the page it
  links to is unread (EX:545). The Policies define nine terms in section IV (EX:394-455); neither "derived" nor "metric" is
  among them (the brief, Part C item 2; checked: EX's section IV headings).
- *The older download* (github, via note, older file). The 25.9 scout note records the Revision History's entries of May 4
  and June 1, 2026 naming "custom scores, earnings estimates, suitability scoring" as the examples of additional derived
  metrics (`research/faceless-youtube/scouts/discovery.md:225-227`; the file's provenance `:13`); and III.E.2's second
  item, barring aggregation or use of API Data to gain insights into YouTube's business (`:220-221`; EX cites that line
  by pointer only, EX:518). Its bracketed line numbers are that file's, not EX's.
- *What the Terms expect a client to do with Made for Kids status* (github, via note). III.E.4.j (OTA:602, EX:321): a
  client must look up the status of "each YouTube video that it embeds" and, for each one designated Made for Kids, turn
  tracking off and keep data collection lawful. The Revision History (OTA:1176, EX:489): the client is "responsible for
  knowing" which embedded videos are made for kids and must check through the Data API before embedding. The colony embeds
  no video (the brief, A(0) "Embedding": the chart-explainer tests forbid `<iframe>` and `<embed>`; the kids line has no
  web arm) [inference: that no page embeds rests on those tests only]. So III.E.4.j imposes no duty on the colony today;
  it shows the kind of use the Policies contemplate — a per-video read of the status, a per-video action on it, and a
  client that remembers what it found.
- *Aggregation* (github, via note). III.E.2.a (OTA:538, EX:265) bars aggregating API Data except for channels "under the
  same content owner" that YouTube recognises under content licensing agreements, viewable by that owner only.
- *Definitions* (github, via note). API Data is data, content and information "provided to API Clients" through the
  services (OTA:799 (iii), EX:447). An API Client is a website or software application developed by you that accesses or
  uses the services (OTA:781, EX:398).
- *The candidates, as the code has them* (repo; all at HEAD, unchanged since `74b9bce`).
  - One read: `{id, returned, madeForKids, privacyStatus, readAt}` (`src/revenue/youtube-madeforkids.ts:47-60`):
    `madeForKids` is the API's boolean as "true"/"false" or null (`:131`), `privacyStatus` the API's string or null
    (`:132`), `returned` the colony's `item !== undefined` (`:133`), `readAt` the run's clock (`:121`; the read-back passes
    `run.now`, `scripts/youtube-madeforkids-readback.ts:176`, `:211`).
  - Stored per upload (`:62-86`, merged at `:147-173`): `firstRead` `{readAt, returned, privacyStatus}`, written once
    (`:71`, `:163`); `first`, the first read that carried a designation (`:76`, `:164`); `latest` (`:78`, `:165`);
    `contradictedAt` (`:83`, `:166`) and `leftPublicAt` (`:85`, `:167`), both colony timestamps set when a condition on
    API values first holds and never cleared; file-level `experiment`, `declaresMadeForKids`, `updatedAt` (`:89-94`,
    `:172`); de-listed uploads' entries kept as they were (`:141`, `:171`).
  - Computed in memory, never stored: `readbackOf` (`:180-186`), `stayedPublic` (`:198-202`), `firstUploadWindow` and its
    `passed` (`:235-253`), which is `ExperimentReadings.t1Passed` (`src/revenue/experiments.ts:32`).
  - The override count: `readback.filter((v) => v === "true").length` (`experiments.ts:289`) against `mfkKillAt` (`:283`),
    which is `MADE_FOR_KIDS_OVERRIDES = { killAt: 2 }` (`:210`), pre-registered 30.9 (`:199-209`) and pinned
    (`src/__tests__/revenue/t1-made-for-kids-kill.test.ts:119-120`). At two it kills (`:290-292`) and the note carries the
    number (`:292`); at one it escalates (`:293-295`). The count is stored nowhere (the brief, A(1)); the code's own word
    "derived" at `:55-56` means computed from the read-back rather than typed in.
  - What rests on the per-video items: P1 and P2 (`research/faceless-youtube/T1-PROTOCOL.md:79-80`), K-T1k and
    K-mfk-designation (`experiments.ts:246-253`, `:270-277`), the publisher guard's refusals (`src/revenue/
    publisher-guard.ts:215-232`).
- *EX's own position* (repo). Answer (iii) part (3) (EX:506): the count "fits that example on its literal words, and is
  arguably an aggregate"; the per-video lookup-and-act checks "have the better argument"; whether the derived verdicts,
  times and count may be made and kept at all "is not decided here". Answer (vi) part (3) (EX:518): the business-insight
  reading of measuring YouTube's overrides is "[inference, weak]". Memo condition 2 (EX:530): "NOT decided here: a Fable
  sitting rules before Stage A". The googleapis.com note repeats it (`terms-verdicts.json:273`).
- *The analytics reader's own readings* (repo; the checker's addition in the brief). `medianStrangerViews` and
  `strangerWatchHours28d` are computed from the Analytics API's tables (`src/revenue/youtube-analytics.ts:129-136`); the
  Search diagnostic `averageViewPercentage` is "DERIVED — not the API's `averageViewPercentage`" (`:137-142`;
  `T1-PROTOCOL.md:113-116`). K0 and K3 read them (`experiments.ts:311-342`). No file weighs them against III.E.4.h (the
  brief, Part C item 7).

**Options weighed.**

1. *The literal reading: every figure or flag computed from an API value is "new or derived data", so the count, the
   timestamps and every verdict are barred, and P-2 cannot exist.* Rejected as a reading of the text, not as a caution. On
   it, the per-video decision III.E.4.j itself requires ("designated Made for Kids → tracking off") would be barred data
   the moment a client held it for more than one video; so would any client's retry counter, since an HTTP status is
   information provided through the service. A reading under which the Policies bar what they elsewhere require is not the
   text's meaning. The clause's own example, its disclosure sentence and III.L all speak of metrics shown or offered as
   data about YouTube content — likes, views, percentages, scores, statistical data for analytics use cases. [inference,
   marked; the clause's text is github, via note]
2. *Rule the count barred and restate P-2 as a kill at the first override, so that no count exists.* Rejected. A kill at
   the first contradicted upload still needs the colony to decide "contrary → kill" per upload and to ask whether any
   upload is contradicted, which is the same kind of computation on the same API values; the arithmetic is smaller, the
   question is not answered. It would also change a pre-registered criterion with its pin (`t1-made-for-kids-kill.test.ts:
   119-120`) for no textual gain; KILL-2 allows stricter but does not ask for it here.
3. *Relabel the count as a count of colony events (videos the colony set private) so that it is "not from API Data".* No:
   the number is the same number; a relabel that changes nothing in substance is the dishonesty the mission's rule 4
   forbids.
4. *A test for the clause, with conditions that keep the colony inside what the text plainly contemplates, and a separate
   row for the one class of readings the test does reach.* Adopted. The test is stated so that an auditor can apply it to a
   new field without a sitting; the conditions are testable in code; and where the test's own answer is uncomfortable (the
   analytics readings), this ruling says so rather than letting it pass unspoken.

**RULING.**

1. **The test.** Under III.E.4.h(ii) (OTA:596, EX:307), with its example (OTA:598, EX:314) and III.L (OTA:774, EX:391),
   "new or derived data or metrics" are figures or data that describe YouTube content, channels or their performance and
   are computed from API Data — the example's percentages and scores, III.L's additional metrics and statistical data for
   analytics use cases, the Revision History's custom scores, earnings estimates and suitability scoring
   (`discovery.md:225-227`, github via note, older file). A client's own decision on an API value about its own upload
   — the answer to a check it pre-registered, with the time it answered it — is the lookup-and-act the Policies themselves
   contemplate (OTA:602, EX:321; OTA:1176, EX:489) and is not that. Grade: github via note for the clauses; **inference,
   marked**, for the reading of two undefined terms. Because it is an inference about an undefined term in an agreement
   the owner accepts, §5 makes it a sentence the owner is told at Stage A, and the REOPEN triggers below bind it.
2. **Applied to each item** (the module and `experiments.ts` at HEAD, repo):
   - `madeForKids` and `privacyStatus` wherever a reading holds them (`firstRead.privacyStatus`, `first`, `latest`): API
     Data stored, not created — not derived data; their keeping is §2's question, and §2 ends it.
   - `returned`, `readAt`, `updatedAt`: the colony's own facts about its call and its clock (`:133`, `:121`, `:172`); not
     API Data and not derived from it.
   - `contradictedAt` and `leftPublicAt` (`:166-167`): the colony's record of when it first saw YouTube's designation
     disagree with the line's declaration, and when it first saw its upload leave public — the triggers of P-2 and of P2's
     failure. Not metrics about a video; not shown as data about YouTube; the record a client that must act on a status
     keeps. **Not barred.**
   - `readbackOf`, `stayedPublic`, `firstUploadWindow` and `t1Passed` (`:180-253`): per-upload answers to the colony's
     pre-registered checks on its own uploads (`T1-PROTOCOL.md:79-80`; ruling 4.10 §6 rule 2; T1-RULING §4 decision 3).
     **Not barred.**
   - **The override count** (`experiments.ts:289`): the number of the colony's own uploads on which YouTube overrode the
     line's audience declaration, compared with a pre-registered stop threshold (`:210`). It is not a metric describing a
     video or a channel's performance; it is the cardinality a stop rule over the colony's own compliance events needs,
     and it exists for nothing else. **Not barred under III.E.4.h(ii), on three conditions**, each a code change (fold 1):
     (a) it is never stored as a figure, never printed, never published and never shown beside any API Data — it lives in
     `evaluateExperiment`'s memory and in the kill's id; (b) the K-mfk note (`:292`) names the contradicted uploads by
     their ordinal in the read-back, as the K-mfk-designation note already does (`:273-276`), and carries no tally; (c)
     the threshold stays what was pre-registered, `killAt: 2`, pinned (`t1-made-for-kids-kill.test.ts:119-120`), and
     nothing else is computed from the count. An auditor still recomputes the kill from the read-back list and the
     threshold (`MISSION.md:450-451`).
3. **III.E.4.h(i) is not engaged.** Nothing the colony keeps is substituted for API Data where API Data is shown: the
   colony shows no API Data. The one place a stored item differs from YouTube's current value by design — the override
   record kept "whatever later reads or the one appeal say" (`experiments.ts:48-50`; the module `:13-15`) — is the record
   of an event, not a claim about the video's present designation; §2 makes the state say so by shape (no field holds a
   designation at all), which also moots the clause EX cites by pointer on keeping stored data consistent with current
   data (EX:506 describes it; it is not in EX).
4. **III.E.2.a (OTA:538, EX:265) is not engaged.** The count is a cardinality of compliance events on one channel the
   colony itself operates, computed for a stop; it is not an aggregation of API Data for insight into YouTube (the
   section's own second item, `discovery.md:220-221`, github via note, older file; EX:518 marks that reading weak), and
   condition 2(a) keeps it viewable by no one. [inference on the section's scope; its heading is not in EX]
5. **The analytics reader's readings are reached by the test and are not decided here.** A median of unsubscribed views
   across the channel's uploads, unsubscribed watch hours over 28 days, and a percentage computed from minutes, views and
   the colony's own video lengths and named like the API's metric (`src/revenue/youtube-analytics.ts:129-142`) are figures
   describing the channel's performance computed from API Data — the class decision 1 names. Whether III.E.4.h reaches a
   client's internal decision inputs that are never displayed, whether III.L's application is the route, and what K0 and
   K3 (`experiments.ts:311-342`) may read instead if it does, is outside row 28's question and is **a new FABLE_QUEUE row,
   before Stage A** (fold 9): Stage A asks for the analytics consent (`T1-PROTOCOL.md:106-117`), so the row precedes it.
   The row's brief must carry the three readings, their uses, OTA:596-598 and :774 (EX:307, :314, :391) and OTA:550
   (EX:272; §3 decision 4 here).

**REOPEN IF** YouTube communicates on compliance (OTA:510, EX:251) about the read-back, the count or the state; or the
derived-metrics page III.L links to (EX:545) is read at github grade and defines its terms to reach a client's per-video
status actions or stop rules; or the Terms change at III.E.4.h or III.E.4.d (OTA:48, EX:41); or the first live read shows
the fields are not returned to a bare key (EX:546) and the route changes.

**What this does not decide.** The analytics readings (decision 5, the new row). Whether the colony should apply under
III.L: not for the made-for-kids state, which this ruling keeps outside the clause; the analytics row says. Whether a
video id or `publishedAt` in the uploads file is API Data (the brief, Part C item 15): the publisher build's, T1-RULING
`:582-597` item 4 — the read-back reads that file and never writes it (`scripts/youtube-madeforkids-readback.ts:147`).

---

## 2. A(2) What the state may keep past 30 days: the colony's own timestamps and verdicts, for the experiment's life; nothing the API returned, for any time — never stored, committed, logged or printed

**The question as asked** (`FABLE_QUEUE.md:52`): "what the state may keep past 30 days (OTA:584) — the colony's own
timestamps and verdicts, or only raw values refreshed each run".

**Facts read.**

- *The rule* (github, via note). III.E.4.d (OTA:584, EX:300): Non-Authorized Data may be stored temporarily, in limited
  amounts, for as long as the client needs it but "not longer than 30 calendar days", then deleted or refreshed.
  Non-Authorized Data is API Data a client reaches "without User Credentials" (OTA:793, EX:426); API Data is what is
  provided to clients through the services (OTA:799 (iii), EX:447). The keyed status read is Non-Authorized Data (EX:506;
  agreed here: the key is the project's credential, not a user's, OTA:783 and :797, EX:405 and :440). For Authorized Data
  the cap is the same 30 days outside the statistics kind (OTA:582, EX:293), so reading through the owner's OAuth would
  not loosen it (EX:506 part (4); agreed).
- *Confidentiality and redistribution* (github, via note). ToS §8 (OTA:86, EX:76) and III.E.5 (OTA:606-610, EX:328-342)
  require controls for the confidentiality of API Data; III.G.1.a (OTA:661, EX:363) bars redistributing "all or any
  portion" of the services, API Data being part of them (OTA:799 (iii), EX:447). On any suspension, notice of
  discontinuance or termination the client stops using YouTube Property and deletes all API Data in its possession, and
  certifies the deletion on request (OTA:245, EX:118).
- *Where the state would go* (repo). The read-back writes `state/colony/measurements/<line>-madeforkids.json`
  (`scripts/youtube-madeforkids-readback.ts:99-103`, `:183-185`); the colony workflow runs `git add -f state/colony`
  (`.github/workflows/colony.yml:103`) on an hourly cron (`:27`) and "commits the resulting state and report back, so the
  owner can read every decision in the git history" (`:3-6`); `.gitignore` ignores none of the three YouTube paths (its
  only state rule is `*.db` with the `colony.db` exception, `:6-8`). The repository is public (`CHANNEL_LOOP.md:258-259`).
  The read-back also prints every upload's designation to stdout (`:186-190`); in a workflow that is the run's log.
- *What is never refreshed today* (repo). `firstRead` (`:163`, "Written once and never changed", `:68-69`), `first`
  (`:164`), and de-listed entries (`:171`); `latest` is refreshed only while reads run (`:165`). No purge, expiry or
  revocation-deletion code exists in either reader (grep: only the token-expiry hint at `scripts/youtube-analytics.ts:69`).
- *What the kills need to survive a run* (repo). P1: the first read's answer (`firstUploadWindow`, `:242-246`). P2 and
  K-T1k: the time the clock started, whether a departure from public happened, and the latest time the upload was seen
  public (`stayedPublic`, `:198-202`). P-2 and K-mfk-designation: per upload, whether and when a read carried the
  designation the line does not declare (`readbackOf`, `:185`; `experiments.ts:266-296`). The horizon is the experiment's:
  `k3Day: 112`, `k3ExtensionDay: 196` (`experiments.ts:149`, `:152`, `:190`, `:193`); P-2's count runs past 30 days.
- *What the colony's own texts ask to keep* (repo). "kept in the repo with its timestamp and source"
  (`T1-PROTOCOL.md:138-139`); "The four readings and their `readAt` are recorded beside `t1Passed`" (T1-RULING `:444-446`);
  the state's shape past 30 days left open (`:451`, `:590`).
- *The file has never existed* (repo; git objects). `git ls-files state/` lists six files, none a YouTube path; `git log
  --all` on the three paths finds nothing; "the read-back has never run live" (T1-RULING `:685`). No migration is owed.

**Options weighed.**

1. *Raw values stored and refreshed each run, purged at 30 days when reads stop, de-listed entries purged (the queued
   build, `CHANNEL_LOOP.md:398` item (1)).* Rejected as the primary design. It needs a purge that runs when nothing else
   does, leaves `first` and `firstRead` with no lawful form (they are by definition never refreshed), and does not touch the
   two bigger problems: every committed value stays in git history in a public clone (storage past 30 days whatever the
   refresh [inference: git history is storage, EX:506], confidentiality, redistribution), and the stdout designations go
   into a public workflow log (its retention is a GitHub setting this repo has not read; grade none).
2. *Raw values stored, the file ignored by git and the log muted.* Better, but a state file nobody can read is not "the
   audit trail the owner reads" (`.gitignore:7`), the colony's runners keep no disk between runs, and the 30-day purge is
   still owed for `first` and `firstRead`.
3. *No API value is ever stored: the run reads live, judges in memory, and stores only the colony's own timestamps and
   the answers to its own checks; the file is committed like other state, because it holds nothing of YouTube's.*
   Adopted. Every kill's input is recoverable from colony facts alone (shown below, field by field); no purge code is
   needed for values that are not there; git history, confidentiality, redistribution and the consistency clause are not
   engaged by the state; the suspension duty to delete API Data finds nothing in the state to delete. The cost is a
   refactor of a module that has never run live, proved behaviour-preserving by the existing fixtures.

**RULING.**

1. **Past 30 days — and from the first run — the state keeps only the colony's own facts: ISO timestamps from the run's
   clock, and booleans that are the answers to named, pre-registered checks.** It never keeps `madeForKids`,
   `privacyStatus`, or any other value the API returned, in any field, for any time: the raw values live in the run's
   memory from the fetch (`scripts/youtube-madeforkids-readback.ts:163-176`) to the merge and die with the process.
   III.E.4.d (OTA:584, EX:300) is then met by construction, and nothing is left for a purge, a refresh-by-age or a
   deletion on suspension to find. Grade: the rule github via note; the design repo; "a verdict on the colony's own check is
   the colony's record, not API Data in another form" is **inference, marked** — the alternative reading, on which no
   experiment could record P1's answer past 30 days, would make MISSION rules 3 and 5 unmeetable for any API client and is
   not what a rule about storing YouTube's data says.
2. **The state's shape** (ruled by invariant; the field names below are the suggested ones, the invariants binding).
   `MadeForKidsState` keeps `experiment`, `declaresMadeForKids`, `updatedAt` and `videos`. Per upload:
   - `id` — the upload's id as the uploads file gave it (never written by the read-back; §1 "does not decide").
   - `firstReadAt` — the first read's time, P1's read (today `firstRead.readAt`); written once.
   - `firstReadReturned` — whether that read's response carried the video (today `firstRead.returned`); written once.
   - `p1Api` — P1's API half as judged at that read: `true` when returned and public, else `false`; `null` while unread
     (replaces `firstRead.privacyStatus`); written once.
   - `firstDesignationAt` — the first read that carried a designation (today `first.readAt`); written once.
   - `p2ClockAt` — `firstDesignationAt` when that same read found the video public, else `null` for the entry's life
     (replaces `first.privacyStatus === "public"` in `stayedPublic`); written only in the merge that writes
     `firstDesignationAt`.
   - `lastPublicAt` — the time of the latest read that found the video public (replaces `latest.privacyStatus` and
     `latest.readAt`); refreshed by every run that does.
   - `leftPublicAt` — as today (`:85`): the first read that found the video not public after a read found it public,
     tested as `lastPublicAt !== null` before this run's update; never cleared.
   - `contradictedAt` — as today (`:83`); never cleared.
   - `firstRead`, `first` and `latest` as whole readings: removed. De-listed uploads' entries stay as they were (`:171`),
     which is now harmless: they hold colony facts only.
   The invariant a test proves on every state the module produces and on every file the script writes: each leaf is
   `null`, a boolean, a string `Date.parse` accepts and that round-trips through `toISOString()`, the line id, or a video id
   matching the module's `VIDEO_ID` (`:96`); no leaf is `"public"`, `"private"`, `"unlisted"`, `"true"` or `"false"`.
3. **The functions, behaviour-preserving.** `readbackOf`: `contradictedAt !== null` → the contrary designation; else
   `firstDesignationAt !== null` → the line's own declaration; else `null`. This equals today's `:185` on every reachable
   state: `first` is set at the first designated read, a designated read that differs from the declaration sets
   `contradictedAt` in the same merge (`:164`, `:166`), so `first` exists with `contradictedAt` null only when
   `first.madeForKids` is the declared value. `stayedPublic(v, hours)`: `leftPublicAt !== null` → `false`; `p2ClockAt`
   or `lastPublicAt` null → `null`; `lastPublicAt − p2ClockAt ≥ hours` → `true`, else `null`; equal to `:199-201` because a
   read that finds the video not public after any public read sets `leftPublicAt`. `firstUploadWindow`: `p1` false when
   `publisherAccepted === false`, else false when `p1Api === false`, else true when `publisherAccepted === true` and
   `p1Api === true`, else null — the three branches at `:244-246` with `p1Api` standing for "returned and public". The
   read-back's merge sets each written-once field with `??`, tests the departure against the prior entry's `lastPublicAt`
   before replacing it, and writes `p2ClockAt` only beside `firstDesignationAt`. Every existing fixture's answers
   (`youtube-madeforkids.test.ts:124-296`, `:297-503`, `:505-640`) must hold with the fixtures' state literals rewritten to
   the new shape; the assertions on verdicts do not change.
4. **Nothing the API returned leaves the process.** The read-back prints, per upload, one of three words — as declared,
   contrary, unread — and the kill or escalation names, never a designation or a privacy status (today `:186-190` prints
   the designations); its error paths keep redacting the key (`:142`, `:173`, `:178`) and print the API's error message as
   today (`:172-173`; an error message is not API Data about a video). The script refuses to write a state that fails the
   invariant of decision 2 (fail closed, before `writeFileSync` at `:185`). The workflow log in a public repository is a
   store of unknown retention (grade none); the rule removes the question.
5. **The file is committed like other colony state** (`colony.yml:103`), because it holds nothing of YouTube's; no ignore
   rule is added (the brief's Part C item 12 is answered by shape, not by `.gitignore`). An auditor re-derives every verdict
   from the committed colony facts and the pinned rules (`MISSION.md:450-451`), which is what `T1-PROTOCOL.md:138-139` and
   T1-RULING `:444-446` ask for: the *readings* — P1 to P4 as answered, with their times and their source named — are
   kept; the API field values behind them are not, and never were what an auditor needs to re-run `evaluateExperiment`.
6. **Horizon.** The colony's facts are kept for the experiment's life and after it, as any colony log is: they are not API
   Data and no clause asks for their deletion. On a suspension, notice of discontinuance or termination (OTA:245, EX:118)
   both readers stop and nothing in this state needs deleting; the analytics output does (§3 decision 5).
7. **`ExperimentReadings.madeForKidsReadback`** (`experiments.ts:66`) keeps its type and its pin: each entry is the line's
   own declaration or the colony's override record, never YouTube's current value, which is read fresh each run and stored
   nowhere; the doc at `:45-65` gains that sentence (fold 2). `MADE_FOR_KIDS_OVERRIDES` is untouched.

**REOPEN IF** the first live read (EX:546) shows a field the kills need and no colony fact can stand for; or a later
ruling on the publisher's state (§3) finds a field that must hold an API value, in which case that field, and only it,
comes under a 30-day refresh-or-delete with a purge that runs when reads stop (option 1's design, confined).

**What this does not decide.** Where the analytics output lives (§3 and the privacy-and-terms build); the uploads file's
ids and `publishedAt` (§1); the suspension kill path for both readers (EX:514, memo condition 8, EX:536 — the Stage A
re-brief's, `CHANNEL_LOOP.md:398` item (1)); whether a workflow log's retention is storage (not needed once nothing is
printed).

---

## 3. A(3) Does the one-client ruling bring the analytics reader's Authorized Data duties onto the same state file? The duties follow the kind of data, not the file: the made-for-kids state carries none of them; the analytics output and any record that merges the two carry all of them

**The question as asked** (`FABLE_QUEUE.md:52`): "whether the one-API-Client ruling (OTA:448) brings the analytics
reader's Authorized Data duties (OTA:550, :576-578) onto the same state file".

**Facts read.**

- *The clauses* (github, via note). III.D.1.c (OTA:448, EX:216): "exactly one (1) API Project" per API Client, and that
  project for no other client. III.E.3.b (OTA:550, EX:272): no display of, or access to, Authorized Data for "anyone other
  than the authorizing user" or agents that user expressly approved. III.E.4.b (OTA:576, EX:279): data of the statistics
  kind may be kept past 30 days with a check every 30 days that the authorization stands; its example (OTA:578, EX:286)
  adds a check every 30 days "that the video has not been deleted". Other Authorized Data: 30 days (OTA:582, EX:293).
  Revocation (OTA:490, EX:237): every client must "periodically reconfirm that its authorization tokens are still valid"
  and delete the user's API Data when they cannot be refreshed. Prohibited access while credentials or the creating
  account are suspended, "via any means" (OTA:516, EX:258); a suspension may cover the credentials (OTA:57, EX:48).
- *The ruling it rests on* (repo). Memo condition 6 (EX:534): the colony is one API Client; the two readers share the one
  analytics-only project; "its output must not reach the public repository: queued with condition 2's build". Answer (ii)
  (EX:502): one privacy policy covers both readers; one suspension stops both; once wired the analytics output "would be
  shown to anyone [inference: a public repository is display]". EX's note (e) (EX:540) gives OTA:550's exception for agents
  the user approved.
- *The analytics reader* (repo). Credentials: an analytics-only Cloud project on the brand account and one consent for
  `yt-analytics.readonly` (`scripts/youtube-analytics.ts:6-7`, checked at `:83`); without them it exits 0 with a notice
  (`:84-87`). It refreshes the token every run (`:50-72`); `invalid_grant` is its only revocation signal (`:66-71`) and it
  throws without deleting anything. It writes `state/colony/measurements/youtube-analytics.json` as `{ measuredAt, window,
  readings, raw: { trafficTable, watchTable } }` (`:110-115`), overwritten each run (`:112`): the `raw` tables are the
  Analytics API's own response tables — Authorized Data as returned. It has no terms gate (grep: none). No workflow sets
  `YT_ANALYTICS_*` or runs it (the brief, A(3), checked), and `youtube-analytics.test.ts` has no workflow assertion (its
  index, `:28-142`).
- *What the two readers share* (repo). The uploads file (`youtube-videos.json`: the analytics reader `:8`, `:88-97`; the
  read-back `:11-13`, `:101`); the one project (`:6`; the read-back `:7-8`; `T1-PROTOCOL.md:107`, `:119`); and one type:
  `ExperimentReadings` (`experiments.ts:20-69`) holds the analytics reader's `medianStrangerViews`, `strangerWatchHours28d`
  and `averageViewPercentage` (`:36`, `:38`, `:40`) beside the read-back's `madeForKidsReadback` and `t1Passed` (`:66`,
  `:32`). `ExperimentState` is "What a publisher stores for a line": `{line, readings, verdict}`
  (`src/revenue/publisher-guard.ts:46-51`), validated field by field (`:135-167`). No publisher exists (`:4`), no path for
  that state is named anywhere, and neither reader writes the other's file.
- *What the read-back already does for 578* (repo). It asks about every listed upload on every run (`scripts/
  youtube-madeforkids-readback.ts:15-16`; the module `:13-15`) and records whether the response carried the video
  (`returned`, `:133`): a video that no longer exists reads `returned` false at the next run.

**Options weighed.**

1. *Yes, wholesale: one client, one regime, so the made-for-kids state is under OTA:550 too and must leave the public
   repository.* No. OTA:550 binds the client as to *Authorized Data*; the made-for-kids reads are Non-Authorized Data
   (§2), and under §2 the state holds no API Data at all. A duty attached to a kind of data does not spread to a file that
   holds none of it because the same client wrote both.
2. *No, not at all: the duties stay on `youtube-analytics.json` and the one-client ruling changes nothing about files.*
   Too narrow. The one-client ruling means one client owes both regimes at once, and the code already has a record that
   would hold both kinds of readings (`ExperimentState`). Where the two meet in one record, the stricter regime governs
   that record.
3. *The duties follow the data; one client owes both; a merged record inherits the stricter regime.* Adopted.

**RULING.**

1. **The duties travel with the kind of data, not with the file or the client's layout.** Non-Authorized Data duties
   (III.E.4.d) attach to what the keyed read returns; Authorized Data duties (OTA:550, :576-578, :582, :490; EX:272, :279,
   :286, :293, :237) attach to what the consent returns. The one-client ruling (memo condition 6, EX:534; OTA:448, EX:216)
   means the colony owes both sets at once, under one privacy policy and one suspension (EX:502) — it does not make one
   file's contents the other's. Grade: github via note for the clauses; repo for the memo; the "follows the data" reading is
   **inference, marked**, drawn from the definitions (OTA:789, :793; EX:419, :426), which classify data, not files.
2. **The made-for-kids state file carries none of the Authorized Data duties by its content**: its reads are keyed
   (Non-Authorized Data), and after §2 it holds no API value of either kind. It stays in the public tree (§2 decision 5).
3. **Any record that merges the two readers' values inherits the Authorized Data regime.** `ExperimentState` as typed
   (`publisher-guard.ts:46-51`) would hold `readings` from both readers; as typed it **may not be committed to the public
   repository**, because its analytics-derived readings are figures computed from Authorized Data and OTA:550 (EX:272)
   bars showing Authorized Data to "anyone other than the authorizing user" [inference that a figure computed from
   Authorized Data inherits the bar; the clause's words are github via note; the question is also §1 decision 5's row].
   The publisher build (not this row's) therefore either keeps `ExperimentState` out of the public tree, or splits it so
   that the committed part holds only the made-for-kids facts and the verdict with its gate ids, and the analytics-derived
   readings and any figure in a note stay with the analytics output. Until the analytics row (§1 decision 5) rules, the
   build assumes the stricter: nothing computed from the Analytics API in a public file.
4. **The analytics output leaves the public tree, and its `raw` tables are the clearest case.** `youtube-analytics.json`
   holds the Analytics API's response tables verbatim (`scripts/youtube-analytics.ts:114`): Authorized Data, under
   OTA:550's display bar and OTA:582's 30-day cap (EX:272, EX:293), in a file `colony.yml:103` would force-add to a public
   repository. It must not be written under `state/colony/` or any path the workflow commits; where it goes is the
   privacy-and-terms build's (`CHANNEL_LOOP.md:398` item (1)) under one constraint: a store only the owner (the
   authorizing user) and the colony (their agent, OTA:450, EX:223; memo condition 7, EX:535) can read — and until such a
   store exists, the reader does not write the `raw` tables at all. This confirms and sharpens memo condition 6's
   consequence (EX:534); it does not re-open it.
5. **The 30-day checks and the revocation duty, assigned.** Authorization (OTA:576, EX:279; OTA:490, EX:237): the
   analytics reader's refresh-token grant on every run (`scripts/youtube-analytics.ts:50-65`) is that check at the colony's
   cadence; on `invalid_grant` (`:66-71`) the client must delete the user's API Data — the reader therefore deletes the
   analytics output it wrote before it throws (fold 6), and the duty is met by code rather than by a 30-day timer. Video
   existence (OTA:578, EX:286): the read-back's per-run read of every listed upload, recording `returned` (`:133`,
   `:15-16`), is that check at hourly cadence for the colony's own uploads, once the read-back runs in the same client; the
   analytics reader needs no second one while it does. [inference: that a per-run check satisfies "every 30 days"; the
   clause sets a maximum interval]
6. **A gate and a test for the analytics reader now, cheap and fail-closed** (the brief, Part C items 16-17): no workflow
   and no package script runs `scripts/youtube-analytics.ts` (an assertion mirroring `youtube-madeforkids.test.ts:645-651`),
   and the reader refuses to run unless googleapis.com's verdict is active-eligible, through the read-back's own
   `apiTermsGate` (`scripts/youtube-madeforkids-readback.ts:85-96`), since the same entry covers its API host (T1-RULING
   `:298-301`). The accounts.google.com discovery document it fetches first (`:35`, `:51`) is on a barred host and is not
   this row's (T1-RULING `:298-301`; the brief, Part C): the gate above keeps the fetch from happening until that is ruled,
   which is the fail-closed default the loop's Never asks for (`CHANNEL_LOOP.md:79`).

**REOPEN IF** the analytics row (§1 decision 5) rules that figures computed from Authorized Data may be shown publicly,
in which case decision 3's split is relaxed to what it allows; or the owner declines the analytics consent at Stage A
(then there is no Authorized Data and only §2's regime remains).

**What this does not decide.** The publisher build and the path of its state (constraints given in decision 3); where
the analytics output lives (decision 4's constraint only); whether a median or a derived percentage is itself "Authorized
Data" (decision 3 assumes the stricter until the analytics row rules); the accounts.google.com discovery document; the
regional version of the Terms (EX:544); the suspension kill path (EX:514).

---

## 4. The item handed beside the row: the ten developers.google.com/youtube captures are trimmed through the entry whose read clause covers their host; google.com's `copying` field stays "unread"

**The question as handed** (`CHANNEL_LOOP.md:398` item (6)): google.com's `copying` field "stays 'unread', so
`trim-capture.mjs` (which assigns a capture to its own host's site) never reaches the ten developers.google.com/youtube
captures ... the field is set by a read of google.com's copying clause ..., or the trim's reach is widened to a verdict's
named captures: a decision for the sitting that rules row 28, not before Stage A either way".

**Facts read** (repo). The trim reads the `copying` field of a capture's own site, `siteOf` its meta's url host
(`scripts/trim-capture.mjs:10-13`, `:211-212`); only "barred" is trimmed; "unread" is refused for the whole run (`:85`,
`:90`). google.com is BARRED with `"copying": "unread"` (`terms-verdicts.json:263-268`); googleapis.com is
CONDITIONAL_UNMET with `"copying": "barred"` (`:269-275`), its note recording that the ten captures "belong to google.com,
whose copying is 'unread', so scripts/trim-capture.mjs does not reach them, and their trim to cited lines, or a ruling on
them, precedes Stage A" (`:273`). The ten metas exist (`research/rendered/`: `yk2-dev-made-for-kids-status`,
`youtube-api-compliance-audits`, `youtube-api-quota-cost`, `youtube-api-revision-history`, `youtube-api-videos-insert`,
`youtube-developer-policies`, `yt-analytics-channel-reports`, `yt-analytics-dimensions`, `yt-analytics-metrics`,
`yt-analytics-reports-query`; names only); none is frozen or trimmed (the brief's header, [asm]). The bar they would meet
from the owner's acceptance is OTA:661 (EX:363) with OTA:799 (ii) (EX:447), which takes in documentation on
developers.google.com/youtube (memo condition 3, EX:531; EX's note (b), EX:540). They are `[against-bar]`, D1(1): readable
for our own compliance, never re-fetched, never quoted in anything public (`RULING-2026-09-30-video.md:27-31`).

**RULING.**
1. **google.com's `copying` field is not set.** The field records a read of that site's copying clause and no read was
   made (the field's own definition, `trim-capture.mjs:10-13`; ruling 6.10 row 21's audit reads BARRED sites' copying only
   on request). Writing "barred" without the read would be a field not backed by its source.
2. **The trim's reach is widened by the read that exists.** A verdict entry may name the documentation hosts its *read*
   copying clause covers — googleapis.com's entry gains a field, suggested `coversHosts: ["developers.google.com/youtube"]`,
   resting on OTA:661 with :799 (ii) (EX:363, EX:447) — and `trim-capture.mjs` trims a capture under such an entry's
   `copying` when the capture's own site has `copying` "unread" or no entry, and the capture's url host and path prefix
   match a `coversHosts` item. The capture's own site stays its site for every other purpose (the terms gate, the robots
   verdict); only the copying reach is extended, and only by a named host prefix, never by a wildcard. Fold 8; the dry run
   must list exactly the ten.
3. **When.** Before Stage A is asked, so the owner accepts terms the colony already complies with (memo condition 3,
   EX:531); not urgent before that, the captures predating the bar and being D1(1). The trimmed captures stay readable for
   compliance at the lines this repository cites, as the trim keeps them.

**What this does not decide.** youtube.com's `copying` field (T1-RULING `:596`, item 8); any other BARRED site's.

---

## 5. Stage A's key line: what `research/faceless-youtube/T1-PROTOCOL.md:118-122` must say after this ruling

The bullet at `:118-122` keeps every sentence it has. Fold 7 appends, as the bullet's last sentences:

> Ruled 12.10.2026 (`research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md`): the key reads only the colony's
> own uploads; the state the read-back keeps holds no value the API returned — only the colony's timestamps and the answers
> to its own pre-registered checks (P1, P2, the designation read-back) — and nothing the API returned is committed, logged or
> printed; P-2's kill at two is a stop rule over the colony's own uploads, never a stored or displayed figure. The colony
> reads the Developer Policies' bar on creating derived data or metrics (III.E.4.h) as not reaching a client's own
> lookup-and-act on its uploads; that is the colony's reading of a term the Terms do not define, told to the owner here
> because the owner is who accepts the Agreement, and a compliance communication from YouTube or the text of the
> derived-metrics page reopens it before any further upload. The key and the analytics consent are one API Client in one
> project: a suspension of either stops both readers; the analytics reader's output is Authorized Data and never reaches
> the public repository; and whether the analytics readings K0 and K3 use are themselves derived metrics is ruled by its own
> sitting before this stage is asked (FABLE_QUEUE, the row opened 12.10).

The Stage A re-brief (`CHANNEL_LOOP.md:398` item (1), "main thread, after the two builds") adds the memo's other
conditions — the privacy and terms page, the compliance-mail reader, acceptance and the regional version, the suspension
risk — to the same bullet; this ruling fixes only the sentences above, and the re-brief does not rephrase them.

---

## What this ruling does not decide (collected)

1. The analytics reader's own readings under III.E.4.h and OTA:550 — the new row (§1 decision 5; fold 9).
2. The publisher build: `ExperimentState`'s final shape and path, subject to §3 decision 3's constraints.
3. Where the analytics output lives, beyond §3 decision 4's constraint; the suspension kill path for both readers
   (EX:514; memo condition 8, EX:536) — the Stage A re-brief's.
4. Whether the uploads file's ids and `publishedAt` are API Data (the publisher build's; T1-RULING `:582-597` item 4).
5. The first live read: whether a bare key returns the fields, the envelope, the quota cost (EX:546).
6. The regional version that binds the owner (EX:544; memo condition 5, EX:533).
7. The accounts.google.com discovery document (T1-RULING `:298-301`); the §3 decision 6 gate keeps it from being fetched
   meanwhile.
8. Whether to apply under III.L (OTA:774, EX:391): not needed for the made-for-kids state on this ruling; the analytics
   row says.
9. youtube.com's `copying` field; the repository's visibility (the owner's, `CHANNEL_LOOP.md:258-260`).

## REOPEN triggers (collected)

- A compliance communication from YouTube (OTA:510, EX:251) about the read-back, the count or the state (§1).
- The derived-metrics page III.L links to, read at github grade, defining its terms to reach per-video status actions or
  stop rules (§1); or a change to III.E.4.h or III.E.4.d (OTA:48, EX:41).
- The first live read showing the fields are not returned to a bare key, so the route changes (§1, §2).
- A field the kills need that no colony fact can stand for (§2) — then that field alone goes under 30-day
  refresh-or-delete with a purge that runs when reads stop.
- The analytics row ruling either way on figures computed from Authorized Data (§3 decision 3's split relaxes or
  hardens); the owner declining the analytics consent (§3).

## Folds for Opus

Every fold is ₪0, on Opus, in a worktree with the base check first (`CLAUDE.md`, "Agent worktrees"); none needs the owner
and none makes a live call (the read-back's gate stays closed: googleapis.com is `CONDITIONAL_UNMET`, and no fold changes
a verdict). Worktree agents do not edit `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` or `logs/FABLE_QUEUE.md` (the main
thread applies fold 10 with `scripts/loop-edit.mjs`). After each: `scripts/verify.sh` on the named tests; a mutation plan's
new entries are run under `scripts/sim-tree.sh`; a builder → adversarial reviewer → fixer chain, as the tick-61 builds.

1. **`src/revenue/youtube-madeforkids.ts`** — §2 decisions 2-3: `UploadReadback` becomes the colony-facts record (`:62-86`;
   `firstRead`, `first`, `latest` removed; `firstReadAt`, `firstReadReturned`, `p1Api`, `firstDesignationAt`, `p2ClockAt`,
   `lastPublicAt`, `leftPublicAt`, `contradictedAt`); `unreadEntry` (`:137-138`), `mergeReadings` (`:147-173`: written-once
   fields with `??`, the departure tested against the prior `lastPublicAt`, `p2ClockAt` written only beside
   `firstDesignationAt`), `readbackOf` (`:180-186`), `stayedPublic` (`:198-202`) and `firstUploadWindow` (`:235-253`) as §2
   decision 3 states them; an exported `assertColonyFactsOnly(state)` that throws on any leaf failing §2 decision 2's
   invariant; the header (`:13-21`) and the docs of `stayedPublic` (`:188-197`) and `FirstUploadWindow` (`:208-222`) say
   the state holds no API value and why (this ruling). `MadeForKidsReading` (`:47-60`) is unchanged: it is the in-memory
   read. **Tests, `src/__tests__/revenue/youtube-madeforkids.test.ts`:** every existing `it` keeps its verdict assertions
   with its state literals rewritten (`:124-296`, `:297-503`); new: the invariant holds on every state the fixtures produce
   (walk the JSON; assert no leaf is `"public"`, `"private"`, `"unlisted"`, `"true"` or `"false"`, and every string leaf is
   an ISO time, the line id or a video id); `p2ClockAt` is null for the entry's life when the first designation read was
   not public, and a later public designated read does not set it (today's `:200` behaviour); `lastPublicAt` refreshes
   and `leftPublicAt` is set from the prior `lastPublicAt`; `readbackOf` gives the declared value from
   `firstDesignationAt` alone; `assertColonyFactsOnly` throws on a hand-made state carrying `"public"`. **Mutation plan
   `src/__tests__/revenue/mutations/youtube-madeforkids.json`:** re-point every T61 entry whose `find` moved (T61-SP1 to
   SP4, FW2 to FW4, the FR entries) to the new lines; add, with the builder's tick as prefix: `readbackOf`'s
   `firstDesignationAt !== null` → `true`; `stayedPublic`'s `>=` → `>` on the new comparison; `p2ClockAt`'s public
   condition dropped; `leftPublicAt`'s `lastPublicAt !== null` → `true`; `p1Api`'s `&&` → `||`; the written-once `??` on
   `firstReadAt` → always overwrite; `assertColonyFactsOnly`'s throw removed. Record the run in `mutations/README.md`
   (`:32`, `:98`).
2. **`src/revenue/experiments.ts`** — §1 decision 2(b): `:292` names the contradicted uploads by ordinal, as `:276` does
   (`upload i of n read back the designation this line does not declare ... this channel's line is killed, not both
   YouTube lines — never a replacement channel`), with no tally; `:280-282` and `:45-65` gain one sentence each: the count
   is a stop rule, never stored, printed or shown (ruling 12.10 row 28 §1), and each read-back entry is the line's own
   declaration or the colony's override record, never YouTube's current value. `MADE_FOR_KIDS_OVERRIDES` (`:210`) and
   every pin are untouched. **Tests:** `t1-made-for-kids-kill.test.ts:50-68` asserts the kill note matches
   `/upload \d+ of \d+/` and does not match `/\d+ made-for-kids overrides/`; `:119-120` stands. Add the note's two forms to
   the mutation plan beside the file (the builder names it; none exists for `experiments.ts` today — check
   `mutations/README.md` first).
3. **`scripts/youtube-madeforkids-readback.ts`** — §2 decision 4: the summary line (`:186-190`) prints per upload one of
   `as-declared`, `contrary`, `unread` and never a designation or a privacy status; `assertColonyFactsOnly(next)` runs
   before `writeFileSync` (`:183-185`), and a failure logs and exits 1 with nothing written; the WRITES paragraph
   (`:15-20`) describes the new shape and says no API value is written (this also carries tick 61's items (4) and (5),
   `CHANNEL_LOOP.md:398`). **Tests (`:505-640`):** the written file passes the invariant; the printed lines contain none of
   the five words as a read value (`declares made for kids: false` at `:188` is the line's own declaration and stays);
   `:541-563` asserts the summary's three words. **Mutation plan:** the invariant call removed before the write; a
   designation string leaked into the summary.
4. **`src/revenue/publisher-guard.ts`** — no code change; the `ExperimentState` doc (`:46`) gains §3 decision 3's
   constraint: as typed it holds analytics-derived readings and may not be committed to the public repository; the
   publisher build keeps it out of the public tree or splits it. `READING_FIELDS` (`:136-148`) unchanged.
5. **`scripts/youtube-analytics.ts`** — §3 decisions 4 and 6: (i) the output path leaves `state/colony/measurements/`
   (`:110`) for a path the workflow never force-adds, and until the privacy-and-terms build names a private store the
   script writes `readings` only and never the `raw` tables (`:114`); (ii) a terms gate before the discovery fetch (`:51`):
   import `apiTermsGate` and `readTermsVerdicts` from the read-back and refuse (exit 2, nothing fetched) unless
   googleapis.com is active-eligible; (iii) the header (`:1-19`) names the gate and the output rule. **Tests,
   `src/__tests__/revenue/youtube-analytics.test.ts`:** no workflow and no package script runs the script (mirror
   `youtube-madeforkids.test.ts:645-651`); the gate refuses under the committed verdicts; the output path is not under
   `state/colony/`; the written JSON has no `raw` key while no private store is configured. A mutation plan beside it
   (none exists): the gate inverted; `raw` written; the path moved back.
6. **`scripts/youtube-analytics.ts:66-71`** — §3 decision 5: on `invalid_grant`, delete the analytics output the script
   wrote (whatever path fold 5 gives it) before throwing, and say so in the thrown message; test with a fake fetch answering
   `invalid_grant` and a pre-existing output file.
7. **`research/faceless-youtube/T1-PROTOCOL.md:122`** — append §5's quoted sentences to the Data API key bullet, as its
   last sentences; `:138-139` (Recording) gains: "the readings are kept; the API field values behind them are not stored
   (ruling 12.10 row 28 §2)". No other line.
8. **`scripts/trim-capture.mjs` and `research/channel-loop/terms-verdicts.json:269-275`** — §4: googleapis.com's entry gains
   `"coversHosts": ["developers.google.com/youtube"]`; the trim reaches a capture through an entry whose `coversHosts` item
   matches the capture's url host and path prefix when the capture's own site has `copying` "unread" or no entry; the dry
   run lists exactly the ten metas named in §4 and no other; the terms-verdicts tests (`terms-saved-copies.test.ts`,
   `prize-terms-audit.test.ts`'s T61-YTR entries, `mutations/README.md:30`) keep the note's clauses they check — the
   googleapis.com note's clause "are not decided here: a Fable sitting rules before Stage A" (`:273`) becomes "ruled 12.10
   (`research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md` §1-§2): the per-upload verdicts, the colony's
   timestamps and the override count are the colony's lookup-and-act on its own uploads, not derived metrics under
   III.E.4.h, on the ruling's conditions; the state stores no API value, so III.E.4.d is met by construction", and the
   note's sentence on the ten captures becomes "their trim runs through this entry's `coversHosts` (ruling 12.10 §4)";
   memo condition 3's clause on the ten captures and OTA:550's exception for agents the user approved stay in the note.
   Mutation plan `mutations/trim-capture.json`: the prefix match widened to any host; the "unread own site" condition
   dropped. The trim's `--apply` on the ten runs before Stage A is asked, after the colony is back on main.
9. **`logs/FABLE_QUEUE.md`** (main thread, `loop-edit.mjs insert-after` on row 29) — a new row: "the analytics reader's
   readings (`medianStrangerViews`, `strangerWatchHours28d`, the derived `averageViewPercentage`;
   `src/revenue/youtube-analytics.ts:129-142`; K0 and K3, `experiments.ts:311-342`) under III.E.4.h (OTA:596, :598, :774;
   EX:307, :314, :391) and OTA:550 (EX:272): are they derived metrics the Policies bar, is III.L the route, and what may K0
   and K3 read if so; may a figure computed from Authorized Data appear in a public note. Ruled before Stage A is asked.
   Reads: this ruling §1 decision 5 and §3 decision 3; EX; the analytics module and reader; `T1-PROTOCOL.md:106-117`,
   `:138-139`." One decider, the next free seat; its brief built by Opus clerks on the 9.10 brief's form.
10. **Loop files** (main thread, `scripts/loop-edit.mjs`): `logs/FABLE_QUEUE.md:52` status → "**DONE 12.10**
    (`research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md`): (1) the per-upload verdicts, the colony's
    timestamps and the override count are the colony's lookup-and-act on its own uploads, not "derived metrics" under
    III.E.4.h, on three conditions (never stored or shown as a figure, ordinals not a tally, `killAt: 2` unchanged); (2) the
    state keeps only the colony's timestamps and the answers to its checks — no API value is ever stored, committed, logged
    or printed, so III.E.4.d is met by construction; (3) the duties follow the data: the made-for-kids state carries none of
    the Authorized Data duties, the analytics output and any merged record carry all of them and leave the public tree;
    §4 the ten developers.google.com/youtube captures are trimmed through googleapis.com's `coversHosts`; §5 Stage A's key
    line; a new row for the analytics readings; folds 1-9 queued". `logs/CHANNEL_LOOP.md:398`: item (2) → done, this file;
    item (1)'s parenthesis "refresh or purge at 30 days, de-listed entries purged, raw fields never committed; the analytics
    reader's Authorized Data output likewise" → "no API value stored at all, the state colony facts only (ruling 12.10 row
    28 §2); the analytics output and its `raw` tables out of the public tree (§3)"; item (6) → decided, §4 here. `:26` (the
    §0 Fable cell): the 12.10 sitting's outcome for row 28. §8 (`:309`): the new row. `logs/CHECKPOINT.md`: the tick's entry
    names this file and the folds' order (1-3 first, as one build; 5-6 second; 8 third; 7 and 4 with either).
11. **Housekeeping, optional.** One dated line after EX:545 ("Ruled 12.10: `research/channel-loop/RULING-2026-10-12-
    youtube-derived-metrics.md` §1-§3; the analytics readings are a new row"), outside every fenced block, so
    `terms-saved-copies.test.ts` is unaffected; `research/youtube-kids/KIDS-LINE.md`'s read-back sentences, if any names
    `first` or `latest`, follow fold 1's shape.
