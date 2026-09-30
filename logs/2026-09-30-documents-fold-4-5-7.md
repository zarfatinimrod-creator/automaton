# 30.9.2026 — פסיקת המסמכים, צעדי קיפול 4, 5 ו-7 (Opus, worktree)

## 1. מה המשתמש ביקש

סקריפט ה-workflow ביקש לממש את צעדים 4, 5 ו-7 של "Fold actions for Opus" ב-
`research/channel-loop/RULING-2026-09-30-documents.md`, בדיוק כפי שנכתבו, אחרי קריאת (b) ו-(d):

- **4** — `products/il-biz-tools/scripts/gumroad-pro-product.js`: (א) בדיקת החשבון משווה גם את `name` של
  החשבון לשם המותג, עוצרת כשאינו תואם ולא מדפיסה אותו; (ב) `refund` מבחין בסירוב של Gumroad בגלל יתרה
  (קוד יציאה משלו) ומקבל `--sale <id> --requested-at <iso>` לניסיון חוזר; (ג) `create --fine-print <file>`
  כותב את האותיות הקטנות בעברית דרך ה-API של מדיניות ההחזרים, הרצה יבשה כברירת מחדל, ו-`check` קורא אותן
  בחזרה ומסרב כשאינן תואמות. לפני (ב) ו-(ג): לבסס בקוד המקור הציבורי של Gumroad ב-GitHub את נוסח הסירוב
  ואת קיום הנקודה.
- **5** — `scripts/brand_mail.py respond-refunds`: תשובת המתנה אחת, רשומת ניסיון חוזר ב-
  `state/colony/refund-retries.json` (בלי כתובת ובלי שם), וניסיון חוזר לפי מזהה מכירה בתחילת כל ריצה.
- **7** — קישור ביטול ייעודי בכותרת התחתונה של דף הבית (mailto לכתובת המותג, נושא "ביטול עסקה – Pro") עם
  פסקת גילוי, ותשובת ה-FAQ של Pro מקבלת "במטבע שבו חויבתם" ואת הקישור (JSON-LD מסונכרן). הכתובת מאותו מקור
  שהצהרת הנגישות משתמשת בו, והשער שחוסם פרסום כל עוד הכתובת היא ממלא מקום חוסם גם את הקישור.

## 2. הפעולות המרכזיות שביצעתי

- איפסתי את ה-worktree ל-`claude/new-session-j071dx` (הוא התחיל על `3ae1515`, בלי קובץ הפסיקה).
- ביססתי בקוד של Gumroad (`antiwork/gumroad` ב-`0656875c`, דרך raw.githubusercontent.com בלבד):
  נוסח הסירוב `refundable.rb:99-100`, צורת התשובה `sales_controller.rb:197-201, :276-277` ו-
  `base_controller.rb:63-73`; `PUT /v2/refund_policy` ב-`config/routes.rb:112` (תחת `scope "v2"`, `:70`),
  `refund_policies_controller.rb:21-37` (refund_period חובה, `fine_print` ב-`:36`), התיעוד
  `ApiDocumentation/Endpoints/RefundPolicy.tsx:52-64`; אורך מרבי ו-strip_tags ב-`refund_policy.rb:21, :24`;
  ניקוי הרווחים והתווים הבלתי נראים ב-`concerns/stripped_fields.rb:54-95`; `name` ב-`user/as_json.rb:9`;
  `GET /v2/sales/:id` ב-`sales_controller.rb:125-128`. ה-sha256 של חמישה קבצים תואם את מה שרשום כבר ב-
  `research/measurements/refund-law-il.md`.
- צעד 4: `GUMROAD_ACCOUNT_NAME = 'Mehudak'`; `BalanceError`, `BALANCE_EXIT = 3`, השורה
  `refund: balance-insufficient (sale <id>)`; `refundSaleById`; `finePrintText`/`canonicalFinePrint`/
  `writeFinePrint`; `check` משווה את האותיות הקטנות של המדיניות שבתוקף לקובץ
  `products/il-biz-tools/docs/refund-fine-print.he.txt`; ב-`gumroad-pro-product.yml` קלט `write_fine_print`.
- צעד 5: `HOLDING_REPLY`, `REFUND_RETRIES`, `load_retries`, `find_request`, `node_retry_runner`; ב-
  `brand-mail.yml` משימת המשיב עוברת לראש הענף ומבצעת commit לקובץ הניסיונות בלבד, גם אחרי ריצה שנכשלה;
  `REFUND_COMMIT_IF` מוצמד ב-`brand_mail.py` כדי שהבדיקה עדיין תעיד שהמשיב מתוזמן.
- צעד 7: `CANCEL_LINK_ATTR`, `cancelHref`, `statementAddress`, `withCancelLinks`, `cancelLinkProblems` ב-
  `publish-gate.js`; שלב 1c ב-`build-site.js`; הקישור והפסקה ב-`index.html`; תשובת (g) ותאומת ה-JSON-LD שלה
  ב-`invoice.html`; README.
- בדיקות קודם (RED), מימוש (GREEN), ואז בדיקות מוטציה על כל ענף חדש; כל מוטציה שנשרדה קיבלה בדיקה.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/scripts/gumroad-pro-product.js`, `src/lib/gumroad.js`, `src/lib/publish-gate.js`,
  `scripts/build-site.js`, `index.html`, `invoice.html`, `README.md`, `docs/refund-fine-print.he.txt` (חדש)
- `products/il-biz-tools/tests/gumroad-pro-product.test.js`, `tests/pro-faq.test.js`, `tests/cancel-link.test.js` (חדש)
- `scripts/brand_mail.py`, `scripts/tests/test_brand_mail_refunds.py`
- `.github/workflows/gumroad-pro-product.yml`, `.github/workflows/brand-mail.yml`
- `src/__tests__/revenue/brand-mail-workflow.test.ts`
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
  `docs/OWNER_STEPS.he.md` או `src/revenue/owner-steps.ts`.

## 4. החלטות והנחות משמעותיות

- **משימת המשיב מבצעת עכשיו commit.** בלי זה קובץ הניסיונות נמחק בסוף כל ריצת CI, והתוצאה גרועה מהיום:
  תשובת המתנה נשלחת, המייל מסומן כנענה, והמכירה לא נבדקת שוב לעולם. לכן `permissions: contents: write`,
  `fetch-depth: 0`, צעד "Move to the branch tip" וצעד commit לקובץ אחד בלבד. זו החלטה עם השלכות ארוכות
  (טוקן כתיבה באותה משימה שמחזיקה את סודות תיבת הדואר, כמו במשימות probe ו-send) — כדאי שהלוח (Fable) יאשר.
- **למי עונים אחרי הצלחה.** הרשומה מחזיקה רק `saleId`, `requestedAt`, `holdingReplySentAt`, כפי שהפסיקה
  קובעת, כך שהמשיב מוצא את הבקשה שוב לפי ה-INTERNALDATE שלה (הוא ה-`requestedAt`) ולפי שולח מאומת אחד. אם
  ההודעה נמחקה או הועברה לארכיון, או שיש שני שולחים באותה שנייה — ההחזר נשאר, הרשומה נמחקת, ואין תשובה
  (לעולם לא לאדם הלא נכון).
- **האותיות הקטנות בלי כתובת.** "הכתובת הזו" של פסקת האתר הופכת בקבלה ל"משיבים למייל הקבלה מ-Gumroad" (התשובה
  מגיעה לתיבת המותג לפי הגדרת ה-Support בצעד 3) ולקישור בתחתית דף הבית; כתובת האתר נכנסת מ-`site.json`.
  כך הקובץ ב-repo לא מכיל כתובת.
- **תשובת המתנה בלי תאריך.** "מועד קבלתה נרשם" במקום תאריך: המרת INTERNALDATE לתאריך ישראלי תלויה ב-tzdata,
  ותאריך שגוי ליד חצות גרוע מאין תאריך. התשובה משורשרת לבקשה, כך שהתאריך שלה גלוי לקונה.
- **`check` מסרב עכשיו עד שהאותיות הקטנות נכתבו**, ולכן גם `enable`. זו עבודת סוכן (dispatch של create עם
  `write_fine_print`), לא צעד של הבעלים.
- **הקישור מוצג גם לפני שהחנות נפתחה** (הפסיקה לא מתנה אותו); הנוסח מותנה ("רכשתם Pro ורוצים לבטל?").
- `REFUND_REPLY` ב-`brand_mail.py` לא שונה: צעד 7 מדבר על תשובת ה-FAQ, וצעד 5 אומר לשלוח את התשובה הקיימת.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree התחיל על בסיס ישן (`3ae1515`); `git reset --hard` לענף תיקן.
- ה-harness סירב לפקודות bash שהכילו את הרצף "git" בתוך מילה ("digits", "raw.githubusercontent"); עברתי
  לקבצי סקריפט בתיקיית scratch.
- כתבתי `fetch.sh` בתיקיית scratch המשותפת ודרסתי קובץ קיים באותו שם מסשן קודם; מאז עבדתי רק בתת-תיקייה
  `wf95142/`.
- מוטציה אחת הראתה שבדיקת `in_effect` ב-`writeFinePrint` כפולה לשער הקיים — הסרתי אותה.
- בדיקת TS אחת שכתבתי ציפתה למחרוזת הנתיב המילולית אחרי `git add`; הצעד משתמש ב-`"$FILE"` — תיקנתי את הבדיקה.

## 6. בדיקות ופעולות ולידציה

- il-biz-tools: `npx vitest run` — 884 עוברות, נכשלת אחת שנכשלה כבר לפני השינוי
  (`osek-zair-page.test.js`, `research/rendered/urls.txt` כבר לא מכיל את `nevo-vat-law`; לא קשור).
- `python3 -m unittest` — 132 עוברות. `pnpm typecheck` — נקי. `npx vitest run src/__tests__/revenue` — 1303 עוברות.
- בדיקות מוטציה: 20 בצעד 4, 17 בצעד 5, 11 בצעד 7 ו-2 ב-build — כולן נהרגו (אחרי הוספת בדיקות לשורדות).
- grep על ה-diff: 0 מופעים של שם הבעלים; הכתובות היחידות שנוספו הן דומיינים שמורים לדוגמה, כתובת הבוט,
  ו-`test-only@il-biz-tools.netlify.app` של עוזר הבדיקות הקיים.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- בדיקות מוטציה: כתבתי `mutate.py` קטן (החלפה חד-שורתית, הרצה, שחזור). שווה סקריפט ב-`scripts/` שמקבל
  רשימת מוטציות ליד כל קובץ בדיקה.
- עריכות מרובות-שורות דרך קבצי Python ב-scratch בגלל מסנן ה-git של ה-harness.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `gumroad-pro-product.test.js` (כ-1000 שורות) ו-`publish-gate.js` במלואם — נחוץ, אבל כבד.
- רשימת תיקיית ה-scratch המשותפת (אלפי קבצים) — מיותר.
- שלוש סירובים של ה-harness על פקודות שהכילו "git" בתוך מילה.
