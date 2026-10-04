/**
 * Revenue Colony — the owner's one-time checklist, as data.
 *
 * MISSION rule 1: the owner's involvement is what we minimise, and it is not
 * zero. Payment platforms pay identified humans only, so a small number of
 * one-time identity and payout steps are legally unavoidable. Everything else
 * is ours. The mandate adds two hard edges around that list — **batch every
 * unavoidable step into ONE ordered checklist**, and **never invent a step that
 * is not required** — and both of them are failures of drift rather than of
 * judgement. A checklist in prose grows: someone writes "and open an accountant
 * conversation", someone else repeats "register as osek patur" once per revenue
 * line, and by the time anyone counts there are eleven steps where the audit
 * found six.
 *
 * So the checklist is code, like `rules.ts`, and `owner-steps.test.ts` holds the
 * two invariants prose could not:
 *
 *   1. There are exactly EIGHT steps. Adding another fails the build, which is
 *      the point — a new step needs a decision, not a commit. (It was seven until
 *      the breadth board of 28.9.2026 decided the eighth: the brand mailbox,
 *      research/breadth/BOARD.md Q2. The test was changed on that ruling.)
 *   2. Every live line in `portfolio.ts` is unlocked by at least one step, and
 *      every line id named here is a live line. A line blocked on nothing is a
 *      line whose blocker was forgotten; a step unlocking nothing is a step that
 *      should not be on the owner's list.
 *
 * The owner-facing text lives in `docs/OWNER_STEPS.he.md`, in Hebrew, with the
 * click paths. This file is the structure that document must not drift from, and
 * the test parses the document to check that it has not.
 *
 * Board ruling of 7.9.2026 (research/colony-sweep/BOARD.md §5): nothing added,
 * nothing removed, the numbers kept stable so they can be talked about, and only
 * the ORDER changed — **1 → 2 → 3 → 5 → 7 → 4 → 6**, with the Apify half of step
 * 6 allowed straight after step 1. The reasons: the domain and the organisation
 * carry the same brand name, so the name is bought before the org is created;
 * the org and its machine account must exist before Algora, because a bounty
 * pull request is a published byline and it may not carry the owner's handle;
 * and step 6 collects tokens that steps 3 and 7 produce.
 *
 * The owner's ₪0 rule of 27.9.2026 (MISSION.md; `budget.ts` enforces it): start
 * without spending money, put money in only once income arrives and they see it
 * works, and until then pay nothing — "not even one shekel". Two consequences
 * here, and one thing deliberately NOT changed:
 *
 *   - Step 5 (the domain) is the one step that costs money, so it is `frozen`:
 *     it keeps its number and its line mapping, the report stops asking for it,
 *     and `frozen` says what it costs to go without and what replaces it free.
 *   - Step 2 (the tax file) is HELD by a `precondition`: it is asked for only
 *     when a paid product is ready and the colony has read, at the official
 *     source, whether opening the file costs anything or starts minimum monthly
 *     payments. Until `precondition.metOn` is set the report names it outside
 *     the asked-now list, as it names the frozen domain — so an owner following
 *     the hourly report is never sent to register before that check.
 *   - The Hebrew document now leads with the free steps — the Apify half of 6,
 *     then 7, then the Netlify half of 6, then 3 (free to open; its fees come
 *     out of sales), and 2 only when a paid product is ready.
 *   - The `order` field is still the board's 7.9 ruling, and the tests still pin
 *     it. Re-sequencing is the board's call; until it re-rules, the ₪0 sequence
 *     lives in the document as text and says that it awaits the board.
 *
 * The same day the owner also gave standing consent to merge and publish under
 * the brand: the agent merges its own green pull requests without asking each
 * time, revocable the moment the owner says "עצור" (stop). PR #3 was merged on
 * that same message (merge commit 61fae4e, 22:36 UTC).
 *
 * Board ruling of 28.9.2026 (research/channel-loop/RULING-2026-09-28-bounty-rail.md
 * §4): step 4 keeps its number and its place and splits in two, the `earlyPart`
 * shape step 6 already had. 4a — a two-minute sign-in to Algora as the brand
 * machine account, no identity — rides step 7's sitting. 4b — the Stripe form in
 * the owner's identity — is HELD by a `precondition` until the corrected week-4
 * supply count is 3 or more and Algora holds a reward for a merged brand-account
 * PR, and it carries three `stopIf` rules. BRAND_GITHUB_TOKEN is made in step 7's
 * sitting and pasted in step 6 with the others; the intake is gated in code until
 * the board's clock allows it, so the token's presence changes nothing before then.
 *
 * Breadth board of 28.9.2026 (research/breadth/BOARD.md), two changes:
 *
 *   - Q2: step 8, the brand mailbox, is ADDED and asked now — ordered second,
 *     straight after merge-pr. A Google account under the brand name, so one
 *     account later serves YouTube (until ruling 30.9 16(c) moved Stage A to a dedicated account) and Search Console (Play Books too, until it was
 *     killed 28.9 in tick 6: Israel is not a supported country); free, about ten
 *     minutes, no identity beyond a phone check. Every other step keeps its number
 *     and moves one place down the order: 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6.
 *   - Part B(b): 4a is DROPPED. Its only stated reason — creating the Algora user
 *     a reward's credit needs — was refuted in Algora's own code (a /claim creates
 *     the solver's user: workspace.ex ensure_user → create_user_from_github), and
 *     MISSION rule 1 says never invent a step that isn't required. Step 4 is 4b
 *     alone, held as before, and its form begins with the sign-in.
 *
 * Loop board of 29.9.2026 (research/channel-loop/RULING-2026-09-29-loop.md), text
 * only — no step added, removed, renumbered or reordered in code:
 *
 *   - (b): step 8 is first among the free steps (step 1 is done, and step 8 already
 *     had order 2). What waits on it is counted ONCE, in its `unlocks` and in one line
 *     of the Hebrew document: the owner's steps are named "once per summary, without
 *     nagging", so only order and information may change, never tone or frequency.
 *   - (e)3: after step 2 the runner issues the payout documents payee-billing
 *     platforms need; the owner signs nothing per payout (`tax-file`'s `unlocks`).
 *   - (a), (g): the proposed Mozilla add-ons step (14) is gone with Firefox's kill,
 *     and PayPal's proposed step 13 has condition (i) met; both live only in the
 *     Hebrew document's "later" section and in logs/CHANNEL_LOOP.md, never here.
 *
 * Ruling of 4.10.2026 on Mozilla's precondition (research/channel-loop/RULING-2026-10-04-mozilla-precondition.md
 * §2 rule 3) — no step added, removed, renumbered or reordered:
 *
 *   - Step 7's sitting gains the organisation's ₪0 fence for the open repo-visibility decision (logs/CHANNEL_LOOP.md
 *     §6): a $0 Actions product-level budget scoped to the whole organisation with "Stop usage when budget limit is
 *     reached" ticked, created before any private repository exists there; the included-usage alerts; and a read-only
 *     token (Administration: read on the organisation, never write) so a runner can read the budget back. Mozilla's
 *     dry-run harness (loop row 8) is one line that would use the fence and asks the owner for nothing of its own.
 *   - That token is a step-6 secret row, ORG_BUDGETS_READ_TOKEN, made in step 7's sitting as BRAND_GITHUB_TOKEN is
 *     (`madeIn`). Nothing reads it yet: the budgets read is built after step 7.
 *   - Step 7's estimate goes from 10-15 to 15-20 minutes for the two additions.
 */

import { DEFAULT_PORTFOLIO, humanSetupItemFor } from "./portfolio.js";
import type { RevenueLine, RevenueLineSeed } from "./types.js";

export type OwnerStepId =
  | "merge-pr"
  | "tax-file"
  | "gumroad"
  | "algora-stripe"
  | "domain"
  | "ci-tokens"
  | "github-org"
  | "brand-mailbox";

/**
 * A condition on the site's own config under which a secret row is asked. The colony makes it true, never the owner.
 *   - "posthog-project-exists": `posthog.projectId` in products/il-biz-tools/src/config/site.json is non-empty. The agent
 *     creates the brand's PostHog project through the connector and writes the id there first
 *     (research/channel-loop/RULING-2026-09-30-documents.md (c) call 4).
 */
export type SecretRowGate = "posthog-project-exists";

/** How the report names a gate that still holds a row back: a reason, never something for the owner to do. */
export const SECRET_ROW_GATE_SHORT: Record<SecretRowGate, string> = {
  "posthog-project-exists":
    "waits until the colony has created the brand's PostHog project (posthog.projectId in products/il-biz-tools/src/config/site.json)",
};

/** How the report says a gate now holds, when it asks a row a done step held back. */
export const SECRET_ROW_GATE_MET: Record<SecretRowGate, string> = {
  "posthog-project-exists":
    "the colony has since created the brand's PostHog project (posthog.projectId in products/il-biz-tools/src/config/site.json)",
};

/** One row of step 6's secrets table. */
export interface OwnerSecretRow {
  /** The secret's exact name under Settings → Secrets and variables → Actions. */
  name: string;
  /** Where its value comes from. */
  source: string;
  askedOnlyWhen?: SecretRowGate;
  /**
   * The step whose sitting makes this secret, when it is not the step that pastes it: step 6 pastes the Gumroad token
   * step 3 mints and the machine account's token step 7's sitting creates. The paste cannot come first, so a step is
   * never recorded done — which says its rows went in — before the step that makes one of them
   * (`secretRowsPastedBeforeMade`; owner-steps.test.ts holds the checklist to it, and `source` must name this step).
   */
  madeIn?: OwnerStepId;
  /**
   * Set only for a row its step's `doneOn.heldRows` names, when the row's secret is verifiably pasted afterwards, with
   * the evidence. Until then the row is owed: asked alone once its gate holds (`followUpSecretRows`), named as held
   * before that (`heldFollowUpSecretRows`). A row pasted with its step needs none: the step's `doneOn` covers it.
   */
  doneOn?: { date: string; evidence: string };
}

/** The site facts a row's gate reads; `readSite()` in page-views-reader.ts returns a superset. */
export interface SecretGateSite {
  projectId: string;
}

export interface OwnerStep {
  id: OwnerStepId;
  /**
   * The number the owner sees in `docs/OWNER_STEPS.he.md`. Deliberately NOT the
   * execution order: the board reordered the steps and kept the numbers fixed so
   * that "step 4" means the same thing in every conversation that already
   * happened.
   */
  number: number;
  /**
   * Execution order, 1..8, as ruled by the boards: 1, 8, 2, 3, 5, 7, 4, 6 (7.9.2026's order with step 8 put second
   * by the breadth board of 28.9.2026).
   */
  order: number;
  /** The heading in the Hebrew document. */
  title: string;
  /** Minutes, as a range. Both ends equal where the estimate is a point. */
  minutes: [number, number];
  /** What this step makes possible that was impossible before it. */
  unlocks: string;
  /** Revenue line ids that cannot earn until this step is done. */
  lines: string[];
  /** The chief audit's owner-blocker catalogue item, or null where it is not an identity step. */
  catalogueRef: string | null;
  /**
   * A half of the step that may be done earlier than its place in the order,
   * and the step it may follow. Only step 6 has one, and it matters: the Apify
   * token is what starts the 30-day stranger count, a month earlier than the
   * rest of the checklist would allow. (Step 4 had one, 4a, from the bounty-rail
   * ruling until the breadth board dropped it on 28.9.2026.)
   */
  earlyPart?: { what: string; afterStep: OwnerStepId; minutes: number };
  /**
   * Conditions under which the owner closes the tab and tells the colony, completing nothing. Printed on the step in the
   * Hebrew document as "עצור אם". Each one names what it means, so the stop is an observation rather than a judgement.
   */
  stopIf?: string[];
  /** A decision the board left to the owner inside this step. Not a step itself. */
  ownerDecision?: string;
  /**
   * Set only when the step is verifiably done, with the evidence. The report stops
   * asking for it, and a test keeps the Hebrew heading's "✅ בוצע" in step with it.
   *
   * `heldRows` is required (a test says so) on a step that has gated secret rows: the gated rows whose gate did NOT
   * hold on the day the step was done, so the owner was not asked for them and did not paste them — `[]` when every
   * row went in with the step. A done step no longer asks anything, so a held row would otherwise be lost with it; the
   * report asks each one alone once its gate holds, until the row carries its own `doneOn`.
   */
  doneOn?: { date: string; evidence: string; heldRows?: string[] };
  /**
   * Something that must be true BEFORE the owner is asked for this step, and
   * that the colony establishes itself — not an owner action; the point is that
   * the owner is not asked to find it out. While `metOn` is unset the step is
   * HELD: it still gates its lines (they cannot earn without it), but the report
   * does not ask for it — it names it outside the asked-now list, with `short`,
   * exactly as it names a frozen step. `what` is the full condition; `short` is
   * the phrase the report prints after "step N"; `metOn` is set, with evidence,
   * only when every part of `what` holds, and only then is the step asked for.
   */
  precondition?: { what: string; short: string; metOn?: { date: string; evidence: string } };
  /**
   * Set when the owner has put the step on hold. It stays on the list with its
   * number and its lines, because it comes back when the owner decides; until
   * then the report does not ask for it, and a test keeps the Hebrew heading's
   * "⏸ מוקפא" in step with it. `rule` is a short name the report prints; `why`
   * says what the rule is; `costs` is what going without the step costs, said
   * plainly; `freeInstead` is what replaces it at ₪0.
   */
  frozen?: { since: string; rule: string; why: string; costs: string; freeInstead: string; returnsWhen: string };
  /**
   * The GitHub secrets the owner pastes in this step — the rows of the table in the Hebrew document (step 6, part ב),
   * in the same order. A row with `askedOnlyWhen` is held back until something the colony makes itself exists, so the
   * owner is never asked for a key to nothing; `isSecretRowAsked` reads it. Only step 6 has rows.
   */
  secrets?: OwnerSecretRow[];
}

export const OWNER_STEPS: OwnerStep[] = [
  {
    id: "merge-pr",
    number: 1,
    order: 1,
    title: "למזג את PR #2 ב-GitHub (או להגיד לי \"תמזג\")",
    minutes: [2, 2],
    unlocks:
      "Consent, not identity: it puts colony.yml and every future workflow on `main`, and GitHub runs scheduled work only there. Nothing CI-executed — the Apify push, the Netlify deploys, the scheduled ledger sync — runs before it, so it gates the MEASUREMENTS and not only the hourly report. Since 27.9.2026 the owner's standing consent covers every later merge: the agent merges its own green pull requests and publishes under the brand without asking each time, until the owner says \"עצור\". The same message said \"תמזג\", and PR #3 was merged on it (merge commit 61fae4e, 27.9.2026 22:36 UTC).",
    lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"],
    catalogueRef: null,
    doneOn: {
      date: "2026-09-22",
      evidence:
        "merge commit 31cda66 (PR #2); colony.yml runs on main since, scheduled hourly (GitHub fired it 29 times in 122.6 hours to 28.9.2026 00:43 UTC, about every 4.4 h). PR #3 merged 27.9.2026 22:36 UTC (merge commit 61fae4e) on the owner's \"תמזג\" of that day, which also gave standing consent to merge and publish under the brand",
    },
  },
  {
    id: "brand-mailbox",
    number: 8,
    // Second in the ask-now sequence, straight after merge-pr (research/breadth/BOARD.md Q2 and §"Exact changes").
    order: 2,
    title: "תיבת דואר של המותג (חשבון Google בשם המותג)",
    minutes: [10, 10],
    unlocks:
      "A Google account under the brand (Gmail, mehudak) — the inbox every new-account venue needs for verification mail and one-time codes, and the brand-owned accessibility contact that is il-biz-tools' last publish gate. It is a Google account rather than a mailbox elsewhere because the same account later serves Search Console; YouTube Stage A uses a dedicated brand Google account (ruling 30.9 16(c)). Google Play Books Partner Center was another use until 28.9.2026, when it was killed: Israel is not a supported country (research/measurements/google-play-books.md). If Google's sign-up asks for more than a phone number — an ID document, a video or a payment — stop and use a free Outlook.com mailbox instead (IMAP). The owner's own phone number for the sign-up check is allowed (private, no camera); it is never the owner's personal Gmail (PUBLISH-9). The agent reads it and the owner never answers anyone: a second Gmail connector for the brand account in this environment, and for CI an app password (or OAuth token) as a secret of the GitHub environment brand-mailbox, whose deployment branches are limited to main — not a repository secret, which every branch and workflow could read. Once step 8 is done, the tick's probe will report the unread count, with accessibility mail unanswered for 7 days as a blocker, and the colony will answer accessibility mail itself — neither runs yet: the probe is built but not scheduled (scripts/brand_mail.py probe via .github/workflows/brand-mail.yml, dispatch only; the report already reads its numbers from state/colony/brand-mail.json, and it joins colony.yml's schedule once this step is done), and the responder is not built. Every written question the colony sends a platform from this address discloses that it comes from the company's automated operator (as disclosure.ts does), which is what lets the colony ask the written questions that decide CrazyGames (runner-operated submission) and Spreadshirt (automated uploads); the seven are drafted in research/owner-asks/questions.json and leave through the same workflow, dry run first. The address is published only as the brand's accessibility contact. Cost ₪0; about ten minutes; no identity step (research/breadth/BOARD.md Q2, 28.9.2026). It is first among the free steps because it unblocks more than any other (loop board 29.9.2026, research/channel-loop/RULING-2026-09-29-loop.md (b)): seven written questions, il-biz-tools' publish gate, the pcn874 page, npm's account (proposed step 9, not yet asked) and Displate's login (if Displate is admitted) wait on it — said once, never as a reminder.",
    lines: ["il-biz-tools"],
    // Not an identity step and not in the chief audit's catalogue: a brand account asked for by the breadth board.
    catalogueRef: null,
  },
  {
    id: "tax-file",
    number: 2,
    order: 3,
    title: "פתיחת תיק עוסק פטור + רישום בביטוח לאומי",
    minutes: [60, 90],
    unlocks:
      "The legal right to receive any shekel at all. This is the law rather than a platform's requirement: business income needs a file at the Tax Authority, and ₪10 counts. Written here ONCE — it used to be repeated in every line's humanSetup, which is how a six-item catalogue reads as eleven. After it, the company issues its own payout documents (an exempt dealer's receipt or payment demand, generated by the runner from the payer's own statement and sent from the brand mailbox to payee-billing platforms), and the owner signs nothing per payout (loop board 29.9.2026, research/channel-loop/RULING-2026-09-29-loop.md (e)3, under its six conditions; the first document waits for the bookkeeping read that ruling names). As narrowed by the documents ruling of 30.9.2026 (research/channel-loop/RULING-2026-09-30-documents.md (a)): the first document goes out only after the signature question is closed. The form is delivered by hand or through an accountant, lawyer, tax adviser or bookkeeper under reg 2(א)(1) of the VAT registration regulations as read; an online route on the Tax Authority's site is unverified from here. The occupation line describes the business as it runs (digital tools and software, licence sales, platform royalties and revenue shares; operated by an automated system of AI agents on the business's behalf), the office decides the class, and if the approval says עוסק מורשה the owner writes that word with 'צעד 2 בוצע', because the documents and the reporting then change. The law attaches to the exempt status an annual turnover declaration by 31 January (reg 15), which the runner computes from the ledger and drafts (who delivers it is not stated in the text read), and a one-time registered-mail notice to the assessing officer and the VAT Director before the first computerised document (§18ב(ב); reg 2(א)(2) of the VAT bookkeeping regulations), recorded and not asked while the cost of registered mail is unchecked. The exemption from periodic reports is reg 22(2) of the general VAT regulations (a 2023 text read on GitHub), which reaches the exempt dealer by inference through §31(3).",
    lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.1",
    precondition: {
      what:
        "Under the owner's ₪0 rule this step is asked for only when a paid product is ready to go on sale — nothing is put up for sale before it anyway — and before asking, the colony establishes from the official sources (the Tax Authority and Bituach Leumi themselves, rendered, not a summary) whether opening the file or registering costs anything or triggers minimum monthly payments. Until that is rendered the colony states no figure for it.",
      short: "only when a paid product is ready, after the official cost check",
      // metOn stays unset until BOTH hold: a paid product is ready to go on sale,
      // and the Tax Authority's and Bituach Leumi's own pages on the cost of
      // opening the file are rendered and read. Setting it is what makes the
      // hourly report ask the owner for step 2.
    },
    ownerDecision:
      "The 'one paid conversation with an accountant' that used to sit inside this step is NOT a step — the owner's brief is verbatim 'אני לא מדבר עם אנשים'. Default until they say otherwise: treat all income as taxable and do not zero-rate under §30(א)(5). The switch to עוסק מורשה is raised by the watchdog at a number (₪8,000 rolling 30-day revenue), never by a conversation.",
  },
  {
    id: "gumroad",
    number: 3,
    order: 4,
    title: "חשבון Gumroad + טוקן",
    minutes: [20, 20],
    unlocks:
      "The only merchant-of-record rail with RENDERED proof of a native ILS payout to an Israeli bank (Freemius pays Israel from a USD balance, ILS only via Wise or wire) (Gumroad's own _13-getting-paid.html.erb carries a row reading `Israel | ILS`). It collects from the buyer, holds 7 days, and pays out in shekels above a $100 balance. It supplies no buyers — its Discover gate requires a sale to already exist — so it is a rail, not a storefront. The dashboard-minted token carries edit_products (Gumroad doorkeeper.rb:10, oauth_application.rb:121-122), so the agent creates the Pro product with Gumroad's own licence-key block, and Gumroad mints and emails a key per sale — there is no per-sale owner step (research/measurements/gumroad-license-decision.md, Option C). The account is opened with the brand mailbox (owner step 8), never a personal address: a buyer's reply to the Gumroad receipt, a refund request or a question goes to that address, and the colony reads only the brand mailbox — so the product job refuses to enable the Pro product until the brand-mail probe is green (products/il-biz-tools/scripts/gumroad-pro-product.js, enableProduct; research/tiktok/08-sales-marketing-lessons.md N6). Receipt replies go to the account's Support email when one is set, so the owner leaves Settings → Support → Email blank or sets it to the brand mailbox, sets no product-level support address, and names the account (name) Mehudak, which prints on receipts, invoices and the refund email (research/channel-loop/RULING-2026-09-30-documents.md (d)).",
    lines: ["il-biz-tools", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.2",
    ownerDecision:
      "Paddle is an OPTION, not a step, and the board recommends against it: Sumsub may demand a selfie video (a mandate collision), approval is discretionary and pre-revenue sellers have been refused, and ILS is not a payout currency. Gumroad covers the same products.",
  },
  {
    id: "domain",
    number: 5,
    order: 5,
    title: "לקנות דומיין",
    minutes: [10, 10],
    unlocks:
      "Anonymity and search, both. A gTLD (.com or similar) at a registrar with WHOIS privacy on by default — a registrant name in public WHOIS is a published identifier, and .co.il only if ISOC-IL privacy is confirmed first. Without it the MCP registry derives the public namespace from the GitHub account, every site URL stays *.netlify.app, and no line that depends on search exists.",
    lines: ["il-biz-tools", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.4",
    ownerDecision:
      "If the owner reopens it after income, the first year is one card payment from the float the owner then sets (the ₪200 of 3.9.2026 is suspended by the 27.9 rule and the float is ₪0 until they say otherwise), with the receipt id recorded as a cost in the ledger. The RENEWAL is a recurring cost, which MISSION says is the owner's decision every time; the watchdog raises it 30 days before expiry. The float never becomes a subscription.",
    frozen: {
      since: "2026-09-27",
      rule: "the owner's ₪0 rule of 27.9.2026",
      why: "Nothing is spent until income arrives and the owner decides to spend, and a domain is the one step on this list that costs money.",
      costs:
        "Every site URL stays on *.netlify.app, which reads as a provider's address rather than a company's; Google search reach is weaker without a domain of our own, and the chief audit made a domain one of three preconditions before any SEO hour (TARGET_BASIS for il-biz-tools in portfolio.ts), so no SEO work is done while it is frozen and the search-dependent part of il-biz-tools and pcn874 rests on whatever Google finds unaided; and the MCP registry's reverse-DNS namespace (com.mehudak) is not available, because it is proven against a domain.",
      freeInstead:
        "Sites deploy on *.netlify.app (Netlify's free subdomain). The MCP registry namespace comes from GitHub instead: a GitHub Actions workflow in a repository the brand organisation owns may publish as io.github.<organisation>/* (read from the registry's source 27.9.2026: modelcontextprotocol/registry@bf4e88c, internal/api/handlers/v0/auth/github_oidc.go, buildPermissions grants io.github.<repository_owner>/*), so after step 7 it is io.github.mehudak and the owner's own handle still never appears. WHOIS privacy is moot: with no domain there is no registrant record.",
      returnsWhen: "only when the owner decides to spend, after the ledger shows income",
    },
  },
  {
    id: "github-org",
    number: 7,
    order: 6,
    title: "להעביר את הריפו לארגון ב-GitHub (וחשבון מכונה בשם המותג)",
    minutes: [15, 20],
    unlocks:
      "Takes the owner's name off every raw.githubusercontent.com URL in the repository, and creates the ONE brand machine account GitHub's terms allow alongside a personal account. That account is what authors bounty pull requests and signs in to Algora — an organisation cannot sign in anywhere, so the org alone does not fix the byline. In the same sitting the owner creates its personal access token, BRAND_GITHUB_TOKEN, pasted in step 6 with the others (RULING-2026-09-28-bounty-rail.md §4.4). It is an ordinary User account whose login does not end in \"bot\" — Algora's contributor queries drop %bot logins, and a GitHub App (type Bot) fails its human-author check (BOARD-2 §2.1.3(c); bounties/intake.ts brandAccountProblems). " +
      "The same sitting sets the organisation's ₪0 fence for the open repo-visibility decision (logs/CHANNEL_LOOP.md §6; a private repository meters Actions minutes, the colony's own hourly workflows included): on the organisation's Billing & Licensing → Budgets and alerts, a $0 Actions product-level budget scoped to the whole organisation with \"Stop usage when budget limit is reached\" ticked, created before any private repository exists in the organisation (a budget counts only metered use from its creation onwards, gh-docs-budgets-and-alerts-2026-09-29.txt:277); the included-usage alerts opted in; and a read-only token, ORG_BUDGETS_READ_TOKEN, so a runner can read the budget back before the first metered-capable minute. The ruling's shape: the machine account is made a billing manager and its fine-grained PAT takes the organisation as resource owner with Administration: read only; if GitHub refuses, a PAT of the owner's own account with that one permission. Never Administration: write, which can delete the budget or switch its stop off. That part is held, not asked, until one decision is recorded: the ruling chose the role before its list was read (RULING-2026-10-04-mozilla-precondition.md §2 rule 3), and the list, read 4.10 from github/docs (data/reusables/billing/org-billing-manager-permissions.md, which adding-a-billing-manager-to-your-organization.md:24 includes), gives a billing manager \"Add, update, or remove payment methods.\", \"Upgrade or downgrade between\" the Free and Team plans and \"Start, modify, or cancel sponsorships.\" — three ways to spend money — beside viewing usage, budgets and receipts and inviting billing managers. It cannot create or access repositories (adding-a-billing-manager-to-your-organization.md:31). Its list says only \"View organization-level budgets.\", but the budgets page addressed to the role (gh-docs-set-up-budgets-2026-09-29.txt:295) says a budget can be edited or deleted at any time (gh-docs-set-up-budgets-2026-09-29.txt:361), so the role's own session may be able to remove the $0 fence, which the read-only token cannot. If the page offers no Actions product-level budget, refuses $0 or shows no stop option, the owner records what it showed and no private repository is created in the organisation. Mozilla's dry-run harness (loop row 8) is one line that would use the fence; it runs only after the read passes and asks for nothing of its own (RULING-2026-10-04-mozilla-precondition.md §2).",
    lines: ["oss-bounties", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.6",
    ownerDecision:
      "The alternative is accepting their own GitHub handle on bounty pull requests for that one line. The board's default is the machine account.",
  },
  {
    id: "algora-stripe",
    number: 4,
    order: 7,
    title: "Stripe Connect Express דרך Algora",
    // 4b alone, 15 minutes, held (RULING-2026-09-28-bounty-rail.md §4.1). The 2-minute 4a was dropped by the breadth
    // board of 28.9.2026 (research/breadth/BOARD.md Part B(b)); the sign-in is now the form's first instruction.
    minutes: [15, 15],
    unlocks:
      "The shortest documented path to a platform transaction id — 2-5 days after a rewarded pull request. Done SIGNED IN AS THE BRAND MACHINE ACCOUNT (which is why it follows step 7); the Stripe form stays in the owner's legal identity, which is exactly what the mandate allows. What it settles is now only Algora's own behaviour: the platform-level question is rendered (standalone Stripe for an Israeli business, no; a US platform paying an Israeli individual through Global Payouts, yes — research/measurements/stripe-israel.md Q1, Q7), and Algora's code shows it creates the account with no service agreement and falls back to a country-less account on any Stripe error (payments.ex:299-303). So 4b is asked when there is money to collect and not before: Algora holds a reward as a credit until the account can be paid (payments.ex:352-353, 479-503). Verified 28.9.2026 as the ruling's §4.1 caveat asked, from algora-io/algora on GitHub: a reward records the credit without checking payouts_enabled (bounties.ex create_payment_session → create_transaction_pairs), and a /claim creates the solver's Algora user from the GitHub login if none exists (workspace.ex ensure_user → create_user_from_github) — so 4b stays after a held reward and never before the first /claim, and no separate earlier sign-in is required (the breadth board dropped the old early sign-in part on that finding, research/breadth/BOARD.md Part B(b)).",
    lines: ["oss-bounties"],
    catalogueRef: "CHIEF-AUDIT §4A.3",
    precondition: {
      what:
        "4b — the Stripe Connect Express form, individual, Israel, Israeli bank — is asked only when BOTH hold: the corrected week-4 mean of the weekly claimable-supply count is 3 or more (the first count, 108, was struck as an instrument fault on 28.9.2026 and the four-week clock restarted at the first corrected run), and at least one bounty PR from the brand account has been rewarded and Algora holds the credit — a held reward (RULING-2026-09-28-bounty-rail.md §4.1). Under 3 the line is killed and 4b is never asked. The form begins with signing in to Algora with GitHub as the brand machine account, which is its first instruction; there is no earlier part (research/breadth/BOARD.md Part B(b)).",
      // Printed after "step 4 " in the report, so it must not open with the step number again.
      short: "Stripe form 4b, asked only after a corrected week-4 count of 3 or more and a reward Algora holds — the form begins with the Algora sign-in",
      // metOn stays unset until both hold, with the week-4 reading and the held credit as evidence.
    },
    stopIf: [
      "The form shows the account country as United States, or asks for a US bank account, SSN, ITIN or EIN: Algora's country-less fallback fired (payments.ex:302), the rail is closed and the line killed the same day (KILL-5), docs/REJECTED.md gets the row with the reopen trigger of §4.2.",
      "It asks for a selfie, a liveness check or a video: the camera rule (KILL-4), same-day kill, same file.",
      "It asks for any payment, deposit or fee: the owner's ₪0 rule of 27.9.2026.",
    ],
  },
  {
    id: "ci-tokens",
    number: 6,
    order: 8,
    title: "לחבר את Netlify, להדביק את הטוקנים ב-GitHub, וקליק אחד ב-Apify",
    minutes: [15, 20],
    unlocks:
      "Converts every 'the owner must push' recurring operation into a one-time step. Netlify link deploys the site; GUMROAD_ACCESS_TOKEN lets the loop read sales and write each one to the ledger with its transaction id — which is the definition of money here; the same token creates the il-biz-tools Pro product once (Option C, Gumroad-native licences); BRAND_GITHUB_TOKEN, made in step 7's sitting and pasted here with the others, lets bounty PRs leave the brand account once the board's week-4 clock allows it — the intake is gated in code until then (RULING-2026-09-28-bounty-rail.md §4.4). ORG_BUDGETS_READ_TOKEN, also made in step 7's sitting (Administration: read on the organisation, nothing else), lets a runner read the organisation's $0 Actions budget back before the first metered-capable minute; nothing reads it yet, because the budgets read is built after step 7 (RULING-2026-10-04-mozilla-precondition.md §2), and its item in step 7 is held on one decision about the billing-manager role. POSTHOG_READ_KEY, a PostHog personal API key with the query-read scope only, turns on the weekly page-view reader, which is a strict no-op without it, so without it Pro's PASS gate is never read; it is asked only after the agent has created the brand's PostHog project and written its id to site.json, and only while PostHog's query API stays on the free tier (research/channel-loop/RULING-2026-09-30-documents.md (c) call 4). The container cannot reach Netlify, Apify or Gumroad; GitHub Actions runners can.",
    lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.5",
    secrets: [
      { name: "GUMROAD_ACCESS_TOKEN", source: "the Gumroad access token from step 3", madeIn: "gumroad" },
      { name: "APIFY_TOKEN", source: "the Apify personal API token (part ב, item 2)" },
      {
        name: "BRAND_GITHUB_TOKEN",
        source: "the brand machine account's personal access token, made in step 7's sitting",
        madeIn: "github-org",
      },
      {
        name: "ORG_BUDGETS_READ_TOKEN",
        source:
          "a fine-grained personal access token with the organisation as resource owner and Administration: read only, made in step 7's sitting (the machine account's, as billing manager; else the owner's own); held with item 9 of that sitting until one decision on the billing-manager role is recorded",
        madeIn: "github-org",
      },
      {
        name: "POSTHOG_READ_KEY",
        source:
          "a PostHog personal API key with the 'Performing analytics queries' scope only, in the account that holds the brand's project",
        askedOnlyWhen: "posthog-project-exists",
      },
    ],
    earlyPart: {
      what:
        "Apify sign-up with the BRAND as the username (the Store URL apify.com/<username>/… is public) and APIFY_TOKEN into GitHub secrets. This alone starts the 30-day stranger count a month earlier than the rest of the checklist would, and it needs no identity verification.",
      afterStep: "merge-pr",
      minutes: 5,
    },
  },
];

/** The checklist in the order the boards ruled: 1, 8, 2, 3, 5, 7, 4, 6. */
export function ownerStepsInOrder(steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

export function ownerStepById(id: OwnerStepId, steps: OwnerStep[] = OWNER_STEPS): OwnerStep | undefined {
  return steps.find((s) => s.id === id);
}

/** Every step a given revenue line is blocked on, in execution order. */
export function ownerStepsForLine(lineId: string, steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return ownerStepsInOrder(steps).filter((s) => s.lines.includes(lineId));
}

/** True while a step's precondition exists and the colony has not recorded it met. */
export function hasPendingPrecondition(step: OwnerStep): boolean {
  return Boolean(step.precondition) && !step.precondition!.metOn;
}

/** A step the owner is being asked for now: not done, not frozen, and not held by a pending precondition. */
export function isOwnerStepOpen(step: OwnerStep): boolean {
  return !step.doneOn && !step.frozen && !hasPendingPrecondition(step);
}

/** The steps a line still waits on and the owner is asked for, in execution order. */
export function openOwnerStepsForLine(lineId: string, steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return ownerStepsForLine(lineId, steps).filter(isOwnerStepOpen);
}

/** The steps that gate a line but are frozen by the owner, so nobody asks for them. */
export function frozenOwnerStepsForLine(lineId: string, steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return ownerStepsForLine(lineId, steps).filter((s) => !s.doneOn && Boolean(s.frozen));
}

/**
 * The steps that gate a line but are held by a precondition the colony has not
 * yet recorded as met, so nobody asks for them yet. A frozen step is reported
 * as frozen, not here, even if it also carries a precondition.
 */
export function heldOwnerStepsForLine(lineId: string, steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return ownerStepsForLine(lineId, steps).filter((s) => !s.doneOn && !s.frozen && hasPendingPrecondition(s));
}

/** True when a secret row may be asked now: it has no gate, or its gate holds on the site's config. */
export function isSecretRowAsked(row: OwnerSecretRow, site: SecretGateSite): boolean {
  switch (row.askedOnlyWhen) {
    case undefined:
      return true;
    case "posthog-project-exists":
      return site.projectId.trim() !== "";
  }
}

/** A step's secret rows the owner may be asked for now, in table order. */
export function askedSecretRows(step: OwnerStep, site: SecretGateSite): OwnerSecretRow[] {
  return (step.secrets ?? []).filter((r) => isSecretRowAsked(r, site));
}

/** A step's secret rows its gates still hold back, in table order: the complement of `askedSecretRows`. */
export function heldSecretRows(step: OwnerStep, site: SecretGateSite): OwnerSecretRow[] {
  return (step.secrets ?? []).filter((r) => !isSecretRowAsked(r, site));
}

/** A secret row a DONE step still owes: held back on the day the step was done, and not pasted since. */
export interface OwedSecretRow {
  step: OwnerStep;
  row: OwnerSecretRow;
}

/**
 * Every row done steps still owe, in execution order then table order: named in the step's `doneOn.heldRows` and
 * without a `doneOn` of its own. An open step owes nothing here; it asks its rows itself (`askedSecretRows`).
 */
function owedSecretRows(steps: OwnerStep[]): OwedSecretRow[] {
  return ownerStepsInOrder(steps).flatMap((step) => {
    const held = step.doneOn?.heldRows ?? [];
    return (step.secrets ?? []).filter((row) => held.includes(row.name) && !row.doneOn).map((row) => ({ step, row }));
  });
}

/** The owed rows the owner is asked for now, each alone, as a follow-up to its done step: the gate holds. */
export function followUpSecretRows(site: SecretGateSite, steps: OwnerStep[] = OWNER_STEPS): OwedSecretRow[] {
  return owedSecretRows(steps).filter(({ row }) => isSecretRowAsked(row, site));
}

/** The owed rows whose gate still holds them back: named with the reason, never asked. */
export function heldFollowUpSecretRows(site: SecretGateSite, steps: OwnerStep[] = OWNER_STEPS): OwedSecretRow[] {
  return owedSecretRows(steps).filter(({ row }) => !isSecretRowAsked(row, site));
}

/**
 * Each secret row recorded pasted before the step that makes it was done, as one sentence per row; empty when the
 * record is consistent. A row goes in with its step (the step's `doneOn.date`) unless the step's `heldRows` names it,
 * in which case it goes in on its own `doneOn.date`, or not yet. `doneOn` dates are YYYY-MM-DD, so they compare as
 * strings; the same day is fine (step 6's Gumroad row is pasted "כשצעד 3 בוצע", once step 3 is done).
 *
 * Why it matters: the report stops asking a setup item once every step it belongs to has a `doneOn`
 * (`openSetupItems`). A step 6 recorded done before step 3 would drop "paste GUMROAD_ACCESS_TOKEN (owner step 6)"
 * while the token did not exist, and nothing would ask for the paste again.
 */
export function secretRowsPastedBeforeMade(steps: OwnerStep[] = OWNER_STEPS): string[] {
  return ownerStepsInOrder(steps).flatMap((step) =>
    (step.secrets ?? []).flatMap((row) => {
      if (!step.doneOn || !row.madeIn) return [];
      const pastedOn = step.doneOn.heldRows?.includes(row.name) ? row.doneOn?.date : step.doneOn.date;
      if (!pastedOn) return [];
      const maker = ownerStepById(row.madeIn, steps);
      const madeOn = maker?.doneOn?.date;
      if (madeOn && madeOn <= pastedOn) return [];
      return [
        `step ${step.number}'s ${row.name} is recorded pasted on ${pastedOn}, but step ${maker?.number ?? row.madeIn}, ` +
          `which makes it, is ${madeOn ? `done only on ${madeOn}` : "not done"}`,
      ];
    }),
  );
}

/**
 * A line's setup items as the owner is asked them, in stored order. An item linked to its owner steps (portfolio.ts
 * `humanSetupItems`) goes once every one of those steps is done; with only some done it prints whole, followed by which
 * of its steps are done and which are still open. Steps its text names only as context never keep it. An item the
 * portfolio does not link prints as written: asking once more is cheaper than hiding an open step. Every surface the
 * owner reads uses this — the report's checklist and blockers, the board's decision and action lines, the dashboard —
 * so none of them asks for a step another says is done.
 */
export function openSetupItems(line: Pick<RevenueLine, "id" | "humanSetup">, steps: OwnerStep[] = OWNER_STEPS): string[] {
  const isDone = (n: number) => Boolean(steps.find((s) => s.number === n)?.doneOn);
  const named = (ns: number[]) => `${ns.length === 1 ? "step" : "steps"} ${ns.join(", ")}`;
  return line.humanSetup.flatMap((text) => {
    const item = humanSetupItemFor(line.id, text);
    if (!item) return [text];
    const done = item.steps.filter(isDone);
    if (done.length === item.steps.length) return [];
    if (done.length === 0) return [text];
    return [`${text} — ${named(done)} done; still open: ${named(item.steps.filter((n) => !isDone(n)))}`];
  });
}

/** What a line waiting on setup is said to wait on once none of its items is still asked. */
export const NO_SETUP_ITEM_ASKED =
  "no setup item is still asked — every owner step its items belong to is done; the line's setup is not yet recorded done";

/**
 * `openSetupItems` as one phrase, for the lines that say what a line waits on (the board's decision rationale and its
 * "waiting on creator" action): the open items joined by "; ", `NO_SETUP_ITEM_ASKED` when every item is behind a done
 * step, and "unspecified" for a line with no setup list at all.
 */
export function describeOpenSetup(line: Pick<RevenueLine, "id" | "humanSetup">, steps: OwnerStep[] = OWNER_STEPS): string {
  const items = openSetupItems(line, steps);
  if (items.length) return items.join("; ");
  return line.humanSetup.length ? NO_SETUP_ITEM_ASKED : "unspecified";
}

/** Line ids that no step unlocks — always empty, and the test says why that matters. */
export function linesWithNoOwnerStep(
  seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO,
  steps: OwnerStep[] = OWNER_STEPS,
): string[] {
  return seeds.filter((s) => ownerStepsForLine(s.id, steps).length === 0).map((s) => s.id);
}

/** Total owner minutes, both ends of the range. Roughly two and a half hours. */
export function ownerStepMinutes(steps: OwnerStep[] = OWNER_STEPS): { min: number; max: number } {
  return steps.reduce(
    (acc, s) => ({ min: acc.min + s.minutes[0], max: acc.max + s.minutes[1] }),
    { min: 0, max: 0 },
  );
}
