# Scout notes — `plugin-ecosystems / obsidian-raycast`

**Criterion:** Obsidian plugins, Raycast extensions, Alfred workflows: monetization reality,
licensing patterns, and audience size.
**Date:** 2026-09-04. **Search budget spent: 8 / 8** (cap respected; stopped after the eighth).
**Model:** Opus 5, worker-scout tier.

---

## 1. Evidence ledger — what was actually rendered vs. what is only a snippet

### STRONG — rendered primary source (platform's own docs repo, no search budget)

| # | URL | What it proves |
|---|---|---|
| E1 | `https://raw.githubusercontent.com/obsidianmd/obsidian-developer-docs/main/en/Community%20directory/Developer%20policies.md` | Obsidian **explicitly permits paid plugins**. Under required README disclosures: *"Payment is required for full access."* and *"An account is required for full access."* Also permits **in-app static ads** *"within the plugin's own interface"*, and **closed source** — *"This will be handled on a case by case basis."* Bans: obfuscation, dynamic (network-loaded) ads, static ads outside the plugin's own UI, **client-side telemetry**, self-updating code/dependencies. Server telemetry allowed only with a linked privacy policy. Requires a LICENSE file. |
| E2 | `https://raw.githubusercontent.com/obsidianmd/obsidian-developer-docs/main/en/Community%20directory/Frequently%20asked%20questions.md` | The directory has a **payment-type taxonomy**: **Free** (*"there are no payments whatsoever"*), **Optional payment** (*"you rely on a third-party service that requires payment, or if you lock certain features behind payment"*), **Paid** (*"your plugin or theme is accessible by payment only"*). Also: a free alternative alongside a paid service does **not** count as Free; a time-limited trial counts as **Paid**. |
| E3 | `https://raw.githubusercontent.com/obsidianmd/obsidian-developer-docs/main/en/Community%20directory/Manage%20your%20plugin%20or%20theme.md` (via `search_code`) | Payment type is a **first-class listing field** the developer edits in the directory alongside icon, descriptions, categories, screenshots. Screenshot spec: up to 5 desktop 1200×800 + 5 mobile 900×1600, JPEG/PNG/WebP ≤5 MB. |
| E4 | `https://raw.githubusercontent.com/obsidianmd/obsidian-developer-docs/main/en/Community%20directory/Submission%20requirements%20for%20plugins.md` | *"Use `fundingUrl` if you accept financial support for your plugin, using services like Buy Me A Coffee or GitHub Sponsors."* — `fundingUrl` is scoped to **donations**, not a checkout link. Description ≤250 chars, ends with a period, no emoji. `isDesktopOnly: true` required if Node/Electron APIs are used. |
| E5 | `https://raw.githubusercontent.com/obsidianmd/obsidian-developer-docs/main/en/Reference/Manifest.md` (via `search_code`) | `fundingUrl` is `string` **or object** (multiple URLs), optional. |
| E6 | `https://raw.githubusercontent.com/obsidianmd/obsidian-developer-docs/main/en/Community%20directory/Set%20up%20and%20claim.md` (via `search_code`) | Listing requires signing in, **agreeing to the Developer policies**, and confirming *"that you'll continue to support your plugin or theme, or remove or transfer it if you can no longer provide support."* → a **standing support obligation**, relevant to MISSION (the owner does no manual ops; support must be answerable by software or the listing must be withdrawn). |
| E7 | `https://raw.githubusercontent.com/raycast/extensions/main/docs/basics/prepare-an-extension-for-store.md` | Raycast Store submission: *"Ensure you use `MIT` in the `license` field"* of `package.json`. Also *"Please check the terms of service of third-party services that your extension uses"*; binaries must not be downloaded/executed opaquely; Keychain Access is rejected. **No monetization, paid-extension, or subscription mechanism appears anywhere in the store docs.** |
| E8 | `https://raw.githubusercontent.com/raycast/extensions/main/docs/information/manifest.md` and `docs/information/lifecycle/arguments.md` (via `search_code`) | The manifest examples all carry `"license": "MIT"`. Confirms E7 is the norm, not an aside. |
| E9 | `https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json` (rendered GitHub blob page) | GitHub refuses to render it: **"2.04 MB"**, *"we can't show files that are this big right now."* Corroborates a directory in the thousands of plugins. |
| E10 | `https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json` | Real per-plugin download counts exist publicly. Fetched, but **the summariser saw only a truncated slice** — treat any "top plugins" ranking from it as unreliable. Individual numbers seen in the slice (e.g. `obsidian-admonition` ≈ 961,843; `obsidian-advanced-slides` ≈ 835,703) are plausible but **not** independently confirmed. Do not quote a ranking from this fetch. |

### WEAK — search snippet only (must be closed by opening the URL)

| # | Claim | Source snippet | URL a human/unblocked agent must open |
|---|---|---|---|
| S1 | Obsidian community directory holds **7,233 plugins and 728 themes**; **plugins passed 120 million total downloads**, announced **May 2026**. | WebSearch result summarising Obsidian's own blog post. | `https://obsidian.md/blog/future-of-plugins/` — **EGRESS_BLOCKED** here. |
| S2 | **Copilot Plus** (Obsidian plugin) sells at **$14.99/mo**, **$139.99/yr** (~$11.67/mo), plus a **$349.99 lifetime** self-host supporter tier, 14-day refund. | WebSearch snippet of obsidiancopilot.com pricing. | `https://www.obsidiancopilot.com/en/pricing` |
| S3 | **Copilot Personal** has a free tier and a **Pro tier at $4.99/mo billed via Lemon Squeezy**. | WebSearch snippet of the community.obsidian.md listing. | `https://community.obsidian.md/plugins/copilot-personal` — **EGRESS_BLOCKED**. |
| S4 | At least one developer ships a **paid Obsidian plugin listed in the community directory, sold via Gumroad, with fully offline license validation and no server**. | Indie Hackers post title + snippet. | `https://www.indiehackers.com/post/i-shipped-a-paid-obsidian-plugin-with-no-server-no-subscription-and-offline-licensing-0a87e1f23c` |
| S5 | Raycast Store has on the order of **2,000 extensions**; Alfred Powerpack is a **one-time ~$34/£34** purchase. | Third-party comparison article. | `https://www.raycast.com/store`, `https://www.alfredapp.com/shop/` |
| S6 | **Packal** (Alfred workflow directory) requires listed workflows to be **freely available**. | Alfred forum snippet. | `https://www.alfredforum.com/topic/10039-is-it-possible-to-monetize-alfred-workflows/` |
| S7 | Alfred Gallery entry is **invite-based**: *"Once a workflow is determined to be generally stable and trusted by a number of users, the Alfred team may invite you to submit it officially."* | WebSearch snippet of alfred.app/submit. | `https://alfred.app/submit/` |
| S8 | Lemon Squeezy fee **5% + $0.50**, merchant of record. | Third-party comparison blog. | `https://docs.lemonsqueezy.com/help/licensing/generating-license-keys` |

### CONTRADICTED — a snippet I am rejecting

A 2026 SEO blog aggregate asserted *"There is no paid subscription model for accessing individual
plugins… all 1,600+ community plugins remain free."* **This is false** and is refuted by E1/E2/E3
from Obsidian's own documentation repository, and by S2/S3. Recorded so the colony does not
re-derive it.

### Blocked hosts (confirmed this session, do not retry)

`obsidian.md`, `community.obsidian.md`, `www.obsidianstats.com`, `manual.raycast.com`.

---

## 2. Monetization reality, per platform

### Obsidian — the only one of the three with a sanctioned paid-plugin path

- Payment is **entirely off-platform**. Obsidian takes **no cut**, provides **no checkout**, and
  **no license infrastructure**. It supplies a *listing label* (Free / Optional payment / Paid) and
  a *permission* (E1, E2). The developer brings their own rail.
- Therefore **payability to Israel is decided by the seller's own rail, not by Obsidian** — which is
  the single most important structural fact in this criterion. This repo already has two
  Israel-payable rails: **Paddle** (shipped in `products/il-biz-tools`) and **Gumroad**, whose
  Israeli ILS bank payout was verified at code level by the `storefronts` audit
  (`docs/REJECTED.md` ≈ line 612, Gumroad's own `_13-getting-paid.html.erb` listing `Israel | ILS`).
- **Acquisition channel (MISSION constraint 7):** the community directory itself. Unlike Gumroad
  Discover — which `docs/REJECTED.md` proves is gated on `sale_made` and so **cannot** produce a
  first sale — the Obsidian directory lists a plugin from day one with no prior-sale gate. That is
  the cleanest un-gated platform-search channel this sweep has found for a paid product. It is
  still crowded (S1: ~7,233 plugins).
- **Constraints that shape the build:** no client-side telemetry (E1) → you cannot instrument
  activation locally; no self-updating code (E1) → the licence check must ship in the release;
  obfuscation banned (E1) → your licence check is readable, so use **signed offline keys**
  (Ed25519 verify), not secrecy; closed source is case-by-case (E1) → assume the source is public
  and design accordingly (S4 confirms someone shipped exactly this shape).
- **Two proven money models coexist:** one-time offline licence (S4) and monthly server-backed
  subscription (S2, S3 — $4.99–$14.99/mo). The subscription tier is where the real money in this
  ecosystem visibly is, and it is also where the COGS and the support load are.

### Raycast — REJECTED as a revenue line; confirms `docs/REJECTED.md` with primary evidence

`docs/REJECTED.md` already lists *"Raycast (no payment mechanism)"*. **E7/E8 upgrade that from an
assertion to a rendered clause:** the store requires `"license": "MIT"` in `package.json`. An
MIT-licensed extension cannot be sold — anyone may redistribute it. There is no billing API, no
paid-listing type, and no revenue share anywhere in `raycast/extensions/docs`. Raycast's own money
(Pro plans, private extensions for teams) is Raycast's, not a developer's.
The only legitimate shape left is **a free MIT extension acting as a client to a paid service you
own** — that is a *distribution channel*, not a monetization mechanism, and it is worth listing only
because this colony already operates paid APIs (`products/x402-il-api`, `products/apify-il-open-data`).

### Alfred — the weakest of the three

- Alfred's own money is the **Powerpack** (one-time, ~$34, S5), which is a prerequisite for workflows
  at all → the addressable audience is *paying Alfred users only*, i.e. a paid subset of a macOS-only
  subset. Smallest audience of the three by construction.
- There is **no first-party workflow store with payments**. **Packal requires free** (S6). The
  **Alfred Gallery is invite-based and gated on prior community traction** (S7) — *"trusted by a
  number of users"*, which in practice means forum presence.
- That gate collides with two binding rules here: MISSION (the owner does not talk to people) and
  `docs/REJECTED.md` constraint 3 (anything amounting to posting in a community is closed to us).
  A software-only operation cannot earn a Gallery invite. So an Alfred workflow has **no discovery
  channel we may use** — sale would have to be direct, to an audience we have no way to reach.

---

## 3. Audience size — what is and is not known

- Obsidian: **~7,233 plugins, 728 themes, 120M cumulative plugin downloads (May 2026)** — S1,
  snippet-only, blocked page. Corroborated indirectly by E9 (2.04 MB `community-plugins.json`).
  Per-plugin download counts are **public and machine-readable** (E10) — that is a real, free,
  zero-search-budget way to size any niche before building, and the colony should use it.
- Raycast: ~2,000 extensions (S5, weak). Extension install counts are shown on the store but the
  store is not reachable from here.
- Alfred: no figure found. Powerpack sales are not published. Audience = paying macOS Alfred users;
  no public number exists.

**Themes are the least crowded shelf**: 728 vs 7,233 (S1), and the payment taxonomy in E2/E3
applies to *"your plugin or theme"* verbatim — a paid theme is explicitly contemplated.

---

## 4. Owner blockers (only what a platform legally requires of a human)

- Obsidian community directory: a GitHub account and an Obsidian account, sign-in, and **agreeing to
  the Developer policies** (E6). Account creation, not KYC. Also a **standing support commitment**
  (E6) — not a legal blocker but a MISSION-relevant obligation.
- Payment rail: whichever of Paddle / Gumroad is used carries the usual one-time identity + bank
  details step. **Paddle's is already done** for `products/il-biz-tools`; nothing new is required if
  the plugin bills through the existing Paddle account. Gumroad's Israeli payout would be a new
  one-time bank/identity step.
- **No extra blockers invented.** No W-8BEN is asserted here (the `storefronts` audit flagged that
  exact fabrication). No video call, no phone number, no camera step is known to be required by any
  of the three platforms.

---

## 5. Dead ends, recorded so nobody re-searches them

1. **Raycast Store as a place to sell anything** — MIT licence is mandatory (E7/E8); no billing
   mechanism exists in the docs. Dead, now with primary evidence.
2. **Alfred Gallery / Packal as an acquisition channel** — invite gated on community traction (S7);
   Packal requires free (S6). Both closed to a software-only operation.
3. **Obsidian Sync / Publish / Catalyst revenue** — Obsidian's own products; no third-party share.
4. **`fundingUrl` as a checkout** — E4 scopes it to donations (Buy Me A Coffee, GitHub Sponsors).
   Donations are not a revenue line; the `storefronts` audit already killed Ko-fi for supplying no
   buyers.
5. **Four hosts are egress-blocked** — obsidian.md, community.obsidian.md, obsidianstats.com,
   manual.raycast.com. Every headline audience number for this criterion lives behind them, which is
   why S1/S5 stay snippet-grade.
6. **`community-plugin-stats.json` via WebFetch summarisation** — truncates and produced an
   unreliable "top plugins" ranking. Parse it with code, not with a summariser.
