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
 * claim [RENDERED] instead of [SNIPPET]. For a PDF the readable text comes from
 * pdftotext on the runner, because the container the research runs in has no PDF
 * extractor at all (28.9.2026: the CrazyGames developer terms were captured as a
 * PDF and could not be read).
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
 *   - for a PDF (Content-Type application/pdf), the stored <slug>.pdf is run
 *     through `pdftotext -layout <file> -` and the output is stored at <slug>.txt,
 *     verbatim apart from masking (below); textPath in the meta points at it.
 *     pdftotext comes from poppler-utils, which the workflow installs on the
 *     runner — a system program run with execFile and a fixed argv, not an npm
 *     dependency. The text is never hashed: sha256 stays the hash of the PDF bytes
 *   - if pdftotext is missing, fails or times out (60 s), the run carries on: the
 *     PDF and its meta are stored, no .txt is written, textPath is null, the meta
 *     says why in `textError`, and the log prints it
 *   - the script only ever replaces or removes a <slug>.txt its previous meta
 *     claims (textPath). An unclaimed <slug>.txt beside a PDF is a hand extraction
 *     (four exist, made before 28.9.2026 and cited by line number from
 *     products/pcn874 and research/) and is never touched: if the PDF bytes change
 *     beside one, nothing is extracted and textError says the hand text does not
 *     describe the new bytes
 *   - a PDF whose bytes did not change is extracted only when its meta claims no
 *     text AND no <slug>.txt exists: that reads, once, a PDF captured before this
 *     extraction existed (the meta is rewritten, keeping the bytes' fetchedAt), and
 *     retries one whose extraction failed. When the PDF bytes change, the text is
 *     extracted again and replaces the script's own <slug>.txt; if that fails, the
 *     script's text of the old bytes is removed rather than left beside new bytes
 *     it does not describe
 *   - secret-shaped strings (vendor docs print sample keys) are masked before the
 *     body is hashed or stored, and the meta file counts them as `redacted`. A PDF
 *     body is binary and stored as fetched; its extracted text is masked instead,
 *     and those are what `redacted` counts for a PDF
 *   - research/rendered/<slug>.meta.json records url, fetchedAt, status,
 *     contentType, byteLength, sha256, bodyPath, textPath (plus textError, for a
 *     PDF with no text) and whether anything changed
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
 * material changed (body hash, HTTP status, or the error state — and, for a PDF
 * only, whether its text was extracted and why not). A run that finds the same
 * bytes writes nothing at all, so the workflow's `git add` finds an empty diff and
 * skips the commit; an unchanged PDF whose text is stored is not even re-extracted,
 * and one whose extraction fails the same way again writes nothing either. The
 * consequence, stated rather than hidden: `fetchedAt` is the time of the fetch that
 * produced the STORED bytes — the last time the page CHANGED, not the last time it
 * was checked, and not the time its text was extracted. The workflow run log is the
 * record of every check.
 *
 * Node 22, no npm dependencies, on purpose: a weekly fetch that depends on a
 * package tree is a weekly fetch somebody else's release can break. The one
 * outside program, pdftotext, is optional by construction: without it every page
 * is still fetched and stored, and a PDF simply has no text until a run that has it.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

export function isPdf(contentType) {
  return extensionFor(contentType) === "pdf";
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
// The PDF text extractor
// ---------------------------------------------------------------------------

/**
 * pdftotext gets a minute. A 5 MB PDF (the cap) takes seconds; a minute is room
 * for a slow runner, not a target.
 */
export const PDFTOTEXT_TIMEOUT_MS = 60_000;

/**
 * Room for the text of a PDF at the 5 MB cap. execFile's default stdout limit is
 * 1 MB; the largest PDF text in research/rendered/ today is 154 KB (the US-Israel
 * treaty), but `-layout` pads lines with spaces, and hitting the limit would lose
 * the whole text rather than trim it.
 */
const PDFTOTEXT_MAX_BUFFER = 64 * 1024 * 1024;

/**
 * Run `pdftotext -layout <file> -` (poppler-utils) and resolve its stdout.
 *
 * The one external program this script runs, and it is optional: without it a PDF
 * is still stored, just with no text (see describePdfTextError). execFile, not a
 * shell, with a fixed argv — the only variable is the path of a file this script
 * just wrote, and it is passed as one argument, never parsed. `-layout` keeps the
 * columns of a terms document or a spec table next to each other; the form feed
 * pdftotext puts between pages is kept, so a page can still be found.
 *
 * `execFileImpl` exists for the tests. Rejects with the child_process error, with
 * the child's stderr and the timeout attached for describePdfTextError.
 */
export function runPdftotext(pdfPath, { timeoutMs = PDFTOTEXT_TIMEOUT_MS, execFileImpl = execFile } = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    execFileImpl(
      "pdftotext",
      ["-layout", pdfPath, "-"],
      { timeout: timeoutMs, maxBuffer: PDFTOTEXT_MAX_BUFFER, encoding: "utf8", windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          rejectPromise(Object.assign(error, { stderr: String(stderr ?? ""), timeoutMs }));
          return;
        }
        resolvePromise(String(stdout ?? ""));
      },
    );
  });
}

/**
 * Say, in one line fit for a committed meta file, why a PDF has no text.
 * Deterministic on purpose: the same failure on the same bytes gives the same
 * sentence, so a runner that fails the same way every week writes nothing. For
 * the same reason no host path goes in — execFile's own message carries the
 * runner's checkout path, which differs between runs and hosts.
 */
export function describePdfTextError(error) {
  const code = error?.code;
  const stderrLine =
    String(error?.stderr ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line !== "") ?? "";
  const said = stderrLine ? `: ${stderrLine.slice(0, 200)}` : "";
  const tail = "; no text was extracted from this PDF";

  if (code === "ENOENT") {
    return (
      "pdftotext is not installed on this host (ENOENT)" +
      tail +
      ". .github/workflows/render-watch.yml installs poppler-utils before the fetch step."
    );
  }
  // `killed` is set only when node itself stopped the child, which here means the timeout.
  if (error?.killed) {
    const ms = error?.timeoutMs ?? PDFTOTEXT_TIMEOUT_MS;
    return `pdftotext did not finish within ${ms} ms and was stopped (${error?.signal ?? "killed"})${tail}`;
  }
  if (error?.signal) return `pdftotext was ended by ${error.signal}${said}${tail}`;
  if (typeof code === "number") return `pdftotext exited with code ${code}${said}${tail}`;
  return `pdftotext failed (${code ?? error?.name ?? "unknown error"})${said}${tail}`;
}

// ---------------------------------------------------------------------------
// Meta files
// ---------------------------------------------------------------------------

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Secret-shaped strings that GitHub push protection refuses. Vendor docs print
 * sample keys in exactly these shapes: on 27.9.2026 Stripe's cross-border payouts
 * page carried one, push protection rejected the capture commit, and the whole
 * run's pages were lost. A capture is for citing prose, never for reusing a key,
 * so the key is masked before anything is hashed or written.
 */
export const SECRET_PATTERNS = [
  { kind: "stripe-secret-key", re: /\b(?:sk|rk)_(?:test|live)_[0-9A-Za-z]{10,}\b/g },
  { kind: "stripe-webhook-secret", re: /\bwhsec_[0-9A-Za-z]{20,}\b/g },
  { kind: "github-token", re: /\b(?:gh[pousr]_[0-9A-Za-z]{36,}|github_pat_[0-9A-Za-z_]{40,})\b/g },
  { kind: "aws-access-key-id", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { kind: "slack-token", re: /\bxox[abprs]-[0-9A-Za-z-]{10,}\b/g },
  { kind: "private-key", re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z]+ )?PRIVATE KEY-----/g },
];

function isTextLike(contentType) {
  const ct = String(contentType ?? "").toLowerCase();
  return isHtml(ct) || ct.startsWith("text/") || ct.includes("json") || ct.includes("xml") || ct.includes("javascript");
}

/**
 * Mask secret-shaped strings in a text body. A body with none comes back as the
 * same bytes, so its hash (and the quiet git history) does not change; binary
 * bodies are never rewritten. Returns the bytes to store and how many were masked.
 */
export function redactSecrets(bytes, contentType) {
  if (!bytes || !isTextLike(contentType)) return { bytes, count: 0 };
  const original = bytes.toString("utf8");
  let text = original;
  let count = 0;
  for (const { kind, re } of SECRET_PATTERNS) {
    text = text.replace(re, () => {
      count += 1;
      return `[redacted:${kind}]`;
    });
  }
  return count === 0 ? { bytes, count: 0 } : { bytes: Buffer.from(text, "utf8"), count };
}

/**
 * Did the fetched body change? The hash is the main answer, but a page that starts
 * answering 403 has changed too, and so has one whose network error appeared or
 * cleared.
 */
export function bodyChanged(previousMeta, next) {
  if (!previousMeta) return true;
  if ((previousMeta.sha256 ?? null) !== (next.sha256 ?? null)) return true;
  if ((previousMeta.status ?? null) !== (next.status ?? null)) return true;
  return (previousMeta.error ?? null) !== (next.error ?? null);
}

/**
 * Did anything worth committing change? The body, as above — or, for a PDF only,
 * whether its text was extracted: a PDF whose bytes did not move but whose text
 * was just read (or whose extraction started or stopped failing) is worth a commit.
 *
 * The text state is compared for PDFs and nothing else, deliberately. Metas that
 * were edited by hand exist (an HTML capture whose body was removed on purpose, two
 * text/plain captures given a textPath by hand), and comparing textPath for every
 * type would rewrite them on the next run.
 */
export function hasChanged(previousMeta, next) {
  if (bodyChanged(previousMeta, next)) return true;
  if (!isPdf(next.contentType)) return false;
  if ((previousMeta.textPath ?? null) !== (next.textPath ?? null)) return true;
  return (previousMeta.textError ?? null) !== (next.textError ?? null);
}

/**
 * The record stored beside every fetched page. Key order is fixed so a diff of
 * this file reads as a change in the page, not a reshuffle of the JSON.
 *
 * `status` is the HTTP status, or null when the request never got one (DNS,
 * timeout, refused connection). `sha256` is null when there is no stored body.
 * `textError` is present only for a PDF whose text could not be extracted, and
 * says why; `textPath` is then null.
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
  textError = null,
  redacted = 0,
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
    // Present only when something was masked, so every other page's meta keeps its shape.
    ...(redacted > 0 ? { redacted } : {}),
    error,
    bodyPath,
    textPath,
    // Present only for a PDF whose text could not be read, for the same reason as `redacted`.
    ...(textError ? { textError } : {}),
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
// Storing one capture
// ---------------------------------------------------------------------------

function sameBytesOnDisk(path, bytes) {
  return existsSync(path) && readFileSync(path).equals(bytes);
}

/**
 * Turn one fetch result into files under outDir: the body, its text, its meta —
 * or nothing at all when nothing material changed. Returns the meta, and whether
 * the fetched body itself changed (false for a PDF whose only news is its text).
 *
 * A PDF's text comes from `extractPdfText(<stored .pdf path>)` (runPdftotext unless
 * a test injects one) and is masked with redactSecrets before it is written. It is
 * never hashed: sha256 is the hash of the PDF bytes. When the extractor throws,
 * nothing is thrown on: the meta gets `textError` and no .txt is written.
 *
 * Only a <slug>.txt the previous meta claims (textPath) is ever replaced or
 * removed. Any other <slug>.txt is a hand extraction that other files cite by line
 * number, and is never touched.
 *
 * When a PDF is extracted:
 *   - its bytes changed (or it is new): yes — unless a hand extraction sits there,
 *     in which case nothing is extracted and textError says the hand text is stale.
 *     If the extraction fails, the script's own text of the old bytes is removed.
 *   - its bytes did not change: only when the meta claims no text AND there is no
 *     <slug>.txt on disk. That reads, once, a PDF captured before this extraction
 *     existed, and retries one whose extraction failed.
 *   An unchanged PDF whose text is stored is not extracted again, so a newer
 *   pdftotext on the runner does not churn a text nobody asked to change.
 */
export async function storeCapture(
  entry,
  result,
  { outDir, now = () => new Date().toISOString(), extractPdfText = runPdftotext } = {},
) {
  const previousMeta = readPreviousMeta(outDir, entry.slug);
  let fetchedAt = now();

  let bodyPath = null;
  let textPath = null;
  let textError = null;
  let pdfText = null;
  let hash = null;
  let byteLength = 0;

  let redacted = 0;
  if (result.bytes) {
    const masked = redactSecrets(result.bytes, result.contentType);
    result.bytes = masked.bytes;
    redacted = masked.count;
    byteLength = result.bytes.length;
    hash = sha256(result.bytes);
    const extension = extensionFor(result.contentType);
    bodyPath = `research/rendered/${entry.slug}.${extension}`;
    if (isHtml(result.contentType)) textPath = `research/rendered/${entry.slug}.txt`;
  }

  const bytesChanged = bodyChanged(previousMeta, { sha256: hash, status: result.status, error: result.error });

  const ownTextPath = `research/rendered/${entry.slug}.txt`;
  // The .txt this script wrote last time, per the previous meta. Only that file is ever replaced or removed.
  const ownsTextFile = previousMeta?.textPath === ownTextPath;
  let removeOwnText = false;

  if (result.bytes && isPdf(result.contentType)) {
    const pdfFile = join(outDir, basename(bodyPath));
    const textFile = join(outDir, basename(ownTextPath));
    const handText = existsSync(textFile) && !ownsTextFile;
    // Same bytes as the stored capture: `fetchedAt` stays the time those bytes were captured.
    if (!bytesChanged) fetchedAt = previousMeta.fetchedAt ?? fetchedAt;

    if (!bytesChanged && (previousMeta.textPath || handText)) {
      // Text already there for these bytes (ours, or a hand extraction): keep the state as it was.
      textPath = previousMeta.textPath ?? null;
      textError = previousMeta.textError ?? null;
    } else if (handText) {
      // New bytes beside a text this script did not write: leave it, and say it is stale.
      textError =
        `not extracted: ${ownTextPath} was not written by render-watch (a hand extraction; other files ` +
        "cite such texts by line number), so it is left alone — and it does not describe these bytes. " +
        "Move or re-extract it deliberately; a run with no such file extracts the text itself.";
    } else {
      // pdftotext reads a file, so the PDF is stored first. Bytes already on disk are left untouched.
      if (!sameBytesOnDisk(pdfFile, result.bytes)) writeFileSync(pdfFile, result.bytes);
      try {
        const text = await extractPdfText(pdfFile);
        const masked = redactSecrets(Buffer.from(String(text), "utf8"), "text/plain");
        pdfText = masked.bytes;
        redacted += masked.count;
        textPath = ownTextPath;
      } catch (error) {
        textError = describePdfTextError(error);
        // Our text of the previous bytes must not sit beside bytes it does not describe.
        removeOwnText = ownsTextFile;
      }
    }
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
    textError,
    redacted,
  });

  if (!meta.changed) return { meta, bytesChanged };

  if (result.bytes) {
    writeFileSync(join(outDir, basename(bodyPath)), result.bytes);
    if (pdfText !== null) {
      writeFileSync(join(outDir, basename(textPath)), pdfText);
    } else if (textPath && isHtml(result.contentType)) {
      writeFileSync(join(outDir, basename(textPath)), `${extractText(result.bytes.toString("utf8"))}\n`);
    } else if (removeOwnText) {
      rmSync(join(outDir, basename(ownTextPath)), { force: true });
    }
  }
  writeFileSync(metaPathFor(outDir, entry.slug), `${JSON.stringify(meta, null, 2)}\n`);
  return { meta, bytesChanged };
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

/**
 * `deps.extractPdfText` exists for the tests; the workflow runs main() with none,
 * which means runPdftotext.
 */
export async function main(argv = process.argv.slice(2), env = process.env, deps = {}) {
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
    const { meta, bytesChanged } = await storeCapture(entry, result, {
      outDir: options.outDir,
      extractPdfText: deps.extractPdfText,
    });
    const hash = meta.sha256;
    const byteLength = meta.byteLength;
    // A PDF with no readable text is still a stored capture: said in the log, never thrown.
    const textNote = meta.textError ? `            no PDF text: ${meta.textError}\n` : "";

    if (result.error) failedCount += 1;

    if (!meta.changed) {
      process.stdout.write(`unchanged   ${entry.slug}  sha256=${hash ? hash.slice(0, 12) : "-"}  ${entry.url}\n${textNote}`);
      continue;
    }

    changedCount += 1;

    const state = result.error
      ? `FAILED      ${entry.slug}  ${result.error}`
      : !bytesChanged
        ? `text        ${entry.slug}  PDF bytes unchanged (sha256=${hash.slice(0, 12)}); ` +
          `${meta.textPath ? `text stored at ${meta.textPath}` : "text extraction failed"}`
        : `${meta.firstFetch ? "new        " : "CHANGED    "} ${entry.slug}  ${byteLength} bytes  ` +
          `${result.contentType ?? "unknown type"}${result.truncated ? "  [TRUNCATED at 5 MB]" : ""}`;
    process.stdout.write(`${state}\n            ${entry.url}\n${textNote}`);
    summaryLines.push(
      `- \`${entry.slug}\` — ${result.error ?? `${byteLength} bytes, ${result.contentType}`}` +
        `${bytesChanged ? "" : " (bytes unchanged; text extraction only)"}` +
        `${meta.textError ? `; no PDF text: ${meta.textError}` : ""}`,
    );
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
