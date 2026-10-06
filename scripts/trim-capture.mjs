#!/usr/bin/env node
/**
 * trim-capture — what of a capture stays in the public tree when its site's terms bar copying: the meta, the hash, and
 * the lines a decision cites.
 *
 *   node scripts/trim-capture.mjs [<slug>...] [--apply]
 *
 * THE RULE. research/channel-loop/RULING-2026-10-06-robots-and-terms.md decision 4 (ruling 6.10 row 21 (d)): "A capture
 * from a site whose read terms bar copying, reproducing, distributing or publishing its content may not stay committed
 * in full." The site list is a field, not a memory (4(2)): the "copying" field of research/channel-loop/terms-verdicts.json,
 * "barred" | "allowed" | "unread", read through queue-zero-test's loadVerdicts; a capture's site is siteOf (termsGate's)
 * of its meta's url host. Only "barred" is trimmed, whatever the capture's class: [against-bar] and [robots-bar]
 * captures too (4(4)). "unread" is not "allowed", and neither is trimmed: fold 10(i)'s copying audit reads them first.
 *
 * WHAT STAYS, per capture (4(1)). The .meta.json, every field as it was (no line of it moves), with one block appended,
 *   trimmed: { on, ruling, site, copying, keptLines, context, fullSha256, fullByteLength, lineCount, body, cited, wide,
 *              captureCheck, fullBytesIn, history[, passes] }
 * keptLines are the .txt's lines kept (merged [from, to] ranges); fullSha256, fullByteLength and lineCount are of the
 * full .txt the trim replaced (null when the capture had none); body is { path, sha256, byteLength, lineCount, keptLines,
 * inTree } of the full body (.html, .json, .xml, .pdf, .bin); cited says why each line was kept (the citing file:line);
 * wide lists the cited ranges longer than WIDE_LINES, which keep nothing (below); passes records each later pass that
 * re-trimmed the capture (the SECOND PASS, below); captureCheck is capture-check's kind of the full capture;
 * fullBytesIn names the commit whose tree holds every full file (on a capture render-watch's route stored, it says
 * "not retained (...)": the full bytes are nowhere, amendment 1); history says that git history keeps the full bytes and
 * that rewriting public history is the owner's decision (the §6 public/private one), a fact for that decision and not
 * an ask. The .txt keeps its line count: every cited line, with
 * CONTEXT (2) lines either side, is kept verbatim and every other line is emptied, so no citation by line moves and
 * `freeze-capture.mjs --cited` stays as it was. The body leaves the tree; its sha256 stays in the meta. One exception,
 * which the ruling's text did not foresee: a body a decision-bearing file cites BY LINE (`<slug>.html:50`,
 * `<slug>.json:62192`; 12 bodies on 6.10) is kept the way the .txt is (same line count, the cited lines and their context
 * only), because the ruling also says the trim "refuses to blank a cited line"; the remainder is a quotation of a few
 * lines with the source named, which decision 4(4) reads as permitted. A binary body (.pdf, .bin) cited by line is a
 * refusal. Bytes removed are the full files' bytes minus what stays; the dry run gives, per kept file, the bytes kept
 * of its text (newlines not counted) and the share.
 *
 * THE WIDE RULE (the ruling's amendment 1 (5)(iii), 6.10). A cited range longer than WIDE_LINES (20) lines "is a
 * statement that the text was read, which the sha256 already proves, not a quotation": it keeps NOTHING, neither its
 * interior nor its two ends, whether the scanner cites it or it is read "on its line". A line inside it that another
 * citation names separately is still kept, with that citation's CONTEXT. The dry run prints each such range as "wide"
 * with the file:line that cites it and says that it keeps nothing; the guard against blanking a cited line does not
 * count it (a wide range is not a quotation, so emptying it is the rule, not a blanked citation); and a binary body
 * cited only by a wide range is no refusal (nothing of it is kept). The block's `cited` holds what keeps lines, its
 * `wide` what does not.
 *
 * THE SECOND PASS. A capture trimmed before the wide rule (the 6.10 pass kept wide ranges: `indiebook.md:108`'s "txt in
 * full (body :29-269)", 245 of indiebook-terms.txt's 298 lines) is re-trimmed by --apply: in each of its kept files (the
 * .txt, a body kept at its cited lines) that a wide range cites, now or in the block's record (`cited`, `wide`), every
 * line kept only because of a wide range is emptied. What stays is the old kept lines that a range that is not wide (in
 * the block's record or cited now) still keeps with its CONTEXT; no line comes back. A range counts as in the first
 * pass: one that starts in the file does (running past its end, it is wide by its own length, or keeps what of it the
 * file has), one that starts past the end does not. keptLines (and body.keptLines) are
 * recomputed; a body left with no kept line leaves the tree (body.inTree false); fullSha256, fullByteLength, lineCount
 * and body.sha256 stay as they are (the full hash is the verification hash and never changes); `cited` and `wide` are
 * rewritten; and `passes` gains { on, ruling (WIDE_RULING), keptLinesBefore, bodyKeptLinesBefore }. The meta's lines
 * above the block do not move. A frozen copy's FROZEN.sha256 lines follow. The dry run prints "would re-trim <slug>
 * (wide range ...)" with the lines and bytes kept before and after; a capture whose kept lines no wide range reaches
 * is "already trimmed", so a run after the second pass has nothing to do (exit 3).
 *
 * WHICH LINES ARE CITED. freeze-capture.mjs's own scanner (findCitations over decisionFiles: research/** notes and JSON,
 * docs/, product READMEs, licences, configs and release reports; not logs/, not code), every form it reads, of every
 * capture: live, retired, paused and frozen. A reference with no file of its own goes to the .txt (the file a note reads),
 * or to the body when there is no .txt. One addition, for captures no active urls.txt line names (frozen, retired or
 * paused): every bare `:N` and "line N" (the scanner's BARE_RE and WORD_RE) on a decision-file line that names the
 * capture is kept in its .txt too, and every `html:N` / `txt:N` (its NAMED_RE, a file of the capture by its extension
 * alone) in that file, even when the scanner gives it to another name on that line (a note that says "no robots.txt"
 * before `(:114)` has the scanner give :114 to robots.txt; "the robots clause (html:812)" reads as a file named html).
 * The guard decides by the scanner; the trim keeps too much rather than blank a line a note reads: on 6.10 these keep
 * 219 lines more across 11 files, 165 of them in the five frozen terms copies of 6.10 whose verdict notes quote them
 * (the tests read those lines). (An active capture is never cited by line: frozen-citations.test.ts.)
 * The tests read lines too; each one they read is a line a decision-bearing file cites, and the proof is the full test
 * suite run on a trimmed copy of the repository (scripts/sim-tree.sh -- sh -c 'node scripts/trim-capture.mjs --apply &&
 * scripts/verify.sh').
 *
 * FROZEN COPIES are trimmed the same way, and their FROZEN.sha256 lines are rewritten (freeze-capture's recordFiles):
 * the manifest then holds the trimmed .txt's hash, the meta's trimmed block the full one. freeze-capture.mjs understands a
 * trimmed copy: it refuses to freeze a trimmed capture, checkManifest holds a trimmed copy to its block, and --cited
 * takes a trimmed copy for the version whose full hashes its block records.
 *
 * WHAT IT DOES NOT DO. It does not touch a capture of an "allowed" or "unread" site, or of a site with no verdict
 * entry (listed as not reached), urls.txt (fold 8 pauses the lines), terms-verdicts.json, or git history. It never prints
 * a capture's text: sites, fields, file:line pointers, line numbers, counts and bytes only.
 *
 * Flags:
 *   <slug>...   only these captures (default: every capture in research/rendered). A named capture whose site has no
 *               verdict entry, an entry with no copying field, or copying "unread" is refused; "allowed" is nothing
 *               to do.
 *   --apply     write. Without it, a dry run: each capture the trim would change, its site and copying field, the
 *               cited lines found and in which files, the lines kept and the bytes removed, and the totals.
 *
 * Refused (exit 1, nothing written, for the whole run): a capture of a barred site whose verdict entry has no copying
 * field; a named capture as above; a trim that would blank a cited line (checked line by line after trimming); a binary
 * body cited by line; a capture whose files have uncommitted changes (the block names the commit that holds the full
 * bytes); a trimmed capture whose files no longer match its block; a meta that is not JSON or names no url.
 * Refused for that capture alone (exit 4, the rest of the run goes on and, with --apply, is written): a capture already
 * trimmed that the scanner cites at a line its trim emptied (a wide range is not such a citation). This script writes a
 * trimmed capture again only for the second pass, which never brings a line back, so holding the other captures back
 * would protect nothing. The remedy it prints depends on where the full bytes are: a commit (freeze the capture from it
 * and trim that copy), or nowhere (render-watch's route: the bytes were never retained, in git or anywhere else, so no
 * line of such a capture can come back to the tree; the citation names the capture by its URL, fetchedAt and sha256,
 * without a line of it, or is dropped). A reference the
 * scanner gives a capture past the end of its file, or to a
 * file of it that is not in the tree, blanks nothing (it reads as another file's line: "The TikTok note ... (`:724`)"
 * after indiebook-terms.txt, which has 297 lines): it is printed as a note, not kept and not refused.
 * Exit 0: a dry run that would trim or re-trim, or --apply that did; 3: nothing to do (every capture of a barred site
 * already trimmed under the wide rule, or holding nothing); 4: a capture refused alone (above), the rest done; 1: a
 * usage error or a refusal.
 *
 * src/__tests__/revenue/trim-capture.test.ts runs it on fixture stores; research/rendered/README.md ("Trimmed copies")
 * says how a reader gets the full bytes back.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { classifyCapture, readCapture } from "./capture-check.mjs";
import {
  activeSlugs,
  BARE_RE,
  CAPTURE_EXTS,
  decisionFiles,
  diskFiles,
  findCitations,
  isSlug,
  knownSlugs,
  manifestSlugs,
  MANIFEST,
  NAMED_RE,
  readManifest,
  recordFiles,
  RENDERED_REL,
  REPO_ROOT,
  scanKnown,
  scanOptions,
  WORD_RE,
} from "./freeze-capture.mjs";
import { loadVerdicts, siteOf } from "./queue-zero-test.mjs";

export const VERDICTS_REL = "research/channel-loop/terms-verdicts.json";
export const RULING = "research/channel-loop/RULING-2026-10-06-robots-and-terms.md decision 4(1) (ruling 6.10 row 21 (d))";
/** Lines kept either side of a cited line. */
export const CONTEXT = 2;
/** A cited range longer than this is "wide": not a quotation, and it keeps nothing (the ruling's amendment 1 (5)(iii)). */
export const WIDE_LINES = 20;
/** The rule a second pass applies, as its `passes` entry names it. */
export const WIDE_RULING =
  "research/channel-loop/RULING-2026-10-06-robots-and-terms.md amendment 1 (5)(iii) (ruling 6.10 row 21 (d)): a cited range longer than 20 lines keeps nothing";
/** The trimmed block's keys in their order (a re-trimmed block is written in it; keys it does not name follow). */
export const BLOCK_KEYS = ["on", "ruling", "site", "copying", "keptLines", "context", "fullSha256", "fullByteLength", "lineCount", "body", "cited", "wide", "captureCheck", "fullBytesIn", "history"];
/** Bodies that are text and can keep a cited line in place; the others are binary. */
export const TEXT_BODIES = new Set(["html", "json", "xml"]);
export const HISTORY =
  "Git history keeps the full bytes (fullBytesIn). Whether to rewrite public history is the owner's decision, listed " +
  "with the §6 public/private decision (ruling 6.10 row 21 decision 4(1)): a fact for that decision, not an ask.";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const todayUtc = () => new Date().toISOString().slice(0, 10);
const range = (a, b) => [Number(a), b === undefined ? Number(a) : Number(b)];

/** Whether a cited [from, to] range is wide: longer than WIDE_LINES lines (amendment 1 (5)(iii)). */
export function isWide([a, b]) {
  return b - a + 1 > WIDE_LINES;
}

/** The ranges of the citations that keep lines: every one but a wide range, which keeps nothing, not even its ends. */
export function keepingRanges(cites) {
  return cites.filter((c) => !isWide(c.range)).map((c) => c.range);
}

/** The lines both range lists hold, as merged [from, to] ranges. */
export function intersectRanges(a, b) {
  const out = [];
  for (const [a0, a1] of a) {
    for (const [b0, b1] of b) {
      const lo = Math.max(a0, b0);
      const hi = Math.min(a1, b1);
      if (lo <= hi) out.push([lo, hi]);
    }
  }
  return keptRanges(out, Number.MAX_SAFE_INTEGER, 0);
}

/** How many lines merged ranges hold. */
export const linesIn = (ranges) => ranges.reduce((n, [a, b]) => n + b - a + 1, 0);

/**
 * The sha256 of a capture file's FULL bytes, for a reader that checks a capture against its meta: the trimmed block's
 * record when the trim replaced or removed the file (fullSha256 for the .txt, body.sha256 for the body), else the file's
 * own hash; null when neither exists.
 */
export function fullSha256Of(dir, slug, ext) {
  const meta = JSON.parse(readFileSync(join(dir, `${slug}.meta.json`), "utf8"));
  const t = meta.trimmed;
  if (t && ext === "txt" && t.lineCount != null) return t.fullSha256;
  if (t && t.body && extOf(t.body.path) === ext) return t.body.sha256;
  const path = join(dir, `${slug}.${ext}`);
  return existsSync(path) ? sha256(readFileSync(path)) : null;
}

/** The verdict entry's copying field for a site: { site, state } with state "barred" | "allowed" | "unread" | "no-entry" | "no-field". */
export function copyingOf(site, sites) {
  if (!site || !Object.hasOwn(sites, site)) return { site, state: "no-entry" };
  const copying = sites[site]?.copying;
  if (copying === undefined) return { site, state: "no-field" };
  return { site, state: copying };
}

/** The site of a capture: siteOf its meta's url host, or null. */
export function siteOfMeta(meta) {
  try {
    return siteOf(new URL(meta.url).hostname);
  } catch {
    return null;
  }
}

/**
 * Merge [from, to] ranges, each widened by context and clamped to 1..lineCount; ranges past the end are dropped here
 * (the plan refuses them before).
 */
export function keptRanges(ranges, lineCount, context = CONTEXT) {
  const wide = ranges
    .filter(([a, b]) => a >= 1 && b >= a && a <= lineCount)
    .map(([a, b]) => [Math.max(1, a - context), Math.min(lineCount, b + context)])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const out = [];
  for (const [a, b] of wide) {
    const last = out.at(-1);
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

/** The text with every line outside kept emptied: the same number of lines ("\n"-separated), the kept ones verbatim. */
export function trimLines(text, kept) {
  const lines = String(text).split("\n");
  const keep = (n) => kept.some(([a, b]) => n >= a && n <= b);
  return lines.map((line, i) => (keep(i + 1) ? line : "")).join("\n");
}

const lineCountOf = (bytes) => bytes.toString("utf8").split("\n").length;
const extOf = (path) => (typeof path === "string" ? CAPTURE_EXTS.find((ext) => ext !== "meta.json" && path.endsWith(`.${ext}`)) ?? null : null);

/**
 * Every citation of the given slugs in the decision-bearing files under root: Map slug -> [{ ext, range, by, how }].
 * how: "cited" (the scanner's), or "on its line" (a bare :N or "line N" on a line that names a capture no active
 * urls.txt line names; header comment). ext null: the reference names no file of the capture.
 */
export function citationsOf({ root = REPO_ROOT, slugs, urlsText }) {
  const known = scanKnown(root, urlsText);
  const active = activeSlugs(urlsText);
  const want = new Set(slugs);
  const out = new Map([...want].map((s) => [s, []]));
  for (const file of decisionFiles(root)) {
    const text = readFileSync(join(root, file), "utf8");
    const lines = text.split("\n");
    const named = new Map();
    for (const c of findCitations(text, known, scanOptions(file))) {
      if (!want.has(c.slug)) continue;
      for (const r of c.refs) out.get(c.slug).push({ ext: r.ext ?? c.ext ?? null, range: r.range, by: `${file}:${r.fileLine}`, how: "cited" });
      if (active.has(c.slug)) continue;
      for (const n of new Set([c.fileLine, ...c.refs.map((r) => r.fileLine)])) named.set(n, new Set([...(named.get(n) ?? []), c.slug]));
    }
    for (const [n, slugsOnLine] of named) {
      const line = lines[n - 1] ?? "";
      const refs = [
        ...[...line.matchAll(BARE_RE)].map((m) => ({ ext: "txt", range: range(m[1], m[2]) })),
        ...[...line.matchAll(WORD_RE)].map((m) => ({ ext: (m[1] ?? "txt").toLowerCase(), range: range(m[2], m[3]) })),
        // "html:812", "txt:40": a file of the capture by its extension alone (the scanner reads it as another name's line).
        ...[...line.matchAll(NAMED_RE)].map((m) => /^(html|txt):(\d+)(?:-(\d+))?$/i.exec(m[0])).filter(Boolean).map((m) => ({ ext: m[1].toLowerCase(), range: range(m[2], m[3]) })),
      ];
      for (const slug of slugsOnLine) for (const r of refs) out.get(slug).push({ ...r, by: `${file}:${n}`, how: "on its line" });
    }
  }
  return out;
}

/**
 * The last commit that wrote the capture's files under root, or null when root is not the top of a git work tree (a
 * fixture store). Throws on uncommitted changes: the block names the commit that holds the full bytes.
 */
export function historyOf(root, slug) {
  const rels = CAPTURE_EXTS.map((ext) => `${RENDERED_REL}/${slug}.${ext}`);
  const git = (args) => spawnSync("git", ["--no-optional-locks", ...args], { cwd: root, encoding: "utf8" });
  const top = git(["rev-parse", "--show-toplevel"]);
  if (top.status !== 0 || !existsSync(root) || realpathSync(top.stdout.trim()) !== realpathSync(root)) return null;
  const status = git(["status", "--porcelain", "--", ...rels]);
  if (status.status !== 0) throw new Error(`git cannot read ${slug}: ${String(status.stderr).trim()}`);
  if (status.stdout.trim()) {
    throw new Error(`${slug} has uncommitted changes (${status.stdout.trim().split("\n").join("; ")}): commit it first, so the trimmed block names the commit that holds the full bytes`);
  }
  return git(["log", "-1", "--format=%H", "--", ...rels]).stdout.trim() || null;
}

/**
 * The meta's text with `"trimmed": {...}` appended as its last key, every earlier line byte for byte (a citation of a
 * meta line, `.meta.json:5`, does not move). Throws when the result would not parse back to the meta plus the block.
 */
export function appendTrimmed(metaText, meta, trimmed) {
  const head = String(metaText).replace(/\s*\}\s*$/, "");
  const block = JSON.stringify(trimmed, null, 2).split("\n").join("\n  ");
  const out = `${head},\n  "trimmed": ${block}\n}\n`;
  let back;
  try {
    back = JSON.parse(out);
  } catch {
    back = null;
  }
  if (!back || JSON.stringify(back) !== JSON.stringify({ ...meta, trimmed })) throw new Error("the meta cannot take a trimmed block without moving its lines");
  return out;
}

/**
 * The meta's text with its trimmed block (its last key) replaced, every line above the block byte for byte (the second
 * pass). Throws when the block is not the meta's last key, or the result would not parse back to the meta with the new
 * block.
 */
export function replaceTrimmed(metaText, meta, trimmed) {
  const text = String(metaText);
  const at = text.lastIndexOf(',\n  "trimmed": {');
  if (at < 0) throw new Error("the meta's trimmed block cannot be rewritten without moving its lines");
  const { trimmed: _old, ...rest } = meta;
  return appendTrimmed(`${text.slice(0, at)}\n}\n`, rest, trimmed);
}

/** A trimmed block with its keys in BLOCK_KEYS order, any other key after them, and passes last. */
export function orderBlock(block) {
  const out = {};
  for (const k of BLOCK_KEYS) if (Object.hasOwn(block, k)) out[k] = block[k];
  for (const k of Object.keys(block)) if (!Object.hasOwn(out, k) && k !== "passes") out[k] = block[k];
  if (Object.hasOwn(block, "passes")) out.passes = block.passes;
  return out;
}

/** The block's record of citations: one entry per file and range, the citing file:lines merged, sorted. */
function citeRecord(cites) {
  const why = new Map();
  for (const c of cites) {
    const key = `${c.ext}:${c.range[0]}-${c.range[1]}`;
    if (!why.has(key)) why.set(key, { file: c.ext, lines: c.range, by: [] });
    for (const by of [c.by].flat()) if (!why.get(key).by.includes(by)) why.get(key).by.push(by);
  }
  return [...why.values()].sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.lines[0] - b.lines[0] || a.lines[1] - b.lines[1]));
}

/**
 * The second pass over a trimmed capture (the wide rule, amendment 1 (5)(iii); header comment). Per kept file (the .txt,
 * or a text body in the tree) that a wide range cites, now (cites) or in the block's record: the old kept lines that a
 * range that is not wide, now or recorded, still keeps with its context. A range counts as the first pass counts it:
 * one that starts in the file does (running past its end, it is wide by its own length, or keeps what of it the file
 * has), one that starts past the end does not. Returns { ext, before, after, lines, wide } for each file whose kept
 * lines would shrink; none when the wide rule takes nothing more.
 */
export function widePass({ t, cites }) {
  const bodyExt = extOf(t.body?.path);
  const recorded = [...(t.cited ?? []), ...(t.wide ?? [])].map((r) => ({ ext: r.file, range: r.lines, by: r.by, how: "recorded" }));
  const out = [];
  for (const [ext, before, lines, inTree] of [
    ["txt", t.keptLines ?? [], t.lineCount, true],
    [bodyExt, t.body?.keptLines ?? [], t.body?.lineCount, Boolean(t.body?.inTree)],
  ]) {
    if (!ext || lines == null || !inTree || !before.length) continue;
    const all = [...cites, ...recorded].filter((c) => c.ext === ext && c.range[0] <= lines);
    const wide = all.filter((c) => isWide(c.range));
    if (!wide.length) continue;
    const after = intersectRanges(keptRanges(keepingRanges(all), lines), before);
    if (linesIn(after) < linesIn(before)) out.push({ ext, before, after, lines, wide });
  }
  return out;
}

const fmt = (n) => n.toLocaleString("en-US");
const rangesText = (rs) => rs.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ");

/**
 * Plan one capture of a barred site: { slug, state, writes, removes, meta, ... } where state is "trim", "already",
 * "nothing" or "refused" (a trimmed capture cited at a line its trim emptied: refused alone, `why` says why and what to
 * do). Throws an Error saying why on every refusal of the run. files: diskFiles of the capture; cites: its citationsOf list.
 * trimText is trimLines; a test hands in a faulty one to show that the guard against blanking a cited line holds even
 * when the trim itself is wrong (with trimLines and keptRanges it never fires: they keep every cited line by construction).
 */
export function planCapture({ slug, dir, files, cites, site, on, commit, captureCheck = null, trimText = trimLines }) {
  const metaText = files.get("meta.json").toString("utf8");
  const meta = JSON.parse(metaText);
  const body = [...files.keys()].find((ext) => ext !== "meta.json" && ext !== "txt") ?? null;
  const bodyExt = extOf(meta.bodyPath) && extOf(meta.bodyPath) !== "txt" ? extOf(meta.bodyPath) : body;
  const resolved = cites.map((c) => ({ ...c, ext: c.ext ?? (files.has("txt") ? "txt" : bodyExt ?? "txt") }));
  const byExt = (ext, how) => resolved.filter((c) => c.ext === ext && (!how || c.how === how));
  const plan = { slug, site, frozen: Boolean(meta.frozen), meta, cites: resolved, writes: [], removes: [], removed: 0, kept: {}, bodyExt };

  if (meta.trimmed) {
    const t = meta.trimmed;
    const problems = [];
    if (t.lineCount != null && (!files.has("txt") || lineCountOf(files.get("txt")) !== t.lineCount)) problems.push(`its .txt no longer has the ${t.lineCount} lines its trimmed block records`);
    const bodyPath = t.body?.path ? extOf(t.body.path) : null;
    if (bodyPath && files.has(bodyPath) !== Boolean(t.body.inTree)) problems.push(`its ${bodyPath} is ${files.has(bodyPath) ? "back in" : "missing from"} the tree, which its trimmed block says it ${t.body.inTree ? "stays in" : "left"}`);
    if (problems.length) throw new Error(`${slug} is trimmed (${t.on}) but ${problems.join("; ")}: restore the trimmed files (git history holds them)`);
    const keptOf = (ext) => (ext === "txt" ? t.keptLines ?? [] : ext === bodyPath ? t.body?.keptLines ?? [] : null);
    const linesOf = (ext) => (ext === "txt" ? t.lineCount : ext === bodyPath ? t.body?.lineCount : null);
    const inside = (c) => {
      const kept = keptOf(c.ext);
      return c.ext === "meta.json" || (kept != null && kept.some(([a, b]) => c.range[0] >= a && c.range[1] <= b));
    };
    // A reference past the end of the file (or to a file the capture never had) blanked nothing, as on the first run.
    const stray = (c) => c.ext !== "meta.json" && (linesOf(c.ext) == null || c.range[1] > linesOf(c.ext));
    // What the second pass records as cited now: as the first pass records, every reference that starts in the file.
    const starts = (c) => c.ext !== "meta.json" && linesOf(c.ext) != null && c.range[0] <= linesOf(c.ext);
    // Where the full bytes are: a commit (this script's trim; null in a store outside git), or nowhere in git
    // (render-watch's route stored the capture: "never in the tree or in git history").
    plan.committed = t.fullBytesIn == null || /^commit [0-9a-f]+\b/.test(String(t.fullBytesIn));
    plan.remedy = plan.committed
      ? `freeze the capture from the commit that holds the full bytes (${t.fullBytesIn ?? "git history"}) and trim that copy`
      : `its full bytes were never retained (fullBytesIn: "${t.fullBytesIn}"), so no line of it can come back to the tree and no copy of it can be frozen: ` +
        "quote it in the research file without a line of this capture (cite its URL, fetchedAt and sha256, which name the version), or drop the citation";
    // A wide range is not a quotation (amendment 1 (5)(iii)): emptying it is the rule, not a blanked citation.
    const blanked = resolved.filter((c) => c.how === "cited" && !isWide(c.range) && !stray(c) && !inside(c));
    if (blanked.length) {
      // This capture alone: it is never written again here, so the rest of the run is not held back by it.
      const c = blanked[0];
      plan.state = "refused";
      plan.why =
        `${slug} is trimmed (${t.on}) and ${c.by} cites ${c.ext}:${rangesText([c.range])}, which the trim emptied (${blanked.length} such citation(s)): ` +
        `${plan.remedy}${plan.committed ? ", or cite a kept line" : ""}`;
      return plan;
    }
    // The second pass: a capture trimmed before the wide rule keeps lines only a wide range reached; they are emptied.
    const changes = widePass({ t, cites: resolved });
    if (changes.length) return retrimPlan({ plan, t, files, metaText, meta, resolved, changes, stray, starts, inside, on, trimText, dir });
    plan.state = "already";
    plan.late = resolved.filter((c) => c.how !== "cited" && !isWide(c.range) && !stray(c) && !inside(c));
    return plan;
  }

  const texts = [...files.keys()].filter((ext) => ext !== "meta.json");
  if (!texts.length) {
    plan.state = "nothing";
    plan.why = `no body and no text in the tree${Number.isInteger(meta.status) ? ` (status ${meta.status})` : ""}`;
    return plan;
  }
  // A reference to a line the capture does not have blanks nothing: the scanner gave it this capture, and it reads as
  // another file's (a note's line carried past the capture's name). Said, never kept, never a refusal.
  plan.stray = resolved.filter((c) => c.ext !== "meta.json" && c.how === "cited" && (!files.has(c.ext) || c.range[1] > lineCountOf(files.get(c.ext))));

  const trimmed = {
    on,
    ruling: RULING,
    site,
    copying: "barred",
    keptLines: [],
    context: CONTEXT,
    fullSha256: null,
    fullByteLength: null,
    lineCount: null,
    body: null,
    cited: [],
    wide: [],
    captureCheck,
    fullBytesIn: commit ? `commit ${commit} (git show ${commit}:${RENDERED_REL}/${slug}.<ext>)` : null,
    history: HISTORY,
  };
  for (const ext of texts) {
    const bytes = files.get(ext);
    const n = lineCountOf(bytes);
    const isText = ext === "txt";
    const all = byExt(ext).filter((c) => c.range[0] <= n);
    // A wide range keeps nothing (amendment 1 (5)(iii)): not a quotation, so neither kept nor held by the guard below.
    const cited = all.filter((c) => !isWide(c.range));
    if (!isText && cited.length && !TEXT_BODIES.has(ext)) throw new Error(`${cited[0].by} cites ${slug}.${ext}:${rangesText([cited[0].range])}, a binary body: it cannot be kept by line`);
    const kept = keptRanges(keepingRanges(all), n);
    // The text's bytes, newlines not counted (a trimmed file keeps every newline): of the full file, and kept.
    plan.kept[ext] = { kept, lines: n, cited, wide: all.filter((c) => isWide(c.range)), textBytes: bytes.length - (n - 1), keptBytes: 0 };
    const record = { sha256: sha256(bytes), byteLength: bytes.length, lineCount: n, keptLines: kept };
    if (isText) {
      Object.assign(trimmed, { keptLines: kept, fullSha256: record.sha256, fullByteLength: record.byteLength, lineCount: n });
    } else {
      trimmed.body = { path: `${RENDERED_REL}/${slug}.${ext}`, ...record, inTree: kept.length > 0 };
    }
    if (isText || kept.length) {
      const out = Buffer.from(trimText(bytes.toString("utf8"), kept), "utf8");
      if (lineCountOf(out) !== n) throw new Error(`${slug}.${ext}: the trimmed text would not keep its ${n} lines`);
      // Refuses to blank a cited line (4(5)): every cited line reads in the trimmed text as it did in the full one.
      const before = bytes.toString("utf8").split("\n");
      const after = out.toString("utf8").split("\n");
      const lost = cited.find((c) => before.slice(c.range[0] - 1, c.range[1]).some((line, i) => after[c.range[0] - 1 + i] !== line));
      if (lost) throw new Error(`${slug}.${ext}: the trim would blank ${lost.ext}:${rangesText([lost.range])}, which ${lost.by} cites`);
      plan.writes.push({ ext, path: join(dir, `${slug}.${ext}`), bytes: out });
      plan.removed += bytes.length - out.length;
      plan.kept[ext].keptBytes = out.length - (n - 1);
    } else {
      plan.removes.push({ ext, path: join(dir, `${slug}.${ext}`) });
      plan.removed += bytes.length;
    }
  }
  const recorded = resolved.filter((c) => c.ext !== "meta.json" && files.has(c.ext) && c.range[0] <= plan.kept[c.ext].lines);
  trimmed.cited = citeRecord(recorded.filter((c) => !isWide(c.range)));
  trimmed.wide = citeRecord(recorded.filter((c) => isWide(c.range)));
  plan.writes.push({ ext: "meta.json", path: join(dir, `${slug}.meta.json`), bytes: Buffer.from(appendTrimmed(metaText, meta, trimmed), "utf8") });
  plan.trimmed = trimmed;
  plan.state = "trim";
  return plan;
}

/**
 * Plan the second pass of a trimmed capture (widePass's changes): each changed file emptied to its new kept lines (a body
 * left with none leaves the tree), the block rewritten in place with the pass recorded. Throws when a file no longer has
 * the lines its block records, or when a line that a range that is not wide cites, and the trim kept, would be blanked.
 */
function retrimPlan({ plan, t, files, metaText, meta, resolved, changes, stray, starts, inside, on, trimText, dir }) {
  const slug = plan.slug;
  const block = { ...t };
  for (const ch of changes) {
    const bytes = files.get(ch.ext);
    const n = bytes ? lineCountOf(bytes) : null;
    if (n !== ch.lines) throw new Error(`${slug} is trimmed (${t.on}) but its ${ch.ext} no longer has the ${ch.lines} lines its trimmed block records: restore the trimmed files (git history holds them)`);
    const out = Buffer.from(trimText(bytes.toString("utf8"), ch.after), "utf8");
    if (lineCountOf(out) !== n) throw new Error(`${slug}.${ch.ext}: the re-trimmed text would not keep its ${n} lines`);
    // Refuses to blank a cited line (4(5)): every line a range that is not wide cites, and the trim had kept, reads as it did.
    const before = bytes.toString("utf8").split("\n");
    const after = out.toString("utf8").split("\n");
    const lost = resolved.find(
      (c) => c.ext === ch.ext && !isWide(c.range) && !stray(c) && inside(c) && before.slice(c.range[0] - 1, c.range[1]).some((line, i) => after[c.range[0] - 1 + i] !== line),
    );
    if (lost) throw new Error(`${slug}.${ch.ext}: the re-trim would blank ${lost.ext}:${rangesText([lost.range])}, which ${lost.by} cites`);
    const fullBytes = ch.ext === "txt" ? t.fullByteLength : t.body.byteLength;
    plan.kept[ch.ext] = { kept: ch.after, before: ch.before, lines: n, wide: ch.wide, textBytes: fullBytes - (n - 1), keptBytes: out.length - (n - 1), keptBytesBefore: bytes.length - (n - 1) };
    if (ch.ext === "txt") block.keptLines = ch.after;
    else block.body = { ...t.body, keptLines: ch.after, inTree: ch.after.length > 0 };
    if (ch.ext !== "txt" && !ch.after.length) {
      plan.removes.push({ ext: ch.ext, path: join(dir, `${slug}.${ch.ext}`) });
      plan.removed += bytes.length;
    } else {
      plan.writes.push({ ext: ch.ext, path: join(dir, `${slug}.${ch.ext}`), bytes: out });
      plan.removed += bytes.length - out.length;
    }
  }
  // The record: what the block said and what is cited now, the wide ranges apart (they keep nothing).
  const recorded = [...(t.cited ?? []), ...(t.wide ?? [])].map((r) => ({ ext: r.file, range: r.lines, by: r.by }));
  const now = resolved.filter(starts);
  block.cited = citeRecord([...recorded, ...now].filter((c) => !isWide(c.range)));
  block.wide = citeRecord([...recorded, ...now].filter((c) => isWide(c.range)));
  block.passes = [...(t.passes ?? []), { on, ruling: WIDE_RULING, keptLinesBefore: t.keptLines ?? [], bodyKeptLinesBefore: t.body ? (t.body.keptLines ?? []) : null }];
  const trimmed = orderBlock(block);
  plan.writes.push({ ext: "meta.json", path: join(dir, `${slug}.meta.json`), bytes: Buffer.from(replaceTrimmed(metaText, meta, trimmed), "utf8") });
  plan.trimmed = trimmed;
  plan.retrim = changes;
  plan.state = "retrim";
  return plan;
}

/** Write a planned trim: the trimmed files, the removals, the meta last. */
export function applyPlan(plan) {
  for (const w of plan.writes.filter((x) => x.ext !== "meta.json")) writeFileSync(w.path, w.bytes);
  for (const r of plan.removes) rmSync(r.path, { force: true });
  for (const w of plan.writes.filter((x) => x.ext === "meta.json")) writeFileSync(w.path, w.bytes);
}

/**
 * The trim over a store: every capture under root's research/rendered (or the named slugs). Returns the exit code; log
 * gets every line it prints.
 */
export function trimStore({ root = REPO_ROOT, slugs: named = [], apply = false, on = todayUtc(), log = console.log } = {}) {
  const dir = join(root, RENDERED_REL);
  const verdictsPath = join(root, VERDICTS_REL);
  let sites;
  try {
    sites = loadVerdicts(verdictsPath);
  } catch (err) {
    log(`REFUSED: ${VERDICTS_REL} cannot be read: ${err.message}`);
    return 1;
  }
  if (!sites || typeof sites !== "object") {
    log(`REFUSED: ${VERDICTS_REL} has no "sites"`);
    return 1;
  }
  const fieldCounts = {};
  for (const e of Object.values(sites)) fieldCounts[e?.copying ?? "(none)"] = (fieldCounts[e?.copying ?? "(none)"] ?? 0) + 1;
  log(`trim-capture: ${VERDICTS_REL}: copying ${Object.entries(fieldCounts).sort().map(([k, n]) => `${k} ${n}`).join(", ")}`);

  const all = [...knownSlugs(dir)].sort();
  for (const s of named) {
    if (!isSlug(s) || !all.includes(s)) {
      log(`REFUSED: not a capture in ${RENDERED_REL}: ${JSON.stringify(s)}`);
      return 1;
    }
  }
  const slugs = named.length ? [...new Set(named)].sort() : all;
  const refusals = [];
  const barred = [];
  const notReached = { allowed: 0, unread: 0, "no-entry": new Map() };
  for (const slug of slugs) {
    let meta;
    try {
      meta = JSON.parse(readFileSync(join(dir, `${slug}.meta.json`), "utf8"));
    } catch (err) {
      refusals.push(`${slug}: its meta is not JSON (${err.message})`);
      continue;
    }
    const site = siteOfMeta(meta);
    if (!site) {
      refusals.push(`${slug}: its meta names no url, so its site cannot be judged`);
      continue;
    }
    const { state } = copyingOf(site, sites);
    if (state === "barred") barred.push({ slug, site });
    else if (state === "no-field") refusals.push(`${slug}: ${site}'s entry in ${VERDICTS_REL} has no copying field (ruling 6.10 row 21 (d) 4(2)): the trim decides by it`);
    else if (named.length && state === "allowed") log(`nothing to do: ${slug} (${site}, copying allowed)`);
    else if (named.length) refusals.push(`${slug}: ${site} is ${state === "no-entry" ? `not in ${VERDICTS_REL}` : `copying ${state}`}; only a copying-barred site is trimmed, and ${state === "no-entry" ? "a site with no entry" : `"${state}"`} is not "allowed" either (fold 10(i) reads its clause first)`);
    else if (state === "no-entry") notReached["no-entry"].set(site, (notReached["no-entry"].get(site) ?? 0) + 1);
    else notReached[state === "allowed" ? "allowed" : "unread"] += 1;
  }

  const urlsPath = join(dir, "urls.txt");
  const urlsText = existsSync(urlsPath) ? readFileSync(urlsPath, "utf8") : "";
  const cites = citationsOf({ root, slugs: barred.map((b) => b.slug), urlsText });
  const plans = [];
  for (const { slug, site } of barred) {
    try {
      const files = diskFiles(slug, dir);
      const metaJson = JSON.parse(files.get("meta.json").toString("utf8"));
      let captureCheck = null;
      if (!metaJson.trimmed) {
        try {
          captureCheck = classifyCapture(readCapture(slug, dir)).kind;
        } catch {
          captureCheck = "unreadable";
        }
      }
      const commit = metaJson.trimmed ? null : historyOf(root, slug);
      plans.push(planCapture({ slug, dir, files, cites: cites.get(slug), site, on, commit, captureCheck }));
    } catch (err) {
      refusals.push(`${slug}: ${err.message}`);
    }
  }

  const sitesBarred = new Set(barred.map((b) => b.site));
  log(`trim-capture: ${slugs.length} capture(s) in ${RENDERED_REL}${named.length ? " (named)" : ""}; ${barred.length} of ${sitesBarred.size} copying-barred site(s)`);
  if (refusals.length) {
    for (const r of refusals) log(`REFUSED ${r}`);
    log(`trim-capture: ${refusals.length} refusal(s); nothing written`);
    return 1;
  }

  const manifest = existsSync(join(dir, MANIFEST)) ? manifestSlugs(readManifest(dir)) : new Set();
  const totals = { trim: 0, frozen: 0, live: 0, already: 0, nothing: 0, refused: 0, retrim: 0, bodiesRemoved: 0, bodiesKept: 0, bodyBytes: 0, texts: 0, bytes: 0, recorded: 0, citations: 0, textBytes: 0, keptBytes: 0, wide: 0 };
  const share = (kept, all) => `${fmt(kept)} of ${fmt(all)} bytes, ${all ? ((100 * kept) / all).toFixed(1) : "0.0"}%`;
  // Each wide range of a file once, with every line that cites it: the scanner's reading first, so a range it cites and
  // the line names again is not marked "on its line"; a line only the block's record names is listed as it is.
  const wideLines = (ext, list) => {
    const ranges = new Map();
    for (const c of list) {
      const key = rangesText([c.range]);
      if (!ranges.has(key)) ranges.set(key, new Map());
      for (const by of [c.by].flat()) if (!ranges.get(key).has(by) || c.how === "cited") ranges.get(key).set(by, c.how);
    }
    totals.wide += ranges.size;
    return [...ranges].map(
      ([r, by]) =>
        `  wide: ${ext}:${r} (${[...by].map(([at, how]) => `${at}${how === "on its line" ? " on its line" : ""}`).join(", ")}) is longer than ${WIDE_LINES} lines: ` +
        "not a quotation, it keeps nothing (RULING-2026-10-06-robots-and-terms.md amendment 1 (5)(iii)); a line in it that is cited apart keeps that citation's context",
    );
  };
  const records = (p) => p.frozen && manifest.has(p.slug);
  for (const p of plans) {
    if (p.state === "refused") {
      totals.refused += 1;
      log(`REFUSED ${p.slug} (this capture alone; nothing of it is written, the run goes on): ${p.why}`);
      continue;
    }
    if (p.state === "nothing") {
      totals.nothing += 1;
      log(`nothing to trim: ${p.slug} (${p.site}): ${p.why}`);
      continue;
    }
    if (p.state === "retrim") {
      // The second pass (amendment 1 (5)(iii)): lines kept only because of a wide range are emptied.
      totals.retrim += 1;
      const ranges = [...new Set(p.retrim.flatMap((ch) => ch.wide.map((c) => `${ch.ext}:${rangesText([c.range])}`)))];
      log(
        `${apply ? "re-trimmed" : "would re-trim"} ${p.slug} (wide range ${ranges.join(", ")}; ${p.site}, copying barred, trimmed ${p.meta.trimmed.on}; ` +
          `${p.frozen ? `frozen${records(p) ? `, ${MANIFEST} follows` : ""}` : "live"})`,
      );
      for (const ch of p.retrim) {
        const k = p.kept[ch.ext];
        for (const line of wideLines(ch.ext, ch.wide)) log(line);
        const removing = p.removes.some((r) => r.ext === ch.ext);
        log(
          `  ${ch.ext}: keep ${k.kept.length ? rangesText(k.kept) : "no line"} (${fmt(linesIn(k.kept))} of ${fmt(k.lines)} lines; ${share(removing ? 0 : k.keptBytes, k.textBytes)})` +
            `${removing ? ", so it leaves the tree" : ""}; was ${rangesText(k.before)} (${fmt(linesIn(k.before))} lines; ${share(k.keptBytesBefore, k.textBytes)})`,
        );
        totals.textBytes += k.textBytes;
        totals.keptBytes += removing ? 0 : k.keptBytes;
      }
      totals.bytes += p.removed;
      log(`  ${fmt(p.removed)} bytes ${apply ? "emptied" : "would be emptied"}; the full hashes in the block stay as they were`);
      if (apply) {
        applyPlan(p);
        if (records(p)) recordFiles(dir, p.slug);
      }
      if (records(p)) totals.recorded += 1;
      continue;
    }
    if (p.state === "already") {
      totals.already += 1;
      log(`already trimmed: ${p.slug} (${p.site}, ${p.meta.trimmed.on})`);
      for (const c of p.late) log(`  note: ${c.by} names ${p.slug} beside ${c.ext}:${rangesText([c.range])}, which the trim emptied; if that is this capture's line, ${p.remedy}`);
      continue;
    }
    totals.trim += 1;
    totals[p.frozen ? "frozen" : "live"] += 1;
    log(`${apply ? "trimmed" : "would trim"} ${p.slug} (${p.site}, copying barred; ${p.frozen ? `frozen${records(p) ? `, ${MANIFEST} follows` : ""}` : "live"})`);
    const byRange = new Map();
    for (const c of p.cites.filter((x) => p.kept[x.ext] && x.range[0] <= p.kept[x.ext].lines && !isWide(x.range))) {
      const key = `${c.ext}:${rangesText([c.range])}`;
      byRange.set(key, [...(byRange.get(key) ?? []), `${c.by}${c.how === "cited" ? "" : " (on its line)"}`]);
    }
    totals.citations += byRange.size;
    for (const c of p.stray) log(`  note: ${c.by} gives ${p.slug} ${c.ext}:${rangesText([c.range])}, which it does not have (${c.ext === "txt" || p.kept[c.ext] ? "past the end" : "no such file"}): another file's line, nothing to keep`);
    if (!byRange.size) log("  cited: no line (nothing kept but the line count)");
    for (const [key, by] of [...byRange].sort()) log(`  cited ${key} by ${[...new Set(by)].join(", ")}`);
    for (const [ext, k] of Object.entries(p.kept)) {
      const removing = p.removes.some((r) => r.ext === ext);
      const keptN = k.kept.reduce((n, [a, b]) => n + b - a + 1, 0);
      if (removing) {
        totals.bodiesRemoved += 1;
        totals.bodyBytes += p.trimmed.body.byteLength;
        log(`  ${ext}: removed from the tree (${fmt(p.trimmed.body.byteLength)} bytes, ${fmt(k.lines)} lines; sha256 ${p.trimmed.body.sha256.slice(0, 12)} in the meta)`);
      } else {
        if (ext === "txt") totals.texts += 1;
        else totals.bodiesKept += 1;
        totals.textBytes += k.textBytes;
        totals.keptBytes += k.keptBytes;
        log(`  ${ext}: keep ${k.kept.length ? rangesText(k.kept) : "no line"} (${fmt(keptN)} of ${fmt(k.lines)} lines; ${share(k.keptBytes, k.textBytes)})`);
      }
      // A range that names what was read ("txt in full (body :29-269)") is not a quotation: it keeps nothing.
      for (const line of wideLines(ext, k.wide)) log(line);
    }
    totals.bytes += p.removed;
    log(`  ${fmt(p.removed)} bytes removed`);
    if (apply) {
      applyPlan(p);
      if (records(p)) recordFiles(dir, p.slug);
    }
    if (records(p)) totals.recorded += 1;
  }
  const noEntry = [...notReached["no-entry"]].sort().map(([s, n]) => `${s} ${n}`);
  log(
    `totals: ${plans.length} capture(s) of ${sitesBarred.size} copying-barred site(s): ${totals.trim} ${apply ? "trimmed" : "would be trimmed"} ` +
      `(${totals.frozen} frozen, ${totals.live} live), ${totals.already} already trimmed, ${totals.nothing} with nothing in the tree, ${totals.refused} refused alone; ` +
      `${totals.retrim} trimmed before the wide rule ${apply ? "re-trimmed" : "would be re-trimmed"} (amendment 1 (5)(iii)), ${totals.wide} wide range(s) keeping nothing; ` +
      `bodies: ${totals.bodiesRemoved} ${apply ? "removed" : "would be removed"}, ${totals.bodiesKept} kept trimmed (cited by line); ` +
      `texts: ${totals.texts} trimmed; ${fmt(totals.bytes)} bytes ${apply ? "removed" : "would be removed"}; ` +
      `text kept in the trimmed files: ${share(totals.keptBytes, totals.textBytes)}; ` +
      `${totals.citations} cited range(s) kept; ${MANIFEST}: ${totals.recorded} frozen cop${totals.recorded === 1 ? "y's" : "ies'"} lines ${apply ? "rewritten" : "would be rewritten"}`,
  );
  if (!named.length) {
    log(`not reached: ${notReached.allowed} capture(s) of copying-allowed sites, ${notReached.unread} of unread sites, ${[...notReached["no-entry"].values()].reduce((a, b) => a + b, 0)} of ${noEntry.length} site(s) with no verdict entry${noEntry.length ? ` (${noEntry.join(", ")})` : ""}`);
  }
  if (totals.refused) return 4;
  return totals.trim || totals.retrim ? 0 : 3;
}

export function main(argv, root = REPO_ROOT, log = console.log) {
  const usage = "usage: node scripts/trim-capture.mjs [<slug>...] [--apply]";
  let args;
  try {
    args = parseArgs({ args: argv, allowPositionals: true, options: { apply: { type: "boolean" } } });
  } catch (err) {
    log(`${err.message}\n${usage}`);
    return 1;
  }
  return trimStore({ root, slugs: args.positionals, apply: Boolean(args.values.apply), log });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
