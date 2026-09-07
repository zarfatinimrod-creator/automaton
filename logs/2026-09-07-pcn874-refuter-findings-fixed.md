# 7.9.2026 — יישום ממצאי ביקורת ההפרכה על מאמת PCN874

## 1. מה המשתמש ביקש

לתקן את המאמת של קובץ הדיווח המפורט למע"מ (PCN874) ב-`products/pcn874/` לפי ביקורת ההפרכה
`research/colony-sweep/audits/pcn874-reconciliation.md`, שנכתבה על ידי מבקר Fable אחרי ההשוואה
מול החוזר של רשות המסים. במפורש:

1. ליישם את **כל שבעת הממצאים ב-§7a** בדיוק כפי שהמבקר מגדיר את התיקון המינימלי, אלא אם השורה
   המצוטטת סותרת את המבקר — ואז לצטט את השורה ביומן ולהסביר.
2. להפוך את **הקבצים שהמבקר בנה ב-§4** לפיקסצ'רים שנוצרים על ידי `scripts/make-fixtures.mjs`
   (לא מוקלדים ביד), ולבדיקות שמאשרות שכל קובץ מסווג כפי שהחוזר אומר.
3. לתקן את הבדיקה **"every ERROR is backed by the Tax Authority document"** כך שתבדוק יותר מקיום
   ציטוט: לפחות שהשורה המצוטטת מכילה את שם השדה או ביטוי שהכלל מצהיר עליו ב-`officialText`.
4. ליישם את **§7b**: שלושת מספרי השורה השגויים, ניסוח §6.8, שורת שם הקובץ, טענת "מגובה במסמך",
   ועובדות שמקורן במדריכי ספקים — שיירשמו כעובדות ספק, לעולם לא כרשמיות.
5. לעדכן את `SPEC.md` §6/§7, את `products/pcn874/README.md` ואת `products/README.md` במקומות שבהם
   הם מצהירים מספרים או טענות שהשתנו (**בלי לצטט מספר שלא נמדד באותו רגע**).
6. לאמת: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, והרצת ה-CLI על כל פיקסצ'ר
   כדי לוודא שקוד היציאה תואם לתחילית שם הקובץ. מהשורש: `pnpm typecheck`.
7. לכתוב יומן משימה בעברית ולבצע commit בענף העבודה. **לא לדחוף.** לא לגעת ב-`logs/CHECKPOINT.md`,
   `docs/OWNER_STEPS.he.md`, `MISSION.md` או `.github/`.

כלל קשיח מהתדריך: **לעולם לא להמציא מספר שורה.** כל ציטוט `ita:`/`herp:`/`rivhit:` שנוסף חייב
להיפתח ב-`sed -n` ולהיות מצוטט ביומן.

## 2. הפעולות המרכזיות שביצעתי

### 2.0 עץ העבודה התחיל על בסיס ישן — שוב

`git log --oneline -1` החזיר `90816df` ו-`products/` לא היה קיים. `git reset --hard
claude/monthly-income-plan-pfs7vu` העמיד את הראש על `f9b77f3` והקבצים הופיעו. זו הפעם הרביעית
שהתופעה נרשמת ביום אחד; הבדיקה שבתדריך עבדה בדיוק כפי שנועדה.

### 2.1 אימות כל ציטוט לפני שנכתב

לפני כתיבת שורת קוד אחת פתחתי בשורות עצמן כל ציטוט שהמבקר נוקב בו. הרשימה, מצוטטת מילה במילה
כפי שהיא מרונדרת:

| ציטוט | הטקסט בשורה |
|---|---|
| `ita:224-225` | `General Explanation: All fields are compulsory. Below are the possible values for each field in each situation.` / `"V" symbolizes a compulsory field in accordance with the column heading or the value stated in the` |
| `ita:335` / `ita:337` / `ita:339` | `"SL" – Self Invoice` / `M` / `Supplier` |
| `ita:377-378` / `ita:379` / `ita:381` | `"SL"- Palestinian Authority` / `Customer` / `I` / `Customer` |
| `ita:396-397` / `ita:398` / `ita:400` | `"IN"-"regular" from Israeli` / `Supplier` / `T` / `Supplier` |
| `ita:415` / `ita:417` / `ita:419` | `"IN"-Self Invoice` / `C` / `Supplier` |
| `ita:478-479` / `ita:480` / `ita:482` | `"IN"-Supplier from` / `Palestinian Authority` / `P` / `Supplier` |
| `ita:497-498` / `ita:499` / `ita:501` / `ita:517` | `"IN"-Other Document (by` / `law)` / `H` / `Supplier` / `F` |
| `ita:537-539` (הערה A) | `A.   Regular local sale to commercial customer – In a sale where the pre-VAT` / `amount is higher than 5,000 NIS, it is obligatory to state the customer's` / `merchant number (it is a prerequisite to customer input offset).` |
| `ita:556-557` (הערה C) | `C.   Self Invoice Sales – the supplier number will be entered in the place of the` / `counter party file number.` |
| `ita:566-568` (הערה E) | `E.   Petty Cash Input – The entry may appear a number of times, even on the` / `same date, provided that the total VAT for these entries is less than 2% of` / `the total VAT of the file's entries or 2,000 NIS (the greater of them).` |
| `ita:569-570` | `restrictions regarding the Petty Cash may change from time to time as to be` / `determined in the internal regulations that will be made public.` |
| `ita:573-574` (הערה F) | `F.   Other Document Input: Reference Number – if unknown: will be entered as` / `zeros. Counter file number: in accordance with "Sha'am" guidelines.` |
| `ita:586-588` | `•   Parameter values may change from time to time. These changes will be published` / `in memos and will be valid for a specified period e.g 5000 shekels/2% etc. and` / `therefore the accountant must be able to amend them.` |
| `ita:174` | `•   In a "+/-" field: When the amount field is zero, the value of the "+/-" field will be "+".` |
| `ita:523-524` | `2.   Table of possible values for a field marked/designated "+/-". This field` / `represents the positive/negative sign of the value of the input .` |
| `ita:525-535` | חמש העמודות ו-`Sign   +   -   +   -   +` |
| `ita:57` / `ita:169-170` / `ita:271` / `ita:551` | `including "zero value" and exempt transactions.` / `taxation or zero value transactions` / `Zero Value/Exempt "SL" –` / `A "mixed" transaction (exempt/zero value and regular)` |
| `ita:91` / `ita:93` | `Appendix 'A' – PCN874 File Structure – New – Individual Merchant` / `File Name: PCN874.TXT` |
| `ita:101` / `ita:159-161` | `Customer's Licensed Dealer identification Number   N(9)` / `Licensed Dealer Identification` / `Number of submitter` / `N(9)` |
| `ita:105` | `File Generation Date   N(8)   Yyyymm form` |
| `ita:139` / `ita:580-581` | `Reference group   A(4)   Series etc.   zeros are possible at this stage` / `•   Reference Group Field – enables attribution of reference to branch etc., zero values` / `or internal characters of the submitter (series/branch etc.)` |
| `herp:1163-1168` | `יצירת קובץ לשידור . כעת ירשמו נתוני הדוח לקובץ עבור רשות המיסים.` — **על יצירת קובץ השידור, לא על עיגול** |
| `herp:1185-1190` | `סכום המע"מ ללא עיגול : בדוח מע"מ מקוון , PCN874 , לפי דרישת רשות ה מיסים התוכנה מעגלת` … — **זה מקטע העיגול האמיתי** |
| `herp:1637` | שורה **ריקה** |
| `herp:1638` | `אם נרשמו חשבוניות לקוח או חשבוניות ספק בסכום לפני מע"מ של 20,000 ש"ח ומעלה ללא מספר` |
| `herp:1641` | `לא ניתן להזדכות על המע"מ ב חשבוניות אלו ללא מספר הקצאה.` |
| `herp:990-1002` | `סוג ההפקה : בסעיף זה ניתן לבחור בין שלוש האפשרויות הבאות:` … `קובץ לעוסק בודד` … `קובץ משותף למספר עוסקים` … `איחוד עוסקים` |
| `herp:300-301` / `herp:303` / `herp:911-913` | ₪5,000 לזיהוי לקוח; ₪10,000 להקצאה מ-1/1/26; `על פי הנחיית רשות המיסים, בכל חשבונית בסכום של 5,000` / `ש ' ומעלה חייב להופיע מספר עוסק מורשה.` |
| `herp:1114,1116` / `herp:1238` / `herp:1525` | מסך "סכום לתשלום" / `pcn874.txt` / `874_database - id_mmyy_ddmmhhmm.txt` |
| `rivhit:9` | שורה **ריקה** |
| `rivhit:10` | `מהדורה 1.51 , לתאריך   מעודכן 7/7/2011` |
| `rivhit:264` | `בפורמט   יהיה   שנוצר   הקובץ   שם PCN874_XXXXXXXXX_YYYYMM.txt , כאשר :` |
| `rivhit:318-319` | תקרת ₪300 למע"מ בחשבונית בקופה קטנה |
| `rivhit:3080-3081` | דוח להחזר חייב לפרט את כלל התשומות בלי לרכז את אלה שהמע"מ בהן קטן מ-₪300 |
| `rivhit:3163-3165` | עסקה מזוהה (מספר ע"מ **או ת.ז**) מדווחת ב-`S`, לא מזוהה ב-`L` |

**כל ציטוט אומת. אף שורה לא הומצאה.** בשלושה מקרים המבקר צדק והמסמך הקודם טעה: `herp:1163-1168`,
`herp:1637`, `rivhit:9`. באף מקרה השורה המצוטטת לא סתרה את המבקר, ולכן לא נדרשה חריגה מהתיקון
המינימלי שהוא הגדיר.

### 2.2 §7a — שבעת הממצאים, לפי הסדר

1. **חוק צד נגדי ל-`T M C P I H`** — נוספה טבלת נתונים `COUNTERPARTY_ROWS` ב-`src/validate.ts`,
   ובה השורה של נספח ג' מצוטטת תא-אחר-תא, טווח השורות, וחומרה לכל אות. `T M C P I` — **שגיאה**;
   `H` — **אזהרה** עם ציטוט הערה F (`ita:573-574`) ושאלה פתוחה. `L` ו-`K` לא נכללים כי התא שלהם
   הוא `Zeros` (זה החוק ההפוך, שכבר קיים); `Y` ו-`R` לא נכללים כי התא שלהם הוא מספר רשימון ולא
   מספר עוסק, והערה D מתירה אפסים לשירות בלי רשימון.
2. **`detail.refGroup.alphanumeric`** — `ALPHANUMERIC` שונה מ-`/^[A-Z0-9]+$/` ל-`/^[A-Za-z0-9]+$/`,
   ותו אחר הפך מ-**שגיאה** ל-**אזהרה** עם `openQuestion` משותף (`A_N_ALPHABET_OPEN`).
   **`file.encoding.ascii`** הפך ל-**אזהרה** עם אותה שאלה פתוחה.
3. **`footer.licensedDealerId.matchesHeader`** — הפך ל-**אזהרה** עם `openQuestion` המצטט את שני
   השמות (`ita:101`, `ita:159-161`), את כותרת נספח א' (`ita:91`) ואת שלושת סוגי ההפקה
   (`herp:990-1002`).
4. **`detail.invoiceSumSign.signOfZero`** — ברשומת תנועה: **שגיאה** רק כששני הסכומים אפס;
   כש-`invoiceSum` אפס ו-`totalVat` אינו — **אזהרה** עם `openQuestion` הנוקב בשני שדות הסכום.
   בכותרת לא השתנה דבר (סימן אחד לכל סכום).
5. **`detail.S.counterpartyExpected`** — פוצל ב-₪5,000: **שגיאה** מעל, **אזהרה** במפלס או מתחת,
   כשההסתייגות של המסמך על הסכום עצמו (`ita:586-588`) מצוטטת לתוך שני הממצאים.
6. **`totals.pettyCashCap`** — כלל חדש, **אזהרה**, כשסכום המע"מ ברשומות `K` עולה על
   `max(2000, 2% × Σ totalVat)`.
7. **`header.generationDate.calendar`** — הפך ל-**אזהרה**.

### 2.3 §4 — הקבצים שהמבקר בנה, כפיקסצ'רים

`scripts/make-fixtures.mjs` מייצר עכשיו 26 קבצים במקום 16. אחד־עשר חדשים, אחד נמחק ואחד שונה:

| מזהה אצל המבקר | פיקסצ'ר | סיווג היום |
|---|---|---|
| a1 | `warnings-footer-dealer.txt` (החליף את `invalid-footer-dealer.txt`) | אזהרה אחת |
| a2 | `valid-refgroup-lowercase.txt` | אפס ממצאים |
| a3 | `warnings-vat-only-credit.txt` | אזהרה אחת |
| a4 | `warnings-refgroup-punctuation.txt` | אזהרה אחת |
| d | `warnings-refgroup-hebrew.txt` | שתי אזהרות |
| c1 | `valid-refgroup-alpha.txt` (היה קיים) | אפס ממצאים |
| c2 | `valid-refgroup-zeropad.txt` | אפס ממצאים |
| b1 | `invalid-input-counterparty.txt` | שגיאה `detail.T.counterpartyExpected` |
| b4 | `invalid-self-invoice-counterparty.txt` | ארבע שגיאות: `M I C P` |
| b2 | `invalid-s-large-unidentified.txt` | שגיאה `detail.S.counterpartyExpected` |
| b3 | `warnings-petty-cash-cap.txt` | אזהרה `totals.pettyCashCap` |
| — | `warnings-h-counterparty.txt` | אזהרה `detail.H.counterpartyExpected` |

נוספה לבונה הפיקסצ'רים אפשרות `invoiceSumSign`, כדי שאפשר יהיה לבנות רשומה עם `-` על סכום אפס
בלי לרמות את החישוב.

### 2.4 חיזוק הבדיקה של §7b.6

הבדיקה הישנה בדקה שקיים ציטוט `ita:` ושקיים `officialText`. נוספה לצידה בדיקה שנייה שקוראת את
השורות המצוטטות **מתוך `research/rendered/pcn874-gov-il-874-eng.txt`** ודורשת ש-`officialText`
של הממצא והשורות האלה יחלקו **רצף של ארבע מילים**. בנוסף נבדק שכל טווח שורות מצוטט קיים במסמך.
נוספה גם בדיקת-מטא שמוכיחה שהמנגנון פוסל ציטוט שהומצא (אחרת הבדיקה היא קישוט).

### 2.5 §7b — תיקוני התיעוד

כל שמונת הפריטים בוצעו; פירוט ב-`docs/SPEC.md` §6.11 (הפסקה האחרונה).

## 3. קבצים/מערכות ששונו

| קובץ | מה |
|---|---|
| `products/pcn874/src/validate.ts` | `COUNTERPARTY_ROWS`, `A_N_ALPHABET_OPEN`, `checkPettyCashCap`, פיצול `checkSignOfZero`, פיצול `detail.S.counterpartyExpected`, ארבע הורדות חומרה, תיקון `officialText` של `file.record.unknown` |
| `products/pcn874/src/layout.ts` | `herp:1185-1190` במקום 1163-1168; `herp:1638` במקום 1637 עם ניסוח מחדש; הערת "9 תווים" מול `N(9)`; `invoiceSumSign.officialText` מסמן את נספח ג' §2 כדו-משמעי; `DETAIL.officialText` מצטט שורה במקום לפרפרז |
| `products/pcn874/src/sources.ts` | `rivhit:10` במקום 9 |
| `products/pcn874/scripts/make-fixtures.mjs` | 11 פיקסצ'רים חדשים, `invoiceSumSign`, `warnings-only.txt` הורד ל-₪4,000 |
| `products/pcn874/tests/validate.test.ts` | רשימת הפיקסצ'רים, בדיקת סנכרון מול התיקייה, שתי קבוצות `describe` חדשות, הבדיקה המחוזקת |
| `products/pcn874/tests/layout.test.ts` | ארבע בדיקות סנכרון חדשות בין `SPEC.md` לקוד |
| `products/pcn874/tests/fixtures/` | 11 חדשים, 1 נמחק (`invalid-footer-dealer.txt`), 1 שונה (`warnings-only.txt`) |
| `products/pcn874/docs/SPEC.md` | §1.2, §2, §3.6, §3.7, §4 + §4.1 חדש, §5.7 ו-§5.8 חדשים, §6.2, §6.8, §6.9, §6.11 חדש, §7.1 חדש |
| `products/pcn874/README.md` | טבלת ביקורת ההפרכה, מספרי בדיקות ופיקסצ'רים, סולם החומרה, הפסקה בעברית |
| `products/README.md` | 199 בדיקות; פסקה על ביקורת ההפרכה |
| `skills/revenue-pcn874/SKILL.md` | משפט אחד בלבד: "134 tests" → "199 tests" |

**לא נגעתי** ב-`logs/CHECKPOINT.md`, `docs/OWNER_STEPS.he.md`, `MISSION.md`, `.github/`.

## 4. החלטות והנחות משמעותיות

- **חומרה לפי מה שהשורה אומרת, לא לפי חומרת הטעות.** זה הכלל שכבר כתוב בראש `src/validate.ts`,
  והביקורת מצאה שהוא לא הוחל על עצמו. פסילת קובץ חוקי היא תקלה שקולה לקבלת קובץ פסול, ולכן
  ירידה מ-שגיאה ל-אזהרה אינה "הרפיה" אלא תיקון.
- **`H` אזהרה, השאר שגיאה.** התדריך קבע כך, וההצדקה בשורה: `ita:517` הוא סמן ההערה `F`, והערה F
  (`ita:574`) מפנה את מספר תיק הצד הנגדי ל-"'Sha'am' guidelines" שלא רונדרו. שורת נספח ג' לבדה
  הייתה מצדיקה שגיאה; סמן ההערה הוא שמוריד אותה.
- **בסיס תקרת קופה קטנה** — הערה E אומרת "the total VAT of the file's entries" ולא מגדירה אם
  מדובר במע"מ עסקאות, תשומות או שניהם. בחרתי את **הבסיס הרחב ביותר** (מע"מ של כל רשומת תנועה),
  שהוא הפרשנות **הנוחה ביותר לקובץ** — כך הכלל מתריע פחות, לא יותר.
- **`>` ולא `>=` בתקרת קופה קטנה.** התדריך אמר "exceeds", והערה E מנוסחת "less than" — כלומר סכום
  השווה בדיוק לתקרה כבר חורג. הפרש זניח (רק בשוויון מדויק). מימשתי `>` כפי שהתיקון המינימלי
  הגדיר, ורשמתי את הניואנס ב-`openQuestion` של הכלל במקום להסתיר אותו.
- **חיזוק בדיקת ה-ERROR: רצף ארבע מילים.** לא ניתן להוכיח במבחן אוטומטי שכלל **נובע** מהמסמך;
  זה מה שהביקורת האדוורסרית נועדה לעשות. מה שכן ניתן לבדוק הוא שהציטוט לא נדד מהשורה שהוא נוקב
  בה — וזו בדיוק התקלה שקרתה, שלוש פעמים. הבדיקה תפסה מיד שני פרפרזות נוספות שהוצגו כציטוט
  (`detail.length`, `file.record.unknown`), ושתיהן תוקנו לצטט את השורה.
- **`warnings-only.txt` הורד מ-₪10,000 ל-₪4,000.** אחרי פיצול `S` ב-₪5,000 המכירה הישנה הפכה
  לשגיאה, והקובץ כבר לא היה "אזהרות בלבד". הורדת הסכום שומרת על כוונת הפיקסצ'ר.
- **שינוי שם `invalid-footer-dealer.txt` ל-`warnings-footer-dealer.txt`.** יש בדיקה שסומכת על
  התחילית; קובץ בשם `invalid-*` שמאמת בהצלחה היה שובר אותה בצדק.
- **הוספתי בדיקה שסורקת את תיקיית הפיקסצ'רים** ומשווה לרשימה שהחבילה עוברת עליה, כדי שפיקסצ'ר
  חדש לא יוכל להתחמק מהבדיקות — זו הייתה נקודת כשל שקטה.
- **לא חושב `reportedVat`, ואף קובץ לא נקרא "תקין" (compliant).** הכלל נשמר בכל טקסט חדש.

## 5. שגיאות וניסיונות שנכשלו

- **עץ העבודה על `90816df`** — בסיס ישן, ללא `products/`. תוקן ב-`git reset --hard`.
- **שתי בדיקות נכשלו מיד עם הבדיקה המחוזקת** — בדיוק כפי שנחזה מראש בזמן התכנון:
  `detail.length` ו-`file.record.unknown` נשענו על `officialText` שמפרפרז את המסמך במקום לצטט
  שורה שהוא נוקב בה. זו לא הייתה תקלה בבדיקה אלא ההוכחה שהיא עובדת; שני ה-`officialText` נכתבו
  מחדש כדי לצטט את השורות (`ita:133`, `ita:150`, `ita:100`, `ita:158`, `ita:176-177`).
- **§6.11 נכתב בתחילה במיקום הלא נכון** — לפני §6.10 במקום אחריו. תוקן בסקריפט Python קצר
  שהזיז את שני הבלוקים.
- **שלוש פקודות Bash נדחו על ידי מנגנון בידוד עץ העבודה** (heredoc מורכב, `sed` עם ארגומנט
  מחושב, לולאה עם `node -e`). לא היה כשל אמיתי — הפקודות פוצלו או הוחלפו בכלי Edit/Write.

## 6. בדיקות ופעולות ולידציה

- `npm ci` — הותקן נקי.
- `npm run typecheck` — עבר, ללא פלט.
- `npm test` — **`Test Files  5 passed (5)` / `Tests  199 passed (199)`** (בסיס לפני העבודה: 134).
- `npm run build` — עבר.
- **CLI על כל 26 הפיקסצ'רים** — קוד היציאה תואם לתחילית בכולם:
  `fixtures checked: 26; mismatches: 0`. (`valid-*`/`warnings-*` → 0, `invalid-*` → 1.)
- הודפסה טבלת הממצאים לכל פיקסצ'ר ואומתה אחת-אחת מול מה שהחוזר אומר:
  `invalid-input-counterparty` → `detail.T.counterpartyExpected`,
  `invalid-self-invoice-counterparty` → `M I C P`,
  `invalid-s-large-unidentified` → `detail.S.counterpartyExpected` (שגיאה),
  `warnings-petty-cash-cap` → `totals.pettyCashCap`,
  `warnings-h-counterparty` → `detail.H.counterpartyExpected`,
  `warnings-vat-only-credit` → `detail.invoiceSumSign.signOfZero` (אזהרה),
  `warnings-footer-dealer` → `footer.licensedDealerId.matchesHeader` (אזהרה),
  `warnings-refgroup-hebrew` → `file.encoding.ascii` + `detail.refGroup.alphanumeric` (שתיהן אזהרה),
  `warnings-refgroup-punctuation` → `detail.refGroup.alphanumeric` (אזהרה),
  `valid-refgroup-lowercase` / `valid-refgroup-zeropad` → אפס ממצאים.
- `pnpm typecheck` מהשורש — עבר.
- נבדק שאין הפניות שנשארו מאחור: `1163-1168`, `1637`, `invalid-footer-dealer`, `rivhit:9`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

1. **פתיחת כל שורה מצוטטת ב-`sed -n` ידנית.** זה החלק היקר ביותר בעבודה הזאת ולא ברור שהוא
   צריך להיות ידני. סקריפט `scripts/check-citations.mjs` יכול לסרוק את כל מחרוזות
   `ita('…')`/`herp:…`/`rivhit:…` בקוד ובמסמכים, לפתוח את הטווח בקובץ המרונדר, ולהיכשל אם השורה
   ריקה או אם היא לא חולקת רצף מילים עם ה-`officialText` הסמוך. הבדיקה שנוספה היום עושה חצי
   מזה — רק ל-`error`, ורק דרך המאמת בזמן ריצה. **המשך טבעי:** להריץ אותה גם על `SPEC.md`
   ועל שדות `layout.ts`, ולהריץ ב-CI.
2. **קוד היציאה של ה-CLI מול תחילית שם הפיקסצ'ר** — נבדק ידנית בלולאת Bash. שווה לצרף כסקריפט
   `npm run verify:fixtures` כדי שלא יידרש להמציא את הלולאה מחדש בכל סשן.
3. **חיפוש מספרי שורה מיושנים אחרי תיקון ציטוט** (`grep` ל-1163-1168 ול-1637) — צריך להיות
   נגזרת של פריט 1, לא צעד נפרד.
4. **בסיס עץ עבודה ישן** — נבדק ידנית בתחילת כל משימה. `scripts/` יכול להחזיק
   `assert-worktree-base.sh <branch>` שנקרא בשורה אחת מהתדריך.

## 8. על מה בוזבזו אסימונים, לפי פעולה

| פעולה | הערכת בזבוז | הסבר |
|---|---|---|
| קריאת `src/validate.ts` בשלמותו | בינוני | הקובץ (801 שורות) נקרא בשלושה חלקים מפני שהפלט חרג מהמגבלה. קריאה ממוקדת לפי `grep -n` לשמות הפונקציות הייתה חוסכת חלק. |
| קריאת `docs/SPEC.md` בשלמותו | בינוני | 487 שורות, נקראו ברובן. בפועל נדרשו §1.2, §2, §3.6-3.7, §4-§7. `grep -n '^#'` ואז קריאת מקטעים הייתה מספיקה. |
| שלוש פקודות Bash שנדחו | נמוך | heredoc מורכב, `sed` עם ארגומנט מחושב, ולולאה עם `node -e`. בזבוז של שלוש הרצות; הלקח הוא לפצל מראש. |
| ניסיון לכתוב סקריפט Python לכל העריכות | נמוך-בינוני | נכתב ונדחה לפני הרצה. Edit ישיר היה הכלי הנכון מלכתחילה לעריכות מחרוזת מדויקות. |
| מיקום שגוי של §6.11 | נמוך | דרש סקריפט תיקון קצר. |
| **מה שלא בוזבז** | — | אימות הציטוטים מראש חסך סיבוב שלם: שתי הבדיקות שנכשלו נחזו בזמן התכנון, ואף ציטוט שנוסף לא נמצא שגוי אחר כך. |
