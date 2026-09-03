# Scout notes — agent-markets / skill-marketplaces

Date: 2026-09-03. Scout: WORKER-SCOUT "skill-marketplaces", agent-markets group.

**Criterion:** Claude skills/plugin marketplaces, awesome-lists and agent-tool directories as
distribution — do they convert to money, to users, or to nothing?

## Budget actually spent
- WebSearch: **5 of the 8 allowed** (cap respected; no search was refused).
- WebFetch: 10 attempts. Rendered: raw.githubusercontent.com, code.claude.com,
  registry.npmjs.org. Blocked/404: api.github.com (403), two guessed raw paths (404).
- GitHub MCP: 4 free calls (repo search x2, code search x2). `get_file_contents` is restricted
  to this session's own repo, so external repo files were read via raw.githubusercontent.com.

## Evidence grade key
- **[RENDERED]** — I fetched the page/API myself and read the text. Strong.
- **[SNIPPET]** — a search-result summary quoting a page I could not open. Weak; URL given.
- **[COUNT]** — a number I derived from a rendered API/search response.

---

## 1. The single most important fact: there is no payment rail inside the Claude plugin system

[RENDERED] https://code.claude.com/docs/en/discover-plugins (fetched 2026-09-03) and
[RENDERED] https://code.claude.com/docs/en/plugins (fetched 2026-09-03).

Both pages describe the entire plugin lifecycle — marketplace = a git repo with
`.claude-plugin/marketplace.json`; install = `/plugin install name@marketplace`; sources = GitHub,
any git URL, local path, remote JSON URL. **Nowhere in either page is there a price, a purchase,
a licence check, a billing field, a revenue share or a payout.** The only "cost" the UI shows is a
*context cost* estimate in tokens.

Submission to the community marketplace, quoted from the rendered docs:

> "To submit your plugin for community-marketplace review, use one of the in-app forms:
> **claude.ai**: claude.ai/admin-settings/directory/submissions/plugins/new
> **Console**: platform.claude.com/plugins/submit
> The claude.ai form requires a Team or Enterprise organization and directory management access…
> Individual authors who aren't part of a Team or Enterprise organization can use the Console form
> instead."

and

> "Approved plugins are pinned to a specific commit SHA in the anthropics/claude-plugins-community
> catalog, and CI bumps the pin automatically as you push new commits to your repository. The
> public catalog syncs nightly…"

and

> "The official marketplace, claude-plugins-official, is curated separately. Anthropic decides
> which plugins to include at its discretion. There is no application process."

**Consequence:** you cannot sell a plugin *in* the marketplace. Any money must be charged outside
it — by the plugin calling a paid API you own, or by a licence key. The marketplace is a
**distribution channel, not a store**.

## 2. The official community catalogue is 500+ plugins and is used by vendors as a funnel

[RENDERED/COUNT]
https://raw.githubusercontent.com/anthropics/claude-plugins-community/main/.claude-plugin/marketplace.json
— 500+ plugin entries. Sample entries read from the file: `0x` (0xProject), `10x-shopping`
(qressy), `sap-dev-core` (sapdev-ai), `adobe-for-creativity` (**adobe/skills**), `agentiqa`.

[RENDERED] https://raw.githubusercontent.com/anthropics/claude-plugins-community/main/README.md —
read-only mirror, nightly sync, PRs against the repo auto-closed, submissions only via
clau.de/plugin-directory-submission, automated security scanning. **No paid-plugin policy, no
revenue share, no pricing, no install statistics of any kind.**

[RENDERED] The *official* marketplace (from the docs page above) is dominated by
**vendor integrations**: `github`, `gitlab`, `atlassian`, `asana`, `linear`, `notion`, `figma`,
`vercel`, `firebase`, `supabase`, `slack`, `sentry`. Every one of these is a company whose
plugin is free and whose **product is paid elsewhere**. That is the only monetization pattern
that is visibly working at scale in this channel: *the plugin is an acquisition channel for a
paid service the author already runs.*

## 3. Supply is enormous; nobody is charging

[COUNT] GitHub repo search `claude-code-plugin-marketplace in:name,description` (2026-09-03):
**total_count = 4,104**. Top repos by stars, all read from the search response:
- OthmanAdi/planning-with-files — **26,611 stars**
- wshobson/agents — **39,385 stars**
- davepoon/buildwithclaude — 3,407 stars
- anthropics/claude-plugins-community — 3,339 stars
- jeremylongshore/tons-of-skills-marketplace — 2,695 stars
- obra/superpowers-marketplace — 1,244 stars; fivetaku/gptaku_plugins — 1,105;
  numman-ali/n-skills — 1,042; microsoft/power-platform-skills — 811;
  quant-sentiment-ai/claude-equity-research — 710; ananddtyagi/cc-marketplace — 688;
  Piebald-AI/claude-code-lsps — 515; trailofbits/skills-curated — 496.

Monetization actually present in the biggest ones, checked file by file:
- [RENDERED] https://raw.githubusercontent.com/OthmanAdi/planning-with-files/master/README.md —
  26.6k stars, MIT, **no paid product, no sponsor link, no pro tier, no hosted service**. Badges
  for "Skills Playground installs" and download history, but no numbers in the text.
- [RENDERED] https://raw.githubusercontent.com/wshobson/agents/main/.github/FUNDING.yml —
  entire file is `github: wshobson`. 39k stars → **a GitHub Sponsors button and nothing else.**
- [RENDERED] https://raw.githubusercontent.com/davepoon/buildwithclaude/main/README.md — 3.4k
  stars, "Made with ❤️ by Dave Poon", MIT. **No sponsorship, paid listing, pro tier, ads,
  submission fee, or usage statistics.**
- [RENDERED] https://raw.githubusercontent.com/jeremylongshore/tons-of-skills-marketplace/main/README.md
  — self-reported **637 downloads in the last 24 hours across 393 packages**; monetization is a
  buymeacoffee badge, a Ko-fi button and one sponsor badge (Kobiton). No paid tier, no revenue.

## 4. Stars do not convert into installs, let alone money — a measured number

[RENDERED/COUNT] https://registry.npmjs.org/-/v1/search?text=planning-with-files&size=3 (fetched
2026-09-03): `planning-with-files` = **1,323 downloads/month (391/week)**; the two `pi-*` forks
= 106 and 47/month.

So the **most-starred skill repository in the ecosystem (26,611 stars) pulls ~1.3k npm installs a
month.** Caveat, stated honestly: the skill is also installable via the plugin marketplace and via
`npx skills`, so npm undercounts total installs by an unknown factor. Even so, the ratio between
attention (26.6k stars) and any measurable install stream is roughly 20:1 *against* — and the
install stream itself carries **zero revenue**, because there is nothing to pay for.

## 5. Third-party *paid* skill stores exist, but only as snippets and with no proof of buyers

[SNIPPET] WebSearch 2026-09-03, "Anthropic paid skills marketplace monetization…":
- **Agensi** — "a curated marketplace with a 30% platform fee where creators keep 70%… 8-point
  security scan before listing and pays out through Stripe Connect."
- **Claude Protocol** — skills "from $3.99 each". **KissMySkills** — "$14.99 for most skills".
[SNIPPET] WebSearch 2026-09-03, "Agensi … 70% Stripe Connect": agensi.io's own pages contradict
themselves — one page says creators keep 80%, several others say 70%.

URLs a human or unblocked agent must open to close this:
https://www.agensi.io/learn/how-agensi-payouts-work-stripe-connect ,
https://www.agensi.io/ , https://kissmyskills.com/blogs/news/best-claude-skills-marketplaces-2026 ,
https://www.agent37.com/blog/claude-skills-marketplace .

**I could not find a single verifiable earnings figure from any of these.** A direct search for
developer earnings returned nothing: [SNIPPET] WebSearch 2026-09-03 — "I was unable to find
specific real numbers showing individual developer earnings from the Claude Code plugin
marketplace… they don't contain public case studies or specific earnings figures." All four sites
above are themselves SEO-shaped content properties writing about their own market; treat every
number from them as marketing until a rendered page or a transaction proves otherwise.

## 6. Smithery / hosted registries — contradictory, and covered by the sibling scout

[SNIPPET] WebSearch 2026-09-03: "MCP creators can join earning an 80% revenue share. However,
Smithery creators pay $30/mo and earn $0 MCP server income according to another source." Founded
Dec 2024 by Henry Mao, backed by South Park Commons; "over 7,000 servers". smithery.ai is
egress-blocked here. This overlaps
`research/colony-sweep/scouts/agent-markets--mcp-registries.md`, which independently found no
revenue share anywhere in the official MCP registry. I did not spend further budget on it.

## 7. Where money *does* change hands in directories: the listing fee, paid by tool vendors

[SNIPPET] WebSearch 2026-09-03, "AI tool directory paid listing submission fee…":
- Stork.AI **$49 once**; AIListingTool **$29 / $79 / $99** tiers; SimplifyAITools **$25**;
  ToolFinder from **$39**; **TAAFT $347**; Smol Launch **$19** premium;
  Toolify.ai sponsored/featured "a few hundred up to a few thousand dollars per month".
- Same snippet, and worth quoting because it is the warning label: "several free tiers reveal
  their real terms only after submission — a months-long queue with a paid skip option."

URLs to close: https://www.stork.ai/where-to-submit-your-ai-tool ,
https://wheretosubmit.org/guides/toolify-submission-guide .

So the cash flow in this ecosystem runs **from tool builders to directory owners**, not the other
way. Being listed costs money; running the list collects it. Running a listing site with no
audience and charging $25-$347 for placement is selling attention we do not have — that is a
constitution problem (deceiving a buyer), not just a business-model problem.

## 8. Payability to Israel
- **GitHub Sponsors: YES.** [RENDERED] github/docs source file
  `content/sponsors/getting-started-with-github-sponsors/about-github-sponsors.md`, section
  "Supported regions for GitHub Sponsors", contains `<li>Israel</li>` (GitHub code search,
  2026-09-03). Strong evidence; the payout itself still requires a one-time identity/bank setup.
- **Anthropic marketplaces: not applicable** — there is nothing to be paid, for anyone, anywhere.
- **Agensi/Stripe Connect: UNKNOWN.** Our own `payment-rails--stripe-alternatives.md` scout
  recorded that sources conflict over whether Israel is a supported Stripe *merchant* country.
  Unresolved; do not assume.
- **Our own rails: YES** — Paddle, Telegram Stars, Apify and x402 are already shipped and already
  pay us, which is exactly why the funnel play (finding 1) is the only one worth building.

## Owner blockers found
- Community-marketplace submission is a **web form** (platform.claude.com/plugins/submit for an
  individual author). One form per plugin, under the owner's existing Claude account. Whether an
  agent can drive it is unverified; assume it may need one human click. Nothing else — no KYC,
  no fee, no contract.
- GitHub Sponsors, if ever enabled, needs a one-time identity + bank verification by the human.

## Dead ends (do not re-search these)
1. **Building another Claude plugin marketplace / skills directory.** 4,104 repos already;
   the biggest have five-figure stars and zero revenue. Confirmed dead.
2. **Expecting stars or list inclusion to produce money.** 26.6k stars → 1.3k npm/month → ₪0.
3. **An Anthropic-run payments/revenue-share program for skills.** Nothing in the rendered docs,
   the community repo, or search results. It does not exist as of 2026-09-03.
4. **Selling listings in a directory we run.** Prices are real ($25-$347) but the buyer pays for
   audience; a no-brand new list has none. AMBER on the constitution.

## Bottom line for the colony
The answer to the criterion is: **these channels convert to users, weakly, and to money, not at
all — unless the money is charged somewhere else.** The one shape that works is the one Vercel,
Supabase, Sentry and Adobe are using in the official marketplace right now: ship a free plugin
that is genuinely useful on its own and whose deeper function calls a paid service you already
operate. We already operate four. That is a ~1-2 day integration task on top of existing
products, not a new income line, and it should be judged as marketing spend with a real but small
expected return — not as a revenue source.

## Every URL used
- https://code.claude.com/docs/en/discover-plugins [RENDERED]
- https://code.claude.com/docs/en/plugins [RENDERED]
- https://raw.githubusercontent.com/anthropics/claude-plugins-community/main/.claude-plugin/marketplace.json [RENDERED]
- https://raw.githubusercontent.com/anthropics/claude-plugins-community/main/README.md [RENDERED]
- https://raw.githubusercontent.com/OthmanAdi/planning-with-files/master/README.md [RENDERED]
- https://raw.githubusercontent.com/wshobson/agents/main/.github/FUNDING.yml [RENDERED]
- https://raw.githubusercontent.com/wshobson/agents/main/README.md [RENDERED]
- https://raw.githubusercontent.com/davepoon/buildwithclaude/main/README.md [RENDERED]
- https://raw.githubusercontent.com/jeremylongshore/tons-of-skills-marketplace/main/README.md [RENDERED]
- https://registry.npmjs.org/-/v1/search?text=planning-with-files&size=3 [RENDERED]
- github/docs `content/sponsors/getting-started-with-github-sponsors/about-github-sponsors.md` [RENDERED via GitHub code search]
- https://github.com/anthropics/claude-plugins-community [RENDERED metadata via GitHub repo search]
- https://www.agensi.io/ and /learn/* [SNIPPET only — blocked]
- https://kissmyskills.com/blogs/news/best-claude-skills-marketplaces-2026 [SNIPPET only]
- https://www.agent37.com/blog/claude-skills-marketplace , /blog/monetize-claude-code-skills [SNIPPET only]
- https://www.stork.ai/where-to-submit-your-ai-tool [SNIPPET only]
- https://wheretosubmit.org/guides/toolify-submission-guide [SNIPPET only]
- https://mcpize.com/developers/monetize-mcp-servers , https://www.truefoundry.com/blog/best-mcp-registries [SNIPPET only]
- https://api.github.com/repos/anthropics/claude-plugins-community/contents/ [403 — failed]
