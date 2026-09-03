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

## תוספת הבעלים, 3.9.2026 (verbatim)

> אני רוצה שתפתח לי כמה מקורות הכנסה שביחד מגיעים לסכום שדיברנו עליו או אפילו ליותר.
> אני רוצה שתבנה להם loop גדול. תיצור לי עובדים בחברה — ממש חברה גדולה, עם כמה חנויות.
> יש לך אישור לעשות הכל.
> אני רוצה גם שתחקור על לבנות מסך/אפליקציה בשבילי, המנהל, בשביל לראות את החברה וההתקדמות
> שלה, הפיתוח, ואיך שהיא מרוויחה כסף. תחפש לי בטיק טוק ובgithub דברים כאלה, כי אני ראיתי
> מלא כאלה.
> אתה יכול להשתמש לעזרה בכל AI אפשרי — יש לי מנוי ל-Base44 ול-ChatGPT.

### What this addition changes

**A portfolio, not a hit.** The target is reached by several lines summing to it, not by one
line carrying it. Wave 2 of the sweep proved why this is the only honest reading: our home
turf — Israeli bureaucracy, where our shipped product already lives — has a measured ceiling
of ₪4,000-7,000/month across every survivor. Nothing there reaches ₪20,000 alone. Any plan
that quietly relies on one line becoming a flagship is a plan that fails.

**"Several stores" is now a design requirement.** Each line is its own storefront with its own
buyer, its own payment rail and its own kill criteria — deliberately not one product with
several features. One rail failing, one platform banning us or one market drying up must not
be able to take the company down.

**The manager's screen is a deliverable, not a nicety.** The owner is the manager and wants to
see the company: what each line earns, what is being built, what is stuck, and what needs him.
That view must be **derived from the ledger and the repo**, never hand-written — the same rule
as every other outward artifact. A dashboard that can show a number nobody earned is worse
than no dashboard, because it makes the failure this whole system exists to prevent look like
success. It must also be honest about zero: a company earning ₪0 shows ₪0, prominently.

**Other AIs are tools, not authorities.** Base44 and ChatGPT may be used where they are the
right tool — Base44 in particular is an app builder and a plausible host for the manager's
screen. But nothing they produce enters the ledger, the portfolio or an owner-facing claim
without the same evidence standard as our own work. A number from another model is a number
from a model, not a fact.

**"Workers in the company" means the chain of command, staffed.** Not more prompts — real
roles with mandates, "must never" lists, and separation of duties, as in `src/revenue/org.ts`
and `src/revenue/criteria.ts`. A worker that cannot be audited is not an employee, it is a
liability.

---

## המטרה הסופית — תוספת הבעלים, 3.9.2026 (verbatim)

> מצידי תפתח לי 1000 חנויות, חברות. אני רוצה להרוויח מיליון בשנה עוד כמה שנים קצרות — זו
> המטרה הסופית. תחקור על כל דבר אפשרי, תחשוב על כל דבר אפשרי, תבנה כל מה שאתה צריך, תוסיף
> כל דבר שצריך בשביל להגיע למטרה הזאת. אני לא בונה על חברה אחת שמרוויחה לבד, אני בונה על
> כמה חברות שממשיכות לגדול ולהתרבות.
> אני אתן לך כל דבר ואעשה כל דבר שאתה צריך בשביל להגיע למטרה הזאת.

**The ladder is now: ₪20,000/month → ₪50,000/month → ₪1,000,000/year (₪83,333/month).**

### The arithmetic, because 1000 is not an arbitrary number

Revenue in this business is a power law: most stores earn nothing. So the number of stores you
must *launch* is set by the hit rate and by what a hit earns. Stores needed to reach
₪83,333/month, when the misses earn ~₪0:

| hit rate | ₪1,000/hit | ₪2,000/hit | ₪3,000/hit | ₪5,000/hit |
|---:|---:|---:|---:|---:|
| 1% | 16,667 | 5,556 | 3,334 | 1,852 |
| 2% | 5,556 | 2,381 | 1,516 | 878 |
| 5% | 1,852 | **878** | 575 | 341 |
| 10% | 878 | 428 | 283 | 169 |
| 20% | 428 | 211 | 141 | 84 |

At a 5% hit rate and ₪2,000 per winner — both plausible against what we have measured — the
answer is **878 stores launched, of which about 44 would work**. The owner's instinct that the
number is around a thousand is arithmetically sound.

This table is generated by `src/revenue/growth.ts` (`pnpm exec tsx scripts/colony.ts growth`), not
computed by hand, so it moves when the measured inputs move and it cannot drift from the code. It
already includes ₪5/month of upkeep per store, which is why the answer is 878 rather than the 833
you get by ignoring maintenance — and the gap between those two numbers is the entire subject of
constraint 1 below.

### The four constraints that decide whether it works

**1. Marginal cost per store must approach zero, or the portfolio eats itself.** 833 stores at
₪50/month of upkeep is ₪41,650/month — half the target, spent on maintenance. This is the
constraint that kills naive versions of the plan. It forces: static output over servers, one
codebase templated many ways over bespoke builds, and no per-store subscription, ever.

**2. Stores multiply; accounts do not.** Every *platform account* costs one owner KYC, and the
owner's involvement is the thing we minimise. A thousand storefronts under one Paddle
merchant-of-record account is achievable; a thousand Etsy shops is not, because each needs its own
verified identity. **So the architecture is many storefronts behind few accounts** — and any plan
requiring an account per store is rejected on that ground alone, before anyone asks whether it
would earn.

**3. Multiplying must never become an account farm.** Platforms forbid coordinated multi-account
operation, and Google's spam-cluster detection specifically targets synchronised schedules,
templated formats and shared infrastructure — which is what a colony looks like from outside
(see `docs/REJECTED.md`). Growth by duplication is legitimate only where each store is genuinely
its own product for its own buyer on a platform whose terms permit it. Where it is not, the honest
move is fewer, better stores.

**4. Killing must be as automatic as building.** If 95% earn ₪0 and nothing removes them, the
portfolio drowns in dead weight and the real winners become invisible. Kill criteria are not
hygiene here, they are the mechanism that makes multiplication survivable.

### תקציב — תוספת הבעלים, 3.9.2026 (verbatim)

> אני רוצה לתת לך סכום קטן שממנו אתה משתמש, וגודל מקסימום 200 שקל.

Until now the rule was absolute: never spend the owner's money. This is the single relaxation of
it, and it is enforced in code rather than promised — `src/revenue/budget.ts`, with the ceiling
checked *before* any commitment and every spend written to the ledger as an ordinary cost, so the
board, the auditor and the manager's screen all see it without special-casing.

Two readings were available and the conservative one is implemented, stated here so the owner can
correct it:

- **₪200 is a total, not a monthly allowance.** ₪200 once. If he means ₪200 every month he can say
  so and the ceiling moves; guessing the more generous reading with someone else's money is not
  ours to do.
- **A spend from the float requires the platform's receipt id.** Ordinary cost entries may omit
  one, because our own compute has no receipt. This is different: it is real money leaving a real
  account, and a charge nobody can trace is what an owner should refuse to fund.

**What the float is for:** the small unavoidable one-off fees that stop a line from earning at all
— a developer-account fee, a domain, a listing charge. It is not working capital and it does not
change constraint 1 above: marginal cost per store must still approach zero, and ₪0 options are
still preferred over cheap ones.

**What it must never become is a subscription.** ₪200 against a recurring charge is a slow death
with a fixed end date — the colony would be paying rent out of revenue it does not yet have. Any
recurring cost is the owner's decision, every time, not a draw against this pot.

**And it never touches the target.** ₪200 of the owner's money spent well might unblock a line; it
cannot be counted as progress. Money still only counts when it arrives in the ledger with a
transaction id, in the other direction.

### What this does not change

Nothing in this addition loosens the constitution. A thousand honest stores is the goal; one
deceptive store is a failure regardless of what it earns. And money still counts only in the
ledger, with a transaction id — a thousand stores reporting projections is worth exactly ₪0.

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
