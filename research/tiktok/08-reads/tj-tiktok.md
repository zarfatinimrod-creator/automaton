# @tjrobertson52: what the TikTok captures show (reader: tj-tiktok family, 28.9.2026)

**What this is.** A reading of the pages a GitHub Actions runner saved on 2026-09-28 at about
21:00 UTC: the @tjrobertson52 profile, 10 video pages and 10 oEmbed responses. It is stage 2 of the
TikTok sweep, and it checks what the stage-1 scouts said in `research/tiktok/08-sweep/sweep-2026-09-28.json`.
No WebSearch was used, and no git command was run. One `curl` to TikTok's CDN, to fetch a subtitle
file, was refused by the container's egress proxy (CONNECT 403), as expected.

**The creator is named only by public handle and professional name:** @tjrobertson52, "TJ Robertson",
owner of TJ Digital. No personal or family details are recorded here. One stage-1 scout recorded a
family detail. It is not repeated here and should not be carried forward.

**Grades.**
- **rendered**: read in a capture. The file and JSON key are cited, and quotes were checked with `grep -F`.
- **github**: read on GitHub.
- **snippet**: seen only in a search-result snippet.
- **repo**: read in this repository.
- **none**: my own inference or arithmetic on graded numbers.

All counts are as of the capture time, 2026-09-28 about 21:00 UTC. **Plays measure attention, not
sales. A caption is what he said, not proof that it works.**

---

## 1. Captures read, with status

| Capture (in `research/rendered/`) | HTTP | Usable? | What it holds |
|---|---|---|---|
| `tt-profile-tjrobertson52.html` (388,292 B) | 200 | **Yes** | The `__UNIVERSAL_DATA_FOR_REHYDRATION__` JSON → `webapp.user-detail.userInfo`: the user record, `stats` and `statsV2`. `itemList` is **empty** (`"itemList":[]`). |
| `tt-profile-tjrobertson52.txt` (147 B) | 200 | Yes, as a cross-check | Visible text: "TJ Robertson / tjrobertson52 / 153 20.7K 149.8K / 💻 Owner of TJ Digital. 📊 See what we can do for you at tjrobertson.com". |
| `tt-video-tjrobertson52-{7504044860782021930, 7518238106319998263, 7519331837844442382, 7548494380689149239, 7579436705594297613, 7582743188151078199, 7592778591801232653, 7627620325940940046}.html` | 200 | **Yes (8)** | `webapp.video-detail.statusCode` is 0. `itemInfo.itemStruct` carries `desc`, `createTime`, `statsV2`, `video.duration`, `music`, `textExtra`, `IsAigc`/`ShowAIGC`/`AIGCDescription`, `isAd`, and `video.subtitleInfos` (ASR WebVTT links). |
| `tt-video-tjrobertson52-7550459646654418189.html` | 200 | **No** | `"statusCode":10204`, `"statusMsg":"item_privacy_authorization&status_deleted"`. The video is deleted or private. There is no item JSON. |
| `tt-video-tjrobertson52-7609111825233251598.html` | 200 | **No** | `"statusCode":10204`, `"statusMsg":"cross_border_violation_ur"`. The US-served page withheld the item, so there are no stats. The caption comes from oEmbed. |
| `tt-video-tjrobertson52-*.txt` (10 files, 23 B each) | 200 | No | Each is only "TikTok - Make Your Day". The text extraction drops the scripts. |
| `tt-oembed-tjrobertson52-*.json`, 9 IDs | 200 | **Yes (9)** | `title` (the caption), `author_name` "TJ Robertson", `author_unique_id`, `thumbnail_url` and its size, and `html`. |
| `tt-oembed-tjrobertson52-7550459646654418189` | **400** | **No** | `.meta.json`: `"error": "HTTP 400 Bad Request"`, `byteLength` 0, no body. This agrees with the page's "status_deleted". |

The same run also saved `tt-src-tjrobertson-com*` (5) and `tt-src-youtube-com-tjrobertsondigital*` (2).
They belong to a sibling reader's family and were **not read here**, so nothing below relies on them.

---

## 2. The facts, each graded

### 2.1 Profile

All rendered, from `tt-profile-tjrobertson52.html`, `webapp.user-detail.userInfo`, unless marked otherwise.

| Fact | Value | Evidence |
|---|---|---|
| Handle / display name | tjrobertson52 / "TJ Robertson" | `"uniqueId":"tjrobertson52"`, `"nickname":"TJ Robertson"` |
| Followers | **20,711** (displayed 20.7K) | `statsV2` `"followerCount":"20711"` |
| Total likes | **149,826** (149.8K) | `statsV2` `"heartCount":"149826"` |
| Videos | **439** | `statsV2` `"videoCount":"439"` |
| Following | 153 | `"followingCount":"153"` |
| Bio (verbatim) | "💻 Owner of TJ Digital. 📊 See what we can do for you at tjrobertson.com" | `"signature":"💻 Owner of TJ Digital. 📊 See what we can do for you at tjrobertson.com"` |
| Bio link | **No `bioLink` key anywhere in the profile JSON.** The domain appears only as plain text in `signature`. Whether the app shows a clickable link is not evidenced. | `grep -c bioLink` = 0 |
| Commerce | Not a TikTok commerce user and not a TikTok Shop seller. Not verified. | `"commerceUser":false`, `"ttSeller":false`, `"verified":false` |
| Account age | The user record's `createTime` is 1676603677, i.e. **2023-02-17**. The user id 7200957132317295659 >> 32 decodes to the same day. Reading this as the account's creation date is inference. | `"createTime":1676603677` |
| Recent items | **None listed.** The profile JSON cannot say whether he posted after 2026-04-11. An A/B flag `"reduce_user_item_list":{"vid":"v4"}` was active in this session (`webapp.app-context.abTestVersion.parameters`), so the empty list is not evidence of inactivity. That last point is inference. | `"itemList":[]` |
| Share meta | "@tjrobertson52 20.7k Followers, 153 Following, 149.8k Likes - Watch awesome short videos created by TJ Robertson" | `shareMeta.desc` |

### 2.2 The video table the critic asked for

- **Stats** are rendered, from `statsV2` in `tt-video-tjrobertson52-<id>.html`.
- **Captions** are rendered, from `desc` there and from `title` in `tt-oembed-tjrobertson52-<id>.json`. The two agree verbatim for all 8 IDs that have both.
- **Decoded date** is id >> 32 in UTC (arithmetic). For all 8 readable IDs it falls on the same date as `createTime` and 13 to 72 seconds before it.
- **Duration** is `video.duration`, in seconds.
- **AI label** is `IsAigc` / `ShowAIGC` / `AIGCDescription`. The capture has no `aigcLabelType` key.
- **Class** is my classification (grade none). The classes are: hook (a provocation leads), demo (a test or tool run), newsjack (tied to a dated external event), podcast clip, anti-black-hat, other.

| # | Video id | Decoded (UTC) | Caption, verbatim | Plays | Likes | Comm. | Shares | Saves | Dur. (s) | Class | AI label / ad |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| 1 | 7504044860782021930 | 2025-05-13 | Digital marketing will be DEAD by 2027 😱 Already using AI for 90% of my workflow! Are agencies scamming you? Watch for the exception! #AI  #MarketingTips #smallbusiness | 71,400 | 1,819 | 131 | 864 | 1,820 | 251 | hook | `IsAigc` false, `ShowAIGC` true, `AIGCDescription` ""; `isAd` false |
| 2 | 7518238106319998263 | 2025-06-21 | AI optimization is officially here and it's moving FAST. Tested 20+ new tools - here's what's actually working right now 👀 #AIOptimization #SEO #MarketingTools #DigitalMarketing #AISearch | 6,492 | 246 | 16 | 63 | 221 | 128 | demo (test report) | false / true / ""; not ad |
| 3 | 7519331837844442382 | 2025-06-24 | I just let ChatGPT choose my BANK 🏦 We went from GPS picking our routes to AI picking our entire lives. Are we all just sleepwalking now? #AI #ChatGPT #FreeWill #TechPhilosophy #SmallBusiness #marketing #AIO | 1,337 | 49 | 5 | 3 | 12 | 105 | other (opinion) | false / **false** / ""; **`"isAd":true`, `"adAuthorization":true`** |
| 4 | 7548494380689149239 | 2025-09-10 | This SEO hack lets small brands outrank bigger competitors using Medium, LinkedIn & Reddit 🎯 #ParasiteSEO #SEOHacks #DigitalMarketing #SEOTips #ContentStrategy | 2,348 | 81 | 5 | 40 | 57 | 85 | other (how-to, gray-hat tactic) | false / true / ""; not ad |
| 5 | 7550459646654418189 | 2025-09-15 | **not rendered.** The page says "status_deleted"; oEmbed returned 400. | – | – | – | – | – | – | unknown | – |
| 6 | 7579436705594297613 | 2025-12-03 | What Company Data Should You Share With AI? Connecting Google Drive to ChatGPT sounds great until the model starts pulling random call transcript chatter into your strategy docs. Here's what actually works 👇 #AI #ChatGPT #ClaudeAI #productivity #AItools | 8,780 | 223 | 21 | 27 | 102 | 136 | other (how-to, AI workflow) | false / true / ""; not ad |
| 7 | 7582743188151078199 | 2025-12-11 | What is CTR Manipulation? If your competitor suddenly outranks you with worse content, they might be using bots to game Google. Here's why that's a terrible idea 👇 #SEO #GoogleMaps #BlackHatSEO #DigitalMarketing | 3,865 | 114 | 5 | 5 | 47 | 154 | anti-black-hat | false / true / ""; not ad |
| 8 | 7592778591801232653 | 2026-01-08 | What are recommendation networks and how can you use them to show up in ChatGPT? Simple tactic anyone can do for free 👇 #aimarketingtools #SEO #marketinghack | 2,001 | 104 | 10 | 32 | 93 | 159 | other (how-to, free tactic) | false / true / ""; not ad |
| 9 | 7609111825233251598 | 2026-02-21 | Gemini 3.1 vs Opus 4.6 — better benchmarks, but does it actually win? The model isn't everything. Here's what people are missing. #Gemini3 #ClaudeAI #AIAgents #AIProductivity #GoogleGemini | – (page withheld) | – | – | – | – | – | newsjack | – |
| 10 | 7627620325940940046 | 2026-04-11 | One review = roughly one customer's worth of profit. Here's how to actually get them 👇 #SmallBusiness #GoogleReviews #MarketingTips #BusinessGrowth | 5,767 | 213 | 16 | 58 | 152 | 149 | other (how-to, Google reviews) | false / true / ""; not ad |

Row 1's play count is stored as "71400", which looks rounded to the hundred (inference). The other counts show no rounding. Every `statsV2` also carries
`"repostCount":"0"`.

### 2.3 Rankings

The ranking uses the 8 videos with stats. The ratios are arithmetic on the rendered counts (grade none),
and n = 8.

**By plays:** #1 7504044860782021930 (71,400); #2 7579436705594297613 (8,780);
#3 7518238106319998263 (6,492); then 7627620325940940046 (5,767), 7582743188151078199 (3,865),
7548494380689149239 (2,348), 7592778591801232653 (2,001), 7519331837844442382 (1,337).
- Sum: 101,990 plays. Median: 4,816.
- **One video holds 70% of the sample's plays.**

**By likes per play:** #1 7592778591801232653, 5.20% ("Simple tactic anyone can do for free");
#2 7518238106319998263, 3.79% ("Tested 20+ new tools"); #3 7627620325940940046, 3.69% (reviews);
then 7519331837844442382 3.66%, 7548494380689149239 3.45%, 7582743188151078199 2.95%,
7504044860782021930 2.55%, 7579436705594297613 2.54%.
- The biggest video has the second-lowest like rate.

**By saves:**
- Saves per play is highest on the free-tactic video (4.65%) and the tools test (3.40%). It is lowest on the opinion/ad video (0.90%).
- The saves/likes ratio is 0.70 to 1.00 on the doom hook, tools test, free tactic, reviews and parasite-SEO videos. It is 0.24 to 0.46 on the opinion, company-data and CTR videos.

**By shares per play:** the doom hook (1.21%, 864 shares) and the free/tactic videos (1.60 to 1.70%) lead.
The CTR anti-black-hat video is lowest (0.13%, 5 shares), with the opinion video close behind (0.22%).

**Sample representativeness:**
- The 8 videos carry 2,849 likes, which is **1.9% of the profile's 149,826**.
- The account averages 341 likes per video (149,826 / 439). The sample median is about 164.
- So his most successful videos are **not** in this set, which the scouts picked by what search engines had indexed. His best content is still unknown.

### 2.4 Format: what the JSON says, and what it does not

- **Audio (rendered).** All 8 readable videos use `"title":"original sound - TJ Robertson"` with `"original":true`. He uses no trending music.
- **Speech (rendered).** All 8 carry an auto-generated English caption track: `claInfo` `"enableAutoCaption":true`, `captionInfos[].isAutoGen` true, and `subtitleInfos[].Source` `"ASR"`. The WebVTT size scales with duration: 8,231 B for 251 s, 3,175 B for 85 s. That fits continuous talking (inference).
- **Length (rendered).** 85 to 251 s, median about 143 s. He posts 1.5- to 4-minute explanations, not 15-second clips. The most-played video is the longest.
- **Resolution (rendered).** 576×1024 through 2025-09-10, then 720×1280 from 2025-12-03 onward, including row 9's oEmbed thumbnail. This suggests a production or export change (inference).
- **On camera: NOT settled.** oEmbed `thumbnail_url` and `video.cover` URLs were captured, but no image bytes were rendered or viewed. Every capture is consistent with a talking person (spoken, original audio, first-person captions), but nothing shows a face. Grade none either way.
- **Hashtags (rendered, `textExtra`).** 3 to 7 per caption: 3, 5, 7, 5, 5, 4, 3, 5, 4. They mix broad tags (#ai, #seo, #digitalmarketing, #smallbusiness, #marketingtips) with niche ones (#parasiteseo, #aioptimization, #googlereviews, #blackhatseo). `isCommerce` is false on every tag.
- **Caption shape over time (rendered captions, pattern is my reading).**
  - Mid-2025 captions lead with a provocation: "DEAD by 2027 😱", "officially here and it's moving FAST", "I just let ChatGPT choose my BANK".
  - From 2025-12 the captions follow one template: a question naming the topic, then a concrete bad outcome, then a promise with 👇. Examples: "What Company Data Should You Share With AI? … Here's what actually works 👇"; "What is CTR Manipulation? … Here's why that's a terrible idea 👇"; "What are recommendation networks … Simple tactic anyone can do for free 👇".
- **Calls to action, every one across the 9 captions (rendered).**
  - Retention and curiosity: "Watch for the exception!", "👀", and "👇" in 4 captions. "Here's what people are missing." Two open questions ("Are agencies scamming you?", "Are we all just sleepwalking now?").
  - Not one caption says link in bio, follow, comment, DM, book, audit, subscribe, or names a URL (regex check over all 9).
  - **The only pointer to his business is the bio line** "See what we can do for you at tjrobertson.com".
- **AI labelling (rendered).** `IsAigc` is false on all 8 readable items, with empty `AIGCDescription`. `creatorAIComment.eligibleVideo` is false. None carries an AI-generated-content label.
- **Paid promotion (rendered field, meaning inferred).** Only 7519331837844442382 has `"isAd":true` and `"adAuthorization":true`. It also has `ShowAIGC` false and a wider `item_control`. Reading this as "authorised for, or run as, a Spark-style ad" is inference. It is also the least-played video in the sample (1,337). The organic counter may exclude paid impressions, so **nothing about the value of paid promotion can be concluded.**
- **Market (rendered).** All 8 are `"textLanguage":"en"` and `"locationCreated":"US"`: English-language US content. This is recorded as market context only.
- **TikTok's own topic labels (rendered).** `diversificationLabels` is "Business & Finance", "Education", "Culture & Education & Technology" on 7 of 8. On 7579436705594297613 it is null (`CategoryType` 120, against 116 for the others).

### 2.5 Is he still posting after 2026-04-11?

**Unsettled.**
- The profile's `itemList` is empty.
- No capture contains an @tjrobertson52 video id later than 7627620325940940046. I grepped all 11 HTML captures for 19-digit ids: the only later ids decode to 2026-09-28 and are request and web ids of the fetch itself.
- The sample is what search engines indexed, not his feed.

Two numbers bound the "daily content" claim (arithmetic, grade none):
- 439 videos since the account record of 2023-02-17 (1,319 days) averages **about 2.3 videos a week**.
- If he stopped on 2026-04-11, it would be about 2.7 a week.
- "Daily" is only possible over a window of about 15 months, which the captures cannot locate.

### 2.6 The two unreachable videos

- **7550459646654418189** is **gone or private**: page "status_deleted", oEmbed 400. The caption one scout reported ("SEO might be wasting your money if no one's searching for...") **cannot be confirmed from TikTok now.**
- **7609111825233251598** is withheld from the US-served web page (`cross_border_violation_ur`). oEmbed still gives its caption, so the caption is rendered but the stats are not.

---

## 3. Lessons

Each lesson gives its source, its grade, and whether it fits a faceless, no-customer-contact, ₪0,
honest brand.

The binding context comes from the repo:
- TikTok is not a revenue line (`docs/REJECTED.md`, "TikTok, as a revenue line").
- The TikTok posting API is closed to individuals.
- Mass faceless AI video is RED.
- The GREEN version of short video is a few narrated screen recordings of our own tools, with a ceiling of hundreds of shekels a month (`research/colony-sweep/scouts/distribution--short-video.md`).

So these lessons are mostly about **the page and the offer**, and they carry over to the site,
YouTube Shorts and email. They are not a TikTok plan.

**L1. The ask lives off-platform, and the content carries no ask at all.**
- **What he does:** the only commercial pointer is one bio line, "See what we can do for you at tjrobertson.com". Nine captions out of nine contain no buy, DM, comment, "link in bio" or booking prompt. He is neither a commerce user nor a Shop seller.
- **Transfer:** our free outputs (the PCN874 validator, the calculators, any short) give the value, and the Pro ask sits on our own page **after** the result. `products/il-biz-tools/pcn874.html` currently contains no Pro or Gumroad mention (repo: `grep` returned 0 for `gumroad` and `\bpro\b`), so the validator has a deposit and no ask. That matches the critic's note.
- **Source:** 2.1 (`signature`, `commerceUser`, `ttSeller`) and 2.4 (CTA inventory).
- **Grade:** rendered for the facts; the lesson is inference.
- **Fits:** faceless yes, no contact yes, ₪0 yes, honest yes.

**L2. The explainer template: question, concrete bad outcome, promise.**
- **What he does:** since 2025-12 his captions read "What is X? / what goes wrong / here's what actually works 👇".
- **Honest Hebrew form:** "מה זה מספר הקצאה? / חשבונית בלי מספר הקצאה = מע״מ תשומות שלא יוכר / כך בודקים ב-10 שניות". It works as a page title, a Shorts title, or an email subject. The example's legal claim must be checked against a primary source before use.
- **Source:** captions of rows 6, 7 and 8.
- **Grade:** rendered captions. That the template works is **none** (3 videos, no control).
- **Fits:** faceless, no contact and ₪0 yes. Honest only if the bad outcome is real and sourced and the payoff is delivered on the page. No teaser that the content does not pay off.

**L3. Build things people save: checklists and "free tactic" references.**
- **What he does:** the highest like rate (5.20%) and save rate (4.65%) in the sample went to "Simple tactic anyone can do for free 👇". The tools test ("Tested 20+ new tools") is second on both. Saves roughly equal likes on the utility videos and fall to 0.24 to 0.46 of likes on the opinion and warning videos.
- **Transfer:** our reference assets should be keep-worthy lists, for example the PCN874 rejection reasons (what our checker catches and what it does not, which `pcn874.html` already lists honestly) or a dated table of VAT and threshold changes.
- **Source:** 2.2 and 2.3.
- **Grade:** rendered counts. The causal link is **none** (n = 8, topic and date confounded).
- **Fits:** faceless yes, no contact yes, ₪0 yes, honest yes.

**L4. The doom hook bought the reach, and we cannot use it.**
- **What he does:** "Digital marketing will be DEAD by 2027 😱 … Are agencies scamming you?" has 71,400 plays, 70% of the sample. It also has the most shares (864) and saves (1,820). **It was not empty attention: people saved and shared it.**
- **Why we reject it anyway:** it is a fear forecast plus an accusation against a class of competitor, and MISSION rule 4 bans engagement bait and deception. The honest substitute is a **true, dated, checkable surprise**, for example a real rule change with its effective date and source.
- **Source:** row 1.
- **Grade:** rendered counts. Why it spread is **none**: one outlier, and it may have been boosted; its own `isAd` is false.
- **Fits:** the fear version, **no**. The true-surprise version: faceless yes, no contact yes, ₪0 yes, honest yes, if the fact is verified against the primary source first.

**L5. Trust content earns trust, not shares. Put it where the buying happens.**
- **What he does:** the anti-black-hat CTR video has the lowest share rate in the sample (0.13%, 5 shares). The transparency pitch still sits in his bio and agency copy, per the snippets in the sweep.
- **Transfer:** our honesty lines ("the calculation never leaves your browser", "what this checker does not check") belong on the product and pricing pages, next to the ask. They should not be treated as a reach play.
- **Source:** row 7; `products/il-biz-tools/index.html` FAQ (repo, already says calculations stay in the browser).
- **Grade:** rendered counts; inference.
- **Fits:** faceless yes, no contact yes, ₪0 yes, honest yes.

**L6. Calibrate expectations. A practised marketer reached 20.7K followers in 439 videos.**
- **The numbers:** an experienced marketer, speaking in his own name, in English to the US market, has 20,711 followers and a sample median of about 4,800 plays after 439 videos over up to about 3.6 years.
- **What it means for us:** a faceless Hebrew account posted by hand into a far smaller language market should expect less. This supports the repo's short-video ceiling, and nothing here reopens TikTok as a line.
- **Source:** 2.1 and 2.3; `docs/REJECTED.md`; `distribution--short-video.md` (repo).
- **Grade:** rendered numbers; the comparison is inference.
- **Fits:** this is a calibration lesson, not a tactic.

**L7. If we ever make shorts: 1.5 to 3 minutes of spoken explanation, captions on, original audio, AI voice labelled.**
- **What he does:** his format is long for TikTok (85 to 251 s), speech-led (an ASR track on every video) and uses no trending music. His own videos carry no AI label, and a human speaking needs none.
- **Our version:** a Kokoro-narrated screen recording of our own tool. It is synthetic audio, so it **must** carry the platform's AI label. That is already a repo rule in `docs/REJECTED.md` (publishing AI content without the label is forbidden).
- **Source:** 2.4.
- **Grade:** rendered formats. Whether a faceless version performs is **none**.
- **Fits:** faceless yes if screen-only; no contact yes; ₪0 yes (Kokoro is local); honest yes if labelled. Posting stays manual owner work or the official YouTube API, per `distribution--short-video.md`.

**L8. One bio line, brand-only: identity plus one soft pointer.**
- **What he does:** his bio has two emoji-led clauses, who he is and where to look. It has no hashtags, no list, no urgency.
- **Our version:** "מחשבונים חינמיים לעסקים בישראל. בדיקת קובץ PCN874 ←" plus the site, with no personal name (MISSION, "פרסום בעילום שם").
- **Source:** 2.1.
- **Grade:** rendered bio; the lesson is inference.
- **Fits:** faceless yes, no contact yes, ₪0 yes, honest yes.

**L9. A method lesson for the colony: snippet captions can belong to the wrong video.**
- **What happened:** four stage-1 scouts used a caption the search index had attached to 7627620325940940046. Three of them, and the critic, read it as a repurposed podcast clip. The rendered caption is about Google reviews.
- **The rule this implies:** no caption or count reaches the owner at snippet grade when a capture can be made.
- **Source:** row 10 against sweep scouts tj-who, sales-tiktok, marketing-tiktok and gap, plus the critic's notes.
- **Grade:** rendered.
- **Fits:** yes, as process.

**What is not a lesson, stated so it is not drawn later:**
- Nothing here shows that his TikTok brings him clients.
- Nothing here shows what his videos teach. Only captions were read; the transcripts are in §5.
- Nothing here shows that paid promotion helped or hurt.
- **Sales:** none of his 9 captions teaches selling (closing, outreach, pricing). For the owner's "Sales" question his TikTok gives marketing lessons only. The sales mechanics would have to come from his site (sibling reader) and from the gap scout on offers and pricing.

---

## 4. Scout claims confirmed, corrected or refuted

Scouts are named by their `angle` key in `sweep-2026-09-28.json`. The critic's numbering is 1-based.

### Confirmed (rendered)
1. **Identity and bio:** @tjrobertson52 is "TJ Robertson", "Owner of TJ Digital", pointing to tjrobertson.com. All scouts said this. It is confirmed by `nickname` and `signature`.
2. **Caption of 7504044860782021930**, verbatim as tj-who and gap quoted it, including "Watch for the exception!" and the three hashtags.
3. **Caption of 7548494380689149239**, verbatim as gap quoted it, with 5 hashtags.
4. **Captions quoted by tj-playbook:** 7518238106319998263 ("Tested 20+ new tools…"), 7582743188151078199 (CTR manipulation, "Here's why that's a terrible idea 👇") and 7609111825233251598 ("Gemini 3.1 vs Opus 4.6 — better benchmarks, but does it actually win?"). All confirmed.
5. **Gap's truncated caption of 7519331837844442382** ("I just let ChatGPT choose my BANK 🏦 We went from GPS ...") is confirmed. The full text is in row 3.
6. **Gap's low-confidence "1,819 likes / 131 comments"** does belong to 7504044860782021930 (`statsV2`).
7. **The critic's and gap's decoded dates** for all 10 ids are confirmed (id >> 32). Each readable `createTime` falls on the same date.
8. **"No id later than 2026-04-11"** is confirmed for every id in the captures. It is still not proof that he stopped (§2.5).
9. **Sales-tiktok's point** that none of his captions is about closing or outreach is confirmed across all 9 captions.
10. **Faceless-digital-products' point** that TikTok is discovery and the sale happens on your own storefront is consistent for this account: `commerceUser` false, `ttSeller` false, no caption CTA.
11. **Gap's classes:** the CTR video is anti-black-hat and the parasite-SEO video is gray-hat. Confirmed at caption level.

### Corrected
1. **Audience.** The scouts had 17K followers, 112.7K likes and 140 following, with the snapshot undated. The capture shows **20,711 followers, 149,826 likes, 153 following and 439 videos**.
2. **Tenure in the TikTok bio.** Tj-playbook said 16 years, from a "TikTok bio snippet". **The current bio contains no tenure claim.** Any 15, 16 or 17 figure is off-TikTok (LinkedIn, podcast) and snippet grade.
3. **Hashtag count.** Tj-playbook said 4 to 5 per video. The actual range is **3 to 7**.
4. **"Active for at least 16 months."** Tj-who's four ids span **11 months** (2025-05-13 to 2026-04-11). The account record itself dates to **2023-02-17**.
5. **"The TikTok bio links tjrobertson.com."** Tj-who said this. The domain is **plain text** in `signature`, and there is no `bioLink` key. A clickable link is unevidenced.
6. **7519331837844442382 as a "demo or live experiment".** Gap said this. The full caption is an opinion piece (#FreeWill #TechPhilosophy), and it is the **only ad-flagged item** (`isAd`, `adAuthorization` true).
7. **"The format is his own face on camera", stated as fact** by faceless-digital-products. It is downgraded to **unverified**. The captures prove speech (ASR tracks, original audio), not a face.
8. **The critic's "the oEmbed thumbnail settles face-on-camera".** The `thumbnail_url` was captured, but its image was not. It remains open (§5).
9. **"Daily SEO/GEO content".** This was a LinkedIn snippet. The lifetime average is about 2.3 videos a week (439 videos over 1,319 days). "Daily" fits only a window of about 15 months. It is not refuted, but it cannot be quoted as his cadence.

### Refuted
1. **Caption of 7627620325940940046 as "🎙️ AI SEO with TJ Robertson: How to Rank in 2025 Using ChatGPT, Google AI, and LLMs".** Tj-who, sales-tiktok and gap gave this caption, and marketing-tiktok built its theme (c), "AI-SEO podcast clips", on it. The **real caption** is "One review = roughly one customer's worth of profit. Here's how to actually get them 👇 #SmallBusiness #GoogleReviews #MarketingTips #BusinessGrowth". The page `desc` and the oEmbed `title` agree. It is a Google-reviews how-to, **not a podcast clip**. The search index had attached a podcast or YouTube title to this TikTok URL.
2. **The critic's decode note** that 7627620325940940046's "'How to Rank in 2025' … fits the repurposed-podcast-clip reading" falls with claim 1.
3. **Faceless-digital-products citing 7627620325940940046 and 7504044860782021930** for "traditional search 'obsolete within two years'" and "context engineering". Neither caption says this. It may be in the audio, which nobody has read.

### Still open
1. **The caption of 7550459646654418189** ("SEO might be wasting your money if no one's searching for...", marketing-tiktok only). The video is **deleted or private** and oEmbed returns 400, so it cannot be settled from TikTok. The "check search demand first" tactic cannot cite him.
2. **Posting after 2026-04-11** (§2.5).
3. **Face on camera** (§2.4).
4. **His most successful videos.** The captured 8 hold 1.9% of his likes.
5. **What the videos actually teach.** This needs the transcripts (§5).
6. **Tenure, podcasts, "content machine", retainer and audit prices.** These rest on off-TikTok snippets or the sibling `tt-src-*` captures, and are outside this family.

---

## 5. URLs worth rendering next

Only URLs seen in these captures are listed.

**A. The spoken words: ASR WebVTT transcripts. This is the biggest remaining gap.**
- Each readable video page carries `video.subtitleInfos[0].Url` with `Source` "ASR", `Format` "webvtt", eng-US.
- The URLs are signed and **expire 2026-09-30 about 21:00 UTC** (`UrlExpire` 1790802xxx).
- The robust route is to re-render the 8 video pages and fetch `subtitleInfos[0].Url` **in the same runner job**. The current URLs, exactly as captured:

```
7504044860782021930 https://v16m-webapp.tiktokcdn-us.com/9d102aa24c2632f9711e79400063f2f2/6abd797a/video/tos/useast5/tos-useast5-v-0068-tx/0876ee82d24e4d9b9923ba2bd991024b/?a=1988&bti=ODszNWYuMDE6&&bt=29495&ft=4KLMeMzm8Zmo0OWRoa4jVybOdpWrKsd.&mime_type=video_mp4&rc=Mzlna3A5cnJ1MzMzZzgzNEBpMzlna3A5cnJ1MzMzZzgzNEBeZTQyMmRrZGVhLS1kLy9zYSNeZTQyMmRrZGVhLS1kLy9zcw%3D%3D&l=202609282100462F943908F8022231C694&btag=e00058000
7518238106319998263 https://v16m-webapp.tiktokcdn-us.com/17f775cf773f7b1664dd41e4d3568911/6abd7900/video/tos/useast5/tos-useast5-v-0068-tx/597844c3d4304d8b9688776b7f49c424/?a=1988&bti=ODszNWYuMDE6&&bt=1593&ft=aEKq_qT0mIoPD12Ued1I3wUhqtAbMeF~O5&mime_type=video_mp4&rc=ajNob3Q5cjo1NDMzZzgzNEBpajNob3Q5cjo1NDMzZzgzNEBoNHNeMmRrX19hLS1kLy9zYSNoNHNeMmRrX19hLS1kLy9zcw%3D%3D&l=202609282100489B56E12277279932833E&btag=e00050000
7519331837844442382 https://v16m-webapp.tiktokcdn-us.com/e231a7dfa7b67133eac732a8ff66ffee/6abd7948/video/tos/useast5/tos-useast5-v-0068-tx/974c93ed4f784152b721eb068a498fb3/?a=1988&bti=ODszNWYuMDE6&&bt=1426&ft=aEKq_qT0mIoPD12oud1I3wUsp2AbMeF~O5&mime_type=video_mp4&rc=M2k6c3E5cmUzNDMzZzgzNEBpM2k6c3E5cmUzNDMzZzgzNEBgYHAuMmQ0ZGFhLS1kLy9zYSNgYHAuMmQ0ZGFhLS1kLy9zcw%3D%3D&l=202609282102234714A564A36F234F3EDC&btag=e00050000
7548494380689149239 https://v16m-webapp.tiktokcdn-us.com/c181dd01055d43be11e688464ba6c7a2/6abd78d2/video/tos/useast5/tos-useast5-v-0068-tx/3b15cba77d004d8f89880fdf791c5c80/?a=1988&bti=ODszNWYuMDE6&&bt=2271&ft=aEKq_qT0mIoPD12yMd1I3wUSyzAbMeF~O5&mime_type=video_mp4&rc=Mzg0cW05cmZ0NjMzZzgzNEBpMzg0cW05cmZ0NjMzZzgzNEAzZTNlMmRjNC1hLS1kLy9zYSMzZTNlMmRjNC1hLS1kLy9zcw%3D%3D&l=20260928210044F6C2796438F11B750D8A&btag=e00050000
7579436705594297613 https://v16m-webapp.tiktokcdn-us.com/4e9b25a36caab8542fc5062257854f0b/6abd790d/video/tos/useast5/tos-useast5-v-0068-tx/1793ac3fa4294051b2cb2ee6607ef895/?a=1988&bti=ODszNWYuMDE6&&bt=29476&ft=aEKq_qT0mIoPD12Yed1I3wUMO_AbMeF~O5&mime_type=video_mp4&rc=M3BuM3I5cndzNzMzZzgzNEBpM3BuM3I5cndzNzMzZzgzNEBgbWQ2MmRrL2thLS1kLy9zYSNgbWQ2MmRrL2thLS1kLy9zcw%3D%3D&l=20260928210052798D82ECD9EBC94EEF29&btag=e00050000
7582743188151078199 https://v16m-webapp.tiktokcdn-us.com/abc080ebe5c49584dcdcef1ea1a3d431/6abd791c/video/tos/useast5/tos-useast5-v-0068-tx/ac717382881f41beb8f0db21388cbee4/?a=1988&bti=ODszNWYuMDE6&&bt=29497&ft=aEKq_qT0mIoPD122ed1I3wU5~cAbMeF~O5&mime_type=video_mp4&rc=Mzpwd3c5cjlvNzMzZzgzNEBpMzpwd3c5cjlvNzMzZzgzNEBocGJnMmRjLnFhLS1kLy9zYSNocGJnMmRjLnFhLS1kLy9zcw%3D%3D&l=202609282100490904FB994558B04DF092&btag=e00050000
7592778591801232653 https://v16m-webapp.tiktokcdn-us.com/f6bd25dfd015f88b907e7cce66289185/6abd7971/video/tos/useast5/tos-useast5-v-0068-tx/e023fb2a2efa49edb60d7310a511e17b/?a=1988&bti=ODszNWYuMDE6&&bt=29472&ft=aEKq_qT0mIoPD12Vud1I3wU-F4AbMeF~O5&mime_type=video_mp4&rc=M2U8dW05cmppODMzZzgzNEBpM2U8dW05cmppODMzZzgzNEBoLnMwMmRrY2NhLS1kLy9zYSNoLnMwMmRrY2NhLS1kLy9zcw%3D%3D&l=2026092821020983AE220089425B502023&btag=e00050000
7627620325940940046 https://v16m-webapp.tiktokcdn-us.com/423a3f05c0e13279c6c0e88b4df8042d/6abd7934/video/tos/useast5/tos-useast5-v-0068-tx/a573e8d06e4942c7aef5cd129a3a4f19/?a=1988&bti=ODszNWYuMDE6&&bt=29501&ft=4KLMeMzm8Zmo0qrRoa4jVZWfdpWrKsd.&mime_type=video_mp4&rc=ajdtc3I5cjNmOjMzZzgzNEBpajdtc3I5cjNmOjMzZzgzNEBuLm5qMmQ0LWFhLS1kLy9zYSNuLm5qMmQ0LWFhLS1kLy9zcw%3D%3D&l=202609282101187326388BE73735776679&btag=e00050000
```

Page URLs to re-render, from the `.meta.json` `url` fields:
- `https://www.tiktok.com/@tjrobertson52/video/7504044860782021930`
- `…/7518238106319998263`
- `…/7519331837844442382`
- `…/7548494380689149239`
- `…/7579436705594297613`
- `…/7582743188151078199`
- `…/7592778591801232653`
- `…/7627620325940940046`

**B. Face on camera: oEmbed thumbnails.**
- Signed, **expiring 2026-09-30 21:00 UTC** (`x-expires=1790802000`). A session that can view images must look at them.
- These settle only the opening frame, not the whole video.
- Current `thumbnail_url` values are in each `tt-oembed-tjrobertson52-<id>.json`. The two highest-value ones are the top video and the latest one:
  - `https://p19-common-sign.tiktokcdn-us.com/tos-useast5-p-0068-tx/ogrxEJviiBAMuaAUAdi2BK0AABCwMBqEIWf9ji~tplv-tiktokx-origin.image?dr=9636&x-expires=1790802000&x-signature=v31o1CG31cNmBcIgZLreZuyt9fQ%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5` (7504044860782021930)
  - `https://p19-common-sign.tiktokcdn-us.com/tos-useast5-p-0068-tx/osqDEPB0BwAI1DKkAi7BfAbAaOdB7i0AWJ3waB~tplv-tiktokx-origin.image?dr=9636&x-expires=1790802000&x-signature=eYKadmfR0Jaj9KmbIfhAAHupiAY%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5` (7627620325940940046)

**C. Not worth re-rendering:**
- `https://www.tiktok.com/@tjrobertson52` returned an empty `itemList` under an active `reduce_user_item_list` flag. A plain re-render will probably repeat it (inference).
- `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@tjrobertson52/video/7550459646654418189` returned 400 because the video is gone.
- The `music/original-sound-TJ-Robertson-*` and `tag/*?refer=embed` links in the oEmbed `html` lead to one-video sound pages and generic hashtag feeds.

No other URL in these captures bears on the questions above.
