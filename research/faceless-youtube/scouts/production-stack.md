# SCOUT: production stack. Can the colony make the videos itself, licensed for monetized commercial use, at near-zero marginal cost?

**Date:** 2026-09-25. **Tier:** scout (Opus). **Search budget:** 5 allowed, **5 used** (§10).
**Input tested:** reel prompt 4 ("free stock footage … prompt for generating any missing video clips using OpenAI Sora 2")
and the production half of the whole method (`research/faceless-youtube/00-owner-reel-2026-09-25.md:38-39`), measured
against rejection reason 5 and the TTS clause of the reopen trigger in `docs/REJECTED.md:68-140`.

**Grades.**
- **RENDERED**: primary page text I read, including `research/rendered/` captures. `[RENDERED research/rendered/<file>:<line>]`.
- **CODE**: a source file, licence file or package metadata I read (`file:line`). This covers the owner's fork at
  `/home/user/MoneyPrinterTurbo` and licence files downloaded verbatim from `raw.githubusercontent.com` today.
- **MEASURED**: I ran it in this container (4 cores, 15 GB RAM, no GPU) today. The scripts live in the session scratchpad and
  are not committed. §2.3 and §4.4 give every parameter, so anyone can re-run them.
- **MIRROR**: a verbatim third-party copy of a page, hosted on GitHub and read by me. It is weaker than RENDERED because I
  cannot prove it is current. It is stronger than SNIPPET because it is the page's own text, not a summary.
- **SNIPPET**: search-engine summary text only. It is weaker, and I name who published it.
- **INFERENCE**: my reasoning. **UNKNOWN**: not established.

---

## 0. The answer

> **Yes, the colony can make the videos itself, licensed and at near-zero cash cost, but only by one route, and it is not
> the route the reel describes.**
>
> 1. **The reel's route is closed.** Sora 2 no longer exists. OpenAI's own Python SDK marks every video method
>    `deprecated("The Sora API is scheduled to permanently shut down on September 24, 2026.")`. That was yesterday. The
>    consumer app went dark on 26 April 2026 *(CODE for the API, SNIPPET for the app)*. The owner's ChatGPT subscription
>    does not reopen it. The other half of the route, free stock over the Pexels API, needs a credit on every video. The
>    owner's fork collects those credits and then throws them away (§3.2).
> 2. **The route that works is original visuals, with no stock and no generative video.** Charts and diagrams are
>    rendered by code from openly licensed data (OWID and World Bank CC BY 4.0, US federal data). Narration is Kokoro-82M
>    (Apache-2.0 weights, MIT runtime). There is no music. The font's licence is on file. ffmpeg assembles it.
>    **Measured here:** about 10–40 minutes of a 4-core CPU per 9-minute video, and ₪0 in cash. The only real marginal
>    cost is LLM tokens for research, script and fact-check, which I *estimate* at ₪5–20 per video *(INFERENCE)*.
> 3. **This route also answers the monetization policy, not only the licence.** A chart computed from raw data is new
>    per video by construction. YouTube's policy names "image slideshows … with minimal or no narrative, commentary, or
>    educational value" and "AI-generated content made with generic or unoriginal templates" as the failures. Original
>    analysis is the opposite of both *(RENDERED)*. Stock montage plus TTS is the named failure.
> 4. **The TTS clause of the 3.9 reopen trigger is now met for English.** Kokoro's weights are Apache-2.0
>    *(CODE, hexgrad/kokoro)* and the fork already has an engine for it. Free Edge TTS is worse than the "grey area" the
>    repo recorded. The library reaches Microsoft by posing as the Edge browser's Read Aloud extension, so there is no
>    grant of any kind to rely on *(CODE)*. Kokoro has no Hebrew voice, so this does nothing for the Hebrew variant.
> 5. **MoneyPrinterTurbo is the wrong tool for this product.** Its defaults are unsafe for monetized use. It picks random
>    background music from a folder its own README says came "from YouTube videos". It defaults to Pexels, Edge TTS and a
>    proprietary CJK font. It is also built for stock montage: 5-second clips in random order, and no way to put a given
>    chart on screen while the narration talks about it. A purpose-built renderer of a few hundred lines is simpler than
>    bending it *(CODE + INFERENCE)*.
>
> **Production is not the binding constraint on this line.** Audience, policy review and the payout gate are
> (sibling scouts). Nothing in this report says the line earns. It says only that making the video is not what stops it.

---

## 1. MoneyPrinterTurbo, as it sits in the owner's fork

### 1.1 What it does end to end *(CODE)*

The pipeline is: topic → LLM script → LLM search terms → TTS → footage → subtitles → background music → MoviePy/ffmpeg
render → optional cross-post (`README-en.md:154`). Its footage sources are Pexels, Pixabay and Coverr stock, **local
images and videos**, and paid generators: MiniMax H3, Seedance, WaveSpeed, OFox, LoomLoom, and OpenAI-compatible
text-to-image (`README-en.md:165-169`; `config.example.toml:64-78`). The default is `video_source = "pexels"`
(`config.example.toml:78`; `app/models/schema.py:100`). **There is no Sora integration**: `grep -i sora` over the fork's
`.py`/`.toml` files finds nothing.

- **Local materials** (`video_source = "local"`) are read only from `storage/local_videos/`, with path escapes refused
  (`app/services/video.py:1396-1421`). An image becomes a clip with a fixed zoom of about 3% per second
  (`video.py:1362-1391`). Clips default to 5 seconds (`schema.py:95`) and to **random** order (`schema.py:93`; the
  only alternative is `sequential`, `schema.py:18-20`).
- **TTS engines** (`app/services/voice.py:551-658`): Edge TTS (the fall-through default, `voice.py:658` → `azure_tts_v1`,
  `voice.py:938`), Azure Speech v2, SiliconFlow, Gemini, MiMo, MiniMax, ElevenLabs, Chatterbox (an OpenAI-compatible
  local server, `config.example.toml:512-519`), Fish Audio, a no-voice mode, and **Kokoro**. Kokoro exists only in this
  fork: commit `658e29e feat(voice): add local Kokoro TTS engine with per-sentence subtitle timing`, `voice.py:224-313`
  and `1851-1998`, config `config.example.toml:521-535`.
- **Subtitles** come from TTS timings ("edge" mode) or local faster-whisper (`app/services/subtitle.py:7-38`;
  `config.example.toml:381-384`). Whisper downloads its model from Hugging Face, which is blocked here. The Kokoro path
  does not need Whisper, because it returns its own per-segment offsets (`voice.py:1989-1996`).
- **Background music** defaults to `bgm_type = "random"` (`schema.py:113`), which picks a file from `resource/songs/`
  (29 files, `output000.mp3`…). **The README says of those files: "The current project includes some default music from
  YouTube videos. If there are copyright issues, please delete them."** (`README-en.md:477-480`). A monetized video
  made with the default settings therefore carries music of unknown provenance. That is a Content ID and copyright
  exposure the 3.9 rejection never named.
- **Default subtitle font** is `STHeitiMedium.ttc` (`schema.py:126`). `resource/fonts/` also bundles
  `MicrosoftYaHei*.ttc` and `UTM Kabel KT.ttf`, and **no licence file of any kind** (a `find` for licence, readme or OFL
  files returned nothing). Whether those fonts may be used commercially is **UNKNOWN**. The safe move is to swap in a
  font whose licence is on file.

### 1.2 What `upload_post.py` is *(CODE)*

It is a client for **Upload-Post**, a third-party SaaS (`https://api.upload-post.com`, `app/services/upload_post.py:1-16`).
It needs an API key and username (`upload_post.py:18-24`; `config.example.toml:429-437`), so it is one more account in
someone's name. It posts a multipart upload with platform list, title, YouTube title, description, tags and privacy
(`upload_post.py:67-86`). It **always** sends `containsSyntheticMedia=true` for YouTube (`upload_post.py:86`;
`task.py:1104`). The YouTube description is an **LLM-generated caption** (`task.py:1099-1101`), and the default fallback
title is `"Check out this video! #shorts #viral"` (`task.py:1084`). It is not the YouTube Data API. Whether to automate
uploads at all belongs to the sibling scout `upload-automation.md`. Here it matters only because it is where credits would
have to be written, and they are not (§3.2).

### 1.3 Does it write stock attribution anywhere? *(CODE)*

**It collects attribution and never publishes it.** For every Pexels, Pixabay and Coverr clip it records provider, asset
id, the public source page and the creator's name and profile (`material.py:360-372`, `493-497`, `604-605`, normalised by
`_creator_info` and `_material_source_record`, `material.py:64-124`). It writes those records **only** into the task's
local `script.json` (`_persist_material_sources` → `task_artifacts.patch_script_data`, `material.py:127-154`;
`task_artifacts.py:64-80`). Nothing in `generate_video` draws a credit on screen (`grep` for
credit/attribution/pexels/watermark in `video.py` finds nothing), and the description it uploads is the LLM caption.
**The data needed for compliance is already in hand. The last few lines of plumbing are missing.**

---

## 2. Narration: which TTS is commercially licensed and good enough for English

### 2.1 Licence table

| Engine | Code licence | Weights / voice licence | Commercial use of the audio | Grade |
|---|---|---|---|---|
| **Kokoro-82M** via **kokoro-onnx** | kokoro-onnx: MIT (installed `kokoro_onnx-0.6.1.dist-info/licenses/LICENSE`; `raw.githubusercontent.com/thewh1teagle/kokoro-onnx/main/LICENSE`). hexgrad/kokoro: Apache-2.0 (`hexgrad/kokoro/main/LICENSE`, line 1-2) | hexgrad's README: *"With Apache-licensed weights, Kokoro can be deployed anywhere from production environments to personal projects."* (`hexgrad/kokoro/main/README.md:5`). kokoro-onnx's `model-files-v1.0` release says the ONNX files are *"optimized f32 version from taylorchu/kokoro-onnx"*, with voices from hexgrad/Kokoro-82M | **Yes.** Apache-2.0 permits commercial use and claims nothing over output | CODE; the release page is RENDERED via WebFetch's summariser |
| Kokoro's phonemiser | kokoro-onnx depends on `phonemizer` (GPL-3.0+, installed `phonemizer-3.4.0.dist-info/METADATA`) and `espeakng-loader`, which bundles `libespeak-ng.so` | n/a | **Output is not covered.** GPLv3 §2: *"The output from running a covered work is covered by this License only if the output, given its content, constitutes a covered work."* (`phonemizer-3.4.0.dist-info/licenses/LICENSE:159-161`). A WAV of our script is not the program. The GPL binds us only if we *redistribute* the software | CODE + INFERENCE |
| **Edge TTS** (the fork's default) | edge-tts: LGPLv3 (`rany2/edge-tts/master/LICENSE:1-2`) | **None.** The package calls `speech.platform.bing.com/consumer/speech/synthesize/readaloud` with a hard-coded `TRUSTED_CLIENT_TOKEN`, a spoofed Edge User-Agent and `Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold` (installed `edge_tts/constants.py:3-24`). It computes a `Sec-MS-GEC` "DRM" token (`edge_tts/drm.py:1-3`). Its README: *"Microsoft prevents the use of any SSML that could not be generated by Microsoft Edge itself"* (`edge-tts/README.md:55`) | **No.** The 3.9 entry called this "a Microsoft terms grey area". The code shows it is worse. This is an undocumented consumer endpoint reached by posing as the Edge browser, with no licence for API use and none for the audio. The paid, licensed route is Azure Speech, whose terms I did not read | CODE + INFERENCE |
| **Piper** | rhasspy/piper was MIT (`rhasspy/piper/master/LICENSE.md`). Development moved to `OHF-Voice/piper1-gpl` (`rhasspy/piper/master/README.md`), which is GPL-3.0 (`OHF-Voice/piper1-gpl/main/COPYING:1-2`) | Per voice. *"The `MODEL_CARD` file for each voice contains important licensing information. **Piper is intended for personal use and text to speech research only**; we do not impose any additional restrictions on voice models. Some voices may have restrictive licenses"* (`OHF-Voice/piper1-gpl/main/docs/VOICES.md:62`). The model cards are on Hugging Face (blocked) | **Not as a default.** Each voice needs its own licence check, and the project states it is meant for personal and research use | CODE; voice licences UNKNOWN |
| **Chatterbox** (Resemble AI) | MIT (`resemble-ai/chatterbox/master/LICENSE`) | README states no weights licence. Weights are on Hugging Face (blocked). Every output carries an imperceptible **PerTh** watermark (`chatterbox/README.md:173-175`) | **Probably, not proven.** The weights licence is UNKNOWN from here. CPU use is heavy: only the 110M "Nano" is described as CPU-friendly, *"3x faster than realtime on 8 CPU cores"* (`README.md:32,45`). Its Multilingual model lists **Hebrew** (`README.md:147`), which is the one relevance to the Hebrew reopen trigger | CODE; weights UNKNOWN |

**Verdict:** **Kokoro via kokoro-onnx** is the only engine here with a licence chain I could read end to end, from
Apache-2.0 weights through MIT runtime to GPL tooling whose output is exempt. It runs on CPU, offline and without a key.
It is English (and 8 other languages), and **it has no Hebrew voice** (`voice.py:236-237`).

### 2.2 Is it good enough? *(partly UNKNOWN)*

- **Vendor claim only:** *"comparable quality to larger models"* (`hexgrad/kokoro/README.md:5`). I cannot listen, and
  the public listening rankings are on Hugging Face (blocked). **A retention metric on a published video is the only
  honest quality test.** Nobody here can run an A/B listening panel without the owner, who does nothing.
- **Measured defect 1, text normalisation.** kokoro-onnx phonemises *everything* through espeak-ng
  (`kokoro_onnx/tokenizer.py:8-10`), not through hexgrad's `misaki` G2P, which the reference pipeline uses with espeak
  only as a fallback (`hexgrad/kokoro/README.md:26,33`). On chart narration it gets numbers wrong *(MEASURED)*:

  | Input | Phonemes produced (read back) |
  |---|---|
  | `$5,400` | "dollar five thousand four hundred" (wrong order) |
  | `3.5%` | "three. five percent" (the decimal point is read as a full stop) |
  | `1.8x` | "one. eight ex" |
  | `1990` | "nineteen hundred ninety" |
  | `2008`, `GDP`, `U.S.` | fine |

  **Fix:** a normalisation pass that writes numbers, currency and decimals out in words before TTS. An LLM or a small
  rule set does it. This is not optional for a data channel.
- **Code defect 2, choppy prosody in the fork's Kokoro path.** `kokoro_tts` synthesises each segment separately with a
  fixed 0.25 s gap (`voice.py:1946-1980`). It gets its segments from `utils.split_string_by_punctuations`
  (`voice.py:1954-1956`), which splits on `, . ? ! ; :` and more (`app/models/const.py:1-15`) and **drops the
  punctuation** (`app/utils/utils.py:311-315`). On my 274-word test script that is **38 fragments against 19 sentences**
  *(MEASURED)*. Each clause is spoken as a stand-alone utterance, and `?` never reaches the model, so questions lose
  their intonation. **Fix:** synthesise whole sentences with their punctuation and derive subtitle timing per sentence.

### 2.3 Speed *(MEASURED)*

`kokoro-v1.0.onnx` (f32, 325 MB) with voice `am_michael`, lang `en-us`, speed 1.0, synthesised sentence by sentence
(19 sentences, 0.25 s gaps) through the fork's venv (`kokoro-onnx 0.6.1`, `onnxruntime 1.24.4`) on 4 CPU cores:

| Model load | Synthesis | Audio produced | Real-time factor | Words | Speech rate |
|---|---|---|---|---|---|
| 1.2 s | 25.4 s | 107.7 s | **0.236** | 274 | 153 words/min |

So a **9-minute video is about 1,380 words and about 2.1 minutes of CPU** for narration. The int8 model (88 MB) exists
and would be faster; I did not test it.

---

## 3. Stock footage: Pexels and Pixabay, and the public-domain alternatives

### 3.1 What the Pexels API guideline actually says *(MIRROR)*

Pexels' own pages returned **403 to the GitHub runner too** (`research/rendered/pexels-license.meta.json`,
`pexels-api-docs.meta.json`, `pixabay-license-summary.meta.json`, all `"status": 403`). A verbatim copy of the API docs
sits at `github.com/developer-ishan/mcp-pexels/blob/main/docs/official/pexels-api-docs.md`, a third party's MCP server
repo. Its changelog ends 2023-11-22, so it may be stale. Its lines 22-34:

> *"Whenever you are doing an API request make sure to show a **prominent link to Pexels**. You can use a text link (e.g.
> "Photos provided by Pexels") or a link with our logo."*
> *"Always credit our photographers when possible (e.g. "Photo by John Doe on Pexels" with a link to the photo page on Pexels)."*
> *"You may not copy or replicate core functionality of Pexels (including making Pexels content available as a wallpaper app)."*
> *"Do not abuse the API. By default, the API is rate-limited to 200 requests per hour and 20,000 requests per month. […]
> Abuse of the Pexels API, including but not limited to attempting to work around the rate limit, will lead to termination of your API access."*

The search result (search 1) summarised the same text *(SNIPPET, consistent)*. **One correction to the 3.9 record:** the
guideline text says "may not copy or replicate core functionality". It does **not** contain the "no systematic bulk
copying" wording that `docs/REJECTED.md` rejection reason 5 cites. That wording may be in Pexels' separate licence or API
terms, which nobody here has read. **UNKNOWN.**

### 3.2 Would a description credit satisfy it? *(INFERENCE)*

**Probably yes in letter, with two caveats.** A description block with a "Videos provided by Pexels" link to pexels.com,
plus one "Video by <name> on Pexels" line linking each clip's page, matches both example formats in the guideline. The
caveats:

1. **"Prominent."** A YouTube description is collapsed by default. An on-screen end credit ("Footage: Pexels — full
   credits in description") costs nothing and removes the doubt.
2. **Volume.** With the fork's 5-second default clip length (`schema.py:95`), a 9-minute video needs **about 108 clips**.
   That is 108 credit lines, and it may not fit a description (YouTube's description length limit: **UNKNOWN** from
   here). Longer clips, or a credits page linked from the description, solve it.

The fork **already holds every field this needs** (`material.py:360-372`). The fix is to render `material_sources` into
the description and an end card. That is small, but **it is not done, so the default output of the fork is
non-compliant on every Pexels video.** Rejection reason 5 stands for the fork as shipped. It no longer stands as
"structural": it is a missing feature, not a law of nature.

### 3.3 Identifiable people and model releases *(prior research, not re-verified)*

I could not read the Pexels or Pixabay licence pages (403 everywhere). The repo's earlier reading
(`research/tiktok/06-faceless-video-tooling.md` §5.1-5.2 and §5.4, medium confidence, from snippets) says free stock
carries **no model releases**, forbids showing identifiable people "in a negative or offensive way", and forbids implying
endorsement. The hazard is still the one §5.4 named. A machine picks a clip of a real person by keyword, and a script
about debt, scams or illness then runs over their face. For a high-RPM niche (finance, health, legal) that pairing is
the *normal* case, not an edge case. **Mitigation if stock is ever used:** no clips with people at all (landscapes,
objects, abstract motion), chosen by a filter plus a reviewer agent.

### 3.4 Public-domain alternatives *(SNIPPET)*

- **NASA** (search 3): NASA content "generally are not subject to copyright in the United States". The exceptions are
  third-party material NASA marks as copyrighted, **no implied NASA endorsement** of commercial goods, and **identifiable
  persons** in NASA images, where commercial use "may infringe that person's right of privacy or publicity". JPL has its
  own separate image-use policy. Pages seen: `https://nasa.gov/nasa-brand-center/images-and-media`,
  `https://www.jpl.nasa.gov/jpl-image-use-policy/`. **Not rendered.** The NASA image API
  (`images-api.nasa.gov`) is **blocked from this container** (403, one attempt). A GitHub runner has egress.
- **US federal government works generally:** I did not read the statute or any agency policy in this session.
  **UNKNOWN here.** Each agency's page would need checking, and the same people/endorsement caveats apply.

**Useful for space and science b-roll only. It does not rescue a finance or health channel's visuals.**

---

## 4. Original visuals: the policy-safest route

### 4.1 Data with licences I could read

| Source | Licence | Grade | Reachable from here? |
|---|---|---|---|
| **Our World in Data** (their own data, charts and code) | *"completely open access under the Creative Commons BY license … provided the source and authors are credited."* **Third-party data they host** *"is subject to the license terms from the original third-party authors"* (`owid/co2-data/master/README.md:127-131`; the same text is in `owid/energy-data/master/README.md:156-160`) | CODE | **Yes.** `raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv` downloaded, 14.4 MB (MEASURED). `ourworldindata.org` itself is 403 |
| OWID's upstream sources (for example the Global Carbon Project, the Energy Institute Statistical Review and the US EIA, listed in `owid/co2-data/README.md:17-53`) | Each has its own terms | UNKNOWN | n/a |
| **World Bank** (WDI and other datasets) | CC BY 4.0 "with these additional terms", the default for World Bank-produced datasets (search 4) | SNIPPET | `api.worldbank.org` is **403** here. A runner has egress |
| US federal statistics | Commonly public domain. Not verified in this session | UNKNOWN | not tested |

**One trap to avoid:** OWID's chart *software* (`owid/owid-grapher`) *"is no longer available under the MIT licence"*
(`owid/owid-grapher/master/README.md:7-18`). Draw our own charts from the CSVs. Do not embed their grapher and do not
screenshot their charts. That also matters for policy, as §4.2 explains.

The renderer's own licences are clean: matplotlib is PSF-based (installed `matplotlib-3.11.2.dist-info/METADATA`),
MoviePy is MIT, onnxruntime is MIT *(CODE)*. The bundled ffmpeg binary (`imageio_ffmpeg`, v7.0.2) is a GPL build. As in
§2.1, that governs redistribution of the binary, not the videos it encodes *(INFERENCE)*.

### 4.2 Why this also answers the inauthentic-content rule *(RENDERED + INFERENCE)*

The policy names the failures:
- *"Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value"*
  `[RENDERED research/rendered/youtube-monetization-policies.txt:138]`
- *"AI-generated content made with generic or unoriginal templates giving the impression of mass production without
  adding the creator's original, authentic insights or perspective"* `[RENDERED …:140]`
- *"channels where content feels interchangeable from video to video are not allowed to monetize"* `[RENDERED …:130]`

And it names what passes:
- *"the substance of each video should be materially varied and deliver creative, educational, or other value"* `[RENDERED …:120]`
- *"Same intro and outro for your videos, but the bulk of your content is different"* `[RENDERED …:124]`
- *"using AI to edit your video scripts or generate a unique background visual"* `[RENDERED …:226]`

A chart computed from a dataset nobody has charted in that way before is **different in substance per video by
construction**. The analysis *is* the "original, authentic insight". A stock montage under TTS is a slideshow with a
voice. The reused-content rule adds one more reason not to screenshot OWID's own charts even though CC BY allows it:
*"This policy applies even if you have permission from the original creator"* `[RENDERED …:186]`. Rendering fresh from
raw data sidesteps that.

**Where this route can still fail (INFERENCE):** a channel that reruns one chart template over a different country each
day is the "templated storylines" case again. Variety of *question*, not of dataset label, is what counts. This is
constraint 6 (distinct sources) applied inside one channel.

### 4.3 Disclosure *(RENDERED)*

- Charts and diagrams are non-realistic, and infographics and scripts made with AI help are listed as **not** needing
  disclosure: *"Production assistance, like using generative AI tools to create or improve a video outline, script,
  thumbnail, title, or infographic"* `[RENDERED research/rendered/youtube-altered-synthetic-disclosure.txt:107]`, and
  non-realistic content generally `[…:87]`.
- **"AI generated music" must be disclosed** `[…:131]`. That is one more reason to ship without the fork's AI-music
  providers.
- Disclosure is free: *"Disclosing AI content won't limit a video's audience or impact its eligibility to earn money."*
  `[…:173]`. The fork already sets it to true (`upload_post.py:86`). Whatever the letter of the rule says about a
  generic synthetic narrator, **disclosing is the honest default and costs nothing.**
- **Interaction with niche choice (INFERENCE):** a synthetic narrator giving finance or health *advice* collides with
  *"AI-generated podcast hosts offering financial guidance"* `[RENDERED youtube-monetization-policies.txt:250]`. A
  synthetic narrator reading sourced data analysis, never presenting as a human expert and never advising, is outside
  that wording, but only if the script keeps to it. The sibling scout `policy.md` owns this question.

### 4.4 Render cost *(MEASURED)*

matplotlib 3.11.2 (Agg), 1920×1080, 4-line animated chart, one process: **360 frames in 38.6 s = 107 ms per frame.**
ffmpeg 7.0.2 libx264 `-preset medium -crf 20`, 30 fps, looping that 12 s animation under the 107.7 s Kokoro narration,
AAC 192k: **31.7 s to encode 108 s of 1080p30** (about 0.29× real time), output 2.7 MB. The output is valid: H.264 High
1920×1080 30 fps plus AAC. Caveat: this content has little motion. Fully animated content will encode slower, by an
amount I did not measure.

---

## 5. Sora 2 (reel prompt 4)

| Question | Answer | Grade |
|---|---|---|
| Does the API still exist? | **No, as of 24 September 2026.** Every `Videos` method in `openai-python` is decorated `@typing_extensions.deprecated("The Sora API is scheduled to permanently shut down on September 24, 2026.")` (`src/openai/resources/videos.py:70,139,174,214,252,306,344`), added in v3.1.0 on 2026-08-14 (`CHANGELOG.md:425-432`, "**api:** deprecate Sora video APIs"). SDK changelog head: v3.19.2, 2026-09-23 | CODE |
| The app? | *"The web and app version of Sora went dark on April 26, 2026, with the Sora API following on September 24, 2026."* The closure was announced 2026-03-24 (search 5, summary across the-decoder.com, CNN, Axios and others). OpenAI's own page was seen but not rendered: `https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation` | SNIPPET, consistent with the CODE date |
| Availability to an Israeli user | **Moot.** The service is closed for everyone | INFERENCE |
| Price per second | Reported $0.10/s (sora-2, 720p) and $0.30–0.70/s (sora-2-pro), in search 2 from aggregators that resell API access (costgoat.com, OpenRouter, CometAPI and others). **Moot.** Even when it existed, one minute of b-roll per video at $0.10/s is $6 ≈ ₪22, so about nine videos would have used up the whole ₪200 float. A per-video charge is working capital, which the float is not for (`MISSION.md`, budget section) | SNIPPET + INFERENCE |
| API shape while it lived | Models `sora-2` / `sora-2-pro`; clips of **4, 8 or 12 s**; sizes 720x1280, 1280x720, 1024x1792, 1792x1024 (`src/openai/types/video_create_params.py`, `video_seconds.py`, `video_size.py`). There was no native 1920×1080 | CODE |
| Watermark / C2PA | Not verified. **Moot** for Sora. The general rule matters: YouTube auto-labels content that carries C2PA metadata, and **that label cannot be removed** `[RENDERED youtube-altered-synthetic-disclosure.txt:181,189]` | RENDERED (the YouTube side) |
| Would disclosure have been mandatory? | For realistic generated scenes, yes: *"Generates a realistic scene that didn't actually occur"* `[RENDERED …:71]`, *"AI generated extra footage of a real place"* `[…:133]` | RENDERED |

**Any other text-to-video service** (the fork's WaveSpeed, OFox, Seedance, MiniMax and LoomLoom sources, all billed per
clip per `config.example.toml:64-76`) has the same shape: a recurring per-video spend the float may not fund, disclosure
duties, and "stitch together unrelated or inconsistent AI clips" risk `[RENDERED youtube-monetization-policies.txt:238]`.

---

## 6. Cost per 8–10 minute video, zero-cash stack

The stack: open data → our own charts → Kokoro → ffmpeg, no music, a font with its licence on file. The target is 9
minutes, about 1,380 words at the measured 153 wpm.

| Step | Machine time (4 cores) | Cash | Basis |
|---|---|---|---|
| Fetch data (OWID CSV from GitHub; others from a runner) | seconds | ₪0 | MEASURED (OWID) |
| Research, script, number normalisation, fact-check (LLM) | minutes | **≈ ₪5–20 in tokens** | INFERENCE. Assumes about 200k input and 20k output tokens on Opus 5 plus about 100k/5k on a Fable verifier, at the repo's own prices of $5/$25 and $10/$50 per 1M (`CLAUDE.md`, model routing rule) and 3.7 ₪/$ ≈ ₪10, then ×0.5–2 |
| Narration, Kokoro f32 | **≈ 2.1 min** | ₪0 | MEASURED (RTF 0.236) |
| Charts: 20% animated, the rest held stills | ≈ 6 min | ₪0 | MEASURED 107 ms/frame × 3,240 frames |
| Charts: fully animated, one process | ≈ 29 min (≈ 8 min over 4 processes, untested) | ₪0 | MEASURED rate × 16,200 frames; the parallel figure is INFERENCE |
| Encode, 1080p30 x264 medium | ≈ 2.6 min for low motion; more for heavy motion | ₪0 | MEASURED 0.29× real time |
| **Total** | **≈ 10–40 min** | **≈ ₪5–20** (tokens only) | |

At the reel's daily calendar (prompt 5, 30 videos a month) the tokens come to **₪150–600 a month (INFERENCE)**. That is
not zero, and it is not a subscription the float could carry. Whether token spend is metered to the owner depends on the
plan the colony runs on: **UNKNOWN.** Upload, audience and payout are out of scope here. See the sibling scouts.

---

## 7. What this changes in the 3.9 rejection (production only)

| 3.9 claim | Status for the English long-form variant |
|---|---|
| Reason 5, "the licensing trap is structural" (Pexels attribution, no model releases) | **Holds for the fork as shipped** (credits collected, never published, §1.3). **Not structural:** it is fixable in a few lines, and **avoidable entirely** by not using stock (§4) |
| "Free Edge TTS is a Microsoft terms grey area" | **Understated.** It is an undocumented endpoint reached by posing as Edge, and no grant exists (§2.1). Keep it banned |
| Reopen trigger, "a TTS licence that permits commercial use" | **Met for English** by Kokoro-82M (Apache-2.0). **Not met for Hebrew**: Kokoro has no Hebrew voice. Chatterbox Multilingual lists Hebrew, but its weights licence is UNKNOWN from here |
| "Hebrew RTL support that works", "a platform paying Israel" | Not my question. The English variant makes RTL irrelevant. On payout, see `monetization-gates.md` |
| **New trap, not in the 3.9 entry** | The fork's **default background music** is YouTube-sourced audio of unknown licence (`README-en.md:477-480`, `schema.py:113`). **Default font** files carry no licence. **Default narration** is Edge TTS. **Default footage** is Pexels without credits. *Every* default is unsafe for monetized use |
| **New fact** | **Sora is gone** (§5). Reel prompt 4 cannot be executed as written by anyone, from any country |

**MISSION constraint 8 (the non-public input):** a chart from public data can be rebuilt by anyone. The production stack
gives no moat. The only non-public input this line could accumulate is the channel's own history on YouTube.
**INFERENCE; that question belongs to the sibling scouts.** **Constraint 3:** this stack is one channel, one renderer and
one schedule. It must stay one channel.

---

## 8. Recommended stack, and the cheapest first test (constraint 7)

**Stack, if the board proceeds:** open data (CC BY or public domain, licence recorded per dataset) → pandas + matplotlib
charts drawn by us → an LLM script with explicit sources and a number-normalisation pass → Kokoro f32 with
sentence-level synthesis (fix §2.2 defect 2) → ffmpeg assembly with DejaVu Sans. Its licence file ships with matplotlib (`mpl-data/fonts/ttf/LICENSE_DEJAVU`:
Bitstream Vera terms, with *"DejaVu changes are in public domain"*, CODE)
→ **no music** → description with dataset credits (CC BY requires them) → "AI use: Yes" → a channel "About" line saying
the narration is synthetic and the analysis is sourced. **Build it as a small purpose-built renderer, not inside
MoneyPrinterTurbo.** MPT's random 5-second clip model, its 3%/s zoom on images and its lack of chart-to-sentence
alignment fight this product (`schema.py:93-95`; `video.py:1362-1391`).

**Cheapest test that a stranger can find it (constraint 7), INFERENCE:** one video, about 4–6 minutes, on one
under-covered data question, produced end to end by this stack at ₪0 cash. Measure only impressions and views from
YouTube search and browse over 30 days, not revenue. The upload step and its automation limits are in
`upload-automation.md`. The render itself needs no owner action. **The channel does**: a Google account is an identity
step only the owner can take (MISSION rule 1), and it is not listed as a one-time step in this report because
`docs/OWNER_STEPS.he.md` is the only place such steps may be added.

---

## 9. What I could not verify

1. **Pexels and Pixabay licence pages and Pexels API terms.** 403 from this container *and* from the GitHub runner. The
   guideline text comes from a third-party GitHub mirror whose changelog ends 2023-11-22. The "systematic copying"
   wording cited in `docs/REJECTED.md` was **not found** in that guideline text.
2. **Kokoro weights licence on the model card itself** (`https://huggingface.co/hexgrad/Kokoro-82M`, blocked). I rely on
   hexgrad's GitHub README and Apache-2.0 LICENSE. **Kokoro's training-data provenance**: its README thanks
   *"everyone who contributed synthetic training data"* (`hexgrad/kokoro/README.md:124`). Where that data came from, and
   whether it matters, is **UNKNOWN**.
3. **Kokoro audio quality** as a listener would judge it. I cannot listen, and the arena rankings are blocked.
4. **Chatterbox weights licence** (`https://huggingface.co/ResembleAI/chatterbox-nano`, blocked) and **Piper per-voice
   licences** (MODEL_CARDs on Hugging Face, blocked).
5. **Licences of the fork's bundled fonts and songs.** No licence files exist. The README concedes the songs came from
   YouTube videos.
6. **Sora's watermark and C2PA behaviour, and its availability in Israel.** Moot now, and not verified.
7. **NASA, JPL, World Bank and US federal terms.** Snippets only (§3.4, §4.1).
8. **Encode time for fully animated content**, and whether rendering chart frames across 4 processes scales linearly.
9. **The token cost per video.** It is an estimate, not a measurement. Whether it is billed to the owner is UNKNOWN.
10. **Azure Speech (the licensed Microsoft route) terms and price.** Not read.

---

## 10. Sources and search log

**Code and files read (CODE):** `/home/user/MoneyPrinterTurbo`: `README-en.md`, `config.example.toml`,
`app/services/{voice,material,video,subtitle,upload_post,task,task_artifacts}.py`, `app/models/{schema,const}.py`,
`app/utils/utils.py`, `app/config/config.py`, `resource/`, and `git log` (fork head `658e29e`). The fork's venv package
metadata and files for `kokoro_onnx 0.6.1`, `phonemizer 3.4.0` (with its GPLv3 LICENSE), `espeakng_loader 0.2.4`,
`edge_tts 7.2.7` (`constants.py`, `drm.py`), `onnxruntime`, `moviepy 2.2.1`, and the pilot venv's `matplotlib 3.11.2`.
From `raw.githubusercontent.com` today: `hexgrad/kokoro` (LICENSE, README), `thewh1teagle/kokoro-onnx` (LICENSE, README),
`resemble-ai/chatterbox` (LICENSE, README), `rany2/edge-tts` (README, LICENSE), `rhasspy/piper` (README, LICENSE.md),
`OHF-Voice/piper1-gpl` (README, COPYING, docs/VOICES.md), `openai/openai-python` (`src/openai/resources/videos.py`,
`src/openai/types/video_*.py`, `CHANGELOG.md`), `owid/co2-data`, `owid/energy-data` and `owid/owid-grapher` (READMEs).

**RENDERED:** `research/rendered/youtube-monetization-policies.txt`,
`research/rendered/youtube-altered-synthetic-disclosure.txt`, and the three 403 `.meta.json` files for Pexels and
Pixabay. `https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0` via WebFetch (a summariser, so
treat the quotes as near-verbatim).

**MIRROR:** `https://github.com/developer-ishan/mcp-pexels/blob/main/docs/official/pexels-api-docs.md` (fetched raw).

**MEASURED:** Kokoro synthesis benchmark, espeak phonemisation of numeric strings, the fork's splitter on the test
script, matplotlib frame rendering, ffmpeg encode, and one reachability probe each for `api.worldbank.org`,
`ourworldindata.org` and `images-api.nasa.gov` (all 403) and `raw.githubusercontent.com/owid/co2-data` (200, 14.4 MB).

**Searches (5 of 5):**
1. Pexels API guideline attribution text. SNIPPET, confirmed by the mirror.
2. Sora 2 API price per second. SNIPPET from API resellers and aggregators (costgoat.com, OpenRouter, CometAPI,
   glbgpt.com, magichour.ai), some of which sell access. It also first surfaced the shutdown.
3. NASA media usage guidelines. SNIPPET.
4. World Bank dataset licence. SNIPPET.
5. Sora app shutdown. SNIPPET from news outlets (the-decoder.com, CNN, Axios, Euronews), consistent with the CODE date.
