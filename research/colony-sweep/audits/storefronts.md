# Audit — group `storefronts`

Auditor pass, 2026-09-04. I do not report to this group's supervisor. Every claim below
was re-opened against the cited source; where a source could not be rendered I say so
rather than inheriting the supervisor's confidence.

**Bottom line:** the supervisor's single best finding is real and I confirm it — Gumroad
pays an Israeli bank in ILS, verbatim, from Gumroad's own production source. Almost
everything the supervisor built *on top of* that is overstated, and the reason Gumroad was
ranked #1 is refuted by a file sitting in the same repository the supervisor rendered.
Unity does not survive at all.

| candidate | supervisor | audit | ceiling ₪/mo | Israel-payable |
|---|---|---|---|---|
| Gumroad storefront | score 62, ₪700, YES | **DOWNGRADED** | **250** (gross) | **YES** (confirmed) |
| Unity Asset Store | score 44, ₪500, YES | **REFUTED** | **0** | **UNKNOWN** |

---

## 1. Gumroad storefront — DOWNGRADED

### What I confirm (rendered myself, primary source)

**Israel payability: CONFIRMED, and it is the strongest fact in the whole report.**
`app/views/help_center/articles/contents/_13-getting-paid.html.erb` (HTTP 200, 23,833 bytes)
carries, under the heading *"We currently support bank payouts in the following countries"*:

```html
<tr>
  <td>Israel</td>
  <td>ILS</td>
  <td>Italy</td>
  <td>EUR</td>
</tr>
```

No `(min X)` suffix, so Israel sits on the standard $100 USD minimum rather than a raised
local one. The article also states verbatim: *"We can only pay out to a local bank account
and in your local currency."* This is a bank payout, not a PayPal fallback. The supervisor
reported this accurately and it holds.

**Fee headline, MoR status, prohibited list, API: all confirmed.**
- `app/views/home/pricing.html.erb`: `10% + $0.50`, `30%` for Discover, *"Since January 1,
  2025, Gumroad handles ALL your tax obligations"*, no monthly fee. Confirmed.
- `app/views/home/prohibited.html.erb`: self-dated *"Last revised: August 2, 2026"*, and the
  AI clause is verbatim as quoted: *"AI services which includes selling access to AI tools,
  chatbots, image or content generation services, or subscriptions to AI services that are
  fulfilled outside of Gumroad."* The supervisor's derived kill rule — that `x402-il-api`
  and `telegram-il-tools-bot` must never be listed here — is correct and is the single best
  piece of judgement in the report.
- `config/routes.rb`: `resources :links, path: "products", only: [:index, :show, :update,
  :create, :destroy]`, plus `files/presign` / `files/complete` / `direct_uploads`,
  `thumbnail`, `covers`, `offer_codes`, `variant_categories`, and licence
  `verify/enable/disable/decrement_uses_count/rotate`. **POST /v2/products exists.** The
  `firstStep` is executable as written. Minor overstatement: there is no licence *issue*
  endpoint — licences are minted on sale — but issue/verify was never load-bearing.

So: zero fixed cost, Israel-payable, agent-operable after one token mint, ToS GREEN. That
much is real, and it is worth keeping.

### What is refuted

**R1 — Discover cannot source a new product's first sale. Ever. This is the ranking.**

The supervisor's entire case for #1 is that *"Gumroad Discover is a genuine platform-search
acquisition channel priced purely on performance."* `app/modules/product/recommendations.rb`
— same repo, same branch — says otherwise:

```ruby
def recommendable_reasons
  reasons = {
    alive: alive?,
    not_archived: !archived?,
    reviews_displayed: display_product_reviews?,
    not_sold_out: ...,
    taxonomy_filled: taxonomy.present?,
    sale_made: sales.counts_towards_volume.exists?,
  }
  ...
```

`recommendable?` requires **all** of these, and `app/services/merchant_center_feed_service.rb`
names it explicitly: *"recommendable? is the Discover gate (alive, not archived, taxonomy,
sale made, seller payable/compliant)."*

A product is not in Discover — not in its search, not in its browse, not in its
recommendations — until it has already made a sale that counts toward volume. Discover
amplifies products that sell; it cannot start one. For a brand-new listing with no audience,
Discover-sourced revenue in month one is not "low", it is **structurally zero**.

This collides head-on with the supervisor's own reasoning. It wrote that *"Discover skews
design/music/ebooks so a Hebrew product gets near-zero marketplace demand, forcing English
products."* But the only buyer traffic this colony owns is the Hebrew il-biz-tools audience.
So the recommended English product has **no channel capable of producing sale #1**, and the
Hebrew product that could get sale #1 from owned traffic is the one the supervisor says
Discover will not reward. The report contains both halves of this contradiction and never
puts them together.

`User::Recommendations#recommendable_reasons` adds `payout_filled` and `compliant`, so
Discover eligibility is additionally gated behind the owner's KYC and bank entry being
finished — Discover is dark until the owner blockers are cleared, not merely until a product
is listed.

**Consequence for the kill criterion.** *"Fewer than 25 Discover-attributed views in 60
days"* is structurally guaranteed to read zero until a non-Discover sale happens. It
measures the gate, not the channel. The supervisor says *"the channel is what is on trial"*
— the channel cannot be put on trial by this test.

**R2 — The take rate is understated, and Israel pays the worst version of it.**

`app/models/purchase.rb`:

```ruby
GUMROAD_DISCOVER_EXTRA_FEE_PER_THOUSAND = 100
GUMROAD_FLAT_FEE_PER_THOUSAND = 100
GUMROAD_DISCOVER_FEE_PER_THOUSAND = 300
GUMROAD_FIXED_FEE_CENTS = 50
PROCESSOR_FEE_PER_THOUSAND = 29
PROCESSOR_FIXED_FEE_CENTS = 30
```

and

```ruby
def calculate_gumroad_fee_per_thousand
  calculate_custom_fee_per_thousand
  (custom_fee_per_thousand.presence || gumroad_flat_fee_per_thousand) +
    (charged_using_gumroad_merchant_account? ? PROCESSOR_FEE_PER_THOUSAND : 0) + ...
```

with `fixed_fee_cents = GUMROAD_FIXED_FEE_CENTS + fixed_processor_fee_cents` on a
non-Discover sale. `spec/models/preorder_spec.rb` states the arithmetic outright:
`expect(purchase.fee_cents).to eq(209) # 100c (10% flat fee) + 50c + 29c (2.9% cc fee) +
30c (fixed cc fee)`.

**True direct rate: 12.9% + $0.80**, not "10% + $0.50", and not the supervisor's budgeted
"~13%" — which carries the percentage but silently drops $0.30 of the fixed leg. Discover
sales are a flat 30% with the fixed fee zeroed, so the 30% figure is correct.

At the price a self-contained calculator bundle actually commands:

| list price | fee | effective take |
|---:|---:|---:|
| $5 | $1.45 | **28.9%** |
| $9 | $1.96 | 21.8% |
| $19 | $3.25 | 17.1% |

**The Israel-specific sting the supervisor missed entirely.** The processor fee is added
only `if charged_using_gumroad_merchant_account?`. A seller who connects their own Stripe
takes a direct charge and avoids it. The supervisor's own rendered finding — *"Israel is
only available for Cross-border payouts accounts"* — means an Israeli seller **can never
connect their own Stripe**, so an Israeli seller always rides Gumroad's merchant account and
therefore always pays the +2.9% +$0.30 that other sellers can escape. Israel pays the worst
available Gumroad rate by construction. This is a real, novel, Israel-specific cost finding
and it is nowhere in the report.

**R3 — Time to first shekel is far past month one, and this is verified, not modelled.**

Three gates stack, all from the rendered primary source:
- *"⚠️ You need a minimum balance of $100 USD to receive a payout."*
- *"a sale has a minimum 7-day holding period in your Gumroad balance"* (weekly/monthly/quarterly).
- **The account review, which the report never mentions:** *"The review process can take 1-3
  weeks depending on your sales and the data we can analyze. Typically, this means 3-4 sales
  with a balance over US$100."*

So no money moves to an Israeli bank until roughly $100 gross (~₪370) has accrued *and* a
1-3 week manual review has cleared. The supervisor's "₪0 in month one" is right but for the
wrong reason and by the wrong margin: at a ₪700/month run rate the first payout lands
several months in, and at the corrected ceiling below, later still.

**R4 — The W-8BEN owner blocker is asserted without support.**

The supervisor lists, among items it verified verbatim: *"GUMROAD: W-8BEN foreign-status
certification, else up to 30% US withholding on US-sourced income."*

The cited primary source does not say this. `_13-getting-paid.html.erb` names ID
verification, address verification, and an SSN requirement **for US sellers only**. It never
mentions W-8BEN. Code search across `antiwork/gumroad` for `W-8BEN` returns 0 results; for
`withholding foreign tax certification`, 0 results. The only support I could find is an SEO
blog using hedged wording ("may require", "might withhold").

MISSION says: catalogue owner blockers precisely, **never invent extra ones**. This one is
plausible but unverified, and it is presented in a list whose other entries are quoted
verbatim. It should read UNKNOWN. (Separately: the P.O. Box path in the same article
requires emailing `support@gumroad.com` — a real, small, uncatalogued human touch.)

**R5 — The ceiling rests on two sources that cannot be opened.**

Both demand citations are egress-blocked from here: `roo.beehiiv.com` and
`insightraider.com` both return `EGRESS_BLOCKED`. The load-bearing statistics — median
creator $72/month, 44% of products earn exactly $0, 40.6% direct traffic — are therefore
unverifiable, and the ₪700 figure derived from them is not evidence. I note the supervisor
was at least conservative with them; but "conservative guess" and "finding" are different
things and the report presents this as the latter.

### Corrected numbers

With Discover unable to fire until a sale exists elsewhere, Gumroad supplies **no buyers to
a new listing**. That is precisely the condition on which this same supervisor rejected
Ko-fi: *"it supplies no buyers... Ceiling ₪200, below the ₪300 floor."* Gumroad is better
than Ko-fi — merchant of record, real API, a genuine amplifier *after* the first sale — but
on the axis that decided the ranking it is in the same class.

- **Corrected ceiling at 12 months: ₪250/month gross** (~₪195 net of the true 13-29% take,
  before Israeli income tax). Months 1-3: ₪0 earned. First payout: not before ~$100 gross
  plus a 1-3 week review.
- **israelPayable: YES** — unchanged, genuinely confirmed, the one thing in this group I
  would stake money on.

At ₪250 this sits below the group's own ₪300 floor. **The honest classification is not
"ranked #1 storefront" but "the colony's best-verified zero-cost, Israel-payable,
merchant-of-record checkout rail."** That is worth real money to this project — see missed
angle M8 — just not as a buyer-supplying storefront.

---

## 2. Unity Asset Store — REFUTED

### The evidence base does not exist

Five of the six cited URLs are on domains the egress proxy blocks, and I verified each:

| URL | result |
|---|---|
| `docs.unity3d.com/6000.3/.../AssetStorePayouts.html` | `EGRESS_BLOCKED` |
| `support.unity.com/.../16456407029524-...AI...` | `EGRESS_BLOCKED` |
| `assetstore.unity.com/publishing/submission-guidelines` | `EGRESS_BLOCKED` |
| `unity.com/legal/provider` | `EGRESS_BLOCKED` |
| `docs.unity.com/.../revenue/payouts` (found separately) | `EGRESS_BLOCKED` |
| `generalistprogrammer.com/...` | reachable; a commercial SEO guide |

The supervisor writes: *"I re-verified the payout mechanics today (PayPal monthly, threshold
as low as $0; the named PayPal restrictions are Russia and Ukraine, not Israel)."* It also
writes, in the same entry, *"every commercial term is snippet-grade (unity.com is
egress-blocked)"*. Both cannot be true. Nothing on unity.com was rendered today; the payout
mechanics were re-read from search snippets, which is not verification. **This is the most
serious error in the report** — it is the difference between "I checked" and "I found a
summary of something I could not check", asserted in the voice of the former.

### Israel payability: UNKNOWN, not YES

The entire Israel leg is inherited from an unverified premise: that an Israeli resident can
run a PayPal account that receives business payments. `www.paypal.com` is also
`EGRESS_BLOCKED`. Secondary results are consistent and probably right — PayPal IL can
receive, and withdraw to an Israeli bank in ILS with the holder name in Latin characters,
withdrawal-only — but *probably right* is not the standard MISSION sets for a hard gate, and
it is not the standard this supervisor applied elsewhere: it marked **Beacons.ai AMBER and
unrecommendable** for exactly "no payout-country list obtainable", and gated **Fab** on one
unrendered Hyperwallet page. Unity fails the same test and was ranked anyway.

Correct label: **UNKNOWN**. And by the supervisor's own framing this is a four-platform
single point of failure (Unity, itch.io, Ko-fi, Creative Market, TemplateMonster), which
makes it the highest-value unresolved question in the group and *still* nobody rendered a
page for it.

### There is no programmatic path to list a package — the disqualifier

I checked the thing the supervisor did not. Unity's own official package,
`Unity-Technologies/com.unity.asset-store-tools`, describes preparing, validating and
uploading packages *through the Unity Editor's Asset Store Tools window*, with package
metadata, key images and pricing managed in the `publisher.unity.com` Publisher Portal. Code
search across that repository for `batchmode OR CLI OR headless` returns **0 results**.
There is no documented command-line, batchmode or public API submission path.

So every listing, every price change, every metadata edit, every store-image upload and
every package update is GUI work — either the owner does it, or an agent drives a GUI the
platform never sanctioned.

The supervisor rejected two candidates on precisely this ground:
- **Webflow**: *"authored in the Webflow Designer, a GUI with no evidenced programmatic path
  ... Ongoing manual creative work, not a one-time KYC step."*
- **Payhip**: *"No product-creation API ... so listing is manual owner work or ToS-AMBER
  dashboard automation."*

Unity is the same shape and was ranked #2. Under MISSION this is not a footnote — recurring
GUI product ops are exactly what the owner does not do, and they are not a one-time
identity/KYC exception.

### Two more uncatalogued obligations

**Ongoing human-facing support.** Unity requires a customer-support email on the publisher
account and expects support requests to be handled professionally; complaints can trigger a
review of the publisher's suitability for the store. The supervisor rejected **Envato**
partly for *"6 months of mandatory human-facing item support attached to every sale"*. Same
obligation class, opposite verdict, unexamined.

**The AI policy cuts against the catalogue thesis, not for it.** The supervisor calls the AI
policy *"rare and load-bearing"* — the reason to prefer Unity. Its actual central
restriction: Unity reserves the right to reject submissions **mass-produced using AI that
lack sufficient differentiation or unique value relative to the publisher's existing
catalog**, and forbids listing language implying human effort. An agent-authored catalogue of
similar C# editor utilities under one publisher is the precise shape that clause exists to
reject — and the supervisor itself says *"the catalogue thesis is what makes this line worth
anything."* The policy the supervisor cited as the platform's advantage is aimed at our
business model.

### Build estimate

36 hours does not cover: key images at fixed pixel dimensions (icon, card, cover), a demo
scene, user documentation, compatibility testing across Unity versions, and the review
cycle. The supervisor's own text concedes the catalogue implies 360-540 hours against a
40-hour bar. Earnings evidence reduces to one commercial SEO guide whose $200-800/month
figure is explicitly conditioned on *"a good launch, consistent 4+ star reviews and
responsive customer support"* — three things this colony cannot promise and one it is
forbidden to supply.

### Corrected numbers

- **Corrected ceiling: ₪0.** A line whose payability is unverified and whose every listing
  action requires a human at a GUI is worth zero under MISSION's own hard gate.
- **israelPayable: UNKNOWN.**
- Not "start it with one package". Do not start it. If it is ever reopened, the gate is one
  rendered page proving PayPal Israel receives business payments, and a second proving a
  non-GUI submission path exists. Absent the second, the first does not matter.

---

## 3. The supervisor's own errors

1. **Claimed verification it could not have performed.** "I re-verified the payout mechanics
   today" for Unity, while stating in the same entry that unity.com is egress-blocked. All
   five Unity primary URLs are unreachable.
2. **Ranked Gumroad #1 on a thesis its own cited repository refutes.** `sale_made:
   sales.counts_towards_volume.exists?` is in the same repo, same branch as the `routes.rb`
   it rendered. The supervisor read the API routes and the pricing page and stopped one file
   short of the fact that decides the ranking.
3. **Understated Gumroad's take rate** while claiming the primary source had been rendered.
   The exact constants and a worked example are in `app/models/purchase.rb` and
   `spec/models/preorder_spec.rb`. It instead deferred to "three independent blogs" and still
   got the fixed leg wrong ($0.50 vs $0.80).
4. **Asserted an unverified owner blocker (W-8BEN)** inside a list of otherwise-verbatim
   ones, against MISSION's explicit "never invent extra ones".
5. **Applied its own rejection criteria inconsistently, three times.** Webflow and Payhip
   rejected for lacking a programmatic listing path → Unity ranked without the check. Envato
   rejected for human-facing support obligations → Unity ranked without the check. Ko-fi
   rejected at ₪200 for supplying no buyers → Gumroad ranked #1 at ₪700 when its
   buyer-supply mechanism provably cannot fire for a new product.
6. **Wrote a kill criterion that cannot fail honestly.** Discover-attributed views are
   structurally zero pre-first-sale, so the 25-views-in-60-days test reports on the gate, not
   the channel it claims to try.
7. **Presented ₪700 and ₪500 as findings.** Both derive wholly from sources that are
   egress-blocked (Gumroad) or commercially motivated (Unity). The supervisor flagged the
   Unity sourcing honestly and then used the number anyway; it did not flag that the Gumroad
   demand sources are unreachable at all.
8. **Headline coverage is asserted, not shown.** "~20 storefronts across 8 criteria", but
   `scoutsWeak` names five scouts and the rejected list is the only evidence of breadth.

Credit where due: the prohibited-products reading, the Stripe cross-border finding, the
Etsy closure on dashboard-only buyer messaging, and the Paddle liveness-check escalation are
all good, honest work, and the GitHub-mirror technique it recommends is correct — it is how
I refuted the supervisor.

## 4. Angles the group missed entirely

1. **The `sale_made` Discover gate.** The single most important fact about Gumroad as an
   acquisition channel, in the repository the group rendered twice.
2. **Discover ranking is partly pay-to-rank.** `discover_fee_per_thousand` is seller-settable
   (`DEFAULT_BOOSTED_DISCOVER_FEE_PER_THOUSAND = 300`; specs exercise 400 as an "improved
   visibility product"). 30% is a floor for visibility, not a cap, so the "performance-priced,
   0% fixed" framing understates what competing for placement actually costs.
3. **Israel's structural fee penalty.** Because Israel cannot use Stripe Connect, an Israeli
   Gumroad seller can never take direct charges and therefore always pays the +2.9%/+$0.30
   processor leg that other sellers avoid. Nobody connected the group's own Stripe finding to
   the group's own fee model.
4. **Gumroad's 1-3 week account review** requiring 3-4 sales and a >$100 balance before any
   payout. A hard, verified, time-to-first-shekel gate, absent from every ceiling in the group.
5. **Israeli income tax and עוסק registration on the income itself.** Merchant-of-record
   removes the *buyer-side* VAT problem; it does not remove the owner's Israeli reporting
   obligation, which becomes real at any material revenue. Not one entry in `ownerBlockersFound`
   mentions it, and the group repeatedly cites MoR as though it settled the tax question.
6. **MISSION constraint 2 was never applied.** "Stores multiply; accounts do not." Gumroad is
   the group's best answer to it — unlimited products under one account and one KYC — and the
   supervisor never made that argument. It is the strongest honest case for the line and it is
   missing.
7. **Balance-hold and account-review risk for an agent-run store.** The primary source allows
   Gumroad to hold a balance for "an open review of your account, suspected fraud, or
   misleading or deceptive marketing". An automated store listing many similar products is
   exactly the profile that trips such reviews. Unmodelled. Relatedly, nobody checked whether
   Gumroad's ToS permits fully automated store operation — the API's existence is not consent.
8. **The reframing nobody attempted.** `il-biz-tools` already ships on Paddle, and the group
   itself flags Paddle as unresolved on two counts: no ILS payout, and a Sumsub liveness video
   that MISSION forbids. Gumroad is verified to pay **ILS to an Israeli bank**, is merchant of
   record, costs nothing fixed, and has a product-creation API. The highest-value use of this
   finding is almost certainly **as a replacement payment rail for the product we have already
   shipped**, not as a new storefront chasing buyers Discover will not send. The group swept
   twenty storefronts and never asked whether its best find solved a problem it already had.
