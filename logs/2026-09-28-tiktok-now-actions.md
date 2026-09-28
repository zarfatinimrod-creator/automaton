# 28.9.2026 — פעולות ה-NOW מלקחי הטיקטוק: הצעת ה-Pro בדף הקבלות (N1–N6)

> בונה A (Opus, worktree מבודד, ענף `worktree-wf_eba3c287-2b9-1` מבסיס `35df52b`). בונה B ממשיך את היומן הזה עם
> הפריטים שלו. מקור העבודה: `research/tiktok/08-sales-marketing-lessons.md` §8.1 (טבלת ה-NOW), §4 (לקחי המכירה)
> ו-§8.4 (מה נדחה).

## 1. מה המשתמש ביקש

לבנות את פריטים N1–N6 מטבלת ה-NOW של פתק הטיקטוק, על `products/il-biz-tools/invoice.html` והקוד שלו:

- **N1** מחיר ומה-מקבלים בטקסט גלוי בקופסת ה-Pro — המחיר רק במצב `ready`, מהקריאה החוזרת של Gumroad, אף פעם לא
  מוקלד ידנית; "תשלום חד-פעמי, בלי מנוי" גלוי; שורת אמון אחת.
- **N2** תצוגה מקדימה לפני תשלום — על המסך בלבד; ההדפסה של משתמש חינמי לא משתנה; בלי סימן מים.
- **N3** שורה עובדתית אחת, שאפשר לסגור, אחרי הדפסה חינמית — פעם בסשן, בלי חלון קופץ ובלי טיימר, localStorage
  בתוך try/catch.
- **N4** שאלות ותשובות על המחיר (א)–(ו) ב-`invoice.html` ובקצרה ב-`index.html`, כולל JSON-LD, מחירים שמוזרקים
  בבנייה, וכל תשובה נבדקת מול הקוד.
- **N5** שם אחד למוצר, לפי מה שמקבלים, בדף, ב-`src/lib/gumroad.js` וב-`scripts/gumroad-pro-product.js`.
- **N6** `enableProduct` מסרב אלא אם `state/colony/brand-mail.json` מראה את בדיקת התיבה מוגדרת וירוקה (`create`
  נשאר פתוח), וצעד 3 אומר שהמייל להרשמה ל-Gumroad הוא תיבת המותג מצעד 8.

כללים: TDD; בלי שמות אישיים (הפנים היחידות: Mehudak / מהודק); עברית בפנייה ברבים; ערך כן בלבד — בלי מחסור
מדומה, ספירה לאחור, מחיר "היה", המלצות מומצאות או מספרי משתמשים; ₪0.

## 2. הפעולות המרכזיות שביצעתי

1. **בסיס:** ה-worktree התחיל על `123b7d4` (בלי `08-sales-marketing-lessons.md`). `git reset --hard
   origin/claude/new-session-j071dx` → `35df52b`, ואז קריאת הפתק, הקוד והבדיקות.
2. **N1+N5, שכבת הספרייה** (`19bb71d`): `PRO_PRODUCT_NAME = 'Pro – הלוגו וצבע המותג על המסמך'`,
   `GUMROAD_STORE_NAME = 'Mehudak (מהודק)'`, `gumroadPrice`/`formatProPrice`, ו-`proButtonState` שנפתח רק עם כתובת +
   מזהה + מחיר, מחזיר `price` רק ב-`ready`, מוסיף מצב סגור חמישי `no_price`, ותווית "לרכישה ב-Gumroad".
   בסקריפט המוצר: השם הקבוע, צעד ההפעלה 3 בשם הזה, `readBackPrice` שקורא `price`/`currency` מהמוצר ש-Gumroad
   שמרה ועוצר על מנוי או על "שלמו כמה שתרצו", ו-`writeSiteJson` שכותב `priceCents` ו-`currency`.
   שמות השדות אומתו בקוד של Gumroad עצמה: `antiwork/gumroad` `app/models/concerns/product/as_json.rb`,
   `as_json_for_api` (`"price" => default_price_cents`, `"currency" => price_currency_type`,
   `subscription_duration`, `customizable_price`), נקרא ב-28.9 מ-raw.githubusercontent.com.
3. **N1+N5, הדף** (`1a125df`): כותרת הקופסה בשם המוצר; "תשלום חד-פעמי, בלי מנוי." כטקסט גלוי ליד הכפתור; מקום
   מחיר `#pro-price` מוסתר וריק שהדף ממלא רק ב-`ready`; שורת האמון בתוך שורת הפעולות. תיקון פנייה ביחיד בזכר
   ("אליך... הזן", "שלך") לרבים.
4. **N2** (`0427099`): `applyBranding` מקבל `'off' | 'trial' | 'pro'`. ניסיון מסמן `data-brand-trial` ומשתנה
   `--brand-trial-accent` שרק בלוק `@media screen` קורא; בהדפסה הלוגו מוסתר תחת הסימון. הערת "אפשר לנסות לפני
   שקונים" מעל ההעלאה. הניסיון נפתח רק ב-`ready` בלי רישיון.
5. **N3** (`79e0854`): `src/lib/pro-nudge.js` — השורה, התנאים (אחרי הדפסה, `ready`, בלי רישיון, ורק אם ניסו
   מיתוג), פעם בסשן (sessionStorage), סגירה לתמיד (localStorage), כל גישה לאחסון ב-try/catch ודגל בזיכרון.
   `#pro-nudge` בתוך `.editor`, כך שההדפסה מסתירה אותו.
6. **N4** (`7360e28`): `#pro-faq` עם שש שאלות, תאומי JSON-LD באותן מילים, ושאלה מקוצרת ב-`index.html`.
   `src/lib/pro-offer.js` `withProPrice` ממלא את `<span data-pro-price></span>` ב-" של <מחיר>" ומעדכן את תאום
   ה-JSON-LD; `scripts/build-site.js` מזריק את `proButtonState(site).price` ועוצר את הבנייה על סטייה.
7. **N6, השער** (`4d61467`): `brandMailboxGreen` (אותם כללים כמו `src/revenue/brand-mail.ts`), ו-`enableProduct`
   שמסרב לפני כל בקשה. ה-CLI קורא את קובץ הבדיקה של הריפו או את `BRAND_MAIL_PROBE_FILE`. הערת ההרצה ב-
   `gumroad-pro-product.yml` עודכנה.
8. **N6, צעד 3** (`f1e6d02`): סעיף 1 בצעד 3 של `docs/OWNER_STEPS.he.md` (בשם הפועל), הטקסט של `gumroad` ב-
   `src/revenue/owner-steps.ts`, בדיקה, ו-PDF שנוצר מחדש.
9. **README** (`e9506a8`) של המוצר: חמישה מצבי כפתור, המחיר מהקריאה החוזרת, השער, וההצעה בדף.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/src/lib/gumroad.js`, `src/lib/branding.js`, `src/lib/pro-nudge.js` (חדש),
  `src/lib/pro-offer.js` (חדש), `src/config/site.json` (שדות `priceCents: null`, `currency: ""`).
- `products/il-biz-tools/scripts/gumroad-pro-product.js`, `scripts/build-site.js`.
- `products/il-biz-tools/invoice.html`, `index.html`, `assets/page-invoice.js`, `assets/style.css`, `README.md`.
- בדיקות: `tests/gumroad-analytics.test.js`, `tests/gumroad-pro-product.test.js`, `tests/page-invoice.test.js`,
  `tests/license-branding.test.js`, `tests/pro-offer.test.js` (חדש), `tests/pro-nudge.test.js` (חדש),
  `tests/pro-faq.test.js` (חדש), `tests/helpers/html.js` (חדש).
- `.github/workflows/gumroad-pro-product.yml` (הערה בלבד).
- `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`, `src/revenue/owner-steps.ts`,
  `src/__tests__/revenue/owner-steps.test.ts`.
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`.

## 4. החלטות והנחות משמעותיות

- **"להעביר" את "תשלום חד-פעמי, בלי מנוי" — הוספתי במקום להעביר.** הגילוי המלא ב-`#pro-privacy` הוא נוסח
  מילה-במילה מההחלטה (`gumroad-license-decision.md` §6), ו-AT-13 נועל אותו. לכן המשפט נשאר שם וגם מופיע גלוי ליד
  הכפתור.
- **מצב חמישי `no_price`:** קופה בלי מחיר גלוי סותרת את N1, אז הכפתור נשאר סגור עד ש-Gumroad מחזירה מחיר. `site.json`
  שנכתב לפני השינוי (כתובת ומזהה בלי מחיר) לא פותח מכירה.
- **המחיר רק מהקריאה החוזרת:** `createOrReuse` מחזיר את המחיר ש-Gumroad שמרה, לא את זה שביקשנו; אם מישהו שינה את
  המחיר ב-Gumroad, הדף מראה את החדש. מוצר מנוי או "שלמו כמה שתרצו" עוצר את העבודה, כי הדף אומר מחיר קבוע אחד, פעם
  אחת.
- **שם המוצר לא תלוי ב-`siteName`** ("כלים לעסק" אינו המותג). אפשר לשנות אותו רק לפני ריצת `create` הראשונה, כי
  השימוש החוזר הוא לפי שם מדויק; `productId` ב-`site.json` ריק, וה-token עוד לא קיים, כך שלא רץ `create`.
- **N3 מוצג רק למי שניסה מיתוג.** "רצוי שניסו את התצוגה" בפתק פורש כתנאי: למי שניסה, השורה מסבירה למה הלוגו לא
  הודפס, כלומר היא מידע ולא רק בקשה. "פעם בסשן" = sessionStorage; "סגירה" נשמרת ב-localStorage.
- **שורת החנות "המכירה ב-Gumroad, בחנות Mehudak (מהודק)"** מופיעה בכפתור רק ב-`ready`, ובתשובה (ו) כתיאור של
  ההסדר. שם החנות נקבע בצעד 3 ("שם החנות: Mehudak"), והוא קבוע אחד ב-`GUMROAD_STORE_NAME`; הבדיקה משווה את
  התשובה אליו.
- **ההזרקה בבנייה ולא בדפדפן:** ה-JSON-LD הוא מה שמנועי חיפוש קוראים, ולכן המחיר נכנס אליו רק בבנייה, ורק
  כשהכפתור `ready`. תאום ה-JSON-LD חייב להיות זהה לתשובה הגלויה בלי המחיר, אחרת הבנייה נעצרת.
- **כללי "ירוק" לתיבת המותג שוכפלו ב-JS** (המוצר עצמאי ולא מייבא TypeScript מהשורש). אם הפורמט של
  `brand_mail.py` ישתנה, הבדיקה תיכשל סגורה (enable יסרב), לא פתוחה.
- **הנוסח של צעד 3 בשם הפועל** ("להירשם...") כמו בצעד 8, ולא בציווי בזכר; שאר הסעיפים של צעד 3 לא שונו.
- **הצהרה על שימוש ב-AI:** אין כזו כרגע באתר, והיא לא חלק מ-N1–N6. לא הוספתי אותה; זה פתוח להחלטה של הת'רד
  הראשי.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree התחיל על בסיס ישן (`123b7d4`) — אופס עם reset כפי שהתדריך הורה.
- פקודות bash מורכבות (heredoc לקבצים, משתני shell שמריצים node) נחסמו על ידי בידוד ה-worktree; עברתי ל-Write
  ולסקריפטים בקבצים.
- `formatProPrice` החזיר מחרוזת גם למטבע מומצא (`zzz`) כי `Intl` מקבל כל קוד בן שלוש אותיות; נוסף סינון לפי
  `Intl.supportedValuesOf('currency')`.
- בדיקת "אין סימן מים" נכשלה על הערת CSS שלי שמכילה את המילה; הבדיקה בודקת עכשיו כללים בלבד, בלי הערות.
- בדיקת הבנייה עם המחיר נכשלה על רווח בלתי-שביר (NBSP) ש-`formatILS` מכניס ו-`textOf` מקפל; תוקן בבדיקה
  (נרמול), לא בקוד.
- לא היו כלים לחילוץ טקסט מ-PDF (`pdftotext`, `pypdf`), אז את צעד 3 בדקתי ברינדור של אותו HTML שהסקריפט מדפיס.

## 6. בדיקות ופעולות ולידציה

- כל בדיקה נכתבה לפני הקוד וראיתי אותה נכשלת מהסיבה הנכונה (פונקציה/אלמנט חסרים), ואז עוברת.
- `products/il-biz-tools`: `npx vitest run` — 23 קבצים, 531 בדיקות עוברות (היו 20/447 בבסיס).
  `node scripts/check-html.js` — "all pages ok".
- שורש: `pnpm typecheck` נקי; `npx vitest run src/__tests__/revenue` — 38 קבצים, 973 בדיקות עוברות.
- `node scripts/owner-steps-pdf.mjs` — 15 עמודים; צעד 3 רונדר ל-PNG ונבדק בעין.
- בדיקה חזותית של N2 בכרום headless עם גיליון הסגנונות האמיתי (הדפסה מודמית: `@media print`→`all`,
  `@media screen`→`not all`): בניסיון רואים לוגו וצבע על המסך, וההדפסה זהה להדפסה החינמית; ב-Pro ההדפסה נושאת את
  המיתוג.
- בניית `--preview` בעותק זמני: עם `site.json` של היום אין מחיר בשום דף; עם מחיר ₪79 מ-Gumroad, התשובה (ד) והשאלה
  בדף הבית אומרות אותו, גם בטקסט הגלוי וגם ב-JSON-LD.
- לא נבדק: ריצת `create`/`enable` אמיתית מול Gumroad (אין token; זה ממתין לצעדים 3 ו-6), ודפדפן אמיתי עם
  `afterprint`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **קוראי HTML ברמת מחרוזת** (`textOf`, `elementById`, `ancestorsAt`) היו מועתקים בין קבצי בדיקה; ריכזתי אותם ב-
  `tests/helpers/html.js`. `option-c-site.test.js` עדיין מחזיק עותק משלו; כדאי להעביר גם אותו.
- **בדיקה חזותית של הדפסה:** אין Playwright בריפו, אז הדמיית ההדפסה נעשתה בשכתוב של media queries. סקריפט קבוע
  (או תלות playwright-core ב-devDependencies) שמצלם מסך והדפסה של דף יחסוך את זה בפעם הבאה.
- **חילוץ טקסט מ-PDF** לבדיקת `OWNER_STEPS.he.pdf`: אין כלי בקונטיינר; כדאי שהסקריפט ייצר גם קובץ HTML/טקסט לצד
  ה-PDF כדי שבדיקה תוכל לקרוא אותו.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפתק (919 שורות) — קראתי רק את §0, §4, §6.2–6.3 ו-§8; פלט §6–§8 נחתך פעם אחת וחזרתי לחלקים.
- חיפוש שמות שדות המחיר ב-Gumroad: `link.rb` (89KB) לא הכיל אותם; הקובץ הנכון היה `concerns/product/as_json.rb`.
- שלושה ניסיונות bash שנחסמו בבידוד ה-worktree (heredoc ומשתנים), כל אחד עם הרצה חוזרת בדרך אחרת.
- ההודעות החוזרות על רשימת המשימות של הסשן הראשי (לא רלוונטיות לבונה).
