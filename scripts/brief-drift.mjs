#!/usr/bin/env node
/**
 * brief-drift — do a sitting brief's file:line citations (or one FABLE_QUEUE row's) still point at the text they
 * pointed at?
 *
 *   node scripts/brief-drift.mjs <file.md> --tree <ref> [--head <ref>] [--row <n>] [--json]
 *
 * Why: before every Fable sitting the main thread checked the brief's pointers against the tree by hand — tick 67 with a
 * temporary script (logs/2026-10-08-channel-loop-tick-67.md §2, §7: ledger.ts moved 12 lines from :414 on), tick 69 for
 * the 99 citations the owner-path build moved (logs/2026-10-11-channel-loop-tick-69.md §5). This is that check, once.
 *
 * <file.md> is the citing document, read from disk. With --row <n> only the table row whose first cell is n is read (a
 * row of logs/FABLE_QUEUE.md). --tree is the tree the citations were written against: a brief names it in its header
 * ("assembled on", "built on", "wrote this file on", "against the tree at", "read at", "Tree:"). There is no default:
 * without --tree it prints what the header (and, with --row, the row and the commit that last wrote it) says, and
 * exits 1. --head is the tree to compare with (default HEAD). Both are read from git objects, never the working tree.
 *
 * WHAT IS A CITATION. Its own small scanner, not freeze-capture.mjs's scanCitations: that one finds captures
 * (research/rendered/<slug>) and gives another file's name only the power to keep a bare :N from a capture, never a line
 * of its own; here every repository file owns its lines. What it took from there: a ruling's short name (ROBOTS-RULING)
 * owns the bare :N after it (tick 68), and so does "the note".
 *   - `path:N`, `path:N-M` (or N–M), with path repo-relative or a unique tail of one (`ledger.ts`, `channel-loop/X.md`);
 *   - a bare `:N` or `:N-M` (continuation: "`MISSION.md:435-439`, heading `:431`") belongs to the last name before it on
 *     its line, else to the last name in its paragraph (a blank line, a heading, a table row, a fence or a rule ends one;
 *     list items do not: "(`MISSION.md:349-350`)" then, on the next item, "(`:354`)"). Outside double quotes it takes
 *     only a name outside them (after "into `x.json`, the page and its tests" (`:51`) the :51 is the quoting file's).
 *     In a table row it takes a name in its own cell, else the table's caption: the last name of the paragraph right
 *     before the table. Nothing carries further: past its paragraph a bare line is "unattributed", never guessed;
 *   - a short name the document defines: `EX` is `research/…/x.md`; "the read-back" is `scripts/…`; `scripts/x.ts`
 *     ("the x script"); `a.ts`, `b.ts` ("the b") are under `src/revenue/`; "a bare `BOARD.md:n` is the 7.9 board's".
 *     A definition counts only when its target looks like a path. A phrase owns lines only outside double quotes (a
 *     quotation's words are the source's: "when it arrives in the ledger with a transaction id" (`:269-270`) is
 *     MISSION's line, not the ledger's), and in the possessive only right after it ("the read-back's `:99-103`") or
 *     starting a sentence ("The status report's appendix opens at `:38`"), never describing ("the config's rule
 *     (`:210`)"); its first letter's case is free, and "the" may be dropped when two words or a digit are left ("loop
 *     ruling `:88`");
 *   - a backticked or bare path that exists in --tree, without a line: a whole-file citation (present or gone at head).
 *   - a name several files have is the one the document writes in full elsewhere, else the one under the deepest
 *     directory it names (`loop.test.ts` with `src/__tests__/revenue/` named), when that leaves one.
 * A name with a line that is in no file of --tree is reported, never dropped: "unknown path" when it looks like a path
 * (a slash or a file extension) or matches several files (`BOARD.md`: candidates listed); "not checked" when it is a
 * short name with no file (OTA:596, an undefined X-RULING, "the note"). A bare :N after no name is "unattributed".
 * URLs are skipped. A blockquote that speaks of drift (a main-thread drift note, written against another tree) is
 * skipped and its lines are listed. `via` names the short name, phrase or caption a citation came through, so a reader
 * can see the attribution where it is a judgement and not a path: the scanner reads prose, and prose can mean another
 * file than the last one it names; an "invalid" or "changed" under a `via` is the place to look first.
 *
 * FOR EACH CITED LINE N, the text at --tree against --head:
 *   same        the same line number holds the same text;
 *   moved N→K   the exact text is at one line K of --head;
 *   ambiguous   it is at several (the candidates are listed);
 *   changed     it is at none (the old text, and what --head has at N, are shown);
 *   gone        the file is not in --head;
 *   invalid     N is past the end of the file at --tree (or a range ends before it starts).
 * A blank or punctuation-only line (`}`, `*\/`, empty), or a line written more than once at --head, is placed by its
 * nearest unique neighbours above and below (unique at both trees, within 20 lines): one place they agree on gives
 * same or moved; several, ambiguous; none, changed. With no unique neighbour at all, the same text at N is "same".
 * A range gets each line, and one summary when every line moved by the same offset ("moved 414-430→426-442").
 *
 * OUTPUT: a table per cited file (citation, cited at, status, new pointer; a range's lines as runs of one status and
 * offset, every line in --json), then the unknown, unchecked and unattributed references, then counts by status. Exit 0
 * when nothing drifted, 3 when anything did (moved, ambiguous, changed, gone, invalid, unknown path; "not checked" and
 * "unattributed" are listed but are not drift), 1 on a usage or read error. It writes no file.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

export const USAGE = "usage: node scripts/brief-drift.mjs <file.md> --tree <ref> [--head <ref>] [--row <n>] [--json]";

/** The statuses that are drift: any of them makes the exit 3. */
export const DRIFT = ["moved", "ambiguous", "changed", "gone", "invalid", "unknown path"];
/** Worst last: a range's status is its worst line's. */
const SEVERITY = ["same", "moved", "ambiguous", "changed", "invalid", "gone"];
const worse = (a, b) => (SEVERITY.indexOf(a) >= SEVERITY.indexOf(b) ? a : b);

/** How far a blank or repeated line looks for a unique neighbour, each way. */
export const NEIGHBOUR_WINDOW = 20;

export class UsageError extends Error {}
export class ReadError extends Error {}

/** File extensions that make a name look like a path even with no slash in it. */
const EXTS = "md|ts|tsx|js|mjs|cjs|jsx|json|jsonl|yml|yaml|py|sh|txt|html|htm|csv|tsv|toml|sha256|pdf|xml|bin|sql|db|css|svg|lock|ini|cfg";
export const KNOWN_EXT_RE = new RegExp(`\\.(?:${EXTS})$`, "i");
const URL_RE = /\bhttps?:\/\/[^\s<>`"')\]]+/g;
/** A name, then its own lines: :N, :N-M, :N–M (an optional L before each number). */
const NAME_RE = /(?<![A-Za-z0-9_./-])((?:\.{1,2}\/)*[A-Za-z0-9_.](?:[A-Za-z0-9_./-]*[A-Za-z0-9_/])?)(?::L?(\d+)(?:[-–]L?(\d+))?(?!\d))?/g;
/** A bare line reference: `:97`, :366-380, :12–14 — not a time (07:11) and not part of a name. */
export const BARE_RE = /(?<![A-Za-z0-9_./-]):L?(\d+)(?:[-–]L?(\d+))?(?!\d)/g;
/** A short name that may own lines although no file has it: OTA, EX, PAT, html, T1-RULING. Not a time or a number. */
const SHORT_NAME_RE = /^(?:[A-Za-z]|[A-Za-z_][A-Za-z0-9_-]*[A-Za-z_])$/;
/** A ruling's short name (ROBOTS-RULING, VIDEO-RULING, T1-RULING): owns the bare lines after it (freeze-capture, tick 68). */
const RULING_NAME_RE = /(?<![A-Za-z0-9_./-])[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-RULING(?![A-Za-z0-9_-])/g;
/** "the note" a brief summarises, "the note's": owns the bare lines after it, as in freeze-capture's NOTE_RE. */
const NOTE_RE = /(?<![A-Za-z0-9_-])(?:[Tt]he note(?![A-Za-z0-9_'-])|[Nn]ote's(?![A-Za-z0-9_-]))/g;
/** A line that is only punctuation, symbols or space: placed by its neighbours, never by its own text. */
const GENERIC_RE = /^[\s\p{P}\p{S}]*$/u;
export const isGeneric = (text) => GENERIC_RE.test(text);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pathLike = (t) => t.includes("/") || KNOWN_EXT_RE.test(t);

// ---------------------------------------------------------------------------------------------------------------- git

function git(root, args) {
  const r = spawnSync("git", args, { cwd: root, encoding: "buffer", maxBuffer: 1 << 28 });
  if (r.error) throw new ReadError(`git ${args.join(" ")}: ${r.error.message}`);
  if (r.status !== 0) throw new ReadError(`git ${args.join(" ")}: ${r.stderr.toString("utf8").trim()}`);
  return r.stdout;
}

export function repoRoot(cwd) {
  return git(cwd, ["rev-parse", "--show-toplevel"]).toString("utf8").trim();
}

/** The commit a ref names, or a ReadError naming the ref. */
export function resolveRef(root, ref) {
  const r = spawnSync("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], { cwd: root, encoding: "utf8" });
  if (r.status !== 0 || !r.stdout.trim()) throw new ReadError(`not a commit: ${ref}`);
  return r.stdout.trim();
}

/** A tree's files, and their lines read on demand (CRLF read as LF; a final newline ends the last line). */
export class Tree {
  constructor(root, sha) {
    this.root = root;
    this.sha = sha;
    this.paths = new Set(git(root, ["ls-tree", "-r", "-z", "--name-only", sha]).toString("utf8").split("\0").filter(Boolean));
    this.cache = new Map();
  }

  lines(path) {
    if (!this.cache.has(path)) {
      const text = git(this.root, ["cat-file", "blob", `${this.sha}:${path}`]).toString("utf8");
      const lines = text.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
      if (lines.length && lines[lines.length - 1] === "") lines.pop();
      this.cache.set(path, lines);
    }
    return this.cache.get(path);
  }
}

/** Names to paths in one tree: the exact path, else every path that ends with "/<name>". */
export function makeResolver(paths) {
  const byBase = new Map();
  const dirs = new Set();
  const tops = new Set();
  for (const p of paths) {
    const base = p.slice(p.lastIndexOf("/") + 1);
    byBase.set(base, [...(byBase.get(base) ?? []), p]);
    const parts = p.split("/");
    if (parts.length > 1) tops.add(parts[0]);
    for (let i = 1; i < parts.length; i += 1) dirs.add(parts.slice(0, i).join("/"));
  }
  return {
    has: (p) => paths.has(p),
    isDir: (name) => dirs.has(name.replace(/^(\.\/)+/, "").replace(/\/+$/, "")),
    isTop: (seg) => tops.has(seg),
    candidates(name) {
      const n = name.replace(/^(\.\/)+/, "");
      if (paths.has(n)) return [n];
      const base = n.slice(n.lastIndexOf("/") + 1);
      return (byBase.get(base) ?? []).filter((p) => p.endsWith(`/${n}`)).sort();
    },
  };
}

// ------------------------------------------------------------------------------------------------------- the document

/** The line of a table row whose first cell is n: { line, text }, or null. */
export function findRow(text, n) {
  const re = new RegExp(`^\\|\\s*${escapeRe(String(n))}\\s*\\|`);
  const lines = text.split("\n");
  const i = lines.findIndex((l) => re.test(l));
  return i < 0 ? null : { line: i + 1, text: lines[i] };
}

const HINT_RE = /\b(assembled on|built on|wrote this file on|written against|against the tree at|tree at|read at|[Tt]ree:?)\s*(?:`([0-9a-f]{7,40})`|([0-9a-f]{7,40})\b)/g;

/**
 * What a document says about the tree it was written against: every header line (before the first "## " heading, at
 * most 60 lines) or row line that names a commit after "assembled on", "built on", "wrote this file on", "against the
 * tree at", "read at", "tree" or "Tree:". [{ line, phrase, sha }]
 */
export function treeHints(text, { row = null } = {}) {
  const lines = text.split("\n");
  const out = [];
  const look = (i) => {
    for (const m of lines[i].matchAll(HINT_RE)) out.push({ line: i + 1, phrase: m[1], sha: m[2] ?? m[3] });
  };
  if (row) look(row.line - 1);
  else {
    for (let i = 0; i < lines.length && i < 60; i += 1) {
      if (i > 0 && /^##\s/.test(lines[i])) break;
      look(i);
    }
  }
  return out;
}

/** The commit that last wrote a line of a committed file (git blame), or null. */
export function lastWriter(root, rel, line) {
  const r = spawnSync("git", ["blame", "-L", `${line},${line}`, "--porcelain", "--", rel], { cwd: root, encoding: "utf8" });
  if (r.status !== 0) return null;
  const sha = r.stdout.slice(0, 40);
  if (!/^[0-9a-f]{40}$/.test(sha) || /^0+$/.test(sha)) return null;
  const summary = /^summary (.*)$/m.exec(r.stdout)?.[1] ?? "";
  return { sha, summary };
}

/**
 * The lines skipped as drift notes: each run of blockquote lines (">") whose text says "drift" — a note the main thread
 * wrote against another tree than the brief's.
 */
export function driftNoteLines(lines) {
  const skip = new Set();
  for (let i = 0; i < lines.length; ) {
    if (!/^\s*>/.test(lines[i])) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < lines.length && /^\s*>/.test(lines[j])) j += 1;
    if (/\bdrift/i.test(lines.slice(i, j).join("\n"))) for (let k = i; k < j; k += 1) skip.add(k + 1);
    i = j;
  }
  return skip;
}

/**
 * The short names a document defines, each to { path } (a file of the tree), { unresolved, candidates } (a path-like
 * target the tree does not have once), in the order written: { names, phrases }, Map name -> [{ index, target }].
 */
export function findDefinitions(text, resolver) {
  const flat = text.replace(/[\r\n]/g, " ");
  const names = new Map();
  const phrases = new Map();
  const add = (map, name, index, target) => map.set(name, [...(map.get(name) ?? []), { index, target }]);
  const target = (t) => {
    const raw = t.trim();
    const alias = names.get(raw)?.[0]?.target;
    if (alias?.path) return alias;
    const c = resolver.candidates(raw);
    return c.length === 1 ? { path: c[0] } : { unresolved: raw, candidates: c };
  };
  // `a.ts`, `b.ts` ("the b") and `c.ts` are under `src/revenue/`.
  const UNDER_RE = /((?:`[^`\n]+`(?:\s*\(["“][^"”\n]+["”]\))?(?:\s*,\s*(?:and\s+)?|\s+and\s+)?)+)\s+(?:is|are)\s+(?:both\s+|all\s+)?under\s+`([^`\n]+\/)`/g;
  for (const m of flat.matchAll(UNDER_RE)) {
    for (const item of m[1].matchAll(/`([^`\n]+)`(?:\s*\(["“]([^"”\n]+)["”]\))?/g)) {
      const full = `${m[2]}${item[1]}`;
      if (!resolver.has(full)) continue;
      add(names, item[1], m.index, { path: full });
      if (item[2]) add(phrases, item[2], m.index, { path: full });
    }
  }
  for (const m of flat.matchAll(/`([^`\n]{1,60})`\s+(?:is|=)\s+`([^`\n]+)`/g)) {
    if (pathLike(m[2]) && m[1] !== m[2]) add(names, m[1], m.index, target(m[2]));
  }
  for (const m of flat.matchAll(/["“]([^"”\n]{1,60})["”]\s+(?:is|=)\s+`([^`\n]+)`/g)) {
    if (pathLike(m[2])) add(phrases, m[1].trim(), m.index, target(m[2]));
  }
  for (const m of flat.matchAll(/`([^`\n]+)`\s*\(["“]([^"”\n]{1,60})["”]\)/g)) {
    if (pathLike(m[1])) add(phrases, m[2].trim(), m.index, target(m[1]));
  }
  // "A bare `BOARD.md:n` is the 7.9 board's": a name several files have, given to the file a defined phrase names.
  for (const m of flat.matchAll(/`([^`\s:]+)(?::n)?`\s+is\s+(?:the\s+)?([^`"\n]{2,40}?)['’]s\b/g)) {
    const key = [...phrases.keys()].find((k) => k.toLowerCase().replace(/^the\s+/, "") === m[2].toLowerCase());
    const t = key && phrases.get(key)[0].target;
    if (t?.path) add(names, m[1], m.index, t);
  }
  return { names, phrases };
}

/** The definition in force at an index: the last one written before it, else the first. */
function defined(list, index) {
  return (list.filter((d) => d.index <= index).pop() ?? list[0]).target;
}

/** A phrase's regex source: its first letter's case free; without "the" too when two words or a digit are left. */
function phraseSource(phrase) {
  const free = (p) => (/^[A-Za-z]/.test(p) ? `[${p[0].toUpperCase()}${p[0].toLowerCase()}]${escapeRe(p.slice(1))}` : escapeRe(p));
  const forms = [free(phrase)];
  const bare = /^the\s+(.+)$/i.exec(phrase)?.[1];
  if (bare && (/\s/.test(bare) || /\d/.test(bare))) forms.push(free(bare));
  return forms.join("|");
}

/** Double-quoted spans of a line (outside code spans; a " between two Hebrew letters is gershayim, not a quote). */
function quoteSpans(line, open) {
  const spans = [];
  let start = open ? 0 : -1;
  let code = false;
  const hebrew = (c) => c !== undefined && /[\u0590-\u05FF]/.test(c);
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "`") code = !code;
    if (code || ch === "`") continue;
    if (ch === '"' && !(hebrew(line[i - 1]) && hebrew(line[i + 1]))) {
      if (start >= 0) {
        spans.push([start, i + 1]);
        start = -1;
      } else start = i;
    } else if (ch === "“" && start < 0) start = i;
    else if (ch === "”" && start >= 0) {
      spans.push([start, i + 1]);
      start = -1;
    }
  }
  if (start >= 0) spans.push([start, line.length]);
  return { spans, open: start >= 0 };
}

const range = (a, b) => [Number(a), b === undefined ? Number(a) : Number(b)];

/** Whether position `at` of line i starts a sentence: after ". ", or at the start of an item or of a sentence's line. */
function sentenceStart(lines, i, at) {
  const before = lines[i].slice(0, at);
  if (/[.!?:]["')\]*]*\s+$/.test(before)) return true;
  if (!/^\s*(?:(?:[-*+>]|\d+[.)])\s+)*(?:\*\*[^*]+\*\*\s+|\[[^\]]+\]\s+)*$/.test(before)) return false;
  if (/^\s*(?:[-*+>]|\d+[.)])\s+/.test(lines[i]) || /\*\*\S/.test(before) || i === 0) return true;
  const prev = lines[i - 1];
  return !prev.trim() || /^#{1,6}\s/.test(prev) || /[.!?:]["')\]*]*\s*$/.test(prev);
}

/**
 * Every reference in a document.
 *   { refs, skipped }
 * refs: { kind, docLine, written, via, range?, path?, name?, candidates? }
 *   kind "file"       a line (range) or the whole (range null) of a file of the tree;
 *        "unknown"    a path-like name with a line that no file of the tree has, or that several do (candidates);
 *        "unchecked"  a short name's line with no file behind it (OTA:596, an undefined X-RULING, "the note");
 *        "unlisted"   a path-like name without a line that the tree does not have (listed, not drift);
 *        "unattributed" a bare :N after no name in its paragraph.
 *   written: the reference as written; via: the name that owns a bare :N (or a short name's own), when it is not the path.
 * only: the line numbers to read (a --row); skipped: the drift-note lines left out.
 */
export function scanCitations(text, resolver, { only = null } = {}) {
  const lines = text.split("\n");
  const starts = [];
  let at = 0;
  for (const line of lines) {
    starts.push(at);
    at += line.length + 1;
  }
  const skipped = [...driftNoteLines(lines)].filter((n) => !only || only.has(n));
  const skip = new Set(skipped);
  const { names, phrases } = findDefinitions(text, resolver);
  // A name several files have is the one the document writes in full elsewhere, when it writes one of them so; else
  // the one under the deepest directory the document names, when one file is.
  const dirs = new Set();
  for (const m of text.matchAll(/`([^`\s]+\/)`/g)) if (resolver.isDir(m[1])) dirs.add(m[1].replace(/^(\.\/)+/, "").replace(/\/+$/, ""));
  const written = new Set();
  for (const m of text.matchAll(NAME_RE)) if (m[1].includes("/") && resolver.has(m[1])) written.add(m[1]);
  const candidatesOf = (name) => {
    const cands = resolver.candidates(name);
    if (cands.length < 2) return cands;
    const full = cands.filter((p) => written.has(p));
    if (full.length === 1) return full;
    const depth = (p) => Math.max(0, ...[...dirs].filter((d) => p.startsWith(`${d}/`)).map((d) => d.split("/").length));
    const best = Math.max(...cands.map(depth));
    const under = cands.filter((p) => depth(p) === best);
    return best > 0 && under.length === 1 ? under : cands;
  };
  const nameList = [...names.keys()].sort((a, b) => b.length - a.length);
  const NAMES = nameList.length
    ? new RegExp(`(?<![A-Za-z0-9_./-])(${nameList.map(escapeRe).join("|")})(?![A-Za-z0-9_/-]|\\.[A-Za-z0-9])(?::L?(\\d+)(?:[-–]L?(\\d+))?(?!\\d))?`, "g")
    : null;
  const phraseList = [...phrases.keys()].sort((a, b) => b.length - a.length);
  const PHRASES = phraseList.map((p) => ({ phrase: p, re: new RegExp(`(?<![A-Za-z0-9_-])(?:${phraseSource(p)})(?![A-Za-z0-9_-])`, "g") }));

  const refs = [];
  const boundary = (line) => !line.trim() || /^#{1,6}\s/.test(line) || /^\s*(```|~~~)/.test(line) || /^\s*([-*_])(\s*\1){2,}\s*$/.test(line);
  const isRow = (line) => /^\s*\|/.test(line);
  // The last name of the paragraph so far, and the last one outside double quotes. A table's caption is the last name
  // outside quotes of the paragraph right before it, which owns a row's line that has no name in its own cell
  // ("**The steps as the code holds them** (`owner-steps.ts`)", then a table of `:276`, `:278`, …); `via` says so
  // ("caption :164"). A line after no name in its paragraph is unattributed: carried any further (a section's last
  // name) it took a passing mention's name more often than the file the section is about.
  let ctx = null;
  let ctxOut = null;
  let prevOut = null;
  let caption = null;
  let inTable = false;
  let open = false;
  const captioned = (k) => k && { ...k, via: [k.via, `caption :${k.docLine}`].filter(Boolean).join(", ") };

  lines.forEach((line, i) => {
    const docLine = i + 1;
    const row = isRow(line);
    if (row && !inTable) caption = captioned(ctxOut ?? prevOut);
    if (!row) caption = null;
    inTable = row;
    if (boundary(line) || row || skip.has(docLine)) {
      if (!row) prevOut = !line.trim() && !skip.has(docLine) ? ctxOut : null;
      ctx = null;
      ctxOut = null;
      open = false;
    }
    const quotes = quoteSpans(line, open);
    open = quotes.open;
    if (boundary(line) || skip.has(docLine)) return;
    const taken = [];
    const free = (s, e) => !taken.some(([a, b]) => s < b && a < e);
    const inQuote = (s) => quotes.spans.some(([a, b]) => s >= a && s < b);
    const marks = [];
    const mark = (s, e, owner) => {
      taken.push([s, e]);
      marks.push({ start: s, end: e, quoted: inQuote(s), docLine, ...owner });
    };
    const fromTarget = (t, written) => (t.path ? { kind: "file", path: t.path, written } : { kind: "unknown", name: t.unresolved, candidates: t.candidates, written });
    const cite = (owner, rng, written, via, at) => {
      const index = starts[i] + at;
      if (owner.kind === "file") refs.push({ kind: "file", path: owner.path, range: rng, docLine, written, via, index });
      else if (owner.kind === "unknown") refs.push({ kind: "unknown", name: owner.name, candidates: owner.candidates ?? [], range: rng, docLine, written, via, index });
      else refs.push({ kind: "unchecked", name: owner.name, range: rng, docLine, written, via, index });
    };

    for (const m of line.matchAll(URL_RE)) taken.push([m.index, m.index + m[0].length]);
    // The short names a document defines, before the paths (README.md may be defined as another README).
    if (NAMES) {
      for (const m of line.matchAll(NAMES)) {
        if (!free(m.index, m.index + m[0].length)) continue;
        const t = defined(names.get(m[1]), starts[i] + m.index);
        const own = t.path && (t.path === m[1] || t.path.endsWith(`/${m[1]}`));
        const owner = { ...fromTarget(t, m[0]), via: own ? null : m[1] };
        mark(m.index, m.index + m[0].length, owner);
        if (m[2] !== undefined) cite(owner, range(m[2], m[3]), m[0], owner.via, m.index);
      }
    }
    for (const m of line.matchAll(RULING_NAME_RE)) {
      if (!free(m.index, m.index + m[0].length)) continue;
      const after = /^:L?(\d+)(?:[-–]L?(\d+))?(?!\d)/.exec(line.slice(m.index + m[0].length));
      const owner = { kind: "unchecked", name: m[0], via: m[0] };
      mark(m.index, m.index + m[0].length + (after ? after[0].length : 0), owner);
      if (after) cite(owner, range(after[1], after[2]), m[0] + after[0], m[0], m.index);
    }
    for (const m of line.matchAll(NAME_RE)) {
      const [whole, name, a, b] = m;
      if (!free(m.index, m.index + whole.length)) continue;
      const lined = a !== undefined;
      if (name.endsWith("/") || resolver.isDir(name)) continue;
      const cands = candidatesOf(name);
      const span = [m.index, m.index + whole.length];
      if (cands.length === 1) {
        if (!lined && !/[./]/.test(name)) continue;
        const owner = { kind: "file", path: cands[0], via: null };
        mark(...span, owner);
        if (lined) cite(owner, range(a, b), whole, null, m.index);
        else refs.push({ kind: "file", path: cands[0], range: null, docLine, written: whole, via: null, index: starts[i] + m.index });
        continue;
      }
      // `.txt` alone is an extension, not a file; a slash in prose ("and/or") is no path unless a top directory starts it.
      const looksLikePath = /^\.[A-Za-z0-9]+$/.test(name)
        ? false
        : name.includes("/")
          ? lined || KNOWN_EXT_RE.test(name) || resolver.isTop(name.split("/")[0])
          : KNOWN_EXT_RE.test(name);
      if (cands.length > 1 || looksLikePath) {
        if (!lined && cands.length === 0 && !looksLikePath) continue;
        const owner = { kind: "unknown", name, candidates: cands, via: null };
        mark(...span, owner);
        if (lined) cite(owner, range(a, b), whole, name, m.index);
        else refs.push({ kind: "unlisted", name, candidates: cands, docLine, written: whole, index: starts[i] + m.index });
        continue;
      }
      if (lined && SHORT_NAME_RE.test(name)) {
        const owner = { kind: "unchecked", name, via: name };
        mark(...span, owner);
        cite(owner, range(a, b), whole, name, m.index);
      }
    }
    // A phrase is the brief's own word only outside quotes. In the possessive inside a sentence it describes ("the
    // config's rule (`:210`)", "the page's line (`:115-137`)") and owns a line only right after it ("the read-back's
    // `:99-103`"); starting a sentence it is the subject ("The status report's appendix opens at `:38`").
    for (const { phrase, re } of PHRASES) {
      for (const m of line.matchAll(re)) {
        if (!free(m.index, m.index + m[0].length) || inQuote(m.index)) continue;
        const rest = line.slice(m.index + m[0].length);
        if (/^['’]s/.test(rest) && !/^['’]s\s*\(?`?:L?\d/.test(rest) && !sentenceStart(lines, i, m.index)) continue;
        mark(m.index, m.index + m[0].length, { ...fromTarget(defined(phrases.get(phrase), starts[i] + m.index), m[0]), via: m[0] });
      }
    }
    for (const m of line.matchAll(NOTE_RE)) {
      if (free(m.index, m.index + m[0].length) && !inQuote(m.index)) mark(m.index, m.index + m[0].length, { kind: "unchecked", name: "the note", via: m[0] });
    }

    const bare = [];
    for (const m of line.matchAll(BARE_RE)) {
      if (free(m.index, m.index + m[0].length)) bare.push({ start: m.index, written: m[0], range: range(m[1], m[2]) });
    }
    marks.sort((x, y) => x.start - y.start);
    // In a table row a line belongs to a name in its own cell, else to the table's caption.
    const pipes = [];
    if (row) {
      let code = false;
      for (let k = 0; k < line.length; k += 1) {
        if (line[k] === "`") code = !code;
        else if (line[k] === "|" && !code && line[k - 1] !== "\\") pipes.push(k);
      }
    }
    const cell = (pos) => pipes.filter((k) => k < pos).length;
    // A line reference outside quotes belongs to the last name outside quotes: after "… `x.json`, the page" (`:51`)
    // the :51 is the quoting file's line, not the quoted path's.
    for (const r of bare) {
      const quoted = inQuote(r.start);
      const owner =
        marks.filter((k) => k.end <= r.start && (quoted || !k.quoted) && (!row || cell(k.start) === cell(r.start))).pop() ??
        (row ? caption : quoted ? ctx : ctxOut);
      if (!owner) refs.push({ kind: "unattributed", docLine, written: r.written, range: r.range, index: starts[i] + r.start });
      else cite(owner, r.range, r.written, owner.via ?? null, r.start);
    }
    if (row) {
      ctx = null;
      ctxOut = null;
    } else {
      if (marks.length) ctx = marks[marks.length - 1];
      const out = marks.filter((k) => !k.quoted);
      if (out.length) ctxOut = out[out.length - 1];
    }
  });
  refs.sort((x, y) => x.index - y.index);
  return { refs: only ? refs.filter((r) => only.has(r.docLine)) : refs, skipped };
}

// --------------------------------------------------------------------------------------------------------- comparison

/** Each line's text to the line numbers holding it (1-based). */
export function lineIndex(lines) {
  const index = new Map();
  lines.forEach((t, i) => {
    const list = index.get(t);
    if (list) list.push(i + 1);
    else index.set(t, [i + 1]);
  });
  return index;
}

/** The offsets (head line - old line) of line n's nearest unique neighbours above and below: 0, 1 or 2 numbers. */
export function neighbourOffsets(old, n, oldIdx, headIdx, window = NEIGHBOUR_WINDOW) {
  const out = [];
  for (const dir of [-1, 1]) {
    for (let k = n + dir, steps = 0; k >= 1 && k <= old.length && steps < window; k += dir, steps += 1) {
      const t = old[k - 1];
      if (isGeneric(t) || oldIdx.get(t).length !== 1) continue;
      const h = headIdx.get(t);
      if (!h || h.length !== 1) continue;
      out.push(h[0] - k);
      break;
    }
  }
  return out;
}

/**
 * Where line n of old is in head: { line, status, newLine?, oldText, headText?, candidates?, via? }.
 * oldIdx and headIdx are lineIndex(old) and lineIndex(head).
 */
export function lineFate(old, head, n, oldIdx = lineIndex(old), headIdx = lineIndex(head)) {
  if (!Number.isInteger(n) || n < 1 || n > old.length) return { line: n, status: "invalid", oldText: null };
  const text = old[n - 1];
  const at = n <= head.length ? head[n - 1] : null;
  const hits = headIdx.get(text) ?? [];
  const base = { line: n, oldText: text };
  const generic = isGeneric(text);
  if (!generic) {
    if (at === text) return { ...base, status: "same", newLine: n };
    if (hits.length === 1) return { ...base, status: "moved", newLine: hits[0] };
    if (hits.length === 0) return { ...base, status: "changed", headText: at };
  }
  // Blank or punctuation only, or written more than once at head: the unique neighbours place it.
  const offsets = neighbourOffsets(old, n, oldIdx, headIdx);
  const placed = [...new Set(offsets.map((d) => n + d))].filter((k) => k >= 1 && k <= head.length && head[k - 1] === text);
  if (placed.length === 1) return { ...base, status: placed[0] === n ? "same" : "moved", newLine: placed[0], via: "neighbours" };
  if (placed.length > 1) return { ...base, status: "ambiguous", candidates: placed, via: "neighbours" };
  if (!generic) return { ...base, status: "ambiguous", candidates: hits };
  if (offsets.length > 0 || hits.length === 0) return { ...base, status: "changed", headText: at };
  if (at === text) return { ...base, status: "same", newLine: n, via: "no unique neighbour" };
  return { ...base, status: "ambiguous", candidates: hits };
}

/** Line numbers as pointers: [426..430, 433] -> ":426-430, :433". */
export function pointer(numbers) {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j += 1;
    parts.push(i === j ? `:${sorted[i]}` : `:${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return parts.join(", ");
}

/** A cited range's fate: { status, offset, newPointer, lines } — offset when every line moved by one offset. */
export function rangeFate(old, head, [a, b], oldIdx = lineIndex(old), headIdx = lineIndex(head)) {
  if (b < a) return { status: "invalid", offset: null, newPointer: null, lines: [], note: "the range ends before it starts" };
  const lines = [];
  for (let n = a; n <= b; n += 1) lines.push(lineFate(old, head, n, oldIdx, headIdx));
  const placed = lines.every((l) => l.status === "same" || l.status === "moved");
  const offsets = new Set(lines.map((l) => (l.newLine === undefined ? NaN : l.newLine - l.line)));
  if (placed && offsets.size === 1) {
    const d = lines[0].newLine - a;
    return { status: d === 0 ? "same" : "moved", offset: d, newPointer: rangeText([a + d, b + d]), lines };
  }
  const status = lines.reduce((s, l) => worse(s, l.status), "same");
  return { status, offset: null, newPointer: placed ? pointer(lines.map((l) => l.newLine)) : null, lines };
}

// ------------------------------------------------------------------------------------------------------------- report

const rangeKey = (r) => (r ? `${r[0]}-${r[1]}` : "file");
const rangeText = (r) => (r ? (r[0] === r[1] ? `:${r[0]}` : `:${r[0]}-${r[1]}`) : "(file)");

/** The report: { file, row, tree, head, skipped, files: [{ path, citations }], unknown, unchecked, unattributed, unlisted, summary, drifted }. */
export function buildReport({ root, file, text, row = null, tree, head }) {
  const resolver = makeResolver(tree.paths);
  const only = row ? new Set([row.line]) : null;
  const { refs, skipped } = scanCitations(text, resolver, { only });

  const group = (list, keyOf, make) => {
    const map = new Map();
    for (const r of list) {
      const key = keyOf(r);
      if (!map.has(key)) map.set(key, make(r));
      const g = map.get(key);
      g.citedAt.add(r.docLine);
      g.written.add(r.written);
      if (r.via) g.via.add(r.via);
    }
    return [...map.values()];
  };
  const fresh = (r) => ({ citedAt: new Set(), written: new Set(), via: new Set(), range: r.range ?? null });

  const files = new Map();
  for (const g of group(refs.filter((r) => r.kind === "file"), (r) => `${r.path}\0${rangeKey(r.range)}`, (r) => ({ path: r.path, ...fresh(r) }))) {
    if (!files.has(g.path)) files.set(g.path, []);
    files.get(g.path).push(g);
  }
  const fileGroups = [];
  for (const [path, citations] of files) {
    const present = head.paths.has(path);
    const old = citations.some((c) => c.range) ? tree.lines(path) : [];
    const now = present && citations.some((c) => c.range) ? head.lines(path) : [];
    const oldIdx = lineIndex(old);
    const headIdx = lineIndex(now);
    for (const c of citations) {
      if (!present) Object.assign(c, { status: "gone", offset: null, newPointer: null, lines: c.range ? rangeLines(c.range).map((n) => ({ line: n, status: "gone", oldText: old[n - 1] ?? null })) : [] });
      else if (!c.range) Object.assign(c, { status: "same", offset: 0, newPointer: path, lines: [] });
      else Object.assign(c, rangeFate(old, now, c.range, oldIdx, headIdx));
    }
    citations.sort((x, y) => (x.range?.[0] ?? 0) - (y.range?.[0] ?? 0) || (x.range?.[1] ?? 0) - (y.range?.[1] ?? 0));
    fileGroups.push({ path, first: Math.min(...citations.map((c) => Math.min(...c.citedAt))), citations });
  }
  fileGroups.sort((x, y) => x.first - y.first);

  const unknown = group(refs.filter((r) => r.kind === "unknown"), (r) => `${r.name}\0${rangeKey(r.range)}`, (r) => ({ name: r.name, candidates: r.candidates, status: "unknown path", ...fresh(r) }));
  const unchecked = group(refs.filter((r) => r.kind === "unchecked"), (r) => `${r.name}\0${rangeKey(r.range)}`, (r) => ({ name: r.name, status: "not checked", ...fresh(r) }));
  const unattributed = group(refs.filter((r) => r.kind === "unattributed"), (r) => rangeKey(r.range), (r) => ({ status: "unattributed", ...fresh(r) }));
  const unlisted = group(refs.filter((r) => r.kind === "unlisted"), (r) => r.name, (r) => ({ name: r.name, candidates: r.candidates, ...fresh(r) }));

  const all = fileGroups.flatMap((g) => g.citations);
  const citations = Object.fromEntries([...SEVERITY, "unknown path"].map((s) => [s, 0]));
  const lineCounts = Object.fromEntries(SEVERITY.map((s) => [s, 0]));
  for (const c of all) {
    citations[c.status] += 1;
    for (const l of c.lines) lineCounts[l.status] += 1;
  }
  citations["unknown path"] = unknown.length;
  const drifted = all.some((c) => DRIFT.includes(c.status)) || unknown.length > 0;
  const plain = (g) => ({ ...g, citedAt: [...g.citedAt].sort((a, b) => a - b), written: [...g.written], via: [...g.via] });
  return {
    file,
    row: row ? { n: row.n, line: row.line } : null,
    tree: { ref: tree.ref, sha: tree.sha },
    head: { ref: head.ref, sha: head.sha },
    skipped,
    files: fileGroups.map((g) => ({ path: g.path, citations: g.citations.map(plain) })),
    unknown: unknown.map(plain),
    unchecked: unchecked.map(plain),
    unattributed: unattributed.map(plain),
    unlisted: unlisted.map(plain),
    summary: { citations, lines: lineCounts, unchecked: unchecked.length, unattributed: unattributed.length, unlisted: unlisted.length },
    drifted,
  };
}

function rangeLines([a, b]) {
  const out = [];
  for (let n = a; n <= b && out.length < 100000; n += 1) out.push(n);
  return out;
}

const cell = (s) => String(s).replace(/\|/g, "\\|");
const quote = (t, max = 70) => (t === null || t === undefined ? "(none)" : JSON.stringify(t.length > max ? `${t.slice(0, max)}…` : t));

/** "SITTING-…md:12, :40": where a citation is written. */
function citedAt(file, lines, max = 12) {
  const shown = lines.slice(0, max).map((n, i) => (i === 0 ? `${basename(file)}:${n}` : `:${n}`));
  return `${shown.join(", ")}${lines.length > max ? `, … (+${lines.length - max})` : ""}`;
}

function statusText(c) {
  if (c.status === "moved" && c.offset !== null && c.range) {
    const [a, b] = c.range;
    const to = (n) => n + c.offset;
    return a === b ? `moved ${a}→${to(a)}` : `moved ${a}-${b}→${to(a)}-${to(b)} (${c.offset > 0 ? "+" : ""}${c.offset})`;
  }
  if (c.range && c.range[1] > c.range[0] && c.lines.length && c.status !== "same" && c.status !== "gone") {
    const n = c.lines.filter((l) => l.status === c.status).length;
    return `${c.status} (${n} of ${c.lines.length} lines)${c.status === "moved" ? ", several offsets" : ""}`;
  }
  return c.status;
}

/** A range's lines as runs of one status and offset; each changed, ambiguous or invalid line alone. */
function lineRuns(lines) {
  const runs = [];
  for (const l of lines) {
    const off = l.newLine === undefined ? null : l.newLine - l.line;
    const last = runs[runs.length - 1];
    const joinable = ["same", "moved", "invalid"].includes(l.status) && last && last.status === l.status && last.offset === off && last.to === l.line - 1;
    if (joinable) last.to = l.line;
    else runs.push({ from: l.line, to: l.line, status: l.status, offset: off, line: l });
  }
  return runs;
}

function detail(run) {
  const l = run.line;
  const span = run.from === run.to ? `:${run.from}` : `:${run.from}-${run.to}`;
  if (run.status === "same" || run.status === "moved") {
    const to = rangeText([run.from + run.offset, run.to + run.offset]);
    return [`↳ ${span}`, "", run.status === "same" ? "same" : `moved ${run.offset > 0 ? "+" : ""}${run.offset}`, `${to}${l.via ? ` (by its neighbours)` : ""}`];
  }
  if (run.status === "changed") return [`↳ ${span}`, "", "changed", `was ${quote(l.oldText)}; now :${l.line} is ${quote(l.headText)}`];
  if (run.status === "ambiguous") {
    const c = l.candidates;
    return [`↳ ${span}`, "", "ambiguous", `${quote(l.oldText)} at ${pointer(c.slice(0, 10))}${c.length > 10 ? `, … (${c.length} places)` : ""}`];
  }
  if (run.status === "gone") return [`↳ ${span}`, "", "gone", "—"];
  return [`↳ ${span}`, "", "invalid", "past the end of the file at --tree"];
}

const table = (rows) => ["| citation | cited at | status | new pointer |", "| --- | --- | --- | --- |", ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)];

/** The report as text: a table per cited file, then the references that are no file's, then the counts. */
export function formatText(report) {
  const out = [];
  const short = (sha) => sha.slice(0, 7);
  out.push(
    `brief-drift: ${report.file}${report.row ? ` row ${report.row.n} (line ${report.row.line})` : ""} — tree ${report.tree.ref} (${short(report.tree.sha)}) → head ${report.head.ref} (${short(report.head.sha)})`,
  );
  if (report.skipped.length) out.push(`Skipped ${report.skipped.length} drift-note line(s): ${pointer(report.skipped)}.`);
  for (const g of report.files) {
    out.push("", `### ${g.path}`, "");
    const rows = [];
    for (const c of g.citations) {
      const via = c.via.length ? ` (via ${c.via.join(", ")})` : "";
      rows.push([`${rangeText(c.range)}${via}`, citedAt(report.file, c.citedAt), statusText(c), c.newPointer ?? "—"]);
      // A range that did not move as one, and a line that is not placed, get their lines.
      if (c.offset === null && c.status !== "gone") for (const run of lineRuns(c.lines)) rows.push(detail(run));
    }
    out.push(...table(rows));
  }
  if (report.unknown.length) {
    out.push("", "### unknown paths (no one file of --tree has the name)", "");
    out.push(
      ...table(
        report.unknown.map((u) => [`${u.name}${rangeText(u.range)}`, citedAt(report.file, u.citedAt), "unknown path", u.candidates.length ? `candidates: ${u.candidates.slice(0, 6).join(", ")}${u.candidates.length > 6 ? ", …" : ""}` : "—"]),
      ),
    );
  }
  if (report.unchecked.length) {
    out.push("", "### not checked (a short name with no file in the tree)", "");
    out.push(...table(report.unchecked.map((u) => [`${u.name}${rangeText(u.range)}`, citedAt(report.file, u.citedAt), "not checked", "—"])));
  }
  if (report.unattributed.length) {
    out.push("", "### unattributed (a line reference after no name in its paragraph)", "");
    out.push(...table(report.unattributed.map((u) => [rangeText(u.range), citedAt(report.file, u.citedAt), "unattributed", "—"])));
  }
  if (report.unlisted.length) {
    out.push("", `Named without a line and not one file of the tree (not checked): ${report.unlisted.map((u) => `${u.name} (${citedAt(report.file, u.citedAt, 3)})`).join("; ")}.`);
  }
  const s = report.summary;
  const counts = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(", ");
  const total = Object.values(s.citations).reduce((a, b) => a + b, 0);
  out.push(
    "",
    `Summary: ${total} citation(s) — ${counts(s.citations)}; cited lines — ${counts(s.lines)}; not checked ${s.unchecked}; unattributed ${s.unattributed}; named without a line, not in the tree ${s.unlisted}.`,
    report.drifted ? "Drift: yes (exit 3)." : "Drift: none (exit 0).",
  );
  return out.join("\n");
}

// ---------------------------------------------------------------------------------------------------------------- CLI

export function parseCli(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: { tree: { type: "string" }, head: { type: "string" }, row: { type: "string" }, json: { type: "boolean" }, help: { type: "boolean", short: "h" } },
    });
  } catch (err) {
    throw new UsageError(err.message);
  }
  const { values, positionals } = parsed;
  if (values.help) return { help: true };
  if (positionals.length !== 1) throw new UsageError(positionals.length ? `one citing file, not ${positionals.length}` : "no citing file");
  if (values.row !== undefined && !/^\d+$/.test(values.row)) throw new UsageError(`--row is a row number: ${values.row}`);
  if (values.tree !== undefined && !values.tree.trim()) throw new UsageError("--tree is empty");
  return { file: positionals[0], tree: values.tree, head: values.head ?? "HEAD", row: values.row === undefined ? null : Number(values.row), json: Boolean(values.json) };
}

export function main(argv, { cwd = process.cwd(), log = (s) => process.stdout.write(`${s}\n`), error = (s) => process.stderr.write(`${s}\n`) } = {}) {
  let opts;
  try {
    opts = parseCli(argv);
  } catch (err) {
    error(`brief-drift: ${err.message}`);
    error(USAGE);
    return 1;
  }
  if (opts.help) {
    log(USAGE);
    return 0;
  }
  try {
    const path = isAbsolute(opts.file) ? opts.file : resolve(cwd, opts.file);
    let text;
    try {
      text = readFileSync(path, "utf8");
    } catch (err) {
      throw new ReadError(`cannot read ${opts.file}: ${err.code ?? err.message}`);
    }
    const root = repoRoot(cwd);
    const rel = relative(root, path).split("\\").join("/");
    let row = null;
    if (opts.row !== null) {
      const found = findRow(text, opts.row);
      if (!found) throw new ReadError(`${opts.file} has no table row ${opts.row}`);
      row = { n: opts.row, ...found };
    }
    if (!opts.tree) {
      error(`brief-drift: --tree is required: the tree ${row ? `row ${opts.row}'s citations were` : "the citations were"} written against. No default is guessed.`);
      const hints = treeHints(text, { row });
      if (hints.length) for (const h of hints) error(`  ${rel}:${h.line}: "${h.phrase}" ${h.sha}`);
      else error(`  ${row ? `row ${opts.row}` : "the header"} names no tree ("assembled on", "built on", "wrote this file on", "against the tree at", "read at", "Tree:").`);
      if (row) {
        const w = lastWriter(root, rel, row.line);
        if (w) error(`  the row was last written in ${w.sha.slice(0, 7)} (${w.summary.slice(0, 100)})`);
        // The brief a row names says in its own header which tree it was checked on.
        for (const brief of new Set(row.text.match(/research\/channel-loop\/SITTING-[\w.-]+-BRIEF\.md/g) ?? [])) {
          let header;
          try {
            header = readFileSync(resolve(root, brief), "utf8");
          } catch {
            continue;
          }
          for (const h of treeHints(header)) error(`  the row's brief, ${brief}:${h.line}: "${h.phrase}" ${h.sha}`);
        }
      }
      error(USAGE);
      return 1;
    }
    const treeSha = resolveRef(root, opts.tree);
    const headSha = resolveRef(root, opts.head);
    const tree = Object.assign(new Tree(root, treeSha), { ref: opts.tree });
    const head = Object.assign(new Tree(root, headSha), { ref: opts.head });
    const report = buildReport({ root, file: rel, text, row, tree, head });
    log(opts.json ? JSON.stringify(report, null, 2) : formatText(report));
    return report.drifted ? 3 : 0;
  } catch (err) {
    if (err instanceof ReadError) {
      error(`brief-drift: ${err.message}`);
      return 1;
    }
    throw err;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) process.exitCode = main(process.argv.slice(2));
