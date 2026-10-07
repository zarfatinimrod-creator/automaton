# טיק 60 (7.10.2026) — סוג חדש ב-`capture-check`: `nav-shell` (מעטפת שיש בה רק ניווט), ומסלול `--js --terms-shell` שמקבל אותו

בונה Opus, ב-worktree נפרד על הענף `build/tick60-nav-shell` (בסיס: `origin/claude/new-session-j071dx` ב-`4602c44`). לא נגעתי
ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בפסיקות, ב-`research/measurements/*`,
ב-`terms-verdicts.json`, ב-`urls.txt` או בלכידה כלשהי. לא הרצתי `git fetch`, `gh`, push או `git stash`. לא תורתי שום שורה: ה-thread
הראשי מתור את שורת adaptionlabs אחרי המיזוג.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים), לפי `logs/CHANNEL_LOOP.md` §9 "Queued 6.10 (tick 54)" פריט (5):

1. ב-`scripts/capture-check.mjs` סוג חדש, `nav-shell`, ללכידה שענתה 200, שה-HTML שלה גדול (20,000 בתים לפחות) והטקסט שלה קצר (מתחת לסף
   של `short`) וכולו ניווט: כל שורה לא ריקה קצרה (בערך 6 מילים לכל היותר), וה-HTML מחזיק הרבה תגיות `<a>` או `<script>` ביחס לטקסט. כלל
   פשוט ומתועד, שמסווג את `terms-adaptionlabs` כ-`nav-shell` ומשאיר כל לכידה אחרת במאגר בסוג שלה; הוכחה ב-`--all` לפני ואחרי. ה-evidence
   אומר בתים, תווים ומספר התגיות. הסדר: status ו-bot-challenge, אחר כך js-shell, אחר כך nav-shell, אחר כך short.
2. ב-`scripts/queue-zero-test.mjs`, במסלול `--js --terms-shell`: לכידה רגילה מסוג `nav-shell` מתקבלת כמו `js-shell` (אותו מסלול חד-פעמי,
   החלטה 3(2)); ההערה שנכתבת מעל השורה נוקבת בסוג ("nav-only shell" / "js shell"); כל סירוב אחר לא משתנה.
3. כל מקום שמונה את הסוגים (סיכום העבודה של render-watch, ה-README של `research/rendered`, כותרת `capture-check`, הערת `captureCheck`
   של `trim-capture`) לומד את הסוג החדש במידה שצריך.
4. בדיקות ב-`capture-check.test.ts` וב-`queue-zero-test.test.ts`, לפחות 6 מוטציות, הרצת שתי התוכניות ב-sim-tree, וה-README של התוכניות.
5. `verify.sh` ממוקד (capture-check, queue-zero-test, prize-terms-audit, render-watch, frozen-citations, mutation-plans) ומלא, ה-diff של
   `--all`, ו-`--dry-run` של המסלול על `terms-adaptionlabs`.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree כפי שנכתב; `git log --oneline -1` (`4602c44`) ו-`ls products/ src/revenue/` — הכל קיים, לא היה צורך ב-reset; קישור
   `node_modules`.
2. קראתי את החלטה 3 של `RULING-2026-10-06-robots-and-terms.md` (K1-K5, ותנאים (i)-(vi) של 3(2)), את `capture-check.mjs` כולו, את
   `queueTermsShell`, `termsGate` ו-`isShellTermsVerdict`, את הבדיקות ואת שתי תוכניות המוטציות, את הלכידה `terms-adaptionlabs` (מטא, טקסט:
   8 שורות, "Terms of Service", "Home", "Research", "Enterprise", "Resources", "Careers", ופעמיים "Login Login") ואת הרשומה של
   adaptionlabs.ai ב-`terms-verdicts.json` (TERMS_PENDING, הערה שנפתחת "shell: nav-only shell:") — קריאה בלבד.
3. הרצתי `node scripts/capture-check.mjs --all` לפני השינוי ושמרתי את הפלט (657 לכידות: status 81, ok 453, short 41, bot-challenge 5,
   js-shell 77). כתבתי סקריפט פרופיל קצר בתיקיית ה-scratch שמדפיס לכל לכידת `short` את בתי ה-HTML, התווים, מספר השורות, המילים המרביות
   בשורה, מספר ה-`<a>` ומספר ה-`<script>`. ממנו נבחר הכלל, כך שכל "כמעט" במאגר נשאר `short`:
   - Wunder Fund (`prize-wundernn-io-connectome-docs-quick-start-7dfa4b97`): 36,886 בתים, שורה אחת של 4 מילים, 42 סקריפטים, אפס קישורים —
     מכאן תנאי "3 שורות לפחות" (תפריט, לא כותרת לבדה);
   - CrunchDAO (ארבעה עמודי תחרות, 175-251 KB, 103-130 סקריפטים, 5 קישורים): כותרת של 7 עד 11 מילים מעל תפריט — מכאן "6 מילים לשורה לכל
     היותר" (עמוד datacrunch הוא בדיוק 7, כולל ה-"|");
   - StreetLib, n8n, Facer, PayPal, repebble, Algora: שורות ארוכות יותר, ו/או מעט מדי תגיות לטקסט (StreetLib: 56-64 תגיות ל-870-992 תווים)
     — מכאן "תגית `<a>` או `<script>` אחת לפחות לכל 10 תווים של טקסט".
4. `capture-check.mjs`: ארבעה קבועים מיוצאים (`NAV_SHELL_BYTES` 20,000, `NAV_MIN_LINES` 3, `NAV_LINE_WORDS` 6, `NAV_CHARS_PER_TAG` 10) עם
   הערה שמסבירה כל אחד ואת המקרה במאגר שקבע אותו; פונקציה `navShell(html, bare, text)` שמחזירה null או את ה-evidence ("nav-only shell: 8 lines
   of at most 3 words; 51664 bytes of HTML with 5 anchors and 27 scripts"); הבתים נספרים ב-UTF-8 על ה-HTML כפי שנשמר, התגיות על ה-HTML בלי
   הערות וסגנונות (`bare`). הבדיקה רצה רק כשהטקסט מתחת ל-`MIN_TERMS_TEXT`, והענף שלה בא ממש לפני ה-`short` (אחרי status, bot-challenge של דף
   אתגר, js-shell ו-bot-challenge של captcha), כך שרק לכידה שהייתה `short` יכולה להפוך ל-`nav-shell`. בכותרת הקובץ שורה לסוג החדש.
5. `queue-zero-test.mjs`: `SHELL_KINDS = { "js-shell": "a js shell", "nav-shell": "a nav-only shell" }` (מיוצא), הבדיקה
   `Object.hasOwn(SHELL_KINDS, graded?.kind ?? "")` במקום `!== "js-shell"`, ההערה "is <kind> (<words>) by scripts/capture-check.mjs", וסיבות
   הסירוב אומרות עכשיו "not js-shell or nav-shell" (במקום "not js-shell") — הסירובים עצמם לא השתנו. תיעוד הכותרת, `isShellTermsVerdict`
   וההערה ליד הבדיקה עודכנו.
6. קוראי הסוגים: `.github/workflows/render-watch.yml` (רשימת הסוגים בהערת הצעד), `research/rendered/README.md` (צעד 0 והפסקה על
   `--terms-shell`). `trim-capture.mjs` לא שונה: `captureCheck` שומר כל סוג ש-`classifyCapture` נותן, והתיאור שלו כללי. לא נמצאו קוראים
   נוספים (`grep js-shell` ב-`scripts/` וב-`src/`).
7. בדיקות: ב-`capture-check.test.ts` בלוק חדש "nav-only shells" (המקרה הבסיסי עם evidence מדויק; גבול הבתים — בדיוק 20,000 עובר, 19,999 short,
   ודף של 20,000 בתים ב-UTF-8 בפחות תווים עובר; גבול השורות — 3 עוברות, 2 short, שורות ריקות לא נספרות, כותרת לבדה short; גבול המילים — 6
   עובר, 7 short, ודף קצר עם משפט short; כלל התגיות — 8 תגיות ל-80 תווים עוברות, 7 לא, קישורים לבדם וסקריפטים לבדם, ותגית בתוך הערה לא
   נספרת; הסדר — דף ניווט שהוא גם js-shell, גם דף אתגר, או fetch שנכשל, מקבל את הסוג הקודם, וטקסט ארוך הוא ok), ושתי בדיקות על המאגר האמיתי
   (`terms-adaptionlabs` הוא `nav-shell` עם ה-evidence המדויק; חמשת ה"כמעט" נשארים `short`). ב-`queue-zero-test.test.ts`: fixture של מעטפת
   ניווט (ושל אותו דף עם משפט, ושל לכידה גזומה שהבלוק שלה רושם `nav-shell`), בדיקה שהמסלול מתור אותה עם ההערה "is nav-shell (a nav-only
   shell)", שהגזומה כשירה, ושהגרסה עם המשפט נדחית כ-short; שתי הבדיקות הקיימות של ההערה עודכנו ל-"is js-shell (a js shell)", ושני ביטויי
   הסירוב ל-"not js-shell or nav-shell".
8. מוטציות: 14 ב-`capture-check.json` (T60-N1..N14) ו-5 ב-`queue-zero-test.json` (T60-Q1..Q5); ה-find של T54-Q1 עקב אחרי הבדיקה החדשה.
   `mutate.mjs --check` על שתיהן: 59 מתוך 59 ו-43 מתוך 43. commit (`7191f94`), ואז הרצה ב-sim-tree (סעיף 6).

## 3. קבצים/מערכות ששונו

- `scripts/capture-check.mjs` — הסוג `nav-shell`, ארבעת הקבועים, `navShell`, שורה בכותרת.
- `scripts/queue-zero-test.mjs` — `SHELL_KINDS`, הבדיקה במסלול, ההערה, סיבות הסירוב, תיעוד.
- `.github/workflows/render-watch.yml` — הערה בלבד (רשימת הסוגים).
- `research/rendered/README.md` — צעד 0 והפסקה על `--terms-shell`.
- `src/__tests__/revenue/capture-check.test.ts`, `src/__tests__/revenue/queue-zero-test.test.ts` — בדיקות.
- `src/__tests__/revenue/mutations/capture-check.json`, `queue-zero-test.json`, `README.md` — המוטציות, הספירות והזמנים.
- `logs/2026-10-07-channel-loop-tick-60-nav-shell.md` — היומן הזה.

## 4. החלטות והנחות משמעותיות

1. **הכלל: ארבעה תנאים, לא שלושה.** התכנון של ה-thread הראשי נקב בשלושה (גודל, מילים לשורה, תגיות ביחס לטקסט). עם שלושה בלבד, עמוד ה-quick-start
   של Wunder Fund (36,886 בתים, שורה אחת "Wunder Fund RNN challenge", 42 סקריפטים) היה הופך ל-`nav-shell`, בניגוד לדרישה שכל לכידה אחרת
   תישאר בסוגה. הוספתי "3 שורות לא ריקות לפחות": ניווט הוא רשימה, וכותרת לבדה איננה ניווט.
2. **CrunchDAO נשאר `short` בגבול דק.** ארבעת עמודי התחרות של CrunchDAO הם, לעין, מעטפות ניווט בדיוק כמו של adaptionlabs (כותרת ותפריט של
   חמש תוויות, 100+ סקריפטים). הם נשארים `short` רק כי שורת הכותרת שלהם ארוכה מ-6 מילים (7 בעמוד datacrunch, כולל "|"). כך ביקשה המשימה;
   אם ה-thread הראשי ירצה שגם הם יסווגו כך, זה שינוי של `NAV_LINE_WORDS` או של ספירת השורה הראשונה, ושל בדיקת ה"כמעט" שמגינה עליו.
3. **הפסיקה נוקבת ב-`js-shell` מילולית.** 3(1) K4 ו-3(2)(i) כותבים "a page `capture-check` classifies `js-shell`". הקבלה של `nav-shell` למסלול
   נשענת על התכנון של ה-thread הראשי ועל §9 פריט (5) ("so the once-only js route of decision 3 can admit it"), לא על טקסט הפסיקה; לא ערכתי את
   הפסיקה. ייתכן שה-thread הראשי ירצה לרשום את זה כקיפול או תיקון לפסיקה.
4. **ההערה נוקבת בסוג בשני המקרים.** גם שורת js-shell תיכתב מעתה "is js-shell (a js shell) by scripts/capture-check.mjs" (קודם "is js-shell by
   …"). ההערות הקיימות ב-`urls.txt` (Israel Post, Kaggle) לא נגעתי בהן, ושום בדיקה לא קוראת אותן.
5. **ניסוח הסירוב השתנה במילים, לא בהתנהגות.** "not js-shell" נעשה "not js-shell or nav-shell", כי אחרת הסיבה הייתה שקרית (nav-shell עובר).
   מי שמחכה למחרוזת הישנה כ-substring עדיין מוצא אותה; ביטוי אחד בבדיקה (הגזום, "…not js-shell; only…") עודכן.
6. **הרצה חלקית של `capture-check.json` (מגבלת הזמן).** קובץ הבדיקות לוקח כ-24 שניות להרצה, כך ש-59 המוטציות היו לוקחות כ-25 דקות, מעבר ל-15
   הדקות שהמשימה התירה. הרצתי, כפי שהמשימה הורתה במקרה כזה, את 14 המוטציות החדשות ואת 7 הקיימות על הפונקציה שנגעתי בה (`classifyCapture`:
   T34-C1, C2, C3, C4, C9, T56-CC1, CC2). `mutate.mjs` אין לו בחירה לפי מזהה, אז התוכנית החלקית נגזרה מהקובץ המחויב לקובץ בתיקיית ה-scratch
   (נמחק עם התיקייה) — סטייה מכלל "תוכנית לא ב-scratch"; כל המוטציות נשמרו בתוכנית שבתיקיית הבדיקות. 24 המוטציות הקיימות האחרות (CLI, סיכום,
   git, worker, סימנים) נוגעות בקוד שלא שיניתי.
7. **בתים ב-UTF-8, תגיות בלי הערות.** `Buffer.byteLength(html, "utf8")` כדי שהסף יהיה בתים כמו `byteLength` של המטא (51,664 בשני המקרים);
   ספירת התגיות על `bare`, כמו סימני ה-JS, כדי שקישור בתוך הערה לא ייספר.

## 5. שגיאות וניסיונות שנכשלו

1. פונקציית הריפוד של ה-fixtures בבדיקה דרשה בתחילה שמספר הבתים החסר יתחלק ב-3 (כשמרפדים ב-"€") ונכשלה על "+2"; שיניתי אותה למלא כמה תווים
   רב-בתיים שנכנסים ולהשלים ב-x, כך שהדף בדיוק בגודל המבוקש.
2. לא היו שורדים בשום ריצת מוטציות, ולא נכשלה שום ריצה של `verify.sh`. הסטייה היחידה מהתהליך: תוכנית `capture-check.json` לא רצה במלואה
   (סעיף 6 וסעיף 4.6).

## 6. בדיקות ופעולות ולידציה

- `node scripts/capture-check.mjs --all` לפני ואחרי: יציאה 3 בשתיהן; הספירה עברה מ-"short 41" ל-"short 40, … nav-shell 1"; `diff` של הפלטים:
  שורה אחת בלבד, `terms-adaptionlabs` מ-`short	85 characters of text, fewer than 1000` ל-`nav-shell	85 characters of text, fewer than 1000; nav-only
  shell: 8 lines of at most 3 words; 51664 bytes of HTML with 5 anchors and 27 scripts`.
- `node scripts/queue-zero-test.mjs --js --terms-shell --url https://adaptionlabs.ai/terms-of-service --slug terms-adaptionlabs --dry-run`: יציאה 0,
  "Would queue terms-adaptionlabs (js, once only)", ההערה "… is nav-shell (a nav-only shell) by scripts/capture-check.mjs; adaptionlabs.ai is
  TERMS_PENDING. …", השורה `https://adaptionlabs.ai/terms-of-service	terms-adaptionlabs	js`, ותזכורת שהמעטפת לא הוקפאה (freeze-capture
  `--allow-flagged` לפני הרינדור). `sha256sum` של `urls.txt` זהה לפני ואחרי.
- `scripts/verify.sh` ממוקד על שישה קבצים (capture-check, queue-zero-test, prize-terms-audit, render-watch, frozen-citations, mutation-plans):
  typecheck יציאה 0, vitest יציאה 0, 481 בדיקות, "verify: passed" (51 שניות).
- `scripts/verify.sh` מלא (ברירת המחדל, `src/__tests__/revenue`): typecheck יציאה 0, vitest יציאה 0, 80 קבצים, 2,772 בדיקות עברו ו-2 דולגו,
  "verify: passed" (137 שניות; רץ במקביל לסוף ריצת המוטציות של capture-check).
- `node scripts/mutate.mjs --check --allow-dirty` על שתי התוכניות: 59/59 ו-43/43, יציאה 0.
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/queue-zero-test.json` (TMPDIR בתיקיית ה-scratch, על
  `7191f94`): 43 הוחלו, 43 נהרגו, 0 שרדו; יציאה 0; 312 שניות כולל הקמת העץ.
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan <התת-תוכנית של 21>`: 21 הוחלו, 21 נהרגו, 0 שרדו; יציאה 0; 564 שניות. שתי הריצות
  במקביל, וכל עץ נמחק אחרי שעבר.
- `git grep -n -i -E` עם התבנית הפרטית (מחוברת משני חצאים) על כל קובץ ששונה: לא הדפיס דבר (יציאה 1). אף שורה שהוספתי לא מכילה כתובת דוא"ל.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

1. **פרופיל של לכידות `short`.** כתבתי סקריפט חד-פעמי שמדפיס לכל לכידה קצרה בתים, תווים, שורות, מילים מרביות, קישורים וסקריפטים — הוא מה
   שהכריע את הכלל. אפשרות `capture-check --profile` (או עמודה ב-`--all`) הייתה חוסכת אותו בפעם הבאה שמכוונים סף.
2. **"diff של --all לפני ואחרי"** הוא בדיקה שכל שינוי בסיווג צריך; כרגע ידנית (שמירה לקובץ ו-`diff`). אפשר לשקול בדיקה קבועה שמשווה את
   סיווג המאגר לקובץ snapshot מוקפא — אבל המאגר משתנה בכל ריצה שבועית, אז היא צריכה לרוץ רק על לכידות מוקפאות.
3. **תוכנית מוטציות חלקית בזמן מוגבל.** `mutate.mjs` אין לו `--only <ids>`; בניתי קובץ תוכנית חלקי ב-scratch (סעיף 4.6). דגל בחירה היה חוסך את
   הקובץ ואת הסטייה מכלל "תוכנית לא ב-scratch".

## 8. על מה בוזבזו אסימונים, לפי פעולה

1. קריאת הקשר (הפסיקה, `capture-check.mjs` כולו, `queueTermsShell`, הבדיקות והתוכניות) — רוב העלות, אבל הכרחית: הסדר בין הענפים והטקסט של
   הודעות הסירוב נבדקים ב-regex מדויק.
2. רשימת המשימות של ה-harness שחזרה בכל תזכורת — רעש, לא בשליטתי.
3. ניסיון הריפוד שנכשל (סעיף 5.1) — הרצת בדיקה אחת נוספת.
