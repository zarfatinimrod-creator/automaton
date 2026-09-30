# 2026-09-30 — מדד שיעור ההחזרים של Pro (`gumroadRefundRate90d`)

## 1. מה המשתמש ביקש

סקריפט ה-workflow (לא הבעלים ישירות) ביקש לבצע את `RULING-2026-09-30-documents.md` חלק (d) ואת "Fold actions for Opus"
צעד 6, כלשונו: בסנכרון של מחבר Gumroad לחשב `gumroadRefundRate90d` = refunded / sales על 90 הימים האחרונים למוצר Pro
(לפי השדה `refunded` של אובייקט המכירה), לכתוב אותו כשורת KPI שנושאת את שני המונים, ולהדפיס אותו בדוח המושבה ליד
המכירות. בדיקה עם 6 מכירות והחזר אחד → 0.167. המדד לעולם לא חוסם ולא מסרב לשום דבר.

סבב שני (אותו יום, אותו סקריפט): לתקן את ארבעת הליקויים שהסוקר מצא בבנייה, כל אחד שעומד מול הפסיקה והקוד, ולנמק
כל ליקוי שנדחה; להריץ שוב את חבילת revenue ואת typecheck; לעדכן את היומן הזה.

## 2. הפעולות המרכזיות שביצעתי

**סבב הבנייה (קומיט `0b305bc`):**

1. אימות בסיס ה-worktree (`fadda3c`, הפסיקה קיימת), `pnpm install --frozen-lockfile --prefer-offline`.
2. קריאת (d) וצעד 6 בפסיקה, המחבר `src/revenue/connectors/gumroad.ts`, `heartbeat.ts` (`runLedgerSync`),
   `runner.ts` (`tick`, `renderReport`), `ledger.ts` (`recordKpi`), ו-`gumroad-pro-product.js` (שדות המכירה שכבר בשימוש).
3. עיגון שמות השדות בקוד הציבורי של Gumroad ב-GitHub (`antiwork/gumroad` בקומיט
   `0656875c5fbfbf1a7f339f4716a0b9059539d790`), דרך raw.githubusercontent.com בלבד:
   - `app/models/purchase.rb#as_json` (version 2): `created_at` (:1018), `product_id: link.external_id` (:1050),
     `refunded: stripe_refunded` (:1052), `partially_refunded: stripe_partially_refunded` (:1053).
   - `app/modules/purchase/refundable.rb:317-318` ו-`:406-412`: `refunded` נדלק רק כשההחזרים מכסים את כל החיוב;
     אחרת `partially_refunded`; אף פעם לא שניהם.
   - `app/controllers/api/v2/sales_controller.rb`: עשר מכירות לעמוד (`RESULTS_PER_PAGE`, :14), `created_at >= after`
     (:282), סינון לפי `product_id` (:285), `page_key` (:91-98); `base_controller.rb`: `success` בכל תשובה (:42-44),
     `next_page_key` (:163-167).
4. TDD: קובץ בדיקות חדש (18 בדיקות) נכתב ראשון ונכשל כולו; אחר כך מימוש; ירוק. בדיקות מוטציה.

**סבב התיקונים (ארבעת ליקויי הסוקר):**

1. **ליקוי 1 — ה-watchdog:** שורת השיעור היא קריאה חוזרת של מכירות ישנות, ובכל זאת איפסה את שעון ה-stall של הקו.
   `findStalledLines` מתעלם עכשיו מ-KPI שברשימה `NOT_PROGRESS_KPIS` (כרגע רק `gumroadRefundRate90d`). בנוסף, שורה
   נכתבת רק כשהמונים (sales, refunded, partly refunded, disputed, chargedback, אורך החלון) שונים מהשורה האחרונה של אותו
   קו ואותו מוצר, או כשהקריאה הקודמת לא מצאה מכירה — כך הטבלה לא גדלה ב-24 שורות ביום.
2. **ליקוי 2 — שיעור שפג תוקפו בדוח:** כל סנכרון שומר את הקריאה האחרונה שלו, בכל סטטוס, ב-kv
   `revenue.gumroad_refund_rate.last_read` עם שעון הסנכרון. בטיק בלי סנכרון הדוח מדפיס את הקריאה הזו עם
   "(last read <זמן>)" — ולא את השורה האחרונה בטבלה. אחרי קריאה שלא מצאה מכירה הדוח אומר "no rate", ואחרי קריאה
   שנכשלה הוא אומר "not read"; שיעור ישן לא מודפס.
3. **ליקוי 3 — ספירה חלקית לא נבדקה:** נוספו שלוש בדיקות: עמוד 1 נענה ועמוד 2 נדחה (פעם ב-HTTP 500, פעם ב-200 עם
   `success: false`), ו-Gumroad שמחזיר `next_page_key` לנצח — בדיוק 100 בקשות, סטטוס error, אין שורה. הקוד עצמו היה
   נכון; חסרו הבדיקות. שתי המוטציות של הסוקר נכשלות עכשיו.
4. **ליקוי 4 — chargebacks ו-disputes:** אומת מול המקור באותו קומיט: `chargedback: chargedback_not_reversed?`
   (purchase.rb:1054), `disputed: chargedback?` (:1079), ו-`chargedback? = chargeback_date.present?`,
   `chargedback_not_reversed? = chargedback? && !chargeback_reversed?` (:1313-1314). המונה נשאר `refunded` בלבד, כפי
   שהפסיקה אומרת; שני המונים החדשים נספרים בנפרד, נכנסים ליחידה של השורה ולביטוי הרגולרי שלה, ומודפסים בשורת הדוח.

## 3. קבצים/מערכות ששונו

- `src/revenue/connectors/gumroad.ts`: `GUMROAD_REFUND_RATE_KPI`, `countProRefunds` (עכשיו גם `disputed`,
  `chargedback`), `refundRate`, `refundRateUnit` / `parseRefundRateUnit` (שני שדות חדשים), `sameRefundCounts` (חדש),
  `readProProductId`, `readProRefundCount`.
- `src/revenue/heartbeat.ts`: `runLedgerSync` מקבל `options`; `syncGumroadRefundRate` כותב שורה רק כשהמונים השתנו;
  `GumroadRefundRateRead.rowWritten`; `GUMROAD_REFUND_RATE_LAST_READ_KEY`, `lastGumroadRefundRateRead` (חדשים).
- `src/revenue/runner.ts`: `describeGumroadRefundRate` קורא את הקריאה האחרונה מה-kv במקום השורה האחרונה; שורת הדוח
  מציגה partly refunded, disputed, chargebacks not reversed.
- `src/revenue/watchdog.ts`: `NOT_PROGRESS_KPIS`; תת-השאילתה `kpi_at` מדלגת עליהם.
- `src/__tests__/revenue/gumroad-refund-rate.test.ts`: 18 → 28 בדיקות. בדיקה אחת של הבונה ("the latest row is what a
  later report reads") הוחלפה, כי הדוח לא קורא עוד שורות; בדיקה אחת שונתה ("last recorded" → "last read").
- `logs/2026-09-30-pro-refund-rate-kpi.md` (היומן הזה).

## 4. החלטות והנחות משמעותיות

- **איזה מוצר הוא Pro:** `gumroad.productId` ב-`products/il-biz-tools/src/config/site.json`. ריק היום, ולכן היום אין
  קריאה והדוח אומר "not read — no Pro product yet".
- **על איזה קו נכתבת השורה:** הקו שמפת המוצרים נותנת ל-`gumroad:<productId>`, ואחרת `il-biz-tools`.
- **חלון:** `now − 90d ≤ created_at ≤ now` לפי כל מכירה; הבקשה ל-Gumroad מתחילה 91 יום אחורה; החיתוך המדויק אצלנו.
- **אפס מכירות:** אין שיעור ואין שורה; לעולם לא NaN ולא חלוקה באפס.
- **כישלון קריאה / יותר מ-100 עמודים:** אין שורה; שורת דוח בלבד, לא שגיאת סנכרון ולא blocker.
- **ה-watchdog:** ההחרגה ממוקדת ב-KPI אחד ברשימה בשם, לא בכלל גורף. מכירה והחזר כבר נרשמים ב-ledger עם זמן
  התרחשותם, ולכן אין אובדן אות אמיתי.
- **כתיבה רק בשינוי:** ההשוואה היא מול השורה האחרונה של אותו קו, ואותו `productKey`. אחרי קריאה שלא מצאה מכירה, שיעור
  שחוזר נכתב שוב גם אם המונים זהים, כדי שההיסטוריה תראה שהשיעור נעלם וחזר. קריאה שנכשלה לא נחשבת הפסקה (אחרת Gumroad
  לא יציב היה מייצר שורה בכל התאוששות). משמעות: `captured_at` של השורה הוא הזמן שבו המונים האלה נקראו לראשונה; היחידה
  נושאת "90 days to <זמן>" של אותה קריאה, כך שהשורה נכונה כפי שהיא כתובה.
- **חלק מליקוי 2 שנדחה — `latestKpis`:** לא שיניתי את `latestKpis` ולא כתבתי שורה "ריקה" כשאין מכירות. הנימוק: (א)
  `latestKpis` מחזיר את הקריאה האחרונה של כל KPI, בכל הקווים, וזה המובן שלו; (ב) השורה מתוארכת פעמיים — `capturedAt`
  (ש-`tools.ts:153` מדפיס ליד הערך) וחלון "90 days to <זמן>" ביחידה — כך שהיא לא מוצגת בלי תאריך סיום; (ג) שורה עם ערך
  0 כשאין מכירות הייתה מדפיסה שיעור של 0% על אפס מכירות, בדיוק מה שהבנייה אוסרת (ומוטציה של הבונה מוודאת). בדיקה
  חדשה מוודאת שהשורה הישנה נשארת בהיסטוריה עם החלון שלה, ושהדוח לא מדפיס אותה.
- **chargebacks:** לא נכנסים למונה (הפסיקה: `refunded` בלבד). `disputed` ו-`chargedback` נספרים כל אחד מהשדה שלו,
  בלי תלות ב-`refunded`, כך שמכירה שהוחזרה וגם נפתחה עליה מחלוקת מופיעה בשני המונים. הניסוח בדוח: "the rate counts
  `refunded` only; also in the window: …" — לא "counted as sales, not as refunded", שהיה לא מדויק למכירה כזו.
- **ספי 15%/25%:** לא מודפסים; צעד 6 לא מבקש, ו-(d) אומר רק ש-15% ומעלה הוא "reading for the board".

## 5. שגיאות וניסיונות שנכשלו

- סבב הבנייה: עריכה ב-Python דרך Bash נחסמה בבידוד ה-worktree (עבר ל-Edit); סקריפט הצצה ב-tsx נכשל על top-level
  await בפורמט cjs (הרצה כ-`.mts` עבדה).
- סבב התיקונים: אין כישלונות. לפני ההרצה בדקתי שאין תלות מעגלית בייבוא החדש של `watchdog.ts` מ-`connectors/gumroad.js`
  (`connectors/types.ts` מייבא טיפוס בלבד); typecheck עבר.

## 6. בדיקות ופעולות ולידציה

- `npx vitest run src/__tests__/revenue/gumroad-refund-rate.test.ts`: 28/28, exit 0.
- מוטציות של סבב התיקונים (סקריפט קטן: החלפה אחת, הרצת קובץ הבדיקות, שחזור והשוואה בייט-לבייט; כל אחת exit 1 ושוחזרה
  זהה):
  - M1 ביטול ההחרגה ב-watchdog → נכשלה בדיקת ה-watchdog (1).
  - M2 כתיבת שורה בכל סנכרון → נכשלה בדיקת "רק כשהמונים משתנים" (1).
  - M3 ביטול כלל "אחרי קריאה בלי מכירה" → נכשלה בדיקת החזרה (1).
  - M4 שמירת הקריאה האחרונה רק כשיש שיעור → 3 נכשלו (כולל רצף 1-מ-2 → 100 יום → טיק: הדוח היה מדפיס 0.500).
  - M5 (מוטציה (a) של הסוקר) 100 עמודים מחזירים הצלחה → 1 נכשלה.
  - M6 (מוטציה (b) של הסוקר) עמוד מאוחר שנדחה מחזיר הצלחה חלקית → 2 נכשלו.
  - M7 / M8 בלי ספירת `chargedback` / `disputed` → 2 נכשלו בכל אחת.
  - M9 chargeback נספר כ-refunded → 2 נכשלו.
- מוטציות סבב הבנייה (גבול החלון, סינון מוצר, אפס מכירות, לא-blocker) — ראו קומיט `0b305bc`; כולן עדיין מכוסות.
- `npx vitest run src/__tests__/revenue`: 49 קבצים, 1444 בדיקות, exit 0 (היו 1434; +10).
- `pnpm typecheck`: exit 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- בדיקות מוטציה: בסבב הזה נכתב `mutate.mjs` בתיקיית ה-scratchpad (קובץ, חיפוש, החלפה, תווית → exit, מספר כישלונות,
  שמות הבדיקות, שחזור זהה). כדאי להכניס אותו ל-`scripts/` של הריפו, כי כל בונה וסוקר כאן מריצים מוטציות ידנית.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- סבב הבנייה: קריאת הפלט המלא של הפסיקה (40KB) לפני שצומצם ל-grep; ניסיון עריכה ב-Python שנחסם; שתי הרצות של סקריפט
  ההצצה.
- סבב התיקונים: מעט. קריאת ה-diff המלא של הבנייה (394 שורות) לפני שהתחלתי; היה אפשר לקרוא רק את שלושת הקטעים שהסוקר
  הצביע עליהם.
