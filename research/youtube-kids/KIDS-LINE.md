# `kids-explainers`: the kids YouTube line, as ruled (4.10.2026)

The design file of the colony's second YouTube experiment, written 4.10.2026 by an Opus fold agent (fold action 4) from
the ruling of the kids-YouTube board, `research/channel-loop/RULING-2026-10-04-kids-youtube.md` ("the ruling";
`logs/FABLE_QUEUE.md` row 23). It is the one-page design the builder reads (ruling §9 rule 2(e)). **It holds no content
script:** none is written until the gates, the reader, this file and the sub-brand list are merged and the render slot
opens (ruling §9 rule 2). Every item below points at the ruling's section; where the ruling rests on a source, the grade
given is the ruling's. Where this file and the ruling differ, the ruling wins.

**Status.** Admitted 4.10.2026 as an experiment, held by protocol behind T1 (ruling §11). No revenue target, ₪0, nothing
rendered, uploaded or opened, and no new owner step. Money today: ₪0.00.

**The instruction it serves** (`MISSION.md:405-423`, repo), verbatim from `MISSION.md:407`:

> שהיוטיוב יהיה גם של ילדים וגם יוטיוב רגיל נתתי אפשרות לא אמרתי רק זה

**Grades** (the ruling's header, from the 1.10 brief's legend): `rendered` (a runner capture under `research/rendered/`),
`github` (read from github.com or raw.githubusercontent.com), `snippet` (a search-engine snippet), `repo` (a repo file or
an earlier repo finding), `inference` (reasoning; no source says it), `none`.

**The standing rule on `[against-bar]` sources.** Every youtube.com and support.google.com capture, and by the 1.10
brief's inference every developers.google.com capture, is marked `[against-bar]`: the runner may no longer fetch those
hosts (`TERMS_BARRED` in `scripts/render-watch.mjs`; `research/channel-loop/terms-verdicts.json`). Such a source is read
**only** for (i) the colony's own compliance or (ii) a decision not to do something (the 30.9 video ruling's 16(d) D1(1),
`research/channel-loop/RULING-2026-09-30-video.md`), and it is never re-fetched. An item below that rests on one says
"[against-bar], compliance" or "[against-bar], decision not to act". The captures and their lines are cited in the
ruling's sections, not repeated here; ftc.gov and fortune.com have no terms verdict and are "rendered, no verdict".

---

## §2 Shape and exclusions

1. **One shape, `kids-explainers`** (ruling §2 rule 1, repo): English; declared made for kids; for children who can
   read; one question answered from one of T1's cleared open datasets (C3, C7, C8, C9, `research/faceless-youtube/DATASETS.md:30-47`;
   energy, health and finance excluded, `:59`); charts drawn by code; Kokoro narration from the English voices (§5); no
   music, no stock, no generative imagery; 16:9 long-form as T1 (`research/faceless-youtube/T1-PROTOCOL.md:51-53`). It
   runs on chart-explainer's pipeline and passes G1-G10 unchanged, plus G11 (§6) and G7-k (§4), so every number is
   machine-checked and no advice is given (G2).
2. **The children's register** (short sentences, plain words, every number spoken as words) is a spec rule. Any
   readability threshold the spec adopts cites a github-grade source or is marked inference and used as a diagnostic,
   never as a quality claim: no file holds a reading age (ruling §2 rule 1; the 1.10 brief's Part C 4).
3. **Excluded by rule, as decisions not to act** (ruling §2 rule 2; grounds: YouTube's made-for-kids factors and
   kids-quality principles, [against-bar], decision not to act; the FTC's own post, rendered, no verdict):
   - songs, rhymes, stories or poems for children;
   - cartoon characters, mascots, puppets, toys, surprise eggs, unboxing;
   - "learn colours", "ABC", "numbers" and any preschool or toddler framing;
   - child figures or characters in thumbnails;
   - a narrator posing as a teacher or friend (the narrator says what it is, §4).

   The same grounds keep out what YouTube's low-quality kids principles name: heavily promotional content, deceptively
   educational content, audio that is hard to follow, keyword stuffing, and templated or mass-produced output (ruling §2,
   [against-bar], decision not to act).
4. **Closed and rejected** (ruling §2 rule 3): **A-he** (Hebrew) is closed until "Not ruled here" 2 is met (below);
   **B** (guides about the Kids app) stays rejected as ruled 30.9; ASSESSMENT's **A** (pre-readers) stays closed under
   16(c)(2). The owner's instruction is met by rule 1: YouTube is two lines, T1 and `kids-explainers`.
5. **Acquisition channel and non-public input** (ruling §2, constraints 7 and 8, repo): YouTube's own search and
   recommendation, measured by the Analytics traffic-source split exactly as T1's; the non-public input is the one T1 was
   accepted on, accumulated channel history. That is weak, which is why the line is an experiment with no revenue target.

## §3 Audience

1. **Children who can read the declaration**, as `MISSION.md:419` sets it (ruling §3 rule 1, repo). No age number is
   written anywhere public: no file holds one, and the under-13 line YouTube gives is a US definition ([against-bar],
   compliance). The channel and every video are declared made for kids (§6); the parent-facing description says who it
   is for (§4).
2. **The declaration does not depend on a reading rate** (ruling §3 rule 2): the on-screen tag stays in every frame for
   the whole video, and the spoken sentence carries it to a child who reads slowly. `CPS = 14.0`
   (`products/parent-guides/render.py:59`, repo) cites no source and was set for adults; it is not reused for children as
   a claim, and any timing rule in the spec is marked inference.
3. **Widening to pre-readers is the owner's alone** and is not asked (ruling §3 rule 3; "Not ruled here" 1).

## §4 The AI declaration: the three pinned texts, verbatim

The strings are the ruling's, character for character (ruling §4 rules 1-2). The gate build pins them in
`src/revenue/publication-gate.ts` (fold 6) and chart-explainer's Python constants repeat them under a parity test (fold 9).

- `KIDS_SPOKEN_DECLARATION`, spoken first: the opening narration lines of every video.

  > This video was made by a computer program, not by a person. The voice is a computer voice, not a real person. Every number comes from real data, listed under the video.

- `KIDS_ON_SCREEN_TAG`, shown throughout: an English tag in every frame, inside the safe area the renderer already keeps
  (the `products/parent-guides/README.md:43-48` pattern), never only on an end card.

  > Made by a computer program · computer voice · not a person

- `KIDS_AUDIENCE_SENTENCE`, for the parent: the first sentence of every description, and of the channel's About text.

  > Made for children who can read. This channel is set as made for kids.

Around them (ruling §4 rules 1-4):

1. The description opens with `KIDS_AUDIENCE_SENTENCE`, then `SYNTHETIC_VOICE_DISCLOSURE` verbatim
   (`src/revenue/publication-gate.ts:134-136`, repo), then the data attribution G7 already requires. The About text
   carries the same two sentences. `containsSyntheticMedia = true` on every upload, as T1.
2. Saying "made for kids" in the metadata is deliberate: it matches the designation of §6, and a mismatch between
   metadata and setting is what YouTube names ([against-bar], compliance) and what the FTC read as evidence of the
   intended audience (rendered, no verdict).
3. **G7-k** fails a manifest whose narration script does not open with the spoken sentence or whose renderer did not
   assert the tag for every frame (ruling §4 rule 1). Fold 6 adds to it the description order above, the voice set
   (§5), and a lint of title, description and tags for §2 rule 3's words, and of the thumbnail brief for any child,
   character, mascot or toy.
4. **Never relies on YouTube's labels.** YouTube's label "may appear" and the Kids app's labels are in development; our
   declaration is ours and always there (ruling §4 rule 3).
5. The pinned texts are English because the line is English; a Hebrew line would pin its own (ruling §4 rule 4).

## §5 Voice set

1. **English only, from the 28 live keys** (ruling §5 rule 1): one of the 28 `en-us`/`en-gb` ids that are live keys in
   hexgrad's `voices.js` at `dfb907a` (lines 7-203, github), pinned per video in the spec. G7-k refuses any other id for
   this line; fold 6 names the set `KIDS_VOICES` and asserts it is a subset of `KOKORO_82M_VOICE_LICENCE.voices`.
2. **P-1 is a licence gate, not a language gate, and is not narrowed** (ruling §5 rule 2): `ff_siwis` and the five
   Japanese ids stay on P-1's allowlist. One set of weights is trained on one dataset, so every voice is downstream of the
   card's CC BY audio equally, and striking two groups would assert a voice-to-dataset mapping nobody holds [inference];
   CC BY 3.0 and 4.0 permit commercial use and ask for attribution, which the author's card gives (rendered, huggingface.co
   `NOT_BARRED`); the colony publishes synthesised speech, and no rendered text read makes the attribution attach to that
   output [inference]. **REOPEN** if a rendered CC BY text or a licensor's statement from a permitted host says it does:
   then every voice is affected together, the attribution goes into the fixed description sentence, and no voice is
   struck alone.
3. **Hebrew narration does not publish** (ruling §5 rule 3): no official `he` voice (github); `he_shaul` and
   `voices-hebrew.bin` are refused by name (`src/revenue/publication-gate.ts:259-267`, repo); `ef_dora` through Phonikud
   is a held-sample mode only.

## §6 Designation and read-back

All YouTube-help grounds in this section are [against-bar], compliance; the FTC's post is rendered, no verdict.

1. **Designated made for kids twice** (ruling §6 rule 1): the kids channel's audience is set to made for kids at channel
   level in the Stage A sitting (one click inside it, §7), and every upload also sends `selfDeclaredMadeForKids = true`
   through the publisher (`research/youtube-kids/ASSESSMENT.md:420`). **G11:** a manifest for this line whose `madeForKids`
   is not `true` fails; a manifest for T1's line whose `madeForKids` is not `false` fails; `null` fails for both. No video
   on the kids channel is ever not made for kids.
2. **Read back, every upload** (ruling §6 rule 2): after each upload a reader fetches `status.madeForKids` through the Data
   API (`videos.list`, `part=status`, on the API key created at Stage A; `ASSESSMENT.md:421-430`). `true` is the only
   passing reading. `false` means the machine route did not carry our designation: the line is **killed**
   (`K-mfk-designation`, KILL-4), because the only remedy would be a Studio click per upload, a per-item owner action;
   never relabelled, never re-uploaded, never a Studio session. `null` freezes the next upload and escalates (§10).
3. **The colony's own conduct collects nothing from a child** (ruling §6 rule 3): comments and notifications are off by
   YouTube's rule on made-for-kids content; the channel has no Posts, no memberships, no mailing list, no embedding page
   with a counter (the PostHog counter is never placed on a page that embeds a kids video), and no link to any colony
   site that tracks. Ads are YouTube's, contextual by YouTube's own rule. This is what code can do; it does not close the
   legal question.
4. **The legal exposure is stated once, not asked** (ruling §6 rule 4): the designation is the mechanism the FTC
   settlement created for channel owners, and this line uses it as written. Whether residual exposure under COPPA or any
   other law attaches to the legal identity behind the channel is a question no file settles; YouTube's pages say to ask
   counsel; the owner has said no lawyers and has asked for the line. The owner's summary says so once, in the held row's
   note (the main thread's, fold 11), and "עצור" stops it at any time (`MISSION.md:349`). No step is invented.
5. **Money** (ruling §6 rule 5): an experiment with no revenue target, judged by its own gates (`src/revenue/types.ts:31`,
   "never counted as live"), like T1. It does not apply for YPP (Stage B) before T1's channel has passed K3 and been
   admitted, and its Stage B is a separate board decision: one AdSense payee serves both channels, and a kids-quality
   action on either "may" reach the other. No made-for-kids RPM is written anywhere as a forecast; the only figure that
   will ever count is a ledger row.
6. **No mature themes, by construction** (ruling §6 rule 6): T1's cleared datasets with health, finance and energy
   excluded; G2's no-advice rule; the persona rule on sensitive topics kept out of reach by topic, as for T1.

## §7 Account and sub-brand

1. **Shared login, separate channel** (ruling §7 rule 1): `kids-explainers` is a second Brand Account channel on T1's
   dedicated Stage A Google account, under its own sub-brand name, never under `chartsplained` and never under `mehudak`.
   Grounds: the risk 16(c)(5) isolated was other lines' Google services on the same login, which a second YouTube channel
   does not add; the YouTube-to-YouTube enforcement radius is the person's and the payee's, which no second login escapes
   ([against-bar], compliance; P-3 in `src/revenue/rails.ts`, repo); constraint 2 rejects an account per store; a second
   Stage A is a step the mandate does not require (`MISSION.md:436`). RED-TEAM's "dedicated to this line" is read as
   dedicated to the colony's YouTube experiments: the account still carries no Search Console, no Cloud project beyond
   the analytics-only one, and no other line.
2. **When it is created** (ruling §7 rule 2): if `kids-explainers` has cleared its build gate (§9) when Stage A is asked,
   the kids channel is created in the same sitting (a Brand Account channel under the kids sub-brand, channel-level
   audience set to made for kids, connected to the publisher), about five more minutes inside the one sitting, written
   into `research/faceless-youtube/T1-PROTOCOL.md`'s Stage A text (done 4.10, this fold) and not a new numbered step. If
   not, it is one click-set added to the held list, asked only after a qualifying finding in the batched list, never
   alone and never as a reminder.
3. **Sequencing protects T1, not the login** (ruling §7 rule 3): the kids channel uploads nothing until T1's first upload
   has passed P1-P4 and its read-back (§8); the kids line's `K-policy` kills it on the first platform signal, the same
   day, so a kids-side action is caught before it compounds; its Stage B never precedes T1's (§6 rule 5).
4. **A sub-brand name without the YouTube probe** (ruling §7 rule 4). Criteria: short topic words a child can read; no
   "kids" or "children" in the name; none of §2 rule 3's words. The list is checked by `scripts/brand-check.mjs` on three
   probes only (.com, GitHub, netlify.app); the YouTube handle is tried by the owner at Stage A, and if it is taken the
   next name in list order is used.
   **The list is not written with this file.** `research/measurements/kids-subbrand-candidates.txt` is written beside the
   brand-check fix (fold 8), in that build: `.github/workflows/brand-check.yml:20-25` runs on any push that changes a
   `*-candidates.txt`, and today `scripts/brand-check.mjs:46` probes `https://www.youtube.com/@<name>` from a runner, while
   youtube.com is `BARRED` (`research/channel-loop/terms-verdicts.json:460-464`, repo). A list pushed before the fix would
   probe youtube.com against its bar. The 30.9 08:53 run (`research/measurements/t1-subbrand-check.md:3`) was made after
   the bar and is not repeated (ruling §7, the compliance finding).
5. **REOPEN** (ruling §7 rule 5): rule 1 reopens if the Open Terms Archive copy of YouTube's Community Guidelines on GitHub
   states that termination of one channel bars the Google account's other channels; then the kids channel moves to its
   own Google account before its first upload (and only then does a second Stage A exist, asked in the batch). Also if
   Google refuses the second channel at Stage A: then it waits, and nothing else is substituted.

### The termination-radius read ("Not ruled here" 3), 4.10.2026: read; rule 1 stands

- **Source (github):** `OpenTermsArchive/vlopses-us-versions`, path `YouTube/Community Guidelines.md`, commit
  `4d29ee78ddf67a84cf2f5dc5001f331754ef71da` (`4d29ee7`, "Record new changes of YouTube Community Guidelines", 23.7.2026),
  the latest change to that file on `main` in the repository's commit list for the path (github.com, read
  2026-10-04T08:05:45Z). The file was read at that SHA from raw.githubusercontent.com, 2026-10-04 between 08:05:45Z and
  08:06:37Z, with WebFetch: two reads, one asking for every sentence containing "terminat" verbatim, one an exact-string
  search. The path is the one `research/faceless-youtube/scouts/policy.md:513-517` names, and the commit is the capture
  that note already quotes as `4d29ee7`. No other host was fetched.
- **What it says about termination** (verbatim, github):
  - "We may terminate your channel or account for repeated violations of the Community Guidelines or Terms of Service."
  - "We may also terminate your channel or account after a single case of severe abuse, or when the channel is dedicated
    to a policy violation."
  - "If you get 3 strikes within 90 days, your channel may be terminated."
  - Under "Additional policies", on circumvention: "Posting content previously removed for violating our Terms of
    Service, content from creators with a current channel restriction, or content from creators who have been terminated
    is considered circumvention under our Terms of Service. If you post such content, it may be removed, and your YouTube
    channel may also be penalized or terminated. This may also apply to other channels you own."
  - Not found (exact-string search): "any other YouTube channel", "create any other", "create new channels", "all of your
    channels", "all channels", "any channels", "Google Account". The page points to a separate help page for the rest
    ("Learn more about channel or account terminations."); that page is on support.google.com, barred, and was not read.
- **Finding:** the Community Guidelines text does **not** state that termination of one channel bars the Google
  account's other channels, so rule 5's reopen does not fire and rule 1 stands. Two things it does say bear on the
  radius: an account, not only a channel, may be terminated; and circumvention enforcement "may also apply to other
  channels you own". The second is scoped to the owner, not to the login, so a separate Google account would not have
  escaped it; that is the ruling's own ground for rule 1 [inference]. What an account-level termination does to a Brand
  Account channel the account manages is not stated on this page [none].
- **Grade and its limit:** github. WebFetch hands back a model's reading of the page, not its bytes: the quotes above were
  asked for verbatim and the decisive phrase ("other channels you own") was confirmed by a second, exact-string read, but
  no line numbers exist. A runner's byte-level read of the same SHA (`grep -n terminat`) would make them line-cited.

## §8 Order and kills

1. **No web arm** (ruling §8 rule 1). The cheapest stranger-find test is the line's first video on YouTube, read by K0 at
   its own day 56; nothing is built that pretends to measure children's reach from a web page (a page embedding a
   made-for-kids video must have tracking off, [against-bar], compliance).
2. **It waits on T1, and runs beside T1 only at ₪0** (ruling §8 rule 2). The order: T1's web read at day 56 passes →
   Stage A (with the kids channel, §7 rule 2) → T1's first upload passes P1-P4 and its `madeForKids` read-back returns
   `false` (proof that the machine route carries a designation and that the reader works) → the kids line's first upload,
   its D0. Until then the loop does only §9's ₪0 work for this line. If T1's web arm fails (`stage_a_never_asked`), Stage
   A is never asked and the kids line falls with T1's YouTube test, recorded in `docs/REJECTED.md` with the reopen "a
   Stage A exists for another reason".
3. **Pre-registered kills, under their own pin, never T1's `PINNED_GATES_SHA256`** (ruling §8 rule 3):
   - `K-mfk-designation` (KILL-4): any upload reads back `madeForKids = false`, or the publisher cannot send
     `selfDeclaredMadeForKids`, or the channel-level setting cannot be made in the Stage A sitting: kill. Never a Studio
     click, never a relabel (§6 rule 2).
   - `K-policy` (KILL-3): any warning, strike, removal, auto-privating, age-gating, "limited or no ads" on kids-quality
     grounds, or any YPP action kills the line the same day; never a workaround channel ([against-bar], compliance).
   - `K-T1k`: the kids channel's own first-upload window, P1-P4 as T1's (`research/faceless-youtube/T1-PROTOCOL.md:72-82`),
     but read through the publisher's response and the Data API (`videos.list`, `part=status`, `privacyStatus`), never a
     fetch of the watch page (youtube.com is barred). Fails → kill.
   - `K-supply`, `K0`, `K3`, `K-cash`, `K-compute` with T1's numbers, on the kids channel's own D0
     (`src/revenue/experiments.ts:108-120`, repo): 6 videos by day 42; median engaged stranger views below 35 at day 56,
     or unmeasured; below 307 hours per 28 days at day 112, or unmeasured, and 1,200 or more goes to the board; at most 60
     runner minutes and ₪20 per video.
   - The `youtubeProduct = KIDS` split is a **diagnostic written at every read, never a kill**: zero Kids-app views is the
     expected outcome for a new AI-made channel on the one press statement held, and says nothing about children watching
     elsewhere [inference]. It supersedes the pre-written A kill (`docs/REJECTED.md:1686-1687`;
     `research/youtube-kids/ASSESSMENT.md:466-467`). The dimension is cited today only from an `[against-bar]` capture; a
     runner reads it at github grade before the diagnostic is coded ("Not ruled here" 5).
   - `K-mfk-read`: §10.
   - No `K-web` exists for this line (rule 1).
4. **P-2's wording, unified** (ruling §8 rule 4): "a YouTube-set made-for-kids override on a video of a channel that
   declares not made for kids (today T1): the first override → private plus one appeal; the second kills that channel's
   line." On the kids channel the mirror-image event is `K-mfk-designation`. "Kills the YouTube line" means the channel's
   line, not both.
5. **The publisher's free tier is shared** (ruling §8 rule 5): T1's seven uploads come first; the kids line uses what
   remains of the ten a month and never displaces T1; if the tier's profile count (2) is real, the kids channel is the
   second profile and no third YouTube channel exists on the tier.

## §9 What is built, and when

1. **Nothing of the kids line is rendered while built-but-unlaunched is 6/6** (ruling §9 rule 1). The first render (one
   video, the stranger-find test, not six) starts when BBU < 6 and the build slot is free, and is itself one BBU item
   until Stage A.
2. **Built first, now, at ₪0 and outside the cap, as one build** (ruling §9 rule 2): (a) `KIDS_EXPLAINERS_EXPERIMENT` in
   code with §8's kills and its own pin; (b) G11 and G7-k with §4's pinned sentences; (c) the `madeForKids` reader, built
   and fixture-tested before Stage A is asked; (d) the kids sub-brand list and the three-probe brand check (§7 rule 4);
   (e) this file.
3. **Counts** (ruling §9 rule 3): `kids-explainers` enters "experiments measuring" (2/3) only at its first upload; until
   then it is "admitted, held by protocol", outside every count but the queue.

## §10 The unread made-for-kids count

1. **The read is a precondition of uploading** (ruling §10 rule 1): no upload on any colony YouTube channel while the
   `madeForKids` reader is not built and tested, and Stage A is not asked before it exists.
2. **A due `null` freezes and escalates; it does not kill by itself** (ruling §10 rule 2): `K-mfk-unmeasured` stays an
   escalation, stricter by one rule: it also blocks the next upload on that channel until the reading exists. A missing
   safety read is an instrument fault under KILL-1, fixed, read and recorded.
3. **It kills at the outcome read** (ruling §10 rule 3): if a video's `madeForKids` reading is still `null` on the
   channel's K0 day, K0 is unmeasured and `K0-unmeasured` kills. "Measured" at K0 now includes the designation read for
   every uploaded video, for T1 and `kids-explainers` alike.

## Not ruled here (the ruling's list, one line each)

1. Pre-readers: the owner's alone; not asked.
2. Hebrew kids content: closed until a Hebrew voice's weights licence and training-data statement are both rendered as
   commercial from a permitted host (passing P-1) and a native Hebrew listener approves; the second is not asked.
3. The termination radius: read 4.10, above (§7); rule 1 stands.
4. Whether the machine route carries the designation: known only at the first live read-backs.
5. The `youtubeProduct` dimension at a permitted grade: a github read before the diagnostic is coded.
6. Made-for-kids revenue and Hebrew ad fill: unknowable before YPP; not needed for an experiment with no target.
7. The Kids app's admission path for AI-made channels: unrenderable; the line does not depend on it.
8. COPPA's current penalty and its reach to an Israel-based operator: not needed by the line.
9. The repo-public decision: the owner's; every ₪0 render depends on it.
10. Whether Google issues the second channel, or asks for more than a phone, at Stage A: known only there.
11. T1's P2/P4 reads of the watch page: flagged in `T1-PROTOCOL.md` (the P2 and P4 rows) for T1's own row, not ruled here.
