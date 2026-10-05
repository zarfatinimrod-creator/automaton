#!/usr/bin/env bash
# sim-tree — run a command in a throwaway copy of the checkout at a ref, not in the checkout itself. One exception:
# node_modules is the checkout's own, shared through a link (below), so what the command writes there is written there.
#
# Why: a command that writes for real (`remask-captures.mjs --apply`, `freeze-capture.mjs --apply`) is simulated
# before anyone runs it on the repository. In ticks 48, 49 and 50 a builder, a reviewer and a fixer each built that
# simulation by hand, three times per build: `git archive | tar -x`, `git init`, a commit, a link to node_modules, the
# command, then a cleanup. This is that, once.
#
# Usage: scripts/sim-tree.sh [--ref <ref>] [--keep] [--dir <path>] -- <cmd> [args...]
#   --ref <ref>   the commit to copy (default HEAD). Only committed files: the checkout's uncommitted edits and
#                 untracked files are not in the tree.
#   --dir <path>  where to build the tree; it must not exist yet, its parent must (no directory chain is made and left
#                 behind), and it must be outside the repository (a tree inside the checkout would be seen by git status
#                 and by vitest's include globs). It is created with `mkdir`, not `mkdir -p`: two runs given one --dir
#                 cannot both build into it (and then delete it under each other); the second is refused. Default: a
#                 fresh sim-tree.XXXXXX under the system temp dir ($TMPDIR, else /tmp), which must be outside it too.
#   --keep        keep the tree after the command, even when it passes.
# The tree is `git archive <ref> | tar -x`, then `git init` and one commit of everything whose subject names the ref
# and its sha (the identity is passed with -c flags; no git config is changed), then a symlink to the checkout's
# node_modules when it has one (so vitest, tsx and the scripts resolve their dependencies, at zero disk). The command
# runs with the tree as its working directory and SIM_TREE=<tree> in its environment. Before it, stderr names the
# tree, the ref and the sha; after it, the command's exit code. The tree is removed (by its absolute path, only
# because this run created it) after a pass; after a failure, or with --keep, it is kept and its path printed, with a
# removal command whose path is shell-quoted (safe to paste when the path holds a space).
#
# node_modules is a link, not a copy: the command must not install into it or delete from it, because that is the
# checkout's node_modules. Tools write there on their own too: vitest keeps its results cache in node_modules/.vite.
# `git status` of the checkout cannot see any of it (node_modules is ignored).
#
# Exit: the command's own exit code; 2 a refusal, with nothing created: not inside a git repository, an unknown ref,
# an empty, existing (a dangling link included) or uncreatable --dir, a tree path inside the repository, no command
# after --, or a bad option. (A command that itself
# exits 2 is told apart by the "sim-tree: the command exited 2" line.) A step that fails while the tree is being built
# (archive, init, commit, link) removes the half-built tree and exits with that step's code; the command never runs.
set -euo pipefail

usage='usage: scripts/sim-tree.sh [--ref <ref>] [--keep] [--dir <path>] -- <cmd> [args...]'
refuse() { echo "sim-tree: $*" >&2; echo "$usage" >&2; exit 2; }

ref=HEAD; keep=0; dir=""; dashdash=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --ref) [ "$#" -ge 2 ] || refuse "--ref needs a value"; ref="$2"; shift 2 ;;
    --dir) [ "$#" -ge 2 ] || refuse "--dir needs a value"; [ -n "$2" ] || refuse "--dir is empty"; dir="$2"; shift 2 ;;
    --keep) keep=1; shift ;;
    --) dashdash=1; shift; break ;;
    -*) refuse "unknown option: $1" ;;
    *) refuse "the command goes after --: $1" ;;
  esac
done
[ "$dashdash" -eq 1 ] && [ "$#" -gt 0 ] || refuse "no command after --"

root="$(git rev-parse --show-toplevel 2>/dev/null)" || refuse "not inside a git repository"
root="$(realpath -e -- "$root")"
sha="$(git -C "$root" rev-parse --verify --quiet "${ref}^{commit}")" || refuse "unknown ref: $ref"

inside() { [ "$1" = "$root" ] || [ "${1#"$root"/}" != "$1" ]; }
if [ -n "$dir" ]; then
  { [ -e "$dir" ] || [ -L "$dir" ]; } && refuse "--dir $dir already exists"
  tree="$(realpath -m -- "$dir")"
  inside "$tree" && refuse "--dir $tree is inside the repository ($root)"
else
  base="$(realpath -m -- "${TMPDIR:-/tmp}")"
  inside "$base" && refuse "the temp dir $base is inside the repository ($root); pass --dir or set TMPDIR"
  tree=""
fi

# Git variables a hook or a caller may have set would point the tree's git (and the command's) at the checkout.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_COMMON_DIR

# Created by this run alone, atomically: `mkdir` without -p fails when the path is already there, so of two runs given
# one --dir that both passed the check above, one is refused here; and it makes no parent, so nothing is created that
# the cleanup below would not remove. ($tree comes from realpath, and mktemp's from an absolute $base: both absolute.)
if [ -n "$tree" ]; then
  if ! err="$(mkdir -- "$tree" 2>&1)"; then
    { [ -e "$tree" ] || [ -L "$tree" ]; } && refuse "--dir $tree already exists"
    refuse "cannot create --dir $tree (${err##*: })"
  fi
else
  tree="$(mktemp -d "$base/sim-tree.XXXXXX")"
fi
# A setup step that fails takes the half-built tree with it.
trap 'rm -rf -- "$tree"; echo "sim-tree: building the tree failed; removed $tree" >&2' EXIT
git -C "$root" archive --format=tar "$sha" | tar -x -C "$tree"
git -C "$tree" init -q
git -C "$tree" add -A -f
git -C "$tree" -c user.name=sim-tree -c user.email=sim-tree -c commit.gpgsign=false \
  commit -q --no-verify --allow-empty -m "sim-tree: $ref at $sha"
if [ -d "$root/node_modules" ]; then
  ln -s -- "$root/node_modules" "$tree/node_modules"
  echo "/node_modules" >> "$tree/.git/info/exclude"
fi
trap - EXIT

echo "sim-tree: tree $tree" >&2
echo "sim-tree: from $ref at $sha" >&2
code=0
( cd "$tree" && SIM_TREE="$tree" exec "$@" ) || code=$?
echo "sim-tree: the command exited $code" >&2

printf -v q '%q' "$tree"
if [ "$keep" -eq 1 ]; then
  echo "sim-tree: kept $tree (--keep); remove it with: rm -rf -- $q" >&2
elif [ "$code" -ne 0 ]; then
  echo "sim-tree: kept $tree to inspect the failure; remove it with: rm -rf -- $q" >&2
else
  rm -rf -- "$tree"
  echo "sim-tree: removed $tree" >&2
fi
exit "$code"
