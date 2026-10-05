/**
 * .github/workflows/brand-mail.yml — the only way a venue question leaves the brand mailbox, the probe that feeds
 * the report, and the Pro refund responder (RULING-2026-09-29-lines (h)). These tests pin what would go wrong
 * silently: a scheduled run that reads or commits before step 8, a secret or an input interpolated into a script, a
 * real send or a real refund from a branch, a manual refund run that is not a dry run by default, a send record or
 * probe reading that never reaches the repository. The second half runs the workflow's own step scripts in bash against stubs (the pattern of
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
  it("runs when dispatched, and on a schedule that runs the probe and the refund responder - never a send, never on push", () => {
    expect(Object.keys(wf().on)).toEqual(["schedule", "workflow_dispatch"]);
    const crons = wf().on.schedule.map((c: { cron: string }) => c.cron);
    expect(crons).toHaveLength(1);
    expect(crons[0]).toMatch(/^\d+ [\d,*/]+ \* \* \*$/);
    expect(wf().jobs.send.if).toBe("inputs.command == 'send'");
    expect(wf().jobs.probe.if).toBe("github.event_name == 'schedule' || inputs.command == 'probe'");
    expect(wf().jobs["respond-refunds"].if).toBe("github.event_name == 'schedule' || inputs.command == 'respond-refunds'");
    expect(text()).toMatch(/inert until step 8/i);
  });

  it("takes a command, a venue, a really_send switch and a really_refund switch that are off by default, and the dry run's digest", () => {
    const inputs = wf().on.workflow_dispatch.inputs;
    expect(inputs.command).toMatchObject({ type: "choice", options: ["probe", "send", "respond-refunds"], default: "probe" });
    expect(inputs.venue.type).toBe("string");
    expect(inputs.really_send).toMatchObject({ type: "boolean", default: false });
    expect(inputs.really_refund).toMatchObject({ type: "boolean", default: false });
    expect(inputs.message_sha256).toMatchObject({ type: "string", required: false });
  });

  it("reads the secrets only through env, on the one step of each job that needs them; the Gumroad token only where it refunds", () => {
    const all = [...steps("send"), ...steps("probe"), ...steps("respond-refunds")];
    for (const s of all) {
      expect(s.run ?? "", s.name).not.toMatch(/\$\{\{\s*(secrets|inputs)\./);
    }
    const withSecrets = all.filter((s) => JSON.stringify(s.env ?? {}).includes("secrets."));
    expect(withSecrets.map((s) => s.name)).toEqual([
      "Send (a dry run unless really_send)",
      "Probe the brand mailbox (read-only, numbers only)",
      "Respond to refund requests (a dry run unless scheduled or really_refund)",
    ]);
    for (const s of withSecrets) {
      expect(s.env!.BRAND_MAIL_ADDRESS).toBe("${{ secrets.BRAND_MAIL_ADDRESS }}");
      expect(s.env!.BRAND_MAIL_APP_PASSWORD).toBe("${{ secrets.BRAND_MAIL_APP_PASSWORD }}");
    }
    expect(withSecrets.filter((s) => s.env!.GUMROAD_ACCESS_TOKEN).map((s) => s.name)).toEqual([withSecrets[2].name]);
    expect(withSecrets[2].env!.GUMROAD_ACCESS_TOKEN).toBe("${{ secrets.GUMROAD_ACCESS_TOKEN }}");
    expect(text().match(/secrets\.[A-Z_]+/g)!.every((m) => /(BRAND_MAIL_(ADDRESS|APP_PASSWORD)|GUMROAD_ACCESS_TOKEN)$/.test(m))).toBe(true);
  });

  it("gets the secrets only through the brand-mailbox environment, which the owner limits to main", () => {
    // Repository secrets reach every branch and every workflow; an environment's reach only the jobs that name it,
    // and only on the branches its deployment rule admits (exposure review, finding 1).
    expect(wf().jobs.send.environment).toBe("brand-mailbox");
    expect(wf().jobs.probe.environment).toBe("brand-mailbox");
    expect(wf().jobs["respond-refunds"].environment).toBe("brand-mailbox");
    expect(text()).toMatch(/THE SECRETS LIVE IN THE ENVIRONMENT brand-mailbox/);
  });

  it("serialises sends repository-wide, and gives the probe its own group so it never displaces a colony tick", () => {
    expect(wf().jobs.send.concurrency).toEqual({ group: "brand-mail-send", "cancel-in-progress": false });
    expect(wf().jobs.probe.concurrency).toEqual({ group: "brand-mail-probe", "cancel-in-progress": false });
    // Two responders reading the same unanswered mail could refund and answer twice; one at a time.
    expect(wf().jobs["respond-refunds"].concurrency).toEqual({ group: "brand-mail-respond-refunds", "cancel-in-progress": false });
    const colony = parse(readFileSync(join(ROOT, ".github", "workflows", "colony.yml"), "utf8")) as Record<string, any>;
    expect(colony.concurrency.group).not.toBe(wf().jobs.probe.concurrency.group);
  });

  it("runs the Python unit tests before anything leaves, is read or is refunded", () => {
    const acts: Record<string, string> = { send: "Send", probe: "Probe the brand mailbox", "respond-refunds": "Respond to refund requests" };
    for (const job of ["send", "probe", "respond-refunds"]) {
      const names = steps(job).map((s) => s.name ?? s.uses);
      const tests = names.findIndex((n) => n?.startsWith("Unit tests"));
      const act = names.findIndex((n) => n?.startsWith(acts[job]));
      expect(tests).toBeGreaterThan(-1);
      expect(tests).toBeLessThan(act);
    }
  });

  it("writes the probe's numbers to the file the report reads", () => {
    expect(stepNamed("probe", "Probe the brand mailbox").run).toBe("python scripts/brand_mail.py probe --out state/colony/brand-mail.json");
  });

  // RULING-2026-10-05-refund-state (b): a refund Gumroad refused for balance waits as \Flagged on the request in the
  // brand mailbox, so the responder commits nothing. Its job is back on contents: read, no step of it holds a token, and
  // no credentials are stored for the step that reads untrusted mail beside the mailbox password and the Gumroad token.
  it("the responder commits nothing: contents: read, no commit or push, no token in any step, nothing stored in .git/config", () => {
    const job = wf().jobs["respond-refunds"];
    expect(job.permissions).toEqual({ contents: "read" });
    for (const s of steps("respond-refunds")) {
      expect(s.run ?? "", s.name ?? s.uses).not.toMatch(/git (commit|push)|remote push/);
      expect(JSON.stringify(s), s.name ?? s.uses).not.toMatch(/github\.token|GITHUB_TOKEN|GH_TOKEN/);
    }
    expect(JSON.stringify(job)).not.toMatch(/github\.token|GITHUB_TOKEN|GH_TOKEN/);
    const checkout = steps("respond-refunds").find((s) => s.uses?.startsWith("actions/checkout")) as { with?: Record<string, unknown> };
    expect(checkout.with?.["persist-credentials"]).toBe(false);
    expect(checkout.with).not.toHaveProperty("fetch-depth");
    const names = steps("respond-refunds").map((s) => s.name ?? s.uses);
    expect(names.at(-1)).toMatch(/^Respond to refund requests/);
    expect(text()).not.toContain("refund-retries");
  });

  it("grants write only where a job commits: read for the workflow, write on send (sent.json) and probe (brand-mail.json)", () => {
    expect(wf().permissions).toEqual({ contents: "read" });
    expect(wf().jobs.send.permissions).toEqual({ contents: "write" });
    expect(wf().jobs.probe.permissions).toEqual({ contents: "write" });
  });

  it("nothing skips the respond step on the schedule: no job dependency, and no step condition but the main-ref guard's", () => {
    // The probe vouches for the responder by these same lines (scripts/brand_mail.py refund_job_runs_on_schedule);
    // a condition here would leave every scheduled run green with nobody answered (fixer review of 29.9, finding 2).
    const job = wf().jobs["respond-refunds"];
    expect(job.needs).toBeUndefined();
    expect(job.environment).toBe("brand-mailbox");
    expect(stepNamed("respond-refunds", "Respond to refund requests").if).toBeUndefined();
    const conditions = steps("respond-refunds").filter((s) => s.if !== undefined).map((s) => [s.name, s.if]);
    expect(conditions).toEqual([
      ["Refuse a real refund run from any ref but main", "github.event_name == 'workflow_dispatch' && inputs.really_refund"],
    ]);
  });

  it("the responder has Node for the product's refund command", () => {
    const node = steps("respond-refunds").find((s) => s.uses?.startsWith("actions/setup-node"));
    expect((node as { with?: Record<string, unknown> }).with?.["node-version"]).toBe(22);
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

  it("passes --really-send and the digest only when the switch is on, and needs a venue", () => {
    const send = stepNamed("send", "Send (a dry run");
    expect(send.env!.MESSAGE_SHA256).toBe("${{ inputs.message_sha256 }}");
    const dry = run(send, sandbox(), { VENUE: "crazygames", REALLY_SEND: "false", MESSAGE_SHA256: "ab12" });
    expect(dry.status).toBe(0);
    expect(dry.calls).toEqual(["python [scripts/brand_mail.py] [send] [--venue] [crazygames]"]);
    const real = run(send, sandbox(), { VENUE: "crazygames", REALLY_SEND: "true", MESSAGE_SHA256: "ab12" });
    expect(real.calls).toEqual(["python [scripts/brand_mail.py] [send] [--venue] [crazygames] [--really-send] [--message-sha256] [ab12]"]);
    // No digest: still one empty argument, which the script refuses (brand_mail.py's own test).
    const bare = run(send, sandbox(), { VENUE: "crazygames", REALLY_SEND: "true", MESSAGE_SHA256: "" });
    expect(bare.calls).toEqual(["python [scripts/brand_mail.py] [send] [--venue] [crazygames] [--really-send] [--message-sha256] []"]);
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

  it("commits only sent.json after a real send, even a failed one, with [skip ci], and puts it on the run page first", () => {
    const commit = stepNamed("send", "Commit the send record");
    expect(commit.if).toBe("always() && inputs.really_send && steps.send.outcome != 'skipped'");
    const withRecord = () => {
      const box = sandbox();
      mkdirSync(join(box.dir, "research", "owner-asks"), { recursive: true });
      writeFileSync(join(box.dir, "research", "owner-asks", "sent.json"), '{"sent": [{"messageId": "<1.wix@brand.example>"}]}\n');
      return box;
    };
    const box = withRecord();
    const r = run(commit, box, { VENUE: "wix", GITHUB_REF_NAME: "main" });
    expect(r.status).toBe(0);
    expect(r.calls).toEqual([
      "git add research/owner-asks/sent.json",
      "git diff --cached --quiet",
      "git commit -m brand-mail: wix message recorded in sent.json [skip ci]",
      "git push origin HEAD:main",
    ]);
    expect(readFileSync(join(box.dir, "summary"), "utf8")).toContain('"messageId": "<1.wix@brand.example>"');
    const nothing = run(commit, sandbox(false), { VENUE: "wix", GITHUB_REF_NAME: "main" });
    expect(nothing.calls).toEqual(["git add research/owner-asks/sent.json", "git diff --cached --quiet"]);
  });

  it("when every push fails, points to the run summary and says the Sent-folder check holds the venue", () => {
    const commit = stepNamed("send", "Commit the send record");
    const box = sandbox();
    mkdirSync(join(box.dir, "research", "owner-asks"), { recursive: true });
    writeFileSync(join(box.dir, "research", "owner-asks", "sent.json"), "{}\n");
    writeFileSync(join(box.bin, "git"), `#!/usr/bin/env bash\necho "git $*" >> "$STUB_LOG"\ncase "$1 $2" in\n  "diff --cached") exit 1 ;;\n  "push origin") exit 1 ;;\n  *) exit 0 ;;\nesac\n`);
    const r = run(commit, box, { VENUE: "crazygames", GITHUB_REF_NAME: "main" });
    expect(r.status).toBe(1);
    expect(r.calls.filter((c) => c.startsWith("git push")).length).toBe(3);
    expect(r.out).toMatch(/in this run's summary/);
    expect(r.out).toMatch(/every send to crazygames is refused by the Sent-folder check/);
  });

  it("refuses a real refund run from any ref but main, and a scheduled run passes through (GitHub runs it on the default branch)", () => {
    const guard = stepNamed("respond-refunds", "Refuse a real refund run");
    expect(guard.if).toBe("github.event_name == 'workflow_dispatch' && inputs.really_refund");
    for (const ref of ["refs/heads/claude/new-session-j071dx", "refs/pull/9/merge", ""]) {
      const r = run(guard, sandbox(), { GITHUB_REF: ref });
      expect(r.status, ref).toBe(1);
      expect(r.out).toMatch(/only from refs\/heads\/main/);
    }
    expect(run(guard, sandbox(), { GITHUB_REF: "refs/heads/main" }).status).toBe(0);
  });

  it("applies refunds on the schedule, and on a dispatch only when really_refund is ticked: otherwise a dry run", () => {
    const respond = stepNamed("respond-refunds", "Respond to refund requests");
    expect(respond.env!.EVENT).toBe("${{ github.event_name }}");
    expect(respond.env!.REALLY_REFUND).toBe("${{ inputs.really_refund }}");
    const cases: Array<[Record<string, string>, string]> = [
      [{ EVENT: "schedule", REALLY_REFUND: "" }, "python [scripts/brand_mail.py] [respond-refunds] [--apply]"],
      [{ EVENT: "workflow_dispatch", REALLY_REFUND: "false" }, "python [scripts/brand_mail.py] [respond-refunds]"],
      [{ EVENT: "workflow_dispatch", REALLY_REFUND: "" }, "python [scripts/brand_mail.py] [respond-refunds]"],
      [{ EVENT: "workflow_dispatch", REALLY_REFUND: "true" }, "python [scripts/brand_mail.py] [respond-refunds] [--apply]"],
    ];
    for (const [env, call] of cases) {
      const r = run(respond, sandbox(), env);
      expect(r.status, JSON.stringify(env)).toBe(0);
      expect(r.calls, JSON.stringify(env)).toEqual([call]);
    }
  });

  it("a scheduled probe before step 8 commits nothing; a dispatched one records that it is not configured", () => {
    const commit = stepNamed("probe", "Commit the numbers");
    expect(commit.env!.EVENT).toBe("${{ github.event_name }}");
    const box = sandbox();
    mkdirSync(join(box.dir, "state", "colony"), { recursive: true });
    writeFileSync(join(box.dir, "state", "colony", "brand-mail.json"), JSON.stringify({ configured: false, measuredAt: "2026-10-20T12:00:00Z" }));
    const scheduled = run(commit, box, { GITHUB_REF_NAME: "main", REAL_PYTHON: "1", EVENT: "schedule" });
    expect(scheduled.status, scheduled.out).toBe(0);
    expect(scheduled.calls).toEqual([]);
    expect(scheduled.out).toMatch(/step 8/i);
    const dispatched = run(commit, box, { GITHUB_REF_NAME: "main", REAL_PYTHON: "1", EVENT: "workflow_dispatch" });
    expect(dispatched.calls).toContain("git commit -m brand-mail probe: not configured [skip ci]");
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
