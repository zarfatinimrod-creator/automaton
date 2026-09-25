# SCOUT: discovery. How does a stranger find a brand-new channel's video, and can the colony measure it honestly?

*Scout report, 2026-09-25. Question: MISSION constraint 7 applied to the owner's faceless-YouTube reel
(`research/faceless-youtube/00-owner-reel-2026-09-25.md`). Sibling scouts read and cross-referenced:
`monetization-gates.md`, `policy.md`, `rpm-evidence.md`, `upload-automation.md` (all in this directory).*

## Grades used

- **RENDERED**: primary page text I read. Includes `research/rendered/*` (fetched by the GitHub runner) and
  **RENDERED-ARCHIVE OTA**: YouTube's own legal documents as captured by Open Terms Archive
  (`github.com/OpenTermsArchive/vlopses-us-versions`, branch `main`, downloaded from `raw.githubusercontent.com`
  today). Files and hashes: `YouTube/Terms of Service.md` (sha256 `95d3cce0…fef80b`, "Effective as of December 15,
  2023" at :269) and `YouTube/Developer Terms.md` (sha256 `af8ea9ab…ee0784`; latest OTA commit `8fd72b3`,
  2026-09-12). This file bundles the YouTube API Services Terms and the Developer Policies. Line numbers below
  refer to those downloaded files.
- **DOCS-EXCERPT**: text returned by the Context7 documentation index for `developers.google.com/youtube/...`
  pages. It is close to primary, but I did not see the page itself and cannot rule out an excerpting error. **I
  treat it as SNIPPET strength.**
- **CODE**: a repo file I read (MISSION.md, REJECTED.md, sibling scouts), or text in a GitHub repository.
- **SNIPPET**: search-result summary text. Weaker. The publisher, and whether they sell something, is given each time.
- **INFERENCE**: my reasoning. **UNKNOWN**: not established.

---

## 0. The answer in eight lines

1. **YouTube is not closed to a day-one video by construction, the way Gumroad Discover is.** Nothing I found
   shows a hard gate like Gumroad's `sale_made`. YouTube staff say, as relayed by others, that each video is judged
   on how viewers respond, and that "a slot or two" at the top of Home is reserved for new channels. **SNIPPET
   only, relayed mostly by growth-tool vendors (vidIQ, TubeBuddy).** No YouTube page on recommendations was
   rendered. The primary URLs are listed for the runner.
2. **The only independent measurement points the other way.** Pew Research (2018) ran 174,117 random walks
   through YouTube's suggestions. 64% of recommendations went to videos with more than 1M views, and 5% went to
   videos with fewer than 50,000 [SNIPPET; Pew sells nothing]. It is eight years old, covers Suggested only (not
   Home), and I could not read its method.
3. **So the honest statement is "open, by an exploration budget of unknown size".** The sibling
   `monetization-gates.md` wrote that YouTube "ranks on prior success, the same wall" as Gumroad/Apify/WordPress.
   **That is stronger than the evidence.** Nobody has shown the wall, and nobody has shown its absence.
4. **What is genuinely new here: YouTube shows the channel owner how often strangers were shown each video,
   including when nobody clicked.** It reports impressions and click-through rate per video and per traffic source,
   now also through the Reporting API's reach reports, added 2026-01-15 [DOCS-EXCERPT]. Gumroad, Apify and
   WordPress.org never told a listing it was shown and ignored. **Constraint 7 can be measured on YouTube more
   cheaply and more honestly than on any platform the colony has tried.**
5. **"Low competition" cannot be measured ahead of time, honestly, by the colony.**
   - Scraping is banned by YouTube's Terms [RENDERED-ARCHIVE OTA ToS:120].
   - The official Data API forbids aggregating other channels' data and creating "new or derived data or metrics".
     Its own example of a forbidden metric is "a score that factors in likes, total views, or any other API Data"
     [RENDERED-ARCHIVE OTA Developer Terms:538-540, :596-598]. A niche competition score is exactly that. Since
     June 2026 such metrics are allowed only to **audited** developers who apply [:772-774, :1135-1141].
   - The Trends API is alpha and by application only [SNIPPET].
   - vidIQ and TubeBuddy are paid vendor tools that need the owner's Google sign-in.
   - Reel prompt 1 ("list 15 low-competition niches") measures nothing (sibling `rpm-evidence.md` §3 agrees).
     **Competition is measured by publishing, not by prompting.**
6. **The colony cannot run the test entirely alone.** Publishing publicly through our own API project needs a
   YouTube compliance audit, and reading analytics needs the owner's one-time OAuth consent. Details are in
   `upload-automation.md` §2–§3 and §8.1. The discovery half adds one scope to the same consent.
7. **Constraint 8: channel history does qualify as "shape 1", but it is weaker than Apify's.** It compounds and
   cannot be bought. It is also judged per video rather than per developer (per YouTube's claims), it is a
   liability tied to the person as well as an asset, and constraint 8's price-floor logic does not map cleanly
   onto ad revenue. See §5.
8. **Cheapest honest test (§6):** one channel, **6** long-form videos over 4 weeks, observed for 8 weeks, with
   gates written down before the first upload.
   - Kill if 28-day stranger impressions are **< 33,000**. At that level even YouTube's top-of-typical CTR cannot
     reach the old YPP watch-hour pace.
   - Kill if CTR stays **< 2%** after ≥1,000 impressions per video.
   - Kill if trailing-28-day stranger watch hours are **< 333** at day 112.
   - The test puts ₪0 in the ledger. Reaching YPP is worth roughly **₪170–260/month** (INFERENCE, §6.5).

---

## 1. How a stranger can reach a new channel's video at all

YouTube Analytics splits views and impressions by traffic source. The Analytics API has an
`insightTrafficSourceType` dimension, and the Reporting API's `channel_reach_combined_a1` report has a
`traffic_source_type` dimension alongside `video_thumbnail_impressions` and `video_thumbnail_impressions_ctr`
[DOCS-EXCERPT: developers.google.com/youtube/reporting/v1/reports/channel_reports; …/analytics/sample-requests].
The value names below (Browse, Suggested, YouTube search, Notifications/Subscriber, Channel pages, External,
Playlists) are the familiar Studio categories. **I did not render the full enum, so the exact set is UNKNOWN.**

For a channel with **zero subscribers** whose owner **posts nowhere** (MISSION: the owner does not sell, post or appear):

| Route | Available on day 1? | Why (grade) |
|---|---|---|
| Notifications / subscription feed | No | Zero subscribers (INFERENCE) |
| External (links from other sites) | No | Nobody links to it; the owner does not post (INFERENCE) |
| Channel page, own playlists | Negligible | Needs someone already on the channel (INFERENCE) |
| **YouTube search** | Possibly | A viewer typed a query our video answers. Volume per query is unmeasurable for us (§4) |
| **Browse (Home)** | Possibly | Only if the recommender chooses to test the video (§2) |
| **Suggested (next to other videos)** | Possibly | Same, plus it needs co-watching with other videos (§2) |

So a stranger arrives by only two routes: **intent** (search) or **the recommender's decision** (Browse/Suggested).
Everything in §2 is about the second route.

"Impression" is defined as a thumbnail "visible for at least one second with at least 50% of the image on screen"
[DOCS-EXCERPT, developers.google.com/youtube/reporting/v1/reports/metrics]. So impressions measure exactly the thing
constraint 7 asks about: whether a stranger was shown the video, whether or not they clicked.

---

## 2. Does YouTube's recommender test individual videos from zero-subscriber channels?

### 2.1 What YouTube says (all second-hand)

| Claim | Who relays it | Sells something? | Grade |
|---|---|---|---|
| "We do care about small creators. We actually have teams that are dedicated to making sure small creators can still break through on YouTube", attributed to Todd Beaupré, YouTube Director of Growth & Discovery | Search summary; the surrounding results were Forbes (2024-09-10), Search Engine Journal, buffer.com, a beehiiv newsletter | Buffer sells social tools; SEJ is trade press. The quote's original venue is UNKNOWN | SNIPPET, medium-low |
| "YouTube's Creator Liaison says the Discovery Team reserves a slot or two at the top of home page recommendations for new channels" | blog.kdcc.social, vidiq.com/blog/post/new-creators-youtube/, tubebuddy.com blog ("why new creators are being pushed in 2026") | **Yes.** vidIQ and TubeBuddy sell growth tools to small creators, so "new creators are being pushed" is their sales pitch | SNIPPET, weak–medium |
| "The recommendation algorithm is focused on assessing each video individually rather than averaging the performance across a channel's videos" | Unattributed search summary (search 1) | Unknown | SNIPPET, weak |
| The system "learn[s] every day from over 80 billion pieces of information", using clicks, watch time, survey responses, shares, likes and dislikes; satisfaction has been the top factor since 2015 | Search summary of Cristos Goodrow, "On YouTube's recommendation system", blog.youtube (2021) | YouTube itself | SNIPPET of a first-party post, medium |
| YouTube Help: "Half of all channels and videos on YouTube have an impressions CTR that can range between 2% and 10%"; "new videos or channels (like those less than a week old), or videos with fewer than 100 views can see an even wider range" | support.google.com/youtube/answer/7628154 (search summary) | YouTube itself | SNIPPET of a first-party page, medium |

**What the last row adds (INFERENCE):** YouTube's own help page writes CTR guidance for channels "less than a week
old" and videos "with fewer than 100 views". That presupposes such videos get impressions. It says nothing about how
many.

### 2.2 The only primary technical text: YouTube's 2016 recommender paper

Covington, Adams & Sargin, "Deep Neural Networks for YouTube Recommendations" (RecSys 2016). I could not reach the
paper itself. Its sentences are quoted identically in at least four independent GitHub transcriptions
(`simbo1905/the-morning-paper-archive` pages/20160919.md:26; `chocoluffy/deep-recommender-system`
RecSys/Youtube-DNN/README.md:55-57; `zhangruiskyline/DeepLearning` doc/industrial_design.md;
`jmj3047/myblog` DNN_Youtube_Rec.md) [CODE of secondary transcriptions, SNIPPET strength]:

> "Recommending this recently uploaded ("fresh") content is extremely important for YouTube as a product. We
> consistently observe that users prefer fresh content, though not at the expense of relevance. In addition to the
> first-order effect of simply recommending new videos that users want to watch, there is a critical secondary
> phenomenon of bootstrapping and propagating viral content."

> "If users are discovering videos through means other than our recommendations, we want to be able to quickly
> propagate this discovery to others via collaborative filtering."

The candidate generator's input "combines a user's watch history, search history, demographic and geographic
features", and "video embeddings are learned jointly with all other model parameters" (Morning Paper :38-40).

**INFERENCE, with a heavy caveat for age:**
- In the 2016 design, the recommender **amplifies** discoveries that start somewhere else, such as search. A video
  nobody has watched gives collaborative filtering little to work with.
- If that design still holds, **YouTube search is the bootstrap for a zero-subscriber channel, and Browse/Suggested
  follow.** That is why §6 reads the search share separately.
- The paper is ten years old, and Goodrow's 2021 post says the system changes daily. It shows a mechanism that
  existed. It does not prove the 2026 system works that way.

### 2.3 The one independent measurement

Pew Research Center, "Many Turn to YouTube for Children's Content, News, How-To Lessons" (2018-11-07), per the search
summary:
- 174,117 random walks produced 696,468 recommendation encounters, covering 346,086 unique videos.
- **64% of recommendations went to videos with more than 1 million views** at the time.
- **5% went to videos with fewer than 50,000 views.**
- Recommendations became "progressively more popular" and longer the further a walk went.

[SNIPPET; Pew is a non-profit and sells nothing; pewresearch.org is egress-blocked.]

Caveats (INFERENCE): the data is from 2018. It covers Suggested only, not Home. The walks were probably logged-out
with no history. I could not read how the starting videos were chosen. It measures the **share of recommendation
slots**, not whether a given new video was ever tested. A small exploration budget and a heavy popularity skew can
both be true at once.

### 2.4 Verdict against constraint 7's three-platform finding

| Platform | Gate on prior success | Evidence | Does a day-one item learn whether it was shown? |
|---|---|---|---|
| Gumroad Discover | **Hard gate**: `recommendable?` requires `sale_made` | CODE (MISSION.md, constraint 7 box) | No |
| Apify Store | Soft: quality score includes Popularity and History of success | CODE (MISSION.md) | No (only runs) |
| WordPress.org | Soft, steep: `function_score` on installs, resolved threads, rating (~100–200× day-one handicap) | CODE (MISSION.md) | No |
| **YouTube** | **No hard gate documented.** A claimed exploration slot for new channels (SNIPPET, vendor-relayed); a measured 2018 popularity skew in Suggested (SNIPPET, independent) | Weak on both sides | **Yes: impressions and CTR per video and traffic source** (DOCS-EXCERPT) |

**My conclusion (INFERENCE):** YouTube is **not** the same shape as Gumroad's gate. From the evidence, it cannot be
placed anywhere between "tests every new video with real strangers" and "tests them with almost nobody". It is,
however, the only one of the four where the answer is cheap to observe directly. **The sibling's "same wall"
statement should be downgraded from a finding to a hypothesis. §6 is the test that settles it.**

---

## 3. New faceless channels reaching 1,000 subscribers / 4,000 hours: the evidence and the survivorship problem

I spent **no search** on this. The sibling `monetization-gates.md` §5 spent its budget on exactly this, and I read
its findings rather than duplicating them [CODE; its grades are SNIPPET]:

- vidIQ: "40.6% of channels with at least one public subscriber had reached 1,000 subscribers". **vidIQ sells a
  growth SaaS.** The denominator excludes channels that never got a subscriber, and the figure covers subscribers
  only, not watch hours.
- "Average time to 1,000 subscribers is 254 days" vs "around 22 months": unattributed, and they contradict each
  other by ~2.6×.
- "6 to 12 months when posting consistently": AIR Media-Tech, **which sells monetization services**.
- **No distribution of time-to-YPP for new channels, and nothing faceless-specific, was found by either scout.**

**Survivorship caveats (INFERENCE):**
1. Every "time to 1,000" average is computed only over channels that got there. Channels that quit contribute no
   time, so the averages flatter the odds.
2. The public faceless success stories come from people who sell courses or tools. The tooling review found **zero
   verified earnings reports** for a 120k-star generator [CODE, `research/tiktok/06-faceless-video-tooling.md`
   §6.1].
3. Survivors can be removed later. In January 2026, 16 channels with 35M subscribers were removed under the
   inauthentic-content policy [CODE, `docs/REJECTED.md`, itself SNIPPET-graded]. A channel that crossed the
   threshold is not a channel that stays paid.
4. From 1 February 2027 the ad-revenue gate reportedly doubles to 8,000 qualified watch hours in 365 days
   [CODE, `monetization-gates.md` §1, SNIPPET-graded]. Pre-2027 timelines overstate how fast a channel started
   today can qualify.

**The honest instrument is our own channel's analytics (§6), not anyone's success story.**

---

## 4. Measuring "low competition" without scraping: what the colony may and may not do

### 4.1 The rules, verbatim

- **YouTube Terms of Service.** You are not allowed to "access the Service using any automated means (such as
  robots, botnets or scrapers) except (a) in the case of public search engines, in accordance with YouTube's
  robots.txt file; or (b) with YouTube's prior written permission" [RENDERED-ARCHIVE OTA ToS:120].
- **Developer Policies III.E.6 (Scraping).** API clients "must not … directly or indirectly, scrape YouTube
  Applications or Google Applications, or obtain scraped YouTube data or content" [OTA Developer Terms:611-613].
  Buying scraped data from a vendor is covered too.
- **III.D.7.** "You must not use undocumented APIs without express permission" [:518-520]. This rules out the
  autocomplete/suggest endpoints as a keyword source.
- **III.E.2 (Data Aggregation).**
  - "Do not aggregate API Data except that you may only aggregate API Data relating to YouTube channels that are
    under the same content owner…" [:538].
  - "Do not aggregate API Data or otherwise use API Data or YouTube API Services to gain insights into YouTube's
    usage, revenue, or any other aspects of YouTube's business" [:540].
- **III.E.4.h (Derived metrics).** API clients "must not … (ii) access or use API Data to create new or derived data
  or metrics". The policy's own example of what is not permitted: "a score that factors in likes, total views, or
  any other API Data" [:596-598].
- **III.L.** Additional derived metrics are allowed only for "audited developers with analytics use cases that have
  explicitly applied for permission … (starting June 01, 2026)" [:772-774]. The revision history entries dated May 4
  and June 1, 2026 name "custom scores, earnings estimates, suitability scoring" as examples [:1135-1141].
- **III.E.4.b.** An API client "must not store statistics retrieved as Non-Authorized Data for more than 30 days".
  The example given is another channel's subscriber count [:580, :584].

### 4.2 The candidate methods

| Method | Allowed? | Colony can run it alone? | What it would actually measure | Grade |
|---|---|---|---|---|
| Scrape youtube.com search / autocomplete | **No** (ToS:120; E.6; D.7) | Irrelevant | n/a | RENDERED-ARCHIVE |
| **Data API `search.list` + `videos.list` → a "competition score" per niche** | **No, for an unaudited project.** Aggregating non-owner data plus a derived score is the policy's own example (E.2, E.4.h). Permission only after an audit plus an explicit derived-metrics application (L) | No: needs a Google Cloud project, which is an owner step (INFERENCE), and the audit | Supply side, if it were allowed | RENDERED-ARCHIVE |
| Data API `search.list`, **read as-is**: look at page 1 for a handful of queries and describe it in words | Arguably yes: no aggregation, no score, nothing stored beyond 30 days. **This is my reading of an ambiguous term; I am not certain where "aggregate" begins** | Yes, once a project and API key exist. Default quota: **100 `search.list` calls per day in their own bucket, 1 unit each**, plus 10,000 units/day for other methods [RENDERED research/rendered/youtube-api-quota-cost.txt:169-173] | A human-style glance, not a number a board can gate on | RENDERED + INFERENCE |
| Google Trends web UI | Not an API; automating it would be automated access to a Google service (INFERENCE; Google's own ToS was not read, so exact wording is UNKNOWN) | No | Demand (search interest), not supply competition | INFERENCE |
| **Google Trends API (alpha)** | Yes, if admitted | No: "Access is by application", announced 2025-07-24, still "open to alpha tester applications as of August 2026". A Google community thread is titled "Google Trends API alpha access application — no response received". Whether it exposes the **YouTube Search** property is UNKNOWN (the snippet sentence came from a guide about the web UI) | Demand, consistently scaled | SNIPPET |
| vidIQ / TubeBuddy "competition" scores | Their problem, not ours, if they are audited (UNKNOWN whether they are) | No: they need the owner's Google sign-in (INFERENCE). A subscription is a recurring cost, which is the owner's decision under MISSION's float rule. Prices UNKNOWN (not searched) | A proprietary vendor score from companies whose pitch is "new creators are being pushed" | INFERENCE |
| An LLM answering reel prompt 1 | Allowed | Yes | Nothing. It restates the public listicle consensus (`rpm-evidence.md` §3) | INFERENCE |
| **Our own channel's analytics after publishing** | **Yes.** Analytics and Reporting API data about our own channel is Authorized Data and may be stored "for as long as is necessary", with a re-check every 30 days that authorization is still valid [OTA Developer Terms:570-578] | Yes, after one owner consent (§6.1) | **Competition as experienced by our videos**: impressions won, CTR, search vs recommendation share | RENDERED-ARCHIVE + DOCS-EXCERPT |

**Conclusion (INFERENCE):** the only ToS-clean, colony-runnable competition measurement is **after the fact**, on our
own videos. "Low competition" is not an input to choosing the niche. It is an output of the test in §6.

---

## 5. Constraint 8: is a channel's accumulated history an input that is not public?

**For: it is shape 1, "accumulated operating history on a platform where history is a ranking input" (MISSION.md).**
- The data that matters to the recommender is private to the channel: per-video impressions, CTR, retention, and
  which viewers responded. Only the owner can read it (§4: Authorized Data).
- Subscribers are a distribution channel of their own (Notifications and the subscription feed, §1), and a
  competitor cannot copy them.
- The YPP gate itself is accumulated history: 4,000 hours today, reportedly 8,000 from February 2027 (sibling,
  SNIPPET). **It cannot be bought.** Paying for views or subscribers is forbidden by ToS item 6: "cause or encourage
  any inaccurate measurements of genuine user engagement … including by paying people" [OTA ToS:123]. It is also
  forbidden by "Creator integrity" [RENDERED research/rendered/youtube-monetization-policies.txt:294-296]. It
  compounds with time.
- The 2016 paper's collaborative filtering learns video embeddings from watches. A channel whose past videos were
  watched by an identifiable audience gives the system somewhere to send the next one (INFERENCE, age caveat §2.2).

**Against: it is weaker than Apify's developer-level history, for four reasons.**
1. **YouTube says it judges videos, not channels** (SNIPPET, §2.1). If that is true, history matters less per new
   video than Apify's developer-level "History of success". If it is false, a newcomer faces an incumbent wall. That
   helps the argument that history is valuable, but it is fatal to the day-one test.
2. **History is also a liability, and it is tied to the person.** A monetization or Community Guidelines failure
   "may apply to all of your existing channels, any new channels you create". Replacement channels "to get around
   these restrictions" are forbidden [RENDERED youtube-monetization-policies.txt:286-288]. Apify history can only
   help, while YouTube history can end every future channel the owner's identity touches.
3. **The price-floor logic does not map cleanly.** Constraint 8 is about products whose price falls to zero
   because anyone can build them from public inputs. Advertisers, not competitors, set the ad RPM. The analogous
   floor on YouTube is **attention**: viewers have unlimited free alternatives, and anyone can make a video on the
   same topic. History defends against that only once an audience exists (INFERENCE).
4. **The counts are public even if the model is not.** Subscriber and view counts are public by default, so
   competitors can see *how much* history we have. They cannot see *what it consists of* (INFERENCE).

**Verdict (INFERENCE):** channel history **does** satisfy constraint 8 in the letter. It is the only non-public input
this line would have: the niche, the prompts, the stock footage and the TTS are all public. But it is **a moat that
only exists after the stranger test passes**. Constraint 8 therefore says "start the clock early if at all". It does
not say "this line is defensible". And because of point 2, starting early with content that could fail review is
worse than not starting.

---

## 6. The cheapest honest stranger-finds-it test

### 6.1 Preconditions (from the siblings; not re-derived here)

- **Content passes the honest variant from the first video.** The channel's first videos are what a reviewer will
  read later ("Main theme / Most viewed videos / Newest videos…" [RENDERED youtube-monetization-policies.txt:88-98]).
  A failed channel taints the owner's identity (§5, point 2). So this cannot be a throwaway channel; the test **is**
  the channel. See `policy.md` §8 (compliance checklist).
- **Exactly one channel** (constraint 3). A Brand Account under the brand name, never the owner's name
  (`monetization-gates.md` §8, `upload-automation.md` §7).
- **Publishing route:** an audited third-party publisher or our own project after an audit. Unaudited uploads are
  locked private: "Videos uploaded via the videos.insert endpoint from unverified API projects created after July
  28, 2020, are restricted to private viewing mode" [DOCS-EXCERPT developers.google.com/youtube/v3/docs/videos/insert;
  full treatment in `upload-automation.md` §2].
- **Measurement route (the discovery half's only addition to the owner's steps):**
  - In the same Cloud project (upload-automation §8.1 step 3), also enable the **YouTube Analytics API** and the
    **YouTube Reporting API**.
  - In the same one-time consent (step 4), also grant **`yt-analytics.readonly`**. Reporting jobs accept "either
    yt-analytics.readonly or yt-analytics-monetary.readonly" [DOCS-EXCERPT …/reporting/v1/reference/rest/v1/jobs/create].
  - Nothing else. No `search.list` key is needed for this test.

### 6.2 Design

| Parameter | Value | Why (grade) |
|---|---|---|
| Videos | **6 long-form** (not Shorts) | YouTube reportedly evaluates each video on its own (SNIPPET §2.1), so each upload is one independent draw. One or two draws cannot tell "the channel was never tested" from "this video lost". The reel's 30-in-30-days calendar (prompt 5) is the "template… mass production" pattern the policy names [RENDERED youtube-monetization-policies.txt:114, :140]. It also spends the owner's one shot. **The number 6 is my judgement, not a measured optimum (INFERENCE)** |
| Video length | Whatever the script's substance needs, recorded per video | I found no evidence for an optimal length. Padding to raise watch time is what "Unsatisfying or Off-putting Content" targets [RENDERED …:210-216] |
| Publishing cadence | 6 uploads spread over ~4 weeks, at irregular times | "Synchronised upload schedules" are a cluster-detection signal [CODE docs/REJECTED.md, SNIPPET-graded there] |
| Observation window | **Day 0 = first upload. Read at day 28, day 56 (primary) and day 112 (trajectory)** | 28 days is the Analytics default window. A new Reporting job's first report arrives "within 24 hours", and new jobs cover "the 30-day period prior to the scheduling date" [DOCS-EXCERPT]. **Create the reporting jobs before the first upload** |
| Data | Reporting API `channel_reach_combined_a1` (impressions and CTR by `traffic_source_type`, per video, per day). Analytics API `views, estimatedMinutesWatched, averageViewDuration, averageViewPercentage, subscribersGained` by `insightTrafficSourceType` | DOCS-EXCERPT. Our own data may be stored in the repo (Authorized Data, OTA :570-578) |
| "Stranger" traffic | Browse + Suggested + YouTube search. **Exclude** External, Channel pages, Notifications, Playlists and Direct/unknown from every gate | §1 (INFERENCE) |
| Pre-registration | Commit this table and §6.3's thresholds to the repo **before** upload 1, and never edit them afterwards | A threshold that moves after the data arrives is not a test (INFERENCE; MISSION rule 5) |

### 6.3 What to read and the gates

Each threshold is derived below from a published figure plus arithmetic, not invented. The two assumptions are
flagged: **average view duration (AVD) of 4–6 minutes**, taken from the sibling `monetization-gates.md` §5 (itself an
assumption), and **the old YPP gate of 4,000 hours / 12 months = ~333 hours per 28–30 days** (SNIPPET via the sibling).

| # | Read at | Metric | Kill if | Derivation |
|---|---|---|---|---|
| **K1: exposure** (constraint 7 proper) | Day 56 | Stranger impressions (Browse + Suggested + Search), trailing 28 days, all 6 videos | **< 33,000** | 333 h = 20,000 min. At the generous **6-minute** AVD that is ~3,333 views. At the **top** of YouTube's "half of all channels" CTR band, **10%** [SNIPPET of support.google.com/youtube/answer/7628154], it needs ~33,000 impressions. Below that, **no typical CTR** can reach even the old YPP pace. (At a 4-minute AVD the figure is ~50,000, so 33,000 is the lenient bound.) |
| **K2: packaging** | Once each video has ≥ 1,000 Browse + Suggested impressions | Impressions-weighted CTR on Browse + Suggested | **< 2%**, after one permitted round of title/thumbnail revision | 2% is the bottom of YouTube's own 2–10% band (same SNIPPET). With 1,000 impressions at 2%, the binomial 95% interval is about ±0.9 points, which is narrow enough to tell 2% from 4%. Fewer impressions than that is itself a K1 signal |
| **K3: watch-time trajectory** | Day 112 | Stranger watch hours, trailing 28 days | **< 333** | That is below the pace for the **old** 4,000 h / 12 months gate, four months in. The gate from February 2027 (8,000 h / 365 days, SNIPPET) needs an average of ~667 h per 28–30 days |
| **K4: policy** | Continuous | Any Community Guidelines strike, or "limited or no ads" on the majority of videos after YPP, or a failed review | **Any** | Failures are sticky to the person [RENDERED youtube-monetization-policies.txt:286-288]; `policy.md` §6 |
| D1: diagnostic, **not a kill** | Day 56 | Share of stranger impressions coming from YouTube search vs Browse + Suggested | (no threshold) | Mostly search means the channel is a search property. Its ceiling is query volume, which we cannot measure (§4, Trends alpha). The 2016 paper suggests search is the normal bootstrap (§2.2). I found no evidence for a numeric cut-off, so I do not invent one |

**Scale criterion, for symmetry:** at day 56, ≥ ~67,000 stranger impressions per 28 days with CTR in the 2–10% band.
That is K1's arithmetic applied to the 8,000-hour gate's ~667 h average. Only then does the question move on to
policy review and RPM.

**How K1 differs from the sibling's gate.** `monetization-gates.md` §9 proposes killing at day 60 unless watch hours
run at ≥ 667 h/month. That merges the stranger test with revenue viability. By every benchmark in §3 it would kill
almost any new channel, so it is effectively a no-go dressed as a test. K1 asks the narrower constraint-7 question
first (are strangers being shown it at all?). K3 asks the revenue-path question later.

### 6.4 Honesty rules for the measurement itself

1. **Nobody on our side watches the videos.** No colony traffic and no owner views. Such views would count toward
   the watch hours the gates measure (INFERENCE), and inflating metrics is forbidden [OTA ToS:123].
2. **No paid promotion and no posting from the owner's accounts** (MISSION: the owner does not post; paid ads are
   rejected on portfolio arithmetic, CODE MISSION.md constraint 7). External traffic is excluded from the gates
   anyway.
3. **No view exchanges, "sub4sub", or engagement pods.** All of these are "incentives to increase … views"
   [OTA ToS:123].
4. **Raw report CSVs are stored in the repo and every gate is recomputed from them by code**, the same rule as the
   ledger (MISSION rule 3). The measurement is private, so a hand-typed number would be unfalsifiable.
5. **The test records ₪0 in the ledger.** No YPP means no money. It is a gate for further effort, not income.

### 6.5 What a pass is worth, in shekels (INFERENCE; the RPM is the reel's own unverified $7 floor)

- A channel exactly at the 8,000 h / 365-day gate averages ~667 h/month = 40,000 min. At a 4–6-minute AVD that is
  **~6,700–10,000 views/month**.
- At $7 RPM that is **$47–70/month ≈ ₪173–259 at 3.7 ILS/USD**, so about **₪170–260/month** at the moment of
  qualifying.
- The target needs ~$5,405/month ≈ **~772,000 monetized views/month at $7** (sibling `monetization-gates.md` §6).
  That is **roughly 75–115× a channel sitting at the threshold**.
- **Passing all four gates therefore proves the channel is findable. It does not prove the line is a line.**

### 6.6 Cost

- **₪0 cash.**
- **Colony time:** 6 honest videos, plus a script that reads two report types.
- **Owner time:** the one-time steps in `upload-automation.md` §8.1, plus enabling two more APIs and one more scope
  in the same consent (§6.1).
- **The real cost is the one-shot identity risk in §5, point 2.** It is paid only if the content fails policy, so
  `policy.md` is the precondition, not this file.

---

## 7. What this changes relative to `docs/REJECTED.md` (2026-09-03)

- The 3.9 rejection did not address discovery at all. Its reasons were payability, policy, cluster enforcement,
  Shorts arithmetic and stock licensing.
- On discovery the English long-form variant is **neither a reason to reopen nor a reason to keep closed**. It is
  the one question on this line that can be answered **by measurement, cheaply, before any money or scale**. That
  is what constraint 7 asks for.
- **What does not change:** the reel's promise of "low competition" niches found by prompting (prompt 1) and
  "monetized in 30 days" (prompt 6) cannot be honestly measured or met. The first fails §4, and the second is
  refuted by the sibling's arithmetic.

---

## What I could not verify

1. **Any YouTube primary text on how new channels are recommended.** The claimed "slot or two" on Home, per-video
   evaluation, and "teams dedicated to small creators" are all search summaries, mostly relayed by vendors who sell
   growth tools. These pages were **not** rendered: support.google.com/youtube/answer/16089387, answer/16533387,
   and blog.youtube/inside-youtube/on-youtubes-recommendation-system/.
2. **The size of the exploration budget for a new video.** No measured data for 2024–2026 was found. Pew is 2018,
   covers Suggested only, and its method was not read.
3. **Whether the 2016 two-stage/collaborative-filtering design still describes the 2026 system.** Almost certainly
   not in detail.
4. **The exact `insightTrafficSourceType` / `traffic_source_type` enums, and whether search terms per video are
   exposed via the API.** Not rendered.
5. **Whether reading `search.list` results without scoring counts as "aggregation"** under Developer Policies
   III.E.2. I gave my reading. It needs a lawyer or YouTube's own policy guide
   (developers.google.com/youtube/terms/developer-policies-guide, named in OTA Developer Terms:4; not rendered).
6. **Whether the Trends API exposes the YouTube Search property**, and whether alpha applications are being
   answered at all.
7. **vidIQ / TubeBuddy prices, and whether either is an audited YouTube API client.** Not searched.
8. **Whether new-channel impressions are suppressed for channels that disclose altered/synthetic content.** The
   rendered page says disclosure "won't limit a video's audience or impact its eligibility to earn money"
   [RENDERED research/rendered/youtube-altered-synthetic-disclosure.txt:173], so it should not. I did not verify
   this against behaviour.
9. **The AVD assumption (4–6 min)** that K1 and K3 depend on. It comes from the sibling scout, not from data. The
   test will replace it with a measured value, and **K1 must be recomputed with the measured AVD at day 28** before
   it is applied at day 56. That recomputation rule is part of the pre-registration.
10. **Any distribution of time-to-YPP for faceless channels.** Not found by me or the sibling.

---

## Sources

**Rendered / archived primary text**
- `research/rendered/youtube-api-quota-cost.txt:169-173` (developers.google.com/youtube/v3/determine_quota_cost,
  fetched 2026-09-25, 200, "Last updated 2026-09-15"): 100 `search.list`/day, 100 `videos.insert`/day, and 10,000
  units for other endpoints. RENDERED.
- `research/rendered/youtube-api-compliance-audits.txt` (…/guides/quota_and_compliance_audits, 200): the audit form
  route. RENDERED.
- `research/rendered/youtube-monetization-policies.txt:88-98, :114, :140, :210-216, :286-288, :294-296`
  (support.google.com/youtube/answer/1311392, 200). RENDERED.
- `research/rendered/youtube-altered-synthetic-disclosure.txt:173`. RENDERED.
- OTA `vlopses-us-versions/YouTube/Terms of Service.md:120, :123, :269`. RENDERED-ARCHIVE.
- OTA `vlopses-us-versions/YouTube/Developer Terms.md:4, :518-520, :538-542, :570-584, :596-598, :611-613,
  :772-774, :1135-1141` (commit 8fd72b3, 2026-09-12). RENDERED-ARCHIVE.

**Documentation excerpts (Context7 index of developers.google.com; SNIPPET strength)**
- developers.google.com/youtube/reporting/v1/reports/channel_reports: `channel_reach_basic_a1` and reach reports
  with `video_thumbnail_impressions`, `video_thumbnail_impressions_ctr`.
- developers.google.com/youtube/analytics/revision_history: "January 15, 2026", reach reports added.
- developers.google.com/youtube/reporting/v1/reports/metrics: the impression definition (≥1 s, ≥50% visible).
- developers.google.com/youtube/reporting/v1/reference/rest: first report "within 24 hours".
- developers.google.com/youtube/reporting/revision_history (May 22, 2018): new jobs cover the prior 30 days.
- developers.google.com/youtube/reporting/v1/reference/rest/v1/jobs/create: the scopes.
- developers.google.com/youtube/v3/docs/videos/insert: the private lock for unverified projects created after
  2020-07-28.
- developers.google.com/youtube/analytics/sample-requests: `insightTrafficSourceType`, `averageViewDuration`.

**Repo / GitHub (CODE)**
- MISSION.md (constraints 3, 5, 7, 8; the Gumroad/Apify/WordPress findings), docs/REJECTED.md §"Automated
  faceless-video pipelines", research/tiktok/06-faceless-video-tooling.md (verdict, §3.2, §3.5, §6, §9).
- Sibling scouts: monetization-gates.md §1, §5, §6, §9; policy.md §1, §6, §8; rpm-evidence.md §3;
  upload-automation.md §2, §3, §8.
- 2016 paper transcriptions: github.com/simbo1905/the-morning-paper-archive (pages/20160919.md),
  github.com/chocoluffy/deep-recommender-system (RecSys/Youtube-DNN/README.md),
  github.com/zhangruiskyline/DeepLearning, github.com/jmj3047/myblog. Secondary copies of a primary paper; they
  agree verbatim.

**Search summaries (SNIPPET)**
- Search 1/2: buffer.com, sproutsocial.com, searchenginejournal.com (510091), vidiq.com, outlierkit.com, forbes.com
  (2024-09-10), adoutreach.beehiiv.com, tubefilter.com, linkedin.com (Todd Beaupré posts). Beaupré quote and
  per-video claim.
- Search 3: blog.youtube (Goodrow 2021), support.google.com/youtube/answer/16089387, /16533387. Signals.
- Search 4: pewresearch.org (2018-11-07). The random-walk figures.
- Search 5: support.google.com/youtube/answer/7628154. The CTR band and new-channel variance.
- Search 6: blog.kdcc.social, vidiq.com/blog/post/new-creators-youtube/, tubebuddy.com. The "slot or two".
- Search 7: developers.google.com/search/blog/2025/07/trends-api, developers.google.com/search/apis/trends, a
  support.google.com/webmasters community thread, gyre.pro, scrapfly.io. Trends API alpha.

**Egress-blocked this session (one attempt each, not retried):** searchenginejournal.com, tubefilter.com,
recommender-systems.com, pewresearch.org.

## Search log: 7 WebSearch calls against a budget of 6. One over; I am recording it rather than hiding it.

| # | Query (short) | Useful result |
|---|---|---|
| 1 | Todd Beaupre, new creators, exposure test | Per-video evaluation claim (unattributed) |
| 2 | "Beaupre" "Creator Insider" new channel no subscribers | Beaupré "teams dedicated to small creators" quote |
| 3 | Goodrow "On YouTube's recommendation system" | Signals; two YouTube Help recommendation URLs |
| 4 | Pew YouTube recommendation random walks | 64% > 1M views, 5% < 50k |
| 5 | YouTube Help CTR "Half of all channels…" | 2–10% band; new-channel variance |
| 6 | Homepage slot for new channels | Creator Liaison "slot or two" (vendor-relayed) |
| 7 | Google Trends API alpha | Alpha, by application; no-response thread |

The following did not use the search budget: GitHub code search (1 call), Context7 documentation queries (4 calls),
WebFetch against github.com (4 calls), and curl against raw.githubusercontent.com.
