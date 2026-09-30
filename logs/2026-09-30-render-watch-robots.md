# render-watch ו-robots.txt: הבנייה, שתי הביקורות והתיקונים (30.9.2026, פסיקה 16(d) D2(iv)-(v), שלב 12 בקיפול)

## 1. מה המשתמש ביקש
- **הבנייה (commit `db43122`)**: שלב 12 ב-"Fold actions for Opus" של `research/channel-loop/RULING-2026-09-30-video.md`:
  - User-Agent מזהה במקום מחרוזת ה-Chrome.
  - קריאת robots.txt לפי RFC 9309, ושורת probe של `robots-`.
  - ערך הפסיקה `NO_TERMS_ROBOTS_OK`, והסקריפט `scripts/robots-verdict.mjs` שקובע אותו.
  - `googlesource.com` עובר ל-CONDITIONAL_MET.
  - היומן של הבנייה עצמה: `logs/2026-09-30-robots-txt-build.md`.
- **משימת התיקון (היומן הזה)**: שני מבקרים עברו על הבנייה, ומשימת workflow (Opus) ביקשה:
  - לתקן כל פגם שעומד מול הפסיקה (16(d) D2(v), שלב 12) ומול הקוד, ולנמק כל פגם שנדחה.
  - להריץ שוב `npx vitest run src/__tests__/revenue`, `pnpm typecheck` ו-`node scripts/queue-zero-test.mjs --apply-verdicts --dry-run`, ולעשות commit.
  - לכתוב יומן בעברית, בשמונת הסעיפים של המאגר, על הבנייה, הביקורות והתיקונים.

## 2. הפעולות המרכזיות שביצעתי
- **הבנייה בקצרה** (לפירוט: היומן שלה):
  - `USER_AGENT` = `MehudakRenderWatch/1.0 (+https://il-biz-tools.netlify.app)`.
  - `robotsChecker`: robots.txt אחד לכל origin לכל ריצה. ההתאמה לפי RFC 9309: ההתאמה הארוכה ביותר, Allow מנצח בשוויון, `*` ו-`$`.
  - `fetchOne` בודק כל hop לפני הבקשה. מצב js קורא robots.txt ב-GET רגיל לפני הדפדפן.
  - `termsGate` מכיר את `NO_TERMS_ROBOTS_OK`. הסקריפט `robots-verdict.mjs` הוא dry-run כברירת מחדל.
  - `googlesource.com` עבר ל-CONDITIONAL_MET, ושורה אחת חזרה לפעול (`sweep2-google-vrp-faq`).
- **קראתי** את D2 ואת שלב 12 בפסיקה, את מקטע ה-robots ב-`render-watch.mjs` (כולל מצב js ו-`main`), את `robots-verdict.mjs` ואת `termsGate`, ואת קבצי הבדיקה.
- **מיינתי את הביקורות**: 16 פגמים, עם שלוש חפיפות (A9=B1, A10=B4, A2≈B5). כולם התקבלו, ואף אחד לא נדחה (ראה סעיף 4).
- **תיקונים ב-`scripts/render-watch.mjs`:**
  - **A3 (חיתוך):**
    - נוסף `ROBOTS_MAX_BYTES = 500 * 1024`, ברירת המחדל של `fetchRobots` ושל `robotsChecker`.
    - קובץ שנחתך נקרא רק עד שבירת השורה האחרונה (`completeRobotsLines`). כך `Allow: /pub` חתוך כבר לא פותח את `/pub-secret`.
  - **B1 (429):** תשובת 429 על robots.txt היא עכשיו `unreachable` (איסור מלא) ולא "none".
  - **B2 (הפניה):**
    - הפניה של robots.txt נעקבת רק אל `/robots.txt` אחר, בלי query. כל הפניה אחרת היא `unreachable`, והיעד לא מתבקש.
    - כך probe לא יכול לשלוף ולשמור עמוד של אתר exhaustive-negative.
  - **B6 (תווים):** `normalizeRobotsPath` מקודד באחוזים את `"` `'` `<` `>` `` ` `` `{` `}` `|` `\` `^` בשני הצדדים.
  - **A5 (URL שאינו http):**
    - `decide`/`probe` מחזירים סירוב (`robots: null`) על URL שאינו http(s) במקום לזרוק.
    - לולאת ה-hops במצב js מסננת ל-http(s).
  - **A2 (בקשות שהעמוד יוזם):**
    - במצב js נרשם `context.route(() => true, …)` לפני ה-route של המארחים המסורבים.
    - כל בקשה שהעמוד יוזם נבדקת מול robots.txt לפני שהיא נשלחת: משאב-משנה, frame, או ניווט של סקריפט.
    - בקשה אסורה מבוטלת (`abort("blockedbyclient")`).
    - ניווט main-frame שבוטל מכשיל את העמוד. משאב-משנה שבוטל נספר ביומן הריצה (`robotsBlocked`).
    - רק hop של הפניית שרת נבדק עדיין אחרי מעשה.
  - **B5 (מארחים חסומים במצב js):**
    - מארחי TERMS_BARRED מקבלים את הטיפול של tiktok.com: `route`/`routeWebSocket` מסרבים להם.
    - `TERMS_BARRED_HOST_RESOLVER_RULES` נוסף ל-`chromiumLaunchOptions`.
    - עמוד שנשלח אל מארח כזה לא נשמר (`barredNavigationError`).
  - **A6 (נוסח):** הודעת ה-hop במצב js כבר לא טוענת "no request of any kind" על hop שהדפדפן כבר ביקש.
  - **A7 (מצב ה-robots במטא):** מצב js רושם במטא את מצב ה-robots של העמוד שנשמר (המסמך האחרון של ה-main frame), ולא של ה-URL ברשימה.
  - **A8 (stub):** `main` מעביר את `deps.fetchImpl` גם ל-`fetchOne`, לא רק לקריאת robots.txt.
- **תיקונים ב-`scripts/queue-zero-test.mjs`:**
  - **B4/A10:** probe של `robots-` עובר רק לאתר NO_TERMS שה-note שלו פותח ב-exhaustive-negative. אתר TERMS_PENDING מקבל רק את דף התנאים (D2(iv)).
  - **B3:** נוספה הפונקציה `isRobotsOkVerdict`. ‏`NO_TERMS_ROBOTS_OK` נחשב רק כשה-note פותח ב-`exhaustive-negative` וה-source מזכיר את `scripts/robots-verdict.mjs`.
- **תיקונים ב-`scripts/robots-verdict.mjs` (A9/B1):**
  - נוספה הפונקציה `readableCapture`.
  - הפסיקה נקבעת רק על 2xx שה-Content-Type שלו `text/plain` והגוף שלו אינו markup, או על 404/410.
  - 401, 403, 429, כל 4xx אחר ו-HTML: הסקריפט מסרב, ומצטט את D2(iv).
  - לכידה שנחתכה נקראת עד השורה השלמה האחרונה.
- **נתונים ותיעוד:**
  - `_about` ב-`terms-verdicts.json` ומקטע ה-robots ב-`research/rendered/README.md` מתארים את השער החדש.
  - פסקת audit ישנה ב-README אמרה בזמן הווה ש-render-watch "does not read" robots.txt. תוקנה ל-"did not read until 30.9".
- **בדיקות חדשות (1387 → 1410), לכל פגם:**
  - wildcard שחייב להתחיל מהמיקום המוקדם ביותר (`/*a*bc` מול `/abcxa`, ו-`/*/private/*.pdf`).
  - הניב "User-agent: MehudakRenderWatch / Disallow:" לפני `*` עם `Disallow: /`.
  - התקרה של 500 KiB והחיתוך.
  - 429.
  - הפניה ל-robots.txt שאינה robots.txt.
  - URL שאינו http.
  - תווים מיוחדים.
  - `deps.fetchImpl` בדפים.
  - fake דפדפן שבו `route()` חי באמת: משאב-משנה אסור, מארח חסום, ניווט סקריפט אסור, הפניה לגוגל עם resolver ובלעדיו, מצב robots של העמוד שנשמר, `about:blank`, ספירה ביומן הריצה.
  - ה-probe ל-TERMS_PENDING נדחה.
  - `NO_TERMS_ROBOTS_OK` שנקבע ביד נדחה, כולל בדיקה על הנתונים שב-commit.
  - ב-`robots-verdict`: 401/403/429/451, דף challenge, JSON או HTML, 410, וחיתוך.

## 3. קבצים/מערכות ששונו
- **סקריפטים:**
  - `scripts/render-watch.mjs`
  - `scripts/queue-zero-test.mjs`
  - `scripts/robots-verdict.mjs`
- **נתונים ותיעוד:**
  - `research/channel-loop/terms-verdicts.json` (רק `_about`)
  - `research/rendered/README.md`
- **בדיקות:**
  - `src/__tests__/revenue/render-watch-robots.test.ts`
  - `src/__tests__/revenue/render-watch-js.test.ts`
  - `src/__tests__/revenue/render-watch-terms-barred.test.ts`
  - `src/__tests__/revenue/queue-zero-test.test.ts`
  - `src/__tests__/revenue/robots-verdict.test.ts`
- **היומן הזה.**
- **Commits** על `worktree-wf_bb630752-f79-1`: `628c4d0` (התיקונים), ואחריו commit היומן. לא נדחף.
- **לא נגעתי ב-** `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md` ו-`research/rendered/urls.txt`.

## 4. החלטות והנחות משמעותיות
- **אף פגם לא נדחה.** כל אחד עומד מול הפסיקה או מול הקוד:
  - **B4/A10 (probe ל-TERMS_PENDING):** D2(iv) קובע "Unread or silent terms: no fetch", ו-D2(iii) מתיר לאתר כזה רק את דף התנאים. D2(v) מתיר קריאת robots.txt רק כדי לשפוט אתר exhaustive-negative. לא ראיתי את התדריך של הבונה, והפסיקה גוברת.
  - **A9/B1 (401/403/429):** סיכמתי את שתי הביקורות יחד:
    - **ב-render-watch, בזמן ריצה**, נשארת קריאת ה-RFC (4xx = אין כללים), חוץ מ-429 שהופך ל-unreachable. כך גם Google מתייחס ל-429.
    - **ב-`robots-verdict`**, שפותח אתר לתמיד, רק קובץ שהאתר הגיש באמת או 404/410. D2(iv) אומר ש-403 או bot challenge הם תשובת האתר.
  - **B5:** מבין שתי החלופות של המבקר בחרתי בתיקון, ולא בצמצום הטענות למצב plain. אין היום שורות js, ולכן התיקון לא משנה אף ריצה קיימת.
- **B2 מחמיר גם את זמן הריצה.** מארח פעיל שמפנה את `/robots.txt` לנתיב אחר (למשל `/static/robots.txt`) ייחשב unreachable, ושום דבר ממנו לא יישלף באותה ריצה.
  - אי אפשר לבדוק את זה מהקונטיינר (אין egress).
  - אם ריצה של ה-workflow תראה כשל כזה, זו הסיבה, וזה מכוון: הקריאה המחמירה לא שולפת עמוד לפני שמשהו התיר אותו.
- **B6:** הוספתי גם את `'`, מעבר לרשימה של המבקר ("those characters, plus |, \ and ^"). WHATWG מקודד אותו ב-query, והקידוד בשני הצדדים נשאר עקבי.
- **`robots-verdict` דורש `text/plain`.** אתר שמגיש robots.txt בלי Content-Type, או כ-`application/octet-stream`, לא יקבל את הפסיקה. זו הקריאה המחמירה, ואפשר להרחיב אותה אם nevo יתגלה כזה.
- **משאב-משנה שנחסם לא נרשם במטא.** הוא רק נספר ביומן הריצה. שדה חדש במטא היה משנה את צורתו לכל עמוד js, ומכניס את הרשימה לבדיקת השינוי או מוציא אותה ממנה.
- **החלטות שלא שיניתי:**
  - שדה ה-`robots` עדיין לא נכנס ל-`hasChanged`: עמוד שלא השתנה לא כותב כלום.
  - יותר מ-5 הפניות של robots.txt נחשבות unreachable.
  - המטמון לפי origin.

## 5. שגיאות וניסיונות שנכשלו
- **ההרצה הראשונה אחרי שינויי הקוד: 11 בדיקות נכשלו, כולן בכוונה.** הן ננעלו על ההתנהגות הישנה:
  - 429 כ-"none".
  - שרשרת הפניות דרך נתיבי `/r1`…`/r7`, שעכשיו נעצרת כבר בנתיב הראשון שאינו robots.txt. הבדיקה הוסבה לשרשרת של `/robots.txt` על מארחים שונים.
  - probe ל-TERMS_PENDING.
  - `NO_TERMS_ROBOTS_OK` בלי source.
  - ה-pin של `chromiumLaunchOptions`.
  - לכידות robots בלי `contentType` ב-fixture של `robots-verdict`.
- **המוטציה M18 שרדה**: הסרתי את בדיקת `barredNavigation` מיד אחרי `goto`.
  - אותה בדיקה חוזרת אחרי שהעמוד נרגע, כמו אצל tiktok.com, ולכן ההתנהגות הנצפית זהה. ההבדל הוא רק יציאה מוקדמת.
  - זו כפילות מכוונת ולא חור בבדיקות, ולא הוספתי בדיקה עליה.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue`: ‏48 קבצים, 1410 בדיקות עברו. לפני התיקון: 1387.
- `pnpm typecheck`: נקי.
- `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run`: "would pause 0 line(s)".
- `node scripts/robots-verdict.mjs nevo.co.il`: יציאה 3, "no committed robots.txt capture for https://www.nevo.co.il". לא הורץ עם `--apply`.
- **בדיקות מוטציה על התיקונים** (20 מוטציות). כל אחת הוחלה על הקובץ, והבדיקה הרלוונטית הורצה. הקובץ שוחזר מה-commit ב-`git checkout -- <file>`, ו-`git status` נקי בסוף.
  - **נהרגו 19:**
    - מקור ה-wildcard מהמיקום האחרון (M1, המוטנט של מבקר A).
    - `lastWasRule` אחרי ה-`continue` (M2, המוטנט של מבקר A).
    - פענוח השורה החתוכה, ובלי תקרת 500 KiB.
    - בלי ה-route של robots, וה-route המסורב ל-tiktok בלבד.
    - hops שלא מסוננים ל-http, ו-`decide` שזורק.
    - 429 כ-none, והפניה לכל נתיב.
    - probe ל-TERMS_PENDING, ו-`NO_TERMS_ROBOTS_OK` שנקבע ביד.
    - פסיקה על כל 4xx, פסיקה על HTML, ופסיקה על שורה חתוכה.
    - בלי קידוד התווים המיוחדים.
    - דפים שעוקפים את `deps.fetchImpl`.
    - רישום מצב ה-robots של ה-URL ברשימה במקום של העמוד שנשמר.
    - בלי כללי ה-resolver של TERMS_BARRED.
  - **שרדה אחת:** M18 (סעיף 5).
- **grep על ה-diff**: ‏0 מופעים של השם, של שם המשתמש, של owner/repo ושל `github.com`. מופע אחד של `api.github.com` ב-fixture הוחלף ב-`cdn.example.test`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **בדיקות מוטציה נעשו ביד שלוש פעמים**: אצל הבונה, אצל שני המבקרים, וכאן בסקריפט Python זמני ב-scratchpad.
  - כדאי `scripts/mutation-check.mjs`: הוא יקבל קובץ JSON של `{file, from, to, tests}`, ירוץ על עותק, ידפיס killed/survived וישחזר.
  - כך הבונה והמבקרים יריצו את אותה רשימה, ומוטנט ששרד יהפוך לבדיקה.
- **ביטול השהיה של שורות אחרי שפסיקה משתנה עדיין נעשה ביד** (nevo, אחרי `robots-verdict --apply`). ההצעה של הבונה, `queue-zero-test.mjs --unpause-verdicts`, עדיין פתוחה.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **קריאת `render-watch.mjs` (כ-2000 שורות) וחמישה קבצי בדיקה**: הכרחית. תיקוני ה-js נוגעים ב-`renderWithBrowser`, ב-`captureEntry` וב-`main` יחד.
- **כ-20 הרצות vitest בבדיקות המוטציה**: כל אחת קצרה (קובץ בדיקה אחד). הן הוכיחו שהבדיקות החדשות תופסות את הפגמים.
- **בלי ניסיונות חוזרים**: כל העריכות הוחלו בפעם הראשונה, והכשלים היחידים היו הכשלים המכוונים שבסעיף 5.
