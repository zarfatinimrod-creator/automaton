# טיק 61 — קיפול 9 של פסיקה 7.10 שורה 25: R1 בקורא צפיות הדפים, והשעיית מועד M-instrument

ענף: `build/tick61-ph-reader` (worktree), מבוסס על `c5ee52e` (אחרי `a8497ed`, הפסיקה). המיזוג — בידי השרשור הראשי
(`scripts/merge-worktree.sh`); לא נדחף.

## 1. מה המשתמש ביקש

השרשור הראשי (בונה Opus "reader") ביקש להחיל את קיפול 9 של
`research/channel-loop/RULING-2026-10-07-posthog-organisation.md` ("Folds for Opus"), כש-§4(1) R1 ו-§4(2)(iv) הם
המפרט: לסווג תשובת `/query` שנראית כחיוב (402; 403 או 429 שגופן מזכיר billing, plan, credits, quota או upgrade; 2xx
עם שדה חיוב/שימוש מחויב); ב-R1 הקורא לא שולח עוד דבר, כותב `reader_down` עם הסיבה `query_api_priced` ודגל קבוע
שעוצר כל שאילתה עד שיד מנקה אותו עם סיבה מתוארכת; ולפי §4(2)(iv) — מועד M-instrument מושעה כל עוד הדגל מורם, ממשיך
בקריאה המוצלחת הראשונה (backfill), ו-`instrument_fault` רק אחרי 60 יום בלי קריאה. השמות של 30.9 (`reader_down` /
`instrument_fault`) נשמרים, הסירובים הקיימים של הקורא (נעילת המארח) לא משתנים. קבצים מותרים: `page-views-reader.ts`,
`page-views.ts`, `state/colony/page-view-clock.json` (רק הרחבת ה-`_comment` ובלוק `queryApi` ריק), הבדיקות שלהם עם
פיקסצ'רים לחמשת המקרים, תוכנית מוטציות ושורת README עם זמן מדוד, והיומן הזה.

## 2. הפעולות המרכזיות שביצעתי

1. קראתי את הפסיקה כולה (832 שורות), את `page-views-reader.ts`, `page-views.ts`, קובץ השעון, שתי קבוצות הבדיקות,
   תוכנית המוטציות `page-views.json` וה-README שלה, את קריאות 1-2 של פסיקת 30.9 (`RULING-2026-09-30-documents.md`
   (c)), ואת `runner.ts` במקומות שקוראים לקורא.
2. **R1 (טהור, `page-views.ts`)**: `queryApiPriced(status, body)` מחזירה מה התאים (`HTTP 402`,
   `HTTP 429 naming "quota"`, `HTTP 200 carrying a billed-usage field (billed_usage)`) או null. `maskPricedBody(body, key)`:
   מסווה את מפתח הקריאה עצמו, כל אסימון PostHog (`ph?_…`) ואת החלק המקומי של כתובת דוא"ל, מקפל רווחים, ורק אחר כך
   חותך ל-200 התווים הראשונים (`PRICED_BODY_KEEP`) — כך שמפתח שחוצה את נקודת החיתוך לא נשמר חלקית.
3. **הדגל הקבוע (`page-views-reader.ts`)**: `postQuery` מסווגת כל תשובה לפני כל קריאה אחרת שלה, ובתשובה מחויבת
   זורקת `QueryApiPricedError`. הלולאה עוצרת מיד (שבועות שנקראו קודם באותו טיק נשמרים), מחזירה סטטוס `error` עם
   `reason: "query_api_priced"` ופירוט שמתחיל ב-`reader_down — query_api_priced`, ורושמת ירי ב-`queryApi.priced` של
   קובץ השעון (`recordQueryApiFiring`, דרך קובץ זמני ו-rename). כל טיק אחר כך לא שולח שאילתה כל עוד יש ירי בלי ניקוי
   ידני. ניקוי = `clearedOn` (יום UTC, לא לפני יום הירי) ו-`clearedReason` שמציין את רשומת ה-REOPEN (שם קובץ
   `RULING-YYYY-MM-DD-…`); כל ניקוי חלקי או שגוי מדווח כבעיה והדגל נשאר. בלוק שלא ניתן לקרוא — הקורא נכשל סגור.
4. **§4(2)(iv) (טהור, `page-views.ts`)**: `pricedSuspension` ושינויים ב-`evaluatePageViewGates` (פרמטר שישי אופציונלי
   `pricedAt`): המועד מושעה מרגע הירי עד השורה הראשונה שנכתבה אחריו, וזז בזמן ההשעיה; אם אין קריאה תוך
   `PAGE_VIEW_GATES.pricedReadWithinDays` (60) — השבועות שנשארו לא-נקראים ושעליהם ממתין שער של תקופת netlify הם
   `instrument_fault` (עם הערה משלו), וקריאה מאוחרת לא מבטלת אותו. בזמן השעיה, שעון שעוד לא instrumented עם שבוע באיחור
   הוא `reader_down` ולא `uninstrumented`. בתקופת הדומיין — רק הערה, אף פעם לא `instrument_fault`.
5. `evaluatePageViewLines` מעבירה לשערים את הירי מקובץ השעון, כך שהדוח והחוסמים של הטיק רואים את ההשעיה.
6. `state/colony/page-view-clock.json`: הרחבתי את ה-`_comment` (מה הבלוק, מי כותב, מי מנקה ואיך, ההשעיה ו-60 הימים,
   ש-429 של rate limit אינו ירי) והוספתי `"queryApi": { "priced": [] }`. הקובץ עובר round-trip בייט-לבייט דרך
   `serializePageViewClock` (נבדק בבדיקה).
7. פיקסצ'רים: `posthog-query-402.json`, `posthog-query-403-billing.json`, `posthog-query-429-billing.json`,
   `posthog-query-429-rate-limit.json`, `posthog-hogql-pageviews-billed.json`. בדיקות: 16 חדשות ב-`page-views.test.ts`
   (39 → 55), 28 חדשות ב-`page-views-reader.test.ts` (32 → 60, כולל המקרים שבלולאות).
8. תוכנית מוטציות: הוספתי 74 רשומות (`T61-R*` 16, `T61-M*` 6, `T61-S*` 25, `T61-F*` 27) ל-`mutations/page-views.json`,
   אימתתי ב-`--check`, והרצתי את כל 79 בתוך `scripts/sim-tree.sh` פעמיים (סעיף 6); עדכנתי את שתי השורות של
   `mutations/README.md`.
9. שלושה קומיטים על `build/tick61-ph-reader`: הבנייה, שתי בדיקות לשני השורדים, ו-README + היומן.

## 3. קבצים/מערכות ששונו

- `src/revenue/page-views.ts` — כותרת (סעיף "A priced query API"), `QUERY_API_PRICED`, `PRICED_BODY_KEEP`,
  `queryApiPriced`, `maskPricedBody`, `QueryApiFiring`, `QueryApiPricedAt`, `PAGE_VIEW_GATES.pricedReadWithinDays`,
  `PricedSuspension`, `pricedSuspension`, ושינויים ב-`evaluatePageViewGates`.
- `src/revenue/page-views-reader.ts` — כותרת, `readQueryApi`, `readPageViewClock` (שדה `queryApi`),
  `serializePageViewClock`, `withQueryApiFiring`, `recordQueryApiFiring`, `QueryApiPricedError`, `postQuery`,
  `readPageViews`, `evaluatePageViewLines`.
- `state/colony/page-view-clock.json` — `_comment` בשורה 2 הורחב; שורה חדשה `queryApi`; פסיק בסוף שורת `pcn874`
  (תחביר JSON בלבד, לא שדה).
- `src/__tests__/revenue/page-views.test.ts`, `src/__tests__/revenue/page-views-reader.test.ts` — בדיקות חדשות בלבד;
  שום assertion קיים לא שונה.
- `src/__tests__/revenue/fixtures/` — חמישה פיקסצ'רים חדשים.
- `src/__tests__/revenue/mutations/page-views.json` — 74 רשומות חדשות; `mutations/README.md` — שורת הטבלה וזמן הריצה.
- `logs/2026-10-07-channel-loop-tick-61-posthog-reader.md` — היומן הזה.

לא נגעתי ב-`runner.ts`, ב-README של il-biz-tools, ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`,
`MISSION.md`, `CLAUDE.md`, בפסיקות או ב-`research/measurements/*`. בלי רשת, בלי `gh`, בלי מחבר.

## 4. החלטות והנחות משמעותיות

הפסיקה היא המפרט; כאן מה שהקוד היה צריך להכריע והפסיקה לא אמרה במפורש (צורת הקוד — §4(2)(iv) עצמה אומרת שהיא "may
be queued to a sitting if contested"). אף אחת מאלה אינה פסיקה; כולן לשרשור הראשי:

1. **סטטוס**: הקורא מחזיר `error` עם `reason: "query_api_priced"` ופירוט שמתחיל ב-`reader_down — query_api_priced`,
   ולא סטטוס חדש ב-`PageViewReadStatus`: `runner.ts` מחזיק `Record<PageViewReadResult["status"], string>`, וסטטוס חדש
   היה שובר את ה-typecheck בקובץ שאינו ברשימה שלי. מסלול ה-error הקיים של ה-runner כבר הופך אותו לחוסם בכל טיק.
2. **צורת הדגל**: `queryApi.priced` הוא רשימת ירי (`at`, `reason`, `status`, `matched`, `body`, `clearedOn`,
   `clearedReason`), לא דגל בוליאני — כדי שההשעיה של ירי ישן לא תאבד כשיש ירי שני. הדגל "מורם" כל עוד יש ירי בלי
   ניקוי תקף. ה-`_comment` אומר "never by deleting it": מחיקה הייתה מעלימה גם את ההשעיה.
3. **"רק רשומה ברשומת ה-REOPEN מנקה"** (R1) מומש כך: `clearedReason` חייב לציין קובץ פסיקה (`RULING-YYYY-MM-DD-<slug>`),
   ו-`clearedOn` יום UTC שאינו לפני יום הירי (אותו יום — מותר).
4. **מתי ההשעיה מתחילה**: מרגע הירי (ה-`at` של הטיק), לא מתחילת יום ה-UTC שלו. "from the day R1-R3 fires" — ההבדל
   קטן מיום, ומתחילת היום היה משעה זמן שבו הקורא עוד עבד.
5. **"הקריאה המוצלחת הראשונה"** = השורה הראשונה שנכתבה אחרי הירי (בזמן כתיבה גדול ממש מה-`at`): הטיק שפגש את התשובה
   המחויבת וכתב שבוע קודם באותו טיק אינו "קריאה אחריו".
6. **60 הימים**: מהירי. לשעון שהתחיל *תחת* ירי פתוח (עוגן אחרי הירי) — מהעוגן של השעון, וההשעיה מתחילה בעוגן. ירי שנוקה
   לפני יום העוגן של שעון אינו נספר לו. ירי אחרי שהמועד כבר עבר לא משעה דבר (ה-fault של M-instrument נשאר) — מצאתי
   את זה כבאג בתכנון המוטציות ותיקנתי לפני הקומיט (סעיף 5).
7. **היקף ה-`instrument_fault` של 60 הימים**: רק בתקופת netlify, ורק על שבועות ששער ממתין להם (1-8 עד שקריאת יום 56
   מוכרעת, 9-16 אחרי הארכה). אחרי פסק דין סופי השבועות הלא-נקראים נשארים אבחון — כמו קריאה 1 של 30.9 ("Restarting would
   discard a valid 56-day measurement"). בתקופת הדומיין אף פעם לא `instrument_fault` — כמו `RULING-2026-10-06-domain-clock`.
   הפסיקה של 7.10 שותקת על שני המקרים; שמרתי את הפסיקות הקודמות במקום ששתקה.
8. **"דביק"**: קריאה שמגיעה אחרי 60 הימים לא מבטלת את ה-fault (כמו "a week written later does not undo it" של
   M-instrument, ו-"instrument_fault as the 30.9 ruling defines it": מתוקן, השעון מאותחל, נרשם).
9. **חסד של יום**: נשמר. השערים מראים `reader_down` יום אחרי שהשבוע נהיה קריא (כמו היום); תוצאת הקורא עצמה אומרת
   `reader_down — query_api_priced` מיד, והיא חוסם מיד.
10. **מילות R1**: ב-403/429 — billing, billed, plan(s), credit(s), quota(s), upgrade(s/d/ing), מילים שלמות, בלי תלות
    ברישיות, על גוף התשובה הגולמי. ב-2xx — שם שדה בכל עומק (לא ערך) שאחת ממילותיו (camelCase, `_`, `-`) היא bill(ed,
    ing, able), charge(d, s), cost(s), credit(s), fee(s), invoice(d), price(d) או pricing. "usage" לבדו אינו טריגר.
    סיכון ידוע: דף 403 של CDN עם "upgrade your browser" ירים את הדגל — גלוי, ניתן לניקוי ביד, ושמרני לכיוון ₪0.
11. **R2 ו-R3** אינם בקיפול 9 (הם של השרשור הראשי). §4(2)(iv) אומרת "from the day R1-R3 fires"; ירי R2/R3 אפשר לרשום
    ביד באותה צורה (`reason: "query_api_priced"`, `matched` שאומר איזה טריגר) — הצעה, לא החלטה; ה-`_comment` אומר
    "The reader writes the entries", ולכן זו שאלה פתוחה לשרשור הראשי.
12. **קובץ שעון שאינו JSON** מחזיר עכשיו `error` (נכשל סגור) במקום `no_clock`. בשני המקרים לא נשלח דבר.
13. **מסווה אסימוני PostHog בלי גבול מילה**: גם אסימון שדבוק לתו קודם מוסווה; הסוואת-יתר של מילה שמכילה `ph?_` אינה מזיקה.

**סטיות מהפסיקה**: אין סטייה מהותית. הסטייה היחידה בצורה היא סעיף 1 (סטטוס `error` + `reason` במקום שם סטטוס
`reader_down` בתוצאת הקורא), בגלל גבולות הקבצים; המילה `reader_down` והסיבה `query_api_priced` כתובות בפירוט, בתוצאה
ובשערים.

**הזזת מצביעים**: כל מצביעי הפסיקה לקיפול הזה נמצאו בשורה הנכונה ב-HEAD (`c5ee52e`): `page-views-reader.ts:8-16`
(NEEDS), `:65-69` (מפת המארחים), `:310` (`not_configured`), `:313-315` (`counter_off`), `:317-318` (הסירוב למארח זר),
`:327` (`no_clock`); `page-views.ts:41-43`; `page-view-clock.json:2`. אחרי השינוי: מפת המארחים ב-`:81-85`, הסירוב
ב-`:459-460` — הטקסט ללא שינוי.

## 5. שגיאות וניסיונות שנכשלו

- בדיקת ההסוואה הראשונה נכשלה: הביטוי של אסימון PostHog דרש `\b` לפניו, ואסימון דבוק ל-`x` לא הוסווה. הורדתי את
  ה-`\b` (סעיף 4.13) ועדכנתי את התיעוד.
- בדיקת האינטגרציה של הטיק נכשלה כי בדקה `not.toMatch(/instrument fault/)` על כל החוסמים, והערת ה-gap הקיימת מכילה את
  הצירוף. צמצמתי ל-`page views (il-biz-tools|pcn874): instrument fault`, כמו הבדיקות הקיימות.
- **באג שנמצא לפני הקומיט**: בתכנון מוטציה ל-`startMs < deadline` ראיתי ששעון שכבר עבר את המועד בלי כתיבות, ואחר כך
  פגש ירי, היה מקבל `reader_down` במקום `instrument_fault`. הוספתי `nowMs < deadlineMs` לתנאי ושתי בדיקות.
- ריצת המוטציות הראשונה (79 רשומות, 403 שניות, לבד) השאירה שני שורדים — בדיוק השניים שחזיתי בתכנון:
  `T61-S5` (ירי שעוד לא קרה הוסיף את ההערה שלו לקריאה; הבדיקה בדקה רק את ה-verdict) ו-`T61-S9` (קריאה בדיוק ביום ה-60;
  נראה שקול, אבל אינו שקול כשהקריאה ההיא כתבה שבוע אחד בלבד). שתי בדיקות נוספו בקומיט נפרד, ובריצה השנייה כולן נהרגו.
- `/tmp/sim-tree.pIhgn4` — העץ שהריצה הראשונה (הנכשלת) השאירה, לפי התנהגות `sim-tree.sh` אחרי כישלון. לא מחקתי אותו:
  כללי התדריך מתירים לי למחוק רק את תיקיית ה-scratch שלי. פקודת ההסרה שהכלי הדפיס: `rm -rf -- /tmp/sim-tree.pIhgn4`
  (לשרשור הראשי).

## 6. בדיקות ופעולות ולידציה

- `node scripts/mutate.mjs --check --allow-dirty --plan src/__tests__/revenue/mutations/page-views.json`: exit 0, 79 מתוך 79.
- `scripts/verify.sh src/__tests__/revenue/page-views-reader.test.ts src/__tests__/revenue/page-views.test.ts
  src/__tests__/revenue/mutation-plans.test.ts`: exit 0 (typecheck 0, 148 בדיקות).
- `node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/page-views.json` בתוך `scripts/sim-tree.sh`:
  ריצה ראשונה על `ac9ba8c` — 79 הוחלו, 77 נהרגו, 2 שרדו (`T61-S5`, `T61-S9`), sim-tree exit 1, 403 שניות; ריצה שנייה על
  `e641ae4` — 79 הוחלו, **79 נהרגו, 0 שרדו**, 0 timeout, 0 לא הוחלו, sim-tree exit 0, 638 שניות (ליד ה-verify.sh המלא
  ב-257 השניות הראשונות; הקבסליין של שני קובצי הבדיקה 4-8 שניות לריצה).
- `scripts/verify.sh` המלא (typecheck ואז `src/__tests__/revenue`): exit 0, 257 שניות; 80 קובצי בדיקה, 2832 עברו,
  2 דולגו (הדילוגים הקיימים של הסוויטה).
- `serializePageViewClock(JSON.parse(קובץ השעון))` שווה לקובץ בייט-לבייט (נבדק גם בבדיקה).
- grep על ה-diff לשם/כינוי הבעלים: 0 שורות; ל-`ph[cx]_` ואחריו 10+ תווים: 0 שורות; לכתובות דוא"ל: 0 שורות. מפתחות,
  אסימונים וכתובות בבדיקות נבנים בזמן ריצה.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- כתיבת 74 רשומות מוטציה ביד, כל אחת עם `find` שצריך להופיע פעם אחת בדיוק: כתבתי סקריפט Python חד-פעמי שבודק את
  הספירה לפני הכתיבה. `mutate.mjs` יכול לקבל מצב `--add` שמקבל find/replace/note ומוסיף לתוכנית אחרי בדיקת ייחודיות.
- הוכחת מחרוזות find ב-`grep -n -F` לפני כל עריכה — חוזר בכל קיפול; כלי `loop-edit.mjs` מכסה רק קבצי לולאה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה כולה (כ-36 אלף אסימונים) כשקיפול 9 נשען בעיקר על §4 — אבל ההוראה הייתה לקרוא את כולה, וחלק §1-§3 נתן את
  ההקשר של `site.json` ושל הארגון.
- קריאת `page-views.ts` המלא (כ-10 אלף) — נחוץ: השערים נוגעים בכל הקובץ.
- תזכורות המשימות החוזרות של הסביבה (רשימת 78 משימות של השרשור הראשי) — כמה אלפי אסימונים בכל פעם, בלי תועלת לבונה.
- תכנון המוטציות בראש לפני הכתיבה היה יקר, אבל מצא את הבאג של סעיף 5.

## תיקוני הסקירה

### 1. מה התבקש

סוכן התיקון (Opus) התבקש להחיל את שני הממצאים של הסקירה שדרגתם "blocking" ו-"fix", לפי נוסח התיקון של הסקירה היכן
שהוא נכון ולפי הפסיקה (`RULING-2026-10-07-posthog-organisation.md`) היכן שלא; שבע ההערות (note) נשארות לשרשור הראשי.
קודם לכן: למזג את הבסיס אם זז.

### 2. הפעולות המרכזיות

- **מיזוג הבסיס.** `origin/claude/new-session-j071dx` זז ל-`4795dee` (תיקוני שורה 24 ותיקון 1 שלה). מיזוג `--no-ff`
  בלי קונפליקט; `mutations/README.md` קיבל את שורות `youtube-madeforkids.json` של הבסיס לצד שורות הבנייה הזו. להודעת
  המיזוג הוספתי את שתי שורות ה-trailer (amend), כמו במיזוג `848af22`. המיזוג לא נגע ב-`page-views.ts`,
  ב-`page-views-reader.ts` או ב-`state/`, כך שמספרי השורות של הסקירה (ב-`a97357a`) נשארו נכונים.
- **מיזוג שני.** בזמן התיקון הבסיס זז שוב ל-`e5c7e19` (קריאת התנאים של googleapis.com). `git merge-tree` נקי (exit 0),
  ומיזוג `--no-ff` עם ה-trailers (`f18e8bc`) בלי קונפליקט; `mutations/README.md` שומר את שורות `terms-saved-copies.json`
  של הבסיס לצד שורות `page-views.json`. שתי ריצות verify.sh חזרו אחריו (סעיף 6).
- **מיזוג שלישי.** הבסיס זז שוב ל-`395519a` (קיפול owner-steps של שורה 25). הפעם קונפליקט אחד, ב-`mutations/README.md`:
  שני הצדדים הוסיפו שורות לשתי הטבלאות. הפתרון (`eb31d19`) שומר את שורת `owner-steps.json` של הבסיס ואת שורת
  `page-views.json` של הבנייה הזו בכל טבלה, בסדר של הבסיס; שורת `page-views.json` של הבסיס היא הגרסה שלפני הבנייה,
  וכל עובדה בה (tick 54, fold 5, 5 רשומות ב-23 שניות) כתובה גם בשורה של הבנייה. שתי ריצות verify.sh חזרו אחריו.
- **ממצא 1 (blocking, R1 של §4(1)).** `BILLING_WORDS` היה regex של מילים שלמות (`\b…\b`), ולכן `_` ו-camelCase נחשבו
  חלק מהמילה: גוף 429 עם `"code":"quota_limited"` החזיר null. עכשיו זו קבוצה של שתים-עשרה מילים (אותן מילים), והגוף
  של 403/429 מפורק לאסימונים ב-`fieldWords` — אותה פונקציה שמפרקת שמות שדות של 2xx: שבירת camelCase, אותיות קטנות,
  פיצול על כל תו שאינו אות או ספרה. `queryApiPriced` מחזיר את האסימון הראשון שבקבוצה, ו-`matched` נשאר בצורתו
  (`HTTP 429 naming "quota"`). עכשיו יורים: `quota_limited`, `quotaLimited`, `billing_limit_exceeded`, `plan_required`,
  `upgradeRequired`, `CREDITS_EXHAUSTED`, `billed-usage-cap`. לא יורים: "planned", "explanation", `quotation_error`,
  `explanationMissing` — האסימון שלם ואינו אחת המילים.
- **ממצא 2 (fix, §4(2)(iv)).** `pricedSuspension` חיבר השעיות חופפות. עכשיו יש סמן `suspendedUntil`: כל ירי (לפי
  הסדר) מתחיל ב-`from = max(startMs, suspendedUntil)` ונגמר ב-`until = min(firstRead ?? now, endMs)`, מוסיף רק
  `until - from` (לא פחות מ-0), והסמן מתקדם ל-`until`. כל ירי שומר את ה-`endMs` של 60 הימים שלו לבדיקת
  `instrument_fault`, כפי שהסקירה ביקשה. התנאי `startMs < deadline` הפך ל-`from < deadline`, וזה שקול: אחרי השעיה
  שנספרה הסמן תמיד לפני המועד שזז (`deadline` גדל באותו זמן שהסמן התקדם מעבר ל-`from`), ולכן ירי שהתחיל לפני המועד
  נשאר לפניו גם אחרי הסמן.
- **בדיקות.** ב-`page-views.test.ts` שתי בדיקות חדשות (55 → 57): "a word written as a code token names it" (שלוש
  ה-fixtures החדשות, `plan_required`, `upgradeRequired`, `CREDITS_EXHAUSTED`, `billed-usage-cap`, ושלושה גופים שאינם
  מפעילים), ו-"overlapping suspensions count once" — הרצף של הסקירה (ירי ביום 8 שנוקה ביום 8, ירי ביום 9, קריאה
  ביום 40): `shiftMs` = 32 יום, `uninstrumented` ביום 52 ו-`instrument_fault` ביום 53; ירי חופף בחלקו (שני הירים רצים
  60 יום מלאים לפני קריאה ביום 75): 61 יום ולא 120; ושני ירים נפרדים (קריאה ביום 10 ביניהם): 2 + 15 = 17 יום.
  ב-`page-views-reader.test.ts` שלוש שורות חדשות בטבלת התשובות המתומחרות (60 → 63): כל אחת מה-fixtures החדשות עוברת
  את כל הדרך ב-`readPageViews` — שאילתה אחת, `reason: query_api_priced`, הדגל נכתב. אף assertion קיים לא שונה; שונתה
  הערה אחת בבדיקה: "Whole words only" → "Whole tokens only" (תיאור, לא בדיקה).
- **fixtures חדשות** (בצורת גופי השגיאה של DRF ש-PostHog עונה בהם, כמו החמש של הבנייה): `posthog-query-429-quota-code.json`
  (הגוף שהסקירה מדדה), `posthog-query-429-quota-camel.json`, `posthog-query-403-billing-code.json`.
- **תוכנית המוטציות** `mutations/page-views.json` (79 → 84): T61-R4 עד R8 הופנו מחדש לקבוצת המילים (אותה משמעות:
  הסרת קבוצת מילים אחת); T61-R9 (היה "בלי `\b`") הוא עכשיו התאמה כתת-מחרוזת במקום אסימון; T61-R10 (היה "בלי `i`")
  הוא עכשיו אסימונים בלי אותיות קטנות; T61-S8 עוקב אחר `from < deadline`. חדשים: T61-R17 (החזרת ה-regex של הבנייה
  הראשונה), T61-R18 (גוף בלי שבירת camelCase), T61-S26 (`from = startMs`, כלומר סכום), T61-S27 (הסמן לא מתקדם),
  T61-S28 (הסמן קופץ לסוף 60 הימים של הירי). אף רשומה לא נמחקה.

### 3. קבצים ששונו

- `src/revenue/page-views.ts` — `BILLING_WORDS` (`:308-315`), תיעוד `fieldWords` (`:323`), `queryApiPriced` (`:338-349`),
  תיעוד `PricedSuspension.shiftMs` (`:517-521`) ו-`pricedSuspension` (`:530-537`), הלולאה (`:549-566`).
- `src/__tests__/revenue/page-views.test.ts`, `src/__tests__/revenue/page-views-reader.test.ts`.
- שלוש fixtures חדשות תחת `src/__tests__/revenue/fixtures/`.
- `src/__tests__/revenue/mutations/page-views.json`, `src/__tests__/revenue/mutations/README.md` (שתי שורות
  `page-views.json`).
- הלוג הזה (הסעיף הזה בלבד).

### 4. החלטות והנחות

- **שני התיקונים לפי נוסח הסקירה, והפסיקה מסכימה איתו.** R1: "403 or 429 whose body names billing, a plan, credits,
  quota or an upgrade" — גוף שאומר `quota_limited` אומר quota. §4(2)(iv): השעיה אחת "from the day R1-R3 fires until the
  fallback's first successful read" — שני ירים לפני אותה קריאה הם השעיה אחת, כלומר איחוד ולא סכום. לא מצאתי מקום
  שבו נוסח הסקירה סוטה מהפסיקה; לא פסקתי על דבר.
- **מעבר לנוסח הסקירה:** הבדיקה של שני ירים נפרדים ו-T61-S28 — בלעדיהם המוטציה "הסמן קופץ ל-`endMs`" שורדת (בשני
  רצפי הסקירה היא שקולה). `plan_required`, `upgradeRequired` ו-`CREDITS_EXHAUSTED` נבדקים כמחרוזות בתוך הבדיקה ולא
  כקבצים; הסקירה ביקשה fixtures לשלושה (`quota_limited`, `quotaLimited`, `billing_limit_exceeded`), והם קבצים.
- **R1 רחב יותר עכשיו:** גוף 403/429 שיש בו אסימון כמו `plan` בתוך קוד או שם מחלקה ב-CSS של עמוד CDN יורה. זה בכיוון
  שהבונה כבר קיבל (ירי נראה לעין שמנוקה ביד), ולא שיניתי את רשימת המילים.
- **לא הוחלו (הערות לשרשור הראשי, כפי שההוראה אומרת):** ההערות שסותרות את הכשל של 60 יום (`:58`, `:447` ו-`gapNote` ב-`:654`);
  בלוק `queryApi` שאי אפשר לקרוא (הקורא נסגר, השערים בלי השעיה); `clearedOn` עתידי ומחיקה ידנית; צורות הסטייה שהבונה
  תיעד; דרך לרשום ירי של R2/R3; רבים חסרים ב-`BILLED_FIELD_WORDS`; הבדיקה שתלויה בשם קובץ ה-temp; ועץ הסימולציה
  הישן `/tmp/sim-tree.pIhgn4` שעדיין על הדיסק (מותר לי למחוק רק את תיקיית ה-scratch שלי).
- `scripts/pytest-product.sh chart-explainer` לא הורץ: זו בניית הקורא, לא בניית המוצרים, ושום קובץ Python לא השתנה.

### 5. שגיאות וניסיונות שנכשלו

- `mutate.mjs --check` לפני ה-commit: exit 1, "27 of 84 would apply" — הוא מסרב לקובץ עם שינויים שלא נשמרו (בצדק:
  `git checkout` היה מוחק אותם). אחרי ה-commit: 84 מתוך 84.
- `xxd` לא מותקן בסביבה; בדקתי את שורת הסיום של ה-fixtures ב-`tail -c1 | od -c`.
- `sleep 240` בחזית נחסם בידי הסביבה; חיכיתי לריצת המוטציות בלולאת `until` ברקע.

### 6. בדיקות וולידציה

| בדיקה | exit | תוצאה |
| --- | --- | --- |
| `scripts/verify.sh` על שלושת הקבצים | 0 | 155 בדיקות עוברות |
| `scripts/verify.sh` המלא | 0 | 210 שניות; 80 קבצים, 2873 עוברות, 2 מדולגות (מדולגות כבר בחבילה) |
| `mutate.mjs --check` | 0 | 84 מתוך 84 ניתנות להחלה |
| התוכנית ב-`sim-tree.sh` (`ede6475`) | 0 | 488 שניות, חלקן לצד verify.sh; 84 מתוך 84 נהרגו |
| `scripts/verify.sh` על שלושת הקבצים, אחרי המיזוג השני | 0 | 157 בדיקות עוברות |
| `scripts/verify.sh` המלא, אחרי המיזוג השני | 0 | 164 שניות; 80 קבצים, 2886 עוברות, 2 מדולגות |
| `scripts/verify.sh` על שלושת הקבצים, אחרי המיזוג השלישי | 0 | 159 בדיקות עוברות |
| `scripts/verify.sh` המלא, אחרי המיזוג השלישי | 0 | 158 שניות; 80 קבצים, 2889 עוברות, 2 מדולגות |
| greps של פרטיות על ה-diff (התבנית של שם הבעלים, `phc_`/`phx_` עם 10+ תווים, כתובות דוא"ל) | — | 0 שורות כל אחד |

T61-R17 ו-T61-S26/S27 הן ההוכחה שהבדיקות החדשות נכשלות על הקוד של `a97357a`: כל אחת מחזירה את הקוד הישן בנקודה אחת.

### 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- כתבתי שוב סקריפט scratch שמחיל רשימת find/replace מ-JSON רק אם כל find מופיע פעם אחת בדיוק — אותו צורך שהבונה
  תיעד בסעיף 7. כלי כללי `scripts/exact-edit.mjs` (כמו `loop-edit.mjs` אבל לקוד ולבדיקות) יחסוך אותו בכל קיפול.
- הפניה מחדש של רשומות מוטציה כשתיקון משנה שורה: `mutation-plans.test.ts` מוצא אותן, אבל את התיקון עושים ביד.

### 8. על מה בוזבזו אסימונים, לפי פעולה

- תזכורות רשימת המשימות של השרשור הראשי חזרו כמה פעמים (כ-3 אלף אסימונים בכל פעם), בלי תועלת לסוכן התיקון.
- קריאה של בלוקי הבדיקות הארוכים (כ-8 אלף) — נחוצה, כדי למקם את הבדיקות החדשות ליד הקיימות ולא לשבור עוגנים.
