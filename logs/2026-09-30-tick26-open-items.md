# 30.9.2026 — ארבעת הפריטים הפתוחים מבניות טיק 26 (builder, worktree)

## 1. מה המשתמש ביקש
ארבעה תיקוני תחזוקה שרשומים כפתוחים ב-`logs/CHANNEL_LOOP.md` §9 ("Open from the tick-26 builds"), מהשרשור הראשי
דרך workflow:
1. הפסקה ב-`products/pcn874/README.md:117` מיושנת (המנעול "בלי hash", render-watch "מוריד שוב").
2. `spec-watch.mjs` מאבד את השדה `baseline` בכל כתיבה מחדש של רשומה, ומשאיר `readByAHuman: true` גם כשה-hash השתנה.
3. אם צעד 6 מסומן כבוצע לפני שפרויקט PostHog של המותג קיים, השורה `POSTHOG_READ_KEY` אף פעם לא נשאלת.
4. `docs/OWNER_STEPS.he.pdf` ישן מה-.md: לחדש ולבדוק את הטקסט שלו מול ה-.md.

## 2. הפעולות המרכזיות שביצעתי
- (1) כתבתי מחדש את הפסקה: המנעול זרוע מ-27.9 ב-hash של הלכידות שמהן נגזר `docs/SPEC.md` (BOARD-2 §2.4), ריצה שהורידה
  מסמך אחר הייתה מדפיסה CHANGED ונכשלת, ה-job לא מחזיר hash (`contents: read`); אבל כרגע הוא לא מוריד כלום (שער התנאים),
  והשורות ב-`research/rendered/urls.txt` — gov.il בדימוס (retired), rivhit ו-h-erp מושהות — לפי פסק 30.9 16(d) D2(iv).
- (2) בדיקות קודם (שלוש, עם fetch מוזרק, בלי רשת): unchanged שומר baseline ו-readByAHuman; CHANGED שומר baseline ומסמן
  `readByAHuman: false`; מקור חדש נרשם לא-נקרא ובלי baseline מומצא. אחר כך התיקון ב-`runSpecWatch`.
- (3) רשומה חדשה `doneOn.heldRows` על צעד (חובה, לפי בדיקה, בצעד גמור שיש לו שורה מגודרת), `doneOn` על שורת סוד (נסגרת
  כשהודבקה אחר כך), `followUpSecretRows` / `heldFollowUpSecretRows` ב-`owner-steps.ts`, ו-`doneStepRowsReport` ב-`runner.ts`
  שמודפס פעם אחת בדוח, בלי קשר למצב ההתקנה של הקווים: "## Asked now: one row of a done step" עם השורה לבדה, או
  "Not asked yet: … step 6 itself is done" כל עוד השער סגור. `renderReport` מקבל את ה-site כפרמטר אופציונלי לבדיקות.
  משפט אחד נוסף לשורה בטבלה העברית של צעד 6.
- (4) יצרתי מחדש את ה-PDF ובדקתי את הטקסט שלו מול ה-.md (פירוט בסעיף 6).

## 3. קבצים/מערכות ששונו
- `products/pcn874/README.md` (הפסקה, וספירת הבדיקות 327→337)
- `products/pcn874/scripts/spec-watch.mjs`, `products/pcn874/tests/spec-watch.test.ts`
- `src/revenue/owner-steps.ts`, `src/revenue/runner.ts`
- `src/__tests__/revenue/owner-steps.test.ts`, `src/__tests__/revenue/runner.test.ts`
- `docs/OWNER_STEPS.he.md` (משפט אחד בשורת `POSTHOG_READ_KEY`), `docs/OWNER_STEPS.he.pdf`

## 4. החלטות והנחות משמעותיות
- **רשומה ולא ניחוש:** אי אפשר לדעת בדיעבד אם השורה הודבקה עם הצעד, אז הצעד הגמור אומר אילו שורות מגודרות הוא לא כלל
  (`heldRows`, `[]` כשהכול הודבק). הבדיקה מחייבת את השדה בצעד גמור עם שורה מגודרת, ונכשלת אם שורה ש-`site.json` של היום
  עוד עוצר חסרה ממנו — היא לא יכלה להיות מודבקת עם הצעד. כך מי שמסמן את צעד 6 כבוצע נאלץ להחליט.
- **פעם אחת בדוח, לא לכל קו:** צעד גמור חייב את השורה, לא קו; והקווים יכולים כבר לא להיות ב-`awaiting_setup` כשהפרויקט
  נוצר, ואז הרשימה לכל קו לא מודפסת בכלל. לכן חלק נפרד לפני הרשימות לפי קו.
- לא הוספתי blocker: לפני שעון page-view המפתח לא חוסם כלום; ה-blocker הקיים "not configured while a clock runs" נשאר.
- ב-spec-watch: `readByAHuman` נשמר רק ב-unchanged; new ו-changed תמיד `false`. `baseline` מועתק כמו שהוא — הלכידה שממנה
  נגזר ה-SPEC לא זזה כי המקור זז.

## 5. שגיאות וניסיונות שנכשלו
- כמה פקודות Bash נחסמו על ידי בדיקת הבידוד של ה-worktree (heredoc עם python, `node` בתוך שרשור פקודות): פיצלתי אותן
  לפקודות פשוטות ולכלי Edit/Write.
- בבדיקת הדוח, `POSTHOG_READ_KEY` מופיע גם בשורת "Page views: not configured — POSTHOG_READ_KEY is not set" (ה-tick קורא
  את ה-env); הבדיקה סופרת את השם עם backticks בלבד, כמו שהדוח מציג שורת סוד.
- `pdfjs-dist` לא מותקן בריפו, ו-npm registry אסור לפי התדריך. בתיקיית ה-scratchpad כבר הייתה התקנה של pdfjs-dist 4.10.38
  מסשן קודם; הרצתי עותק של `scripts/pdf-text.mjs` משם, בלי הורדה.

## 6. בדיקות ופעולות ולידציה
- TDD: הבדיקות החדשות נכשלו קודם (spec-watch: 2 מתוך 3; owner-steps/runner: 6), ועברו אחרי התיקון.
- מוטציות: spec-watch — החזרת `readByAHuman` לישן מפילה בדיקה 1, מחיקת שורת ה-baseline מפילה 2; owner-steps —
  `followUpSecretRows` שמחזיר `[]` מפיל 2, הסרת השורה מ-`renderReport` מפילה את בדיקת ה-runner. הקוד שוחזר ונבדק ב-`cmp`.
- `npx vitest run src/__tests__/revenue`: exit 0, 52 קבצים, 1497 עברו, 1 דולגה.
- `pnpm typecheck`: exit 0.
- `cd products/pcn874 && npx vitest run`: exit 0, 8 קבצים, 337 עברו.
- PDF: `node scripts/owner-steps-pdf.mjs` (Chromium 1194) — 16 עמודים, 513,528 בתים; תצוגת ה-PNG של המסך הראשון מימין
  לשמאל. `pdf-text.mjs` חילץ 41,041 תווים; השוואת מולטיסט של מילים מול ה-.md: כל מילה ב-.md נמצאת בטקסט ה-PDF חוץ משבע
  ש-pdfjs מפצל (ליגטורות fi/fl ב-Confirm, Cloudflare, workflow(s); ריצות bidi של 4ב ו-§18ב; הדגש ב-חיוּת). ב-PDF הישן חסרו
  127 מילים שונות מה-.md, ביניהן `POSTHOG_READ_KEY`. המשפט החדש על ההשלמה נמצא בטקסט ה-PDF.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- השוואת ה-PDF מול ה-.md נעשתה בסקריפט Python זמני. בדיקה ב-CI (או ב-`owner-steps-pdf.mjs --check`) שמחלצת טקסט ומשווה
  מולטיסט מילים הייתה תופסת PDF ישן מיד — אבל היא דורשת את `pdfjs-dist` כ-devDependency.
- יצירה מחדש של ה-PDF בכל שינוי ב-.md נשארת ידנית; בדיקה שמשווה hash של ה-.md שה-PDF נוצר ממנו (למשל ב-metadata) הייתה
  מספיקה בלי Chromium ב-CI.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת CHANNEL_LOOP.md §10 המלא (ארוך) כדי למצוא את §9 — חלק גדול לא היה נחוץ.
- שלוש פקודות שנחסמו על ידי בדיקת הבידוד ונשלחו מחדש בפיצול.
- ניתוח עיצוב של (3) (רשומה על הצעד מול רשומה על השורה מול בדיקת env) לפני שנבחר `heldRows` + `doneOn` על השורה.
