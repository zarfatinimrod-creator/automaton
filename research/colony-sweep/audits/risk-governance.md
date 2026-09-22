# Audit — group `risk-governance`

Auditor: Opus 5. Date: 2026-09-03. Reports to the chief auditor, **not** to the group supervisor.
Mandate: refute, not agree. Default verdict when evidence cannot be opened is *not* CONFIRMED.

## 0. Auditing conditions (stated up front, because they bound every verdict below)

`WebSearch` was already at **200/200 when this audit began** — the same colony-level defect the
supervisor reported for its eight scouts applies to its auditor. I therefore ran the audit on
`WebFetch` (github.com resolves; most other domains do not), the GitHub MCP, and **first-party
repository evidence**, which turned out to be the sharpest instrument available.

Domains confirmed egress-blocked during this audit: `paddle.com`, `developer.paddle.com`,
`api.wordpress.org`, `wordpress.org`, `cv.iptc.org`, `c2pa.org`, `il-biz-tools.netlify.app`,
`api.github.com` (proxied; use the MCP or WebFetch on the HTML page instead).

**Consequence:** the supervisor's own `firstStep` for survivor #2 (fetch `active_installs` from
`api.wordpress.org`) cannot be executed by anyone in this colony right now, and neither can the
Paddle supported-countries page that every `israelPayable: "YES"` in this group rests on.

---

## 1. Evidence check — did the cited URLs exist and say what was claimed?

Opened every evidence URL in the ranked list. Result: **the supervisor did not fabricate a single
citation.** That is worth saying plainly, and it is the strongest thing in this report.

| URL | Exists | Says what was claimed? |
|---|---|---|
| `github.com/data-privacy-stack/presidio` | yes | yes — 10.7k stars, 1.3k forks, MIT, text **and image** redaction |
| `github.com/worka-ai/pii` | yes | yes — 11 stars, Rust, "richer profiles only for EN/DE/ES", **no Hebrew** |
| `github.com/thirtysix/Preserve` | yes | yes — 1 star, MIT, client-side browser demo, regex + checksum |
| `github.com/Yu-val-weiss/hebrew-ner` | yes | yes — 0 stars, a 2023-24 Cambridge Part II student project |
| `github.com/taoq-ai/wuming` | yes | yes — 4 stars, Go, 75+ detectors / 14 locales, **no Hebrew** |
| `github.com/euaicompliance/eu-ai-act-ready` | yes | **understated** — see §3.2 |
| `github.com/omergili/neuralflow-wp` | yes | yes — 0 stars, 7 commits |
| `github.com/ValentinGratz/ai-transparency-notice` | yes | yes — 1 star, 39 commits |
| `github.com/SerhiiRaievskyi/ainsign` | yes | **understated** — see §3.2 |
| `github.com/hexrift/oprindo-sdk-py` | yes | yes — 0 stars / 0 forks / 0 issues / **2 commits** |
| `github.com/contentauth/c2pa-mcp` | yes | yes — 4 stars; note it references "official C2PA and **Interim Trust Lists**" |
| `github.com/contentauth/c2pa-rs` | yes | yes — 413 stars, active, README is **silent on certificates and trust lists** |
| `cv.iptc.org/newscodes/digitalsourcetype/` | **unreachable** | `trainedAlgorithmicMedia` is **UNVERIFIED in this session** |

The one term that appears in the pitch of **two** survivors — `trainedAlgorithmicMedia` — could not
be verified against its own vocabulary. It is model memory, not evidence, exactly like the Apple
$99 figure the supervisor correctly refused to record.

---

## 2. The finding that governs the whole group: the Paddle rail

Every one of the three survivors is `israelPayable: "YES"` **because of Paddle**, and the pitches
describe Paddle as already shipped: *"the existing Paddle merchant account"*, *"rides rails already
shipped"*, *"no new payment integration"*.

### 2.1 First-party contradiction — the rail is not shipped

`/home/user/automaton/products/il-biz-tools/src/config/site.json`:

```json
"paddle": { "clientToken": "", "priceId": "", "environment": "sandbox" },
"pro":    { "publicKey": null }
```

There is no Paddle account, no client token, no price id, no licence signing key, and the
environment is `sandbox`. `products/il-biz-tools/README.md` states the Pro box renders **בקרוב**
until both are set. The supervisor's own `ownerBlockers` say Paddle onboarding is *not done* — so
the report asserts a shipped rail in three pitches and denies it in three blocker lists. This is the
same class of overstatement the supervisor (correctly) punished its `ai-disclosure` scout for.

Also: `state/` does not exist and there is no ledger database in the tree. **Zero shekels have been
recorded anywhere.** Every survivor is pre-first-transaction.

### 2.2 The sibling group had better evidence and it says UNKNOWN

`research/colony-sweep/scouts/storefronts--paddle.md`, produced in this same sweep, reaches:

> **Verdict on payability to Israel: YES (medium confidence).** … Not upgraded to high confidence
> because I could not render the supported-countries page and found **no first-hand report by a
> named Israeli Paddle seller**.

and earlier, explicitly: *"is Israel on an explicit Paddle supported-seller list" is
**UNKNOWN-leaning-YES** rather than a hard YES.*

The risk-governance supervisor printed `"israelPayable": "YES"` three times on top of a
sibling's *medium-confidence, page-never-rendered, no-first-hand-report* finding. Under this
colony's own rule — unverified is not confirmed — the correct value is **UNKNOWN**.

### 2.3 Four Paddle facts that appear nowhere in this group's report

From the same sibling scout, all four material and all four absent from the risk-governance
ownerBlockers, killCriteria and ceilings:

1. **Pre-revenue rejection risk.** Paddle has rejected sellers for having *no 3-month processing
   statements* (HN 41179262). The scout calls this "**the single biggest risk to our approval**,
   because our products are pre-revenue." All three survivors are pre-revenue. This group's
   `ownerBlockers` mention Sumsub and the MSA and never mention approval risk at all.
2. **Domain review.** Paddle reviews the selling domain and wants refund/T&C/contact pages easy to
   find. `il-biz-tools` is **not deployed** (task #9 is still pending; the netlify.app host is
   unreachable from here). There is no domain to submit.
3. **ILS is not a payout currency.** An Israeli seller takes USD by international SWIFT wire:
   Paddle **5% + \$0.50 per transaction**, a **\$15 SWIFT fee**, the receiving Israeli bank's own
   charge, and ~1.5%+ FX spread. Every ceiling in this report is **gross**.
4. **\$100 minimum payout, paid on the 1st and landing by the 15th.** First money reaches a bank
   ~6 weeks after the sale that crosses the threshold.

### 2.4 The kill criterion for survivor #1 cannot produce a shekel in the ledger

The stated kill test is *"fewer than 5 paid unlocks … in the first 60 days"*. Five unlocks at
₪29–59 is roughly **\$40–80 gross**, i.e. **below Paddle's \$100 payout minimum**. Survivor #1 can
therefore **pass its own kill criterion and bank ₪0**, while MISSION §2 counts a shekel only when it
lands in `revenue_ledger` with a platform transaction id. The gate is calibrated in the wrong unit.

### 2.5 The better-evidenced rail was in the same sweep and was not used

`research/colony-sweep/scouts/storefronts--gumroad.md` establishes Israeli payout with the hardest
evidence anywhere in this sweep — not a help-centre summary but Gumroad's own open source:

- supported-countries payout table row `Israel | ILS`
- `app/services/update_payout_method.rb` → `IsraelBankAccount.name => { class: IsraelBankAccount … }`
- `config/sidekiq_schedule.yml` lists `"IsraelBankAccount"`
- `spec/lib/utilities/compliance_spec.rb` → `"IL" => "Israel"`
- payout is **direct bank deposit in ILS** — no SWIFT wire, no FX at payout

The supervisor built **100% of its portfolio** on the rail it could not verify and mentioned the
rail with code-level Israeli proof only as a fallback if the owner refuses a selfie. That is a
portfolio-construction error, not a research gap.

---

## 3. Per-candidate verdicts

### 3.1 Browser-only Hebrew document redaction — **DOWNGRADED**
**Corrected ceiling ₪150/month (from ₪800). israelPayable → UNKNOWN. Month one: ₪0.**

What survives. The Hebrew gap is **real and I confirmed it independently**: `Preserve` covers
*"US, UK, Finland, Canada, France, Germany, Brazil, India, Mexico, Spain, Italy, South Korea, Japan,
Netherlands"* — no IL, no Hebrew; `wuming` covers 14 locales — no IL, no Hebrew; `worka-ai/pii` has
profiles only for EN/DE/ES. Zero-PII-by-construction is a genuine architectural virtue.

What does not.

1. **The moat argument is a category error.** The supervisor justifies rank #1 partly on "the best
   Hebrew NER prior art found anywhere was a 0-star student project." But the product's own
   identifier list — ת"ז, phone, IBAN, email, address — is **regex and checksum work, not NER**.
   Israeli NER is irrelevant to four of the five identifiers.
2. **The detector already exists in this repo.** `products/x402-il-api/src/israeli.ts` already
   implements the ת"ז checksum, the full Israeli mobile/landline/VoIP/premium regex set, and the
   Bank of Israel institution codes. The claimed technical moat is *already written and already
   open-source under the owner's own name*.
3. **The group killed this exact detector on the previous page.** `rejected` contains *"Standalone
   Israeli identifier-validation endpoints … No buyer could be named, which under the rules means no
   buyer was found."* Survivor #1 is that same detector with a UI, and its buyer is — by the
   supervisor's own admission in the `buyer` field — **inferred, never observed**. One rule, two
   opposite outcomes, in one report.
4. **The inferred workflow runs against the direction of Israeli document flow.** Israeli invoicing
   *requires* identifiers: this repo's own `products/il-biz-tools/src/lib/invoice.js` refuses to
   validate a document without one — `errors.push('חסר מספר עוסק / ת.ז.')` — and
   `src/config/allocation-number.json` records that from 2026-06-01 an invoice over ₪5,000 must
   carry a Tax Authority allocation number or the recipient loses input VAT. A bookkeeper forwarding
   client documents to the ITA, to the client's accountant, or into a filing must **keep** the ת"ז,
   not strip it. The one workflow that does want stripping — pasting a document into an LLM — is
   already served free by `Preserve`, which ships a client-side browser demo today and would need a
   pull request, not a competitor, to cover Israel.
5. **Free anchors the price at zero.** Presidio (MIT, 10.7k stars, does image redaction too),
   Preserve (MIT), wuming (Go, zero-config). Two of these shipped in 2026. A ₪29–59 unlock is priced
   against three free incumbents and one afternoon of work for anyone who wants IL patterns.
6. **30 build hours is out by 3–5×.** The estimate covers the detector, which is the part already
   written. It does not cover in-browser extraction of **PDF and DOCX with Hebrew RTL**, and it does
   not cover the case that actually arrives at a bookkeeper's desk — a **scanned** document, which
   needs Hebrew OCR in WASM. Hebrew OCR alone exceeds 30 hours and will not clear the supervisor's
   own ≥95% recall gate. Realistic: 90–150 hours, with a live risk that the recall gate fails.
7. **No distribution.** The site is not deployed, has no traffic, no list, no backlinks, and the
   constitution forbids the tactics that would manufacture them. Month one for a brand-new Hebrew
   niche page with no audience is **zero unlocks**, and that is not pessimism, it is the base rate.

**Corrected honest ceiling: ₪150/month**, contingent on Paddle approval that is itself at risk for a
pre-revenue seller. `israelPayable` corrected to **UNKNOWN**.

The one defensible action here is not a product: contribute an Israeli pattern pack upstream to
Preserve/wuming, at zero revenue, and keep the ת"ז/phone/bank validators free beside the existing
x402 endpoints — which is exactly what the group already decided in `rejected`.

### 3.2 WordPress AI-disclosure plugin — **DOWNGRADED**
**Corrected ceiling ₪200/month (from ₪600). israelPayable → UNKNOWN. tosRisk GREEN → AMBER.**

What survives. WordPress.org is the only genuine distribution channel any survivor in this group
has. That much is right, and it is why this is a downgrade and not a refutation.

What does not.

1. **The ceiling was cut using a metric the supervisor itself declared invalid.** `whyThisRank`
   reasons from GitHub stars ("fourteen have zero stars and one has one star"). `firstStep` says the
   right metric is `active_installs` from `api.wordpress.org`. WordPress plugin users install from
   the wp-admin screen and never see GitHub; stars measure nothing here. Both `api.wordpress.org`
   and `wordpress.org` are egress-blocked, so **demand for this line is entirely unmeasured** — the
   ₪600 is not a corrected number, it is a number derived from the wrong instrument.
2. **The lead competitor is far stronger than reported.** I opened `euaicompliance/eu-ai-act-ready`:
   **v2.2.3, 76 commits, WPML translations, a companion commercial domain `eu-ai-act-ready.com`,
   and — decisively — "compliance readiness scoring, self-assessment wizards, AI systems detection,
   content labeling, and exportable compliance reports."** The proposed paid tier is *"site-wide
   policy, per-post overrides and an export of what was disclosed when."* **That paid feature set is
   already shipped, free, by the incumbent.** Reporting this repo as "1 star" and concluding "no
   buyers" reads its metadata and not its product.
3. **The business model is already taken.** `SerhiiRaievskyi/ainsign` states a **free version with a
   paid version sold separately** and is **pending review on WordPress.org**. The exact freemium
   shape proposed here is being executed right now by a competitor already in the review queue.
4. **GREEN on terms is not defensible while the killCriteria says what it says.** The supervisor
   writes: *"we have not read one sentence of the Official Journal and selling an AI Act compliance
   claim on repo-description evidence is a constitution violation."* It then rejected a sibling line
   (*Article 50 disclosure audit*) on precisely that basis — and marked this one GREEN. A plugin
   that inserts "Article 50-style disclosures", chooses which badge text discharges a duty, and
   writes an IPTC term into a customer's images **is** an interpretation of the statute, however the
   marketing copy is worded. The IPTC term itself (`trainedAlgorithmicMedia`) could not be verified —
   `cv.iptc.org` is blocked. Correct rating: **AMBER**, gated on reading the primary text.
5. **35 hours excludes the expensive half.** A paid WordPress tier needs a licence API and an update
   endpoint (this is the entire reason Freemius exists). The supervisor rejected Freemius *to reuse
   Paddle* — which **adds** that work rather than removing it. Plus GPL compliance, i18n/RTL, the
   WordPress.org submission and its review rounds. Realistic: 60–90 hours plus a queue wait measured
   in weeks.
6. **Ongoing human duty, judged by this group's own Etsy standard.** The supervisor disqualified
   Etsy — correctly — for an *"ONGOING human duty to answer buyer convos and cases."* A
   WordPress.org listing carries a **public support forum in the author's name**, plus a human
   correspondence loop with the plugins review team, plus (per the sibling scout) *"respond once to
   any Paddle request for more information during domain review."* Each is a person-facing thread the
   owner does not do. The Etsy standard was applied to Etsy and waived here.

**Corrected honest ceiling: ₪200/month**, unmeasured, against a free incumbent that already ships
the paid features and a competitor already selling the same freemium split.

### 3.3 C2PA / IPTC provenance-signing API — **REFUTED**
**Corrected ceiling ₪0. israelPayable → UNKNOWN.**

The supervisor writes *"Last, and I would not start it"* and then ranks it, which is the error. By
this group's own rules it belonged in `rejected`, and here is why it does not survive at all:

1. **The make-or-break question is unresolved and unresolvable here.** Whether a solo Israeli
   operator can obtain a trust-listed signing certificate is, in the supervisor's own words, *"not a
   detail, it is the whole product."* `c2pa.org` is egress-blocked; `c2pa-rs` README is silent on
   certificates. The only new datum I found points the wrong way: `contentauth/c2pa-mcp` describes
   *"periodic updates to official C2PA and **Interim Trust Lists**"* — trust lists are a real,
   curated gating mechanism. An unresolved existential gate is not a rank-3 line, it is a no.
2. **The demand evidence is refuted by the supervisor itself.** `oprindo-sdk-py`: **2 commits**, 0
   stars, 0 forks, 0 issues, abandoned four days after creation. The group's stated rule is *"No
   buyer could be named, which under the rules means no buyer was found."* Applied consistently, this
   line is rejected.
3. **The architecture contradicts two of the group's own standards.** Hosted signing means customer
   media is uploaded to our servers — directly against the *"zero-PII architecture standard"* this
   group lists as its own output, and against the reasoning that made DSAR SaaS **RED** (*"requires
   holding other people's personal data"*). Note that oprindo, the cited comparable, explicitly
   designs the opposite way: *"content stays local."*
4. **Key custody has no accountable human, and that is a constitution problem, not an ops problem.**
   A C2PA signing key asserts provenance to third parties. If an autonomous agent's key signs a false
   or mistaken claim, there is no human to answer for it — and the owner will not talk to anyone. A
   product whose entire value is a trust assertion cannot be operated by a party that refuses to be
   accountable for the assertion. This is a MISSION §1 / constitution collision the report does not
   raise.
5. **Margin is negative-leaning.** Compute plus key custody plus certificate cost, against
   `contentauth`'s free 413-star SDK that any customer can run themselves. Build hours are not
   estimable while the certificate question is open, so "30" is a placeholder.

**REFUTED. Corrected ceiling ₪0.** If anyone revisits it, the only permitted first step is answering
the certificate question from a primary source with a live search budget — no code, no design.

---

## 4. The supervisor's own errors

1. **Asserted a shipped Paddle rail that does not exist**, contradicted by `site.json`
   (empty token, empty price, `sandbox`, `publicKey: null`) and by its own blocker lists.
2. **Printed `israelPayable: "YES"` three times** over a sibling scout's explicit
   *UNKNOWN-leaning-YES / medium confidence / no first-hand Israeli seller found*.
3. **Omitted Paddle's pre-revenue rejection risk entirely** — the sibling scout's single biggest
   named risk, and it applies to all three survivors.
4. **Omitted domain review**, though `il-biz-tools` is not deployed and has no domain to submit.
5. **All ceilings are gross.** No line nets out 5% + \$0.50, the \$15 SWIFT fee, ~1.5%+ FX, or the
   fact that **ILS is not a Paddle payout currency**.
6. **Survivor #1's kill criterion (5 unlocks) sits below Paddle's \$100 payout minimum** — the line
   can pass its own test and record ₪0 in the ledger.
7. **Built the entire portfolio on the weaker-evidenced rail** while a sibling group in the same
   sweep held **source-code-level proof of ILS-native Gumroad payouts to Israel**.
8. **Applied its own rules inconsistently, three times:** "no buyer named = rejected" (applied to the
   identifier endpoints, waived for survivor #1's inferred buyer and survivor #3's refuted one);
   "no primary text read = AMBER/reject" (applied to the Article 50 audit, waived for the Article 50
   plugin); "ongoing human duty = disqualifying" (applied to Etsy, waived for a WordPress.org support
   forum and a Paddle domain-review email thread).
9. **Cut survivor #2's ceiling using GitHub stars** while its own `firstStep` names `active_installs`
   as the only valid metric — a conclusion drawn from an instrument it had already declared unfit.
10. **Under-read its own strongest evidence twice:** `eu-ai-act-ready` already ships the proposed
    paid features free at v2.2.3 with a commercial site; `ainsign` already sells the proposed
    freemium split and is in the WP.org queue. Both were reported as near-zero-star nobodies.
11. **Ranked a line it said it would not start.** Survivor #3's own `whyThisRank` refutes its demand
    evidence and leaves its existential question open; that is a `rejected` entry.
12. **Adopted the `owner-kyc-catalogue` scout "wholesale"** while simultaneously reporting that the
    scout ran **zero searches** and its headline numbers are unverified — the exact failure mode it
    criticised in its siblings.
13. **Listed an accountant consultation as a routine owner blocker** without flagging it as a direct
    collision with the owner's verbatim brief (*"אני רוצה דרכים בלי שאני צריך אישור של עורך דין או
    אישורים כאלה"*) and with "does not talk to people". It flagged the Sumsub liveness video as a
    MISSION collision — correctly — and gave this one a pass.
14. **Did not fold its own ROOT blocker into the ranking.** Its `rejected` list says selling as an
    unregistered individual is **RED**; therefore all three survivors are gated behind Israeli tax
    registration, and none has a time-to-first-shekel shorter than that step. The ranking is written
    as though the lines could start tomorrow.

## 5. Angles the group missed entirely

1. **Gumroad's ILS-native payout** (`IsraelBankAccount` in Gumroad's own source; payout table row
   `Israel | ILS`; direct ILS bank deposit, no SWIFT, no payout FX) — strictly better Israeli
   evidence than Paddle, available inside this same sweep, unused.
2. **Net-of-fee economics at this scale.** At a ₪29–59 unit price, \$0.50 + 5% is an 8–11% take
   before FX and the \$15 wire. Ceilings under ₪1,000/month should be quoted net or not quoted.
3. **The \$100 payout threshold as a design constraint** on unit price and on every kill criterion in
   the colony — currently none of them are expressed in bankable units.
4. **Paddle's 2026 gen-AI AUP update**, which puts *AI image generators, face swap, deepfakes, voice
   cloning* under enhanced due diligence. Survivors #2 and #3 are AI-provenance products that sit
   adjacent to that category. Probably fine; entirely unexamined.
5. **WordPress.org as an ongoing human-facing obligation** (public support forum, review
   correspondence, author identity) measured against the Etsy disqualification standard.
6. **Key custody and accountability** for any signing key an autonomous agent holds — the governance
   question a governance group should have owned.
7. **Lemon Squeezy is Stripe-owned.** `INCOME_PLAN.he.md` line 14 still lists Lemon Squeezy as a
   working Israeli route while this group concluded Stripe is unavailable to Israeli sellers. Nobody
   reconciled the two. (Flagged as an angle to check, not a finding — I could not verify it here.)
8. **Distribution was never costed for survivors #1 and #3.** Neither has any channel at all, and the
   constitution forbids the tactics that would create one. A ceiling without a channel is a guess.
9. **`INCOME_PLAN.he.md` line 14 — "ישראל רשומה כמדינת מוכר נתמכת" — is an unsourced prior-session
   assertion** whose citation (line 104) is currently unreachable. It is being inherited as settled
   fact across groups. It should be marked UNVERIFIED in the plan until someone renders that page.
10. **Nobody proposed the free, zero-risk move:** ship the Israeli identifier detector as a
    contribution to `Preserve`/`wuming` and as free endpoints beside x402. It earns ₪0 and it is the
    only honest use of the one real technical asset this group found.

## 6. Bottom line

The supervisor's headline — *"there is almost no money in this group"* — is correct and understated.
Corrected: **survivor #3 is ₪0**, survivors #1 and #2 are **₪150 and ₪200** of unmeasured, undated
ceiling, all three are **UNKNOWN** rather than YES on Israeli payability, all three are gated behind
an unbuilt Paddle account with a live pre-revenue rejection risk, and all three sit behind the ROOT
Israeli tax registration. The group's honest output is its kill-list, its Apify KYC finding, and its
governance standards — not a portfolio.
