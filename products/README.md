# products/

Sellable products built by the revenue colony. Each directory is standalone (own package.json, tests, README with deploy steps and the owner's one-time setup). They are intentionally outside the root pnpm workspace so the automaton runtime build stays independent.

| Product | Revenue line | Rail | Owner one-time step |
|---|---|---|---|
| `apify-il-open-data` | apify-actors | Apify Store, **published free** while the 30-day stranger count runs | step 6 — Apify sign-up with the brand username + `APIFY_TOKEN` (allowed straight after step 1; **no KYC**) |
| `il-biz-tools` | il-biz-tools | **Gumroad** (merchant of record, ILS payout rendered) — Paddle retired 7.9.2026 | step 3 — Gumroad account + token; step 5 — domain; step 6 — Netlify link |
| `pcn874` | pcn874 | **Gumroad** (ILS) — validator and generator built, no price set | step 3 — Gumroad account + token |
| `mcp-il-tools` | (channel test, not a line) | none — free | step 5 — domain (DNS verification for the brand namespace); step 7 — GitHub organisation |
| `telegram-il-tools-bot` | ~~telegram-bots~~ — **PARKED** | ~~Telegram Stars → TON via Fragment~~ — killed: Fragment's payout KYC needs a selfie | none — do not start it |
| `x402-il-api` | ~~paid-apis / agent-services~~ — **standby rail, not a line** | x402 (USDC on Base), kept only while it costs ₪0/month | none |

Line ids come from `src/revenue/portfolio.ts` and do not all match their directory name; this table is the mapping. Owner steps are numbered as in `docs/OWNER_STEPS.he.md` and defined as data in `src/revenue/owner-steps.ts`.

## What the board decided on 7.9.2026, and what it means for this directory

`research/colony-sweep/BOARD.md` cut the portfolio to four lines. **No product was deleted, and none
left the CI matrix** — killing a line is a decision about how it gets paid and who finds it, not a
verdict on the code:

- **`telegram-il-tools-bot` is parked.** Its line was killed on a mandate collision: Fragment's payout
  KYC is an ID scan plus a **selfie**, and the owner's brief forbids a camera step. Nothing is built on
  it and nothing is expected from it. It re-opens only if Fragment renders a camera-free withdrawal to
  an Israeli resident (`docs/REJECTED.md`).
- **`x402-il-api` is a rail on standby.** `paid-apis` and `agent-services` were killed because the
  x402 arithmetic divides out to single-digit shekels per provider per month. The endpoint may stay
  deployed **only while it costs ₪0/month**; any USDC that arrives is booked through
  `src/revenue/connectors/x402-local.ts`, and nothing is planned on it.
- **`il-biz-tools` moved from Paddle to Gumroad.** Gumroad is the only merchant of record with rendered
  proof of ILS payout to an Israeli bank. Paddle is now an option the owner may choose knowing three
  named risks, recorded in `src/revenue/rails.ts` — never a step on his checklist.
- **`pcn874` is the one new product.** Its validator and its generator exist (`products/pcn874/`, 257 tests over 26 fixed-width fixtures and 8 CSV inputs). **Since
  7.9.2026 its record layout comes from the Israel Tax Authority's own circular to software houses** —
  Appendix A (layout), B (representatives' file), C (permitted values) — which `render-watch.yml` fetched
  from GitHub Actions and which is stored as extracted text in `research/rendered/`. Every rule in
  `products/pcn874/docs/SPEC.md` cites that document by line; the three open-source implementations it
  was previously built from are now corroboration. **Six of the seven recorded disagreements are
  resolved** (five by the document, one by a newer vendor manual); the `reportedVat` arithmetic and the
  line-ending/empty-file questions **stay open, and no rule was invented for them**. The document also
  contradicted all three implementations once — the reference-group field takes letters, and the old
  validator would have rejected a legal file — which is what that caveat was for.
  **A refutation audit then went over the whole thing** (`research/colony-sweep/audits/pcn874-reconciliation.md`):
  all thirteen resolutions held on their primary quote, but several of the *rules* built on them did
  not, and it built files to prove it both ways. **Nine rules moved.** Two counter-party gaps became
  errors (`T M C P I` must name their party; an identified sale above ₪5,000 must name its customer)
  and two new warnings appeared (note E's petty-cash cap; `H`'s counter party). Five rules were
  demoted from error to warning because no cited line states them — the alphabet of an `A(4)` field,
  the file's encoding, a closing dealer id differing from the header's, the generation date's format,
  and the sign of a zero invoice total when the VAT is not zero. The test that was supposed to guard
  this passed with three unsupported errors because it only checked that a citation *existed*; there
  is now a second test that reads the cited lines and requires the finding's quote to come from them.
  **What is still not verified:** the circular is from **2009** and carries no version number; no later
  edition of the layout has been rendered, and the two newer Hebrew documents are vendor user manuals
  that do not restate the byte layout. `.github/workflows/pcn874-spec-watch.yml` watches all three
  hashes so a new edition is noticed rather than assumed away.
  **The generator was built on 7.9.2026** (`products/pcn874/docs/GENERATOR.md`): a documented CSV of
  documents in, the fixed-width file out, widths taken from the layout table and every header total the
  circular defines as a sum or a count computed from the details. It **refuses to write a file its own
  validator rejects** — it builds the text, runs `validatePcn874` on it, and returns nothing at all if
  that reports an error — and it **will not compute `reportedVat`**: the circular defines the field and
  states no arithmetic for it, so the figure is taken from the user and the generator refuses without
  one. It has no price, it still never says a file will be accepted — it points at the Authority's free
  simulator for that — and a wrong PCN874 file is the user's VAT exposure.

**Products with no line:** `mcp-il-tools`, which is a distribution channel test rather than a
storefront, and whose registry listing is blocked on the domain (step 5) and the organisation (step 7).

**Lines with no product:** `oss-bounties`, which never gets one — it sells work performed on demand for
a named payer, so its "product" is a pull request.
