# Measurement: Wavedash (browser games, CLI) — REPLENISH row 7

**Status (28.9.2026): UNSETTLED, leaning DEAD.** No gate FAILs on this capture, and neither G3 nor G5 passes. G3 is now
U↘: the CLI can create a team and a game, push a build and publish it. But publishing is blocked until the store page is
complete, and the docs place the store page only in the Developer Portal, once per game. G2 is also U↘: payouts go through
Stripe Connect, and the repo's own Stripe reading says Connect cross-border payouts exclude Israel. G5 is still UNKNOWN, with no
player figure anywhere. There is ad-free money: Paid Content (IAP), Donations, and a playtime-share Creator Fund.
**Ordered by:** `research/breadth/REPLENISH-2026-09-28.md:80` (row 7) and `:326` (§5: "payout rail and countries, creator fund,
content rules").
**Grades:** [RENDERED] means quoted from the capture, with the line number checked by `grep -n -F`. [INFERENCE] means reasoned from
rendered text or another repo file, and says so. UNKNOWN means the capture is silent. Nothing here comes from general knowledge.

## Source
`research/rendered/wavedash-llms-full.txt` (12,574 lines). The `.meta.json` gives the URL `https://docs.wavedash.com/llms-full.txt`,
status 200, `fetchedAt` `2026-09-28T17:19:58.514Z`, 468,363 bytes, `truncated` false, and sha256 `21e1fd68…eb77f1`. I read these sections in full: intro,
quickstart publish step, glossary (353-409), publishing (4512-4880), CLI auth and config (4983-5150), CLI commands (5348-5690),
HTTP API (5691-5865), agents (5886-5925), MCP (12414-12472) and skills (12490-12574). I grepped the rest for the brief's keywords.
The capture has 0 hits for `countr`, `KYC`, `W-8`, `PayPal`, `revenue share`, `Terms`, `YC`, `beta`, `million` and `MAU`.

## Gates
**G1 — PASS [RENDERED].** `:75` "Wavedash is free for players and free for developers." The only charge is a per-sale cut:
`:4616` "Wavedash takes **10% plus a $0.50 flat fee** on each Paid Content purchase and each donation." `:4655` "Opting in is free
and can't be undone." (Creator Fund). One loose end: `:396` says teams "Manage members, billing, and payouts". What "billing" refers
to is not explained, and no paid tier appears anywhere in the capture.

**G2 — U↘ (leans FAIL) [RENDERED rail; INFERENCE on Israel].** `:4620` "Payouts run through Stripe Connect and go out once a
month, on the 1st, to every team with a fully onboarded Stripe account and an available balance of at least $20." `:4622`
"Only the team owner can connect Stripe". `:4624` "You can sell Paid Content before connecting Stripe", so the owner's identity step can
wait until money exists. The capture names no countries, no identity documents and no camera step. Where Wavedash itself is based is UNKNOWN.
[INFERENCE] `research/measurements/stripe-israel.md:7` finds "Connect cross-border payouts still exclude Israel". `:5` of the same file
finds that Stripe Global Payouts does list Israel. Which Stripe product Wavedash pays through is UNKNOWN.

**G3 — U↘ (leans FAIL) [RENDERED].** The CLI covers the account and build steps. `:5369` `wavedash team create --name "My
Studio"`. `:5389` `wavedash project create --title "My Game" --team-id <TEAM_ID>`. `wavedash build push` uploads a build, and `:4766` says
`publish` "exits without publishing unless you pass `-y`" in CI. The store page is the blocker. `:4731` "Publishing is blocked
until the store page has everything a live game needs:" The list is 80+ characters of description, cover art, a preview video, a tag, an input method
and a language. Then `:4738` "Set these under **Metadata** in the Developer Portal. The same check runs for the Publish button and for
`wavedash publish`." `:4548` "You edit it in the Developer Portal under your game's settings". The command reference at `:5350` covers "wavedash dev, build push, publish,
team/project, stats, achievements", and has no metadata command. The API documents only leaderboards: `:5753` "Builds, stats, and
achievements are managed through the [CLI](/cli/commands)." Paid Content offers are also portal-only: `:3861` "You define the locked files, price, and
paywall appearance in the Developer Portal". So each game needs a portal session before it can go live. By
`research/channel-loop/BOARD-LOOP.md:183` ("a per-game human step") that is a kill, unless an undocumented route exists. It stays U↘
and not F because the evidence is a documentation absence. The hosted MCP server does not help: `:12457-12458` "It cannot sign in, create projects, create API
keys, upload builds, publish builds, or read local files."

**G4 — PASS (weak) [RENDERED].** The content guidelines (`:4827-4880`) contain no AI rule. The docs invite agents: `:5890` "A coding agent
can build a Wavedash game from scratch". The rules that bind a build are `:4835` "Your game must not integrate cryptocurrency or blockchain features",
`:4841` "Your game must not impersonate other games", `:4843` "Your game must include free gameplay before triggering a paywall"
and `:4861` "Your game's title must be primarily in Latin script". The last one means Hebrew titles must be transliterated, which "Mehudak" already is.
No AI-declaration field appears. The developer terms are not in this capture, so this PASS covers the captured rules only.

**G5 — UNKNOWN [RENDERED absence].** No player, traffic or session figure appears, and the Creator Fund pool size is not given. The venue does
run its own discovery. `:4785` "New games also appear in the browse feed, below approved games, until Wavedash reviews them. Approved games join
the main section and start appearing in "More like this" recommendations." `:4570` "These are how players discover you through
browsing and search."

**G6 — PASS [RENDERED].** One API key covers every game. `:5781` "A key acts as you: it can reach every game in every team you belong
to" ("There's no per-game or read-only key today", same line). `project create` adds games under one team from the CLI. G6
does not rescue G3: the per-game store-page step remains.

**G7 — UNKNOWN [RENDERED + INFERENCE].** A team can carry the brand, via `:5369` `team create --name`. Whether the store page shows the
team name, the owner's username or anything else is not in the capture. [INFERENCE] Players buy on a "Wavedash-rendered paywall" (`:4588`), so the merchant
buyers see is probably Wavedash. The team owner's own name reaches only Stripe.

## Ad-free money a free browser game could earn [RENDERED]
- **Creator Fund.** `:4638` "The Creator Fund is a monthly pool that Wavedash distributes to developers based on how much players play their games."
  `:4644` "Your game's share of the pool is proportional to its share of that total playtime". There is no marketplace fee, and
  `:4650` says the first-publish dialog opt-in is "switched on by default". `:4646` "Playtime by members of your own team is excluded, and
  Wavedash reviews each month's report before it's paid." The pool size is UNKNOWN. So is whether a CLI-only first publish enrolls a game.
- **Paid Content**, one-time IAP: `:4608` "Set the **price** in USD, from $0.99 to $99.99". Set in the portal, per offer.
- **Donations**: `:4580` "turning on **Donations** in the same Monetization tab". [INFERENCE] With a $0.50 flat fee, a $1 donation loses 60%.
- **No ad inventory.** The only hit for "ads" is a GameMaker note (`:8831` "If your project includes Google Mobile Ads") telling
  developers to strip them. An ad-funded build still earns ₪0 here.

## UNKNOWNs
Payout countries, and whether an Israeli individual can be onboarded (Connect or Global Payouts); Stripe's identity or camera steps;
Wavedash's legal seat and developer terms (not linked in the capture); any player or traffic figure; the Creator Fund pool size;
whether the store page shows a team name; any undocumented metadata endpoint; whether CLI publishing sets the Creator Fund default.

## Single most decisive next check
**`wavedash-cli` → https://github.com/wvdsh/cli** (cited at `:4887`, `<GithubLink href="https://github.com/wvdsh/cli" label="View
the CLI tool on GitHub" />`). The HTTP API is "the same API the [CLI](/cli) uses" (`:5695`). Search its source for any call that
writes store-page metadata: description, cover art, preview video, tags, input methods or languages.
- If none exists, G3 turns FAIL under the per-game rule, and the row is **DEAD**.
- If one exists, G3 turns PASS and the row becomes **QUEUE**, provided G2 does not fail. G2 is then the next test, and this capture names no URL for it.

A render-watch capture of the repository root would show only the README, so the search has to run on the source itself. GitHub is reachable from this container,
and a source read is graded (g).
