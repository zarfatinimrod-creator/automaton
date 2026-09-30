#!/usr/bin/env bash
# Merge a finished agent worktree branch into the current branch, verify, push, clean up.
#
# Usage: scripts/merge-worktree.sh <worktree-branch> "<merge subject>" [--no-push]
#
# What it does, in order, stopping at the first failure:
#   1. refuses if the working tree is dirty or the branch is already merged
#   2. git merge --no-ff with the repo's commit trailers
#   3. pnpm install --frozen-lockfile (a merged branch may add a dependency; ~3 s when nothing changed),
#      then scripts/verify.sh: pnpm typecheck and the revenue test suite (the fold-in test is in it), one run,
#      judged by the runners' exit codes. The verify.sh that runs is the one the current branch had BEFORE the
#      merge (copied out of git), so a branch cannot pass itself by changing verify.sh; its VERIFY_*_CMD
#      overrides are cleared, so the real commands run.
#   4. push (unless --no-push); if the remote branch moved, rebase onto it (--rebase-merges) and retry
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
# The trailers name the session doing the merge; override with MERGE_TRAILERS (a $'\n\n...' string) from another session.
TRAILERS=$'\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01VRCJXMqMdAnbYz2TwWreJn'
TRAILERS="${MERGE_TRAILERS:-$TRAILERS}"

if git merge-base --is-ancestor "$BRANCH" HEAD; then
  echo "already merged: $BRANCH — continuing with verify/push/cleanup"
else
  if [ -n "$(git status --porcelain)" ]; then
    echo "working tree is dirty; commit first (never git stash)" >&2; git status --short >&2; exit 1
  fi
  if ! git merge --no-ff "$BRANCH" -m "$SUBJECT$TRAILERS"; then
    echo; echo "CONFLICT — resolve these, git add, git commit --no-edit, then re-run:" >&2
    git diff --name-only --diff-filter=U >&2; exit 1
  fi
fi

# The render-js merge (tick 16) failed its tests because the branch added playwright-core and nothing installed it.
echo "== install"; pnpm install -s --frozen-lockfile --prefer-offline
echo "== typecheck + revenue tests"
# The judge is the verify.sh from before the merge: the newest first-parent commit that does not contain the branch
# (the tip we merged into, also on the re-run after a conflict). Run from the merged tree via VERIFY_ROOT.
PRE=""
for c in $(git rev-list --first-parent HEAD); do
  if ! git merge-base --is-ancestor "$BRANCH" "$c"; then PRE="$c"; break; fi
done
[ -n "$PRE" ] || { echo "cannot find $CURRENT's commit from before $BRANCH was merged; not verifying with the branch's own verify.sh" >&2; exit 1; }
JUDGE="$(mktemp "${TMPDIR:-/tmp}/merge-worktree-verify.XXXXXX")"
trap 'rm -f "$JUDGE"' EXIT
if git cat-file -e "$PRE:scripts/verify.sh" 2>/dev/null; then
  git show "$PRE:scripts/verify.sh" > "$JUDGE"
  echo "(verify.sh as of ${PRE:0:12}, from before the merge)"
else
  # Only the merge that adds verify.sh: there is no earlier judge to take.
  echo "no scripts/verify.sh before this merge (${PRE:0:12}): the merged copy judges this one merge" >&2
  cp "$ROOT/scripts/verify.sh" "$JUDGE"
fi
env -u VERIFY_TYPECHECK_CMD -u VERIFY_TEST_CMD -u VERIFY_OUT VERIFY_ROOT="$ROOT" bash "$JUDGE" src/__tests__/revenue \
  || { echo "typecheck or revenue tests failed (verify.sh named which)" >&2; exit 1; }

if [ "$PUSH" = 1 ]; then
  echo "== push"
  pushed=0
  for i in 1 2 3 4; do
    if git push -q -u origin "$CURRENT"; then pushed=1; break; fi
    # A render bot's commit landing mid-merge rejects the push (ticks 12-13). Replay ours on top, keeping merge commits.
    if git fetch -q origin "$CURRENT" && ! git merge-base --is-ancestor "origin/$CURRENT" HEAD; then
      echo "origin/$CURRENT moved; rebasing onto it"
      git rebase -q --rebase-merges "origin/$CURRENT" || {
        echo "rebase onto origin/$CURRENT conflicted: resolve, git rebase --continue, then re-run" >&2; exit 1; }
    else
      sleep $((2**i))
    fi
  done
  [ "$pushed" = 1 ] || { echo "push failed after 4 attempts" >&2; exit 1; }
fi

echo "== cleanup"
WT="$(git worktree list --porcelain | awk -v b="refs/heads/$BRANCH" '$1=="worktree"{p=$2} $1=="branch"&&$2==b{print p}')"
if [ -n "$WT" ]; then git worktree unlock "$WT" 2>/dev/null || true; git worktree remove --force "$WT"; fi
git branch -D "$BRANCH" >/dev/null && echo "removed $BRANCH"
git worktree prune
git log --oneline -1
