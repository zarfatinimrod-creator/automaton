#!/usr/bin/env bash
# Run a Python product's tests without hunting for a venv.
#
# Usage: scripts/pytest-product.sh <product> [pytest args...]      e.g. scripts/pytest-product.sh parent-guides -q -rs
#
# <product> is a directory under products/ with requirements*.txt (chart-explainer, parent-guides). The venv lives
# outside the repo, one per product and requirements content:
#   ${PYTEST_PRODUCT_VENVS:-${XDG_CACHE_HOME:-$HOME/.cache}/mehudak-pytest}/<product>-<12 hex of sha256 over
#   every requirements*.txt, name and contents>
# It is made with python3 -m venv and every requirements*.txt is installed into it (one pip call) when it is missing;
# a changed requirements file is a new hash and so a new venv. A venv counts as ready only after its install
# succeeded (a marker file), so a failed install is retried next time rather than reused half-built.
#
# pytest runs as `python -m pytest <args>` from products/<product>/, its output goes to
# ${PYTEST_PRODUCT_OUT:-a fresh mktemp -d}/pytest.log, the tail is printed, and the exit code is pytest's own.
# Skips: if the product's CI workflow (.github/workflows/<product>-ci.yml) has a line that greps for "skipped"
# (parent-guides-ci.yml does: "a skip fails the job"), a run whose log matches '[0-9]+ skipped' exits 1 here too,
# with the same pattern CI uses. chart-explainer-ci.yml has no such line, so skips pass there as they do in CI.
#
# Exit 2: no product, a name that is not a plain directory name, or no products/<name>/requirements*.txt.
# PYTEST_PRODUCT_ROOT (repo root) and PYTEST_PRODUCT_PYTHON (default python3) exist for the tests.
set -euo pipefail
export LC_ALL=C

ROOT="${PYTEST_PRODUCT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
PRODUCT="${1:-}"
refuse() { echo "pytest-product: $*" >&2; echo "usage: $0 <product> [pytest args...]" >&2; exit 2; }
[ -n "$PRODUCT" ] || refuse "no product named"
[[ "$PRODUCT" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ && "$PRODUCT" != *..* ]] \
  || refuse "\"$PRODUCT\" is not a product name (a directory name under products/, no slash, no ..)"
DIR="$ROOT/products/$PRODUCT"
[ -d "$DIR" ] || refuse "no directory products/$PRODUCT"
REQS=("$DIR"/requirements*.txt)
[ -f "${REQS[0]}" ] || refuse "products/$PRODUCT has no requirements*.txt, so it is not a Python product"
shift

HASH="$(for f in "${REQS[@]}"; do printf '%s\0' "$(basename "$f")"; cat "$f"; done | sha256sum | cut -c1-12)"
VENV="${PYTEST_PRODUCT_VENVS:-${XDG_CACHE_HOME:-$HOME/.cache}/mehudak-pytest}/$PRODUCT-$HASH"
OUT="${PYTEST_PRODUCT_OUT:-$(mktemp -d "${TMPDIR:-/tmp}/pytest-product.XXXXXX")}"
mkdir -p "$OUT"
READY="$VENV/.pytest-product-ready"

if [ -f "$READY" ]; then
  echo "venv: $VENV (reused)"
else
  echo "venv: $VENV (creating; install log $OUT/install.log)"
  rm -rf "$VENV"; mkdir -p "$(dirname "$VENV")"
  pip_args=(); for f in "${REQS[@]}"; do pip_args+=(-r "$f"); done
  code=0
  { "${PYTEST_PRODUCT_PYTHON:-python3}" -m venv "$VENV" \
      && "$VENV/bin/python" -m pip install -q --disable-pip-version-check "${pip_args[@]}"; } > "$OUT/install.log" 2>&1 || code=$?
  if [ "$code" -ne 0 ]; then
    tail -n 20 "$OUT/install.log"
    echo "pytest-product: making the venv failed (exit $code); nothing was tested" >&2
    exit "$code"
  fi
  touch "$READY"
fi

LOG="$OUT/pytest.log"
code=0; (cd "$DIR" && "$VENV/bin/python" -m pytest "$@") > "$LOG" 2>&1 || code=$?
tail -n 15 "$LOG"
echo "log: $LOG"

CI="$ROOT/.github/workflows/$PRODUCT-ci.yml"
if [ "$code" -eq 0 ] && [ -f "$CI" ] && grep -Eq 'grep.*skipped' "$CI" && grep -Eq '[0-9]+ skipped' "$LOG"; then
  echo "pytest-product: tests were skipped, and .github/workflows/$PRODUCT-ci.yml fails the job on a skip; so does this (exit 1). Run with -rs for the reasons." >&2
  exit 1
fi
echo "pytest exit: $code"
exit "$code"
