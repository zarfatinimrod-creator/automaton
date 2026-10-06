# טיק 54 (6.10.2026) — פסקי robots לאתרי פרסי-ה-AI: 17 ל-NO_TERMS_ROBOTS_OK, 4 נשארים NO_TERMS

בונה Opus, ב-worktree נפרד על הענף `build/tick54-robots-verdicts` (בסיס: `claude/new-session-j071dx` ב-`5f4853a`). לא
נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, `urls.txt` או
`ai-allowed-events.urls.txt`.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים):

- **A.** להחיל דרך `scripts/robots-verdict.mjs` בלבד (לעולם לא ביד) את 17 הפסקים שה-dry-run של ה-thread הראשי הראה,
  לפי פסיקה 30.9 16(d) D2(iv)-(v), עם `--urls research/measurements/ai-allowed-events.urls.txt --apply`; לוודא ש-4 האתרים
  האחרים (flagos.io, theemailgame.com, situatedevals.org, mozilladatacollective.com) יוצאים 3 מהסיבה הנכונה; לוודא
  ש-nevo.co.il (רשימת ברירת המחדל) יוצא 3; ולבדוק ש-`terms-verdicts.json` השתנה רק ב-17 הרשומות האלה (verdict, source,
  checked) ושהוא עדיין נקרא כ-JSON.
- **B.** לפתח את `src/__tests__/revenue/prize-terms-audit.test.ts` כך שיתאר בכנות את שני המצבים: האודיט של טיק 45 כפי שהיה
  (ה-fixture בית-בבית) וההתקדמות של 6.10; כולל describe חדש "tick 54: the robots verdicts of 6.10".
- **C.** להוסיף ל-`research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` סעיף "## Robots verdicts (6.10.2026, tick 54)"
  עם פסקה, טבלה (כל 21 האתרים ו-nevo) ופסקה על הארבעה ועל nevo, הכל מדוד מהלכידות; ולעדכן את כותרות "What the reading can
  render" כך שיישארו נכונות עם מספרי 5.10 גלויים כהיסטוריה. פרק הפסיקות של ה-thread הראשי נשאר מילה במילה.
- **D.** `scripts/verify.sh` על חמשת קבצי הבדיקה, ואז `scripts/verify.sh` המלא; grep שמות; commit אחד או שניים עם ה-trailers.
- **E.** יומן זה, בעברית, בשמונה הסעיפים.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree בדיוק כפי שנכתב, בדקתי `git log --oneline -1` (`5f4853a`) ו-`ls products/ src/revenue/` (שניהם קיימים,
   לא היה צורך ב-reset), וקישרתי `node_modules`.
2. **dry-run לכל 21 לפני ה-apply** (exit 0 ל-17, exit 3 ל-4 — תואם ל-dry-run של ה-thread הראשי).
3. **apply ל-17**: כל אחד exit 0, שורת פלט ראשונה `robots-verdict: <site> (NO_TERMS)`, ושורת
   `set <site> to NO_TERMS_ROBOTS_OK in .../research/channel-loop/terms-verdicts.json` (הנתיב הוא של ה-worktree; ה-checkout
   הראשי לא השתנה, `git -C /home/user/automaton status` ריק לקובץ).
4. **dry-run ל-4 ול-nevo אחרי ה-apply** וריצה חוזרת (dry) ל-17: ראו טבלת הפקודות בסעיף 6.
5. בדיקת ה-diff של `terms-verdicts.json`: 51 שורות נוספו ו-51 נמחקו (17×3); בהשוואת JSON מול `HEAD` רק 17 אתרים השתנו, ובכל
   אחד רק `verdict,source,checked`; סדר המפתחות זהה; הקובץ נקרא ב-`JSON.parse`; `serializeVerdicts` מחזיר אותו בית-בבית.
6. מדדתי את ערכי הטבלה בסקריפט scratch שמשתמש בפונקציות המיוצאות (`readRobotsCapture`, `readableCapture`, `queuedPaths`,
   `judgeSite`), כולל בדיקה ש-`judgeSite` משחזר כל אחד מ-17 ה-source בדיוק מרשומת ה-NO_TERMS של טיק 45.
7. כתבתי את הבדיקות (סעיף 3), את עדכוני ההערה (סעיף 3), והוספתי ל-`frozen-citations.test.ts` את ה-LIVE_MENTIONS הדרושים.
8. מוטציות: תוכנית scratch של 16 מוטציות על `terms-verdicts.json` ועל ההערה; ריצה ראשונה ב-`scripts/sim-tree.sh` — 15 נהרגו,
   1 שרדה (שינוי ב-source של טיק 45 אחרי "NO_TERMS before:"); הוספתי pin של sha256 ל-17 ה-source של טיק 45 (נבדק מול
   `5f4853a`), ובריצה השנייה 16/16 נהרגו.
9. `verify.sh` ממוקד ומלא, grep שמות, שני commits.

## 3. קבצים/מערכות ששונו

- `research/channel-loop/terms-verdicts.json` — 17 רשומות, רק דרך הסקריפט: agenthon.net, aicrowd.com, alignmentforum.org,
  bcamlc.com, crunchdao.com, drivendata.org, geminixprize.com, health-data-hub.fr, ijcai.org, k12-ai-infrastructure.org,
  learn2design2026.com, microblink.com, pasteurlabs.ai, solafune.com, sophelio.io, thinkonward.com, wundernn.io.
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — ב-"What the reading can render": קבוצה חדשה
  "Now, on robots.txt (6.10, tick 54): 20 URLs on 17 sites" עם 20 שורות ה-URL (כל אחת מצוטטת ל-`@548be52:N`); הקבוצה
  "After Tuesday's robots probes" הפכה ל-"Probed 6.10, NO_TERMS_ROBOTS_OK not set: 9 URLs on 4 sites" עם "(5.10: 29 URLs on 21
  sites, ...)"; שורת Total חדשה (`13 + 20 + 40 + 9 + 19 + 0`) ושורת היסטוריה `5.10 (tick 45), before the robots verdicts: 13 +
  0 + 40 + 29 + 19 + 0`. בסוף הקובץ: "## Robots verdicts (6.10.2026, tick 54)" עם 22 שורות טבלה. פרק הפסיקות לא נגע.
- `src/__tests__/revenue/prize-terms-audit.test.ts` — `tick45()` (קורא את רשומת ה-NO_TERMS חזרה מתוך ה-source), חמש הבדיקות
  שנכשלו מתארות את שני המצבים, `RENDER_GROUPS` של שש קבוצות, ו-describe חדש עם 6 בדיקות (21 בדיקות בקובץ).
- `src/__tests__/revenue/frozen-citations.test.ts` — `ROBOTS_SET` ו-`ROBOTS_READ`: 17 מפתחות ל-`terms-verdicts.json` ו-22
  להערת האודיט ב-`LIVE_MENTIONS`, עם הסיבה.
- `logs/2026-10-06-channel-loop-tick-54-robots-verdicts.md` — יומן זה.

## 4. החלטות והנחות משמעותיות

- **שש מתוך 17 ענו 404**, ולכן אין להן `robots-<x>.txt` (render-watch לא שומר גוף): bcamlc, learn2design2026, microblink,
  pasteurlabs, solafune, thinkonward. ה-source שהסקריפט כתב מצביע על `.meta.json` וללא sha256 (RFC 9309 §2.3.1.3). הבריף
  ביקש "קובץ `robots-<x>.txt` שקיים" — הבדיקה בודקת את זה ל-11 שהגישו קובץ (וגם שה-sha256 של הקובץ על הדיסק שווה ל-sha256
  במטא), ול-6 בודקת שהמטא שה-source מציין קיים, status 404, `bodyPath` ו-`sha256` הם null, ו-`readableCapture` מחזיר `absent`.
- **mozilladatacollective.com: ארבעה נתיבים בתור, לא אחד.** הבריף אמר "the one queued path"; הסקריפט והרשימה (גם ה-fixture)
  מראים 4 (קבוצת התחרות ושלושה מסלולים), כולם נחסמים ב-`Disallow: /` תחת `User-agent: *`. הבדיקה מצפה ל-4.
- **קבוצת רינדור נפרדת** ל-NO_TERMS_ROBOTS_OK במקום לקפל אותה לתוך "Now": כך "Now" נשארת 13/12 בשני המצבים, והכותרות
  שהשתנו (קבוצות 2 ו-4) נושאות "(5.10: N URLs on M sites" — והבדיקה דורשת שכותרת תישא היסטוריה בדיוק כשהספירה שלה השתנתה.
- **הבדיקה גוזרת את מצב טיק 45 מתוך הקובץ** (`tick45()`), כי בהרצת CI רדודה אין את `5f4853a`. בגלל שזה עיגולי לגבי ה-source
  הישן, הוספתי `TICK45_SOURCES_SHA256` (נבדק מקומית מול `git show 5f4853a:...`: כל 17 ה-source וה-notes זהים).
- **השוואת השחזור לפי ארבעת השדות שהסקריפט כותב** (verdict, source, checked, note) ולא לפי הרשומה כולה: fold 2 של פסיקת
  שורה 21 (6.10) מוסיף שדה `copying` לכל אתר, ואז השוואה מלאה הייתה נכשלת בלי שום טעות.
- **בדיקות in-process בלבד**: `judgeSite` במקום להריץ את הסקריפט כ-child process; `main()` מדפיס `no change: <why>` ויוצא 3
  בדיוק כש-`changed` הוא false, ולכן `changed: false` + `why` הוא המקבילה ל-"exit 3 already".
- **LIVE_MENTIONS ולא הקפאה**: הסקריפט כותב את שם הלכידה החיה (הוא אף פעם לא קורא עותק קפוא), ואסור לערוך source ביד; לכן
  רשמתי את האזכורים כמכוונים (כמו `terms-verdicts.json robots-nevo`). אף ציטוט אינו לפי שורה.
- **הבסיס זז בזמן העבודה**: `claude/new-session-j071dx` קיבל `79e92eb` (שעון הדומיין) ו-`612eb5f` (פסיקת שורה 21). שניהם רק
  מוסיפים שני קבצים חדשים, אין התנגשות, ולא מיזגתי אותם לענף. קראתי את פסיקת שורה 21: היא משאירה את K2 exhaustive-negative
  "fetchable only under NO_TERMS_ROBOTS_OK" וקובעת ש-Disallow הוא חסם — תואם לכך ש-mozilladatacollective לא נקבע.
- **תוכנית המוטציות נשארה ב-scratch**: היא על קבצי נתונים והערה, לא על סקריפט, ולכן אין לה בית ב-`mutations/<script>.json`.

## 5. שגיאות וניסיונות שנכשלו

- אחרי ה-apply נכשלה גם `frozen-citations.test.ts` (לא צוין בבריף): 17 אזכורים של לכידות robots חיות ב-`terms-verdicts.json`
  שלא היו ב-`LIVE_MENTIONS`. התיקון: רשימות `ROBOTS_SET`/`ROBOTS_READ`. אחרי הוספת הטבלה נדרשו גם 22 מפתחות להערה.
- המוטציה `before-lost` שרדה בריצה הראשונה (ראו סעיף 4) — הוספתי את ה-pin.
- ב-`--check` של תוכנית המוטציות מוטציה אחת (`mdc-set`) לא חלה: ההזחה ב-JSON היא רווח אחד לכל רמה ולא כפי שכתבתי; תיקנתי.
- ריצת `sim-tree` הראשונה יצאה 1 (בגלל המוטציה ששרדה) והשאירה את העץ; מחקתי אותו בנתיב המוחלט שהודפס.

## 6. בדיקות ופעולות ולידציה

פקודות הסקריפט (כולן מתוך ה-worktree; לרשימה: `--urls research/measurements/ai-allowed-events.urls.txt`):

| פקודה | אתרים | exit | שורה ראשונה | שורת ההכרעה |
|---|---|---|---|---|
| dry-run לפני apply | 17 | 0 כל אחד | `robots-verdict: <site> (NO_TERMS)` | `would set <site> to NO_TERMS_ROBOTS_OK (dry run; ...)` |
| dry-run לפני apply | 4 | 3 כל אחד | `robots-verdict: <site> (NO_TERMS)` | `no change: ...` |
| `--apply` | 17 | 0 כל אחד | `robots-verdict: <site> (NO_TERMS)` | `set <site> to NO_TERMS_ROBOTS_OK in .../terms-verdicts.json` |
| dry-run חוזר | 17 | 3 כל אחד | `robots-verdict: <site> (NO_TERMS_ROBOTS_OK)` | `no change: <site> is already NO_TERMS_ROBOTS_OK` |
| dry-run | flagos.io | 3 | `robots-verdict: flagos.io (NO_TERMS)` | `... is not a robots.txt the site served: a 200 answered text/html, not text/plain. ...` |
| dry-run | theemailgame.com | 3 | `robots-verdict: theemailgame.com (NO_TERMS)` | `... a 200 answered text/html; charset=utf-8, not text/plain. ...` |
| dry-run | situatedevals.org | 3 | `robots-verdict: situatedevals.org (NO_TERMS)` | `... is not a read file (status none, error "TypeError: fetch failed"): RFC 9309 §2.3.1.4 reads that as complete disallow` |
| dry-run | mozilladatacollective.com | 3 | `robots-verdict: mozilladatacollective.com (NO_TERMS)` | `no change: robots.txt disallows 4 queued path(s) for MehudakRenderWatch: ...` (כל אחד `"Disallow: /"`) |
| dry-run, ללא `--urls` | nevo.co.il | 3 | `robots-verdict: nevo.co.il (NO_TERMS)` | `no change: robots.txt disallows 8 queued path(s) ...` (8 שורות paused, `"Disallow: /"`) |

- `npx vitest run src/__tests__/revenue/prize-terms-audit.test.ts` לפני שינוי הבדיקה: exit 1, 5 נכשלו מתוך 15 (בדיוק החמש
  שבבריף). אחרי: exit 0, 21 עברו.
- `scripts/verify.sh` על חמשת הקבצים (prize-terms-audit, robots-verdict, queue-zero-test, mutation-plans, frozen-citations):
  exit 0 (typecheck 0, tests 0, 126 עברו) על ה-commit הראשון; ושוב exit 0 על המצב הסופי (127 עברו).
- `scripts/verify.sh` המלא (ברירת מחדל `src/__tests__/revenue`): exit 0 על ה-commit הראשון (79 קבצים, 2569 עברו, 2 skipped);
  ושוב exit 0 על המצב הסופי (79 קבצים, 2570 עברו, 2 skipped).
- מוטציות (`node scripts/mutate.mjs --plan`, `--check` קודם): ריצה 1 ב-`sim-tree` 15/16 נהרגו; ריצה 2 16/16 נהרגו (שינוי
  sha/fetchedAt/ספירה ב-source, checked, אתר שלא נקבע שסומן ביד, source של טיק 45, כל ספירה/היסטוריה/רשימה בכותרות, שורת URL
  שנמחקה, ערכי הטבלה).
- grep שמות על כל הקבצים ב-`git diff --name-only claude/new-session-j071dx`: exit 1 (לא נמצא דבר); גם חיפוש כתובות דואר בשורות
  שנוספו ב-diff: ריק.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **הרצת `robots-verdict.mjs` 21 פעמים בלולאת shell**, ועוד 21 לבדיקת אידמפוטנטיות. מצב `--all-no-terms` (כל אתר NO_TERMS
  exhaustive-negative עם probe פעיל) שמדפיס טבלת סיכום אחת יחסוך את זה.
- **מדידת טבלת ההערה בסקריפט scratch**: אותו סקריפט יכול להדפיס את שורות הטבלה (`--table`), כך שההערה והבדיקה ישתמשו באותו
  פורמט.
- **מפתחות `LIVE_MENTIONS` לכל לכידת robots שהסקריפט מזכיר**: כלל אחד ("source שכתב `robots-verdict.mjs` מזכיר את לכידת ה-robots
  שקרא") עדיף על 39 מפתחות.
- **שאלה פתוחה ל-thread הראשי, לא אוטומציה**: הסקריפט מסרב לשפוט מחדש אתר שכבר NO_TERMS_ROBOTS_OK, ולכן אם הרינדור השבועי
  ישכתב אחת מ-11 לכידות ה-robots (או 404 יהפוך לקובץ), הבדיקה תיכשל ואין כלי שמתקן — צריך מצב `--recheck` או הקפאה של
  הלכידות. בנוסף, `judgeSite` כותב רשומה חדשה רק עם `note` מהישנה: שדה `copying` (fold 2 של שורה 21) יימחק בהגדרה עתידית.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת קובץ הבדיקה כולו (612 שורות) פעמיים: פעם דרך `cat` שנחתך לקובץ, ופעם ב-Read. היה מספיק Read אחד.
- קריאת פסיקת שורה 21 (432 שורות) — נחוצה כדי לוודא שאין סתירה, אבל ההקדמה הארוכה (רשימת "Read") לא הייתה נחוצה.
- קריאת הסורק של `freeze-capture.mjs` כדי להבין למה `frozen-citations` נכשל — נחוצה, אבל הודעת הכישלון עצמה הספיקה כמעט לבד.
- ריצת מוטציות ראשונה ב-`sim-tree` (כ-60 שניות) שהראתה את המוטציה ששרדה — שווה את המחיר.

## Review fixes

סקירת Opus של הענף (f574868) מצאה ארבעה ממצאי "fix" ואף "blocking". כולם טופלו; לפני כן מוזג קצה הבסיס (87bf2bd) לענף
(merge נקי, `--no-ff`), כי הוא כבר מחזיק את העותק הקפוא `robots-nevo-2026-09-30` ואת פסק 6.10 שורה 21 שהתיקונים מצטטים.

1. **fix — הבדיקות נשענו על לכידות robots חיות** (`prize-terms-audit.test.ts`): שכתוב שבועי של לכידה, למשל `robots-flagos`
   שמגיש דף אפליקציה עם שמות קבצים מגובבים, היה מפיל את הסוויטה בלי כלי שמתקן. תיקון: 21 לכידות ה-robots של ריצת 6.10 הוקפאו
   ב-`node scripts/freeze-capture.mjs robots-<x> --why "..."` (17 עם `--allow-flagged`: short, status או js-shell; aicrowd,
   health-data-hub, wundernn ו-theemailgame בלי דגל), כל אחת `robots-<x>-2026-10-06` כפי ש-5f4853a אחסן אותה, בית לבית, בלי
   מיסוך, ו-37 הקבצים נרשמו ב-`research/rendered/FROZEN.sha256` (`sha256sum -c` עובר). 17 ה-source ב-`terms-verdicts.json`
   הוסבו לנתיב העותק הקפוא בסקריפט scratch שמריץ את `judgeSite` של הסקריפט עם `readCapture` שמחזיר את העותק, ובודק שרק הנתיב
   השתנה (verdict, checked, note וסדר המפתחות זהים, הפורמט של `serializeVerdicts` נשמר). 22 שורות הטבלה בהערת הביקורת מצביעות
   על העותקים הקפואים (nevo: `robots-nevo-2026-09-30.txt`). בלוק "tick 54" בבדיקה קורא עכשיו רק עותקים קפואים (`frozenCapture`,
   `expectFrozenCopy`: `frozen.from`, `frozen.commit` 5f4853a, או e839268 ל-nevo, sha256 ו-byteLength של הגוף) ומריץ את
   `judgeSite` עם `readerOf(<עותק>)`. ההדגמה של הסוקר (fetchedAt חדש ב-`robots-flagos.meta.json`) שורדת עכשיו, וכך גם שכתוב גוף
   ה-robots החי של agenthon ו-404 חי של mozilladatacollective: הבדיקה כבר לא תלויה במה שהרינדור השבועי כותב.
2. **fix — 39 רשומות `LIVE_MENTIONS` ב-`frozen-citations.test.ts`** (קובץ מחוץ לרשימת התדריך, ופטור שסותר את ייעוד הרשימה):
   הקובץ הוחזר בדיוק לגרסת הבסיס 87bf2bd, והענף כבר לא משנה אותו. אין צורך בפטור: אף source ואף שורת טבלה לא נוקבים בשם
   לכידה חיה. שאלה ל-thread הראשי: `robots-verdict.mjs` עצמו עדיין כותב נתיב חי, ולכן אם יקבע בעתיד אחד מארבעת האתרים הנותרים
   הבעיה תחזור. כדאי שהסקריפט יקפיא את הלכידה ויצטט את העותק בעצמו.
3. **fix — משפט nevo שגוי בהערת הביקורת** (הטענה ש"טקסטי החוק של nevo ממשיכים להגיע מ-lawsofisrael"): נכתב מחדש. עשר לכידות
   nevo מ-29.9 הן `[robots-bar]` לפי פסק 6.10 שורה 21 (a), החלטה 1. ב-6.10, לפני קיפולי הפסק, `osek-zair.json` עדיין לקח את
   תקרת 2026 מ-`documents.vatLaw`, כלומר מ-`nevo-vat-law-2026-09-29.txt`. החלטה 1(5) מוציאה כל ציטוט nevo מהמוצר דרך קיפולים 3
   ו-4, שלא בוצעו בטיק הזה. הניסוח מתוארך, כדי שלא יהפוך לשקר אחרי קיפול osek-zair. הסוקר כתב "fold 5", אבל בפסק עצמו fold 5
   הוא ה-User-Agent, וההוצאה מהמוצר היא החלטה 1(5) דרך folds 3-4; כתבתי לפי הפסק. בדיקה חדשה דורשת את הניסוח החדש ואוסרת את
   הישן.
4. **fix — שתי הנחות שנחלשו**: (1) בלולאת `RULED_EXHAUSTIVE` הוחלף ה-enum המורחב ב-`toBe(ROBOTS_OK.includes(site) ?
   "NO_TERMS_ROBOTS_OK" : "NO_TERMS")`. (2) `then[site].checked` הוא קבוע של `tick45()` ולכן לא נבדק עוד. הענף נבחר לפי
   `ROBOTS_OK`, ובענף שהסקריפט לא נגע בו נבדק ש-`then[site]` הוא `v[site]` עצמו ושה-`checked` "2026-10-05" נקרא מהקובץ. ה-doc של
   `tick45()` אומר עכשיו שהתאריך שם קבוע, לא קריאה. אף בדיקה לא דולגה ולא נמחקה.

מעבר לממצאי ה-fix טופלו גם שתי הערות: (א) הטענות בפרוזה שלא נבדקו ("Eleven ... six", 2018 ו-99393 בתים, 27 בתים, 20 כתובות
כללים, קובץ k12 הריק) נבדקות ב-`it` חדש, ותשובת הטבלה נבדקת מילה במילה, כולל הכלל שבסוגריים. (ב) ארבעת האתרים שנדחו רצים
בבדיקת האידמפוטנטיות על שלוש הרשימות, לא רק על ה-fixture. נשארו לשיקול ה-thread הראשי, בלי שינוי: קריאת 404 כ"אין כללים"
בשישה אתרים (מועמדת לתור Fable), תוכנית מוטציות לקבצי נתונים (התוכנית נשארה ב-scratch, `tick54/fix-robots/plan.json`), ו-`judgeSite`
שמשמיט שדות כמו `copying`.

**ולידציה.** `scripts/verify.sh` על חמשת הקבצים: exit 0 (130 בדיקות). `scripts/verify.sh` המלא: exit 0 (79 קבצים, 2576 בדיקות עברו, 2 דולגו), ושוב אחרי ה-commit. `scripts/mutate.mjs
--allow-dirty --plan` עם 22 מוטציות: 19 נהרגו ו-3 שרדו. ארבע המוטציות ששרדו בסקירה (הכלל בסוגריים של alignmentforum, 2018→2019,
27→28, Eleven→Twelve) נהרגו. שלוש ששרדו הן הדגמות שבירות שאמורות לשרוד: שכתוב שבועי של לכידה חיה כבר לא מפיל בדיקה. הוחזרו
והורגו גם K1-K6 (קידומת sha256, fetchedAt +1ms, סטטוס 404→410, flagos ביד, checked) ו-N1-N9 החדשות (source או שורה שחוזרים
ללכידה החיה, שינוי בייטים בעותק קפוא, commit אחר ב-frozen, משפט nevo, ספירות בפרוזה).

**שגיאות.** הקפאה ראשונה נעשתה עם נוסח `why` שלא התאים ל-flagos (דף HTML): מחקתי רק את 37 הקבצים החדשים שלא היו במעקב, החזרתי
את `FROZEN.sha256` מ-git, והקפאתי שוב עם נוסח נכון. את נתיבי הטבלה החלפתי ב-`sed` מוגבל לשורות הסעיף, ולא ב-`loop-edit.mjs`:
`repoint-capture` מטפל רק בציטוט לפי שורה (`<live>.<ext>:`). כל 22 הנתיבים נבדקו כקיימים, והבדיקה משווה כל שורה לעותק שלה.
את משפטי הפרוזה ערכתי ב-`loop-edit.mjs replace-in-line`.
