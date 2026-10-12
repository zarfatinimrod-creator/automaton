# סבב 74 (12.10.2026) — החזר כספי שנעשה זמן רב אחרי המכירה נרשם בספר (בונה Opus)

ענף `build/tick74-late-refund`, worktree מבוסס על `5418722`. קומיטים: `d30d6df` (הבדיקות לבדן, נכשלות על הבסיס),
`2bdc7be` (התיקון, שתי בדיקות נוספות ותוכנית המוטציות), והקומיט של שורת ה-README והיומן הזה.

## 1. מה המשתמש ביקש

החוט הראשי (תדריך סבב 74, §9 tick-71 item (2) ב-`CHANNEL_LOOP.md`, הפגם שמצא סוקר סבב 71) ביקש לתקן את ההחזר המאוחר:
הסנכרון (`fetchSince` ב-`src/revenue/connectors/gumroad.ts`) קורא מכירות מהיום שלפני הסמן, כך שמכירה מופיעה שוב רק כיום
אחד; `gumroadSaleEntries` רושם `:refund` רק כשמכירה שמופיעה ברשימה מסומנת `refunded: true`. החזר שנעשה יום-יומיים
ויותר אחרי המכירה לא נרשם לעולם, והספר מחזיק כסף שחזר לקונה. `colony.ts verify-gumroad` תופס את זה רק כשמישהו מריץ
אותו.

קודם לקרוא ולרשום (עם file:line) מה המאגר מתעד: (a) האם השדה `refunded` ברשימה משקף החזר שנעשה אחרי המכירה; (b) מה
הזמן הארוך ביותר אחרי מכירה שבו יכול לקרות החזר; (c) דרך מתועדת אחרת לקרוא מצב החזר. לעצב רק מעובדות מתועדות, ואם
אין עיצוב בטוח — לא לכתוב קוד ולהחזיר שאלה פתוחה. בדיקות קודם, בקומיט נפרד, נכשלות על הבסיס. בלי לגעת במה שמכירה
רושמת, ב-digest של מזהה המכירה, ב-`storedExternalId`, ב-`:refund`/`:fee`, ב-`enable`, במכירת Pro או בצעדי הבעלים.

## 2. הפעולות המרכזיות שביצעתי

**קריאה של הקוד (מספרי שורות הבסיס הם של `5418722`):**
- `gumroad.ts:11-18` (כותרת `fetchSince`), `:127` (`after = shiftDay(cursorDay, -1)`), `:135` (הרשימה דרך
  `listGumroadSalesSince` עם `MAX_LEDGER_SYNC_PAGES`), `:148`, `:152` (שתי נקודות החזרה; הסמן זז רק ליום החדש ביותר
  שנקרא, `:145`); `gumroadSaleEntries` רושם את ה-`:refund` ב-`:60-62`, עם `occurredAt` של המכירה עצמה (`:52`, `:61`).
- `heartbeat.ts:314-335` (`runLedgerSync`): `fetchSince` עם `getConnectorCursor` (`:317-322`), `problem` נדחף ל-`errors`
  כ-`gumroad: ...` (`:325`), כל רשומה דרך `recordLedgerEntry` (`:326-329`), `setConnectorCursor` רק כשיש `nextCursor`
  (`:330`).
- הכפילויות: `recordLedgerEntry` מחפש `(source, external_id)` ומחזיר `null` כשקיים (`ledger.ts:511-516`), והאינדקס הייחודי
  `idx_revenue_ledger_external` על `(source, external_id)` (`src/state/schema.ts:726-727`). לכן קריאה חוזרת של אותו
  החזר היא כפילות שהספר זורק.
- `gumroad-verify.ts:13-14` (ממצא מצב-החזר), `:160-161` (שורת החזר שהמכירה שלה לא מוחזרת), `:180-182` (מכירה מוחזרת
  בלי שורת החזר).

**(a) האם `refunded` ברשימה משקף החזר מאוחר — כן, בדרגת github (קוד שנקרא, לא נצפה חי):**
- האובייקט שהרשימה מחזירה: `refunded: stripe_refunded` (`purchase.rb:1052`, מצוטט ב-`gumroad.ts:24` ובלוג
  `logs/2026-09-30-pro-refund-rate-kpi.md:23`) — עמודה של הרכישה, לא תמונת מצב מיום המכירה.
- `refunded` נדלק כשההחזרים מכסים את כל החיוב, ואחרת `partially_refunded` (`refundable.rb:317-318`, `:406-412`;
  `gumroad.ts:175-177`, `logs/2026-09-30-pro-refund-rate-kpi.md:24`).
- האינדקס בוחר מכירות לפי `created_at >= after` (`sales_controller.rb:282`, `gumroad.ts:27-28`), כך שרשימה שמתחילה
  לפני המכירה מחזירה אותה עם מצבה הנוכחי.
- נקודת ההחזר עונה במכירה עצמה עם `refunded=true` (`products/il-biz-tools/scripts/gumroad-pro-product.js:846-847`), ו-
  `refundSale` כבר נשען על כך שרשימה חוזרת מראה מכירה ישנה כמוחזרת ("already-refunded",
  `gumroad-pro-product.js:868-871`, פסיקה `RULING-2026-10-05-refund-state.md` (a)5). גם `licenses/verify` מחזיר
  `refunded == true` אחרי החזר (`research/measurements/gumroad-native-licenses.md:113-117`).
- אף החזר אמיתי לא נצפה: "The first real refund remains the recorded check" (`RULING-2026-09-30-documents.md:316`).

**(b) הזמן הארוך ביותר אחרי מכירה שבו יכול לקרות החזר — לא מתועד גבול עליון:**
- חלון המדיניות: Gumroad מציע none, 7, 14, 30 או 183 ימים, ברירת מחדל 30 (`research/measurements/refund-law-il.md:85-89`);
  המושבה שומרת את ה-30 ורצפה של 14 (`MIN_REFUND_DAYS`, `gumroad-pro-product.js:119-124`); `site.json:10`
  `refundPeriodDays: null` עד שהמוצר ייווצר.
- אבל החלון חוסם את **הבקשה**, נמדד ברגע הבקשה (`insideWindow`, `gumroad-pro-product.js:813-816`; "a request made on day
  29 and read on day 31 is still inside", `:864-865`), לא את ההחזר.
- המגיב קורא בקשות עד `REFUND_LOOKBACK_DAYS = 60` ימים אחרי שהגיעו (`scripts/brand_mail.py:46-49`, `:197`), וחוזר על החזר
  שנדחה בגלל יתרה "until it happens" (`brand_mail.py:82-83`; `RULING-2026-10-05-refund-state.md:282-283`). ההחזר הראשון
  בחשבון חדש נדחה כך עד שמגיעות עוד מכירות (`refund-law-il.md:131-132`, `:1443-1447`;
  `RULING-2026-09-30-documents.md:305-307`).
- Gumroad מחזיר בעצמו: "within 90 days of purchase, at its discretion" (`refund-law-il.md:123-124`), אחרי 30 יום בלי
  תשובה מהיוצר (`:125`, `:909`), ו"in Gumroad's sole discretion" (`:127-128`).
- מסקנה: כל חלון קבוע היה מפספס בדיוק את ההחזר הסביר ביותר בהתחלה — ההחזר הראשון, שנדחה על יתרה וחוזר עד שהוא קורה.

**(c) דרך מתועדת אחרת — אין אחת שהמושבה יכולה להשתמש בה:**
- `licenses/verify` מחזיר `refunded` (`research/measurements/gumroad-license-decision.md:26`, `:45`) אבל צריך את מפתח
  הרישיון של הקונה, שנשמר רק בדפדפן שלו (`:14`).
- `GET /v2/sales/:id` (`sales_controller.rb:125-128`, דרך `RULING-2026-10-05-refund-state.md:144`) צריך את מזהה המכירה
  הגולמי, והספר שומר רק `sha256:` שלו (`gumroad.ts:32-34`).
- `GET /v2/sales?email=` (`gumroad-pro-product.js:71`, `:802-807`) צריך את כתובת הקונה, שלא בספר.
- ping / `resource_subscriptions` (webhooks) מוזכרים בשמם בלבד (`research/colony-sweep/scouts/storefronts--gumroad.md:117`;
  "ping payload" ב-`gumroad-license-decision.md:26`), וצריכים שרת שמקבל אותם — מול "static output over servers"
  (`MISSION.md:123`).
- לכן הדרך היחידה היא רשימה חוזרת דרך `after`.

**העיצוב (`2bdc7be`):**
- `fetchSince` מחזיר גם `listedFrom` (ה-`after` שממנו ביקש; שדה אופציונלי חדש ב-`ConnectorFetchResult`,
  `connectors/types.ts`).
- `openGumroadSales(db)` (`heartbeat.ts`): המכירות של Gumroad שהספר מחזיק בלי `:refund` — לפי המזהה השמור, עם השורה
  (line) שעליה נרשמו והזמן שלהן. נקרא **לפני** שהסנכרון רושם משהו של Gumroad.
- `readLateGumroadRefunds` (`gumroad.ts`): היום הוותיק ביותר מבין המכירות הפתוחות (זמן ש-`Date.parse` לא קורא — מושמט,
  כמו ש-`verify-gumroad` משמיט), `after` = היום שלפניו (כמו `fetchSince`, כי אזור הזמן של היום לא מתועד); לא מבקש כלום
  אם `after >= listedFrom` (הרשימה של הסנכרון עצמו כבר הגיעה לכולן); אחרת מדפדף עם `MAX_LEDGER_SYNC_PAGES`, ולכל
  מכירה ברשימה שנמצאת בקבוצה הפתוחה רושם את מה ש-`gumroadSaleEntries(sale, <השורה של המכירה>)` נותן מסוג `refund` בלבד.
- ב-`runLedgerSync`, בסוף בלוק ה-try של Gumroad: הקריאה החוזרת, `problem` שלה ל-`errors` כ-`gumroad: ...`, כל החזר דרך
  `recordLedgerEntry`. לא נוגעת בסמן.
- למה אף החזר לא הולך לאיבוד: כל מכירה שהספר מחזיק בלי החזר נמצאת בקבוצה הפתוחה; כל סנכרון שהרשימה שלו מתחילה אחריה
  קורא מחדש מהיום שלפניה, וקורא אותה במצבה הנוכחי (a); אין חלון שחותך (b). קריאה שנעצרה (נדחתה, לולאה, תקרה) רושמת מה
  שקראה ואומרת זאת כשגיאת סנכרון — חוסם בדוח — והסנכרון הבא מתחיל שוב מאותו יום.
- למה אף החזר לא נרשם פעמיים: מכירה שה-`:refund` שלה בספר יוצאת מהקבוצה הפתוחה, וגם אם נקראת שוב (באותו סנכרון,
  ברשימה הראשית או פעמיים בעמודים) — המזהה `sha256:<hex>:refund` זהה והספר זורק אותו (`ledger.ts:511-516`,
  `schema.ts:726-727`).
- מה לא נרשם: החזר של מכירה שהספר לא רשם (היה מוריד כסף שלא נספר); החזר חלקי (כמו `gumroadSaleEntries`); chargeback
  (כמו `gumroadSaleEntries`).

**בדיקות:** 10 בדיקות חדשות ב-`src/__tests__/revenue/gumroad-connector.test.ts`, describe "a refund made long after its
sale is booked by the sync's re-read, once (tick 74)", כולן דרך `runLedgerSync` ו-`recordLedgerEntry` האמיתיים, שעון
`Date` מקובע לכל סנכרון, אינדקס מזויף שקורא את `refunded` בכל בקשה. מזהים ואסימון מומצאים (`fake-sale-t74-*`,
`fake-token-T74`).

**מוטציות:** 21 רשומות חדשות ב-`src/__tests__/revenue/mutations/gumroad.json` (T74-G1..G15, T74-H1..H6); ה-find של
T71-G2 ו-T71-G3 זז עם `listedFrom`, ו-T71-G10 קיבל `"nth": 1` (שורת הסירוב של הקריאה החוזרת מסתיימת באותו טקסט).
הרצה מלאה בתוך `scripts/sim-tree.sh --dir .../refund-scratch/sim` — התוצאה בסעיף 6.

## 3. קבצים/מערכות ששונו

- `src/revenue/connectors/gumroad.ts`: פסקה חדשה בכותרת (ההחזר המאוחר, העובדות והמקורות); `OpenGumroadSale`,
  `LateRefundRead`, `lateRefundStop`, `readLateGumroadRefunds` (חדשים); `fetchSince` מחזיר `listedFrom: after` בשתי
  נקודות ההחזרה. `gumroadSaleEntries`, `storedExternalId`, `:refund`/`:fee` — ללא שינוי.
- `src/revenue/connectors/types.ts`: `ConnectorFetchResult.listedFrom?` (אופציונלי; Stripe ו-Lemon Squeezy לא מחזירים).
- `src/revenue/heartbeat.ts`: `openGumroadSales` (חדש, מיוצא); `runLedgerSync` קורא אותו לפני `fetchSince` של Gumroad
  ומריץ את `readLateGumroadRefunds` בסוף הבלוק; ייבוא `storedExternalId`, `readLateGumroadRefunds`, `OpenGumroadSale`.
- `src/__tests__/revenue/gumroad-connector.test.ts`: 10 בדיקות, ייבוא `verifyGumroadLedger`.
- `src/__tests__/revenue/mutations/gumroad.json` (79 רשומות, היו 58) ו-`README.md` שלו (השורה של `gumroad.json`).
- `logs/2026-10-12-channel-loop-tick-74-late-refund.md` (היומן הזה).
- לא נגעתי ב-`logs/CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, פסיקות או תדריכים,
  `research/measurements/*`, `state/colony/`; לא git fetch/pull/push, לא gh, לא רשת, לא Gumroad אמיתי.

## 4. החלטות והנחות משמעותיות

1. **בלי חלון החזרים (סטייה מה"עיצוב הסביר" בתדריך).** התדריך הציע קריאה חוזרת מ-(היום − חלון ההחזרים). העובדות
   המתועדות ב-(b) מראות שהחלון חוסם את הבקשה ולא את ההחזר, ושההחזר הראשון בחשבון חדש צפוי לחכות ליתרה "until it
   happens". חלון היה מפספס בדיוק אותו. במקום זה הטווח הוא של הספר: מהיום שלפני המכירה הוותיקה ביותר שהספר מחזיק בלי
   החזר. הבדיקה "a refund outside the window is not read" הפכה ל"refund 200 days after" (נרשם) ול"a refunded sale the
   ledger never booked is not booked" (הגבול האמיתי), וההערה בקוד במקום שבו `after` מוגדר אומרת זאת.
2. **המחיר הוא עמודים.** בכל סנכרון שהרשימה שלו מתחילה אחרי המכירה הפתוחה הוותיקה: עמוד לכל עשר מכירות מאז. בתקרה
   (500 עמודים, 5,000 מכירות) הקריאה נעצרת בכל סנכרון ואומרת זאת (חוסם, לא איבוד שקט) — אותה מגבלה כמו פריט (1) של
   §9 tick-71. היום יש 0 שורות Gumroad, כלומר 0 עמודים נוספים.
3. **ההחזר נרשם על השורה (line) שעליה נרשמה המכירה**, לא על השורה שהמפה נותנת היום — כך המכירה וההחזר מתקזזים באותה
   שורה. ההחזר עצמו הוא בדיוק מה ש-`gumroadSaleEntries` רושם (סכום, מטבע, מזהה, `occurredAt` של המכירה, "refunded").
4. **הקבוצה הפתוחה נקראת לפני הרשימה הראשית**: מכירה שהרשימה הראשית רושמת עכשיו נקראה עכשיו עם מצב ההחזר שלה.
5. **מכירה ביום ה-`after` של הרשימה הראשית נקראת מחדש** (`after >= listedFrom` ולא `>`): לא מתועד אם האינדקס כולל את
   יום ה-`after`, ולכן רק מכירה מהיום שאחריו בטוח ברשימה הראשית.
6. **הקריאה החוזרת רצה גם כשהרשימה הראשית נדחתה** (`listedFrom` מוחזר גם אז): היא עצמאית, מ-`after` אחר.
7. **בסוף בלוק ה-try**, אחרי `unmapped` ו-`sources`: חריגה בה לא מוחקת את מה שהרשימה הראשית החזירה.

**שאלות פתוחות לחוט הראשי (לא הוכרעו כאן):**
- **המחיר מול גבול.** הקריאה החוזרת גדלה עם הספר ורצה בכל סנכרון (שעתי). אם זה יקר מדי — להריץ אותה פעם ביום (חותמת
  ב-kv), או גבול שנקבע בפסיקה (למשל 183 ימים + מצב ההמתנה של המגיב). גבול כזה איננו בשום מקור מתועד, ולכן הוא שאלה ל-Fable
  ולא החלטה של בונה.
- **תאריך ההחזר.** החזר מאוחר נרשם בתאריך המכירה (`occurredAt` של `gumroadSaleEntries`, ללא שינוי לפי ההנחיה), כך שהוא משנה
  חודש שכבר נסגר ואת חלונות המדדים של השורה. אובייקט המכירה המתועד לא נושא זמן החזר.
- **chargeback.** `chargedback: true` (שלא בוטל) הוא כסף שחזר (`gumroad.ts`, ההערה על `chargedback` ב-`RefundRateCount`),
  אבל `gumroadSaleEntries` לא רושם עליו כלום — הספר מחזיק אותו. מחוץ להיקף; פריט לפסיקה או לבנייה.
- **החזר חלקי.** לא נרשם כלום (כמו היום); הסכום שהוחזר אינו שדה מתועד באובייקט המכירה.
- **דרגת הראיה.** (a) נשען על קוד של Gumroad שנקרא (github), לא על החזר שנצפה; ההחזר האמיתי הראשון הוא הבדיקה.
- **שארית.** מכירה של Gumroad שנרשמה ביד עם זמן ש-`Date.parse` לא קורא לא נכנסת לטווח (כמו ב-`verify-gumroad`).

## 5. שגיאות וניסיונות שנכשלו

- הוספת רשומות לתוכנית בעזרת `json.dump` שינתה את העיצוב של שני מערכים קיימים (מערך בשורה אחת → כמה שורות). חזרתי
  לעריכת טקסט של הקובץ מ-HEAD והוספת הרשומות בסגנון הקיים, כדי שה-diff יכלול רק את מה שהשתנה.
- `mutate.mjs --check` מצא 3 רשומות שלא חלות: T71-G2 ו-T71-G3 (ה-find כלל את שורת ההחזרה בלי `listedFrom`) ו-T71-G10
  (הטקסט מופיע פעמיים). תוקן כ"find זז" ו-`nth: 1`, בלי לשנות את המשמעות של אף מוטציה.
- הבלוק של הקריאה החוזרת נכתב תחילה לפני `result.unmapped.push`; העברתי אותו לסוף ה-try כדי שחריגה בו לא תעלים את
  `unmapped` ו-`sources` של הרשימה הראשית.
- `sleep 60` לפני בדיקת התקדמות נחסם על ידי הסביבה; בדקתי את קבצי הפלט ישירות.
- כותרת הבדיקה "says so at every sync" שונתה ל-"says where it stopped": אחרי שההחזר נרשם הקבוצה הפתוחה מתרוקנת, כך שאין
  "בכל סנכרון".

## 6. בדיקות ופעולות ולידציה

- **נכשל קודם:** `npx vitest run src/__tests__/revenue/gumroad-connector.test.ts` על `d30d6df` (בדיקות בלבד, קוד הבסיס):
  exit 1, 8 failed | 36 passed (44). שתי הבדיקות שנוספו אחר כך הורצו מול קוד הבסיס בעץ
  `sim-tree.sh --ref 5418722` עם קובץ הבדיקות העדכני: exit 1, 10 failed | 36 passed (46). כל הכישלונות על assertions
  (לא שגיאות טעינה).
- **אחרי התיקון:** אותו קובץ, 46 passed; `scripts/verify.sh` על gumroad-connector, gumroad-verify, loop, frozen-citations,
  mutation-plans, gumroad-refund-rate: typecheck exit 0, tests exit 0, 6 files, 190 passed.
- **מוטציות:** `scripts/sim-tree.sh --dir .../refund-scratch/sim -- node scripts/mutate.mjs --plan
  src/__tests__/revenue/mutations/gumroad.json` על `2bdc7be`: exit 0, "79 applied: 79 killed, 0 survived", 297 שניות
  (ליד ה-verify המלא בשתי הדקות הראשונות; ארבעת ה-baselines 2.0-6.2 שניות, רשומות T74 כ-3.4-4.0 שניות כל אחת). שורת
  `gumroad.json` ב-`src/__tests__/revenue/mutations/README.md` עודכנה (79 רשומות, ticks 69, 71, 74).
- **verify מלא:** `scripts/verify.sh` (typecheck + `src/__tests__/revenue`) על `2bdc7be`: exit 0; typecheck exit 0; tests
  exit 0, 85 files passed, 3198 passed | 2 skipped (3200); 126 שניות. שתי ההשמטות קיימות מקודם (למשל
  `prize-apply-reading.test.ts`, 1 skipped), לא בקבצים שנגעתי בהם.
- `mutate.mjs --check --plan .../gumroad.json`: exit 0, 79 of 79 would apply.
- בדיקת ה-diff: חיפוש התבנית של שם הבעלים (שני חצאים מחוברים) ושל סימן ה-at בשורות שנוספו — 0 ו-0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **הוספת רשומות לתוכנית מוטציות בלי לשנות את העיצוב הקיים**: כתבתי סקריפט Python חד-פעמי. `mutate.mjs --append
  <entries.json>` (שכותב בסגנון הקובץ ובודק `--check` מיד) היה חוסך את זה ואת הטעות של `json.dump`.
- **הרצת בדיקות חדשות מול קוד הבסיס**: `sim-tree.sh --ref <base>` עם `bash -c 'cp ... && npx vitest ...'`. אפשרות
  `--overlay <path>` ב-`sim-tree.sh` (להעתיק קובץ מה-checkout לעץ לפני הפקודה) הייתה הופכת את זה לשורה אחת.
- **מציאת find שזז אחרי שינוי**: `--check` אומר מה שבור; הצעה אוטומטית של find חדש (אותו טקסט עם ההפרש) הייתה חוסכת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקות והמדידות על החזרים (refund-state, documents, refund-law-il, license-decision): החלק הגדול, והכרחי —
  ממנו יצאה ההחלטה שאין חלון. חלקים מהפסיקות (ה-threat model של refund-retries) נקראו בלי צורך.
- הפלט של רשימת המשימות של החוט הראשי שהסביבה הדביקה שוב ושוב: לא רלוונטי לבנייה, חזר כמה פעמים.
- `mutate.mjs --check` שהדפיס את כל 79 השורות פעמיים: היה מספיק `| tail -1` מההתחלה.
- תיקון העיצוב של קובץ התוכנית אחרי `json.dump`: סבב מיותר אחד.
