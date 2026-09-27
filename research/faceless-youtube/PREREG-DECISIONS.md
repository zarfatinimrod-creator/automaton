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
