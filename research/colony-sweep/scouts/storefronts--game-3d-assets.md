# Scout notes — storefronts / "game-3d-assets"

Criterion: **itch.io, Unity Asset Store, Unreal Marketplace/Fab, Roblox — payouts to Israel,
what a software-only shop can produce, review bars, realistic earnings evidence.**
Scout: WORKER-SCOUT `game-3d-assets`. Date of research: **2026-09-03**.
Search budget spent: **8 / 8** (the cap in my orders). No searches were refused.

## Evidence quality warning — READ FIRST

**Every one of the four platforms' own domains is blocked by this container's egress proxy.**
Confirmed blocked, tried and failed with EGRESS_BLOCKED:

- `itch.io` (the payments doc, `itch.io/docs/creators/payments`)
- `create.roblox.com` (DevEx docs), `en.help.roblox.com` (DevEx support article)
- `dev.epicgames.com` (Fab documentation)
- `unity.com` (Asset Store Provider Agreement)

GitHub renders, but none of these four platforms mirror their store terms in a public repo that
`search_code`/`WebFetch` could reach for this question. `sindresorhus/awesome` was fetched (free)
and gave only a directory of gamedev lists — no payout or demand evidence, and it is cited below
as a directory only.

**Consequence: I rendered zero primary pages for this criterion. Everything below is a
search-result snippet quoting a page I could not open, or a cross-reference to another scout's
notes in this repo.** Snippets are marked as such. Nothing here comes from my memory; where I had
no snippet I wrote "unknown". Each finding lists the exact URL a human or unblocked agent must
open to close it.

---

## F1 — itch.io: open publishing, seller-controlled cut, paid through the seller's own PayPal

Evidence (all snippets, seen 2026-09-03):
- Payout options: for **itch-hosted payouts, international accounts get PayPal**; Payoneer was
  "announced for the near future". For **direct payments the only options are PayPal and/or
  Stripe** — the buyer's money goes straight to the seller's own account.
  Snippets of https://itch.io/docs/creators/payments and https://itch.io/t/10800/payout-options .
- Revenue model: free to publish; the seller **sets itch's cut anywhere from 0% to 100%
  (default 10%)**; payment processing ~2.9% + $0.30 is the only unavoidable fee.
  Snippet attributed to itch.io docs, quoted by
  https://generalistprogrammer.com/tutorials/how-to-make-money-on-itchio-indie-game-guide
  (a commercially motivated secondary guide — weak).
- Earnings shape: "most games earn under $100"; "active creators with several games reach
  $500–$2,000 per month" — same weak secondary guide, **not** an itch.io statistic.
  itch.io's own 2025 finances post exists (https://itch.io/blog/1137874/2025-finances) but is
  blocked and I could not read it.
- Creator Day, 28 Nov 2025: 15,000+ projects, developers got 100% of revenue for the period
  (snippet, https://en.techinbengali.com/itch-io-creator-day-100-percent-revenue-developers/).

**Review bar: effectively none.** itch.io is open publishing — no curation gate was found in any
snippet, and none is claimed by any source. That cuts both ways: nothing blocks a listing, and
nothing helps it be found. Discovery, not approval, is the constraint.

**Payability to Israel: YES (medium confidence).** Not because itch.io says so — I could not open
their page — but because the direct-payments route pays into the seller's own PayPal, and this
repo's sibling scout `payment-rails--paypal-israel.md` found (also on snippets) that an Israeli
PayPal account can withdraw to an Israeli bank in ILS, 8 NIS fee under 1,000 NIS, free above.
Stripe-for-Israel is **UNKNOWN** — sibling scout `payment-rails--stripe-alternatives.md` §7 says
sources conflict on whether Israel is a supported Stripe merchant country.
URLs to close: https://itch.io/docs/creators/payments ; https://stripe.com/global .

**What a software-only shop can actually ship here:** Godot/Unity/Unreal-adjacent *code* products —
editor tools, game templates, procedural generators, shader packs, browser-based dev utilities —
plus generated 2D/audio asset packs. Buyer: **indie developers and game-jam participants**, the
same people already on itch for jams.

**ToS: GREEN for hand-written tools sold honestly.** For AI-generated art/audio packs, itch.io's
own AI-content/disclosure policy is **unknown to me** — see F2, and do not ship that variant
before someone opens the page.

## F2 — The AI-asset-pack variant on itch.io is NOT cleared; treat as AMBER

I found no snippet at all stating itch.io's rules on AI-generated content or required disclosure.
That is a gap, not a green light. A shop whose entire production line is generative would be
publishing under a policy nobody in this colony has read.
**tosRisk: AMBER → not recommendable as a build under rule 4.**
URLs to close: https://itch.io/docs/creators/quality-guidelines and itch.io's content policy /
the AI-disclosure field on the project edit page.

## F3 — Unity Asset Store: the one clearly-defined lane, with an explicit AI policy

Evidence (snippets, seen 2026-09-03):
- **Payout: PayPal, monthly, no minimum transfer.** Alternative is **SWIFT bank transfer,
  quarterly, minimum $250** — and the Provider Agreement is quoted as: if a publisher cannot
  provide a valid PayPal account, Unity pays balances above **USD 250 quarterly by wire, less
  bank fees**. Snippets of https://unity.com/legal/provider and
  https://docs.unity3d.com/6000.3/Documentation/Manual/AssetStorePayouts.html .
- **Revenue split 70/30 to the publisher**; **minimum paid price $4.99**
  (snippet, https://generalistprogrammer.com/tutorials/unity-asset-store-selling-guide-revenue —
  weak secondary; the 70/30 also appears in Unity's own publishing pages per snippet).
- **Review bar is real**: a curation team reviews every submission against the Submission
  Guidelines — professional construction, marketing presentation, visual and functional quality,
  and no errors/warnings originating from the package after setup.
  Snippet of https://assetstore.unity.com/publishing/submission-guidelines .
- **AI content is explicitly permitted, with mandatory disclosure** — the clearest ToS answer I
  got anywhere in this criterion. Snippet of Unity's support article: AI-generated content may be
  published and sold provided it does not resemble third-party/copyrighted work, does not
  plagiarise other publishers and does not lack significant utility; **disclosure is mandatory if
  any functional part of the asset is AI-generated or AI-assisted** (not required if only the
  marketing images are); AI/AI-assisted content **may not use keywords implying human effort**
  ("drawn", "hand drawn", "painted"); and Unity **reserves the right to reject submissions
  mass-produced with AI that lack differentiation** from the publisher's existing catalogue.
  URL to close: https://support.unity.com/hc/en-us/articles/16456407029524 and
  https://unity.com/legal/asset-store-content-transparency .
- Earnings, all from a weak secondary guide and a forum thread, **not** from Unity:
  top sellers "$10,000–$30,000/month"; "smaller publishers can earn $1,000–$2,000/month with a
  handful of quality assets"; starting out is "a few dollars a month", growing to "$1,000–$1,500"
  only after ~15 packs. Treat the upper numbers as marketing. The *shape* — near-zero for one
  asset, meaningful only across a catalogue — is consistent across sources and is the usable part.

**Payability to Israel: YES (medium confidence).** Inferred: PayPal monthly is the default rail and
Israeli PayPal withdraws to an Israeli bank (sibling scout). **No country list or restricted-
territory clause was rendered** — the Provider Agreement is blocked, so a restricted-territory
clause could exist and I would not have seen it. URL to close: https://unity.com/legal/provider .

**Buyer, nameable:** Unity developers and small studios who buy editor extensions rather than build
them — the recurring purchases are build/pipeline tooling, save systems, localisation, inspector
and workflow utilities. That is a *code* product, which is exactly what an agent shop can make well,
and it sidesteps the art-quality bar that kills software-only 3D-model sellers.

**Owner blockers (one-time, legally required):** a Unity publisher account with a tax form
(W-8BEN for a non-US individual) and a PayPal account in the owner's name. Not verified as the
complete list — the publisher onboarding pages are blocked.

## F4 — Fab (Epic): terms are good, the Israeli payout rail is the open gate

Evidence (snippets, seen 2026-09-03):
- **88% revenue share** to the creator (snippet of https://www.fab.com/o/become-a-publisher).
- **Payout via Hyperwallet**, ~30 days after month end, **$100/month minimum, rolling over**
  until met; tax profile then Hyperwallet activation required.
  Snippets of https://dev.epicgames.com/documentation/fab/publisher-get-started-in-fab and
  https://www.epicgames.com/help/en-US/.../how-do-i-receive-hyperwallet-support-as-a-fab-publisher-a000094083 .
- **Hyperwallet covers "115 countries" / 24 currencies** — and **no snippet confirmed Israel is one
  of them** (snippets of docs.hyperwallet.com payout-networks pages and a Work Market help article).

**Payability to Israel: UNKNOWN — this is the finding.** 88% of nothing is nothing. Until someone
opens Hyperwallet's payee-country availability table and finds Israel, Fab cannot be committed to.
URLs to close:
https://docs.hyperwallet.com/content/transfer-methods/v1/payout-networks/transfer-method-payee-country-availability
and https://dev.epicgames.com/documentation/fab/publisher-get-started-in-fab .

Also note the $100 monthly floor: below it nothing pays out at all, it only accrues. For a
no-brand new entrant that is a real risk of a zero-cash first quarter even with sales.

## F5 — Roblox DevEx: worst fit of the four, and Tipalti carries an explicit Israel caveat

Evidence (snippets, seen 2026-09-03):
- DevEx pays through **Tipalti**; Roblox says it can pay participants in **"over one hundred"
  countries**; non-US developers must file **W-8BEN** through Tipalti; available payment methods
  depend on country. Snippets of
  https://en.help.roblox.com/hc/en-us/articles/27985018895124-Tax-and-DevEx-Portal-Tipalti-Information
  and https://en.help.roblox.com/hc/en-us/articles/203314100 .
- **Tipalti's own help pages carry the line that payments are not available for Israeli-based
  entities in certain payment-coverage regions** (snippet of
  https://help.tipalti.com/hc/en-us/articles/31314361313815-Payment-methods-coverage-US-ROW).
  I could not render the page to see the exact scope of that restriction — it may concern Tipalti
  customers rather than payees — but it is the only Israel-specific sentence I found anywhere in
  this criterion and it points the wrong way.
- I obtained **no** current figure for the DevEx minimum Robux threshold, the Robux→USD rate, or
  the full eligibility list — the two Roblox support articles that hold them are blocked.

**Payability to Israel: UNKNOWN, leaning negative.** On top of that, Roblox earning is driven by
live-service experiences with social/community operations, which is the shape MISSION rules out
for an owner who does nothing. Not recommended.
URLs to close: the two Roblox help articles above, plus Tipalti's coverage pages.

## F6 — "Unreal Marketplace" no longer exists as a separate storefront

The Unreal Engine Marketplace was folded into **Fab**, Epic's unified marketplace (Fab launched
October 2024; snippet of https://en.wikipedia.org/wiki/Fab_(website) and every Epic doc snippet
now points at Fab). Anyone re-sweeping this criterion should treat "Unreal Marketplace" and "Fab"
as one target, not two. Confidence: medium (snippet-level, but consistent across three sources).

---

## Directory used (not evidence of demand)
- https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md — FETCHED. Enumerates the
  gamedev field (awesome-godot, awesome-roblox, magictools, awesome-gamemaker, …). Proves those
  ecosystems exist; proves nothing about payability or buyers. Cited as a directory only.

## Full URL list actually seen (fetched or as a search snippet)
FETCHED (rendered): raw.githubusercontent.com/sindresorhus/awesome/main/readme.md
BLOCKED (tried, EGRESS_BLOCKED): itch.io/docs/creators/payments ; create.roblox.com/docs/production/earn-on-roblox/developer-exchange ;
dev.epicgames.com/documentation/en-us/fab/getting-started-with-fab ; unity.com/legal/provider ;
en.help.roblox.com/hc/en-us/articles/203314100
SNIPPETS ONLY: itch.io/t/10800/payout-options ; itch.io/blog/1137874/2025-finances ;
generalistprogrammer.com/tutorials/how-to-make-money-on-itchio-indie-game-guide ;
en.techinbengali.com/itch-io-creator-day-100-percent-revenue-developers/ ;
unity.com/legal/provider ; docs.unity3d.com/6000.3/Documentation/Manual/AssetStorePayouts.html ;
assetstore.unity.com/publishing/submission-guidelines ;
support.unity.com/hc/en-us/articles/16456407029524 ; unity.com/legal/asset-store-content-transparency ;
generalistprogrammer.com/tutorials/unity-asset-store-selling-guide-revenue ;
discussions.unity.com/t/how-much-asset-store-publishers-earn/628535 ;
fab.com/o/become-a-publisher ; dev.epicgames.com/documentation/fab/publisher-get-started-in-fab ;
epicgames.com/help/en-US/...a000094083 ; docs.hyperwallet.com/content/transfer-methods/v1/payout-networks ;
help.tipalti.com/hc/en-us/articles/31314361313815-Payment-methods-coverage-US-ROW ;
en.help.roblox.com/hc/en-us/articles/27985018895124 ; devforum.roblox.com/t/what-countries-is-devex-supported-in/3510524 ;
en.wikipedia.org/wiki/Fab_(website)
CROSS-REFERENCED (this repo): research/colony-sweep/scouts/payment-rails--paypal-israel.md ;
research/colony-sweep/scouts/payment-rails--stripe-alternatives.md ;
research/colony-sweep/scouts/storefronts--asset-marketplaces.md (no overlap — it covers Envato/
Creative Market/TemplateMonster, none of my four platforms)

## Bottom line for the supervisor
1. **Only two of the four platforms are even arguably payable to an Israeli today**, and both on
   the same rail: PayPal. itch.io (direct payments) and Unity Asset Store (monthly PayPal). Both
   are *inferred*, not rendered — the payability gate for this whole criterion rests on one sibling
   scout's snippet that Israeli PayPal withdraws to an Israeli bank.
2. **Fab is the best commercial terms in the group (88%) and is blocked on one unanswered
   question**: is Israel a Hyperwallet payee country. One rendered page closes it.
3. **Roblox is out** — Israel-specific negative signal on the payout processor plus a business
   shape that needs live community operations.
4. **The strongest single lane** is a Unity Asset Store *editor tool* (code, not art), because
   Unity is the only platform of the four with a written, permissive, disclosure-based AI-content
   policy — an all-software shop can operate there honestly and say so on the listing. The cost is
   a real curation review and a catalogue-scale earnings curve: one asset earns approximately
   nothing; the money, if any, is in ten.
5. Nobody should re-sweep "Unreal Marketplace" — it is Fab.
