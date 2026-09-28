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
  נוספה בדיקה `web-arm-readings.test.ts` שמריצה מחדש את `evaluateWebArm` על כל קריאה רשומה, כלומר "המבקר מריץ על אותם
  מספרים". ה-RED היה ENOENT, ואחר כך 3/3 עברו.
- **מצביעים:** לפי "Pointers to update when convenient" עדכנתי את T1-PROTOCOL סעיף 4 (מחקתי בקו את "needs the brand domain"
  וסימנתי אותו superseded) ואת BOARD-LOOP דרגה 5 ("zero stranger reach" הפך ל-"under 5 engaged stranger page views, as
  pre-registered").
- **בדיקת התנהגות:** הרצתי את הסקריפט שנוצר ב-Node עם `addEventListener`/`fetch` מזויפים. התוצאה: 0 שליחות בטעינה, 1 בגלילה
  הראשונה, 1 גם אחרי גלילה שנייה. המטען הוא בדיוק `{$process_person_profile:false, $current_url}`, ו-`$current_url` הוא
  origin + pathname, בלי query ובלי fragment.

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
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md` או `CLAUDE.md`. לא בוצע push.
  שום דבר לא פורסם.

## 4. החלטות והנחות משמעותיות

- **המארח כפרמטר, לא קבצים סטטיים.** הסעיף מבקש שורת `Sitemap:` ו-`<loc>` עם ה-URL הקנוני, אבל שם ה-sub-brand מופיע
  ב-RULING תחת "What was not decided here". כל מארח קבוע היה ניחוש, ולכן הפונקציה מקבלת origin מאומת (https, אותיות קטנות,
  בלי port/path/query/`/` בסוף) ונכשלת סגור. הקבצים ציבוריים, ולכן אין בהם הערות ולא מופיעים בהם שמות מסמכים פנימיים.
- **ה-URL הקנוני הוא origin + "/"**, בדיוק מה שהמונה שולח מהדף עצמו (§3.1). הנחה: הדף הקנוני מוגש מהשורש (`index.html`),
  כפי שמשתמע מ-`/preview/ /index.html 200`.
- **robots.txt כולל גם `User-agent: *`**, כי בלי שורת user-agent הכלל `Disallow` אינו תקף. זו לא תוספת תוכן.
- **שני השורות של robots ו-noindex נשארו כפי שנפסק**, למרות הסתירה שבסעיף 5. ההכרעה ביניהן היא של הבורד.
- **קובץ הקריאות נוצר עכשיו כשלד ריק**, כדי שהמבנה ייקבע לפני שיש נתונים (ברוח הרישום המוקדם). null פירושו "לא נקרא",
  ולעולם לא אפס.
- ב-docstring של page.py שיניתי רק את המשפט שהסעיף מציין. הביטוי "random id drawn for that load" נשאר (הסעיף לא ביקש
  לשנות אותו).

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree התחיל על בסיס ישן, וזה תוקן ב-reset כמתואר בהנחיה.
- פקודת Python מורכבת (heredoc + git diff) נחסמה על ידי מנגנון הבידוד של ה-worktree. פיצלתי אותה: סקריפט ב-scratchpad
  ופקודות נפרדות.
- `test_netlify_files.py` נתן תחילה שגיאת collection (מודול חסר) במקום כישלון. יצרתי stub כדי לראות RED אמיתי.
- ב-worktree לא היו `node_modules`. `pnpm install --frozen-lockfile --offline` מה-store המקומי הסתיים ב-2.2 שניות.

## 6. בדיקות ופעולות ולידציה

- `python -m pytest -q` ב-`products/chart-explainer` (הפקודה מ-`.github/workflows/chart-explainer-ci.yml`, ב-venv ב-scratchpad
  לפי `requirements-dev.txt`): **151 passed** (132 קודמות + 19 חדשות). בדיקת ה-golden עוברת.
- `pnpm typecheck`: נקי (exit 0).
- `npx vitest run src/__tests__/revenue/experiments.test.ts src/__tests__/revenue/web-arm-readings.test.ts`: 23/23.
- `npx vitest run src/__tests__/revenue`: **Test Files 33 passed (33), Tests 735 passed (735)**.
- סקריפט השוואה מילה-במילה: 5/5 בלוקים VERBATIM.
- ה-hash חושב מחדש בשני כלים ותואם.
- בדיקת התנהגות ב-Node: 0 בטעינה, 1 בגלילה ראשונה, 1 אחרי גלילה שנייה.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **איפוס בסיס ה-worktree** קורה שוב ושוב: בדיקת `merge-base --is-ancestor` ואז reset. כדאי שהסקריפט שיוצר את ה-worktree
  יעשה זאת בעצמו.
- **"מילה במילה מול הסעיף":** הסקריפט שחילץ את בלוקי הקוד מ-§3.6 ובדק שהם מופיעים בקבצי היעד שימושי לכל פסיקה עתידית
  של "Exact code change (for Opus)". כדאי להפוך אותו לכלי קבוע ב-`scripts/`.
- **venv ל-chart-explainer** נבנה מחדש בכל סשן. כדאי להכניס אותו ל-SessionStart hook.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת §3 כולו ושל RULING (כ-10K): נחוצה, כי הסתירות נמצאו שם.
- ניסיון הפקודה שנחסם על ידי הבידוד (כ-1.5K): בזבוז. הלקח הוא לכתוב סקריפטים ל-scratchpad מההתחלה.
- שאילתות Context7 (Netlify ×3, Google ×1, כ-4K): נחוצות. בזכותן נמצאה סתירת robots/noindex, והתחביר אומת מול מקור.
- הרצת ה-stub רק כדי לראות RED (כ-1K): מחיר קטן של TDD.
