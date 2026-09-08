# GROUP REPORT — `storefronts`
**Storefronts and marketplaces that pay an Israeli software-only seller**

Supervisor: Opus 5 · Date: 2026-09-04 · Scouts merged: **8 criteria** — 5 from wave 1
(`gumroad`, `paddle`, `lemonsqueezy-payhip`, `etsy-digital`, `asset-marketplaces`) and 3 from
this wave (`creator-storefronts`, `theme-app-stores`, `game-3d-assets`).

---

## Headline

**This group is plumbing and eliminations, not income.** Twenty-odd storefronts were examined.
Exactly **one** has ILS payout to an Israeli bank confirmed from a rendered primary source, a
full listing API, zero fixed cost and merchant-of-record tax handling — **Gumroad**. Exactly
**one other** combines platform-side search, a payout rail that reaches Israel, and a product
shape a software-only shop can honestly author — **Unity Asset Store editor tools**. Everything
else is closed to Israel, charges rent before revenue, needs a human to talk to buyers, needs a
human to draw, or supplies no buyers at all.

**Honest group ceiling: ~₪1,200/month at 12 months, ₪0 in month one.** Two ranked lines, not six.

The finding with the widest blast radius is not a line at all. Rendered primary source
(re-verified by this supervisor, 2026-09-04):

> *"Israel is only available for Cross-border payouts accounts."*
> — Stripe payouts documentation, mirrored at
> `raw.githubusercontent.com/Eyre921/ofiicial-developer-docs/main/dev-platforms/stripe/pages/payouts.md`

**Any line, in any group, that assumes the owner can be onboarded as an ordinary Stripe Connect
Standard or Express seller is dead.** That single sentence kills Buy Me a Coffee, Stan Store and
Stripe Managed Payments outright inside this group, and it should be checked against every other
group's survivors. PayPal is the rail that survives — which makes the PayPal-Israel
receive-and-withdraw leg a **single point of failure** under four of this group's platforms.

---

## What this supervisor verified first-hand (not inherited)

Everything below was rendered or re-searched by me on 2026-09-04, because the scouts rendered
almost nothing — the egress proxy blocks essentially every vendor domain in this group.

| Claim | Verification | Result |
|---|---|---|
| Gumroad pays Israel | Rendered `antiwork/gumroad` help-article view | **CONFIRMED**: table row `Israel \| ILS`; `$100 USD` minimum balance; 7-day holding period on weekly/monthly/quarterly |
| Gumroad fees | Rendered `home/pricing.html.erb` | **CONFIRMED**: `10% + $0.50` direct, `30%` Discover, no monthly fee, merchant of record since 1 Jan 2025 |
| Gumroad forbids AI-service resale | Rendered `home/prohibited.html.erb`, page self-dated **2 Aug 2026** | **CONFIRMED verbatim**: *"AI services which includes selling access to AI tools, chatbots, image or content generation services, or subscriptions to AI services that are fulfilled outside of Gumroad"* |
| Stripe/Israel cross-border only | Rendered Stripe docs mirror | **CONFIRMED verbatim** |
| Etsy Payments reaches Israel | WebSearch, Etsy help pages quoted | **CONFIRMED**: Israel in the eligible list; funds deposit to an Israeli bank in ILS |
| Unity pays by PayPal with no minimum | WebSearch, `docs.unity3d.com` + `support.unity.com` quoted | **CONFIRMED**: PayPal monthly (15th–30th), threshold as low as $0; bank transfer quarterly at $250 min; named PayPal restrictions are Russia/Ukraine, **not Israel** |
| Envato does not exclude Israel | WebSearch, `help.author.envato.com` quoted | **CONFIRMED by absence**: new-author restrictions are Russia, Belarus, Afghanistan, Sudan, Libya; $50 minimum, paid on the 15th |

Nothing below rests on a number I could not attach to a source. Where a claim is snippet-grade
it says so.

---

## RANKED — two lines

### 1. Gumroad storefront: self-contained digital tools, licence-keyed, with Discover exposure — score 62

**Why it is first.** It is the only candidate in the group whose payability is *primary-source
verified* rather than inferred, and it is the only one where a failed experiment costs literally
nothing: no listing fee, no monthly fee, no rent. It is merchant of record, so no VAT
registration, no EU/UK filings, no US nexus work — an entire compliance workstream removed from
a one-person operation. Its API does full product CRUD plus offer codes, sales, subscribers and
licence-key issue/verify, so after one human token-mint an agent runs the store end to end.
And **Gumroad Discover is a real, named acquisition channel priced purely on performance** —
30% only on sales the marketplace itself sourced, 0% fixed. Under MISSION constraint 7 that is
the rare thing: a channel where the platform's own search does the distribution and we pay
nothing to find out whether it works.

**Why it is not higher.** Gumroad supplies little traffic. Its own traffic profile is ~40.6%
direct with organic search almost entirely branded (snippet, `roo.beehiiv.com`). The demand
distribution is brutal: median creator **$72/month (~₪265)**, 44% of products earn exactly $0,
<5% of creators clear $1,000/month (snippet, `insightraider.com` — site blocked, methodology
unverified, but the shape matches every other creator marketplace). **Our median outcome is
below this group's own ₪300 floor.** And Discover skews design/music/ebooks/3D — a
Hebrew-language product has near-zero Discover demand, so Discover only works for
English-language products, which means competing with the world on generic ground rather than
using our Israeli-knowledge asset.

**Hard ToS carve-out, verified verbatim today.** Gumroad prohibits selling access to AI tools,
chatbots, generation services and off-platform subscriptions, and prohibits services fulfilled
outside Gumroad. **`x402-il-api`, `telegram-il-tools-bot` and any hosted AI tool MUST NOT be
listed on Gumroad.** Enforcement is documented: first violation removes the product, second
deletes the account after two weeks' notice. Only self-contained artefacts delivered on Gumroad
are in policy.

- **Buyer / channel:** buyers of self-contained functional downloads, arriving from (a) Gumroad
  Discover search, or (b) the free Hebrew tool traffic we already own at `il-biz-tools`.
- **Money model:** one-off sale; 10% + $0.50 direct, 30% Discover; MoR remits tax; ILS payout to
  an Israeli bank at a $100 minimum balance with a 7-day hold. Model no better than ~13% direct
  take (three independent blogs claim card processing is charged on top; Gumroad's own pricing
  view does not show it — unresolved, so budget the worse number).
- **Ceiling: ₪700/month at 12 months. ₪0 for the first 90 days.**
- **Build: 10 hours** for the API client, licence verification and the webhook→ledger write.
  The products themselves are separate builds and are not counted here.
- **First step (one action):** package the `il-biz-tools` allocation-number and VAT calculators
  as one self-contained offline bundle and write its exact `POST /v2/products` request body to
  `products/il-biz-tools/gumroad-listing.json`, so listing needs nothing from the owner but one
  API token.
- **Kill:** fewer than 25 Discover-attributed views in 60 days, or zero sales in 90 days → stop
  listing more products. The channel is what is on trial, not the product.

### 2. Unity Asset Store: C# editor tools — score 44

**Why it survives.** It is the only platform in the group that has *all four* of: its own
buyer-side search, a payout rail that reaches Israel monthly **with no minimum threshold**, a
product shape a software-only shop can genuinely author (code, not art), and a **written,
permissive AI-content policy** — AI-assisted work may be sold provided it is disclosed, does not
resemble third-party work and is not mass-produced undifferentiated filler. That last item is
rare and load-bearing: Envato bans AI content as the main component, itch.io's policy is unread,
and Creative Market only labels. Unity tells us exactly how to be honest, which is what our
constitution requires anyway.

**Why it is second and not first.** Every commercial term is snippet-grade (`unity.com` is
egress-blocked; I corroborated only the payout mechanics). The earnings figures all trace to
commercially motivated secondary guides. The catalogue thesis — one package earns ~nothing,
money appears across 10–15 — implies 360–540 hours before the model even gets a fair test, which
is far past this group's 40-hour bar; the only defensible entry is **one package as a channel
test**. The market is old and crowded with free GitHub alternatives, and submission passes a
real curation review.

**Payability is inherited, not verified.** Unity pays into the publisher's own PayPal. PayPal
Israel's receive-and-withdraw leg (ILS only, withdrawal-only bank link, name in Latin letters,
NIS 0–8 withdrawal fee, 3–5 business days) is snippet-grade from this repo's own
`payment-rails--paypal-israel` scout. **If that leg is wrong, this line falls to NO
simultaneously with itch.io, Ko-fi, Creative Market and TemplateMonster.** The same scout also
found margin facts the storefront scouts missed: ~3.49% + NIS 1.60 receiving fees, 1.5–2%
cross-border, a 21-day new-seller hold, and — from 6 July 2026 — **18% Israeli VAT on PayPal's
own fees**. Unity's 70% is really closer to 65% net.

- **Buyer / channel:** Unity developers and small studios buying editor tooling — build/pipeline,
  save/serialisation, localisation, inspector utilities. Channel: the Asset Store's own search.
- **Money model:** one-off package, 70% to publisher, $4.99 price floor, PayPal monthly with no
  minimum (15th–30th) or SWIFT quarterly above $250.
- **Ceiling: ₪500/month at 12 months across a 3–4 package catalogue. ₪0 for 90 days.**
- **Build: 36 hours** for the first package including submission-guideline compliance.
- **First step (one action):** survey the Asset Store's public search for the four candidate
  categories and record, for each, the count of competing paid packages and their price
  distribution — pick the thinnest category **before** writing any C#.
- **Kill:** package clears review but earns under $50 gross in 90 days → do not build packages
  2–N; the catalogue thesis is falsified. Also kill if the survey finds no category under ~50
  competing paid packages, or if the Provider Agreement carries a restricted-territory clause
  covering Israel.

**There is no third line.** Everything else failed a gate. Padding this list to six would mean
ranking a platform that cannot pay an Israeli, charges rent before revenue, or needs the owner
to talk to buyers — and I would be ranking something I had just argued against.

---

## REJECTED — and why

### Closed to Israel (payout rail)
| Platform | Why |
|---|---|
| **Buy Me a Coffee** | Israel absent from the published 45-country payout list; payouts run exclusively through Stripe Express/Standard Connect. Exactly what the rendered Stripe fact predicts. |
| **Stan Store** | Israel not among the 37 Stripe Custom countries. Dead twice: also $29–99/month of USD rent before any revenue, on a link-in-bio surface that presupposes a social following we will never have. |
| **Stripe Managed Payments / Stripe Connect for the owner** | **NO**, verified rendered: *"Israel is only available for Cross-border payouts accounts."* Lemon Squeezy's own stated successor is therefore closed to us. |
| **Beacons.ai** | No payout-country list obtainable anywhere. UNKNOWN → AMBER → not recommendable. |
| **Fab (Epic)** | Best terms in the whole group (88% share) and dead in the water: payout runs on Hyperwallet and whether Israel is a payee country is unresolved. AMBER. **A gate, not a rank** — one rendered page closes it: `docs.hyperwallet.com/content/transfer-methods/v1/payout-networks/transfer-method-payee-country-availability`. |
| **Roblox DevEx** | Tipalti's own coverage page carries the only Israel-specific sentence found in the sweep, and it points the wrong way (payments not available for Israeli-based entities in certain coverage regions). Dead anyway on shape: live-service experiences need continuous community operations. |

### Needs a human — mandate violations, not KYC exceptions
| Platform | Why |
|---|---|
| **Etsy digital downloads (single shop)** | **Payable to Israel in ILS — verified.** Real marketplace demand. Rejected anyway: buyer conversations, dispute handling and the new-shop verification loop are **dashboard-only** (there is no Messages endpoint in Etsy API v3) and Etsy's terms forbid automated access outside the API, so dashboard automation is not a workaround. The line requires the owner to talk to buyers. Fees from Israel are 6.5% + 4.5% + ₪2.00 (17% on a $12 item, 32% if Offsite-Ads-attributed), and from 11 Aug 2026 items made with computerised tools must be based on the seller's original design. `docs/REJECTED.md` killed multi-shop and explicitly left single-shop open; **this closes it.** |
| **Wix Marketplace (the freelancer one)** | RED. Client briefs, scoping, negotiation — the owner talking to clients. Recorded because it shares a name with the Wix App Market and a later reader will otherwise confuse them. |
| **Webflow templates** | Authored in the Webflow Designer, a GUI with no evidenced programmatic path, and the creator application demands three hand-built Webflow sites. That is ongoing manual creative work, not a one-time KYC step. Already rejected in `docs/REJECTED.md`; **re-grounded on the authoring path rather than on missing payout terms**, since revenue share is now known (95% to creator) and payout countries still are not. |
| **Envato Market (CodeCanyon / ThemeForest)** | AMBER on three counts. Every sale attaches **6 months of mandatory item support** — a human-facing obligation Envato's flow gives no way to disclose as automated. AI-generated content **may not be the main component** of an item, and whether AI-*written source code* falls under that is an open question with no public answer (absence of a ban is not permission). And EU DSA trader status makes Envato **publish the author's name, address, email and telephone** — which collides head-on with this repo's anonymity requirement. Economics finish it: <3% of new plugin authors reach $1,000/month, 61.6% of plugins sell under 100 licences ever, and the author share dropped to a flat **50% on 1 July 2026**. |
| **Envato Elements** | Same AI prohibition; per-item-point payout value is not publicly obtainable, so revenue cannot be modelled at all. |

### Rent before revenue, or no buyers at all
| Platform | Why |
|---|---|
| **Ko-fi** | Payable (settles into our own PayPal), zero fixed cost, GREEN — and it supplies **no buyers**. No marketplace, no discovery feature: *"it won't send you buyers… you will need to drive all traffic yourself."* Ceiling ₪200 < the ₪300 floor. **Keep as a zero-cost fallback checkout, never as a line.** |
| **Sellfy** | Same PayPal rail, same absence of buyers, plus $22/month rent. Strictly dominated by Ko-fi and Gumroad. |
| **Squarespace** | There is no third-party template marketplace and no self-serve Extensions developer programme. The surface does not exist. Close permanently. |
| **itch.io** | Payable (direct PayPal), no review bar, GREEN-ish — but discovery runs on jams, devlogs and community participation, which MISSION forbids. Strip that and the ceiling is ₪0. PWYW culture puts the price floor near zero, and itch's AI-content policy is entirely unread. |
| **Shopify Theme Store** | ~300-hour build against a 40-hour bar; themes must be **exclusive to the Theme Store**, which forbids amortising the build across other marketplaces; Israeli partner payability unverified; five-stage editorial review; standing two-business-day merchant support obligation. |
| **Wix App Market** | The best of a bad half — 100% of revenue in year one, published 15-business-day review SLA — but **zero demand data of any kind** (no installs, no category revenue, no listing counts), **no niche named** by its own scout, payability UNKNOWN, and a **$200/month payout floor** (~₪740) below which money accrues and never moves. **The cheapest open gate in this group**: one page, `dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs`. Reopen only with a named niche *and* that page rendered. |
| **Creative Market** | 50% share; the Israel payout row was never obtained; shop applications are discretionary and human-reviewed; and we hold no product that fits the catalogue. |
| **TemplateMonster** | 40% on templates / 20% on graphics; since 1 Jan 2026 every author application is individually reviewed; and we have no template-authoring capability that is not a human drawing. |
| **Unreal Engine Marketplace** | Does not exist. Folded into Fab, October 2024. Recorded so it is never swept again as a separate target. |
| **Framer** | No new evidence either way; the existing `docs/REJECTED.md` rejection stands unchanged. |

### Plumbing, not income — ₪0 as lines
| Platform | Why |
|---|---|
| **Lemon Squeezy** | Genuine MoR, full API, 5% + $0.50 — but Israel on its supported-countries list is **UNVERIFIED**, and its own scout put first-90-day revenue attributable to *choosing* it at **0 ILS**. Its stated successor is closed to Israel. Optionality, not money. |
| **Payhip** | **No product-creation API** — coupons and licence keys only — so listing is either manual owner work or ToS-AMBER dashboard automation. Not merchant of record, so Israeli VAT stays with the owner. Survives only as a PayPal-only fallback checkout. |
| **Paddle** | Not a new line: it is the rail `il-biz-tools` already uses. Restated here as an **unclosed risk**, because this group found the better alternative. |

---

## The finding the board should act on, which is not a ranked line

**Gumroad is a materially better rail than Paddle for this owner, and it is verified where Paddle is not.**

| | Paddle (shipped) | Gumroad (verified 2026-09-04) |
|---|---|---|
| Israel payable | UNKNOWN-leaning-YES, snippet only, no Israeli seller ever found | **YES — `Israel \| ILS` in Gumroad's own help-article source** |
| Payout currency | USD/EUR/GBP; **no ILS**; SWIFT, ~$15 fee | **ILS, direct to an Israeli bank** |
| Owner KYC | Sumsub, and *"in some cases… a short video that confirms it's really you"* | Government photo ID + proof of residence. **No video reported anywhere.** |
| Approval risk | Documented rejections for lacking 3 months of processing statements — and we are pre-revenue | Account creation, no discretionary business review found |
| Tax | MoR | MoR |
| Fee | 5% + $0.50 | 10% + $0.50 (up to ~13%) |

MISSION says the owner does not appear on camera. **Paddle's liveness check is a live risk that
the colony's only shipped payment rail is blocked by a step the owner may refuse**, and nobody
has priced that. Gumroad costs roughly 5–8 points more per sale and removes the risk, the SWIFT
fee and the FX conversion. That is not new revenue, so it is not ranked — but it is the most
useful thing this group produced, and it is a one-line decision the board can take today.

---

## Scouts whose work was thin

All three of this wave's scouts **rendered zero primary pages** — every vendor domain in this
group is egress-blocked, and each said so plainly, which is to their credit. But honesty about
thin evidence does not make it thick, and the auditor should treat all three reports as maps of
what to verify rather than as verified fact.

- **`storefronts/theme-app-stores` — thinnest.** Its own dead-ends section says *"NO DEMAND DATA
  WAS OBTAINABLE FOR ANY OF THE FOUR PLATFORMS"*, and its single ranked candidate (Wix App
  Market) has no named buyer, no demand number, and UNKNOWN payability. A candidate with
  nothing on three of four axes should not have been a finding at all.
- **`storefronts/creator-storefronts`.** Five platforms, zero rendered pages, and its own verdict
  is that the criterion is a dead end as a revenue line. Its single most valuable output — the
  Stripe cross-border fact — came from outside its own criterion. Correct conclusion, thin
  criterion coverage.
- **`storefronts/game-3d-assets`.** Every earnings figure traces to commercially motivated
  secondary guides; it said so. It also correctly identified that its two viable platforms rest
  on a single shared unverified claim (PayPal Israel), which is better self-criticism than most.

**Not weak, for contrast:** `storefronts/gumroad` found and rendered Gumroad's production help
centre, pricing page and prohibited-products page in the company's own open-source repo — the
only primary-grade evidence in the group, and the reason this report has a #1 at all. Future
scouts blocked on a vendor's docs should search GitHub for a mirror before spending a search;
it worked twice here (Gumroad, Stripe).

---

## Owner blockers catalogued (one-time, human, legally required — none assumed done)

**Gumroad** (from Gumroad's own rendered help-article source):
1. Create the account in the owner's legal identity.
2. Identity verification: government photo ID, colour scan, front and back for licences.
3. Proof of residence in the payout country (Israel). P.O. boxes not accepted.
4. Israeli bank account for ILS payout, **name in Latin characters**.
5. W-8BEN foreign-status certification, else up to 30% US withholding on US-sourced income.
6. Mint one API access token in the dashboard (once).

**Unity Asset Store:** publisher account and Provider Agreement acceptance; a tax form for a
non-US individual (W-8BEN believed — the onboarding pages are blocked and this is unverified);
a PayPal account in the owner's name able to receive.

**PayPal Israel — the shared dependency under Unity, itch.io, Ko-fi, Creative Market and
TemplateMonster, and NOT yet done:** a verified PayPal account able to **receive** business
payments as an Israeli resident, and an Israeli bank account linked with the holder's name in
English. The bank link is **withdrawal-only** and ILS-only; payments must be funded by card.
A business account additionally needs the business identifier (עוסק מורשה / עוסק פטור /
company number).

**Paddle (already the shipped rail):** Sumsub identity check which *"in some cases"* demands a
**liveness check — a short video**. MISSION says the owner does not appear on camera. This must
be put to the owner rather than assumed.

**Etsy (recorded only, since the line is rejected):** Persona identity check requiring a
government ID photo **and a clear selfie**; the bank account name must match the government ID;
plus answering verification emails and buyer messages — the last is **ongoing**, not one-time,
which is precisely why Etsy is rejected rather than blocked.

**Envato (recorded only):** W-8BEN with Foreign TIN; an Author ID check by the same person
receiving payment; and an EU DSA trader-status declaration under which Envato **publishes the
author's name, address, email and telephone on Envato Market** — incompatible with the repo's
publication-anonymity requirement.

---

## Pages a human or unblocked agent should open, in priority order

1. `docs.hyperwallet.com/content/transfer-methods/v1/payout-networks/transfer-method-payee-country-availability` — decides Fab, the best revenue share in the group (88%).
2. `www.paypalobjects.com/marketing/ua/OA/useragreement-full/en-IL-070626.pdf` — the PayPal Israel user agreement (updated 6 July 2026). Closes the single point of failure under four platforms.
3. `dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs` — decides Wix App Market payability.
4. `www.paddle.com/help/start/account-verification/what-is-identity-verification` — confirm whether the liveness video is mandatory for an individual seller.
5. `docs.lemonsqueezy.com/help/getting-started/supported-countries` — closes Lemon Squeezy.
6. `itch.io/blog/1137874/2025-finances` — the only real earnings dataset in reach anywhere in this group.
