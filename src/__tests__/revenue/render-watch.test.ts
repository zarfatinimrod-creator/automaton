import { execFile, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
// @ts-expect-error — plain ESM script, no type declarations by design (same as apify-runs.mjs)
import {
  buildMeta,
  copyingBarredSite,
  copyingBarredSites,
  copyingRedirectError,
  COPYING_RULING,
  emptiedLines,
  fetchOne,
  readCopyingBarred,
  decodeEntities,
  describePdfTextError,
  extensionFor,
  extractText,
  hasChanged,
  isHtml,
  isPdf,
  main,
  MAX_BYTES,
  NOT_RETAINED,
  NOT_RETAINED_HISTORY,
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
  "https://polar.sh/docs/merchant-of-record/supported-countries\tpolar-supported-countries",
  "https://api.apify.com/v2/store?search=accessibility\tapify-store-accessibility",
  "https://govi.co.il/",
  "",
].join("\n");

describe("parseUrlList", () => {
  it("reads URLs, drops comments and blank lines, and keeps the tab-separated slug", () => {
    const entries = parseUrlList(FIXTURE_LIST);
    expect(entries).toEqual([
      {
        url: "https://polar.sh/docs/merchant-of-record/supported-countries",
        slug: "polar-supported-countries",
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
    expect(text).not.toContain("<");
  });

  // The runner is a no-JavaScript client, so a <noscript> body is exactly what it
  // is served. Discourse forums put every post there (a crawler view); dropping
  // noscript turned a 51,688-character thread into 8 lines (tick 7, 28.9.2026).
  it("keeps the text of a <noscript> body, which is what a no-JavaScript client is served", () => {
    const html = [
      "<html><body><div id='app'></div>",
      '<noscript data-path="/t/some-thread/123">',
      '  <div class="crawler-post"><div itemprop="text"><p>Paid templates need a verified creator.</p></div></div>',
      "</noscript></body></html>",
    ].join("\n");
    expect(extractText(html)).toBe("Paid templates need a verified creator.");
    expect(extractText("<p>a</p><noscript>enable javascript</noscript>")).toBe("a\nenable javascript");
  });

  // Discourse's <link media="(width >= 40rem)"> leaked '= 40rem)" rel=...' into
  // every forum capture: a '>' inside a quoted attribute ended the tag early.
  it("does not end a tag at a '>' inside a quoted attribute value", () => {
    const html =
      '<head><link href="/a.css" media="(width >= 40rem)" rel="stylesheet" /><link media=\'(x > 1)\' /></head><p>body</p>';
    expect(extractText(html)).toBe("body");
  });

  it("leaves a bare '<' or '>' in running text alone", () => {
    expect(extractText("<p>5 < 6 and 7 > 3</p>")).toBe("5 < 6 and 7 > 3");
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

  it("masks Mapbox tokens of every prefix (push protection refuses a public one too) and a Google API key (tick 54)", () => {
    const mapboxSecret = ["sk", `eyJ${"a".repeat(24)}`, "b".repeat(32)].join(".");
    const mapboxPublic = ["pk", `eyJ1Ijoi${"a".repeat(40)}`, "b".repeat(22)].join(".");
    const googleKey = `AIza${"0".repeat(35)}`;
    const r = redactSecrets(Buffer.from(`<script>t="${mapboxSecret}";u="${mapboxPublic}";k="${googleKey}"</script>`), "text/html");
    const out = r.bytes.toString("utf8");
    expect(out).not.toContain(mapboxSecret);
    expect(out).not.toContain(mapboxPublic);
    expect(out).not.toContain(googleKey);
    expect(out).toBe(`<script>t="[redacted:mapbox-token]";u="[redacted:mapbox-token]";k="[redacted:google-api-key]"</script>`);
    expect(r.count).toBe(3);
    // Not a Mapbox token: a Slovak Wikipedia URL keeps its host.
    expect(redactSecrets(Buffer.from("https://sk.wikipedia.org/wiki/abcdefghijklmnopqrstuvwxyz"), "text/plain").count).toBe(0);
  });

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

describe("redactSecrets — email addresses are masked before a capture is written (ruling R3, tick 48)", () => {
  // Every address-shaped string here is built at runtime from its parts, so this file holds none: the repository is
  // public, and the masking exists because render-watch commits every capture to it (ruling R3 and the tick 45
  // review's defect 1, research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md).
  const at = (local: string, domain: string) => [local, domain].join("@");
  const person = at("first.last", "example.org");
  const list = at("organisers", "lists.example.org");
  const other = at("info", "example.net");
  const masked = (domain: string) => `[redacted:email]@${domain}`;
  const ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/;

  it("masks an address in HTML, plain text and JSON, keeping its domain, and counts it", () => {
    const html = redactSecrets(Buffer.from(`<p>Contact: ${person}</p>`), "text/html; charset=utf-8");
    expect(html.bytes.toString("utf8")).toBe(`<p>Contact: ${masked("example.org")}</p>`);
    expect(html.count).toBe(1);
    const text = redactSecrets(Buffer.from(`Write to ${person}.\n`), "text/plain");
    expect(text.bytes.toString("utf8")).toBe(`Write to ${masked("example.org")}.\n`);
    expect(text.count).toBe(1);
    const json = redactSecrets(Buffer.from(`{"contact":"${person}"}`), "application/json");
    expect(json.bytes.toString("utf8")).toBe(`{"contact":"${masked("example.org")}"}`);
    expect(json.count).toBe(1);
  });

  it("masks an address however the text around it starts and ends", () => {
    const edges = [["(", ")"], ["", "."], ["", ","], ["", "-"], ["<br>", "<br>"], ["'", "'"], ["", ""], ["\t", "\n"], ["Email:", ""], ["sip:", ";"]];
    for (const [before, after] of edges) {
      const r = redactSecrets(Buffer.from(`${before}${person}${after}`), "text/plain");
      expect(r.bytes.toString("utf8"), JSON.stringify([before, after])).toBe(`${before}${masked("example.org")}${after}`);
    }
  });

  it("masks every address on a page and counts each one, in one count with the secrets", () => {
    const key = ["sk", "test", "4eC39HqLyjWDarjtT1zdp7dc"].join("_");
    const page = `<li>${person}</li><li>${list}</li><li>${other}</li><li>${person}</li><code>${key}</code>`;
    const r = redactSecrets(Buffer.from(page), "text/html");
    expect(r.bytes.toString("utf8")).toBe(
      `<li>${masked("example.org")}</li><li>${masked("lists.example.org")}</li><li>${masked("example.net")}</li>` +
        `<li>${masked("example.org")}</li><code>[redacted:stripe-secret-key]</code>`,
    );
    expect(r.count).toBe(5);
  });

  it("masks a mailto: link's address, in its href and in its text", () => {
    const r = redactSecrets(Buffer.from(`<a href="mailto:${list}?subject=Rules">${list}</a>`), "text/html");
    expect(r.bytes.toString("utf8")).toBe(
      `<a href="mailto:${masked("lists.example.org")}?subject=Rules">${masked("lists.example.org")}</a>`,
    );
    expect(r.count).toBe(2);
    expect(redactSecrets(Buffer.from(`<a href="MAILTO:${list}">x</a>`), "text/html").count).toBe(1);
  });

  it("masks an address written with character references, which the extracted text would decode, and no other byte", () => {
    // Each character as a decimal reference, as some Markdown converters write a mailto link; and one bare &#x40;.
    const refs = (s: string) => [...s].map((c) => `&#${String(c.charCodeAt(0)).padStart(3, "0")};`).join("");
    const page =
      `<p>Chair: <a href="${refs("mailto")}:${refs(person)}">${refs(person)}</a> &amp; ` +
      `${at("x", "example.net").replace("@", "&#x40;")}&nbsp;&#169;</p>`;
    const r = redactSecrets(Buffer.from(page), "text/html");
    const out = r.bytes.toString("utf8");
    expect(out).toBe(
      `<p>Chair: <a href="${refs("mailto")}:${masked("example.org")}">${masked("example.org")}</a> &amp; ` +
        `${masked("example.net")}&nbsp;&#169;</p>`,
    );
    expect(r.count).toBe(3);
    expect(ADDRESS.test(extractText(page))).toBe(true);
    expect(ADDRESS.test(extractText(out))).toBe(false);
  });

  it("masks an address inside a script's escaped string, keeping the escapes around it", () => {
    const page = `<script>var c = "\\u003cb\\u003e${person}\\u003c/b\\u003e\\n${other}";</script>`;
    const r = redactSecrets(Buffer.from(page), "text/html");
    expect(r.bytes.toString("utf8")).toBe(
      `<script>var c = "\\u003cb\\u003e${masked("example.org")}\\u003c/b\\u003e\\n${masked("example.net")}";</script>`,
    );
    expect(r.count).toBe(2);
  });

  it("masks an address after a script's hex escape or any single-letter escape, but not after an escaped slash", () => {
    // Review finding 1 (tick 48): a \xHH escape (\x22 a quote, \x3c and \x3e angle brackets) ended no word, so an
    // address inside such a script string reached the committed .html whole.
    const escapes = ["\\x22", "\\x27", "\\x3c", "\\x3E", "\\u0022", "\\t", "\\n", "\\r", "\\b", "\\f", "\\v"];
    for (const escape of escapes) {
      const r = redactSecrets(Buffer.from(`<script>var s='${escape}${person}${escape}'</script>`), "text/html");
      expect(r.bytes.toString("utf8"), escape).toBe(`<script>var s='${escape}${masked("example.org")}${escape}'</script>`);
      expect(r.count, escape).toBe(1);
    }
    const page = `<script>u='https:\\x2F\\x2Fwww.example.com\\x2F${at("", "channel.name")}'; v='\\x2f${at("0123abcd", "o1.ingest.example.io")}'</script>`;
    const handles = redactSecrets(Buffer.from(page), "text/html");
    expect(handles.count).toBe(0);
    expect(handles.bytes.equals(Buffer.from(page))).toBe(true);
  });

  it("masks a mailto: or Email: address that follows a URL's query or a comma, not only one that stands alone", () => {
    // Review finding 3 (tick 48): the colon rule looked back across ?, =, &, comma, ; and # to any earlier /, and took
    // these for a URL's password.
    const cases = [
      [`<a href="/r?to=mailto:${person}">x</a>`, `<a href="/r?to=mailto:${masked("example.org")}">x</a>`],
      [`<td>https://example.org/,Email:${person}</td>`, `<td>https://example.org/,Email:${masked("example.org")}</td>`],
      [`<a href="/a?x=1&amp;to=mailto:${person}">x</a>`, `<a href="/a?x=1&amp;to=mailto:${masked("example.org")}">x</a>`],
      [`<a href="/contact#mailto:${person}">x</a>`, `<a href="/contact#mailto:${masked("example.org")}">x</a>`],
      [`see https://example.org/a;Email:${person}`, `see https://example.org/a;Email:${masked("example.org")}`],
      [`https://example.org/a|Email:${person}`, `https://example.org/a|Email:${masked("example.org")}`],
    ];
    for (const [page, expected] of cases) {
      const r = redactSecrets(Buffer.from(page), "text/html");
      expect(r.bytes.toString("utf8"), page.replace(person, "<address>")).toBe(expected);
      expect(r.count).toBe(1);
    }
  });

  it("leaves image names, paths, URL credentials and handles alone, byte-identical", () => {
    const hex = "9d417ae5210a64ce75de798dbf779eb32df15b6c649b58e889b9d41dcdb9866c";
    const page = [
      // A part after @ that ends in a file extension is an asset name: the retina images that fill many captures.
      `<img src="/img/${at("logo", "2x.png")}" srcset="${at("hero", "2x.jpg")} 2x, ${at("hero", "3x.webp")} 3x">`,
      `<img src="${at("logo", `2x-${hex}.png`)}"><img src="${at("Logo", "2X.PNG")}">`,
      `<img src="${at("spin", "2x.gif")}"><img src="${at("logo", "2x.svg")}"><img src="${at("logo", "2x.avif")}">`,
      `<link href="${at("icons", "2x.f3a9c1.css")}"><script src="${at("chunk", "1.2.3.js")}"></script>`,
      `<img src="${at("banner", "cdn.example.png")}"><a href="${at("guide", "docs.example.pdf")}">pdf</a>`,
      // A local part after / or : is a path or a URL's user: a list archive, a form path, a Sentry DSN.
      `<a href="https://lists.example.org/archive/list/${list}/thread/">archive</a>`,
      `<a href="https://forms.example.gov/mw/forms/${at("Form1", "agency.example.gov")}#!auth">form</a>`,
      `<script>init({dsn:"https://${at("0123abcd", "o1.ingest.example.io")}/4"})</script>`,
      // A local part after a : inside a URL or a path: a URL's password, a wiki page name.
      `<a href="https://${at("reader:s3cret", "git.example.org")}/repo.git">git</a>`,
      `<a href="https://wiki.example.org/wiki/User:${at("Someone", "example.org")}">user page</a>`,
      `<script>u = "https:\\u002F\\u002F${at("0123abcd", "o1.ingest.example.io")}\\u002F4"</script>`,
      // A handle after an escaped slash or bracket, and @ signs with no address at all.
      `<a href="https:\\u002F\\u002Fwww.example.com\\u002F${at("", "channel.name")}">c</a> \\u003e${at("", "handle.team")}`,
      `@media (min-width: 40rem) { a { color: red } } @import url(x.css); npm i ${at("react", "18.2.0")}; ssh ${at("user", "localhost")}`,
    ].join("\n");
    const r = redactSecrets(Buffer.from(page), "text/html");
    expect(r.count).toBe(0);
    expect(r.bytes.equals(Buffer.from(page))).toBe(true);
  });

  it("changes no other byte of a body that is not UTF-8", () => {
    // windows-1255 Hebrew around the address: a round trip through UTF-8 would turn each of these bytes into U+FFFD.
    const before = Buffer.from([0xf9, 0xec, 0xe5, 0xed, 0x20]);
    const after = Buffer.from([0x20, 0xe0, 0xf3]);
    const r = redactSecrets(Buffer.concat([before, Buffer.from(person), after]), "text/html; charset=windows-1255");
    expect(r.bytes.equals(Buffer.concat([before, Buffer.from(masked("example.org")), after]))).toBe(true);
    expect(r.count).toBe(1);
  });

  it("stores an HTML capture with its addresses masked in the body and in the .txt, and counts them in the meta", async () => {
    const out = tmpOut();
    const page = `<html><body><h1>Rules</h1><p>Chair: <a href="mailto:${person}">${person}</a></p><p>List: ${list}</p></body></html>`;
    const entry = { url: "https://rules.example.test/", slug: "ex-rules", lineNumber: 1 };
    const result = { status: 200, contentType: "text/html; charset=utf-8", bytes: Buffer.from(page), truncated: false, error: null };
    const { meta } = await storeCapture(entry, result, { outDir: out, now: () => T0 });
    const body = readFileSync(join(out, "ex-rules.html"));
    const text = readFileSync(join(out, "ex-rules.txt"), "utf8");
    for (const stored of [body.toString("utf8"), text]) expect(ADDRESS.test(stored)).toBe(false);
    expect(text).toBe(`Rules\nChair: ${masked("example.org")}\nList: ${masked("lists.example.org")}\n`);
    expect(meta.redacted).toBe(3);
    expect(meta.sha256).toBe(sha256(body));
    expect(meta.byteLength).toBe(body.length);
  });

  it("masks the extracted .txt itself: a reference the body keeps can decode into an address there", async () => {
    // Review finding 4 (tick 48): decodeEntities decodes hex, then decimal, then named references, so `&#x26;#64;` (an
    // ampersand, then `#64;`) becomes @ in the .txt, while the body's one-pass view of it is a literal `&#64;`.
    const out = tmpOut();
    const page = `<html><body><p>Chair: ${person.replace("@", "&#x26;#64;")}</p></body></html>`;
    const entry = { url: "https://rules.example.test/", slug: "ex-rules", lineNumber: 1 };
    const result = { status: 200, contentType: "text/html; charset=utf-8", bytes: Buffer.from(page), truncated: false, error: null };
    const { meta } = await storeCapture(entry, result, { outDir: out, now: () => T0 });
    const text = readFileSync(join(out, "ex-rules.txt"), "utf8");
    expect(ADDRESS.test(extractText(page))).toBe(true);
    expect(ADDRESS.test(text)).toBe(false);
    expect(text).toBe(`Chair: ${masked("example.org")}\n`);
    expect(meta.redacted).toBe(1);
    const body = readFileSync(join(out, "ex-rules.html"));
    expect(body.equals(Buffer.from(page))).toBe(true);
    expect(meta.sha256).toBe(sha256(body));
  });

  it("masks an address in a PDF's extracted text and counts it, leaving the PDF bytes and hash alone", async () => {
    const out = tmpOut();
    const { meta } = await storeCapture(PDF_ENTRY, pdfResult(), {
      outDir: out,
      now: () => T0,
      extractPdfText: async () => `Contact ${person} or ${list}\n`,
    });
    expect(readFileSync(join(out, "ex-terms-pdf.txt"), "utf8")).toBe(
      `Contact ${masked("example.org")} or ${masked("lists.example.org")}\n`,
    );
    expect(meta.redacted).toBe(2);
    expect(meta.sha256).toBe(sha256(PDF_BYTES));
    expect(readFileSync(join(out, "ex-terms-pdf.pdf")).equals(PDF_BYTES)).toBe(true);
  });
});


describe("redactSecrets — addresses whose @ is encoded: %40, a script escape, Cloudflare's email protection (tick 50)", () => {
  // As above, no address is written in this file: each is built from its parts at run time, and so is every Cloudflare
  // hex (an address encoded at run time). The decoded local part is asserted absent from everything redactSecrets returns.
  const at = (local: string, domain: string, sep = "@") => [local, domain].join(sep);
  const PCT = ["%", "40"].join("");
  const masked = (domain: string, sep = "@") => `[redacted:email]${sep}${domain}`;
  // Cloudflare's encoding: the first byte is the key, each byte of the address (UTF-8) XORed with it, all in hex.
  const cf = (address: string, key = 0x5a) =>
    [key, ...Buffer.from(address, "utf8").map((b) => b ^ key)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const mask = (page: string, type = "text/html") => {
    const r = redactSecrets(Buffer.from(page), type) as { bytes: Buffer; count: number };
    return { out: r.bytes.toString("latin1"), count: r.count, all: `${r.bytes.toString("latin1")}${JSON.stringify(r)}` };
  };
  const idempotent = (out: string) => {
    const again = redactSecrets(Buffer.from(out, "latin1"), "text/html") as { bytes: Buffer; count: number };
    expect(again.count, out).toBe(0);
    expect(again.bytes.toString("latin1")).toBe(out);
  };

  it("masks a %40 address in an href and in a query string, keeping %40 and the domain, and counts each", () => {
    const page =
      `<a href="mailto:${at("first.last", "example.org", PCT)}">write</a>\n` +
      `<a href="/search?username=${at("user123", "example.net", PCT)}&amp;page=2">next</a>`;
    const { out, count } = mask(page);
    expect(out).toBe(
      `<a href="mailto:${masked("example.org", PCT)}">write</a>\n` +
        `<a href="/search?username=${masked("example.net", PCT)}&amp;page=2">next</a>`,
    );
    expect(count).toBe(2);
    idempotent(out);
  });

  it("reads the local part as the plain matcher would read the decoded text: its escapes are in it, an encoded space ends it", () => {
    // A percent-encoded Markdown blob (as HackMD stores a note): two addresses, encoded text between them.
    const blob =
      `data-md="Write%20to%20${at(["first", "last"].join("%2B"), "example.org", PCT)}%60%20or%20%60` +
      `${at("help", "lists.example.org", PCT)}%60.%0A"`;
    const { out, count } = mask(blob);
    expect(out).toBe(`data-md="Write%20to%20${masked("example.org", PCT)}%60%20or%20%60${masked("lists.example.org", PCT)}%60.%0A"`);
    expect(count).toBe(2);
    idempotent(out);
  });

  it("leaves what the plain matcher leaves: an asset name, a local part after a slash or %2F, a URL password, a handle", () => {
    const page = [
      `<img src="/img/${at("logo", "2x.png", PCT)}"><img src="${at("hero", "2x-0a1b2c.webp", PCT)}">`,
      `<a href="https://lists.example.org/archive/${at("list", "lists.example.org", PCT)}/">archive</a>`,
      `<a href="/share?u=https%3A%2F%2Flists.example.org%2Farchive%2F${at("list", "lists.example.org", PCT)}">share</a>`,
      `<a href="/go?to=https%3A%2F%2F${at("reader%3As3cret", "git.example.org", PCT)}%2Frepo.git">git</a>`,
      `<a href="https://video.example.com/${PCT}someone%2Fvideo%2F123">handle</a> ${at("", "handle.team", PCT)}`,
    ].join("\n");
    const { out, count } = mask(page);
    expect(count).toBe(0);
    expect(out).toBe(page);
  });

  it("masks an address whose @ is a script escape, \\u0040 or \\x40, keeping the escape", () => {
    const page = `<script>var a = "${at("first.last", "example.org", "\\u0040")}", b = '${at("info", "example.net", "\\x40")}';</script>`;
    const { out, count } = mask(page);
    expect(out).toBe(`<script>var a = "${masked("example.org", "\\u0040")}", b = '${masked("example.net", "\\x40")}';</script>`);
    expect(count).toBe(2);
    idempotent(out);
    expect(mask(`<script>s = "\\u0040media x"; t = "${at("logo", "2x.png", "\\u0040")}"</script>`).count).toBe(0);
  });

  it("masks Cloudflare's email protection, the span and the anchor, keeping only the domain of the address it decodes", () => {
    const local = ["chair", "person"].join(".");
    const hex = cf(at(local, "example.org"));
    const other = cf(at("info", "example.net"), 0x3c).toUpperCase();
    const page =
      `<p>Chair: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${hex}">[email&#160;protected]</a></p>\n` +
      `<p><a href="/cdn-cgi/l/email-protection#${other}">write to us</a></p>`;
    const { out, count, all } = mask(page);
    expect(out).toBe(
      `<p>Chair: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${masked("example.org")}">[email&#160;protected]</a></p>\n` +
        `<p><a href="/cdn-cgi/l/email-protection#${masked("example.net")}">write to us</a></p>`,
    );
    expect(count).toBe(2);
    // The decoded local part is nowhere in what comes back, nor the hex that carries it.
    for (const s of [local, "info", hex, other]) expect(all).not.toContain(s);
    idempotent(out);
    // An anchor encodes the whole mailto target: a query after the address goes with the mask, the domain stays.
    const subject = cf(`${at(local, "example.org")}?subject=Entry%20question`);
    expect(mask(`<a href="/cdn-cgi/l/email-protection#${subject}">x</a>`).out).toBe(`<a href="/cdn-cgi/l/email-protection#${masked("example.org")}">x</a>`);
  });

  it("writes the bare mask for a Cloudflare hex that does not decode to one address: odd, too short, no @, two @", () => {
    const cases = [
      ["abc", "odd length"],
      [`${cf(at("x", "example.org"))}0`, "one address and a stray digit: odd length"],
      ["5a", "the key alone"],
      [cf("no address here"), "no @"],
      [cf(`${at("a", "b.example.org")} ${at("c", "d.example.org")}`), "two addresses"],
      [cf(at("x", "nodot")), "a domain with no dot"],
    ];
    for (const [hex, why] of cases) {
      const { out, count, all } = mask(`<span data-cfemail="${hex}">x</span><a href="/cdn-cgi/l/email-protection#${hex}">y</a>`);
      expect(out, why).toBe(`<span data-cfemail="[redacted:email]">x</span><a href="/cdn-cgi/l/email-protection#[redacted:email]">y</a>`);
      expect(count, why).toBe(2);
      expect(all, why).not.toContain(hex);
      idempotent(out);
    }
    // Not a hex value at all: nothing to decode and nothing masked.
    expect(mask(`<a href="/cdn-cgi/l/email-protection#contact">x</a>`).count).toBe(0);
  });

  it("still masks a plain address after an encoded slash or backslash, exactly as the masker before tick 50 did (review fix)", () => {
    // The decoded view must not take a plain @ away from the rule that masked it: before tick 50 each of these was masked,
    // its local part read from the raw text (where %2F is three local-part characters, not a slash).
    const local = ["sam", "ple"].join("");
    const cases: [string, string][] = [
      [`see=%2F${at(local, "example.org")}`, `see=${masked("example.org")}`],
      [`see=%5C${at(local, "example.org")}`, `see=${masked("example.org")}`],
      [`{"next":"%2Fusers%2F${at(local, "example.org")}"}`, `{"next":"${masked("example.org")}"}`],
      [`share?text=Mail%20me%3A%2F${at(local, "example.org")}`, `share?text=${masked("example.org")}`],
      [`/go?u=https%3A%2F%2Fh.org%2Fp%3A${at(local, "example.org")}`, `/go?u=${masked("example.org")}`],
    ];
    for (const [page, want] of cases) {
      const { out, count, all } = mask(page);
      expect(out, page).toBe(want);
      expect(count, page).toBe(1);
      expect(all, page).not.toContain(local);
      idempotent(out);
    }
    // A plain address the raw rule leaves (its word runs on from a path) but whose boundary is an encoded space: the
    // decoded view finds it, and it stays masked.
    expect(mask(`/search/Contact%20${at(local, "example.org")}`)).toMatchObject({ out: `/search/Contact%20${masked("example.org")}`, count: 1 });
  });

  it("masks a Cloudflare value however its attribute is quoted or escaped: single quotes, none, in a JSON string, an entity, a script escape", () => {
    const local = ["chair", "person"].join(".");
    const hex = cf(at(local, "example.org"));
    for (const q of ["'", "", '\\"', "&quot;", "&#34;", "&#x22;", "\\u0022", "\\x22"]) {
      const { out, count, all } = mask(`<span class="__cf_email__" data-cfemail=${q}${hex}${q}>x</span>`);
      expect(out, q).toBe(`<span class="__cf_email__" data-cfemail=${q}${masked("example.org")}${q}>x</span>`);
      expect(count, q).toBe(1);
      for (const s of [local, hex]) expect(all, q).not.toContain(s);
      idempotent(out);
    }
  });

  it("leaves a URL's password alone when its @ is a script escape, as it does when the @ is plain or %40", () => {
    const secret = ["s3", "cret"].join("");
    for (const sep of ["\\u0040", "\\x40", "@", PCT]) {
      const page = `<script>u = "https://reader:${at(secret, "git.example.org", sep)}/repo.git"</script>`;
      expect(mask(page), sep).toMatchObject({ out: page, count: 0 });
    }
  });

  it("counts the encoded forms in the meta's redacted with the plain ones, and stores the body masked", async () => {
    const out = tmpOut();
    const hex = cf(at("e.f", "example.net"));
    const page =
      `<html><body><p>Mail <a href="mailto:${at("a.b", "example.org", PCT)}">us</a>, ${at("c.d", "example.org")}, ` +
      `<span class="__cf_email__" data-cfemail="${hex}">[email&#160;protected]</span></p></body></html>`;
    const entry = { url: "https://rules.example.test/", slug: "ex-rules", lineNumber: 1 };
    const result = { status: 200, contentType: "text/html; charset=utf-8", bytes: Buffer.from(page), truncated: false, error: null };
    const { meta } = await storeCapture(entry, result, { outDir: out, now: () => T0 });
    const body = readFileSync(join(out, "ex-rules.html"), "utf8");
    for (const gone of ["a.b", "c.d", hex]) expect(body).not.toContain(gone);
    expect(body).toContain(`data-cfemail="${masked("example.net")}"`);
    expect(readFileSync(join(out, "ex-rules.txt"), "utf8")).not.toContain("c.d");
    expect(meta.redacted).toBe(3);
    expect(meta.sha256).toBe(sha256(readFileSync(join(out, "ex-rules.html"))));
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
    // Since 30.9 every capture also records what its host's robots.txt said (ruling 30.9 16(d) D2(v)). The stub
    // answers every URL, robots.txt included, with the same HTML page, which parses to no rules: allowed.
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
      "robots",
      "robotsUrl",
      "changed",
      "firstFetch",
      "previousSha256",
      "note",
    ]);
    expect(meta).toMatchObject({
      robots: "allowed",
      robotsUrl: "https://example.test/robots.txt",
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

// ---------------------------------------------------------------------------
// A copying-barred site's page (RULING-2026-10-06-robots-and-terms.md decision 4(1), ruling 6.10 row 21 (d), and its
// amendment 1: a public repository's workflow artifacts are not private, so nothing is uploaded). The body is retained
// nowhere: the tree gets the meta with a trimmed block saying so and, for a page with a text, an emptied .txt of the same
// line count; the fetch step lists the slugs it stored that way for the commit step's guard.
// ---------------------------------------------------------------------------

describe("the copying-barred sites, from terms-verdicts.json's copying field", () => {
  it("reads the barred sites of the real file, and matches a site or any subdomain of it, the longest first", () => {
    const barred = readCopyingBarred();
    expect(barred).toEqual(expect.arrayContaining(["apify.com", "btl.gov.il", "devpost.com", "indiebook.co.il", "kaggle.com", "worksheets4kids.co.il"]));
    expect(barred).not.toContain("virtualembryo.ai"); // copying: allowed
    expect(copyingBarredSite("www.btl.gov.il", barred)).toBe("btl.gov.il");
    expect(copyingBarredSite("WWW.BTL.GOV.IL.", barred)).toBe("btl.gov.il");
    expect(copyingBarredSite("api.apify.com", barred)).toBe("apify.com");
    expect(copyingBarredSite("notbtl.gov.il", barred)).toBeNull();
    expect(copyingBarredSite("btl.gov.il.example.org", barred)).toBeNull();
    expect(copyingBarredSite("a.b.example", ["b.example", "a.b.example"])).toBe("a.b.example");
    expect(copyingBarredSites({ x: { copying: "barred" }, y: { copying: "unread" }, z: {} })).toEqual(["x"]);
  });

  it("throws when the verdicts file cannot be read, so the run stops before any fetch", async () => {
    const dir = tmpOut();
    expect(() => readCopyingBarred(join(dir, "missing.json"))).toThrow(/cannot read the copying field/);
    writeFileSync(join(dir, "v.json"), '{"nope":1}');
    expect(() => readCopyingBarred(join(dir, "v.json"))).toThrow(/no "sites"/);
    const fetched: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      fetched.push(String(url));
      return new Response("x", { status: 200, headers: { "content-type": "text/plain" } });
    });
    try {
      await expect(main(["--list", writeList(dir, "https://example.test/a\tex-a"), "--out", dir], {}, { verdictsPath: join(dir, "missing.json") })).rejects.toThrow(/cannot read the copying field/);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetched).toEqual([]);
  });

  it("empties every line and keeps the count", () => {
    expect(emptiedLines("a\nb\nc\n")).toBe("\n\n\n");
    expect(emptiedLines("a")).toBe("");
    expect(emptiedLines("a\nb\nc\n").split("\n")).toHaveLength(4);
  });
});

/**
 * Run fn with os.tmpdir() pointed at a fresh empty directory (TMPDIR), and hand it that directory: a test can then show
 * that the route wrote nothing outside the tree, not even a temporary file it forgot.
 */
async function withFreshTmpdir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = tmpOut();
  const before = process.env.TMPDIR;
  process.env.TMPDIR = dir;
  try {
    expect(tmpdir()).toBe(dir);
    return await fn(dir);
  } finally {
    if (before === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = before;
  }
}

describe("storeCapture and main — a copying-barred site's page: meta and an emptied text in the tree, the body retained nowhere (amendment 1)", () => {
  const ENTRY = { url: "https://www.barred.test/terms", slug: "bar-terms", lineNumber: 1 };
  // An address in the page (built, not written: no address is written into this repository), masked as on any route.
  const html = `<html><body><h1>Terms</h1><p>One.</p><p>Two.</p><p>Write to ${["someone", "barred.test"].join("@")}.</p></body></html>`;
  const T0 = "2026-10-06T05:00:00.000Z";
  const T1 = "2026-10-13T05:00:00.000Z";
  const result = (body: string, contentType = "text/html; charset=utf-8") => ({ status: 200, contentType, bytes: Buffer.from(body), truncated: false, error: null, robots: "allowed", robotsUrl: "https://www.barred.test/robots.txt" });
  const store = (out: string, body = html, now = T0, contentType?: string) => storeCapture(ENTRY, result(body, contentType), { outDir: out, now: () => now, copying: "barred.test" });
  /** The body as any route stores it: masked. */
  const masked = (body: string, contentType = "text/html; charset=utf-8") => redactSecrets(Buffer.from(body), contentType).bytes as Buffer;
  const FULL_TEXT = "Terms\nOne.\nTwo.\nWrite to [redacted:email]@barred.test.\n";

  it("says in plain words where the full bytes are: nowhere", () => {
    expect(NOT_RETAINED).toBe("not retained (ruling 6.10 row 21 amendment 1: a public repository's workflow artifacts are not private)");
    expect(NOT_RETAINED_HISTORY).toMatch(/^The full bytes were not retained: never in the tree, in git history or in a workflow artifact \(ruling 6\.10 row 21 amendment 1/);
  });

  it("writes to the tree only the meta, with a trimmed block saying the body was not retained, and an emptied .txt; nothing anywhere else", async () => {
    const out = tmpOut();
    const { meta, barred, scratch } = await withFreshTmpdir(async (scratch) => ({ ...(await store(out)), scratch }));
    expect(barred).toBe(true);
    expect(readdirSync(out).sort()).toEqual(["bar-terms.meta.json", "bar-terms.txt"]);
    // No temporary copy either: the directory os.tmpdir() named during the call is as empty as it was.
    expect(readdirSync(scratch)).toEqual([]);
    const body = masked(html);
    expect(body.toString("utf8")).toContain("[redacted:email]@barred.test");
    const raw = readFileSync(join(out, "bar-terms.meta.json"), "utf8");
    const tree = JSON.parse(raw);
    expect(raw).toBe(`${JSON.stringify(tree, null, 2)}\n`);
    expect(meta).toEqual(tree);
    // The meta as the plain route writes it (its sha256 the verification hash), and the trimmed block last.
    expect(tree).toMatchObject({ sha256: sha256(body), byteLength: body.length, bodyPath: "research/rendered/bar-terms.html", textPath: "research/rendered/bar-terms.txt", redacted: 1, changed: true });
    expect(Object.keys(tree).at(-1)).toBe("trimmed");
    expect(tree.trimmed).toEqual({
      on: "2026-10-06",
      ruling: COPYING_RULING,
      site: "barred.test",
      copying: "barred",
      keptLines: [],
      context: 2,
      fullSha256: sha256(Buffer.from(FULL_TEXT)),
      fullByteLength: Buffer.byteLength(FULL_TEXT),
      lineCount: 5,
      body: { path: "research/rendered/bar-terms.html", sha256: sha256(body), byteLength: body.length, lineCount: 1, keptLines: [], inTree: false },
      cited: [],
      wide: [],
      captureCheck: null,
      fullBytesIn: NOT_RETAINED,
      history: NOT_RETAINED_HISTORY,
      artifact: null,
    });
    // The text in the tree: the same number of lines, none of the page.
    expect(readFileSync(join(out, "bar-terms.txt"), "utf8")).toBe("\n\n\n\n");
    expect(raw).not.toContain("One.");
  });

  it("writes nothing at all when the same bytes come back", async () => {
    const out = tmpOut();
    await store(out);
    const before = snapshot(out);
    const again = await store(out, html, T1);
    expect(again.meta.changed).toBe(false);
    expect(again.meta.fetchedAt).toBe(T0);
    expect(snapshot(out)).toEqual(before);
  });

  it("takes an older full copy of the slug out of the tree when the page changes", async () => {
    const out = tmpOut();
    // As the plain route stored it before the copying field existed.
    await storeCapture(ENTRY, result(html), { outDir: out, now: () => T0 });
    expect(readdirSync(out).sort()).toEqual(["bar-terms.html", "bar-terms.meta.json", "bar-terms.txt"]);
    const changed = html.replace("Two.", "Two and a half.");
    const { meta } = await store(out, changed, T1);
    expect(meta.changed).toBe(true);
    expect(meta.firstFetch).toBe(false);
    expect(meta.sha256).toBe(sha256(masked(changed)));
    expect(readdirSync(out).sort()).toEqual(["bar-terms.meta.json", "bar-terms.txt"]);
    expect(readFileSync(join(out, "bar-terms.txt"), "utf8")).toBe("\n\n\n\n");
  });

  it("keeps a JSON body out of the tree too, with no text at all", async () => {
    const out = tmpOut();
    const json = '{"items":[{"name":"x"}]}';
    await store(out, json, T0, "application/json");
    expect(readdirSync(out)).toEqual(["bar-terms.meta.json"]);
    const tree = JSON.parse(readFileSync(join(out, "bar-terms.meta.json"), "utf8"));
    expect(tree.textPath).toBeNull();
    expect(tree.trimmed).toMatchObject({ fullSha256: null, lineCount: null, body: { path: "research/rendered/bar-terms.json", sha256: sha256(Buffer.from(json)), inTree: false }, fullBytesIn: NOT_RETAINED, artifact: null });
  });

  it("extracts a PDF's text from a temporary copy that is deleted as soon as pdftotext is done, also when it fails; the PDF is written nowhere else", async () => {
    const pdf = "%PDF-1.4 x";
    for (const fails of [false, true]) {
      const out = tmpOut();
      const seen: Array<{ path: string; bytes: string }> = [];
      const { meta, scratch } = await withFreshTmpdir(async (scratch) => ({
        ...(await storeCapture(ENTRY, result(pdf, "application/pdf"), {
          outDir: out,
          now: () => T0,
          copying: "barred.test",
          extractPdfText: async (path: string) => {
            seen.push({ path, bytes: readFileSync(path, "utf8") });
            if (fails) throw Object.assign(new Error("Command failed: pdftotext"), { code: 1 });
            return "page one\npage two\n";
          },
        })),
        scratch,
      }));
      expect(seen, String(fails)).toHaveLength(1);
      expect(seen[0].path.startsWith(scratch), seen[0].path).toBe(true);
      expect(seen[0].path.endsWith("bar-terms.pdf")).toBe(true);
      expect(seen[0].bytes).toBe(pdf);
      expect(existsSync(seen[0].path)).toBe(false);
      expect(readdirSync(scratch), String(fails)).toEqual([]);
      if (fails) {
        expect(readdirSync(out)).toEqual(["bar-terms.meta.json"]);
        expect(meta.textError).toMatch(/pdftotext/);
        expect(meta.trimmed).toMatchObject({ fullSha256: null, lineCount: null, body: { path: "research/rendered/bar-terms.pdf", inTree: false } });
      } else {
        expect(readdirSync(out).sort()).toEqual(["bar-terms.meta.json", "bar-terms.txt"]);
        expect(readFileSync(join(out, "bar-terms.txt"), "utf8")).toBe("\n\n");
        expect(meta.textPath).toBe("research/rendered/bar-terms.txt");
        expect(meta.trimmed).toMatchObject({ fullSha256: sha256(Buffer.from("page one\npage two\n")), lineCount: 3, body: { sha256: sha256(Buffer.from(pdf)), inTree: false } });
      }
    }
  });

  it("keeps the trimmed block through a failed fetch (a non-2xx, a timeout: no bytes), and a later success writes a fresh one", async () => {
    const out = tmpOut();
    await store(out);
    const routed = JSON.parse(readFileSync(join(out, "bar-terms.meta.json"), "utf8"));
    const txt = readFileSync(join(out, "bar-terms.txt"));
    const failure = (error: string, status: number | null) => ({ status, contentType: status ? "text/html" : null, bytes: null, truncated: false, error });
    // The site still barred, then (a verdict changed) no longer: a failed fetch writes no file either way, so the block stays.
    for (const [copying, error, status] of [
      ["barred.test", "HTTP 503 Service Unavailable", 503],
      [null, "timeout after 30000ms (AbortError: This operation was aborted)", null],
    ] as const) {
      const { meta } = await storeCapture(ENTRY, failure(error, status), { outDir: out, now: () => T1, copying });
      expect(meta.changed, error).toBe(true);
      const tree = JSON.parse(readFileSync(join(out, "bar-terms.meta.json"), "utf8"));
      expect(tree, error).toMatchObject({ error, status, sha256: null, bodyPath: null });
      expect(tree.trimmed, error).toEqual(routed.trimmed);
      expect(Object.keys(tree).at(-1)).toBe("trimmed");
      expect(readdirSync(out).sort()).toEqual(["bar-terms.meta.json", "bar-terms.txt"]);
      expect(readFileSync(join(out, "bar-terms.txt"))).toEqual(txt);
    }
    // The page back: the route stores it again, with a block of its own.
    const back = await store(out, html, "2026-10-20T05:00:00.000Z");
    expect(back.meta.changed).toBe(true);
    expect(back.meta.trimmed).toMatchObject({ on: "2026-10-20", fullSha256: routed.trimmed.fullSha256, body: { sha256: routed.trimmed.body.sha256 } });
    // A plain page's failed fetch gains no block.
    const plainOut = tmpOut();
    await storeCapture(ENTRY, result(html), { outDir: plainOut, now: () => T0 });
    await storeCapture(ENTRY, failure("HTTP 503", 503), { outDir: plainOut, now: () => T1 });
    expect(JSON.parse(readFileSync(join(plainOut, "bar-terms.meta.json"), "utf8")).trimmed).toBeUndefined();
  });

  it("stores a failed fetch of a barred site as any failed fetch: a meta, nothing else", async () => {
    const out = tmpOut();
    await storeCapture(ENTRY, { status: 403, contentType: "text/html", bytes: null, truncated: false, error: "HTTP 403" }, { outDir: out, now: () => T0, copying: "barred.test" });
    expect(readdirSync(out)).toEqual(["bar-terms.meta.json"]);
    expect(JSON.parse(readFileSync(join(out, "bar-terms.meta.json"), "utf8")).trimmed).toBeUndefined();
  });

  it("fetchOne: a redirect from a URL not on a copying-barred site to one that is is refused before it is requested; one inside a barred site is followed", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string) => {
      calls.push(url);
      if (url === "https://go.open.test/x") return new Response(null, { status: 301, headers: { location: "https://WWW.Barred.test/terms" } });
      if (url === "https://barred.test/old") return new Response(null, { status: 302, headers: { location: "/terms" } });
      return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    };
    const into = await fetchOne({ url: "https://go.open.test/x", slug: "redir-page", lineNumber: 1 }, { fetchImpl, copyingBarred: ["barred.test"] });
    expect(into).toEqual({ status: 301, contentType: null, bytes: null, truncated: false, error: copyingRedirectError("barred.test", "www.barred.test") });
    expect(into.error).toBe(
      "redirected to barred.test (www.barred.test), whose terms bar copying (ruling 6.10 row 21 (d)); not followed: list that page by its own URL, so the copying-barred route keeps it out of the tree",
    );
    expect(calls).toEqual(["https://go.open.test/x"]);
    // Within the barred site: followed (the route takes the page by its listed URL).
    calls.length = 0;
    const within = await fetchOne({ url: "https://barred.test/old", slug: "bar-old", lineNumber: 1 }, { fetchImpl, copyingBarred: ["barred.test"] });
    expect(within.bytes?.toString("utf8")).toBe(html);
    expect(calls).toEqual(["https://barred.test/old", "https://barred.test/terms"]);
    // No barred list (the default): followed, as before.
    const none = await fetchOne({ url: "https://go.open.test/x", slug: "redir-page", lineNumber: 1 }, { fetchImpl });
    expect(none.bytes?.toString("utf8")).toBe(html);
  });

  it("main: a page redirected into a copying-barred site lands nowhere in full: a failure meta in the tree, and the barred list stays empty", async () => {
    const out = tmpOut();
    const barredList = join(tmpOut(), "barred-slugs.txt");
    const fetched: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      fetched.push(String(url));
      if (new URL(String(url)).pathname === "/robots.txt") return new Response(null, { status: 404 });
      if (String(url) === "https://go.open.test/x") return new Response(null, { status: 301, headers: { location: "https://www.barred.test/terms" } });
      return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    });
    const stdout = captureStdout();
    try {
      const list = writeList(out, "https://go.open.test/x\tredir-page");
      expect(await main(["--list", list, "--out", out], { RENDER_WATCH_BARRED_LIST: barredList }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
    } finally {
      stdout.restore();
      vi.unstubAllGlobals();
    }
    expect(readdirSync(out).sort()).toEqual(["redir-page.meta.json", "urls.txt"]);
    expect(readFileSync(barredList, "utf8")).toBe("");
    const meta = JSON.parse(readFileSync(join(out, "redir-page.meta.json"), "utf8"));
    expect(meta).toMatchObject({ url: "https://go.open.test/x", status: 301, sha256: null, bodyPath: null, error: copyingRedirectError("barred.test", "www.barred.test") });
    expect(fetched).not.toContain("https://www.barred.test/terms");
  });

  it("main: a barred site's page is stored as a meta and an emptied text beside an ordinary page stored as always; its slug goes to RENDER_WATCH_BARRED_LIST, and the log and the summary say the body was not retained", async () => {
    const out = tmpOut();
    const work = tmpOut();
    const barredList = join(work, "barred-slugs.txt");
    // A list left over from an earlier run on the same runner is replaced, not appended to.
    writeFileSync(barredList, "stale-slug\n");
    const outputs = join(work, "out.txt");
    const summary = join(work, "summary.md");
    writeFileSync(outputs, "");
    vi.stubGlobal("fetch", async () => new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }));
    const stdout = captureStdout();
    let scratch = "";
    try {
      const list = writeList(out, "https://www.barred.test/terms\tbar-terms\nhttps://open.test/terms\topen-terms");
      const env = { RENDER_WATCH_BARRED_LIST: barredList, GITHUB_OUTPUT: outputs, GITHUB_STEP_SUMMARY: summary, GITHUB_RUN_ID: "9" };
      await withFreshTmpdir(async (dir) => {
        scratch = dir;
        expect(await main(["--list", list, "--out", out], env, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
      });
    } finally {
      stdout.restore();
      vi.unstubAllGlobals();
    }
    expect(readdirSync(out).sort()).toEqual(["bar-terms.meta.json", "bar-terms.txt", "open-terms.html", "open-terms.meta.json", "open-terms.txt", "urls.txt"]);
    expect(readdirSync(scratch)).toEqual([]);
    expect(readFileSync(barredList, "utf8")).toBe("bar-terms\n");
    const tree = JSON.parse(readFileSync(join(out, "bar-terms.meta.json"), "utf8"));
    expect(tree.trimmed).toMatchObject({ fullBytesIn: NOT_RETAINED, history: NOT_RETAINED_HISTORY, artifact: null });
    expect(JSON.parse(readFileSync(join(out, "open-terms.meta.json"), "utf8")).trimmed).toBeUndefined();
    // Nothing is uploaded, so the workflow is told nothing about these pages beyond what it always was.
    expect(readFileSync(outputs, "utf8")).toBe("js_skipped=0\n");
    expect(stdout.text()).toMatch(/new\s+bar-terms .*\[copying barred: barred\.test; body not retained, meta and emptied text to the tree\]/);
    expect(stdout.text()).toMatch(/1 page\(s\) of copying-barred sites stored as a meta and an emptied text: body not retained \(ruling 6\.10 row 21 amendment 1\)\./);
    const said = readFileSync(summary, "utf8");
    expect(said).toContain(`- \`bar-terms\` — ${tree.byteLength} bytes, text/html; charset=utf-8; copying barred (barred.test): body not retained (sha256 ${tree.sha256.slice(0, 12)} in the meta)`);
    expect(said).toContain("1 page(s) of copying-barred sites stored as a meta and an emptied text: body not retained");
    expect(`${stdout.text()}${said}`).not.toMatch(/artifact/i);
    expect(existsSync(join(out, "bar-terms.html"))).toBe(false);
  });

  it("main: RENDER_WATCH_BARRED_LIST is created empty when no page of a barred site is stored, even for a list with no line; an unwritable one stops the run", async () => {
    const out = tmpOut();
    const work = tmpOut();
    vi.stubGlobal("fetch", async () => new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }));
    const stdout = captureStdout();
    try {
      const open = join(work, "open.txt");
      expect(await main(["--list", writeList(out, "https://open.test/terms\topen-terms"), "--out", out], { RENDER_WATCH_BARRED_LIST: open }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
      expect(readFileSync(open, "utf8")).toBe("");
      const none = join(work, "none.txt");
      writeFileSync(join(work, "empty-list.txt"), "# nothing to fetch\n");
      expect(await main(["--list", join(work, "empty-list.txt"), "--out", out], { RENDER_WATCH_BARRED_LIST: none }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
      expect(readFileSync(none, "utf8")).toBe("");
      // Unchanged pages of a barred site are not listed: nothing of them was written.
      const again = join(work, "again.txt");
      const barredUrl = writeList(out, "https://www.barred.test/terms\tbar-terms");
      expect(await main(["--list", barredUrl, "--out", out], { RENDER_WATCH_BARRED_LIST: join(work, "first.txt") }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
      expect(readFileSync(join(work, "first.txt"), "utf8")).toBe("bar-terms\n");
      expect(await main(["--list", barredUrl, "--out", out], { RENDER_WATCH_BARRED_LIST: again }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
      expect(readFileSync(again, "utf8")).toBe("");
      await expect(main(["--list", barredUrl, "--out", out], { RENDER_WATCH_BARRED_LIST: join(work, "no-such-dir", "list.txt") }, { copyingBarred: ["barred.test"], delayMs: 0 })).rejects.toThrow(/ENOENT/);
    } finally {
      stdout.restore();
      vi.unstubAllGlobals();
    }
  });
});

describe(".github/workflows/render-watch.yml — nothing uploaded; the commit step refuses a copying-barred body by the fetch step's list (amendment 1)", () => {
  const raw = readFileSync(".github/workflows/render-watch.yml", "utf8");
  const wf = parse(raw) as { jobs: { render: { steps: Array<Record<string, any>> } } };
  const steps = wf.jobs.render.steps;
  const named = (prefix: string) => {
    const s = steps.find((x) => String(x.name ?? "").startsWith(prefix));
    if (!s) throw new Error(`no step "${prefix}"`);
    return s;
  };
  const fetchStep = named("Fetch the pages");
  const commit = named("Commit the fetched pages");
  const LIST = "${{ runner.temp }}/render-watch-barred-slugs.txt";
  const run = String(commit.run);
  const guardAt = run.indexOf('if [ ! -f "${RENDER_WATCH_BARRED_LIST:-}" ]; then');
  const guard = run.slice(guardAt, run.indexOf("# Stage first"));

  it("uploads nothing: no step uses upload-artifact, and nothing names an artifact directory, a retention or a barred count", () => {
    for (const s of steps) expect(String(s.uses ?? ""), String(s.name)).not.toMatch(/upload-artifact/);
    expect(raw).not.toMatch(/RENDER_WATCH_ARTIFACT|retention-days|outputs\.barred|render-watch-barred\//);
    expect(steps.some((s) => String(s.name ?? "").startsWith("Keep the bodies of copying-barred pages"))).toBe(false);
  });

  it("says why, in the fetch step's comment: amendment 1, and a public repository's artifacts are not private", () => {
    const comment = raw.slice(raw.indexOf("- name: Fetch the pages"), raw.indexOf("RENDER_WATCH_BARRED_LIST:"));
    expect(comment).toMatch(/amendment 1/);
    expect(comment).toMatch(/on a public repository\s+# anyone signed in to GitHub can download a run's artifacts, so an artifact is not private/);
  });

  it("hands the fetch step and the commit step the same list path, outside the checkout", () => {
    expect(fetchStep.env.RENDER_WATCH_BARRED_LIST).toBe(LIST);
    expect(commit.env.RENDER_WATCH_BARRED_LIST).toBe(LIST);
    expect(Object.keys(fetchStep.env).filter((k) => /ARTIFACT/.test(k))).toEqual([]);
  });

  it("runs the guard before anything is staged", () => {
    expect(guardAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(run.indexOf("git add research/rendered/"));
    expect(guard).toMatch(/for ext in html json pdf xml bin; do/);
  });

  /** The guard as the workflow runs it (bash, -euo pipefail), in a checkout-shaped temp directory. */
  function runGuard(files: string[], list: string | null, { unset = false } = {}) {
    const root = tmpOut();
    mkdirSync(join(root, "research", "rendered"), { recursive: true });
    for (const f of files) writeFileSync(join(root, "research", "rendered", f), "x\n");
    const listPath = join(tmpOut(), "barred-slugs.txt");
    if (list !== null) writeFileSync(listPath, list);
    const env: Record<string, string | undefined> = { ...process.env, RENDER_WATCH_BARRED_LIST: listPath };
    if (unset) delete env.RENDER_WATCH_BARRED_LIST;
    return spawnSync("bash", ["-euo", "pipefail", "-c", guard], { cwd: root, env, encoding: "utf8" });
  }

  it("refuses the commit when a body of a listed slug is in research/rendered, whatever its extension", () => {
    for (const ext of ["html", "json", "pdf", "xml", "bin"]) {
      const r = runGuard(["bar-terms.meta.json", "bar-terms.txt", `bar-terms.${ext}`], "other-slug\nbar-terms\n");
      expect(r.status, ext).toBe(1);
      expect(r.stdout, ext).toContain(`::error title=copying barred::research/rendered/bar-terms.${ext} is the body of a copying-barred page`);
    }
    // A last line with no newline is read too.
    expect(runGuard(["bar-terms.html"], "bar-terms").status).toBe(1);
    // A blank line is passed over, not the end of the list: the slugs after it are read too.
    expect(runGuard(["bar-terms.html"], "\nbar-terms\n").status).toBe(1);
    expect(runGuard(["bar-terms.pdf"], "other-slug\n\nbar-terms\n").status).toBe(1);
  });

  it("lets the commit go on for the slug's meta and emptied .txt, for another slug's body, and for an empty list", () => {
    const ok = runGuard(["bar-terms.meta.json", "bar-terms.txt", "open-terms.html", "open-terms.meta.json"], "bar-terms\n");
    expect(ok.status, ok.stdout + ok.stderr).toBe(0);
    expect(ok.stdout).toBe("");
    expect(runGuard(["bar-terms.html"], "").status).toBe(0);
    expect(runGuard(["bar-terms.html"], "\n\n").status).toBe(0);
  });

  it("refuses the commit when the fetch step wrote no list (the guard would be blind)", () => {
    for (const r of [runGuard([], null), runGuard([], "", { unset: true })]) {
      expect(r.status).toBe(1);
      expect(r.stdout).toContain("::error title=copying barred::the fetch step wrote no list of copying-barred slugs");
    }
  });

  it("end to end: the list main writes lets its own tree through, and stops a body that lands beside it", async () => {
    const root = tmpOut();
    const out = join(root, "research", "rendered");
    mkdirSync(out, { recursive: true });
    const listPath = join(tmpOut(), "barred-slugs.txt");
    vi.stubGlobal("fetch", async () => new Response("<html><body><p>Terms.</p></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
    const stdout = captureStdout();
    try {
      const list = join(root, "urls.txt");
      writeFileSync(list, "https://www.barred.test/terms\tbar-terms\n");
      expect(await main(["--list", list, "--out", out], { RENDER_WATCH_BARRED_LIST: listPath }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
    } finally {
      stdout.restore();
      vi.unstubAllGlobals();
    }
    const env = { ...process.env, RENDER_WATCH_BARRED_LIST: listPath };
    expect(spawnSync("bash", ["-euo", "pipefail", "-c", guard], { cwd: root, env, encoding: "utf8" }).status).toBe(0);
    writeFileSync(join(out, "bar-terms.html"), "<html></html>\n");
    expect(spawnSync("bash", ["-euo", "pipefail", "-c", guard], { cwd: root, env, encoding: "utf8" }).status).toBe(1);
  });

  it("end to end, several copying-barred pages in one run (the weekly list has ten such lines): every slug the run stores is listed, in order, so a body of the first is stopped as surely as one of the last", async () => {
    const root = tmpOut();
    const out = join(root, "research", "rendered");
    mkdirSync(out, { recursive: true });
    const listPath = join(tmpOut(), "barred-slugs.txt");
    vi.stubGlobal("fetch", async (url: string) => {
      const { pathname } = new URL(String(url));
      if (pathname === "/robots.txt") return new Response(null, { status: 404 });
      return new Response(`<html><body><p>Terms at ${pathname}.</p></body></html>`, { status: 200, headers: { "content-type": "text/html" } });
    });
    const stdout = captureStdout();
    try {
      const list = join(root, "urls.txt");
      writeFileSync(list, "https://www.barred.test/terms\tbar-terms\nhttps://open.test/terms\topen-terms\nhttps://barred.test/rates\tbar-rates\nhttps://barred.test/exempt\tbar-exempt\n");
      expect(await main(["--list", list, "--out", out], { RENDER_WATCH_BARRED_LIST: listPath }, { copyingBarred: ["barred.test"], delayMs: 0 })).toBe(0);
    } finally {
      stdout.restore();
      vi.unstubAllGlobals();
    }
    expect(readFileSync(listPath, "utf8")).toBe("bar-terms\nbar-rates\nbar-exempt\n");
    const env = { ...process.env, RENDER_WATCH_BARRED_LIST: listPath };
    const guardRun = () => spawnSync("bash", ["-euo", "pipefail", "-c", guard], { cwd: root, env, encoding: "utf8" });
    expect(guardRun().status).toBe(0);
    for (const slug of ["bar-terms", "bar-rates", "bar-exempt"]) {
      writeFileSync(join(out, `${slug}.html`), "<html></html>\n");
      const r = guardRun();
      expect(r.status, slug).toBe(1);
      expect(r.stdout, slug).toContain(`::error title=copying barred::research/rendered/${slug}.html is the body of a copying-barred page`);
      rmSync(join(out, `${slug}.html`));
    }
    // The open page's body stays where it always was.
    expect(existsSync(join(out, "open-terms.html"))).toBe(true);
    expect(guardRun().status).toBe(0);
  });
});
