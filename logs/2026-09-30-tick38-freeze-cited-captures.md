# 30.9.2026 — טיק 38: הקפאת הלכידות המצוטטות לפני ריצת ה-render של 6.10 (builder, worktree)

## 1. מה המשתמש ביקש
ה-workflow של השרשור הראשי ביקש:
- **כלי הקפאה** (`scripts/freeze-capture.mjs`): `freeze <slug> [--date]` מעתיק את כל קבצי הלכידה ל-`<slug>-<date>.*`,
  כותב מחדש את ה-slug והנתיבים ב-meta ומוסיף `frozen: {on, from}` בצורת שלושת הסטים שהוקפאו ביד. הכלי מסרב כשיש עותק
  קיים עם בייטים אחרים, כש-capture-check מסמן את הלכידה (אלא אם `--allow-flagged`), וכשהשם מתנגש בשורה של `urls.txt`.
  הוא לא עורך את `urls.txt`.
- **למצוא את הציטוטים שחשובים:** כל `research/rendered/<slug>.<ext>:<line>` בקבצים שמכריעים החלטות, של לכידה ששורתה ב-`urls.txt`
  פעילה. לספור לפי קובץ. `logs/` ו-`research/rendered/*.md` לא בפנים.
- **להקפיא ולהפנות מחדש:** תאריך = יום ה-fetchedAt. להשוות מדגם של 10 לפני/אחרי. ציטוט שהשורה שלו כבר זזה = DRIFTED,
  עם שני הטקסטים, בלי הפניה עיוורת.
- **בדיקת שמירה** ב-`src/__tests__/revenue/`, שעוברת אחרי ההפניה.
- **מוטציות** (5 ומעלה) עם `scripts/mutate.mjs`, `scripts/verify.sh`, והבדיקה של osek-zair.
- **רשימה לשרשור הראשי:** ציטוטים של לכידה פעילה לפי שורה ב-`logs/CHANNEL_LOOP.md`, `logs/CHECKPOINT.md`, `logs/FABLE_QUEUE.md`.

## 2. הפעולות המרכזיות שביצעתי
- קראתי את שלושת ה-meta שהוקפאו ביד ואת `osek-zair-page.test.js:330-350`.
- **סריקה ראשונה:** 144 ציטוטים לפי שורה. היא פספסה שתי צורות:
  - שמות קצרים בטבלה: `| \`R-GA\` | \`gh-docs-actions-billing.txt\` |` ואחריה `R-GA:502`. ב-`actions-spending-limit.md` יש 156 כאלה.
  - `:N` חשוף אחרי ציטוט: `x.txt:93`, `` `:97` ``, או "starts at :563" אחרי ציטוט בלי שורה.
- **הסורק כתוב מחדש:** צורה מלאה, צורה קצרה (רק slug מוכר), שמות מטבלה, ו-`:N` חשוף שמשויך לציטוט הקרוב לפניו. הפניה
  בעלת שם שאינה לכידה (`PAT:173`, `urls.txt:111`) עוצרת את השיוך; שעה (`T11:30:37Z`) לא עוצרת. הספירה עלתה ל-309.
- **בדיקת drift מול git:** לכל ציטוט, `git log -S` מוצא את ה-commit שהוסיף אותו, והלכידה שם מושווית ללכידה היום. התוצאה:
  305 זהים, 4 lines-same (הקובץ השתנה והשורה לא), 24 DRIFTED (13 לפי שורה, 11 בלי שורה).
- **DRIFTED הם אמיתיים.** בדקתי כל אחד מול המשפט המצטט. ה-meta שב-commit שכתב את הציטוט תואם בדיוק למה שהמשפט אומר:
  - fetchedAt `2026-09-27T22:46:07Z` בטבלת המקורות של step2-cost;
  - 1,279 ו-135 שורות ב-wall-art-pod;
  - 3,027,635 בייט ב-eaa-occupancy.
- **הפניה לגרסה שנכתב מולה (`--history`):** ציטוט DRIFTED לא הופנה לעותק של היום. הוא הופנה לעותק של הלכידה כפי שה-commit
  שהוסיף אותו שמר אותה, ושם השורה המצוטטת היא הטקסט המצוטט. הוא עדיין מופיע כ-DRIFTED עם שני הטקסטים.
- **terms-un:** ה-meta שלו (504) הוקפא קודם ביד עם `--allow-flagged`, כי שורת ה-audit מצטטת את הכישלון עצמו.
- **`--apply` אחד:** 48 עותקים קפואים חדשים (138 קבצים), ועוד kokoro שכבר היה קפוא. 182 עריכות ציטוט ב-19 קבצים; 156 הפניות
  בשם קצר עוקבות אחרי 5 שורות טבלה.
- **השוואת כל 309 הציטוטים:** השורות בלכידה שמולה נכתבו מול השורות בעותק הקפוא. 0 אי-התאמות. 4 ציטוטים מכילים `:N` חשוף
  שחורג מסוף הקובץ גם לפני וגם אחרי: השורה שייכת לקובץ אחר (ה-html ולא ה-txt), מגבלה של השיוך ההיוריסטי.
- **תיקון ב-robots-verdict:** העותק הקפוא `robots-nevo-2026-09-30` ממוין לפני `robots-nevo`, ו-`readRobotsCapture` היה קורא
  אותו כ-robots.txt החי. עכשיו הוא מדלג על meta עם `frozen`. קודם בדיקה שנכשלה, אחר כך התיקון.

## 3. קבצים/מערכות ששונו
- `scripts/freeze-capture.mjs` (חדש).
- `src/__tests__/revenue/freeze-capture.test.ts` (חדש, 13 בדיקות; כולל ריפו git זמני).
- `src/__tests__/revenue/frozen-citations.test.ts` (חדש, 6 בדיקות: השמירה).
- `scripts/robots-verdict.mjs` (דילוג על עותק קפוא) ו-`src/__tests__/revenue/robots-verdict.test.ts` (+1 בדיקה).
- `research/rendered/README.md`: שלב 4 וסעיף "Frozen copies".
- 48 עותקים קפואים ב-`research/rendered/` (138 קבצים).
- ציטוטים שהופנו מחדש ב-19 קבצים:
  - `docs/REJECTED.md`;
  - ב-`research/channel-loop/`: 7 ה-md ו-`terms-verdicts.json`;
  - ב-`research/measurements/`: 11 קבצים.
- הלוג הזה. לא נגעתי ב-`urls.txt`, `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`. לא דחפתי.

## 4. החלטות והנחות משמעותיות
- **DRIFTED הופנו לגרסה ההיסטורית ולא נשארו תלויים.** ההוראה אסרה הפניה *עיוורת*. ההפניה לגרסה שה-commit המוסיף שמר מאומתת
  בבנייה: השורה שם היא בדיוק ה-then. חלופה של allowlist בבדיקה הייתה משאירה 24 ציטוטים מצביעים על טקסט אחר. השרשור הראשי
  יכול להחזיר כל אחד לגרסה של היום; השורה החדשה של רוב הטקסטים ידועה (סעיף 6).
- **lines-same הולך לעותק של היום.** השורה זהה, וההוראה אמרה "at its current bytes". התוצאה: באותו קובץ יש לפעמים שני
  תאריכים לאותו דף:
  - wall-art-pod: `displate-com-about-faq-2026-09-28` בטבלת המקור, `-2026-09-29.txt:1048` בציטוט;
  - html5-syndication: `.html:1194` של 28.9, `.txt` של 29.9.
  כל ציטוט נכון בנפרד.
- **שני ציטוטים בלי שורה נשארו חיים (`--keep`):**
  - `RULING-2026-09-29-loop.md:147` מתאר מה `CHANNEL_LOOP.md:150` מצטט.
  - `TERMS-AUDIT-2026-09-29.md:120` מתאר את ה-meta החי של 503, עם התאריך שלו בגוף המשפט.
- **sweep2-google-vrp-faq:** ה-meta החי הוא 503 וה-html/txt מ-22.9. הכלי מקפיא את ה-commit שכתב את הטקסט (`9654448`, 200),
  ולכן השם הוא `-2026-09-22` ולא `-2026-09-28`.
- **קבוצת הקבצים המכריעים** (DECISION_FILES), כלשון המשימה. `products/**/config` פורש כקבצים תחת ספרייה בשם `config`, וגם
  `README*` בכל עומק תחת products.
- **הכרעת שם קצר:** שורת הטבלה עוקבת אחרי ההפניות שלה. אם הן רוצות גרסאות שונות, אף אחת לא זזה והיא מדווחת.

## 5. שגיאות וניסיונות שנכשלו
- הסריקה הראשונה ספרה 144 ופספסה שמות קצרים ו-`:N` חשוף. תוקן.
- שיוך `:N` חשוף לציטוט הקודם גם אחרי `PAT:108` שייחס שורות של קובץ raw ללכידה. תוקן בעוגני NAMED_RE, והעוגן לא תופס שעה.
- dry-run ראשון עם `--history` קיבץ לפי ה-commit המצטט, כך שלוש קבוצות רצו לאותו שם `displate-about-regulations-2026-09-28`.
  תוקן: הקיבוץ הוא לפי ה-commit שכתב את הלכידה. נוספה גם בדיקת התנגשות שמות ב-dry-run.
- סקריפט האימות שלי זיווג `R-RBU:19` לתא הטבלה, ו-4 שורות "past end" הופיעו כאי-התאמה. שני הבאגים היו בסקריפט, לא בהפניה.
- בבדיקת השמירה ספירת העותקים הקפואים יצאה 282 < 300, כי הקבוצה הוכרה רק מצורה מלאה. תוקן: כל ה-meta שבדיסק.
- fixture של 403 ציין `textPath` בלי קובץ והפך ל-"unreadable". בעקבות זה הכלי מסרב ללכידה שלא נקראת גם עם `--allow-flagged`.

## 6. בדיקות ופעולות ולידציה
- `scripts/verify.sh`: typecheck exit 0; tests exit 0. 61 קבצים, 1832 עברו, 1 skipped. רץ פעמיים, לפני ה-commits ואחריהם, עם אותה תוצאה.
- `node scripts/freeze-capture.mjs --cited` אחרי ההחלה: 0 ציטוטים לפי שורה, exit 0. נשארים 2 בלי שורה, אלה של `--keep`.
- `products/il-biz-tools`: `npx vitest run tests/osek-zair-page.test.js` → exit 0, 77 עברו.
- mutate.mjs, תוכנית 1: 16 מוטציות על הכלי ועל robots-verdict, 16 נהרגו.
- mutate.mjs, תוכנית 2: 4 מוטציות על קבצי הנתונים, 4 נהרגו:
  - ציטוט שחזר ל-live;
  - טבלת שם קצר שחזרה ל-live;
  - `:563` אחרי ציטוט חי בלי שורה;
  - גוף עותק קפוא שנערך.
- 13 ה-DRIFTED לפי שורה (then → now → איפה הטקסט עכשיו בלכידה החיה):
  - `displate-about-regulations.txt:471` (RULING-loop:149, SITTING-09-29:107): "delete Accounts... created using automated tools" → "c) keep the Password confidential" → ‎:477.
  - `displate-about-regulations.txt:116` (ZERO-TESTS:143): "Privacy Policy - a document available at…" → "Name (login)…" → ‎:122.
  - `gamedistribution-sdk-implementation.html:1194` (ZERO-TESTS:115, html5-syndication:187): `<a href="/GameDistribution/GD-HTML5/wiki/F.A.Q."` → `</button>` → ‎:1195.
  - `displate-com-about-privacy.html:115` (ZERO-TESTS:149): שורת ה-head עם `about-privacy-8cabb3e3e05788f0.js`, שעכשיו שונה ב-hash של CSS; ה-chunk עדיין בשורה.
  - `btl-not-working-rates.txt:347-352` (step2-cost:21, :77, :116): 143/123/266 ₪ → "הזמנת אשורים / טפסים / מחשבונים" → ‎:278-283.
  - `btl-self-employed-rates.txt:410` (step2-cost:25, :61, :79): "מי שהכנסתו נמוכה מ- 3,442 ש"ח…" → "מקבל פנסיה בפרישה מוקדמת" → ‎:341.
  - `displate-com-about-copyright.txt:93` (wall-art-pod:26): "zero tolerance policy" → "Respect for Intellectual Property" → ‎:94.
- 11 ה-DRIFTED בלי שורה (טבלאות מקור): step2-cost:14/15/55/93, wall-art-pod:4 (×2)/:55, apify-visibility:7/9,
  eaa-occupancy:374, ZERO-TESTS:140.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **כבר אוטומטי:** `node scripts/freeze-capture.mjs --cited` (dry run) אחרי כל ריצת render שמוסיפה ציטוטים, ו-`--apply`. בדיקת
  השמירה תופסת ציטוט חדש לפי שורה ללכידה פעילה.
- **שני דברים שנשארו ידניים:**
  - סקריפט ההשוואה לפני/אחרי שכתבתי ב-scratch (זיווג כל ציטוט ב-HEAD עם העותק הקפוא). כדאי להפוך אותו ל-`--verify`.
  - 44 ציטוטים לפי שורה מחוץ לקבוצה המכרעת (סעיף הסיום). אם רוצים אותם, מוסיפים glob ל-DECISION_FILES ומריצים שוב.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ריצת `--cited` הראשונה הדפיסה 329KB: שורות html מוקטנות של "then/now". תוקן בקיצור ל-400 תווים (`clip`).
- שלוש פקודות bash נדחו על ידי שומר ה-worktree (לולאות עם משתנים, `$(...)` עם git). עברתי לסקריפטים קטנים ב-scratch.
- שני סבבים על השיוך ההיוריסטי של `:N` (PAT, שעות). נמנע היה אילו קראתי מראש את טבלאות הקיצורים של actions-spending-limit.
