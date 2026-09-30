# 30.9.2026 — תיקוני הביקורת על צעדי קיפול 4, 5 ו-7 של פסיקת המסמכים (Opus, worktree)

## 1. מה המשתמש ביקש

סקריפט ה-workflow העביר את דו"ח הבונה ושתי ביקורות על הענף `worktree-wf_95142bd9-bf0-2` (צעדים 4, 5 ו-7 של
`research/channel-loop/RULING-2026-09-30-documents.md`), וביקש: לתקן כל פגם שעומד מול הפסיקה ומול הקוד, לנמק כל
פגם שנדחה, להריץ את סוויטת il-biz-tools, את בדיקות brand-mail, את `pnpm typecheck` ואת
`npx vitest run src/__tests__/revenue`, ולבצע commit בענף ה-worktree בלבד.

## 2. הפעולות המרכזיות שביצעתי

- **create והאותיות הקטנות (A1, A8).** ב-`writeFinePrint` הרצה יבשה שהמדיניות חוסמת (מדיניות מוצר משלו, מדיניות
  החשבון לא בתוקף, חלון קצר מ-14 יום) מדפיסה `fine print: cannot be written yet: …` ומחזירה `blocked`, יציאה 0;
  עם `--apply` היא עוצרת כמו קודם. בצעד ה-PR ב-`gumroad-pro-product.yml` התנאי הוא עכשיו
  `!cancelled() && … && steps.create.outputs.product_id != ''`, כך ש-PR ה-productId נפתח גם כשכתיבת האותיות
  הקטנות נכשלה (site.json ו-product_id נכתבים לפניה). `finePrintText` מסרב ל-"&" (Gumroad שומר אותו כ-`&amp;`).
- **ניסיון חוזר שלא החזיר כלום (A4, B3).** `refundSaleById` לא מחזיר יותר `none` שקט: מכירה ש-Gumroad מדווח
  שהוחזרה במלואה היא `already-refunded`; מכירה שהוחזרה חלקית, חויבה חזרה או במחלוקת, של מוצר אחר, בלי זמן רכישה, או
  מחוץ לחלון כפי שהוא עכשיו — עצירה (יציאה 1: הרשומה נשארת והריצה נכשלת). ב-`brand_mail.py`, `retry_result` קורא
  את שורת ה-`refund:` האחרונה, ורק `refunded`/`already-refunded` של אותה מכירה מוחקים את הרשומה ומאפשרים את
  `REFUND_REPLY`; כל יציאה 0 אחרת נחשבת עצירה.
- **תשובה אחת לשולח בריצה (A5, B4).** `answered_senders` נוצר לפני לולאת הניסיונות החוזרים, והשולח נוסף אליו אחרי
  תשובה מוצלחת שם; גם שתי רשומות של אותו שולח עונות פעם אחת.
- **מפתח הניסיון החוזר (A6).** `requestedAt` נשמר כ-INTERNALDATE של השרת עצמו (ולא כזמן שהוצמד לשעון ה-runner),
  כך ש-`find_request` מוצא את הבקשה גם כששעון השרת מקדים; פקודת ההחזר מצמידה אותו ל-now בעצמה.
- **תשובה רק לקונה של המכירה (B8).** הבקשה נמצאת שוב לפני הניסיון החוזר, והשולח שלה מועבר כ-`--email` ל-
  `refund --sale`, שמדפיס רק `buyer: the sender` או `buyer: not the sender` (בלי הכתובת) ולא משנה דבר בהחזר.
  התשובה נשלחת רק על `buyer: the sender`. החיפוש ב-`find_request` הוגבל לימים שסביב הבקשה (`SINCE`/`BEFORE`).
- **REFUND_REPLY (A7).** "מוחזרת במלואה, במטבע שבו חויבתם, דרך Gumroad" — כפי שפסיקה (d) דורשת.
- **קישור הביטול והתג (B1).** `bareAddress` ב-`publish-gate.js` מוריד את ה-`+tag` מכתובת הצהרת הנגישות, ו-
  `cancelHref` משתמש בה; `cancelLinkProblems` מסרב לקישור ביטול עם `+tag`. אחרת הודעת ביטול ל-`+accessibility@`
  נחשבת דואר נגישות, והמשיב לעולם לא עונה עליה ולא מחזיר.
- **נוסח דף הבית (B7).** "ביטול בתוך תקופת ההחזר מזכה בהחזר מלא, שניתן דרך Gumroad במטבע שבו חויבתם."
- **brand-mail.yml (A2, A3, B5, B6).** `persist-credentials: false` חזר; `github.token` מגיע רק לשני הצעדים שמדברים
  עם ה-remote ("Move to the branch tip", "Commit the balance retries") דרך env, ומועבר ל-git לפי פקודה
  (`GIT_CONFIG_*`, בלי כתיבה לקובץ config). בצעד ה-commit הקובץ נכתב לסיכום הריצה לפני לולאת ה-push, ו-pull שנכשל
  מבטל את ה-rebase במקום לסיים את הצעד תחת `set -e`.
- README, הערות הקוד וה-docstring עודכנו לפי ההתנהגות החדשה.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/scripts/gumroad-pro-product.js`, `src/lib/publish-gate.js`, `scripts/build-site.js`,
  `index.html`, `README.md`
- `products/il-biz-tools/tests/gumroad-pro-product.test.js`, `tests/cancel-link.test.js`
- `scripts/brand_mail.py`, `scripts/tests/test_brand_mail_refunds.py`
- `.github/workflows/brand-mail.yml`, `.github/workflows/gumroad-pro-product.yml`
- `src/__tests__/revenue/brand-mail-workflow.test.ts`
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
  `docs/OWNER_STEPS.he.md` או `src/revenue/owner-steps.ts`.

## 4. החלטות והנחות משמעותיות

- **B2 (מזהי מכירה ב-repo ציבורי) לא תוקן — עובר ל-Fable.** בדקתי את העובדות בקוד של Gumroad שכבר היה ב-scratch:
  `sales_controller.rb:126` מחפש מכירה לפי `external_id`, ו-`purchases_controller.rb:20-22` מונה את `receipt`,
  `resend_receipt` ו-`subscribe` כפעולות ציבוריות שמוצאות רכישה לפי אותו מזהה (`set_purchase`), כאשר
  `receipt` מציג את הקבלה למי שמנחש את המייל (`:310-326`). הפגם אמיתי, אבל הפסיקה קובעת במפורש
  `{saleId, requestedAt, holdingReplySentAt}` ב-`state/colony/refund-retries.json`, והתיקונים המוצעים (מצב בתיבת
  הדואר, או HMAC עם מפתח — מפתח חדש הוא צעד בעלים) משנים את התכנון של הפסיקה. אין חשיפה לפני המכירה הראשונה
  (`enable` לא עבר), ולכן זו החלטה ל-Fable לפני `enable`.
- **ניסיון חוזר שנעצר נשאר ומכשיל כל ריצה** (פעמיים ביום) עד שסשן מטפל בו — "Any other stop keeps today's
  behaviour" של הפסיקה, ועדיף על מחיקה שקטה של החזר שהובטח בתשובת ההמתנה. `already-refunded` הוא החזר שקרה.
- **הכתובת בקישור הביטול היא הכתובת בלי התג.** זו אותה תיבה, והכתובת המתויגת שכבר מתפרסמת מגלה אותה, כך שלא
  מתפרסם דבר חדש.
- **החיפוש החוזר לפני כל ניסיון** עולה חיפוש IMAP אחד לכל רשומה בכל ריצה; לכן הוגבל לשלושה ימים סביב הבקשה.

## 5. שגיאות וניסיונות שנכשלו

- עריכה אחת של `gumroad-pro-product.yml` נכתבה בטעות לקובץ של ה-checkout הראשי (`/home/user/automaton/.github/…`)
  במקום ל-worktree. זיהיתי מיד והחזרתי את השינוי ב-Edit הפוך; `git status` של הקובץ שם נקי. בעריכה הבאה השתמשתי בנתיב
  ה-worktree בלבד.
- החלפה ראשונה ב-`brand-mail.yml` נכשלה כי "Move to the branch tip" מופיע בשלוש משימות; עוגנתי להערה שלפניו.
- `render-watch-js.test.ts` נכשל ב-worktree: ב-`node_modules` שלו יש רק `.vite` (נוצר ב-08:40), ואין
  `playwright-core/package.json`; הבדיקה קוראת את הנתיב ישירות. סביבתי, לא קשור לשינוי (אין קבצי render-watch ב-diff).

## 6. בדיקות ופעולות ולידציה

- il-biz-tools `npx vitest run`: 892 עוברות, נכשלת אחת שנכשלה כבר קודם (`osek-zair-page.test.js`, `nevo-vat-law`
  חסר ב-`research/rendered/urls.txt`).
- `python3 -m unittest` (שורש ה-repo): 142 עוברות.
- `pnpm typecheck`: נקי.
- `npx vitest run src/__tests__/revenue`: 1305 עוברות, נכשלת אחת סביבתית (למעלה).
- מוטציות: 26 שינויים מכוונים בקוד החדש (dry run שעוצר, "&", `none` שקט בחלון/מחלוקת/מוצר אחר, `already-refunded`,
  בדיקת הקונה, תנאי ה-PR, התג בקישור, נוסח דף הבית, `answered_senders`, מפתח הניסיון, `retry_result`, העברת השולח,
  חיפוש לא מוגבל, `REFUND_REPLY`, `persist-credentials`, pull לא מוגן, push בלי טוקן, טוקן בצעד המשיב) — כולם הכשילו
  בדיקה; השורד היחיד (בדיקת זמן הרכישה) קיבל assertion על ההודעה ונהרג.
- grep על ה-diff: אין שם בעלים; הכתובות שנוספו הן דומיינים שמורים לדוגמה ו-`il-biz-tools.netlify.app` של הבדיקות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- סקריפט המוטציות (`mutate.py` ב-scratch) נכתב שוב בכל סשן; שווה כלי ב-`scripts/` שמקבל קובץ מוטציות לצד כל בדיקה.
- שומר נתיב: כלי עריכה שמסרב לכתוב מחוץ ל-worktree כשהמשימה היא worktree היה מונע את הטעות בסעיף 5.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `gumroad-pro-product.js` במלואו (כ-1100 שורות) — נחוצה חלקית; החלק של `refund` היה מספיק.
- חיפוש רקע בכל תיקיית ה-scratch אחרי `PUBLIC_ACTIONS` שנתקע מעל 120 שניות — עדיף היה לחפש קודם ב-`gr/`.
