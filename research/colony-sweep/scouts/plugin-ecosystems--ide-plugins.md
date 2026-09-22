# Scout notes — plugin-ecosystems / ide-plugins

**Criterion:** VS Code Marketplace and JetBrains Marketplace: paid plugin mechanics, JetBrains
revenue share and payout countries, which paid plugins actually earn, and the review bar.

**Date of research:** 2026-09-04. **Scout model:** Opus 5. **WebSearch calls spent: 5 of 8 allowed.**

## Method note (evidence grades used below)

- **[R]** = rendered primary source. I fetched the file and read its text.
- **[S]** = search snippet only. Weaker; the underlying page was not rendered (usually because the
  host is egress-blocked). Every [S] claim names the URL a human must open to close it.
- Memory is not used as evidence anywhere in this file.

**Blocked hosts confirmed this session:** `plugins.jetbrains.com` (EGRESS_BLOCKED — this is where the
Developer Agreement, the Marketplace terms of use and every rendered doc page live),
`www.plugin-dev.com` (EGRESS_BLOCKED). `marketplace.visualstudio.com` was not attempted after those.
`raw.githubusercontent.com` and `github.com` render fine and cost no search budget.

**The route that carried this criterion:** JetBrains checks the *entire* Marketplace documentation
into a public repo — `JetBrains/marketplace-docs` — as Writerside `.topic` XML. So although
`plugins.jetbrains.com/docs/marketplace/*` is blocked, every one of those pages is readable verbatim
at `raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/...`. That is where almost all
the hard numbers below come from, at zero search cost. Same trick worked for VS Code via
`microsoft/vscode-docs`.

**A GitHub MCP limit worth recording:** `mcp__github__issue_read` / `get_file_contents` are scoped to
this repo only — reading `microsoft/vscode` issue 111800 through the MCP was refused. `WebFetch` on
the plain `github.com/microsoft/vscode/issues/111800` HTML page worked. `mcp__github__search_code`
*does* reach across all of GitHub and returns file content fragments, and it is the cheapest tool here.

---

## 1. JetBrains Marketplace — revenue share and fees [R]

Source: https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/revenue-sharing-and-fees.topic
(rendered 2026-09-04; repo last updated 2026-07-30)

- "The commission on each plugin purchase is set to **15%**, and it is deducted from the sale price
  before money is transferred to the plugin developer."
- Per the Developer Agreement, "the commission rate can be changed with one-month notice, but it can
  never be **more than 25%**." For high-revenue plugins JetBrains may negotiate a custom formula.
- A **reseller fee (5%)** appears in the worked example; reseller/partner commissions are "paid from
  JetBrains' commission, not by the plugin developer" — the developer's percentage stays constant.
- Taxes are computed on top of the price and are not part of the fee base.
- "We don't charge any additional fees pertaining to developing extensions or listing them on
  JetBrains Marketplace." No listing fee, no developer-program fee.

**15% is materially better than Apple/Google's 30% and better than Chrome Web Store's arrangement.**
That is the single most attractive fact in this criterion.

## 2. JetBrains payout mechanics — and the payout-country question [R for mechanics, UNKNOWN for countries]

Sources (both rendered 2026-09-04):
- https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/revenue-sharing-and-fees.topic
- https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/getting-paid.topic

Vendors are paid:
- **To the vendor's bank account** (not PayPal, not Payoneer, not a wallet).
- **In USD or EUR**, vendor's choice.
- **Up to 30 days after the end of the month.**
- **Only when the payout reaches $200 / €200**, except on 31 December each year, when whatever has
  accumulated is paid out regardless.
- **On a self-billing invoice issued by JetBrains** — the vendor does not issue an invoice.

Payment processing, accounting and sales-tax handling are JetBrains' job, using Avalara and Taxamo
[R: .../topics/paid-plugins-general-info/payment-processing.topic] — i.e. **JetBrains is effectively
merchant of record**, so the vendor never touches customer VAT/OSS. That removes the single ugliest
piece of selling software into the EU from Israel.

**Payout countries: I could not find a country list, allowed or excluded.** I searched the entire
marketplace-docs repo for "countries", "payout", "identity verification" and "Developer Agreement" —
the only country references are analytics dashboards and coupon targeting, not vendor eligibility
(`mcp__github__search_code`, 2026-09-04). The docs defer eligibility, tax and identity questions to
the Developer Agreement, which lives at a blocked host.

> **To close this, a human or an unblocked agent must open
> https://plugins.jetbrains.com/legal/developer-agreement and read the sections on vendor eligibility,
> restricted territories, withholding tax and identity verification.** Until then, Israel payability
> for Paid-via-JetBrains is **UNKNOWN**. What is *structurally* true from rendered docs: the payout
> instrument is an ordinary bank transfer in USD/EUR from a Czech company, with no wallet provider in
> the path — nothing in the mechanism itself excludes an Israeli bank account, and Israel is not under
> EU/Czech sanctions. But "nothing excludes it" is not evidence that it is supported, and this scout
> will not upgrade it to YES without the agreement text.

## 3. Two business models, and the one that sidesteps the payout question entirely [R]

Source: https://github.com/JetBrains/marketplace-docs — `topics/paid-plugins-general-info/business-models.topic`
(content fragment returned verbatim by `mcp__github__search_code`, 2026-09-04):

> "**Paid-via-JetBrains** (revenue sharing model) when the plugin is sold via JetBrains Marketplace"
> "**Paid-via-Vendor** (**no revenue sharing, third-party license keys**) when the plugin is sold via Vendor"

This is important and under-appreciated. JetBrains explicitly sanctions listing a plugin on its
Marketplace while selling the licence yourself, with **0% to JetBrains** and no JetBrains payout at
all. In that configuration payability to Israel is decided by *our* payment processor, not by
JetBrains — and this repo already runs a working Israeli rail (Paddle, in `products/il-biz-tools`).
It also removes the $200 payout floor and the vendor bank-account setup.

The trade: no JetBrains checkout in the IDE, no JetBrains-run trial/licence infrastructure, no
merchant-of-record VAT handling (that lands back on the vendor / on Paddle), and you lose the
30-day-trial machinery that the paid model gets for free.

Monetization models offered [R: `topics/marketplace-general/plugin-monetization.topic`]: **Freemium**
("some features free ... users evaluate paid features during a 30-day trial") and **Paid** (all
features paid, 30-day trial). Licence schemes [R: `topics/paid-plugins-general-info/license-types-and-schemes.topic`]:
monthly/annual subscription **with** fallback licence (Toolbox-style), subscription **without**
fallback, and — newer — **perpetual** one-time purchase. Commercial vs Personal vs Free licence types.
The docs state no minimum price.

Also rendered: **donations are permitted and JetBrains takes no cut of them**
[R: `topics/marketplace-general/best-practices-for-listing.topic`]: "JetBrains doesn't take or receive
any commission nor in any way process or participate in the transaction ... All related disputes,
including refund requests, chargebacks, and cancellations will be handled by the respective plugin
author and/or the respective third-party payment processing provider." JetBrains says it is "working
on making donation links prominent ... both on JetBrains Marketplace and in the IDE Plugin Manager."

## 4. The review bar (JetBrains) [R]

Sources (rendered 2026-09-04):
- .../topics/legal-agreements-policies/JetBrains-Marketplace-Approval-Guidelines.topic
- .../topics/understanding-plugin-security.topic

- **Every** new plugin *and every update* goes through "a verification and approval process performed
  by and at the sole discretion of the JetBrains Marketplace team" — automated checks **plus manual,
  one-by-one human review**, Plugin Verifier execution, and UI integration tests.
- Stated turnaround: JetBrains "doesn't guarantee the time frame" but expects to respond within
  **3–4 working days**.
- Hard rejection triggers found in the guidelines: default or JetBrains-lookalike logo; name longer
  than 30 characters, non-Latin, or containing "Plugin"/"IntelliJ"; placeholder change notes ("Add
  change notes here"); broken media links or non-English description; failing binary compatibility in
  Plugin Verifier; interfering with JetBrains product functionality; security or privacy problems;
  metadata that manipulates search results.
- Vendor must supply a **valid and functional website and email**, accept the Developer Agreement,
  supply an end-user EULA, and declare EEA trader status.
- The guidelines contain **no rule against AI-generated, trivial, or duplicate plugins** — unlike the
  Chrome Web Store. The bar is competence and honesty, not novelty.
- Security posture is candid: plugins "can read, modify, or delete any files" and JetBrains is "working
  on introducing additional automated security checks for plugin uploads in the future" — i.e. current
  automated scanning is limited and the manual reviewer is the real gate.

**Implication for a software-only operation:** the review is a per-release human gate with a 3–4 day
latency. That is compatible with an agent-run product, but it means "ship 20 plugins and see what
sticks" is not a strategy — every one of them is inspected by a person who can see it is thin.

## 5. Trader status — the piece that touches the owner personally [R]

Source: .../topics/legal-agreements-policies/trader-status.topic (rendered 2026-09-04)

Under EU Omnibus Directive 2019/2161, JetBrains "must ask every vendor on JetBrains Marketplace to
declare whether they are a professional trader or not". The declaration is **mandatory**. An
individual (not only a company) can be a vendor; a natural person is a *non*-trader only when acting
"outside his trade, business, craft or profession" — a hobby plugin with voluntary donations. Selling
a paid plugin is by definition acting as a trader.

And the consequence that matters here: "some of the information provided, such as your **name, email,
address, and phone number**, will be displayed to end-users."

**So a paid JetBrains plugin publishes the owner's name, postal address and phone number on the
listing page.** That is not a "the owner does nothing" problem — no ongoing labour is required — but
it is a disclosure the owner must consciously accept, and it should be catalogued as an owner
decision, not silently assumed. An Israeli company (ח.פ.) or registered business address would satisfy
it without exposing a home address, at the cost of company formation.

## 6. Discovery math — why a new paid plugin is structurally invisible [R]

Source: .../topics/marketplace-general/plugins-ranking.topic (rendered 2026-09-04)

Search ranking is: relevance score against id/name/description/tags/vendor → staff-pick coefficient →
**multiplied by `log10(1 + 5 * downloads_count)`** → **multiplied by `sqrt(rating)`**.

Read that literally. A plugin with 0 downloads has a downloads coefficient of `log10(1) = 0`, and a
plugin with no ratings gets `sqrt(0) = 0`. The ranking formula multiplies a new plugin's score toward
zero regardless of how relevant it is. The only unweighted surface is the "New plugins" category,
ranked purely by recency — a feed that scrolls away in days.

This is the strongest argument in the whole criterion *against* the JetBrains route as a cold start:
there is no organic discovery for a new listing. Any revenue has to be driven by traffic we bring
ourselves, which lands squarely on MISSION constraint 7 (name the acquisition channel first).

## 7. VS Code Marketplace — there is no commerce [R]

Sources (rendered 2026-09-04):
- https://raw.githubusercontent.com/microsoft/vscode-docs/main/api/working-with-extensions/publishing-extension.md
- https://github.com/microsoft/vscode/issues/111800

Microsoft's own publishing documentation contains **no** payment, monetization or licensing mechanism.
The only pricing-related sentence in the entire document is:

> "You can opt-in to show a pricing label on your extension's Marketplace page to indicate that it is
> `Free` or `Free Trial`."

Two labels. `Free` and `Free Trial`. There is no `Paid`, no checkout, no licence issuance, no payout.

Publisher requirements that *do* exist [R, same page]: a Microsoft account with Azure DevOps, a
Personal Access Token for publishing (**note: the docs state PATs are retired on 1 December 2026** —
anything we automate must use Microsoft Entra ID managed-identity publishing instead), a unique
publisher id, and — for the verified badge — **ownership of an eligible domain registered for at least
6 months plus extensions published for at least 6 months**. The verified-publisher badge is therefore
a 6-month clock, not a form.

`microsoft/vscode` issue **#111800, "Find a way to allow us to monetize the extensions"**, opened
3 December 2020 by Allan Oricil, assigned to Chris Dias, is **CLOSED** — with no monetization
mechanism shipped in its wake (rendered 2026-09-04). The issue body is itself a data point on the
economics: the author reports roughly **$99 in donations for 100+ hours of work** on an extension
gaining ~1,000 new monthly users in the Salesforce niche.

**Therefore: a VS Code extension is a distribution channel, not a store.** The only honest paid model
is free-or-trial listing on the Marketplace plus our own licence key checked by our own backend, with
payment taken by our own processor. For this repo that means Paddle, which is already a proven
Israeli-payable rail in `products/il-biz-tools` — so **payability to Israel is YES and already solved**,
which is the opposite of the JetBrains situation.

**The ToS gap I could not close.** Whether the *Visual Studio Marketplace Publisher Agreement* permits
selling licences for a Marketplace-listed extension is not answerable from anything I could render.
The `Free Trial` label strongly implies Microsoft contemplates it (a trial implies something to buy
afterwards), and Wallaby.js / Quokka.js / Console Ninja have shipped exactly this model for years
[S, see §8]. But implication is not permission.

> **To close this, open https://marketplace.visualstudio.com/items/publisheragreement (Visual Studio
> Marketplace Publisher Agreement) and read the sections on commercial terms and on offerings sold
> outside the Marketplace.** Until then this route is **AMBER**, and per the sweep rules AMBER is not
> a build recommendation.

**A misinformation warning for whoever reads this next.** My search for VS Code monetization returned
a confident summary asserting that "Microsoft introduced paid extensions in 2023 and expanded the
trial/licensing API in 2024" with "a 5% transaction fee". That claim traces to SEO content farms
(`markaicode.com`, `dodopayments.com` blog) and **directly contradicts Microsoft's own current
documentation**, which I rendered. The 5%-fee figure appears to be a garbled memory of the *Visual
Studio* (the IDE, not VS Code) Marketplace paid-extension experiment described in Brian Harry's
2015-era devblog. **There is no paid-extension programme in the VS Code Marketplace.** The same search
surfaced "developers report $300–$2,100/month" and "only 15% of extensions are paid" — both from the
same SEO farms, both uncorroborated, and the 15% figure is self-evidently false. I am recording these
as *rejected* claims so no later agent re-imports them as fact.

## 8. Which paid plugins actually earn — the honest answer is: barely disclosed

I spent two of my five searches on this and it is the weakest-evidenced part of the criterion.

What I have:
- **[S]** JetBrains' own "Plugin Spotlight" blog (https://blog.jetbrains.com/platform/2024/04/plugin-spotlight-on-jetbrains-marketplace/,
  snippet only, host blocked) names **BashSupport Pro** (paid; shell scripting — editor, visual
  debugger, run configs, remote execution) and **OpenCV Image Viewer** (freemium; PyCharm image
  debugging) as commercially notable plugins. Both are narrow-vertical developer-tooling plugins that
  do something an IDE genuinely cannot do — not conveniences.
- **[R]** BashSupport Pro's author, Joachim Ansorg, maintains
  https://github.com/jansorg/marketplace-stats-kotlin — "Detailed reports and statistics for paid
  plugins hosted on the JetBrains Marketplace." Its README is purely technical: **no revenue figures,
  no churn or ARR numbers, no mention of his own plugin's income** (rendered 2026-09-04). The
  existence of a hand-built ARR/churn analytics tool tells you the Marketplace's own reporting is thin
  and that at least one vendor's revenue is large enough to be worth modelling — it tells you nothing
  about the amount.
- **[S]** The Wallaby.js family (Wallaby, Quokka.js, Console Ninja) is the clearest long-running
  commercial VS Code extension business, selling Pro and Enterprise licences off its own site
  (quokkajs.com/pro). **No public revenue figures.**
- **[R]** The single hard earnings number I found anywhere is the negative one in vscode issue #111800:
  ~$99 for 100+ hours, ~1,000 new monthly users.

**Conclusion I am willing to defend: nobody publishes IDE-plugin revenue, and any figure that claims
otherwise in this space is currently SEO invention.** The colony should not build a JetBrains or VS
Code plugin line on an assumed revenue number. What *is* solid is the mechanics: 15% cut, real payout
rails, a real (human) review, and a proven multi-year commercial business (Wallaby) existing in the VS
Code channel — which proves the channel supports a business, not that a new entrant can reach one.

## 9. Open VSX (Cursor, Windsurf, VSCodium, Gitpod, Eclipse Theia) — enumerated, not verified

`EclipseFdn/open-vsx.org` is public. Its rendered Terms of Use
(https://raw.githubusercontent.com/EclipseFdn/open-vsx.org/main/website/static/documents/terms-of-use.md,
2026-09-04) says **nothing** about pricing, payments, commerce or monetization; it requires publishers
to accept a separate **Open VSX Publisher Agreement** whose text is at
`/documents/publisher-agreement-v1.1.md` in the same repo (path confirmed via the route table in
`website/src/page-settings.tsx`, `mcp__github__search_code`, 2026-09-04) — **I did not render it.**

Open VSX matters because it is the registry the VS Code *forks* use — most importantly Cursor. Same
economics as VS Code (no store commerce, own licence key), same unresolved agreement question, smaller
audience but a wealthier one. It is a distribution multiplier on a VS Code extension, not a separate
line, and it is unverified.

---

## URLs used (all fetched or seen on the date given)

Rendered [R], 2026-09-04:
1. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/revenue-sharing-and-fees.topic
2. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/getting-paid.topic
3. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/payment-processing.topic
4. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-general-info/license-types-and-schemes.topic
5. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/legal-agreements-policies/JetBrains-Marketplace-Approval-Guidelines.topic
6. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/legal-agreements-policies/trader-status.topic
7. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/understanding-plugin-security.topic
8. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/marketplace-general/plugins-ranking.topic
9. https://raw.githubusercontent.com/JetBrains/marketplace-docs/master/topics/paid-plugins-start/paid-plugins.topic
10. https://raw.githubusercontent.com/microsoft/vscode-docs/main/api/working-with-extensions/publishing-extension.md
11. https://github.com/microsoft/vscode/issues/111800
12. https://raw.githubusercontent.com/jansorg/marketplace-stats-kotlin/main/README.md
13. https://raw.githubusercontent.com/EclipseFdn/open-vsx.org/main/website/static/documents/terms-of-use.md
14. https://github.com/JetBrains/marketplace-docs (repo metadata + code-search fragments of
    business-models.topic, plugin-monetization.topic, best-practices-for-listing.topic,
    billing-and-licensing.topic, Sales-report.topic)

Snippet only [S], seen in search results 2026-09-04 (hosts blocked, must be opened elsewhere):
15. https://plugins.jetbrains.com/legal/developer-agreement — **the single most important unopened URL**
16. https://blog.jetbrains.com/platform/2024/04/plugin-spotlight-on-jetbrains-marketplace/
17. https://blog.jetbrains.com/platform/2025/01/introducing-perpetual-licenses-on-jetbrains-marketplace/
18. https://youtrack.jetbrains.com/articles/SUPPORT-A-1776/Revenue-sharing-and-JetBrains-fee-for-plugins-sold-via-Marketplace
19. https://marketplace.visualstudio.com/items/publisheragreement — second most important unopened URL
20. https://quokkajs.com/pro/

Explicitly rejected as unreliable (SEO content farms contradicting primary docs):
- https://markaicode.com/sell-vs-code-extensions-2025/
- https://dodopayments.com/blogs/sell-vscode-extensions

## Searches run (5)
1. "JetBrains Marketplace paid plugin revenue how much developers earn per month"
2. "VS Code Marketplace paid extensions monetization support 2026"
3. "\"JetBrains plugin\" indie developer revenue \"per month\" paid plugin sales numbers blog"
4. "VS Code extension paid license revenue MRR indie \"Console Ninja\" OR \"Wallaby.js\" OR \"Quokka\" sales"
5. "JetBrains Marketplace best selling paid plugins list downloads \"paid\" top plugins 2026"

Three searches left unspent, deliberately, per the shared-budget rule.
