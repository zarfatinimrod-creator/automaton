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

---

# בונה B — N7, N8, N9, N10, N12, N14, N15 (28–29.9.2026)

> בונה B (Opus), באותו worktree ובאותו ענף, אחרי `ab1e63c` של בונה A. לא נגעתי ב-`logs/CHECKPOINT.md`,
> `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md` או `CLAUDE.md`. שום דבר לא נדחף.

## 1. מה המשתמש ביקש

להמשיך את טבלת ה-NOW של פתק הטיקטוק (`research/tiktok/08-sales-marketing-lessons.md` §8.1, עם §4 ו-§8.4):

- **N7** המשבצת שאחרי תוצאה בדף בודק ה-PCN874: הדפסה / PDF של הממצאים עם שם הקובץ, תאריך הבדיקה, שורות ההיקף
  כלשונן ו"אינו ייעוץ מס"; שיתוף שהמשתמש יוזם, ביציאה ל-`navigator.share` בלבד — קישור ה-WhatsApp נשאר מאחורי דגל
  כבוי עד בדיקה מתועדת במכשירים; טקסט השיתוף נושא רק ספירות ושמות כללים, אף ערך מתוך הקובץ; שאלה "למה הבודק
  חינמי?" בלי קישור למוצר בתשלום.
- **N8** מקור ותאריך בדיקה ליד כל מספר סטטוטורי ב-`osek-patur.html` מתוך `src/config/osek-patur.json`, ותווית לשנה
  שעברה; אחר כך `vat.html` ו-`net-salary.html` רק היכן שהקונפיג `verified: true`.
- **N9** פסקאות פתיחה שמדברות על מה שהמשתמשים מרוויחים, והשורה "בלי להשאיר פרטים ובלי שיחה".
- **N10** רשימת כללי ה-PCN874 שנוצרת בבנייה מטבלת הכללים של הבודק, כך שהדף והכלי לא יכולים להתפצל.
- **N12** מסמך אחד של רשימת בדיקה לפרסום וידאו לכל משטח, `docs/VIDEO_PUBLISHING_CHECKLIST.md`, עם סימון של מה
  שדורש את עיני הבעלים.
- **N14** הערות תיקון מתוארכות לצד הטענות המקוריות, בלי לשכתב אותן.
- **N15** שורת ההיקף לרואי חשבון ("קובץ של עוסק אחד – שלכם או של לקוח"), ובלי הצעה לריבוי לקוחות בשום מקום.

## 2. הפעולות המרכזיות שביצעתי

1. **N10, טבלת הכללים בבודק עצמו.** ב-`products/pcn874` לא הייתה טבלת כללים כנתונים: כל חומרה וכל מקור היו כתובים
   בתוך כל קריאת `c.add`. הוספתי `RULES` (ו-`RuleEntry`) ל-`src/validate.ts`: שורה לכל מזהה כלל, ושתי שורות
   (`variant`) כשאותו מזהה מדווח בשתי חומרות או בשני סטים של מקורות (`detail.S.counterpartyExpected`,
   `detail.invoiceSumSign.signOfZero`, `file.record.unknown`, `footer.recordType.literal`). כללי השדות נגזרים
   מהפריסה (`recordRules`), כללי הצד שכנגד מ-`COUNTERPARTY_ROWS`. כל בדיקה לוקחת עכשיו חומרה ומקורות רק דרך
   `ruleOf(id, variant)`, שזורק על מזהה שאינו בטבלה. בדיקה חדשה `tests/rules.test.ts` מריצה את כל ה-fixtures ועוד
   מוטציה של כל שדה בכל רשומה: כל ממצא שווה לשורה שלו, וכל שורה מדווחת על ידי קלט כלשהו (ראיתי אותה נכשלת על שורת
   רפאים שהוספתי בכוונה).
2. **N10, הדף.** `src/lib/pcn874-rule-reference.js` הופך את `RULES` (מהעותק ב-`src/vendor/pcn874/`) לסעיף "כל
   הכללים שהבודק בודק": כל כלל, שגיאה או אזהרה, השורות בחוזר, והסבר בעברית באותו נוסח שהדף נותן לממצא
   (`ruleHebrew`, ו-`fieldRuleHebrew` / `REPRESENTATIVE_INITIAL_HE` לשתי הגרסאות החריגות), ואחריו "מה הבודק אינו
   בודק". הסעיף שמור ב-`pcn874.html` בין שני סמנים; `scripts/pcn874-rule-reference.js` כותב אותו (`--check` מדווח
   על סעיף מיושן), ו-`scripts/build-site.js` מסרב לבנות, גם `--preview`, כשהסעיף אינו תואם לטבלה. 82 שורות: 67
   שגיאות ו-15 אזהרות.
3. **N7.** `src/lib/pcn874-share.js`: `shareSummary` (רק הכרעה, שתי ספירות ומזהי הכללים), `shareText` (שורה
   שאומרת שהבודק נועד לקובץ של עוסק אחד, הספירות, עד עשרה כללים, "לא אישור… אינו ייעוץ מס", והכתובת לבדה בשורה
   האחרונה עם `?via=share`), `whatsappHref` (`api.whatsapp.com`, אף פעם לא `wa.me`), ו-`WHATSAPP_FALLBACK_ENABLED =
   false`. בדף: משבצת `#pcn-after` שמופיעה אחרי כל בדיקה שהסתיימה (גם נקייה), כפתור הדפסה, כפתור שיתוף שקיים רק
   כשיש `navigator.share` ושולח רק בלחיצה, וכותרת הדפסה `.print-only` עם שם הקובץ, התאריך ו"מסמך זה אינו ייעוץ
   מס". בהדפסה נעלמים בורר הקובץ, המשבצת, השאלות ורשימת הכללים; תיבת ההיקף מודפסת כמות שהיא. נוספה השאלה "למה
   הבודק חינמי?" (גלויה ובתאום JSON-LD זהה).
4. **N15.** בתיבת ההיקף: "כאן אפשר לבדוק קובץ של עוסק אחד – שלכם או של לקוח – קובץ אחד בכל פעם". בדיקה שאף דף
   באתר אינו מציע את הבודק לריבוי לקוחות, ושטקסט השיתוף אינו מזכיר רואי חשבון.
5. **N8.** `src/lib/source-line.js`: `sourceLineHe` (רק לקונפיג מאומת עם `checkedOn`, ומסמן מקור משני),
   `staleYearHe`, `dateHe`, `sourceNameHe` (שזורק על מארח לא מוכר). `checkedOn` ו-`checkedNote` נוספו ל-
   `osek-patur.json` ו-`vat.json`. השורה מופיעה מיד אחרי פסקת הפתיחה ובתשובת השאלות שמציינת את המספר (וגם
   ב-JSON-LD). סקריפט `page-osek-patur.js` מציג "הנתון לא עודכן עדיין לשנת <שנה>" כשהשנה בקונפיג עברה.
   `net-salary.html` לא קיבל שורה, כי `tax-2026.json` אינו מאומת.
6. **N9.** פתיחות חדשות ל-`pcn874.html` ("לפני ששולחים את הדוח המפורט: …") ול-`osek-patur.html` ("כמה נשאר לכם
   עד התקרה השנה, ומתי כדאי להיערך."), והשורה "התוצאה מוצגת מיד, בלי להשאיר פרטים ובלי שיחה." פעם אחת אחרי הפתיחה
   בששה דפי כלים: מע״מ, עוסק פטור, שכר נטו, מספר הקצאה, אגרת רשם, PCN874.
7. **N12.** `docs/VIDEO_PUBLISHING_CHECKLIST.md`: 14 פריטים, לכל אחד משטח, "כלל של הפלטפורמה" או "שלנו", מי
   בודק (קוד / בודק נפרד / **עיני הבעלים**) ומקור. קישורים אליו מ-`skills/revenue-il-biz-tools/SKILL.md`
   ומ-`research/faceless-youtube/T1-PROTOCOL.md`.
8. **N14.** הערות "Correction, 28.9.2026" מיד אחרי הטבלה או הפריט שבו נמצאת הטענה, בלי לגעת בטענה עצמה:
   (א) `distribution--short-video.md` §1; (ב) `tj-offsite.md` L4; (ג) `tj-tiktok.md` L7 ו-`07-ai-money-tooling.md`
   (חמש שורות, `:65`, `:134`, `:166`, `:198`, `:224`); (ד) `docs/REJECTED.md:40`; (ה)
   `gumroad-license-decision.md:27` ו-`:184`. (ו) אינה תיקון לפי הפתק, ולא נגעתי בה.
9. README של il-biz-tools ושל pcn874, ו-SPEC.md §7.1 של pcn874.

## 3. קבצים/מערכות ששונו

- `products/pcn874/src/validate.ts`, `src/index.ts`, `README.md`, `docs/SPEC.md`, `tests/rules.test.ts` (חדש).
- `products/il-biz-tools/src/vendor/pcn874/validate.js` (נוצר מחדש ב-`bundle-pcn874.js`).
- `products/il-biz-tools/src/lib/pcn874-rule-reference.js`, `pcn874-share.js`, `source-line.js` (חדשים);
  `src/lib/pcn874-report.js` (ייצוא `fieldRuleHebrew`, `REPRESENTATIVE_INITIAL_HE`).
- `products/il-biz-tools/scripts/pcn874-rule-reference.js` (חדש), `scripts/build-site.js`.
- `products/il-biz-tools/pcn874.html`, `osek-patur.html`, `vat.html`, `net-salary.html`, `allocation.html`,
  `registrar-fee.html`, `assets/page-pcn874.js`, `assets/page-osek-patur.js`, `assets/style.css`,
  `src/config/osek-patur.json`, `src/config/vat.json`, `README.md`.
- בדיקות: `tests/pcn874-rule-reference.test.js`, `tests/pcn874-share.test.js`, `tests/statutory-sources.test.js`,
  `tests/tool-leads.test.js` (חדשים); `tests/pcn874-page.test.js`, `tests/pcn874-report.test.js`.
- `docs/VIDEO_PUBLISHING_CHECKLIST.md` (חדש), `skills/revenue-il-biz-tools/SKILL.md`,
  `research/faceless-youtube/T1-PROTOCOL.md`.
- הערות תיקון: `docs/REJECTED.md`, `research/colony-sweep/scouts/distribution--short-video.md`,
  `research/tiktok/08-reads/tj-offsite.md`, `research/tiktok/08-reads/tj-tiktok.md`,
  `research/tiktok/07-ai-money-tooling.md`, `research/measurements/gumroad-license-decision.md`.

## 4. החלטות והנחות משמעותיות

- **"טבלת הכללים" לא הייתה קיימת — בניתי אותה בבודק, ולא רק בדף.** אפשר היה לגזור את הרשימה בדף מתוך קוד המקור
  בביטויים רגולריים, אבל אז החומרה והמקורות לא היו מוגנים מפני סטייה. עכשיו הבודק עצמו לוקח אותם מהטבלה, כך
  שסטייה אינה אפשרית במבנה, והבדיקה ב-pcn874 מוכיחה שאין בטבלה שורה שאף קלט אינו מדווח.
- **הרשימה בדף שמורה בקובץ ולא מוזרקת בבנייה**, כמו ה-bundle: כך השרת המקומי והבדיקות רואים אותה, והבנייה
  מסרבת לסעיף מיושן. "נוצרת בבנייה" בפתק פורש כ"נוצרת מהטבלה, והבנייה אוכפת".
- **מספרי השורות בחוזר** הם של הטקסט שחולץ מה-PDF ברפו, לא של עמודי ה-PDF; הסעיף אומר זאת במפורש. כלל בלי שורה
  בחוזר (`file.lineEnding.mixed`) כתוב כ"אין שורה בחוזר; הכלל נשען על מימושים בקוד פתוח בלבד".
- **"שמות כללים" בטקסט השיתוף = מזהי הכללים** (למשל `detail.S.counterpartyExpected`), שקצרים, יציבים ומוסברים
  ברשימה שבאותו דף. לא נכנסים שם הקובץ, מספרי שורות או ערכי שדות.
- **קישור ה-WhatsApp נבנה ונבדק אבל כבוי.** הדגל נבדק: הפעלה שלו בלי `docs/whatsapp-share-device-test.md` שמתעד
  Android ו-iOS מפילה בדיקה. לא נוסף צעד לבעלים (לקולוניה אין טלפונים, והפתק אומר שלא מוסיפים את זה לרשימה).
- **שורת המימון בשאלה "למה הבודק חינמי?"**: "ההכנסה שלה מתוכננת להגיע מתוסף לכלי אחר באתר" — בלשון עתיד, כי עדיין
  אין הכנסה; בלי קישור, בלי המילים שהבדיקה הקיימת אוסרת בדף הזה (מחיר, רכישה, Pro), ובלי "ונשאר חינמי" (F3 פתוח).
- **`checkedOn` = 2026-09-07.** אף עמוד gov.il לא נקרא, וכל זכות מחזיר 403 לרנרים. התאריך המתועד של השוואת המספר
  הוא קריאת תוצאות החיפוש מ-7.9.2026 (`research/measurements/serp/2026-09-07-hebrew-calculators.md`), שמצאה את
  122,833 ואת 18% בעמוד הראשון; ה-README מתעד אימות מול מקורות משניים "בספטמבר 2026". לכן הדף כותב "(מקור משני)",
  ו-`checkedNote` בקונפיג אומר בדיוק על מה התאריך נשען. זו הנחה שכדאי שהת'רד הראשי יאשר.
- **תווית השנה רק ל-`osek-patur`.** שיעור המע״מ אינו מוגדר לפי שנה (`effectiveFrom`), ולכן אין לו תווית כזו.
- **"בלי להשאיר פרטים ובלי שיחה" לא נוסף ל-`invoice.html`:** שם המשתמשים מקלידים את פרטי העסק שלהם (שנשמרים
  בדפדפן), והמשפט היה עלול להטעות. גם `index.html` אינו דף כלי.
- **N12 — רק המסמך.** הפתק מציע גם להכניס את הפריטים שאפשר לבדוק במכונה ל-`src/revenue/publication-gate.ts`; זה לא
  היה בתדריך. במסמך צוין אילו פריטים כבר נאכפים שם (G3–G7) ושהפריט "בלי `publish_at`" ניתן לבדיקה במכונה ועדיין
  אינו שם.
- **N14 — הערה אחרי הטבלה, לא בתוך השורה**, כי שורת טבלה במרקדאון לא יכולה להכיל פסקה. בשורה `:40` של
  `REJECTED.md` צוין שהייחוס לפורטל ה-Business API הוא ברמת snippet (הדף לא נמצא שוב).

## 5. שגיאות וניסיונות שנכשלו

- הבדיקה הקיימת `pcn874-report.test.js` ספרה את `rule:` בקוד הבודק (ציפתה ליותר מ-20); אחרי שהבודק עבר לטבלה נשאר
  אחד. הבדיקה עודכנה לבדוק את הטבלה עצמה ושאין דרך אחרת לתת שם לכלל.
- בדיקת כותרות הטבלה בדף ספרה גם את כותרות טבלאות הכללים החדשות; הוגבלה ל-`#pcn-results`.
- `satisfies` הוחלף במערך עם טיפוס, כדי לא לסמוך על כך ש-`stripTypeScriptTypes` תומך בו.
- הכנסת ההערות ל-`tj-offsite.md` נכשלה פעם אחת על הנחה שהשורה האחרונה בטבלה היא L12 (היא L14); תוקן.
- מבחן ההיסט של `refGroup` בבדיקת השיתוף נכתב תחילה עם היסט 22 (הוא 18).
- `pdftoppm` לא מותקן, אז את ה-PDF של ההדפסה בדקתי בצילום מסך תחת `emulateMedia({ media: 'print' })`.

## 6. בדיקות ופעולות ולידציה

- כל בדיקה חדשה נכתבה לפני הקוד וראיתי אותה נכשלת מהסיבה הנכונה. את קישור ה-WhatsApp (הנתיב שמאחורי הדגל)
  בדקתי אחרי שנכתב, ואז הסרתי אותו זמנית וראיתי את הבדיקה נכשלת.
- `products/pcn874`: `npx vitest run` — 8 קבצים, 331 בדיקות (היו 7/327); `npx tsc --noEmit` נקי.
- `products/il-biz-tools`: `npx vitest run` — 27 קבצים, 586 בדיקות (היו 23/531); `node scripts/check-html.js` —
  "all pages ok"; `node scripts/pcn874-rule-reference.js --check` תקין.
- שורש: `pnpm typecheck` נקי; `npx vitest run src/__tests__/revenue` — 38 קבצים, 973 בדיקות.
- Chromium headless (`/opt/pw-browsers`, playwright הגלובלי) מול `scripts/serve.js`: קובץ fixture נבחר, המשבצת
  הופיעה עם שם הקובץ ו-28.9.2026; `navigator.share` אינו קיים שם ולכן כפתור השיתוף נשאר מוסתר; תחת `print`
  כותרת ההדפסה, תיבת ההיקף, הסיכום והממצאים מוצגים ובורר הקובץ, המשבצת, השאלות והכללים לא; 82 שורות ברשימת
  הכללים; שורת המקור ב-`osek-patur.html` ו-`vat.html` כמצופה; אף בקשה של הדף לא יצאה מהשרת המקומי.
- לא נבדק: `navigator.share` בטלפון אמיתי, תיבת ההדפסה האמיתית של הדפדפן, וקורא מסך.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **סקריפט בדיקה בדפדפן:** playwright מותקן גלובלית ב-`/opt/node22/lib/node_modules/playwright` ו-Chromium ב-
  `/opt/pw-browsers`. כתבתי שני סקריפטים זמניים (בחירת קובץ, הדמיית הדפסה, צילום). כדאי סקריפט קבוע ב-
  `products/il-biz-tools/scripts/` שמריץ את השרת, בודק דף ומצלם מסך והדפסה.
- **שני צעדים אחרי כל שינוי בכללי pcn874:** `bundle-pcn874.js` ואז `pcn874-rule-reference.js`. כדאי ש-
  `bundle-pcn874.js` יריץ את השני בעצמו.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- חיפוש "טבלת הכללים" שהתדריך הניח שקיימת: קריאה מלאה של `validate.ts` (כ-1,200 שורות) לפני שהתברר שאין טבלה.
- קריאת §5–§7 של הפתק ושל `tiktok-policy.md` כדי לצטט נכון ב-N12 ו-N14 (פלט אחד נחתך ונקרא מקובץ).
- הדמיית הדפסה פעמיים (הרצה ראשונה בלי צילום מסך, כי אין כלי להמרת PDF לתמונה).
- ההודעות החוזרות על רשימת המשימות של הסשן הראשי (לא רלוונטיות לבונה).

---

# המתקן (Opus) — תיקוני שתי הסקירות, יושר וקוד (29.9.2026)

## 1. מה המשתמש ביקש

הסקריפט המתזמר העביר את שני דוחות הבונים ואת שתי הסקירות (יושר: 14 פריטים; קוד: 9 פריטים) וביקש לתקן כל ליקוי
שמחזיק מול הקוד, בכתיבת בדיקה לפני קוד, לנמק כאן כל ליקוי שנדחה, להריץ שוב את בדיקות המוצר, את `pnpm typecheck`
ואת `src/__tests__/revenue`, ולבצע commit בענף ה-worktree בלבד (בלי push, בלי stash, בלי לגעת ב-CHECKPOINT,
CHANNEL_LOOP, FABLE_QUEUE, MISSION או CLAUDE.md).

## 2. הפעולות המרכזיות שביצעתי

1. **ההצעה ב-Gumroad חייבת להתאים לדף** (יושר 1, 3, 8, 11, 12; קוד 1, 4). `checkOffer` חדש ב-
   `scripts/gumroad-pro-product.js`, ש-`enable` מריץ לפני `PUT .../enable` ושהפקודה החדשה `check` מריצה לבד:
   - `site.json` במאגר ובאתר הפרוס נושאים אותו מזהה ואותו מחיר;
   - Gumroad גובה בדיוק את המחיר הזה, פעם אחת;
   - כתובת החשבון (`GET /v2/user`) היא הסוד `BRAND_MAIL_ADDRESS` של צעד 8. ההשוואה לא מדפיסה אף כתובת;
   - מדיניות ההחזרים שהקונה יראה היא "No refunds allowed".
2. `readBackPrice` מסרב גם למנוי מדורג (`is_tiered_membership`, `recurrences`), למחירי PPP (במוצר ובאפשרויות) ולאפשרות
   שמשנה את החיוב (`price_difference`, `is_pay_what_you_want`, `recurrence_prices`).
3. `brandMailboxGreen` בודק עכשיו את מפתחות `repliesByVenue` מול `VENUE_ID`, כמו `brand-mail.ts`. נוסף
   `src/__tests__/revenue/brand-mail-parity.test.ts`, שמזין את שני הקוראים ב-31 אותם fixtures.
4. `gumroad-pro-product.yml`: שלב ה-enable מקבל `BRAND_MAIL_ADDRESS`. `gumroad-pro-probe.yml`: נוספו setup-node ושלב
   `check` בסוף (קריאה בלבד).
5. **שאלות המחיר לפני שיש מכירה** (יושר 5, קוד 6): `<details data-pro-sale>` ("מה קורה אחרי התשלום?", "מי מוכר את
   Pro", ו"כמה עולה Pro" בדף הבית). `withProPrice` מוריד אותן ואת תאומי ה-JSON-LD שלהן מהבנייה כל עוד הכפתור אינו
   `ready`, ובודק גם את התאומים שלהן לסטייה.
6. **נוסח** (יושר 6, 7, 9; קוד 7):
   - שורת ה-nudge היא עכשיו "בהדפסה ובשמירה כ-PDF המסמך יוצא בלי המיתוג שניסיתם…", כי `afterprint` נורה גם כשמבטלים;
   - שאלה (c) ושלב 4 בהפעלה אומרים שההפעלה מוסיפה הדפסה ו-PDF, לא ש"השדות נפתחים";
   - תשובת ה-JSON-LD בדף הבית כבר לא נגמרת בתווית קישור.
7. **כותרת ההדפסה של PCN874** (יושר 10, קוד 5):
   - הכותרת מוסתרת בטעינה, מוצגת עם תוצאה, ומתרוקנת ומוסתרת כשבחירה מאוחרת נכשלת;
   - נוסף `.print-only[hidden]{display:none !important}`;
   - נבדק גם ב-Chromium headless בהדמיית הדפסה.
8. **שורת המקור** (יושר 2, 4, 14; קוד 2):
   - בקונפיג יש עכשיו `check {on, how, record, note}`. "נבדק" מופיע רק כש-`how` הוא `read`; בחיפוש השורה אומרת
     "הושווה לתוצאות חיפוש: 7.9.2026"; בלי רשומה היא אומרת "תאריך הבדיקה לא תועד";
   - הבדיקות פותחות את קובץ הרשומה ודורשות בו את התאריך ואת המספר;
   - `allocation.html` קיבל שורת מקור, ודף הבית קיבל שורה שמפנה לדפי הכלים;
   - שורה 7 ברשימת הווידאו אומרת אילו דפים עוד לא עוברים אותה.
9. **הפניות מתוקנות ב-`07-ai-money-tooling.md`** (יושר 13): הערות התיקון מזהות את השורות לפי התווית שלהן.
10. **שומרים שמוטציה עברה אותם** (קוד 3, 8, 9):
    - בדיקות בנייה חצי-מוגדרות, בנייה עם JSON-LD שסטה, ותאום חסר או שאלה שהשם שלה שונה;
    - דף osek-patur שנטען ב-2027, ומסנן מזהי הכללים בשיתוף;
    - `.doc .brand-logo[hidden]{display:none}`.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/scripts/gumroad-pro-product.js`, `src/lib/gumroad.js`, `src/lib/pro-offer.js`,
  `src/lib/pro-nudge.js`, `src/lib/source-line.js`, `src/config/{site,osek-patur,vat,allocation-number}.json`.
- `products/il-biz-tools/{index,invoice,osek-patur,vat,allocation,pcn874}.html`, `assets/page-pcn874.js`,
  `assets/style.css`, `README.md`.
- בדיקות: `tests/{gumroad-pro-product,pro-faq,pro-nudge,pcn874-page,pcn874-share,license-branding,statutory-sources,
  tool-leads}.test.js`, `tests/osek-patur-page.test.js` (חדש), `src/__tests__/revenue/brand-mail-parity.test.ts` (חדש).
- `.github/workflows/gumroad-pro-product.yml`, `.github/workflows/gumroad-pro-probe.yml`.
- `docs/VIDEO_PUBLISHING_CHECKLIST.md`, `research/tiktok/07-ai-money-tooling.md`.
- `docs/OWNER_STEPS.he.md` לא השתנה, ולכן לא נבנה PDF מחדש.

## 4. החלטות והנחות משמעותיות

- **מדיניות ההחזרים.** השער מקבל רק "No refunds allowed", ו-`create` לא קובע מדיניות.
  - מה המדיניות לפני A1 זו החלטה של הת'רד הראשי. כל עוד לא הוחלט, `enable` יסרב, כי ברירת המחדל של חשבון חדש
    היא 30 יום.
  - הקביעה עצמה היא `PUT /v2/refund_policy` עם `refund_period=none`, באותו טוקן. זו עבודת סוכן, בלי צעד לבעלים.
  - המקורות נקראו ב-antiwork/gumroad main ב-29.9.2026: `refund_policy.rb`, `user.rb`,
    `api/v2/refund_policies_controller.rb`, `product/as_json.rb`.
- **כתובת החשבון.** ההשוואה היא מול `BRAND_MAIL_ADDRESS`, ולא מול `data-a11y-contact` כפי שהציעה סקירת היושר.
  הסוד הוא תיבת צעד 8 עצמה, ואיש הקשר בדף הנגישות עוד לא קיים (חוסם פרסום). `GET /v2/user` מחזיר `email` לטוקן עם
  `edit_products` (`user/as_json.rb`, `base_controller.rb`).
- **מס.** ישראל לא נמצאת באף רשימת גבייה של Gumroad (`lib/utilities/compliance/countries.rb`), ולכן ההערות רוככו
  ונאמר בהן שקונה בחו"ל עשוי לראות מע"מ בקופה.
- **allocation.** המקור המוצג הוא Grant Thornton, מתוך `sources`. אין רשומה מתוארכת, ולכן אין `check`.
- **"הושווה לתוצאות חיפוש".** הניסוח נבחר על פני הסרת התאריך, כי זה מה שקרה בפועל ב-7.9 והרשומה מראה את זה.

**ליקויים שנדחו או נדחו בחלקם, ולמה:**
1. **יושר 1, החלק "create יקבע את המדיניות":** לא נבנה. הסקירה עצמה מתנה אותו בהחלטת הת'רד הראשי. השער ב-`enable`
   מבטיח שאין מכירה עם הבטחת החזר עד אז.
2. **יושר 8, "להוסיף 'לפני מס, אם חל' בדף":** נדחה. Gumroad לא גובה מס מקונה בישראל, והקהל עברי. התוספת הייתה
   גורמת לקונה ישראלי לצפות למע"מ שלא יתווסף, כלומר נוסח מטעה. במקומה רוככו ההערות בקוד וב-`site.json`.
3. **קוד 1, "שום דבר לא בודק שוב אחרי enable":** `check` נוסף לבדיקה של AT-16, אבל לא נוסף לה schedule. היא נשארת
   `workflow_dispatch`, ולוח זמנים הוא החלטה על דקות Actions ועל הלולאה, של הת'רד הראשי. בינתיים רק מי שיכול לערוך
   מחיר ב-Gumroad (הבעלים או הסוכן) יכול לגרום לסטייה.
4. **יושר 13, ההפניה `08-reads/tiktok-policy.md:248`:** היא עדיין מצטטת את `07-ai-money-tooling.md:134` ואת
   `:65/:166/:198` לפי המספור של 28.9. לא תוקנה, כי זו רשומת קריאה מתוארכת ולא הערת התיקון שהסקירה ציינה.

## 5. שגיאות וניסיונות שנכשלו

- הבדיקה "חשבון בלי כתובת" עברה בטעות בגרסה הראשונה. `email: undefined` הפעיל את ערך ברירת המחדל ב-destructuring,
  ולכן הוחלף ב-`null`.
- ניסיון לקרוא את `kolzchut`, `ynet` ו-`gov.il` מהקונטיינר נכשל (000, egress חסום), ולכן לא הייתה אפשרות להפוך את
  השורה ל"נבדק".
- ה-API של GitHub ל-antiwork/gumroad חסום (צריך add_repo). הקבצים נקראו דרך `raw.githubusercontent.com`, ונתיב
  `countries.rb` נמצא בניחוש.

## 6. בדיקות ופעולות ולידציה

- כל בדיקה חדשה נכתבה לפני הקוד וראיתי אותה נכשלת. בדיקות לשומרים שכבר היו בקוד אומתו במוטציה: הוסרה השורה,
  הבדיקה נכשלה, והשורה הוחזרה.
  - 21 מוטציות ב-`gumroad-pro-product.js`. שתיים (`!want`, `!got`) שרדו בסבב הראשון ונהרגו אחרי שנוספה בדיקה לכתובת
    חסרה בשני הצדדים.
  - 4 מוטציות בבדיקת ה-parity בשורש.
  - 2 ב-`build-site.js` ו-4 ב-`pro-offer.js`.
  - 2 ב-`page-osek-patur.js` ו-1 ב-`pcn874-share.js`.
- `products/il-biz-tools`:
  - `npx vitest run`: 28 קבצים, 639 בדיקות (היו 27/586);
  - `node scripts/check-html.js`: "all pages ok";
  - `pcn874-rule-reference.js --check`: תקין.
- `products/pcn874`: 331 בדיקות.
- שורש: `pnpm typecheck` נקי. `npx vitest run src/__tests__/revenue`: 39 קבצים, 1006 בדיקות (היו 38/973).
- Chromium headless בהדמיית הדפסה:
  - כותרת ה-PCN874 היא `none` לפני בדיקה, `block` עם שם קובץ ותאריך אחרי קובץ A, ו-`none` עם שם ריק אחרי קובץ B
    גדול מדי;
  - הלוגו המוסתר בקבלה החינמית הוא `display:none` בהדפסה.
- לא נבדק: ריצה חיה מול Gumroad (אין טוקן), תיבת הדפסה אמיתית, `afterprint` אמיתי.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **מריץ מוטציות:** סקריפט קטן ב-scratchpad (החלפה, הרצת קובץ הבדיקה, שחזור). כדאי כלי קבוע ב-`scripts/`.
- **הדמיית הדפסה ב-Chromium:** בפעם השלישית ברצף. הסקריפט הקבוע שבונה B הציע עדיין חסר.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- ניחוש נתיבים ב-antiwork/gumroad כי ה-API חסום (שני סבבים עד `lib/utilities/compliance/countries.rb`).
- הרצה חוזרת של בדיקת הכתובת בגלל ה-sentinel של `undefined`.
- ההודעות החוזרות על רשימת המשימות של הסשן הראשי (לא רלוונטיות למתקן).
