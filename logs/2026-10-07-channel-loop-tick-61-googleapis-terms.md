# טיק 61 (7.10.2026) — רשומת התנאים של googleapis.com: תנאי YouTube API Services נקראו ב-github grade, CONDITIONAL_UNMET, העתקה אסורה

בונה Opus, ב-worktree נפרד על הענף `build/tick61-yt-terms`. לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`,
`logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בפסיקות (`RULING-*`), ב-`SITTING-*`, ב-`research/measurements/*`, ב-`research/rendered/*`
או בקובץ קיים כלשהו תחת `logs/`. לא הרצתי `git stash`, `git fetch`, `git pull`, `git push`, `gh`, חיפוש או fetch ברשת, ולא נכנסתי
לתיקיית ההורדה של המסמך (קראתי אותו רק בנתיב המוחלט, ב-`sed -n`, `cat -n`, `grep -n` ובסקריפטים שלי שקיבלו אותו כארגומנט).
לא עשיתי push; ה-worktree נשאר ל-`scripts/merge-worktree.sh` של ה-thread הראשי.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים) לבנות את רשומת התנאים של googleapis.com לפי פסיקה 7.10 שורה 24
§2 החלטה 2 ולפי מזכר ההכרעה שלו (`yt-verdict.md` בתיקיית ה-scratch של הטיק, שהוא המפרט), על סמך קריאת הקורא והמאמת
(`yt-read.json`):

- א. קובץ ציטוטים `research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md` בצורת קובץ PostHog: כותרת (מאגר, נתיב,
  commit, sha256, תאריך, grade, איך לאמת), רק הסעיפים המצוטטים כטווחי שורות מקוריים מדויקים (כל טווח סעיף אחד, עד 12 שורות, סך
  הכול הרבה מתחת ל-150, אף פעם לא שורה 16 שיש בה כתובת דואר), שש התשובות כפי שהמאמת תיקן, הכרעה במילות המזכר, ורשימת "מה קריאה
  מאוחרת צריכה להכריע".
- ב. רשומה חדשה `googleapis.com` ב-`terms-verdicts.json` דרך `serializeVerdicts` בלבד (אחרי הוכחת round trip זהה בבתים).
- ג. בדיקות: בדיקה חדשה ב-`terms-saved-copies.test.ts`; הרצת שש קבצי הבדיקה שנמנו ועדכון pins שהשתנו לעובדה החדשה; הוכחה
  שה-tripwire של `youtube-madeforkids.test.ts` עובר; ריצה יבשה של `scripts/trim-capture.mjs`; 2-3 מוטציות לתוכנית, `--check`, וריצה
  ב-`scripts/sim-tree.sh`.
- ד. `scripts/verify.sh` ממוקד ומלא, commit, ולוג זה.

## 2. הפעולות המרכזיות שביצעתי

1. **בסיס.** ה-worktree נוצר מ-`origin/claude/new-session-j071dx` ב-`c5ee52e`. ה-tripwire שהמשימה מזכירה ("no active googleapis.com
   entry") לא היה שם: הוא נוסף בקיפול הקוד `1008e81`, שה-thread הראשי מיזג אחרי שה-worktree נוצר (הענף המקומי
   `claude/new-session-j071dx` היה כבר ב-`c1df0c8`, ש-`c5ee52e` הוא אב שלו). לפי הכלל של `CLAUDE.md` עשיתי `git reset --hard
   claude/new-session-j071dx` ב-worktree שלי לפני שנגעתי בקובץ, ובניתי על `c1df0c8`.
2. **קריאת המפרט.** קראתי את `yt-verdict.md`, את כל `yt-read.json` (הקורא: 6 תשובות, 17 תנאים, 30 טווחים; המאמת: 11 הפרכות, 17 סעיפים
   שהוחמצו, 6 תיקוני תשובות, תיקוני הערה ובדיקת ציטוטים), את §2 של הפסיקה, את `posthog-terms-2026-10-04.md` ואת
   `ansperformance-disclaimer-2026-10-05.md` (שתי הדוגמאות של pinned reference), ואת `terms-saved-copies.test.ts`.
3. **בחירת הטווחים.** 30 הטווחים של הקורא היו 459 שורות (המאמת: "contradicts ... the PostHog precedent"). בחרתי רק שורות שההכרעה
   או התשובות המתוקנות מצטטות, כל אחת סעיף אחד: **68 טווחים של שורה אחת, 68 מתוך 1,270 שורות**. כשמשפט פותח ופריטיו
   מצוטטים, ציטטתי כל אחד לחוד ולא את התת-סעיף כולו (III.E.5: ‎:606, ‎:608, ‎:610 ולא ‎:606-610; III.G.1: ‎:659, ‎:661; III.H: ‎:692,
   ‎:694; III.A.2.h-i: ‎:358, ‎:360; ‎:302 ו-‎:303 לחוד), כדי שאף טווח לא יהיה "סעיף שלם". שורות הכותרת ‎:1, ‎:13, ‎:286 מצוטטות כפי
   שהמשימה התירה. שורה 16 לא מצוטטת; היא מצוינת כמצביע, והמשפט המחייב מוחזק ב-‎:46 וב-‎:57, וההגדרות ב-‎:799.
4. **מחולל ובודק בסקריפטים (ב-scratch).** `build.py` בונה את הקובץ מתבנית (בודק sha256 ואורך של המקור, שאין טווח על 16, שאין טווח
   מעל 12, שהטווחים עולים, ומחשב sha256 לכל בלוק). `check.py` נפרד ממנו: משווה כל שורה מצוטטת לשורת המקור, מחשב שוב את ה-hash,
   מחפש תבניות כתובת ודוא"ל, מוודא שכל ציטוט במירכאות בתשובות נמצא בשורה מצוטטת (שתי מובאות משורות לא מצוטטות, ‎:527 ו-‎:540,
   הפכתי לפרפרזה), ושכל טווח מצוטט מצוין בפרוזה. תוצאה: 68 טווחים, 0 אי-התאמות, 0 כתובות, 0 טווחים לא מצוינים.
5. **שש התשובות.** כתבתי מחדש את תשובות הקורא עם כל תיקוני המאמת: (i) הנחת "אין משתמשים" נופלת תחת פסיקת הלקוח האחד, ‎:490 חל על
   "every API Client", ‎:134 (אין רמיזה לשותפות); (ii) "met by declaration" הפך ל"met by the main thread's ruling of tick 61", עם ‎:550,
   ‎:576, ‎:578, ‎:582 ועם הסכנה ש-`colony.yml:87` דוחף את פלט קורא האנליטיקה לציבור; (iii) "API key is an API Credential" ו"git
   history is storage" מסומנים [inference], P-2 לא נכנס ב-30 יום, ספירת ה-override תואמת את הדוגמה של ‎:598 מילולית; (iv) הגבול
   השעתי עוד לא בקוד; (v) "on the literal words only ... the scope is unknown", ו-‎:516 בשני הכיוונים; (vi) היום אין קריאה חיה בכלל,
   ו-videos.list עם part=status למפתח חשוף הוא [inference]. מצביעי הקוד עודכנו ל-`c1df0c8` (למשל `experiments.ts:289` במקום ‎:285,
   ו-`readback.ts:117-124` לשער התנאים ו-‎:156 ל-`redirect: "error"`, ששניהם נוספו ב-`1008e81` אחרי קריאת הקורא).
6. **הכרעה.** ציטטתי את מזכר ההכרעה (שורת ההעתקה, "Why not BARRED", שמונת התנאים והתוצאה) במילותיו, ואחריו הערות הקובץ: (a)
   `experiments.ts:285` הוא ‎:289; (b) **החלק האחרון של תנאי 3 לא מתקיים בקוד** (ראו סעיף 4); (c) הציטוטים קוצצו כפי שתנאי 3 מבקש;
   (d) §16.1-16.2 הם ‎:163 ו-‎:165.
7. **הרשומה.** סקריפט `add-entry.mjs` (ב-scratch) מייבא את `serializeVerdicts` מ-`scripts/robots-verdict.mjs`, מוודא round trip זהה
   בבתים (174,605 בתים), מוודא שהאתרים ממוינים (`keys == sorted`, זה הכלל של הקובץ), מכניס את googleapis.com במקומו (בין google.com
   ל-googlesource.com), מוודא ששום רשומה אחרת לא זזה, וכותב. אחר כך `set-entry.mjs` (אותו מנגנון) החליף את ההערה אחרי שבדיקה תפסה
   הפניה ל-agenthon.net (סעיף 5).
8. **בדיקות** (סעיף 6), **מוטציות**, **ריצות**, ו-commit `6f7ea3a`.

## 3. קבצים/מערכות ששונו

- `research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md` — חדש (547 שורות, 68 שורות מקור מצוטטות).
- `research/channel-loop/terms-verdicts.json` — רשומה חדשה `googleapis.com` (7 שורות; 132 → 133 אתרים).
- `src/__tests__/revenue/terms-saved-copies.test.ts` — הקובץ נוסף לרשימת הצורות (עובדה חדשה), ובלוק חדש של 7 בדיקות.
- `src/__tests__/revenue/prize-terms-audit.test.ts` — `yt61Before()`, ‏`un60Before()` מורכב ממנו, ארבעה מקומות שקוראים את הקובץ כפי
  שטיקים קודמים השאירו אותו, ייבוא `ACTIVE_VERDICTS`, ובלוק "tick 61" חדש של 4 בדיקות.
- `src/__tests__/revenue/mutations/terms-saved-copies.json` — תוכנית חדשה, 3 מוטציות; `mutations/README.md` — שתי שורות;
  `mutation-plans.test.ts` — התוכנית ברשימת התוכניות הנדרשות.
- `logs/2026-10-07-channel-loop-tick-61-googleapis-terms.md` — הלוג הזה.

## 4. החלטות והנחות משמעותיות

- **בסיס `c1df0c8` ולא `c5ee52e`** (סעיף 2.1): בלי `1008e81` לא היה tripwire להוכיח, ו-`experiments.ts` ו-`readback.ts` זזו בו.
- **68 שורות, ולא 459 או 150.** "well under 150" ו"copying-barred, so less": שורה אחת לסעיף, וכל שורה מוצדקת בציטוט בפרוזה (בדיקה
  אוכפת זאת). שורות שרק מוזכרות (‎:24, ‎:66, ‎:243, ‎:251, ‎:444, ‎:446, ‎:500, ‎:520, ‎:527, ‎:540, ‎:574, ‎:580, ‎:586, ‎:686, ‎:690,
  ‎:1133-1139) מסומנות "by pointer" ולא מצוטטות.
- **מצביע הבדיקה למקור.** המקור לא ב-repo (אסור להעתיק). הבדיקה שמשווה כל שורה למקור רצה רק עם `YT_TERMS_SOURCE=<ההורדה>`, כמו
  שבדיקת un.org חוזרת מוקדם כשה-commit הבסיסי לא נגיש; בלי המשתנה ה-hash בכל סמן הוא מה שאחזור מחדש בודק (ו-`parse()` מחשב אותו).
  הרצתי אותה עם ההורדה: exit 0, ובקרה שלילית עם נתיב חסר: exit 1 (ENOENT).
- **בדיקת הכתובת בלי כתובת.** התבניות (מספר ושם רחוב עם סיומת; קוד מדינה ו-ZIP) כתובות כ-regex כלליים. ריצת `YT_TERMS_SOURCE`
  מוכיחה ששתיהן תופסות את שורה 16 עצמה, ו-grep על כל המקור מצא שהתבנית תופסת רק את שורה 16.
- **`yt61Before()` לפי תקדים `un60Before()`.** הבלוקים של טיקים 54-60 סופרים את הקובץ כפי שהיה; הרשומה החדשה נוספה אחריהם, ולכן היא
  יוצאת מהם, והמספרים שלהם נשארו (11, 12, 120, ‏[12, 119, 1, 9, 3]). הבלוק "tick 61" נועץ את החדשים: 13 חסומי העתקה, 10
  CONDITIONAL_UNMET, ‏[13, 119, 1, 10, 3], 133 אתרים, ובודק מול `git show c1df0c8:terms-verdicts.json` ששום רשומה אחרת לא זזה.
- **ההערה בלי agenthon.net.** בדיקת טיק 57 אוסרת על רשומה אחרת להזכיר את agenthon.net (הפניה שמתיישנת). המזכר אומר "per the
  agenthon precedent"; בהערה כתבתי "the reading this file gives such clauses elsewhere", ובקובץ הציטוטים המזכר מצוטט כמות שהוא.
- **תוכנית מוטציות חדשה ולא `robots-verdict.json`.** אין סקריפט מאחורי הנתונים; התוכנית נקראת על שם הבדיקה שהיא מכוונת אליה, עם
  שורת README.

## 5. שגיאות וניסיונות שנכשלו

- הריצה הראשונה אחרי הוספת הרשומה: 7 כשלונות. שישה מהם pins צפויים (רשימת הצורות; רשימת חסומי ההעתקה; ‏`length - 12` = 121;
  ‏`barred(then)` = 12; ‏[13, 119, 1, 10, 3]; ‏"moves un.org alone"), ואחד אמיתי: ההערה שלי הזכירה את agenthon.net. תיקנתי את
  ההערה (לא את הבדיקה), ואת השישה דרך `yt61Before()` והבלוק החדש.
- בטיוטה הראשונה שתי מובאות במירכאות בתשובות היו משורות שלא צוטטו (‎:527, ‎:540); `check.py` תפס, והפכתי אותן לפרפרזה.
- שורת בדיקה מסורבלת אחת (`.replace(...)` בתוך `toContain`) ושורה שבדקה את שורה 16 בתוך הלולאה תוקנו לפני ה-commit.

## 6. בדיקות ופעולות ולידציה

- הבסיס לפני שינוי: 9 קבצי בדיקה, 391 בדיקות, exit 0.
- אחרי: אותם 9 קבצים (terms-saved-copies, prize-terms-audit, frozen-citations, queue-zero-test, robots-verdict, trim-capture,
  youtube-madeforkids, mutation-plans, render-watch-terms-barred): 402 בדיקות, exit 0.
- **ה-tripwire:** "the committed verdicts hold no active googleapis.com entry today, so the script as committed refuses" עובר;
  והסקריפט עצמו עם מפתח מזויף: `googleapis.com is CONDITIONAL_UNMET, not one a call may run under ... refusing to run`, exit 2, אין
  קובץ state.
- `terms-saved-copies.test.ts` עם `YT_TERMS_SOURCE`: ‏21 בדיקות, exit 0 (68 שורות הושוו); עם נתיב חסר: exit 1.
- **`node scripts/trim-capture.mjs` (יבש):** exit 3 ("nothing to do"), לפני ואחרי. ההבדל היחיד: "copying allowed 1, barred 12, unread
  119" → "barred 13". **אין שורה ל-googleapis.com** (0 שורות): אין לו captures. ‏totals ללא שינוי ("50 capture(s) of 11 copying-barred
  site(s): 0 would be trimmed"). עשרת ה-captures של developers.google.com/youtube שייכים ל-google.com (`siteOf`), שה-copying שלו
  "unread", ולכן הם בין "571 of unread sites" ולא ייגעו בהם.
- **מוטציות:** `--check` ‏3 of 3 would apply, exit 0. ידנית (החלה, הרצה, שחזור, `cmp`): YT1 נכשל ב-"is the source of googleapis.com's
  verdict, a file that exists"; YT2 ב-"quotes each clause as at most 12 original lines" (`expected [[1147, 1159]] to deeply equal []`)
  ועוד ארבע; YT3 ב-"never quotes original line 16" (`expected [[16, 16]] to deeply equal []`) ועוד שתיים, כש-`parse()` עובר.
  ב-sim-tree (`scripts/sim-tree.sh --dir <scratch>/sim -- node scripts/mutate.mjs --plan …/terms-saved-copies.json`, על `6f7ea3a`, לצד ה-verify המלא): שני baselines עברו (4.9 ו-3.9 שניות), **3 killed, 0 survived**, exit 0, ‏57 שניות כולל בניית העץ; העץ נמחק על ידי sim-tree. את בדיקת ה-regex של הכתובת עצמה אי אפשר למטט בלי לכתוב מחרוזת בצורת כתובת לקובץ תוכנית שנכנס ל-repo (אסור); היא מכוסה בריצת `YT_TERMS_SOURCE`, שמוכיחה ששתי התבניות תופסות את שורה 16 של המקור.
- `scripts/verify.sh` ממוקד (5 קבצים): typecheck exit 0, ‏228 בדיקות, exit 0. מלא (`scripts/verify.sh`, על `6f7ea3a` ועוד שורת ה-README והלוג שלא בשימוש של בדיקה): typecheck exit 0, ‏80 קבצים, 2,828 עברו ו-2 skipped (שתי ה-skips קיימות בבסיס ואינן שלי), **exit 0**, ‏278 שניות, לצד verify של בונה אחר שרץ באותו זמן.
- grep על ה-diff: תבנית השמות 0 שורות; תבניות כתובת (רחוב, ZIP, ושמות הרחוב והעיר של שורה 16) 0 שורות; דוא"ל 0 שורות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **בניית pinned reference ממקור.** `build.py` ו-`check.py` שלי (תבנית עם `@@EXCERPT a b heading@@`, hash לכל בלוק, השוואה למקור,
  בדיקת מובאות וציטוטים) הם הפעם השלישית שמישהו בונה את זה ביד (PostHog, ansperformance, כאן). כדאי `scripts/terms-excerpt.mjs`
  עם `--build` ו-`--check <source>`.
- **הוספת רשומת terms-verdicts.** `add-entry.mjs`/`set-entry.mjs` (round trip, מיון, אף רשומה אחרת לא זזה) כדאי להכניס ל-
  `robots-verdict.mjs` כפקודה (`--set-entry <site> <json>`), במקום סקריפט חד-פעמי בכל טיק.
- **"Before" לכל טיק.** `un60Before`, `yt61Before`, `tick54`, `tick57e`: כל קריאה חדשה מוסיפה פונקציה ומתקנת ידנית את מוני הטיקים
  הקודמים. עדיף fixture אחד לכל טיק שנשמר אוטומטית (`terms-verdicts` ב-commit הבסיס) ופונקציה כללית `before(tick)`.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `yt-read.json` (‏98 KB) בשלמותו, פעמיים בחלקים: נחוץ, כי התיקונים מפוזרים בין חמישה שדות.
- תצוגות מקדימות של כ-150 שורות מקור בארבע פעימות כדי לבחור טווחים ולתת להם שמות: רובן נחוצות; את הכותרות היה אפשר לשלוף ב-grep
  אחד מראש.
- הדפסת `README.md` של המוטציות במלואו (טבלת זמנים ארוכה מאוד) רק כדי לראות את הפורמט: בזבוז; `sed -n` על 10 שורות היה מספיק.
- ריצת 9 קבצי הבדיקה שלוש פעמים (בסיס, אחרי, אחרי תיקון): נחוץ.
