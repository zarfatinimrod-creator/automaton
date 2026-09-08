# SCOUT NOTES — plugin-ecosystems / figma
Date: 2026-09-04. Agent: WORKER-SCOUT "figma". Group: plugin-ecosystems.
Criterion: Figma plugins and widgets — the paid-plugin mechanism, Community payouts and
eligible countries, what sells, and unserved gaps.

## Budget and method
- Web searches spent: **7 of 8 allowed**. No search was refused this session.
- Egress: `forum.figma.com` **EGRESS_BLOCKED** (confirmed by direct WebFetch attempt).
  `help.figma.com` was already recorded EGRESS_BLOCKED by an earlier scout
  (`research/colony-sweep/scouts/store-promotion--marketplace-ranking.md`), so it was not
  re-tried. **Every help.figma.com claim below is therefore SEARCH-SNIPPET evidence, not a
  rendered page.** Marked as such per rule 2b.
- GitHub route: `mcp__github__search_code` for figma+license-key monetization returned only
  unrelated repos. `brandonhimpfen/awesome-figma` rendered via raw.githubusercontent.com
  (free) but is a thin 6-plugin list with no monetization content — DIRECTORY only,
  **not demand evidence**. Figma does not publish its Community/monetization terms into a
  public GitHub repo, so the GitHub-primary-source route does not close these questions.

## Evidence log (URL — what it supports — evidence strength)

1. https://help.figma.com/hc/en-us/articles/12067637274519-About-selling-Community-resources
   - Payout-eligible countries list, quoted in a search snippet on 2026-09-04, **includes
     Israel** (list also included Argentina, Australia, Canada, Egypt, Germany, Japan,
     Jordan, Saudi Arabia, Singapore, Turkey, UAE, UK, US, Vietnam and ~60 others).
   - Also: "Figma is not approving new creators to sell **paid files** on Community at this
     time."
   - STRENGTH: snippet quoting the page. **Human must open this URL to confirm the Israel
     row and the files-vs-plugins distinction.**

2. https://help.figma.com/hc/en-us/articles/4410337103639/ ("Before you start")
   - Snippet (2026-09-04): "Figma is approving new creators to sell Plugins and Widgets on
     Community using Figma's native payment system" — i.e. the closed door is **paid files**,
     not paid plugins/widgets.
   - Corroborated by a second snippet (2026-09-04): "selling plugins is open — the only
     requirement is being able to set up a Stripe account in a Stripe-supported country."
   - STRENGTH: two independent snippets agreeing. **Still snippet-only. Open this URL.**

3. https://help.figma.com/hc/en-us/articles/360042293394-Publish-plugins-to-the-Figma-Community
   - Payment models: one-time payment OR monthly subscription; **the choice is permanent
     after publishing**. Subscriptions include a 7-day free trial by default; one-time
     purchases do not.
   - STRENGTH: snippet.

4. https://help.figma.com/hc/en-us/articles/12730712101783-Activate-your-Stripe-account
   - After approval you receive an email invite and must activate a **Stripe** account
     before publishing any paid resource. Stripe supports Israel.
   - STRENGTH: snippet. This is the one-time human KYC step.

5. Figma's cut: snippet (2026-09-04) says Figma "handles payments with a 15% fee" → creator
   keeps ~85% before Stripe processing. STRENGTH: snippet, unattributed to a specific
   article. **Treat the 15% as unconfirmed** until article 12067637274519 is rendered.

6. External / third-party payment — the ToS question that decides the whole criterion.
   Two snippets, same date, that must be read together:
   - "You have the option to sell your plugins and widgets through Figma's payment platform
     **or an external payment site**. However, if you choose Figma's platform, refrain from
     including links to third-party payment sites, marketplaces, or a checkout page on your
     personal website."
   - "creators are able to monetize plugins or widgets using **third-party payment pages,
     with links included within the plugin's UI and on its Community page description**."
   - Reading: external billing is permitted **as an alternative to** Figma billing, and the
     link ban applies only when you took Figma's rail. This is a coherent reading but it is
     assembled from snippets. **AMBER until rendered.**
   - URLs a human must open: the two above plus
     https://help.figma.com/hc/en-us/articles/360038510573-Figma-Community-Guidelines
     and https://forum.figma.com/ask-the-community-7/sell-on-figma-community-3rd-party-payment-vs-figma-payment-25300

7. Demand / what earns, all THIRD-PARTY anecdote, none audited:
   - https://blog.prototypr.io/how-i-made-over-33-000-on-the-figma-plugin-without-writing-a-single-line-of-code-9a5ca50f2cc8
     — one creator claims >$33,000 lifetime from a Figma plugin. Self-reported blog post.
   - https://www.linkedin.com/posts/akingkiwi_in-2025-we-grew-the-email-love-figma-plugin-activity-7407125582154469376-uyJy
     — "Email Love Figma plugin reaches $3K MRR with 44% margin" (2025). Self-reported.
   - These are the top of the distribution and prove a ceiling exists, **not a median**.
     No official Figma statistic on plugin-developer earnings was found.

8. Platform-risk signals from the (blocked but search-indexed) forum, 2026:
   - https://forum.figma.com/ask-the-community-7/plugin-in-review-for-over-a-month-any-way-to-get-a-status-update-53168
     — review queues running over a month; Figma cites "a higher volume of submissions".
   - https://forum.figma.com/report-a-problem-6/no-update-on-my-plugin-since-april-13th-53287
   - https://forum.figma.com/ask-the-community-7/complaint-my-two-plugins-were-released-several-years-ago-today-they-were-suddenly-removed-by-the-platform-and-no-other-users-can-find-them-anymore-49614
     — plugins removed years after release with no notice. Delisting risk is real.
   - STRENGTH: snippets of forum threads (titles are themselves evidence the threads exist).

9. Discovery — the binding constraint, already established inside this repo:
   `docs/REJECTED.md:273` and `research/colony-sweep/groups/store-promotion.md:277` record
   that every documented Figma Community ranking input (users, views, saves, likes,
   comments) is **accumulated usage**, with **no editorial or "newest" lane**. A new listing
   has no surface that shows it. That finding was reached by a prior scout from
   help.figma.com snippets; nothing this session contradicts it.

## MATERIAL CORRECTION to repo docs
`docs/REJECTED.md:674` and `docs/INCOME_PLAN.he.md:229` both state "Figma plugins — not
approving new sellers". Evidence 1+2 says that closure applies to **paid FILES**, and that
**paid plugins and widgets are open** to new creators in a Stripe-supported country, with
Israel explicitly on the payout list. The rejection is still correct on the *outcome*, but
for a different and more honest reason: not a closed door, an **invisible shelf**. The
supervisor should fix the stated reason so the colony does not later "discover" the door is
open and re-open a line whose real problem is discovery.

## What sells (from the catalogue, low confidence)
Recurring commercially-successful shapes: asset/content injectors (Iconify, Content Reel,
Blush), diagram/annotation automation (Autoflow), charts, design-system linting (Design
Lint), token sync (Figma Tokens), and code/handoff bridges (the well-known freemium
external-billing tier: Anima, Locofy, html.to.design). The external-billing freemium
handoff tools are the ones with real MRR, and they are venture-funded companies, not
40-hour builds.

## Unserved gap actually identified: Hebrew / RTL
No Hebrew or RTL-specific plugin surfaced in any search or in the awesome list. A plugin
that (a) mirrors a frame's layout LTR→RTL, (b) fills Hebrew lorem-ipsum and realistic
Israeli sample data (names, addresses, 05x phone formats, valid-checksum test ת.ז. numbers
for QA fixtures only), and (c) checks Hebrew font fallback, is a genuine hole. It is also
the one gap where this colony has an unfair advantage (Hebrew, Israeli data, an existing
Paddle rail). But the buyer pool is Israeli product designers — small — and the discovery
problem applies to it exactly as it does to everything else.
**No search evidence of demand was found for this. It is a gap by absence, which is weak
evidence: absence of a plugin can mean absence of a need.**

## Dead ends
- Paid Community **files** (UI kits, templates): closed to new creators. NO.
- Figma **native** paid plugin as a growth line: mechanism works and pays Israel, but the
  Community has no newest/editorial surface, so a no-brand listing is invisible. Ceiling is
  near zero without external distribution the owner cannot do (no talking, no marketing
  persona).
- Enterprise/private org plugins built to spec: this is consulting. Requires the owner to
  talk to buyers. Excluded by MISSION.md, not by the platform.
- `forum.figma.com` and `help.figma.com` are both blocked: no primary Figma source could be
  rendered this session by any route, GitHub included.

## Owner blockers (one-time, human, legally required — do not assume done)
1. Create/verify a Figma account and apply for approved-creator status (form location
   unverified — behind blocked help.figma.com).
2. Activate a **Stripe** account by email invite: Israeli identity document, Israeli bank
   account, tax details. Standard Stripe KYC. One-time.
3. Nothing else. No camera, no calls, no selling.
