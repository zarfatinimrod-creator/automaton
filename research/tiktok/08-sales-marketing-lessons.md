# 08 — What TikTok's sales and marketing creators teach us, and what changes on our pages

**Synthesis of the 28.9.2026 TikTok study (stage 3).** Inputs: the stage-1 sweep
(`research/tiktok/08-sweep/sweep-2026-09-28.json`), the runner's render of 94 URLs into
`research/rendered/tt-*`, six stage-2 readers (`research/tiktok/08-reads/*.md`), 13 verifiers and three
application lenses. This file is the only file written by this stage. Every change it proposes is for the main
thread or a builder to make.

**Grades used throughout.**
- **rendered**: read in a runner capture. The file and key are cited, and quotes were checked with `grep -F`
  against the capture's own characters. Two captures need an encoding step first: the Community Guidelines page
  is URL-encoded JSON, so its quotes are checked after percent-encoding the phrase (`08-reads/tiktok-policy.md`
  lines 14–20), and YouTube's `ytInitialData` is JSON-escaped (`\u0026` stands for `&`).
- **github**: read on GitHub. The 13 verifiers' outputs were not saved, so this note is the only record. Every
  github claim in §7 names owner/repo/path; the paths were re-found and re-read by the reviser on 28.9.2026 at the
  default branch's HEAD through raw.githubusercontent.com (the GitHub API refused these repositories, so no commit
  hash is recorded). A claim whose source could not be re-found is downgraded and says so.
- **snippet**: seen only in a search-result summary.
- **repo**: read in this repository.
- **none**: inference or arithmetic.

**Two rules for reading every number here.** Plays measure attention, not sales. A caption is what a creator
said, not proof that it works. Creators are named only by public handle, and TJ Robertson also by his public
professional name. No personal or family detail about anyone is recorded.

---

## 0. תקציר לבעלים

1. **מי זה:** TJ Robertson ‏(@tjrobertson52) מנהל סוכנות SEO לחיפוש ב-AI בשם TJ Digital. אצלו טיקטוק הוא ערוץ חשיפה לשירות בריטיינר של ‎$1,900–$4,500 לחודש, ולא מקור הכנסה בפני עצמו (אתר הסוכנות, נקרא ב-28.9).
2. **איך טיקטוק מזין את העסק:** סרטוני הסבר מדוברים של דקה וחצי עד ארבע דקות ← שורה אחת בביו עם כתובת האתר ← כל פוסט שנבדק בבלוג (4 מתוך 4) מטמיע סרטון באותו נושא ← באתר יש מחיר גלוי והחזר כספי מוגבל ← היום זה נגמר ברשימת המתנה ושתי שיחות. יש לו 20,711 עוקבים ו-439 סרטונים. הוא אומר ש-90% מהלקוחות מגיעים מיוטיוב ומטיקטוק, אבל אין לכך נתוני המרה.
3. **חמשת הלקחים:** (א) הבקשה לקנות נמצאת בדף שלנו, אחרי התוצאה החינמית, ולא בתוכן עצמו. (ב) המחיר, מה בדיוק מקבלים ו"תשלום חד-פעמי" כתובים בטקסט גלוי. (ג) מראים במקום לספר: תצוגה מקדימה של הלוגו על המסמך, לפני התשלום. (ד) תוכן ששווה לשמור: רשימות בדיקה וטבלאות עם תאריך, ועדכון באותו יום שכלל משתנה, רק לפי מקור ראשוני. (ה) כפתור "שליחת התוצאה לרואה החשבון" שהמשתמש לוחץ עליו בעצמו.
4. **מה לא לוקחים:** פנים ושיחות מכירה, כותרות הפחדה, רשימת המתנה ומחסור מדומה, עמודי ערים משוכתבים, Reddit, פרסום ממומן, DM וקומנט-בייט, וטיקטוק כקו הכנסה.
5. **מה נבנה בדפים עכשיו, בלי צעד מצדכם:** בקופסת ה-Pro — המחיר ומה מקבלים בטקסט גלוי, תצוגה מקדימה, ושאלות ותשובות על המחיר; ב-PCN874 — הדפסת הממצאים, כפתור שיתוף וסרטון הדגמה שקט; בעוסק פטור — מקור ותאריך ליד כל מספר, וטבלת פטור/מורשה. **הבנייה לא דורשת מכם כלום, אבל מה שגולשים יראו כן תלוי בצעדים:** שום דבר לא עולה לאוויר לפני שהאתר מתפרסם (סעיף 6); המחיר, בקשת הקנייה והתצוגה המקדימה מופיעים רק אחרי צעדים 2, 3 ו-6, כשהחנות ב-Gumroad מוכנה; וכפתור השיתוף ייצא בשלב ראשון רק דרך תפריט השיתוף של המכשיר: קישור ישיר לוואטסאפ רק אחרי בדיקה מתועדת במכשיר אנדרואיד ובמכשיר iOS, שלא נבקש מכם כצעד.
6. **מה דורש צעד מצדכם, שער אחר שער:**
   - **פרסום האתר:** צעד 8 (תיבת הדואר של המותג, שהיא כתובת הנגישות) **וגם** דרך העלאה: בקשה 1 (פתיחת הרשת) או חיבור Netlify בצעד 6.
   - **Search Console:** אינו צעד ברשימה. לפי פסיקה קיימת מבקשים אותו רק אחרי שהאתר מראה 100 צפיות בשבוע, ומונה הצפיות עוד לא מחובר. קריאת השאילתות כדי לכתוב תוכן היא עבודת SEO, והיא מחכה גם לדומיין (צעד 5, מוקפא בכלל ה-0 ₪).
   - **YouTube (שלב A):** חשבון המותג מצעד 8, ועוד התחברות אחת לשירות פרסום, ורק אחרי קריאת היום ה-56 של זרוע האתר.
   - **המכירה:** צעדים 2, 3 ו-6. שורת ההחזר הכספי תוצג רק אחרי צעד 8 ורק כשיש מענה אוטומטי.
   - **טיקטוק:** אין לו צעד ברשימה, ולא נבקש אותו לפני פסיקה.
7. **לפסיקת Fable:** האם למותג יהיה טיקטוק בכלל; מדריכים ב-Medium (צמצום הפסילה של parasite SEO); הצעת המחיר של מחולל PCN874; תמיכה בקובץ מייצגים לרואי חשבון.
8. **גבולות הראיות:** אף אחד לא צפה בסרטון ולא שמע אותו. יש לנו רק כיתובים ומספרים. צפיות הן תשומת לב, לא מכירות.
9. **חיפוש בתוך טיקטוק עצמו לא התאפשר.** טיקטוק חסום מהסביבה שלנו, ודפי החיפוש, ה-discover והתגיות נטענים ב-JavaScript, כך שהשליפה הפשוטה של השרת החזירה מעטפת ריקה. חומר המכירות והשיווק הנוסף נאסף מתוצאות חיפוש באינטרנט ומדפים שנשמרו, לא מחיפוש בטיקטוק. מאותה סיבה הסרטונים המצליחים ביותר של TJ לא ידועים: המדגם מחזיק 1.9% מהלייקים שלו, ורשימת הסרטונים בפרופיל חזרה ריקה. הדרך לסגור את זה היא רינדור בדפדפן אמיתי (Playwright) על השרת של GitHub, אחרי בדיקת תנאי השימוש של טיקטוק (§9 P1b).

---

## 1. What was asked, how it was researched, and the evidence limits

### 1.1 The ask

On 28.9.2026 the owner asked, in Hebrew, for three things:
- research the TikTok page of @tjrobertson52 and learn from it;
- search TikTok for more sales and marketing material;
- apply both to making the colony's products sell.

The mandate test for every recommendation is `MISSION.md`:
- the owner never talks to customers and never appears;
- the brand Mehudak / מהודק is the only public face;
- ₪0 up front;
- honest value only, AI use declared;
- no DM funnels, cold outreach, comment-bait or account networks;
- money counts only with a platform transaction id.

### 1.2 Method

| Stage | What ran | Output |
|---|---|---|
| 1. Sweep | Nine scouts and a critic, working from snippets and search summaries | `08-sweep/sweep-2026-09-28.json`. The critic listed 13 verify-first claims, three gaps and prior repo rulings |
| 2a. Render | A GitHub Actions runner fetched **94 URLs** on 2026-09-28 between 21:00:43 and 21:03:08 UTC | `research/rendered/tt-{profile,video,oembed,src}-*`: 2 profiles, 25 video pages, 33 oEmbed responses, 34 other pages |
| 2b. Read | Six readers, one per family: TJ on TikTok, TJ off TikTok, sales creators, marketing creators, Hebrew and Israel, TikTok policy | `08-reads/{tj-tiktok,tj-offsite,sales-creators,marketing-creators,hebrew-israel,tiktok-policy}.md` |
| 2c. Verify | 13 verifiers, one per critic claim; GitHub and rendered captures, at most one WebSearch each (2 used in total) | §7 below. Their outputs were not saved; §7's GitHub paths were re-found by the reviser (see Grades) |
| 2d. Apply | Three lenses: offer and pricing; faceless content and search; Hebrew and Israel | §4 to §6 and §8 |

### 1.3 Evidence limits

**Nobody watched or heard a video.** Everything below rests on three kinds of evidence:
- captions (`desc`, oEmbed `title`), on-screen sticker text and the counters in the rehydration JSON;
- first-party web pages;
- GitHub.

Two routes to the spoken words failed:
- The ASR WebVTT transcripts could not be fetched: this container's proxy refused TikTok's CDN (CONNECT 403).
  They are linked from 12 of the 14 English video pages (TJ's 8 readable ones, @ahormozi, @conversion.doc,
  @nickmacsocial, @pm_alliance); @revelloughlin and @saas_cmo_pro have no caption track (`subtitleInfos` empty).
  The signed links in these captures expire 2026-09-30 about 21:00 UTC, but a re-render fetches fresh ones, so
  that date binds only these copies (§9 P1).
- No thumbnail image was fetched, so nobody saw a frame.

The nine Hebrew videos have no caption track at all (`claInfo.captionInfos` empty). Why is unknown (§6.2 item 5).

**Capture status** (from the 94 `.meta.json` files; rendered):

| Result | Count | Which |
|---|---:|---|
| HTTP 200, usable | 77 | Includes 5 YouTube watch pages whose player is `LOGIN_REQUIRED`: metadata and description only |
| HTTP 200, not rendered | 8 | 7550459646654418189 (TJ): `status_deleted`. 7609111825233251598 (TJ): `cross_border_violation_ur`, stats withheld, caption via oEmbed. Five discover or tag shells: `discover/value-equation-hormozi`, `tag/saas`, two faceless-digital-product discover pages, the Hebrew discover page. `support.tiktok.com` AI-label page: empty app shell |
| HTTP 403 | 8 | Times of Israel (Bezeq WhatsApp figures), gov.il micro-business service page, kolzchut.org.il, greeninvoice.co.il, cpa-ea.co.il, zcpa.co.il, primaryposition.com, conroycreativecounsel.com |
| HTTP 400 | 1 | oEmbed of the deleted TJ video 7550459646654418189 |

**Extraction limits:**
- Every TikTok video page's `.txt` is the 23-byte title "TikTok - Make Your Day". All data came from the
  `__UNIVERSAL_DATA_FOR_REHYDRATION__` JSON in the `.html`.
- The Capitax page is windows-1255, and its `.txt` is mojibake. Readers decoded the `.html` as cp1255.
- Discover and tag pages load their video lists client-side, so no most-watched list could be mined from them.
- **TikTok search itself was not run.** tiktok.com is blocked from this container (stage 1: `EGRESS_BLOCKED`),
  and the runner's plain GET returns shells for client-side pages. The "more sales and marketing material" in §4
  and §6 was found through web-search snippets and oEmbed links, not by searching inside TikTok. §9 P1b is the
  route that would close this gap.

**Selection bias.** The TJ videos we have are the ones search engines had indexed. The 8 readable videos hold
2,849 likes, 1.9% of his profile's 149,826 (`tj-tiktok.md` §2.3, arithmetic on rendered counts), so his most
successful videos are not in the sample.

---

## 2. TJ Robertson (@tjrobertson52)

### 2.1 Who

TJ Robertson owns the US agency TJ Digital. He describes his start as "starting as a videographer for marketing
clients" (`tt-src-tjrobertson-com.txt`; rendered). His tenure claims (15, 16 and 17 years) all fit one start year:
- a July 2025 podcast chapter reads "TJ’s digital marketing journey since 2009" (`tt-src-youtube-com-watch-v-qcyzovyph1k.html`; rendered);
- the homepage, modified 2026-05-17, says 17 years;
- the YouTube channel's "15 years" is stale.

This is self-description, not checked history.

**Profile on 28.9.2026** (`tt-profile-tjrobertson52.html`, `statsV2`; rendered):
- 20,711 followers, 149,826 likes, 439 videos, 153 following.
- Bio, verbatim: "💻 Owner of TJ Digital. 📊 See what we can do for you at tjrobertson.com".
- The profile JSON has no `bioLink` key.
- `commerceUser` and `ttSeller` are false.
- The account record dates to 2023-02-17 (`createTime` 1676603677).

The snippet figures from stage 1 (17K / 112.7K / 140) are an older snapshot and must not be quoted.

### 2.2 What he sells, and to whom

Sources: `tt-src-tjrobertson-com.txt` and `.html`, `tt-src-youtube-com-watch-v-aappxjhuiei.html`,
`tt-src-tjrobertson-com-category-seo.txt` (all rendered; `tj-offsite.md` F1–F8).

| Item | What the site says |
|---|---|
| Service | "SEO built for AI search, including what the industry calls GEO", plus video editing and website development. No course, SaaS, template shop or paid newsletter. |
| Price | Three published monthly retainers: **$1,900** (14 credits), **$2,900** (24 credits), **$4,500** (40 credits). "a new blog post is 2 credits". "Our monthly retainers start at $1,900. We charge $500 for strategy and account management…" |
| Risk reversal | Bounded: "No risk. If you're not happy, we'll refund your last month." No long-term contracts. |
| Transparency | Clients are invited into his Notion task board. |
| Buyer | A business with about $1M a year in revenue. Peec AI's partner video: "They work best with companies doing at least $1M in annual revenue". His waitlist budget options start at $1,900. |
| Third-party proof | "Peec AI Trusted Partner", in a video uploaded by Peec AI on 1 Apr 2026 (593 views). |

### 2.3 His funnel, end to end

```
Short spoken explainers on TikTok (85–251 s in the sample, own audio, English ASR captions) and YouTube Shorts
        │   (no sales call to action in any of 9 captions; retention nudges only: "👇", "Watch for the exception!")
        ▼
One bio line, plain text: "See what we can do for you at tjrobertson.com"  (no bioLink key)
        │
        ├─► Content machine: each short's transcript is turned into "about eight pieces of content".
        │     4 of 4 captured blog posts embed a same-topic TikTok, posted 0–26 days before the post.
        │     2026 posts end with a service pitch linking /contact/.
        ▼
Homepage: priced tiers, FAQ, bounded refund, "We’re Currently at Capacity"
        ▼
Waitlist form (section id="audit"; in June 2025 this was a free website-audit offer)
        ▼
"a quick call to see if it’s a good fit, followed by a 90-minute discovery call"  →  monthly retainer
```

The durations are the TikTok sample's only. The Shorts' lengths were not captured, and 251 s would exceed the
Shorts cap of 3 minutes (background knowledge; grade none), so the longest TikToks cannot be the same files on
Shorts.

Evidence (`tj-offsite.md` F9–F24, F44):
- The captions are from the rehydration JSON of the 9 captions.
- The embeds are `data-video-id` in the four `tt-src-tjrobertson-com-*.html` posts.
- The waitlist and calls text is in `tt-src-tjrobertson-com.txt`, page `dateModified` 2026-05-17, still live on 28.9.
- The 2025 audit offer comes from the transcript in `tt-src-linkedin-com-posts-…websitecon.txt`.

All rendered.

**How much TikTok actually feeds it is his own claim only.** Two sources bear on it:
- The content-machine post, 2025-12-01, byline TJ, says: "This is the only form of marketing I do for our
  agency, and it works really well."
- His YouTube title "How I Get 90% Of My Clients From YouTube & TikTok (With Less Than 1K Views)" has 618 views
  and was not watched. In `tt-src-youtube-com-tjrobertsondigital-videos.html` the `&` is JSON-escaped as
  `\u0026`, so a literal search needs that form. GNU grep 3.11's `-F` fails on this backslash pattern here;
  `grep -c 'YouTube \\u0026 TikTok'` (basic regex) and Python's `str.count` both find it.

The phrase "why TikTok beats every other platform for business leads" is not his. It is a podcast host's episode
description (`tt-src-ivoox-com-…marketing.txt`). No capture holds a lead or client count from TikTok. Verdict:
PARTLY (§7, row 1).

### 2.4 Format

All rendered, from the 8 readable `tt-video-tjrobertson52-*.html` pages (`tj-tiktok.md` §2.4).
- **Speech-led.** `music.title` "original sound - TJ Robertson", `original:true`, and an English ASR caption
  track on every video. No trending music.
- **Long for TikTok.** 85 to 251 s, median about 143 s. The most-played video is the longest.
- **Caption template since 2025-12.** A question, then a concrete bad outcome, then a promise with 👇. Examples:
  "What is CTR Manipulation? … Here's why that's a terrible idea 👇" and "What are recommendation networks …
  Simple tactic anyone can do for free 👇". Mid-2025 captions led with provocations ("DEAD by 2027 😱").
- **Hashtags:** 3 to 7 per caption, broad plus niche.
- **No AI label on any video.** `IsAigc` is false.
- **One video is flagged as an ad.** 7519331837844442382 has `"isAd":true` and `"adAuthorization":true`, and it
  is the least-played in the sample.
- **On camera: UNSETTLED.** No image was viewed. His only captured video transcript, a June 2025 LinkedIn
  long-form, is partly a screen walkthrough ("if we use this Google location changer…").
- **His newer short titles, from YouTube** (`tt-src-youtube-com-tjrobertsondigital.html`, the "Shorts" shelf,
  20 `shortsLockupViewModel` items, `overlayMetadata` title and views; rendered). This is the only short-form
  performance data in the captures that reaches past the TikTok sample, whose latest stats are 2026-04-11; one
  title names September 2026. 19 of the 20 titles are a question or a "How To / When To"; the 20th is "What
  GPT-6 Astra Means for Your Business (This Is the AGI Era)". No title uses a doom or accusation hook. That these
  Shorts are the same videos as his TikToks is inference (grade none); he credits "YouTube & TikTok" together.

### 2.5 Cadence, and whether he still posts

- **Rate:** 439 videos since the 2023-02-17 account record, over 1,319 days, averages about **2.3 a week**
  (arithmetic on rendered numbers).
- **He posted on TikTok at least until 21.7.2026.** The critic suspected a stop after 2026-04-11; for April to
  July that is refuted. Nothing captured shows whether he still posts on TikTok today.
  - Blog embeds carry TikTok ids 7657333505461996814 → **2026-06-30** and 7665088847612595470 → **2026-07-21**
    (id >> 32; rendered in `…reddit….html` and `…what-ai-knows….html`).
  - A third-party knowledge-base index, `offflinerpsy/base2026` `docs/project-memory/DATA_SOURCES.md` (snapshot
    heading dated 2026-09-05; read 28.9.2026), lists @tjrobertson52 sources it processed into "approved cards".
    It holds no transcript: its own snapshot line counts "zero published full transcripts". It names two of his
    video ids: 7667726450258201869 → 2026-07-28 and 7650601606215372046 → 2026-06-12 (id >> 32). Grade github;
    the ids are TikTok's, the index is not.
  - The September item is a YouTube Short, not a TikTok: "Does The September 2026 Spam Update Penalize AI
    Content? What We CHANGED" (386 views; `tt-src-youtube-com-tjrobertsondigital.html`). Its date is inferred
    from the title.
- **The audience is small everywhere else** (rendered):
  - YouTube: 3.27K subscribers; long-form uploads 64 to 7K views; Shorts 5 to 10K views.
  - The one captured LinkedIn post: 3 likes, from an account with 595 followers.

### 2.6 His best-performing videos in the sample

Captions are verbatim with hashtags omitted. Counts are `statsV2`, rendered. Dates are id >> 32 in UTC.

| Video id | Date | Caption | Plays | Likes | Saves | Shares |
|---|---|---|---:|---:|---:|---:|
| 7504044860782021930 | 2025-05-13 | Digital marketing will be DEAD by 2027 😱 Already using AI for 90% of my workflow! Are agencies scamming you? Watch for the exception! | 71,400 | 1,819 | 1,820 | 864 |
| 7579436705594297613 | 2025-12-03 | What Company Data Should You Share With AI? Connecting Google Drive to ChatGPT sounds great until the model starts pulling random call transcript chatter into your strategy docs. Here's what actually works 👇 | 8,780 | 223 | 102 | 27 |
| 7518238106319998263 | 2025-06-21 | AI optimization is officially here and it's moving FAST. Tested 20+ new tools - here's what's actually working right now 👀 | 6,492 | 246 | 221 | 63 |
| 7627620325940940046 | 2026-04-11 | One review = roughly one customer's worth of profit. Here's how to actually get them 👇 | 5,767 | 213 | 152 | 58 |
| 7582743188151078199 | 2025-12-11 | What is CTR Manipulation? If your competitor suddenly outranks you with worse content, they might be using bots to game Google. Here's why that's a terrible idea 👇 | 3,865 | 114 | 47 | 5 |
| 7548494380689149239 | 2025-09-10 | This SEO hack lets small brands outrank bigger competitors using Medium, LinkedIn & Reddit 🎯 | 2,348 | 81 | 57 | 40 |
| 7592778591801232653 | 2026-01-08 | What are recommendation networks and how can you use them to show up in ChatGPT? Simple tactic anyone can do for free 👇 | 2,001 | 104 | 93 | 32 |
| 7519331837844442382 | 2025-06-24 | I just let ChatGPT choose my BANK 🏦 We went from GPS picking our routes to AI picking our entire lives. Are we all just sleepwalking now? | 1,337 | 49 | 12 | 3 |

Not in the table:
- 7550459646654418189 (2025-09-15) is deleted or private.
- 7609111825233251598 (2026-02-21) is withheld from the US page. Its oEmbed caption is "Gemini 3.1 vs Opus 4.6 —
  better benchmarks, but does it actually win?…".
- Four later ids appear only as blog embeds, with captions but no stats: 7569058327246687502 (2025-11-05, "Turn
  ONE video into 8 pieces of content 📹…"), 7610245040685829390 (2026-02-24), 7657333505461996814 (2026-06-30)
  and 7665088847612595470 (2026-07-21).

**What the counts say** (grade none, n = 8):
- The doom hook holds 70% of the sample's 101,990 plays, but has the second-lowest like rate (2.55%).
- The free-tactic video leads on like rate (5.20%) and save rate (4.65%).
- On the utility videos, saves roughly equal likes.
- The anti-black-hat CTR video has the lowest share rate (0.13%).

**His YouTube Shorts shelf** (20 titles and view counts, rendered: `tt-src-youtube-com-tjrobertsondigital.html`,
`overlayMetadata`; no upload dates on the shelf). Grouped by kind; the grouping is ours (grade none).

| Kind | Titles (views) |
|---|---|
| AI model and tool releases | "When To Use Jev Instead of a Full LLM (TypeSafe's New Model)" (10K); "Is GPT-6 Astra Better Than Claude Fable 5.1? I Tested Both" (2.7K); "What GPT-6 Astra Means for Your Business (This Is the AGI Era)" (2.2K); "How To Get Claude To Write Better Skills (Hand It THIS Video)" (2.1K); "Is Claude Opus 5.5 Worth Using Over Fable 5.1? (40% Cheaper)" (731) |
| Evergreen SEO and AI-search how-tos | "Can You Still Trick Google's Algorithm? Their New Paper Says NO" (1.2K); "How To Get AI To Say Good Things About Your Business (4 Pages To Add)" (1.1K); "How Fast Is Too Fast To Publish Content On Your Website?" (381); "How To Track SEO Results Without Rank Tracking (Rank Trackers Are WRONG)" (295); "How To Decide Which Pages To Delete From Your Website Using AI" (253); "Is Google Ads Dying Because of AI? Ads vs SEO, and Why I Say BOTH" (151); "Is Google Paying Publishers for AI Overviews? Here's How It WORKS" (138) |
| SEO news | "Does The September 2026 Spam Update Penalize AI Content? What We CHANGED" (386) |
| AI workflow for a business | "How To Fully Automate a Website With AI (Full Breakdown)" (1K); "How To Set Up an AI Knowledge Base for Your Business: Connectors, Projects, Skills" (848); "What Will Humans Do When AI Can Do Everything on a Computer? (How To Prepare)" (688); "How To Structure Company Data For AI Agents So They Do ALL The Work" (600); "How To Make Your Website AI Agent Friendly: Shopify, UCP, and WebMCP" (401); "Why Is AI So Frustrating To Work With? Good, Keep Pushing Anyway" (277); "Does AI Search Matter If It Sends So Little Traffic? Look at SALES" (5, likely the newest) |

What this adds (grade none; views are attention, not sales):
- **Model-release newsjacks lead**, and not uniformly: the top three are about new models, but the Opus 5.5 one
  drew 731. His evergreen SEO how-tos draw 138 to 1.2K, and the one SEO-news title 386. For our rules watch
  (§8 N13) this means reach comes from news with a large general audience; a Hebrew tax-rule change has no such
  audience, so N13 stays justified as page value, not as reach.
- **The doom hook is not his current register.** The 71,400-play "DEAD by 2027" TikTok is from May 2025; none of
  the 20 newer Shorts titles uses fear or accusation, and the best of them (10K) is a practical "when to use"
  question. Read the doom hook's lead in the TikTok sample as one 2025 outlier, not as his method.

---

## 3. What we take from him and what we do not

| We take | Why | Where it lands |
|---|---|---|
| The ask lives on our own page after the value, not in the content | None of his 9 captions carries a sales call to action; one bio line points to the site (rendered). The deposit-before-ask order matches @salestipstok's caption (rendered), whose own channel, cold B2B email, we reject (§4.3) | `invoice.html` after print; `pcn874.html` after results (§8 N3, N7) |
| Publish the price and the unit of work | His tiers show price, credits and "a new blog post is 2 credits" (rendered) | Pro box visible price (§8 N1) |
| Bounded, specific risk reversal | "If you're not happy, we'll refund your last month" (rendered) | Refund line only once Gumroad and a responder can honour it (§8 A1) |
| Explainer shape: question → real bad outcome → payoff | His 2025-12+ captions (rendered). Effectiveness unmeasured | Page leads, demo clips, FAQ headers (§8 N9, N11) |
| Keep-worthy references | His free-tactic and utility videos lead on saves (rendered counts; causation none) | PCN874 rule reference list; dated change tables (§8 N10, N13) |
| One source → a few re-edited pieces, never unattended | "I would not recommend automating this. You definitely want a human in the loop reviewing everything." (rendered) | Demo clips embedded on the tool page (§8 N11) |
| Every guide page carries its own same-topic video | 4 of 4 captured posts embed one (rendered) | Self-hosted `<video>` on the tool page, because `netlify.toml` has `frame-src 'none'` (repo) |
| Dated newsjacking | His Anthropic post and September-2026 spam-update short (rendered) | A rules watch on primary sources (§8 N13) |
| His published citation audit, not "fact density" | "10 to 20 is enough to see the pattern yourself"; "Publish pages that take the citation slot" (rendered) | Later: it is SEO work, so it waits for the board's three preconditions, including the frozen domain (§8 A9) |
| A one-line, brand-only bio | His bio (rendered) | Any future brand profile (§8 A7) |

| We do not take | Why |
|---|---|
| His face, voice, podcast guesting, fit call and 90-minute discovery call | The owner never appears and never talks to customers (MISSION rule 1) |
| The doom and accusation hooks ("DEAD by 2027", "Are agencies scamming you?") | Engagement bait and fear framing (MISSION rule 4). TikTok also marks "Misleading claims meant to boost views or popularity" FYF-ineligible (`tiktok-policy.md` §2.4; rendered) |
| "At capacity" and waitlist copy | Honest only for a human capacity limit. On software it is fake scarcity |
| City or modifier page farms reworded by AI ("Keyword variant pages still work") | The doorway pattern MISSION constraint 6 forbids (rendered in `tt-src-tjrobertson-com-category-seo.txt`) |
| Reddit posting, even his disclosure-first version | It needs a named human who talks to moderators and askers. `docs/REJECTED.md` keeps Reddit seeding RED |
| #ParasiteSEO on Medium, LinkedIn and Reddit | The intent he states is exactly what Google's site-reputation-abuse definition names. The honest UGC-host subset goes to Fable (§7 row 6, §8 F2) |
| "Riva" bylines written in his first person, with no AI disclosure | Blurs the author and hides AI use; against the declared-AI rule |
| His economics | A sub-1K-view funnel pays when one client is $1,900 a month recurring, roughly 80 to 90 ₪79 licences every month at ₪3.3 to ₪3.8 per dollar (exchange rate assumed; grade none). It agrees with the repo's "low hundreds of shekels per month" short-video ceiling (`distribution--short-video.md` §4, line 214) |
| "why TikTok beats every other platform for business leads" | A podcast host's episode blurb, not his words and not data (§7 row 1) |
| "Fact density is the biggest factor" | Found in no capture. The one source proposed for it, a LinkedIn post, uses "density" about page layout (§7 row 2) |
| "Check search demand first" (7550459646654418189) | The video is gone. His readable material argues the other way: "How to Market a Product No One Is Searching For (2026)" (§7 row 3) |

---

## 4. Sales lessons from TikTok

The sales family is `sales-creators.md`. All captions below are rendered and all counts come from `statsV2`. None
of these creators is Israeli (`locationCreated` US, DE, GB, AU).

### 4.1 Offer

- **Value-equation checklist.** @ahormozi 7336007528070958382 (2024-02-16; 5,675 plays, 0.3% of his 1.8M
  followers): "The Value Equation: Dream outcome + Perceived Likelihood of Achieving ÷ Time delay + Effort and
  Sacrifice = Value". For us, every sentence on the Pro offer should do one of four things:
  - state the deliverable;
  - raise likelihood by showing;
  - cut delay: the key arrives by email, works offline, no account;
  - cut effort: one paste.

  → `products/il-biz-tools/invoice.html` lines 109–115.
- **Perceived likelihood is the weak term; show, don't tell.** @revelloughlin 7541753741691653384: "Skillshow -
  show people how skilled you are, stop telling them." We keep the principle only. His testimonial ads and paid
  channel are rejected. → A try-before-you-pay preview: the user's own logo and colour on the on-screen preview
  only, never on the print (§8 N2).
- **Name the offer by what it delivers, and name the seller.** The Pro box, the Gumroad product and the
  activation steps must share one name. The Gumroad store is the brand (`docs/OWNER_STEPS.he.md` step 3), while
  the site is branded "כלים לעסק", and that mismatch at checkout reads like a scam. Rename only before the first
  `create` run, because product reuse is by exact name (`scripts/gumroad-pro-product.js:56`; repo). → §8 N5.

### 4.2 Pricing

- **No lesson bears on the ₪79 number itself, so the price does not change.**
- @conversion.doc 7430511437199543584, "The Price Anchor", is the most-watched video in the family: 83,200
  plays, 3,649 saves. Its caption states no method (rendered). The only honest anchor is one real price with a
  true reference point, never a "was" price.
- @edelmanir 7426249678359940373 (on-screen "למה לא כדאי להציע הנחה…"; rendered): one fixed price, no codes, no
  launch price.
- **The price must be visible and must come from Gumroad, not be typed by hand.** Today "תשלום חד-פעמי, בלי
  מנוי" sits only inside the collapsed `#pro-privacy` block (`invoice.html:135`), and no ₪ figure appears on the
  page (repo). → Write Gumroad's read-back price into `src/config/site.json` and render it only in the `ready`
  state (§8 N1).

### 4.3 The free-to-paid moment

- **Free users "binge the content and bounce".** @pm_alliance 7441618513669655864 states the problem only (732
  plays). → One dismissable note right after a free print, shown once, never blocking, and only when the shop is
  `ready` (§8 N3).
- **Deposit before the ask.** @salestipstok 7337845679101922602: "use this template to earn the right to your
  prospects attention by making a deposit before and ask" (oEmbed title). Its context is **cold B2B sales
  email** (the same caption: "If you are sending cold sales emails…"), which we reject: unsolicited contact with
  strangers, and §30א needs prior written opt-in (`08-reads/sales-creators.md` L3). Only the order carries over,
  and the invoice page already follows it.
- **The PCN874 page makes no ask today** (repo). Its relevant paid step is the pcn874 generator, which has no
  price and waits for a ruling (§8 F3). Until then the post-result slot carries value, not a pitch: print the
  findings, share with the accountant, and an honest "why is this free" line (§8 N7).
- **The profile's single call to action is a free thing.** @ahormozi's bio: "Get your free scaling roadmap here
  👇" (rendered). The bio of any future brand profile points at the free validator, never at checkout (§8 A7);
  on TikTok that may have to be the address as plain text, since a clickable bio link is unverified.

### 4.4 Copy

- **Skeleton:** audience → pain → solution → checkable credentials → ask. Source: @copyfolioapp
  7216736475889667354, a copywriter's portfolio sample, not buyer-tested. Credentials here must be impersonal and
  checkable:
  - "נבדק מול נספחים א' ו-ג' של חוזר רשות המסים משנת 2009";
  - a test count generated by the build;
  - never user counts or testimonials.

  → `pcn874.html` scope box, `invoice.html` Pro box.
- **Answer objections in writing.** @geoffketterer 7431531457396477216's framework is live closing, which is
  rejected; the written adaptation is ours. TJ's fit call and discovery call exist because retainers need
  qualified buyers. Our page must answer the same questions ahead of time: who it is for, what it does not do,
  what happens after paying, is it a subscription, what is sent where, who sells it and what receipt the buyer
  gets. → A pricing FAQ in `invoice.html` and its FAQPage JSON-LD, with prices injected at build (§8 N4).
- **Words we never use:** "לכל החיים", "מיידי", "מובטח", "בלי שאלות", "כולל חשבונית מס", "מאושר ע"י רשות
  המסים". Each is either unverified or a promise the rail cannot keep (§8 REJECTED).

### 4.5 A correction found on the way: refunds can be made by API

`research/measurements/gumroad-license-decision.md:27` and `:184` say "The colony cannot refund by API with the
owner's token". Gumroad's code says otherwise (read 28.9.2026, antiwork/gumroad main; github):
- `app/controllers/api/v2/sales_controller.rb:7` authorises refund with `doorkeeper_authorize! :refund_sales, :edit_sales`.
- `base_controller.rb:7-8` appends `:account` to that list.
- `config/initializers/doorkeeper.rb` `public_scopes` includes `edit_sales` and `account`.
- `app/models/oauth_application.rb:121-122` gives a new application `public_scopes` by default.

A dashboard-minted token therefore carries a scope that the refund action accepts. This relies on Doorkeeper's
any-of scope semantics and has not been run.

So refunds need no owner action. The remaining gates:
- refund requests must reach a mailbox the agent reads (step 8, with the Gumroad sign-up on that mailbox);
- a responder must exist;
- Gumroad's balance must cover the refund.

That held funds count toward the balance is an inference, to be checked on the first real refund. → §8 A1, and
a dated correction note (§8 N14).

---

## 5. Marketing lessons

### 5.1 Faceless demos: what TikTok's rules allow

Source: Community Guidelines version 2026H2update, effective 24.9.2026, and the Creator Academy originality
article dated 2026-09-26. Both rendered in `tt-src-tiktok-com-community-guidelines-en-integrity-authenticity.html`
and `…originality-policy.html` (`tiktok-policy.md`).

- **No rule requires a face.** "faceless" and "on camera" have 0 hits, and "screen record" occurs only for LIVE.
  A screen recording of our own tool is original content.
- **Generic TTS is exempt from AI disclosure.** "Using generic text-to-speech (TTS) narration, when the TTS isn't
  a recognizable voice of a known individual". The stage-1 reading that a Kokoro voice "needs the AI label" is
  wrong for TikTok. We disclose anyway, because our constitution says so. A burned-in caption such as
  "קריינות: קול סינתטי (AI)" is an accepted disclosure form ("your own clear caption, sticker, or watermark").
- **Kokoro has no Hebrew voice** (`research/faceless-youtube/scouts/production-stack.md:43`; repo). Edge TTS is a
  terms grey area (`docs/REJECTED.md`). So the ₪0 honest Hebrew option stays **captions and on-screen text, no
  narration**. The Hebrew captures add a caution: none of the nine Hebrew videos had a caption track (rendered),
  and the reason is unknown (§6.2 item 5), so on-screen text is the only caption we control.
- **The rule every stage-1 scout missed: commercial disclosure.** Promoting "your own business, product, or
  service" requires the content disclosure setting. Without it TikTok "may reduce its visibility", and repeated
  failure can mean a ban.
- **What TikTok's text does to each risky element**, graded as in `08-reads/tiktok-policy.md` §2.9 (rendered;
  the codes are that reader's rows):
  - **Not allowed:**
    - an invented human spokesperson: "Pretending to be a fake person or organization with the goal of misleading people" (I3);
    - automation that runs many accounts or sends repetitive content (I2);
    - a public figure shown saying what they did not say, or endorsing a product (A9);
    - AI content made to look like a real news source (A9).
  - **Needs disclosure, not banned:** a cloned or real person's voice ("AI-generated audio mimics the voice of a
    real person"; A5).
  - **Kept out of the FYF or ranked lower, not banned:**
    - someone else's visible watermark or logo, and GIF-only or minimally edited clips: FYF-ineligible (O1, O3);
    - "Like-for-like", false incentives and misleading hooks: FYF-ineligible (I5);
    - promotional comments: ranked lower as spam (C8).
  - **Our own rules, stricter than TikTok's:** no voice clone of anyone, the owner included; no exports from free
    editors that stamp their logo; no comments on other creators' videos; one account, low volume.
- **Account-level risk.** An account that posts "a lot of content that’s ineligible for the FYF" can be made
  FYF-ineligible as a whole. So: low volume, human or checker review.
- **Free checks TikTok provides.** Content check lite before posting, and an FYF-ineligible notice in analytics.
  Both need the account holder's eyes, so using them as the gate and the kill signal (N12) is recurring owner
  viewing, not a one-time step (§5.5, §7.1 q1).

### 5.2 Repurposing

- TJ's content machine is real and running (§2.3).
- TikTok's Creator Academy promotes repurposing a creator's own long-form material, but the evidence is two
  navigation descriptions, not the articles, which were not captured: `long-to-short-form` ("If you've got an
  archive of longer videos — from another platform, your podcast, or your own long-form TikTok content — your
  next batch of posts is already filmed") and `smart-split` ("Are you a long-form content creator looking to
  repurpose your content on TikTok?"). Both are rendered in `…originality-policy.html`.
- What it removes is reuse "without adding any creative edits". Neither page defines a creative edit (§7 row 10).
- **Our rule:**
  - one verified source asset (a tool, its config, its sources) → a few natively re-edited pieces: a page, a
    silent demo clip, a FAQ entry;
  - rendered by our own ffmpeg;
  - reviewed against sources;
  - never a scheduled pipeline, never unattended.

### 5.3 Newsjacking

- The honest version is a **rules watch**, not trend-chasing. When a primary source changes, the tool page shows
  the new figure, "עודכן DD.MM.YYYY" and the source link, plus a row in a dated change table.
- @nissimhamawi's עוסק פטור / זעיר explainer shows why the Hebrew audience rewards this (§6.1). It also shows the
  cost of speed: its "no annual reports" was only half true.
- The עסק זעיר news moment itself ended in November 2024 to January 2025 (§7 row 7). Calling the track "new" in
  2026 would be false.

### 5.4 Search and AI search

| Claim | Status | What we do |
|---|---|---|
| Neil Patel: chatbots cite decision-stage comparisons, "even if your Google rankings stay the same" (`tt-oembed-neilpatel-7537667346354244919.json`) | PARTLY. Secondary vendor data says comparison and commercial queries cite comparisons and listicles, and informational queries cite articles (snippet: the verifier's source was not recorded and was not re-found). AI search favours earned, third-party media (Chen et al. 2025, arXiv 2509.08919, as summarised in `discoveredlabs/awesome-aeo-seo` `README.md:86`; github, secondary) | A small sourced פטור/מורשה block **inside** `osek-patur.html`, not a new article. A Hebrew comparison article already sits on page one for the ceiling query (`research/measurements/serp/2026-09-07-hebrew-calculators.md` Q3; snippet). Promise no AI citations |
| GEO paper "up to 40%" | PARTLY. The paper's own code prompts its quotation method to add quotes "even though fake and artificial" (`GEO-optim/GEO` `src/geo_functions.py:158`; github). That the 40% is this method, and that honest rewrites (fluency, easy-to-understand) gained +6% to +28% on a 2023 English GPT-3.5 benchmark, are the paper's figures, not re-read here (snippet) | Never quote 40%. Cite primary sources for honesty's sake, not for a measured lift |
| TJ's citation audit | Rendered method; his effect claims unverified | SEO work, so only after the board's three preconditions, the frozen domain among them (§8 A9): 10–20 Hebrew prompts, several runs, log and sort the cited URLs, fix our own pages so the pulled paragraph names the tool |
| Topics from real questions | Rendered (content machine) | Our pages promise data stays in the browser, so topics come from official FAQs now, and from Search Console queries only once A2's gates open; never from what users type into the tools |
| AI referrals as a channel | Repo: a rounding error (`content-seo--ai-content-policy.md` §6) | Stays low priority |

**Two structural limits.**
- The chief audit set three preconditions before any SEO hour: deploy, domain, one SERP read
  (`research/colony-sweep/BOARD.md` line 100). The domain is frozen by the ₪0 rule, and
  `src/revenue/owner-steps.ts:252` says "no SEO work is done while it is frozen". So the page changes above are
  justified as tool value on the page, not as an SEO campaign; the citation audit and query mining are SEO work
  and wait (§8 A2, A9).
- Search Console is not a checklist step. By standing ruling it is the owner's choice, in his own Google account
  ("backend-only, no public name"), asked for only after il-biz-tools shows 100 weekly views
  (`research/colony-sweep/BOARD.md` §6.3, lines 278–284; `products/il-biz-tools/README.md` item 3). We
  **propose** the brand account from step 8 instead, so that no owner account touches the site. That is an
  amendment for the main thread to put to the board, not a correction of the README.

### 5.5 The posting route

| Surface | Route | Evidence |
|---|---|---|
| Our own pages | Self-hosted `<video>`, `preload=none`, poster frame, burned-in captions and a `.vtt` track. No YouTube iframe | CSP `frame-src 'none'` in `products/il-biz-tools/netlify.toml`, and the pages promise cookie-free counting (repo) |
| YouTube | An audited publisher's free tier (T1's Stage A) or a manual upload. Never our own unaudited API project. A manual upload needs a person signed in to the brand Google account in a browser; the agent gets only a Gmail connector and a mail app password there (`docs/OWNER_STEPS.he.md` step 8 item 4), so the uploader is the owner, every time: recurring owner work | Unaudited uploads are locked private and "you will not be able to appeal" (`research/rendered/youtube-private-lock-help.txt:84`; rendered). This contradicts the "OPEN to an individual developer" line in `distribution--short-video.md` §1 |
| TikTok | Manual in-app posting by the owner, or nothing | Unaudited API clients post `SELF_ONLY`. TikTok's Developer Terms list as "Not acceptable" "A utility tool to help upload contents to the account(s) you or your team manages" (`OpenTermsArchive/vlopses-us-versions` `TikTok/Developer Terms.md:533`, "Last modified: Dec 26, 2025"), so self-hosted Postiz can never pass the audit honestly. Paid publishers break ₪0 (github; §7 row 12) |

**Both manual routes are recurring owner work.** Each upload is a sitting, and on TikTok each post also needs
Content check lite and a later look at the FYF notice in analytics (§5.1). MISSION rules that out as a standing
duty: "no manual ops" (`MISSION.md` line 211) and "Never invent a step that isn't required" (rule 1, line 416).
So a manual route can only be a single fixed batch, and even that is a new owner step for Fable to weigh
(§7.1 q1), with the kill signal replaced by one the agent can read.

The repo's reason for the TikTok block (`docs/REJECTED.md` line 40: TikTok "is currently unable to onboard
personal accounts or individual developers") quotes the TikTok API for Business portal, not the Content Posting
API. The conclusion stands; the stated reason needs correcting.

### 5.6 Calibration

- **TJ:** an experienced marketer posting spoken videos in English to a US audience has **20,711 followers
  after 439 videos**, with a sample median of about 4.8K plays. Whether he is on camera is unsettled (§7 row 4).
- **@tiktok.estimtes:** a brand-named Hebrew tool account ("הצעת מחיר דיגיטלית"), the only Hebrew
  business-tool account found. Its only captured video is ad-flagged (`"isAd":true`; paid delivery inferred,
  `08-reads/hebrew-israel.md` §2.1); whether anyone is on camera is unknown (no thumbnail viewed). It got 7,543
  plays, **7 likes, 0 comments, 0 shares**, on 21 followers
  (`tt-video-tiktok-estimtes-7461529726461447432.html`; rendered).

Nothing here reopens TikTok as a line.

---

## 6. Hebrew and Israel

Source: `hebrew-israel.md`. Nine Hebrew videos, all `locationCreated` "IL", all `IsAigc` false, none with an
auto-caption track.

### 6.1 What the Hebrew captures show

| Video | Date | Plays | What it shows |
|---|---|---:|---|
| @edelmanir 7458594829392514322 | 2025-01-11 | 86,800 | Buyer-side topic. On-screen "איך להתמקח עם חברות תקשורת" (type-9 sticker, not the caption) |
| @edelmanir 7623400135019564309 | 2026-03-31 | 81,100 | Topical question on screen: "כדאי למלונות באילת להוריד מחיר?"; 17 s; 114 comments |
| @nissimhamawi 7447094375772884232 | 2024-12-11 | 28,400 | פטור או זעיר explainer. 18.6× his 1,529 followers; 210 shares, the top share rate of the nine (0.74%). Posted the day the Tax Authority issued clarifications to representatives (Capitax page; rendered secondary). Ends on a consultation close |
| @edelmanir 7462637740559994120 | 2025-01-22 | 18,900 | "לא צריך לדעת לדבר, רק לאבחן שיטתי... למכור בלי לשכנע". His "35%" lift is his own claim |
| @edelmanir 7426249678359940373 | 2024-10-16 | 18,300 | "למה לא כדאי להציע הנחה…" |
| @tiktok.estimtes 7461529726461447432 | 2025-01-19 | 7,543 | Brand-named Hebrew quote-making tool account; ad-flagged (`isAd` true; paid delivery inferred); on camera unknown. 7 likes, 0 shares |
| @michael_danilovv 7311263185841982721 | 2023-12-11 | 7,519 | Tips list with a 1.66% save rate. Us-against-them hook |
| @zoharmamancpa 7158445994391129346 | 2022-10-25 | 5,786 | CPA one-question explainer. Credential in the bio; 11 hashtags |
| @michael_danilovv 7152498603452321025 | 2022-10-09 | 4,131 | Text-on-screen over licensed music |

The @edelmanir profile (rendered): 68,259 followers, 1,737 videos since 2021-09-18. It sells lectures,
workshops, consulting and courses, with the bio link Edelman.co.il.

### 6.2 Hebrew lessons

All counts rendered; patterns grade none (n ≤ 4).
1. **A regulation moment is the strongest Hebrew business hook**, but only when the claim comes from a primary
   source, on the day it changes. → Rules watch and dated updates (§8 N13).
2. **Authority on Hebrew tax TikTok is a credential in the name or bio.** Examples: "רו"ח" in @nissimhamawi's
   display name; @zoharmamancpa's bio. A faceless brand borrows authority by citation: a visible source and date
   line next to every statutory number. It never poses as an accountant
   (`skills/revenue-il-biz-tools/SKILL.md` Compliance). → §8 N8.
3. **Buyer-side framing.** @edelmanir's buyer-side and topical videos drew about 4× the plays of his
   seller-technique tips (86,800 and 81,100 against 18,300 and 18,900). → Leads that state the user's saving or
   the rejection avoided (§8 N9).
4. **The accountant is both the trusted channel and a likely PCN874 buyer.** Accountant creators close on "talk
   to me". Our replacement is the user carrying their own result to their own accountant. → Share button (§8 N7).
   The validator checks a single-dealer file (Appendix A) only. So no copy may pitch it for accountants'
   multi-client filing (`pcn874.html` line 62; repo). Extending it is a Fable question (§8 F4).
5. **None of the nine had a caption track** (`claInfo.captionInfos` empty; rendered), **and the reason is
   unknown.** It is not shown that TikTok cannot caption Hebrew speech: two of the nine have no original audio
   (@michael_danilovv 7152498603452321025 and @nissimhamawi 7447094375772884232, `hasOriginalAudio` false), and
   the `noCaptionReason` codes differ (4 on six videos, 3 on those two, 1 on @zoharmamancpa), with no key to what
   they mean. 7 of 9 put the topic in on-screen text. → Any Hebrew clip carries the question as on-screen text
   and the search phrase in a short caption, not in voice-over.
6. **Never discount on a price objection** (@edelmanir). → One fixed price (§4.2).
7. **Reject the Hebrew hype register:** "שיטה מחתרתית מטורפת", "סוכנויות שיווק לא רוצות שתגדלו", 11–12
   hashtags.

### 6.3 Israeli facts settled, and not settled

| Fact | Status |
|---|---|
| The income-tax track "בעל עסק זעיר" | Real. From tax year 2024; 30% of turnover in place of actual expenses; the cap is tied to the VAT עוסק פטור ceiling (₪120,000 for 2024–2025). "No annual report" is half true: a shortened annual report plus in-year tax coordination. About 40,000 registered by the end of December 2024. Rendered secondary (Capitax, cp1255-decoded); §7 row 7 |
| Amendment number (265 or 277) and the 2026 cap | Not settled. Capitax says 265 and links `265-2023.pdf`; the repo line saying 277 (`risk-governance--selling-as-individual.md:154`) was copied from a GitHub skill. No page states either until a primary source is rendered |
| Name collision | "עוסק זעיר" in VAT law (סעיף 31(3)) and 1981/1982 income-tax instruments are different things. Copy uses "בעל עסק זעיר / עסק זעיר", with "עוסק זעיר" only as the search phrase |
| "99% of Israelis use WhatsApp, 98% daily" (Bezeq) | UNSETTLED (the only source is a 403 blog); never cited. The share button does not need it |
| `wa.me/?text=` Hebrew share | The contact picker holds: "you'll be shown a list of contacts you can send your message to" (WhatsApp FAQ 5913398998672934 as quoted from a 2020 Wayback snapshot in `sachinshelke/ToolsConnector` `.agent/artifacts/whatsapp-wire-register.md:253`; github, secondary). **The wa.me → api.whatsapp.com redirect corrupts emoji into U+FFFD** (`Ekfern/ekfern-core` `frontend/lib/whatsapp.ts:19-21`; `KernelByte/gestor_gac_f` `src/app/shared/whatsapp.ts:5-7`; developer comments, github). RTL display on devices: none |

---

## 7. Verification table (13 claims) and the Fable queue

| # | Claim (from the stage-1 critic) | Verdict | Grade | Evidence | What it changes |
|---|---|---|---|---|---|
| 1 | Repurposed short video is "the only marketing TJ does", and "TikTok beats other platforms for leads" | PARTLY | rendered | The first half is verbatim in `…content-machine.txt`. The second is a podcast host's description (`tt-src-ivoox-…txt:148`). His own title credits "YouTube & TikTok" together; no conversion data | Say "TJ says short video is his only marketing and brings about 90% of clients", as his claim. Never rank TikTok first for that reason |
| 2 | "Getting cited is harder than ranking; the biggest factor is fact density" (Peec + Search Console workflow) | NOT FOUND (attribution refuted) | rendered absence / snippet | 0 hits across all TJ captures, and the proposed source is refuted (`08-reads/tj-offsite.md` §4, F29–F30): the LinkedIn "density" is page layout. His published method says citation slots have "very little competition". Peec.ai use confirmed, and it is paid | Do not attribute. Use his citation-audit method. No density target. Peec fails ₪0 |
| 3 | Caption of 7550459646654418189: "SEO might be wasting your money…" | UNSETTLED | rendered (gone) | Page `status_deleted`; oEmbed 400 | "Check demand first" cannot cite him. A demand gate should not kill a topic on keyword volume alone |
| 4 | His format is his own face on camera | UNSETTLED | none | No image fetched; `effectStickers` empty; one captured long-form is a screen walkthrough | Say "spoken explainers, on camera unverified". No tactic depends on it. Fetch thumbnails in the §9 P1 re-render job |
| 5 | 17K followers, 112.7K likes, 140 following; 15/16/17 years | PARTLY: snippet numbers stale | rendered | `statsV2`: 20,711 / 149,826 / 153 / 439. Years fit a 2009 start | Use the rendered figures, dated 28.9.2026 |
| 6 | The honest Medium subset contradicts the parasite-SEO RED in `content-seo…md` §5 | PARTLY | github | Google's spam-policies text lists "Sites designed to allow user-generated content" among the "Examples that are NOT considered site reputation abuse", and the remedy is addressed to the host ("If you're hosting pages that violate this policy"). Read in `lesishu/seo-guide-skill` `references-google/spam-policies-full.md:160-178` ("Last updated 2026-04-13 UTC", line 245); the same line is in `bsisduck/google-search-ads-analytics-docs` `Docs/search-central/docs/essentials/spam-policies.md:310` and `ChinmayOnGithub/tools` `policies/05_search_spam_policies.md:173` (undated mirrors). §5 dropped that carve-out | **Fable**: narrow §5? Any Medium use must drop TJ's "outrank via authority" intent |
| 7 | עוסק זעיר is a new income-tax track; rests on one caption; collides with VAT סעיף 31(3) | PARTLY | rendered secondary | Capitax (cp1255): Amendment 265, 30%, cap tied to the VAT ceiling, shortened report, about 40K registrations. The repo already had it (`risk-governance…md` §4) | Kill the "new status" newsjack; evergreen tool only; copy rules in §6.3; amendment number and 2026 cap wait for a primary render |
| 8 | Bezeq 2025: 99% use WhatsApp, 98% daily | UNSETTLED | snippet | The only source is a 403 Times of Israel blog; denominator unknown | Never print it; the share tactic stands without it |
| 9 | `wa.me/?text=<Hebrew>` with no number opens the contact picker with RTL Hebrew intact | PARTLY | github | Contact picker: WhatsApp FAQ quoted in `sachinshelke/ToolsConnector` `.agent/artifacts/whatsapp-wire-register.md:253` (secondary). The redirect corrupts emoji: `Ekfern/ekfern-core` `frontend/lib/whatsapp.ts:19-21`, `KernelByte/gestor_gac_f` `src/app/shared/whatsapp.ts:5-7`. That the link-preview card is skipped is reported, but its source was not recorded and was not re-found (none). RTL display on devices: none | Build spec: `navigator.share` first, `api.whatsapp.com/send?text=` fallback, no emoji, URL on its own line after `%0A`. The fallback ships only after a recorded Android and iOS device test (N7) |
| 10 | The AI label does not reduce reach; unoriginal or repurposed content is FYF-ineligible | PARTLY | rendered + github | TikTok's API for Business doc, "Publish a public video post to an owned account", `is_ai_generated` field: the setting "won't affect the distribution of your video as long as it doesn't violate our [Community Guidelines]" (`henry-md/ad-mcps` `docs/tiktok-business-api/portal/web-docs/api-reference/accounts/posts/publish-a-public-video-post-to-an-owned-account.md:70`; also `ckr2436/Tiktok-OPS` `docs/tiktok_api/pages/API Reference/Accounts/Posts/Publish_a_public_video_post_to_an_owned_account__c072f33c.json`). Originality: reuse "without adding any creative edits" may be removed from the FYF (rendered). Creator Academy navigation descriptions promote repurposing one's own material (articles not captured); "creative edit" is undefined | Label voluntarily; it is a TikTok statement, not a measurement. Re-edit every cut natively; no foreign watermarks |
| 11 | GEO paper "up to 40%" | PARTLY | github (prompts) / snippet (figures) | The paper's code prompts the quotation method to add quotes "even though fake and artificial" (`GEO-optim/GEO` `src/geo_functions.py:158`) and lets Cite Sources invent sources ("You may invent these sources", `:166`). The figures (40% = Quotation Addition; honest rewrites +6% to +28%; about +21% for the best method on Perplexity) are the paper's and were not re-read here | Never cite 40%; GEO rewrites are hygiene, not a lever |
| 12 | Posting route: "manual or nothing", or self-hosted Postiz? | PARTLY | github | Self-hosted Postiz uses our own TikTok app, which posts `SELF_ONLY` until audited, and the Developer Terms' "Intended Use" rule marks "A utility tool to help upload contents to the account(s) you or your team manages" as "Not acceptable" (`OpenTermsArchive/vlopses-us-versions` `TikTok/Developer Terms.md:533`, "Last modified: Dec 26, 2025"). The REJECTED.md quote ("unable to onboard personal accounts or individual developers") is from the Business API portal (snippet: the verifier's source was not re-found here) | Postiz is dead for TikTok. Correct the reason in `docs/REJECTED.md` |
| 13 | Neil Patel: chatbots cite decision-stage content over "top 10 tips" | PARTLY | rendered claim + github secondary + snippet | Vendor data: comparative listicles lead for commercial queries, articles for informational ones (snippet: source not recorded, not re-found). Chen et al. 2025 (arXiv 2509.08919): bias toward earned media, as summarised in `discoveredlabs/awesome-aeo-seo` `README.md:86` (github, secondary; the paper was not read) | Comparison block inside `osek-patur.html` only; no AI-citation promise |

**Tally:** 9 PARTLY, 3 UNSETTLED, 1 NOT FOUND. Only row 6 asked for a Fable ruling. Two WebSearch calls were
used in total (rows 2 and 8).

### 7.1 Questions queued for the Fable sitting

These are for the main thread to add to `logs/FABLE_QUEUE.md`. This stage does not decide them.

1. **TikTok presence at all.** Should the brand ever have a TikTok account? Its cheapest honest form is one
   brand account and one fixed batch of 3–4 gate-passed silent demo clips:
   - uploaded by the owner in the app, in a single sitting;
   - content disclosure on;
   - comments off;
   - bio naming the free validator. Whether a new brand profile gets a clickable bio link at all is unverified
     (grade none): TJ at 20.7K followers has no `bioLink` key, so the address may be plain text only.

   Evidence against: TJ at 20,711 followers after 439 videos (on camera unverified), and @tiktok.estimtes, a
   brand-named Hebrew tool account whose only captured video is ad-flagged (paid delivery inferred; on camera
   unknown), with 7 likes on 7,543 plays. Recurring per-clip posting fails MISSION rule 1. The sign-up would be a
   **new owner step**, on the step-8 mailbox and a phone, stopping at any selfie or face-based age check. No such
   step exists in `docs/OWNER_STEPS.he.md`.

   **Recurring owner work the batch still carries.** §5.1 and N12 make Content check lite the pre-post gate and
   the FYF-ineligible notice in analytics the kill signal, and both need the account holder's eyes: ongoing owner
   viewing, against "no manual ops" (`MISSION.md` line 211) and "Never invent a step that isn't required" (rule 1,
   line 416). A yes must say who looks, how often, and for how long, or name a kill signal the agent can read
   without the owner.
2. **UGC hosts.** Should `content-seo--ai-content-policy.md` §5 and `research/colony-sweep/groups/store-promotion.md:26`
   be narrowed? The proposal: a handful of substantive, AI-disclosed Hebrew guides by Mehudak on a site built for
   user content such as Medium, each linking to the free tool. The purpose is reaching that site's readers, not
   borrowing its authority. Constraints:
   - it needs a brand-only account, a new proposed owner step;
   - Medium's AI rules reportedly cap disclosed AI content at General Distribution ("Disclosed AI content:
     General distribution only (NOT Boost eligible)", in a third-party summary,
     `alirezarezvani/medium-content` `references/medium-distribution-guidelines.md:14`; github, secondary; Medium's
     own page was not read);
   - no SEO lift is expected.

   Reddit stays RED either way.
3. **The pcn874 paid offer.** Is a paid generator honest to sell, given the stated boundary "the validator
   cross-checks no amount"? One-time licence or per filing period? And may the free validator be promised to stay
   free? Until the ruling, `pcn874.html` makes no paid ask and writes no "ונשאר חינמי".
4. **Accountants as a segment.** Should build hours go into Appendix B (the representatives' file, circular lines
   194–215) so the validator and generator serve accountants' multi-client filing? Every accounting suite
   exports PCN874, and the Authority's simulator is free (constraint 8; snippet).

---

## 8. The action list

**How to read it.**
- **NOW** means built and tested now: ₪0, no owner step needed to build.
- **Nothing becomes public until the il-biz-tools site passes its existing publish gate.** That gate is step 8
  (the brand mailbox is the accessibility contact) and the deploy route.
- **Nothing shows a price or opens checkout before steps 2, 3 and 6.**
- Items that edit files this stage may not touch (for example `docs/`, `logs/` or `products/`) are for the main
  thread or a builder.

### 8.1 NOW (₪0, no owner step)

| # | Change | Exact files | Lesson |
|---|---|---|---|
| N1 | **Visible price and deliverable in the Pro box.** Extend `writeSiteJson` to store Gumroad's read-back `gumroad.priceCents` and `gumroad.currency`. Render the price only in `proButtonState` `ready`. Move "תשלום חד-פעמי, בלי מנוי" out of `#pro-privacy` into visible text. Lift one trust line beside the ask: "הלוגו והמסמכים נשמרים בדפדפן שלכם בלבד; רק מפתח הרישיון נבדק מול Gumroad". Test: the displayed price equals config, and is absent in every other state | `products/il-biz-tools/invoice.html` 110–114 and 135; `src/lib/gumroad.js` 89–93; `src/config/site.json`; `scripts/gumroad-pro-product.js`; tests | §4.1, §4.2 |
| N2 | **Try-before-you-pay preview.** In the `ready` state with no licence, open `#branding-fields` with a notice above the upload. Apply logo and colour to the on-screen `#preview` only; an `@media print` rule hides them unless Pro is active. Free printing stays exactly as today; no watermark. Notice: "אפשר לנסות לפני שקונים: … בהדפסה ובשמירה כ-PDF הם יופיעו רק אחרי הפעלת Pro." | `invoice.html` 137; `src/lib/branding.js`; `assets/page-invoice.js`; `assets/style.css` print block; tests for screen and print | @revelloughlin |
| N3 | **One ask after a free print.** On `afterprint`, when the shop is `ready`, no licence is active and preferably the preview was tried, show one factual dismissable line once per session. localStorage wrapped in try/catch; no modal or timer. Copy: "המסמך נשמר בלי לוגו. Pro מוסיף את הלוגו וצבע המותג – ₪{config}, תשלום חד-פעמי." | `invoice.html` actions (print button at line 103); `assets/page-invoice.js` | @pm_alliance, @salestipstok, TJ |
| N4 | **Pricing FAQ:** (a) why pay if the generator is free; (b) what Pro adds and does not do (no חשבונית מס; `DOC_TYPES` are קבלה and חשבונית עסקה only; not accounting software, not tax advice); (c) what happens after paying; (d) is it a subscription; (e) is the logo uploaded; (f) who sells it: Gumroad as merchant of record, store Mehudak (מהודק), Gumroad's receipt. Mirror briefly in `index.html`. Prices injected at build. Test: each answer matches the code | `invoice.html` FAQ (line 192) and JSON-LD; `index.html` `#faq` and JSON-LD; `scripts/build-site.js`; tests | @geoffketterer adapted, TJ's two calls, @edelmanir |
| N5 | **One name, by deliverable, before the first `create` run.** h3 "Pro – הלוגו וצבע המותג על המסמך"; the same string in `proProductName` and activation step 3; button label "לרכישה ב-Gumroad"; visible line "המכירה ב-Gumroad, בחנות Mehudak (מהודק)" | `invoice.html:110`; `src/lib/gumroad.js:91`; `scripts/gumroad-pro-product.js:56`; tests | value equation; checkout trust |
| N6 | **No buyer can reach the owner.** `enableProduct` refuses unless `state/colony/brand-mail.json` shows the mailbox probe green; `create` stays ungated. Step 3 item 1 says the Gumroad sign-up email is the step-8 brand mailbox, not a personal address | `products/il-biz-tools/scripts/gumroad-pro-product.js` `enableProduct` (line 229) and test; `docs/OWNER_STEPS.he.md` step 3 | MISSION rule 1; TJ's calls replaced by pages |
| N7 | **The PCN874 post-result slot.** (a) "הדפסה / PDF של הממצאים": file name, date checked, scope lines verbatim, "אינו ייעוץ מס". (b) A user-initiated share: `navigator.share` first, fallback `https://api.whatsapp.com/send?text=…`, no emoji, URL alone on the last line with `?via=share`; text carries only the error and warning counts and rule names, **never a value from the file**. (c) FAQ "למה הבודק חינמי?" with an honest funding line and **no link to a paid product** (a link would be the Pro upsell §8.4 rejects, in the slot §4.3 keeps for value); no "ונשאר חינמי". No storage API on this page. Test: decode the href, assert the Hebrew string, no code point above U+FFFF, URL on its own line. **Release gate for (b):** the `api.whatsapp.com` fallback goes public only after an Android and an iOS device test is recorded (RTL text intact, contact picker opens, preview card behaviour noted), as the stage-1 critic required; until then (b) ships as `navigator.share` only, hidden where the browser lacks it. The colony has no phones, so nobody can run the test today; it is not added to the owner's checklist (MISSION rule 1), and `navigator.share` only is the default | `products/il-biz-tools/pcn874.html` after `#pcn-results` (line 82) and FAQ (line 94); `assets/page-pcn874.js`; `README.md` PCN874 "what it does not do"; tests | §6.2 item 4; §7 row 9 |
| N8 | **Source and date next to every statutory number.** `osek-patur.html` states ₪122,833 in the title, meta, JSON-LD, lead (line 52) and FAQ, with no visible source, although `src/config/osek-patur.json` holds one. Add `checkedOn`, render "מקור: כל זכות · נבדק: <date>", and label a stale year "הנתון לא עודכן עדיין לשנת <year>". Then the same on `vat.html` and `net-salary.html`, only where the config is `verified:true` | `osek-patur.html`; `src/config/osek-patur.json`; then `vat.html`, `net-salary.html` | Hebrew authority by citation |
| N9 | **Leads as the user's gain.** `pcn874.html:57`: "לפני ששולחים את הדוח המפורט: בדיקת מבנה שורה-שורה, בדפדפן, בלי העלאה". `osek-patur.html:52`: "כמה נשאר לכם עד התקרה השנה, ומתי כדאי להיערך". One line on each tool page: "התוצאה מוצגת מיד, בלי להשאיר פרטים ובלי שיחה". Never "יתקבל" or "מאושר" | `pcn874.html` 56–57; `osek-patur.html` 51–52; other tool leads | @edelmanir buyer-side; TJ's template |
| N10 | **PCN874 rule reference, generated at build** from the validator's rule table: each check as error or warning, the circular line it cites, a plain explanation, then the "not checked" list. Page and tool cannot drift apart | `pcn874.html` section, or a generated sibling page; sources `products/pcn874/docs/SPEC.md` and the rule table | Saves on reference content (TJ; Hebrew tips list) |
| N11 | **Silent screen demo, 30–60 s.** A headless browser films `pcn874.html` loading one failing and one passing synthetic fixture labelled "קובץ לדוגמה, לא נתוני אמת"; the question burned into the first frame; the scope panel on screen; ends on the page. Self-hosted `<video>` with `preload=none`, a poster and a `.vtt`; a line saying it was produced automatically by the brand's software. Same pipeline later for `osek-patur`, `vat`, `allocation` and `invoice` only (`verified:true` configs; the invoice clip shows "בקרוב"). The PUBLISH-1 identifier grep also runs on MP4 metadata | `products/il-biz-tools/assets/`; a render script under `products/il-biz-tools/scripts/` (Playwright `recordVideo`, or screenshots with ffmpeg as in `products/chart-explainer/assemble.py`) | TJ embeds; TikTok policy; Kokoro has no Hebrew |
| N12 | **One video publishing checklist for every surface.** Own footage and real edits; no foreign watermark; commercial disclosure on; burned-in AI and automation line; stock voices only, no clone; no synthetic presenter; true, sourced hooks; no news styling; comments off or unanswered; one account, low volume, no automation; Content check lite; FYF notice as a kill signal (both need the account holder's eyes, so on TikTok they are recurring owner viewing until F1 names who looks; §7.1 q1); YouTube `containsSyntheticMedia=true` when a synthetic voice is used, and no `publish_at`. Mark which items are platform rules and which are ours | new `docs/VIDEO_PUBLISHING_CHECKLIST.md`, linked from `skills/revenue-il-biz-tools/SKILL.md` and `research/faceless-youtube/T1-PROTOCOL.md`; machine-checkable items into `src/revenue/publication-gate.ts` | `tiktok-policy.md` §3 |
| N13 | **Rules watch.** Weekly hash watch of primary pages that render from the runner: gov.il BlobFolder documents and btl.gov.il return 200; `gov.il/he/service` and Kol Zchut return 403. Capitax serves only as a secondary alert. A change opens an item: read the primary text → update config (`verified` only after reading) → stamp the date and link → add a row to the page's dated change table. Seed the known calendar: January ceilings and rates, VAT deadlines, PCN874 editions. Also fix the stale sentence in `products/README.md`: `SPEC-SOURCES.lock.json` now holds three SHA-256 values (repo) | a `rules-watch` workflow beside `pcn874-spec-watch.yml`; `src/config/*.json` (`updated`, `sources`); `osek-patur.html`, `vat.html`, `pcn874.html`; `products/README.md` | @nissimhamawi timing; TJ newsjacks |
| N14 | **Dated correction notes** beside the original claims, not rewrites: (a) `distribution--short-video.md` §1: unaudited YouTube uploads lock private; (b) `08-reads/tj-offsite.md` L4: the embed must be a same-origin `<video>`; (c) `08-reads/tj-tiktok.md` L7 and `07-ai-money-tooling.md` lines 65, 134, 166, 198, 224 (134 holds the strongest form, "required the AI-generated label on all AI video since Mar 2026", per `08-reads/tiktok-policy.md` §4.2): TikTok requires disclosure only for realistic-looking AI scenes or people and for AI audio that mimics a real person; generic TTS is exempt, so our label on a stock-voice demo is ours by choice; (d) `docs/REJECTED.md:40`: the quote "is currently unable to onboard personal accounts or individual developers" is from the Business API portal, and the real gate is the intended-use rule plus the audit; (e) `research/measurements/gumroad-license-decision.md:27`, `:184`: refund by API is authorised through `edit_sales` (§4.5). (f), Search Console on the step-8 brand account, is a proposed board amendment, not a correction: the README follows BOARD §6.3 (§5.4) | the files named | §7 rows 10, 12; §4.5; §5.5 |
| N15 | **Accountant copy stays in scope.** No page, share text or future copy pitches the validator for "רואי חשבון ומייצגים" multi-client filing. The honest line: "לבדוק קובץ של עוסק אחד – שלכם או של לקוח" | `pcn874.html` scope box; share text; future pcn874 copy | MISSION rule 4 |
| N16 | **Render queue.** Add §9's URLs, in priority order, with the transcript and thumbnail job first (a re-render fetches fresh signed links, so no deadline binds), and the JavaScript-capable job of P1b as a new runner job once its terms check passes | `logs/CHANNEL_LOOP.md` (main thread) | §1.3 |

### 8.2 AFTER AN OWNER STEP

| # | Action | Owner step it waits on |
|---|---|---|
| A1 | **Bounded refund line**, e.g. "החזר כספי בתוך 7 ימים מהרכישה: משיבים למייל הקבלה מ-Gumroad". It mirrors Gumroad's own policy, which the product job reads via `GET /v2/refund_policy` into `site.json`. It renders only when `in_effect` is true and a responder flag is set, and only after the first real refund confirms the balance covers it. Never "בלי שאלות"; never cite consumer-protection law | Step 8, with step 3's Gumroad sign-up on that mailbox; steps 2 and 6 for the product. No new step: the refund is an agent API call |
| A2 | **Search Console**: a URL-prefix property verified by a file the colony ships, the sitemap submitted, and monthly reads of queries (→ answer-first FAQ entries the page truly answers) and the generative-AI report. The account is the owner's choice under BOARD §6.3; the brand account is our proposal (§5.4) | Not a checklist step. Asked for only after il-biz-tools shows 100 weekly views (`research/colony-sweep/BOARD.md` §6.3, lines 278–284), and the page-view counter is not wired yet (`logs/CHANNEL_LOOP.md` pcn874 row). The query reads that feed FAQ entries are SEO work, so they also wait for the board's three preconditions, the domain among them (step 5, frozen: `src/revenue/owner-steps.ts:252`, "no SEO work is done while it is frozen"). The site must be public first (step 8 plus the deploy route) |
| A3 | **Code link as a credential**, plus a build-generated test count | Step 7 (GitHub organisation). Today every raw URL carries the owner's username |
| A4 | **Receipt FAQ**: "מקבלים חשבונית מס?" answered only with confirmed facts: Gumroad is the seller of record and issues its receipt; deductibility is a question for your accountant. First settle whether Gumroad sales to Israelis also need an Israeli invoice (MISSION: an invoice to an Israeli customer names the עוסק) | Steps 2 and 3 |
| A5 | **The six post-T1 chart-explainer videos.** The title is a question, as in his 2025-12+ captions and his Shorts titles (§2.4; rendered); one true, dated surprise; one pointer to the page. Released at review pace; no cross-posts during T1 (7 of 10 free-tier uploads are reserved) | Stage A (the step-8 brand Google account, plus one publisher sign-in), asked only after the web arm's day-56 read |
| A6 | **mcp-il-tools README**: a real terminal cast of one tool call | Step 7 and proposed step 9 (npm user `mehudak`) |
| A7 | **Any brand profile bio**: "מהודק – כלים חינמיים לעסקים קטנים בישראל" plus the free tool's address; the link goes to a free tool page, never to checkout. On TikTok a clickable bio link for a new brand profile is unverified (grade none; TJ has no `bioLink` key), so plan for the address as plain text | YouTube: step 8 plus Stage A. TikTok: a new step, only if F1 says yes |
| A8 | **Hebrew tool demos on YouTube** (one per verified page, low volume, brand-only description) | Stage A, and only after T1 shows the publisher returns public uploads; the second-channel question is weighed against cluster detection |
| A9 | **TJ-style citation audit** (10–20 Hebrew prompts, several runs, logged), then fixing our own pages | It is SEO work, so the board's three preconditions apply (`research/colony-sweep/BOARD.md` line 100): deploy (step 8 plus the deploy route), domain (step 5, frozen by the ₪0 rule; `src/revenue/owner-steps.ts:252`), and one SERP read (done: `research/measurements/serp/2026-09-07-hebrew-calculators.md`). Frozen until the owner unfreezes step 5, and then only once the site is indexed. We do not argue it is not an SEO hour: TJ's own step is "Publish pages that take the citation slot" |
| A10 | **Indiebook**: one sourced section of a Hebrew ebook as a page on our site, labelled as an excerpt, AI declared | Whatever Indiebook requires (`research/measurements/indiebook.md` is NEEDS_MORE; the next check is a written question from the step-8 mailbox) |
| A11 | **"פטור + בעל עסק זעיר, או דיווח רגיל?" self-check tool.** It shows when the 30% track loses. Blocked on a primary render (N16), not an owner step. The copy rules are in §6.3 | None; primary source first |

### 8.3 FABLE RULING

- **F1** TikTok presence at all (§7.1 q1).
- **F2** Narrowing the parasite-SEO RED for UGC hosts (§7.1 q2).
- **F3** The pcn874 paid offer (§7.1 q3).
- **F4** Appendix B for accountants (§7.1 q4).
- **BookTok, for the Hebrew Indiebook ebooks: not researched in this study.** It is TikTok's best-known
  book-selling channel, and the only lesson here for the ebooks is A10, which is not a TikTok lesson. It needs a
  TikTok account, so it is queued behind F1: if F1 says no, it is closed with TikTok; if yes, one scout sweep of
  Hebrew book content on TikTok comes before any clip.

### 8.4 REJECTED

| Tactic | Reason |
|---|---|
| Invented "was ₪199" price, or a permanent auto-discount that shows a crossed-out price | Fake anchor (MISSION rule 4). @conversion.doc's attention figure proves no method |
| "At capacity", waitlists, "limited licences", countdowns, launch-price-ends | Fake scarcity on software |
| "לכל החיים" / "לתמיד" / lifetime deals | The colony kills lines by its own rules; a promise the rail cannot honour |
| Advertising a money-back guarantee before A1's gates, or unbounded wording | Requests would reach the owner's personal inbox; the words would not match the mechanism |
| Citing consumer-protection law for refunds | Digital goods are likely excluded; any window is voluntary |
| Testimonials, user counters, star ratings, "authentic-feeling" testimonial ads | We have none, and no measurement exists; deceptive |
| Per-unit maths ("פחות משקל לקבלה") | Invents a denominator |
| Comparison anchors against full invoicing systems' subscription prices | False equivalence |
| Discount codes on objections, exit-intent popups | @edelmanir's own lesson; manipulation |
| A Pro upsell on pcn874, vat, osek-patur, net-salary, allocation or registrar-fee | Irrelevant ask; branding does not extend those jobs |
| Gating any free result behind email or payment | Breaks the promise at `invoice.html:111` and the honest-value rule |
| "Book a call", DM for questions, live objection handling, remote closing | Needs a human (MISSION rule 1) |
| Doom or fear copy; the Hebrew hype register; 11–12 hashtags | Engagement bait; TikTok marks misleading claims FYF-ineligible |
| "חשבונית מס", "מוכר כהוצאה", "מיידי" claims | Unverified |
| A watermark on free prints | Worsens the free tool and could stamp the user's client's receipt |
| Linking the repo as a credential before step 7 | The owner's username is in every raw URL |
| Paid TikTok lead ads, Spark Ads, boosting | ₪0 rule; TikTok's own small-business lead guidance is a paid objective: "20+ conversions within 5 days", budget "10x your expected CPL" (rendered) |
| Comment-to-get, DM funnels, answering comments, promotional comments on others' videos | Customer contact and comment-bait |
| Teasing the unpriced pcn874 generator ("בקרוב") | Advertises a product with no price and a known boundary |
| Recurring manual TikTok posting by the owner | Recurring owner work (BOARD-LOOP KILL-4, BUILD-6); near-zero expected value |
| Self-hosted Postiz or our own TikTok API client | Unaudited clients post `SELF_ONLY`; the audit refuses own-account uploaders, and presenting ours as a wide-audience app would misrepresent it |
| Paid publishers (Upload-Post TikTok tier, Ayrshare, Postiz Cloud) | Subscription; ₪0 rule and PUBLISH-9 |
| Our own unaudited YouTube API project | Uploads lock private, with no appeal |
| A YouTube iframe on the site | `frame-src 'none'` and a cookie-free promise |
| CapCut or OpusClip free exports carrying their watermark | TikTok FYF originality rule; a third-party brand beside ours |
| Edge TTS for Hebrew, any voice clone, AI avatars or invented founders | Edge TTS: terms grey area, and Kokoro has no Hebrew. Voice clones: our rule (TikTok only requires disclosure, §5.1). Invented founders: TikTok's fake-person ban. The owner never appears |
| TJ's face-on-camera format, podcasts, LinkedIn posting, Reddit AMAs | Need a human who appears or talks |
| City or modifier page farms | Doorway pattern, MISSION constraint 6 |
| Mining what users type into the tools for topics | Breaks the browser-only data promise |
| "Fact density" targets, invented statistics or quotes, quoting "40%" | Unfounded attribution; fabricated content |
| Citing TJ for "check search demand first" | UNSETTLED; the video is gone |
| Publishing tax claims before the primary source; news-styled AI clips; calling עסק זעיר "new" | False or half-true; TikTok bars AIGC that looks like a news broadcast |
| Citing "99% of Israelis use WhatsApp" | UNSETTLED |
| `wa.me` share links with emoji | The redirect corrupts emoji |
| Posting into WhatsApp or Facebook business groups; cold email or WhatsApp to accountants; affiliate recruiting | Human messages, cold outreach, §30א opt-in |
| A forced "נוצר ב-…" footer on free receipts | An involuntary ad on the user's legal document |
| A separate "פטור מול מורשה" article | Page one already holds one; new pages should be tools |
| Pitching the validator for representatives' files | Appendix B is not supported |
| T1 cross-posts or Shorts cuts during the experiment; embedding T1 in its web arm | Spends the free tier; contaminates the read |
| Ranking TikTok first because it "beats every other platform for business leads" | A host's blurb, not data |
| Mass faceless pipelines; several accounts or channels per audience | RED: TikTok spam rule, YouTube inauthentic content, MISSION constraint 3 |
| Ghost bylines with no AI disclosure | Blurs the author; hides AI |
| Faceless-digital-product "how to sell" niches as a target or product | TikTok flags those queries `keywordEcomIntent` 0; seller-education audience; course-about-courses already rejected |

---

## 9. URLs to render next

Only URLs seen in a capture are listed, in priority order, except the constructed URLs in P1b and P3, which are
marked as such. The source capture is named where it is not obvious.

**P1 — transcripts and thumbnails (no binding deadline).**

Re-render each page below and, **in the same runner job**, fetch the page's `itemStruct.video.subtitleInfos[0].Url`
(the ASR WebVTT transcript) and its oEmbed `thumbnail_url` image. This container's proxy refuses TikTok's CDN, so
only the runner can do it. The signed URLs in today's captures (listed verbatim in `08-reads/tj-tiktok.md` §5A and
`08-reads/sales-creators.md` §5) expire 2026-09-30 about 21:00 UTC, but the re-render in the same job returns
fresh ones, so the date only matters for fetching those exact copies.

- https://www.tiktok.com/@tjrobertson52/video/7504044860782021930 (the top video; also view the thumbnail: on camera?)
- https://www.tiktok.com/@tjrobertson52/video/7627620325940940046 (the latest rendered; view the thumbnail)
- https://www.tiktok.com/@tjrobertson52/video/7548494380689149239 (what his #ParasiteSEO video actually recommends; bears on F2)
- https://www.tiktok.com/@tjrobertson52/video/7592778591801232653
- https://www.tiktok.com/@tjrobertson52/video/7518238106319998263
- https://www.tiktok.com/@tjrobertson52/video/7579436705594297613
- https://www.tiktok.com/@tjrobertson52/video/7582743188151078199
- https://www.tiktok.com/@tjrobertson52/video/7519331837844442382
- https://www.tiktok.com/@conversion.doc/video/7430511437199543584 (the anchoring method is not in the caption)
- https://www.tiktok.com/@ahormozi/video/7336007528070958382
- https://www.tiktok.com/@pm_alliance/video/7441618513669655864

**P1b — the owner's "search TikTok" ask and TJ's most successful videos: a JavaScript-capable render (a new
runner job).**

The plain GET of `render-watch.yml` returns shells for these pages: the discover and tag lists load client-side,
and the profile's `itemList` came back empty under the `reduce_user_item_list` experiment flag
(`tt-profile-tjrobertson52.html`; rendered). A headless Chromium on the runner (Playwright, which N11 already
plans for its demo renders) that loads each page, waits for the list, scrolls a few screens and saves the
rendered DOM plus the item JSON it received would close both gaps: the most-played TJ videos (the sample holds
1.9% of his likes) and a real in-TikTok search for sales and marketing material. Whether TikTok serves these
lists to a logged-out headless browser is unknown (grade none).

**Gate before running it (grade none):** read TikTok's Terms of Service first (P6 lists it). The board ruled
automated Google SERP scraping out because it violates Google's terms and the mandate forbids ToS violations
(`research/colony-sweep/BOARD.md` §6.3 item 2); the same test applies to automated TikTok search queries. A login
wall, captcha or empty list is recorded as not rendered, never retried with an account.

- https://www.tiktok.com/@tjrobertson52 (profile grid with play counts; sort by plays after the scroll)
- https://www.tiktok.com/discover/value-equation-hormozi
- https://www.tiktok.com/tag/saas?lang=en
- https://www.tiktok.com/discover/how-to-sell-a-digital-product-as-a-faceless
- https://www.tiktok.com/discover/how-to-promote-digital-products-faceless
- https://www.tiktok.com/discover/%D7%A9%D7%99%D7%95%D7%95%D7%A7%C2%A0%D7%A2%D7%A1%D7%A7%D7%99%D7%9D%C2%A0%D7%95%D7%99%D7%97%D7%A1%D7%99%C2%A0%D7%A6%D7%99%D7%91%D7%95%D7%A8 (the Hebrew discover page, "שיווק עסקים ויחסי ציבור")
- Constructed, not seen in a capture: `https://www.tiktok.com/search?q=` with `sales%20tips`,
  `pricing%20strategy`, `saas%20marketing`, `free%20tool%20marketing`, and the Hebrew
  `%D7%A9%D7%99%D7%95%D7%95%D7%A7%20%D7%9C%D7%A2%D7%A1%D7%A7%D7%99%D7%9D%20%D7%A7%D7%98%D7%A0%D7%99%D7%9D`
  ("שיווק לעסקים קטנים").

**P2 — primary Israeli sources, all linked from `tt-src-capitax-co-il-content-2-3311.html`.**

These settle the amendment number and the 2026 cap. Read the PDFs from the binary, and decode HTML as cp1255.
- https://www.capitax.co.il/Attachments/265-2023.pdf
- https://www.capitax.co.il/Attachments/26112024-2.pdf
- https://www.capitax.co.il/Attachments/11122024.pdf
- https://www.capitax.co.il/Attachments/21072025-1.pdf
- https://www.capitax.co.il/Attachments/28052025-1.pdf
- https://www.gov.il/he/pages/sa190125-1 and https://www.gov.il/he/pages/sa210725-1. Other gov.il paths returned 403 to the runner; record a 403 as not rendered.

**P3 — TJ's newer TikToks, seen as blog embeds, for stats and transcripts.**
- https://www.tiktok.com/@tjrobertson52/video/7657333505461996814 (2026-06-30)
- https://www.tiktok.com/@tjrobertson52/video/7665088847612595470 (2026-07-21)
- https://www.tiktok.com/@tjrobertson52/video/7569058327246687502 (2025-11-05, "Turn ONE video into 8 pieces of content")
- https://www.tiktok.com/@tjrobertson52/video/7610245040685829390 (2026-02-24)
- https://www.tiktok.com/@tjrobertson52/video/7667726450258201869 (2026-07-28) and
  https://www.tiktok.com/@tjrobertson52/video/7650601606215372046 (2026-06-12). Both ids come from the
  `offflinerpsy/base2026` index (§2.5), not from a capture; the URLs are constructed from his handle.

**P4 — TJ's YouTube, seen in `tt-src-youtube-com-tjrobertsondigital-videos.html`.**

The player comes back `LOGIN_REQUIRED`, but the description is readable in `ytInitialData`.
- https://www.youtube.com/watch?v=tLK2bZ9a3Tw ("How I Get 90% Of My Clients From YouTube & TikTok (With Less Than 1K Views)": the direct test of §7 row 1)
- https://www.youtube.com/watch?v=4bwPrc3NGj4 ("Why Can't I Just Use ChatGPT To Write My Blog Posts?": the likely home of the fact-density summary)
- https://www.youtube.com/watch?v=4NkvcgWc6vY ("How to Pick Blog Topics: Why Search Volume Data Is MISLEADING")
- https://www.youtube.com/watch?v=dtyitMh9SW8 ("How To Create Short-Form Videos That Actually Bring Clients [6-Step Agency Formula]")
- https://www.youtube.com/watch?v=xosfi4a0Gas ("The ONLY Marketing Strategy You Need For 2026")
- https://www.youtube.com/watch?v=q7YdCXoeiR0 ("How to Use AI to Write Perfect Pages for Your Website [FULL PROCESS]")

**P5 — tjrobertson.com pages linked from the captured posts.**
- https://tjrobertson.com/primary-bias-ai-search/
- https://tjrobertson.com/the-1-way-to-make-chatgpt-recommend-you/
- https://tjrobertson.com/market-a-product-no-one-is-searching-for/
- https://tjrobertson.com/how-to-spot-an-ai-seo-scam/
- https://tjrobertson.com/contact/
- https://tjrobertson.com/about-us/

**P6 — TikTok policy pages linked from the Community Guidelines capture.**

The capture shows them with a `{lang}` placeholder; use `en`.
- https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/promoting-a-brand-product-or-service (the commercial disclosure setting)
- https://www.tiktok.com/transparency/en/supporting-responsible-transparent-ai-generated-content
- https://www.tiktok.com/creator-academy/article/creator-code-of-conduct/?lang=en
- https://www.tiktok.com/legal/page/us/terms-of-service/en
- https://www.tiktok.com/legal/page/global/bc-policy/en
- https://www.tiktok.com/safety/en/policies-and-engagement/cg-archive

`support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content` needs a JavaScript-capable render. A
plain GET returns an empty shell.

**P7 — sales and marketing video pages seen in oEmbed `cite` or `author_url`.**
- https://www.tiktok.com/@russellbrunson/video/7276124634834275630 (the "3 things", unnamed in the caption)
- https://www.tiktok.com/@geoffketterer/video/7431531457396477216
- https://www.tiktok.com/@salestipstok/video/7337845679101922602
- https://www.tiktok.com/@the.leap/video/7410811022140787973
- https://www.tiktok.com/@neilpatel/video/7537667346354244919 and https://www.tiktok.com/@neilpatel/video/7564756481506086157
- https://www.tiktok.com/business/en-US/blog/small-business-marketing-tiktok-ultimate-guide?ab_version=experiment_1 (linked from the lead-generation blog capture)
- Low priority: https://www.tiktok.com/@copyfolioapp/video/7216736475889667354, https://www.tiktok.com/@alexjames.b2bmessaging/video/7270134688277187841, https://www.tiktok.com/@ahormozi, https://www.tiktok.com/@conversion.doc, https://www.productmarketingalliance.com

**P8 — Hebrew profiles (low).**
- https://www.tiktok.com/@tiktok.estimtes
- https://www.tiktok.com/@michael_danilovv

**Do not re-render with a plain GET:**
- the five discover and tag pages (the lists load client-side; P1b instead);
- `@tjrobertson52` (the `reduce_user_item_list` flag emptied `itemList`; P1b instead);
- the oEmbed of 7550459646654418189 (400; the video is gone);
- the Times of Israel blog (403).

The Bezeq report, Calcalist, JPost, `business-api.tiktok.com` and gov.il `pa280825-1` URLs came from searches or
repo files, not from captures, so they are not listed here.

---

## Critic items not applied

The reviser applied all 22 items of the 28.9.2026 critique after checking each against the captures. None was
rejected outright. These parts were applied differently from the wording of the critique, for the reason given:

- **Item 5, "every title is a question or how-to".** 19 of the 20 Shorts titles are; the 20th, "What GPT-6 Astra
  Means for Your Business (This Is the AGI Era)", is a statement. Also, not every model-release title leads: "Is
  Claude Opus 5.5 Worth Using Over Fable 5.1? (40% Cheaper)" drew 731. The note says both. That the shelf is the
  20 newest Shorts is not stated on the page; the note says only that one title names September 2026.
- **Item 7, "give owner/repo/path and a commit".** Paths are given for every claim that could be re-found. No
  commit hash is given: the GitHub API refused these repositories in this session, so each path carries the read
  date (28.9.2026, default branch HEAD) and, where the file has one, its own "Last updated" or "Last modified"
  line. Three claims could not be re-found and were downgraded instead: the link-preview card being skipped
  (row 9, now none), the GEO paper's percentage figures (row 11, now snippet), and the vendor data on listicles
  (row 13 and §5.4, now snippet).
- **Item 19, `grep -F` on the `\u0026` form.** Applied, with one correction to the critique's premise: GNU grep
  3.11's `-F` does not match the backslash pattern in this container, so §2.3 gives a command that does.
- **Item 12, the device test.** Applied as the critique's second option: the colony has no phones, so the
  `api.whatsapp.com` fallback stays off and `navigator.share` only is the default until a test is recorded.
- **Item 22, the 3-minute Shorts cap.** No capture states it. The note grades it as background knowledge; the
  fix rests on the capture fact that the 85–251 s durations are the TikTok sample's.
- **Found on the way, beyond the critique:** `products/il-biz-tools/README.md` item 3 ("their own Google
  account") follows `research/colony-sweep/BOARD.md` §6.3, so the note's call to "correct" it was reframed as a
  proposed board amendment (§5.4, N14 f). Two more quotes did not match their sources and were fixed: "low
  hundreds of shekels per month" (`distribution--short-video.md` line 214) and the `docs/REJECTED.md` line 40
  wording ("is currently unable to onboard personal accounts or individual developers"), which the note had
  quoted as "closed to individuals". The podcast blurb in §3 and §8.4 is now quoted as captured ("why TikTok
  beats every other platform for business leads").
