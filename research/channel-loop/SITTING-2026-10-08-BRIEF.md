# Brief for the Fable sitting of 8.10.2026 (~07:11 UTC): FABLE_QUEUE rows 26 and 27

**What this is.** Opus clerks gathered the evidence and point to it here: one facet for row 26 (the ledger's raw Gumroad
sale ids in the public repository) and one for row 27 (osek-patur's 2026 ceiling). Opus checkers then re-opened every
pointer with `sed -n`, `awk 'NR>=…'`, `grep -n -F` or `git show` against the tree at `88a1fd9` and corrected what had moved
or overreached. HEAD was the same at the start and the end of their reads, `git status --short` was empty both times, and
they wrote nothing: no edit, no git write, no network, no subagent. Row 26's checker read `state/colony/colony.db` twice:
the current file through `python3 -I` and sqlite3 on a read-only, immutable URI (its sha256 `7d46a1c8…`, mtime and size the
same before and after), and every past version from the git object store (`git rev-parse <commit>:state/colony/colony.db`,
`git cat-file blob`), each opened with `sqlite3.deserialize` in Python's memory, with the WAL header bytes patched in that
in-memory copy only. An Opus assembler wrote this file on `88a1fd9` [asm: in a worktree on `build/tick62-brief`, cut from
`origin/claude/new-session-j071dx` at that commit]. It re-opened every header pointer and a sample of more than twenty
others, and marks what it added or corrected **[asm]**. Nobody here rules or recommends. No web fetch was made for this
brief, no connector was called and nothing was created anywhere. [asm] The assembler's own code runs were read-only:
`activeSlugs()` from `scripts/freeze-capture.mjs`; `termsBarred()` from `scripts/render-watch.mjs`; one open of the
current `colony.db` on the same immutable URI (sha256 `7d46a1c8…`, as the checker's); and one in-memory open of its
oldest committed version (`a65a5b2`, 2026-09-07T17:13:52Z: 0 `revenue_ledger` rows and 0 `tool_calls` rows, as the
checker's).

**Grades.**
- `rendered`: a render-watch capture that a session read.
- `github`: code or docs read on GitHub at a pinned commit; where a note quotes GitHub, the note is the pointer ("github,
  via note"). `rendered via note`: a note quoting a capture; the note's line is the pointer.
- `snippet`: a search-engine snippet. The 7.9 SERP record adds a weaker grade of its own: where the search tool's summary
  asserts a fact, "it is reproduced in a blockquote and is **[SNIPPET] about a summary** — weaker still, because it is a
  model's paraphrase of pages neither it nor I opened" (`research/measurements/serp/2026-09-07-hebrew-calculators.md:24-26`).
- `repo`: our own code or notes. [asm] `repo (git objects)`: a past version read from the local object store, as of the
  last local fetch; no fetch was made.
- `inference`: reasoning, not a text, always marked. `none`: no source.

**Provenance marks.**
- `[against-bar]` (D1(1), `research/channel-loop/RULING-2026-09-30-video.md:27-31`) marks "every tiktok.com and gumroad.com
  capture". It is readable and citable at rendered grade for "(i) a question about our own compliance with that site's
  rules or with the law" and "(ii) a decision not to do something", and is not "an input to a product, a listing,
  content, a ranking or a line's growth" (`:29-31`). The checker graded row 26's Gumroad reads `[against-bar]`, D1(1)(i).
  The 6.10 robots ruling reads D1's "may not be quoted in anything public" as "the product, listing and content surfaces,
  not the research record's cited lines, which are quotations with the source named"
  (`research/channel-loop/RULING-2026-10-06-robots-and-terms.md:360-362`).
- `[robots-bar]` (decision 1(2), `RULING-2026-10-06-robots-and-terms.md:125-129`) marks the ten nevo captures, "the nine
  live slugs … and the frozen `nevo-vat-law-2026-09-29.*`": "The two D1(1) uses hold (our own compliance; a decision not to
  act); no re-fetch, no product input, no listing, content or ranking."
- **Frozen, live and trimmed.** `research/rendered/FROZEN.sha256` is 255 lines and holds no Gumroad entry, so every Gumroad
  capture is live: this brief describes them in words, with counts, and never cites them by line. None is trimmed:
  gumroad.com carries `"copying": "unread"` (`research/channel-loop/terms-verdicts.json:297-302`), and [asm] no Gumroad or
  nevo meta has a `trimmed` block (grep of the 13 Gumroad metas and the nevo metas). The one frozen capture this brief
  cites by line is the 29.9 nevo VAT-law copy, whose three files `FROZEN.sha256:112-114` records (the text file's sha256,
  `a8b0c841…`, is the last of the three); it is cited only to record where the figure stands, never as an input. Its live
  twin is described in words. nevo.co.il is `NO_TERMS` with `"copying": "unread"` (`terms-verdicts.json:514-520`).
- **Where the Gumroad bar is.** `TERMS_BARRED`'s first entry, `domain: "gumroad.com"` (`scripts/render-watch.mjs:522`).
  Its comment: "The Gumroad API is not a web page and is not fetched by this script" (`:514-515`). [asm] Run here,
  `termsBarred("api.gumroad.com")` returns the gumroad.com entry, and `termsBarred()` returns `null` for `www.nevo.co.il`,
  `www.gov.il`, `www.kolzchut.org.il` and `capitax.co.il`. VIDEO-RULING D2(ii) keeps the API outside the bar (Part C).

**Short names.**
- Rulings under `research/channel-loop/`: `REFUND-RULING` is `RULING-2026-10-05-refund-state.md` (the row-20 ruling);
  `ROBOTS-RULING` is `RULING-2026-10-06-robots-and-terms.md`; `VIDEO-RULING` is `RULING-2026-09-30-video.md` (16(d), D1, D2);
  `T1-RULING` is `RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md`.
- Row 26's code: "the connector" is `src/revenue/connectors/gumroad.ts`; "the ledger" is `src/revenue/ledger.ts`; "the tick
  workflow" is `.github/workflows/colony.yml`; `schema.ts` is `src/state/schema.ts`; `tools.ts`, `heartbeat.ts`, `money.ts`,
  `measurements.ts`, `runner.ts` and `dashboard.ts` are under `src/revenue/`; `colony.ts` is `scripts/colony.ts`; the
  revenue tests are under `src/__tests__/revenue/`.
- Row 27's files: "the config" is `products/il-biz-tools/src/config/osek-patur.json`; "the page" is
  `products/il-biz-tools/osek-patur.html`; in Part B, `README.md` is `products/il-biz-tools/README.md`, and `publish-gate.js`,
  `source-line.js`, `build-site.js` and the `tests/` files are il-biz-tools'. "The SERP record" is
  `research/measurements/serp/2026-09-07-hebrew-calculators.md`. `JUDGEMENT.md` is `research/owner-docs-audit/JUDGEMENT.md`.
- A bare capture name is `research/rendered/<name>`.

**Who reads what.** The row-26 decider reads Parts A and C. The row-27 decider reads Parts B and C. Both read the header
blocks: this one, the standing rules and the links.
- **The seats.** Row 26 is "one decider (the next free seat: 6.10 and 7.10 hold two rows each, so 8.10 ~07:11, or a
  main-thread Fable amendment as on 4.10)" (`logs/FABLE_QUEUE.md:50`). Row 27 is "one decider (8.10 ~07:11, beside row 26)"
  (`:51`). The schedule reads "8.10 ~07:11 row 26 (the ledger's raw sale ids), unless a main-thread Fable amendment settles
  it earlier" (`logs/CHANNEL_LOOP.md:26`). [asm] That line names row 26 alone. Tick 62's plan names both rows and this file,
  and says the brief is "not yet built" (`CHANNEL_LOOP.md:457`); `:427` and `:473` carry the row-26 seat too.
- **The outputs.** Both write "a ruling in `research/channel-loop/`". Row 26 folds "into
  `src/revenue/connectors/gumroad.ts`, the ledger tests, `CHANNEL_LOOP.md` §3" (`FABLE_QUEUE.md:50`). Row 27 folds "into
  `products/il-biz-tools/src/config/osek-patur.json`, the page and its tests" (`:51`).
- **The statuses.** Row 26: "queued 5.10 (tick 46, from row 20's ruling); `enable` waits on it". Row 27: "queued 6.10
  (tick 54, from row 21's ruling "Not decided" 1)".
- **The rows' own pointers.** Row 26's all hold (Part A). Row 27's all hold: `osek-patur.json:3` is `"ceiling": 122833`,
  `README.md:57` is the ceiling's row, decision 1 is `ROBOTS-RULING:121-160` and "Not decided" 1 is `:422-424`, and D1 is
  `VIDEO-RULING:24-64` (Part B).

**Standing rules (repo).**
- **MISSION first.** `MISSION.md` is read before anything else (`CLAUDE.md:4`). The owner's brief, verbatim: "בדרכים אני
  לא רוצה ולא אצטרך לעשות כלום — זה רק אתה." (`MISSION.md:11`) and "אני לא מדבר עם אנשים. יש לך את כל האישורים. אני רוצה
  דרכים בלי שאני צריך אישור של עורך דין" (`:12`).
- **The sitting.** At most 2 agents (`CHANNEL_LOOP.md:51`).
- **Money means the ledger.** Rule 2 is at `MISSION.md:442-445` (heading `:442`): "A shekel counts when it is recorded in
  `revenue_ledger` with a platform transaction id. Projections, forecasts and "expected" revenue are never revenue."
  (`:443-444`). The same rule elsewhere: money counts "when it arrives in the ledger with a transaction id"
  (`:269-270`); "money still counts only in the ledger, with a transaction id" (`:317-318`); "The first transaction id in
  the ledger is worth more than the next ten ceilings" (`:190-191`).
- **Auditors re-derive.** "auditors re-deriving supervisor decisions from the raw ledger", with decisions in code "so any
  auditor can recompute them from the same numbers and catch drift" (`MISSION.md:448-451`, rule 3 at `:447-452`). The
  manager's view "must be **derived from the ledger and the repo**, never hand-written" (`:49`, in `:47-52`).
- **Honest value.** Rule 4, "Honest value only — this outranks the target" (`MISSION.md:454`): "No spam, no scams, no fake
  reviews, no manipulation, no ToS violations, nothing that deceives a buyer." (`:455-456`).
- **The owner's name and the repository.** "**Nothing we publish carries the owner's name, username, or personal
  identifiers.**" (`MISSION.md:276`). "What cannot be anonymised" opens at `:296`; its item 3 is "**The repository, while
  it lives under his personal account.** … Moving the repo to an organisation is the fix and it is his to make"
  (`:304-306`). "the brand is the only public face" (`:310`).
- **One platform.** "One rail failing, one platform banning us or one market drying up must not be able to take the company
  down." (`MISSION.md:44-45`).
- **Buyers' privacy.** [asm, counts re-run] "privacy" and "personal data" count 0 in `MISSION.md`, and "privacy" and "buyer"
  count 0 in `constitution.md` (`grep -c -i -F`). REFUND-RULING: "no file states a privacy rule for buyers; this ruling
  derives one below" (`:46-47`); the derived rule is at `:215-219` (A(0)).
- **Never** (`CHANNEL_LOOP.md:74-86`): "a fetch of any tiktok.com or gumroad.com page, or of a site whose terms are unread or
  refused (ruling 30.9 16(d), …); a keyed API call to a host whose API terms are unread (ruling 7.10 row 24 (b), …)" (`:79`).
- **Caps.** Built-but-unlaunched "**6/6 — binding**", il-biz-tools among the members (`CHANNEL_LOOP.md:108`).
- **The open owner decision.** "**A decision still open:** item 8 of the old list. The repo is public, and its history on
  main carries the owner's real name and personal email as the merge author. Choose one: make it private (Actions minutes
  become metered, possibly a cost) or accept the exposure knowingly." (`CHANNEL_LOOP.md:255-257`).

**Links between the two rows. Read these before ruling.**
1. **One sitting, two agents.** The cap is 2 (`CHANNEL_LOOP.md:51`); rows 26 and 27 sit together (`FABLE_QUEUE.md:50-51`).
2. **[asm] Both are il-biz-tools rows.** Row 26 holds `enable`, the Pro sale: "**`enable` now waits on the ledger's sale ids
   (FABLE_QUEUE row 26)**" (`CHANNEL_LOOP.md:134`). Row 27 is a figure on a free page that ships with the same site, gated
   per page on its config's `verified` (`publish-gate.js:72`, `:210`). [inference] Neither row's question names the other's
   files.
3. **[asm] Both read rule 4.** REFUND-RULING derives its buyer rule as "inference from rule 4 and from the workflow's hygiene
   rule" (`:218-219`). The il-biz-tools README reads "MISSION rule 4 (honest value only)" as "never publish an unverified
   legal figure" (`README.md:91`).
4. **[asm] Both run through the public repository.** Row 26's exposure is the committed `colony.db` (A(0)). Row 27's figure
   is public through tracked source files: the built `_site/` is gitignored (`products/il-biz-tools/.gitignore:4`) and no
   site is deployed (B(0)). The repository's visibility is the open owner decision above (`CHANNEL_LOOP.md:255-257`).

---

## Part A — Row 26: the ledger's raw Gumroad sale ids in a public repository (`FABLE_QUEUE.md:50`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:50`): "`src/revenue/connectors/gumroad.ts:52-58`,
`src/revenue/ledger.ts:421-442`, `.github/workflows/colony.yml:83-104`, `.gitignore:6-8`, `MISSION.md:442-444`,
`research/channel-loop/RULING-2026-10-05-refund-state.md` §6 item 5 and §8 item 12".

**The row's question, verbatim** (`FABLE_QUEUE.md:50`): "The hourly tick commits `colony.db` to the public repo and the
connector books every buyer's raw Gumroad `sale.id` as `external_id`: the exposure row 20 closed for refund retries, for
every sale. (i) `sha256(sale.id)` as `external_id` (idempotence kept; an auditor with the token re-derives it); (ii) stop
committing `colony.db` (against `.gitignore:7`'s rule); (iii) accept, if the repo goes private. Does a digest satisfy rule
2's "platform transaction id"? `enable` waits on it."

**[asm] The labels.** The row labels its three options (i)-(iii). This brief gives each its own section, A(i) to A(iii),
and the question after them its own, A(q). A(0) is what exists today, which all four read.

**The row's own pointers, re-opened.** All hold.
- `gumroad.ts:52-58`: the sale, refund and fee entries.
- `ledger.ts:421-442`: the doc comment and the refusal. The throw runs to `:445`. The lookup is `:487-492`, so
  REFUND-RULING's `:490-491` holds.
- `colony.yml:83-104`: the commit step. The failure exit is `:105-106`.
- `.gitignore:6-8`: `:7` is the comment and `:8` the negation.
- `MISSION.md:442-444`: rule 2's heading and sentence.
- REFUND-RULING §6 item 5 is `:356-369`; §8 item 12 is `:466-477`.
- `CHANNEL_LOOP.md:134` is in §3, which runs `:117-141`.

### A(0) The exposure today (repo unless marked)

**What the connector books.**
- **The sale.** `externalId: String(sale.id)` (`gumroad.ts:52`). When `sale.refunded === true`, a second entry with
  `` `${sale.id}:refund` `` (`:53-55`). When `gumroad_fee > 0`, a third, kind `cost`, with `` `${sale.id}:fee` ``
  (`:56-59`).
- **The call.** `GET https://api.gumroad.com/v2/sales?access_token=…&after=<day>` (`:35`), reading `res.body.sales` (`:37`,
  `:42`).
- **What else an entry carries.** `lineId`, `kind` and `source` (`:52`); the price (`:49`), the currency (`:50`),
  `occurredAt` (`:51`) and `note: sale.product_name` (`:52`). The refund and fee entries carry the fixed notes "refunded"
  and "gumroad fee" (`:54`, `:58`). `fetchSince` reads no buyer field.
- **Gumroad's own field.** The header (`:8-18`) quotes Gumroad's source for `created_at`, `product_id: link.external_id`,
  `refunded`, `partially_refunded`, `chargedback` and `disputed` (`:10-14`), and not the sale's `id`. The 5.10 brief:
  "`purchase.rb#as_json`'s `id` field is quoted nowhere: `src/revenue/connectors/gumroad.ts:10-18` quotes the other fields
  only" (`research/channel-loop/SITTING-2026-10-05-BRIEF.md:672-675`).
- **Every sale on the account.** `isConfigured` is `Boolean(env.GUMROAD_ACCESS_TOKEN)` (`:28`). `fetchSince`'s call has no
  product filter (`:35`), and an unmapped product is still booked under `UNASSIGNED_LINE_ID` (`:44-45`). The refund-rate
  read does filter: `readProRefundCount` passes `product_id` (`:232`) and keeps the sales in memory only, to count them
  (`:238-240`). [inference] Every sale on the account enters the ledger, whatever the product. pcn874 uses "the same account
  il-biz-tools uses" (`state/colony/REPORT.md:64`, a file regenerated hourly).
- **The KPI holds no id.** The refund-rate unit carries counts, `gumroad:${productId}` and the window (`gumroad.ts:154-160`).
  "`product_id` is the product's public external id and is safe to ship in page source"
  (`research/measurements/gumroad-native-licenses.md:72-73`; the note's own grade is github, via note).

**What the ledger does with the id.**
- **The key.** "Idempotent on (source, externalId): a second call with the same pair returns null instead of
  double-counting." Then: "MISSION rule 2: a shekel counts when it is recorded with a platform transaction id. So money in
  — and refunds out — must carry one. Without it an entry is unverifiable AND undeduplicated" (`ledger.ts:421-426`).
- **Who must carry one.** `PLATFORM_MEDIATED_KINDS` is sale, subscription, payout and refund, which "always have a
  transaction id on the other side"; `cost` is the exception (`:414-418`). The refusal: "money only counts when it carries
  the platform's transaction id (MISSION rule 2). Without one the entry cannot be verified against the platform and cannot
  be deduplicated" (`:440-445`).
- **The lookup.** A chain id is looked up across sources; any other by `source = ? AND external_id = ?` (`:487-492`). The
  comment: "Any other id is a platform's own, unique within that platform." (`:486`). The index is `(source, external_id)
  WHERE external_id IS NOT NULL` (`schema.ts:726-727`); the column's comment, "idempotency key from the source" (`:720`).
- **Chain ids.** EVM `^0x[0-9a-fA-F]{64}$` and Solana base58 `{86,88}` (`money.ts:96-98`; `chainTxId` at `:104-109`). A
  chain id with money that is not USDC is refused (`ledger.ts:480-482`).

**Where the id can be read back.**
- **The auditor.** Its only external-id check is "duplicate external ids in the ledger" (`heartbeat.ts:613-619`); decisions
  are re-derived through `decideLine` (`:592`) and `auditDecision` (`:597`). `grep -rn -F "/v2/sales/" src/` finds nothing;
  the only `v2/sales` calls are `gumroad.ts:35` and `:234`.
- **The report and the dashboard.** `external_id`, `externalId` and "external" each count 0 in `dashboard.ts`, `portfolio.ts`
  and `status.ts`, and in `state/colony/REPORT.md` and `dashboard.html`; REFUND-RULING's "never displayed (no match in the
  report or dashboard code)" (`:363`). The agent's line tool lists recent ledger entries without the id (`tools.ts:157`).
  The duplicate messages do print it: `tools.ts:206` and `colony.ts:293`.
- **The hand-booking paths.** `external_id`: "Platform transaction id (idempotency key)…" (`tools.ts:176`), passed through at
  `:202`; the tool's description adds "Always pass external_id (platform transaction id) so re-recording is a no-op"
  (`:165`). The CLI: "--external-id <id>   Platform transaction id. REQUIRED for sale, subscription," … "money only counts
  when it carries the platform's id. Only a cost may omit it." (`colony.ts:107-109`); its refusal names "the platform's
  transaction id" (`:275-279`); the id passes through at `:288`.
- **A second table.** `tool_calls` stores `arguments` and `result` (`schema.ts:39-48`; insert at `src/state/database.ts:184`).
  `revenue_record`'s arguments carry `external_id` (`tools.ts:176`) and its duplicate result prints it (`:206`). The CI
  tick runs no agent (`colony.yml:7-9`, `:73-75`). [inference] An agent writing turns into this database would carry a
  hand-booked id.

**The commit.**
- **Hourly.** `cron: "17 * * * *"` (`colony.yml:23`), with the comment at `:21-22`. It "commits the resulting state and
  report back, so the owner can read every decision in the git history" (`:3-5`). "THIS DOES NOT RUN UNTIL IT IS ON THE
  DEFAULT BRANCH … Verified 2026-09-03" (`:11-16`). [checker] `git branch -a --contains ac637a3` lists
  `remotes/origin/main` (local refs, no fetch): the tick's last state commit is on main.
- **Its secret and its rights.** `GUMROAD_ACCESS_TOKEN: ${{ secrets.GUMROAD_ACCESS_TOKEN }}` (`:62`); `permissions:
  contents: write` (`:31-32`).
- **The step.** "# -f because .gitignore's *.db rule would otherwise skip the database." (`:83`); `git add -f state/colony`
  (`:87`); the commit (`:93-95`); the push with three rebase retries (`:97-104`); `exit 1` (`:105-106`). `fetch-depth: 0`
  (`:43-46`); there is no cache or artifact step (`:39-113`). [inference] `colony.db` reaches the next run only through this
  commit.
- **The ignore rule.** `*.db` (`.gitignore:6`); "# The colony's own state is the audit trail the owner reads; it must be
  versioned." (`:7`); `!state/colony/colony.db` (`:8`). [inference] `:8` already un-ignores the file, so `colony.yml:83`'s
  reason for `-f` describes a rule that `:8` overrides.

**What is there today** (repo; repo (git objects) for the past versions).
- `git ls-files state/colony` lists six files: `REPORT.md`, `colony.db`, `dashboard.html`, `measurements/algora-supply.json`,
  `page-view-clock.json` and `prize-intake.json`.
- The branch has 152 colony-bot commits; 70 are "colony tick" summaries, and all 70 read "30d ₪0.00". `colony.db` last
  changed in `ac637a3`, 2026-10-07T07:12:47Z.
- [checker] `git log --all -- state/colony/colony.db` gives 80 commits and 80 distinct versions, from 2026-09-07T17:13:52Z to
  2026-10-07T07:12:47Z. Every one, opened in memory, has 0 `revenue_ledger` rows, 0 non-null `external_id` and 0
  `tool_calls` rows.
- The current file: `revenue_ledger` 0 rows, 0 Gumroad rows, with the columns id, line_id, kind, amount_minor, currency,
  amount_agorot, source, external_id, occurred_at, recorded_at, note and unconverted; `tool_calls`, `event_stream` and
  `turns` 0 each; `revenue_kpi_snapshots` 5 rows (`claimableBounties` ×4, `claimableBountiesStruck` ×1). This agrees with
  "`revenue_ledger` holds 0 Gumroad rows" (REFUND-RULING:50). [asm: a checker wrote that `kv` holds only
  `revenue.connector_cursor.x402`. `kv` holds 138 keys; that is the only connector cursor among them, so no Gumroad cursor
  exists. `revenue.gumroad_refund_rate.last_read` reads `not_configured`.]
- "Gumroad Pro refund rate: not configured — GUMROAD_ACCESS_TOKEN is not set" (`state/colony/REPORT.md:52`).

**The other connectors.** Stripe books `String(tx.id)` and `` `${tx.id}:fee` `` (`src/revenue/connectors/stripe.ts:48`,
`:60`, `:72`), with `note: description` (`:50`, `:74`). Lemon Squeezy books `String(order.id)` and `` `${order.id}:refund` ``
(`src/revenue/connectors/lemonsqueezy.ts:41`, `:43`). Both are gated on their keys (`stripe.ts:14`;
`lemonsqueezy.ts:14`), and the tick passes both keys (`colony.yml:61`, `:63`). [inference] A fold that changes Gumroad
only leaves them raw. Row 26 names Gumroad only.

**What a sale id gives a stranger** (REFUND-RULING §2.4, `:137-160`; github via log where marked).
- **The reading of record.** It is the fixer's paraphrase of Gumroad's controllers, graded "(github via log; fixes log
  `:53-56`)" (`:139`), and the ruling says "**This ruling rests on that reading and goes no further.**" (`:145`).
- **With the email.** The receipt route needs the buyer's email as well (`:151`). With it, the receipt carries "the price,
  the policy and the **licence key**" (`:193-194`; the key at `:146-150`).
- **Alone.** Not a refund and not a licence check (`:156-157`).
- **The threat model** (§3, `:181-219`). "private" is "a state that can end, and history does not un-publish" (`:187`).
  The buyer's harm: "a purchase and a refund request they made in private become a public, timestamped record"
  (`:199`).
- **The rule the 5.10 ruling derived** (`:215-219`): "No identifier of a buyer or of a buyer's purchase leaves the
  responder's memory into anything a third party can read: not a committed file, not stdout, not a step summary." It is
  worded for the responder, and marked "inference from rule 4 and from the workflow's hygiene rule, … not a quotation"
  (`:218-219`).
- **How row 20 applied it.** `\Flagged` and "Nothing is written to disk" (`:268-281`); "No sale id in anything printed"
  (`:308-312`), ending "the repo's visibility is an open decision the responder must not depend on" (`:311-312`). In code:
  `WAITING_FLAG = "\\Flagged"` (`scripts/brand_mail.py:210`); the `SALE_REF` comment, "A sale id is the index to a buyer's
  receipt, so no line carries it out." (`:220-222`); `waiting`, "this run's memory only, never printed" (`:1347`); the
  responder job, "# It changes mail flags and Gumroad sales, never the repository." with `contents: read`
  (`.github/workflows/brand-mail.yml:268-270`). The file is 318 lines, and "brand-mail: refund balance retries" has 0
  matches in it. Row 20 was "Folded tick 46 (merge `8f43a6a`)" (`FABLE_QUEUE.md:44`). `0efc16c` (2026-10-05T07:57:21Z, "…the
  --sale mode is retired") removed `refundSaleById`, which has 0 matches in `gumroad-pro-product.js`.

**What `enable` waits on.**
- **In the 5.10 ruling.** §6 item 5 (`REFUND-RULING:356-369`). "**NEW, and it blocks …**" (`:356`). The **RULING**
  sentence: "`enable` does not open the sale while the tick would commit raw Gumroad sale ids into a public repository."
  (`:359-360`). Its grounds (`:361-363`): `external_id` is the idempotency key `(source, external_id)`, "required for every
  platform-mediated kind", checked by the heartbeat, and never displayed. The leading route is `:364-366` (A(i)); the
  sitting's reading is `:367` (A(q)); the private case is `:368-369` (A(iii)). Steps 8, 3, 6 and 2 and the agent's own
  dispatches are still in front of `enable` (`:345-355`); its step-6 pointer is "(`REPORT.md:52`, `:61`)" (`:350`).
- **In the queue row's birth.** §8 item 12 (`REFUND-RULING:466-477`). Its bold sentence for `CHANNEL_LOOP.md:134` ends
  "**`enable` now waits on the ledger's sale ids (new FABLE_QUEUE row)**". The question it writes matches `FABLE_QUEUE.md:50`
  except that the ruling puts 'platform transaction id' in single quotes; its inputs end "this ruling §6 item 5", and the
  queue row adds "and §8 item 12". §9: "§6 item 5's queue row may, after its own sitting, return one question to §6; it is
  not asked here." (`:487-489`).
- **In the loop.** `CHANNEL_LOOP.md:134` (§3) holds the bold sentence; `:308` (§8) words it differently, "`enable` now
  waits on row 26 (the ledger's raw sale ids)".
- **In code.** `enableProduct` (`products/il-biz-tools/scripts/gumroad-pro-product.js:621-656`; [asm] the function line is
  `:627`, its doc comment `:621-626`) checks the product id (`:628-629`), a green mailbox (`:630-638`), the responder
  (`:639-650`) and `checkOffer` (`:651`), then calls `PUT /products/<id>/enable` (`:652`). "row 26", "colony.db" and
  "external" have no match in the file. "enable" has no match in `gumroad.ts`; `isRevenueColonyEnabled` and
  `setRevenueColonyEnabled` (`ledger.ts:165-173`, read at `runner.ts:288`) are unrelated.

**What Gumroad's own texts say** (rendered, `[against-bar]`, D1(1)(i); live, described in words).
- `gumroad-terms` (fetchedAt 2026-09-29T11:31:31.974Z, 614 lines): "sale id", "sale_id" and "/sales/" count 0, and so do
  "purchase id", "order id" and "transaction id" (case-insensitive). "confidential" counts 2 lines: the Feedback clause and
  the arbitration-materials clause. "personal information" counts 1: sellers whose Products contain other people's
  personal information. "privacy" counts 10 lines; one is a bare "Privacy Policy" heading pointing to a separate policy no
  capture holds, one a prohibited-content clause naming content "invasive of another's privacy", and the rest concern
  third-party accounts' personally identifiable information. Nothing speaks to a sale or purchase id, or to a seller
  publishing one.
- `gumroad-api-docs` (fetchedAt 2026-09-29T13:02:19.928Z) is 4 bytes, "API" and a newline. `gumroad-help-receipt`,
  `gumroad-help-invoice` and `gumroad-help-supporting-customers` are 55, 40 and 48 bytes: shells.
- None of the 13 Gumroad stems' `.txt` or `.html` files matches sale id, sale_id or sale.id (`grep -l -i`).
- The verdict: gumroad.com `BARRED`, sourced to `TERMS_BARRED`, checked 2026-09-29, `"copying": "unread"`
  (`terms-verdicts.json:297-302`).

**The tests and the mutation plans.**
- `external_id` (snake case) appears in `budget.test.ts`, `loop.test.ts` and `usdc-unconverted-review.test.ts`; with
  `externalId`, nine test files match.
- The only test that drives the connector is `loop.test.ts:239-252`. It feeds one fake sale (`:246`) and asserts `recorded`
  is 2 (`:249`), `unmapped` is `["gumroad:p1"]` (`:250`) and kv `revenue.unmapped_products` contains `gumroad:p1` (`:251`).
  It does not assert the id or its suffixes. `sale.id` appears in no test.
- Gumroad ids booked by hand in tests: `loop.test.ts:119`, `budget.test.ts:68`, `gumroad-refund-rate.test.ts:353`.
  Idempotence: `ledger.test.ts:84-98`. The required id: `ledger.test.ts:192-210`.
- `src/__tests__/revenue/mutations/` holds 19 plans; none names `connectors/gumroad` or `ledger.ts`.

### A(i) `sha256(sale.id)` as `external_id`

**The route as the 5.10 ruling put it** (`REFUND-RULING:364-366`): "**book `sha256(sale.id)` (hex) as `external_id`, and
`…:refund` / `…:fee` off the same digest.** Idempotence is kept; an auditor holding the API token re-derives every digest
from `GET /v2/sales`; a stranger cannot reverse a digest of an id with the entropy of the shape at
`gumroad-pro-product.js:921` [inference]."

**Each clause against the code.**
- **"Idempotence is kept."** The key is `(source, external_id)` (`ledger.ts:421-422`, `:491`; `schema.ts:726-727`).
  [inference] A digest that is the same for the same id on every run keeps that key; an unsalted sha256 is.
- **Chain ids.** [inference] A bare 64-hex digest matches neither chain pattern (`money.ts:96-98`) and books as a platform
  id; written with `0x` it would match the EVM pattern and be refused for USD (`ledger.ts:480-482`).
- **The hand-booking paths.** `tools.ts:165`, `:176`, `:202` and `colony.ts:107-109`, `:288` take the id as given.
  [inference] A digest applied only in the connector would not deduplicate against a raw id booked by hand; applied in
  `recordLedgerEntry` for source `gumroad`, both paths would agree.
- **"an auditor holding the API token re-derives every digest".** No code calls `/v2/sales/`, and the auditor checks only
  duplicates (`heartbeat.ts:613-619`). MISSION's auditors re-derive "from the raw ledger" (`MISSION.md:449`).
- **"cannot reverse … the entropy of the shape at `gumroad-pro-product.js:921`".** Marked inference by the ruling. Line
  `:921` of the 1,055-line file is blank today, and the example the ruling quotes at `:82` (not repeated here) matches
  nothing in the code; the `--sale` mode that printed it was retired in `0efc16c`. The nearest shapes now in code:
  `BALANCE_LINE` (`brand_mail.py:214`) and `RETRY_RESULT` (`:218`), both `[A-Za-z0-9_=+-]{1,128}`, and `SALE_REF` (`:222`),
  `[A-Za-z0-9_=+%-]+`. [asm] The refund tests' fixture ids carry `=` and `==` endings (`scripts/tests/
  test_brand_mail_refunds.py:866`, `:890`); they are fixtures, not Gumroad's text.
- **What the digest hides from whom.** "What no file holds" 5 (Part C): whether someone who already holds candidate ids, a
  buyer with their own receipt for one, can match an unsalted digest.

**What the option touches** (pointers only).
- Code: `gumroad.ts:52`, `:54`, `:58`; `ledger.ts:414-430`, `:440-445`, `:485-492` (comment `:486`); `schema.ts:720`,
  `:726-727`; `money.ts:96-109`; `tools.ts:165`, `:176`, `:202`, `:206`; `colony.ts:107-109`, `:275-279`, `:288`, `:293`;
  `heartbeat.ts:613-619`. The other connectors are under A(0).
- Tests: `loop.test.ts:239-252` pins no id; no mutation plan covers `gumroad.ts` or `ledger.ts`.
- Rules: `MISSION.md:442-445` and `:447-452`; `REFUND-RULING:364-367`.
- The fold the row names: "`src/revenue/connectors/gumroad.ts`, the ledger tests, `CHANNEL_LOOP.md` §3"
  (`FABLE_QUEUE.md:50`).
- [inference] No row in any committed version holds a Gumroad id (A(0)), so no stored row would need a new form.

### A(ii) Stop committing `colony.db`

**The rule it goes against.** `.gitignore:7`: "# The colony's own state is the audit trail the owner reads; it must be
versioned." with `!state/colony/colony.db` at `:8`. The tick workflow's purpose: it "commits the resulting state and report
back, so the owner can read every decision in the git history" (`colony.yml:3-5`), through `git add -f state/colony`
(`:87`).

**What depends on the commit.**
- **The next run.** There is no other store between runs: `fetch-depth: 0` (`colony.yml:43-46`) and no cache or artifact
  step (`:39-113`). [inference] Without the commit, the next run starts from no database.
- **The measurement jobs.** They "do not open `colony.db`, because the hourly tick commits that binary file too and two
  writers would race over it" (`measurements.ts:4-7`). "Each measurement is recorded once: the file's own `measuredAt` is
  remembered in kv" (`:9-10`). The runner says the same (`runner.ts:340`).
- **The dashboard.** Its footer says every number on the page comes from `state/colony/colony.db`, with no field that can
  be filled by hand (`dashboard.ts:301`, in Hebrew).
- **The rules.** The manager's view "must be **derived from the ledger and the repo**" (`MISSION.md:49`); auditors
  re-derive "from the raw ledger" (`:449`).
- **The rest of the directory.** [inference] The step stages the whole `state/colony` directory (`colony.yml:87`), so the
  other five tracked files would still be committed unless the step changes too.

**Around the option** [asm].
- **A workflow artifact is not private on a public repository.** The 6.10 ruling's amendment 1 accepts that "anyone with
  read access to a repository can download its workflow artifacts, and on a public repository every signed-in user has read
  access" (`ROBOTS-RULING:436-438`). [inference] An artifact used as the state store between runs would be readable in the
  same way.
- **History.** "**Git history keeps the earlier bytes;** whether to rewrite public history is the owner's, listed with the
  §6 public/private decision" (`ROBOTS-RULING:345-347`). The 80 committed versions of `colony.db` hold no ledger row (A(0)).
- **The YouTube read-back's parallel.** Tick 61 queued, for the YouTube Data API read-back, "no raw values in the public
  repository (an Opus build on the read-back's state …, raw fields never committed …)" (`CHANNEL_LOOP.md:395`). It is an
  Opus build under another platform's terms, not a ruling on this database.

### A(iii) Accept, if the repo goes private

**The decision it waits on.** "**A decision still open:** item 8 of the old list. The repo is public, … Choose one: make it
private (Actions minutes become metered, possibly a cost) or accept the exposure knowingly." (`CHANNEL_LOOP.md:255-257`).
- **Two consequences recorded there.** "GitHub's terms allow our research reading only while it is published open access
  (`TERMS-AUDIT-2026-09-29.md:25`), so a private repo makes github.com CONDITIONAL_UNMET and closes the GitHub-hosted route
  every barred or refusal-type site depends on"; and "a private repo also meters the colony's own hourly workflows, so
  "private" is choosable only after step 7, with the organisation's $0 budget created and read" (`:257`).
- **The terms clause.** "Researchers may use public, non-personal information from the Service for research purposes, only
  if any publications resulting from that research are open access" (`research/channel-loop/TERMS-AUDIT-2026-09-29.md:25`,
  also `:264`; github, via note).
- **Step 7's fence.** "Step 7's sitting gains the organisation's ₪0 fence for the open repo-visibility decision"
  (`src/revenue/owner-steps.ts:106-108`), and step 7's `unlocks` text (`:368`).
- **Whose decision.** `MISSION.md:304-306`: moving the repo to an organisation "is his to make". ROBOTS-RULING "Not decided"
  4: "**The repo public or private**, and whether public history is rewritten: the owner's decision" (`:427-428`) [asm].

**How the 5.10 ruling weighed a private repository.**
- "private" is "a state that can end, and history does not un-publish" (`REFUND-RULING:187`).
- "**So a route that needs the repo to be private is a route that depends on an open owner decision**, and MISSION's
  constraint that one platform's action must not take the company down (`:44-45`) argues against building on it either
  way." (`:211-213`; `MISSION.md:44-45` confirmed).
- For the responder: "the repo's visibility is an open decision the responder must not depend on" (`:311-312`).
- For this row: "If the owner's open decision makes the repo private first (`CHANNEL_LOOP.md:239-241`), the block relaxes for
  as long as it stays private, and no further; this ruling does not ask for that decision." (`:368-369`). Its
  `CHANNEL_LOOP.md:239-241` is now `:255-257` (Part C).

### A(q) Does a digest satisfy rule 2's "platform transaction id"?

**Rule 2's own words.** "A shekel counts when it is recorded in `revenue_ledger` with a platform transaction id."
(`MISSION.md:443-444`). The 5.10 ruling hands the question over in these words: "The sitting that takes it reads
`MISSION.md:443-444`'s "platform transaction id" against a digest of one." (`REFUND-RULING:367`).

**What the code says rule 2 is for.** "So money in — and refunds out — must carry one. Without it an entry is unverifiable
AND undeduplicated, because the idempotency check has nothing to key on" (`ledger.ts:425-427`); "Without one the entry
cannot be verified against the platform and cannot be deduplicated" (`:443-444`). MISSION's auditors recompute "from the
same numbers" (`MISSION.md:450-451`).

**Other wordings near "platform transaction id"** (none says whether a digest qualifies).
- "the platform's transaction id" (`ledger.ts:442-443`).
- "Any other id is a platform's own, unique within that platform." (`ledger.ts:486`).
- "the platform's id" (`colony.ts:108-109`).
- "Platform transaction id (idempotency key)" (`tools.ts:176`).
- `docs/REJECTED.md:576-577` attributes to MISSION the words "in the ledger with a real platform transaction id"; MISSION.md
  has no "real platform transaction id" (`grep -c -F`, 0).
- The column: "idempotency key from the source" (`schema.ts:720`).

**What the id is, and is not, used for today.** It is the key of the duplicate check (`ledger.ts:487-492`) and of the
auditor's duplicate count (`heartbeat.ts:613-619`). It is not displayed in the report or the dashboard (A(0)), and no code
fetches a sale by it (`grep`, 0). Gumroad's own `id` field is quoted in no file (A(0)).

**Where the answer lands.** `enable` waits on this row (`FABLE_QUEUE.md:50`; `CHANNEL_LOOP.md:134`), and the row's fold names
the connector, the ledger tests and §3.

---

## Part B — Row 27: osek-patur's 2026 ceiling (`FABLE_QUEUE.md:51`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:51`): "`products/il-biz-tools/src/config/osek-patur.json:3`,
`products/il-biz-tools/README.md:57`, `research/channel-loop/RULING-2026-10-06-robots-and-terms.md` decision 1 and "Not
decided" 1, `research/channel-loop/RULING-2026-09-30-video.md` D1".

**The row's question, verbatim** (`FABLE_QUEUE.md:51`): "osek-patur.html shows a 2026 ceiling "verified against secondary
sources only" (a 7.9 search-summary read). On 6.10 osek-zair's 2026 cap left the product because its only source was a
`[robots-bar]` capture; osek-patur's figure rests on less. Does the primary-text rule (D1; the standard osek-zair holds
itself to) let a public product figure rest on a search summary, or does 2026 move to pending there too until a permitted
primary text is read?"

**[asm] The labels.** The row asks one question with two outcomes. This brief gives the question B(q), the first outcome
(the figure rests on the search summary) B(1) and the second (2026 moves to pending) B(2). B(0) is what exists today. Each
outcome's section lists what it touches; neither is weighed here.

**The row's own pointers, re-opened.** All hold. `osek-patur.json:3` is `"ceiling": 122833`. `README.md:57` is the ceiling's
row in "Verified figures and sources (September 2026)" (`:52`). Decision 1 is `ROBOTS-RULING:121-160`: 1(1) at `:122-124`,
1(2) at `:125-129`, 1(4) from `:134`, 1(6) at `:149-150`, the REOPEN at `:152-154` and "What this does not decide" at
`:156-160`. "Not decided" 1 is `:422-424`. D1 is `VIDEO-RULING:24-64`: its RULING `:26-44` (rule 1 `:27-31`, rule 2
`:32-33`, rule 3 `:34-39`, rule 4 `:40-44`), its BASIS `:46-61` and its REOPEN `:63-64`; D2 opens at `:66` [asm: the
spans re-counted].

### B(0) The figure today (repo unless marked)

**The config** (`osek-patur.json`).
- `"year": 2026`, `"ceiling": 122833`, `"warnBand": 0.85`, `"verified": true` and the Kol Zchut `source` (`:2-6`).
- `check`: `"on": "2026-09-07"`, `"how": "search"` and the SERP record as `record` (`:7-10`); the block closes at `:12`.
- The note (`:11`) begins "The only dated record is the search read of 7.9.2026:" and says "the search tool's summary stated
  122,833 and Kol Zchut was a result, but no result page was opened (the record says so), so this is a comparison with
  search results, not a read of the source." It adds "The README's 'Verified figures and sources (September 2026)' lists the
  secondary sources (Kol Zchut, Bizportal, mako, CPA circulars) without a dated record.", that no gov.il page has been read
  and Kol Zchut answers the runners with 403, and ends "A dated read of a primary page (note §8.1 N13) turns this into how:
  \"read\"."

**Its history** (repo).
- `a65a5b2` (2026-09-07T17:13:52Z) is one of twelve root commits (`git log --max-parents=0`) and the first to hold the file.
- `c9b8fad` (2026-09-29T00:02:23Z) first added a dated check: `checkedOn: "2026-09-07"` and a `checkedNote` saying the search
  "found the same 122,833 on page one" and already "Kol Zchut answers the runners with 403 (render of 28.9.2026)".
- `bfdf7b7` (2026-09-29T00:41:45Z) replaced it with today's `check` block and `"how": "search"`. The file at `88a1fd9` is
  byte-identical to the one at `bfdf7b7` (`git diff bfdf7b7 88a1fd9 --` on it is empty).
- Between them, nevo's sentence came and went: `b6e1d64` (2026-09-29T13:19:45Z) is the nevo commit, and `1b88919`
  (2026-10-06T07:59:31Z) changes only the `note` line here, removing "Beside Kol Zchut: nevo's consolidated text of the VAT
  law, current to 13-07-2026 and rendered on 29.9.2026, states the same 122,833 (…:93 …) - a publisher's consolidation, not
  the gazette, and not the source this page names." So "before 29.9" means before `b6e1d64`, not before 29.9 by the
  calendar. The tick-54 log's account is at `logs/2026-10-06-channel-loop-tick-54-osek-zair-2026.md:39`.

**The README's grades** (`README.md`).
- The ceiling: "verified against secondary sources only (Kol Zchut, Bizportal, mako, CPA circulars); no gov.il page
  rendered from here" (`:57`). The exact phrase "verified against secondary" appears nowhere else outside `node_modules`
  (`grep -rn -i -F`). The wording entered in `a260b22` (2026-09-27T08:33:29Z); in `a65a5b2` the line said "verified". The
  25.9 audit asked for it (`JUDGEMENT.md:121-122`).
- The other grades in the same table: the VAT rate and the allocation thresholds "verified" (`:56`, `:63`); the registrar
  amounts "**unverified — not published**" (`:64`); the registrar reduced-rate window "unverified against a primary source,
  **rendered anyway, labelled**" (`:65`); the osek-zair 2024-2025 caps "**read in a primary text** (third-party copy)"
  (`:66-67`); osek-zair's 2026 cap "**unverified**" and "never rendered or shipped" (`:68`).
- The source-line rule (`:78-86`): the ceiling and the VAT rate "rest on the search read of 7.9.2026 …, which opened no
  page - so they say "compared with search results", not "checked" (review of 29.9: the earlier "נבדק: 7.9.2026" claimed a
  read nobody made)" (`:78-81`); "A dated read of a primary page (note §8.1 N13) is what turns a line into "נבדק"" (`:82-83`);
  the stale-year label (`:84-85`); "Only verified configs get a line" (`:86`).
- `:91`: "MISSION rule 4 (honest value only), read here as "never publish an unverified legal figure"". Rule 4 itself is
  `MISSION.md:454-459`.

**What the page prints.**
- ₪122,833 in the title (`osek-patur.html:6`), the description (`:7`), `og:description` (`:10`), the FAQ JSON-LD (`:20`), the
  lead (`:53`), the remaining row (`:73`) and the FAQ (`:83`); `:20` and `:83` each end with the source line's words.
- The source line (`:54`): "מקור: כל זכות (מקור משני) · הושווה לתוצאות חיפוש: 7.9.2026", the words "כל זכות" a link to the
  `source` URL. It is static HTML: "Pure; the pages print the line statically" (`src/lib/source-line.js:15`), and a test holds
  it equal to `sourceLineHe(config)` (`tests/statutory-sources.test.js:120`).
- The stale-year slot (`osek-patur.html:55`), filled by the page script (`assets/page-osek-patur.js:12-16`) from `staleYearHe`
  (`source-line.js:62-66`).
- The module reads the config (`src/lib/osek-patur.js:2-6`). `trackOsekPatur` takes optional `opts.ceiling` and
  `opts.warnBand` (`:19-20`), and the page script passes neither (`page-osek-patur.js:2`, `:17`). "pending" counts 0 in all
  four files.

**The publish gate.**
- `'osek-patur.html': ['src/config/osek-patur.json']` (`src/lib/publish-gate.js:72`); the config's rule is `'verified'`
  (`:210`); `isVerified` is `config?.verified === true`, "Anything else fails closed" (`:93-96`).
- A page whose config is not verified ships as a withheld notice: title "… – לא מאומת" and `noindex` (`:142-159`, title
  `:149`, robots `:150`), built at `scripts/build-site.js:152-156`.
- The home page is copy, not a calculator (`publish-gate.js:67`, `:70`), and its card says "כמה נשאר עד תקרת ₪122,833 לשנת
  2026" (`index.html:78`). The build's rewrite steps run `build-site.js:158-191` (step 1c, the cancel links, `:187-191`).
  `figureSourceProblems` (`publish-gate.js:937` onward) checks the figures sentence, not the tool cards. The home page's note
  says each figure's source is on its tool's page, and a test locks the wording (`statutory-sources.test.js:167-169`).
  [inference] With the config unverified, the home card would keep ₪122,833 and the note would send readers to a notice
  page.
- `tests/ai-declaration.test.js:555-566` checks only the built index's "who builds the site?" answer and the AI declaration.

**The tests that lock today's state.**
- `tests/osek-patur.test.js:5-7`: "uses the 2026 ceiling of 122,833".
- `tests/statutory-sources.test.js`: the lines today (`:53-58`); each figure "a dated check, never in the future, backed by a
  record that carries the date and" the figure (`:81-96`), [asm] beginning `expect(c.verified).toBe(true)` (`:83`); `:98-102`;
  the page's line (`:115-137`); the home page holds "122,833" (`:166`); no page says "נבדק: <digit>" (`:172-174`).
- `tests/osek-patur-page.test.js:42-53`: the stale label stays hidden during the config's year.
- `tests/osek-zair-page.test.js:300-305`: while `osek.year === 2026`, osek-zair-unverified's 2026 cap must equal
  `osek-patur.json`'s `ceiling`; the note must not match `/nevo|Beside Kol Zchut/`; and it must end with `turns this into
  how: "read".`.
- `tests/osek-zair.test.js:144-145`: "The osek-patur rows keep their own 122,833 (the ruling's "not decided" item 1)".
- `tests/publish-gate.test.js:89-99`: osek-patur.html publishes with today's configs.

**Where else the figure appears.** `README.md:829`; `docs/INCOME_PLAN.he.md:115`, `:380`; `docs/OWNER_STEPS.he.md:167-168`
("אף עמוד ממשלתי לא נפתח מכאן, אז תאמת אותו"), `:177`. The tracked `docs/OWNER_STEPS.he.pdf` holds "122,833" twice, per
`research/channel-loop/RULING-2026-10-05-vat-services.md:186-188` (the checker did not re-open the PDF).

**Deploy state.** "The deploy waits on an owner click with no date" (`ROBOTS-RULING:185`); `terms-verdicts.json:816` says the
il-biz-tools URL is "not live until the site deploys"; step 5, the domain, is "Frozen by the ₪0 rule" (`CHANNEL_LOOP.md:255`
[asm: a checker gave `:254-255`; `:254` is blank]). `_site/` is gitignored (`products/il-biz-tools/.gitignore:4`).
[inference] The figure is public today through the tracked source files (`osek-patur.html`, `index.html:78`, `README.md`,
`docs/OWNER_STEPS.he.md` and its PDF, `docs/INCOME_PLAN.he.md`), not on a live site.

### B(q) Does the primary-text rule let a public product figure rest on a search summary?

**Where "the primary-text rule" is written.**
- `VIDEO-RULING` has no "primary" (`grep -c -i`, 0). D1 rules on captures already made: an `[against-bar]` capture "may not
  be an input to a product" (`:30`), and rule 2's `[no-terms]` was "Vacated as to nevo 6.10" (`:32-33`). It says nothing
  of search summaries.
- `osek-zair.json:3`: "Only tax years whose cap a primary text states are in `years`".
- `logs/2026-09-29-osek-zair-2026.md:125-130` (Hebrew): the rule "ערך יוצא מהקובץ רק כשטקסט **ראשי** מרונדר מציין אותו" (a
  value leaves the file only when a rendered **primary** text states it), and the 29.9 nevo use recorded as an exception
  to it.
- `ROBOTS-RULING` 1(6): "**A second recorded exception is not the loop's to grant.** The primary-text rule stands as
  written; the 29.9 exception was the first and is now undone by its own source's bar." (`:149-150`). [inference] The row's
  "D1" may mean ROBOTS-RULING's decision 1; its 1(6) is the only ruling text that names "the primary-text rule".
- "Not decided" 6: wikisource may never "stand in for a primary text" on a product page "by the loop alone; the
  primary-text rule stands, and corroboration beside a primary text is its only product use" (`ROBOTS-RULING:431-432`).

**What the 6.10 ruling said about this figure.**
- "Not decided" 1 (`:422-424`): "a public figure resting on a 7.9 search-summary read. Not in this row; it fails the
  standard osek-zair holds itself to, and the main thread should queue it as its own row rather than let decision 1 appear
  to have blessed it."
- "What this does not decide" (`:156-160`): the figure "rests on a 7.9 search-summary read, not on nevo …; removing the nevo
  sentence leaves it as it was before 29.9. Whether a figure of that grade may stay on a public page is a question of its
  own".
- Its reasoning on osek-zair's 2026 cap, option 4: "D1(1) says an against-bar capture "may not be an input to a product"
  (`:30`). The 2026 cap is a product figure on a public page for people computing their tax. The one honest reading of D1 is
  the one that costs the product a year." (`ROBOTS-RULING:117-119`).

**The grade of the read the figure rests on** (the SERP record; repo about snippet-grade data).
- "No result page was opened: this is a SERP measurement, not a content study" (`:14-16`). The legend is `:21-26`; "There is
  no RENDERED grade anywhere in this file and nothing in it may be upgraded to one by a later reader" (`:22-23`).
- "The instrument returns no snippets. It returns a title and a URL per result, plus one synthesised summary of the whole
  set." (`:35-36`). In Q1, Kol Zchut is result #1 with "none returned" (`:71`).
- The summaries: "the annual business turnover (not profit) must not exceed 122,833 ₪ as of 2026" (`:81`, snippet about a
  summary); the second query's results (`:146-151`) and its summary, "the annual turnover ceiling for an exempt business
  (עוסק פטור) is 122,833 NIS" (`:155`).
- The record's own conclusion: "stated identically by Green Invoice and Kol Zchut on page one" (`:168-169`), and "the
  ₪122,833 published by two page-one results" (`:346-347`). [inference] With no snippet returned, that can rest only on the
  summary.
- No 7.9 log reads the ceiling. `grep -F '122,833' logs/2026-09-07*` also hits
  `logs/2026-09-07-board-owner-guide-and-first-builds.md:26`, "אזהרת ₪122,833", a list item, not a read.

**Other reads of the figure.**
- `JUDGEMENT.md:117-125`: "The figure is not challenged: **[search]** several secondary sources and, per the result summary,
  a gov.il page carry 122,833 for 2026" (`:117-118`, snippet); "The README's own standard withholds the registrar amounts
  because "no primary source was ever opened"" (`:118-119`); the fix it proposed (`:121-122`); a gov.il page a search result
  named, recorded "so `urls.txt`'s verbatim rule holds" (`:122-123`), which has 0 lines in `research/rendered/urls.txt` and
  no capture; "The VAT-rate and allocation-threshold rows carry the same secondary grade and deserve the same wording;
  outside this row." (`:124-125`). Also `:7-9`.
- `research/tiktok/08-reads/tt2-render-check.md:100-101` (rendered via note); `research/tiktok/08-reads/hebrew-israel.md:365`.
- `research/measurements/osek-patur-documents.md:488-489` and `:853-854` quote nevo's live VAT-law capture, `[robots-bar]`
  (its `R-VAT` is defined at `:467`). The frozen copy holds the same definition at
  `research/rendered/nevo-vat-law-2026-09-29.txt:93` (rendered, `[robots-bar]`; cited here only to record where the figure
  stands).
- N13, the rules watch: "Weekly hash watch of primary pages that render from the runner … Capitax serves only as a secondary
  alert." (`research/tiktok/08-sales-marketing-lessons.md:684`). `.github/workflows/` holds 20 workflows; the only `*-watch`
  ones are `pcn874-spec-watch.yml` and `render-watch.yml`.

**An earlier standard for legal numbers.** "Every legal number in this report — including the ones I marked CONFIRMED —
rests on search snippets … it is **not** enough to *publish to users as guidance*. Any product page shipping these figures
must first have a human or unblocked agent open the primary source."
(`research/colony-sweep/groups/israel-bureaucracy.md:51-56`; that file holds no "122"). The 25.9 audit applies it to the ceiling (`research/owner-docs-audit/il-biz-tools.md:342-345`) and
graded the ceiling "value CORRECT; label contradicted" (`:46`).

**MISSION.** Rule 4 (`MISSION.md:454-459`); the README's reading of it (`README.md:91`). MISSION has no sentence on what grade
of source a published legal figure needs.

**The same grade elsewhere in the product.** `vat.json:4-10` is `"verified": true`, `"how": "search"`, the same record, with a
note that "ynet was not among the results and no result page was opened"; `vat.html` and `invoice.html` render it
(`publish-gate.js:71`, `:80`); the same tests lock it (`statutory-sources.test.js:55`, `:82-101`). `allocation-number.json` is
`"verified": true` with no `check` (`:2-5`; `statutory-sources.test.js:104-108`). The README calls both "verified" (`:56`,
`:63`). [inference] A ruling on a public product figure resting on a search summary would reach `vat.json` too; the row
names osek-patur only.

**"rests on less".** The row's own comparison; no ruling makes it [inference]. osek-zair's 2026 cap rested on a rendered,
frozen nevo capture, now `[robots-bar]`; osek-patur's ceiling rests on "[SNIPPET] about a summary — weaker still" (SERP
record `:24-26`).

### B(1) Outcome one: the 2026 figure stays on the search-summary read

**What stays as it is** (pointers only).
- The config's `"verified": true` and `"how": "search"` (`osek-patur.json:5`, `:9`); the page's seven figure lines and its
  source line, "הושווה לתוצאות חיפוש: 7.9.2026" (B(0)); the home card (`index.html:78`); the README's "verified against
  secondary sources only" (`README.md:57`); the tests in B(0), which already lock this state.
- The stale-year label shows once 2026 is over, until someone checks the new figure (`README.md:84-85`;
  `source-line.js:62-66`).

**Texts that bear on it.**
- "Not decided" 1's words: "it fails the standard osek-zair holds itself to, and the main thread should queue it as its own
  row rather than let decision 1 appear to have blessed it" (`ROBOTS-RULING:422-424`).
- The README's one labelled precedent: the registrar reduced-rate window, "unverified against a primary source, **rendered
  anyway, labelled**" (`README.md:65`). The registrar amounts, at the same "no primary source" grade, are "**unverified — not
  published**" (`:64`).
- `osek-patur.json:11` names the route that changes the grade: "A dated read of a primary page (note §8.1 N13) turns this
  into how: \"read\"."
- [inference] osek-zair-unverified's 2026 value stays tied to this ceiling by `osek-zair-page.test.js:302`, and the osek-zair
  2026 row in the README names `osek-patur.json` as its source (`README.md:68`).

### B(2) Outcome two: 2026 moves to pending until a permitted primary text is read

**The precedent: how osek-zair's 2026 cap moved on 6.10.**
- `osek-zair.json` today: `years` is `:77-80` (2024 and 2025), `defaultYear` `"2025"`, and `pendingYears` `:82-92`, with the
  pending text at `:84` and its cites at `:87-89`. `:3` and `:71` (the `check.vatLaw` history) confirmed.
- `1b88919`'s diff (`git show 1b88919`) removed `years.2026`, `documents.vatLaw`, the whole `facts.cap2026` and
  `facts.vatSense` entries, the vatLaw cite in `facts.cap` with its "122,833 ₪ בשנת המס 2026" clause, and `"vatLaw"` from
  `sourceLine`; it replaced the empty `"pendingYears": {}` with the 2026 entry and rewrote `check.vatLaw`, kept as history at
  `:71`. The follow-up is `b3a5e32` (2026-10-06T08:29:00Z).
- `osek-zair-unverified.json`: `"verified": false` and the `about` (`:2-3`); the 2026 `cap` 122833, its `grade` "nevo capture
  [robots-bar] (ruling 6.10 row 21 (a)); not a product input" and its `toVerify` (`:6-8`).
- The tick-54 logs: `logs/2026-10-06-channel-loop-tick-54-osek-zair-2026.md:105` and
  `logs/2026-10-06-channel-loop-tick-54.md:22`.

**What the move would touch here** (pointers only).
- No pending-year mechanism exists in `osek-patur.json`, `src/lib/osek-patur.js`, the page script or the page ("pending"
  counts 0 in all four).
- `"verified": false` would withhold the page through the gate (`publish-gate.js:72`, `:93-96`, `:142-159`;
  `build-site.js:152-156`). The home card keeps ₪122,833 (`index.html:78`) and a test requires the figure there
  (`statutory-sources.test.js:166`); the figures note points to the tool's page (`:167-169`).
- The tests that lock today's state (B(0)), among them `statutory-sources.test.js:83`'s `expect(c.verified).toBe(true)`
  [asm], `osek-patur.test.js:5-7` and `osek-zair-page.test.js:300-305`.
- The figure's other places: `README.md:57`, `:829`; `docs/OWNER_STEPS.he.md:167-168`, `:177` and its PDF;
  `docs/INCOME_PLAN.he.md:115`, `:380` (B(0)).
- osek-zair's held-back 2026 value is tied to this config (`osek-zair-page.test.js:302`; `README.md:68`).

**What a permitted primary text would be, and where the store stands.**
- The list `osek-zair-unverified.json:8` gives: "the notice in Reshumot of the 1.1.2026 CPI adjustment under VAT law section
  126(א), a gov.il page of the Tax Authority, or a Tax Authority circular".
- **Hosts with a terms entry** (`terms-verdicts.json`): `www.gov.il` `NO_TERMS`, "refusal-type: the terms page answered 403
  … retired until a GitHub-hosted copy is read" (`:839-845`); the other gov.il entries (btl `:106-112`, data `:140-146`,
  knesset `:401-407`, mr `:482-488`); kolzchut.org.il (`:408-414`); nevo.co.il (`:514-520`); `:812-818`; github.com
  `CONDITIONAL_MET` (`:249-255`; `osek-patur-documents.md:1159`, with `:1160` on the mirror's nevo files: "The files are
  nevo's own documents. … nevo's editorial layer comes along with them.", github via note).
- **Hosts with none.** `grep -c` is 0 for taxes.gov.il, justice.gov.il, reshumot, bizportal, mako.co.il, ynet.co.il and
  capitax. A site with no entry may get "one plain fetch" of its terms page (VIDEO-RULING D2(iii), `:79-82` [asm: a checker
  gave `:80-83`]). The gate's message for a site with no verdict is `scripts/queue-zero-test.mjs:260-261`, which goes on
  "(queue its terms page as a terms-... slug after adding a TERMS_PENDING verdict with the terms URL)"; `:343-345` count
  "each gov.il host" as "its own site" [asm: a checker cited `:344` beside the message].
- **Captures in the store** (rendered, meta only unless said). The four gov.il pages are 403; the pcn874 Form 874 English
  page is 200 with 0 "פטור". Kol Zchut's exempt-dealer page has a meta only (29.9 08:59:26Z, 403), and its render line is
  retired (`research/rendered/urls.txt:576-577`). The words "render of 28.9.2026" were first written in `c9b8fad` (29.9
  00:02Z); the two Kol Zchut captures before that, both 403, are `tt-src-kolzchut-org-il-he` (28.9 21:02:29Z, the only one
  dated 28.9 in UTC) and `kolzchut-employee-plus-self-employed` (27.9 22:46:10Z, 28.9 in Israel time). The Kol Zchut terms
  capture came later (29.9 14:02Z).
- **Which captures hold 122,833** (rendered, counts). Four files: the `.txt` and `.html` of the live nevo VAT-law capture and
  of its frozen copy, all `[robots-bar]`. No BTL capture (14 `.txt`), gov.il or capitax capture holds it. No frozen capture's
  name contains "patur" or "פטור"; the frozen BTL captures (`FROZEN.sha256:9-28`) and the frozen BTL terms copy (`:204-205`)
  hold neither 122,833 nor 122833.
- **The capitax copies.** All five documents osek-zair cites are capitax copies (`osek-zair.json:5-30`: gazette, report, letter
  `:32-41`, regulations `:42-52`, draft `:53-63`). The five `tt2-capitax-*` metas were fetched 28.9 23:22Z, status 200, with
  no `robots` key. `FROZEN.sha256` and `urls.txt` have 0 capitax lines. The README grades the 2024-2025 caps "**read in a
  primary text** (third-party copy)" (`README.md:66-67`), while N13 calls capitax "only … a secondary alert"
  (`08-sales-marketing-lessons.md:684`).
- **The audit that would mark them.** ROBOTS-RULING fold 10(ii) would mark pre-30.9 captures that a later run records as
  robots-disallowed (`:413-415`). It is queued after fold 9 (`CHANNEL_LOOP.md:388`). No robots record for capitax exists.
- **The Never line not yet written.** Fold 11's §1 Never, "a product figure from a `[robots-bar]` or `[against-bar]` capture"
  (`ROBOTS-RULING:416`), is not in the Never list (`CHANNEL_LOOP.md:74-86`; `grep -c -F "product figure"`, 0).

---

## Part C — What is not for this sitting, what no file holds, and housekeeping

**Not for this sitting.**
- Row 28 (derived metrics under the YouTube API Terms) sits on 9.10 ~07:11 (`CHANNEL_LOOP.md:457`).
- The repository's visibility is the owner's decision (`CHANNEL_LOOP.md:255-257`; `REFUND-RULING:487-489`;
  `ROBOTS-RULING:427-428`). Row 26 (iii) asks about a route that depends on it, not for it.
- [asm] **The Gumroad API under the 7.10 Never line.** `CHANNEL_LOOP.md:79` now also bars "a keyed API call to a host whose
  API terms are unread". The 7.10 ruling says "Gumroad's API was allowed with its terms on file and read (D1(3), D2(ii))"
  (`T1-RULING:239-240`), and D2(ii) says "**The API, `api.gumroad.com`, stays outside the bar**" (`VIDEO-RULING:75-77`).
  `termsBarred("api.gumroad.com")` returns the gumroad.com entry (run here); render-watch's comment says the Gumroad API "is
  not fetched by this script" (`render-watch.mjs:514-515`), and the connector is not render-watch. Not row 26's question.
- [asm] **One page per call.** The connector's header says Gumroad's index "answers ten sales a page" and pages with
  `next_page_key` / `page_key` (`gumroad.ts:16-17`). `fetchSince` makes one call with no `page_key` (`:35-37`), while
  `readProRefundCount` loops over pages (`:229-240`). [inference] With more than ten sales since the cursor's day, one call
  would not book them all. Not row 26's question.
- [asm] **The YouTube read-back's storage build** (`CHANNEL_LOOP.md:395`) is a queued Opus build under another platform's
  terms (A(ii)).
- **The VAT rate and the allocation threshold** carry the same grade (B(q)); JUDGEMENT put them "outside this row"
  (`JUDGEMENT.md:124-125`), and row 27 names osek-patur only.
- **Fold 10** (the copying audit and the `[robots-bar]` marking) is queued (`CHANNEL_LOOP.md:388`).

**What a ruling would need that no file holds.**

*Row 26.*
1. **Gumroad on its ids.** Whether Gumroad treats a sale or purchase id as confidential, or bars a seller from publishing one.
   The terms capture is silent (A(0)); the API-docs and help captures are shells; the privacy policy the terms point to is not
   captured; the terms entry's copying is "unread".
2. **Gumroad's `id` field.** It is quoted nowhere. "API v2 `id` = the purchase `external_id`" rests on a fixes-log paraphrase
   (`SITTING-2026-10-05-BRIEF.md:672-675`; `REFUND-RULING:139-145`). [asm] D1(3) names Gumroad's refresh route as "its source
   on GitHub (`antiwork/gumroad`)" (`VIDEO-RULING:37-38`).
3. **Guessability.** Whether a sale id can be guessed, or what its entropy is (`SITTING-2026-10-05-BRIEF.md:676`). The shape
   example the ruling relied on is gone from the code (A(i)).
4. **A definition.** No text says whether a "platform transaction id" must be the platform's own string or may be a digest of
   it. The nearby wordings do not settle it (A(q)).
5. **Matching a digest.** Whether an unsalted sha256 can be matched by someone who already holds candidate ids, such as a buyer
   holding their own receipt, or whether a keyed HMAC would be needed. `REFUND-RULING:366`'s "cannot reverse" is marked
   inference.
6. **The re-derivation.** Any code or procedure by which "an auditor with the token re-derives it". No code calls
   `/v2/sales/`, and the auditor checks only duplicates (A(0)).
7. **A buyer-privacy rule** in `MISSION.md` or `constitution.md` (counts 0).
8. **Remote history.** Locally, every one of the 80 `colony.db` versions reachable from `--all` has 0 ledger rows and 0
   `tool_calls` rows. What `origin` holds after a later push was not read: no network.
9. **Visibility today.** Whether the repository is public today; only `CHANNEL_LOOP.md:255-256` says so.
10. **Actions logs.** The visibility and retention of a public repository's Actions logs and summaries
    (`REFUND-RULING:184-185` marks it background). The tick tees stdout (`colony.yml:75`) and writes `REPORT.md` to the step
    summary (`:108-113`); heartbeat errors carry `${source}: ${message}` (`heartbeat.ts:290`). [inference] No Gumroad path in
    the tick prints an id.
11. **A test of the id's form.** Any test pinning the connector's `external_id` form or its `:refund` / `:fee` suffixes.
12. **A migration plan.** None exists, and there are no rows to migrate in any version.
13. **A replacement store under (ii)**, or how the measurement dedup in kv (`measurements.ts:9-10`) would persist without the
    commit. [asm] On a public repository an artifact is readable by every signed-in user (`ROBOTS-RULING:436-438`).
14. **An agent runtime.** Whether one would write `tool_calls` into `state/colony/colony.db` (A(0)).
15. **The other connectors.** Whether the digest rule should cover Stripe's and Lemon Squeezy's raw ids too (A(0)); the row
    names Gumroad only.
16. [asm] **Gumroad's API terms.** No file quotes a Gumroad API term on what a seller may do with data the API returns. The
    7.10 ruling's "terms on file and read" (`T1-RULING:239-240`) points to the general terms capture, which is silent on ids,
    and the API-docs capture is 4 bytes.

*Row 27.*
1. **A dated primary read.** No dated read of any primary text stating the 2026 עוסק פטור amount: no gov.il, taxes.gov.il,
   Reshumot or Tax Authority circular capture. The gazette, in a third-party copy, states only the 120,000 base and the
   1.1.2026 CPI step.
2. **A permitted capture.** No permitted capture of any kind states 122,833; all four files that hold it are nevo
   `[robots-bar]`.
3. **The 7.9 read itself.** No opened result page and no snippet text. The 27.9 search left no dated record beyond
   `JUDGEMENT.md`'s prose.
4. **The README's secondary sources.** No record that Bizportal, mako, ynet or the "CPA circulars" were ever read; none of
   those hosts has a capture or a verdict entry.
5. **D1's rule.** No primary-text rule inside VIDEO-RULING D1.
6. **The grade question.** No ruling on whether a secondary or search-graded figure may stay on a public page, nor on whether
   a third-party copy (capitax) counts as a "permitted primary text". capitax has no verdict and no robots record.
7. **A pending year for osek-patur.** No pending-year mechanism in `osek-patur.json`, `osek-patur.js`, the page script or the
   page.
8. **The home card.** No build step or test that removes `index.html:78`'s ₪122,833 when osek-patur.html is withheld;
   `statutory-sources.test.js:166` requires the figure to be there.
9. **Terms for the primary hosts.** No terms verdict for taxes.gov.il or any Reshumot host; no GitHub-hosted copy of gov.il's
   or Kol Zchut's terms, both refusal-type.
10. **A rules watch.** No `rules-watch` workflow (N13).
11. **Fold 11's Never line.** Not in `CHANNEL_LOOP.md` §1 (`grep -c -F "product figure"`, 0; the Never list is `:74-86`).
12. **A frozen patur capture.** No frozen capture's name contains "patur" or "פטור". The frozen captures that touch the figure
    are the nevo VAT-law copy (`FROZEN.sha256:112-114`, `[robots-bar]`) and the 30.9 nevo robots copy (`:164-165`).
13. **The robots audit.** No run of ROBOTS-RULING fold 10(ii) (queued, `CHANNEL_LOOP.md:388`).

**Housekeeping for the Opus fold, not rulings.**

*Row 26's pointer drift* (repo; the checker's, confirmed):
- REFUND-RULING cites `CHANNEL_LOOP.md:239-241` at `:186`, `:368`, `:487` and `:498`. The decision is now at
  `CHANNEL_LOOP.md:255-257`; `:239-241` now holds step 2 (the עוסק פטור file).
- REFUND-RULING cites `gumroad-pro-product.js:921` at `:83`, `:154` and `:366`, and quotes the example at `:82`. Line 921 of
  the 1,055-line file is blank, and the example matches nothing in the code (retired in `0efc16c`). The nearest shapes now in
  code: `brand_mail.py:214` (`BALANCE_LINE`), `:218` (`RETRY_RESULT`) and `:222` (`SALE_REF`).
- REFUND-RULING:350's "`REPORT.md:52`, `:61`": `:61` now holds apify-actors (`APIFY_TOKEN`); owner step 6 for
  `GUMROAD_ACCESS_TOKEN` is at `state/colony/REPORT.md:62` (il-biz-tools) and `:64` (pcn874). `:52` holds. The file is
  regenerated hourly.
- REFUND-RULING:17's "brand-mail.yml in full (381 lines)" is 318 lines now.
- `SITTING-2026-10-07-BRIEF.md:35`'s "FROZEN.sha256 (244 lines)" is 255 now.
- [asm] REFUND-RULING:219's hygiene rule, "`brand-mail.yml:55-56`", is now `:57-58`; `:215-219`'s "never an address" at
  `brand_mail.py:76-77` is now `:74-75`, which reads "never an address, a sale id, a subject or a body".
- Row 26's own inputs all hold (Part A).

*Row 27's pointer drift* (repo; the checker's, confirmed):
- `osek-zair.json:122` → `:87`; `:93` → `osek-zair-unverified.json:8`; `:90-94` removed, with 2026 now in `pendingYears`
  `:82-92`; `:64-73` and `:248-250` removed.
- `terms-verdicts.json`: `:433` → `:518`; `:681-686` → `:812-818`; `:707` → `:839-845`; `:427-432` → `:839-845`;
  `:204-208` → `:408-414`; `:198-202` → `:401-407`; `:114-118` → `:249-255`.
- `CHANNEL_LOOP.md`: `:341`, `:356` → `:357`, `:372`; `:239-241` → `:255-257` [asm: a checker gave `:254-257`; `:254` is
  blank].
- `JUDGEMENT.md`'s `README.md:40` → `:57`; its `OWNER_STEPS:88` → `:167-168`. `il-biz-tools.md:46` and `:342`:
  `OWNER_STEPS.he.md:73-74` → `:167-168`.
- Unchanged on a spot check: `osek-patur-documents.md` `:38`, `:1138`, `:1147`, `:1159`, `:1167`, `:1174`, `:1213`;
  `logs/2026-09-29-osek-zair-2026.md:125-130`; `osek-zair-unverified.json:3`.
- [asm] `VIDEO-RULING:38`'s `terms-verdicts.json:114-118` (github.com) → `:249-255`, the same move.

*Corrections the checkers made to the clerks* (recorded so the fold does not re-introduce them):
- Row 26: `fetchSince` has no product filter (`:35`), but `readProRefundCount` filters on `product_id` (`:232`) and keeps
  sales in memory only (`:238-240`); an entry also carries `lineId`, `kind` and `source`, and the refund and fee entries
  fixed notes; §8 item 12's text is near-verbatim, not verbatim (quote marks; the inputs list differs);
  `CHANNEL_LOOP.md:308` words the hold differently from `:134`; `isRevenueColonyEnabled` and `setRevenueColonyEnabled` are
  `ledger.ts:165-173`; `loop.test.ts:251` also asserts the kv entry, and no plan covers `ledger.ts`; the derived rule is
  worded for "the responder's memory", and `REFUND-RULING:213` points to `MISSION.md:44-45`; `REFUND-RULING:311-312` added;
  `:239-241` is also cited at `REFUND-RULING:487` and `:498`; the `:921` citations are at `:83`, `:154` and `:366`; step 6
  is at `REPORT.md:62` and `:64`; `BALANCE_LINE` has `RETRY_RESULT`'s shape; the last state commit is on `origin/main`, and
  all 80 past versions hold 0 ledger rows.
- Row 27: byte-identical is against `bfdf7b7`, so "before 29.9" means before `b6e1d64`; `a65a5b2` is one of twelve root
  commits; `c9b8fad` was the first dated check; only the phrase "verified against secondary" is unique to `README.md:57`; the
  page prints the source line statically and a test holds it equal to `sourceLineHe`; `source-line.js` computes the line and
  does not write the page; `trackOsekPatur` takes optional overrides the page does not pass; the build's rewrite steps run
  `build-site.js:158-191`; four more tests lock today's state; `docs/OWNER_STEPS.he.pdf` holds the figure; `1b88919` removed
  whole entries, not just cites; decision 1(2) starts at `:125`; fold 11 is `:416` (`:411` is fold 9); the SERP legend is
  `:21-26`; a second 7.9 log names ₪122,833 without reading it; the 28.9 Kol Zchut render could be either of two captures;
  four files hold the figure, not two; the built HTML is gitignored.

*Pointers this brief corrected or added* [asm]:
- `kv` holds 138 keys, not one; `revenue.connector_cursor.x402` is the only connector cursor, so no Gumroad cursor exists.
- `enableProduct`'s function line is `gumroad-pro-product.js:627`; `:621-626` is its doc comment.
- `CHANNEL_LOOP.md:26` names row 26 alone; row 27's seat is `FABLE_QUEUE.md:51`, and tick 62's plan (`:457`) names both.
- `CHANNEL_LOOP.md:254` is blank; the frozen-domain sentence is `:255`.
- `statutory-sources.test.js:83` asserts `verified` true for each figure.
- `termsBarred("api.gumroad.com")` returns the gumroad.com entry; `termsBarred()` is `null` for `www.nevo.co.il`,
  `www.gov.il`, `www.kolzchut.org.il` and `capitax.co.il`.
- `T1-RULING:239-240` on Gumroad's API and the second clause of `CHANNEL_LOOP.md:79` (Part C).
- `fetchSince` reads one page per call (`gumroad.ts:16-17`, `:35-37`, against `:229-240`).
- ROBOTS-RULING's amendment 1 on artifacts (`:436-438`), its decision 4(1) on history (`:345-347`) and its "Not decided" 4
  (`:427-428`); `CHANNEL_LOOP.md:395`'s parallel build; D1(3)'s GitHub refresh route for Gumroad (`VIDEO-RULING:37-38`).
- The refund tests' fixture ids with `=` endings (`test_brand_mail_refunds.py:866`, `:890`).
- The moved hygiene and redaction lines (`brand-mail.yml:57-58`; `brand_mail.py:74-75`), and `VIDEO-RULING:38`'s github.com
  pointer.
- Spans re-counted: D1 is `VIDEO-RULING:24-64`, and D2(iii) is `:79-82` (a checker gave `:80-83`); ROBOTS-RULING's decision
  1(2) is `:125-129` (`:130` is 1(3)), and its fold 10 is `:413-415`; REFUND-RULING's §2.4 is `:137-160` and §3 `:181-219`.
- `scripts/queue-zero-test.mjs:260-261` is the no-verdict message; `:343-345` is the comment that counts each gov.il host as
  its own site (a checker cited `:344` beside the message).
- The header's link blocks 2-4 and the label blocks of Parts A and B.
