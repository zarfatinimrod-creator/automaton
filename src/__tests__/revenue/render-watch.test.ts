import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as apify-runs.mjs)
import {
  buildMeta,
  decodeEntities,
  extensionFor,
  extractText,
  hasChanged,
  isHtml,
  main,
  MAX_BYTES,
  parseUrlList,
  readCappedBody,
  redactSecrets,
  resolveListText,
  sha256,
  slugFromUrl,
  TIMEOUT_MS,
} from "../../../scripts/render-watch.mjs";

/**
 * scripts/render-watch.mjs fetches, from a host with egress, the pages three
 * measurements in research/measurements/ say would settle their verdicts. These
 * tests pin the pure parts — the fetch itself is not exercised here and must not
 * be: this container is egress-blocked, so a real run would only record 403s.
 *
 * What is worth pinning, and why:
 *   - the list parser, because a slug collision would have one captured page
 *     silently overwrite another and nobody would notice for a week
 *   - the text extractor, because the extraction is what a later session actually
 *     reads to grade a claim [RENDERED]
 *   - the meta shape and changed-detection, because the workflow commits only when
 *     something changed, and a `changed` that is always true would commit noise
 *     every week while one that is always false would silently stop capturing
 */

const FIXTURE_LIST = [
  "# a comment line",
  "",
  "   # an indented comment",
  "https://freemius.com/help/documentation/selling-with-freemius/supported-countries/\tfreemius-supported-countries",
  "https://api.apify.com/v2/store?search=accessibility\tapify-store-accessibility",
  "https://govi.co.il/",
  "",
].join("\n");

describe("parseUrlList", () => {
  it("reads URLs, drops comments and blank lines, and keeps the tab-separated slug", () => {
    const entries = parseUrlList(FIXTURE_LIST);
    expect(entries).toEqual([
      {
        url: "https://freemius.com/help/documentation/selling-with-freemius/supported-countries/",
        slug: "freemius-supported-countries",
        lineNumber: 4,
      },
      {
        url: "https://api.apify.com/v2/store?search=accessibility",
        slug: "apify-store-accessibility",
        lineNumber: 5,
      },
      { url: "https://govi.co.il/", slug: "govi-co-il", lineNumber: 6 },
    ]);
  });

  it("treats only a whole line as a comment — a `#` inside a URL is a fragment", () => {
    const entries = parseUrlList("https://example.com/page#pricing\texample-pricing");
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://example.com/page#pricing");
  });

  it("accepts any whitespace as the separator, because a dispatch input cannot carry a tab", () => {
    const entries = parseUrlList("https://example.com/a    my-slug");
    expect(entries[0]).toMatchObject({ url: "https://example.com/a", slug: "my-slug" });
  });

  it("tolerates CRLF and a byte-order mark", () => {
    const entries = parseUrlList("﻿# header\r\nhttps://example.com/a\tone\r\n");
    expect(entries).toEqual([{ url: "https://example.com/a", slug: "one", lineNumber: 2 }]);
  });

  it("returns nothing for an empty or comment-only list", () => {
    expect(parseUrlList("")).toEqual([]);
    expect(parseUrlList("# nothing here\n\n")).toEqual([]);
    expect(parseUrlList(null)).toEqual([]);
  });

  // The one that actually matters. Two lines sharing a slug would silently
  // overwrite each other's stored page and the loss would be invisible.
  it("refuses two lines claiming the same slug, and names both lines", () => {
    const list = ["https://example.com/a\tsame", "https://example.com/b\tsame"].join("\n");
    expect(() => parseUrlList(list)).toThrow(/slug "same" is already used on line 1/);
  });

  it("refuses a line that is not an http(s) URL", () => {
    expect(() => parseUrlList("ftp://example.com/x")).toThrow(/not an http\(s\) URL/);
    expect(() => parseUrlList("just some prose")).toThrow(/not an http\(s\) URL/);
    expect(() => parseUrlList("/etc/passwd")).toThrow(/not an http\(s\) URL/);
  });

  it("refuses a slug that would escape the output directory or break a file name", () => {
    expect(() => parseUrlList("https://example.com/a\t../escape")).toThrow(/not usable as a file name/);
    expect(() => parseUrlList("https://example.com/a\tsub/dir")).toThrow(/not usable as a file name/);
    expect(() => parseUrlList("https://example.com/a\tUPPER")).toThrow(/not usable as a file name/);
  });

  it("refuses more than one word after the URL rather than guessing which is the slug", () => {
    expect(() => parseUrlList("https://example.com/a\tone two")).toThrow(/a slug is one word/);
  });
});

describe("slugFromUrl", () => {
  it("derives a deterministic, filesystem-safe slug", () => {
    expect(slugFromUrl("https://govi.co.il/")).toBe("govi-co-il");
    expect(slugFromUrl("https://mr.gov.il/ilgstorefront/he/")).toBe("mr-gov-il-ilgstorefront-he");
  });

  it("keeps the query string, because two searches are two different pages", () => {
    expect(slugFromUrl("https://api.apify.com/v2/store?search=accessibility")).toBe(
      "api-apify-com-v2-store-search-accessibility",
    );
    expect(slugFromUrl("https://api.apify.com/v2/store?search=israel")).not.toBe(
      slugFromUrl("https://api.apify.com/v2/store?search=accessibility"),
    );
  });

  it("drops the fragment and caps the length", () => {
    expect(slugFromUrl("https://example.com/a#section")).toBe("example-com-a");
    expect(slugFromUrl(`https://example.com/${"x".repeat(300)}`).length).toBeLessThanOrEqual(80);
  });

  it("never returns an empty slug", () => {
    expect(slugFromUrl("https://")).toBe("page");
  });
});

describe("extensionFor / isHtml", () => {
  it("maps the content types this list actually returns", () => {
    expect(extensionFor("text/html; charset=UTF-8")).toBe("html");
    expect(extensionFor("application/json")).toBe("json");
    expect(extensionFor("application/pdf")).toBe("pdf");
    expect(extensionFor("application/xhtml+xml")).toBe("html");
    expect(extensionFor("text/xml")).toBe("xml");
    expect(extensionFor("text/plain")).toBe("txt");
  });

  it("falls back to bin for anything unrecognised or absent", () => {
    expect(extensionFor("image/png")).toBe("bin");
    expect(extensionFor(null)).toBe("bin");
    expect(extensionFor(undefined)).toBe("bin");
  });

  it("only calls HTML HTML", () => {
    expect(isHtml("TEXT/HTML;charset=utf-8")).toBe(true);
    expect(isHtml("application/json")).toBe(false);
    expect(isHtml(null)).toBe(false);
  });
});

describe("decodeEntities", () => {
  it("decodes the small set an extracted page needs", () => {
    expect(decodeEntities("Tom &amp; Jerry &lt;b&gt; &quot;x&quot; &#39;y&#39;")).toBe('Tom & Jerry <b> "x" \'y\'');
    expect(decodeEntities("&#8362;249")).toBe("₪249");
    expect(decodeEntities("&#x20AA;249")).toBe("₪249");
  });

  it("leaves an entity it does not know alone rather than mangling it", () => {
    expect(decodeEntities("&notanentity; stays")).toBe("&notanentity; stays");
  });
});

describe("extractText", () => {
  it("strips scripts, styles and tags and collapses whitespace", () => {
    const html = [
      "<!doctype html>",
      "<html><head><title>Supported Countries</title>",
      "<style>body{color:red}</style>",
      '<script>window.x = "<p>not text</p>";</script>',
      "</head><body>",
      "  <h1>Supported   Countries</h1>",
      "  <p>Israel is <b>supported</b>.</p>",
      "  <noscript>enable javascript</noscript>",
      "</body></html>",
    ].join("\n");

    const text = extractText(html);
    expect(text).toContain("Supported Countries");
    expect(text).toContain("Israel is supported .");
    expect(text).not.toContain("color:red");
    expect(text).not.toContain("window.x");
    expect(text).not.toContain("enable javascript");
    expect(text).not.toContain("<");
  });

  it("keeps block boundaries as line breaks so the text stays readable", () => {
    expect(extractText("<p>one</p><p>two</p>")).toBe("one\ntwo");
    expect(extractText("a<br>b")).toBe("a\nb");
    expect(extractText("<li>x</li><li>y</li>")).toBe("x\ny");
  });

  it("separates words rather than gluing them across a tag", () => {
    expect(extractText("<span>one</span><span>two</span>")).toBe("one two");
  });

  it("collapses runs of blank lines and trims the ends", () => {
    expect(extractText("<div></div><div></div><p>  only  </p>")).toBe("only");
  });

  it("decodes entities in the extracted text", () => {
    expect(extractText("<p>&#8362;249 + VAT</p>")).toBe("₪249 + VAT");
  });

  it("survives Hebrew and right-to-left content untouched", () => {
    expect(extractText("<p>מכרזים פומביים</p>")).toBe("מכרזים פומביים");
  });

  it("is deterministic — the same bytes give the same text", () => {
    const html = "<div><p>a</p><script>1</script><p>b</p></div>";
    expect(extractText(html)).toBe(extractText(html));
  });

  it("returns an empty string for an empty or missing body", () => {
    expect(extractText("")).toBe("");
    expect(extractText(null)).toBe("");
  });

  // A client-rendered page comes back nearly empty. That is a finding about the
  // page, not a bug here, and the extractor must not pretend otherwise.
  it("reports a JavaScript-rendered shell as nearly empty rather than inventing text", () => {
    const shell = '<html><body><div id="root"></div><script src="/app.js"></script></body></html>';
    expect(extractText(shell)).toBe("");
  });
});

describe("hasChanged", () => {
  const next = { sha256: "aaa", status: 200, error: null };

  it("calls a first capture a change, so the very first run commits", () => {
    expect(hasChanged(null, next)).toBe(true);
  });

  it("is false when the body, the status and the error state all match", () => {
    expect(hasChanged({ sha256: "aaa", status: 200, error: null }, next)).toBe(false);
  });

  it("is true when the body hash moves", () => {
    expect(hasChanged({ sha256: "bbb", status: 200, error: null }, next)).toBe(true);
  });

  // The case that makes this more than a hash comparison: the bytes are gone but
  // the page has started refusing us, and that is worth a commit.
  it("is true when a page that used to answer starts refusing", () => {
    const refused = { sha256: null, status: 403, error: "HTTP 403 Forbidden" };
    expect(hasChanged({ sha256: "aaa", status: 200, error: null }, refused)).toBe(true);
  });

  it("is true when a failure clears", () => {
    expect(hasChanged({ sha256: null, status: null, error: "TimeoutError: aborted" }, next)).toBe(true);
  });

  it("is false when the same failure repeats, so a blocked page does not commit weekly", () => {
    const failure = { sha256: null, status: 403, error: "HTTP 403 Forbidden" };
    expect(hasChanged({ ...failure }, failure)).toBe(false);
  });

  it("treats a missing key on the previous meta as null rather than as a change", () => {
    expect(hasChanged({ sha256: "aaa", status: 200 }, next)).toBe(false);
  });
});

describe("buildMeta", () => {
  const base = {
    url: "https://freemius.com/help/documentation/selling-with-freemius/supported-countries/",
    slug: "freemius-supported-countries",
    fetchedAt: "2026-09-07T05:23:00.000Z",
    status: 200,
    contentType: "text/html; charset=UTF-8",
    byteLength: 42,
    sha256: "aaa",
    bodyPath: "research/rendered/freemius-supported-countries.html",
    textPath: "research/rendered/freemius-supported-countries.txt",
  };

  it("carries every field the workflow and a later reader need", () => {
    const meta = buildMeta(base);
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
      "changed",
      "firstFetch",
      "previousSha256",
      "note",
    ]);
    expect(meta).toMatchObject({
      url: base.url,
      fetchedAt: base.fetchedAt,
      status: 200,
      contentType: "text/html; charset=UTF-8",
      byteLength: 42,
      sha256: "aaa",
      changed: true,
      firstFetch: true,
      previousSha256: null,
      error: null,
      truncated: false,
    });
  });

  it("records what it replaced when the page moves", () => {
    const meta = buildMeta({ ...base, previousMeta: { sha256: "old", status: 200, error: null } });
    expect(meta).toMatchObject({ changed: true, firstFetch: false, previousSha256: "old" });
  });

  it("reports no change when the same bytes come back", () => {
    const meta = buildMeta({ ...base, previousMeta: { sha256: "aaa", status: 200, error: null } });
    expect(meta.changed).toBe(false);
    expect(meta.firstFetch).toBe(false);
  });

  // A refusal is recorded, never thrown. This is the shape the workflow will
  // actually see for freemius.com if it 403s a runner too.
  it("records a non-2xx as data, with no body and no hash", () => {
    const meta = buildMeta({
      url: base.url,
      slug: base.slug,
      fetchedAt: base.fetchedAt,
      status: 403,
      contentType: "text/html",
      error: "HTTP 403 Forbidden",
    });
    expect(meta).toMatchObject({
      status: 403,
      sha256: null,
      byteLength: 0,
      bodyPath: null,
      textPath: null,
      error: "HTTP 403 Forbidden",
      changed: true,
    });
  });

  it("records a network error with a null status, because there never was one", () => {
    const meta = buildMeta({
      url: base.url,
      slug: base.slug,
      fetchedAt: base.fetchedAt,
      error: "timeout after 30000ms (AbortError: This operation was aborted)",
    });
    expect(meta.status).toBeNull();
    expect(meta.sha256).toBeNull();
    expect(meta.error).toMatch(/timeout after 30000ms/);
  });

  it("flags a capped body, so a sample is never cited as the whole page", () => {
    const meta = buildMeta({ ...base, truncated: true, byteLength: MAX_BYTES });
    expect(meta.truncated).toBe(true);
    expect(meta.byteLength).toBe(5 * 1024 * 1024);
  });

  it("says in the file itself that stored bytes are not a read page", () => {
    expect(buildMeta(base).note).toMatch(/citation only/);
    expect(buildMeta(base).note).toMatch(/\[RENDERED\]/);
  });

  it("serialises to stable JSON, so a diff reads as a page change", () => {
    const a = JSON.stringify(buildMeta(base), null, 2);
    const b = JSON.stringify(buildMeta(base), null, 2);
    expect(a).toBe(b);
  });
});

describe("sha256", () => {
  it("hashes the stored bytes", () => {
    expect(sha256(Buffer.from(""))).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256(Buffer.from("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("readCappedBody", () => {
  const streamOf = (chunks: Uint8Array[]) => {
    let i = 0;
    return {
      body: {
        getReader: () => ({
          read: async () => (i < chunks.length ? { done: false, value: chunks[i++] } : { done: true, value: undefined }),
          cancel: async () => undefined,
        }),
      },
    };
  };

  it("returns the whole body when it fits", async () => {
    const result = await readCappedBody(streamOf([Buffer.from("ab"), Buffer.from("cd")]), 1024);
    expect(result.bytes.toString()).toBe("abcd");
    expect(result.truncated).toBe(false);
  });

  it("stops at the cap and flags the capture as truncated", async () => {
    const result = await readCappedBody(streamOf([Buffer.from("abcdefghij")]), 4);
    expect(result.bytes.toString()).toBe("abcd");
    expect(result.truncated).toBe(true);
  });

  it("caps at 5 MB by default, as the script's header states", () => {
    expect(MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});

describe("resolveListText", () => {
  it("prefers the workflow_dispatch override, parsed with the same syntax", () => {
    const { text, source } = resolveListText({ RENDER_WATCH_URLS: "# one run only\nhttps://example.com/a\tone" });
    expect(source).toMatch(/workflow_dispatch input/);
    expect(parseUrlList(text)).toEqual([{ url: "https://example.com/a", slug: "one", lineNumber: 2 }]);
  });

  it("falls back to the file when the input is absent or blank", () => {
    const readFile = (path: string) => `# from ${path}\nhttps://example.com/file\tfile`;
    for (const env of [{}, { RENDER_WATCH_URLS: "" }, { RENDER_WATCH_URLS: "   \n  " }]) {
      const { text, source } = resolveListText(env, readFile, "/repo/research/rendered/urls.txt");
      expect(source).toBe("/repo/research/rendered/urls.txt");
      expect(parseUrlList(text)[0].slug).toBe("file");
    }
  });
});

describe("the timeout the brief fixed", () => {
  it("is 30 s", () => {
    expect(TIMEOUT_MS).toBe(30_000);
  });
});

describe("redactSecrets — a captured page must never trip push protection", () => {
  // Built at runtime so this test file does not itself contain a secret-shaped string:
  // on 27.9.2026 Stripe's own docs page carried a sample test key, GitHub push
  // protection refused the capture commit, and every page in that run was lost.
  const stripeSample = ["sk", "test", "4eC39HqLyjWDarjtT1zdp7dc"].join("_");
  const githubSample = "ghp" + "_" + "a".repeat(36);
  const awsSample = "AKIA" + "IOSFODNN7EXAMPLE";

  it("masks documented sample keys in text bodies and says how many it masked", () => {
    const html = Buffer.from(`<code>curl -u ${stripeSample}:</code><p>${githubSample}</p><i>${awsSample}</i>`);
    const r = redactSecrets(html, "text/html; charset=utf-8");
    const out = r.bytes.toString("utf8");
    expect(out).not.toContain(stripeSample);
    expect(out).not.toContain(githubSample);
    expect(out).not.toContain(awsSample);
    expect(out).toContain("[redacted:stripe-secret-key]");
    expect(out).toContain("[redacted:github-token]");
    expect(out).toContain("[redacted:aws-access-key-id]");
    expect(r.count).toBe(3);
  });

  it("leaves a page with nothing secret-shaped byte-identical, so its hash and history do not churn", () => {
    const html = Buffer.from("<p>Use sk_test keys in test mode; see the ghp docs. AKIA is a prefix.</p>");
    const r = redactSecrets(html, "text/html");
    expect(r.count).toBe(0);
    expect(r.bytes.equals(html)).toBe(true);
  });

  it("does not rewrite a binary body", () => {
    const pdf = Buffer.from(`%PDF-1.7 ${stripeSample}`);
    const r = redactSecrets(pdf, "application/pdf");
    expect(r.count).toBe(0);
    expect(r.bytes.equals(pdf)).toBe(true);
  });

  it("covers JSON and plain-text bodies too", () => {
    expect(redactSecrets(Buffer.from(`{"key":"${stripeSample}"}`), "application/json").count).toBe(1);
    expect(redactSecrets(Buffer.from(stripeSample), "text/plain").count).toBe(1);
  });
});


describe("buildMeta — the redaction count", () => {
  it("records `redacted` only when something was masked, keeping every other meta's shape", () => {
    const base = { url: "https://example.com/", slug: "ex", fetchedAt: "2026-09-27T00:00:00.000Z" };
    expect("redacted" in buildMeta(base)).toBe(false);
    expect(buildMeta({ ...base, redacted: 2 }).redacted).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// main(), end to end against a temp directory, with the network stubbed.
//
// Written BEFORE the PDF text extraction was added, and run green against the old
// code first: it pins what an HTML page, a JSON body and a refused page write, so
// the PDF branch can be shown not to have changed a byte of any of them.
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];
function tmpOut(): string {
  const dir = mkdtempSync(join(tmpdir(), "render-watch-test-"));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function writeList(dir: string, line: string): string {
  const path = join(dir, "urls.txt");
  writeFileSync(path, `# test list\n${line}\n`);
  return path;
}

function stubFetch(body: string | Buffer | null, init: { status?: number; contentType: string }) {
  vi.stubGlobal("fetch", async () => {
    const status = init.status ?? 200;
    return new Response(status >= 400 ? null : body, { status, headers: { "content-type": init.contentType } });
  });
}

function captureStdout() {
  const chunks: string[] = [];
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    chunks.push(String(chunk));
    return true;
  });
  return { text: () => chunks.join(""), restore: () => spy.mockRestore() };
}

/** Every file in a directory with its bytes, so "wrote nothing" is a comparison, not a hope. */
function snapshot(dir: string): Array<[string, string]> {
  return readdirSync(dir)
    .sort()
    .map((name) => [name, readFileSync(join(dir, name)).toString("base64")]);
}

describe("main — HTML, JSON and refused pages (pinned before the PDF branch existed)", () => {
  let out: string;
  let stdout: ReturnType<typeof captureStdout>;

  beforeEach(() => {
    out = tmpOut();
    stdout = captureStdout();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-28T01:00:00.000Z"));
  });

  afterEach(() => {
    stdout.restore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const html =
    "<html><head><title>Terms</title><script>x()</script></head>" +
    "<body><h1>Terms</h1><p>Israel &amp; more</p></body></html>";

  it("stores the body, the text extraction and the meta, in the exact shape and bytes", async () => {
    stubFetch(html, { contentType: "text/html; charset=utf-8" });
    const list = writeList(out, "https://example.test/terms\tex-terms");

    expect(await main(["--list", list, "--out", out], {})).toBe(0);

    expect(readdirSync(out).sort()).toEqual(["ex-terms.html", "ex-terms.meta.json", "ex-terms.txt", "urls.txt"]);
    expect(readFileSync(join(out, "ex-terms.html"), "utf8")).toBe(html);
    expect(readFileSync(join(out, "ex-terms.txt"), "utf8")).toBe("Terms\nTerms\nIsrael & more\n");

    const raw = readFileSync(join(out, "ex-terms.meta.json"), "utf8");
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
      "changed",
      "firstFetch",
      "previousSha256",
      "note",
    ]);
    expect(meta).toMatchObject({
      url: "https://example.test/terms",
      slug: "ex-terms",
      fetchedAt: "2026-09-28T01:00:00.000Z",
      status: 200,
      contentType: "text/html; charset=utf-8",
      byteLength: Buffer.byteLength(html),
      sha256: sha256(Buffer.from(html)),
      truncated: false,
      error: null,
      bodyPath: "research/rendered/ex-terms.html",
      textPath: "research/rendered/ex-terms.txt",
      changed: true,
      firstFetch: true,
      previousSha256: null,
    });
    expect(stdout.text()).toMatch(/new\s+ex-terms\s+\d+ bytes\s+text\/html/);
  });

  it("writes nothing at all when the same bytes come back", async () => {
    stubFetch(html, { contentType: "text/html; charset=utf-8" });
    const list = writeList(out, "https://example.test/terms\tex-terms");
    await main(["--list", list, "--out", out], {});
    const before = snapshot(out);

    vi.setSystemTime(new Date("2026-10-05T01:00:00.000Z"));
    await main(["--list", list, "--out", out], {});

    expect(snapshot(out)).toEqual(before);
    expect(stdout.text()).toMatch(/unchanged\s+ex-terms\s+sha256=/);
  });

  it("stores a JSON body with no text extraction", async () => {
    stubFetch('{"a":1}', { contentType: "application/json" });
    const list = writeList(out, "https://example.test/api\tex-api");
    await main(["--list", list, "--out", out], {});

    expect(readdirSync(out).sort()).toEqual(["ex-api.json", "ex-api.meta.json", "urls.txt"]);
    expect(JSON.parse(readFileSync(join(out, "ex-api.meta.json"), "utf8"))).toMatchObject({
      bodyPath: "research/rendered/ex-api.json",
      textPath: null,
    });
  });

  it("records a refusal in the meta, writes no body, and still exits 0", async () => {
    stubFetch(null, { status: 403, contentType: "text/html" });
    const list = writeList(out, "https://example.test/blocked\tex-blocked");

    expect(await main(["--list", list, "--out", out], {})).toBe(0);
    expect(readdirSync(out).sort()).toEqual(["ex-blocked.meta.json", "urls.txt"]);
    const meta = JSON.parse(readFileSync(join(out, "ex-blocked.meta.json"), "utf8"));
    expect(meta).toMatchObject({
      status: 403,
      sha256: null,
      bodyPath: null,
      textPath: null,
      error: "HTTP 403", // a bare Response carries no statusText
    });
    expect("textError" in meta).toBe(false);
  });
});
