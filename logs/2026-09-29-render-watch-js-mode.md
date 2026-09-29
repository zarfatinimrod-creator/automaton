# 29.9.2026 — מצב רינדור עם JavaScript ל-render-watch (`render-watch-js-mode`)

## 1. מה המשתמש ביקש

סוכן worktree שקיבל משימה מסקריפט workflow של ה-thread הראשי, לפי פסיקת מועצת הלולאה
(`research/channel-loop/RULING-2026-09-29-loop.md` פריט (b), "Tick 17-18, tooling"): מצב רינדור
אופציונלי שמריץ JavaScript ב-`render-watch`, לפי דגל בכל שורה של `urls.txt`. שישה חלקים:

1. תחביר ב-`urls.txt`: שדה שלישי `js`. `parseUrlList` מחזיר אותו. שורה בלי הדגל מתנהגת בדיוק כמו
   היום (לכידה זהה בית-לבית). דגל לא מוכר הוא שגיאה.
2. במצב JS: Chromium headless (`playwright-core` בגרסה מדויקת), ניווט אחד, המתנה לשקט ברשת או לתקרת
   זמן, ה-DOM המרונדר עובר באותו מסלול (`extractText` / meta / `sha256` / `redactSecrets` / זיהוי
   שינוי), וה-meta מציין איך רונדר. ניווט פשוט בלבד: בלי קליקים, בלי טפסים, בלי התחברות, בלי עוגיות
   או אחסון בין כתובות, בלי stealth, אותו `USER_AGENT` ואותן תקרות. הזרקת תלות כך שהבדיקות לא צריכות
   דפדפן או רשת.
3. סירוב קשיח ל-tiktok.com ולתת-דומיינים שלו בשני המצבים, בזמן הפענוח, עם הערה שמפנה ל-CHANNEL_LOOP §9
   ול-FABLE_QUEUE שורה 16(d).
4. `scripts/queue-zero-test.mjs`: אפשרות `--js` שמחייבת `--terms <slug>` של לכידה קיימת של תנאי השימוש
   של האתר; ה-slug נרשם בשורת ההערה. סירוב בלי `--terms` או כשהלכידה חסרה. דפי Salesforce נשארים
   חסומים לשורה רגילה ומותרים עם `--js`.
5. ה-workflow: להתקין דפדפן רק כשצריך, הרשאות מינימליות, תיעוד בכותרת וב-`research/rendered/README.md`.
6. בדיקת עשן מקומית אחת עם Chromium המותקן מראש ב-`/opt/pw-browsers`, בלי לשמור את הלכידה.

אסור היה לגעת ב-`research/rendered/urls.txt` וב-`research/channel-loop/ZERO-TESTS.md` (ה-thread הראשי
מוסיף את שורות ה-JS אחרי המיזוג), וגם לא ב-CHECKPOINT, CHANNEL_LOOP, FABLE_QUEUE, MISSION או CLAUDE.md.

## 2. הפעולות המרכזיות שביצעתי

- ה-worktree התחיל על בסיס ישן (`215b19b`, בלי `f378977` בהיסטוריה), ולכן עשיתי
  `git reset --hard origin/claude/new-session-j071dx` לפני שנגעתי בקובץ, והתקנתי תלויות
  (`pnpm install --frozen-lockfile --offline`, 3 שניות).
- קראתי את `render-watch.mjs`, את ה-workflow, את ה-README, את `queue-zero-test.mjs` ואת הבדיקות שלהם,
  וגם את פסיקת הלולאה (b), את CHANNEL_LOOP §9 ואת שורה 16 ב-FABLE_QUEUE.
- **קודם הבדיקות:** כתבתי את `src/__tests__/revenue/render-watch-js.test.ts` (דפדפן מדומה שרושם כל
  קריאה) ושמונה בדיקות חדשות ב-`queue-zero-test.test.ts`. ראיתי אותן נכשלות (42 כשלונות) לפני הקוד.
- `scripts/render-watch.mjs`:
  - `parseUrlList`: שדה שלישי כדגל (`FLAGS = {"js"}`). `js: true` נוסף לרשומה רק כשיש דגל. `js` אסור
    כ-slug. יותר משלושה שדות אסור. כתובת שלא עוברת פענוח ב-`new URL` נדחית. tiktok.com נדחה דרך
    `isTikTokHost`.
  - `renderWithBrowser`: הקשר (context) חדש לכל כתובת עם `browserContextOptions()` (אותו UA ואותו
    accept-language, `acceptDownloads: false`, `serviceWorkers: "block"`). חסימת tiktok.com בתוך הדף דרך
    `context.route` (abort `blockedbyclient`) ו-`context.routeWebSocket` (סגירה בקוד 1008). אחרי זה
    `goto` אחד (`domcontentloaded`, `TIMEOUT_MS`), המתנה ל-`networkidle` בזמן שנשאר, ו-`page.content()`
    עם תקרת `MAX_BYTES`. מצב JS שומר HTML בלבד. שגיאה נרשמת בשורה הראשונה בלבד, כדי שיומן הקריאות של
    Playwright לא ישנה את ה-meta מריצה לריצה.
  - `loadPlaywright` (עם `createRequire`, שמכבד את `NODE_PATH`), `launchChromium`, `jsRenderer` (דפדפן
    אחד לריצה, ניסיון הפעלה אחד; אם ההפעלה נכשלה או שהדפדפן התנתק באמצע, השורות מדולגות).
  - `buildMeta`: `renderedWith` ו-`networkIdle` נוספים רק לשורת JS. `bodyChanged` משווה גם את
    `renderedWith`, כך שמעבר של שורה בין מצב רגיל ל-JS כותב meta מחדש.
  - `main`: `--needs-browser` (מדפיס `js=true|false` ולא כותב כלום), גוף הלולאה הועבר ל-`captureEntry`,
    `js_skipped=N` נכתב ל-`$GITHUB_OUTPUT`, ו-`deps.launchBrowser` / `deps.delayMs` נוספו לבדיקות.
- `scripts/queue-zero-test.mjs`: `--js`, `--terms`, `hasRenderedText`, והזרקת `termsCaptured`.
- `.github/workflows/render-watch.yml`: שלב `mode` (`--needs-browser`), שלב התקנה מותנה
  (`npm install --prefix "$RUNNER_TEMP/render-watch-js" ... --ignore-scripts` בגרסה שקוראים מ-`package.json`,
  עם בדיקה שהגרסה מדויקת, ואז `cli.js install --with-deps --only-shell chromium`), `NODE_PATH` בשלב
  ה-fetch, ושלב אחרון שמכשיל את הריצה אחרי ה-commit אם `js_skipped` גדול מאפס. תיעוד בכותרת.
- `research/rendered/README.md`: סעיף "The js flag: a JavaScript-capable render", הסירוב ל-tiktok.com,
  ושדות ה-meta החדשים.
- `package.json` + `pnpm-lock.yaml`: `playwright-core` `1.63.0` (מדויק) ב-devDependencies.

## 3. קבצים/מערכות ששונו

- `scripts/render-watch.mjs`
- `scripts/queue-zero-test.mjs`
- `.github/workflows/render-watch.yml`
- `research/rendered/README.md`
- `package.json`, `pnpm-lock.yaml`
- `src/__tests__/revenue/render-watch-js.test.ts` (חדש, 44 בדיקות)
- `src/__tests__/revenue/queue-zero-test.test.ts` (8 בדיקות חדשות)
- `logs/2026-09-29-render-watch-js-mode.md` (הקובץ הזה)

לא שונו: `urls.txt`, `ZERO-TESTS.md`, `CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`,
`CLAUDE.md`. לא נשמרה אף לכידה של בדיקת העשן. שום דבר לא עלה כסף, לא נפתח חשבון ולא פורסם דבר.

## 4. החלטות והנחות משמעותיות

- **הדגל בא אחרי ה-slug, ו-`js` אסור כ-slug.** כך `URL js` לא יכול להפוך בשקט לשורה רגילה בשם "js".
  ברשימה האמיתית אין אף slug כזה (211 שורות נבדקו).
- **הצורה של רשומה רגילה לא השתנתה.** המפתח `js` מופיע רק כשיש דגל, ולכן כל הבדיקות הקיימות (108 ב-
  `render-watch.test.ts`) עוברות בלי שינוי. בנוסף, בדיקה חדשה משווה בית-לבית את הלכידה של שורה רגילה
  ברשימה מעורבת מול ריצה של אותה שורה לבד.
- **שינוי התנהגות קטן אחד בשורות רגילות:** כתובת שעוברת את ה-regex אבל לא את `new URL` נדחית עכשיו בזמן
  הפענוח. קודם היא הייתה נכשלת בזמן ה-fetch. אין שורה כזו ברשימה האמיתית.
- **tiktok.com נחסם בשלוש שכבות:** בפענוח (בשני המצבים, בקובץ וב-override), ב-`route` בתוך הדפדפן
  (הטמעה, סקריפט, הפניה, frame) וב-`routeWebSocket`. חסימת Service Workers נועדה לכך שדף לא יעקוף את
  ה-route. במצב הרגיל, הפניה (redirect) ל-tiktok.com לא נחסמת. זו מגבלה מתועדת: ההחלטה הייתה לא לשנות את
  `redirect: "follow"` של המצב הרגיל.
- **כשל host הוא לא התשובה של האתר.** אם אין `playwright-core` או Chromium, או שהדפדפן התנתק, שורות ה-JS
  מדולגות ולא נכתב עליהן כלום (הלכידה הקודמת נשארת). הסקריפט עדיין יוצא עם 0, כדי שהשורות הרגילות
  יישמרו ויעברו commit, ושלב אחרון ב-workflow מכשיל את הריצה. בחרתי בזה במקום exit לא-אפס כדי לא לשנות
  את התנאי של שלב ה-commit.
- **התקנה מחוץ ל-checkout:** `npm install --prefix $RUNNER_TEMP/...` (נבדק כאן: לא נוצר `package.json`,
  רק `node_modules/playwright-core`) ו-`NODE_PATH`. כך `git add research/rendered/` לא יכול לאסוף את
  החבילה, וריצה רגילה לא מתקינה כלום.
- **הגרסה: 1.63.0 ולא 1.56.1.** 1.56.1 תואמת בדיוק ל-Chromium שב-`/opt/pw-browsers` (revision 1194,
  Chromium 141), אבל היא מ-17.10.2025. ב-runner הגרסה קובעת באיזה Chromium ירוץ JavaScript של צד שלישי,
  ולכן העדפתי את 1.63.0 (4.9.2026, Chrome Headless Shell 153). בדקתי ש-1.63.0 מפעילה את ה-Chromium 141
  המקומי דרך `executablePath`.
- **סיכון שנשאר, ומתועד בכותרת ה-workflow:** ה-checkout מחזיק את ה-token עם הרשאת הכתיבה
  (`persist-credentials`, בשביל ה-commit), ו-Playwright מריץ את Chromium בלי ה-sandbox של מערכת ההפעלה
  כברירת מחדל. ההגנה היום היא הרשימה עצמה: כל שורת JS היא commit שנבדק ומפנה לתנאי השימוש. פיצול לשני
  jobs (רינדור לקריאה בלבד, ו-commit נפרד) היה מסיר את החשיפה, אבל זה שינוי במנגנון ה-commit שעובד ולא
  יכולתי לבדוק אותו כאן. זו החלטת אבטחה שמתאימה לבדיקה של Fable, לפי כלל הניתוב.
- **Shadow DOM:** `page.content()` לא כולל shadow roots. זה רלוונטי לדפי Salesforce מסוג LWR. תיעדתי
  ב-README שאם לכידת JS של Trolley חוזרת ריקה, זה החשוד הראשון.

## 5. שגיאות וניסיונות שנכשלו

- בסיס ה-worktree היה ישן (`215b19b`) ותוקן ב-reset כמו שהתדריך מורה.
- פקודות Bash מורכבות (לולאת `for` עם משתנה, heredoc של Python) נחסמו על ידי בודק הבידוד של ה-worktree.
  פיצלתי אותן לפקודות פשוטות, לסקריפטים ב-scratchpad ולעריכות ישירות.
- **בדיקת העשן מול https://github.com נכשלה ב-TLS:** `net::ERR_CERT_AUTHORITY_INVALID`, גם ב-headless shell
  וגם ב-Chromium המלא (revision 1194), גם עם 1.56.1 וגם עם 1.63.0. הסיבה היא ה-proxy המיירט של הקונטיינר:
  ה-Chromium הזה לא מקבל את ה-CA שלו, למרות שקיים `/root/.pki/nssdb`. לא עקפתי את אימות ה-TLS (ה-README של
  ה-proxy אוסר, והקוד חוסם `ignoreHTTPSErrors`). ב-runner אין יירוט TLS. מסלול השגיאה עצמו עבד כמו
  שתוכנן: meta עם `renderedWith: "chromium"`, `error` בשורה אחת, exit 0.
- `--dry-run --with-deps` ב-1.63.0 יוצא עם 1 כשחסרות חבילות מערכת (זה דיווח של `apt-get -s`, לא כשל).
  ב-1.56.1 אותה פקודה יצאה עם 0. המסלול האמיתי מריץ `apt-get` עם sudo.
- בדיקה אחת נכשלה בגלל הדפדפן המדומה, לא בגלל הקוד: הפעלה חוזרת של אותו אובייקט השאירה אותו "סגור"
  (אחרי שהוספתי את הבדיקה של `isConnected`). תוקן במדמה: הפעלה מחזירה דפדפן מחובר, כמו דפדפן אמיתי.

## 6. בדיקות ופעולות ולידציה

- `npx vitest run` על `render-watch.test.ts`, `render-watch-js.test.ts`, `queue-zero-test.test.ts`,
  `no-algora-requests.test.ts`: 4 קבצים, 173 בדיקות, כולן עוברות (108 הישנות של render-watch בלי שינוי).
- `pnpm typecheck`: יציאה 0.
- `npx vitest run src/__tests__/revenue`: 42 קבצים, 1103 בדיקות, כולן עוברות.
- **עשן אמיתי ומקומי (בלי רשת חיצונית):** דף "מעטפת JS" שהוגש מ-`127.0.0.1` ונכנס דרך `main()` עם Chromium
  141 מ-`/opt/pw-browsers` ו-playwright-core 1.63.0 (וגם 1.56.1):
  - הטקסט שה-JavaScript הכניס נלכד ("Identity verification / Upload a government ID..."), ו-`networkIdle: true`.
  - `fetch` ל-tiktok.com מתוך הדף הסתיים ב-`net::ERR_BLOCKED_BY_CLIENT`, ו-WebSocket ל-tiktok.com נסגר
    בקוד 1008.
  - הכתובת השנייה הגיעה בלי העוגייה שהדף הראשון קבע (context חדש), ושתי הבקשות נשאו את אותו UA ואותו
    accept-language כמו GET רגיל.
- שלב ההתקנה של ה-workflow הורץ כמו שהוא כתוב, רק עם `--dry-run` בשורה האחרונה: `playwright-core@1.63.0`
  הותקן תחת prefix זמני, בדיקת הגרסה המדויקת עברה, והפלט הראה שיותקן Chrome Headless Shell 153 (v1243).
- `NODE_PATH`: עותק של הסקריפט בלי `node_modules` מעליו מצא את החבילה עם `NODE_PATH`, ובלעדיו החזיר את
  הודעת הדילוג `MODULE_NOT_FOUND`.
- ה-CLI של `queue-zero-test` עם `--dry-run`: `--js` בלי `--terms` נדחה, `--terms` שחסר נדחה, `--js --terms
  algora-terms` "would queue ... (js)", ודף `/s/article/` בלי `--js` נדחה עם הפניה ל-`--js`. `git status`
  אחרי זה: `urls.txt` ו-`ZERO-TESTS.md` לא השתנו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- הרצה מקומית של שלב מ-workflow מתוך ה-YAML (פענוח עם `yaml`, החלפת שורה, `bash -c`). עשיתי את זה פעמיים
  כאן, ו-`brand-mail-workflow.test.ts` עושה את אותו דבר. עזר קטן ומשותף ב-`src/__tests__/` יחסוך את זה.
- מיפוי בין גרסת `playwright-core` ל-revision של Chromium עשיתי ידנית (`npm pack` ו-`browsers.json`).
  סקריפט קטן שמדפיס את המיפוי לגרסה מוצמדת יעזור בכל העלאת גרסה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- ניסיונות של heredoc ולולאות ב-Bash שנחסמו על ידי בודק הבידוד: בערך 4 סבבים.
- הצמדה ראשונה ל-1.56.1 ואחר כך מעבר ל-1.63.0: ריצה כפולה של ה-dry-run ושל העשן.
- בדיקת העשן מול github.com הורצה שלוש פעמים (שני קבצים בינאריים, שתי גרסאות), ובכולן אותה שגיאת TLS.
  בדיעבד, פעם אחת הייתה מספיקה כדי לזהות שהבעיה ב-CA של ה-proxy.
- קריאה חלקית של קובץ הבדיקות הקיים (1,596 שורות), רק החלקים שהיו נחוצים (העזרים ו-main). זה היה
  חיסכון, לא בזבוז.
