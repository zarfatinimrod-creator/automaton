# טיק 49 — הסקריפט למיסוך-מחדש החד-פעמי של הלכידות (`scripts/remask-captures.mjs`)

לוג הבונה (builder) של טיק 49, ב-worktree `build/tick49-remask-captures`. הסוקר והמתקן מוסיפים סעיף משלהם בסוף.

## 1. מה המשתמש ביקש

הפריט הראשון ב-`logs/CHANNEL_LOOP.md` §9, "Queued 5.10 (tick 48)", שתוכנן לטיק 49 ב-§10: סקריפט חד-פעמי שממסך
במקום את כתובות הדואר שבלכידות שנשמרו ב-`research/rendered/` לפני המיזוג 12143ca (מאז render-watch ממסך כתובת לפני
שהוא כותב לכידה; לכידה ישנה שלא נלכדה מחדש שומרת את הכתובות שלה, והמאגר ציבורי). הדרישות: `--dry-run` שלא כותב
כלום ומדפיס לכל לכידה מה ישתנה, סיכום לפי סוג דומיין (לעולם לא כתובת), ורשימת שורות מצוטטות שישתנו; `--apply --date`
שכותב את הבתים הממוסכים דרך קובץ זמני ו-rename, משכתב במטא רק את `sha256`, `byteLength`, `redacted` ומוסיף
`remasked: { on, addresses, fold: "12143ca" }`, ומשכתב ב-`FROZEN.sha256` רק את השורות של הקבצים הקפואים שהשתנו;
אידמפוטנטי; מסרב (exit 1, בלי לכתוב) מחוץ למאגר git, כשמטא מצביע על קובץ שאינו קיים, וכשיש שינויים לא-מחויבים
בלכידות שייגעו בהן. בדיקות vitest על תיקיית fixtures זמנית (כתובות מורכבות מחלקים בזמן ריצה), בדיקת dry-run אחת על
`research/rendered` האמיתי, `scripts/verify.sh` על חמשת קובצי הבדיקה, לפחות שש בדיקות מוטציה, שני משפטים
ב-`research/rendered/README.md`, ו-dry-run אמיתי בלי כתיבה. **לא** להריץ `--apply` על הלכידות האמיתיות: את זה
עושה ה-main thread אחרי המיזוג.

## 2. הפעולות המרכזיות שביצעתי

- הקמה: ענף הבסיס של ה-main thread ב-8b92943; worktree ב-`scratchpad/tick49/wt`, תיקיית הגירוד
  `scratchpad/tick49/builder`; `pnpm install --frozen-lockfile` (exit 0); בדיקת בסיס
  `npx vitest run src/__tests__/revenue/freeze-capture.test.ts` — exit 0, 38 בדיקות עברו.
- קריאה: `redactSecrets`, `maskAddresses`, `buildMeta` ו-`storeCapture` ב-`scripts/render-watch.mjs` (איך מטא נכתב:
  JSON בהזחה של שני רווחים ושורה חדשה בסוף; `redacted` אחרי `truncated`), והכותרת והייצואים של
  `scripts/freeze-capture.mjs` (`decisionFiles`, `scanCitations`, `scanOptions`, `knownSlugs`, `activeSlugs`,
  `readManifest`, `MANIFEST`, `CAPTURE_EXTS`, `isDay`, `isSlug` — כולם כבר מיוצאים, לא היה צורך לשנות את הקובץ).
- גישוש על 551 קובצי המטא האמיתיים (בזיכרון, בלי לכתוב): 8 צורות מפתחות; 4 מטא של AMO שבהם `sha256` ו-`byteLength`
  אינם של הגוף השמור (הם "of the original body", לפני רדקציה ידנית), `redacted` הוא משפט ולא מספר, ואין שורה חדשה
  בסוף; 3 מטא שבהם `bodyPath` ו-`textPath` הם אותו קובץ; אף מטא לא מצביע על קובץ חסר; כל שאר המטא נכתבים בדיוק כמו
  ש-render-watch כותב.
- כתבתי את `src/__tests__/revenue/remask-captures.test.ts` ואת `scripts/remask-captures.mjs`, את שני המשפטים
  ב-README, והרצתי `verify.sh`, 20 מוטציות, dry-run אמיתי, וסימולציה של ה-`--apply` האמיתי על עותק בתיקיית הגירוד
  (`git archive HEAD` + `git init` + קישור ל-`node_modules`), כדי לדעת מראש אילו בדיקות יישברו אחרי ההרצה האמיתית.
- ארבעה commits ב-worktree: ff49456, abaef19, d4d619f, c0a8e10 (ועוד אחד ללוג הזה).

## 3. קבצים/מערכות ששונו

- `scripts/remask-captures.mjs` — חדש. stdlib ו-`render-watch.mjs`/`freeze-capture.mjs` בלבד.
- `src/__tests__/revenue/remask-captures.test.ts` — חדש, 12 בדיקות.
- `research/rendered/README.md` — בפסקת המיסוך: הפסוקית "a capture stored before 5.10.2026 and not fetched since keeps
  its addresses" הוחלפה במשפט על המיסוך-מחדש של 5.10.2026 (מטא, `remasked`, `FROZEN.sha256`, ההיסטוריה ב-git שומרת את
  הבתים הקודמים); בסעיף העותקים הקפואים נוסף משפט על החריגה מ"byte for byte".
- `logs/2026-10-05-channel-loop-tick-49-remask-captures.md` — הלוג הזה.
- לא שונו: `scripts/render-watch.mjs`, `scripts/freeze-capture.mjs`, קובץ ה-workflow, ואף לכידה. `research/rendered`
  נקי ב-`git status` לפני ה-dry-run האמיתי ואחריו (0 שורות).

## 4. החלטות והנחות משמעותיות

**בתוך הסקופ:**
- **`sha256`/`byteLength` מתעדכנים רק כשהם היו של הגוף השמור** (`meta.sha256 === sha256(stored body)`). זה משאיר את
  4 מטא ה-AMO כפי שהם (המטא שלהם אומר במפורש שה-hash הוא של הגוף המקורי); ה-`redacted` שלהם, משפט, נשאר; נוסף
  `remasked`; השורה החדשה בסוף נשמרת כפי שהייתה (כלומר אין). בכל שאר המטא — כפי שהבריף דורש.
- **מיקום המפתחות:** `redacted` במקום ש-`buildMeta` שם אותו (אחרי `truncated`, או במקומו אם כבר קיים) ו-`remasked`
  מיד אחריו; שאר המפתחות בסדרם, ו-`frozen` נשאר אחרון. מטא שאינו נכתב בדיוק כמו ש-render-watch כותב — סירוב.
- קובץ ש-`bodyPath` ו-`textPath` מצביעים עליו ממוסך פעם אחת, כגוף (אחרת הספירה מוכפלת).
- **סוגי הדומיין** הם היוריסטיקה על שמות (placeholder, government, free-mail, mailing-list, ואחרת "organisation or
  university"); הסוג האחרון הוא ברירת המחדל ולכן כולל גם דומיין פרטי של אדם ומזהי תוספים של AMO.
- הדפסה לכל לכידה רק ללכידות שישתנו, ושורת "unchanged: N captures" לשאר.
- הסירוב לשינויים לא-מחויבים חל רק ב-`--apply`, על **כל** קובצי הלכידות שייגעו בהן (גם PDF שלידו רק ה-.txt
  משתנה) ועל `FROZEN.sha256` כשהוא משוכתב. נוספו שני סירובים שלא נדרשו במפורש: מיסוך שמזיז שורה (סוד רב-שורתי,
  `private-key`) ושורת `FROZEN.sha256` שכבר לא תואמת את הבתים שעל הדיסק.
- רשימת השורות המצוטטות סורקת את כל הציטוטים בשורה בקבצים נושאי-ההחלטה (לא רק של לכידות פעילות, כי כל הציטוטים
  בשורה כבר מצביעים על עותקים קפואים או על שורות מושהות), בכל סיומת (גם `.html`, `.json`, `.bin`, ו-`.meta.json`,
  שבו שורות זזות כי נוספים מפתחות); ציטוט בלי סיומת נבדק מול `.txt` ו-`.html`, כמו ב-`frozen-citations.test.ts`.
- `main` ו-`planRemask` מקבלים את המְמַסֵּך (ברירת מחדל `redactSecrets`) כדי שבדיקה תוכל להעמיד ממסך פגום ולהוכיח
  שספירת "asset names masked" אמיתית (בלי זה המוטציה M20 שרדה).

**מחוץ לסקופ — נרשם ולא תוקן:**
- **אחרי ה-`--apply` האמיתי ייכשלו 2 בדיקות revenue** (נמדד בסימולציה; שאר 71 קובצי הבדיקה עברו):
  `frozen-citations.test.ts` › "polar-rail.md names copies whose metas say what its source lines say (fetchedAt,
  sha256, byteLength)" — שלושת העותקים הקפואים `polar-supported-countries-2026-09-28`, `polar-acceptable-use-2026-09-28`
  ו-`polar-fees-2026-09-28` משתנים, ו-`research/measurements/polar-rail.md` מצטט את תחילית ה-sha256 שלהם; ו-
  `narration-licence-gate.test.ts` › "is byte for byte the capture commit f9a41c6 stored" — ה-`.html` של
  `kokoro-82m-model-card-2026-09-29` משתנה וה-sha256 שלו נעוץ בבדיקה. ה-main thread צריך להחליט באותו commit של
  ה-apply: לעדכן את הנעיצות (ואת תחיליות ה-hash ב-`polar-rail.md`), או להחריג את הלכידות האלה.
- **49 שורות מצוטטות ב-105 ציטוטים ישתנו** (לא "מעטות או אפס"); 15 מהן ב-5 קבצים של 4 עותקים קפואים
  (`displate-about-regulations-2026-09-28` ‏.txt ו-.html, `displate-com-about-privacy-2026-09-28.html`,
  `displate-about-privacy-chunk-2026-09-28.txt`, `sweep2-google-vrp-faq-2026-09-22.html`), והשאר בלכידות של שורות
  מושהות. חלק מהשורות הן HTML מכווץ, שבו שורה אחת היא עמוד שלם: הציטוט נספר גם כשהוא על חלק אחר של השורה. הרשימה
  המלאה למטה (§6).
- המְמַסֵּך של render-watch ממסך גם מזהי תוספים של AMO בצורת `<name>@<host>`; לכן 4 לכידות ה-AMO משתנות.
- אחרי המיסוך-מחדש ה-grep הרחב של הבעלים עדיין מוצא 60 מחרוזות בצורת כתובת ב-29 קובצי `.html` — הסוגים שהממסך משאיר
  בכוונה (חלק מקומי אחרי `/`, סיסמה ב-URL וכו'); זה בנוסף לפריט 2 של §9 (tick 48), `@` מקודד.
- המספרים בבריף (212 ‏.html, 75 ‏.txt, 10 ‏.json, 111 עותקים קפואים) באו מה-grep הרחב; מה שהממסך ממסך בפועל:
  192 ‏.html, 72 ‏.txt, 10 ‏.json, 1 ‏.bin; 31 לכידות קפואות (42 קבצים).
- המשפטים ב-README מתארים את המיסוך-מחדש של 5.10.2026 כעובדה; אם ה-`--apply` לא ירוץ ב-5.10, צריך לתקן את התאריך.
- `src/__tests__/revenue/freeze-capture.test.ts` (קיים) כותב כתובת מילולית בהגדרת git של ה-fixture; ה-grep של הבעלים
  מוצא אותה. לא נגעתי.

## 5. שגיאות וניסיונות שנכשלו

- עריכת ה-README הראשונה (Python עם assert) נכשלה: הפסקה מוזחת בשלושה רווחים (פריט רשימה "2."), לא בשניים. תוקן.
- המוטציה M20 ("asset names never counted") שרדה בסבב השני: `redactSecrets` אף פעם לא ממסך שם נכס, אז הבדיקה
  "asset names masked: 0" לא הוכיחה דבר. תוקן בהזרקת ממסך פגום בבדיקה; בסבב השלישי 20/20 נהרגו.
- סדר ה-TDD לא היה נקי: קובץ הבדיקה נכתב לפני הסקריפט, אבל הורץ לראשונה רק אחריו (ועבר מיד). המוטציות הן מה
  שהוכיח את הבדיקות.

## 6. בדיקות ופעולות ולידציה

- בסיס: `npx vitest run src/__tests__/revenue/freeze-capture.test.ts` — exit 0 (38 עברו).
- `scripts/verify.sh src/__tests__/revenue/remask-captures.test.ts src/__tests__/revenue/render-watch.test.ts
  src/__tests__/revenue/freeze-capture.test.ts src/__tests__/revenue/frozen-citations.test.ts
  src/__tests__/revenue/capture-check.test.ts` — exit 0 (typecheck exit 0; tests exit 0; 5 קבצים, 320 בדיקות).
- `node scripts/mutate.mjs --plan <plan.json> --test src/__tests__/revenue/remask-captures.test.ts` — exit 0,
  20 הוחלו, 20 נהרגו: M1 skip the text file; M2 skip frozen copies; M3 do not rewrite sha256; M4 do not rewrite
  FROZEN.sha256; M5 drop idempotence (re-stamp a re-masked meta); M6 write when dirty; M7 mask a binary body as text;
  M8 do not rewrite byteLength; M9 rewrite sha256 where it was not the stored body's; M10 redacted not grown from its
  previous count; M11 no refusal when a mask moves a line; M12 no refusal on a stale FROZEN.sha256 line; M13 cited range
  open at its end; M14 no refusal for a missing body or text; M15 no refusal outside git; M16 --apply without --date;
  M17 remasked at the end of the meta; M18 final newline always written; M19 dirty check only on written files;
  M20 asset names never counted (בסבב השני שרדה, ראו §5).
- dry-run אמיתי: `node scripts/remask-captures.mjs --dry-run` — exit 3; `git status --short research/rendered | wc -l`
  = 0 לפני ו-0 אחרי. סיכום: 551 לכידות; 209 ישתנו, 342 לא; 275 קבצים (192 ‏.html, 72 ‏.txt, 10 ‏.json, 1 ‏.bin);
  924 כתובות; לפי סוג: free-mail provider 157, organisation or university 661, mailing-list host 19, government 8,
  placeholder 79; עותקים קפואים: 31 לכידות (42 קבצים; 73 שורות ב-`FROZEN.sha256` כולל המטא); asset names masked: 0;
  cited lines that would change: 49 (105 citations).
- סימולציה (עותק בתיקיית הגירוד, לא המאגר): `--apply --date 2026-10-05` — exit 0, 485 קבצים שונו (275 + 209 מטא +
  `FROZEN.sha256`); `--apply` שני — exit 0, אפס שינויים; `--dry-run` אחריו — exit 0;
  `node scripts/freeze-capture.mjs --cited` — exit 0; `npx vitest run src/__tests__/revenue` — exit 1: 2 נכשלו, 2392
  עברו, 1 דולגה (ראו §4).
- ה-grep (case-insensitive) לשם הבעלים על הקבצים שהשתנו — 0; ה-grep של הבעלים לכתובת על הקבצים שהשתנו — 0.

השורות המצוטטות שישתנו (קובץ:שורה ← הקובץ המצטט:שורה; בלי טקסט):

```
research/rendered/terms-wix.html:842 → cited by research/channel-loop/RULING-2026-09-30-video.md:122
research/rendered/terms-wix.html:842 → cited by research/channel-loop/SITTING-2026-09-30-BRIEF.md:79
research/rendered/facer-templates-js.bin:1 → cited by research/channel-loop/TERMS-AUDIT-2026-09-29.md:15
research/rendered/facer-templates-js.bin:1 → cited by research/channel-loop/TERMS-AUDIT-2026-09-29.md:16
research/rendered/sweep2-google-vrp-faq-2026-09-22.html:137 → cited by research/channel-loop/TERMS-AUDIT-2026-09-29.md:26
research/rendered/sweep2-google-vrp-faq-2026-09-22.html:137 → cited by research/channel-loop/TERMS-AUDIT-2026-09-29.md:120
research/rendered/terms-data-gov-il.txt:44 → cited by research/channel-loop/TERMS-AUDIT-2026-09-29.md:194
research/rendered/terms-wix.html:842 → cited by research/channel-loop/TERMS-AUDIT-2026-09-29.md:241
research/rendered/displate-com-about-privacy-2026-09-28.html:115 → cited by research/channel-loop/ZERO-TESTS.md:149
research/rendered/terms-wikimedia-robot-policy.txt:253 → cited by research/channel-loop/terms-verdicts.json:679
research/rendered/terms-wikimedia-user-agent-policy-foundation.txt:342 → cited by research/channel-loop/terms-verdicts.json:679
research/rendered/terms-wikimedia-robot-policy.txt:253 → cited by research/channel-loop/terms-verdicts.json:685
research/rendered/astro-themes-guidelines-hackmd.txt:191 → cited by research/measurements/astro-themes.md:494
research/rendered/astro-themes-guidelines-hackmd.txt:192 → cited by research/measurements/astro-themes.md:494
research/rendered/astro-themes-guidelines-hackmd.txt:191 → cited by research/measurements/astro-themes.md:517
research/rendered/crazygames-developer-terms.txt:547 → cited by research/measurements/crazygames.md:376
research/rendered/crazygames-developer-terms.txt:547 → cited by research/measurements/crazygames.md:399
research/rendered/facer-payment-options.html:567 → cited by research/measurements/facer.md:98
research/rendered/facer-payment-options.html:567 → cited by research/measurements/facer.md:125
research/rendered/facer-payment-options.txt:29 → cited by research/measurements/facer.md:210
research/rendered/y8-revshare.txt:437 → cited by research/measurements/html5-syndication.md:42
research/rendered/n8n-verified-creator-requirements.html:603 → cited by research/measurements/n8n-templates.md:148
research/rendered/n8n-verified-creator-requirements.html:603 → cited by research/measurements/n8n-templates.md:154
research/rendered/n8n-verified-creator-requirements.html:603 → cited by research/measurements/n8n-templates.md:163
research/rendered/n8n-verified-creator-requirements.html:603 → cited by research/measurements/n8n-templates.md:178
research/rendered/n8n-verified-creator-requirements.html:603 → cited by research/measurements/n8n-templates.md:184
research/rendered/n8n-templates-search.json:1 → cited by research/measurements/n8n-templates.md:256
research/rendered/n8n-creator-profile-verification.html:604 → cited by research/measurements/n8n-templates.md:276
research/rendered/n8n-creator-profile-verification.html:604 → cited by research/measurements/n8n-templates.md:298
research/rendered/n8n-creator-profile-verification.html:604 → cited by research/measurements/n8n-templates.md:302
research/rendered/n8n-creator-profile-verification.html:604 → cited by research/measurements/n8n-templates.md:312
research/rendered/n8n-creator-profile-verification.html:604 → cited by research/measurements/n8n-templates.md:316
research/rendered/n8n-creator-profile-verification.html:604 → cited by research/measurements/n8n-templates.md:319
research/rendered/n8n-verifies-creator.html:599 → cited by research/measurements/n8n-templates.md:391
research/rendered/n8n-verified-creator-requirements.html:603 → cited by research/measurements/n8n-templates.md:414
research/rendered/paypal-il-help534-limited.html:48 → cited by research/measurements/paypal-israel.md:119
research/rendered/paypal-il-help534-limited.html:48 → cited by research/measurements/paypal-israel.md:120
research/rendered/paypal-il-help534-limited.txt:60 → cited by research/measurements/paypal-israel.md:124
research/rendered/paypal-il-help534-limited.html:48 → cited by research/measurements/paypal-israel.md:125
research/rendered/paypal-il-help534-limited.html:48 → cited by research/measurements/paypal-israel.md:225
research/rendered/paypal-il-help534-limited.html:48 → cited by research/measurements/paypal-israel.md:246
research/rendered/gumroad-terms.txt:553 → cited by research/measurements/refund-law-il.md:838
research/rendered/gumroad-terms.txt:553 → cited by research/measurements/refund-law-il.md:1039
research/rendered/spreadshop-legal-information.txt:36 → cited by research/measurements/spreadshirt.md:267
research/rendered/streetlib-faq-platform-changeover.html:600 → cited by research/measurements/streetlib.md:121
research/rendered/streetlib-faq-platform-changeover.html:600 → cited by research/measurements/streetlib.md:177
research/rendered/help-streetlib-com-category-72-account.html:604 → cited by research/measurements/streetlib.md:331
research/rendered/help-streetlib-com-category-72-account.html:604 → cited by research/measurements/streetlib.md:369
research/rendered/help-streetlib-com-category-72-account.html:604 → cited by research/measurements/streetlib.md:522
research/rendered/help-streetlib-com-article-706-what-you-can-do.html:612 → cited by research/measurements/streetlib.md:521
research/rendered/help-streetlib-com-article-700-onboarding.html:612 → cited by research/measurements/streetlib.md:521
research/rendered/help-streetlib-com-article-427-distribution-agreement.html:612 → cited by research/measurements/streetlib.md:391
research/rendered/help-streetlib-com-article-427-distribution-agreement.html:612 → cited by research/measurements/streetlib.md:522
research/rendered/streetlib-hub-agreement-20250130-en.txt:6 → cited by research/measurements/streetlib.md:600
research/rendered/streetlib-hub-agreement-20250130-en.txt:745 → cited by research/measurements/streetlib.md:712
research/rendered/streetlib-hub-agreement-20250130-en.txt:6 → cited by research/measurements/streetlib.md:713
research/rendered/teachsimple-terms-of-service.txt:420 → cited by research/measurements/teacher-and-ebook-stores.md:134
research/rendered/teachsimple-terms-of-service.txt:420 → cited by research/measurements/teacher-and-ebook-stores.md:222
research/rendered/teachsimple-com-license-agreement.txt:342 → cited by research/measurements/teacher-and-ebook-stores.md:222
research/rendered/displate-about-regulations-2026-09-28.txt:331 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:361 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:539 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:553 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:823 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:833 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:847 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:849 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.txt:875 → cited by research/measurements/wall-art-pod.md:140
research/rendered/displate-about-regulations-2026-09-28.html:640 → cited by research/measurements/wall-art-pod.md:142
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/measurements/wall-art-pod.md:268
research/rendered/displate-about-regulations-2026-09-28.html:340 → cited by research/measurements/wall-art-pod.md:268
research/rendered/displate-about-regulations-2026-09-28.html:640 → cited by research/measurements/wall-art-pod.md:284
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/measurements/wall-art-pod.md:330
research/rendered/displate-about-regulations-2026-09-28.html:640 → cited by research/measurements/wall-art-pod.md:390
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/measurements/wall-art-pod.md:460
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/measurements/wall-art-pod.md:465
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/measurements/wall-art-pod.md:484
research/rendered/displate-about-regulations-2026-09-28.html:640 → cited by research/measurements/wall-art-pod.md:489
research/rendered/displate-com-about-privacy-2026-09-28.html:115 → cited by research/measurements/wall-art-pod.md:292
research/rendered/displate-com-about-privacy-2026-09-28.html:115 → cited by research/measurements/wall-art-pod.md:341
research/rendered/displate-com-about-privacy-2026-09-28.html:115 → cited by research/measurements/wall-art-pod.md:346
research/rendered/displate-com-about-privacy-2026-09-28.html:115 → cited by research/measurements/wall-art-pod.md:387
research/rendered/displate-about-privacy-chunk-2026-09-28.txt:1 → cited by research/measurements/wall-art-pod.md:398
research/rendered/displate-about-privacy-chunk-2026-09-28.txt:1 → cited by research/measurements/wall-art-pod.md:400
research/rendered/crazygames-developer-terms.txt:336 → cited by research/owner-asks/brand-mailbox-questions.md:52
research/rendered/wix-partner-agreement-body.txt:547 → cited by research/owner-asks/brand-mailbox-questions.md:81
research/rendered/spreadshop-legal-information.txt:36 → cited by research/owner-asks/brand-mailbox-questions.md:124
research/rendered/spreadshop-legal-information.html:31 → cited by research/owner-asks/brand-mailbox-questions.md:124
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/owner-asks/brand-mailbox-questions.md:246
research/rendered/displate-about-regulations-2026-09-28.html:340 → cited by research/owner-asks/brand-mailbox-questions.md:246
research/rendered/teachsimple-terms-of-service.txt:420 → cited by research/owner-asks/brand-mailbox-questions.md:308
research/rendered/teachsimple-terms-of-service.html:357 → cited by research/owner-asks/brand-mailbox-questions.md:308
research/rendered/teachsimple-com-contributor-terms-of-service.txt:549 → cited by research/owner-asks/brand-mailbox-questions.md:310
research/rendered/teachsimple-com-become-a-contributor.txt:296 → cited by research/owner-asks/brand-mailbox-questions.md:311
research/rendered/crazygames-developer-terms.txt:336 → cited by research/owner-asks/questions.json:14
research/rendered/wix-partner-agreement-body.txt:547 → cited by research/owner-asks/questions.json:32
research/rendered/spreadshop-legal-information.txt:36 → cited by research/owner-asks/questions.json:55
research/rendered/spreadshop-legal-information.html:31 → cited by research/owner-asks/questions.json:55
research/rendered/displate-about-regulations-2026-09-28.txt:447 → cited by research/owner-asks/questions.json:128
research/rendered/displate-about-regulations-2026-09-28.html:340 → cited by research/owner-asks/questions.json:128
research/rendered/teachsimple-terms-of-service.txt:420 → cited by research/owner-asks/questions.json:151
research/rendered/teachsimple-terms-of-service.html:357 → cited by research/owner-asks/questions.json:151
research/rendered/teachsimple-com-contributor-terms-of-service.txt:549 → cited by research/owner-asks/questions.json:151
research/rendered/teachsimple-com-become-a-contributor.txt:296 → cited by research/owner-asks/questions.json:151
```

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **סימולציה של שינוי המוני בלכידות:** `git archive HEAD` לתיקיית גירוד, `git init` ו-commit, קישור ל-`node_modules`,
  הרצת הסקריפט ואז חבילת ה-revenue. זה מה שגילה את שתי הבדיקות שיישברו. סקריפט `scripts/sim-tree.sh <cmd>` שעושה את
  זה ומוחק אחריו היה חוסך את זה בפעם הבאה (גם ל-`freeze-capture --cited --apply`).
- **גישוש צורות המטא** (צורות מפתחות, sha שלא תואם לגוף, `redacted` שאינו מספר, שורה חדשה חסרה) נכתב שוב ביד; הוא
  שייך ל-`capture-check` או לבדיקה שמונה צורות מטא חריגות.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת §10 של `CHANNEL_LOOP.md`: היסטוריית "Was planned" ארוכה, כשרק השורה של טיק 49 הייתה נחוצה.
- פלט ה-dry-run האמיתי (209 שורות לכידה ו-105 ציטוטים) הודפס יותר מפעם אחת בזמן הבירור.
- שלושה סבבי מוטציות (18, 20, 20) — השני נחוץ (גילה את M20), השלישי לאימות התיקון.
- חבילת ה-revenue בסימולציה (כ-40 שניות) — זול יחסית למה שגילתה.

## תוספת המתקן (fixer): תיקוני הסקירה

### 1. מה התבקש

לתקן כל ממצא "fix" בסקירה של טיק 49 (ארבעה), לשקול את ארבעת ה-"note", ולדחות ממצא רק עם ראיה. אחר כך:
`scripts/verify.sh` על חמשת קובצי הבדיקה של המפרט (exit 0), הרצה חוזרת של המוטציות של הבונה ושל הסוקר שנוגעות בקוד
ששונה, dry-run אמיתי (בלי כתיבה), grep לכתובות ולמזהה הבעלים, ו-commit ב-worktree. **לא** `--apply` על הלכידות
האמיתיות, לא push ולא merge.

### 2. הפעולות המרכזיות שביצעתי

ממצא אחר ממצא (מספור לפי סדר הסקירה):

- **ממצא 1 (fix) — קבצים שאף מטא לא מצביע עליהם: תוקן.** שחזור: probe קריאה-בלבד על `research/rendered` מצא 8 קבצי
  לכידה שאין להם שם ב-`bodyPath`/`textPath`; 4 מהם עם מסכות (`sweep2-google-vrp-faq.html` 4, `.txt` 2,
  `pcn874-gov-il-874-eng.txt` 1, `pcn874-h-erp-mirror.txt` 1), וה-dry-run של הבונה לא ראה אותם. התיקון:
  `planRemask` מוסיף לכל לכידה את קובצי `<slug>.<ext>` (לפי `CAPTURE_EXTS` של freeze-capture) שאין להם שם במטא, כ-part
  בתפקיד `other`, עם סוג לפי הסיומת (`.txt` text/plain, `.html`, `.json`, `.xml`; `.pdf` ו-`.bin` בינאריים ולא
  נוגעים בהם). `sha256`/`byteLength` לא משתנים (אינם של הקבצים האלה); המסכות נספרות ב-`redacted` וב-`remasked`.
  `urls.txt` אינו לכידה (אין לו מטא) ולא נגעים בו. הסיכום מדפיס `other +N (<file>)` ושורה
  `files no meta path names, masked as well: N (M addresses)`. בדיקה חדשה (מטא 503 עם html ו-txt מאחזור קודם, PDF
  עם טקסט שחולץ ביד, `.pdf` ו-`.bin` בינאריים לידם, כתובת ב-`urls.txt`) — נכשלה לפני התיקון ועברה אחריו.
- **ממצא 2 (fix) — נעיצות hash שמתיישנות: תוקן, והרשימה המלאה כאן ב-§4.** הסקריפט מחשב עכשיו `stalePins`: כל שורה
  בקובצי המאגר (מעוקבים, וגם לא-מעוקבים שאינם ב-ignore; לא `logs/` שהוא היסטוריה, לא קובצי הלכידות עצמם ולא
  `FROZEN.sha256` שהסקריפט משכתב) שמחזיקה 8 ספרות hex או יותר מתחילת ה-sha256 הישן של קובץ שהסקריפט משכתב, או את
  ספירת הבתים הישנה שלו (`N bytes`, `N B`, `byteLength N`) בשורה שמזכירה את ה-slug. מטא שהסקריפט משכתב נסרק בטקסט
  החדש שלו, כך ש-`previousSha256` שנשאר בו נספר. בדיקה חדשה (נעיצת hash, נעיצת ספירת בתים, תחילית של 7 ספרות שלא
  נספרת, hex ארוך יותר שרק מתחיל אותו דבר שלא נספר, ונעיצה ב-`logs/` שלא נספרת).
- **ממצא 3 (fix) — שתי בדיקות שיישברו: תוקן בתוך הסקופ (`--except`), וההחלטה נשארת של ה-main thread.** לא נגעתי
  ב-`frozen-citations.test.ts`, ב-`narration-licence-gate.test.ts` או ב-`polar-rail.md`: עדכון שלהם עכשיו היה
  שובר אותם לפני ה-apply, והסקופ אוסר. נוסף `--except <slug>...` (רשימה שלילית; slug לא מוכר — סירוב, exit 1),
  כדי שהאפשרות "להשאיר בחוץ" לא תדרוש 205 slugs ב-`--only`. שתי האפשרויות נמדדו בסימולציה (§6).
- **ממצא 4 (fix) — R1, R2, R3 שרדו: תוקן.** שלוש בדיקות: מטא בהזחה של 4 רווחים (סירוב, בלי כתיבה; מטא של לכידה בלי
  כתובת בהזחה של 4 לא מסורב), לכידת text/plain עם `bodyPath == textPath` (`redacted` 1, `remasked.addresses` 1,
  קובץ אחד בסיכום), ועותק קפוא שקובץ שלו חסר ב-`FROZEN.sha256` (סירוב). נוספו גם בדיקות שהורגות את R5 (ציטוט בלי
  סיומת נבדק מול `.html`), R6 (מיסוך שני של מטא שכבר יש בו `remasked`: מוחלף במקומו) ו-R10 (מחרוזת דמוית-סוד נספרת
  ב-`redacted` ולא ב-`remasked.addresses`).
- **ממצא 5 (note) — README: תוקן חלקית.** פסוקית המטא אומרת עכשיו ש-`sha256` ו-`byteLength` משתנים רק כשהגוף השתנה
  והם היו ה-hash והגודל שלו, ומזכירה את הקבצים שאין להם שם במטא. התאריך נשאר 5.10.2026 (המפרט התיר). אם ה-apply ירוץ
  ביום אחר או עם `--except`, ה-main thread מתקן את שני המשפטים באותו commit.
- **ממצא 6 (note) — freeze-capture יכול להחזיר כתובות: נרשם, מחוץ לסקופ** (§4).
- **ממצא 7 (note) — `--only` כפול: תוקן.** `--only` ו-`--except` עוברים `Set`; slug חיובי (positional) שייך
  ל-`--only` או ל-`--except` שלפניו (`parseArgs` עם `tokens`). בדיקה: `--only api api` סופר פעם אחת.
- **ממצא 8 (note) — הבדיקה על `research/rendered` האמיתי: נדחה חלקית, חוזק.** לא הוספתי `expect(was).toBe("")`:
  ה-main thread מריץ את הסוויטה אחרי `--apply` ולפני ה-commit, כשהקבצים האלה שונו בצדק, והבדיקה הייתה נכשלת בדיוק
  אז. במקום זה הבדיקה משווה גם גודל ו-mtime של כל קובץ ב-`research/rendered` לפני ואחרי (`git status` לבדו לא רואה
  כתיבה לקובץ שכבר שונה). תיקון המספר בלוג של הבונה: בסימולציה הנוכחית 2 נכשלו ו-2402 עברו (2393 + 9 הבדיקות שלי).

### 3. קבצים/מערכות ששונו

- `scripts/remask-captures.mjs` — קבצים בלי שם במטא, `stalePins`, `--except`, הסרת כפילויות, positional לפי הדגל
  שלפניו, כותרת ו-usage.
- `src/__tests__/revenue/remask-captures.test.ts` — 9 בדיקות חדשות (21 בסך הכול), והבדיקה על התיקייה האמיתית
  מחוזקת.
- `research/rendered/README.md` — פסוקית המטא בפסקת המיסוך.
- הלוג הזה (הסעיף הזה בלבד).
- לא שונו: `render-watch.mjs`, `freeze-capture.mjs`, ה-workflow, אף לכידה, ואף בדיקה או הערה קיימת.

### 4. החלטות והנחות משמעותיות

**ההחלטה שנשארת ל-main thread, באותו commit של ה-apply (ממצא 3):**
- *לעדכן:* להריץ `--apply` מלא; לעדכן את תחיליות ה-sha256 ב-`frozen-citations.test.ts:241-243` וב-`polar-rail.md:14,78,79`
  לאלה של הקבצים החדשים; ולנסח מחדש את `narration-licence-gate.test.ts` ("is byte for byte the capture commit
  f9a41c6 stored"): להשוות ל-`redactSecrets(git show f9a41c6:<file>)` ולבדוק ש-`remasked` קיים במטא — עדכון hash
  לבדו לא משאיר את הטענה נכונה. כל הכתובות יוצאות מהמאגר הציבורי.
- *להשאיר בחוץ:* `--except kokoro-82m-model-card-2026-09-29 polar-supported-countries-2026-09-28
  polar-acceptable-use-2026-09-28 polar-fees-2026-09-28`. שתי הבדיקות עוברות בלי שינוי, הראיה של f9a41c6 נשארת זהה
  בבית, אבל 4 כתובות נשארות בעותקים האלה, וה-README צריך לומר זאת.

**נעיצות שמתיישנות (ממצא 2) — 52 שורות ב-dry-run האמיתי:**
- הערות שמכריעות החלטות, hash (9): `research/channel-loop/TERMS-AUDIT-2026-09-29.md:23` (displate-about-regulations),
  `:120` (sweep2-google-vrp-faq — מתיישן רק בגלל תיקון ממצא 1), `research/measurements/apify-visibility.md:8`,
  `facer.md:108`, `polar-rail.md:14`, `:78`, `:79`, `superteam-earn.md:97`, `wix-app-market.md:393`.
- ספירות בתים בהערות (27): `facer.md:108` ("1,141,780 bytes"), `eaa-occupancy.md:374`, `spreadshirt.md:199`, ועוד 24
  שורות בטבלאות `research/tiktok/08-reads/` (`hebrew-israel.md` 12, `sales-creators.md` 7, `marketing-creators.md` 4,
  `tj-tiktok.md` 1) שמתארות את גודל הלכידה כפי שנאחזה.
- בדיקות (4): `frozen-citations.test.ts:241-243`, `narration-licence-gate.test.ts:229`.
- `previousSha256` במטא של לכידות (12, שורה 21 בכל אחד): displate-about-regulations (-2026-09-29 והחי),
  displate-com-about-copyright, -faq, -privacy, gamedistribution-sdk-implementation (ארבעה: -2026-09-28-12e095c,
  -2026-09-28-b8025d3, -2026-09-29, החי), kokoro-82m-model-card (-2026-09-29 והחי), sweep2-google-vrp-faq. אלה רשומות
  היסטוריות של האחזור הקודם, לא טענות על הבתים השמורים; render-watch משווה את `sha256` של המטא הקודם, לא את
  `previousSha256`, אז אין השפעה על הריצה הבאה. הסקריפט לא משנה אותם (המפרט: שום מפתח אחר במטא לא משתנה).
- המלצה: לעדכן רק את תשע הנעיצות בהערות ואת ארבע הבדיקות (או להשאיר בחוץ, כנ"ל); את ספירות הבתים ואת
  `previousSha256` להשאיר כפי שהן, כי הן מתארות את האחזור, ו-`remasked` במטא מסביר את ההבדל.

**שורות מצוטטות שישתנו — עכשיו 50 שורות ב-111 ציטוטים (היו 49 ב-105).** השורה החדשה היא
`research/rendered/pcn874-gov-il-874-eng.txt:15` (כתובת לשאלות טכניות בדומיין ממשלתי; אחרי המיסוך נשאר שם הדומיין),
והיא מצוטטת ב:
- `research/colony-sweep/BOARD-2.md:55`, `:221`
- `research/colony-sweep/screen-2/pcn874-embed.md:19`, `:54`
- `research/colony-sweep/screen-2/results.json:828`
- `research/owner-docs-audit/FINDINGS.md:193`

שאר 105 הציטוטים זהים לרשימה של הבונה (`diff` exit 0 על השאר). קוד המוצרים (`products/pcn874`,
`products/il-biz-tools`) מצטט את קבצי ה-pcn874 בשורות אחרות (107, 126-127, 158, 507-508, 523-535, 990-1002,
1269-1270), וקורא את ה-PDF ואת `url`/`sha256` של המטא, שלא משתנים.

**מוטציות שקולות או בלתי-נצפות:** R4 (ספירת דומיין תלוית-רישיות) שקולה: המסכה שומרת את הדומיין כפי שהוא, ומסכה
ישנה לא נעלמת, ולכן לכל מפתח (ברישיות מדויקת או מוקטנת) ההפרש הוא בדיוק המסכות החדשות, והסכום זהה; `domainKind`
ו-`ASSET_DOMAIN` לא תלויים ברישיות. R7 (כתיבה בלי קובץ זמני ו-rename) לא נצפית בבדיקה, כפי שהסוקר כתב.

**מחוץ לסקופ — נרשם ולא תוקן:**
- (ממצא 6) `scripts/freeze-capture.mjs` מעתיק בתים מ-commit ישן בלי מיסוך (`commitFiles`, גם דרך
  `--from-commit` וגם דרך `--cited`/`citationVersion`). אחרי המיסוך-מחדש, עותק קפוא חדש מ-commit שלפני 12143ca יחזיר
  כתובות למאגר וירשום אותן ב-`FROZEN.sha256`. פריט מוצע לתור: freeze-capture ימסך גוף וטקסט שמועתקים
  (`redactSecrets`), או יסרב ל-commit מקור שלפני 12143ca.
- אחרי ה-apply המלא, ה-grep הרחב מוצא 60 מחרוזות בצורת כתובת ב-29 קובצי `.html`: 50 אחרי `/` ו-10 אחרי escape
  (`/`, `\/` בתוך JSON מקונן). הקטגוריה "אחר" (8 אצל הסוקר) ירדה ל-0.

### 5. שגיאות וניסיונות שנכשלו

- בבדיקת המיסוך-השני כתבתי בטעות `PDF_TEXT` המקורי (עם הכתובת הלא-ממוסכת) על `doc.txt`, ולכן `redacted` יצא 3 ולא
  2. הקוד היה נכון והבדיקה שגויה; תוקן כך שהיא קוראת את הקובץ הממוסך ומוסיפה כתובת אחת.
- הבדיקה החדשה ציפתה לסדר `old.html, old.txt`, אבל הסקריפט הולך לפי `CAPTURE_EXTS` (txt לפני html). עדכנתי את
  הבדיקה לסדר הזה.
- `npx vitest run --maxWorkers=2` בסימולציה נכשל (`minThreads and maxThreads must not conflict`, 0 בדיקות). הרצתי
  בלי הדגל.
- התוכנית של 20 המוטציות של הבונה נמחקה יחד עם תיקיית הגירוד שלו. בניתי אותה מחדש לפי התיאורים בלוג שלו; מחרוזות
  ה-find שלי אינן בהכרח זהות לשלו.
- (בזמן שהמוטציות רצו, אסור לגעת ב-worktree: `mutate.mjs` עוצר ב-exit 4 אם ה-checkout משתנה. לכן הסעיף הזה נכתב
  בתיקיית הגירוד והועתק רק אחר כך.)

### 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh src/__tests__/revenue/remask-captures.test.ts src/__tests__/revenue/render-watch.test.ts
  src/__tests__/revenue/freeze-capture.test.ts src/__tests__/revenue/frozen-citations.test.ts
  src/__tests__/revenue/capture-check.test.ts` — exit 0 (typecheck exit 0; tests exit 0; 5 קבצים, 329 בדיקות).
- TDD: 9 הבדיקות החדשות נוספו לפני הקוד. לפני התיקון 3 נכשלו (קבצים בלי שם, נעיצות, `--except`; הרביעית נכשלה בגלל
  באג בבדיקה, ראו §5). השש האחרות עברו מהתחלה, כי הן מכסות התנהגות קיימת ונכונה (R1-R3, R5, R6, R10), והמוטציות
  הן מה שמוכיח אותן.
- מוטציות: `node scripts/mutate.mjs --plan <plan.json>` (הבדיקה: `src/__tests__/revenue/remask-captures.test.ts`) — exit 0,
  43 הוחלו ו-43 נהרגו. הבסיס עבר פעמיים (10.4s, ואחרי הסבב 12.3s). הרשימה:
  - 20 המוטציות של הבונה M1-M20, בנויות מחדש לפי התיאורים שלו.
  - 8 של הסוקר: R1, R2, R3, R5, R6, R8, R9, R10.
  - 15 חדשות על הקוד שלי:
    - N1: קבצים בלי שם במטא מדולגים.
    - N2: קובץ כזה נלקח כגוף.
    - N3/N4: `.pdf`/`.bin` בלי שם נקרא כטקסט.
    - N5: `--except` מתעלם.
    - N6: slug לא מוכר ב-`--except` מתקבל.
    - N7: `--only` בלי הסרת כפילויות.
    - N8: positional תמיד ל-`--only`.
    - N9: מטא משוכתב נקרא מהדיסק בסריקת הנעיצות.
    - N10: `logs/` נסרק.
    - N11: נעיצות ספירת בתים נזרקות.
    - N12: כל hex עם אותן 8 ספרות ראשונות נספר.
    - N13: נעיצות sha256 נזרקות.
    - N14: ספירת בתים בלי שם הלכידה בשורה.
    - N15: מסכות הקבצים בלי שם לא נספרות בסיכום.
  - בתוכנית נפרדת (`mutate` exit 1, כצפוי): R4 ו-R7 שרדו. R4 שקולה ו-R7 לא נצפית; ראו §4.
- dry-run אמיתי: `node scripts/remask-captures.mjs --dry-run` — exit 3, כ-8 שניות; `git status --porcelain
  --untracked-files=all -- research/rendered | wc -l` = 0 לפני ו-0 אחרי. 551 לכידות; 212 ישתנו ו-339 לא; 279 קבצים
  (193 ‏.html, 75 ‏.txt, 10 ‏.json, 1 ‏.bin); 932 כתובות. לפי סוג: free-mail provider 157, organisation or university
  668, mailing-list host 19, government 9, placeholder 79. עותקים קפואים: 31 לכידות, 42 קבצים. asset names masked: 0.
  קבצים בלי שם במטא: 4 (8 כתובות). שורות מצוטטות: 50 (111 ציטוטים). נעיצות שמתיישנות: 52.
- סימולציה (`git archive 4fb431c` לתיקיית הגירוד, `git init`, commit, קישור ל-`node_modules`; לא המאגר):
  - `--apply --date 2026-10-05`: exit 0, 492 קבצים שונו (279 + 212 מטא + `FROZEN.sha256`).
  - בכל 279 הקבצים מספר השורות זהה. ב-212 המטא השתנו רק `sha256`, `byteLength`, `redacted` ו-`remasked`, וסדר שאר
    המפתחות לא זז.
  - `--apply` שני: exit 0, 0 קבצים. `--dry-run` אחריו: exit 0. `sha256sum -c --quiet FROZEN.sha256`: exit 0.
    `node scripts/freeze-capture.mjs --cited`: exit 0.
  - `npx vitest run src/__tests__/revenue`: exit 1, 2 נכשלו ו-2402 עברו (1 דולגה). אלה אותן שתי בדיקות: polar-rail
    ב-`frozen-citations` ו-f9a41c6 ב-`narration-licence-gate`. המיסוך של הקבצים בלי שם לא שבר שום דבר נוסף.
  - עם `--except` לארבעת העותקים הנעוצים: exit 0; 208 לכידות, 275 קבצים, 928 כתובות; 27 עותקים קפואים (38 קבצים).
    `frozen-citations.test.ts` ו-`narration-licence-gate.test.ts` עוברים (49 עברו, 1 דולגה).
- grep על הקבצים שהשתנו: כתובת בשורות שנוספו — 0 (grep exit 1); שם הבעלים, case-insensitive — 0; שמות מודלים — 0.

### 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **סימולציה על עץ זמני** — שלישית בטיק הזה (בונה, סוקר, מתקן), כל אחד עם `git archive`, `git init` וקישור
  `node_modules`. הבונה כבר הציע `scripts/sim-tree.sh <cmd>`; עכשיו זה בבירור שווה בנייה.
- **תוכניות מוטציה נמחקות עם תיקיית הגירוד**, וכל סוקר או מתקן בונה אותן מחדש מתיאורים. כדאי לשמור את קובץ ה-plan
  ליד הבדיקה (למשל `src/__tests__/revenue/mutations/<script>.json`), כדי שכל אחד יוכל להריץ שוב את אותה רשימה.

### 8. על מה בוזבזו אסימונים, לפי פעולה

- שחזור 20 המוטציות של הבונה מתוך תיאורים, כי ה-plan שלו נמחק (ראו §7).
- הרצת סוויטת ה-revenue המלאה בסימולציה פעמיים (פעם אחת נכשלה על דגל `--maxWorkers`).
- הדפסת פלט ה-dry-run המלא (כ-370 שורות) כדי להשוות רשימות, כשהספיק `diff` על הקובץ.
