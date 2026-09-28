# Marketing creators on TikTok: what the captures show (reader: marketing-creators family, 28.9.2026)

**What this is.** Stage 2 of the TikTok sweep, the **marketing half** of the owner's request (organic content,
search and AI-search visibility, decision-stage content, lead magnets, email lists, faceless promotion of digital
products, and TikTok's own small-business lead guidance). It reads the pages a GitHub Actions runner saved on
2026-09-28 at about 21:00 UTC into `research/rendered/`, and it checks what the stage-1 scouts said in
`research/tiktok/08-sweep/sweep-2026-09-28.json`. No WebSearch was used. No git command was run. Nothing outside
this file was written.

**People are named only by public handle and public professional name** (the oEmbed `author_name`). No personal
or family details are recorded, and the one location field in a capture (`locationCreated`) is deliberately left
out.

**Grades.**
- **rendered**: read in a capture here. The file and JSON key are cited, and every quote was checked with `grep -F`.
- **github**: read on GitHub.
- **snippet**: seen only in a search-result snippet (stage 1).
- **repo**: read in this repository.
- **none**: my own inference, or arithmetic on graded numbers.

Two reading rules apply throughout. **A caption is what a creator said, not proof that it works.** **Plays measure
attention, not sales.**

---

## 1. Captures read, with status

All nine metas report `"status": 200`, `"truncated": false`, `"error": null`. Status 200 is not the same as usable:
three of the HTML pages are shells.

| Capture (in `research/rendered/`) | HTTP | Usable? | What it holds |
|---|---|---|---|
| `tt-src-ads-tiktok-com-business-en-us-blog-generate-small-business-lead.html` (1,155,388 B) + `.txt` (12,005 B) | 200 | **Yes** | TikTok For Business blog post "How to generate leads for your small business on TikTok", dated "September 05, 2024". The full article is in the `.txt` (lines 89-251); the `.html` carries the link targets. |
| `tt-oembed-neilpatel-7537667346354244919.json` | 200 | **Yes** | `title` = full caption ("Want AI Chatbots to Recommend You? Stop Writing for Clicks…"), `author_name` "Neil Patel", `thumbnail_url`. No stats. |
| `tt-oembed-neilpatel-7564756481506086157.json` | 200 | **Yes** | `title` = full caption ("ChatGPT Just Revealed Its Two-Step Playbook for AI Visibility…"). No stats. |
| `tt-oembed-the-leap-7410811022140787973.json` | 200 | **Yes** | `title` = caption ("Try these lead magnet ideas…"), `author_name` "The Leap". No stats. |
| `tt-oembed-meaningful-marketing-7270134688277187841.json` | 200 | **Yes, but not for the account the scouts named** | The requested URL was `@meaningful.marketing/video/7270134688277187841`. The response says `"author_unique_id":"alexjames.b2bmessaging"`, `"author_name":"Alex James \| B2B Messaging"`, caption "Say something ✨new✨ #Marketing #Copywriting #SmallBusinessTips #Entreprenuer #Startups". |
| `tt-oembed-nickmacsocial-7360084727291727109.json` | 200 | **Yes** | Caption "Alex Hormozi’s value equation explained in 1 minute" + hashtags. |
| `tt-video-nickmacsocial-7360084727291727109.html` (410,787 B) | 200 | **Yes** | `__UNIVERSAL_DATA_FOR_REHYDRATION__` → `webapp.video-detail` (`statusCode` 0) → `itemInfo.itemStruct`: `desc`, `createTime`, `stats`/`statsV2`, `authorStats`, `author.signature`, `video.duration`, `stickersOnItem`, `IsAigc`, `isAd`, `anchors`, and an auto-generated WebVTT caption link. |
| `tt-video-nickmacsocial-7360084727291727109.txt` (23 B) | 200 | No | Only "TikTok - Make Your Day". The text extraction drops the scripts. |
| `tt-src-tiktok-com-discover-how-to-promote-digital-products-faceless.html` (373,511 B) | 200 | **No, for content** | Shell. The rehydration JSON holds `webapp.kap-detail.wordDetail` (the keyword record) and `kap.init.config` (`"count":6,"preFetch":true`), but **no item list**: `itemList` 0 hits, `playCount` 0 hits, `/video/` 0 hits. |
| `tt-src-tiktok-com-discover-how-to-sell-a-digital-product-as-a-faceless.html` (367,041 B) | 200 | **No, for content** | The same shell: keyword record only, no videos, no plays. |
| both discover `.txt` files (23 B each) | 200 | No | "TikTok - Make Your Day". |

**Consequence for the brief.** I was asked to mine the two discover pages for their most-watched faceless
digital-product videos (caption, id, date, plays). **That cannot be done from these captures:** neither page carries
a single video. The runner was not flagged as a bot (`"isBot":false`, `botType` "others", region US), and the pages
load their list client-side after the first paint (`"count":6,"preFetch":true` with no items in the HTML). This is
systematic, not bad luck. The other two discover captures in the same run (`…discover-value-equation-hormozi`,
`…discover`) and the tag capture (`…tag-saas-lang-en`) have 0 `itemList` and 0 `playCount` hits too. The sales
reader found the same on the Hormozi discover page independently (`research/tiktok/08-reads/sales-creators.md` §1).
**No ranking of faceless digital-product videos exists in this file, and none should be invented from it.**

---

## 2. The facts, each graded

### 2.1 TikTok's own small-business lead guidance is a paid-ads product

Source for every row: `tt-src-ads-tiktok-com-business-en-us-blog-generate-small-business-lead.txt`, line numbers given.

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F1 | The page is TikTok's first-party guide, dated **September 05, 2024** (two years before capture). | rendered | line 91 |
| F2 | **Lead generation on TikTok is defined as a paid advertising objective**, not an organic practice: "On TikTok, lead generation is an advertising objective that lets you cultivate prospects and engage leads for your business". Every set-up step starts in Ads Manager ("Choose the "lead generation" objective in TikTok Ads Manager"). | rendered | lines 105, 188 |
| F3 | Two lead-capture routes, both inside an ad campaign: **"In-App Instant Form (Native Lead Gen)"**, good for "Building customer/email lists", and **"Your Website Form (Web Lead Generation)"**, which relies on the TikTok Pixel. | rendered | lines 151-158, 168-182 |
| F4 | The form requires a privacy policy: "Be sure you have your privacy policy URL ready to include in the form." | rendered | line 192 |
| F5 | **The learning-phase threshold, stated first-party:** "It lasts until you reach 20+ conversions within 5 days after the campaign starts." Budget: "Set your budget @ 10x your expected CPA (or 20x if you're a financial services company)", and "use a Lowest Cost bidding strategy with a daily budget set at 10x your expected CPL". Scale by "a maximum of 50% per day". | rendered | lines 213, 231, 233 |
| F6 | Creative rules for the ads: "3-5 is the magic number" of creatives per ad group; "creative fatigue … tends to occur after 5-7 days". | rendered | line 222 |
| F7 | "Spark Ads allow you to add a boost to your own content, or a creator's organic or branded content", "an easy way to partner with creators and make ads that feel organic". | rendered | line 238 |
| F8 | Its two statistics are weak by its own footnotes: the "60% increase in customer acquisition costs" cites "[1] ProfitWell: How is CAC Changing Over Time? 2019", and "24% see a lower cost per lead (CPL) on TikTok" cites "[2] TikTok Internal Analysis". A seven-year-old third-party number and a vendor's self-measurement. | rendered | lines 93, 164, 250-251 |
| F9 | Lead-form use cases it lists for commerce include "Sign up for newsletter and/or loyalty program" and "Interactive product quiz"; for service businesses, "Sign up for your company newsletter". | rendered | lines 118, 140, 146 |
| F10 | **Absent from the page:** "hook", "unique selling", "USP", "call to action" and "consistent" each return 0 hits (`grep -ci`). "organic" appears once (the Spark Ads line), "native" four times (all about the Instant Form). | rendered (absence) | `grep -ci` over the `.txt` |
| F11 | The page links a Hebrew edition of itself (`https://ads.tiktok.com/business/he-IL/blog/generate-small-business-leads-on-tiktok`) and an organic-sounding sibling post, `https://www.tiktok.com/business/en-US/blog/small-business-marketing-tiktok-ultimate-guide?ab_version=experiment_1`, as the target of "boosting TikTok creators' original content". Neither was captured. | rendered (links) | anchor data in the `.html` |

### 2.2 AI-search visibility: Neil Patel's two captions

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F12 | Video 7537667346354244919, uploaded **2025-08-12** (id >> 32 = 1754999939 → 2025-08-12 11:58:59 UTC). Caption, verbatim in part: "Want AI Chatbots to Recommend You? Stop Writing for Clicks. Start Writing for Decisions! The more you optimize for decision-stage queries (not just top-of-funnel keywords), the more chatbots will cite you, even if your Google rankings stay the same. The sooner you realize AI rewards simplicity (bullet points, pros/cons, comparison tables)…" and "AI chatbots don’t surface "top 10 tips" articles, they recommend clear, actionable comparisons ("Best X for Y")." Hashtags #AIContent #DecisionSEO #Chatbot. | rendered (as a claim) | `tt-oembed-neilpatel-7537667346354244919.json` `title`; id decode (none) |
| F13 | Video 7564756481506086157, uploaded **2025-10-24** (id >> 32 = 1761307120 → 11:58:40 UTC). Caption: "ChatGPT Just Revealed Its Two-Step Playbook for AI Visibility. The more you create research-driven content that answers specific questions from Reddit and Quora, instead of promotional pitches, the faster you'll earn ChatGPT's trust and recommendations. The sooner you build authority distribution across multiple platforms (not just your website)…" ending "…spreading your expertise across multiple trusted sites…". | rendered (as a claim) | `tt-oembed-neilpatel-7564756481506086157.json` `title` |
| F14 | **Neither caption cites a study, a dataset or a link.** The second one's "ChatGPT Just Revealed" names no document that was revealed. Both use the same "The more you… / The sooner you… / The bottom line?" template, which reads as a caption format, not a finding. | rendered (absence); the template reading is none | both `title` fields |
| F15 | The oEmbed responses carry no play, like or follower counts, so the reach of these two videos is **unknown**. Whether he is on camera is not settled either: both use "original sound - Neil Patel" (his own audio), and the thumbnails are signed CDN images this container cannot fetch. | rendered (music field); on-camera unknown | `html` field, `♬ original sound - Neil Patel` |

### 2.3 Lead magnets and email: @the.leap

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F16 | Video 7410811022140787973, uploaded **2024-09-04**. Caption, in full apart from hashtags: "Try these lead magnet ideas to drive subscriptions to your email list. 💌 To learn more about growing your email list, take The Leap Way Mini-Course Series linked in our bio." | rendered | `tt-oembed-the-leap-7410811022140787973.json` `title` |
| F17 | **The caption names no lead-magnet idea.** "5 biggest mistakes", "7 biggest pitfalls", "3-7 day email mini-course", "workbooks" and "pain-first converts better" are **not** in it. Whatever ideas the video lists are in its on-screen text or audio, which were not captured. | rendered (absence) | same field |
| F18 | The account is a company (a creator-platform brand), and its own CTA is itself a lead magnet: a free mini-course series in the bio. The audio is a licensed track ("spin u round - Nafeesisboujee & kkanji"), not a voice-over, which is consistent with a text-on-screen format; that last part is inference. | rendered (caption, music); format is none | `title`, `html` |

### 2.4 Copywriting: the video listed as "@meaningful.marketing"

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F19 | The oEmbed for `@meaningful.marketing/video/7270134688277187841` returns a **different author**: `"author_unique_id":"alexjames.b2bmessaging"`, `"author_name":"Alex James \| B2B Messaging"`, and its `cite` URL is `https://www.tiktok.com/@alexjames.b2bmessaging/video/7270134688277187841`. TikTok resolves oEmbed by video id, so this id belongs to that account now. Whether the account was renamed or the scout mis-paired handle and id is **unknown**. | rendered (author); cause none | `tt-oembed-meaningful-marketing-7270134688277187841.json` |
| F20 | The caption is "Say something ✨new✨" plus five hashtags, uploaded **2023-08-22**. The stage-1 title "The Ultimate Copywriting Hack for Meaningful Marketing" does not appear in the capture; it was probably a search-engine title. The capture gives the principle's name and nothing else. | rendered | `title`; id decode |

### 2.5 Offer framing: @nickmacsocial's value-equation explainer

Source: `tt-video-nickmacsocial-7360084727291727109.html`, `itemInfo.itemStruct`.

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F21 | Caption "Alex Hormozi’s value equation explained in 1 minute", uploaded **2024-04-20** (`"createTime":"1713653268"`), `"duration":60`. On-screen sticker: `"stickerText":["Value Equation\nBreakdown"]`. **The caption and sticker do not state the equation.** | rendered | `desc`, `createTime`, `video.duration`, `stickersOnItem` |
| F22 | Reach is tiny: **1,147 plays, 12 likes, 0 comments, 4 shares, 5 saves.** The account has **3 followers, 9 videos, 379 total likes**. Its bio calls it a trades account posting "Construction memes & marketing tips". | rendered | `statsV2`, `authorStatsV2`, `author.signature` |
| F23 | Not an ad and not AI-labelled: `"isAd":false`, `"IsAigc":false`, `"AIGCDescription":""`. It carries a CapCut anchor (`"keyword":"CapCut · Editing made easy"`), i.e. it was edited in CapCut. TikTok tags it "Business & Finance" and "Education" (`diversificationLabels`). | rendered | named keys |
| F24 | An auto-generated English caption track exists (`"captionFormat":"webvtt"`, `"isAutoGen":true`), served from a signed `https://www.tiktok.com/aweme/v1/play/?…format=webvtt…` URL that expires 2026-09-30 21:03 UTC (`"expire":"1790802235"`). The transcript was not fetched. | rendered | `video.claInfo.captionInfos` |
| F25 | The primary source this was a fallback for **did render**, in another family: `tt-oembed-ahormozi-7336007528070958382.json` (status 200) has the caption "The Value Equation: Dream outcome + Perceived Likelihood of Achieving ÷ Time delay + Effort and Sacrifice = Value". The sales reader owns it (`sales-creators.md`). | rendered (cross-check only) | that file's `title` |

### 2.6 The faceless digital-product discover pages

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F26 | Both keyword pages exist and resolve with `"webapp.kap-detail":{"statusCode":0`. "how to promote digital products faceless" has keyword `"createTime":"1687914961"` (**2023-06-28**); "how to sell a digital product as a faceless" has `"createTime":"1750184188"` (**2025-06-17**). Both have `"site":"app_search"` and `"pageType":7`. Reading `app_search` as "made from in-app search demand" is inference. | rendered (keys); meaning none | `webapp.kap-detail.wordDetail` in each discover `.html` |
| F27 | **TikTok classes both as non-shopping queries:** `"keywordFeatures":{"keywordEcomIntent":0}` on each. The people typing them want to learn to sell, not to buy. That reading is mine, but it matches what the phrasing asks. | rendered (flag); meaning none | same object |
| F28 | **No video, caption, id, creator, date or play count is present on either page** (section 1). The stage-1 claim that templates and mini-courses are the genre's top sellers therefore stays at snippet grade. | rendered (absence) | `grep -c itemList` = 0, `grep -c playCount` = 0 |
| F29 | TikTok's SEO experiments on these pages include transcripts and AI descriptions (`"add_transcript_seo":{"vid":"v2"}`, `"kep_aigc_description":{"vid":"v1"}`), and its video alt-text template is "{likes} Likes, {comments} Comments. TikTok video from {nickname} (@{uniqueId}): …". These are TikTok's own page settings, not creator behaviour. | rendered | `seo.abtest.parameters` |

---

## 3. The lessons

**Fit** is judged against four tests: faceless (the brand is the only public face), no customer contact, ₪0 spend,
and honest (MISSION constraints 3 and 6, the ₪0 rule of 27.9, and the no-deception rule). The grade is the grade of
the **evidence for what the creator says**. **None of these lessons has evidence that it sells.**

| # | Lesson | Source | Grade | Fits a faceless, no-contact, ₪0, honest brand? |
|---|---|---|---|---|
| M1 | **Help the reader decide, on the tool page itself.** Neil Patel's claim is that chatbots cite "clear, actionable comparisons" and pros/cons tables over "top 10 tips". Our niche already has the Hebrew decision article: "עוסק פטור, זעיר או מורשה 2026? המדריך השלם" is on page one of `תקרת עוסק פטור 2026` (repo SERP pull, Q3 #6), and "tell me the rule" queries return no tool at all. The repo's prior ruling is that "every additional page we publish should be a **tool**, not an **article about the tool**" (`content-seo--ai-content-policy.md` §2). So the honest form is a short "פטור / זעיר / מורשה: מה ההבדל ולמי זה מתאים" table **inside** `osek-patur.html`, with every row sourced and dated, not a new comparison article. | F12, F14; `research/measurements/serp/2026-09-07-hebrew-calculators.md`; `content-seo--ai-content-policy.md` §2 and E9 | rendered (as a claim, no study); repo | **Yes**, if every cell is sourced and competitors are described fairly. Do not publish any "זעיר" row until the income-tax track is primary-sourced (critic's verify_first item). Measure with Search Console's generative-AI report (E20), not with his promise. |
| M2 | **"Research-driven answers to specific questions" means reading the questions, not posting the answers.** Neil Patel's second caption points at Reddit and Quora. For us those are a source of real Hebrew questions to answer on our own pages; posting there stays RED (`docs/REJECTED.md`, "Reddit / YouTube citation seeding"), and "authority distribution" by publishing on other sites is parasite SEO, ruled RED in `content-seo--ai-content-policy.md` §5. The only honest version of "presence on multiple trusted sites" is earned listings (registries, curated lists), which the sibling reader already covered (`tj-offsite.md` L14). | F13; repo rulings | rendered (as a claim); repo | **Partly.** Reading questions: yes. Posting or cross-publishing: no. |
| M3 | **Our lead magnet is the tool, and our email capture is "send me what I asked for".** The Leap's caption adds no idea we can check (F17). The repo already holds the better answer: the capture that converts best and carries least legal risk is "a tool whose output the user asks to be emailed" (`distribution--email-acquisition.md` §3), under §30א's express-consent rule. `registrar-fee.html` already implements it honestly: a reminder form that stays closed until the page reaches 100 views a week, with a refusal checkbox ("אני מסרב/ת לקבל דברי פרסומת. שלחו לי אך ורק את התזכורת שביקשתי."). **Do not build a separate PDF "lead magnet"** unless it carries content the tools do not. | F16-F18; repo | rendered (caption); repo | **Yes, and already done.** The lesson is not to redo it. Replies to any mail must go to an auto-reply, so the owner never talks to anyone (scout 5's caveat stands). |
| M4 | **TikTok's own "small-business lead" guidance is a paid-ads product, so it is RED for us.** Lead gen is "an advertising objective", Instant Forms live inside ad campaigns, and the page's own rules are a learning phase of "20+ conversions within 5 days" with a daily budget "10x your expected CPL" (F2, F5). This is the first first-party statement of the threshold mechanism `docs/REJECTED.md` used to reject paid ads ("a sub-threshold budget is consumed entirely by the learning phase", which was snippet grade). Illustration only: at an assumed ₪10 CPL, 10× is ₪100 a day, against a ₪0 ceiling. | F2, F3, F5 | rendered; the ₪10 is my assumption (none) | **No.** RED under the ₪0 rule and the standing paid-ads rejection. It upgrades that rejection's evidence; it does not reopen it. |
| M5 | **Any form that collects an address links a privacy policy.** TikTok will not run an Instant Form without one (F4). The same hygiene applies to our reminder form under Amendment 13 (`distribution--email-acquisition.md` §1b): email only, the consent wording saved with the record. | F4; repo | rendered; repo | **Yes.** ₪0, faceless. Check the reminder form links one before it opens. |
| M6 | **Never quote a stale or self-graded number as if it were current.** TikTok's own page leans on a 2019 ProfitWell figure and on "TikTok Internal Analysis" (F8). Our copy rule: every number carries its source and its date, and a vendor's number about itself is labelled as such. | F8 | rendered (counter-example) | **Yes.** It is the honesty rule, applied to marketing copy. |
| M7 | **Differentiation is a claim to earn, not a slogan.** "Say something ✨new✨" is a principle's name with no content in the capture (F20). The only "new" we can say truthfully is already listed by the sibling reader: runs in the browser (only where code-checked), open source, one-time price shown next to the free result (`tj-offsite.md` L1, L3). | F19, F20 | rendered (caption only); content none | **Yes**, but this source is too thin to lean on. |
| M8 | **Weigh a source by who says it and how far it reached, then go to the primary.** A 60-second explainer from a 3-follower account got 1,147 plays (F22); the primary Hormozi caption is complete and rendered elsewhere (F25). The explainer adds nothing the primary lacks. | F21-F25 | rendered | **n/a (method).** Use the primary; drop the explainer. |
| M9 | **"Faceless digital product" is a seller-education niche, not a buyer channel.** TikTok itself marks both keyword pages `keywordEcomIntent` 0 (F27). The people searching them are would-be sellers, the audience that "how to sell a course" products target. The repo already rejects selling courses or blueprints (`07-ai-money-tooling.md`: "Any course, cohort, Skool community or "AAA blueprint""), and the only example of the genre in the repo is the owner's reel with a comment-keyword funnel (`research/faceless-youtube/00-owner-reel-2026-09-25.md`: `Comment "Chatgpt" to get 1K+…`). Our buyers (Israeli micro-businesses and bookkeepers) do not search these phrases. | F26-F28; repo | rendered (flag); meaning none; repo | **Reject as a target.** Do not make content for these keywords and do not sell "how to sell" material. The faceless *format* lessons (screen-recorded demo of our own tool, AI label, off-platform checkout) are already on file (scout 5; `distribution--short-video.md` §4) and do not depend on this genre. |
| M10 | **To learn what performs on TikTok, render single video pages, not lists.** Discover and tag pages render as shells (section 1); video pages render `statsV2`, `stickersOnItem` (the on-screen text, which is where list-style faceless videos put their content) and the ASR caption link. Video ids have to come from embeds on other sites, oEmbed cites, or search snippets. | F21, F24, F28 | rendered | **n/a (method).** Saves render budget: do not queue discover or tag URLs again. |

**Get-rich-quick screen, as asked.** Of the five creator videos this family could read, **none is a get-rich-quick
pitch**: Neil Patel sells SEO services (a vendor's claims, F14), The Leap sells a creator platform and promotes its
own mini-course (a vendor funnel, F16), @alexjames.b2bmessaging and @nickmacsocial post plain marketing tips. The
genre the brief warned about (a course about selling courses) could not be observed, because the discover pages
held no videos (F28). The only rendered signal about that genre is TikTok's own intent flag (F27).

---

## 4. Stage-1 scout claims: confirmed, corrected, refuted

### Confirmed
| Claim (as the sweep put it) | Scout | Verdict | Evidence |
|---|---|---|---|
| Neil Patel's captions say AI chatbots cite decision-stage content ("Best X for Y", bullet points, pros and cons, comparison tables) more than "top 10 tips", and that presence across several trusted sites (researched Reddit/Quora answers, not pitches) makes AI treat you as credible. "No study is cited in the captions." | 3 (and critic's verify_first) | **Confirmed, now rendered.** Both captions say this nearly verbatim; neither cites a study (F12-F14). The caption adds one thing the scout left out: "even if your Google rankings stay the same". It stays a vendor claim. The repo's E13 (25% of top ChatGPT-cited URLs had zero Google visibility, rendered 3P) is consistent with that one clause, not with the decision-stage claim. | F12-F14 |
| TikTok has a discover topic titled "How to Sell A Digital Product As A Faceless"; only the title was seen. | 2 | **Confirmed**, and dated: keyword record created 2025-06-17, `keywordEcomIntent` 0. Its contents are still unknown. | F26, F27 |
| @nickmacsocial is "a one-minute secondary explainer of the value equation. Useful only if the Hormozi video's caption comes back thin." | 8 | **Confirmed** (60 s, "explained in 1 minute"), **and not needed**: the Hormozi caption is complete in another family's capture, and this explainer's caption does not state the equation (F21, F25). The sales reader reached the same verdict. | F21-F25 |
| The Leap "is a platform promoting its own mini-course, so treat it as a vendor source". | 3 | **Confirmed.** | F16 |

### Corrected
| Claim | Scout | Correction | Evidence |
|---|---|---|---|
| Lead-magnet advice from @the.leap: pain-first assets ("5 biggest mistakes", "7 biggest pitfalls") convert better; formats are templates, a 3-7 day email mini-course, workbooks. | 3 | **Not in the capture.** The caption only announces "lead magnet ideas" and links a mini-course (F17). Those specifics came from a search summary and stay snippet grade. | F16, F17 |
| TikTok for Business's small-business guides recommend hook → USP → CTA, native-feeling content, posting consistently, and in-app Instant Forms. | 3 | **Split.** On the one guide captured, Instant Forms are confirmed, **but as a paid ad objective** (the scout did not say they need ads). "Ads that feel organic" is there (Spark Ads). Hook, USP, CTA and "consistently" are **absent** (0 hits). They may sit on the two uncaptured guide URLs, so they stay snippet. | F2, F3, F7, F10 |
| "Hook, USP, CTA in short videos: TikTok for Business guide snippets (first-party but unread)". | 3 | **Still unread at first-party grade.** The page that was rendered is about paid lead-gen ads and does not contain these words. | F10 |
| @meaningful.marketing, "niche: copywriting for small-business marketing", video titled "The Ultimate Copywriting Hack for Meaningful Marketing". | 3 | **Wrong author and wrong title in the capture.** The id resolves to @alexjames.b2bmessaging ("Alex James \| B2B Messaging"); the caption is "Say something ✨new✨" (2023-08-22). | F19, F20 |
| Tactic: decision-stage comparison pages, with a new Hebrew "עוסק פטור מול עוסק מורשה" page as the candidate. | 3 | **Right idea, wrong container.** The Hebrew decision article already exists on page one (yuvalim-finance, Q3 #6), "tell me the rule" SERPs return no tool, and comparison queries trigger AI Overviews most often (E9, snippet). The repo rule is tools, not articles: put the table on `osek-patur.html`. | M1; repo |
| Tactic: pain-first lead magnet to an email list, with the Israeli consent rule marked "background knowledge, grade none; verify". | 3, 5 | **Already settled in the repo**, as the critic said: §30א express prior consent in writing, statute-mirror grade, in `distribution--email-acquisition.md`; and `registrar-fee.html` already ships a closed, consent-first reminder form. The scouts' "grade none" is repo grade. | M3 |

### Refuted
| Claim | Scout | Why | Evidence |
|---|---|---|---|
| Render `discover/how-to-promote-digital-products-faceless`: "If it renders server-side, it lists real video URLs and handles of faceless digital-product sellers." | 5 | **Refuted for a plain GET from the runner.** The page returns only the keyword record; the six videos load client-side. | F28; section 1 |
| Render `discover/how-to-sell-a-digital-product-as-a-faceless`: "If the plain GET is server-rendered, it lists the creators and video IDs in exactly our niche." | 2 | **Refuted, same reason.** | F28 |

### Still open (not settled by this family)
- Scout 5's "templates (Canva, Notion) and mini-courses are named as top sellers" in the faceless genre: snippet grade, no rendered list exists.
- What The Leap's video actually lists as lead-magnet ideas (on-screen text or audio).
- Whether Neil Patel's decision-stage claim holds for Hebrew queries. It needs our own measurement, not a caption.
- Whether TikTok's organic small-business guide (F11) says hook → USP → CTA.

---

## 5. URLs worth rendering next

Only URLs that appear in a capture of this family. Ordered by value.

1. `https://www.tiktok.com/@the.leap/video/7410811022140787973` — the video page (seen as the oEmbed `cite`). Its `stickersOnItem` should hold the on-screen lead-magnet ideas the caption omits, plus plays and the ASR caption link. Settles F17.
2. `https://www.tiktok.com/business/en-US/blog/small-business-marketing-tiktok-ultimate-guide?ab_version=experiment_1` — linked from the lead-gen post (F11). The one first-party page in these captures that may carry TikTok's **organic** small-business advice (hook, USP, CTA, cadence). Settles scout 3's open claim.
3. `https://www.tiktok.com/@neilpatel/video/7537667346354244919` — the video page (oEmbed `cite`): plays, likes, duration, on-screen text, AIGC flags. Gives the decision-stage claim a reach number.
4. `https://www.tiktok.com/@neilpatel/video/7564756481506086157` — same, for the "two-step playbook" video.
5. `https://www.tiktok.com/@alexjames.b2bmessaging/video/7270134688277187841` — the video page under the handle the oEmbed reports. Settles whether this is a renamed account and what "Say something new" shows on screen. Low priority.

**Do not queue:** any `tiktok.com/discover/…` or `tiktok.com/tag/…` URL (shells, section 1); the lead-gen help pages
and the he-IL edition of the blog (paid ads, RED under M4); the @nickmacsocial WebVTT link (superseded by the primary
Hormozi caption, and it expires 2026-09-30 21:03 UTC).
