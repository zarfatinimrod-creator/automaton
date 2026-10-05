# סבב 46 של לולאת הערוצים — ישיבת Fable: שורות 19 ו-20 (5.10.2026, ~07:11-~08:55 UTC)

## 1. מה המשתמש ביקש
הוראת הבעלים הקבועה (27.9): ערוצים בלי הפסקה, ב-₪0; "תמשיך בfable". טיק הרוטינה של 07:11 הוא ישיבת ה-Fable היומית (§10 של סבב 45): probe במילה אחת, שתי שורות (19 ו-20) כשני סוכני Fable על בסיס התקציר של סבב 41, קיפול על Opus.

## 2. הפעולות המרכזיות שביצעתי
- **בדיקה (07:11):** main והענף זהים (`56d4c66`); אין PR פתוח; MoneyPrinterTurbo#1 ללא שינוי מ-25.9; אין הודעת בעלים; דיסק 19 GB פנויים.
- **Fable probe** (Agent tool, `model: fable`, "OK"): ענה ב-~9 שניות (07:14). נרשם בטבלת ה-probe ב-FABLE_QUEUE.
- **שני סוכני Fable במקביל** (Agent tool, `model: fable`, רקע), כל אחד קרא `MISSION.md`, את בלוקי הכותרת של `SITTING-2026-10-05-BRIEF.md`, את החלק שלו (A/B) ואת חלק C, ואת מקורות השורה; כל אחד כתב קובץ הכרעה אחד בלי git:
  - **שורה 19** → `research/channel-loop/RULING-2026-10-05-vat-services.md` (619 שורות, ~27 דקות, ~324k): תקנה 6א(1) והגפה השנייה של תקנת הרישום 13(1) לא מגיעות לשום קו [הסקה על הגדרות "מכר" ו"שירות" בחוק מע"מ המוקפא `nevo-vat-law-2026-09-29.txt:75`, `:125`, `:45`]: תמלוגים על זכות ביצירה גמורה הם מכר ולא שירות שבוצע למשלם. Indiebook (שורה 22) ו-Teach Simple (שורה 28) ללא שינוי + תנאי קבלה ₪0 (קריאת מסגור התשלום בהסכם לפני ההעלאה הראשונה); מדריכי הורים, T1/kids-explainers, Pro, apify-actors, pcn874 ללא שינוי; oss-bounties שונה-מבנה ב-₪0 (כלל דילוג ב-`scoreBounty` על באונטי כתיבה/תרגום בלבד; מונה ההיצע לא נגע). צעד 2 אושר: שורת העיסוק, שומר הסיווג וסעיף תקנה 22(2) עומדים כהסקה; ה-PDF תואם. §6 פריט 5 תוקן. אין שאלה לבעלים.
  - **שורה 20** → `research/channel-loop/RULING-2026-10-05-refund-state.md` (500 שורות, ~22 דקות, ~298k): מסלול (ii) — מצב ההמתנה הוא `\Flagged` על בקשת הקונה בתיבת המותג, עם `\Answered` ב-STORE אחד אחרי מענה ההמתנה; `state/colony/refund-retries.json` בוטל (מעולם לא הגיע לקומיט — `git log --all` ריק); החזרה מריצה שוב `refund --email <sender> --requested-at <INTERNALDATE>`; שום מזהה מכירה או כתובת לא נשמרים ולא מודפסים (גם לא ביומן ה-Actions הציבורי); `--sale` נפרש; `already-refunded` נוסף. (b) הטוקן `contents: write` של ה-responder הוסר; ה-workflow על `contents: read`, `send` ו-`probe` על `write`; ה-pin של ה-probe דורש `contents: read`. **נמצא:** `colony.yml` מקמיט את `colony.db` עם `sale.id` הגולמי כ-`external_id` לכל מכירה — `enable` מחכה לשורה 26 החדשה.
- **קיפולי Opus (שני workflows במקביל, בונה-סוקר-מתקן כל אחד, worktrees נפרדים):**
  - שורה 20 (`wf_3900624b-4e4`): §8 פריטים 1-11, 13, 14. הסוקר מצא 3 פגמים (המכירה החדשה ביותר בחלון קובעת `already-refunded`; כוכב של אדם על בקשה שלא נענתה נקרא כהמתנה — החיפוש הפך `FLAGGED ANSWERED` ולולאה נפרדת `FLAGGED NOT ANSWERED`; כתובת שאינה של השולח הודפסה — `redact_addresses` על כל שורה). כולם תוקנו test-first; 15 + 5 מוטציות נהרגו; Python 137, il-biz-tools 887. מיזוג `8f43a6a`.
  - שורה 19 (`wf_6d779b86-9a9`): §9 פריטים 8-10. הסוקר מצא 6 ממצאים (שומר עוקף דרך `selectBounties` → whitelist על גרף הייבוא; תבנית תרגום בלי צורות נטויות → הורחבה; חצי מהכלל לא נעוץ → בדיקות גוף-בלבד וכתיב בריטי; דילוג על באג קוד באתר docs בלי שפה; רשומות סחף חלקיות; רשימת הכללים בראש הקובץ). 5 תוקנו; ממצא 4 נשמר בהכרעת ה-thread הראשי (שמרני, נעוץ בבדיקה) אבל מחרוזת הסיבה שונתה כך שלא תטען "text only" על באג קוד (מתקן Opus נוסף, `3a304c4`). 10 + 9 מוטציות נהרגו. מיזוג `3e76ff3`.
- **הכרעות ה-thread הראשי (Fable) בקיפולים:** (א) תבנית התרגום הרחבה (`translat(e[ds]?|ions?|ing)|locali[sz](...)|l10n`) התקבלה — כוונת ההכרעה משורתת טוב יותר; (ב) דילוג על באג קוד באתר docs בלי שפה נשאר (שמרני; המחיר — באונטי דו-משמעי אחד שמוחמץ), ומחרוזת הסיבה אומרת רק מה נמצא; (ג) `FLAGGED ANSWERED` במקום `FLAGGED` המילולי של §8 פריט 3 — מוצדק ב-§5(a)2 של ההכרעה.
- **קבצי הלולאה (loop-edit בלבד):** §0 (Last tick, שורת Fable), §3 (Pro: ההחזקה עברה משורה 20 לשורה 26; oss-bounties), §4 שורות 15, 18, 22, 24, 28, §6 פריט 5 (המשפט המיושן על "פעם בשנה" הוחלף), §8 (שורות 8-20 ו-23 בוצעו), §9 ("Fixed in tick 46"), §10 (סבב 47); FABLE_QUEUE: שורות 19 ו-20 סטטוס, שורה 26 חדשה, שורת probe. CHECKPOINT; יומן זה.

## 3. קבצים/מערכות ששונו
- חדש: `research/channel-loop/RULING-2026-10-05-vat-services.md`, `RULING-2026-10-05-refund-state.md`; `logs/2026-10-05-channel-loop-tick-46-refund-state-fold.md`, `-vat-services-fold.md`, יומן זה.
- קוד: `scripts/brand_mail.py`, `.github/workflows/brand-mail.yml`, `products/il-biz-tools/scripts/gumroad-pro-product.js`, `products/il-biz-tools/README.md`, `scripts/tests/test_brand_mail_refunds.py`, `src/__tests__/revenue/brand-mail-workflow.test.ts`, `products/il-biz-tools/tests/gumroad-pro-product.test.js`; `src/revenue/bounties/intake.ts`, `src/__tests__/revenue/bounties-intake.test.ts`, `src/revenue/portfolio.ts`, `skills/revenue-oss-bounties/SKILL.md`; `research/measurements/osek-patur-documents.md`, `indiebook.md` (תוספות בלבד).
- לולאה: `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `logs/CHECKPOINT.md`.
- לא שונה: `docs/OWNER_STEPS.he.md`, `owner-steps.ts`, ה-PDF (ההכרעה אישרה אותם); `supply.ts`, `algora-supply.ts`.

## 4. החלטות והנחות משמעותיות
- **ההכרעות על Fable, הקיפולים על Opus** — לפי כלל הניתוב; ה-thread הראשי (Fable) פסק בשלוש סטיות של הקיפולים מהטקסט המילולי (§2).
- **שום קו לא נרשם כעוסק מורשה ולא נהרג**; שינוי המבנה היחיד הוא ב-₪0 (כלל דילוג בקוד).
- **פרטיות הקונה כקו אדום** (הכרעת שורה 20): שום מזהה קונה או מכירה לא יוצא מזיכרון ה-responder למקום שצד שלישי קורא — ציבורי או פרטי; לכן גם `colony.db` הופך שאלה (שורה 26) ו-`enable` מחכה.
- **שורה 26 לישיבת 8.10 ולא לתיקון מיידי:** `enable` חסום בכל מקרה בצעדי בעלים 8, 3, 6, 2; אין תועלת בהכרעה חפוזה.

## 5. שגיאות וניסיונות שנכשלו
- ה-thread הראשי קימט את הגרסה הראשונה של הכרעת שורה 19 (`5c4bad0`, 609 שורות) בלחץ ה-stop hook, בעוד הסוכן עדיין תיקן שמונה מצביעים; הגרסה המתוקנת (619 שורות, §8.4 שלה) נכנסה ב-`b83f41a`. הבונה של הקיפול פתח worktree על הגרסה הישנה ומצא את השורות שזזו ב-`grep -n -F`. לקח: לא לקמוט קובץ של סוכן רץ לפני ה-hand-back.
- `loop-edit insert-after` עם עוגן שמתחיל ב-"-" נדחה (usage) — צריך צורת `--anchor=`.
- שני ה-worktrees נפתחו על בסיס ישן (`56d4c66`) ואופסו לפי ההנחיה (סבב שביעי ברצף).

## 6. בדיקות ופעולות ולידציה
- מיזוגים דרך `scripts/merge-worktree.sh`: שורה 19 — verify exit 0 (71 קבצים, 2,345 בדיקות); שורה 20 — verify exit 0 (2,342). אחרי המיזוג השני, ב-checkout הראשי: `python -m unittest` 137 OK (exit 0); il-biz-tools `npx vitest run` 32 קבצים, 887 (exit 0).
- מוטציות: שורה 19 — 10 (בונה) + 9 (מתקן); שורה 20 — 15 (בונה) + 5 (מתקן) — כולן נהרגו, כולל אלה ששרדו בסקירה (V1-V3 של שורה 19).
- `freeze-capture.mjs --cited` 0 בשני ה-worktrees; grep למזהי הבעלים: 0 בכל הקבצים שנגעו בהם; grep לכתובות דוא"ל/מזהי מכירה בשורות שנוספו (קבצים שאינם בדיקות): 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- ה-worktree של כל בונה נפתח על בסיס ישן — שבעה סבבים ברצף; הברייף כבר מורה על reset. כדאי ש-`merge-worktree.sh` או hook ייצרו את ה-worktree מראש הענף.
- קריאת תוצאות workflow מה-output file דורשת פענוח JSON עם קידומת — שורת python שחוזרת כל סבב; מתאים לסקריפט קטן `scripts/wf-result.mjs`.
- מסנן ה-dispatch לפי `termsGate` (§9 5.10 פריט 2) — יידרש כבר בסבב 47.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- Fable: probe ~82k (כולל ה-system prompt של הסוכן), שורה 19 ~324k, שורה 20 ~298k — כ-704k אסימוני Fable, בלי 429.
- Opus: קיפול שורה 20 ~940k (3 סוכנים); קיפול שורה 19 ~651k (3) + מתקן הניסוח ~113k — כ-1.7M.
- בזבוז: קומיט מוקדם של הכרעת שורה 19 שגרר קומיט תיקון; הקיפול של שורה 19 קרא גרסה עם מצביעים ישנים (עלות קטנה: grep). ה-stop hook דחק לקמוט קובץ של סוכן רץ.
