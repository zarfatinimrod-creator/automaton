# טיק 42 (4.10.2026): משמר המפרסם — `assertMayUpload` מסרב להעלאה כל עוד `uploadsFrozen` דולק

## 1. מה המשתמש ביקש

סקריפט הזרימה של טיק 42 (פלט של סקריפט, לא המשתמש עצמו) ביקש מהבונה, סוכן Opus בעץ עבודה מבודד, לבנות את פריט 2
של "Queued 4.10" ב-§9 של `logs/CHANNEL_LOOP.md`: לא מפרסם, אלא **משמר** שכל מפרסם עתידי חייב לקרוא לו קודם. פונקציה
טהורה (`assertMayUpload`) שזורקת שגיאה מטיפוס `UploadRefused` עם קוד סיבה כאשר: (א) `uploadsFrozen` דולק; (ב) הניסוי
נהרג; (ג) בקו הילדים קריאה חוזרת `false` של העלאה קודמת, או קריאה שהגיע זמנה וחסרה (פסיקה 4.10 §10); (ד) שער הפרסום של
המניפסט לא עבר. בדיקות לכל סיבה, למסלול המעבר ולמחזור JSON של מצב קפוא; בדיקה שסורקת את הקוד ונכשלת ביום שמופיע מפרסם
שלא קורא למשמר; תוכנית מוטציות עם מוטציה אחת לכל קוד סיבה, כולן נהרגות. בלי רשת, בלי קריאה ל-YouTube, בלי תלות חדשה,
בלי לגעת ב-`PINNED_GATES_SHA256` של T1. לא לגעת ב-`CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`,
`CLAUDE.md`, בקבצי `logs/` קיימים, ב-`research/` או ב-`products/`. לבצע commit בעץ העבודה בלבד ולכתוב את היומן הזה.

## 2. הפעולות המרכזיות שביצעתי

- **בדיקת בסיס:** העץ נפתח על `3edd377`, ו-`01d51d0` לא היה אב קדמון שלו. לפי ההוראה: `git reset --hard
  claude/new-session-j071dx` ל-`a824d4c`; אחרי האיפוס `01d51d0` אב קדמון ושלושת הקבצים קיימים. `pnpm install
  --frozen-lockfile --prefer-offline` (לא היה `node_modules`).
- **קריאה:** §9 פריט 2 ושורת טיק 42 ב-§10 של `CHANNEL_LOOP.md`; `experiments.ts` במלואו (ההערה על `uploadsFrozen`,
  `FREEZING_ESCALATIONS`); `youtube-madeforkids.ts` ו-`scripts/youtube-madeforkids-readback.ts`; הפסיקה של 4.10 §8 ו-§10
  (קריאה בלבד); `kids-explainers-kills.test.ts`, `experiments.test.ts`; `publication-gate.ts` (`checkPublication`,
  `EXPERIMENT_BY_LINE`) ו-`scripts/publication-check.ts`.
- **מבחן קודם:** כתבתי את `src/__tests__/revenue/publisher-guard.test.ts` לפני המודול; הריצה הראשונה נכשלה כצפוי (המודול
  לא קיים).
- **המשמר:** `src/revenue/publisher-guard.ts`. מצב שמור `{ line, readings, verdict }` ו-`experimentStateOf(line,
  readings)` שבונה אותו (הפסק הוא `evaluateExperiment`). שמונה קודי סירוב, נאספים כולם בסדר קבוע, `code` הוא הראשון:
  `state-unreadable`, `line-mismatch`, `experiment-killed`, `uploads-frozen`, `designation-contradicted`,
  `designation-unread`, `verdict-stale`, `publication-gate-failed`. מעבר מחזיר `{ ok: true, line, videoId, checks }`.
- **הסריקה:** הבדיקה סורקת את `src/`, `scripts/`, `products/` ו-`.github/workflows/` (בלי קבצי בדיקה), ונכשלת על כל קוד
  שיכול להעלות ל-YouTube (קריאת `videos.insert`, נקודת ההעלאה, ספריות הלקוח של Google, Upload-Post לפי host, חבילה או
  לקוח; או שם קובץ עם publish/upload וטקסט עם YouTube) ולא מייבא את המשמר וקורא ל-`assertMayUpload`. לצדה מלאי סגור של
  הקוד שנוגע ב-Google API היום: המשמר ושלושת הקוראים. הפונקציות של הסריקה נבדקות גם על עץ מגירה (מפרסם בלי משמר נתפס,
  מפרסם עם משמר עובר, קובץ בדיקה ו-`node_modules` מדולגים, אזכור בפרוזה לא נספר).
- **`experiments.ts`:** שלוש שורות ההערה על `uploadsFrozen` ("nothing enforces the freeze today") הוחלפו בשלוש שורות
  שמפנות למשמר ולבדיקה. מספר השורות לא השתנה, כך שמצביעים לשורות הקובץ לא זזו.
- **ולידציה:** `scripts/verify.sh`, `frozen-citations.test.ts`, תוכנית מוטציות של 13 (8 לפי קוד ו-5 נוספות), ובדיקה חיה:
  קובץ מפרסם זמני ב-`src/revenue/` הפיל את הסריקה ונמחק.
- commit `ae1232f` (הקוד והבדיקות), ואחריו commit של היומן הזה.

## 3. קבצים/מערכות ששונו

- `src/revenue/publisher-guard.ts` — חדש.
- `src/__tests__/revenue/publisher-guard.test.ts` — חדש (47 בדיקות).
- `src/revenue/experiments.ts` — הערה בלבד, שלוש שורות במקום שלוש; שום שער, מספר או hash לא השתנו.
- `logs/2026-10-04-channel-loop-tick-42-publisher-guard.md` — היומן הזה.
- לא נגעתי ב-`research/`, `products/`, `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`,
  `CLAUDE.md`. אין push, אין רשת.

## 4. החלטות והנחות משמעותיות

- **(ד) המשמר מריץ את שער הפרסום בעצמו.** `experiments.ts` לא שומר מעבר-שער לכל סרטון, רק את הספירה
  `videosPassedGate`. במקום לקבל דגל "עבר" מבחוץ, המשמר מקבל את המניפסט, את מצב הערוץ ואת `exists` ומריץ
  `checkPublication(..., "publish", ...)`. כך אי אפשר להביא מעבר מיום אחר או מערוץ אחר (G6 קצב, G3 דמיון, G8 DMCA נבדקים
  מול הערוץ כפי שהוא עכשיו). לכן החתימה היא `assertMayUpload(state, { manifest, channel, exists })` ולא `{ line, videoId }`
  שהתדריך הציע כדוגמה; הקו והמזהה נלקחים מהמניפסט.
- **(ג) קריאה חסרה עוצרת בשני הקווים, קריאה הפוכה רק בקו הילדים.** התדריך ניסח את (ג) לקו הילדים. §10 כלל 2 עוצר "the
  next upload on that channel" ו-§10 כלל 3 קובע שהוא חל "to T1 and to kids-explainers alike", ו-`experiments.ts` כבר מקפיא
  על קריאה חסרה בשני הקווים; לכן `designation-unread` חל על שניהם. `false` הוא סירוב רק בקו הילדים (K-mfk-designation);
  ב-T1 `false` הוא ההצהרה עצמה, ו-`true` הוא העקיפה של P-2 (הסלמה בראשונה, הריגה בשנייה), שנשפטת בפסק ולא במשמר.
- **המשמר קורא את הקריאה החוזרת בעצמו**, ולא רק דרך הפסק, כדי שהעצירה של §10 לא תישען על `experiments.ts` לבדו (בדיקה:
  פסק שמור "continue" לצד קריאה חסרה עדיין מסורב). הכלל "רשימה ריקה אחרי חלון שנשפט = העלאה לא קרואה" שוכפל מ-
  `experiments.ts` בשורה אחת, בכוונה (אי-תלות).
- **`verdict-stale`:** פסק שמור שהקריאות שלו לא נותנות היום (החלטה, הקפאה או שערים שונים) מסורב בכל כיוון. הקפאה שמורה
  לא מוסרת על ידי המפרסם שמחליט שהסיבה חלפה; היא מוסרת רק בשיפוט מחדש ושמירה.
- **סגירה בכשל:** מצב מ-JSON עם שדה חסר או מטיפוס שגוי (גם בקריאות: `policySignal` חסר היה נקרא כ"אין אות") הוא
  `state-unreadable`. `uploadsFrozen` נבדק כ-`!== false`: רק `false` מפורש מעביר.
- **מלאי הסריקה כולל את `src/revenue/youtube-analytics.ts`**, קורא Analytics (קריאה בלבד) שהתדריך לא מנה; הוא נוגע ב-
  `googleapis` ולכן חייב להופיע במלאי עם סיבה. היקף הסריקה הוא הקוד של המושבה; `.claude/`, `vendor/` ו-`node_modules`
  מחוץ לו.
- **לא נעשה, בכוונה:** (1) הסדר שבין הקווים, §8 כלל 2 (ההעלאה הראשונה של קו הילדים מחכה להעלאה הראשונה של T1 שעברה
  וקראה `false`): דורש את מצב T1 כקלט שני; כתוב בכותרת המודול כפער פתוח. (2) רעננות הקריאה החוזרת (כמה זמן מותר בין
  הקריאה להעלאה): אין לה מספר בפסיקה. (3) המשמר לא מחובר לשום דבר, כי אין מפרסם.

## 5. שגיאות וניסיונות שנכשלו

- העץ נפתח על בסיס ישן (`3edd377`, בלי `01d51d0`): אופס לענף לפי ההוראה.
- הריצה הירוקה הראשונה של הסריקה נכשלה על `scripts/render-watch.mjs`: התבנית `["']upload-post["']` עם `/i` תפסה את
  הפרוזה `"Upload-Post's terms` ברשימת האתרים החסומים. תוקן: שמות חבילות נספרים רק בתוך `from`, `require(` או
  `import(`, ועץ המגירה קיבל את המקרה הזה כבדיקה.
- פקודת Bash מורכבת (heredoc יחד עם `cd` והרצה) ופקודת `sed` עם משתנה נדחו על ידי בדיקת הבידוד של העץ; פוצלו לפקודות
  פשוטות ולכלי Write.
- במבחן הראשון הייתה פונקציית עזר מבלבלת (`asRefusal`) שמיפתה מזהה בדיקה לקוד סירוב; הוסרה לפני הריצה הירוקה.

## 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh` (ברירת מחדל `src/__tests__/revenue`): **exit 0**; typecheck exit 0; 69 קבצים, 2222 עברו, 1 מדולג.
- `npx vitest run src/__tests__/revenue/frozen-citations.test.ts`: **exit 0**, 22 עברו.
- `npx vitest run src/__tests__/revenue/publisher-guard.test.ts`: exit 0, 47 עברו.
- `node scripts/mutate.mjs --plan <plan.json> --test src/__tests__/revenue/publisher-guard.test.ts`: **exit 0**, 13 הוחלו,
  13 נהרגו, 0 שרדו; בסיס לפני ואחרי ירוק.

| מזהה | המוטציה | תוצאה |
|---|---|---|
| M1 | `state-unreadable`: דילוג על בדיקת המצב | נהרגה |
| M2 | `line-mismatch`: דילוג על בדיקת הקו | נהרגה |
| M3 | `experiment-killed`: דילוג על בדיקת ההריגה | נהרגה |
| M4 | `uploads-frozen`: דילוג על בדיקת ההקפאה | נהרגה |
| M5 | `designation-contradicted`: דילוג | נהרגה |
| M6 | `designation-unread`: דילוג | נהרגה |
| M7 | `verdict-stale`: דילוג | נהרגה |
| M8 | `publication-gate-failed`: דילוג | נהרגה |
| X1 | רשימה ריקה אחרי חלון שנשפט נקראת כנקייה | נהרגה |
| X2 | `false` של T1 נקרא כסתירה | נהרגה |
| X3 | בדיקת הפסק המיושן מתעלמת ממזהי השערים | נהרגה |
| X4 | `uploadsFrozen` שאינו בוליאני מתקבל | נהרגה |
| X5 | שדה קריאה חסר מתקבל | נהרגה |

- בדיקה חיה של הסריקה: קובץ זמני `src/revenue/tick42-probe-publisher.ts` עם `videos.insert` הפיל את שתי בדיקות הסריקה
  (exit 1), ונמחק; `git status` נקי אחריו.
- `grep -rli` לשם הבעלים או למזהה אישי על כל קובץ שנגעתי בו: ריק.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- תוכנית המוטציות "מוטציה לכל קוד סיבה" נכתבה ביד; למודול שמחזיק רשימת קודים, אפשר לגזור אותה מהרשימה (כל `refuse("X"`
  יקבל `if (false)`), כפי ש-`mutate.mjs` כבר מקבל תוכנית JSON.
- בדיקת "האם העץ על הבסיס הנכון" ואיפוסו חזרו שוב (כמו בטיק 41); זה כבר כתוב ב-`CLAUDE.md`, אבל סקריפט קטן שמקבל את
  הקומיט הצפוי ומאפס רק כשצריך היה חוסך את הצעד.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `kids-explainers-kills.test.ts` ו-`checkPublication` במלואם: נחוץ לצורת המצב ולמתקנים, אבל חלק גדול לא שימש.
- תיקון ראשון של תבנית Upload-Post וריצה חוזרת: ריצה אחת מיותרת שהייתה נחסכת אילו הורצה התבנית מול העץ לפני הכתיבה.
- שתי פקודות שנדחו על ידי בדיקת הבידוד (heredoc מורכב, `sed` עם משתנה) ונכתבו מחדש.
- ריצת `verify.sh` שנייה אחרי הוספת בדיקה אחת (2222 במקום 2221): נחוצה, כי הראשונה רצה לפני הבדיקה האחרונה.
