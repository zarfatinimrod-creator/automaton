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

## Automated faceless-video pipelines, as a revenue line — REJECTED 2026-09-03

The owner sent https://github.com/harry0703/MoneyPrinterTurbo and asked us to find things
like it. We did, in depth. Full report: `research/tiktok/06-faceless-video-tooling.md`.

**The tool is real.** 120,072 stars, 18,388 forks, MIT, pushed 2026-09-02, 17 open issues.
Pipeline: topic → LLM script → TTS → Pexels/Pixabay/Coverr clips → subtitles → ffmpeg MP4 →
optional auto-publish, across 15+ LLM and 9 TTS providers. This is not a screenshot with a
Gumroad link; the engineering is sound. The class also includes MoneyPrinterV2 (31.8k★,
AGPL), MoneyPrinter (13.9k★), ShortGPT (7.9k★), and a separate *repurposer* tier — OpusClip,
Klap, Submagic — which needs a human creator upstream and is therefore a different thing.

**It is rejected as income for five independent reasons, each sufficient on its own:**

1. **No pipe to us.** Israel is not eligible for TikTok Creator Rewards (see the TikTok
   entry above), so that platform cannot pay us at all.
2. **YouTube's policy defines this output as ineligible.** The 2025-07-15 rename of
   "repetitious content" to **"inauthentic content"** covers "repetitive or mass-produced
   content". Israel *is* YPP-eligible, so this is where the policy actually bites: the
   output of a one-click generator is the named category, not an edge case.
3. **Enforcement targets our exact shape.** Google's published spam-cluster detection groups
   channels by synchronised upload schedules, templated formats and shared infrastructure,
   and terminates whole networks — roughly 50,000 clusters and 130,000 channels in six
   months. "Many agents, one codebase" is this classifier's canonical positive example. In
   January 2026 YouTube removed 16 channels holding 35M subscribers and 4.7B views in a
   single action.
4. **The arithmetic fails even if paid.** Shorts RPM of roughly $0.01-0.07 per 1,000 views
   means about **77 million views a month** for ₪20,000.
5. **The licensing trap is structural.** Pexels' API guidelines require a prominent Pexels
   link and photographer credit on every API-sourced use and forbid systematic bulk copying;
   no generated video honours this. Free stock carries no model releases, so a machine-written
   script over a machine-picked clip of an identifiable person is the highest-probability
   legal exposure in the class.

**And the receipts do not exist.** 120k stars over two and a half years, and the scout found
**zero verified earnings reports**. One review site openly admits it never benchmarked
earnings. Reach is real — a sample of ~15,000 trending channels found 278 pure-slop channels
with 63 billion views — but reach we cannot honestly convert is a statistic about other
people's risk appetite, not a business.

**Hebrew, specifically.** MoneyPrinterTurbo's own `docs/voice-list.txt` carries 494 voices, of
which exactly **two** are Hebrew (`he-IL-AvriNeural`, `he-IL-HilaNeural`). Its issue #1205
documents no RTL directionality and no suitable fonts, unanswered by the maintainer. Hebrew
subtitles do not work out of the box — and Hebrew is our entire audience. On TTS: ElevenLabs
v3 (Creator, $22/month) is the only engine worth our name on it, and it reportedly mishandles
mixed Hebrew-English, which is exactly our content; Google Chirp 3 HD is the safe-but-flat
option; **free Edge TTS is a Microsoft terms grey area and must not be used commercially.**
At volume the honest answer is captions and no narration.

**What is NOT rejected: the same tooling as a distribution channel.** Our own screen
recordings of our own tools, our own expertise, low volume, reviewed before publishing,
captions rather than synthetic narration. That is ordinary marketing: it dodges all five
traps, and we are paid by customers rather than by views. Use the repurposer tier ($0-22/month),
never auto-posting. Ranked honestly by effort-to-reach for our audience:
**Google/SEO > Facebook groups > LinkedIn > YouTube > TikTok.**

**Named traps, so no future session rediscovers them as clever:**
- *"Just make 50 channels"* — turns marketing into a spam cluster and invites network-wide
  termination. It is the failure mode, not the scale-up.
- *"Sell the pipeline to Israeli creators"* — charging people for a route into demonetisation.
  A constitution violation, not a product idea.
- *"But it gets 63 billion views"* — see above.

**What would reopen it:** a platform paying Israel for content this pipeline can legally and
honestly produce, plus Hebrew RTL support that works, plus a TTS licence that permits
commercial use. All three, not one.

**Evidence grade: mixed.** GitHub metrics and the repo's own files were read directly. Vendor
pricing pages were egress-blocked and are medium confidence. The TikTok-Israel ineligibility
is the one load-bearing fact the scout could not source first-party and is flagged for
re-verification.

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
