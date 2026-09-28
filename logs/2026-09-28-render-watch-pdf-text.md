# 28.9.2026 — render-watch: חילוץ טקסט מ-PDF על ה-runner

## 1. מה המשתמש ביקש
(משימה מתוך workflow, לא הודעה ישירה של הבעלים.) `scripts/render-watch.mjs` שומר את הבתים של PDF אבל לא
טקסט, ולכן סשן לא יכול לקרוא PDF שרונדר — תנאי המפתחים של CrazyGames
(`research/rendered/crazygames-developer-terms.pdf`) לא נקראו ב-28.9 כי בקונטיינר אין `pdftotext` ואין `pypdf`.
הבקשה: להוסיף חילוץ טקסט ל-PDF **בלי תלות npm**:
1. ב-workflow להתקין `poppler-utils` לפני שלב ה-fetch (אלא אם מסמכי image ה-runner שבריפו מראים שהוא כבר שם — לא לנחש).
2. בסקריפט: אחרי שמירת `<slug>.pdf` להריץ `pdftotext -layout <file> -` דרך `execFile` (בלי shell, argv קבוע, timeout),
   להעביר את הטקסט דרך `redactSecrets`, לכתוב `<slug>.txt` ולרשום `textPath`. אם `pdftotext` חסר או נכשל — לא להכשיל
   את הריצה: לא לכתוב `.txt`, לרשום הערה ברורה במטא (`textError`) ולהדפיס ללוג. HTML נשאר זהה בבתים.
3. הטקסט לא משנה את ה-sha256 (שהוא hash של בתי ה-PDF), כך ש-PDF שלא השתנה לא כותב כלום.
4. TDD עם extractor ניתן להזרקה: הצלחה, בינארי חסר (ENOENT) וכישלון.
5. לעדכן את הערת הכותרת (BEHAVIOUR) באמת.

**סבב review (אותו יום):** לתקן כל ממצא חוסם (או להפריך בראיות), להריץ שוב את הבדיקות ולעשות commit. הממצא:
בעלות ו"בתים חדשים" נקבעו מול מטא של fetch שנכשל (S1: הטקסט של הסקריפט נהפך ל"חילוץ ידני"; S2: טענת התיישנות
שקרית וקבועה על החילוצים הידניים).

## 2. הפעולות המרכזיות שביצעתי
- איפוס ה-worktree ל-`8da009b` (הוא התחיל על `29705ad`).
- **characterization לפני שינוי:** 4 בדיקות end-to-end ל-`main()` עם `fetch` מדומה ותיקייה זמנית (HTML, דף ללא שינוי,
  JSON, 403). רצו ירוק על הקוד הישן ונכנסו ב-commit נפרד (`40efb2b`), כדי להוכיח ש-HTML לא זז בבית אחד.
- כתבתי 24 בדיקות PDF (22 אדומות; שתי בדיקות "נשאר false" של `hasChanged` עברו כבר על הקוד הישן, כמצופה), ואז מימשתי
  (ואחר כך עוד 4 בדיקות, כל אחת אדומה לפני התיקון שלה — ראו סעיף 5):
  - `runPdftotext(pdfPath, { timeoutMs, execFileImpl })` — `execFile("pdftotext", ["-layout", path, "-"])`, timeout של
    60 שניות, `maxBuffer` של 64MB, בלי shell.
  - `describePdfTextError(error)` — משפט דטרמיניסטי אחד בלי נתיב host: ENOENT / timeout (`killed`) / קריסה (`signal`) /
    קוד יציאה + שורת stderr ראשונה / קוד אחר.
  - `storeCapture(entry, result, { outDir, now, extractPdfText })` — גוף הלולאה של `main` הוצא לפונקציה, עם ענף PDF.
  - `hasChanged` פוצל ל-`bodyChanged` (sha/status/error, כמו קודם) + מצב הטקסט **ל-PDF בלבד**.
  - `buildMeta` מקבל `textError` ומוסיף אותו רק כשיש (כמו `redacted`), כך שצורת המטא של כל דף אחר לא משתנה.
  - `main(argv, env, deps)` — `deps.extractPdfText` לבדיקות; הלוג מדפיס `no PDF text: …` ושורת `text` כשרק הטקסט זז.
- workflow: שלב `Install pdftotext (poppler-utils)` לפני ה-fetch, עם `continue-on-error: true`.
- `research/rendered/README.md`: ה-`.txt` הוא עכשיו גם ל-PDF; איך לדעת אם `.txt` של PDF הוא של ה-fetcher (`textPath`).

**סבב review (28.9, אחרי `688aa4e`).** ממצא חוסם אחד, שני מקרים: הבעלות על `<slug>.txt` ו"האם הבתים חדשים" נקבעו
מול המטא הקודם בלבד, ומטא של fetch שנכשל (403 / timeout / שגיאת רשת — 16 מתוך 94 המטא בריפו) מאפס `sha256` ו-`textPath`
בזמן שה-`.pdf` וה-`.txt` נשארים בדיסק.
- **שחזור לפני תיקון** על הקבצים האמיתיים עם הסקריפט של `HEAD`: (S1) `crazygames-developer-terms` — חילוץ, שבוע כושל,
  אותם בתים → `textPath: null` ו-textError "was not written by render-watch ... does not describe these bytes", ושבוע
  4 עם בתים חדשים לא חולץ והטקסט של שבוע 1 נשאר ליד הבתים החדשים. (S2) כל ארבעת החילוצים הידניים (`pcn874-*`,
  `irs-us-israel-treaty`) — שגיאה אחת ואז אותם בתים → טענת "לא מתאר את הבתים" שקרית וקבועה.
- **TDD:** 13 אדומות — 12 חדשות ואחת קיימת שניסוח ההערה שלה שונה (שגיאה → אותם בתים / בתים חדשים, לטקסט של הסקריפט ולטקסט ידני; שתי שגיאות ברצף; ספירת
  `redacted`; טקסט שנמחק; טקסט ידני בלי PDF שמור) + בדיקת HTML שעברה כבר על הקוד הישן (עוגן). ואז:
  - `previousTextState(meta)` — מה המטא אמר על הטקסט של PDF (`textPath`, `textError`, `redacted`). מטא של fetch שנכשל
    **נושא אותם הלאה** כשהלכידה הקודמת הייתה PDF; לכל סוג אחר מחזיר ריק, כך שמטא שגיאה של HTML לא משתנה.
  - "בתים חדשים?" נקבע מול ה-`.pdf` **השמור בדיסק**, לא מול המטא.
  - ניסוח חדש לטקסט לא-טעון: `unclaimedTextNote` — "is not claimed by this page's meta ... treats it as a hand
    extraction", עם ה-sha256 של העותק השמור שלידו ישב, ו-"may not describe these bytes". רק מה שהסקריפט יודע.
  - חילוץ תמיד כותב את הטקסט שלו (`meta.changed = true`), גם כשהמטא לא זז (טקסט טעון שנמחק ביד).
- **רגרסיה שהכנסתי ותפסתי לפני commit:** הגרסה הראשונה של התיקון שברה PDF → HTML → אותו PDF (הטקסט של ה-HTML נשאר ליד
  ה-PDF בלי טענה ובלי הערה; `HEAD` טיפל בזה נכון). בעלות = המטא הקודם טוען את הקובץ כ-`textPath` **או** כ-`bodyPath`
  (לכידת text/plain נשמרת כ-`<slug>.txt` עצמו — מקרה שהיה שבור גם ב-`HEAD`). "הטקסט מתאר את ה-PDF השמור" = טענה ששורשה
  ב-PDF (`previousTextState`). 2 בדיקות אדומות ואז תיקון.
- 3 בדיקות יחידה ל-`previousTextState`, ובדיקה שמחיקה ידנית של `textError` (מה שה-README מורה) לא חוזרת.
- כותרת הסקריפט (BEHAVIOUR), תיעוד `buildMeta` ו-`storeCapture`, ו-`research/rendered/README.md` (שלבים 1–2) עודכנו.

## 3. קבצים/מערכות ששונו
- `scripts/render-watch.mjs` — ענף PDF, `runPdftotext`, `describePdfTextError`, `storeCapture`, `bodyChanged`, `isPdf`, כותרת.
  בסבב ה-review: `previousTextState`, `unclaimedTextNote`, ענף ה-PDF של `storeCapture` ונשיאת המצב במטא של fetch שנכשל.
- `.github/workflows/render-watch.yml` — שלב התקנת poppler-utils.
- `src/__tests__/revenue/render-watch.test.ts` — מ-54 ל-86 בדיקות, ובסבב ה-review ל-105.
- `research/rendered/README.md` — טבלת הקבצים ושלב 1 של הקריאה.
- `logs/2026-09-28-render-watch-pdf-text.md` — הקובץ הזה.
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `MISSION.md`. לא בוצע push.

## 4. החלטות והנחות משמעותיות
- **התקנה ולא הנחה:** אין בריפו מסמך של image ה-runner. `logs/CHANNEL_LOOP.md` כותב "since runners have poppler" — זו טענה,
  לא מסמך. לכן השלב בודק `command -v pdftotext` בזמן ריצה ומתקין רק אם חסר; `apt-get install` קודם, ואם נכשל
  (אינדקס ישן) `apt-get update` ואז שוב. `continue-on-error` — apt שנכשל לא יעלה בלכידות של השבוע.
- **חילוץ חד-פעמי ל-PDF שנלכד לפני הפיצ'ר (backfill).** סטייה מודעת מהניסוח "PDF שלא השתנה לא כותב כלום": בלעדיה
  קובץ ה-CrazyGames (`developer_terms_20250818.pdf`, קובץ מתוארך שכנראה לא ישתנה) לא ייקרא לעולם, וזו כל מטרת המשימה.
  הכלל: PDF שלא השתנה מחולץ רק אם המטא לא טוען טקסט **וגם** אין `<slug>.txt` בדיסק. `fetchedAt` נשמר (זמן לכידת הבתים),
  ה-sha256 לא זז, והשבוע שאחרי שוב לא נכתב כלום. PDF שלא השתנה שהטקסט שלו כבר שמור לא מחולץ שוב בכלל.
- **לעולם לא לדרוס חילוץ ידני.** ארבעה PDF (שלושת מפרטי PCN874 ואמנת המס ארה"ב–ישראל) כבר מחזיקים `<slug>.txt` שנעשה
  ביד, עם `textPath: null`, ומצוטטים **לפי מספר שורה** — `products/pcn874/src/*.ts` (למשל `pcn874-h-erp-mirror.txt:990-1002`)
  וקבצי `research/`. הסקריפט מחליף או מוחק רק `.txt` שהמטא הקודם שלו טוען (`textPath`). אם PDF משתנה ליד חילוץ ידני —
  לא מחלצים, ו-`textError` אומר שהטקסט הידני לא מתאר את הבתים החדשים.
- **מחיקת הטקסט של הסקריפט עצמו** כשבתים חדשים לא נקראים: אחרת טקסט של הגרסה הישנה יושב ליד הבתים החדשים, והמצב
  נתקע (בפעם הבאה הוא ייראה כמו חילוץ ידני). מוחקים רק קובץ שהמטא הקודם טען; git שומר את ההיסטוריה.
- **מצב הטקסט נבדק ל-PDF בלבד ב-`hasChanged`.** יש מטא שנערכו ביד: `youtube-handle-bediyuk` (HTML, `textPath: null` כי
  הגוף הוסר בכוונה) ושתי לכידות `github-innovationgraph-*` (text/plain עם `textPath` ידני). השוואה לכל סוג הייתה כותבת
  אותם מחדש בריצה הבאה. נבדק על 94 קבצי המטא שבריפו.
- `redacted` ב-PDF סופר את מה שהוסתר בטקסט המחולץ (הגוף בינארי ונשמר כמו שהוא).
- הטקסט נכתב כפי ש-pdftotext החזיר (כולל form feed בין עמודים), מלבד ההסתרה.
- **(review) נשיאת מצב הטקסט דרך שגיאה, ולא שדה חדש.** האפשרות השנייה שהוצעה — לרשום את ה-sha של ה-PDF שממנו חולץ
  הטקסט — הייתה מוסיפה שדה לכל מטא של PDF, וכפולה ל-`sha256` בכל לכידה מוצלחת. במקום זה: הטקסט של הסקריפט תמיד מתאר את
  ה-`.pdf` השמור (מוחלף או נמחק בכל שינוי בתים), והשוואה מול הקובץ בדיסק מספיקה.
- **(review) "may not describe", לא "does not describe".** PDF שחוזר לגרסה קודמת היה הופך את הטענה החזקה לשקרית, והיא
  נישאת הלאה כל עוד הבתים לא זזים. הניסוח המסויג נכון תמיד, ושם ה-sha של העותק שלידו ישב הטקסט הידני (למציאה ב-git).
- **(review) מגבלה שנכתבה ולא תוקנה:** אם URL של PDF מתחיל להחזיר HTML או text/plain, הטקסט/הגוף של הלכידה ההיא נכתב
  ל-`<slug>.txt` כמו לכל דף — גם מעל חילוץ ידני. זו התנהגות HTML קיימת שהמשימה דרשה להשאיר זהה בבתים; git שומר את מה
  שהוחלף. נכתב בכותרת וב-README במקום הטענה המוחלטת "never touched".
- **(review) HTML → שגיאה → PDF** — הטענה של ה-HTML על ה-`.txt` לא נישאת דרך השגיאה (מטא שגיאה של HTML נשאר בצורתו), כך
  שה-`.txt` ייראה לא-טעון וייחשב חילוץ ידני, עם הערה שאומרת שהוא לא טעון ואולי לא מתאר את הבתים. נכון, רק לא אוטומטי.

## 5. שגיאות וניסיונות שנכשלו
- בדיקת ה-403 הראשונה ציפתה ל-`HTTP 403 Forbidden`; `Response` בלי `statusText` נותן `HTTP 403`. תיקון של ה-fixture, לא של הסקריפט.
- כתבתי בהערה ש-execFile עם ברירת מחדל של 1MB "קטן ממה שאחד ממפרטי PCN874 מניב" — **לא נכון** (הגדול ביותר 154KB,
  אמנת המס). נמדד ותוקן לפני commit.
- `describePdfTextError` הראשון קרא לכל `signal` "timeout". מדידה של צורות השגיאה ב-Node 22 הראתה שקריסה (SIGSEGV) היא
  `killed: false` עם `signal`, ו-maxBuffer הוא `code` מחרוזת בלי signal. נכתבה בדיקה אדומה ואז תוקן.
- הגרסה הראשונה של ה-backfill הייתה דורסת את ארבעת החילוצים הידניים (שבורים ציטוטים לפי שורה). נתפס בבדיקת הנתונים
  האמיתיים לפני commit.
- ה-sandbox דחה פקודות bash מורכבות (heredoc + python, לולאות עם git) — פוצלו לפקודות פשוטות ולכלי Edit/Write.
- **(review)** הטענה בכותרת "the script only ever replaces or removes a <slug>.txt its previous meta claims" נבדקה רק
  מול רצף הצלחות; שבוע כושל אחד שבר אותה. הלקח: כל כלל שנשען על "המטא הקודם" צריך בדיקה עם מטא שגיאה באמצע.
- **(review)** התיקון הראשון שלי החליף בעלות "כל טענה של המטא" בבעלות "טענה של PDF" ושבר PDF → HTML → PDF. נתפס כשכתבתי
  את שורת המגבלה בכותרת ובדקתי אותה, לפני commit.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue/render-watch.test.ts src/__tests__/revenue/no-algora-requests.test.ts` — **92/92**
  (86 + 6). לפני השינוי: 60/60 (54 + 6).
- `pnpm -s typecheck` — יציאה 0. `publication-gate.test.ts` (מזכיר render-watch) — 58/58.
- בדיקות ה-wrapper רצות עם **תהליכי ילד אמיתיים** (node מריץ סקריפט זעיר במקום pdftotext): argv מדויק `-layout <file> -`,
  ENOENT אמיתי, יציאה 1 עם stderr, ו-timeout אמיתי של 300ms. לא תלויות בהתקנת pdftotext.
- **הרצה חוזרת על הלכידות האמיתיות:** העתקתי את `research/rendered/` לתיקייה זמנית והעברתי כל גוף שמור דרך `storeCapture`
  כאילו האתר החזיר אותם בתים. תוצאה: רק `crazygames-developer-terms.pdf` מחולץ (נוצר `.txt`, המטא מקבל `textPath`,
  `fetchedAt` ו-sha256 לא זזים); ארבעת החילוצים הידניים ו-74 לכידות ה-HTML (65 עם גוף, 9 עם שגיאה) לא נגעו (93 מטא
  הורצו, אחד דולג — `youtube-handle-bediyuk`, שהגוף שלו הוסר בכוונה). שני קבצי `metaculus-lb-*-client`
  השתנו בהרצה — ארטיפקט של ההרצה (לא ב-`urls.txt`, render-watch לא נוגע בהם).
- שלב ההתקנה: `bash -n` תקין, ו-3 תרחישים עם `sudo`/`apt-get` מדומים (אינדקס תקין, אינדקס ישן → update, כבר מותקן) — כולם יציאה 0.
- **לא אומת:** ריצה אמיתית של ה-workflow על runner (לא בוצע push), ופלט אמיתי של pdftotext על קובץ ה-CrazyGames.
  הריצה הבאה של `render-watch` על ה-branch היא הבדיקה: צפוי commit עם `crazygames-developer-terms.txt` ומטא עם `textPath`.
- **(review)** `npx vitest run src/__tests__/revenue/render-watch.test.ts src/__tests__/revenue/no-algora-requests.test.ts` —
  **111/111** (105 + 6; לפני הסבב 86 + 6). `pnpm -s typecheck` — יציאה 0. `publication-gate` + `no-algora-requests` — 64/64.
- **(review) HTML זהה בבתים לבסיס:** סקריפט השוואה מריץ את `main()` של `8da009b` ושל הגרסה החדשה זה לצד זה, עם `fetch`
  מדומה, על רצפי HTML (כולל 403, 404, שתי שגיאות רשת ברצף, ומפתח לדוגמה), JSON ו-text/plain — 16 מצבים, 0 הבדלים
  (`fetchedAt` מנורמל).
- **(review) הרצה חוזרת על הלכידות האמיתיות:** אותם בתים ל-93 מטא → רק `crazygames-developer-terms` מחולץ (כמו קודם; שני
  `metaculus-lb-*-client` משתנים גם עם הסקריפט של `HEAD` — נכתבו ע"י סקריפט אחר ואינם ב-`urls.txt`, ארטיפקט של ההרצה).
  S2 על ארבעת החילוצים הידניים: שגיאה ואז אותם בתים → בלי `textError`, הטקסט לא נגע, והשבוע שאחרי לא כותב כלום. S1 על
  CrazyGames: חילוץ → שגיאת רשת → אותם בתים (לא חולץ שוב, `textPath` נשאר) → בתים חדשים (חולץ, הטקסט הוחלף).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- "להריץ את ה-fetcher על הלכידות השמורות ולראות מה היה משתנה" — סקריפט ההרצה החוזרת שכתבתי ב-scratchpad שווה
  `scripts/render-watch-replay.mjs` קבוע, כבדיקת dry-run לפני כל שינוי ב-render-watch.
- מטא שנערכו ביד (הסרת גוף, `textPath` ידני) מתגלים רק כשמישהו מסתכל. בדיקה שמסמנת מטא שלא תואם את מה שהסקריפט היה
  כותב הייתה מונעת הפתעות.
- **(review)** סקריפט ההשוואה מול הבסיס וסקריפט ההרצה החוזרת נכתבו שוב ב-scratchpad. שניהם שווים קובץ קבוע
  (`scripts/render-watch-replay.mjs` עם מצב `--compare <ref>`), כולל תרחישי "שבוע כושל באמצע".

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת קבצי השורה של `research/measurements/crazygames.md` ו-README — נחוצה, קצרה.
- ניסוחי פקודות bash שה-sandbox דחה (2 ניסיונות) — בזבוז קטן, נפתר בפיצול.
- סבב עיצוב נוסף אחרי שהתגלו הציטוטים לפי שורה ב-`products/pcn874` — יקר יחסית (בדיקות + תיעוד מחדש), אבל מנע דריסה
  שקטה של מקורות שקוד מוצר מצטט.
- **(review)** סבב תכנון על מקרה ה-revert (PDF שחוזר לגרסה קודמת) ועל ניסוח שנכון תמיד — נחוץ, כי הניסוח נישא הלאה
  בלי הגבלת זמן. שחזור על הקבצים האמיתיים עם `HEAD` — זול ונתן הוכחה ישירה לשני המקרים.
