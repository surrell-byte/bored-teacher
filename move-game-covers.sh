#!/usr/bin/env bash
# Moves the *-cover.webp files you dropped in the repo root into
# public/assets/covers, matching the pattern already used for
# public/assets/{audio,icons,images,sounds}.
#
# Files that don't match any current game id in constants/games.ts
# go into public/assets/covers/_needs-review/ instead of being wired
# up blind.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x move-game-covers.sh
#   ./move-game-covers.sh

set -euo pipefail

DEST="public/assets/covers"
REVIEW="$DEST/_needs-review"
mkdir -p "$DEST" "$REVIEW"

move() {
  local f="$1"
  if [ -f "$f" ]; then
    mv -v "$f" "$DEST/"
  else
    echo "skip (not found): $f"
  fi
}

# Matched to an existing game id in constants/games.ts
move "animal-class-quest-cover.webp"
move "block-fight-cover.webp"
move "colour-clash-cover.webp"
move "compound-word-quest.webp"
move "connect-4-cover.webp"
move "count-and-add-cover.webp"
move "deep-sea-reveal.webp"
move "emoji-match-cover.webp"
move "emoji-spelling-game-cover.webp"
move "farm-game-cover.webp"
move "find-my-food-cover.webp"
move "food-word-hunt-cover.webp"
move "froggy-hop-cover.webp"
move "memory-match-cover.webp"
move "neon-bridge-cover.webp"
move "ocean-quest-cover.webp"
move "parachute-drop-cover.webp"
move "phonics-world-cover.webp"
move "shakers-showtime-racer-cover.webp"   # assumed typo for lakers-showtime-racer
move "shuttlecock-smash-cover.webp"
move "tornado-cover.webp"
move "treasure-chest-showdown-cover.webp"
move "w-grand-prix.webp"
move "word-match-cover.webp"

# No matching game id yet — parked for review instead of guessing
for f in "monkey-tree-climb-cover.webp" "red-or--black-cover.webp" "shark-survival-cover.webp"; do
  if [ -f "$f" ]; then
    mv -v "$f" "$REVIEW/"
  fi
done

echo
echo "Done. Review folder (no matching game id yet):"
ls -la "$REVIEW" 2>/dev/null || true
echo
echo "monkey-tree-climb already exists as an unregistered game folder"
echo "(games/monkey-tree-climb/MonkeyTreeClimb.jsx) — same situation as"
echo "block-fight and connect-4 before. Say the word and I'll register it too."
echo "red-or--black and shark-survival don't match any game folder at all —"
echo "let me know what those are for."
