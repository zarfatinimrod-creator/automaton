# סבב 45 של לולאת הערוצים — ביקורת התנאים של אתרי אירועי הפרסים (5.10.2026, ~01:11-~05:45 UTC)

## 1. מה המשתמש ביקש
הוראת הבעלים הקבועה (27.9): ערוצים בלי הפסקה, ב-₪0; "תמשיך בfable". טיק הרוטינה של 01:11. §10 של סבב 44 קבע: בדיקה, ואז העבודה חופשית-מבעלים הראשונה שהכרעות ישיבת 5.10 לא יכולות לבזבז — צעד 0 של קריאת דפי הכללים של אירועי הפרסים (§4 שורה 13): ביקורת תנאים של המארחים שאין להם verdict, לפני כל רינדור.

## 2. הפעולות המרכזיות שביצעתי
- **בדיקה (01:11):** PR #46 מוזג (`8fb7131`); main התקדם בשלושה טיקי colony (`065bca6`, `61acec4`, `36bb6d8`: ₪0, מטרות ledger_sync/supervisor/board רצו, 4 חוסמים — אותם צעדי בעלים); הענף הועבר קדימה. אין PR פתוח. MoneyPrinterTurbo#1: טיוטה, ללא שינוי מ-25.9 (נבדק דרך `list_pull_requests` עם שדות מינימליים). אין הודעת בעלים.
- **מיפוי:** 101 הכתובות ב-`research/measurements/ai-allowed-events.urls.txt` יושבות על 56 מארחים ו-45 אתרים (לפי `siteOf`); שניים כבר נשפטו (github.com CONDITIONAL_MET, google.com BARRED), 43 לביקורת.
- **Workflow `wf_70975fb1-ccc` (שישה סוקרי Opus, שישה מאמתים אדברסריים):** כל סוקר קיבל קבוצת אתרים (פלטפורמות; מאוחסנים; גופים ציבוריים; GitHub Pages; אתרי אירועים א/ב), רשת רק github.com ו-raw.githubusercontent.com, בלי חיפוש קוד (מחוץ להיקף המושב), ציטוט מילה-במילה מקובץ בקומיט נעוץ עם sha256. **ה-workflow נפל** ביצירת ה-worktree של המרכיב: הדיסק מלא (ראה §5). 12 התוצאות שרדו ביומן ונשמרו ל-`verified-sites.json`.
- **Workflow `wf_15c2c859-b6e` (מרכיב ב-worktree, סוקר, מתקן):** עותקים שמורים, 43 פסקי דין ב-`terms-verdicts.json`, 9 שורות terms- ו-18 בדיקות robots.txt, הערת ביקורת `TERMS-AUDIT-2026-10-05-prize-events.md`, בדיקה חדשה `prize-terms-audit.test.ts`. הסוקר מצא 4 פגמים (תנאי המיסוך של חמישה אתרי Pages; ~100 ציטוטי שורה לקובץ שג'וב שבועי משכתב — תוקן בנעיצת `@548be52` ו-fixture; שישה אתרים סומנו exhaustive-negative בניגוד לרשומה המאומתת; URL התנאים של grand-challenge.org בנוי מתבנית). המתקן תיקן את כולם test-first והעלה שלוש שאלות ל-thread הראשי.
- **שלוש הכרעות של ה-thread הראשי (Fable 5.1), נרשמו בסעיף האחרון של הערת הביקורת:** R1 — exhaustive-negative (הכרעת 30.9 16(d) D2(iv)) אינו דורש חיפוש קוד ב-GitHub, שמחוץ להיקף המושב; חיפוש מתועד בכל ריפויי ה-declarations של Open Terms Archive, ב-tosdr/tosdr-snapshots, בנוכחות האתר ב-GitHub ובריפו שלנו מספיק. R2 — שורת terms- של אתר TERMS_PENDING יכולה לשאת URL שנגזר מקוד המקור של האתר בקומיט נעוץ כשהגזירה מצוטטת (חריג צר בכותרת `urls.txt`; לעולם לא דף כללים). R3 — כתובת של פרויקט, מחלקה או רשימת תפוצה היא כתובת תפקיד ולא מידע אישי לפי GitHub AUP §7; כתובת של אדם בשמו — כן.
- **Workflow `wf_8889b4e0-988` (מיישם, בודק) + מתקן שני (Agent):** ההכרעות יושמו (תשעה אתרי NO_TERMS קיבלו תווית exhaustive-negative ו-robots probes, ביניהם שלושה חדשים: health-data-hub, ijcai, mozilladatacollective; שורה 237 הופעלה; ארבעה אתרי Pages חזרו ל-CONDITIONAL_MET, xiuwenz2 נשאר UNMET בגלל שתי כתובות של אנשים בשמם). הבודק מצא 6 פגמים (נימוק שגוי בהערת mozilladatacollective; הגדרת exhaustive-negative לא עודכנה; "17 ריפויים" מול 18; ספירת READMEs; בדיקה רפה של טקסט ההכרעות ושל קבוצות הרינדור) — כולם תוקנו, מוטציות C1/C2 של הבודק נהרגו.
- **מיזוג `0a33990`** דרך `scripts/merge-worktree.sh` (verify: 71 קבצים, 2,336 בדיקות). קבצי הלולאה דרך `loop-edit` (§0, שורת Fable, §4 שורה 13, §9, §10; CHECKPOINT); יומן זה.

## 3. קבצים/מערכות ששונו
- חדש: `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md`; `research/channel-loop/terms/github-terms-of-service-2026-10-05.md`, `github-acceptable-use-policies-2026-10-05.md`, `openreview-terms-of-use-2026-10-05.md`, `codabench-privacy-and-terms-2026-10-05.md`, `ansperformance-disclaimer-2026-10-05.md`; `src/__tests__/revenue/prize-terms-audit.test.ts` + fixture `ai-allowed-events-548be52.urls.txt`; `logs/2026-10-05-channel-loop-tick-45-prize-terms-audit.md`.
- שונה: `research/channel-loop/terms-verdicts.json` (43 כניסות), `research/rendered/urls.txt` (30 שורות + חריג R2 בכותרת), `research/channel-loop/ZERO-TESTS.md` (שורות 235-264), `scripts/queue-zero-test.mjs` (`PATH_LIMITS` עם `hosts`), `src/__tests__/revenue/terms-saved-copies.test.ts`, `logs/CHANNEL_LOOP.md`, `logs/CHECKPOINT.md`.
- לא שונה: `ai-allowed-events.urls.txt` ו-`.md` (הג'וב כותב אותם); `TERMS_BARRED` (אין אתר BARRED); שום דף כללים לא רונדר.

## 4. החלטות והנחות משמעותיות
- **ביקורת תנאים לפני כל dispatch** — כלל סבב 20; 21 מתוך 43 האתרים הם אתרי אירוע קטנים בלי תנאים ב-GitHub; הדרך היחידה אליהם היא בדיקת robots.txt (D2(v)) ולא ניחוש.
- **R1:** הגדרה שדורשת כלי שאין לנו הייתה הופכת את D2(v) לאות מתה; "חיפוש מתועד" נמדד לפי המקורות שהלולאה מגיעה אליהם.
- **R2:** מטרת הכלל ב-`urls.txt` היא לעצור ניחושים; URL שנגזר משורות מצוטטות בקוד המקור של הפלטפורמה אינו ניחוש; החריג צר (terms- בלבד; 404 או redirect מחוץ למארח — פרישה).
- **R3:** ההבחנה בין כתובת תפקיד לכתובת של אדם היא ההבחנה של "מידע אישי"; ללא מיסוך כתובות ב-render-watch, לכידה של דף עם כתובות אנשים נשארת UNMET (תקדים Mozilla/AMO).
- **שידור מחדש מהיומן ולא resume:** ה-resume של ה-workflow שנפל התחיל להריץ מחדש את ששת המאמתים (סדר הקריאות השתנה, ה-cache נשבר) — נעצר, ו-workflow חדש קרא את 43 הרשומות מקובץ. חסך ~45 דקות ו-~1M אסימוני Opus.
- **הכרעות על Fable, ביצוע על Opus** — לפי כלל הניתוב.

## 5. שגיאות וניסיונות שנכשלו
- **הדיסק מלא (100%):** 21 GB ב-scratchpad של המושב — תיקיות `tick*-review*`, venvs, שיבוטי ריפו של סוכני סבב 45 (`g/`, `t45/repos`), `yt-kids-sample` (2.1 GB), ועוד `uv`/pip/go caches. ה-workflow הראשון נפל ב-`git worktree add` ("unable to write file"). נוקה ל-17 GB. הלקח ב-§9 5.10 פריט 4.
- **resume שלא עזר:** ראה §4.
- **מסווג הבטיחות** (claude-sonnet-5[1m]) לא היה זמין בסיום המיישם; הבודק האדברסרי כיסה את הפלט.
- **הסוקרים לא הריצו GitHub code search** (מחוץ להיקף) ורשמו "לא ממצה" — מה שהוליד את שאלת R1.

## 6. בדיקות ופעולות ולידציה
- מיזוג: `verify.sh` (העותק מלפני המיזוג) exit 0 — typecheck exit 0, vitest 71 קבצים, 2,336 בדיקות.
- בתוך ה-worktree (מרכיב/מתקנים): `prize-terms-audit.test.ts` 15/15, `terms-saved-copies` 14, `render-watch-terms-barred` 24, `queue-zero-test` 38, `frozen-citations` 22; `urls-pause-comments.mjs --check` exit 0; `freeze-capture.mjs --cited` exit 0; מוטציות: 7 (מרכיב) + 4 (מתקן 1) + 3 (מיישם) + 4 (מתקן 2) — כולן נהרגו, כולל C1/C2 של הבודק.
- אימותים: כל עותק שמור הושווה ל-fetch מחדש בקומיט הנעוץ (sha256 ובייטים); ציטוטים אומתו ב-`grep -n -F`.
- grep למזהי הבעלים: 0 בכל הקבצים שנגעו בהם; grep לכתובות דוא"ל בשורות שנוספו: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- ניקוי scratch (§9 פריט 4); מסנן dispatch לפי `termsGate` (§9 פריט 2); בדיקת עקביות שורות ZERO-TESTS ↔ `urls.txt` (§9 פריט 3).
- מיפוי מארחים→אתרים→verdicts לקובץ כתובות — נעשה שוב ב-node חד-פעמי; מתאים לפקודה `--hosts`.
- ה-probe של תחילת הטיק — שש קריאות ידניות (ראה סבב 44 §7).

## 8. על מה בוזבזו אסימונים, לפי פעולה
- סוכנים: ~2.78M (12 סוקרים/מאמתים + הניסיון שנפל), ~1.22M (מרכיב/סוקר/מתקן), ~0.63M (מיישם/בודק), ~0.19M (מתקן 2) — כ-4.8M אסימוני Opus.
- בזבוז: ה-resume שהתחיל להריץ שני מאמתים מחדש לפני שנעצר (~10 דקות × 2 סוכנים); ~100 ציטוטי שורה לקובץ מתחלף שהמתקן נעץ מחדש (עבודה כפולה של המרכיב); קריאת ה-probe של `list_workflow_runs` (12 ריצות עם גופי קומיט).
