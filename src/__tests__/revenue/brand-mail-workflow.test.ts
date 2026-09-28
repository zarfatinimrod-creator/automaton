/**
 * .github/workflows/brand-mail.yml — the only way a venue question leaves the brand mailbox, and the probe that feeds
 * the report. These tests pin what would go wrong silently: a schedule that starts reading before step 8, a secret or
 * an input interpolated into a script, a real send from a branch, a send record or probe reading that never reaches
 * the repository. The second half runs the workflow's own step scripts in bash against stubs (the pattern of
 * mcp-il-tools-publish.test.ts), so a guard that lost a condition fails here even while its words are in the file.
 */
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const WORKFLOW = join(ROOT, ".github", "workflows", "brand-mail.yml");
const text = () => readFileSync(WORKFLOW, "utf8");
const wf = () => parse(text()) as Record<string, any>;

type Step = { name?: string; id?: string; uses?: string; run?: string; if?: string; env?: Record<string, string> };
const steps = (job: string): Step[] => wf().jobs[job].steps;
const stepNamed = (job: string, prefix: string): Step => {
  const s = steps(job).find((x) => x.name?.startsWith(prefix));
  if (!s) throw new Error(`no step "${prefix}" in ${job}`);
  return s;
};

describe("brand-mail.yml — what it is allowed to do", () => {
  it("runs only when dispatched: no schedule and no push until step 8 is done", () => {
    expect(Object.keys(wf().on)).toEqual(["workflow_dispatch"]);
    expect(text()).toMatch(/NO SCHEDULE YET/);
    expect(text()).toMatch(/Once step 8 is done, add the probe to colony\.yml/);
  });

  it("takes a command, a venue and a really_send switch that is off by default", () => {
    const inputs = wf().on.workflow_dispatch.inputs;
    expect(inputs.command).toMatchObject({ type: "choice", options: ["probe", "send"], default: "probe" });
    expect(inputs.venue.type).toBe("string");
    expect(inputs.really_send).toMatchObject({ type: "boolean", default: false });
    expect(wf().jobs.send.if).toBe("inputs.command == 'send'");
    expect(wf().jobs.probe.if).toBe("inputs.command == 'probe'");
  });

  it("reads the two brand secrets only through env, on the one step of each job that needs them", () => {
    const all = [...steps("send"), ...steps("probe")];
    for (const s of all) {
      expect(s.run ?? "", s.name).not.toMatch(/\$\{\{\s*(secrets|inputs)\./);
    }
    const withSecrets = all.filter((s) => JSON.stringify(s.env ?? {}).includes("secrets."));
    expect(withSecrets.map((s) => s.name)).toEqual(["Send (a dry run unless really_send)", "Probe the brand mailbox (read-only, numbers only)"]);
    for (const s of withSecrets) {
      expect(s.env!.BRAND_MAIL_ADDRESS).toBe("${{ secrets.BRAND_MAIL_ADDRESS }}");
      expect(s.env!.BRAND_MAIL_APP_PASSWORD).toBe("${{ secrets.BRAND_MAIL_APP_PASSWORD }}");
    }
    expect(text().match(/secrets\.[A-Z_]+/g)!.every((m) => /BRAND_MAIL_(ADDRESS|APP_PASSWORD)$/.test(m))).toBe(true);
  });

  it("serialises sends repository-wide and serialises the probe with the colony tick", () => {
    expect(wf().jobs.send.concurrency).toEqual({ group: "brand-mail-send", "cancel-in-progress": false });
    expect(wf().jobs.probe.concurrency).toEqual({ group: "colony-state", "cancel-in-progress": false });
  });

  it("runs the Python unit tests before anything leaves or is read", () => {
    for (const job of ["send", "probe"]) {
      const names = steps(job).map((s) => s.name ?? s.uses);
      const tests = names.findIndex((n) => n?.startsWith("Unit tests"));
      const act = names.findIndex((n) => n?.startsWith(job === "send" ? "Send" : "Probe the brand mailbox"));
      expect(tests).toBeGreaterThan(-1);
      expect(tests).toBeLessThan(act);
    }
  });

  it("writes the probe's numbers to the file the report reads", () => {
    expect(stepNamed("probe", "Probe the brand mailbox").run).toBe("python scripts/brand_mail.py probe --out state/colony/brand-mail.json");
  });
});

describe("brand-mail.yml — its step scripts, run in bash against stubs", () => {
  const scratch = mkdtempSync(join(tmpdir(), "brand-mail-wf-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));
  let n = 0;

  /** A fresh directory with stub `git` and `python` on PATH; every call is logged. `python` runs python3 when REAL_PYTHON=1. */
  function sandbox(gitDiffHasChanges = true) {
    const dir = join(scratch, String(n++));
    const bin = join(dir, "bin");
    mkdirSync(bin, { recursive: true });
    const stub = (name: string, body: string) => {
      writeFileSync(join(bin, name), `#!/usr/bin/env bash\n${body}`);
      chmodSync(join(bin, name), 0o755);
    };
    stub("git", `echo "git $*" >> "$STUB_LOG"
case "$1 $2" in
  "diff --cached") exit ${gitDiffHasChanges ? 1 : 0} ;;
  *) exit 0 ;;
esac
`);
    // Each argument bracketed, so a test can tell one argument from several.
    stub("python", `if [ "\${REAL_PYTHON:-0}" = 1 ]; then exec python3 "$@"; fi
{ printf 'python'; for a in "$@"; do printf ' [%s]' "$a"; done; printf '\\n'; } >> "$STUB_LOG"
`);
    const log = join(dir, "stub.log");
    writeFileSync(log, "");
    writeFileSync(join(dir, "summary"), "");
    return { dir, bin, log };
  }

  function run(s: Step, box: ReturnType<typeof sandbox>, env: Record<string, string>) {
    const r = spawnSync("bash", ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", s.run!], {
      cwd: box.dir,
      env: { PATH: `${box.bin}:${process.env.PATH ?? ""}`, STUB_LOG: box.log, GITHUB_STEP_SUMMARY: join(box.dir, "summary"), ...env },
      encoding: "utf8",
    });
    return { status: r.status, out: `${r.stdout}${r.stderr}`, calls: readFileSync(box.log, "utf8").split("\n").filter(Boolean) };
  }

  it("refuses a real send from any ref but main, and lets main through", () => {
    const guard = stepNamed("send", "Refuse a real send");
    expect(guard.if).toBe("inputs.really_send");
    for (const ref of ["refs/heads/claude/new-session-j071dx", "refs/pull/9/merge", ""]) {
      const r = run(guard, sandbox(), { GITHUB_REF: ref });
      expect(r.status, ref).toBe(1);
      expect(r.out).toMatch(/only from refs\/heads\/main/);
    }
    expect(run(guard, sandbox(), { GITHUB_REF: "refs/heads/main" }).status).toBe(0);
  });

  it("passes --really-send only when the switch is on, and needs a venue", () => {
    const send = stepNamed("send", "Send (a dry run");
    const dry = run(send, sandbox(), { VENUE: "crazygames", REALLY_SEND: "false" });
    expect(dry.status).toBe(0);
    expect(dry.calls).toEqual(["python [scripts/brand_mail.py] [send] [--venue] [crazygames]"]);
    const real = run(send, sandbox(), { VENUE: "crazygames", REALLY_SEND: "true" });
    expect(real.calls).toEqual(["python [scripts/brand_mail.py] [send] [--venue] [crazygames] [--really-send]"]);
    const none = run(send, sandbox(), { VENUE: "", REALLY_SEND: "true" });
    expect(none.status).toBe(2);
    expect(none.calls).toEqual([]);
  });

  it("passes a hostile venue to the script as one argument, never as shell", () => {
    const send = stepNamed("send", "Send (a dry run");
    const box = sandbox();
    const r = run(send, box, { VENUE: "x; touch pwned $(touch pwned2)", REALLY_SEND: "false" });
    expect(r.calls).toEqual(["python [scripts/brand_mail.py] [send] [--venue] [x; touch pwned $(touch pwned2)]"]);
    expect(spawnSync("ls", [box.dir]).stdout.toString()).not.toMatch(/pwned/);
  });

  it("commits only sent.json after a real send, even a failed one, with [skip ci]", () => {
    const commit = stepNamed("send", "Commit the send record");
    expect(commit.if).toBe("always() && inputs.really_send && steps.send.outcome != 'skipped'");
    const r = run(commit, sandbox(), { VENUE: "wix", GITHUB_REF_NAME: "main" });
    expect(r.status).toBe(0);
    expect(r.calls).toEqual([
      "git add research/owner-asks/sent.json",
      "git diff --cached --quiet",
      "git commit -m brand-mail: wix message recorded in sent.json [skip ci]",
      "git push origin HEAD:main",
    ]);
    const nothing = run(commit, sandbox(false), { VENUE: "wix", GITHUB_REF_NAME: "main" });
    expect(nothing.calls).toEqual(["git add research/owner-asks/sent.json", "git diff --cached --quiet"]);
  });

  it("commits the probe's numbers with a one-line summary and [skip ci]", () => {
    const commit = stepNamed("probe", "Commit the numbers");
    const cases: Array<[unknown, string]> = [
      [
        { configured: true, measuredAt: "2026-10-20T12:00:00Z", inbox: 5, unread: 2, repliesByVenue: {},
          accessibility: { received: 3, unanswered: 2, unansweredOver7Days: 1, oldestUnansweredAgeDays: 10 }, sentFolderFound: true },
        "git commit -m brand-mail probe: 2 unread, 1 accessibility overdue [skip ci]",
      ],
      [{ configured: false, measuredAt: "2026-10-20T12:00:00Z" }, "git commit -m brand-mail probe: not configured [skip ci]"],
    ];
    for (const [reading, message] of cases) {
      const box = sandbox();
      mkdirSync(join(box.dir, "state", "colony"), { recursive: true });
      writeFileSync(join(box.dir, "state", "colony", "brand-mail.json"), JSON.stringify(reading));
      const r = run(commit, box, { GITHUB_REF_NAME: "main", REAL_PYTHON: "1" });
      expect(r.status, r.out).toBe(0);
      expect(r.calls).toEqual(["git add state/colony/brand-mail.json", "git diff --cached --quiet", message, "git push origin HEAD:main"]);
    }
  });
});
