# Faceless YouTube, the owner's reel variant — red team on the judge's verdict (27.9.2026)

**Attacked:** `VERDICT.md` (decision REOPEN_AS_EXPERIMENT). **Red team:** Fable 5.1, deciding tier.
**Inputs read in full:** `MISSION.md`, `docs/REJECTED.md` §"Automated faceless-video pipelines" (3.9.2026), the reel
transcript, `VERDICT.md`, `DIGEST.md`, `REGRADE.md`. Every rendered line the verdict cites was printed and read; all 60+
quotes match their files. Code checked: `src/revenue/types.ts:212-222`, `rules.ts:63,77,152`, `owner-steps.ts`,
`state/colony/colony.db` (`revenue_ledger` = 0 rows; four experimental lines `killed`, as the verdict says).
WebSearch used: **3 of 3** (Upload-Post tier, OWID energy licence, Brand Account creation in 2026).

**Result: the decision survives; the design does not survive as written.** Zero FATAL, six MAJOR, six MINOR. The six
MAJORs change what the owner is asked, when, and what a "pass" buys — none flips REOPEN_AS_EXPERIMENT to
STAY_REJECTED, and none flips it to a line.

---

## סיכום לבעלים (בקצרה)

- ההחלטה "ניסוי מדוד, לא מקור הכנסה" מחזיקה. אבל הצורה שבה נכתבה מבקשת ממך יותר ממה שהיא מודה, ומבקשת מוקדם מדי.
- **מה חסר בבקשה ממך:** כדי לקרוא בכלל את תוצאות הניסוי (צפיות של זרים, שעות צפייה) צריך גישת API לאנליטיקס של הערוץ — וזה
  דורש פרויקט Google Cloud והסכמת OAuth אחת שאף אחד לא הוקצה לה. פסק הדין מחק את "פרויקט Cloud" מהצעדים שלך, ובלי זה
  אין מדידה ואין שערי סגירה. צריך להחליט מי עושה זאת (עוד ~10-15 דקות שלך, פעם אחת) או להוכיח שהמפרסם המבוקר נותן את
  הנתונים בעצמו.
- **מה מסוכן בבקשה ממך:** הצעד A1 שם את חשבון גוגל *הפרטי* שלך כבעלים של הערוץ. אם יוטיוב יסגור את הערוץ, הסנקציה יכולה
  להגיע ל"כל הערוצים והחשבונות שלך". החשבון של המותג (A2b) צריך להיות הבעלים — לא אתה.
- **מה מוקדם מדי:** מבקשים את 20-40 הדקות שלך *עכשיו*, לפני שבדקנו בחינם אם אותו תוכן בכלל מוצא זרים באתר של המותג, ולפני
  שהקוד של שערי הסגירה קיים. הסדר צריך להתהפך.
- **מה שגוי במספרים:** שער "המשך לשלב B" נפתח בקצב שמניב ₪130-250 בחודש — פחות מרצפת הסגירה שלנו (₪500). אנחנו לא
  מבקשים ממך AdSense, מכתב PIN וטופס מס אמריקאי בשביל ₪200 בחודש. הסף צריך להיות פי 2-3.
- כסף: עדיין ₪0 בחודשים 3, 6 ו-12 ברוב התרחישים — על זה אין מחלוקת.

---

## 1. MISSION clause by clause

| Clause | Verdict's position | Red-team finding |
|---|---|---|
| Owner does nothing (rule 1) | Stage A ~20-40 min once; 0-10 min/month unscheduled; Stage B later | **Understated.** The Analytics/Search Console consent is an unlisted step (§2.1). A2 on the owner's existing account may trigger an advanced-features ID check [RENDERED youtube-policy-changelog.txt:332] — a hidden identity step (§2.2). Realistic Stage A: 40-60 min. |
| Honest value (rule 4) | Disclosed AI, fact-checked, no advice, no reuse | **Holds.** No deception found in the design. The About text [youtube-monetization-policies.txt:294] and `containsSyntheticMedia` are the right instruments. |
| Constraint 1 (marginal cost → 0) | ₪0 cash; 10-25 runner-min + ~₪8-10 tokens/video | Holds for six videos. The "extension" band (§2.3) would spend six more before anyone knows the channel is 10× short. |
| Constraint 2 (few accounts) | One channel, one Google account; AdSense only at stage B | Holds — provided the Google account is **dedicated** (§2.2). |
| Constraint 3 (no account farm) | One channel | Holds. |
| Constraint 4 (structural promotion) | YouTube's own distribution | Holds. |
| Constraint 5 (automatic killing) | Code path before first upload | Holds as a precondition; two gates are mis-set (§2.3, §2.4). |
| Constraint 6 (something of its own) | Original analyses from CC BY data | **Weak, admitted.** Recomputable by anyone (prompt-critique angle). Acceptable for an experiment, not for a line. |
| Constraint 7 (channel named; cheapest test first) | Channel named; T1 first; web arm in parallel | **Inverted in sequencing** (§2.5): the cheapest test of the same substance is the web arm at zero owner minutes; the six renders are built before T1. |
| Constraint 8 (non-public input) | "Weakly met" — accumulated ranking history | Honest, but the input does not exist at day 0 and is identical to every entrant's. Say so: the experiment is justified under constraint 7 alone (MINOR). |
| ₪200 float never a subscription | ₪0 drawn; paid tier is owner's explicit decision | Holds. |
| Anonymity | Brand channel; About "AI-produced by an unnamed operator"; no owner identifier | Holds for the public surface. Ownership chain leaks toward the personal account (§2.2). |
| Ledger only | Nothing counts without an AdSense payment id | Holds. |

## 2. Objections

### 2.1 MAJOR — The experiment cannot be read: the K0/K3 instrument has no assigned owner

The kill criteria are computed from the YouTube Analytics/Reporting API with a `subscribedStatus == UNSUBSCRIBED`
split (VERDICT §9-10, §14.5). Every Google API call needs an OAuth client, which needs a Google Cloud project, and the
consent for `yt-analytics.readonly` on the Brand channel is a browser flow signed in as a channel owner or manager. The
verdict's owner list strikes exactly that: *"Not owner steps, by decision: own Google Cloud project + YouTube API audit"*
(VERDICT §8). The strike was aimed at the **upload** project (audit, private lock, per-item consent) — correct — but it
also removes the only listed route to **reading** the channel. §14.5 then says the reader is *"designed to run under the
brand manager account's consent"* without saying who creates the project, who clicks the consent, and how a headless
job signs in to Google (2SV is required on accounts associated with monetizing channels
[RENDERED youtube-policy-changelog.txt:266]; an automated browser login is the class of access YouTube's ToS forbids —
the verdict itself refuses that route for uploads).

The same gap sits under the comparison arm: *"measured with Search Console"* (VERDICT §9) — no Search Console
integration exists in the repo (`grep` of `src/`, `scripts/`, owner steps: only prose in `portfolio.ts:121,290,298`, which
says "Search Console only later"), and it needs the same Google account + OAuth consent. "No new owner step" is
therefore false for both arms unless the colony can complete a Google consent unattended, which nothing shows.

Evidence: VERDICT §8 (strike), §9 ("no new owner step"), §14.5, open question 9; discovery scout's own owner-step list
(DIGEST:251-252) asked for exactly this consent and the verdict dropped it; `src/revenue/owner-steps.ts` contains no
Google account at all.

Fix: (a) make T1 also test whether Upload-Post's free-plan "analytics" (its pricing page lists analytics on the free
tier — vendor claim, SNIPPET) returns per-video views and watch time by traffic source and subscriber status; if yes,
K0/K3 can be read without a Cloud project. (b) Otherwise add one explicit step, with a name on it: create an
analytics-only Cloud project on the **brand** Google account, one consent for `yt-analytics.readonly` (+
`webmasters.readonly` if the web arm keeps Search Console), no upload scopes, no audit. If the owner clicks it, list it
(+10-15 min once). If the colony is to click it, first prove it can — and state that the Developer Policies then apply
to that client too (privacy policy and ToS link [RENDERED youtube-developer-policies.txt:161-181], compliance mail to the
console account [:333], possible identity request [:253]). (c) For the web arm, PostHog cookieless page views (already
wired per `portfolio.ts:298`) can substitute for Search Console as the K0-equivalent, at the cost of not seeing
shown-and-ignored impressions.

### 2.2 MAJOR — A1 puts the owner's personal Google account in the blast radius, and the false-GO cost omits it

A1 reads "Google account with 2-Step Verification (may already exist)"; A2 adds the colony's account as a *manager*.
That makes the owner's existing personal account the Brand Account's **primary owner**. Consequences the verdict does not
price:

- Enforcement reaches accounts, not only channels, and not only after YPP: "we may temporarily turn off your
  monetization or **terminate your accounts**. This may apply to all of your existing channels, any new channels you
  create" [RENDERED youtube-monetization-policies.txt:286]; "terminate a channel, **account**, or disable a user's access
  to the Service" [:352]; account circumvention: "users who have previously had accounts terminated may have their
  current accounts terminated. Any outstanding revenue … reclaimed" [RENDERED youtube-policy-changelog.txt:140].
  Community Guidelines spam enforcement (item 6, the class the 3.9 rejection was about) is **not** YPP-gated. The
  verdict's claim that "the expensive risk … attaches only at YPP application" (VERDICT §5) is wrong on timing: the
  person-scoped **monetization** consequence [:342] attaches at YPP; the person-scoped **account** consequence attaches at
  the first public upload.
- A hidden identity step: if his account already has a channel, adding the Brand channel "may need access to advanced
  features" [RENDERED youtube-policy-changelog.txt:332] — i.e. phone + channel history or ID verification on his
  **personal** account. The verdict names it as "tell us if YouTube asks"; on a fresh brand account the first channel
  never asks.
- "A false GO under this design costs a dormant brand channel and an afternoon of compute" (VERDICT §5) omits: the
  personal Gmail in the ownership chain; and **brand contagion** — the channel carries the company's only public name
  (MISSION anonymity section), so a channel YouTube labels spam/inauthentic is a permanent public record against the
  brand every other line sells under.

Fix: A2b becomes A1: the **brand** Google account is created first and is the Brand Account's primary owner; the owner's
personal account is never linked. That account is **dedicated** to this line (no Search Console, Cloud or other Google
service for any other line on it — MISSION: one platform banning us must not take the company down). The channel name is
a sub-brand, not the company name, so a failed experiment does not sit on the brand's search results. Restate the
false-GO cost with these three items.

### 2.3 MAJOR — K3's "proceed" threshold buys Stage B's identity steps for a line the colony's own rules would kill

K3: ≥614 stranger h/28 d → "proceed to the stage-B (YPP application) decision"; 61-614 → one extension of six videos to
day 196. The verdict's own arithmetic says a channel at exactly that pace earns **₪130-250/month** (VERDICT §7) — below
`killFloorAgorot: 50_000` (₪500) that the verdict cites (§10 precondition). So the pre-registered pass condition asks
the owner for AdSense, a PIN letter, a W-8BEN with legal name and TIN, and a permanent currency choice (B1-B4) in
exchange for a line that `decideLine` kills at day 45 of being live (`rules.ts:77`). The extension band is worse: 61 h/28
d is a pace of ~800 h/year against an 8,000-h gate — 10× short — and it buys six more renders and ~3 months. The
verdict's own words for this shape are "hope with a number on it" (§5).

Arithmetic for the fix: ₪500/month ÷ 3.7 = $135 → ÷ $7 × 1,000 = 19,300 views/month → × 4-6 min = 77k-116k min =
1,290-1,930 h/month ≈ **1,200-1,800 h per 28 days**, i.e. 2-3× the qualification pace, before the 0.76-0.97 keep.

Fix: Stage-B trigger = stranger watch hours ≥ ~1,200 h/28 d at day 112 (pace whose implied revenue clears the kill
floor at the reel's own $7 placeholder), **or** an explicit written board decision that Stage B is being bought for
information, not revenue. Extension band ≥ 50% of the qualification pace (≥ 307 h/28 d), not 10%. Below that: kill.
Month-12 line: state that the non-zero case requires ≥1.35× the 614 pace from the first month (8,000 h by month 9-10
needs ~830 h/28 d average) — it is not the K3 pass case.

### 2.4 MAJOR — K0's "35 stranger views" is uncalibrated, and REGRADE already said why

The 35 comes from McGrady et al. 2023: **lifetime** views of a 2022 random sample of **all** public videos (home
videos, accidental uploads, zero-title clips). K0 measures **56-day** views of six titled, thumbnailed, 8-12-minute
explainers. Population and horizon both differ, in opposite directions. Then: "[August 2026] Views will be counted the
moment a video begins to play across all formats" [RENDERED youtube-policy-changelog.txt:62] — REGRADE recorded (line
117) that "several of our numbers were set under the old counting: the discovery K0 base rate … and every per-1,000-views
RPM calculation", and the verdict applied neither correction. A 2026 "view" is cheaper than a 2022 "view", so 35 is
lower than it looks. Net: passing K0 says almost nothing (a curated explainer beats the median random upload by
construction); only failing it says something. The verdict presents K0 as a gate with meaning.

Fix: keep K0 as a kill floor but label it "no-information pass"; before the first upload, record which view metric the
Analytics API returns for long-form (first-frame vs engaged) and pin the threshold to that definition; add **average
view duration** — the one recommendation signal YouTube names [RENDERED youtube-impressions-ctr.txt:87], which no K-gate
uses — as a pre-registered diagnostic with a written expectation (e.g. ≥ 30% average view percentage on Search
traffic), so the day-56 read can distinguish "not shown" from "shown and abandoned".

### 2.5 MAJOR — Sequencing: the owner is asked before the free test and before the code exists

Three statements in the verdict contradict each other. `ownerSteps`: "STAGE A (asked **now**)". §14.3: build the T1
protocol and a public-source pre-check of the publisher's audit status first, "so the owner is asked **only once T1 is
worth his 15 minutes**". §14.4: "six briefs and six renders … **held unpublished until T1 passes**" — the product is
built before the cheapest test, which is the exact inversion MISSION constraint 7 forbids ("the first thing built on any
line is the cheapest test … Not the product"). And the comparison arm — the same six analyses as pages on the brand
domain, owner step 5 already awaiting for two other lines — costs the owner nothing new, carries no YPP or account
exposure, and can produce a stranger-reach reading before a single owner minute is spent on YouTube. The verdict runs it
in parallel; MISSION rule 1 ("the owner's involvement is what we minimise") and the prompt-critique auditor ("this could
change which constraint-7 test runs first", DIGEST:352) both say run it first. Counter-argument, stated fairly: a web
null does not prove a YouTube null (different distribution). It is a prior, not a substitute — but it is a free prior,
and a channel whose substance draws zero Search impressions in 56 days is not one to spend owner minutes on.

Fix: order = (1) code path + gates G1-G10 + K-criteria as data; (2) the **one** T1 video only; (3) web arm live with
its own K0-equivalent, read at day 56; (4) Stage A asked, with the web result attached to the ask; (5) six renders
after T1 passes. Strike "asked now".

### 2.6 MAJOR — The first-named niche fails the verdict's own G1

G1: "third-party series inside OWID keep upstream licences → UNKNOWN means FAIL" (VERDICT §12). The recommended list
opens with **energy**. OWID's energy dataset is built on the Energy Institute Statistical Review of World Energy, Ember
and other third-party sources; OWID's README says data produced by third parties "is subject to the license terms from
the original third-party authors" (owid/energy-data README, via WebSearch; consistent with production-stack #13,
UPHELD). EI's terms are not rendered and its site is not on the reachable list. So most energy columns are UNKNOWN →
FAIL, and K-supply ("six materially varied videos with licence-snapshotted data within six weeks") is a predictable
kill in the niche the verdict put first. The verdict names licence-thin data only for finance/health.

Fix: before naming niches, run G1 against the codebook of each candidate OWID dataset (OWID-produced vs third-party
columns) and list only topics with ≥ 6 series that are OWID-owned or whose upstream licence page is rendered and
permits commercial redistribution. Demographics/urbanisation (UN WPP — its licence page also needs a render) and
education (UNESCO UIS) need the same check; do not assume.

### 2.7 MINOR — T1's pass criterion includes an unobservable

"The publisher's audited status confirmed" — YouTube publishes no list of audited API clients; the only observables are:
video public, not locked, no "locked as private" email [RENDERED youtube-api-revision-history.txt:878], no
auto-private/sign-out event [youtube-policy-changelog.txt:342] within 72 h. Define pass by those alone.

### 2.8 MINOR — Stage A minutes and the manager account's 2SV

20-40 minutes omits the analytics consent (§2.1, +10-15), reading our instructions, and setting up 2SV on the manager
account (required on accounts associated with a monetizing channel [changelog:266]; TOTP is scriptable, SMS is not —
state which). Realistic: 40-60 minutes once.

### 2.9 MINOR — Numbers that mix thresholds or need a label

"₪5,000 share … 1.2-6.4× the 12-month qualification volume" mixes the 4,000-h and 8,000-h gates (142k ÷ 120k = 1.2 uses
8,000 h at 6 min; 254k ÷ 40k = 6.4 uses 4,000 h at 6 min); at the 8,000-h gate alone it is 1.2-3.2×. Month-12 "₪130-250"
should carry the condition in §2.3. Both are correct arithmetic with a wrong or missing label.

### 2.10 MINOR — Constraint 8 wording

"Weakly met" is generous. The input (ranking history) does not exist at day 0 and every entrant acquires it the same
way; on the audited evidence this is not one of MISSION's three qualifying shapes at the time the decision is made. Say
plainly that the experiment is justified by constraint 7 (a measurable unknown at ~₪0) and not by constraint 8.

### 2.11 MINOR — Persona rule scope and G2

The persona rule's topic list is illustrative ("such as") [RENDERED youtube-monetization-policies.txt:244]; REGRADE
(prompt-critique C2) noted the scope sentence — personas that "deliver information on sensitive topics" — is wider than
advice. Energy (climate) and demographics (migration) are politics-adjacent. G2 screens second-person advice only; add a
screen for politically framed conclusions, and keep the About text's "AI-produced" disclosure prominent so no reviewer
reads the narrator as a human expert.

### 2.12 MINOR — Kokoro provenance is recorded but should travel with the channel

The Apache grant is the author's; the card records training on "synthetic audio generated by closed TTS models from
large providers" [RENDERED kokoro-82m-model-card.txt:233], whose terms typically forbid that use. The licence leg is met
on paper with a contested upstream. Keep the provenance note in the channel's identity kit, not only in this folder.

## 3. What was checked and did not break

- Every rendered citation in the verdict: present and verbatim (65 lines printed).
- Israel on the YPP list [youtube-ypp-availability.txt:175 under :61]: confirmed.
- Ledger 0 rows; four experimental lines killed; `maxExperiments: 3` headroom: confirmed in `colony.db`.
- Arithmetic: ₪20,000 → 569k-1.02M views; threshold channel ₪130-250; 614 = 8,000 × 28 ÷ 365: all re-derive.
- The 3.9 rejection's five reasons revisited: the verdict's NO / PARTLY / PARTLY / PARTLY / YES-for-stock reading is
  fair. The English long-form variant is a genuinely different object; the verdict neither repeats the 3.9 verdict nor
  overturns it for convenience. The "legally and honestly" clause is correctly identified as undecidable before review.
- Upload-Post free tier: the vendor's pricing page (WebSearch, 27.9) still says 10 uploads/month, API access incl.
  YouTube, no card; the contrary source is still one third-party review. Audit status: no public statement either way.
  T1 remains the right instrument.
- Brand Accounts in 2026: still creatable and still the multi-manager route (WebSearch, 27.9); channel permissions
  coexist. A2's mechanism holds; only its ownership choice is wrong (§2.2).
- The ₪200 float is untouched; no subscription is assumed; the paid publisher tier is correctly left to the owner.

## 4. What would change the decision

- **To STAY_REJECTED:** T1 fails and the owner declines both a paid tier and per-batch confirmation (as the verdict
  says); **or** the K0/K3 instrument (§2.1) cannot be obtained without recurring owner action — an unmeasurable
  experiment is not an experiment under MISSION rule 5; **or** the web arm at day 56 shows zero stranger Search
  impressions/page views for the same six analyses; **or** a public report of an Upload-Post upload locked as private
  (its audit status shown false).
- **Toward a line:** stranger watch hours ≥ ~1,200 h/28 d at day 112 (§2.3), **and** the AdSense payment method to
  Israel rendered (answer/9905), **and** a YPP admission — then a ledger row with an AdSense payment id decides, as the
  verdict says.
- **Nothing here** changes the month-3/6/12 ceilings: ₪0, ₪0, ₪0 modal.

## 5. Red-team path

`MISSION.md` → `docs/REJECTED.md:68-140` → `00-owner-reel-2026-09-25.md` → `VERDICT.md` → `DIGEST.md` (all 363 lines) →
`REGRADE.md` → 65 rendered lines printed from `research/rendered/*.txt` → `src/revenue/types.ts`, `rules.ts`,
`owner-steps.ts`, `portfolio.ts` → `state/colony/colony.db` → scouts/audits `upload-automation.md`, `discovery.md`
(grep for audit status and Analytics dimensions) → `research/colony-sweep/audits/content-seo.md:195-199` → WebSearch ×3.
No owner identifier appears in this file.
