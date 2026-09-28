# 28.9.2026 — הכרעת הרצפות (שורות 8 ו-9) הוחלה בקוד

## 1. מה המשתמש ביקש
סוכן Opus בעץ עבודה מבודד קיבל מהסקריפט של זרימת העבודה: להחיל את סעיפי "Exact change (Opus)" של
`research/channel-loop/RULING-2026-09-28-floors.md` — שורה 8 (רצפת ההריגה כחלק מהיעד של הקו עצמו, `graceDays` 90,
`target_unset`, `policyForLine`, אתרי הקריאה, הבדיקות והמסמכים) ושורה 9 (il-biz-tools מתוכנן ב-₪0, `inferred`, גבול עליון
שנוי במחלוקת ₪400, `killFloorFraction` 0.5, `awaiting_setup → measuring`). בדיקות קודם, ואז קוד. קומיט אחד לשתי השורות.

## 2. הפעולות המרכזיות שביצעתי
- וידאתי את הבסיס: העץ התחיל על `b968711` (בסיס ישן, בלי קובצי ההכרעה). `git reset --hard claude/new-session-j071dx`
  → `e6c2469`, ו-`BASE_OK`.
- קישרתי `node_modules` (symlink לעותק הראשי; `.gitignore` מתעלם ממנו) והרצתי קו בסיס: 730/730 ירוק.
- כתבתי קודם את הבדיקות ב-`rules.test.ts`, `target-basis.test.ts`, `ledger.test.ts` וראיתי 12 כשלונות מהסיבות הנכונות.
- `types.ts`: `killFloorAgorot` נמחק; `killFloorFraction: 0.25`; `graceDays: 90`.
- `rules.ts`: `target_unset` → escalate לקו live בלי יעד; רצפה = `floor(target × fraction)`.
- `portfolio.ts`: `TargetBasis.killFloorFraction` (0.25 / 0.5 / 0.25 / 0.25), `policyForLine()`, il-biz-tools ב-₪0 עם
  `grade: "inferred"`, `contestedUpperBoundIls: 400`, בסיס חדש, קריטריוני הריגה חדשים, "UNTESTED: " בערוץ.
- `ledger.ts`: `LINE_TRANSITIONS.awaiting_setup` קיבל `measuring`.
- `heartbeat.ts` (3 קריאות) ו-`tools.ts` (קריאה אחת) עוברים דרך `policyForLine`.
- מסמכים: `docs/CHAIN_OF_COMMAND.md`, `docs/INCOME_PLAN.he.md`, `skills/revenue-command/SKILL.md` (הכלל החדש);
  הסכום המחויב ₪1,100 ב-`INCOME_PLAN.he.md`, `OWNER_STEPS.he.md`, `skills/revenue-il-biz-tools/SKILL.md`;
  רצפת התשלום ב-`skills/revenue-oss-bounties/SKILL.md`; הערה ישנה ב-`experiments.ts`.

## 3. קבצים/מערכות ששונו
`src/revenue/{types,rules,portfolio,ledger,heartbeat,tools,experiments}.ts`, `src/revenue/bounties/intake.ts`;
`src/__tests__/revenue/{rules,target-basis,ledger,loop,experiments,rails,bounties-intake}.test.ts`;
`docs/CHAIN_OF_COMMAND.md`, `docs/INCOME_PLAN.he.md`, `docs/OWNER_STEPS.he.md`;
`skills/revenue-command/SKILL.md`, `skills/revenue-il-biz-tools/SKILL.md`, `skills/revenue-oss-bounties/SKILL.md`.
ה-PDF של צעדי הבעלים לא נוצר מחדש בקומיט הזה — הוא נוצר פעם אחת בקומיט של הכרעת הבאונטי, שמשנה את אותו מסמך שוב.

## 4. החלטות והנחות משמעותיות
- **רצפת התשלום של הבאונטי זזה מ-₪37.50 ל-₪27.50 לשעה.** `deriveBountyFloor()` גוזרת אותה מהסכום המחויב
  (תיק ÷ (160 שעות × 0.25)), והסכום ירד מ-₪1,500 ל-₪1,100. שתי ההכרעות לא מזכירות את זה. הקוד מתועד כ"זז כשמספרי
  הדירקטוריון זזים", ויש בדיקה בשם "re-derives itself from the portfolio", אז נתתי לו לזוז ועדכנתי את הנעיצות — ולא
  נעצתי ₪1,500 בקוד, כי זו הייתה החלטה חדשה. נקודה לדירקטוריון: המודל מחלק שעות לפי חלק ביעד, וקו ב-₪0 מקבל 0 שעות
  למרות שיש לו עדיין תקציב בנייה. אין לזה השפעה היום: ה-intake לא מחווט ולא רץ.
- **באג צף שנחשף:** `27.500000000000004` דחה באונטי שמשלם בדיוק את הרצפה (בדיקת "accepts a bounty exactly at the floor"
  נכשלה). הרצפה מעוגלת עכשיו לאגורה.
- `experiments.test.ts` הניח שקו live עם יעד 0 נהרג; לפי ההכרעה הוא עכשיו escalate (`target_unset`). הבדיקה מראה את
  שני המקרים: עם יעד → kill, בלי יעד → escalate.
- `rails.test.ts`: חלק Gumroad ירד מ-1000/1500 ל-600/1100; עדיין מעל הסף, עדיין "concentrated".
- הנגזרות של K3 ב-`experiments.ts:80-81` ("clears the ₪500 kill floor") הן מספר שנרשם מראש לניסוי YouTube. לא נגעתי
  (שורה 11 ו-`experiments.ts` מחוץ לתחום של המשימה הזו).
- בקומיט הזה `contradictedLines` הוא `[]` כפי ששורה 9 כותבת. הכרעת הבאונטי (הקומיט הבא) מחזירה את `oss-bounties` לשם.
- **תוספת אחרי הרצת `report`:** ה"החלטה" של שורה 9 אומרת "the report prints it beside the ₪0", אבל ה"Exact change" לא
  כלל שינוי בדוח, והדוח לא הדפיס אף גבול עליון שנוי במחלוקת (גם לא ה-₪1,500 של Apify). הוספתי ל-`runner.ts` שורה אחת
  ("Contested upper bounds, not targets and not in the sum: …") עם בדיקה שנכשלה קודם, בקומיט נפרד.

## 5. שגיאות וניסיונות שנכשלו
- העץ התחיל על בסיס ישן (`b968711`) — בדיוק מה ש-CLAUDE.md מזהיר ממנו. תוקן ב-reset.
- פקודת Bash עם heredoc ארוך של Python נחסמה ("too complex to verify"); עברתי לקובצי סקריפט ב-scratchpad.
- הבדיקה "exactly at the floor" נכשלה על שגיאת צף (ראו 4).

## 6. בדיקות ופעולות ולידציה
- RED: 4 כשלונות ב-`rules.test.ts`, 7 ב-`target-basis.test.ts`, 1 ב-`ledger.test.ts` — כולם מהסיבה הנכונה.
- אחרי הקוד: 11 בדיקות תלויות נכשלו (loop, experiments, rails, bounties-intake) ועודכנו לנתונים הסופיים.
- `pnpm typecheck` נקי; `npx vitest run src/__tests__/revenue`: 32 קבצים, 738/738.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- כל שינוי בסכום המחויב דורש חיפוש ידני של "₪1,500" בפרוזה (INCOME_PLAN, OWNER_STEPS, שני SKILL.md). בדיקה שמשווה
  את הסכום שכתוב בפרוזה ל-`committedTargetIls()` הייתה תופסת את זה.
- קישור `node_modules` לכל עץ עבודה של סוכן.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת `portfolio.ts` המלא (45KB) — נחוצה, אבל פעם אחת הספיקה.
- ניסיון heredoc שנחסם וחזרה עליו כקובץ.
- הרצת הסוויטה המלאה אחרי כל שלב (5 שניות — זול).
