# AUDIT: prompt-critique (scout report `research/faceless-youtube/scouts/prompt-critique.md`)

**Date:** 2026-09-25. **Auditor tier:** Opus. Separation of duties: I checked the report and built nothing.
**Search budget:** 4 allowed, **2 used** (log in §7). I also made two WebFetch attempts, both EGRESS_BLOCKED and not
retried (blog.youtube, promptspro.gumroad.com). Four raw.githubusercontent.com fetches cost no search budget
(openai-python `videos.py` and `CHANGELOG.md`, `hexgrad/kokoro` README, `thewh1teagle/kokoro-onnx` LICENSE).
**Grades:** RENDERED = primary page text I read in `research/rendered/`. CODE = a repo file or a GitHub file I read
myself. SNIPPET = a search-engine summary, which is weaker. INFERENCE = my own reasoning. UNKNOWN = not established.
**Read in full:** the scout report (671 lines), the owner-reel transcription, `MISSION.md`, the faceless section of
`docs/REJECTED.md`, `youtube-monetization-policies.txt:55-372`, `youtube-altered-synthetic-disclosure.txt:55-199`,
`youtube-ypp-payout.txt:60-140`, `src/revenue/{types,rules}.ts` and the `heartbeat.ts` call sites. I also read the
sibling audits of `monetization-gates`, `rpm-evidence`, `policy`, `discovery` and `upload-automation`. Four of
those five audits were already on disk, and the scout does not cite any of them.

---

## 0. Verdict

> **The scout's direction holds. Several of its load-bearing claims overreach.** The reel's prompts should not be
> run as written, and "monetized in 30 days" is not a plan. I opened every rendered line the scout cites, and the
> quotes are verbatim. The overreach is in how the rules are applied to each prompt: the rule text is RENDERED, but
> the step from rule to prompt is INFERENCE. At four points the report says more than the evidence supports:
>
> 1. **Prompt 4 → "not monetizable" is contradicted by a rendered line the scout left out.** "Disclosing AI content
>    won't limit a video's audience or impact its eligibility to earn money" [RENDERED
>    youtube-altered-synthetic-disclosure.txt:173]. "Deceptive imagery" [MP:240] means "realistic visuals tricking
>    viewers into believing a fake celebrity death or natural disaster". Filler b-roll is not that. The scout's
>    structured claim 1 therefore lists something the policy says is fine.
> 2. **The AI-persona claim (claim 2) repeats an error three sibling audits had already cut.** The rule covers
>    "content that presents itself as a human expert providing advice" [MP:244]. It does not cover every
>    AI-narrated video in a finance niche. The scout's own cited range, `rpm-evidence.md:19-40`, says at lines 30-33
>    that software/SaaS, tech and business documentaries clear both filters. `logs/CHECKPOINT.md:26-28` carries the
>    same overclaim ("בדיוק הנישות של RPM>$7").
> 3. **"Hook formulas are not in YouTube's own text" is refuted.** YouTube's own blog has posts titled "Four tips to
>    hook your viewers on YouTube" and "YouTube Creator Playbook tips: the first 15 seconds". The summary relays the
>    advice "start with a question", "use a cold opening" and "tease the content" (SNIPPET, search 1). Hooks are
>    documented by YouTube. What remains undocumented in anything read is pattern interrupts and fixed lengths.
> 4. **The honest rewrite carries three defects that would be locked in at step 0:**
>    - **(a)** P5' pre-registers K1-K4 from `discovery.md` "never edit afterwards". The discovery audit found K2
>      points the wrong way on Browse and K1 is a half-strength revenue gate.
>    - **(b)** Step 0 names "own computation" as the constraint-8 input. Computation over public data is public by
>      MISSION's own definition. The shape that qualifies for a channel is accumulated platform history.
>    - **(c)** The "pre-registered test with a written board rationale" has no code path. `decideLine` uses one
>      global policy, and `killCriteria` is prose.
>
> **What survives unchanged:**
> - Sora's API shutdown. It is stronger than the scout graded it: first-party CODE, openai-python.
> - The payout-cycle arithmetic, re-derived.
> - The colony-rules conflict, re-derived from code.
> - The warning about competitor transcripts.
> - The weight the carousel deserves: near zero as evidence, useful only as a list of headings.
>
> **Net effect on the decision:** nothing here makes the reel's prompts runnable, and nothing turns the line into
> income. Two angles the scout did not weigh could change *which* test runs first (§3, angles 4 and 7):
> - The owner's per-video upload confirmation, which the mandate forbids.
> - An English **web** property carrying the same honest substance, with no YPP identity exposure.

---

## 1. Claim-by-claim

| # | Scout claim (short) | LB | Verdict | Why |
|---|---|---|---|---|
| 1 | As written, the six prompts produce content the monetization page names as not monetizable: persona (P1), reused/copied (P2-3), photoreal-AI disclosure + deceptive imagery (P4), mass-produced (P5). English/long-form/one channel doesn't rescue them | yes | **WEAKENED** | The rule quotes are verbatim [MP:84, :114, :140, :186, :196, :210, :238-252; DISC:63-71, :131-133]. The mapping is INFERENCE and fails for three prompts. **P1** returns a list of niches, not content, and asks for no persona (00-owner-reel:30). **P4**: disclosure is explicitly *not* a monetization bar [DISC:173]. :240 needs deception about a real-world event, and prompt 4 asks for missing b-roll. What P4 does risk is stock clips "uploaded many times by other creators" [MP:196] and incoherent AI stitching [MP:238] *if used that way*. **P5** never says "daily" (00-owner-reel:42). "Daily" comes from the transcriber's summary line (:50). A 30-day calendar holding 6 videos is the scout's own rewrite. Only **P3** ("Model [competitor] script") maps directly, to :186 and :210. P2's "recreate" *invites* :186 and :210 but does not require them, and :222 allows "building on a popular video format or theme". The conclusion "don't run as written" holds for other reasons: P1 and P6 ask an LLM for facts it cannot observe (MISSION: "a number from another model is a number from a model"), and P3 is copying. |
| 2 | RPM>$7 picks finance/health/legal; there, "channels that use AI personas... will not be allowed to monetize"; podcast-host example | yes | **WEAKENED** | The ellipsis drops the operative sentence: "This includes any content that **presents itself as a human expert providing advice**" [MP:244]. All three examples are characters: an AI "doctor", podcast hosts and AI personas [:248-252]. A disclosed, unnamed narrator of a data explainer that gives no advice is not named. The scout's cited source says what survives both filters: "software/SaaS tutorials, tech explainers and business case-study documentaries" [CODE rpm-evidence.md:30-33, inside the range the scout cites]. The `monetization-gates`, `rpm-evidence` and `policy` audits each cut this claim independently. The scout's own brief (G1 = "advice", P3b' rule 4) is already scoped correctly. The structured claim is not. |
| 3 | LLM can't supply RPM; figures SEO-tier; repo's "$25-45 finance" probably a CPM; competition can't be measured legitimately (Data API derived-metrics ban) | no | **WEAKENED** (minor) | The sibling wrote "*may* be a CPM" (low confidence). "Probably" is an upgrade, as the rpm-evidence audit already flagged (audits/rpm-evidence.md:93-94). "Cannot legitimately" is too broad. Derived metrics are open to **audited** developers since June 2026 [CODE discovery.md:49-50, RENDERED-ARCHIVE there]. The accurate wording is "not by an unaudited colony, before publishing". After publishing, per-video YouTube search terms are available as Authorized Data (audits/discovery.md:76). |
| 4 | Sora 2 discontinued: app closed 2026-04-26, API scheduled to end 2026-09-24; P4 can't run; carousel is recycled | yes | **UPHELD**, under-graded | I fetched openai-python `main` myself. `src/openai/resources/videos.py` carries `@typing_extensions.deprecated("The Sora API is scheduled to permanently shut down on September 24, 2026.")` 24 times (sync + async; sha256 prefix `91689eac4c62dc6b`). CHANGELOG v3.1.0 (2026-08-14): "**api:** deprecate Sora video APIs (#3610)". That is **CODE, first-party**, and the sibling `production-stack.md:303` already had it. The app date is still SNIPPET. Two caveats. "Scheduled" is not proof that it went dark on 9-24. The API was still live on the posting day (~9-20). "Recycled" therefore rests mostly on "relevant in 2025", not on Sora. And Sora's death does not change the decision: the prompt swaps to any other generator in one word. |
| 5 | Only retention practice documented by YouTube: 30-s intro metric, ≥50% "above typical", promise match; hook/pattern-interrupt/open-loop formulas not in YouTube's text | no | **REFUTED** (hook part) | Search 1 (limited to support.google.com and blog.youtube) returned YouTube's own posts "Four tips to hook your viewers on YouTube" and "YouTube Creator Playbook tips: the first 15 seconds". The summary relays: start with a question, tell viewers what they'll see, cold open, "Tease the rest of the video so the audience is intrigued" (SNIPPET; blog.youtube is egress-blocked, dates UNKNOWN, possibly Creator-Playbook-era). The 30-second and promise-match items still stand as SNIPPET. The scout's P3b' rule 1 ("never tease content that is not in the video") is consistent with YouTube's advice. Only the "folklore" label on hooks falls. |
| 6 | Getting a competitor's script = scraping (ToS); rewriting = "minimal changes"; rule applies "even if you have permission" | no | **UPHELD** | [MP:186] is verbatim. The ToS lines are RENDERED-ARCHIVE in the sibling (policy.md:317-321). One nit: a human could read a transcript in the UI. For an agent colony, automated access is the only route, so the claim holds. Whether the Data API can return a third party's captions: UNKNOWN (policy.md:320). |
| 7 | Stock can't pass a licence gate (Pexels/Pixabay 403); Pexels guideline only via GitHub copies; photoreal AI + AI music need disclosure; C2PA labels can't be adjusted | no | **UPHELD**, grade mixed | The 403s are real (`pexels-license.meta.json`, `pixabay-license-summary.meta.json`, `pexels-api-docs.meta.json`: status 403, sha256 null). DISC:71, :131, :133, :181 and :189 are verbatim. Grading the whole claim RENDERED is too high: the Pexels guideline is CODE-secondary, and a 403 is metadata, not licence text. "Cannot pass" means *our* gate cannot verify it. It does not mean the licence forbids the use. |
| 8 | "Monetized in 30 days" false: 1,000 subs + 4,000 h (8,000 from 2027-02-01) + review; cycle 7-12th / 21-26th / wire ≤15 bd; best case first wire ~May 2027 | yes | **WEAKENED** | **Re-derived:** the cycle [PAY:86-88, :98-102, :110-112, :122]. 2026-04-26 + 15 business days ≈ 17 May. The core stands, and the random-sample base rate strengthens it: median lifetime views 35, 86.93% of videos under 1,000 (McGrady et al., via audits/discovery.md §0.2). **But:** (a) The claim is graded RENDERED, yet everything that makes "30 days" false is SNIPPET (thresholds, the 2027 change, review length). Only the cash lag is rendered. (b) "About May 2027" is stale. The monetization-gates audit (§1 row 9) adds the API private lock, the PIN by post, and a possible *approval* cut-off before 1 Feb. It puts the scout's own inputs at ~11-25 months, not "10-14+". (c) The rendered page also lists EFT ("up to 7 business days", PAY:116). Which rails reach Israel is UNKNOWN, so "wire" is not a given. |
| 9 | Defensible cadence = what the gate lets through; 6 videos / ~4 weeks irregular; own cap ≤2 per 7 days; no published numeric threshold | no | **UPHELD** (INFERENCE) | No numeric threshold appears on the rendered page (read :60-372). The CG spam item 6 safe harbour, "posting a few variations of a video is ok" (audits/policy.md C3), supports low volume. The ≤2/7-days cap is a colony rule, and the scout labels it as one. |
| 10 | "Placed ads": ads + Creator Partnerships need YPP, Israel not named; sponsorships need owner negotiation (rule 1); affiliate only day-1, ₪0 without traffic; buying ads rejected | no | **UPHELD**, nuance | "Israel not named" is SNIPPET and was graded UNVERIFIABLE by the gates audit. Rule 1 bars the *owner* from talking to customers. Agents could negotiate, but a zero-audience channel has no sponsor demand, so the point is moot. The gates audit also weakened the affiliate rails (CJ is paid via Payoneer, UNKNOWN; not wire). |
| 11 | Colony rules escalate a `building` line at 30 d with no revenue and kill a live line <₪500/30d after 45 d; a threshold channel (₪170-260/mo at $7) would be killed; so file as a pre-registered test with K1-K4 and a written board rationale | yes | **WEAKENED** (remedy), conflict UPHELD | **Code verified:** `graceDays: 45, buildGraceDays: 30, killFloorAgorot: 50_000` [CODE types.ts:233-237; the scout's 213-215 are the interface comments]; escalation [rules.ts:61-69]; kill [rules.ts:74-81]. MISSION rule 2 ("a line becomes `live` when money lands") makes "kill ~45 days after first money" correct. **Re-derived:** 8,000 h/12 = 667 h/mo; ×60/6 to /4 = 6,670-10,005 views; ×$7/1000 = $46.7-70.0; ×3.7 = **₪173-259** ✓. **Cuts:** (a) The figure assumes the 2027 gate. A channel grandfathered at 4,000 h sits at **₪86-130** at the threshold. (b) The kill floor also kills MISSION's "modal audited survivor ₪200-500" (MISSION.md correction box). The mismatch is general, not special to YouTube. (c) **The remedy has no code path.** `runSupervisorReview` passes one global `DecisionPolicy` to every line [heartbeat.ts:184, :196]. `killCriteria` is only rendered into prompts [org.ts:172, :278]. `decideLine` is stateless, so a `building` channel re-escalates at *every* review for 7-25 months. An `experimental` tier also counts against `maxExperiments: 3` [rules.ts:143-155]. A hand-written board rationale that overrides code runs against MISSION rule 3 ("decisions live in code"). (d) The K1-K4 it names are known-defective (§3, angle 2). |
| 12 | The honest rewrite (P1'-P6') removes every disqualifier the policy names; still can't guarantee "clearly inside" (human judgment; failure follows owner to new channels) | yes | **WEAKENED** | It removes most of the *named* ones. It cannot remove the decisive one, and the report says so itself: whether an unattended agent can supply "the creator's original, authentic insights" [MP:140] is "open... No rewrite can close it" (scout §5.9). Also untouched: "if we cannot clearly tell that you made the content" [MP:156], and the template look [MP:114] of one voice, one chart style, one font and one mandated structure (P3b' rule 5) on every video. **The pilot does not yet match the brief.** Its visuals cycle every 5 s and are not synced to the narration [CODE logs/CHECKPOINT.md:24-25], which is close to "image slideshows... with minimal or no narrative" [MP:138]. `production-stack.md:364` calls MoneyPrinterTurbo the wrong tool for this reason. **"Follows the owner" is mis-sourced.** :286 covers egregious behaviour and :288 covers evasion by new channels. The line that supports stickiness is :342 ("suspended or permanently disabled on all or any of your accounts"), which the scout never cites. :348 (reapply) softens it for a rejected application. |
| 13 | Carousel is a comment-for-DM funnel (1,848/269/1,505), shows no outcome, counts for nothing; only the order of headings is kept | no | **UPHELD**, one addition | Search 2 (SNIPPET): @gptprompts.ai has ~609K followers, and its bio offers access to a "1K+ premium prompts ebook". Whether it is paid: UNKNOWN. Two Gumroad packs of "1,015+" prompts citing "578K+" and "220K+" follower accounts appeared in the same results. They are **not** tied to this account and are not claimed. One nit: only slides 2-7 were seen (00-owner-reel:20). "Shows no outcome" holds for the seen slides only. |
| 14 | Reopen trigger: RTL moot for English; TTS addressed by Kokoro (unverified by scout); Israel YPP snippet-only; deciding clause unmet by the reel, maybe met by rewrites | yes | **UPHELD**, with three notes | **TTS leg now CODE-verified by me:** `hexgrad/kokoro` README line 5, "With Apache-licensed weights, Kokoro can be deployed anywhere from production environments to personal projects". `kokoro-onnx` LICENSE: MIT. **Israel YPP is weaker than snippet.** The gates audit's echo test showed the country search repeats whatever countries the query names (audits/monetization-gates.md row 5). **"RTL moot" is a reading, not a fact.** The trigger says "All three, not one" (REJECTED.md). The board should record that it is judging a *new* proposal (English), not declaring the old trigger met. Also, the "What is NOT rejected" section there prefers "captions rather than synthetic narration", and the rewrite narrates with Kokoro. That is not a violation, but it is a departure from the recorded preference and should be stated. |

---

## 2. Grade inflation

1. **Claim 1, graded RENDERED.** The rule text is RENDERED. The prompt-to-rule mapping is INFERENCE. For P4 it is
   contradicted by DISC:173.
2. **Claim 2, graded RENDERED, confidence high.** "RPM>$7 picks finance/health/legal" is INFERENCE from SNIPPET-tier
   RPM tables. The ellipsis in the quote removes the persona and advice condition that limits the rule's scope.
3. **Claim 3.** "May be a CPM" (the sibling, low confidence) became "probably a CPM" here.
4. **Claim 7, graded RENDERED.** The Pexels guideline is CODE-secondary, and a 403 is metadata.
5. **Claim 8, graded RENDERED.** The part that makes "30 days" false is SNIPPET (thresholds, 2027 change, review).
6. **Scout §0.5 and claim 12.** "A failure follows the owner to any new channels" is cited to :286-288, which cover
   egregious behaviour and evasion. The real support is :342, which the scout did not cite.
7. **Scout §7.** "The pilot render uses P4' origin 1 only... as the checkpoint says has already been done." The same
   checkpoint says the pilot's visuals are on a 5-second cycle and not synced to narration. It is not the product
   the brief describes.
8. **Reverse (under-graded).** Claim 4's API date is first-party CODE (openai-python), not SNIPPET.

---

## 3. Angles the scout missed that could change the decision

1. **Constraint 8 is misread in step 0 and P1' G2.** MISSION's price-floor test asks for an input "that is not
   public". A computation over OWID or World Bank data can be recomputed by anyone from the same public inputs. It is
   originality for the *review* [MP:140]. It is not a constraint-8 input. For a channel the qualifying shape is
   shape 1, "accumulated operating history on a platform where history is a ranking input" (MISSION.md; also
   audits/rpm-evidence.md §0.4 and discovery.md §5). Step 0 should name that. Otherwise a board could approve on a
   misreading.
2. **P5' would pre-register known-defective gates.** It orders K1-K4 committed from `discovery.md` §6.2-6.3 and
   "never edit either afterwards". The discovery audit (§0.3-0.4) found two problems. K2 kills on Browse CTR < 2%,
   but Browse CTR falls *because* a video is being widened, so K2 must become a diagnostic. K1 is the old YPP pace at
   half strength, a revenue gate dressed as an exposure gate, and its 28-day arithmetic runs ~8% high. The corrected
   gates must be the ones committed. The same audit's base rate (median 35 lifetime views) moves the expected
   outcome toward "killed".
3. **There is no code path for "a pre-registered test".** See claim 11 (c). Before step 0 means anything, the rules
   need either a per-line `DecisionPolicy` override or a measurement status that `decideLine` understands, and that
   status must be testable by the auditor. Otherwise the supervisor escalates the line every cycle, and the board's
   "hold" is a hand override of code.
4. **The mandate may fail at the upload step, and the chain-of-command table hides it.** Step 5 says "uploader (or
   the owner's manual upload)". Two findings stand against that:
   - A manual Studio upload is recurring manual ops, and the sibling scout says the mandate rules it out
     (`upload-automation.md:334`).
   - The upload-automation audit (§0.1) found that YouTube's Developer Policies III.C.2 ("clearly initiated by the
     user") and III.E.3.f (a user-facing privacy choice) are read by two third-party audit write-ups as forbidding
     unattended scheduled uploads from our own API project.

   The least-involvement route is an audited third-party publisher. Whether its free tier includes API access is
   contested. **The gate that blocks publication needs a named owner action per video, or a verified
   zero-touch route.** Today neither is established. This is a MISSION rule 1 question, not a detail.
5. **Fetch feasibility bounds throughput.** P2' requires sources "fetched THIS session", and P3c' requires an
   independent re-fetch. This container blocks most hosts. Only GitHub-hosted data and the render-watch runner
   work. Two things follow. P3c' needs an explicit "UNFETCHABLE → FAIL" rule, or the gate will quietly pass on
   memory. G2 in practice restricts topics to datasets reachable from GitHub or already rendered. That may leave
   too few to meet G5 ("12 materially different questions").
6. **Portfolio framing.** MISSION's correction box gives ₪1,500 as the best audited line and ₪200-500 as the modal
   survivor. ₪170-260 at the *qualifying floor* sits inside that band. It is not an outlier at "1% of target". The
   rpm-evidence audit's ₪5,000 row (142k-254k views/month at $7-$10) is the decision-relevant bar, not ₪20,000.
   This does not make the line good. It makes the scout's framing harsher than the one applied to other lines.
7. **The same honest substance could ship as an English web property first.** Several sources point the same way:
   - `research/colony-sweep/audits/content-seo.md:194-199`: "An English-language property... the largest hole".
   - `docs/REJECTED.md` ranks "Google/SEO > … > YouTube" for honest distribution.
   - audits/discovery.md §0.5: Search Console gives the same per-URL impressions/CTR measurement.

   A web page with our own charts avoids the YPP review whose failures can reach "all or any of your accounts"
   [MP:342], the API audit and private lock, and the 8,000-hour gate. The scout cites the content-seo file but does
   not compare the two carriers. This could change which constraint-7 test runs first. It needs its own scout on
   ad-network gates, which are Tier-1-traffic gates, so English matters there.
8. **The disclosure flag is inconsistent across siblings.** `production-stack.md:361` sets "AI use: Yes" for the
   whole stack. P4' computes the flag, which gives "No" for charts plus TTS: an infographic is "production
   assistance" [DISC:107]. Over-disclosure costs nothing [DISC:173]. The safer brief rule is "Yes unless the auditor
   shows it is not required". The board should pick one rule.
9. **P6' omits recurring owner work that the gates audit found.** At target income that means עוסק מורשה and
   periodic מע"מ reporting (audits/monetization-gates.md §0.2). It also leaves out the permanent choice of payment
   currency [PAY:176-178 per that audit]. P6' draws owner steps "only from OWNER_STEPS", which does not yet contain
   them.

---

## 4. What I re-derived

- ₪20,000 / 3.7 = $5,405.4. At $7 RPM that is 772,200 views. ✓
- 8,000 h / 12 = 667 h/mo → 6,670-10,005 views (6 / 4 min) → $46.7-70.0 → ₪173-259. ✓ At 4,000 h: ₪86-130.
- 772,000 / 10,005 = 77×; / 6,670 = 116×. The scout's "75-115×" ✓. ₪170-260 / ₪20,000 = 0.85-1.3%. "About 1%" ✓.
- 2026-09-25 → ~2027-05-17 ≈ 7.7 months. The scout's "about 7.5 months" ✓, but the best case is stale (claim 8).
- `DEFAULT_DECISION_POLICY` values, the escalation and kill branches, the global policy in the heartbeat, and
  `killCriteria` being prose: all read in code ✓.
- Sora API date: 24 decorator occurrences in `openai-python` `main` and the CHANGELOG entry at v3.1.0 (2026-08-14) ✓.
- Kokoro weights: Apache (hexgrad/kokoro README:5). kokoro-onnx: MIT ✓.
- Every MP / DISC / PAY line the scout cites was opened. The quotes match. Line-number drift: the scout's
  `types.ts:213-215` holds the interface comments, and the values are at 233-237.

## 5. Corrections to the briefs (what the colony should run instead)

- **P1' G2:** keep "own computation" as the *originality* test for [MP:140]. Add **G2b**: "Name the constraint-8
  input. For a channel that is its accumulated history (shape 1), not the computation." Add **G2c**: "The dataset is
  fetchable from this container or already rendered, with URL and sha256. Otherwise FAIL."
- **P3b' rule 1:** "Hook in the first seconds by stating the question and the promised answer (YouTube's own
  advice: question, preview, cold open). Tease only what is delivered in the video."
- **P3c':** add "A source that cannot be re-fetched → UNSUPPORTED."
- **P4':** the flag is computed, and it defaults to **Yes** unless the auditor records why it is not required.
  Visuals must be aligned to sentences (no timer cycling), per `production-stack.md` §8.
- **P5':** commit the **corrected** gates from `audits/discovery.md` §4, not the scout's K1-K4. Name the per-video
  upload action and who performs it. If that is the owner, stop and escalate under MISSION rule 1.
- **Step 0 (board):** before registering, add a code change: a per-line policy or a measurement status that
  `decideLine` reads, with a test. Also require a written comparison against an English web-property carrier.

## 6. URLs to render (verbatim as seen)

- https://blog.youtube/creator-and-artist-stories/four-tips-to-hook-your-viewers-on/ (search 1). Settles the date
  and wording of YouTube's hook advice.
- https://blog.youtube/news-and-events/this-is-first-of-series-of-posts/ (search 1). "Creator Playbook tips: the first 15 seconds".
- https://support.google.com/youtube/answer/9314415?co=GENIE.Platform%3DDesktop (search 1). Key moments, the source of the 30-second intro metric.
- https://support.google.com/youtube/answer/16559650?hl=en (search 1). Likely source of "intro delivers on the promise made by your thumbnail and title".
- https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation (scout). The app date, first-party.
- https://www.instagram.com/gptprompts.ai/ (search 2). Account bio, the "premium prompts ebook". Instagram is unreadable from here.
- https://promptspro.gumroad.com/l/Ultimate-AI-Prompts-Pack-Instagram (search 2). Only to test whether it is this account's paid pack. Not claimed.

## 7. Search and fetch log

| # | Tool | Query / URL | Result |
|---|---|---|---|
| 1 | WebSearch (support.google.com, blog.youtube) | `YouTube creators hook viewers first 15 seconds audience retention tips` | YouTube Blog "Four tips to hook your viewers on YouTube" and "Creator Playbook tips: the first 15 seconds". This refutes claim 5's hook part (SNIPPET). |
| 2 | WebSearch | `"gptprompts.ai" instagram prompts pack` | ~609K followers; bio offers a "1K+ premium prompts ebook" (SNIPPET) |
| — | WebFetch | blog.youtube four-tips post | EGRESS_BLOCKED, not retried |
| — | WebFetch | promptspro.gumroad.com | EGRESS_BLOCKED, not retried |
| — | curl raw.githubusercontent | openai/openai-python `main`: `src/openai/resources/videos.py`, `CHANGELOG.md` | Sora shutdown decorator ×24; "deprecate Sora video APIs" in v3.1.0 (2026-08-14) |
| — | curl raw.githubusercontent | hexgrad/kokoro README; thewh1teagle/kokoro-onnx LICENSE | Apache-licensed weights; MIT |

Two of four searches were left unspent on purpose. Everything load-bearing that was still open could be settled
from the renders, the code or GitHub.
