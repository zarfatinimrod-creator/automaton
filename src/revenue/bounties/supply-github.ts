/**
 * Revenue Colony — Algora OSS bounties: the GitHub half of the weekly supply count.
 *
 * `supply.ts` decides; this module fetches, and only from `api.github.com` — the client refuses any other host, so
 * the one request this line may never make (Algora's own site, whose terms forbid automated access — BOARD-2 §2.1)
 * cannot be made through it by accident. Run from CI by `scripts/algora-supply.ts` (`.github/workflows/algora-supply.yml`).
 *
 * Three properties the board's measurement depends on, and where each is enforced:
 *
 *  - **Only what the cheaper filters let through is fetched.** `collectSupply` asks `evaluateIssue` what each issue
 *    needs and supplies exactly that, stage by stage: repository objects only for issues without `💰 Rewarded`,
 *    comments only for issues in live repositories, policy files only for repositories with a bounty that cleared
 *    every other filter. Repository objects and policy files are fetched once per repository.
 *  - **Rate limits are respected, never outrun.** Search calls are paced to GitHub's per-minute search limit; a
 *    primary or secondary limit is waited out using GitHub's own headers (`retry-after`, `x-ratelimit-reset`) up to a
 *    total budget, and past it the run fails. `GITHUB_TOKEN` is used when present (Actions provides it: 1,000 REST
 *    requests an hour for the repository, 30 searches a minute); without it the unauthenticated limits apply
 *    (60 an hour, 10 a minute), which a full count will usually exhaust — and then the run says so and stops.
 *  - **Paging is deterministic.** Search is sorted by creation date, oldest first, 100 per page; a query GitHub
 *    would cap at 1,000 results is split by creation date until every piece fits. Any page GitHub marks incomplete
 *    fails the run. A total the pages do not reach is read a second full time: two passes that serve the identical
 *    issues, short by at most `searchUnservedAllowance` of the reported total, are accepted with the gap recorded as
 *    `searchUnserved`; anything else — a second pass that serves a different set, complete or not — fails the run
 *    (`searchAllIssues`).
 *
 * Failure writes nothing (`runAlgoraSupply`): a week that could not be measured is a missing reading, never a zero.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  SEARCH_UNSERVED_FLOOR,
  SUPPLY_SEARCH_QUERY,
  buildSupplyMeasurement,
  evaluateIssue,
  renderSupplyMarkdown,
  searchUnservedAllowance,
  strikePreFixReadings,
  unservedCaveat,
  type CollectedRepo,
  type InstrumentFault,
  type EvaluatedIssue,
  type IssueVerdict,
  type SupplyComment,
  type SupplyContext,
  type SupplyIssue,
  type SupplyMeasurement,
  type SupplyReading,
} from "./supply.js";
import type { RepoPolicyTexts } from "./policy.js";

export const GITHUB_API = "https://api.github.com";
export const PAGE_SIZE = 100;
/** GitHub search returns at most this many results for one query, however many match. */
export const SEARCH_RESULT_CAP = 1000;
/** The earliest creation date searched; GitHub opened in 2008. */
export const SEARCH_SINCE = "2008-01-01";
/** Total time the run may spend waiting on rate limits before it gives up. One hourly reset, and a margin. */
export const DEFAULT_MAX_RATE_LIMIT_WAIT_MS = 65 * 60_000;
/** Search is limited per minute: 30 authenticated, 10 unauthenticated. The gaps keep under both. */
export const SEARCH_MIN_INTERVAL_MS = { authenticated: 2_100, unauthenticated: 6_100 } as const;
const MAX_ATTEMPTS = 6;
const MAX_COMMENT_PAGES = 50;

export const DEFAULT_SUPPLY_JSON = join("state", "colony", "measurements", "algora-supply.json");
export const DEFAULT_SUPPLY_MD = join("research", "measurements", "algora-supply.md");

// ── The client ───────────────────────────────────────────────────────────────

export class GithubApiError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    detail: string,
  ) {
    super(`GitHub API ${status} for ${url}${detail ? `: ${detail.replace(/\s+/g, " ").slice(0, 300)}` : ""}`);
    this.name = "GithubApiError";
  }
}

export class RateLimitBudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitBudgetError";
  }
}

interface HeaderSource {
  status: number;
  headers: { get(name: string): string | null };
}

/**
 * How long GitHub says to wait, or null when the response is not a rate limit.
 *
 * GitHub's documented order: honour `retry-after`; else, with `x-ratelimit-remaining: 0`, wait until
 * `x-ratelimit-reset`; else a secondary limit that names itself means waiting at least a minute. A 403 with none of
 * these is a permission error and is not retried.
 */
export function rateLimitWaitMs(res: HeaderSource, bodyText: string, nowMs: number): number | null {
  if (res.status !== 403 && res.status !== 429) return null;
  const retryAfter = Number(res.headers.get("retry-after"));
  if (res.headers.get("retry-after") !== null && Number.isFinite(retryAfter) && retryAfter >= 0) return retryAfter * 1000;
  const reset = Number(res.headers.get("x-ratelimit-reset"));
  if (res.headers.get("x-ratelimit-remaining") === "0" && Number.isFinite(reset) && reset > 0) {
    return Math.max(1000, reset * 1000 - nowMs + 1000);
  }
  if (/rate limit/i.test(bodyText)) return 60_000;
  return null;
}

export interface GithubClientOptions {
  token?: string | null;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  maxWaitMs?: number;
  log?: (message: string) => void;
}

export interface GithubClientStats {
  search: number;
  core: number;
  waitedMs: number;
}

export interface GithubClient {
  readonly authenticated: boolean;
  json<T>(pathOrUrl: string, opts?: { search?: boolean; allow404?: boolean }): Promise<T | null>;
  text(pathOrUrl: string, opts?: { allow404?: boolean }): Promise<string | null>;
  stats(): GithubClientStats;
}

export function createGithubClient(opts: GithubClientOptions = {}): GithubClient {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const now = opts.now ?? Date.now;
  const log = opts.log ?? (() => {});
  const token = (opts.token ?? "").trim() || null;
  const maxWaitMs = opts.maxWaitMs ?? DEFAULT_MAX_RATE_LIMIT_WAIT_MS;
  const searchGap = token ? SEARCH_MIN_INTERVAL_MS.authenticated : SEARCH_MIN_INTERVAL_MS.unauthenticated;
  const stats: GithubClientStats = { search: 0, core: 0, waitedMs: 0 };
  let lastSearchAt = -Infinity;

  const resolveUrl = (pathOrUrl: string): string => {
    if (pathOrUrl.startsWith("/")) return `${GITHUB_API}${pathOrUrl}`;
    if (pathOrUrl.startsWith(`${GITHUB_API}/`)) return pathOrUrl;
    throw new Error(`the supply client requests only api.github.com, refused: ${pathOrUrl}`);
  };

  async function request(pathOrUrl: string, accept: string, search: boolean, allow404: boolean): Promise<Response | null> {
    const url = resolveUrl(pathOrUrl);
    const headers: Record<string, string> = {
      Accept: accept,
      "User-Agent": "colony-algora-supply",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    for (let attempt = 1; ; attempt += 1) {
      if (search) {
        const gap = lastSearchAt + searchGap - now();
        if (gap > 0) await sleep(gap);
        lastSearchAt = now();
      }
      const res = await fetchImpl(url, { headers });
      if (search) stats.search += 1;
      else stats.core += 1;
      if (res.ok) return res;
      const body = await res.text().catch(() => "");
      if (res.status === 404 && allow404) return null;

      const wait = rateLimitWaitMs(res, body, now());
      if (wait !== null && attempt < MAX_ATTEMPTS) {
        if (stats.waitedMs + wait > maxWaitMs) {
          throw new RateLimitBudgetError(
            `GitHub rate limit: waiting ${Math.ceil(wait / 1000)}s more would pass the ${Math.round(maxWaitMs / 60_000)}-minute budget ` +
              `(${token ? "authenticated" : "unauthenticated — set GITHUB_TOKEN; Actions provides it"}; ${stats.search} search and ${stats.core} REST requests so far).`,
          );
        }
        log(`rate limited (${res.status}) on ${url}; waiting ${Math.ceil(wait / 1000)}s`);
        await sleep(wait);
        stats.waitedMs += wait;
        continue;
      }
      if (res.status >= 500 && attempt < 3) {
        log(`GitHub ${res.status} on ${url}; retrying`);
        await sleep(5_000 * attempt);
        continue;
      }
      throw new GithubApiError(res.status, url, body);
    }
  }

  return {
    authenticated: token !== null,
    async json<T>(pathOrUrl: string, o: { search?: boolean; allow404?: boolean } = {}) {
      const res = await request(pathOrUrl, "application/vnd.github+json", o.search === true, o.allow404 === true);
      return res === null ? null : ((await res.json()) as T);
    },
    async text(pathOrUrl: string, o: { allow404?: boolean } = {}) {
      const res = await request(pathOrUrl, "application/vnd.github.raw+json", false, o.allow404 === true);
      return res === null ? null : await res.text();
    },
    stats: () => ({ ...stats }),
  };
}

// ── Search ───────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const dayMs = (date: string): number => Date.parse(`${date}T00:00:00.000Z`);
const dayOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Split an inclusive `YYYY-MM-DD` range into two disjoint halves; null when it is a single day. */
export function splitDateRange(from: string, to: string): [[string, string], [string, string]] | null {
  const a = dayMs(from);
  const b = dayMs(to);
  if (!(b > a)) return null;
  const mid = a + Math.floor((b - a) / DAY_MS / 2) * DAY_MS;
  return [
    [from, dayOf(mid)],
    [dayOf(mid + DAY_MS), to],
  ];
}

interface SearchPage {
  total_count: number;
  incomplete_results: boolean;
  items: unknown[];
}

function searchPath(q: string, page: number): string {
  return `/search/issues?q=${encodeURIComponent(q)}&sort=created&order=asc&per_page=${PAGE_SIZE}&page=${page}`;
}

async function searchPage(client: GithubClient, q: string, page: number): Promise<SearchPage> {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const body = await client.json<SearchPage>(searchPath(q, page), { search: true });
    if (!body || typeof body.total_count !== "number" || !Array.isArray(body.items)) {
      throw new Error(`GitHub search returned an unexpected shape for "${q}" page ${page}`);
    }
    if (!body.incomplete_results) return body;
  }
  throw new Error(`GitHub search marked "${q}" page ${page} incomplete twice; a partial list is not a count.`);
}

interface SearchPass {
  /** What GitHub reported on the pass's first page. */
  total: number;
  /** What the pages served, by id. */
  got: Map<string, unknown>;
}

/** Every page of `q`, starting from its already-fetched first page. */
async function readPass(client: GithubClient, q: string, first: SearchPage): Promise<SearchPass> {
  const got = new Map<string, unknown>();
  const add = (list: unknown[]) => {
    for (const it of list) got.set(String((it as { id?: unknown }).id ?? JSON.stringify(it)), it);
  };
  add(first.items);
  const pages = Math.ceil(first.total_count / PAGE_SIZE);
  for (let page = 2; page <= pages; page += 1) add((await searchPage(client, q, page)).items);
  return { total: first.total_count, got };
}

const sameIds = (a: Map<string, unknown>, b: Map<string, unknown>): boolean => a.size === b.size && [...a.keys()].every((id) => b.has(id));

/**
 * Every issue matching `baseQuery`, oldest first. Ranges over GitHub's 1,000-result cap are split by creation date.
 *
 * GitHub's `total_count` is not always what the pages serve, for two known reasons, and a range that falls short is
 * read a second full time to tell them apart:
 *  - the index counts entries it never serves (hidden, deleted or transferred issues, repositories no longer
 *    available) — both passes serve the identical ids, and the gap is accepted when it is at most
 *    `searchUnservedAllowance` of the larger reported total, and returned as `unserved` so it is recorded, not absorbed;
 *  - an issue left (or joined) the results between page fetches, so offset paging skipped one — the second pass
 *    serves a different set, and the run fails. That holds even when the second pass is complete on its own: the
 *    short first pass is evidence about the range, and a complete pass that disagrees with it (one reporting 0, say)
 *    is not allowed to overrule it. The week is retried, not guessed.
 * Anything else throws too: a gap past the allowance — per query and over the whole search — or a range that cannot
 * be split further. A partial list is not a count.
 */
export async function searchAllIssues(
  client: GithubClient,
  baseQuery: string,
  today: string,
  since: string = SEARCH_SINCE,
): Promise<{ items: unknown[]; totalCount: number; unserved: number; queries: string[] }> {
  const items: unknown[] = [];
  const queries: string[] = [];
  let totalCount = 0;
  let unserved = 0;

  async function range(from: string, to: string): Promise<void> {
    const q = `${baseQuery} created:${from}..${to}`;
    const first = await searchPage(client, q, 1);
    if (first.total_count > SEARCH_RESULT_CAP) {
      const halves = splitDateRange(from, to);
      if (!halves) throw new Error(`more than ${SEARCH_RESULT_CAP} labelled issues were created on ${from}; the search cannot be split further.`);
      for (const [a, b] of halves) await range(a, b);
      return;
    }
    queries.push(q);
    let pass = await readPass(client, q, first);
    if (pass.got.size < pass.total) {
      const short = `GitHub search reported ${pass.total} issues for "${q}" and the pages held ${pass.got.size}`;
      const again = await searchPage(client, q, 1);
      if (again.total_count > SEARCH_RESULT_CAP) {
        throw new Error(`${short}, and a second pass reported ${again.total_count}, past the ${SEARCH_RESULT_CAP}-result cap; a partial list is not a count.`);
      }
      const second = await readPass(client, q, again);
      // The short first pass is evidence about this range, and a second pass is accepted only when it serves the very
      // same ids. A second pass that is complete on its own but serves a different set does not overrule it: that is
      // how a pass reporting 0 (or any other number) would become a real reading.
      if (!sameIds(pass.got, second.got)) {
        throw new Error(`${short}, and a second pass served a different set (${second.got.size} of ${second.total}); a partial list is not a count.`);
      }
      const reported = Math.max(pass.total, second.total);
      const gap = reported - second.got.size;
      const allowance = searchUnservedAllowance(reported);
      if (gap > allowance) {
        throw new Error(
          `${short}; a second pass served the same ${second.got.size}, and ${gap} unserved is more than the ${allowance} a stale index explains ` +
            `(max(${SEARCH_UNSERVED_FLOOR}, 1% of the reported total)); a partial list is not a count.`,
        );
      }
      unserved += gap;
      pass = { total: reported, got: second.got };
    }
    totalCount += pass.total;
    items.push(...pass.got.values());
  }

  await range(since, today);
  const allowance = searchUnservedAllowance(totalCount);
  if (unserved > allowance) {
    throw new Error(
      `GitHub search reported ${totalCount} issues across ${queries.length} queries and served ${items.length}: ${unserved} unserved is more than the ${allowance} ` +
        `a stale index explains (max(${SEARCH_UNSERVED_FLOOR}, 1% of the reported total)); a partial list is not a count.`,
    );
  }
  return { items, totalCount, unserved, queries };
}

/** `https://api.github.com/repos/owner/name` → `owner/name`. */
function repoFromApiUrl(url: unknown): string {
  const m = typeof url === "string" ? /^https:\/\/api\.github\.com\/repos\/([^/\s]+)\/([^/\s]+)$/.exec(url) : null;
  if (!m) throw new Error(`search item has no usable repository_url: ${String(url)}`);
  return `${m[1]}/${m[2]}`;
}

/** A search item, reduced. Throws on a shape it does not recognise: a changed API is a failed run, not a zero. */
export function toSupplyIssue(item: unknown): SupplyIssue {
  const it = (item ?? {}) as Record<string, unknown>;
  const repo = repoFromApiUrl(it.repository_url);
  if (!Number.isInteger(it.number)) throw new Error(`search item in ${repo} has no issue number`);
  const url = typeof it.html_url === "string" && it.html_url.startsWith("https://github.com/") ? it.html_url : `https://github.com/${repo}/issues/${it.number}`;
  const labels = (Array.isArray(it.labels) ? it.labels : [])
    .map((l) => (typeof l === "string" ? l : typeof (l as { name?: unknown })?.name === "string" ? (l as { name: string }).name : null))
    .filter((l): l is string => l !== null);
  return {
    repo,
    number: it.number as number,
    title: typeof it.title === "string" ? it.title : "",
    url,
    state: typeof it.state === "string" ? it.state : "unknown",
    isPullRequest: it.pull_request !== undefined && it.pull_request !== null,
    labels,
    body: typeof it.body === "string" ? it.body : null,
    createdAt: typeof it.created_at === "string" ? it.created_at : "",
    commentCount: Number.isInteger(it.comments) ? (it.comments as number) : 0,
  };
}

// ── Per-repository and per-issue reads ───────────────────────────────────────

const repoPath = (repo: string): string => repo.split("/").map(encodeURIComponent).join("/");

async function fetchRepoFacts(client: GithubClient, repo: string): Promise<{ archived: boolean }> {
  const body = await client.json<{ archived?: unknown }>(`/repos/${repoPath(repo)}`);
  if (!body || typeof body.archived !== "boolean") throw new Error(`the repository object for ${repo} carries no archived flag`);
  return { archived: body.archived };
}

async function fetchComments(client: GithubClient, issue: SupplyIssue): Promise<SupplyComment[]> {
  const out: SupplyComment[] = [];
  for (let page = 1; page <= MAX_COMMENT_PAGES; page += 1) {
    const batch = await client.json<unknown[]>(`/repos/${repoPath(issue.repo)}/issues/${issue.number}/comments?per_page=${PAGE_SIZE}&page=${page}`);
    if (!Array.isArray(batch)) throw new Error(`comments for ${issue.repo}#${issue.number} were not a list`);
    for (const c of batch as { user?: { login?: unknown }; body?: unknown; created_at?: unknown }[]) {
      out.push({
        author: typeof c.user?.login === "string" ? c.user.login : "",
        body: typeof c.body === "string" ? c.body : "",
        ...(typeof c.created_at === "string" ? { createdAt: c.created_at } : {}),
      });
    }
    if (batch.length < PAGE_SIZE) {
      if (out.length === 0 && issue.commentCount > 0) {
        throw new Error(`${issue.repo}#${issue.number}: search reported ${issue.commentCount} comments and the comments endpoint returned none; refusing to read an empty thread as "no bounty comment".`);
      }
      return out;
    }
  }
  throw new Error(`${issue.repo}#${issue.number}: more than ${MAX_COMMENT_PAGES} pages of comments; refusing to loop.`);
}

type PolicyKey = "contributing" | "codeOfConduct" | "pullRequestTemplate" | "readme";

const POLICY_FILE_PATTERNS: Record<PolicyKey, RegExp> = {
  contributing: /^contributing(?:\.(?:md|markdown|mdx|rst|txt|adoc|asciidoc|org))?$/i,
  codeOfConduct: /^code[_-]of[_-]conduct(?:\.(?:md|markdown|rst|txt|adoc))?$/i,
  pullRequestTemplate: /^pull[_-]request[_-]template(?:\.(?:md|markdown|txt))?$/i,
  readme: /^readme(?:\.(?:md|markdown|mdx|rst|txt|adoc|asciidoc|org))?$/i,
};

/** GitHub's own precedence for community-health files: `.github/`, then the root, then `docs/`. */
const POLICY_DIRS = [".github", "", "docs"] as const;

export interface PolicyFileRef {
  path: string;
  url: string;
}

/** Choose which files `assessRepoPolicy` reads, from directory listings. Pure. */
export function pickPolicyFiles(listings: { dir: string; entries: unknown }[]): Partial<Record<PolicyKey, PolicyFileRef>> {
  const picked: Partial<Record<PolicyKey, PolicyFileRef>> = {};
  for (const dir of POLICY_DIRS) {
    const listing = listings.find((l) => l.dir === dir);
    const entries = Array.isArray(listing?.entries) ? (listing!.entries as { name?: unknown; type?: unknown; path?: unknown; url?: unknown }[]) : [];
    for (const key of Object.keys(POLICY_FILE_PATTERNS) as PolicyKey[]) {
      if (picked[key]) continue;
      const hit = entries.find((e) => e.type === "file" && typeof e.name === "string" && POLICY_FILE_PATTERNS[key].test(e.name) && typeof e.url === "string");
      if (hit) picked[key] = { path: String(hit.path ?? hit.name), url: String(hit.url) };
    }
  }
  return picked;
}

async function fetchPolicyDocs(client: GithubClient, repo: string): Promise<RepoPolicyTexts> {
  const listings: { dir: string; entries: unknown }[] = [];
  for (const dir of POLICY_DIRS) {
    const path = dir === "" ? `/repos/${repoPath(repo)}/contents` : `/repos/${repoPath(repo)}/contents/${dir}`;
    listings.push({ dir, entries: await client.json<unknown>(path, { allow404: true }) });
  }
  const prefix = `${GITHUB_API}/repos/${repo}/contents/`.toLowerCase();
  const docs: RepoPolicyTexts = {};
  for (const [key, ref] of Object.entries(pickPolicyFiles(listings)) as [PolicyKey, PolicyFileRef][]) {
    // Follow only a contents URL for this very repository — never a URL the listing could point anywhere else.
    if (!ref.url.toLowerCase().startsWith(prefix)) throw new Error(`${repo}: listing gave ${key} an unexpected URL ${ref.url}`);
    const text = await client.text(ref.url, { allow404: true });
    if (text !== null && text.trim() !== "") docs[key] = text;
  }
  return docs;
}

// ── Orchestration ────────────────────────────────────────────────────────────

export interface CollectedSupply {
  evaluated: EvaluatedIssue[];
  repos: Record<string, CollectedRepo>;
  query: string;
  queries: string[];
  searchTotalCount: number;
  /** Issues search counted and did not serve on two identical passes, within the allowance (`searchAllIssues`). */
  searchUnserved: number;
}

/** Search, then feed each issue exactly the data its next filter needs, cheapest stage first. */
export async function collectSupply(client: GithubClient, opts: { today: string; log?: (message: string) => void }): Promise<CollectedSupply> {
  const log = opts.log ?? (() => {});
  const search = await searchAllIssues(client, SUPPLY_SEARCH_QUERY, opts.today);
  const issues = search.items.map(toSupplyIssue).sort((a, b) => a.repo.localeCompare(b.repo) || a.number - b.number);
  log(`search: ${issues.length} open issues labelled across ${new Set(issues.map((i) => i.repo)).size} repositories`);
  if (search.unserved) log(`search: GitHub reported ${search.totalCount}; ${search.unserved} counted and not served on two identical passes (recorded)`);

  const repos: Record<string, CollectedRepo> = {};
  const contexts = new Map<SupplyIssue, SupplyContext>();
  const verdicts = new Map<SupplyIssue, IssueVerdict>();
  for (const issue of issues) {
    contexts.set(issue, {});
    verdicts.set(issue, evaluateIssue(issue));
  }

  for (const stage of ["repo", "comments", "policy"] as const) {
    let fetched = 0;
    for (const issue of issues) {
      const v = verdicts.get(issue)!;
      if (v.kind !== "needs" || v.need !== stage) continue;
      const ctx = contexts.get(issue)!;
      const known = (repos[issue.repo] ??= {});
      if (stage === "repo") {
        if (known.archived === undefined) {
          known.archived = (await fetchRepoFacts(client, issue.repo)).archived;
          fetched += 1;
        }
        ctx.repo = { archived: known.archived };
      } else if (stage === "comments") {
        ctx.comments = await fetchComments(client, issue);
        fetched += 1;
      } else {
        if (!known.policyDocs) {
          known.policyDocs = await fetchPolicyDocs(client, issue.repo);
          fetched += 1;
        }
        ctx.policyDocs = known.policyDocs;
      }
      verdicts.set(issue, evaluateIssue(issue, ctx));
    }
    log(`${stage}: ${fetched} fetched`);
  }

  const evaluated = issues.map((issue) => ({ issue, verdict: verdicts.get(issue)! }));
  const undecided = evaluated.find((e) => e.verdict.kind === "needs");
  if (undecided) throw new Error(`${undecided.issue.repo}#${undecided.issue.number} was left undecided; nothing is written.`);
  for (const r of Object.keys(repos)) if (Object.keys(repos[r]!).length === 0) delete repos[r];
  return { evaluated, repos, query: SUPPLY_SEARCH_QUERY, queries: search.queries, searchTotalCount: search.totalCount, searchUnserved: search.unserved };
}

// ── The run ──────────────────────────────────────────────────────────────────

export interface RunAlgoraSupplyOptions {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  outJson?: string;
  outMd?: string;
  maxWaitMs?: number;
  log?: (message: string) => void;
}

export interface RunAlgoraSupplyResult {
  code: number;
  message: string;
  measurement?: SupplyMeasurement;
}

const isReading = (r: unknown): r is SupplyReading =>
  typeof r === "object" && r !== null && typeof (r as SupplyReading).week === "string" && typeof (r as SupplyReading).measuredAt === "string" && Number.isFinite((r as SupplyReading).claimable);

const isFault = (f: unknown): f is InstrumentFault => isReading(f) && typeof (f as InstrumentFault).reason === "string";

/** The weekly series and the struck readings from last week's file. A file that is not JSON stops the run. */
function readPrevious(path: string): { history: SupplyReading[]; instrumentFaults: InstrumentFault[] } {
  if (!existsSync(path)) return { history: [], instrumentFaults: [] };
  let data: { history?: unknown; instrumentFaults?: unknown };
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path} exists but is not JSON (${error instanceof Error ? error.message : String(error)}); refusing to overwrite it and lose the weekly series.`);
  }
  return {
    history: Array.isArray(data.history) ? data.history.filter(isReading) : [],
    instrumentFaults: Array.isArray(data.instrumentFaults) ? data.instrumentFaults.filter(isFault) : [],
  };
}

export interface StrikeSupplyFilesResult {
  code: number;
  message: string;
}

/**
 * Strike the pre-fix readings in the files already on disk, without measuring (RULING-2026-09-28-bounty-rail.md §3.4):
 * `strikePreFixReadings` over the JSON, then `renderSupplyMarkdown` over the result — the same two functions a
 * measuring run uses, so the struck file is what the generator would have written. Writes nothing on a file it cannot
 * read. Never throws. `scripts/algora-supply.ts --strike-pre-fix` is the command.
 */
export function strikeSupplyFiles(opts: { outJson?: string; outMd?: string } = {}): StrikeSupplyFilesResult {
  const outJson = opts.outJson ?? DEFAULT_SUPPLY_JSON;
  const outMd = opts.outMd ?? DEFAULT_SUPPLY_MD;
  try {
    if (!existsSync(outJson)) return { code: 1, message: `${outJson} does not exist; there is no reading to strike. Nothing was written.` };
    const m = JSON.parse(readFileSync(outJson, "utf8")) as SupplyMeasurement;
    if (!Array.isArray(m.history)) throw new Error(`${outJson} carries no weekly series`);
    const before = (m.instrumentFaults ?? []).length;
    const struck = strikePreFixReadings(m);
    const added = struck.instrumentFaults.length - before;
    mkdirSync(dirname(outJson), { recursive: true });
    mkdirSync(dirname(outMd), { recursive: true });
    writeFileSync(outJson, `${JSON.stringify(struck, null, 2)}\n`);
    writeFileSync(outMd, renderSupplyMarkdown(struck));
    return {
      code: 0,
      message:
        `Algora supply: struck ${added} ${added === 1 ? "reading" : "readings"} as instrument faults (${struck.instrumentFaults.length} recorded in all); ` +
        `${struck.history.length} left in the series. ${struck.boardReading.text} Written to ${outJson} and ${outMd}.`,
    };
  } catch (error) {
    return { code: 1, message: `Algora supply NOT struck: ${error instanceof Error ? error.message : String(error)}. Nothing was written.` };
  }
}

/**
 * Measure, then write both files — or write nothing and return a non-zero code with the reason.
 * Never throws: the CLI turns the code into its exit status.
 */
export async function runAlgoraSupply(opts: RunAlgoraSupplyOptions = {}): Promise<RunAlgoraSupplyResult> {
  const outJson = opts.outJson ?? DEFAULT_SUPPLY_JSON;
  const outMd = opts.outMd ?? DEFAULT_SUPPLY_MD;
  const now = opts.now ?? Date.now;
  const token = (opts.env?.GITHUB_TOKEN ?? "").trim() || null;
  const client = createGithubClient({ token, fetchImpl: opts.fetchImpl, sleep: opts.sleep, now, maxWaitMs: opts.maxWaitMs, log: opts.log });
  try {
    const previous = readPrevious(outJson);
    const today = new Date(now()).toISOString().slice(0, 10);
    const collected = await collectSupply(client, { today, log: opts.log });
    const stats = client.stats();
    const measurement = buildSupplyMeasurement({
      measuredAt: new Date(now()).toISOString(),
      evaluated: collected.evaluated,
      repos: collected.repos,
      previousHistory: previous.history,
      previousInstrumentFaults: previous.instrumentFaults,
      method: {
        query: collected.query,
        searchTotalCount: collected.searchTotalCount,
        searchUnserved: collected.searchUnserved,
        authenticated: client.authenticated,
        requests: { search: stats.search, core: stats.core },
        rateLimitWaitSeconds: Math.round(stats.waitedMs / 1000),
        notes: collected.queries.length > 1 ? [`The search was split by creation date into ${collected.queries.length} queries to stay under GitHub's 1,000-result cap.`] : [],
      },
    });
    const markdown = renderSupplyMarkdown(measurement);
    const caveat = unservedCaveat(measurement.method.searchUnserved ?? 0);
    mkdirSync(dirname(outJson), { recursive: true });
    mkdirSync(dirname(outMd), { recursive: true });
    writeFileSync(outJson, `${JSON.stringify(measurement, null, 2)}\n`);
    writeFileSync(outMd, markdown);
    return {
      code: 0,
      measurement,
      message:
        `Algora supply: ${measurement.claimableBounties} claimable bounties ($${measurement.claimableUsd}) of ${measurement.labelledOpenIssues} labelled open issues ` +
        `in ${measurement.repositories} repositories.${caveat ? ` ${caveat}` : ""} ${measurement.boardReading.text} Written to ${outJson} and ${outMd}.`,
    };
  } catch (error) {
    const stats = client.stats();
    return {
      code: 1,
      message:
        `Algora supply NOT measured: ${error instanceof Error ? error.message : String(error)} ` +
        `(${stats.search} search and ${stats.core} REST requests made). Nothing was written — an unmeasured week is a missing reading, never a zero.`,
    };
  }
}
