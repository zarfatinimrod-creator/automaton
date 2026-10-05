# 5.10.2026: tick 46, הקיפול השני של פסיקת שורה 19 (מע"מ על שירותים): כלל ה-intake, המשפטים, ורישום סחיפת המצביעים

## 1. מה המשתמש ביקש

סקריפט הזרימה של tick 46 שלח אותי כבונה (Opus) ב-worktree מבודד, לבצע את סעיפים 8 (a)-(e), 9 ו-10 של §9 בפסיקת Fable
מ-5.10 (`research/channel-loop/RULING-2026-10-05-vat-services.md`), בסדר בדיקה-ואז-קוד:

- **8:** כלל דילוג ב-`scoreBounty` על באונטי שכל התוצר שלו טקסט (תיעוד, README, changelog, typo או תרגום) בלי מחסנית קוד;
  ארבעה מקרי בדיקה ובדיקת שמירה שהקוד של מונה ההיצע לא נוגע ב-intake; משפט אחד ב-`portfolio.ts` ומשפט אחד בצעד 3 של
  ה-skill.
- **9:** רישום סחיפת המצביעים בסוף שני פתקי מחקר (`osek-patur-documents.md`, `indiebook.md`), תוספות בלבד.
- **10:** השמירות: `freeze-capture --cited` נשאר 0, בדיקות owner-steps ירוקות בלי שינוי, `scripts/verify.sh`.

סעיפים 1-7 ו-12 (קבצי הלולאה וה-checkpoint) שייכים ל-thread הראשי ולא נגעתי בהם. ההגבלות: בלי `git stash`, בלי push, בלי רשת,
בלי עריכת `CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, קובץ פסיקה כלשהו,
`docs/OWNER_STEPS.he.md`, `src/revenue/owner-steps.ts`, ה-PDF, `supply.ts` ו-`scripts/algora-supply.ts`, ובלי שום פרט מזהה של
הבעלים.

## 2. הפעולות המרכזיות שביצעתי

- **פתיחה:** ה-worktree נפתח על `56d4c66`, בלי קובץ הפסיקה (`5c4bad0` לא היה אב קדמון). הרצתי
  `git reset --hard claude/new-session-j071dx` והגעתי ל-`5c4bad0`; הפסיקה במקום. `pnpm install --frozen-lockfile --prefer-offline`.
- **קריאה:** `MISSION.md` במלואו; הפסיקה במלואה (609 שורות); `intake.ts` (`scoreBounty`, שלב 8, `requiredStacks`),
  `bounties-intake.test.ts`, `supply.ts`, `scripts/algora-supply.ts`, פריט "Filter before attempting" ב-`portfolio.ts`, צעד 3
  ב-`SKILL.md`, וסוף שני הפתקים. `git diff --stat 56d4c66 5c4bad0` מראה רק שני קבצי פסיקה, לכן כל מצביע של הפסיקה נבדק
  מחדש ב-`5c4bad0` ונמצא במקומו (פרט לשלושה שזזו, סעיף 4).
- **בדיקות קודם (commit `797a179`):** בלוק חדש ב-`bounties-intake.test.ts`:
  - באונטי README-typo בלי מחסנית קוד: לא כשיר, ו-`skipped` הוא בדיוק `writing-or-translation-only`, עם הפניה ל-6א(1),
    ל-13(1) ולפסיקה בפרט.
  - באונטי תרגום: שלושה קלטים בלולאה, "Translate the docs into Spanish", תרגום הודעות שגיאה (מחסנית tests בלבד, בלי המילה
    docs), ותווית `translation` בלבד.
  - באג TypeScript שאומר גם "update the docs": כשיר כמו קודם.
  - באונטי tests בלבד: כשיר כמו קודם.
  - שמירה (8(c)): `supply.ts` ו-`scripts/algora-supply.ts` לא מכילים `scoreBounty` ולא `requiredStacks` (קריאת הקבצים).
  - לפני הכלל: 2 נכשלו (README ותרגום, `expected true to be false`), 62 עברו.
- **הכלל (commit `8326f5d`):** ב-`intake.ts` נוספו `CODE_STACKS` (typescript, javascript, python) ו-`TRANSLATION_PATTERN` בדיוק
  כלשון הפסיקה, ושלב 8a אחרי "Our stack": `codeStacks` ריק וגם (docs, או התבנית על התוויות או על הכותרת והטקסט) → דילוג
  `writing-or-translation-only` עם ה-detail המילולי של הפסיקה. `requiredStacks` ו-`not-our-stack` לא השתנו. אחרי: 64/64.
- **המשפטים (commit `7285a33`):** המשפט של 8(d) נוסף בסוף פריט "Filter before attempting" ב-`portfolio.ts`, מילה במילה, והטקסט
  הקיים נשאר. בצעד 3 של `skills/revenue-oss-bounties/SKILL.md` נוסף משפט אחד שמציין את הכלל בשמו.
- **הסחיפה (commit `31f0750`):** בלוק בסוף `osek-patur-documents.md` עם רשימת ישן → חדש מ-§8.1 ומ-§9 item 9, והמשפט על
  אישור הממצאים והוספת התרגום ב-`:1330`. בסוף `indiebook.md` נוספה השורה של הפסיקה על `:227`. ב-`git diff` יש רק תוספות
  (0 שורות שהוסרו).
- **בדיקות סיום:** מוטציות, verify, owner-steps, freeze-capture ו-grep לשם (סעיף 6). לבסוף כתבתי את היומן הזה.

## 3. קבצים/מערכות ששונו

- `src/__tests__/revenue/bounties-intake.test.ts`: בלוק בדיקות חדש וייבוא `node:fs`/`node:path`/`node:url` ו-`REPO_ROOT`.
- `src/revenue/bounties/intake.ts`: שני קבועים ושלב 8a (16 שורות, תוספות בלבד).
- `src/revenue/portfolio.ts`: משפט אחד בסוף פריט אחד ב-`operatingLoop` של oss-bounties.
- `skills/revenue-oss-bounties/SKILL.md`: משפט אחד בצעד 3.
- `research/measurements/osek-patur-documents.md`, `research/measurements/indiebook.md`: בלוקים בסוף הקובץ בלבד.
- `logs/2026-10-05-channel-loop-tick-46-vat-services-fold.md`: היומן הזה.
- לא נגעתי: `owner-steps.ts`, `owner-steps.test.ts`, `OWNER_STEPS.he.md`, ה-PDF, `supply.ts`, `algora-supply.ts`, `logs/`
  הקיימים, `research/channel-loop/`, `MISSION.md`, `CLAUDE.md` (`git diff --stat 5c4bad0 HEAD` על כולם ריק).

## 4. החלטות והנחות משמעותיות

- **שלושה קלטים במקרה התרגום, לא אחד.** המקרה של הפסיקה, "translate the docs into Spanish", מכיל את המילה docs, ולכן הוא
  נתפס גם בלי `TRANSLATION_PATTERN`. כך מוטציה שמסירה את התבנית הייתה שורדת. לכן הוספתי באותו `it` קלט בלי docs (תרגום הודעות
  שגיאה, מחסנית tests) וקלט שבו רק התווית `translation` מעידה על תרגום (הפסיקה אומרת "against the same haystack and label
  text"). עדיין ארבעה מקרים (`it`) ושמירה אחת, כמו בפסיקה.
- **השמירה באותו קובץ בדיקות** (הפסיקה מתירה את זה או `bounties-supply.test.ts`), כדי שהפקודה שנדרשה בבריף תריץ אותה.
- **השמירה מכסה רק את שני הקבצים שהפסיקה מנתה.** `supply-github.ts` (שגם `algora-supply.ts` מייבא) לא נכלל. היום אין בו
  `scoreBounty` ולא `requiredStacks` (grep על `src` ו-`scripts`: רק `intake.ts` והבדיקה). אם ה-thread הראשי רוצה לסגור את
  הפער הזה, זו שורה אחת במערך של הבדיקה.
- **כותרת המודול ב-`intake.ts`** (רשימת הכללים 1-10) לא עודכנה. הפסיקה מבקשת כלל אחד ב-`scoreBounty`, וההערה שמעל שלב 8a
  מפנה לפסיקה.
- **בלוק הסחיפה בפתק osek** כולל גם את `RULING:135-136` ו-`:406` → `:1381`, כי §8.1 אומר שכל הפריט "Recorded by the fold in an
  appended block". הוספתי שורת מבוא שמגדירה את `RULING` כ-`research/channel-loop/RULING-2026-09-30-documents.md`, ואת
  `:146` כמצביע הישן של שורת העיסוק (מ-§8.1). כל שורה שצוטטה נבדקה ב-`5c4bad0`, וגם היעדים החדשים (`OWNER_STEPS.he.md:134`,
  `:149`, `:150`, `:153`, `:160`; `CHANNEL_LOOP.md:166`).
- **מצביעים שזזו מאז הפסיקה (נמצאו ב-`grep -n -F`):** שלב 8 ב-`intake.ts` הוא `:654-664` ב-`5c4bad0` (הפסיקה: `:655-666`;
  `:666` הוא הערת שלב 9). הפריט ב-`portfolio.ts` הוא `:282` (הפסיקה: `:281`). צעד 3 ב-`SKILL.md` הוא `:40-42` (הפסיקה:
  `:38-40`). `intake.ts:446` ו-`:490` במקומם.
- **סחיפה שהפסיקה לא ציינה:** גם `indiebook.md:256` מצטט `MISSION.md:412-413` (המשפט ב-`:432-433`). לפי הבריף העתקתי את
  הרשימה של הפסיקה בדיוק, ולכן לא הוספתי את `:256`. זה פתוח ל-thread הראשי.

## 5. שגיאות וניסיונות שנכשלו

- **בסיס ישן:** ה-worktree נפתח על `56d4c66` בלי קובץ הפסיקה. תוקן ב-`git reset --hard` לענף (כמו ב-`CLAUDE.md`).
- **פקודת bash מורכבת נחסמה:** ה-harness סירב לפקודה עם משתנה והחלפות heredoc מרובות ("too complex to verify"). עברתי לכלי
  Edit לעריכות, ולפקודות פשוטות נפרדות.
- **שורת placeholder בפתק:** בהוספה הראשונה לסוף `osek-patur-documents.md` נכנסה בטעות שורה חלקית עם placeholder. שחזרתי את
  הקובץ ב-`git checkout -- <file>` (שינוי שלי בלבד, לפני כל commit) והוספתי את הבלוק הנכון. אף commit לא נשא אותה.

## 6. בדיקות ופעולות ולידציה

- **אדום לפני הכלל:** `npx vitest run src/__tests__/revenue/bounties-intake.test.ts`, יציאה 1, 2 נכשלו ו-62 עברו. נכשלו מקרה
  ה-README ומקרה התרגום. שלוש הבדיקות האחרות הן שמירות שעוברות מראש מעצם הגדרתן; שהן תופסות הוכח במוטציות.
- **ירוק אחרי הכלל:** אותה פקודה, יציאה 0, 64/64.
- **מוטציות:** `node scripts/mutate.mjs --plan <scratch>/plan.json`, יציאה 0: 10 הוחלו, 10 נהרגו, 0 שרדו. Baseline ו-baseline
  חוזר יצאו 0.

  | id | מוטציה | תוצאה | נהרגה ע"י |
  |---|---|---|---|
  | M1 | `TRANSLATION_PATTERN` הוסר מהתנאי (נשאר docs בלבד) | killed | מקרה התרגום (הקלט בלי docs) |
  | M2 | תנאי ה-docs הוסר (README-typo עובר) | killed | מקרה ה-README |
  | M3a | `codeStacks.length === 0 &&` הוסר (הכלל חל גם עם מחסנית קוד) | killed | באג TS + "update the docs" |
  | M3b | `CODE_STACKS` בלי typescript | killed | באג TS + "update the docs" |
  | M3c | `CODE_STACKS` מורחב ב-tests | killed | מקרה התרגום (מחסנית tests) |
  | M3d | `CODE_STACKS` מורחב ב-docs | killed | README ותרגום |
  | M4 | התבנית לא נבדקת על התוויות | killed | מקרה התרגום (תווית בלבד) |
  | M5 | שם הכלל שונה | killed | README ותרגום |
  | M6 | ייבוא `scoreBounty` נוסף ל-`supply.ts` | killed | השמירה |
  | M7 | `requiredStacks` נקרא ב-`scripts/algora-supply.ts` | killed | השמירה |

- **שתי הבדיקות של הבריף:** `npx vitest run src/__tests__/revenue/bounties-intake.test.ts src/__tests__/revenue/owner-steps.test.ts`,
  יציאה 0, 139/139. owner-steps לא השתנו.
- **בדיקות שסורקות את ה-portfolio וה-skills:** `constraints.test.ts` (המסנן GREEN על `operatingLoop`), `bounties-supply.test.ts`,
  `target-basis.test.ts` ו-`skills-hardening.test.ts`, יציאה 0.
- **`node scripts/freeze-capture.mjs --cited`:** יציאה 0, "0 citation(s) by line of an active capture", לפני העריכות ואחריהן.
  הבלוקים מצטטים פתקים וקבצי לולאה, אף לכידה חיה.
- **`scripts/verify.sh src/__tests__/revenue`:** יציאה 0. typecheck יציאה 0; tests יציאה 0, 71 קבצים, 2340 עברו ו-1 דולג.
  "verify: passed".
- **`git diff` על שני הפתקים:** 13 שורות נוספו, 0 הוסרו.
- **grep לא תלוי-רישיות לשם הבעלים, על כל קובץ שנגעתי בו (כולל היומן הזה):** ריק. (התבנית עצמה לא נכתבת כאן, כי היא
  השם.)

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **הוספה בלבד לפתקים מחוץ ל-`loop-edit`:** בלוק סחיפה בסוף פתק ב-`research/measurements/` נכתב ביד, ואחר כך נבדק ביד
  ש-`git diff` מכיל תוספות בלבד. פקודת `append` ב-`loop-edit.mjs` שמותרת גם ל-`research/measurements/*.md`, וכותבת רק בסוף
  הקובץ, הייתה חוסכת את הבדיקה ואת הטעות של סעיף 5.
- **בדיקת מצביעים ישנים:** כל `:NNN` שהפסיקה מצטטת נבדק ביד ב-`awk`. כלי שמקבל רשימת "קובץ:שורה → טקסט צפוי" ומדווח
  על מה שזז היה הופך את §8 של כל פסיקה לבדיקה של פקודה אחת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **קריאת `MISSION.md` והפסיקה:** הפלט הראשון של שני הקבצים חרג ממגבלת הפלט ונשמר לקובץ, ולכן קראתי שוב (הפסיקה ב-4 חלקים של
  `sed`, ו-MISSION מהקובץ השמור). זה נדרש, אבל כפול.
- **הפקודה המורכבת שנחסמה:** פקודה אחת עם שלוש עריכות דרך סקריפט עזר נכתבה ונזרקה. נכתבה מחדש כשלוש קריאות Edit.
- **התיקון של הפתק:** append, `git checkout` ו-append חוזר. בערך שלוש קריאות כלי מיותרות.
- **הפלט של `mutate.json`:** ניסיון ראשון לקרוא אותו בשמות שדות לא נכונים, ואחר כך הדפסה של ה-tail. קריאה אחת מיותרת.
