# Scout: content-seo / clipping-campaigns

**Date:** 2026-09-06
**Criterion:** Paid "clipping" — creators, streamers and brands paying clippers per 1,000 views for short cuts posted
to TikTok / Reels / Shorts. Whop clipping campaigns, Clipping.gg-style platforms, direct programmes. Real 2026 rates and
caps, proof of payment, whether a faceless machine-run account can enrol and be paid, KYC on the payout side, platform
rules on reposted and machine-cut content, and the honest income curve for one operator running many accounts.

**Search budget:** 8 of 8 WebSearch calls used. All further evidence came from GitHub (`search_code` + raw.githubusercontent
WebFetch), which costs no search budget.

---

## Evidence strength legend
- **[RENDERED]** — I actually fetched and read the document (or a verbatim mirror of it).
- **[SNIPPET]** — a WebSearch result summary quoting a page I did not render. Weaker.
- **[BLOCKED]** — the primary source exists but the egress proxy refused it; a human must open it.

---

## 1. The single most important structural fact

Clipping money does **not** come from TikTok. It comes from the campaign owner, paid through the campaign platform
(Whop, Ssemble, ClipReward, …). This matters enormously for this repo, because the existing research file
`/home/user/automaton/research/tiktok/01-monetization-israel.md` established that **every TikTok-native monetisation
surface is closed to an Israeli resident** (Creator Rewards Program country list has no Israel; no TikTok Shop Israel
market; Series, Subscriptions, Effect Creator Rewards all exclude Israel).

Clipping bypasses that entirely: TikTok is only the distribution surface; the payer is a US platform paying its own
balance out to a bank account. So clipping is, on the payability axis, the *only* TikTok-adjacent route the colony has
found that can legally pay an Israeli. That is a real finding and it inverts the earlier TikTok verdict — for this one
mechanism only.

## 2. Whop payability to Israel — RESOLVED, YES

Primary sources are `docs.whop.com` and `whop.com`, **both EGRESS_BLOCKED**. Route past it: the repo
`alchemy-run/distilled` vendors the complete Whop docs + API specs as markdown, and raw.githubusercontent.com renders.

- **[RENDERED]** https://raw.githubusercontent.com/alchemy-run/distilled/ddfee91b587d10af2c04d030390255716c181d74/packages/whop/specs/docs/manage-your-business/manage-payouts/set-up-payouts.md
  (mirror of https://docs.whop.com/manage-your-business/manage-payouts/set-up-payouts)
  - Heading **"Supported countries"**, introduced by *"Whop supports payouts to over 200 different countries:"*, and the
    country grid **contains "Israel"**. (Found first via `search_code`, which returned the exact fragment
    `<span …> Israel </span>` from this file — so the presence of the string is confirmed twice, once by code search on
    the raw file and once by rendering it.)
  - Setup flow: Dashboard → Balances → "Set up Whop Payments" → **select country** (payouts in local currency) →
    **KYC verification: personal details, bank linkage, ID upload**.
  - **Minimum withdrawal $10.**
  - Payout methods: bank account via Whop Payments, PayPal, Coinbase Commerce; instant / daily / weekly schedules;
    availability varies by country.
  - Warning verbatim: *"Whop doesn't support payouts to sanctioned or restricted countries."*

- **[RENDERED]** https://raw.githubusercontent.com/alchemy-run/distilled/ddfee91b587d10af2c04d030390255716c181d74/packages/whop/specs/docs/trust-and-safety/trust-safety-overview/sanctioned-countries.md
  (mirror of https://docs.whop.com/trust-and-safety/trust-safety-overview/sanctioned-countries)
  - Full list as returned: Afghanistan, Belarus, Burundi, Central African Republic, Comoros, Cuba, DR Congo, Eritrea,
    Haiti, Iran, Iraq, Lebanon, Lesotho, Libya, Myanmar, North Korea, Palestine, Papua New Guinea, Russia, Somalia,
    South Sudan, Sudan, Syria, Ukraine, Venezuela, Yemen.
  - **Israel is not on it.**

**Verdict: Whop → Israel is YES.** Rail: Israeli bank account or PayPal Israel (PayPal Israel supports withdrawal to
Israeli bank accounts — established in `research/tiktok/01-monetization-israel.md`).

**Owner blocker (unavoidable, one-time, legally required):** Whop Payments KYC — the owner personally supplies name,
date of birth, address, links a bank account and **uploads a government ID**. No agent can do this. Also, per the same
earlier research, Israeli law requires an עוסק file for income-producing activity, and a US-payer W-8BEN will be needed
to avoid 30% withholding. Assume none of this is done.

## 3. Whop's clipping mechanics — from Whop's own docs and API spec

- **[RENDERED]** https://raw.githubusercontent.com/alchemy-run/distilled/ddfee91b587d10af2c04d030390255716c181d74/packages/whop/specs/docs/memberships-and-access/third-party-apps/content-rewards.md
  - Two campaign types: **Content clipping** (*"Creators turn your existing long-form content (podcasts, livestreams,
    webinars) into short clips for TikTok, YouTube Shorts, X, and Instagram Reels"*) and **UGC**.
  - Campaign owner sets: **reward rate per 1,000 views**, total budget, **minimum payout** (earnings floor before a video
    enters review), **maximum payout** (per-video cap so one viral post can't drain the budget), optional flat-fee bonus.
  - Flow: creator posts → campaign owner reviews → *"Whop automatically pays the content creator based on the number of
    views they got."*
  - **The docs specify no account-age, follower-count or verification minimum for clippers.** Those are per-campaign.

- **[RENDERED]** https://raw.githubusercontent.com/alchemy-run/distilled/ddfee91b587d10af2c04d030390255716c181d74/packages/whop/specs/docs/api-reference/beta/bounties/bounty.md
  (Whop Bounties beta API — the programmatic form of this market)
  - `business_goal_type` enum includes **`clipping`**, `post_engagement`, `owned_account_growth`, `ugc_content`,
    `local_activation`, `data_capture`, `other`.
  - Money fields: `gross_reward_amount`, `net_reward_amount` ("worker's quoted amount **after platform deduction**"),
    `affiliate_share_amount`, `budget_amount`, `gross_paid_out_amount`.
  - Capacity: `accepted_submissions_limit`, `accepted_submissions_per_user_limit` (**default 1**), `spots_remaining`.
  - **`allowed_country_codes` — ISO 3166 alpha-2 geographic eligibility, set per bounty.**
  - `accepted_deliverable_types`: `content_url` (posted links) or `media`.
  - Also `min_total_verified_duration_seconds` on some types.

Two consequences, both load-bearing:
1. **Whop paying Israel is not the same as a campaign accepting an Israeli.** `allowed_country_codes` is a per-campaign
   field. How many live clipping campaigns are US-only is **UNKNOWN** and is the single number that decides this line.
2. `accepted_submissions_per_user_limit` defaults to 1 — the per-campaign cap on one worker is structural, which is
   exactly why operators run many accounts, which is exactly what the fraud terms target (below).

## 4. Rates — what is advertised vs what is paid

All **[SNIPPET]** — I could render none of these; whop.com and every clipping-affiliate blog is either blocked or
unverified secondary commerce content. Treat every number here as weak.

- Advertised: **$1–$5 per 1,000 views** typical; live listings **$0.20–$6**; published network rates as wide as
  **$0.06–$6.00**. Rough tiering: ~$1/1k basic clip, ~$2/1k faceless UGC edit, ~$3.50/1k on-camera UGC.
  (https://openclip.app/guides/whop-clipping-guide, https://luminaclippers.com/blog/how-much-do-clippers-make,
   https://zoupyu.com/blog/how-much-do-clippers-make)
- **Blended actually-paid rate across tracked views: ~$0.39 per 1,000.** Platform-wide average of live listings quoted
  at ~$1.25/1k. February 2026 platform payout quoted at **$887,000**. (https://zoupyu.com/blog/how-much-do-clippers-make,
  https://www.clipaffiliates.com/blog/is-whop-content-rewards-legit)
- Agency-managed clippers keep **55–70% of gross**.
- Clipper labour is concentrated in the **Philippines, Serbia and India at $300–$1,500 per million views** — i.e. the
  wage floor of this market is set by low-cost-of-living human labour. (https://kiip.app/articles/how-to-run-a-clipping-campaign)

**The honest income curve.** 20,000 ILS/month ≈ **$5,400** (at ~3.7 ILS/USD). At the blended **$0.39/1k**, that is
**~13.8 million views per month**, every month. At an optimistic sustained $1.00/1k it is **5.4 million views/month**.
At $2/1k, 2.7M. These are not "many accounts" numbers; they are "a mid-size media network" numbers, and they must be
earned on *someone else's* content with no brand of our own. For a no-name new entrant with no track record, no accepted
campaign history and no audience, the honest expectation in month 1–3 is **tens to low hundreds of shekels**, and it can
easily be zero because clips that don't reach the For You feed generate no views at all.

## 5. Proof anyone was paid — mixed, with a documented payout problem

**[SNIPPET] only.** I could render none of these.
- $887,000 paid out in February 2026 is the platform-level claim (source above) — that is a marketing figure, not a
  ledger, and I did not verify it.
- Against it: *"content rewards has a payout problem … clipper payouts are being held for months"* —
  https://x.com/felixplugs/status/2079604323722703139 ; complaint round-ups reporting payouts stuck a month or longer and
  staff acknowledging *"a payout bug our team is currently working on"*
  (https://findclout.com/blog/content-rewards-complaints); a Trustpilot review dated **26 July 2026** from a
  Pakistan-based user describing balances "approved but unpaid for an extended period".
- Structural risks named repeatedly: campaign owners can **reject clips after views are delivered**; **bot-flags freeze
  payouts**; **disputes can hold earnings up to 90 days**; **campaigns end when the budget depletes** — after the work.

**I found no first-hand, verifiable payout receipt.** "Proof anyone was paid" is, on the evidence I could actually
render, **not established**.

## 6. Can a faceless, machine-run account enrol and be paid? — the decisive ToS answer

Two separate gates, and they fail in different places.

**Gate A — the payer (Whop).** A faceless *social* account is fine; Whop verifies post ownership through the platforms'
official read-only APIs (**[SNIPPET]**), and the docs impose no follower minimum. But the *payee* is a KYC'd human, and
the Content Rewards terms (**[SNIPPET]**, https://whop.com/content-rewards-terms-of-service/ and
https://b4e0vdqv6zgqeqj4pfgm.apps.whop.com/terms — **both BLOCKED**, a human must open them) prohibit content
*"designed to inflate views or engagement through botting, view farms, click farms, engagement pods, or similar"*, ban
obtaining *"non-genuine views, likes, followers, or engagement"*, exclude from payment *"views generated by bots,
scripts, macros, or other automated means"*, and state that Content Rewards *"may consider behavior across accounts that
appear to be related or operated by the same person … and may act on all of them together"*.

Read precisely: **automating the editing and posting is not banned; automating the *views* is.** A machine that cuts and
uploads clips to accounts the owner controls, earning organic views, is inside the letter of these terms. A hundred
sock-puppet accounts cross-boosting each other is outside them, and is also outside our own constitution. The route that
makes the arithmetic in §4 work is the banned one. That is the crux.

**Gate B — the distribution surface, and this is where the line actually dies.**
- **TikTok.** *"Unoriginal content"* = material copied from others or with minimal original input — compilations,
  reposts, lightly-edited re-uploads. Such content **stays on the profile but is ineligible for the For You feed**;
  stricter enforcement announced from **15 September 2025**. (**[SNIPPET]**;
  https://www.tiktok.com/creator-academy/article/tiktok-originality-policy — a human should open this and
  https://www.tiktok.com/community-guidelines/en/integrity-authenticity.) A clip that is not FYP-eligible earns
  ~0 views, and a per-1,000-views contract on ~0 views pays ~0.
- **YouTube.** On **15 July 2025** the "repetitious content" policy was renamed **"inauthentic content"**: content that
  *"follows a template with minimal variation, is easy to reproduce at scale, and lacks clear author input"* is
  **ineligible for YPP monetisation**, and the rule applies to Shorts. Notably, the separate **reused-content policy was
  not changed** — commentary, clips, compilations and reactions with genuine transformation are still reviewed on their
  own terms. (**[SNIPPET]**; https://support.google.com/youtube/answer/1311392 is the page to open.)

So the honest reading: *hand-curated, genuinely transformative clipping* is permitted everywhere and can be paid to an
Israeli. *Machine-cut, high-volume, low-transformation clipping across many accounts* — the only version an owner who
does nothing could operate at the scale the target requires — is precisely what both platforms' 2025–26 policy waves
were written to demonetise and de-distribute, and what Whop's fraud terms let it claw back. **AMBER at best, RED at the
volume that would matter.**

## 7. The other platforms in this market (directory-level only)

Enumerated from search result titles, **not verified**, each needs its own check:
- **Ssemble Clip Rewards** — https://www.ssemble.com/clip-rewards ; **[SNIPPET]** pays through **Stripe**, quoted as
  supporting clippers in **39 countries** (US, CA, MX, BR, most of Europe, AU, NZ, JP, SG, HK named). **Whether Israel is
  in that 39 is UNKNOWN** — Stripe itself operates in Israel, but this is Ssemble's own list, not Stripe's.
- **ClipReward** — https://www.clipreward.com/ ; **[SNIPPET]** *"Each Reward … sets its own platform, country, language
  and content rules"* — same per-campaign geo gate as Whop's `allowed_country_codes`.
- **Clipping.net** — https://clipping.net/policies/clipper-terms-and-conditions (clipper T&Cs, unrendered).
- **Clipster / clipster.gg** — https://vues.app/blog/clipster-review , https://findclout.com/blog/clipster.
- **Clippable** — iOS app, https://apps.apple.com/app/clippable/id6758139088.
- **Contentrewards.com**, **Cut.Pro**, **Kiip**, **OpenClip**, **Vyroclips**, **Clippie.ai**, **Luvkaizen** — mostly
  affiliate/comparison content marketing *around* the market rather than the market itself. Their density is itself a
  signal: this niche is saturated with SEO content farms selling shovels to would-be clippers.
- **"Clipping.gg" as named in the criterion**: I found **no evidence such a domain/platform exists**. The `.gg` clipping
  platform that shows up in 2026 sources is **clipster.gg**. Treat "Clipping.gg" as probably a mis-naming.
- **Direct programmes**: one concrete example surfaced — FaZe Lacy's $20,000 clip prize with a $5,000 top-clip bonus
  (https://www.sportskeeda.com/us/streamers/news-faze-lacy-announces-20-000-prize-livestream-clip-creators-watched-clip-win-5000-extra).
  Direct programmes are one-off, contest-shaped, and require a human relationship — they fail the owner-does-nothing test.

## 8. What a human or unblocked agent must open to close this out

1. https://whop.com/content-rewards-terms-of-service/ — the actual clipper terms (multi-account, bots, clawback).
2. https://b4e0vdqv6zgqeqj4pfgm.apps.whop.com/terms — the Content Rewards app's creator terms.
3. https://whop.com/discover/ (live clipping campaign listings) — **count what fraction set `allowed_country_codes` to
   US-only**. This one number decides whether §2's YES is worth anything.
4. https://www.tiktok.com/creator-academy/article/tiktok-originality-policy — the originality rule in TikTok's words.
5. https://support.google.com/youtube/answer/1311392 — YouTube inauthentic-content wording.
6. https://www.ssemble.com/clip-rewards — is Israel in the 39-country Stripe payout list?

## 9. Recommendation

**Do not build this as an income line.** It clears the payability gate (Whop pays Israel) and fails everywhere else:
the rate is set by $300/million-view labour in the Philippines, the honest blended rate implies ~13.8M views/month for
the 20k ILS target, the only version that scales without a human is the version TikTok de-distributes and Whop's fraud
terms claw back, and I could not find a single verifiable payout receipt while I could find documented months-long
payout holds. The constitution ("honest value only", no engagement farming) rules out the profitable configuration
before the economics do.

The one thing worth keeping from this criterion is §1: **Whop is a verified payment rail into Israel with a $10 minimum
and one-time ID-upload KYC.** That is reusable by any other colony line that wants to sell to a US audience — and it is
a better outcome than the criterion itself produced.
