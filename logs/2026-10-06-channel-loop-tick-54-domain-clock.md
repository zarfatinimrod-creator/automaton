# 2026-10-06 — לולאת הערוצים, טיק 54: שעון הדומיין (הבונה, קיפולי RULING-2026-10-06-domain-clock)

## 1. מה המשתמש ביקש

הסקריפט של הטיק שלח בונה Opus לבצע את הקיפולים 1-6 של `research/channel-loop/RULING-2026-10-06-domain-clock.md`
(שורה 22 של `logs/FABLE_QUEUE.md`), ב-worktree נפרד על ענף `build/tick54-domain-clock` מתוך
`claude/new-session-j071dx`, בלי לגעת ב-checkout הראשי, ב-`logs/CHECKPOINT.md`, ב-`logs/CHANNEL_LOOP.md`,
ב-`logs/FABLE_QUEUE.md`, ב-`MISSION.md`, ב-`CLAUDE.md`, בקובץ הפסיקה עצמו או בלוג קיים. הפסיקה (B): פריסת הדומיין
היא שעון חדש לפי PUBLISH-10 ולא מכשיר חדש, ולכן המועד של M-instrument (יום 21) רץ מ-D0 בלבד; בתקופת הדומיין
לא חוזרים `uninstrumented` או `instrument_fault`, שבוע שלא נכתב הוא `reader_down` כשהוא באיחור, והריגה של 8 שבועות
מדודים היא `kill` בלי קשר ליום שבו נכתבו השבועות. בסדר: להעתיק את הפסיקה ולבצע לה commit לבד, לממש את הקיפולים,
לכתוב תוכנית מוטציות חדשה ולהריץ אותה, לאמת לפי קודי יציאה, ולכתוב את הלוג הזה.

## 2. הפעולות המרכזיות שביצעתי

- יצרתי את ה-worktree בבסיס `5f4853a`, ובדקתי עם `git log --oneline -1` ו-`ls products/ src/revenue/` ששתי
  התיקיות קיימות. אחר כך יצרתי קישור ל-`node_modules` של ה-checkout הראשי.
- העתקתי את קובץ הפסיקה וביצעתי לו commit לבד (`86d7d7d`). בזמן שעבדתי, הענף הראשי קיבל commit משלו עם אותה
  פסיקה (`79e92eb`, אותו עץ בדיוק). לכן ביצעתי rebase ל-`claude/new-session-j071dx`: git דילג על `86d7d7d` כי
  כבר הוחל, ועכשיו הענף הוא `79e92eb` ומעליו commit אחד של הקיפול.
- TDD: קודם כתבתי את הבדיקות החדשות (קיפולים 2 ו-3) והרצתי אותן על הקוד הישן. שלוש נכשלו כצפוי: יום 5 החזיר
  `uninstrumented` במקום `continue`, ההריגה עם קורא שהתחיל באיחור החזירה `instrument_fault` במקום `kill`, וה-tick
  ביום 21 של הדומיין החזיר `instrument_fault` במקום `reader_down`.
- קיפול 1 בקובץ `src/revenue/page-views.ts`:
  - `instrumented` נבדק מול המועד רק כש-`period === "netlify"`. בתקופת הדומיין נבדקות שתי כתיבות רצופות בלי מועד.
  - בלוק הדומיין עלה מעל בלוק `!instrumented`.
  - להערת ה-`continue` נוסף `; N week(s) measured`.
  - ל-`gapNote` נוסף סוג שלישי, `"domain"`. ההערות של תקופת netlify נשארו זהות בייט אחר בייט.
  - הניסוח עודכן בכותרת, ב-`instrumentByDay`, בשני תיאורי ה-verdict ובשדה `instrumented`.
- קיפול 4: עדכנתי את `products/il-biz-tools/README.md` (המשפט ש-`page-views.test.ts` בודק נשאר זהה), את הערת
  הכותרת של `src/revenue/page-views-reader.ts`, ואת `_comment` בקובץ `state/colony/page-view-clock.json`.
- קיפול 5: כתבתי תוכנית חדשה, `src/__tests__/revenue/mutations/page-views.json`, עם M1-M3 מהפסיקה ו-M4-M5 מהבנייה
  הזו. מחרוזות ה-find הועתקו מהקובץ עצמו בסקריפט קטן בתיקיית ה-scratch, כדי שלא תהיה שגיאת העתקה. `--check`
  יצא 0. ההרצה המלאה עברה דרך `scripts/sim-tree.sh` מה-commit, וכל 5 המוטציות נהרגו ב-23 שניות. רשמתי את התוכנית
  ואת הזמן ב-`mutations/README.md`.
- קיפול 6: הרצתי את האימותים שבסעיף 6 בהמשך.

## 3. קבצים/מערכות ששונו

- `src/revenue/page-views.ts`: הלוגיקה של `evaluatePageViewGates` (סדר הבלוקים, `instrumented`, הערת הדומיין
  ב-`gapNote`, הספירה בהערת ה-`continue`) והתיעוד שלה.
- `src/__tests__/revenue/page-views.test.ts`: שתי בדיקות חדשות בתוך ה-`describe` של הדומיין: "M-instrument runs from
  D0 only: the domain deploy is a new clock, not a new instrument" ו-"a reader that starts late cannot hide a measured
  kill". בדיקות קיימות לא שונו.
- `src/__tests__/revenue/page-views-reader.test.ts`: בדיקה חדשה אחת. שעון דומיין בלי `POSTHOG_READ_KEY` ביום 21
  של הדומיין מחזיר `reader_down`, ובחוסמים יש `page views il-biz-tools: reader down` ואין `instrument fault`.
- `src/__tests__/revenue/mutations/page-views.json`: קובץ חדש, 5 רשומות.
- `src/__tests__/revenue/mutations/README.md`: שורה בטבלת התוכניות ושורה בטבלת זמני הריצה.
- `products/il-biz-tools/README.md`, `src/revenue/page-views-reader.ts` (הערה בלבד), `state/colony/page-view-clock.json`
  (`_comment` בלבד).
- `logs/2026-10-06-channel-loop-tick-54-domain-clock.md`: הלוג הזה.
- לא נגעתי ב-`runner.ts` וב-`portfolio.ts`, כפי שהפסיקה קובעת, וגם לא ב-checkout הראשי.

## 4. החלטות והנחות משמעותיות

- **הערת `reader_down` נפרדת לתקופת הדומיין.** הפסיקה לא מנסחת אותה במפורש, אבל הבדיקות שלה מחייבות אותה. ביום
  21 הבדיקה דורשת שלא יופיע `/restart the clock/`, ובבדיקת ה-tick לא יכול להופיע `/instrument fault/` בחוסמים.
  ההערה הקיימת (`blocker`) כוללת את שני הביטויים: "only a week that cannot be read at all is an instrument fault …
  restart the clock (a new d0 …)". לפי נימוק 5 של הפסיקה, הפעלה מחדש עם d0 חדש לא מזיזה את עוגן הדומיין. לכן הסוג
  `"domain"` אומר שהשעון החדש אינו מכשיר חדש, שאין מה שיפעיל אותו מחדש, ושהיום שלו לא מתוארך מחדש. הנוסח של
  netlify לא השתנה. רק הקריאה `gapNote(late, false)` הפכה ל-`gapNote(late, "diagnostic")`, עם אותה מחרוזת בדיוק.
- **בבדיקת ה-tick השתמשתי ב-`/instrument fault/` המילולי של הפסיקה,** ולא בגרסה עם הקידומת שיש בבדיקת netlify
  הקיימת. זו הבדיקה המחמירה מבין השתיים.
- **שתי שורות בכותרת שהפסיקה לא ציטטה עודכנו,** כי אחרי השינוי הן היו שגויות:
  - שורת "Instrumented" אמרה ששום verdict לא נקרא לפני שתי כתיבות, אבל בדומיין חוזרים `continue` ו-`reader_down`
    גם בלי כתיבות.
  - "A reader that stops (in either period, once instrumented)" אמרה שהקורא נחשב למושבת רק אחרי שהשעון instrumented,
    אבל בדומיין `reader_down` מתחיל מהשבוע הראשון שבאיחור.
- **הוספתי ציפיות מעבר לרשימה של הפסיקה,** כולן בתוך ההתנהגות שקיפול 1 מגדיר:
  - `instrumented` true בבדיקת ההריגה המאוחרת.
  - `; 0 week(s) measured` ביום 5 ו-`; 3 week(s) measured` ביום 25.
  בלי ציפיות אלה M5 היה שורד, ו-M1 היה נהרג רק בבדיקת יום 25.
- **מה בפועל הרג כל מוטציה:**
  - M1 (המועד בשתי התקופות): נהרג בשתי הבדיקות החדשות של `page-views.test.ts`, דרך `instrumented`.
  - M2 (בלוק הדומיין חוזר מתחת ל-`!instrumented`): נהרג במקרה יום 5 (`uninstrumented`) ובבדיקת ה-tick
    (`instrument_fault`). בניגוד לתחזית של הפסיקה, בדיקת ההריגה המאוחרת **לא** נכשלת תחת M2 לבדה. תחת M2,
    `instrumented` של הדומיין מחושב בלי מועד, ולכן ההריגה עדיין חוזרת. היא נכשלת רק כש-M1 ו-M2 מופעלות יחד, כלומר
    בקוד הישן.
  - M3 (בלי `overdue.length`): 4 בדיקות בשני הקבצים.
  - M4 (ההערה של netlify בדומיין): נהרג ביום 21 ובבדיקת ה-tick.
  - M5 (בלי הספירה): נהרג ב-`page-views.test.ts`.
- **rebase במקום שני commits זהים.** ה-commit `86d7d7d` שלי ו-`79e92eb` של הענף הראשי מוסיפים אותו קובץ עם אותו blob.
  מיזוג היה עובר בלי קונפליקט, אבל היסטוריה בלי כפילות עדיפה, והענף שלי עוד לא נדחף. הפסיקה נמצאת בהיסטוריה לפני
  הקיפול, כפי שהבריף דרש.
- **`node_modules` של המוצר.** ב-worktree לא היה `products/il-biz-tools/node_modules`. יצרתי קישור סימבולי ל-node_modules
  של ה-checkout הראשי, כמו בשורש. זו לא התקנה, והקישור מוסתר על ידי `.gitignore` בשורש (`node_modules`). העתק המוצר
  שהבדיקה בונה מדלג על `node_modules`.
- הוספתי את `page-views.json` לרשימת התוכניות החובה ב-`mutation-plans.test.ts` (בתיקון הסקירה; ראו "Review fixes").
  בגרסה הראשונה של הלוג נכתב כאן שטיקים 52-53 לא הוסיפו את שלהם, וזה נכון רק לחצי: ה-commit `d643dba` של טיק 52
  הוסיף לרשימה את `prize-apply-reading.json` ואת `render-dispatch.json`, ורק שתי התוכניות של טיק 53
  (`address-kinds.json`, `remask-run.json`) חסרות בה. `describe.each` מריץ `--check` רק על תוכנית שעדיין קיימת,
  כך שבלי הרשימה מחיקת התוכנית לא הייתה נכשלת באף בדיקה.
- תוכנית `page-views.json` מריצה את שני קבצי הבדיקה של צפיות הדף בלבד, כפי שהפסיקה ביקשה.

## 5. שגיאות וניסיונות שנכשלו

- לא היו ניסיונות שנכשלו. ההרצה האדומה הראשונה הייתה מכוונת (TDD).
- הענף הבסיסי זז באמצע העבודה (`79e92eb`, אותה פסיקה בדיוק). זה התגלה כשהרצתי `git diff --name-only
  claude/new-session-j071dx` לפני בדיקת המזהים: הפסיקה לא הופיעה ברשימה. בדקתי את `git ls-tree` ואת `git diff --stat`
  בין שני ה-commits, והעצים יצאו זהים. משם ה-rebase.

## 6. בדיקות ופעולות ולידציה

כל שלב נשפט לפי קוד היציאה שלו:

| שלב | פקודה | קוד יציאה | תוצאה |
| --- | --- | --- | --- |
| אדום (לפני הקוד) | `npx vitest run` על שני קבצי צפיות הדף | 1 | 3 נכשלו, 68 עברו (הצפוי) |
| ירוק | אותה פקודה אחרי קיפול 1 | 0 | 71/71 |
| אימות ממוקד | `scripts/verify.sh` על `page-views.test.ts`, `page-views-reader.test.ts`, `runner.test.ts`, `mutation-plans.test.ts` | 0 | typecheck 0; 4 קבצים, 139 בדיקות |
| בדיקת המוצר | `cd products/il-biz-tools && npx vitest run tests/option-c-site.test.js` | 0 | 15/15 (הבדיקה קוראת את ה-README) |
| בדיקת התוכנית | `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/page-views.json` | 0 | 5 of 5 would apply |
| הרצת המוטציות | `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan …/page-views.json` | 0 | 5 נהרגו, 0 שרדו, 23 שניות; ה-baseline עבר פעמיים (2.9 ו-2.1 שניות) |
| בדיקת מזהים | `git grep -n -i -E` על הקבצים שבהפרש (הדפוס כתוב בבריף) | 1 | לא הודפס כלום |
| אימות מלא | `scripts/verify.sh` (חבילת revenue כולה) | 0 | typecheck 0; 79 קבצים, 2569 עברו ו-2 דולגו (2571), 71 שניות; רץ לפני שהלוג ושורת הזמן נכנסו ל-commit, כשהקבצים כבר היו בעץ |

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **מוטציה שמחליפה את הסדר של שני בלוקים** (M2) נבנתה ידנית: find הוא שני הבלוקים הצמודים, ו-replace הוא אותם בלוקים
  בסדר הפוך. כתבתי סקריפט קטן ב-scratch שחותך את הבלוקים מהקובץ לפי עוגנים. כדאי ש-`mutate.mjs` או כלי עזר לידו
  יבנו רשומת swap מתוך שני עוגנים, כדי שלא יעתיקו בלוק ארוך ל-JSON ביד.
- **בריף של worktree שמבקש לבצע commit לקובץ מה-checkout הראשי** עלול להתנגש עם commit של השרשור הראשי לאותו קובץ.
  כאן זה קרה. הסקריפט שכותב את הבריף יכול לבדוק `git ls-tree <base> <path>` ממש לפני השיגור, ואם הקובץ כבר שם,
  לוותר על שלב ההעתקה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **קריאת `page-views.ts` המלאה (כ-30KB):** הפלט נשמר לקובץ ונקרא פעם שנייה. אפשר היה לקרוא מראש רק את הכותרת
  ואת `evaluatePageViewGates`, אבל הפסיקה הפנתה כמעט לכל הקובץ.
- **תזכורות חוזרות של רשימת המשימות של השרשור הראשי:** הן הופיעו כמה פעמים באמצע העבודה ואינן שייכות לבונה. זה
  רעש בהקשר שאין לו פעולה.
- **קריאת `mutate.mjs` (כ-80 שורות כותרת) ו-`sim-tree.sh`:** הייתה הכרחית כדי לא לשבור את הנעילה. כל השאר היה
  ממוקד: בדיקות, הפרשים וקבצי תיעוד בטווחי שורות.

## Review fixes

הסקירה (Opus) מצאה ממצא אחד מסוג "fix", שלוש הערות ("note"), ואף ממצא חוסם.

- **fix: `page-views.json` חסר ברשימת התוכניות החובה ב-`mutation-plans.test.ts`.** `describe.each` בודק רק תוכנית
  שעדיין קיימת, ולכן מחיקת התוכנית עברה בכל הבדיקות. הוספתי את `"page-views.json"` לרשימה, בסדר האלפביתי, אחרי
  `mutate.json`. תיקנתי גם את המשפט בסעיף 4 שטען שטיקים 52-53 לא הוסיפו את שלהם: טיק 52 (`d643dba`) הוסיף את שתי
  התוכניות שלו, ורק שתי התוכניות של טיק 53 (`address-kinds.json`, `remask-run.json`) חסרות. את שתיהן לא הוספתי;
  הן מחוץ להיקף של הענף הזה, והן פריט פתוח לשרשור הראשי.
  - בדיקה שהתיקון עובד: ב-`scripts/sim-tree.sh` מחקתי את התוכנית והרצתי את `mutation-plans.test.ts`. על הקוד החדש:
    קוד יציאה 1 (בדיקת הרשימה נכשלה, 24 עברו). על ה-commit הקודם (`--ref HEAD~1`): קוד יציאה 0 (25 עברו). העץ שנשמר
    אחרי הכישלון נמחק לפי הנתיב המדויק שלו.
- **note: שני משפטים ב-`products/il-biz-tools/README.md` (בערך שורות 373 ו-384-386) רופפים לתקופת הדומיין.** לא
  שיניתי. המשפט השני ננעל מילה במילה בבדיקה שהפסיקה ציוותה לשמור, ולכן זו שאלת ניסוח ללוח.
- **note: הזנב "nothing restarts it" בהערת reader_down של הדומיין חזק מהפסיקה.** לא שיניתי. זו הערה, לא תיקון, והפסיקה
  עצמה ("What would make me wrong") משאירה דרך חזרה ללוח אם המכשיר עצמו משתנה. נוסח רך יותר הוא החלטה ללוח.
- **note: הפסיקה צפתה שבדיקת ה-kill המאוחרת תהרוג את M2, וזה לא קורה.** M2 נהרג בבדיקת יום 5 ובבדיקת הקורא, כפי שדווח
  בסעיף 4. אין שינוי קוד.

אימות אחרי התיקון, כל שלב לפי קוד היציאה שלו:

| שלב | קוד יציאה | תוצאה |
| --- | --- | --- |
| `scripts/verify.sh` על `page-views.test.ts`, `page-views-reader.test.ts`, `runner.test.ts`, `mutation-plans.test.ts` | 0 | typecheck 0; 4 קבצים, 139 בדיקות |
| `scripts/verify.sh` (חבילת revenue כולה) | 0 | typecheck 0; 79 קבצים, 2569 עברו ו-2 דולגו (2571) |
| `node scripts/mutate.mjs --check --plan …/page-views.json` | 0 | 5 of 5 would apply |
| `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan …/page-views.json` | 0 | 5 נהרגו, 0 שרדו (בסקירה לא שרדה אף מוטציה, וזו הרצה חוזרת לאישור) |
