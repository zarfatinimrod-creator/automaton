#!/usr/bin/env node
/**
 * prize-apply-reading — write a reading workflow's verdicts into research/measurements/ai-allowed-events.md.
 *
 *   node scripts/prize-apply-reading.mjs <workflow-output.json>... [--table <md>] [--rendered <dir>] [--apply]
 *        [--no-tests] [--json <out>]
 *
 * Defaults: --table research/measurements/ai-allowed-events.md, --rendered research/rendered (where a clause cell's
 * `research/rendered/<file>` pointers are looked up).
 *
 * WHY. A reading session grades a prize event's rules page with a reader and an adversarial verifier per event (the
 * table's "How a reading session fills a row", step 3), and the verifier's three cells go into the event's row. In
 * ticks 47-51 the main thread did that by hand five times, with a Python helper in its scratch folder that died with
 * it. Queued in logs/CHANNEL_LOOP.md §9 (tick 49 item 7, tick 51 item 1); built in tick 52.
 *
 * INPUT. Each file is a Workflow output as the reading workflows write it: a JSON array of items, or an object whose
 * `result` is that array. An item is {event: {url, key?, name?, ...}, read: {...}, verify: {finalClauseCell,
 * finalGrade, finalQualifies, gradeVerdict, ...}}. The verifier's final cells are what is written, always: a verifier
 * whose gradeVerdict is "change" overrode the reader, and its cells are the final word; the reader's proposals are only
 * reported. An item with no verify block is refused.
 *
 * THE KEY. The event's url field up to its first whitespace (the workflow may write a note after the URL, "(site:
 * VERDICT, ...)"). It must equal exactly one table row's Event URL cell, `<url>`, compared whole (never a prefix or a
 * substring): a key matching no row or two rows is refused with exit 2, naming the key and the count. Two items for
 * one key, in one output or across several, are both refused.
 *
 * THE CHECKS, on every item before anything is written (one refused item refuses the run, and nothing is written):
 *   - finalGrade is RENDERED, BLOCKED, NONE or SNIPPET; finalQualifies is yes, no or empty, and empty unless the grade
 *     is RENDERED
 *   - the clause cell has no unescaped "|" (an escaped "\|" is kept as written) and no newline; any other run of
 *     whitespace becomes one space, and the cell is trimmed (the hand helper's rule)
 *   - no address in it in any form: a plain one (any @ between word characters), a percent-encoded @, a script escape
 *     (@, \x40), a character reference (&#64;, &#x40;) or a mask ([redacted:email], with or without a domain): a
 *     cell names kinds of address, never one. A refusal names the form, never the text
 *   - every pointer `research/rendered/<file>[:<line>[-<line>]]` names a render-watch capture (<slug>.txt, .html,
 *     .pdf, .json or .xml; never urls.txt or a .meta.json) that exists in --rendered with its <slug>.meta.json beside
 *     it, and each line number is between 1 and the file's last line
 *
 * WHAT IT WRITES. Only the last three cells of each matched row (AI clause, Grade, Qualifies): the row is rebuilt as
 * "| " + its cells joined by " | " + " |", as the weekly job writes it, and every other byte of the file is kept (line
 * endings, CRLF included, the final newline, every other row, the Hebrew and the header). A cell that already holds
 * the value is not a change, so applying the same output twice changes nothing the second time.
 *
 * DRY RUN (the default): prints the unified diff of the table (zero lines of context, as the hand helper's difflib
 * did) and one line per item, `<key> → <grade>/<qualifies>; N pointers checked (M files); <change>; row <state>`, then
 * a total. Exit 3 when something would change, 0 when nothing would.
 * --apply: writes the table through a temp file and a rename, prints the row states of the table it wrote (graded,
 * awaiting, unsettled, same-event counts, by rowState of src/revenue/ai-allowed-events.ts), then runs the prize tests
 * (`npx vitest run` on PRIZE_TESTS, from the repository root) and exits with their exit code. --no-tests skips the
 * test run (this script's own tests use it). PRIZE_APPLY_TEST_CMD replaces the test command for a test (split on
 * spaces; the test paths are not appended).
 * --json <out>: writes the per-item summary (key, cells, gradeVerdict, the reader's grade, pointers, change, the row
 * state, the reasons it was refused) whether or not the run is refused; it is the summary, not the table.
 *
 * Exit codes: 0 nothing to change, or applied (and the tests passed); 3 a dry run that would change something; 2 a key
 * matching no row or more than one (nothing written); 1 a usage or read error, a table the job did not write, or a
 * refused item (nothing written); with --apply, otherwise the test command's own code.
 *
 * It imports src/revenue/ai-allowed-events.ts: Node 22.18 and later strip the types themselves; on Node 20 run it as
 * `node --import tsx scripts/prize-apply-reading.mjs ...`.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { parseAiAllowedTable, rowState } from "../src/revenue/ai-allowed-events.ts";

const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const TABLE = join(REPO_ROOT, "research", "measurements", "ai-allowed-events.md");
export const RENDERED = join(REPO_ROOT, "research", "rendered");
/** The prize tests --apply runs: every prize-* test file of the revenue suite but this script's own. */
export const PRIZE_TESTS = [
  "src/__tests__/revenue/prize-dispatch.test.ts",
  "src/__tests__/revenue/prize-intake-rules.test.ts",
  "src/__tests__/revenue/prize-intake-workflow.test.ts",
  "src/__tests__/revenue/prize-intake.test.ts",
  "src/__tests__/revenue/prize-terms-audit.test.ts",
];

export const GRADES = new Set(["RENDERED", "BLOCKED", "NONE", "SNIPPET"]);
export const QUALIFIES = new Set(["yes", "no", ""]);

/** Address forms a cell must not hold, each with the words a refusal uses (never the text it matched). */
export const ADDRESS_FORMS = [
  ["a masked address (render-watch's mask): a cell names kinds of address, never one", /\[redacted:email\]/i],
  ["an address-shaped string (an @ between word characters)", /[A-Za-z0-9._%+-]@[A-Za-z0-9-]/],
  ["a percent-encoded @", /%40/i],
  ["a script-escaped @ (\\u0040 or \\x40)", /\\u0040|\\x40/i],
  ["a character reference for @ (&#64; or &#x40;)", /&#0*64;|&#x0*40;/i],
];

/** A capture pointer with its optional line or line range, as a session writes it in a clause cell. */
const POINTER_RE = /research\/rendered\/([A-Za-z0-9][A-Za-z0-9._-]*)(?::(\d+)(?:[-–](\d+))?)?/g;
/** A file render-watch writes as a capture (rowState's rule): <slug>.<txt|html|pdf|json|xml>. */
const CAPTURE_FILE_RE = /^([A-Za-z0-9][A-Za-z0-9._-]*)\.(txt|html|pdf|json|xml)$/;

/** A table line → its cells, splitting on pipes that are not escaped (the job's splitRow, and the hand helper's). */
export function splitRow(line) {
  const t = line.trim();
  const cells = [];
  let cell = "";
  for (let i = 1; i < t.length; i += 1) {
    if (t[i] === "\\" && t[i + 1] === "|") {
      cell += "\\|";
      i += 1;
    } else if (t[i] === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += t[i];
    }
  }
  if (cell.trim() !== "") cells.push(cell.trim());
  return cells;
}

/** The key of a row line, or null: its Event URL cell `<url>`, on a line of eight cells. */
function rowKey(line) {
  if (!line.startsWith("| ") || !line.includes("<http")) return null;
  const cells = splitRow(line);
  if (cells.length !== 8) return null;
  return /^<([^<>\s]+)>$/.exec(cells[3])?.[1] ?? null;
}

/** The items of one output file's JSON. Throws on any other shape. */
export function itemsOf(json, source) {
  const items = Array.isArray(json) ? json : Array.isArray(json?.result) ? json.result : null;
  if (!items) throw new Error(`${source}: not a reading workflow's output (a JSON array of items, or an object whose "result" is one)`);
  return items;
}

/** The number of lines in a file's bytes: its last line counts whether or not a newline ends it. */
function lineCount(path) {
  const lines = readFileSync(path).toString("latin1").split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines.length;
}

/** Each pointer in a clause, checked: { pointers, files, problems }. */
export function checkPointers(clause, rendered) {
  const problems = [];
  const files = new Set();
  let pointers = 0;
  for (const m of clause.matchAll(POINTER_RE)) {
    pointers += 1;
    const name = m[1].replace(/\.+$/, "");
    const capture = name === "urls.txt" || name.endsWith(".meta.json") ? null : CAPTURE_FILE_RE.exec(name);
    if (!capture) {
      problems.push(`research/rendered/${name} is not a capture (<slug>.txt, .html, .pdf, .json or .xml; never urls.txt or a .meta.json)`);
      continue;
    }
    const path = join(rendered, name);
    if (!existsSync(path)) {
      problems.push(`research/rendered/${name}: no such file in ${rendered}`);
      continue;
    }
    if (!existsSync(join(rendered, `${capture[1]}.meta.json`))) {
      problems.push(`research/rendered/${name}: no ${capture[1]}.meta.json beside it, so render-watch did not capture it`);
      continue;
    }
    files.add(name);
    const lines = [m[2], m[3]].filter((v) => v !== undefined).map(Number);
    if (lines.length === 0) continue;
    const count = lineCount(path);
    for (const n of lines) {
      if (n < 1) problems.push(`research/rendered/${name}: line ${n} (lines are counted from 1)`);
      else if (n > count) problems.push(`research/rendered/${name}: line ${n} is past the end (${count} lines)`);
    }
  }
  return { pointers, files: files.size, problems };
}

/** One item's cells, checked: { key, cells: {clause, grade, qualifies}, problems, ... }. Never throws. */
export function checkItem(it, rendered) {
  const problems = [];
  const url = typeof it?.event?.url === "string" ? it.event.url.trim().split(/\s+/)[0] : "";
  const key = /^https?:\/\/\S+$/i.test(url) ? url : null;
  if (!key) problems.push("the event has no http(s) url");
  const v = it?.verify;
  const summary = {
    key: key ?? "(no url)",
    event: typeof it?.event?.key === "string" ? it.event.key : null,
    readerGrade: typeof it?.read?.proposedGrade === "string" ? it.read.proposedGrade : null,
    gradeVerdict: typeof v?.gradeVerdict === "string" ? v.gradeVerdict : null,
    grade: null,
    qualifies: null,
    clause: null,
    pointers: 0,
    files: 0,
    problems,
  };
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    problems.push("no verify block: only a verifier's final cells are written");
    return summary;
  }
  const { finalGrade: grade, finalQualifies: qualifies, finalClauseCell: clause } = v;
  if (typeof grade !== "string" || !GRADES.has(grade)) problems.push(`finalGrade is not one of ${[...GRADES].join(", ")}`);
  if (typeof qualifies !== "string" || !QUALIFIES.has(qualifies)) problems.push('finalQualifies is not "yes", "no" or empty');
  else if (qualifies !== "" && grade !== "RENDERED") problems.push("finalQualifies must be empty unless the grade is RENDERED");
  if (typeof clause !== "string") {
    problems.push("finalClauseCell is not a string");
  } else {
    if (/[\r\n]/.test(clause)) problems.push("the clause cell holds a newline");
    if (/(?<!\\)\|/.test(clause)) problems.push('the clause cell holds an unescaped "|" (write "\\|")');
    for (const [form, re] of ADDRESS_FORMS) if (re.test(clause)) problems.push(`the clause cell holds ${form}`);
    const p = checkPointers(clause, rendered);
    problems.push(...p.problems);
    summary.pointers = p.pointers;
    summary.files = p.files;
  }
  summary.grade = typeof grade === "string" ? grade : null;
  summary.qualifies = typeof qualifies === "string" ? qualifies : null;
  summary.clause = typeof clause === "string" ? clause.replace(/\s+/g, " ").trim() : null;
  return summary;
}

/** The unified diff of two texts that differ only in whole lines replaced in place, zero lines of context. */
export function unifiedDiff(before, after, nl, name) {
  const a = before.split(nl);
  const b = after.split(nl);
  const out = [];
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === b[i]) continue;
    let j = i;
    while (j < a.length && a[j] !== b[j]) j += 1;
    const n = j - i;
    const range = n === 1 ? `${i + 1}` : `${i + 1},${n}`;
    out.push(`@@ -${range} +${range} @@`, ...a.slice(i, j).map((l) => `-${l}`), ...b.slice(i, j).map((l) => `+${l}`));
    i = j - 1;
  }
  return out.length ? [`--- ${name}`, `+++ ${name} (new)`, ...out] : [];
}

/** The row states of a table text, as rowState counts them. */
function rowStates(text, rendered) {
  const rows = parseAiAllowedTable(text);
  const captureExists = (rel) => existsSync(join(rendered, rel.replace(/^research\/rendered\//, "")));
  const counts = { graded: 0, awaiting: 0, unsettled: 0, "same-event": 0 };
  for (const row of rows) {
    // A row "listed again": another row has its URL and name (the builder's earlierTwins, without the quarters).
    const relisted = rows.some((o) => o !== row && o.url === row.url && o.name === row.name);
    counts[rowState(row, captureExists, relisted).state] += 1;
  }
  return counts;
}

function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      table: { type: "string", default: TABLE },
      rendered: { type: "string", default: RENDERED },
      apply: { type: "boolean", default: false },
      "no-tests": { type: "boolean", default: false },
      json: { type: "string" },
    },
  });
  if (positionals.length === 0) throw new Error("usage: node scripts/prize-apply-reading.mjs <workflow-output.json>... [--table <md>] [--rendered <dir>] [--apply] [--no-tests] [--json <out>]");
  const table = values.table;
  const rendered = values.rendered;

  const items = [];
  for (const source of positionals) {
    let json;
    try {
      json = JSON.parse(readFileSync(source, "utf8"));
    } catch (err) {
      throw new Error(`${source}: ${err.code === "ENOENT" ? "no such file" : "not JSON"}`);
    }
    itemsOf(json, source).forEach((it, index) => items.push({ source, index, ...checkItem(it, rendered) }));
  }

  const text = readFileSync(table, "utf8");
  const nl = text.includes("\r\n") ? "\r\n" : "\n";
  parseAiAllowedTable(text); // throws on a table the job did not write
  const lines = text.split(nl);

  // Which lines each key matches, and how many items name it.
  const at = new Map();
  lines.forEach((line, i) => {
    const key = rowKey(line);
    if (key !== null) at.set(key, [...(at.get(key) ?? []), i]);
  });
  const named = new Map();
  for (const it of items) named.set(it.key, (named.get(it.key) ?? 0) + 1);
  let keyProblem = false;
  for (const it of items) {
    if (it.key === "(no url)") continue;
    const rows = at.get(it.key)?.length ?? 0;
    if (rows !== 1) {
      keyProblem = true;
      it.problems.push(`the key matches ${rows} rows of the table (exactly one is wanted)`);
    }
    if (named.get(it.key) > 1) it.problems.push(`${named.get(it.key)} items for this key; one reading per event`);
  }

  // The new lines: only the three cells of each matched row; everything else byte for byte.
  const out = [...lines];
  const rows = parseAiAllowedTable(text);
  for (const it of items) {
    it.change = false;
    it.state = null;
    if (it.problems.length) continue;
    const i = at.get(it.key)[0];
    const cells = splitRow(lines[i]);
    cells[5] = it.clause;
    cells[6] = it.grade;
    cells[7] = it.qualifies;
    out[i] = `| ${cells.join(" | ")} |`;
    it.change = out[i] !== lines[i];
    const row = rows.find((r) => r.url === it.key);
    const captureExists = (rel) => existsSync(join(rendered, rel.replace(/^research\/rendered\//, "")));
    const state = rowState({ ...row, clause: it.clause, grade: it.grade, qualifies: it.qualifies }, captureExists);
    it.state = state.state;
    it.reasons = state.reasons ?? [];
  }
  const refused = items.filter((it) => it.problems.length);
  const changed = items.filter((it) => it.change).length;
  const next = out.join(nl);

  if (values.json) {
    const summary = items.map(({ source, index, key, event, grade, qualifies, gradeVerdict, readerGrade, pointers, files, change, state, reasons, problems }) => ({
      source, index, key, event, grade, qualifies, gradeVerdict, readerGrade, pointers, files, change, state, reasons: reasons ?? [], refused: problems,
    }));
    writeFileSync(values.json, `${JSON.stringify({ table, applied: values.apply && refused.length === 0, changed: refused.length ? 0 : changed, items: summary }, null, 2)}\n`);
  }

  if (refused.length) {
    for (const it of refused) for (const p of it.problems) console.error(`prize-apply-reading: refused: ${it.key} (${basename(it.source)} item ${it.index}): ${p}`);
    console.error(`prize-apply-reading: ${refused.length} of ${items.length} item(s) refused; nothing written`);
    return keyProblem ? 2 : 1;
  }

  for (const line of unifiedDiff(text, next, nl, table)) console.log(line);
  for (const it of items) {
    const state = it.state === "unsettled" ? `unsettled: ${it.reasons.join("; ")}` : it.state;
    console.log(
      `${it.key} → ${it.grade}/${it.qualifies}; ${it.pointers} pointer${it.pointers === 1 ? "" : "s"} checked (${it.files} file${it.files === 1 ? "" : "s"}); ` +
        `${it.change ? "changes the row" : "the row already holds these cells"}; row ${state}` +
        `${it.gradeVerdict ? `; verifier ${it.gradeVerdict}` : ""}`,
    );
  }

  if (!values.apply) {
    console.log(changed ? `prize-apply-reading: ${changed} row(s) would change (a dry run; --apply writes them)` : "prize-apply-reading: nothing to change");
    return changed ? 3 : 0;
  }

  if (changed) {
    const tmp = join(dirname(table), `.${basename(table)}.${process.pid}.tmp`);
    try {
      writeFileSync(tmp, next, { mode: statSync(table).mode });
      renameSync(tmp, table);
    } finally {
      rmSync(tmp, { force: true });
    }
    console.log(`prize-apply-reading: wrote ${changed} row(s) to ${table}`);
  } else {
    console.log("prize-apply-reading: nothing to change; the table is as it was");
  }
  const s = rowStates(next, rendered);
  console.log(`row states: graded ${s.graded}, awaiting ${s.awaiting}, unsettled ${s.unsettled}, same-event ${s["same-event"]}`);

  if (values["no-tests"]) return 0;
  const override = String(process.env.PRIZE_APPLY_TEST_CMD ?? "").trim();
  const [cmd, ...args] = override ? override.split(/ +/) : ["npx", "vitest", "run", ...PRIZE_TESTS];
  console.log(`prize tests: ${[cmd, ...args].join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: REPO_ROOT, stdio: ["ignore", "inherit", "inherit"] });
  const code = r.status ?? 1;
  console.log(`prize tests: ${r.error ? `could not run (${r.error.code})` : `exited ${code}`}`);
  return r.error ? 1 : code;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let code;
  try {
    code = main(process.argv.slice(2));
  } catch (err) {
    console.error(`prize-apply-reading: ${err.message}; nothing written`);
    code = 1;
  }
  process.exitCode = code;
}
