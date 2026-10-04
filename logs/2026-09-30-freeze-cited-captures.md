# טיק 38: הקפאת הלכידות המצוטטות (בונה, שני מתקנים שנקטעו, מתקן שלישי)

ענף: `worktree-wf_a8fad69e-a91-1` (בסיס `ed19dc1`), worktree `.claude/worktrees/wf_a8fad69e-a91-1`. לא נדחף.
הלוג של הבונה עצמו, `logs/2026-09-30-tick38-freeze-cited-captures.md`, נשאר כפי שנכתב; הלוג הזה מכסה את כל הטיק.

## 1. מה המשתמש ביקש

סקריפט ה-workflow של הטיק (לא הבעלים ישירות, בשמו של הלולאה) ביקש לפני הריצה השבועית של 6.10:
- כלי, `scripts/freeze-capture.mjs`, שמעתיק לכידה של render-watch לעותק מתוארך שאף שורה ב-`urls.txt` לא כותבת עליו;
- להקפיא כל לכידה פעילה שקובץ החלטה מצטט לפי שורה, בגרסה שהציטוט נכתב מולה, ולהפנות את הציטוטים אליה בלי לשנות אף מספר שורה;
- מבחן שמכשיל ציטוט לפי שורה של לכידה פעילה;
- לרשום כל ציטוט DRIFTED, unknown או split שלא הופנה, עם שני הטקסטים.
אחרי שני סבבי ביקורת (ממצאי נתונים 1-6, ממצאי כלי 1-9), המתקן השלישי התבקש: לא לזרוק את ה-diff שלא נשמר, להשלים את מבחן הסורק שנשאר פתוח, להחליט אם קוד שייך לקבצי ההחלטה, להריץ את מעבר הנתונים כקומיט נפרד, לתעד snapshot לפני/אחרי, ולסיים עם שני קובצי המבחן ירוקים, `scripts/verify.sh` ביציאה 0 ומבחן osek-zair ביציאה 0.

## 2. הפעולות המרכזיות שביצעתי

**הבונה** (`c89fcd3`, `b92b62c`, `45b1718`): כתב את הכלי ואת מבחן השמירה, הקפיא 48 לכידות והפנה 182 ציטוטים.
הסורק שלו לא ראה שמות קצרים בפרוזה (`tou`, `priv`, `chunk`), `:N` חשוף בתחילת שורה, צורת סוגריים מסולסלים ועוד.
הגרסה נבחרה לפי `git log -S` על כל הקובץ, ולא לפי השורה המצטטת. "unknown" טופל כמו "same". הוא גם הפנה DRIFTED.

**המתקן הראשון** (נקטע בהפעלה מחדש של הקונטיינר) כתב את תיקוני הכלי, והשני שמר אותם כ-`2e73269`:
- הסורק קורא שמות קצרים בפרוזה, `:N` חשוף אחרי לכידת הסעיף, סוגריים מסולסלים, `#L12`, `:L12`, "line 12", `../rendered/`, ו-slug עם `.<ext>-` בתוכו.
- `citationVersion` שופט כל טווח לפי ה-commit שכתב את שורת הציטוט (`git log -L`) ומשווה את כל קבצי הלכידה.
- המצבים unknown, split ו-invalid לעולם לא מופנים, וגבול shallow נחשב unknown.
- עותק אחד לכל גרסה. אם השם תפוס, השם הוא `-<day>-<commit>`.
- `textError` מסומן כ-flagged.
- נוסף `FROZEN.sha256`.
- slug ו-`--from-commit` נבדקים לפני כל קריאה ל-git.

**המתקן השני** (נקטע במגבלת השימוש השבועית) השאיר diff שלא נשמר:
- `relative()` בשביל `decisionFiles`;
- `urls.txt` אינו לכידה;
- ב-JSON כל שורה עומדת לבדה;
- הפניה שנגררת אחרי שם קצר לוקחת את קובץ הלכידה;
- מבחן סורק אחד שלא הושלם.

**אני (מתקן שלישי):**
1. קראתי את ה-diff. כל ארבעת חלקיו מחזיקים, ושמרתי אותם ב-`a414692`.
2. תיקנתי את חוק "note": "the note", "note's", `note \`:N\`` ו-"(note" בסוף שורה הם הערת המחקר. השורות שאחריהם שייכות להערה, לא ללכידה (`2b16b13`).
3. הוצאתי את `src/` מקבצי ההחלטה.
4. שפטתי מחדש מהבסיס. יצרתי worktree מנותק ב-`ed19dc1` בתיקיית scratch, עם הכלי המתוקן. שפטתי את כל 268 הציטוטים של לכידות פעילות (206 לפי שורה, 62 בלי). בניתי מחדש את קובצי הציטוט כטקסט הבסיס, כשהוא מופנה לפי השיפוט, והשוויתי מול מה שהבונה כתב: 83 שורות שונות.
5. הקפאתי 15 עותקים חדשים, רשמתי את כל 64 העותקים ב-`FROZEN.sha256` (כולל nevo ו-kokoro-2026-09-29, שהוקפאו ביד, דרך `--record` בלי להקפיא מחדש) והסרתי עותק יתום אחד.
6. עשיתי ארבעה תיקונים ביד. כל אחד נבדק מול העותק (פירוט בסעיף 4).
7. כל זה נכנס למעבר הנתונים, בקומיט נפרד (`1d25e6e`). אחרי המוטציות: `48c9d89` (מבחנים ל-T2, T4, T6) ו-`993adb8` (T11).
8. הרצתי מוטציות, `verify.sh` ומבחן osek-zair, וכתבתי את הלוג הזה.

## 3. קבצים/מערכות ששונו

- **הכלי:** `scripts/freeze-capture.mjs` (`NOTE_RE`, `decisionFiles` בלי `src/`, תיעוד: hexgrad אינו עותק קפוא).
- **מבחנים:** `src/__tests__/revenue/frozen-citations.test.ts`. המבחן של "note" נכתב מחדש, ונוספו:
  - `copyName`: שם מתוארך נחשב עותק רק כשה-slug בלי התאריך הוא לכידה;
  - `NOT_CAPTURES`;
  - שורת unesco ב-`LIVE_MENTIONS`;
  - מבחן Kokoro לפי ההיסטוריה של כל קובץ;
  - `decisionFiles` בלי קוד.
- **`research/rendered/`:**
  - 15 עותקים חדשים:
    - `kokoro-82m-model-card-2026-09-25` ו-`-2026-09-28`;
    - `polar-{supported-countries,acceptable-use,fees}-2026-09-28`;
    - `gamedistribution-wiki-faq-2026-09-28` ו-`-2026-09-28-12e095c`;
    - `gamedistribution-sdk-implementation-2026-09-28-b8025d3` ו-`-12e095c`;
    - `displate-about-privacy-chunk-2026-09-28`;
    - `lomdiml-home-2026-09-28`, `worksheets4kids-home-2026-09-28`;
    - `apify-store-accessibility-2026-09-22`, `sweep2-github-marketplace-2026-09-22`, `sweep2-linet3-licence-2026-09-22`.
  - `FROZEN.sha256` (184 קבצים, 64 עותקים).
  - הוסר `displate-com-about-faq-2026-09-29.*`.
  - `README.md`: מספרים מתוקנים וטענת hexgrad.
- **קובצי ציטוט (30):**
  - `research/channel-loop/{RULING-2026-09-29-loop,SITTING-2026-09-29-BRIEF,SITTING-2026-10-01-BRIEF,TERMS-AUDIT-2026-09-29}.md`
  - `research/measurements/{actions-spending-limit,hebrew-teacher-sites,html5-syndication,israeli-invoicing-free-tiers,polar-rail,stripe-israel,teacher-and-ebook-stores,wall-art-pod}.md`
  - `research/faceless-youtube/{PREREG-DECISIONS,RED-TEAM,REGRADE,VERDICT}.md`
  - `research/colony-sweep/screen-2/{github-marketplace-app,google-oss-vrp,metaculus-bots,pcn874-embed}.md` ו-`results.json`
  - `research/breadth/scouts/{education,storefront-rails}.json`
  - `research/owner-asks/{brand-mailbox-questions.md,questions.json}`
  - `research/tiktok/08-reads/tiktok-policy.md`
  - `research/youtube-kids/{ASSESSMENT,RENDER-CHECK-2026-09-28}.md`
  - `products/parent-guides/LICENSES.md`
  - `products/chart-explainer/releases/t1/render-report.json`
- **הלוג הזה.**
- **לא נגעתי ב:** `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, הלוג של הבונה, `urls.txt` או אף לכידה חיה.

## 4. החלטות והנחות משמעותיות

- **קוד אינו קובץ החלטה.**
  - ה-slugs של מבחן הם fixtures: 150 שגיאות "no capture on disk" כמו `research/rendered/x.txt`.
  - הערה בקוד אינה המקום שממנו החלטה נקראת.
  - יש ציטוט קוד אחד לפי שורה של לכידה פעילה, והוא DRIFTED: `src/__tests__/revenue/owner-asks.test.ts:169` (`displate-about-regulations.txt:447`). הוא נמסר ל-main thread.
- **המבחן הלא גמור של המתקן השני.** הוא דרש שהשורה `:222`, אחרי "a note on the page", תינתן לדף. זה קורה בשורה שלא נקראת בה שום לכידה, ואחרי הפניה שנגררה להערה. אין חוק שסורק יכול לנקוט כדי להבחין בזה. לכן המבחן נכתב מחדש: הדף נקרא בשמו, ו"an install note (`:222`)" או "a GameMaker note (`:223`)" נשארים של הדף (כמו `wavedash.md:75` ו-`REJECTED.md:1227`).
- **גרסה לכל ציטוט היא הלכידה כפי שה-commit שכתב את שורת הציטוט שמר אותה, כל הקבצים.**
  - לכן יש כמה עותקים מאותו יום. GameDistribution רונדר ארבע פעמים ב-28.9, ובכל פעם ה-html השתנה.
  - העותק הוותיק לוקח את השם הפשוט, כמו ב-`--cited`.
  - הכרעות שונות מהצעות הביקורת:
    - `html5-syndication.md:198/:220` הולכים ל-`gamedistribution-wiki-faq-2026-09-28`. זו גרסת b8025d3: השורה נכתבה ב-2651d52, והכותרת שלה אומרת "fetched 2026-09-28T19:17:32Z". הביקורת הציעה 12e095c.
    - דוח הרינדור של t1 הולך ל-`kokoro-82m-model-card-2026-09-25`: הוא נכתב ב-27.9 (78fafc9), מול הלכידה של 25.9. הביקורת הציעה 43aa412, וזה נכון רק ל-`LICENSES.md`.
- **נשארו חיים בכוונה (18, בלי שורה)**, כל אחד ב-`LIVE_MENTIONS`:
  - תשעה של `apify-store-accessibility`: "the live store listing a later run re-reads";
  - `RULING-loop:147` (מה ש-`CHANNEL_LOOP` מצטט);
  - `ZERO-TESTS:240` ו-`robots-nevo` החשוף ב-`terms-verdicts.json:275`;
  - "Suggested slug" ב-`html5-syndication:129` ו-`:188`;
  - טבלת ה-slugs ב-`actions-spending-limit:459-460`;
  - שורת urls.txt המוצעת ב-`LICENCE-IGO-DECISION:365`;
  - המטא של ה-503 ב-`TERMS-AUDIT:120`.
  - הערה ל-main thread: תשעת אזכורי ה-apify מדווחים ספירות ו-fetchedAt של גרסאות שכבר נכתבו מחדש (drifted). הם בלי מספרי שורה, ונשארו חיים כפי שהמתקן השני קבע. הקפאה שלהם עולה כ-3MB לכל גרסה.
- **תיקונים ביד, כל אחד נבדק מול העותק:**
  - `eaa-occupancy.md:374` נשאר על `apify-store-accessibility-2026-09-07`. ההיסטוריה של השורה נעצרת בגבול ה-shallow (`a65a5b2`), כך שהכלי אומר unknown. העותק הוא 3,027,635 בתים ו-803 פריטים, כפי שהשורה כותבת.
  - ב-`TERMS-AUDIT:120` נכתב קודם "html line 137". עכשיו הוא נקרא `sweep2-google-vrp-faq-2026-09-22.html:137`, שורת ה-href של התנאים, וה-html זהה ל-html החי.
  - ב-`TERMS-AUDIT:55`, הטווח `:2-5` הפך ל-`:2, :4-5`. שורה 3 במטא של עותק היא ה-slug שהשתנה. זו ממצא ביקורת 6, והשינוי היחיד במספר שורה.
  - ב-`wall-art-pod.md:8`, השם `faq.txt:38-43` הפך ל-`displate-com-about-faq-2026-09-28.txt:38-43` (תפריט האמנים).
  - ב-`actions-spending-limit.md:506` נכתב `R-RBU:1165`, וב-`:619` נכתב `R-SB:335`. הסורק נתן אותן ללכידה שלפניהן, מעבר לסוף שלה. התוכן נבדק: RBU:1165 הוא "Fine-grained personal access tokens", ו-SB:335 הוא "Stop usage when budget limit is reached".
- **hexgrad-kokoro-voices-js-dfb907a אינו עותק קפוא.** אין במטא שלו בלוק "frozen", והוא קובץ שנלכד ב-commit מוצמד. לכן `FROZEN.sha256` לא רושם אותו, ו-`--record` מסרב, בכוונה. הכותרת וה-README אמרו אחרת ותוקנו.
- **`displate-com-about-faq-2026-09-29` הוסר.** הציטוט היחיד שלו, `wall-art-pod:17`, עבר לעותק של 28.9 שהכותרת קוראת.

### ממצאי הביקורת: מה תוקן ומה נדחה

**ביקורת נתונים (1-6):**
1. **wall-art-pod, ‏tou/priv/chunk:** תוקן. הסורק קורא שמות קצרים בפרוזה (מוטציה T1), §4-§6 נקראים עכשיו בעותקי 28.9, ו-`chunk` הוקפא (`-2026-09-28`).
2. **D2D, Invoice4u, סוגריים, "html line 137", "HTML line 446":** תוקן.
   - אזכור של לכידה פעילה בלי סיומת מקבל את ה-`:N` שמתחיל שורה (T2).
   - כל אזכור של לכידה פעילה בהערה נכשל, אלא אם `LIVE_MENTIONS` אומר אחרת.
   - D2D, Invoice4u וכותרות הסוגריים מופנים.
   - `TERMS-AUDIT:120` נקרא בשמו ביד.
3. **html5-syndication `:169`/`:220`:** תוקן, וטווח מעבר לסוף העותק הוא כישלון.
   - נדחתה ההצעה `--from-commit 12e095c` ל-`:220`. שורה 220 נכתבה ב-2651d52, בזמן הגרסה של b8025d3, והכותרת `:198` אומרת 19:17:32Z, כלומר b8025d3.
   - שתי הגרסאות מחזיקות את ה-datetime ב-`:713`.
4. **polar-rail:** תוקן. נוצרו עותקי `-2026-09-28` (51a2546, 25deca3), וההשוואה עוברת על כל קבצי הלכידה (T16).
5. **44 הציטוטים "מחוץ לתחום":** כולם בתוך הסט עכשיו, חוץ מקוד.
   - נדחתה ההצעה ל-43aa412 עבור דוח הרינדור. הוא נכתב ב-27.9 מול גרסת 25.9, ולכן `-2026-09-25`.
   - ל-`LICENSES.md` ההצעה התקבלה: 43aa412 הוא גרסת 12e095c, `-2026-09-28`.
   - "13" ב-README תוקן ל-44/118.
6. **`TERMS-AUDIT:55`:** תוקן ל-`:2, :4-5`.

**ביקורת כלי (1-9):**
1. **צורות ציטוט:** תוקן, בעיקר ב-`2e73269`.
   - "Fail on any unattributed :N in a file that names an active slug" יושם אחרת: כל אזכור של לכידה פעילה בהערה נכשל, אלא אם `LIVE_MENTIONS` אומר אחרת.
   - `:N` לא משויך בשאר הקבצים לא נכשל. רובם שורות של קבצים אחרים (הערות, JSON), שהסורק משאיר בצדק לא משויכות.
   - האכיפה שנבחרה חזקה יותר עבור לכידות פעילות.
2. **unknown ו-shallow:** תוקן (T5, T6, T22).
3. **blame לכל טווח:** תוקן (T4, T15).
4. **שני עותקים ביום אחד:** תוקן (T7, T8).
5. **textError:** תוקן (T9, T16).
6. **שלמות העותקים:** תוקן (T10, G2, G3, G10, G11).
7. **slug ו-commit:** תוקן (T11, T12, T13).
8. **`.<ext>-`:** תוקן (T14).
9. **פערי מוטציות:**
   - R1/R2 (T17), R3/R4 (T18), R5 (T19), R6 (T13), R7 (T15), R8 (T7, בריצה יבשה), R9 (T20), R10 (T5, T22), R16 (T21).

## 5. שגיאות וניסיונות שנכשלו

- `awk` (mawk) לא מכיר `{n}` בביטוי רגולרי. ההשוואה הראשונה של ה-snapshot יצאה ריקה ושקרית, ועברתי ל-node.
- `KEEP` לפי `file:line` שמר גם אזכור שהבונה הפנה, `gh-docs-actions-billing.html` ב-`actions-spending-limit:459-460`. עברתי למפתח `file:line|text`.
- heredoc של bash פתח את `${...}` בתוך קוד Python, וזה תוקן.
- יישור לפי מיקום בהשוואת ה-snapshot נשבר אחרי ציטוט אחד שנוסף. עברתי ל-`diff` על שורות מנורמלות.
- המתקנים הקודמים נקטעו פעמיים, אז העבודה נשמרה בקומיטים קטנים.

## 6. בדיקות ופעולות ולידציה

- **שני קובצי המבחן:** `npx vitest run src/__tests__/revenue/freeze-capture.test.ts src/__tests__/revenue/frozen-citations.test.ts` עבר עם 57 (36+21).
- **`node scripts/freeze-capture.mjs --cited`:** 0 ציטוטים לפי שורה של לכידה פעילה, ויציאה 0.
- **העותקים:** כל 64 העותקים זהים בית-בבית ל-`git show <frozen.commit>:research/rendered/<live>.<ext>`. המטא שווה למקור, חוץ מ-slug, bodyPath, textPath ו-frozen. `sha256sum -c FROZEN.sha256` עובר, ו-capture-check נותן ok ל-63. החריג הוא terms-un, flagged 504, שמצוטט בגלל הכישלון עצמו.
- **815 הטווחים שהופנו:** 814 נקראים בעותק בדיוק כפי שהיו כשנכתבו. החריג הוא `:2-5` של IRS, שתוקן ל-`:2, :4-5`.
- **snapshot מלא לפני/אחרי:** הסורק הנוכחי רץ על קובצי ההחלטה בבסיס `ed19dc1` מול הענף. היו 3,577 ציטוטים לפני ו-3,581 אחרי. אחרי הסרת סיומת התאריך מה-slug, כל ציטוט זהה בטווחים, בקבצים ובשורות, חוץ מחמישה שינויים:
  - `TERMS-AUDIT:55`: `2-5` הפך ל-`2-2` ו-`4-5`;
  - `TERMS-AUDIT:120`: `html 137` עבר מהמטא החי לעותק `-2026-09-22` (אותה שורה 137);
  - `actions-spending-limit:506`: `1165` עבר מ-actions-billing ל-R-RBU;
  - `:619`: `335` ו-`265` עברו מ-budgets-and-alerts ל-R-SB;
  - `wall-art-pod:8`: ציטוט חדש, 38-43 של עותק ה-faq (קודם "other").

  אף מספר שורה לא השתנה, חוץ מפיצול הטווח של IRS.
- **verify.sh:** `scripts/verify.sh`, יציאה 0: typecheck יציאה 0; `npx vitest run src/__tests__/revenue` יציאה 0, 61 קבצים, 1873 עברו ו-1 דולג.
- **osek-zair:** `npx vitest run tests/osek-zair-page.test.js` (מתוך products/il-biz-tools), יציאה 0, 77 עברו.
- **מוטציות:** `node scripts/mutate.mjs --plan`, מוטציה אחת לכל תיקון: 44 הוחלו. בריצה הראשונה 40 נהרגו ו-4 שרדו (T2, T4, T6, T11). לשלושה נכתב מבחן ב-`48c9d89` שנכשל עליהם. T11 נקרא בטעות "שקול" באותו קומיט: `git update-ref refs/heads/-p HEAD` כותב ref כזה, ו-rev-parse פותר אותו. נוסף מבחן, והוא נהרג. אחרי זה כל 44 נהרגו.

| ID | הקובץ שנשבר | מה נשבר | נהרג ע"י |
|---|---|---|---|
| T1 | `freeze-capture.mjs` | prose short name (Short name `tou`) not read | frozen-citations |
| T2 | `freeze-capture.mjs` | a line-leading bare :N not carried to the section's capture (שרד בריצה הראשונה; נהרג אחרי מבחן חדש) | frozen-citations |
| T3 | `freeze-capture.mjs` | brace form slug.{txt,html} not read | frozen-citations |
| T4 | `freeze-capture.mjs` | a range's commit is the oldest holding the token anywhere, not the line's latest unbroken run (שרד בריצה הראשונה; נהרג אחרי מבחן חדש) | freeze-capture |
| T5 | `freeze-capture.mjs` | a shallow clone's boundary judged as known history | freeze-capture |
| T6 | `freeze-capture.mjs` | unknown, split or invalid citations exit 0 (שרד בריצה הראשונה; נהרג אחרי מבחן חדש) | freeze-capture |
| T7 | `freeze-capture.mjs` | a second version of one fetch day takes the taken name | freeze-capture |
| T8 | `freeze-capture.mjs` | an existing copy with the same bytes under another name is not reused | freeze-capture |
| T9 | `freeze-capture.mjs` | a meta with textError frozen unflagged | freeze-capture |
| T10 | `freeze-capture.mjs` | FROZEN.sha256 hashes not checked | freeze-capture, frozen-citations |
| T11 | `freeze-capture.mjs` | resolveCommit takes a value starting with - (שרד בריצה הראשונה; נהרג אחרי מבחן חדש) | freeze-capture |
| T12 | `freeze-capture.mjs` | main checks --from-commit only after git | freeze-capture |
| T13 | `freeze-capture.mjs` | main checks the slug only after git and temp files | freeze-capture |
| T14 | `freeze-capture.mjs` | a slug with .<ext>- inside it cut at the extension | frozen-citations |
| T15 | `freeze-capture.mjs` | a short-name row repointed although its references want different versions | freeze-capture |
| T16 | `freeze-capture.mjs` | same judged by the txt alone, not every file of the capture | freeze-capture |
| T17 | `freeze-capture.mjs` | failed-fetch fallback to an older text that was itself no read page | freeze-capture |
| T18 | `freeze-capture.mjs` | an existing copy's meta not compared (R3/R4) | freeze-capture |
| T19 | `freeze-capture.mjs` | a flagged capture accepted as already frozen without its flag record (R5) | freeze-capture |
| T20 | `freeze-capture.mjs` | a range past the end of what it read is not invalid (R9) | freeze-capture |
| T21 | `freeze-capture.mjs` | an already frozen copy rewritten (R16) | freeze-capture |
| T22 | `freeze-capture.mjs` | a citing file with uncommitted changes judged anyway (unknown) | freeze-capture |
| U1 | `freeze-capture.mjs` | decisionFiles from a relative root cuts paths | frozen-citations |
| U2 | `freeze-capture.mjs` | urls.txt read as a capture | frozen-citations |
| U3 | `freeze-capture.mjs` | a JSON line's reference carried to the next line | frozen-citations |
| U4 | `freeze-capture.mjs` | a reference carried after a short name's html reference keeps html | frozen-citations |
| N1 | `freeze-capture.mjs` | no note marks | frozen-citations |
| N2 | `freeze-capture.mjs` | "note's" not a note mark | frozen-citations |
| N3 | `freeze-capture.mjs` | "(note" at the end of a line not a note mark | frozen-citations |
| N4 | `freeze-capture.mjs` | code back in the decision files | frozen-citations |
| G1 | `wall-art-pod.md` | wall-art-pod §4 names the live Terms again | frozen-citations |
| G2 | `displate-about-regulations-2026-09-28.txt` | a frozen copy's cited line rewritten | frozen-citations |
| G3 | `FROZEN.sha256` | a frozen file's FROZEN.sha256 line removed | frozen-citations |
| G4 | `polar-rail.md` | polar-rail's fees header names the 29.9 copy again | frozen-citations |
| G5 | `html5-syndication.md` | html5-syndication:169 names the copy whose datetime is at :714 | frozen-citations |
| G6 | `TERMS-AUDIT-2026-09-29.md` | TERMS-AUDIT cites the renamed slug line of the IRS meta | frozen-citations |
| G7 | `actions-spending-limit.md` | R-SB:335 left bare (read as a line of the capture before it) | frozen-citations |
| G8 | `TERMS-AUDIT-2026-09-29.md` | TERMS-AUDIT:120 html line 137 left on the live capture | frozen-citations |
| G9 | `eaa-occupancy.md` | eaa-occupancy names the live store listing again | frozen-citations |
| G10 | `polar-fees-2026-09-28.meta.json` | a frozen copy's meta loses its frozen block | frozen-citations |
| G11 | `RULING-2026-09-29-loop.md` | a citation of a frozen copy not on disk | frozen-citations |
| G12 | `teacher-and-ebook-stores.md` | D2D named live again where its bare lines are cited | frozen-citations |
| G13 | `render-report.json` | the t1 render report names a card it was not written against | frozen-citations |
| G14 | `wall-art-pod.md` | wall-art-pod:8's menu lines named by the short faq again | frozen-citations |


### ציטוטים שלא הופנו

- לפי שורה: אין. אף ציטוט לפי שורה לא נשאר unknown, split או invalid. את ה-unknown היחיד (eaa-occupancy) הפניתי ביד אחרי בדיקת תוכן.
- בלי שורה: 18 האזכורים החיים בסעיף 4.

### DRIFTED שהופנו לגרסה שנכתבו מולה (44 ציטוטים, 118 טווחים)

- products/chart-explainer/releases/t1/render-report.json:160 `research/rendered/kokoro-82m-model-card.txt:233` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:233-233` txt: then "Synthetic audio [1] generated by closed [2] TTS models from large prov…"; now "Training Details"
- products/parent-guides/LICENSES.md:9 `research/rendered/kokoro-82m-model-card.txt:233` → `kokoro-82m-model-card-2026-09-28` (6 of 6 ranges):
  - `:233-233` txt: then "Synthetic audio [1] generated by closed [2] TTS models from large prov…"; now "Training Details"
  - `:245-245` txt: then "The following CC BY audio was part of the dataset used to train Kokoro…"; now "[2] No synthetic audio from open TTS models or \"custom voice clones\""
  - `:255-255` txt: then "Koniwa tnc"; now "Audio Data"
  - and 3 more
- research/breadth/scouts/education.json:3 `research/rendered/apify-store-accessibility.json:62192` → `apify-store-accessibility-2026-09-22` (1 of 1 ranges):
  - `:62192-62192` json: then "        \"title\": \"Coursera Courses Scraper - Online Course Data\","; now "        \"name\": \"zillow-market-data-scraper\","
- research/channel-loop/RULING-2026-09-29-loop.md:149 `displate-about-regulations.txt:471` → `displate-about-regulations-2026-09-28` (2 of 2 ranges):
  - `:471-471` txt: then "The Service Provider reserves the right to delete Accounts and to with…"; now "c) keep the Password confidential and not to disclose it to others."
  - `:561-561` txt: then "a) use the Website in a way that does not distort its functioning, in …"; now "In accordance with Displate's zero tolerance policy for intellectual p…"
- research/channel-loop/SITTING-2026-09-29-BRIEF.md:107 `displate-about-regulations.txt:471` → `displate-about-regulations-2026-09-28` (4 of 4 ranges):
  - `:471-471` txt: then "The Service Provider reserves the right to delete Accounts and to with…"; now "c) keep the Password confidential and not to disclose it to others."
  - `:561-561` txt: then "a) use the Website in a way that does not distort its functioning, in …"; now "In accordance with Displate's zero tolerance policy for intellectual p…"
  - `:98-98` txt: then "Artist - a natural person engaged in business activity, an unincorpora…"; now "Terms of Use of www.displate.com"
  - and 1 more
- research/channel-loop/ZERO-TESTS.md:115 `gamedistribution-sdk-implementation.html:1194` → `gamedistribution-sdk-implementation-2026-09-28` (1 of 1 ranges):
  - `:1194-1194` html: then "    <a href=\"/GameDistribution/GD-HTML5/wiki/F.A.Q.\" data-view-compone…"; now "</button>"
- research/channel-loop/ZERO-TESTS.md:143 `displate-about-regulations.txt:116` → `displate-about-regulations-2026-09-28` (1 of 1 ranges):
  - `:116-116` txt: then "Privacy Policy - a document available at https://displate.com/about-pr…"; now "Name (login) - a sequence of signs, including alphanumeric, necessary …"
- research/channel-loop/ZERO-TESTS.md:149 `displate-com-about-privacy.html:115` → `displate-com-about-privacy-2026-09-28` (1 of 1 ranges):
  - `:115-115` html: then "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"; now "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"
- research/faceless-youtube/PREREG-DECISIONS.md:277 `research/rendered/kokoro-82m-model-card.txt:237` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:237-237` txt: then "[2] No synthetic audio from open TTS models or \"custom voice clones\""; now "Public domain audio"
- research/faceless-youtube/PREREG-DECISIONS.md:312 `kokoro-82m-model-card.txt:237` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:237-237` txt: then "[2] No synthetic audio from open TTS models or \"custom voice clones\""; now "Public domain audio"
- research/faceless-youtube/PREREG-DECISIONS.md:413 `kokoro-82m-model-card.txt:225-260` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:225-260` txt: then "Training Details\n\nData: Kokoro was trained exclusively on permissive/n…"; now "Architected by: Li et al @ https://github.com/yl4579/StyleTTS2\n\nTraine…"
- research/faceless-youtube/RED-TEAM.md:220 `kokoro-82m-model-card.txt:233` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:233-233` txt: then "Synthetic audio [1] generated by closed [2] TTS models from large prov…"; now "Training Details"
- research/faceless-youtube/REGRADE.md:104 `research/rendered/kokoro-82m-model-card.txt:97` → `kokoro-82m-model-card-2026-09-25` (5 of 6 ranges):
  - `:97-97` txt: then "This is an Apache-licensed model, and Kokoro has been deployed in nume…"; now "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"
  - `:89-89` txt: then "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"; now ""
  - `:97-97` txt: then "This is an Apache-licensed model, and Kokoro has been deployed in nume…"; now "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"
  - and 2 more
- research/faceless-youtube/REGRADE.md:110 `research/rendered/kokoro-82m-model-card.txt:53` → `kokoro-82m-model-card-2026-09-25` (1 of 2 ranges):
  - `:83-84` txt: then "language:\n- en"; now "\nCopy curl command curl -L -o README.md https://huggingface.co/hexgrad…"
- research/faceless-youtube/REGRADE.md:114 `research/rendered/kokoro-82m-model-card.txt:89` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:89-89` txt: then "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"; now ""
- research/faceless-youtube/REGRADE.md:126 `research/rendered/kokoro-82m-model-card.txt:245-267` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:245-267` txt: then "The following CC BY audio was part of the dataset used to train Kokoro…"; now "[2] No synthetic audio from open TTS models or \"custom voice clones\"\n\n…"
- research/faceless-youtube/REGRADE.md:127 `research/rendered/kokoro-82m-model-card.txt:95` → `kokoro-82m-model-card-2026-09-25` (1 of 1 ranges):
  - `:95-95` txt: then "As of April 2025, the market rate of Kokoro served over API is under $…"; now "pipeline_tag: text-to-speech"
- research/faceless-youtube/REGRADE.md:128 `research/rendered/kokoro-82m-model-card.txt:83-84` → `kokoro-82m-model-card-2026-09-25` (3 of 3 ranges):
  - `:83-84` txt: then "language:\n- en"; now "\nCopy curl command curl -L -o README.md https://huggingface.co/hexgrad…"
  - `:133-139` txt: then "v1.0\n\n2025 Jan 27\n\nFew hundred hrs\n\n8 & 54"; now "Published\n\nTraining Data\n\nLangs & Voices\n\nSHA256"
  - `:221-221` txt: then "Languages: Multiple"; now "ISTFTNet: https://arxiv.org/abs/2203.02395"
- research/faceless-youtube/VERDICT.md:65 `research/rendered/kokoro-82m-model-card.txt:53` → `kokoro-82m-model-card-2026-09-25` (1 of 2 ranges):
  - `:97-97` txt: then "This is an Apache-licensed model, and Kokoro has been deployed in nume…"; now "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"
- research/faceless-youtube/VERDICT.md:147 `kokoro-82m-model-card.txt:53` → `kokoro-82m-model-card-2026-09-25` (2 of 3 ranges):
  - `:97-97` txt: then "This is an Apache-licensed model, and Kokoro has been deployed in nume…"; now "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"
  - `:95-95` txt: then "As of April 2025, the market rate of Kokoro served over API is under $…"; now "pipeline_tag: text-to-speech"
- research/faceless-youtube/VERDICT.md:328 `kokoro-82m-model-card.txt:53` → `kokoro-82m-model-card-2026-09-25` (1 of 2 ranges):
  - `:97-97` txt: then "This is an Apache-licensed model, and Kokoro has been deployed in nume…"; now "Kokoro is an open-weight TTS model with 82 million parameters. Despite…"
- research/measurements/html5-syndication.md:169 `gamedistribution-sdk-implementation.txt:154` → `gamedistribution-sdk-implementation-2026-09-28` (1 of 9 ranges):
  - `:713-713` html: then "        serdarakay edited this page <relative-time datetime=\"2021-12-0…"; now "      <div class=\"mt-2 mt-md-1 tmp-pb-3 gh-header-meta\">"
- research/measurements/html5-syndication.md:187 `gamedistribution-sdk-implementation.html:1194` → `gamedistribution-sdk-implementation-2026-09-28` (1 of 1 ranges):
  - `:1194-1194` html: then "    <a href=\"/GameDistribution/GD-HTML5/wiki/F.A.Q.\" data-view-compone…"; now "</button>"
- research/measurements/html5-syndication.md:220 `gamedistribution-wiki-faq.txt:154` → `gamedistribution-wiki-faq-2026-09-28` (2 of 5 ranges):
  - `:713-713` html: then "        Arthur Hulsman edited this page <relative-time datetime=\"2018-…"; now "      <div class=\"mt-2 mt-md-1 tmp-pb-3 gh-header-meta\">"
  - `:100-104` html: then "<link crossorigin=\"anonymous\" media=\"all\" rel=\"stylesheet\" href=\"https…"; now "<script crossorigin=\"anonymous\" type=\"module\" src=\"https://github.gith…"
- research/measurements/step2-cost.md:21 `btl-not-working-rates.txt:347-352` → `btl-not-working-rates-2026-09-27` (1 of 1 ranges):
  - `:347-352` txt: then "מי שאינו עובד ואין לו הכנסות חייבות בדמי ביטוח, חייב לשלם דמי ביטוח לא…"; now "\nהזמנת אשורים\n\nטפסים\n\nמחשבונים"
- research/measurements/step2-cost.md:25 `btl-self-employed-rates.txt:410` → `btl-self-employed-rates-2026-09-27` (3 of 3 ranges):
  - `:410-410` txt: then "מי שהכנסתו נמוכה מ- 3,442 ש\"ח לחודש, ישלם דמי ביטוח מהכנסה מזערית."; now "מקבל פנסיה בפרישה מוקדמת"
  - `:366-380` txt: then "על הכנסה חודשית 7,703 ש\"ח - (שיעור מופחת)\n\n​על הכנסה חודשית מעל 7,703 …"; now "\nשירות אישי לעו\"ס\n\nדבר המנכל\n\nטופס ויתור סודיות\n\nרישום לעו\"ס ישיר\n\nהגש…"
  - `:412-412` txt: then "החל מ- 01.01.2026"; now "מי שנמצא בהכשרה מקצועית"
- research/measurements/step2-cost.md:55 `research/rendered/btl-employee-and-self-employed.txt` → `btl-employee-and-self-employed-2026-09-28` (2 of 2 ranges):
  - `:347-347` txt: then "עובד עצמאי שהוא גם עובד שכיר ישלם דמי ביטוח מכל הכנסותיו עד להכנסה המר…"; now ""
  - `:348-349` txt: then "על הכנסתו כעובד שכיר ישלם דמי ביטוח בשיעורים המפורטים כאן.\nעל הכנסתו כ…"; now "חוקים ונהלים\n"
- research/measurements/step2-cost.md:61 `btl-self-employed-rates.txt:410` → `btl-self-employed-rates-2026-09-27` (1 of 1 ranges):
  - `:410-410` txt: then "מי שהכנסתו נמוכה מ- 3,442 ש\"ח לחודש, ישלם דמי ביטוח מהכנסה מזערית."; now "מקבל פנסיה בפרישה מוקדמת"
- research/measurements/step2-cost.md:77 `btl-not-working-rates.txt:347-352` → `btl-not-working-rates-2026-09-27` (1 of 1 ranges):
  - `:347-352` txt: then "מי שאינו עובד ואין לו הכנסות חייבות בדמי ביטוח, חייב לשלם דמי ביטוח לא…"; now "\nהזמנת אשורים\n\nטפסים\n\nמחשבונים"
- research/measurements/step2-cost.md:79 `btl-self-employed-rates.txt:410` → `btl-self-employed-rates-2026-09-27` (2 of 2 ranges):
  - `:410-410` txt: then "מי שהכנסתו נמוכה מ- 3,442 ש\"ח לחודש, ישלם דמי ביטוח מהכנסה מזערית."; now "מקבל פנסיה בפרישה מוקדמת"
  - `:366-380` txt: then "על הכנסה חודשית 7,703 ש\"ח - (שיעור מופחת)\n\n​על הכנסה חודשית מעל 7,703 …"; now "\nשירות אישי לעו\"ס\n\nדבר המנכל\n\nטופס ויתור סודיות\n\nרישום לעו\"ס ישיר\n\nהגש…"
- research/measurements/step2-cost.md:93 `research/rendered/btl-who-is-exempt.txt` → `btl-who-is-exempt-2026-09-28` (2 of 2 ranges):
  - `:543-543` txt: then "אתר זה כולל מידע כללי, אין להתייחס למידע זה כנוסח מחייב של החוק."; now (past the end)
  - `:363-363` txt: then "מי שהוא אחד מאלה, ואין לו הכנסות מעבודה וממקורות אחרים, או שיש לו הכנס…"; now ""
- research/measurements/step2-cost.md:116 `btl-not-working-rates.txt:347-352` → `btl-not-working-rates-2026-09-27` (1 of 1 ranges):
  - `:347-352` txt: then "מי שאינו עובד ואין לו הכנסות חייבות בדמי ביטוח, חייב לשלם דמי ביטוח לא…"; now "\nהזמנת אשורים\n\nטפסים\n\nמחשבונים"
- research/measurements/wall-art-pod.md:26 `displate-com-about-copyright.txt:93` → `displate-com-about-copyright-2026-09-28` (2 of 2 ranges):
  - `:93-93` txt: then "Displate is a community built upon respect for artists and their intel…"; now "Respect for Intellectual Property"
  - `:97-97` txt: then "In accordance with Displate's zero-tolerance policy for intellectual p…"; now "If you believe in good faith that any content or products made availab…"
- research/measurements/wall-art-pod.md:139 `displate-about-regulations` → `displate-about-regulations-2026-09-28` (41 of 51 ranges):
  - `:90-945` txt: then "Terms of Use\n\nTerms of Use of www.displate.com\n\nThe Service Provider's…"; now "✦\n✦\n\nDisplate Club\nSupport Contact us About us\n\nTerms of Use\n\nTerms of…"
  - `:945-945` txt: then "These Terms of Use come into force on the 15 of July 2026."; now "In case of the amendment of Terms of Use, the Service Provider shall n…"
  - `:640-640` html: then "</ol></div></ol></li></ol></div></div></div></div></main><footer class…"; now "</ol></div></ol></li></ol></div></div></div></div></main><footer class…"
  - and 38 more
- research/measurements/wall-art-pod.md:290 `displate-com-about-privacy` → `displate-com-about-privacy-2026-09-28` (4 of 26 ranges):
  - `:115-115` html: then "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"; now "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"
  - `:115-115` html: then "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"; now "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"
  - `:115-115` html: then "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"; now "      </script><link rel=\"stylesheet\" href=\"https://assets-static-prod…"
  - and 1 more
- research/owner-asks/brand-mailbox-questions.md:246 `displate-about-regulations.txt:447` → `displate-about-regulations-2026-09-28` (1 of 2 ranges):
  - `:447-447` txt: then "The User has the option to convert their Account and register as an Ar…"; now "The User may decide if the Account shall be visible for the Service Pr…"
- research/owner-asks/brand-mailbox-questions.md:279 `displate-about-regulations.txt:471` → `displate-about-regulations-2026-09-28` (5 of 5 ranges):
  - `:471-471` txt: then "The Service Provider reserves the right to delete Accounts and to with…"; now "c) keep the Password confidential and not to disclose it to others."
  - `:561-561` txt: then "a) use the Website in a way that does not distort its functioning, in …"; now "In accordance with Displate's zero tolerance policy for intellectual p…"
  - `:881-881` txt: then "The Service Provider reserves the right not to respond to messages, ap…"; now "The Service Provider allows appeals against its decisions, particularl…"
  - and 2 more
- research/owner-asks/brand-mailbox-questions.md:301 `displate-about-regulations.txt:277` → `displate-about-regulations-2026-09-28` (3 of 3 ranges):
  - `:277-277` txt: then "The Artist is solely responsible for the provided data (PayPal email a…"; now "f.The Artist is required to submit the payment request by the end of t…"
  - `:279-279` txt: then "At the time of pay-out, the Artist commits to provide basic and valid …"; now "The fee will be determined in accordance with the following rules. A b…"
  - `:455-455` txt: then "The initial displaying and publication of the Product Model on the Art…"; now "Future SMS verification may also apply to those users who have changed…"
- research/owner-asks/questions.json:128 `displate-about-regulations.txt:447` → `displate-about-regulations-2026-09-28` (1 of 1 ranges):
  - `:447-447` txt: then "The User has the option to convert their Account and register as an Ar…"; now "The User may decide if the Account shall be visible for the Service Pr…"
- research/owner-asks/questions.json:131 `displate-about-regulations.txt:116` → `displate-about-regulations-2026-09-28` (1 of 1 ranges):
  - `:116-116` txt: then "Privacy Policy - a document available at https://displate.com/about-pr…"; now "Name (login) - a sequence of signs, including alphanumeric, necessary …"
- research/owner-asks/questions.json:131 `displate-about-regulations.txt:471` → `displate-about-regulations-2026-09-28` (2 of 2 ranges):
  - `:471-471` txt: then "The Service Provider reserves the right to delete Accounts and to with…"; now "c) keep the Password confidential and not to disclose it to others."
  - `:561-561` txt: then "a) use the Website in a way that does not distort its functioning, in …"; now "In accordance with Displate's zero tolerance policy for intellectual p…"
- research/owner-asks/questions.json:141 `displate-about-regulations.txt:455` → `displate-about-regulations-2026-09-28` (1 of 1 ranges):
  - `:455-455` txt: then "The initial displaying and publication of the Product Model on the Art…"; now "Future SMS verification may also apply to those users who have changed…"
- research/tiktok/08-reads/tiktok-policy.md:186 `research/rendered/kokoro-82m-model-card.txt:237` → `kokoro-82m-model-card-2026-09-28` (1 of 1 ranges):
  - `:237-237` txt: then "[2] No synthetic audio from open TTS models or \"custom voice clones\""; now "Public domain audio"
- research/youtube-kids/RENDER-CHECK-2026-09-28.md:165 `kokoro-82m-model-card.txt:227` → `kokoro-82m-model-card-2026-09-28` (2 of 2 ranges):
  - `:227-227` txt: then "Data: Kokoro was trained exclusively on permissive/non-copyrighted aud…"; now "Trained by : @rzvzn on Discord"
  - `:233-233` txt: then "Synthetic audio [1] generated by closed [2] TTS models from large prov…"; now "Training Details"


### ציטוטים לפי שורה של לכידה פעילה ביומנים (לא נערכו; יומנים הם היסטוריה)

מכל אחד מצוין המצב לפי ההיסטוריה של שורתו, והעותק הקיים שמחזיק את השורות כפי שנכתבו:

- `logs/CHANNEL_LOOP.md` (6):
  - `:158` `amo-add-on-policies.txt:2051` (+`:2069`): same → `amo-add-on-policies-2026-09-28`
  - `:168` `displate-com-about-faq.txt:1048-1050` (+`:1207-1208`): changed → `displate-com-about-faq-2026-09-28`
  - `:168` `displate-about-regulations.txt:211-233` (+`:166, :277-279, :455, :471, :561, :138, :447, :98`): **drifted** → `displate-about-regulations-2026-09-28`
  - `:168` `displate-com-about-privacy.txt:103-107` (+`:123, :218`): changed → `displate-com-about-privacy-2026-09-28`
  - `:338` `terms-btl.txt:303`: same → `terms-btl-2026-09-29`
  - `:338` `terms-ypay.txt:55`: same → `terms-ypay-2026-09-29`
- `logs/CHECKPOINT.md`: אין (גם לא בעותק של ה-checkout הראשי, שהתקדם ל-`f2fca6d`).
- `logs/FABLE_QUEUE.md` (6):
  - `:38` `gamedistribution-sdk-implementation.txt:275`: changed → `gamedistribution-sdk-implementation-2026-09-28`
  - `:42` `gh-docs-actions-billing.txt:384`: same → `gh-docs-actions-billing-2026-09-29`
  - `:42` `gh-docs-set-up-budgets.txt:215` (+`:217, :237, :241`): same → `gh-docs-set-up-budgets-2026-09-29`
  - `:42` `gh-docs-budgets-and-alerts.txt:277`: same → `gh-docs-budgets-and-alerts-2026-09-29`
  - `:45` `terms-worksheets4kids.txt:195`: same → `terms-worksheets4kids-2026-09-29`
  - `:45` `terms-btl.txt:303`: same → `terms-btl-2026-09-29`


## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **שיפוט מחדש מהבסיס.** יצירת worktree מנותק ב-commit שלפני ההפניות, הרצת `citationVersion` בו, ובנייה מחדש של הקבצים כטקסט הבסיס מופנה. כדאי להפוך את זה לאפשרות `--cited --from-base <commit>` בכלי.
- **השוואת snapshot לפני/אחרי:** `snap.mjs` ו-diff מנורמל. כדאי מבחן או סקריפט קבוע שמשווה ציטוטים בין שני commits ומדווח רק על שינוי שאינו תאריך.
- **בדיקת עותק מול ה-commit שלו:** `copycheck.mjs`. אפשר לצרף ל-`checkManifest` בדיקה מול `git show <frozen.commit>`.
- **סריקת היומנים לציטוטים חיים** והתאמת עותק לכל אחד.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **קריאת הכלי והמבחנים במלואם** (כ-2,300 שורות) לפני כל שינוי. היה הכרחי, כי שני מתקנים נקטעו באמצע.
- **פלט תיקיית ה-scratchpad של הסשן** (מאות קבצים) ב-`ls` אחד, בלי סינון.
- **שלוש ריצות של `plan.mjs`** עד שרשימת השמירה נכונה: מפתח גס, ובעיית heredoc.
- **השוואת snapshot ראשונה לפי מיקום,** שהדפיסה עשרות זוגות שגויים.
- **סקר דפוסי "note" בנתונים** כדי לא להרחיב את החוק יותר מדי. הוא שווה את מחירו: שלושה מקרים של "note" של הדף היו נשברים.
