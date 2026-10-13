# סבב 77 (13.10.2026) — שרשרת B של הפסיקה על שורה 32: מכירת Gumroad ביד נושאת את הזמן של Gumroad, ו-place-gumroad-sale (בונה Opus)

ענף `build/tick77-place`, worktree מבוסס על `8c4fba5` (`origin/claude/new-session-j071dx`; הפסיקה
`research/channel-loop/RULING-2026-10-13-gumroad-refund-reread.md` ו-`gumroadHandRefundRefusal` ב-`src/revenue/ledger.ts`
קיימים). קומיטים: `649c313` (הבדיקות לבדן, נכשלות על הבסיס), `7c82230` (הקוד), `51e091d` (רשומות המוטציות, והעברת שלב
ה-workflow לפני sync-portfolio), `79d97e5` (בדיקה ישירה של ה-trim, אחרי ש-T77-L6 שרד), והקומיט של שורות ה-README של
המוטציות והיומן הזה. שרשרת A (Opus מקבילה, worktree משלה)
מקפלת את חצי הפסיקה האחר: `gumroad.ts`, `heartbeat.ts`, `types.ts`, `gumroad-connector.test.ts` ו-`gumroad.json`. לא נגעתי
באף אחד מהם.

## 1. מה המשתמש ביקש

החוט הראשי (סקריפט workflow של סבב 77) ביקש לקפל את Folds 5, 6, 7 (אופציונלי: רק אם קטן ולקריאה בלבד) ו-10 של הפסיקה; מ-Fold 8
את מקרה (i) ב-`ledger.test.ts`, את מקרי ה-CLI ב-`colony-cli.test.ts` (record ו-place-gumroad-sale) ואת מקרה (g) בקובץ חדש
`src/__tests__/revenue/gumroad-place.test.ts` (דרך `runLedgerSync` האמיתי והאינדקס המזויף של סבב 74, מול הקריאה החוזרת של
היום, כך שיחזיק גם לפני וגם אחרי שינוי הקצב של שרשרת A); מ-Fold 9 את T77-L1 עד L3 ב-`ledger.json` ואת T77-C1 עד C5 ו-T77-T1
ב-`colony.json`. בדיקות קודם, בקומיט נפרד, נכשלות על הבסיס; מוטציות בתוך `scripts/sim-tree.sh`; `scripts/verify.sh` ממוקד
ומלא; יומן; מחיקת תיקיית ה-scratch.

## 2. הפעולות המרכזיות שביצעתי

**קריאה:** הפסיקה כולה (§1-§6, "What this does not decide", REOPEN, וכל fold בתחום שלי); יומני סבב 74 ו-76; בקוד ב-HEAD:
`ledger.ts` (`recordLedgerEntry`, `gumroadHandRefundRefusal`, `gumroadSaleFamily`), `tools.ts` (`revenue_record`),
`scripts/colony.ts` (`record`, `verify-gumroad`, `rendersOnly`, USAGE), `gumroad-verify.ts`, `connectors/gumroad.ts`
(`listGumroadSalesSince`, `MAX_LEDGER_SYNC_PAGES` ו-`shiftDay` מיוצאים; `isCursorDay` לא מיוצא), `heartbeat.ts:287-403`,
`.github/workflows/colony.yml`, והפיקסצ'רים של הבדיקות הקיימות שרושמות מכירת Gumroad ביד.

**Fold 5 (§3 item 1) — השומר על הזמן:**
- `gumroadHandSaleRefusal` ב-`src/revenue/ledger.ts:607-618`, ליד `gumroadHandRefundRefusal`: `null` אלא אם `kind === "sale"`
  ו-`source.trim().toLowerCase() === "gumroad"`; אז, כש-`Date.parse(occurredAt ?? "")` הוא NaN (חסר, ריק או לא זמן), הסירוב
  במילים של הפסיקה, בלי מזהה. שאר המקורות והסוגים נשארים עם ברירת המחדל "עכשיו".
- `revenue_record` (`src/revenue/tools.ts:207-210`) ו-`colony.ts record` (`scripts/colony.ts:381-382`) קוראים לו לפני השומר
  על ההחזר ולפני `recordLedgerEntry`, כך שסירוב לא כותב דבר. משפט אחד לכל טקסט: תיאור הכלי (`tools.ts:166`), טקסט הפרמטר
  `occurred_at` (`tools.ts:178`), ושורת `--occurred-at` ב-USAGE (`colony.ts:156-157`).

**Fold 6 (§3 item 3) — `place-gumroad-sale`:**
- `src/revenue/gumroad-place.ts` (חדש): `placeGumroadSale(db, { id, listedFrom, token, fetchImpl, nowIso })`. הסדר: בלי אסימון —
  `not_configured`, exit 2, בלי בקשה; `id` חייב להיות `sha256:` ו-64 ספרות hex בלי סיומת (לא מודפס כשאינו); `listedFrom` יום
  אמיתי עד מחר ב-UTC (`isListingDay`, שכפול של `isCursorDay`); בספר חייבת להיות בדיוק שורת מכירה אחת של gumroad שהמזהה השמור
  שלה הוא `id` (שורה מלפני פסיקת ה-digest נמצאת לפי ה-digest), אחרת exit 3 בלי בקשה; רשימה דרך `listGumroadSalesSince` עם
  `MAX_LEDGER_SYNC_PAGES` (רשימה שנעצרה — exit 3, לא נכתב דבר); בדיוק מכירה רשומה אחת שה-digest שלה הוא `id`, עם
  `created_at` קריא, אחרת exit 3; אם היום כבר זהה — exit 0 ולא נכתב דבר; אחרת טרנזקציה אחת:
  `UPDATE revenue_ledger SET occurred_at = ? WHERE source = 'gumroad' AND external_id = ?` לכל שורה במשפחה (המכירה, `:refund`,
  `:fee`, גם בצורתן הגולמית), ל-`new Date(created_at).toISOString()` — הצורה שבה המחבר רושם. מודפסים `placed <stored id>:
  <old day> → <new day>` ושורת "rows moved" עם צורות שמורות וסוגים בלבד.
- `scripts/colony.ts`: הפקודה `place-gumroad-sale` (`:413-426`), האפשרויות `--id` ו-`--listed-from` ב-`parseArgs`, הפקודה
  ואפשרויותיה ב-USAGE (`:107-115`, `:159-163`); `rendersOnly` לא השתנה (הפקודה כותבת).
- `.github/workflows/colony.yml`: קלט `workflow_dispatch` בשם `place_sale` (string, ברירת מחדל ריקה, עם התיאור של הפסיקה),
  ושלב "Place a hand-booked Gumroad sale..." (`:64-83`) שרץ רק כש-`github.event_name == 'workflow_dispatch' && inputs.place_sale
  != ''`, בעבודה שמחזיקה את האסימון, לפני ה-tick; הקלט עובר דרך `env` (`PLACE_SALE`) ונקרא ב-`read -r`, אף ביטוי `${{ }}`
  לא נכנס לטקסט הסקריפט; שתי מילים בדיוק, אחרת exit 1; exit 2 או 3 של הפקודה מכשילים את הריצה לפני ה-tick. ריצה מתוזמנת
  לא מריצה את השלב ולא השתנה בה דבר.

**Fold 7 (אופציונלי, לקריאה בלבד) — נבנה:** `verifyGumroadLedger` מקבל `since` (`src/revenue/gumroad-verify.ts:109-114`):
יום מוקדם מהטווח מתחיל את הרשימה בו; יום מאוחר ממנו לא נלקח (כל שורה לפניו הייתה נקראת "unexplained"). `colony.ts
verify-gumroad --since <day>` בודק את היום לפני כל בקשה (exit 1) ומעביר אותו (`colony.ts:400-405`); ה-help אומר למה ("the
reach a hand-booked sale may lie before").

**Fold 10 — מסמכים:** `skills/revenue-il-biz-tools/SKILL.md:69-70` ("refunds too: within the hour for the latest sale, within a
day for older ones (RULING-2026-10-13)"); `products/il-biz-tools/README.md:744-746` (החזר מאוחר נקרא פעם ביום, בסנכרון השעתי
הראשון של כל יום UTC); `docs/CHAIN_OF_COMMAND.md:31` ("a refund or fee is booked on its sale's line on every path"). `pnpm -s
typecheck` אחריהם: exit 0.

**בדיקות (39 חדשות, נספרו מה-diff):** 8 ב-`ledger.test.ts` (מקרה i), 13 ב-`colony-cli.test.ts` (10 של record,
place-gumroad-sale ו-verify-gumroad --since דרך ה-CLI האמיתי על עותקים של מסד זמני; 3 של שלב ה-workflow, כולל הרצה של
הסקריפט של השלב עצמו עם pnpm מדומה), 18 ב-`gumroad-place.test.ts` (3 של מקרה g, 12 של `placeGumroadSale`, 3 של `since`).

**מוטציות:** `ledger.json` קיבל T77-L1 עד L6; `colony.json` קיבל T77-T1, T2, T77-C1 עד C12, T77-Y1 ו-T77-V1 עד V4. הרשומות
נוספו כטקסט לפני ה-`]` הסוגר (סקריפט Python שבודק שה-JSON החדש שווה לישן ועוד הרשומות); הקיימות נשארו בייט לבייט.

## 3. קבצים/מערכות ששונו

- `src/revenue/ledger.ts` — `gumroadHandSaleRefusal` (חדש).
- `src/revenue/tools.ts` — הקריאה לשומר, משפט בתיאור ובטקסט `occurred_at`.
- `scripts/colony.ts` — הקריאה לשומר ב-`record`, `place-gumroad-sale`, `--id`, `--listed-from`, `--since`, USAGE.
- `src/revenue/gumroad-place.ts` (חדש).
- `src/revenue/gumroad-verify.ts` — `since` (Fold 7 בלבד).
- `.github/workflows/colony.yml` — הקלט `place_sale` והשלב.
- `skills/revenue-il-biz-tools/SKILL.md`, `products/il-biz-tools/README.md`, `docs/CHAIN_OF_COMMAND.md`.
- `src/__tests__/revenue/ledger.test.ts`, `colony-cli.test.ts`, `gumroad-place.test.ts` (חדש), `loop.test.ts` (פיקסצ'ר אחד).
- `src/__tests__/revenue/mutations/ledger.json` (48 רשומות, היו 42), `colony.json` (89, היו 70), `README.md` (השורות של שתי
  התוכניות בשתי הטבלאות).
- היומן הזה.
- **לא שונו:** `gumroad.ts`, `heartbeat.ts`, `types.ts`, `gumroad-connector.test.ts`, `gumroad.json` (של שרשרת A);
  `logs/CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, פסיקות וישיבות, `research/measurements/*`,
  `state/colony/`, אף קובץ קיים תחת `logs/`. לא git fetch/pull/push/stash/checkout, לא gh, לא רשת, לא Gumroad אמיתי.

**pins ופיקסצ'רים ששונו (אף assertion לא נמחק או רוכך):**
- `ledger.test.ts`, ה-describe של סבב 76: ה-`record` שלו מקבל `occurred_at: "2026-10-01T10:00:00.000Z"` כברירת מחדל — מכירות
  Gumroad שהוא רושם ביד נדחות עכשיו בלי זמן.
- `colony-cli.test.ts`, ה-describe של סבב 76: ה-`record` שלו מעביר `--occurred-at 2026-10-01T10:00:00.000Z`, מאותה סיבה.
- `loop.test.ts:268`: ה-args של "revenue_record books a raw gumroad id as its digest" מקבלים `occurred_at` (הקובץ מחוץ לרשימת
  הקבצים שלי; בלי זה הבדיקה נכשלת, והשינוי בפיקסצ'ר בלבד).
- אף טקסט מוצמד קיים לא השתנה: התיאור, טקסט `occurred_at` ו-USAGE רק קיבלו משפט.

## 4. החלטות והנחות משמעותיות

1. **קודי יציאה שהפסיקה לא קבעה:** ארגומנט פסול (`--id` שאינו צורה שמורה, `--listed-from` שאינו יום) — exit 1 דרך `fail`, כמו
   כל ארגומנט פסול ב-CLI; אין שורת מכירה אחת בספר — exit 3 ("not placed"), לפני כל בקשה. הסדר הוא של הפסיקה: אסימון, id,
   יום, הספר, הרשימה.
2. **המזהה הנתון לא מודפס כשהוא לא בצורה השמורה**: מזהה גולמי שהוקלד בטעות היה נכנס ללוג של ה-workflow.
3. **`isCursorDay` לא מיוצא** מ-`gumroad.ts` (של שרשרת A), ולכן שוכפל כ-`isListingDay` ב-`gumroad-place.ts`, עם הערה שאומרת זאת.
4. **מיקום השלב ב-workflow: אחרי ההתקנה ולפני sync-portfolio** (ולא בין sync-portfolio ל-tick): T63-W4 ב-`ledger.json` מחליף
   את סדר שני השלבים הצמודים, וה-find שלו כולל את שניהם. לפני ה-tick, בעבודה שמחזיקה את האסימון — כמו שהפסיקה דורשת. הבדיקה
   שלי עודכנה בהתאם (קומיט `51e091d`) לפני ריצת המוטציות.
5. **"היום כבר זהה"** נמדד על שורת המכירה, ביום UTC ש-`Date.parse` נותן (כמו שהקריאה החוזרת קוראת אותו); אז לא נכתב דבר, גם
   אם השעה שונה או ששורות המשפחה ביום אחר.
6. **שורת "rows moved"** מודפסת עם הצורות השמורות והסוגים — "the family rows moved" של הפסיקה — ושום דבר אחר.
7. **Fold 7: `since` רק מרחיב.** יום מאוחר מהטווח לא נלקח, אחרת כל שורה שלפניו נראית "unexplained". המימוש בונה את `days` מחדש
   ומשאיר את השורה `const after = shiftDay(days[0] ?? ...)` בייט לבייט, כי T69-V6 ו-T69-V9 ב-`gumroad.json` (של שרשרת A) מחפשים
   אותה; הניסיון הראשון שינה אותה ושבר את שתיהן (סעיף 5).
8. **מקרה (g) מחזיק תחת שני הקצבים:** הוא בודק רק את תחילת שורת ה-unlisted (המזהה השמור, היום בספר, ה-`after`) ולא את העצה
   שבסופה (Fold 2 של שרשרת A משנה אותה), והסנכרון שאחרי ההצבה הוא הראשון של יום UTC חדש — כך הקריאה החוזרת רצה גם תחת קצב פעם
   ביום. גם הסנכרון הנוסף באותו יום בודק רק `errors` (בלי ספירת בקשות, שהיא שונה בין הקצבים).
9. **המסמכים (Fold 10)** מתארים את הקצב של שרשרת A (פעם ביום); הם נכונים אחרי ששתי השרשראות ממוזגות.
10. **T77-C5** (כתיבה על רשימה שנעצרה): ה-fixture המשותף של ה-CLI מסרב לכל בקשה, כך שעם עמוד 1 מסורב אין מה לכתוב; את
    הכתיבה הורגת הבדיקה של `gumroad-place.test.ts` עם סירוב בעמוד 2 אחרי שעמוד 1 החזיר את המכירה. בדיקת ה-CLI נכשלת גם היא
    (המילים "refused (HTTP 500, page 1)" נעלמות).

**שאלות פתוחות לחוט הראשי (לא הוכרעו כאן):**
1. **שורת unlisted "נישאת" אחרי הצבה, תחת הקצב של שרשרת A.** אם ה-dispatch רץ אחרי הקריאה החוזרת של אותו יום UTC, הסנכרונים
   שאחריו באותו יום אומרים שוב את השורה שנשמרה ב-kv (היום הישן בספר) עד הסנכרון הראשון של היום הבא — אלא אם הקוד של שרשרת A
   בודק שהמכירה עדיין מתוארכת לאותו יום. כדאי שהסוקר של שתי השרשראות יבדוק את זה אחרי המיזוג (מקרה g כאן בודק רק את היום הבא).
2. **שורות `:refund`/`:fee` שנרשמו ביד ביום אחר מהמכירה** זזות עם המכירה ליום של Gumroad (כך הפסיקה אומרת: המחבר מתארך אותן
   במכירה). כשהמכירה כבר ביום של Gumroad, הן לא זזות (החלטה 5). אם זה לא רצוי — שאלה לפסיקה.
3. **הצבה כשהמושבה כבויה** (`kv revenue.enabled = 0`): הפקודה לא בודקת את זה; הפסיקה לא אמרה.
4. **`verifyGumroadLedger({ since })` עם יום פסול** זורק (מ-`shiftDay`) כשקוראים לו ישירות; ה-CLI בודק לפני כן. אין קורא אחר היום.
5. **התנגשות צפויה במיזוג:** שרשרת A משנה את שורת `gumroad.json` ב-`mutations/README.md` (שורות 15 ו-82), ואני את שורות
   `ledger.json` ו-`colony.json` (16 ו-12, 83 ו-84) — שורות צמודות, כך ש-git עשוי לסמן התנגשות שצריך לפתור ביד (לשמור את שתיהן).

## 5. שגיאות וניסיונות שנכשלו

- הסקריפט המדומה של pnpm בבדיקת ה-workflow נכתב תחילה עם רשימת הפרמטרים המלאה של bash, שמכילה את סימן ה-at; ה-grep על ה-diff
  תפס אותו לפני הקומיט. הוחלף ב-`for a; do ... done`.
- `since` נכתב תחילה כשינוי של שורת `const after` ב-`gumroad-verify.ts`; `mutate.mjs --check` על כל התוכניות הראה ש-T69-V6
  ו-T69-V9 ב-`gumroad.json` לא חלות. נכתב מחדש כך שהשורה נשארת כמו שהיא.
- השלב ב-workflow הוכנס תחילה בין sync-portfolio ל-tick; `--check` על `ledger.json` הראה ש-T63-W4 לא חל. הועבר לפני
  sync-portfolio (החלטה 4).
- `sleep` לפני בדיקת התקדמות המוטציות נחסם על ידי הסביבה; חיכיתי בלולאת `until` ברקע.
- T77-L6 שרד בריצה הראשונה של `ledger.json` (סעיף 6), ותיקון הבדיקה דרש הרצה שנייה של שתי התוכניות (כ-6 דקות נוספות).

## 6. בדיקות ופעולות ולידציה

- **נכשל קודם (`649c313`, קוד הבסיס):** `npx vitest run` על `ledger.test.ts`, `colony-cli.test.ts`, `gumroad-place.test.ts`,
  `loop.test.ts`: exit 1; Test Files 3 failed | 1 passed (4); Tests 18 failed | 100 passed (118); `gumroad-place.test.ts` לא
  נטען (המודול חסר), ולכן 18 הבדיקות שלו לא בספירה. בבסיס עברו, כמצופה, בדיקות הרגרסיה של (i): stripe ו-manual בלי זמן,
  ו-cost/subscription/refund של gumroad בלי זמן, ו"with Gumroad's created_at it is recorded".
- **אחרי הקוד:** אותם ארבעה קבצים — exit 0, 136 passed (136); `pnpm -s typecheck` exit 0.
- **verify ממוקד:** `VERIFY_OUT=.../b-scratch/verify scripts/verify.sh src/__tests__/revenue/ledger.test.ts
  src/__tests__/revenue/colony-cli.test.ts src/__tests__/revenue/gumroad-place.test.ts src/__tests__/revenue/frozen-citations.test.ts`
  על `51e091d`: exit 0; typecheck 0; tests 0, 4 קבצים, 140 passed; 51 שניות. שוב על העץ הסופי (אחרי `79d97e5`, ה-README והיומן): exit 0; typecheck 0;
  tests 0, 4 קבצים, 140 passed; 37 שניות. `mutation-plans.test.ts` על העץ הסופי: exit 0, 56 passed.
- **verify מלא:** `VERIFY_OUT=.../b-scratch/verify-full scripts/verify.sh` (typecheck + `src/__tests__/revenue`) על `79d97e5`:
  exit 0; typecheck 0; tests 0, 86 קבצים, 3294 passed | 2 skipped (3296); 206 שניות, ליד ריצת `ledger.json`. 3255 של סבב 76
  ועוד 39 הבדיקות החדשות; שתי ההשמטות הן אותן שתיים מקודם.
- **מוטציות**, כל תוכנית ב-`scripts/sim-tree.sh --dir .../b-scratch/sim -- node scripts/mutate.mjs --plan ...`, אחת אחרי השנייה:
  - ריצה ראשונה של `ledger.json` על `51e091d`: exit 1, 48 applied: 47 killed, 1 survived (T77-L6, ה-trim של המקור), 365 שניות.
    הכלי עושה trim למקור לפני השומר, כך שרווחים נראים רק דרך הפונקציה עצמה, ש-`colony.ts record` קורא לה עם `--source` כפי
    שניתן. נוספה בדיקה ישירה (`79d97e5`). sim-tree שמר את העץ אחרי הכישלון, ולכן הריצה הראשונה של `colony.json` נעצרה מיד
    (`--dir ... already exists`, exit 2, 0 שניות); העץ נמחק בפקודה ש-sim-tree הדפיס, בנתיב המלא.
  - `ledger.json` על `79d97e5`: exit 0, 48 applied: 48 killed, 0 survived, 452 שניות (ליד ה-verify המלא ב-206 השניות הראשונות;
    שלוש ריצות בסיס 2.7, 4.1 ו-36.5 שניות; רשומות T77-L כ-2.9-3.5 שניות).
  - `colony.json` על `79d97e5`: exit 0, 89 applied: 89 killed, 0 survived, 1427 שניות לבד (עשר ריצות בסיס 2.3-36.2 שניות;
    `colony-cli.test.ts` כ-28-31 שניות לריצה עם הבדיקות החדשות; T77-C6 עד C11 ו-T77-V1, V2 כ-2.3-2.8 שניות). כל 19 רשומות T77
    נהרגו.
  - sim-tree מחק את העץ אחרי כל ריצה עוברת. ה-README של המוטציות עודכן בשורות `ledger.json` ו-`colony.json`, בשתי הטבלאות.
- `mutate.mjs --check`: `ledger.json` 48 of 48, `colony.json` 89 of 89; וגם על כל שאר התוכניות (כולל `gumroad.json` 96 of 96)
  — כולן חלות על העץ שלי.
- **הבדיקות של "Checks before done" בתחום שלי:** `grep -rn -F "UPDATE revenue_ledger" src/ scripts/` מדפיס אתר אחד,
  `src/revenue/gumroad-place.ts:161`; ה-diff כולו נקי מתבנית השם של הבעלים (שני חצאים מחוברים) ומסימן ה-at (0 ו-0 שורות שנוספו,
  בכל קומיט); קובץ הפסיקה עצמו נקי משניהם (0 ו-0).
- בדיקות ה-CLI יוצרות תיקייה זמנית אחת (`mkdtempSync`) ומוחקות אותה ב-`afterAll`; בדיקת ה-workflow מוחקת את שלה ב-`finally`;
  בדיקות `gumroad-place.test.ts` על מסד בזיכרון.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **הוספת רשומות לתוכנית מוטציות** — פעם רביעית סקריפט Python חד-פעמי שמוסיף טקסט לפני ה-`]` ובודק שוויון JSON.
  `mutate.mjs --append <entries.json>` (כתיבה בסגנון הקובץ ו-`--check` מיד) נחוץ.
- **בדיקת find של תוכניות של שרשרת אחרת** — הרצתי `--check --allow-dirty` על כל התוכניות בלולאה כדי לגלות ששיניתי שורה
  ש-`gumroad.json` מחפש. `mutate.mjs --check-all` (כל התוכניות, שורת סיכום אחת) היה חוסך את הלולאה.
- **ספירת בדיקות מה-diff** — שוב `grep -cE '^\+\s+it\('` לכל קובץ.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה כולה (561 שורות) — הכרחית, אבל רוב §1, §2 ו-§4 שייכים לשרשרת A.
- קריאת שני היומנים הקודמים במלואם (74 ו-76) — חלקית הכרחית (הפיקסצ'רים, ה-fixture של ה-CLI); סעיפי התיקונים שלהם נקראו בלי צורך.
- שתי ריצות `--check` חוזרות אחרי שגיאות שאפשר היה לצפות מראש: שורת `after` ב-verify והשלב ב-workflow שנכנס בין שני שלבים
  ש-T63-W4 מחפש יחד. קריאה של ה-finds של הקבצים לפני העריכה הייתה חוסכת את שתיהן.
- ההמתנה לתוכנית `colony.json` (89 רשומות, רובן על `colony-cli.test.ts`, שלוקח כ-35 שניות לריצה עם הבדיקות החדשות).

## תיקונים אחרי הסקירה

מתקן Opus, על אותו ענף ואותו worktree. `git log HEAD..origin/claude/new-session-j071dx` הדפיס קומיט אחד (`6985570`, קבצי
הלולאה של הישיבה), ולכן בוצע `merge --no-ff` של הבסיס (`bde074a`, "merge base"); הוא הביא רק את `logs/CHANNEL_LOOP.md`
ו-`logs/FABLE_QUEUE.md`, ולא נגעתי בהם. בסקירה לא היה ממצא חוסם; היו בה שני ממצאי "fix" וארבע הערות "note". שני ה-fix
יושמו; אף הערה לא יושמה (הסבר בסוף הסעיף). קומיטים: `794faed` (הבדיקות לבדן), `e8b68bd` (התיקון ורשומות המוטציות), והקומיט
של היומן ושורות ה-README.

**fix 1, מסנן המקור ב-UPDATE של ההצבה (השורד R-X1 של הסוקר).** יושם לפי טקסט ה-fix של הסקירה. הבדיקה הקיימת "no other row
moves" לא יכלה לתפוס את המוטציה: שורת ה-manual שלה היא `sha256:<hex>:refund`, ואילו החזר ה-Gumroad שלידה נשמר בצורתו הגולמית,
כך שאף יעד של ה-UPDATE לא היה שווה לשורה של מקור אחר. נוספה ל-`gumroad-place.test.ts` בדיקה: מכירת Gumroad שנרשמה ביד, ה-`:fee`
שלה וה-`:refund` שלה בצורה השמורה, ולידן שתי שורות manual שה-`external_id` שלהן הוא בדיוק המזהה השמור של המכירה ושל ההחזר.
אחרי ההצבה שלוש שורות ה-Gumroad על זמן Gumroad, ושתי שורות ה-manual נשארו בזמנן. הבדיקה עוברת על הענף; תפקידה להרוג את
המוטציה. ב-`colony.json` נוספה T77R-C1 (ה-UPDATE בלי `source = 'gumroad' AND`), ונהרגה.

**fix 2, "כבר על היום של Gumroad" לפי היום ש-Date.parse נותן.** יושם לפי טקסט ה-fix של הסקירה, ובדקתי שהוא נכון: `sumWindow`
משווה את הטקסט, ו-`"2026-02-31"` (שהשומר מקבל, כי Date.parse קורא אותו כ-2026-03-03) לא נספר באף חודש. מצאתי שזה רחב יותר
מהדוגמה של הסקירה: גם `"2026-03-03 05:00"` (רווח לפני `T`) וגם `"2026-03-03T23:59:59Z"` (בלי אלפיות) נופלים מחוץ לחלון של
היום שלהם עצמו. לכן הקריטריון הוא הצורה של `toISOString` בדיוק, כפי שהסקירה הציעה, ולא רק השוואת קידומת היום.
- `placeGumroadSale` רואה מכירה כמוצבת רק כשהטקסט השמור הוא בצורה שהמחבר רושם (`inConnectorForm`: Date.parse קורא אותו
  ו-`toISOString` מחזיר אותו בדיוק) והיום שלו הוא היום של Gumroad. בכל מקרה אחר נכתב זמן Gumroad, למכירה ולמשפחה שלה.
- **סטייה קטנה מנוסח הפסיקה:** הפסיקה קובעת את השורה `placed ${id}: ${oldDay} → ${newDay}`. למכירה שהטקסט שלה אינו בצורת
  המחבר, היום הישן היה מודפס זהה לחדש ("2026-03-03 → 2026-03-03") ומטעה. לכן היום הישן נאמר כ-"a time not in the connector's
  form (read as 2026-03-03)". הטקסט כפי שהוקלד לא מודפס אף פעם (הוא הוקלד ביד; השומר מקבל כל טקסט ש-Date.parse קורא). שאר
  השורות ומבנה השורה כפי שהפסיקה קבעה.
- הבדיקה: שלוש מכירות, אחת לכל צורה, כולן ב-2026-03-03 לפי Gumroad. לפני ההצבה החלונות של פברואר, מרץ והיום 2026-03-03 סופרים
  0, 2, 0; אחרי ההצבה 0, 3, 3. כל אחת מקבלת `placed` עם השורות המדויקות, וריצה שנייה על הראשונה מחזירה `unchanged`. הטקסט
  המוקלד, המזהה הגולמי, הטוקן והכתובת לא מופיעים בשום שורה.
- נכשלה קודם: על העץ לפני התיקון (זהה ל-`794faed`), `npx vitest run src/__tests__/revenue/gumroad-place.test.ts` יצא 1,
  1 failed | 19 passed (20), עם `2026-02-31: expected { status: 'unchanged', … } to match object { status: 'placed', exitCode: 0 }`.
  אחרי התיקון: 20 passed, exit 0.
- מוטציות ב-`colony.json`: T77R-C2 (בדיקת הצורה הוסרה מתנאי "כבר מוצב") ו-T77R-C3 (היום הישן נאמר כיום בלבד). ה-find של
  T77-C7 עבר לשורת התנאי החדשה. שלושתן נהרגו.
- **מה לא שיניתי:** השומר `gumroadHandSaleRefusal` עדיין מקבל כל טקסט ש-Date.parse קורא (`"1"`, `"12"`, `"foo 1"`,
  `"2026-02-31"`), כפי שהפסיקה כתבה. הידוק שלו מעבר ל-Date.parse הוא החלטה של הפסיקה; נשאר שאלה פתוחה.

**pins ו-fixtures ששונו:** אין. אף assertion לא שונה או הוסר; נוספו שתי בדיקות (נספרו מה-diff: שני `it(` חדשים ב-
`gumroad-place.test.ts`, 0 בשאר הקבצים). שורת הודעה אחת חדשה ("a time not in the connector's form (read as <day>)") נוספה לנתיב
שלא היה מוצמד קודם; הבדיקה החדשה מצמידה אותה.

**הערות שלא יושמו (note):**
- הערה 3 (שורת ה-unlisted הישנה נשארת עד היום הבא ב-UTC אחרי הצבה באותו יום): לפי הסקירה, החלטה של ה-thread הראשי אחרי
  ה-merge של שתי השרשראות (ניקוי `revenue.gumroad_late_reread.last` בטרנזקציה של ההצבה, או סינון בענף ה-carried של שרשרת A).
  לא שיניתי דבר: המפתח שייך ל-`heartbeat.ts` של שרשרת A.
- הערה 4 (`loop.test.ts`): אין שינוי; תוצאה הכרחית של Fold 5, כפי שהסקירה כתבה.
- הערה 5 (GitHub מדפיס את ה-env וה-inputs של הצעד ביומן הריצה הציבורי; `read -r` לוקח רק את השורה הראשונה): לא יושם. נוסח
  ה-description של ה-input קבוע בפסיקה ומוצמד בבדיקה; שינוי שלו, או סירוב לקלט עם שורה חדשה, הם החלטות שהסקירה עצמה סימנה
  כלא נדרשות. נשאר פתוח.
- הערה 6 (`--since` מאוחר נבלע בשקט): לא יושם; ה-`after` בתוצאה כבר אומר מאיזה יום נקרא.

**בדיקות:**
- `colony.json` בתוך `scripts/sim-tree.sh --dir .../b-scratch/sim`, על `e8b68bd`: exit 0, 92 applied: 92 killed, 0 survived,
  1351 שניות (22 דקות ו-31 שניות), ליד ה-verify הממוקד בזמן ריצות הבסיס. עשר ריצות בסיס 2.1-30.0 שניות; רשומות
  `colony-cli.test.ts` כ-27-30 שניות, רשומות `gumroad-place.test.ts` בלבד כ-2.2-2.4 שניות. כל 22 רשומות T77 ו-T77R נהרגו.
  `--check` לפני הריצה: 92 of 92. sim-tree מחק את העץ אחרי הריצה העוברת. `ledger.json` לא השתנה ולא הורץ שוב (אף רשומה בו
  לא נוגעת ב-`gumroad-place.ts`).
- `scripts/verify.sh` ממוקד (ledger, colony-cli, gumroad-place, frozen-citations) עם `VERIFY_OUT` בתוך ה-scratch: exit 0,
  typecheck exit 0, 4 קבצים, 142 passed (142).
- `scripts/verify.sh` המלא (`src/__tests__/revenue`) עם `VERIFY_OUT` בתוך ה-scratch: exit 0, typecheck exit 0, 86 קבצים,
  3296 passed | 2 skipped (3298), כשתי דקות; שתי בדיקות יותר מהריצה המלאה של הבונה (3294), כמספר הבדיקות שנוספו.
- ה-diff כולו מאז `f0bd16c` נקי מתבנית השם (מחוברת בהקלדה) ומסימן ה-at: 0 ו-0 שורות שנוספו.

**שאלות פתוחות שנוספו:** הידוק השומר מעבר ל-Date.parse (fix 2); הערה 3 אחרי ה-merge; הערה 5.

**אסימונים ואוטומציה:** ההמתנה לתוכנית `colony.json` כולה (22 דקות) בשביל שלוש רשומות חדשות על קובץ אחד. ל-`mutate.mjs` אין
סינון לפי id; `--only <id,...>` היה בודק את שלוש הרשומות בכ-10 שניות לפני הריצה המלאה שההוראה דורשת. ניסיון ראשון לכתוב את
הרשומות ב-JSON יצא בהזחה של שש ובגרשיים כפולים מוברחים פעמיים; נכתב מחדש (שוב סקריפט Python חד-פעמי, כמו בסעיף 7).
