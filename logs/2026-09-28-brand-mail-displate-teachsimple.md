# 28.9.2026 — שתי שאלות חדשות לתיבת הדואר של המותג: Displate ו-Teach Simple

## 1. מה המשתמש ביקש
החוט הראשי העביר לבונה Opus: להוסיף לרשימת השליחה את שתי השאלות שנוסחו בטיק 9, בדיוק כמו חמשת האתרים הקיימים.
Displate (הריגה מוצעת (d): חשבון אמן שמופעל על ידי סוכן AI, העלאה דרך האתר, מול הסעיפים על כלים אוטומטיים
`displate-about-regulations.txt:471`, `:561`) ו-Teach Simple (שירות ההעלאה המתמשך ותשלום לתורם בישראל). בלי `git
stash`/checkout/reset/commit/push, בלי לגעת ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`,
`MISSION.md`, `CLAUDE.md` או `docs/`.

## 2. הפעולות המרכזיות שביצעתי
- אימתתי את שתי הכתובות ב-grep: `artists@displate.com` (`displate-about-regulations.txt:447`, mailto ב-`.html:340`) —
  הכתובת היחידה לאמנים; `support@` ו-`abuse@` של Displate הן לתלונות קונים, ערעורים וזכויות יוצרים.
  `support@teachsimple.com` (`teachsimple-terms-of-service.txt:419-420`, "Questions about the Terms of Service") — הכתובת
  היחידה של Teach Simple בכל לכידה.
- הוספתי ל-`questions.json` את `displate` (order 6) ואת `teachsimple` (order 7) עם כל השדות: `to`, `route` עם file:line,
  `subject`, `body` (שני משפטי הגילוי, "One question, yes or no:", "We are asking for your current rule only...",
  חתימת המותג), `preSend` (רינדור שורה 134 / 135 קודם; אם רינדור עונה, לא שולחים), `heldQuestions` (שתיים לכל אתר),
  `followUpAfterDays` 7.
- הוספתי ל-`brand-mailbox-questions.md` את §6 ו-§7 באותו מבנה של §1-5 (נמען, נושא, גוף מצוטט, למה השאלה הזאת, שינויים
  מהטיוטה, שפה, מה היא מכריעה, שאלות מוחזקות), ועדכנתי את שורת הסדר ואת רשימת המזהים ב-"How it is sent".
- ספירות: `brand_mail.py` שורה 2 ("five" → "seven"), `owner-steps.ts` ("the four are drafted" → "the seven", שהיה כבר
  לא מעודכן), ותיאור הקלט `venue` ב-`brand-mail.yml`.

## 3. קבצים/מערכות ששונו
`research/owner-asks/questions.json`, `research/owner-asks/brand-mailbox-questions.md`,
`src/__tests__/revenue/owner-asks.test.ts`, `scripts/brand_mail.py` (docstring בלבד), `src/revenue/owner-steps.ts`
(מילה אחת), `.github/workflows/brand-mail.yml` (תיאור בלבד), והיומן הזה.

## 4. החלטות והנחות משמעותיות
- **אנגלית בלבד** לשני הגופים והנושאים: שני האתרים כותבים באנגלית, ו-§1-4 כבר אנגלית בלבד; הסכמה והבדיקות מתירות זאת.
- **Displate:** הגוף מפריד בין פתיחת החנות ואימות ה-SMS (הבעלים, פעם אחת) לבין ההפעלה (הסוכן), כמו בטיוטה, כי סעיף
  `:471` תופס חשבון ש"נוצר" בכלים אוטומטיים. הסעיפים מצוטטים במילים ולא במספרים, כי המספור בעמוד לא תואם את ההפניות
  בפרק IV. "AI assistance" הפך ל-"made with AI" (כנות: הסוכן יוצר את היצירה).
- **Teach Simple:** נוסף "not only a one-time upload of an existing catalogue", כדי ש"כן" לא יתפרש כהעברה חד-פעמית.
- **שאלות מוחזקות:** ל-Displate — מה שהטיוטה מחזיקה (PayPal לאמן בישראל, ואז בדיקת נתוני המס; ניסחתי אותה ככן/לא על
  צעד מצלמה, חצי המצלמה של הריגה (c)). ל-Teach Simple הטיוטה לא מחזיקה שאלות מפורשות; לקחתי את שני הנעלמים שהטיוטה
  מונה ושהשאלה לא מכסה: איך צוות ההעלאה מקבל קבצים, וטופס מס (W-8BEN) לפני תשלום. [INFERENCE — לבדיקת הישיבה.]
- הרשימה המאושרת של מילים באות גדולה בבדיקה הורחבה ב-Displate, Teach, Simple, Terms, Use (שמות האתרים ושם המסמך).

## 5. שגיאות וניסיונות שנכשלו
אין. `preSend` של Displate מזכיר את עמוד ההרשמה (צעד 3) רק כדי לומר שהוא לא מעכב שליחה.

## 6. בדיקות ופעולות ולידציה
- `python3 -m unittest` (כמו ב-`scripts-python-ci.yml`): 67 tests OK. `RepositoryFilesTests` בונה את ההודעות של שני
  האתרים החדשים ומריץ עליהן את `check_message_rules`.
- `npx vitest run` על `owner-asks`, `brand-mail`, `brand-mail-workflow`, `owner-steps`: 83 passed.
- מוטציה: שינוי מילה בגוף Teach Simple ב-md בלבד הכשיל את בדיקת ההתאמה; שוחזר ועבר.
- `pnpm typecheck`: נקי.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
הוספת אתר נוגעת בחמישה מקומות (JSON, md, רשימת המזהים ב-md, תיאור ה-workflow, הבדיקה). בדיקה שתשווה את רשימת המזהים
ב-md ובתיאור ה-workflow ל-`questions.json` הייתה חוסכת את החיפוש.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת שני קבצי המדידה במלואם (wall-art-pod.md כולל Zazzle/Society6) — נחוץ חלקית בלבד.
- חיפוש מספור המועמדים (26/28) בשלושה קבצים לפני שנמצא ב-`CHANNEL_LOOP.md:150-152`.
