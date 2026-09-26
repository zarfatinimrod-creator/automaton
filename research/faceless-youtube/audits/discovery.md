# AUDIT: discovery (scout report `research/faceless-youtube/scouts/discovery.md`)

**Date:** 2026-09-25. **Auditor:** Opus tier. Separation of duties: I checked and built nothing.
**Search budget:** at most 4 WebSearch calls. **I used 4** (log in §7). Context7 documentation queries (4),
`raw.githubusercontent.com` fetches (5) and one WebFetch of github.com did not use the search budget.
**Grades:** RENDERED = primary page text I read (`research/rendered/*`, or the Open Terms Archive copies of YouTube's
legal texts, which I re-downloaded and whose sha256 matches the scout's: ToS `95d3cce0…fef80b`, Developer Terms
`af8ea9ab…ee0784`). DOCS-EXCERPT = Context7 excerpt of developers.google.com, treated as SNIPPET strength.
CODE = a repo file or GitHub file I read. SNIPPET = search-engine summary. INFERENCE = my reasoning. UNKNOWN.

---

## 0. Verdict

> **The scout's two central conclusions stand.** (1) Whether YouTube shows a zero-subscriber channel's video to
> strangers cannot be settled from outside, and it can be measured from inside, on the owner's channel, after one
> OAuth consent. (2) "Low competition" cannot be measured ahead of time by an unaudited colony without breaching
> YouTube's Terms or Developer Policies. I opened every rendered and OTA line it cites. The quotes are verbatim.
>
> **Five findings are wrong or overstated, and three of them change the test design:**
>
> 1. **The one "independent measurement" is not about new channels.** Pew's 2018 random walks *started* from
>    videos on "14,000 English-language channels, each with more than 250,000 subscribers" [SNIPPET, search 3].
>    The scout could not read the method. With that method, "64% of suggestions > 1M views" describes where
>    suggestions go from big-channel starting points. It says nothing either way about a zero-subscriber channel.
> 2. **A survivorship-free base rate exists, and the scout says none does.** McGrady et al. (2023), "Dialing for
>    Videos", drew a random sample of 10,016 public YouTube videos (2022). **Median lifetime views: 35. 65.44%
>    have under 100 views, 86.93% have under 1,000, and 3.67% have over 10,000 but hold 93.61% of all views**
>    [SNIPPET search 1; CODE secondary: `s4mt4r3/YouTube-Random-Sample` `paper_reference.json`, which agrees on
>    every figure except the zero-view share: 4.88% there, 4.68% in the snippet]. This is the prior for "does a
>    stranger find an upload". It covers all uploads (55.8% "People & Blogs"), not effortful channels, so it cannot
>    tell a prior-success gate from quality selection. But it moves the expected outcome of the test towards
>    "killed".
> 3. **K2, the CTR kill, points the wrong way on Browse.** The scout applies YouTube's all-source "half of all
>    channels are between 2% and 10%" band to **Browse + Suggested only**. Browse CTR runs below search CTR, and CTR
>    "will decrease as the video is effectively expanding beyond your core audience" [SNIPPET search 2; wording
>    attributed to YouTube Help in a merged summary, not rendered]. So a video that YouTube starts testing widely on
>    Home can fall under 2% on Browse **because** it is succeeding. K2 must become a diagnostic, not a kill.
> 4. **K1 repeats the error the scout found in its sibling.** K1 is derived from the old YPP watch-hour *pace*
>    at day 56. That is a revenue gate at half strength, not a constraint-7 "was it shown at all" gate. It also
>    misreads 10% as the "top" of typical CTR: "half of channels between 2% and 10%" leaves the other half outside
>    the band, some of it above 10%. And the 28-day arithmetic runs ~8% high (§2).
> 5. **"More measurable than any platform the colony has tried" is false inside this repo.** Google Search
>    Console already gives per-URL impressions, CTR and query for any web property. The repo documents it
>    (`research/colony-sweep/scouts/store-promotion--attribution-without-analytics.md` §5). It has already produced
>    one decisive measurement: a competing Israeli calculator at "0 impressions over 16 months"
>    (`research/colony-sweep/CRITIC-synthesis.md:360`). YouTube reach reports are equally good, not uniquely good.
>
> **Net:** nothing here reopens the 3.9 rejection or argues for building. The scout's framing survives: an
> exploration budget of unknown size, measurable only by publishing. But the base rate makes a pass less likely
> than the scout's even-handed framing implies. The gates need the corrections in §4 before anyone pre-registers
> them. The binding precondition is still `policy.md`, because the test *is* the owner's channel.

---

## 1. Claim-by-claim

| # | Scout claim (short) | Verdict | Why |
|---|---|---|---|
| 1 | No documented hard prior-success gate; staff relayed as saying per-video evaluation, "a slot or two" for new channels, Beaupré "teams dedicated…" | **WEAKENED** | It describes the snippets correctly. But the comparison is **asymmetric by construction**. Gumroad's gate was found by reading open-source code. YouTube's ranker is closed, so "no documented gate" is guaranteed whether or not a gate exists. It is not evidence of openness. My search 4 returned the same vendor tier: vidIQ, TubeBuddy, buffer, dataslayer, hollyland, and nexlev.io, **which sells faceless-channel tooling**. Their line "tests within minutes… 24-48 hours" is guru material. It also surfaced one unrendered first-party URL (support.google.com/youtube/answer/16559651) and the line "YouTube also experiments with new kinds of content from small creators that might fit your interests". Attribution is unclear: it could be that help page. In the structured claim, "YouTube staff are relayed as saying each video is evaluated individually" drops the report's own caveat (§2.1: "Unattributed search summary"). |
| 2 | Pew 2018: 174,117 walks; 64% > 1M views, 5% < 50k; Suggested only; method not read | **WEAKENED** | The figures are corroborated by a second summary (search 3, Tubefilter + Pew; SNIPPET). But the method changes what they mean: each walk "began with a randomized video from one of 14,000 English-language channels, each with more than 250,000 subscribers" [SNIPPET]. Starting inside big-channel territory biases the chain towards popular videos. The study is **uninformative** about zero-subscriber channels. Report §0.2 calls it "the only independent measurement [that] points the other way". It points neither way on the question asked. |
| 3 | The sibling's "same wall" statement is stronger than the evidence; the exploration budget is unmeasured | **UPHELD** | I checked the quote verbatim (`monetization-gates.md:46`, `:327`). The sibling read no ranking code, so "same wall" is a hypothesis. **Addition:** the random-sample base rate (claim 2 / §3.1) shows an outcome distribution that *looks like* a wall for most uploads: median 35 lifetime views, 3.67% of videos holding 93.61% of views. It cannot separate gating on prior success from selection on quality. Both readings predict that most new uploads get almost nobody. |
| 4 | Impressions and CTR per video and per traffic source to the owner, incl. Reporting API reach reports added 2026-01-15; impression = ≥1 s, ≥50%; so constraint 7 is directly measurable "unlike Gumroad, Apify or WordPress.org" | **WEAKENED** | The API facts check out. I re-queried Context7 and got `channel_reach_basic_a1` (date, channel_id, video_id), `channel_reach_combined_a1` (+ `traffic_source_type`, `traffic_source_detail`, OS, device), the Jan 15 2026 revision entry, and the ≥1 s / ≥50% definition [DOCS-EXCERPT]. Two problems remain. **(a)** The comparative has no source for what the other three platforms report, and it ignores Google Search Console, which the repo already uses as a free impressions/CTR/query instrument (store-promotion scout §5; CRITIC-synthesis:360). YouTube is *as* measurable as a web page. It is not more measurable. **(b)** In the API, "Browse" is not its own traffic-source type. `SUBSCRIBER` "identifies views originating from YouTube homepage feeds or subscription features" (Reporting API `traffic_source_type` 3), with detail values including "the general homepage" and "My subscriptions" [DOCS-EXCERPT, revision history 2013-05-03 and 2022-08-26; dimensions page]. The scout's stranger definition ("Browse … exclude Notifications/Subscriber") must be implemented via `traffic_source_detail`. Otherwise it either drops Home or counts subscription-feed impressions as strangers. |
| 5 | ToS forbid automated access except search engines / written permission, and inaccurate engagement measurement incl. paying | **UPHELD** | Verbatim at OTA ToS:120 and :123. The hash matches. "Effective as of December 15, 2023" is at :269. |
| 6 | Developer Policies: no aggregation except same content owner; no business insights; no new/derived metrics ("a score that factors in likes, total views, or any other API Data"); 30-day cap on Non-Authorized stats; derived metrics only for audited applicants from 1 June 2026; so a competition score is off-limits | **UPHELD** (quotes); conclusion is INFERENCE | Every cited line is verbatim: :538, :540, :580, :584, :596, :598, :611-613, :772-774, :1135-1141 (May 4 entry names "custom scores, earnings estimates, suitability scoring"). Three caveats. **(a)** "So a niche competition score is off-limits" is an inference from rendered text, graded as RENDERED. It is a sound inference, and E.2 (:538, other channels' data) carries it even if E.4.h is read narrowly. **(b)** The scout reads E.4.h(ii) literally against competitors' data but never applies it to its **own** gates. "Stranger impressions" summed across sources, "impressions-weighted CTR" and "stranger watch hours" are derived metrics on a literal reading. The E.2 exception is worded for a "content owner … pursuant to content licensing agreement(s)" (a CMS partner), not an ordinary channel. I think own-channel arithmetic kept private is low-risk (INFERENCE), but the report should say it chose that reading. **(c)** Cross-file conflict: `audits/rpm-evidence.md:117-122` proposes counting "recent videos per query and their view and channel sizes" via `search.list`/`videos.list` as "the honest replacement for reel prompt 1". That is aggregation of Non-Authorized data to gain insight into YouTube usage (E.2.2, :540). **This scout's rendered reading should override that audit's angle 4.** |
| 7 | Default quota: 100 search.list/day, 100 videos.insert/day, 10,000 units other | **UPHELD** | [RENDERED youtube-api-quota-cost.txt:169, :173]. |
| 8 | Own Analytics/Reporting data is Authorized Data, storable as long as necessary with 30-day re-authorization | **UPHELD** | :570-578 verbatim. Omitted but harmless: the client "must also verify, every 30 days, that the video has not been deleted" (:578). |
| 9 | Unverified-project uploads locked private; public test needs audited project or audited third party | **UPHELD** | Graded SNIPPET by the scout. `audits/monetization-gates.md` claim 17 already upgraded it to CODE (GitHub READMEs quoting the official page). `upload-automation.md` §6.1 names the third-party route. |
| 10 | YouTube Help: half of channels/videos have CTR 2–10%; new or <100-view videos vary more | **UPHELD** (SNIPPET) | My search 2 returned the same sentence and URL. The sentence is fine. **Its use in claim 14 is not** (see there). |
| 11 | Trends API alpha, by application; YouTube Search property unknown | **UNVERIFIABLE** | Not re-checked: it is not load-bearing and my budget went to load-bearing claims. |
| 12 | 2016 paper: freshness "extremely important"; propagate discoveries made elsewhere via collaborative filtering; suggests search bootstraps | **UPHELD** | Re-fetched: morning-paper `pages/20160919.md:26, :38-40` and chocoluffy `README.md:55-57`, verbatim. Nuance: the "Example Age" freshness feature favours *new uploads* from any channel, not new *channels*. It does not bear on the zero-subscriber question. |
| 13 | No distribution of time-to-YPP found; all published figures vendor-sourced and survivor-biased | **UPHELD**, incomplete | True for time-to-YPP. But the claim sits in a report that says the honest instrument is "our own channel's analytics, not anyone's success story". It misses that a survivorship-free distribution of **views per upload** exists (McGrady et al. 2023, §3.1). |
| 14 | Kill thresholds "derived rather than invented": K1 < 33,000 stranger impressions/28 d at day 56; K2 CTR < 2% on Browse+Suggested after ≥1,000 impressions (±0.9 pp); K3 < 333 stranger h/28 d at day 112 | **WEAKENED** | The arithmetic reproduces: 20,000 min ÷ 6 ÷ 0.10 = 33,333; ÷ 4 = 50,000; 1.96·√(0.02·0.98/1000) = ±0.87 pp. The derivation is flawed in five places. **(a)** "Top of typical CTR = 10%" misreads "half … between 2% and 10%". **(b)** K1 embeds the old-YPP *pace* at day 56, the sibling's conflation at half strength. Every §3 benchmark says channels ramp over months, so K1 kills slow-ramping winners. **(c)** K2 applies an all-source band to the lowest-CTR surfaces, where CTR is expected to *fall* as exposure widens [SNIPPET search 2], so it can fire on success. The binomial CI treats impressions as independent draws, which they are not (repeat viewers, surface clustering), so ±0.9 pp is optimistic. **(d)** 4,000 h / 365 d × 28 = **307 h**, not 333 (333 is per 30.4-day month). K1 at the scout's own assumptions is **~30,700** impressions, and the new gate is **614 h/28 d**, not 667. **(e)** Day 112 lands after 1 Feb 2027 on any start date after the audit, so K3's "lenient" old-gate pace tests a rule the channel will not face. Corrected design in §4. |
| 15 | At the 8,000-h gate a channel averages ~6,700–10,000 views/month; at $7 that is ~₪170–260, 75–115× short | **UPHELD** (INFERENCE, low) | 40,000 min ÷ 6/4 = 6,667/10,000 views; × $7/1,000 × 3.7 = ₪173/₪259; 20,000 ÷ 259 = 77×, ÷ 173 = 116×. Caveats. The $7 is not established (`audits/rpm-evidence.md` §0). MISSION reaches the target by "several lines summing to it" (MISSION.md:35-40), so the decision-relevant ratio is against a line share. Against ₪5,000 it is **19–29×**. Money also starts only after review and payout, not at the threshold. |
| 16 | Channel history meets constraint 8 shape 1 "in the letter", but weaker than Apify's: per-video judgement, failures stick to the person across channels, price-floor maps poorly | **WEAKENED** | **(a) Wrong line cited.** :286-288 is the "Creator responsibility" section, which covers "egregious behavior". The general cross-account consequence is at :342: "Violation of our YouTube channel monetization policies may result in monetization being suspended or permanently disabled on all or any of your accounts" [RENDERED]. And :348 points to "how to reapply to join the program". A failed review is not by itself a sticky violation, which softens the "one-shot identity risk" (same finding as `audits/monetization-gates.md` §3 point 7). **(b) "In the letter" is overstated.** Shape 1 is history "on a platform where history is a ranking input" (MISSION.md:220). The scout's own §2 evidence says YouTube judges per video. If so, history is a ranking input only through subscribers and notifications, and through the unevidenced embedding argument. Shape 1 is met contingently, not by the letter. **(c) "Cannot be bought"** holds under our constitution (ToS:123; policies :294-296). Whether monetized channels change hands in a market, which would let an unscrupulous competitor buy the history, is **UNKNOWN** (not searched). Either way the argument for a moat weakens. |
| 17 | Reel prompt 1 measures nothing; the only ToS-clean competition measurement is after the fact on our own videos | **UPHELD**, strengthened | Addition: the Analytics API returns, per video, the **YouTube search terms** that produced views (`dimensions=insightTrafficSourceDetail`, `filters=video==…;insightTrafficSourceType==YT_SEARCH`) [DOCS-EXCERPT, sample-requests]. That resolves the scout's open item 4 and gives the after-the-fact **demand** instrument (which queries found us) on Authorized Data. It also supports the correction to the rpm-evidence audit's angle 4 (claim 6c). |

---

## 2. Re-derivations

- Old gate pace: 4,000 h × 28/365 = **306.8 h per 28 days** (333.3 per 30.4-day month). New gate: 8,000 × 28/365 =
  **613.7 h per 28 days** (666.7 per month). The scout mixes "per 28 days" with per-month figures.
- K1 at the scout's own assumptions (6-min AVD, 10% CTR, old gate, 28 days): 306.8 × 60 ÷ 6 ÷ 0.10 = **30,685**
  impressions (scout: 33,000). At a 4-min AVD: 46,027 (scout: 50,000). New gate at 6 min / 10%: 61,370 (the scout's
  scale line: ~67,000).
- K2 interval at n = 1,000: ±0.87 pp at 2%, ±1.21 pp at 4%. It separates 2% from 4% only under independence (§1 #14c).
- ₪ at threshold: 173–259 (✓). Ratio to ₪20,000: 77–116× (✓). Ratio to a ₪5,000 line share: 19–29×.
- **What K1 asks of each video, against the base rate:** 33,333 impressions × 10% ÷ 6 videos ≈ **556 views per
  video in 28 days** (≈ 278 at a 5% CTR). In McGrady et al.'s random sample, 65.44% of all public videos have
  under 100 *lifetime* views and 86.93% under 1,000. So a K1 pass needs every video, in its first month, to beat
  somewhere between the 65th and 87th percentile of *lifetime* views of all public YouTube videos. The comparison
  population is mostly casual uploads (INFERENCE). It is a prior, not a forecast.

---

## 3. Missed angles that could move the decision

1. **The survivorship-free base rate (McGrady et al. 2023).** Covered above. It is the single most decision-relevant
   thing missing: it replaces "exploration budget of unknown size" with "most uploads reach almost nobody, and
   views concentrate extremely". It does not distinguish effortful, search-targeted long-form from the rest.
2. **Pew's starting set** (>250k-subscriber channels) removes the report's only independent counterweight.
3. **Search Console already exists for the web lines.** It records shown-and-ignored impressions, so constraint 7
   is equally measurable for any honest web property the colony runs. That property needs no owner consent beyond
   domain verification, carries no identity risk to a YPP standing, and has no private-lock audit. On measurability
   alone, YouTube has no advantage (INFERENCE).
4. **The API's traffic-source taxonomy.** Home and subscription feed share `SUBSCRIBER` / code 3. Separating them
   needs `traffic_source_detail`. For watch-time gates, the Analytics API's `subscribedStatus` filter
   (SUBSCRIBED/UNSUBSCRIBED; DOCS-EXCERPT, channel_reports and 2015-12-15 revision) is a cleaner stranger
   definition than any traffic-source proxy. It is not shown on the reach reports, so impressions still need the
   detail-level split.
5. **CTR falls as reach widens** [SNIPPET]. This makes a Browse CTR floor a success-killer (§1 #14c).
6. **Search-term detail per video** (§1 #17). This is the after-the-fact demand instrument the scout listed as
   unverified.
7. **Calendar collision with 1 Feb 2027.** Today is day −N for an audit of unknown length (Google publishes no
   SLA per `upload-automation.md` §3). Six uploads over four weeks, plus a day-112 read, puts every revenue-path
   decision after the gate doubles. Pre-register the revenue gate at **614 h/28 d**. Treat the old gate as
   irrelevant unless the channel is YPP-accepted before the cut-off. That is implausible from a standing start
   (`audits/monetization-gates.md` claim 9).
8. **Reading the Developer Policies consistently.** Either (i) literal: own-channel sums and weighted CTRs are also
   "derived metrics", so compute gates from the API's own filtered totals where possible; or (ii) purposive: then
   say so, and apply the same purposive reading when judging `search.list` glances. Whichever reading is chosen,
   the rpm-evidence audit's per-query counting (angle 4) fails E.2 (:538, :540).
9. **Portfolio framing** (MISSION.md:35-40): compare the threshold channel to a line share, not the full target.
10. **YouTube "Hype"** (search 4 returned a phonearena.com story, "youtube-hype-feature-smalltime-creators"; SNIPPET,
    title only). This is a first-party promotion mechanism aimed at small creators, but viewers trigger it, so it is
    not a day-one route. It is weak evidence that YouTube builds for small-creator discovery, and it measures
    nothing.

---

## 4. Corrections to the §6 test (recommendations to the supervisor; I built nothing)

| Gate | Scout | Corrected | Basis |
|---|---|---|---|
| **K0: constraint 7 proper** (new) | none | Day 56: if the **median** video has fewer than **35 stranger views** (Home-detail + Suggested + Search), it is invisible at the random-upload base rate → kill | McGrady et al. median lifetime views = 35 (SNIPPET + CODE secondary). This is a "shown at all" floor derived from a measured distribution, not from revenue |
| K1 | < 33,000 stranger impressions/28 d at day 56 | Drop as a kill, or move to the revenue path. If kept, use 30,700 (old) / 61,400 (new gate) and label it a revenue-pace gate | §2; it conflates the two questions |
| K2 | CTR < 2% on Browse+Suggested → kill | **Diagnostic only.** Report CTR by source and the impressions trend together. A falling Browse CTR with rising Browse impressions is a pass signal | SNIPPET: CTR falls as reach widens; Browse < Search |
| K3 | < 333 stranger h/28 d at day 112 | < **614 h/28 d** (8,000-h gate) at the pre-registered horizon. Stranger = `subscribedStatus==UNSUBSCRIBED` | §2; 1 Feb 2027 |
| Stranger definition | Browse + Suggested + Search; exclude Subscriber | Search + Suggested + `SUBSCRIBER` rows whose detail is the general homepage; exclude My-subscriptions, Notifications, External, Channel, Playlists | DOCS-EXCERPT taxonomy |
| D2 (new) | none | Top YouTube search terms per video, stored as Authorized Data | DOCS-EXCERPT sample-requests |

---

## 5. Grade inflation

- **Claim 14:** "derived rather than invented" overstates. The CTR anchor is misread (10% is not the top) and
  misapplied (all-source band applied to the lowest-CTR sources).
- **Claim 6:** the "so a competition score is off-limits" conclusion is graded RENDERED. It is INFERENCE on
  rendered text (sound).
- **Claim 16:** cites :286-288 (egregious-behaviour section) for a general "monetization or Community Guidelines
  failure" consequence the line does not state. The line that does is :342.
- **Claim 4:** the comparative "unlike Gumroad, Apify or WordPress.org" and "more honestly than any platform the
  colony has tried" (§0.4) carries no source for the other platforms, and the repo's own Search Console findings
  contradict it.
- **Claim 2:** carried at "medium" confidence as the independent counter-measurement. Given the >250k-subscriber
  starting set, its relevance to new channels is low.
- **Claim 1:** the structured claim attributes per-video evaluation to "YouTube staff". The report's own §2.1 grades
  it as an unattributed search summary.

---

## 6. URLs that would settle open points (verbatim from search results; none rendered)

- https://www.pewresearch.org/internet/2018/11/07/youtube-methodology/ (starting set, logged-out state, walk depth)
- https://www.pewresearch.org/internet/2018/11/07/many-turn-to-youtube-for-childrens-content-news-how-to-lessons/
- https://journalqd.org/article/view/4066 (McGrady et al., primary; zero-view share 4.68% vs 4.88% discrepancy)
- https://support.google.com/youtube/answer/7628154?hl=en (CTR band; whether it is per-channel or all-source)
- https://support.google.com/youtube/answer/16767369?hl=en ("Decoding CTR & impressions"; the falling-CTR sentence)
- https://support.google.com/youtube/answer/16559651?hl=en (possible first-party "experiments … small creators" line)

## 7. Search log (4 of 4)

| # | Query (short) | Result used |
|---|---|---|
| 1 | "Dialing for Videos" random sample, median views | McGrady et al. 2023: median 35, 65.44% < 100, 3.67% > 10k = 93.61% of views; then confirmed via `raw.githubusercontent.com/s4mt4r3/YouTube-Random-Sample/main/paper_reference.json` (CODE secondary) |
| 2 | YouTube Help impressions CTR, Browse, broader audience | Same 2–10% sentence; CTR falls as reach widens; Browse < Search (merged summary, partly vendor) |
| 3 | Pew 2018 random walks method | Starting set = 14,000 English channels > 250k subs; figures corroborated |
| 4 | YouTube Help, new channels / small creators tested | Vendor tier only (incl. nexlev.io, which sells faceless tooling); one unrendered first-party URL (answer/16559651) |

Egress-blocked, one attempt each, not retried: journalqd.org, chazans.com, ethanzuckerman.com. The GitHub API for
`s4mt4r3/YouTube-Random-Sample` was refused ("access … not enabled"); `raw.githubusercontent.com` worked.
