/**
 * Revenue Colony — Algora OSS bounties: the weekly claimable-supply count.
 *
 * Ordered by the board as this line's first build step (research/colony-sweep/BOARD-2.md §2.2): *"the cheapest
 * test that the payer is actually posting jobs"*. Two independent readings already point the same way — the repo's
 * own 22.9 label count (`docs/REJECTED.md`) and a third-party census that found **5 claimable bounties, $60**, out of
 * 561 labelled issues — and the board would not move the ₪300 on a number this repo had not reproduced. This module
 * is the reproduction, and it owns the rule that reads it.
 *
 * It fetches nothing. `supply-github.ts` pages GitHub and hands the facts in; this module decides what each labelled
 * issue is, adds the answers up, and writes the words. Everything here is pure so the tests can pin it with fixtures.
 *
 * ── The filters, in the order their data costs ──
 *
 * The board's list, verbatim: *"open issue carrying the label; repository not archived; no `💰 Rewarded` label and no
 * Algora payout comment; a parseable amount ≥ $50; repository policy not `forbidden` under `policy.ts`."* Each
 * filter asks for its data only when the cheaper ones have passed (`evaluateIssue` returns `needs`), so the fetcher
 * never reads comments for an archived repository or policy files for a rewarded issue.
 *
 * One stricter reading is reported **beside** the board's count, never inside it: `solutionMerged`. Algora comments
 * *"The pull request of @x has been merged. The bounty can be rewarded here"* when a claimed PR merges; the money then
 * goes to that solver, so such an issue is funded and unpaid but not claimable by anybody new. It is still counted in
 * `claimableBounties`, because the board set its 10 and 3 against its own list above and a builder narrowing that list
 * after the thresholds exist would be moving the line after the rule was written (review, 27.9). The measurement
 * carries `claimableWithoutMergedSolution` too, so the week-4 reader sees both numbers and the board can choose.
 *
 * ── The counter was corrected on 28.9.2026 (RULING-2026-09-28-bounty-rail.md §3) ──
 *
 * The first reading (W39, 108 claimable) was an instrument fault, not a low or high reading: 85 of the 108 sat in a
 * repository whose own CONTRIBUTING says its bounties are symbolic and unmergeable, graded `allowed` by `policy.ts` from
 * a sentence hidden in an HTML comment. Two changes gate the count from `SUPPLY_COUNTER_VERSION` 2 on: permission counts
 * only from visible text (`policy.ts`), and the `not-a-payer` filter drops a repository that says its bounties are not
 * money. Every reading carries the counter version that produced it; a reading from an older counter is moved out of
 * `history` into `instrumentFaults` with its reason (`strikePreFixReadings`), recorded and never averaged (KILL-1), so
 * week 1 of 4 is the first run of the corrected counter. `claimableFresh365` is shown beside the count, not gated.
 *
 * Algora's wording is not guessed. The payout, merge and bounty comments were read from `algora-io/algora` on GitHub
 * (27.9.2026): `lib/algora/bounties/jobs/notify_transfer.ex` adds the `💰 Rewarded` label and posts *"🎉🎈 @login has
 * been awarded **$N** by **Name**! 🎈🎊"*; `lib/algora_web/controllers/webhooks/github_controller.ex` posts the merge
 * sentence above; `lib/algora/bot_templates/bot_templates.ex` is the bounty comment `parseAlgoraBotComment` reads.
 */

import { ALGORA_BOT_LOGIN, parseAlgoraBotComment, type AlgoraBotComment } from "./intake.js";
import { assessRepoPolicy, type PolicyVerdict, type RepoPolicyTexts } from "./policy.js";

/** The label Algora's GitHub App puts on a funded issue (`workspace.ex`, `bounties.ex`). */
export const BOUNTY_LABEL = "💎 Bounty";
/** The label the same App adds when it pays (`notify_transfer.ex`). */
export const REWARDED_LABEL = "💰 Rewarded";
/** BOARD-2 §2.2: "a parseable amount ≥ $50". Inclusive. */
export const MIN_CLAIMABLE_USD = 50;
/** The census query; `supply-github.ts` pages it sorted by creation date so a run is repeatable. */
export const SUPPLY_SEARCH_QUERY = `is:issue is:open label:"${BOUNTY_LABEL}"`;

/**
 * BOARD-2 §2.2, as numbers. Read at week 4 on the mean of the four weekly readings:
 * ≥ 10 → ₪300 stands; 3-9 → retarget to ₪100, grade `contradicted`; < 3 → the line is killed.
 * The portfolio carries the same numbers as text (`portfolio.ts`, oss-bounties), and a test holds the two together.
 */
export const SUPPLY_THRESHOLDS = { weeks: 4, keepAtOrAbove: 10, killBelow: 3, keepTargetIls: 300, retargetIls: 100 } as const;

/** The re-open trigger the board wrote for the kill branch, verbatim. */
export const REOPEN_TRIGGER = "≥10 claimable bounties a week for four consecutive weekly runs";

/**
 * The counter that produced a reading. 1 (implied when a reading carries no stamp) is the counter of 27.9.2026 that read
 * permissions inside HTML comments and had no `not-a-payer` filter; 2 is the counter corrected on 28.9.2026
 * (RULING-2026-09-28-bounty-rail.md §3.3). Raise it only when a change alters what the count counts, and say why here.
 */
export const SUPPLY_COUNTER_VERSION = 2;

/** Why a pre-fix reading is struck, quoted from RULING-2026-09-28-bounty-rail.md §3.1-§3.2. */
export const PRE_FIX_FAULT_REASON =
  "Instrument fault, struck per KILL-1 (research/channel-loop/RULING-2026-09-28-bounty-rail.md §3): 85 of the 108 claimable ($35,475) sat in UnsafeLabs/Bounty-Hunters, " +
  "whose CONTRIBUTING says its bounties are \"symbolic … will not be merged into production\" and that it \"is not the right repo\" for paid work, and policy.ts graded it " +
  "`allowed` from a sentence hidden in an HTML comment; 5 ($3,010) sat in SecureBananaLabs/bug-bounty, whose README tells agents to star it before opening a PR. " +
  "Counted by the counter before visible-text permission and the not-a-payer filter; recorded, never averaged.";

/**
 * The most issues GitHub search may count and not serve before a run is refused: max(5, 1% of the reported total).
 *
 * Search's `total_count` includes index entries it never serves — issues that are hidden, deleted or transferred, or
 * sit in repositories that became unavailable. The first push-triggered run (27.9, run 36355862817) failed on exactly
 * that: 554 reported, 551 served. `supply-github.ts` accepts such a gap only when a second full pass serves the
 * identical issues and the gap is within this allowance; the gap is then recorded as `searchUnserved` and shown beside
 * the count — never added to it, never dropped. Anything larger, or passes that differ, is still a failed run.
 */
export const SEARCH_UNSERVED_FLOOR = 5;

export function searchUnservedAllowance(reportedTotal: number): number {
  return Math.max(SEARCH_UNSERVED_FLOOR, Math.floor(reportedTotal / 100));
}

/** The one sentence the Markdown and the run message both carry when GitHub counted issues it did not serve. */
export function unservedCaveat(unserved: number): string | null {
  if (!(unserved > 0)) return null;
  return `GitHub counted ${unserved} ${unserved === 1 ? "issue" : "issues"} it did not serve; the claimable count could be up to ${unserved} higher.`;
}

// ── The filters ──────────────────────────────────────────────────────────────

export type SupplyStage = "search" | "repo" | "comments" | "policy";

export type SupplyFilterId =
  | "not-an-open-labelled-issue"
  | "rewarded-label"
  | "archived-repo"
  | "payout-comment"
  | "no-algora-bounty-comment"
  | "amount-unparseable"
  | "amount-under-minimum"
  | "policy-forbidden"
  | "not-a-payer";

export interface SupplyFilter {
  id: SupplyFilterId;
  /** Which fetched data the filter needs; the order of this table is the order the data costs. */
  stage: SupplyStage;
  what: string;
  /** Why it drops the issue, and where the rule comes from. */
  why: string;
}

export const SUPPLY_FILTERS: readonly SupplyFilter[] = [
  {
    id: "not-an-open-labelled-issue",
    stage: "search",
    what: "not an open issue carrying the label",
    why: "The search result was a pull request, closed, or missing the `💎 Bounty` label. GitHub search should never return one; it is counted rather than trusted.",
  },
  {
    id: "rewarded-label",
    stage: "search",
    what: "carries `💰 Rewarded`",
    why: "Algora adds this label when it pays (notify_transfer.ex). The `💎 Bounty` label stays on a paid issue, which is why labelled supply is a ceiling, not a count.",
  },
  {
    id: "archived-repo",
    stage: "repo",
    what: "repository archived",
    why: "Archived repositories keep their bounty labels and cannot take a pull request — the census's second method finding (BOARD-2 §2.2).",
  },
  {
    id: "payout-comment",
    stage: "comments",
    what: "Algora's bot already announced the payout",
    why: "\"has been awarded\" by algora-pbc[bot] (notify_transfer.ex): the bounty is paid even where the label was not added.",
  },
  {
    id: "no-algora-bounty-comment",
    stage: "comments",
    what: "no bounty comment from algora-pbc[bot]",
    why: "The line's channel is the payer's own comment; a dollar sign from anybody else is not evidence of a funded bounty (intake.ts rule 5).",
  },
  {
    id: "amount-unparseable",
    stage: "comments",
    what: "no amount readable from the bot comment",
    why: "BOARD-2 §2.2 requires a parseable amount. An unreadable amount is an unknown, not a zero, so it is not counted either way.",
  },
  {
    id: "amount-under-minimum",
    stage: "comments",
    what: `amount under $${MIN_CLAIMABLE_USD}`,
    why: `BOARD-2 §2.2: "a parseable amount ≥ $${MIN_CLAIMABLE_USD}". The census's accessible long tail was $3-$245 tickets with a median of 8 competing comments.`,
  },
  {
    id: "policy-forbidden",
    stage: "policy",
    what: "repository or issue bans AI-authored work",
    why: "assessRepoPolicy (policy.ts) graded it `forbidden` from CONTRIBUTING, CODE_OF_CONDUCT, the pull-request template, the README or the issue itself. `unknown` is counted: silence is not a ban, and the colony discloses on every PR anyway.",
  },
  {
    id: "not-a-payer",
    stage: "policy",
    what: "the repository or issue says its bounties are not money",
    why: "assessRepoPolicy graded it `not-a-payer`: the bounties are symbolic or for research, nothing merges, it is \"not the right repo\" for paid work, starring or following is a condition of contributing, or the contributor's system prompt, session text or environment is demanded (RULING-2026-09-28-bounty-rail.md §3.3). A label with no payer behind it is not a bounty.",
  },
];

const FILTER_BY_ID = new Map(SUPPLY_FILTERS.map((f) => [f.id, f]));

// ── Facts in, verdicts out ───────────────────────────────────────────────────

/** One search result, reduced to what the filters read. */
export interface SupplyIssue {
  /** `owner/repo`. */
  repo: string;
  number: number;
  title: string;
  /** The issue's github.com page. */
  url: string;
  state: string;
  isPullRequest: boolean;
  labels: string[];
  body: string | null;
  createdAt: string;
  /** From the search result; the comment fetch is checked against it. */
  commentCount: number;
}

export interface SupplyComment {
  author: string;
  body: string;
  createdAt?: string;
}

export interface SupplyRepoFacts {
  archived: boolean;
}

export interface SupplyContext {
  repo?: SupplyRepoFacts;
  comments?: SupplyComment[];
  policyDocs?: RepoPolicyTexts;
}

export type IssueVerdict =
  | { kind: "needs"; need: Exclude<SupplyStage, "search"> }
  | { kind: "dropped"; filter: SupplyFilterId; detail: string; amountUsd: number | null }
  | {
      kind: "claimable";
      amountUsd: number;
      policy: PolicyVerdict;
      detail: string;
      /** Algora's "has been merged. The bounty can be rewarded" sentence, quoted, or null. Reported, not filtered. */
      solutionMerged: string | null;
    };

export interface AlgoraCommentReading {
  /** The first bot comment that carries `/attempt` or `/claim` — Algora edits it in place when the prize changes. */
  bounty: AlgoraBotComment | null;
  /** The payout sentence, quoted, or null. */
  payout: string | null;
  /** The merge sentence, quoted, or null. */
  merged: string | null;
}

/** github_controller.ex, the sentence Algora posts when a claimed pull request merges. */
const MERGED_AWAITING_REWARD = /has\s+been\s+merged\.?\s+The\s+bounty\s+can\s+be\s+rewarded/i;

const clip = (s: string, n = 160): string => {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? `${one.slice(0, n - 3)}...` : one;
};

/** Read an issue's comments the way the filters need them. Only algora-pbc[bot] is believed. */
export function readAlgoraComments(comments: SupplyComment[]): AlgoraCommentReading {
  let bounty: AlgoraBotComment | null = null;
  let payout: string | null = null;
  let merged: string | null = null;
  for (const c of comments) {
    const parsed = parseAlgoraBotComment({ author: c.author, body: c.body });
    if (!parsed.fromAlgoraBot) continue;
    if (parsed.state === "rewarded" && payout === null) payout = clip(c.body);
    if (MERGED_AWAITING_REWARD.test(c.body) && merged === null) merged = clip(c.body);
    if (parsed.state === "open" && bounty === null) bounty = parsed;
  }
  return { bounty, payout, merged };
}

const dropped = (filter: SupplyFilterId, detail: string, amountUsd: number | null = null): IssueVerdict => ({
  kind: "dropped",
  filter,
  detail,
  amountUsd,
});

/**
 * Decide one labelled issue, or say which data is needed to decide it.
 *
 * The fetcher calls this with whatever it has and supplies exactly what a `needs` verdict asks for, stage by stage —
 * which is how "fetch only for candidates that passed the cheaper filters" is enforced by construction.
 */
export function evaluateIssue(issue: SupplyIssue, ctx: SupplyContext = {}, minAmountUsd: number = MIN_CLAIMABLE_USD): IssueVerdict {
  const labels = issue.labels.map((l) => l.trim());
  // GitHub's label search is case-insensitive, so the check is too: a lowercase variant the search returned is the
  // same label, not a search mismatch.
  const has = (label: string) => labels.some((l) => l.toLowerCase() === label.toLowerCase());

  // search stage — free, the result already carries it.
  if (issue.isPullRequest || issue.state !== "open" || !has(BOUNTY_LABEL)) {
    return dropped(
      "not-an-open-labelled-issue",
      `${issue.isPullRequest ? "pull request" : `state ${issue.state}`}; labels: ${labels.join(", ") || "(none)"}`,
    );
  }
  if (has(REWARDED_LABEL)) return dropped("rewarded-label", `labels: ${labels.join(", ")}`);

  // repo stage.
  if (!ctx.repo) return { kind: "needs", need: "repo" };
  if (ctx.repo.archived) return dropped("archived-repo", `${issue.repo} is archived`);

  // comments stage.
  if (!ctx.comments) return { kind: "needs", need: "comments" };
  const read = readAlgoraComments(ctx.comments);
  const amount = read.bounty?.amountUsd ?? null;
  if (read.payout) return dropped("payout-comment", `algora-pbc[bot]: "${read.payout}"`, amount);
  if (!read.bounty) {
    return dropped(
      "no-algora-bounty-comment",
      `${ctx.comments.length} comment${ctx.comments.length === 1 ? "" : "s"}, none from ${ALGORA_BOT_LOGIN} carrying /attempt or /claim`,
    );
  }
  if (amount === null) return dropped("amount-unparseable", `bot comment: "${clip(read.bounty.quotes.join(" | "))}"`);
  if (amount < minAmountUsd) return dropped("amount-under-minimum", `$${amount} < $${minAmountUsd}`, amount);

  // policy stage.
  if (!ctx.policyDocs) return { kind: "needs", need: "policy" };
  const docs: RepoPolicyTexts = { ...ctx.policyDocs };
  if (issue.body && issue.body.trim()) docs.issueText = issue.body;
  const policy = assessRepoPolicy(docs);
  if (policy.verdict === "forbidden") {
    const ban = policy.reasons.find((r) => r.signal === "ban")!;
    return dropped("policy-forbidden", `${ban.document}: "${clip(ban.quote)}"`, amount);
  }
  if (policy.verdict === "not-a-payer") {
    const refusal = policy.reasons.find((r) => r.signal === "not-a-payer")!;
    return dropped("not-a-payer", `${refusal.document}: "${clip(refusal.quote)}"`, amount);
  }
  return { kind: "claimable", amountUsd: amount, policy: policy.verdict, detail: policy.summary, solutionMerged: read.merged };
}

// ── The weekly series and the board's reading ────────────────────────────────

export interface SupplyReading {
  /** ISO 8601 week, e.g. `2026-W40`. One reading per week. */
  week: string;
  measuredAt: string;
  claimable: number;
  /** The counter that produced it (`SUPPLY_COUNTER_VERSION`). Absent on readings of the first counter, read as 1. */
  counter?: number;
}

/** A reading struck as an instrument fault: recorded beside the series, never inside it (BOARD-LOOP KILL-1). */
export interface InstrumentFault {
  week: string;
  measuredAt: string;
  claimable: number;
  reason: string;
}

/** True when the reading came from a counter older than the current one. */
export function isPreFixReading(r: SupplyReading): boolean {
  return (r.counter ?? 1) < SUPPLY_COUNTER_VERSION;
}

/**
 * Split a series into the readings the board may read and the ones struck as faults. Earlier faults are kept, and a
 * reading is recorded as a fault once (by week and measuredAt), so striking is idempotent.
 */
export function splitPreFixReadings(
  history: SupplyReading[],
  faults: InstrumentFault[] = [],
  reason: string = PRE_FIX_FAULT_REASON,
): { history: SupplyReading[]; instrumentFaults: InstrumentFault[] } {
  const out: InstrumentFault[] = [...faults];
  const seen = new Set(out.map((f) => `${f.week}|${f.measuredAt}`));
  const kept: SupplyReading[] = [];
  for (const r of history) {
    if (!isPreFixReading(r)) {
      kept.push(r);
      continue;
    }
    const key = `${r.week}|${r.measuredAt}`;
    if (!seen.has(key)) {
      out.push({ week: r.week, measuredAt: r.measuredAt, claimable: r.claimable, reason });
      seen.add(key);
    }
  }
  out.sort((a, b) => a.week.localeCompare(b.week) || a.measuredAt.localeCompare(b.measuredAt));
  return { history: kept, instrumentFaults: out };
}

/** ISO 8601 week-numbering year and week of an instant, in UTC. */
export function isoWeek(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new TypeError(`isoWeek: not a timestamp: ${iso}`);
  const d = new Date(ms);
  const day = d.getUTCDay() || 7; // Monday 1 … Sunday 7
  const thursday = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 4 - day);
  const year = new Date(thursday).getUTCFullYear();
  const week = Math.floor((thursday - Date.UTC(year, 0, 1)) / 86_400_000 / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Add a reading, one per ISO week. A second run inside the same week (a manual dispatch) replaces that week's reading
 * when it is newer, so four weekly readings stay four — the board's mean is over weeks, not over runs.
 */
export function appendWeeklyReading(history: SupplyReading[], reading: { measuredAt: string; claimable: number; counter?: number }): SupplyReading[] {
  const week = isoWeek(reading.measuredAt);
  const next = history.filter((r) => r.week !== week);
  const existing = history.find((r) => r.week === week);
  const keep = existing && Date.parse(existing.measuredAt) > Date.parse(reading.measuredAt) ? existing : { week, ...reading };
  next.push(keep);
  return next.sort((a, b) => a.week.localeCompare(b.week));
}

export type BoardSupplyVerdict = "pending" | "keep" | "retarget" | "kill";

export interface BoardSupplyReading {
  weeksRead: number;
  /** The first four weekly readings — the board reads week 4 once; later weeks do not rewrite it. */
  readings: SupplyReading[];
  mean: number | null;
  /** The four readings sit in four consecutive ISO weeks, as the board asked. */
  consecutive: boolean | null;
  verdict: BoardSupplyVerdict;
  text: string;
}

function weekIndex(week: string): number {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!m) return NaN;
  // Monday of ISO week 1 is the Monday on or before 4 January.
  const jan4 = Date.UTC(Number(m[1]), 0, 4);
  const monday1 = jan4 - ((new Date(jan4).getUTCDay() || 7) - 1) * 86_400_000;
  return Math.round((monday1 + (Number(m[2]) - 1) * 7 * 86_400_000) / (7 * 86_400_000));
}

/**
 * BOARD-2 §2.2's week-4 rule. It reads; it does not act — the target moves when the main thread applies the ruling
 * to `portfolio.ts`, not because this function returned a word. It reads `history` only: struck readings live in
 * `instrumentFaults` and are never passed here.
 */
export function readBoardVerdict(history: SupplyReading[]): BoardSupplyReading {
  const sorted = [...history].sort((a, b) => a.week.localeCompare(b.week));
  const t = SUPPLY_THRESHOLDS;
  const readings = sorted.slice(0, t.weeks);
  if (readings.length < t.weeks) {
    return {
      weeksRead: sorted.length,
      readings,
      mean: null,
      consecutive: null,
      verdict: "pending",
      text:
        `Week ${sorted.length} of ${t.weeks}. The board reads the mean of ${t.weeks} weekly readings: ≥ ${t.keepAtOrAbove} keeps ₪${t.keepTargetIls}; ` +
        `${t.killBelow}-${t.keepAtOrAbove - 1} retargets to ₪${t.retargetIls} (grade contradicted); under ${t.killBelow} kills the line. ` +
        "Until then the owner is not asked for step 4b (the Stripe form) on this line's account; 4a, a two-minute sign-in, rides step 7.",
    };
  }
  const mean = readings.reduce((n, r) => n + r.claimable, 0) / readings.length;
  const idx = readings.map((r) => weekIndex(r.week));
  const consecutive = idx.every((w, i) => i === 0 || w === idx[i - 1]! + 1);
  const shown = Number.isInteger(mean) ? String(mean) : mean.toFixed(2);
  const gap = consecutive ? "" : " The four readings are not four consecutive weeks, which the board asked for; say so when applying it.";
  let verdict: BoardSupplyVerdict;
  let text: string;
  if (mean >= t.keepAtOrAbove) {
    verdict = "keep";
    text = `Mean ${shown} ≥ ${t.keepAtOrAbove}: ₪${t.keepTargetIls} stands; 4b after the first held reward (RULING-2026-09-28-bounty-rail.md §4.1).`;
  } else if (mean >= t.killBelow) {
    verdict = "retarget";
    text = `Mean ${shown} is in the ${t.killBelow}-${t.keepAtOrAbove - 1} band: retarget ₪${t.keepTargetIls} → ₪${t.retargetIls}, grade \`contradicted\`, basis carries both readings; 4b only after a held reward (RULING-2026-09-28-bounty-rail.md §4.3).`;
  } else {
    verdict = "kill";
    text = `Mean ${shown} < ${t.killBelow}: oss-bounties is killed into docs/REJECTED.md with the re-open trigger "${REOPEN_TRIGGER}"; step 4 is not requested for this line's sake.`;
  }
  return { weeksRead: sorted.length, readings, mean, consecutive, verdict, text: `${text}${gap}` };
}

// ── Aggregation ──────────────────────────────────────────────────────────────

export interface EvaluatedIssue {
  issue: SupplyIssue;
  verdict: IssueVerdict;
}

export interface CollectedRepo {
  archived?: boolean;
  /** Present only when the policy files were read — i.e. the repository had a bounty that reached the policy filter. */
  policyDocs?: RepoPolicyTexts;
}

export interface SupplyMethod {
  query: string;
  /** What GitHub search reported; the evaluated list, plus `searchUnserved`, must account for every one. */
  searchTotalCount: number;
  /**
   * Issues GitHub search counted and did not serve on two full passes that served the identical set, within
   * `searchUnservedAllowance`. Reported beside the count, never inside it. Absent in files written before 28.9.2026,
   * which is read as 0: those runs accepted no gap at all.
   */
  searchUnserved?: number;
  authenticated: boolean;
  requests: { search: number; core: number };
  rateLimitWaitSeconds: number;
  notes?: string[];
}

export interface RepoSupply {
  repo: string;
  labelledOpen: number;
  claimable: number;
  claimableUsd: number;
  /** null when the repository object was never needed (every issue dropped on its labels). */
  archived: boolean | null;
  /** assessRepoPolicy over the repository's own files; null when they were never read. */
  policy: PolicyVerdict | null;
  dropped: Partial<Record<SupplyFilterId, number>>;
}

export interface ClaimableBounty {
  repo: string;
  number: number;
  title: string;
  url: string;
  amountUsd: number;
  policy: PolicyVerdict;
  /** A claimed pull request already merged; the bounty waits for its solver's payout. */
  solutionMerged: boolean;
  /** When the issue was created. Absent in files written before 28.9.2026. */
  createdAt?: string;
}

/** `claimableFresh365`'s window: an issue created within this many days of the measurement. */
export const FRESH_WINDOW_DAYS = 365;

export interface SupplyMeasurement {
  measuredAt: string;
  /** THE number: the KPI `claimableBounties` on the `oss-bounties` line, on the board's own definition. */
  claimableBounties: number;
  /** The stricter reading beside it: claimable minus those whose claimed pull request already merged. Not gated. */
  claimableWithoutMergedSolution: number;
  /**
   * Claimable issues created within `FRESH_WINDOW_DAYS` of `measuredAt`, shown beside the count and never gated, so the
   * week-4 reader sees how much of the remainder is stale (RULING-2026-09-28-bounty-rail.md §3.3). Absent before 28.9.2026.
   */
  claimableFresh365?: number;
  claimableUsd: number;
  labelledOpenIssues: number;
  repositories: number;
  minAmountUsd: number;
  funnel: { filter: SupplyFilterId; stage: SupplyStage; what: string; dropped: number; remaining: number }[];
  droppedByFilter: Record<SupplyFilterId, number>;
  /** Up to three issues per filter, so a reader can check a filter did what it says. */
  examples: Partial<Record<SupplyFilterId, { ref: string; detail: string }[]>>;
  byRepo: RepoSupply[];
  claimable: ClaimableBounty[];
  history: SupplyReading[];
  /** Readings struck as instrument faults, recorded and never averaged (RULING-2026-09-28-bounty-rail.md §3.4). */
  instrumentFaults: InstrumentFault[];
  /** True when this file's own reading is one of the struck ones: its count is a fault, not a reading. */
  struck?: boolean;
  boardReading: BoardSupplyReading;
  /** `searchUnserved` is always written (0 when search served everything); a file from before it existed lacks it. */
  method: SupplyMethod & { notes: string[] };
}

export const METHOD_NOTES: readonly string[] = [
  `Source: GitHub search \`${SUPPLY_SEARCH_QUERY}\`, sorted by creation date and paged 100 at a time (split by creation date when a query exceeds GitHub's 1,000-result cap), then the GitHub REST API for repositories, issue comments and policy files. No request goes to Algora's own site: its terms forbid automated access (research/rendered/algora-terms.txt:258-260).`,
  "Scope: labelled supply only. Algora adds the label only through its GitHub App installation (notify_bounty.ex); a bounty on a repository without the App gets a comment and no label, and is not counted here (the SWEEP-2.md github-native confound). The label count is a ceiling on labelled supply; this is the claimable part of it.",
  `Amount: read from the algora-pbc[bot] bounty comment by parseAlgoraBotComment (intake.ts); ≥ $${MIN_CLAIMABLE_USD} counts, inclusive.`,
  "Payout: an algora-pbc[bot] comment saying the bounty \"has been awarded\" (notify_transfer.ex), or the 💰 Rewarded label the same job adds. Merge: the bot's \"has been merged. The bounty can be rewarded\" comment does not drop an issue (it is not on the board's list); it is reported as the stricter number beside the count.",
  "Policy: assessRepoPolicy over CONTRIBUTING, CODE_OF_CONDUCT, the pull-request template and the README, located in .github/, the root and docs/ in GitHub's own precedence, plus the issue body. Read only for repositories with a bounty that passed every cheaper filter. `unknown` is counted. Permission counts only from visible text (HTML comments are blanked); a ban or a `not-a-payer` statement counts anywhere (counter version 2, 28.9.2026).",
  "Failure: any API error, an exhausted rate-limit budget, or a search that returns fewer issues than it reports (past the one exception below) writes nothing and fails the job — an unmeasured week is a missing reading, never a zero.",
  `Search gaps: GitHub's reported total can include index entries it never shows (hidden, deleted or transferred issues, unavailable repositories). A query that falls short is read a second full time. Only if both passes serve the identical issues, and the gap to the larger reported total is at most max(${SEARCH_UNSERVED_FLOOR}, 1% of that total) per query and over the whole search, is the run accepted, with the gap recorded as \`searchUnserved\` beside the count, never in it. Passes that differ fail the run as above, even when the second pass is complete on its own (an issue that left the results between page fetches): the short first pass is not overruled by a pass that disagrees with it. A larger gap fails the run too.`,
];

function refOf(i: SupplyIssue): string {
  return `${i.repo}#${i.number}`;
}

/**
 * Add the verdicts up. Throws if any issue is undecided or if the list does not account for every issue the search
 * reported — a partial count is not a count.
 */
export function buildSupplyMeasurement(input: {
  measuredAt: string;
  evaluated: EvaluatedIssue[];
  repos: Record<string, CollectedRepo>;
  method: SupplyMethod;
  previousHistory?: SupplyReading[];
  previousInstrumentFaults?: InstrumentFault[];
  minAmountUsd?: number;
}): SupplyMeasurement {
  const { measuredAt, repos, method } = input;
  if (Number.isNaN(Date.parse(measuredAt))) throw new TypeError(`buildSupplyMeasurement: measuredAt is not a timestamp: ${measuredAt}`);
  const evaluated = [...input.evaluated].sort((a, b) => a.issue.repo.localeCompare(b.issue.repo) || a.issue.number - b.issue.number);

  for (const e of evaluated) {
    if (e.verdict.kind === "needs") throw new Error(`${refOf(e.issue)} still needs ${e.verdict.need}; the evaluation is unfinished, so nothing is written.`);
  }
  const unique = new Set(evaluated.map((e) => refOf(e.issue)));
  if (unique.size !== evaluated.length) throw new Error("the evaluated list holds the same issue twice; nothing is written.");
  const unserved = method.searchUnserved ?? 0;
  if (!Number.isInteger(unserved) || unserved < 0) {
    throw new TypeError(`buildSupplyMeasurement: searchUnserved must be a whole number of issues, not ${unserved}; nothing is written.`);
  }
  if (evaluated.length + unserved < method.searchTotalCount) {
    throw new Error(
      `GitHub search reported ${method.searchTotalCount} labelled issues and ${evaluated.length} were evaluated (${evaluated.length} of ${method.searchTotalCount}` +
        `${unserved ? `, ${unserved} recorded as unserved` : ""}); a partial count is not a count, so nothing is written.`,
    );
  }
  const allowance = searchUnservedAllowance(method.searchTotalCount);
  if (unserved > allowance) {
    throw new Error(
      `GitHub search counted ${unserved} unserved of ${method.searchTotalCount}; the rule allows ${allowance} (max(${SEARCH_UNSERVED_FLOOR}, 1% of the reported total)), so nothing is written.`,
    );
  }

  const droppedByFilter = Object.fromEntries(SUPPLY_FILTERS.map((f) => [f.id, 0])) as Record<SupplyFilterId, number>;
  const examples: SupplyMeasurement["examples"] = {};
  const repoRows = new Map<string, RepoSupply>();
  const claimable: ClaimableBounty[] = [];

  for (const { issue, verdict } of evaluated) {
    let row = repoRows.get(issue.repo);
    if (!row) {
      const facts = repos[issue.repo];
      row = {
        repo: issue.repo,
        labelledOpen: 0,
        claimable: 0,
        claimableUsd: 0,
        archived: typeof facts?.archived === "boolean" ? facts.archived : null,
        policy: facts?.policyDocs ? assessRepoPolicy(facts.policyDocs).verdict : null,
        dropped: {},
      };
      repoRows.set(issue.repo, row);
    }
    row.labelledOpen += 1;
    if (verdict.kind === "claimable") {
      row.claimable += 1;
      row.claimableUsd += verdict.amountUsd;
      claimable.push({
        repo: issue.repo,
        number: issue.number,
        title: issue.title,
        url: issue.url,
        amountUsd: verdict.amountUsd,
        policy: verdict.policy,
        solutionMerged: verdict.solutionMerged !== null,
        createdAt: issue.createdAt,
      });
    } else if (verdict.kind === "dropped") {
      droppedByFilter[verdict.filter] += 1;
      row.dropped[verdict.filter] = (row.dropped[verdict.filter] ?? 0) + 1;
      const list = (examples[verdict.filter] ??= []);
      if (list.length < 3) list.push({ ref: refOf(issue), detail: verdict.detail });
    }
  }

  let remaining = evaluated.length;
  const funnel = SUPPLY_FILTERS.map((f) => {
    remaining -= droppedByFilter[f.id];
    return { filter: f.id, stage: f.stage, what: f.what, dropped: droppedByFilter[f.id], remaining };
  });

  const byRepo = [...repoRows.values()].sort(
    (a, b) => b.claimable - a.claimable || b.claimableUsd - a.claimableUsd || b.labelledOpen - a.labelledOpen || a.repo.localeCompare(b.repo),
  );
  claimable.sort((a, b) => b.amountUsd - a.amountUsd || a.repo.localeCompare(b.repo) || a.number - b.number);
  const claimableUsd = claimable.reduce((n, c) => n + c.amountUsd, 0);
  const measuredMs = Date.parse(measuredAt);
  const claimableFresh365 = claimable.filter((c) => {
    const created = c.createdAt ? Date.parse(c.createdAt) : NaN;
    return Number.isFinite(created) && measuredMs - created <= FRESH_WINDOW_DAYS * 86_400_000;
  }).length;
  // Readings from an older counter leave the series before this week's reading joins it (strike, then append), so a
  // same-week pre-fix reading is recorded as a fault rather than silently replaced.
  const split = splitPreFixReadings(input.previousHistory ?? [], input.previousInstrumentFaults ?? []);
  const history = appendWeeklyReading(split.history, { measuredAt, claimable: claimable.length, counter: SUPPLY_COUNTER_VERSION });

  return {
    measuredAt,
    claimableBounties: claimable.length,
    claimableWithoutMergedSolution: claimable.filter((c) => !c.solutionMerged).length,
    claimableFresh365,
    claimableUsd,
    labelledOpenIssues: evaluated.length,
    repositories: repoRows.size,
    minAmountUsd: input.minAmountUsd ?? MIN_CLAIMABLE_USD,
    funnel,
    droppedByFilter,
    examples,
    byRepo,
    claimable,
    history,
    instrumentFaults: split.instrumentFaults,
    boardReading: readBoardVerdict(history),
    method: { ...method, searchUnserved: unserved, notes: [...METHOD_NOTES, ...(method.notes ?? [])] },
  };
}

/**
 * Strike every pre-fix reading in a written measurement — including, when it is one, the file's own — and re-read the
 * board's verdict from what is left. The generator's own path for RULING-2026-09-28-bounty-rail.md §3.4: used by
 * `scripts/algora-supply.ts --strike-pre-fix` on the file already on disk; a measuring run does the same through
 * `buildSupplyMeasurement`. Idempotent.
 */
export function strikePreFixReadings(m: SupplyMeasurement, reason: string = PRE_FIX_FAULT_REASON): SupplyMeasurement {
  const split = splitPreFixReadings(m.history ?? [], m.instrumentFaults ?? [], reason);
  const own = split.instrumentFaults.some((f) => f.measuredAt === m.measuredAt);
  return {
    ...m,
    history: split.history,
    instrumentFaults: split.instrumentFaults,
    struck: own || m.struck === true,
    boardReading: readBoardVerdict(split.history),
  };
}

// ── The human-readable file ──────────────────────────────────────────────────

/** Third-party text inside a Markdown table: one line, no pipes, no HTML, capped. */
function cell(text: string, max = 90): string {
  const one = text.replace(/\s+/g, " ").trim().replace(/[<>]/g, "").replace(/`/g, "'");
  const capped = one.length > max ? `${one.slice(0, max - 3)}...` : one;
  return capped.replace(/\|/g, "\\|");
}

const usd = (n: number): string => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** `research/measurements/algora-supply.md`, regenerated on every run. */
export function renderSupplyMarkdown(m: SupplyMeasurement): string {
  const out: string[] = [];
  const b = m.boardReading;
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  out.push("# Algora bounty supply — the weekly claimable count");
  out.push("");
  out.push(
    `**Status: MEASURED ${m.measuredAt} by \`.github/workflows/algora-supply.yml\` (\`scripts/algora-supply.ts\`).** ` +
      "Regenerated on every run — do not edit by hand. Ordered by `research/colony-sweep/BOARD-2.md §2.2` as the first build step of `oss-bounties`.",
  );
  out.push("");
  if (m.struck) {
    out.push(
      "> **STRUCK — this run's count is an instrument fault, not a reading.** It was produced by the counter before the 28.9.2026 correction " +
        "(visible-text permission and the `not-a-payer` filter, RULING-2026-09-28-bounty-rail.md §3.3) and is recorded under \"Struck readings\" below, never averaged. " +
        "Week 1 of 4 is the first run of the corrected counter; this file is regenerated by that run. The numbers under \"The number\" are kept only so the fault can be checked.",
    );
    out.push("");
  }
  out.push("## The number");
  out.push("");
  out.push(
    `**${m.claimableBounties} claimable ${plural(m.claimableBounties, "bounty", "bounties")}** (${usd(m.claimableUsd)} in visible amounts) out of ` +
      `${m.labelledOpenIssues} open ${plural(m.labelledOpenIssues, "issue", "issues")} carrying Algora's \`${BOUNTY_LABEL}\` label across ${m.repositories} ${plural(m.repositories, "repository", "repositories")}.`,
  );
  out.push("");
  if (typeof m.claimableFresh365 === "number") {
    out.push(
      `Freshness, not gated: **${m.claimableFresh365}** of them created within the last ${FRESH_WINDOW_DAYS} days. ` +
        "The rest are older issues; the week-4 reader sees whether a small count is stale supply or no supply.",
    );
    out.push("");
  }
  const merged = m.claimableBounties - m.claimableWithoutMergedSolution;
  out.push(
    `Stricter reading, not gated: **${m.claimableWithoutMergedSolution}** once the ${merged} ${plural(merged, "bounty", "bounties")} whose claimed pull request Algora already saw merged ` +
      "are left out — funded and unpaid, but promised to that solver. The board's thresholds read the number above, on its own definition; this one is shown so the week-4 reader can weigh both.",
  );
  out.push("");
  const unserved = m.method.searchUnserved ?? 0;
  const caveat = unservedCaveat(unserved);
  if (caveat) {
    out.push(
      `**${caveat}** Search reported ${m.method.searchTotalCount}; each query that stayed short was read twice in full and served the identical issues both times, ` +
        "so the gap is index entries GitHub counts and will not show (hidden, deleted or transferred issues, or repositories no longer available). " +
        `It is within the allowance of ${searchUnservedAllowance(m.method.searchTotalCount)} (max(${SEARCH_UNSERVED_FLOOR}, 1% of the reported total)). The count above is of what was served; the gap is carried here, not added to it or read as a zero.`,
    );
    out.push("");
  }
  out.push("A count of jobs a payer has posted, not revenue: money counts only in `revenue_ledger` with a platform transaction id (MISSION rule 2).");
  out.push("");

  out.push(`## The board's reading — week ${Math.min(b.weeksRead, SUPPLY_THRESHOLDS.weeks)} of ${SUPPLY_THRESHOLDS.weeks}`);
  out.push("");
  if (m.history.length === 0) {
    out.push("No reading in the series yet: week 1 is the first run of the corrected counter.");
  } else {
    out.push("| ISO week | Measured at | Claimable |");
    out.push("|---|---|---:|");
    for (const r of m.history) out.push(`| ${r.week} | ${r.measuredAt} | ${r.claimable} |`);
  }
  out.push("");
  out.push(b.mean === null ? b.text : `**${b.verdict.toUpperCase()}.** ${b.text}`);
  out.push("");
  out.push("This file reads the rule; it does not apply it. The ₪300 target changes only when the main thread records the ruling in `src/revenue/portfolio.ts`.");
  out.push("");
  const faults = m.instrumentFaults ?? [];
  if (faults.length) {
    out.push("## Struck readings");
    out.push("");
    out.push("Instrument faults: recorded so they are never lost, and never averaged into the board's reading (BOARD-LOOP KILL-1).");
    out.push("");
    out.push("| ISO week | Measured at | Claimable | Reason |");
    out.push("|---|---|---:|---|");
    for (const f of faults) out.push(`| ${f.week} | ${f.measuredAt} | ${f.claimable} | ${cell(f.reason, 600)} |`);
    out.push("");
  }

  out.push("## What was excluded, and why");
  out.push("");
  out.push("| Filter | Dropped | Left | Why |");
  out.push("|---|---:|---:|---|");
  out.push(`| (labelled, open) | — | ${m.labelledOpenIssues} | GitHub search \`${SUPPLY_SEARCH_QUERY}\` |`);
  for (const step of m.funnel) {
    const f = FILTER_BY_ID.get(step.filter)!;
    out.push(`| \`${step.filter}\` — ${f.what} | ${step.dropped} | ${step.remaining} | ${f.why} |`);
  }
  out.push("");
  const exampleFilters = SUPPLY_FILTERS.filter((f) => (m.examples[f.id] ?? []).length > 0);
  if (exampleFilters.length) {
    out.push("Examples, up to three per filter, so each can be checked by hand:");
    out.push("");
    for (const f of exampleFilters) {
      for (const e of m.examples[f.id]!) out.push(`- \`${f.id}\` — ${e.ref}: ${cell(e.detail, 200)}`);
    }
    out.push("");
  }

  out.push("## Claimable bounties");
  out.push("");
  if (m.claimable.length === 0) {
    out.push("None this week.");
  } else {
    out.push("| Repository | Issue | Amount | Policy | Solution merged | Title |");
    out.push("|---|---|---:|---|---|---|");
    for (const c of m.claimable) {
      out.push(`| \`${c.repo}\` | [#${c.number}](${c.url}) | ${usd(c.amountUsd)} | ${c.policy} | ${c.solutionMerged ? "yes" : "no"} | ${cell(c.title)} |`);
    }
  }
  out.push("");

  out.push("## Per repository");
  out.push("");
  out.push("| Repository | Labelled open | Claimable | Claimable $ | Archived | Policy | Dropped by |");
  out.push("|---|---:|---:|---:|---|---|---|");
  for (const r of m.byRepo) {
    const drops = SUPPLY_FILTERS.filter((f) => r.dropped[f.id]).map((f) => `${f.id} ${r.dropped[f.id]}`).join(", ");
    out.push(
      `| \`${r.repo}\` | ${r.labelledOpen} | ${r.claimable} | ${usd(r.claimableUsd)} | ${r.archived === null ? "—" : r.archived ? "yes" : "no"} | ${r.policy ?? "—"} | ${drops || "—"} |`,
    );
  }
  out.push("");

  out.push("## Method");
  out.push("");
  for (const note of m.method.notes) out.push(`- ${note}`);
  out.push(
    `- This run: ${m.method.authenticated ? "authenticated (GITHUB_TOKEN)" : "unauthenticated"}, ${m.method.requests.search} search and ${m.method.requests.core} REST requests, ` +
      `${m.method.rateLimitWaitSeconds}s spent waiting on rate limits; search reported ${m.method.searchTotalCount}` +
      `${unserved ? ` and served ${m.labelledOpenIssues} (${unserved} unserved)` : ""}.`,
  );
  out.push("");
  return out.join("\n");
}
