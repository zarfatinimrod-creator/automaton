#!/usr/bin/env node
/**
 * freeze-capture — a dated copy of a render-watch capture, which the weekly render never rewrites.
 *
 *   node scripts/freeze-capture.mjs <slug> [--date YYYY-MM-DD] [--from-commit <sha>] [--allow-flagged] [--why <text>] [--dry-run]
 *   node scripts/freeze-capture.mjs --cited [--unlined] [--keep <file>:<line>]... [--history] [--apply]
 *
 * Why: research notes, rulings and verdicts cite captures by line (research/rendered/<slug>.txt:NNN), and
 * render-watch.yml rewrites a capture in place whenever the page changed, so a cited line can silently come to say
 * something else. Three captures were frozen by hand for that reason (nevo-vat-law-2026-09-29,
 * kokoro-82m-model-card-2026-09-29, hexgrad-kokoro-voices-js-dfb907a: their metas' "frozen" blocks say why, and
 * products/il-biz-tools/tests/osek-zair-page.test.js pins the shape). This does the same by script.
 *
 * FREEZE ONE. <slug> copies every file of the capture (research/rendered/<slug>.{meta.json,txt,html,json,pdf,xml,bin},
 * whichever exist; with --from-commit, as that commit stored them) to <slug>-<date>.*, byte for byte, except the meta:
 * its slug, bodyPath and textPath name the copy, and it gains frozen: { on, from, commit, why } in the shape of the
 * hand-frozen sets (on: the day the copy was made; from: the live meta; commit: the last commit that wrote the capture).
 * <date> defaults to the capture's fetchedAt day (UTC), so the frozen name says when the text was fetched. It refuses
 * (exit 1, nothing written):
 *   - a capture that is not a read page (capture-check's classifyCapture: an error or non-2xx status, a bot challenge,
 *     a JavaScript shell, a short page): a shell or an error page frozen as evidence would be cited as if it were the
 *     page. --allow-flagged freezes it anyway (for a claim about the failure itself) and records the kind in
 *     frozen.flagged. A failed fetch that left an older capture's text on disk is frozen as the commit that stored
 *     that text (sourceVersion), when that commit's meta is a read page and the text is the same bytes;
 *   - a capture that is itself a frozen copy (its meta has "frozen");
 *   - a frozen slug that any urls.txt line names, active or commented out (a render would write over the copy, or a
 *     paused line would when it is resumed);
 *   - a frozen slug that already exists with other bytes (a copy with the same bytes, and the same meta apart from
 *     "frozen", is left as it is: "already frozen", exit 0);
 *   - from the working tree, a capture with uncommitted changes: the copy names the commit its bytes came from.
 * It never edits urls.txt: the live line stays on the weekly watch.
 *
 * FREEZE WHAT IS CITED. --cited finds the citations that matter (activeCitations) in the decision-bearing files
 * (DECISION_FILES; not logs/, which are history, and not research/rendered/*.md): every citation of a capture whose
 * urls.txt line is ACTIVE (a commented-out line is not re-fetched), in any of the forms these files use —
 * research/rendered/<slug>.<ext>:<line>[-<line>], <slug>.<ext>:<line> alone, a short name defined in a table row
 * (| `R-GA` | `gh-docs-actions-billing.txt` | ... then `R-GA:502`), and a bare `:N` after a citation on the same line
 * (`x.txt:93`, `:97`). A citation "by line" has at least one line number; the guard test holds those. --unlined also
 * takes the citations without a line (a source table, "read in full"), except the ones --keep names.
 * For each it checks drift (citationVersion): the capture file in the oldest commit that added the citation's text to
 * the citing file, against the file now. "same" (the file is unchanged) and "lines-same" (it changed, but every cited
 * line is unchanged) are frozen from the working tree at its fetchedAt day and repointed, same line numbers. "drifted"
 * (a cited line changed, or for a citation without a line, the file did) is printed with both texts as DRIFTED and not
 * repointed; with --history it is instead repointed to a frozen copy of the capture as that commit stored it, whose
 * cited lines are, by construction, the text the citation was written against. Dry run unless --apply.
 * Exit 0 when nothing is left citing an active capture by line, 1 when something is (DRIFTED without --history, a
 * refused freeze, or a dry run with work to do), 2 on a usage error.
 *
 * src/__tests__/revenue/frozen-citations.test.ts fails when a decision-bearing file cites an active capture by line.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { classifyCapture, readCapture } from "./capture-check.mjs";
import { parseUrlList, slugFromUrl } from "./render-watch.mjs";

export const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const RENDERED_REL = "research/rendered";

/** The files a capture can have (render-watch.mjs extensionFor, plus the meta). */
export const CAPTURE_EXTS = ["meta.json", "txt", "html", "json", "pdf", "xml", "bin"];

const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;

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

// ---------------------------------------------------------------------------------------------------------------------
// Where a capture's bytes come from: the working tree, or a commit.

const git = (root, args, encoding = "utf8") =>
  spawnSync("git", ["--no-optional-locks", ...args], { cwd: root, encoding, maxBuffer: 512 * 1024 * 1024 });

/** The capture's files in dir: Map ext -> Buffer, in CAPTURE_EXTS order. */
export function diskFiles(slug, dir) {
  const files = new Map();
  for (const ext of CAPTURE_EXTS) {
    const path = join(dir, `${slug}.${ext}`);
    if (existsSync(path)) files.set(ext, readFileSync(path));
  }
  return files;
}

/** The capture's files as commit stored them: Map ext -> Buffer. */
export function commitFiles(root, commit, slug) {
  const files = new Map();
  for (const ext of CAPTURE_EXTS) {
    const r = git(root, ["show", `${commit}:${RENDERED_REL}/${slug}.${ext}`], "buffer");
    if (r.status === 0) files.set(ext, r.stdout);
  }
  return files;
}

/** capture-check's verdict on a capture held in memory: the files are written to a scratch directory and read there. */
export function classifyFiles(slug, files) {
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
const dataOf = (meta) => {
  const { frozen, ...rest } = meta; // eslint-disable-line no-unused-vars
  return JSON.stringify(rest);
};

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

/**
 * Plan a freeze without writing: { slug, frozenSlug, date, kind, writes: [{ ext, path, bytes }], already }.
 * files: the capture's files (Map ext -> Buffer: diskFiles, commitFiles or sourceVersion). dir: where the copy goes.
 * already: the copy exists with the same bytes (its meta compared without "frozen"). Throws an Error saying why on
 * every refusal.
 */
export function planFreeze({ slug, files, dir, urlsText, date, on, commit = null, why, allowFlagged = false }) {
  if (!SLUG_RE.test(String(slug))) throw new Error(`not a capture slug: ${slug}`);
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
  const flagged = row.kind === "ok" ? undefined : { kind: row.kind, evidence: row.evidence };

  const day = date ?? (typeof meta.fetchedAt === "string" ? meta.fetchedAt.slice(0, 10) : null);
  if (day == null) throw new Error(`${slug}'s meta has no fetchedAt: name the day with --date YYYY-MM-DD`);
  if (!isDay(day)) throw new Error(`not a day (YYYY-MM-DD): ${day}`);
  if (!isDay(on)) throw new Error(`not a day (YYYY-MM-DD) for frozen.on: ${on}`);
  const frozenSlug = `${slug}-${day}`;
  if (listedNames(urlsText).has(frozenSlug)) {
    throw new Error(`${frozenSlug} is named on a urls.txt line: a render would rewrite the frozen copy. Choose another --date`);
  }

  const newMeta = frozenMeta(meta, { slug, frozenSlug, on, commit, why: why ?? defaultWhy({ slug, commit }), flagged });
  const writes = [...files.keys()].map((ext) => ({
    ext,
    path: join(dir, `${frozenSlug}.${ext}`),
    bytes: ext === "meta.json" ? metaBytes(newMeta) : files.get(ext),
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
  if (flagged && !allowFlagged && !(already && existingMeta?.frozen?.flagged?.kind === row.kind)) {
    throw new Error(
      `${slug} is not a read page (capture-check: ${row.kind}; ${row.evidence}). Freezing it would keep a ${row.kind} as ` +
        "evidence; --allow-flagged freezes it anyway, for a claim about the failure itself.",
    );
  }
  return { slug, frozenSlug, date: day, kind: row.kind, writes, already };
}

/** Write a planned freeze (nothing when it is already frozen, or with dryRun). Returns the plan. */
export function freezeCapture(options) {
  const plan = planFreeze(options);
  if (!plan.already && !options.dryRun) for (const w of plan.writes) writeFileSync(w.path, w.bytes);
  return plan;
}

// ---------------------------------------------------------------------------------------------------------------------
// Citations.

/**
 * The decision-bearing files: what a decision is read from. Research notes, rulings, verdicts, product configs and
 * READMEs; not logs/ (history: a log's citation stays as written) and not research/rendered/*.md.
 */
export const DECISION_FILES = [
  "research/channel-loop/*.md",
  "research/channel-loop/terms-verdicts.json",
  "research/measurements/*.md",
  "docs/*.md",
  "products/**/config/**",
  "products/**/README*",
];

const SKIP_DIRS = new Set(["node_modules", ".git", ".venv", "venv", "__pycache__", "dist", ".pytest_cache"]);

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
  const top = (d, test) => {
    const abs = join(root, d);
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs)) if (test(name) && statSync(join(abs, name)).isFile()) files.add(`${d}/${name}`);
  };
  top("research/channel-loop", (n) => n.endsWith(".md") || n === "terms-verdicts.json");
  top("research/measurements", (n) => n.endsWith(".md"));
  top("docs", (n) => n.endsWith(".md"));
  for (const path of walk(join(root, "products"), [])) {
    const rel = path.slice(root.length + 1).split("\\").join("/");
    const parts = rel.split("/");
    if (parts.slice(1, -1).includes("config") || /^README/i.test(parts[parts.length - 1])) files.add(rel);
  }
  return [...files].sort();
}

const EXT_ALT = CAPTURE_EXTS.map((e) => e.replace(".", "\\.")).join("|");
const NOT_BEFORE = "(?<![A-Za-z0-9._/-])";
const LINES = "(?::(\\d+)(?:-(\\d+))?)?";
/** research/rendered/<slug>.<ext> or <slug>.<ext>, then :<line>[-<line>]; the slug is the shortest one before an extension. */
const CITATION_RE = new RegExp(`${NOT_BEFORE}(${RENDERED_REL}/)?([a-z0-9][a-z0-9._-]*?)\\.(${EXT_ALT})${LINES}(?![A-Za-z0-9_]|\\.[A-Za-z0-9])`, "g");
/** A table row that names a capture under a short name: | `R-GA` | `gh-docs-actions-billing.txt` | ... */
const ALIAS_ROW_RE = new RegExp(`^\\|\\s*\`?([A-Za-z][A-Za-z0-9_-]*)\`?\\s*\\|\\s*\`?(?:${RENDERED_REL}/)?([a-z0-9][a-z0-9._-]*?)\\.(${EXT_ALT})\`?\\s*\\|`);
/** A bare line reference after a citation: `:97`, :366-380. */
const BARE_RE = /(?<![A-Za-z0-9_./-]):(\d+)(?:-(\d+))?(?!\d)/g;
/**
 * A named line reference that is not a capture's (PAT:173, urls.txt:111, CHANNEL_LOOP.md:150, html:338): a bare :N
 * after one belongs to it, not to a capture cited earlier on the line. The name ends in a letter, so a time
 * (2026-09-29T11:30:37Z) is not one.
 */
const NAMED_RE = /(?<![A-Za-z0-9_./-])[A-Za-z0-9_./-]*[A-Za-z_]:\d+(?:-\d+)?/g;

const range = (a, b) => (a === undefined ? null : [Number(a), b === undefined ? Number(a) : Number(b)]);

/**
 * Every citation of a capture in text: { slug, ext, lines, full, alias, aliasFor, index, text, fileLine }.
 *   lines:    the cited [from, to] line ranges: its own :N, and each bare :N after it on the same line before the next
 *             citation ([] when none: a citation "without a line")
 *   full:     written with research/rendered/; a short one (<slug>.<ext> alone) counts only when its slug is in `known`
 *   alias:    for NAME:N, where a table row in the same text names the capture NAME stands for: NAME
 *   aliasFor: on that row's capture cell: NAME; its lines are every NAME:N in the text
 *   text:     the literal text matched (for an alias reference, NAME:N), at index; fileLine is its 1-based line
 */
export function findCitations(text, known = new Set()) {
  const lines = String(text).split("\n");
  const starts = [];
  let at = 0;
  for (const line of lines) {
    starts.push(at);
    at += line.length + 1;
  }
  const found = [];
  const aliases = new Map();
  lines.forEach((line, i) => {
    const here = [];
    for (const m of line.matchAll(CITATION_RE)) {
      const [whole, prefix, slug, ext, a, b] = m;
      const full = prefix !== undefined;
      if (!full && !known.has(slug)) continue;
      here.push({ slug, ext, lines: a === undefined ? [] : [range(a, b)], full, alias: null, index: starts[i] + m.index, text: whole, fileLine: i + 1 });
    }
    const row = line.match(ALIAS_ROW_RE);
    if (row) {
      const cell = here.find((c) => c.slug === row[2] && c.ext === row[3] && c.lines.length === 0);
      if (cell) {
        cell.aliasFor = row[1];
        aliases.set(row[1], cell);
      }
    }
    found.push(...here);
  });
  lines.forEach((line, i) => {
    for (const [name, cell] of aliases) {
      const re = new RegExp(`${NOT_BEFORE}${name.replace(/-/g, "\\-")}:(\\d+)(?:-(\\d+))?(?!\\d)`, "g");
      for (const m of line.matchAll(re)) {
        found.push({ slug: cell.slug, ext: cell.ext, lines: [range(m[1], m[2])], full: false, alias: name, index: starts[i] + m.index, text: m[0], fileLine: i + 1 });
      }
    }
  });
  found.sort((x, y) => x.index - y.index);
  // A bare :N belongs to the nearest citation before it on its line, unless a named reference to something else
  // (NAMED_RE) comes between them.
  lines.forEach((line, i) => {
    const marks = found.filter((c) => c.fileLine === i + 1).map((c) => ({ start: c.index - starts[i], end: c.index - starts[i] + c.text.length, c }));
    for (const m of line.matchAll(NAMED_RE)) {
      if (!marks.some((k) => k.c && k.start <= m.index && m.index < k.end)) marks.push({ start: m.index, end: m.index + m[0].length, c: null });
    }
    marks.sort((x, y) => x.start - y.start);
    for (const m of line.matchAll(BARE_RE)) {
      if (marks.some((k) => k.start <= m.index && m.index < k.end)) continue;
      const owner = marks.filter((k) => k.end <= m.index).pop();
      if (owner?.c) owner.c.lines.push(range(m[1], m[2]));
    }
  });
  for (const cell of aliases.values()) {
    cell.lines = found.filter((c) => c.alias === cell.aliasFor).flatMap((c) => c.lines);
  }
  return found;
}

/** findCitations over the decision-bearing files, of ACTIVE captures only: { file, ...citation }[]. */
export function activeCitations({ root = REPO_ROOT, urlsText } = {}) {
  const active = activeSlugs(urlsText ?? readFileSync(join(root, RENDERED_REL, "urls.txt"), "utf8"));
  const out = [];
  for (const file of decisionFiles(root)) {
    const text = readFileSync(join(root, file), "utf8");
    for (const c of findCitations(text, active)) if (active.has(c.slug)) out.push({ file, ...c });
  }
  return out;
}

/** The citations by line (the guard's list): a short name's table cell counts once the name is used. */
export const byLine = (citations) => citations.filter((c) => c.lines.length > 0);

/** The cited lines of a capture file's text, one string per range, or null for a range the text lacks. */
export function citedLines(text, ranges) {
  if (text == null) return ranges.map(() => null);
  const lines = String(text).split("\n");
  return ranges.map(([a, b]) => (a >= 1 && b >= a && b <= lines.length ? lines.slice(a - 1, b).join("\n") : null));
}

/**
 * Whether a citation still points at what it was written against. since: the oldest commit that added the citation's
 * text to the citing file (git log -S); then/now: the capture file there and in the working tree. state:
 *   "same"        the file is byte for byte what it was
 *   "lines-same"  it changed, but every cited line reads the same
 *   "drifted"     a cited line reads otherwise (or, for a citation without a line, the file changed)
 *   "unknown"     no commit adds the citation (uncommitted) or the capture was not in that commit
 * { state, since, then, now }: then and now are the cited lines (one string per range; for a citation without a line,
 * the file's line count).
 */
export function citationVersion({ root = REPO_ROOT, file, text, slug, ext, lines }) {
  const path = `${RENDERED_REL}/${slug}.${ext}`;
  const nowText = existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : null;
  const log = git(root, ["log", "--reverse", "--format=%H", `-S${text}`, "--", file]);
  const since = log.status === 0 ? log.stdout.split("\n").find(Boolean) ?? null : null;
  const describe = (t) => (lines.length ? citedLines(t, lines) : [t == null ? null : `(${t.split("\n").length} lines)`]);
  if (!since) return { state: "unknown", since: null, then: null, now: describe(nowText), why: "no commit adds this citation" };
  const shown = git(root, ["show", `${since}:${path}`]);
  if (shown.status !== 0) return { state: "unknown", since, then: null, now: describe(nowText), why: `${path} is not in ${since.slice(0, 7)}` };
  const thenText = shown.stdout;
  const then = describe(thenText);
  const now = describe(nowText);
  if (thenText === nowText) return { state: "same", since, then, now };
  if (lines.length && then.every((t, i) => t != null && t === now[i])) return { state: "lines-same", since, then, now };
  return { state: "drifted", since, then, now };
}

/** Rewrite each citation's slug in text (same extension and lines), from the end so indexes stay valid. */
export function repoint(text, citations, frozenOf) {
  let out = String(text);
  for (const c of [...citations].sort((x, y) => y.index - x.index)) {
    if (c.alias) continue; // NAME:N follows its table row, which is repointed as a citation of its own
    if (out.slice(c.index, c.index + c.text.length) !== c.text) throw new Error(`citation moved: ${c.text} at ${c.index}`);
    const head = c.full ? `${RENDERED_REL}/` : "";
    out = out.slice(0, c.index) + head + frozenOf(c) + c.text.slice(head.length + c.slug.length) + out.slice(c.index + c.text.length);
  }
  return out;
}

const todayUtc = () => new Date().toISOString().slice(0, 10);
/** A cited text for the terminal: JSON-quoted, cut to 400 characters (a minified HTML line can run to megabytes). */
const clip = (s) => (s == null ? "null" : s.length > 400 ? `${JSON.stringify(s.slice(0, 400))}... (${s.length} characters)` : JSON.stringify(s));
const rangesOf = (c) => c.lines.map(([a, b]) => (a === b ? `:${a}` : `:${a}-${b}`)).join(", ");
const where = (c) => `${c.file}:${c.fileLine} ${c.text}${c.lines.length ? ` [${rangesOf(c)}]` : ""}`;

/**
 * --cited. Freezes and (with apply) repoints the citations of active captures in the decision-bearing files: by line
 * always, without a line with unlined (except keep: "file:line" strings). Returns the exit code.
 */
export function cited({ root = REPO_ROOT, apply = false, unlined = false, keep = [], history = false, on = todayUtc(), log = console.log } = {}) {
  const urlsText = readFileSync(join(root, RENDERED_REL, "urls.txt"), "utf8");
  const all = activeCitations({ root, urlsText });
  const lined = byLine(all);
  const perFile = new Map();
  for (const c of lined) perFile.set(c.file, (perFile.get(c.file) ?? 0) + 1);
  log(`${lined.length} citation(s) by line of an active capture in ${perFile.size} decision-bearing file(s):`);
  for (const [file, n] of perFile) log(`  ${n}\t${file}`);
  const noLine = all.filter((c) => c.lines.length === 0);
  log(`${noLine.length} more name an active capture without a line${unlined ? "" : " (--unlined takes them)"}`);
  const kept = new Set(keep);
  const work = [...lined, ...(unlined ? noLine.filter((c) => !kept.has(`${c.file}:${c.fileLine}`)) : [])];

  // Which version of its capture each citation was written against: the working tree ("tree"), or a commit.
  const target = new Map();
  const drifted = [];
  const states = {};
  for (const c of work) {
    if (c.aliasFor) continue; // decided by its references, below
    const v = citationVersion({ root, ...c });
    states[v.state] = (states[v.state] ?? 0) + 1;
    if (v.state !== "drifted") target.set(c, "tree");
    else {
      drifted.push({ c, v });
      if (history) target.set(c, v.since);
    }
  }
  // A short name's table cell follows its references: every one of them must want the same version, or none moves.
  for (const cell of work.filter((c) => c.aliasFor)) {
    const refs = work.filter((c) => c.alias === cell.aliasFor && c.file === cell.file);
    const versions = new Set(refs.map((r) => target.get(r)));
    if (refs.length && versions.size === 1 && !versions.has(undefined)) target.set(cell, [...versions][0]);
    else if (!refs.length) target.set(cell, "tree");
    else {
      for (const r of refs) target.delete(r);
      log(`DRIFTED ${where(cell)}: its short name's references want different versions, so none is repointed`);
    }
  }
  log(`drift: ${Object.entries(states).map(([k, n]) => `${k} ${n}`).join(", ")}`);
  for (const { c, v } of drifted) {
    log(`DRIFTED ${where(c)} (written in ${v.since.slice(0, 7)})`);
    v.then.forEach((t, i) => {
      log(`  then: ${clip(t)}`);
      log(`  now:  ${clip(v.now[i])}`);
    });
  }

  // One frozen copy per version of a capture: the commit that last wrote it, in the working tree or as of the commit a
  // drifted citation was written in (two citations written in different commits often cite one version).
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
  for (const group of [...new Set([...target.keys()].map(groupOf))].sort()) {
    const members = [...target.keys()].filter((c) => groupOf(c) === group);
    const { slug } = members[0];
    const version = versions.get(`${slug}@${target.get(members[0])}`);
    const tree = members.every((c) => target.get(c) === "tree");
    const as = tree ? "" : ` as ${version.commit ?? target.get(members[0]).slice(0, 7)} stored it`;
    try {
      if (version.error) throw version.error;
      const citedBy = [...new Set(members.map((c) => c.file))].join(", ");
      const plan = freezeCapture({
        slug,
        files: version.files,
        dir: join(root, RENDERED_REL),
        urlsText,
        on,
        commit: version.commit,
        why: defaultWhy({ slug, commit: version.commit, citedBy, note: version.note }),
        dryRun: !apply,
      });
      frozen.set(group, plan.frozenSlug);
      const verb = plan.already ? "already frozen" : apply ? "froze" : "would freeze";
      log(`${verb} ${slug}${as} -> ${plan.frozenSlug} (${plan.writes.map((w) => w.ext).join(", ")})${version.note ? `; ${version.note}` : ""}`);
    } catch (err) {
      refused.push(group);
      log(`REFUSED ${slug}${as}: ${err.message}`);
    }
  }
  if (!apply) {
    // Nothing is written in a dry run, so two versions that would take one frozen name are caught here.
    const byName = new Map();
    for (const [group, name] of frozen) byName.set(name, [...(byName.get(name) ?? []), group]);
    for (const [name, groups] of byName) {
      if (groups.length > 1) {
        for (const g of groups) frozen.delete(g);
        refused.push(...groups);
        log(`REFUSED ${name}: ${groups.length} versions of the capture would take this name (${groups.join(", ")}); freeze one with --date`);
      }
    }
  }
  const frozenOf = (c) => frozen.get(groupOf(c));
  const moving = [...target.keys()].filter((c) => frozenOf(c));
  const edits = moving.filter((c) => !c.alias);
  if (apply) {
    for (const file of [...new Set(edits.map((c) => c.file))]) {
      const path = join(root, file);
      writeFileSync(path, repoint(readFileSync(path, "utf8"), edits.filter((c) => c.file === file), frozenOf));
    }
  }
  const left = apply ? byLine(activeCitations({ root, urlsText })) : lined.filter((c) => !moving.includes(c));
  log(
    `${apply ? "repointed" : "would repoint"} ${edits.length} citation(s) (${moving.length - edits.length} short-name reference(s) follow their table rows); ` +
      `${drifted.length} DRIFTED (${history ? "repointed to the version each was written against" : "not repointed"}); ` +
      `${refused.length} freeze(s) refused; ${left.length} citation(s) by line of an active capture left`,
  );
  for (const c of left) log(`  left: ${where(c)}`);
  return left.length ? 1 : 0;
}

function main(argv) {
  const usage =
    "usage: node scripts/freeze-capture.mjs <slug> [--date YYYY-MM-DD] [--from-commit <sha>] [--allow-flagged] [--why <text>] [--dry-run]\n" +
    "       node scripts/freeze-capture.mjs --cited [--unlined] [--keep <file>:<line>]... [--history] [--apply]";
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
      },
    });
  } catch (err) {
    console.error(`${err.message}\n${usage}`);
    return 2;
  }
  const v = args.values;
  const citedOptions = [v.unlined, v.keep, v.history, v.apply].some(Boolean);
  const oneOptions = [v.date, v["from-commit"], v["allow-flagged"], v.why, v["dry-run"]].some(Boolean);
  if (v.cited) {
    if (args.positionals.length || oneOptions) {
      console.error(usage);
      return 2;
    }
    return cited({ apply: Boolean(v.apply), unlined: Boolean(v.unlined), keep: v.keep ?? [], history: Boolean(v.history) });
  }
  if (args.positionals.length !== 1 || citedOptions) {
    console.error(usage);
    return 2;
  }
  const [slug] = args.positionals;
  try {
    const version = sourceVersion(REPO_ROOT, slug, v["from-commit"] ?? null);
    const plan = freezeCapture({
      slug,
      files: version.files,
      dir: join(REPO_ROOT, RENDERED_REL),
      urlsText: readFileSync(join(REPO_ROOT, RENDERED_REL, "urls.txt"), "utf8"),
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
        `${plan.kind === "ok" ? "" : `; capture-check: ${plan.kind}`}${version.note ? `; ${version.note}` : ""}`,
    );
    return 0;
  } catch (err) {
    console.error(`freeze-capture: ${err.message}`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
