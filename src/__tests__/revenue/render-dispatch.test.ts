import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/render-dispatch.sh (logs/CHANNEL_LOOP.md §9, tick 51 item 1) is the chain the main thread ran by hand five
 * times in ticks 47-51: validate a lines file with render-watch's own parser and the terms gate, dispatch
 * render-watch.yml with it, find the run, wait for it, fetch and fast-forward the branch, run capture-check on the new
 * captures and count their addresses by kind. Nothing here touches the network or GitHub: gh is a stub that records
 * its arguments and answers with canned JSON, and origin is a bare repository in a temp dir whose branch gains the
 * "workflow's" capture commit, so the fetch and the fast-forward are real. What must hold:
 *   - nothing is dispatched (no gh call at all) for an empty file, a line render-watch's parser refuses, or a line
 *     whose site the terms gate refuses;
 *   - the dispatch body is {"ref": <ref>, "inputs": {"urls": <the file, byte for byte>}};
 *   - the run is the one on <ref> created at or after the dispatch (less a clock allowance) that was not listed before
 *     it, whichever way the local clock is off; finding it is bounded; the wait stops when it completes, and anything
 *     but success fails; a run that never completes times out naming the run;
 *   - a dirty checkout or another branch is fetched, never merged (exit 4); --no-wait neither waits nor fetches;
 *   - the final exit is capture-check's (0 or 3), and the address report names kinds and counts, never an address.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
/** What the script runs, copied into each scratch checkout (the script uses the repository it sits in). */
const COPY = ["render-dispatch.sh", "render-watch.mjs", "queue-zero-test.mjs", "capture-check.mjs", "remask-captures.mjs", "freeze-capture.mjs", "address-kinds.mjs"];
const REF = "loop-branch";

const scratch = realpathSync(mkdtempSync(join(tmpdir(), "render-dispatch-test-")));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const EMPTY_GITCONFIG = join(scratch, "gitconfig");
writeFileSync(EMPTY_GITCONFIG, "");
const gitEnv = { GIT_CONFIG_GLOBAL: EMPTY_GITCONFIG, GIT_CONFIG_NOSYSTEM: "1", GIT_CEILING_DIRECTORIES: scratch };
const who = ["-c", "user.name=toy", "-c", "user.email=toy", "-c", "commit.gpgsign=false"];

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}

const VERDICTS = {
  sites: {
    "met.example": { verdict: "CONDITIONAL_MET", source: "test", checked: "2026-10-06" },
    "open.example": { verdict: "NOT_BARRED", source: "test", checked: "2026-10-06" },
    "barred.example": { verdict: "BARRED", source: "test: its terms bar automated access", checked: "2026-10-06" },
    // Ruling 6.10 row 21 (c): a TERMS_PENDING site, and a NO_TERMS site whose terms page is a shell (kind K4).
    "pending.example": { verdict: "TERMS_PENDING", source: "test", checked: "2026-10-06", note: "terms unread" },
    "shell.example": { verdict: "NO_TERMS", source: "test", checked: "2026-10-06", note: "shell: the terms page is a React shell" },
  },
};

const T = "\t";
const LINES = [
  "# the dispatch of a test — comments and the tab separator travel as they are",
  `https://met.example/rules${T}prize-met-rules`,
  "",
  `https://open.example/faq${T}prize-open-faq${T}js`,
  "",
].join("\n");

// An address and a mask are built from parts, so no address is ever written into this file.
const LOCAL = ["fixture", "person"].join(".");
const DOMAIN = ["dept", "example", "edu"].join(".");
const ADDRESS = [LOCAL, DOMAIN].join("@");
const MASK = ["[redacted:email]", DOMAIN].join("@");
// An asset name has the shape of an address and is not one.
const ASSET = ["logo", "2x.png"].join("@");
// The forms an address takes in a capture besides the plain one: encoded, escaped, look-alike, outside ASCII.
const FORMS = [
  [LOCAL, DOMAIN].join("%" + "40"),
  [LOCAL, DOMAIN].join("&#" + "64;"),
  [LOCAL, DOMAIN].join("&#x" + "40;"),
  [LOCAL, DOMAIN].join("&" + "commat;"),
  [LOCAL, DOMAIN].join("\\" + "u0040"),
  [LOCAL, DOMAIN].join("\uFF20"),
  [LOCAL, DOMAIN].join("\uFE6B"),
  ["jos", "\u00e9", "@", DOMAIN].join(""),
  [LOCAL, "@", "\u00fc", DOMAIN].join(""),
];

/** A capture as render-watch stores one: meta, html body, extracted text. `words` sets the text's length. */
function capture(dir: string, slug: string, url: string, extra: string, words = 300) {
  const text = `${Array.from({ length: words }, (_, i) => `rule${i}`).join(" ")}\n${extra}\n`;
  const html = `<html><body><p>${text}</p></body></html>\n`;
  writeFileSync(join(dir, `${slug}.txt`), text);
  writeFileSync(join(dir, `${slug}.html`), html);
  const meta = {
    url,
    fetchedAt: "2026-10-06T00:00:00.000Z",
    status: 200,
    contentType: "text/html; charset=utf-8",
    byteLength: Buffer.byteLength(html),
    sha256: "0".repeat(64),
    bodyPath: `research/rendered/${slug}.html`,
    textPath: `research/rendered/${slug}.txt`,
    truncated: false,
    changed: true,
    firstFetch: true,
  };
  writeFileSync(join(dir, `${slug}.meta.json`), `${JSON.stringify(meta, null, 2)}\n`);
}

const STUB = `#!/usr/bin/env bash
# A stand-in for gh: records every call, answers the three endpoints render-dispatch.sh uses with canned JSON.
set -euo pipefail
d="$STUB_DIR"
printf '%s\\n' "$*" >> "$d/gh-calls.log"
args=("$@")
for ((i = 0; i < \${#args[@]}; i++)); do
  if [ "\${args[$i]}" = --input ]; then cp "\${args[$((i + 1))]}" "$d/gh-body.json"; fi
done
iso() { date -u -d "@$1" +%Y-%m-%dT%H:%M:%SZ; }
bump() { local n; n=$(( $(cat "$d/$1" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$d/$1"; echo "$n"; }
url="https://github.com/fixture-owner/fixture-repo/actions/runs"
case "$*" in
  *"/dispatches"*)
    date -u +%s > "$d/dispatched-at"
    exit "\${STUB_DISPATCH_EXIT:-0}" ;;
  *"/runs?per_page=5&event=workflow_dispatch"*)
    # Before the dispatch: the runs already there. After it: the new run appears on the second listing (not the first),
    # unless STUB_NO_NEW_RUN. STUB_SKEW is GitHub's clock less the local one; STUB_OLD_AGE how long before the
    # dispatch the older run on the ref was created.
    if [ -f "$d/dispatched-at" ]; then t=$(cat "$d/dispatched-at"); k=$(bump list-calls); else t=$(date -u +%s); k=0; bump before-calls > /dev/null; [ "\${STUB_BEFORE_EXIT:-0}" = 0 ] || exit "$STUB_BEFORE_EXIT"; fi
    s=\${STUB_SKEW:-0}
    old='{"id":4141,"html_url":"'"$url"'/4141","created_at":"'"$(iso $((t - \${STUB_OLD_AGE:-3600} + s)))"'","head_branch":"'"$STUB_REF"'","status":"completed","conclusion":"success"}'
    other='{"id":4343,"html_url":"'"$url"'/4343","created_at":"'"$(iso $((t + s)))"'","head_branch":"main","status":"queued","conclusion":null}'
    new='{"id":4242,"html_url":"'"$url"'/4242","created_at":"'"$(iso $((t + s)))"'","head_branch":"'"$STUB_REF"'","status":"queued","conclusion":null}'
    # main's run 4343 is new too (dispatched by someone else after this dispatch): it must not be taken for this one.
    if [ "$k" -eq 0 ]; then echo '{"total_count":1,"workflow_runs":['"$old"']}'
    elif [ "$k" -lt 2 ] || [ "\${STUB_NO_NEW_RUN:-0}" = 1 ]; then echo '{"total_count":2,"workflow_runs":['"$other,$old"']}'
    else echo '{"total_count":3,"workflow_runs":['"$other,$new,$old"']}'; fi ;;
  *"/actions/runs/4242"*)
    k=$(bump run-polls)
    if [ "\${STUB_NEVER_COMPLETE:-0}" = 1 ] || [ "$k" -lt 2 ]; then
      echo '{"id":4242,"status":"in_progress","conclusion":null}'
    else
      echo '{"id":4242,"status":"completed","conclusion":"'"\${STUB_CONCLUSION:-success}"'"}'
    fi ;;
  *) echo "stub gh: unexpected call: $*" >&2; exit 9 ;;
esac
`;

let made = 0;
/**
 * A world: a bare origin (named …/fixture-owner/fixture-repo.git, so owner/repo read from its URL), a checkout of
 * REF holding the scripts, the fixture terms verdicts and research/rendered/urls.txt, and an origin REF one commit
 * ahead of the checkout with the dispatched slugs' captures (the commit render-watch.yml would push). A stub gh.
 */
function world(opts: { short?: boolean; raw?: boolean; forms?: boolean; oldCapture?: boolean; plainShell?: boolean } = {}) {
  made += 1;
  const base = join(scratch, `case-${made}`);
  const bare = join(base, "remote", "fixture-owner", "fixture-repo.git");
  const seed = join(base, "seed");
  const checkout = join(base, "checkout");
  const bin = join(base, "bin");
  mkdirSync(bare, { recursive: true });
  mkdirSync(join(seed, "scripts"), { recursive: true });
  mkdirSync(join(seed, "research", "channel-loop"), { recursive: true });
  mkdirSync(join(seed, "research", "rendered"), { recursive: true });
  mkdirSync(bin, { recursive: true });
  git(bare, "init", "-q", "--bare");
  git(seed, "init", "-q");
  for (const f of COPY) copyFileSync(join(ROOT, "scripts", f), join(seed, "scripts", f));
  chmodSync(join(seed, "scripts", "render-dispatch.sh"), 0o755);
  writeFileSync(join(seed, "research", "channel-loop", "terms-verdicts.json"), `${JSON.stringify(VERDICTS, null, 2)}\n`);
  // The weekly list: what an empty urls input would make render-watch fetch instead.
  writeFileSync(join(seed, "research", "rendered", "urls.txt"), `https://open.example/weekly${T}weekly-page\n`);
  writeFileSync(join(seed, "notes.md"), "a tracked file\n");
  // A capture from an earlier run that the "workflow's" commit below does not change.
  if (opts.oldCapture) capture(join(seed, "research", "rendered"), "prize-open-old", "https://open.example/old", "An older page.");
  // The plain capture of shell.example's terms page, which its once-only js line re-reads (ruling 6.10 row 21 (c) 3(2)):
  // termsGate passes that line only on the URL this meta names.
  if (opts.plainShell) capture(join(seed, "research", "rendered"), "terms-shell", "https://shell.example/legal", "", 2);
  git(seed, "add", "-A");
  git(seed, ...who, "commit", "-q", "-m", "scripts");
  git(seed, "push", "-q", bare, `HEAD:refs/heads/${REF}`);
  git(seed, "push", "-q", bare, "HEAD:refs/heads/main");
  // --no-hardlinks: a local clone hardlinks the bare repository's pack files, and the two pushes just above can repack them
  // mid-clone ("fatal: hardlink different from source at .../tmp_pack_..."; CI, 6.10). Copying the objects has no race.
  git(base, "clone", "-q", "--no-hardlinks", "-b", REF, bare, checkout);

  const rendered = join(seed, "research", "rendered");
  const forms = opts.forms ? ` ${FORMS.map((f) => `Or ${f} .`).join(" ")}` : "";
  capture(rendered, "prize-met-rules", "https://met.example/rules", `Write to ${MASK} for the rules.${opts.raw ? ` Or to ${ADDRESS}.` : ""}${forms}`);
  capture(rendered, "prize-open-faq", "https://open.example/faq", `No address here; the logo is ${ASSET}.`, opts.short ? 20 : 300);
  git(seed, "add", "-A");
  git(seed, ...who, "commit", "-q", "-m", "render: 2 page(s) changed [skip ci]");
  git(seed, "push", "-q", bare, `HEAD:refs/heads/${REF}`);

  const stub = join(bin, "gh");
  writeFileSync(stub, STUB);
  chmodSync(stub, 0o755);
  const lines = join(base, "lines.txt");
  writeFileSync(lines, LINES);
  return { base, bare, checkout, stub, lines, tip: git(bare, "rev-parse", REF), start: git(checkout, "rev-parse", "HEAD") };
}

type World = ReturnType<typeof world>;
function run(w: World, args: string[], env: Record<string, string> = {}, timeout = 60_000) {
  const r = spawnSync("bash", [join(w.checkout, "scripts", "render-dispatch.sh"), ...args], {
    cwd: w.checkout,
    encoding: "utf8",
    timeout,
    env: {
      ...process.env,
      ...gitEnv,
      PATH: `${dirname(w.stub)}:${process.env.PATH}`,
      STUB_DIR: w.base,
      STUB_REF: REF,
      RENDER_DISPATCH_POLL_SECONDS: "0.05",
      RENDER_DISPATCH_FIND_POLL_SECONDS: "0.05",
      RENDER_DISPATCH_FIND_SECONDS: "10",
      ...env,
    },
  });
  return { code: r.status, out: r.stdout, err: r.stderr, all: `${r.stdout}${r.stderr}` };
}
const calls = (w: World) => (existsSync(join(w.base, "gh-calls.log")) ? readFileSync(join(w.base, "gh-calls.log"), "utf8").trim().split("\n") : []);
const count = (w: World, name: string) => (existsSync(join(w.base, name)) ? Number(readFileSync(join(w.base, name), "utf8")) : 0);
const dispatch = (w: World, ...more: string[]) => run(w, [w.lines, REF, "--gh", w.stub, ...more]);

describe("render-dispatch: a dispatch that goes through", () => {
  it("dispatches the file under inputs.urls with the ref, finds and waits for the run, fast-forwards, checks: exit 0", () => {
    const w = world();
    const r = dispatch(w);
    expect(r.code, r.all).toBe(0);
    expect(JSON.parse(readFileSync(join(w.base, "gh-body.json"), "utf8"))).toEqual({ ref: REF, inputs: { urls: LINES } });
    const c = calls(w);
    // The runs already there are listed before the dispatch, so none of them can be taken for its run.
    expect(c[0]).toBe("api repos/fixture-owner/fixture-repo/actions/workflows/render-watch.yml/runs?per_page=5&event=workflow_dispatch");
    expect(c[1]).toBe(`api -X POST repos/fixture-owner/fixture-repo/actions/workflows/render-watch.yml/dispatches --input ${c[1].split(" ").at(-1)}`);
    expect(c.filter((l) => l.includes("/runs?per_page=5&event=workflow_dispatch"))).toHaveLength(3);
    // The run on the ref created at or after the dispatch: not main's (4343) and not the older one (4141).
    expect(r.out).toContain("run 4242 https://github.com/fixture-owner/fixture-repo/actions/runs/4242");
    // The wait stops at the first "completed".
    expect(count(w, "run-polls")).toBe(2);
    expect(r.out).toMatch(/run 4242: completed, success/);
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.tip);
    expect(r.out).toMatch(/prize-met-rules\tok/);
    expect(r.out).toMatch(/prize-open-faq\tok/);
    expect(r.err).toMatch(/\[1\/7\].*exit 0 \(js=true\)/);
    for (const step of ["[2/7]", "[3/7]", "[4/7]", "[5/7]", "[6/7]", "[7/7]"]) expect(r.err).toContain(step);
  });

  it("the address report counts masks and raw addresses by kind and never prints an address", () => {
    const w = world();
    const r = dispatch(w);
    expect(r.code, r.all).toBe(0);
    expect(r.out).toContain("prize-met-rules.txt: masked 1 (organisation or university 1); raw 0");
    // The asset name (<name>@2x.png) is a file name, not an address.
    expect(r.out).toContain("prize-open-faq.txt: masked 0; raw 0");
    expect(r.err).not.toMatch(/WARNING/);

    const raw = world({ raw: true });
    const s = dispatch(raw);
    expect(s.code, s.all).toBe(0);
    expect(s.out).toContain("prize-met-rules.txt: masked 1 (organisation or university 1); raw 1 (organisation or university 1)");
    expect(s.err).toMatch(/WARNING: prize-met-rules\.txt holds 1 address-shaped string/);
    expect(s.all).not.toContain(ADDRESS);
    expect(s.all).not.toContain(LOCAL);

    // Every other form is counted too: encoded, escaped, look-alike, and outside ASCII.
    const all = world({ forms: true });
    const t = dispatch(all);
    expect(t.code, t.all).toBe(0);
    expect(t.out).toContain(`prize-met-rules.txt: masked 1 (organisation or university 1); raw ${FORMS.length} (organisation or university ${FORMS.length})`);
    expect(t.err).toMatch(new RegExp(`WARNING: prize-met-rules\\.txt holds ${FORMS.length} address-shaped string`));
    for (const f of [...FORMS, LOCAL, "jos\u00e9"]) expect(t.all).not.toContain(f);
  });

  it("the body is the file's bytes: CRLF, text outside ASCII and no final newline are sent as they are", () => {
    const w = world();
    const crlf = `# caf\u00e9 lines\r\nhttps://met.example/rules${T}prize-met-rules\r\nhttps://open.example/faq${T}prize-open-faq${T}js`;
    writeFileSync(w.lines, crlf);
    const r = dispatch(w, "--no-wait");
    expect(r.code, r.all).toBe(0);
    const body = readFileSync(join(w.base, "gh-body.json"), "utf8");
    expect(JSON.parse(body)).toEqual({ ref: REF, inputs: { urls: readFileSync(w.lines, "utf8") } });
    expect(JSON.parse(body).inputs.urls).toBe(crlf);
  });

  it("says which slugs the merged commits did not change (an unchanged page, or a line the run skipped)", () => {
    const w = world({ oldCapture: true });
    writeFileSync(w.lines, `${LINES}https://open.example/old${T}prize-open-old\n`);
    const r = dispatch(w);
    expect(r.code, r.all).toBe(0);
    expect(r.err).toMatch(/\[6\/7\] NOTE: prize-open-old: no capture file of it changed in the merged commits/);
    expect(r.err).not.toMatch(/prize-met-rules: no capture file/);
    expect(r.err).not.toMatch(/prize-open-faq: no capture file/);
  });

  it("exits with capture-check's 3 when a capture is flagged", () => {
    const w = world({ short: true });
    const r = dispatch(w);
    expect(r.code, r.all).toBe(3);
    expect(r.out).toMatch(/prize-open-faq\tshort/);
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.tip);
  });

  it("uses gh from PATH when --gh is not given", () => {
    const w = world();
    const r = run(w, [w.lines, REF]);
    expect(r.code, r.all).toBe(0);
    expect(calls(w)[1]).toMatch(/^api -X POST .*\/dispatches --input /);
  });
});

describe("render-dispatch: refused before any gh call", () => {
  const refused = (w: World, lines: string, why: RegExp) => {
    writeFileSync(w.lines, lines);
    const r = dispatch(w);
    expect(r.code, r.all).toBe(1);
    expect(r.err).toMatch(why);
    expect(calls(w)).toEqual([]);
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.start);
    return r;
  };

  it("an empty file, or one of comments and blank lines (an empty urls input fetches the weekly list)", () => {
    const w = world();
    refused(w, "", /no URL line/);
    refused(w, "# only a comment\n\n", /no URL line/);
    // What JavaScript's trim() removes and grep's [[:space:]] does not: the workflow's input would trim to nothing.
    refused(w, "\uFEFF\n", /no URL line/);
    refused(w, "\u00a0\n", /no URL line/);
    refused(w, "\uFEFF# a comment\n", /no URL line/);
    refused(w, "\u2028\n\u00a0\u00a0\n", /no URL line/);
  });

  it("a line render-watch's parser refuses: not a URL, a duplicate slug, an unknown flag, a barred host", () => {
    const w = world();
    refused(w, `not-a-url${T}prize-x\n`, /render-watch's parser refuses/);
    refused(w, `https://met.example/a${T}prize-same\nhttps://met.example/b${T}prize-same\n`, /render-watch's parser refuses/);
    refused(w, `https://met.example/a${T}prize-a${T}jss\n`, /render-watch's parser refuses/);
    refused(w, `https://sites.google.com/view/x${T}prize-google\n`, /render-watch's parser refuses/);
  });

  it("a site the terms gate refuses: barred by its verdict, or with no verdict at all", () => {
    const w = world();
    const r = refused(w, `https://met.example/rules${T}prize-met-rules\nhttps://barred.example/rules${T}prize-barred\n`, /terms gate refuses/);
    expect(r.err).toMatch(/line 2: barred\.example: barred\.example is BARRED/);
    refused(w, `https://unknown.example/rules${T}prize-unknown\n`, /unknown\.example has no verdict/);
  });

  it("a K4 shell site's terms line without the js flag (its one render is a js render), and its other pages", () => {
    const w = world({ plainShell: true });
    const r = refused(w, `https://shell.example/legal${T}terms-shell\n`, /terms gate refuses/);
    expect(r.err).toMatch(/line 1: shell\.example: shell\.example is NO_TERMS, shell: only its terms page \(a terms- slug\), once, as a js line queued by --js --terms-shell/);
    refused(w, `https://shell.example/pricing${T}shell-pricing${T}js\n`, /terms gate refuses/);
  });

  it("a js terms- line on another page of a K4 shell site: only its plain capture's URL passes (3(3))", () => {
    const w = world({ plainShell: true });
    const r = refused(w, `https://shell.example/rates/registered-mail${T}terms-rates${T}js\n`, /terms gate refuses/);
    expect(r.err).toMatch(/line 1: shell\.example: shell\.example is NO_TERMS, shell: a js terms- line passes only on the URL of its own plain capture/);
    refused(w, `https://shell.example/rates${T}terms-shell${T}js\n`, /terms-shell\.meta\.json is of https:\/\/shell\.example\/legal, not https:\/\/shell\.example\/rates/);
  });

  it("a line with no slug, and a usage error (exit 2)", () => {
    const w = world();
    refused(w, "https://met.example/rules\n", /no slug/);
    expect(run(w, [w.lines]).code).toBe(2);
    expect(run(w, [w.lines, REF, "--wait-seconds", "soon"]).code).toBe(2);
    expect(run(w, [join(w.base, "missing.txt"), REF]).code).toBe(2);
    expect(calls(w)).toEqual([]);
  });
});

describe("render-dispatch: a line queued by queue-zero-test --js --terms-shell (ruling 6.10 row 21 (c))", () => {
  it("passes step 1 — render-watch's parser and termsGate with the line's js flag — and is dispatched as it is", () => {
    const w = world({ plainShell: true });
    // The two lines the route writes: a NO_TERMS shell site's terms page and a TERMS_PENDING site's, each with js.
    const lines = [
      "# ruling 6.10 row 21 (c), once-only js render of a shell terms page (a fixture's comment)",
      `https://shell.example/legal${T}terms-shell${T}js`,
      `https://pending.example/terms${T}terms-pending${T}js`,
      "",
    ].join("\n");
    writeFileSync(w.lines, lines);
    const r = dispatch(w, "--no-wait");
    expect(r.code, r.all).toBe(0);
    expect(r.err).toMatch(/\[1\/7\] render-watch --needs-browser: exit 0 \(js=true\)/);
    expect(r.err).toMatch(/\[1\/7\] terms gate: exit 0/);
    expect(JSON.parse(readFileSync(join(w.base, "gh-body.json"), "utf8"))).toEqual({ ref: REF, inputs: { urls: lines } });
    expect(r.out).toContain("run 4242 https://github.com/fixture-owner/fixture-repo/actions/runs/4242");
  });
});

describe("render-dispatch: the run, the wait and the merge", () => {
  it("--no-wait prints the run and stops: no wait, no fetch, no merge", () => {
    const w = world();
    const r = dispatch(w, "--no-wait");
    expect(r.code, r.all).toBe(0);
    expect(r.out).toContain("run 4242 https://github.com/fixture-owner/fixture-repo/actions/runs/4242");
    expect(count(w, "run-polls")).toBe(0);
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.start);
    expect(git(w.checkout, "rev-parse", `origin/${REF}`)).toBe(w.start);
  });

  it("finding the run is bounded: no new run on the ref within RENDER_DISPATCH_FIND_SECONDS fails, naming the ref", () => {
    const w = world();
    const r = run(w, [w.lines, REF, "--gh", w.stub], { STUB_NO_NEW_RUN: "1", RENDER_DISPATCH_FIND_SECONDS: "1" }, 15_000);
    expect(r.code, r.all).toBe(1);
    expect(r.err).toMatch(/\[3\/7\] no run of render-watch\.yml on loop-branch .* within 1 s/);
    // The deadline is checked in whole seconds, so a 1 s window holds one listing or two depending on where in the
    // second the dispatch fell (CI's Node 20 runner saw one; this machine usually sees two). What is bounded, and
    // asserted: it listed at least once after the dispatch, stopped with exit 1, polled no run and fetched nothing.
    expect(count(w, "list-calls")).toBeGreaterThanOrEqual(1);
    expect(count(w, "run-polls")).toBe(0);
    expect(git(w.checkout, "rev-parse", `origin/${REF}`)).toBe(w.start);
  });

  it("the local clock running behind GitHub's: the older run on the ref, created 'after' the local time, is not taken", () => {
    const w = world();
    const r = run(w, [w.lines, REF, "--gh", w.stub], { STUB_SKEW: "600", STUB_OLD_AGE: "60" });
    expect(r.code, r.all).toBe(0);
    expect(r.out).toContain("run 4242 https://github.com/fixture-owner/fixture-repo/actions/runs/4242");
    expect(r.out).not.toContain("run 4141");
  });

  it("the local clock running ahead of GitHub's (within the allowance): the new run is still found", () => {
    const w = world();
    const r = run(w, [w.lines, REF, "--gh", w.stub], { STUB_SKEW: "-60" });
    expect(r.code, r.all).toBe(0);
    expect(r.out).toContain("run 4242 https://github.com/fixture-owner/fixture-repo/actions/runs/4242");
  });

  it("a run that does not conclude success fails, and nothing is fetched", () => {
    const v = world();
    const f = run(v, [v.lines, REF, "--gh", v.stub], { STUB_CONCLUSION: "failure" });
    expect(f.code, f.all).toBe(1);
    expect(f.err).toMatch(/run 4242 concluded failure/);
    expect(git(v.checkout, "rev-parse", `origin/${REF}`)).toBe(v.start);
    expect(git(v.checkout, "rev-parse", "HEAD")).toBe(v.start);
  });

  it("a run that never completes times out, naming the run", () => {
    const w = world();
    const r = run(w, [w.lines, REF, "--gh", w.stub, "--wait-seconds", "1"], { STUB_NEVER_COMPLETE: "1", RENDER_DISPATCH_POLL_SECONDS: "0.2" });
    expect(r.code, r.all).toBe(1);
    expect(r.err).toMatch(/run 4242 did not complete within 1 s/);
    expect(r.err).toContain("https://github.com/fixture-owner/fixture-repo/actions/runs/4242");
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.start);
  });

  it("listing the runs before the dispatch fails: nothing is dispatched", () => {
    const w = world();
    const r = run(w, [w.lines, REF, "--gh", w.stub], { STUB_BEFORE_EXIT: "1" });
    expect(r.code, r.all).toBe(1);
    expect(r.err).toMatch(/\[2\/7\] listing the runs failed; nothing dispatched/);
    expect(calls(w)).toHaveLength(1);
    expect(calls(w)[0]).toMatch(/\/runs\?per_page=5&event=workflow_dispatch$/);
  });

  it("a failed dispatch stops there", () => {
    const w = world();
    const r = run(w, [w.lines, REF, "--gh", w.stub], { STUB_DISPATCH_EXIT: "1" });
    expect(r.code, r.all).toBe(1);
    expect(r.err).toMatch(/the dispatch failed/);
    expect(calls(w)).toHaveLength(2);
    expect(calls(w)[1]).toMatch(/\/dispatches --input /);
  });

  it("a dirty checkout is fetched, not merged: exit 4, the edit kept", () => {
    const w = world();
    writeFileSync(join(w.checkout, "notes.md"), "an edit nobody committed\n");
    const r = dispatch(w);
    expect(r.code, r.all).toBe(4);
    expect(git(w.checkout, "rev-parse", `origin/${REF}`)).toBe(w.tip);
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.start);
    expect(readFileSync(join(w.checkout, "notes.md"), "utf8")).toBe("an edit nobody committed\n");
    expect(r.err).toMatch(/uncommitted changes: not merging/);
    expect(r.out).not.toMatch(/prize-met-rules\tok/);
  });

  it("a checkout on another branch is fetched, not merged: exit 4", () => {
    const w = world();
    git(w.checkout, "checkout", "-q", "-b", "elsewhere");
    const r = dispatch(w);
    expect(r.code, r.all).toBe(4);
    expect(git(w.checkout, "rev-parse", `origin/${REF}`)).toBe(w.tip);
    expect(git(w.checkout, "rev-parse", "HEAD")).toBe(w.start);
    expect(r.err).toMatch(/on elsewhere, not loop-branch: not merging/);
  });
});

describe("scripts/prize-dispatch.mjs names render-dispatch.sh as the way its lines are dispatched", () => {
  it("its header says to save the output to a file and run scripts/render-dispatch.sh <file> <ref>", () => {
    const header = readFileSync(join(ROOT, "scripts", "prize-dispatch.mjs"), "utf8").split("*/")[0].replace(/\n \* ?/g, " ");
    expect(header).toContain("`node scripts/prize-dispatch.mjs > <file>`, then `scripts/render-dispatch.sh <file> <ref>`");
    expect(header).toMatch(/dispatched with scripts\/render-dispatch\.sh, never pasted by hand/);
  });
});
