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
- **tiktok.com (כפי שנבנה בסבב הראשון):** נחסם בפענוח (בשני המצבים, בקובץ וב-override), ב-`route` בתוך
  הדפדפן וב-`routeWebSocket`, וחסימת Service Workers נועדה לכך שדף לא יעקוף את ה-route. **הטענה שה-route
  חוסם גם הפניה הייתה שגויה:** Playwright קורא ל-handler של `route` רק עבור הכתובת הראשונה בשרשרת הפניות,
  ולכן דף שענה `302 → www.tiktok.com` נלכד ונשמר. גם במצב הרגיל `redirect: "follow"` עקב אחרי הפניה
  ל-tiktok.com. שני אלה תוקנו בסבב התיקונים (למטה).
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
- **סיכון ה-token (כפי שנבנה בסבב הראשון):** ה-checkout החזיק את ה-token עם הרשאת הכתיבה
  (`persist-credentials` כברירת מחדל), ו-Playwright מריץ את Chromium בלי ה-sandbox של מערכת ההפעלה כברירת
  מחדל. בסבב התיקונים ה-checkout כבר לא שומר את ה-token, והוא ניתן רק לשלבי ה-pull וה-push (למטה). פיצול
  לשני jobs (רינדור לקריאה בלבד ו-commit נפרד) היה הולך רחוק יותר, ולא נבנה.
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

---

# סבב התיקונים אחרי הביקורת (29.9.2026, Opus fixer)

## 1. מה המשתמש ביקש

סקריפט ה-workflow העביר ל-Opus fixer את דוח הבונה ואת שבעת הממצאים של הסוקר על `b1fcb06`: לאמת כל ממצא,
לתקן כל ממצא שמחזיק, לרשום כאן ממצאים שנדחו ולמה, להריץ שוב את הבדיקות, `pnpm typecheck` ו-
`npx vitest run src/__tests__/revenue`, ולעשות commit. בלי `git stash`, בלי push, ובלי לגעת ב-CHECKPOINT,
CHANNEL_LOOP, FABLE_QUEUE, MISSION ו-CLAUDE.md.

## 2. הפעולות המרכזיות שביצעתי

קודם אימתתי כל ממצא מול Chromium 141 אמיתי (`/opt/pw-browsers`) ו-playwright-core 1.63.0, עם סקריפטי הניסוי
של הסוקר ועם סקריפטים משלי. כל שבעת הממצאים החזיקו. אחר כך תיקנתי:

1. **הפניה ל-tiktok.com במצב JS (חוסם).** Chromium מופעל עכשיו עם `--host-resolver-rules`, כך ששום שם של
   tiktok.com לא נפתר (`chromiumLaunchOptions`, `TIKTOK_HOST_RESOLVER_RULES`). **הכלל שהסוקר הציע לא הספיק:**
   בדקתי ומצאתי ש-`www.tiktok.com.` (עם נקודה בסוף, ש-DNS פותר רגיל) עוקף את `MAP *.tiktok.com`. לכן נוספו
   גם `MAP tiktok.com.` ו-`MAP *.tiktok.com.`. `route` ו-`routeWebSocket` נשארו כשכבה שנייה. בנוסף, מאזין
   `request` על הדף מזהה ניווט של ה-main frame ל-tiktok.com (הפניית שרת או סקריפט של הדף), ו-
   `tiktokHostInChain` בודק את `response.url()` ואת שרשרת `redirectedFrom()`. דף כזה לא נשמר, וה-meta אומר
   `redirected to tiktok.com (<host>); not followed` במקום `ERR_NAME_NOT_RESOLVED` שמאשים את האתר.
2. **הפניה ל-tiktok.com במצב הרגיל.** `fetchOne` עוקב עכשיו אחרי הפניות בעצמו (`redirect: "manual"`),
   עד `MAX_REDIRECTS` = 20, ובודק כל קפיצה לפני שהוא מבקש אותה. קפיצה ל-tiktok.com נרשמת עם הסטטוס של ההפניה
   ובלי גוף.
3. **תקציב 30 השניות לא כלל את `page.content()`.** `page.content()` רץ עכשיו מול הזמן שנשאר
   (`withinBudget`). אם הזמן נגמר, ה-context נסגר (וזה משחרר את הקריאה התקועה) ונרשם timeout. ל-job נוסף
   `timeout-minutes: 30`.
4. **שער ה-`--terms` קיבל כל קובץ `.txt`.** `checkTermsCapture` ב-`queue-zero-test.mjs` דורש עכשיו:
   - meta בלי שגיאה ועם סטטוס 2xx;
   - לפחות `MIN_TERMS_TEXT` (1,000) תווי טקסט, כך שמעטפת JS ריקה לא עוברת;
   - שהלכידה לא תהיה הדף עצמו, ולא `urls` או ה-slug של השורה;
   - שהלכידה באה מאותו אתר (`siteOf`: הדומיין הרשום, בקירוב) או מאתר ש-`TERMS_ELSEWHERE` רושם עבורו.
5. **דפדפן שמת באמצע שורה.** אחרי שגיאה, `jsRenderer` בודק `browser.isConnected()`. אם הדפדפן מנותק, גם
   השורה שהייתה באמצע מדולגת ולא נכתב עליה כלום. ההודעות אומרות עכשיו "the browser was unavailable" במקום
   "no browser could be started".
6. **ה-token לכתיבה.** ב-checkout יש `persist-credentials: false`. ה-token מועבר רק לשלב ה-pull ולשלב ה-push,
   כ-`http.https://github.com/.extraheader` דרך `GIT_CONFIG_COUNT`/`KEY_0`/`VALUE_0` (אותה כותרת ש-
   actions/checkout כותב, אבל בסביבה של השלב ולא ב-`.git/config`). בשלב ה-fetch, שבו Chromium מריץ JavaScript
   של צד שלישי, אין credential לכתיבה.
7. **אפשרויות ההפעלה לא נבדקו.** `launchChromium({ load })` מקבל loader מוזרק, ובדיקה מצמידה את האפשרויות
   המדויקות (`headless: true` וארגומנט אחד, כלל ה-resolver).

תיעדתי מחדש את כותרת `render-watch.mjs`, את כותרת ה-workflow ואת `research/rendered/README.md`.

## 3. קבצים/מערכות ששונו

- `scripts/render-watch.mjs`: `fetchOne`, `renderWithBrowser`, `tiktokHostInChain`, `chromiumLaunchOptions`,
  `launchChromium`, `jsRenderer`, הודעות הדילוג, הכותרת
- `scripts/queue-zero-test.mjs`: `checkTermsCapture`, `readTermsCapture`, `siteOf`, `MIN_TERMS_TEXT`,
  `TERMS_ELSEWHERE`; הפרמטר `termsCaptured` הוחלף ב-`termsCapture` ו-`termsElsewhere`
- `.github/workflows/render-watch.yml`: `timeout-minutes`, `persist-credentials: false`, token לשלבי ה-pull
  וה-push בלבד, כותרת, הודעת הכישלון
- `research/rendered/README.md`
- `src/__tests__/revenue/render-watch-js.test.ts` (18 בדיקות חדשות, 62 בסך הכול)
- `src/__tests__/revenue/queue-zero-test.test.ts` (21 בדיקות)
- הקובץ הזה

`render-watch.test.ts` (108 הבדיקות הישנות) לא השתנה. גם `urls.txt` ו-`ZERO-TESTS.md` לא השתנו.

## 4. החלטות והנחות משמעותיות

- **ממצאים שנדחו: אף אחד.** כל שבעת הממצאים שוחזרו ותוקנו. שלוש סטיות מההצעה של הסוקר, בכוונה:
  - **20 הפניות ולא "בערך 10":** 20 הוא הגבול של תקן Fetch, ולכן כל דף ש-`redirect: "follow"` הגיע אליו
    מגיע גם עכשיו. כך שורה רגילה לא משנה התנהגות.
  - **ציטוט תנאי השימוש לא נאכף ב-`parseUrlList`:** הסוקר הציע לאכוף או לנסח מחדש, ובחרתי לנסח מחדש. שדה
    ה-dispatch ב-GitHub הוא שורה אחת, ואכיפה של שורת הערה הייתה חוסמת שורות JS שם. כותרת ה-workflow וה-README
    אומרים עכשיו במפורש שעריכה ידנית או dispatch לא נבדקים בקוד, ושה-commit הנבדק הוא השער.
  - **כלל ה-resolver הורחב לשמות עם נקודה בסוף** (ראו סעיף 2).
- **`siteOf` בלי Public Suffix List:** קירוב (שתי תוויות אחרונות; שלוש תחת ccTLD עם `co`/`gov` וכדומה; תווית
  אחת עמוקה יותר על מארח משותף כמו `notion.site` או `github.io`). מארח משותף שחסר ברשימה ייחשב אתר אחד, וזה
  הכיוון המתירני. המגבלה מתועדת.
- **`TERMS_ELSEWHERE` ריק.** מרכז ה-Creator Hub של n8n יושב על `n8n.notion.site`. אם התנאים שחלים עליו הם של
  n8n, של Notion או של שניהם, זו החלטה שה-thread הראשי צריך לרשום שם עם הפניה, ולא החלטה שלי.
- **`timeout-minutes: 30`:** שלב ה-fetch לקח 6 דקות ל-158 כתובות (ריצה 28, 28.9, לפי ה-API של GitHub),
  כלומר בערך 8 דקות ל-211 היום. כל כתובת חסומה ב-30 שניות, כולל קריאת ה-DOM.
- **סטטוס בהפניה ל-TikTok:** במצב הרגיל נרשם הסטטוס של ההפניה (302 וכו'). במצב JS נרשם `null`, כי הניווט
  נכשל לפני שהייתה תשובה שאפשר לייחס לאתר.

## 5. שגיאות וניסיונות שנכשלו

- בניסוי ה-SIGKILL, `pgrep -f`/`pkill -f` עם תבנית שהופיעה גם בשורת הפקודה של מעטפת ה-Bash הרג את המעטפת
  עצמה פעמיים. זה נפתר כשהרצתי את הניסוי בפקודה נפרדת שהטקסט שלה לא מכיל את התבנית.
- `b.process()` לא קיים על Browser של Playwright (רק על BrowserServer), ולכן עברתי ל-`pgrep`.
- בדיקת ה-workflow חיפשה `"git "` וגם מצאה את המילה בתוך הערה. תוקן ל-regex של שורת פקודה.

## 6. בדיקות ופעולות ולידציה

- **Chromium אמיתי עם הכלל** (`realcheck.mjs`, שרת TikTok מדומה על 127.0.0.1):
  - הפניית 302 ל-`www.tiktok.com` ול-`www.tiktok.com.`, תמונה ו-iframe דרך הפניה, `fetch` דרך הפניה,
    preconnect, ניווט ב-JS ו-meta refresh: **אפס בקשות הגיעו לשרת TikTok**. הדפים שהופנו לא נשמרו.
  - דף עם `for(;;){}` הסתיים אחרי 5.3 שניות עם תקציב של 5 שניות, והדפדפן נשאר מחובר.
  - בלי הכלל (הדמיה של proxy): דף שהופנה ל-TikTok עדיין לא נשמר. תת-משאב שהופנה כן הגיע, וזו המגבלה
    המתועדת.
- **הפעלה עם `chromiumLaunchOptions()` בדיוק:** עמוד רגיל נשמר, והפניה ל-TikTok נרשמה כסירוב.
- **קריסה:** `browser.close()` אחרי שנייה, וגם SIGKILL ל-Chromium, באמצע טעינה של 3 שניות. בשני המקרים
  `js_skipped=2`, ולא נכתב קובץ לאף שורה.
- **`fetchOne` אמיתי מול שרת מקומי:** הפניה יחסית נעקבה, קפיצה ל-TikTok נעצרה עם 302, ולולאת הפניות נעצרה
  אחרי 21 בקשות.
- **git:** header שהוגדר דרך `GIT_CONFIG_*` הגיע כ-`Authorization` לשרת HTTP מקומי (git 2.43).
- **השוואה בין הבסיס לתיקון:** `compare.mjs` של הסוקר, בין `f378977` לקוד המתוקן, על רשימה רגילה בשלושה
  סבבים. הקבצים, ה-stdout וה-summary זהים בית-לבית.
- **בדיקת red:** 28 מהבדיקות החדשות נכשלות מול הקוד של `b1fcb06` ועוברות מול הקוד המתוקן. הקבצים הוחלפו
  זמנית ושוחזרו מגיבוי, והשחזור אומת ב-`cmp`.
- **CLI של `queue-zero-test --dry-run`**, שלושת המקרים של הסוקר: `urls` נדחה (הרשימה עצמה).
  `gamedistribution-developer-terms` נדחה ליעד של Trolley (אתר אחר). `trolley-identity-verification` נדחה
  (68 תווים, מעטפת).
- **ארבעה קבצי הבדיקות של האזור:** 197 עוברות. `pnpm typecheck`: יציאה 0.
  `npx vitest run src/__tests__/revenue`: 42 קבצים, 1127 בדיקות עוברות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- רתמת Chromium מקומית (שרת origin ושרת "TikTok" מדומים, `MAP * 127.0.0.1`) נכתבה פעמיים, פעם אצל הסוקר
  ופעם כאן. סקריפט קבוע ב-`scripts/` שמריץ את `renderWithBrowser` מול תרחישים כאלה ומדפיס כמה בקשות הגיעו
  ל-TikTok היה חוסך את זה בכל שינוי עתידי.
- הערה ל-thread הראשי: שני יעדי ה-JS של GameDistribution ו-n8n כבר נמצאים ב-`urls.txt` כשורות רגילות
  פעילות, ולכן `queue-zero-test` יסרב להם (URL already in urls.txt). הדרך היא לערוך את השורה הקיימת ולהוסיף
  את `js` ואת הציטוט. שורת Trolley מסומנת `# retired:`, ולכן לא נחשבת רשומה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- שני ניסיונות SIGKILL שהרגו את מעטפת ה-Bash (סעיף 5).
- בדיקה אחת של ה-workflow שנכשלה על `"git "` בתוך הערה.
- קריאה מלאה של `render-watch.mjs` (1,316 שורות) בהתחלה. זה היה נחוץ, כי ארבעה מהממצאים נוגעים בו.

