# Audit — group `crypto-native`

Auditor: AUDITOR `crypto-native` (independent of the group supervisor). Date: **2026-09-04**.
Posture: refute, not agree. Default verdict on anything I could not open myself: not confirmed.

## Bottom line

**The supervisor's headline survives, and it survives on better evidence than the supervisor
had.** Zero rankable lines is the right answer for this group. But the report gets there partly
by luck: its two most load-bearing numbers come from **two anonymous, unaudited GitHub markdown
files**, it kills one line (the Israeli crypto tax report) on a reason that does not survive
contact with the sources, and it misses the one 2026 development that would actually change the
group's verdict if it moves.

Nothing I found rescues a line to ₪300/month. Four of the supervisor's stated *reasons* are
wrong or overstated even where the verdict is right, and a wrong reason is a re-open trigger the
colony will not notice.

---

## What I verified myself

### 1. The two GitHub sources exist and say what the supervisor quoted — but neither is an authority

Fetched `raw.githubusercontent.com/HanbeenMoon/agent-failure-archive/main/MARKET.md` directly.
Present verbatim: `| 1 | 7,802,976 | $189,707 | $0.0243 |`, `| 5 | 124,985 | $105,615 | $0.8450 |`,
"Measured 2026-08-25", "Every number here came from a public endpoint you can call yourself",
"Eight of the top ten buyers pay exactly one seller. That is not a marketplace, it is a set of
vertically integrated products", and "a new x402 seller is invisible to every automated discovery
surface until someone who already knows the URL pays". **Quotation accurate.**

But: the document **does not name its author**. It is a markdown file in a personal repo called
`agent-failure-archive`. The supervisor wrote "CONFIRMED" against it. What was confirmed is that
the file says what the scout said it says — not that the numbers are true. The group's single most
consequential structural claim ("the volume that exists is captive") rests entirely on one
anonymous file that nobody has reproduced.

**I closed that gap.** Independent corroboration exists and points the same way: x402scan
(Merit Systems, the ecosystem's own explorer) reported **$1.11M of volume across 3.69M
transactions in 30 days** as of May 2026 — *network-wide, all sellers*. Even allowing several-fold
growth to August, total seller-side revenue across the entire x402 economy is low single-digit
millions of dollars a month, top-heavy. A newcomer's share of that is not ₪300/month.
**The verdict stands; the method that produced it does not.**

### 2. Strale — and a supervisor error inside its own verification

Fetched `strale-io/strale/docs/strategy/2026-08-demand-mined-build-queue.md`. Confirmed:
**€132.19 over 30 days**, single wallet `0x9D3d9410…` at **€118.56 (89.7%)**, **€21.74** destroyed
by failed calls against a rate-limited upstream, ~1,951 calls over 92 capabilities.

The supervisor added: *"Note: `MEASUREMENT.md` … does **not** contain the €253.40/90d figure …
the scout's citation was imprecise."* **The €253.40/90-day figure is in the file the supervisor
itself fetched** — the build-queue document states €132.19 over 30 days *and* €253.40 over 90 days
in the same passage. The supervisor read its own rendered source incompletely and then charged a
scout with a citation error the scout did not make. Small, but it is exactly the failure mode the
supervisor spent four paragraphs accusing its scouts of.

### 3. OpenSats — CONFIRMED, and harder than reported

`opensats.org` is egress-blocked here, so I rendered the site's source:
`raw.githubusercontent.com/OpenSats/website/master/data/pages/faq-application.mdx`. Verbatim: the
video must be **"exactly 2 minutes"**, must contain **"a human voice-over at least"**, at least
**two written references** with verifiable email addresses, and — decisively for this colony —
**"Videos with the wrong duration, or videos that are fully AI-generated, will be discarded along
with the application."** OpenSats has pre-emptively banned the only way an agent could comply.
The kill is correct and should never be revisited.

### 4. Gitcoin — CONFIRMED

`gov.gitcoin.co/t/withdrawn-gitcoin-x-octant-yield-powered-matching-for-gg25/24977` carries
**"WITHDRAWN"** in the thread title. GG24 was the last completed round; GG25 was only ever
"targeted Q2 2026" and its funding proposal was pulled. Additionally — which the group did not
find — **Gitcoin's Grants Stack is itself winding down** ("Grants Stack Winds Down—Here's What's
Changing", Gitcoin blog). The line is deader than reported.

### 5. POAP — CONFIRMED

Co-founder Isabel Gonzalez announced the wind-down **3 August 2026**; the platform had already
gone to **maintenance mode on 16 March 2026**, stopping new issuer onboarding. 46,210 issuers,
~7.6M mints. (The Block, crypto.news, The Defiant, NFT Culture.) The supervisor's use of this as a
ceiling on utility-NFT entrants is sound.

### 6. x402 discovery — CONFIRMED, with a nuance the group got slightly wrong

Coinbase's Bazaar (`docs.cdp.coinbase.com/x402/bazaar`) has **no registration call**: the
facilitator's catalogue "builds itself from payments it has already settled", and "the resource row
appears after the first successful payment against that route. **One settlement is enough to get
indexed.**" So discovery is *cold-start gated*, not permanently closed — a seller who takes a single
real payment becomes discoverable. This does not save the line (one payment from a stranger is the
whole problem), but "invisible until someone who already knows your URL pays" overstates it by
implying a standing exclusion rather than a one-transaction threshold.

### 7. Israeli off-ramp — one gap survived my attempt too

The supervisor flagged that **nobody has rendered Bits of Gold's fee/spread page** and that no
crypto line may be booked net of conversion until someone does. I tried and failed as well: the
fee schedule is not obtainable from search snippets and the source pages are not renderable here.
**The gap is real and now twice-attempted.** Any crypto-denominated revenue anywhere in the
portfolio is still un-costed at the shekel end.

### 8. BILS — the supervisor is right, and missed why it matters

The supervisor dismissed BILS in one clause as "institution-only per the only evidence available".
That holds: the CMA approved a **deliberately limited, predetermined-scale pilot**, institutional
and qualified participants first. But the surrounding facts, which the group never rendered, are
material: **BILS is live, 1:1 shekel-backed with reserves in segregated Israeli bank accounts,
audited by EY, custodied via Fireblocks, issued on Solana by a CMA-licensed financial asset service
provider (Bits of Gold), approved April 2026 after a two-year review.** That is a shekel-denominated
on-chain settlement rail that exists. **If BILS opens to ordinary Israeli businesses, this group's
central finding — "the rail pays but there is no shekel-native buyer" — changes shape.** It is not
on the supervisor's re-open trigger list. It should be.

---

## Where the supervisor's reasoning does not survive

### A. The Israeli crypto tax-report generator was killed on a bad number and a missed forcing function

The stated reason: *"the demand evidence is negative, not merely absent: Israel's crypto
voluntary-disclosure window drew a reported 58 filers."*

Two problems.

1. **I could not corroborate the 58 figure at all.** Searching in Hebrew across ITA-adjacent and
   accountancy sources returns the voluntary-disclosure procedure and the 2026 rule changes, and no
   filer count. It remains a snippet-grade number carrying a kill decision.
2. **It is the wrong denominator even if true.** Voluntary disclosure (גילוי מרצון) is a
   criminal-immunity procedure for people confessing *past undeclared* holdings. It measures
   confessions, not compliance. The buyer of a tax-report tool is someone filing a normal annual
   return with crypto gains — a population that has no relation to the disclosure count.

And the group missed the single biggest demand event in this space: **CARF**. Israel is among the
48 jurisdictions where crypto-asset service providers were required to begin collecting customer
and transaction data on **1 January 2026**, with the first cross-border exchange of that data
landing in **2027**. Israeli holders are about to be automatically visible to the ITA. That is
precisely the condition under which compliance tooling gets bought, and no scout in the group
mentions CARF once.

**I am not ranking this line.** The AMBER objection stands independently — a filing-ready Israeli
crypto computation edges toward regulated advice and a wrong number costs the buyer money with the
colony's name on it — and nobody has *measured* demand in either direction. But the reason on the
record is wrong, and the colony's rule "do not re-search this group" would freeze that error in.

### B. The on-chain analytics kill is right for the wrong reason

The licence facts check out as quoted (DefiLlama's free tier is personal/non-commercial; CoinGecko
forbids redistribution). But they are **not structural**: an indexer reading free public RPC or
self-hosted data carries no such licence, at close to ₪0 marginal cost. The supervisor presents a
$129–$300/month feed bill as if it were unavoidable. It is not. What actually kills the line is the
demand side — a $145 median indie-SaaS MRR against a saturated free-alerting field. Same verdict,
load-bearing on a different fact.

### C. "Stop treating ChatGPT checkout as a future channel" over-generalises a real event

Instant Checkout's retirement is real (launched 29 Sep 2025, pulled back March 2026; CNBC,
2026-03-24; Forrester; Modern Retail — fewer than 15 Shopify merchants ever went live). But the
supervisor then rejects the whole card-network agent-rail cluster on "Israel UNKNOWN" while
declaring the category closed. The sources say agentic checkout **migrated** — to Google's
Universal Commerce Protocol and Universal Cart, and to Perplexity's Instant Buy. "UNKNOWN" is an
unresolved question, not a NO, and the report converts one into the other in the space of two rows.
No line follows from this today (merchant-of-record KYB is still a human sales step), but the
closure is stated more strongly than the evidence carries.

### D. "VERIFIED" is doing work that "quoted accurately" should be doing

Four of the supervisor's five self-run checks confirm that *a document contains a sentence*. Only
one (Gitcoin) checks a fact against the world. The report's language does not distinguish these,
and the group's whole no-buyer thesis inherits the credibility of an anonymous repo as a result.
The conclusion happens to be right — I corroborated it independently against x402scan — but the
supervisor did not earn it.

---

## Supervisor errors, listed

1. Mis-corrected a scout: the €253.40/90d figure **is** present in the Strale build-queue file the
   supervisor itself rendered.
2. Labelled "CONFIRMED" what is only "quoted accurately", for an **anonymous** source carrying the
   group's central structural claim; ran no independent corroboration of the x402 market size.
3. Killed the Israeli tax-report line on an uncorroborated 58-filer statistic that measures the
   wrong population.
4. Missed CARF entirely — Israel collecting from 1 Jan 2026, exchanging in 2027 — across all eight
   scouts and its own synthesis.
5. Rested the analytics kill on a data-licence wall that is avoidable, rather than on the demand
   evidence that actually kills it.
6. Overstated x402 discovery as standing invisibility; Bazaar indexes automatically after **one**
   settled payment via the CDP facilitator.
7. Dismissed BILS in a clause without rendering a source, and left "BILS opens to non-institutional
   holders" off the re-open trigger list — the one trigger most likely to actually fire.
8. Missed that Gitcoin's Grants Stack is winding down, which is a stronger closure than the
   withdrawn GG25 proposal it did find.

---

## Angles the group missed entirely

- **CARF / automatic exchange of crypto data into Israel (2026 collection, 2027 exchange).** The
  demand-side event for any Israeli crypto-compliance product, and the reason the tax-report kill
  needs re-stating rather than freezing.
- **BILS as a shekel-denominated on-chain rail**, not merely as a rejected "income line". Its
  opening to businesses is a re-open trigger; its Solana deployment means the colony's x402 work is
  on the wrong chain for it (Base).
- **Bits of Gold / Bit2C actual fee and spread** — still unrendered after two attempts. Until this
  exists, no crypto line anywhere in the portfolio has a net shekel figure.
- **Whether receiving USDC for an API makes the owner a regulated "financial asset service
  provider"** under the Israeli Financial Services (Regulated Financial Services) Law. The group
  asked the VAT question and not the licensing question. Almost certainly no (accepting crypto as
  payment for a non-financial service is not providing a service *in* financial assets) — but it is
  unasked, and it sits under a shipped product.
- **Adding x402/USDC as a *second* payment rail to the already-shipped non-crypto products**
  (il-biz-tools Pro, apify-il-open-data). The supervisor considered x402 only as a new line and as a
  standalone product to keep alive. The genuinely cheap move — crypto as a payout *method* that
  unlocks lines rejected elsewhere in the sweep for Israel non-payability — is stated as a "finding"
  but never costed or assigned.
- **Customer-paid (not emission-paid) storage/compute networks: Storj, Bittensor, Ocean.** Absent
  from all eight scouts. Storj in particular is the one infrastructure role whose payer is a paying
  enterprise customer rather than a token emission; it almost certainly still fails on hardware,
  bandwidth, held-back escrow and payout minimums, but the group asserted "every open infrastructure
  role pays a token emission" without checking the counterexample.
- **Crypto exchange affiliate/referral revenue** — raised as an open question by the
  `trading-strategies` scout ("grid-bot affiliate/referral revenue (open question)"), flagged by
  that scout as ethically AMBER, and then silently dropped: it appears nowhere in the supervisor's
  rejected table. Dropping a scout's open question without adjudicating it is how a line comes back
  next quarter as a "new idea".

---

## Verdict on the group

**Rankings: none — CONFIRMED.** No line in crypto-native reaches ₪300/month, and I found nothing
the supervisor missed that would. The independent x402 market size ($1.11M/30d network-wide, May
2026) supports the no-buyer thesis more firmly than the anonymous file the supervisor relied on.

**"Do not re-search this group" — CONFIRMED with amendments.** The re-open trigger list must add:
(a) BILS opening beyond the institutional pilot; (b) a rendered Bits of Gold fee schedule, which
gates every crypto number in the portfolio; and (c) the Israeli tax-report line being re-stated as
"demand unmeasured, AMBER on regulated advice" rather than "demand measured at 58", so that CARF
data landing in 2027 is not mistaken for a refuted case.
