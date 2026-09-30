# 2026-09-30 — מדד שיעור ההחזרים של Pro (`gumroadRefundRate90d`)

## 1. מה המשתמש ביקש

סקריפט ה-workflow (לא הבעלים ישירות) ביקש לבצע את `RULING-2026-09-30-documents.md` חלק (d) ואת "Fold actions for Opus"
צעד 6, כלשונו: בסנכרון של מחבר Gumroad לחשב `gumroadRefundRate90d` = refunded / sales על 90 הימים האחרונים למוצר Pro
(לפי השדה `refunded` של אובייקט המכירה), לכתוב אותו כשורת KPI שנושאת את שני המונים, ולהדפיס אותו בדוח המושבה ליד
המכירות. בדיקה עם 6 מכירות והחזר אחד → 0.167. המדד לעולם לא חוסם ולא מסרב לשום דבר.

## 2. הפעולות המרכזיות שביצעתי

1. אימות בסיס ה-worktree (`fadda3c`, הפסיקה קיימת), `pnpm install --frozen-lockfile --prefer-offline`.
2. קריאת (d) וצעד 6 בפסיקה, המחבר `src/revenue/connectors/gumroad.ts`, `heartbeat.ts` (`runLedgerSync`),
   `runner.ts` (`tick`, `renderReport`), `ledger.ts` (`recordKpi`), ו-`gumroad-pro-product.js` (שדות המכירה שכבר בשימוש).
3. עיגון שמות השדות בקוד הציבורי של Gumroad ב-GitHub (`antiwork/gumroad` בקומיט
   `0656875c5fbfbf1a7f339f4716a0b9059539d790`, אותו קומיט שהמחקר הקודם קרא), דרך raw.githubusercontent.com בלבד:
   - `app/models/purchase.rb#as_json` (version 2): `created_at` (:1018), `product_id: link.external_id` (:1050),
     `refunded: stripe_refunded` (:1052), `partially_refunded: stripe_partially_refunded` (:1053).
   - `app/modules/purchase/refundable.rb:317-318` ו-`:406-412`: `refunded` נדלק רק כשההחזרים מכסים את כל החיוב;
     אחרת `partially_refunded`; אף פעם לא שניהם.
   - `app/controllers/api/v2/sales_controller.rb`: עשר מכירות לעמוד (`RESULTS_PER_PAGE`, :14), `created_at >= after`
     (:282), סינון לפי `product_id` (:285), `page_key` (:91-98); `base_controller.rb`: `success` בכל תשובה (:42-44),
     `next_page_key` (:163-167).
4. TDD: קובץ בדיקות חדש (18 בדיקות) נכתב ראשון ונכשל כולו (הייצואים לא קיימים); אחר כך מימוש; ירוק.
5. בדיקות מוטציה (ראו סעיף 6).

## 3. קבצים/מערכות ששונו

- `src/revenue/connectors/gumroad.ts`: `GUMROAD_REFUND_RATE_KPI`, `countProRefunds`, `refundRate`, `refundRateUnit`,
  `parseRefundRateUnit`, `readProProductId`, `readProRefundCount` (קריאה מדופדפת של `GET /v2/sales?product_id=&after=`).
- `src/revenue/heartbeat.ts`: `runLedgerSync` מקבל `options` (`nowIso`, `proSiteDir`), קורא את השיעור אחרי המחברים
  וכותב שורת KPI; `LedgerSyncResult.gumroadRefundRate`.
- `src/revenue/runner.ts`: `TickOptions.proSiteDir`; `describeGumroadRefundRate`; שורה בדוח מיד אחרי "Ledger sync".
- `src/__tests__/revenue/gumroad-refund-rate.test.ts` (חדש).

## 4. החלטות והנחות משמעותיות

- **איזה מוצר הוא Pro:** `gumroad.productId` ב-`products/il-biz-tools/src/config/site.json` — אותו מקור שפקודת ה-refund
  משתמשת בו. ריק היום, ולכן היום אין קריאה והדוח אומר "not read — no Pro product yet".
- **על איזה קו נכתבת השורה:** הקו שמפת המוצרים נותנת ל-`gumroad:<productId>` (ליד המכירות), ואחרת `il-biz-tools`.
- **חלון:** נמדד מ-`created_at` של כל מכירה: `now − 90d ≤ created_at ≤ now`, כולל בדיוק 90 יום. הבקשה ל-Gumroad
  מתחילה יום אחד לפני (91 יום) כדי שסינון-היום של Gumroad לא יחתוך מכירה בתוך החלון; החיתוך המדויק בצד שלנו.
- **החזר חלקי:** נספר כמכירה ולא כהחזר (המדד של הפסיקה הוא `refunded`); המספר נישא ביחידה ומודפס.
- **אפס מכירות:** אין שיעור, לא נכתבת שורה, הדוח אומר "no rate"; לעולם לא NaN ולא חלוקה באפס.
- **מכירות של מוצר אחר:** מסוננות גם אם Gumroad מחזיר אותן.
- **כישלון קריאה / יותר מ-100 עמודים:** אין שורה (לא שיעור חלקי); שורת דוח בלבד, לא שגיאת סנכרון ולא blocker.
- **ספי 15%/25%:** לא מודפסים. צעד 6 לא אומר להדפיס אותם; (d) אומר רק ש-15% ומעלה הוא "reading for the board".
- הערך הנשמר הוא היחס המדויק (1/6); הדוח מדפיס שלוש ספרות (0.167).

## 5. שגיאות וניסיונות שנכשלו

- עריכה ב-Python דרך Bash נחסמה ע"י בידוד ה-worktree; עברתי ל-Edit.
- סקריפט הצצה ב-tsx נכשל על top-level await בפורמט cjs; הרצה כ-`.mts` עבדה.

## 6. בדיקות ופעולות ולידציה

- `npx vitest run src/__tests__/revenue/gumroad-refund-rate.test.ts`: אדום לפני המימוש (18/18 נכשלו, exit 1), ירוק אחריו
  (18/18, exit 0).
- מוטציות (כל אחת הפילה בדיקות, exit 1; המקור שוחזר ונבדק ב-`cmp`):
  - גבול החלון: `t <= start` (1 נכשלה); התחלה מילישנייה מוקדמת (1); בלי בדיקת סוף החלון (1); בלי חלון כלל (3).
  - מוצר: בלי סינון `product_id` בצד שלנו (2); בלי `product_id` בבקשה (6).
  - אפס מכירות: חלוקה בלי שמירה (3); כתיבת 0 כשאין מכירות (2).
  - חסימה: כישלון הקריאה כשגיאת סנכרון (2).
- `npx vitest run src/__tests__/revenue`: 49 קבצים, 1434 בדיקות, exit 0.
- `pnpm typecheck`: exit 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- בדיקות מוטציה ידניות (העתקה, sed, הרצה, שחזור, `cmp`). סקריפט קטן שמקבל קובץ, החלפה ובדיקה היה חוסך זמן.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפלט המלא של הפסיקה (40KB) לפני שצומצם ל-grep.
- ניסיון עריכה ב-Python שנחסם, ושתי הרצות של סקריפט ההצצה.
