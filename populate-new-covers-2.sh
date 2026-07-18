#!/usr/bin/env bash
# Adds the 12 confirmed new entries to the existing GAME_COVERS map in
# constants/index.ts. Run move-new-covers-2.sh FIRST so the files exist
# at these paths.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x populate-new-covers-2.sh
#   ./populate-new-covers-2.sh

set -euo pipefail

FILE="constants/index.ts"
ANCHOR="  wordmatch: '/assets/covers/word-match-cover.webp',"

if grep -qF "crimsonduel:" "$FILE"; then
  echo "GAME_COVERS already has a 'crimsonduel' entry — looks like this was already run."
  echo "Check $FILE manually before re-running."
  exit 1
fi

if ! grep -qF "$ANCHOR" "$FILE"; then
  echo "Couldn't find the expected anchor line in $FILE."
  echo "The GAME_COVERS block may have changed — check manually."
  exit 1
fi

NEW_ENTRIES="  crimsonduel: '/assets/covers/crimson-colour-duel-cover.webp',\n  familyquest: '/assets/covers/family-quest-cover.webp',\n  feedmonster: '/assets/covers/feed-the-monster-cover.webp',\n  flagmaster: '/assets/covers/flagmaster-cover.webp',\n  fruitwordhunt: '/assets/covers/fruit-word-hunt-cover.webp',\n  higherorlower: '/assets/covers/higher-or-lower-cover.webp',\n  missingfruit: '/assets/covers/missing-fruit-cover.webp',\n  moneyblocks: '/assets/covers/money-blocks-cover.webp',\n  pacman: '/assets/covers/pac-man-cover.webp',\n  phonicsadventure: '/assets/covers/phonics-adventure-cover.webp',\n  superwings: '/assets/covers/super-wing-races-cover.webp',\n  unicornwings: '/assets/covers/unicorn-wing-races-cover.webp',"

perl -0777 -pi -e "s{\Q$ANCHOR\E}{$ANCHOR\n$NEW_ENTRIES}" "$FILE"

echo "Updated $FILE. Diff:"
git diff -- "$FILE" 2>/dev/null || grep -n "GAME_COVERS" -A 40 "$FILE"
echo
echo "Not added (still needs your confirmation): grammar-hoop-slam-cover.webp"
echo "Still uncovered game ids with no cover file yet: unicorn, sentencebuilder, picturerace"
