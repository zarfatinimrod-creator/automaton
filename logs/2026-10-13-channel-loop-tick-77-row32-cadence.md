# סבב 77 (13.10.2026) — שרשרת A של קיפולי שורה 32: הקריאה החוזרת של Gumroad פעם ביום, הרשומה שלה, טווח הימים בתקרה, ושורת ההחזר והעמלה ב-`fetchSince` (בונה Opus)

ענף `build/tick77-cadence`, worktree מבוסס על `8c4fba5` (`origin/claude/new-session-j071dx`; הפסיקה
`research/channel-loop/RULING-2026-10-13-gumroad-refund-reread.md` ו-`gumroadHandRefundRefusal` ב-`src/revenue/ledger.ts`
קיימים). קומיטים: `eb65727` (הבדיקות לבדן, נכשלות על הבסיס), `7533cb9` (הקוד ותוכנית המוטציות), והקומיט של שורות ה-README,
הערת הקורא ב-`heartbeat.ts` והיומן הזה.

## 1. מה המשתמש ביקש

החוט הראשי ביקש את שרשרת A של קיפולי הפסיקה של 13.10 (ישיבת Fable, שורה 32 ב-`FABLE_QUEUE`): קיפולים 1, 2, 3 ו-4 —
הקצב והרשומה ב-`heartbeat.ts`, השינויים ב-`gumroad.ts` (הקצב, טווח הימים בשורת התקרה, העצה החדשה בשורת ה-unlisted,
`lineOfBookedSale` ב-`fetchSince`), השדה ב-`types.ts` והחיווט של כלל השורה; מקיפול 8 — שני ה-describe החדשים
ב-`gumroad-connector.test.ts` (§1 מקרים (a)-(f), §4 מקרה (h)) ומקרה ה-render של readOnly; מקיפול 9 — הרשומות T77-H1..H7
ו-T77-G1..G6 ב-`mutations/gumroad.json` ושורת ה-README שלו. מקרה (g) (אחרי `placeGumroadSale`) שייך לשרשרת B ודולג;
את הפקודה `colony.ts place-gumroad-sale` שרשרת B בונה — כאן רק הטקסט של העצה. בדיקות קודם בקומיט נפרד, מוטציות בתוך
`scripts/sim-tree.sh`, `scripts/verify.sh` ממוקד ומלא, הבדיקות של "Checks before done" שבתחום, יומן, מחיקת תיקיית ה-scratch.

## 2. הפעולות המרכזיות שביצעתי

**קריאה:** הפסיקה כולה (§1-§6, "What this does not decide", REOPEN, הקיפולים); `gumroad.ts` כולו, `heartbeat.ts:1-403`,
`types.ts`, `gumroad-connector.test.ts` כולו, `gumroad-verify.ts:100-130` (`readBeforeStop`), `runner.ts:100-125`,
`:237-330`, `:355-410`, `:485-505` (`isDue`, `markRan`, `TickOptions.readOnly`, `ledgerSyncBlockers`), `ledger.ts:440-520`;
יומני סבבים 74 ו-76; `mutations/gumroad.json` ושורות ה-README שלו.

**הבדיקות קודם (`eb65727`):** 13 בדיקות חדשות (נספרו מה-diff: 13 שורות `it(` שנוספו, 0 שנמחקו), בשני describe מקוננים
בתוך ה-describe של סבב 74 כדי להשתמש בעזרים שלו (`index`, `twoSalesBooked`, `bookByHand`, `unlistedLine`, `at`):
- §1 (8 בדיקות): (a) רק הסנכרון הראשון של היום ב-UTC קורא מחדש (00:17 שואל `["2026-10-04", "2026-09-30"]`, 01:17 ו-12:17
  רק `["2026-10-04"]`), החזר שנעשה ב-06:00 נרשם ב-00:17 של היום הבא, על `fake-line-a`, פעם אחת, `-7900`, והרשומה ב-kv
  `day` 10-10 ואז 10-11, `after` 09-30, `pages: 1`, `read: 2`; (b) קריאה שנדחתה — אין רשומה, הסנכרון הבא שואל שוב ורושם
  את ההחזר ואת הרשומה; (c) לולאה — שתי בקשות, אין רשומה, הסנכרון הבא שואל שוב; (d) תקרה — 500 בקשות, שורת העצירה עם
  "the sales read created 2026-10-01 to 2026-10-05", הרשומה עם `problem`; ב-01:17 בקשה אחת ו-`errors` הוא
  `["gumroad: last late-refund re-read, 2026-10-10: " + אותה עצירה]`; ה-blockers של `tick` (02:17) נושאים אותה; render
  (`readOnly`, 03:17) לא שואל כלום ומדפיס אותה עם "last ledger sync, 2026-10-10T02:17:00.000Z: "; ב-00:17 של היום הבא
  שוב 500 בקשות; (e) מכירה ביום הסמן שהוחזרה אחרי הקריאה של היום נרשמת בסנכרון השעתי הבא (הרשימה של הסנכרון עצמו);
  (f) המכירה שנרשמה ביד באיחור — שורה ב-00:17, ושוב פעם אחת ב-01:17 מהרשומה (עם " (from the last re-read, 2026-10-12)"),
  ונעלמת אחרי שההחזר שלה נרשם; (f) נוסף — מכירה שהרשומה מונה וגם טווח הרשימה של הסנכרון עצמו מונה נאמרת פעם אחת;
  ורשומה שלא נקראת כרשומה (JSON שבור, חסרת שדות, יום שאינו יום, unlisted עם id מספרי, `problem` מספרי) — הסנכרון קורא מחדש.
- §4 (5 בדיקות): (h) מכירה שהסנכרון רשם על `fake-line-b`, מוחזרת בסנכרון הבא תחת `GUMROAD_DEFAULT_LINE: "fake-line-a"` —
  ההחזר של `fetchSince` על `fake-line-b` (ו-`fetchSince` עצמו: עם resolver הכל על b, בלעדיו על a); מכירה ביד על b בלי
  שורת עמלה, נקראת עם `gumroad_fee` תחת a — העמלה על b; אותו דבר למכירה שההחזר שלה כבר רשום (לא פתוחה) — ההרגה של T77-H7;
  מכירה חדשה עוברת לשורת המפה כמו קודם; בלי מפה ובלי שורת ברירת מחדל — ההחזר של מכירה רשומה נשאר על השורה שלה, מכירה
  חדשה על `unassigned`, ו-`unmapped` מונה את המוצר.
- שתי נעיצות קיימות עודכנו לפי הפסיקה (סעיף 4).

**הקוד (`7533cb9`):**
- `src/revenue/heartbeat.ts`: `GUMROAD_LATE_REREAD_LAST_KEY` (`:193`), `GumroadLateRereadLast` (`:195`),
  `lastGumroadLateReread` (`:216`, רשומה פגומה נקראת כאין, כמו `lastGumroadRefundRateRead`); `bookedGumroadSales` (`:365`,
  כל מכירת `gumroad` מסוג `sale` עם מזהה, לפי המזהה השמור, פתוחה או סגורה); ב-`runLedgerSync`: `booked` נבנה לפני
  `fetchSince` (`:413`) ומועבר כ-`lineOfBookedSale` (`:419`); `rereadDay` מהשעון של הסנכרון (`:443`), `due` (`:445`),
  `reread`/`carried`/`carriedDay` ל-`readLateGumroadRefunds`, שורת "last late-refund re-read, <day>: " (`:452`), ספירת
  `refundsBooked`, והרשומה נכתבת רק כש-`late.after !== null` ו-`stop` אינו `refused`/`looped` (`:460`); הכותרת (`:9-14`) והערת
  הענף של Gumroad אומרות את הקצב, כלל הניסיון החוזר וכלל השורה, עם נתיב הפסיקה.
- `src/revenue/connectors/gumroad.ts`: `storedSaleId` (`:80`, הביטוי של `gumroadSaleEntries` הועבר אליו בטקסט זהה);
  `fetchSince` מקבל `lineOfBookedSale` (`:158`) ורושם את כל המשפחה על `(saleId && lineOfBookedSale?.(saleId)) ?? lineId`
  (`:190`; `unmapped` ללא שינוי); `UnlistedGumroadSale` (`:209`); `LateRefundRead` קיבל `stop`, `pages`, `read`,
  `unlistedSales` (`:215`); `lateRefundStop` (`:248`) עם טווח הימים בתקרה לפי תאריך ולא לפי סדר הרשימה (`:250`);
  `unlistedSale` (`:271`) עם העצה החדשה; `readLateGumroadRefunds` (`:299`) מקבל `reread`, `carried`, `carriedDay`, ו-
  `withCarried` (`:328`) מוסיף לכל מכירה מהרשומה שעדיין פתוחה, לא הוחזרה בסנכרון הזה ולא נקראה כבר — שורה אחת; `reread: false`
  לא מבקש כלום (`:367`); הכותרת (`:20-51`) — הקצב, הטווח השלם ולמה, התקרה כ-REOPEN 1, כלל הזמן של מכירה ביד וההצבה, כלל השורה.
- `src/revenue/connectors/types.ts:41-46`: `lineOfBookedSale?` עם ההערה שהפסיקה נותנת.
- `src/__tests__/revenue/mutations/gumroad.json`: 13 רשומות חדשות (T77-H1..H7, T77-G1..G6); ה-find של T74-G1, T74-G2,
  T74-G13, T74R-G1, T74R-G2, T74R-G5, T74R-G10 זז עם הקוד (T74-G2 — גם ה-replace, סעיף 4). `--check`: 109 of 109.

**מוטציות:** `scripts/sim-tree.sh --dir .../a-scratch/sim -- node scripts/mutate.mjs --plan
src/__tests__/revenue/mutations/gumroad.json` על `7533cb9` — התוצאה בסעיף 6.

## 3. קבצים/מערכות ששונו

- `src/revenue/heartbeat.ts`, `src/revenue/connectors/gumroad.ts`, `src/revenue/connectors/types.ts`.
- `src/__tests__/revenue/gumroad-connector.test.ts` (+13 בדיקות, שתי נעיצות).
- `src/__tests__/revenue/mutations/gumroad.json` (109 רשומות, היו 96) ושתי השורות של `gumroad.json` ב-`mutations/README.md`.
- היומן הזה.
- **לא שונו:** `runner.test.ts` (מקרה ה-render נכנס ל-(d) בחבילת המחבר, כפי שהפסיקה מתירה), `ledger.ts`, `tools.ts`,
  `scripts/colony.ts`, `colony.yml`, `gumroad-place.ts`, `ledger.json`, `colony.json`, מסמכים (של שרשרת B); `logs/CHECKPOINT.md`,
  `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, פסיקות, `research/measurements/*`, `state/colony/`. לא git
  fetch/pull/push/stash, לא gh, לא רשת, לא Gumroad אמיתי; כל המזהים והאסימונים בבדיקות מומצאים.

## 4. החלטות והנחות משמעותיות

1. **"<its day>" בשורה שנאמרת שוב = היום של הקריאה החוזרת האחרונה**, לא היום של המכירה (שכבר בשורה). הטיפוס של `carried`
   בפסיקה לא נושא את היום הזה, ולכן נוסף פרמטר אופציונלי `carriedDay` ל-`readLateGumroadRefunds` — סטייה קטנה מהחתימה
   שבפסיקה.
2. **"no readable day" בשורת התקרה** נכתב ", the sales read created on no readable day" (המילים של הפסיקה בתוך המשפט).
3. **`unlistedSales` כולל גם את המכירות שנאמרות שוב** (1:1 עם `unlisted`); הרשומה נכתבת רק בסנכרון שקרא מחדש, שבו `carried`
   ריק, כך שאין לזה השפעה על מה שנשמר.
4. **מקרה (f) לא יכול להרוג את T77-G5 כפי שנוסח:** במכירה של `:866` הטווח של הרשימה של הסנכרון עצמו לא מגיע ליום שלה
   (`day > listedFrom` שקרי), כך שאין מי שימנה אותה פעמיים. נוספה בדיקת (f) שנייה שבה גם הרשומה וגם הרשימה של הסנכרון עצמו
   מונות את אותה מכירה; היא הורגת את G5.
5. **(h) "a new sale under default line a and an unmapped product still books on a and names the product in unmapped"**
   — נקרא כשני מקרים: הקוד מונה מוצר כ-unmapped רק כשהשורה `unassigned`, כלומר אף פעם עם שורת ברירת מחדל. לכן: מכירה חדשה
   תחת a נרשמת על a (`unmapped: []`); ובלי מפה ובלי ברירת מחדל — ההחזר של מכירה רשומה נשאר על השורה שלה ו-`unmapped` מונה
   את המוצר.
6. **שתי הבדיקות החדשות מקוננות** בתוך ה-describe של סבב 74 (עזרים משותפים), כל אחת describe משלה.
7. **בדיקה נוספת שלא ברשימה של הפסיקה:** רשומה שלא נקראת כרשומה גורמת לקריאה חוזרת. אין לה רשומת מוטציה.
8. **T74-G2:** ה-find זז, וה-replace הפך מ-"" ל-`  if (!reread) return noListing(unlistedOf(listed, null));\n`, כדי שהמוטציה
   תמשיך להסיר רק את הדילוג כשהרשימה של הסנכרון עצמו הגיעה לכולן, כמו קודם (מחיקת השורה כולה הייתה מסירה גם את שומר הקצב).
9. **ההערה של `lastGumroadLateReread`** מזכירה את מפתח ה-kv מילולית, כך ש-`grep -n -F "gumroad_late_reread"` של "Checks before
   done" מדפיס גם את הקורא (בלי זה הוא הדפיס רק את המפתח).
10. **שתי נעיצות ששונו לפי הפסיקה:** (א) שורת התקרה בבדיקת "a re-read longer than 500 pages" קיבלה ", the sales read created
    2026-10-01 to 2026-10-05" (§2 פריט 2); (ב) העזר `unlistedLine` — העצה "Check it with verify-gumroad; if Gumroad reports it
    refunded, book the refund by hand as …:refund. Said at every sync while it has no refund row" הוחלפה ב-"Place it on the day
    Gumroad made it with colony.ts place-gumroad-sale, which takes that day from Gumroad's own listing; its refund, if any, is
    then booked by the next re-read. Said at every sync while it is open" (§3 פריט 4). שום assertion לא הוסר או הוחלש.

**שאלות פתוחות לחוט הראשי:**
- **עצירה שנאמרת שוב אחרי שסיבתה עברה.** אם הקריאה של היום נעצרה בתקרה ואחר כך באותו יום כל המכירות הפתוחות נסגרו, ה-`problem`
  של הרשומה עדיין נאמר עד הקריאה של מחר (הפסיקה: "said at every sync" עד הקריאה הבאה). אפשר לא לומר אותו כשאין מכירה
  פתוחה; לא נעשה, כי הפסיקה לא אומרת.
- **סנכרון "due" שהקריאה בו נדחתה** לא אומר שוב את המכירות ה-unlisted של אתמול (`carried = due ? [] : …`, כמו בפסיקה), רק את
  שורות הטווח של הרשימה של הסנכרון עצמו, עד שהקריאה תצליח. חלון של שעה או יותר בלי השורה.
- **(g) ו-`grep -rn -F "UPDATE revenue_ledger"`** שייכים לשרשרת B; בעץ הזה ה-grep לא מדפיס כלום (exit 1).

## 5. שגיאות וניסיונות שנכשלו

- הטיוטה הראשונה של `readLateGumroadRefunds` השתמשה ב-`const NO_LISTING = {…} as const` עם spread; החלפתי בפונקציה
  `noListing` לפני ה-typecheck (`as const` הופך את `entries` ל-readonly).
- `bookedGumroadSales` נכשל ב-typecheck (`storedExternalId` מחזיר `string | null`); נוספה בדיקת `null`, כמו ב-`openGumroadSales`.
- `mutate.mjs --check` הראשון נכשל על כל הרשומות של הקבצים ששיניתי ("uncommitted changes"); הרצתי עם `--allow-dirty` כדי לראות
  אילו find זזו (7), תיקנתי, וה-`--check` אחרי הקומיט עבר נקי.
- `grep -n -F "gumroad_late_reread"` הדפיס בהתחלה רק את המפתח; נוסף אזכור מילולי בהערת הקורא (החלטה 9).

## 6. בדיקות ופעולות ולידציה

- **נכשל קודם (`eb65727`, קוד הבסיס):** `npx vitest run src/__tests__/revenue/gumroad-connector.test.ts` — exit 1, 15 failed |
  54 passed (69). 14 כישלונות `AssertionError`; ה-15 (הרשומה הפגומה) נכשל על `SyntaxError` מתוך העזר `lastReread` של הבדיקה
  עצמה: קוד הבסיס לא כותב רשומה, ולכן השורה "not json" שהבדיקה שתלה נשארה ונקראה. אף כישלון טעינה של הקובץ.
  12 מ-13 הבדיקות החדשות נכשלו, ועוד שלוש קיימות שהנעיצה שלהן השתנתה (התקרה ושתי בדיקות ה-hand-booked); הבדיקה "a sale not
  booked yet goes … on the map's line, as before" עברה גם על הבסיס, כמצופה (שמירת התנהגות).
- **אחרי הקוד:** אותו קובץ 69 passed (69); `gumroad-connector`, `gumroad-verify`, `gumroad-refund-rate`, `mutation-plans`,
  `runner`, `loop` — exit 0, 6 files, 246 passed.
- **verify ממוקד:** `VERIFY_OUT=.../a-scratch/verify scripts/verify.sh src/__tests__/revenue/gumroad-connector.test.ts
  src/__tests__/revenue/runner.test.ts src/__tests__/revenue/frozen-citations.test.ts` על `7533cb9`: exit 0 (typecheck exit 0,
  tests exit 0), 3 files, 146 passed, 19 שניות.
- **verify מלא:** `VERIFY_OUT=.../a-scratch/verify-full scripts/verify.sh` על `7533cb9`: exit 0 (typecheck exit 0, tests exit 0),
  85 files passed, 3268 passed | 2 skipped (3270), 148 שניות (ליד ריצת המוטציות).
- **מוטציות:** `scripts/sim-tree.sh --dir .../a-scratch/sim -- node scripts/mutate.mjs --plan
  src/__tests__/revenue/mutations/gumroad.json` על `7533cb9`: exit 0, "109 applied: 109 killed, 0 survived, 0 killed?, 0 timeout;
  0 not applied; 0 not run", 521 שניות כולל הקמת העץ (ליד ה-verify הממוקד ואז המלא בכ-3 הדקות הראשונות); ארבעת ה-baselines
  1.8-5.6 שניות, רשומות T77 4.3-5.4 שניות כל אחת. כל 13 רשומות T77 נהרגו (exit 1 של vitest), וכל 7 ה-find שזזו נהרגו גם
  הם. `sim-tree.sh` מחק את העץ אחרי ההצלחה. שורות `gumroad.json` ב-`mutations/README.md` עודכנו (109 רשומות, 521 שניות,
  ticks 69, 71, 74, 77).
- **verify על העץ הסופי** (אחרי הערת הקורא ב-`heartbeat.ts`, שינוי בהערה בלבד): `scripts/verify.sh` על gumroad-connector, runner,
  frozen-citations ו-mutation-plans — exit 0 (typecheck exit 0, tests exit 0), 4 files, 202 passed.
- **Checks before done שבתחום:** `grep -n -F "gumroad_late_reread" src/revenue/heartbeat.ts` — המפתח (`:193`) והקורא (`:213`);
  `grep -n -F "lineOfBookedSale"` על שלושת הקבצים — שלושת האתרים (`gumroad.ts:158`, `:190`; `types.ts:46`; `heartbeat.ts:419`, ועוד
  אזכורים בהערות); `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/gumroad.json` — 109 of 109.
- **היגיינה:** חיפוש תבנית השם של הבעלים (שני חצאים מחוברים) וסימן ה-at בשורות שנוספו ב-diff של כל קומיט — 0 ו-0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **עדכון find שזז** — שוב ידני (7 רשומות) בסקריפט Python חד-פעמי, וגם הוספת 13 רשומות בסגנון הקובץ. `mutate.mjs --append
  <entries.json>` ו-`--suggest-find` (שיומני סבבים 74 ו-76 כבר הציעו) היו חוסכים את שניהם.
- **`--check` על עץ מלוכלך** — צריך `--allow-dirty` כדי לבדוק find לפני קומיט; ברירת מחדל של "לבדוק בלי לכתוב" הייתה פשוטה יותר.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה (561 שורות) ושני יומני הבנייה — הכרחי; חלקים מ-§2-§6 ומקיפולים 5-12 (של שרשרת B) נקראו בלי שימוש כאן.
- רשימת המשימות של החוט הראשי שהסביבה הדביקה שוב ושוב — לא רלוונטית לבנייה.
- `mutate.mjs --check` שהדפיס את כל השורות פעם אחת לפני הסינון.
