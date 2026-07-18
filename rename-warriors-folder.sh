#!/usr/bin/env bash
# Renames games/warriors-grammar-slam -> games/grammar-hoop-slam,
# WarriorsGrammarSlam.jsx -> GrammarHoopSlam.jsx, and finds/replaces every
# reference to the old names across the codebase (registry, imports,
# url field in constants/games.ts, etc).
#
# NOTE: this changes the game's id-adjacent path references. If anything
# external (saved scores, deep links) depends on the literal string
# "warriors-grammar-slam", this will break that link. The 'warriors' id
# itself (in constants/games.ts) is left untouched — only the folder,
# file, component name, and url path get renamed.
#
# Leaves a .bak next to every file it edits so you can diff/revert.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x rename-warriors-folder.sh
#   ./rename-warriors-folder.sh

set -euo pipefail

OLD_DIR="games/warriors-grammar-slam"
NEW_DIR="games/grammar-hoop-slam"
OLD_FILE="WarriorsGrammarSlam.jsx"
NEW_FILE="GrammarHoopSlam.jsx"
OLD_COMPONENT="WarriorsGrammarSlam"
NEW_COMPONENT="GrammarHoopSlam"

if [ ! -d "$OLD_DIR" ]; then
  echo "$OLD_DIR not found. Already renamed? Checking for $NEW_DIR..."
  if [ -d "$NEW_DIR" ]; then
    echo "$NEW_DIR already exists — nothing to do."
    exit 0
  fi
  echo "Neither directory found — check the path manually."
  exit 1
fi

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git mv "$OLD_DIR" "$NEW_DIR"
  git mv "$NEW_DIR/$OLD_FILE" "$NEW_DIR/$NEW_FILE"
else
  mv -v "$OLD_DIR" "$NEW_DIR"
  mv -v "$NEW_DIR/$OLD_FILE" "$NEW_DIR/$NEW_FILE"
fi

echo "Renamed folder and file."
echo

REFS_FILE="$(mktemp)"
grep -rl -e "$OLD_COMPONENT" -e "warriors-grammar-slam" -e "warriors\.html" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git . \
  > "$REFS_FILE" || true

if [ ! -s "$REFS_FILE" ]; then
  echo "No other references found to update."
else
  echo "Updating references in:"
  cat "$REFS_FILE"
  echo
  while IFS= read -r f; do
    perl -pi.bak -e "
      s/\Q$OLD_COMPONENT\E/$NEW_COMPONENT/g;
      s/warriors-grammar-slam/grammar-hoop-slam/g;
      s/warriors\.html/grammar-hoop-slam.html/g;
    " "$f"
  done < "$REFS_FILE"
fi

rm -f "$REFS_FILE"

echo
echo "Done. .bak backups were left next to every edited file for review."
echo "Once you've confirmed 'npm run build' passes, remove them with:"
echo "  find . -name '*.bak' -not -path '*/node_modules/*' -delete"
