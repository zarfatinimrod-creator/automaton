#!/usr/bin/env node
/**
 * mutate — the mutation-test harness: break the code on purpose, one exact edit at a time, and see whether a test fails.
 *
 *   node scripts/mutate.mjs --file <path> --find <text> --replace <text> [--nth N] [--note <label>] --test <path>...
 *   node scripts/mutate.mjs --plan <plan.json>     a JSON array of {file, find, replace, test?, note?, id?, nth?}
 *                                                  (test: a path or an array of them; the --test paths otherwise)
 *   --cmd "<command>"  the test command for every mutation instead of `npx vitest run`, e.g.
 *                      --cmd "scripts/pytest-product.sh chart-explainer". It is split on spaces and run without a shell
 *                      (a pipe would judge by its last command, the `vitest | grep` failure this project had twice);
 *                      each mutation's test paths are appended to it.
 *   --allow-dirty      mutate a file with uncommitted changes, or one git does not track (it is still restored from
 *                      memory, but `git checkout -- <file>` is then no way back)
 *   --json <out>       write the baseline and the results as JSON
 *   --tail <n>         lines of output kept per run (default 6)
 * Run it from the repository root: paths are relative to the working directory, and the commands run there. A text
 * that starts with "-" needs the = form: --find=-1. Example plan entry:
 *   {"file": "scripts/capture-check.mjs", "find": "< WEAK_SIGN_TEXT", "replace": "<= WEAK_SIGN_TEXT",
 *    "test": "src/__tests__/revenue/capture-check.test.ts", "note": "weak-sign bound"}
 *
 * What it does, in order:
 *   1. Checks every mutation before running anything. The file must be a regular file inside the repository, tracked
 *      and unmodified in git (unless --allow-dirty); --find must occur exactly once (or --nth names which), and the
 *      replacement must differ from it. A mutation that fails a check is "not applied", never killed or survived.
 *   2. Runs each distinct test command once on the untouched tree (the baseline). A failing baseline stops everything
 *      with exit 2: a mutation "killed" by an already-failing test proves nothing. For the default vitest command a
 *      baseline with no "Tests" line fails too.
 *   3. For each mutation: writes the edit (bytes, so CRLF and non-UTF-8 files are safe), runs the command, and restores
 *      the original bytes in a finally, then checks the file's sha256 against the original. The verdict is the exit
 *      code: non-zero "killed", zero "survived". A non-zero exit that shows no test failed is "killed?": the runner died
 *      on a signal or could not start, vitest said "No test files found" or "Tests  no tests" (a test file failed to
 *      load), there is no summary line at all (vitest "Tests ..." or pytest "N passed/failed ... in Ns"), or the summary
 *      counts no failure.
 *   4. SIGINT, SIGTERM or SIGHUP stops the runner's process group, restores the file and exits 130/143/129. SIGKILL
 *      cannot be caught: that is what the git check in step 1 is for.
 *
 * Exit: 0 every applied mutation was killed; 1 any survived or is killed?; 2 a usage error, a failing baseline or any
 * mutation not applied (the others still run); 4 a restore that did not bring the original bytes back (it stops at
 * once, saves the original bytes to a temporary file and names it and `git checkout -- <file>`).
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { constants, tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_CMD = ["npx", "vitest", "run"];
const KEEP_OUTPUT = 256 * 1024; // characters of output kept per run: the summary is at the end

class UsageError extends Error {}
const usage = (message) => {
  throw new UsageError(message);
};

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const plain = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

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
  const tail = values.tail === undefined ? 6 : positiveInt(values.tail, "--tail");
  const globalTests = values.test ?? [];
  mutations = mutations.map((m, i) => {
    const tests = m.test === undefined ? globalTests : [m.test].flat();
    if (cmd === DEFAULT_CMD && !tests.length) {
      usage(`mutation ${m.id ?? i + 1} has no --test paths: the default command (npx vitest run) would run the whole suite; name the tests or pass --cmd`);
    }
    return { ...m, id: m.id ?? `M${i + 1}`, nth: m.nth === undefined ? undefined : positiveInt(m.nth, "--nth"), tests, argv: [...cmd, ...tests] };
  });
  return { mutations, isDefaultCmd: cmd === DEFAULT_CMD, allowDirty: values["allow-dirty"] === true, json: values.json, tail };
}

function positiveInt(value, name) {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s)) usage(`${name} must be a whole number from 1, not "${s}"`);
  return Number(s);
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

function repoRoot() {
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" });
  if (r.status !== 0 || !r.stdout.trim()) usage("not inside a git repository (run it from the repository root)");
  return realpathSync(r.stdout.trim());
}

/** Checks one mutation and computes its bytes. Returns the prepared mutation, or a reason it is not applied. */
function prepare(m, root, allowDirty) {
  const abs = resolve(m.file);
  if (!existsSync(abs)) return { reason: `no such file: ${m.file}` };
  const real = realpathSync(abs);
  if (real !== root && !real.startsWith(root + sep)) return { reason: `${m.file} is outside the repository (${root})` };
  if (!statSync(real).isFile()) return { reason: `${m.file} is not a regular file` };
  const rel = relative(root, real);
  if (!allowDirty) {
    const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", rel], { cwd: root, encoding: "utf8" });
    if (tracked.status !== 0) {
      return { reason: `${rel} is not tracked by git, so git checkout could not bring it back (--allow-dirty to mutate it anyway)` };
    }
    const status = spawnSync("git", ["status", "--porcelain", "--", rel], { cwd: root, encoding: "utf8" });
    if (status.status !== 0 || status.stdout.trim()) {
      return { reason: `${rel} has uncommitted changes, so git checkout would lose them (commit first, or --allow-dirty)` };
    }
  }
  if (m.find === "") return { reason: "--find is empty" };
  if (m.find === m.replace) return { reason: "the replacement is identical to the text found" };
  const original = readFileSync(real);
  const needle = Buffer.from(m.find, "utf8");
  const at = [];
  for (let i = original.indexOf(needle); i !== -1; i = original.indexOf(needle, i + needle.length)) at.push(i);
  if (!at.length) return { reason: `--find text not found in ${rel}` };
  if (m.nth === undefined && at.length > 1) return { reason: `--find text found ${at.length} times in ${rel}; name one with --nth (1-${at.length})` };
  if (m.nth !== undefined && m.nth > at.length) return { reason: `--nth ${m.nth}, but the text is found ${at.length} time(s) in ${rel}` };
  const pos = at[(m.nth ?? 1) - 1];
  const mutated = Buffer.concat([original.subarray(0, pos), Buffer.from(m.replace, "utf8"), original.subarray(pos + needle.length)]);
  return { real, rel, original, hash: sha256(original), mutated };
}

/** What the output shows about tests: whether any ran, the summary line, and whether it counts a failure. */
function summarize(output) {
  const text = plain(output);
  if (/No test files found/.test(text)) return { ran: false, reason: 'vitest said "No test files found": no test ran' };
  if (/^\s*Tests\s+no tests\b/m.test(text)) return { ran: false, reason: 'vitest said "Tests  no tests": a test file failed to load, no test ran' };
  const vitest = text.match(/^[ \t]*Tests[ \t]+\d+ (?:passed|failed|skipped|todo)\b.*$/m);
  if (vitest) return { ran: true, line: vitest[0].trim(), failed: /\bfailed\b/.test(vitest[0]) };
  const pytest = [...text.matchAll(/^.*\b\d+ (?:passed|failed|errors?)\b.*\bin \d+(?:\.\d+)?s\b.*$/gm)].pop();
  if (pytest) return { ran: true, line: pytest[0].trim(), failed: /\b\d+ (?:failed|errors?)\b/.test(pytest[0]) };
  return { ran: false, reason: 'no test summary in the output (a vitest "Tests ..." line or a pytest "N passed/failed ... in Ns" line), so nothing shows a test ran' };
}

function judge(run) {
  if (run.startError) return { status: "killed?", reason: `the command did not start: ${run.startError}` };
  if (run.signal) return { status: "killed?", reason: `the runner was killed by ${run.signal}: no test verdict` };
  if (run.exit === 0) return { status: "survived" };
  const s = summarize(run.output);
  if (!s.ran) return { status: "killed?", reason: s.reason };
  if (!s.failed) return { status: "killed?", reason: `exit ${run.exit}, but the summary counts no failed test: ${s.line}` };
  return { status: "killed" };
}

const tailOf = (output, n) => plain(output).split("\n").filter((l) => l.trim()).slice(-n);

// The run in progress and the file mutated right now, for the signal handler.
let active = null;
let current = null;
let stopping = false;

function run(argv) {
  return new Promise((done) => {
    const t0 = performance.now();
    let output = "";
    let settled = false;
    const finish = (r) => {
      if (settled) return;
      settled = true;
      active = null;
      done({ ...r, output, durationMs: Math.round(performance.now() - t0) });
    };
    // Its own process group, so a signal can stop the runner and everything it started (vitest's workers).
    const child = spawn(argv[0], argv.slice(1), { detached: true, stdio: ["ignore", "pipe", "pipe"] });
    active = child;
    const keep = (chunk) => {
      output += chunk;
      if (output.length > KEEP_OUTPUT) output = output.slice(-KEEP_OUTPUT);
    };
    child.stdout.setEncoding("utf8").on("data", keep);
    child.stderr.setEncoding("utf8").on("data", keep);
    child.on("error", (e) => finish({ exit: null, signal: null, startError: e.message }));
    child.on("close", (exit, signal) => finish({ exit, signal }));
  });
}

/** Writes the original bytes back and checks the hash. On a mismatch, saves the original elsewhere and says so. */
function restore(m) {
  let error = null;
  try {
    writeFileSync(m.real, m.original);
  } catch (e) {
    error = e;
  }
  let now = null;
  try {
    now = sha256(readFileSync(m.real));
  } catch (e) {
    error ??= e;
  }
  if (now === m.hash) {
    if (current === m) current = null;
    return true;
  }
  let saved;
  try {
    const dir = mkdtempSync(join(tmpdir(), "mutate-rescue-"));
    saved = join(dir, basename(m.real));
    writeFileSync(saved, m.original);
  } catch (e) {
    saved = `(nowhere: ${e.message})`;
  }
  console.error(
    `mutate: RESTORE FAILED: ${m.rel} is not its original bytes (${error ? error.message : `sha256 ${now} != ${m.hash}`}).\n` +
      `mutate: the original bytes saved to ${saved}\n` +
      `mutate: git checkout -- ${m.rel} brings back the committed version`,
  );
  return false;
}

function onSignal(sig) {
  const code = 128 + constants.signals[sig];
  if (stopping) process.exit(code);
  stopping = true;
  const child = active;
  if (child?.pid) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  const m = current;
  const ok = m ? restore(m) : true;
  console.error(`mutate: ${sig}: stopped${m ? (ok ? `; ${m.rel} restored` : "") : "; no file was mutated"}`);
  const exit = () => process.exit(ok ? code : 4);
  if (child && child.exitCode === null && child.signalCode === null) {
    child.once("close", exit);
    setTimeout(exit, 2000);
  } else exit();
}

function reportLine(r, idWidth) {
  const verdict = r.startError ? "no start" : r.signal ? r.signal : r.exit === undefined ? "-" : `exit ${r.exit}`;
  const time = r.durationMs === undefined ? "" : seconds(r.durationMs);
  const cols = [r.id.padEnd(idWidth), r.status.padEnd(11), verdict.padEnd(8), time.padStart(6), r.file];
  if (r.note) cols.push(r.note);
  return cols.join("  ");
}

async function main() {
  const opts = parseCli(process.argv.slice(2));
  const root = repoRoot();
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => onSignal(sig));

  const results = opts.mutations.map((m) => {
    const p = prepare(m, root, opts.allowDirty);
    const base = { id: m.id, note: m.note, file: m.file, find: m.find, replace: m.replace, nth: m.nth, tests: m.tests, command: m.argv };
    return p.reason ? { ...base, status: "not applied", reason: p.reason } : { ...base, prepared: p };
  });
  const applicable = results.filter((r) => r.prepared);
  const idWidth = Math.max(...results.map((r) => r.id.length));
  const baseline = [];
  const report = (exitCode) => {
    const counts = { applied: 0, killed: 0, survived: 0, "killed?": 0, "not applied": 0 };
    for (const r of results) {
      if (r.status in counts) counts[r.status] += 1;
      if (r.status && r.status !== "not applied" && r.status !== "not run") counts.applied += 1;
    }
    for (const r of results) {
      console.log(reportLine(r, idWidth));
      if (r.reason) console.log(`    why: ${r.reason}`);
      if (r.status === "survived" || r.status === "killed?") for (const l of r.tail) console.log(`    | ${l}`);
    }
    const code = exitCode ?? (counts["not applied"] ? 2 : counts.survived || counts["killed?"] ? 1 : 0);
    console.log(
      `mutate: ${counts.applied} applied: ${counts.killed} killed, ${counts.survived} survived, ` +
        `${counts["killed?"]} killed?; ${counts["not applied"]} not applied`,
    );
    if (opts.json) {
      const clean = results.map(({ prepared, ...r }) => r);
      writeFileSync(opts.json, `${JSON.stringify({ baseline, results: clean, counts, exitCode: code }, null, 2)}\n`);
    }
    return code;
  };

  // 1. The baseline: each distinct command once, on the untouched tree.
  const commands = [...new Map(applicable.map((r) => [JSON.stringify(r.command), r.command])).values()];
  for (const [i, argv] of commands.entries()) {
    const b = await run(argv);
    const s = summarize(b.output);
    let ok = !b.startError && !b.signal && b.exit === 0;
    let why = b.startError ? `did not start: ${b.startError}` : b.signal ? `killed by ${b.signal}` : `exit ${b.exit}`;
    if (ok && opts.isDefaultCmd && !s.ran) {
      ok = false;
      why = `exit 0, but ${s.reason}`;
    }
    const tail = tailOf(b.output, opts.tail);
    baseline.push({ command: argv, exit: b.exit, signal: b.signal, durationMs: b.durationMs, ok, tail });
    console.log(`mutate: baseline ${i + 1}/${commands.length}: ${argv.join(" ")}: ${why}, ${seconds(b.durationMs)}`);
    if (!ok) {
      for (const l of tail) console.log(`    | ${l}`);
      console.error(
        `mutate: the baseline FAILED (${why}). A mutation "killed" by an already-failing test proves nothing: ` +
          "fix the tests first. No file was mutated.",
      );
      return report(2);
    }
    if (!s.ran) console.log(`mutate: note: ${s.reason}; every kill by this command will read killed?`);
  }

  // 2. The mutations, one at a time, each restored (and its hash checked) before the next.
  for (const r of results) {
    if (!r.prepared) continue;
    if (stopping) await new Promise(() => {}); // the signal handler exits
    const m = r.prepared;
    if (sha256(readFileSync(m.real)) !== m.hash) {
      Object.assign(r, { status: "not applied", reason: `${m.rel} changed on disk during an earlier run` });
      continue;
    }
    let result;
    let restored = false;
    current = m;
    try {
      writeFileSync(m.real, m.mutated);
      result = await run(r.command);
    } finally {
      restored = restore(m);
    }
    const v = judge(result);
    Object.assign(r, {
      status: v.status,
      reason: v.reason,
      exit: result.exit,
      signal: result.signal,
      startError: result.startError,
      durationMs: result.durationMs,
      tail: tailOf(result.output, opts.tail),
    });
    if (!restored) {
      for (const rest of results) {
        if (rest.prepared && !rest.status) Object.assign(rest, { status: "not run", reason: "stopped: a restore failed" });
      }
      console.error(`mutate: stopped after ${r.id}: its restore failed.`);
      return report(4);
    }
  }
  return report();
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (e) => {
    if (current) restore(current);
    if (e instanceof UsageError) {
      console.error(`mutate: usage error: ${e.message}`);
      console.error(
        'usage: node scripts/mutate.mjs --file <path> --find <text> --replace <text> [--nth N] --test <path>... | ' +
          '--plan <plan.json>  [--cmd "<command>"] [--allow-dirty] [--json <out>] [--tail N]',
      );
      process.exitCode = 2;
      return;
    }
    console.error(`mutate: ${e.stack ?? e}`);
    process.exitCode = 2;
  },
);
