#!/usr/bin/env node
/**
 * loop-edit — edit one line of the loop's Markdown files (logs/*.md, research/channel-loop/*.md), and refuse rather
 * than guess.
 *
 *   node scripts/loop-edit.mjs set-status [--file logs/FABLE_QUEUE.md] --row <n> --text "<text>" [--prepend|--replace]
 *   node scripts/loop-edit.mjs set-cell --file <md> --row-key "<first cell>" --col <k> --text "<text>" [--append]
 *   node scripts/loop-edit.mjs insert-after --file <md> --anchor "<line or unique prefix>" --text "<line(s)>"
 *   node scripts/loop-edit.mjs replace-in-line --file <md> --anchor "<unique prefix>" --old "<text>" --new "<text>"
 *   node scripts/loop-edit.mjs repoint-capture --file <md> --line <n> --slug <live> --to <frozen>
 *   every command takes --dry-run: print the diff, write nothing.
 * A value that starts with "-" needs the = form: --text="- a bullet". Several lines (insert-after only): --text $'a\nb'.
 * A "|" inside a table cell is written "\|" (an unescaped one would add a cell, and the edit is refused).
 * Each run prints the target line before and after as a unified diff. Exit: 0 written (or --dry-run); 2 refused or a
 * usage error, with the reason on stderr, and the file is byte for byte what it was.
 *
 * WHY. The main thread edited CHANNEL_LOOP.md and FABLE_QUEUE.md with one-off Python whose assertions failed on a table
 * cell three times on 4.10 (logs/2026-10-04-channel-loop-tick-38.md, -39.md, -40.md §7). These files are long single
 * lines (a FABLE_QUEUE row runs to 3,000 characters) carrying URLs, capture citations, Hebrew and ₪; a wrong split, a
 * second match or a lost line ending is hard to see in review. Each command finds exactly one target or stops.
 *
 * THE COMMANDS.
 *   set-status       in the table row whose first cell is <n> (FABLE_QUEUE's "| <n> |"), prepend "<text> Was: " to
 *                    the last cell (default), or replace it (--replace). Refused when no row or two rows have that first
 *                    cell, or the row has not exactly STATUS_CELLS (8) cells.
 *   set-cell         in the table row whose first cell equals --row-key exactly, replace (or --append to) cell --col
 *                    (1-based, the first cell is 1). Refused on a missing or duplicated key, or when the row's cell count
 *                    is not its table's header's.
 *   insert-after     insert the --text line(s) after the one line that starts with --anchor (an exact line is its own
 *                    prefix). Refused when no line or more than one line starts with it.
 *   replace-in-line  in the one line that starts with --anchor, replace --old with --new once. Refused when --old is
 *                    absent from that line or occurs in it more than once (overlapping occurrences count).
 *   repoint-capture  on line --line only, replace every "<live>.<ext>:" with "<frozen>.<ext>:" (a capture cited by line,
 *                    as tick 38/39 did by hand for CHANNEL_LOOP :158/:168/:338 and FABLE_QUEUE :38/:42/:45), after
 *                    checking that research/rendered/<frozen>.<ext> exists for each ext seen.
 *
 * WHAT IS CHECKED before anything is written (checkEdit runs on every command's output, not only in the commands):
 *   - the target is a regular file (not a link) named logs/<name>.md or research/channel-loop/<name>.md, so
 *     research/rendered/urls.txt and every other file is refused; it must be valid UTF-8;
 *   - the line count changes only by the lines insert-after adds, and every other line is byte for byte as it was,
 *     line ending included (CRLF stays CRLF; a missing final newline stays missing);
 *   - a table edit changes only its own cell, and the row keeps its cell count;
 *   - a URL (http:// or https://), or a slug field of a tab-separated line, on the target line is never altered, removed
 *     or created unless the command's own text contains it;
 *   - an edit that changes nothing is refused, and the file is re-read (sha256) just before writing: a concurrent change
 *     is refused, not overwritten.
 */
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const FABLE_QUEUE = "logs/FABLE_QUEUE.md";
export const RENDERED_REL = "research/rendered";

/** A FABLE_QUEUE row since row 19: #, script, agents, reads, writes, question, then, status. */
export const STATUS_CELLS = 8;

/** The files a capture can have: freeze-capture.mjs CAPTURE_EXTS (a test holds the two lists equal). */
export const CAPTURE_EXTS = ["meta.json", "txt", "html", "json", "pdf", "xml", "bin"];

/** render-watch's slug rule: a file name, never a path. */
const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;

/** A refusal: the reason is printed, exit 2, nothing written. */
export class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}
const refuse = (message) => {
  throw new Refusal(message);
};

// ---------------------------------------------------------------------------------------------------------------------
// Lines

/**
 * The file as lines, each with its own ending ("\n", "\r\n", or "" for a last line with no newline). A text that ends
 * with a newline has no empty line after it. joinLines(parseLines(t)) === t for every t.
 */
export function parseLines(text) {
  const parts = text.split("\n");
  const lines = [];
  for (let i = 0; i < parts.length; i += 1) {
    const last = i === parts.length - 1;
    const part = parts[i];
    if (last) {
      if (part !== "") lines.push({ text: part, eol: "" });
    } else if (part.endsWith("\r")) {
      lines.push({ text: part.slice(0, -1), eol: "\r\n" });
    } else {
      lines.push({ text: part, eol: "\n" });
    }
  }
  return lines;
}

export const joinLines = (lines) => lines.map((l) => l.text + l.eol).join("");

/** The file's line ending: the first line's that has one, else "\n". */
const fileEol = (lines) => lines.find((l) => l.eol)?.eol ?? "\n";

function oneLine(value, flag) {
  if (/[\r\n]/.test(value)) refuse(`${flag} must be one line (it holds a line break)`);
}

/** Every start index of `needle` in `hay`, overlapping ones included. */
function occurrences(hay, needle) {
  const at = [];
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) at.push(i);
  return at;
}

// ---------------------------------------------------------------------------------------------------------------------
// Tables

/** The cell separators of a row: every "|" not escaped by an odd run of backslashes (GFM). */
export function separators(row) {
  const out = [];
  let backslashes = 0;
  for (let i = 0; i < row.length; i += 1) {
    const ch = row[i];
    if (ch === "|" && backslashes % 2 === 0) out.push(i);
    backslashes = ch === "\\" ? backslashes + 1 : 0;
  }
  return out;
}

/** A "| a | b |" row's cells, raw (spaces kept), or null when the line is not a row of that form. */
export function cells(row) {
  const end = row.trimEnd().length - 1;
  const s = separators(row);
  if (s.length < 2 || s[0] !== 0 || s[s.length - 1] !== end) return null;
  const out = [];
  for (let i = 1; i < s.length; i += 1) out.push(row.slice(s[i - 1] + 1, s[i]));
  return out;
}

/** The first cell's text, trimmed, of a line that starts with "|" (null when there is no second separator). */
function firstCell(row) {
  const s = separators(row);
  return s.length >= 2 && s[0] === 0 ? row.slice(1, s[1]).trim() : null;
}

const DELIMITER = /^\|(\s*:?-+:?\s*\|)+\s*$/;

/** Every table: a run of lines starting with "|" whose second line is a delimiter row. 0-based indices. */
export function tables(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].text.startsWith("|")) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < lines.length && lines[j].text.startsWith("|")) j += 1;
    if (j - i >= 2 && DELIMITER.test(lines[i + 1].text)) {
      const rows = [];
      for (let r = i + 2; r < j; r += 1) rows.push(r);
      out.push({ header: i, rows });
    }
    i = j;
  }
  return out;
}

/** The body rows (never a header or delimiter row) whose first cell is `key`, with their table's header index. */
export function findRows(lines, key) {
  const hits = [];
  for (const t of tables(lines)) {
    for (const r of t.rows) if (firstCell(lines[r].text) === key) hits.push({ index: r, header: t.header });
  }
  return hits;
}

/** The row with cell k (1-based) rewritten by make(oldBody); the cell's surrounding spaces are kept. */
export function editCell(row, k, make) {
  const s = separators(row);
  const raw = row.slice(s[k - 1] + 1, s[k]);
  const [, lead, body, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
  const next = make(body);
  const cell = body === "" ? ` ${next} ` : `${lead}${next}${trail}`;
  return row.slice(0, s[k - 1] + 1) + cell + row.slice(s[k]);
}

function oneRow(lines, key, what) {
  const hits = findRows(lines, key);
  if (hits.length === 0) refuse(`no table row whose first cell is "${key}"`);
  if (hits.length > 1) refuse(`${hits.length} table rows have the first cell "${key}" (lines ${hits.map((h) => h.index + 1).join(", ")}); ${what} needs exactly one`);
  return hits[0];
}

// ---------------------------------------------------------------------------------------------------------------------
// Protected tokens

const URL_RE = /https?:\/\/[^\s<>`"'|\\]+/g;

/** The URLs on a line (trailing punctuation dropped), and on a tab-separated line its slug fields. */
export function protectedTokens(line) {
  const urls = (line.match(URL_RE) ?? []).map((u) => u.replace(/[.,;:!?)\]}*_]+$/, ""));
  const slugs = line.includes("\t") ? line.split("\t").map((f) => f.trim()).filter((f) => SLUG_RE.test(f)) : [];
  return [...urls, ...slugs];
}

function guardTokens(before, after, commandText, line) {
  const covered = (tok) => commandText.some((s) => s.includes(tok));
  const left = protectedTokens(after);
  for (const tok of protectedTokens(before)) {
    const at = left.indexOf(tok);
    if (at >= 0) left.splice(at, 1);
    else if (!covered(tok)) refuse(`line ${line}: "${tok}" would be altered or removed, and the command's text does not contain it`);
  }
  for (const tok of left) if (!covered(tok)) refuse(`line ${line}: "${tok}" would appear, and the command's text does not contain it`);
}

// ---------------------------------------------------------------------------------------------------------------------
// The check every edit passes before it is written

/**
 * Throws a Refusal unless `after` is `before` with only line `line` (1-based) changed, or, with `inserted` > 0, with
 * exactly the lines of `insertedText` added after it and line `line` itself unchanged. With `cell`, the target row keeps
 * its cell count and only that cell (1-based) changes. Protected tokens (protectedTokens) on the target line survive
 * unless a string in `commandText` contains them.
 */
export function checkEdit(before, after, { line, inserted = 0, insertedText = [], cell = null, commandText = [] }) {
  const a = parseLines(before);
  const b = parseLines(after);
  if (b.length !== a.length + inserted) {
    refuse(`the edit has ${b.length} lines, the file ${a.length}${inserted ? ` + ${inserted} inserted` : ""}`);
  }
  if (!Number.isInteger(line) || line < 1 || line > a.length) refuse(`line ${line} is not a line of the file`);
  if (before.endsWith("\n") !== after.endsWith("\n")) refuse("the edit would change whether the file ends with a newline");
  const t = line - 1;
  for (let i = 0; i < a.length; i += 1) {
    if (i === t) continue;
    const j = i < t ? i : i + inserted;
    if (a[i].text !== b[j].text || a[i].eol !== b[j].eol) refuse(`line ${i + 1} would change, and it is not the target`);
  }
  if (inserted > 0) {
    if (b[t].text !== a[t].text) refuse(`the anchor, line ${line}, would change`);
    if (b[t].eol !== a[t].eol && !(a[t].eol === "" && t === a.length - 1)) refuse(`the anchor's line ending would change`);
    for (let k = 0; k < inserted; k += 1) {
      const got = b[t + 1 + k];
      if (got.text !== insertedText[k]) refuse(`inserted line ${t + 2 + k} is not line ${k + 1} of --text`);
      const lastOfFile = t + 1 + k === b.length - 1;
      if (got.eol !== b[t].eol && !(lastOfFile && got.eol === "")) refuse(`inserted line ${t + 2 + k} has another line ending than the anchor`);
    }
    return true;
  }
  if (b[t].eol !== a[t].eol) refuse(`line ${line}'s line ending would change`);
  guardTokens(a[t].text, b[t].text, commandText, line);
  if (cell !== null) {
    const ca = cells(a[t].text);
    const cb = cells(b[t].text);
    if (!ca || !cb || ca.length !== cb.length) refuse(`line ${line}: the row's cell count would change (an unescaped "|" in the text?)`);
    for (let k = 0; k < ca.length; k += 1) {
      if (k !== cell - 1 && ca[k] !== cb[k]) refuse(`line ${line}: cell ${k + 1} would change, and the edit is to cell ${cell}`);
    }
  }
  return true;
}

/** Applies a one-line edit, checks it, and returns { text, change }. */
function finishLine(source, lines, index, newText, check) {
  const out = lines.slice();
  out[index] = { text: newText, eol: lines[index].eol };
  const text = joinLines(out);
  if (text === source) refuse("the edit changes nothing");
  checkEdit(source, text, { line: index + 1, ...check });
  return { text, change: { line: index + 1, before: [lines[index].text], after: [newText] } };
}

// ---------------------------------------------------------------------------------------------------------------------
// The commands (pure: text in, { text, change, notes? } out, or a Refusal)

export function setStatus(source, { row, text, mode = "prepend" }) {
  const n = String(row ?? "");
  if (!/^[1-9]\d*$/.test(n)) refuse(`--row must be a row number, got "${n}"`);
  if (!text) refuse("--text is empty");
  oneLine(text, "--text");
  if (mode !== "prepend" && mode !== "replace") refuse(`unknown mode "${mode}"`);
  const lines = parseLines(source);
  const { index } = oneRow(lines, n, "set-status");
  const c = cells(lines[index].text);
  if (!c || c.length !== STATUS_CELLS) {
    refuse(`row ${n} (line ${index + 1}) has ${c ? c.length : "no parsable"} cells, not ${STATUS_CELLS}`);
  }
  const k = c.length;
  const next = editCell(lines[index].text, k, (old) => (mode === "replace" ? text : [text, "Was:", old].filter(Boolean).join(" ")));
  return finishLine(source, lines, index, next, { cell: k, commandText: [text] });
}

export function setCell(source, { rowKey, col, text, append = false }) {
  if (!rowKey) refuse("--row-key is empty");
  oneLine(rowKey, "--row-key");
  const k = Number(col);
  if (!/^[1-9]\d*$/.test(String(col ?? ""))) refuse(`--col must be a column number (1-based), got "${col}"`);
  if (!text) refuse("--text is empty");
  oneLine(text, "--text");
  const lines = parseLines(source);
  const { index, header } = oneRow(lines, rowKey, "set-cell");
  const c = cells(lines[index].text);
  const h = cells(lines[header].text);
  if (!c) refuse(`line ${index + 1} is not a "| ... |" row`);
  if (!h || c.length !== h.length) {
    refuse(`row "${rowKey}" (line ${index + 1}) has ${c.length} cells, its table's header (line ${header + 1}) ${h ? h.length : "none"}`);
  }
  if (k > c.length) refuse(`--col ${k}: the row has ${c.length} cells`);
  const next = editCell(lines[index].text, k, (old) => (append && old ? `${old} ${text}` : text));
  return finishLine(source, lines, index, next, { cell: k, commandText: [text] });
}

function oneLineStartingWith(lines, anchor) {
  if (!anchor) refuse("--anchor is empty");
  oneLine(anchor, "--anchor");
  const hits = [];
  lines.forEach((l, i) => {
    if (l.text.startsWith(anchor)) hits.push(i);
  });
  if (hits.length === 0) refuse(`no line starts with the anchor "${anchor}"`);
  if (hits.length > 1) refuse(`${hits.length} lines start with the anchor (lines ${hits.map((i) => i + 1).join(", ")}); make it longer`);
  return hits[0];
}

export function insertAfter(source, { anchor, text }) {
  if (text === undefined || text === null) refuse("--text is missing");
  const add = String(text).split(/\r?\n/);
  for (const l of add) oneLine(l, "each --text line");
  const lines = parseLines(source);
  const t = oneLineStartingWith(lines, anchor);
  const eol = lines[t].eol || fileEol(lines);
  const wasLast = lines[t].eol === "";
  const inserted = add.map((s, j) => ({ text: s, eol: wasLast && j === add.length - 1 ? "" : eol }));
  const out = [...lines.slice(0, t), { text: lines[t].text, eol }, ...inserted, ...lines.slice(t + 1)];
  const result = joinLines(out);
  checkEdit(source, result, { line: t + 1, inserted: add.length, insertedText: add, commandText: [String(text)] });
  return { text: result, change: { line: t + 1, before: [lines[t].text], after: [lines[t].text, ...add] } };
}

export function replaceInLine(source, { anchor, old, new: replacement }) {
  if (!old) refuse("--old is empty");
  if (replacement === undefined || replacement === null) refuse("--new is missing");
  oneLine(old, "--old");
  oneLine(replacement, "--new");
  if (old === replacement) refuse("--old and --new are the same");
  const lines = parseLines(source);
  const t = oneLineStartingWith(lines, anchor);
  const line = lines[t].text;
  const at = occurrences(line, old);
  if (at.length === 0) refuse(`--old does not occur in line ${t + 1}`);
  if (at.length > 1) refuse(`--old occurs ${at.length} times in line ${t + 1}; make it longer`);
  const next = line.slice(0, at[0]) + replacement + line.slice(at[0] + old.length);
  return finishLine(source, lines, t, next, { commandText: [old, replacement] });
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const EXT_ALT = CAPTURE_EXTS.map(escapeRe).join("|");

/**
 * exists(name) says whether research/rendered/<name> is a file; runCommand gives it the target's repository.
 * notes: mentions of the live slug with no line ("<live>.<ext>" not followed by ":"), left as written.
 */
export function repointCapture(source, { line, slug, to, exists }) {
  if (!SLUG_RE.test(String(slug ?? ""))) refuse(`--slug must be a capture slug, got "${slug}"`);
  if (!SLUG_RE.test(String(to ?? ""))) refuse(`--to must be a capture slug, got "${to}"`);
  if (slug === to) refuse("--slug and --to are the same");
  const lines = parseLines(source);
  const n = Number(line);
  if (!/^[1-9]\d*$/.test(String(line ?? "")) || n > lines.length) refuse(`--line ${line} is not a line of the file (1-${lines.length})`);
  const text = lines[n - 1].text;
  const cited = new RegExp(`(?<![A-Za-z0-9._-])${escapeRe(slug)}\\.(${EXT_ALT}):`, "g");
  const exts = new Set();
  const next = text.replace(cited, (_m, ext) => {
    exts.add(ext);
    return `${to}.${ext}:`;
  });
  if (exts.size === 0) refuse(`line ${n} cites no "${slug}.<ext>:" (a capture by line)`);
  for (const ext of exts) {
    if (!exists(`${to}.${ext}`)) refuse(`${RENDERED_REL}/${to}.${ext} does not exist; line ${n} cites ${slug}.${ext}:`);
  }
  const bare = new RegExp(`(?<![A-Za-z0-9._-])${escapeRe(slug)}\\.(${EXT_ALT})(?![A-Za-z0-9.:_-])`, "g");
  const mentions = (next.match(bare) ?? []).length;
  const notes = mentions ? [`line ${n} still names ${slug} ${mentions} time(s) without a line; left as written`] : [];
  return { ...finishLine(source, lines, n - 1, next, { commandText: [slug, to] }), notes };
}

// ---------------------------------------------------------------------------------------------------------------------
// Files

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** The repository a target belongs to, or a Refusal: only logs/<name>.md and research/channel-loop/<name>.md. */
export function targetRoot(file) {
  const abs = resolve(file);
  const parent = dirname(abs);
  if (abs.endsWith(".md")) {
    if (basename(parent) === "logs") return dirname(parent);
    if (basename(parent) === "channel-loop" && basename(dirname(parent)) === "research") return dirname(dirname(parent));
  }
  refuse(`${file}: loop-edit edits logs/*.md and research/channel-loop/*.md only`);
}

const isFile = (path) => existsSync(path) && statSync(path).isFile();

export const COMMANDS = {
  "set-status": (src, o) => setStatus(src, { row: o.row, text: o.text, mode: o.replace ? "replace" : "prepend" }),
  "set-cell": (src, o) => setCell(src, { rowKey: o["row-key"], col: o.col, text: o.text, append: o.append }),
  "insert-after": (src, o) => insertAfter(src, { anchor: o.anchor, text: o.text }),
  "replace-in-line": (src, o) => replaceInLine(src, { anchor: o.anchor, old: o.old, new: o.new }),
  "repoint-capture": (src, o, root) =>
    repointCapture(src, { line: o.line, slug: o.slug, to: o.to, exists: (name) => isFile(join(root, RENDERED_REL, name)) }),
};

/** A unified diff of the changed line(s): the anchor of an insertion is a context line. */
export function unifiedDiff(file, { line, before, after }) {
  const span = (n, len) => (len === 1 ? `${n}` : `${n},${len}`);
  const out = [`--- ${file}`, `+++ ${file}`, `@@ -${span(line, before.length)} +${span(line, after.length)} @@`];
  let k = 0;
  while (k < before.length && k < after.length && before[k] === after[k]) {
    out.push(` ${before[k]}`);
    k += 1;
  }
  for (const l of before.slice(k)) out.push(`-${l}`);
  for (const l of after.slice(k)) out.push(`+${l}`);
  return out.join("\n");
}

/** Reads, edits, checks and (unless dryRun) writes one file. Returns { text, change, notes, diff, written }. */
export function runCommand(command, options, { dryRun = false } = {}) {
  const run = COMMANDS[command];
  if (!run) refuse(`unknown command "${command}"`);
  const file = options.file;
  if (!file) refuse("--file is missing");
  const root = targetRoot(file);
  let st;
  try {
    st = lstatSync(file);
  } catch {
    refuse(`${file} does not exist`);
  }
  if (st.isSymbolicLink()) refuse(`${file} is a symbolic link; edit the file it points to`);
  if (!st.isFile()) refuse(`${file} is not a regular file`);
  const buf = readFileSync(file);
  const source = buf.toString("utf8");
  if (!Buffer.from(source, "utf8").equals(buf)) refuse(`${file} is not valid UTF-8`);
  const out = run(source, options, root);
  const diff = unifiedDiff(file, out.change);
  if (!dryRun) {
    if (sha256(readFileSync(file)) !== sha256(buf)) refuse(`${file} changed while it was being edited`);
    writeFileSync(file, out.text);
  }
  return { ...out, notes: out.notes ?? [], diff, written: !dryRun };
}

// ---------------------------------------------------------------------------------------------------------------------
// CLI

const OPTIONS = {
  "set-status": { file: "string", row: "string", text: "string", prepend: "boolean", replace: "boolean" },
  "set-cell": { file: "string", "row-key": "string", col: "string", text: "string", append: "boolean" },
  "insert-after": { file: "string", anchor: "string", text: "string" },
  "replace-in-line": { file: "string", anchor: "string", old: "string", new: "string" },
  "repoint-capture": { file: "string", line: "string", slug: "string", to: "string" },
};
const REQUIRED = {
  "set-status": ["row", "text"],
  "set-cell": ["file", "row-key", "col", "text"],
  "insert-after": ["file", "anchor", "text"],
  "replace-in-line": ["file", "anchor", "old", "new"],
  "repoint-capture": ["file", "line", "slug", "to"],
};

export const USAGE = [
  "usage: node scripts/loop-edit.mjs <command> [--dry-run] ...",
  "  set-status [--file logs/FABLE_QUEUE.md] --row <n> --text <text> [--prepend|--replace]",
  "  set-cell --file <md> --row-key <first cell> --col <k> --text <text> [--append]",
  "  insert-after --file <md> --anchor <line or unique prefix> --text <line(s)>",
  "  replace-in-line --file <md> --anchor <unique prefix> --old <text> --new <text>",
  "  repoint-capture --file <md> --line <n> --slug <live> --to <frozen>",
].join("\n");

class Usage extends Error {}

/** Parses argv into [command, options, dryRun], or throws Usage. */
export function parseCommand(argv) {
  const [command, ...rest] = argv;
  const spec = OPTIONS[command];
  if (!spec) throw new Usage(command ? `unknown command "${command}"` : "no command");
  const options = { "dry-run": { type: "boolean", default: false } };
  for (const [name, type] of Object.entries(spec)) options[name] = { type };
  let values;
  try {
    ({ values } = parseArgs({ args: rest, options, strict: true, allowPositionals: false }));
  } catch (err) {
    throw new Usage(err.message);
  }
  if (values.prepend && values.replace) throw new Usage("--prepend and --replace together");
  for (const name of REQUIRED[command]) if (values[name] === undefined) throw new Usage(`${command} needs --${name}`);
  if (command === "set-status" && values.file === undefined) values.file = join(REPO_ROOT, FABLE_QUEUE);
  return [command, values, values["dry-run"]];
}

export function main(argv, { log = console.log, error = console.error } = {}) {
  let parsed;
  try {
    parsed = parseCommand(argv);
  } catch (err) {
    error(`loop-edit: ${err.message}\n${USAGE}`);
    return 2;
  }
  const [command, values, dryRun] = parsed;
  try {
    const out = runCommand(command, values, { dryRun });
    log(out.diff);
    for (const note of out.notes) log(`note: ${note}`);
    log(dryRun ? "loop-edit: dry run, nothing written" : `loop-edit: written ${values.file}`);
    return 0;
  } catch (err) {
    error(`loop-edit: refused: ${err.message}; nothing written`);
    return 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
