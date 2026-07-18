#!/usr/bin/env bash
# Moves the new *-cover.webp files from the repo root into
# public/assets/covers, matching game ids in constants/games.ts.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x move-new-covers-2.sh
#   ./move-new-covers-2.sh

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
move "crimson-colour-duel-cover.webp"   # -> crimsonduel
move "family-quest-cover.webp"          # -> familyquest
move "feed-the-monster-cover.webp"      # -> feedmonster
move "flagmaster-cover.webp"            # -> flagmaster
move "fruit-word-hunt-cover.webp"       # -> fruitwordhunt
move "higher-or-lower-cover.webp"       # -> higherorlower
move "missing-fruit-cover.webp"         # -> missingfruit
move "money-blocks-cover.webp"          # -> moneyblocks
move "pac-man-cover.webp"               # -> pacman
move "phonics-adventure-cover.webp"     # -> phonicsadventure
move "super-wing-races-cover.webp"      # -> superwings
move "unicorn-wing-races-cover.webp"    # -> unicornwings

# No confident matching game id — parked for review
for f in "grammar-hoop-slam-cover.webp"; do
  if [ -f "$f" ]; then
    mv -v "$f" "$REVIEW/"
  fi
done

echo
echo "Done. Review folder (no confirmed match):"
ls -la "$REVIEW" 2>/dev/null || true
echo
echo "grammar-hoop-slam-cover.webp: my best guess is this belongs to the"
echo "'warriors' game (Warriors Grammar Slam, 🏀 icon) — but the id doesn't"
echo "literally match so I didn't wire it up blind. Confirm and I'll add it,"
echo "or tell me which game it's actually for."
