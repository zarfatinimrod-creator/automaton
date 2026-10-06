# טיק 56 (6.10.2026) — קריאת התנאים השנייה: agenthon.net נשאר TERMS_PENDING, eurocontrol.int חוזר ל-NO_TERMS, exhaustive-negative

בונה Opus, ב-worktree נפרד על הענף `build/tick56-terms-read` (בסיס: `claude/new-session-j071dx` ב-`4f3527d`, ה-commit של
ה-render dispatch של טיק 56, שבו נמצאות שתי הלכידות). לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`,
`logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, באף `RULING-*.md`, ב-`research/measurements/*`, ב-`scripts/render-watch.mjs`,
`scripts/queue-zero-test.mjs` או `scripts/freeze-capture.mjs`, ולא באף יומן קיים. לא הורדתי שום דבר מהרשת ולא הפעלתי render.
ה-checkout הראשי (`/home/user/automaton`) נשאר על ענפו; לא הרצתי בו שום פקודה מלבד `git fetch` ו-`git worktree add`.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים) לבצע את הפסיקות שלו (6.10, טיק 56) על שתי הקריאות של טיק 56
(קורא Opus אחד ומאמת אדברסרי Opus אחד לכל אתר; הפלט המלא ב-`tick56-main/terms-reading.json` בתיקיית ה-scratch):

- **agenthon.net**: דף התנאים (`https://www.agenthon.net/terms/`) הוא "Terms of Participation" של Agenthon 2026 (גרסה
  2026-08-17, AH26-POL-02), הסכם בין משתתף למארגנים בתוך סט של ארבעה מסמכים, ולא תנאי שימוש באתר. האתר נשאר TERMS_PENDING
  (לא exhaustive-negative: שני מסמכים מקושרים לא נקראו, ו-Data & Software Licensing Policy הוא המסמך היחיד שנשאר שעשוי לחול על
  שימוש חוזר); copying נשאר "unread". הערה חדשה; שתי שורות terms- חדשות עם שורות ZERO-TESTS (`terms-agenthon-licensing`,
  `terms-agenthon-privacy`) שמצטטות את העותק הקפוא; השהיית שורת `terms-agenthon` כנקראה; בדיקת ה-robots נשארת מושהית; שורה 266
  ב-ZERO-TESTS מסומנת READ 6.10; הקפאת `terms-agenthon` לפני ציטוט.
- **eurocontrol.int**: דף ה-Disclaimers הוא הסתייגות על ייעודי מפות ומידע על מע"מ לספקים, בלי שום תנאי שימוש באתר. פסק:
  NO_TERMS, הערה שנפתחת ב-"exhaustive-negative:" (מבחן R1 מתקיים: החיפוש המתועד ושני המסמכים המקושרים נקראו), copying "unread",
  checked 2026-10-06. בדיקת ה-robots (שורה 265) חוזרת להיות פעילה בצורה שהייתה לה לפני טיק 55; `scripts/robots-verdict.mjs`
  מורץ יבש בלבד, והתוצאה מדווחת ל-thread הראשי; שורת `terms-eurocontrol-disclaimers` מושהית כנקראה; שורה 267 מסומנת READ 6.10;
  הקפאה לפני ציטוט.
- **הערת הביקורת**: סעיף חדש "Terms read, second round (6.10.2026, tick 56)" עם טבלה של שתי שורות ועם נקודות המאמת;
  עדכון קבוצות הרינדור, עם המספרים הקודמים כשורות היסטוריה.
- **בדיקות**: `prize-terms-audit.test.ts` (כולל שינוי הכלל "שורת terms- אחת לכל אתר TERMS_PENDING", מנוסח בהערה),
  `frozen-citations`, `urls-pause-comments --check` exit 0, ו-`prize-dispatch --skip-captured --why` שמסרב ל-agenthon
  כ-TERMS_PENDING ול-eurocontrol כ-NO_TERMS.
- סדר A-I, `verify.sh` ממוקד ומלא, grep שמות, commit עם ה-trailers, ויומן זה.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree כפי שנכתב; `git log --oneline -1` הראה `4f3527d`, ו-`products/` ו-`src/revenue/` קיימים. קישרתי
   `node_modules`.
2. קראתי את יומן טיק 55, את שתי הקריאות ב-`terms-reading.json` (קורא ומאמת לכל אתר), את שורות הלכידות שהן מצטטות, את הכותרות
   של `queue-zero-test.mjs`, `urls-pause-comments.mjs`, `freeze-capture.mjs`, `robots-verdict.mjs`, `loop-edit.mjs` ו-`mutate.mjs`,
   ואת חלקי `prize-terms-audit.test.ts` שנוגעים בשני האתרים.
3. **בסיס ירוק**: חמשת קבצי הבדיקה על הבסיס (עם העותקים הקפואים): exit 0, 170 בדיקות.
4. **A, הקפאה**: `terms-agenthon` → `terms-agenthon-2026-10-06` ו-`terms-eurocontrol-disclaimers` →
   `terms-eurocontrol-disclaimers-2026-10-06` (שניהם כפי ש-`4f3527d` שמר אותם; זהים בייט לבייט ללכידה, נבדק ב-`cmp`). בהמשך
   הקפאתי גם את `robots-eurocontrol` → `robots-eurocontrol-2026-10-06` (כפי ש-`364bf71` שמר אותו; סעיף 4).
5. **B, פסקים**: סקריפט node משלי בתיקיית ה-scratch (`set-verdicts.mjs`) שמייבא `serializeVerdicts`, בודק round-trip בייט
   לבייט ואת המצב שטיק 55 השאיר, כותב את ה-fixture `terms-verdicts-4f3527d-terms-read.json` (שתי רשומות טיק 55, זהות ל-`git show
   4f3527d`), את שתי הרשומות החדשות ואת הסוגריים של ansperformance.eu. אחר כך סקריפט שני (`fix-note.mjs`, אותו דפוס) ניסח מחדש
   ביטוי אחד בהערה של agenthon (סעיף 5).
   - agenthon.net: TERMS_PENDING; source שמתחיל בשני ה-URL שלא נקראו, איפה הקישורים נצפו (`...7f4f65c9-2026-10-06.html:2583-2584`
     ו-`terms-agenthon-2026-10-06.html:337-338`), את דף התנאים שנקרא על העותק הקפוא, ושומר את ה-source של טיק 55 אחרי
     `; TERMS_PENDING before: `. ההערה נפתחת ב-"terms unread:" (אין מילת סוג: שום תנאי אתר שלו לא נקרא).
   - eurocontrol.int: NO_TERMS; source שמתחיל בעותק הקפוא של ה-Disclaimers, ושומר את ה-source של טיק 55 אחרי
     `; TERMS_PENDING before: `; הערה שנפתחת ב-"exhaustive-negative: ruling R1's test is met (main thread, tick 56)".
6. **C, `urls.txt`**: `queue-zero-test.mjs` (dry-run ואז אמיתי) הוסיף את שורות 268 (`https://www.agenthon.net/licensing/`) ו-269
   (`https://www.agenthon.net/privacy/`) עם ההערה בצורת שורות טיק 55. `--apply-verdicts --dry-run` אמר "would pause 1 line(s):
   terms-eurocontrol-disclaimers" (הצפוי: שורת terms- של אתר NO_TERMS נכשלת בשער), והרצתי אותו באמת. שלוש עריכות של שורה אחת
   ביד, דרך סקריפט scratch (`urls-lines.mjs`) שבודק שכל שורה ישנה מופיעה פעם אחת בדיוק ושה-URL וה-slug לא משתנים: הסיבה בשורת
   ה-Disclaimers, השהיית `terms-agenthon` כנקראה, וביטול ההשהיה של `robots-eurocontrol` לצורה שלפני טיק 55. אחר כך
   `urls-pause-comments.mjs --fix --today 6.10.2026` שכתב את מילת הפסק בשורת הפרטיות המושהית (`terms-eurocontrol`) מ-TERMS_PENDING
   ל-NO_TERMS; `--check` exit 0; `--apply-verdicts --dry-run` אמר "would pause 0 line(s)".
7. **D, ZERO-TESTS** (רק `loop-edit.mjs set-cell --append`): 266 ו-267 `**READ 6.10 (tick 56): ...**` (בצורת טיק 54), 265
   `**ACTIVE again 6.10 (tick 56): ...**`, ו-242 ו-247 קיבלו סימן מתוארך של טיק 56.
8. **E, הערת הביקורת** (רק `loop-edit.mjs`): הקבוצה הרביעית ("Terms link found after the verdict, terms pages queued (rows
   266-269, ticks 55 and 56)") ירדה ל-1/1 עם היסטוריית 2/2 של טיק 55; הקבוצה השישית קיבלה כותרת חדשה, "Robots probe captured,
   robots verdict not yet run", ו-1/1 עם ההיסטוריה (5.10: 0, טיק 54: 1, טיק 55: 0); שורת ה-Total; שורת היסטוריה חדשה לסוף טיק 55;
   משפט סיום על שינוי הכותרת; תא "Lines now" של eurocontrol.int ב-"Terms read"; בסעיף טיק 55: תאי "Verdict now"/"Lines now" של
   שני האתרים (הערך מטיק 56 וערך טיק 55 לידו, מתוארך), בפסקת eurocontrol.int את העותק הקפוא במקום שם הלכידה החיה ואת התשובה
   לשאלה הפתוחה, ופסקה אחרונה עם הסוגריים המתוארכים; ובסוף הקובץ הסעיף החדש: טבלה של שתי שורות (7 עמודות), פסקה לכל אתר עם
   נקודות המאמת, פסקה על הבדיקה וה-dry run, ופסקה על השורות, הספירות ושינוי הכלל.
9. **F, בדיקות**: ראו סעיף 3 ו-6.
10. **G**: `node scripts/robots-verdict.mjs eurocontrol.int --urls research/measurements/ai-allowed-events.urls.txt` (יבש) — exit 0,
    "would set eurocontrol.int to NO_TERMS_ROBOTS_OK" (הנתיב האחד, `/air-navigation-services-performance-review`, מותר: אין כלל
    שתואם). לא הופעל עם `--apply`.
11. **H, אימות** (סעיף 6), ו-commit `fed8007` עם שני ה-trailers; יומן זה ב-commit נפרד.

## 3. קבצים/מערכות ששונו

- `research/channel-loop/terms-verdicts.json` — agenthon.net, eurocontrol.int (פסק, source, note), והסוגריים בהערה של
  ansperformance.eu.
- `research/rendered/urls.txt` — שתי שורות terms- חדשות עם ההערות שלהן; שתי השורות שנקראו מושהות כנקראו; `robots-eurocontrol`
  פעילה שוב; מילת הפסק בשורה המושהית `terms-eurocontrol`.
- `research/channel-loop/ZERO-TESTS.md` — שורות 268, 269 חדשות; סימנים בשורות 242, 247, 265, 266, 267.
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — קבוצות הרינדור, שורות הסיכום וההיסטוריה, תא בטבלת "Terms
  read", תאים ופסקאות בסעיף טיק 55, והסעיף החדש.
- `research/rendered/terms-agenthon-2026-10-06.{html,txt,meta.json}`, `terms-eurocontrol-disclaimers-2026-10-06.{html,txt,meta.json}`,
  `robots-eurocontrol-2026-10-06.{txt,meta.json}` (חדשים) ו-`FROZEN.sha256` (8 שורות).
- `src/__tests__/revenue/prize-terms-audit.test.ts`; `src/__tests__/revenue/fixtures/terms-verdicts-4f3527d-terms-read.json` (חדש).
- יומן זה.
- לא שונה: שום סקריפט, `frozen-citations.test.ts` (עבר בלי שינוי, כי הפניתי לעותק קפוא ולא הוספתי LIVE_MENTIONS).

## 4. החלטות והנחות משמעותיות

- **נוסח סיבת ההשהיה הותאם לצורה ש-`urls-pause-comments.mjs` מקבל.** ה-regex שלו (`PAUSED`) לא מקבל `;` או סוגריים בתוך הסיבה,
  ובלעדיה הוא לא היה מנהל את השורה. לכן "terms read: a participant agreement, not site terms; the licensing and privacy pages are
  queued (tick 56)" נכתב "terms read: a participant agreement, not site terms, the licensing and privacy pages are queued in tick
  56, 6.10.2026", ו-"a disclaimers page (map designations, VAT)" נכתב "a disclaimers page of map designations and VAT". `--check`
  שומר את שתיהן כפי שנכתבו.
- **שלוש עריכות יד ב-`urls.txt`.** אין סקריפט שכותב: (א) סיבה מותאמת אחרי קריאה; (ב) השהיה של שורה שעוברת בשער (`terms-agenthon`
  היא שורת terms- של אתר TERMS_PENDING); (ג) ביטול השהיה (`urls-pause-comments` לעולם לא מבטל השהיה, ו-`robots-verdict` לא נוגע
  ב-`urls.txt`). כל אחת נכתבה בצורת השורות השכנות, ושורת הבדיקה חזרה בדיוק לצורה שהייתה לה ב-`364bf71`.
- **הקפאתי גם את `robots-eurocontrol`** (מחוץ לשלב A). ברגע שהשורה חזרה להיות פעילה, הפרוזה של סעיף טיק 55 שקראה ללכידה בשמה
  החי (`research/rendered/robots-eurocontrol`) הפילה את `frozen-citations` ("names an active capture"). הבריף אומר "frozen copies
  cited; LIVE_MENTIONS only where a live capture is meant", והאזכור שם הוא תיעוד של מה שריצת 12:05 לכדה, לא הדף החי. לכן הקפאתי
  והפניתי לעותק הקפוא. `robots-verdict.mjs` מדלג על עותקים קפואים (`meta.frozen`), כך שה-dry run קורא את הלכידה החיה.
- **ל-thread הראשי, לפני `--apply`:** ה-source ש-`robots-verdict.mjs` יכתוב מצטט את הלכידה החיה `research/rendered/robots-eurocontrol.txt`.
  אחרי `--apply` הבדיקה `frozen-citations` תיכשל (לכידה פעילה בשמה ב-`terms-verdicts.json`), אלא אם ה-source יופנה לעותק הקפוא,
  כפי שעשתה הסקירה של טיק 54 לפסקי ה-robots. גם `UNJUDGED_PROBES` בבדיקה וספירות הקבוצות ישתנו אז.
- **מצב probe חדש בבדיקה, "unjudged".** הבדיקה של eurocontrol.int כבר נלכדה, ולכן לפי הכללים הישנים היא הייתה נופלת לקבוצה
  "Probed 6.10, NO_TERMS_ROBOTS_OK not set", שהפרוזה שלה אומרת שהסקריפט רץ ודחה. הוספתי `UNJUDGED_PROBES` (לכידה שהסקריפט לא
  הופעל עליה), והקבוצה השישית קיבלה כותרת שאומרת זאת: "Robots probe captured, robots verdict not yet run".
- **המפריד ב-source** של שני האתרים הוא `; TERMS_PENDING before: ` (שניהם היו TERMS_PENDING לפני). אצל eurocontrol.int הוא מופיע
  פעמיים (פעם מטיק 54); `indexOf` מוצא את הראשון, של טיק 56, והבדיקה מוודאת שמה שאחריו הוא ה-source של טיק 55 בדיוק.
- **copying "unread" לשניהם**, כפסיקה: אצל eurocontrol.int הקורא וגם המאמת כתבו "allowed"; ה-thread הראשי פסק "unread" (אין תנאי
  אתר לקרוא, ו-"unread" אינו "allowed").
- **ההערה של eurocontrol.int לא כוללת את תוצאת ה-dry run**, רק "run dry in tick 56, applied only on the main thread's word"; את
  הפלט רושם הסעיף בהערת הביקורת. כך ההערה נשארת נכונה גם אם הסקריפט יופעל (הוא שומר את ההערה).
- **ההערה של agenthon.net נשארת בלי מילת סוג** ("terms unread:"), כי שום תנאי אתר שלו לא נקרא. מספר ההערות בלי מילת סוג: 24.
- **שינוי הכלל בבדיקות:** עד טיק 55, אתר TERMS_PENDING החזיק שורת terms- אחת בדיוק. מטיק 56: שורת terms- **פעילה** אחת לכל מסמך
  שעוד לא נקרא, כל שורה שנקראה מושהית כ-"terms read", ושום שורה אחרת של האתר לא פעילה. נכתב בהערת ה-describe ובבדיקה ייעודית.
- **fixture שני** (`terms-verdicts-4f3527d-terms-read.json`, sha256 מוצמד, מושווה ל-`4f3527d` כשהוא זמין) ופונקציה `tick55()`.
  הבדיקות של בלוק טיק 55 שמתארות פסקים קוראות דרך `tick55()`; אלה שמתארות קבצים (`urls.txt`, ZERO-TESTS, הערת הביקורת) בודקות את
  המצב הנוכחי, עם ערכי טיק 55 מתוארכים לידם.
- **דף ה-Rules של agenthon (`/rules/`) לא נכנס לתור**: הפסיקה הכניסה רק את שני המסמכים, והשער מסרב לו כל עוד האתר TERMS_PENDING.
- בהערות לא כתבתי את שמות ה-slug החדשים בתוך backticks בקבצי ההחלטה (הלקח של טיק 55: `frozen-citations` קורא slug ב-backticks
  כציטוט לכידה).

## 5. שגיאות וניסיונות שנכשלו

- אחרי ביטול ההשהיה של `robots-eurocontrol`, `frozen-citations` נכשל על הפרוזה של טיק 55 שקראה ללכידה החיה בשמה. תוקן בהקפאה
  ובהפניה לעותק הקפוא (סעיף 4).
- ביטוי בהערה של agenthon.net, "(:28-31: Official ...)": הנקודתיים אחרי 31 גרמו לביטוי הציטוט לקרוא רק `:28`. הבדיקה החדשה תפסה
  את זה; נוסח מחדש ל-"(:28-31, the Official ...)" דרך `fix-note.mjs`.
- הנחתי בטעות ש-`robots-verdict.mjs` על `urls.txt` לא ימצא דף של eurocontrol.int לשפוט. בפועל הוא אוסף גם שורות מושהות, ושתי
  שורות התנאים שנקראו נספרות כדפים (נתיבי `/info/...`), ולכן גם שם הוא היה קובע את הפסק. הסרתי את הטענה, ובהערת הבדיקה כתוב
  שהסקריפט רץ עם `--urls`.
- בדיקת טיק 45 (905) ספרה את כל השורות המושהות של agenthon.net (עכשיו שתיים); סוננה לבדיקת ה-robots בלבד.
- טעות אות גדולה במחרוזת צפויה ("its" מול "Its").

## 6. בדיקות ופעולות ולידציה

כל התוצאות לפי exit code:

| פקודה | exit | הערה |
| --- | --- | --- |
| חמשת קבצי הבדיקה על הבסיס `4f3527d` (עם העותקים הקפואים) | 0 | 5 קבצים, 170 בדיקות |
| `node scripts/freeze-capture.mjs terms-agenthon` / `terms-eurocontrol-disclaimers` / `robots-eurocontrol` (dry-run ואז אמיתי) | 0 | שלושה עותקים קפואים, זהים בייט לבייט ללכידה (`cmp`) |
| `node scripts/queue-zero-test.mjs` (licensing, privacy; dry-run ואז אמיתי) | 0 | queued row 268, row 269 |
| `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run` (לפני) | 0 | would pause 1 line(s): terms-eurocontrol-disclaimers (הצפוי) |
| `node scripts/urls-pause-comments.mjs --fix --today 6.10.2026` | 0 | שורה אחת: `terms-eurocontrol` TERMS_PENDING → NO_TERMS |
| `node scripts/urls-pause-comments.mjs --check --today 6.10.2026` | 0 | 0 stale |
| `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run` (אחרי) | 0 | would pause 0 line(s) |
| `node scripts/robots-verdict.mjs eurocontrol.int --urls research/measurements/ai-allowed-events.urls.txt` (יבש) | 0 | would set NO_TERMS_ROBOTS_OK; לא הופעל |
| `scripts/verify.sh` על prize-terms-audit, queue-zero-test, robots-verdict, frozen-citations, urls-pause-comments | 0 | typecheck 0; 5 קבצים, 180 בדיקות (פעמיים: לפני ואחרי הצמדת ביטוי נוסף בבדיקה) |
| `node scripts/freeze-capture.mjs --cited` | 0 | 0 ציטוטים לפי שורה של לכידה פעילה; `git status` זהה לפני ואחרי |
| `node scripts/prize-dispatch.mjs --skip-captured --why` | 0 (הסקריפט) | שתי שורות `fail` (למטה) |
| `scripts/verify.sh` מלא | 0 | typecheck 0; 79 קבצים, 2657 עברו, 2 דולגו |
| `git grep` של שם הבעלים על הקבצים שהשתנו | 1 | לא נמצא דבר |
| `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan <scratch>/t56-data-mutations.json` | 0 | 14 הופעלו, 14 נהרגו, 0 שרדו |

פלט ה-dry run של `robots-verdict.mjs` (שלב G):

```
robots-verdict: eurocontrol.int (NO_TERMS)
  allowed     prize-www-eurocontrol-int-air-navigation-services-perf-fd12ebb3  https://www.eurocontrol.int/air-navigation-services-performance-review  (active; no rule)
would set eurocontrol.int to NO_TERMS_ROBOTS_OK (dry run; --apply writes .../research/channel-loop/terms-verdicts.json)
  source: robots.txt read at research/rendered/robots-eurocontrol.txt (https://www.eurocontrol.int/robots.txt, fetched 2026-10-06T12:07:27.881Z, sha256 45d83d13c223): all 1 queued path allowed for MehudakRenderWatch (scripts/robots-verdict.mjs); ruling research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v); NO_TERMS before: <the source tick 56 wrote>
```

שורות הסירוב של `prize-dispatch.mjs --skip-captured --why`:

```
  fail  agenthon.net  1: agenthon.net is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  eurocontrol.int  1: eurocontrol.int is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
```

המוטציות (על קבצי הנתונים, לא על סקריפטים; התוכנית בתיקיית ה-scratch, כי אף סקריפט לא השתנה): טווח שגוי בסימן READ של שורה
266; שורה שגויה בהערת שורה 268; בדיקת eurocontrol.int נשארת מושהית; שורת התנאים של agenthon.net נשארת פעילה; שורה שגויה בהערה של
eurocontrol.int; copying "allowed" אצל eurocontrol.int; שורה שגויה בפרוזה של הסעיף; שורת ה-Total עם קבוצות טיק 55; זמן fetch
בטבלה; שורת ZERO-TESTS של האתר השני בהערה של agenthon.net; מספר הטיק בשורה 269; מספר ההערות בלי מילת סוג; שינוי ב-fixture;
"it states a scope" בהערה של eurocontrol.int. כולן נהרגו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **סימון דף תנאים כנקרא**: השהיית שורת terms- עם סיבה "terms read: ...", סימון READ בשורת ZERO-TESTS, ולפעמים ביטול השהיה של
  בדיקת ה-robots. טיקים 54, 55 ו-56 עשו זאת ביד, בשלושה כלים ובסקריפט scratch. כדאי `scripts/mark-terms-read.mjs <slug> --reason
  "<text>" --mark "<text>" [--resume <probe-slug>]` שעובר דרך `PAUSED_LINE`, `loop-edit` ו-`termsGate`.
- **ביטול השהיה**: אין שום סקריפט שמבטל השהיה. כדאי `urls-pause-comments.mjs --resume <slug>` שבודק שהשער עובר ומחזיר את השורה
  לצורתה ב-commit נתון.
- **`robots-verdict.mjs --cite-frozen`**: שיכתוב את ה-source על עותק קפוא (או יקפיא בעצמו), כדי שלא יידרש שלב הפניה אחרי `--apply`.
- **מצבי היסטוריה בבדיקה**: כל טיק מוסיף fixture ופונקציה (`tick54`, `tick55`) וקבוצת ספירות. פונקציה כללית `stateAt(commit)`
  מעל fixtures לפי commit, ומבחן ספירות שעובר על רשימת מצבים, היו מקצרים את זה.
- **בודק ציטוטים כללי**: `lineCites` (טיק 55) ו-`rangeCites` (טיק 56) כמעט זהים; כדאי פונקציה אחת ברמת המודול.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `prize-terms-audit.test.ts` (כ-2,800 שורות לפני השינוי) בחלקים: הכבד ביותר, ונחוץ, כי כמעט כל בלוק בו נגע באחד האתרים.
- קריאת `terms-reading.json` במלואו (כ-62 אלף תווים): נחוץ לנקודות המאמת.
- שני סבבי תיקון בבדיקות (ציטוט `:28-31:`, ההנחה על `robots-verdict` ב-`urls.txt`, הספירה של בדיקת טיק 45).
- המתנה ל-`verify.sh` המלא (כעשר דקות, ברקע).
