import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.test.ts)
import * as rw from "../../../scripts/render-watch.mjs";

/**
 * The opt-in JavaScript-capable render mode of scripts/render-watch.mjs, ordered by the loop board
 * (research/channel-loop/RULING-2026-09-29-loop.md (b), "Tick 17-18, tooling"): a `js` flag per line of
 * urls.txt, a headless Chromium on the runner, plain navigation only, never a tiktok.com URL.
 *
 * No test here starts a browser or touches the network. The browser is a fake that records every call,
 * so what the mode asks of a real one (a fresh context per URL, one navigation, the honest User-Agent,
 * no stored state, a block on tiktok.com) is pinned as calls, not hoped for.
 */

const {
  bodyChanged,
  browserContextOptions,
  isTikTokHost,
  loadPlaywright,
  main,
  MAX_BYTES,
  parseUrlList,
  renderWithBrowser,
  sha256,
  TIMEOUT_MS,
  USER_AGENT,
} = rw;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// ---------------------------------------------------------------------------
// The list syntax
// ---------------------------------------------------------------------------

describe("parseUrlList — the js flag", () => {
  it("reads a third field `js` and returns it on the entry", () => {
    expect(parseUrlList("https://example.com/help\thelp-page\tjs")).toEqual([
      { url: "https://example.com/help", slug: "help-page", lineNumber: 1, js: true },
    ]);
    // Any whitespace separates the fields, as for the slug (a dispatch box cannot carry a tab).
    expect(parseUrlList("https://example.com/help   help-page  js")[0]).toMatchObject({ js: true });
  });

  it("returns a line without the flag in exactly today's shape — no js key at all", () => {
    const [plain] = parseUrlList("https://example.com/a\tone");
    expect(plain).toEqual({ url: "https://example.com/a", slug: "one", lineNumber: 1 });
    expect("js" in plain).toBe(false);
  });

  it("refuses an unknown flag rather than ignoring it", () => {
    expect(() => parseUrlList("https://example.com/a\tone\tjavascript")).toThrow(/unknown flag "javascript"/);
    expect(() => parseUrlList("https://example.com/a\tone\tJS")).toThrow(/unknown flag "JS"/);
    // The old message still reads right for the old mistake (a two-word slug).
    expect(() => parseUrlList("https://example.com/a\tone two")).toThrow(/a slug is one word/);
  });

  it("refuses a fourth field", () => {
    expect(() => parseUrlList("https://example.com/a\tone\tjs\tjs")).toThrow(/at most three fields/);
  });

  it("refuses `js` as a slug, because `URL js` would silently be a plain line named js", () => {
    expect(() => parseUrlList("https://example.com/a\tjs")).toThrow(/name the slug first/);
  });

  it("refuses a line whose URL cannot be parsed, since neither mode could fetch it", () => {
    expect(() => parseUrlList("https://exa[mple.com/")).toThrow(/not a valid URL/);
  });

  it("parses the real urls.txt unchanged: no line there carries a flag today", () => {
    const entries = parseUrlList(readFileSync(join(ROOT, "research", "rendered", "urls.txt"), "utf8"));
    expect(entries.length).toBeGreaterThan(100);
    expect(entries.every((e: { js?: boolean }) => !("js" in e))).toBe(true);
  });
});

describe("parseUrlList — tiktok.com is refused in both modes (CHANNEL_LOOP §9, FABLE_QUEUE row 16(d))", () => {
  const refused = [
    "https://www.tiktok.com/@someone",
    "https://tiktok.com/",
    "https://vm.tiktok.com/ZMabc/",
    "https://WWW.TIKTOK.COM/legal/terms",
    "https://www.tiktok.com./legal/terms", // a trailing dot is the same host
    "https://user@www.tiktok.com/x", // userinfo does not change the host
    "http://ads.tiktok.com:443/help",
  ];

  it("throws at parse time for tiktok.com and every subdomain, plain or js", () => {
    for (const url of refused) {
      expect(() => parseUrlList(`${url}\tsome-slug`), url).toThrow(/tiktok\.com/);
      expect(() => parseUrlList(`${url}\tsome-slug\tjs`), url).toThrow(/tiktok\.com/);
    }
  });

  it("names the pause and the pending ruling in the refusal", () => {
    expect(() => parseUrlList("https://www.tiktok.com/")).toThrow(/CHANNEL_LOOP\.md §9.*FABLE_QUEUE\.md row 16\(d\)/s);
  });

  it("refuses it in the workflow_dispatch override too, which goes through the same parser", async () => {
    await expect(main(["--needs-browser"], { RENDER_WATCH_URLS: "https://www.tiktok.com/@x\tx" })).rejects.toThrow(/tiktok\.com/);
  });

  it("does not refuse a host that only contains the name", () => {
    for (const url of [
      "https://nottiktok.com/",
      "https://tiktok.com.example.org/",
      "https://www.tiktok.com@example.org/", // the host here is example.org
      "https://example.org/?next=https://www.tiktok.com/",
      "https://github.com/OpenTermsArchive/pga-versions/blob/main/TikTok/Terms%20of%20Service.md",
    ]) {
      expect(() => parseUrlList(`${url}\tok-slug`), url).not.toThrow();
    }
  });

  it("isTikTokHost matches the host and its subdomains only", () => {
    expect(isTikTokHost("tiktok.com")).toBe(true);
    expect(isTikTokHost("m.tiktok.com")).toBe(true);
    expect(isTikTokHost("TikTok.com.")).toBe(true);
    expect(isTikTokHost("tiktokcdn.com")).toBe(false);
    expect(isTikTokHost("nottiktok.com")).toBe(false);
    expect(isTikTokHost("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// The fake browser
// ---------------------------------------------------------------------------

interface PageSpec {
  status?: number;
  statusText?: string;
  contentType?: string | null;
  html?: string;
  idle?: "ok" | "timeout";
  gotoError?: Error;
  noResponse?: boolean;
}

interface FakeContext {
  options: Record<string, unknown>;
  closed: boolean;
  routes: Array<{ matcher: unknown; handler: (route: unknown) => unknown }>;
  wsRoutes: Array<{ matcher: unknown; handler: (ws: unknown) => unknown }>;
  pages: number;
}

function playwrightTimeout(message: string) {
  const error = new Error(`${message}\nCall log:\n  - navigating to "https://x", waiting until "domcontentloaded"\n`);
  error.name = "TimeoutError";
  return error;
}

function fakeBrowser(pages: Record<string, PageSpec>) {
  const contexts: FakeContext[] = [];
  const gotos: Array<{ url: string; options: unknown }> = [];
  const waits: Array<{ state: string; options: { timeout: number } }> = [];
  const state = { closed: false, launched: 0 };

  const browser = {
    isConnected: () => !state.closed,
    version: () => "141.0.7390.37",
    async close() {
      state.closed = true;
    },
    async newContext(options: Record<string, unknown>) {
      const ctx: FakeContext = { options, closed: false, routes: [], wsRoutes: [], pages: 0 };
      contexts.push(ctx);
      return {
        async route(matcher: unknown, handler: (route: unknown) => unknown) {
          ctx.routes.push({ matcher, handler });
        },
        async routeWebSocket(matcher: unknown, handler: (ws: unknown) => unknown) {
          ctx.wsRoutes.push({ matcher, handler });
        },
        async newPage() {
          ctx.pages += 1;
          let spec: PageSpec = {};
          return {
            async goto(url: string, options: unknown) {
              gotos.push({ url, options });
              spec = pages[url] ?? {};
              if (spec.gotoError) throw spec.gotoError;
              if (spec.noResponse) return null;
              const status = spec.status ?? 200;
              return {
                status: () => status,
                statusText: () => spec.statusText ?? "",
                ok: () => status >= 200 && status < 300,
                headers: () =>
                  spec.contentType === null ? {} : { "content-type": spec.contentType ?? "text/html; charset=utf-8" },
              };
            },
            async waitForLoadState(loadState: string, options: { timeout: number }) {
              waits.push({ state: loadState, options });
              if (spec.idle === "timeout") throw playwrightTimeout("page.waitForLoadState: Timeout exceeded.");
            },
            async content() {
              return spec.html ?? "";
            },
          };
        },
        async close() {
          ctx.closed = true;
        },
      };
    },
  };

  const launchBrowser = vi.fn(async () => {
    state.launched += 1;
    state.closed = false; // a launch gives a connected browser, as a real one does
    return browser;
  });
  return { browser, launchBrowser, contexts, gotos, waits, state };
}

// ---------------------------------------------------------------------------
// renderWithBrowser — one URL
// ---------------------------------------------------------------------------

const ENTRY = { url: "https://support.example.test/s/article/Identity", slug: "ex-identity", lineNumber: 1, js: true };
const RENDERED =
  "<html><head><title>Identity</title><script>boot()</script></head>" +
  "<body><h1>Identity verification</h1><p>Upload a document &amp; a selfie</p></body></html>";

describe("renderWithBrowser — plain navigation only", () => {
  it("opens a fresh context with the honest User-Agent and nothing stored, navigates once, and returns the DOM", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });

    expect(fake.contexts).toHaveLength(1);
    expect(fake.contexts[0].options).toEqual({
      userAgent: USER_AGENT,
      extraHTTPHeaders: { "accept-language": "en-US,en;q=0.9,he;q=0.8" },
      acceptDownloads: false,
      serviceWorkers: "block",
    });
    expect(fake.contexts[0].options).toEqual(browserContextOptions());
    expect(fake.contexts[0].pages).toBe(1);
    expect(fake.gotos).toEqual([{ url: ENTRY.url, options: { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS } }]);
    expect(fake.waits).toHaveLength(1);
    expect(fake.waits[0].state).toBe("networkidle");
    expect(fake.waits[0].options.timeout).toBeGreaterThan(0);
    expect(fake.waits[0].options.timeout).toBeLessThanOrEqual(TIMEOUT_MS);
    expect(fake.contexts[0].closed).toBe(true);

    expect(result).toEqual({
      status: 200,
      contentType: "text/html; charset=utf-8",
      bytes: Buffer.from(RENDERED, "utf8"),
      truncated: false,
      error: null,
      renderedWith: "chromium",
      networkIdle: true,
    });
  });

  it("blocks every request to tiktok.com from inside the page — a subresource, an embed or a redirect", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    await renderWithBrowser(ENTRY, { browser: fake.browser });

    expect(fake.contexts[0].routes).toHaveLength(1);
    const { matcher, handler } = fake.contexts[0].routes[0];
    const matches = matcher as (url: URL) => boolean;
    expect(matches(new URL("https://www.tiktok.com/embed/v2/123"))).toBe(true);
    expect(matches(new URL("https://sf16-website-login.neutral.tiktok.com/x.js"))).toBe(true);
    expect(matches(new URL("https://support.example.test/s/sfsites/aura"))).toBe(false);

    const aborted: string[] = [];
    await handler({ abort: async (code: string) => aborted.push(code) });
    expect(aborted).toEqual(["blockedbyclient"]);

    // route() does not see WebSockets; routeWebSocket closes one to tiktok.com before it connects.
    expect(fake.contexts[0].wsRoutes).toHaveLength(1);
    const ws = fake.contexts[0].wsRoutes[0];
    expect((ws.matcher as (url: URL) => boolean)(new URL("wss://webcast.tiktok.com/ws"))).toBe(true);
    expect((ws.matcher as (url: URL) => boolean)(new URL("wss://support.example.test/cometd"))).toBe(false);
    const closed: unknown[] = [];
    let connected = false;
    await ws.handler({
      close: async (options: unknown) => closed.push(options),
      connectToServer: () => {
        connected = true;
      },
    });
    expect(connected).toBe(false);
    expect(closed).toEqual([{ code: 1008, reason: "render-watch never contacts tiktok.com" }]);
  });

  it("takes the DOM as it stands when the network never goes quiet, and says so", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED, idle: "timeout" } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toMatchObject({ error: null, networkIdle: false, bytes: Buffer.from(RENDERED) });
  });

  it("keeps the whole render inside TIMEOUT_MS: the idle wait gets only what the navigation left", async () => {
    let clock = 0;
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    const slowBrowser = {
      ...fake.browser,
      async newContext(options: Record<string, unknown>) {
        const ctx = await fake.browser.newContext(options);
        return {
          ...ctx,
          async newPage() {
            const page = await ctx.newPage();
            return {
              ...page,
              async goto(url: string, o: unknown) {
                clock += 25_000; // the navigation took 25 s
                return page.goto(url, o);
              },
            };
          },
        };
      },
    };
    await renderWithBrowser(ENTRY, { browser: slowBrowser, now: () => clock });
    expect(fake.waits[0].options.timeout).toBe(TIMEOUT_MS - 25_000);
  });

  it("records a refusal as data, like a plain GET: status, no body, the page's own error", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { status: 403, statusText: "Forbidden", html: "<p>denied</p>" } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toEqual({
      status: 403,
      contentType: "text/html; charset=utf-8",
      bytes: null,
      truncated: false,
      error: "HTTP 403 Forbidden",
      renderedWith: "chromium",
      networkIdle: null,
    });
    expect(fake.contexts[0].closed).toBe(true);
  });

  it("records a navigation timeout on one deterministic line, without Playwright's call log", async () => {
    const fake = fakeBrowser({
      [ENTRY.url]: { gotoError: playwrightTimeout(`page.goto: Timeout ${TIMEOUT_MS}ms exceeded.`) },
    });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result.error).toBe(`timeout after ${TIMEOUT_MS}ms (TimeoutError: page.goto: Timeout ${TIMEOUT_MS}ms exceeded.)`);
    expect(result).toMatchObject({ status: null, bytes: null, renderedWith: "chromium", networkIdle: null });
    expect(fake.contexts[0].closed).toBe(true);
  });

  it("records a network error by its first line", async () => {
    const fake = fakeBrowser({
      [ENTRY.url]: { gotoError: new Error("page.goto: net::ERR_NAME_NOT_RESOLVED at https://x\nCall log:\n  - ...") },
    });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result.error).toBe("Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://x");
  });

  it("stores nothing for a page that is not HTML, and says to drop the flag", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { contentType: "application/pdf" } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toMatchObject({ status: 200, contentType: "application/pdf", bytes: null });
    expect(result.error).toMatch(/js mode stores HTML pages only.*application\/pdf.*without the js flag/);
    expect(fake.waits).toHaveLength(0);
  });

  it("records a navigation that produced no response", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { noResponse: true } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toMatchObject({ status: null, bytes: null, error: "the navigation produced no response" });
  });

  it("caps the stored DOM at MAX_BYTES and flags it as a sample", async () => {
    const big = `<html><body>${"x".repeat(200)}</body></html>`;
    const fake = fakeBrowser({ [ENTRY.url]: { html: big } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser, maxBytes: 64 });
    expect(result.truncated).toBe(true);
    expect(result.bytes).toEqual(Buffer.from(big).subarray(0, 64));
    expect(MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});

// ---------------------------------------------------------------------------
// main — a list with js lines
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];
function tmpOut(): string {
  const dir = mkdtempSync(join(tmpdir(), "render-watch-js-test-"));
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

function snapshot(dir: string, prefix = ""): Array<[string, string]> {
  return readdirSync(dir)
    .filter((name) => name.startsWith(prefix))
    .sort()
    .map((name) => [name, readFileSync(join(dir, name)).toString("base64")]);
}

const PLAIN_URL = "https://example.test/terms";
const PLAIN_HTML = "<html><head><title>Terms</title></head><body><h1>Terms</h1><p>Israel &amp; more</p></body></html>";

function stubPlainFetch() {
  const calls: string[] = [];
  vi.stubGlobal("fetch", async (url: string) => {
    calls.push(String(url));
    return new Response(PLAIN_HTML, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  return calls;
}

function neverLaunch() {
  return vi.fn(async () => {
    throw new Error("the browser must not be launched for a list with no js line");
  });
}

describe("main — js lines", () => {
  let out: string;
  let stdout: ReturnType<typeof captureStdout>;

  beforeEach(() => {
    out = tmpOut();
    stdout = captureStdout();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-29T05:23:00.000Z"));
  });

  afterEach(() => {
    stdout.restore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("never loads a browser for a list with no js line", async () => {
    stubPlainFetch();
    const launchBrowser = neverLaunch();
    const list = writeList(out, [`${PLAIN_URL}\tex-terms`]);
    expect(await main(["--list", list, "--out", out], {}, { launchBrowser, delayMs: 0 })).toBe(0);
    expect(launchBrowser).not.toHaveBeenCalled();
  });

  it("renders a js line in the browser and a plain line with fetch; the plain capture is byte-identical to a plain-only run", async () => {
    // The same plain line, alone, in a separate directory: the reference bytes.
    const alone = tmpOut();
    stubPlainFetch();
    await main(["--list", writeList(alone, [`${PLAIN_URL}\tex-terms`]), "--out", alone], {}, { delayMs: 0 });
    const reference = snapshot(alone, "ex-terms");

    const fetched = stubPlainFetch();
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    const list = writeList(out, [`${PLAIN_URL}\tex-terms`, `${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    expect(await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 })).toBe(0);

    expect(snapshot(out, "ex-terms")).toEqual(reference);
    expect(fetched).toEqual([PLAIN_URL]); // the js URL never went through fetch
    expect(fake.gotos.map((g) => g.url)).toEqual([ENTRY.url]);

    expect(readFileSync(join(out, "ex-identity.html"), "utf8")).toBe(RENDERED);
    expect(readFileSync(join(out, "ex-identity.txt"), "utf8")).toBe(
      "Identity\nIdentity verification\nUpload a document & a selfie\n",
    );
    const raw = readFileSync(join(out, "ex-identity.meta.json"), "utf8");
    const meta = JSON.parse(raw);
    expect(raw).toBe(`${JSON.stringify(meta, null, 2)}\n`);
    expect(Object.keys(meta)).toEqual([
      "url",
      "slug",
      "fetchedAt",
      "status",
      "contentType",
      "byteLength",
      "sha256",
      "truncated",
      "error",
      "bodyPath",
      "textPath",
      "renderedWith",
      "networkIdle",
      "changed",
      "firstFetch",
      "previousSha256",
      "note",
    ]);
    expect(meta).toMatchObject({
      url: ENTRY.url,
      fetchedAt: "2026-09-29T05:23:00.000Z",
      status: 200,
      sha256: sha256(Buffer.from(RENDERED)),
      bodyPath: "research/rendered/ex-identity.html",
      textPath: "research/rendered/ex-identity.txt",
      renderedWith: "chromium",
      networkIdle: true,
      changed: true,
    });
    expect(fake.state.launched).toBe(1);
    expect(fake.state.closed).toBe(true);
    expect(stdout.text()).toMatch(/new\s+ex-identity\s+\d+ bytes\s+text\/html; charset=utf-8\s+\[chromium\]/);
  });

  it("launches one browser for the run and gives every js URL its own context, closed after it", async () => {
    const second = "https://hub.example.test/creators";
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED }, [second]: { html: "<p>hub</p>" } });
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`, `${second}\tex-hub\tjs`]);
    await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 });

    expect(fake.launchBrowser).toHaveBeenCalledTimes(1);
    expect(fake.contexts).toHaveLength(2);
    expect(fake.contexts.every((c) => c.closed && c.pages === 1)).toBe(true);
    expect(fake.gotos.map((g) => g.url)).toEqual([ENTRY.url, second]);
    expect(fake.state.closed).toBe(true);
  });

  it("writes nothing at all when the same DOM comes back", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 });
    const before = snapshot(out);

    vi.setSystemTime(new Date("2026-10-06T05:23:00.000Z"));
    await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 });
    expect(snapshot(out)).toEqual(before);
    expect(stdout.text()).toMatch(/unchanged\s+ex-identity\s+sha256=/);
  });

  it("masks a secret-shaped string in the rendered DOM, as for a plain page", async () => {
    const key = ["sk", "test", "4eC39HqLyjWDarjtT1zdp7dc"].join("_");
    const fake = fakeBrowser({ [ENTRY.url]: { html: `<p>use ${key}</p>` } });
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 });
    expect(readFileSync(join(out, "ex-identity.html"), "utf8")).toBe("<p>use [redacted:stripe-secret-key]</p>");
    expect(JSON.parse(readFileSync(join(out, "ex-identity.meta.json"), "utf8")).redacted).toBe(1);
  });

  it("records a refused js page in the meta with renderedWith, writes no body, and exits 0", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { status: 403, statusText: "Forbidden" } });
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    expect(await main(["--list", list, "--out", out], {}, { launchBrowser: fake.launchBrowser, delayMs: 0 })).toBe(0);
    expect(readdirSync(out).sort()).toEqual(["ex-identity.meta.json", "urls.txt"]);
    expect(JSON.parse(readFileSync(join(out, "ex-identity.meta.json"), "utf8"))).toMatchObject({
      status: 403,
      error: "HTTP 403 Forbidden",
      bodyPath: null,
      renderedWith: "chromium",
      networkIdle: null,
    });
  });

  it("rewrites the meta when a line moves from plain to js, even if the bytes are the same", () => {
    const hash = sha256(Buffer.from(RENDERED));
    const plainMeta = { sha256: hash, status: 200, error: null };
    expect(bodyChanged(plainMeta, { sha256: hash, status: 200, error: null })).toBe(false);
    expect(bodyChanged(plainMeta, { sha256: hash, status: 200, error: null, renderedWith: "chromium" })).toBe(true);
    expect(bodyChanged({ ...plainMeta, renderedWith: "chromium" }, { sha256: hash, status: 200, error: null })).toBe(true);
  });

  it("skips every js line when no browser can be started: nothing written for them, plain lines stored, the count reported", async () => {
    stubPlainFetch();
    // A capture from an earlier run, which a host failure must not touch.
    const earlier = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    const first = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    await main(["--list", first, "--out", out], {}, { launchBrowser: earlier.launchBrowser, delayMs: 0 });
    const before = snapshot(out, "ex-identity");
    expect(before.map(([name]) => name)).toEqual(["ex-identity.html", "ex-identity.meta.json", "ex-identity.txt"]);

    const list = writeList(out, [
      `${ENTRY.url}\t${ENTRY.slug}\tjs`,
      `${PLAIN_URL}\tex-terms`,
      "https://hub.example.test/c\tex-hub\tjs",
    ]);

    const missing = vi.fn(async () => {
      throw Object.assign(new Error("Cannot find module 'playwright-core'"), { code: "MODULE_NOT_FOUND" });
    });
    const outputFile = join(out, "github-output");
    writeFileSync(outputFile, "");
    vi.setSystemTime(new Date("2026-10-06T05:23:00.000Z"));
    expect(await main(["--list", list, "--out", out], { GITHUB_OUTPUT: outputFile }, { launchBrowser: missing, delayMs: 0 })).toBe(0);

    expect(missing).toHaveBeenCalledTimes(1); // one attempt, not one per line
    expect(snapshot(out, "ex-identity")).toEqual(before);
    expect(readdirSync(out).filter((n) => n.startsWith("ex-hub"))).toEqual([]);
    expect(readdirSync(out)).toContain("ex-terms.meta.json");
    expect(readFileSync(outputFile, "utf8")).toBe("js_skipped=2\n");
    expect(stdout.text()).toMatch(/SKIPPED\s+ex-identity\s+js mode: playwright-core is not installed on this host \(MODULE_NOT_FOUND\)/);
    expect(stdout.text()).toMatch(/2 js line\(s\) skipped: no browser could be started/);
  });

  it("skips the remaining js lines when the browser dies mid-run, rather than blaming their sites", async () => {
    const second = "https://hub.example.test/creators";
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED }, [second]: { html: "<p>hub</p>" } });
    const crashAfterFirst = vi.fn(async () => {
      const browser = await fake.launchBrowser();
      const newContext = browser.newContext.bind(browser);
      return {
        ...browser,
        async newContext(options: Record<string, unknown>) {
          const ctx = await newContext(options);
          fake.state.closed = true; // Chromium crashed while the first page was open
          return ctx;
        },
      };
    });
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`, `${second}\tex-hub\tjs`]);
    const outputFile = join(out, "github-output");
    writeFileSync(outputFile, "");
    await main(["--list", list, "--out", out], { GITHUB_OUTPUT: outputFile }, { launchBrowser: crashAfterFirst, delayMs: 0 });

    expect(readdirSync(out).filter((n) => n.startsWith("ex-hub"))).toEqual([]);
    expect(readFileSync(outputFile, "utf8")).toBe("js_skipped=1\n");
    expect(stdout.text()).toMatch(/SKIPPED\s+ex-hub\s+js mode: the browser disconnected during the run/);
  });

  it("reports js_skipped=0 to the workflow when every js line rendered", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    const outputFile = join(out, "github-output");
    writeFileSync(outputFile, "");
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    await main(["--list", list, "--out", out], { GITHUB_OUTPUT: outputFile }, { launchBrowser: fake.launchBrowser, delayMs: 0 });
    expect(readFileSync(outputFile, "utf8")).toBe("js_skipped=0\n");
  });
});

describe("main --needs-browser — what the workflow asks before installing anything", () => {
  let stdout: ReturnType<typeof captureStdout>;
  beforeEach(() => {
    stdout = captureStdout();
  });
  afterEach(() => stdout.restore());

  it("prints js=true only when the list has a js line, and writes nothing", async () => {
    const out = tmpOut();
    const withJs = writeList(out, [`${PLAIN_URL}\tex-terms`, `${ENTRY.url}\t${ENTRY.slug}\tjs`]);
    expect(await main(["--needs-browser", "--list", withJs, "--out", out], {})).toBe(0);
    expect(stdout.text()).toBe("js=true\n");
    expect(readdirSync(out)).toEqual(["urls.txt"]);
  });

  it("prints js=false for a plain list, and reads the dispatch override like a run would", async () => {
    const out = tmpOut();
    const plain = writeList(out, [`${PLAIN_URL}\tex-terms`]);
    await main(["--needs-browser", "--list", plain], {});
    await main(["--needs-browser", "--list", plain], { RENDER_WATCH_URLS: `${ENTRY.url}\t${ENTRY.slug}\tjs` });
    expect(stdout.text()).toBe("js=false\njs=true\n");
  });
});

// ---------------------------------------------------------------------------
// What the mode must never do, pinned on the source
// ---------------------------------------------------------------------------

describe("the js mode's code — no interaction, no stored state, no disguise", () => {
  const source = readFileSync(join(ROOT, "scripts", "render-watch.mjs"), "utf8");
  const code = source
    .split("\n")
    .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
    .join("\n");

  it("calls no click, fill, type, press, login, cookie or storage API, and adds no init script", () => {
    for (const forbidden of [
      /\.click\(/,
      /\.fill\(/,
      /\.type\(/,
      /\.press\(/,
      /\.check\(/,
      /\.selectOption\(/,
      /addInitScript/,
      /addCookies/,
      /storageState/,
      /launchPersistentContext/,
      /httpCredentials/,
      /\.evaluate\(/,
    ]) {
      expect(code, String(forbidden)).not.toMatch(forbidden);
    }
  });

  it("uses no stealth plugin or anti-detection setting", () => {
    for (const forbidden of [/stealth/i, /AutomationControlled/, /webdriver/i, /ignoreHTTPSErrors/, /bypassCSP/, /--disable-blink/]) {
      expect(code, String(forbidden)).not.toMatch(forbidden);
    }
  });

  it("loads playwright-core lazily — never at the top of the module, so a plain run needs no package", () => {
    expect(source).not.toMatch(/^import .*playwright/m);
  });

  it("resolves the pinned playwright-core from this repository's devDependencies without starting a browser", async () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    const pinned = pkg.devDependencies["playwright-core"];
    expect(pinned).toMatch(/^\d+\.\d+\.\d+$/); // exact, never a range
    const pw = await loadPlaywright();
    expect(typeof pw.chromium.launch).toBe("function");
    const installed = JSON.parse(readFileSync(join(ROOT, "node_modules", "playwright-core", "package.json"), "utf8"));
    expect(installed.version).toBe(pinned);
  });
});

// ---------------------------------------------------------------------------
// The workflow
// ---------------------------------------------------------------------------

describe(".github/workflows/render-watch.yml — the browser only when a js line asks for it", () => {
  const WORKFLOW = join(ROOT, ".github", "workflows", "render-watch.yml");
  const text = readFileSync(WORKFLOW, "utf8");
  const wf = parse(text) as Record<string, any>;
  type Step = { name?: string; id?: string; if?: string; run?: string; env?: Record<string, string>; "continue-on-error"?: boolean };
  const steps: Step[] = wf.jobs.render.steps;
  const named = (prefix: string): Step => {
    const s = steps.find((x) => x.name?.startsWith(prefix));
    if (!s) throw new Error(`no step "${prefix}"`);
    return s;
  };
  const index = (s: Step) => steps.indexOf(s);

  it("keeps the one permission it had: write contents, for the commit back", () => {
    expect(wf.permissions).toEqual({ contents: "write" });
    expect(wf.jobs.render.permissions).toBeUndefined();
  });

  it("asks the script whether the list has a js line, with the same override a run uses", () => {
    const ask = named("Does the list need a browser");
    expect(ask.id).toBe("mode");
    expect(ask.run).toMatch(/node scripts\/render-watch\.mjs --needs-browser >> "\$GITHUB_OUTPUT"/);
    expect(ask.env?.RENDER_WATCH_URLS).toBe("${{ inputs.urls }}");
  });

  it("installs playwright-core and Chromium only when it does, at the version package.json pins, outside the checkout", () => {
    const install = named("Install the browser for js lines");
    expect(install.if).toBe("steps.mode.outputs.js == 'true'");
    expect(install["continue-on-error"]).toBe(true);
    expect(install.run).toMatch(/devDependencies\["playwright-core"\]/);
    expect(install.run).toMatch(/\^\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$/); // refuses a range
    expect(install.run).toMatch(/npm install --prefix "\$RUNNER_TEMP\/render-watch-js"[^\n]*--ignore-scripts[^\n]*"playwright-core@\$\{PW_VERSION\}"/);
    expect(install.run).toMatch(/cli\.js" install --with-deps --only-shell chromium/);
    expect(install.run).not.toMatch(/\$\{\{/); // nothing interpolated into the script
    expect(index(install)).toBeGreaterThan(index(named("Does the list need a browser")));
    expect(index(install)).toBeLessThan(index(named("Fetch the pages")));
  });

  it("points the fetch step at the installed package and lets it report skipped js lines", () => {
    const fetch = named("Fetch the pages");
    expect(fetch.id).toBe("fetch");
    expect(fetch.env?.NODE_PATH).toBe("${{ runner.temp }}/render-watch-js/node_modules");
    expect(fetch.env?.RENDER_WATCH_URLS).toBe("${{ inputs.urls }}");
  });

  it("fails the run after the commit when js lines were skipped, so the plain captures still land", () => {
    const fail = named("Fail the run if js lines could not be rendered");
    expect(index(fail)).toBe(steps.length - 1);
    expect(index(fail)).toBeGreaterThan(index(named("Commit the fetched pages")));
    expect(fail.if).toBe("steps.fetch.outputs.js_skipped != '' && steps.fetch.outputs.js_skipped != '0'");
    const run = (skipped: string) =>
      spawnSync("bash", ["-c", fail.run!], { env: { ...process.env, JS_SKIPPED: skipped }, encoding: "utf8" });
    const failed = run("2");
    expect(failed.status).toBe(1);
    expect(failed.stderr + failed.stdout).toMatch(/2 js line\(s\)/);
    expect(fail.env?.JS_SKIPPED).toBe("${{ steps.fetch.outputs.js_skipped }}");
  });

  it("documents the mode in the header comment and in research/rendered/README.md", () => {
    expect(text).toMatch(/JavaScript-capable render mode/);
    expect(text).toMatch(/tiktok\.com/);
    const readme = readFileSync(join(ROOT, "research", "rendered", "README.md"), "utf8");
    expect(readme).toMatch(/## The js flag: a JavaScript-capable render/);
    expect(readme).toMatch(/scripts\/queue-zero-test\.mjs --js --terms/);
  });
});
