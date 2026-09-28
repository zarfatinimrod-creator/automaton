# Hebrew and Israeli sales and marketing on TikTok: what the captures show (reader: hebrew-israel family, 28.9.2026)

**What this is.** Stage 2 of the TikTok sweep, the Hebrew half. It reads the pages a GitHub Actions
runner saved on 2026-09-28 between about 21:01 and 21:03 UTC. It then checks what the stage-1 scouts
said in `research/tiktok/08-sweep/sweep-2026-09-28.json`: scout 4 ("hebrew-israel"), scout 7 (the gap
task "hebrew-sales-and-accountant-channel-2026") and the critic. No WebSearch was used, nothing was
fetched from the network, and no git command was run. The one file this reader writes is this one.

**People.** Creators are named only by public handle and by the public professional name shown in
their oEmbed `author_name` (the same as `author.nickname`). No personal or family details are
recorded. Phone numbers that appear in bios are **not** reproduced. Tax Authority officials named in
the Capitax article are referred to by role only.

**Grades.**
- **rendered**: read in a capture. The file and JSON key are cited, and every quote was checked with
  `grep -F`. Capitax is the exception: it is served in windows-1255, so its quotes were checked against
  a cp1255-decoded, tag-stripped copy with `&nbsp;` normalised to a space. The runner's `.txt` for it
  is mojibake (U+FFFD throughout) and was not used.
- **github**: read on GitHub (not used here).
- **snippet**: seen only in a search-result snippet, usually a stage-1 scout's.
- **repo**: read in this repository.
- **none**: my own inference, general knowledge, or arithmetic on graded numbers.

**Two caveats that apply to everything below.** Plays measure attention, not sales. A caption is what a
creator said, not proof that it works. Counts are lifetime totals at capture time. Follower counts are
as of 28.9.2026, not as of the upload date.

---

## 1. Captures read, with status

All files are in `research/rendered/`. I read each `.meta.json` first.

| Capture | Meta status | Usable? | What it holds |
|---|---|---|---|
| `tt-video-edelmanir-7426249678359940373.html` (394,284 B) | 200 | **Yes** | `__UNIVERSAL_DATA_FOR_REHYDRATION__` → `webapp.video-detail` (`statusCode` 0) → `itemInfo.itemStruct`: `desc`, `createTime`, `statsV2`, `authorStats`, `author.signature`, `stickersOnItem`, `video.duration`, `video.claInfo`, `IsAigc`, `isAd`, `locationCreated`. |
| `tt-video-edelmanir-7458594829392514322.html` (391,824 B) | 200 | **Yes** | Same keys. |
| `tt-video-edelmanir-7462637740559994120.html` (396,974 B) | 200 | **Yes** | Same keys. |
| `tt-video-edelmanir-7623400135019564309.html` (403,500 B) | 200 | **Yes** | Same keys. The `desc` is empty. |
| `tt-video-michael-danilovv-7152498603452321025.html` (396,849 B) | 200 | **Yes** | Same keys. |
| `tt-video-michael-danilovv-7311263185841982721.html` (391,356 B) | 200 | **Yes** | Same keys. |
| `tt-video-nissimhamawi-7447094375772884232.html` (408,167 B) | 200 | **Yes** | Same keys. |
| `tt-video-tiktok-estimtes-7461529726461447432.html` (394,064 B) | 200 | **Yes** | Same keys. `"isAd":true`. |
| `tt-video-zoharmamancpa-7158445994391129346.html` (390,216 B) | 200 | **Yes** | Same keys. |
| `tt-oembed-*` for the same 9 videos (1,356 to 6,544 B) | 200 | Yes, as a cross-check | For all 9, `title` equals `itemStruct.desc` and `author_name` equals `author.nickname` (checked by script). They contain no counts. |
| `tt-profile-edelmanir.html` (372,511 B) | 200 | **Yes, partly** | `webapp.user-detail` (`statusCode` 0) → `userInfo.user` (`signature`, `bioLink`, `createTime`, `verified`, `commerceUserInfo`), `userInfo.statsV2`. **`itemList` is an empty array**, so the profile lists no videos. |
| `tt-video-*.txt`, `tt-profile-edelmanir.txt` (23 B each) | 200 | No | Only "TikTok - Make Your Day". The text extraction drops the scripts. |
| `tt-src-tiktok-com-discover.html` (366,030 B), the Hebrew discover page | 200 | **No, for content** | The scope holds only `webapp.kap-detail.wordDetail` (`"formattedWord":"שיווק עסקים ויחסי ציבור"`; `uniqueWord` is the same words joined by non-breaking spaces; `"nlpLanguage":"he"`, `"keywordEcomIntent":0`, keyword `createTime` 1764010194 = 2025-11-24) and `kap.init.config` (`"count":6`, `"preFetch":true`). It has no item list, no `/video/` link and no `@handle` other than CSS at-rules. The list loads client-side. The requested URL was truncated (it ends before "ציבור"), but `seo.abtest.canonical` resolves it to the full keyword. |
| `tt-src-capitax-co-il-content-2-3311.html` (56,657 B) | 200 | **Yes** | A tax law firm's newsletter article, "רפורמת בעל עסק זעיר – ניתוח נתונים תובנות ומסקנות ראשוניות", served as `charset=windows-1255`. It quotes and links the Israel Tax Authority. |
| `tt-src-capitax-co-il-content-2-3311.txt` (23,412 B) | 200 | **No** | Mojibake: the cp1255 bytes were decoded as UTF-8 and replaced with U+FFFD. |
| `tt-src-blogs-timesofisrael-com-why-whatsapp-first-is-now-table-stakes.meta.json` | **403** | No | `"byteLength":0`, "HTTP 403 Forbidden". Not rendered. |
| `tt-src-gov-il-he-service-report-and-payment-for-micro-business-owner.meta.json` | **403** | No | Not rendered. |
| `tt-src-kolzchut-org-il-he.meta.json` (the עסק_זעיר concept page) | **403** | No | Not rendered. |
| `tt-src-greeninvoice-co-il-magazine.meta.json` | **403** | No | Not rendered. |
| `tt-src-cpa-ea-co-il-mahshevon-patur.meta.json` | **403** | No | Not rendered. |
| `tt-src-zcpa-co-il-article-osek-zair-2026.meta.json` | **403** | No | Not rendered. |

**Adjacent, not in this family and not read:** `kolzchut-employee-plus-self-employed.meta.json`, also
403 (fetched 2026-09-27).

**Not available in any capture:**
- **Transcripts.** `video.claInfo.captionInfos` and `video.subtitleInfos` are empty for all nine Hebrew
  videos. `noCaptionReason` is 4 for six of them, 3 for michael_danilovv 7152498603452321025 and
  nissimhamawi, and 1 for zoharmamancpa. The English videos read by the sales-creators reader did carry
  caption links. So nothing here tells us what any of these creators says aloud.
- **Thumbnails.** The oEmbed `thumbnail_url` hosts (`tiktokcdn-us.com`) are outside what this container
  may fetch, so whether any creator appears on camera is not settled here.

---

## 2. The facts, graded

The date is decoded from the video id (`id >> 32`, in Unix seconds, UTC). In every case it agrees with
`itemStruct.createTime` to within 14 seconds. In the tables, "saves" is `collectCount`, and all counts are
`itemStruct.statsV2`.

### 2.1 The nine videos, ranked by plays (rendered)

| # | Handle / video id | Decoded date | Plays | Likes | Comments | Shares | Saves | Duration | Creator's followers |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | @edelmanir 7458594829392514322 | 2025-01-11 | 86,800 | 1,561 | 101 | 175 | 129 | 167 s | 68,300 |
| 2 | @edelmanir 7623400135019564309 | 2026-03-31 | 81,100 | 386 | 114 | 44 | 19 | 17 s | 68,300 |
| 3 | @nissimhamawi 7447094375772884232 | 2024-12-11 | 28,400 | 272 | 25 | **210** | 143 | 42 s | **1,529** |
| 4 | @edelmanir 7462637740559994120 | 2025-01-22 | 18,900 | 589 | 37 | 70 | 70 | 137 s | 68,300 |
| 5 | @edelmanir 7426249678359940373 | 2024-10-16 | 18,300 | 467 | 10 | 30 | 41 | 61 s | 68,300 |
| 6 | @tiktok.estimtes 7461529726461447432 | 2025-01-19 | 7,543 | **7** | **0** | **0** | 1 | 38 s | **21** |
| 7 | @michael_danilovv 7311263185841982721 | 2023-12-11 | 7,519 | 243 | 21 | 25 | 125 | 103 s | 85,600 |
| 8 | @zoharmamancpa 7158445994391129346 | 2022-10-25 | 5,786 | 138 | 5 | 19 | 17 | 219 s | 33,200 |
| 9 | @michael_danilovv 7152498603452321025 | 2022-10-09 | 4,131 | 116 | 7 | 7 | 14 | 44 s | 85,600 |

Other rendered fields common to all nine: `locationCreated` is "IL"; `IsAigc` is false; `textLanguage`
is "he", except "un" for the caption-less 7623400135019564309. **`isAd` is true only for
@tiktok.estimtes.**

**Ratios (grade none: arithmetic on rendered counts; n = 9).**
- **@nissimhamawi's explainer reached 18.6× his follower count.** Its share rate, 0.74% (210 / 28,400),
  is the highest of the nine. The next highest is 0.37% (@edelmanir 7462637740559994120). Its save rate
  is 0.5%.
- **@michael_danilovv's tips video has the highest save rate, 1.66%** (125 / 7,519).
- **@tiktok.estimtes has a like rate of 0.09%** (7 / 7,543). Every other video is between 0.48% and
  3.23%. Its plays are 359× its follower count, which fits paid delivery (`isAd` true). That paid
  delivery is the cause is an inference.
- **@edelmanir's two most-played videos are the buyer-side and topical ones** (86.8K and 81.1K). His
  two seller-technique tips drew 18.3K and 18.9K plays but higher like rates (2.55% and 3.12%, against
  1.8% and 0.48%).

### 2.2 Per video: caption verbatim, on-screen text, niche, and the lesson it states

Captions are `itemStruct.desc`, identical to the oEmbed `title`; trailing spaces are trimmed. On-screen
text is `stickersOnItem[].stickerText`. Types 4 and 9 both appear; in these captures type 9 carries the
one-line topic, but that meaning is my reading (none). Translations are mine (none).

**V1. @edelmanir 7458594829392514322** (2025-01-11; 86,800 plays, 1,561 likes). Niche: Hebrew
negotiation and sales.
- Caption: "צריכים לקבל פידבק שלילי, על הניסיון בשיטת מצליח. #עסקים #מכירות #משאומתן". Roughly: you
  need to take the negative answer on a try-your-luck attempt.
- On-screen (type 9): "איך להתמקח עם חברות תקשורת". That is, how to haggle with telecom companies.
- `diversificationLabels`: "Random Shoot", "Others".
- **Lesson stated:** negotiate as the buyer against a telecom company, and be ready to hear "no". It is
  consumer-side negotiation, and it is his most-played video here.

**V2. @edelmanir 7623400135019564309** (2026-03-31; 81,100 plays, 386 likes, 114 comments). Niche: as above.
- Caption: empty (`"desc":""`; oEmbed `"title":""`).
- On-screen (types 4 and 9): "כדאי למלונות באילת להוריד מחיר?" That is, should Eilat hotels lower their
  prices?
- **Lesson stated:** none in text. It is a 17-second topical pricing question. It has the family's
  highest comment count and a low like rate (0.48%), which reads as debate rather than approval (none).

**V3. @nissimhamawi 7447094375772884232** (2024-12-11; 28,400 plays, 272 likes, 210 shares). Niche: an
Israeli accountant (`author_name` "ניסים חמאוי רו"ח") explaining VAT and income-tax statuses.
- Caption, verbatim:
  > עוסק פטור או עוסק זעיר – מה ההבדל ואיזה מסלול מתאים לך? כידוע, עוסק פטור הוא סטטוס מוכר בעולם העצמאים. היתרון המרכזי הוא פטור ממע"מ, אך מעבר לכך, חובות הדיווח נשארות: הגשת דוח שנתי למס הכנסה, הצהרות הון במקרה הצורך, וניהול העסק בהתאם לחוק. במילים פשוטות, עוסק פטור הוא בעל עסק לכל דבר ועניין, רק בלי החובה לגבות מע"מ ולדווח עליו. לאחרונה נולד מודל חדש – עוסק זעיר. מודל זה מציע חלופה פשוטה יותר לעוסקים מסוימים. הנה עיקרי ההבדלים: דוחות שנתיים? לא חובה. עוסק זעיר אינו מחויב בהגשת דוחות שנתיים למס הכנסה. שיעור הוצאות מוכרות: מוגבל ל-30%. במקום להגיש קבלות והוצאות, העוסק הזעיר יכול לבחור שהוצאותיו יחושבו אוטומטית לפי 30% מהמחזור. דוגמה: אם המחזור השנתי שלך הוא 100,000 ש"ח, מודל העוסק הזעיר מניח שרווחת 70,000 ש"ח (70% מהמחזור). למי מתאים המודל הזה? המודל של העוסק הזעיר מתאים בעיקר למי שיש לו הכנסה צדדית או תחביב שהפך להכנסה מזדמנת. זה יכול להיות מורה פרטי, יוצר תכנים, או בעל עסק קטן מאוד שאין לו הרבה הוצאות או התנהלות מורכבת. למי זה לא מתאים? למי שמנהל עסק עם הוצאות משמעותיות, כמו קניית סחורה, ציוד או השקעות גבוהות. במקרים כאלה, המסלול הרגיל (עוסק פטור או מורשה) מאפשר לנצל את מלוא ההוצאות המוכרות ולהפחית את חבות המס. אז איך לבחור? זה תלוי בהיקף הפעילות ובאופי ההוצאות שלך. אם העסק שלך פשוט ורוצה לחסוך בניירת ובדיווחים – המסלול הזעיר עשוי להיות פתרון מעולה. אם יש לך פעילות עסקית נרחבת והוצאות רבות – כדאי להישאר במסלול הרגיל. בכל מקרה, מומלץ להתייעץ עם רואה חשבון כדי להבין איזה מסלול יועיל לך ביותר. תוכל להתייעץ איתי לגבי המסלולים.
- On-screen text: none. There are no hashtags. The 42-second video carries a full article as its
  caption. `claInfo.hasOriginalAudio` is false, and the music line reads "סאונד מקורי - ניסים חמאוי רו"ח".
- The bio (`author.signature`) is a contact-page URL on his firm's domain and a phone number (not
  reproduced here). The account has 402 videos.
- **Lesson stated:** "פטור או זעיר?" is a choice that depends on your real expense ratio. The close
  is a consultation with him.
- **Timing (rendered from two captures; the causal link is none).** The video went up on 11.12.2024.
  Capitax records that the Tax Authority opened registration for the track at the end of November 2024,
  and published clarifications for tax representatives on 11.12.2024, the same day.
- The caption's accuracy is checked against Capitax in §2.4.

**V4. @edelmanir 7462637740559994120** (2025-01-22; 18,900 plays, 589 likes).
- Caption: "לא צריך לדעת לדבר, רק לאבחן שיטתי כמו מקצוען. #מכירות #עסקים #משאומתן למכור בלי לשכנע"
- On-screen (types 4 and 9): "איך מכר ב35% יותר תוך חודשיים, בשינוי אחד". That is, how someone sold
  35% more within two months, with one change. **The 35% is his claim, unverified.**
- **Lesson stated:** you don't need to be a talker; diagnose systematically; sell without persuading.

**V5. @edelmanir 7426249678359940373** (2024-10-16; 18,300 plays, 467 likes).
- Caption: "#פיתוחעסקי#מכירות#עסקים טיפים למכירות: כשיש התנגדות למחיר, עדיף לפתוח את השיחה, במקום לסגור אותה עם תשובות שהלקוח כבר שמע בדיחה או חושב שישמע ממך. תנו להם להציע פתרונות, ותדעו אם הם רציניים."
- On-screen (type 4): "למה לא כדאי להציע הנחה ללקוח שהמחיר גבוה לו" and "ככה גם תדעו אם הם רוצים באמת, וגם תקבלו רעיונות לשירות חדש".
- `diversificationLabels`: "Business & Finance", "Education".
- **Lesson stated:** don't answer a price objection with a discount. Open the conversation instead, and
  let the customer propose solutions. You learn whether they are serious, and you collect ideas for a
  new service.

**V6. @tiktok.estimtes 7461529726461447432** (2025-01-19; 7,543 plays, 7 likes, 0 comments, 0 shares).
Niche: **a Hebrew quote-making software product.** `author_name` is "הצעת מחיר דיגיטלית", and the bio
reads "בעל עסק? כל הצעות המחיר של העסק שלכם במקום אחד" and "צרו הצעת מחיר שנראת 💣 בקלות".
- Caption: "ואיך אתם שולחים הצעות מחיר ללקוחות שלכם? #בעליעסקים #הצעתמחיר #עסקים"
- **`"isAd":true`**, `ShowAIGC` false, `diversificationLabels` "Software & APPs", "Technology".
- The account has 21 followers, 13 videos and 49 likes in total (`authorStats`).
- **Lesson stated:** none beyond the question. **Lesson shown:** this is the only faceless Hebrew
  business-tool account in the family. Its reach was bought, and the bought reach produced almost no
  engagement.

**V7. @michael_danilovv 7311263185841982721** (2023-12-11; 7,519 plays, 243 likes, 125 saves). Niche:
teaches Hebrew TikTok marketing to businesses and sells social-media services. `author_name` is
"שיווק בטיקטוק | מיכאל דנילוב". The bio reads "המנטור שלך בטיקטוק", "בנית מותג וסושיאל", "יצירת תוכן,
ניהול סושיאל וקידום עסקים" and "בנק הוקים אינטרקטיבי 👇 הרשמי".
- Caption: "איך לעשות טיקטוק - גם לעסקים וגם ליוצרי תוכן פשוטים אם אתם מנסים לבנות מותג בטיקטוק אז הרבה סוכנויות שיווק לא רוצות שתגדלו את האסטרטגיות שהם משתמשים בהן אז קבלו כמה טיפים לעסק שלכם בטיקטוק. #טיקטוקלעסקים #עסקיםבטיקטוק #שיווקבטיקטוק #שיווקלעסקים #אסטרטגיהעסקית"
- On-screen (type 9): "איך לעשות טיקטוק / לעסקים בטיקטוק / אסטרטגיה" (line breaks shown as " / ").
- **Lesson stated:** a list of TikTok tips, framed as what agencies hide. The framing is engagement bait.
  The tips themselves are only in the audio, which we don't have.

**V8. @zoharmamancpa 7158445994391129346** (2022-10-25; 5,786 plays, 138 likes). Niche: an Israeli
accountant answering employment and עוסק פטור questions. `author_name` is "זוהר ממן ☆ רואה חשבון".
The bio names his partnership at BDO Israel and adds the line "ידע פיננסי זה לא מותרות. זה הגנה עצמית."
- Caption: "האם עוסק פטור יכול להעסיק עובדים❓️  #העסקתעובדים #עוסקפטור #טופס106 #טופס101 #עוסק_פטור_תקרה #אישור_עוסק_פטור #תקרת_עוסק_פטור #עוסק_פטור #פוריו #פוריוישראל #THE_VIKING_ACCOUNTANT"
- On-screen (type 9): the same question.
- It runs 219 s, the longest of the nine.
- **Lesson stated:** a one-question hook, answered at length. The answer is only in the audio.

**V9. @michael_danilovv 7152498603452321025** (2022-10-09; 4,131 plays, 116 likes).
- Caption: "עדיין לא קלטתם בדיוק,  איך לעשות שיווק לעסק בטיקטוק?  במקום לגלול סרטונים, שאין להם שום קשר לעסק שלכם, אתם יכולים פשוט להפסיק לעקוב, אחרי דפים לא רלוונטיים. שלא תורמים לכם, לאיך לפרסם את העסק שלך וגם לא מלמדים אתכם, איך לעשות טיקטוק וסרטונים.  תתחילו להגיב לסרטונים, שכן מלמדים אתכם, איך לעשות שיווק לעסק בטיקטוק ואיך לפרסם את העסק שלך." It is followed by 12 hashtags, from #שיווקבטיקטוק to #קידוםעסקיםבטיקטוק.
- Format: **text on screen over licensed music.** The music is "Aesthetic" by Tollan Kim (`music.original`
  false), `claInfo.hasOriginalAudio` is false, and there are 16 on-screen text cards. Among them:
  "קבלו שיטה\nמחתרתית מטורפת", "שתכניס אתכם\nלעשירון העליון 🕺" and "שימו לייק ותגובה".
- **Lesson stated:** train your own feed. Unfollow irrelevant accounts and engage with marketing
  content. It is aimed at the creator's own growth, not a buyer's problem.

### 2.3 What @edelmanir teaches: settled

**Rendered facts.**
- He is **a Hebrew negotiation and sales educator who sells lectures, workshops, consulting and
  courses.** His bio (`user.signature` in `tt-profile-edelmanir.html`) reads "אל תמכור קרח לאסקימואים",
  then "הפרופיל המקורי היחיד", then "להרצאות, סדנאות, ייעוץ וקורסים במשא ומתן".
- His `bioLink.link` is "Edelman.co.il". `commerceUserInfo.commerceUser` and `ttSeller` are both false,
  so there is no TikTok shop.
- The account was created on 2021-09-18 (`user.createTime` 1631951383). It has 68,259 followers,
  926,528 likes and 1,737 videos (`statsV2`). It is not verified.
- He is active through 2026: 7623400135019564309 decodes to 2026-03-31.

**What he teaches, from four captions and their on-screen text (rendered):**
1. **No discount on a price objection.** Open the conversation and let the customer propose a solution.
   That shows whether they are serious and yields ideas for a new service (V5).
2. **Diagnose, don't persuade** ("למכור בלי לשכנע"). He attaches a claimed 35% sales lift to this, which
   is unverified (V4).
3. **Buyer-side negotiation:** haggling with telecom companies, and accepting the "no" (V1).
4. **Topical price questions about a market** (Eilat hotels, V2).

His tagline, "don't sell ice to Eskimos", is an anti-hard-sell stance. "הפרופיל המקורי היחיד" implies
that copycat or impersonating accounts exist (none).

**What does not transfer.** About 0.95 videos a day since the account opened (none: 1,737 / 1,836 days).
Every video has `hasOriginalAudio` true, so he is talking in them. Whether he is on camera is not settled
(no thumbnail was fetched). His business is live teaching and consulting. A faceless brand whose owner
never talks to customers can borrow his ideas, not his format or his funnel.

### 2.4 The income-tax "בעל עסק זעיר" track (Capitax, rendered secondary) and the older VAT-law sense

**Source and grade.** `tt-src-capitax-co-il-content-2-3311.html` is **rendered**, but it is
**secondary**: a tax law firm's newsletter. It quotes the Tax Authority's announcement verbatim and links
the statute and the regulations as PDFs. The primary pages (gov.il, Kol Zchut) were 403, so **no claim
here reaches primary grade.** The article's latest event is 21.7.2025, so it says nothing about 2026
figures.

| Point | What Capitax says (quoted) | Grade |
|---|---|---|
| **Official name** | "פרק שמיני – בעל עסק זעיר", a new chapter in Part D of the Income Tax Ordinance. The Tax Authority's own words are "עסק זעיר" and "'בעל עסק זעיר'". "עוסק זעיר" appears nowhere in the article. | rendered (secondary) |
| **Legal source** | "תיקון עקיף לפקודת מס הכנסה (תיקון מס' 265)", enacted in the 2023 Economic Efficiency (Arrangements) Law, which Capitax reported on 31.5.2023. **This conflicts with the repo**, which says "סעיפים 87ב עד 87ז… נוספו בתיקון 277" (`research/colony-sweep/scouts/risk-governance--selling-as-individual.md` line 154, snippet). Unresolved. The linked `Attachments/265-2023.pdf` would settle it (§5). | rendered (secondary) vs snippet |
| **Turnover cap** | "התקרה שנקבעה בחוק (120 אלף ₪ נכון לשנות-המס 2025-2024)". The filing-exemption regulations require "שמחזוֹרו השנתי אינו עולה על תקרת המחזוֹר של עוסק פטוּר (120,000 ₪ נכון לשנות-המס 2024 ו-2025)". The Tax Authority quote says the same: "עסקים שמחזור העסקאות שלהם אינו עולה על התקרה הקבועה בחוק עבור עוסק פטור במע"מ". | rendered (secondary) |
| **2026 cap** | Not stated. If the cap stays tied to the VAT exemption ceiling, it equals whatever that ceiling is in 2026. The repo's osek-patur page uses ₪122,833 (`products/il-biz-tools/osek-patur.html` line 6, repo), and scout 7's snippet gave the same figure. **₪122,833 as the זעיר cap is an inference (none), not a capture.** | none / repo / snippet |
| **Deemed-expense rate** | "רשאים הָחל משנת-המס 2024 לנַכּוֹת מהכנסותיהם הוצאה בשיעור של 30% מהמחזוֹר, חֶלף ניכוי הוצאות בפועל". So 30% of turnover, instead of actual expenses. | rendered (secondary) |
| **Effective date** | From **tax year 2024**. The Finance Committee approved the filing-exemption regulations on 4.11.2024, and they were published on 26.11.2024 as "תקנות מס הכנסה (פטור מהגשת דין וחשבון) (תיקון), התשפ"ה-2024". Registration opened at the end of November 2024. The reporting system for 2024 opened on 19.1.2025. Businesses that did not register "יהיו זכאים לדיווח מקוצר החל משנת המס 2025". | rendered (secondary) |
| **"No annual report"?** | **Half true.** The regulations exempt a בעל עסק זעיר from filing an annual return, subject to conditions. But there is a **shortened annual report**: "המערכת לדיווח שנתי מקוצר ותשלום לעסק זעיר… ללא צורך בהגשת דו"ח שנתי מלא". There is also an **in-year duty**: "נדרשים עסקים אלה לשתי פעולות בשנה בלבד: במהלך שנת המס הם נדרשים לבצע חישוב מס במערכת תיאומי המס… ובתחילת השנה העוקבת הם נדרשים לדווח על מחזור הכנסתם ולשלם את המס המגיע". | rendered (secondary) |
| **Deadlines for tax year 2024** | Set at 31.3.2025, then extended three times: to 31.5.2025, 30.6.2025 and 31.7.2025. Recipients of war compensation, reserve-duty pay or maternity pay had until 31.8.2025. | rendered (secondary) |
| **Uptake** | "עד סוף דצמבר 2024 נרשמו כ-40 אלף עסקים, אשר על פי הערכות רשות המסים מהווים למעלה מ-10% מהעסקים הזכאים". Arithmetic: the eligible population is therefore under about 400,000 (none). A Tax Authority data document followed on 21.7.2025; it is linked but not captured. | rendered (secondary) / none |
| **Relation to עוסק פטור** | **It sits beside עוסק פטור; it does not replace it.** It is an **income-tax** registration ("להירשם במס הכנסה כ'בעל עסק זעיר'"), a change of "סוג התיק שלהם במס הכנסה", and its eligibility borrows the **VAT** עוסק פטור ceiling. The article does not say in so many words that one business can be both עוסק פטור (VAT) and בעל עסק זעיר (income tax). That reading is an inference (none), though the structure implies it. | rendered (secondary) / none |
| **The regulator does its own content** | The Tax Authority's podcast "פודמס" has an episode, "פרק 32 – בעל עסק זעיר". Its online system computes the tax itself: "חישוב המס נעשה במערכת בהתאם לשיעור המס שנקבע בתיאום המס". | rendered (secondary) |

**Keep this apart from the older VAT-law sense (repo).** The repo quotes תקנות מע"מ (רישום) 15א(ג):
"הסכום הקובע – סכום מחזור העסקאות של עוסק זעיר לענין סעיף 31(3) לחוק"
(`research/colony-sweep/scouts/risk-governance--selling-as-individual.md` line 132, statute-mirror). That
is a **VAT** definition, used to set the de-minimis for registering occasional transactions. It has
nothing to do with the income-tax chapter above. The everyday phrase "עוסק זעיר", used by
@nissimhamawi and by accountant marketing, points at the income-tax track. Any page must use the official
"עסק זעיר / בעל עסק זעיר" for the income-tax track. It must never cite §31(3) for it, and never merge
either of them with the VAT status עוסק פטור.

**@nissimhamawi's caption, checked against Capitax.**
- **Right:** the 30% deemed expense instead of receipts. The 100,000 → 70,000 example is consistent
  arithmetic. So is the advice that the track loses when real expenses are high.
- **Half right:** "אינו מחויב בהגשת דוחות שנתיים". There is no full return, but there is a shortened
  annual report plus in-year tax coordination.
- **Misleading:** "המסלול הרגיל (עוסק פטור או מורשה)" treats עוסק פטור as the income-tax alternative
  to זעיר, when עוסק פטור is a VAT status.
- **Missing:** the turnover cap, and the in-year tax-coordination step.

The repo's §4 also lists eligibility conditions: personal exertion only, no employees, and a 25%
concentration limit. Those are snippet or fetched grade in the repo and are not in Capitax.

**Verdict on grade.** Name, 30%, the 2024–2025 cap of ₪120,000 tied to the VAT ceiling, the tax-year-2024
start, the shortened report and the relation to עוסק פטור are all **rendered, secondary**. The amendment
number (265 vs 277) and the 2026 cap are **not settled**. Nothing is primary. Before any product page
states these figures, one primary document must be rendered: the capitax-hosted statute and regulation
PDFs, or a gov.il page (§5).

### 2.5 Repo facts (repo, read-only)

- `products/`, `skills/`, `docs/` and `src/` contain no "זעיר" at all (grep).
- The research tree already covers the income-tax track in
  `research/colony-sweep/scouts/risk-governance--selling-as-individual.md` §4 (lines 151–175), at snippet
  and fetched grade. Neither scout 4 nor scout 7 nor the critic cited it.
- `research/measurements/serp/2026-09-07-hebrew-calculators.md` line 175 flagged a 2026 "עסק זעיר"
  claim as "[SNIPPET] about a summary — not verified, not to be used". It also found that Google showed
  articles, not tools, six times out of six for the osek-patur query (same file, line 171).
- `products/il-biz-tools/` has no `wa.me`, no `navigator.share` and no "whatsapp" in its html, js, ts or
  mjs sources, excluding `node_modules` and `_site` (grep). There is still no share-to-accountant button.
- MISSION.md line 211 says "The owner does nothing: no selling, no talking, no camera, no manual ops."
  Line 420 says "The owner does not talk to customers."
- `docs/REJECTED.md` rejects TikTok as a revenue line (line 24). It also records that WhatsApp has no
  Channels publishing API and that business-initiated messages need prior opt-in (line 761).

---

## 3. The lessons

"Fits" means it works for a faceless brand with no customer contact, at ₪0, and honestly. "Needs a human"
means someone has to talk to a buyer or appear on camera, and that is **rejected under the mandate**
(MISSION.md lines 211 and 420).

| # | Lesson | Source | Grade | Fits a faceless, no-contact, ₪0, honest brand? |
|---|---|---|---|---|
| H1 | **A regulation moment is the Hebrew business audience's best hook.** The tiny accountant account (1,529 followers) got 18.6× its followers and the family's top share rate with one "פטור או זעיר?" explainer, posted the day the Tax Authority clarified the new track for tax representatives. | V3; §2.4 dates | counts and dates rendered; causation none | **Yes.** Ship a dated page or calculator update on the day a rule moves (the annual ceiling, a deadline extension, a PCN874 spec change), with the source linked. **Counter-lesson from the same video:** speed cost it accuracy ("no annual reports"). We publish only what a primary source says. |
| H2 | **Diagnose, don't persuade.** Sell by helping the buyer see their own case. | V4 caption | rendered caption; his 35% lift is his claim | **Yes.** In self-serve form: a "פטור + עסק זעיר, או דיווח רגיל?" self-check on the user's own turnover and real expense ratio. It must show when the track does **not** pay (real expenses above 30%), and must use the shortened-report wording, not "no report". Blocked until one primary document is rendered (§2.4). |
| H3 | **Never discount on a price objection; let the buyer set the terms, and learn from the objection.** | V5 caption and on-screen text | rendered | **Partly.** The live version needs a conversation and is rejected. What carries over: one fixed price, no discount codes, no fake sale, objections answered ahead of time in a written FAQ, and a free tier that fully solves the basic case. A passive, optional "what's missing?" field could collect service ideas **only if it promises no reply**. That field is my suggestion (none). |
| H4 | **Buyer-side, topical framing outdraws seller technique**, by about 4× in plays for this creator (V1 86.8K and V2 81.1K, against V4 18.9K and V5 18.3K). | V1, V2, V4, V5 counts | counts rendered; the pattern is none (one creator, n = 4) | **Yes.** Frame every page and short as the user's gain or avoided loss. For PCN874: "בדקו את הקובץ לפני ששולחים". For עסק זעיר: "כמה מס על המחזור שלכם". Numbers must be real. It is attention, not sales. |
| H5 | **Authority comes from a credential shown in the name or bio.** "רו"ח" is in @nissimhamawi's display name; @zoharmamancpa's bio names his BDO partnership. | V3, V8 | rendered | **Only by citation, never by persona.** A faceless brand has no credential. It borrows authority from the primary source it links (the regulation, the Tax Authority's spec, dated). It must never pose as an accountant: `skills/revenue-il-biz-tools/SKILL.md` lines 72–73, "never present the site as an accountant" (repo). |
| H6 | **The accountant is both the trusted channel and the buyer of a PCN874 validator.** Accountant creators close on "talk to me" (V3: "תוכל להתייעץ איתי לגבי המסלולים"; the bio holds a firm contact URL and a phone number). | V3, V8 | rendered | **The consultation close is rejected.** What fits: a user-initiated "send the result to your accountant" share, and a reference page an accountant would save. The WhatsApp mechanics (the Bezeq 99% figure; `wa.me/?text=` with no number) remain **snippet and none**: the ToI capture was 403, and no device test has been run. |
| H7 | **Hebrew speech is not being transcribed**, so the searchable words must be on screen and in the caption. All nine Hebrew videos have empty `captionInfos`. Seven of the nine carry the topic line as on-screen text (type 9). | §1, §2.2 | the fields are rendered; the reason is none | **Yes,** for any video arm. Put the question as on-screen text and in a one- or two-sentence caption. Don't rely on voice-over. This fits the format prior work chose for Hebrew: captioned silent video (`research/colony-sweep/scouts/distribution--short-video.md` §3.1). |
| H8 | **Text-on-screen over music is a real Hebrew business-TikTok format**, but its performance here was modest. V9 had 16 text cards, a licensed track and no original audio, and got 4,131 plays in 2022. | V9 | rendered | **Yes as a format; no promise of reach.** Use music we have rights to off-platform. It is one old sample. |
| H9 | **Reference content gets kept and passed on.** The highest save rate is a tips list (V7, 1.66%); the highest share rate is a regulatory explainer (V3, 0.74%). | V3, V7 counts | none (arithmetic on rendered counts, n = 2) | **Yes.** Build pages people keep: a PCN874 error-code cheat sheet, a dated table of the ceilings. The signal is weak. |
| H10 | **A faceless Hebrew business-tool account on TikTok had to pay for reach, and the paid reach barely engaged**: 7,543 plays, 7 likes, 0 comments, 0 shares, 21 followers after 13 videos. | V6 | rendered (`isAd` true) | **A warning, not a tactic.** It supports `docs/REJECTED.md` (TikTok as a revenue line; paid advertising at any budget). Don't plan on TikTok carrying a faceless Hebrew tool. The site and search stay the channel, and TikTok lessons transfer to the site and to Shorts. n = 1. |
| H11 | **One free thing is the profile's single call to action.** @michael_danilovv's bio ends "בנק הוקים אינטרקטיבי 👇 הרשמי", an interactive hook bank. | V7 bio | rendered (bio); where it leads is not captured (no `bioLink` in video JSON) | **Yes.** The brand's one link points at a free calculator, and any paid step lives on that page, after the result. |
| H12 | **Question hooks draw comments only when there is an audience.** V2's topical question drew 114 comments; V6's question drew none. | V2, V6 | rendered | **Only as on-screen framing, with comments off or unanswered.** Answering comments is customer contact. |
| H13 | **Hype, us-against-them and stuffing are the Hebrew register to avoid.** Examples: "שיטה מחתרתית מטורפת" to "לעשירון העליון" (V9 on-screen), "סוכנויות שיווק לא רוצות שתגדלו" (V7), 12 hashtags (V9), 11 hashtags (V8). | V7, V8, V9 | rendered | **Reject** these. Use two or three accurate hashtags and one plain phrase that names what the page does. |
| H14 | **Daily on-camera volume is what a sustained Hebrew sales channel looks like**: 1,737 videos in about five years, original audio in every video checked. | §2.3 | rendered counts; the rate is none | **Needs a human. Rejected.** It is recorded so nobody plans on matching it faceless. |

### Hebrew-market tactics that fit: a faceless brand selling Hebrew calculators and a PCN874 validator to small businesses and their accountants

In priority order. Each needs no face, no customer contact and no spend, and each is honest if its
condition holds.

1. **A "פטור + עסק זעיר?" self-check page** (H2 + H1 + H4).
   - The condition: first render one primary document (§5). Then state the cap as the VAT עוסק פטור
     ceiling, the 30% rate, the shortened annual report, in-year tax coordination and the eligibility
     conditions. Show the losing case.
   - Positioning: the Tax Authority's own system computes the tax after you register. The page's value
     is the decision before registering. That the official system offers no pre-registration comparison
     is an inference from what the article describes, not a finding (none).
   - Risk: the repo's SERP measurement found Google preferring articles for the neighbouring query.
2. **Dated rule-change updates** (H1). Each January ceiling, each reporting deadline or extension, and
   each PCN874 spec change gets a same-day update. Each update carries a visible "עודכן" date and a
   link to the source.
3. **Written for the accountant** (H6 + H9 + H5).
   - Results the owner sends on themselves: a share button the user presses. The mechanics are
     untested.
   - A saveable reference page for accountants on PCN874 record checks.
   - Authority by citation of the Tax Authority's spec, never by persona.
4. **Buyer-side copy** (H4 + H3). Lead with the saving or the avoided rejection. One real price, no
   discounts, objections answered in an FAQ.
5. **For any Shorts or video arm, searchable text on screen and in the caption** (H7 + H8). Use a
   one-question hook as on-screen text, keep comments unanswered, and let the only link go to the free
   tool (H11, H12).

**Rejected, recorded so no later stage adopts them:**
- the consultation close (V3);
- DM funnels (scouts' @top.social_, snippet);
- comment-bait answered by a person;
- paid promotion (V6; REJECTED.md);
- hype, "what agencies hide" framing and hashtag stuffing (H13);
- daily on-camera volume (H14).

---

## 4. Scout claims: confirmed, corrected, refuted

| Stage-1 claim | Who | Verdict | Evidence |
|---|---|---|---|
| @edelmanir's niche is unknown; the snippet showed only "ניר אידלמן, original sound" | Scout 4, critic | **Settled.** Hebrew negotiation and sales educator. He sells lectures, workshops, consulting and negotiation courses; his bio link is "Edelman.co.il". | `user.signature`, `bioLink` in `tt-profile-edelmanir.html` (rendered) |
| @edelmanir is a Hebrew sales and negotiation educator, active 2024–2026, with IDs decoding to 2024-10-16, 2025-01-11, 2025-01-22 and 2026-03-31 | Scout 7 | **Confirmed**, dates included. | `createTime` and `id >> 32` (rendered) |
| The display name "ניר אידלמן" came from the search tool's summary and is unverified | Scout 7 | **Confirmed as the account's public display name.** | oEmbed `author_name`, `user.nickname` (rendered) |
| Caption of 7426249678359940373: "…כשיש התנגדות למחיר, עדיף לפתוח את השיחה… תנו להם להציע פתרונות, ותדעו אם הם רציניים" | Scout 7 | **Confirmed verbatim.** It also has on-screen text: "למה לא כדאי להציע הנחה ללקוח שהמחיר גבוה לו". | `desc`, `stickersOnItem` (rendered) |
| Caption of 7458594829392514322 is "איך להתמקח עם חברות תקשורת: טיפים למכירות" | Scout 7 | **Corrected.** The caption is "צריכים לקבל פידבק שלילי, על הניסיון בשיטת מצליח. #עסקים #מכירות #משאומתן". "איך להתמקח עם חברות תקשורת" is the on-screen title (sticker type 9). "טיפים למכירות" appears nowhere in that capture (`grep -F` gives 0 in both the page and the oEmbed). The topic, haggling with telecom companies, stands. | `desc`, `stickersOnItem` (rendered) |
| Caption of 7462637740559994120: "לא צריך לדעת לדבר, רק לאבחן שיטתי כמו מקצוען… למכור בלי לשכנע" | Scout 7 | **Confirmed verbatim.** The on-screen claim "35% more in two months" was not seen before. | `desc`, `stickersOnItem` (rendered) |
| 7623400135019564309 is the newest video (2026-03-31) and its caption is unread | Scouts 4 and 7 | **Settled.** There is no caption. The on-screen text asks whether Eilat hotels should cut prices. It is 17 s long, with 81.1K plays and 114 comments. | `desc` "", `stickersOnItem` (rendered) |
| "Stand on the buyer's side" tactic, built on the telecom video | Scout 7 | **Confirmed and strengthened.** The telecom video is @edelmanir's most-played here (86.8K, against 18.3K and 18.9K for his seller tips). The pattern is still one creator (none). | `statsV2` (rendered) |
| @zoharmamancpa's caption is "האם עוסק פטור יכול להעסיק עובדים❓" with stacked long-tail hashtags | Scout 4 | **Confirmed.** There are 11 hashtags, including #העסקתעובדים, #טופס106, #עוסק_פטור_תקרה and #פוריו, which scout 4 did not list. The date is 2022-10-25 and the counts are 5,786 plays and 138 likes. The niche is widened by the bio: a BDO Israel partner. | `desc`, `author.signature` (rendered) |
| @nissimhamawi posted a long עוסק פטור vs עוסק זעיר explainer; its CTA is a consultation ("תוכל להתייעץ איתי לגבי המסלולים") | Scout 4 | **Confirmed verbatim.** The bio adds a firm contact URL and a phone number. **New:** 28.4K plays on 1,529 followers, 210 shares, posted 2024-12-11. | `desc`, `statsV2`, `authorStats` (rendered) |
| The עוסק זעיר claim rests on one caption: no annual report, 30%, ₪100K → ₪70K | Scout 4, critic | **Superseded.** It now rests on a rendered secondary source (Capitax), not only a caption. **Confirmed:** the 30%. **Corrected:** "no annual report" (there is no full return, but a shortened annual report and in-year tax coordination are required). | §2.4 (rendered secondary) |
| The track is real; the Tax Authority service is titled "דיווח שנתי מקוצר ותשלום לעסק זעיר" | Scout 7 | **Confirmed in substance.** Capitax quotes the Tax Authority: "המערכת לדיווח שנתי מקוצר ותשלום לעסק זעיר". The gov.il page itself was 403. | §2.4 (rendered secondary) |
| "The 'no annual report' claim looks wrong" | Scout 7 | **Corrected: half right.** The 26.11.2024 regulations do exempt the business from filing an annual return, and a shortened annual report replaces it. | §2.4 (rendered secondary) |
| Cap is 122,833 ₪ for 2026 | Scout 7 (snippet) | **Not settled.** Capitax gives ₪120,000 for 2024–2025 and ties the cap to the VAT עוסק פטור ceiling. ₪122,833 for 2026 follows only by inference from the repo's ceiling figure. | §2.4 (rendered secondary / repo / none) |
| Effective date not stated; probably before 2026, so not newsjacking in 2026 | Scout 7 | **Confirmed and dated:** from tax year 2024; registration opened late November 2024; regulations published 26.11.2024; the law was enacted in 2023. In September 2026 it is evergreen. Its news moment was November 2024 to January 2025, and the accountant's high-share video fell inside it. | §2.4, V3 (rendered) |
| It sits beside עוסק פטור rather than replacing it | Scout 7 | **Confirmed in substance.** It is an income-tax registration whose cap borrows the VAT ceiling. "A business can hold both" remains inference (none). Green Invoice was 403. | §2.4 (rendered secondary) |
| Official naming is "עסק זעיר / בעל עסק זעיר"; "עוסק זעיר" is the marketing word; it differs from the VAT §31(3) sense | Scout 7 | **Confirmed.** Capitax never writes "עוסק זעיר". The §31(3) quote is at repo line 132. | §2.4 (rendered secondary, repo) |
| "The repo already uses 'עוסק זעיר' only in the VAT §31(3) sense" (implied by the critic's collision warning); "our products never mention עוסק זעיר" | Critic; scout 4 | **Corrected.** Products, skills and docs indeed have no "זעיר". But the same research file covers the **income-tax** track in §4 (lines 151–175), at snippet and fetched grade, including "תיקון 277". That conflicts with Capitax's "תיקון מס' 265". | repo; §2.4 |
| The "פטור או זעיר?" space is crowded; cpa-ea runs a calculator; zcpa is the source of 122,833 | Scout 7 | **Not settled.** The cpa-ea and zcpa captures were 403. It stays snippet. | §1 |
| Bezeq 2025 figures (99% use WhatsApp, 98% daily) via the ToI blog | Scout 4, critic | **Not settled.** The ToI capture was 403. It stays snippet. The share-to-accountant tactic keeps its "untested" status. | §1 |
| @michael_danilovv teaches TikTok marketing in paragraph-length captions that repeat search phrases, with the hook "הרבה סוכנויות שיווק לא רוצות שתגדלו" | Scout 4 | **Confirmed verbatim** (7311263185841982721). 7152498603452321025 repeats "איך לעשות שיווק לעסק בטיקטוק" and "איך לפרסם את העסק שלך" twice each, with 12 hashtags. **New:** the 2022 video is text-on-screen over licensed music; the bio offers an interactive "hook bank". Video 7191833848584457473 was not captured and stays snippet. | `desc`, `stickersOnItem`, `music`, `author.signature` (rendered) |
| Hebrew TikTok captions are indexed by web search | Scout 4 | **Not testable from these captures.** The JSON shows `indexEnabled` true on all nine and SEO experiment flags, but what those mean is undocumented (none). | §1 |
| @tiktok.estimtes is "the closest Hebrew analogue to a faceless business-tool brand", opening on a real workflow question rather than a sales pitch | Scout 4 | **Caption confirmed; the lesson is reversed.** It is a quote-making product ("הצעת מחיר דיגיטלית"). But the video is **a paid ad** (`isAd` true), with 7 likes, 0 comments and 0 shares on 7,543 plays, from an account of 21 followers and 13 videos. It shows how little a faceless Hebrew tool gets on TikTok, not a format to copy. | `isAd`, `statsV2`, `authorStats`, `author.signature` (rendered) |
| Hebrew business TikTok found by web search dates from 2022–2025, with two videos from March 2026 | Scout 4 (grade none), critic | **Confirmed for the six IDs rendered:** 2022-10-09, 2022-10-25, 2023-12-11, 2024-12-11, 2025-01-19 and 2026-03-31. Three more @edelmanir IDs fall in 2024-10 and 2025-01. The other March 2026 video (@top.social_) was not captured. | `createTime`, `id >> 32` (rendered) |
| The Hebrew discover page "may list more Israeli marketing creators and video URLs in server-rendered HTML" | Scout 4 | **Refuted for a plain GET render.** The capture holds only the keyword record, with no items. | §1 (rendered) |
| @alexgorbachov, @omerstotsky and @top.social_ captions and dates | Scout 7 | **Not re-checked.** They are not in this family's captures and stay snippet. | none |
| Hebrew sales teaching on TikTok looks thin | Scout 7 | **Corrected in part.** It is thin in what web search surfaces, but the one channel found is large and sustained: 68.3K followers, 926.5K likes, 1,737 videos, active through 2026. | `statsV2` (rendered) |
| il-biz-tools has no WhatsApp share, no `wa.me` and no `navigator.share` | Scout 4 | **Confirmed** by re-grep. | repo |

---

## 5. URLs worth rendering next (only URLs seen in a capture)

**First: settle the עסק זעיר facts at primary grade before any page states them.** These links appear in
`tt-src-capitax-co-il-content-2-3311.html`. capitax.co.il answered 200, so its attachments are the likely
way around the gov.il 403.
1. https://www.capitax.co.il/Attachments/265-2023.pdf. The amendment text ("תיקון מס' 265"). It settles
   265 vs 277, and the statutory cap and 30% wording.
2. https://www.capitax.co.il/Attachments/26112024-2.pdf. The filing-exemption regulations
   (התשפ"ה-2024), with the conditions for the exemption.
3. https://www.capitax.co.il/Attachments/11122024.pdf. The Tax Authority's clarifications to tax
   representatives (11.12.2024). This is likely where eligibility and exclusions are spelled out.
4. https://www.capitax.co.il/Attachments/21072025-1.pdf. The Tax Authority's data and insights document
   (21.7.2025): uptake and who registered.
5. https://www.capitax.co.il/Attachments/28052025-1.pdf. Draft regulations on what counts in a בעל עסק
   זעיר's turnover.
6. https://www.gov.il/he/pages/sa190125-1 and https://www.gov.il/he/pages/sa210725-1. The Tax
   Authority's own announcements. gov.il answered 403 for the service page, so these may fail the same
   way. Try them once.

**Second: the end of each Hebrew creator's funnel.** The profile URLs are from oEmbed `author_url`; the
video JSON carries no `bioLink`.
7. https://www.tiktok.com/@michael_danilovv: where the "בנק הוקים אינטרקטיבי" link leads (a free
   lead-magnet pattern, H11).
8. https://www.tiktok.com/@tiktok.estimtes: its `bioLink` and product, to see what a faceless Hebrew
   tool sells and at what price.
9. "Edelman.co.il", exactly as in @edelmanir's `bioLink.link`, with no scheme in the capture: how an
   Israeli negotiation educator packages courses. Low priority, since his offer is live teaching.

**Third, optional: face on camera.** These are signed thumbnail URLs that expire at 2026-09-30 21:00
UTC (`x-expires=1790802000`). The CDN was not reachable from this container, and the question does not
change any lesson above. They are listed in the oEmbed `thumbnail_url` of
`tt-oembed-edelmanir-7458594829392514322.json` and `tt-oembed-tiktok-estimtes-7461529726461447432.json`.

**Not worth rendering again:**
- the Hebrew discover page, which is an empty shell;
- the TikTok tag pages linked in the oEmbed `html`, since the sales-creators reader found a tag page to
  be an empty shell too;
- the six 403 hosts, unless the runner's network changes.

No transcript links exist for any of the nine videos (`captionInfos` empty), so none can be queued.
