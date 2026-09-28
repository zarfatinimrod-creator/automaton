# 28.9.2026 — כלי תיבת הדואר של המותג (צעד 8): שולח, בודק קריאה-בלבד, שורה בדוח

## 1. מה המשתמש ביקש
סוכן Opus בעץ עבודה מבודד קיבל מסקריפט זרימת העבודה `scripts/workflows/brand-mail-tooling.js`: להכין את צעד 8 של
הבעלים (תיבת הדואר של המותג, `research/breadth/BOARD.md` Q2) כך שישתלם כבר בשעה שהוא קיים, בלי לשלוח דבר היום:
(1) מקור יחיד קריא-מכונה לארבע השאלות לפלטפורמות, עם בדיקה שהמסמך וה-JSON מסכימים ושכל גוף מכיל את גילוי
המפעיל האוטומטי ואת חתימת המותג ואין בו שם אישי, טלפון או כתובת; (2) `scripts/brand_mail.py` בספרייה התקנית בלבד,
עם `send` (ריצה יבשה כברירת מחדל) ו-`probe` (IMAP קריאה-בלבד, מספרים בלבד); (3) `.github/workflows/brand-mail.yml`
בהפעלה ידנית בלבד, שליחה אמיתית רק מ-`main`, רשומת שליחה ל-`sent.json`, קריאת הבודק ל-`state/colony/brand-mail.json`
ושורה בדוח המושבה עם חוסם לדואר נגישות שלא נענה 7 ימים; (4) בדיקות unittest עם SMTP/IMAP מזויפים ובדיקות vitest,
ובדיקת מוטציות של השומרים ב-/tmp; (5) סעיף "How it is sent" במסמך.

## 2. הפעולות המרכזיות שביצעתי
- **בסיס:** עץ העבודה התחיל ב-`327111e` (לא צאצא של `4c4d688`, בלי `research/owner-asks`). הרצתי
  `git reset --hard claude/new-session-j071dx` ווידאתי שהבסיס הוא `4c4d688`.
- **מקור יחיד:** `research/owner-asks/questions.json` — לכל אתר `venue`, `name`, `order`, `to`, `route`, `subject`,
  `body`, `preSend`, `heldQuestions`, `followUpAfterDays`. הגופים חולצו מהמסמך בסקריפט עזר זמני (פסקה לשורה, שורת
  החתימה נשמרת). `to` קיים רק ל-CrazyGames ול-Wix; ל-Spreadshirt ול-n8n הוא `null` (אין כתובת בשום לכידה; n8n הוא טופס).
  המסמך קיבל הפניה ל-JSON ונשאר עם הנימוקים והציטוטים.
- **`scripts/brand_mail.py`** (smtplib, imaplib, email בלבד): `send --venue` בונה הודעה (From "Mehudak (מהודק)",
  UTF-8 quoted-printable, Message-ID בדומיין של כתובת המותג), ריצה יבשה מדפיסה את ההודעה המלאה ואת הרשומה.
  `--really-send` שולח ב-SMTP SSL ומוסיף רשומה ל-`sent.json`. שומרים: כתובת שחלקה המקומי מכיל `mehudak` בלבד (ולעולם
  לא מודפסת כתובת שנדחתה); `GITHUB_REF=refs/heads/main`; הודעה אחת לאתר; תזכורת אחת בלבד, אחרי `followUpAfterDays`,
  כשאין קריאת YES/NO רשומה ואין בתיבה תשובה שקריאת NOT ANSWERED לא ספרה (בדיקה חיה, קריאה-בלבד); אתר בלי כתובת נדחה;
  ניתוק באמצע שליחה נרשם `uncertain` וחוסם את האתר. `probe` פותח כל תיבה ב-EXAMINE ומביא רק `BODY.PEEK` של כמה
  כותרות ו-INTERNALDATE, ומחזיר מספרים בלבד. שתי הפקודות מחזירות `{"configured": false}` ויציאה 0 בלי הסודות.
- **זיהוי דואר נגישות (החלטה מתועדת):** כתובת עם תג `+accessibility` או `+a11y` ב-To/Cc/Delivered-To, או נושא עם
  "accessibility", "a11y" או "נגישות". "נענה" = בתיקיית Sent (לפי הדגל `\Sent`) יש הודעה שמפנה ל-Message-ID שלו.
  בלי תיקיית Sent, בלי Message-ID או בלי תאריך, הוא נספר כלא-נענה.
- **חיווט לדוח:** `src/revenue/brand-mail.ts` קורא את הקובץ בכל טיק (כמו קובצי המדידה): חסר = שקט; לא מוגדר =
  שורה; קריאה = שורה תחת "This tick"; דואר נגישות לא-נענה 7+ ימים = חוסם. הגיל מתקדם בזמן שעבר מאז הבדיקה, והספירה
  הופכת ל"at least N" כשייתכן שגדלה. כל ערך שאינו מספר או מזהה אתר שלנו פוסל את הקובץ, ותוכנו לא מודפס.
  `runner.ts`: `TickOptions.brandMailFile`, `TickResult.brandMail`, החוסמים נכנסים ל-`blockers`, השורה נכנסת לדוח.
- **`owner-steps.ts` צעד 8:** המשפט "neither exists yet" הפך לשקרי (הבודק נבנה). שיניתי ל-"neither runs yet" עם
  שם הסקריפט, ה-workflow ו-`questions.json`. הבדיקה עודכנה במכוון עם הערה. `docs/OWNER_STEPS.he.md` לא מזכיר את
  הבודק ולא נגעתי בו.
- **Workflows:** `brand-mail.yml` (הפעלה ידנית בלבד; `command` probe|send, `venue`, `really_send` כבוי כברירת מחדל;
  שומר main; בדיקות Python לפני כל פעולה; סודות וקלטים רק דרך `env`; קומיט של `sent.json` גם אחרי שליחה שנכשלה, כדי
  שרשומת `uncertain` תגיע למאגר; הבודק כותב ומקמט את `state/colony/brand-mail.json` בקבוצת `colony-state`; אין
  schedule, והערה אומרת להוסיף את הבודק ל-`colony.yml` אחרי צעד 8). `scripts-python-ci.yml` — משימה עם מסנן נתיבים
  בדפוס של `products-ci.yml`, שמריצה `python -m unittest`.
- **סעיף "How it is sent"** במסמך: המסלול, ריצה יבשה קודם, שני הסודות, שבעת הכללים כפי שהקוד אוכף אותם, איך רושמים
  תשובה ב-`sent.json`, והבודק.

## 3. קבצים/מערכות ששונו
- חדשים: `research/owner-asks/questions.json`, `research/owner-asks/sent.json`, `scripts/brand_mail.py`,
  `scripts/__init__.py`, `scripts/tests/__init__.py`, `scripts/tests/test_brand_mail.py`, `src/revenue/brand-mail.ts`,
  `src/__tests__/revenue/owner-asks.test.ts`, `src/__tests__/revenue/brand-mail.test.ts`,
  `src/__tests__/revenue/brand-mail-workflow.test.ts`, `.github/workflows/brand-mail.yml`,
  `.github/workflows/scripts-python-ci.yml`, והיומן הזה.
- שונו: `research/owner-asks/brand-mailbox-questions.md` (הפניה ל-JSON + "How it is sent"), `src/revenue/runner.ts`,
  `src/revenue/owner-steps.ts` (משפט אחד בצעד 8), `src/__tests__/revenue/owner-steps.test.ts`.
- לא נגעתי: `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
  `docs/OWNER_STEPS.he.md`. לא נשלח שום דואר ולא דחפתי דבר.

## 4. החלטות והנחות משמעותיות
- **המסמך ממשיך לצטט את ההודעות** (במקום להפסיק לשכפל), ובדיקה משווה פסקה-פסקה אחרי כיווץ רווחים. ההודעות קריאות
  בהקשר, והסחף נתפס בבנייה. גופי ה-JSON הם שורה לפסקה, כדי שהדואר לא יישבר בשורות של 120 תווים.
- **`heldQuestions` כמערך** ולא `heldQuestion`: ל-Spreadshirt יש שתיים, "one at a time".
- **"תשובה רשומה"** מוגדרת ב-`sent.json.repliesRecorded` (`reading`: YES/NO/NOT ANSWERED, `inReplyCount`). אישור
  אוטומטי הוא NOT ANSWERED ולכן מתיר תזכורת. תשובה בתיבה שלא נקראה ונרשמה חוסמת תזכורת.
- **`uncertain`:** ניתוק אחרי תחילת DATA לא מוכיח אי-מסירה, ולכן נרשם וחוסם. סירוב שרת (Recipients/Sender refused,
  DataError) נחשב כ"לא נשלח" ולא נרשם.
- **הסקריפט מוסיף את הרשומה ל-`sent.json` בעצמו**, וגם מדפיס אותה. כך הלוגיקה בקוד שנבדק ולא ב-jq בתוך YAML.
- **ה-JSON של הבודק מכיל גם `measuredAt`, מזהי אתרים משלנו ו-`sentFolderFound`** (לא רק מספרים). זה המינימום כדי
  לדעת את גיל הקריאה. הגיל של הדואר הישן ביותר נשמר כמספר ימים, לא כחותמת זמן של הודעה.
- **CI ל-Python:** `ci.yml` מריץ רק Node, ו-`chart-explainer-ci.yml` מוגבל למוצר שלו. לכן יש workflow חדש בדפוס
  `products-ci.yml`. `scripts/__init__.py` נוסף כדי ש-`python3 -m unittest` מהשורש ימצא את הבדיקות (לפני כן רץ 0).
- **[INFERENCE] לא נבדק כאן:** ש-Google נותנת app password רק עם אימות דו-שלבי; שכתובת plus של Gmail שומרת את התג
  בכותרות; ש-Gmail שומר Message-ID שהלקוח קבע; ש-LIST של Gmail מסמן `\Sent`. כולם מסומנים במסמך, או שהקוד נופל
  לצד הזהיר.
- ה-`preSend` נשאר טקסט שמודפס בריצה היבשה. הקוד לא אוכף אותו, כי הוא דורש קריאה של render.

## 5. שגיאות וניסיונות שנכשלו
- עץ העבודה התחיל על בסיס ישן (`327111e`), כמו שהתדריך הזהיר. אופס ל-`claude/new-session-j071dx`.
- כלי Bash סירב לפקודות מורכבות (heredoc של Python עם `git`, והודעת קומיט עם `{"configured": false}`), כי לא יכול
  היה לוודא שהן נשארות בעץ העבודה. עברתי לקובצי עזר ב-scratchpad, לעריכות דרך Edit ולקומיט עם `-F`.
- בדיקה שלי חיפשה "no Sent folder" באות קטנה, והטקסט מתחיל משפט ("No Sent folder"). תיקנתי את הבדיקה.
- רשימת המילים המותרות לא כללה "It" (תחילת משפט ב-Wix). הוספתי אחרי סקירה.
- `imaplib` מחזיר `[None]` כשאין שורת EXISTS, ו-`int(None)` קרס. נוספה בדיקה אדומה, ואז `ProbeError`: לא-ידוע אינו אפס.
- מוטציה אחת של ה-workflow ("probe writes the report file") לא הוחלה, כי המחרוזת מופיעה פעמיים (הערה + פקודה).
  השורה מקובעת בבדיקה בשוויון מדויק.

## 6. בדיקות ופעולות ולידציה
- `python3 -m unittest` (מהשורש ומ-`scripts/`): 38 בדיקות, OK.
- `pnpm typecheck`: נקי (וידאתי ב-`--listFiles` ש-`brand-mail.ts` ו-`runner.ts` נבדקים).
- `npx vitest run src/__tests__/revenue`, הרצה אחרונה: 38 קבצים, 966 בדיקות, הכל עובר.
- **תיקון (אותו יום, אחרי סקירת הקוד):** הטענה שבשורה הבאה לא עמדה. סקירת הקוד שברה בעותק כמה שומרים שאף בדיקה
  לא תפסה: TLS לא מאומת, EXAMINE/FETCH/SEARCH שעונים NO, הודעה בלי INTERNALDATE, `SMTPDataError`, כותרת `Date`.
  המעבר המתוקן והמלא נמצא ב-`logs/2026-09-28-brand-mail-review-fixes.md` §6.
- **מוטציות Python** (עותק ב-/tmp, 32 מוטציות): 31 נהרגו. השורדת היחידה היא מוטציית ביקורת זהה למקור, שאמורה לשרוד.
  בין השומרים: כתובת מותג, סודות, main בלבד, ריצה יבשה, הודעה אחת, uncertain, YES/NO, תזכורת אחת, 7 ימים, תשובה
  חיה, NOT ANSWERED, אתר בלי כתובת, שרשור, רישום, סוג שגיאה בלבד, TLS, EXAMINE, BODY.PEEK, EXISTS חסר, תג plus,
  מילות נושא, נענה ב-Sent, סף 7, אי-הדהוד כתובת, ספירות. הורץ שוב אחרי החלפת ה-fixtures: 31/31.
- **מוטציות TS** (7): כולן נהרגו (גיל מאז הבדיקה, מזהי אתר, מספרים לא-שליליים, זמן מאז הבדיקה, שקט כשחסר, חוסמים
  לטיק, שורה לדוח).
- **מוטציות workflow** (10 שהוחלו): כולן נהרגו (שומר main, תנאי השומר, `--really-send`, ציטוט venue, קומיט אחרי כישלון,
  `[skip ci]`, קבוצת concurrency, אין schedule, סוד רק ב-env, בדיקות לפני שליחה).
- **קצה-לקצה:** הרצתי את הבודק האמיתי עם IMAP מזויף ל-`--out` (מוגדר ולא-מוגדר), וקראתי את הקבצים ב-
  `readBrandMailProbe` דרך tsx. השורה והחוסם יצאו נכון.
- CLI אמיתי בלי סודות: `probe` ו-`send --venue crazygames` הדפיסו `{"configured": false, ...}` עם יציאה 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **בדיקת מוטציות:** כתבתי שלושה סקריפטים זמניים דומים (Python, TS, workflow). כדאי כלי קטן ב-`scripts/`
  (למשל `mutation-check.py <file> <mutations.json> <test cmd>`) שמשחזר את הקובץ תמיד ומדווח KILLED/SURVIVED.
- **חילוץ הודעות מהמסמך ל-JSON:** נעשה פעם אחת בסקריפט זמני. אם השאלות יתרבו, כדאי לשמור אותו בתור מחולל, או
  לוותר על הציטוט במסמך.
- **הודעות קומיט דרך קובץ:** בגלל סירוב הכלי לפקודות מורכבות, כל קומיט דרש קובץ הודעה נפרד.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- שני ניסיונות Bash שנחסמו (heredoc עם git / הודעת קומיט עם JSON), ואחריהם מעבר לקבצים: בזבוז קטן.
- קריאת `runner.ts` כולו (573 שורות) כדי למצוא את נקודות החיווט. היה אפשר לחפש `blockers.push` ו-`out.push("- `.
- קריאת בדיקת ה-workflow של mcp-il-tools כדי לאמץ את דפוס ה-stubs: שימושי, אבל חלק מהקריאה היה מעבר לנדרש.
- הרצת מוטציות ה-TS וה-workflow (כל מוטציה מפעילה vitest, כ-5-10 שניות): זמן יותר מאסימונים.
