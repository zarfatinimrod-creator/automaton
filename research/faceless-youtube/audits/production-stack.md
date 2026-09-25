# AUDIT: production-stack scout

**Date:** 2026-09-25. **Auditor tier:** Opus, separation of duties. This file checks the scout's work and builds nothing.
**Scout audited:** `research/faceless-youtube/scouts/production-stack.md` (427 lines, read in full).
**Search budget:** 4 allowed, **4 used** (log in §8). All other checks used files in the repo, the fork at
`/home/user/MoneyPrinterTurbo`, `raw.githubusercontent.com` fetches (these cost nothing from the shared budget), and
re-runs of the scout's own benchmarks.

**Grades used here.**
- **RENDERED**: primary page text I read myself, including `research/rendered/`.
- **CODE**: a repository or licence file I read myself. A third-party GitHub copy of someone else's page is marked
  **CODE, secondary**.
- **MEASURED**: I ran it in this container (4 cores, 15 GB RAM) today.
- **SNIPPET**: search-engine summary text. It is weak.
- **INFERENCE**: my own reasoning.
- **UNKNOWN**: not established.

---

## 0. Verdict

> **The scout's facts hold. Its measurements replicate. Its answer, "production is not the binding constraint", survives.
> Four of its framings are stronger than the evidence, and it missed the angle most likely to hurt the line.**
>
> 1. **The numbers replicate.** I re-ran the scout's scripts from its scratchpad. Kokoro gave a real-time factor of 0.221
>    against the scout's 0.236. The chart frames took 107 ms each, the same as the scout's figure. The encode took 29.6 s
>    against 31.7 s. I also ran a heavier frame, where every frame is unique and there are two panels, annotations and a
>    subtitle box. That took **210 ms per frame**, and running 4 processes at once cut it to **59 ms per frame** (3.6×).
>    Encoding that full-motion footage runs at **0.46× real time**. The corrected range for a 9-minute video is **about
>    10–25 wall-minutes with 4 render processes**, rising to **about 60 minutes single-process for heavy graphics**. The
>    cash cost is ₪0 only if the machine is free, and nobody has named which machine it is (§4.3).
> 2. **"Code-rendered charts answer the inauthentic-content rule" is an inference, not RENDERED text.** Every quote checks
>    out verbatim. The same page also says reviewers judge the **channel as a whole**. It names content that *"looks like
>    it's made with a template"* [RENDERED youtube-monetization-policies.txt:114]. It adds *"if we cannot clearly tell that
>    you made the content"* [:156]. A daily channel with one synthetic voice and one matplotlib house style is exposed to
>    that reading however original each chart is. The route is the best available shape. It is not proven to pass.
> 3. **The missed angle: the licence-clean data runs thin in exactly the high-RPM niches the reel selects for.** Finance
>    series are often third-party copyrighted. FRED says commercial use of such a series needs the owner's permission,
>    which FRED cannot grant *(SNIPPET)*. A finance, health or legal channel with a synthetic narrator also has to steer
>    clear of the "AI persona giving advice" rule [RENDERED :244-252]. **The scout's own 274-word benchmark script already
>    drifts into personal-finance guidance:** *"Take your monthly housing cost … divide it by your gross monthly income.
>    Economists usually treat thirty percent as the line…"* (scratchpad `bench/text.txt`). The route that is safe on
>    licence and policy may therefore push the channel away from the reel's RPM premise. Whether it does is a question for
>    the RPM sibling, not for this audit.
> 4. **Smaller cuts:**
>    - **Sora.** The SDK text proves a *scheduled* shutdown. That the shutdown actually happened on 24 September is
>      SNIPPET only. Azure OpenAI hosted Sora 2 on its own schedule, and the snippets disagree on its end date.
>    - **Pexels.** "Breaches the API guideline" is an interpretation of a third-party mirror, and the scout graded it high.
>    - **Kokoro.** Its Apache licence holds, but the model card says it was trained partly on *"synthetic audio generated
>      by closed TTS models from large providers"*.
>    - **Token cost.** The scout's model runs a Fable verifier on every video. That is the per-item Fable fan-out
>      `CLAUDE.md` names as the way the quota died.
>
> None of these flips the production answer. Item 3 bears on the line's economics, and the board should hear it before
> any render is built.

---

## 1. Claim verdicts

| # | Scout claim (short) | Load-bearing | Verdict | Why |
|---|---|---|---|---|
| 1 | Sora API shut down as of 2026-09-24; reel prompt 4 cannot be executed by anyone | **yes** | **WEAKENED** | I re-fetched `openai-python` main myself. `src/openai/resources/videos.py` has **24** decorators reading *"The Sora API is scheduled to permanently shut down on September 24, 2026."* (line 70 matches). `CHANGELOG.md:425,432`: v3.1.0 (2026-08-14), "deprecate Sora video APIs". The changelog head is v3.19.2 (2026-09-23) [CODE]. That proves a **schedule** written before the date. It does not prove the event. The event rests on my search 1 and the scout's search 5 [SNIPPET]. "By anyone" is too strong. Azure OpenAI carried Sora 2 on a separate retirement schedule, with snippets giving **14 Sep** or **15 Oct 2026** [SNIPPET, learn.microsoft.com Q&A]. The decision does not move. Any live Sora route is billed per second, needs an account and dies within weeks. Other generators (Veo, Kling, the fork's Seedance and MiniMax) can still do prompt 4's *job*, so the case against generative video rests on the float and on policy, not on Sora's death. The scout's §5 says so. |
| 2 | Sora consumer app shut 2026-04-26, announced 2026-03-24 | no | **UPHELD** (SNIPPET) | My search 1 returned the same dates from different outlets. |
| 3 | Kokoro-82M is commercially licensed: Apache-2.0, kokoro-onnx MIT, ONNX files derived from hexgrad | **yes** | **UPHELD**, with a provenance caveat | I re-fetched the files myself: `hexgrad/kokoro/main/LICENSE` is Apache-2.0, and `README.md:5` says *"With Apache-licensed weights … production environments"*; `thewh1teagle/kokoro-onnx/main/LICENSE` is MIT [CODE]. **Gap the scout did not close:** the v1.0 ONNX files are *"optimized f32 version from taylorchu/kokoro-onnx"*. I fetched `taylorchu/kokoro-onnx/main/LICENSE`, which is **MIT**, and its README says it is an *"ONNX optimized version of hexgrad/Kokoro-82M"* [CODE]. The chain is intact. **Caveat:** a GitHub mirror of the model card (`zboyles/Kokoro-82M` README, v0.19 era) has `license: apache-2.0` (line 2). Its lines 127–132 say training used *"Synthetic audio generated by closed TTS models from large providers"* [CODE, secondary]. My search 2 returned the same text from the live Hugging Face card [SNIPPET]. Any terms breach in that training binds the trainer, not a downstream Apache licensee. Still, "clean end to end" is one notch too strong. |
| 4 | GPL phonemizer/espeak-ng do not cover the audio output (GPLv3 §2) | no | **UPHELD** | `phonemizer-3.4.0.dist-info/licenses/LICENSE:159-161`, verbatim [CODE]. |
| 5 | Edge TTS has no licence to rely on and should stay banned | no | **UPHELD** | `edge_tts/constants.py:3-24`: hard-coded `TRUSTED_CLIENT_TOKEN`, Edge UA, Read Aloud extension `Origin`. `drm.py:1-3`: the Sec-MS-GEC token [CODE]. `voice.py:658` falls through to `azure_tts_v1` (edge-tts) [CODE]. |
| 6 | Piper "intended for personal use and text to speech research only" | no | **UPHELD** | The scout's copy of `docs/VOICES.md:62`, verbatim [CODE, scout's download]. |
| 7 | Measured: RTF 0.236, 153 wpm, 107 ms/frame, 31.7 s encode; a 9-min video is 10–40 CPU-min and ₪0 | **yes** | **UPHELD** (replicated), range widened | See §2. The label "CODE" is wrong: these are MEASURED, and they reproduce. Heavier frames push the single-process upper bound to about 60 min. Four processes bring it back to about 22 min wall time. "₪0 in cash" silently assumes a free host (§4.3). |
| 8 | Only real marginal cost is LLM tokens, ₪5–20/video (₪150–600/month) | **yes** | **UPHELD** as a low-confidence INFERENCE, with one fix | Re-derived: 200k×$5 + 20k×$25 + 100k×$10 + 5k×$50 per 1M = **$2.75 ≈ ₪10.2**. ×0.5–2 gives **₪5.1–20.4**; ×30 gives **₪153–611**. The token volume fits this repo's own logs: one Opus auditor used 195k tokens (`logs/2026-09-06-three-more-repos-into-claude.md:85`). **Fix:** the model puts a **Fable verifier on every video**. That is 30 Fable calls a month and 45% of the estimated cost, and `CLAUDE.md` says *"Putting Fable in the fan-out is how the quota died before"*. The compliant version is an Opus verifier per video (≈₪7.9/video) with Fable on a sample. Whether tokens are cash or subscription quota is UNKNOWN, as the scout says. |
| 9 | Fork collects Pexels/Pixabay/Coverr credits, writes them only to `script.json`, uploads an LLM caption, draws no on-screen credit, so it "breaches the Pexels API guideline on every stock video" | **yes** | **WEAKENED** (the code facts hold; "breach" is an interpretation) | Code verified: `material.py:364-370` (Pexels), `488-494` (Pixabay), `601-605` (Coverr). `material_sources` is consumed nowhere outside `material.py` and tests (grep over the fork, excluding `.venv`). `task.py:1101` sets `youtube_description` to the LLM caption. No credit exists in `video.py` [CODE]. **But** the guideline ties the link to *"Whenever you are doing an API request"*, and its examples are HTML snippets, so it is aimed at the app that calls the API. The photographer credit is *"when possible"* (scout's mirror, lines 24–26) [CODE, secondary]. The Pexels *licence* requires no attribution (`research/tiktok/06-faceless-video-tooling.md:379-380`, medium-high, snippets). So "breach on every video" is INFERENCE on a third-party mirror at medium confidence, not CODE at high. A clearer gap the scout missed: the fork's WebUI, which is the actual API client, shows no "Photos provided by Pexels" link either. It shows only a "Get API Key" link (`webui/i18n/en.json:204`). The practical advice (description credits plus an end card) stands. The claim matters only for the fork as shipped, and the recommended route uses no stock. |
| 10 | Pexels guideline text: prominent link, credit "when possible", no "systematic bulk copying" wording | no | **UPHELD** (as MIRROR) | Mirror lines 24–34 verbatim. The mirror also mentions separate *"API terms"* (line 32), which nobody has read. That is where the "systematic" wording in `docs/REJECTED.md` probably came from (`06-faceless-video-tooling.md:392`). It remains UNKNOWN. |
| 11 | Default BGM is "default music from YouTube videos"; with STHeiti, Edge TTS and uncredited Pexels, every default is unsafe | **yes** | **UPHELD**, one omission | `README-en.md:479-480` (the scout cited 477–480). `schema.py:100` (`pexels`), `:113` (`random`), `:126` (`STHeitiMedium.ttc`). 29 songs. No licence file anywhere under `resource/` [CODE]. Omission: `resource/fonts` also ships `BeVietnamPro-*.ttf` and `Charm-*.ttf`. Those are probably OFL-licensed families, but no licence file ships with them, so UNKNOWN from here. The default is still STHeiti. Whether the 29 songs are in Content ID is UNKNOWN. The scout said "exposure", not "claim", which is correct. |
| 12 | Code-rendered charts answer the inauthentic-content rule; screenshotting OWID risks reused content even with permission | **yes** | **WEAKENED** (grade inflation: INFERENCE, not RENDERED) | All six quotes are verbatim at the cited lines [RENDERED :120, :130, :138, :140, :186, :226]. The conclusion drawn from them is not rendered, and the scout's own report body labels it "RENDERED + INFERENCE". Counter-text the scout did not weigh: *"content that looks like it's made with a template, or that may feel repetitive … after watching several videos in a row"* [:114]. The reused-content policy *"applies to your channel as a whole … if we cannot clearly tell that you made the content"* [:156]. Reviewers check *"how you created, participated in, or produced your content"* [:146]. *"Content that exclusively features readings of other materials you did not originally create"* is not allowed [:204], which is a trap for scripts that paraphrase OWID's articles. On the other side, an allowed example is reuse where the creator *"explains how the creator added to the content"* [:180], and that fits a sourced-analysis format. |
| 13 | OWID data CC BY 4.0, third-party data keeps its licence; reachability probes | no | **UPHELD** | The scout's copy of `owid/co2-data` README lines 127–131 is verbatim [CODE]. The probes were not re-run. |
| 14 | World Bank CC BY 4.0 default; NASA not copyrighted in the US, with endorsement and person limits | no | **UNVERIFIABLE** here (SNIPPET) | No new evidence either way. |
| 15 | YouTube disclosure rules for non-realistic content, AI music, C2PA; disclosure does not affect monetization | no | **UPHELD** | Lines 87, 107, 131, 173, 181 and 189 verbatim [RENDERED youtube-altered-synthetic-disclosure.txt]. A generic synthetic narrator appears in neither list. Line 115 exempts only *"Cloning one's own voice"*. The scout's "disclose anyway" is the honest reading. |
| 16 | kokoro-onnx misreads numbers; normalisation required | no | **UPHELD**; already fixed in the fork | Since the scout wrote, `voice.py` (modified 15:37) has gained `normalize_kokoro_english` (line 1864). I ran it: `$5,400`→`5,400 dollars`, `3.5%`→`3 point 5 percent`, `1990`→`19 90` [MEASURED]. |
| 17 | Fork's `kokoro_tts` splits on commas and colons, drops punctuation, 38 fragments vs 19 sentences | no | **UPHELD** at the time of writing; now fixed, and the scout's line numbers are stale | `_split_kokoro_sentences` (line 1899) now speaks whole sentences with their punctuation. My run shows `'Is it true?'` keeps its `?` [MEASURED]. |
| 18 | Kokoro has no Hebrew voice; Chatterbox Multilingual lists Hebrew, weights licence unknown | no | **UPHELD** | `voice.py:237` comment: *"Hebrew has no Kokoro voice."* [CODE]. |
| 19 | MoneyPrinterTurbo is the wrong tool for chart-led long form | no | **UPHELD**, one omission | The scout left out `match_materials_to_script` (`schema.py:97`; `task.py:321-325, 714-725, 839-840`). It orders the search terms and the clips by the script's narrative. It still gives no per-sentence timing, and it only affects stock search terms, not local charts. The conclusion stands. |
| 20 | Kokoro audio quality as a listener would judge it is UNKNOWN | no | **UPHELD** as UNKNOWN | Nothing I could read settles it. The only honest test remains retention on a published video. |

---

## 2. Re-derived and replicated numbers *(MEASURED, this container, today)*

All runs are in `scratchpad/audit-ps/`. The scout's own scripts (`bench/bench.py`, `bench/render.py`, `bench/text.txt`) were
copied there unchanged.

| Measurement | Scout | Auditor re-run | Match |
|---|---|---|---|
| Kokoro f32, `am_michael`, 19 sentences, 274 words | synth 25.4 s, audio 107.7 s, RTF 0.236, 153 wpm | synth **23.8 s**, audio 107.7 s, RTF **0.221**, 153 wpm | yes |
| matplotlib 1080p, 4-line chart, 360 frames | 38.6 s, 107 ms/frame | 38.7 s, **107 ms/frame** | yes |
| ffmpeg x264 medium crf 20, 108 s low-motion 1080p30 + AAC | 31.7 s, 2.7 MB | **29.6 s**, 2.7 MB | yes |
| **New:** heavier frame (every frame unique; 6 sliding lines + 12-bar panel + value labels + subtitle box), 1 process | not tested | **210 ms/frame** | n/a |
| **New:** same frame, 4 processes concurrently (240 frames) | "≈8 min over 4 processes, untested" | 14.1 s wall = **59 ms/frame effective (3.6×)** | the scout's inference holds |
| **New:** encode of that full-motion footage (107.7 s) | "slower, by an amount I did not measure" | **49.8 s = 0.46× real time**, 23.6 MB | n/a |

The low-motion caveat is real. In the scout's chart the data changes about every 8 frames (`years` has 35 points spread
over 288 frames), and the frame files confirm it: runs of identical sizes, such as `f00000`–`f00023` all 53,343 bytes.

**9-minute video (540 s, 16,200 frames at 30 fps):**

| Case | Narration | Frames | Encode | Wall total |
|---|---|---|---|---|
| Light: 20% animated, simple chart, 1 process (scout's case) | 2.0–2.1 min | 5.8 min | 2.6 min | **≈10.5 min** |
| Heavy: 100% animated, 1 process | 2.1 min | 16,200 × 0.210 s = **56.7 min** | 540 × 0.46 = **4.2 min** | **≈63 min** |
| Heavy: 100% animated, 4 processes | 2.1 min | 16,200 × 0.059 s = **15.9 min** | 4.2 min | **≈22 min** |

**Token cost, re-derived** (repo prices from `CLAUDE.md`: Opus 5 at $5/$25 per 1M tokens, Fable 5.1 at $10/$50; 3.7 ₪/$):
- Scout's mix: $1.00 + $0.50 + $1.00 + $0.25 = **$2.75 = ₪10.18 per video**. The ×0.5–2 range is ₪5.1–20.4. At 30
  videos a month that is **₪153–611**.
- Opus-only verifier, which is the version the routing rule allows: $1.00 + $0.50 + $0.50 + $0.125 = **$2.125 = ₪7.86 per
  video**.
- For scale, **INFERENCE** at the reel's own claimed floor (RPM $7, not verified here): ₪10.18 = $2.75, which is covered
  by about **390 monetized views per video**.

---

## 3. Load-bearing checks in detail

### 3.1 Sora (claim 1)
- **Re-fetched myself** (`raw.githubusercontent.com/openai/openai-python/main/…`, 200 OK): 24 occurrences of the
  deprecation string in `videos.py` and changelog lines 425/432 exactly as cited [CODE].
- The SDK can only state what OpenAI announced on 2026-08-14. That the API is dark on 2026-09-25 is **SNIPPET**. My search
  1 returned "the Sora API was discontinued on September 24, 2026". It also surfaced a developer-forum thread titled *"Is the
  Sora2 API still working?"*, which I could not read.
- **Azure.** The snippets say Sora 2 *"lives on in Microsoft's Azure OpenAI service"*. Its retirement is given as 15
  October 2026 in one place and 14 September 2026 in another, with a Microsoft Q&A thread asking for an extension to 24
  September [SNIPPET]. Either way it is dead or dying within three weeks, and it would need an Azure account and per-second
  billing. It is not a route for this line.

### 3.2 Kokoro licence chain (claim 3)

Every link below is CODE and was fetched by me today.

| Link | Licence |
|---|---|
| hexgrad/Kokoro-82M weights | Apache-2.0: the author's statement at `hexgrad/kokoro` README:5; `license: apache-2.0` in the mirrored model card |
| taylorchu/kokoro-onnx (the ONNX conversion) | MIT |
| thewh1teagle/kokoro-onnx (the runtime) | MIT |
| phonemizer / espeak-ng | GPL, but the output is exempt |

**Provenance note for the board.** The model card's "permissive/non-copyrighted" training data includes synthetic output
of closed commercial TTS models. Its footnote cites the US Copyright Office's AI guidance to argue that such audio is not
copyrightable. This is the trainer's legal position, not a verified fact. For a downstream user holding an Apache grant,
the practical risk is low but not zero. Record it; do not treat it as blocking.

### 3.3 Pexels attribution (claim 9)
The code facts are exact. The step from "no credit published" to "breach on every video" rests on how you read a
guideline written for apps that display API results, quoted from a third-party mirror dated 2023. A monetized video is
arguably a use the guideline did not anticipate. The honest statement is:
- the fork as shipped **publishes no attribution at all**, and
- **whether that breaches Pexels' API terms is UNKNOWN** until someone reads the API terms the guideline itself refers to.

The fix the scout proposes, description credits plus an end card, costs nothing and makes the question moot.

### 3.4 BGM and defaults (claim 11)
Verified. "Every default unsafe" holds for music (unknown provenance, admitted by the README), narration (Edge TTS), the
default font (STHeiti, Apple-proprietary, no licence file) and footage (uncredited). The small correction is the two
probably-OFL font families the scout did not list. They do not change the conclusion, because the default font is STHeiti.

### 3.5 The policy claim (claim 12)
The quotes are exact. **Grade inflation:** the structured claim is graded RENDERED, but "answers the rule" is a judgement
that only a YouTube reviewer makes, at **channel** level (`:146`, `:156`). The strongest counter-reading is line 114,
"looks like it's made with a template". A channel of machine-drawn charts in one visual style, one voice, one structure
and one upload a day is the template shape, even when every chart is new. The scout's own §4.2 names this risk ("variety
of question, not of dataset label"). The structured claim then drops it.

---

## 4. Angles the scout missed that could change the decision

### 4.1 Licence-clean data is thin where RPM is high *(SNIPPET + INFERENCE)*
Prompt 1 of the reel filters niches by RPM > $7. The usual candidates are finance, insurance, health and legal. The
scout's clean data sources are OWID, World Bank and US federal data, which cover macro, development, climate and energy
topics. For finance:
- **FRED** passes through series owned by third parties (search 4, SNIPPET). *"Before using data series owned by third
  parties for anything other than your own personal use, you must contact the data owner to obtain permission"*, and FRED
  *"can[not] provide permission on behalf of copyright holders"*.
- **Market prices, index levels and house-price indices** are commonly proprietary (INFERENCE).
- **OWID-hosted third-party data** keeps its upstream licence (claim 13), and the scout left the upstream licences UNKNOWN.

So each video in a high-RPM niche needs a **per-dataset licence check**. Most of the relevant pages are blocked from this
container. The scout's cost table has no line for this step, and it is recurring research effort, not a one-off.

### 4.2 The sensitive-topic rule and the scout's own script *(RENDERED + CODE)*
In the same high-RPM niches, a synthetic narrator must never give advice [RENDERED youtube-monetization-policies.txt:244-252].
The scout's benchmark script, written to demonstrate the honest format, ends with a personal-finance rule of thumb addressed
to the viewer (`bench/text.txt`: "There is a useful way to check this against your own situation…"). An LLM scriptwriter
will drift the same way by default. The pipeline needs an explicit no-advice gate in the fact-check step.

**Taken together, 4.1 and 4.2:** the production route that is licence-safe and policy-safe pulls the channel toward
lower-stakes topics, where the reel's RPM figure may not hold. That is a question for the RPM sibling. It is the
interaction most likely to flip the line's economics, and the scout does not mention it.

### 4.3 Which machine renders, and is it free? *(UNKNOWN)*
"₪0 cash" needs a named host:
- This container is ephemeral and is not a scheduler.
- The repo's scheduled compute is GitHub Actions (`colony.yml` runs hourly on `ubuntu-latest`).
- Actions minutes are free only for public repositories. This repo's visibility is **not established** in any file I read.

At 30 videos a month × 10–63 minutes, the render alone is **300–1,900 runner-minutes a month**, on top of the colony's
existing hourly job. Moving 20–30 MB MP4s from the runner to the uploader is also unaddressed (sibling:
`upload-automation.md`).

### 4.4 Per-video Fable is a routing-rule violation *(CODE)*
See claim 8. The cost model should be Opus per video with Fable on a sample. Otherwise a daily calendar recreates the
quota failure the owner's routing rule exists to prevent.

### 4.5 The constraint-7 test has little statistical power *(INFERENCE)*
"One video, 30 days, measure impressions" on a zero-history channel is exactly the day-one handicap `MISSION.md`
constraint 7 describes: platform search ranks on prior success. A null result would not tell "nobody wants this" apart
from "a new channel gets no impressions". Pre-register the threshold and the number of videos before the test, or the
test cannot fail informatively. This belongs to the discovery sibling. It is flagged here because the scout proposed the
test.

### 4.6 Minor points
- **Thumbnails** are absent from the stack. They are "production assistance" and need no disclosure
  [RENDERED youtube-altered-synthetic-disclosure.txt:107]. Custom thumbnails are gated by channel verification, which
  belongs to the upload and monetization siblings.
- **Output audio** is 24 kHz mono (Kokoro's native rate). YouTube accepts it, as seen on the rendered test MP4.

---

## 5. Grade inflation

1. **Claim 12**, charts answer the inauthentic-content rule: graded RENDERED. The quotes are rendered; the conclusion is
   INFERENCE.
2. **Claim 9**, Pexels breach on every video: graded CODE, high confidence. The code facts are CODE. The breach is
   INFERENCE on a third-party MIRROR, at medium confidence at most.
3. **Claim 1**, Sora shut down as of 24 September and cannot be executed by anyone: graded CODE. The SDK proves a
   schedule. The event is SNIPPET. "By anyone" is INFERENCE, and the Azure snippets partly contradict it.
4. **Claim 3**, bundled "CODE": the kokoro-onnx release-page link came through the WebFetch summariser. That is closer to
   SNIPPET than CODE, and the scout's own body calls it "near-verbatim". I closed the gap with taylorchu's LICENSE
   (MIT, CODE).
5. **Claim 7**: labelled CODE but it is MEASURED. This is a mislabel, not an inflation, and the measurements reproduce.

---

## 6. Corrected answer to the scout's question

**Yes, with the same single route the scout names:**
- original charts from openly licensed data, with the licence recorded per dataset and checked per video;
- Kokoro-82M narration (Apache-2.0, with the training-provenance note on file);
- sentence-level synthesis and number normalisation (both now in the fork);
- DejaVu or another font whose licence is on file, and no music;
- description credits for datasets, and "AI use: Yes".

**Cost of that route:**
- **Machine time:** about 10–25 wall-minutes per 9-minute video on 4 cores, up to about 60 single-process for heavy
  graphics.
- **Tokens:** about ₪8–10 per video (INFERENCE). That is cash if API-billed and quota if on a subscription; which one
  applies is UNKNOWN.
- **Host:** the render needs a named machine, which nobody has named.

**What production does not settle:**
- whether the licence-clean topics carry the RPM the reel assumes (§4.1);
- whether a daily single-voice channel passes the channel-level template reading (§3.5).

Production is not the binding constraint. The data licence and the policy are, and they both push toward the same
lower-RPM topics.

---

## 7. URLs that would settle open points (verbatim from search results or repo files)

- https://developers.openai.com/api/docs/deprecations — whether the Sora API removal actually took effect on 2026-09-24.
- https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation
- https://learn.microsoft.com/en-us/answers/questions/5881436/azure-ai-foundry-sora-2-retirement-date-feels-too — the Azure Sora 2 retirement date.
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/README.md — the v1.0 model card's licence and training-data text.
- https://fred.stlouisfed.org/docs/api/terms_of_use.html and https://fred.stlouisfed.org/legal — third-party series and commercial use.
- https://www.pexels.com/api/documentation/ and https://www.pexels.com/license/ (from `research/tiktok/06-faceless-video-tooling.md:564`). Both returned 403 to the runner (`research/rendered/pexels-*.meta.json`). The "API terms" page the guideline refers to has no known URL. Do not construct one.

---

## 8. Search log (4 of 4)

1. Sora API shutdown and Azure Sora 2 retirement. SNIPPET: OpenAI help and deprecations pages, Microsoft Q&A, news
   aggregators.
2. Kokoro-82M model-card training data. SNIPPET from Hugging Face. Corroborated by a GitHub mirror I fetched
   (`zboyles/Kokoro-82M` README) [CODE, secondary].
3. YouTube inauthentic content and TTS voiceover. SNIPPET only, from vendors selling AI video or TTS tools (Typecast,
   InVideo) and SEO blogs. They have a stake in the answer. One snippet misdates the policy change to "July 15, 2026".
   It added nothing beyond the rendered policy and is not relied on.
4. FRED terms for third-party copyrighted series. SNIPPET from `fred.stlouisfed.org` and `stlouisfed.org`.

**Free checks (no search budget):**
- **GitHub fetches:** `openai-python` (`videos.py`, `CHANGELOG.md`), `hexgrad/kokoro` (LICENSE, README),
  `thewh1teagle/kokoro-onnx` (LICENSE), `taylorchu/kokoro-onnx` (LICENSE, README), `zboyles/Kokoro-82M` (README).
- **Re-runs** of the scout's benchmarks, plus new heavy-frame, parallel and full-motion encode tests.
- **Direct reads of the fork:** `schema.py`, `task.py`, `material.py`, `voice.py`, `README-en.md`, `resource/`,
  `webui/i18n/en.json` and the venv licence files.
