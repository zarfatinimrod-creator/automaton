# Scout notes — risk-governance / automation-tos
**Criterion:** Platform terms on automation, bots and multi-account operation across the platforms we touch (GitHub, Apify, Telegram, Netlify, Google, Cloudflare, marketplaces). Quote the actual clauses.
**Date of research:** 2026-09-03
**Scout:** WORKER-SCOUT "automation-tos"

## Tooling reality of this run (important for the supervisor)
- `WebSearch` was **unavailable**: the session's global budget (200/200 calls) was already spent before this scout started. Zero web searches were possible.
- The egress proxy blocked every primary legal domain I tried: `docs.github.com`, `telegram.org`, `docs.apify.com` (EGRESS_BLOCKED). `cloudflare.com`, `netlify.com`, `apify.com` were therefore not attempted directly.
- What *did* work: `WebFetch` against **github.com** blob/tree pages, and the **GitHub code search API** (`mcp__github__search_code`) across all public repos.
- Consequence: I obtained authoritative text by reading the **open-source repositories in which the platforms themselves publish their policies/docs** (`github/docs`, `cloudflare/cloudflare-docs`, `apify/apify-docs`) and, for Telegram, the **Open Terms Archive** dated snapshots. Evidence strength is noted per claim.

Evidence key:
- **[R]** rendered page I actually fetched (strong)
- **[R-derived]** rendered page, but the fetch tool returned a summary with embedded verbatim quotes rather than the whole file (strong for the quoted strings, weaker for "what is absent")
- **[A]** third-party archive of the platform's text (Open Terms Archive) — good, but one step removed from the live page
- **[GAP]** could not be reached; exact URL listed for an unblocked agent

---

## 1. GitHub — accounts, bots, multi-account operation
Source: `github/docs`, the repo GitHub publishes its site policy from.
URL fetched: https://github.com/github/docs/blob/main/content/site-policy/github-terms/github-terms-of-service.md  **[R-derived, 2026-09-03]**

Verbatim clauses returned:
> "One person or legal entity may maintain no more than one free Account (if you choose to control a machine account as well, that's fine, but it can only be used for running a machine)."

> "A machine account is an Account set up by an individual human who accepts the Terms on behalf of the Account, provides a valid email address, and is responsible for its actions."

> "Your login may only be used by one person — i.e., a single login may not be shared by multiple people."

> "Accounts registered by 'bots' or other automated methods are not permitted."

API terms, same document:
> "Abuse or excessively frequent requests to GitHub via the API may result in the temporary or permanent suspension of your Account's access to the API."
> Users may not "share API tokens to exceed GitHub's rate limitations".

**Ruling for the colony:** a fleet of N agents must run under **one human Account + at most one machine account**, using tokens issued to those accounts. Creating a GitHub account per agent is a direct ToS violation (RED). Agents authenticating as the owner's single account is explicitly fine — a machine account is defined as one a human sets up and remains responsible for, which is exactly our model.

## 2. GitHub — Actions and Pages may not be our compute or our SaaS host
URL fetched: https://github.com/github/docs/blob/main/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md **[R-derived, 2026-09-03]**

Actions may not be used for:
> "Cryptomining"
> "The provision of a stand-alone or integrated application or service offering the Actions product or service ... for commercial purposes"
> activities that place "a burden on GitHub's servers disproportionate to the benefits provided to users" (e.g. content delivery networks, serverless applications)
> "If using GitHub-hosted runners, any other activity unrelated to the production, testing, deployment, or publication of the software project"

Pages:
> Pages may not be used as "free web hosting" for "commercial businesses, e-commerce sites, or SaaS offerings"; limited monetization (donation buttons, crowdfunding links) is allowed.

**Ruling:** our scheduled colony runners (`colony.yml`) are only legitimate on GitHub-hosted runners insofar as they build/test/deploy *this software project*. Running revenue workloads (scrape jobs, API serving, LLM batch work) on GitHub Actions is **AMBER→RED**. Hosting `products/il-biz-tools` on Netlify rather than GitHub Pages is the correct call and must stay that way now that it has a paid Pro tier.

## 3. GitHub — scraping, information usage, and inauthentic activity
URL fetched: https://github.com/github/docs/blob/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md **[R-derived, 2026-09-03]**

> "Scraping refers to extracting information from our Service via an automated process, such as a bot or webcrawler."
> "You may use information from our Service for the following reasons, regardless of whether the information was scraped, collected through our API, or obtained otherwise: Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are open access. Archivists may use public information from the Service for archival purposes."
> "You may not use information from the Service (whether scraped, collected through our API, or obtained otherwise) for spamming purposes, including for the purposes of sending unsolicited emails to users or selling personal information, such as to recruiters, headhunters, and job boards."

URL fetched: https://github.com/github/docs/blob/main/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md **[R-derived, 2026-09-03]**
Prohibited:
> "Starring and/or following accounts or repositories in large volume in a short period"
> "Opening empty or meaningless issues or pull requests"
> "Engaging with platform features in a way that causes excessive notifications"

**Ruling:** the permitted-uses list is a **closed** list (research with open-access publication; archival). A commercial product built on scraped GitHub user data — lead lists, recruiter feeds, "find maintainers to email" — is **RED** on two counts (outside permitted uses + the anti-spam/anti-selling-personal-information clause). Any "grow our repo's stars/followers" tactic is RED. This kills a whole family of otherwise attractive dev-tool lead-gen ideas.

## 4. Telegram — bots, scraping and the February 2026 AI clause
Telegram's own domain is blocked. Evidence via Open Terms Archive dated snapshots. **[A]**

- https://github.com/OpenTermsArchive/vlopses-us-versions/blob/main/Telegram/Terms%20of%20Service.md — Telegram ToS snapshot:
  > "Use our service to send spam or scam users" (prohibited)
  > Bot users accept a separate "Terms of Service for Bot Users"; developers must comply with the "Bot Developers" terms.
  > "Telegram additionally prohibits data scraping as part of its Content Licensing and AI Scraping Terms, which apply to all users, businesses, and third-party services."
  > "Telegram users can acquire Telegram Stars, which are used to purchase digital goods and services from bots and mini-apps." — Stars are governed by a *separate* Terms of Service for Telegram Stars.
- https://github.com/OpenTermsArchive/pga-versions/blob/main/Telegram/Developer%20Terms.md — Telegram API ToS for developers:
  > prohibits "making actions on behalf of the user without the user's knowledge and consent"
  > prohibits using data obtained from the Telegram platform "to train, fine-tune or otherwise engage in the development, enhancement or deployment of artificial intelligence, machine learning models and similar technologies"
  > monetization is allowed but "you must clearly mention all the methods of monetization that are used in your app in all its app store descriptions"
- https://github.com/OpenTermsArchive/opentermsarchive.org/blob/main/content/memos/telegram-prohibits-collecting-data-for-ai-use/index.md — OTA memo, **change dated 2026-02-03**, covering ToS + Developer Terms, adding the *Content Licensing and AI Scraping Terms* restricting acquisition of Telegram data to "train, fine-tune, validate or otherwise engage in the development, enhancement, benchmarking or deployment of artificial intelligence, machine learning models and similar technologies."

**Ruling:** `products/telegram-il-tools-bot` is GREEN as long as it only serves the users who message it, discloses its monetization, and never pipes Telegram content into a model. Any line of the form "harvest Israeli Telegram groups → dataset/LLM/alerts product" is **RED as of 2026-02-03** and must not be proposed by any scout in this sweep.
**[GAP]** The Stars payout terms (who can cash out, via Fragment/TON, and whether an Israeli resident can) are in https://telegram.org/tos/stars and https://telegram.org/tos/bot-developers — both blocked here, both must be opened by an unblocked agent before we count Stars revenue as payable.

## 5. Apify — monetization, KYC and the payout mechanics
Source: `apify/apify-docs`, Apify's own open-source docs.
- https://github.com/apify/apify-docs/blob/master/sources/platform/actors/monetizing/monthly-payouts.mdx **[R-derived, 2026-09-03]**
  > invoices generated on the 11th of each month, three days to review, automatic approval on the 14th
  > to qualify you must "complete billing details, select a payment method, and pass identity verification" — referencing KYC and "anti-money laundering (AML) regulations"
  > minimum payout "$20 for PayPal and Wise" and "$100 for other payout methods"; below threshold, funds carry forward
  > "If your PPE Actor's price doesn't cover its monthly platform usage costs, it will have a negative profit" — that Actor's profit is then set to $0 for the month
  > only earnings "from legitimate paying users" are included in invoices
- https://github.com/apify/apify-docs/blob/master/sources/platform/actors/monetizing/set-up-monetization.mdx **[R-derived, 2026-09-03]**
  > billing and payment details must be complete before pricing can be defined
  > "significant changes" (switching pricing model, raising prices, adding paid events) require a 14-day notice, are limited to once per month per Actor, and "You can't cancel a planned change"
  > governed by the "Apify Store publishing terms and conditions"
- https://github.com/apify/apify-docs/blob/master/sources/platform/actors/publishing/index.mdx **[R]** — publishing/Store framing; contains **no** legal or compliance clauses (checked explicitly).

**Ruling:** Apify monetization is structurally compatible with an agent-run operation — but it has a hard human gate (identity verification / KYC) and a hard economic gate (a PPE Actor priced below its platform usage cost earns exactly $0, not a loss). The once-a-month, 14-day-notice, non-cancellable price change rule means our pricing agent must treat price as a slow control loop, not something to tune weekly.
**[GAP]** The binding text is the "Apify Store publishing terms and conditions" at https://apify.com/store-terms-and-conditions (blocked) — an unblocked agent must read it before we scale this line.

## 6. Google — automated access must respect machine-readable instructions
Google's own pages are blocked; evidence via Open Terms Archive. **[A]**
https://github.com/OpenTermsArchive/france-versions/blob/main/Google/Terms%20of%20Service.md
> "Vous ne devez pas utiliser nos services ni nos systèmes de manière abusive, ni les perturber, interférer avec eux ou y nuire."
> prohibited: "En utilisant des moyens automatisés pour accéder au contenu de l'un de nos services sans respecter les instructions lisibles par machine sur nos pages Web" (using automated means to access content without respecting machine-readable instructions such as robots.txt)
> prohibited: creating fake accounts ("créer de faux comptes")

**Ruling:** any colony crawler must parse and obey `robots.txt` before fetching, as a coded control and not a convention — this is contractual, not merely polite. Scraping Google SERPs for a product is **RED**. Multi-account Google operation (a Google account per agent) is RED.
**[GAP]** Product-specific terms that would matter if we ever monetise via Google (AdSense invalid-traffic policy, Play developer distribution agreement) are at policies.google.com / support.google.com — all blocked.

## 7. Cloudflare — what a free/Pro plan may serve
https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/fundamentals/reference/policies-compliances/delivering-videos-with-cloudflare.mdx **[R-derived, 2026-09-03]**
> Free, Pro and Business plans: "we limited your ability to use our services to deliver video bits from our network to your visitors."
> "Cloudflare may redirect your content or take other actions to protect quality of service. When this happens, you will receive an email notification regarding Cloudflare's actions and your options."
> paid alternatives: Cloudflare Stream (all plans), Stream Delivery (Enterprise only)

**Ruling:** any revenue line whose deliverable is video or large media files must not be served through a non-Enterprise Cloudflare zone. Text/JSON APIs (our `x402-il-api` shape) are unaffected.
**[GAP]** The controlling contract text (the Service-Specific Terms, historically "Section 2.8") is **not** reproduced in the docs repo — I searched `cloudflare/cloudflare-docs` for "Section 2.8" (0 hits) and "non-HTML content" (1 unrelated hit). It must be read at https://www.cloudflare.com/service-specific-terms-application-services/ by an unblocked agent.

## 8. Netlify — genuine dead end in this environment
- `netlify.com` is not reachable from here and Netlify does **not** publish its legal terms or its docs in a public GitHub repo that code search can find. I searched all public GitHub for the string `netlify.com/legal/acceptable-use-policy` (4 hits, all unrelated third-party datasets/test fixtures — no mirror of the text) and `org:netlify "Acceptable Use Policy"` (0 hits).
- I therefore have **no evidence** about Netlify's position on automated deploys, bandwidth abuse, proxying, or multi-account/multi-team operation, and I will not assert any from memory.
- **[GAP]** Must be opened by an unblocked agent: https://www.netlify.com/legal/terms-of-use/ and https://www.netlify.com/legal/acceptable-use-policy/ — this matters directly because `products/il-biz-tools` (now with a paid Paddle tier) is hosted there.

## Dead ends / not covered
- **WebSearch entirely unavailable** this run — so no coverage of secondary reporting, enforcement anecdotes, or recent policy-change news beyond the one dated OTA memo.
- **Marketplaces** (Gumroad, Paddle, Lemon Squeezy, RapidAPI, Chrome Web Store, npm) — no terms mirrored on github.com and no search available; not covered at all. Their automation/multi-account clauses remain unknown.
- **Telegram Stars payout terms** and **Apify Store T&Cs** — the two documents that would settle payability and store compliance for lines we have already shipped — both blocked.
- **Cloudflare / Netlify contract text** — blocked; only docs-level restatements obtained for Cloudflare, nothing for Netlify.

## The one structural conclusion for the board
Across every platform whose text I could actually read, the constraint is the same shape and it is not "no automation": **automation is permitted, identity multiplication is not.** GitHub caps it at one free account plus one machine account and bans bot-registered accounts; Google bans fake accounts; Telegram bans acting on a user's behalf without consent. Nothing I found forbids one identified human running an arbitrarily large fleet of agents under his own credentials — which is exactly the colony's design. The colony should therefore adopt a hard rule: **one owner identity per platform, agents authenticate as that identity, never create accounts.**
