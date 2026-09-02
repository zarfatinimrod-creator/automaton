#!/usr/bin/env bash
# Install the repository's revenue skills into the automaton's skills directory.
# Usage: scripts/install-skills.sh [skills-dir]   (default: ~/.automaton/skills)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$HOME/.automaton/skills}"
mkdir -p "$DEST"
count=0
for dir in "$ROOT"/skills/*/; do
  name="$(basename "$dir")"
  if [ -f "$dir/SKILL.md" ]; then
    mkdir -p "$DEST/$name"
    cp "$dir/SKILL.md" "$DEST/$name/SKILL.md"
    count=$((count + 1))
  fi
done
echo "Installed $count skill(s) into $DEST"
