# טיק 37 — USDC נרשם "לא מומר" בקוד (פסק bounty-rail §6.2)

## 1. מה המשתמש ביקש

הפגם שמצא הטיק ה-36: עמוד הבעלים (`docs/OWNER_STEPS.he.md:486-490`) אומר איך USDC נרשם בלדג'ר — בשווי השקלי ביום
הקבלה, עם מזהה העסקה על השרשרת, מסומן "לא מומר"; המסך מראה מומר ולא מומר כשני מספרים; שום יעד לא נשען על כסף לא
מומר; המפתח לא בריפו ולא בסוד, והמכונה לא מזיזה כספים — ושום קוד לא עשה את זה. `x402-local.ts` רשם `"USD"` בלי דגל,
עם מזהה השורה המקומית, בשער של היום (או 3.6 קבוע). המשימה: לבנות בדיוק את מה שהעמוד ו-§6.2 אומרים, מינימלי ומוקלד,
בגישת TDD, עם בדיקת מוטציות ו-`scripts/verify.sh`, בלי לגעת בעמוד הבעלים.

## 2. הפעולות המרכזיות שביצעתי

- קראתי את §6.2 במלואו (`research/channel-loop/RULING-2026-09-28-bounty-rail.md:338-345`), את `money.ts`, `ledger.ts`,
  `rules.ts`, `watchdog.ts`, `budget.ts`, `runner.ts`, `dashboard.ts`, `heartbeat.ts` ואת כל קוראי הסכומים (`grep` על
  `total30dAgorot`, `revenue30dAgorot`, `targetAttainment`, `amount_agorot`).
- כתבתי קודם את `src/__tests__/revenue/usdc-unconverted.test.ts` (25 בדיקות) ועדכנתי את בדיקת ה-x402 ב-`loop.test.ts`;
  ראיתי אותן נכשלות, ורק אז כתבתי קוד.
- סכמה v13: עמודה `revenue_ledger.unconverted`. הלדג'ר קובע אותה מהמטבע (USDC) — קורא לא יכול לנקות אותה.
- `money.ts`: שערים לפי יום (`setFxRateOn`/`getFxRateOn`, בלי שום נפילה לשער כללי) ו-`receiptDay` — היום הקלנדרי
  בישראל של הקבלה.
- `connectors/usdc.ts` (חדש): המסלול המשותף לכל מחבר USDC. קבלה בלי hash או בלי שער ליום שלה — מוחזקת (held), לא
  נרשמת.
- `x402-local.ts`: קורא את ה-hash מתג `[tx:0x…]`, רושם USDC, ומשאיר את הסמן לפני השורה המוחזקת הראשונה.
- `ledger.ts`: כל מדד שמזין יעד, רצפה או כלל סופר רק כסף מומר; `unconverted30dAgorot` נסכם בנפרד. קידום ל-`live` —
  רק על כסף מומר. עלות ב-USDC נדחית.
- הדוח (`runner.ts`), שורת הקומיט והמסך (`dashboard.ts`) מראים שני מספרים — בסיכום ובכל שורת קו.
- `scripts/colony.ts fx` — רישום שער של יום; ההודעה על קבלה מוחזקת נותנת את הפקודה המדויקת.
- עדכנתי את `products/x402-il-api/scripts/tag-payment.md` (תג `[tx:…]`, דוגמת רישום ידני ב-USDC).

## 3. קבצים/מערכות ששונו

- `src/state/schema.ts`, `src/state/database.ts`, `src/__tests__/orchestration/test-db.ts` — מיגרציה 13.
- `src/revenue/types.ts`, `src/revenue/money.ts`, `src/revenue/ledger.ts`.
- `src/revenue/connectors/usdc.ts` (חדש), `src/revenue/connectors/x402-local.ts`, `src/revenue/heartbeat.ts`.
- `src/revenue/runner.ts`, `src/revenue/dashboard.ts`, `scripts/colony.ts`.
- `products/x402-il-api/scripts/tag-payment.md`.
- בדיקות: `src/__tests__/revenue/usdc-unconverted.test.ts` (חדש), `src/__tests__/revenue/loop.test.ts`.
- לא נגעתי ב-`state/colony/*`: `REPORT.md` ו-`dashboard.html` יתחדשו בטיק הבא של ה-workflow, שגם יריץ את מיגרציה 13 על
  `colony.db` (הלדג'ר שם ריק היום, אז אין שורה קיימת לסווג).

## 4. החלטות והנחות משמעותיות

- **הדגל נגזר מהמטבע, בלדג'ר.** כך גם רישום ידני (`colony.ts record --currency USDC`) או כלי הסוכן `revenue_record`
  מסומן, ואין דרך לרשום USDC כ"מומר".
- **אין זרימת המרה.** §6.2: "Whether and how USDC becomes ILS is the owner's later decision" — לא מתוארת זרימה, אז לא
  המצאתי אחת. הדגל נשאר.
- **אין שער ליום → לא נרשם.** `getFxRateOn` מחזיר null ואין נפילה ל-`revenue.fx.USDC` או ל-3.6. הלדג'ר זורק; המחבר
  מחזיק את השורה, מדווח עליה כחסימה בכל סנכרון, והסמן נשאר לפניה, כך שהיא נרשמת בסנכרון הראשון אחרי שהשער נרשם.
- **"יום הקבלה" = היום הקלנדרי בישראל** (Asia/Jerusalem), כי השער היציג והמס ישראליים. קבלה ב-21:30 UTC בספטמבר
  היא של היום הבא.
- **קבלה בלי hash נחשבת מוחזקת** (כלל MISSION 2: מזהה שורה מקומי אינו מזהה פלטפורמה).
- **כל שורה מתויגת במחבר x402 היא USDC** — x402 מסלק ב-USDC. זה הכיוון הזהיר: שורה כזו לא נספרת ביעד.
- **USDC לא מקדם קו ל-`live`.** `live` מתחיל את שעון 90 הימים של רצפת ההריגה ומבקש מהדירקטוריון יעד מהקריאה שהפכה
  אותו לחי — יעד שהיה נשען על כסף לא מומר. זה משנה בדיקה קיימת ב-`loop.test.ts` (שציפתה ל-`live`), והשינוי מתועד בה.
- **עלות ב-USDC נדחית**: היא הייתה אומרת שהמושבה הוציאה מהארנק, והמושבה לא מזיזה כספים.
- מקומות שנבדקו והושארו: `runner.ts checkLiveness` (התראת "קו חי שלא לקח כסף" — התראה, לא כלל, וקבלת USDC היא
  תשלום אמיתי), `watchdog.ts findStalledLines` (סימן התקדמות, לא יעד), `budget.ts` (שורות עלות בלבד, ועלות USDC נדחית
  ממילא), ה-auditor ב-`heartbeat.ts` (משחזר מהמדדים השמורים — שכבר מומרים בלבד), `status.ts`, `org.ts:325`,
  `tools.ts` (מציגים את המדדים המומרים; אלה קלטי החלטה של הסוכן/הדירקטוריון, ושם נכון שלא יופיע כסף לא מומר).

## 5. שגיאות וניסיונות שנכשלו

- פקודת Python אחת עם כמה עריכות ו-`grep` בסוף נחסמה על ידי בידוד ה-worktree ("too complex to verify"); עברתי לכלי
  העריכה. לא היו כשלי בדיקות מלבד ה-RED המתוכנן.

## 6. בדיקות ופעולות ולידציה

- RED: הבדיקות החדשות נכשלו (מודול חסר, `receiptDay` חסר, מחרוזות הדוח/המסך חסרות, `--date` לא מוכר ל-CLI).
- `scripts/verify.sh src/__tests__/revenue src/__tests__/data-layer.test.ts src/__tests__/orchestration`: typecheck exit 0,
  tests exit 0 — 70 קבצים, 2119 עברו, 1 דולגה. `verify: passed`, exit 0.
- `node scripts/mutate.mjs --plan …` — 21 מוטציות, 21 נהרגו, 0 שרדו (exit 0). בדיקה אחת הוקשחה לפני הריצה (תא ה"לא מומר"
  בשורת הקו במסך), כי הסרתו הייתה שורדת.
- `grep` על `src/revenue` ו-`scripts/colony.ts` לייבוא ארנק/שרשרת ולקריאות מפתח או העברה — אין התאמה. בנוסף בדיקה
  מבנית זולה בקובץ הבדיקות: אין ייבוא כזה, ואין סוד בשם PRIVATE/MNEMONIC/SEED/WALLET באף workflow.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- רישום השער היציג של יום קבלה הוא ידני (`colony.ts fx`). אם יגיע USDC, כדאי job שמוריד את השער היציג מבנק ישראל
  דרך GitHub Actions (הקונטיינר חסום) ורושם אותו — רק ליום שיש בו קבלה מוחזקת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת תזכורות רשימת-המשימות שחזרו בכל כמה קריאות — רעש, לא רלוונטי ל-worktree.
- קריאה מלאה של `ledger.ts` ו-`dashboard.ts` (כ-1,000 שורות) — נחוצה כדי למצוא כל קורא של סכום, אבל חלק גדול לא נגע
  בכסף.
- הריצה החסומה של סקריפט העריכה ב-Python — ניסיון אחד מבוזבז.
