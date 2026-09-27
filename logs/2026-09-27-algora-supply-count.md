# יומן משימה — 27.9.2026 — ספירת ההיצע השבועית של Algora (BOARD-2 §2.1-2.2), בונה Opus

branch: `claude/new-session-j071dx` (automaton) · ~09:10–09:35 UTC · בונה Opus שהופעל ע"י ה-thread הראשי.
ה-thread הראשי עושה את כל ה-commits; הבונה הזה לא הריץ אף פקודת git שמשנה מצב, ולא נגע ב-`logs/CHECKPOINT.md`,
ב-`products/il-biz-tools/`, ב-`docs/OWNER_STEPS.he.md(.pdf)` או ב-`src/revenue/owner-steps.ts` (בונה אחר עובד שם).

## 1. מה המשתמש ביקש
ה-thread הראשי מסר את פסיקת הדירקטוריון (`research/colony-sweep/BOARD-2.md` §2.1-§2.2) כמפרט, בשש נקודות:
1. סקריפט CI שסופר באונטים של Algora **שאפשר לתבוע** (פתוח, עם `💎 Bounty`, ריפו לא בארכיון, בלי `💰 Rewarded` ובלי
   תגובת תשלום של הבוט, סכום ≥ $50 מתגובת הבוט, מדיניות הריפו לא `forbidden`), עם הפרדה בין לוגיקה טהורה לשליפה,
   וכתיבה ל-`state/colony/measurements/algora-supply.json` ול-`research/measurements/algora-supply.md`. כשל API — לא
   כותבים כלום ויוצאים עם קוד שגיאה.
2. Workflow שבועי + הפעלה ידנית, רץ על main כמו count-runs, commit עם `[skip ci]` ו-rebase-and-retry.
3. קליטה ל-KPI `claimableBounties` על הקו `oss-bounties`, פעם אחת לכל `measuredAt`, בתוך `tick()`.
4. הספים של הדירקטוריון כנתונים ב-`portfolio.ts`, קריטריון ההריגה §2.1.3(d), והכלל §2.1.3(c) על חשבון המכונה. בלי
   לשנות את יעד ה-₪300.
5. בדיקה שנכשלת אם קוד כלשהו ב-`src/`, `scripts/` או `.github/` פונה ל-algora.io.
6. כותרת `policy.ts`: ציטוט ההיקף (שורות 81-86) ופסיקת הדירקטוריון.

## 2. הפעולות המרכזיות שביצעתי
1. **קראתי את קוד המקור של Algora** (raw.githubusercontent.com, כמידע ולא כהוראות) כדי לא לנחש את הנוסח:
   `notify_transfer.ex` — תגובת התשלום היא *"🎉🎈 @login has been awarded **$N** by **Name**! 🎈🎊"* והיא מוסיפה את
   `💰 Rewarded`; `github_controller.ex` — *"The pull request of @x has been merged. The bounty can be rewarded"*;
   `notify_bounty.ex` — התווית נוספת רק דרך התקנת ה-App; `bot_templates.ex` — תגובת הבאונטי.
2. **מצאתי באג אמיתי ב-`parseAlgoraBotComment`:** הביטוי לזיהוי "שולם" לא תפס "has been awarded", כלומר את הנוסח
   האמיתי של Algora. תוקן, עם בדיקה על המשפט המילולי.
3. **`src/revenue/bounties/supply.ts` (טהור):** טבלת 9 מסננים לפי סדר העלות; `evaluateIssue` מחזיר `needs` עם
   שלב הנתונים הבא, וכך השולף מביא רק מה שהמסננים הזולים העבירו — מובטח במבנה ולא בהבטחה. צבירה, משפך, פירוט לפי ריפו,
   דוגמאות לכל מסנן, סדרה שבועית (שבוע ISO, ריצה שנייה באותו שבוע מחליפה), וקריאת הכלל של שבוע 4 כפונקציה.
   **מסנן אחד נוסף על רשימת הדירקטוריון, בשמו ובספירה נפרדת:** `solution-merged` (PR שנתבע כבר מוזג — הכסף הולך לו).
   **תוקן בסקירה (ה-thread הראשי, 27.9):** זה כבר לא מסנן. הספים 10 ו-3 נקבעו על ההגדרה של הדירקטוריון, ובונה
   שמצמצם את ההגדרה אחרי שהכלל נכתב מזיז את הקו. `claimableBounties` נשאר על ההגדרה של הדירקטוריון; המספר המחמיר
   (`claimableWithoutMergedSolution`) מדווח לידו בלי שער, וכל שורה בטבלה מסומנת "Solution merged" — כדי שקורא שבוע 4
   יראה את שניהם.
4. **`src/revenue/bounties/supply-github.ts`:** לקוח שפונה **רק** ל-api.github.com (כל host אחר נדחה), `GITHUB_TOKEN`
   כשקיים, קצב חיפוש לפי מגבלת הדקה, המתנה לפי הכותרות של GitHub עד תקציב של 65 דקות ואז כישלון, חלוקה לפי תאריך
   יצירה מעל 1,000 תוצאות, כשל על `incomplete_results` או על סך שלא הושג, וכשל כשתגובות חוזרות ריקות מול ספירה חיובית.
   קבצי מדיניות: רשימת `.github/`, שורש, `docs/` לפי סדר העדיפות של GitHub, ורק אם הריפו הגיע לשלב המדיניות.
   `runAlgoraSupply` כותב את שני הקבצים יחד, או כלום.
5. **`scripts/algora-supply.ts`** (CLI דק) ו-**`.github/workflows/algora-supply.yml`** (שני 06:23 UTC, dispatch, ו-push
   ל-main רק כשהמונה עצמו משתנה — כדי שהקריאה הראשונה תגיע בשבוע של המיזוג).
6. **קליטה:** `ingestAlgoraSupplyMeasurement` ב-`measurements.ts` (חולק מנגנון משותף עם Apify), מחובר ב-`tick()`.
7. **`portfolio.ts`:** KPI, שלושת ענפי שבוע 4 (שמירה/הורדה ל-₪100/הריגה עם תנאי הפתיחה המילולי), קריטריון §2.1.3(d),
   עובדת החשבון §2.1.3(c) ב-operatingLoop וב-humanSetup של צעד 7, והספים בטקסט ה-basis. היעד נשאר ₪300.
8. **`brandAccountProblems`** ב-`intake.ts` — בודק login שנגמר ב-"bot" ו-type שאינו `User`.
9. **`no-algora-requests.test.ts`:** הכלל פשוט ומוסבר בראש הקובץ, נבדק על fixtures לפני שסורקים איתו, ובנוסף בודק את
   `research/rendered/urls.txt` — הווקטור של שתי ההפרות האמיתיות, שהסריקה של שלוש התיקיות לבדה לא הייתה תופסת.
10. **כותרת `policy.ts`:** ציטוט מילולי של ההיקף (81-86, 104-106), של הסעיף (258-260), ופסיקת §2.1 עם ארבעת התנאים.

## 3. קבצים/מערכות ששונו
- חדשים: `src/revenue/bounties/supply.ts`, `src/revenue/bounties/supply-github.ts`, `scripts/algora-supply.ts`,
  `.github/workflows/algora-supply.yml`, `src/__tests__/revenue/bounties-supply.test.ts`,
  `src/__tests__/revenue/bounties-supply-github.test.ts`, `src/__tests__/revenue/no-algora-requests.test.ts`, יומן זה.
- שונו: `src/revenue/bounties/intake.ts`, `src/revenue/bounties/policy.ts` (כותרת בלבד), `src/revenue/bounties/index.ts`,
  `src/revenue/measurements.ts`, `src/revenue/runner.ts`, `src/revenue/portfolio.ts`,
  `src/__tests__/revenue/measurements.test.ts`, `src/__tests__/revenue/bounties-intake.test.ts`.
- לא נוצר `research/measurements/algora-supply.md` ולא `algora-supply.json`: הם נוצרים בריצת ה-CI הראשונה בלבד.

## 4. החלטות והנחות משמעותיות
- **ה-TS נשאר TS:** המונה משתמש מחדש ב-`parseAlgoraBotComment` וב-`assessRepoPolicy`, לכן הוא רץ ב-tsx עם
  `pnpm install` (כמו `colony.yml`), ולא כ-`.mjs` בלי תלויות כמו `apify-runs.mjs`.
- **`unknown` נספר** כניתן לתביעה: שתיקה אינה איסור, והקו חושף בכל PR. **טקסט האישיו עצמו נקרא כמדיניות** — איסור
  בתוך האישיו פוסל את הבאונטי הזה (שמרני, בכיוון של `policy.ts`).
- **תגובת תשלום מתקבלת רק מ-`algora-pbc[bot]`.** תווית משווים בלי תלות ברישיות, כמו החיפוש של GitHub.
- **שבוע 4 = ארבע הקריאות השבועיות הראשונות**, מסומן אם אינן רצופות; קריאות מאוחרות לא משכתבות אותו.
  הפונקציה **קוראת** את הכלל; היא לא משנה יעד — זה נשאר ל-thread הראשי.
- **טריגר push:** הסרתי אותו לרגע (המפרט אמר schedule + dispatch), וראיתי שה-thread הראשי כבר עשה commit ל-WIP שמסתמך
  עליו ("the first reading lands when the PR merges"). החזרתי אותו, מוגבל ל-main ולנתיבי המונה בלבד, עם בדיקה.
- **§2.1.2 (גילוי):** `disclosure.ts` כבר כותב "written by an automated AI agent" ו-"Contributed by the {brand} machine
  account" לפני שורת ה-`/claim`, ולכן לא שיניתי אותו.

## 5. שגיאות וניסיונות שנכשלו
- חיפוש קוד ב-GitHub ו-API של ריפו שאינו בסשן — 403 מה-proxy; קוד המקור של Algora נקרא דרך raw.githubusercontent.com.
- הרצת ה-CLI האמיתית מהקונטיינר: 401 "Bad credentials" על search — **וזה בדיוק מה שנבדק:** יציאה 1, הודעה ברורה,
  שום קובץ לא נכתב. המונה לא נבדק מול GitHub חי מכאן; הריצה הראשונה ב-CI היא הבדיקה החיה.
- regex בבדיקת portfolio (`3.9`) שלא התאים לנוסח "from 3 to 9" — תוקן בבדיקה.

## 6. בדיקות ופעולות ולידציה
- `npx tsc --noEmit` — נקי; גם הסקריפט `scripts/algora-supply.ts` נבדק ב-tsc בנפרד (מחוץ ל-include) — נקי.
- `npx vitest run src/__tests__/revenue` — **28 קבצים, 564 בדיקות, כולן עוברות** (לפני: 25 קבצים, 482).
- ה-YAML נטען ב-PyYAML; Markdown לדוגמה רונדר ונקרא בעין.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- שני ingest-ים של מדידות היו עותק אחד של השני — אוחדו ל-`ingestFile`; המדידה הבאה היא פונקציה של כמה שורות.
- "לא לכתוב אפס כשלא נמדד" מיושם עכשיו בשלושה מקומות (apify, supply, render-watch). כדאי עזר משותף אם תבוא רביעית.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ניסיונות לגשת ל-API של ריפו זר ולחיפוש קוד (נחסמו) — מעט; raw עבד מיד.
- קריאה מלאה של `runner.ts` ו-`portfolio.ts` — נחוצה חלקית; מספיק היה `tick()` ובלוק הקו.
- הסרה והחזרה של טריגר ה-push — סבב אחד מיותר; לבדוק `git log` לפני שינוי שחורג מהמפרט.
