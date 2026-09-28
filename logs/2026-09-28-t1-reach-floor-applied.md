# 2026-09-28 — יישום רצפת החשיפה של זרוע הרשת של T1 (PREREG-DECISIONS.md §3.6)

## 1. מה המשתמש ביקש

סקריפט ה-workflow (לא הבעלים ישירות) ביקש ליישם **בדיוק** את סעיף "3.6 Exact code changes (for Opus)" של
`research/faceless-youtube/PREREG-DECISIONS.md` (החלטה 3 של הבורד, 28.9.2026, רצפת החשיפה של זרוע הרשת של T1). הסעיף כולל:
`counter_script` ו-`COUNTER_DISCLOSURE` ב-`products/chart-explainer/page.py` מילה במילה (שליחה בגלילה הראשונה, מאזין
passive, אף פעם לא בטעינה); תוספות הבדיקה ב-`tests/test_page_counter.py` (כשהמונה כבוי הפלט נשאר זהה בייט-לבייט
לקובץ ה-golden); `WEB_ARM_REACH` ו-`evaluateWebArm()` ב-`src/revenue/experiments.ts` עם בדיקות; אימות ה-hash הנעוץ;
`PINNED_GATES_SHA256` לא נוגעים; שורות `_redirects`/`_headers`/`robots.txt`/`sitemap.xml` ל-Netlify; וקובץ הקריאות
`research/faceless-youtube/readings/web-arm.json`. עבודה ב-worktree מבודד, TDD, בלי push ובלי לגעת בקבצי ה-main thread.

## 2. הפעולות המרכזיות שביצעתי

- ה-worktree התחיל על בסיס ישן (`b968711`, בלי `RULING-2026-09-28-floors.md`). הרצתי `git reset --hard claude/new-session-j071dx`
  ווידאתי `BASE_OK` מול `e6c2469`.
- קראתי את §3.1-§3.8, את `RULING-2026-09-28-floors.md` (שורה 11 ו"מה לא הוחלט"), את BOARD-LOOP דרגה 5 / PUBLISH-10 ואת
  T1-PROTOCOL.
- **page.py (TDD):** הוספתי קודם את שלוש תוספות הבדיקה מהסעיף וראיתי 3 כישלונות מהסיבה הנכונה. אחר כך החלפתי את
  `counter_script` ואת `COUNTER_DISCLOSURE` בטקסט של הסעיף, ועדכנתי את פסקת "On" ב-docstring של המודול. תוצאה: 132 עברו,
  כולל בדיקת ה-golden (מצב off זהה בייט-לבייט). ה-golden ו-`releases/t1/page.html` לא שונו.
- **experiments.ts (TDD):** הוספתי את בלוק ה-describe מהסעיף וראיתי 2 כישלונות (`evaluateWebArm is not a function`).
  אחר כך הוספתי את `WEB_ARM_REACH`, `WebArmReading`, `WebArmVerdict` ו-`evaluateWebArm` מילה במילה אחרי
  `FACELESS_YOUTUBE_EXPERIMENT`, ו-20/20 עברו.
- **ה-hash הנעוץ:** חישבתי מחדש לפני השימוש. `aed85a89…4bb4d2` הוא sha256 של המחרוזת בת 38 הבייטים
  `{"day":56,"minEngagedStrangerViews":5}`, כלומר `JSON.stringify(WEB_ARM_REACH)`. `sha256sum` ו-`node:crypto` מסכימים,
  ולכן אין פער לדווח עליו.
- **אימות "מילה במילה":** סקריפט השווה כל אחד מחמשת בלוקי הקוד של §3.6 לקובץ היעד, והתוצאה VERBATIM בכל החמישה.
- **קבצי Netlify (TDD):** אימתתי תחביר מול התיעוד של Netlify דרך Context7: rewrite `/pass-through /index.html 200`, קובץ
  `_headers` בצורת נתיב ואחריו כותרת מוזחת, וכללי redirect שתופסים גם עם `/` בסוף וגם בלעדיו. שם המארח (sub-brand) לא
  נבחר עדיין, ולכן כתבתי את `netlify_files.py` עם `netlify_files(origin)` שמחזירה את ארבעת הקבצים, יחד עם 19 בדיקות
  (RED: 18 נכשלו מול stub, ואחרי המימוש כולן עברו).
- **קובץ הקריאות:** יצרתי `web-arm.json` ריק (שום דבר לא פורסם) עם כל השדות שהסעיף מונה, ועוד רישום תקלות מכשיר לפי §3.1(3).
  נוספה בדיקה `web-arm-readings.test.ts` שמריצה מחדש את `evaluateWebArm` על כל קריאה רשומה, כך שאפשר להריץ אותה מחדש על
  אותם מספרים. ה-RED היה ENOENT, ואחר כך 3/3 עברו.
- **מצביעים:** לפי "Pointers to update when convenient" עדכנתי את T1-PROTOCOL סעיף 4 (מחקתי בקו את "needs the brand domain"
  וסימנתי אותו superseded) ואת BOARD-LOOP דרגה 5 ("zero stranger reach" הפך ל-"under 5 engaged stranger page views, as
  pre-registered").
- **בדיקת התנהגות:** הרצתי את הסקריפט שנוצר ב-Node עם `addEventListener`/`fetch` מזויפים. התוצאה: 0 שליחות בטעינה, 1 בגלילה
  הראשונה, 1 גם אחרי גלילה שנייה. המטען הוא בדיוק `{$process_person_profile:false, $current_url}`, ו-`$current_url` הוא
  origin + pathname, בלי query ובלי fragment. (ההרצה הזו הייתה ב-scratchpad ולא נשמרה. בסבב התיקונים היא הפכה לבדיקה
  קבועה, ראו להלן.)

**סבב תיקונים אחרי הביקורת (אותו יום, Opus):**

- **הבדיקה החוזרת לא סמכה על התאריכים.** `web-arm-readings.test.ts` בדקה את `read.verdict` מול
  `evaluateWebArm(read.day, …)`, ולכן קריאה שנלקחה ביום 40 ונרשמה כ-`day: 56` הייתה עוברת. עכשיו `auditWebArmReadings`
  גוזרת את היום מהתאריכים: D0 הוא תאריך ה-UTC של המאוחר מבין שני התנאים (§3.5), והוא נקבע רק כששניהם קיימים. כל תקלת
  מכשיר שתוקנה מאפסת את השעון לתאריך התיקון (§3.1(3)). `read.day` חייב להיות שווה למספר ימי ה-UTC מתחילת השעון ועד
  `readAt`, וה-verdict מחושב מחדש על היום הזה. אין רישום של ספירה כשתקלה פתוחה. N חייב להתאים לסדרה היומית בחלון 56
  הימים. לכל בדיקה יש רשומה סינתטית שמפילה אותה. הרצות מוטציה על ארבע הבדיקות שנגזרות מתאריכים (היום, D0, איפוס השעון,
  החלון) הפילו כל אחת לפחות בדיקה אחת. שדה ה-`about` ב-`web-arm.json` מתעד עכשיו את מוסכמות ה-UTC.
- **התנהגות המונה נבדקת בקוד שנשמר.** ב-`test_page_counter.py` נוספו שלוש בדיקות שמריצות את הסקריפט ב-Node, בהקשר
  `node:vm` שיש בו רק `addEventListener`, `fetch`, `crypto` ו-`location`, ועם ה-`EventTarget` של Node בשביל `once`. הן
  בודקות: אין שליחה ב-`DOMContentLoaded`/`load`/`pageshow`, שליחה אחת בגלילה הראשונה ואף אחת אחריה, מטען בדיוק בצורת
  §3.4(c) עם `$current_url` = origin + path (ל-`/` ול-`/preview/`), `fetch` שנדחה נתפס, ומזהה חדש בכל ביקור. הבדיקות
  מדלגות כשאין `node` ב-PATH. בדיקת מוטציה: הסרת `once`, שליחה ב-load, הסרת `.catch`, גישה ל-`document`, שליחת
  `location.href` או הוספת מאפיין, כל אחת מהן מפילה בדיקה.
- **page.py:** פסקת "On" עברה עימוד מחדש (שורה 19 הייתה ברוחב 172 תווים), ו-"drawn for that load" הפך ל-"drawn for that
  visit", כדי להתאים ל-docstring של `counter_script` ולהצהרה בדף.
- **netlify_files.py:** ה-docstring מונה עכשיו את שתי הבדיקות שצריך להריץ על ה-deploy preview הראשון (ראו סעיף 4).

## 3. קבצים/מערכות ששונו

- `products/chart-explainer/page.py`: `counter_script`, `COUNTER_DISCLOSURE` ופסקת "On" ב-docstring.
- `products/chart-explainer/tests/test_page_counter.py`: שלוש התוספות מהסעיף.
- `products/chart-explainer/netlify_files.py` (חדש) ו-`tests/test_netlify_files.py` (חדש).
- `products/chart-explainer/README.md`: שורת `page.py` (שליחה בגלילה הראשונה) ושורה חדשה ל-`netlify_files.py`.
- `src/revenue/experiments.ts`: `WEB_ARM_REACH`, `evaluateWebArm` והטיפוסים.
- `src/__tests__/revenue/experiments.test.ts`: בלוק "web arm reach floor". `PINNED_GATES_SHA256` לא שונה.
- `src/__tests__/revenue/web-arm-readings.test.ts` (חדש).
- `research/faceless-youtube/readings/web-arm.json` (חדש).
- `research/faceless-youtube/T1-PROTOCOL.md` ו-`research/channel-loop/BOARD-LOOP.md`: שני המצביעים.
- בסבב התיקונים: `products/chart-explainer/page.py` (עימוד פסקת "On" ו-"visit"), `tests/test_page_counter.py` (שלוש בדיקות
  Node), `products/chart-explainer/netlify_files.py` (בדיקות ה-deploy preview ב-docstring),
  `src/__tests__/revenue/web-arm-readings.test.ts` (`auditWebArmReadings` ו-10 בדיקות), `web-arm.json` (שדה `about`),
  והלוג הזה.
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md` או `CLAUDE.md`. לא בוצע push.
  שום דבר לא פורסם.

## 4. החלטות והנחות משמעותיות

- **המארח כפרמטר, לא קבצים סטטיים.** הסעיף מבקש שורת `Sitemap:` ו-`<loc>` עם ה-URL הקנוני, אבל שם ה-sub-brand מופיע
  ב-RULING תחת "What was not decided here". כל מארח קבוע היה ניחוש, ולכן הפונקציה מקבלת origin מאומת (https, אותיות קטנות,
  בלי port/path/query/`/` בסוף) ונכשלת סגור. הקבצים ציבוריים, ולכן אין בהם הערות ולא מופיעים בהם שמות מסמכים פנימיים.
- **ה-URL הקנוני הוא origin + "/"**, בדיוק מה שהמונה שולח מהדף עצמו (§3.1). הנחה: הדף הקנוני מוגש מהשורש (`index.html`),
  כפי שמשתמע מ-`/preview/ /index.html 200`.
- **robots.txt כולל גם `User-agent: *`**, כי בלי שורת user-agent הכלל `Disallow` אינו תקף. זו לא תוספת תוכן.
- **שתי השורות של robots ו-noindex נשארו כפי שנפסק**, למרות הסתירה עם התיעוד של Google (פריט 1 ב"שאלות פתוחות לבורד"
  להלן). ההכרעה ביניהן היא של הבורד.
- **קובץ הקריאות נוצר עכשיו כשלד ריק**, כדי שהמבנה ייקבע לפני שיש נתונים (ברוח הרישום המוקדם). null פירושו "לא נקרא",
  ולעולם לא אפס.
- ב-docstring של page.py שיניתי בשלב הבנייה רק את המשפט שהסעיף מציין. בסבב התיקונים "random id drawn for that load" הפך
  ל-"drawn for that visit", כי הביטוי סתר את ה-docstring של `counter_script` ("drawn when the event is sent") ואת ההצהרה
  בדף ("drawn for that visit alone").
- **מוסכמות הזמן בקובץ הקריאות (סבב התיקונים): UTC.** חותמות זמן הן ISO 8601 שמסתיימות ב-`Z`, ותאריכים הם תאריכי UTC
  (`YYYY-MM-DD`). בלי מוסכמה אחת אי אפשר לגזור את היום מהתאריכים. D0 הוא תאריך ה-UTC של המאוחר מבין שני התנאים.
- **הסדרה היומית מול N.** הפסיקה לא אומרת אם הסדרה היומית נרשמת לפני הפחתת חריגי הצפייה העצמית (§3.4(a)) או אחריה.
  לכן הבדיקה מקבלת כל N שבין "הסכום בחלון פחות מספר החריגים בחלון" לבין "הסכום בחלון". כל רשומה ב-`ownViewExceptions` היא
  צפייה אחת. החלון הוא 56 הימים מתחילת השעון, כלומר [D0, D0+56).
- **תקלה פתוחה פירושה "לא נמדד".** לפי §3.1(3), ספירה לא נרשמת כשיש תקלת מכשיר שלא תוקנה. תקלה שתוקנה מאפסת את השעון
  לתאריך התיקון.

**שאלות פתוחות לבורד (לא הוכרעו כאן):**

1. **robots.txt מול noindex: סתירה עם התיעוד של Google.** בדף robots-meta-tag של Google
   (https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) כתוב: "If a URL is disallowed from
   crawling by the robots.txt file, any indexing or serving rules specified via robots meta tags or X-Robots-Tag HTTP
   headers will be ignored." לכן `Disallow: /preview/` מסתיר מ-Google את `X-Robots-Tag: noindex`, וכתובת `/preview/`
   שמקושרת ממקום אחר עדיין יכולה להופיע באינדקס, בלי התוכן שלה. שתי השורות נשארו כפי שנפסק, והבורד צריך לבחור אחת.
2. **סתירה אפשרית בתוך §3: קישורי `/preview/` בקבצים ציבוריים.** §3.4(a) קובע שכל קישור לדף שפונה למושבה או לבעלים,
   כולל ב-`CHANNEL_LOOP.md` ובצ'קפוינט, משתמש בנתיב `/preview/`. §3.5 סעיף 3 אוסר כל קישור מהמאגר שנמצא תחת שם המשתמש
   האישי של הבעלים, ו-BOARD-LOOP אומר שהמאגר ציבורי. קישור `/preview/` בקבצים האלה יהיה קישור ציבורי מהמאגר הזה לאתר
   המותג. לא פעלתי בעניין הזה, ונדרשת פסיקה.
3. **גלילה שאף אחד לא ביצע.** דפדפנים יורים אירוע `scroll` גם בלי שמישהו גלל: כשהדף נפתח עם `#fragment` (בדף יש
   `id="figures"`, `"sources"`, `"data"` ו-`"method"`), וכשהדפדפן משחזר את מיקום הגלילה בטעינה מחדש או בחזרה אחורה. כך N
   יכול לספור טעינות שאף אחד לא קרא. §3.7 כבר מקבל ספירת יתר בכיוון הזה, אבל לא מציין את הסיבה הזו. (זו טענה של
   הביקורת. היא לא נבדקה כאן בדפדפן.)

**לבדוק על ה-deploy preview הראשון, לפני כל deploy לייצור** (רשום גם ב-docstring של `netlify_files.py`; התיעוד של Netlify
לא מכריע):

- האם כלל ב-`_headers` תופס לפי הנתיב שהתבקש או לפי יעד ה-rewrite (`/index.html`). `curl -sI <preview-host>/preview/`
  חייב להחזיר `X-Robots-Tag: noindex`, ו-`curl -sI <preview-host>/` חייב להחזיר תשובה בלעדיו.
- הצורה בלי `/` בסוף. ה-rewrite מגיש גם את `/preview`, וכללי robots.txt תופסים לפי תחילית, ולכן `Disallow: /preview/` לא
  חל על `/preview`. `curl -sI <preview-host>/preview` חייב להחזיר גם הוא `X-Robots-Tag: noindex`.

**מצביעים ישנים שנשארו למשימה הראשית** (לא נערכו, כי §3.6 לא מונה אותם):

- `products/chart-explainer/page.py:3-5`: "It is not deployed: that waits on the brand domain (owner step 5)".
- `products/chart-explainer/releases/t1/README.md:16`: "domain — owner step 5".
- `research/channel-loop/BOARD-LOOP.md:63` (PUBLISH-10: "starts at its netlify.app deploy") ו-`:117` (דרגה 5: "its clock
  starts at that deploy"). לפי §3.5, ולפי הטקסט החדש ב-`T1-PROTOCOL.md:29-30`, D0 הוא פרסום ציבורי **וגם** הגשת גילוי
  רשומה. לכן T1-PROTOCOL ו-BOARD-LOOP לא מסכימים עכשיו על D0.

**לא בוצע, כי §3.6 לא מבקש אותו:**

- מסלול IndexNow מ-§3.5. התיעוד שלו חסום מה-container, וצריך לקרוא אותו מ-runner לפני שסומכים עליו.
- תיקיית deploy עם `index.html` שהמונה בו פועל ועם מפתח `phc_` אמיתי.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree התחיל על בסיס ישן, וזה תוקן ב-reset כמתואר בהנחיה.
- פקודת Python מורכבת (heredoc + git diff) נחסמה על ידי מנגנון הבידוד של ה-worktree. פיצלתי אותה: סקריפט ב-scratchpad
  ופקודות נפרדות.
- `test_netlify_files.py` נתן תחילה שגיאת collection (מודול חסר) במקום כישלון. יצרתי stub כדי לראות RED אמיתי.
- ב-worktree לא היו `node_modules`. `pnpm install --frozen-lockfile --offline` מה-store המקומי הסתיים ב-2.2 שניות.
- סבב התיקונים: פקודת `sed` שנועדה לקצר קו מפריד בקובץ הבדיקות מחקה את כל רצף המקפים (`-*$` תופס מהמקף הראשון). תוקן
  בסקריפט Python שבונה את השורה ברוחב 120 בדיוק.
- סבב התיקונים: הודעת ה-commit הראשונה של תיקון הקריאות טענה ש"כל בדיקה נושאת משקל", אבל ארבע בדיקות (evidence, route,
  canonicalUrl, foreignShapedEventsExcluded) לא נבדקו. נוספו להן בדיקות, וההודעה תוקנה ב-amend לפני שהמשכתי.
- סבב התיקונים: `pnpm typecheck` לא בודק את `src/__tests__` (`tsconfig.json` מחריג אותו). קובץ הבדיקות נבדק בנפרד עם
  tsconfig זמני שהרחיב את זה של המאגר ונמחק מיד אחר כך.

## 6. בדיקות ופעולות ולידציה

- `python -m pytest -q` ב-`products/chart-explainer` (הפקודה מ-`.github/workflows/chart-explainer-ci.yml`, ב-venv ב-scratchpad
  לפי `requirements-dev.txt`): **151 passed** (132 קודמות + 19 חדשות). בדיקת ה-golden עוברת.
- `pnpm typecheck`: נקי (exit 0).
- `npx vitest run src/__tests__/revenue/experiments.test.ts src/__tests__/revenue/web-arm-readings.test.ts`: 23/23.
- `npx vitest run src/__tests__/revenue`: **Test Files 33 passed (33), Tests 735 passed (735)**.
- סקריפט השוואה מילה-במילה: 5/5 בלוקים VERBATIM.
- ה-hash חושב מחדש בשני כלים ותואם.
- בדיקת התנהגות ב-Node: 0 בטעינה, 1 בגלילה ראשונה, 1 אחרי גלילה שנייה.
- **סבב התיקונים:** `python -m pytest -q` ב-`products/chart-explainer`: **154 passed** (151 + 3 בדיקות Node).
  `npx vitest run src/__tests__/revenue`: **Test Files 33 passed (33), Tests 742 passed (742)**. `pnpm typecheck`: exit 0.
  `tsc --noEmit` על `web-arm-readings.test.ts` בנפרד: exit 0.
- **בדיקות מוטציה בסבב התיקונים:** שש מוטציות בסקריפט המונה (בלי `once`, שליחה ב-load, בלי `.catch`, גישה ל-`document`,
  `location.href`, מאפיין נוסף) הפילו כל אחת לפחות בדיקת Node אחת. ארבע מוטציות ב-`auditWebArmReadings` (בלי בדיקת היום,
  בלי בדיקת D0, בלי איפוס השעון, בלי החלון) הפילו כל אחת לפחות בדיקה אחת. הקבצים המוטנטיים נמחקו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **איפוס בסיס ה-worktree** קורה שוב ושוב: בדיקת `merge-base --is-ancestor` ואז reset. כדאי שהסקריפט שיוצר את ה-worktree
  יעשה זאת בעצמו.
- **"מילה במילה מול הסעיף":** הסקריפט שחילץ את בלוקי הקוד מ-§3.6 ובדק שהם מופיעים בקבצי היעד שימושי לכל פסיקה עתידית
  של "Exact code change (for Opus)". כדאי להפוך אותו לכלי קבוע ב-`scripts/`.
- **venv ל-chart-explainer** נבנה מחדש בכל סשן. כדאי להכניס אותו ל-SessionStart hook.
- **בדיקות מוטציה ידניות** (העתקת קובץ, החלפת מחרוזת, הרצה, מחיקה) נעשו פעמיים בסבב התיקונים. כדאי כלי קטן ב-`scripts/`
  שמקבל קובץ, רשימת החלפות ופקודת בדיקה.
- **`src/__tests__` מחוץ ל-typecheck:** בדיקה עם tsconfig זמני היא צעד ידני. כדאי `tsconfig.test.json` קבוע וסקריפט
  `typecheck:tests`.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת §3 כולו ושל RULING (כ-10K): נחוצה, כי הסתירות נמצאו שם.
- ניסיון הפקודה שנחסם על ידי הבידוד (כ-1.5K): בזבוז. הלקח הוא לכתוב סקריפטים ל-scratchpad מההתחלה.
- שאילתות Context7 (Netlify ×3, Google ×1, כ-4K): נחוצות. בזכותן נמצאה סתירת robots/noindex, והתחביר אומת מול מקור.
- הרצת ה-stub רק כדי לראות RED (כ-1K): מחיר קטן של TDD.
- סבב התיקונים, קריאת §3 מחדש (כ-6K): נחוצה, כי שני כללים (איפוס השעון ב-§3.1(3), והחלון של 56 הימים) לא הופיעו בביקורת
  והיו שוברים את בדיקת היום בלעדיהם.
- סבב התיקונים, תיקוני רוחב שורות ותיקון ה-`sed` (כ-2K): בזבוז קטן. היה נחסך אילו השורות נכתבו מראש ברוחב 120.
- סבב התיקונים, amend כדי לתקן טענה בהודעת commit (כ-1K): מחיר של ניסוח לפני בדיקה. הלקח: לבדוק קודם ולנסח אחר כך.
