import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.test.ts)
import * as rw from "../../../scripts/render-watch.mjs";

/**
 * render-watch and robots.txt (research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v), fold step 12).
 *
 * The ruling: render-watch sends an identifying User-Agent naming the brand and a brand URL, never the owner's
 * username or the repository URL; it reads /robots.txt once per host per run, honours the group for its own
 * product token or else `*`, records the result in each page's meta, and refuses a URL robots.txt disallows.
 * RFC 9309 is the reading of robots.txt: longest match, Allow on a tie, `*` and `$`, 4xx = no rules,
 * 5xx or unreachable = complete disallow. A host render-watch refuses on terms gets no request of any kind,
 * robots.txt included.
 *
 * No test here touches the network: fetch is a stub that records every URL it is asked for.
 */

const {
  browserContextOptions,
  fetchOne,
  main,
  parseRobotsTxt,
  parseUrlList,
  renderWithBrowser,
  robotsChecker,
  robotsDecision,
  robotsRulesFor,
  robotsTxtUrl,
  ROBOTS_MAX_REDIRECTS,
  ROBOTS_PRODUCT_TOKEN,
  USER_AGENT,
} = rw;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// ---------------------------------------------------------------------------
// A recording fetch stub
// ---------------------------------------------------------------------------

type Answer = { status: number; body?: string; location?: string; contentType?: string } | Error;

function stubHosts(answers: Record<string, Answer>) {
  const calls: Array<{ url: string; headers: Record<string, string> }> = [];
  const fetchImpl = async (url: string, init: { headers?: Record<string, string> } = {}) => {
    calls.push({ url: String(url), headers: { ...(init.headers ?? {}) } });
    const answer = answers[String(url)];
    if (answer === undefined) throw new TypeError(`fetch failed (the stub has no ${url})`);
    if (answer instanceof Error) throw answer;
    const headers: Record<string, string> = { "content-type": answer.contentType ?? "text/plain" };
    if (answer.location) headers.location = answer.location;
    const nullBody = answer.status === 204 || answer.status === 304 || (answer.status >= 300 && answer.status < 400);
    return new Response(nullBody ? null : (answer.body ?? ""), { status: answer.status, headers });
  };
  return { calls, urls: () => calls.map((c) => c.url), fetchImpl };
}

// ---------------------------------------------------------------------------
// The identifying User-Agent
// ---------------------------------------------------------------------------

/** The repository's own URL, its owner/name path and its owner, read from git at test time, never written down. */
function repositoryIdentifiers(): string[] {
  const got = spawnSync("git", ["config", "--get", "remote.origin.url"], { cwd: ROOT, encoding: "utf8" });
  const raw = got.status === 0 ? got.stdout.trim() : "";
  if (!raw) return [];
  const url = raw.replace(/^([a-z]+:\/\/)[^@/]*@/i, "$1").replace(/\.git$/, "");
  const path = url.replace(/^[a-z]+:\/\/[^/]+\//i, "").replace(/^[^@]+@[^:]+:/, "");
  const owner = path.split("/")[0] ?? "";
  return [url, path, owner].filter((s) => s.length >= 3);
}

describe("the identifying User-Agent (ruling 30.9 16(d) D2(v))", () => {
  it("is exactly the brand's product token, a version and the brand URL", () => {
    expect(USER_AGENT).toBe("MehudakRenderWatch/1.0 (+https://il-biz-tools.netlify.app)");
    expect(ROBOTS_PRODUCT_TOKEN).toBe("MehudakRenderWatch");
    expect(USER_AGENT.startsWith(`${ROBOTS_PRODUCT_TOKEN}/`)).toBe(true);
    // RFC 9309 §2.2.1: a product token is letters, underscores and hyphens only.
    expect(ROBOTS_PRODUCT_TOKEN).toMatch(/^[A-Za-z_-]+$/);
  });

  it("names no username, no repository URL and no github.com, and copies no browser", () => {
    expect(USER_AGENT).not.toMatch(/github/i);
    expect(USER_AGENT).not.toMatch(/Mozilla|Chrome|Safari|AppleWebKit|Gecko/);
    const ids = repositoryIdentifiers();
    for (const id of ids) expect(USER_AGENT.toLowerCase(), "a repository identifier").not.toContain(id.toLowerCase());
    // The only URL in it is the brand's.
    expect(USER_AGENT.match(/https?:\/\/[^\s)]+/g)).toEqual(["https://il-biz-tools.netlify.app"]);
  });

  it("is what a plain GET, a robots.txt fetch and the browser all send", async () => {
    const hosts = stubHosts({
      "https://ua.example/robots.txt": { status: 200, body: "User-agent: *\nAllow: /\n" },
      "https://ua.example/page": { status: 200, body: "<p>x</p>", contentType: "text/html" },
    });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    await fetchOne({ url: "https://ua.example/page", slug: "ua" }, { fetchImpl: hosts.fetchImpl, robots });
    expect(hosts.urls()).toEqual(["https://ua.example/robots.txt", "https://ua.example/page"]);
    for (const call of hosts.calls) expect(call.headers["user-agent"]).toBe(USER_AGENT);
    expect(browserContextOptions().userAgent).toBe(USER_AGENT);
    // The copied Chrome string is gone from the source, not just from the constant.
    expect(readFileSync(join(ROOT, "scripts", "render-watch.mjs"), "utf8")).not.toMatch(/Chrome\/\d+/);
  });
});

// ---------------------------------------------------------------------------
// Parsing and matching (RFC 9309)
// ---------------------------------------------------------------------------

const allowed = (text: string, url: string, token = ROBOTS_PRODUCT_TOKEN) =>
  robotsDecision(robotsRulesFor(parseRobotsTxt(text), token), url).allowed;

describe("parseRobotsTxt and robotsRulesFor — which group applies", () => {
  it("uses the group naming the product token, case-insensitively, instead of the * group", () => {
    const text = "User-agent: *\nDisallow: /\n\nUser-agent: mehudakrenderwatch\nDisallow: /private\n";
    expect(allowed(text, "https://s.example/public")).toBe(true);
    expect(allowed(text, "https://s.example/private/x")).toBe(false);
    // Another crawler gets the * group.
    expect(allowed(text, "https://s.example/public", "OtherBot")).toBe(false);
  });

  it("reads the token up to its first non-token character, and does not match a prefix of it", () => {
    expect(allowed("User-agent: MehudakRenderWatch/1.0\nDisallow: /\n", "https://s.example/a")).toBe(false);
    expect(allowed("User-agent: Mehudak\nDisallow: /\n", "https://s.example/a")).toBe(true);
    expect(allowed("User-agent: MehudakRenderWatchPlus\nDisallow: /\n", "https://s.example/a")).toBe(true);
  });

  it("falls back to the * group, and to no rules at all when there is neither", () => {
    expect(allowed("User-agent: *\nDisallow: /x\n", "https://s.example/x/1")).toBe(false);
    expect(allowed("User-agent: OtherBot\nDisallow: /\n", "https://s.example/x/1")).toBe(true);
    expect(allowed("", "https://s.example/x/1")).toBe(true);
    expect(allowed("<html><body>Not found</body></html>", "https://s.example/x/1")).toBe(true);
  });

  it("combines every group that names the token, and every * group", () => {
    const mine = "User-agent: MehudakRenderWatch\nDisallow: /a\n\nUser-agent: other\nDisallow: /\n\nUser-agent: MehudakRenderWatch\nDisallow: /b\n";
    expect(allowed(mine, "https://s.example/a")).toBe(false);
    expect(allowed(mine, "https://s.example/b")).toBe(false);
    expect(allowed(mine, "https://s.example/c")).toBe(true);
    const star = "User-agent: *\nDisallow: /a\n\nUser-agent: *\nDisallow: /b\n";
    expect(allowed(star, "https://s.example/b")).toBe(false);
  });

  it("lets consecutive user-agent lines share one group, and starts a new group after a rule", () => {
    const text = "User-agent: OtherBot\nUser-agent: MehudakRenderWatch\nDisallow: /shared\nUser-agent: ThirdBot\nDisallow: /third\n";
    expect(allowed(text, "https://s.example/shared")).toBe(false);
    expect(allowed(text, "https://s.example/third")).toBe(true);
  });

  it("ignores comments, blank lines, other records, key case, a byte-order mark, CRLF and rules before any group", () => {
    const text =
      "﻿Disallow: /orphan\r\n# a comment\r\nSitemap: https://s.example/sitemap.xml\r\n" +
      "USER-AGENT : * # everyone\r\n\r\nCrawl-delay: 10\r\nDISALLOW:/tmp # no space after the colon\r\n";
    expect(allowed(text, "https://s.example/orphan")).toBe(true);
    expect(allowed(text, "https://s.example/tmp/1")).toBe(false);
    expect(parseRobotsTxt(text).groups).toHaveLength(1);
  });
});

describe("robotsDecision — RFC 9309 §2.2.2 matching", () => {
  const rulesOf = (text: string) => robotsRulesFor(parseRobotsTxt(`User-agent: *\n${text}`));
  const decide = (text: string, url: string) => robotsDecision(rulesOf(text), url);

  it("uses the longest match, and Allow on a tie", () => {
    expect(decide("Disallow: /folder\nAllow: /folder/page", "https://s.example/folder/page").allowed).toBe(true);
    expect(decide("Allow: /folder\nDisallow: /folder/page", "https://s.example/folder/page").allowed).toBe(false);
    expect(decide("Disallow: /page\nAllow: /page", "https://s.example/page").allowed).toBe(true);
    expect(decide("Allow: /page\nDisallow: /page", "https://s.example/page").allowed).toBe(true);
    expect(decide("Disallow: /folder\nAllow: /folder/page", "https://s.example/folder/other").allowed).toBe(false);
  });

  it("says which rule decided", () => {
    expect(decide("Disallow: /a\nAllow: /a/b", "https://s.example/a/b/c").rule).toEqual({ allow: true, pattern: "/a/b" });
    expect(decide("Disallow: /a", "https://s.example/z").rule).toBeNull();
  });

  it("matches * as any run of characters and $ as the end of the path", () => {
    expect(decide("Disallow: /*.pdf$", "https://s.example/docs/a.pdf").allowed).toBe(false);
    expect(decide("Disallow: /*.pdf$", "https://s.example/docs/a.pdf?x=1").allowed).toBe(true);
    expect(decide("Disallow: /*.pdf$", "https://s.example/docs/a.pdfx").allowed).toBe(true);
    expect(decide("Disallow: /law*/x", "https://s.example/law01/x").allowed).toBe(false);
    expect(decide("Disallow: /*?session", "https://s.example/a?session=1").allowed).toBe(false);
    expect(decide("Disallow: /$", "https://s.example/").allowed).toBe(false);
    expect(decide("Disallow: /$", "https://s.example/a").allowed).toBe(true);
    // A wildcard rule is weighed by its own length, like any other.
    expect(decide("Disallow: /*\nAllow: /law", "https://s.example/law00/1.htm").allowed).toBe(true);
    expect(decide("Allow: /l\nDisallow: /*.htm", "https://s.example/law00/1.htm").allowed).toBe(false);
  });

  it("matches the path and the query, case-sensitively, from the start", () => {
    expect(decide("Disallow: /Private", "https://s.example/private").allowed).toBe(true);
    expect(decide("Disallow: /private", "https://s.example/public/private").allowed).toBe(true);
    expect(decide("Disallow: /search?q=", "https://s.example/search?q=x").allowed).toBe(false);
  });

  it("treats an empty Disallow as no rule", () => {
    expect(decide("Disallow:", "https://s.example/anything").allowed).toBe(true);
    expect(decide("Disallow:\nDisallow: /x", "https://s.example/x").allowed).toBe(false);
  });

  it("compares percent-encoded and plain forms alike: unreserved characters decoded, UTF-8 encoded", () => {
    expect(decide("Disallow: /%7Euser", "https://s.example/~user/a").allowed).toBe(false);
    expect(decide("Disallow: /~user", "https://s.example/%7Euser/a").allowed).toBe(false);
    expect(decide("Disallow: /חוק", "https://s.example/%D7%97%D7%95%D7%A7/1").allowed).toBe(false);
    expect(decide("Disallow: /a%2fb", "https://s.example/a%2Fb").allowed).toBe(false);
    // A reserved character stays encoded: %2F is not a path separator.
    expect(decide("Disallow: /a/b", "https://s.example/a%2Fb").allowed).toBe(true);
  });

  it("always allows /robots.txt itself", () => {
    expect(decide("Disallow: /", "https://s.example/robots.txt").allowed).toBe(true);
    expect(decide("Disallow: /", "https://s.example/robots.txt?x").allowed).toBe(false);
  });

  it("does not backtrack catastrophically on a pattern full of wildcards", () => {
    const pattern = `/${"*a".repeat(200)}$`;
    const path = `/${"a".repeat(3000)}b`;
    const started = Date.now();
    expect(decide(`Disallow: ${pattern}`, `https://s.example${path}`).allowed).toBe(true);
    expect(Date.now() - started).toBeLessThan(2000);
  });
});

describe("robotsTxtUrl", () => {
  it("is /robots.txt at the URL's own scheme, host and port", () => {
    expect(robotsTxtUrl("https://www.nevo.co.il/law_html/law00/70305.htm")).toBe("https://www.nevo.co.il/robots.txt");
    expect(robotsTxtUrl("http://s.example:8080/a?b#c")).toBe("http://s.example:8080/robots.txt");
  });
});

// ---------------------------------------------------------------------------
// Fetching robots.txt (RFC 9309 §2.3)
// ---------------------------------------------------------------------------

describe("robotsChecker — fetching robots.txt once per host per run", () => {
  it("reads a 2xx robots.txt and applies it", async () => {
    const hosts = stubHosts({ "https://a.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /no\n" } });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    expect(await robots.decide("https://a.example/yes")).toMatchObject({
      allowed: true,
      robots: "allowed",
      robotsUrl: "https://a.example/robots.txt",
    });
    expect(await robots.decide("https://a.example/no/1")).toMatchObject({
      allowed: false,
      robots: "disallowed",
      robotsUrl: "https://a.example/robots.txt",
      rule: { allow: false, pattern: "/no" },
    });
  });

  it("fetches each host's robots.txt once however many of its pages are checked, and each host separately", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 200, body: "" },
      "https://b.example/robots.txt": { status: 404 },
    });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    for (const url of ["https://a.example/1", "https://a.example/2", "https://b.example/1", "https://a.example/3"]) {
      await robots.decide(url);
    }
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://b.example/robots.txt"]);
  });

  it("reads a 4xx as no robots.txt at all: everything allowed, recorded as none", async () => {
    for (const status of [400, 401, 403, 404, 410, 429]) {
      const hosts = stubHosts({ "https://a.example/robots.txt": { status } });
      const decision = await robotsChecker({ fetchImpl: hosts.fetchImpl }).decide("https://a.example/x");
      expect(decision, String(status)).toMatchObject({ allowed: true, robots: "none", robotsUrl: "https://a.example/robots.txt" });
    }
  });

  it("reads a 5xx, a network error or a timeout as complete disallow for the run, recorded as unreachable", async () => {
    for (const answer of [{ status: 500 }, { status: 503 }, new TypeError("fetch failed")] as Answer[]) {
      const hosts = stubHosts({ "https://a.example/robots.txt": answer });
      const decision = await robotsChecker({ fetchImpl: hosts.fetchImpl }).decide("https://a.example/x");
      expect(decision).toMatchObject({ allowed: false, robots: "unreachable", robotsUrl: "https://a.example/robots.txt" });
      expect(decision.reason).toMatch(/HTTP 50\d|fetch failed/);
    }
    const hang = async (_url: string, init: { signal?: AbortSignal }) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      });
    const decision = await robotsChecker({ fetchImpl: hang, timeoutMs: 20 }).decide("https://slow.example/x");
    expect(decision).toMatchObject({ allowed: false, robots: "unreachable" });
    expect(decision.reason).toMatch(/timeout after 20ms/);
  });

  it("follows up to five redirects, even to another host, and applies what it reaches to the first host", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 301, location: "https://www.a.example/robots.txt" },
      "https://www.a.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /no\n" },
    });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    expect(await robots.decide("https://a.example/no")).toMatchObject({ allowed: false, robots: "disallowed", robotsUrl: "https://a.example/robots.txt" });
    expect(await robots.decide("https://a.example/yes")).toMatchObject({ allowed: true });
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://www.a.example/robots.txt"]);
  });

  it(`reads more than ${5} redirects as unreachable, which is complete disallow`, async () => {
    const answers: Record<string, Answer> = {};
    for (let i = 0; i <= 7; i += 1) {
      answers[i === 0 ? "https://a.example/robots.txt" : `https://a.example/r${i}`] = { status: 302, location: `https://a.example/r${i + 1}` };
    }
    const hosts = stubHosts(answers);
    const decision = await robotsChecker({ fetchImpl: hosts.fetchImpl }).decide("https://a.example/x");
    expect(ROBOTS_MAX_REDIRECTS).toBe(5);
    expect(decision).toMatchObject({ allowed: false, robots: "unreachable" });
    expect(decision.reason).toMatch(/more than 5 redirects/);
    expect(hosts.calls).toHaveLength(ROBOTS_MAX_REDIRECTS + 1);
  });

  it("never follows a robots.txt redirect to a barred host or to tiktok.com, and reads that as unreachable", async () => {
    for (const location of ["https://www.gumroad.com/robots.txt", "https://www.tiktok.com/robots.txt"]) {
      const hosts = stubHosts({ "https://a.example/robots.txt": { status: 302, location } });
      const decision = await robotsChecker({ fetchImpl: hosts.fetchImpl }).decide("https://a.example/x");
      expect(decision, location).toMatchObject({ allowed: false, robots: "unreachable" });
      expect(hosts.urls(), location).toEqual(["https://a.example/robots.txt"]);
    }
  });

  it("sends no request of any kind, robots.txt included, for a barred host or tiktok.com", async () => {
    const hosts = stubHosts({});
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    for (const url of ["https://www.gumroad.com/l/x", "https://api.gumroad.com/v2", "https://www.tiktok.com/@x", "https://support.google.com/a"]) {
      const decision = await robots.decide(url);
      expect(decision.allowed, url).toBe(false);
      expect(decision.reason, url).toMatch(/no request of any kind/);
    }
    expect(hosts.calls).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fetchOne with robots.txt
// ---------------------------------------------------------------------------

describe("fetchOne — robots.txt before every page and every redirect hop", () => {
  const page = (url: string) => ({ url, slug: "p" });

  it("fetches an allowed page after its robots.txt and records the robots state and URL", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /no\n" },
      "https://a.example/yes": { status: 200, body: "<p>ok</p>", contentType: "text/html" },
    });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    const result = await fetchOne(page("https://a.example/yes"), { fetchImpl: hosts.fetchImpl, robots });
    expect(result).toMatchObject({ status: 200, error: null, robots: "allowed", robotsUrl: "https://a.example/robots.txt" });
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://a.example/yes"]);
  });

  it("never requests a disallowed page, and says why", async () => {
    const hosts = stubHosts({ "https://a.example/robots.txt": { status: 200, body: "User-agent: MehudakRenderWatch\nDisallow: /no\n" } });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    const result = await fetchOne(page("https://a.example/no/1"), { fetchImpl: hosts.fetchImpl, robots });
    expect(result).toMatchObject({
      status: null,
      bytes: null,
      robots: "disallowed",
      robotsUrl: "https://a.example/robots.txt",
    });
    expect(result.error).toBe(
      'robots.txt disallows this URL for MehudakRenderWatch (https://a.example/robots.txt, "Disallow: /no"); not fetched',
    );
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt"]);
  });

  it("fetches the page when robots.txt answers 4xx, and records none", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 404 },
      "https://a.example/x": { status: 200, body: "{}", contentType: "application/json" },
    });
    const result = await fetchOne(page("https://a.example/x"), { fetchImpl: hosts.fetchImpl, robots: robotsChecker({ fetchImpl: hosts.fetchImpl }) });
    expect(result).toMatchObject({ status: 200, error: null, robots: "none", robotsUrl: "https://a.example/robots.txt" });
  });

  it("does not fetch the page when robots.txt answers 5xx, and records unreachable", async () => {
    const hosts = stubHosts({ "https://a.example/robots.txt": { status: 503 } });
    const result = await fetchOne(page("https://a.example/x"), { fetchImpl: hosts.fetchImpl, robots: robotsChecker({ fetchImpl: hosts.fetchImpl }) });
    expect(result).toMatchObject({ status: null, bytes: null, robots: "unreachable", robotsUrl: "https://a.example/robots.txt" });
    expect(result.error).toMatch(/^robots\.txt could not be read \(https:\/\/a\.example\/robots\.txt: HTTP 503\).*complete disallow.*not fetched/);
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt"]);
  });

  it("checks a redirect hop to another host against that host's robots.txt before requesting it", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 404 },
      "https://a.example/go": { status: 302, location: "https://b.example/private/page" },
      "https://b.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /private\n" },
    });
    const result = await fetchOne(page("https://a.example/go"), { fetchImpl: hosts.fetchImpl, robots: robotsChecker({ fetchImpl: hosts.fetchImpl }) });
    expect(result).toMatchObject({ status: 302, bytes: null, robots: "disallowed", robotsUrl: "https://b.example/robots.txt" });
    expect(result.error).toMatch(/^redirected to b\.example: robots\.txt disallows this URL/);
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://a.example/go", "https://b.example/robots.txt"]);
  });

  it("follows an allowed hop to another host, and records the robots.txt of the page it stored", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 404 },
      "https://a.example/go": { status: 301, location: "https://b.example/open" },
      "https://b.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /private\n" },
      "https://b.example/open": { status: 200, body: "<p>b</p>", contentType: "text/html" },
    });
    const result = await fetchOne(page("https://a.example/go"), { fetchImpl: hosts.fetchImpl, robots: robotsChecker({ fetchImpl: hosts.fetchImpl }) });
    expect(result).toMatchObject({ status: 200, error: null, robots: "allowed", robotsUrl: "https://b.example/robots.txt" });
  });

  it("checks a same-host hop's path too, without fetching robots.txt again", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /private\n" },
      "https://a.example/go": { status: 302, location: "/private/x" },
    });
    const result = await fetchOne(page("https://a.example/go"), { fetchImpl: hosts.fetchImpl, robots: robotsChecker({ fetchImpl: hosts.fetchImpl }) });
    expect(result).toMatchObject({ status: 302, robots: "disallowed" });
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://a.example/go"]);
  });

  it("sends no request of any kind to a barred host a page redirects to — not even for its robots.txt", async () => {
    const hosts = stubHosts({
      "https://a.example/robots.txt": { status: 404 },
      "https://a.example/go": { status: 302, location: "https://seller.gumroad.com/l/pro" },
    });
    const result = await fetchOne(page("https://a.example/go"), { fetchImpl: hosts.fetchImpl, robots: robotsChecker({ fetchImpl: hosts.fetchImpl }) });
    expect(result.error).toMatch(/redirected to gumroad\.com \(seller\.gumroad\.com\), whose terms bar automated access; not followed/);
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://a.example/go"]);
    expect(hosts.urls().some((u) => /gumroad/.test(u))).toBe(false);
  });

  it("leaves a fetch with no robots checker exactly as it was: no robots.txt, no robots keys", async () => {
    const hosts = stubHosts({ "https://a.example/x": { status: 200, body: "<p>x</p>", contentType: "text/html" } });
    const result = await fetchOne(page("https://a.example/x"), { fetchImpl: hosts.fetchImpl });
    expect(hosts.urls()).toEqual(["https://a.example/x"]);
    expect("robots" in result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// The robots-only probe line
// ---------------------------------------------------------------------------

describe("parseUrlList — the robots-only probe line", () => {
  it("reads a /robots.txt URL with a robots- slug as a probe", () => {
    expect(parseUrlList("https://www.nevo.co.il/robots.txt\trobots-nevo")).toEqual([
      { url: "https://www.nevo.co.il/robots.txt", slug: "robots-nevo", lineNumber: 1, robotsProbe: true },
    ]);
  });

  it("refuses a robots- slug on any other path, and a /robots.txt URL under any other slug", () => {
    expect(() => parseUrlList("https://www.nevo.co.il/law_html/x.htm\trobots-nevo")).toThrow(/robots-.*exactly \/robots\.txt/);
    expect(() => parseUrlList("https://www.nevo.co.il/robots.txt?x=1\trobots-nevo")).toThrow(/robots-.*exactly \/robots\.txt/);
    expect(() => parseUrlList("https://www.nevo.co.il/robots.txt/\trobots-nevo")).toThrow(/robots-.*exactly \/robots\.txt/);
    expect(() => parseUrlList("https://www.nevo.co.il/robots.txt\tnevo-robots")).toThrow(/slug starting robots-/);
    expect(() => parseUrlList("https://www.nevo.co.il/robots.txt")).toThrow(/slug starting robots-/);
  });

  it("refuses the js flag on a probe: robots.txt is read by a plain GET only", () => {
    expect(() => parseUrlList("https://www.nevo.co.il/robots.txt\trobots-nevo\tjs")).toThrow(/plain GET/);
  });

  it("still refuses a barred host's robots.txt at parse time", () => {
    expect(() => parseUrlList("https://www.gumroad.com/robots.txt\trobots-gumroad")).toThrow(/gumroad\.com/);
    expect(() => parseUrlList("https://www.tiktok.com/robots.txt\trobots-tiktok")).toThrow(/tiktok\.com/);
  });

  it("leaves every other line in exactly the shape it had", () => {
    expect(parseUrlList("https://a.example/robots-guide\trobotics-guide")).toEqual([
      { url: "https://a.example/robots-guide", slug: "robotics-guide", lineNumber: 1 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// main, end to end against a temp directory
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];
function tmpOut(): string {
  const dir = mkdtempSync(join(tmpdir(), "render-watch-robots-test-"));
  tmpDirs.push(dir);
  return dir;
}
afterAll(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function writeList(dir: string, lines: string[]): string {
  const path = join(dir, "urls.txt");
  writeFileSync(path, `# test list\n${lines.join("\n")}\n`);
  return path;
}

function captureStdout() {
  const chunks: string[] = [];
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    chunks.push(String(chunk));
    return true;
  });
  return { text: () => chunks.join(""), restore: () => spy.mockRestore() };
}

const readMeta = (dir: string, slug: string) => JSON.parse(readFileSync(join(dir, `${slug}.meta.json`), "utf8"));

describe("main — robots.txt in a run", () => {
  let out: string;
  let stdout: ReturnType<typeof captureStdout>;

  beforeEach(() => {
    out = tmpOut();
    stdout = captureStdout();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T05:23:00.000Z"));
  });

  afterEach(() => {
    stdout.restore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function stubGlobal(answers: Record<string, Answer>) {
    const hosts = stubHosts(answers);
    vi.stubGlobal("fetch", hosts.fetchImpl);
    return hosts;
  }

  it("reads each host's robots.txt once, records it in every page's meta, and skips a disallowed page", async () => {
    const hosts = stubGlobal({
      "https://a.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /closed\n" },
      "https://a.example/one": { status: 200, body: "<p>one</p>", contentType: "text/html" },
      "https://a.example/two": { status: 200, body: "<p>two</p>", contentType: "text/html" },
      "https://b.example/robots.txt": { status: 404 },
      "https://b.example/three": { status: 200, body: "{}", contentType: "application/json" },
    });
    const list = writeList(out, [
      "https://a.example/one\ta-one",
      "https://a.example/closed/page\ta-closed",
      "https://b.example/three\tb-three",
      "https://a.example/two\ta-two",
    ]);
    expect(await main(["--list", list, "--out", out], {}, { delayMs: 0 })).toBe(0);

    expect(hosts.urls()).toEqual([
      "https://a.example/robots.txt",
      "https://a.example/one",
      "https://b.example/robots.txt",
      "https://b.example/three",
      "https://a.example/two",
    ]);
    expect(readMeta(out, "a-one")).toMatchObject({ status: 200, robots: "allowed", robotsUrl: "https://a.example/robots.txt" });
    expect(readMeta(out, "b-three")).toMatchObject({ status: 200, robots: "none", robotsUrl: "https://b.example/robots.txt" });
    const closed = readMeta(out, "a-closed");
    expect(closed).toMatchObject({ status: null, sha256: null, bodyPath: null, robots: "disallowed", robotsUrl: "https://a.example/robots.txt" });
    expect(closed.error).toMatch(/robots\.txt disallows this URL/);
    expect(readdirSync(out).filter((n) => n.startsWith("a-closed"))).toEqual(["a-closed.meta.json"]);
    // The robots fields sit after the page's own fields, before the change bookkeeping.
    const keys = Object.keys(readMeta(out, "a-one"));
    expect(keys.slice(keys.indexOf("textPath"), keys.indexOf("changed") + 1)).toEqual(["textPath", "robots", "robotsUrl", "changed"]);
    expect(stdout.text()).toMatch(/FAILED\s+a-closed\s+robots\.txt disallows this URL/);
  });

  it("fetches nothing from a host whose robots.txt is unreachable, and carries on with the rest", async () => {
    const hosts = stubGlobal({
      "https://down.example/robots.txt": { status: 503 },
      "https://up.example/robots.txt": { status: 200, body: "" },
      "https://up.example/x": { status: 200, body: "<p>x</p>", contentType: "text/html" },
    });
    const list = writeList(out, ["https://down.example/a\tdown-a", "https://down.example/b\tdown-b", "https://up.example/x\tup-x"]);
    expect(await main(["--list", list, "--out", out], {}, { delayMs: 0 })).toBe(0);
    expect(hosts.urls()).toEqual(["https://down.example/robots.txt", "https://up.example/robots.txt", "https://up.example/x"]);
    for (const slug of ["down-a", "down-b"]) expect(readMeta(out, slug)).toMatchObject({ robots: "unreachable", bodyPath: null });
    expect(readMeta(out, "up-x")).toMatchObject({ robots: "allowed", status: 200 });
  });

  it("a robots- probe line fetches only robots.txt, once, and stores it like any capture", async () => {
    const body = "User-agent: *\nDisallow: /search\n";
    const hosts = stubGlobal({ "https://www.law.example/robots.txt": { status: 200, body, contentType: "text/plain; charset=utf-8" } });
    const list = writeList(out, ["https://www.law.example/robots.txt\trobots-law"]);
    expect(await main(["--list", list, "--out", out], {}, { delayMs: 0 })).toBe(0);

    expect(hosts.urls()).toEqual(["https://www.law.example/robots.txt"]);
    expect(readdirSync(out).sort()).toEqual(["robots-law.meta.json", "robots-law.txt", "urls.txt"]);
    expect(readFileSync(join(out, "robots-law.txt"), "utf8")).toBe(body);
    expect(readMeta(out, "robots-law")).toMatchObject({
      url: "https://www.law.example/robots.txt",
      status: 200,
      bodyPath: "research/rendered/robots-law.txt",
      error: null,
      robots: "allowed",
      robotsUrl: "https://www.law.example/robots.txt",
    });
  });

  it("a probe records a 4xx robots.txt as none and a 5xx as unreachable, and stores no body for either", async () => {
    stubGlobal({ "https://a.example/robots.txt": { status: 404 }, "https://b.example/robots.txt": { status: 500 } });
    const list = writeList(out, ["https://a.example/robots.txt\trobots-a", "https://b.example/robots.txt\trobots-b"]);
    await main(["--list", list, "--out", out], {}, { delayMs: 0 });
    expect(readMeta(out, "robots-a")).toMatchObject({ status: 404, error: "HTTP 404", bodyPath: null, robots: "none" });
    expect(readMeta(out, "robots-b")).toMatchObject({ status: 500, bodyPath: null, robots: "unreachable" });
    expect(readMeta(out, "robots-b").error).toMatch(/HTTP 500/);
  });

  it("a probe and a page on the same host share one robots.txt fetch", async () => {
    const hosts = stubGlobal({
      "https://a.example/robots.txt": { status: 200, body: "User-agent: *\nAllow: /\n" },
      "https://a.example/page": { status: 200, body: "<p>p</p>", contentType: "text/html" },
    });
    const list = writeList(out, ["https://a.example/robots.txt\trobots-a", "https://a.example/page\ta-page"]);
    await main(["--list", list, "--out", out], {}, { delayMs: 0 });
    expect(hosts.urls()).toEqual(["https://a.example/robots.txt", "https://a.example/page"]);
  });

  it("writes nothing at all on a second run when robots.txt and the page are unchanged", async () => {
    stubGlobal({
      "https://a.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /closed\n" },
      "https://a.example/one": { status: 200, body: "<p>one</p>", contentType: "text/html" },
    });
    const list = writeList(out, ["https://a.example/one\ta-one", "https://a.example/closed\ta-closed", "https://a.example/robots.txt\trobots-a"]);
    await main(["--list", list, "--out", out], {}, { delayMs: 0 });
    const before = readdirSync(out).sort().map((n) => [n, readFileSync(join(out, n), "utf8")]);
    vi.setSystemTime(new Date("2026-10-07T05:23:00.000Z"));
    await main(["--list", list, "--out", out], {}, { delayMs: 0 });
    expect(readdirSync(out).sort().map((n) => [n, readFileSync(join(out, n), "utf8")])).toEqual(before);
  });
});

describe("research/rendered/README.md documents what the fetcher now does", () => {
  it("names the User-Agent, the robots.txt reading, the probe line form and NO_TERMS_ROBOTS_OK", () => {
    const readme = readFileSync(join(ROOT, "research", "rendered", "README.md"), "utf8");
    expect(readme).toContain(USER_AGENT);
    expect(readme).toMatch(/\*\*robots\.txt and an identifying User-Agent \(30\.9\)\.\*\*/);
    expect(readme).toMatch(/RFC 9309/);
    expect(readme).toContain("https://www.example.org/robots.txt\trobots-example");
    expect(readme).toMatch(/NO_TERMS_ROBOTS_OK/);
    expect(readme).toContain("node scripts/robots-verdict.mjs <site> [--apply]");
    // Row 16(d) is ruled: the README no longer says anything waits on it.
    expect(readme).not.toMatch(/waits on `logs\/FABLE_QUEUE\.md`/);
  });
});

// ---------------------------------------------------------------------------
// The js mode
// ---------------------------------------------------------------------------

function fakeBrowser(pages: Record<string, { html?: string; hops?: string[] }>) {
  const gotos: string[] = [];
  const browser = {
    isConnected: () => true,
    version: () => "141.0.7390.37",
    async close() {},
    async newContext() {
      return {
        async route() {},
        async routeWebSocket() {},
        async newPage() {
          const listeners: Array<(request: unknown) => void> = [];
          const mainFrame = { name: "main" };
          return {
            on(event: string, listener: (request: unknown) => void) {
              if (event === "request") listeners.push(listener);
            },
            mainFrame: () => mainFrame,
            async goto(url: string) {
              gotos.push(url);
              const spec = pages[url] ?? {};
              const chain = [url, ...(spec.hops ?? [])];
              for (const hop of chain) {
                const request = { url: () => hop, isNavigationRequest: () => true, frame: () => mainFrame };
                for (const listener of listeners) listener(request);
              }
              const at = (i: number): unknown => (i < 0 ? null : { url: () => chain[i], redirectedFrom: () => at(i - 1) });
              return {
                url: () => chain[chain.length - 1],
                request: () => at(chain.length - 1),
                status: () => 200,
                statusText: () => "",
                ok: () => true,
                headers: () => ({ "content-type": "text/html; charset=utf-8" }),
              };
            },
            async waitForLoadState() {},
            content: () => Promise.resolve(pages[gotos[gotos.length - 1]]?.html ?? ""),
          };
        },
        async close() {},
      };
    },
  };
  return { gotos, launchBrowser: vi.fn(async () => browser), browser };
}

describe("the js mode and robots.txt", () => {
  let out: string;
  let stdout: ReturnType<typeof captureStdout>;
  beforeEach(() => {
    out = tmpOut();
    stdout = captureStdout();
  });
  afterEach(() => {
    stdout.restore();
    vi.unstubAllGlobals();
  });

  it("reads robots.txt with a plain GET before the browser, and never navigates to a disallowed js page", async () => {
    const hosts = stubHosts({ "https://help.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /s/\n" } });
    vi.stubGlobal("fetch", hosts.fetchImpl);
    const fake = fakeBrowser({});
    const list = writeList(out, ["https://help.example/s/article/X\thelp-x\tjs"]);
    expect(await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 })).toBe(0);
    expect(hosts.urls()).toEqual(["https://help.example/robots.txt"]);
    expect(fake.gotos).toEqual([]);
    expect(fake.launchBrowser).not.toHaveBeenCalled();
    expect(readMeta(out, "help-x")).toMatchObject({ robots: "disallowed", bodyPath: null, renderedWith: "chromium" });
  });

  it("renders an allowed js page and records its robots.txt", async () => {
    const hosts = stubHosts({ "https://help.example/robots.txt": { status: 404 } });
    vi.stubGlobal("fetch", hosts.fetchImpl);
    const fake = fakeBrowser({ "https://help.example/s/article/X": { html: "<p>article</p>" } });
    const list = writeList(out, ["https://help.example/s/article/X\thelp-x\tjs"]);
    await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 });
    expect(fake.gotos).toEqual(["https://help.example/s/article/X"]);
    expect(readMeta(out, "help-x")).toMatchObject({ status: 200, robots: "none", robotsUrl: "https://help.example/robots.txt" });
  });

  it("does not store a page the browser reached through a hop robots.txt disallows", async () => {
    const hosts = stubHosts({
      "https://help.example/robots.txt": { status: 404 },
      "https://other.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /\n" },
    });
    const fake = fakeBrowser({ "https://help.example/s/article/X": { html: "<p>moved</p>", hops: ["https://other.example/landing"] } });
    const robots = robotsChecker({ fetchImpl: hosts.fetchImpl });
    const result = await renderWithBrowser({ url: "https://help.example/s/article/X", slug: "help-x", js: true }, { browser: fake.browser, robots });
    expect(result).toMatchObject({ bytes: null, robots: "disallowed", robotsUrl: "https://other.example/robots.txt" });
    expect(result.error).toMatch(/other\.example.*robots\.txt disallows.*not stored/);
  });
});
