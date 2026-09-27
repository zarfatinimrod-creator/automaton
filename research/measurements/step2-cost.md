# Does owner step 2 cost the owner money? Bituach Leumi, read from the source

**Status: PARTLY MEASURED 27.9.2026.** Two of the three pages were rendered from a GitHub runner (render-watch run 22,
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
