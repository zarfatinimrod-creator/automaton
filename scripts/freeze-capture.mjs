#!/usr/bin/env node
/**
 * freeze-capture — a dated copy of a render-watch capture, which the weekly render never rewrites.
 *
 *   node scripts/freeze-capture.mjs <slug> [--date YYYY-MM-DD] [--from-commit <sha>] [--allow-flagged] [--why <text>] [--dry-run]
 *   node scripts/freeze-capture.mjs --cited [--unlined] [--keep <file>:<line>]... [--history] [--apply]
 *   node scripts/freeze-capture.mjs --record <frozen-slug>
 *
 * Why: research notes, rulings and verdicts cite captures by line (research/rendered/<slug>.txt:NNN), and
 * render-watch.yml rewrites a capture in place whenever the page changed, so a cited line can silently come to say
 * something else. Two captures were frozen by hand for that reason (nevo-vat-law-2026-09-29 and
 * kokoro-82m-model-card-2026-09-29: their metas' "frozen" blocks say why, and
 * src/__tests__/revenue/freeze-capture.test.ts pins the shape; osek-zair-page.test.js pinned nevo's until 6.10.2026, when
 * that capture was marked [robots-bar] and left the product). This does the same by script.
 * (hexgrad-kokoro-voices-js-dfb907a is no frozen copy: a file fetched at a pinned commit, on no urls.txt line, with no
 * "frozen" block, so FROZEN.sha256 does not record it.)
 *
 * FREEZE ONE. <slug> copies every file of the capture (research/rendered/<slug>.{meta.json,txt,html,json,pdf,xml,bin},
 * whichever exist; with --from-commit, as that commit stored them) to <slug>-<date>.*, byte for byte, except the meta:
 * its slug, bodyPath and textPath name the copy, and it gains frozen: { on, from, commit, why } in the shape of the
 * hand-frozen sets (on: the day the copy was made; from: the live meta; commit: the last commit that wrote the capture).
 * <date> defaults to the capture's fetchedAt day (UTC), so the frozen name says when the text was fetched. The copy's
 * files and their sha256 go into research/rendered/FROZEN.sha256 (`sha256sum -c` reads it there), which the guard test
 * checks every frozen file against. It refuses (exit 1, nothing written; exit 2 for a slug or commit that is not one):
 *   - a capture that is not a read page (capture-check's classifyCapture: an error or non-2xx status, a bot challenge,
 *     a JavaScript shell, a short page), or whose meta has textError (render-watch: the PDF changed beside a hand
 *     extraction, which may describe the old bytes): a shell, an error page or a stale text frozen as evidence would
 *     be cited as if it were the page. --allow-flagged freezes it anyway (for a claim about the failure itself) and
 *     records the kind in frozen.flagged. A failed fetch that left an older capture's text on disk is frozen as the
 *     commit that stored that text (sourceVersion), when that commit's meta is a read page and the text is the same
 *     bytes;
 *   - a capture that is itself a frozen copy (its meta has "frozen");
 *   - a frozen slug that any urls.txt line names, active or commented out (a render would write over the copy, or a
 *     paused line would when it is resumed);
 *   - a frozen slug that already exists with other bytes (a copy with the same bytes, and the same meta apart from
 *     "frozen", is left as it is: "already frozen", exit 0);
 *   - from the working tree, a capture with uncommitted changes: the copy names the commit its bytes came from.
 * It never edits urls.txt: the live line stays on the weekly watch.
 * MASKED AS IT IS WRITTEN (tick 50, 5.10.2026). Every byte a new copy gets, from the working tree or from git history,
 * passes through render-watch's redactSecrets first (maskCapture: the body with the meta's contentType, the text as
 * text/plain, any other file by its extension), because history keeps the addresses the 5.10 re-mask removed and the
 * repository is public. When that masks anything, the copy's meta records it as remask-captures does (maskedMeta:
 * `redacted` grown, `remasked: { on: <the copy's frozen.on>, addresses, fold: "12143ca" }` after it, sha256 and
 * byteLength of the masked body when the meta's were of the body as stored, as every meta render-watch writes; a
 * meta whose sha256 was not, a hand redaction's, keeps it, as remask-captures keeps it), and FROZEN.sha256 records the
 * masked bytes. A capture that is already masked is copied byte for byte, as before. Every freeze prints how many
 * strings it masks (or, in a dry run, would mask), and the text --cited prints for a DRIFTED range (taken from git
 * history) is masked the same way before it is printed.
 *
 * RECORD ONE. --record <frozen-slug> writes an existing frozen copy's files into FROZEN.sha256 (a copy frozen by hand).
 *
 * FREEZE WHAT IS CITED. --cited finds the citations that matter (activeCitations) in the decision-bearing files
 * (DECISION_FILES; not logs/, which are history, not research/rendered/, not code): every citation of a capture whose
 * urls.txt line is ACTIVE (a commented-out line is not re-fetched), in any form scanCitations reads (its comment lists
 * them). A citation "by line" has at least one line number; the guard test holds those. --unlined also takes the
 * citations without a line (a source table, "read in full"), except the ones --keep names.
 * For each it finds the version of the capture every cited range was written against (citationVersion: the history of
 * the citing line, git log -L, gives the commit that wrote each range; the capture as that commit stored it):
 *   same      every range was written against the capture as it is now, every file of it: frozen from the working tree
 *   changed   the capture changed since (a file, its meta, or a range's text), but one version of it reads, at every
 *             cited range, what that range was written against, and so does the capture now: frozen as that version
 *   drifted   as changed, but a cited range now reads otherwise: printed with both texts as DRIFTED and not repointed;
 *             with --history, repointed to that version, whose cited lines are by construction the text written against
 *   split     no one version reads what every range was written against (ranges on one line written at different
 *             times, across a change): printed, never repointed
 *   invalid   a range was past the end of the capture it was written against: printed, never repointed
 *   unknown   the history cannot say (the citing file has uncommitted changes, git failed, or the history is cut at a
 *             shallow clone's boundary): printed, never repointed
 * One frozen copy per version: an existing frozen copy with the same bytes is reused whatever its name; otherwise
 * <slug>-<fetchedAt day>, or <slug>-<day>-<commit> when that name is taken by other bytes. Dry run unless --apply.
 * Exit 0 when nothing is left citing an active capture by line and nothing was split, invalid, unknown or refused; 1
 * otherwise (and for a dry run with work to do); 2 on a usage error.
 *
 * src/__tests__/revenue/frozen-citations.test.ts fails when a decision-bearing file cites an active capture by line.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { classifyCapture, readCapture } from "./capture-check.mjs";
import { parseUrlList, redactSecrets, slugFromUrl } from "./render-watch.mjs";

export const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const RENDERED_REL = "research/rendered";

/** The files a capture can have (render-watch.mjs extensionFor, plus the meta). */
export const CAPTURE_EXTS = ["meta.json", "txt", "html", "json", "pdf", "xml", "bin"];

/** The merge that made render-watch mask addresses; a re-masked meta names it (remask-captures, and a masked freeze). */
export const FOLD = "12143ca";

/** The type a capture's file is masked as when no meta path names it, by its extension: a .pdf or .bin is binary. */
export const EXT_TYPES = { txt: "text/plain", html: "text/html", json: "application/json", xml: "application/xml", pdf: "application/pdf", bin: "application/octet-stream" };

/** The record of every frozen copy's files: `<sha256>  <file>` lines, sorted by file, in research/rendered. */
export const MANIFEST = "FROZEN.sha256";

/** render-watch's slug rule (render-watch.mjs SLUG_RE): a file name, never a path. */
const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;
export const isSlug = (slug) => SLUG_RE.test(String(slug));

/** A real calendar day written YYYY-MM-DD. */
export function isDay(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

/** The slugs of the ACTIVE urls.txt lines (render-watch's own parser: a commented-out line is not fetched). */
export function activeSlugs(urlsText) {
  return new Set(parseUrlList(urlsText).map((e) => e.slug));
}

/**
 * Every name a urls.txt line could store a capture under, active or commented out: each whitespace-separated word of
 * every line, and the slug render-watch derives from each URL in it (slugFromUrl, for a line with no slug). Wider than
 * the slugs, on purpose: a frozen slug must not be one a line names, or will name when it is resumed.
 */
export function listedNames(urlsText) {
  const names = new Set();
  for (const line of String(urlsText).split(/\r?\n/)) {
    for (const word of line.trim().split(/\s+/)) {
      if (!word) continue;
      names.add(word);
      if (/^https?:\/\//i.test(word)) names.add(slugFromUrl(word));
    }
  }
  return names;
}

/** The slugs of every capture on disk in dir (a <slug>.meta.json). */
export function knownSlugs(dir = join(REPO_ROOT, RENDERED_REL)) {
  if (!existsSync(dir)) return new Set();
  return new Set(readdirSync(dir).filter((f) => f.endsWith(".meta.json")).map((f) => f.slice(0, -".meta.json".length)));
}

// ---------------------------------------------------------------------------------------------------------------------
// Where a capture's bytes come from: the working tree, or a commit.

const git = (root, args, encoding = "utf8") =>
  spawnSync("git", ["--no-optional-locks", ...args], { cwd: root, encoding, maxBuffer: 512 * 1024 * 1024 });

/**
 * A commit named on the command line, as a full sha. Refuses a value that starts with "-" (git would read it as an
 * option) and anything git cannot resolve to a commit.
 */
export function resolveCommit(root, name) {
  const value = String(name ?? "");
  if (!value || value.startsWith("-")) throw new Error(`not a commit: ${JSON.stringify(value)}`);
  const r = git(root, ["rev-parse", "--verify", "--quiet", "--end-of-options", `${value}^{commit}`]);
  if (r.status !== 0 || !/^[0-9a-f]{40,64}$/.test(r.stdout.trim())) throw new Error(`not a commit: ${value}`);
  return r.stdout.trim();
}

/** The capture's files in dir: Map ext -> Buffer, in CAPTURE_EXTS order. */
export function diskFiles(slug, dir) {
  const files = new Map();
  if (!isSlug(slug)) return files;
  for (const ext of CAPTURE_EXTS) {
    const path = join(dir, `${slug}.${ext}`);
    if (existsSync(path)) files.set(ext, readFileSync(path));
  }
  return files;
}

/** The capture's files as commit stored them: Map ext -> Buffer. */
export function commitFiles(root, commit, slug) {
  const files = new Map();
  if (!isSlug(slug) || !/^[0-9a-f]{4,64}$/.test(String(commit))) return files;
  for (const ext of CAPTURE_EXTS) {
    const r = git(root, ["show", `${commit}:${RENDERED_REL}/${slug}.${ext}`], "buffer");
    if (r.status === 0) files.set(ext, r.stdout);
  }
  return files;
}

/** capture-check's verdict on a capture held in memory: the files are written to a scratch directory and read there. */
export function classifyFiles(slug, files) {
  if (!isSlug(slug)) return { kind: "unreadable", evidence: `not a capture slug: ${JSON.stringify(slug)}` };
  const dir = mkdtempSync(join(tmpdir(), "freeze-capture-"));
  try {
    for (const [ext, bytes] of files) writeFileSync(join(dir, `${slug}.${ext}`), bytes);
    return classifyCapture(readCapture(slug, dir));
  } catch (err) {
    return { kind: "unreadable", evidence: err.message };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const sameBytes = (a, b) => a.size === b.size && [...a].every(([ext, bytes]) => b.has(ext) && b.get(ext).equals(bytes));
const withoutMeta = (files) => new Map([...files].filter(([ext]) => ext !== "meta.json"));

/**
 * The version of a capture to freeze, at a commit or (commit null) in the working tree: { commit, files, note }. commit
 * is the last commit that wrote the capture's files as they are there. Throws when the working-tree files have
 * uncommitted changes. A failed fetch writes a meta and no body, so its capture-check kind is "status" while an older
 * capture's text still sits beside it: then the version is the commit that last wrote that text, if its meta there is
 * a read page and the text and body are the same bytes (note says so). Otherwise the version is returned as it is.
 */
export function sourceVersion(root, slug, commit = null) {
  if (!isSlug(slug)) throw new Error(`not a capture slug: ${JSON.stringify(slug)}`);
  const rels = CAPTURE_EXTS.map((ext) => `${RENDERED_REL}/${slug}.${ext}`);
  let files;
  let wrote;
  if (commit == null) {
    const status = git(root, ["status", "--porcelain", "--", ...rels]);
    if (status.status !== 0) throw new Error(`git cannot read ${slug}: ${String(status.stderr).trim()}`);
    if (status.stdout.trim()) {
      throw new Error(
        `${slug} has uncommitted changes (${status.stdout.trim().split("\n").join("; ")}): commit it first, so the frozen ` +
          "copy names the commit its bytes came from",
      );
    }
    files = diskFiles(slug, join(root, RENDERED_REL));
    wrote = git(root, ["log", "-1", "--format=%h", "--", ...rels]).stdout.trim() || null;
  } else {
    files = commitFiles(root, commit, slug);
    wrote = git(root, ["log", "-1", "--format=%h", commit, "--", ...rels]).stdout.trim() || null;
  }
  const version = { commit: wrote, files, note: null };
  const body = withoutMeta(files);
  if (!body.size || classifyFiles(slug, files).kind !== "status") return version;
  const bodyRels = [...body.keys()].map((ext) => `${RENDERED_REL}/${slug}.${ext}`);
  const textCommit = git(root, ["log", "-1", "--format=%h", commit ?? "HEAD", "--", ...bodyRels]).stdout.trim();
  if (!textCommit) return version;
  const older = commitFiles(root, textCommit, slug);
  if (!sameBytes(withoutMeta(older), body) || classifyFiles(slug, older).kind !== "ok") return version;
  return {
    commit: textCommit,
    files: older,
    note: `the fetch after it failed (its meta: status ${JSON.parse(files.get("meta.json")).status}) and left this text on disk; frozen as commit ${textCommit} stored it`,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// The freeze.

const rewritePath = (path, slug, frozenSlug) => {
  if (typeof path !== "string") return path;
  for (const ext of CAPTURE_EXTS) {
    if (path === `${slug}.${ext}`) return `${frozenSlug}.${ext}`;
    const suffix = `/${slug}.${ext}`;
    if (path.endsWith(suffix)) return `${path.slice(0, -suffix.length)}/${frozenSlug}.${ext}`;
  }
  return path;
};

/** The frozen copy's meta: the live meta with slug, bodyPath and textPath naming the copy, and a frozen block last. */
export function frozenMeta(meta, { slug, frozenSlug, on, commit, why, flagged }) {
  const out = {
    ...meta,
    slug: frozenSlug,
    bodyPath: rewritePath(meta.bodyPath, slug, frozenSlug),
    textPath: rewritePath(meta.textPath, slug, frozenSlug),
  };
  out.frozen = { on, from: `${RENDERED_REL}/${slug}.meta.json`, commit: commit ?? null, why };
  if (flagged) out.frozen.flagged = flagged;
  return out;
}

const metaBytes = (meta) => Buffer.from(`${JSON.stringify(meta, null, 2)}\n`);
// A meta with the day of its re-mask left out: two copies of one version, masked on different days, are one capture.
const undated = (meta) => (meta.remasked && typeof meta.remasked === "object" ? { ...meta, remasked: { ...meta.remasked, on: null } } : meta);
const dataOf = (meta) => {
  const { frozen, ...rest } = meta; // eslint-disable-line no-unused-vars
  return JSON.stringify(undated(rest));
};

/**
 * A capture's meta after a mask, as remask-captures and a masked freeze write it: `redacted` grown by count (a
 * `redacted` that is a sentence, a hand redaction's, stays as it is), `remasked: { on, addresses, fold }` right after it
 * (an earlier remasked block's addresses added in, on the new day), and, when body ({ before, bytes }) changed and the
 * meta's sha256 was of its bytes before, sha256 and byteLength of the masked bytes. Both keys sit where buildMeta puts
 * `redacted` (after `truncated`); nothing else moves. Returns a new object.
 */
export function maskedMeta(meta, { count, addresses, on, body = null }) {
  const follows = body && meta.sha256 === sha256(body.before);
  const prev = meta.redacted;
  const redacted = prev === undefined ? count : Number.isInteger(prev) ? prev + count : prev;
  const earlier = Number.isInteger(meta.remasked?.addresses) ? meta.remasked.addresses : 0;
  const remasked = { on, addresses: earlier + addresses, fold: FOLD };
  const anchor = ["redacted", "truncated", "sha256"].find((k) => k in meta) ?? null;
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key === "remasked") continue;
    if (key !== "redacted") out[key] = value;
    if (follows && key === "sha256") out.sha256 = sha256(body.bytes);
    if (follows && key === "byteLength") out.byteLength = body.bytes.length;
    if (key === anchor) Object.assign(out, { redacted, remasked });
  }
  if (anchor === null) Object.assign(out, { redacted, remasked });
  return out;
}

const emailMasks = (bytes) => bytes.toString("latin1").split("[redacted:email]").length - 1;

/**
 * A capture's files (Map ext -> Buffer) through redactSecrets, as remask-captures masks them: the body (the meta's
 * bodyPath) with the meta's contentType, the text (textPath) as text/plain, any other file by its extension (EXT_TYPES).
 * Returns { files, meta, count, addresses }: the masked files, the meta as maskedMeta writes it for day `on` (in files
 * too) when anything was masked, every mask counted, and the new `[redacted:email]` masks among them. Files with no
 * meta, or a meta that is not JSON, come back as they are (planFreeze refuses them).
 */
export function maskCapture(files, on) {
  let meta;
  try {
    meta = JSON.parse(files.get("meta.json").toString("utf8"));
  } catch {
    return { files, meta: null, count: 0, addresses: 0 };
  }
  const extOf = (path) => (typeof path === "string" ? CAPTURE_EXTS.find((ext) => ext !== "meta.json" && path.endsWith(`.${ext}`)) : undefined);
  const bodyExt = extOf(meta.bodyPath);
  const textExt = extOf(meta.textPath);
  const out = new Map(files);
  let count = 0;
  let addresses = 0;
  let body = null;
  for (const [ext, bytes] of files) {
    if (ext === "meta.json") continue;
    const masked = redactSecrets(bytes, ext === bodyExt ? meta.contentType : ext === textExt ? "text/plain" : EXT_TYPES[ext]);
    if (!masked.count) continue;
    out.set(ext, masked.bytes);
    count += masked.count;
    addresses += emailMasks(masked.bytes) - emailMasks(bytes);
    if (ext === bodyExt) body = { before: bytes, bytes: masked.bytes };
  }
  if (!count) return { files, meta, count, addresses };
  const after = maskedMeta(meta, { count, addresses, on, body });
  out.set("meta.json", metaBytes(after));
  return { files: out, meta: after, count, addresses };
}

/** The default frozen.why. */
export function defaultWhy({ slug, commit, citedBy, note }) {
  const who = citedBy || "what cites it by line";
  return (
    `A dated copy of the render-watch capture of ${slug}${commit ? ` as commit ${commit} stored it` : ""} (fetchedAt above), ` +
    `byte for byte, made by scripts/freeze-capture.mjs so that ${who} keep${citedBy && citedBy.includes(",") ? "" : "s"} ` +
    `pointing at the lines that were read${note ? `; ${note}` : ""}. The slug is not in urls.txt, so render-watch never ` +
    `rewrites these files; the live slug ${slug} stays on the weekly watch.`
  );
}

/** The frozen name a capture version takes by default: <slug>-<fetchedAt day>, or --date. */
export function frozenName(slug, meta, date) {
  const day = date ?? (typeof meta?.fetchedAt === "string" ? meta.fetchedAt.slice(0, 10) : null);
  if (day == null) throw new Error(`${slug}'s meta has no fetchedAt: name the day with --date YYYY-MM-DD`);
  if (!isDay(day)) throw new Error(`not a day (YYYY-MM-DD): ${day}`);
  return `${slug}-${day}`;
}

/**
 * Plan a freeze without writing: { slug, frozenSlug, date, kind, writes: [{ ext, path, bytes }], already, masked }.
 * The writes are the files masked by maskCapture (masked: how many strings it masked; 0 for a capture already masked).
 * files: the capture's files (Map ext -> Buffer: diskFiles, commitFiles or sourceVersion). dir: where the copy goes.
 * frozenSlug: the copy's name (default: frozenName). already: the copy exists with the same bytes (its meta compared
 * without "frozen"). Throws an Error saying why on every refusal.
 */
export function planFreeze({ slug, files, dir, urlsText, date, on, commit = null, why, allowFlagged = false, frozenSlug: name }) {
  if (!isSlug(slug)) throw new Error(`not a capture slug: ${slug}`);
  if (!files?.has("meta.json")) throw new Error(`no capture: ${slug}.meta.json does not exist`);
  let meta;
  try {
    meta = JSON.parse(files.get("meta.json").toString("utf8"));
  } catch (err) {
    throw new Error(`${slug}.meta.json is not JSON: ${err.message}`);
  }
  if (meta.frozen) throw new Error(`${slug} is already a frozen copy (frozen ${meta.frozen.on} from ${meta.frozen.from}); freeze the live capture instead`);

  const row = classifyFiles(slug, files);
  if (row.kind === "unreadable") throw new Error(`${slug} cannot be read as a capture: ${row.evidence}`);
  let flagged = row.kind === "ok" ? undefined : { kind: row.kind, evidence: row.evidence };
  // render-watch writes textError when a PDF changed beside a hand extraction: the text may describe the old bytes.
  if (!flagged && meta.textError) flagged = { kind: "textError", evidence: String(meta.textError) };

  const frozenSlug = name ?? frozenName(slug, meta, date);
  if (!isSlug(frozenSlug) || !frozenSlug.startsWith(`${slug}-`)) throw new Error(`not a frozen name for ${slug}: ${frozenSlug}`);
  if (!isDay(on)) throw new Error(`not a day (YYYY-MM-DD) for frozen.on: ${on}`);
  if (listedNames(urlsText).has(frozenSlug)) {
    throw new Error(`${frozenSlug} is named on a urls.txt line: a render would rewrite the frozen copy. Choose another --date`);
  }

  const masked = maskCapture(files, on);
  const newMeta = frozenMeta(masked.meta, { slug, frozenSlug, on, commit, why: why ?? defaultWhy({ slug, commit }), flagged });
  const writes = [...files.keys()].map((ext) => ({
    ext,
    path: join(dir, `${frozenSlug}.${ext}`),
    bytes: ext === "meta.json" ? metaBytes(newMeta) : masked.files.get(ext),
  }));

  const existing = CAPTURE_EXTS.filter((ext) => existsSync(join(dir, `${frozenSlug}.${ext}`)));
  let already = false;
  let existingMeta = null;
  if (existing.length) {
    const extra = existing.filter((ext) => !files.has(ext));
    const differ = writes.filter(({ ext, path, bytes }) => {
      if (!existsSync(path)) return true;
      const have = readFileSync(path);
      if (ext !== "meta.json") return !have.equals(bytes);
      try {
        existingMeta = JSON.parse(have.toString("utf8"));
        return dataOf(existingMeta) !== dataOf(newMeta);
      } catch {
        return true;
      }
    });
    if (extra.length || differ.length) {
      const names = [...extra, ...differ.map((w) => w.ext)].map((ext) => `${frozenSlug}.${ext}`);
      throw new Error(`${frozenSlug} already exists with other bytes (${names.join(", ")}): not overwritten`);
    }
    already = true;
  }
  // A copy frozen with --allow-flagged before stays accepted: its meta records the kind that was allowed.
  if (flagged && !allowFlagged && !(already && existingMeta?.frozen?.flagged?.kind === flagged.kind)) {
    throw new Error(
      `${slug} is not a read page (${flagged.kind === "textError" ? "its meta's textError" : "capture-check"}: ` +
        `${flagged.kind}; ${flagged.evidence}). Freezing it would keep a ${flagged.kind} as evidence; --allow-flagged ` +
        "freezes it anyway, for a claim about the failure itself.",
    );
  }
  return { slug, frozenSlug, date: frozenSlug.slice(slug.length + 1, slug.length + 11), kind: flagged?.kind ?? row.kind, writes, already, masked: masked.count };
}

/**
 * Write a planned freeze (nothing with dryRun; an already-frozen copy is never rewritten) and record its files in
 * FROZEN.sha256. Returns the plan.
 */
export function freezeCapture(options) {
  const plan = planFreeze(options);
  if (options.dryRun) return plan;
  if (!plan.already) for (const w of plan.writes) writeFileSync(w.path, w.bytes);
  recordFiles(options.dir, plan.frozenSlug);
  return plan;
}

// ---------------------------------------------------------------------------------------------------------------------
// FROZEN.sha256: every frozen copy's files, so a rewritten, deleted or re-made copy is caught.

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** FROZEN.sha256 in dir: Map file name -> sha256 (empty when there is none). */
export function readManifest(dir) {
  const path = join(dir, MANIFEST);
  const out = new Map();
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const m = /^([0-9a-f]{64}) {2}(\S+)$/.exec(line);
    if (!m) throw new Error(`${MANIFEST}: not a "<sha256>  <file>" line: ${JSON.stringify(line)}`);
    out.set(m[2], m[1]);
  }
  return out;
}

/** The slugs FROZEN.sha256 records (a <slug>.meta.json line). */
export const manifestSlugs = (manifest) =>
  new Set([...manifest.keys()].filter((f) => f.endsWith(".meta.json")).map((f) => f.slice(0, -".meta.json".length)));

/** Record every file of the frozen copy frozenSlug in dir's FROZEN.sha256, replacing its earlier lines. */
export function recordFiles(dir, frozenSlug) {
  if (!isSlug(frozenSlug)) throw new Error(`not a capture slug: ${frozenSlug}`);
  const files = diskFiles(frozenSlug, dir);
  if (!files.has("meta.json")) throw new Error(`no capture: ${frozenSlug}.meta.json does not exist`);
  const meta = JSON.parse(files.get("meta.json").toString("utf8"));
  if (!meta.frozen || meta.slug !== frozenSlug) throw new Error(`${frozenSlug} is not a frozen copy (its meta has no "frozen" block naming it)`);
  const manifest = readManifest(dir);
  for (const ext of CAPTURE_EXTS) manifest.delete(`${frozenSlug}.${ext}`);
  for (const [ext, bytes] of files) manifest.set(`${frozenSlug}.${ext}`, sha256(bytes));
  const lines = [...manifest].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([file, hash]) => `${hash}  ${file}\n`);
  writeFileSync(join(dir, MANIFEST), lines.join(""));
  return files.size;
}

/**
 * Checks FROZEN.sha256 against dir: the problems, one string each ([] when it holds). Every recorded file exists with
 * its hash; every recorded slug's meta is a frozen copy that names itself; every file of a recorded or frozen copy on
 * disk is recorded.
 */
export function checkManifest(dir) {
  const problems = [];
  const manifest = readManifest(dir);
  for (const [file, hash] of manifest) {
    const path = join(dir, file);
    if (!existsSync(path)) problems.push(`${file} is recorded in ${MANIFEST} but not on disk`);
    else if (sha256(readFileSync(path)) !== hash) problems.push(`${file} is not the bytes ${MANIFEST} records`);
  }
  const recorded = manifestSlugs(manifest);
  for (const slug of knownSlugs(dir)) {
    let meta = null;
    try {
      meta = JSON.parse(readFileSync(join(dir, `${slug}.meta.json`), "utf8"));
    } catch {
      /* an unreadable meta is capture-check's business, unless it is a recorded copy (below) */
    }
    if (!meta?.frozen && !recorded.has(slug)) continue;
    if (!recorded.has(slug)) {
      problems.push(`${slug} is a frozen copy that ${MANIFEST} does not record (node scripts/freeze-capture.mjs --record ${slug})`);
      continue;
    }
    if (!meta?.frozen || meta.slug !== slug) problems.push(`${slug} is recorded in ${MANIFEST} but its meta is not a frozen copy naming it`);
    for (const ext of CAPTURE_EXTS) {
      if (existsSync(join(dir, `${slug}.${ext}`)) && !manifest.has(`${slug}.${ext}`)) problems.push(`${slug}.${ext} is not recorded in ${MANIFEST}`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------------------------------
// Citations.

/**
 * The decision-bearing files: what a decision, a claim or a release is read from. Research notes, rulings and verdicts
 * (research/**, md and json, not research/rendered/), docs, product READMEs, licences, configs and release reports.
 * Not logs/: history, a log's citation stays as written. Not code (src/, tests): a test's slugs are fixtures
 * (research/rendered/x.txt), a comment is not where a decision is read from, and code reads a capture at run time.
 */
export const DECISION_FILES = [
  "research/**/*.md",
  "research/**/*.json",
  "docs/**/*.md",
  "products/**/*.md",
  "products/**/README*",
  "products/**/config/**",
  "products/**/releases/**/*.json",
];

const SKIP_DIRS = new Set(["node_modules", ".git", ".venv", "venv", "__pycache__", "dist", ".pytest_cache", ".cache"]);

function walk(dir, out) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(path, out);
    } else if (st.isFile()) out.push(path);
  }
  return out;
}

/** The DECISION_FILES under root, as sorted repository-relative paths. */
export function decisionFiles(root = REPO_ROOT) {
  const files = new Set();
  const rel = (path) => relative(root, path).split("\\").join("/");
  for (const path of walk(join(root, "research"), [])) {
    const r = rel(path);
    if (!r.startsWith(`${RENDERED_REL}/`) && /\.(md|json)$/.test(r)) files.add(r);
  }
  for (const path of walk(join(root, "docs"), [])) if (path.endsWith(".md")) files.add(rel(path));
  for (const path of walk(join(root, "products"), [])) {
    const r = rel(path);
    const parts = r.split("/");
    const name = parts[parts.length - 1];
    if (name === "package-lock.json") continue;
    if (name.endsWith(".md") || /^README/i.test(name) || parts.slice(1, -1).includes("config") || (parts.includes("releases") && name.endsWith(".json"))) files.add(r);
  }
  return [...files].sort();
}

const EXTS_RE = CAPTURE_EXTS.map((e) => e.replace(".", "\\.")).join("|");
const NOT_BEFORE = "(?<![A-Za-z0-9._/-])";
/** After an extension: not more of a name (`a.bin-x.txt` is slug a.bin-x, not a.bin). */
const EXT_END = "(?![A-Za-z0-9_-]|\\.[A-Za-z0-9])";
/**
 * Line numbers written right after a capture's name: :N, :N-M, :N–M, :LN, #LN, #LN-LM, or ": N" with one space (not
 * ": 2026-09-29" or ": 1,279"). Six groups: the first pair that matched is the range.
 */
const OWN_LINES =
  "(?::L?(\\d+)(?:[-–]L?(\\d+))?(?!\\d)|#L(\\d+)(?:-L?(\\d+))?(?!\\d)|: (\\d+)(?:[-–](\\d+))?(?!\\d|[-–.,:/]\\d))?";
const ownRange = (m, at) => {
  for (const i of [0, 2, 4]) if (m[at + i] !== undefined) return range(m[at + i], m[at + i + 1]);
  return null;
};
/**
 * A capture named in text: research/rendered/<slug>.<ext> (any path ending in rendered/, such as ../rendered/),
 * <slug>.<ext>, <slug>.{txt,html}, or <slug> alone (a mention), then its own line numbers. The slug is the shortest
 * one that ends where a name can end.
 */
const TOKEN_RE = new RegExp(
  `${NOT_BEFORE}((?:\\.\\./)*(?:[A-Za-z0-9_.-]+/)*rendered/)?([a-z0-9][a-z0-9._-]*?)` +
    `(?:\\.(${EXTS_RE})${EXT_END}|\\.\\{((?:${EXTS_RE})(?:,(?:${EXTS_RE}))*)\\}|(?![A-Za-z0-9_-]|\\.[A-Za-z0-9{]))${OWN_LINES}`,
  "g",
);
/** `<slug>`.txt:N: the slug in backticks, the extension after them. */
const BACKTICK_RE = new RegExp(`${NOT_BEFORE}\`([a-z0-9][a-z0-9._-]*)\`\\.(${EXTS_RE})${EXT_END}${OWN_LINES}`, "g");
/** …-article-677-earnings or …/astro-themes-hackmd: a slug named by its end (a short-name table does this). */
const ELLIPSIS_RE = new RegExp(`…(/)?([a-z0-9._-]*[a-z0-9])(?:\\.(${EXTS_RE})${EXT_END})?${OWN_LINES}`, "g");
/** `.html:4`, `*.meta.json:5`: an extension and a line of the capture the sentence is about. */
const EXT_REF_RE = new RegExp(`(?<![A-Za-z0-9_-])\\*?\\.(${EXTS_RE})${EXT_END}${OWN_LINES}`, "g");
/** A bare line reference: `:97`, :366-380, :12–14. */
const BARE_RE = /(?<![A-Za-z0-9_./-]):L?(\d+)(?:[-–]L?(\d+))?(?!\d)/g;
/** A line reference in words: "line 12", "lines 2-56", "html line 137". */
const WORD_RE = /(?<![A-Za-z0-9_.-])(?:(html|HTML|txt|TXT)\s+)?[Ll]ines?\s+(\d+)(?:\s*[-–]\s*(\d+))?(?!\d|[.,]\d)/g;
/**
 * A named line reference that is not a capture's (PAT:173, urls.txt:111, CHANNEL_LOOP.md:150, html:338): a bare :N
 * after one belongs to it, not to a capture cited earlier on the line. The name ends in a letter, so a time
 * (2026-09-29T11:30:37Z) is not one.
 */
const NAMED_RE = /(?<![A-Za-z0-9_./-])[A-Za-z0-9_./-]*[A-Za-z_]:\d+(?:-\d+)?/g;
/**
 * Another file named without a line (a note, a script, research/channel-loop/terms-verdicts.json): a bare :N after it
 * is its line. A capture named the same way is marked first, so this only takes what is no capture.
 */
/**
 * The research note a brief summarises: "the note" ("as the note says (`:196`)", "the note cites `:54`"), "note's" ("the
 * note's inference (`:79`)", also after a line break), or "note" right before its line ("note `:545`", "(note `:190`)",
 * and "(note" that ends a line whose next starts with the line). A bare :N after it is the note's line. A page's own
 * note ("an install note (`:115`)", "a GameMaker note (`:8831`") is not one.
 */
const NOTE_RE = /(?<![A-Za-z0-9_-])(?:[Tt]he note(?![A-Za-z0-9_'-])|[Nn]ote's(?![A-Za-z0-9_-])|[Nn]ote(?=\s+`?:L?\d)|(?<=\()[Nn]ote\s*$)/g;
const OTHER_FILE_RE = new RegExp(
  `(?<![A-Za-z0-9_./-])[A-Za-z0-9_./-]*[A-Za-z0-9_-]\\.(?:md|py|ts|tsx|js|mjs|cjs|jsx|yml|yaml|csv|sh|toml|rb|ex|exs|go|rs|php|sql|${EXTS_RE})(?![A-Za-z0-9_])`,
  "g",
);
/** What may stand before a reference that starts its line: indent, a list marker, an opening bracket or quote. */
const LEADING_RE = /^\s*(?:(?:[-*+>]|\d+[.)])\s+)*[(`"'[]*$/;
/** Short names: `NAME` = `<slug>` (the right side may be research/rendered/<slug>, …/<slug> or …-<end of a slug>). */
const PAIR_RE = /`([A-Za-z0-9][A-Za-z0-9._-]{0,23})`\s*=\s*`([^`\n]+)`/g;
/** Short name `NAME` (not followed by =): a name for the capture the sentence is about. */
const PROSE_ALIAS_RE = /[Ss]hort name `([A-Za-z0-9][A-Za-z0-9._-]{0,23})`(?!\s*=)/g;
/** A table row that names a capture under a short name: | `R-GA` | `gh-docs-actions-billing.txt` | ... */
const ALIAS_ROW_RE = /^\|\s*(`?)([A-Za-z][A-Za-z0-9._-]{0,23})\1\s*\|([^|]*)\|/;

const range = (a, b) => (a === undefined ? null : [Number(a), b === undefined ? Number(a) : Number(b)]);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The slug a …-suffix names: the one known slug that ends with it (null when none or several do). */
function bySuffix(known, suffix, exact) {
  if (exact) return known.has(suffix) ? suffix : null;
  const hits = [];
  for (const slug of known) if (slug.endsWith(suffix) && slug !== suffix) hits.push(slug);
  return hits.length === 1 ? hits[0] : null;
}

/**
 * Every citation of a capture in text, and the line references it could not place.
 *   { citations, unattributed, others }
 * citations: { slug, ext, exts, lines, refs, full, alias, aliasFor, index, text, fileLine, slugStart, slugEnd, form }
 *   form:     "path" (research/rendered/<slug>.<ext>, or ../rendered/...), "short" (<slug>.<ext>), "brace"
 *             (<slug>.{txt,html}), "mention" (<slug> alone, backticked or not), "ellipsis" (…-<end of a slug>),
 *             "backtick" (`<slug>`.<ext>) or "alias" (a short name's reference: NAME:N, NAME.<ext>:N)
 *   lines:    the cited [from, to] line ranges ([] for a citation without a line); refs has one { range, ext, fileLine,
 *             token, index } per range, token being the text that wrote it (for the history of its line)
 *   A citation gets the ranges written right after it; each bare :N, "line N", `.ext:N` after it on its line; and, on
 *   a later line of its section (a markdown heading ends one; a table row stands alone) that starts with such a
 *   reference, those, when it was the last name before them. A short name (a table row | `R-GA` | `<slug>.txt` |, a
 *   pair `NAME` = `<slug>`, or "Short name `NAME`" after a capture in the same section) makes each NAME:N and
 *   NAME.<ext>:N a citation with alias NAME; the capture's own citation there (aliasFor NAME) also holds all of their
 *   ranges, and is the one text that names the capture (repoint moves it; the references follow). Another file's
 *   name (PAT:173, a note's path) or the note a brief summarises ("the note's inference (`:79`)", "note `:545`":
 *   NOTE_RE) owns the bare lines after it, on its line and, carried, on the next.
 *   full:     written with a path (…rendered/); a short one counts only when its slug is known
 *   slugStart, slugEnd: where the slug (or the …-suffix) is written: repoint inserts the frozen date at slugEnd
 * unattributed: { fileLine, text, index }: line references after no name at all in their section.
 * others: { name, ext, lines, fileLine, text }: a <name>.<capture ext> that is no known capture and no short name
 *   (faq.txt:38, contributor-terms.html:495, urls.txt:111).
 * known: the capture slugs (anything with .has, and iterable for …-suffixes).
 */
export function scanCitations(text, known = new Set(), { carry = true, lineParagraphs = false } = {}) {
  const source = String(text);
  const lines = source.split("\n");
  const starts = [];
  let at = 0;
  for (const line of lines) {
    starts.push(at);
    at += line.length + 1;
  }
  const isHeading = (line) => /^#{1,6}\s/.test(line);
  const isRow = (line) => /^\s*\|/.test(line);

  // Pass 1: the captures named (anchors), and the names that are no capture (pending: a short name, or another file).
  const anchors = [];
  const pending = [];
  lines.forEach((line, i) => {
    const taken = [];
    const free = (s, e) => !taken.some(([a, b]) => s < b && a < e);
    const anchor = (c) => {
      taken.push([c.index - starts[i], c.index - starts[i] + c.text.length]);
      anchors.push(c);
    };
    for (const m of line.matchAll(BACKTICK_RE)) {
      if (!known.has(m[1])) continue;
      const own = ownRange(m, 3);
      anchor({ slug: m[1], ext: m[2], exts: [m[2]], full: false, form: "backtick", index: starts[i] + m.index, text: m[0], fileLine: i + 1, slugStart: starts[i] + m.index + 1, slugEnd: starts[i] + m.index + 1 + m[1].length, own });
    }
    for (const m of line.matchAll(ELLIPSIS_RE)) {
      if (!free(m.index, m.index + m[0].length)) continue;
      const slug = m[1] === "/" || (m[2].startsWith("-") && m[2].length >= 6) ? bySuffix(known, m[2], m[1] === "/") : null;
      if (!slug) continue;
      const tokenEnd = starts[i] + m.index + 1 + (m[1] ?? "").length + m[2].length;
      anchor({ slug, ext: m[3] ?? null, exts: m[3] ? [m[3]] : [], full: false, form: "ellipsis", index: starts[i] + m.index, text: m[0], fileLine: i + 1, slugStart: starts[i] + m.index, slugEnd: tokenEnd, own: ownRange(m, 4) });
    }
    for (const m of line.matchAll(TOKEN_RE)) {
      if (!free(m.index, m.index + m[0].length)) continue;
      const [whole, prefix, slug, ext, brace] = m;
      const full = prefix !== undefined;
      const own = ownRange(m, 5);
      const exts = ext ? [ext] : brace ? brace.split(",") : [];
      const slugStart = starts[i] + m.index + (prefix ?? "").length;
      const c = { slug, ext: exts[0] ?? null, exts, full, form: brace ? "brace" : exts.length ? (full ? "path" : "short") : "mention", index: starts[i] + m.index, text: whole, fileLine: i + 1, slugStart, slugEnd: slugStart + slug.length, own };
      // research/rendered/urls.txt is the list of captures, not one.
      if (full && slug === "urls" && ext === "txt") taken.push([m.index, m.index + whole.length]);
      else if (known.has(slug) || (full && exts.length)) anchor(c);
      // A name with an extension that is no capture (a short name, or another file). Not "30:37" of a time.
      else if (exts.length) pending.push(c);
    }
  });

  anchors.sort((a, b) => a.index - b.index);
  const onLine = (list) => {
    const byLine = new Map();
    for (const c of list) byLine.set(c.fileLine, [...(byLine.get(c.fileLine) ?? []), c]);
    return (n) => byLine.get(n) ?? [];
  };
  const anchorsOn = onLine(anchors);
  const pendingOn = onLine(pending);

  // Pass 2: the short names. Each maps to the anchor that names its capture; a name used before its definition takes
  // the first definition after it.
  const defs = new Map();
  const define = (name, target, index) => {
    if (!target) return;
    defs.set(name, [...(defs.get(name) ?? []), { index, target }].sort((a, b) => a.index - b.index));
    target.aliasFor ??= name;
  };
  const anchorWithin = (s, e) => anchors.find((c) => c.slugStart >= s && c.slugEnd <= e);
  for (const m of source.matchAll(PAIR_RE)) {
    const s = m.index + m[0].length - m[2].length - 1;
    define(m[1], anchorWithin(s, s + m[2].length), m.index);
  }
  const sectionStart = (index) => {
    let s = 0;
    for (let i = 0; i < lines.length && starts[i] <= index; i += 1) if (isHeading(lines[i])) s = starts[i];
    return s;
  };
  for (const m of source.matchAll(PROSE_ALIAS_RE)) {
    const from = sectionStart(m.index);
    const before = anchors.filter((c) => c.index >= from && c.index < m.index).pop();
    define(m[1], before, m.index);
  }
  lines.forEach((line, i) => {
    const row = ALIAS_ROW_RE.exec(line);
    if (!row) return;
    const cellStart = starts[i] + line.indexOf("|", line.indexOf("|") + 1) + 1;
    const inCell = anchors.filter((c) => c.index >= cellStart && c.index + c.text.length <= cellStart + row[3].length);
    if (inCell.length && inCell.every((c) => c.slug === inCell[0].slug && !c.own)) define(row[2], inCell[0], starts[i]);
  });
  const resolve = (name, index) => {
    const list = defs.get(name);
    if (!list) return null;
    return (list.filter((d) => d.index <= index).pop() ?? list[0]).target;
  };

  // Pass 3: every mark on each line, and the line references after them.
  const citations = [...anchors];
  for (const c of anchors) {
    c.alias = null;
    c.refs = [];
  }
  const addRef = (c, r) => {
    c.refs.push(r);
    if (c.aliasOf) c.aliasOf.refs.push(r);
  };
  const aliasNames = [...defs.keys()].sort((a, b) => b.length - a.length);
  const ALIAS_RE = aliasNames.length
    ? new RegExp(`${NOT_BEFORE}(${aliasNames.map(escapeRe).join("|")})(?:\\.(${EXTS_RE}))?${EXT_END}${OWN_LINES}`, "g")
    : null;
  const unattributed = [];
  const others = [];
  let ctx = null;
  let paragraph = 0;
  lines.forEach((line, i) => {
    if (isHeading(line)) ctx = null;
    if (lineParagraphs || !line.trim() || isHeading(line)) paragraph += 1;
    const row = isRow(line);
    const marks = [];
    const overlaps = (s, e) => marks.some((k) => s < k.end && k.start < e);
    const mark = (s, e, kind, c, ext) => marks.push({ start: s, end: e, kind, c, ext });
    for (const c of anchorsOn(i + 1)) {
      mark(c.index - starts[i], c.index - starts[i] + c.text.length, "capture", c, c.ext);
      if (c.own) addRef(c, { range: c.own, ext: c.ext, fileLine: i + 1, token: c.text, index: c.index });
    }
    if (ALIAS_RE) {
      for (const m of line.matchAll(ALIAS_RE)) {
        const own = ownRange(m, 3);
        const numeric = /^\d/.test(m[1]);
        if (overlaps(m.index, m.index + m[0].length) || (!m[2] && !own) || (numeric && !m[2])) continue;
        const target = resolve(m[1], starts[i] + m.index);
        if (!target) continue;
        const c = { slug: target.slug, ext: m[2] ?? target.ext, exts: m[2] ? [m[2]] : target.exts, full: false, form: "alias", alias: m[1], aliasOf: target, index: starts[i] + m.index, text: m[0], fileLine: i + 1, refs: [] };
        citations.push(c);
        mark(m.index, m.index + m[0].length, "capture", c, c.ext);
        if (own) addRef(c, { range: own, ext: c.ext, fileLine: i + 1, token: m[0], index: c.index });
      }
    }
    // `.meta.json:5`, `*.meta.json:5`: a line of a file of the capture named before; found before other files' names.
    const extRefs = [];
    for (const m of line.matchAll(EXT_REF_RE)) {
      const own = ownRange(m, 2);
      if (own && !overlaps(m.index, m.index + m[0].length)) extRefs.push({ start: m.index, end: m.index + m[0].length, range: own, ext: m[1], text: m[0], isExt: true });
    }
    const inExtRef = (s, e) => extRefs.some((r) => s < r.end && r.start < e);
    // Pending names that are no short name: another file (its :N and bare :N after it are its own).
    for (const p of pendingOn(i + 1)) {
      const s = p.index - starts[i];
      if (overlaps(s, s + p.text.length)) continue;
      mark(s, s + p.text.length, "other", null, null);
      if (p.exts.length) others.push({ name: p.slug, ext: p.ext, lines: p.own ? [p.own] : [], fileLine: i + 1, text: p.text, index: p.index });
    }
    for (const re of [NAMED_RE, OTHER_FILE_RE, NOTE_RE]) {
      for (const m of line.matchAll(re)) {
        if (!overlaps(m.index, m.index + m[0].length) && !inExtRef(m.index, m.index + m[0].length)) mark(m.index, m.index + m[0].length, "other", null, null);
      }
    }
    marks.sort((a, b) => a.start - b.start);

    // The references, in order: each belongs to the last mark before it on the line, or else to the section's last.
    const refs = [...extRefs];
    for (const m of line.matchAll(BARE_RE)) {
      if (!overlaps(m.index, m.index + m[0].length) && !refs.some((r) => m.index < r.end && r.start < m.index + m[0].length)) refs.push({ start: m.index, end: m.index + m[0].length, range: range(m[1], m[2]), ext: null, text: m[0] });
    }
    for (const m of line.matchAll(WORD_RE)) {
      if (!overlaps(m.index, m.index + m[0].length)) refs.push({ start: m.index, end: m.index + m[0].length, range: range(m[2], m[3]), ext: m[1] ? m[1].toLowerCase() : null, text: m[0] });
    }
    refs.sort((a, b) => a.start - b.start);
    let last = null;
    let lastEnd = 0;
    const events = [...marks.map((k) => ({ ...k, isMark: true })), ...refs].sort((a, b) => a.start - b.start);
    for (const e of events) {
      if (e.isMark) {
        last = e;
        lastEnd = e.end;
        continue;
      }
      // A reference that starts its line takes the section's last name. One later in its line, with no name before
      // it, takes the last name only when that is a file of a capture (not a bare mention) in the same paragraph.
      const leading = LEADING_RE.test(line.slice(0, e.start));
      const carried = carry && !row && ctx && (leading || (ctx.kind === "capture" && ctx.c.form !== "mention" && ctx.paragraph === paragraph));
      const owner = last ?? (carried ? ctx : null);
      if (!owner) {
        unattributed.push({ fileLine: i + 1, text: e.text, index: starts[i] + e.start });
        continue;
      }
      if (!last) {
        // Carried from an earlier line after a short name's reference (`priv.html:115`): the file is the capture's own
        // (a mention's is none: txt or html), as the short name stands for the capture. After a path, a slug or a
        // `.html:615`, the file stays the one written.
        const alias = owner.kind === "capture" && owner.c.alias && !owner.extRef ? owner.c.aliasOf : null;
        last = alias ? { ...owner, ext: alias.ext } : owner;
        lastEnd = e.start;
      }
      if (last.kind !== "capture") continue;
      // "the html has it at :713": a word for the other file of the capture, between the name and the number.
      const between = line.slice(lastEnd, e.start);
      const hint = /\bhtml\b/i.test(between) ? "html" : /\btxt\b/i.test(between) ? "txt" : null;
      const ext = e.ext ?? hint ?? last.ext;
      addRef(last.c, { range: e.range, ext, fileLine: i + 1, token: e.text, index: starts[i] + e.start });
      if (e.isExt) {
        // `.meta.json:5` is itself a mark: a bare :N after it is a line of the same file.
        last = { ...last, ext: e.ext, extRef: true };
        lastEnd = e.end;
      }
    }
    if (!row && carry && last) ctx = { ...last, paragraph };
  });

  for (const c of citations) {
    c.refs.sort((a, b) => a.index - b.index);
    c.lines = c.refs.map((r) => r.range);
    delete c.own;
  }
  citations.sort((a, b) => a.index - b.index);
  for (const c of citations) {
    if (c.aliasOf) Object.defineProperty(c, "aliasOf", { value: c.aliasOf, enumerable: false });
  }
  return { citations, unattributed, others };
}

/** scanCitations(text, known).citations. */
export const findCitations = (text, known = new Set(), options = {}) => scanCitations(text, known, options).citations;

/** Notes and data carry a section's capture to a reference that starts a later line; code does not (carry: false). */
export const isProse = (file) => /\.(md|json)$/.test(file) || /(^|\/)README[^/]*$/i.test(file);

/**
 * How a file is scanned: notes and data carry a section's capture (isProse); in JSON each line is a string value that
 * stands alone, so a reference is carried only within its line (a paragraph is a line).
 */
export const scanOptions = (file) => ({ carry: isProse(file), lineParagraphs: /\.json$/.test(file) });

/** The slugs a citation scan knows: every capture on disk, and every active urls.txt slug. */
export function scanKnown(root, urlsText) {
  const known = knownSlugs(join(root, RENDERED_REL));
  for (const slug of activeSlugs(urlsText)) known.add(slug);
  return known;
}

/** scanCitations over the decision-bearing files, of ACTIVE captures only: { file, ...citation }[]. */
export function activeCitations({ root = REPO_ROOT, urlsText } = {}) {
  const urls = urlsText ?? readFileSync(join(root, RENDERED_REL, "urls.txt"), "utf8");
  const active = activeSlugs(urls);
  const known = scanKnown(root, urls);
  const out = [];
  for (const file of decisionFiles(root)) {
    const text = readFileSync(join(root, file), "utf8");
    for (const c of findCitations(text, known, scanOptions(file))) {
      if (!active.has(c.slug)) continue;
      const withFile = Object.assign(c, { file });
      out.push(withFile);
    }
  }
  return out;
}

/** The citations by line (the guard's list). */
export const byLine = (citations) => citations.filter((c) => c.lines.length > 0);

/** The cited lines of a capture file's text, one string per range, or null for a range the text lacks. */
export function citedLines(text, ranges) {
  if (text == null) return ranges.map(() => null);
  const lines = String(text).split("\n");
  return ranges.map(([a, b]) => (a >= 1 && b >= a && b <= lines.length ? lines.slice(a - 1, b).join("\n") : null));
}

// ---------------------------------------------------------------------------------------------------------------------
// Which version of a capture a citation was written against.

/** The citing line's history (git log -L): { versions: [{ commit, text }] newest first } or { error }. */
export function lineHistory(root, file, fileLine) {
  const r = git(root, ["log", `-L${fileLine},${fileLine}:${file}`, "--format=%x01%H"]);
  if (r.status !== 0) return { error: `git log -L failed for ${file}:${fileLine}: ${String(r.stderr).trim().split("\n")[0]}` };
  const versions = [];
  for (const block of r.stdout.split("\x01").slice(1)) {
    const nl = block.indexOf("\n");
    const commit = (nl < 0 ? block : block.slice(0, nl)).trim();
    const body = nl < 0 ? [] : block.slice(nl + 1).split("\n");
    const hunk = body.findIndex((l) => l.startsWith("@@"));
    const post = hunk < 0 ? [] : body.slice(hunk + 1).filter((l) => (l.startsWith("+") && !l.startsWith("+++")) || l.startsWith(" ")).map((l) => l.slice(1));
    versions.push({ commit, text: post.join("\n") });
  }
  if (!versions.length) return { error: `git log -L found no history for ${file}:${fileLine}` };
  return { versions };
}

/** The commits a shallow clone's history stops at (empty for a full clone), or null when git cannot say. */
export function shallowBoundaries(root) {
  const r = git(root, ["rev-parse", "--is-shallow-repository"]);
  if (r.status !== 0) return null;
  if (r.stdout.trim() !== "true") return new Set();
  const p = git(root, ["rev-parse", "--git-path", "shallow"]);
  const path = p.stdout.trim();
  const abs = path.startsWith("/") ? path : join(root, path);
  if (p.status !== 0 || !existsSync(abs)) return null;
  return new Set(readFileSync(abs, "utf8").split("\n").map((s) => s.trim()).filter(Boolean));
}

/** Whether a line's text still holds a reference token (a bare :N must not run on into more digits). */
const holds = (text, token) => new RegExp(`${/^[:.#]/.test(token) ? "(?<![A-Za-z0-9_./-])" : ""}${escapeRe(token)}(?!\\d)`).test(text);

/** The commit that wrote token on a line: the oldest version in the newest unbroken run of versions holding it. */
export function writtenIn(versions, token) {
  let found = null;
  for (const v of versions) {
    if (!holds(v.text, token)) break;
    found = v.commit;
  }
  return found;
}

const textOf = (files, ext) => (files.has(ext) ? files.get(ext).toString("utf8") : null);
const defaultExt = (files) => (files.has("txt") ? "txt" : ["html", "json", "xml", "pdf", "bin"].find((e) => files.has(e)) ?? "txt");

/**
 * Which version of its capture a citation was written against (the states are in the header comment).
 * { state, version, why, refs: [{ range, ext, fileLine, token, written, then, now }], then, now }
 * version: the commit to freeze from (state changed or drifted), "tree" (same), or null.
 */
export function citationVersion({ root = REPO_ROOT, file, citation, shallow }) {
  const c = citation;
  const refs = c.refs?.length ? c.refs : [{ range: null, ext: c.ext, fileLine: c.fileLine, token: c.text, index: c.index }];
  const fail = (state, why, extra = {}) => ({ state, version: null, why, refs, then: null, now: null, ...extra });
  const status = git(root, ["status", "--porcelain", "--", file]);
  if (status.status !== 0) return fail("unknown", `git cannot read ${file}: ${String(status.stderr).trim().split("\n")[0]}`);
  if (status.stdout.trim()) return fail("unknown", `${file} has uncommitted changes: commit it, so each line's history says when it was written`);
  const bounds = shallow === undefined ? shallowBoundaries(root) : shallow;
  if (bounds == null) return fail("unknown", "git cannot say whether this clone is shallow");

  const histories = new Map();
  const captures = new Map();
  const captureAt = (commit) => {
    if (!captures.has(commit)) captures.set(commit, commitFiles(root, commit, c.slug));
    return captures.get(commit);
  };
  const out = [];
  for (const r of refs) {
    if (!histories.has(r.fileLine)) histories.set(r.fileLine, lineHistory(root, file, r.fileLine));
    const h = histories.get(r.fileLine);
    if (h.error) return fail("unknown", h.error);
    const written = writtenIn(h.versions, r.token);
    if (!written) return fail("unknown", `${file}:${r.fileLine} as committed does not hold ${JSON.stringify(r.token)}`);
    const full = written;
    if (bounds.has(full)) return fail("unknown", `${file}:${r.fileLine} goes back to ${full.slice(0, 7)}, where this shallow clone's history stops`);
    const files = captureAt(full);
    if (!files.has("meta.json")) return fail("unknown", `${RENDERED_REL}/${c.slug} is not in ${full.slice(0, 7)}, which wrote ${JSON.stringify(r.token)}`);
    const ext = r.ext ?? c.ext ?? defaultExt(files);
    const then = r.range ? citedLines(textOf(files, ext), [r.range])[0] : `(${withoutMeta(files).size} file(s), ${files.get("meta.json").length} meta bytes)`;
    out.push({ ...r, ext, written: full, then });
  }
  const tree = diskFiles(c.slug, join(root, RENDERED_REL));
  for (const r of out) r.now = r.range ? citedLines(textOf(tree, r.ext), [r.range])[0] : null;
  const result = (state, version, why = null) => ({ state, version, why, refs: out, then: out.map((r) => r.then), now: out.map((r) => r.now) });

  const written = [...new Set(out.map((r) => r.written))];
  if (written.every((w) => sameBytes(captureAt(w), tree))) return result("same", "tree");
  const past = out.find((r) => r.range && r.then == null);
  if (past) return result("invalid", null, `${past.token} (${file}:${past.fileLine}) is past the end of ${c.slug}.${past.ext} as ${past.written.slice(0, 7)} stored it`);
  if (out.some((r) => !r.range)) {
    // A citation without a line names the whole capture: the version its text was written against.
    return result("drifted", written[0], "the capture changed since it was named");
  }
  const reads = (commit) => out.every((r) => citedLines(textOf(captureAt(commit), r.ext), [r.range])[0] === r.then);
  // Newest first (most ancestors): the latest version that reads every range as written.
  const depth = (commit) => Number(git(root, ["rev-list", "--count", commit]).stdout.trim()) || 0;
  const version = [...written].sort((a, b) => depth(b) - depth(a)).find(reads);
  if (!version) {
    return result("split", null, `its ranges were written against ${written.map((w) => w.slice(0, 7)).join(", ")}, and no one of them reads what every range was written against`);
  }
  if (sameBytes(captureAt(version), tree)) return result("same", "tree");
  return result(out.every((r) => r.now != null && r.now === r.then) ? "changed" : "drifted", version);
}

/**
 * Rewrite each citation's slug in text: the frozen name's date goes in after the slug, and nothing else moves (same
 * extension, same lines; a …-suffix stays a suffix). Short-name references (alias) follow their capture's citation.
 * Every citation is checked to be where it was before any is moved.
 */
export function repoint(text, citations, frozenOf) {
  let out = String(text);
  const moving = [...citations].filter((c) => !c.alias).sort((x, y) => y.slugStart - x.slugStart);
  for (const c of moving) {
    const token = c.form === "ellipsis" ? null : c.slug;
    const written = out.slice(c.slugStart, c.slugEnd);
    if ((token != null && written !== token) || (token == null && !c.slug.endsWith(written.replace(/^…\/?/, "")))) {
      throw new Error(`citation moved: ${c.text} at ${c.index}`);
    }
  }
  for (const c of moving) {
    const name = frozenOf(c);
    if (!String(name).startsWith(`${c.slug}-`)) throw new Error(`${name} is not a frozen name for ${c.slug}`);
    out = out.slice(0, c.slugEnd) + name.slice(c.slug.length) + out.slice(c.slugEnd);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// --cited.

const todayUtc = () => new Date().toISOString().slice(0, 10);
/**
 * A cited text for the terminal: masked by redactSecrets as text/plain (a DRIFTED range's "then" comes from git history,
 * which still holds the addresses the 5.10 re-mask removed), then JSON-quoted and cut to 400 characters (a minified HTML
 * line can run to megabytes). Masked before it is cut, so no cut can split an address the mask would have found.
 */
const clip = (s) => {
  if (s == null) return "null";
  const t = redactSecrets(Buffer.from(s, "utf8"), "text/plain").bytes.toString("utf8");
  return t.length > 400 ? `${JSON.stringify(t.slice(0, 400))}... (${t.length} characters)` : JSON.stringify(t);
};
const rangesOf = (c) => c.lines.map(([a, b]) => (a === b ? `:${a}` : `:${a}-${b}`)).join(", ");
const where = (c) => `${c.file}:${c.fileLine} ${c.text}${c.lines.length ? ` [${rangesOf(c)}]` : ""}`;

/**
 * Whether two captures are one version: the same files, byte for byte, the metas the same apart from name, "frozen" and
 * the day of a re-mask (remasked.on).
 */
function sameCapture(copy, copySlug, files, slug) {
  if (copy.size !== files.size || ![...files.keys()].every((ext) => copy.has(ext))) return false;
  for (const [ext, bytes] of files) if (ext !== "meta.json" && !copy.get(ext).equals(bytes)) return false;
  try {
    const a = JSON.parse(copy.get("meta.json").toString("utf8"));
    const b = JSON.parse(files.get("meta.json").toString("utf8"));
    delete a.frozen;
    a.slug = slug;
    a.bodyPath = rewritePath(a.bodyPath, copySlug, slug);
    a.textPath = rewritePath(a.textPath, copySlug, slug);
    return JSON.stringify(undated(a)) === JSON.stringify(undated(b));
  } catch {
    return false;
  }
}

/** An existing frozen copy of slug with the same bytes as files, whatever its name: its slug, or null. */
export function existingCopy(dir, slug, files) {
  const from = `${RENDERED_REL}/${slug}.meta.json`;
  for (const name of [...knownSlugs(dir)].sort()) {
    if (!name.startsWith(`${slug}-`)) continue;
    let meta;
    try {
      meta = JSON.parse(readFileSync(join(dir, `${name}.meta.json`), "utf8"));
    } catch {
      continue;
    }
    if (meta.frozen?.from === from && meta.slug === name && sameCapture(diskFiles(name, dir), name, files, slug)) return name;
  }
  return null;
}

/**
 * --cited. Freezes and (with apply) repoints the citations of active captures in the decision-bearing files: by line
 * always, without a line with unlined (except keep: "file:line" strings). Returns the exit code.
 */
export function cited({ root = REPO_ROOT, apply = false, unlined = false, keep = [], history = false, on = todayUtc(), log = console.log } = {}) {
  const dir = join(root, RENDERED_REL);
  const urlsText = readFileSync(join(dir, "urls.txt"), "utf8");
  const all = activeCitations({ root, urlsText });
  const lined = byLine(all);
  const perFile = new Map();
  for (const c of lined) perFile.set(c.file, (perFile.get(c.file) ?? 0) + 1);
  log(`${lined.length} citation(s) by line of an active capture in ${perFile.size} decision-bearing file(s):`);
  for (const [file, n] of perFile) log(`  ${n}\t${file}`);
  const named = all.filter((c) => !c.alias);
  const noLine = named.filter((c) => c.lines.length === 0);
  log(`${noLine.length} more name an active capture without a line${unlined ? "" : " (--unlined takes them)"}`);
  const kept = new Set(keep);
  const work = [...named.filter((c) => c.lines.length > 0), ...(unlined ? noLine.filter((c) => !kept.has(`${c.file}:${c.fileLine}`)) : [])];

  // Which version of its capture each citation was written against: the working tree ("tree"), or a commit.
  const shallow = shallowBoundaries(root);
  const target = new Map();
  const drifted = [];
  const blocked = [];
  const states = {};
  for (const c of work) {
    const v = citationVersion({ root, file: c.file, citation: c, shallow });
    states[v.state] = (states[v.state] ?? 0) + 1;
    if (v.state === "same" || v.state === "changed") target.set(c, v.version);
    else if (v.state === "drifted") {
      drifted.push({ c, v });
      if (history) target.set(c, v.version);
    } else blocked.push({ c, v });
  }
  log(`drift: ${Object.entries(states).map(([k, n]) => `${k} ${n}`).join(", ") || "nothing to check"}`);
  for (const { c, v } of drifted) {
    log(`DRIFTED ${where(c)} (written in ${v.version.slice(0, 7)})`);
    v.refs.forEach((r) => {
      log(`  then: ${clip(r.then)}`);
      log(`  now:  ${clip(r.now)}`);
    });
  }
  for (const { c, v } of blocked) log(`${v.state.toUpperCase()} ${where(c)}: ${v.why}; not repointed`);

  // One frozen copy per version of a capture: an existing copy with the same bytes whatever its name, else
  // <slug>-<fetchedAt day>, or <slug>-<day>-<commit> when that name holds other bytes or another version takes it.
  const versions = new Map();
  for (const [c, at] of target) {
    const key = `${c.slug}@${at}`;
    if (versions.has(key)) continue;
    try {
      versions.set(key, sourceVersion(root, c.slug, at === "tree" ? null : at));
    } catch (err) {
      versions.set(key, { error: err });
    }
  }
  const groupOf = (c) => {
    const v = versions.get(`${c.slug}@${target.get(c)}`);
    return v.error ? `${c.slug}@error:${target.get(c)}` : `${c.slug}@${v.commit}`;
  };
  const frozen = new Map();
  const refused = [];
  const taken = new Set();
  // Oldest version first (fewest ancestors), so the first fetch of a day takes the plain <slug>-<day> name.
  const when = (group) => {
    const commit = group.split("@").pop();
    return /^[0-9a-f]{4,64}$/.test(commit) ? Number(git(root, ["rev-list", "--count", commit]).stdout.trim()) || 0 : 0;
  };
  const groups = [...new Set([...target.keys()].map(groupOf))].sort();
  for (const group of groups.map((g) => [when(g), g]).sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1)).map(([, g]) => g)) {
    const members = [...target.keys()].filter((c) => groupOf(c) === group);
    const { slug } = members[0];
    const version = versions.get(`${slug}@${target.get(members[0])}`);
    const tree = members.every((c) => target.get(c) === "tree");
    const as = tree ? "" : ` as ${version.commit ?? target.get(members[0]).slice(0, 7)} stored it`;
    try {
      if (version.error) throw version.error;
      const citedBy = [...new Set(members.map((c) => c.file))].join(", ");
      // Compared as the copy would be written: masked (a copy re-masked on 5.10 holds no address; history does).
      let name = existingCopy(dir, slug, maskCapture(version.files, on).files);
      if (!name) {
        const meta = JSON.parse(version.files.get("meta.json").toString("utf8"));
        name = frozenName(slug, meta);
        const busy = (n) => taken.has(n) || CAPTURE_EXTS.some((ext) => existsSync(join(dir, `${n}.${ext}`)));
        if (busy(name)) name = `${name}-${version.commit}`;
      }
      taken.add(name);
      const plan = freezeCapture({
        slug,
        files: version.files,
        dir,
        urlsText,
        on,
        commit: version.commit,
        why: defaultWhy({ slug, commit: version.commit, citedBy, note: version.note }),
        dryRun: !apply,
        frozenSlug: name,
      });
      frozen.set(group, plan.frozenSlug);
      const verb = plan.already ? "already frozen" : apply ? "froze" : "would freeze";
      const masks = plan.masked && !plan.already ? `; ${apply ? "masked" : "would mask"} ${plan.masked}` : "";
      log(`${verb} ${slug}${as} -> ${plan.frozenSlug} (${plan.writes.map((w) => w.ext).join(", ")})${masks}${version.note ? `; ${version.note}` : ""}`);
    } catch (err) {
      refused.push(group);
      log(`REFUSED ${slug}${as}: ${err.message}`);
    }
  }
  const frozenOf = (c) => frozen.get(groupOf(c));
  const moving = [...target.keys()].filter((c) => frozenOf(c));
  if (apply) {
    for (const file of [...new Set(moving.map((c) => c.file))]) {
      const path = join(root, file);
      writeFileSync(path, repoint(readFileSync(path, "utf8"), moving.filter((c) => c.file === file), frozenOf));
    }
  }
  const followers = lined.filter((c) => c.alias && moving.includes(c.aliasOf)).length;
  // After --apply, what the files still hold; in a dry run, what --apply would leave (nothing was written, so the exit
  // code says whether there is work: every citation by line of an active capture is still there).
  const left = apply ? byLine(activeCitations({ root, urlsText })) : lined.filter((c) => !moving.includes(c.aliasOf ?? c));
  const driftMoved = drifted.filter(({ c }) => moving.includes(c)).length;
  log(
    `${apply ? "repointed" : "would repoint"} ${moving.length} citation(s) (${followers} short-name reference(s) follow them); ` +
      `${drifted.length} DRIFTED (${driftMoved} ${apply ? "" : "would be "}repointed to the version each was written against` +
      `${history ? "" : "; --history repoints them"}); ${blocked.length} split, invalid or unknown (never repointed); ` +
      `${refused.length} freeze(s) refused; ${left.length} citation(s) by line of an active capture ${apply ? "left" : "--apply would leave"}`,
  );
  for (const c of left) log(`  left: ${where(c)}`);
  return (apply ? left.length : lined.length) || blocked.length || refused.length ? 1 : 0;
}

export function main(argv, root = REPO_ROOT) {
  const usage =
    "usage: node scripts/freeze-capture.mjs <slug> [--date YYYY-MM-DD] [--from-commit <sha>] [--allow-flagged] [--why <text>] [--dry-run]\n" +
    "       node scripts/freeze-capture.mjs --cited [--unlined] [--keep <file>:<line>]... [--history] [--apply]\n" +
    "       node scripts/freeze-capture.mjs --record <frozen-slug>";
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        date: { type: "string" },
        "from-commit": { type: "string" },
        "allow-flagged": { type: "boolean" },
        why: { type: "string" },
        "dry-run": { type: "boolean" },
        cited: { type: "boolean" },
        unlined: { type: "boolean" },
        keep: { type: "string", multiple: true },
        history: { type: "boolean" },
        apply: { type: "boolean" },
        record: { type: "string" },
      },
    });
  } catch (err) {
    console.error(`${err.message}\n${usage}`);
    return 2;
  }
  const v = args.values;
  const citedOptions = [v.unlined, v.keep, v.history, v.apply].some(Boolean);
  const oneOptions = [v.date, v["from-commit"], v["allow-flagged"], v.why, v["dry-run"]].some(Boolean);
  const dir = join(root, RENDERED_REL);
  if (v.record !== undefined) {
    if (args.positionals.length || citedOptions || oneOptions || v.cited) {
      console.error(usage);
      return 2;
    }
    if (!isSlug(v.record)) {
      console.error(`freeze-capture: not a capture slug: ${JSON.stringify(v.record)}`);
      return 2;
    }
    try {
      const n = recordFiles(dir, v.record);
      console.log(`recorded ${n} file(s) of ${v.record} in ${RENDERED_REL}/${MANIFEST}`);
      return 0;
    } catch (err) {
      console.error(`freeze-capture: ${err.message}`);
      return 1;
    }
  }
  if (v.cited) {
    if (args.positionals.length || oneOptions) {
      console.error(usage);
      return 2;
    }
    return cited({ root, apply: Boolean(v.apply), unlined: Boolean(v.unlined), keep: v.keep ?? [], history: Boolean(v.history) });
  }
  if (args.positionals.length !== 1 || citedOptions) {
    console.error(usage);
    return 2;
  }
  const [slug] = args.positionals;
  // Before any file or git call: a slug is a file name, and a commit is never read as an option.
  if (!isSlug(slug)) {
    console.error(`freeze-capture: not a capture slug: ${JSON.stringify(slug)}`);
    return 2;
  }
  if (v["from-commit"] !== undefined && (!v["from-commit"] || v["from-commit"].startsWith("-"))) {
    console.error(`freeze-capture: not a commit: ${JSON.stringify(v["from-commit"])}`);
    return 2;
  }
  try {
    const commit = v["from-commit"] === undefined ? null : resolveCommit(root, v["from-commit"]);
    const version = sourceVersion(root, slug, commit);
    const plan = freezeCapture({
      slug,
      files: version.files,
      dir,
      urlsText: readFileSync(join(dir, "urls.txt"), "utf8"),
      date: v.date,
      on: todayUtc(),
      commit: version.commit,
      why: v.why ?? defaultWhy({ slug, commit: version.commit, note: version.note }),
      allowFlagged: Boolean(v["allow-flagged"]),
      dryRun: Boolean(v["dry-run"]),
    });
    const verb = plan.already ? "already frozen" : v["dry-run"] ? "would freeze" : "froze";
    console.log(
      `${verb} ${slug} -> ${plan.frozenSlug} (${plan.writes.map((w) => `${plan.frozenSlug}.${w.ext}`).join(", ")})` +
        `${plan.masked && !plan.already ? `; ${v["dry-run"] ? "would mask" : "masked"} ${plan.masked}` : ""}` +
        `${plan.kind === "ok" ? "" : `; flagged: ${plan.kind}`}${version.note ? `; ${version.note}` : ""}`,
    );
    return 0;
  } catch (err) {
    console.error(`freeze-capture: ${err.message}`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
