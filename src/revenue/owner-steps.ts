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
 *   1. There are exactly SEVEN steps. Adding an eighth fails the build, which
 *      is the point — an eighth step needs a decision, not a commit.
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
 */

import { DEFAULT_PORTFOLIO } from "./portfolio.js";
import type { RevenueLineSeed } from "./types.js";

export type OwnerStepId =
  | "merge-pr"
  | "tax-file"
  | "gumroad"
  | "algora-stripe"
  | "domain"
  | "ci-tokens"
  | "github-org";

export interface OwnerStep {
  id: OwnerStepId;
  /**
   * The number the owner sees in `docs/OWNER_STEPS.he.md`. Deliberately NOT the
   * execution order: the board reordered the steps and kept the numbers fixed so
   * that "step 4" means the same thing in every conversation that already
   * happened.
   */
  number: number;
  /** Execution order, 1..7, as ruled by the board: 1, 2, 3, 5, 7, 4, 6. */
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
   * rest of the checklist would allow.
   */
  earlyPart?: { what: string; afterStep: OwnerStepId; minutes: number };
  /** A decision the board left to the owner inside this step. Not a step itself. */
  ownerDecision?: string;
  /**
   * Set only when the step is verifiably done, with the evidence. The report stops
   * asking for it, and a test keeps the Hebrew heading's "✅ בוצע" in step with it.
   */
  doneOn?: { date: string; evidence: string };
  /**
   * Something the colony must establish itself BEFORE it asks the owner for this
   * step. Not an owner action — the point is that the owner is not asked to find
   * it out.
   */
  precondition?: string;
  /**
   * Set when the owner has put the step on hold. It stays on the list with its
   * number and its lines, because it comes back when the owner decides; until
   * then the report does not ask for it, and a test keeps the Hebrew heading's
   * "⏸ מוקפא" in step with it. `rule` is a short name the report prints; `why`
   * says what the rule is; `costs` is what going without the step costs, said
   * plainly; `freeInstead` is what replaces it at ₪0.
   */
  frozen?: { since: string; rule: string; why: string; costs: string; freeInstead: string; returnsWhen: string };
}

export const OWNER_STEPS: OwnerStep[] = [
  {
    id: "merge-pr",
    number: 1,
    order: 1,
    title: "למזג את PR #2 ב-GitHub (או להגיד לי \"תמזג\")",
    minutes: [2, 2],
    unlocks:
      "Consent, not identity: it puts colony.yml and every future workflow on `main`, and GitHub runs scheduled work only there. Nothing CI-executed — the Apify push, the Netlify deploys, the hourly ledger sync — runs before it, so it gates the MEASUREMENTS and not only the hourly report. Since 27.9.2026 the owner's standing consent covers every later merge: the agent merges its own green pull requests and publishes under the brand without asking each time, until the owner says \"עצור\". The same message said \"תמזג\", and PR #3 was merged on it (merge commit 61fae4e, 27.9.2026 22:36 UTC).",
    lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"],
    catalogueRef: null,
    doneOn: {
      date: "2026-09-22",
      evidence:
        "merge commit 31cda66 (PR #2); colony.yml runs hourly on main since. PR #3 merged 27.9.2026 22:36 UTC (merge commit 61fae4e) on the owner's \"תמזג\" of that day, which also gave standing consent to merge and publish under the brand",
    },
  },
  {
    id: "tax-file",
    number: 2,
    order: 2,
    title: "פתיחת תיק עוסק פטור + רישום בביטוח לאומי",
    minutes: [60, 90],
    unlocks:
      "The legal right to receive any shekel at all. This is the law rather than a platform's requirement: business income needs a file at the Tax Authority, and ₪10 counts. Written here ONCE — it used to be repeated in every line's humanSetup, which is how a six-item catalogue reads as eleven.",
    lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.1",
    precondition:
      "Under the owner's ₪0 rule this step is asked for only when a paid product is ready to go on sale — nothing is put up for sale before it anyway — and before asking, the colony establishes from the official sources (the Tax Authority and Bituach Leumi themselves, rendered, not a summary) whether opening the file or registering costs anything or triggers minimum monthly payments. Until that is rendered the colony states no figure for it.",
    ownerDecision:
      "The 'one paid conversation with an accountant' that used to sit inside this step is NOT a step — the owner's brief is verbatim 'אני לא מדבר עם אנשים'. Default until they say otherwise: treat all income as taxable and do not zero-rate under §30(א)(5). The switch to עוסק מורשה is raised by the watchdog at a number (₪8,000 rolling 30-day revenue), never by a conversation.",
  },
  {
    id: "gumroad",
    number: 3,
    order: 3,
    title: "חשבון Gumroad + טוקן",
    minutes: [20, 20],
    unlocks:
      "The only merchant-of-record rail with RENDERED proof of a native ILS payout to an Israeli bank (Freemius pays Israel from a USD balance, ILS only via Wise or wire) (Gumroad's own _13-getting-paid.html.erb carries a row reading `Israel | ILS`). It collects from the buyer, holds 7 days, and pays out in shekels above a $100 balance. It supplies no buyers — its Discover gate requires a sale to already exist — so it is a rail, not a storefront. The dashboard-minted token carries edit_products (Gumroad doorkeeper.rb:10, oauth_application.rb:121-122), so the agent creates the Pro product with Gumroad's own licence-key block, and Gumroad mints and emails a key per sale — there is no per-sale owner step (research/measurements/gumroad-license-decision.md, Option C).",
    lines: ["il-biz-tools", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.2",
    ownerDecision:
      "Paddle is an OPTION, not a step, and the board recommends against it: Sumsub may demand a selfie video (a mandate collision), approval is discretionary and pre-revenue sellers have been refused, and ILS is not a payout currency. Gumroad covers the same products.",
  },
  {
    id: "domain",
    number: 5,
    order: 4,
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
    order: 5,
    title: "להעביר את הריפו לארגון ב-GitHub (וחשבון מכונה בשם המותג)",
    minutes: [10, 15],
    unlocks:
      "Takes the owner's name off every raw.githubusercontent.com URL in the repository, and creates the ONE brand machine account GitHub's terms allow alongside a personal account. That account is what authors bounty pull requests and signs in to Algora — an organisation cannot sign in anywhere, so the org alone does not fix the byline. Its personal access token becomes BRAND_GITHUB_TOKEN in step 6. It is an ordinary User account whose login does not end in \"bot\" — Algora's contributor queries drop %bot logins, and a GitHub App (type Bot) fails its human-author check (BOARD-2 §2.1.3(c); bounties/intake.ts brandAccountProblems).",
    lines: ["oss-bounties", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.6",
    ownerDecision:
      "The alternative is accepting their own GitHub handle on bounty pull requests for that one line. The board's default is the machine account.",
  },
  {
    id: "algora-stripe",
    number: 4,
    order: 6,
    title: "Stripe Connect Express דרך Algora",
    minutes: [15, 15],
    unlocks:
      "The shortest documented path to a platform transaction id — 2-5 days after a rewarded pull request — and the one form that settles the most-contested payability question in the whole sweep for every other Stripe-Connect platform. Done SIGNED IN AS THE BRAND MACHINE ACCOUNT (which is why it now follows step 7); the Stripe form inside it stays in the owner's legal identity, which is exactly what the mandate allows. NOT requested for oss-bounties until the week-4 reading of the weekly claimable-supply count (BOARD-2 §2.2): ≥10 and it proceeds after step 7; 3-9 and it still proceeds, because it settles Stripe-Israel for the kill list; under 3 it is not asked for this line's sake.",
    lines: ["oss-bounties"],
    catalogueRef: "CHIEF-AUDIT §4A.3",
  },
  {
    id: "ci-tokens",
    number: 6,
    order: 7,
    title: "לחבר את Netlify, להדביק את הטוקנים ב-GitHub, וקליק אחד ב-Apify",
    minutes: [15, 20],
    unlocks:
      "Converts every 'the owner must push' recurring operation into a one-time step. Netlify link deploys the site; GUMROAD_ACCESS_TOKEN lets the loop read sales and write each one to the ledger with its transaction id — which is the definition of money here; the same token creates the il-biz-tools Pro product once (Option C, Gumroad-native licences); BRAND_GITHUB_TOKEN lets bounty PRs leave the brand account. The container cannot reach Netlify, Apify or Gumroad; GitHub Actions runners can.",
    lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"],
    catalogueRef: "CHIEF-AUDIT §4A.5",
    earlyPart: {
      what:
        "Apify sign-up with the BRAND as the username (the Store URL apify.com/<username>/… is public) and APIFY_TOKEN into GitHub secrets. This alone starts the 30-day stranger count a month earlier than the rest of the checklist would, and it needs no identity verification.",
      afterStep: "merge-pr",
      minutes: 5,
    },
  },
];

/** The checklist in the order the board ruled: 1, 2, 3, 5, 7, 4, 6. */
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

/** A step the owner is being asked for now: not done, and not frozen. */
export function isOwnerStepOpen(step: OwnerStep): boolean {
  return !step.doneOn && !step.frozen;
}

/** The steps a line still waits on and the owner is asked for, in execution order. */
export function openOwnerStepsForLine(lineId: string, steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return ownerStepsForLine(lineId, steps).filter(isOwnerStepOpen);
}

/** The steps that gate a line but are frozen by the owner, so nobody asks for them. */
export function frozenOwnerStepsForLine(lineId: string, steps: OwnerStep[] = OWNER_STEPS): OwnerStep[] {
  return ownerStepsForLine(lineId, steps).filter((s) => !s.doneOn && Boolean(s.frozen));
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
