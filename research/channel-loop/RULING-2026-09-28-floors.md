# Board ruling, 28.9.2026 — the kill floors (FABLE_QUEUE rows 8, 9 and a pointer to 11)

**Board: Fable 5.1, deciding tier, daily sitting of 28.9.2026 (~07:11 UTC).** Inputs: `MISSION.md` in full, including the
27.9 additions (channels without stopping; standing consent and the ₪0 rule) and the 28.9 addition ("הרבה מקומות,
הרבה מכירות"); `logs/FABLE_QUEUE.md` rows 8, 9, 11; `src/revenue/types.ts`, `rules.ts`, `portfolio.ts`, `ledger.ts`
(transitions, `launchedAt`), `experiments.ts`, `heartbeat.ts` (the three `decideLine` call sites), `tools.ts:124`;
`src/__tests__/revenue/rules.test.ts`, `target-basis.test.ts`, `experiments.test.ts`; `research/channel-loop/BOARD-LOOP.md`
(PUBLISH-10, KILL-1, KILL-2, rank 5, the honest caveat); `research/faceless-youtube/RED-TEAM.md` §2.1(c), §2.5,
`T1-PROTOCOL.md`, `PREREG-DECISIONS.md` §1-§2; `products/chart-explainer/page.py` and `tests/test_page_counter.py`;
PostHog's own documentation, retrieved today (bot detection, web-analytics troubleshooting, managing bot traffic); the
Public Suffix List, rendered today from GitHub. No git was run; no code was edited; the board wrote this file and one
appended section of `PREREG-DECISIONS.md` (row 11). Opus applies everything under "Exact change".

## סיכום לבעלים (שלוש שורות)

- **שורה 8:** רצפת ההריגה בקוד (₪500 ב-30 יום אחרי 45 יום) גבוהה מהיעד של שלושה מארבעת הקווים — קו שמגיע בדיוק ליעד
  שלו היה נהרג. מהיום הרצפה היא **חלק מהיעד של הקו עצמו** (25% כברירת מחדל, 50% ל-il-biz-tools), אחרי **90 יום** מהשקל
  הראשון. כך היא נעה עם כל שינוי יעד ולא יכולה לעלות מעל היעד.
- **שורה 9:** il-biz-tools מתוכנן ב-**₪0** בזמן שהוא נמדד על netlify.app בלי דומיין; ה-₪400 נרשם כגבול עליון שנוי
  במחלוקת ולא כיעד. הקו לא נהרג ולא זוכה לויתור פתוח: יש לו קריאה מתוארכת ביום 56 עם שערים כתובים מראש.
- **שורה 11:** רצפת ההגעה של דף ה-web (ניסוי YouTube) נרשמה מראש ב-`PREREG-DECISIONS.md` §3: מתחת ל-**5** צפיות של
  זרים שגללו את הדף ב-56 יום — שלב A לא נשאל. הצפיות שלנו ושל רובוטים מוצאות דרך המבנה, לא דרך מספר גבוה יותר.

---

## Row 8 — which kill floor governs

### Decision

1. **`graceDays` 45 → 90.** The clock runs from `launchedAt`, which the code sets when a line becomes `live`, and `live`
   means money landed (`ledger.ts` LINE_TRANSITIONS: "`live` needs a platform payment id first"; MISSION rule 2). Every
   line in the portfolio states 90 (`portfolio.ts:74, 114, 161, 204`); 45 predates the 7.9 retarget and cannot see one
   Apify or Gumroad payout cycle plus a review.
2. **The fixed ₪500 floor is deleted.** In its place the floor is **a fraction of the line's own target**:
   `killFloorFraction`, default **0.25**, and **0.5 for il-biz-tools**. In shekels today: pcn874 ₪150 (of ₪600),
   oss-bounties ₪75 (of ₪300), apify-actors ₪50 (of ₪200), il-biz-tools ₪0 while its target is ₪0 (row 9) and 50% of
   whatever the board sets from the reading that makes it live.
3. **The fraction lives in `TARGET_BASIS`** (a required field beside `ils` and `grade`), and a small resolver
   `policyForLine(lineId, base)` hands `decideLine` the line's own policy. Supervisor, board and auditor all resolve it
   the same way, so the auditor can still recompute every decision and catch a board that holds a line its own floor says
   to kill (KILL-2 stays true: the board may be stricter, never softer).
4. **A live line with no target escalates** (`target_unset`) until the board sets one. A ₪0 target is legal only before
   `live` (row 9 uses it). This closes the one hole the fraction opens: a floor of 0 on a line that has earned.

### Reasoning

- The contradiction is not "strict vs lenient"; it is incoherent. After the board's 7.9 retarget (₪16,500 → ₪1,500) the
  fixed floor sits above three of four targets (₪200, ₪300, ₪400) and at 83% of the fourth. A line that hits its target
  exactly is killed at day 45. `DIGEST.md:353` and BOARD-LOOP's honest caveat both said so; nobody moved the constant.
- Any fixed shekel floor repeats the failure the next time a target moves — and targets are designed to move:
  oss-bounties' own kill criteria pre-register a ₪300 → ₪100 retarget on the week-4 supply read (`portfolio.ts:165`). A
  fixed ₪150 default would then exceed that line's target. A fraction cannot: for 0 < f ≤ 1, floor ≤ target always.
- The two floors the lines state are both fractions of their targets: il-biz ₪200/₪400 = 0.5, pcn874 ₪150/₪600 = 0.25.
  The default is the **softer** of the two, because `auditDecision` approves a filed decision stricter than the code and
  flags one softer: the code must never be stricter than a line's own words, and a line's stricter words ride on top
  (il-biz's 0.5 is written into its basis so the auditor enforces it too).
- apify-actors' and oss-bounties' revenue rules ("no payout 90 days after the first priced Actor / first attempted
  bounty") describe the **pre-live** period. Under the repo's own definition of `live` they are not floors on a live
  line; they are the business of `awaiting_setup` (escalate), `build_overdue` (escalate at 30 days) and, where a line is
  a pre-registered measurement, its gates in `experiments.ts`. Those two lines therefore take the default 0.25 once they
  have earned, and their stated pre-live wording stays as it is.
- The owner's 28.9 directive bears here and cuts the same way: many small sales in many places means small targets, and
  a small line must not be killed by a floor written for a ₪1,800-per-line portfolio. A fraction of the line's own
  target is the floor that respects "a fair chance to make its first sales" without softening the measurement: a line
  under a quarter of its own target three months after its first shekel is not a small success, it is a dead line.
- The trailing-30-day window is safe for monthly payout rails: any 30 consecutive days contain every day-of-month up to
  the 28th exactly once, so Apify's payout on the 11th-14th is always inside it.

### Exact change (Opus)

**`src/revenue/types.ts`** — in `DecisionPolicy`, replace the two fields and the default:

```ts
  /**
   * Days after launch before a line can be killed for low revenue. `launchedAt` is set when a line becomes `live`, and
   * `live` means the first ledger entry with a platform id (MISSION rule 2) — so this is 90 days from the first shekel.
   * Every line in the portfolio states 90 (board ruling 28.9.2026, research/channel-loop/RULING-2026-09-28-floors.md §8).
   */
  graceDays: number;
  /** Days a line may sit in `building` before the supervisor escalates. */
  buildGraceDays: number;
  /**
   * 30-day revenue floor after the grace period, as a fraction (0 < f ≤ 1) of the LINE'S OWN target; below it → kill.
   * Replaced a fixed ₪500 on 28.9.2026: after the 7.9 retarget the fixed floor exceeded three of the four targets, so a
   * line at its own target would have been killed. A fraction moves with every retarget and can never sit above the
   * target. Lines override it through TARGET_BASIS.killFloorFraction (portfolio.ts → policyForLine).
   */
  killFloorFraction: number;
```

```ts
export const DEFAULT_DECISION_POLICY: DecisionPolicy = {
  graceDays: 90,
  buildGraceDays: 30,
  killFloorFraction: 0.25, // the softer of the two ratios the lines state (pcn874 ₪150/₪600); il-biz-tools overrides to 0.5
  killCostRatio: 2,
  minMarginForScale: 0.5,
  scaleAttainment: 1.0,
  collapseTrend: 0.4,
  staleDays: 21,
  maxExperiments: 3,
};
```

`killFloorAgorot` is removed from the type (a test asserts the key is gone, so no caller keeps reading a shekel floor).

**`src/revenue/rules.ts`** — replace lines 81-91 (from `// ── Live / scaling ──` through the hard-kill block) with:

```ts
  // ── Live / scaling ──
  const launchedDays = metrics.daysSinceLaunch ?? metrics.daysSinceCreated;

  // A live line with no target cannot be judged. A ₪0 target is legal only before `live` (a measurement, row 9 of the
  // 28.9.2026 ruling); once money has landed the board sets the target from that reading, in the same sitting.
  if (line.targetMonthlyAgorot <= 0) {
    triggered.push("target_unset");
    return decide("escalate", "live line with no target: the board sets one from the reading that made it live before any other rule applies");
  }

  // Hard kill: past grace and under the line's own floor — a fraction of its own target, so a retarget moves the floor
  // with it and the floor can never sit above the target (RULING-2026-09-28-floors.md §8).
  const killFloor = Math.floor(line.targetMonthlyAgorot * policy.killFloorFraction);
  if (launchedDays >= policy.graceDays && rev30 < killFloor) {
    triggered.push("below_kill_floor");
    return decide(
      "kill",
      `30-day revenue ${rev30} agorot is below the floor ${killFloor} (${Math.round(policy.killFloorFraction * 100)}% of target ${line.targetMonthlyAgorot}) after ${launchedDays.toFixed(0)} days live (grace ${policy.graceDays}d)`,
    );
  }
```

Nothing else in `decideLine` changes; `auditDecision` is untouched.

**`src/revenue/portfolio.ts`** — add to `TargetBasis`:

```ts
  /**
   * The line's kill floor as a fraction of its own target (0 < f ≤ 1): 30-day revenue below f × target after
   * DEFAULT_DECISION_POLICY.graceDays → kill. Board ruling 28.9.2026 (RULING-2026-09-28-floors.md §8). Where the line's
   * killCriteria state a shekel figure, target-basis.test.ts asserts it equals f × target.
   */
  killFloorFraction: number;
```

Values: `"apify-actors": 0.25`, `"il-biz-tools": 0.5`, `"oss-bounties": 0.25`, `pcn874: 0.25`. Then, after `TARGET_BASIS`:

```ts
/**
 * The decision policy for one line: the shared policy with the line's own kill-floor fraction. Supervisor, board and
 * auditor all resolve it here, so an auditor recomputing a decision reads the same floor the supervisor did.
 */
export function policyForLine(
  lineId: string,
  base: DecisionPolicy = DEFAULT_DECISION_POLICY,
  basis: Record<string, TargetBasis> = TARGET_BASIS,
): DecisionPolicy {
  const f = basis[lineId]?.killFloorFraction;
  return f === undefined ? base : { ...base, killFloorFraction: f };
}
```

(import `DEFAULT_DECISION_POLICY` and `type DecisionPolicy` from `./types.js`). pcn874's wording at `:204` stays
("under ₪150 in 30 days after 90 days live" = 0.25 × ₪600). il-biz-tools' wording at `:114` changes under row 9 below.
apify-actors `:74` and oss-bounties `:161` stay: pre-live wording, not floors on a live line.

**Call sites** — `src/revenue/heartbeat.ts:196, :258, :440` and `src/revenue/tools.ts:124`: pass
`policyForLine(line.id, policy)` (at `:440`, `policyForLine(lineAtReview.id, policy)`; at `tools.ts:124`,
`policyForLine(line.id)`) in place of the bare `policy` / default.

**Tests**

`src/__tests__/revenue/rules.test.ts` (fixture target 200_000 → default floor 50_000):

- Replace "kills a live line under the floor after the grace period": revenue 10_000 at `daysSinceLaunch: 100` → kill
  with `below_kill_floor`; the same at `daysSinceLaunch: 60` → hold (grace is 90 now).
- Add "the floor is a fraction of the line's own target and never sits above it":
  `decideLine(line({ targetMonthlyAgorot: 40_000 }), metrics({ revenue30dAgorot: 18_000, daysSinceLaunch: 100 }), { ...DEFAULT_DECISION_POLICY, killFloorFraction: 0.5 })`
  → kill (floor 20_000); with `killFloorFraction: 0.25` → not kill (floor 10_000); and for every fraction in
  `[0.25, 0.5, 1]`, a line earning exactly its target at day 100 is never killed.
- Add "a live line with no target escalates until the board sets one":
  `decideLine(line({ targetMonthlyAgorot: 0 }), metrics({ daysSinceLaunch: 100 }))` → escalate, `target_unset`.
- Add the pin: `expect(DEFAULT_DECISION_POLICY.graceDays).toBe(90)`, `expect(DEFAULT_DECISION_POLICY.killFloorFraction).toBe(0.25)`,
  `expect(DEFAULT_DECISION_POLICY).not.toHaveProperty("killFloorAgorot")`.

`src/__tests__/revenue/target-basis.test.ts`:

- Every `TARGET_BASIS` entry has `killFloorFraction` with `0 < f ≤ 1`; `policyForLine("il-biz-tools").killFloorFraction`
  is `0.5`, `policyForLine("pcn874").killFloorFraction` is `0.25`, `policyForLine("no-such-line")` equals the default.
- The words match the number: for each seed, run `/under ₪([\d,]+) in 30 days after (\d+) days/` over its `killCriteria`;
  where it matches, `Number(N.replace(/,/g, "")) * 100 === Math.floor(seed.targetMonthlyAgorot * fraction)` and
  `Number(D) === DEFAULT_DECISION_POLICY.graceDays`.
- For every seed with a target above 0, `Math.floor(target × fraction) ≤ target` (the property this ruling exists for,
  asserted rather than implied).

**Docs that state the old rule and must state the new one** (documentation-accuracy rule): `docs/CHAIN_OF_COMMAND.md:42`
("Live 45+ days and 30-day revenue < ₪500 → kill"), `docs/INCOME_PLAN.he.md:281`, `skills/revenue-command/SKILL.md:21`.
New wording: live 90+ days from the first shekel and 30-day revenue below the line's own floor — 25% of its target by
default, 50% for il-biz-tools — → kill; a live line with no target → escalate.

---

## Row 9 — il-biz-tools' contradicted ₪400

### Decision

**Plan the line at ₪0 for as long as it is measured on `*.netlify.app` without the domain, and make the measurement a
dated, gated one — not a waiver.** Exact values:

1. `targetMonthlyAgorot: agorotFromIls(0)`; `TARGET_BASIS["il-biz-tools"]`: `ils: 0`, `grade: "inferred"`,
   `contestedUpperBoundIls: 400`, `killFloorFraction: 0.5`. The ₪400 does not vanish: it is recorded where the board
   already records "a larger figure that exists in the evidence and that the board refused to commit to", and the
   report prints it beside the ₪0.
2. Status: the seed stays `awaiting_setup` (the deploy route is still an owner action and the report must keep asking
   for it). **On the day the netlify.app deploy is public** (runner 200 and a clean identifier grep, PUBLISH-8), the loop
   moves the line to `measuring`, and `LINE_TRANSITIONS.awaiting_setup` gains `"measuring"` (a ₪0 measurement surface
   needs no identity step; the Gumroad steps for the paid tier stay pending). `decideLine` then holds it (rules.ts:62-64)
   and the gates below judge it. Nothing in `syncPortfolio` changes.
3. The measurement (D0 = that deploy day; instrument = the site's cookieless posthog-js snippet with its built-in bot
   filter; own views excluded exactly as PREREG-DECISIONS.md §3.4(a) — a `/preview/` path for every colony- and
   owner-facing link, preview and branch hosts excluded, the canonical host never opened by the colony in a JS browser):
   - **M-instrument:** two consecutive weekly page-view KPI writes by D0+21; otherwise an instrument fault — fixed,
     clock restarted, recorded (BOARD-LOOP KILL-1). Never a fail.
   - **M-reach at D0+56:** total stranger page views over the 56 days **below 5** → the line is `paused` at ₪0 (a legal
     move from `measuring`); no SEO hour, no build hour, and no owner step is asked on this line's account; it re-enters
     `measuring` only at the domain deploy, which is the owner's own spend decision after income (MISSION 27.9). **At or
     above 100 per week averaged over weeks 5-8** (the line's own stated bar, portfolio.ts:115) → PASS: the paid tier's
     owner steps (2, 3, 6b) join the ask batch as "a paid product is ready", with the reading attached. Between → one
     extension to D0+112, same read, same two outcomes; there is no second extension.
   - **Going live:** the first Gumroad sale with its transaction id moves the line to `live`, and in the same Fable
     sitting the board sets the target **from the reading** (weekly views × observed visit-to-pay ratio × price, with
     the arithmetic in the basis), graded `measured`; the 50% floor then follows automatically after 90 days.
4. PUBLISH-10 stands: the domain-period clocks (₪-floor after 90 days live; under 100 views/week for 8 weeks → kill)
   start at the domain deploy. What this ruling adds is that the netlify.app period is no longer clockless.

### Reasoning

- A ₪400 plan whose own basis says "₪0 through month 12 as things stand" is the exact failure `TARGET_BASIS` exists to
  prevent: "a wish with a currency symbol" (portfolio.ts:242). `contradicted` made that visible; it did not make it a
  plan. MISSION's manager-screen rule is that a company earning ₪0 shows ₪0 — and a plan built from ₪0 shows ₪0 too.
- A bare waiver of the kill rule is the wrong answer for the opposite reason: PUBLISH-10 already left the netlify.app
  period without a clock, and MISSION constraint 5 ("killing must be as automatic as building") plus the loop's cap on
  built-but-unlaunched inventory forbid an open-ended one. So the waiver is bounded: dated gates, one extension, a
  `paused` state whose exit condition is an event, not hope.
- Zero is not a kill. The owner's 28.9 directive says a venue is not killed before it has had a fair chance at its first
  sales; this line's acquisition channel (Hebrew long-tail search) has never been fairly tested, because the domain the
  chief audit named as a precondition is frozen by the owner's own ₪0 rule. Killing it now would be killing for a reason
  that says nothing (the reason `measuring` was invented, experiments.ts:4-9). Pausing it at ₪0 on a null read is
  honest; the domain deploy is the named event that reopens it.
- The same directive also says our own sites have almost no traffic and venues that bring their own buyers come first.
  A ₪0 plan for our own site until a stranger is measured is that sentence in numbers.
- `inferred` is the right grade for ₪0: the audit infers ₪0 through month 12; the evidence does not argue against ₪0,
  it argues for it. `contradicted` would be false; `measured` would be a lie until the day-56 read exists.

### Exact change (Opus)

**`src/revenue/portfolio.ts`**

- il-biz-tools seed: `targetMonthlyAgorot: agorotFromIls(0)`; keep `budgetMonthlyCents: 4000` (the free tools and the
  validator page still need build hours).
- `killCriteria[0]` (line 114) becomes:
  `"revenue_ledger under 50% of the board-set target in 30 days after 90 days live — live is the first Gumroad sale with its transaction id, and the target is set by the board from the reading that made it live (RULING-2026-09-28-floors.md §9)"`.
  Add a criterion:
  `"netlify.app measurement (RULING-2026-09-28-floors.md §9): stranger page views under 5 over the 56 days from the public deploy → paused at ₪0 until the domain deploy, with no SEO or build hour and no owner step asked on this line's account; 5 to under 100/week → one extension to day 112 and the same read; 100/week or more over weeks 5-8 → the paid tier's owner steps (2, 3, 6b) join the ask batch"`.
  Line 115 stays and gains the suffix `"(clock starts at the domain deploy, BOARD-LOOP PUBLISH-10)"`.
- `TARGET_BASIS["il-biz-tools"]`: `ils: 0, grade: "inferred", contestedUpperBoundIls: 400, killFloorFraction: 0.5`;
  basis text: *"Planned at ₪0 while the site is measured on *.netlify.app without a domain (owner's ₪0 rule, 27.9.2026):
  the audited basis says ₪0 through month 12 as things stand (chief audit §2.1 #3), and the ₪200-400 band is recorded as
  the CONTESTED UPPER BOUND, not as a target. The evidence in this field argues for the zero: a competing Israeli legal
  site's own Google Search Console export, checked into a public repo, shows its severance-calculator page at 0 clicks
  and 0 impressions over 16 months while sibling pages show 58k-81k; head terms belong to funded incumbents (Morning,
  iCount, Invoice4u, Kol Zchut) and to btl.gov.il's own free simulators. The number returns only from a reading — the
  day-56 netlify.app read (RULING-2026-09-28-floors.md §9) or the first Gumroad sale — never before, and never by being
  smaller."* Keep `source`, `rail`; `acquisitionChannel` keeps its text with the prefix "UNTESTED: ".
- The comment above the seed's target (lines 120-125) is rewritten to cite this ruling.

**`src/revenue/ledger.ts`** — `LINE_TRANSITIONS.awaiting_setup: ["proposed", "building", "measuring", "killed", "paused"]`
with a one-line comment: a ₪0 measurement surface (a public page with an instrument) needs no identity step.

**Tests**

- `target-basis.test.ts`: `byId` → `{ "apify-actors": 200, "oss-bounties": 300, "il-biz-tools": 0, pcn874: 600 }`;
  `committedTargetIls()` → 1100; `portfolioTargetAgorot()` → 110_000; `contradictedLines` → `[]` and
  `contradictedIls` → 0, **with** `expect(TARGET_BASIS["il-biz-tools"].contestedUpperBoundIls).toBe(400)` and
  `expect(TARGET_BASIS["il-biz-tools"].grade).toBe("inferred")` beside it, and a comment that the ₪400 moved from the
  contradicted band to the contested upper bound by this ruling; the ₪2,200 identity becomes
  `committedTargetIls() + conditionalTargetIls()` → 1800 with a comment: the chief audit's ₪2,200 is now 1,100 committed
  + 700 conditional + 400 contested (il-biz-tools). The assertion that no `measured` shekel exists stays true.
- `ledger.test.ts`: `awaiting_setup → measuring` is legal; `awaiting_setup → live` still is not.

**Then, on Opus:** `pnpm exec tsx scripts/colony.ts sync-portfolio` and `report`; regenerate anything the report
generator writes; grep `docs/` and `skills/` for the committed ₪1,500 and fix by hand only prose the generator does not
own (`docs/INCOME_PLAN.he.md`, `docs/OWNER_STEPS.he.md` if it states the sum). `logs/CHANNEL_LOOP.md` §3 and §5 record the
new stage and the D0+56 / D0+112 dates when D0 exists (Opus's file).

---

## Row 11 — the T1 web arm's reach floor

Pre-registered in **`research/faceless-youtube/PREREG-DECISIONS.md` §3** (appended today, before any deploy). In one
line: the counter fires on the visitor's **first scroll**, not on load; the read is `$pageview` events at the canonical
production URL over 56 days from D0, own views excluded by path and host, bots excluded by structure (PostHog cannot
classify them: no user agent is sent and the IP is discarded — verified from PostHog's own docs today), token-abuse
excluded by payload shape; **under 5 → Stage A is never asked**; unmeasured → instrument fault, not a verdict; the
`*.netlify.app` sub-brand host does **not** change the number — it changes what D0 means (public **and** a recorded
discovery submission) and how a null is read. Exact code for `page.py`, its tests, `experiments.ts` (`WEB_ARM_REACH`,
`evaluateWebArm`) and the Netlify `_redirects`/`_headers` lines are in that section.

---

## What was not decided here, on purpose

- **apify-actors carries ₪200 `inferred` while its own basis says "kept … at forecast ₪0".** The same inconsistency row 9
  fixes for il-biz-tools; not in this sitting's rows. Queue it: the fix is the same shape (₪0 with ₪200 contested, and
  the day-30 stranger count as the reading that sets a number).
- **`staleDays: 21` escalates a monthly-payout line every month.** An escalation, not a kill; noted, not changed.
- **Apify's $20 payout minimum vs a trailing-30 floor.** A priced Actor earning under $20 a month pays out every second
  month, so the trailing window can show ₪0 in the off month. The connector, when it exists, should book Apify's
  monthly statement with its id as the ledger event, not only the PayPal/Wise transfer; that is a connector design
  question for the sitting that admits pricing (scaleCriteria: 200 stranger users), not this one.
- **The sub-brand name** for the T1 host (BOARD-LOOP rank 5 leaves it to the loop; the brand veto is still open).

## Path

`MISSION.md` (all additions; rules 1, 2, 4, 5; constraints 5, 7) → `logs/FABLE_QUEUE.md` rows 8, 9, 11 →
`src/revenue/types.ts:192-223`, `rules.ts:30-146, :231-243`, `portfolio.ts:34-136, :270-346`, `ledger.ts:249-358`,
`experiments.ts`, `heartbeat.ts:184-260, :420-445`, `tools.ts:124` → `rules.test.ts`, `target-basis.test.ts`,
`experiments.test.ts:118-129` → `BOARD-LOOP.md` (PUBLISH-10, KILL-1/2, rank 5, honest caveat) → `RED-TEAM.md` §2.1(c),
§2.5 → `T1-PROTOCOL.md` → `PREREG-DECISIONS.md` §1-§2 → `products/chart-explainer/page.py`, `tests/test_page_counter.py`
→ PostHog docs (bot-detection, web-analytics/troubleshooting, managing-bot-traffic; retrieved 28.9.2026) →
`public_suffix_list.dat` line 14892 (`netlify.app`, rendered 28.9.2026). No git. No owner identifier appears in this file.
