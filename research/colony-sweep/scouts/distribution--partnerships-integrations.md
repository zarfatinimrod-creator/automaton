# Scout notes — distribution / partnerships-integrations
Date: 2026-09-04. Scout: WORKER-SCOUT "partnerships-integrations", group `distribution`.

Criterion: **being listed inside someone else's product** (integration directories, partner pages,
API marketplaces): how listings are obtained, and whether any require a human conversation.

Search budget spent: **7 of 8 allowed** WebSearch calls. GitHub/raw.githubusercontent fetches and
GitHub `search_code` calls (free) carried the primary evidence for the two strongest findings.

## Evidence ledger

### Rendered primary sources (strong)
- `https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/modelcontextprotocol-io/quickstart.mdx`
  — fetched 2026-09-04. Publishing an MCP server: add `mcpName` to package.json, `npm publish`,
  install `mcp-publisher`, `mcp-publisher init`, `mcp-publisher login github` (OAuth device flow),
  `mcp-publisher publish`. **No human review mentioned; publication is automated on validation.**
- `modelcontextprotocol/registry` docs via GitHub `search_code` (free), 2026-09-04:
  - `docs/reference/api/official-registry-api.md`, `docs/reference/api/generic-registry-api.md`:
    `POST /v0.1/publish`, auth = `publish`/`edit` permission on the namespace.
  - `docs/modelcontextprotocol-io/authentication.mdx`: GitHub or DNS namespace proof; org namespace
    needs org **Owner** role.
  - `docs/reference/server-json/official-registry-requirements.md`: "Publishers must prove ownership
    of their namespace."
  - `docs/modelcontextprotocol-io/about.mdx`: "The MCP Registry supports both open-source and
    closed-source servers... as long as the server's installation method is publicly available ... or
    the server itself is publicly accessible" — a **closed-source paid remote server is listable**.
  - `docs/modelcontextprotocol-io/terms-of-service.mdx`: submitted metadata is dedicated to CC0;
    prohibitions are unlawful gambling, ITAR data, life-safety uses — nothing that touches us.
  - `docs/design/ecosystem-vision.md`: the registry is the source consumed by "MCP clients,
    aggregators, marketplaces" — i.e. the listing propagates into other companies' products.
- `https://raw.githubusercontent.com/n8n-io/n8n-docs/main/docs/reusable-content/.gitbook/includes/integrations/submit-community-node.md`
  — fetched 2026-09-04. Community nodes are npm packages; package name must start with `n8n-nodes-`
  or `@scope/n8n-nodes-`, keywords must include `n8n-community-node-package`, nodes/credentials
  declared under the `n8n` attribute in package.json. For verification: build with the `n8n-node` CLI,
  **no runtime dependencies**, UX guidelines, README, publish from GitHub Actions **with an npm
  provenance statement**, then submit at **https://creators.n8n.io/nodes** (sign up / log in and
  submit). No call, no email thread — a portal.
- n8n `docs/changelog/release-notes-1.x.md` (via `search_code`): earlier route was "Request
  verification by filling out this form: https://internal.users.n8n.cloud/form/f0ff9304-f34a-420e-99da-6103a2f8ac5b".
  Either way: **a form, not a conversation.**
- n8n `docs/integrations/community-nodes/installation-and-management/install-verified-community-nodes.md`
  (via `search_code`): a verified node appears in the editor's nodes panel under **"More from the
  community"** — the listing is *inside n8n's own product*, including n8n Cloud.
- n8n `docs/reusable-content/.gitbook/includes/workflows/templates/submit-templates.md`
  (via `search_code`): "n8n is working on a creator program, and developing a marketplace of
  templates. This is an ongoing project, and details are likely to change." Submission info lives on
  a Notion page (n8n Creator hub). **No stated payment to creators today.**

### Search snippets only (weaker — the underlying domain is egress-blocked here)
- Zapier: snippets quoting `https://docs.zapier.com/integrations/publish/integration-publishing-requirements`
  and third-party guides (golmtech.solutions, luhhu.com, community.zapier.com), search run
  2026-09-04: publishing a public integration requires **10 published Zap templates and 50 active
  users** (a Zap turned on), a **90-day public beta**, full public launch of the app itself, complete
  API docs, tested triggers/actions with successful Zap runs; the 50-user requirement **can be waived
  if you embed Zapier's widget in your own product**. Review is by Zapier staff against a checklist.
  URL a human must open to close this: https://docs.zapier.com/integrations/publish/integration-publishing-requirements
- Make: snippets quoting `https://developers.make.com/custom-apps-documentation/apps-marketplace/terms-and-conditions`,
  `.../app-review/overview`, `https://f.make.com/submit-your-app`, search run 2026-09-04:
  "In order to post any custom applications or modules to the Make Apps Marketplace, you must have an
  active **Make Partnership Agreement**"; all submissions reviewed and accepted/rejected at Make's
  sole discretion; Make **only accepts apps for services not already covered by a built-in app**.
  URLs to open: the two developers.make.com pages above.
- HubSpot: snippets quoting `https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/app-marketplace-listing-requirements`
  and the May-2026 changelog, search run 2026-09-04: listing and certification are **free**; you must
  agree to the **Technology Partner Program Agreement**; you need **at least 3 active installs from
  real customers**; submissions are **manually reviewed by the HubSpot Ecosystem Quality team**
  (2–4 weeks); from 31 Mar 2026 demo videos replace testing credentials.
- RapidAPI: snippets quoting `https://docs.rapidapi.com/docs/payouts-and-finance`,
  `https://rapidapi.zendesk.com/hc/en-us/articles/11432098898580-What-payment-methods-are-available-for-payouts`,
  search run 2026-09-04: marketplace fee described as 20% flat, with a further snippet saying
  transaction fees moved to **25% on 15 Nov 2025**; **payouts are PayPal-only**, wire transfer only
  for APIs above **$10,000/month**. **No country list was found** — Israel payability UNKNOWN.
  URLs to open: the two above plus https://rapidapi.zendesk.com/hc/en-us/articles/17777288883988-API-Provider-Payout-Schedule
- JetBrains Marketplace paid plugins: search run 2026-09-04 returned payout currency (USD/EUR) and a
  **$200/€200 minimum payout**, but **no supported-country list**; `plugins.jetbrains.com` is
  egress-blocked here. URLs to open: https://plugins.jetbrains.com/docs/marketplace/paid-plugins.html
  and https://plugins.jetbrains.com/docs/marketplace/revenue-sharing-and-fees.html

### Fetches that failed
- `plugins.jetbrains.com`, `docs.zapier.com`, `docs.rapidapi.com` — all EGRESS_BLOCKED.
- Raw fetches of `obsidianmd/obsidian-releases/README.md` and `raycast/extensions/CONTRIBUTING.md`
  rendered but contained only pointers to external docs — not enough to make a finding.
- 404s: `n8n-io/n8n-docs/.../community-nodes/build-community-nodes.md`,
  `modelcontextprotocol/registry/docs/guides/publishing/publish-server.md` (paths have moved; found
  the real ones with `search_code`).
- `zapier/zapier-platform` and `org:JetBrains` code searches for the requirement/payout text:
  **0 results** — these platforms do not check their listing terms into public repos.

## The answer to the criterion, stated plainly

Listings divide into three mechanically different kinds:

1. **Package-registry listings** (MCP Registry, n8n community nodes, npm-shaped ecosystems).
   Obtained by publishing a package and proving namespace ownership through a machine (OAuth, DNS,
   npm provenance). **No human conversation at any point.** These are the only ones a
   software-only operation can actually obtain today. They pay nothing directly; their value is that
   they put our paid endpoint in front of a user inside someone else's UI.
2. **Directory listings gated on installed-base** (Zapier: 50 active users; HubSpot: 3 active
   installs). No conversation either — but a **demand gate before the distribution**, which inverts
   the reason we wanted the listing. For a no-brand new entrant these are ₪0 as an acquisition
   channel, and they are not "build in 40 hours" work.
3. **Partner-agreement listings** (Make Apps Marketplace, and by strong analogy every "partner page":
   Shopify, Stripe, Vercel, AWS). Obtained only after a **contract with the platform's partner
   organisation**. That is the class where a human conversation is at least plausible and sometimes
   required, and it is exactly the class MISSION.md forbids us to depend on. Mark AMBER, do not build.

The one honest revenue-bearing member of the family — an API marketplace that itself collects money
and pays the seller (RapidAPI) — is self-serve to list but **blocked on a payability question we could
not close**: PayPal-only payouts, no published country list.
