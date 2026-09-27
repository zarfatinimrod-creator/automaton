import { describe, it, expect, afterEach } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  GITHUB_API,
  GithubApiError,
  RateLimitBudgetError,
  collectSupply,
  createGithubClient,
  pickPolicyFiles,
  rateLimitWaitMs,
  runAlgoraSupply,
  searchAllIssues,
  splitDateRange,
  toSupplyIssue,
} from "../../revenue/bounties/supply-github.js";
import { BOUNTY_LABEL, REWARDED_LABEL, SUPPLY_SEARCH_QUERY } from "../../revenue/bounties/supply.js";
import { ALGORA_BOT_LOGIN } from "../../revenue/bounties/intake.js";

/**
 * The fetch half of the weekly supply count, against a fake GitHub. No test here touches the network: every
 * `fetchImpl` is the router below, and it throws on any host but api.github.com — which is also the point of
 * the one rule this module may never break (BOARD-2 §2.1.3(b)).
 */

// ── A fake GitHub ────────────────────────────────────────────────────────────

interface FakeIssue {
  repo: string;
  number: number;
  created: string; // YYYY-MM-DD
  labels?: string[];
  body?: string | null;
  comments?: { login: string; type?: string; body: string }[];
  pr?: boolean;
}

interface FakeWorld {
  issues: FakeIssue[];
  archived?: Record<string, boolean>;
  /** repo -> dir ("" | ".github" | "docs") -> file name -> content */
  files?: Record<string, Record<string, Record<string, string>>>;
  /** Respond to the Nth request (1-based) with this instead. */
  override?: (n: number, url: URL) => Response | undefined;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

function fakeGithub(world: FakeWorld) {
  const calls: string[] = [];
  const seenHeaders: Record<string, string>[] = [];
  const toItem = (i: FakeIssue) => ({
    id: Number(`${i.repo.length}${i.number}`) * 1000 + i.number,
    number: i.number,
    title: `Issue ${i.number} in ${i.repo}`,
    html_url: `https://github.com/${i.repo}/issues/${i.number}`,
    repository_url: `${GITHUB_API}/repos/${i.repo}`,
    state: "open",
    labels: (i.labels ?? [BOUNTY_LABEL]).map((name) => ({ name })),
    body: i.body === undefined ? "Expected: works." : i.body,
    created_at: `${i.created}T00:00:00Z`,
    comments: (i.comments ?? []).length,
    ...(i.pr ? { pull_request: { url: "x" } } : {}),
  });

  const fetchImpl = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input));
    calls.push(`${url.pathname}${url.search}`);
    seenHeaders.push(Object.fromEntries(new Headers(init?.headers).entries()));
    if (url.origin !== GITHUB_API) throw new Error(`fake GitHub: unexpected host ${url.origin}`);
    const overridden = world.override?.(calls.length, url);
    if (overridden) return overridden;
    const p = url.pathname;

    if (p === "/search/issues") {
      const q = url.searchParams.get("q") ?? "";
      expect(url.searchParams.get("sort")).toBe("created");
      expect(url.searchParams.get("order")).toBe("asc");
      const range = /created:(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})/.exec(q);
      let all = world.issues.filter((i) => !range || (i.created >= range[1]! && i.created <= range[2]!));
      all = [...all].sort((a, b) => a.created.localeCompare(b.created) || a.number - b.number);
      const perPage = Number(url.searchParams.get("per_page"));
      const page = Number(url.searchParams.get("page"));
      const slice = all.slice((page - 1) * perPage, Math.min(page * perPage, 1000));
      return json({ total_count: all.length, incomplete_results: false, items: slice.map(toItem) });
    }

    let m = /^\/repos\/([^/]+)\/([^/]+)$/.exec(p);
    if (m) {
      const repo = `${m[1]}/${m[2]}`;
      return json({ full_name: repo, archived: world.archived?.[repo] ?? false });
    }

    m = /^\/repos\/([^/]+)\/([^/]+)\/issues\/(\d+)\/comments$/.exec(p);
    if (m) {
      const issue = world.issues.find((i) => i.repo === `${m![1]}/${m![2]}` && i.number === Number(m![3]))!;
      const perPage = Number(url.searchParams.get("per_page"));
      const page = Number(url.searchParams.get("page"));
      const list = (issue.comments ?? []).map((c, k) => ({ user: { login: c.login, type: c.type ?? "User" }, body: c.body, created_at: `2026-06-0${(k % 9) + 1}T00:00:00Z` }));
      return json(list.slice((page - 1) * perPage, page * perPage));
    }

    m = /^\/repos\/([^/]+)\/([^/]+)\/contents\/?(.*)$/.exec(p);
    if (m) {
      const repo = `${m[1]}/${m[2]}`;
      const rest = decodeURIComponent(m[3] ?? "");
      const dirs = world.files?.[repo] ?? {};
      if (rest in dirs || rest === "") {
        const dir = dirs[rest] ?? {};
        return json(
          Object.keys(dir).map((name) => ({
            name,
            path: rest ? `${rest}/${name}` : name,
            type: "file",
            url: `${GITHUB_API}/repos/${repo}/contents/${rest ? `${rest}/` : ""}${name}?ref=main`,
          })),
        );
      }
      const slash = rest.lastIndexOf("/");
      const dir = slash === -1 ? "" : rest.slice(0, slash);
      const name = slash === -1 ? rest : rest.slice(slash + 1);
      const content = dirs[dir]?.[name];
      if (content !== undefined) return new Response(content, { status: 200 });
      return json({ message: "Not Found" }, 404);
    }
    return json({ message: `fake GitHub has no route for ${p}` }, 500);
  };
  return { fetchImpl, calls, seenHeaders };
}

/** A clock that only moves when the code under test sleeps. */
function fakeClock(start = Date.parse("2026-09-28T06:23:00.000Z")) {
  let t = start;
  const slept: number[] = [];
  return {
    now: () => t,
    sleep: async (ms: number) => {
      slept.push(ms);
      t += ms;
    },
    slept,
  };
}

const bountyBody = (amount: number, n: number) =>
  `## 💎 $${amount} bounty [• Acme](https://example.invalid/acme)\n### Steps to solve:\n1. **Start working**: Comment \`/attempt #${n}\` with your implementation plan\n2. **Submit work**: Create a pull request including \`/claim #${n}\` in the PR body to claim the bounty`;
const bot = (body: string) => ({ login: ALGORA_BOT_LOGIN, type: "Bot", body });

function world(): FakeWorld {
  return {
    issues: [
      { repo: "acme/widget", number: 1, created: "2026-03-01", comments: [bot(bountyBody(250, 1)), { login: "dev", body: "/attempt #1" }] },
      { repo: "acme/widget", number: 2, created: "2026-03-02", labels: [BOUNTY_LABEL, REWARDED_LABEL], comments: [bot(bountyBody(100, 2))] },
      { repo: "acme/widget", number: 3, created: "2026-03-03", comments: [bot(bountyBody(80, 3)), bot("🎉🎈 @dev has been awarded **$80** by **Acme**! 🎈🎊")] },
      { repo: "old/archive", number: 7, created: "2026-03-04", comments: [bot(bountyBody(900, 7))] },
      { repo: "strict/repo", number: 9, created: "2026-03-05", comments: [bot(bountyBody(500, 9))] },
      { repo: "cheap/tickets", number: 4, created: "2026-03-06", comments: [bot(bountyBody(20, 4))] },
    ],
    archived: { "old/archive": true },
    files: {
      "acme/widget": { "": { "README.md": "# Widget" }, ".github": { "CONTRIBUTING.md": "Please add tests." } },
      "strict/repo": { "": { "CONTRIBUTING.md": "We do not accept AI-generated contributions." } },
    },
  };
}

// ── Rate limits ──────────────────────────────────────────────────────────────

describe("rateLimitWaitMs — GitHub's documented signals, nothing else", () => {
  const res = (status: number, headers: Record<string, string> = {}) => ({ status, headers: new Headers(headers) });
  const NOW = Date.parse("2026-09-28T06:00:00.000Z");

  it("waits until the primary limit resets, plus a second", () => {
    const reset = String(NOW / 1000 + 120);
    expect(rateLimitWaitMs(res(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": reset }), "", NOW)).toBe(121_000);
    expect(rateLimitWaitMs(res(429, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": reset }), "", NOW)).toBe(121_000);
  });

  it("honours retry-after on a secondary limit", () => {
    expect(rateLimitWaitMs(res(403, { "retry-after": "30" }), "", NOW)).toBe(30_000);
  });

  it("waits a minute on a secondary limit that names itself but gives no header", () => {
    expect(rateLimitWaitMs(res(403), "You have exceeded a secondary rate limit.", NOW)).toBe(60_000);
  });

  it("does not mistake a permission error or a success for a rate limit", () => {
    expect(rateLimitWaitMs(res(403, { "x-ratelimit-remaining": "57" }), "Resource not accessible by integration", NOW)).toBeNull();
    expect(rateLimitWaitMs(res(200), "", NOW)).toBeNull();
    expect(rateLimitWaitMs(res(404), "rate limit", NOW)).toBeNull();
  });
});

describe("createGithubClient", () => {
  it("sends the token only when there is one, and never to a host that is not api.github.com", async () => {
    const gh = fakeGithub(world());
    const clock = fakeClock();
    const withToken = createGithubClient({ token: "t0ken", fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    await withToken.json("/repos/acme/widget");
    expect(gh.seenHeaders[0]!.authorization).toBe("Bearer t0ken");
    expect(gh.seenHeaders[0]!["user-agent"]).toBeTruthy();
    const anon = createGithubClient({ fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    await anon.json("/repos/acme/widget");
    expect(gh.seenHeaders[1]!.authorization).toBeUndefined();
    expect(anon.authenticated).toBe(false);
    await expect(anon.json("https://example.invalid/anything")).rejects.toThrow(/only api\.github\.com/);
  });

  it("waits out a rate limit and retries, counting the wait", async () => {
    const clock = fakeClock();
    const reset = String(Math.floor(clock.now() / 1000) + 59);
    const gh = fakeGithub({
      ...world(),
      override: (n) => (n === 1 ? json({ message: "API rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": reset }) : undefined),
    });
    const client = createGithubClient({ fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    const repo = await client.json<{ archived: boolean }>("/repos/acme/widget");
    expect(repo!.archived).toBe(false);
    expect(client.stats().waitedMs).toBe(60_000);
    expect(client.stats().core).toBe(2);
  });

  it("gives up — rather than hang — when the wait would exceed its budget", async () => {
    const clock = fakeClock();
    const reset = String(Math.floor(clock.now() / 1000) + 3600);
    const gh = fakeGithub({ ...world(), override: () => json({ message: "API rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": reset }) });
    const client = createGithubClient({ fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep, maxWaitMs: 10 * 60_000 });
    await expect(client.json("/repos/acme/widget")).rejects.toBeInstanceOf(RateLimitBudgetError);
  });

  it("throws on an ordinary API error instead of returning something that looks like data", async () => {
    const gh = fakeGithub({ ...world(), override: () => json({ message: "Bad credentials" }, 401) });
    const clock = fakeClock();
    const client = createGithubClient({ fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    await expect(client.json("/repos/acme/widget")).rejects.toBeInstanceOf(GithubApiError);
    expect(await createGithubClient({ fetchImpl: fakeGithub(world()).fetchImpl, now: clock.now, sleep: clock.sleep }).json("/repos/acme/widget/contents/NOPE.md", { allow404: true })).toBeNull();
  });

  it("paces search calls to GitHub's per-minute search limit", async () => {
    const gh = fakeGithub(world());
    const clock = fakeClock();
    const anon = createGithubClient({ fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    await anon.json(`/search/issues?q=x&sort=created&order=asc&per_page=100&page=1`, { search: true });
    await anon.json(`/search/issues?q=x&sort=created&order=asc&per_page=100&page=2`, { search: true });
    expect(clock.slept[0]).toBeGreaterThanOrEqual(6_000); // unauthenticated: 10 a minute
    expect(anon.stats().search).toBe(2);
  });
});

// ── Search ───────────────────────────────────────────────────────────────────

describe("searchAllIssues", () => {
  it("splits a creation-date range in two, day-aligned and disjoint", () => {
    expect(splitDateRange("2026-01-01", "2026-01-10")).toEqual([
      ["2026-01-01", "2026-01-05"],
      ["2026-01-06", "2026-01-10"],
    ]);
    expect(splitDateRange("2026-01-01", "2026-01-02")).toEqual([
      ["2026-01-01", "2026-01-01"],
      ["2026-01-02", "2026-01-02"],
    ]);
    expect(splitDateRange("2026-01-01", "2026-01-01")).toBeNull();
  });

  it("pages deterministically, oldest first, 100 at a time", async () => {
    const issues: FakeIssue[] = Array.from({ length: 250 }, (_, k) => ({ repo: "big/repo", number: k + 1, created: "2026-04-01" }));
    const gh = fakeGithub({ issues });
    const clock = fakeClock();
    const client = createGithubClient({ token: "t", fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    const r = await searchAllIssues(client, SUPPLY_SEARCH_QUERY, "2026-09-28");
    expect(r.totalCount).toBe(250);
    expect(r.items.map((i) => i.number)).toEqual(issues.map((i) => i.number));
    expect(gh.calls.filter((c) => c.startsWith("/search/issues"))).toHaveLength(3);
  });

  it("splits by creation date when a query passes GitHub's 1,000-result cap", async () => {
    const issues: FakeIssue[] = Array.from({ length: 1200 }, (_, k) => ({
      repo: "big/repo",
      number: k + 1,
      created: k < 700 ? "2026-02-01" : "2026-08-01",
    }));
    const gh = fakeGithub({ issues });
    const clock = fakeClock();
    const client = createGithubClient({ token: "t", fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    const r = await searchAllIssues(client, SUPPLY_SEARCH_QUERY, "2026-09-28");
    expect(r.totalCount).toBe(1200);
    expect(new Set(r.items.map((i) => i.number)).size).toBe(1200);
    expect(r.queries.length).toBeGreaterThan(1);
  });

  it("fails rather than return part of the list", async () => {
    const issues: FakeIssue[] = Array.from({ length: 120 }, (_, k) => ({ repo: "big/repo", number: k + 1, created: "2026-04-01" }));
    const gh = fakeGithub({
      issues,
      override: (_n, url) =>
        url.pathname === "/search/issues" && url.searchParams.get("page") === "2" ? json({ total_count: 120, incomplete_results: true, items: [] }) : undefined,
    });
    const clock = fakeClock();
    const client = createGithubClient({ token: "t", fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    await expect(searchAllIssues(client, SUPPLY_SEARCH_QUERY, "2026-09-28")).rejects.toThrow(/incomplete/);
  });
});

describe("toSupplyIssue", () => {
  it("reduces a search item to what the filters read", () => {
    const i = toSupplyIssue({
      number: 5,
      title: "t",
      html_url: "https://github.com/a/b/issues/5",
      repository_url: `${GITHUB_API}/repos/a/b`,
      state: "open",
      labels: [{ name: BOUNTY_LABEL }, "plain"],
      body: null,
      created_at: "2026-03-01T00:00:00Z",
      comments: 2,
    });
    expect(i).toEqual({
      repo: "a/b",
      number: 5,
      title: "t",
      url: "https://github.com/a/b/issues/5",
      state: "open",
      isPullRequest: false,
      labels: [BOUNTY_LABEL, "plain"],
      body: null,
      createdAt: "2026-03-01T00:00:00Z",
      commentCount: 2,
    });
  });

  it("refuses a shape it does not recognise — a changed API is a failed run, not a zero", () => {
    expect(() => toSupplyIssue({ number: 5 })).toThrow(/repository_url/);
  });
});

describe("pickPolicyFiles", () => {
  const f = (name: string, dir = "") => ({ name, type: "file", path: dir ? `${dir}/${name}` : name, url: `${GITHUB_API}/repos/a/b/contents/${dir ? `${dir}/` : ""}${name}` });

  it("finds each document in GitHub's own precedence: .github, then the root, then docs", () => {
    const picked = pickPolicyFiles([
      { dir: "", entries: [f("CONTRIBUTING.md"), f("README.md"), f("code_of_conduct.md")] },
      { dir: ".github", entries: [f("CONTRIBUTING.md", ".github"), f("PULL_REQUEST_TEMPLATE.md", ".github")] },
      { dir: "docs", entries: [f("contributing.rst", "docs")] },
    ]);
    expect(picked.contributing!.path).toBe(".github/CONTRIBUTING.md");
    expect(picked.readme!.path).toBe("README.md");
    expect(picked.codeOfConduct!.path).toBe("code_of_conduct.md");
    expect(picked.pullRequestTemplate!.path).toBe(".github/PULL_REQUEST_TEMPLATE.md");
  });

  it("ignores directories, lookalikes and a missing listing", () => {
    const picked = pickPolicyFiles([
      { dir: "", entries: [{ name: "CONTRIBUTING.md", type: "dir", path: "CONTRIBUTING.md", url: "x" }, f("CONTRIBUTING-old.md")] },
      { dir: ".github", entries: null },
    ]);
    expect(picked).toEqual({});
  });
});

// ── End to end on the fake ───────────────────────────────────────────────────

describe("collectSupply — fetches only what the cheaper filters let through", () => {
  it("evaluates every labelled issue and touches no comment or policy file it did not need", async () => {
    const gh = fakeGithub(world());
    const clock = fakeClock();
    const client = createGithubClient({ token: "t", fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    const c = await collectSupply(client, { today: "2026-09-28" });

    const byRef = Object.fromEntries(c.evaluated.map((e) => [`${e.issue.repo}#${e.issue.number}`, e.verdict]));
    expect(byRef["acme/widget#1"]).toMatchObject({ kind: "claimable", amountUsd: 250 });
    expect(byRef["acme/widget#2"]).toMatchObject({ kind: "dropped", filter: "rewarded-label" });
    expect(byRef["acme/widget#3"]).toMatchObject({ kind: "dropped", filter: "payout-comment" });
    expect(byRef["old/archive#7"]).toMatchObject({ kind: "dropped", filter: "archived-repo" });
    expect(byRef["strict/repo#9"]).toMatchObject({ kind: "dropped", filter: "policy-forbidden" });
    expect(byRef["cheap/tickets#4"]).toMatchObject({ kind: "dropped", filter: "amount-under-minimum" });

    // The rewarded issue's comments were never read; nor were the archived repo's.
    expect(gh.calls.some((u) => u.includes("/issues/2/comments"))).toBe(false);
    expect(gh.calls.some((u) => u.startsWith("/repos/old/archive/issues"))).toBe(false);
    // Policy files were read only where a bounty reached the policy filter.
    expect(gh.calls.some((u) => u.startsWith("/repos/cheap/tickets/contents"))).toBe(false);
    expect(gh.calls.some((u) => u.startsWith("/repos/old/archive/contents"))).toBe(false);
    expect(gh.calls.filter((u) => u.startsWith("/repos/acme/widget/contents")).length).toBeGreaterThan(0);
    // Each repository object and each policy set is fetched once, however many issues share it.
    expect(gh.calls.filter((u) => u === "/repos/acme/widget")).toHaveLength(1);
    expect(c.repos["acme/widget"]!.policyDocs).toEqual({ contributing: "Please add tests.", readme: "# Widget" });
    expect(c.searchTotalCount).toBe(6);
  });

  it("fails when an issue's comments come back empty against the count the search reported", async () => {
    const w = world();
    const gh = fakeGithub({ ...w, override: (_n, url) => (url.pathname === "/repos/acme/widget/issues/1/comments" ? json([]) : undefined) });
    const clock = fakeClock();
    const client = createGithubClient({ token: "t", fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    await expect(collectSupply(client, { today: "2026-09-28" })).rejects.toThrow(/comments/);
  });
});

describe("runAlgoraSupply — writes both files, or nothing", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });
  const paths = () => {
    const d = mkdtempSync(join(tmpdir(), "algora-supply-"));
    dirs.push(d);
    return { outJson: join(d, "state", "algora-supply.json"), outMd: join(d, "research", "algora-supply.md") };
  };

  it("writes the JSON the tick ingests and the Markdown a human reads", async () => {
    const p = paths();
    const clock = fakeClock();
    const r = await runAlgoraSupply({ ...p, env: { GITHUB_TOKEN: "t" }, fetchImpl: fakeGithub(world()).fetchImpl, now: clock.now, sleep: clock.sleep });
    expect(r.code).toBe(0);
    const m = JSON.parse(readFileSync(p.outJson, "utf8"));
    expect(m.claimableBounties).toBe(1);
    expect(m.measuredAt).toMatch(/^2026-09-28T/);
    expect(m.method.authenticated).toBe(true);
    expect(m.history).toHaveLength(1);
    const md = readFileSync(p.outMd, "utf8");
    expect(md).toMatch(/\*\*1 claimable bounty\*\*/);
    expect(r.message).toMatch(/1 claimable/);
  });

  it("writes nothing and fails on an API error — an unmeasured week is never a zero", async () => {
    const p = paths();
    const clock = fakeClock();
    const gh = fakeGithub({ ...world(), override: (_n, url) => (url.pathname.startsWith("/repos/strict") ? json({ message: "boom" }, 502) : undefined) });
    const r = await runAlgoraSupply({ ...p, env: {}, fetchImpl: gh.fetchImpl, now: clock.now, sleep: clock.sleep });
    expect(r.code).not.toBe(0);
    expect(r.message).toMatch(/NOT measured/);
    expect(r.message).toMatch(/nothing was written/i);
    expect(existsSync(p.outJson)).toBe(false);
    expect(existsSync(p.outMd)).toBe(false);
  });

  it("carries last week's reading forward into the series", async () => {
    const p = paths();
    const clock = fakeClock();
    const first = await runAlgoraSupply({ ...p, env: { GITHUB_TOKEN: "t" }, fetchImpl: fakeGithub(world()).fetchImpl, now: clock.now, sleep: clock.sleep });
    expect(first.code).toBe(0);
    await clock.sleep(7 * 86_400_000);
    const second = await runAlgoraSupply({ ...p, env: { GITHUB_TOKEN: "t" }, fetchImpl: fakeGithub(world()).fetchImpl, now: clock.now, sleep: clock.sleep });
    expect(second.code).toBe(0);
    const m = JSON.parse(readFileSync(p.outJson, "utf8"));
    expect(m.history.map((h: { week: string }) => h.week)).toEqual(["2026-W40", "2026-W41"]);
  });

  it("refuses to overwrite a measurement file it cannot read, rather than lose the series", async () => {
    const p = paths();
    const clock = fakeClock();
    await runAlgoraSupply({ ...p, env: { GITHUB_TOKEN: "t" }, fetchImpl: fakeGithub(world()).fetchImpl, now: clock.now, sleep: clock.sleep });
    writeFileSync(p.outJson, "{broken");
    const r = await runAlgoraSupply({ ...p, env: { GITHUB_TOKEN: "t" }, fetchImpl: fakeGithub(world()).fetchImpl, now: clock.now, sleep: clock.sleep });
    expect(r.code).not.toBe(0);
    expect(readFileSync(p.outJson, "utf8")).toBe("{broken");
  });
});

describe(".github/workflows/algora-supply.yml", () => {
  const wf = readFileSync(join(__dirname, "..", "..", "..", ".github", "workflows", "algora-supply.yml"), "utf8");

  it("runs weekly and on demand, on main, as the count-runs job does", () => {
    expect(wf).toMatch(/schedule:\s*\n\s*#[^\n]*\n\s*- cron: "\d+ \d+ \* \* 1"/);
    expect(wf).toMatch(/workflow_dispatch:/);
    expect(wf).toMatch(/ref: main/);
    expect(wf).toMatch(/fetch-depth: 0/);
  });

  it("runs on push only from main, and only when the counter itself changes — never on its own commit", () => {
    const push = /\n  push:\n([\s\S]*?)\n\n/.exec(wf)?.[1] ?? "";
    expect(push).toMatch(/branches: \[main\]/);
    const paths = [...push.matchAll(/- "([^"]+)"/g)].map((m) => m[1]!);
    expect(paths.length).toBeGreaterThan(0);
    for (const committed of ["state/colony/measurements/algora-supply.json", "research/measurements/algora-supply.md"]) {
      expect(paths.some((p) => committed.startsWith(p.replace(/\*.*$/, "")))).toBe(false);
    }
  });

  it("needs no owner secret — only the job's own GITHUB_TOKEN", () => {
    const secrets = [...wf.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((m) => m[1]);
    expect(secrets).toEqual(["GITHUB_TOKEN"]);
  });

  it("runs the counter, then commits both files with [skip ci] and rebases on a lost race", () => {
    expect(wf).toMatch(/pnpm exec tsx scripts\/algora-supply\.ts/);
    expect(wf).toContain("state/colony/measurements/algora-supply.json");
    expect(wf).toContain("research/measurements/algora-supply.md");
    expect(wf).toMatch(/\[skip ci\]/);
    expect(wf).toMatch(/for attempt in 1 2 3[\s\S]*git pull --rebase/);
  });

  it("shows the reading only after a successful count, so last week's file is never passed off as this run's", () => {
    expect(wf).toMatch(/id: count/);
    expect(wf).toMatch(/if: steps\.count\.outcome == 'success'/);
  });
});
