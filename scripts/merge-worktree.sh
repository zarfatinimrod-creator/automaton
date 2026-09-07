#!/usr/bin/env bash
# Merge a finished agent worktree branch into the current branch, verify, push, clean up.
#
# Usage: scripts/merge-worktree.sh <worktree-branch> "<merge subject>" [--no-push]
#
# What it does, in order, stopping at the first failure:
#   1. refuses if the working tree is dirty or the branch is already merged
#   2. git merge --no-ff with the repo's commit trailers
#   3. pnpm typecheck, then the revenue test suite (the fold-in test is in it)
#   4. push (unless --no-push)
#   5. removes the worktree directory and deletes the branch
#
# On a merge conflict it stops after step 2 with the conflicted files listed; resolve,
# `git add` them, `git commit --no-edit`, then re-run with the same arguments — the
# script detects the merged state and continues from step 3.
set -euo pipefail

BRANCH="${1:-}"; SUBJECT="${2:-}"; PUSH=1
[ "${3:-}" = "--no-push" ] && PUSH=0
if [ -z "$BRANCH" ] || [ -z "$SUBJECT" ]; then
  echo "usage: $0 <worktree-branch> \"<merge subject>\" [--no-push]" >&2; exit 2
fi
ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
CURRENT="$(git branch --show-current)"
TRAILERS=$'\n\nCo-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_018HcVJk7qcVHupvjvQZ91kR'

if git merge-base --is-ancestor "$BRANCH" HEAD; then
  echo "already merged: $BRANCH — continuing with verify/push/cleanup"
else
  if [ -n "$(git status --porcelain)" ]; then
    echo "working tree is dirty; commit or stash first" >&2; git status --short >&2; exit 1
  fi
  if ! git merge --no-ff "$BRANCH" -m "$SUBJECT$TRAILERS"; then
    echo; echo "CONFLICT — resolve these, git add, git commit --no-edit, then re-run:" >&2
    git diff --name-only --diff-filter=U >&2; exit 1
  fi
fi

echo "== typecheck"; pnpm -s typecheck
echo "== revenue tests"; npx vitest run src/__tests__/revenue 2>&1 | grep -E 'Test Files|Tests |FAIL' || true
npx vitest run src/__tests__/revenue >/dev/null 2>&1 || { echo "revenue tests failed" >&2; exit 1; }

if [ "$PUSH" = 1 ]; then
  echo "== push"
  for i in 1 2 3 4; do git push -q -u origin "$CURRENT" && break || sleep $((2**i)); done
fi

echo "== cleanup"
WT="$(git worktree list --porcelain | awk -v b="refs/heads/$BRANCH" '$1=="worktree"{p=$2} $1=="branch"&&$2==b{print p}')"
if [ -n "$WT" ]; then git worktree unlock "$WT" 2>/dev/null || true; git worktree remove --force "$WT"; fi
git branch -D "$BRANCH" >/dev/null && echo "removed $BRANCH"
git worktree prune
git log --oneline -1
