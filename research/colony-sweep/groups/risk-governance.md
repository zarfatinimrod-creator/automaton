# GROUP REPORT — risk-governance

**Supervisor:** SUPERVISOR `risk-governance` (Opus 5)
**Date:** 2026-09-03
**Scouts reporting:** 8 — `automation-tos`, `ai-disclosure`, `owner-kyc-catalogue`,
`selling-as-individual`, `privacy-exposure`, `consumer-protection`, `audit-trail`,
`agent-failure-modes`.
**Scout notes:** `/home/user/automaton/research/colony-sweep/scouts/risk-governance--*.md`

---

## 0. Headline for the board

**There is almost no money in this group, and I am not going to pretend otherwise.**

Of ~40 findings across 8 scouts, **31 have an honest monthly ceiling of ₪0** because they are
*gates*, not products: platform terms, KYC steps, tax registration, ledger structure, agent
guardrails. The group's real output is a **kill-list and an owner-blocker catalogue**, and that
is worth more to the colony than the three thin product ideas that survived.

The three survivors are all **weak-evidence, low-ceiling bets** (₪500–800/month honest ceiling,
against a ₪20,000 target). None of them should be built ahead of the payment-rails and
storefront groups' lines. I rank them because I was asked to, not because I believe in them.

**The single most valuable thing this group produced is not a product.** It is this:
I verified — where the scouts could not — the binding Apify Store Publishing Terms, which say
that **no payout, no priced Actor, and no x402/agentic eligibility exists until the owner
personally completes KYC** (government ID, proof of address, tax documentation, UBO). The
colony's designated core line (`products/apify-il-open-data`) is therefore blocked on one human
step that nobody has done.

---

## 1. Verification I ran myself (the scouts were blind; I was not, entirely)

WebSearch was **exhausted (200/200) before all eight scouts ran** — every one of them was
structurally blind. WebSearch is still dead for me. WebFetch against `github.com` /
`raw.githubusercontent.com` and `mcp__github__search_code` **do** work, so I re-derived the
load-bearing claims from there.

| Claim | Scout's grade | My verification | Verdict |
|---|---|---|---|
| GitHub ToS: one free account + one machine account; no bot-registered accounts; no login sharing | rendered quote | **Re-fetched `github/docs` ToS verbatim, 2026-09-03** | **CONFIRMED** |
| Apify: `$20 for PayPal and Wise` / `$100 for other payout methods` | docs page | **`mcp__github__search_code` returned the exact line in `sources/platform/actors/monetizing/monthly-payouts.mdx`** | **CONFIRMED** |
| Apify: negative-profit auto-zeroes an Actor | docs page | **Verbatim: "If your PPE Actor's price doesn't cover its monthly platform usage costs, it will have a negative profit. When it happens, Apify automatically sets that Actor's profit to $0 for the month."** | **CONFIRMED** |
| Apify Store publishing T&C — scout said "blocked and unread" | **DEAD END** | **I found and read it: `sources/legal/latest/terms/store-publishing-terms-and-conditions.md`.** §10.1.2: *"To become a Verified Creator and receive a payout, you must successfully complete identity verification and the Know Your Customer (KYC) process. This may include providing government-issued identification, proof of address, tax documentation, and ultimate beneficial ownership information."* §10.1.3: *"No payments will be issued until verification is complete to our satisfaction."* Payout = **80%** of user fees minus platform usage costs. Termination if a creator fails to "pass or maintain the KYC process" or appears on sanctions/watchlists. | **CLOSED — upgrade over the scout** |
| Apify x402 "no account required" is a route around KYC | implied | **FALSE on the sell side.** `sources/_partials/_agentic-payments-eligibility.mdx`: *"The Actor's developer must also have completed identity verification (KYC)… Until they do, none of their Actors are eligible."* Also requires pay-per-event only, no Standby, limited permissions. | **CORRECTED** |
| EU AI Act Art. 50 applies 2 Aug 2026 | repo prose, 3 repos | eur-lex **EGRESS_BLOCKED**. One repo (`onepercentnetworkllc/eu-ai-act-article-50`, "verified against the Official Journal") says the **Digital Omnibus delayed the high-risk chapter but *not* Article 50** — consistent, still not primary text. | **STILL UNVERIFIED** |
| `hexrift/oprindo-*` proves a competitor believes in the C2PA buyer | "a competitor already believes this buyer exists" | **Overstated.** Both repos: **0 stars, 0 forks, 0 issues, last touched 2026-07-31, four days after creation.** An abandoned weekend project, not market validation. | **DEMOTED** |
| Article 50 tooling market shape | "10 repos, 8 with zero stars" | **Worse than reported: `search_repositories` returns 30 repos; of the top 15, 14 have zero stars and one has 1 star.** A pure supply glut with no observable buyer. | **CONFIRMED, and worse** |
| C2PA signing certificate obtainable by a solo Israeli operator | "UNVERIFIED, biggest unknown" | `opensource.contentauthenticity.org` **EGRESS_BLOCKED**; `contentauth/c2pa-rs` README says nothing about certificates or trust lists. | **STILL UNVERIFIED — remains the kill criterion** |
| Israeli law: תקנה 2 registration on day one; ₪122,833 ceiling; תיקון 13 | statute mirror / repo-corroborated | `kolzchut.org.il`, `gov.il`, `nevo.co.il`, `eur-lex` **all EGRESS_BLOCKED**. Nothing I could add. | **UNVERIFIABLE HERE** |
| Telegram Stars duties (`/paysupport`, sole dispute responsibility, `refundStarPayment`) | secondary mirror | `core.telegram.org` **EGRESS_BLOCKED** | **UNVERIFIED** |

---

## 2. Survivors — ranked (3, not 6)

### #1 Browser-only Hebrew document redaction (Pro unlock on `products/il-biz-tools`)
- **Score 42/100.** Best *fit*, weakest *evidence*.
- Static WASM page that strips ת"ז / phone / IBAN / email out of Hebrew documents **entirely
  client-side** — the file never leaves the tab. Sold as a Pro unlock on the Paddle checkout
  already shipped.
- Why it ranks first: **GREEN** on terms; zero new owner blockers (rides the existing Paddle
  identity, which is *not yet done*); zero-PII by construction, so it survives every privacy
  finding in this group untouched; high margin (no server); the Hebrew gap is real — the best
  prior-art Hebrew NER found anywhere was `Yu-val-weiss/hebrew-ner`, **0 stars, a student
  project last touched 2025-03-15**.
- Why the ceiling is **₪800, not the scout's ₪2,500**: the buyer (Israeli bookkeepers) is
  *inferred from a workflow*, never observed. Presidio (10,730 stars) is free. il-biz-tools has
  no proven traffic.

### #2 WordPress AI-disclosure plugin, free + paid tier
- **Score 32/100.**
- Free plugin on WordPress.org inserting Article 50-style disclosures (visible badge, chatbot
  notice, IPTC `digitalSourceType` on images); paid tier for site-wide policy and an evidence
  log, billed through the existing Paddle account.
- Real distribution surface (WordPress.org) is the only thing it has that the others don't.
- Against it: **four free competitors in seven months** (`euaicompliance/eu-ai-act-ready`,
  `omergili/neuralflow-wp`, `ValentinGratz/ai-transparency-notice`, `SerhiiRaievskyi/ainsign`),
  every one at 0–1 stars, plus 26 more Article 50 repos I found. Four builders and no buyers is
  a **supply signal, not a demand signal**. Ceiling cut ₪1,200 → **₪600**.
- **Hard constraint:** it must be sold as *tooling*, never as "compliance". We have not read one
  sentence of the Official Journal. Selling an AI Act compliance claim on repo-description
  evidence is a constitution violation, not a TODO.

### #3 C2PA / IPTC provenance-signing API on the existing x402 or Paddle rails
- **Score 25/100.** Ranked last and I would not start it.
- Hosted API that signs a customer's generated media with C2PA Content Credentials and sets
  `digitalSourceType: trainedAlgorithmicMedia`.
- Two things gutted it under verification: the "competitor validates the market" claim is an
  **abandoned 0-star repo**, and **whether a solo Israeli operator can obtain a trust-listed
  signing certificate at all is still unknown** — that is not a detail, it is the whole product.
- Also margin-negative relative to the others: a hosted signing service carries compute and key
  custody, while `contentauth`'s own SDKs are free for anyone who can run a library.
- Ceiling cut ₪1,500 → **₪500**.

---

## 3. Rejected, and why

**Rejected on terms (rule 3: no AMBER, no RED):**

| Line | Grade | Why |
|---|---|---|
| Article 50 site-audit scan sold as a paid report | AMBER | Sells an interpretation of a statute nobody in this colony has read. Three free open-source equivalents, all 0 stars. |
| Hebrew privacy-notice / RoPA generator | AMBER | Would state תיקון 13 obligations with **zero sentences of תיקון 13 read**. Free 4,676-star prior art. |
| Hebrew refund/cancellation policy generator | AMBER | Same shape. Its own scout flagged an unresolved contradiction (§1.3) about whether digital goods fall inside the 14-day right — publishing a confidently wrong Hebrew legal page is worse than earning nothing. |
| DSAR automation / consent-management SaaS | RED | Requires holding other people's personal data **and** an accountable human meeting statutory deadlines. Disqualifying under MISSION §1. |
| Any GitHub-derived lead-gen, maintainer email lists, recruiter feeds, star/follow growth | RED | GitHub AUP, verbatim: scraping is permitted only for open-access research and archival, and *"You may not use information from the Service … for spamming purposes, including … selling personal information, such as to recruiters, headhunters, and job boards."* Standing veto handed to **every other scout group**. |
| Any product harvesting Telegram content into a dataset or model | RED | Telegram added an explicit AI/scraping prohibition on 2026-02-03, postdating earlier colony research. Any prior "scrape Israeli Telegram groups" idea is re-killed. |
| Any Google-SERP-derived product; any design needing >1 Google account | RED/AMBER | Google ToS makes robots.txt compliance contractual and bans fake accounts. |
| Selling as an unregistered Israeli private individual on foreign rails | RED | תקנה 2 requires registration on the day activity begins; a continuously-sold digital product is not "באקראי"; the de-minimis is cumulative and VAT-only. Revenue booked this way is a liability, not income. |

**Rejected on ceiling (<₪300/month) or no buyer:**

| Line | Why |
|---|---|
| Cookieless analytics for Israeli SMBs | Five actively maintained free competitors in one search, one at **391 stars in three weeks**. Ceiling ₪300 at best. No distribution advantage. |
| Standalone Israeli identifier validators on x402 | Scout could not name a buyer. Entire GitHub search space = **1 repo, 0 stars, never updated after its creation day**. Ship only as free filler, never as a line. |
| Steam AI-disclosure tooling | Audience (players), not a buyer. Incumbent free extension at 148 stars. Ceiling ₪0. |
| AI-authorship disclosure in software supply chains | `chaoss/disclosure` is free, foundation-backed, 26 stars, actively maintained. Ceiling ₪0. |
| W3C HTML AI-disclosure markup | Pre-standard. No conformance requirement ⇒ no compliance buyer. Revisit only if a platform or regulator names it normatively. |
| Selling KYC/onboarding help to Israelis | Trust- and regulated-adjacent; an anonymous agent-run operation cannot run it honestly. |
| Israeli tax content as a product | Crowded (12+ unmonetised repos) and a trust business. Keep `il-biz-tools` calculators free. |

**Rejected as products but KEPT as binding governance (ceiling ₪0 — this is the group's real output):**

1. **GitHub is one account, not a fleet.** Agents authenticate as the owner's single free account
   or one machine account he created. **No agent may ever register an account.** Any design with
   an account per agent is a ToS violation and dies immediately.
2. **GitHub Actions is not the colony's compute and Pages is not its SaaS host.** Actions may not
   run "activity unrelated to the production, testing, deployment, or publication of the software
   project"; Pages may not host "commercial businesses, e-commerce sites, or SaaS offerings".
   `colony.yml` must be audited quarterly; revenue workloads move to paid compute.
3. **Route consumer sales through a Merchant of Record (Paddle).** Under an MoR the counterparty
   to the consumer is Paddle: withdrawal duty, refund administration, chargebacks and tax
   remittance sit with them. Cheapest way for an owner-does-nothing operation to discharge
   consumer duties across ~180 jurisdictions. **Not a full shield** — never publish a support SLA
   ("we reply within 5 business days") that only a human could meet; publish auto-approve rules
   an agent can actually honour.
4. **x402 sells to businesses and developers only.** On-chain micropayments cannot be reversed,
   so a consumer statutory withdrawal right cannot be discharged. Consumer sales over x402 are
   forbidden.
5. **`products/telegram-il-tools-bot` is a higher consumer-risk surface than anything sold via
   Paddle** — Telegram assigns *sole* dispute responsibility to the bot owner and requires
   `/terms`, `/support` and `/paysupport`. The only owner-does-nothing posture is a fully
   automated `refundStarPayment` rule. Wire it before taking another Star.
6. **Price every Apify PPE Actor above its platform usage cost from day one** — underpricing does
   not produce a small loss, it produces exactly ₪0 for that Actor that month. Max one significant
   price change per Actor per month, 14 days' notice, and **planned changes cannot be cancelled**.
7. **Zero-PII architecture standard.** Every line must hold no personal data: no accounts, compute
   in the client, no IP/content logging, no free-text intake, payment data owned by the processor.
   Any obligation that needs an accountable human to answer a regulator or a data subject is
   structurally undischargeable here.
8. **Ledger gaps an accountant will hit** (from `audit-trail`, verified against our own schema):
   `revenue_ledger` records no FX rate/date/source, no gross/fee/net split, and no
   payout↔sale linkage. A shekel figure nobody can re-derive is not evidence.
9. **Agent guardrails** (from `agent-failure-modes`, all evidence rendered): no secret-scanning
   step exists in `ci.yml`; add gitleaks. Turn/recursion ceilings, spend caps, and stall detection
   are the documented failure modes (OWASP GenAI LLM Top 10, published 4 Aug 2026: LLM03 Excessive
   Agency, LLM06 Unbounded Consumption). `ledger.ts:346-372` already refuses money without a
   platform transaction id — the strongest anti-hallucinated-revenue control we have — but it does
   **not** reconcile our totals against the platform's own.

---

## 4. Owner blockers — merged, deduplicated, ordered by dependency

Nothing here may be assumed done. Every line stays `awaiting_setup` until the owner confirms.

**Root (everything depends on it)**
1. Open תיק עוסק at מס הכנסה; register for מע"מ (עוסק פטור to start, plan עוסק מורשה before
   ₪20k/month); register as עצמאי at ביטוח לאומי. **Before the first payout is enabled, not after
   the first shekel lands.** Produces the Foreign TIN everything else needs.
2. One accountant conversation, two questions only: (a) §30(א)(5) zero-rating of digital exports
   with a Merchant of Record; (b) whether עסק זעיר's "יגיעה אישית / no employees" conditions
   survive when the work is done by software the owner owns.

**Payout rails**
3. PayPal **Business** account in his legal name; identity verification; Israeli bank account with
   the name in **Latin characters** (Hebrew is rejected); a credit card linked separately as the
   funding source.
4. **Apify** (gates the colony's designated core line): create the account, complete billing
   details and select PayPal or Wise **before any Actor pricing can be defined**, then pass KYC —
   **verified today** as government ID + proof of address + tax documentation + UBO, with *"No
   payments will be issued until verification is complete"*. This also gates x402/agentic
   eligibility for every one of our Actors.
5. **Paddle**: create the seller account as "Individual", supply tax information, **sign the
   Master Services Agreement** (a human contracting act — no agent may sign), pass Sumsub ID.
   ⚠️ **MISSION COLLISION:** Sumsub may demand a **short liveness selfie video**, which the mandate
   forbids. Unverified (paddle.com is blocked). If the owner refuses, re-route the dependent lines
   to Gumroad/PayPal rather than leaving them in `awaiting_setup` forever.
6. **W-8BEN** on every US-domiciled payer (Gumroad, Envato, Creative Market), using the Foreign TIN
   from step 1. Omitting it silently costs up to 30% of US-sourced revenue.
7. **Invoicing**: open a Morning / SUMIT / Cardcom account in his own name and generate one API key
   + secret. Everything after is API. **ITA מספר הקצאה enrolment is NOT yet required** — the
   threshold is a *single* invoice above ~₪5,000–10,000 net and our lines bill per download/event/
   call. Do not add it; add a code-level threshold assertion instead.

**Per-platform, cheap**
8. **GitHub**: only the owner may create the single free account and (optionally) one machine
   account.
9. **Telegram**: create the bot via BotFather from his own phone-verified account and hand over the
   token (~2 min, no documents). Converting Stars later needs **Fragment KYC** (Sumsub: ID scan +
   selfie) plus an Israeli licensed exchange with its own KYC — treat both as required until he
   sees his own Fragment page. **Stars earned but not withdrawn are not banked revenue.**
10. **Chrome Web Store**: a Google account with phone-verified 2FA and a card for the one-time
    US$5. CWS has **no payments at all** since Feb 2021 — distribution only, so no store payout or
    tax workstream. Cheapest store to be on.

**Flagged as disqualifying, not merely inconvenient**
11. **Etsy** — Persona government ID **plus a clear selfie**, and, critically, **an ongoing duty to
    answer buyer convos and cases that cannot be delegated to software**. That is a permanent
    mismatch with "the owner does not talk to customers", not a one-time KYC exception.
    Recommend **last or never**.
12. **Google Play** — US$25, Israeli **PSP-Law identity verification**, and **enhanced**
    verification above ₪50,000 over a trailing six months (crossed before the first target). A
    possible **12-tester closed-testing requirement** for new personal accounts would require
    recruiting real humans, which the mandate forbids and agents may not fake. **Answer that
    question before scheduling any Play work.**
13. **Stripe** — not an Israeli-seller rail. The route Israelis are pushed to is a US LLC + EIN +
    US bank: a company formation, far outside "one-time identity step". Out of scope.
14. **Apple** — genuinely unresearched by any scout. The $99/W-8BEN shape is memory, not evidence.

---

## 5. Scouts whose work was thin or unsourced (my auditor will check this)

**All eight ran with WebSearch at 200/200 — a colony governance defect, not a scout failure.**
If 112 scouts are to run, the search budget must be partitioned per scout or late scouts are
structurally blind. Reporting that upward regardless of criterion.

| Scout | Verdict |
|---|---|
| `privacy-exposure` | **Weakest.** Read **zero sentences** of תיקון 13, the Privacy Protection Law, or the GDPR — the entire legal core of its own criterion. Its market findings (analytics saturation, PII tooling) are well-sourced; its legal findings do not exist. Honest about it, which is why its two AMBER items are rejected rather than promoted. |
| `ai-disclosure` | **Thin and, in one place, overstated.** Every finding rests on GitHub repo *metadata* alone. It presented `hexrift/oprindo-*` as a competitor validating the buyer; I checked — **0 stars, 0 forks, abandoned four days after creation**. It also carried the 2 Aug 2026 Article 50 date on repo-description prose. Its own dead-ends section is honest about the blank on YouTube/TikTok/Meta policies. |
| `owner-kyc-catalogue` | **Zero searches; pure synthesis of siblings.** Structure is excellent and I have adopted it wholesale. But its headline numbers — Paddle's liveness video, Fragment KYC, the Play 12-tester rule, Lemon Squeezy country list — are **snippet-only and unverified**. Do not read the confident tone as closed evidence. |
| `consumer-protection` | **No primary statute read** (gov.il and eur-lex blocked, confirmed). Carries an **unattributed 8%/15% return-rate pair** it correctly told us never to publish, and an unresolved contradiction (§1.3) about whether Israeli digital goods carry the 14-day right — which is exactly the claim its own product idea would have to sell. Its MoR and Telegram-duty findings are the useful half. |
| `audit-trail` | **Split.** Its ledger analysis is first-party and strong (I re-read `src/state/schema.ts` and it is accurate). Its Israeli tax half is entirely unverified and says so. |
| `automation-tos` | **Strong where it reached, with two large holes it names honestly.** GitHub, Google, Cloudflare and Apify quotes are real (I re-verified GitHub and Apify). But **Netlify is a total blank** — and we host a paid product there — and **every marketplace, including Paddle, is uncovered**. |
| `selling-as-individual` | **Best-sourced of the eight** — it found and read an Akoma-Ntoso mirror of חוק מע"מ and תקנות הרישום rather than asserting from memory. Its stated half-failure is real: the *enforcement* picture (audit rates, foreign-platform reporting to רשות המסים) is completely empty, and "nobody checks in practice" must stay UNKNOWN. |
| `agent-failure-modes` | **Strongest evidence discipline in the group.** Every URL rendered, every claim dated, one weak claim (`litellm` per-key budgets) explicitly flagged as unclosed. Produces no revenue, which it says plainly. |

---

## 6. What I would tell the board in one line

Kill the compliance-product family; keep the kill-list. Then get the owner through **Apify KYC**
and **tax registration** — because until those two are done, the colony's best-evidenced revenue
line cannot legally price an Actor, let alone be paid for one.
