# Does owner step 2 cost the owner money? Bituach Leumi, read from the source

**Status: MOSTLY SETTLED 28.9.2026 (tick 4): the owner is not a salaried employee (their answer, 28.9 ~02:45 UTC), and Bituach Leumi's list of who is exempt from the minimum is now read. Step 2 adds about ₪0 a month unless the owner is in an exempt group; one optional, private yes/no question settles that (last section).** The first two pages were rendered from a GitHub runner (render-watch run 22,
commit `3d5772b`); Kol Zchut answered 403. The salaried page (tick 2) and the exemption page (tick 4) were rendered later.

**Why this was checked.** The owner's ₪0 rule (MISSION.md, 27.9.2026) says not even a shekel until the ledger shows
income. Step 2 (the עוסק פטור file and Bituach Leumi registration) is the only one of the seven steps that could create
a recurring charge by itself existing. So its cost is read from the source before the owner is asked.

## What was read

| Capture | fetchedAt | Status |
|---|---|---|
| `research/rendered/btl-self-employed-rates.txt` | 2026-09-27T22:46:07Z | 200 |
| `research/rendered/btl-not-working-rates.txt` | 2026-09-27T22:46:09Z | 200 |
| `research/rendered/kolzchut-employee-plus-self-employed` | 2026-09-27T22:46:10Z | **403**, not read |

## What the pages say [RENDERED]

1. **Someone who does not work and has no income already pays a minimum, business or not.**
   `btl-not-working-rates.txt:347-352`: "מי שאינו עובד ואין לו הכנסות חייבות בדמי ביטוח, חייב לשלם דמי ביטוח לאומי
   מינימליים: דמי ביטוח לאומי בסך 143 ש"ח לחודש … דמי ביטוח בריאות בסך 123 ש"ח לחודש … בסך הכל, מי שאינו עובד ואין לו
   הכנסות ישלם 266 ש"ח בחודש."
2. **A self-employed person with low income pays on a floor income, not on their actual income.**
   `btl-self-employed-rates.txt:410`: "מי שהכנסתו נמוכה מ- 3,442 ש"ח לחודש, ישלם דמי ביטוח מהכנסה מזערית."
   The reduced rate for the self-employed (up to ₪7,703 a month) is 4.47% national insurance plus 3.23% health, 7.7% in
   all (`:366-380`, in force from 1.1.2026, `:412`).
3. **Arithmetic, not quoted from the page:** 7.7% of ₪3,442 is ₪265.03 a month. So a recognised self-employed person
   with little or no income pays roughly the same ₪265-266 a month as someone who does not work at all.

## What this means for the owner [INFERENCE — check before relying on it]

- **If the owner does not work today:** they already owe about ₪266 a month by law, whatever the colony does. Opening
  the business file would not add a new monthly minimum while income stays low. It would replace one floor with a
  similar one. This is an inference from points 1-3. Bituach Leumi's status rules for who counts as self-employed have
  not been rendered.
- **If the owner is a salaried employee:** this case is NOT settled. The search snippet of 27.9 (ZERO-TESTS.md) said
  that self-employment income is charged "after taking into account" employee income. Whether the ₪3,442 floor applies
  to someone who is also salaried is on the page named below, which has not been read.
- **Either way, under the ₪0 rule:** step 2 is not asked for until a paid product is ready and a stranger has shown
  interest in one of the free surfaces. Free publishing needs no business file, because nothing is sold.

## The page that settles the salaried case (next render)

https://www.btl.gov.il/Insurance/National%20Insurance/type_list/%D7%A2%D7%95%D7%91%D7%93%20%D7%A9%D7%9B%D7%99%D7%A8%20%D7%95%D7%92%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%20%D7%A2%D7%A6%D7%9E%D7%90%D7%99/Pages/default.aspx
("עובד שכיר וגם עובד עצמאי — פירוט סוגי המעמד וחובת תשלום", Bituach Leumi). It is listed in `urls.txt` §12.

## Open question for the owner (optional, private)

Are you a salaried employee today? The answer decides which Bituach Leumi rule applies to step 2. Nothing else in the
plan needs it.

## Tick 2 (28.9.2026): the salaried-and-self-employed page, read

`research/rendered/btl-employee-and-self-employed.txt`, fetched 28.9.2026 00:52 UTC, status 200.

- `:347`: "עובד עצמאי שהוא גם עובד שכיר ישלם דמי ביטוח מכל הכנסותיו עד להכנסה המרבית לתשלום דמי ביטוח בסך 51,910 ש"ח (החל ב- 01.01.2026)."
- `:348-349`: on the salaried income, the salaried rates; on the self-employed income, the self-employed rates.

**What this settles and what it does not.** Someone salaried who also opens a business pays on each income at its
own rate [RENDERED]. The page does **not** say whether the ₪3,442 floor income (`btl-self-employed-rates.txt:410`)
applies to the self-employed part when the person is also salaried. So the salaried case is still **UNKNOWN**: the
cost could be close to ₪0 while income is ₪0, or about ₪265 a month. Nothing is told to the owner as fact.

**What settles it without another page:** the owner's answer to one question, whether they are salaried today,
plus Bituach Leumi's own calculator, which a person can run in a minute. The colony does not run the calculator: it
needs the person's own figures. Under the ₪0 rule, step 2 stays unasked until a paid product and a stranger's
interest exist.


## The owner's answer (28.9.2026, ~02:45 UTC): "אני לא שכיר"

The owner is not a salaried employee, so the salaried-and-self-employed case above does not apply.

**What follows [INFERENCE from the rendered pages, check before relying on it]:**
- Someone who does not work and has no income is already liable for the ₪266 monthly minimum
  (`btl-not-working-rates.txt:347-352`), business or not.
- A self-employed person with income under ₪3,442 a month pays on that floor: 7.7% × ₪3,442 ≈ ₪265
  (`btl-self-employed-rates.txt:410`, `:366-380`).
- So opening the עוסק פטור file replaces one monthly floor with a nearly equal one. **The expected added
  cost is about ₪0 a month**, which fits the ₪0 rule.

**The one gap.** Bituach Leumi exempts some groups that do not work from the minimum (for example
people in certain family or age situations). For someone in such a group, opening the file would add
about ₪265 a month. The rendered pages do not list those groups. The next render names Bituach
Leumi's own page on who is exempt; until then the claim above is stated as an inference, not a fact.

**Effect on the owner-ask batch.** Step 2 no longer waits on the salaried question. It still waits,
under the ₪0 rule, for a paid product that is ready to sell (`logs/CHANNEL_LOOP.md` §6 item 4).

## Tick 4 reading (28.9.2026): who is exempt from the minimum

`research/rendered/btl-who-is-exempt.txt`, fetched 2026-09-28T07:15:29Z, status 200 (meta alongside). The page's own
footer: "אתר זה כולל מידע כללי, אין להתייחס למידע זה כנוסח מחייב של החוק." (`:543`). In the HTML, items 1-5 below stand
alone; items 6-12 sit under one heading that conditions all of them (`:363`): "מי שהוא אחד מאלה, ואין לו הכנסות מעבודה
וממקורות אחרים, או שיש לו הכנסות ממקורות אחרים שאינן עולות על 5% מהשכר הממוצע - 688 ש"ח".

**The groups [RENDERED].** NI = national insurance, health = health insurance, silent = the page does not say.

| # | Group, quoted | Covers | Survives self-employment income? |
|---|---|---|---|
| 1 | `:353` "עקרת בית - אישה הנשואה למבוטח, או ידועה בציבור שבן זוגה מבוטח, שאינה עובדת מחוץ למשק ביתה." | silent | No [INFERENCE]: the condition is not working outside the household |
| 2 | `:355` "מקבל קצבת נכות מעבודה בשיעור של 100% לצמיתות, או מקבל קצבת נכות כללית בשיעור של 75% ומעלה" | NI only: "פטור מתשלום דמי ביטוח לאומי מהקצבה ומהכנסה שלא מעבודה" | Partly: `:356` "אם הוא עובד כעצמאי - עליו לשלם דמי ביטוח לאומי לענף נפגעי עבודה, וכן לשלם דמי ביטוח בריאות." |
| 3 | `:358` "חייל בשירות סדיר , שאינו עובד לא כשכיר ולא כעצמאי" | silent | No (in the condition) |
| 4 | `:359` "תושב ישראל השוהה במדינת אמנה, ששילם דמי ביטוח לאומי במדינת האמנה" | NI only: "ואולם, חלה עליו חובת תשלום דמי ביטוח בריאות בתקופה הזאת." | silent (tied to paying in the treaty state, not to not working) |
| 5 | `:361` "אסיר המרצה עונש מאסר בחו"ל, שאינו עובד ואין לו הכנסות." | silent | No (in the condition) |
| 6 | `:365` "מי שמקבל קצבה מהביטוח הלאומי או מהגופים המנויים בסעיף 350 לחוק הביטוח הלאומי (חוץ ממי שמקבל דמי אבטלה עבור חודש מלא)." | silent | No (`:363`) |
| 7 | `:366` "חייל משוחרר, מסיים שירות לאומי או שירות אזרחי - יהיו זכאים לפטור מתשלום דמי ביטוח למשך חודשיים מתום השירות" | silent | No (`:363`); two months only |
| 8 | `:367` "עולה חדש (כולל קטין חוזר …) - יהיה זכאי לפטור לתקופה של עד 12 חודשים מיום עלייתו לארץ." | silent | No (`:363`); up to 12 months |
| 9 | `:368-369` "מי שמלאו לו 18 שנים ויתגייס לצה"ל או ישרת בשירות לאומי או אזרחי לפני גיל 21"; `:371`, enlisting at 21-22: "יהיה זכאי בתנאים מסוימים לפטור מתשלום דמי ביטוח לתקופה מגיל 18 עד לגיל 21" | silent | No (`:363`); until service starts |
| 10 | `:374` "מי שמלאו לו 18 שנים ולא יתגייס לצה"ל או יתנדב לשירות לאומי, והוא לומד עדיין במוסד חינוכי על-יסודי עד כיתה י"ב" | silent | No (`:363`); not after age 19 |
| 11 | `:377` "מי שרשום בשירות התעסוקה כמחוסר עבודה ולא מקבל דמי אבטלה - פטור מתשלום דמי ביטוח לאומי (לא כולל דמי ביטוח בריאות)" | NI only | No (`:363`); up to 12 months in two tax years |
| 12 | `:381` "עובד שכיר שלא יכול לעבוד עקב מחלה, תאונה, שביתה מאורגנת או אבל במשפחתו" | NI only: "יהיה פטור מתשלום דמי ביטוח לאומי בלבד" | Not relevant: the owner is not salaried |

"Silent" rows say "דמי ביטוח" without splitting NI from health. Where an exemption is NI-only, the person already pays
health, ₪123 a month at the minimum (`btl-not-working-rates.txt:347-352`).

**What this means for step 2 [INFERENCE, check before relying on it]:**
- Items 1, 3, 5 and the `:363` heading end the exemption once there is income from work. Sales from a business are
  income from work, so these people move onto the self-employed floor: 7.7% × ₪3,442 ≈ ₪265 a month.
- **Step 2 would add about ₪265 a month, which conflicts with the ₪0 rule,** for items 1, 3, 5 and 6. For items 7-10 it
  adds that only for the exempt months that remain. If a "silent" exemption turns out to cover NI only, the added cost is lower.
- **Adds less, but not ₪0:** item 11 already pays health, so about ₪265 − ₪123 ≈ ₪142 a month (arithmetic) for the
  exempt months left. Item 2 adds the work-injury branch plus health (`:356`); no rendered page gives the amount.
  Item 4: unknown, the page does not say.
- **Everyone else, meaning anyone liable for the ₪266 minimum today, would pay about ₪0 extra.** This is the earlier
  section's rule.
- The `:363` condition is about income, not registration. The page does not say whether an open file with ₪0 of sales
  already ends these exemptions. Step 2 is asked only when a sale is near, so assume that it does.

**The one question (optional, private, yes/no):**
"Are you exempt from paying Bituach Leumi contributions today?" (Hebrew: "האם כיום יש לך פטור מתשלום דמי ביטוח לאומי?")
- **No**, meaning paying or liable to pay: step 2 adds about ₪0 a month.
- **Yes:** step 2 may add up to about ₪265 a month while the exemption would otherwise have lasted. Bituach Leumi's own
  calculator gives the exact figure privately.

The owner does not need to say which group. The question can wait: under the ₪0 rule, step 2 is not asked for until a paid
product is ready to sell.
