# Ruling — the ledger's Gumroad sale ids in the public repository: a digest is the platform transaction id, 11.10.2026 — `logs/FABLE_QUEUE.md` row 26

**Sitting.** 11.10.2026 ~07:11 UTC, the re-run of the 8.10 seat (the 8.10 sitting got a 429 at 07:15 before either
decider wrote a word; the session was then down until 11.10 06:00 UTC), beside row 27, whose subject is not touched here.
One decider: the deciding model of the sitting. No subagents, no web fetch, no connector call, no `gh`, no git command
that writes (and no `git stash` in any form), no edit outside this file; the main thread folds on Opus. The owner is
"the owner", they/them. No person's name, no login, no address, no token and no real sale id appears here; the test
fixtures quoted ("g1", "sale-1", "g-1") are the repo's own invented strings.

**Tree.** `f838285` on `claude/new-session-j071dx` (`git log --oneline -1`, read-only; `git status --short` empty before
and after every read). Every pointer below was opened in that tree with `sed -n`, `cat -n`, `grep -n` or `git log`/`git
show`, and the line quoted is the one seen at HEAD. The brief (`research/channel-loop/SITTING-2026-10-08-BRIEF.md`) was
assembled on `88a1fd9` and drift-checked at `a12dc7e`; `git log a12dc7e..HEAD` over every code file the brief cites for
row 26 (`gumroad.ts`, `ledger.ts`, `colony.yml`, `.gitignore`, `schema.ts`, `money.ts`, `tools.ts`, `colony.ts`,
`heartbeat.ts`, `measurements.ts`, `stripe.ts`, `lemonsqueezy.ts`, `gumroad-pro-product.js`) is empty; what moved
before `a12dc7e` and was not in the brief's note is under "Pointers that moved". While this file was being written the
main thread advanced the branch to `182db8e` (2026-10-11T07:20:40Z: the virtualembryo captures trimmed, rows 28 and 29
re-seated to 12.10); `git log f838285..182db8e` over every file this ruling cites — the code files above, `colony.db`,
`MISSION.md`, the brief and REFUND-RULING — is empty, and `FABLE_QUEUE.md:50` is unchanged, so every pointer here holds at
`182db8e` too.

**Read.** `MISSION.md` in full; the brief `:1-131` (header), `:132-437` (Part A), `:706-857` (Part C);
`logs/FABLE_QUEUE.md:50` word by word, `:51-53`, `:1-30`, `:54-80`; `research/channel-loop/RULING-2026-10-05-refund-state.md`
(REFUND-RULING) `:46-50`, `:137-160` (§2.4), `:181-219` (§3), `:308-312`, `:338-369` (§6, item 5 at `:356-369`), `:466-477`
(§8 item 12), `:487-489` (§9) and its `##` headings; `research/channel-loop/RULING-2026-10-07-posthog-organisation.md:1-125`,
`:646-700`, `:751-832` as the house form; `research/channel-loop/RULING-2026-10-06-robots-and-terms.md:345-347`,
`:427-428`, `:436-438`; `research/channel-loop/RULING-2026-09-30-video.md:27-31`, `:75-77`;
`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md:239-240`;
`research/channel-loop/TERMS-AUDIT-2026-09-29.md:25`; `src/revenue/connectors/gumroad.ts:1-70`, `:150-162`, `:225-245`;
`src/revenue/connectors/types.ts:1-57`; `src/revenue/connectors/index.ts:1-14`; `src/revenue/connectors/stripe.ts:12-16`,
`:44-76`; `src/revenue/connectors/lemonsqueezy.ts:12-16`, `:36-48`; `src/revenue/ledger.ts:160-180`, `:420-510`;
`src/revenue/types.ts:66-69`, `:140-149`; `src/state/schema.ts:38-48`, `:712-728`; `src/state/database.ts:178-190`;
`src/revenue/money.ts:90-112` and its `export` lines; `src/revenue/heartbeat.ts:283-336`, `:603-622`, `:650-664`;
`src/revenue/tools.ts:155-210`; `scripts/colony.ts:100-124`, `:270-296`, `:308-332` and its `case` lines;
`src/revenue/measurements.ts:1-14`; `src/revenue/dashboard.ts:299-302`; `src/revenue/runner.ts:286-290`, `:338-342`;
`src/revenue/owner-steps.ts:106-108`; `.github/workflows/colony.yml:1-35`, `:40-55`, `:70-125`;
`.github/workflows/gumroad-pro-product.yml:28-40`; `.github/workflows/brand-mail.yml:266-272`; `.gitignore:1-15`;
`scripts/brand_mail.py:74-75`, `:208-224`; `products/il-biz-tools/scripts/gumroad-pro-product.js:621-656`;
`products/il-biz-tools/README.md:729`, `:738`; `src/__tests__/revenue/loop.test.ts:117-121`, `:236-254`;
`src/__tests__/revenue/ledger.test.ts:84-98`, `:192-214`; `src/__tests__/revenue/budget.test.ts:66-70`;
`src/__tests__/revenue/gumroad-refund-rate.test.ts:351-355`; the `externalId` assertions of the two `usdc-unconverted*`
tests; `src/__tests__/revenue/mutations/README.md:1-40` and the plan list; `src/__tests__/revenue/mutations/ledger.json:1-14`;
`src/__tests__/revenue/mutation-plans.test.ts:8-30`; `scripts/verify.sh:1-25`; `logs/CHANNEL_LOOP.md:26`, `:51`,
`:74-86`, `:108`, `:117-141`, `:255-257`, `:306-308`, `:310-313`, `:401`, `:481` and its `##` headings;
`logs/CHECKPOINT.md:1-40`; `docs/CHAIN_OF_COMMAND.md:11`, `:31`; `docs/REJECTED.md:576-577`;
`research/measurements/gumroad-native-licenses.md:72-73`; `state/colony/REPORT.md:1-6`, `:50-54`, `:60-66`.
**The database, read-only:** `state/colony/colony.db` at HEAD (sha256 `cc51bf0a…`, 1,712,128 bytes, equal to the
`3edde5e` blob — `git status` clean) opened through `python3 -I` and sqlite3 on `mode=ro&immutable=1`, sha256 and size
the same before and after; and the `a12dc7e` version from the object store (`git cat-file blob`), deserialised in
memory with the WAL header bytes patched in that copy only, then the scratch copy removed.

**Grades** as the brief defines them: `repo` (our own files; `repo (git objects)` for a past version), `github, via note`
(a GitHub text quoted by a note, the note being the pointer), `inference` (reasoning, always marked), `none` (no source).
Two facts in this ruling come from the main thread's words to this sitting and from no file at HEAD: that GitHub Actions
has been disabled on the repository since about 8.10 22:03 UTC (a dispatch on 11.10 answered that Actions is disabled;
who did it is not known), and that the 8.10 seat got a 429 before writing. Both are marked **[main thread]** where used;
nothing here fetches to check them, and no decision depends on either being permanent. There is no live grade: nothing
was read live and no connector was called.

**Standing rules applied.** Rule 2: "A shekel counts when it is recorded in `revenue_ledger` with a platform transaction
id. Projections, forecasts and "expected" revenue are never revenue." (`MISSION.md:443-444`, repo); the same at `:269-270`,
`:317-318`, `:190-191`. Rule 3: auditors "re-deriving supervisor decisions from the raw ledger", decisions in code "so any
auditor can recompute them from the same numbers and catch drift" (`:448-451`); the manager's view "must be **derived from
the ledger and the repo**, never hand-written" (`:49`). Rule 4: "No spam, no scams, no fake reviews, no manipulation, no ToS
violations, nothing that deceives a buyer." (`:455-456`). Rule 1: "Never invent a step that isn't required." (`:436`).
The brand is the only public face (`:276`, `:310`); "The repository, while it lives under his personal account" is one of
the three things that cannot be anonymised, and moving it "is his to make" (`:304-306`). One platform's action must not
take the company down (`:44-45`). ₪0: "The ceiling in `src/revenue/budget.ts` is ₪0" (`:352-353`); nothing in this
ruling buys, fetches, publishes or spends. The Never list (`CHANNEL_LOOP.md:74-86`): no gumroad.com page is fetched; the
API stays outside the bar (`RULING-2026-09-30-video.md:75-77`; `T1-RULING:239-240`) and is not called here.

**Money today.** ₪0.00: the last tick commit on the branch, `3edde5e` (2026-10-08T07:15:05Z), reads "30d ₪0.00 converted,
₪0.00 unconverted" (`git log`, repo); `state/colony/REPORT.md:2` is "Generated 2026-10-08T07:15:05.179Z" and `:51-52`
read "Ledger sync: 0 new entries, 0 already known, sources [none configured]" and "Gumroad Pro refund rate: not configured
— GUMROAD_ACCESS_TOKEN is not set". `revenue_ledger` holds 0 rows (decision 5).

**Pointers that moved since the brief** (checked at HEAD; the brief's own drift note for `ledger.ts` and `colony.yml` holds):
- `src/revenue/ledger.ts`: `PLATFORM_MEDIATED_KINDS` `:426-430`; the doc comment `:432-442`; `recordLedgerEntry` `:443`;
  the trim `:450`; the refusal `:452-458`; the chain checks `:471-495` (the two messages that interpolate the id, `:478-479`
  and `:493`); the "Any other id is a platform's own" comment `:497-498`; the lookup `:499-505`; the sign rule `:508-510`.
- `.github/workflows/colony.yml`: the purpose `:3-6`; "runs from the default branch (main)" `:12-13`; the cron `:27`;
  `fetch-depth: 0` `:50`; the three keys `:77-79`; the tick `:91`; the commit step `:93-122` (the `-f` comment `:99`,
  `git add -f state/colony` `:103`, the push loop `:114-120`, `exit 1` `:122`).
- `scripts/colony.ts` (not in the brief's note; tick 64 moved it): `--external-id` help `:120-122` (was `:107-109`); the
  `record` refusal `:312-316` (was `:275-279`); the pass-through `:325` (was `:288`); the duplicate message `:330` (was `:293`).
- `src/revenue/heartbeat.ts` (not in the brief's note): the connector loop `:313-331`, its error line `:330` (was `:290`);
  the auditor's duplicate-id check `:654-659` (was `:613-619`; `:613-619` now opens `runAudit`).
- `logs/FABLE_QUEUE.md:50`: the seat cell was rewritten for the re-seating (`f838285`); the inputs, question, output, fold
  and status cells are as the brief quotes them. `logs/CHANNEL_LOOP.md:26` still names the 8.10 seat.
- `state/colony/colony.db`: two more committed versions since the brief's read (`a12dc7e` 2026-10-08T00:58:50Z, `3edde5e`
  2026-10-08T07:15:05Z); sha256 `7d46a1c8…` → `cc51bf0a…`. `git log --all -- state/colony/colony.db` lists 89 commits.
- Not moved: `gumroad.ts:28`, `:32-37`, `:42-61` (the sale `:52`, the refund `:53-55`, the fee `:56-59`), `:154-160`,
  `:229-240`; `schema.ts:720`, `:726-727`; `money.ts:96-98`, `:104-109`; `tools.ts:157`, `:165`, `:176`, `:202`, `:206`;
  `measurements.ts:4-10`; `dashboard.ts:301`; `.gitignore:6-8`; `MISSION.md:442-445`; REFUND-RULING `:356-369`, `:466-477`;
  `CHANNEL_LOOP.md:134`, `:255-257`; `gumroad-pro-product.js:627-652`; `brand_mail.py:74-75`, `:210-222`.

---

## 1. A(q) Does a digest satisfy rule 2's "platform transaction id"? Yes — a deterministic, unkeyed digest of the platform's own id, in a self-describing form, computed by one function in code, with the re-derivation built, is the id for rule 2's two purposes; a keyed or salted digest is refused

**The question as asked** (`FABLE_QUEUE.md:50`): "Does a digest satisfy rule 2's "platform transaction id"?", handed over
by the 5.10 sitting in these words: "The sitting that takes it reads `MISSION.md:443-444`'s "platform transaction id"
against a digest of one." (REFUND-RULING `:367`).

**Facts read.**
- Rule 2's words (repo): "A shekel counts when it is recorded in `revenue_ledger` with a platform transaction id."
  (`MISSION.md:443-444`). No text in `MISSION.md`, `constitution.md`, the ledger or the docs says whether the id must be
  the platform's own string or may be a function of it (brief Part C, row 26, item 4; grade none).
- What the code says the id is for (repo): "Without it an entry is unverifiable AND undeduplicated, because the idempotency
  check has nothing to key on: the same imagined sale can be booked repeatedly and the portfolio would show revenue nobody
  ever paid. That is the one failure this whole system exists to prevent." (`ledger.ts:437-441`); the refusal: "money only
  counts when it carries the platform's transaction id (MISSION rule 2). Without one the entry cannot be verified against
  the platform and cannot be deduplicated, so the same amount can be booked twice." (`:454-456`). Two purposes, named twice:
  verification against the platform, and deduplication.
- The key (repo): "Idempotent on (source, externalId)" (`:433-434`); the lookup `SELECT id FROM revenue_ledger WHERE source
  = ? AND external_id = ?` (`:503`); the unique index `(source, external_id) WHERE external_id IS NOT NULL`
  (`schema.ts:726-727`); the column's own comment, "idempotency key from the source" (`:720`). "Any other id is a platform's
  own, unique within that platform." (`ledger.ts:498`).
- Who re-derives (repo): auditors recompute "from the same numbers" (`MISSION.md:450-451`); the auditor's only check of the
  id is structural, the duplicate count (`heartbeat.ts:654-659`). No code fetches a sale by its id: `grep -rn -F "/v2/sales/"
  src/` finds nothing; the two `v2/sales` calls are the index (`gumroad.ts:35`, `:234`), both token-gated (`:35`: `access_token`
  in the query). The id is displayed nowhere: `external` counts 0 in `dashboard.ts`, `portfolio.ts` and `status.ts` (grep);
  the agent's line tool lists entries without it (`tools.ts:157`). It is printed in two duplicate messages (`tools.ts:206`,
  `colony.ts:330`).
- What a sale id gives a stranger (repo; REFUND-RULING on a github-via-log reading): with the buyer's email, the receipt
  and its licence key (`:151`, `:193-194`); alone, "Not a refund … not a licence check … not the dashboard" (`:156-157`);
  "which is why the repo would be the place a stranger gets one" (`:154`). The ruling "rests on that reading and goes no
  further" (`:145`).
- Guessability (none): no file holds the id's shape or entropy (Part C item 3); the shape the 5.10 ruling leaned on is gone
  from the code (`gumroad-pro-product.js:921` is blank; Part C housekeeping). The responder's patterns admit
  `[A-Za-z0-9_=+-]{1,128}` (`brand_mail.py:214`, `:218`) and the fixtures end in `=` (brief A(i)); they are our regexes, not
  Gumroad's text.
- A digest with a secret would tie idempotence to the secret [inference]: a rotated key digests every old sale to a new
  value, and the next sync books every sale on the account again — `fetchSince` reads the trailing 30 days when it has no
  cursor (`gumroad.ts:32-34`) and has no product filter (`:35`), so the re-booking is of every sale, not one. That is the
  failure `ledger.ts:439-441` names. A dedicated secret would be a new owner secret, which rule 1 forbids inventing
  (`MISSION.md:436`), and a tick run without it (a local run, a forgotten environment) would book under other ids.
- The chain-id patterns (repo): `^0x[0-9a-fA-F]{64}$` and base58 `{86,88}` (`money.ts:96-98`). A string beginning `sha256:`
  matches neither, so the chain branches (`ledger.ts:471`, `:492-494`) never read a digest as wallet money [inference from
  the two regexes].
- Gumroad's texts (brief A(0), rendered `[against-bar]`, D1(1)(i), described in words): the terms capture has no sale id,
  purchase id, order id or transaction id; nothing speaks to a seller publishing one; the API-docs and help captures are
  shells; the privacy policy is not captured. Grade none for any Gumroad rule on ids (Part C items 1, 16).

**Options weighed.**
1. *Only the platform's own string satisfies rule 2.* No. The rule names its two purposes through the code that enforces
   it, and both survive a deterministic digest: the key `(source, digest)` deduplicates exactly as `(source, id)` does,
   and an auditor holding the platform's credential verifies a row by listing the platform's sales and digesting each,
   which is the same listing the connector already makes. What the literal reading protects — a stranger verifying a row
   against Gumroad — never existed: the index and the single-sale route are token-gated.
2. *A deterministic, unkeyed `sha256` of the platform's id, in a self-describing form, by one function, with the
   re-derivation built.* Yes; the conditions are the ruling.
3. *A keyed HMAC, or a salt kept as a secret.* No: idempotence would hang on a secret (facts, item 7) — the double-booking
   rule 2 exists to prevent, in exchange for protection against enumerating ids whose entropy no file knows, where a
   recovered id alone yields nothing (REFUND-RULING `:156-157`). The trade is the wrong way round.
4. *A truncated digest.* No: collisions for no gain; 64 hex characters cost nothing.
5. *A fixed public prefix inside the hash (domain separation).* Not needed: the form marker outside the hash does the
   self-describing, and an auditor's recomputation is one call simpler with the bare id as input.

**RULING.** A digest satisfies rule 2's "platform transaction id" when all four hold:

1. **C1 — deterministic, unkeyed, from the platform's id alone.** The stored id is `sha256:` followed by the lower-case
   hex SHA-256 of the UTF-8 bytes of the exact `sale.id` string the API returns (`String(sale.id)`, trimmed as
   `ledger.ts:450` trims every id); no key, no salt, no secret. The connector's suffixes follow the digest: the refund
   entry is `sha256:<hex>:refund`, the fee entry `sha256:<hex>:fee`, where `<hex>` is the sale's own digest, so the three
   rows of one sale read as one family.
2. **C2 — one function, every path.** One exported function computes the stored form for a digested source (today the set
   is `gumroad` alone), and `recordLedgerEntry` applies it to every entry of that source before any other check, message
   or lookup, so the connector, the CLI (`colony.ts record`) and the agent tool (`revenue_record`) store and deduplicate
   on the same value whether they pass the raw id or the stored form; the function is idempotent on the stored form.
3. **C3 — the re-derivation exists as code, not as a sentence.** A read-only command lists the platform's sales with the
   token (paging as `readProRefundCount` pages, `gumroad.ts:229-240`), digests each id, and matches the ledger's rows:
   a row no listed sale explains, a listed sale no row books, and a matched pair whose amount, currency or day differ
   are each a finding. It prints counts and stored forms, never a raw id. Until it exists, "an auditor with the token
   re-derives it" is a promise, and this ruling does not lift the hold on a promise (decision 6).
4. **C4 — the ledger knows its own form.** A `gumroad` row whose `external_id` is not in the stored form is a chief-auditor
   finding, beside the duplicate-id count (`heartbeat.ts:654-659`), so a raw id that reaches the ledger by any path is
   seen at the next audit rather than discovered in the public history.

Under these, the digest is the row's platform transaction id in rule 2's sense: anchored to one transaction the platform
identifies, verifiable against the platform by whoever holds the platform's credential, and incapable of being booked
twice. [inference from `MISSION.md:443-444` read with `ledger.ts:437-441` and `:454-456`.]

**The rule derived, stated once** [inference from rule 4, extending REFUND-RULING `:215-219` from the responder to the
ledger]: no identifier of a buyer or of a buyer's purchase is stored in a committed file in the form a third party could
use. A platform's sale id is such an identifier (REFUND-RULING §2.4); its digest is not. The ledger therefore stores the
digest, for every row of a digested source, whatever the repository's visibility.

**REOPEN IF** (a) the verify command shows a sale matched on one run and unmatched on a later run with no refund or
deletion in between — the platform's `id` is then not stable per sale and C1's premise fails; (b) a Gumroad text read
under the loop's rules says what a seller may store or derive from a sale id (none exists today; grade none); (c) the
digested set is to grow (decision 7, "What this does not decide" 2): one line of code, but a sitting's or a main-thread
Fable amendment's line, before either other key is set.

---

## 2. A(0) and A(i) What the code does today, and what it does after the fold: which function digests, with what input, where the ledger keys, what the refund and fee paths store, and how an auditor verifies a row

**Today** (repo; every line at HEAD).
- Nothing digests. `fetchSince` books `externalId: String(sale.id)` for the sale (`gumroad.ts:52`), `` `${sale.id}:refund` ``
  when `sale.refunded === true` (`:53-55`) and `` `${sale.id}:fee` `` when `gumroad_fee > 0` (`:56-59`). The entries carry
  `lineId`, `kind`, `amountMinor`, `currency`, `source: "gumroad"`, `occurredAt` and `note: sale.product_name` (`:52`), or the
  fixed notes "refunded" and "gumroad fee" (`:54`, `:58`). No buyer field is read.
- Every sale on the account is booked: `isConfigured` is the token alone (`:28`); the call has `after=<day>` and no product
  filter (`:35`); an unmapped product books under `UNASSIGNED_LINE_ID` (`:44-45`); with no cursor the window is the trailing
  30 days (`:32-34`). One page per call (`:35-37`; Part C: not this row's question, decision 7 item 6).
- The ledger trims the id (`ledger.ts:450`), refuses a platform-mediated kind without one (`:452-458`), runs the currency
  and chain checks (`:463-495`, two messages interpolating the id at `:478-479` and `:493`), keys the lookup on
  `(source, external_id)` (`:499-505`), stores refunds and costs negative (`:508-510`). The index is unique on the pair
  (`schema.ts:726-727`).
- The sync loop (`heartbeat.ts:313-331`) calls `recordLedgerEntry` per entry (`:323`), counts `recorded` and `duplicates`
  (`:324`), stores the cursor (`:326`) and pushes connector errors as `${connector.source}: ${message}` (`:330`).
- The hand paths pass the id as given: `tools.ts:202` and `colony.ts:325`; the duplicate messages print it (`tools.ts:206`:
  `Duplicate: ${source}/${external_id}`; `colony.ts:330`: `Already recorded: ${source}/${external-id}`).
- The auditor counts duplicate `(source, external_id)` pairs (`heartbeat.ts:654-659`) and nothing else about the id.
- An agent runtime, if one ever wrote into this database, would store a tool call's `arguments` verbatim
  (`database.ts:182-189`; `schema.ts:39-48`), raw id included. The CI tick runs no agent (`colony.yml:89-91`); `tool_calls`
  has 0 rows in every version read (decision 5).

**After the fold** (the design this ruling fixes; the code is Opus's, the behaviour is not).
1. **The function.** `storedExternalId(source, id)` in `src/revenue/money.ts`, beside `chainTxId` (`:104-109`), with
   `DIGESTED_SOURCES: ReadonlySet<string> = new Set(["gumroad"])` and the stored-form pattern
   `^sha256:[0-9a-f]{64}(?::(?:refund|fee))?$`: `null` stays `null`; a source outside the set returns the id unchanged; an
   id already in the stored form returns unchanged; otherwise a trailing `:refund` or `:fee` is split off, the base is
   digested with `createHash("sha256")` from `node:crypto` (as `prize-intake.ts:40`, `:224` does) over its UTF-8 bytes,
   hex lower-case, prefixed `sha256:`, and the suffix re-appended. `isStoredForm(source, id)` answers C4's check.
2. **The connector** (`gumroad.ts:52`, `:54`, `:58`) emits the stored form itself — `storedExternalId("gumroad", String(sale.id))`
   and the same with `:refund` and `:fee` — so the raw id never leaves `fetchSince` in an entry; the header comment
   (`:1-19`) gains one sentence naming this ruling.
3. **The ledger** applies `storedExternalId(source, …)` at `ledger.ts:450`, right after the trim and before `:452`, so the
   refusal messages (`:478-479`, `:493`), the chain branches, the lookup (`:503`) and the insert all see only the stored
   form for a digested source; the doc comment (`:432-442`) and the comment at `:497-498` name the rule. The returned
   `LedgerEntry.externalId` is the stored form.
4. **The duplicate check** is unchanged in shape: `(source, external_id)` with the stored form in `external_id`; the
   unique index (`schema.ts:726-727`) is untouched; no migration (decision 5).
5. **The refund path stores** `sha256:<hex>:refund`, amount negative (`ledger.ts:508-510`), note "refunded", `occurredAt` the
   sale's `created_at` as today (`gumroad.ts:51`, `:54`); **the fee path** `sha256:<hex>:fee`, kind `cost`, note "gumroad fee".
   The three rows share `<hex>`, so a reader of the ledger sees one sale, its refund and its fee without any raw id.
6. **The printers** print the stored form: `tools.ts:206` and `colony.ts:330` through `storedExternalId`; the descriptions
   at `tools.ts:165`, `:176` and the help at `colony.ts:120-122` say that a `gumroad` id is stored as its digest and may be
   passed raw or stored.
7. **The auditor** (C4): beside `heartbeat.ts:654-659`, a count of rows whose `source` is in `DIGESTED_SOURCES` and whose
   `external_id` is non-null and not in the stored form → `chiefFindings` gains "N gumroad ledger rows carry a raw external id
   (RULING-2026-10-11 row 26)".
8. **How an auditor verifies a row** (C3): `pnpm exec tsx scripts/colony.ts verify-gumroad [--db …] [--json]`, read-only
   (through the `rendersOnly`/query-only handle `report` and `dashboard` use, `colony.ts:255`, `:399`): with
   `GUMROAD_ACCESS_TOKEN` it pages `GET /v2/sales?after=<oldest ledger day − 1>` with `page_key` to the end (the loop at
   `gumroad.ts:229-240`, lifted into a shared pager), digests each `id`, and reports: ledger rows with no listed sale
   (finding), listed sales with no row (count "unbooked", a finding only when `enable` has opened the sale — before that it
   measures the paging gap, decision 7 item 6), matched pairs whose `price`/`currency`/`created_at` day differ (finding),
   refund rows whose sale is not `refunded` and vice versa (finding). Output: counts, stored forms and days — never a raw
   id, never an email, never the token; exit 0 clean, 3 with findings, 2 when the token is absent ("not configured",
   nothing fetched). Without the token the command fetches nothing, so it runs at ₪0 and makes no call today.

**RULING.** The behaviour above is the fold (folds 1-8). The one decision inside it that is not mechanical: the digest is
applied **in the ledger, first**, not only in the connector — because a raw id booked by hand through `revenue_record` or
`colony.ts record` would otherwise (a) be stored raw in the public file and (b) not deduplicate against the connector's
digest, double-counting the one sale (brief A(i), "The hand-booking paths"). The connector digests too, so the raw id
is gone one function earlier, and a test proves the two agree.

---

## 3. A(ii) Stop committing `colony.db`? No — the commit is the audit trail; the exposure is removed at its source

**Facts read** (repo).
- The rule the option goes against: "# The colony's own state is the audit trail the owner reads; it must be versioned."
  with `!state/colony/colony.db` (`.gitignore:7-8`); the tick "commits the resulting state and report back, so the owner can
  read every decision in the git history" (`colony.yml:5-6`); `git add -f state/colony` (`:103`).
- Nothing else holds the state between runs: `fetch-depth: 0` (`:50`), no cache or artifact step (`:43-125`); the measurement
  jobs write files and "do not open `colony.db`, because the hourly tick commits that binary file too" (`measurements.ts:4-7`),
  and their once-only dedup lives in kv inside it (`:9-10`). The dashboard's footer: every number on the page comes from
  `state/colony/colony.db`, with no field that can be filled by hand (`dashboard.ts:301`).
- The rules: the manager's view "derived from the ledger and the repo" (`MISSION.md:49`); auditors "from the raw ledger"
  (`:449`).
- An artifact is not private on a public repository: "anyone with read access to a repository can download its workflow
  artifacts, and on a public repository every signed-in user has read access" (`RULING-2026-10-06-robots-and-terms.md:436-438`).
- What the file holds about a buyer once the id is a digest [inference from `gumroad.ts:49-58`]: the amount, the currency,
  the second of the sale, and the product's name. None names or indexes a person; a buyer can recognise their own purchase
  by amount and time, as they can from their own receipt.
- The stale comment: `colony.yml:99` says `-f` is needed "because .gitignore's *.db rule would otherwise skip the database",
  while `.gitignore:8` already un-ignores it (brief A(0), inference). Housekeeping, not a ruling.
- **[main thread]** Actions is disabled since about 8.10 22:03 UTC, so no tick has committed since `3edde5e`. The rule below
  is written for when it runs again, whenever that is; it does not assume the stop is permanent.

**Options weighed.**
1. *Stop committing the database; keep it in an artifact or a cache.* No. It removes the audit trail the owner reads and
   the only store between runs, and on a public repository an artifact is readable by any signed-in user — the exposure
   would move, not end. The measurement dedup and the dashboard's "nothing by hand" rule would need a second store and a
   second truth.
2. *Keep committing; remove the raw id at its source (decision 1).* Yes. Once the id is a digest, the committed file holds
   no identifier of a buyer or a purchase (the derived rule), and every rule the commit serves stands.
3. *Commit a redacted copy and keep the raw database elsewhere.* No: two databases is two truths, and "elsewhere" is a
   store this repository does not have (fact 2).

**RULING.** `colony.db` keeps being committed, as `.gitignore:7-8` and `colony.yml:5-6` say. Option (ii) is rejected. The
`-f` comment at `colony.yml:99` may be corrected to say the flag is belt and braces beside `.gitignore:8` (fold 9); the
flag itself stays.

---

## 4. A(iii) Accept the raw ids if the repository goes private? No — not as a route; private changes nothing in the code, and this ruling returns no visibility question to the owner

**Facts read** (repo).
- The open decision: "The repo is public, and its history on main carries the owner's real name and personal email as the
  merge author. Choose one: make it private (Actions minutes become metered, possibly a cost) or accept the exposure
  knowingly." (`CHANNEL_LOOP.md:255-257`), with two recorded consequences: GitHub's terms allow our research reading "only if
  any publications resulting from that research are open access" (`TERMS-AUDIT-2026-09-29.md:25`, github via note), so a
  private repo closes the GitHub-hosted route; and a private repo meters the hourly workflows, so "private" is choosable
  only after step 7 with the organisation's $0 budget (`:257`; `owner-steps.ts:106-108`).
- Whose: "his to make" (`MISSION.md:304-306`); "the owner's decision" (`RULING-2026-10-06-robots-and-terms.md:427-428`).
- How the 5.10 ruling weighed it: "private" is "a state that can end, and history does not un-publish" (REFUND-RULING `:187`);
  "a route that needs the repo to be private is a route that depends on an open owner decision", against `MISSION.md:44-45`
  (`:211-213`); "the repo's visibility is an open decision the responder must not depend on" (`:311-312`); for this row,
  "the block relaxes for as long as it stays private, and no further; this ruling does not ask for that decision"
  (`:368-369`). §9 allowed this row to "return one question to §6" (`:487-489`).

**Options weighed.**
1. *Accept raw ids if private.* No. A route that works only while an owner decision stays one way, with the history kept
   when it flips, is the route `:211-213` rejected; and a private repository still has collaborators and a future.
2. *Make the ruling independent of visibility.* Yes. With the digest (decision 1) the committed file carries no buyer
   identifier in either state; a private repository adds a second fence and removes nothing this ruling requires.
3. *Return a visibility question to §6.* No. The one question §9 permitted is not asked: the digest makes this row
   indifferent to the answer, which lightens the owner's open decision rather than adding to it.

**RULING.** Option (iii) is rejected as a route and accepted as a fact: if the owner makes the repository private, nothing
in this ruling or its fold changes, and the hold on `enable` still lifts only with the fold (decision 6), never with the
visibility. Nothing is asked of the owner here.

---

## 5. Rows already booked: none, in any version; no migration, a guard instead

**Facts read.**
- The current file (repo; read-only, `mode=ro&immutable=1`): `revenue_ledger` 0 rows, 0 `gumroad` rows, 0 non-null
  `external_id`; `tool_calls`, `turns` and `event_stream` 0 each; `revenue_kpi_snapshots` 5; `kv` 138 keys, the only
  connector cursor `revenue.connector_cursor.x402` (so no Gumroad cursor: the first sync would read 30 days back);
  `revenue.gumroad_refund_rate.last_read` is `not_configured`, "GUMROAD_ACCESS_TOKEN is not set", at 2026-10-08T07:15:05Z.
  sha256 `cc51bf0a…` before and after.
- The `a12dc7e` version (repo, git objects), opened in memory: `revenue_ledger` 0, `tool_calls` 0, non-null `external_id` 0.
- Every earlier version: the brief's checker opened all 80 then-existing versions in memory, "Every one … has 0
  `revenue_ledger` rows, 0 non-null `external_id` and 0 `tool_calls` rows" (brief A(0)); this ruling relies on that record
  for them and read the two newer ones itself. `git log --all -- state/colony/colony.db` lists 89 commits at HEAD.
- The fixtures that book `gumroad` ids by hand in tests read nothing back by id (`budget.test.ts:68`, `loop.test.ts:119`,
  `gumroad-refund-rate.test.ts:353`); the only tests comparing `externalId` are the two `usdc-unconverted*` files, on
  chain ids of source `x402`, outside the digested set.

**RULING.** No row holds a raw Gumroad id in any committed version, so there is nothing to migrate and nothing to rewrite;
`idx_revenue_ledger_external` stays as it is. The guard is C4 (decision 1; fold 4): a raw-form row of a digested source is
a chief-auditor finding. If one ever appears, the remedy is a ruled one-off re-key (the raw id is in the row, so its
digest is computable) and the history question joins the owner's visibility decision as `RULING-2026-10-06:345-347` already
lists it; neither is ruled now because neither has a case.

---

## 6. What `enable` waits on after this ruling — the hold lifts with the fold on `main`, and moves upstream to the token

**Facts read** (repo unless marked).
- The hold: "`enable` does not open the sale while the tick would commit raw Gumroad sale ids into a public repository."
  (REFUND-RULING `:359-360`); in the loop, "**`enable` now waits on the ledger's sale ids (FABLE_QUEUE row 26)**"
  (`CHANNEL_LOOP.md:134`) and "`enable` now waits on row 26 (the ledger's raw sale ids)" (`:308`).
- Still in front of `enable`, none of them this row's (REFUND-RULING `:343-355`): step 8 (the brand mailbox; `enableProduct`
  refuses without a green probe, `gumroad-pro-product.js:630-638`); step 3 and step 6's Gumroad token (`REPORT.md:62`, `:64`
  name step 6 for il-biz-tools and pcn874); the agent's own dispatches (`create`, the fine print written and read back,
  the site deployed; `checkOffer`, `:651`); step 2. `enable` is the second dispatch of `gumroad-pro-product.yml`, from
  `main` (`:34-40`).
- The exposure starts before `enable` [inference from `gumroad.ts:28`, `:32-35`, `:44-45`]: the first tick after
  `GUMROAD_ACCESS_TOKEN` exists books every sale on the account from the trailing 30 days, whatever product and whether or
  not the Pro product is enabled — a test purchase, a refund, anything already sold on that account. So the thing that must
  precede the raw-id exposure is the token's arrival, not the `enable` click.
- **[main thread]** Actions is disabled; `enable` is itself a workflow dispatch and cannot run while it is; no CI runs on a
  pull request, so the fold is proved locally: `scripts/verify.sh` judges by the runners' exit codes and
  `scripts/merge-worktree.sh` runs the pre-merge copy of it (`CLAUDE.md`, "Build / test").

**RULING.**
1. REFUND-RULING §6 item 5's hold is **lifted when the fold (folds 1-8 below) is on `main`**, and the main thread records
   the merge commit in `FABLE_QUEUE.md:50`'s status and in `CHANNEL_LOOP.md:134`. Not before: C3's command is part of the
   fold, and the hold does not lift on a promise.
2. The hold's effective point **moves upstream**: `GUMROAD_ACCESS_TOKEN` is not asked for in any owner summary, and is not
   added to the tick's secrets if the owner offers it early, before the fold is on `main`. This is sequencing of our own
   work before an existing owner step, not a new step: `owner-steps.ts` and `OWNER_STEPS.he.md` are not edited for it, and
   the main thread's checkpoint carries the one sentence.
3. Items 1-4 of REFUND-RULING §6 stand unchanged. Nothing new is asked of the owner by this ruling.
4. While Actions stays disabled **[main thread]** neither the tick nor `enable` runs; the fold is proved locally and merged
   under the standing consent (`MISSION.md:348-349`); when Actions runs again the first tick commits a database whose
   connector already digests. No step here waits on Actions.

---

## 7. What this does not decide

1. **The repository public or private**, and whether public history is rewritten (`CHANNEL_LOOP.md:255-257`;
   `RULING-2026-10-06-robots-and-terms.md:427-428`): the owner's; this ruling is indifferent to the answer (decision 4) and
   returns no question to §6.
2. **Stripe's and Lemon Squeezy's raw ids.** `String(tx.id)` and `` `${tx.id}:fee` `` (`stripe.ts:48`, `:60`, `:72`);
   `String(order.id)` and `` `${order.id}:refund` `` (`lemonsqueezy.ts:41`, `:43`); both keys are passed by the tick
   (`colony.yml:77`, `:79`) and neither is set. The row names Gumroad only, and the threat model read (REFUND-RULING §2.4)
   is Gumroad's receipt route; no equivalent reading exists for the other two (none). The mechanism is one line
   (`DIGESTED_SOURCES`), so the decision waits for its own evidence — **REOPEN before either key is set** (decision 1 (c)).
3. **The entropy or guessability of a Gumroad sale id** (none). The design does not rest on it (decision 1, option 3).
4. **Gumroad's own rule, if any, on what a seller may store or derive from a sale id** (none; the terms capture is silent,
   the API-docs capture is a shell). REOPEN (b) of decision 1.
5. **The `tool_calls` table.** If an agent runtime ever writes turns into `state/colony/colony.db`, a `revenue_record`
   call's `arguments` would hold the raw id a caller passed (`database.ts:182-189`). Today no runtime does and the table is
   empty in every version. **REOPEN before any runtime writes into that database**; the fold's description change at
   `tools.ts:165` (pass the stored form where one is known) is a courtesy, not a fence.
6. **`fetchSince` reads one page** (`gumroad.ts:35-37`) while the index answers ten sales a page (`:16-17`) and
   `readProRefundCount` pages (`:229-240`). Part C marked it not this row's question; it is an Opus defect, not a ruling, and
   the verify command's "unbooked" count (decision 2 item 8) will measure it. The main thread may queue the fix with fold
   1 (the shared pager is the same code) or after.
7. **Who disabled Actions, and whether it is re-enabled** **[main thread]**: a fact for the main thread's probe; nothing here
   depends on it.
8. **The order of the owner steps** (row 29's subject) and **osek-patur's ceiling** (row 27's): untouched.
9. **A buyer-facing disclosure** that a digest of their purchase is published: not needed under the derived rule, since the
   digest identifies no one; recorded so nobody later reads its absence as an oversight.

---

## Folds for Opus

Every fold is ₪0, on Opus, in one worktree with the base check first (`CLAUDE.md`, "Agent worktrees": `git log --oneline
-1` and `ls products/ src/revenue/`; `git reset --hard <branch>` if anything is missing); never `git stash`. Worktree agents
do not edit `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` or `logs/FABLE_QUEUE.md` (the main thread applies fold 10 with
`scripts/loop-edit.mjs`). Before the push: `scripts/verify.sh src/__tests__/revenue` (typecheck, then vitest on the whole
revenue suite — `mutation-plans.test.ts` must see every new plan entry apply); merge with `scripts/merge-worktree.sh`. No
CI runs while Actions is disabled **[main thread]**, so the local run is the proof. Folds 1-8 are one build and lift the
hold together (decision 6); 9 may ride with it.

1. **`src/revenue/money.ts`** — beside `chainTxId` (`:104-109`): `export const DIGESTED_SOURCES: ReadonlySet<string> = new
   Set(["gumroad"])`; `export const STORED_EXTERNAL_ID_RE = /^sha256:[0-9a-f]{64}(?::(?:refund|fee))?$/`; `export function
   storedExternalId(source: string, id: string | null | undefined): string | null` and `export function isStoredForm(source,
   id): boolean`, exactly as decision 2 item 1 specifies (null → null; non-digested source → unchanged; stored form →
   unchanged; else split `:refund`/`:fee`, `createHash("sha256").update(base, "utf8").digest("hex")`, prefix `sha256:`,
   re-append). Doc comment names this ruling and C1-C2.
2. **`src/revenue/ledger.ts`** — `:450` becomes `const externalId = storedExternalId(source, input.externalId?.trim() || null);`
   (after `source` is lower-cased at `:448`); `:432-442` gains a paragraph: a digested source's id is stored as its digest
   (RULING-2026-10-11 row 26), the two purposes kept; `:497-498` gains "for a digested source the platform's id is stored as
   `sha256:<hex>`". Nothing else in the function moves.
3. **`src/revenue/connectors/gumroad.ts`** — `:52` `externalId: storedExternalId("gumroad", String(sale.id))`; `:54` the same
   with `` `${…}:refund` `` built on the stored form (or `storedExternalId("gumroad", `${sale.id}:refund`)`, which the function
   makes equal); `:58` likewise for `:fee`; import from `../money.js`; one header sentence (`:1-19`) naming the rule. The
   raw `sale.id` must appear in no entry field, the cursor (`:47-48`, a day) and `unmapped` (`:45`, a product id) unchanged.
4. **`src/revenue/heartbeat.ts`** — in `runAudit`, after the duplicate count (`:654-659`): select `source, external_id` where
   `external_id IS NOT NULL` and `source` in `DIGESTED_SOURCES`; count those failing `isStoredForm`; push
   `` `${n} gumroad ledger rows carry a raw external id (RULING-2026-10-11 row 26)` `` (the source named per source if the
   set ever grows) to `chiefFindings`.
5. **`src/revenue/tools.ts`** and **`scripts/colony.ts`** — `tools.ts:206` prints `storedExternalId(source, …)`; `:165` and
   `:176` say a `gumroad` id is stored as its sha256 digest and may be passed raw or stored; `colony.ts:330` prints the stored
   form; `:120-122` the same sentence in the help.
6. **`scripts/colony.ts` `verify-gumroad`** (decision 2 item 8) — read-only through the query-only handle `report` uses
   (`:255`); a shared pager `listGumroadSalesSince({token, after, productId?, fetchImpl})` in `gumroad.ts` lifted from
   `:229-240` and reused by `readProRefundCount` (behaviour unchanged, its tests green); the four finding classes and the
   exit codes 0/2/3; `--json`. Output contains no raw id, email or token (a test greps the fake sale id and the fake token
   out of stdout). The `verify-gumroad` text in the CLI help (`:100-124`).
7. **Tests** (`src/__tests__/revenue/`), each named here so the build is judged against them:
   - `ledger.test.ts`: (a) a `gumroad` sale booked with a raw id stores `external_id` matching `STORED_EXTERNAL_ID_RE`,
     equal to `"sha256:" + sha256(raw)` computed in the test with `node:crypto`, and not containing the raw string;
     (b) booking the same raw id again returns `null`; (c) booking the stored form directly returns `null` (idempotent
     across raw and stored); (d) `raw`, `raw:refund` and `raw:fee` store `sha256:X`, `sha256:X:refund`, `sha256:X:fee` with one
     `X`; (e) a `stripe` and a `manual` id are stored unchanged (regression); (f) a chain-shaped string booked under
     `gumroad` in USD is digested, not refused, and no thrown message for any `gumroad` entry contains the raw id.
   - `loop.test.ts:239-252`: add that every row `runLedgerSync` recorded has `source = "gumroad"`, `external_id` in the
     stored form, and none contains `"g1"`; the fee row is `…:fee`.
   - **new `gumroad-connector.test.ts`**: `fetchSince` on one fake sale with `refunded: true` and a fee → three entries,
     `sha256:X`, `sha256:X:refund`, `sha256:X:fee`, `X` recomputed in the test from `"g1"` (the auditor's re-derivation in
     miniature); `JSON.stringify(entries)` does not contain `"g1"`; `storedExternalId` is idempotent on each; the pager
     follows `next_page_key` to the end and stops at the page cap.
   - `heartbeat` audit (in `loop.test.ts` or a new `audit.test.ts`): a raw `gumroad` row inserted by SQL → `chiefFindings`
     carries the raw-form finding with count 1; a stored-form row → no such finding; a raw `stripe` row → no such finding.
   - `colony-cli.test.ts`: `verify-gumroad` without a token → exit 2, "not configured", no fetch; with a fake fetch: a
     matched sale → exit 0; an extra ledger row → exit 3 and the finding; stdout free of the fake id and token.
   - The three hand-booked fixtures (`budget.test.ts:68`, `loop.test.ts:119`, `gumroad-refund-rate.test.ts:353`) stay as
     they are and stay green; the `usdc-unconverted*` assertions are unaffected (source `x402`).
8. **Mutation plans** (`src/__tests__/revenue/mutations/`), validated with `node scripts/mutate.mjs --check --plan <file>`
   and run inside `scripts/sim-tree.sh`: **new `gumroad.json`** for `connectors/gumroad.ts` — T69-G1 `storedExternalId("gumroad",
   String(sale.id))` → `String(sale.id)` (killed by the connector test's "no g1"); T69-G2 drop `:refund` from the refund
   entry's id (killed by the family test); T69-G3 the pager stops after page 1 (killed by the paging test); **`ledger.json`**
   gains T69-L1 `storedExternalId(source, …)` → the bare trim (killed by 7(a)); T69-L2 `new Set(["gumroad"])` → `new Set([])`
   in `money.ts` (killed by 7(a), (c)); T69-L3 the stored-form regex without the suffix group (killed by 7(d)); T69-L4 the
   split of `:refund`/`:fee` removed (killed by 7(d)); **`colony.json`** gains T69-A1 the audit's finding pushed only when
   `n > 1` (killed by the audit test), T69-C1 `colony.ts:330` printing the raw id (killed by the CLI stdout test), T69-C2
   `verify-gumroad` exit 0 on a finding (killed). `README.md`'s table gains the `gumroad.json` row and the two amended rows
   name tick 69 and this ruling.
9. **Docs and comments** — `docs/CHAIN_OF_COMMAND.md:31`: after "idempotent on `(source, external_id)`" add "(a Gumroad id is
   stored as its sha256 digest, `RULING-2026-10-11-ledger-sale-ids.md`)"; `products/il-biz-tools/README.md` beside `:738`:
   one sentence that the colony's ledger stores a digest of each sale id, never the id; `.github/workflows/colony.yml:99`:
   "`.gitignore:8` already un-ignores the database; `-f` stays as a second guard" (decision 3; optional). Run
   `pnpm -s typecheck` after; no `docs/` gate beyond the repo's own tests.
10. **Loop files (main thread, `scripts/loop-edit.mjs`, after the merge):** `logs/FABLE_QUEUE.md:50` status → "**DONE 11.10**
    (`research/channel-loop/RULING-2026-10-11-ledger-sale-ids.md`): a deterministic unkeyed sha256 of `sale.id` as
    `sha256:<hex>` is the platform transaction id (C1-C4); (ii) and (iii) rejected; `enable` and the Gumroad token wait on
    the fold; folded tick N (merge `<sha>`)"; `logs/CHANNEL_LOOP.md:134`'s bold tail → "**row 26 ruled 11.10**
    (`RULING-2026-10-11-ledger-sale-ids.md`): the ledger stores `sha256(sale.id)`; `enable` and `GUMROAD_ACCESS_TOKEN` wait
    on that fold's merge (`<sha>`), nothing on the repo's visibility"; `:308` (§8) → "Row 26 done 11.10 (…): the digest is
    the platform transaction id; the hold lifts with the fold"; `:26` (the Fable cell) → the 11.10 sitting, rows 26 and 27
    returned; §9: the fold items above as one entry, and item 6 of "What this does not decide" (the one-page `fetchSince`)
    as its own entry; `logs/CHECKPOINT.md`: the next owner summary carries the one sequencing sentence of decision 6(2) —
    the Gumroad token is asked only once the fold is on `main` — and asks nothing new.
11. **Hebrew log** for the fold tick, per `CLAUDE.md`; the sitting's own log is the main thread's.

**Checks before "done" (`verification-before-completion`):** `grep -rn -F "String(sale.id)" src/revenue/connectors/gumroad.ts`
prints nothing outside `storedExternalId(…)`; `grep -n -F "sha256:" src/revenue/money.ts src/revenue/ledger.ts
src/revenue/connectors/gumroad.ts src/revenue/heartbeat.ts` prints the four sites; `node scripts/mutate.mjs --check` on the
three plans exits 0; `scripts/verify.sh` exits 0 by the runners' codes; and this file still greps clean for the at sign and
for the owner's name pattern.
