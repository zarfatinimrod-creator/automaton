# טיק 68 (8.10.2026) — פסיקת היקף Stanford: virtualembryo.ai הוא CONDITIONAL_UNMET, copying barred

בונה (Opus) ב-worktree מבודד, על הענף `claude/new-session-j071dx` (בסיס `f838285`). הלוג הזה הוא של הקיפול בלבד; את
`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` ו-`logs/FABLE_QUEUE.md` מעדכן החוט הראשי.

## 1. מה המשתמש ביקש

לקפל את פסיקת החוט הראשי של טיק 68 (8.10.2026), שעונה על השאלה שהערת virtualembryo.ai ב-`terms-verdicts.json` השאירה
"Open for the main thread (tick-54 review)":

- virtualembryo.ai הוא אחד מ-"other Stanford sites" שתנאי השימוש של Stanford חלים עליהם, על פי הטקסט
  (`terms-stanford-2026-10-06.txt:97`): הכותרת התחתונה של האתר מציינת מעבדה של Stanford University כבעלת הזכויות
  (`terms-virtualembryo-2026-10-06.txt:109`), "Stanford" כולל "any Stanford-affiliated entity" (`:99`), ולהיקף אין
  הגבלת דומיין. תנאי האתר עצמו לא מבטלים תנאים אחרים (`:17`, `:64`), ולכן שני סטים של תנאים חלים, והמחמיר קובע: של
  Stanford, הורדה "only for User's own personal, non-commercial use" ואיסור העתקה ופרסום (`:125`).
- לכן האתר מקבל את ה-verdict ואת שדה ה-copying של stanford.edu: `CONDITIONAL_UNMET`, `barred`. קריאת טיק 54 של תנאי
  האתר עצמו נשארת כקריאה של אותו מסמך. זו קריאה שמרנית של טקסט פתוח, ונרשמת כשנויה במחלוקת.
- תיעוד כן של ההחלקה: שורת ה-/challenge שוגרה בטיק 68 (run `37742767006`, commit `7d2efd9`) לפני הפסיקה, כשה-verdict
  עוד היה NOT_BARRED. הלכידה נשארת בעץ כרשומה, שום ציון, תא סעיף או ציטוט לא נלקח ממנה, והשער של prize-dispatch כבר
  לא מציע את השורה.

מה לשנות: הרשומה ב-`terms-verdicts.json`; שורת `terms-virtualembryo` ב-`urls.txt` (מושהית כנקראה, בתבנית של
`terms-stanford`); קבוצות הרינדור ב-`TERMS-AUDIT-2026-10-05-prize-events.md` עם כל הספירות ושורה מתוארכת אחת; כל בדיקה
שמצמידה את ה-verdict, ה-copying, ההערה, ספירות "Now", מצב השורה ורשימת האתרים עם copying "allowed"; שלוש בדיקות
חדשות (הפסיקה, prize-dispatch נכשל על האתר, ושום שורה ב-`ai-allowed-events.md` לא מצטטת את הלכידה); וכל מסמך אחר
שאומר NOT_BARRED או "allowed" כמצב נוכחי.

## 2. הפעולות המרכזיות שביצעתי

1. בדיקת בסיס: ה-worktree התחיל ב-`3edde5e`, שתי קומיטים מאחורי `f838285`; `git reset --hard claude/new-session-j071dx`
   לפני כל עריכה.
2. `terms-verdicts.json`: סקריפט ששינה רק את רשומת virtualembryo.ai (verdict, checked `2026-10-08`, note, copying;
   ה-source נשאר) וכתב את הקובץ מחדש ב-`JSON.stringify(_, null, 1)` בלי שורה אחרונה, כפי שהוא סודר; `git diff` הראה
   שינוי בשורות 793 ו-795 עד 797 בלבד. אותו סקריפט שמר את הרשומה הקודמת כ-fixture
   (`fixtures/terms-verdicts-f838285-virtualembryo-stanford.json`).
3. ההערה החדשה נפתחת במשפט CONDITIONAL_UNMET עם `:97`, `:99`, `:125` של Stanford ו-`:109` של הכותרת התחתונה, בנתיבים
   מלאים; אחריה קריאת טיק 54 של תנאי האתר, כקריאה של המסמך, עם כל הציטוטים (`:12-13`, `:84`, `:43`, `:54`, `:55`,
   `:14`, `:16`, `:75`, `:17`, `:45`, ושורת הכללים `@548be52:182`); השאלה הפתוחה נסגרת כנענתה; ושני משפטים על ההחלקה
   ועל מצב הלכידה.
4. `urls.txt`: שורה 757 הושהתה: `# paused (terms read, left paused: the Stanford scope ruling of tick 68, 8.10.2026):
   virtualembryo.ai is CONDITIONAL_UNMET in ...`. `urls-pause-comments.mjs --check` נותן 0 הערות מיושנות.
5. `ZERO-TESTS.md` שורה 241: סימן מתוארך של טיק 68 נוסף אחרי סימן ה-READ של 6.10 (דרך `loop-edit.mjs set-cell
   --append`); הסימן הישן ("The line stays active") הוא רשומה מתוארכת ונשאר כפי שנכתב.
6. מסמך האודיט: דרך `loop-edit.mjs` (replace-in-line ו-insert-after) — "Now" ירד ל-13 URLs על 12 אתרים (בלי
   `virtualembryo.ai` ובלי שורת ה-URL שלו, שנמחקה בכלי Edit כי ל-loop-edit אין פקודת מחיקה); "Shut by the 6.10 terms
   fetch and the once-only js render" עלה ל-39 על 8 עם `virtualembryo.ai` 1 והיסטוריה מתוארכת; שורת ה-Total; שורת
   היסטוריה חדשה "7.10 (tick 60), after adaptionlabs.ai's js render and before the Stanford scope ruling"; ושורה מתוארכת
   אחת "8.10 (tick 68): ..." שאומרת למה. סעיף "Terms read (6.10.2026, tick 54)" נשאר כפי שנכתב.
7. בדיקות (`prize-terms-audit.test.ts`): `ve68Before()` מחזיר את הרשומה מה-fixture, וכל שחזור של טיק מוקדם
   (`tick54`, `tick55`, `tick57e`, `renderBefore`, `yt61Before`, ומהם `tick56`, `un60Before`, `termsReadBefore`,
   `jsReadBefore`, `tick45`) עובר דרכו, כך שהבלוקים ההיסטוריים מחזיקים מה שהחזיקו. הבדיקות של המצב הנוכחי עברו לאמת
   החדשה (34 דרך השער במקום 35, 6 שורות מושהות, `TERMS_LINES` של האתר, ספירות הקבוצות, ה-Shut group בכותרת "ticks 54,
   60 and 68", אף אתר לא "allowed"). נוסף בלוק "tick 68" עם 8 בדיקות. `render-watch.test.ts:2001` מצפה עכשיו
   ש-virtualembryo.ai ברשימת ה-copying-barred (ו-google.com, unread, לא בה).
8. `mutations/robots-verdict.json`: 16 רשומות T68-VE, והמחרוזת של T57-A3 עודכנה לשורת ה-Total החדשה.

## 3. קבצים/מערכות ששונו

- `research/channel-loop/terms-verdicts.json` — רשומת virtualembryo.ai בלבד.
- `research/rendered/urls.txt` — שורת `terms-virtualembryo` מושהית (הקובץ היחיד תחת `research/rendered/` ששונה).
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — קבוצות הרינדור, Total, שורת היסטוריה, שורה מתוארכת.
- `research/channel-loop/ZERO-TESTS.md` — סימן טיק 68 בשורה 241.
- `src/__tests__/revenue/fixtures/terms-verdicts-f838285-virtualembryo-stanford.json` — חדש (sha256 `de9d6164…`).
- `src/__tests__/revenue/prize-terms-audit.test.ts` — שחזורים, ציפיות המצב הנוכחי, בלוק tick 68.
- `src/__tests__/revenue/render-watch.test.ts` — ציפיית ה-copying-barred.
- `src/__tests__/revenue/mutations/robots-verdict.json` ו-`mutations/README.md` — רשומות T68 ומדידת הריצה.
- `logs/2026-10-08-channel-loop-tick-68-virtualembryo-fold.md` — הלוג הזה.

## 4. החלטות והנחות משמעותיות

1. **ה-source לא שונה.** הבריף מנה verdict, copying, checked ו-note. ה-source עדיין אומר "verdict by the main thread
   (tick 54; ...)"; ההערה אומרת שהפסיקה של טיק 68. אם החוט הראשי רוצה שה-source יזכיר גם את `terms-stanford-2026-10-06.txt`,
   זה שינוי קטן נוסף.
2. **שם המעבדה לא נכתב.** הפסיקה נוקבת בשם (שם משפחה של אדם). ההערה הקודמת, שורת האודיט ובדיקה קיימת מחזיקים אותו
   מחוץ לקבצים ("© 2026 … Lab"); הקיפול שומר על כך, והבלוק החדש בודק זאת.
3. **ה-slug של לכידת ה-/challenge לא נכתב בהערה.** בטיוטה הראשונה הוא הופיע, ו-`citationsOf` של `trim-capture.mjs`
   קרא את כל ה-`:N` באותה שורת JSON כציטוטים של הלכידה הזו ("on its line") — כלומר ההערה נראתה כמצטטת את הלכידה בשורות
   97, 64, 84 ועוד, בניגוד ל"שום ציטוט לא נלקח ממנה". ההערה מזהה את הלכידה ב-URL, ב-run וב-commit. מאותה סיבה
   `:64` נכתב בנתיב מלא: כ-`:64` חשוף הוא נקרא גם "on its line" של העותק הקפוא של Stanford (שגזום), והריצה היבשה של
   הגזירה הוציאה note על שורה שהגזירה רוקנה.
4. **הבלוקים ההיסטוריים קוראים את הרשומה הישנה דרך fixture**, כמו בקיפולי טיקים 55-61 (un.org, googleapis.com). הבריף
   ביקש לשנות ציפיות לאמת החדשה; עשיתי זאת לכל טענה על המצב הנוכחי, והוספתי טענות על המצב הנוכחי גם לבדיקות של טיק 54
   שהבריף נקב בהן (רשימת ה-"allowed", השאלה הפתוחה, פתיחת ההערה). הטענות על מצב טיק 54 עצמו נשארו, כי הן קוראות fixture
   מוצמד.
5. **הפרדת הקבוצות "Shut" ו-"Graded with no capture"** עברה מ-`checked === 2026-10-06` ל-`Object.hasOwn(TERMS_READ, site)`
   (דף התנאים של האתר נלכד ב-6.10). עד טיק 68 שתי ההגדרות זהות, ובדיקת הספירות מוכיחה זאת לכל עשרת המצבים. בלי זה
   virtualembryo.ai (checked 8.10) היה נופל ל-"Graded with no capture", בניגוד לבריף.
6. **הסעיפים המתוארכים של טיקים 55-57 במסמך האודיט** אומרים "35 through the gate"; הם רשומות מתוארכות ונשארו. הבדיקות
   שלהם מחשבות את "now" של אותו זמן (`ve68Before`); הבלוק החדש מצמיד 34.
7. **`ZERO-TESTS.md` שורה 241** לא נמנתה בבריף; "The line stays active" שם הוא מצב נוכחי בתוך סימן מתוארך, ולכן נוסף
   סימן מתוארך חדש (כמו שורות 210, 240, 266) והישן לא נגע.
8. **גזירת הלכידות של virtualembryo.ai (decision 4(1)) לא בוצעה.** עכשיו כשה-copying הוא barred, `trim-capture.mjs` בריצה
   יבשה אומר "would trim" ל-`terms-virtualembryo`, `terms-virtualembryo-2026-10-06` וללכידת ה-/challenge. הכללים הקשיחים
   אוסרים לגעת ב-`research/rendered/`, והפסיקה אומרת שהלכידה "stays in the tree as the record". זו החלטה לחוט הראשי.

## 5. שגיאות וניסיונות שנכשלו

- פקודות `sed`/`git` עם משתנים ופקודות מורכבות נחסמו על ידי שומר ה-worktree; פוצלו לפקודות פשוטות וסקריפטים בקבצים.
- הרצת `loop-edit.mjs` דרך `execFileSync` עם `--anchor "- **Now: "` נכשלה (ערך שמתחיל ב-"-"); עבר לצורת `--flag=value`.
- ה-`--append` של `set-cell` מוסיף רווח בעצמו; הריצה היבשה הראשונה הראתה רווח כפול, ותוקן לפני הכתיבה.
- הטיוטה הראשונה של ההערה כללה את ה-slug של הלכידה ו-`:64` חשוף (החלטה 3); תוקן בשתי החלפות מדויקות בסקריפט.
- הסוויטה המלאה הראשונה נכשלה ב-2: `mutation-plans.test.ts` (המחרוזת של T57-A3 זזה עם שורת ה-Total; תוקן) ו-
  `render-watch-js.test.ts` (קורא `node_modules/playwright-core/package.json` בנתיב ישיר, וב-worktree הזה `node_modules`
  מכיל רק מטמון vitest; סביבתי, לא קשור לקיפול; ראה סעיף 6).
- `scripts/sim-tree.sh` לא שימושי כאן: הוא מקשר את `node_modules` של ה-checkout, שב-worktree הזה ריק. המוטציות רצו
  במקום, ב-worktree המבודד, אחת אחת.

## 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh src/__tests__/revenue/prize-terms-audit.test.ts src/__tests__/revenue/render-watch.test.ts`: exit 0,
  2 קבצים, 256 בדיקות עברו.
- `scripts/verify.sh` (כל `src/__tests__/revenue`): exit 1: 81 קבצים, 2950 בדיקות עברו, 2 skipped, ובדיקה אחת נכשלה, `render-watch-js.test.ts` ("resolves the pinned playwright-core from this repository's devDependencies"), שקוראת `node_modules/playwright-core/package.json` בנתיב ישיר; ב-worktree הזה `node_modules` מכיל רק את מטמון vitest. כשהחבילה נגישה (קישור זמני בתוך `node_modules`, שהוסר מיד) הקובץ עובר 72/72. הריצה הראשונה, לפני תיקון T57-A3: exit 1, 2949 עברו ו-2 נכשלו (השנייה `mutation-plans.test.ts`).
- `node scripts/prize-dispatch.mjs --skip-captured`: exit 3, stdout ריק, ו-stderr: `fail  virtualembryo.ai  1:
  virtualembryo.ai is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json`.
- `node scripts/urls-pause-comments.mjs --check --today 8.10.2026`: exit 0, 0 stale.
- `trimStore` (ריצה יבשה של `trim-capture.mjs`): קוד 0, בלי REFUSED ובלי notes על Stanford.
- `node scripts/mutate.mjs --check --plan` לכל 22 התוכניות: כולן "would apply" (`robots-verdict.json`: 156 מתוך 156).
- מוטציות: 17 מוטציות (16 רשומות T68-VE ו-T57-A3, שהמחרוזת שלו זזה), ריצת `scripts/mutate.mjs` נפרדת לכל אחת, ב-worktree: כל 17 נהרגו, 262 שניות כולל שתי ריצות baseline לכל אחת; ה-worktree נקי אחרי הריצה.
- `git diff` של `terms-verdicts.json`: שורות 793, 795-797 בלבד; הבדיקה החדשה מוודאת שעם הרשומה הישנה הקובץ שווה
  לקובץ ב-`f838285` (לפני re-checks).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **קיפול verdict**: בכל טיק (55, 56, 57, 60, 61, 68) נבנים ביד fixture, sha256, פונקציית `xxBefore()`, ושרשור שלה לכל
  השחזורים. כלי `scripts/verdict-fold.mjs <site>` שכותב את ה-fixture, מחשב את ה-hash ומדפיס את הקוד יחסוך את רוב הזמן.
- **מחיקת שורה בקובץ לולאה**: ל-`loop-edit.mjs` אין `delete-line`; נדרש Edit ידני לשורת URL אחת.
- **סורק הציטוטים של trim-capture**: כלל "on its line" מצמיד כל `:N` בשורה לכל לכידה שנזכרת בה; בקובץ JSON שכל הערה בו
  היא שורה אחת זה מייצר ציטוטים מזויפים. כדאי שבדיקה תתריע כשהערה ב-`terms-verdicts.json` נוקבת ב-slug של לכידה עם `:N`
  חשופים.
- **בדיקת `render-watch-js`** קוראת `node_modules` בנתיב ישיר ונכשלת בכל worktree בלי `node_modules` משלו; `createRequire`
  היה פותר.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `prize-terms-audit.test.ts` (כ-5,300 שורות) כדי למצוא את כל המקומות שתלויים ב-virtualembryo.ai — רוב העלות;
  grep ממוקד ואז קריאת המקטעים הרלוונטיים חסך חלק.
- הדפסת הסטטוס החוזרת של משימות הסשן (רשימת tasks ארוכה שאינה של הבונה) בכל תזכורת — רעש שלא אני יצרתי.
- שתי ריצות של הסוויטה המלאה (כ-2 דקות כל אחת) — הכרחי, הראשונה גילתה את T57-A3.
- ריצת ה-dry run של loop-edit לפני כל כתיבה — זול ושווה.
