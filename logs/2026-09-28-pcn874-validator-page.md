# 2026-09-28 — דף בודק PCN874 חינמי, בלי העלאה, בתוך il-biz-tools (BOARD-LOOP דרגה 4)

## 1. מה המשתמש ביקש

הבעלים כתב "עשיתי תמשיך", וסקריפט ה-workflow חישב מזה משימה: לבנות את סעיף "### 4. pcn874 free client-side
validator page" של `research/channel-loop/BOARD-LOOP.md` — דף סטטי בתוך `products/il-biz-tools` שבודק את מבנה קובץ
PCN874 (הדוח המפורט למע"מ) בדפדפן, בלי העלאה, על בסיס הבודק של `products/pcn874` עצמו (בלי פורק ובלי שכתוב). הדרישות,
כל אחת עם בדיקה: קריאה ב-File API בלבד ואפס קריאות רשת ב-JS של הדף; הצהרה בעברית שהבדיקה היא של מבנה בלבד, שאינה
מצליבה סכומים ואינה מחשבת `reportedVat`, עם הפניה לסימולטור של רשות המסים בכתובת שכבר מצוטטת; ממצאים לפי רשומה/שורה
עם הכלל שנכשל בעברית, נגיש (תוויות, `role="status"`/`aria-live`, מקלדת, RTL); רישום ב-`PAGE_RATE_SOURCES` ובכל רשימות
הדפים של האתר; חיבור צפיות הדף כ-KPI של pcn874 אם יש לאתר מונה בלי עוגיות; ובלי מחיר, בלי "קנייה" ובלי Gumroad.
עבודה ב-worktree מבודד, TDD, בלי push ובלי לגעת בקבצים של ה-main thread.

## 2. הפעולות המרכזיות שביצעתי

- ה-worktree התחיל על `327111e` (לא צאצא של `6278bce`); הרצתי `git reset --hard claude/new-session-j071dx` ווידאתי שהבסיס
  הוא `6278bce`.
- קראתי את BOARD-LOOP §4, את `products/README.md` (מה הבודק בודק ומה לא), את README של pcn874 ושל il-biz-tools, את
  `build-site.js`, `publish-gate.js`, `site-deps.js`, `a11y-check.js`, `analytics.js`, `common.js` ודף `allocation.html`.
- **גיליתי ש-il-biz-tools לא "מקבץ" כלום**: הדפים טוענים מודולי ES כמו שהם, ו-pcn874 כתוב ב-TypeScript. לכן הוספתי שלב
  bundle מינימלי: `src/lib/pcn874-bundle.js` מפשיט את הטיפוסים מארבעת המודולים (`sources`, `layout`, `parse`, `validate`)
  עם `module.stripTypeScriptTypes` של Node עצמו (מצב `strip`, בלי שום תלות), וכותב אותם ל-`src/vendor/pcn874/` עם
  כותרת של 4 שורות (מקור + sha256). `scripts/bundle-pcn874.js` כותב/בודק (`--check`).
- **pcn874 (TDD):** הבדיקה החדשה `tests/browser-safe.test.ts` נכשלה כי `validate.ts` השתמש ב-`Buffer.byteLength` — שלא
  קיים בדפדפן, כלומר כל קובץ לא ריק היה זורק שגיאה בדף. החלפתי ל-`TextEncoder` (סופר את אותם בתים). 321 בדיקות עוברות.
- **ה-build:** `build-site.js` מייצר מחדש את ה-bundle מ-`products/pcn874/src` בכל build ומסרב — גם ב-`--preview` — אם העותק
  השמור שונה או אם המקור חסר. `netlify.toml` קיבל `NODE_VERSION = "22"` (ה-API דורש 22.13+). עוזר הבדיקות `copyProduct`
  מעתיק עכשיו גם `pcn874/src` לצד העותק, כמו במאגר.
- **אזהרת ExperimentalWarning:** Node 22 מדפיס אזהרה על `stripTypeScriptTypes`, ובדיקה קיימת דורשת stderr ריק ב-build מוצלח.
  הוספתי השתקה ממוקדת של האזהרה הזו בלבד, רק בזמן הקריאה (כל אזהרה אחרת עוברת — נבדק ידנית).
- **דוח בעברית (TDD):** `src/lib/pcn874-report.js` הופך את תוצאת הבודק לשורות: היכן (שורה / כל הקובץ), הרשומה (עם סוג
  הרשומה בעברית), השדה, החומרה, והכלל שנכשל בעברית — ולצדו הניסוח האנגלי של הבודק. הבדיקה קוראת את כל מזהי הכללים מתוך
  `validate.js` (מחרוזות ותבניות) ודורשת שורה בעברית לכל אחד, כך שכלל חדש ב-pcn874 יפיל את הבדיקה עד שיתורגם.
  פענוח הקובץ זהה ל-CLI של pcn874 (`readFileSync(…,'utf8')`: UTF-8, ה-BOM נשמר).
- **הדף (TDD):** `pcn874.html` + `assets/page-pcn874.js`. כתבתי קודם 30 בדיקות ב-`tests/pcn874-page.test.js`, ראיתי את כולן
  נכשלות, ואז כתבתי את הדף. רשמתי אותו ב-`PAGE_RATE_SOURCES` (`[]`), ב-`sitemap.xml`, בכרטיס בדף הבית (ו"שישה"→"שבעה"
  כלים), בניווט של כל הדפים, וב-`check-html.js`. הוספתי ל-CSS את `.table-scroll` (טבלה רחבה בטלפון).
- **KPI:** לאתר יש מונה צפיות בלי עוגיות (PostHog, כבוי עד שיש `posthog.projectKey`), שמותקן ע"י `initPage()`. הדף קורא
  ל-`initPage()`, ו-`src/lib/page-kpis.js` ממפה את `pcn874.html` לקו `pcn874` (כל דף אחר → `il-biz-tools`). הבדיקה מוודאת
  ששני הקווים קיימים ב-`src/revenue/portfolio.ts` עם ה-KPI "weekly page views (cookieless)".
- עדכנתי את ה-README של il-biz-tools (פרק חדש על הדף, ספירות), את ה-README של pcn874 ואת `products/README.md`.

## 3. קבצים/מערכות ששונו

- `products/pcn874/src/validate.ts` — `Buffer.byteLength` → `TextEncoder`.
- `products/pcn874/tests/browser-safe.test.ts` — חדש.
- `products/pcn874/README.md` — ספירת בדיקות ושורה על הבדיקה החדשה.
- `products/il-biz-tools/src/lib/pcn874-bundle.js`, `scripts/bundle-pcn874.js` — חדשים (build בלבד, לא עולים לאתר).
- `products/il-biz-tools/src/vendor/pcn874/{sources,layout,parse,validate}.js` — נוצרו אוטומטית, לא לערוך ידנית.
- `products/il-biz-tools/src/lib/pcn874-report.js` — חדש (עולה לאתר).
- `products/il-biz-tools/src/lib/page-kpis.js` — חדש (לא עולה לאתר).
- `products/il-biz-tools/pcn874.html`, `assets/page-pcn874.js` — חדשים.
- `products/il-biz-tools/scripts/build-site.js`, `src/lib/publish-gate.js`, `scripts/check-html.js`, `netlify.toml`,
  `assets/style.css`, `sitemap.xml`, `index.html`, ובניווט: `vat.html`, `osek-patur.html`, `net-salary.html`, `invoice.html`,
  `allocation.html`, `registrar-fee.html`, `accessibility.html`.
- `products/il-biz-tools/tests/`: `pcn874-bundle.test.js`, `pcn874-report.test.js`, `pcn874-page.test.js` (חדשים),
  `build-site.test.js`, `helpers/product-copy.js` (עודכנו).
- `products/il-biz-tools/README.md`, `products/README.md`.
- לא נגעתי ב-`src/` של השורש, ולא ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`.

## 4. החלטות והנחות משמעותיות

- **bundle מתוך המקור, לא העתק:** הפשטת טיפוסים ב-Node עצמו ולא ב-TypeScript/esbuild — אפס תלויות, ומצב `strip` שומר
  על מספרי השורות (שורה N במקור = שורה N+4 ב-bundle). הקבצים שמורים במאגר כדי ש-`npm run serve` והבדיקות יראו אותם;
  ה-build מייצר מחדש ומסרב על כל פער. זה מקיים "regenerated from pcn874's source" בלי לכתוב לעץ המקור בזמן build.
- **שינוי אחד ב-pcn874 עצמו** (`TextEncoder` במקום `Buffer`) — לא פורק ולא שכתוב של הבודק; בלי זה הבודק לא רץ בדפדפן בכלל.
  הממצאים זהים, והבדיקה מוכיחה זאת גם כש-`Buffer` מוסר.
- **"הסימולטור החינמי":** הדרישה ביקשה להפנות ל"free simulator". הדף מפנה לכתובת `ITA_SIMULATOR_URL` שכבר מצוטטת, אבל
  **לא קורא לו "חינמי"**: README של pcn874 ו-`sources.ts` אומרים במפורש שאף מקור מרונדר לא מציין מחיר ולא מאשר את
  הכתובת כיום. הדף אומר שהכתובת לקוחה ממדריך של ספק תוכנה ושגם הסימולטור בודק באופן חלקי בלבד. בדיקה אוסרת "סימולטור חינמי".
- **ניסוח "אינו מצליב סכומים":** כמה כללים כן קוראים סכום (אפס או לא, סף 5,000 ש"ח לעסקה מזוהה, תקרת קופה קטנה — אזהרה).
  הדף אומר זאת במפורש ואומר שאף כלל לא משווה את סכומי הכותרת לרשומות — כך ההבטחה "מבנה בלבד" נאמרת ביושר (תנאי הריגה
  בסעיף 4 הוא בדיוק "shape-only guarantee cannot be stated honestly").
- **בלי "₪" בדף בכלל** (גם לא בסף 5,000 — נכתב "שקלים"), כדי שבדיקת "אין מחיר" תהיה פשוטה וחד-משמעית.
- **KPI:** המונה הקיים סופר לפי URL, ולכן אין צורך במכשיר נוסף בדף; המיפוי דף→קו הוא קוד (`page-kpis.js`). **אין עדיין קורא
  שבועי** שמושך צפיות מ-PostHog ל-KPI ב-`src/revenue/` (חיפשתי — אין), ו-`posthog.projectKey` ריק; לכן עד שיוגדר המפתח
  וייכתב קורא, ה-KPI לא רושם דבר. לא הוספתי שום מעקב של צד שלישי.
- **נגישות:** טבלה עם `caption` ו-`th scope="col"`; סיכום ב-`role="status" aria-live="polite"` (הטבלה עצמה מחוץ לאזור
  החי, כדי לא להקריא מאות שורות); שדה קובץ מקורי עם `label` ו-`aria-describedby`; הכול נכתב ב-`textContent` בלבד (ממצא
  יכול לצטט בתים מהקובץ). מגבלת תצוגה של 2,000 שורות עם הודעה כמה היו.
- הוספתי את הדף לניווט של כל הדפים (לא רק לדף הבית) — עקביות וקישור פנימי לדף החדש.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree התחיל על בסיס ישן — אופס עם `reset --hard` כנדרש.
- `Buffer` בבודק — התגלה רק כי כתבתי קודם בדיקה שרצה בלי `Buffer`; אחרת הדף היה נשבר על כל קובץ.
- הבדיקה הקיימת "builds _site/" נכשלה על stderr לא ריק בגלל ExperimentalWarning — נפתר בהשתקה ממוקדת.
- ניסיון להתקין Chromium (Playwright) לבדיקה בדפדפן אמיתי נכשל: ההורדה חסומה ב-proxy. במקום זה הרצתי פעם אחת את הדף האמיתי
  עם גרף המודולים האמיתי תחת jsdom (בתיקיית scratchpad, לא נשמר במאגר).
- פקודות heredoc מורכבות נחסמו ע"י שומר ה-worktree; עברתי ל-Edit/Write ולפקודות פשוטות.
- ניסוחים ראשונים בעברית תוקנו אחרי הרצה: "נמצאו שגיאה אחת" → "נמצאה שגיאה אחת"; סימן של סכום נקרא עכשיו בשם הסכום
  ("סימן מינוס לסכום אפס ב«תשומות ציוד»") ולא בשם שדה הסימן.

## 6. בדיקות ופעולות ולידציה

- `products/pcn874`: `npx vitest run` — 7 קבצים, **321 עברו** (היה 312); `tsc --noEmit` נקי.
- `products/il-biz-tools`: `npx vitest run` — 20 קבצים, **428 עברו** (היה 364; +64: bundle 12, דוח 18, דף 30, build 4).
- `node scripts/check-html.js` — "all pages ok", כולל `ok pcn874.html`.
- `node scripts/bundle-pcn874.js --check` — "matches products/pcn874/src".
- `node scripts/build-site.js` בעץ האמיתי — **מסרב (exit 1)** רק על ארבעת חוסמי איש הקשר לנגישות שהיו קיימים קודם; אין חוסם
  חדש. `--preview` — exit 0, הדף, הסקריפט וה-bundle בפנים.
- build פרסום (לא preview) בעותק זמני עם איש קשר לבדיקה בלבד: exit 0, stderr ריק, `_site/pcn874.html` +
  `_site/src/vendor/pcn874/*.js` + `_site/src/lib/pcn874-report.js` + `_site/assets/page-pcn874.js`.
- jsdom (חד-פעמי): שלושה קבצים — פסול (2 שגיאות, 2 שורות), נקי (אין שורות, קופסה ירוקה), ותוכן `<img onerror>` — 0 קריאות רשת,
  0 תגיות שהוזרקו, 0 סקריפטים שנוספו ל-head (המונה כבוי), `aria-current` על הדף וה-canonical נכון.
- `pnpm typecheck` בשורש לא הורץ: `src/` של השורש לא השתנה (`git diff --stat 6278bce -- src/` ריק).
- **לא נבדק:** דפדפן אמיתי, קורא מסך, זום 200%, קבצים אמיתיים של עוסקים (רק הפיקסצ'רים של pcn874).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **קורא שבועי לצפיות PostHog → KPIs** לפי `page-kpis.js` — חסר; בלעדיו ה-KPI של pcn874 (וכלל ההריגה "פחות מ-100 צפיות
  בשבוע") לא נמדד גם אחרי שיוגדר מפתח.
- שינוי ב-`products/pcn874/src` מחייב הרצת `node scripts/bundle-pcn874.js` ב-il-biz-tools. ה-CI תופס את זה (בדיקת ה-bundle
  נכשלת), אבל אפשר להוסיף hook או job שמריץ את ה-bundler ופותח PR.
- בדיקת דפדפן אמיתי לדפי האתר: אין Chromium בקונטיינר; job ב-GitHub Actions עם Playwright היה סוגר את הפער.
- מספרי "N בדיקות" ב-README מתעדכנים ידנית בכל משימה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת README ארוכים (il-biz-tools ~39KB, pcn874 ~35KB) כדי למצוא את כתובת הסימולטור ואת מנגנון המונה — הכרחי, אבל
  grep ממוקד מההתחלה היה חוסך חלק.
- ניסיון ההתקנה של Playwright (נחסם, כצפוי מהערות CLAUDE.md על ה-egress) — בזבוז קטן.
- שלוש פקודות heredoc שנחסמו ע"י שומר ה-worktree ונכתבו מחדש.
- סבב תיקוני עברית אחרי הרצה (פועל ביחיד, שם הסכום בכללי סימן) — היה נחסך בכתיבת הבדיקות המדויקות מראש.
