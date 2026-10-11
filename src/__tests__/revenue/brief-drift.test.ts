import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DRIFT,
  driftNoteLines,
  findDefinitions,
  findRow,
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
    const text = "\"The read-back\" is `scripts/r.ts`.\n\n`MISSION.md:1` is the log call at the\n  read-back `:126-130` now.";
    const ref = scan(text).find((r: { range: number[] | null }) => r.range?.[0] === 126);
    expect(ref).toMatchObject({ path: "scripts/r.ts", via: "the read-back", docLine: 4 });
    // Across a paragraph's end (a heading, a blank line) it is no phrase.
    expect(files("\"The read-back\" is `scripts/r.ts`.\n\n## At the\nread-back `:12`.")).not.toContain("scripts/r.ts:12-12");
    expect(files("\"The read-back\" is `scripts/r.ts`.\n\n`MISSION.md:1` at the\n\nread-back `:12`.")).not.toContain("scripts/r.ts:12-12");
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
