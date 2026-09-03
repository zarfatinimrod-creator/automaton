# The kill list — what was investigated and rejected, and why

A colony that re-proposes the same dead idea every sweep is not searching, it is looping.
This file is the memory that prevents that. Every entry names what was checked, what killed
it, and what evidence would have to change for it to come back.

**Read this before promoting a candidate.** The sweep's supervisors and board are expected
to check a candidate against this file; a rejection that gets re-proposed without new
evidence is a supervisor failure, not a new finding.

Three standing rules govern entries here:

1. **A rejection needs a reason with a source**, not a hunch. "Probably not worth it" is not
   a rejection, it is an absence of research.
2. **Name what would reopen it.** A market closed to Israel today can open; a policy can
   change. An entry with no reopening condition is either wrong or permanent, and it should
   say which.
3. **Evidence grade travels with the claim.** Much of this repo's research is done from a
   network that cannot open most pages (see `docs/CRITERIA_SWEEP.md`). A rejection resting on
   search snippets is still a rejection, but it says so.

---

## TikTok, as a revenue line — REJECTED 2026-09-03

**Verdict: there is no TikTok revenue surface that is simultaneously (a) open to an Israeli
resident, (b) payable without the owner appearing on camera or speaking to anyone, and
(c) compatible with TikTok's own terms.** Every path fails at least one of the three, most
fail two.

Full report with per-claim confidence: `research/tiktok/01-monetization-israel.md`.

| Surface | Why it is closed |
|---|---|
| Creator Rewards Program | Israel is not on the eligible-country list (~7-8 countries). Doubly closed: the originality rules exclude compilations, reposts, light re-edits and text-to-video slideshows — the native output of an automated pipeline. |
| TikTok Shop (seller / affiliate / digital goods) | No Israel market among ~24 seller markets. Affiliate is residency-gated to those markets. Digital goods are prohibited outside an invite-only codes-based category. |
| LIVE gifts | Region plausibly open, but the LIVE Monetization Guidelines demonetize passive, unattended, static and looped streams — the only kind a machine could run. |
| Subscriptions, Series, Effect Creator Rewards | Published country lists; Israel on none of them. |
| Creator Marketplace | Possibly open to Israel — unverified, sources copy each other. Dead anyway: brand deals mean briefs, negotiation, contracts and invoices, which is a person talking to people. |
| Content Posting API | TikTok "is currently unable to onboard personal accounts or individual developers". Unaudited clients can only post privately (`SELF_ONLY`). |

**The arithmetic, for the record.** Even in the counterfactual where Creator Rewards were
open to Israel: ₪20,000/month ≈ $5,400, and at a creator-reported $0.20-$1.20 RPM that is
roughly **6.75 million qualified views every month**, forever, from content the programme's
own originality rules exclude.

**What remains legitimate:** TikTok as unpaid top-of-funnel to a product we own — and even
that is constrained by the ToS clause barring automated interaction and by the posting-API
gate, so it cannot be an automated posting pipeline.

**Explicitly forbidden, so that no future session proposes them as clever:** VPN or region
spoofing to fake eligibility; buying or renting aged accounts; unofficial posting bots;
account farms and coordinated cross-posting; listing digital goods in categories that forbid
them; publishing AI-generated content without the required label. Each of these is a terms
violation, and the constitution in `MISSION.md` outranks the revenue target.

**What would reopen it:** TikTok adding Israel to the Creator Rewards or Shop country lists,
or opening the Content Posting API to individuals. Re-check the five claims marked 🟡 in the
report from a network that can reach TikTok's own domains before acting on any of it.

**Evidence grade: snippets only.** The research network blocked every `*.tiktok.com` host, so
no TikTok policy page was opened directly. The country-list findings are consistent across
many independent sources and are graded high confidence; the Creator Marketplace question is
explicitly unresolved.

---

## Earlier rejections

Kept in `docs/INCOME_PLAN.he.md` §4 with one-line reasons: Envato (bans AI files, 50%
commission), Discord Premium Apps (US/UK/EU developers only), Figma plugins (not approving
new sellers), Raycast (no payment mechanism), GPT Store (US-only revenue programme),
Smithery ($30/month, pays nothing), Olas/Pearl (macOS-only, maintenance mode), Medium
Partner (bans AI writing behind the paywall, pays via Stripe), Substack and beehiiv
(Stripe — which does not serve Israeli accounts), bulk AI content and templated YouTube
channels (penalised and demonetised through 2026), Google Play (£/$25 plus identity plus 12
testers for 14 days — not worth a first experiment), freelance marketplaces and RLHF work
(require an identified human who talks to clients).

Shopify apps are **not** rejected — they are parked as a future candidate, gated on a
manual review of one to four weeks and a selfie KYC.
