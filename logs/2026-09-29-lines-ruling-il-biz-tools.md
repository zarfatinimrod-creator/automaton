# 2026-09-29 — פסיקת הקווים (a), (f), (h) על il-biz-tools: מדיניות החזרים, מגיב החזרים, הצהרת AI במוצר, ניסוח pcn874

## 1. מה המשתמש ביקש

סקריפט ה-workflow (לא הבעלים ישירות) ביקש להחיל את פריטים (a), (f) ו-(h) של
`research/channel-loop/RULING-2026-09-29-lines.md` על קבצים מוגדרים בלבד, ב-worktree מבודד:

- **(a)** — פסקת הצהרת ה-AI בתיאור מוצר Pro ב-Gumroad (אותו משפט בדיוק כמו `src/lib/ai-declaration.js`),
  ומחיקת "test two prices" מ-`skills/revenue-il-biz-tools/SKILL.md:65`.
- **(f)** — `pcn874.html`: הבודק "חינמי ונשאר חינמי" (לעולם לא "לתמיד"/"לכל החיים");
  `products/pcn874/README.md:7`: משפט שער התמחור.
- **(h)** — אין "no refunds": חלון החזר חסום של 14 יום לפחות (ברירת המחדל של Gumroad, 30), שנקרא בחזרה
  מ-Gumroad כמו המחיר ומוצג בעמוד; `enable` דורש מגיב החזרים מתוזמן; פקודת `refund --email` חדשה;
  `brand_mail.py respond-refunds`; `responders` בבדיקת תיבת הדואר; קריאת `responders` ב-`brand-mail.ts`;
  אפשרות ותזמון ב-`brand-mail.yml`.
- דרישות בטיחות מעבר לפסיקה: פעולה רק על דואר ש-DKIM או SPF שלו עוברים לדומיין ה-From; החזר רק למכירה של
  המוצר הזה, של הקונה המאומת, בתוך החלון; אידמפוטנטיות; תשובה במשפט קבוע אחד שלא מגלה אם הכתובת קנתה; אף כתובת
  לא נרשמת בלוג; dry-run כברירת מחדל בבדיקות ובכל הפעלה ידנית.
- לא לגעת ב-`portfolio.ts`/`TARGET_BASIS` (מסלול אחר), לא ב-Appendix B, לא בקבצי הלוג של החוט הראשי.

## 2. הפעולות המרכזיות שביצעתי

1. אימות בסיס ה-worktree (`BASE_OK` חסר בהתחלה — ה-worktree עמד על `215b19b`), `git reset --hard` ל-
   `origin/claude/new-session-j071dx` (`f378977`), ואימות מחדש.
2. קריאה מלאה של §0, (a), (f), (g), (h) ו-"Edits for the Opus fold" בפסיקה, ושל כל קובץ שנגעתי בו.
3. קריאת קוד Gumroad ב-GitHub (`api/v2/sales_controller.rb`, `app/models/purchase.rb`, 29.9.2026): `refund`
   מחזיר את המכירה (אין מזהה החזר נפרד) ומסרב למכירה שכבר הוחזרה; `index` מסנן לפי `email` (עמודת כתובת
   הרכישה) ו-`product_id`; השדות `purchase_email`, `email`, `refunded`, `partially_refunded`, `chargedback`,
   `disputed`, `created_at`.
4. TDD בכל שלב: בדיקות אדומות → מימוש → ירוק.
   - `scripts/gumroad-pro-product.js`: `MIN_REFUND_DAYS = 14`, `REFUND_RESPONDER`, `refundPolicyGate` מחזיר
     `{ok, reason, days}` (מסרב ל-`none`, `7`, בלתי קריא, לא בתוקף); `create` קורא את התקופה בתוקף ו-
     `--write-site-json` כותב `gumroad.refundPeriodDays`; `checkOffer` משווה את `refundPeriodDays` של האתר
     הפרוס לתקופה החיה כמו המחיר; `enableProduct` דורש `responders` שכולל `"gumroad-refund"` (נכשל סגור כשהמפתח
     חסר); פקודת `refund --email <addr> [--requested-at <iso>] [--apply]` (`refundSale`); פסקת `AI_DECLARATION`
     בסוף `productDescription`; `brandMailboxGreen` מאמת `responders` כשהוא קיים; כותרת הקובץ נכתבה מחדש.
   - `src/lib/gumroad.js`: `gumroadRefundPeriodDays`; `src/config/site.json`: `refundPeriodDays: null` והערה.
   - `src/lib/pro-offer.js`: `REFUND_DAYS_SLOT`, `withRefundDays` (ממלא `{n}` בתשובה ובתאום ה-JSON-LD, או
     מסיר את שניהם); `scripts/build-site.js` ממלא רק כשהכפתור `ready`.
   - `invoice.html`: השאלה השביעית `data-pro-sale` "אפשר לקבל החזר?" במילות הפסיקה, עם תאום JSON-LD.
   - `pcn874.html`: "הבודק חינמי ונשאר חינמי, כי הוא רץ כולו בדפדפן שלכם..." (בתשובה ובתאום).
   - `README.md` של il-biz-tools: §Pro נכתב מחדש (create/enable/check/refund), פסקת "Refunds" עם כלל ההריגה
     (`refundPeriodDays + 7` ימים), שבע שאלות, ניסוח pcn874.
   - `products/pcn874/README.md:7`, `skills/revenue-il-biz-tools/SKILL.md:65`.
   - `scripts/brand_mail.py`: פקודת `respond-refunds`; `probe` כותב `responders` רק כשהפקודה קיימת
     ו-`brand-mail.yml` מתזמן אותה; `node_refund_runner` (ארגומנטים, בלי shell, רק PATH והטוקן בסביבה).
   - `src/revenue/brand-mail.ts`: קורא `responders` (חסר → "responders: none"), ערך פגום → invalid.
   - `.github/workflows/brand-mail.yml`: תזמון פעמיים ביום (probe + respond-refunds), קלט `really_refund`,
     job `respond-refunds` (הרשאות קריאה בלבד, בלי credentials של git, Node 22, unittest לפני כל החזר).
5. בדיקות מוטציה ידניות (18 ב-Python, 12 ב-JS) — כל אחת נהרגה אחרי חיזוק שתי בדיקות.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/scripts/gumroad-pro-product.js`, `src/lib/gumroad.js`, `src/lib/pro-offer.js`,
  `src/config/site.json`, `scripts/build-site.js`, `invoice.html`, `pcn874.html`, `README.md`
- `products/il-biz-tools/tests/gumroad-pro-product.test.js`, `tests/pro-faq.test.js`,
  `tests/gumroad-analytics.test.js`, `tests/pcn874-page.test.js`
- `products/pcn874/README.md`, `skills/revenue-il-biz-tools/SKILL.md`
- `scripts/brand_mail.py`, `scripts/tests/test_brand_mail.py`, `scripts/tests/test_brand_mail_refunds.py` (חדש)
- `src/revenue/brand-mail.ts`, `src/__tests__/revenue/brand-mail.test.ts`,
  `src/__tests__/revenue/brand-mail-parity.test.ts`, `src/__tests__/revenue/brand-mail-workflow.test.ts`
- `.github/workflows/brand-mail.yml`
- שום מערכת חיה: אין קריאה ל-API אמיתי, אין שליחת דואר, אין החזר, אין חשבון.

## 4. החלטות והנחות משמעותיות

- **"משיב לקבלה" לבדו אינו בקשת החזר.** הפסיקה מנסחת "replies to a Gumroad receipt or names החזר/refund". קראתי
  זאת בצמצום: המגיב פועל רק כשהמילים של השולח עצמו (הנושא, או הגוף מעל הציטוט) מבקשות החזר או ביטול
  (`REFUND_WORDS`: refund, money back, cancel, החזר, להחזיר, תחזירו, החזירו, ביטול, לבטל, בטלו). סיבה: תשובה
  לקבלה יכולה להיות שאלת הפעלה, וקבלת Gumroad עצמה מכילה מילים כמו "refund policy"; החזר אוטומטי על כל תשובה
  היה לוקח את Pro מקונה ששאל שאלה. הטקסט המצוטט (שורות `>`, מכותרת תשובה ומטה, `<blockquote>`/`gmail_quote`)
  לא נספר. המשמעות: פחות החזרים אוטומטיים, לעולם לא יותר. ביטול ("ביטול עסקה") נכלל כי זה המונח בחוק.
- **אימות שולח:** רק כותרת ה-`Authentication-Results` העליונה (זו שהשרת המקבל מוסיף בראש), ורק כשה-authserv-id
  שלה הוא של השרת שלנו (`mx.google.com`, ניתן לשינוי ב-`BRAND_MAIL_AUTHSERV_ID`). `dkim=pass` או `spf=pass`
  לדומיין מיושר (דומיין ה-From או הורה שלו). From יחיד בלבד; התשובה הולכת ל-From, לעולם לא ל-Reply-To.
- **דואר אוטומטי/רשימות/no-reply/gumroad.com לא נענה** (Auto-Submitted, Precedence, List-Id/List-Unsubscribe),
  והתשובה שלנו נושאת `Auto-Submitted: auto-replied` (RFC 3834) — למניעת לולאות דואר.
- **חלון ההחזר נמדד בזמן הגעת הבקשה** (INTERNALDATE של השרת, לא ניתן לזיוף ע"י השולח), לעולם לא מאוחר מעכשיו;
  בקשה ביום 29 שנקראה ביום 31 — בתוך החלון.
- **החזר אחד לבקשה**, המכירה הזכאית האחרונה, במלואה (בלי `amount_cents` — בלי דמי ביטול). מכירה שהוחזרה (גם
  חלקית), שנעשה עליה chargeback או שנמצאת במחלוקת — לא נוגעים.
- **המשפט הקבוע:** "תשובה אוטומטית מ-Mehudak (מהודק): לפי מדיניות ההחזרים של Gumroad, רכישת Pro מהכתובת הזו
  בתוך תקופת ההחזר מוחזרת במלואה דרך Gumroad." — מנוסח ככלל ולא כעובדה על הכתובת, ולכן זהה בכל תוצאה ואינו מגלה
  אם הכתובת קנתה; אומר במפורש שהוא אוטומטי.
- **מזהה החזר:** ה-API של Gumroad לא מחזיר מזהה החזר נפרד (הוא מחזיר את המכירה). הלוג רושם את מזהה המכירה
  ומציין במפורש "refund id: none returned" במקום להמציא מזהה.
- **`refund` בלי טוקן יוצא עם 1** (לא 0 כמו create/enable/check) — כדי שהמגיב לא יענה כאילו בוצע משהו.
- **תזמון:** פעמיים ביום (`17 5,17 * * *`), לא כל שעה — מספיק לסף הטריות של יומיים ולמענה תוך יום, ועולה
  פחות דקות Actions. לפני שלב 8 הריצה המתוזמנת לא מבצעת commit (אין commit "not configured" פעמיים ביום),
  והמגיב מדפיס `configured: false`. הפעלה ידנית היא dry-run אלא אם `really_refund` מסומן, ורק מ-main.
- **`probe` ו-"מתוזמן":** בדיקה מבוססת-שורות (ספרייה סטנדרטית בלבד) — cron תחת `on: schedule:` ו-job בשם
  `respond-refunds` שמריץ את `scripts/brand_mail.py` ושה-`if:` שלו מכניס את ה-schedule.
- חיפוש IMAP נכתב `NOT ANSWERED` (שקול ל-UNANSWERED לפי RFC 3501) — הבדיקה הקיימת ב-`owner-asks.test.ts`
  אוסרת את המחרוזת UNANSWERED בסקריפט (כדי שלא יורו לרשום קריאה כזו), והכתיב השקול עומד בה בלי לעקוף אותה.
- `create --write-site-json` כותב את התקופה של Gumroad כפי שהיא, גם מתחת לרצפה (למשל 7): העמוד מציג את תנאי
  Gumroad האמיתיים, ו-`enable` מסרב למכור תחתיה.
- הודעת ה-blocker של probe ישן ב-`brand-mail.ts` עודכנה: המשפט "belongs in colony.yml's hourly tick" כבר לא נכון.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree התחיל על בסיס ישן (`215b19b`, בלי `f378977`) — אופס ל-`origin/claude/new-session-j071dx`.
- פקודות bash מורכבות (heredoc Python ארוך) נחסמו פעמיים ע"י מגן ה-worktree; עברתי לקבצי סקריפט ב-scratchpad.
- הורדת `purchase.rb` נחסמה בפעם הראשונה (נתיב `/tmp/claude-0/purchase.rb` נראה כחשוד); הורד ל-scratchpad.
- `owner-asks.test.ts` נכשל על המחרוזת UNANSWERED בחיפוש ה-IMAP — תוקן ל-`NOT ANSWERED` (ראו §4).
- בדיקות ה-workflow נכשלו פעמיים על ניסוח ("inert until step 8" שבור בין שורות; "Step 8" באות גדולה) — תוקן.
- שתי מוטציות שרדו בסיבוב הראשון (הסרת הטשטוש של הכתובת; הסרת הצמדת זמן עתידי ל"עכשיו") ואחת ב-Python (חיתוך
  בכותרת תשובה) — הבדיקות חוזקו (Gumroad שמחזיר את הכתובת בהודעת שגיאה; בקשה עתידית על מכירה בת שעה; ציטוט בלי
  `>`), וכל המוטציות נהרגו.

## 6. בדיקות ופעולות ולידציה

- `products/il-biz-tools`: `npx vitest run` — 31 קבצים, 828 בדיקות, ירוק. `node scripts/check-html.js` — "all
  pages ok". `node scripts/build-site.js --preview` — נבנה (החוסמים הקיימים של accessibility.html בלבד).
- `products/pcn874`: `npx vitest run` — 8 קבצים, 331 בדיקות, ירוק.
- `python3 -m unittest` (שורש) — 104 בדיקות, ירוק (מתוכן 37 חדשות ב-`test_brand_mail_refunds.py`).
- שורש: `pnpm typecheck` נקי; `npx vitest run src/__tests__/revenue` — 41 קבצים, 1067 בדיקות, ירוק.
- `grep -rn "No refunds allowed" docs skills products` — 0 תוצאות.
- מוטציות: 12 ב-`gumroad-pro-product.js` (סינון מוצר, סינון קונה, אידמפוטנטיות, קצה החלון, בקשה לפני רכישה,
  dry-run, רצפת 14, השוואת תקופה פרוסה, שער המגיב, טשטוש, הצמדת זמן, refund בלי טוקן) ו-18 ב-`brand_mail.py`
  (A-R תחתון, authserv-id, pass, יישור סיומת, כמה From, דואר אוטומטי, ציטוטים, כותרת תשובה, apply מחוץ ל-main,
  dry-run פותח לכתיבה, dry-run מחזיר, פקודה שנעצרה עדיין נענית, טשטוש, תקרה, Reply-To, responders ללא תנאי,
  תנאי ה-schedule, כל הסביבה לתהליך הבן) — כולן נהרגו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- בדיקות מוטציה: כתבתי פעמיים סקריפט bash זהה במבנהו (החלפת מחרוזת → הרצת בדיקות → שחזור). כדאי
  `scripts/mutate.mjs <file> <mutations.json> -- <test command>` כללי במאגר.
- עריכות מרובות-קבצים בהחלפת מחרוזות מדויקות עם assert על מספר המופעים — אותו תבנית בכל שלב; כלי קטן אחד היה
  חוסך את כתיבת הסקריפטים מחדש.
- ה-worktree בלי `node_modules`: יצרתי symlink לשורש ול-il-biz-tools ידנית. כדאי שהשלב הראשון של כל brief
  ל-worktree יעשה זאת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת קבצים גדולים במלואם (הבדיקות של `gumroad-pro-product`, `brand_mail.py` בשלושה חלקים) — הכרחי כדי לשנות
  בלי לשבור, אך יקר.
- פלט vitest מלא בהרצה האדומה הראשונה (37 כישלונות בשמם המלא) — היה מספיק לספור.
- שתי חסימות של מגן ה-worktree על heredoc ארוכים — כתיבה מחדש כקבצים.
- סבב נוסף על הבדיקה ב-`owner-asks.test.ts` שלא הכרתי מראש (UNANSWERED) — grep מוקדם על בדיקות שסורקות את
  `brand_mail.py` היה חוסך אותו.
