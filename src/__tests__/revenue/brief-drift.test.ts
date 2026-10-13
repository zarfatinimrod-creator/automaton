import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  buildReport,
  DRIFT,
  driftNoteLines,
  findDefinitions,
  findRow,
  formatText,
  isGeneric,
  lineFate,
  makeResolver,
  NEIGHBOUR_WINDOW,
  parseCli,
  pointer,
  rangeFate,
  scanCitations,
  skippedParts,
  treeHints,
} from "../../../scripts/brief-drift.mjs";

/**
 * scripts/brief-drift.mjs — do a sitting brief's file:line citations still point at the text they pointed at? Tick 67
 * checked the 8.10 brief's pointers with a temporary script (ledger.ts +12 from :414), tick 69 found 99 moved pointers
 * under rows 28 and 29 by hand. What must hold:
 *   - the scanner finds path:N, path:N-M, a bare :N after a name (its line, its paragraph, its table cell or caption), a
 *     short name the brief defines, a ruling's short name and "the note", and whole-file paths; an unknown or ambiguous
 *     path is reported, never dropped; a quotation's names and a describing possessive do not own the lines after them;
 *   - each cited line is same, moved N→K, ambiguous, changed, gone or invalid; a blank or `}` line is placed by its
 *     unique neighbours; a range that moved as one gets one summary;
 *   - --row reads one table row; no --tree is exit 1 with what the header says; drift is exit 3, none exit 0, a usage or
 *     read error exit 1; nothing is written.
 * The review's fixes (tick 70): a repeated line at its own number is placed by its neighbours, not kept "same"; a
 * whole-file citation is "present"; "invalid" is listed, not drift, unless a range's other lines moved; a binary
 * file's lines are not checked; headings are read; OTA:576/:578; a carried bare line says "carried from :N"; a line
 * after a possessive that is no file's is unattributed; "the document's own `:26`"; a phrase broken over two lines;
 * a short name for a file the tree lacks owns no bare line; pointer-housekeeping sections are skipped and listed; a
 * repeated --tree, --head or --row is a usage error; and the reviewer's 19 surviving one-off mutants are covered.
 * Tick 72: a drift note changes nothing about how another line is read (no definition, full path or directory is taken
 * from it, and it ends no paragraph or caption); no name or phrase holds a line reference; every line reference found
 * is in the report once (a "dropped" one with what swallowed it), and the report counts them; a bare line that rests
 * only on the last path named is marked without changing its file; a role the brief defines ("The test") owns a line
 * as its one word right before it ("test `:913-917`").
 * A throwaway git repository holds the trees; one read-only run on the real repository checks tick 67's +12, with
 * the brief read as tick 67 left it.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "brief-drift.mjs");

const scratch = realpathSync(mkdtempSync(join(tmpdir(), "brief-drift-test-")));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const EMPTY_GITCONFIG = join(scratch, "gitconfig");
writeFileSync(EMPTY_GITCONFIG, "");
const gitEnv = { GIT_CONFIG_GLOBAL: EMPTY_GITCONFIG, GIT_CONFIG_NOSYSTEM: "1", GIT_CEILING_DIRECTORIES: scratch };
const who = ["-c", "user.name=toy", "-c", "user.email=toy", "-c", "commit.gpgsign=false"];

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
}

function run(cwd: string, ...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

const write = (repo: string, rel: string, text: string) => {
  mkdirSync(dirname(join(repo, rel)), { recursive: true });
  writeFileSync(join(repo, rel), text);
};

// The tree: a.ts with blank and brace lines; the head inserts three lines after its first and changes one line.
const A_OLD = [
  "// a.ts: the fixture",
  "export function alpha() {",
  "  return 1;",
  "}",
  "",
  "export function beta() {",
  "  const b = 2;",
  "  return b;",
  "}",
  "",
  'export const gamma = "g";',
  'export const delta = "d";',
  'export const epsilon = "e";',
];
const A_NEW = [A_OLD[0], "// added 1", "// added 2", "// added 3", ...A_OLD.slice(1)].map((l) => (l === 'export const delta = "d";' ? 'export const delta = "D";' : l));

// A JSON file whose entries repeat a line: the head adds an entry first, so the old :7 (b's "checked") is now :11, and
// :7 holds the same text — the new entry's copy. Its neighbours, not its number, say where it went.
const REP_OLD = ["{", '  "a": {', '    "checked": "x",', '    "ok": 1', "  },", '  "b": {', '    "checked": "x",', '    "ok": 2', "  }", "}"];
const REP_NEW = ["{", '  "z": {', '    "checked": "x",', '    "ok": 0', "  },", ...REP_OLD.slice(1)];
// A range whose lines moved by two offsets, a blank line among them placed by its neighbours.
const RUNS_OLD = ["r1", "", "r2", "r3"];
const RUNS_NEW = ["x", "r1", "", "r2", "y", "r3"];
// A binary file (a NUL byte after its first one): no lines to compare.
const BINARY = Buffer.from("SQLite format 3\0\u0001\u0002 a database\nline two\n", "binary");

let repo = "";
let tree = "";
let head = "";

const BRIEF = (sha: string) =>
  [
    "# Brief for the test sitting",
    "",
    `**What this is.** An assembler wrote this file on \`${sha}\`. Nobody here rules.`,
    "",
    "**Short names.** `EX` is `src/a.ts`. \"The bee file\" is `b.md`. `ALPHA-RULING` is `b.md`.",
    "",
    "- Same: `b.md:2` and `b.md:2-3`.",
    "- Moved: `src/a.ts:2`, and the range `src/a.ts:6-9`; a continuation `:11` and, later in the sentence, :13.",
    "- Blank and brace: `src/a.ts:5`, `src/a.ts:4`.",
    "- Changed: `src/a.ts:12`; a mixed range `src/a.ts:11-13`.",
    "- Ambiguous: `c.ts:1`. Gone: `gone.md:1`. Invalid: `b.md:40`.",
    "- Unknown: `nope/missing.ts:3` and `dup.md:1`.",
    "- Not checked: OTA:5, :6; FOO-RULING `:7`; the note (`:8`).",
    "- Short names: EX:2, the bee file (`:3`), ALPHA-RULING `:1`.",
    "",
    ":9 has no name before it.",
    "",
    "> **[main thread] Pointer drift** since assembly: `b.md:99` is gone.",
    "",
    "| # | What |",
    "|---|---|",
    "| 7 | `src/a.ts:2` (and `:3`) |",
    "| 8 | `b.md:1` |",
    "",
  ].join("\n");

const QUEUE_BRIEF = "# Brief\n\n**What this is.** A checker re-opened every pointer against\nthe tree at `abc1234`.\n";
const QUEUE = [
  "# Queue",
  "",
  "| # | what |",
  "|---|---|",
  "| 5 | checked; read at `1234abc` |",
  "| 6 | see `research/channel-loop/SITTING-2026-01-01-BRIEF.md` |",
  "",
].join("\n");
// The statuses and forms the first brief does not hold.
const FATE2 = [
  "# Second brief",
  "",
  "- A repeated line at its own number: `data/rep.json:7`.",
  "- Whole files: `b.md`, `gone.md`, `state/bin.db`; a binary file's line `state/bin.db:2`.",
  "- CRLF read as LF: `crlf.txt:2`. One past the end: `b.md:4`.",
  "- Two offsets: `runs.ts:1-4`.",
  "- Partly past the end: `src/a.ts:12-14`.",
  "",
].join("\n");

beforeAll(() => {
  repo = join(scratch, "repo");
  mkdirSync(repo, { recursive: true });
  git(repo, "init", "-q");
  write(repo, "src/a.ts", `${A_OLD.join("\n")}\n`);
  write(repo, "b.md", "# b\nline two\nline three\n");
  write(repo, "c.ts", "x();\n");
  write(repo, "gone.md", "to be deleted\n");
  write(repo, "docs/dup.md", "one\n");
  write(repo, "notes/dup.md", "two\n");
  write(repo, "data/rep.json", `${REP_OLD.join("\n")}\n`);
  write(repo, "runs.ts", `${RUNS_OLD.join("\n")}\n`);
  write(repo, "crlf.txt", "one\r\ntwo\r\n");
  mkdirSync(join(repo, "state"), { recursive: true });
  writeFileSync(join(repo, "state", "bin.db"), BINARY);
  git(repo, "add", "-A");
  git(repo, ...who, "commit", "-q", "-m", "tree");
  tree = git(repo, "rev-parse", "HEAD").trim();
  write(repo, "src/a.ts", `${A_NEW.join("\n")}\n`);
  write(repo, "c.ts", "y();\nx();\nx();\n");
  write(repo, "data/rep.json", `${REP_NEW.join("\n")}\n`);
  write(repo, "runs.ts", `${RUNS_NEW.join("\n")}\n`);
  write(repo, "crlf.txt", "one\ntwo\n");
  git(repo, "rm", "-q", "gone.md");
  // A queue and the brief one of its rows names, committed: --row without --tree reads the row's last writer and the
  // brief's header ("the tree at", split from "against" as in the 9.10 brief).
  write(repo, "research/channel-loop/SITTING-2026-01-01-BRIEF.md", QUEUE_BRIEF);
  write(repo, "logs/Q.md", QUEUE);
  git(repo, "add", "-A");
  git(repo, ...who, "commit", "-q", "-m", "head");
  head = git(repo, "rev-parse", "HEAD").trim();
  write(repo, "brief.md", BRIEF(tree.slice(0, 7)));
  write(repo, "same.md", "Only `b.md:2-3` and `src/a.ts:1` here.\n");
  write(repo, "fate2.md", FATE2);
});

type Line = { line: number; status: string; newLine?: number; candidates?: number[]; via?: string; headText?: string | null; oldText?: string | null };
type Cit = { path: string; range: [number, number] | null; status: string; offset: number | null; newPointer: string | null; citedAt: number[]; via: string[]; lines: Line[] };
type Report = {
  files: { path: string; citations: Cit[] }[];
  unknown: { name: string; range: [number, number]; candidates: string[]; citedAt: number[] }[];
  unchecked: { name: string; range: [number, number]; citedAt: number[] }[];
  unattributed: { range: [number, number]; citedAt: number[] }[];
  skipped: number[];
  summary: { citations: Record<string, number>; lines: Record<string, number> };
  drifted: boolean;
  row: { n: number; line: number } | null;
};

const report = (...args: string[]): { status: number | null; json: Report; stderr: string } => {
  const r = run(repo, ...args, "--json");
  return { status: r.status, json: r.stdout ? JSON.parse(r.stdout) : (null as unknown as Report), stderr: r.stderr };
};
const cit = (rep: Report, path: string, range: [number, number] | null) =>
  rep.files.find((f) => f.path === path)?.citations.find((c) => JSON.stringify(c.range) === JSON.stringify(range));

describe("the cited lines' fate", () => {
  it("is same, moved, changed, gone, invalid and ambiguous", () => {
    const { status, json } = report("brief.md", "--tree", tree, "--head", head);
    expect(status).toBe(3);
    expect(json.drifted).toBe(true);
    expect(cit(json, "b.md", [2, 2])).toMatchObject({ status: "same", newPointer: ":2" });
    expect(cit(json, "b.md", [2, 3])).toMatchObject({ status: "same", offset: 0, newPointer: ":2-3" });
    expect(cit(json, "src/a.ts", [2, 2])).toMatchObject({ status: "moved", offset: 3, newPointer: ":5" });
    expect(cit(json, "src/a.ts", [12, 12])).toMatchObject({ status: "changed", newPointer: null });
    expect(cit(json, "src/a.ts", [12, 12])?.lines[0]).toMatchObject({ oldText: 'export const delta = "d";', headText: "}" });
    expect(cit(json, "c.ts", [1, 1])).toMatchObject({ status: "ambiguous" });
    expect(cit(json, "c.ts", [1, 1])?.lines[0].candidates).toEqual([2, 3]);
    expect(cit(json, "gone.md", [1, 1])).toMatchObject({ status: "gone" });
    expect(cit(json, "b.md", [40, 40])).toMatchObject({ status: "invalid" });
  });

  it("gives a range that moved as one a single offset, and a mixed range its worst line", () => {
    const { json } = report("brief.md", "--tree", tree, "--head", head);
    expect(cit(json, "src/a.ts", [6, 9])).toMatchObject({ status: "moved", offset: 3, newPointer: ":9-12" });
    expect(cit(json, "src/a.ts", [6, 9])?.lines.map((l) => l.newLine)).toEqual([9, 10, 11, 12]);
    const mixed = cit(json, "src/a.ts", [11, 13]);
    expect(mixed).toMatchObject({ status: "changed", offset: null, newPointer: null });
    expect(mixed?.lines.map((l) => l.status)).toEqual(["moved", "changed", "moved"]);
    const text = run(repo, "brief.md", "--tree", tree, "--head", head).stdout;
    expect(text).toContain("| :6-9 | brief.md:8 | moved 6-9→9-12 (+3) | :9-12 |");
    expect(text).toContain("| :11-13 | brief.md:10 | changed (1 of 3 lines) | — |");
    expect(text).toMatch(/\| ↳ :12 \| {2}\| changed \| was "export const delta = \\"d\\";"; now :12 is "}" \|/);
  });

  it("places a blank line and a lone brace by their unique neighbours", () => {
    const { json } = report("brief.md", "--tree", tree, "--head", head);
    expect(cit(json, "src/a.ts", [5, 5])).toMatchObject({ status: "moved", newPointer: ":8" });
    expect(cit(json, "src/a.ts", [5, 5])?.lines[0].via).toBe("neighbours");
    expect(cit(json, "src/a.ts", [4, 4])).toMatchObject({ status: "moved", newPointer: ":7" });
  });

  it("moves a repeated line that sits at its own number when its neighbours moved (review BLOCKING-1)", () => {
    // :7 at head holds the same text as the old :7, but it is the new entry's copy; the old entry is at :11.
    const { status, json } = report("fate2.md", "--tree", tree, "--head", head);
    expect(cit(json, "data/rep.json", [7, 7])).toMatchObject({ status: "moved", newPointer: ":11" });
    expect(cit(json, "data/rep.json", [7, 7])?.lines[0]).toMatchObject({ newLine: 11, via: "neighbours" });
    expect(status).toBe(3);
  });

  it("calls a whole-file citation present or gone, never same", () => {
    const { json } = report("fate2.md", "--tree", tree, "--head", head);
    expect(cit(json, "b.md", null)).toMatchObject({ status: "present", newPointer: "b.md", lines: [] });
    expect(cit(json, "gone.md", null)).toMatchObject({ status: "gone" });
    expect(json.summary.citations.present).toBeGreaterThanOrEqual(2);
  });

  it("does not compare a binary file's lines: they are not checked", () => {
    const { json } = report("fate2.md", "--tree", tree, "--head", head);
    expect(cit(json, "state/bin.db", null)).toMatchObject({ status: "present" });
    expect(cit(json, "state/bin.db", [2, 2])).toBeUndefined();
    expect(json.unchecked.find((u) => u.name === "state/bin.db")).toMatchObject({ range: [2, 2], citedAt: [4] });
    const text = run(repo, "fate2.md", "--tree", tree, "--head", head).stdout;
    expect(text).toContain("| state/bin.db:2 | fate2.md:4 | not checked (binary at --tree) | — |");
  });

  it("reads CRLF lines as LF, and a line past the last newline as invalid", () => {
    const { json } = report("fate2.md", "--tree", tree, "--head", head);
    expect(cit(json, "crlf.txt", [2, 2])).toMatchObject({ status: "same", newPointer: ":2" });
    // b.md is three lines and a final newline: there is no line 4.
    expect(cit(json, "b.md", [4, 4])).toMatchObject({ status: "invalid" });
  });

  it("lists a range's runs by offset, with the lines its neighbours placed counted", () => {
    const { json } = report("fate2.md", "--tree", tree, "--head", head);
    expect(cit(json, "runs.ts", [1, 4])).toMatchObject({ status: "moved", offset: null, newPointer: ":2-4, :6" });
    const text = run(repo, "fate2.md", "--tree", tree, "--head", head).stdout;
    expect(text).toContain("| :1-4 | fate2.md:6 | moved (4 of 4 lines), several offsets | :2-4, :6 |");
    expect(text).toContain("| ↳ :1-3 |  | moved +1 | :2-4 (1 of 3 by their neighbours) |");
    expect(text).toContain("| ↳ :4 |  | moved +2 | :6 |");
    // The cited-at column lists every place, up to twelve.
    expect(run(repo, "brief.md", "--tree", tree, "--head", head).stdout).toContain("| :2 (via EX) | brief.md:8, :14, :22 | moved 2→5 | :5 |");
  });

  it("is no drift for an invalid line alone, but drift when the lines a range does have moved", () => {
    write(repo, "invalid.md", "Only `b.md:40`.\n");
    const alone = report("invalid.md", "--tree", tree, "--head", head);
    expect(alone.status).toBe(0);
    expect(alone.json.files[0].citations[0]).toMatchObject({ status: "invalid" });
    // src/a.ts is 13 lines at the tree: :12 changed, :13 moved, :14 is past the end — invalid as a whole, yet drift.
    write(repo, "partly.md", "Only `src/a.ts:12-14`.\n");
    const partly = report("partly.md", "--tree", tree, "--head", head);
    expect(partly.json.files[0].citations[0]).toMatchObject({ status: "invalid" });
    expect(partly.json.files[0].citations[0].lines.map((l) => l.status)).toEqual(["changed", "moved", "invalid"]);
    expect(partly.status).toBe(3);
  });

  it("counts by status, citations and lines", () => {
    const { json } = report("brief.md", "--tree", tree, "--head", head);
    expect(json.summary.citations).toMatchObject({ gone: 1, invalid: 1, ambiguous: 1, "unknown path": 2 });
    expect(json.summary.lines.moved).toBeGreaterThanOrEqual(9);
    // A gone file's cited lines are counted, one by one.
    expect(json.summary.lines.gone).toBe(1);
    const text = run(repo, "brief.md", "--tree", tree, "--head", head).stdout;
    expect(text).toMatch(/^Summary: \d+ citation\(s\) — same \d+, present \d+, moved \d+, ambiguous 1, changed 2, invalid 1, gone 1, unknown path 2;/m);
    expect(text).toContain("Drift: yes (exit 3).");
  });
});

describe("lineFate and rangeFate", () => {
  it("is same at the same line, moved to the one other line, changed when absent", () => {
    expect(lineFate(["a", "b"], ["a", "b"], 2)).toMatchObject({ status: "same", newLine: 2 });
    expect(lineFate(["a", "b"], ["z", "a", "b"], 2)).toEqual({ line: 2, oldText: "b", status: "moved", newLine: 3 });
    expect(lineFate(["a", "b"], ["a", "c"], 2)).toMatchObject({ status: "changed", oldText: "b", headText: "c" });
    expect(lineFate(["a"], ["a"], 2)).toMatchObject({ status: "invalid" });
    expect(lineFate(["a"], ["a"], 0)).toMatchObject({ status: "invalid" });
  });

  it("keeps a repeated line at its own number as same, and places one the neighbours agree on", () => {
    expect(lineFate(["k", "x();", "m"], ["x();", "x();", "m"], 2)).toMatchObject({ status: "same", newLine: 2 });
    // At its own number, but a copy: both unique neighbours moved +2, so the old :4 is the "rep" at :6.
    expect(lineFate(["a", "rep", "b", "rep", "c"], ["x", "y", "a", "rep", "b", "rep", "c"], 4)).toMatchObject({ status: "moved", newLine: 6, via: "neighbours" });
    // With no unique neighbour anywhere the same text at its own number stays same.
    expect(lineFate(["rep", "rep"], ["rep", "rep"], 1)).toMatchObject({ status: "same", newLine: 1, via: "no unique neighbour" });
    // x(); is twice at head; the unique neighbours k and m both moved +1, so it is the one at 3.
    expect(lineFate(["k", "x();", "m"], ["x();", "k", "x();", "m"], 2)).toMatchObject({ status: "moved", newLine: 3, via: "neighbours" });
  });

  it("is ambiguous when two neighbours disagree and both places hold the text", () => {
    const fate = lineFate(["one", "", "two"], ["one", "", "x", "", "two"], 2);
    expect(fate).toMatchObject({ status: "ambiguous", via: "neighbours" });
    expect(fate.candidates).toEqual([2, 4]);
  });

  it("is changed for a blank line its neighbours place on another text", () => {
    expect(lineFate(["one", "", "two"], ["one", "x", "two"], 2)).toMatchObject({ status: "changed", headText: "x" });
    // The blank is still somewhere at head (line 4), but the neighbours put it where "x" is: changed, not ambiguous.
    expect(lineFate(["one", "", "two"], ["one", "x", "two", ""], 2)).toMatchObject({ status: "changed", headText: "x" });
  });

  it("falls back to the same line for a punctuation line with no unique neighbour, and otherwise lists its places", () => {
    expect(lineFate(["}", "}"], ["}", "}"], 1)).toMatchObject({ status: "same", via: "no unique neighbour" });
    expect(lineFate(["}", "}"], ["{", "}"], 1)).toMatchObject({ status: "ambiguous", candidates: [2] });
    expect(lineFate(["}"], ["{"], 1)).toMatchObject({ status: "changed" });
  });

  it("looks for a neighbour within the window only", () => {
    // The header says "within 20 lines".
    expect(NEIGHBOUR_WINDOW).toBe(20);
    const blanks = (n: number) => Array.from({ length: n }, () => "");
    // The only unique line is NEIGHBOUR_WINDOW lines up: in reach, so the brace moved with it.
    const near = ["anchor", ...blanks(NEIGHBOUR_WINDOW - 1), "}"];
    expect(lineFate(near, ["new", ...near], near.length)).toMatchObject({ status: "moved", newLine: near.length + 1, via: "neighbours" });
    // One line further: out of reach, so nothing places it and its one place at head is only a candidate.
    const far = ["anchor", ...blanks(NEIGHBOUR_WINDOW), "}"];
    expect(lineFate(far, ["new", ...far], far.length)).toMatchObject({ status: "ambiguous", candidates: [far.length + 1] });
  });

  it("does not take a neighbour that is not unique at both trees", () => {
    // "k" is twice in the old tree: no anchor; "m" is unique, and moved +1.
    expect(lineFate(["k", "k", "", "m"], ["k", "k", "z", "", "m"], 3)).toMatchObject({ status: "moved", newLine: 4 });
    // "k" is unique at head but twice in the old tree: not an anchor, so only "m" (+1) places the blank.
    expect(lineFate(["k", "k", "", "m"], ["z", "k", "", "", "m"], 3)).toMatchObject({ status: "moved", newLine: 4 });
    // "k" is unique in the old tree but twice at head: not an anchor either; "m" (+2) puts the blank on "x".
    expect(lineFate(["k", "", "m"], ["k", "", "k", "x", "m"], 2)).toMatchObject({ status: "changed", headText: "" });
  });

  it("treats only blank, punctuation and symbol lines as generic", () => {
    expect(["", "  ", "}", "*/", ");", "-->", "|---|"].every(isGeneric)).toBe(true);
    expect(["x", "} else {", "a;"].some(isGeneric)).toBe(false);
  });

  it("summarises a range by one offset, else by its worst line", () => {
    expect(rangeFate(["a", "b", "c"], ["z", "a", "b", "c"], [1, 3])).toMatchObject({ status: "moved", offset: 1, newPointer: ":2-4" });
    expect(rangeFate(["a", "b", "c"], ["a", "c", "z", "b"], [1, 3])).toMatchObject({ status: "moved", offset: null, newPointer: ":1-2, :4" });
    expect(rangeFate(["a", "b"], ["a"], [1, 2])).toMatchObject({ status: "changed", offset: null, newPointer: null });
    expect(rangeFate(["a", "b"], ["a", "b"], [2, 1])).toMatchObject({ status: "invalid" });
    expect(rangeFate(["a"], ["a"], [1, 2])).toMatchObject({ status: "invalid" });
  });

  it("writes line numbers as pointers", () => {
    expect(pointer([5, 3, 4, 9])).toBe(":3-5, :9");
    expect(pointer([7])).toBe(":7");
  });
});

describe("the scanner", () => {
  const resolver = makeResolver(new Set(["src/revenue/ledger.ts", "logs/CHANNEL_LOOP.md", "MISSION.md", "b.md", "x/BOARD.md", "y/BOARD.md", "src/__tests__/loop.test.ts", "src/__tests__/revenue/loop.test.ts", "scripts/r.ts", "docs/OWNER_STEPS.he.md", "research/channel-loop/RULING-2026-10-06-robots-and-terms.md", "LICENSE"]));
  const scan = (text: string, only: Set<number> | null = null) => scanCitations(text, resolver, { only }).refs;
  const files = (text: string) => scan(text).filter((r: { kind: string }) => r.kind === "file").map((r: { path: string; range: number[] | null }) => `${r.path}${r.range ? `:${r.range.join("-")}` : ""}`);

  it("reads path:N, path:N-M and N–M, a tail of a path, and the bare lines after it", () => {
    expect(files("See `src/revenue/ledger.ts:421-442`, `:445` and (`:487`); `ledger.ts:12–14`.")).toEqual([
      "src/revenue/ledger.ts:421-442",
      "src/revenue/ledger.ts:445-445",
      "src/revenue/ledger.ts:487-487",
      "src/revenue/ledger.ts:12-14",
    ]);
  });

  it("carries a bare line across the paragraph's lines and list items, never past a blank line", () => {
    const text = "- Rule (`MISSION.md:435-439`, heading\n  `:431`).\n- Next item (`:354`).\n\n(`:12`) after a blank line.";
    expect(files(text)).toEqual(["MISSION.md:435-439", "MISSION.md:431-431", "MISSION.md:354-354"]);
    expect(scan(text).filter((r: { kind: string }) => r.kind === "unattributed").map((r: { docLine: number }) => r.docLine)).toEqual([5]);
  });

  it("gives a whole-file citation to a path without a line, and none to a bare word or a directory", () => {
    expect(files("`MISSION.md` and src/revenue/ledger.ts; the word MISSION; the dir `src/revenue/`.")).toEqual(["MISSION.md", "src/revenue/ledger.ts"]);
  });

  it("reports a path that no file has, or several do, and never drops it", () => {
    const refs = scan("`nope/x.ts:3`, `BOARD.md:5`, `gone.md:2`; and/or :4.");
    const unknown = refs.filter((r: { kind: string }) => r.kind === "unknown").map((r: { name: string; range: number[]; candidates: string[] }) => [r.name, r.range[0], r.candidates.length]);
    expect(unknown).toEqual([
      ["nope/x.ts", 3, 0],
      ["BOARD.md", 5, 2],
      ["gone.md", 2, 0],
      ["gone.md", 4, 0],
    ]);
  });

  it("resolves a name several files have by the full path or the directory the document writes", () => {
    expect(files("The tests are under `src/__tests__/revenue/`; `loop.test.ts:9`.")).toEqual(["src/__tests__/revenue/loop.test.ts:9-9"]);
    expect(files("Full: `y/BOARD.md`. Bare: `BOARD.md:3`.")).toEqual(["y/BOARD.md", "y/BOARD.md:3-3"]);
  });

  it("reads the short names a document defines, and lets a ruling's name and the note own their lines", () => {
    const text = [
      "`EX` is `scripts/r.ts`. \"The loop ruling\" is `MISSION.md`. `r.ts` (\"the r script\"). `ledger.ts` and `b.md` are under `src/revenue/`.",
      "",
      "EX:4, and the loop ruling `:88`, loop ruling `:89`; the r script (`:5`).",
      "",
      "`b.md:2` then ROBOTS-RULING `:152-154`, the note's (`:7`), OTA:596, :598.",
      "",
      "`ledger.ts:3` and EX:6.",
    ].join("\n");
    const vias = scan(text).filter((r: { range: number[] | null }) => r.range && [3, 6].includes(r.range[0])).map((r: { path: string; via: string | null }) => [r.path, r.via]);
    expect(vias).toEqual([
      ["src/revenue/ledger.ts", null],
      ["scripts/r.ts", "EX"],
    ]);
    expect(files(text).filter((f: string) => /:/.test(f))).toEqual(["scripts/r.ts:4-4", "MISSION.md:88-88", "MISSION.md:89-89", "scripts/r.ts:5-5", "b.md:2-2", "src/revenue/ledger.ts:3-3", "scripts/r.ts:6-6"]);
    const unchecked = scan(text).filter((r: { kind: string }) => r.kind === "unchecked").map((r: { name: string; range: number[] }) => `${r.name}:${r.range[0]}`);
    expect(unchecked).toEqual(["ROBOTS-RULING:152", "the note:7", "OTA:596", "OTA:598"]);
  });

  it("gives a name several files have to the file a defined phrase names (\"a bare `BOARD.md:n` is the 7.9 board's\")", () => {
    // Both boards are written in full, so neither the full path nor a directory decides; the definition does.
    const text = "\"The 7.9 board\" is `x/BOARD.md`; the other is `y/BOARD.md`. A bare `BOARD.md:n` is the 7.9 board's.\n\nSee `BOARD.md:201`.";
    expect(files(text)).toContain("x/BOARD.md:201-201");
    expect(scan(text.replace("is the 7.9 board", "was the 7.9 board")).some((r: { kind: string; name?: string }) => r.kind === "unknown" && r.name === "BOARD.md")).toBe(true);
  });

  it("finds definitions only with a path-like target", () => {
    const { names, phrases } = findDefinitions("`copying` is `barred`. `EX` is `scripts/r.ts`. \"the box\" is `none`.", resolver);
    expect([...names.keys()]).toEqual(["EX"]);
    expect([...phrases.keys()]).toEqual([]);
  });

  it("does not let a quotation's names own a line written after the quotation", () => {
    const text = 'Row 27 is `logs/CHANNEL_LOOP.md:50`; it folds "into `b.md`, the page and its tests" (`:51`).';
    expect(files(text)).toEqual(["logs/CHANNEL_LOOP.md:50-50", "b.md", "logs/CHANNEL_LOOP.md:51-51"]);
    // Inside the quotation the quoted names still own their lines.
    expect(files('As written: "`b.md:1` and `:2`".')).toEqual(["b.md:1-1", "b.md:2-2"]);
    // A " between two Hebrew letters (gershayim) opens no quotation.
    expect(files('`MISSION.md:1` מע"מ "quoted `b.md`" (`:2`).')).toEqual(["MISSION.md:1-1", "b.md", "MISSION.md:2-2"]);
  });

  it("skips a phrase inside quotes, and a describing possessive", () => {
    const text = "\"The ledger\" is `src/revenue/ledger.ts`.\n\n`MISSION.md:269`: \"in the ledger\" (`:270`); the ledger's rule is set (`:271`). The ledger's own line is `:12`.";
    expect(files(text)).toEqual(["src/revenue/ledger.ts", "MISSION.md:269-269", "MISSION.md:270-270", "MISSION.md:271-271", "src/revenue/ledger.ts:12-12"]);
    expect(files("\"The ledger\" is `src/revenue/ledger.ts`.\n\nSee `MISSION.md:1` and the ledger's `:9`.")).toContain("src/revenue/ledger.ts:9-9");
    // Inside a quotation a phrase is the source's word: a quoted line after it stays the quoting file's.
    expect(files("\"The ledger\" is `src/revenue/ledger.ts`.\n\n`MISSION.md:1` says \"in the ledger (`:5`)\".")).toContain("MISSION.md:5-5");
  });

  it("gives a table row's line to a name in its own cell, else to the paragraph before the table", () => {
    const text = "**The steps** (`docs/OWNER_STEPS.he.md`).\n\n| step | where |\n|---|---|\n| one (`b.md:1`) | (`:60`) |\n| two | `MISSION.md:5`, `:6` |";
    expect(files(text)).toEqual(["docs/OWNER_STEPS.he.md", "b.md:1-1", "docs/OWNER_STEPS.he.md:60-60", "MISSION.md:5-5", "MISSION.md:6-6"]);
    const caption = scan(text).find((r: { range: number[] | null; via: string | null }) => r.range?.[0] === 60);
    expect(caption.via).toBe("caption :1");
  });

  it("skips a drift note in a blockquote and says so", () => {
    const text = "`b.md:1`\n\n> **[main thread] Pointer drift** (`b.md:9` → `:10`).\n> second line `b.md:11`\n\n> A quote `b.md:2`.";
    expect([...driftNoteLines(text.split("\n"))]).toEqual([3, 4]);
    const { refs, skipped } = scanCitations(text, resolver);
    expect(skipped).toEqual([3, 4]);
    expect(refs.map((r: { range: number[] }) => r.range[0])).toEqual([1, 2]);
  });

  it("reads a heading's own citations, and ends the paragraph there", () => {
    expect(files("## Part A (`b.md:2`)\n\n(`:3`) after a blank line.")).toEqual(["b.md:2-2"]);
    // A heading's name carries to no line after it, not even the next one.
    const text = "## The ledger (`src/revenue/ledger.ts`)\n(`:3`) right under it.";
    expect(files(text)).toEqual(["src/revenue/ledger.ts"]);
    expect(scan(text).filter((r: { kind: string }) => r.kind === "unattributed").map((r: { docLine: number }) => r.docLine)).toEqual([2]);
  });

  it("reads the line after a slash in OTA:576/:578", () => {
    const unchecked = scan("(OTA:576/:578; `MISSION.md:4`/`:5`).").filter((r: { kind: string }) => r.kind === "unchecked").map((r: { name: string; range: number[] }) => `${r.name}:${r.range[0]}`);
    expect(unchecked).toEqual(["OTA:576", "OTA:578"]);
    expect(files("`MISSION.md:4`/`:5`")).toEqual(["MISSION.md:4-4", "MISSION.md:5-5"]);
  });

  it("says when a bare line was carried from an earlier line of its paragraph", () => {
    const refs = scan("`MISSION.md:1` and `:2` here,\nthen (`:3`) on the next line.\n- An item (`:4`).").filter((r: { kind: string }) => r.kind === "file");
    expect(refs.map((r: { range: number[]; via: string | null }) => [r.range[0], r.via])).toEqual([
      [1, null],
      [2, null],
      [3, "carried from :1"],
      [4, "carried from :1"],
    ]);
    const viaPhrase = scan("\"The ledger\" is `src/revenue/ledger.ts`.\n\nThe ledger holds it\n(`:9`).").find((r: { range: number[] | null }) => r.range?.[0] === 9);
    expect(viaPhrase).toMatchObject({ path: "src/revenue/ledger.ts", via: "The ledger, carried from :3" });
  });

  it("leaves a line after a possessive that is no file's unattributed, and gives a file's possessive its line", () => {
    const text = "`EX` is `scripts/r.ts`.\n\n`MISSION.md:1`; the script's `:18`; `MISSION.md:395`'s (`:15`); EX's `:4`; `b.md`'s `:5`; the page's own `:7`.";
    const refs = scan(text);
    const unattributed = refs.filter((r: { kind: string }) => r.kind === "unattributed").map((r: { range: number[]; via: string }) => [r.range[0], r.via]);
    expect(unattributed).toEqual([
      [18, "after script's"],
      [15, "after `MISSION.md:395`'s"],
      [7, "after page's"],
    ]);
    expect(files(text).filter((f: string) => /:/.test(f))).toEqual(["MISSION.md:1-1", "MISSION.md:395-395", "scripts/r.ts:4-4", "b.md:5-5"]);
  });

  it("lets a phrase in the possessive own a line after \"own\", and a phrase broken across two lines", () => {
    expect(files("\"The ledger\" is `src/revenue/ledger.ts`.\n\nSee `MISSION.md:1` and the ledger's own `:9`.")).toContain("src/revenue/ledger.ts:9-9");
    // Through the phrase in the possessive, not through the role its one word also is since tick 72 (T70F-17).
    expect(scan("\"The ledger\" is `src/revenue/ledger.ts`.\n\nSee `MISSION.md:1` and the ledger's own `:9`.").find((r: { range: number[] | null }) => r.range?.[0] === 9)).toMatchObject({ path: "src/revenue/ledger.ts", via: "the ledger" });
    const text = "\"The read-back\" is `scripts/r.ts`.\n\n`MISSION.md:1` is the log call at the\n  read-back `:126-130` now.";
    const ref = scan(text).find((r: { range: number[] | null }) => r.range?.[0] === 126);
    expect(ref).toMatchObject({ path: "scripts/r.ts", via: "the read-back", docLine: 4 });
    // Across a paragraph's end (a heading, a blank line) it is no phrase. Since tick 72 the one word right before the
    // line is the role "The read-back" defines, so the :12 is the read-back's by that rule — never by "the read-back"
    // joined across the end, which its `via` would name.
    const across = (t: string) => scan(t).find((r: { range: number[] | null }) => r.range?.[0] === 12);
    expect(across("\"The read-back\" is `scripts/r.ts`.\n\n## At the\nread-back `:12`.")).toMatchObject({ path: "scripts/r.ts", via: 'role "The read-back" (as read-back)' });
    expect(across("\"The read-back\" is `scripts/r.ts`.\n\n`MISSION.md:1` at the\n\nread-back `:12`.")).toMatchObject({ path: "scripts/r.ts", via: 'role "The read-back" (as read-back)' });
  });

  it("gives no bare line to a short name or phrase for a file the tree does not have", () => {
    // "The output" is a run's file, not in the tree: the :5 beside it is the code's (here MISSION's) line.
    const text = "\"The output\" is `out/none.json`. `OUT` is `out/none.json`.\n\n`MISSION.md:1` writes the output (`:5`) and OUT (`:6`); OUT:7, and the\noutput (`:8`).";
    expect(files(text).filter((f: string) => /:/.test(f))).toEqual(["MISSION.md:1-1", "MISSION.md:5-5", "MISSION.md:6-6", "MISSION.md:8-8"]);
    expect(scan(text).filter((r: { kind: string }) => r.kind === "unknown").map((r: { name: string; range: number[] }) => `${r.name}:${r.range[0]}`)).toEqual(["out/none.json:7"]);
  });

  it("skips a pointer-housekeeping section to the next lead or heading, and lists it", () => {
    const text = [
      "`b.md:1`",
      "",
      "*Row 1's pointer drift* (repo):",
      "- `b.md:9` → `:10`.",
      "",
      "*Corrections the checker made to the clerks*:",
      "- `b.md:11`, not `:12`.",
      "",
      "*Pointers this brief corrected or added* [asm]:",
      "- `b.md:13`.",
      "*Other notes*",
      "`b.md:2`",
      "## Next",
      "*Pointer drift*",
      "`b.md:14`",
      "## After",
      "`b.md:3`",
      "*Pointer drift again*",
      "`b.md:15`",
      "***",
      "`b.md:4`",
    ].join("\n");
    const parts = skippedParts(text.split("\n"));
    expect(parts.parts.map((p: { line: number; lead?: string }) => `${p.line}:${p.lead}`)).toEqual([
      "3:*Row 1's pointer drift*",
      "6:*Corrections the checker made to the clerks*",
      "9:*Pointers this brief corrected or added*",
      "14:*Pointer drift*",
      "18:*Pointer drift again*",
    ]);
    const { refs, skipped, skippedParts: listed } = scanCitations(text, resolver);
    expect(refs.map((r: { range: number[] }) => r.range[0])).toEqual([1, 2, 3, 4]);
    expect(skipped).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 18, 19]);
    expect(listed).toHaveLength(5);
    // A bold lead that is not about pointers ends nothing and opens nothing.
    expect([...skippedParts("**Housekeeping for the fold.**\n`b.md:1`".split("\n")).lines]).toEqual([]);
  });

  it("finds a curly-quoted quotation's names, not the line after it", () => {
    expect(files("Row 27 is `logs/CHANNEL_LOOP.md:50`; it folds “into `b.md`, the page” (`:51`).")).toEqual(["logs/CHANNEL_LOOP.md:50-50", "b.md", "logs/CHANNEL_LOOP.md:51-51"]);
  });

  it("lists a path-like name without a line that the tree does not have, and skips a directory without its slash", () => {
    const unlisted = scan("See `nope/data.json` and `x/y.md`.").filter((r: { kind: string }) => r.kind === "unlisted").map((r: { name: string }) => r.name);
    expect(unlisted).toEqual(["nope/data.json", "x/y.md"]);
    expect(scan("The dirs `src/revenue` and `src/__tests__` hold them.")).toEqual([]);
  });

  it("takes the definition in force where a short name is used", () => {
    expect(files("`EX` is `scripts/r.ts`. EX:1.\n\nLater `EX` is `MISSION.md`. EX:2.").filter((f: string) => /:/.test(f))).toEqual(["scripts/r.ts:1-1", "MISSION.md:2-2"]);
  });

  it("reads a possessive phrase at the document's first line as a sentence's subject", () => {
    expect(files("The ledger's line is `:12`. \"The ledger\" is `src/revenue/ledger.ts`.")).toContain("src/revenue/ledger.ts:12-12");
  });

  it("gives a file named by a bare word only its lined citations", () => {
    expect(files("The LICENSE and LICENSE:3.")).toEqual(["LICENSE:3-3"]);
  });

  it("does not take a caption across a heading right before a table", () => {
    const text = "Para (`b.md`).\n## Heading\n| a |\n|---|\n| (`:3`) |";
    expect(scan(text).filter((r: { kind: string }) => r.kind === "unattributed").map((r: { docLine: number }) => r.docLine)).toEqual([5]);
  });

  it("skips URLs, times and an extension alone", () => {
    expect(scan("At 07:11 UTC, https://example.org/view?file=MISSION.md:5, a `.txt` and a `.md` file: 2026-10-07T20:33:58Z.")).toEqual([]);
  });

  it("reads only the asked row with --row's line set", () => {
    const text = "| # | x |\n|---|---|\n| 7 | `b.md:1` (`:2`) |\n| 8 | `MISSION.md:1` |";
    expect(findRow(text, 7)).toEqual({ line: 3, text: "| 7 | `b.md:1` (`:2`) |" });
    expect(findRow(text, 9)).toBeNull();
    expect(scan(text, new Set([3])).map((r: { path: string; range: number[] }) => `${r.path}:${r.range[0]}`)).toEqual(["b.md:1", "b.md:2"]);
  });

  // Tick 72 (CHANNEL_LOOP §9 tick-70 item (1b)): the tick-70 drift notes said "`:913-917` is `owner-steps.test.ts`",
  // and the scanner, reading definitions from the whole document, took ":913-917" for a short name: every later
  // `:913-917` was swallowed by it and listed nowhere. A drift note now changes nothing about how another line is read.
  const plain = (refs: { docLine?: number; index?: number }[]) => refs.map(({ docLine: _d, index: _i, ...r }) => r);

  it("reads no definition, full path or directory from a drift note (tick 72)", () => {
    const body = "`BOARD.md:3` and `loop.test.ts:9`; the bee (`:4`); `MISSION.md:1`, and the bee `:2`.";
    const note = "> **[main thread] Pointer drift**: `y/BOARD.md` and `src/__tests__/revenue/` hold them; `:4` is `b.md`; \"the bee\" is `scripts/r.ts`.";
    const before = scanCitations(`# T\n\n${body}\n`, resolver);
    const after = scanCitations(`# T\n\n${note}\n\n${body}\n`, resolver);
    expect(after.skipped).toEqual([3]);
    expect(plain(after.refs)).toEqual(plain(before.refs));
    // Read without the note: both names are several files', and the :4 is the last name's, `loop.test.ts`'s.
    expect(after.refs.filter((r: { kind: string }) => r.kind === "unknown").map((r: { name: string; range: number[] }) => `${r.name}:${r.range[0]}`)).toEqual(["BOARD.md:3", "loop.test.ts:9", "loop.test.ts:4"]);
    expect(files(`# T\n\n${note}\n\n${body}\n`)).toEqual(["MISSION.md:1-1", "MISSION.md:2-2"]);
  });

  it("finds no short name or phrase that holds a line reference (tick 72)", () => {
    const { names, phrases } = findDefinitions("`:913-917` is `b.md`. `MISSION.md:4` is `b.md`. \"the pin at :5\" is `b.md`. `EX` is `scripts/r.ts`. \"The pin\" is `b.md`.", resolver);
    expect([...names.keys()]).toEqual(["EX"]);
    expect([...phrases.keys()]).toEqual(["The pin"]);
    // So the pointer in such a sentence is read as a pointer, never as a name.
    expect(files("`MISSION.md:1`; `:913-917` is `b.md`.\n\nSee `MISSION.md:2` and `:913-917`.")).toEqual(["MISSION.md:1-1", "MISSION.md:913-917", "b.md", "MISSION.md:2-2", "MISSION.md:913-917"]);
  });

  it("reads a paragraph and a table's caption across a drift note as if the note were not there (tick 72)", () => {
    const body = ["- An item (`MISSION.md:1`)", "- next item (`:2`).", "", "**The steps** (`b.md`).", "", "| step | where |", "|---|---|", "| one | (`:3`) |"];
    const before = scanCitations(body.join("\n"), resolver);
    const withNotes = [body[0], "> **Pointer drift**: `:2` moved.", body[1], body[2], body[3], body[4], "> A drift note: `:3` is fine.", "", ...body.slice(5)].join("\n");
    const after = scanCitations(withNotes, resolver);
    expect(after.skipped).toEqual([2, 7]);
    expect(files(withNotes)).toEqual(["MISSION.md:1-1", "MISSION.md:2-2", "b.md", "b.md:3-3"]);
    // The carry names the line it came from, so only that number moves.
    const norm = (refs: { via?: string | null }[], text: string) => plain(refs).map((r: { via?: string | null }) => ({ ...r, via: r.via?.replace(/:(\d+)/g, (_, n) => `«${text.split("\n")[Number(n) - 1]}»`) ?? null }));
    expect(norm(after.refs, withNotes)).toEqual(norm(before.refs, body.join("\n")));
  });

  it("reads the line before a drift note as the previous line: a sentence's start, a phrase over two lines, a carry (tick 72)", () => {
    const body = [
      "\"The ledger\" is `src/revenue/ledger.ts`. \"The read-back\" is `scripts/r.ts`.",
      "",
      "See `MISSION.md:1` here.",
      "The ledger's rule is at `:12`; `MISSION.md:2` is the log call at the",
      "read-back `:126-130` now; `MISSION.md:435-439`, heading",
      "`:431`.",
    ];
    const withNotes = [...body.slice(0, 3), "> **Pointer drift**: moved", body[3], "> drift note: `:9` gone", body[4], "> drift, again", body[5]].join("\n");
    const before = scanCitations(body.join("\n"), resolver);
    const after = scanCitations(withNotes, resolver);
    expect(after.skipped).toEqual([4, 6, 8]);
    const norm = (refs: { via?: string | null }[], text: string) => plain(refs).map((r: { via?: string | null }) => ({ ...r, via: r.via?.replace(/:(\d+)/g, (_, n) => `«${text.split("\n")[Number(n) - 1]}»`) ?? null }));
    expect(norm(after.refs, withNotes)).toEqual(norm(before.refs, body.join("\n")));
    // What the lines say: "The ledger's" starts a sentence, "the⏎read-back" is one phrase, and ", heading⏎`:431`"
    // ties the :431 to MISSION.md.
    const at = (n: number) => after.refs.find((r: { range: number[] | null }) => r.range?.[0] === n);
    expect(at(12)).toMatchObject({ path: "src/revenue/ledger.ts", via: "The ledger" });
    expect(at(126)).toMatchObject({ path: "scripts/r.ts", via: "the read-back" });
    expect(at(431)).toMatchObject({ path: "MISSION.md", lastPathNamed: false });
  });

  it("counts no line reference inside a URL, and drops none there (tick 72)", () => {
    const out = scanCitations("See https://example.org/v1/:5 and `MISSION.md:1`.", resolver);
    expect(out.refs.map((r: { kind: string; range: number[] | null }) => `${r.kind}:${r.range?.[0]}`)).toEqual(["file:1"]);
    expect(out.pointers).toBe(1);
  });

  it("lists a line reference a mark swallowed as dropped, with the reason, never silently (tick 72)", () => {
    // No definition the scanner finds can hold a line reference now; a definition handed in can, which is how a
    // future way of swallowing one would look. It is reported, and the count of line references still adds up.
    const definitions = { names: new Map([[":5", [{ index: 0, target: { path: "b.md" } }]]]), phrases: new Map() };
    const out = scanCitations("`MISSION.md:1` and `:5`, `:6`.", resolver, { definitions });
    expect(out.refs.map((r: { kind: string; range: number[] }) => `${r.kind}:${r.range[0]}`)).toEqual(["file:1", "dropped:5", "file:6"]);
    expect(out.refs.find((r: { kind: string }) => r.kind === "dropped")).toMatchObject({ written: ":5", docLine: 1, via: 'inside ":5"' });
    expect(out.pointers).toBe(3);
    expect(scanCitations("`MISSION.md:1` and `:5`, `:6`.", resolver).pointers).toBe(3);
  });

  // Tick 72 (§9 tick-70 item (1)): a bare `:N` goes to the last name before it, which prose often means otherwise
  // ("**Revocation.** … (`:50-72`)" after a list of logs; "`t1Passed` (`:32`, `:246`)" after the read-back).
  const flagged = (refs: { kind: string; range: number[] | null; lastPathNamed?: boolean; path?: string }[]) =>
    refs.filter((r) => r.range && r.lastPathNamed).map((r) => `${r.path ?? r.kind}:${r.range?.[0]}`);

  it("marks a bare line that rests only on the last path named before it, and gives it to the same file (tick 72)", () => {
    const text = [
      "\"The read-back\" is `scripts/r.ts`.",
      "",
      "- **The gates.** The read-back refuses unless the verdict holds; the verdict is CONDITIONAL_UNMET (`b.md:263`),",
      "  checked then (`:265`). It refuses next without the key (`:133-137`). It checks the host (`:161`).",
      "- **Revocation.** The token is refreshed every run (`:50-72`).",
      "- **One type.** `Readings` (`ledger.ts:20-69`) holds the read-back `madeForKids` (`:66`), which K0 reads (`:311-342`).",
      "",
      "Attached: `MISSION.md:435-439`, heading",
      "`:431`; `ledger.ts:421-442`, `:445` and (`:487`); the read-back's `:99-103`; the read-back (`:11-13`, `:101`).",
    ].join("\n");
    const refs = scan(text);
    expect(flagged(refs)).toEqual(["b.md:265", "b.md:133", "b.md:161", "b.md:50", "scripts/r.ts:66", "scripts/r.ts:311"]);
    // The mark changes no attribution: each line goes where it went before.
    expect(files(text).filter((f: string) => /:/.test(f))).toEqual([
      "b.md:263-263",
      "b.md:265-265",
      "b.md:133-137",
      "b.md:161-161",
      "b.md:50-72",
      "src/revenue/ledger.ts:20-69",
      "scripts/r.ts:66-66",
      "scripts/r.ts:311-342",
      "MISSION.md:435-439",
      "MISSION.md:431-431",
      "src/revenue/ledger.ts:421-442",
      "src/revenue/ledger.ts:445-445",
      "src/revenue/ledger.ts:487-487",
      "scripts/r.ts:99-103",
      "scripts/r.ts:11-13",
      "scripts/r.ts:101-101",
    ]);
    // A line right after its name, its possessive or a list of the name's lines is the name's own.
    expect(refs.find((r: { range: number[] | null }) => r.range?.[0] === 431)).toMatchObject({ via: "carried from :8", lastPathNamed: false });
    // A table's caption is the last path named too; a name in its own cell is not.
    const table = scan("**The steps** (`b.md`).\n\n| step | where |\n|---|---|\n| one | (`:3`) |\n| two | `MISSION.md:5`, `:6` |");
    expect(flagged(table)).toEqual(["b.md:3"]);
    // A backticked name's possessive ties its line too, the closing backtick or bracket before it (tick 72 review).
    const possessive = "`src/revenue/ledger.ts`'s `:5` and `b.md`'s own `:6`; (`MISSION.md`)'s (`:7`).";
    expect(files(possessive).filter((f: string) => /:/.test(f))).toEqual(["src/revenue/ledger.ts:5-5", "b.md:6-6", "MISSION.md:7-7"]);
    expect(flagged(scan(possessive))).toEqual([]);
  });

  it("resolves a role the brief defines when it stands right before the line (\"test `:913-917`\") (tick 72)", () => {
    const text = [
      "\"The test\" is `src/__tests__/loop.test.ts`. \"The ledger\" is `src/revenue/ledger.ts`.",
      "",
      "- Pinned (`MISSION.md:274-279`, pinned at test `:913-917`; and Test's `:5`).",
      "- `b.md:1`; a test passes (`:6`), and the test `:7`; ledger (`:8`); \"at test `:9`\" quoted.",
    ].join("\n");
    const refs = scan(text);
    const at = (n: number) => refs.find((r: { range: number[] | null }) => r.range?.[0] === n);
    expect(at(913)).toMatchObject({ kind: "file", path: "src/__tests__/loop.test.ts", via: 'role "The test" (as test)', lastPathNamed: false });
    expect(at(5)).toMatchObject({ path: "src/__tests__/loop.test.ts", via: 'role "The test" (as Test)' });
    // "a test passes (`:6`)": the word is not right before the line, so it is no role; the line is the last path's.
    expect(at(6)).toMatchObject({ path: "b.md", lastPathNamed: true });
    expect(at(7)).toMatchObject({ path: "src/__tests__/loop.test.ts", via: "the test" });
    expect(at(8)).toMatchObject({ path: "src/revenue/ledger.ts", via: 'role "The ledger" (as ledger)' });
    // Inside a quotation the word is the source's: no role. Since the tick-72 review a role's mark owns only its own
    // line, so the quoted :9 is no longer "ledger"'s either; it rests on the last name before it that is no role.
    expect(at(9)).toMatchObject({ path: "src/__tests__/loop.test.ts", via: "the test", lastPathNamed: true });
    expect(scan("\"The test\" is `src/__tests__/loop.test.ts`.\n\n`MISSION.md:1` says \"at test `:9`\".").find((r: { range: number[] | null }) => r.range?.[0] === 9)).toMatchObject({ path: "MISSION.md" });
    // Two definitions that disagree are no role: never a guess.
    const two = scan("\"The test\" is `src/__tests__/loop.test.ts`.\n\nLater \"the test\" is `src/__tests__/revenue/loop.test.ts`.\n\n`MISSION.md:1`, test `:9`.");
    expect(two.find((r: { range: number[] | null }) => r.range?.[0] === 9)).toMatchObject({ path: "MISSION.md", lastPathNamed: true });
    // A role for a file the tree does not have resolves nothing.
    const none = scan("\"The output\" is `out/none.json`.\n\n`MISSION.md:1`, output `:9`.");
    expect(none.find((r: { range: number[] | null }) => r.range?.[0] === 9)).toMatchObject({ path: "MISSION.md" });
  });

  // Tick 72 review, blocking: the role rule took any defined "the X"'s one word X wherever it stood right before a line,
  // whatever qualified it, and the mark then carried to later lines.
  it("lets a role's word own a line only where it stands bare, and only that line and its list (tick 72 review)", () => {
    const at = (refs: { range: number[] | null }[], n: number) => refs.find((r) => r.range?.[0] === n);
    // SITTING-2026-10-08-BRIEF.md:664: "the tool's page" is a page of a tool, no role "the page": the line stays the
    // test file's (it was given to a page of 95 lines, "invalid", unmarked).
    const page = scan("\"The page\" is `scripts/r.ts`.\n\n(`src/revenue/ledger.ts:166`); the figures note points to the tool's page (`:167-169`).");
    expect(at(page, 167)).toMatchObject({ path: "src/revenue/ledger.ts", lastPathNamed: true });
    // The same with the modifier at the end of the line before.
    const broken = scan("\"The page\" is `scripts/r.ts`.\n\n(`src/revenue/ledger.ts:166`); it points to the tool's\npage (`:167-169`).");
    expect(at(broken, 167)).toMatchObject({ path: "src/revenue/ledger.ts", lastPathNamed: true });
    // Another article, a modifier, or a name before the word: prose.
    const test = scan("\"The test\" is `src/__tests__/loop.test.ts`.\n\n`MISSION.md:1`; a test (`:8`); the portfolio test `:7`.\n\n`src/revenue/ledger.ts:3` test `:10`.");
    expect(at(test, 8)).toMatchObject({ path: "MISSION.md", lastPathNamed: true });
    expect(at(test, 7)).toMatchObject({ path: "MISSION.md", lastPathNamed: true });
    expect(at(test, 10)).toMatchObject({ path: "src/revenue/ledger.ts", lastPathNamed: true });
    // SITTING-2026-10-01-BRIEF.md:695-697: the role owns its `:547-548` and the next item's `:550`; the next item's
    // `:227` is the capture's, carried from :3 — never from the role's mark on :4.
    const note = scan([
      "\"The note\" is `MISSION.md`.",
      "",
      "- The checkbox sits in the organisation section (`logs/CHANNEL_LOOP.md:335`, `:265`,",
      "  under the heading at `:259`; note `:547-548`).",
      "- Their product example is Codespaces (`:227`; note `:550`).",
    ].join("\n"));
    expect(at(note, 547)).toMatchObject({ path: "MISSION.md", via: 'role "The note" (as note)' });
    expect(at(note, 550)).toMatchObject({ path: "MISSION.md", via: 'role "The note" (as note)' });
    expect(at(note, 227)).toMatchObject({ path: "logs/CHANNEL_LOOP.md", via: "carried from :3", lastPathNamed: true });
    // Where it stands bare it owns its line and the lines listed right after it; a line with a word between is not its,
    // nor is the next line's, nor a table's caption.
    const list = scan([
      "\"The test\" is `src/__tests__/loop.test.ts`.",
      "",
      "- `MISSION.md:1` holds it (test `:149`, `:400`); `heldRows` (test `:979-988`, comment `:302-306`).",
      "- Pinned at test `:913-917`.",
      "  Then (`:5`).",
      "",
      "| step | test |",
      "|---|---|",
      "| one | test `:479-487`, `:517-542` |",
      "",
      "Para, test `:20`.",
      "",
      "| a |",
      "|---|",
      "| (`:30`) |",
    ].join("\n"));
    for (const n of [149, 400, 979, 913, 479, 517, 20]) expect(at(list, n), `:${n}`).toMatchObject({ path: "src/__tests__/loop.test.ts", lastPathNamed: false });
    expect(at(list, 302)).toMatchObject({ path: "MISSION.md", lastPathNamed: true });
    expect(at(list, 5)).toMatchObject({ path: "MISSION.md", via: "carried from :3", lastPathNamed: true });
    expect(at(list, 30)).toMatchObject({ kind: "unattributed" });
    // The word owns a line only right before it (its possessive, a bracket or a backtick between): "test, `:5`" is no
    // role's line, though the comma alone would tie a list.
    const comma = scan("\"The test\" is `src/__tests__/loop.test.ts`.\n\n`MISSION.md:1` and test, `:5`.");
    expect(at(comma, 5)).toMatchObject({ path: "MISSION.md", lastPathNamed: true });
    // At an item's start the word stands bare, whatever ended the line before.
    const item = scan("\"The test\" is `src/__tests__/loop.test.ts`.\n\n- `MISSION.md:2` holds it\n- Test `:7` too.");
    expect(at(item, 7)).toMatchObject({ path: "src/__tests__/loop.test.ts", via: 'role "The test" (as Test)' });
  });

  it("reads a phrase that holds a clock time as a definition: no line reference is in it (tick 72 review)", () => {
    const { names, phrases } = findDefinitions("\"The 05:23 schedule\" is `scripts/r.ts`. \"the 1:2 split\" is `b.md`. `T1:5` is `b.md`. \"the pin at :5\" is `b.md`.", resolver);
    expect([...phrases.keys()]).toEqual(["The 05:23 schedule", "the 1:2 split"]);
    // `T1:5` holds a line, as the scanner reads it: no name.
    expect([...names.keys()]).toEqual([]);
    const ref = scan("\"The 05:23 schedule\" is `scripts/r.ts`.\n\n`MISSION.md:1`; the 05:23 schedule (`:40`).").find((r: { range: number[] | null }) => r.range?.[0] === 40);
    expect(ref).toMatchObject({ path: "scripts/r.ts", via: "the 05:23 schedule", lastPathNamed: false });
  });

  it("reports a name's own line that no file has, a directory's, one inside another mark and a fence line's (tick 72 review)", () => {
    const text = [
      "`MISSION.md:1`; T1:5, R6:3 and v2:7, `v1.2:3`; the dir `src/revenue:12`, `src/revenue/:13`, `:14`; ALPHA-RULING.md:6 and ROBOTS-RULING:152.",
      "",
      "```ts `b.md:9` and :10 https://example.org/view?file=x.md:5 https://example.org/v1/:7",
      "`b.md:2`",
      "```",
      "",
      "At 07:11 on 2026-10-07T20:33:58Z or 2026-10-07T20:33 UTC, sha256:12ab and https://example.org/x.md:5 nothing.",
    ].join("\n");
    const out = scanCitations(text, resolver);
    const seen = out.refs.map((r: { kind: string; name?: string; path?: string; range: number[]; via?: string | null }) => `${r.kind}:${r.name ?? r.path ?? ""}:${r.range[0]}:${r.via ?? ""}`);
    expect(seen).toEqual([
      "file:MISSION.md:1:",
      "unchecked:T1:5:T1",
      "unchecked:R6:3:R6",
      "unchecked:v2:7:v2",
      "unchecked:v1.2:3:v1.2",
      "unchecked:src/revenue:12:a directory",
      "unchecked:src/revenue:13:a directory",
      "unchecked:src/revenue:14:a directory",
      'dropped::6:inside "ALPHA-RULING"',
      "unchecked:ROBOTS-RULING:152:ROBOTS-RULING",
      "dropped::9:on a fence line",
      "dropped::10:on a fence line",
      "file:b.md:2:",
    ]);
    // Every one is counted: found is what the report holds, and a time, a hash or a URL is none.
    expect(out.pointers).toBe(13);
    // A --row reads the fence line's count only when it is the row's line.
    expect(scanCitations(text, resolver, { only: new Set([3]) }).pointers).toBe(2);
    expect(scanCitations(text, resolver, { only: new Set([4]) }).pointers).toBe(1);
  });
});

describe("the report's account of every line reference (tick 72)", () => {
  // A brief, and the same brief with three drift notes: under the title (it defines short names and writes a full
  // path), inside a list, and between a paragraph and the table it captions.
  const BEFORE = [
    "# Brief for the note test",
    "",
    "**What this is.** An assembler wrote this file on `TREE`.",
    "",
    "**Short names.** \"The bee file\" is `b.md`.",
    "",
    "- Moved: `src/a.ts:2`, and a continuation `:6-9`.",
    "- The bee file (`:2`), and the pin at `:3`.",
    "- An item (`src/a.ts:11`)",
    "- next item (`:13`).",
    "- Several files: `dup.md:1`, and `b.md:2` with `b.md:2` again.",
    "",
    "**The steps** (`src/a.ts`).",
    "",
    "| step | where |",
    "|---|---|",
    "| one | (`:5`) |",
    "",
    "`c.ts:1` and the end.",
    "",
  ];
  const NOTE_TOP = [
    "> **[main thread] Pointer drift since assembly.** `:6-9` is `b.md`; \"the pin\" is `c.ts`; `notes/dup.md:1` holds one;",
    ">",
    "> and `:13` is `c.ts`; `src/a.ts:2` moved to `:5`.",
    "",
  ];
  const AFTER = [
    ...BEFORE.slice(0, 2),
    ...NOTE_TOP,
    ...BEFORE.slice(2, 9),
    "> **Pointer drift**: `:13` moved.",
    ...BEFORE.slice(9, 13),
    "> A drift note: `:5` is `b.md`.",
    "",
    ...BEFORE.slice(13),
  ];
  type Group = { range: [number, number] | null; citedAt: number[]; via: string[]; status?: string; occurrences: number; lastPathNamed: number[] };
  type Full = Report & { dropped: Group[]; unlisted: Group[]; summary: { pointers: { found: number; reported: number }; dropped: number; lastPathNamed: number } };
  const keyed = (json: Full, text: string) => {
    const lines = text.split("\n");
    const via = (v: string[]) => v.map((s) => s.replace(/:(\d+)/g, (_, n) => `«${lines[Number(n) - 1]}»`)).sort();
    const out: string[] = [];
    const add = (cat: string, owner: string, g: Group) => {
      for (const at of g.citedAt) out.push(JSON.stringify([cat, owner, g.range, g.status ?? null, lines[at - 1], via(g.via), g.occurrences, g.lastPathNamed.map((n) => lines[n - 1])]));
    };
    for (const f of json.files) for (const c of f.citations as unknown as Group[]) add("file", f.path, c);
    for (const u of json.unknown as unknown as (Group & { name: string })[]) add("unknown", u.name, u);
    for (const u of json.unchecked as unknown as (Group & { name: string })[]) add("unchecked", u.name, u);
    for (const u of json.unattributed as unknown as Group[]) add("unattributed", "", u);
    for (const u of json.dropped) add("dropped", "", u);
    return out.sort();
  };
  // The line references as a reader counts them: every `:N`, `:N-M` on a line that is not a drift note's.
  const tokens = (text: string) => text.split("\n").filter((l) => !l.startsWith(">")).reduce((n, l) => n + (l.match(/:\d+(?:-\d+)?/g) ?? []).length, 0);
  const total = (json: Full) => {
    const groups = [...json.files.flatMap((f) => f.citations as unknown as Group[]).filter((c) => c.range), ...(json.unknown as unknown as Group[]), ...(json.unchecked as unknown as Group[]), ...(json.unattributed as unknown as Group[]), ...json.dropped];
    return groups.reduce((n, g) => n + g.occurrences, 0);
  };

  it("gives the same citations, keyed by their lines' text, with a drift note inserted above them", () => {
    const before = BEFORE.join("\n").replace("TREE", tree.slice(0, 7));
    const after = AFTER.join("\n").replace("TREE", tree.slice(0, 7));
    write(repo, "note-before.md", before);
    write(repo, "note-after.md", after);
    const a = report("note-before.md", "--tree", tree, "--head", head);
    const b = report("note-after.md", "--tree", tree, "--head", head);
    expect(b.status).toBe(a.status);
    expect(b.json.skipped).toEqual([3, 4, 5, 14, 19]);
    expect(keyed(b.json as Full, after)).toEqual(keyed(a.json as Full, before));
    // What the brief says without the notes: the continuation is a.ts's, the pin the bee file's, dup.md several files'.
    expect(cit(b.json, "src/a.ts", [6, 9])).toMatchObject({ status: "moved" });
    expect(cit(b.json, "b.md", [3, 3])).toMatchObject({ via: ["The bee file", "last path named"] });
    expect(cit(b.json, "src/a.ts", [13, 13])).toBeDefined();
    expect(cit(b.json, "src/a.ts", [5, 5])?.via).toContain("caption :18");
    expect(b.json.unknown.map((u) => u.name)).toEqual(["dup.md"]);
  });

  it("counts every line reference it found, and the report holds as many", () => {
    for (const [file, lines] of [["note-before.md", BEFORE], ["note-after.md", AFTER]] as const) {
      const { json } = report(file, "--tree", tree, "--head", head);
      const full = json as Full;
      expect(full.summary.pointers.found, file).toBe(tokens(lines.join("\n")));
      expect(full.summary.pointers.reported, file).toBe(full.summary.pointers.found);
      expect(total(full), file).toBe(full.summary.pointers.found);
      expect(full.summary.dropped).toBe(0);
      // `b.md:2` twice on one line is one citation of two occurrences.
      expect((cit(json, "b.md", [2, 2]) as unknown as Group).occurrences).toBe(3);
    }
    const brief = report("brief.md", "--tree", tree, "--head", head).json as Full;
    expect(total(brief)).toBe(brief.summary.pointers.found);
    expect(brief.summary.pointers.found).toBe(tokens(BRIEF(tree.slice(0, 7))));
    expect(brief.summary.pointers.found).toBe(26);
    // --row counts the row's line only.
    expect((report("brief.md", "--tree", tree, "--head", head, "--row", "7").json as Full).summary.pointers).toEqual({ found: 2, reported: 2 });
    const text = run(repo, "note-after.md", "--tree", tree, "--head", head).stdout;
    expect(text).toContain("Line references: 11 found, 11 in this report (dropped 0).");
  });

  it("lists and counts the attributions that rest only on the last path named, and changes no status", () => {
    write(repo, "last.md", "`src/a.ts:2` holds it; the code refreshes it (`:3`).\n- An item (`b.md:2`)\n- the next (`:3`), and `:2`.\n");
    const { status, json } = report("last.md", "--tree", tree, "--head", head);
    const full = json as Full;
    expect(status).toBe(3);
    expect(cit(json, "src/a.ts", [3, 3])).toMatchObject({ status: "moved", newPointer: ":6", via: ["last path named"], lastPathNamed: [1] });
    expect(cit(json, "b.md", [3, 3])).toMatchObject({ status: "same", via: ["carried from :2", "last path named"], lastPathNamed: [3] });
    expect(cit(json, "src/a.ts", [2, 2])).toMatchObject({ via: [], lastPathNamed: [] });
    expect(full.summary.lastPathNamed).toBe(3);
    const text = run(repo, "last.md", "--tree", tree, "--head", head).stdout;
    expect(text).toContain("### resting only on the last path named (check these first)");
    expect(text).toContain("| src/a.ts:3 | last.md:1 | moved 3→6 | :6 |");
    expect(text).toContain("| b.md:2 | last.md:3 | same | :2 |");
    expect(text).toContain("3 attribution(s) rest only on the last path named before the line");
  });

  it("prints a dropped line reference in its own section", () => {
    const rep = {
      file: "x.md",
      row: null,
      tree: { ref: "t", sha: "a".repeat(40) },
      head: { ref: "h", sha: "b".repeat(40) },
      skipped: [],
      skippedParts: [],
      files: [],
      unknown: [],
      unchecked: [],
      unattributed: [],
      dropped: [{ range: [5, 5], citedAt: [1], written: [":5"], via: ['inside ":5"'], occurrences: 1, lastPathNamed: [] }],
      unlisted: [],
      summary: { citations: {}, lines: {}, unchecked: 0, unattributed: 0, unlisted: 0, dropped: 1, lastPathNamed: 0, pointers: { found: 1, reported: 1 } },
      drifted: false,
    };
    const text = formatText(rep);
    expect(text).toContain("### dropped (a line reference the scanner found and gave to no file: a scanner defect, read it by hand)");
    expect(text).toContain('| :5 (inside ":5") | x.md:1 | dropped | — |');
    expect(text).toContain("Line references: 1 found, 1 in this report (dropped 1).");
    expect(text).not.toContain("THEY DIFFER");
    // Two numbers that differ say so: a line reference is missing.
    expect(formatText({ ...rep, summary: { ...rep.summary, pointers: { found: 2, reported: 1 } } })).toContain("Line references: 2 found, 1 in this report (dropped 1). THEY DIFFER: a line reference is missing from this report.");
  });

  it("groups and counts a dropped line reference in the report, and the two numbers still agree", () => {
    const paths = new Set(["MISSION.md", "b.md"]);
    const fake = { paths, ref: "t", sha: "c".repeat(40), lines: () => ["one", "two", "three", "four", "five", "six"], isBinary: () => false };
    const definitions = { names: new Map([[":5", [{ index: 0, target: { path: "b.md" } }]]]), phrases: new Map() };
    const rep = buildReport({ root: repo, file: "x.md", text: "`MISSION.md:1` and `:5`, `:6`; again `:5`.", tree: fake, head: fake, definitions });
    expect(rep.dropped).toEqual([{ status: "dropped", citedAt: [1], written: [":5"], via: ['inside ":5"'], range: [5, 5], occurrences: 2, lastPathNamed: [] }]);
    expect(rep.summary).toMatchObject({ dropped: 1, pointers: { found: 4, reported: 4 } });
    expect(rep.drifted).toBe(false);
  });
});

describe("the CLI", () => {
  it("exits 0 when nothing drifted", () => {
    const r = run(repo, "same.md", "--tree", tree, "--head", head);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Drift: none (exit 0).");
    expect(r.stdout).toContain("### b.md");
  });

  it("reads only one table row with --row", () => {
    const { status, json } = report("brief.md", "--tree", tree, "--head", head, "--row", "7");
    expect(status).toBe(3);
    expect(json.row).toEqual({ n: 7, line: 22 });
    // The brief's drift note (line 18) is no line of the row: not listed as skipped.
    expect(json.skipped).toEqual([]);
    expect(json.files.map((f) => f.path)).toEqual(["src/a.ts"]);
    expect(json.files[0].citations.map((c) => [c.range, c.status, c.newPointer, c.citedAt])).toEqual([
      [[2, 2], "moved", ":5", [22]],
      [[3, 3], "moved", ":6", [22]],
    ]);
    expect(report("brief.md", "--tree", tree, "--head", head, "--row", "8").status).toBe(0);
    const missing = run(repo, "brief.md", "--tree", tree, "--row", "99");
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("has no table row 99");
  });

  it("refuses to guess the tree: exit 1 and what the header says", () => {
    const r = run(repo, "brief.md");
    expect(r.status).toBe(1);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain("--tree is required");
    expect(r.stderr).toContain(`brief.md:3: "wrote this file on" ${tree.slice(0, 7)}`);
    const row = run(repo, "brief.md", "--row", "7");
    expect(row.status).toBe(1);
    expect(row.stderr).toContain("row 7 names no tree");
  });

  it("with --row and no --tree, prints the row's own hint, its last writer and its brief's header", () => {
    const own = run(repo, "logs/Q.md", "--row", "5");
    expect(own.status).toBe(1);
    expect(own.stderr).toContain('logs/Q.md:5: "read at" 1234abc');
    const named = run(repo, "logs/Q.md", "--row", "6");
    expect(named.status).toBe(1);
    expect(named.stderr).toContain("row 6 names no tree");
    expect(named.stderr).toContain(`the row was last written in ${head.slice(0, 7)} (head)`);
    expect(named.stderr).toContain('the row\'s brief, research/channel-loop/SITTING-2026-01-01-BRIEF.md:4: "tree at" abc1234');
  });

  it("refuses a repeated --tree, --head or --row: exit 1, not the last one silently", () => {
    expect(() => parseCli(["a.md", "--tree", "x", "--row", "28", "--row", "29"])).toThrow("--row is given 2 times");
    for (const args of [["brief.md", "--tree", tree, "--row", "7", "--row", "8"], ["brief.md", `--tree=${tree}`, "--tree", tree], ["brief.md", "--tree", tree, "--head", head, "--head", head]]) {
      const r = run(repo, ...args);
      expect(r.status, args.join(" ")).toBe(1);
      expect(r.stderr).toMatch(/--(row|tree|head) is given 2 times/);
    }
  });

  it("reports the unknown, the unchecked, the unattributed and the skipped", () => {
    const { json } = report("brief.md", "--tree", tree, "--head", head);
    expect(json.unknown.map((u) => [u.name, u.range[0], u.candidates])).toEqual([
      ["nope/missing.ts", 3, []],
      ["dup.md", 1, ["docs/dup.md", "notes/dup.md"]],
    ]);
    expect(json.unchecked.map((u) => `${u.name}:${u.range[0]}`)).toEqual(["OTA:5", "OTA:6", "FOO-RULING:7", "the note:8"]);
    expect(json.unattributed.map((u) => u.citedAt)).toEqual([[16]]);
    expect(json.skipped).toEqual([18]);
    expect(run(repo, "brief.md", "--tree", tree, "--head", head).stdout).toContain("Skipped 1 line(s) written against other trees (drift notes, pointer-housekeeping sections): :18 — a drift note at :18.");
    expect(cit(json, "src/a.ts", [2, 2])?.citedAt).toEqual([8, 14, 22]);
    expect(cit(json, "b.md", [3, 3])).toMatchObject({ via: ["the bee file"] });
    expect(cit(json, "b.md", [1, 1])?.citedAt).toEqual([14, 23]);
  });

  it("counts unknown paths as drift but not the unchecked or the unattributed", () => {
    write(repo, "unknown.md", "Only `nope/x.ts:3`.\n");
    expect(run(repo, "unknown.md", "--tree", tree, "--head", head).status).toBe(3);
    write(repo, "unchecked.md", "Only OTA:5 and, alone,\n\n:7 here; `b.md:2`.\n");
    expect(run(repo, "unchecked.md", "--tree", tree, "--head", head).status).toBe(0);
    expect(DRIFT).toEqual(["moved", "ambiguous", "changed", "gone", "unknown path"]);
  });

  it("defaults --head to HEAD", () => {
    const { json } = report("brief.md", "--tree", tree);
    expect(cit(json, "src/a.ts", [2, 2])).toMatchObject({ status: "moved" });
    expect(run(repo, "brief.md", "--tree", tree).stdout).toContain(`→ head HEAD (${head.slice(0, 7)})`);
  });

  it("exits 1 on a usage or read error, writing nothing", () => {
    const before = git(repo, "status", "--porcelain");
    for (const args of [[], ["brief.md", "extra.md", "--tree", tree], ["brief.md", "--tree", tree, "--bogus"], ["brief.md", "--tree", tree, "--row", "x"], ["brief.md", "--tree", ""]]) {
      const r = run(repo, ...args);
      expect(r.status, args.join(" ")).toBe(1);
      expect(r.stderr).toContain("usage:");
    }
    expect(run(repo, "brief.md", "--tree", "").stderr).toContain("--tree is empty");
    expect(run(repo, "missing.md", "--tree", tree).status).toBe(1);
    expect(run(repo, "brief.md", "--tree", "no-such-ref").stderr).toContain("not a commit: no-such-ref");
    expect(run(repo, "brief.md", "--tree", tree, "--head", "nope").status).toBe(1);
    expect(git(repo, "status", "--porcelain")).toBe(before);
  });

  it("prints usage with --help, exit 0", () => {
    const r = run(repo, "--help");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("usage: node scripts/brief-drift.mjs <file.md> --tree <ref>");
  });

  it("parses its options", () => {
    expect(parseCli(["a.md", "--tree", "x"])).toEqual({ file: "a.md", tree: "x", head: "HEAD", row: null, json: false });
    expect(parseCli(["a.md", "--tree", "x", "--head", "y", "--row", "28", "--json"])).toEqual({ file: "a.md", tree: "x", head: "y", row: 28, json: true });
  });

  it("finds the tree a header names", () => {
    const text = "# B\n\nchecked against the tree at `74b9bce`; built on 6229781.\nTree: `abc1234`\n\n## Part A\n\nbuilt on `ffffff0`.";
    expect(treeHints(text).map((h: { line: number; sha: string }) => `${h.line}:${h.sha}`)).toEqual(["3:74b9bce", "3:6229781", "4:abc1234"]);
  });
});

// The real repository: SITTING-2026-10-08-BRIEF.md was assembled on ba78110 and checked by tick 67 against a12dc7e,
// where every cited ledger.ts line from :414 on was 12 lower (logs/2026-10-08-channel-loop-tick-67.md §2). The brief is
// read as tick 67 left it (c196170, its drift note at line 3), not as it is today: a later note in it must not break
// this. A clone without that history (a shallow CI checkout, a sim-tree copy) cannot run it.
const PINNED = "c196170";
const hasHistory = ["ba78110", "a12dc7e", PINNED].every((ref) => spawnSync("git", ["cat-file", "-e", `${ref}^{commit}`], { cwd: ROOT }).status === 0);

describe("the real repository", () => {
  it.skipIf(!hasHistory)("finds ledger.ts's +12 shift from :414 on in the 8.10 brief, as tick 67 did", () => {
    const pinned = join(scratch, "SITTING-2026-10-08-BRIEF.md");
    writeFileSync(pinned, git(ROOT, "show", `${PINNED}:research/channel-loop/SITTING-2026-10-08-BRIEF.md`));
    const r = spawnSync(process.execPath, [SCRIPT, pinned, "--tree", "ba78110", "--head", "a12dc7e", "--json"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
    expect(r.status).toBe(3);
    const json = JSON.parse(r.stdout) as Report;
    const ledger = json.files.find((f) => f.path === "src/revenue/ledger.ts");
    const lined = ledger?.citations.filter((c) => c.range) ?? [];
    const late = lined.filter((c) => c.range && c.range[0] >= 414);
    expect(late.length).toBeGreaterThanOrEqual(10);
    expect(late.every((c) => c.status === "moved" && c.offset === 12)).toBe(true);
    expect(late.find((c) => c.range?.[0] === 414 && c.range?.[1] === 430)).toMatchObject({ newPointer: ":426-442" });
    expect(late.find((c) => c.range?.[0] === 421 && c.range?.[1] === 442)).toMatchObject({ newPointer: ":433-454" });
    expect(lined.find((c) => c.range?.[0] === 165)).toMatchObject({ status: "same", newPointer: ":165-173" });
    // The tick-67 drift note at the head of the brief, and the four pointer-housekeeping sections of Part C, are not
    // read as citations.
    expect(json.skipped[0]).toBe(3);
    expect((json as unknown as { skippedParts: { line: number; kind: string }[] }).skippedParts.map((p) => `${p.kind}:${p.line}`)).toEqual(["note:3", "section:791", "section:806", "section:819", "section:838"]);
  });
});
