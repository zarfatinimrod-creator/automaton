# 29.9.2026 — מסלול הקריאה של צפיות הדפים (il-biz-tools / pcn874)

## 1. מה המשתמש ביקש

משימת בנייה מסקריפט הזרימה (סוכן Opus בעץ עבודה מבודד), לפי פסיקת לוח הלולאה
`research/channel-loop/RULING-2026-09-29-loop.md` (b), "Tick 16-17, instruments": לחבר את מסלול הקריאה של ה-KPI
"צפיות דפים שבועיות" של il-biz-tools ו-pcn874, כך שכלל ההריגה "פחות מ-100 צפיות בשבוע" וקריאת ההגעה של D0+56
("פחות מ-5 צפיות זרים → השהיה") יוכלו לרוץ מיום הפריסה. בפירוט: מודול טהור שהופך תוצאות שאילתה של PostHog לספירה
שבועית לפי נתיב (pcn874.html לקו pcn874, שאר הדפים ל-il-biz-tools, בלי `/preview/` ובלי דפי noindex); קורא שקורא ל-API
השאילתות של PostHog עם מפתח אישי מסוד סביבה, ושהוא no-op שמחזיר "not configured" כשחסר מפתח או מזהה פרויקט; חיבור לשלב
ה-KPI של טיק המושבה (שורת KPI לכל קו לכל שבוע); הערכת כלל ההריגה שקוראת אותן רק אחרי שתי כתיבות שבועיות רצופות; בדיקות
עם fetch מזויף ו-fixtures בצורת התשובה המתועדת; עדכון README של il-biz-tools; יומן בעברית; commit. ₪0: לא ליצור שום
דבר חי, לא לקרוא ל-API חי, לא לפתוח חשבון, לא לפרסם.

## 2. הפעולות המרכזיות שביצעתי

- בדקתי את הבסיס: עץ העבודה עמד על `a655ff8`, שאינו צאצא של `5edc1ab`; עשיתי `git reset --hard` ל-
  `origin/claude/new-session-j071dx` (עכשיו `5edc1ab`, BASE_OK). התקנתי תלויות (`pnpm install --frozen-lockfile`, ו-`npm ci`
  ב-il-biz-tools).
- קראתי את דפוסי הקוראים הקיימים: `measurements.ts` (Apify, Algora → `recordKpi`), `youtube-analytics.ts` (אריתמטיקה טהורה
  מול סקריפט שמביא), מחברי הלדג'ר (`isConfigured` לפי משתנה סביבה), `runner.ts` (שלב ה-KPI בתוך סנכרון הלדג'ר),
  `colony.yml`, ואת הפסיקות: floors שורה 9 (M-instrument, M-reach, הרחבה אחת), lines (f) (pcn874 רוכב על אותה קריאה),
  BOARD-LOOP PUBLISH-10 (שעון 8 השבועות/100 צפיות מתחיל בפריסת הדומיין), CHANNEL_LOOP §2 ("Instrumented": 2 כתיבות רצופות).
- קראתי תיעוד: Context7 `/posthog/posthog.com` — `contents/docs/sql/index.mdx` (נקודת הקצה `POST /api/projects/:id/query/`,
  מבנה `HogQLQueryResponse`: `results`, `columns`, `types`, `hogql`, `clickhouse`), `docs/api/queries.mdx` (מפתח אישי עם
  הרשאת query read), `docs/data-warehouse/sql` (ברירת מחדל LIMIT 100), `docs/sql/expressions.mdx` (תאריך מילולי מתפרש באזור
  הזמן של הפרויקט; `toDateTime('…', 'UTC')`), `docs/api/index.mdx` (מגבלת 2,400 שאילתות לשעה), `tutorials/react-charts.md`
  (ה-scope "Performing analytics queries"). את `$host` ו-`$pathname` אימתתי בקוד של posthog-js מ-raw.githubusercontent.com
  (`packages/browser-common/src/utils/event-utils.ts:356-357`).
- כתבתי `src/revenue/page-views.ts` (טהור): מיפוי נתיב → דף → קו, החרגות עם סיבה, שבועות מעוגנים ליום העוגן (שבוע 1 =
  [D0, D0+7)), בניית שאילתת HogQL לשבוע אחד עם UTC מפורש ו-LIMIT משלה, `countWeek` שמסרב לתשובה חתוכה/שגויה, ו-
  `evaluatePageViewGates` עם השערים.
- כתבתי `src/revenue/page-views-reader.ts`: קריאת `site.json`, רשימת הדפים (noindex מתוך המקור, ודפים שהבנייה עוצרת —
  בשאלת `publish-gate.js` של המוצר עצמו), קובץ השעון `state/colony/page-view-clock.json`, קריאה ל-PostHog, כתיבת שורת KPI
  לכל קו לכל שבוע (עם תאריך סוף השבוע), וקריאת הסדרה בחזרה לשערים.
- חיברתי ל-`runner.ts`: הקורא רץ בתוך שלב ה-KPI (עם סנכרון הלדג'ר), השערים רצים בכל טיק; תקלת מכשיר ובעיית שעון הן
  blockers; שורת דוח לקורא ושורה לכל קו. הוספתי ל-`colony.yml` את `POSTHOG_READ_KEY` (secret) ו-`POSTHOG_PROJECT_ID` (vars).
- הוספתי תווית KPI (`PAGE_VIEW_KPI_LABEL`/`RULE`) לשני הקווים ב-`portfolio.ts`, כך שהקריאה מודפסת עם התווית בדוח ובלוח.
- עדכנתי את README של il-biz-tools (הפסקה בשורות 352-356 לשעבר, שורת הטבלה של pcn874, שורת `posthog.projectId` בטבלת
  התצורה, וסעיף 4 ברשימת "Owner steps").

## 3. קבצים/מערכות ששונו

- חדש: `src/revenue/page-views.ts`, `src/revenue/page-views-reader.ts`, `state/colony/page-view-clock.json` (שני הקווים,
  הכול null), `src/__tests__/revenue/page-views.test.ts`, `src/__tests__/revenue/page-views-reader.test.ts`,
  `src/__tests__/revenue/fixtures/posthog-hogql-pageviews.json`, `src/__tests__/revenue/fixtures/posthog-hogql-empty.json`,
  היומן הזה.
- שונה: `src/revenue/runner.ts` (שלב ה-KPI, השערים, שורות הדוח, `describePageViewGate`), `src/revenue/ledger.ts`
  (`recordKpi` מקבל `capturedAt` אופציונלי), `src/revenue/portfolio.ts` (תוויות KPI), `.github/workflows/colony.yml`
  (שני משתני סביבה), `products/il-biz-tools/src/config/site.json` (`posthog.projectId: ""`), `products/il-biz-tools/README.md`,
  `products/il-biz-tools/tests/pcn874-page.test.js` (הכותרת והבדיקה של מיפוי pcn874), `src/__tests__/revenue/loop.test.ts`
  (בדיקת "קו בלי תוויות" עברה מ-pcn874 ל-oss-bounties, כי ל-pcn874 יש עכשיו תווית).
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`. לא נוצר שום
  דבר חי: לא פרויקט PostHog, לא מפתח, לא secret, לא קריאה ל-API של PostHog (גם לא דרך המחבר).

## 4. החלטות והנחות משמעותיות

- **הקורא רץ בתוך הטיק, לא כ-workflow נפרד שכותב JSON.** המשימה ביקשה חיבור לשלב ה-KPI של הטיק; זה גם הכותב היחיד של
  `colony.db`, כך שאין מרוץ כמו אצל Apify/Algora. הוא מבצע שאילתה אחת לכל שבוע שהסתיים לכל עוגן (לרוב שתיים-שלוש בשבוע),
  ובשאר הטיקים לא קורא לשום דבר.
- **שבוע מעוגן ל-D0, לא שבוע ISO.** כך "56 הימים מ-D0" הם בדיוק שבועות 1-8 ו"שבועות 5-8" בדיוק מה שהפסיקה אומרת. שבוע
  נקרא 6 שעות אחרי סופו (הבחירה שלנו, לא נתון מתועד) כדי לא לפספס אירועים בצינור הקליטה.
- **זהות השורה ביחידה (`unit`):** `page views · <host> · week <n> from <anchor>`, ו-`captured_at` = סוף השבוע. כך שעון
  שהופעל מחדש (D0 חדש) או מעבר לדומיין הם סדרה חדשה, ושורות ישנות לא נקראות בטעות תחת עוגן חדש.
- **השערים:** אין פסיקה לפני שתי כתיבות רצופות; אין שתיים עד D0+21 → תקלת מכשיר (לא כישלון); D0+56: פחות מ-5 בשבועות 1-8 →
  pause, ממוצע 100+ בשבועות 5-8 → pass, ביניהם → הרחבה אחת ל-D0+112. **פרשנות שלי:** "אותה קריאה" ב-D0+112 היא על 56
  הימים שמסתיימים ב-D0+112 (שבועות 9-16), וביניים שוב → `extension_exhausted` ("אין הרחבה שנייה: הלוח פוסק") — הפסיקה לא
  אומרת מה קורה בביניים בפעם השנייה, ולא המצאתי תוצאה. שבוע חסר בתוך קריאה שהגיע מועדה → תקלת מכשיר, אף פעם לא אפס.
- **כלל "פחות מ-100 בשבוע 8 שבועות רצופים" רץ רק על השעון שמתחיל בפריסת הדומיין** (PUBLISH-10, ומאושר שוב ב-floors שורה 9
  סעיף 4), לשני הקווים. המשפט "so the 100-view kill can run from D0" בפסיקת הלולאה פורש כך: המכשיר קיים מ-D0, וכל כלל רץ
  על השעון שלו. בתקופת netlify.app הקווים נשפטים רק ב-M-instrument וב-M-reach.
- **פסיקה היא קריאה ללוח, לא פעולה.** שום דבר לא משנה סטטוס של קו (כמו ה-boardReading של Algora): הריגה והשהיה הן של
  ישיבת Fable. רק תקלת מכשיר נכנסת ל-blockers; שאר הפסיקות מודפסות בדוח.
- **מה נספר:** רק ה-host הקנוני של `siteUrl` (תצוגות מקדימות וענפים של Netlify מוחרגים בשאילתה), רק דפים שהאתר מגיש כפי
  שהם ומתיר לאינדקס. דפים שהבנייה עוצרת נקבעים בשאלת `publish-gate.js` של המוצר עצמו (ייבוא דינמי), כדי שהקורא והבנייה
  לא יחלקו. לא סיננתי לפי `$lib`: ב-posthog-js הערך ב-browser-common הוא `'browser-common'` והערך בחבילת הדפדפן לא אומת —
  סינון שגוי היה מאפס את הספירה. לכן התווית אומרת שזה חסם עליון.
- **"counter_off":** אם `posthog.projectKey` ריק, הקורא לא קורא גם כשהמפתח קיים — שבוע של אפסים שאף אחד לא מדד אינו קריאה.
- **המפתח נשלח רק ל-`eu.posthog.com`/`us.posthog.com`** לפי ה-`apiHost` של האתר, ומזהה הפרויקט חייב להיות ספרות בלבד.
- **מי יוצר מה (בלי ליצור כלום):** פרויקט PostHog, ה-`phc_` וה-`projectId` — עבודת סוכן דרך מחבר PostHog המחובר לסשן (כך
  הקצה הלוח: `research/colony-sweep/BOARD.md` §6.3, BOARD-LOOP דרגה 2, פעולה ראשונה (4)). `POSTHOG_READ_KEY` — מפתח אישי
  נוצר בהגדרות של משתמש מחובר; לא בדקתי אם חשבון המחבר יכול להנפיק (זו קריאה חיה), והדבקת secret למאגר דורשת מנהל מאגר,
  כלומר היום את ישיבת צעד 6 של הבעלים. **הוא לא ברשימת הבעלים**, ולא הוספתי אותו: זו הצעה לישיבת Fable הבאה.
- **לא נבנה:** ה-rewrite של `/preview/*` ב-`netlify.toml` (הקורא כבר מחריג את הנתיב); האירוע `pcn874_appendixB_refused`
  מפסיקת lines (g) ("כשהמונה מחובר") — מחוץ להיקף, נשאר לטיק הבא.

## 5. שגיאות וניסיונות שנכשלו

- הבסיס של עץ העבודה היה ישן (`a655ff8`); תוקן ב-reset כמתואר.
- `pnpm typecheck` נכשל פעם אחת: `period` הוסק כ-`string` במקום האיחוד — תוקן בהערת טיפוס.
- בדיקה אחת שלי נכשלה על רגישות לאותיות (`evidence` מול `d0Evidence`) — תוקן הביטוי בבדיקה.
- `loop.test.ts` נכשל: הבדיקה "קו בלי תוויות" השתמשה ב-pcn874, שקיבל עכשיו תווית בכוונה. הועברה ל-oss-bounties.
- ניסיון לקרוא את `event-utils.ts` בנתיב `packages/browser/...` החזיר 404, ו-API של GitHub לריפו זר חסום בסשן; הנתיב הנכון
  (`packages/browser-common/...`) נמצא דרך Context7 `/posthog/posthog-js`.
- כמה פקודות shell מורכבות נחסמו על ידי מגן עץ העבודה; פוצלו לפקודות פשוטות או הוחלפו בכלי העריכה.

## 6. בדיקות ופעולות ולידציה

- `npx vitest run src/__tests__/revenue/page-views.test.ts src/__tests__/revenue/page-views-reader.test.ts` — 45 עברו (23 + 22).
- `pnpm typecheck` — נקי.
- `npx vitest run src/__tests__/revenue` — 45 קבצים, 1262 בדיקות עברו.
- חבילת il-biz-tools (`npx vitest run` בתיקיית המוצר) — 31 קבצים, 830 בדיקות עברו.
- טיק על עותק של `colony.db` בתיקיית scratch (`scripts/colony.ts tick --no-feed --force --db <copy>`): הדוח מדפיס
  "Page views: not configured — POSTHOG_READ_KEY is not set; no project id …", שורת `no_clock` לכל קו, ותוויות ה-KPI עם
  "no reading yet". בלי blocker חדש. מצב המאגר לא השתנה.
- הבדיקות עם fetch מזויף בלבד; אף בדיקה לא פונה ל-PostHog. ה-fixtures בצורת התשובה המתועדת ב-`docs/sql/index.mdx`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- כתיבת D0 בקובץ השעון ביום הפריסה היא עדיין צעד של הלולאה: הבדיקה הציבורית (runner 200 + grep נקי) כבר קיימת כרעיון
  ב-PUBLISH-8, וכדאי שהיא תכתוב את `d0` ו-`d0Evidence` בעצמה כשהיא עוברת והמונה חי.
- שלושה קוראים (Apify, Algora, צפיות) חוזרים על אותה תבנית "קרא פעם אחת לכל תקופה, שמור סמן, רשום KPI" — שווה פונקציית
  עזר משותפת כשיגיע הרביעי.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת פסיקות ארוכות (loop, lines, floors, PREREG, BOARD-LOOP) כדי למצוא את ארבעת המספרים והשעונים — הכרחי, אבל
  הפסיקות מפוזרות; טבלת שערים אחת לכל קו הייתה חוסכת את רובו.
- חיפוש הנתיב של `event-utils.ts` ב-posthog-js (404, API חסום, ואז Context7) — כ-5 קריאות.
- שאילתת Context7 על `$lib` וקריאת `config.ts` של posthog-js שלא הכריעו את הערך בחבילת הדפדפן; בסוף ויתרתי על הסינון לפיו.
- פקודות shell שנחסמו על ידי מגן עץ העבודה ונשלחו שוב בפיצול.
