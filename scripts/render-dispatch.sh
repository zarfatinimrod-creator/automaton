#!/usr/bin/env bash
# render-dispatch — dispatch render-watch.yml for a lines file, wait for its run, fast-forward the branch, and check
# what it stored.
#
# Why: in ticks 47-51 the main thread ran the same chain by hand five times (logs/CHANNEL_LOOP.md §9, tick 51 item 1):
# validate the lines, build the dispatch body, `gh api` the dispatch, find the run, poll it, fetch and fast-forward,
# capture-check the new captures, and grep them for addresses. This is that chain, once, each step checked by its exit
# code.
#
# Usage: scripts/render-dispatch.sh <lines-file> <ref> [--wait-seconds N] [--no-wait] [--gh <cmd>]
#   <lines-file>      URL<TAB>slug[<TAB>js] lines, the format scripts/prize-dispatch.mjs prints and render-watch reads
#                     (`#` comments and blank lines allowed); it is sent as it is, byte for byte, as the `urls` input
#   <ref>             the branch the workflow runs on and commits to: main or the loop branch
#   --wait-seconds N  how long to wait for the run to complete (default 1200)
#   --no-wait         stop once the run is found: no wait, no fetch, no check (they are then done by hand)
#   --gh <cmd>        the gh command (default gh; the tests pass a stub)
#
# The steps, in order; each prints what it does and its command's exit code to stderr:
#   1. validate: refuse a file with no URL line (an empty `urls` input makes render-watch fetch the whole of
#      research/rendered/urls.txt), counted by render-watch's own rule (a leading BOM dropped, each line trimmed with
#      JavaScript's trim(), so a file of BOMs, no-break spaces or line separators has none); then render-watch's own
#      parser must accept the lines
#      (RENDER_WATCH_URLS=<the file> node scripts/render-watch.mjs --needs-browser, which also says whether a js line
#      needs the browser); then every line needs a slug and a site that passes termsGate (scripts/queue-zero-test.mjs,
#      the gate scripts/prize-dispatch.mjs applies), or it is refused with the gate's reason. Nothing is dispatched
#      unless every line passes.
#   2. dispatch: the body {"ref": <ref>, "inputs": {"urls": <the file>}} is written by python3 (never by hand), and
#      POSTed with `gh api -X POST repos/<owner>/<repo>/actions/workflows/render-watch.yml/dispatches --input <body>`;
#      owner and repo are read from `git remote get-url origin` of this checkout.
#   3. find the run: the same runs list is read once before the dispatch (step 2), and its run ids are set aside. Then
#      `gh api '.../render-watch.yml/runs?per_page=5&event=workflow_dispatch'` until a run on <ref> appears that was
#      not among them and was created at or after the moment before the dispatch, less RENDER_DISPATCH_CLOCK_SKEW_SECONDS
#      (default 120: a local clock that runs ahead of GitHub's by less than that still finds the run, and one that runs
#      behind cannot take an older run, which was listed before the dispatch); every RENDER_DISPATCH_FIND_POLL_SECONDS,
#      default 5, for at most RENDER_DISPATCH_FIND_SECONDS, default 120. Its id and URL go to stdout. (A run someone
#      else dispatched on the same ref in the same seconds would be taken for this one; the concurrency group
#      serialises them.)
#   4. wait, unless --no-wait: poll the run every RENDER_DISPATCH_POLL_SECONDS (default 20) until it is completed, at
#      most --wait-seconds; a conclusion other than success fails (exit 1), and so does the time running out, naming
#      the run.
#   5. `git fetch origin <ref>`, then `git merge --ff-only origin/<ref>` only when this checkout is on <ref> with no
#      uncommitted change to a tracked file. Otherwise the fetch result is printed and the script stops with exit 4,
#      for the merge to be done by hand. (Never `git stash`: commit first.)
#   6. `node scripts/capture-check.mjs <slugs>`: its table on stdout; 3 only flags (the reader judges). Before it, a
#      NOTE line on stderr for each slug none of whose capture files the merged commits changed: render-watch keeps an
#      unchanged page's capture (and its fetchedAt) as it was, and leaves a js line it skipped (no browser) untouched,
#      so such a capture may be older than this run; the run's log says which. It does not change the exit code.
#   7. an address report per capture file (<slug>.txt, .html, .json, .xml, read as UTF-8): how many masks render-watch
#      wrote ([redacted:email], with the domain's kind when it kept one) and how many raw address-shaped strings remain
#      (a local part, then @, %40, a script escape \u0040 / \x40, a character reference &#64; / &#x40; / &commat;, or a
#      look-alike at sign U+FF20 / U+FE6B, then a domain that is not a file name; letters, marks and digits of any
#      script count, so an accented local part or an internationalised domain is found too), each counted by domain
#      kind (domainKind, scripts/remask-captures.mjs). Kinds and counts only, never an address or a domain. A raw count
#      above 0 is a WARNING line on stderr; it does not change the exit code.
#
# Everything runs in the checkout this file is in: its scripts, its origin, its research/rendered.
#
# Exit: capture-check's own 0 or 3 when every other step passed; 1 a refused line, a failed command, no run found, a
# run that did not succeed or did not complete in time, or a capture-check error (neither 0 nor 3); 4 fetched but not
# merged (another branch, a dirty checkout, not a fast-forward); 2 a usage error. --no-wait exits 0 once the run is found.
set -euo pipefail

usage='usage: scripts/render-dispatch.sh <lines-file> <ref> [--wait-seconds N] [--no-wait] [--gh <cmd>]'
log() { echo "render-dispatch: $*" >&2; }
die() { local code="$1"; shift; log "$*"; exit "$code"; }
usage_error() { log "$*"; echo "$usage" >&2; exit 2; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW=render-watch.yml
POLL="${RENDER_DISPATCH_POLL_SECONDS:-20}"
FIND_POLL="${RENDER_DISPATCH_FIND_POLL_SECONDS:-5}"
FIND_SECONDS="${RENDER_DISPATCH_FIND_SECONDS:-120}"
SKEW="${RENDER_DISPATCH_CLOCK_SKEW_SECONDS:-120}"

wait_seconds=1200; no_wait=0; gh=gh; positional=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    --wait-seconds) [ "$#" -ge 2 ] || usage_error "--wait-seconds needs a value"; wait_seconds="$2"; shift 2 ;;
    --no-wait) no_wait=1; shift ;;
    --gh) [ "$#" -ge 2 ] && [ -n "$2" ] || usage_error "--gh needs a command"; gh="$2"; shift 2 ;;
    -*) usage_error "unknown option: $1" ;;
    *) positional+=("$1"); shift ;;
  esac
done
[ "${#positional[@]}" -eq 2 ] || usage_error "want a lines file and a ref"
lines_file="${positional[0]}"; ref="${positional[1]}"
[[ "$wait_seconds" =~ ^[0-9]+$ ]] || usage_error "--wait-seconds is not a whole number of seconds: $wait_seconds"
for v in "$POLL" "$FIND_POLL"; do [[ "$v" =~ ^[0-9]+(\.[0-9]+)?$ ]] || usage_error "a poll interval is not a number of seconds: $v"; done
[[ "$FIND_SECONDS" =~ ^[0-9]+$ ]] || usage_error "RENDER_DISPATCH_FIND_SECONDS is not a whole number: $FIND_SECONDS"
[[ "$SKEW" =~ ^[0-9]+$ ]] || usage_error "RENDER_DISPATCH_CLOCK_SKEW_SECONDS is not a whole number: $SKEW"
{ [ -f "$lines_file" ] && [ -r "$lines_file" ]; } || usage_error "no readable file: $lines_file"
git check-ref-format "refs/heads/$ref" || usage_error "not a branch name: $ref"

work="$(mktemp -d "${TMPDIR:-/tmp}/render-dispatch.XXXXXX")"
trap 'rm -rf -- "$work"' EXIT

# Step 1's terms gate: every line needs a slug and a site termsGate passes. Prints the slugs, one per line.
read -r -d '' GATE_JS <<'JS' || true
const [root, file] = process.argv.slice(1);
const { readFileSync } = await import("node:fs");
const { join } = await import("node:path");
const { pathToFileURL } = await import("node:url");
const { loadVerdicts, termsGate } = await import(pathToFileURL(join(root, "scripts", "queue-zero-test.mjs")).href);
const verdicts = loadVerdicts();
const slugs = [];
let refused = 0;
readFileSync(file, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).forEach((raw, i) => {
  const t = raw.trim();
  if (t === "" || t.startsWith("#")) return;
  const [url, slug] = t.split(/\s+/);
  if (!slug) {
    console.error(`render-dispatch: refused: line ${i + 1}: no slug after the URL (a line is URL<TAB>slug[<TAB>js])`);
    refused += 1;
    return;
  }
  const gate = termsGate(url, slug, verdicts);
  if (!gate.ok) {
    console.error(`render-dispatch: refused: line ${i + 1}: ${gate.site ?? "(not a URL)"}: ${gate.why}`);
    refused += 1;
    return;
  }
  slugs.push(slug);
});
if (refused) process.exit(1);
console.log(slugs.join("\n"));
JS

# Step 1: the number of URL lines, by render-watch's rule (parseUrlList and resolveListText): a leading BOM dropped,
# each line trimmed with trim() (BOM, no-break space and line separators included), comments and blank lines skipped.
read -r -d '' COUNT_JS <<'JS' || true
const { readFileSync } = await import("node:fs");
const lines = readFileSync(process.argv[1], "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
console.log(lines.filter((raw) => raw.trim() !== "" && !raw.trim().startsWith("#")).length);
JS

# Step 2: the ids of the runs already listed, comma-separated.
read -r -d '' IDS_PY <<'PY' || true
import json, sys
print(",".join(str(run["id"]) for run in json.load(sys.stdin).get("workflow_runs") or []))
PY

# Step 3: the first run on the ref that was not listed before the dispatch and was created at or after the dispatch
# less the clock allowance, as "<id> <url>", or nothing.
read -r -d '' PICK_PY <<'PY' || true
import json, sys
from datetime import datetime, timedelta
when = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00"))
since, ref = when(sys.argv[1]) - timedelta(seconds=int(sys.argv[3])), sys.argv[2]
known = {int(i) for i in sys.argv[4].split(",") if i}
for run in json.load(sys.stdin).get("workflow_runs") or []:
    if run.get("head_branch") == ref and run.get("id") not in known and when(run.get("created_at", "")) >= since:
        print(run["id"], run.get("html_url", ""))
        break
PY

# Step 4: "<status> <conclusion>" of one run ("-" for a conclusion not given yet).
read -r -d '' STATUS_PY <<'PY' || true
import json, sys
run = json.load(sys.stdin)
print(run.get("status") or "-", run.get("conclusion") or "-")
PY

# Step 7: masks and raw address-shaped strings per capture file, by domain kind; never an address or a domain.
read -r -d '' REPORT_JS <<'JS' || true
const [root, ...slugs] = process.argv.slice(1);
const { existsSync, readFileSync } = await import("node:fs");
const { join } = await import("node:path");
const { pathToFileURL } = await import("node:url");
const { domainKind } = await import(pathToFileURL(join(root, "scripts", "remask-captures.mjs")).href);
// An @ as a capture may hold one: plain, percent-encoded, script-escaped, a character reference, a look-alike.
const AT = "(?:@|%40|\\\\[uU]0040|\\\\[xX]40|&#0*64;?|&#[xX]0*40;?|&commat;|\uFF20|\uFE6B)";
// Letters, marks and digits of any script: an accented local part or an internationalised domain is an address too.
const W = "\\p{L}\\p{M}\\p{N}";
const LOCAL = `[${W}._%+-]`;
const DOMAIN = `((?:[${W}-]+\\.)+[\\p{L}\\p{M}][${W}-]{1,62})`;
const MASK = new RegExp(`\\[redacted:email\\](?:${AT}${DOMAIN})?`, "gu");
const RAW = new RegExp(`(?<!${LOCAL})${LOCAL}+${AT}${DOMAIN}(?![${W}-])`, "gu");
const FILE_NAME = /\.(?:png|jpe?g|gif|svg|webp|avif|css|js|mjs|json|map|woff2?|ttf|otf|ico|mp4|webm|pdf|html?)$/i;
const tally = (kinds) => [...kinds].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, n]) => `${k} ${n}`).join(", ");
const said = (n, kinds) => `${n}${n ? ` (${tally(kinds)})` : ""}`;
for (const slug of slugs) {
  for (const ext of ["txt", "html", "json", "xml"]) {
    const file = join(root, "research", "rendered", `${slug}.${ext}`);
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    const masks = new Map();
    const raw = new Map();
    let m = 0;
    let r = 0;
    for (const hit of text.matchAll(MASK)) {
      const kind = hit[1] ? domainKind(hit[1]) : "no domain kept";
      masks.set(kind, (masks.get(kind) ?? 0) + 1);
      m += 1;
    }
    for (const hit of text.matchAll(RAW)) {
      if (FILE_NAME.test(hit[1])) continue;
      const kind = domainKind(hit[1]);
      raw.set(kind, (raw.get(kind) ?? 0) + 1);
      r += 1;
    }
    console.log(`${slug}.${ext}: masked ${said(m, masks)}; raw ${said(r, raw)}`);
    if (r) console.error(`render-dispatch: WARNING: ${slug}.${ext} holds ${r} address-shaped string(s) the mask did not take (${tally(raw)}): read them before the capture is cited`);
  }
}
JS

# ---- 1. validate ----------------------------------------------------------------------------------------------------
rc=0; urls_lines="$(node --input-type=module -e "$COUNT_JS" "$lines_file")" || rc=$?
[ "$rc" -eq 0 ] || die 1 "[1/7] could not count the URL lines of $lines_file (node exit $rc)"
[ "$urls_lines" -gt 0 ] || die 1 "[1/7] $lines_file has no URL line (only comments or blank lines): nothing to dispatch (an empty urls input would make render-watch fetch all of research/rendered/urls.txt)"
log "[1/7] validate $urls_lines line(s) with render-watch's parser: RENDER_WATCH_URLS=<$lines_file> node scripts/render-watch.mjs --needs-browser"
rc=0; mode="$(RENDER_WATCH_URLS="$(cat "$lines_file")" node "$ROOT/scripts/render-watch.mjs" --needs-browser)" || rc=$?
log "[1/7] render-watch --needs-browser: exit $rc${mode:+ ($mode)}"
[ "$rc" -eq 0 ] || die 1 "[1/7] render-watch's parser refuses the lines (its message is above); nothing dispatched"
log "[1/7] the terms gate on every line (termsGate, scripts/queue-zero-test.mjs, as scripts/prize-dispatch.mjs applies it)"
rc=0; slugs="$(node --input-type=module -e "$GATE_JS" "$ROOT" "$lines_file")" || rc=$?
log "[1/7] terms gate: exit $rc"
[ "$rc" -eq 0 ] || die 1 "[1/7] the terms gate refuses the line(s) above; nothing dispatched"
mapfile -t slug_list <<< "$slugs"

# ---- 2. dispatch ----------------------------------------------------------------------------------------------------
origin="$(git -C "$ROOT" remote get-url origin)" || die 1 "[2/7] this checkout has no origin"
path="${origin%/}"; path="${path%.git}"; repo="${path##*/}"; rest="${path%/*}"; owner="${rest##*[/:]}"
[[ "$owner" =~ ^[A-Za-z0-9_.-]+$ && "$repo" =~ ^[A-Za-z0-9_.-]+$ ]] || die 1 "[2/7] cannot read owner/repo from origin's URL"
api="repos/$owner/$repo/actions/workflows/$WORKFLOW"
body="$work/body.json"
log "[2/7] build the dispatch body with python3: {\"ref\": \"$ref\", \"inputs\": {\"urls\": <$lines_file>}}"
rc=0
python3 -I -c 'import json, sys
with open(sys.argv[2], encoding="utf-8", newline="") as f:
    urls = f.read()
json.dump({"ref": sys.argv[1], "inputs": {"urls": urls}}, sys.stdout)' "$ref" "$lines_file" > "$body" || rc=$?
log "[2/7] python3 (body): exit $rc"
[ "$rc" -eq 0 ] || die 1 "[2/7] could not build the dispatch body; nothing dispatched"
log "[2/7] the runs already there, so none of them is taken for this dispatch's: $gh api '$WORKFLOW/runs?per_page=5&event=workflow_dispatch'"
rc=0; listed="$("$gh" api "$api/runs?per_page=5&event=workflow_dispatch")" || rc=$?
log "[2/7] gh api (runs before the dispatch): exit $rc"
[ "$rc" -eq 0 ] || die 1 "[2/7] listing the runs failed; nothing dispatched"
known="$(python3 -I -c "$IDS_PY" <<< "$listed")" || die 1 "[2/7] the runs list is not the JSON gh api returns; nothing dispatched"
since="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "[2/7] dispatch: $gh api -X POST repos/<origin>/actions/workflows/$WORKFLOW/dispatches --input <body> (ref $ref, at $since)"
rc=0; "$gh" api -X POST "$api/dispatches" --input "$body" >&2 || rc=$?
log "[2/7] gh api (dispatch): exit $rc"
[ "$rc" -eq 0 ] || die 1 "[2/7] the dispatch failed; no run was started"

# ---- 3. find the run ------------------------------------------------------------------------------------------------
log "[3/7] find the run: $gh api '$WORKFLOW/runs?per_page=5&event=workflow_dispatch', a run on $ref not listed before the dispatch (${known:-none listed}), created at or after $since less ${SKEW} s for the clocks (at most ${FIND_SECONDS} s)"
deadline=$(( $(date +%s) + FIND_SECONDS )); run=""
while :; do
  rc=0; runs="$("$gh" api "$api/runs?per_page=5&event=workflow_dispatch")" || rc=$?
  log "[3/7] gh api (runs): exit $rc"
  [ "$rc" -eq 0 ] || die 1 "[3/7] listing the runs failed; the dispatch was sent, so find its run by hand"
  run="$(python3 -I -c "$PICK_PY" "$since" "$ref" "$SKEW" "$known" <<< "$runs")" || die 1 "[3/7] the runs list is not the JSON gh api returns"
  [ -z "$run" ] || break
  [ "$(date +%s)" -lt "$deadline" ] || die 1 "[3/7] no run of $WORKFLOW on $ref created at or after $since within ${FIND_SECONDS} s; find it by hand"
  sleep "$FIND_POLL"
done
run_id="${run%% *}"; run_url="${run#* }"
echo "run $run_id $run_url"
log "[3/7] run $run_id: $run_url"

# ---- 4. wait --------------------------------------------------------------------------------------------------------
if [ "$no_wait" -eq 1 ]; then
  log "[4/7] --no-wait: not waiting for run $run_id and not fetching; once it completes: git fetch origin $ref, merge, then node scripts/capture-check.mjs ${slug_list[*]}"
  exit 0
fi
log "[4/7] wait for run $run_id: every ${POLL} s, at most ${wait_seconds} s"
deadline=$(( $(date +%s) + wait_seconds ))
while :; do
  rc=0; state="$("$gh" api "repos/$owner/$repo/actions/runs/$run_id")" || rc=$?
  log "[4/7] gh api (run $run_id): exit $rc"
  [ "$rc" -eq 0 ] || die 1 "[4/7] reading run $run_id failed: $run_url"
  sc="$(python3 -I -c "$STATUS_PY" <<< "$state")" || die 1 "[4/7] run $run_id's answer is not the JSON gh api returns"
  status="${sc%% *}"; conclusion="${sc#* }"
  log "[4/7] run $run_id: status $status, conclusion $conclusion"
  [ "$status" != completed ] || break
  [ "$(date +%s)" -lt "$deadline" ] || die 1 "[4/7] run $run_id did not complete within ${wait_seconds} s (last status $status): $run_url; wait for it, then fetch and check by hand"
  sleep "$POLL"
done
echo "run $run_id: $status, $conclusion"
[ "$conclusion" = success ] || die 1 "[4/7] run $run_id concluded $conclusion, not success: $run_url; nothing fetched"

# ---- 5. fetch, and fast-forward only a clean checkout of the ref --------------------------------------------------
log "[5/7] git fetch origin $ref"
rc=0; git -C "$ROOT" fetch origin "$ref" >&2 || rc=$?
log "[5/7] git fetch: exit $rc"
[ "$rc" -eq 0 ] || die 1 "[5/7] the fetch failed; the captures are on origin/$ref"
log "[5/7] origin/$ref is at $(git -C "$ROOT" rev-parse --short "origin/$ref"), $(git -C "$ROOT" rev-list --count "HEAD..origin/$ref") commit(s) past HEAD"
branch="$(git -C "$ROOT" symbolic-ref --short -q HEAD || true)"
if [ "$branch" != "$ref" ]; then
  die 4 "[5/7] the checkout is on ${branch:-a detached HEAD}, not $ref: not merging; merge origin/$ref by hand"
fi
if [ -n "$(git -C "$ROOT" status --porcelain --untracked-files=no)" ]; then
  die 4 "[5/7] the checkout has uncommitted changes: not merging; commit them, then git merge --ff-only origin/$ref"
fi
merged_from="$(git -C "$ROOT" rev-parse HEAD)"
rc=0; git -C "$ROOT" merge --ff-only "origin/$ref" >&2 || rc=$?
log "[5/7] git merge --ff-only origin/$ref: exit $rc"
[ "$rc" -eq 0 ] || die 4 "[5/7] not a fast-forward: merge origin/$ref by hand"

# ---- 6. capture-check -----------------------------------------------------------------------------------------------
for s in "${slug_list[@]}"; do
  if [ -z "$(git -C "$ROOT" diff --name-only "$merged_from" HEAD -- "research/rendered/$s.*")" ]; then
    log "[6/7] NOTE: $s: no capture file of it changed in the merged commits (an unchanged page keeps its capture, and so does a js line the run skipped: its log says which)"
  fi
done
log "[6/7] node scripts/capture-check.mjs ${slug_list[*]}"
cc=0; node "$ROOT/scripts/capture-check.mjs" "${slug_list[@]}" || cc=$?
log "[6/7] capture-check: exit $cc (0 every capture reads as a page, 3 some are flagged: the reader judges)"

# ---- 7. address report ----------------------------------------------------------------------------------------------
log "[7/7] address report: masks and raw address-shaped strings by domain kind (kinds and counts only)"
rc=0; node --input-type=module -e "$REPORT_JS" "$ROOT" "${slug_list[@]}" || rc=$?
log "[7/7] address report: exit $rc"
[ "$rc" -eq 0 ] || die 1 "[7/7] the address report failed"

case "$cc" in
  0 | 3) exit "$cc" ;;
  *) die 1 "[6/7] capture-check exited $cc, neither 0 nor 3: a capture is missing or unreadable (its message is above)" ;;
esac
