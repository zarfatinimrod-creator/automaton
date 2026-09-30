#!/usr/bin/env node
/**
 * mutate — the mutation-test harness: break the code on purpose, one exact edit at a time, and see whether a test fails.
 *
 *   node scripts/mutate.mjs --file <path> --find <text> --replace <text> [--nth N] [--note <label>]
 *                           --test <path> [--test <path>...]
 *   node scripts/mutate.mjs --plan <plan.json>     a JSON array of {file, find, replace, test?, note?, id?, nth?}
 *                                                  (test: a path or an array of them; the --test paths otherwise)
 *   --cmd "<command>"  the test command for every mutation instead of `npx vitest run`, e.g.
 *                      --cmd "scripts/pytest-product.sh chart-explainer". It is split on spaces and run without a shell
 *                      (a pipe would judge by its last command, the `vitest | grep` failure this project had twice);
 *                      each mutation's test paths are appended to it.
 *   --timeout <s>      seconds one run may take. Default: 30 minutes for the baseline, and for each mutation ten times
 *                      its command's baseline time but never under 60s. A run past it is stopped (its whole process
 *                      group: SIGTERM, SIGKILL 2s later) and is "timeout".
 *   --allow-dirty      mutate a file with uncommitted changes, or one git does not track (it is still restored from
 *                      memory, but `git checkout -- <file>` is then no way back)
 *   --json <out>       write the baselines and the results as JSON (checked writable before anything runs)
 *   --tail <n>         lines of output kept per run (default 6)
 * Run it from the repository root: paths are relative to the working directory, and the commands run there. A text
 * that starts with "-" needs the = form: --find=-1. Example plan entry:
 *   {"file": "scripts/capture-check.mjs", "find": "< WEAK_SIGN_TEXT", "replace": "<= WEAK_SIGN_TEXT",
 *    "test": "src/__tests__/revenue/capture-check.test.ts", "note": "weak-sign bound"}
 *
 * What it does, in order:
 *   1. Takes a lock for the checkout (`git rev-parse --git-path mutate.lock`): a second run in the same checkout would
 *      see the first one's mutation on disk and report kills it did not cause. A lock whose process is gone is taken
 *      over. Two worktrees have two locks.
 *   2. Checks every mutation before running anything. The file must be a regular file inside the repository, tracked
 *      and unmodified in git, and the bytes actually read must be the blob git's index has (unless --allow-dirty); git
 *      reads every path literally, never as a glob. --find must occur exactly once (or --nth names which), and the
 *      replacement must differ from it. A mutation that fails a check is "not applied", never killed or survived.
 *   3. Records the checkout (`git status --untracked-files=all`, with each listed file's mode and sha256), then runs
 *      each distinct test command once on the untouched tree (the baseline). The baseline fails, and everything stops
 *      with exit 2, when a command fails, times out, reports that no test ran (vitest "No test files found" or "no
 *      tests", every test skipped, pytest "no tests ran" or a collection error: whatever --cmd is), prints no summary at
 *      all under the default vitest command, or changes the checkout: a mutation "killed" by an already-failing test,
 *      or by what an earlier run left behind, proves nothing.
 *   4. For each mutation: writes the edit (bytes, so CRLF and non-UTF-8 files are safe; never through a link), runs
 *      the command, and when the runner exits kills whatever it left in its process group and waits for it to be gone
 *      (a leftover could hold the output open, or write the file after the restore). Then it restores the file: it
 *      removes a link put in its place, recreates a deleted file with its mode, and sets the mode back, then checks
 *      the type, mode and sha256. Bytes that are neither the original nor the mutation (an edit during the run) are
 *      left alone, both versions saved, exit 4. Then the checkout must be what it was before the baseline, or
 *      everything stops with exit 4, naming the paths.
 *      The verdict is the exit code: non-zero "killed", zero "survived" (with a note when no test ran). A non-zero
 *      exit that shows no test failed is "killed?": the runner died on a signal or could not start; its last vitest
 *      "Tests" line counts no failure or no test that ran; pytest's last "N passed/failed ... in Ns" line counts no
 *      failure, or counts only errors after an "Interrupted: N error during collection" line; vitest said "No test
 *      files found" or pytest "no tests ran"; or there is no summary at all.
 *   5. Runs each baseline command again. If one fails now, the tests are not repeatable: every "killed" becomes
 *      "killed?" and the exit is 2. The checkout, and every mutated file, must still be as it was (else exit 4).
 *   6. SIGINT, SIGTERM, SIGHUP or SIGQUIT sends SIGTERM to the runner's process group (SIGKILL 2s later), waits for it
 *      to stop, and only then restores the file and exits 130/143/129/131 (4 if the restore failed). SIGKILL of the
 *      harness cannot be caught: that is what the git checks in step 2 are for. A process that left the group (setsid)
 *      is out of reach.
 *
 * Exit: 0 every applied mutation was killed; 1 any survived, is killed? or timed out; 2 a usage error, the lock is
 * held, a failing baseline (first or again) or any mutation not applied (the others still run); 4 a restore that did
 * not bring the original back, or a checkout changed by a run (it stops at once and says where the bytes are and
 * `git checkout -- <file>`). When several apply, the highest wins in the order 4 > 2 > 1 > 0: a plan with a survivor
 * and a mutation not applied exits 2, so read the report, not only the code.
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  closeSync,
  constants as fsc,
  existsSync,
  fchmodSync,
  fstatSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { constants as osc, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_CMD = ["npx", "vitest", "run"];
const KEEP_OUTPUT = 256 * 1024; // characters of output kept per run: the summary is at the end
const STOP_GRACE_MS = 2000; // after SIGTERM to the runner's group, how long before SIGKILL
const CLOSE_GRACE_MS = 2000; // after the runner exits and its group is killed, how long its output may stay open
const GONE_WAIT_MS = 2000; // how long to wait for a killed group to be gone before restoring anyway
const BASELINE_TIMEOUT_MS = 30 * 60 * 1000;
const MIN_TIMEOUT_MS = 60_000;
const TIMEOUT_FACTOR = 10;
const RANK = { 0: 0, 1: 1, 2: 2, 4: 3 };

class UsageError extends Error {}
class Refusal extends Error {}
const usage = (message) => {
  throw new UsageError(message);
};

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const plain = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;
const octal = (mode) => mode.toString(8).padStart(4, "0");
const sameCmd = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const worst = (...codes) => codes.filter((c) => c !== null && c !== undefined).reduce((a, b) => (RANK[b] > RANK[a] ? b : a), 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Resolves when the promise does or after ms, whichever is first, and leaves no timer behind to delay the exit. */
const within = (promise, ms) =>
  new Promise((ok) => {
    const t = setTimeout(ok, ms);
    promise.then(() => {
      clearTimeout(t);
      ok();
    });
  });

function parseCli(argv) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      strict: true,
      allowPositionals: false,
      options: {
        file: { type: "string" },
        find: { type: "string" },
        replace: { type: "string" },
        nth: { type: "string" },
        note: { type: "string" },
        id: { type: "string" },
        test: { type: "string", multiple: true },
        plan: { type: "string" },
        cmd: { type: "string" },
        timeout: { type: "string" },
        "allow-dirty": { type: "boolean" },
        json: { type: "string" },
        tail: { type: "string" },
      },
    }));
  } catch (e) {
    usage(e.message);
  }
  const single = ["file", "find", "replace", "nth", "note", "id"].filter((k) => values[k] !== undefined);
  let mutations;
  if (values.plan !== undefined) {
    if (single.length) usage(`--plan cannot be combined with ${single.map((k) => `--${k}`).join(", ")}`);
    mutations = loadPlan(values.plan);
  } else {
    for (const k of ["file", "find", "replace"]) if (values[k] === undefined) usage(`--${k} is missing`);
    mutations = [{ file: values.file, find: values.find, replace: values.replace, nth: values.nth, note: values.note, id: values.id }];
  }
  let cmd = DEFAULT_CMD;
  if (values.cmd !== undefined) {
    cmd = values.cmd.split(/\s+/).filter(Boolean);
    if (!cmd.length) usage("--cmd is empty");
  }
  // By content: `--cmd "npx vitest run"` is the default command and gets the default command's guards.
  const isDefaultCmd = sameCmd(cmd, DEFAULT_CMD);
  const tail = values.tail === undefined ? 6 : positiveInt(values.tail, "--tail");
  const timeoutMs = values.timeout === undefined ? undefined : positiveInt(values.timeout, "--timeout") * 1000;
  if (values.json !== undefined) checkWritable(values.json);
  const globalTests = values.test ?? [];
  mutations = mutations.map((m, i) => {
    const tests = m.test === undefined ? globalTests : [m.test].flat();
    if (isDefaultCmd && !tests.length) {
      usage(`mutation ${m.id ?? i + 1} has no --test paths: the default command (npx vitest run) would run the whole suite; name the tests or pass --cmd`);
    }
    return { ...m, id: m.id ?? `M${i + 1}`, nth: m.nth === undefined ? undefined : positiveInt(m.nth, "--nth"), tests, argv: [...cmd, ...tests] };
  });
  return { mutations, isDefaultCmd, allowDirty: values["allow-dirty"] === true, json: values.json, tail, timeoutMs };
}

function positiveInt(value, name) {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s)) usage(`${name} must be a whole number from 1, not "${s}"`);
  return Number(s);
}

/** --json is written at the very end: a path that cannot be written must fail now, not after every run. */
function checkWritable(path) {
  try {
    if (!statSync(path).isFile()) usage(`--json ${path} is not a regular file`);
    accessSync(path, fsc.W_OK);
    return;
  } catch (e) {
    if (e instanceof UsageError) throw e;
    if (e.code !== "ENOENT") usage(`--json ${path} cannot be written: ${e.message}`);
  }
  const dir = dirname(resolve(path));
  try {
    if (!statSync(dir).isDirectory()) usage(`--json ${path}: ${dir} is not a directory`);
    accessSync(dir, fsc.W_OK);
  } catch (e) {
    if (e instanceof UsageError) throw e;
    usage(`--json ${path} cannot be written: ${e.message}`);
  }
}

function loadPlan(path) {
  let plan;
  try {
    plan = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    usage(`cannot read the plan ${path}: ${e.message}`);
  }
  if (!Array.isArray(plan) || !plan.length) usage(`the plan ${path} must be a non-empty JSON array`);
  return plan.map((m, i) => {
    const where = `plan entry ${i + 1}`;
    if (!m || typeof m !== "object" || Array.isArray(m)) usage(`${where} is not an object`);
    for (const k of ["file", "find", "replace"]) if (typeof m[k] !== "string") usage(`${where} has no string "${k}"`);
    for (const k of ["note", "id"]) if (m[k] !== undefined && typeof m[k] !== "string") usage(`${where}: "${k}" must be a string`);
    const t = m.test;
    if (t !== undefined && typeof t !== "string" && !(Array.isArray(t) && t.every((x) => typeof x === "string"))) {
      usage(`${where}: "test" must be a path or an array of paths`);
    }
    return { file: m.file, find: m.find, replace: m.replace, test: t, note: m.note, id: m.id, nth: m.nth };
  });
}

/** git with every path read literally (a name like `Heebo[wght].ttf` is not a glob) and no index refresh writes. */
function git(root, args, input) {
  return spawnSync("git", ["--literal-pathspecs", "--no-optional-locks", ...args], {
    cwd: root,
    encoding: "utf8",
    input,
    maxBuffer: 256 * 1024 * 1024,
  });
}

function repoRoot() {
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" });
  if (r.status !== 0 || !r.stdout.trim()) usage("not inside a git repository (run it from the repository root)");
  return realpathSync(r.stdout.trim());
}

/** Alive and not a zombie. When /proc cannot say, a process that answers signal 0 counts as alive. */
function alive(pid) {
  try {
    process.kill(pid, 0);
  } catch (e) {
    return e.code === "EPERM";
  }
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    return !/^[ZX]/.test(stat.slice(stat.lastIndexOf(")") + 2));
  } catch {
    return true;
  }
}

let lockPath = null;
/** One mutate run per checkout. The lock file is linked into place whole, so a reader never sees it half-written. */
function takeLock(root) {
  const r = git(root, ["rev-parse", "--git-path", "mutate.lock"]);
  if (r.status !== 0 || !r.stdout.trim()) throw new Refusal(`cannot find the git directory for the lock: ${r.stderr.trim()}`);
  const path = resolve(root, r.stdout.trim());
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${process.pid}\n`);
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        linkSync(tmp, path);
        lockPath = path;
        return;
      } catch (e) {
        if (e.code !== "EEXIST") throw new Refusal(`cannot take the lock ${path}: ${e.message}`);
      }
      let pid = NaN;
      try {
        pid = Number(readFileSync(path, "utf8").trim());
      } catch {
        /* removed meanwhile: try again */
      }
      if (Number.isInteger(pid) && pid > 0 && alive(pid)) {
        throw new Refusal(
          `another mutate run (pid ${pid}) holds ${path}: two runs in one checkout see each other's mutations. ` +
            "Wait for it to finish (or, if that process is not a mutate run, delete the file).",
        );
      }
      try {
        unlinkSync(path); // its process is gone: a stale lock
      } catch {
        /* someone else removed it */
      }
    }
    throw new Refusal(`cannot take the lock ${path}: another run keeps taking it`);
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* already gone */
    }
  }
}

function releaseLock() {
  if (!lockPath) return;
  try {
    if (readFileSync(lockPath, "utf8").trim() === String(process.pid)) unlinkSync(lockPath);
  } catch {
    /* already gone */
  }
  lockPath = null;
}
process.on("exit", releaseLock);

/** Reads a regular file without following a link at the path. */
function readNoFollow(path) {
  const fd = openSync(path, fsc.O_RDONLY | fsc.O_NOFOLLOW);
  try {
    const st = fstatSync(fd);
    if (!st.isFile()) throw new Error(`${path} is not a regular file`);
    return { bytes: readFileSync(fd), mode: st.mode & 0o7777 };
  } finally {
    closeSync(fd);
  }
}

/** Writes bytes into the file at path (never through a link there) and sets its mode; `create` for a missing file. */
function writeNoFollow(path, bytes, mode, create) {
  const flags = fsc.O_WRONLY | fsc.O_NOFOLLOW | (create ? fsc.O_CREAT | fsc.O_EXCL : fsc.O_TRUNC);
  const fd = openSync(path, flags, mode);
  try {
    writeFileSync(fd, bytes);
    fchmodSync(fd, mode); // the create mode passes through the umask; this does not
  } finally {
    closeSync(fd);
  }
}

/** Checks one mutation and computes its bytes. Returns the prepared mutation, or a reason it is not applied. */
function prepare(m, root, allowDirty) {
  const abs = resolve(m.file);
  if (!existsSync(abs)) return { reason: `no such file: ${m.file}` };
  const real = realpathSync(abs);
  if (real !== root && !real.startsWith(root + sep)) return { reason: `${m.file} is outside the repository (${root})` };
  if (!statSync(real).isFile()) return { reason: `${m.file} is not a regular file` };
  const rel = relative(root, real);
  const gitRel = rel.split(sep).join("/");
  if (m.find === "") return { reason: "--find is empty" };
  if (m.find === m.replace) return { reason: "the replacement is identical to the text found" };
  let blob = null;
  if (!allowDirty) {
    const ls = git(root, ["ls-files", "--stage", "-z", "--", gitRel]);
    const entries = ls.status === 0 ? ls.stdout.split("\0").filter(Boolean) : [];
    const entry = entries.length === 1 ? /^\d+ ([0-9a-f]+) 0\t(.*)$/s.exec(entries[0]) : null;
    if (!entry || entry[2] !== gitRel) {
      return { reason: `${rel} is not tracked by git, so git checkout could not bring it back (--allow-dirty to mutate it anyway)` };
    }
    const status = git(root, ["status", "--porcelain", "--", gitRel]);
    if (status.status !== 0 || status.stdout.trim()) {
      return { reason: `${rel} has uncommitted changes, so git checkout would lose them (commit first, or --allow-dirty)` };
    }
    blob = entry[1];
  }
  let original, mode;
  try {
    ({ bytes: original, mode } = readNoFollow(real));
  } catch (e) {
    return { reason: `cannot read ${rel}: ${e.message}` };
  }
  if (blob) {
    // The bytes read, not an earlier `git status`, decide: another run's mutation must never be taken for the original.
    const h = git(root, ["hash-object", "--stdin", `--path=${gitRel}`], original);
    if (h.status !== 0 || h.stdout.trim() !== blob) {
      return { reason: `the bytes read from ${rel} are not what git has for it (git status said clean): someone is writing it; try again` };
    }
  }
  const needle = Buffer.from(m.find, "utf8");
  const at = [];
  for (let i = original.indexOf(needle); i !== -1; i = original.indexOf(needle, i + needle.length)) at.push(i);
  if (!at.length) return { reason: `--find text not found in ${rel}` };
  if (m.nth === undefined && at.length > 1) return { reason: `--find text found ${at.length} times in ${rel}; name one with --nth (1-${at.length})` };
  if (m.nth !== undefined && m.nth > at.length) return { reason: `--nth ${m.nth}, but the text is found ${at.length} time(s) in ${rel}` };
  const pos = at[(m.nth ?? 1) - 1];
  const mutated = Buffer.concat([original.subarray(0, pos), Buffer.from(m.replace, "utf8"), original.subarray(pos + needle.length)]);
  return { real, rel, dir: dirname(real), original, hash: sha256(original), mutated, mode };
}

/** What is at a mutation's path now: its directory moved, nothing, a link, something else, or a file and its bytes. */
function onDisk(m) {
  let dirNow = null;
  try {
    dirNow = realpathSync(m.dir);
  } catch {
    /* gone */
  }
  if (dirNow !== m.dir) return { kind: "moved" };
  let st;
  try {
    st = lstatSync(m.real);
  } catch (e) {
    if (e.code === "ENOENT") return { kind: "missing" };
    throw e;
  }
  if (st.isSymbolicLink()) return { kind: "link" };
  if (!st.isFile()) return { kind: st.isDirectory() ? "directory" : "not a regular file" };
  return { kind: "file", ...readNoFollow(m.real) };
}

const isOriginal = (m, now) => now.kind === "file" && now.mode === m.mode && sha256(now.bytes) === m.hash;

/** The checkout as git shows it: every changed or untracked path, with its type, mode and content hash. */
function treeState(root) {
  const r = git(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  if (r.status !== 0) throw new Error(`git status failed: ${r.stderr.trim()}`);
  const state = new Map();
  const parts = r.stdout.split("\0");
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i];
    if (e.length < 4) continue;
    if (e[0] === "R" || e[0] === "C") i += 1; // the source path follows
    const path = e.slice(3);
    state.set(path, `${e.slice(0, 2)} ${fingerprint(join(root, path))}`);
  }
  return state;
}

function fingerprint(abs) {
  try {
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) return `link ${readlinkSync(abs)}`;
    if (st.isFile()) return `file ${octal(st.mode & 0o7777)} ${sha256(readFileSync(abs))}`;
    return st.isDirectory() ? "dir" : "other";
  } catch {
    return "missing";
  }
}

function treeDiff(before, after) {
  const paths = new Set([...before.keys(), ...after.keys()]);
  return [...paths].filter((p) => before.get(p) !== after.get(p)).sort();
}

const count = (text, word) => {
  const m = new RegExp(`(?:^|[^\\w])(\\d+) ${word}\\b`).exec(text);
  return m ? Number(m[1]) : 0;
};

/**
 * What the output shows about tests: whether any ran (at least one passed or failed), the summary line, whether it
 * counts a failure, and noTests when the runner itself said that no test ran.
 */
function summarize(output) {
  const text = plain(output);
  // The runner's own summary is its last one: tests can print summary-like text of their own (this harness's do).
  const vitest = [...text.matchAll(/^[ \t]*Tests[ \t]+(?:(\d+ (?:passed|failed|skipped|todo)\b.*)|(no tests))[ \t]*$/gm)].pop();
  if (vitest) {
    if (vitest[2]) return { ran: false, noTests: true, reason: 'vitest said "Tests  no tests": a test file failed to load, no test ran' };
    const line = vitest[0].trim();
    const failed = count(vitest[1], "failed");
    if (failed + count(vitest[1], "passed") === 0) {
      return { ran: false, noTests: true, reason: `vitest counted no test that passed or failed (${line}): every test was skipped, no test ran` };
    }
    return { ran: true, line, failed: failed > 0 };
  }
  const pytest = [...text.matchAll(/^.*\b\d+ (?:passed|failed|errors?|skipped|deselected|xfailed|xpassed)\b.*\bin \d+(?:\.\d+)?s\b.*$/gm)].pop();
  if (pytest) {
    const line = pytest[0].trim();
    const failed = count(line, "failed");
    const errors = count(line, "errors?");
    const ran = failed + errors + count(line, "passed") + count(line, "xfailed") + count(line, "xpassed");
    if (failed) return { ran: true, line, failed: true };
    // The summary decides first: an "Interrupted" line counts only when the summary has errors and nothing else.
    if (errors && ran === errors && /^!+ Interrupted: \d+ errors? during collection !+$/m.test(text)) {
      return { ran: false, noTests: true, reason: "pytest: error during collection, no test ran" };
    }
    if (errors) return { ran: true, line, failed: true };
    if (!ran) return { ran: false, noTests: true, reason: `pytest counted no test that ran (${line})` };
    return { ran: true, line, failed: false };
  }
  if (/^=+ no tests ran\b.*$/m.test(text)) return { ran: false, noTests: true, reason: 'pytest said "no tests ran"' };
  if (/^No test files found\b/m.test(text)) return { ran: false, noTests: true, reason: 'vitest said "No test files found": no test ran' };
  return { ran: false, reason: 'no test summary in the output (a vitest "Tests ..." line or a pytest "N passed/failed ... in Ns" line), so nothing shows a test ran' };
}

function judge(run) {
  if (run.startError) return { status: "killed?", reason: `the command did not start: ${run.startError}` };
  if (run.timedOut) {
    return { status: "timeout", reason: `no verdict within ${seconds(run.timeoutMs)}: the runner's group was stopped (${run.signal ?? `exit ${run.exit}`})` };
  }
  if (run.signal) return { status: "killed?", reason: `the runner was killed by ${run.signal}: no test verdict` };
  const s = summarize(run.output);
  if (run.exit === 0) return s.noTests ? { status: "survived", reason: `exit 0, but ${s.reason}` } : { status: "survived" };
  if (!s.ran) return { status: "killed?", reason: s.reason };
  if (!s.failed) return { status: "killed?", reason: `exit ${run.exit}, but the summary counts no failed test: ${s.line}` };
  return { status: "killed" };
}

/** The baseline must pass and show that tests ran. */
function judgeBaseline(b, isDefaultCmd) {
  if (b.startError) return { ok: false, why: `did not start: ${b.startError}` };
  if (b.timedOut) return { ok: false, why: `timed out after ${seconds(b.timeoutMs)}` };
  if (b.signal) return { ok: false, why: `killed by ${b.signal}` };
  if (b.exit !== 0) return { ok: false, why: `exit ${b.exit}` };
  const s = summarize(b.output);
  if (s.noTests || (!s.ran && isDefaultCmd)) return { ok: false, why: `exit 0, but ${s.reason}` };
  if (!s.ran) return { ok: true, why: "exit 0", note: `${s.reason}: a mutation this command fails will read killed?, one it passes survived` };
  return { ok: true, why: "exit 0" };
}

const tailOf = (output, n) => plain(output).split("\n").filter((l) => l.trim()).slice(-n);

// The runner in progress, the mutation on disk right now, and the signal that asked the harness to stop.
let active = null;
let current = null;
let stopping = null;

function killGroup(pid, sig) {
  try {
    process.kill(-pid, sig);
  } catch {
    /* already gone */
  }
}

/** Whether any live (not zombie) process is left in the process group. */
function groupAlive(pgid) {
  if (existsSync("/proc/self/stat")) {
    for (const d of readdirSync("/proc")) {
      if (!/^\d+$/.test(d)) continue;
      let stat;
      try {
        stat = readFileSync(`/proc/${d}/stat`, "utf8");
      } catch {
        continue;
      }
      const f = stat.slice(stat.lastIndexOf(")") + 2).split(" "); // state, ppid, pgrp, ...
      if (Number(f[2]) === pgid && f[0] !== "Z" && f[0] !== "X") return true;
    }
    return false;
  }
  try {
    process.kill(-pgid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
}

/**
 * Runs the command in its own process group. It is over when the runner exits: then everything left in its group is
 * killed (a leftover could hold the output pipe open for ever, or write the file after the restore), and the promise
 * resolves once the group is gone. Past timeoutMs the group gets SIGTERM, then SIGKILL.
 */
function run(argv, timeoutMs) {
  return new Promise((done) => {
    const t0 = performance.now();
    let output = "";
    let timedOut = false;
    let settled = false;
    const timers = [];
    const clear = () => timers.splice(0).forEach(clearTimeout);
    const finish = (r) => {
      if (settled) return;
      settled = true;
      clear();
      active = null;
      done({ ...r, timedOut, timeoutMs, output, durationMs: Math.round(performance.now() - t0) });
    };
    let child;
    try {
      child = spawn(argv[0], argv.slice(1), { detached: true, stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) {
      finish({ exit: null, signal: null, startError: e.message });
      return;
    }
    active = child;
    const keep = (chunk) => {
      output += chunk;
      if (output.length > KEEP_OUTPUT) output = output.slice(-KEEP_OUTPUT);
    };
    child.stdout.setEncoding("utf8").on("data", keep);
    child.stderr.setEncoding("utf8").on("data", keep);
    let closed = false;
    const whenClosed = new Promise((ok) => {
      child.on("close", () => {
        closed = true;
        ok();
      });
    });
    child.on("error", (e) => {
      if (child.pid === undefined) finish({ exit: null, signal: null, startError: e.message });
    });
    timers.push(
      setTimeout(() => {
        timedOut = true;
        killGroup(child.pid, "SIGTERM");
        timers.push(setTimeout(() => killGroup(child.pid, "SIGKILL"), STOP_GRACE_MS));
      }, timeoutMs),
    );
    child.on("exit", async (exit, signal) => {
      clear();
      killGroup(child.pid, "SIGKILL");
      if (!closed) {
        await within(whenClosed, CLOSE_GRACE_MS);
        if (!closed) {
          // A process outside the group still holds the output: stop reading it.
          child.stdout.destroy();
          child.stderr.destroy();
        }
      }
      for (const until = Date.now() + GONE_WAIT_MS; groupAlive(child.pid) && Date.now() < until; ) await sleep(20);
      finish({ exit, signal });
    });
  });
}

/** Saves the original (and what was found at the path, if anything) and says so, loudly. */
function rescue(m, problem, found) {
  const lines = [`mutate: RESTORE FAILED: ${m.rel}: ${problem}.`];
  try {
    const dir = mkdtempSync(join(tmpdir(), "mutate-rescue-"));
    const saved = join(dir, basename(m.real));
    writeFileSync(saved, m.original);
    lines.push(`mutate: the original bytes saved to ${saved}`);
    if (found) {
      writeFileSync(`${saved}.found`, found);
      lines.push(`mutate: the bytes found there saved to ${saved}.found`);
    }
  } catch (e) {
    lines.push(`mutate: the original bytes could not be saved: ${e.message}`);
  }
  lines.push(`mutate: git checkout -- ${m.rel} brings back the committed version`);
  console.error(lines.join("\n"));
}

/**
 * Puts the original bytes and mode back and checks them. A link at the path is removed (never written through) and a
 * missing file recreated. Bytes that are neither the original nor the mutation are someone's edit: left alone.
 */
function restore(m) {
  let problem = null;
  let found = null;
  try {
    const now = onDisk(m);
    if (now.kind === "moved") problem = `its directory is no longer ${m.dir} (moved, or replaced by a link), so a write could land elsewhere`;
    else if (now.kind === "directory" || now.kind === "not a regular file") problem = `it is now a ${now.kind}`;
    else if (now.kind === "file" && !now.bytes.equals(m.original) && !now.bytes.equals(m.mutated)) {
      problem = "it changed during the run (its bytes are neither the original nor the mutation), so it is left as it is";
      found = now.bytes;
    } else {
      if (now.kind === "link") unlinkSync(m.real); // the link only, never what it points to
      writeNoFollow(m.real, m.original, m.mode, now.kind !== "file");
      const after = onDisk(m);
      if (!isOriginal(m, after)) {
        problem =
          after.kind !== "file"
            ? `after the write it is ${after.kind}`
            : after.mode !== m.mode
              ? `mode ${octal(after.mode)} != ${octal(m.mode)}`
              : `sha256 ${sha256(after.bytes)} != ${m.hash}`;
      }
    }
  } catch (e) {
    problem = e.message;
  }
  if (current === m) current = null;
  if (!problem) return true;
  rescue(m, problem, found);
  return false;
}

/** A signal asks the runner's group to stop; the main flow restores once the runner is gone, then exits. */
function onSignal(sig) {
  const pid = active?.pid;
  if (stopping) {
    if (pid) killGroup(pid, "SIGKILL");
    return;
  }
  stopping = sig;
  if (pid) {
    killGroup(pid, "SIGTERM");
    setTimeout(() => killGroup(pid, "SIGKILL"), STOP_GRACE_MS).unref();
  }
}

function reportLine(r, idWidth) {
  const verdict = r.startError ? "no start" : r.signal ? r.signal : r.exit === undefined || r.exit === null ? "-" : `exit ${r.exit}`;
  const time = r.durationMs === undefined ? "" : seconds(r.durationMs);
  const cols = [r.id.padEnd(idWidth), (r.status ?? "not run").padEnd(11), verdict.padEnd(8), time.padStart(6), r.file];
  if (r.note) cols.push(r.note);
  return cols.join("  ");
}

async function session(opts, root) {
  const results = opts.mutations.map((m) => {
    const p = prepare(m, root, opts.allowDirty);
    const base = { id: m.id, note: m.note, file: m.file, find: m.find, replace: m.replace, nth: m.nth, tests: m.tests, command: m.argv };
    return p.reason ? { ...base, status: "not applied", reason: p.reason } : { ...base, prepared: p };
  });
  const applicable = results.filter((r) => r.prepared);
  const idWidth = Math.max(...results.map((r) => r.id.length));
  const baseline = [];
  const baselineAgain = [];
  const notRun = (why) => {
    for (const r of results) if (r.prepared && !r.status) Object.assign(r, { status: "not run", reason: why });
  };
  const ran = (r) => r.status && r.status !== "not applied" && r.status !== "not run";

  const report = (explicit) => {
    const counts = { applied: 0, killed: 0, survived: 0, "killed?": 0, timeout: 0, "not applied": 0, "not run": 0 };
    for (const r of results) {
      r.status ??= "not run";
      if (r.status in counts) counts[r.status] += 1;
      if (ran(r)) counts.applied += 1;
    }
    for (const r of results) {
      console.log(reportLine(r, idWidth));
      if (r.reason) console.log(`    why: ${r.reason}`);
      if (["survived", "killed?", "timeout"].includes(r.status)) for (const l of r.tail ?? []) console.log(`    | ${l}`);
    }
    let code = worst(explicit, counts["not applied"] ? 2 : counts.survived || counts["killed?"] || counts.timeout ? 1 : 0);
    console.log(
      `mutate: ${counts.applied} applied: ${counts.killed} killed, ${counts.survived} survived, ` +
        `${counts["killed?"]} killed?, ${counts.timeout} timeout; ${counts["not applied"]} not applied; ${counts["not run"]} not run`,
    );
    if (opts.json) {
      const clean = results.map(({ prepared, ...r }) => r);
      try {
        writeFileSync(opts.json, `${JSON.stringify({ baseline, baselineAgain, results: clean, counts, exitCode: code }, null, 2)}\n`);
      } catch (e) {
        console.error(`mutate: cannot write --json ${opts.json}: ${e.message}`);
        code = worst(code, 2);
      }
    }
    return code;
  };
  const halt = (m, ok = true) => {
    console.error(`mutate: ${stopping}: stopped${m ? (ok ? `; ${m.rel} restored` : "; its restore FAILED (above)") : "; no file was mutated"}`);
    return ok ? 128 + osc.signals[stopping] : 4;
  };

  if (!applicable.length) return report();

  // 1. The baseline: each distinct command once, on the untouched tree, which must stay untouched.
  const tree0 = treeState(root);
  const commands = [...new Map(applicable.map((r) => [JSON.stringify(r.command), r.command])).values()];
  const baseMs = new Map();
  const runBaselines = async (list, label) => {
    for (const [i, argv] of commands.entries()) {
      if (stopping) return { halted: true };
      const b = await run(argv, opts.timeoutMs ?? (label === "baseline" ? BASELINE_TIMEOUT_MS : timeoutFor(argv)));
      if (stopping) return { halted: true };
      const v = judgeBaseline(b, opts.isDefaultCmd);
      const tail = tailOf(b.output, opts.tail);
      list.push({ command: argv, exit: b.exit, signal: b.signal, timedOut: b.timedOut, durationMs: b.durationMs, ok: v.ok, why: v.why, tail });
      console.log(`mutate: ${label} ${i + 1}/${commands.length}: ${argv.join(" ")}: ${v.why}, ${seconds(b.durationMs)}`);
      if (!v.ok) {
        for (const l of tail) console.log(`    | ${l}`);
        return { failed: v.why };
      }
      if (v.note) console.log(`mutate: note: ${v.note}`);
      if (label === "baseline") baseMs.set(JSON.stringify(argv), b.durationMs);
    }
    return {};
  };
  const timeoutFor = (argv) => opts.timeoutMs ?? Math.max(MIN_TIMEOUT_MS, TIMEOUT_FACTOR * baseMs.get(JSON.stringify(argv)));

  const first = await runBaselines(baseline, "baseline");
  if (first.halted) return halt(null);
  if (first.failed) {
    console.error(
      `mutate: the baseline FAILED (${first.failed}). A mutation "killed" by an already-failing test proves nothing: ` +
        "fix the tests first. No file was mutated.",
    );
    notRun("the baseline failed");
    return report(2);
  }
  const touched = treeDiff(tree0, treeState(root));
  if (touched.length) {
    console.error(
      `mutate: the baseline FAILED: the tests changed the checkout (${touched.join(", ")}). A later run would see what ` +
        "an earlier one left, so a verdict could come from the order of the runs: make the tests write elsewhere. No file was mutated.",
    );
    notRun("the baseline failed: the tests changed the checkout");
    return report(2);
  }

  // 2. The mutations, one at a time, each restored and the checkout compared before the next.
  for (const r of results) {
    if (!r.prepared) continue;
    if (stopping) return halt(null);
    const m = r.prepared;
    let now;
    try {
      now = onDisk(m);
    } catch (e) {
      now = { kind: e.message };
    }
    if (!isOriginal(m, now)) {
      Object.assign(r, { status: "not applied", reason: `${m.rel} changed on disk during an earlier run` });
      continue;
    }
    const timeoutMs = timeoutFor(r.command);
    let result = null;
    let restored = false;
    current = m;
    try {
      writeNoFollow(m.real, m.mutated, m.mode, false);
      result = await run(r.command, timeoutMs);
    } catch (e) {
      Object.assign(r, { status: "not applied", reason: `cannot write the mutation: ${e.message}` });
    } finally {
      restored = restore(m);
    }
    if (result) {
      Object.assign(r, {
        ...judge(result),
        exit: result.exit,
        signal: result.signal,
        startError: result.startError,
        timeoutMs,
        durationMs: result.durationMs,
        tail: tailOf(result.output, opts.tail),
      });
    }
    if (stopping) return halt(m, restored);
    if (!restored) {
      notRun("stopped: a restore failed");
      console.error(`mutate: stopped after ${r.id}: its restore failed.`);
      return report(4);
    }
    const changed = treeDiff(tree0, treeState(root));
    if (changed.length) {
      notRun(`stopped: the run of ${r.id} changed the checkout`);
      console.error(
        `mutate: the run of ${r.id} changed the checkout: ${changed.join(", ")}. Every later verdict would run on that ` +
          "tree, so it stops here; look at those paths before you commit.",
      );
      return report(4);
    }
  }

  // 3. The baseline again, and the checkout and every mutated file as they were.
  let code = null;
  if (results.some(ran)) {
    const again = await runBaselines(baselineAgain, "baseline again");
    if (again.halted) return halt(null);
    if (again.failed) {
      console.error(
        `mutate: the baseline FAILED when run again after the mutations (${again.failed}): the tests are not repeatable ` +
          "(a run leaves state behind), so no kill proves anything. Every kill now reads killed?.",
      );
      for (const r of results) {
        if (r.status === "killed") {
          Object.assign(r, { status: "killed?", reason: `the baseline failed when run again after the mutations (${again.failed}): this kill proves nothing` });
        }
      }
      code = 2;
    }
    const changed = treeDiff(tree0, treeState(root));
    if (changed.length) {
      console.error(`mutate: the checkout changed during the runs: ${changed.join(", ")}. Look at those paths before you commit.`);
      code = 4;
    }
    for (const r of applicable) {
      if (!ran(r)) continue;
      let now;
      try {
        now = onDisk(r.prepared);
      } catch (e) {
        now = { kind: e.message };
      }
      if (!isOriginal(r.prepared, now)) {
        console.error(`mutate: ${r.prepared.rel} is not its original bytes and mode at the end; git checkout -- ${r.prepared.rel} brings it back.`);
        code = 4;
      }
    }
  }
  return report(code);
}

async function main() {
  // A reader that goes away (`| head`) must not crash the harness before it writes --json or sets its exit code.
  for (const stream of [process.stdout, process.stderr]) {
    stream.on("error", (e) => {
      if (e.code !== "EPIPE") throw e;
    });
  }
  const opts = parseCli(process.argv.slice(2));
  const root = repoRoot();
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"]) process.on(sig, () => onSignal(sig));
  takeLock(root);
  try {
    return await session(opts, root);
  } finally {
    releaseLock();
  }
}

main().then(
  (code) => {
    process.exitCode = code;
    if (stopping) process.exit(code);
  },
  (e) => {
    if (active?.pid) killGroup(active.pid, "SIGKILL");
    if (current) restore(current);
    releaseLock();
    if (e instanceof UsageError) {
      console.error(`mutate: usage error: ${e.message}`);
      console.error(
        "usage: node scripts/mutate.mjs --file <path> --find <text> --replace <text> [--nth N] --test <path> [--test <path>...] | " +
          '--plan <plan.json>  [--cmd "<command>"] [--timeout <s>] [--allow-dirty] [--json <out>] [--tail N]',
      );
      process.exitCode = 2;
      return;
    }
    if (e instanceof Refusal) {
      console.error(`mutate: ${e.message}`);
      process.exitCode = 2;
      return;
    }
    console.error(`mutate: ${e.stack ?? e}`);
    process.exitCode = 2;
  },
);
