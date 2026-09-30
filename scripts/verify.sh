#!/usr/bin/env bash
# The check to run before pushing: typecheck, then vitest on the given paths (default src/__tests__/revenue).
#
# Usage: scripts/verify.sh [test paths...]
#
# Each step's full output goes to a log file in VERIFY_OUT (default: a fresh mktemp -d) and each runner's own exit
# code is recorded. A pass comes only from the exit codes, never from a grep of the output. (Two pushes of failing
# tests came from `npx vitest ... | grep ...`, which returns grep's status.) The output may only veto a pass: a test
# step that exits 0 fails anyway when its log has no "Tests" summary line (nothing shows a test ran) or when a
# "Test Files"/"Tests" line says "failed". Both steps always run, so a failing typecheck still shows the test result.
# Exits 1 naming the failed step(s); exits 2, running nothing, when a command is empty or the logs cannot be written.
#
# VERIFY_ROOT is the checkout to check (default: the one this file is in). scripts/merge-worktree.sh runs a copy of
# verify.sh taken from before the merge, with VERIFY_ROOT set, so a branch cannot judge itself with its own copy.
# VERIFY_TYPECHECK_CMD and VERIFY_TEST_CMD replace the two commands (split on spaces; the test paths are appended to
# the test command) so a test can stand in a runner that prints a passing summary and exits 1. merge-worktree.sh
# clears both, and each step's header prints the command that ran.
set -euo pipefail

ROOT="${VERIFY_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"; cd "$ROOT"
[ "$#" -gt 0 ] || set -- src/__tests__/revenue
read -r -a TYPECHECK <<< "${VERIFY_TYPECHECK_CMD:-pnpm -s typecheck}" || true
read -r -a TESTS <<< "${VERIFY_TEST_CMD:-npx vitest run}" || true
[ "${#TYPECHECK[@]}" -gt 0 ] || { echo "verify: VERIFY_TYPECHECK_CMD is empty; nothing to run" >&2; exit 2; }
[ "${#TESTS[@]}" -gt 0 ] || { echo "verify: VERIFY_TEST_CMD is empty; nothing to run" >&2; exit 2; }

OUT="${VERIFY_OUT:-$(mktemp -d "${TMPDIR:-/tmp}/verify.XXXXXX")}"
# A redirect that fails would be recorded as the step's own exit code and name the wrong step: check first.
if ! { mkdir -p "$OUT" && : > "$OUT/typecheck.log" && : > "$OUT/tests.log"; } 2>/dev/null; then
  echo "verify: cannot write logs in $OUT; nothing was run" >&2; exit 2
fi
echo "verify: checking $ROOT"

tc=0; "${TYPECHECK[@]}" > "$OUT/typecheck.log" 2>&1 || tc=$?
tests=0; "${TESTS[@]}" "$@" > "$OUT/tests.log" 2>&1 || tests=$?

plain() { sed 's/\x1b\[[0-9;]*m//g' "$1" 2>/dev/null || true; }
summary="$(plain "$OUT/tests.log" | grep -E '^ *(Test Files|Tests) ' || true)"

echo "== typecheck (${TYPECHECK[*]}): exit $tc  (log: $OUT/typecheck.log)"
[ "$tc" -eq 0 ] || tail -n 5 "$OUT/typecheck.log" || true
echo "== tests (${TESTS[*]} $*): exit $tests  (log: $OUT/tests.log)"
if [ -n "$summary" ]; then
  printf '%s\n' "$summary"
else
  echo '   (no "Test Files" or "Tests" line in the log; its last lines:)'
  tail -n 5 "$OUT/tests.log" || true
fi
[ "$tests" -eq 0 ] || { plain "$OUT/tests.log" | grep -E '^ *FAIL ' | sort -u | head -n 10; } || true

failed=""
[ "$tc" -eq 0 ] || failed="typecheck (exit $tc)"
if [ "$tests" -ne 0 ]; then
  failed="${failed:+$failed, }tests (exit $tests)"
# Vetoes only: an exit-0 test step still fails when its own summary says so, or when there is no summary at all.
elif grep -Eq '^ *(Test Files|Tests) .*\bfailed\b' <<< "$summary"; then
  failed="${failed:+$failed, }tests (exit 0, but the summary says failed)"
elif ! grep -Eq '^ *Tests ' <<< "$summary"; then
  failed="${failed:+$failed, }tests (exit 0, but no \"Tests\" summary line: nothing shows a test ran)"
fi
if [ -n "$failed" ]; then echo "verify: FAILED: $failed" >&2; exit 1; fi
echo "verify: passed"
