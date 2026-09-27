# SCOUT: prompt critique. The reel's six prompts one at a time, and the honest version the colony should run

**Date:** 2026-09-25. **Tier:** scout (Opus). **Search budget:** 2 allowed, **2 used** (log in §8).
**Input:** `research/faceless-youtube/00-owner-reel-2026-09-25.md`, six ChatGPT prompts from an Instagram carousel.
**Siblings I read and build on (not re-derived here):** `policy.md`, `discovery.md`, `rpm-evidence.md`,
`monetization-gates.md`, `upload-automation.md` (all in this directory).

## Grades used

- **RENDERED**: primary page text I read, in `research/rendered/` (fetched by `render-watch.yml` on 2026-09-25).
  Cited as `[RENDERED research/rendered/<file>:<line>]`. Short form `[MP:<line>]` means
  `research/rendered/youtube-monetization-policies.txt`, `[DISC:<line>]` means
  `research/rendered/youtube-altered-synthetic-disclosure.txt`, and `[PAY:<line>]` means
  `research/rendered/youtube-ypp-payout.txt`.
- **CODE**: a repository file I read. That covers this repo and third-party files on GitHub. A sibling scout's
  finding keeps the grade its author gave it, and I say what that grade was.
- **SNIPPET**: search-result text only. It is weaker, and I name the publisher and whether it sells something.
- **INFERENCE**: my reasoning. **UNKNOWN**: not established.

---

## 0. The answer

1. **As written, all six prompts produce the output that `docs/REJECTED.md` rejected on 3.9, just in English
   and at long-form length.** Each prompt runs into a named rule on YouTube's current monetization page. Prompt 1
   runs into "AI Personas Related to Sensitive Topics" [MP:244-252]. Prompts 2 and 3 run into reused content and
   "mimics existing formats or stories" [MP:186, :196, :210]. Prompt 4 runs into the AI-disclosure and "deceptive
   imagery" rules and into stock licensing [DISC:63-71; MP:240]. Prompt 5 runs into "mass-produced" [MP:84, :140].
   Prompt 6's "monetized in 30 days" is false on the thresholds and the payment cycle [PAY:86-122]. The switch to
   English, long-form and a single channel does not rescue the prompts themselves.
2. **Prompt 4 cannot be run today.** OpenAI's Help Center has a page titled "What to know about the Sora
   discontinuation". Independent outlets report that the Sora app closed on **2026-04-26** and that the **Sora API
   was to be discontinued on 2026-09-24, yesterday** *(SNIPPET: a first-party page title plus The Decoder and
   NewsBytes; CODE-weak corroboration from an AI-written review on GitHub)*. The carousel was posted around
   2026-09-20. It recommends a tool whose consumer app had been gone for five months, and it calls its ideas
   "relevant in 2025". **The method is recycled, not tested.**
3. **The carousel deserves near-zero weight as evidence and moderate weight as a checklist.** Its six headings
   (niche, ideas, script, visuals, cadence, money) are the generic creator workflow. Every *operative* instruction
   inside them is unmeasurable by an LLM, stale, or named by policy. The account trades comments for a DM, and its
   payoff is engagement (1,848 likes, 269 comments, 1,505 shares at capture), not a reader's revenue. No outcome
   is shown. *(CODE for the funnel facts; INFERENCE for the weight.)*
4. **Only one retention "best practice" is documented by YouTube itself, and it is an honesty rule.** The
   key-moments report counts the share of viewers still watching at 30 seconds. It calls ≥50% "above typical",
   and it says a good intro means "the content in the first 30 seconds matched the viewer's expectation of the
   video's thumbnail and title" *(SNIPPET of support.google.com/youtube/answer/9314415, YouTube's own page)*.
   Hook formulas, "pattern interrupts" and open loops are not documented by YouTube in anything I read. Where they
   manipulate, they sit under "emotionally manipulative formulas" [MP:210].
5. **An honest six-step rewrite exists, and every rewrite changes the substance, not just the wording** (§2). It
   uses own-computed substance instead of a modelled competitor, own-generated visuals instead of stock and Sora,
   a gated queue instead of a calendar, and a measured test instead of "monetized in 30 days". It removes every
   named disqualifier. It cannot promise "clearly inside", because the test is a reviewer's judgment, and a
   failure follows the owner to "any new channels you create" [MP:286-288].
6. **The honest version is a constraint-7 measurement, not an income line.** A channel sitting exactly at the
   YPP threshold is worth roughly **₪170–260/month** at the reel's own $7 RPM (sibling `discovery.md` §6.5,
   INFERENCE). That is about **1% of the target**. The colony's own rules would also escalate it at 30 days and
   kill it at 45 days after first money (`src/revenue/types.ts:213-215`, CODE). So it must be registered as a
   pre-registered test with written gates, not as a revenue line (§3.3).

---

## 1. The source: what the carousel is, and how much weight it deserves

| Fact | Evidence | Grade |
|---|---|---|
| Account `gptprompts.ai`. Caption: `Comment "Chatgpt" to get 1K+…` | `00-owner-reel-2026-09-25.md:19,22` | CODE (a verbatim transcription of screenshots) |
| Engagement at capture: 1,848 likes · 269 comments · 62 reposts · 1,505 shares | same file :21 | CODE |
| Prompt 2 asks for ideas "relevant in 2025". The post is about 5 days old on 2026-09-25 | same file :13, :33 | CODE |
| Prompt 4 names "OpenAI Sora 2". The Sora app closed 2026-04-26, and the API ends 2026-09-24 | OpenAI Help Center result title "What to know about the Sora discontinuation"; the-decoder.com; newsbytesapp.com; `Chatforest/chatforest.com` review (see §8) | SNIPPET (first-party title plus independent news); CODE-weak (the review is AI-written, "Reviewed by ChatForest — an AI-operated content site") |
| Typos kept verbatim ("videoC clips", a stray `'.`) | same file :30, :39 | CODE |
| Does the account sell a paid pack beyond the free DM? | Not checked; Instagram is unreadable from here (`research/measurements/instagram-reel-readability.md`) | UNKNOWN |

**What this implies (INFERENCE).**

- **The incentive is engagement, not outcomes.** A comment-for-DM funnel is paid in comments and shares
  whether or not any reader ever earns a dollar. It has the same shape as the 120k-star MoneyPrinter repos
  that `docs/REJECTED.md` found had "zero verified earnings reports". The product is the promise.
- **Staleness is proof that nobody re-ran it.** Anyone who had run prompt 4 at any time after April 2026
  would have found no Sora app. The carousel's text was written for late 2025 and reposted.
- **The prompts outsource every judgment to an LLM that cannot observe the thing asked for.** RPM, competition,
  "viral in 2025", "YouTube best practices" and "monetized in 30 days" are all facts about the world that a
  chat model can only reconstruct from its training data. `MISSION.md` already rules on this: "A number from
  another model is a number from a model, not a fact."
- **What survives is the sequence of headings.** Niche → ideas → script → visuals → cadence → money is a
  sensible order of work, and the rewrites keep it. Nothing else is inherited.

---

## 2. The six prompts, one at a time

Each subsection follows the same order: what is sound, what is false or fabrication-prone, what violates
`MISSION.md` or platform rules, and the honest rewrite as a ready-to-run brief. The briefs are written to be
pasted into a colony agent's prompt. Their evidence rules are part of the brief, not advice about it.

### 2.1 Prompt 1, NICHE FINDER

> "List 15 Faceless YouTube niches with low competition, high growth potential, and high RPM metrics that must be >$7."

**Sound.** Niche choice does move ad revenue. The sources agree on *direction*: advertiser-heavy topics and
Tier-1 audiences earn more *(SNIPPET, consistent direction; sibling `rpm-evidence.md` §0.2 and §0.4)*.

**False or fabrication-prone.**
- **An LLM has no RPM data.** It will write numbers that sound plausible, sourced from the SEO tier it was
  trained on. The sibling found finance quoted as "$9–$11", "$10–$25" and "$11–$19" within single search
  summaries, and it found the repo's own "$25–45 finance" figure is probably a **CPM mislabelled as RPM**
  [CODE `rpm-evidence.md:19-27, :72-78`, graded SNIPPET/INFERENCE by its author]. So a prompt-generated
  "RPM > $7" list is fiction twice over.
- **"Low competition" cannot be measured honestly by the colony.** Scraping YouTube is barred by its Terms.
  The Data API forbids "new or derived data or metrics" built from other channels' data, and its own example
  is "a score that factors in likes, total views…" [CODE `discovery.md:46-53`, graded RENDERED-ARCHIVE (Open
  Terms Archive) by its author]. **Competition is measured by publishing, not by prompting** (same file :53).
- **"High growth potential"** is a forecast with no observable input (INFERENCE).
- **The triple is self-contradictory with volume.** Niches that really are low-competition have audiences too
  small to supply the ~772,000 monthly views at $7 that ₪20,000 needs [CODE `rpm-evidence.md:44-53`;
  `monetization-gates.md` §6, INFERENCE].

**Violates.**
- **YouTube:** the RPM > $7 filter selects into finance, insurance, health and legal. An AI-narrated channel
  there hits "channels that use AI-generated personas to deliver information on sensitive topics … health, legal
  issues, finances, or politics … will not be allowed to monetize" [MP:244]. The named example is
  "AI-generated podcast hosts offering financial guidance, investment tips, or wealth management advice" [MP:250].
  The rule is channel-level.
- **MISSION constraint 8:** nothing in the prompt names an input that is not public. **Constraint 7:** it names
  no acquisition channel.

**Honest rewrite: NICHE SCREEN.** It replaces "find high-RPM niches" with "find a topic where our own
computation is the substance and a stranger has a reason to search".

```text
BRIEF P1' - NICHE SCREEN
Role: worker (research). Model: opus. Reviewed by: supervisor (evidence check), then an
adversarial auditor (model: fable - a long-lived, owner-identity-bound choice), then the board.

Task: propose up to 8 candidate topic areas for ONE English, long-form, faceless YouTube channel,
and screen each through gates G1-G6 in order. Stop at the first FAIL for that candidate.

Hard rules
- Do NOT state any RPM, CPM, view count, subscriber count, competition score or growth figure
  from memory. A number may appear only with: URL, verbatim quote, retrieval date, publisher,
  and whether the publisher sells a creator tool, course or service. Otherwise write UNKNOWN.
- Do NOT scrape YouTube and do NOT compute any score from other channels' data (YouTube ToS;
  Data API derived-metrics ban - research/faceless-youtube/scouts/discovery.md:46-53).
- UNKNOWN is a valid answer everywhere. A confident guess is a defect.

Gates
G1 Policy. Would a typical video give advice on health, law, finance, politics or a similar
   sensitive topic? If yes -> FAIL. Cite research/rendered/youtube-monetization-policies.txt:244-252.
   A disclaimer does not cure it.
G2 Substance we own. Name the input each video rests on that is ours: a dataset we compute from,
   a tool we built, an analysis we run. "Summarising public articles" -> FAIL
   (youtube-monetization-policies.txt:204; MISSION.md constraint 8).
G3 Visuals we can make. Can a typical video be illustrated entirely with charts, diagrams,
   animations, text cards or screen recordings we generate? If it needs stock people or
   photorealistic AI -> FAIL.
G4 Stranger route (MISSION constraint 7). Write 5 queries a stranger would type into YouTube
   search, in their words. Volume = UNKNOWN; do not estimate it.
G5 Catalogue depth. List 12 questions, each a video, each materially different from the others
   (youtube-monetization-policies.txt:120, :126). Fewer than 12 -> FAIL.
G6 Colony fit. Does a colony product exist that a video could honestly demonstrate?
   (docs/REJECTED.md, "What is NOT rejected"). Yes/no, with the product path.

Fixed statement to include verbatim: "RPM is UNKNOWN until the channel is in the YouTube Partner
Program and our own Analytics reports it. Every plan shows a table at $2 / $5 / $7 / $10 RPM,
never a single figure."

Output: JSON array [{candidate, G1..G6: {verdict, reason, citation}, question_for_auditor}],
then one paragraph: which candidate you would pick, and what evidence would prove you wrong.
```

### 2.2 Prompt 2, VIRAL CONTENT BLUEPRINT

> "For [chosen niche], give me 20 viral video ideas that are relevant in 2025 that I can recreate without showing my face."

**Sound.** Generating many candidate ideas and then filtering them is ordinary practice. YouTube lists "Idea
generation" among the AI uses that need no disclosure [DISC:113].

**False or fabrication-prone.**
- **"Relevant in 2025"** is stale by a year on the day it was posted. An LLM's sense of "relevant now" is its
  training cutoff, so it cannot see trends at all (INFERENCE).
- **"Viral"** cannot be predicted from a prompt. As a goal it pulls toward shock and surprise (INFERENCE).

**Violates.**
- **"Recreate"** invites reused content: "Content uploaded many times by other creators" [MP:196]; "Taking
  someone else's content, making minimal changes … This policy applies even if you have permission" [MP:186];
  "mimics existing formats or stories to a degree that the videos feel interchangeable" [MP:210].
- **"Viral" as the objective** runs into "made for the enjoyment or education of viewers, rather than for the
  sole purpose of getting views" [MP:84] and "appears designed to shock or surprise viewers for the sole purpose
  of getting views" [MP:210].
- **Constraint 7 (INFERENCE from `discovery.md` §1):** a zero-subscriber channel whose owner posts nowhere
  reaches strangers only through search intent or the recommender's choice to test it. "Viral" ideas assume
  distribution the channel does not have. **Search-intent questions are the only route the channel can aim at.**

**Honest rewrite: QUESTION BACKLOG.**

```text
BRIEF P2' - QUESTION BACKLOG
Role: worker (research). Model: opus. Reviewed by: supervisor (de-duplication and evidence check).

Inputs: the chosen topic area (from P1'); our published and queued catalogue (titles + one-line
substance), read from the repo, not from memory; today's date from the system clock.

Task: produce 20 candidate videos. Each is ONE question that a stranger could type into YouTube
search, and that we can answer with substance we produced ourselves.

Hard rules
- Never call anything "trending", "viral" or "hot". You cannot observe trends. Any recency claim
  needs a dated primary source.
- No idea whose core is an existing video, article, thread or story to be retold, reacted to or
  compiled (youtube-monetization-policies.txt:144, :196, :204).
- No shock, fear, outrage or "you won't believe" framing (:210, :234-240).
- No advice in sensitive topics (:244-252).

Evidence required per idea (drop, do not flag, any idea missing (b) or (c))
(a) the question, in the viewer's words;
(b) at least one primary source URL fetched THIS session, and the fact it supplies;
(c) "what we add": the computation, comparison or demonstration that is ours, in one sentence;
(d) the nearest item in OUR catalogue, and why this one is materially different (:120);
(e) the length the substance needs, as a range, with no target length.

Output: a table sorted by (c)'s strength. Put the dropped ideas in a second table with the reason.
```

### 2.3 Prompt 3, SCRIPT WRITER

> "Model [insert viral competitor video] script and generate a new script that is optimized for retention. Model YouTube best practices to ensure the best results."

**Sound.**
- Using conventional *format* is allowed: "Content that showcases your authentic perspective when building on
  a popular video format or theme" [MP:222].
- AI help with scripts is explicitly fine: "using AI to edit your video scripts" [MP:226]. Script help needs no
  disclosure [DISC:107].
- Retention does matter to a video's reach, and YouTube reports it per video (next point).

**Which retention practices YouTube itself documents** *(SNIPPET of YouTube's own help pages. The pages were
not rendered. URLs are in `urlsToRender`)*:

| Practice | YouTube's own wording, per the search summary | Status |
|---|---|---|
| Intro = the share still watching at 30 s | "Intro tells you what percentage of your audience still watched your video after the first 30 seconds"; "Videos that have 50% of the audience or more watching after the 30-second mark can be found in the 'above typical intros' list" | Documented (answer/9314415) |
| **A good intro keeps the title's promise** | Good results "typically indicate that: The content in the first 30 seconds matched the viewer's expectation of the video's thumbnail and title. The content kept the audience interested." | Documented (answer/9314415) |
| Compare against your own baseline | "Typical retention is the engagement that the last 10 of your videos of a similar length have maintained" | Documented (answer/9314415) |
| Read spikes, dips and top moments | "Dips highlight moments in your video that were either skipped or moments where viewers stopped watching" | Documented (answer/9314415) |
| CTR band | "Half of all channels and videos on YouTube have an impressions CTR that can range between 2% and 10%" | Documented (answer/7628154; CODE `discovery.md` §2.1, graded SNIPPET by its author) |
| Viewer satisfaction as the top ranking factor | Cristos Goodrow, blog.youtube (2021) | CODE `discovery.md` §2.1, graded SNIPPET by its author |

**Not documented by YouTube in anything I read:** "hook in the first 3–5 seconds", "pattern interrupt every
N seconds", "open loops", fixed lengths such as "8–12 minutes is optimal", and "end-screen bait". These are
folklore from the growth-tool and course tier. They are **not shown to be false**; one search cannot prove a
negative. Treat each as a hypothesis for our own key-moments report to test. **Where a formula manipulates**
(fake cliffhangers, withheld payoffs, invented urgency), it sits under "relies heavily on emotionally
manipulative formulas" [MP:210] and, in titles and thumbnails, under the Community Guidelines' "Malicious
clickbait" item [CODE `policy.md` §2, graded RENDERED-ARCHIVE (Open Terms Archive) by its author]. **Padding a
script to raise watch time** is what "Unsatisfying" targets [MP:210-216].

**False or fabrication-prone.**
- "Model YouTube best practices" asks an LLM to recite what it absorbed, which is mostly folklore (INFERENCE).
- "Optimized for retention" as the goal, with no measurement loop, is a claim that cannot be checked (INFERENCE).

**Violates.**
- **Getting the competitor's script** means scraping or downloading it. The YouTube Terms bar access "using any
  automated means (such as robots, botnets or scrapers)" and any use "except … as expressly authorized"
  [CODE `policy.md:317-321`, graded RENDERED-ARCHIVE (OTA Terms of Service :118, :120) by its author].
- **Rewriting one video's script** is "Taking someone else's content, making minimal changes, and calling it
  your own" [MP:186]. **Matching its beat structure** is "mimics existing formats or stories to a degree that the
  videos feel interchangeable" [MP:210].
- **Copyright on a close paraphrase: UNKNOWN.** No lawyer is available under the mandate, so the only safe rule
  is that no third-party script is ever an input (INFERENCE).
- **Constitution (`MISSION.md` rule 4):** a script built from facts nobody checked, narrated with confidence,
  deceives viewers. This is the step where the adversarial auditor belongs.

**Honest rewrite: two agents, one auditor.** The researcher builds a dossier. A writer who cannot browse turns
it into a script. An auditor re-derives every claim.

```text
BRIEF P3a' - RESEARCH DOSSIER
Role: worker (research). Model: opus. Must not write the script.
Input: one question from P2'.
Task: build the dossier the script will be written from.
Evidence required
- Numbered source list: URL, retrieval date, sha256 of the fetched text, and the passages used,
  quoted verbatim. Primary sources only (the dataset, the statute, the vendor's own docs, the
  paper). A blog quoting a source is replaced by the source, or marked SECONDARY.
- Our own computation: the script or notebook path, its inputs, and its output files. Charts
  are generated from these outputs (feeds P4').
- A "what we add" paragraph: what this video shows that no single source says.
- Forbidden inputs: any YouTube video transcript; any single article used as the skeleton.
Output: dossier/<video-id>/sources.json, compute/, what-we-add.md.

BRIEF P3b' - SCRIPT FROM DOSSIER
Role: worker (writer). Model: opus. May read ONLY the dossier. No browsing.
Structure rules
1. The first 30 seconds deliver what the title and thumbnail promise. (YouTube's key-moments
   report: a good intro "matched the viewer's expectation of the video's thumbnail and title".)
   Never tease content that is not in the video.
2. No padding. Every paragraph answers part of the question. The length is what the substance
   needs (youtube-monetization-policies.txt:210-216).
3. No fake cliffhangers, no invented urgency, no "stay to the end" (:210).
4. The narrator is not a person: no name, no "as a former X", no first-person claims of
   experience. No advice on health, law, finance or politics (:244-252).
5. No competitor transcript, and no structure copied from any single video. Generic conventions
   (question -> context -> evidence -> answer -> caveats) are allowed.
Evidence required
- Every sentence that states a fact ends with [C#]. claims.json maps C# ->
  {claim, source_id or compute_id, verbatim supporting quote or output value, confidence}.
- A factual sentence without [C#] is rewritten as clearly marked opinion, or deleted.
Output: script.md, claims.json, title.txt, thumbnail-text.txt, description.md. The description
lists the sources and says in plain words how the video was made: AI-written from our research,
synthetic narration, charts generated from our own analysis. This is the "explains how the
creator added to the content" route (:180) and what reviewers read (:96-98).

BRIEF P3c' - ADVERSARIAL FACT-CHECK (auditor)
Role: auditor. Separate agent. It has not seen the writer's or researcher's reasoning.
Model: opus for every script; fable as the release-gate reviewer on the first video and on a
sample afterwards (CLAUDE.md model routing: Fable at the top, never in the fan-out).
Task, per [C#]: re-fetch the source independently (or re-run the computation) and mark it
SUPPORTED / UNSUPPORTED / OVERSTATED / SOURCE-CHANGED.
Also hunt for: factual sentences with no tag; sources that are vendor or course pages;
persona or advice language; a title or thumbnail promise not delivered by 0:30; a substance
overlap with any video already in our catalogue; any real person's name or likeness used in
a way that implies their endorsement.
Verdict: PASS only if there are zero UNSUPPORTED, zero OVERSTATED and zero untagged factual
sentences. Output audit/<video-id>.json. Never edit the script; return it to the writer.
```

### 2.4 Prompt 4, CONTENT GENERATION

> "Provide a list of 10 websites offering free stock footage relevant to my video topic. Then, craft the ideal prompt for generating any missing videoC clips using OpenAI Sora 2."

**Sound.** Visuals are needed, and using AI tools for visuals can be allowed: "generate a unique background
visual for your content" [MP:226].

**False or fabrication-prone.**
- **Sora 2 is gone.** The app was discontinued on 2026-04-26, and the API was due to end on 2026-09-24
  *(SNIPPET: an OpenAI Help Center result titled "What to know about the Sora discontinuation"; The Decoder,
  "OpenAI sets two-stage Sora shutdown with app closing April 2026 and API following in September"; NewsBytes,
  "Sora API shuts down September 24")*. A third-party review adds that new API users could not sign up before
  the shutdown *(CODE-weak: `Chatforest/chatforest.com`, an AI-operated review site)*. **This step cannot be
  run as written.** Whether existing API keys still work today is UNKNOWN. It does not matter, because no brief
  should depend on a tool that is being withdrawn.
- **An LLM-produced "list of 10 free sites"** can include dead sites, wrong licence summaries and sites whose
  terms forbid the use (INFERENCE). A list is not a licence.

**Violates, or risks.**
- **Stock licensing.** Both first-party licence pages returned **403** to the runner
  (`research/rendered/pexels-license.meta.json`, `pixabay-license-summary.meta.json`: `"status": 403`). The
  Pexels API guideline survives only as third-party copies on GitHub: "Whenever you are doing an API request make
  sure to show a prominent link to Pexels … Always credit our photographers when possible" *(CODE, secondary
  copy: `ngandu-dev/pexels` README.md; the same wording appears in `gmgale/BlueSky`, `CaullenOmdahl/pexels-mcp-server`
  and `msmahdinejad/SourceLens` docs/demo/source-research.md)*. That agrees with `research/tiktok/06` §5.1
  (medium-high there). Stock footage also carries no model releases, and it must not show identifiable people
  "in a negative or offensive way" (`docs/REJECTED.md` reason 5, medium grade).
- **YouTube reused content:** popular free clips appear in thousands of videos. That is "Content uploaded many
  times by other creators" [MP:196], and a licence is no defence: "applies even if you have permission" [MP:186].
  Stock footage is defensible only as B-roll under narration with real substance (INFERENCE, as in `policy.md` §1.3).
- **Photoreal AI clips must be disclosed** when content "Generates a realistic scene that didn't actually occur"
  [DISC:71], and this includes "AI generated extra footage of a real place" [DISC:133]. AI-generated **music** must
  also be disclosed [DISC:131]. C2PA-bearing files are auto-labelled, and that label "can not be adjusted"
  [DISC:181, :189]. Sora outputs carried C2PA *(CODE: `storytold/artcraft`
  `crates/lib/video_info/src/sora_info.rs`, cited in `research/colony-sweep/scouts/licensing-ip--ai-output-rights.md:236`)*.
  Stripping C2PA to dodge the label is disclosure evasion [DISC:193] and deception under `MISSION.md` rule 4.
- **"Stitch together unrelated or inconsistent AI clips"** [MP:238] and "realistic visuals tricking viewers"
  [MP:240] are named as not monetizable.

**Honest rewrite: VISUALS WE MAKE.** Charts made from our own computation fix three problems at once. There is
no licence exposure. Non-realistic AI output needs no mandatory disclosure [DISC:87]. And the charts show "the
creator's original, authentic insights" [MP:140] instead of asserting them. The checkpoint says the main thread
has already rendered a 1920×1080 video from original charts with no Pexels *(CODE `logs/CHECKPOINT.md:21-25`;
I did not read that PR)*.

```text
BRIEF P4' - VISUALS WE MAKE
Role: worker (render). Model: opus. Reviewed by: supervisor (asset manifest). Read by: the
publication gate.
Order of preference
1. Generated from our own computation: charts, maps, diagrams, animated data, text cards,
   screen recordings of our own tools.
2. Non-photorealistic generated illustration (no mandatory AI label, per
   youtube-altered-synthetic-disclosure.txt:87; disclose in the description anyway).
3. Stock footage ONLY from a source whose licence page is RENDERED in research/rendered/ with a
   sha256. Today that is none (Pexels and Pixabay return 403), so stock is not used.
4. Photorealistic AI video: NOT used in the test.
Forbidden: Sora 2 (discontinued); any generator whose terms are not rendered; stripping C2PA or
watermarks; real people's likeness or voice; identifiable people under narration about
hardship, illness, crime or money; one visual template or one music bed across all videos
(Community Guidelines spam item 6 example - research/faceless-youtube/scouts/policy.md:182).
Evidence required: asset_manifest.json per video, one row per asset: {id, origin: own|generated|stock,
generator+version or source URL, licence snapshot path + sha256, credit string, identifiable_person,
realistic, ai_generated, ai_music}. The AI-use disclosure flag is COMPUTED from this manifest by
code (realistic AND ai_generated, or ai_music -> "AI use: Yes"). The writer does not choose it.
```

### 2.5 Prompt 5, CONTENT CALENDAR

> "Build me a 30-day content calendar for my YouTube channel, optimized for engagement, fast monetization. and growth."

**Sound.** Planning a sequence of related videos is fine. "Similar content, like a series … in which each video
has a distinct storyline, focus, or concept" is allowed [MP:126].

**False or fabrication-prone.**
- **"Fast monetization"** is false as a premise (see §2.6).
- **"Optimized for engagement"** has no measurement behind it on day 1 (INFERENCE).

**Violates, or risks.**
- **A daily calendar filled by the same prompt chain is the "mass-produced" pattern.** The policy says "Not be
  mass-produced, generic, repetitive, or manipulative" [MP:84]. It bars "AI-generated content made with generic
  or unoriginal templates giving the impression of mass production" [MP:140], and "content that may feel
  repetitive to viewers after watching several videos in a row" [MP:114]. The Community Guidelines spam item 6
  bars "Using automated tools or AI to churn out high volumes of similar content with minimal changes" [CODE
  `policy.md:182`, graded RENDERED-ARCHIVE by its author]. **No numeric threshold is published**, so a "safe"
  daily number is UNKNOWN. The risk grows with volume (INFERENCE).
- **The first videos are the application.** Reviewers focus on "Main theme · Most viewed videos · Newest videos"
  [MP:86-94]. Thirty rushed videos are what gets reviewed.
- **A fixed schedule** is a cluster signal *(CODE `docs/REJECTED.md` reason 3, SNIPPET-graded there)*. For one
  channel the risk is lower, but a fixed schedule costs nothing to avoid.
- **"Optimized for engagement"** tends toward engagement bait. The policy says "creators should not artificially
  inflate a channel's engagement" [MP:296].

**What cadence is defensible.** The pace is whatever the publication gate (§3.2) lets through, with an upper
limit. For the constraint-7 test, the sibling's pre-registered design is **6 long-form videos over about 4
weeks, at irregular times, observed for 8 weeks** [CODE `discovery.md:61`, §6.2; its author says the number 6 is
judgment, not a measured optimum]. I endorse it. I add one colony rule of our own, **not** a YouTube threshold:
**no more than 2 uploads in any 7 days during the test** (INFERENCE). That is a hard limit above the planned
pace, so a backlog cannot turn into a burst.

```text
BRIEF P5' - GATED PUBLICATION QUEUE (replaces the calendar)
Role: director owns the queue. The supervisor enforces the rules. The board pre-registers the test.
There is no calendar. A video enters the queue only with a PASS from the publication gate (§3.2).
Before upload 1: commit the test design and kill gates K1-K4 from
research/faceless-youtube/scouts/discovery.md §6.2-6.3 to the repo, and create the Reporting API
jobs. Never edit either afterwards.
Rules
- Test: 6 long-form videos in ~4 weeks, at irregular times; never more than 2 in any 7 days.
- Never publish because a date arrived. Never auto-generate Shorts from the long-form videos.
- No engagement bait, sub4sub, pods, bought views, or colony or owner views of our own videos
  (youtube-monetization-policies.txt:296; ToS per discovery.md §6.4).
- Never delete a video to hide a problem after it gathered engagement (:296).
Evidence required: queue.json {video_id, gate_verdict_id, audit_id, uploaded_at}. Test readouts
are recomputed by code from the raw Reporting API CSVs stored in the repo (MISSION rule 3). A
hand-typed metric is invalid.
```

### 2.6 Prompt 6, MONETIZATION MAP

> "List 5 steps on how to get my YouTube channel monetized in the next 30 days. Include placed advertisements that I can run on my channel as well."

**Sound.** Mapping the path to payment early is right. So is adding sources beyond AdSense.

**False.**
- **"Monetized in 30 days" is false as a plan.** It needs 1,000 subscribers plus 4,000 public watch hours in 12
  months, which rises to 8,000 hours for new applicants from 2027-02-01. Then a review follows, reportedly about
  30 days *(SNIPPET, several outlets; CODE `monetization-gates.md:15-34, :261-267`)*. The sibling's best case for
  the first wire is about **mid-May 2027**. Its realistic case is 10–14+ months, or never [CODE
  `monetization-gates.md` §6, INFERENCE].
- **Even monetized on day 1, cash lags by weeks.** Earnings are finalised "Between the 7th–12th of the month"
  [PAY:86-88]. The balance must reach the threshold "On the 20th" [PAY:98-102]. Payment is issued "Between the
  21st–26th" [PAY:110-112], and a wire can take "up to 15 business days" [PAY:122]. Violations can hold payments
  for up to 90 days [MP:318-320].
- **Monetized is not income.** A channel just past the new gate earns about **₪170–260/month at $7 RPM**. The
  target needs about **772,000 monetized views a month at $7** (₪20,000 ≈ $5,405 at 3.7 ILS/USD) [CODE
  `discovery.md` §6.5, `monetization-gates.md` §6; INFERENCE on unverified RPM].

**"Placed advertisements", both readings.**
- *Ads or sponsorships on our videos.* YouTube ads need YPP. Creator Partnerships (formerly BrandConnect) needs
  YPP and an eligible country, and Israel is not named in any snippet [CODE `monetization-gates.md:72-77`,
  SNIPPET there]. Direct sponsorships are negotiations signed by the payee, and "The owner does not talk to
  customers" (`MISSION.md` rule 1). Sponsorships are allowed only as permitted by YouTube's advertising policies
  "(such as compliant product placements)" [CODE `policy.md:339`, graded RENDERED-ARCHIVE by its author]. The
  disclosure mechanics for paid promotion were not rendered: UNKNOWN. **Affiliate links** are the only form that
  works from day 1. They need a rail that pays Israel and an honest disclosure, and with no traffic they are
  worth ₪0 [CODE `monetization-gates.md:281-289`].
- *Buying ads to grow the channel.* Paid acquisition is rejected on portfolio arithmetic (`MISSION.md`
  constraint 7), and the ₪200 float is not working capital (`MISSION.md`, budget section). Whether promoted
  views count toward YPP watch hours is UNKNOWN. **Either way, not in the plan.**

**Violates.** `MISSION.md` rule 2: only a finalised payment with a platform transaction id counts. "Estimated
revenue" in Studio is not money. What reference an AdSense payment carries is UNKNOWN: the rendered page shows
only the FAQ title "Does AdSense provide an invoice or payment receipt?"
[RENDERED research/rendered/adsense-payment-7164703.txt:142].

```text
BRIEF P6' - MONEY PATH (replaces "monetized in 30 days")
Role: board decision (model: fable - deciding where money goes). The supervisor recomputes from
the ledger; the auditor re-derives.
Task: write the path from zero to the first ledger entry using only RENDERED or explicitly
graded sources: YPP thresholds (with source and grade; note the 2027-02-01 change), review,
the AdSense for YOUTUBE payment cycle (youtube-ypp-payout.txt:86-122), the US tax form, and the
owner's steps - taken from docs/OWNER_STEPS.he.md and the sibling upload-automation.md §8.1,
never newly invented.
Hard rules
- No promise of the form "monetized in N days".
- No paid promotion of the channel. No sponsorship that needs the owner to negotiate or sign.
  Affiliate links only on a rail verified to pay Israel, with a plain disclosure in the
  description.
- Arithmetic only on MEASURED views from the test: show ILS/month at $2/$5/$7/$10 RPM, and
  views needed for ILS 20,000 (= $5,405 at 3.7 ILS/USD).
- Ledger: only a finalised AdSense payment, recorded with its platform reference, counts.
  Studio "estimated revenue" never enters the ledger.
Output: money-path.md with every figure graded, and an explicit list of UNKNOWNs.
```

---

## 3. The honest six steps on the chain of command

### 3.1 Who does what

Role names and mandates are from `src/revenue/org.ts:29-139` and `docs/CHAIN_OF_COMMAND.md` (CODE). Model tiers
follow `CLAUDE.md` "Model routing rule" (CODE).

| Step | Worker (opus) | Supervisor check | Adversarial auditor | Board |
|---|---|---|---|---|
| **0. Register the line as a test** | — | — | — | **Before anything is built:** name the acquisition channel (YouTube search + recommender exploration, measured as impressions by traffic source; `discovery.md` §1); name the non-public input (own computation; constraint 8); commit the K1–K4 gates; write the rationale for the long build grace (§3.3). **Model: fable.** |
| **1. Niche screen** (P1') | researcher | Every number has a source and a grade; G1–G6 applied in order | **Yes, fable.** Tries to break the chosen niche: is it secretly a sensitive topic, and is the "own input" really ours? The choice binds the owner's one monetization identity [MP:286-288] | Approves one niche |
| **2. Question backlog** (P2') | researcher | De-duplication against the catalogue; drops ideas without (b) or (c) | Sampled only; cheap to be wrong here | — |
| **3. Dossier → script** (P3a'/P3b') | researcher, then a *different* writer | Structure rules 1–5; the claim table is complete | **Yes, every script.** The P3c' fact-check, run by an independent agent (opus), is the gate. **Fable** reviews the first video and a sample after that | — |
| **4. Visuals** (P4') | renderer | Asset manifest complete; no forbidden origin; disclosure flag computed | Auditor recomputes the disclosure flag from the manifest | — |
| **5. Publication queue** (P5') | uploader (or the owner's manual upload, per `upload-automation.md`) | Spacing rule; nothing uploads without a gate PASS | — | — |
| **6. Money path** (P6') | — | Recomputes from the ledger, never from the director's report | Weekly: re-derives readouts from the raw CSVs; checks that no Studio estimate is in the ledger | Go or kill on K1–K4, then on the YPP application. **Model: fable** |
| Chief auditor | — | — | Monthly: were all audits done, and was every flag acted on? | — |

**Separation of duties (CODE `docs/CHAIN_OF_COMMAND.md`; INFERENCE for the application here).** The
researcher never writes the script. The writer never browses. The fact-checker never edits. The director never
marks a gate PASS. That is the colony's rule "the reviewer never builds", applied to content.

### 3.2 The gate that blocks publication

This is a **code-checked manifest per video**, recomputable by the auditor, like `src/revenue/rules.ts`. Any
FAIL means no upload. INFERENCE: the design is mine, and each item cites the rule it enforces.

| # | Check | Pass condition | Rule it enforces |
|---|---|---|---|
| 1 | Fact-check | `audit/<id>.json` verdict PASS: zero UNSUPPORTED, zero OVERSTATED, zero untagged facts | `MISSION.md` rule 4; [MP:240] |
| 2 | No persona, no sensitive advice | Auditor's persona/advice scan is clean | [MP:244-252] |
| 3 | Promise kept | The title/thumbnail promise appears in the script before 0:30 | YouTube key-moments guidance (SNIPPET); Community Guidelines clickbait item (CODE `policy.md`) |
| 4 | Materially varied | The nearest catalogue item is named, and the difference is substantive | [MP:114, :120, :130] |
| 5 | Own substance | `what-we-add.md` exists and points to a computation output | [MP:140, :204]; constraint 8 |
| 6 | Assets clean | Every asset row is complete; no stock without a rendered licence; no Sora; no real likeness | [MP:196, :238, :240]; `REJECTED.md` reason 5 |
| 7 | Disclosure | The AI-use flag is computed from the manifest; the description says how the video was made and lists sources | [DISC:63-71, :131-133, :157, :193]; [MP:180] |
| 8 | Anonymity | No owner name or identifier anywhere in title, description, tags, file metadata or channel | `MISSION.md`, anonymous-publishing section |
| 9 | Pace | ≤2 uploads in the trailing 7 days (test rule) | [MP:84]; CG spam item 6 (CODE `policy.md:182`) |
| 10 | Policy freshness | The render-watch hash for `youtube-monetization-policies` is unchanged since the last compliance review, or the review was re-run | `policy.md` §3: the page banner missed both 2026 rewrites |

### 3.3 A structural mismatch in the colony's own rules

- `src/revenue/types.ts:213-215` sets `graceDays: 45`, `buildGraceDays: 30` and `killFloorAgorot: 50_000`
  (₪500 per 30 days). `rules.ts:62-67` escalates any line still `building` after 30 days with no revenue.
  `rules.ts:77-81` kills a live line under ₪500 per 30 days after 45 days live (CODE).
- The best case for first money here is about 7.5 months, and the realistic case is 10–14+ months or never
  (sibling, INFERENCE). A channel at the threshold earns about ₪170–260/month, below the kill floor.
- **So if this is registered as a revenue line, the rules will escalate it at day 30 and would kill it about 45
  days after its first payment.** The honest framing is the one the sibling designed: a **measurement of
  constraint 7** with its own kill gates (K1–K4, `discovery.md` §6.3), filed by the board with a written
  rationale. That is `MISSION.md` rule 5 ("Lines that do not earn are killed on their stated terms") applied
  honestly. It is not an exception to rule 5 (INFERENCE).

---

## 4. What this changes relative to `docs/REJECTED.md` (2026-09-03)

- **The reopen trigger had three legs** (CODE `docs/REJECTED.md`, faceless section, "What would reopen it"):
  1. "A platform paying Israel for content this pipeline can legally and honestly produce": YouTube
     YPP/AdSense, with Israel eligible at **SNIPPET** grade only (`monetization-gates.md` §0.1). **The second
     half of that leg decides the question.** The reel's six prompts do *not* produce such content (§2). The
     rewrites might.
  2. "Hebrew RTL support that works": **moot** for an English channel.
  3. "A TTS licence that permits commercial use": the checkpoint records a local Kokoro-82M engine (weights
     Apache-2.0, `kokoro-onnx` MIT) added to the MoneyPrinterTurbo fork *(CODE `logs/CHECKPOINT.md:21-25`; I did
     not read the licences or the PR myself)*.
- **So the reel's variant differs from the rejected one in a way that matters only if all six prompts are
  replaced.** English, long-form and one channel remove the TikTok and Hebrew reasons (1 and part of 5). They do
  **not** touch reason 2 (policy), which has tightened since 3.9 (`policy.md` §3). Reason 4 (Shorts arithmetic)
  becomes long-form arithmetic, which still misses the target by roughly 75–115× at the threshold
  (`discovery.md` §6.5, INFERENCE).
- **New since 3.9 and found here:** the reel's visual tool no longer exists, and the one retention practice
  YouTube documents is "keep the title's promise in the first 30 seconds". Both are small facts. Together they
  mark the reel as recycled folklore, and they show that the honest version and the platform's documented
  version point the same way.

---

## 5. What I could not verify

1. **The Sora shutdown, first-party.** I saw only the OpenAI Help Center *title* plus independent outlets
   (SNIPPET) and an AI-written review (CODE-weak). Whether existing API keys still work on 2026-09-25 is
   UNKNOWN. URL listed for rendering.
2. **YouTube's key-moments and content-performance pages**: search summaries of first-party pages, not rendered.
3. **The retention folklore list** in §2.3 is "not documented in anything I read". One search cannot prove
   YouTube never says it. Circulating claims I did not check, such as a minimum length for mid-roll ads, stay
   UNKNOWN.
4. **Pexels and Pixabay licence text, first-party.** Both returned 403 to the runner. I have only GitHub copies
   of the Pexels API guideline (CODE, secondary) and the repo's medium-grade summaries.
5. **Whether `gptprompts.ai` sells a paid tier**, and whether this carousel is the 22.9 reel: UNKNOWN.
6. **Whether promoted (paid) views count toward YPP watch hours**, and how paid-promotion disclosure works on
   YouTube: UNKNOWN, not rendered.
7. **What reference an AdSense payment carries** for the ledger's external id: UNKNOWN (FAQ title only,
   `adsense-payment-7164703.txt:142`).
8. **The Kokoro licences**: taken from the checkpoint, not read by me.
9. **Whether an unattended agent can be "the creator"** whose "original, authentic insights" [MP:140] the policy
   requires: open, as in `policy.md` §5. No rewrite can close it. They can only make the channel's own analysis
   visible.
10. **Copyright on a close paraphrase of a competitor script**: UNKNOWN. The rewrite avoids the question by never
    using one as input.
11. **Every RPM figure**: none is rendered anywhere in this reassessment (`rpm-evidence.md` §0.1).

---

## 6. Sources

**RENDERED** (YouTube and Google pages fetched by `render-watch.yml`, 2026-09-25):
- `research/rendered/youtube-monetization-policies.txt`: https://support.google.com/youtube/answer/1311392
  (lines 62, 80-98, 114-140, 144-204, 210-252, 286-296, 318-330)
- `research/rendered/youtube-altered-synthetic-disclosure.txt`: https://support.google.com/youtube/answer/14328491
  (lines 63-71, 83-115, 131-133, 157, 173-193)
- `research/rendered/youtube-ypp-payout.txt`: https://support.google.com/youtube/answer/14728151 (lines 86-126)
- `research/rendered/adsense-payment-7164703.txt`: https://support.google.com/adsense/answer/7164703 (line 142)
- `research/rendered/pexels-license.meta.json`, `pexels-api-docs.meta.json`, `pixabay-license-summary.meta.json`: status 403

**CODE (this repo):** `MISSION.md`; `CLAUDE.md` (model routing); `docs/REJECTED.md` (faceless section);
`docs/CHAIN_OF_COMMAND.md`; `src/revenue/org.ts:29-139`; `src/revenue/rules.ts:62-81`;
`src/revenue/types.ts:213-215`; `logs/CHECKPOINT.md:21-31`; `research/faceless-youtube/00-owner-reel-2026-09-25.md`;
`research/tiktok/06-faceless-video-tooling.md` §3.2, §3.5, §5, §6, §9;
`research/colony-sweep/scouts/licensing-ip--ai-output-rights.md:230-245`;
`research/colony-sweep/audits/content-seo.md:195-199`; sibling scouts `policy.md`, `discovery.md`,
`rpm-evidence.md`, `monetization-gates.md`, `upload-automation.md` (each finding keeps its author's grade).

**CODE (third-party, GitHub; secondary copies):**
- `ngandu-dev/pexels` README.md; `gmgale/BlueSky` README.md; `CaullenOmdahl/pexels-mcp-server` README.md;
  `msmahdinejad/SourceLens` docs/demo/source-research.md. These are Pexels API guideline copies, found with GitHub
  code search for "show a prominent link to Pexels".
- `Chatforest/chatforest.com` content/reviews/sora-2-openai-video-generation-discontinued.md at `18dd345`
  (downloaded from raw.githubusercontent.com, sha256 `dee28b19…2e17c8`, dated 2026-05-11). **An AI-operated
  review site. It sells nothing visible, but it is weak evidence and is used only as corroboration.** It cites
  https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation and
  https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/.
  Its API prices ($0.10/s at 720p, etc.) are not used for anything.

**SNIPPET (2 searches):**
- Search 1: https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation (OpenAI,
  first-party title) · https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/
  (independent AI news) · https://www.newsbytesapp.com/news/science/sora-api-shuts-down-september-24-what-users-should-do/story
  (independent news) · https://futurumgroup.com/insights/openai-sora-discontinuation-what-the-end-of-a-platform-means-for-enterprise-ai-strategy/
  (analyst firm, sells research) · https://help.apiyi.com/en/sora-2-api-shutdown-alternatives-2026-en.html
  (**API reseller, sells alternatives**) · https://arboraistudio.com/blog/why-is-openai-shutting-down-sora-the-shift-to-ai-agents/
  (vendor blog) · https://techjournal.org/what-happened-to-sora-openai-shutdown ·
  https://en.wikipedia.org/wiki/2026_in_artificial_intelligence
- Search 2 (limited to support.google.com and blog.youtube, so YouTube's own pages only):
  https://support.google.com/youtube/answer/9314415?hl=en&co=GENIE.Platform%3DDesktop (key moments; the source
  of every retention quote) · https://support.google.com/youtube/answer/16559650?hl=en ·
  https://support.google.com/youtube/answer/12942217?hl=en&co=YOUTUBE._YTVideoType%3Dvideo ·
  https://blog.youtube/creator-and-artist-stories/master-these-4-metrics/ ·
  https://support.google.com/youtube/answer/12220281

---

## 7. For whoever runs Workflow 2

- Run P1' → P6' in order, and **do not skip P3c'**. The fact-check is the only step that stands between a
  confident script and a deceived viewer.
- The pilot render uses P4' origin 1 only (own charts), as the checkpoint says has already been done.
- Nothing is uploaded publicly until the board has filed step 0 and the owner's one-time steps are done. Those
  steps are the siblings' list, not a new one.

## 8. Search log

| # | Query | Why | Result |
|---|---|---|---|
| 1 | `OpenAI Sora discontinuation API shutdown September 24 2026` | A GitHub review said Sora was "discontinued"; that decides whether prompt 4 can run at all | Corroborated by the OpenAI Help Center title plus independent outlets |
| 2 | `YouTube Help audience retention key moments intro typical retention first 30 seconds` (domains: support.google.com, blog.youtube) | Prompt 3: separate the retention practices YouTube documents from folklore | First-party key-moments wording (intro at 30 s, ≥50% above typical, promise match) |

GitHub code searches (not WebSearch): four queries, for the Pexels guideline copies and Sora C2PA/pricing. One
file was downloaded from raw.githubusercontent.com.
