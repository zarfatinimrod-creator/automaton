# T1 audit: G3 (originality) and G5 (promise match)

- **Video:** `t1-typescript-javascript`, "Is TypeScript catching up with JavaScript on GitHub?"
- **Author:** `opus-builder`. **Auditors:** `opus-originality-auditor` (G3), `opus-promise-auditor` (G5), both different from the author.
- **Audited script sha256:** `ded6992c3e0e2f22cb03eb0e6bfefb34112e9bbac9dc44a29d8801d71572dd31`, computed from `out/t1/manifest.json` `script`. Both verdicts are bound to this hash.
- **Date:** 2026-09-27

| Gate | Verdict | One line |
|---|---|---|
| G3 originality | **PASS** | The analysis appears nowhere else, the narration is written for this question and the charts are drawn for it. The slideshow form is saved by its narrative. |
| G5 promise match | **FAIL** | The "no" half of the answer lands at 0:33-0:42, outside the 30-second window. The absolute claim is not scoped to a count that files TypeScript projects under JavaScript too, which GitHub's own headline contradicts. |

## What was read

- The render outputs in `out/t1/`: the SRT (all 27 cues), `manifest.json`, `manifest.notes.json`, `render-report.json` and `figures.json`, plus all six chart PNGs, opened and inspected. I also pulled frames from the MP4 at 12 s and 37 s, and extracted the text of `page/index.html`.
- `analyses/t1.json` and `assemble.py` (to see how the frames are built).
- `VERDICT.md` §11-§12 (G3 at line 349, G5 at 352, the stack at 326), `RED-TEAM.md` and `T1-PROTOCOL.md`.
- `research/rendered/youtube-monetization-policies.txt` lines 60-240 and `research/rendered/github-innovationgraph-datasheet.txt`.
- The pinned CSV. I used the builder's `.cache` copy after checking its sha256 matches `795f7b9d…5dc2`. This was only to test how strongly the claims are worded, not to redo G4's recomputation.
- One WebSearch (below).

## Policy text relied on (file:line in `research/rendered/youtube-monetization-policies.txt`)

- :84: "Not be mass-produced, generic, repetitive, or manipulative. It should be made for the enjoyment or education of viewers, rather than for the sole purpose of getting views."
- :114: "Generic or repetitive content includes content that looks like it's made with a template, or that may feel repetitive to viewers after watching several videos in a row from the same channel."
- :120: "What's important is that the substance of each video should be materially varied and deliver creative, educational, or other value."
- :136: "Videos where characters are put in the same situation over and over again with the same outcome (i.e., using a highly similar storyline template across multiple videos)"
- :138: "Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value"
- :140: "AI-generated content made with generic or unoriginal templates giving the impression of mass production without adding the creator's original, authentic insights or perspective"
- :144: "Reused content refers to channels that repurpose content that's already on YouTube or another online source without adding significant original commentary, substantive modifications, or educational or entertainment value."
- :200: "Content downloaded or copied from another online source without any substantive modifications"
- :204: "Content that exclusively features readings of other materials you did not originally create, like text from websites or news feeds"
- :216: "If you use automated tools or templates to help create your content, the final product must still demonstrate your creative vision and provide educational or entertainment value."

The channel's own gate definitions:

- **G3** (`VERDICT.md:349-350`): "no competitor script or format modelled; every number computed from raw data; substance materially varied across the six [:120]; not templated [:114, :140]."
- **G5** (`VERDICT.md:352-353`): "the first 30 seconds deliver what title and thumbnail state …; no clickbait."

## The search (1 of 1)

The query was `TypeScript JavaScript GitHub Innovation Graph Octoverse TypeScript overtakes`. Results are graded as snippets; no page was fetched.

- **GitHub's own Octoverse 2025** (github.blog, "Octoverse: A new developer joins GitHub every second as AI leads TypeScript to #1") says that in August 2025 TypeScript overtook Python and JavaScript as the #1 language on GitHub by monthly contributors, about 2.64 million, up about 66% year on year.
- The same story was echoed by InfoWorld ("TypeScript rises to the top on GitHub"), Visual Studio Magazine (2025-10-31), InfoQ (2026-03, "convenience loops"), 36kr and vibe-data.com ("GitHub Says TypeScript is #1 - Our Data Shows Why"). Heise (2024) covered the previous year's Octoverse.
- **Nothing found uses the Innovation Graph `languages.csv`, a fixed economy panel, a relative-vs-absolute split, or a per-economy threshold count.** No video or article says what T1 says. The relevant existing content reaches a different headline on a different count, which matters for G5, not G3.

Sources: [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) · [InfoWorld](https://www.infoworld.com/article/4080454/typescript-rises-to-the-top-on-github.html) · [Visual Studio Magazine](https://visualstudiomagazine.com/articles/2025/10/31/typescript-tops-github-octoverse-as-ai-era-reshapes-language-choices.aspx) · [InfoQ](https://www.infoq.com/news/2026/03/ai-reshapes-language-choice/) · [vibe-data](https://vibe-data.com/intelligence/github-octoverse-typescript-number-one-oct-30-2025) · [heise](https://www.heise.de/en/news/GitHub-report-Python-overtakes-JavaScript-while-TypeScript-beats-Java-10003773.html)

---

## G3: originality, PASS

**1. Does it add analysis beyond restating a published chart or report? Yes.**

- **The fixed 92-economy panel is a real method choice with a stated reason.** TypeScript's reported economies grew from 93 to 162 (the s6 chart). A naive sum would mix real growth with coverage growth, and the video says so.
- **The relative-vs-absolute split is the point of the video.** It is the one thing a reader of either GitHub source would not get: Octoverse gives rankings, and the Innovation Graph site gives per-economy language lists.
- **The per-economy count** (47 of 92 at 50% or more, up from 0) **and the year-on-year gain bars are computations nobody has published** (search above).

**2. Is the narration written for this question or boilerplate? Written for it, on a reusable skeleton.**

- `analyses/t1.json` is a `{fig:}` template, but its words are specific: "Relative to JavaScript, yes, and quickly", "because both languages grew", "which is why we followed a fixed set".
- Each qualitative word is guarded by a claim that must hold in `figures.json` (`ratio_rose`, `gap_widened`, `both_grew`, `last_year_fastest`, `picture_same`, …, all `holds: true`). This is the opposite of boilerplate: the words fail the build if the data turns.
- I measured "the picture is the same" independently: the ratio rose in **92 of 92** economies, and the last-year gain was positive in **92 of 92** (median +10.5 pts, minimum +3.7).
- **Channel-level risk.** The spec is parameterised by `languageA`, `languageB`, `topN` and `thresholdPct`. A second "Is X catching up with Y?" video from it would be the :136 "highly similar storyline template", and the limits paragraph would recur in every Innovation Graph video. This is not a T1 defect; it is a constraint on videos 2-6 (:120).

**3. Are the visuals made for it? Yes.**

There are six charts drawn by matplotlib from the pinned CSV, each titled for this question and each carrying source and licence. There is no stock, no generative imagery and no music.

- **s1** (pushers lines): shows both levels rising and the gap widening, with end labels at 4.80M and 2.35M.
- **s2** (ratio line): shows 18% to 49%.
- **s3** (top-10 growth bars): TypeScript 9.5×, JavaScript 3.4×. Reduced economy coverage is marked for Dockerfile, Jupyter, Shell and C++.
- **s4** (yearly gain bars): +3.0, +3.7, +4.3, +3.7, +4.5, then +12.0.
- **s5** (histogram for 2020 vs 2026): the 50% line, and 31 + 14 + 2 = 47 at or above it.
- **s6** (reported-economy lines): shows the fixed panel at 92.

**Weak point, not failing.** `assemble.py` loops one still image per scene, so the video is six static slides held 8.7-29.2 s. This is the "image slideshow" form of :138, but that example is qualified by "with minimal or no narrative, commentary, or educational value", and this video has a question, a two-sided answer, a breadth check and stated limits. It also departs from `VERDICT.md:326` ("sentence-synced to narration"): the render is scene-synced. Later videos should add per-sentence builds.

**4. Does comparable content already say exactly this? No** (search above).

**Reused content (:144, :200, :204): not triggered.** GitHub's CC0 numbers are the input; the aggregates, charts and script are new work.

**Verdict.** I would defend this to a YouTube reviewer as content "made for the … education of viewers" (:84) that adds "the creator's original, authentic insights" (:140). **PASS**, bound to this script hash. The G5 changes below alter the script, so G3 must be re-run on the new hash; nothing in them touches originality.

---

## G5: promise match, FAIL

### Where the answer lands (SRT)

| Cue | Time | Text | Half |
|---|---|---|---|
| 1 | 00:00:00,000-00:00:02,944 | "Is TypeScript catching up with JavaScript on GitHub?" | question |
| 2-5 | 00:00:03,194-00:00:19,700 | method: GitHub counts pushers; 92 economies; 2020 Q1 to 2026 Q1 | preamble (16.5 s) |
| 6 | **00:00:20,200**-00:00:22,867 | "Relative to JavaScript, yes, and quickly." | **relative answer lands** |
| 7 | 00:00:23,117-00:00:29,133 | "…TypeScript had 18% as many pushers as JavaScript." | relative, start |
| 8 | 00:00:29,383-00:00:33,073 | "By the first quarter of 2026, it had 49%." | relative, end; **straddles 0:30** |
| 9-10 | **00:00:33,323-00:00:42,006** | "In raw numbers, though, JavaScript's lead grew, from 1.1 million to 2.5 million pushers, because both languages grew." | **absolute answer, outside the window** |

**Reason 1: only the relative half lands inside 30 seconds.**

- "Catching up" in ordinary English means closing the gap. On this count, the gap grew from 1,147,998 to 2,454,635, and it grew in every year: 1.15, 1.35, 1.51, 1.68, 1.83, 2.00, 2.45 million.
- So the honest answer is "yes as a share, no in raw numbers". By 0:30 the viewer has heard only "yes, and quickly".
- The window is spent on a 16.5-second method sentence before any answer at all.
- The half that says "no" is exactly the one pushed past the window. That is the failure G5 exists to catch (`VERDICT.md:352`).

**Reason 2: the absolute half is not scoped to its count.**

- The datasheet defines the metric as developers "who made at least one git push to a repository with a given programming language" (`github-innovationgraph-datasheet.txt:37`).
- The file shows that "with" means every language GitHub detects in the repository, not its main language. For 2026 Q1, summed over the same 92 economies:

  | Language | Pushers |
  |---|---|
  | HTML | 5,689,786 |
  | JavaScript | 4,804,768 |
  | CSS | 4,548,919 |
  | Shell | 1,889,981 |
  | Dockerfile | 1,417,124 |
  | Batchfile | 525,819 |

- No main-language count gives HTML more pushers than JavaScript, or 1.4 million people pushing to Dockerfile repositories. So a TypeScript project that also holds some JavaScript files adds its developers to JavaScript's count, and "JavaScript's lead" partly contains TypeScript projects.
- The narration discloses the developer-level overlap ("a developer who pushes in both languages counts under each", 00:01:31,135). It does not state the repository-level rule, which is what makes JavaScript's number structurally include TypeScript work, and it discloses nothing before 1:31.
- Meanwhile GitHub's own widely covered Octoverse 2025 says TypeScript is already #1 on GitHub, ahead of JavaScript.
- A developer who clicks a title that says "on GitHub" hears "JavaScript's lead grew" with no explanation, and concludes the video is wrong. It is right on its count; it just never says which count that is. That is "said with more certainty than the data allows".

### Charts and description against what is said

| Chart | Title | Verdict |
|---|---|---|
| s1 | "Developers who pushed to TypeScript and JavaScript repositories" | **Overstates.** It reads as TypeScript or JavaScript main-language repositories. Fix: RC4. |
| s2 | "TypeScript pushers as a share of JavaScript pushers" | Matches. Note that the absolute sentence (0:33-0:42) is spoken over this chart, which cannot show a gap (37 s frame checked). |
| s3 | "How many times over each language's pushers grew" | Matches. "The fastest growing" is explicitly scoped to the top 10 by pushers, and reduced-coverage bars are annotated. |
| s4 | "Year-on-year change in the TypeScript-to-JavaScript ratio" | Matches. The narration's "at most 5" rounds 4.54 up, which understates the contrast rather than inflating it. |
| s5 | "The TypeScript-to-JavaScript ratio, economy by economy" | Matches. 47 = 31 + 14 + 2; the maximum is 60.5 → 61%. |
| s6 | "Economies GitHub reports, by language" | Matches (93 → 162; the panel of 92 drawn). |

- **Description.** It accurately says what the data is and overclaims nothing, but it does not state the counting rule either.
- **Title.** A genuine question that the video answers, with no superlative and no bait. No custom thumbnail exists, so none can overpromise.

### Would a viewer who clicked feel it delivered?

- **A general viewer who stays to 0:42:** yes, since both halves, breadth and limits are there.
- **A developer who has seen "TypeScript is #1 on GitHub"** (the likely audience for this title in late 2026): not as it stands. They will hear a contradiction the video never explains.

Nothing is clickbait, and every figure I spot-checked holds on its count. The failure is ordering and scope, and both are cheap to fix.

### Required changes (exact)

1. **RC1.** In `analyses/t1.json`, scene `s1-question`, narration: directly after "Is TypeScript catching up with JavaScript on GitHub?" insert **"As a share of JavaScript, yes, and quickly; in raw numbers, no: JavaScript's lead grew."**
2. **RC2.** In `analyses/t1.json`, scene `s2-answer`, narration: delete the opening sentence **"Relative to JavaScript, yes, and quickly."** RC1 replaces it. The rest of s2 stays, so the 18%, 49%, 1.1 million and 2.5 million figures still follow.
3. **RC3.** In `analyses/t1.json`, scene `s1-question`, narration: replace "Every quarter, GitHub counts the developers in each economy who push code to repositories in each language." with **"Every quarter, GitHub counts the developers in each economy who push to repositories containing each language; a repository that holds both languages counts for both."**
4. **RC4.** In `analyses/t1.json`, scene `s1-question`:
   - chartTitle: **"Developers who pushed to repositories containing TypeScript or JavaScript"**
   - alt: "developers pushing to TypeScript and to JavaScript repositories" → **"developers pushing to repositories containing TypeScript and to repositories containing JavaScript"**
5. **RC5.** Re-render, then check the result:
   - In the new SRT, RC1's sentence must end before 00:00:30,000. The estimate is about 0:09, at the measured 0.38 s per word.
   - Total duration must stay at or under 120 s. The estimate is about 114 s: RC1 adds about 6 s, RC3 about 3 s, and RC2 removes about 3 s.
   - The new script hash needs fresh G3, G4 and G5 verdicts. G4 should confirm RC3's sentence against datasheet l.37 and the HTML/Dockerfile rows.

### Recommended (not required)

- **Move the gap sentence.** Put "In raw numbers, though, JavaScript's lead grew, from 1.1 million to 2.5 million pushers, because both languages grew." at the end of s1, so the gap is spoken over the chart that shows it.
- **Make "the picture is the same" concrete.** Replace "Economy by economy, the picture is the same." with "Economy by economy, the ratio rose in all 92." This is measured at 92 of 92 and needs a named figure for G4.
- **State the counting rule in the description.** Optionally, also acknowledge Octoverse, but only if G4 verifies the wording against the GitHub blog.
- **Watch the length.** If the video runs over 120 s, drop the s6 clause "a developer who pushes in both languages counts under each", which RC3 makes redundant.
- **Outside G5.** `page/index.html` still shows the literal `{{BRAND}}` in its `<title>` and header.

## The sentence I am least sure of

RC3's **"a repository that holds both languages counts for both."** GitHub does not say it in those words. It is my reading of datasheet l.37 ("a repository with a given programming language"), backed by the file's own evidence (HTML above JavaScript, 1.4M Dockerfile pushers). G4 should confirm it before it is spoken.

---

# Revision 1 (2026-09-27T10:54Z): re-audit of the revised render

The original audit above covers script `ded6992c…dd31`, which no longer applies. This section covers the new render.

- **Audited script sha256:** `bf98a1b066eab0b8ca26a474759e9a3fa0e5cfccbb47a7cfd6a5fed1e17a86a6`. I computed it myself from `out/t1/manifest.json` `script`, and it matches the main thread's value.
- **Revision:** the builder applied G5 RC1-RC4 and the G4 auditor's R1-R3 (`audits/t1-factcheck.json`), then re-rendered.

| Gate | Verdict | One line |
|---|---|---|
| G3 originality | **PASS** | The Octoverse sentence cites GitHub's headline in order to set this video's own count against it, which is the reverse of reused content. The template caution for videos 2-6 still stands. |
| G5 promise match | **PASS** | Both halves of the answer land at 0:03.2-0:08.7, the counting rule by 0:19.9, and the Octoverse contradiction is named and scoped. Duration is 116.7 s. |

**Required changes: none, for either gate.**

## What was re-read

- The new SRT (all 30 cues), `manifest.json` (title, description and script), `render-report.json` and `figures.json` (all nine claims `holds: true`; the new `chartFigures` block).
- `analyses/t1.json`, including the new `promise`, `externalSources` and `citations` blocks.
- The s1 and s2 PNGs. s3-s6 have the same byte sizes as the set audited above.
- MP4 frames at 5 s and 50 s, and ffprobe for the duration.
- The newly rendered sources the revision relies on:
  - `research/rendered/github-octoverse-2025.txt` lines 292, 300, 672, 682, 732, 976 and 1064;
  - `research/rendered/github-about-repository-languages.txt:257`.
- No new web search. The original search result (section above) still stands.

## G5, checked against the new SRT

| Cue | Time | Text | Role |
|---|---|---|---|
| 1 | 00:00:00,000-00:00:02,944 | "Is TypeScript catching up with JavaScript on GitHub?" | question |
| 2-3 | **00:00:03,194-00:00:08,719** | "As a share of JavaScript, yes, and quickly; in raw numbers, no: JavaScript's lead grew." | **both halves land (RC1)** |
| 4-6 | 00:00:08,969-00:00:19,871 | "…push to repositories containing each language; a repository that holds both languages counts for both." | counting rule (RC3) |
| 7 | 00:00:20,121-00:00:24,217 | "We follow the 92 economies reported for both in every quarter." | panel |
| 8-9 | 00:00:24,733-00:00:34,690 | 18% … 49% | numeric support, share |
| 10-11 | 00:00:34,940-00:00:43,623 | "…JavaScript's lead grew, from 1.1 million to 2.5 million pushers…" | numeric support, raw numbers |
| 12-14 | 00:00:43,873-00:00:56,795 | Octoverse 2025 sentence + "That is a different count…" | context (G4 R1) |
| 30 | …-00:01:56,227 | "Source: GitHub's Innovation Graph, public domain." | end |

**Original reason 1 (timing): resolved.**
- Both halves now land by 8.7 s. A viewer who leaves at 0:30 has heard yes-as-a-share, no-in-raw-numbers, how GitHub counts, and the 18% starting point.
- RC2 is done: the duplicate "Relative to JavaScript…" is gone.

**Original reason 2 (scope): resolved.**
- The counting rule is spoken at 0:09-0:20. It is sourced to datasheet l.37 ("who made at least one git push to a repository with a given programming language") and to GitHub Docs l.257 ("The files and directories within a repository determine the languages that make up the repository.").
- That settles the sentence I was least sure of in the original audit. GitHub's own docs say a repository's languages are those of its files, and the Innovation Graph counts pushes to "a repository with" the language. So a repository holding both languages is a repository with each.
- The Octoverse contrast is accurate against the page:
  - "named TypeScript the most used language on GitHub in August 2025, by contributor counts" matches `github-octoverse-2025.txt:672`: "By GitHub contributor counts, August 2025 marks the first time TypeScript emerged as the most used language on GitHub". At :292 the page adds that TypeScript "overtook both Python and JavaScript in August 2025".
  - "That is a different count from the quarterly pushers in this video" is backed by :976: "'most used' languages are ranked by the number of distinct monthly contributors who committed code in that language".
  - The page itself adds, at :672: "(other industry indices use different methodologies and may still rank JavaScript and Python higher)". That is exactly the framing the video uses.

**Duration:** 116.733 s by ffprobe and in `render-report.json`, at or under the 120 s cap.

**Charts:**
- s1 is retitled "Developers who pushed to repositories containing TypeScript or JavaScript" (RC4), and the 5 s frame confirms it in the MP4. The alt text was updated.
- The s2 subtitle is reworded, with no change of meaning.
- s3-s6 are unchanged and match their narration as before.

**Description:** the new "Counting:" paragraph states the same rule with its two sources. The "Context:" paragraph repeats the Octoverse sentence with the URL. Neither goes beyond its source.

**Clickbait or overstatement:** none. The title is a genuine question answered by 0:08.7, and every qualitative word still has a claim that holds in `figures.json`.

**Non-blocking weaknesses:**
- The gap sentence and the Octoverse sentence are both spoken over the ratio chart, so s2 is a 32.6 s static hold while the chart showing the gap was on screen at 0:00-0:24.
- The Octoverse sentence says the counts differ but not why they point in opposite directions.
- Only 3.3 s remain before the 120 s cap, so any further sentence needs a matching cut.

**Verdict:** PASS. I would defend it to a YouTube reviewer.

## G3, re-judged

**Does originality still hold with the Octoverse sentence? Yes, and it is stronger.**
- The sentence is one attributed statement plus one line of scoping, about 12.9 s of 116.7 s. It is used to set this video's count against GitHub's headline, not to relay it.
- That is neither "Content that exclusively features readings of other materials you did not originally create" (youtube-monetization-policies.txt:204) nor repurposing "without adding significant original commentary" (:144).
- Placing the video's finding against the best-known headline, and saying why they can differ, is the "creator's original, authentic insights or perspective" that :140 asks for.

**The description with the counting rule.**
- Reviewers look at "Video descriptions" (:154), and "Reused content from other online sources where the creator … explains how the creator added to the content" is the allowed case (:180).
- The Method, Counting and Context paragraphs do that explicitly. They help rather than hurt.

**The rest is unchanged from the original audit.** The analysis is unpublished elsewhere, the charts are code-drawn from the pinned CSV, and the narration is question-specific, with every qualitative word guarded by a claim.

**Slideshow note.** The longest static hold is now s2 at 32.6 s, previously s6 at 29.2 s. The video is still outside :138 because it carries narrative and educational value. It still departs from `VERDICT.md:326` ("sentence-synced").

**Template-storyline caution for later videos: still stands, recorded, not a T1 blocker.**
- `analyses/t1.json` is still parameterised by `languageA`, `languageB`, `topN` and `thresholdPct`.
- Its six-scene skeleton would carry over unchanged to any language pair: answer, then share and gap, growth bars, yearly gain, per-economy histogram and coverage limits.
- The revision's T1-specific additions (the `promise` block and the Octoverse `externalSources`) make T1 itself less templated. They do nothing for a second "Is X catching up with Y?" video, which would be the "highly similar storyline template across multiple videos" of :136 and would feel "interchangeable from video to video" (:130).
- Videos 2-6 need distinct question shapes, and the limits paragraph should vary between videos from the same dataset.

**Verdict:** PASS.

## Remaining required changes

None.

**Optional, and only with a matching cut to stay at or under 120 s:** after "That is a different count from the quarterly pushers in this video." add "Here, a TypeScript project that also holds JavaScript files counts for JavaScript too." This would change the script hash and need fresh G3, G4 and G5 verdicts.

## The sentence I am least sure of (revision 1)

"The Octoverse sentence says the counts differ but not why they point in opposite directions" is the gap I am least sure matters to viewers. A developer who already knows the Octoverse headline may still find "a different count" thin. I judged that the counting rule at 0:09-0:20 closes it, but that is a judgement about the audience, not a checked fact.
