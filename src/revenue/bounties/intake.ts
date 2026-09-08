/**
 * Revenue Colony — Algora OSS bounties, build #2, stage 2: the intake filter.
 *
 * This is the artefact the audit called "the most useful concrete artefact in
 * the report" (`audits/bounties-grants.md` §4). It decides which funded bounties
 * the colony may attempt, and — just as important — it emits the ones it refused
 * together with the rule that refused them, so a supervisor can argue with a
 * decision instead of guessing at one.
 *
 * It fetches nothing. GitHub search finds the issues carrying `algora-pbc[bot]`
 * bounty comments (BOARD.md build #2: "the only host this container reaches"),
 * `policy.ts` reads each repository's contribution policy, and this module scores
 * what comes back. Nothing here is wired into the heartbeat: the line is blocked
 * on owner steps 7 (brand machine account) and 4 (Stripe Connect Express through
 * Algora) and on `BRAND_GITHUB_TOKEN`, and a loop that attempted a bounty before
 * those exist would publish a pull request under the owner's handle — the one
 * thing BOARD.md §5 changed about this line.
 *
 * ── The rules, and where each comes from ──
 *
 *  1. Never more than two attempts in parallel  — BOARD.md ruling on this line.
 *  2. Skip `forbidden` repositories             — CHIEF-AUDIT §2.1 row 6 (AMBER).
 *  3. Stop permanently on a maintainer request  — the line's own kill criterion:
 *     "one maintainer asking us to stop ... kills the line immediately and
 *     permanently" (`groups/bounties-grants.md` §4).
 *  4. Require a testable acceptance criterion   — MISSION rule 4. We may only
 *     claim work we can show is correct, and the demo video Algora requires per
 *     claim has to show *something passing*.
 *  5. Require TypeScript / Python / docs / tests — BOARD.md build #2, verbatim.
 *  6. Refuse anything needing a human conversation, a design review, a signature
 *     or an account we do not have — MISSION rule 1: the owner does not talk to
 *     people, and we do not invent owner steps.
 *  7. Refuse a bounty another solver attempted inside a window — the scout's
 *     finding that maintainers flooded with agent PRs "select a single PR, often
 *     the first to arrive, and reject the rest". Losing that race costs the full
 *     cost of the work, so the filter declines the race rather than entering it.
 *  8. Refuse anything paying below a floor derived from this line's own ₪300
 *     target — `deriveBountyFloor()` below, which shows its arithmetic.
 */

import { DEFAULT_FX_ILS } from "../money.js";
import { DEFAULT_PORTFOLIO } from "../portfolio.js";
import type { PolicyVerdict } from "./policy.js";

// ── The Algora bot comment ───────────────────────────────────────────────────

/**
 * The handle whose comment marks an issue as a funded bounty.
 *
 * BOARD.md build #2 names the channel by this handle, and it is the whole reason
 * this line has an acquisition channel at all: the payer posts the job.
 */
export const ALGORA_BOT_LOGIN = "algora-pbc[bot]";

export type BotCommentState = "open" | "rewarded" | "not-a-bounty-comment";

export interface AlgoraBotComment {
  /** The comment was written by `algora-pbc[bot]`. */
  fromAlgoraBot: boolean;
  /** Bounty amount in USD major units, or null when the comment does not state one. */
  amountUsd: number | null;
  /** The issue number the `/attempt` and `/claim` commands point at. */
  issueNumber: number | null;
  /** e.g. `/attempt #123`, exactly as the bot spells it. */
  attemptCommand: string | null;
  /** e.g. `/claim #123`, exactly as the bot spells it. */
  claimCommand: string | null;
  /** The bot template's demo-video sentence is present. */
  demoVideoRequired: boolean;
  state: BotCommentState;
  /** Everything matched, quoted from the input, so a reason can cite the payer. */
  quotes: string[];
}

/**
 * Parse an `algora-pbc[bot]` comment.
 *
 * **What is confirmed and what is not.** The three-step instruction block and the
 * demo-video sentence below are quoted by `scouts/bounties-grants--oss-bounties.md`
 * from Algora's own `lib/algora/bot_templates/bot_templates.ex`, rendered through
 * GitHub code search:
 *
 *   "1. **Start working**: Comment `/attempt #N` with your implementation plan
 *    2. **Submit work**: Create a pull request including `/claim #N` in the PR body
 *    3. **Receive payment**: 100% of the bounty is received 2-5 days post-reward."
 *   "To claim a bounty, you need to **provide a short demo video** of your changes
 *    in your pull request."
 *
 * The **amount line** was never rendered by anybody in the sweep — `algora.io` is
 * EGRESS_BLOCKED from this container and no scout fetched a live bounty comment.
 * So the amount is read with a deliberately loose currency match rather than with
 * a layout this repo is pretending to know, and `scoreBounty` cross-checks it
 * against the amount the caller supplies. A bounty whose funded amount we cannot
 * read from the payer's own comment is not a bounty we attempt.
 */
export function parseAlgoraBotComment(input: { author?: string; body: string }): AlgoraBotComment {
  const body = input.body ?? "";
  const quotes: string[] = [];
  const fromAlgoraBot = (input.author ?? "").trim().toLowerCase() === ALGORA_BOT_LOGIN;

  const attempt = /\/attempt\s+#(\d+)/i.exec(body);
  const claim = /\/claim\s+#(\d+)/i.exec(body);
  if (attempt) quotes.push(attempt[0]);
  if (claim) quotes.push(claim[0]);

  // Loose on purpose: "$100", "$1,000", "💎 $2,500 bounty", "USD 250".
  const amountMatch = /(?:\$|\bUSD\s*)\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i.exec(body);
  const amountUsd = amountMatch ? Number(amountMatch[1]!.replace(/,/g, "")) : null;
  if (amountMatch) quotes.push(amountMatch[0].trim());

  const demoVideoRequired = /demo\s+video/i.test(body);
  if (demoVideoRequired) {
    const m = /[^.\n]*demo\s+video[^.\n]*/i.exec(body);
    if (m) quotes.push(m[0].replace(/\s+/g, " ").trim());
  }

  // Algora's own docs: "The Algora bot will comment on the issue when the
  // contributor receives the payment." A comment saying the money already moved
  // is not an open job.
  const rewarded = /\b(?:has\s+been\s+rewarded|was\s+rewarded|received\s+the\s+payment|reward(?:ed)?\s+to|bounty\s+(?:has\s+been\s+)?(?:paid|awarded|claimed))\b/i.test(body);

  let state: BotCommentState;
  if (rewarded) state = "rewarded";
  else if (attempt || claim) state = "open";
  else state = "not-a-bounty-comment";

  return {
    fromAlgoraBot,
    amountUsd: Number.isFinite(amountUsd as number) ? amountUsd : null,
    issueNumber: attempt ? Number(attempt[1]) : claim ? Number(claim[1]) : null,
    attemptCommand: attempt ? attempt[0] : null,
    claimCommand: claim ? claim[0] : null,
    demoVideoRequired,
    state,
    quotes,
  };
}

// ── The pay floor, derived rather than picked ────────────────────────────────

export interface FloorDerivation {
  /** The board's target for this line, ₪/month. */
  lineTargetIls: number;
  /** Everything the board committed to, ₪/month. */
  portfolioTargetIls: number;
  lineShare: number;
  /** MISSION constraint 4's own figure for the whole colony. */
  colonyAgentHoursPerMonth: number;
  lineAgentHoursPerMonth: number;
  /** What an agent-hour must actually bring in for the line to hit its target. */
  realizedIlsPerHour: number;
  /** The line's own kill threshold: below this acceptance rate the line dies. */
  killAcceptanceRate: number;
  /** The gross rate a bounty must advertise for the realized rate to survive rejections. */
  floorIlsPerHour: number;
  floorUsdPerHour: number;
  usdIls: number;
  reasoning: string;
}

export const COLONY_AGENT_HOURS_PER_MONTH = 160;

/**
 * The line's kill criterion, copied from `portfolio.ts`:
 * "acceptance rate under 25% over 10 attempts".
 */
export const KILL_ACCEPTANCE_RATE = 0.25;

/**
 * Derive the ₪-per-hour floor a bounty must clear.
 *
 * The arithmetic, in four steps, all of them from numbers already in this repo:
 *
 *  1. The board gave this line **₪300/month** out of a **₪1,500** committed
 *     portfolio, so the line owns **20%** of the colony's capacity.
 *  2. MISSION constraint 4 budgets **160 agent-hours a month** for the whole
 *     colony. Twenty per cent of that is **32 hours** for this line.
 *  3. ₪300 out of 32 hours is **₪9.375 per agent-hour realized** — what an hour
 *     must actually earn, after the pull requests nobody merges.
 *  4. Most attempts earn nothing. At the line's own kill threshold — a 25%
 *     acceptance rate — one rewarded bounty costs four attempts' hours, so a
 *     bounty must advertise **four times** the realized rate to survive:
 *     9.375 / 0.25 = **₪37.50 per estimated hour**, about **$10.42/h** at the
 *     repo's stored USD rate.
 *
 * Sanity check against the only economics figure the audit accepted — a ~$110
 * average bounty: the floor allows up to about **10.5 hours** on an average
 * bounty, and refuses anything longer. That is the filter doing its job; the
 * competition finding says the winner is usually the first PR to arrive, and a
 * two-week issue is a race the colony loses after paying for it.
 *
 * It is a **floor, not a target**. Clearing it makes a bounty admissible; the
 * ordering in `selectBounties` still prefers the ones that clear it by most.
 *
 * Every input is a parameter so the floor moves when the board's numbers move
 * and an auditor can re-derive it rather than take it on trust.
 */
export function deriveBountyFloor(
  opts: {
    lineId?: string;
    lineTargetIls?: number;
    portfolioTargetIls?: number;
    colonyAgentHoursPerMonth?: number;
    killAcceptanceRate?: number;
    usdIls?: number;
  } = {},
): FloorDerivation {
  const lineId = opts.lineId ?? "oss-bounties";
  const seed = DEFAULT_PORTFOLIO.find((s) => s.id === lineId);
  const lineTargetIls = opts.lineTargetIls ?? (seed ? seed.targetMonthlyAgorot / 100 : 300);
  const portfolioTargetIls =
    opts.portfolioTargetIls ?? DEFAULT_PORTFOLIO.reduce((n, s) => n + s.targetMonthlyAgorot, 0) / 100;
  const colonyAgentHoursPerMonth = opts.colonyAgentHoursPerMonth ?? COLONY_AGENT_HOURS_PER_MONTH;
  const killAcceptanceRate = opts.killAcceptanceRate ?? KILL_ACCEPTANCE_RATE;
  const usdIls = opts.usdIls ?? DEFAULT_FX_ILS.USD ?? 3.6;

  const lineShare = portfolioTargetIls > 0 ? lineTargetIls / portfolioTargetIls : 0;
  const lineAgentHoursPerMonth = colonyAgentHoursPerMonth * lineShare;
  const realizedIlsPerHour = lineAgentHoursPerMonth > 0 ? lineTargetIls / lineAgentHoursPerMonth : Infinity;
  const floorIlsPerHour = killAcceptanceRate > 0 ? realizedIlsPerHour / killAcceptanceRate : Infinity;

  return {
    lineTargetIls,
    portfolioTargetIls,
    lineShare,
    colonyAgentHoursPerMonth,
    lineAgentHoursPerMonth,
    realizedIlsPerHour,
    killAcceptanceRate,
    floorIlsPerHour,
    floorUsdPerHour: floorIlsPerHour / usdIls,
    usdIls,
    reasoning:
      `₪${lineTargetIls}/month is ${(lineShare * 100).toFixed(1)}% of the ₪${portfolioTargetIls} the board committed, ` +
      `so this line owns ${lineAgentHoursPerMonth.toFixed(1)} of MISSION constraint 4's ${colonyAgentHoursPerMonth} agent-hours a month. ` +
      `That is ₪${realizedIlsPerHour.toFixed(2)} an hour realized. At the line's own kill threshold of a ` +
      `${(killAcceptanceRate * 100).toFixed(0)}% acceptance rate, one rewarded bounty costs ${(1 / killAcceptanceRate).toFixed(0)} attempts, ` +
      `so a bounty must advertise ₪${floorIlsPerHour.toFixed(2)} per estimated hour (about $${(floorIlsPerHour / usdIls).toFixed(2)}/h) to clear it.`,
  };
}

// ── Candidates and state ─────────────────────────────────────────────────────

export interface BountyAttempt {
  /** GitHub login of whoever posted `/attempt`. */
  actor: string;
  /** ISO 8601. */
  at: string;
}

export interface BountyCandidate {
  /** Stable id. `owner/repo#123` by convention. */
  id: string;
  /** `owner/repo`. */
  repo: string;
  issueNumber: number;
  issueTitle?: string;
  issueText: string;
  labels: string[];
  /** Amount in major units, as posted. */
  amount: number;
  currency: string;
  /** Non-null when the maintainer already assigned the issue to somebody. */
  assignedTo: string | null;
  /** The `algora-pbc[bot]` comment on the issue, if one was found. */
  botComment?: { author?: string; body: string };
  /** The verdict from `assessRepoPolicy`. */
  policy: PolicyVerdict;
  /** Our own estimate of the work, in hours. */
  estimatedHours: number;
  /** `/attempt` comments by other solvers, from the issue thread. */
  attemptsByOthers?: BountyAttempt[];
}

export interface ColonyBountyState {
  /** Bounty ids the colony is attempting right now. */
  attempting: string[];
  /**
   * Repositories a maintainer asked us to stop in. Permanent — the line's kill
   * criterion says one request kills it "immediately and permanently", so a repo
   * never leaves this list.
   */
  stoppedRepos?: string[];
  /** ISO 8601. Defaults to now. Injected so the tests are not clock-dependent. */
  now?: string;
}

export interface IntakeConfig {
  maxParallelAttempts: number;
  /** Skip a bounty another solver attempted within this many days. */
  attemptWindowDays: number;
  floorIlsPerHour: number;
  usdIls: number;
  /** BOARD.md build #2: "require TypeScript / Python / docs / tests". */
  requiredStacks: string[];
}

export const MAX_PARALLEL_ATTEMPTS = 2;
export const DEFAULT_ATTEMPT_WINDOW_DAYS = 7;

export function defaultIntakeConfig(overrides: Partial<IntakeConfig> = {}): IntakeConfig {
  const floor = deriveBountyFloor();
  return {
    maxParallelAttempts: MAX_PARALLEL_ATTEMPTS,
    attemptWindowDays: DEFAULT_ATTEMPT_WINDOW_DAYS,
    floorIlsPerHour: floor.floorIlsPerHour,
    usdIls: floor.usdIls,
    requiredStacks: ["typescript", "javascript", "python", "docs", "tests"],
    ...overrides,
  };
}

export interface SkipReason {
  rule: string;
  detail: string;
}

export interface BountyScore {
  id: string;
  repo: string;
  eligible: boolean;
  amountIls: number;
  ilsPerHour: number;
  /** Only meaningful for eligible candidates; ordering, not a probability. */
  score: number;
  /** Which of TypeScript / Python / docs / tests the issue actually is. */
  stacks: string[];
  /** The testable acceptance criteria found in the issue, quoted. */
  acceptanceCriteria: string[];
  /** Other solvers who posted `/attempt`, any age. */
  competitors: number;
  reasons: string[];
  skipped: SkipReason[];
}

// ── Text signals ─────────────────────────────────────────────────────────────

const ACCEPTANCE_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "checklist", pattern: /^\s*[-*]\s*\[[ xX]\]\s+\S.*$/gm },
  { id: "acceptance-criteria-heading", pattern: /acceptance\s+criteri(?:on|a)/gi },
  { id: "expected-vs-actual", pattern: /\bexpected\s*(?:behaviou?r|result|output)?\s*:/gi },
  { id: "reproduction", pattern: /\b(?:steps\s+to\s+reproduce|reproduction\s+steps|repro\s+steps|minimal\s+repro)\b/gi },
  { id: "failing-test", pattern: /\b(?:failing\s+test|test\s+should\s+pass|add\s+a\s+test|regression\s+test|unit\s+tests?\s+for)\b/gi },
  { id: "definition-of-done", pattern: /\bdefinition\s+of\s+done\b/gi },
  { id: "should-behaviour", pattern: /\b(?:should\s+return|should\s+throw|should\s+not\s+(?:crash|throw|return)|must\s+return)\b/gi },
];

const STACK_PATTERNS: Record<string, RegExp> = {
  typescript: /\b(?:typescript|\.ts\b|\.tsx\b|tsconfig|type\s+definitions?|d\.ts)\b/i,
  javascript: /\b(?:javascript|node\.?js|\.js\b|\.jsx\b|npm|eslint)\b/i,
  python: /\b(?:python|\.py\b|pytest|mypy|pip\b|poetry)\b/i,
  docs: /\b(?:docs?|documentation|readme|docstring|changelog|typo)\b/i,
  tests: /\b(?:tests?|unit\s+test|test\s+coverage|vitest|jest|pytest|test\s+suite)\b/i,
};

const NEEDS_HUMAN_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "call-or-meeting", pattern: /\b(?:hop\s+on\s+a\s+call|jump\s+on\s+a\s+call|schedule\s+a\s+(?:call|meeting)|zoom\s+call|video\s+call|pair(?:ing)?\s+session|office\s+hours)\b/i },
  { id: "chat-first", pattern: /\b(?:(?:discuss|talk|chat|sync)\s+(?:this\s+)?(?:with\s+us|with\s+the\s+team|first|before)|(?:ping|dm|message)\s+(?:us|me|the\s+maintainers?)|reach\s+out\s+to\s+(?:us|me))\b/i },
  { id: "community-account", pattern: /\b(?:join\s+(?:our\s+)?(?:discord|slack|matrix|telegram)|on\s+(?:our\s+)?discord\s+first)\b/i },
  { id: "design-review", pattern: /\b(?:design\s+(?:review|doc(?:ument)?|proposal)|needs\s+design|rfc\s+(?:required|first|needed)|product\s+decision|ux\s+review|architecture\s+review)\b/i },
  { id: "legal-signature", pattern: /\b(?:contributor\s+licen[cs]e\s+agreement|\bCLA\b|sign\s+(?:an?\s+)?(?:nda|agreement|cla)|non-disclosure)\b/ },
];

const NEEDS_ACCOUNT_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "cloud-account", pattern: /\b(?:aws|amazon\s+web\s+services|gcp|google\s+cloud|azure|cloudflare)\s+(?:account|credentials|subscription|project)\b/i },
  { id: "paid-service", pattern: /\b(?:api\s+key|access\s+token|credentials?|licen[cs]e\s+key|paid\s+(?:plan|account|subscription))\s+(?:is\s+)?(?:required|needed)\b/i },
  { id: "design-tool", pattern: /\b(?:figma|sketch|adobe\s+xd)\s+(?:file|account|access)\b/i },
  { id: "hardware", pattern: /\b(?:physical\s+device|real\s+hardware|gpu\s+(?:access|required)|test\s+device|ios\s+device|android\s+device)\b/i },
  { id: "app-store", pattern: /\b(?:app\s+store\s+connect|google\s+play\s+console|apple\s+developer\s+account)\b/i },
];

function uniqueQuotes(text: string, patterns: { id: string; pattern: RegExp }[]): string[] {
  const found: string[] = [];
  for (const { id, pattern } of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const rx = new RegExp(pattern.source, flags);
    for (const m of text.matchAll(rx)) {
      const quote = m[0].replace(/\s+/g, " ").trim();
      const entry = `${id}: ${quote.length > 120 ? `${quote.slice(0, 117)}...` : quote}`;
      if (!found.includes(entry)) found.push(entry);
    }
  }
  return found;
}

function daysBetween(a: string, b: string): number {
  return (Date.parse(a) - Date.parse(b)) / 86_400_000;
}

const round = (n: number, places = 3): number => Math.round(n * 10 ** places) / 10 ** places;

// ── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Score one bounty against every rule.
 *
 * Returns the *whole* verdict, not the first failure: a director reading the
 * shortlist should be able to see every reason a bounty was refused, because
 * "one rule at a time" is how a filter quietly stops filtering.
 */
export function scoreBounty(
  b: BountyCandidate,
  state: ColonyBountyState = { attempting: [] },
  config: IntakeConfig = defaultIntakeConfig(),
): BountyScore {
  const skipped: SkipReason[] = [];
  const reasons: string[] = [];
  const now = state.now ?? new Date().toISOString();

  // 1. Stop on first request. Permanent, per the line's kill criterion.
  if ((state.stoppedRepos ?? []).includes(b.repo)) {
    skipped.push({
      rule: "stopped-on-maintainer-request",
      detail: `A maintainer of ${b.repo} asked the colony to stop. That is permanent: the line's own kill criterion is "one maintainer asking us to stop, which kills the line immediately and permanently".`,
    });
  }

  // 2. The repository's policy.
  if (b.policy === "forbidden") {
    skipped.push({
      rule: "repo-policy-forbids-ai",
      detail: `assessRepoPolicy graded ${b.repo} \`forbidden\`. CHIEF-AUDIT §2.1 row 6 makes per-repo maintainer policy the AMBER on this line; a PR here would violate the constitution whatever Algora's terms allow.`,
    });
  } else if (b.policy === "unknown") {
    reasons.push("Repository policy is silent on AI contributions. Treated as `disclose`, never as `allowed` — the pull request discloses authorship regardless.");
  }

  // 3. The cap, from the other side: we do not re-enter something already running.
  if (state.attempting.includes(b.id)) {
    skipped.push({ rule: "already-attempting", detail: `${b.id} is already one of the colony's open attempts.` });
  }

  // 4. Somebody already has it.
  if (b.assignedTo) {
    skipped.push({
      rule: "assigned-to-someone-else",
      detail: `The maintainer assigned the issue to ${b.assignedTo}. Submitting anyway is the flood behaviour the sweep found maintainers drowning in.`,
    });
  }

  // 5. The payer's own comment.
  const bot = b.botComment ? parseAlgoraBotComment(b.botComment) : null;
  if (!bot) {
    skipped.push({
      rule: "no-algora-bot-comment",
      detail: `No ${ALGORA_BOT_LOGIN} comment was supplied. This line's entire acquisition channel is "the payer posts the job"; without the payer's comment there is no evidence a bounty is funded.`,
    });
  } else {
    if (!bot.fromAlgoraBot) {
      skipped.push({
        rule: "bot-comment-not-from-algora",
        detail: `The bounty comment is authored by "${b.botComment?.author ?? "(none)"}", not ${ALGORA_BOT_LOGIN}. Anybody can write a dollar sign in a comment.`,
      });
    }
    if (bot.state === "rewarded") {
      skipped.push({ rule: "bounty-already-rewarded", detail: `The bot comment says the bounty has already been paid: "${bot.quotes.join(" | ")}".` });
    } else if (bot.state === "not-a-bounty-comment") {
      skipped.push({
        rule: "bot-comment-carries-no-commands",
        detail: "The comment carries neither `/attempt #N` nor `/claim #N`, which is how Algora's own bot_templates.ex tells contributors to take a bounty. It is not a claimable bounty comment.",
      });
    }
    if (bot.amountUsd === null) {
      skipped.push({
        rule: "bot-amount-unparseable",
        detail: "No amount could be read from the payer's own comment. Algora's live bounty-comment layout was never rendered by the sweep (algora.io is EGRESS_BLOCKED), so an unreadable amount is an unknown, not a zero.",
      });
    } else if (Math.abs(bot.amountUsd - b.amount) > 0.01 && b.currency.toUpperCase() === "USD") {
      skipped.push({
        rule: "bot-amount-disagrees",
        detail: `The payer's comment says $${bot.amountUsd} and the candidate says ${b.currency} ${b.amount}. A bounty whose amount we cannot confirm from the payer is not a bounty we attempt.`,
      });
    } else if (bot.amountUsd !== null) {
      reasons.push(`The payer's own comment funds this at $${bot.amountUsd} (${bot.quotes.slice(0, 2).join(" | ")}).`);
    }
    if (bot.demoVideoRequired) {
      reasons.push("The bot comment repeats Algora's demo-video requirement. `pullRequestBody()` carries the recording placeholder; a claim without a real recording is never posted.");
    }
  }

  // 6. Money.
  const usdIls = config.usdIls;
  const rate = b.currency.toUpperCase() === "ILS" ? 1 : DEFAULT_FX_ILS[b.currency.toUpperCase()] ?? (b.currency.toUpperCase() === "USD" ? usdIls : null);
  if (rate === null) {
    skipped.push({ rule: "unsupported-currency", detail: `No stored FX rate for ${b.currency}; the bounty cannot be valued in shekels, and money means the ledger.` });
  }
  const amountIls = rate === null ? 0 : b.amount * rate;

  if (!Number.isFinite(b.estimatedHours) || b.estimatedHours <= 0) {
    skipped.push({ rule: "no-estimate", detail: `estimatedHours is ${b.estimatedHours}. A bounty with no estimate cannot be checked against the pay floor.` });
  }
  const ilsPerHour = b.estimatedHours > 0 ? amountIls / b.estimatedHours : 0;

  if (b.estimatedHours > 0 && rate !== null && ilsPerHour < config.floorIlsPerHour) {
    skipped.push({
      rule: "below-pay-floor",
      detail: `₪${round(ilsPerHour, 2)}/h against a floor of ₪${round(config.floorIlsPerHour, 2)}/h. ${deriveBountyFloor().reasoning}`,
    });
  }

  // 7. A testable acceptance criterion.
  const haystack = `${b.issueTitle ?? ""}\n${b.issueText}`;
  const acceptanceCriteria = uniqueQuotes(haystack, ACCEPTANCE_PATTERNS);
  if (acceptanceCriteria.length === 0) {
    skipped.push({
      rule: "no-testable-acceptance-criterion",
      detail: "The issue states no checklist, acceptance criteria, expected/actual pair, reproduction or test requirement. Without one, nothing proves the work is correct, and MISSION rule 4 forbids claiming what we cannot show.",
    });
  }

  // 8. Our stack.
  const labelText = b.labels.join(" ");
  const stacks = Object.entries(STACK_PATTERNS)
    .filter(([id, pattern]) => (config.requiredStacks.includes(id) ? pattern.test(labelText) || pattern.test(haystack) : false))
    .map(([id]) => id);
  if (stacks.length === 0) {
    skipped.push({
      rule: "not-our-stack",
      detail: `Nothing in the labels or the issue matches ${config.requiredStacks.join(" / ")}. BOARD.md build #2 restricts this line to those.`,
    });
  }

  // 9. Work that needs a person.
  const humanSignals = uniqueQuotes(haystack, NEEDS_HUMAN_PATTERNS);
  if (humanSignals.length > 0) {
    skipped.push({
      rule: "needs-a-human",
      detail: `The issue asks for a conversation, a review or a signature: ${humanSignals.join("; ")}. MISSION rule 1 — the owner does not talk to people, and we do not invent owner steps.`,
    });
  }

  const accountSignals = uniqueQuotes(haystack, NEEDS_ACCOUNT_PATTERNS);
  if (accountSignals.length > 0) {
    skipped.push({
      rule: "needs-an-account-we-do-not-have",
      detail: `The work needs access the colony does not hold: ${accountSignals.join("; ")}.`,
    });
  }

  // 10. The race we decline to enter.
  const attempts = b.attemptsByOthers ?? [];
  const recent = attempts.filter((a) => daysBetween(now, a.at) >= 0 && daysBetween(now, a.at) <= config.attemptWindowDays);
  if (recent.length > 0) {
    skipped.push({
      rule: "contested-recently",
      detail: `${recent.length} other solver${recent.length === 1 ? "" : "s"} posted /attempt within ${config.attemptWindowDays} days (${recent.map((a) => `${a.actor} @ ${a.at}`).join(", ")}). Maintainers flooded with agent PRs tend to take the first that arrives; entering that race costs the full price of the work and usually loses it.`,
    });
  } else if (attempts.length > 0) {
    reasons.push(`${attempts.length} earlier /attempt${attempts.length === 1 ? "" : "s"} exist but all fall outside the ${config.attemptWindowDays}-day window, so the bounty is contested but not actively raced.`);
  }

  // ── Ordering score. Only meaningful when eligible. ──
  const payComponent = 2 * Math.min(config.floorIlsPerHour > 0 ? ilsPerHour / config.floorIlsPerHour : 0, 3);
  const stackComponent = stacks.length >= 2 ? 1 : stacks.length === 1 ? 0.5 : 0;
  const criteriaComponent = acceptanceCriteria.length >= 2 ? 1 : acceptanceCriteria.length === 1 ? 0.5 : 0;
  const competitionPenalty = 0.5 * attempts.length;
  const durationPenalty = 0.25 * (Math.max(0, b.estimatedHours - 8) / 8);
  const score = round(payComponent + stackComponent + criteriaComponent - competitionPenalty - durationPenalty);

  if (skipped.length === 0) {
    reasons.push(
      `₪${round(ilsPerHour, 2)}/h clears the ₪${round(config.floorIlsPerHour, 2)}/h floor; matches ${stacks.join(", ")}; ${acceptanceCriteria.length} testable acceptance signal${acceptanceCriteria.length === 1 ? "" : "s"}; ${attempts.length} competing attempt${attempts.length === 1 ? "" : "s"}.`,
    );
  }

  return {
    id: b.id,
    repo: b.repo,
    eligible: skipped.length === 0,
    amountIls: round(amountIls, 2),
    ilsPerHour: round(ilsPerHour, 2),
    score,
    stacks,
    acceptanceCriteria,
    competitors: attempts.length,
    reasons,
    skipped,
  };
}

export interface BountySelection {
  /** Ordered, never longer than the free slots. */
  shortlist: BountyScore[];
  /** Everything refused, each with the rules that refused it. */
  skipped: BountyScore[];
  /** How many attempts the cap leaves free right now. */
  slots: number;
  config: IntakeConfig;
  /** Colony-level notes: the cap, the stop list, an empty shortlist. */
  notes: string[];
}

/**
 * Turn a set of candidates into at most two attempts, and say why for everything.
 *
 * The two-in-parallel cap is enforced **in the output**, not in a comment: a
 * candidate that is perfectly eligible but has no free slot appears in `skipped`
 * with the reason `no-slot-free`, so nothing is quietly dropped.
 */
export function selectBounties(
  candidates: BountyCandidate[],
  state: ColonyBountyState = { attempting: [] },
  config: IntakeConfig = defaultIntakeConfig(),
): BountySelection {
  const notes: string[] = [];
  const openAttempts = state.attempting.length;
  const slots = Math.max(0, config.maxParallelAttempts - openAttempts);

  notes.push(
    `${openAttempts} of ${config.maxParallelAttempts} parallel attempts are open, so ${slots} slot${slots === 1 ? "" : "s"} ${slots === 1 ? "is" : "are"} free. The cap is the board's ruling on this line.`,
  );
  if ((state.stoppedRepos ?? []).length > 0) {
    notes.push(`${state.stoppedRepos!.length} repository/ies are permanently off-limits after a maintainer asked us to stop: ${state.stoppedRepos!.join(", ")}.`);
  }

  const scored = candidates.map((c) => scoreBounty(c, state, config));
  const eligible = scored
    .filter((s) => s.eligible)
    .sort((a, b) => b.score - a.score || b.ilsPerHour - a.ilsPerHour || a.id.localeCompare(b.id));
  const refused = scored.filter((s) => !s.eligible);

  const shortlist = eligible.slice(0, slots);
  const overflow = eligible.slice(slots).map((s) => ({
    ...s,
    eligible: false,
    skipped: [
      ...s.skipped,
      {
        rule: "no-slot-free",
        detail: `Eligible, but the colony may hold only ${config.maxParallelAttempts} attempts in parallel and ${openAttempts} ${openAttempts === 1 ? "is" : "are"} already open. Re-offer it on the next scan.`,
      },
    ],
  }));

  if (shortlist.length === 0) {
    notes.push(
      slots === 0
        ? "Nothing was shortlisted because the parallel cap is full. This is the filter working, not a failure."
        : `Nothing was shortlisted: ${candidates.length} candidate${candidates.length === 1 ? "" : "s"} scanned, ${refused.length} refused by rule.`,
    );
  }

  return { shortlist, skipped: [...refused, ...overflow], slots, config, notes };
}
