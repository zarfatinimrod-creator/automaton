# Ruling of the kids-YouTube board, 4.10.2026 — `logs/FABLE_QUEUE.md` row 23

**Sitting.** The channel loop's Fable sitting for FABLE_QUEUE row 23 (the owner's 30.9 instruction, `MISSION.md:405-423`),
planned for 1.10.2026 ~07:11 UTC (`logs/CHANNEL_LOOP.md:25`; `logs/FABLE_QUEUE.md:47`) and held 4.10.2026 ~07:25 UTC. The
main thread's brief to this board says a usage limit delayed it three days; no file read records that limit (the latest
log is dated 30.9; `logs/CHECKPOINT.md:3` is 30.9 ~21:15 UTC). Model Fable 5.1, one board, no subagents, no web fetch, no
git write. Row 18 is another agent's and is not ruled here.

**Tree.** `f2fca6d` on `claude/new-session-j071dx`, clean (`git status --short` empty). The brief was assembled at
`e6c7a2f`; between the two, ticks 31-37 landed, and five files this ruling relies on changed (`git diff --stat e6c7a2f
f2fca6d`: `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `research/channel-loop/terms-verdicts.json`,
`src/revenue/owner-steps.ts`, `src/revenue/types.ts`). Every pointer below was re-opened with `sed -n`/`awk` or
`grep -n -F` on `f2fca6d`; where the brief's paraphrase and a file differ, the file is cited. "Pointers moved" at the end
lists drift beyond Part C's housekeeping.

**Read.** `MISSION.md` in full; `logs/FABLE_QUEUE.md:47` (row 23) and `:42` (row 18, context);
`research/channel-loop/SITTING-2026-10-01-BRIEF.md:1-148`, Part A (`:149-589`) and Part C (`:835-948`);
`research/channel-loop/RULING-2026-09-30-video.md` 16(c) (`:213-257`), 16(d) D1 (`:24-50`) and "What stays open" 5 and 9
(`:374-377`, `:382-383`); `RULING-2026-09-30-documents.md:1-40` for the house format; `research/channel-loop/BOARD-LOOP.md:13-17`,
`:60-69`, `:116-120`; `logs/2026-09-30-p1-p3-in-code.md`; the code, notes and captures the brief points into, as cited.
Short names are the brief's (`BRIEF:38-50`): a bare capture name is `research/rendered/<name>`; `RULING` is the 30.9
video ruling; `ASSESSMENT.md` and `RENDER-CHECK` are under `research/youtube-kids/`; `T1-PROTOCOL.md`, `RED-TEAM.md`,
`DATASETS.md`, `PREREG-DECISIONS.md`, `scouts/policy.md` under `research/faceless-youtube/`; `publication-gate.ts`,
`experiments.ts`, `rails.ts`, `types.ts`, `owner-steps.ts` under `src/revenue/`.

**Grades** as the brief defines them (`BRIEF:12-14`): `rendered`, `github`, `snippet`, `repo`, `inference`, `none`.
**Provenance marks** kept: `[against-bar]` on every youtube.com and support.google.com capture and, by the brief's inference
(`BRIEF:23-25`), every developers.google.com capture; such a capture is cited here only for (i) our own compliance or (ii) a
decision not to do something (D1(1), `RULING:27-31`), and carries `[D1 use limit]` where the brief marks it. ftc.gov and
fortune.com have no terms verdict (`BRIEF:32-33`) and are cited as rendered "(no verdict)". huggingface.co is `NOT_BARRED`
(`terms-verdicts.json:164-167`); github.com is `CONDITIONAL_MET` while the repo is public (`:114-118`). All `repo`.

**Standing rules applied** (`MISSION.md`, re-opened at `f2fca6d`): one-time identity and payout steps only, "Everything
else is ours" (`:432-433`); one ordered checklist (`:435`); "Never invent a step that isn't required" (`:436`); never an
account in the owner's name (`:437-439`, `:422-423`); the owner does not talk to customers (`:440`); "no selling, no
talking, no camera, no manual ops" (`:211`); no ToS violations, honest value outranks the target (`:454-459`); ₪0,
"Nothing is bought" (`:352-354`), fees out of a sale allowed (`:359-360`); the brand as the only public face (`:276-279`,
`:310-312`); AI declared (`:422`); one platform banning us must not take the company down (`:44-45`); stores multiply,
accounts do not (`:126-131`); no account farm (`:133-138`); a line is not built before its acquisition channel is named,
and the first thing built is the cheapest stranger-find test (`:188-190`); name the non-public input (`:216-218`); waiting
never stops the loop, but built-but-unlaunched inventory is capped (`:332-335`); money means the ledger (`:442-445`);
KILL-4 (`BOARD-LOOP.md:67`); the Never list (`CHANNEL_LOOP.md:73-79`), in particular no per-item owner action (`:76`) and
no fetch of a barred site (`:78`). The owner is "the owner".

**Money today: ₪0.00** (`CHANNEL_LOOP.md:26`, repo).

---

## 1. The frame: what the owner's instruction changed, and what stands

- The instruction, verbatim (`MISSION.md:407`, repo):

  > שהיוטיוב יהיה גם של ילדים וגם יוטיוב רגיל נתתי אפשרות לא אמרתי רק זה

- The repo's reading (repo): two lines; 16(c)'s D overridden "as to direction"; a sitting "designs and admits it ... with
  its own pre-registered kills" (`:411-415`); the audience default, "children who can read the declaration (on screen and
  spoken), with a parent-facing description", until the owner says otherwise (`:417-420`); "It changes nothing else",
  including "YouTube's own made-for-kids and synthetic-content rules" (`:422-423`).
- 16(c) as ruled (repo): D (`RULING:216-218`); 16(c)(2), "No colony line targets an audience that cannot read the AI
  declaration. Only the owner can change this; nothing here asks them to." (`:219-222`); constraint 8 for B: NO, B as ₪0
  pages: NO (`:225-228`); T1's DEDICATED account (`:229-241`); the parents' sample held (`:242-247`); P-1, P-2, P-3
  (`:248-253`); REOPEN IF (`:255-257`). Only D's direction is overridden; items 2-7 stand (`MISSION.md:411-415`).
- REJECTED's entry stays "as the evidence that sitting starts from" (`docs/REJECTED.md:1633-1636`, repo); its A triggers
  (`:1674-1679`) and "A is closed under the current mandate unless the owner changes it" (`:1681`); the judges' scores A 1.5,
  A-he 0.5, B 2.8 (`ASSESSMENT.md:330-333`), given under the pre-reader reading (`:305`, R3 and R15).
- What this board may not do: widen the audience (16(c)(2)); read a `[against-bar]` capture for anything but compliance or
  a decision not to act (D1); add an owner step (`owner-steps.ts:18-19`: exactly eight, "a new step needs a decision, not a
  commit"; `MISSION.md:436`).

**RULING (apply as written).**
1. The reopened candidate is judged as a **new shape**, not as ASSESSMENT's A: A was scored for pre-readers
   (`ASSESSMENT.md:305`; `REJECTED.md:1678-1679`, triggers 3-4 name pre-readers), and the owner's default is readers
   (`MISSION.md:417-420`). Triggers 3 and 4 therefore do not bind a readers-only shape; they remain the triggers for a
   pre-reader line, which only the owner can open (`RULING:221-222`).
2. Trigger 1 (an admission path for AI-made channels into the Kids app, `REJECTED.md:1675-1676`) is not a precondition: the
   line ruled below does not depend on Kids-app inclusion (§8). Trigger 2 ("T1 has passed K3 and human YPP review",
   `:1677`) is replaced by §8's sequencing: the kids channel's first upload follows T1's first-upload read-back, and its
   Stage B never precedes T1's (§6).
3. 16(c) items 2-7, 16(d) D1, and the ₪0, brand, no-camera and no-account rules bind every rule below. Nothing here asks
   the owner for anything; "Not ruled here" names what only they can decide.

## 2. (a) Shape

What the colony can make today (repo): chart-explainer, T1's pipeline — one question, one openly licensed dataset, charts
drawn by code, Kokoro narration, no music, no stock, no generative imagery (`products/chart-explainer/README.md:3-6`;
`T1-PROTOCOL.md:51-53`); a narration template with no digits and no number words (`README.md:26-30`); 116.73 s rendered in
1.815 runner minutes (`ASSESSMENT.md:280-281`), ₪0 only while the repo stays public (`:281-284`). parent-guides: Hebrew,
vertical, held, no upload code (`products/parent-guides/README.md:3-7`); all 17 of its evidence sources are `[against-bar]`
captures (`BRIEF:288-293`), so its "every fact quotes a rendered line" method has no permitted YouTube-help source (D1).
Sprite animation exists only as a scratch benchmark (`ASSESSMENT.md:289`); no children's script, spec or storyboard exists
(`BRIEF:309-310`; Part C 3). At ₪0 there is no singing, no verified music, no character animation, no generative video
(`ASSESSMENT.md:289`, `:295-297`). Cleared datasets: C3, C7, C8, C9 (`DATASETS.md:30-47`); energy, health and finance are
excluded (`:59`).

What a kids shape must avoid, read as decisions not to act (D1(1)(ii)):
- The made-for-kids factors that pull toward pre-readers: characters, cartoon figures and toys (`yk2-yt-9528076.txt:106`,
  `[against-bar]`), songs, stories and poems for children (`:112`), play-acting and simple songs (`:110`), "educational
  content for preschoolers" (`:100`); the FTC's examples of child-directed channels: toys, popular animated children's
  programs, "kids playing with toys" (`yk2-ftc-channel-owners.txt:509`, rendered, no verdict).
- The low-quality kids principles YouTube enforces: heavily promotional and unboxing (`yk2-yt-10774223.txt:90`,
  `[against-bar]`), deceptively educational (`:94`), hard to follow with unclear audio, "often the result of mass production
  or autogeneration" (`:96`), keyword stuffing (`:98`), strange use of children's characters (`:100`); the general bars on
  templated or mass-produced AI content, song collections and readings of others' material
  (`youtube-monetization-policies.txt:136-140`, `:194`, `:204`, `[against-bar]`).
- Hebrew narration: no official Kokoro voice uses `he` (`hexgrad-kokoro-voices-js-dfb907a.txt`, grep 0, github); official
  Kokoro asserts on `he` (`ASSESSMENT.md:538`, github); the only licence-clean chain speaks Phonikud IPA through `ef_dora`, a
  Spanish voice hexgrad grades "D" (`products/parent-guides/tts.py:1-3`, `:34`; `voices.js:315-321`), accented and unmeasured
  (`ASSESSMENT.md:290`); a native listener must approve before anything publishes and the mandate has none
  (`products/parent-guides/README.md:116`; `RULING:246`); the non-commercial Hebrew voices are refused by name
  (`publication-gate.ts:259-267`). A-he fails P-1 today, as 16(c)(6)-(7) found.
- B (guides about the Kids app): "Constraint 8 for B: NO" and "B as ₪0 web pages: NO" stand (`RULING:225-228`); the
  owner's instruction does not reopen B (`MISSION.md:411-415`).

Constraints 7 and 8 for the new shape (`MISSION.md:188-190`, `:216-223`): the acquisition channel is YouTube's own search
and recommendation, measured by the Analytics traffic-source split exactly as T1's (`T1-PROTOCOL.md:78`; `BOARD-LOOP.md:120`);
the non-public input is the one T1 was accepted on — accumulated channel history on a platform where history is a ranking
input (`MISSION.md:220-223`; ASSESSMENT grades it "Weak but accepted by RED-TEAM", `:310`). That is weak, and it is why the
line is admitted as an experiment with no revenue target, as chart-explainer is today ("not a portfolio line",
`products/README.md:13`, repo).

**RULING (apply as written).**
1. **One shape, named `kids-explainers`:** English, declared made for kids, for children who can read; one question answered
   from one of T1's cleared open datasets (`DATASETS.md:30-47`, `:59`), charts drawn by code, Kokoro narration from the
   English voices (§5), no music, no stock, no generative imagery, 16:9 long-form as T1 (`T1-PROTOCOL.md:51-53`). It runs on
   chart-explainer's pipeline and passes G1-G10 unchanged, plus G11 (§6) and G7-k (§4), so every number is machine-checked
   and no advice is given (G2). The children's register (short sentences, plain words, every number spoken as words) is a
   spec rule; any readability threshold the spec adopts cites a github-grade source or is marked inference and used as a
   diagnostic, never as a quality claim (Part C 4: no file holds a reading age).
2. **Excluded by rule, as decisions not to act:** songs, rhymes, stories or poems for children; cartoon characters,
   mascots, puppets, toys, surprise eggs, unboxing; "learn colours", "ABC", "numbers" and any preschool or toddler
   framing; child figures or characters in thumbnails; a narrator posing as a teacher or friend (the narrator says what it
   is, §4). Grounds: the D1(ii) citations above.
3. **A-he is closed** until the check in "Not ruled here" 2 is met; **B stays rejected** as ruled; ASSESSMENT's **A
   (pre-readers) stays closed** under 16(c)(2). The owner's instruction is met by rule 1: YouTube is two lines, T1 and
   `kids-explainers`.

## 3. (b) Audience

- The rule and the default: `RULING:219-222`; `MISSION.md:417-420`. Only the owner widens it.
- No file says at which age a child can read or understand the declaration (Part C 4). The one reading rate in the repo,
  `CPS = 14.0` (`products/parent-guides/render.py:59`, repo), cites no source and was set for adults
  (`specs/yt-kids-setup.he.json:6`; `logs/2026-09-28-yt-kids-parent-sample.md:34`).
- "The age of a "kid" in the United States is defined as anyone under the age of 13. However, the age of a kid may be
  different in other countries ... consult legal counsel" (`yk2-yt-9528076.txt:162`, `[against-bar]`, compliance). Teen or
  older is general audience (`:140`). "Mixed audience" content, which targets children as one audience, is made for kids
  (`:156`). Israel's "relevant age" is never given (Part C 4).

**RULING (apply as written).**
1. The audience is **children who can read the declaration**, as `MISSION.md:419` sets it. No age number is written
   anywhere public: no file holds one, and the under-13 line is a US definition. The channel and every video are declared
   made for kids (§6); the parent-facing description says who it is for (§4).
2. Because no reading age is held, the declaration does not depend on a reading rate: the on-screen tag stays in every
   frame for the whole video (§4), and the spoken sentence carries it to a child who reads slowly. `CPS = 14.0` is not
   reused for children as a claim; a timing rule in the spec is marked inference.
3. Widening to pre-readers is the owner's alone and is not asked (`RULING:222`; `MISSION.md:418-419`). What they would be
   deciding is in "Not ruled here" 1.

## 4. (c) How the AI declaration reaches a child and a parent

- YouTube's rules (`youtube-altered-synthetic-disclosure.txt`, `[against-bar]`, compliance): realistic AI must be disclosed
  (`:63`, `:127`); non-realistic content needs none (`:87`); AI music must be disclosed (`:131`); no line names TTS narration
  either way (`:83`; `BRIEF:354-356`); labels for non-photorealistic content "may appear in the expanded description"
  (`:171`); YouTube may label automatically (`:177`); disclosing "won't limit a video's audience or impact its eligibility
  to earn money" (`:173`); not disclosing may bring removal or YPP suspension (`:193`). The 'AI use' setting is in Studio
  (`:77`) while the API carries `status.containsSyntheticMedia` (`youtube-api-videos-insert.txt:368`).
- Kids-app AI labels are "in development", no timeline (`yk2-fortune-ai-slop-letter.txt:87`, rendered, no verdict).
- Our declaration today (repo): T1 sets `containsSyntheticMedia = true` (`publication-gate.ts:128`,
  `CHART_TTS_SYNTHETIC_MEDIA`; `T1-PROTOCOL.md:56-59`) and carries one fixed sentence in every description, "Narration: a
  synthetic voice (Kokoro text-to-speech), not a recording of any person and not an imitation of anyone. Charts are drawn
  by code from the data cited below. Produced with AI systems." (`:134-136`), checked by G7 (`:483-488`); no T1 narration
  line declares AI (`BRIEF:367`). parent-guides burns "סרטון עצמאי · נוצר בעזרת AI · קריינות סינתטית" into every frame
  (`products/parent-guides/README.md:47-48`) and requires the AI line on the end card (`:40-41`); its narration declares
  nothing (`BRIEF:369`).
- A spoken declaration is possible with Kokoro; a young child's understanding of it is ungraded (`ASSESSMENT.md:534`).
  The constitution: "You must never deny what you are." (`constitution.md:25`, repo).
- Made-for-kids content has no cards or end screens (`yk2-yt-9527654.txt:233`, `[against-bar]`, compliance); a card drawn
  in the frame is pixels, not an end screen (`BRIEF:374-375`, inference).
- The FTC treated About-section statements of an under-13 audience as evidence of the audience the owner intends
  (`yk2-ftc-channel-owners.txt:509`, rendered, no verdict); YouTube requires the audience setting to match titles,
  descriptions and tags (`yk2-yt-2801999.txt:64`, `[against-bar]`, compliance).

**RULING (apply as written).**
1. **To the child, twice, inside the video.** (i) **Spoken first:** the first narration lines of every `kids-explainers`
   video are this sentence, verbatim, pinned in code as `KIDS_SPOKEN_DECLARATION`: "This video was made by a computer
   program, not by a person. The voice is a computer voice, not a real person. Every number comes from real data, listed
   under the video." (ii) **Shown throughout:** an English tag in every frame, pinned as `KIDS_ON_SCREEN_TAG`: "Made by a
   computer program · computer voice · not a person", inside the safe area the renderer already keeps
   (`products/parent-guides/README.md:43-48` pattern), never only on an end card. G7-k fails a manifest whose narration
   script does not open with (i) or whose renderer did not assert (ii) for every frame.
2. **To the parent, where a parent reads:** the description opens with a pinned sentence, `KIDS_AUDIENCE_SENTENCE`: "Made
   for children who can read. This channel is set as made for kids.", then `SYNTHETIC_VOICE_DISCLOSURE` verbatim
   (`publication-gate.ts:134-136`), then the data attribution G7 already requires; the channel's About text carries the same
   two sentences; `containsSyntheticMedia = true` on every upload, as T1. Saying "made for kids" in the metadata is
   deliberate: it matches the designation of §6, and a mismatch between metadata and setting is what YouTube names
   (`yk2-yt-2801999.txt:64`) and what the FTC read as evidence (`yk2-ftc-channel-owners.txt:509`).
3. **Never relies on YouTube's labels.** YouTube's label "may appear" and the Kids app's labels are in development; our
   declaration is ours and always there, as PREREG §2(b) ruled for T1 (`publication-gate.ts:130-133`).
4. The pinned texts are English because the line is English (§2). A Hebrew line would pin its own, under "Not ruled here" 2.

## 5. (d) Narration under P-1; `ff_siwis` and the Japanese voices

- P-1 as adopted (`RULING:248-251`) and built (repo): `ALLOWED_NARRATION_ENGINES = {"kokoro-82m"}` (`publication-gate.ts:145`);
  the record cites the frozen card for the weights, "License: apache-2.0" (`kokoro-82m-model-card-2026-09-29.txt:53`,
  rendered, huggingface.co `NOT_BARRED`) and "With Apache-licensed weights" (`:97`), and for the data, "Kokoro was trained
  exclusively on permissive/non-copyrighted audio data" (`:235`) and "Synthetic audio [1] generated by closed [2] TTS models
  from large providers" (`:241`) (`publication-gate.ts:213-220`); the 54 voice ids are frozen from hexgrad's own `voices.js`
  at `dfb907a` (`:224-228`, `:239-246`; `hexgrad-kokoro-voices-js-dfb907a.meta.json`, github); the test asserts exactly
  those 54 (`src/__tests__/revenue/narration-licence-gate.test.ts:226-242`).
- The card's CC BY table, verified line by line (rendered): "Koniwa tnc", "<1h", "CC BY 3.0" (`:263`, `:265`, `:267`);
  "SIWIS", "<11h", "CC BY 4.0" (`:271`, `:273`, `:275`); under "The following CC BY audio was part of the dataset used to
  train Kokoro v1.0." (`:253`).
- No file maps a voice id to a dataset (`BRIEF:391`; Part C 6). In `voices.js` the Japanese ids `jf_alpha`,
  `jf_gongitsune`, `jf_nezumi`, `jf_tebukuro`, `jm_kumo` are commented out under "TODO: Add support for other languages:"
  (`:210-250`, github), as is `ff_siwis` (`:339-346`, labelled `language: "es"` in the source — a typo for French,
  inference from the name and the SIWIS row). The 28 live keys are all `en-us` or `en-gb` (`:7-203`).
- The builder left both questions open as judgement, not a code defect (`logs/2026-09-30-p1-p3-in-code.md:102-103`).
- REOPEN 9 of the video ruling: P-1's premise falls if a rendered upstream term bars reuse of synthetic audio for
  commercial training (`RULING:382-383`; `publication-gate.ts:207-208`).

**RULING (apply as written).**
1. **English only, from the 28 live keys.** `kids-explainers` narrates with one of the 28 `en-us`/`en-gb` ids that are live
   keys in `voices.js` (`:7-203`, github), pinned per video in the spec; G7-k refuses any other id for this line. P-1 itself
   is a licence gate, not a language gate, and is not narrowed.
2. **`ff_siwis` and the five Japanese ids stay on P-1's allowlist.** Grounds: (i) P-1's test is the model's, not the
   voice's: one set of weights trained on one dataset, so every voice id, the English ones included, is downstream of the
   CC BY audio equally; striking two groups would assert a voice-to-dataset mapping nobody holds [inference]. (ii) CC BY
   3.0 and 4.0 permit commercial use and ask for attribution; the author's card gives it (`:251-275`, rendered). (iii) The
   colony distributes neither the audio nor the weights; it publishes synthesised speech, and no rendered text read here
   makes CC BY attribution attach to that output [inference]. The record gains the four CC BY lines as evidence so the
   gate's own file names them (`publication-gate.ts:217-220`: add `:263`, `:267`, `:271`, `:275`; the test's `[235, 241]` at
   `narration-licence-gate.test.ts:208` follows). **REOPEN** if a rendered CC BY text or a licensor's statement, read from
   a permitted host, says attribution attaches to a model's output: then every voice is affected together, the attribution
   goes into the fixed description sentence, and no voice is struck alone.
3. **Hebrew narration does not publish**, on 16(c)(6)-(7) as they stand (`RULING:242-247`) and P-1 as built: no official
   `he` voice; `he_shaul` and `voices-hebrew.bin` refused by name; `ef_dora` through Phonikud is a held-sample mode only
   (`products/parent-guides/README.md:117`). The named check is "Not ruled here" 2.

## 6. (e) Made for kids, COPPA and money, as rendered

All youtube.com and support.google.com lines here are `[against-bar]`, read for our own compliance (D1(1)(i)); ftc.gov
lines are rendered (no verdict).

- Designation: every creator must set the audience, "Regardless of your location" (`yk2-yt-9527654.txt:63`, `:65`), at
  channel level ("all of your future and existing content", `:71`) or per video (`:73`); "Settings for individual videos
  will override the channel setting." (`:97`). "For now, please use YouTube Studio to upload made for kids content." (`:77`),
  while the API lists `status.selfDeclaredMadeForKids` (`youtube-api-videos-insert.txt:366`) and `madeForKids` is readable
  by "any user" (`youtube-api-revision-history.txt:987-990`). YouTube may override a setting in cases of error or abuse;
  the override cannot be changed and has one appeal (`yk2-yt-9527654.txt:85`, `:93`, `:333`); failing to set the audience
  accurately "may result in legal consequences under COPPA and/or other laws" (`:331`).
- Features and ads: no personalised ads on kids content, which "may result in a decrease in revenue for some creators"
  (`:223`); contextual ads only (`yk2-yt-9713557.txt:61-67`), no third-party trackers (`:91`); per video, comments and
  notifications are off (`yk2-yt-9527654.txt:239`, `:249`, in `:229-257`); per MFK channel, memberships, the notification
  bell, Posts and Ask Studio are off (`:261-269`).
- Monetisation: MFK content is judged by the kids quality principles (`youtube-monetization-policies.txt:258`); a strong
  low-quality focus may suspend YPP, a video may get limited or no ads (`:260`); enforced since November 2021
  (`youtube-policy-changelog.txt:264`); violations may reach "all or any of your accounts" (`youtube-monetization-policies.txt:342`;
  `yk2-yt-1727191.txt:70`); no workaround channels during a suspension (`:288`); earnings may be charged back against the
  AdSense for YouTube balance (`:318`).
- COPPA, from the FTC's own post (rendered, no verdict): the settlement created a mechanism "so that channel owners can
  designate" child-directed videos (`yk2-ftc-channel-owners.txt:467`); COPPA covers a channel owner whose content is
  directed to children if the owner "or someone on its behalf (for example, an ad network), collects personal information"
  (`:479`); "if your intended audience is kids under 13, you're covered" (`:483`); "up to $42,530 per violation" on a post
  dated 22.11.2019 (`:461`, `:515`), a historical figure; foreign operators are covered when directed to children in the US
  (`:553`, an FTC-staff reply in the comments, 13.1.2020). YouTube's pages say "we cannot provide legal advice ... seek
  legal counsel" (`yk2-yt-9528076.txt:64`, `:162`). The owner's brief: no lawyers (`MISSION.md:12`).
- Money: no first-party MFK RPM exists; vendor bands disagree; Hebrew fill is unknowable before YPP (`ASSESSMENT.md:154-167`,
  `:183-185`, repo on github/snippet); the arithmetic says ₪6-72 a month at the 8,000-hour gate, ₪0 if the quality layer
  limits ads, ₪0 in months 3-12 (`:174-181`). YPP entry is 1,000 subscribers and 4,000 hours, 8,000 from 1.2.2027
  (`youtube-ypp-overview.txt:89`; `youtube-ypp-2027-terms.txt:94`). One AdSense payee account serves every channel
  (`yk2-yt-9914702.txt:63`, `:67`); P-3 counts it as one rail (`rails.ts:37-62`, repo).
- Embedding: a page that embeds an MFK video must turn tracking off (`youtube-developer-policies.txt:442-448`, compliance).

**RULING (apply as written).**
1. **Designated made for kids twice.** The kids channel's audience is set to made for kids at channel level in the Stage A
   sitting (one click inside the sitting, §7), and every upload also sends `selfDeclaredMadeForKids = true` through the
   publisher (`ASSESSMENT.md:420`). **G11:** a manifest for this line whose `madeForKids` is not `true` fails; a manifest for
   T1's line whose `madeForKids` is not `false` fails; `null` fails for both. No video on the kids channel is ever not made
   for kids.
2. **Read back, every upload.** After each upload a reader fetches `status.madeForKids` (`videos.list`, `part=status`, the
   route ASSESSMENT names, `:421-430`). `true` is the only passing reading. `false` means YouTube did not carry our
   designation through the machine route (the Studio-only sentence at `yk2-yt-9527654.txt:77`): the line is **killed**
   (`K-mfk-designation`, KILL-4), because the only remedy would be a Studio click per upload, a per-item owner action
   (`CHANNEL_LOOP.md:76`; `MISSION.md:437-440`); never relabelled, never re-uploaded, never a Studio session. `null` freezes
   the next upload and escalates (§10).
3. **The colony's own conduct collects nothing from a child.** Comments and notifications are off by YouTube's rule on MFK
   content; the channel has no Posts, no memberships, no mailing list, no embedding page with a counter (the PostHog counter
   is never placed on a page that embeds a kids video), no link to any colony site that tracks. Ads are YouTube's,
   contextual by YouTube's own rule. This is what the colony can do in code; it does not close the legal question.
4. **The legal exposure is stated once, not asked.** The designation is the mechanism the FTC settlement created for
   channel owners (`yk2-ftc-channel-owners.txt:467`), and this line uses it as written. Whether residual exposure under COPPA
   or any other law attaches to the legal identity behind the channel is a question no file settles (Part C 7); the pages
   say to ask counsel; the owner has said no lawyers and has asked for the line. The owner's summary says, once, in the
   held row's note: the kids line designates every video made for kids, collects nothing itself, and cannot promise that
   this closes every legal question; "עצור" stops it at any time (`MISSION.md:349`). No step is invented (`:436`).
5. **Money.** `kids-explainers` is an **experiment with no revenue target**, judged by its own gates (`types.ts:31`,
   "measuring ... never counted as live"), like T1. It does not apply for YPP (Stage B) before T1's channel has passed K3
   and been admitted, and its Stage B is a separate board decision: one AdSense payee serves both channels and a
   kids-quality action on either "may" reach the other (`yk2-yt-9914702.txt:63`, `:67`; `youtube-monetization-policies.txt:342`;
   `MISSION.md:44-45`). No MFK RPM is written anywhere as a forecast; the only figure that will ever count is a ledger row
   (`MISSION.md:442-445`).
6. **No mature themes, by construction** (`yk2-yt-2801999.txt:64`, compliance): the datasets are T1's cleared set with
   health, finance and energy excluded (`DATASETS.md:59`); G2's no-advice rule stands; the persona rule on sensitive topics
   (`youtube-monetization-policies.txt:242-244`) is kept out of reach by topic, as for T1.

## 7. (f) The account

- 16(c)(5): T1 gets its own brand Google account under its sub-brand at Stage A, held until the day-56 web read
  (`RULING:229-241`; `T1-PROTOCOL.md:94-96`; `CHANNEL_LOOP.md:246-248`). RED-TEAM: "dedicated to this line (no Search
  Console, Cloud or other Google service for any other line on it)" (`RED-TEAM.md:110-112`). No file rules whether a second
  YouTube channel on it breaks that (Part C 8).
- The enforcement texts speak of the person, not the login: "all or any of your accounts" (`youtube-monetization-policies.txt:342`),
  "any of your accounts" (`yk2-yt-1727191.txt:70`); one AdSense payee (`yk2-yt-9914702.txt:63`); account separation does not
  isolate payments (`RENDER-CHECK:146-148`); P-3: the dedicated account "isolates the login and the enforcement radius, not
  the payee" (`rails.ts:42-43`). Compliance reads.
- Several channels can sit on one Google account through Brand Accounts (`youtube-brand-account.txt:61`, compliance);
  adding a channel may need advanced features (`youtube-policy-changelog.txt:332`), whose ID route in Israel is unknown
  (`DIGEST.md:113`; `REGRADE.md:119`); no rendered channel-count limit exists (`BRIEF:512`, grep).
- Constraint 2 rejects an account per store on that ground alone (`MISSION.md:126-131`); constraint 3: two channels, each
  its own product for its own audience, are not a farm (`:133-138`). A second Stage A costs 40-60 owner minutes and a second
  phone verification (`ASSESSMENT.md:314`; `T1-PROTOCOL.md:88`); Google may refuse a second account on one phone (REOPEN,
  `RULING:255`).
- Brand: a failed experiment must not sit on the brand's search results, so T1 runs under a sub-brand (`RED-TEAM.md:112-113`;
  `research/measurements/brand-name-decision.md:80`); AI kids content is the named target of a public campaign
  (`yk2-fortune-ai-slop-letter.txt:42`, `:63`, `:83`, rendered, no verdict; `ASSESSMENT.md:308`). The sub-brand rule: the
  first name free on four probes — .com, GitHub, the YouTube handle, netlify.app (`T1-PROTOCOL.md:36-39`;
  `scripts/brand-check.mjs:40-48`, repo).
- **A compliance finding (repo):** `scripts/brand-check.mjs:46` probes `https://www.youtube.com/@<name>` from a runner;
  `research/measurements/t1-subbrand-check.md:3` records a run at 2026-09-30T08:53:40Z (`e8a3759`), after youtube.com entered
  `TERMS_BARRED` on 29.9 at 14:01:49Z (`52dafb4`; `scripts/render-watch.mjs:426`); the workflow fires on any push that
  changes a `*-candidates.txt` (`.github/workflows/brand-check.yml:20-25`); the script has no reference to the bar (grep).
  The 29.9 08:54-08:55 runs predate the bar.

**RULING (apply as written).**
1. **Shared login, separate channel.** `kids-explainers` is a second Brand Account channel on T1's dedicated Stage A Google
   account, under its own sub-brand name — never under `chartsplained`, never under `mehudak`. Grounds: the risk 16(c)(5)
   isolated was other lines' Google services on the same login, which a second YouTube channel does not add; the
   YouTube-to-YouTube radius is the person's and the payee's, which no second login escapes; constraint 2 rejects an
   account per store; a second Stage A is a step the mandate does not require (`MISSION.md:436`). RED-TEAM's "dedicated to
   this line" is read as dedicated to the colony's YouTube experiments: the account still carries no Search Console, no
   Cloud project beyond the analytics-only one, and no other line.
2. **When it is created.** If `kids-explainers` has cleared its build gate (§9) when Stage A is asked, the kids channel is
   created in the same sitting — a Brand Account channel under the kids sub-brand, channel-level audience set to made for
   kids, connected to the publisher — about five more minutes inside the one sitting, written into `T1-PROTOCOL.md`'s Stage
   A text, not a new numbered step. If not, it is one click-set added to the held list (`CHANNEL_LOOP.md:246-248`), asked
   only after a qualifying finding (`research/breadth/BOARD.md:185`) in the batched list, never alone, never as a reminder
   (`MISSION.md:401-403`).
3. **Sequencing protects T1, not the login.** The kids channel uploads nothing until T1's first upload has passed P1-P4 and
   its read-back (§8); the kids line's K-policy kills it on the first platform signal, the same day (KILL-3), so a kids-side
   action is caught before it compounds; its Stage B never precedes T1's (§6 rule 5).
4. **A sub-brand name without the YouTube probe.** `research/measurements/kids-subbrand-candidates.txt` is written (short
   topic words a child can read; no "kids" or "children" in the name; none of §2 rule 2's words) and checked by
   `brand-check.mjs` on three probes only (.com, GitHub, netlify.app); the YouTube handle is tried by the owner at Stage A,
   and if taken the next name in list order is used. `brand-check.mjs` refuses the YouTube probe, for every list, while
   youtube.com is `BARRED` (`terms-verdicts.json:460-464`). The 30.9 08:53 run is recorded as made after the bar and is not
   repeated; its readings stay on disk under D1(1)(ii) as the record of the breach and the reason not to re-probe.
5. **REOPEN** rule 1 if the Open Terms Archive copy of YouTube's Community Guidelines on GitHub (`scouts/policy.md:513-517`,
   github — the only permitted copy) states that termination of one channel bars the Google account's other channels: then
   the kids channel moves to its own Google account **before its first upload** (and only then a second Stage A exists,
   asked in the batch). Also if Google refuses the second channel at Stage A: then it waits, and nothing else is
   substituted. The read is "Not ruled here" 3.

## 8. (g) The web arm, the pre-registered kills, and whether it waits on T1's day-56 read

- T1's binding order (repo): web arm on `chartsplained.netlify.app`, D0 at deploy, `WEB_ARM_REACH = { day: 56,
  minEngagedStrangerViews: 5 }` (`experiments.ts:140`; `T1-PROTOCOL.md:26-31`); under 5 → Stage A is never asked
  (`PREREG-DECISIONS.md:442-443`); Stage A → T1 upload → P1-P5 in 72 h (`T1-PROTOCOL.md:72-84`) → six videos → K0 at day 56, K3
  at day 112 (`experiments.ts:108-120`; `BOARD-LOOP.md:120`). Every clock starts with an owner action (`CHANNEL_LOOP.md:187`);
  the deploy route is still an ask (`:137`).
- A kids web arm would be a seventh built-but-unlaunched item (6/6 binding, `CHANNEL_LOOP.md:107`, `:112`;
  `BOARD-LOOP.md:17`), would wait on the same deploy ask, and its instrument fails by rule: a page embedding an MFK video
  must have tracking off (`youtube-developer-policies.txt:442-448`, compliance), which is the PostHog counter; before Stage A
  there is no video to embed, and a chart page for children is not the product.
- Measurement in the Kids app: the Analytics dimension `youtubeProduct` has the value `KIDS` (`yt-analytics-dimensions.txt:731-751`,
  `[against-bar]` by the brief's inference); REJECTED's pre-written A kill: "zero `youtubeProduct=KIDS` views by day 56 kills
  it" (`REJECTED.md:1686-1687`; `ASSESSMENT.md:466-467`). The Kids app picks content by automated systems with no creator
  opt-in (`yk-important-info-iw.txt:62`; `BRIEF:245-249`, `[D1 use limit]`), and a spokesperson says AI content in the app is
  limited to "a small set of high-quality channels" (`yk2-fortune-ai-slop-letter.txt:77`, rendered, no verdict).
  `experiments.ts:8`: a kill "for a reason that says nothing" is the wrong kill.
- P-2's three wordings (`RULING:252-253`; `experiments.ts:122-131`; `RENDER-CHECK:168-169`); the rendered override direction
  is only "Set to Made for Kids" (`yk2-yt-9527654.txt:85`, `:93`), which cannot occur on a channel that itself declares
  `true` (`BRIEF:567-568`, inference).
- T1's P2 and P4 read "the public URL, fetched from a runner" (`T1-PROTOCOL.md:75`, `:77`) — a youtube.com fetch, barred since
  29.9 (`render-watch.mjs:426`); T1's protocol is not this row's, but the kids line's mirror of P1-P4 must not inherit it.
- The publisher's free tier: 10 uploads a month, 7 planned for T1 (`T1-PROTOCOL.md:61`; `T1-PRECHECK.md:98`, github vendor
  code); profiles 2 (`:100`, snippet-grade).

**RULING (apply as written).**
1. **No web arm for `kids-explainers`.** Its cheapest stranger-find test (`MISSION.md:188-190`) is its first video on
   YouTube, read by K0 at its own day 56; nothing is built that pretends to measure children's reach from a web page.
2. **It waits on T1, and runs beside T1 only at ₪0.** Order: T1's web read at day 56 passes → Stage A (with the kids
   channel, §7 rule 2) → T1's first upload passes P1-P4 and its `madeForKids` read-back returns `false` (proof that the
   machine route carries a designation and that the reader works) → the kids line's first upload, its D0. Until then the
   loop does only §9's ₪0 work for this line. If T1's web arm fails (`stage_a_never_asked`), Stage A is never asked and the
   kids line falls with T1's YouTube test: recorded in REJECTED with the reopen "a Stage A exists for another reason".
3. **Pre-registered kills, under their own pin, never T1's `PINNED_GATES_SHA256`:**
   - `K-mfk-designation` (KILL-4): any upload reads back `madeForKids = false`, or the publisher cannot send
     `selfDeclaredMadeForKids` (`ASSESSMENT.md:420`), or the channel-level setting cannot be made in the Stage A sitting —
     kill; never a Studio click, never a relabel (§6 rule 2).
   - `K-policy` (KILL-3): any warning, strike, removal, auto-privating, age-gating, "limited or no ads" on kids-quality
     grounds, or any YPP action kills the line the same day; never a workaround channel (`youtube-monetization-policies.txt:288`).
   - `K-T1k`: the kids channel's own first-upload window, P1-P4 as T1's (`T1-PROTOCOL.md:72-82`) but read through the
     publisher's response and the Data API (`videos.list part=status`, `privacyStatus`), never a fetch of the watch page
     (youtube.com is barred) — fails → kill.
   - `K-supply`, `K0`, `K3`, `K-cash`, `K-compute` with T1's numbers (6 videos by day 42; median engaged stranger views < 35
     at day 56 or unmeasured; < 307 h/28 d at day 112 or unmeasured, ≥ 1,200 to the board; ≤ 60 runner minutes and ≤ ₪20 per
     video; `experiments.ts:108-120`), on the kids channel's own D0. The `youtubeProduct = KIDS` split is a **diagnostic
     written at every read, never a kill**: zero Kids-app views is the expected outcome for a new AI-made channel on the one
     press statement held, and says nothing about children watching elsewhere [inference]. REJECTED's pre-written A kill is
     superseded by this list.
   - `K-mfk-read`: §10.
   - No `K-web` exists for this line (rule 1).
4. **P-2's wording is unified:** "a YouTube-set made-for-kids override on a video of a channel that declares not made for
   kids (today T1): the first override → private plus one appeal; the second kills that channel's line." On the kids
   channel the mirror-image event is `K-mfk-designation`. "Kills the YouTube line" means the channel's line, not both.
5. **The publisher's free tier is shared:** T1's seven uploads come first; the kids line uses what remains of the ten a
   month and never displaces T1; if the tier's profile count (2) is real, the kids channel is the second profile and no
   third YouTube channel exists on the tier.

## 9. (h) Caps, and what gets built first

- Caps now (repo): built-but-unlaunched 6/6, binding; experiments measuring 1/3; builds in flight 0/1
  (`CHANNEL_LOOP.md:105-110`; `maxExperiments: 3`, `types.ts:247`, `:259`). "no new build whose launch depends on an owner
  step starts while BBU ≥ 6"; ₪0 tests, counters and scans stay outside the cap (`BOARD-LOOP.md:17`; `CHANNEL_LOOP.md:112-114`).
  When the caps bind, the work shifts to minute-after prep, ₪0 tests, instruments and admission research (`BOARD-LOOP.md:17`
  (i)-(iv)). Constraint 7: the first thing built is the stranger-find test, "Not the product" (`MISSION.md:188-190`).

**RULING (apply as written).**
1. **Nothing of the kids line is rendered while BBU is 6/6.** A kids video, built and held, would be a seventh BBU item.
   The first render — one video, the stranger-find test, not six — starts when BBU < 6 and the build slot is free, and is
   itself one BBU item until Stage A.
2. **Built first, now, at ₪0 and outside the cap (gates and instruments, one build, one slot):** (a) the kids experiment in
   code, `KIDS_EXPLAINERS_EXPERIMENT`, with §8's kills and its own pin; (b) G11 and G7-k in the publication gate with §4's
   pinned sentences; (c) the `madeForKids` reader, built and fixture-tested before Stage A is asked (it cannot be exercised
   live before then); (d) the kids sub-brand candidates list and the three-probe brand check (§7 rule 4); (e) the one-page
   design file `research/youtube-kids/KIDS-LINE.md` the builder reads. No children's script is written until (a)-(e) are
   merged and the render slot opens.
3. **Counts:** `kids-explainers` enters "experiments measuring" (2/3) only at its first upload; until then it is "admitted,
   held by protocol" in the channel table, outside every count but the queue.

## 10. The second code question: an unread made-for-kids count

- The code (repo): `madeForKidsOverrides: null` with an upload due escalates `K-mfk-unmeasured`, "an unmeasured gate that
  is due counts as failed; the board is flagged" (`experiments.ts:183-191`); nothing reads `status.madeForKids` yet
  (`:42-47`). The builder: whether an unread count should kill is the board's (`logs/2026-09-30-p1-p3-in-code.md:88-90`).
- KILL-1: an unmeasured gate that is due counts as failed, "but an instrument fault is fixed and the clock restarted,
  recorded, not a kill" (`BOARD-LOOP.md:64`); `K0-unmeasured` and `K3-unmeasured` kill (`experiments.ts:207`, `:224`); "An
  experiment nobody can read is not an experiment" (`T1-PROTOCOL.md:83-84`). KILL-2: the board may be stricter, never
  softer (`BOARD-LOOP.md:65`).

**RULING (apply as written).**
1. **The read is a precondition of uploading**, so "unread because unbuilt" cannot occur after an upload: no upload on any
   colony YouTube channel while the `madeForKids` reader is not built and tested, and Stage A is not asked before it exists
   (§9 rule 2(c)).
2. **A due `null` freezes and escalates; it does not kill by itself.** `K-mfk-unmeasured` stays an escalation, stricter by
   one rule: it also blocks the next upload on that channel until the reading exists. A missing safety read is an
   instrument fault under KILL-1 — fixed, read, recorded.
3. **It kills at the outcome read.** If a video's `madeForKids` reading is still `null` on the channel's K0 day, K0 is
   unmeasured and `K0-unmeasured` kills (`experiments.ts:207`), as it would for a missing view count: "measured" at K0 now
   includes the designation read for every uploaded video. This applies to T1 and to `kids-explainers` alike.

## 11. Verdict

**ADMIT** `kids-explainers` — English, made for kids, for children who can read — as the colony's **second YouTube
experiment**, with the design of §§2-8, the kills of §8 rule 3 and §10, no revenue target, and **held by protocol**: the
₪0 gates, reader, design file and sub-brand list are built now (§9 rule 2); the first video is rendered when BBU < 6; the
first upload follows T1's Stage A and first-upload read-back (§8 rule 2); the channel rides T1's dedicated Google account
(§7). No new owner step: the kids channel is a click-set inside Stage A, or one held item in the batch. Nothing here opens
an account, spends money or publishes anything.

## Fold actions for Opus

(file — what changes — grade of the evidence)

1. `logs/CHANNEL_LOOP.md` §3 (`:130-138`): add the row `kids-explainers (YouTube, made for kids, readers)` — stage
   "admitted (ruling 4.10), held by protocol behind T1"; rail "AdSense, one payee (P-3); experiment, no target"; owner steps
   "a click-set inside Stage A (§7 rule 2); none new"; next action "§9 rule 2 (a)-(e), one build"; unpark "BBU < 6 for the
   first render; T1's first-upload read-back for the first upload". §4 row 29 (`:171`): "designed and admitted 4.10,
   `research/channel-loop/RULING-2026-10-04-kids-youtube.md`". §6 held list (`:246-248`): Stage A "includes, if the kids line
   has cleared its build gate, a second Brand Account channel under the kids sub-brand with channel-level audience made for
   kids (ruling 4.10 §7)". §7 (`:260-262`): one entry for this sitting. §8 (`:287`): row 23 done. — repo.
2. `logs/FABLE_QUEUE.md:47`: status "ruled 4.10 (delayed from 1.10): `research/channel-loop/RULING-2026-10-04-kids-youtube.md`"
   — main thread only. — repo.
3. `docs/REJECTED.md:1631-1689`: under the REOPENED paragraph add "Ruled 4.10.2026: a readers-only English made-for-kids
   shape (`kids-explainers`) admitted as an experiment; A (pre-readers) and A-he stay closed; B stays rejected; the
   pre-written A kill at `:1686-1687` is superseded by the ruling's §8 rule 3 (the KIDS split is a diagnostic)".
   `research/youtube-kids/ASSESSMENT.md:466-467` gets the same one-line note. — repo.
4. New `research/youtube-kids/KIDS-LINE.md`: the design as ruled (§2 shape and exclusions, §3 audience, §4 pinned texts, §5
   voice set, §6 designation and read-back, §7 account and sub-brand rule, §8 order and kills, §10), each item pointing at
   this ruling's section; no content script. New `research/measurements/kids-subbrand-candidates.txt` (criteria per §7 rule 4,
   the `t1-subbrand-candidates.txt:8-9` pattern). — repo.
5. `src/revenue/experiments.ts`: `KIDS_EXPLAINERS_EXPERIMENT: ExperimentSpec` (`id: "kids-explainers"`, gates equal to
   `:108-120`, sources: this ruling), pinned in a new test `kids-explainers-kills.test.ts`; T1's `PINNED_GATES_SHA256`
   (`src/__tests__/revenue/experiments.test.ts:132`) untouched. Readings gain a per-upload designation read (for example
   `madeForKidsReadback: ("true" | "false" | null)[]`) with: kids line `false` → `K-mfk-designation` kill; `null` due →
   `K-mfk-unmeasured` escalation plus `uploadsFrozen`; `null` at `k0Day` → `K0-unmeasured`. `:122-131` reworded per §8 rule
   4; `:42-47` reworded per §10 rule 1. `BOARD-LOOP.md:120` lists the kids kills; `:17`'s `types.ts:222` → `:247`/`:259`.
   — repo (evidence: this ruling).
6. `src/revenue/publication-gate.ts`: `VideoManifest` gains `line: "faceless-youtube" | "kids-explainers"` and
   `madeForKids: boolean | null`; `GateId` gains `"G11"`. **G11:** `null` fails; `kids-explainers` requires `true`,
   `faceless-youtube` requires `false`. **G7-k** (kids line only): the narration script opens with `KIDS_SPOKEN_DECLARATION`
   verbatim; the manifest asserts `onScreenTagEveryFrame === KIDS_ON_SCREEN_TAG`; the description opens with
   `KIDS_AUDIENCE_SENTENCE` then `SYNTHETIC_VOICE_DISCLOSURE`; `voiceId` is in `KIDS_VOICES` (the 28 live keys of
   `voices.js:7-203`, asserted a subset of `KOKORO_82M_VOICE_LICENCE.voices`); title, description and tags are linted for §2
   rule 2's words (ASSESSMENT's G11 list `:402-405`, whole words, the Hebrew pattern `:411-415`) and the thumbnail brief for
   any child, character, mascot or toy. `KOKORO_82M_VOICE_LICENCE.licenceEvidence.trainingData` gains the four CC BY lines
   (`:263`, `:267`, `:271`, `:275`); `narration-licence-gate.test.ts:208` follows. Tests per gate, mutation-checked with
   `scripts/mutate.mjs`. — repo; rendered for the card lines.
7. New `scripts/youtube-madeforkids-readback.ts` (+ `src/revenue/youtube-madeforkids.ts`): `videos.list part=status` with an
   API key, writing each video's `madeForKids` and `privacyStatus` into the experiment state; fixture tests for `true`,
   `false` and missing; no live call before Stage A. `T1-PROTOCOL.md:86-114` Stage A text gains: the Data API key (already
   `ASSESSMENT.md:427-430`), the optional kids channel with channel-level made for kids, and "stop and tell us" if Google
   refuses the second channel. `T1-PROTOCOL.md:75`, `:77`: the P2/P4 reads move off the watch page to the same API call
   (youtube.com is barred) — for T1's own row to confirm, flagged here. — repo.
8. `scripts/brand-check.mjs:40-48` and `.github/workflows/brand-check.yml`: the `youtube` probe refuses while `youtube.com`
   is in `TERMS_BARRED` (`scripts/render-watch.mjs:426`, `termsBarred` `:458-463`) or `BARRED` in
   `terms-verdicts.json:460-464`, printing "YouTube: not probed (terms barred, ruling 30.9 16(d) D2; the handle is tried at
   Stage A)"; `allFree` counts three probes. `research/measurements/t1-subbrand-check.md` gains a header note that its 30.9
   08:53:40Z run probed youtube.com after the 29.9 14:01:49Z bar (`52dafb4`) and is not repeated. — repo.
9. `products/chart-explainer`: `manifest.py` writes `line`, `madeForKids` and `onScreenTagEveryFrame` from the spec; the
   renderer burns `KIDS_ON_SCREEN_TAG` into every frame when `line == "kids-explainers"` (parent-guides' per-frame tag
   pattern, `products/parent-guides/README.md:47-48`); a parity test keeps the three pinned sentences identical between
   `publication-gate.ts` and the Python constants (the `SYNTHETIC_VOICE_DISCLOSURE` pattern, `manifest.py:24`). No kids
   spec is written yet (§9). — repo.
10. `research/channel-loop/BOARD-LOOP.md:17` ACCOUNT CAP note: "the kids channel is a click-set inside Stage A on T1's
    account, not a new account (ruling 4.10 §7)". `docs/OWNER_STEPS.he.md:461` and `owner-steps.ts:266` unchanged (step 8
    already excludes YouTube). — repo.
11. The owner's summary (the held row's note, once): the kids line exists as designed, designates every video made for
    kids, collects nothing itself, cannot promise that this closes every legal question, and waits behind T1 (§6 rule 4).
    — repo.

## Not ruled here

1. **Pre-readers.** Only the owner widens the audience (`RULING:221-222`; `MISSION.md:418-419`). Not asked. If they raise
   it, what they would be deciding: a line for children who cannot read the declaration, whose honest value nobody in the
   colony can judge (16(c)(2)), with the declaration reaching the child by voice alone. Check: an owner sentence in
   `MISSION.md`.
2. **Hebrew kids content.** Closed until (a) a Hebrew voice has both its weights licence and its training-data statement
   rendered as commercial from a permitted host (huggingface.co `NOT_BARRED`, `terms-verdicts.json:164-167`; github),
   passing P-1 (`publication-gate.ts:191-192`), and (b) a native Hebrew listener approves the narration
   (`products/parent-guides/README.md:116`; `RULING:246`). (b) is not a step the mandate requires, so it is not asked; it is
   the owner's to offer. Check for (a): a render-watch row for the voice's card on huggingface.co, graded.
3. **The termination radius (§7 rule 5).** A runner reads the Open Terms Archive copy of `YouTube/Community Guidelines.md`
   (`OpenTermsArchive/vlopses-us-versions`, github; `scouts/policy.md:513-517`) for the channel-termination text: if
   termination of a channel bars the account's other channels, the kids channel gets its own account before its first
   upload. Check: the grep result recorded in `KIDS-LINE.md`.
4. **Whether the machine route carries the designation** (`selfDeclaredMadeForKids` honoured; channel-level inheritance;
   `containsSyntheticMedia` likewise): known only at T1's first-upload read-back and the kids channel's first upload
   (`RENDER-CHECK:158-159`). Check: the reader's first live readings.
5. **The `youtubeProduct` dimension at a permitted grade.** The only capture is `[against-bar]` by inference; before the
   diagnostic is coded, a runner reads the YouTube Analytics API discovery document or a googleapis client library on
   GitHub for the dimension and its `KIDS` value. Check: a github-grade citation in `src/revenue/youtube-analytics.ts`.
6. **MFK revenue and Hebrew ad fill:** unknowable before YPP (`ASSESSMENT.md:183-185`); not needed for an experiment with
   no target. No check; Stage B is a later board.
7. **The Kids app's admission path for AI-made channels** (pages 10938174, 12985103, 9684541, 9683742): unrenderable
   (`scripts/render-watch.mjs:426-428`; D1); no Open Terms Archive copy is recorded (`scouts/policy.md:513-518`). The line
   does not depend on it. Check: none available; if a GitHub-hosted copy appears, read it.
8. **COPPA's current penalty and its reach to an Israel-based operator:** the only sources are ftc.gov (no terms verdict)
   and a 2019 figure (`yk2-ftc-channel-owners.txt:461`, `:515`, `:553`). The line does not need the number. Check: a
   once-fetch of ftc.gov's terms under D2 before any re-render.
9. **The repo-public decision** (`CHANNEL_LOOP.md:234-236`): the owner's; every ₪0 render depends on it
   (`ASSESSMENT.md:281-284`; `RULING:374-377`). Not an ask.
10. **Whether Google issues the second channel, or asks for more than a phone, at Stage A:** known only there; 16(c)'s
    REOPEN (`RULING:255-257`) and §7 rule 5 cover it.
11. **T1's P2/P4 reads of the watch page** (`T1-PROTOCOL.md:75`, `:77`) after the youtube.com bar: T1's own protocol, row
    16's domain; flagged in fold 7 for the main thread, not ruled here.

## Pointers moved (beyond Part C's housekeeping)

- `research/channel-loop/terms-verdicts.json` (20 lines changed in tick 36): youtube.com `:452-456` (brief header `:31`)
  → `:460-464`; google.com `:119-123` → `:120-124`; huggingface.co `:163-166` → `:164-167`; github.com `:114-118` unchanged.
- `src/revenue/types.ts` (31 lines changed since the brief): the caps pointer `types.ts:231` (brief A(h) `:581`) and
  `BOARD-LOOP.md:17`'s `types.ts:222 maxExperiments` → declared at `:247`, value 3 at `:259`.
- `src/revenue/portfolio.ts:387-399` (brief A(f) `:518`, cited for P-3) holds `insertLineFromSeed` and
  `portfolioTargetAgorot`; P-3's structured mark `paidBy` is at `:437-449`.
- `src/revenue/owner-steps.ts` (128 lines changed since the brief): `RULING:233`/`:235`'s `owner-steps.ts:201-207` and `:207`
  (step 8's uses) → `:263-266`; `RULING:233`'s `docs/OWNER_STEPS.he.md:460` → `:461`; `RULING:233`'s `CHANNEL_LOOP.md:203-204`
  (step 8's text) → `:207-208`.
- `publication-gate.ts:134-135` (brief A(c) `:364`) for the disclosure sentence → `:134-136`.
- The brief's MISSION pointers (`:126-131`, `:133-138`, `:172`, `:216`) hold at `f2fca6d`; its `:214-216` for constraint
  8's rule is `:216-218`.
- Not drift but two compliance records: `research/measurements/t1-subbrand-check.md:3`, run 2026-09-30T08:53:40Z
  (`e8a3759`), probed youtube.com after the 29.9 14:01:49Z bar (`52dafb4`) — §7 rule 4, fold 8; and `T1-PROTOCOL.md:75`,
  `:77` still read the watch page from a runner — fold 7, "Not ruled here" 11.
