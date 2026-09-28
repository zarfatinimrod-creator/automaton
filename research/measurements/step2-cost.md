# Does owner step 2 cost the owner money? Bituach Leumi, read from the source

**Status: MOSTLY SETTLED 28.9.2026: the owner is not a salaried employee (their answer, 28.9 ~02:45 UTC). One gap remains, below.** Two of the three pages were rendered from a GitHub runner (render-watch run 22,
commit `3d5772b`). Kol Zchut answered 403, and the page that settles the salaried-employee case has not been rendered yet.

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
