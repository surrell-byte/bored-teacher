#!/usr/bin/env bash
# Confirmed: grammar-hoop-slam-cover.webp is the cover for the 'warriors'
# game. This script:
#   1. Moves the file out of _needs-review into public/assets/covers
#      (a plain `mv` — this also removes it from _needs-review, so
#      there's no separate cleanup step needed).
#   2. Renames the game's display name from "Warriors Grammar Slam" to
#      "Grammar Hoop Slam" in constants/games.ts (the id stays 'warriors'
#      so routes/leaderboard/save data tied to that id keep working —
#      say the word if you want the id changed too).
#   3. Adds the warriors -> cover mapping to GAME_COVERS in
#      constants/index.ts.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x rename-grammar-hoop-slam.sh
#   ./rename-grammar-hoop-slam.sh

set -euo pipefail

SRC="public/assets/covers/_needs-review/grammar-hoop-slam-cover.webp"
DEST="public/assets/covers/grammar-hoop-slam-cover.webp"

if [ -f "$SRC" ]; then
  mv -v "$SRC" "$DEST"
elif [ -f "$DEST" ]; then
  echo "Already at $DEST — skipping move."
else
  echo "Couldn't find grammar-hoop-slam-cover.webp in _needs-review or covers/."
  echo "Check the file location manually before re-running."
  exit 1
fi

GAMES_FILE="constants/games.ts"
OLD_NAME="name: 'Warriors Grammar Slam'"
NEW_NAME="name: 'Grammar Hoop Slam'"

if grep -qF "$NEW_NAME" "$GAMES_FILE"; then
  echo "Game name already updated in $GAMES_FILE — skipping."
elif grep -qF "$OLD_NAME" "$GAMES_FILE"; then
  perl -pi -e "s/\Q$OLD_NAME\E/$NEW_NAME/" "$GAMES_FILE"
  echo "Renamed game to 'Grammar Hoop Slam' in $GAMES_FILE."
else
  echo "Couldn't find the expected name field in $GAMES_FILE — check manually."
  exit 1
fi

COVERS_FILE="constants/index.ts"
ANCHOR="  unicornwings: '/assets/covers/unicorn-wing-races-cover.webp',"
NEW_ENTRY="  warriors: '/assets/covers/grammar-hoop-slam-cover.webp',"

if grep -qF "warriors: '/assets/covers/" "$COVERS_FILE"; then
  echo "GAME_COVERS already has a 'warriors' entry — skipping."
elif grep -qF "$ANCHOR" "$COVERS_FILE"; then
  perl -0777 -pi -e "s{\Q$ANCHOR\E}{$ANCHOR\n$NEW_ENTRY}" "$COVERS_FILE"
  echo "Added warriors cover entry to $COVERS_FILE."
else
  echo "Couldn't find the expected anchor line in $COVERS_FILE — check manually."
  exit 1
fi

echo
echo "Done. If public/assets/covers/_needs-review/ is now empty except for"
echo "shark-survival-cover.webp, that one's still unresolved — let me know"
echo "what it's for when you're ready."
