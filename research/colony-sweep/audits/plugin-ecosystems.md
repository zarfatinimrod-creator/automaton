# Audit — group `plugin-ecosystems`

Auditor pass. I do not report to this group's supervisor; I check it. Default posture:
refute. Anything I could not verify from a source I opened myself is not CONFIRMED.

**Bottom line.** The group's honest answer — "almost none" — is right, and the supervisor
deserves credit for measuring the Obsidian cohort rather than arguing about it. But the one
line it ranked survives only in weakened form. Its permission story holds and I re-verified
it independently. Its two headline differentiators do not: **payability is not proven, it is
asserted**, and **the "named platform-search acquisition channel" is refuted by WordPress's
own search code**, which is install-, rating- and support-history-weighted — the exact defect
this same supervisor used to kill the Chrome Web Store twice in the same report.

| | Supervisor | Audited |
|---|---|---|
| Ranked survivors | 1 | 1, downgraded |
| WordPress line ceiling | ₪1,000/month | **₪0–200/month** in the first 12 months |
| israelPayable | YES ("proven") | **UNKNOWN** |
| New owner KYC | none | **Paddle identity/KYC + payout details + domain approval, all outstanding** |
| tosRisk | GREEN | GREEN, conditional on where the licence check lives |
| buildHours | 38 | 38 build-only; excludes licence server, review rework and a permanent release cadence |

---

## 1. Ranked candidate — WordPress.org free plugin + separately-distributed Pro build on Paddle

### Verdict: **DOWNGRADED**. Corrected ceiling ₪200/month. israelPayable → UNKNOWN.

### 1.1 What I verified and what genuinely holds

I opened the cited handbook source myself
(`https://raw.githubusercontent.com/WordPress/developer-plugins-handbook/main/wordpress-org/detailed-plugin-guidelines/index.md`)
rather than trusting the supervisor's re-verification. The permission story is real:

- **Guideline 5** — *"Plugins may not contain functionality that is restricted or locked, only
  to be made available by payment or upgrade."* But: *"Paid functionality in services is
  permitted … provided all the code inside a plugin is fully available"*, and upselling is
  acceptable *"provided it falls within bounds of guideline 11."*
- **Guideline 6** — *"Plugins that act as an interface to some external third party service …
  are allowed, even for paid services."*
- **Guideline 11** — *"Upgrade prompts, notices, alerts, and the like must be limited in scope
  and used sparingly, be that contextually or only on the plugin's setting page."*
- 18 guidelines total; Software-as-a-Service is explicitly permitted.

So the free-in-directory / Pro-outside shape is the permitted shape, and the supervisor
described it correctly. **This is the best-sourced claim in the group and it stands.**

**One nuance the supervisor missed.** Guideline 6 also prohibits *services created solely for
licence validation*. A licence-key check that lives inside the **directory-hosted free**
plugin is therefore not obviously GREEN. It is GREEN only if the check ships exclusively in
the Pro build distributed outside the directory. GREEN is conditional on a design decision
the report never names.

### 1.2 Israel payability — the hardest attack, and the supervisor loses it

The report says payability is *"proven rather than inferred (Paddle already ships
il-biz-tools)."* That sentence is false, and this repo contains the disproof.

- `products/il-biz-tools/src/config/site.json` → `{"clientToken": "", "priceId": "",
  "environment": "sandbox"}`. Empty credentials, sandbox mode.
- `products/il-biz-tools/README.md:109` — with the token unset the Pro box renders **"בקרוב"**
  (coming soon). The paywall has never been open.
- `products/il-biz-tools/README.md:134` and `:167` list, under *"One-time steps only the owner
  can do"* / *"צעדים שרק הבעלים יכול לבצע"*: **sign up at paddle.com, complete identity/KYC and
  payout details, get the site domain approved, create the product and price.** None of it is
  done.
- `state/colony/REPORT.md` — 30-day revenue **₪0.00**. `grep` for transaction ids across
  `state/` and the product READMEs returns nothing.

"Paddle already ships il-biz-tools" means Paddle *code* ships. No Paddle *account* is known to
exist, no Israeli seller has been approved, and no shekel has moved. That is inference, not
proof — and it is inference in the exact place MISSION calls a hard gate.

Worse, **this repo already knows the payout is not clean.** `src/revenue/rails.ts:80`:

> "ILS is NOT a Paddle payout currency: an Israeli seller takes USD by international SWIFT at
> 5% + $0.50 per transaction, a $15 SWIFT fee, the receiving bank's own charge and ~1.5% FX,
> against a $100 minimum paid on the 1st and landing by the 15th. This entry previously said
> the payout lands in an Israeli bank account, which is true only in the sense that the money
> eventually arrives."

The supervisor's own repo wrote that warning and the report does not carry a single one of
those costs into its arithmetic.

I could not close the gate myself: `www.paddle.com` and `developer.paddle.com` are both
EGRESS_BLOCKED from this network. A search returns only that Paddle "supports sellers …
anywhere in the world with exception to sanctioned countries" — Israel is not *named* either
way. Whether an Israeli **osek patur** (individual, no registered company) can be approved as
a Paddle seller is unverified from any primary source; the repo already flags exactly this
question for Freemius and never asked it of Paddle.

**Corrected: israelPayable = UNKNOWN.** Not NO — the shape is plausible and Gumroad (which
*does* list Israel | ILS, per `src/revenue/rails.ts:324`) is a fallback. But under "default to
scepticism", an unopened primary source plus an account that does not exist is not YES.

### 1.3 The acquisition channel — refuted from WordPress's own source code

This is the report's load-bearing differentiator: *"backed by a named platform-search
acquisition channel."* I tested it against the code that actually ranks the directory search,
which WordPress mirrors publicly at `WordPress/wordpress.org`
(`wordpress.org/public_html/wp-content/plugins/plugin-directory/class-plugin-search.php`).
The supervisor cited that repository but evidently never opened this file. Its `function_score`:

```php
[ 'exp' => [ 'plugin_modified' => [ 'origin'=>date('Y-m-d'), 'offset'=>'180d', 'scale'=>'360d', 'decay'=>0.5 ] ] ],
[ 'exp' => [ 'tested'          => [ 'origin'=>WP_CORE_STABLE_BRANCH, 'offset'=>0.1, 'scale'=>0.4, 'decay'=>0.6 ] ] ],
[ 'field_value_factor' => [ 'field'=>'active_installs',          'factor'=>0.375, 'modifier'=>'log2p', 'missing'=>1   ] ],
[ 'filter'=>['range'=>['active_installs'=>['lte'=>1000000]]],
  'exp' => [ 'active_installs' => [ 'origin'=>1000000, 'offset'=>0, 'scale'=>900000, 'decay'=>0.75 ] ] ],
[ 'field_value_factor' => [ 'field'=>'support_threads_resolved', 'factor'=>0.25,  'modifier'=>'log2p', 'missing'=>0.5 ] ],
[ 'field_value_factor' => [ 'field'=>'rating',                   'factor'=>0.25,  'modifier'=>'sqrt',  'missing'=>2.5 ] ],
```

Three of the six factors are accumulated history a new entrant cannot have. Evaluating the
multipliers for a day-one plugin against an ordinary established competitor with 1,000
installs, ~50 resolved support threads and a 4.5-star rating:

| factor | new plugin | established | handicap |
|---|---:|---:|---:|
| `active_installs` (log2p, ×0.375) | log10(2+0) = **0.30** | log10(2+375) = **2.58** | **8.6×** |
| `support_threads_resolved` (log2p, ×0.25) | ~**0.33** | log10(2+12.5) = **1.16** | **3.5×** |
| `rating` (sqrt, ×0.25) | sqrt(0.625) = **0.79** | sqrt(22.5) = **4.74** | **6.0×** |
| `active_installs` exp decay (origin 1e6, scale 9e5) | 0.726 | 0.727 | ~1× (only rewards mega-plugins) |

These compose multiplicatively: roughly a **100–200× score handicap** before the query-relevance
term. The two factors a newcomer *can* max — `plugin_modified` and `tested` — are already
maxed by every maintained competitor, so they buy parity, not advantage.

That is install-count-locked ranking. It is the identical mechanism the supervisor used to
kill *"Chrome Web Store, single paid extension"* ("install-count-locked ranking, no documented
cold-start lane") **in the same report**, and it did not apply the test to its own winner.

**And the cold-start lane is worse than assumed.** The report's `firstStep` leans on
`browse=new`. The "Newest" tab was **removed from the plugin directory navigation** in the
redesign; `wordpress.org/plugins/browse/new/` still resolves but is reachable only by typing
the URL. The linked browse surfaces are featured / popular / beta / blocks, and Popular is
populated by highest active installs. This is precisely the defect the supervisor used to kill
Figma — *"no editorial pick and no 'newest' surface"* — and it did not check whether WordPress
had one.

### 1.4 The ceiling — recomputed with the fees and the actual exchange rate

The report's arithmetic: *"at Freemius's published 2.1% feature-gated conversion and a $49/yr
tier, ~260 free installs every month to sustain 1,000 ILS/month."* Two problems.

**First, the conversion figure is snippet-grade.** `freemius.com` is EGRESS_BLOCKED from this
network, so `freemius.com/blog/freemium-pricing-strategy/` — one of the report's five
`evidenceUrls` — was **not rendered by the supervisor either**. What is publicly verifiable is
a **1–3% industry range**, not a specific 2.1% feature-gated figure. Using the bottom of that
range roughly doubles every requirement below.

**Second, the arithmetic drops every fee and uses a stale shekel.** USD/ILS is **~3.03** in
September 2026, not the ~3.7 the number implies. Recomputing at 2.1% and $49/yr, carrying the
costs `rails.ts:80` already documents:

| step | value |
|---|---|
| Target net to the owner's bank | ₪1,000/mo = **$330/mo** at 3.03 |
| + SWIFT $15, receiving-bank charge ~$15, ~1.5% FX | ≈ **$365/mo** must leave Paddle |
| ÷ Paddle 5% + $0.50 per $49 sale (net $46.05, 94.0%) | ≈ **$388/mo gross = $4,660/yr** |
| ÷ $49 per annual licence | ≈ **95 active licences** |
| ÷ 2.1% conversion, **zero churn assumed** | ≈ **4,524 installs in the trailing 12 months** |
| | ≈ **377 new active installs every month** |

At a realistic WordPress annual renewal rate (50–60%), steady state needs **~450–550 new
installs/month**. At the 1% end of the verifiable conversion range it is **~790/month**. The
report's 260 is understated by 45–200%.

**Now the question the audit brief demands: what does month one earn?** Zero. Not "little" —
zero, because the plugin is still in a manual review queue (§1.5) and because the first Paddle
payout cannot be issued below a **$100 minimum**. A brand-new plugin with no reviews, no
installs, no support history and no backlinks enters a ~60,000-plugin directory carrying a
~100–200× search handicap and no linked newest surface. A good, honest plugin that reaches
~500 total installs in its first year yields 500 × 2.1% ≈ 10 licences ≈ $490/yr gross ≈
**₪115/month**, arriving in two or three SWIFT payouts that each lose $15.

**Corrected 12-month ceiling: ₪0–200/month.** That figure is not mine alone — it is what this
repo's *own previous audit* already recorded at `docs/REJECTED.md:357` for a WordPress plugin
("Downgraded to ₪200/month"). The supervisor quoted that very line for its "nobody has read a
single active_installs figure" point, then silently kept the **₪1,000** from
`docs/REJECTED.md:306`. The repo holds two contradictory audited WordPress ceilings and the
report picked the higher one without reconciling them.

### 1.5 "No human is needed" — the omission

The report's ownerBlockers say a self-serve wordpress.org account "and nothing else." Two
gates are missing.

**A manual review queue.** From the plugin developer FAQ, which I rendered:
*"It will be queued, and as soon as we get to it, we will manually download and review your
code."* The team aims for **fourteen days**, states *"At any point in time, we have more than
500 people mid-review"*, replies to emails within **7 business days**, responds to reviews
within **10 business days**, and is *"made up of 100% volunteers, all of whom have full time
day jobs."* This repo already recorded a backlog of **4,715 plugins, 3,854 older than a week**
(`docs/REJECTED.md:306ff`) and the report did not carry it forward.

This matters twice. It is a real schedule gate on top of the 38 build hours — with rework
cycles, weeks to months before a single install exists. And it is an **inconsistency**: the
same report kills Notion for *"a Notion-staff waitlist with no published SLA — an unbounded
human review queue, which docs/REJECTED.md:271 already ruled non-agent-operable"* and JetBrains
because *"every release, not just the first, passes a multi-day human review."* WordPress's
queue is better than Notion's (it has a published 14-day aim, and it gates the first
submission rather than every release) — but the report should have said so and did not
mention it at all.

**Paddle KYC and domain approval.** Covered in §1.2. It is an owner-only step, it is not done,
and Paddle's site-approval step is a second human review nobody listed.

### 1.6 The first step cannot be run, and could not answer its own kill criterion if it were

`firstStep` asks for
`api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[per_page]=250&request[browse]=new`
and closes with *"one HTTP request settles it."* Four faults:

1. **Blocked.** I confirmed independently — `api.wordpress.org`, `wordpress.org`,
   `plugins.svn.wordpress.org` and `developer.wordpress.org` all return HTTP 000 /
   `CONNECT tunnel failed, response 403`, and WebFetch returns `EGRESS_BLOCKED`. The
   supervisor's report of the block is accurate.
2. **`per_page` caps at 100**, not 250. The request silently returns 100 rows.
3. **`added` is not a default field** of `query_plugins`; it must be requested explicitly via
   the `fields` parameter. As written the response carries no dates, so no cohort can be built.
4. **`browse=new` returns plugins added *days* ago**, whose `active_installs` is necessarily
   ~0. The killCriteria demands *"median active_installs under 100 **after twelve months**."*
   The newest cohort cannot be twelve months old. **The prescribed test cannot answer the
   question it was designed for.**

Building the WordPress analogue of the Obsidian cohort table requires paging the entire
directory (~60,000 plugins ÷ 100 per page ≈ **600 requests**) with `added` requested
explicitly, then bucketing by age. That is a real job, not one HTTP request — and it is
worth doing, because it is still the correct instrument.

### 1.7 Build estimate

38 hours is defensible for *the two plugin builds alone*. It excludes: a hosted licence-key
validation service with an uptime obligation; Paddle product/price/webhook setup and domain
approval; SVN release tooling and `readme.txt` discipline; review-rework round trips on a
14-day-plus loop; and — see §2C — a **permanent** release cadence, because two of the six
search factors decay with time since last update and against the current WP stable branch.
This is not a 38-hour project that then earns; it is a 38-hour project plus an indefinite
maintenance annuity, priced against ₪0–200/month.

---

## 2. Angles the group missed entirely

**A. GPL — the largest miss.** Guideline 1: *"All code, data, and images — anything stored in
the plugin directory hosted on WordPress.org — must comply with the GPL,"* and *"Included
third-party libraries, code, images, or otherwise, must be compatible."* Under the WordPress
Foundation's own long-standing position a PHP plugin is a derivative work of WordPress and is
therefore GPL — including the Pro build distributed outside the directory. A buyer may
lawfully redistribute the Pro code, and "nulled plugin" sites do exactly that at scale. The
moneyModel says the premium half is *"unlocked by a licence key"* and never confronts this.
What is actually sellable in this ecosystem is **updates and support**, not code. That changes
the product (a service with a support obligation) and it changes the churn assumption. No
scout and no supervisor in this group mentions the GPL once.

**B. Guideline 18 / platform-seizure risk.** In October 2024 WordPress.org invoked
**point 18 of these same guidelines** to fork Advanced Custom Fields into Secure Custom Fields,
removed its **commercial upsells**, and pushed the replacement to existing installs through the
update service. WP Engine's position was that a plugin under active development had never
before been unilaterally taken from its creator. A line whose entire acquisition channel is a
free directory listing, monetised by upsell, sits squarely in the fact pattern the directory
owner has already acted on. Nobody in the group priced this.

**C. Search rank decays without releases.** `plugin_modified` decays with offset 180d, scale
360d, decay 0.5; `tested` decays against `WP_CORE_STABLE_BRANCH`. Visibility requires a release
roughly every six months and a "Tested up to" bump every WP major. This is agent-doable, and
that is the point — it should have been budgeted as an ongoing cost, not omitted.

**D. Support is a ranking input, not a courtesy.** `support_threads_resolved` is a scoring
factor. Someone must work the wordpress.org support forum or the plugin's rank is suppressed.
Agent-operable, so not a mandate violation — but it is an unbudgeted permanent obligation and
it interacts with the GPL point above, since support is half of what is actually being sold.

**E. The real channel is Google, not directory browse.** Most WordPress plugin discovery
happens on the open web before anyone reaches wp-admin. The group never asked what a new
plugin's Google position would be, on a repo whose own cross-promotion scout already wrote
that *"the colony's acquisition problem is upstream of this criterion."*

**F. The $100 Paddle payout minimum against a ~$390/month line.** Early on this means payouts
every two to three months, each losing a $15 SWIFT fee plus the receiving bank's charge. Not
fatal, but it belongs in a ceiling that is quoted to the shekel.

**G. Nobody asked whether ₪1,000 is worth 38 hours.** Against a ₪20,000 target it is 5% — at
the *top* of a range whose realistic first-year value is ₪0. MISSION's own correction of
2026-09-04 already records that the highest ceiling any audited line survived with is ₪1,500
and that the modal survivor is ₪200–500. This line is a modal survivor, not a headline.

**H. Freemius as the rail was never actually evaluated.** The report mentions it only to
note an unverified osek-patur question, but Freemius is the ecosystem-native rail (it bundles
licensing, updates, trials and checkout — the exact machinery §1.7 says must otherwise be
built) and task #21 in this repo's own list is already "Verify Freemius as a second Israeli
payment rail." The group had the alternative rail in front of it and did not compare it.

---

## 3. Supervisor's own errors

1. **False payability proof.** *"Payability is proven rather than inferred (Paddle already
   ships il-biz-tools)"* — refuted by `site.json` (empty token, sandbox), the README's
   "בקרוב" fallback, and `state/colony/REPORT.md` showing ₪0.00 and no transaction ids.
2. **False "no new owner KYC".** `products/il-biz-tools/README.md:134` lists Paddle signup,
   identity/KYC, payout details and domain approval as owner-only steps, all outstanding. The
   ownerBlockers entry claiming "no new payment blocker" is wrong.
3. **Fees and FX dropped from the ceiling.** The report ignores every cost its own
   `src/revenue/rails.ts:80` documents (no ILS payout, 5% + $0.50, $15 SWIFT, receiving-bank
   charge, ~1.5% FX, $100 minimum) and uses an implied ~3.7 shekel against an actual ~3.03.
4. **Cited an evidence URL it could not open.** `freemius.com` is egress-blocked; the "2.1%
   feature-gated" figure is a search snippet, and the verifiable public claim is a 1–3% range.
5. **`firstStep` is non-executable and mis-specified** — blocked host, `per_page` caps at 100
   not 250, `added` is not a default field, and `browse=new` cannot produce a twelve-month
   cohort. *"One HTTP request settles it"* is false; the real job is ~600 requests.
6. **Its differentiator is refuted by a repo it cited.** It listed
   `github.com/WordPress/wordpress.org` as evidence but never opened
   `class-plugin-search.php`, which shows the directory ranks on `active_installs`, `rating`
   and `support_threads_resolved` — a ~100–200× handicap for a day-one listing.
7. **Inconsistent application of its own kill rules.** Chrome Web Store was killed for
   install-count-locked ranking; Figma for having no "newest" surface; Notion and JetBrains
   for human review queues. WordPress has all three (install-weighted ranking, an unlinked
   newest tab, a manual volunteer review queue) and none was mentioned in the ranked entry.
8. **Ceiling reconciliation failure.** Two audited WordPress ceilings exist in
   `docs/REJECTED.md` — ₪1,000 at line 306, ₪200 at line 357. The report quotes line 357 and
   keeps line 306's number without explaining the choice.
9. **Presented as fresh discovery.** This exact line ("WordPress.org plugin with a Paddle Pro
   tier") was already audited in an earlier wave. The report never says so; a reader takes it
   for a new survivor.
10. **Guideline 6's licence-validation clause not addressed**, so the GREEN rating is
    unconditional where it should be conditional on the check living only in the Pro build.

### What the supervisor got right, and should be credited for

It measured the Obsidian cohort instead of asserting it, and used the measurement to kill its
own group's best-evidenced line — the correct behaviour and rare. It caught its own scout
sitting on `community-plugin-stats.json` without parsing it. Its Discord kill is now on a
rendered primary source. Its Figma correction (paid *files* closed, paid *plugins* open)
fixes two wrong statements elsewhere in this repo. Its refusal to pad the ranked list to six
is exactly what `docs/REJECTED.md` asked supervisors to do. The headline "almost none" is the
right answer; only the survivor's numbers are wrong.

---

## 4. Rejections I spot-checked and agree with

- **Discord Premium Apps** — payouts US/EU/UK only; israelPayable NO on a primary source.
- **Chrome extension portfolio** — duplicate-experience and minimum-functionality policies.
- **Raycast** — MIT licence requirement in the store docs makes a paid extension impossible.
- **Alfred** — invite-only gallery gated on forum participation; a mandate violation.
- **Notion / Shopify** — zero primary sources rendered by either scout, both self-reported.
- **Slack** — the reasoning is sound and the "5 active workspaces before listing" gate is the
  right kill. Worth keeping on file: it is the only rejected line with a nameable buyer, a
  real budget, no platform cut and clean payability, and it fails only on cold start.

## 5. What would reopen the WordPress line

1. An `active_installs` cohort table built by paging the full directory with `added`
   requested — from a network that can reach `api.wordpress.org`. Median ≥ 100 at twelve
   months for plugins with no prior audience.
2. A rendered primary source, or a live approved account, confirming Paddle accepts an Israeli
   individual seller — or a switch to Gumroad, the one rail in this repo with Israel | ILS on
   a rendered production source (`src/revenue/rails.ts:324`).
3. A costed answer to the GPL question: what exactly is being sold, given the buyer may
   lawfully redistribute the Pro code.

Even with all three closed, the line is a ₪200–500/month portfolio entry, not a ₪1,000 one.
