import { execFile } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as apify-runs.mjs)
import {
  buildMeta,
  decodeEntities,
  describePdfTextError,
  extensionFor,
  extractText,
  hasChanged,
  isHtml,
  isPdf,
  main,
  MAX_BYTES,
  parseUrlList,
  PDFTOTEXT_TIMEOUT_MS,
  previousTextState,
  readCappedBody,
  redactSecrets,
  resolveListText,
  runPdftotext,
  sha256,
  slugFromUrl,
  storeCapture,
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

// ---------------------------------------------------------------------------
// PDF text extraction.
//
// On 28.9.2026 the CrazyGames developer terms were captured as a PDF and could not
// be read: the script stored the bytes and no text, and this container has neither
// pdftotext nor pypdf. The runner now runs `pdftotext -layout` on the stored PDF.
// The extractor is injected here, so a success, a missing binary and a failure can
// each be faked; the real execFile wrapper is exercised separately below with real
// child processes whose command is swapped for one that exists on every host.
// ---------------------------------------------------------------------------

const PDF_BYTES = Buffer.from("%PDF-1.7\n1 0 obj << /Title (Developer Terms) >> endobj\n%%EOF\n");
const PDF_ENTRY = { url: "https://files.example.test/terms.pdf", slug: "ex-terms-pdf", lineNumber: 1 };
const T0 = "2026-09-28T00:51:57.602Z";
const T1 = "2026-10-06T05:23:00.000Z";
const T2 = "2026-10-13T05:23:00.000Z";

function pdfResult(bytes: Buffer = PDF_BYTES) {
  return { status: 200, contentType: "application/pdf", bytes: Buffer.from(bytes), truncated: false, error: null };
}

/** The error shape node:child_process gives a spawn of a command that does not exist. */
function enoent() {
  return Object.assign(new Error("spawn pdftotext ENOENT"), {
    code: "ENOENT",
    errno: -2,
    syscall: "spawn pdftotext",
    path: "pdftotext",
  });
}

const neverCalled = async (): Promise<string> => {
  throw new Error("pdftotext must not run here");
};

describe("isPdf", () => {
  it("recognises a PDF by its content type, and nothing else as one", () => {
    expect(isPdf("application/pdf")).toBe(true);
    expect(isPdf("Application/PDF; qs=0.001")).toBe(true);
    expect(isPdf("text/html")).toBe(false);
    expect(isPdf(null)).toBe(false);
  });
});

describe("storeCapture — a PDF's text", () => {
  let out: string;
  const file = (name: string) => join(out, name);
  const pdfPath = () => file("ex-terms-pdf.pdf");
  const txtPath = () => file("ex-terms-pdf.txt");
  const metaFile = () => file("ex-terms-pdf.meta.json");

  beforeEach(() => {
    out = tmpOut();
  });

  it("stores the PDF first, runs the extractor on the stored file, and writes the text beside it", async () => {
    const seen: string[] = [];
    const extract = async (path: string) => {
      seen.push(path);
      // pdftotext reads a file, so the bytes must already be on disk when it runs.
      expect(readFileSync(path).equals(PDF_BYTES)).toBe(true);
      return "DEVELOPER TERMS\n\n1. Uploads\f";
    };

    const { meta, bytesChanged } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T0,
      extractPdfText: extract,
    });

    expect(seen).toEqual([pdfPath()]);
    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf", "ex-terms-pdf.txt"]);
    expect(readFileSync(pdfPath()).equals(PDF_BYTES)).toBe(true);
    expect(readFileSync(txtPath(), "utf8")).toBe("DEVELOPER TERMS\n\n1. Uploads\f");
    expect(JSON.parse(readFileSync(metaFile(), "utf8"))).toEqual(meta);
    expect(bytesChanged).toBe(true);
    expect(meta).toMatchObject({
      fetchedAt: T0,
      status: 200,
      contentType: "application/pdf",
      byteLength: PDF_BYTES.length,
      sha256: sha256(PDF_BYTES),
      bodyPath: "research/rendered/ex-terms-pdf.pdf",
      textPath: "research/rendered/ex-terms-pdf.txt",
      changed: true,
      firstFetch: true,
    });
    expect("textError" in meta).toBe(false);
    expect("redacted" in meta).toBe(false);
  });

  it("hashes the PDF bytes, never the text: two different extractions of one PDF give one sha256", async () => {
    const a = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: tmpOut(), now: () => T0, extractPdfText: async () => "A\n" });
    const b = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: tmpOut(), now: () => T0, extractPdfText: async () => "B\n" });
    expect(a.meta.sha256).toBe(sha256(PDF_BYTES));
    expect(b.meta.sha256).toBe(a.meta.sha256);
  });

  it("masks a sample key in the extracted text and counts it, leaving the PDF bytes and hash alone", async () => {
    const key = ["sk", "live", "4eC39HqLyjWDarjtT1zdp7dc"].join("_");
    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T0,
      extractPdfText: async () => `curl -u ${key}:\n`,
    });

    const text = readFileSync(txtPath(), "utf8");
    expect(text).not.toContain(key);
    expect(text).toBe("curl -u [redacted:stripe-secret-key]:\n");
    expect(meta.redacted).toBe(1);
    expect(meta.sha256).toBe(sha256(PDF_BYTES));
    expect(readFileSync(pdfPath()).equals(PDF_BYTES)).toBe(true);
  });

  it("records a missing pdftotext (ENOENT) in the meta and carries on, writing no text", async () => {
    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T0,
      extractPdfText: async () => {
        throw enoent();
      },
    });

    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf"]);
    expect(meta.error).toBeNull(); // the fetch itself worked; only the reading did not
    expect(meta.sha256).toBe(sha256(PDF_BYTES));
    expect(meta.textPath).toBeNull();
    expect(meta.textError).toMatch(/^pdftotext is not installed on this host \(ENOENT\)/);
    expect(meta.textError).toMatch(/poppler-utils/);
    expect(JSON.parse(readFileSync(metaFile(), "utf8")).textError).toBe(meta.textError);
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
      "textError",
      "changed",
      "firstFetch",
      "previousSha256",
      "note",
    ]);
  });

  it("records a pdftotext failure by exit code and first stderr line, with no host path in it", async () => {
    const failure = Object.assign(new Error("Command failed: pdftotext -layout /home/runner/work/x/ex-terms-pdf.pdf -"), {
      code: 1,
      stderr: "Syntax Error: Couldn't read xref table\nSyntax Warning: something else\n",
    });
    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T0,
      extractPdfText: async () => {
        throw failure;
      },
    });

    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf"]);
    expect(meta.textPath).toBeNull();
    expect(meta.textError).toMatch(/^pdftotext exited with code 1: Syntax Error: Couldn't read xref table;/);
    expect(meta.textError).not.toMatch(/home\/runner|Syntax Warning/);
  });

  it("an unchanged PDF whose text is stored writes nothing and does not run pdftotext again", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "v1\n" });
    const before = snapshot(out);

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    expect(meta.changed).toBe(false);
    expect(snapshot(out)).toEqual(before);
  });

  it("retries after a recorded failure, and writes nothing when it fails the same way again", async () => {
    const missing = async (): Promise<string> => {
      throw enoent();
    };
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: missing });
    const before = snapshot(out);

    let calls = 0;
    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T1,
      extractPdfText: async () => {
        calls += 1;
        throw enoent();
      },
    });

    expect(calls).toBe(1);
    expect(meta.changed).toBe(false);
    expect(snapshot(out)).toEqual(before);
  });

  it("stores the text once a later run can read it, keeping the fetchedAt of the unchanged bytes", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T0,
      extractPdfText: async () => {
        throw enoent();
      },
    });

    const { meta, bytesChanged } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T1,
      extractPdfText: async () => "now readable\n",
    });

    expect(bytesChanged).toBe(false);
    expect(readFileSync(txtPath(), "utf8")).toBe("now readable\n");
    expect(meta).toMatchObject({
      changed: true,
      firstFetch: false,
      fetchedAt: T0,
      sha256: sha256(PDF_BYTES),
      previousSha256: sha256(PDF_BYTES),
      textPath: "research/rendered/ex-terms-pdf.txt",
    });
    expect("textError" in meta).toBe(false);
  });

  // The CrazyGames case. The old script stored the PDF and a meta with textPath null,
  // and the document is a dated file that may never change again — so "extract only
  // when the bytes change" would never read it. It is read once, from the stored file.
  it("extracts once for a PDF captured before extraction existed, then goes quiet", async () => {
    writeFileSync(pdfPath(), PDF_BYTES);
    const oldMeta = buildMeta({
      url: PDF_ENTRY.url,
      slug: PDF_ENTRY.slug,
      fetchedAt: T0,
      status: 200,
      contentType: "application/pdf",
      byteLength: PDF_BYTES.length,
      sha256: sha256(PDF_BYTES),
      bodyPath: "research/rendered/ex-terms-pdf.pdf",
      textPath: null,
    });
    writeFileSync(metaFile(), `${JSON.stringify(oldMeta, null, 2)}\n`);

    const seen: string[] = [];
    const { meta, bytesChanged } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T1,
      extractPdfText: async (path: string) => {
        seen.push(path);
        return "terms text\n";
      },
    });

    expect(seen).toEqual([pdfPath()]);
    expect(bytesChanged).toBe(false);
    expect(readFileSync(txtPath(), "utf8")).toBe("terms text\n");
    expect(readFileSync(pdfPath()).equals(PDF_BYTES)).toBe(true);
    expect(meta).toMatchObject({
      changed: true,
      firstFetch: false,
      fetchedAt: T0,
      previousSha256: sha256(PDF_BYTES),
      textPath: "research/rendered/ex-terms-pdf.txt",
    });

    const after = snapshot(out);
    const next = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: neverCalled });
    expect(next.meta.changed).toBe(false);
    expect(snapshot(out)).toEqual(after);
  });

  // Four PDFs in research/rendered/ (the PCN874 specs and the US-Israel treaty) carry a
  // hand extraction as <slug>.txt, cited elsewhere by LINE NUMBER, with textPath null in
  // their meta. Overwriting those with pdftotext's layout would break every citation.
  it("leaves a hand-made <slug>.txt alone while the PDF bytes are unchanged", async () => {
    writeFileSync(pdfPath(), PDF_BYTES);
    writeFileSync(txtPath(), "a hand extraction, cited by line number\n");
    const oldMeta = buildMeta({
      url: PDF_ENTRY.url,
      slug: PDF_ENTRY.slug,
      fetchedAt: T0,
      status: 200,
      contentType: "application/pdf",
      byteLength: PDF_BYTES.length,
      sha256: sha256(PDF_BYTES),
      bodyPath: "research/rendered/ex-terms-pdf.pdf",
      textPath: null,
    });
    writeFileSync(metaFile(), `${JSON.stringify(oldMeta, null, 2)}\n`);
    const before = snapshot(out);

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    expect(meta.changed).toBe(false);
    expect(snapshot(out)).toEqual(before);
  });

  it("re-extracts when the PDF bytes change, because the old text describes the old bytes", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    const v2 = Buffer.from("%PDF-1.7\n% revised terms\n%%EOF\n");

    const { meta, bytesChanged } = await storeCapture(PDF_ENTRY, pdfResult(v2), {
      outDir: out,
      now: () => T1,
      extractPdfText: async () => "text v2\n",
    });

    expect(bytesChanged).toBe(true);
    expect(readFileSync(pdfPath()).equals(v2)).toBe(true);
    expect(readFileSync(txtPath(), "utf8")).toBe("text v2\n");
    expect(meta).toMatchObject({
      changed: true,
      fetchedAt: T1,
      sha256: sha256(v2),
      previousSha256: sha256(PDF_BYTES),
      textPath: "research/rendered/ex-terms-pdf.txt",
    });
  });

  // products/pcn874/src/*.ts cites pcn874-*.txt by line number. A new edition of those
  // PDFs must not silently re-lay-out the text under every citation: the hand extraction
  // stays, and the meta says plainly that it no longer describes the stored bytes.
  it("never overwrites a hand extraction, even when the PDF changes, and says it is stale", async () => {
    writeFileSync(pdfPath(), PDF_BYTES);
    writeFileSync(txtPath(), "a hand extraction, cited by line number\n");
    const oldMeta = buildMeta({
      url: PDF_ENTRY.url,
      slug: PDF_ENTRY.slug,
      fetchedAt: T0,
      status: 200,
      contentType: "application/pdf",
      byteLength: PDF_BYTES.length,
      sha256: sha256(PDF_BYTES),
      bodyPath: "research/rendered/ex-terms-pdf.pdf",
      textPath: null,
    });
    writeFileSync(metaFile(), `${JSON.stringify(oldMeta, null, 2)}\n`);
    const v2 = Buffer.from("%PDF-1.7\n% a new edition\n%%EOF\n");

    const { meta, bytesChanged } = await storeCapture(PDF_ENTRY, pdfResult(v2), {
      outDir: out,
      now: () => T1,
      extractPdfText: neverCalled,
    });

    expect(bytesChanged).toBe(true);
    expect(readFileSync(pdfPath()).equals(v2)).toBe(true);
    expect(readFileSync(txtPath(), "utf8")).toBe("a hand extraction, cited by line number\n");
    expect(meta).toMatchObject({ changed: true, sha256: sha256(v2), textPath: null });
    // Only what the script knows: no textPath names the file, and the PDF beside it changed.
    // Not "it was not written by render-watch" (a failed week can hide that the script wrote
    // it) and not "it does not describe these bytes" (a PDF that reverts would make that false).
    expect(meta.textError).toMatch(/^not extracted: research\/rendered\/ex-terms-pdf\.txt is not claimed by this page's meta/);
    expect(meta.textError).toContain(`the stored copy was sha256 ${sha256(PDF_BYTES)}`);
    expect(meta.textError).toMatch(/may not describe these bytes/);
    expect(meta.textError).not.toMatch(/was not written by render-watch|does not describe/);

    // Quiet again the week after, and still untouched.
    const after = snapshot(out);
    const next = await storeCapture(PDF_ENTRY, pdfResult(v2), { outDir: out, now: () => T2, extractPdfText: neverCalled });
    expect(next.meta.changed).toBe(false);
    expect(snapshot(out)).toEqual(after);
  });

  it("removes its own text of the old bytes when the new bytes cannot be read, then reads them later", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    const v2 = Buffer.from("%PDF-1.7\n% revised terms\n%%EOF\n");

    const failed = await storeCapture(PDF_ENTRY, pdfResult(v2), {
      outDir: out,
      now: () => T1,
      extractPdfText: async () => {
        throw enoent();
      },
    });

    // No text of v1 left beside v2: an unclaimed <slug>.txt is only ever a hand extraction.
    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf"]);
    expect(failed.meta).toMatchObject({ changed: true, sha256: sha256(v2), textPath: null });
    expect(failed.meta.textError).toMatch(/ENOENT/);

    const read = await storeCapture(PDF_ENTRY, pdfResult(v2), {
      outDir: out,
      now: () => T2,
      extractPdfText: async () => "text v2\n",
    });
    expect(read.meta).toMatchObject({ changed: true, fetchedAt: T1, textPath: "research/rendered/ex-terms-pdf.txt" });
    expect(readFileSync(txtPath(), "utf8")).toBe("text v2\n");
  });

  it("does not try to extract anything from a PDF that was never fetched", async () => {
    const refused = { status: 403, contentType: "application/pdf", bytes: null, truncated: false, error: "HTTP 403" };
    const { meta } = await storeCapture(PDF_ENTRY, refused, { outDir: out, now: () => T0, extractPdfText: neverCalled });

    expect(readdirSync(out)).toEqual(["ex-terms-pdf.meta.json"]);
    expect(meta).toMatchObject({ status: 403, bodyPath: null, textPath: null, error: "HTTP 403" });
    expect("textError" in meta).toBe(false);
  });

  // A URL that answers HTML for a while leaves the script's HTML extraction in <slug>.txt
  // (claimed by that meta's textPath). When the PDF comes back — even the same bytes as the
  // .pdf still on disk — that text is the script's own, of a different body: it is replaced.
  it("PDF → HTML → the same PDF: replaces the script's HTML text with the PDF's", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    const html = Buffer.from("<html><body><p>Moved</p></body></html>");
    await storeCapture(
      PDF_ENTRY,
      { status: 200, contentType: "text/html", bytes: html, truncated: false, error: null },
      { outDir: out, now: () => T1, extractPdfText: neverCalled },
    );
    expect(readFileSync(txtPath(), "utf8")).toBe("Moved\n");

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: async () => "text v1\n" });

    expect(readFileSync(txtPath(), "utf8")).toBe("text v1\n");
    expect(meta).toMatchObject({ sha256: sha256(PDF_BYTES), textPath: "research/rendered/ex-terms-pdf.txt" });
    expect("textError" in meta).toBe(false);
  });

  // A text/plain answer is stored AS <slug>.txt (bodyPath), with textPath null. It is the
  // script's file all the same, and must not be taken for a hand extraction afterwards.
  it("PDF → text/plain → the same PDF: the plain-text body is the script's file and is replaced", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    await storeCapture(
      PDF_ENTRY,
      { status: 200, contentType: "text/plain", bytes: Buffer.from("gone\n"), truncated: false, error: null },
      { outDir: out, now: () => T1, extractPdfText: neverCalled },
    );

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: async () => "text v1\n" });

    expect(readFileSync(txtPath(), "utf8")).toBe("text v1\n");
    expect(meta.textPath).toBe("research/rendered/ex-terms-pdf.txt");
    expect("textError" in meta).toBe(false);
  });

  it("extracts again when the meta claims its text but the file is gone, rather than claiming a missing file", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    rmSync(txtPath());

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T1,
      extractPdfText: async () => "text v1, again\n",
    });

    expect(readFileSync(txtPath(), "utf8")).toBe("text v1, again\n");
    expect(meta.textPath).toBe("research/rendered/ex-terms-pdf.txt");
  });

  it("does not claim a hand text is stale against bytes it never sat beside, when no PDF was stored", async () => {
    // A <slug>.txt with no stored PDF and no meta: nothing says which bytes it was made from.
    writeFileSync(txtPath(), "a hand extraction, cited by line number\n");

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: neverCalled });

    expect(readFileSync(txtPath(), "utf8")).toBe("a hand extraction, cited by line number\n");
    expect(meta.textPath).toBeNull();
    expect(meta.textError).toMatch(/^not extracted: research\/rendered\/ex-terms-pdf\.txt is not claimed by this page's meta/);
    expect(meta.textError).toMatch(/no stored PDF was beside it/i);
    expect(meta.textError).not.toMatch(/stored copy was sha256|does not describe/);
  });
});

// ---------------------------------------------------------------------------
// A failed fetch between two captures of a PDF.
//
// A failed fetch (a 403, a timeout, a network error) writes a meta with no sha256 and
// no bodyPath, and writes no file: the last capture's .pdf and <slug>.txt stay on disk.
// 16 of the 94 committed metas carry an error today, so this is a normal week, not an
// edge case. Found in review on 28.9.2026: judging "who wrote the .txt" and "are these
// the same bytes" against that error meta alone turned the script's own text into a
// "hand extraction" after one bad week (and then left it beside new bytes), and gave the
// hand-made PCN874 texts — cited by line number from products/pcn874 — a false and
// permanent "does not describe these bytes".
// ---------------------------------------------------------------------------

describe("storeCapture — a failed fetch between two captures of a PDF", () => {
  let out: string;
  const file = (name: string) => join(out, name);
  const pdfPath = () => file("ex-terms-pdf.pdf");
  const txtPath = () => file("ex-terms-pdf.txt");
  const metaFile = () => file("ex-terms-pdf.meta.json");
  const V2 = Buffer.from("%PDF-1.7\n% revised terms\n%%EOF\n");
  const HAND = "a hand extraction, cited by line number\n";

  const refused = () => ({ status: 403, contentType: "text/html", bytes: null, truncated: false, error: "HTTP 403" });
  const unreachable = () => ({ status: null, contentType: null, bytes: null, truncated: false, error: "TypeError: fetch failed" });

  /** The four committed hand extractions, as they are today: the PDF, the text, and a meta with textPath null. */
  function seedHandText() {
    writeFileSync(pdfPath(), PDF_BYTES);
    writeFileSync(txtPath(), HAND);
    const oldMeta = buildMeta({
      url: PDF_ENTRY.url,
      slug: PDF_ENTRY.slug,
      fetchedAt: T0,
      status: 200,
      contentType: "application/pdf",
      byteLength: PDF_BYTES.length,
      sha256: sha256(PDF_BYTES),
      bodyPath: "research/rendered/ex-terms-pdf.pdf",
      textPath: null,
    });
    writeFileSync(metaFile(), `${JSON.stringify(oldMeta, null, 2)}\n`);
  }

  const readMeta = () => JSON.parse(readFileSync(metaFile(), "utf8"));

  beforeEach(() => {
    out = tmpOut();
  });

  it("keeps the claim on the script's own text in the meta of a failed fetch, and touches no file", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });

    const { meta } = await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    expect(readFileSync(pdfPath()).equals(PDF_BYTES)).toBe(true);
    expect(readFileSync(txtPath(), "utf8")).toBe("text v1\n");
    expect(meta).toMatchObject({
      changed: true,
      status: 403,
      error: "HTTP 403",
      sha256: null,
      bodyPath: null,
      // The files are still on disk, so what the last capture said about them is still true.
      textPath: "research/rendered/ex-terms-pdf.txt",
      previousSha256: sha256(PDF_BYTES),
    });
    expect("textError" in meta).toBe(false);
    expect(readMeta()).toEqual(meta);
  });

  // S1, weeks 1-3: extracted, then a failed fetch, then the same bytes.
  it("error → same bytes: the script's own text is still its own, not re-extracted and not called a hand extraction", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(readFileSync(txtPath(), "utf8")).toBe("text v1\n");
    expect(meta).toMatchObject({ error: null, sha256: sha256(PDF_BYTES), textPath: "research/rendered/ex-terms-pdf.txt" });
    expect("textError" in meta).toBe(false);
    expect(readMeta()).toEqual(meta);
  });

  // S1, week 4: the PDF really changes after all that. The week-1 text must not stay beside it.
  it("error → same bytes → new bytes: the new bytes are extracted and replace the script's text", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    const seen: string[] = [];
    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(V2), {
      outDir: out,
      now: () => T2,
      extractPdfText: async (path: string) => {
        seen.push(path);
        expect(readFileSync(path).equals(V2)).toBe(true);
        return "text v2\n";
      },
    });

    expect(seen).toEqual([pdfPath()]);
    expect(readFileSync(txtPath(), "utf8")).toBe("text v2\n");
    expect(meta).toMatchObject({ sha256: sha256(V2), textPath: "research/rendered/ex-terms-pdf.txt" });
    expect("textError" in meta).toBe(false);
  });

  it("error → new bytes: re-extracts the script's text, judged against the stored PDF rather than the error meta", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(V2), {
      outDir: out,
      now: () => T2,
      extractPdfText: async () => "text v2\n",
    });

    expect(readFileSync(pdfPath()).equals(V2)).toBe(true);
    expect(readFileSync(txtPath(), "utf8")).toBe("text v2\n");
    expect(meta).toMatchObject({ sha256: sha256(V2), textPath: "research/rendered/ex-terms-pdf.txt" });
  });

  it("error → new bytes that cannot be read: removes the script's text of the old bytes", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(V2), {
      outDir: out,
      now: () => T2,
      extractPdfText: async () => {
        throw enoent();
      },
    });

    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf"]);
    expect(meta).toMatchObject({ sha256: sha256(V2), textPath: null });
    expect(meta.textError).toMatch(/ENOENT/);
  });

  it("carries the claim through two failed fetches in a row", async () => {
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => "text v1\n" });
    await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    const second = await storeCapture(PDF_ENTRY, unreachable(), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    expect(second.meta).toMatchObject({ status: null, textPath: "research/rendered/ex-terms-pdf.txt" });

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(readFileSync(txtPath(), "utf8")).toBe("text v1\n");
    expect(meta.textPath).toBe("research/rendered/ex-terms-pdf.txt");
    expect("textError" in meta).toBe(false);
  });

  it("carries the count of what was masked in the script's text, so a later rewrite does not drop it", async () => {
    const key = ["sk", "live", "4eC39HqLyjWDarjtT1zdp7dc"].join("_");
    await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T0, extractPdfText: async () => `curl -u ${key}:\n` });

    const failed = await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    const back = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(failed.meta.redacted).toBe(1);
    expect(back.meta.redacted).toBe(1);
    expect(readFileSync(txtPath(), "utf8")).toBe("curl -u [redacted:stripe-secret-key]:\n");
  });

  // S2: the committed pcn874 hand texts, one bad week, then the identical bytes.
  it("error → same bytes beside a hand text: no staleness claim, and the text is untouched", async () => {
    seedHandText();

    const failed = await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    expect(failed.meta.textPath).toBeNull();
    expect("textError" in failed.meta).toBe(false);

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(readFileSync(txtPath(), "utf8")).toBe(HAND);
    expect(meta).toMatchObject({ error: null, sha256: sha256(PDF_BYTES), textPath: null, previousSha256: null });
    expect("textError" in meta).toBe(false);
    expect(readMeta()).toEqual(meta);
  });

  it("error → new bytes beside a hand text: says the PDF changed beside it, naming the stored copy's sha256", async () => {
    seedHandText();
    await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(V2), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(readFileSync(txtPath(), "utf8")).toBe(HAND);
    expect(readFileSync(pdfPath()).equals(V2)).toBe(true);
    expect(meta).toMatchObject({ sha256: sha256(V2), textPath: null });
    expect(meta.textError).toMatch(/^not extracted: research\/rendered\/ex-terms-pdf\.txt is not claimed by this page's meta/);
    expect(meta.textError).toContain(`the stored copy was sha256 ${sha256(PDF_BYTES)}`);
    expect(meta.textError).toMatch(/may not describe these bytes/);
  });

  it("keeps a staleness note on a hand text through a failed fetch, instead of silently dropping it", async () => {
    seedHandText();
    const stale = await storeCapture(PDF_ENTRY, pdfResult(V2), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    expect(stale.meta.textError).toMatch(/may not describe these bytes/);

    const failed = await storeCapture(PDF_ENTRY, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    expect(failed.meta.textError).toBe(stale.meta.textError);

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(V2), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(readFileSync(txtPath(), "utf8")).toBe(HAND);
    expect(meta.textPath).toBeNull();
    expect(meta.textError).toBe(stale.meta.textError);
  });

  // research/rendered/README.md tells a reader who has re-checked a hand text against the new
  // PDF to delete textError by hand. That must stick.
  it("does not bring back a staleness note a person deleted from the meta, while the bytes stay the same", async () => {
    seedHandText();
    await storeCapture(PDF_ENTRY, pdfResult(V2), { outDir: out, now: () => T1, extractPdfText: neverCalled });
    const { textError: _removed, ...reviewed } = readMeta();
    writeFileSync(metaFile(), `${JSON.stringify(reviewed, null, 2)}\n`);
    const before = snapshot(out);

    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(V2), { outDir: out, now: () => T2, extractPdfText: neverCalled });

    expect(meta.changed).toBe(false);
    expect("textError" in meta).toBe(false);
    expect(snapshot(out)).toEqual(before);
  });

  // HTML must not move: a failed fetch after an HTML capture writes the meta it always wrote.
  it("carries nothing after an HTML capture: the error meta keeps its old shape", async () => {
    const htmlEntry = { url: "https://example.test/terms", slug: "ex-terms", lineNumber: 1 };
    const html = Buffer.from("<html><body><p>Terms</p></body></html>");
    await storeCapture(
      htmlEntry,
      { status: 200, contentType: "text/html", bytes: html, truncated: false, error: null },
      { outDir: out, now: () => T0, extractPdfText: neverCalled },
    );

    const { meta } = await storeCapture(htmlEntry, refused(), { outDir: out, now: () => T1, extractPdfText: neverCalled });

    expect(meta).toMatchObject({ bodyPath: null, textPath: null, sha256: null, error: "HTTP 403" });
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
  });
});

describe("previousTextState — what a failed fetch carries forward", () => {
  const none = { textPath: null, textError: null, redacted: 0 };
  const pdf = { contentType: "application/pdf", error: null, sha256: "aaa", textPath: "research/rendered/x.txt", redacted: 2 };

  it("reads a PDF capture's claim on its text, its text error and its masked count", () => {
    expect(previousTextState(pdf)).toEqual({ textPath: "research/rendered/x.txt", textError: null, redacted: 2 });
    expect(previousTextState({ ...pdf, textPath: null, textError: "pdftotext is not installed" })).toEqual({
      textPath: null,
      textError: "pdftotext is not installed",
      redacted: 2,
    });
  });

  it("reads a failed fetch's carried state, so a second failed week carries it again", () => {
    const failed = { contentType: null, error: "TypeError: fetch failed", sha256: null, textPath: "research/rendered/x.txt" };
    expect(previousTextState(failed)).toEqual({ textPath: "research/rendered/x.txt", textError: null, redacted: 0 });
  });

  // HTML, JSON and the hand-edited metas must keep the error meta they always had.
  it("gives nothing for any capture that is not a PDF, and nothing for no meta", () => {
    expect(previousTextState(null)).toEqual(none);
    expect(previousTextState({ contentType: "text/html", error: null, textPath: "research/rendered/x.txt", redacted: 1 })).toEqual(none);
    expect(previousTextState({ contentType: "text/plain", error: null, textPath: "research/rendered/x.txt" })).toEqual(none);
    expect(previousTextState({ contentType: "text/html", error: "HTTP 403", textPath: null })).toEqual(none);
  });
});

describe("hasChanged — a PDF's text state", () => {
  const pdf = { sha256: "aaa", status: 200, error: null, contentType: "application/pdf", textPath: null };

  it("is true when an unchanged PDF gains its text, or its text error appears or moves", () => {
    expect(hasChanged(pdf, { ...pdf, textPath: "research/rendered/x.txt" })).toBe(true);
    expect(hasChanged(pdf, { ...pdf, textError: "pdftotext is not installed" })).toBe(true);
    expect(hasChanged({ ...pdf, textError: "one" }, { ...pdf, textError: "two" })).toBe(true);
  });

  it("is false when the bytes and the text state both match", () => {
    expect(hasChanged({ ...pdf, textError: "same" }, { ...pdf, textError: "same" })).toBe(false);
    const done = { ...pdf, textPath: "research/rendered/x.txt" };
    expect(hasChanged(done, { ...done })).toBe(false);
  });

  // Hand-edited metas exist: youtube-handle-bediyuk (HTML, textPath null because the body
  // was removed on purpose) and the two github-innovationgraph captures (text/plain, textPath
  // set by hand). Comparing textPath for every type would rewrite them on the next run.
  it("ignores the text state of anything that is not a PDF, so hand-edited metas never churn", () => {
    const html = { sha256: "aaa", status: 200, error: null, contentType: "text/html", textPath: null };
    expect(hasChanged(html, { ...html, textPath: "research/rendered/x.txt" })).toBe(false);
    const plain = { ...html, contentType: "text/plain", textPath: "research/rendered/x.txt" };
    expect(hasChanged(plain, { ...plain, textPath: null })).toBe(false);
  });
});

describe("runPdftotext — the execFile wrapper", () => {
  type Callback = (error: Error | null, stdout: string, stderr: string) => void;

  it("runs pdftotext with a fixed argv, no shell and a timeout, and resolves its stdout", async () => {
    const calls: Array<[string, string[], Record<string, unknown>]> = [];
    const fake = (cmd: string, args: string[], options: Record<string, unknown>, callback: Callback) => {
      calls.push([cmd, args, options]);
      callback(null, "page one\f", "");
    };

    await expect(runPdftotext("/out/x.pdf", { execFileImpl: fake })).resolves.toBe("page one\f");
    expect(calls).toHaveLength(1);
    const [cmd, args, options] = calls[0];
    expect(cmd).toBe("pdftotext");
    expect(args).toEqual(["-layout", "/out/x.pdf", "-"]);
    expect(options).toMatchObject({ timeout: PDFTOTEXT_TIMEOUT_MS, encoding: "utf8" });
    expect(options.shell).toBeFalsy();
    expect(PDFTOTEXT_TIMEOUT_MS).toBeGreaterThan(0);
  });

  // Real child processes from here on. Only the program is swapped — for node running a
  // tiny script, or for a name that exists nowhere — so the wrapper's own argv, options
  // and error handling run for real. None of this depends on pdftotext being installed.
  let scripts: string;
  beforeEach(() => {
    scripts = tmpOut();
    writeFileSync(join(scripts, "echo-argv.mjs"), "process.stdout.write(JSON.stringify(process.argv.slice(2)));\n");
    writeFileSync(
      join(scripts, "fail.mjs"),
      "process.stderr.write(\"Syntax Error: Couldn't read xref table\\nSyntax Warning: more\\n\"); process.exit(1);\n",
    );
    writeFileSync(join(scripts, "hang.mjs"), "setTimeout(() => {}, 30000);\n");
  });

  const viaNode =
    (script: string) => (_cmd: string, args: string[], options: Record<string, unknown>, callback: Callback) =>
      execFile(process.execPath, [join(scripts, script), ...args], options, callback);

  it("hands back a real child's stdout, and the child sees exactly -layout <file> -", async () => {
    const stdoutText = await runPdftotext("/out/x.pdf", { execFileImpl: viaNode("echo-argv.mjs") });
    expect(JSON.parse(stdoutText)).toEqual(["-layout", "/out/x.pdf", "-"]);
  });

  it("maps a real missing program to the ENOENT note", async () => {
    const missing = (_cmd: string, args: string[], options: Record<string, unknown>, callback: Callback) =>
      execFile("render-watch-no-such-program", args, options, callback);
    const error = await runPdftotext("/out/x.pdf", { execFileImpl: missing }).catch((e: unknown) => e);
    expect((error as { code?: unknown }).code).toBe("ENOENT");
    expect(describePdfTextError(error)).toMatch(/^pdftotext is not installed on this host \(ENOENT\)/);
  });

  it("maps a real non-zero exit to its code and first stderr line", async () => {
    const error = await runPdftotext("/out/x.pdf", { execFileImpl: viaNode("fail.mjs") }).catch((e: unknown) => e);
    expect(describePdfTextError(error)).toMatch(/^pdftotext exited with code 1: Syntax Error: Couldn't read xref table;/);
  });

  it("stops a real child that outlives the timeout, and says so", async () => {
    const error = await runPdftotext("/out/x.pdf", { timeoutMs: 300, execFileImpl: viaNode("hang.mjs") }).catch(
      (e: unknown) => e,
    );
    expect(describePdfTextError(error)).toMatch(/^pdftotext did not finish within 300 ms/);
  });

  // Shapes measured from node:child_process on Node 22: a crash has killed=false and a
  // signal; an overflowing stdout has a string code and neither.
  it("calls a crash a crash, not a timeout", () => {
    const crash = { code: null, killed: false, signal: "SIGSEGV", stderr: "" };
    expect(describePdfTextError(crash)).toMatch(/^pdftotext was ended by SIGSEGV;/);
    expect(describePdfTextError(crash)).not.toMatch(/did not finish/);
  });

  it("names any other failure by its code", () => {
    const overflow = Object.assign(new RangeError("stdout maxBuffer length exceeded"), {
      code: "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
    });
    expect(describePdfTextError(overflow)).toMatch(/^pdftotext failed \(ERR_CHILD_PROCESS_STDIO_MAXBUFFER\);/);
  });
});

describe("main — a PDF", () => {
  let out: string;
  let stdout: ReturnType<typeof captureStdout>;

  beforeEach(() => {
    out = tmpOut();
    stdout = captureStdout();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(T0));
  });

  afterEach(() => {
    stdout.restore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("stores the text through the injected extractor", async () => {
    stubFetch(PDF_BYTES, { contentType: "application/pdf" });
    const list = writeList(out, `${PDF_ENTRY.url}\t${PDF_ENTRY.slug}`);

    expect(await main(["--list", list, "--out", out], {}, { extractPdfText: async () => "terms\n" })).toBe(0);
    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf", "ex-terms-pdf.txt", "urls.txt"]);
    expect(readFileSync(join(out, "ex-terms-pdf.txt"), "utf8")).toBe("terms\n");
  });

  it("logs a missing pdftotext, records it in the meta, and still exits 0", async () => {
    stubFetch(PDF_BYTES, { contentType: "application/pdf" });
    const list = writeList(out, `${PDF_ENTRY.url}\t${PDF_ENTRY.slug}`);
    const missing = async (): Promise<string> => {
      throw enoent();
    };

    expect(await main(["--list", list, "--out", out], {}, { extractPdfText: missing })).toBe(0);
    expect(readdirSync(out).sort()).toEqual(["ex-terms-pdf.meta.json", "ex-terms-pdf.pdf", "urls.txt"]);
    expect(JSON.parse(readFileSync(join(out, "ex-terms-pdf.meta.json"), "utf8")).textError).toMatch(/ENOENT/);
    expect(stdout.text()).toMatch(/no PDF text: pdftotext is not installed on this host \(ENOENT\)/);
  });

  it("says in the log when only the text moved and the PDF bytes did not", async () => {
    stubFetch(PDF_BYTES, { contentType: "application/pdf" });
    const list = writeList(out, `${PDF_ENTRY.url}\t${PDF_ENTRY.slug}`);
    const missing = async (): Promise<string> => {
      throw enoent();
    };
    await main(["--list", list, "--out", out], {}, { extractPdfText: missing });

    vi.setSystemTime(new Date(T1));
    await main(["--list", list, "--out", out], {}, { extractPdfText: async () => "terms\n" });

    expect(stdout.text()).toMatch(/text\s+ex-terms-pdf\s+PDF bytes unchanged/);
    expect(JSON.parse(readFileSync(join(out, "ex-terms-pdf.meta.json"), "utf8")).fetchedAt).toBe(T0);
  });
});
