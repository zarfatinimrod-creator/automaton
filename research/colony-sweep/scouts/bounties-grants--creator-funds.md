# SCOUT: bounties-grants / creator-funds

**Criterion:** Creator funds and payouts beyond TikTok — YouTube Partner, Reddit, Medium,
Substack, X, Pinterest, Snapchat: eligibility for Israel, payout rails, and whether
faceless or AI-assisted content qualifies.

**Date:** 2026-09-03. **Search budget used: 8/8 (cap reached — stopped, per rule 8).**

## Method and evidence quality (read this before trusting anything below)

- **Every primary source I tried to render was blocked by the egress proxy**:
  `help.medium.com`, `support.substack.com`, `stripe.com` all returned `EGRESS_BLOCKED`.
- GitHub renders, but **none of these platforms check their payout-country lists into
  public repos**. Two `mcp__github__search_code` queries (`org:stripe "Israel" country
  support payouts`, and a Stripe supported-country-code list query) returned 0 useful hits.
  So on this criterion GitHub carried nothing — worth recording, because the standing
  advice is "lead with GitHub" and here that advice yields zero.
- Therefore **every claim below rests on a search snippet, not a rendered page**. Nothing
  here is stronger than "the search engine quoted this page to me". I have marked the
  exact URLs a human or unblocked agent must open to close each gap.

## THE ONE FINDING THAT MATTERS: the Stripe gate

Five of the seven programs in this criterion (Reddit, Medium, Substack, X, and Pinterest's
paid features) pay creators **through Stripe Connect**. Israel is the pivot:

> "Writers in Israel are locked out of Substack's core economic layer... Israeli writers
> cannot set up their accounts to allow paid subscriptions because Stripe does not provide
> service in Israel." — snippet from https://ozsheri.substack.com/p/why-cant-israeli-substack-writers
> and https://ozsheri.substack.com/p/substack-calls-itself-a-global-platform (search snippet, 2026-09-03)

> "Writers in countries like Israel, Argentina, South Korea, Taiwan, and Turkey can publish,
> grow audiences, and be promoted within the platform, but they cannot enable paid
> subscriptions." — same snippet cluster.

This is consistent with a conflict already recorded by a sibling scout in
`payment-rails--stripe-alternatives.md` lines 133-137, which found sources disagreeing on
whether Israel is a supported *merchant* country for Stripe. My reading: Stripe supports
ILS **as a currency** and can pay *into* an Israeli bank in some flows, but Israel is not a
supported country for a Stripe **account holder / Connect payee**, which is exactly what
every creator-payout program requires. A creator-side Stripe account is the gate, and it is
shut.

**Consequence:** the entire Stripe-based creator-fund class is worth zero to this owner
unless he forms a foreign entity — which is a new legal/KYC blocker, not a build task, and
is out of scope for a software-only operation.

**The single rail that does reach Israel is Google AdSense** (YouTube). AdSense pays by EFT
"to virtually every country" and Payoneer publishes a dedicated Israeli-facing route for
AdSense/YouTube payments. That makes YouTube the only member of this criterion with a live
payout path — and its content policy is the thing that then bites.

**URLs a human must open to close the Stripe gap (highest value first):**
1. https://stripe.com/global — the authoritative supported-country list. BLOCKED here.
2. https://support.substack.com/hc/en-us/articles/360041314672-Are-there-any-countries-or-geographies-you-don-t-support — BLOCKED here.
3. https://docs.stripe.com/connect/cross-border-payouts

---

## 1. YouTube Partner Program (AdSense for YouTube) — the only payable one

- **Payout rail:** AdSense for YouTube, monthly EFT bank transfer, **$100 minimum**,
  paid between the 21st and 26th of the following month.
  Snippets from https://support.google.com/adsense/answer/3372975 ,
  https://support.google.com/adsense/answer/7164703 ,
  https://support.google.com/youtube/answer/14728151
- **Country eligibility:** YPP is in "more than 100 countries", and eligibility is set by
  **AdSense**, not YouTube — "If your country is not on the AdSense-eligible list, you
  cannot receive monetization payments even if your channel meets all other YPP
  requirements." (snippet, https://wildandfreetools.com/blog/youtube-partner-program-countries-list/)
  No snippet I obtained names Israel explicitly. **Israel is not in doubt in practice** —
  Payoneer runs a product page for receiving AdSense/YouTube payments and AdSense pays EFT
  nearly worldwide (https://www.payoneer.com/resources/business/adsense-payments/) — but
  I could not render the AdSense country list, so I am calling this **YES, medium confidence**.
  URL to close it: https://support.google.com/adsense/answer/9905 (supported countries list).
- **Entry bar:** 1,000 subscribers + 4,000 public watch hours in 12 months (snippet,
  https://support.google.com/adsense/answer/72851). This is the killer for a 40-hour build:
  the gate is *audience*, not software, and no amount of agent labour buys it directly.
- **AI / faceless content — the July 15 "inauthentic content" policy:**
  YouTube renamed its "repetitious content" policy to "inauthentic content". Per snippets,
  this was a **clarification, not a ban**: AI-assisted and AI-generated content stay
  eligible for YPP *if* the content offers original value, is not mass-produced or
  repetitive, and the "altered or synthetic content" disclosure is toggled in YouTube Studio.
  Sources (snippets): https://ppc.land/youtube-clarifies-inauthentic-content-policy-changes/ ,
  https://www.auditsocials.com/blog/youtube-inauthentic-content-policy-2026-mass-produced-ai-generated-monetization-creators-brands
  **Read honestly against MISSION.md: the compliant version of this is exactly the version
  an unattended agent farm cannot produce.** "Original analysis, narration, editorial
  judgment, creative framing" is the qualifying criterion, and "mass-produced" is the
  disqualifying one. An agent pipeline that outputs volume is the disqualified case by
  construction. So: GREEN for a genuinely original, disclosed channel; AMBER-to-RED for the
  automated version, which is the only version this operation would actually run.
- **Verdict:** payable, but not buildable in 40 hours, and the automatable form of it is the
  form the policy exists to demonetise. Do not build.

## 2. Reddit Contributor Program — Stripe, and not our countries

- **Rail:** Stripe. "$10 earned on eligible contributions" minimum, paid into the Stripe
  account 30-45 days after month close. Standard contributors earn **$0.90 per gold award**,
  top contributors **$1.00**. (snippets from
  https://support.reddithelp.com/hc/en-us/articles/17331720493972-Understanding-Contributor-Earnings-Payouts
  and .../17331620007572-What-is-the-Contributor-Program-and-how-can-I-participate)
- **Countries:** launched US-only in 2023; snippet lists full support for USA, UK, Canada,
  Germany, France, Australia and limited access in Japan, Brazil, India. "Most of the world
  still cannot enroll in 2026." **Israel is not named.** → payability UNKNOWN, leaning NO,
  and doubly gated by the Stripe problem above.
- **Content/ToS:** the earning mechanism is *other users giving you gold*. The only way to
  scale that with software is to manufacture engagement — which is squarely a constitution
  violation (engagement farming) and a Reddit ToS violation. **RED for the automatable form.**
- **Verdict:** dead. Not payable, and the automatable path is dishonest.

## 3. Medium Partner Program — payable-ish country list, but AI writing is banned from the paywall

- **Rail:** Stripe, **$10 minimum**, rolls over month to month.
  (snippet, https://help.medium.com/hc/en-us/articles/360003928833-Set-up-payouts-with-Stripe — BLOCKED to render)
- **Countries:** "now available in 119 supported countries... Almost all countries supported
  by Stripe are now supported by the Partner Program", after adding 77 then 9 more
  (Bulgaria, Croatia, Cyprus, Gibraltar, Hungary, Liechtenstein, Malta, Malaysia, UAE).
  (snippets, https://medium.com/blog/weve-added-77-countries-to-the-medium-partner-program-827a574fcdf0)
  Israel not named in any snippet; and the phrase "almost all countries supported by Stripe"
  makes Medium's list *derivative of Stripe's*, which is the gate that excludes Israel.
  → UNKNOWN leaning NO.
- **AI policy — decisive regardless of country:**
  > "AI-generated writing (disclosed as such or not) is not allowed to be paywalled as part
  > of the Partner Program, and accounts with fully-generated AI writing behind the paywall
  > may have those stories removed from the paywall and/or have their Partner Program
  > enrollment revoked." (snippet, https://help.medium.com/hc/en-us/articles/22576852947223-Artificial-Intelligence-AI-content-policy)
  Medium permits "AI-assistive technology" for a human author. It does not permit what this
  operation is: no human author.
- **Verdict:** **RED** for us. An agent-written paywalled Medium is an explicit terms
  violation. Do not build. This is a clean, unambiguous no.

## 4. Substack — explicit, named exclusion of Israel

- The strongest Israel-specific evidence in this entire criterion, and it is a NO.
  Israeli writers may publish and grow, but **cannot enable paid subscriptions**, because
  Substack is Stripe-only and Stripe does not serve Israeli account holders. Snippet also
  cites "technological and regulatory difficulties in the Israel market" and that Stripe
  "is not connected to the Israeli financial system".
  https://ozsheri.substack.com/p/why-cant-israeli-substack-writers ,
  https://support.substack.com/hc/en-us/articles/360041314672-... (BLOCKED)
- Suggested workaround in the same snippet cluster — tip jars, Patreon, buy-me-a-coffee —
  is a *different* criterion (belongs to storefronts/payment-rails), not a creator fund.
- **Verdict:** dead for Israel. First-class NO. Worth writing down loudly so no one in the
  colony re-searches it.

## 5. X (Twitter) Creator Revenue Sharing — cost before revenue, Stripe gate, impossible threshold

- **Requirements (snippet, https://help.x.com/en/using-x/creator-revenue-sharing and
  https://influencermarketinghub.com/x-twitter-ads-revenue-sharing/):** active X Premium
  subscription (**$8/month, a cost the owner pays before earning anything**), ≥500 verified
  followers, **≥5,000,000 organic impressions in the last 3 months**, a connected Stripe
  account **in a supported country**, and good standing under Creator Monetization Standards.
- **Payout:** $30 minimum, rolls forward below that; processed roughly every two weeks via Stripe.
- **Israel:** not named as Stripe-supported in any snippet. UNKNOWN leaning NO.
- **Verdict:** even ignoring Israel, 5M impressions/quarter from a standing start is not a
  40-hour build, and the honest ways to get there are not software-only. The dishonest ways
  are engagement farming. Do not build.

## 6. Snapchat Monetization Program — invite-gated, Israel absent from the country list

- Unified program (Spotlight + Stories merged). Requirements per snippet: **50,000 followers,
  15,000 hours of view time in 28 days with ≥3,000 from Spotlight**, Snap Star status,
  eligible country, original advertiser-friendly public content.
  https://help.snapchat.com/hc/en-us/articles/14669003687444-About-Snapchat-s-Monetization-Program ,
  https://newsroom.snap.com/snapchat-new-creator-monetization
- A country list surfaced in the snippet enumerates ~40 countries including Egypt, Jordan,
  Kuwait, Lebanon, Libya, Morocco, Oman, Pakistan, Palestine — and **Israel is not in it**.
  I did not render the list, so this is UNKNOWN-leaning-NO rather than a hard NO, but the
  regional pattern is not encouraging.
  URL to close: the eligible-country list on Snapchat's Creator Hub.
- Also: monetization is **by invitation**. There is no self-serve enrolment for an agent to drive.
- **Verdict:** dead.

## 7. Pinterest — genuine information vacuum

- One search touched Pinterest and returned **nothing at all** about a Pinterest creator fund
  in 2026. I have no evidence either way and I will not fill it from memory. **UNKNOWN.**
- What a follow-up should check, in one search, if anyone thinks it is worth it:
  whether Pinterest's Creator Fund / Creator Rewards still exists, and whether it was ever
  anything other than US-only. My prior belief is that it was US-only and was wound down,
  but that belief is **not evidence** and must not be reported as a finding.

---

## Dead ends (report them, per rule 6)

1. **The whole Stripe-payout class is dead for Israel**: Reddit, Medium, Substack, X.
   One structural fact kills four programs. This is the highest-value line in this file.
2. **Substack specifically names Israel as unable to take paid subscriptions.**
3. **Snapchat and Reddit are invite/allow-list gated**, so there is no self-serve surface an
   agent can even attempt.
4. **Medium forbids AI-written paywalled content outright** — RED regardless of geography.
5. **Pinterest: no data obtained.** Not a finding, a hole.
6. **GitHub was useless on this criterion.** Creator-payout country lists and monetization
   policies are not checked into public repos; two code searches returned nothing. Future
   scouts on payout-eligibility criteria should not spend turns there.
7. **Primary sources uniformly blocked**: help.medium.com, support.substack.com, stripe.com.
   Everything above is snippet-grade.

## The honest bottom line for the colony

This criterion contains **no buildable line**. Not one program here is simultaneously
(a) payable to an Israeli, (b) reachable in under 40 hours by software, and (c) permitted
by both platform terms and our own constitution. YouTube is the only one that clears the
payability gate, and it fails (b) and — in its automatable form — (c).

The deeper point is worth carrying to the supervisor: **creator funds pay for audience, and
audience is the one asset an unattended agent farm cannot honestly manufacture.** Every
program in this criterion is priced in followers, watch hours or impressions. Our shipped
products (il-biz-tools, the Telegram bot, Apify, x402) are priced in *utility*, which is
the thing software can actually produce. This criterion is a structural mismatch with the
mission, not merely an unlucky search.
