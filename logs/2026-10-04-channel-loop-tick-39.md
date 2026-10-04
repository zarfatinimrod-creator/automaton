# סבב 39 של לולאת הערוצים — ישיבת Fable של 1.10 (ב-4.10), שני קיפולים, תחזוקה (4.10.2026, 07:17-~09:50 UTC)

## 1. מה המשתמש ביקש
הוראת הבעלים הקבועה (27.9): ערוצים בלי הפסקה, ב-₪0. 14 טיקים של הרוטינה "Channel loop tick" (1.10 01:11 עד 4.10 07:12) הצטברו בזמן שהמושב היה מת על המכסה השבועית; כולם רצו כסבב אחד לפי §1 של `logs/CHANNEL_LOOP.md`. הבעלים: "תמשיך" ו"תמשיך בfable" — המושב רץ על Fable 5.1, תתי-הסוכנים על Opus (כלל הניתוב של CLAUDE.md).

## 2. הפעולות המרכזיות שביצעתי
- **בדיקה (probe):** origin/main התקדם רק בטיקי colony (₪0, 4 חוסמים, כולם צעדי בעלים); אין PR פתוח; MoneyPrinterTurbo#1 טיוטה, נקי, בלי שינוי; render-watch לא רץ מ-29.9 (הבא: שלישי 6.10 05:23). Fable probe 07:21 — OK (~14 שניות).
- **ישיבת Fable (07:25):** שני סוכני Fable במקביל (Agent tool, `model: fable`), כל אחד קורא את `SITTING-2026-10-01-BRIEF.md` (שורה 23: חלקים A ו-C; שורה 18: חלקים B ו-C), בודק כל מצביע מול העץ `f2fca6d`, וכותב קובץ הכרעה אחד. שורה 23: `RULING-2026-10-04-kids-youtube.md` (583 שורות, ~28 דק', ~362k) — ADMIT `kids-explainers` מוחזק מאחורי T1. שורה 18: `RULING-2026-10-04-mozilla-precondition.md` (427 שורות, ~22 דק', ~313k) — אופציה (iv) עם (ii) בתוך צעד 7; (i) ו-(iii) נדחו; פריט 4 של תור סבב 36 הוכרע. בלי 429.
- **קיפול שורה 18** (`wf_215fc411-35d`: בונה ב-worktree, סוקר, מתקן על Opus; 7 פעולות קיפול; 6 פגמי סקירה תוקנו; 21 מוטציות נהרגו). המתקן קרא את רשימת "able to" של billing manager (מתוך שני clones מקומיים של github/docs) ומצא שהתפקיד יכול להוסיף אמצעי תשלום, לשנות מסלול ולבטל/להתחיל חסויות — והחזיק את פריט 9 להחלטה. **ההחלטה (ה-thread הראשי, Fable): צורה B בלבד** — הטוקן לקריאה בלבד יוצא מהחשבון האישי של הבעלים; חשבון המכונה לא נעשה billing manager. תיקון צורף להכרעה, ומתקן Opus אחד יישם אותו (`8276911`, 10 מוטציות נהרגו, PDF 18 עמודים). מיזוג `d774ea0`.
- **קיפול שורה 23** (`wf_164f72d7-201`: שני בונים ב-worktrees נפרדים — הערות וקוד — כל אחד עם סוקר ומתקן; 11 + 9 פגמים תוקנו; 12 מוטציות קוד נהרגו). הערות: `KIDS-LINE.md`, REJECTED/ASSESSMENT, Stage A ב-T1-PROTOCOL, BOARD-LOOP:17, קריאת Open Terms Archive של Community Guidelines (`4d29ee7`). קוד: `KIDS_EXPLAINERS_EXPERIMENT` + קריאת-חזרה של `madeForKids`, G11 ו-G7-k, `youtube-madeforkids-readback.ts`, `brand-check.mjs` מסרב ל-YouTube כל עוד חסום, רשימת תת-מותג, תג על כל פריים. מיזוגים `1240c37` ו-`4048db4` (קונפליקט ב-README של chart-explainer וב-BOARD-LOOP:17 נפתר ביד: שתי העריכות נשמרו).
- **תחזוקה** (`wf_64c6e6cd-d3d`; פריטים 3 ו-7 של תור סבב 36): עותקי תנאי Apify מ-`apify/apify-docs` בקומיט נעוץ עם file:line; `scripts/urls-pause-comments.mjs` (12 הערות השהיה תוקנו; שומר שנופל כשפסק משתנה בלי `--fix`); `chartsplained` בטקסט. מיזוג `240fae3`.
- **PR #40 מוזג** (`04e965d`) כשהיה ירוק; הענף הועבר קדימה ל-main; **PR #41** נפתח לקיפולים ולקבצי הלולאה.
- **קבצי הלולאה:** `CHANNEL_LOOP.md` (§0, שורת §3 חדשה לקו הילדים, §4 שורות 8 ו-29, §5, §6 צעד 7 עם צורה B, §7, §8, §9 "Fixed in tick 38/39" + תור 4.10, §10); `FABLE_QUEUE.md` (שורות 18 ו-23 DONE, 19-22 הועברו ל-5.10 ו-6.10, שורה 24 חדשה, יומן probe); `CHECKPOINT.md`.

## 3. קבצים/מערכות ששונו
- הכרעות: `research/channel-loop/RULING-2026-10-04-kids-youtube.md`, `RULING-2026-10-04-mozilla-precondition.md` (+ תיקון 4.10 בסופה), `RULING-2026-09-29-loop.md` (תיקון (b) צורף; 26 ציטוטים אליה הופנו).
- בעלים: `src/revenue/owner-steps.ts`, `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf` (צעד 7: תקציב $0 לארגון + טוקן קריאה של הבעלים; צעד 6: שורת `ORG_BUDGETS_READ_TOKEN`).
- קו הילדים: `research/youtube-kids/KIDS-LINE.md`, `research/measurements/kids-subbrand-candidates.txt`, `src/revenue/experiments.ts`, `src/revenue/publication-gate.ts`, `src/revenue/youtube-madeforkids.ts`, `scripts/youtube-madeforkids-readback.ts`, `scripts/brand-check.mjs`, `.github/workflows/brand-check.yml`, `products/chart-explainer/{manifest.py,charts.py,releases/t1/*}`, `research/faceless-youtube/T1-PROTOCOL.md`, `docs/REJECTED.md`, `research/youtube-kids/ASSESSMENT.md`, `research/channel-loop/BOARD-LOOP.md:17`.
- תנאים ורינדור: `research/channel-loop/terms/apify-*.md`, `terms-verdicts.json` (apify.com, mozilla.org), `research/rendered/urls.txt` (:331 הוצאה; 12 הערות), `ZERO-TESTS.md` שורה 34, `scripts/urls-pause-comments.mjs`, `research/measurements/actions-spending-limit.md`.
- יומני משימה (עברית): `logs/2026-10-04-maintenance-items-3-7.md`, `-fable-sitting-row-18-applied.md`, `-fold-row-23-docs.md`, `-fold-row-23-code.md`.

## 4. החלטות והנחות משמעותיות
- **14 טיקים = סבב אחד.** הפרוטוקול מריץ טיק אחד; הצבר לא מצדיק 14 סבבי לוג, אלא סבב אחד שמתעד את הפער.
- **הישיבה שנדחתה רצה ביום שאינו ~07:11 של התאריך המתוכנן.** כלל "Fable רק ב-07:11" נועד למכסה; הישיבה הוחמצה שלוש פעמים ולכן רצה בטיק 07:12 של 4.10 (≤2 סוכנים, probe קודם).
- **צורה B לטוקן (החלטת כסף על Fable, ה-thread הראשי):** זהות אוטומטית לא מקבלת תפקיד שיכול להוציא כסף, גם אם הטוקן שלה לקריאה בלבד — החשיפה היא התפקיד. זו גם הנפילה-לאחור שההכרעה כבר הציעה.
- **PR #40 מוזג לפני סיום הסבב** כדי שההקפאה תהיה על main לפני הריצה השבועית; PR #41 נושא את השאר. קובץ הלולאה על main היה "סבב 37" במשך ~שעה — מקובל.
- **הקיפולים נפרדו לשלושה worktrees** (שורה 18; שורה 23 הערות; שורה 23 קוד) כדי שהסקירות יתקדמו במקביל; חפיפה אחת (BOARD-LOOP:17) נפתרה ביד.
- **BOARD-LOOP.md:53 נושא מזהה בעלים מלפני הכלל** — לא נשכתב (רשומת תכנון), נרשם ל-§9 ולבעלים.

## 5. שגיאות וניסיונות שנכשלו
- המיזוג הראשון של סבב 38 נפל ב-`verify.sh`: השומר החדש תפס 23 ציטוטים חיים בהכרעת שורה 18 שנכתבה באותו בוקר — `--cited --apply` הפנה אותם. ארבעה אזכורים ללא שורה של `amo-add-on-policies` נרשמו ב-`LIVE_MENTIONS`; הקיפול של שורה 18 הסיר את הרשומה כשהשורה הוצאה (הסלאג כבר לא פעיל).
- שני סקריפטי עריכה של `FABLE_QUEUE.md` ואחד של `CHANNEL_LOOP.md` נפלו על assertion (טקסט מושב, ספירת תאים, מספר שורת כותרת §7); קומיט `729b6b9` יצא עם הודעה שהבטיחה עריכות שלא נכתבו — תוקן ב-`15b1e81`.
- מיזוג קוד שורה 23: שני קונפליקטים (README של chart-explainer: תחזוקה מול הבונה; BOARD-LOOP:17: שני בונים). נפתרו ביד, `pytest` ואז `verify.sh` ירוקים.
- Chromium קרס (SIGTRAP) ביצירת ה-PDF מתוך נתיב scratch ארוך; עבד עם `TMPDIR` קצר.
- הבונה של התחזוקה השתמש ב-`curl` ל-raw.githubusercontent.com כי WebFetch מחזיר סיכום ולא טקסט מילה-במילה; המארח המותר נשמר.
- המכסה השבועית: שלוש ישיבות Fable הוחמצו (1.10-3.10). שורות 19-22 נדחו ביומיים-שלושה.

## 6. בדיקות ופעולות ולידציה
- כל מיזוג דרך `scripts/merge-worktree.sh` (עותק verify.sh מלפני המיזוג, exit code): `d774ea0` 1,906 בדיקות; `1240c37` 1,906; `4048db4` 2,154 (66 קבצים). `scripts/pytest-product.sh chart-explainer` 187 עברו אחרי פתרון הקונפליקט.
- מוטציות (`scripts/mutate.mjs`): שורה 18 — 11 + 10 + 10 נהרגו; שורה 23 קוד — 12 (10 TS + 2 Python); תחזוקה — 9 + 5 (X1 שרד במכוון: השומר נבדק ישירות).
- `node scripts/freeze-capture.mjs --cited` = 0 ציטוטים חיים לפי שורה אחרי כל מיזוג; `urls-pause-comments.mjs --check` exit 0.
- grep למזהי הבעלים: 15 קבצים קיימים מראש, ללא שינוי; 0 בקבצי הלולאה והיומנים.
- CI על PR #40: ירוק על כל head; PR #41 — ממתין ל-head האחרון.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- עריכות שורות-טבלה ב-`FABLE_QUEUE.md` וב-`CHANNEL_LOOP.md` בסקריפטי Python עם assertions — שלוש נפילות היום. כלי `scripts/loop-edit.mjs` (set-status/append-cell/insert-after לפי מזהה שורה) יחסוך סבבים.
- `MERGE_TRAILERS` נדרש בכל מיזוג מהמושב הזה; הסקריפט יכול לקרוא את המודל מהסביבה.
- בונים ב-worktree התחילו שוב על בסיס ישן (`d88739c`) ואיפסו לפי ההנחיה — ההנחיה בכל brief עובדת, אבל `isolation: worktree` יכול לקבל בסיס מפורש.
- קונפליקט צפוי כששני בונים נוגעים באותה שורה (BOARD-LOOP:17): לחלק מראש מי נוגע בקובץ משותף, או להריץ בטור.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קיפול שורה 23: ~1.9M אסימוני תת-סוכן (6 סוכנים) — הבנייה הגדולה של הסבב (קוד + הערות + סקירות).
- קיפול שורה 18: ~1.0M (3 סוכנים) + ~236k למתקן צורה B.
- תחזוקה 3 ו-7: ~714k (3 סוכנים) — יקר ביחס לגודל; הסוקר הריץ בעצמו pytest, verify ומוטציות.
- ישיבת Fable: ~675k אסימוני Fable (שני סוכנים) + probe 82k.
- סבב 38 (ההרצה השלישית): ~475k; שני המתקנים שנקטעו קודם — עבודה חוזרת חלקית.
- ה-thread הראשי: ~15 סבבי Bash על עריכות לולאה, מהם 3 נפילות assertion; 6 ריצות verify מלאות (~4 דק' כל אחת).
