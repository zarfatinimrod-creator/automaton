#!/usr/bin/env bash
# The check to run before pushing: typecheck, then vitest on the given paths (default src/__tests__/revenue).
#
# Usage: scripts/verify.sh [test paths...]
#
# Each step's full output goes to a log file in VERIFY_OUT (default: a fresh mktemp -d) and each runner's own exit
# code is recorded. The "Test Files" / "Tests" lines are grepped from the log for display only; the verdict is the
# exit codes. (Two pushes of failing tests came from `npx vitest ... | grep ...`, which returns grep's status.)
# Both steps always run, so a failing typecheck still shows the test result. Exits 1 naming the failed step(s).
#
# VERIFY_TYPECHECK_CMD and VERIFY_TEST_CMD replace the two commands (split on spaces; the test paths are appended to
# the test command) so a test can stand in a runner that prints a passing summary and exits 1.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
OUT="${VERIFY_OUT:-$(mktemp -d "${TMPDIR:-/tmp}/verify.XXXXXX")}"
mkdir -p "$OUT"
[ "$#" -gt 0 ] || set -- src/__tests__/revenue
read -r -a TYPECHECK <<< "${VERIFY_TYPECHECK_CMD:-pnpm -s typecheck}"
read -r -a TESTS <<< "${VERIFY_TEST_CMD:-npx vitest run}"

tc=0; "${TYPECHECK[@]}" > "$OUT/typecheck.log" 2>&1 || tc=$?
tests=0; "${TESTS[@]}" "$@" > "$OUT/tests.log" 2>&1 || tests=$?

# Display only: nothing below decides the result.
plain() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
echo "== typecheck: exit $tc  (log: $OUT/typecheck.log)"
[ "$tc" -eq 0 ] || tail -n 5 "$OUT/typecheck.log"
echo "== tests $*: exit $tests  (log: $OUT/tests.log)"
if ! plain "$OUT/tests.log" | grep -E '^ *(Test Files|Tests) '; then
  echo '   (no "Test Files" or "Tests" line in the log; its last lines:)'
  tail -n 5 "$OUT/tests.log"
fi
[ "$tests" -eq 0 ] || plain "$OUT/tests.log" | grep -E '^ *FAIL ' | sort -u | head -n 10 || true

failed=""
[ "$tc" -eq 0 ] || failed="typecheck (exit $tc)"
[ "$tests" -eq 0 ] || failed="${failed:+$failed, }tests (exit $tests)"
if [ -n "$failed" ]; then echo "verify: FAILED: $failed" >&2; exit 1; fi
echo "verify: passed"
