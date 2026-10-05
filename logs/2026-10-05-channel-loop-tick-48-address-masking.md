# סבב 48 — render-watch ממסך כתובות דוא"ל לפני commit, ו-xiuwenz2.github.io עובר ל-CONDITIONAL_MET (5.10.2026)

## 1. מה המשתמש ביקש
בניית פריט 1 של "Queued 5.10 (tick 45)" ב-`logs/CHANNEL_LOOP.md` §9, המתוכנן לסבב 48 ב-§10: `scripts/render-watch.mjs` ממסך כל כתובת דוא"ל בגוף טקסטואלי (`isTextLike`) ובטקסט המחולץ לפני שמשהו מגובב, נכתב או נכנס ל-commit, בשני המצבים (plain ו-js, שניהם דרך `storeCapture`), בצורה `[redacted:email]@<domain>` (החלק המקומי נמחק, הדומיין נשאר), בלי לגעת בשמות נכסים כמו `<name>@2x.png`, עם ספירה אחת ב-`redacted` של ה-meta. באותו ענף ה-fold של פסיקה R3: `xiuwenz2.github.io` עובר ל-CONDITIONAL_MET ב-`terms-verdicts.json`, מבחן האות ב-`prize-terms-audit.test.ts` מתהפך, הסעיף "What the reading can render" ושורת הטבלה בהערת הביקורת מתעדכנים, ושני משפטים ב-`research/rendered/README.md`. ובנוסף: dry run על כל הלכידות הקיימות (בלי לכתוב במאגר), לפחות 5 בדיקות מוטציה, והרצת `node scripts/prize-dispatch.mjs`.

## 2. הפעולות המרכזיות שביצעתי
- **הקמה:** בסיס `claude/new-session-j071dx` ב-`2a2d422`; worktree על `build/tick48-address-masking`; `products/`, `src/revenue/`, `research/rendered/` קיימים; `pnpm install --frozen-lockfile` (יציאה 0); בסיס `render-watch.test.ts`: 108/108, יציאה 0.
- **סקר הלכידות (מצרפי בלבד, בלי להדפיס כתובת):** 848 קבצי html/txt ב-`research/rendered/`; ב-293 מהם יש מחרוזת בצורת כתובת, 923 מחרוזות; 64 מהן שמות תמונה (`@2x.png` ווריאנטים עם hash); 50 אחרי `/` (34 Sentry DSN, 14 נתיבי טפסים, 2 נתיבי ארכיון רשימות); 186 אחרי `:` — כולן `mailto:`; 19 אחרי escape של מחרוזת בסקריפט. אף כתובת בצורת character reference (`&#64;`) לא נמצאה היום; 16 לכידות נושאות את הקידוד של Cloudflare; קובץ אחד אינו UTF-8 תקין.
- **בדיקות קודם (TDD):** בלוק חדש ב-`render-watch.test.ts` ליד הבלוק של `redactSecrets`; 9 בדיקות נכשלו ראשונות (8 נכשלו, 1 — "משאיר לבד" — עבר מראש כצפוי); אחר כך נוספו עוד שלוש תוספות (קצוות המשפט, נקודתיים בתוך URL, שם נכס עם כמה תוויות), כל אחת מכוונת למוטציה שלא נהרגה או לכלל שלא היה מכוסה.
- **המימוש:** `ADDRESS_PATTERN` (ביטוי רגולרי אחד, עם lookbehind לגבול תחילת החלק המקומי ו-lookbehind לסיומות קבצים), `maskAddresses(text)` (חיפוש על "תצוגה" מפוענחת של ה-character references כמו ש-`decodeEntities` מפענח, והחלפה בטקסט המקורי עם מיפוי היסטים), ו-`redactSecrets` קורא לה אחרי `SECRET_PATTERNS`; השם והחתימה של `redactSecrets` נשמרו; הגוף נקרא כ-latin1 (בית אחד לתו) ולא כ-UTF-8. שתי נקודות הקריאה ב-`storeCapture` (הגוף, והטקסט המחולץ של PDF) לא שונו: שתיהן עוברות דרך `redactSecrets`; הטקסט של HTML נגזר מהגוף הממוסך.
- **הערות הקוד:** הכותרת מעל `SECRET_PATTERNS` מתארת עכשיו גם סודות וגם כתובות (ולמה: R3, ריפו ציבורי), והשורה המקבילה בכותרת הקובץ.
- **README:** משפט על `redacted` בסעיף 2 של "how to read a capture" (סודות וכתובות, הדומיין נשמר, למה), ו-"secret and address masking" בתיאור מצב ה-js.
- **ה-fold:** `terms-verdicts.json` — רק הערך של `xiuwenz2.github.io` (`verdict` והערה; `source` ו-`checked` לא שונו; פורמט `serializeVerdicts`, רווח אחד, בלי שורה חדשה בסוף; diff של שתי שורות). `prize-terms-audit.test.ts` — האות התהפך, `REVIEW_FIVE` חדש, `AUDITED` ו-PAGES מעודכנים, `RULINGS_SECTION` לא נגע. הערת הביקורת — "Now" 13 URLs על 12 אתרים עם השורה של xiuwenz2 (שורה 94 בפיקסצ'ר), הקבוצה של כתובות אישיות 0 URLs עם משפט מתוארך, שורת הסיכום 13 + 40 + 29 + 19 + 0 = 101 על 12 + 9 + 21 + 3 + 0 = 45, ותא הפסיקה בטבלה `CONDITIONAL_MET (tick 48 fold)`; R1-R4 ו-"Review corrections" לא נגעו.
- **dry run, מוטציות, prize-dispatch** — בסעיף 6.

## 3. קבצים/מערכות ששונו
- שונה: `scripts/render-watch.mjs` (`ADDRESS_PATTERN`, `CHARACTER_REFERENCE`, `maskAddresses`, `redactSecrets`, שתי הערות), `src/__tests__/revenue/render-watch.test.ts` (בלוק חדש, 10 בדיקות), `src/__tests__/revenue/prize-terms-audit.test.ts`, `research/channel-loop/terms-verdicts.json` (ערך אחד), `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` (הסעיף "What the reading can render" ותא אחד בטבלה), `research/rendered/README.md`.
- חדש: היומן הזה.
- לא שונה (במכוון): `.github/workflows/render-watch.yml`, `termsGate` ו-`PATH_LIMITS`, `scripts/capture-check.mjs`, ה-intake, הלכידות ב-`research/rendered/` (ה-dry run לא כתב דבר), קבצי הלולאה ו-`logs/CHECKPOINT.md`.
- קומיטים ב-worktree: `4ea819d` (המיסוך וה-fold יחד), ויומן זה בקומיט שני.

## 4. החלטות והנחות משמעותיות
- **קומיט אחד לקוד ול-fold:** מבחן האות של R3 נכתב כדי להיכשל ביום ש-`redactSecrets` מתחיל למסך כתובת; קומיט של המיסוך לבדו היה אדום. לכן הם יחד.
- **תצוגה מפוענחת של character references:** `extractText` מפענח `&#NNN;` לתוך ה-.txt, כך שכתובת שנכתבה כולה ב-references הייתה מגיעה ל-.txt גלויה, וגם הגוף היה נושא אותה מקודדת. החיפוש רץ על הטקסט כפי ש-`decodeEntities` מפענח אותו, וההחלפה נעשית במקור, כך שהבתים משתנים רק במקום הכתובת. ההנחה שממירי Markdown (כמו זה של Jekyll) כותבים קישור mailto כ-references היא מהזיכרון ולא אומתה כאן (אין רשת); בלכידות של היום יש 0 כאלה, והבדיקה מכסה את זה.
- **latin1 ולא UTF-8:** כל הדפוסים ASCII; קריאה כ-UTF-8 וכתיבה חזרה הייתה מחליפה כל בית לא תקין ב-U+FFFD בעמוד שאינו UTF-8 ברגע שיש בו כתובת (קובץ אחד כזה בלכידות היום). לעמוד UTF-8 התוצאה זהה בית-בבית.
- **כלל הנקודתיים צומצם ל"בתוך נתיב":** הנוסח במשימה הוא "a local part preceded by `/` or `:` in a path". בגרסה הראשונה כל `:` חסם, ואז `Email:<כתובת>` או `sip:` לא היו ממוסכים; מוטציה M9 שרדה והראתה שאין לזה בדיקה. עכשיו `/` חוסם תמיד, ו-`:` חוסם רק כשלפניו, באותה מילה ועד 256 תווים, יש `/` (סיסמה ב-URL, `/wiki/User:Name@host`); `mailto:` הוא גבול רגיל ולכן אין צורך בחריג נפרד. בלכידות של היום ההבדל 0 (כל 186 המקרים היו mailto).
- **escape בסקריפט הוא גבול:** escape בצורת u00XX, ו-`\n`/`\r`/`\t`, מסיימים מילה כמו רווח, חוץ מ-escape של לוכסן (u002F), שנחשב לוכסן — כך handle אחרי לוכסן מקודד נשאר. בלי זה 9 כתובות אמיתיות אחרי escape היו ממוסכות יחד עם קוד ה-escape (משחית אותו), ו-10 handles/DSNs היו ממוסכים בטעות.
- **מקף אחרי הדומיין לא עוצר את ההתאמה** (`<כתובת>-` ממוסכת); השפעה על הלכידות: 0.
- **prize-dispatch:** על הקובץ החי יוצאות 9 שורות ולא 13: ה-intake השבועי כתב אותו מחדש ב-`89bfdf9` (97 שורות; לפני ה-fold עברו 8). 13 השורות (12 + xiuwenz2) הן על הפיקסצ'ר `548be52` (`--urls src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt`), שעליו הביקורת נכתבה.
- **מחוץ להיקף — נמצא ונשאר לחוט הראשי:**
  - (א) **הלכידות שכבר במאגר:** 278 קבצים (html 193, txt 75, json 10) נושאים היום 914 כתובות. רק 31 מהם (22 slugs, 131 כתובות) על שורות פעילות ב-`urls.txt` וימוסכו בריצה השבועית (6.10 05:23); 247 קבצים (189 slugs, 783 כתובות) על שורות מושהות, חסומות או שהוסרו, או לכידות של שיגור (כמו לכידות אירועי הפרסים), שלא ייאספו שוב — המיסוך לא יגיע אליהן לעולם. ההיסטוריה של git שומרת את כל הבתים הקודמים. מיסוך חד-פעמי של הלכידות השמורות (כולל `sha256` ו-`byteLength` במטא) או שכתוב היסטוריה — החלטה של החוט הראשי.
  - (ב) הקידוד של Cloudflare (`data-cfemail`, `/cdn-cgi/l/email-protection#…`) הוא XOR הפיך של הכתובת; 16 לכידות נושאות אותו, והוא לא ממוסך. גם לא: `%40` ב-URL, escape של `@` במחרוזת JSON, כתובת שמורכבת ב-JavaScript או מפוצלת בתגיות.
  - (ג) שורה 11 בהערת הביקורת ("Actions taken") מונה CONDITIONAL_MET 9 ו-CONDITIONAL_UNMET 3 "after the main-thread rulings" — נכון היסטורית, ואחרי ה-fold זה 10 ו-2; לא נגעתי (המשימה מגבילה את העריכה לסעיף "What the reading can render" ולשורת הטבלה). באותו אופן: התא האחרון בשורת הטבלה של xiuwenz2 עדיין מסביר את ה-UNMET, והבולט של "After Tuesday's robots probes" אומר שעמוד של mozilladatacollective עם כתובת אישית "is not captured until render-watch masks addresses before commit" — התנאי מתקיים עכשיו.
  - (ד) שורת `js` ל-`build-arena.github.io/ConstructionChallenge/` (§9 tick-47 item 3) אפשרית עכשיו; לא נוספה.
  - (ה) capture-check והקורא צריכים לבדוק את הלכידה הממוסכת הראשונה (כך בהערה של xiuwenz2 וב-§10).
  - (ו) 22 ה-slugs הפעילים ישתנו פעם אחת ב-6.10 בגלל המיסוך; המיסוך לא משנה מספרי שורות ב-.txt (ההחלפה בתוך שורה), אבל שורה מצוטטת שנושאת כתובת תיקרא אחרת.

## 5. שגיאות וניסיונות שנכשלו
- **סקר ריבועי:** הסקר הראשון רץ עם ביטוי בלי lookbehind בתחילת החלק המקומי, ונתקע מעל 120 שניות על גושי base64 ארוכים; נעצר, ונכתב מחדש עם lookbehind (4 שניות). אותו לקח נכנס לביטוי של הקוד: התאמה מתחילה רק בתחילת ריצה של תווי החלק המקומי, ולכן ליניארית (5 MB של `a` ב-72ms).
- **`\u003e` בהערה הפך ל-`>`:** טקסט עם backslash-u שהעברתי דרך heredoc פוענח בדרך; נראה ב-diff ותוקן דרך `String.fromCharCode(92)`.
- **M9 שרדה בריצת המוטציות הראשונה** (16/17): הוצאת `:` ממחלקת התווים החוסמים לא נתפסה; זה חשף שהכלל רחב מדי (ראו 4). בריצה השנייה: 17/17.
- **אי-התאמה ברישיות** בבדיקה ("the masking fold" מול "The masking fold") — תוקן בבדיקה.
- **בדיקת שם נכס עם `https://`** בדקה בטעות את כלל ה-`/` ולא את כלל הסיומת; הוסר הקידומת.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue/render-watch.test.ts` — לפני: 108/108 (יציאה 0); הבדיקות החדשות לפני המימוש: 8 נכשלו (יציאה 1); אחרי: 118/118 (יציאה 0).
- `npx vitest run src/__tests__/revenue/prize-terms-audit.test.ts` — אחרי היפוך האות ולפני הנתונים: 2 נכשלו (יציאה 1); אחרי `terms-verdicts.json`: 2 נכשלו (הספירות של קבוצות הרינדור, יציאה 1); אחרי הערת הביקורת: 15/15 (יציאה 0).
- `VERIFY_OUT=<scratch> scripts/verify.sh src/__tests__/revenue/render-watch.test.ts src/__tests__/revenue/render-watch-js.test.ts src/__tests__/revenue/render-watch-terms-barred.test.ts src/__tests__/revenue/render-watch-robots.test.ts src/__tests__/revenue/prize-terms-audit.test.ts src/__tests__/revenue/prize-dispatch.test.ts src/__tests__/revenue/queue-zero-test.test.ts src/__tests__/revenue/capture-check.test.ts src/__tests__/revenue/freeze-capture.test.ts src/__tests__/revenue/terms-saved-copies.test.ts` על הקומיט הסופי: typecheck יציאה 0, vitest יציאה 0, 10 קבצים, 537/537; `verify exit=0`.
- **מוטציות** (`node scripts/mutate.mjs --plan <scratch>/plan.json`, על `scripts/render-watch.mjs`, מול `render-watch.test.ts`; M1 גם מול `prize-terms-audit.test.ts`; שתי ריצות בסיס ירוקות לפני ואחרי): יציאה 0, 17 הוחלו, 17 נהרגו:
  - M1 קריאת `maskAddresses` הוחלפה ב-`{ text, count: 0 }` (בלי דפוס כתובת) — נהרגה
  - M2 `[redacted:email]@${m[1]}` ← `[redacted:email]` (בלי דומיין) — נהרגה
  - M3 הוסר ה-lookbehind של סיומות הקבצים — נהרגה
  - M4 נקודת הקריאה השנייה (הטקסט המחולץ של PDF) בלי `redactSecrets` — נהרגה
  - M5 הוסר `count += addresses.count` — נהרגה
  - M6 הוסר `count += 1` ב-`maskAddresses` — נהרגה
  - M7 `:` הוחזר למחלקה החוסמת (`mailto:`/`Email:` לא ממוסכים) — נהרגה
  - M8 `/` הוצא מהמחלקה החוסמת — נהרגה
  - M9 הוסר כלל הנקודתיים בתוך URL — נהרגה (בריצה הראשונה, בגרסה הקודמת של הכלל, שרדה)
  - M10 המחלקה החוסמת צומצמה ל-`/` ו-backslash (התחלה באמצע מילה) — נהרגה
  - M11 הוסר גבול ה-escape בסקריפט — נהרגה
  - M12 הוסר החריג של לוכסן מקודד — נהרגה
  - M13 בלי פענוח character references — נהרגה
  - M14 ההיסטים לא ממופים חזרה — נהרגה
  - M15 קריאת הגוף כ-UTF-8 — נהרגה
  - M16 מקף אחרי הדומיין עוצר — נהרגה
  - M17 הדומיין יכול להיעצר לפני `.label` נוסף — נהרגה
- **dry run** (סקריפט בתיקיית ה-scratch, קורא את `research/rendered/` דרך `redactSecrets` של ה-worktree, לא כותב דבר; `git status` נקי לפני ואחרי): html — 193 מתוך 413 קבצים היו משתנים, 630 כתובות; txt — 75 מתוך 435, 169 כתובות; סה"כ html+txt: 268 קבצים, 799 כתובות; ובנוסף json — 10 מתוך 48 גופים, 115 כתובות (278 קבצים, 914 כתובות בסך הכול). לפי סוג דומיין, במצטבר: דומיין של ארגון או חברה 698, ספק דואר חינמי 156, מציין מקום (example וכדומה) 51, ממשלתי 9. שמות נכסים: 64 לפני ו-64 אחרי, **0 מחרוזות `@2x` שהשתנו**. מה שנשאר בצורת כתובת אחרי המיסוך: 64 שמות נכסים, 50 אחרי `/`, 10 handles או DSNs אחרי escape.
- **`node scripts/prize-dispatch.mjs`** (הקבצים האמיתיים, ב-worktree): יציאה 0, 9 שורות; שורת ה-stderr הראשונה: `prize-dispatch: read 97 line(s) of research/measurements/ai-allowed-events.urls.txt: 9 pass the terms gate (7 site(s)), 88 fail` (לפני ה-fold: 8 עוברות, 6 אתרים). עם `--urls src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt`: יציאה 0, 13 שורות; `prize-dispatch: read 101 line(s) of src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt: 13 pass the terms gate (12 site(s)), 88 fail`.
- **זמן ריצה במקרי קצה:** 5 MB בלי `@` — 72ms; 800 אלף references — פחות משנייה; `a:` חוזר 2.5 מיליון פעמים — 50ms.
- **ניקיון:** בכל הקבצים ששונו, grep לשני חצאי שם המשתמש של בעל המאגר — 0; grep לכתובת (`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`) — 0 (כל הכתובות בבדיקות נבנות מחלקים בזמן ריצה, כולל שמות הנכסים וה-DSN).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- עריכות "עוגן שמופיע פעם אחת בדיוק" בקבצים שאינם קבצי לולאה (ערך JSON, הערת ביקורת, קובץ בדיקה) נכתבו שלוש פעמים כסקריפטים חד-פעמיים; `scripts/loop-edit.mjs` מוגבל ל-`logs/` ול-`research/channel-loop/*.md`. כלי כללי (או הרחבה) לעריכה מעוגנת של קבצים אחרים, ול-`terms-verdicts.json` בפורמט `serializeVerdicts`, היה חוסך את זה.
- תוכנית מוטציות שנגזרת מהטקסט של הקובץ עצמו (כדי לא להקליד מחדש ביטויים עם backslash) — אפשר להוסיף ל-`mutate.mjs` דרך לציין find לפי שורה או לפי טווח.
- ספירת כתובות מצרפית על `research/rendered/` (לפי קובץ ולפי סוג דומיין, בלי להדפיס כתובת) מתאימה ל-`capture-check` כאפשרות, לבדיקת הלכידה הממוסכת הראשונה.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- הסקר הריבועי הראשון: המתנה של שתי דקות ועצירה.
- הדפסת חמש ההערות המלאות של אתרי Pages מ-`terms-verdicts.json` (כ-6,000 תווים כל אחת) כדי לנסח את ההערה החדשה; מספיק היה להדפיס את המשפט הפותח ואת פסקת ה-'Non-personal'.
- ריצת מוטציות שנייה אחרי M9, ושלושה amend לקומיט.
- תזכורות חוזרות של רשימת המשימות בהקשר.
