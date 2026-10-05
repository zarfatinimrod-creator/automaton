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

---

# תוספת 5.10: תיקון ממצאי הסקירה של הקיפול (מתקן Opus, אותו worktree)

## 1. מה המשתמש ביקש

סקריפט הזרימה של tick 46 שלח אותי כמתקן (Opus) לאותו worktree, עם דוח הבונה ושישה ממצאים של הסוקר: לתקן כל ממצא שמחזיק,
בדיקה קודם; לנמק כל ממצא שאני דוחה; להריץ שוב `scripts/verify.sh` (לפי קוד יציאה), `node scripts/freeze-capture.mjs --cited`
(0) ותוכנית `scripts/mutate.mjs` עם מוטציה אחת לפחות לכל תיקון; לבצע commit; ולהוסיף את העבודה ליומן הזה. אותן הגבלות כמו
לבונה: בלי `git stash`, בלי push, בלי רשת, בלי עריכת קבצי הלולאה, ה-checkpoint, `MISSION.md`, `CLAUDE.md`, קובץ פסיקה,
`docs/OWNER_STEPS.he.md`, `src/revenue/owner-steps.ts` או ה-PDF, בלי שכתוב של יומן קיים (רק הוספה בסוף), ובלי פרט מזהה של
הבעלים.

## 2. הפעולות המרכזיות שביצעתי

- **פתיחה:** ה-worktree נקי ב-`d6f5c03` על `worktree-wf_6d779b86-9a9-1`. קראתי את §3.0, §3.7, §7, §8 ו-§9 של הפסיקה, את
  `scoreBounty` ואת הבדיקות, ובדקתי כל ממצא מול הקבצים לפני שנגעתי בהם.
- **בדיקות קודם (commit `4e8b490`, אדום בכוונה: 2 נכשלו, 66 עברו):**
  - ממצא 2: חמישה קלטים עם מחסנית tests בלבד: תווית `translations`, "Add Spanish translations", "should be localized to German"
    בגוף, "Strings translated to French", ותווית `l10n`. כולם עברו את התבנית המילולית של הפסיקה, ולכן אדומים.
  - ממצא 3: קלט שמילת התרגום שלו רק בגוף ("translate every settings string"), וקלט באיות בריטי ("Localise the settings page
    into German"). ירוקים מההתחלה; הם הורגים את V2 ואת V3 של הסוקר.
  - ממצא 4: README-typo שהקריטריונים שלו מזכירים את ה-test suite (מחסניות docs ו-tests, בלי שפת קוד) חייב להידלג. ירוק מההתחלה;
    הוא הורג את "אפשרות B" של הסוקר, וזו הסיבה לדחייה (סעיף 4).
  - ממצא 1: בדיקת השמירה נכתבה מחדש כרשימה לבנה על כל גרף הייבוא של המונה, מ-`scripts/algora-supply.ts` דרך כל ייבוא יחסי.
    כל קובץ שנגיש מותר לו לקחת מה-intake רק `ALGORA_BOT_LOGIN`, `parseAlgoraBotComment` ו-`AlgoraBotComment`, ורק בייבוא
    בשמות. נאסרים ייבוא namespace, ברירת מחדל, re-export, ייבוא דינמי, הגעה ל-barrel (`index.ts`, שעושה `export *`
    מה-intake), והשמות `scoreBounty`, `selectBounties`, `defaultIntakeConfig` ו-`requiredStacks`. הבדיקה גם מוודאת שההליכה
    הגיעה ל-`supply.ts` ול-`supply-github.ts`, כך ששמירה שלא הלכה לא נחשבת ירוקה.
  - ממצא 6: בדיקה שרשימת הכללים בראש `intake.ts` כוללת את כלל 11 עם `writing-or-translation-only` ועם
    "RULING-2026-10-05-vat-services.md §3.7, §4". אדומה.
- **התיקון (commit `ff542cc`):** `TRANSLATION_PATTERN` הורחב ל-
  `/\b(?:translat(?:e[ds]?|ions?|ing)|locali[sz](?:e[ds]?|ations?|ing)|l10n)\b/i`, ונוספה הערה שמסבירה למה. בראש `intake.ts`
  נוסף כלל 11 עם המקור שלו, וכלל 5 מציין עכשיו ש-docs לבד לא מספיק. אחרי זה קובץ ה-intake ירוק, 68/68.
- **הפתקים (commit `1e3b09c`):**
  - `osek-patur-documents.md`: `:1116` נוסף לתבליט `:156 → :160`, כי הוא מצטט `(:156)` חשוף.
  - `indiebook.md`: השורה מכסה עכשיו גם את `:256` (`MISSION.md:412-413 → :432-433`) ואת `:147` (`MISSION.md:420 → :440`, שם
    המשפט הוא "The owner does not talk to customers.").
  - שתי השורות האלה נוספו בקומיט הזה עצמו, ולכן ה-diff מול `5c4bad0` עדיין תוספות בלבד.

## 3. קבצים/מערכות ששונו

- `src/__tests__/revenue/bounties-intake.test.ts`: חמש בדיקות חדשות בבלוק "text-only bounties", ושמירת המונה נכתבה מחדש. הייבוא
  מ-`node:path` כולל עכשיו גם `basename` ו-`relative`.
- `src/revenue/bounties/intake.ts`: `TRANSLATION_PATTERN` והערתו; כלל 5 וכלל 11 בראש הקובץ.
- `research/measurements/osek-patur-documents.md` ו-`research/measurements/indiebook.md`: שורה אחת בכל אחד, בתוך הבלוק שנוסף
  הבוקר.
- היומן הזה (הוספה בסוף בלבד).
- לא נגעתי ב-`supply.ts`, `supply-github.ts`, `scripts/algora-supply.ts`, `requiredStacks`, `portfolio.ts`, `SKILL.md`, קבצי
  owner-steps, ה-PDF, הפסיקות, `MISSION.md`, `CLAUDE.md` או קבצי הלולאה. `git diff --stat 5c4bad0 HEAD` עליהם ריק.

## 4. החלטות והנחות משמעותיות

- **ממצא 1: תוקן**, ברשימה לבנה על גרף הייבוא כולו ולא על שני קבצים בשמם. קובץ שייכנס לגרף בעתיד ייבדק בלי לעדכן את הבדיקה.
- **ממצא 2: תוקן, וזו סטייה מהטקסט המילולי של הפסיקה.** הקבוע של §9 סעיף 8(a) הוא אמצעי. ההכרעה עצמה (§3.7, וטבלת §4: "or a
  translation of text") היא לדלג על באונטי תרגום. התבנית החדשה היא על-קבוצה של הקבוע של הפסיקה: כל שבע הצורות שלה עדיין
  נתפסות (נבדק ב-node). ה-thread הראשי יכול לבטל אותה ב-revert של commit אחד.
  **דחיתי חלק מההצעה של הסוקר:** בלי `translators?`. המילה הזו גם שם של רכיב קוד (מתרגם בקשות בפרוקסי). באונטי באג כזה עם
  מחסנית tests בלבד היה נדלג, והפירוט שלו היה אומר "text only" על עבודת קוד, כלומר ממצא 4 בהרחבה. `l10n` נכנס, כי הוא קיצור של
  localization עצמו, והוא תווית נפוצה.
- **ממצא 3: תוקן** (בדיקות בלבד; הקוד כבר עשה את הנכון).
- **ממצא 4: התיקון נדחה, והפשרה נרשמה ונעוצה בבדיקה.** "אפשרות B" של הסוקר מפעילה את ענף ה-docs רק כשאין מחסנית מלבד docs.
  היא הייתה מכניסה README-typo שהקריטריונים שלו אומרים "the docs test suite still passes" (מחסניות docs ו-tests), והתוצר שלו
  טקסט בלבד. רוב הבאונטי שהם טקסט בלבד מזכירים test suite בקריטריונים, וכלל 4 דורש קריטריון בר-בדיקה. התאמת מחסניות לא
  יכולה להבדיל בין שני המקרים. §3.0(ii) של הפסיקה בוחר בדילוג ב-₪0 על פני הכנסת עבודת טקסט, וגם היום אין כאן הפסד: הקו חסום
  על צעד 7 ועל שעון השבוע הרביעי (`selectBounties`, כלל 10).
  המחיר: באג קוד בלי שפה שמוזכרת, שגם אומר "update the docs" ו-"add a regression test", נדלג, והפירוט שלו מגזים ב-"text only".
  צמצום הכלל הוא החלטה ברמת פסיקה (תור Fable), לא של מתקן. הבדיקה החדשה הורגת את אפשרות B (מוטציה D4), כך שצמצום עתידי לא
  יעבור בשקט.
- **ממצא 5: תוקן**, תוספות בלבד מול `5c4bad0`. נבדק ב-grep: `MISSION.md` ו-`OWNER_STEPS.he.md` לא השתנו מאז `5c4bad0`.
  `:432-433` ו-`:440` מכילים את המשפטים, ובעמוד יש 0 הופעות של "פעם בשנה".
- **ממצא 6: תוקן.** כלל 11 נכנס לרשימה בראש הקובץ (שם הכלל, המקור, והעובדה שהמונה לא עובר דרכו), וכלל 5 מוגבל. המספור של
  הרשימה (1-11) נפרד ממספור השלבים בהערות של `scoreBounty` ("8a").

## 5. שגיאות וניסיונות שנכשלו

- אין שגיאות בעבודה עצמה. שני האדומים בקומיט הבדיקות היו מתוכננים, ונעשו ירוקים בקומיט הבא.
- הקריאה הראשונה של `mut.json` השתמשה בשמות שדות לא נכונים (`verdict`/`result` במקום `status`), אבל ה-tail הספיק כדי לראות
  איזו בדיקה הרגה כל מוטציה.

## 6. בדיקות ופעולות ולידציה

- **לפני התיקון:** `npx vitest run src/__tests__/revenue/bounties-intake.test.ts`, יציאה 1, 2 נכשלו ו-66 עברו (ממצא 2, ממצא 6).
- **אחרי התיקון:** intake, bounties-supply ו-owner-steps יחד, יציאה 0, 198/198.
- **`scripts/verify.sh src/__tests__/revenue`:** יציאה 0. typecheck יציאה 0; tests יציאה 0, 71 קבצים, 2344 עברו ו-1 דולג.
  "verify: passed".
- **`node scripts/freeze-capture.mjs --cited`:** יציאה 0, "0 citation(s) by line of an active capture".
- **`node scripts/mutate.mjs --plan …`:** יציאה 0. שני ה-baselines יציאה 0. 9 הוחלו, 9 נהרגו, 0 שרדו:

  | id | מוטציה | תוצאה | נהרגה ע"י |
  |---|---|---|---|
  | D1a | V1 של הסוקר: `supply.ts` מייבא `selectBounties` ומייצא אותו | killed | שמירת המונה |
  | D1b | `supply.ts` מייבא שם לא אסור (`deriveBountyFloor`), כך שרק הרשימה הלבנה תופסת | killed | שמירת המונה |
  | D1c | `supply-github.ts` מייבא את ה-intake כ-namespace | killed | שמירת המונה |
  | D1d | `scripts/algora-supply.ts` מגיע ל-barrel של bounties | killed | שמירת המונה |
  | D2 | התבנית חוזרת לקבוע המילולי של הפסיקה | killed | צורות הנטייה ו-l10n |
  | D3a | V2: התבנית נבדקת על הכותרת בלבד | killed | הקלט שמילת התרגום שלו בגוף |
  | D3b | V3: האיות הבריטי הוסר (`locali[sz]` → `localiz`) | killed | "Localise …" |
  | D4 | אפשרות B שנדחתה: ענף ה-docs רק כש-docs הוא המחסנית היחידה | killed | README-typo עם test suite |
  | D6 | כלל 11 מאבד את שמו ברשימה בראש הקובץ | killed | בדיקת רשימת הכללים |

  לממצא 5 אין מוטציה: אף בדיקה לא קוראת פתק היסטורי. בדיקה שנועצת מספרי שורות ב-`MISSION.md` הייתה נשברת בכל עריכה של
  MISSION. הוא אומת ב-grep (סעיף 4).
- **קבצים אסורים:** `git diff --stat 5c4bad0 HEAD` על owner-steps, `OWNER_STEPS.he.md`, ה-PDF, `supply.ts`,
  `supply-github.ts`, `algora-supply.ts`, `MISSION.md`, `CLAUDE.md`, קבצי הלולאה ו-`research/channel-loop/` ריק.
- **פרט מזהה של הבעלים:** לא נכתב בשום קובץ ובשום הודעת commit.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **שמירת גרף ייבוא:** ההליכה על הייבוא היחסי מקובץ כניסה, עם רשימה לבנה בגבול, כתובה עכשיו בתוך בדיקה אחת. אותו דפוס שומר
  על כל "המונה לא נוגע ב-X" עתידי, ועוזר קטן ב-`src/__tests__/` (`importGraph(entry, boundary)`) היה חוסך לכתוב אותו מחדש.
- **החלפה מדויקת בקוד מ-Bash:** כתבתי עוזר החלפה-פעם-אחת בתיקיית scratch. `loop-edit.mjs` מכסה רק קבצי לולאה, ולכן לקוד
  ולפתקים אין כלי מקביל שמסרב כשהטקסט לא נמצא בדיוק פעם אחת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **קריאת הפסיקה:** ארבעה מקטעים ב-`sed`, כשה-grep הראשון כבר הצביע על השורות. קריאה אחת ממוקדת הייתה מספיקה.
- **פענוח `mut.json`:** קריאה אחת מיותרת בשמות שדות לא נכונים (סעיף 5).
- **רשימת המשימות הארוכה שהמערכת הזכירה שלוש פעמים:** היא שייכת ל-thread הראשי, ולא נגעתי בה.

## תוספת 5.10: נוסח הפירוט של `writing-or-translation-only` (מתקן Opus, אותו worktree)

- **מה השתנה:** המשפט הראשון של ה-detail ב-`scoreBounty` הוא עכשיו "No code stack matched and the bounty reads as documentation or translation work (documentation, README, changelog, typo, or a translation)."; שאר המחרוזת (reg 6א(1), הלימב השני של reg 13(1), הפניית הפסיקה) לא השתנה, וההערה ליד `TRANSLATION_PATTERN` שציטטה "text only" תוקנה.
- **למה:** זו ההכרעה של ה-thread הראשי על ממצא 4 של הסקירה: ההתנהגות נשמרת (דילוג שמרני, ובדיקת הפשרה נשארת), אבל הנימוק לא טוען את מה שהכלל לא יכול לדעת, כי באג קוד באתר תיעוד (מחסנית docs בלבד) נדלג גם הוא; הדפוס הרחב של ממצא 2 (צורות הנטייה ו-`l10n`) התקבל כמו שהוא. הנוסח הישן עדיין כתוב מילולית ב-§9 סעיף 8 של הפסיקה, שלא נערכה.
- **בדיקות:** test-first: שתי בדיקות נועצות את פתיחת המשפט החדש; לפני השינוי יציאה 1 (2 נכשלו, 66 עברו), אחריו intake ו-supply יציאה 0 (123/123), `scripts/verify.sh` יציאה 0 (2344 עברו, 1 דולג), ו-grep לא מוצא את המשפט הישן בקוד או בבדיקות.
