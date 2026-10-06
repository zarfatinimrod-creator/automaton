#!/usr/bin/env bash
# remask-run — the re-mask chain the main thread ran by hand in ticks 49 and 50, once, each step checked by its exit
# code, stopping at the first that fails.
#
# Why: logs/2026-10-05-channel-loop-tick-49.md and -tick-50.md (§2, §6) ran the same nine steps by hand, twice:
# dry run, apply, dry run again, sha256sum -c, freeze-capture --cited, an address count, verify, an owner-name grep,
# commit. This is that chain (logs/CHANNEL_LOOP.md §9, tick 52 item 1 = tick 50 item 2).
#
# Usage: scripts/remask-run.sh <YYYY-MM-DD> [--rendered <dir>] [--no-commit]
#   <YYYY-MM-DD>     the re-mask's date, a real day: remask-captures.mjs --apply --date writes it into each meta it
#                    re-masks; never read from the clock
#   --rendered <dir> the captures' directory, inside this repository (default research/rendered); passed to
#                    remask-captures.mjs, and where sha256sum -c and the commit look. freeze-capture.mjs --cited has no
#                    such option: it always reads this repository's research/rendered.
#   --no-commit      stop after step 8 and leave the changes uncommitted
#
# Run it from the root of the repository this file is in, with a clean working tree (no uncommitted change and no
# untracked file): the earlier bytes must be in git history, and the commit takes exactly what the apply changed.
#
# Environment:
#   REMASK_RUN_FORBIDDEN_RE  required: the extended regular expression (grep -iE) of the owner's identifiers, which no
#                            added line may match (step 8). The repository is public and keeps no such pattern
#                            (scripts/verify.sh and scripts/brand-check.mjs hold none), so the caller gives it; without
#                            it, or with one grep cannot read, nothing runs.
#   REMASK_RUN_OUT           where each step's output goes, one log per step (default: a fresh mktemp -d); the dry
#                            run's summary is dry-run-summary.txt there.
#   VERIFY_TYPECHECK_CMD, VERIFY_TEST_CMD  passed through to scripts/verify.sh, which honours them (a test stands in
#                            its runners); unset, step 7 is the real typecheck and the whole revenue suite.
#
# The steps, in order; each prints its command and exit code to stderr, and its output goes to its log:
#   1. node scripts/remask-captures.mjs --dry-run: exit 3 means there is work, 0 that there is none (the script says so
#      and exits 0, nothing else run), anything else stops the chain. Its summary (from "would change:" on: counts and
#      kinds only, never an address) goes to dry-run-summary.txt and to stderr.
#   2. node scripts/remask-captures.mjs --apply --date <date>: exit 0.
#   3. node scripts/remask-captures.mjs --dry-run again: exit 0 (the apply is idempotent: a second one changes nothing).
#   4. sha256sum -c --quiet FROZEN.sha256 in the captures' directory: exit 0.
#   5. node scripts/freeze-capture.mjs --cited: exit 0 (no cited line moved; nothing left citing an active capture).
#   6. node scripts/address-kinds.mjs over the files the apply changed (git status --porcelain): reported, not gating
#      (its 0 or 3 goes on; any other exit stops the chain).
#   7. scripts/verify.sh: exit 0.
#   8. grep -ciE "$REMASK_RUN_FORBIDDEN_RE" over the lines the apply added to those files (git diff -U0): nothing may
#      match; a match stops the chain naming the file and the count of lines, never the line.
#   9. unless --no-commit: git add -A <the captures' directory>, then one commit: "render: re-mask the stored captures,
#      <date>; git history keeps the earlier bytes", a body naming the date and the dry run's summary, and the trailers
#      of the last commit whose subject starts "render: re-mask", copied verbatim (git log --format=%(trailers)); the
#      script never writes a trailer of its own, and refuses to start when there is no such commit to copy them from.
#
# Exit: 0 the chain ran through (or there was nothing to re-mask); 2 refused before anything ran (not at the root of
# this repository, a date that is not YYYY-MM-DD, uncommitted changes, no REMASK_RUN_FORBIDDEN_RE, a --rendered outside
# the repository, no trailers to copy); otherwise the exit code of the step that failed (1 for a forbidden match),
# with nothing committed.
#
# src/__tests__/revenue/remask-run.test.ts runs it in fixture repositories built at run time, never on this one's
# research/rendered.
set -euo pipefail

usage='usage: scripts/remask-run.sh <YYYY-MM-DD> [--rendered <dir>] [--no-commit]'
log() { echo "remask-run: $*" >&2; }
refuse() { log "refused, nothing run: $*"; echo "$usage" >&2; exit 2; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
date_arg=""; rendered="research/rendered"; commit=1
while [ "$#" -gt 0 ]; do
  case "$1" in
    --rendered) [ "$#" -ge 2 ] && [ -n "$2" ] || refuse "--rendered needs a directory"; rendered="$2"; shift 2 ;;
    --no-commit) commit=0; shift ;;
    -*) refuse "unknown option: $1" ;;
    *) [ -z "$date_arg" ] || refuse "one date only"; date_arg="$1"; shift ;;
  esac
done

# ---- refusals: nothing has run yet ------------------------------------------------------------------------------------
[[ "$date_arg" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] && [ "$(date -u -d "$date_arg" +%F 2>/dev/null || true)" = "$date_arg" ] ||
  refuse "the date is not a real day written YYYY-MM-DD: '${date_arg}'"
top="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$top" ] && [ "$(cd "$top" && pwd -P)" = "$ROOT" ] && [ "$(pwd -P)" = "$ROOT" ] ||
  refuse "run it from the root of the repository it is in ($ROOT), not from $(pwd -P)"
[ -n "${REMASK_RUN_FORBIDDEN_RE:-}" ] || refuse "REMASK_RUN_FORBIDDEN_RE is not set: the owner-identifier pattern step 8 greps for"
rc=0; grep -qiE -- "$REMASK_RUN_FORBIDDEN_RE" < /dev/null || rc=$?
[ "$rc" -eq 1 ] || refuse "grep cannot read REMASK_RUN_FORBIDDEN_RE as an extended regular expression"
[ -d "$rendered" ] || refuse "no directory: $rendered"
rendered_abs="$(cd "$rendered" && pwd -P)"
case "$rendered_abs/" in "$ROOT"/?*) ;; *) refuse "--rendered is not inside this repository: $rendered" ;; esac
rendered_rel="${rendered_abs#"$ROOT"/}"
[ -z "$(git status --porcelain --untracked-files=all)" ] || refuse "the working tree has uncommitted changes or untracked files; commit them first"
trailers=""
if [ "$commit" -eq 1 ]; then
  trailers="$(git log -1 --grep='^render: re-mask' --format='%(trailers:only,unfold)' | sed '/^$/d')"
  [ -n "$trailers" ] || refuse "no earlier commit whose subject starts 'render: re-mask' carries trailers to copy (the script never writes its own); use --no-commit and commit by hand"
fi

OUT="${REMASK_RUN_OUT:-$(mktemp -d "${TMPDIR:-/tmp}/remask-run.XXXXXX")}"
mkdir -p "$OUT"
log "re-mask of $rendered_rel on $date_arg; each step's output is in $OUT"
remask=(node scripts/remask-captures.mjs)
[ "$rendered_rel" = "research/rendered" ] || remask+=(--rendered "$rendered_rel")

# step <n> <name> <command...>: runs the command with its output in $OUT/<n>-<name>.log, prints its exit code, sets rc.
step() {
  local n="$1" name="$2"; shift 2
  log "[$n/9] $*"
  rc=0; "$@" > "$OUT/$n-$name.log" 2>&1 || rc=$?
  log "[$n/9] $name: exit $rc"
}
fail() { log "[$1/9] stopped: $2 (its output: $OUT/$1-$3.log)"; tail -n 20 "$OUT/$1-$3.log" >&2 || true; exit "$4"; }

# ---- 1. dry run -------------------------------------------------------------------------------------------------------
step 1 dry-run "${remask[@]}" --dry-run
case "$rc" in
  0) log "[1/9] nothing to re-mask: the masker finds nothing new in $rendered_rel; nothing written, nothing committed"; exit 0 ;;
  3) ;;
  *) fail 1 "the dry run failed (exit $rc)" dry-run "$rc" ;;
esac
sed -n '/^would change:/,$p' "$OUT/1-dry-run.log" > "$OUT/dry-run-summary.txt"
[ -s "$OUT/dry-run-summary.txt" ] || fail 1 "the dry run printed no summary" dry-run 1
log "[1/9] the dry run's summary ($OUT/dry-run-summary.txt):"
sed 's/^/  /' "$OUT/dry-run-summary.txt" >&2

# ---- 2. apply ---------------------------------------------------------------------------------------------------------
step 2 apply "${remask[@]}" --apply --date "$date_arg"
[ "$rc" -eq 0 ] || fail 2 "the apply failed (exit $rc)" apply "$rc"

# ---- 3. dry run again: idempotent -------------------------------------------------------------------------------------
step 3 dry-run-again "${remask[@]}" --dry-run
[ "$rc" -eq 0 ] || fail 3 "a second dry run still finds work (exit $rc): the apply is not idempotent" dry-run-again "$rc"

# ---- 4. FROZEN.sha256 -------------------------------------------------------------------------------------------------
step 4 sha256sum bash -c 'cd "$1" && sha256sum -c --quiet FROZEN.sha256' sha256sum "$rendered_abs"
[ "$rc" -eq 0 ] || fail 4 "FROZEN.sha256 does not match the frozen copies (exit $rc)" sha256sum "$rc"

# ---- 5. cited lines ---------------------------------------------------------------------------------------------------
step 5 cited node scripts/freeze-capture.mjs --cited
[ "$rc" -eq 0 ] || fail 5 "freeze-capture --cited (exit $rc)" cited "$rc"

# ---- 6. address count over the changed files --------------------------------------------------------------------------
changed=()
while IFS= read -r -d '' entry; do changed+=("${entry:3}"); done < <(git status --porcelain=v1 -z --untracked-files=all -- "$rendered_rel")
log "[6/9] node scripts/address-kinds.mjs <the ${#changed[@]} file(s) the apply changed>"
rc=0
if [ "${#changed[@]}" -gt 0 ]; then node scripts/address-kinds.mjs "${changed[@]}" > "$OUT/6-address-kinds.log" 2> "$OUT/6-address-kinds.err" || rc=$?; fi
log "[6/9] address-kinds: exit $rc (reported, not gating: 0 no raw address-shaped string left, 3 some)"
[ ! -f "$OUT/6-address-kinds.log" ] || sed -n '/^total, /,$p' "$OUT/6-address-kinds.log"
[ "$rc" -eq 0 ] || [ "$rc" -eq 3 ] || fail 6 "address-kinds failed (exit $rc)" address-kinds "$rc"

# ---- 7. verify --------------------------------------------------------------------------------------------------------
step 7 verify scripts/verify.sh
[ "$rc" -eq 0 ] || fail 7 "scripts/verify.sh (exit $rc)" verify "$rc"

# ---- 8. no owner identifier among the added lines ---------------------------------------------------------------------
log "[8/9] grep -ciE \"\$REMASK_RUN_FORBIDDEN_RE\" over the lines the apply added (${#changed[@]} file(s))"
found=0
for f in "${changed[@]}"; do
  if git ls-files --error-unmatch -- "$f" > /dev/null 2>&1; then
    git diff -U0 --no-color -- "$f" | sed -n '/^+++/d; s/^+//p' > "$OUT/8-added.txt"
  else
    cp -- "$f" "$OUT/8-added.txt"
  fi
  rc=0; hits="$(grep -ciE -- "$REMASK_RUN_FORBIDDEN_RE" "$OUT/8-added.txt")" || rc=$?
  case "$rc" in
    0) log "[8/9] $f: $hits added line(s) match the owner-identifier pattern"; found=1 ;;
    1) ;;
    *) log "[8/9] grep failed on $f (exit $rc)"; found=1 ;;
  esac
done
log "[8/9] owner-identifier grep: $([ "$found" -eq 0 ] && echo "nothing found" || echo "FOUND")"
[ "$found" -eq 0 ] || { log "[8/9] stopped: an added line matches the owner-identifier pattern; nothing committed"; exit 1; }

# ---- 9. commit --------------------------------------------------------------------------------------------------------
if [ "$commit" -eq 0 ]; then
  log "[9/9] --no-commit: the changes stay uncommitted (git status shows them); commit them with the dry run's summary"
  exit 0
fi
{
  echo "render: re-mask the stored captures, $date_arg; git history keeps the earlier bytes"
  echo
  echo "scripts/remask-run.sh $date_arg: node scripts/remask-captures.mjs --apply --date $date_arg over"
  echo "$rendered_rel, between a dry run that exited 3 and one that exited 0; sha256sum -c FROZEN.sha256,"
  echo "freeze-capture.mjs --cited and scripts/verify.sh exited 0; no added line matches the owner-identifier"
  echo "pattern. The dry run before the apply:"
  echo
  cat "$OUT/dry-run-summary.txt"
  echo
  echo "Git history keeps the earlier bytes of every file this commit changes."
  echo
  printf '%s\n' "$trailers"
} > "$OUT/commit-message.txt"
step 9 add git add -A -- "$rendered_rel"
[ "$rc" -eq 0 ] || fail 9 "git add (exit $rc)" add "$rc"
step 9 commit git commit -q -F "$OUT/commit-message.txt"
[ "$rc" -eq 0 ] || fail 9 "git commit (exit $rc)" commit "$rc"
log "[9/9] committed $(git rev-parse --short HEAD): $(git log -1 --format=%s)"
