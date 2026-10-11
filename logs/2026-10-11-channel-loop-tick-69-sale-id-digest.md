# סבב 69 (11.10.2026): מזהי המכירה של Gumroad בפנקס נשמרים כתקציר sha256 — בניית ה-fold של שורה 26

## 1. מה המשתמש ביקש

המשימה הגיעה מהשרשור הראשי של לולאת הערוצים (סבב 69), כבונה של הבנייה "sale-ids", ב-worktree נפרד. הבסיס: `00d35bc` או
צאצא שלו על `claude/new-session-j071dx`. ההוראה: לבצע את סעיפים 1-9 ו-11 של "Folds for Opus" ב-
`research/channel-loop/RULING-2026-10-11-ledger-sale-ids.md` (שורה 26 של `logs/FABLE_QUEUE.md`) בדיוק כפי שנוסחו:

1. `src/revenue/money.ts`: `DIGESTED_SOURCES`, `STORED_EXTERNAL_ID_RE`, `storedExternalId`, `isStoredForm` (C1, C2).
2. `src/revenue/ledger.ts`: `recordLedgerEntry` מחיל את התקציר ראשון, לפני כל בדיקה, הודעה וחיפוש.
3. `src/revenue/connectors/gumroad.ts`: המחבר רושם `sha256:X`, `sha256:X:refund`, `sha256:X:fee`, ואף שדה לא נושא את
   `sale.id` הגולמי.
4. `src/revenue/heartbeat.ts`: ממצא של המבקר הראשי על שורות gumroad שהמזהה שלהן אינו בצורה המאוחסנת (C4).
5. `src/revenue/tools.ts` ו-`scripts/colony.ts`: הודעות הכפילות מדפיסות את הצורה המאוחסנת; התיאורים והעזרה אומרים זאת.
6. פקודה לקריאה בלבד `colony.ts verify-gumroad` (C3) עם דפדפן משותף `listGumroadSalesSince`, קודי יציאה 0/2/3 ו-`--json`.
7. הבדיקות שהפסיקה מונה בשמן.
8. תוכניות המוטציות (`gumroad.json` חדשה, תוספות ל-`ledger.json` ול-`colony.json`) והשורות ב-README שלהן.
9. מסמכים והערות: `docs/CHAIN_OF_COMMAND.md`, `products/il-biz-tools/README.md`, ההערה על `-f` ב-`colony.yml`.
11. היומן הזה.

סעיף 10 (קובצי הלולאה) שייך לשרשור הראשי ולא נגעתי בו. אסור היה לגעת ב-`owner-report.ts`, `owner-steps.ts`, `portfolio.ts`,
`docs/OWNER_STEPS.he.md`, `terms-verdicts.json`, `ZERO-TESTS.md`, `urls.txt`, בקובצי הלולאה, ב-RULING/SITTING, ב-
`research/measurements/*`, ב-`state/colony/*` וביומנים קיימים. בסוף: הבדיקות הסוגרות של הפסיקה, `scripts/verify.sh` מלא
ביציאה 0, וכל מוטנט נהרג אחרי בסיס עובר.

## 2. הפעולות המרכזיות שביצעתי

- **בדיקת בסיס:** ה-worktree התחיל על `297a20b` (טיק ישן, בלי קובץ הפסיקה). הרצתי `git reset --hard claude/new-session-j071dx`
  ← `00d35bc`; הפסיקה ו-`src/revenue/owner-report.ts` קיימים. קישרתי `node_modules` (symlink לקופה הראשית; `.gitignore`
  מתעלם ממנו). קו בסיס: `ledger`, `loop`, `gumroad-refund-rate` ירוקים (66/66).
- קראתי את הפסיקה כולה, כולל "What this does not decide", ה-REOPEN והבדיקות הסוגרות, ואת הקוד שהיא מצטטת: `gumroad.ts`,
  `ledger.ts`, `money.ts`, `heartbeat.ts` (`runLedgerSync`, `runAudit`), `tools.ts` (`revenue_record`), `scripts/colony.ts`,
  `colony-cli.test.ts`, `loop.test.ts`, `ledger.test.ts`, `gumroad-refund-rate.test.ts`, `mutations/README.md` והתוכניות.
- **`money.ts`:** `DIGESTED_SOURCES = new Set(["gumroad"])`; `STORED_EXTERNAL_ID_RE = /^sha256:[0-9a-f]{64}(?::(?:refund|fee))?$/`;
  `storedExternalId(source, id)`: null נשאר null; מקור שאינו בקבוצה מוחזר כמות שהוא; למקור מתוקצר המזהה נחתך (trim), צורה
  מאוחסנת מוחזרת בלי שינוי (אידמפוטנטי), אחרת `:refund`/`:fee` מופרדים, הבסיס עובר `createHash("sha256")` על בתי ה-UTF-8,
  hex באותיות קטנות, קידומת `sha256:`, והסיומת חוזרת. `isStoredForm(source, id)` לבדיקת C4.
- **`ledger.ts`:** `const externalId = storedExternalId(source, input.externalId?.trim() || null);` אחרי ש-`source` הוקטן; פסקה
  בהערת התיעוד של `recordLedgerEntry` ומשפט בהערה שלפני החיפוש. שום דבר אחר בפונקציה לא זז.
- **`gumroad.ts`:** הוצאתי את בניית הרשומות של מכירה אחת לפונקציה מיוצאת `gumroadSaleEntries(sale, lineId)` (אותה התנהגות;
  `fetchSince` קורא לה), והמזהה בה הוא `storedExternalId("gumroad", String(sale.id))` ועליו `:refund` ו-`:fee`. משפט בכותרת
  הקובץ. הדפדפן המשותף `listGumroadSalesSince({ token, after, productId?, fetchImpl, maxPages })` הורם מ-`readProRefundCount`,
  שקורא דרכו עכשיו (אותן הודעות שגיאה, אותו סדר פרמטרים בשאילתה, אותה תקרה של 100 עמודים).
- **`heartbeat.ts`:** ב-`runAudit`, אחרי ספירת הכפילויות: לכל מקור ב-`DIGESTED_SOURCES`, ספירת השורות עם `external_id` שאינו
  בצורה המאוחסנת, ו-`"N gumroad ledger rows carry a raw external id (RULING-2026-10-11 row 26)"` ל-`chiefFindings` כש-N > 0.
- **`tools.ts` / `colony.ts`:** `Duplicate: …` ו-`Already recorded: …` מדפיסים את `storedExternalId(source, …)`; התיאור של
  `revenue_record` ושל `external_id` והעזרה של `--external-id` אומרים שמזהה gumroad נשמר כתקציר ואפשר להעביר אותו גולמי או
  מאוחסן.
- **`verify-gumroad`:** מודול חדש `src/revenue/gumroad-verify.ts` (`verifyGumroadLedger`, `renderGumroadVerify`) ופקודה ב-
  `colony.ts`, על ידית query-only (שורה נפרדת ב-`rendersOnly`, כדי לא להזיז את ה-find של T64-C6). בלי
  `GUMROAD_ACCESS_TOKEN`: "not configured", שום בקשה, יציאה 2. עם הטוקן: מדפדף ב-`GET /v2/sales?after=<יום לפני השורה
  הוותיקה>` עד הסוף, מחשב לכל מכירה את הרשומות ש-`gumroadSaleEntries` היה רושם, ומשווה: שורה שאף מכירה לא מסבירה (ממצא);
  שורה מותאמת שהסכום, המטבע או היום שלה שונים, ומכירה רשומה ששורת העמלה שלה חסרה (ממצא); שורת החזר שהמכירה שלה לא הוחזרה,
  ומכירה שהוחזרה בלי שורת החזר (ממצא); מכירה ברשימה שאין לה שורה ("unbooked": ספירה, לא ממצא). יציאה 0 נקי, 3 עם ממצאים, 1
  כשהרשימה סורבה או לא שלמה. הפלט: ספירות, צורות מאוחסנות וימים בלבד.
- **בדיקות:** `ledger.test.ts` (a)-(f); `loop.test.ts` (שורות הסנכרון, `revenue_record`, שלוש בדיקות ביקורת); חדש
  `gumroad-connector.test.ts` (7); חדש `gumroad-verify.test.ts` (11); `colony-cli.test.ts` (5, דרך preload של fetch מזויף
  `src/__tests__/revenue/fixtures/fake-gumroad-fetch.mjs`, כך שהפקודה רצה מקצה לקצה בלי רשת).
- **מוטציות:** `gumroad.json` חדשה (15), `ledger.json` +7, `colony.json` +7, `gumroad.json` ברשימה של `mutation-plans.test.ts`,
  ושורות ה-README. commit, `--check` על שלוש התוכניות, ואז כל תוכנית ב-`scripts/sim-tree.sh` משלה.
- **מסמכים:** `docs/CHAIN_OF_COMMAND.md` (שורת `revenue_ledger_sync`, וגם שורת `revenue_audit`), README של il-biz-tools (משפט
  אחד ליד ההערה על מזהי המכירה של המשיב), ההערה על `-f` ב-`colony.yml`.

## 3. קבצים/מערכות ששונו

- `src/revenue/money.ts` — `DIGESTED_SOURCES`, `STORED_EXTERNAL_ID_RE`, `storedExternalId`, `isStoredForm`.
- `src/revenue/ledger.ts` — התקציר מוחל ראשון ב-`recordLedgerEntry`; הערות.
- `src/revenue/connectors/gumroad.ts` — `gumroadSaleEntries`, `listGumroadSalesSince`, `GumroadSalesListing`; `fetchSince`
  ו-`readProRefundCount` דרכם; משפט בכותרת.
- `src/revenue/heartbeat.ts` — ממצא C4 ב-`runAudit`.
- `src/revenue/tools.ts` — הודעת הכפילות והתיאורים של `revenue_record`.
- `src/revenue/gumroad-verify.ts` — חדש: האימות מחדש (C3).
- `scripts/colony.ts` — `verify-gumroad`, `rendersOnly`, הודעת הכפילות של `record`, העזרה.
- `src/__tests__/revenue/ledger.test.ts`, `loop.test.ts`, `colony-cli.test.ts`, `mutation-plans.test.ts` — בדיקות.
- `src/__tests__/revenue/gumroad-connector.test.ts`, `gumroad-verify.test.ts`, `fixtures/fake-gumroad-fetch.mjs` — חדשים.
- `src/__tests__/revenue/mutations/gumroad.json` (חדש), `ledger.json`, `colony.json`, `README.md`.
- `docs/CHAIN_OF_COMMAND.md`, `products/il-biz-tools/README.md`, `.github/workflows/colony.yml` (הערה בלבד).
- היומן הזה. לא נגעתי ב-`state/colony/*`, בקובצי הלולאה, בפסיקות או בקבצים שבניות אחרות מחזיקות.

## 4. החלטות והנחות משמעותיות

- **החיתוך (trim) בתוך `storedExternalId`.** C1 אומר "trimmed as `ledger.ts:450` trims every id". הפנקס חותך לפני הקריאה,
  אבל המחבר מעביר `String(sale.id)` ישר, ולכן הפונקציה חותכת בעצמה למקור מתוקצר: מזהה עם רווח מהמחבר ומזהה חתוך מהיד הם מפתח
  אחד. מזהה שריק אחרי החיתוך הוא null (ואז הפנקס מסרב למכירה בלי מזהה, כמו קודם). למקור שאינו מתוקצר המזהה חוזר בדיוק כפי
  שניתן, כדרישת הפסיקה ("non-digested source → unchanged").
- **`gumroadSaleEntries`.** הפסיקה מנסחת את fold 3 כשלוש עריכות שורה; הוצאתי את שלושתן לפונקציה אחת כי `verify-gumroad` צריך
  לחשב בדיוק את מה שהמחבר רושם (סכום, מטבע, יום, משפחת המזהים). ההתנהגות זהה; בדיקת המחבר מוכיחה את שלוש הרשומות.
- **`fetchSince` עדיין קורא עמוד אחד.** "What this does not decide" 6 משאיר את התיקון לשרשור הראשי ("may queue the fix with fold
  1 … or after"), וההוראה שלי הייתה לבצע את הסעיפים כפי שנוסחו. הדפדפן המשותף קיים עכשיו, כך שהתיקון הוא שורה אחת בבנייה
  הבאה. עד אז ספירת ה-"unbooked" של `verify-gumroad` מודדת את הפער.
- **"unbooked" הוא ספירה בלבד.** הפסיקה: "a finding only when `enable` has opened the sale". אין במאגר שום מצב שרושם ש-`enable`
  רץ (`site.json` מחזיק `productId`, לא "enabled"), ולכן לא המצאתי מתג; הספירה מודפסת ואינה ממצא. כשיהיה מצב כזה, זו שורה
  אחת ב-`gumroad-verify.ts`. לא בטוח שזה מה שהפוסק התכוון — סימנתי זאת בתשובה לשרשור הראשי.
- **שורת עמלה חסרה** (מכירה רשומה שלפי הרשימה יש לה עמלה ואין לה שורת `:fee`) נספרת עם "rows that differ" — היא לא אחת
  מארבע המחלקות במפורש, אבל היא אי-התאמה בין השורה למכירה. שורת `:fee` למכירה בלי עמלה היא "unexplained".
- **שורה גולמית** (C4) מותאמת ב-`verify-gumroad` לפי התקציר שלה ומודפסת לפי התקציר — הפקודה לעולם לא מדפיסה מזהה גולמי.
  שורת gumroad בלי מזהה בכלל היא "unexplained".
- **`after` כשאין שורה:** 31 ימים אחורה (החלון של הקריאה הראשונה של המחבר, 30, ועוד יום, כמו בקריאת שיעור ההחזרים).
- **יציאה 1** לרשימה שסורבה או שעברה את התקרה: הפסיקה מגדירה 0/2/3 ולא מקרה זה; 1 הוא קוד הכשל הכללי של ה-CLI, ושום דבר
  לא אומת.
- **`DIGESTED_SOURCES` לא גדל.** Stripe ו-Lemon Squeezy נשארים גולמיים (הפסיקה, "What this does not decide" 2, REOPEN (c)).
- **בדיקות ה-CLI עם fetch מזויף:** `node --import tsx --import <fixture> scripts/colony.ts`, כשה-fixture מחליף את
  `globalThis.fetch`. כך הבדיקה מריצה את הפקודה האמיתית (יציאה, stdout) בלי רשת ובלי דגל בדיקה בקוד הייצור.
- **אין כתובת דואר בקבצים:** בגרסה הראשונה של הבדיקות היה שדה email מזויף בצורת כתובת; החלפתי אותו במחרוזת סמן בלי שטרודל,
  כי ההוראה אוסרת לכתוב כתובת דואר.
- **`docs/CHAIN_OF_COMMAND.md` שורת `revenue_audit`:** הוספתי שהביקורת בודקת גם שורות Gumroad שלא בצורה המאוחסנת. לא נדרש
  במפורש ב-fold 9, אבל בלעדיו המסמך מתאר ביקורת שאינה עוד.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree נפתח על `297a20b`, בלי הפסיקה: איפוס ל-`claude/new-session-j071dx` לפני כל עריכה (כנדרש).
- פקודות heredoc ל-Python ולשרשור ל-`cat >>` נחסמו על ידי שומר ה-worktree ("too complex"); עברתי לכלי העריכה. גם `git log |
  grep -f <(...)` נחסם; בדיקת השמות נעשתה ב-`git log --format=%an | node <script בתיקיית ה-scratch>`.
- `gumroad-verify.test.ts` נכשל פעם אחת מתוך ארבע: הסדר `ORDER BY occurred_at, id` מיין שורות באותו רגע לפי ULID, שאינו
  מונוטוני בתוך אותה מילישנייה. תיקון: `ORDER BY occurred_at, rowid` (סדר ההכנסה); שש ריצות רצופות ירוקות אחריו.
- באותה בדיקה, `run([...], undefined)` הפעיל את ערך ברירת המחדל של הפרמטר (הטוקן), כך שבדיקת "בלי טוקן" רצה עם טוקן. תיקון:
  `null` כסמן.

## 6. בדיקות ופעולות ולידציה

- `pnpm -s typecheck`: יציאה 0 (אחרי כל שלב).
- ממוקד: `ledger`, `loop`, `gumroad-connector`, `gumroad-verify`, `colony-cli`, `gumroad-refund-rate`, `mutation-plans` — 7 קבצים,
  164/164.
- `node scripts/mutate.mjs --check` אחרי ה-commit: `gumroad.json` 15/15, `ledger.json` 24/24, `colony.json` 41/41, יציאה 0
  לשלושתן.
- ריצות המוטציות, כל אחת ב-`scripts/sim-tree.sh` משלה, שלוש במקביל וביחד עם `verify.sh` המלא:
  - `gumroad.json`: 15 הורגו, 0 שרדו; 103 שניות כולל הקמת העץ.
  - `ledger.json`: 24 הורגו (17 הקודמים ו-T69-L1 עד L7), 0 שרדו; 223 שניות.
  - `colony.json`: 41 הורגו (34 הקודמים ו-T69-A1, A2, C1 עד C4, T1), 0 שרדו; 401 שניות. T69-C4 (הידית query-only) נהרג
    רק על ידי הצמדת המקור, כמו T64-C4: הפקודה לא כותבת בשום מסלול היום.
  - שלוש הריצות על `fee2977`; כל אחת: בסיס עובר לפני ואחרי ("baseline" ו-"baseline again" עם exit 0).
- `scripts/verify.sh` (כל חבילת ה-revenue, כולל `frozen-citations.test.ts`) על `fee2977`: typecheck יציאה 0, vitest יציאה 0,
  83 קבצים, 2993 עברו ו-2 דולגו (2995), "verify: passed", יציאה 0, 217 שניות (13:35:47-13:39:24 UTC, במקביל לריצות
  המוטציות). אחרי השינוי האחרון (הערה ב-`heartbeat.ts` והיומן) הרצתי אותו שוב על העץ הסופי (לפני ה-commit השני, שמוסיף רק את ההערה, את שורות זמני הריצה ב-README ואת היומן):
  typecheck 0, vitest 0, 83 קבצים, 2993 עברו ו-2 דולגו, "verify: passed", יציאה 0, 111 שניות (13:43:00-13:44:51 UTC, לבד).
  אחרי ה-commit: `--check` על שלוש התוכניות שוב, ו-`frozen-citations` ו-`mutation-plans` ממוקדים על העץ המחויב.
- **הבדיקות הסוגרות של הפסיקה:**
  - `grep -rn -F "String(sale.id)" src/revenue/connectors/gumroad.ts`: שורה אחת, בתוך `storedExternalId(…)`.
  - `grep -n -F "sha256:"` על `money.ts`, `ledger.ts`, `gumroad.ts`, `heartbeat.ts`: ארבעת האתרים (ל-`heartbeat.ts` הוספתי את
    הצורה `sha256:<hex>` בהערה של בדיקת C4, כי הבדיקה מצפה לו שם).
  - `--check` על שלוש התוכניות: יציאה 0 (למעלה).
  - קובץ הפסיקה: 0 שורות עם שטרודל. שם הבעלים: בדקתי מול כל שמות המחברים ב-`git log` שאינם בוטים (17 שמות), בלי לכתוב אותם
    לשום קובץ: 0 שורות בפסיקה ובכל קובץ ששיניתי מול השמות המלאים, ו-0 שורות מול כל מילה בשמות בשורות שהוספתי. (מול מילים
    בודדות יש התאמות בטקסט קיים, למשל בפסיקה ובקבצים שלא כתבתי — מילים נפוצות; לא שורות שלי.)
- אין CI: GitHub Actions מושבת במאגר; כל "עובר" כאן הוא ריצה מקומית לפי קוד יציאה.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **בדיקת שם הבעלים** חוזרת בכל בנייה, והתבנית לא כתובה בשום מקום שבונה יכול לקרוא (ובצדק אסור לכתוב אותה). סקריפט קטן
  `scripts/name-check.mjs` שקורא את השמות מ-`git log` בזמן ריצה ומדפיס ספירות בלבד (כמו זה שכתבתי ב-scratch) היה חוסך לכל בונה
  לבנות אותו מחדש מול שומר ה-worktree.
- **`node_modules` ב-worktree** — שוב קישור ידני. שלב בהקמת worktree של סוכן.
- **fetch מזויף ל-CLI** — ה-preload שכתבתי מתאים לכל פקודה של `colony.ts` שמדברת עם Gumroad; כדאי להכליל אותו (קובץ תשובות
  לפי נתיב) כשתבוא פקודה נוספת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה (504 שורות, 47KB) — הכרחי; נקראה פעם אחת בשני חלקים.
- `mutations/README.md` נטען פעם אחת במלואו (57KB) כשהספיק `grep` על שורות הטבלה.
- ניסיונות heredoc ו-process substitution שנחסמו — ארבע קריאות כלי שנזרקו.
- ריצות חוזרות של `gumroad-verify.test.ts` לאיתור הכשל הלא יציב (ארבע ואז שש) — זול, ומצא באג סדר אמיתי.
- תזכורות מערכת על רשימת המשימות של השרשור הראשי שחזרו בכל שלב — לא שלי לעדכן; נזרקו.
