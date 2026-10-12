# סבב 75 של לולאת הערוצים — 12.10.2026, בניין Opus של קיפולים 5 ו-6 בפסיקת שורה 28 (קורא ה-Analytics של YouTube)

## 1. מה המשתמש ביקש
החוט הראשי של סבב 75 שלח בונה Opus אחד, ב-worktree `build/tick75-analytics` (מבוסס על `5a45661`), לקפל את קיפולים 5 ו-6
מתוך "Folds for Opus" של `research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md` (ישיבת Fable של 12.10, שורה 28
ב-FABLE_QUEUE; קיפולים 1-4 ו-7 מוזגו בסבב 73, `c7baedb`):
- **קיפול 5** (`scripts/youtube-analytics.ts`, §3 החלטות 4 ו-6): (i) נתיב הפלט עוזב את `state/colony/measurements/` לנתיב
  שה-workflow של המושבה לא מוסיף אף פעם, ועד שיש מאגר פרטי — `readings` בלבד, לעולם לא טבלאות ה-`raw`; (ii) שער תנאים לפני
  משיכת מסמך ה-discovery: `apiTermsGate` ו-`readTermsVerdicts` של הקריאה-חזרה, וסירוב (יציאה 2, שום דבר לא נמשך) אלא אם
  googleapis.com כשיר-פעיל; (iii) הכותרת נוקבת בשער ובכלל הפלט.
- **קיפול 6** (רענון הטוקן, §3 החלטה 5): ב-`invalid_grant` — מחיקת הפלט שהסקריפט כתב לפני הזריקה, והודעת הזריקה אומרת זאת.
- בדיקות קודם (קומיט נפרד, עם קוד יציאה שאינו אפס על קוד הבסיס), אחר כך הקוד; תוכנית מוטציה חדשה בתוך `sim-tree.sh`;
  שורות ב-README של התוכניות; `verify.sh` ממוקד ומלא; בדיקת כל קורא של נתיב הפלט הישן.

## 2. הפעולות המרכזיות שביצעתי
- **הכנה:** worktree ב-`5a45661` (הפסיקה ו-`assertColonyFactsOnly` קיימים), קישור ל-node_modules; קריאת הפסיקה כולה, יומן
  סבב 73, הסקריפט, הקריאה-חזרה ובדיקותיה, `colony.yml`, `.gitignore`, `measurements.ts`, ותוכניות המוטציה וה-README.
  ריצת בסיס של `youtube-analytics.test.ts` ו-`publisher-guard.test.ts`: exit 0, 87 עברו.
- **בדיקות קודם (`e5ce649`):** ב-`youtube-analytics.test.ts` שלושה בלוקים חדשים (14 בדיקות):
  - שום workflow לא מריץ את הסקריפט ולא קובע `YT_ANALYTICS_*`, ושום סקריפט חבילה לא נוקב בו (מראה של הבדיקה המקבילה
    ב-`youtube-madeforkids.test.ts`);
  - השער מסרב תחת הפסיקות המחויבות (`research/channel-loop/terms-verdicts.json`): יציאה 2, אפס קריאות fetch, שום קובץ,
    וההודעה היא `why` של השער עצמו; הסקריפט האמיתי, מורץ ב-`spawnSync` כשההסכמה מוסרת מהסביבה, יוצא ב-2;
  - סירוב תחת כל פסיקה שאינה פעילה ועל קובץ חסר או לא קריא — עם הסכמה ובלעדיה; תחת NOT_BARRED ו-CONDITIONAL_MET בדיקת
    ההסכמה באה אחריו, ועם ההסכמה הוא קורא (OpenID, טוקן, שני דוחות);
  - הסקריפט מייבא את השער ואת קורא הפסיקות מהקריאה-חזרה, לא מעתיק אותם; `cliRun` (הריצה של `main()`) נותן את
    `TERMS_VERDICTS`, `OUTPUT_PATH` וקובץ ההעלאות, ולא אחרים;
  - `OUTPUT_PATH` מוחלט, מחוץ לעץ, לא תחת `state/colony/`, והנתיב הישן נעלם מהקוד; ה-JSON הנכתב הוא
    `{measuredAt, window, readings}` בדיוק, בלי `raw` ובלי `columnHeaders`, והקריאות נכונות (חציון 5, 307 שעות);
  - הכותרת נוקבת בשער, ב-googleapis.com, ב-`exit 2, nothing fetched`, בפסיקה, ב-"never written under state/colony/",
    ב-`OUTPUT_PATH`, ב-`` `raw` `` וב-`invalid_grant`;
  - קיפול 6: fetch מזויף שעונה `invalid_grant` וקובץ פלט קיים — הקובץ נמחק, ההודעה אומרת "was deleted" ונוקבת בפסיקה,
    ושום דוח לא נשאל; בלי פלט — "there was no analytics output ... to delete"; פלט שאי אפשר למחוק (תיקייה) — "could NOT be
    deleted ... delete it by hand"; כשל רענון אחר (`invalid_client`, HTTP 503) — הפלט נשאר.
  - ב-`publisher-guard.test.ts` נוסף הסקריפט ל-`KNOWN_YOUTUBE_API_CODE` (סעיף 4).
  - **על קוד הבסיס: exit 1** — 14 נכשלו, 87 עברו, ושגיאה לא מטופלת אחת: `main()` של הבסיס רץ בזמן הייבוא וקרא ל-`process.exit`.
- **הקוד (`d94aa0f`):** `scripts/youtube-analytics.ts` נכתב מחדש סביב `runAnalytics(run)` ו-`cliRun(args, env)` המיוצאים;
  `main` רץ רק כשהקובץ מורץ ישירות; ה-fetch מוזרק. השער ראשון; `OUTPUT_PATH`; כתיבת `readings` בלבד; `deleteOutput` ב-
  `invalid_grant`; כותרת חדשה. תוכנית המוטציה `src/__tests__/revenue/mutations/youtube-analytics.json` (12 רשומות).
- **מוטציות:** `node scripts/mutate.mjs --check` — 12 מתוך 12 חלות; בתוך `scripts/sim-tree.sh --dir .../analytics-scratch/sim`,
  לבד: 12 נהרגו, 0 שרדו, 35 שניות; העץ הוסר. שורות ה-README נוספו (קומיט שלישי, עם היומן הזה).

## 3. קבצים/מערכות ששונו
- `scripts/youtube-analytics.ts`.
- `src/__tests__/revenue/youtube-analytics.test.ts`, `src/__tests__/revenue/publisher-guard.test.ts` (רשומה אחת ב-`KNOWN_YOUTUBE_API_CODE`).
- `src/__tests__/revenue/mutations/youtube-analytics.json` (חדש), `src/__tests__/revenue/mutations/README.md` (שתי שורות
  חדשות בלבד).
- היומן הזה. לא נגעתי ב-CHECKPOINT, CHANNEL_LOOP, FABLE_QUEUE, MISSION, CLAUDE.md, בפסיקות, ב-SITTING, ב-`research/measurements/`,
  ב-`state/colony/`, ב-`.gitignore`, בשום workflow ובשום יומן קיים.

## 4. החלטות והנחות משמעותיות
1. **נתיב הפלט החדש: `~/.local/state/mehudak/youtube-analytics.json`** (`OUTPUT_PATH`, `join(homedir(), ".local", "state",
   "mehudak", "youtube-analytics.json")`). למה:
   - §3 החלטה 4: "must not be written under `state/colony/` or any path the workflow commits", ו"a store only the owner (the
     authorizing user) and the colony (their agent) can read". `colony.yml:103` מריץ `git add -f state/colony`, וכל `git add`
     אחר ב-`.github/workflows/` נוקב בנתיבים בתוך העץ (`research/rendered/`, `state/colony/brand-mail.json`, קבצי המדידה של
     Apify ו-Algora, Gumroad, prize-intake, brand-check, metaculus). נתיב מחוץ לכל clone אינו בהישג של אף אחד מהם.
   - נתיב בתוך העץ עם כלל ב-`.gitignore` נדחה: `-f` עוקף את `.gitignore`, ו-`colony.yml` כבר משתמש בו; ותיקייה חדשה בעץ
     ציבורי היא בדיוק המקום שבו `git add` עתידי יטעה.
   - `~/.automaton/` נדחה: לפי `src/agent/system-prompt.ts` זו תיקייה שגרסאותיה נשמרות ב-git.
   - מיקום מצב לפי XDG (`~/.local/state`), כמו מטמון ה-venv של `pytest-product.sh` תחת `~/.cache`; בלי משתנה סביבה ובלי דגל
     שמזיז אותו — כדי שאף הגדרה לא תחזיר אותו לעץ. בריצה על runner מתארח הקובץ מת עם העבודה; זה ביניים, והמאגר הסופי הוא של
     בניין ה-privacy-and-terms (§3 החלטה 4: "where it goes is the privacy-and-terms build's").
2. **השער ראשון, לפני בדיקת ההסכמה** — כמו בקריאה-חזרה (תנאים, ואז המפתח), ולפי לשון הקיפול: "refuse (exit 2, nothing
   fetched) unless googleapis.com is active-eligible". שינוי התנהגות: בלי הסכמה, כשהתנאים לא מתקיימים, היציאה היא 2 ולא 0
   ("a missing consent is not a broken build" נשאר נכון כשהשער פתוח). שום workflow לא מריץ את הסקריפט.
3. **`raw` לעולם לא נכתב, ואין שום הגדרה של "מאגר פרטי".** הפסיקה: "until such a store exists, the reader does not write the
   `raw` tables at all"; לבנות מנגנון להגדרת מאגר שאינו קיים — מיותר. כשהמאגר ייקבע, הבניין שלו יוסיף את הכתיבה ואת הבדיקה.
4. **קיפול 6 — שלוש הודעות, ומחיקה רק ב-`invalid_grant`:** "was deleted", "there was no analytics output ... to delete",
   ו-"could NOT be deleted (...): delete it by hand" — כדי שההודעה לעולם לא תטען מחיקה שלא קרתה. כשלי רענון אחרים (רשת,
   `invalid_client`) אינם ביטול הרשאה ולא מוחקים. טקסט הרמז על אפליקציה שנשארה ב-Testing נשמר.
5. **ריפקטור לבדיקה:** `runAnalytics` ו-`cliRun` מיוצאים, `main` רץ רק כשהקובץ מורץ ישירות (הבסיס הריץ את `main` בכל ייבוא),
   ה-fetch מוזרק. `measuredAt` הוא `run.now`, כמו קודם (`--now` או השעון). נתיב קובץ ההעלאות נשאר יחסי ל-cwd, כמו קודם.
6. **נעיצה שהשתנתה:** `KNOWN_YOUTUBE_API_CODE` ב-`publisher-guard.test.ts` קיבל את `scripts/youtube-analytics.ts`. הכותרת נוקבת
   עכשיו ב-googleapis.com (קיפול 5 (iii) — השער הוא של googleapis.com), והסריקה (`GOOGLE_API = /googleapis|googleapiclient/i`)
   מוצאת אותו. הסקריפט קרא ל-Analytics API תמיד, דרך `ANALYTICS_REPORTS_URL` של המודול, ולכן הסריקה לא נקבה בו עד כה.
   ההנחה ("the guard and the readers, nothing else") לא רוככה: נוסף קורא, עם נימוק, כפי שההערה בראש הסריקה דורשת.
7. **בדיקת ה-spawn מסירה את ההסכמה מהסביבה**, ולכן גם מוטנט ששובר את השער נעצר בבדיקת ההסכמה (יציאה 0) לפני כל fetch:
   אף ריצה של הבדיקות או של המוטציות לא יכולה לקרוא לרשת. וידאתי ש-`~/.local/state/mehudak` לא נוצר.
8. **קוראי הנתיב הישן:** אין קורא בקוד. `grep` על `youtube-analytics.json` ועל `measurements`: `src/revenue/measurements.ts`
   קורא רק את `MEASUREMENT_FILES` (`apify-runs.json`, `algora-supply.json`), וגם `runner.ts` דרכו; `experiments.ts`
   מקבל את הקריאות כפרמטר ולא קורא קובץ; `publisher-guard.ts` לא נוקב בנתיב; `src/revenue/youtube-analytics.ts` הוא חשבון בלבד;
   הקריאה-חזרה קוראת את `youtube-videos.json` (הקלט, שלא זז), לא את הפלט. הנתיב הישן מופיע רק בפסיקות, בתדריכים וביומנים,
   שאסור לגעת בהם.

## 5. שגיאות וניסיונות שנכשלו
- בטיוטה הראשונה של הכותרת "exit 2," ו-"nothing fetched" נפלו על שבירת שורה, ובדיקת הכותרת שלי הייתה נכשלת; תוקן לפני
  הריצה הראשונה (נמצא בקריאה, לא בכישלון).
- על קוד הבסיס, `main()` רץ בזמן הייבוא של קובץ הבדיקה וקרא ל-`process.exit(0)` (vitest תפס אותו כשגיאה לא מטופלת) — זה
  חלק מהכישלון-קודם הצפוי, והסיבה לשומר ה-`main` בקוד החדש.
- אין ניסיון שנכשל אחרי כתיבת הקוד: הריצה הראשונה של הבדיקות על הקוד החדש עברה (101 מתוך 101), וגם ה-typecheck.

## 6. בדיקות ופעולות ולידציה
- כישלון-קודם: `npx vitest run` על `youtube-analytics.test.ts` ו-`publisher-guard.test.ts` בקומיט הבדיקות (`e5ce649`, על הקוד
  של `5a45661`) — **exit 1**: 14 נכשלו, 87 עברו, שגיאה לא מטופלת אחת.
- אחרי הקוד: אותם שני קבצים — exit 0, 101 עברו; `pnpm -s typecheck` — exit 0.
- `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/youtube-analytics.json` — 12 מתוך 12 חלות.
- `scripts/sim-tree.sh --dir /tmp/claude-0/-home-user/ad9f6939-0ae8-504a-8945-82eb5f3c951c/scratchpad/tick75/analytics-scratch/sim
  -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/youtube-analytics.json` — 12 נהרגו, 0 שרדו, 35 שניות
  (בסיס 2.7 ו-1.7 ש'); העץ הוסר אחרי ההצלחה:
  - T75-A1 השער הפוך; A2 הסירוב יוצא ב-0; A3 ההסכמה נבדקת לפני השער; A4 `raw` נכתב; A5 `OUTPUT_PATH` חזר ל-`state/colony/
    measurements/`; A6 הריצה של `cliRun` כותבת לנתיב הישן; A7 `cliRun` קורא קובץ פסיקות אחר;
  - T75-B1 המחיקה הוסרה; B2 מחיקה בכל כשל רענון; B3 ההודעה שותקת על הפלט; B4 ענף "אין פלט" הוסר; B5 פלט שלא נמחק מדווח כנמחק.
- `scripts/verify.sh` על שלושת הקבצים שנקבו (`youtube-analytics`, `youtube-madeforkids`, `frozen-citations`) — **exit 0**:
  typecheck 0, 125 מתוך 125 עברו.
- `scripts/verify.sh` מלא (`src/__tests__/revenue`) — **exit 0**: 85 קבצים, 3,221 עברו, 2 דולגו, 104 שניות.
- הדיף של כל קומיט נבדק לתבנית השם ולסימן ה-at — 0 שורות שנוספו בכל אחד.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- הוספת שורה לטבלאות של `mutations/README.md` נעשתה ב-Python חד-פעמי עם assertions (שורות של אלפי תווים). `loop-edit.mjs`
  מסרב לקבצים מחוץ ל-`logs/` ו-`research/channel-loop/`; פקודת `insert-after` שלו, מורשית גם ל-README הזה, הייתה חוסכת את זה.
- תוכנית המוטציה נכתבה דרך סקריפט node חד-פעמי, כדי שהבריחה של `find` רב-שורתי ב-JSON תהיה נכונה. `mutate.mjs --add
  --id --find --replace --test --note` שבודק ייחודיות וכותב את ה-JSON היה חוסך את זה (אותה הצעה כמו ביומן סבב 73).

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת הפסיקה (63KB) — הקריאה הראשונה דרך `cat` נחתכה ונקראה שוב ב-Read; הכרחי, אבל כפול.
- קריאת `mutations/README.md` דרך `cat` נחתכה (50KB, שורות של אלפי תווים); נקרא שוב דרך `awk` עם קיצוץ שורות.
- תזכורות רשימת המשימות של החוט הראשי חזרו כמה פעמים עם כל 85 המשימות — רעש בהקשר.

## שאלות פתוחות לחוט הראשי
1. **ההדפסה ל-stdout עדיין נוקבת בחציון ובשעות הצפייה.** אם workflow יריץ את הסקריפט אי פעם, המספרים האלה — מחושבים מ-Authorized
   Data — יהיו ביומן ריצה ציבורי. היום שום workflow לא מריץ אותו (נבדק). הקיפול לא ביקש לשנות את ההדפסה; זה לשורת ה-analytics
   החדשה (קיפול 9) או לבניין ה-privacy-and-terms.
2. **המאגר הפרטי עדיין לא נקבע.** `OUTPUT_PATH` הוא ביניים: על runner מתארח הוא לא שורד את העבודה, כך ש-K0/K3 לא יקבלו סדרה
   מתמשכת עד שהמאגר ייקבע. אף קוד לא קורא את הפלט היום, אז אין קורא לנתב.
3. **הסטת מצביעים:** כל מצביעי הפסיקה ל-`scripts/youtube-analytics.ts` זזו — הכותרת `:1-19` → `:1-40`; `OPENID_DISCOVERY`
   `:35` → `:59`; `accessToken` `:50-72` → `:106-131`, משיכת ה-discovery `:51` → `:107`; ענף `invalid_grant` `:66-71` →
   `:123-130`; בדיקת ההסכמה `:83-87` → `:150-154`; הכתיבה `:110-115` → `:175-177` (ה-`raw` של `:114` נעלם). `:6-7` ו-`:8`
   (ההסכמה וקובץ ההעלאות) לא זזו. שורת FABLE_QUEUE החדשה של קיפול 9 מצטטת את `src/revenue/youtube-analytics.ts`, שלא השתנה.
4. **`mutation-plans.test.ts`:** `youtube-analytics.json` לא נוסף לרשימת התוכניות החובה (גם `experiments.json`
   ו-`youtube-madeforkids.json` מסבב 73 עדיין לא בה); לא נגעתי בה כדי לא להתנגש עם בונה מקביל.
5. השער שומר גם על מסמך ה-discovery ב-accounts.google.com, שעדיין לא נפסק (T1-RULING `:298-301`); כשהשער ייפתח, ה-host הזה
   ייקרא — ההחלטה עליו נשארת פתוחה, כפי שהפסיקה אומרת.
