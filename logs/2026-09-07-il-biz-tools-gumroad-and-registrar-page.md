# 2026-09-07 — il-biz-tools: Gumroad במקום Paddle, שער נתונים לא מאומתים, ודף אגרת רשם החברות

## 1. מה המשתמש ביקש

לבנות את צד הקוד של שני ה-builds שהדירקטוריון אישר ב-`research/colony-sweep/BOARD.md`, בתוך
`products/il-biz-tools`:

- **Build #4** — להוציא את Paddle ולהכניס Gumroad (קוד בלבד: בלי לפתוח חשבון, בלי דומיין), למדוד
  צפיות עם PostHog ללא עוגיות, ולא למכור דבר שלא קיים: קופת ה-Pro מבטיחה אך ורק את מיתוג המסמך
  שכבר נבנה.
- **Build #6** — דף סטטי בעברית לאגרה השנתית של רשם החברות: לוגיקת המועדים, חלון התעריף המוזל,
  מחשבון מועדים, וטופס תזכורת **חינם** שמושבת עד שיימדדו 100 צפיות בשבוע — עם נוסח גילוי לפי
  סעיף 30א(ג) בנקודת האיסוף ונוסח טיפול במידע לפי תיקון 13, שניהם מסומנים 🔍 לניסוח משפטי.
- **שער אימות**: ה-build יסרב לפרסם דף שמציג נתון שקובץ המקור שלו נושא `verified: false`, או יציג
  אותו עם באנר "לא מאומת" ובלי מספרים — לבחור את הדרך שמשאירה את האתר כן ואת הבדיקות ירוקות.
- לעדכן sitemap/robots/ניווט, לשמור על `check-html.js` ירוק, להוסיף בדיקות למחשבון המועדים
  ולמצבי כפתור Gumroad, ולהריץ `npm test` + `check-html` + `build-site` + `pnpm typecheck`.
- אסור לגעת ב-`logs/CHECKPOINT.md`, `docs/OWNER_STEPS.he.md`, `MISSION.md` ו-`src/revenue/bounties/`.

## 2. הפעולות המרכזיות שביצעתי

1. **אתחול העץ.** ה-worktree הגיע בלי `products/` בכלל; לפי ההוראה הרצתי
   `git reset --hard claude/monthly-income-plan-pfs7vu` וקיבלתי את `products/` ואת `src/revenue/`.
2. **קריאה לפי הסדר שנדרש** — `MISSION.md`, `CLAUDE.md`, `BOARD.md`, `CHIEF-AUDIT.md` §2.1 שורות
   3–4, `groups/israel-bureaucracy.md`, `audits/israel-bureaucracy.md`, וכל `products/il-biz-tools`.
   בנוסף `scouts/distribution--email-acquisition.md`, המקום היחיד ברפו שבו סעיף 30א ותיקון 13
   מצוטטים בפועל.
3. **Gumroad מחליף את Paddle.** נמחק `src/lib/paddle.js`; נכתב `src/lib/gumroad.js` שכל האינטגרציה
   בו היא **קישור** — בלי SDK, בלי overlay, בלי iframe. `proButtonState()` מחזיר ארבעה מצבים
   (`unconfigured` / `invalid_url` / `no_public_key` / `ready`), והדף רק מציית לו.
4. **שער הנתונים הלא-מאומתים.** `src/lib/publish-gate.js` ממפה כל דף לקבצי הקונפיג שממנו הוא מציג
   מספרים. `build-site.js` מושך את הקונפיגים, ולכל דף שתלוי בקובץ שאינו `verified: true`: לא מעתיק
   את הדף האמיתי ל-`_site/`, מייצר במקומו הודעה עם באנר "לא מאומת", `noindex` ובלי שום מספר, ומוריד
   את הכתובת מה-sitemap שנשלח. עץ המקור לא זז. היום נחסם בדיוק דף אחד: `net-salary.html`.
5. **דף אגרת רשם החברות.** `registrar-fee.html` + `assets/page-registrar-fee.js` +
   `src/lib/registrar-fee.js` + `src/config/registrar-fee.json`. הדף מציג את הכלל, את התאריכים
   ומחשבון מועדים — **ולא מציג סכום בשקלים**.
6. **PostHog ללא עוגיות.** בלוק `posthog` חדש ב-`site.json` עם `projectKey` ריק; בלי מפתח לא נפלט
   שום snippet. שמות האופציות אומתו מול התיעוד של PostHog עצמה דרך כלי ה-docs של המחבר.
7. **ניווט, sitemap, index, CSP, README, בדיקות** — עודכנו בהתאם.

## 3. קבצים/מערכות ששונו

**חדשים**
- `products/il-biz-tools/registrar-fee.html`, `assets/page-registrar-fee.js`
- `products/il-biz-tools/src/lib/gumroad.js`, `src/lib/publish-gate.js`, `src/lib/registrar-fee.js`
- `products/il-biz-tools/src/config/registrar-fee.json`
- `products/il-biz-tools/tests/gumroad-analytics.test.js`, `tests/publish-gate.test.js`,
  `tests/registrar-fee.test.js`
- `logs/2026-09-07-il-biz-tools-gumroad-and-registrar-page.md` (הקובץ הזה)

**נמחקו**
- `products/il-biz-tools/src/lib/paddle.js`, `products/il-biz-tools/tests/paddle-analytics.test.js`

**שונו**
- `src/config/site.json` — בלוק `paddle` הוסר; נוספו `gumroad` ו-`posthog`, שניהם ריקים כברירת מחדל.
- `src/lib/analytics.js` — הופרד ל-`buildPlausibleSnippet` / `buildPostHogSnippet`; PostHog מוגדר
  cookieless.
- `assets/page-invoice.js` — משתמש ב-`proButtonState(site)` במקום בתנאי משלו.
- `scripts/build-site.js` — שער האימות, יצירת דף ההודעה, סינון ה-sitemap, כשל מכוון על דף שלא נרשם.
- `scripts/check-html.js` — נוסף `registrar-fee.html`, נוסף `page-registrar-fee.js`, ומדווח מה ייחסם.
- `scripts/make-license.js` — נוסח: Gumroad במקום Paddle.
- `netlify.toml` — ה-CSP הצטמצם: `cdn.paddle.com` ו-`frame-src` ל-Paddle הוסרו, `frame-src 'none'`.
- `index.html`, `vat.html`, `osek-patur.html`, `net-salary.html`, `invoice.html`, `allocation.html`
  — פריט ניווט חדש; `index.html` גם קיבל כרטיס כלי ותיקון נוסח.
- `assets/style.css`, `sitemap.xml`, `README.md`, `tests/license-branding.test.js`.

**לא נגעתי** ב-`logs/CHECKPOINT.md`, `docs/OWNER_STEPS.he.md`, `MISSION.md`, `src/revenue/**`.

## 4. החלטות והנחות משמעותיות

1. **הסכומים ₪1,338 / ₪1,777 לא מודפסים באתר — וזו ההחלטה המרכזית כאן.** הדירקטוריון כתב
   ב-build #6 "עם האריתמטיקה המבוקרת (₪1,338 → ₪1,777)". `audits/israel-bureaucracy.md` §2.2 אכן
   קורא לזה "the cleanest fact in the group", אבל `groups/israel-bureaucracy.md` כותב במפורש, על
   כל המספרים בקבוצה כולל אלה שסומנו CONFIRMED: *"Not one primary Israeli legal or government
   source was rendered ... That is enough to decide where to build; it is not enough to publish to
   users as guidance."* MISSION כלל 4 מכריע. לכן הסכומים יושבים ב-`registrar-fee.json` עם
   `verified: false` ו-`renderAmounts: false`, `feeAmountDisclosure()` מסרב למסור אותם, והדף שולח
   את הקורא לרשות התאגידים. בדיקה מוודאת ששני המספרים לא מופיעים ב-HTML.
2. **התאריכים כן מוצגים, והדף אומר שגם הם לא אומתו מול מקור ראשוני.** אותה דרגת ראיה, הבדל בנזק:
   תאריך שגוי שולח אדם לבדוק מוקדם מדי; סכום שגוי הוא מספר שהוא פועל לפיו. הטבלה "מה בדוק כאן ומה
   לא" מציגה את זה במפורש במקום להסתיר.
3. **חסימה במקום באנר, לדף שכן מציג מספרים.** הבריף נתן לבחור. בחרתי בחסימה כי זו הוראת
   הדירקטוריון ("keep every page that depends on `tax-2026.json` unpublished"), ובמקום 404 שובר
   ניווט מתפרסמת הודעה קצרה ללא מספרים עם `noindex` — הקישורים בתפריט נשארים תקינים.
4. **`registrar-fee.html` נרשם בשער עם רשימת מקורות ריקה** — לא כפרצה אלא כטענה שנבדקת: הדף לא
   מציג שום נתון מהקובץ מלבד תאריכים, וזה מגובה בבדיקה. השער גם **נכשל** על כל דף HTML שלא נרשם
   במפה, כדי שדף חדש לא יחליק פנימה בלי החלטה.
5. **הכפתור הוא קישור, לא SDK.** Gumroad לא נטענת לתוך האתר. זה הקטין את ה-CSP במקום להגדיל אותו,
   ולא המצאתי מסכי Gumroad שלא ראיתי (למשל פרמטר checkout ישיר — לא נכתב).
6. **מנגנון מסירת המפתח מסומן 🔍.** ה-README אומר שהמפתח נמסר בשדה התוכן/רישיון של המוצר, ומצהיר
   שאיש כאן לא ראה את המסך הזה כי אין חשבון.
7. **הטופס מוצג ומושבת** ולא הושמט — כדי שנוסח 30א(ג) יישב בדיוק בנקודת האיסוף וניתן יהיה לבדוק
   אותו לפני שנאספת כתובת ראשונה. הזכות לפי 30א(ג) אינה רטרואקטיבית: מי שנאסף בלי המשפט הזה לא
   ניתן יהיה לדוור אליו לעולם.
8. **לא המצאתי כתובת פנייה ולא כתובת gov.il.** שדה `url` של המקור הראשוני נשאר ריק במכוון, עם
   הערה מדוע.
9. **תוקן שקר קיים ב-`index.html`:** ה-FAQ (וגם ה-JSON-LD) עדיין הציגו "שמירת רשימת לקוחות"
   כתכונת Pro, בזמן שה-README מצהיר שהיא חינמית. זה בדיוק "לחייב על משהו שכבר קיים חינם".

## 5. שגיאות וניסיונות שנכשלו

- **ה-worktree הגיע ריק מ-`products/`** — `ls products/` נכשל. פתרון: ה-`git reset --hard` שהבריף
  הורה עליו מראש. עלות: קריאה אחת מבוזבזת.
- **ה-sandbox של Bash סירב לשלוש פקודות מורכבות** (heredoc + `rm` + `node` באותה שורה; `cat >>`
  עם heredoc ואחריו `tail`; `grep` עם backticks בתבנית). ההודעה: "too complex to verify that it
  stays inside the worktree". פתרון: מעבר לכלי `Write`/`Edit` ול-heredoc של python בפקודה בודדת.
  זו עלות חוזרת — ראו סעיף 7.
- **ה-README היה כבר שבור לפני שנגעתי בו**: טבלת ההגדרות נחתכה באמצע על ידי הכותרת
  "## The Pro tier", ושורות `paddle.*` ריחפו מתחת לסעיף אחר. הניסיון הראשון לערוך אותה נקודתית
  הותיר טבלה יתומה; נדרש סבב שני שאיחד את הטבלה במקום אחד.
- **התכוונתי לכתוב את אופציות PostHog מהזיכרון ולסמן 🔍.** במקום זה שאלתי את כלי התיעוד של PostHog
  ואימתתי את `cookieless_mode: 'always'`, `persistence: 'memory'`, `autocapture`, `capture_pageview`
  ו-`disable_session_recording` מול התיעוד שלהם. הימנעתי מ-`disable_surveys`, שם שלא הצלחתי לאמת.
  מה שנשאר 🔍 הוא צד-הבעלים בלבד: המתג "Cookieless server hash mode" בהגדרות הפרויקט.

## 6. בדיקות ופעולות ולידציה

| פעולה | תוצאה |
|---|---|
| `npm test` (בתוך `products/il-biz-tools`) | **120 בדיקות, 10 קבצים — ירוק**. לפני השינוי: 84 |
| `node scripts/check-html.js` | `all pages ok` על 7 דפים, ומדווח `withheld from _site/: net-salary.html` |
| `node scripts/build-site.js` | `_site/` נבנה עם `registrar-fee.html`, ומדווח על חסימת `net-salary.html` |
| בדיקה ידנית של `_site/net-salary.html` | דף ההודעה, `noindex`, בלי אף מספר |
| בדיקה ידנית של `_site/sitemap.xml` | `net-salary.html` ירד, `registrar-fee.html` נוסף |
| `grep` על `_site/registrar-fee.html` ל-1338/1,338/1777/1,777 | 0 מופעים |
| `pnpm typecheck` (שורש) | עובר, בלי פלט. לא נגעתי בקוד TS |

בדיקות חדשות: מחשבון המועדים (חלון פתוח, יום אחרון, מעבר ל-1 באפריל, תאריך מאוחר בשנה, שנה
מעוברת, קלט לא תקין, תאריכים מהקונפיג ולא מקודדים), שער הסכומים (ארבעה מצבים + כשל סגור), ארבעת
מצבי כפתור Gumroad + פתיחת החלון, ה-snippet של PostHog, ושער הפרסום כולל המצב האמיתי של הרפו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

1. **הוספת דף חדשה נוגעת בשבעה מקומות**: HTML, סקריפט דף, ניווט בכל הדפים הקיימים, `sitemap.xml`,
   רשימת `pages` ב-`check-html.js`, רשימת סקריפטים ב-`check-html.js`, ומפת `PAGE_RATE_SOURCES`.
   שלושה מהם כבר נאכפים אוטומטית (השער נכשל על דף לא רשום, ה-check דורש sitemap). הכותרת והניווט
   עדיין ידניים — כדאי partial/מחולל header משותף בזמן build, כי ה-build כבר קיים.
2. **הניווט הועתק לשישה קבצים בסקריפט python חד-פעמי.** אותו סקריפט יידרש בדף הבא.
3. **טבלת "מה מאומת ומה לא" ב-README נכתבת ביד** בזמן שכל קובץ קונפיג כבר נושא `verified` ו-`sources`.
   אפשר לייצר אותה מהקונפיגים ולבדוק בטסט שהיא לא נגררה מהמציאות.
4. **ה-sandbox מסרב לפקודות Bash מורכבות** — כל heredoc/`&&` מרובה נדחה. משתלם להתחיל ישר עם
   `Write`/`Edit` ולא לגלות את זה שלוש פעמים.

## 8. על מה בוזבזו אסימונים, לפי פעולה

| פעולה | הערכה | מה בוזבז ולמה |
|---|---|---|
| `ls products/` לפני ה-reset | ~1% | העץ הגיע ריק; ההוראה חזתה את זה, אבל הרצתי בכל זאת קודם |
| קריאת BOARD/CHIEF-AUDIT/israel-bureaucracy | ~22% | לא בזבוז — אבל קריאת §2.1 בשלמותה כדי לשלוף שתי שורות עלתה יותר מ-grep ממוקד שהרצתי אחריה ממילא |
| חיפוש 30א ברפו | ~4% | הבריף שלח ל-`groups/`+`audits/`, אבל הציטוט האמיתי יושב ב-`scouts/distribution--email-acquisition.md`. שני grep-ים עד שנמצא |
| שלוש פקודות Bash שנדחו | ~3% | בזבוז נקי: heredoc מורכב, `cat >>` מורכב, `grep` עם backticks |
| שני סבבי עריכת README | ~5% | הקובץ היה שבור מראש; העריכה הראשונה השאירה טבלה יתומה ונדרש תיקון |
| שתי שאילתות docs של PostHog | ~3% | שילם על עצמו: הפך 🔍 לציטוט מהתיעוד של הספק |
| כתיבת קוד, דף ובדיקות | ~55% | העבודה עצמה |
| ולידציה (test/check/build/typecheck) | ~7% | חובה לפי `verification-before-completion` |
