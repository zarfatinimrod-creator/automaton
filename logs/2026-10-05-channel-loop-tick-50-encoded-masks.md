# טיק 50 — מיסוך כתובות שה-@ שלהן מקודד, re-mask מצטבר, ו-freeze-capture שממסך את מה שהוא כותב

## 1. מה המשתמש ביקש

בניית הפריטים שתוכננו לטיק 50 ב-`logs/CHANNEL_LOOP.md` §10: §9 "Queued 5.10 (tick 48)" פריט 2 ו-"Queued 5.10 (tick 49)" פריט 3. שלושה חלקים, כל אחד בקומיט משלו, בגישת test-first והפתרון הפשוט ביותר שעובד:

- **A** — `scripts/render-watch.mjs`, `maskAddresses`: למצוא ולמסך גם כתובת שה-@ שלה כתוב `%40`, כתובת בהגנת הדוא"ל של Cloudflare (`data-cfemail="<hex>"` ו-`email-protection#<hex>`), ואם זול — גם escape של סקריפט (u0040 / x40 אחרי backslash). השם, החתימה וצורת ההחזרה של `redactSecrets` נשארים.
- **B** — `scripts/remask-captures.mjs`: capture שכבר נושא `remasked` מהריצה של 5.10 ומשתנה שוב — `remasked` מצטבר (`on` = התאריך החדש, `addresses` = הקודם + החדש) ולא מוחלף; ריצת dry-run אמיתית שלא כותבת דבר, ודיווח מספרים בלבד.
- **C** — `scripts/freeze-capture.mjs`: כל בייט שנכתב לעותק קפוא חדש (מהקובץ החי או מהיסטוריית git) עובר קודם `redactSecrets`, וה-meta מתעד זאת.

בלי `--apply` על `research/rendered` האמיתי (ה-thread הראשי מריץ אחרי המיזוג), בלי שינוי captures מלבד `research/rendered/README.md`, בלי push ובלי merge.

## 2. הפעולות המרכזיות שביצעתי

1. Setup: הבסיס `claude/new-session-j071dx` ב-`b974d1b` (מכיל את `b974d1b`); worktree ב-`scratchpad/tick50/wt` על הענף `build/tick50-encoded-masks`; `pnpm install --frozen-lockfile` (exit 0); baseline של `render-watch.test.ts` + `freeze-capture.test.ts`: exit 0, 159 בדיקות.
2. סקר בזיכרון של הצורות המקודדות ב-`research/rendered` (סקריפט scratch, צורות וספירות בלבד): 51 מופעי `%40` ב-26 קבצים, רובם handles (`/%40name`) ולא כתובות; 53 ערכי Cloudflare ב-16 קבצי html; 8 מופעי u0040 — כולם `@` ואחריו רווח בתוך טקסט, לא כתובות.
3. **חלק A** (קומיט `269df13`): הבדיקות נכתבו קודם (6 נכשלו, 1 עבר כ-guard), ואז המימוש:
   - ה-view שעליו רץ `ADDRESS_PATTERN` מפענח עכשיו גם percent escapes (`CHARACTER_REFERENCE` קיבל `%[0-9a-f]{2}`, ו-`decodeReference`), כך ש-`<local>%40<domain>` נקרא בדיוק כפי שהכלל הרגיל קורא `<local>@<domain>`; המסכה כותבת `[redacted:email]%40<domain>` (ה-`%40` נשמר כפי שנכתב).
   - ל-`ADDRESS_PATTERN` נוסף ה-@ כ-escape של סקריפט (`(@|\\u0040|\\x40)`, גם בתוך ה-lookbehind של סיסמת URL); המסכה שומרת את ה-escape.
   - `CLOUDFLARE` + `cloudflareDomain`: ה-hex מפוענח בזיכרון בלבד (הבייט הראשון הוא המפתח, XOR על השאר, UTF-8), ונכתב `[redacted:email]@<domain>`, או `[redacted:email]` לבד כשאין כתובת אחת (hex אי-זוגי/קצר, בלי @, שתי כתובות). query של mailto אחרי הכתובת (`?subject=`) מותר והולך עם המסכה. כל מופע נספר פעם אחת.
   - עודכנו הערת הכותרת ורשימת "לא נמצא" ב-README.
4. **חלק B** (קומיט `cb53dda`): הבדיקה R6 שונתה להתנהגות המצטברת; נוספו שתי בדיקות (capture ועותק קפוא שכבר עברו re-mask ב-5.10 ומקבלים עכשיו את הצורות המקודדות; ערך Cloudflare שאינו כתובת). מימוש: `MASKED` סופר כל צורה ש-`redactSecrets` כותב (@, `%40`, escape, ומסכה בלי דומיין), השורה "no domain kept" בסיכום, ו-`remasked.addresses` מצטבר.
5. **חלק C** (קומיט `ab8d301`): `maskCapture` ו-`maskedMeta` ב-`freeze-capture.mjs`; `planFreeze` כותב את הקבצים הממוסכים, ה-meta הממוסך הוא הבסיס ל-`frozenMeta`, ו-`plan.masked` מודפס ("would mask N" / "masked N"). `FOLD`, `EXT_TYPES` וכתיבת ה-meta עברו ל-`freeze-capture.mjs` (השכבה התחתונה) ו-`remask-captures.mjs` מייבא אותם (ו-re-export ל-`FOLD`), כדי שלא יהיו שני עותקים ולא import מעגלי.
6. בדיקות מוטציה (`scripts/mutate.mjs --plan`) לכל חלק, `scripts/verify.sh` פעמיים, ו-dry-run אמיתי של `remask-captures`.

## 3. קבצים/מערכות ששונו

- `scripts/render-watch.mjs` — `ADDRESS_PATTERN`, `CHARACTER_REFERENCE`, `decodeReference`, `CLOUDFLARE`, `cloudflareDomain`, `maskAddresses`, הערות.
- `scripts/remask-captures.mjs` — `MASKED`, `masksIn`, `summarize` (שורת "no domain kept"), `remaskedMetaText` (מאציל ל-`maskedMeta`), ייבוא `FOLD`/`EXT_TYPES`/`maskedMeta`, הערת הכותרת.
- `scripts/freeze-capture.mjs` — `FOLD`, `EXT_TYPES`, `maskedMeta`, `maskCapture`, `undated`, `dataOf`, `sameCapture`, `planFreeze` (`masked`), `cited` ו-`main` (הדפסת הספירה), הערת הכותרת.
- `src/__tests__/revenue/render-watch.test.ts` — describe חדש, 7 בדיקות.
- `src/__tests__/revenue/remask-captures.test.ts` — R6 שונתה; describe חדש, 2 בדיקות.
- `src/__tests__/revenue/freeze-capture.test.ts` — describe חדש, 5 בדיקות.
- `research/rendered/README.md` — רשימת "לא נמצא", ה-re-mask המצטבר, ו-freeze-capture שממסך.
- `logs/2026-10-05-channel-loop-tick-50-encoded-masks.md` — הלוג הזה.

לא נגעתי: אף capture, `FROZEN.sha256`, קבצי workflow, קבצי הלולאה, `logs/CHECKPOINT.md`.

## 4. החלטות והנחות משמעותיות

- **פענוח ב-view ולא חלופה ב-regex.** הניסיון הראשון (בזיכרון) היה להוסיף `%40` כחלופה ל-@. כיוון שמחלקת התווים של ה-local part כוללת `%` וספרות hex, החלופה בלעה משפטים מקודדים שלמים כ-local part (עד 143 תווים ב-capture של HackMD) ואיחדה שתי כתובות למסכה אחת, כך שדומיין אחד אבד מהספירה. עם view מפוענח, `%20` מסיים את ה-local part כמו רווח, `%2F` לפניו הופך אותו לנתיב (הכלל הרגיל), ו-`%2B` נשאר בתוכו ("percent escapes included"). בבדיקה בזיכרון על כל ה-captures השמורים זה לא מצא אף כתובת `@` רגילה חדשה: כל המסכות החדשות הן `%40` או Cloudflare.
- **escape של סקריפט** נכנס כי היה זול (אותה חלופה). במאגר אין היום אף כתובת כזו (8 המופעים הם `@` ואחריו רווח).
- **query של mailto ב-Cloudflare.** שניים משלושת הערכים שלא פוענחו לכתובת אחת היו כתובת ואחריה `?subject=`; הם שומרים עכשיו את הדומיין. השלישי אינו כתובת (דומיין שמסתיים בספרה) ומקבל מסכה בלי דומיין.
- **מסכה בלי דומיין** נספרת ככתובת ב-`remasked.addresses`, ובסיכום בשורה נפרדת ("no domain kept"), לא תחת אחד מחמשת הסוגים.
- **`--cited` משווה עותק קיים לגרסה הממוסכת**, ו-`sameCapture`/`dataOf` מתעלמים מ-`remasked.on` בלבד: עותק קפוא שעבר re-mask ב-5.10 וגרסה מההיסטוריה שממוסכת היום הם אותו capture. בלי זה, `--history` היה יוצר עותק כפול `<slug>-<day>-<commit>`.
- **אי-התאמה לבריף:** הבריף ציין 16 קבצים / 19 מופעים של `%40`. המסכה מוצאת 17 קבצים / 22 מופעים: הבריף ספר רק html/txt, והקובץ ה-17 הוא `amo-search-hebrew.json` (2 מופעים). Cloudflare: 16 קבצים / 53 מופעים, כמו בבריף.
- **מחוץ לתחום, נרשם ולא שונה:**
  1. `freeze-capture.mjs --cited` מדפיס לטרמינל שורת DRIFTED עם הטקסט המצוטט כפי שהיה בהיסטוריה (`then:`); אם בשורה הזו הייתה כתובת, היא מופיעה בפלט הטרמינל (לא בקובץ). תיקון של שורה אחת (`clip` דרך `redactSecrets`), אבל זה מחוץ לבריף.
  2. כתובת role (local part גנרי) בדומיין של המו"ל עצמו, מפוענחת מ-Cloudflare, כתובה בשלושה קבצי מחקר: `research/owner-asks/questions.json`, `research/owner-asks/brand-mailbox-questions.md`, `research/measurements/indiebook.md`. סוג: ארגון; כתובת תפקיד, לא אדם.
  3. `research/owner-asks/brand-mailbox-questions.md:76` ו-`:180` אומרים שכתובת "is decoded from `data-cfemail`" בשורה של capture. אחרי ה-re-mask של ה-thread הראשי ה-hex לא יהיה ב-capture (git history שומר אותו), ולכן הבדיקה של ההערה תצטרך את ההיסטוריה.
  4. ה-`%40` בדפי btl (14 קבצים, דומיין ממשלתי) נראה כמו מזהה טופס אחרי `=`; הכלל הרגיל היה ממסך גם את הגרסה עם `@`, ולכן גם הם ממוסכים.

## 5. שגיאות וניסיונות שנכשלו

- הודעת הקומיט של חלק A: רצף ה-escape u0040 שכתבתי בטקסט הפקודה הומר ל-`@` לפני שהגיע ל-git. תוקן ב-amend לנוסח בלי ה-escape (הקבצים עצמם נבדקו: ה-escape נשמר בהם).
- סקריפט עריכה (node) נכשל על מחרוזת שלא נמצאה; לא נכתב דבר, והורץ שוב בלי השורה השגויה.
- שני fixtures לא נאמנים: עותק קפוא שנערך בלי לעדכן את ה-sha256 שב-meta שלו, ו-capture שה-sha256 שלו `"ab"`. בשני המקרים הכלל הנכון (sha256 שאינו של הגוף נשאר) גרם לכישלון הבדיקה; תוקנו ה-fixtures, לא הקוד.
- בדיקה שוידאה שאין local part בכל פלט `cited` נכשלה בגלל הדפסת DRIFTED (סעיף 4, פריט 1); הצמצום לשורת ה-freeze.

## 6. בדיקות ופעולות ולידציה

- Baseline: `npx vitest run src/__tests__/revenue/render-watch.test.ts src/__tests__/revenue/freeze-capture.test.ts` — exit 0, 159 passed.
- `scripts/verify.sh src/__tests__/revenue/render-watch.test.ts src/__tests__/revenue/remask-captures.test.ts src/__tests__/revenue/freeze-capture.test.ts src/__tests__/revenue/frozen-citations.test.ts src/__tests__/revenue/narration-licence-gate.test.ts src/__tests__/revenue/capture-check.test.ts src/__tests__/revenue/prize-terms-audit.test.ts` — exit 0 (typecheck exit 0; 7 files, 385 passed, 1 skipped: `skipIf` של ארכיון שאינו בקונטיינר, קיים מקודם).
- `scripts/verify.sh` (ברירת המחדל, `src/__tests__/revenue`) — exit 0 (typecheck exit 0; 73 files, 2418 passed, 1 skipped).
- מוטציות (`node scripts/mutate.mjs --plan <plan> --test ...`), כולן killed:
  - A (render-watch.test.ts), 12/12: A1 בלי פענוח `%XX`; A2 בלי `email-protection#`; A3 מפתח XOR שגוי; A4 Cloudflare שומר את הכתובת כולה; A5 `%40` שומר את ה-local part; A6 ספירה 0 ל-Cloudflare; A7 מסכה לשם asset; A8 `@` במקום `%40`; A9 בלי u0040; A10 מסכה בלי דומיין כותבת דומיין; A11 hex אי-זוגי מפוענח; A12 hex לא חייב לסיים token.
  - B (remask-captures.test.ts), 6/6: B1 `addresses` מוחלף; B2 `on` הקודם נשמר; B3 `%40` לא נספר; B4 מסכה בלי דומיין לא נספרת; B5 מסכה בלי דומיין נספרת תחת סוג; B6 שורת "no domain kept" לא מודפסת.
  - C (freeze-capture.test.ts + remask-captures.test.ts), 13/13: C1 כתיבת הבייטים הלא-ממוסכים; C2 meta לא ממוסך; C3 הטקסט לא ממוסך; C4 `--cited` משווה גרסה לא ממוסכת; C5 `sameCapture` משווה `remasked.on`; C6 `dataOf` משווה `remasked.on`; C7–C8 B1–B2 שוב על הקוד שעבר; C9 sha256 לא של הגוף הממוסך; C10 ו-C13 בלי ספירה בפלט; C11 `addresses` 0; C12 `redacted` לא גדל.
- dry-run אמיתי: `node scripts/remask-captures.mjs --dry-run` ב-worktree — exit 3 (יש מה לשנות), `git status --short research/rendered | wc -l` = 0 לפני ואחרי, ואין בפלט מחרוזת בצורת כתובת. 553 captures; ישתנו 33 captures ו-33 קבצים (32 html, 1 json); 75 מסכות: free-mail 3, ארגון או אוניברסיטה 56, רשימת תפוצה 0, ממשלה 14, placeholder 1, בלי דומיין 1; עותקים קפואים ביניהם: 9 (9 קבצים, ושורותיהם ב-`FROZEN.sha256`); asset names: 0; קבצים שאף meta לא מציין: 0; שורות מצוטטות שישתנו: 4 (5 ציטוטים); pins שיתיישנו: 0.
- grep מזהי הבעלים (התבנית שבבריף, case-insensitive) על הקבצים ששונו: 0; grep על ה-diff לכתובת (@ בין תווי מילה שאינו `[redacted:email]@`): 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- כל עריכה מדויקת בקבצי `.mjs`/`.ts` נעשתה בסקריפט node חד-פעמי עם פונקציית `swap` (מחרוזת שמופיעה פעם אחת בדיוק). `scripts/loop-edit.mjs` עושה זאת רק לקבצי הלולאה; כלי כללי `exact-edit` (find פעם אחת, replace, בלי שינוי בשום בייט אחר) היה חוסך את זה.
- תוכניות המוטציה (31 מוטציות) נכתבו שוב לתיקיית scratch שנמחקת — זה §9 tick 49 פריט 5 (`src/__tests__/revenue/mutations/<script>.json`).
- סקר בזיכרון של "מה המסכה תשנה בכל ה-captures, לפי צורה" נכתב כ-scratch בפעם השלישית; הוא חופף ל-`remask-captures --dry-run`, ושבירה לפי צורה (@ / `%40` / escape / Cloudflare) הייתה יכולה להיות שורה בסיכום שלו.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `freeze-capture.mjs` (1,242 שורות) כדי למצוא את נקודות הכתיבה וה-reuse: נחוץ, אבל יקר; רוב הקובץ (סריקת ציטוטים) לא היה רלוונטי.
- ניסיון החלופה `%40` ב-regex (סעיף 4) והמדידה שהפריכה אותו: שתי ריצות סקר.
- שלוש ריצות בדיקה שנכשלו בגלל fixtures לא נאמנים (סעיף 5).
- תיקון הודעת הקומיט בגלל המרת ה-escape.
- ריצות המוטציה עצמן (31 ריצות של vitest, כ-10 שניות כל אחת ב-B וב-C) — זמן ולא אסימונים, אבל הפלט נקרא.

## תוספת: תיקוני ה-fixer אחרי ה-review (5.10.2026)

### 1. מה המשתמש ביקש

סקריפט ה-workflow ביקש לתקן כל ממצא "blocking" ו-"fix" ב-review של הבנייה הזו (worktree `build/tick50-encoded-masks` בלבד; בלי push, בלי merge, בלי `--apply` על `research/rendered` האמיתי), לשחזר כל ממצא לפני התיקון, לתקן בדיקה-תחילה, להריץ שוב את `scripts/verify.sh`, את המוטציות של ה-builder ושל ה-reviewer שנוגעות בקוד שהשתנה, ואת ה-dry-run האמיתי, ולהוסיף סעיף ללוג הזה.

### 2. הפעולות המרכזיות שביצעתי

- **שחזור לפני תיקון.** probe שמריץ את ה-masker של `b974d1b` (מ-`git show`) מול זה של HEAD על חמש כתובות שנבנו בזמן ריצה (אחרי `%2F`, אחרי `%5C`, בתוך `{"next":"%2Fusers%2F…"}`, אחרי `Mail%20me%3A%2F`, ואחרי `https%3A%2F%2Fh.org%2Fp%3A`): ה-masker הישן מיסך 1 בכל אחד, HEAD מיסך 0 והשאיר את ה-local part. probe שני על hex של Cloudflare שנבנה בזמן ריצה: `data-cfemail=\"…\"` (JSON), `&quot;`, `&#34;`, ה-escape u0022, ובלי מרכאות — count 0 וה-hex נשאר בכולם; גרש בודד מוסך (אבל בלי בדיקה), וסיסמת URL שה-@ שלה escape נשארה (נכון, בלי בדיקה).
- **בדיקות תחילה (red).** 3 בדיקות חדשות ב-`render-watch.test.ts`, אחת ב-`remask-captures.test.ts`, והבדיקה של `--cited --history` ב-`freeze-capture.test.ts` הורחבה. לפני התיקון: 3 נכשלו (הרגרסיה, צורות Cloudflare, הדפסת DRIFTED) ושתיים עברו (הן מצמידות התנהגות קיימת, כדי להרוג את המוטציות R4 ו-R5 ששרדו).
- **`maskAddresses` בשלושה שלבים.** (1) Cloudflare; (2) הכלל כפי שהיה לפני טיק 50, על הטקסט שבו מפוענחים רק character references — כל @ רגיל ו-escape של script נקראים כאן, וה-local part נקרא מהטקסט הגולמי (שם `%2F` הוא שלושה תווים של local part, לא לוכסן); (3) אותו כלל על הטקסט שבו גם percent escapes מפוענחים — צורת `%40`, ו-@ רגיל שהשלב הקודם השאיר רק כי המילה שלו נמשכה דרך percent escape (`/search/Contact%20<local>@…`). הפונקציה `maskView` היא לולאת ה-view הקודמת, עם regex ה-references כפרמטר.
- **`CLOUDFLARE`.** הקידומת לפני ה-hex: `data-cfemail=` ואחריו `"` או `'` (גם עם backslash לפניו, כמו ב-JSON), ה-escapes u0022 ו-x22, `&quot;`, `&#34;`, `&#x22;`, או כלום; הקידומת נכתבת כפי שהייתה.
- **`freeze-capture --cited`.** `clip` מעביר את הטקסט דרך `redactSecrets` (text/plain) לפני שהוא חותך ל-400 תווים, כך ששורת `then:` של DRIFTED (מתוך git history) ושורת `now:` מודפסות ממוסכות. מיסוך לפני חיתוך: חיתוך לא יכול לפצל כתובת שהמסכה הייתה מוצאת.
- **תיעוד שתואם את הקוד.** הערת הכותרת של `ADDRESS_PATTERN` ושל `maskAddresses` אומרות איזה כלל קורא איזה טקסט, אילו צורות Cloudflare נמצאות ואילו לא (`\\\"` — JSON בתוך JSON — ו-`&amp;quot;`), ושכל `email-protection#` שאחריו מילה של ספרות hex בלבד הופך למסכה בלי דומיין (over-mask לא מזיק). הכותרת של `freeze-capture.mjs` ו-`research/rendered/README.md` אומרות מתי sha256/byteLength של meta קפוא עוקבים אחרי המסכה, ושה-`--cited` ממסך את מה שהוא מדפיס.
- **השוואה דיפרנציאלית בזיכרון** (ספירות בלבד, בלי טקסט): על 902 קבצי הטקסט ב-`research/rendered` ב-HEAD וב-`b339013^` (לפני ה-re-mask של 5.10).

### 3. קבצים/מערכות ששונו

- `scripts/render-watch.mjs` — `maskAddresses` + `maskView` (שני מעברים), `CHARACTER_REFERENCE` (בלי percent) ו-`REFERENCE_OR_ESCAPE` (עם), `CLOUDFLARE` הרחב, הערות.
- `scripts/freeze-capture.mjs` — `clip` ממסך; הערת הכותרת.
- `src/__tests__/revenue/render-watch.test.ts` — 3 בדיקות.
- `src/__tests__/revenue/remask-captures.test.ts` — בדיקה אחת (מסכת escape נספרת תחת סוג הדומיין), והשומר של ה-dry-run האמיתי בודק גם `%40` ו-escapes.
- `src/__tests__/revenue/freeze-capture.test.ts` — בלי הצמצום לשורות `froze `: אין local part בשום פלט של `cited()`, ב-dry run וב-apply.
- `research/rendered/README.md` — רשימת "Still not found", איזה כלל קורא איזה טקסט, וכלל ה-sha256 של עותק קפוא.
- הלוג הזה. שום capture, שום yml ושום קובץ לולאה לא השתנו.

### 4. החלטות והנחות משמעותיות

לכל ממצא:
- **blocking (רגרסיה של @ רגיל אחרי `%2F`/`%5C`/`%3A`) — תוקן.** ה-reviewer הציע להריץ את המעבר הגולמי *אחרי* המעבר המפוענח. בחרתי *לפני*: כך כל מסכה של @ רגיל זהה בייט-בבייט למה שה-masker הישן כותב. בסדר ההפוך, המעבר המפוענח ממסך קודם ועלול להשאיר גלויה קידומת שהישן מיסך (למשל local part עם `%27`: הישן מיסך את כולו, המפוענח רק את מה שאחרי הגרש). הוכחה על הנתונים: `now(x) === now(base(x))` בכל 902 הקבצים ב-HEAD וב-`b339013^`, ו-`now` אידמפוטנטי בכולם; ה-masker הישן לא מוצא כלום בפלט החדש (0 בשני המקומות). ב-HEAD הפלט החדש זהה בייט-בבייט לפלט של ה-builder בכל 902 הקבצים (75 מסכות בשניהם), ולכן ה-dry-run לא משתנה. ב-`b339013^` (לפני ה-re-mask) 5 קבצים שונים מפלט ה-builder, באותו מספר מסכות (989): היקף המסכה של @ רגיל חוזר להיקף הישן.
- **fix (צורות Cloudflare מוברחות/בלי מרכאות) — תוקן** בהרחבת הקידומת (לא רק בתיעוד), עם בדיקה לכל צורה. הצורות שעדיין לא נמצאות נכתבו בכותרת וב-README.
- **fix (3 מוטציות ששרדו) — תוקן.** בדיקות לגרש בודד, לסיסמת URL שה-@ שלה u0040/x40 (וגם `@` ו-`%40` באותה בדיקה), ולסיכום של remask עם מסכת escape (government 2, בלי "no domain kept"). R3 עצמה כבר לא ניתנת להחלה (ה-regex השתנה); המקבילה שלה היא F4 (הסרת `'` מהמחלקה).
- **fix (`--cited` מדפיס טקסט מההיסטוריה בלי מסכה) — תוקן** כפי שהוצע, אבל עם `utf8` ולא `latin1`: `r.then` הוא מחרוזת שפוענחה כ-UTF-8 (`textOf`), ו-`Buffer.from(s, "latin1")` היה משחית עברית. `redactSecrets` קורא את הבייטים כ-latin1 ומחליף רק טווחי ASCII, כך שבייטים מרובי-בתים עוברים כפי שהם.
- **note (over-mask של `email-protection#<hex>` ושל `\U0040`) — נשאר, ותועד.** עיגון ל-`cdn-cgi/l/` היה מפספס עוגן בתוך JSON (`cdn-cgi\/l\/`), ו-over-mask לא חושף דבר; התאמה רגישת-רישיות בתוך regex עם `/i` דורשת modifiers ש-Node בגרסה הזו לא בהכרח תומך בהם.
- **note (sha256 של עותק קפוא עוקב רק כשהיה של הגוף) — נשאר**, לפי הכלל של remask; עכשיו כתוב בכותרת וב-README. הסטייה מהניסוח המילולי של ה-spec (Part C: "sha256 and byteLength are of the masked body"): meta שה-sha256 שלו לא היה של הגוף השמור (redaction ידנית) שומר אותו. בכל meta ש-render-watch כותב זה אותו דבר.
- **note (השומר של ה-dry-run האמיתי בודק רק @) — תוקן** (זול): `(?:@|%40|\\u0040|\\x40)`, case-insensitive.
- **note (שלושה קבצי מחקר עם מחרוזות בצורת כתובת: 28, 12, 4) — נשאר, מחוץ ל-scope.** לתור של ה-main thread: סיווג לפי סוג (תפקיד, מותג, placeholder, אדם), והערה בת שורה ב-`brand-mailbox-questions.md` שה-hex נמצא בהיסטוריה מקומיט ה-re-mask ואילך.
- **note (`classifyFiles` כותב בייטים לא ממוסכים ל-`os.tmpdir()`) — נשאר.** התיקייה נמחקת ב-`finally`, הבייטים לא מגיעים לריפו ולא לטרמינל, ו-`classifyFiles` נקרא גם ב-`sourceVersion` לפני שנבחרת גרסה: סיווג של בייטים ממוסכים יכול לתת פסק דין אחר מזה ש-capture-check נותן ל-capture החי (סף "short"), כלומר שינוי התנהגות מחוץ לשלושת החלקים.
- **note (הבסיס זז ל-`007e304`) — אין פעולה**; רק `state/colony` השתנה שם.
- לא נמצא ממצא שדחיתי.

### 5. שגיאות וניסיונות שנכשלו

- שכבת הכלים המירה רצף backslash-u שהקלדתי בפקודה לתו עצמו (בפעם השלישית בטיק הזה): עריכה שמחרוזת ה-find שלה הכילה u0040 לא נמצאה (0 מופעים, לא נכתב דבר); הערה ב-`render-watch.mjs` קיבלה `"` במקום ה-escape u0022 (תוקן); והודעת הקומיט של התיקון קיבלה `"` במקום אותו escape (תוקנה ב-amend). מעקף: עזר עריכה שבו `\` מוחלף ב-backslash, ותוכניות מוטציה שנבנות מאותו placeholder.

### 6. בדיקות ופעולות ולידציה

- red לפני התיקון: `npx vitest run` על שלושת קבצי הבדיקה עם `-t` של הבדיקות החדשות — exit 1, 3 failed, 18 passed.
- `scripts/verify.sh src/__tests__/revenue/render-watch.test.ts src/__tests__/revenue/remask-captures.test.ts src/__tests__/revenue/freeze-capture.test.ts src/__tests__/revenue/frozen-citations.test.ts src/__tests__/revenue/narration-licence-gate.test.ts src/__tests__/revenue/capture-check.test.ts src/__tests__/revenue/prize-terms-audit.test.ts` — exit 0 (typecheck exit 0; 7 קבצים, 389 passed, 1 skipped — אותו `skipIf` של ארכיון ה-narration שאינו בקונטיינר).
- `scripts/verify.sh` (ברירת המחדל) — exit 0 (typecheck exit 0; 73 קבצים, 2422 passed, 1 skipped).
- מוטציות (`node scripts/mutate.mjs --plan <plan> --json <out>`), אחרי הקומיט (הכלי דורש קבצים נקיים):
  - `render-watch.mjs` נגד `render-watch.test.ts`: 26 הוחלו, 26 killed, 0 survived. A1–A12 של ה-builder (A2 על הקידומת החדשה: `)?|email-protection#)` → `)?)`), R1, R2, R4 של ה-reviewer, ו-F1–F11 חדשות: F1 בלי המעבר הגולמי (הרגרסיה עצמה); F2 בלי המעבר המפוענח; F3 בלי `\"`; F4 בלי `'` (מקבילת R3); F5 בלי `&quot;`; F6 בלי `&#34;`; F7 בלי `&#x22;`; F8 בלי u0022; F9 בלי x22; F10 מרכאות חובה; F11 ספירת המעברים נזרקת.
  - `freeze-capture.mjs` ו-`remask-captures.mjs` נגד `freeze-capture.test.ts` + `remask-captures.test.ts`: 22 הוחלו, 22 killed, 0 survived: F12 (`clip` בלי מסכה), C1–C13 של ה-builder (C7–C8 הן B1–B2 על הקוד שעבר ל-`freeze-capture.mjs`; B1–B2 עצמן כבר אינן ב-`remask-captures.mjs`), R6–R8 של ה-reviewer, B3–B6 של ה-builder ו-R5 של ה-reviewer. בסך הכול 48 הוחלו, 48 killed. המוטציות רצו על הקומיט `cd16bb7`; ה-amend ל-`327384d` שינה רק את ההודעה, לא את העץ.
- dry-run אמיתי אחרי התיקונים: `node scripts/remask-captures.mjs --dry-run` ב-worktree — exit 3; `git status --short --untracked-files=all research/rendered | wc -l` = 0 לפני ואחרי; 0 מחרוזות בצורת כתובת בפלט (@, `%40` או escape). 553 captures, 520 ללא שינוי; ישתנו 33 captures ו-33 קבצים (32 html, 1 json); 75 מסכות: free-mail 3, ארגון או אוניברסיטה 56, רשימת תפוצה 0, ממשלה 14, placeholder 1, בלי דומיין 1; עותקים קפואים: 9 (9 קבצים); asset names: 0; קבצים שאף meta לא מציין: 0; שורות מצוטטות שישתנו: 4 (5 ציטוטים, אותם זוגות file:line שה-builder מנה); pins שיתיישנו: 0. זהה למספרים שלפני התיקון, כצפוי מההשוואה הדיפרנציאלית.
- היגיינה על הקבצים ששונו מול `b974d1b`: grep מזהי הבעלים — 0; כתובות בשורות שנוספו (@, `%40` או escape בין תווי מילה) — 0; hex של Cloudflare בשורות שנוספו — 0; שם מודל בשורות שנוספו — 0 (הפגיעה היחידה של התבנית היא שם הענף `claude/new-session-j071dx` בסעיף 2 של ה-builder, לא שם מודל).

### 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- תוכנית המוטציות של ה-builder (31) נבנתה מחדש מתוך הטקסט המקוצר בדוח שלו, כי התוכניות נמחקו עם תיקיית ה-scratch — שוב §9 tick 49 פריט 5 (`src/__tests__/revenue/mutations/<script>.json`). עכשיו הן 48.
- עזר עריכה עם placeholder ל-backslash נכתב שוב; כלי `exact-edit` בריפו שקורא find/replace מקבצים (ולא מטקסט הפקודה) היה פותר גם את בעיית ה-escapes.
- ההשוואה הדיפרנציאלית "masker ישן מול חדש על כל ה-captures" נכתבה בפעם הרביעית (ה-builder, ה-reviewer, וכאן פעמיים): היא יכולה להיות מצב `--compare <ref>` ב-`remask-captures.mjs`.

### 8. על מה בוזבזו אסימונים, לפי פעולה

- שחזור תוכנית המוטציות מהדוח (מציאת כל מחרוזת find בקוד).
- שלוש עריכות חוזרות בגלל המרת ה-escapes.
- קריאת `cited()`, `citationVersion` ו-`maskedMeta` ב-`freeze-capture.mjs` כדי לוודא שהטקסט המודפס הוא UTF-8 ושאין עוד נקודת הדפסה של טקסט מההיסטוריה (`REFUSED` מדפיס evidence של capture-check, שאינו מצטט טקסט).
