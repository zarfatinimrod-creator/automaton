#!/usr/bin/env node
/**
 * render-watch — fetch the handful of web pages this repo's research says would
 * settle a question, from a host that actually has egress.
 *
 * WHY THIS EXISTS.
 *
 * Three measurements in `research/measurements/` end the same way: a verdict of
 * UNKNOWN, and a sentence naming one page that would change it. Not a search, not
 * a summary — one page. Every one of them is [BLOCKED] from the container the
 * research ran in, and so is `web.archive.org`, which is the usual rescue
 * (`research/measurements/freemius-rail.md` records the 403 from the egress
 * proxy, one attempt each, no routing around it).
 *
 * GitHub Actions runners have egress. `.github/workflows/pcn874-spec-watch.yml`
 * already proves the shape works for one document. This is the same idea widened
 * to a list: fetch, store the bytes, store a readable text extraction, store a
 * hash, and let a later session read the page out of the repository and grade a
 * claim [RENDERED] instead of [SNIPPET].
 *
 * WHAT IT IS NOT. It does not read the pages, and it does not decide anything.
 * Storing bytes is not evidence of a fact; a human or an agent that reads the
 * text is. `research/rendered/README.md` says how that hand-off works.
 *
 * BEHAVIOUR.
 *   - every URL in research/rendered/urls.txt is fetched with a browser-like
 *     User-Agent and a 30 s timeout
 *   - the raw body is stored under research/rendered/<slug>.<ext>, the extension
 *     chosen from the response Content-Type (html / json / pdf / xml / txt / bin)
 *   - for HTML, a deterministic text extraction is stored at <slug>.txt
 *   - research/rendered/<slug>.meta.json records url, fetchedAt, status,
 *     contentType, byteLength, sha256 and whether the body changed
 *   - a non-2xx response or a network error is RECORDED IN THE META FILE and
 *     never thrown; the run still exits 0
 *   - the process exits non-zero only when the script itself is broken: a
 *     malformed URL list, a duplicate slug, an unwritable output directory
 *
 * BODY SIZE IS CAPPED AT 5 MB (MAX_BYTES below). The cap is applied while the
 * body streams in, so a larger page is never fully downloaded; what is stored is
 * the first 5 MB and the meta file says `"truncated": true`. The stored sha256 is
 * the hash of the STORED bytes, not of the whole remote document — a truncated
 * capture is a sample, not a copy, and must not be cited as the full page.
 *
 * QUIET GIT HISTORY, DELIBERATELY. A meta file is rewritten only when something
 * material changed (body hash, HTTP status, or the error state). A run that finds
 * the same bytes writes nothing at all, so the workflow's `git add` finds an empty
 * diff and skips the commit. The consequence, stated rather than hidden:
 * `fetchedAt` is the time of the fetch that produced the STORED content — the last
 * time the page CHANGED, not the last time it was checked. The workflow run log is
 * the record of every check.
 *
 * Node 22, no dependencies, on purpose: a weekly fetch that depends on a package
 * tree is a weekly fetch somebody else's release can break.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(HERE, "..");
export const DEFAULT_LIST = join(REPO_ROOT, "research", "rendered", "urls.txt");
export const DEFAULT_OUT_DIR = join(REPO_ROOT, "research", "rendered");

/** 30 s, as the brief requires. A page that cannot answer in 30 s is a finding too. */
export const TIMEOUT_MS = 30_000;

/** 5 MB. Applied while streaming; see the header comment. */
export const MAX_BYTES = 5 * 1024 * 1024;

/** A courtesy pause between requests. Six pages a week is not a crawl, but it costs nothing to be polite. */
export const DELAY_MS = 1_000;

/**
 * A normal browser User-Agent. Not a disguise: several of the pages on the list
 * return 403 to a default Node user-agent string and render fine to a browser,
 * and a 403 that is an artefact of our own headers would be recorded here as if
 * it were the site's answer. Nothing else is done to get past a block — no proxy,
 * no retry storm, no cookie games. A site that says no is recorded as saying no.
 */
export const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// The URL list
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;

/**
 * Derive a filesystem-safe slug from a URL, for a list line that does not name one.
 * Deterministic, lowercase, and includes the query string, because
 * `…/store?search=accessibility` and `…/store?search=israel` are different pages.
 */
export function slugFromUrl(url) {
  const withoutScheme = String(url)
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/#.*$/, "");
  const slug = withoutScheme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "page";
}

/**
 * Parse research/rendered/urls.txt (or the workflow_dispatch override, which has
 * the same syntax).
 *
 *   - one URL per line
 *   - an optional slug after the URL; a TAB is the documented separator, but any
 *     run of whitespace is accepted, because a URL contains none and a
 *     workflow_dispatch text box cannot carry a tab
 *   - a line whose first non-blank character is `#` is a comment. Only whole-line
 *     comments: a `#` later in a line is a URL fragment, not a comment marker
 *   - blank lines are ignored
 *
 * Throws on an authoring mistake — a non-http(s) line, an unusable slug, or two
 * lines claiming the same slug (which would have one page silently overwrite
 * another). Those are the "the script itself is broken" cases; everything that
 * can go wrong at fetch time is recorded instead.
 */
export function parseUrlList(text) {
  const entries = [];
  const seen = new Map();
  const lines = String(text ?? "")
    .replace(/^﻿/, "")
    .split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const raw = lines[i].trim();
    if (raw === "" || raw.startsWith("#")) continue;

    const parts = raw.split(/\s+/);
    const url = parts[0];
    const explicitSlug = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";

    if (!/^https?:\/\/\S+$/i.test(url)) {
      throw new Error(`urls.txt line ${lineNumber}: not an http(s) URL: ${url}`);
    }
    if (parts.length > 2) {
      throw new Error(
        `urls.txt line ${lineNumber}: a slug is one word, got "${explicitSlug}". Use a tab and a single slug.`,
      );
    }

    const slug = explicitSlug || slugFromUrl(url);
    if (!SLUG_RE.test(slug)) {
      throw new Error(
        `urls.txt line ${lineNumber}: slug "${slug}" is not usable as a file name (want ${SLUG_RE}).`,
      );
    }
    if (seen.has(slug)) {
      throw new Error(
        `urls.txt line ${lineNumber}: slug "${slug}" is already used on line ${seen.get(slug)}. ` +
          `Two URLs sharing a slug would overwrite each other's stored page.`,
      );
    }
    seen.set(slug, lineNumber);
    entries.push({ url, slug, lineNumber });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Content type -> file extension, and the HTML text extractor
// ---------------------------------------------------------------------------

/**
 * Choose the extension the raw body is stored under. Deliberately coarse: the
 * point is that a later reader can open the file, not that every MIME type gets
 * its own suffix. `text/plain` maps to `txt` and no separate extraction is
 * written for it — the body already is the text.
 */
export function extensionFor(contentType) {
  const type = String(contentType ?? "")
    .toLowerCase()
    .split(";")[0]
    .trim();
  if (type.includes("json")) return "json";
  if (type.includes("html")) return "html";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("xml")) return "xml";
  if (type.startsWith("text/")) return "txt";
  return "bin";
}

export function isHtml(contentType) {
  return extensionFor(contentType) === "html";
}

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  shy: "",
};

/** The small entity set an extracted page actually needs. Anything else is left alone. */
export function decodeEntities(text) {
  return String(text)
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => safeFromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => safeFromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const value = NAMED_ENTITIES[name.toLowerCase()];
      return value === undefined ? match : value;
    });
}

function safeFromCodePoint(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

const DROPPED_ELEMENTS = "script|style|noscript|template|svg|iframe|object|canvas|math";
const BLOCK_ENDS =
  /<\/(?:p|div|section|article|header|footer|main|nav|aside|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|td|th|h[1-6]|blockquote|pre|figure|figcaption|form|fieldset|legend|label|option|title)\s*>/gi;

/**
 * Turn an HTML body into something a person (or an agent reading the repo) can
 * grep. Deliberately simple and deterministic — no parser, no dependency.
 *
 * Known limits, stated because a silent limit is worse than a stated one:
 *   - nested same-name dropped elements (an <svg> inside an <svg>) end at the
 *     first closing tag, so a fragment of markup can survive
 *   - a `>` inside an attribute value ends a tag early
 *   - text rendered by JavaScript is not here at all: this stores what the server
 *     sent, not what a browser would paint. A page that comes back nearly empty
 *     is a client-rendered page, and that is itself worth recording.
 */
export function extractText(html) {
  let text = String(html ?? "");
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(new RegExp(`<(${DROPPED_ELEMENTS})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, "gi"), " ");
  text = text.replace(new RegExp(`<\\/?(?:${DROPPED_ELEMENTS})\\b[^>]*>`, "gi"), " ");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(BLOCK_ENDS, "\n");
  text = text.replace(/<[^>]*>/g, " ");
  text = decodeEntities(text);

  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------------------------------------------------------------------------
// Meta files
// ---------------------------------------------------------------------------

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Did anything worth committing change? The body hash is the main answer, but a
 * page that starts answering 403 has changed too, and so has one whose network
 * error appeared or cleared.
 */
export function hasChanged(previousMeta, next) {
  if (!previousMeta) return true;
  if ((previousMeta.sha256 ?? null) !== (next.sha256 ?? null)) return true;
  if ((previousMeta.status ?? null) !== (next.status ?? null)) return true;
  return (previousMeta.error ?? null) !== (next.error ?? null);
}

/**
 * The record stored beside every fetched page. Key order is fixed so a diff of
 * this file reads as a change in the page, not a reshuffle of the JSON.
 *
 * `status` is the HTTP status, or null when the request never got one (DNS,
 * timeout, refused connection). `sha256` is null when there is no stored body.
 */
export function buildMeta({
  url,
  slug,
  fetchedAt,
  status = null,
  contentType = null,
  byteLength = 0,
  sha256: hash = null,
  previousMeta = null,
  truncated = false,
  error = null,
  bodyPath = null,
  textPath = null,
}) {
  const next = {
    url,
    slug,
    fetchedAt,
    status,
    contentType,
    byteLength,
    sha256: hash,
    truncated,
    error,
    bodyPath,
    textPath,
  };
  return {
    ...next,
    changed: hasChanged(previousMeta, next),
    firstFetch: previousMeta === null,
    previousSha256: previousMeta ? (previousMeta.sha256 ?? null) : null,
    note:
      "Third-party content, fetched by .github/workflows/render-watch.yml and stored for citation only. " +
      "fetchedAt is when this stored content was captured, i.e. the last time the page changed - " +
      "not the last time it was checked; an unchanged page rewrites nothing. " +
      "Storing bytes is not reading them: a claim becomes [RENDERED] only when a session reads the text " +
      "and writes the finding into the research file.",
  };
}

export function metaPathFor(outDir, slug) {
  return join(outDir, `${slug}.meta.json`);
}

export function readPreviousMeta(outDir, slug, readFile = readFileSync) {
  const path = metaPathFor(outDir, slug);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFile(path, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    // A meta file we cannot parse is treated as absent: the next fetch rewrites it.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * Read a response body, stopping at MAX_BYTES. Streaming rather than
 * `arrayBuffer()` so an oversized document is never fully pulled down.
 */
export async function readCappedBody(response, maxBytes = MAX_BYTES) {
  if (!response.body || typeof response.body.getReader !== "function") {
    const all = Buffer.from(await response.arrayBuffer());
    return all.length > maxBytes
      ? { bytes: all.subarray(0, maxBytes), truncated: true }
      : { bytes: all, truncated: false };
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  let truncated = false;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = Buffer.from(value);
    if (total + chunk.length >= maxBytes) {
      chunks.push(chunk.subarray(0, maxBytes - total));
      total = maxBytes;
      truncated = true;
      try {
        await reader.cancel();
      } catch {
        /* the connection is going away anyway */
      }
      break;
    }
    chunks.push(chunk);
    total += chunk.length;
  }

  return { bytes: Buffer.concat(chunks, total), truncated };
}

/**
 * Fetch one entry. Never throws: a non-2xx answer and a network failure both come
 * back as a result object, because a page that refuses us is a finding, not a
 * broken build.
 */
export async function fetchOne(entry, { fetchImpl = fetch, timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(entry.url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9,he;q=0.8",
      },
    });

    const contentType = response.headers?.get?.("content-type") ?? null;
    if (!response.ok) {
      return {
        status: response.status,
        contentType,
        bytes: null,
        truncated: false,
        error: `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
      };
    }

    const { bytes, truncated } = await readCappedBody(response, maxBytes);
    return { status: response.status, contentType, bytes, truncated, error: null };
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return {
      status: null,
      contentType: null,
      bytes: null,
      truncated: false,
      error: controller.signal.aborted ? `timeout after ${timeoutMs}ms (${message})` : message,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = { list: DEFAULT_LIST, outDir: DEFAULT_OUT_DIR };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--list") options.list = resolve(argv[++i]);
    else if (arg === "--out") options.outDir = resolve(argv[++i]);
    else if (arg.startsWith("--list=")) options.list = resolve(arg.slice("--list=".length));
    else if (arg.startsWith("--out=")) options.outDir = resolve(arg.slice("--out=".length));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

/**
 * Where the list comes from. RENDER_WATCH_URLS, set by the workflow from the
 * optional `urls` dispatch input, overrides the file for one run; it uses exactly
 * the same syntax, so comments and slugs work there too.
 */
export function resolveListText(env, readFile = readFileSync, listPath = DEFAULT_LIST) {
  const override = String(env?.RENDER_WATCH_URLS ?? "").trim();
  if (override) return { text: override, source: "RENDER_WATCH_URLS (workflow_dispatch input)" };
  return { text: readFile(listPath, "utf8"), source: listPath };
}

export async function main(argv = process.argv.slice(2), env = process.env) {
  const options = parseArgs(argv);
  const { text, source } = resolveListText(env, readFileSync, options.list);
  const entries = parseUrlList(text);

  process.stdout.write(`render-watch: ${entries.length} URL(s) from ${source}\n`);
  if (entries.length === 0) {
    process.stdout.write("Nothing to fetch.\n");
    return 0;
  }

  mkdirSync(options.outDir, { recursive: true });

  let changedCount = 0;
  let failedCount = 0;
  const summaryLines = [];

  for (const [index, entry] of entries.entries()) {
    if (index > 0) await sleep(DELAY_MS);

    const result = await fetchOne(entry);
    const previousMeta = readPreviousMeta(options.outDir, entry.slug);
    const fetchedAt = new Date().toISOString();

    let bodyPath = null;
    let textPath = null;
    let hash = null;
    let byteLength = 0;

    if (result.bytes) {
      byteLength = result.bytes.length;
      hash = sha256(result.bytes);
      const extension = extensionFor(result.contentType);
      bodyPath = `research/rendered/${entry.slug}.${extension}`;
      if (isHtml(result.contentType)) textPath = `research/rendered/${entry.slug}.txt`;
    }

    const meta = buildMeta({
      url: entry.url,
      slug: entry.slug,
      fetchedAt,
      status: result.status,
      contentType: result.contentType,
      byteLength,
      sha256: hash,
      previousMeta,
      truncated: result.truncated,
      error: result.error,
      bodyPath,
      textPath,
    });

    if (result.error) failedCount += 1;

    if (!meta.changed) {
      process.stdout.write(`unchanged   ${entry.slug}  sha256=${hash ? hash.slice(0, 12) : "-"}  ${entry.url}\n`);
      continue;
    }

    changedCount += 1;

    if (result.bytes) {
      writeFileSync(join(options.outDir, basename(bodyPath)), result.bytes);
      if (textPath) {
        writeFileSync(join(options.outDir, basename(textPath)), `${extractText(result.bytes.toString("utf8"))}\n`);
      }
    }
    writeFileSync(metaPathFor(options.outDir, entry.slug), `${JSON.stringify(meta, null, 2)}\n`);

    const state = result.error
      ? `FAILED      ${entry.slug}  ${result.error}`
      : `${meta.firstFetch ? "new        " : "CHANGED    "} ${entry.slug}  ${byteLength} bytes  ` +
        `${result.contentType ?? "unknown type"}${result.truncated ? "  [TRUNCATED at 5 MB]" : ""}`;
    process.stdout.write(`${state}\n            ${entry.url}\n`);
    summaryLines.push(`- \`${entry.slug}\` — ${result.error ?? `${byteLength} bytes, ${result.contentType}`}`);
  }

  process.stdout.write(
    `\nrender-watch: ${entries.length} URL(s), ${changedCount} changed, ${failedCount} could not be fetched.\n`,
  );

  if (env.GITHUB_STEP_SUMMARY) {
    const body = [
      "### render-watch",
      "",
      `${entries.length} URL(s) from ${source}; ${changedCount} changed, ${failedCount} could not be fetched.`,
      "",
      ...summaryLines,
      "",
      "Stored bytes are not a read page. A claim becomes [RENDERED] only when a session reads the text " +
        "and writes the finding into the research file it settles.",
      "",
    ].join("\n");
    try {
      writeFileSync(env.GITHUB_STEP_SUMMARY, body, { flag: "a" });
    } catch {
      /* a summary we cannot write is not a reason to fail a fetch */
    }
  }

  // A page that refused us is data, not a broken build. Only a broken script fails.
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code ?? 0),
    (error) => {
      console.error(error?.stack ?? String(error));
      process.exit(1);
    },
  );
}
