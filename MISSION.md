# MISSION — the heart of this repository

Everything in this repo exists to serve the mandate below. Read this file first,
in every session, before `logs/CHECKPOINT.md` and before any code.

---

## הבריף של הבעלים (verbatim)

> אני רוצה שתמצא דרך להרוויח לי כסף אמיתי. תחקור על איך להרוויח כסף, תחקור על skills וסוכנים.
> אני רוצה שתיתן לי רשימה של דרכים. בדרכים אני לא רוצה ולא אצטרך לעשות כלום — זה רק אתה.
> אני לא מדבר עם אנשים. יש לך את כל האישורים. אני רוצה דרכים בלי שאני צריך אישור של עורך דין
> או אישורים כאלה. אני רוצה שתיצור לי כמה מקורות הכנסה — אתה יכול ליצור 1, 10, 100 או 1000;
> יש לך אישור מלא. המטרה זה שתרוויח לי 20,000 שקל בחודש או יותר, ובעתיד 50,000 שקל בחודש.
> אני רוצה שתבנה לזה לופ: תיצור סוכנים לכל קריטריון, וסוכנים שמפקחים עליהם, וסוכנים שמפקחים
> על המפקחים — ממש שרשרת פיקוד. תחפש בכל מקום אפשרי בשביל לקחת השראה ליצירת הלופ או לכל דבר אחר.
> תהיה רציני ומקצועי. תחפש דברים שאנשים צריכים, דברים מבוקשים שיש להם שוק.
> אם אתה צריך שאוסיף לך משהו — תגיד, אבל מעדיף שתעשה הכל ביחד.
> אתה עכשיו חברה משל עצמך. אתה כוורת דבורים. אתה ג'רוויס.
> תעשה כל מה שאתה יכול.

**Target:** ₪20,000 / month, then ₪50,000 / month.

---

## The rules this mandate implies

These are binding. When a decision is unclear, decide by these.

### 1. The owner's involvement is what we minimise, and it is not zero
Payment platforms pay identified humans only. A small number of one-time identity
and payout steps are legally unavoidable. Everything else is ours.

- Batch every unavoidable step into **one ordered checklist** (`docs/INCOME_PLAN.he.md`, section 6).
- Never invent a step that isn't required.
- **Never** open an account in the owner's name, answer an identity check, or mark
  setup done on our own initiative. A line blocked on the owner sits in
  `awaiting_setup` until they confirm, and we say so plainly.
- The owner does not talk to customers. Any line that needs them to is not a line.

### 2. Money means the ledger
A shekel counts when it is recorded in `revenue_ledger` with a platform transaction
id. Projections, forecasts and "expected" revenue are never revenue. A line becomes
`live` when money lands, not when a director declares it.

### 3. The chain of command is real, not decorative
Board → director per revenue line → supervisor per director → workers, with auditors
re-deriving supervisor decisions from the raw ledger and a chief auditor checking the
auditors. Decisions live in code (`src/revenue/rules.ts`) precisely so any auditor can
recompute them from the same numbers and catch drift. Separation of duties holds: the
reviewer never builds, and the builder never edits the ledger's verdict.

### 4. Honest value only — this outranks the target
No spam, no scams, no fake reviews, no manipulation, no ToS violations, nothing that
deceives a buyer. If a line can only earn by misleading someone, it gets killed, not
shipped. Selling a feature that does not exist, or charging for something already free,
is a violation — not a TODO. This is the project constitution (`constitution.md`) and
it wins over the revenue goal every time.

### 5. Serious means measured
Every line carries KPIs, kill criteria and scale criteria, and is judged against them
on a schedule. Lines that do not earn are killed on their stated terms. Compute budget
follows performance. No line survives on hope.

### 6. Never lose the thread
`logs/CHECKPOINT.md` is updated early and often, so an interrupted session — a model
quota, a reclaimed container — always resumes from a written state, never from memory.
Every task ends with a log in `logs/` per the format in `CLAUDE.md`.

---

## Where the work lives

| Piece | Path |
|---|---|
| Income engine (ledger, rules, chain of command, loop) | `src/revenue/` |
| Standalone governance loop + its schedule | `scripts/colony.ts`, `.github/workflows/colony.yml` |
| Live state and the readable board report | `state/colony/` |
| Sellable products | `products/` |
| Per-line playbooks the directors load | `skills/revenue-*/` |
| The ranked list of ways to earn, and the owner's checklist | `docs/INCOME_PLAN.he.md` |
| How the chain of command works | `docs/CHAIN_OF_COMMAND.md` |
| Where we stopped | `logs/CHECKPOINT.md` |
| Working conventions | `CLAUDE.md` |

## Definition of done for this mission

Not "code exists". The mission is met when the ledger shows ₪20,000 in a rolling
30-day window, earned honestly, with the owner having done nothing beyond the
one-time checklist.
