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
  chromiumLaunchOptions,
  fetchOne,
  isTikTokHost,
  launchChromium,
  loadPlaywright,
  main,
  MAX_BYTES,
  MAX_REDIRECTS,
  parseUrlList,
  renderWithBrowser,
  sha256,
  TERMS_BARRED,
  TERMS_BARRED_HOST_RESOLVER_RULES,
  TIKTOK_HOST_RESOLVER_RULES,
  tiktokHostInChain,
  tiktokRedirectError,
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
    // Tick 21's terms audits paused 141 lines (sites whose terms bar or were not read), leaving about 60 active.
    expect(entries.length).toBeGreaterThan(40);
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

  // Row 16(d) was ruled on 30.9.2026: no tiktok.com fetch ever (RULING-2026-09-30-video.md 16(d) D2(i)).
  it("names the pause and the ruling in the refusal", () => {
    expect(() => parseUrlList("https://www.tiktok.com/")).toThrow(
      /CHANNEL_LOOP\.md §9.*ruled: research\/channel-loop\/RULING-2026-09-30-video\.md 16\(d\) D2/s,
    );
    // The redirect refusal is the same rule, D2(i), and no text in the script still calls row 16(d) pending.
    expect(tiktokRedirectError("www.tiktok.com")).toContain("ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(i)");
    expect(readFileSync(join(ROOT, "scripts", "render-watch.mjs"), "utf8")).not.toMatch(/FABLE_QUEUE\.md row 16\(d\)/);
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
  /** Main-frame navigation requests the page makes during goto (a server redirect chain, in order). */
  mainFrameNavigations?: string[];
  /** Navigation requests of a child frame (an embed) during goto. */
  childFrameNavigations?: string[];
  /** A main-frame navigation the page's own script starts while the network settles. */
  navigatesDuringIdle?: string;
  /** The final response's URL and the URLs that redirected to it, first to last (a resolver rule that did not apply). */
  responseUrl?: string;
  redirectedFrom?: string[];
  /** page.content() never settles: a script spinning on the main thread. */
  contentHangs?: boolean;
  /** Chromium dies during this navigation. */
  crashesDuringGoto?: boolean;
}

interface FakeContext {
  options: Record<string, unknown>;
  closed: boolean;
  onClose: Array<() => void>;
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
      const ctx: FakeContext = { options, closed: false, onClose: [], routes: [], wsRoutes: [], pages: 0 };
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
          const mainFrame = { name: "main" };
          const childFrame = { name: "child" };
          const listeners: Array<(request: unknown) => void> = [];
          const emit = (url: string, frame: object) => {
            const request = { url: () => url, isNavigationRequest: () => true, frame: () => frame };
            for (const listener of listeners) listener(request);
          };
          return {
            on(event: string, listener: (request: unknown) => void) {
              if (event === "request") listeners.push(listener);
            },
            mainFrame: () => mainFrame,
            async goto(url: string, options: unknown) {
              gotos.push({ url, options });
              spec = pages[url] ?? {};
              for (const hop of spec.mainFrameNavigations ?? []) emit(hop, mainFrame);
              for (const hop of spec.childFrameNavigations ?? []) emit(hop, childFrame);
              if (spec.crashesDuringGoto) {
                state.closed = true;
                throw new Error("page.goto: Target page, context or browser has been closed\nCall log:\n  - ...");
              }
              if (spec.gotoError) throw spec.gotoError;
              if (spec.noResponse) return null;
              const status = spec.status ?? 200;
              // request().redirectedFrom() walks back from the final request, as Playwright's does.
              const chain = [...(spec.redirectedFrom ?? []), spec.responseUrl ?? url];
              const requestAt = (i: number): unknown =>
                i < 0 ? null : { url: () => chain[i], redirectedFrom: () => requestAt(i - 1) };
              return {
                url: () => spec.responseUrl ?? url,
                request: () => requestAt(chain.length - 1),
                status: () => status,
                statusText: () => spec.statusText ?? "",
                ok: () => status >= 200 && status < 300,
                headers: () =>
                  spec.contentType === null ? {} : { "content-type": spec.contentType ?? "text/html; charset=utf-8" },
              };
            },
            async waitForLoadState(loadState: string, options: { timeout: number }) {
              waits.push({ state: loadState, options });
              if (spec.navigatesDuringIdle) emit(spec.navigatesDuringIdle, mainFrame);
              if (spec.idle === "timeout") throw playwrightTimeout("page.waitForLoadState: Timeout exceeded.");
            },
            content() {
              if (spec.contentHangs) {
                // Settles only when its context is closed, as Playwright's does ("Target closed").
                return new Promise<string>((_resolve, reject) => {
                  ctx.onClose.push(() => reject(new Error("page.content: Target page, context or browser has been closed")));
                });
              }
              return Promise.resolve(spec.html ?? "");
            },
          };
        },
        async close() {
          ctx.closed = true;
          for (const fn of ctx.onClose) fn();
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

  it("aborts every request to tiktok.com a page starts itself — a subresource, an embed, a WebSocket", async () => {
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
      url: () => "wss://webcast.tiktok.com/ws",
      close: async (options: unknown) => closed.push(options),
      connectToServer: () => {
        connected = true;
      },
    });
    expect(connected).toBe(false);
    expect(closed).toEqual([{ code: 1008, reason: "render-watch never contacts tiktok.com" }]);
  });

  it("aborts every request, and closes every WebSocket, a page starts to a host whose terms bar automated access", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED } });
    await renderWithBrowser(ENTRY, { browser: fake.browser });
    const { matcher, handler } = fake.contexts[0].routes[0];
    const matches = matcher as (url: URL) => boolean;
    for (const url of ["https://www.google.com/recaptcha/api.js", "https://www.youtube.com/embed/x", "https://seller.gumroad.com/l/x", "https://WWW.GUMROAD.COM./x"]) {
      expect(matches(new URL(url)), url).toBe(true);
    }
    expect(matches(new URL("https://chromium.googlesource.com/x"))).toBe(false);
    expect(matches(new URL("https://cdn.example.test/x.js"))).toBe(false);
    const aborted: string[] = [];
    await handler({ abort: async (code: string) => aborted.push(code) });
    expect(aborted).toEqual(["blockedbyclient"]);

    const ws = fake.contexts[0].wsRoutes[0];
    expect((ws.matcher as (url: URL) => boolean)(new URL("wss://www.youtube.com/live"))).toBe(true);
    const closed: unknown[] = [];
    await ws.handler({ url: () => "wss://www.youtube.com/live", close: async (options: unknown) => closed.push(options), connectToServer: () => {} });
    expect(closed).toEqual([{ code: 1008, reason: "render-watch never contacts youtube.com: its terms bar automated access" }]);
    expect(Buffer.byteLength((closed[0] as { reason: string }).reason)).toBeLessThanOrEqual(123);
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

  it("stores nothing when the listed page redirects to tiktok.com, and says so instead of 'name not resolved'", async () => {
    // The resolver rule makes the redirect target fail to resolve; the request event names the host.
    const fake = fakeBrowser({
      [ENTRY.url]: {
        mainFrameNavigations: [ENTRY.url, "https://www.tiktok.com/@someone?lang=en"],
        gotoError: new Error(`page.goto: net::ERR_NAME_NOT_RESOLVED at ${ENTRY.url}\nCall log:\n  - ...`),
      },
    });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toEqual({
      status: null,
      contentType: null,
      bytes: null,
      truncated: false,
      error: tiktokRedirectError("www.tiktok.com"),
      renderedWith: "chromium",
      networkIdle: null,
    });
    expect(result.error).toMatch(/redirected to tiktok\.com \(www\.tiktok\.com\); not followed.*CHANNEL_LOOP\.md §9/);
    expect(fake.contexts[0].closed).toBe(true);
  });

  it("stores nothing when a redirect chain did reach tiktok.com (a resolver rule that did not apply)", async () => {
    const fake = fakeBrowser({
      [ENTRY.url]: { html: "<p>TIKTOK PAGE</p>", responseUrl: "https://www.tiktok.com./landing", redirectedFrom: [ENTRY.url] },
    });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toMatchObject({ bytes: null, error: tiktokRedirectError("www.tiktok.com.") });
    expect(fake.waits).toHaveLength(0); // refused before the page was waited on or read
  });

  it("finds tiktok.com anywhere in a response's redirect chain, and nowhere else", () => {
    const response = (urls: string[]) => {
      const at = (i: number): unknown => (i < 0 ? null : { url: () => urls[i], redirectedFrom: () => at(i - 1) });
      return { url: () => urls[urls.length - 1], request: () => at(urls.length - 1) };
    };
    expect(tiktokHostInChain(response(["https://a.example/", "https://vm.tiktok.com/x", "https://b.example/"]))).toBe("vm.tiktok.com");
    expect(tiktokHostInChain(response(["https://a.example/", "https://b.example/"]))).toBeNull();
    expect(tiktokHostInChain(response(["https://nottiktok.com/"]))).toBeNull();
  });

  it("stores nothing when the page's own script moves it to tiktok.com while the network settles", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED, navigatesDuringIdle: "https://m.tiktok.com/v/1" } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toMatchObject({ bytes: null, error: tiktokRedirectError("m.tiktok.com") });
  });

  it("still stores a page that merely embeds tiktok.com: a child frame's navigation is blocked, not the page", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED, childFrameNavigations: ["https://www.tiktok.com/embed/v2/1"] } });
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser });
    expect(result).toMatchObject({ error: null, bytes: Buffer.from(RENDERED) });
  });

  it("reads the DOM inside the time left: a page whose content() never returns is closed and recorded as a timeout", async () => {
    const fake = fakeBrowser({ [ENTRY.url]: { html: RENDERED, contentHangs: true } });
    const started = Date.now();
    const result = await renderWithBrowser(ENTRY, { browser: fake.browser, timeoutMs: 60 });
    expect(Date.now() - started).toBeLessThan(2_000);
    expect(result).toEqual({
      status: 200,
      contentType: "text/html; charset=utf-8",
      bytes: null,
      truncated: false,
      error: "timeout after 60ms (the rendered page could not be read within the time left)",
      renderedWith: "chromium",
      networkIdle: null,
    });
    expect(fake.contexts[0].closed).toBe(true); // closing the context is what releases the hung call
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

describe("chromiumLaunchOptions — exactly what Chromium is started with", () => {
  it("is headless with one argument: every tiktok.com name, with or without a trailing dot, fails to resolve", () => {
    expect(TIKTOK_HOST_RESOLVER_RULES).toBe(
      "MAP tiktok.com ~NOTFOUND, MAP *.tiktok.com ~NOTFOUND, MAP tiktok.com. ~NOTFOUND, MAP *.tiktok.com. ~NOTFOUND",
    );
    expect(chromiumLaunchOptions()).toEqual({
      headless: true,
      args: [`--host-resolver-rules=${TIKTOK_HOST_RESOLVER_RULES}, ${TERMS_BARRED_HOST_RESOLVER_RULES}`],
    });
  });

  it("makes every TERMS_BARRED name fail to resolve too, so a redirect there is never requested (ruling 30.9 16(d) D2(ii))", () => {
    const rules = String(TERMS_BARRED_HOST_RESOLVER_RULES).split(", ");
    expect(rules).toHaveLength(TERMS_BARRED.length * 4);
    for (const { domain } of TERMS_BARRED as Array<{ domain: string }>) {
      for (const name of [domain, `*.${domain}`, `${domain}.`, `*.${domain}.`]) expect(rules, name).toContain(`MAP ${name} ~NOTFOUND`);
    }
    expect(rules).toContain("MAP *.gumroad.com ~NOTFOUND");
    expect(rules).toContain("MAP *.google.com ~NOTFOUND");
    // googlesource.com left TERMS_BARRED on 30.9, so it resolves.
    expect(rules.some((r) => r.includes("googlesource"))).toBe(false);
  });

  it("is what launchChromium passes to chromium.launch, and nothing else", async () => {
    const launches: unknown[] = [];
    const browser = { marker: "browser" };
    const load = async () => ({
      chromium: {
        launch: async (options: unknown) => {
          launches.push(options);
          return browser;
        },
      },
    });
    expect(await launchChromium({ load })).toBe(browser);
    expect(launches).toEqual([chromiumLaunchOptions()]);
  });
});

// ---------------------------------------------------------------------------
// fetchOne — the plain mode follows redirects by hand, never to tiktok.com
// ---------------------------------------------------------------------------

describe("fetchOne — redirects followed by hand, a tiktok.com hop refused before it is requested", () => {
  const LISTED = { url: "https://short.example/go", slug: "short-go", lineNumber: 1 };
  type Hop = { status: number; location?: string; body?: string; contentType?: string };

  function stubChain(hops: Record<string, Hop>) {
    const calls: Array<{ url: string; init: Record<string, unknown> }> = [];
    const fetchImpl = async (url: string, init: Record<string, unknown>) => {
      calls.push({ url, init });
      const hop = hops[url];
      if (!hop) throw new TypeError(`fetch failed (the stub has no ${url})`);
      const headers: Record<string, string> = { "content-type": hop.contentType ?? "text/html; charset=utf-8" };
      if (hop.location) headers.location = hop.location;
      return new Response(hop.body ?? null, { status: hop.status, headers });
    };
    return { calls, fetchImpl };
  }

  it("follows a relative redirect with the same headers, asks fetch not to follow, and returns the final page", async () => {
    const { calls, fetchImpl } = stubChain({
      [LISTED.url]: { status: 301, location: "/landing?x=1" },
      "https://short.example/landing?x=1": { status: 200, body: "<p>final</p>" },
    });
    const result = await fetchOne(LISTED, { fetchImpl });
    expect(result).toEqual({
      status: 200,
      contentType: "text/html; charset=utf-8",
      bytes: Buffer.from("<p>final</p>"),
      truncated: false,
      error: null,
    });
    expect(calls.map((c) => c.url)).toEqual([LISTED.url, "https://short.example/landing?x=1"]);
    for (const call of calls) {
      expect(call.init.redirect).toBe("manual");
      expect(call.init.headers).toEqual(calls[0].init.headers);
      expect((call.init.headers as Record<string, string>)["user-agent"]).toBe(USER_AGENT);
    }
  });

  it("refuses a hop to tiktok.com in any spelling, before requesting it, and records the redirect's status", async () => {
    for (const [location, host] of [
      ["https://www.tiktok.com/@someone", "www.tiktok.com"],
      ["https://WWW.TikTok.com./legal", "www.tiktok.com."],
      ["//vm.tiktok.com/ZMabc/", "vm.tiktok.com"],
      ["http://tiktok.com:443/", "tiktok.com"],
    ]) {
      const { calls, fetchImpl } = stubChain({ [LISTED.url]: { status: 302, location } });
      const result = await fetchOne(LISTED, { fetchImpl });
      expect(result, location).toEqual({
        status: 302,
        contentType: "text/html; charset=utf-8",
        bytes: null,
        truncated: false,
        error: tiktokRedirectError(host),
      });
      expect(calls.map((c) => c.url), location).toEqual([LISTED.url]); // TikTok itself was never asked
    }
  });

  it("refuses a tiktok.com hop further down a chain (a shortener behind a shortener)", async () => {
    const { calls, fetchImpl } = stubChain({
      [LISTED.url]: { status: 307, location: "https://second.example/r" },
      "https://second.example/r": { status: 308, location: "https://m.tiktok.com/v/1" },
    });
    const result = await fetchOne(LISTED, { fetchImpl });
    expect(result).toMatchObject({ status: 308, bytes: null, error: tiktokRedirectError("m.tiktok.com") });
    expect(calls.map((c) => c.url)).toEqual([LISTED.url, "https://second.example/r"]);
  });

  it(`follows at most MAX_REDIRECTS (${20}) hops, the Fetch standard's own limit`, async () => {
    const hops: Record<string, Hop> = {};
    for (let i = 0; i <= MAX_REDIRECTS + 1; i += 1) {
      hops[i === 0 ? LISTED.url : `https://short.example/${i}`] = { status: 302, location: `https://short.example/${i + 1}` };
    }
    const { calls, fetchImpl } = stubChain(hops);
    const result = await fetchOne(LISTED, { fetchImpl });
    expect(MAX_REDIRECTS).toBe(20);
    expect(result).toMatchObject({ status: 302, bytes: null, error: "more than 20 redirects; not followed" });
    expect(calls).toHaveLength(MAX_REDIRECTS + 1);
  });

  it("records a 3xx with no Location as the answer, as before, and refuses a non-http(s) Location", async () => {
    const plain = stubChain({ [LISTED.url]: { status: 301 } });
    expect(await fetchOne(LISTED, { fetchImpl: plain.fetchImpl })).toMatchObject({ status: 301, error: "HTTP 301", bytes: null });
    const ftp = stubChain({ [LISTED.url]: { status: 302, location: "ftp://files.example/x" } });
    expect(await fetchOne(LISTED, { fetchImpl: ftp.fetchImpl })).toMatchObject({
      status: 302,
      error: "HTTP 302 redirect to a ftp: URL; not followed",
    });
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

/**
 * Since 30.9 every run reads a host's robots.txt with a plain GET before its first page, js lines included
 * (ruling 30.9 16(d) D2(v); src/__tests__/revenue/render-watch-robots.test.ts). The default for these tests:
 * every robots.txt answers 404 (no rules), and anything else fetch is asked for fails, so no test reaches the
 * network. A test that needs plain pages stubs fetch itself.
 */
function stubNoRobots() {
  const calls: string[] = [];
  vi.stubGlobal("fetch", async (url: string) => {
    calls.push(String(url));
    if (new URL(String(url)).pathname === "/robots.txt") return new Response(null, { status: 404 });
    throw new TypeError(`fetch failed (the test stub has no ${url})`);
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
    stubNoRobots();
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
    // The js URL never went through fetch; only its host's robots.txt did, read before the browser was asked.
    expect(fetched).toEqual(["https://example.test/robots.txt", PLAIN_URL, "https://support.example.test/robots.txt"]);
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
      "robots",
      "robotsUrl",
      "changed",
      "firstFetch",
      "previousSha256",
      "note",
    ]);
    expect(meta).toMatchObject({
      robots: "allowed",
      robotsUrl: "https://support.example.test/robots.txt",
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
    expect(stdout.text()).toMatch(/2 js line\(s\) skipped: the browser was unavailable/);
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

  it("writes nothing for the line that was rendering when the browser died, nor for the ones after it", async () => {
    const second = "https://hub.example.test/creators";
    const fake = fakeBrowser({ [ENTRY.url]: { crashesDuringGoto: true }, [second]: { html: "<p>hub</p>" } });
    const list = writeList(out, [`${ENTRY.url}\t${ENTRY.slug}\tjs`, `${second}\tex-hub\tjs`]);
    const outputFile = join(out, "github-output");
    writeFileSync(outputFile, "");
    await main(["--list", list, "--out", out], { GITHUB_OUTPUT: outputFile }, { launchBrowser: fake.launchBrowser, delayMs: 0 });

    expect(readdirSync(out).sort()).toEqual(["github-output", "urls.txt"]); // no meta blaming either site
    expect(readFileSync(outputFile, "utf8")).toBe("js_skipped=2\n");
    expect(stdout.text()).toMatch(/SKIPPED\s+ex-identity\s+js mode: the browser disconnected during the run/);
    expect(stdout.text()).toMatch(/SKIPPED\s+ex-hub\s+js mode: the browser disconnected during the run/);
    expect(stdout.text()).not.toMatch(/could not be fetched\.\s*$|1 could not be fetched/);
    expect(fake.launchBrowser).toHaveBeenCalledTimes(1);
  });

  it("records a plain line that redirects to tiktok.com as a refusal: the redirect's status, no body, exit 0", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      calls.push(String(url));
      if (new URL(String(url)).pathname === "/robots.txt") return new Response(null, { status: 404 });
      return new Response(null, { status: 302, headers: { location: "https://www.tiktok.com/@someone" } });
    });
    const list = writeList(out, ["https://link.example.test/bio\tex-bio"]);
    expect(await main(["--list", list, "--out", out], {}, { delayMs: 0 })).toBe(0);
    // The listed host's robots.txt, then the page; nothing at all to tiktok.com, not even its robots.txt.
    expect(calls).toEqual(["https://link.example.test/robots.txt", "https://link.example.test/bio"]);
    expect(readdirSync(out).sort()).toEqual(["ex-bio.meta.json", "urls.txt"]);
    const meta = JSON.parse(readFileSync(join(out, "ex-bio.meta.json"), "utf8"));
    expect(meta).toMatchObject({ status: 302, bodyPath: null, sha256: null, error: tiktokRedirectError("www.tiktok.com") });
    expect("renderedWith" in meta).toBe(false);
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
    for (const forbidden of [
      /stealth/i,
      /AutomationControlled/,
      /webdriver/i,
      /ignoreHTTPSErrors/,
      /bypassCSP/,
      /--disable-blink/,
      /disable-web-security/,
      /disable-site-isolation/,
    ]) {
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
  type Step = {
    name?: string;
    id?: string;
    if?: string;
    uses?: string;
    with?: Record<string, unknown>;
    run?: string;
    env?: Record<string, string>;
    "continue-on-error"?: boolean;
    "timeout-minutes"?: number;
  };
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

  it("bounds the job at 30 minutes, so a hang costs half an hour and not six", () => {
    expect(wf.jobs.render["timeout-minutes"]).toBe(30);
  });

  it("leaves no write token in the checkout, and gives it only to the pull and the push", () => {
    const checkout = steps.find((x) => x.uses?.startsWith("actions/checkout@"));
    expect(checkout?.with?.["persist-credentials"]).toBe(false);
    const withToken = steps.filter((x) => JSON.stringify(x).includes("github.token") || JSON.stringify(x).includes("secrets."));
    expect(withToken.map((x) => x.name)).toEqual([
      "Move to the branch tip before fetching",
      "Commit the fetched pages back to this branch",
    ]);
    expect(wf.jobs.render.env).toBeUndefined();
    expect(wf.env).toBeUndefined();
    // The step that runs third-party JavaScript comes after the pull and before the push.
    const fetchStep = named("Fetch the pages");
    expect(index(fetchStep)).toBeGreaterThan(index(withToken[0]));
    expect(index(fetchStep)).toBeLessThan(index(withToken[1]));
  });

  it("hands git the same header actions/checkout would have written, through the environment", () => {
    const snippets = [named("Move to the branch tip"), named("Commit the fetched pages")].map((step) => {
      const run = step.run!;
      const from = run.indexOf("AUTH=$(");
      const to = run.indexOf("\n", run.indexOf("export GIT_CONFIG_COUNT=1"));
      expect(from, step.name).toBeGreaterThan(-1);
      expect(run.search(/^\s*git /m), step.name).toBeGreaterThan(to); // before any git command runs
      expect(step.env?.GH_TOKEN).toBe("${{ github.token }}");
      return run.slice(from, to);
    });
    expect(snippets[0]).toBe(snippets[1]);
    const ran = spawnSync("bash", ["-c", `set -euo pipefail\n${snippets[0]}\ngit config --get http.https://github.com/.extraheader`], {
      env: { ...process.env, GH_TOKEN: "test-token" },
      encoding: "utf8",
    });
    expect(ran.status).toBe(0);
    const lines = ran.stdout.trim().split("\n");
    const expected = Buffer.from("x-access-token:test-token").toString("base64");
    expect(lines[0]).toBe(`::add-mask::${expected}`);
    expect(lines.at(-1)).toBe(`AUTHORIZATION: basic ${expected}`);
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

  // Tick 35: every run names the captures it just stored that are not read pages (tick 33 found two active lines
  // answering with bot challenges for days, by hand).
  const CHECK = "Name the captures this run stored that are not read pages";

  it("runs capture-check on the captures this run stored, between the fetch and the commit, into the job summary", () => {
    const check = named(CHECK);
    expect(check.name).toMatch(/\(capture-check\)$/);
    expect(index(check)).toBe(index(named("Fetch the pages")) + 1);
    expect(index(named("Commit the fetched pages"))).toBe(index(check) + 1);
    expect(check.run).toMatch(/^node scripts\/capture-check\.mjs --changed --summary >> "\$GITHUB_STEP_SUMMARY" \\\n/);
    // Runs exactly when the commit step does (no `if`), with nothing interpolated and no token.
    expect(check.if).toBeUndefined();
    expect(check.env).toBeUndefined();
    expect(check.run).not.toMatch(/\$\{\{/);
    expect(JSON.stringify(check)).not.toMatch(/github\.token|secrets\./);
  });

  it("the check writes only the job summary: no git command, no other redirect, nothing under research/", () => {
    const run = named(CHECK).run!;
    expect(run).not.toMatch(/\bgit\b/);
    expect(run).not.toMatch(/research\//);
    expect(run.replace('>> "$GITHUB_STEP_SUMMARY"', "")).not.toMatch(/>/);
  });

  it("cannot fail the job: continue-on-error, a short timeout, and every exit of capture-check is an answer", () => {
    const check = named(CHECK);
    expect(check["continue-on-error"]).toBe(true);
    expect(check["timeout-minutes"]).toBeGreaterThan(0);
    expect(check["timeout-minutes"]).toBeLessThanOrEqual(5);
    const dir = mkdtempSync(join(tmpdir(), "render-watch-check-"));
    try {
      // A stand-in for node on PATH: prints a summary line and exits with the code the case asks for.
      writeFileSync(join(dir, "node"), '#!/bin/sh\necho "fake summary line"\nexit "$FAKE_EXIT"\n', { mode: 0o755 });
      // bash -e: what GitHub runs a `run:` block with when no shell is named.
      const run = (code: number, summary: string) =>
        spawnSync("bash", ["-e", "-c", check.run!], {
          cwd: ROOT,
          env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, FAKE_EXIT: String(code), GITHUB_STEP_SUMMARY: summary },
          encoding: "utf8",
        });
      for (const code of [0, 3]) {
        const summary = join(dir, `summary-${code}.md`);
        const r = run(code, summary);
        expect(r.status, `capture-check exit ${code}`).toBe(0);
        expect(r.stdout + r.stderr).not.toMatch(/::warning/);
        expect(readFileSync(summary, "utf8")).toBe("fake summary line\n");
      }
      for (const code of [1, 2, 127, 137]) {
        const r = run(code, join(dir, `summary-${code}.md`));
        expect(r.status, `capture-check exit ${code}`).toBe(0);
        expect(r.stdout).toMatch(new RegExp(`^::warning title=capture-check::capture-check exited ${code}, not 0 or 3`, "m"));
      }
      // A summary file that cannot be written (the redirect itself fails): a warning, and still exit 0.
      const unwritable = run(0, join(dir, "no-such-dir", "summary.md"));
      expect(unwritable.status).toBe(0);
      expect(unwritable.stdout).toMatch(/^::warning title=capture-check::capture-check exited 1,/m);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("research/rendered/README.md step 0 says the run's job summary now lists the flagged captures", () => {
    const readme = readFileSync(join(ROOT, "research", "rendered", "README.md"), "utf8");
    const step0 = readme.split("\n").find((l) => l.startsWith("0. "));
    expect(step0).toMatch(/node scripts\/capture-check\.mjs <slug\.\.\.>/);
    expect(step0).toMatch(/--changed --summary/);
    expect(step0).toMatch(/job summary lists the flagged ones/);
  });

  it("documents the mode in the header comment and in research/rendered/README.md", () => {
    expect(text).toMatch(/JavaScript-capable render mode/);
    expect(text).toMatch(/tiktok\.com/);
    const readme = readFileSync(join(ROOT, "research", "rendered", "README.md"), "utf8");
    expect(readme).toMatch(/## The js flag: a JavaScript-capable render/);
    expect(readme).toMatch(/scripts\/queue-zero-test\.mjs --js --terms/);
  });
});
