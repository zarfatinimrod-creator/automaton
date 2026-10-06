# טיק 55 (6.10.2026) — agenthon.net ו-eurocontrol.int חוזרים ל-TERMS_PENDING: קישורי תנאים שנמצאו אחרי הפסקים

בונה Opus, ב-worktree נפרד על הענף `build/tick55-terms-links-found` (בסיס: `claude/new-session-j071dx` ב-`364bf71`, ריצת
ה-weekly של 12:05). לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
באף `RULING-*.md`, ב-`research/measurements/ai-allowed-events*`, ב-`scripts/render-watch.mjs` או ב-`scripts/queue-zero-test.mjs`,
ולא באף יומן קיים. לא הורדתי שום דבר מהרשת ולא הפעלתי render. ה-checkout הראשי (`/home/user/automaton`) נשאר על ענפו, נקי.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים), לפי הפסיקה של טיק 54 (§9, "Queued 6.10 (tick 54)" פריט 1):
שני פסקי NO_TERMS נשענו על "אין קישור לתנאים בשום מקום", וההנחה הזאת נפלה:

- **agenthon.net** (NO_TERMS_ROBOTS_OK מאז 6.10): הלכידה של 6.10 של דף הבית מקשרת בכותרת התחתונה ל-`/terms/`, `/privacy/`
  ו-`/licensing/`.
- **eurocontrol.int** (NO_TERMS, exhaustive-negative מאז 6.10): ה-HTML השמור של הודעת הפרטיות מכיל `href="/info/disclaimers"`.

והפסיקה: שני האתרים TERMS_PENDING (checked 2026-10-06), הערה בלי מילת סוג ("terms unread", כמו הערות טיק 45), source שמציין
את הלכידה והשורה שבהן נראה הקישור, copying נשאר "unread"; שורת `terms-` אחת לכל אתר ב-`urls.txt` עם שורת ZERO-TESTS
(`terms-agenthon`, `terms-eurocontrol-disclaimers`, plain, פעם אחת); בדיקת ה-robots של eurocontrol מושהית עם סיבה שאומרת
שהאתר חזר ל-TERMS_PENDING ושהבדיקה ממתינה לקריאת התנאים; שום `robots-verdict` לא רץ לאף אחד מהם. agenthon הוא ההיפוך הראשון של
פסק robots: הסקריפט לא משתנה, אבל הערת הביקורת צריכה לתעד זאת, והבדיקות שמקבעות 17 אתרים ו-20 שורות מתארות עכשיו 16 ו-19,
עם מספרי טיק 54 כהיסטוריה. בנוסף: הקפאת הלכידה של agenthon (`scripts/freeze-capture.mjs`) לפני ציטוט שורה ממנה, סעיף חדש
בהערת הביקורת עם טבלה של שתי שורות, עדכון קבוצות הרינדור, בדיקות, `verify.sh` ממוקד ומלא, grep שמות, commit, ויומן זה.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree בדיוק כפי שנכתב; `git log --oneline -1` הראה `364bf71`, ו-`products/` ו-`src/revenue/` קיימים (לא היה
   צורך ב-reset). קישרתי `node_modules`.
2. קראתי את הכותרת של `scripts/queue-zero-test.mjs` (והקוד כולו), את יומן טיק 45 (בחיפוש), את הפסיקה של 6.10 (3(1) וה-folds),
   את `urls-pause-comments.mjs`, `loop-edit.mjs`, `freeze-capture.mjs` ו-`robots-verdict.mjs` (`serializeVerdicts`, `judgeSite`),
   ואת `prize-terms-audit.test.ts` כולו (2,218 שורות).
3. **הבסיס היה אדום.** הרצתי את ששת קבצי הבדיקה ואת `verify.sh` המלא על הבסיס (ב-`sim-tree.sh`): שתי בדיקות נכשלו, שתיהן
   בגלל ריצת 12:05 (`364bf71`): ספירת קבוצות הרינדור (הבדיקה של eurocontrol נלכדה, ולכן עברה מ"queued" ל-"captured"),
   ו-`frozen-citations` שהשוותה את שורה 303 של העותק השמור של btl לשורה 303 של הלכידה החיה, שנכתבה מחדש.
4. **הקפאה:** `node scripts/freeze-capture.mjs prize-www-agenthon-net-ref-mlcontests-7f4f65c9 --why "..."` יצר
   `prize-www-agenthon-net-ref-mlcontests-7f4f65c9-2026-10-06.{meta.json,txt,html}` (commit המקור `007f7f0`) ושלוש שורות
   ב-`FROZEN.sha256`. הקישור עצמו: `.html:2582` (`<a href="/terms/">Terms</a>`), Privacy ב-:2583, Licensing ב-:2584, Rules
   ב-:2581; העוגנים ב-`.txt:1951-1953`. של eurocontrol: `terms-eurocontrol-2026-10-06.html:1961` ו-:2830, והפריט ב-`.txt:433`.
5. **פסקים** — סקריפט node משלי (בתיקיית ה-scratch, לא ב-repo) שמייבא את `serializeVerdicts`, בודק שהקובץ בפורמט שלו לפני
   הכתיבה, ובודק שהשניים במצב שטיק 54 השאיר. שני האתרים: TERMS_PENDING, `checked` 2026-10-06, source שמתחיל ב-URL של התנאים,
   ממשיך ב-"link observed in a capture: ..." עם העותק השמור והשורה, ושומר את ה-source הקודם אחרי
   `; NO_TERMS_ROBOTS_OK before: ` (agenthon) או `; NO_TERMS before: ` (eurocontrol). ההערות פותחות ב-"terms unread:" ואומרות
   שהדף בתור (שורות ZERO-TESTS 266/267), שהבדיקה מושהית (247/265), ש-`robots-verdict.mjs` לא ירוץ לפני הקריאה, ומצטטות את
   שורות הכללים מוצמדות (`@548be52:173` ו-`:162`). copying נשאר "unread". בהערה של ansperformance.eu שיניתי סוגריים אחד
   שקרא לרשומה של eurocontrol "NO_TERMS since 6.10".
6. **תור:** `queue-zero-test.mjs` (dry-run ואז אמיתי) הוסיף את שורות 266 (`https://www.agenthon.net/terms/`) ו-267
   (`https://www.eurocontrol.int/info/disclaimers`) ואת שתי שורות ה-`urls.txt` בצורת ההערה של שורות ה-terms של טיק 45.
7. **השהיה:** `queue-zero-test.mjs --apply-verdicts --dry-run` אמר "would pause 2 line(s): robots-agenthon,
   robots-eurocontrol"; הרצתי אותו באמת, ואז `urls-pause-comments.mjs --fix --today 6.10.2026`, ששכתב את מילת הפסק בשורת
   הפרטיות המושהית של eurocontrol (NO_TERMS → TERMS_PENDING). את הסיבה בשתי שורות הבדיקה ניסחתי מחדש ביד (ראו סעיף 4).
   סימנתי ב-ZERO-TESTS את שורות 247 ו-265 ב-`**PAUSED 6.10 (tick 55): ...**` דרך `loop-edit.mjs set-cell --append`.
8. **הערת הביקורת** (רק דרך `loop-edit.mjs`): קבוצה רביעית חדשה, "Terms link found after the verdict" (2 URLs, 2 אתרים);
   "Now, on robots.txt" ירדה ל-19/16 עם היסטוריית 20/17; שורת ה-URL של agenthon הפכה לשורת "(Left this list ...)";
   "Robots probe queued" ירדה ל-0/0 עם היסטוריה; שורת ה-Total ושלוש שורות ההיסטוריה קיבלו 0 לקבוצה החדשה; שורת היסטוריה
   חדשה למצב של סוף טיק 54; ובסוף הקובץ הסעיף "## Terms links found after the verdicts (6.10.2026, tick 55)" עם הטבלה של
   שתי השורות ושלוש פסקאות (ההיפוך הראשון של פסק robots; eurocontrol; שורות ושורות-ZERO-TESTS).
9. **בדיקות:** ב-`prize-terms-audit.test.ts` — fixture של שתי רשומות טיק 54 (`fixtures/terms-verdicts-364bf71-links-found.json`,
   sha256 מוצמד, ומושווה ל-`git show 364bf71:...` כשהקומיט קיים) ופונקציה `tick54()` שמחזירה אותן; `termsReadBefore`,
   `jsReadBefore` ו-`tick45` עוברות דרכה, כך שכל בלוק קודם בודק את מה שבדק. `ROBOTS_OK_TICK54` (17) ו-`ROBOTS_OK` (16).
   הקבוצה הרביעית ב-`RENDER_GROUPS`, מבחן הספירות קורא חמישה מצבים. describe חדש "tick 55" עם 7 בדיקות.
   ב-`frozen-citations.test.ts` — שורה 303 של העותק השמור של btl מוחזקת למילים שלה ולא ללכידה החיה.
10. מוטציות נתונים: 18 מוטציות (תוכנית scratch) בתוך `sim-tree.sh`, 18 נהרגו.
11. commit `7439a31` עם שני ה-trailers.

## 3. קבצים/מערכות ששונו

- `research/channel-loop/terms-verdicts.json` — agenthon.net, eurocontrol.int (פסק, source, note), וסוגריים אחד בהערה של
  ansperformance.eu.
- `research/rendered/urls.txt` — שתי שורות terms- חדשות עם ההערות שלהן; שתי בדיקות robots מושהות; מילת הפסק בשורת הפרטיות
  המושהית של eurocontrol.
- `research/channel-loop/ZERO-TESTS.md` — שורות 266, 267 חדשות; סימון PAUSED בשורות 247, 265.
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — קבוצות הרינדור, שורות הסיכום וההיסטוריה, הסעיף החדש.
- `research/rendered/prize-www-agenthon-net-ref-mlcontests-7f4f65c9-2026-10-06.{html,txt,meta.json}` (חדשים) ו-`FROZEN.sha256`.
- `src/__tests__/revenue/prize-terms-audit.test.ts`, `src/__tests__/revenue/frozen-citations.test.ts`.
- `src/__tests__/revenue/fixtures/terms-verdicts-364bf71-links-found.json` (חדש).
- יומן זה.
- לא שונה: שום סקריפט (גם לא `robots-verdict.mjs`), `ai-allowed-events.urls.txt` (השורה של agenthon, :41 ברשימה החיה,
  נדחית אוטומטית על ידי השער), הלכידה `robots-eurocontrol` (נשארה על הדיסק, לא נשפטה).

## 4. החלטות והנחות משמעותיות

- **השהיתי גם את בדיקת ה-robots של agenthon**, לא רק של eurocontrol כפי שהבריף ניסח. כשהאתר TERMS_PENDING, השער פוסל כל שורה
  שלו מלבד דף התנאים, ו-`--apply-verdicts --dry-run` הציע להשהות את שתיהן. שורה פעילה שנכשלת בשער סותרת את הכלל "a TERMS_PENDING
  site gets its terms page and nothing else", והבדיקה `applyVerdicts(...).paused` הייתה נכשלת. שתי השורות מושהות באותה סיבה.
- **הסיבה בשורות ההשהיה נכתבה ביד.** `--apply-verdicts` כותב `# paused (terms unread): ...`, ואף סקריפט לא כותב סיבה מותאמת.
  לכן החלפתי בשתי השורות רק את הסיבה (`terms unread: TERMS_PENDING again since a terms link was found after the verdict, the
  probe waits on the terms reading, 6.10.2026`), בצורה ש-`urls-pause-comments.mjs` שומר כמו שנכתבה ושה-PAUSED_LINE קורא. URL,
  slug וטאב לא השתנו. `--check` החזיר 0.
- **fixture לשתי רשומות טיק 54.** ההערות החדשות לא שומרות את ההערות הקודמות (של eurocontrol לבדה היא כ-2,900 תווים), ובדיקות
  טיק 54 צריכות אותן מילה במילה (`judgeSite` משחזר את הרשומה של agenthon בשוויון מלא; ה-SECONDARY וה-DECISIVE של eurocontrol
  מצטטים מההערה). זה הדפוס של ה-fixture של רשימת הפרסים ב-548be52: sha256 מוצמד, והשוואה לקומיט כשהוא קיים. ה-source החדש
  שומר בכל זאת את ה-source הקודם אחרי המפריד, כמו בכל היפוך קודם, והבדיקה מוודאת שהוא זהה ל-fixture.
- **קבוצה רביעית ולא שינוי שם של קבוצת ה-shell.** "Terms page a shell" לא מתאר את שני האתרים. הפרדיקט: TERMS_PENDING שה-source
  שלו שומר פסק קודם (`; NO_TERMS before: ` או `; NO_TERMS_ROBOTS_OK before: `). בכל מצב היסטורי אין רשומה כזאת, ולכן שורות
  ההיסטוריה קיבלו 0 במקום הרביעי (נכתב בהערה במשפט אחד).
- **מצב הבדיקה של eurocontrol בהיסטוריה.** במצבים שלפני טיק 55 הבדיקה נקראת כ-"queued", כפי שהייתה בסוף טיק 54 וכפי שהשורות
  בהערה אומרות; את הלכידה עשתה ריצת 12:05 אחרי טיק 54. מפת הבדיקות כוללת עכשיו גם שורות מושהות.
- **ציטוט העותק השמור בהערת `urls.txt`.** ההערה של שורת Disclaimers מצטטת `research/rendered/terms-eurocontrol-2026-10-06.html:1961`,
  ובדיקת DECISIVE בדקה ש-`urls.txt` לא מכיל את שם העותק כמחרוזת. שיניתי אותה ל-`listedNames` של `freeze-capture.mjs`, הכלל של
  הסקריפט עצמו (אף מילה בשורה אינה ה-slug): נתיב בציטוט אינו slug ש-render יכתוב.
- **בלי שמות slug חדשים בטבלת הערת הביקורת.** `frozen-citations` מתייחס ל-slug בתוך backticks כציטוט של לכידה, ולשורות
  החדשות אין עדיין לכידה. הסרתי את ה-slugs מהטבלה, כדי לא להוסיף שתי רשומות LIVE_MENTIONS בלי צורך.
- **ההערה של ansperformance.eu** קראה לרשומה של eurocontrol "NO_TERMS since 6.10", וזה כבר לא נכון. שיניתי רק את הסוגריים האלה.
- **תיקון ה-base-red של btl** (מחוץ לבריף, אבל `verify.sh` המלא חייב לצאת 0): הבדיקה השוותה עותק שמור ללכידה חיה, וזה בדיוק מה
  שה-render מותר לשבור. עכשיו היא בודקת שבשורה 303 של העותק השמור נמצא סעיף ההעתקה שההערה של btl מצטטת. שורת `terms-btl` עדיין
  פעילה ב-`urls.txt`: fold 8 נדחה על ידי ה-thread הראשי, ולא נגעתי בזה.
- **"rendered grade"** בהערות `urls.txt`. בטיק 45 נכתב "github grade" למקור ב-GitHub, וכאן המקור הוא לכידה.
- **שורת הפרטיות של eurocontrol** (`terms-eurocontrol`) עוברת עכשיו בשער, כי היא שורת terms- של אתר TERMS_PENDING.
  `urls-pause-comments` מציג אותה ברשימת "would pass the terms gate today". היא נשארת מושהית כנקראה, וההערה של האתר אומרת זאת.
- המשפט בסעיף של טיק 54, "adaptionlabs.ai is the one prize-event site still TERMS_PENDING", נשאר כהיסטוריה. הסעיף החדש מתקן
  אותו: עכשיו יש שלושה.

## 5. שגיאות וניסיונות שנכשלו

- `loop-edit.mjs replace-in-line` עם `--old` שמתחיל ב-"-" נדחה (צריך `--old=...`), כמו שתועד בטיק 45; חזרתי על אותה טעות.
  בגלל `set -e` בתוך פונקציית shell, הלולאה המשיכה. הקובץ לא נפגע, כי loop-edit לא כותב כשהוא מסרב.
- הגרסה הראשונה של טבלת הסעיף החדש כללה את `terms-agenthon` ו-`terms-eurocontrol-disclaimers` בתוך backticks, ושתי בדיקות
  ב-`frozen-citations` נכשלו ("no capture ... on disk"). הסרתי אותם.
- הגרסה הראשונה של תוכנית המוטציות נכתבה ב-`node -e` בתוך מחרוזת shell עם גרש ונשברה. כתבתי אותה מקובץ heredoc.
  מוטציה אחת (T55-6) לא נמצאה בבדיקה המוקדמת, כי ה-source הקודם של eurocontrol מתחיל בנתיב הלכידה ולא ב-URL. תיקנתי.

## 6. בדיקות ופעולות ולידציה

כל התוצאות לפי exit code:

| פקודה | exit | הערה |
| --- | --- | --- |
| ששת קבצי הבדיקה על הבסיס `364bf71` | 1 | 2 נכשלו (ספירת הקבוצות; btl :303), שתיהן מריצת 12:05 |
| `scripts/verify.sh` מלא על הבסיס (ב-sim-tree) | 1 | 79 קבצים: 2 נכשלו, 2637 עברו, 2 דולגו |
| ששת הקבצים אחרי שינוי הנתונים ולפני הבדיקות | 1 | 25 נכשלו (מה שהבדיקות הישנות קיבעו) |
| `node scripts/urls-pause-comments.mjs --check --today 6.10.2026` | 0 | 0 stale |
| `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run` (אחרי) | 0 | would pause 0 line(s) |
| `scripts/verify.sh` על prize-terms-audit, queue-zero-test, robots-verdict, frozen-citations, urls-pause-comments, render-watch-robots | 0 | typecheck 0; 6 קבצים, 240 בדיקות |
| `node scripts/freeze-capture.mjs --cited` | 0 | 0 לשיוך מחדש, אין שינוי |
| `node scripts/prize-dispatch.mjs --skip-captured --why 2>&1 \| grep -E 'agenthon\|eurocontrol'` | 0 (הסקריפט) | שתי שורות `fail ... is TERMS_PENDING` |
| `scripts/verify.sh` מלא על `7439a31` (ב-sim-tree) | 0 | 79 קבצים, 2646 עברו, 2 דולגו |
| `node scripts/mutate.mjs --plan <scratch>/t55-data-mutations.json` ב-sim-tree | 0 | 18 הופעלו, 18 נהרגו, 0 שרדו (1:39 דקות) |
| `git grep` של שם הבעלים על הקבצים שהשתנו | 1 | לא נמצא דבר |

שורות הסירוב של prize-dispatch:
- `fail  agenthon.net  1: agenthon.net is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))`
- `fail  eurocontrol.int  1: eurocontrol.int is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))`

המוטציות (על קבצי הנתונים, לא על סקריפטים): השבתת שורת ה-terms של agenthon, השארת הבדיקה של eurocontrol פעילה, סיבת השהיה
אחרת, דגל js, מילת סוג בהערה, הסרת המפריד מה-source, שינוי ב-source הקודם השמור, URL אחר ב-source, הסוגריים של
ansperformance, מספר שורה שגוי בהערה, שורת ה-Total, שורת ההיסטוריה החדשה, ספירת השער בסעיף, agenthon חוזר לרשימת קבוצת
ה-robots, סימון PAUSED בשורה 247, הקישור בעותק השמור, ה-fixture, וסעיף ההעתקה של btl. כולן נהרגו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **פתיחה מחדש של פסק** (TERMS_PENDING בגלל קישור שנמצא): כתיבת הרשומה עם המפריד, שורת terms- עם שורת ZERO-TESTS, השהיית
  הבדיקה עם סיבה וסימון השורה ב-ZERO-TESTS, ארבעה כלים ושני תיקונים ביד. כדאי לבנות `scripts/reopen-verdict.mjs <site> --terms-url
  <url> --observed <frozen file:line>`, שעושה את כל זה דרך `serializeVerdicts`, `queueZeroTest` ו-`applyVerdicts`.
- **סיבת השהיה מותאמת:** `queue-zero-test.mjs --apply-verdicts --reason "<text>"` היה חוסך את שתי עריכות היד ב-`urls.txt`.
- **מחיקת שורה ב-loop-edit:** שורת ה-URL של agenthon הפכה לשורת "(Left this list ...)", כי אין `delete-line`. אותו חוסר
  תועד כבר בטיק 45.
- **היסטוריית המצבים בבדיקה:** כל טיק מוסיף פונקציה (`tick45`, `termsReadBefore`, `jsReadBefore`, `tick54`) ומערך ספירות.
  תצלום של `terms-verdicts.json` לכל טיק (fixtures לפי קומיט), עם רשימת מצבים אחת שמבחן הספירות עובר עליה, היה מקצר את זה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `prize-terms-audit.test.ts` כולו (2,218 שורות): הכבד ביותר, אבל נחוץ, כי כמעט כל בלוק בו נגע באחד משני האתרים.
- קריאת `queue-zero-test.mjs` כולו (854 שורות), כשהכותרת ו-`termsGate` הספיקו לרוב.
- הרצת הבדיקות על הבסיס ו-`verify.sh` המלא על הבסיס (רקע, כ-10 דקות): לא בזבוז. כך ידעתי ששתי הכשלות קדמו לעבודה שלי.
- שני תיקונים שנבעו מטעויות (`--old=` ו-slugs בטבלה), ותוכנית המוטציות שנכתבה פעמיים.

## Review fixes

**מה התבקש.** לטפל בכל ממצא "fix" של הסקירה (לא היו ממצאי "blocking"), להריץ שוב את `scripts/verify.sh` על ששת קובצי הבדיקה
ואת `scripts/verify.sh` המלא (שניהם exit 0), להריץ שוב את המוטציות ששרדו (כולן חייבות להיהרג), ולבצע commit עם ה-trailers.
`origin/claude/new-session-j071dx` לא זז (עדיין `364bf71`, אב קדמון של הענף), ולכן לא היה מה למזג.

**שלושת ממצאי ה-fix:**

1. **בדיקה שנשברת מכל שינוי לא קשור.** הבדיקה "keeps the two tick-54 entries as a fixture" השוותה כל רשומה אחרת של
   `terms-verdicts.json`, ואת קבוצת האתרים כולה, ל-`364bf71`, ורק כשהקומיט זמין. עכשיו היא בודקת רק את שתי הרשומות
   שנפתחו מחדש מול ה-fixture (ומול `364bf71` כשהוא זמין), ואת הסוגריים של ansperformance.eu בלבד: `ANS_NOW` מופיע פעם אחת,
   `ANS_TICK54` נעלם, ובבסיס `ANS_TICK54` הופיע פעם אחת ו-`ANS_NOW` לא הופיע. אלה עובדות על `364bf71` שקומיט מאוחר לא משנה.
   הצמדת "השורה האחרונה ב-ZERO-TESTS היא 267" הכפולה (בבדיקת התור של טיק 55) הוחלפה: השורות שה-candidate שלהן הוא
   "terms audit (tick 55): " הן בדיוק 266 ו-267. ההצמדה הישנה של טיק 54 (`last`) נשארה כפי שהייתה.
2. **ציטוטי שורות משניים שאף בדיקה לא החזיקה.** נוספה בדיקה "ties every line, row, fetch time and commit the tick-55 texts
   cite". היא מחלצת כל ציטוט `research/rendered/<file>:N` או `:N-M`, וכל `:N` חשוף אחרי רווח או "(" (ביחס לקובץ האחרון
   שנזכר לפניו), משמונה טקסטים: שני המקורות עד המפריד, שתי ההערות, שתי הערות ה-terms- ב-`urls.txt`, ושתי שורות הטבלה.
   בנוסף היא מחלצת מהפרוזה של סעיף טיק 55. כל שורה מצוטטת (טווח: כל שורה בו) חייבת להיות שורה ש-`LINKS_FOUND.observed`
   מונה, עם המילים שהיא מחזיקה. כל שורה ברשימה חייבת להיות מצוטטת במקום כלשהו. לרשימה נוספו שתי שורות שהטקסטים מצטטים
   ולא היו בה: agenthon `.txt:1952` (Privacy, בתוך הטווח 1951-1953) ו-eurocontrol `.txt:367` ("Website Privacy Policy").
   כל `row N` / `rows N and M` / `row-N` מצוטט חייב להיות שורת ZERO-TESTS של אותו אתר. זה לא חל על "ruling 6.10 row 21".
   ה-URL, `fetchedAt` והקומיט שכל מקור מצהיר עליהם, והזמן והקומיט בתא הטבלה, חייבים להיות אלה שב-meta של העותק הקפוא.
   שורת ה-privacy-notice היא 242, השורה של `terms-eurocontrol`.
3. **סעיפי טיק 54 שעדיין טענו "עכשיו" דבר לא נכון.** בכל מקום כזה הוצב הערך הנוכחי, ולידו ערך טיק 54 בסוגריים מתוארכות,
   בצורה של רשימת קבוצות הרינדור. השינויים נעשו דרך `node scripts/loop-edit.mjs replace-in-line`. לא השתמשתי ב-`set-cell`
   כי `` `agenthon.net` `` ו-`` `eurocontrol.int` `` הם מפתח שורה בשתי טבלאות, והפקודה מסרבת למפתח כפול:
   - "Robots verdicts", עמודת "Verdict now" של agenthon.net: `TERMS_PENDING (6.10, tick 54: NO_TERMS_ROBOTS_OK, until tick 55
     found a terms link in its footer, "Terms links found after the verdicts" below)`.
   - המשפט "The 17 sites' 20 rules URLs pass `termsGate` now" נכתב מחדש: "The rules URLs of the sites that hold
     NO_TERMS_ROBOTS_OK, 19 on 16 sites, pass `termsGate` now (6.10, tick 54: the 17 sites' 20, until agenthon.net went back
     to TERMS_PENDING in tick 55, ...)".
   - "Terms read", eurocontrol.int: בתא "Lines now" מופיעים שורת ה-Disclaimers (row 267), ה-probe המושהה (row 265) ו-URL
     החוקים שנדחה. ערך טיק 54 נמצא בסוגריים. לשאלה הפתוחה נוספה "(answered 6.10, tick 55: it is read first, ...)".
   - פרוזת סעיף טיק 55 ("stays as tick 54 left it") עודכנה כך שתתאר את זה.
   - הבדיקות של טיק 54 עודכנו: ה-regex של הטבלה מקבל את הסוגריים. הפסיק משווה ל-`verdicts()`, וההיסטוריה משווה ל-`tick54()`,
     רק לאתר של `LINKS_FOUND`. משפט הספירה ותא "Lines now" מוצמדים במלואם.

**הערות (notes) שטופלו כי היו זולות:**
- ZERO-TESTS שורה 247: הנוסח הוא עכשיו "the robots verdict scripts/robots-verdict.mjs set from this probe's capture is
  reversed", כי ה-probe לא נתן את הפסיק.
- ZERO-TESTS שורה 242: נוסף אחרי סימן ה-READ סימן מתוארך "**6.10 (tick 55): ... queued as row 267 ...**", ו-regex ה-READ של
  טיק 54 עדיין מתקיים.
- הכותרת "Now, on robots.txt (6.10, tick 54)" היא עכשיו "(6.10, ticks 54 and 55)".
- ההערה של eurocontrol.int ופרוזת סעיף טיק 55 כבר לא מכריעות מראש מה יקרה אם ה-Disclaimers ריק. הן אומרות שזו החלטה של
  ה-main thread. ההערה נכתבה דרך סקריפט node שמייבא `serializeVerdicts`. הסקריפט בדק תחילה שהקובץ עובר round-trip בייט
  לבייט, ושינה משפט אחד שמופיע פעם אחת בדיוק.

**הערות שלא טופלו, ל-main thread:**
- הערות התור של שורות 247 ו-265 ב-`urls.txt` ("exhaustive-negative NO_TERMS site; the probe scripts/robots-verdict.mjs reads")
  לא שונו. אין סקריפט שכותב משפט "Paused ..." כזה, ואין היום שורה שכנה בצורה הזו. התקדים (3dc6a6b) קיים רק בהיסטוריה.
  המצב הנוכחי כתוב בשורות ה-`# paused` ובסימני ה-PAUSED של ZERO-TESTS.
- `research/measurements/ai-allowed-events.md:42` מצטט את לכידת agenthon החיה לפי שורה, תחת פסיק שבוטל. הקובץ מחוץ להיקף.
- העותק הקפוא של agenthon הוא עותק מלא נוסף של דף שתנאיו לא נקראו (החלטה 4 של ruling 6.10 row 21 תחול עליו אם התנאים
  יאסרו העתקה).
- תא "Lines now" של kaggle.com ב-"Terms read" ("stays on the weekly watch") שגוי מאז רינדור ה-js של טיק 54, ולא בגלל טיק 55.
  לא נגעתי בו.
- מגבלה ידועה של הבדיקה החדשה: היא לא תופסת החלפה בין שתי שורות שנמצאות ברשימה בתוך אותו טקסט (למשל :2583 ו-:2584).

**שגיאות.** `loop-edit.mjs` דחה `--anchor '- **Now, ...'` (ערך שמתחיל ב-"-"). תוקן בצורת `--anchor=...`, כפי שכותרת
הסקריפט אומרת.

**בדיקות.**
- `scripts/verify.sh` על ששת הקבצים: exit 0 (typecheck exit 0; 6 קבצים, 241 בדיקות).
- `scripts/verify.sh` המלא: exit 0 (typecheck exit 0; 79 קבצים, 2647 עברו ו-2 דולגו), ב-worktree עצמו.
- `urls-pause-comments.mjs --check`: exit 0. `freeze-capture.mjs --cited`: exit 0 ושום קובץ לא השתנה.
  `queue-zero-test.mjs --apply-verdicts --dry-run`: "would pause 0 line(s)".
- מוטציות (`node scripts/mutate.mjs --plan`, 25 מוטציות על נתונים בלבד; התוכנית בתיקיית ה-scratch שלי, כי אף סקריפט
  לא השתנה):
  - 24 נהרגו.
  - כל 11 השורדות של הסקירה נהרגו עכשיו: ‎:433→:443, ‎:2830→:2831 (מקור, הערת urls.txt, טבלה), ‎1951-1953→1952-1954,
    ‎2582-2584→2583-2585, ‎Licensing :2584→:2585, ‎row 242→243, ‎fetchedAt, ‎007f7f0→007f7f1 (מקור וטבלה).
  - 13 מוטציות חדשות נהרגו: פסיק "Verdict now", הסוגריים, משפט הספירה, "Lines now", מצביע שורה 242, נוסח 247, ההכרעה
    המוקדמת, קומיט המקור של eurocontrol, row 265→264 ו-:2581→:2580 בפרוזה, Licensing בטבלה, סוגרי ansperformance,
    והתשובה לשאלה הפתוחה.
  - שרדה אחת, בכוונה: בדיקת השבירות (עריכה לא קשורה בהערה של un.org) עוברת עכשיו ב-worktree, שבו `364bf71` זמין.
- grep השמות: exit 1, בלי פלט.

**אסימונים.** קריאת בלוקי הבדיקה הארוכים (טיק 54 וטיק 55) כדי למצוא איזה טקסט מוצמד. ריצת ה-verify המלא ברקע (כ-10 דקות).
