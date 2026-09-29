# Faceless YouTube — the two pre-registration decisions fixed before the first upload (27.9.2026)

**Board: Fable 5.1, deciding tier.** Both items were left open for the board — RED-TEAM §2.4 (which view count K0 reads)
and VERDICT open item 13 (the AI-use / synthetic-media flag). Once a video is public, changing either one is moving a
line after the data exists, so both are decided here, with the evidence quoted, and handed to the main thread as exact
code. The gate numbers in `FACELESS_YOUTUBE_EXPERIMENT` are **not** touched; the pinned hash stays.

## סיכום לבעלים (שתי שורות)

- **החלטה 1:** K0 קורא את `engagedViews` (צפייה שעברה את הפריים הראשון, או שהצופה לחץ להפעיל) ולא את `views`, שמאוגוסט
  2026 נספר "ברגע שהסרטון מתחיל לנגן". הסף 35 נשאר — אין מדידה שמצדיקה מספר אחר, ומספר בלי מקור לא נכתב.
- **החלטה 2:** הדגל `containsSyntheticMedia` = **true** לכל סרטון של גרפים + קריינות סינתטית; משפט קבוע על הקול הסינתטי
  חובה בתיאור; קול שמחקה אדם אמיתי — **לא נעשה לעולם**, גם עם הדגל.

---

## Decision 1 — K0 reads `engagedViews`; the 35 stays

### Ruling

1. `PINNED_VIEW_METRIC = "engagedViews"`.
2. The threshold stays at 35. The pinned-hash test is not touched.
3. The derived Search diagnostic (average view percentage) uses the **same** pinned metric in its denominator, so one
   reading has one definition of "a view".

### What the two metrics are, in YouTube's words

- `engagedViews`: "The number of times the channel's videos have been viewed past the first frame, or the user
  clicks/taps to play." — `research/rendered/yt-analytics-metrics.txt:200-202`.
- `views`: "This metric represents different numbers in different types of reports." — `yt-analytics-metrics.txt:204-206`;
  and since the change: "[August 2026] First frame view counting: Views will be counted the moment a video begins to play
  across all formats, including Shorts, long form video, and live streams." — `research/rendered/youtube-policy-changelog.txt:62`.
- The traffic-source report K0 reads offers both: "Metrics: Use 1 or more — engagedViews, views, estimatedMinutesWatched"
  — `research/rendered/yt-analytics-channel-reports.txt:1034-1036`.
- YouTube's own precedent for what the split means. When it made the same change for Shorts it wrote: "We will keep the
  existing Shorts view metric, now called 'Engaged views,' in YouTube Analytics so you can see how many viewers chose to
  continue watching your video." — `youtube-policy-changelog.txt:322`; and "This change will not directly impact creator
  earnings or how creators become eligible for the YouTube Partner Program. Both will be based on 'Engaged views.'" —
  `:324`. That is for Shorts; no rendered page says the same for long-form (REGRADE, "New facts nobody recorded", first
  bullet). The precedent still tells us what `engagedViews` *is*: the pre-change count of viewers who chose to watch.

### Where the 35 comes from, and which definition it was measured under

- "McGrady et al. (2023), 'Dialing for Videos', drew a random sample of 10,016 public YouTube videos (2022). Median
  lifetime views: 35." — `research/faceless-youtube/audits/discovery.md:26-28`; the K0 row that adopted it:
  "if the median video has fewer than 35 stranger views … it is invisible at the random-upload base rate → kill" —
  `discovery.md:136`; carried into `VERDICT.md:281-282` and `src/revenue/experiments.ts:99`.
- Those were 2022 public view counts. First-frame counting reached Shorts on 31 March 2025 (`changelog:322`) and long-form
  in August 2026 (`changelog:62`). So the 35 was measured under a counting that did **not** include plays that merely
  began. RED-TEAM §2.4 already drew the consequence: "A 2026 'view' is cheaper than a 2022 'view', so 35 is lower than it
  looks." — `RED-TEAM.md:143-144`.
- Of the two metrics the API offers today, `engagedViews` is the one that preserves the definition the 35 was measured
  under, as nearly as the API allows. `views` is a different quantity from the one the threshold came from.

### Why the metric choice is about what a FAIL means

K0 is a kill floor whose pass carries no information — `experiments.ts:44` ("Passing it carries no information") and
`RED-TEAM.md:143-144` ("passing K0 says almost nothing … only failing it says something"). So the only thing the metric
decides is **which dead channels K0 catches at day 56**.

- Under `engagedViews`, a median under 35 means: fewer than 35 unsubscribed viewers, arriving from Search, Suggested or
  Browse, chose to play (or got past the first frame of) the median video in 56 days. That is exactly the claim K0 was
  written to make — "invisible at the random-upload base rate" — and exactly MISSION constraint 7's question, whether a
  stranger *finds and picks* it (`MISSION.md:188-192`).
- Under `views`, a median under 35 would mean fewer than 35 playback starts of any kind. A channel nobody chose can clear
  that on starts nobody chose. It would then run to day 112 on a pass that meant nothing, against MISSION constraint 5:
  "Killing must be as automatic as building … Kill criteria are not hygiene here, they are the mechanism that makes
  multiplication survivable." — `MISSION.md:151-153`.
- Where the two metrics coincide for our videos, the pin costs nothing. Where they diverge, `engagedViews` is the honest
  one. There is no case in which `views` is the better reading for a floor.

### Why the threshold does not change

The brief allows the board to rule that 35 itself must change. It does not, for one reason: **no number with a source
exists to replace it.** Three biases are known and they do not cancel in any measurable way:

| bias | direction | source |
|---|---|---|
| population: six titled, thumbnailed 8-12-minute explainers vs. all public uploads (55.8% "People & Blogs") | lenient (easier to pass) | `RED-TEAM.md:137-139`, `discovery.md:30` |
| horizon: 56-day views vs. lifetime views | strict (harder to pass) | `RED-TEAM.md:138-139` |
| counting: a 2026 engaged view vs. a 2022 public view | lenient, smaller than under `views` | `RED-TEAM.md:139-143`, this decision |

RED-TEAM §2.4 said "Population and horizon both differ, in opposite directions" and left 35 as a floor. This ruling
removes the correctable part of the third bias by choosing the metric; it does not invent a multiplier for the rest.
A threshold that moved to, say, 50 or 70 would be a number nobody measured, which is the one thing every audit in this
folder exists to stop. The residual leniency is recorded here and is acceptable for a no-information-pass floor: it errs
toward letting a weak channel reach K3, where watch hours — immune to first-frame counting — decide.

### Consequence for the diagnostic

`computeYoutubeReadings` derives "average view percentage on Search" as Search minutes × 60 over Search plays × video
length (`src/revenue/youtube-analytics.ts:191-197`), and today the plays are `row.views` (`:179`). With K0 pinned to
`engagedViews`, leaving `views` in the denominator would give one reading two definitions of "a view", and first-frame
starts nobody chose would deflate the percentage the RED-TEAM's ≥ 30% expectation (`RED-TEAM.md:148-150`) is read
against. "Shown and abandoned" is a statement about plays that were chosen. The denominator therefore follows the pin.
This is pre-registration, not a change after data: no video exists.

### Pre-registered instrument check (so a broken read is never a FAIL)

Nothing rendered proves the traffic-source report populates `engagedViews` for long-form the way it does for Shorts.
The reader already records both medians and both per-video counts (`youtube-analytics.ts:120-122, :131`). Rule, written
now: **if at any read every video has `engagedViews = 0` while `views > 0`, that is an instrument fault, recorded as
such and fixed before day 56 — never read as a K0 FAIL, and never silently swapped to `views`.** If it cannot be fixed by
day 56, `K0-unmeasured` fires as the existing rule says (`experiments.ts:140-142`): an experiment nobody can read is not
an experiment.

### Exact code change (for Opus) — `src/revenue/youtube-analytics.ts`

Replace lines 30-38 (the comment and the constant) with:

```ts
/**
 * Which view count K0 reads. RED-TEAM §2.4 required the pin before the first upload; the board decided it on 27.9.2026
 * (research/faceless-youtube/PREREG-DECISIONS.md §1): `engagedViews` — "viewed past the first frame, or the user
 * clicks/taps to play" (yt-analytics-metrics.txt:200-202). Since August 2026 a `view` is counted "the moment a video
 * begins to play" (youtube-policy-changelog.txt:62); the 35-view floor was measured in 2022 under the older counting, and
 * `engagedViews` is the metric that keeps that definition. A K0 FAIL therefore means fewer than 35 strangers chose the
 * median video, which is the claim K0 exists to make. Both counts are still recorded on every read, so the pin can be
 * audited against the same data. Passing `viewMetric: null` explicitly still yields an unreadable (null) K0.
 */
export const PINNED_VIEW_METRIC: ViewMetric | null = "engagedViews";
```

Replace lines 178-181 (inside the row loop) with:

```ts
    if (source === "YT_SEARCH") {
      // The diagnostic's denominator is the same pinned metric K0 reads: one definition of "a view" per reading
      // (PREREG-DECISIONS.md §1). Unpinned (null) falls back to `views` only because the median is null anyway.
      reading.search.views += num(row[viewMetric ?? "views"]);
      reading.search.minutes += num(row.estimatedMinutesWatched);
    }
```

And in `VideoStrangerReading` (line 124) change the field comment so the meaning is on the type:

```ts
  /** Search-only: plays under the pinned view metric (the diagnostic's denominator), and minutes. */
  search: { views: number; minutes: number };
```

Keep the `notes.push("view metric not pinned …")` at line 189: it now fires only when a caller passes `null` explicitly.
`scripts/youtube-analytics.ts` needs no change (it already prints both medians and "unpinned" when null).

**Test change — `src/__tests__/revenue/youtube-analytics.test.ts:80-86`.** Replace the test
"leaves K0 unreadable — null, not zero — until the view metric is pinned" with:

```ts
  it("K0 reads engagedViews by default (PREREG-DECISIONS.md §1); an explicit null still leaves it unreadable", () => {
    expect(PINNED_VIEW_METRIC).toBe("engagedViews");
    const r = computeYoutubeReadings({ videos: VIDEOS, trafficTable: table });
    expect(r.viewMetric).toBe("engagedViews");
    expect(r.medianStrangerViews).toBe(5);
    expect(r.medianByMetric).toEqual({ views: 6, engagedViews: 5 });
    // The diagnostic's denominator follows the pin: 120 min × 60 over 30 engaged Search plays × 600 s = 40%.
    expect(r.averageViewPercentage).toBeCloseTo(40, 10);
    const unpinned = computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, viewMetric: null });
    expect(unpinned.medianStrangerViews).toBeNull();
    expect(unpinned.medianByMetric.views).toBe(6);
    expect(unpinned.notes.join(" ")).toMatch(/not pinned/);
  });
```

The existing 30% assertion at `:87-94` passes `viewMetric: "views"` explicitly and stays as it is (40 plays → 30%).
`experiments.test.ts` and `PINNED_GATES_SHA256` are untouched: no gate number changes.

Pointer to update when convenient (not required for the pin): `T1-PROTOCOL.md:87-88` still says the pin is "pending the
board"; it is now decided here.

---

## Decision 2 — `containsSyntheticMedia = true`; a fixed disclosure sentence; a real-person voice is never made

### (a) The flag: `true` for every chart + synthetic-narration video

**What the field is.** The API calls it altered or synthetic content: "The YouTube Data API v3 has added support for
identifying videos with altered or synthetic content through the status.containsSyntheticMedia property" —
`research/rendered/youtube-api-revision-history.txt:245`; "To indicate whether a video contains A/S content, set the
status.containsSyntheticMedia property. This property can be set when calling the videos.insert or videos.update
methods." — `:401-405`. Our narration is synthetic audio by the plain meaning of the field we set. `false` would be a
false statement about the file at the API level, before any policy reading.

**What the Help page requires and exempts** (`research/rendered/youtube-altered-synthetic-disclosure.txt`, read in full):

- Purpose: "viewers want to know if what they're watching or **listening to** is real." — `:61`.
- Scope: "we require creators to disclose when they use AI to meaningfully alter or generate photorealistic content."
  — `:63`; the three named cases — a real person made to say or do something, altered footage of a real event or place,
  "a realistic scene that didn't actually occur" — `:67-71`.
- The dividing rule: "Realistic AI content and meaningful changes require disclosure, while non-realistic or minor edits
  don't." — `:83`.
- Exempt, and true of this video class: "Creators don't need to disclose non-realistic content that's made with AI" —
  `:87` (the charts); "Production assistance, like using generative AI tools to create or improve a video outline,
  script, thumbnail, title, or infographic" — `:107` (the LLM-written script).
- The only voice exemption: "Cloning one's own voice to create voice overs or dubs" — `:115`. There is no "own voice"
  here; the operator is a colony of agents. Nothing on the page exempts a stock synthetic voice. REGRADE recorded the
  gap: "The disclosure page never mentions TTS or synthetic narration. The only voice example exempts 'Cloning one's own
  voice …', which a stock voice is not … So the lean is unsettled, and the flag choice should not rest on it." —
  `REGRADE.md`, policy C8 row.

**Why the voice decides it.** The charts and the script are exempt on their own. The narration is a human-sounding voice
engineered so that a listener cannot tell it from a person speaking — that is "realistic" audio by the page's own
purpose statement (`:61`), and the audio counterpart of "a realistic scene that didn't actually occur" (`:71`): a
narrator speaking who does not exist. The viewer the disclosure exists for is the one who hears a person and assumes
there is one. MISSION rule 4 is the tie-breaker where the page is silent: "nothing that deceives a buyer … If a line can
only earn by misleading someone, it gets killed, not shipped." — `MISSION.md:342-344`. VERDICT §11 designed the channel
as "narrated by a **disclosed** unnamed TTS voice" (`VERDICT.md:302-303`); the flag is the platform's disclosure
instrument, and "disclosed" without it would mean disclosed only in an About page nobody reads before pressing play.

**What it costs: nothing. What the other error costs: the channel's whole defence.**

- "Note: Disclosing AI content won't limit a video's audience or impact its eligibility to earn money." — `:173`.
- "Labels may appear in the expanded description for AI content that is non-photorealistic or animated." — `:171`.
  YouTube's own label system anticipates a Yes on non-photorealistic content and places the label in the description.
  No penalty for over-disclosure appears anywhere on the page; the penalties named are for creators "who consistently
  choose not to disclose" — `:193`.
- "YouTube may automatically apply an AI label … for: … Content that our internal systems detect is Al generated or
  altered" — `:177-183`. If our flag says No and the detector says Yes, a human YPP reviewer sees an AI-produced channel
  that declined to disclose AI. The channel's only defence against "AI-generated content made with generic or unoriginal
  templates giving the impression of mass production" (`youtube-monetization-policies.txt:140`) and against the
  AI-persona rule (`:244`) is transparency; RED-TEAM §2.11 asked that the AI disclosure stay "prominent so no reviewer
  reads the narrator as a human expert" (`RED-TEAM.md:214-215`). A No contradicted by YouTube's own label is the
  expensive error. A Yes on content YouTube would have called non-realistic costs a description-level label and nothing
  else.

**The counter-argument, weighed.** REGRADE (prompt-critique auditor angle): "the instruction ties Yes to meeting the
disclosure requirements, and :163 says selecting Yes indicates 'that their content is realistic and generated by AI or
meaningfully altered with AI'. A blanket default of Yes departs from the page's own wording, so the board should choose
deliberately rather than by default." Agreed on the method — this is a deliberate choice, and its ground is the voice,
not a default. The finding is that a human-sounding synthetic voice **is** realistic AI audio; any departure from the
page's wording is at most in YouTube's internal characterisation, not in what the viewer is told, and what the viewer is
told is true.

**The publisher's document** (`research/rendered/upload-post-ai-content-labeling.txt`, captured 27.9.2026; vendor text,
weighed as vendor text):

- The value can be sent as ruled: the YouTube row maps to "containsSyntheticMedia — Altered/synthetic content disclosure
  on the video" (`:77-79`), and "if you send a platform-specific value it takes precedence over the alias" (`:85`). Send
  the platform field, not the `is_ai_generated` alias.
- The vendor's own reading cuts our way on the mechanics and does not reach our case on the exemption: "Platform policies
  require disclosure of realistic AI-generated or significantly synthetic media (TikTok, YouTube, and Meta may penalize
  unlabeled AI content their detectors catch)" (`:113`); "Clearly unrealistic/stylized AI content (e.g. obvious cartoons)
  generally does not require YouTube's containsSyntheticMedia disclosure — check each platform's current policy" (`:117`).
  A voice built to sound human is not an obvious cartoon. `:115` also mentions EU AI Act Art. 50(4) on AI-generated text
  "published to inform the public"; this board does not rule on EU law (MISSION: no lawyers), and notes only that it
  points the same way.
- The vendor's n8n node defaults the flag to false (`T1-PROTOCOL.md:40-42`). That is why the gate below checks the
  **value**, not merely that it was set: a builder that forgets is caught.

### (b) The description sentence — beyond the flag

The platform label for non-photorealistic content only "may appear" (`:171`), and the About text required by the
creator-integrity rule — "be who they say they are and not misrepresent themselves" (`youtube-monetization-policies.txt:294`;
`VERDICT.md:115-116`) — is one click away from the video. The description is where the viewer who expands it already
finds the data attribution G7 requires; the voice disclosure belongs beside it. It also carries the Kokoro provenance
that RED-TEAM §2.12 asked to travel with the channel (`RED-TEAM.md:217-221`), and it states in words that the narrator
is not a human expert, which is the mitigation VERDICT open question 3 has (`VERDICT.md:398-399`).

Pre-registered text, verbatim, checked by G7 under the same normalisation as the licence attribution:

> Narration: a synthetic voice (Kokoro text-to-speech), not a recording of any person and not an imitation of anyone.
> Charts are drawn by code from the data cited below. Produced with AI systems.

No brand name, no operator name, no owner identifier (MISSION, anonymity section). A change to this wording is a change
to a constant with a commit, never an ad-hoc edit in a description.

### (c) A voice that imitates a real person: never made — with or without the flag

The brief asks whether the answer changes if a future video used a voice that imitates a real person. It does not
change into "set the flag"; it changes into "the video is not made."

- The page makes such content disclosable — "Makes a real person appear to say or do something they didn't do" (`:67`);
  "Making it appear as if someone gave advice that they did not actually give" (`:137`) — but disclosure is what YouTube
  requires of it, not what makes it honest. A viewer told "AI" is still led to hear a person who never spoke.
- It is misrepresentation under the creator-integrity rule (`youtube-monetization-policies.txt:294`) and deception under
  MISSION rule 4 (`MISSION.md:342-346`), which "wins over the revenue goal every time".
- This video class passes at all because Kokoro's stock voices are nobody's: its training excluded "custom voice clones"
  — "[2] No synthetic audio from open TTS models or 'custom voice clones'" (`research/rendered/kokoro-82m-model-card.txt:237`)
  — and its voices are not presented as any person's. A cloning engine, or a voice marketed or derived from an
  identifiable person, is banned for this channel and for any successor. That is a "must never" in the sense of
  `src/revenue/org.ts`, so it is enforced in the gate below, not remembered.

### Where the values live, and the exact code change (for Opus)

**Authority: `src/revenue/publication-gate.ts`.** The gate's own header says why: "The gate is code so that 'we checked'
is a result, not a memory" (`publication-gate.ts:4`). The manifest builder in `products/chart-explainer/` (an Opus builder
is working there; nothing below touches it) must **import** the two constants and set the field and the description from
them, so builder and gate cannot drift. The publisher call sends `containsSyntheticMedia=true` explicitly.

Add, after `ALLOWED_DATA_LICENCES` (line 91):

```ts
/**
 * YouTube's altered-or-synthetic flag for this video class — charts drawn by code plus Kokoro narration: `true`.
 * Board ruling 27.9.2026, research/faceless-youtube/PREREG-DECISIONS.md §2a. The narration is synthetic media by the
 * API field's own name (youtube-api-revision-history.txt:245, :401-405); a human-sounding voice is what the disclosure is
 * for (youtube-altered-synthetic-disclosure.txt:61); disclosing costs nothing (:173) and the label for non-photorealistic
 * content lands in the description (:171). The publisher's node defaults the field to false (T1-PROTOCOL.md), so G7
 * checks the value, not only that it was decided.
 */
export const CHART_TTS_SYNTHETIC_MEDIA = true;

/**
 * The sentence every description carries verbatim (PREREG-DECISIONS.md §2b), beside the data attribution G7 already
 * requires. The platform label only "may appear" (disclosure.txt:171); this one is ours and always there.
 */
export const SYNTHETIC_VOICE_DISCLOSURE =
  "Narration: a synthetic voice (Kokoro text-to-speech), not a recording of any person and not an imitation of anyone. " +
  "Charts are drawn by code from the data cited below. Produced with AI systems.";

/**
 * Narration engines whose stock voices are nobody's (PREREG-DECISIONS.md §2c). Kokoro's training excluded "custom voice
 * clones" (kokoro-82m-model-card.txt:237). A cloning engine, or a voice that imitates an identifiable person, cannot pass
 * this gate with or without the flag: such a video is never made.
 */
export const ALLOWED_NARRATION_ENGINES: ReadonlySet<string> = new Set(["kokoro-82m"]);
```

Add to `VideoManifest` (after `containsSyntheticMedia`, line 53):

```ts
  /** What speaks. Only an engine in ALLOWED_NARRATION_ENGINES passes; a voice imitating a real person is never made (§2c). */
  narration: { engine: string; voiceId: string };
```

Replace the G7 block (lines 232-239) with:

```ts
  // G7 — the synthetic-media flag as the board ruled, the voice disclosure sentence, a nobody's-voice engine, and every
  // dataset attributed with its licence in the description (PREREG-DECISIONS.md §2).
  if (video.containsSyntheticMedia === null) fail("G7", "containsSyntheticMedia was never decided");
  else if (video.containsSyntheticMedia !== CHART_TTS_SYNTHETIC_MEDIA) {
    fail("G7", `containsSyntheticMedia is ${video.containsSyntheticMedia}; the board ruled ${CHART_TTS_SYNTHETIC_MEDIA} for chart + synthetic-narration videos`);
  }
  const desc = normLicence(video.description);
  if (!desc.includes(normLicence(SYNTHETIC_VOICE_DISCLOSURE))) fail("G7", "the description does not carry the synthetic-voice disclosure sentence verbatim");
  if (!ALLOWED_NARRATION_ENGINES.has(video.narration.engine)) {
    fail("G7", `narration engine "${video.narration.engine}" is not one whose voices imitate nobody; such a video is never made`);
  }
  for (const d of video.datasets) {
    if (!desc.includes(normLicence(d.name)) || (d.licence && !desc.includes(normLicence(d.licence)))) {
      fail("G7", `the description does not attribute ${d.name} with its licence ${d.licence ?? ""}`.trim());
    }
  }
```

(`normLicence` lower-cases and turns `-`/`_` runs into single spaces on both sides, so "text-to-speech" matches however
the description writer hyphenates it; the rest of the sentence must be verbatim, which is the intent.)

**Test changes — `src/__tests__/revenue/publication-gate.test.ts`.** Import `SYNTHETIC_VOICE_DISCLOSURE` beside
`checkPublication`. In the `video()` fixture (lines 11-40): append the sentence to the description and add the narration
field —

```ts
    description:
      "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0. " +
      SYNTHETIC_VOICE_DISCLOSURE,
    // …
    containsSyntheticMedia: true,
    narration: { engine: "kokoro-82m", voiceId: "af_heart" },
```

and add to `describe("G7 disclosure and attribution")` (line 156):

```ts
    it("fails when the flag is false: the board ruled true for chart + synthetic-narration videos", () => {
      expect(failed(checkPublication(video({ containsSyntheticMedia: false }), channel(), "publish", exists))).toContain("G7");
    });
    it("fails when the description lacks the synthetic-voice sentence", () => {
      const noVoice = "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0.";
      expect(failed(checkPublication(video({ description: noVoice }), channel(), "publish", exists))).toContain("G7");
    });
    it("fails on any narration engine but Kokoro: a voice that imitates a real person is never made", () => {
      expect(failed(checkPublication(video({ narration: { engine: "voice-clone-x", voiceId: "someone" } }), channel(), "publish", exists))).toContain("G7");
    });
```

The existing test at `:157-158` (null → G7) and `:160-161` (missing attribution → G7) stay as they are; the fixture's
existing `containsSyntheticMedia: true` already matches the ruling.

**For the manifest builder (`products/chart-explainer/`, whenever it lands):** `containsSyntheticMedia: CHART_TTS_SYNTHETIC_MEDIA`,
`narration: { engine: "kokoro-82m", voiceId: <the stock voice used> }`, description = attribution lines +
`SYNTHETIC_VOICE_DISCLOSURE`; the publisher request carries the platform field `containsSyntheticMedia=true`, never the
`is_ai_generated` alias (`upload-post-ai-content-labeling.txt:85`), and never `youtube_publish_at` (`T1-PROTOCOL.md:43`).
The T1 video is a real video and goes through the same gate (`T1-PROTOCOL.md:38-39`).

---

## What was not decided here, on purpose

- No gate number in `FACELESS_YOUTUBE_EXPERIMENT` moves; `PINNED_GATES_SHA256` in `experiments.test.ts` stays valid.
- Whether YouTube's YPP eligibility or earnings for **long-form** run on `engagedViews` as they do for Shorts
  (`changelog:324`) — not on any rendered page; irrelevant to K0, which is a reach floor, not a revenue gate.
- Whether a disclosed unnamed TTS narrator is an "AI-generated persona" under `youtube-monetization-policies.txt:244` —
  VERDICT open question 3 stays open; this decision mitigates it (flag + sentence + About), it does not settle it.
- The About text itself (VERDICT §14.6, channel identity kit) — not this brief; it must still say the channel is
  AI-produced by an unnamed operator (`VERDICT.md:115-116`).

## The one sentence the board is least sure of

"The 2022 public view counts McGrady et al. sampled were counted under a definition at least as strict as today's
`engagedViews`." YouTube never published the pre-2026 long-form counting rule; the claim rests on the changelog's own
description of what was kept and what changed (`changelog:62, :322`), not on a rendered definition of the 2022 count. If
it is wrong, the pin is still the more conservative of the two available metrics and the threshold is still uncalibrated
in the direction already recorded; nothing here would need to move, but the sentence would.

## Path

`MISSION.md` → `src/revenue/experiments.ts`, `youtube-analytics.ts`, `publication-gate.ts` and their tests →
`RED-TEAM.md` (§1, §2.4, §2.11, §2.12) → `VERDICT.md` (§4, §7, §9-§12, §15) → `T1-PROTOCOL.md` → `REGRADE.md` (rows on
DISC:157, :163, :83, :173) → `audits/discovery.md` (§0.2, §4) → rendered: `yt-analytics-metrics.txt:180-230`,
`yt-analytics-channel-reports.txt:1000-1052`, `youtube-policy-changelog.txt:62, :318-326`,
`youtube-altered-synthetic-disclosure.txt` (all 351 lines), `youtube-api-revision-history.txt:245, :401-407`,
`youtube-monetization-policies.txt:82-86, :112-142, :216, :244-252, :294, :342`, `kokoro-82m-model-card.txt:225-260`,
`upload-post-ai-content-labeling.txt:55-120`. No WebSearch. No git. No owner identifier appears in this file.

---

# Decision 3 (28.9.2026) — the web arm's reach floor, pre-registered before any deploy

**Board: Fable 5.1, deciding tier, daily sitting of 28.9.2026** (FABLE_QUEUE row 11; the ruling file for the same
sitting is `research/channel-loop/RULING-2026-09-28-floors.md`). Inputs: RED-TEAM §2.1(c) and §2.5, `T1-PROTOCOL.md`
(order item 4), §1-§2 above, `products/chart-explainer/page.py` and `tests/test_page_counter.py`, BOARD-LOOP rank 5 and
PUBLISH-10, `src/revenue/experiments.ts`; PostHog's own documentation on bot traffic, retrieved today; the Public Suffix
List, rendered today. **Nothing is deployed yet**; this is written so that no line is moved after the data exists. The
gate numbers in `FACELESS_YOUTUBE_EXPERIMENT` are not touched; `PINNED_GATES_SHA256` stays.

## סיכום לבעלים (שתי שורות)

- **הרצפה:** מתחת ל-**5** צפיות של זרים שגללו את הדף ב-56 הימים מהפרסום — **שלב A לא נשאל** (לא נבקש מהבעלים דקה על
  YouTube). 5 ומעלה — אפשר לשאול, עם המספר מצורף. קריאה שאי אפשר לקרוא היא תקלת מכשיר, לא תוצאה.
- **מה לא סופר:** הצפיות שלנו (כתובת נפרדת לכל קישור שלנו), רובוטים (המונה נשלח רק אחרי גלילה, ורובוט שלא מריץ JavaScript
  לא שולח כלום), ואירועים שמישהו אחר שולח עם המפתח הציבורי (צורת המטען שלנו קבועה). המארח `*.netlify.app` לא משנה את
  המספר — הוא משנה מה נחשב יום 0 ואיך קוראים אפס.

## 3.1 Ruling

1. **The metric.** `N` = the number of `$pageview` events in the PostHog project whose `$current_url` equals the canonical
   production URL exactly (origin + pathname, as the script sends it), whose payload has exactly our shape (§3.4(c)),
   over the 56 days from D0 (§3.5). The script sends the event on the visit's **first scroll**, never on load (§3.4(b)),
   so an event is a visit that started reading — the web analogue of the `engagedViews` pin in §1: a chosen view, not a
   first frame.
2. **The floor.** **N < 5 → Stage A is never asked.** The experiment is recorded as ended on a web-arm null (`K-web` in the
   readings, `stage_a_never_asked` from `evaluateWebArm`); the T1 video stays unpublished; K-T1 never runs; no video is
   rendered. **N ≥ 5 → Stage A may be put to the owner**, with N, the daily series and the list of discovery routes that
   were open (§3.5) attached to the ask, as T1-PROTOCOL order item 6 already requires. A pass carries no information
   beyond "not zero": it does not raise any ceiling and does not touch K0 or K3.
3. **Unmeasured.** If at D0+56 the count cannot be read (project unreadable, key lost, counter found broken, events
   arriving with no `$current_url`), that is an instrument fault: fixed, recorded, and the clock restarted from the fix —
   never read as a fail and never as a pass (BOARD-LOOP KILL-1; the K0-unmeasured principle of §1). Stage A is not asked
   on an unmeasured arm.
4. **The host does not change the number.** A `*.netlify.app` sub-brand host changes what D0 means and how a null is
   read (§3.5), not the floor.

## 3.2 Why a floor at all, and why five

- RED-TEAM §2.5 wrote the rule in one word: **zero** stranger reach at day 56 → Stage A is never asked, because "a channel
  whose substance draws zero Search impressions in 56 days is not one to spend owner minutes on". The web arm is a prior,
  not a substitute ("a web null does not prove a YouTube null"), so the floor must be a **zero test**, not a traction
  bar: its only job is to withhold 40-60 owner minutes and a standing brand Google account when nobody at all found the
  substance. The owner's 28.9 directive points the same way — a venue (here YouTube, with its own distribution) is not to
  be killed on a proxy before it had a fair chance — so the floor is the lowest number that still means "nobody".
- "Zero" has to be defined against the noise the instrument cannot remove. With the exclusions of §3.4 the residue is
  JavaScript-rendering crawlers that also fire a scroll event, plus anything that slips the payload-shape filter. That
  residue is small but not provably zero; a floor of 1 sits inside it. Five sits above any plausible crawl-and-scroll
  residue over 56 days and below any claim of traction (fewer than one reader a week).
- Considered and rejected: **1** (inside crawler noise, so a bot could buy the owner's hour); **10** (a traction claim —
  a reader a week — which is more than §2.5 asked and stricter than the arm it gates); **35** (K0's number, borrowed: it
  is the median lifetime view count of a random YouTube video under a recommender the web has no equivalent of, so it
  would make the prior stricter than the experiment, the wrong way round). None of these is a measured base rate for a
  new web page, and none was invented here: five is stated as what it is, a judgement about noise, recorded before the
  data exists so that it cannot be moved after.

## 3.3 Why the counter fires on scroll and not on load

- PostHog's client-side bot blocking lives in its JavaScript SDK and nowhere else: "The PostHog JavaScript SDK blocks known
  bots and crawlers client-side, so they never send events … This only covers events captured by the JavaScript SDK"
  (web-analytics/troubleshooting, retrieved 28.9.2026). Our page deliberately does not load that SDK (page.py:14-16).
- PostHog's query-time classification needs a user agent or an IP: "As long as your events carry a user agent —
  `$raw_user_agent` … or `$user_agent` … the virtual properties work as breakdowns and filters" (web-analytics/bot-detection);
  "PostHog classifies traffic by user agent and source IP address" (same page). Our script reads no user agent — the
  no-fingerprint promise, pinned by `test_counter_script_sends_one_anonymous_pageview_and_touches_no_storage` — and the
  project discards the IP (page.py:32-36). **So PostHog cannot tell our bots from our humans, by construction.**
- What excludes bots is therefore the structure of the counter, and PostHog's own page states the first half: "Most
  crawlers and AI agents don't run JavaScript, so they never trigger a client-side `$pageview` in the first place"
  (troubleshooting). The second half is ours: a renderer that does run JavaScript loads the page and snapshots it; a
  reader scrolls, because every chart on this page is below the first viewport. Sending on the first scroll costs the
  reader nothing, reads nothing about them, and turns "the page was loaded by something" into "someone started reading".
- Not chosen: sending `document.referrer` (would widen what leaves the browser beyond the disclosure's "the page's
  address and a random number"); sending the user agent (breaks the fingerprint promise the tests pin); loading
  posthog-js (a third-party library on a page designed to load none). The scroll trigger keeps the payload byte-identical
  and only changes *when* it is sent.

## 3.4 What is excluded, and how

**(a) Our own views — by address, not by promise.**
- The read counts `$current_url` equal to the canonical production URL only. Netlify's deploy-preview and branch-deploy
  hosts are different origins, so anything the loop opens there is excluded automatically.
- Every colony-facing and owner-facing link to the page — the report, `CHANNEL_LOOP.md`, the checkpoint, the owner page,
  a chat message — uses the **`/preview/` path**, served as the same file by a Netlify rewrite; the script sends
  `location.origin + location.pathname`, so those loads carry a different `$current_url` and never count. `/preview/*`
  gets `X-Robots-Tag: noindex` in `_headers` and a `Disallow: /preview/` line in `robots.txt`, so the copy is never a
  second indexed page. (Netlify `_redirects`/`_headers` syntax: Opus verifies against Netlify's documentation before
  deploy; the container cannot reach it, the Netlify connector can.)
- The colony never opens the canonical URL in a JavaScript-executing browser. Public-ness is probed with non-JS fetches
  from a runner (PUBLISH-8), which never fire the script; the counter itself is verified once, on a deploy-preview URL.
  Any exception is recorded in the readings file with its timestamp and subtracted; the expected number of exceptions is
  zero.

**(b) Bots — by structure (§3.3).** No JavaScript → no event. JavaScript renderers that do not scroll → no event. The
residue (renderers that scroll) is what the floor of five sits above. N is therefore an **upper bound** on human readers,
and the floor is set knowing it.

**(c) Anyone with the public token — by payload shape.** The project token is public by design (page.py:24-30), so a
stranger could post events. Ours have exactly the properties `{"$process_person_profile": false, "$current_url": …}` and
no `$lib`, `$lib_version`, `$referrer`, `$browser` or other SDK field. The read counts only events with exactly that
shape; anything else is listed in the readings as foreign and excluded.

## 3.5 The `*.netlify.app` sub-brand host: what it changes and what it does not

- **The number: unchanged.** Five is a statement about noise on an instrument that does not depend on the host
  (RED-TEAM §2.1(c); BOARD-LOOP PUBLISH-10 already said the web arm's clock does not wait for the domain).
- **Reputation: none shared, either way.** `netlify.app` is on the Public Suffix List (`public_suffix_list.dat`, line
  14892, rendered from GitHub on 28.9.2026), so browsers and search engines treat each `*.netlify.app` site as its own
  site: no inherited standing from other Netlify sites, no inherited penalty. For ranking purposes a sub-brand host is a
  brand-new site with no history — the same as a freshly bought domain would be.
- **Discovery: a new host with no inbound link has no crawl path.** That is MISSION constraint 7 in its purest form, and a
  floor without a route measures nothing. So **D0 is the day both hold**: the deploy is public (runner 200, clean
  identifier grep), **and** a discovery submission is recorded in the readings file. Routes, in order:
  1. `sitemap.xml` and `robots.txt` on the host (always).
  2. An IndexNow submission (Bing, Yandex, Seznam, Naver and others; Google does not participate). From memory it is
     ₪0 and keyless — generate a key, host `<key>.txt` at the site root, one GET to the IndexNow endpoint — but
     `indexnow.org` is blocked from this container (CONNECT 403 today), so **Opus renders its documentation from a
     runner before relying on it**; if it turns out to need an account or money, it is not used and the readings say so.
  3. **No link from the repository under the owner's personal username.** A backlink from a username-named repository to
     a brand surface is a public association the anonymity rule forbids (MISSION: the brand is the only public face; the
     skills index "is not to be advertised anywhere"). Links from **brand** surfaces are allowed and dated in the readings:
     the brand organisation's README after owner step 7, il-biz-tools once it is public, the Apify Actor README once
     published.
  4. Google has no route until a brand link exists or Stage A itself creates the brand Google account. This is recorded,
     not worked around, and it is the honest limit of the read: **the arm measures reach on the routes that were open,
     not the substance's ceiling.** A null therefore licenses exactly what §2.5 needs — withholding Stage A — and nothing
     more; it is not a verdict on the six analyses, and a later brand link starts a new, separately recorded 56-day
     clock if the board chooses to run one.
- A later 301 from the sub-brand host to the brand domain does not restart the clock (BOARD-LOOP rank 5, unchanged).
- Netlify's free tier gives no server logs, so "not crawled" cannot be told from "crawled, nobody clicked". Recorded as a
  known limitation, same class as RED-TEAM §2.1(c)'s "not seeing shown-and-ignored impressions".
- 29.9.2026 — sub-brand host: **pending the runner check** (`research/channel-loop/RULING-2026-09-29-lines.md` (e): the
  first all-free name of `research/measurements/t1-subbrand-candidates.txt`, read from `t1-subbrand-check.md`). The
  brand Google-account question is deferred to `logs/FABLE_QUEUE.md` row 16; the host name does not depend on it.

## 3.6 Exact code changes (for Opus)

**`products/chart-explainer/page.py`**

Replace `counter_script` with:

```python
def counter_script(host: str, key: str) -> str:
    """The one inline script: a single anonymous $pageview to PostHog's capture endpoint, sent on the visit's FIRST SCROLL
    and never on load (research/faceless-youtube/PREREG-DECISIONS.md §3: a renderer that never scrolls sends nothing, and
    a visit that never scrolls is not counted as a reader). The id is 16 random bytes drawn when the event is sent and
    never stored; `credentials: "omit"` keeps the browser from attaching any cookie or stored credential; a failed send is
    dropped rather than retried; `once: true` means a second scroll sends nothing. Call it only with counter_config's
    output."""
    return f"""<script>
addEventListener("scroll", function () {{
  var b = new Uint8Array(16), id = "";
  crypto.getRandomValues(b);
  for (var i = 0; i < b.length; i++) id += (b[i] + 256).toString(16).slice(1);
  fetch({json.dumps(host + CAPTURE_PATH)}, {{
    method: "POST",
    headers: {{"Content-Type": "application/json"}},
    credentials: "omit",
    body: JSON.stringify({{
      "api_key": {json.dumps(key)},
      "event": "$pageview",
      "distinct_id": id,
      "properties": {{"$process_person_profile": false, "$current_url": location.origin + location.pathname}}
    }})
  }}).catch(function () {{}});
}}, {{ once: true, passive: true }});
</script>
"""
```

Replace `COUNTER_DISCLOSURE` with (verbatim):

```python
COUNTER_DISCLOSURE = """
<p>This page counts visits anonymously, without cookies, through PostHog, and stores nothing about the visitor.
The first time a visit scrolls the page, one small script on it sends PostHog a single page-view event holding the
page's address and a random number drawn for that visit alone, with person profiles switched off; a visit that never
scrolls sends nothing. It sets no cookie and writes nothing to your browser. Your IP address reaches PostHog with that
request, as it reaches any server a page talks to; the PostHog project is set to discard it and to derive no location
from it.</p>"""
```

In the module docstring, the "On" paragraph: "When the page opens, the script sends ONE anonymous `$pageview` event" →
"The first time a visit scrolls the page, the script sends ONE anonymous `$pageview` event (a visit that never scrolls
sends nothing, and so does a crawler that renders the page without scrolling — PREREG-DECISIONS.md §3)". The off mode and
the golden file are untouched.

**`products/chart-explainer/tests/test_page_counter.py`** — in `test_counter_script_sends_one_anonymous_pageview_and_touches_no_storage`
add:

```python
    # Sent on the first scroll, once, never on load (PREREG-DECISIONS.md §3.3).
    assert 'addEventListener("scroll"' in js and "once: true" in js and "passive: true" in js
    assert "DOMContentLoaded" not in js and '"load"' not in js and "setTimeout" not in js
```

`test_counter_disclosure_names_what_is_sent_and_what_is_not_kept` gains `assert "never scrolls sends nothing" in text`;
`test_the_module_docstring_describes_both_modes` gains `assert "scroll" in doc`. The `DISCLOSURE` constant (first
sentence) and every other assertion stay as they are.

**`src/revenue/experiments.ts`** — add after `FACELESS_YOUTUBE_EXPERIMENT`:

```ts
/**
 * The web comparison arm's reach floor (research/faceless-youtube/PREREG-DECISIONS.md §3, board 28.9.2026), read at
 * day 56 from the arm's own D0 (public deploy + recorded discovery submission). Kept apart from the experiment's gates:
 * the arm has its own clock, and its verdict is procedural — whether Stage A may be put to the owner (T1-PROTOCOL order
 * item 6) — not a channel gate. `engagedStrangerViews` is the count of $pageview events at the canonical URL, sent on
 * first scroll, own paths and preview hosts excluded, payload shape ours; null = the project could not be read.
 */
export const WEB_ARM_REACH = { day: 56, minEngagedStrangerViews: 5 } as const;

export interface WebArmReading {
  day: number;
  engagedStrangerViews: number | null;
}

export type WebArmVerdict = "not_due" | "unmeasured" | "stage_a_never_asked" | "stage_a_may_be_asked";

export function evaluateWebArm(r: WebArmReading, g: typeof WEB_ARM_REACH = WEB_ARM_REACH): WebArmVerdict {
  if (r.day < g.day) return "not_due";
  if (r.engagedStrangerViews === null) return "unmeasured";
  return r.engagedStrangerViews < g.minEngagedStrangerViews ? "stage_a_never_asked" : "stage_a_may_be_asked";
}
```

**`src/__tests__/revenue/experiments.test.ts`** — add:

```ts
describe("web arm reach floor (PREREG-DECISIONS.md §3, pre-registered 28.9.2026)", () => {
  it("has not been edited", () => {
    expect(WEB_ARM_REACH).toEqual({ day: 56, minEngagedStrangerViews: 5 });
    const hash = createHash("sha256").update(JSON.stringify(WEB_ARM_REACH)).digest("hex");
    expect(hash).toBe("aed85a892d9ba49b513f6b1e6b94c6ffe81c225d98eab015a82695e3894bb4d2");
  });
  it("decides only at day 56, only from a reading, and five is the floor", () => {
    expect(evaluateWebArm({ day: 55, engagedStrangerViews: 0 })).toBe("not_due");
    expect(evaluateWebArm({ day: 56, engagedStrangerViews: null })).toBe("unmeasured");
    expect(evaluateWebArm({ day: 56, engagedStrangerViews: 4 })).toBe("stage_a_never_asked");
    expect(evaluateWebArm({ day: 56, engagedStrangerViews: 5 })).toBe("stage_a_may_be_asked");
    expect(evaluateWebArm({ day: 90, engagedStrangerViews: 0 })).toBe("stage_a_never_asked");
  });
});
```

(The hash is sha256 of the 38-byte string `{"day":56,"minEngagedStrangerViews":5}`, computed by the board today.)
`PINNED_GATES_SHA256` is untouched.

**Deploy files for the sub-brand site** (checked against Netlify's docs before deploy): `_redirects` with
`/preview/  /index.html  200`; `_headers` with `/preview/*` → `X-Robots-Tag: noindex`; `robots.txt` with
`Disallow: /preview/` and the `Sitemap:` line; `sitemap.xml` listing the canonical URL only.

**The readings file** — `research/faceless-youtube/readings/web-arm.json`, written by the loop: D0 with its two
conditions and timestamps, the routes opened with dates (§3.5), any recorded exception under §3.4(a), the daily series
of counted events, the count of foreign-shaped events excluded, and at D0+56 the verdict of `evaluateWebArm` — so an
auditor re-runs it on the same numbers.

**Pointers to update when convenient:** `T1-PROTOCOL.md` order item 4 ("It needs the brand domain, owner step 5") is
superseded by BOARD-LOOP rank 5 and this section (a `*.netlify.app` sub-brand host, D0 as defined here); BOARD-LOOP
rank 5's "Kill if … zero stranger reach" now reads "under 5 engaged stranger page views, as pre-registered".

## 3.7 The sentence the board is least sure of

"JavaScript-rendering crawlers do not, as a rule, fire scroll events." It rests on how such renderers are described in
Google's own rendering documentation as the board remembers it (the page is blocked from this container and was not
rendered today), on the fact that the renderer has nothing to scroll for, and on PostHog's statement that most crawlers
run no JavaScript at all. If it is wrong, N over-counts and the floor of five is lenient in the direction already
recorded — a false pass costs the owner's hour; a false fail is not made more likely — and the fix would be a higher
floor, decided in writing before the next arm, never a quiet edit to this one.

## 3.8 Path

`MISSION.md` (rule 1, rule 4, constraint 7, the anonymity section, 28.9 addition) → `RED-TEAM.md` §2.1(c), §2.5 →
`T1-PROTOCOL.md:26-28, :34` → §1 and §2 above → `BOARD-LOOP.md` rank 5, PUBLISH-8, PUBLISH-10, KILL-1 →
`products/chart-explainer/page.py:1-37, :69-78, :159-182`, `tests/test_page_counter.py` → `src/revenue/experiments.ts`,
`src/__tests__/revenue/experiments.test.ts:118-129` → PostHog docs retrieved 28.9.2026 (web-analytics/troubleshooting
"Do stats include bots and crawlers?", web-analytics/bot-detection, web-analytics/managing-bot-traffic) →
`public_suffix_list.dat:14892` (rendered 28.9.2026). Not rendered (blocked, CONNECT 403): indexnow.org, Google's rendering
documentation, Netlify's redirects documentation — each is named above as something Opus renders before relying on it.
No git. No owner identifier appears in this section.
