# טיק 56 (6.10.2026) — fold 9 של פסיקה 6.10 שורה 21 (d): `scripts/trim-capture.mjs` ומסלול ה-artifact של render-watch

בונה Opus, ב-worktree על הענף `build/tick56-trim-capture` (מ-`origin/claude/new-session-j071dx` ב-`4f3527d`).
הסמכות: `research/channel-loop/RULING-2026-10-06-robots-and-terms.md`, החלטה 4 (סעיפים 1-5) ו-"Folds" סעיף 9.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש לבנות את fold 9 של הפסיקה: לכידה (capture) מאתר שתנאיו אוסרים העתקה, שכפול, הפצה או פרסום
(`"copying": "barred"` ב-`research/channel-loop/terms-verdicts.json`) לא נשארת בעץ הציבורי במלואה. נשארים: ה-meta עם בלוק
`trimmed`, ‏`.txt` באותו מספר שורות שבו רק השורות המצוטטות ±2 נשמרות וכל השאר ריקות, והגוף (`.html`/`.json`/`.pdf`) יוצא
מהעץ. בפרט: (1) `scripts/trim-capture.mjs` — dry run כברירת מחדל, `--apply` כותב, מסרב לאתר בלי שדה copying, מעדכן את
`FROZEN.sha256` לעותקים קפואים, משתמש בסורק הציטוטים של `freeze-capture.mjs` (ייבוא, לא מימוש מחדש); (2) מסלול ה-artifact
ב-`scripts/render-watch.mjs` וב-`.github/workflows/render-watch.yml`; (3) ש-`freeze-capture.mjs` יבין עותק גזום; (4) בדיקות;
(5) תוכנית mutation ‏(`trim-capture.json`, ≥8, כולן נהרגות) ורשומות חדשות לתוכניות הקיימות; (6) ההוכחה: `--apply` בעץ
`scripts/sim-tree.sh` של כל המאגר ואחריו `scripts/verify.sh` המלא, exit 0; (7) אימות ב-worktree; (8) הלוג הזה. ההרצה
האמיתית על המאגר היא של ה-thread הראשי, אחרי המיזוג — לא שלי.

## 2. הפעולות המרכזיות שביצעתי

- קראתי את החלטה 4 ואת ה-Folds במלואם, את `freeze-capture.mjs` (הסורק, `checkManifest`, `sameCapture`, `planFreeze`),
  `frozen-citations.test.ts`, `prize-terms-audit.test.ts`, ‏`capture-check.mjs`, ‏`remask-captures.mjs`, ‏`render-watch.mjs`
  ו-`render-watch.yml`, ומיפיתי את 46 הלכידות של האתרים החסומים (10 מתוך 11 האתרים: ל-codabench.org אין לכידה).
- כתבתי את `scripts/trim-capture.mjs`: הציטוטים הם של הסורק (`findCitations` על `decisionFiles`, כל הצורות, כל הלכידות),
  ובנוסף — ללכידות שאין להן שורה פעילה ב-`urls.txt` — כל `:N`, "line N" ו-`html:N`/`txt:N` על שורת מסמך שמזכירה את הלכידה
  (הסורק נותן חלק מהם לשם אחר על השורה, למשל `robots.txt`; ה-trim שומר יותר במקום לרוקן שורה שהערה מצטטת). לשם כך ייצאתי
  מ-`freeze-capture.mjs` את `BARE_RE`, ‏`WORD_RE`, ‏`NAMED_RE` (בלי שינוי התנהגות).
- הרצת ניסוי: `--apply` בעץ sim ואז `verify.sh` המלא. הריצה הראשונה נכשלה ב-5 בדיקות (ראו §5) — כל אחת היא קורא של בייטים
  שלא הבין לכידה גזומה. תיקנתי את הקוראים: `capture-check.mjs` (גוף שיצא אינו "קובץ חסר"; ה-kind הוא זה שנרשם לפני הגזירה,
  או `trimmed` ללכידה של מסלול ה-artifact), ‏`remask-captures.mjs` (לא מחפש גוף שהבלוק אומר שיצא), ‏`freeze-capture.mjs`
  (מסרב להקפיא לכידה גזומה; `checkManifest` מחזיק עותק גזום לבלוק שלו; `sameCapture`/`existingCopy` מזהים עותק גזום לפי
  ה-hash-ים המלאים שבבלוק), ‏`prize-terms-audit.test.ts` (קורא hash מלא דרך `fullSha256Of`), ‏`apify-runs.test.ts` (צורת
  ה-Actor stats בתוך הבדיקה במקום קריאת גוף ה-JSON של Apify, שיוצא מהעץ).
- מסלול ה-artifact ב-render-watch: `storeBarredCapture` כותבת את הגוף, הטקסט המלא וה-meta הפשוט ל-`RENDER_WATCH_ARTIFACT_DIR`,
  ולעץ רק את ה-meta עם בלוק `trimmed` (אותה צורה כמו של trim-capture, ועוד `artifact`) ו-`.txt` מרוקן באותו מספר שורות; מוחקת
  גוף מלא ישן של אותו slug; דף שלא השתנה לא כותב כלום. רשימת האתרים נקראת פעם אחת לריצה מ-terms-verdicts.json; קובץ שלא
  נקרא עוצר את הריצה לפני כל fetch. ב-workflow: שלב `actions/upload-artifact@v4` (שם `render-watch-barred-<run_id>-<attempt>`,
  ‏90 ימים, `if-no-files-found: error`) מיד אחרי ה-fetch ולפני ה-commit, בלי continue-on-error; ושמירה בשלב ה-commit שעוצרת
  אם גוף של דף חסום הגיע לעץ.
- בדיקות: `trim-capture.test.ts` חדש (20 בדיקות, fixtures בתיקייה זמנית + קריאה בלבד של המאגר האמיתי), תיאורי route ו-workflow
  ב-`render-watch.test.ts`, ועדכון סדר השלבים ב-`render-watch-js.test.ts`.
- תוכניות mutation: `trim-capture.json` חדשה (19), ורשומות T56 ב-`render-watch.json` (13), ‏`capture-check.json` (3),
  ‏`freeze-capture.json` (5), ‏`remask-captures.json` (1, ועדכון ה-find של M7 שזז). הוספתי את `trim-capture.json` לרשימת
  התוכניות החובה ב-`mutation-plans.test.ts`, ושורות ל-README של התוכניות.
- תיעוד: סעיף "Trimmed copies" ב-`research/rendered/README.md` (במקום שבו freeze-capture מתואר), ושדה `trimmed` בטבלת ה-meta.

## 3. קבצים/מערכות ששונו

- חדש: `scripts/trim-capture.mjs`, ‏`src/__tests__/revenue/trim-capture.test.ts`, ‏`src/__tests__/revenue/mutations/trim-capture.json`,
  הלוג הזה.
- שונו: `scripts/render-watch.mjs`, ‏`.github/workflows/render-watch.yml`, ‏`scripts/freeze-capture.mjs`, ‏`scripts/capture-check.mjs`,
  ‏`scripts/remask-captures.mjs`, ‏`src/__tests__/revenue/{render-watch,render-watch-js,prize-terms-audit,apify-runs,mutation-plans}.test.ts`,
  ‏`src/__tests__/revenue/mutations/{render-watch,capture-check,freeze-capture,remask-captures}.json` ו-`README.md`,
  ‏`research/rendered/README.md`.
- לא נגעתי: `logs/CHECKPOINT.md`, ‏`logs/CHANNEL_LOOP.md`, ‏`logs/FABLE_QUEUE.md`, ‏`MISSION.md`, ‏`CLAUDE.md`, אף `RULING-*.md`,
  ‏`terms-verdicts.json`, ‏`research/rendered/urls.txt`, ‏`research/measurements/*`, ואף לכידה במאגר (רק dry run; ה-`--apply`
  רץ רק ב-fixtures ובעצי sim).

## 4. החלטות והנחות משמעותיות

1. **גוף שמצוטט לפי שורה נשאר — גזום.** הפסיקה אומרת שהגוף יוצא מהעץ, וגם ש-trim "refuses to blank a cited line". ב-6.10 יש
   12 גופים שקובץ מכריע מצטט בהם שורה (`terms-zindi-2026-10-06.html:50`, ‏`btl-*-2026-09-29.html:19xx`, ‏`indiebook-*.html`,
   ‏`apify-store-accessibility-2026-09-22.json:62192`, ‏`worksheets4kids-home-2026-09-29.html`). יישבתי כך: גוף כזה נשאר באותו
   מספר שורות, רק השורות המצוטטות ±2 (ציטוט של שורות ספורות עם המקור, כפי שהחלטה 4(4) קוראת את הרשומה). גוף בינארי (`.pdf`,
   `.bin`) שמצוטט לפי שורה — סירוב. זו ההחלטה היחידה שסוטה ממילות הפסיקה, וכדאי שהמחליט יאשר אותה.
2. **טווח "רחב" נשמר ומסומן.** `research/measurements/indiebook.md:108` כותב "txt in full (body :29-269)" — תיאור של מה שנקרא,
   לא ציטוט — וזה שומר 245 מתוך 298 שורות של `indiebook-terms.txt`. לפי מילות הפסיקה (כל שורה מצוטטת נשמרת) שמרתי, וה-dry run
   מדפיס `wide:` לכל טווח שמכסה יותר מחצי קובץ. אם זה ציטוט — שאלה למחליט.
3. **הפניה מעבר לסוף הקובץ אינה סירוב.** `SITTING-2026-09-29-BRIEF.md:407` נותן ל-`indiebook-terms.txt` את `:724` (קובץ של 297
   שורות): זו שורה של "The TikTok note" שהסורק שייך ללכידה. אין מה לרוקן, אז זו הערה ולא סירוב (ובריצה חוזרת גם לא).
4. **שומר יותר, לא פחות.** כלל ה"על שורתה" מוסיף ב-6.10 ‏219 שורות ב-11 קבצים, 165 מהן בחמשת העותקים הקפואים של 6.10
   שהערות הפסקים מצטטות (הבדיקות קוראות אותן). כלל זה חל רק על לכידות שאין להן שורה פעילה ב-`urls.txt`.
5. **אתר בלי רשומה בכלל** (21 אתרים, 36 לכידות: algora.io, capitax.co.il, tjrobertson.com ועוד) — בריצה על כל המאגר הם "not
   reached" ומפורטים; כשמבקשים לכידה כזו בשם — סירוב. רשומה קיימת בלי שדה copying — סירוב של כל הריצה. "unread" בשם — סירוב;
   "allowed" בשם — nothing to do. כך "refuses a site without a copying field" לא חוסם את הריצה החד-פעמית בגלל 21 אתרים שהפסיקה
   לא דנה בהם.
6. **שם ה-artifact.** ‏`actions/upload-artifact` מעלה artifact אחד לשלב, ולכן artifact אחד לריצה
   (`render-watch-barred-<run_id>-<attempt>`), שבו קבצי כל לכידה בשם ה-slug; ה-meta בעץ רושם את ה-sha256 ואת רשימת הקבצים
   (`trimmed.artifact`). זה מה שעשיתי עם "named by slug and sha256".
7. **עובדה למחליט, לא נבדקה מכאן (אין רשת):** הפסיקה קוראת ל-artifact "private to the repository's collaborators". לפי התיעוד
   של GitHub כפי שאני מכיר אותו, ב-repository ציבורי כל משתמש GitHub מחובר עם גישת קריאה יכול להוריד artifacts של ריצה. כלומר
   המסלול מוציא את הגוף מהעץ ומההיסטוריה ל-90 יום, אבל לא הופך אותו לפרטי. כתבתי את זה בהערות הקוד, ב-workflow וב-README —
   זו נקודה ל-Fable.
8. **שלב ההעלאה לפני ה-commit ובלי continue-on-error:** העלאה שנכשלה עוצרת את הריצה כך שלא נכנס meta שמצביע על artifact שאין.
   המחיר: הלכידות האחרות של השבוע מחכות לריצה הבאה או ל-dispatch.
9. מסלול ה-artifact מטפל ב-PDF דרך עותק ה-artifact בלבד (בלי הלוגיקה של חילוץ ידני ליד PDF) — אין היום אתר חסום שמגיש PDF.
10. ה-trim רושם ב-`trimmed.captureCheck` את ה-kind של capture-check על הלכידה השלמה, כדי שקוראים (בדיקות ה-terms-shell של
    kaggle, `capture-check --all`) יקבלו אותה תשובה גם אחרי הגזירה.

## 5. שגיאות וניסיונות שנכשלו

- ריצת ה-dry run הראשונה על המאגר סירבה ל-`indiebook-terms` בגלל `:724` מעבר לסוף הקובץ → הפכתי זאת להערה (§4.3).
- ניסוי ה-sim הראשון (`e524dab`): `verify.sh` נכשל ב-5 בדיקות: `apify-runs.test.ts` (קרא את גוף ה-JSON של Apify),
  `capture-check --all` (גוף חסר = unreadable), שתי בדיקות ב-`prize-terms-audit.test.ts` (hash של גוף והשוואת `.txt` בייט לבייט
  בין עותק קפוא לחי), ו-`remask-captures` (dry run על המאגר: "names bodyPath …, which does not exist"). תוקן ב-§2.
- ניסוי ה-sim השני (`853be7a`): ריצה חוזרת של ה-trim על המאגר הגזום החזירה 1 — שוב `:724`, הפעם בענף "already trimmed".
  תוקן (אותו כלל stray בשני הענפים), נוספה בדיקת fixture ונוספה mutation ‏T56-T19. באותה ריצה `mutation-plans.test.ts` נכשל:
  ה-find של M7 ב-`remask-captures.json` זז עם השינוי שלי — עודכן.
- ריצת תוכנית ה-mutation הראשונה של trim-capture נעצרה ב-exit 4 על T56-T8 ("ה-dry run כותב"): הבדיקה של המאגר האמיתי
  (dry run) כתבה בפועל ל-checkout של עץ ה-sim, ו-`mutate.mjs` עצר כמתוכנן. החלפתי את T56-T8 ב-mutation על הפועל שבפלט (would
  trim/trimmed); "ה-dry run לא כותב כלום" מוחזק בבדיקת ה-snapshot של ה-fixture, ולא ניתן להחזיק אותו ב-mutation בלי לכתוב לעץ.
- ציפייה שגויה שלי ב-`render-watch.test.ts` (`redacted: 2` במקום 1: הטקסט המחולץ כבר ממוסך) — תוקנה.
- כתבתי בבדיקות שתי כתובות דוא"ל מילוליות (כתובת fixture בדף של מסלול ה-artifact, וזהות git של fixture). המאגר ציבורי והכלל הוא
  לא לכתוב כתובת לקובץ: שתיהן נבנות עכשיו ב-`join("@")`, כמו בבדיקות המיסוך הקיימות; ה-commit תוקן (amend) לפני הלוג.

## 6. בדיקות ופעולות ולידציה

כל ריצה נשפטה לפי קוד היציאה.

- ההוכחה (עץ `scripts/sim-tree.sh` של כל המאגר, אחרון ב-commit הבנייה `6241094`; גם ב-`658286f` וב-`a2f86d2` לפניו): `node scripts/trim-capture.mjs --apply` → exit 0; ריצה חוזרת
  (dry) → exit 3; `node scripts/freeze-capture.mjs --cited` → exit 0, ‏0 ציטוטים לפי שורה של לכידה פעילה, אין מה להקפיא; ו-
  `scripts/verify.sh` המלא → exit 0 (typecheck 0; ‏80 קבצי בדיקה, 2682 עברו, 2 skipped). אחרי ה-apply `git status` בעץ
  ה-sim מנה 126 קבצים: 44 metas, ‏37 טקסטים, 12 גופים גזומים, 32 גופים שנמחקו, ו-`FROZEN.sha256`.
- סיכומי ה-trim שהודפסו שם (זהים ל-dry run על המאגר האמיתי): 46 לכידות של 10 אתרים חסומים; 44 נגזמות (22 קפואות, 22 חיות),
  2 בלי כלום בעץ (`tipalti-payees-faq`, ‏`tipalti-payment-methods-us-row`, ‏403); גופים: 32 יוצאים, 12 נשארים גזומים; 37 טקסטים
  נגזמים; 20,445,685 בייטים יוצאים; 447 ציטוטים נשמרים; שורות `FROZEN.sha256` של 22 עותקים קפואים נכתבות מחדש. לא הוגעו: 2
  לכידות של אתרים allowed, ‏564 של unread, ‏36 של 21 אתרים בלי רשומה.
- תוכניות mutation, כל אחת בעץ sim משלה (שניות, בריצה מקבילה לתוכנית אחרת או שתיים): `trim-capture.json` ‏19/19 נהרגו (217);
  ‏`render-watch.json` ‏80/80 (244); ‏`freeze-capture.json` ‏28/28 (349); ‏`remask-captures.json` ‏46/46 (918); ‏`capture-check.json`
  ‏45/45 (976). ‏`mutate.mjs --check` על כל חמש: exit 0. הזמנים נרשמו ב-README של התוכניות. mutation שנשמטה: "ה-dry run כותב"
  (T56-T8 המקורית; §5), ושמירת ה-"refuses to blank a cited line" שאחרי הגזירה — הגנה שאין בדיקה שיכולה להפעיל בלי באג אחר
  (keptRanges תמיד מכסה כל שורה מצוטטת), ולכן לא נשמרה כ-mutation.
- ב-worktree (`a2f86d2`, ואחרי תיקון כתובות הבדיקה ב-§5 שוב ה-verify המלא ב-`6241094`): `scripts/verify.sh` על שמונת קבצי הבדיקה שהוזמנו → exit 0 (467 עברו); `scripts/verify.sh` המלא →
  exit 0 (80 קבצים, 2682 עברו, 2 skipped); `node scripts/freeze-capture.mjs --cited` → exit 0, ‏0 ציטוטים לפי שורה של לכידה
  פעילה (ללא שינוי); `node scripts/trim-capture.mjs` (dry run על המאגר האמיתי) → exit 0 עם הסיכומים שלמעלה, ובלי לכתוב דבר
  (`git status` נקי מלבד הלוג הזה).
- בדיקת השמות: `git grep -n -i -E` על הדפוס (מחובר) על כל הקבצים ששונו מול הבסיס — לא הדפיס כלום (exit 1).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- "הרץ `--apply` בעץ sim ואחריו `verify.sh` המלא, ריצה חוזרת ו-`--cited`" חזר שלוש פעמים כ-`sh -c '…'` ארוך. כדאי
  `scripts/sim-apply.sh <script>` שמריץ: apply, ריצה חוזרת (מצפה ל-3), `freeze-capture --cited`, ‏`verify.sh`, ומדפיס את ארבעת
  קודי היציאה.
- הוספת רשומות לתוכניות mutation קיימות נעשתה בסקריפט node חד-פעמי בתיקיית ה-scratch; `mutate.mjs --add <plan> <entry.json>`
  (שבודק ייחודיות id ו-`--check` מיד) היה חוסך את זה.
- כל קורא של לכידה (capture-check, ‏remask, ‏freeze-capture, בדיקות) נאלץ ללמוד לחוד ש"גוף חסר עם בלוק trimmed אינו חסר". פונקציה
  משותפת `captureFiles(slug, dir)` שמחזירה את מה שבעץ ואת מה שהבלוק אומר הייתה מרכזת את זה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `freeze-capture.mjs` (1,341 שורות) ו-`render-watch.mjs` (2,500 שורות) כמעט במלואם — נחוץ, כי הסורק וה-store הם הבסיס.
- ניסוי ה-sim הראשון לפני שתיקנתי קוראים ידועים מראש (capture-check ו-remask) — הרצה מלאה שחלק מהכשלונות שלה היו צפויים; אבל
  היא גם מצאה שניים שלא ציפיתי להם (prize-terms-audit ו-apify-runs), כך שהחזירה את עלותה.
- ריצת תוכנית ה-mutation שנעצרה ב-T56-T8 (112 שניות) — mutation שגורמת לבדיקה לכתוב לעץ האמיתי; הלקח: בדיקה על המאגר האמיתי
  הופכת כל mutation של "dry run כותב" לבלתי ניתנת להרצה.
- פלטי dry run ארוכים (שורת `cited` לכל טווח) שקראתי בחלקם כדי לאמת את כלל ה"על שורתה".
