#!/usr/bin/env bash
# Looks for a cover file for the 'unicorn' game (Unicorn Trophy Run) under
# a few likely filenames, moves whichever one exists into
# public/assets/covers, and wires it into GAME_COVERS.
#
# If none of these match what you named the file, just rename it to
# unicorn-trophy-run-cover.webp and re-run.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x add-unicorn-trophy-cover.sh
#   ./add-unicorn-trophy-cover.sh

set -euo pipefail

DEST="public/assets/covers"
mkdir -p "$DEST"

FOUND=""
for candidate in \
  "unicorn-trophy-run-cover.webp" \
  "unicorn-trophy-cover.webp" \
  "unicorn-run-cover.webp" \
  "unicorn-cover.webp"
do
  if [ -f "$candidate" ]; then
    FOUND="$candidate"
    break
  fi
done

if [ -z "$FOUND" ]; then
  echo "No unicorn cover file found in the repo root under any expected name."
  echo "Checked: unicorn-trophy-run-cover.webp, unicorn-trophy-cover.webp,"
  echo "         unicorn-run-cover.webp, unicorn-cover.webp"
  echo "Add the file (any of those names works) and re-run this script."
  exit 1
fi

mv -v "$FOUND" "$DEST/$FOUND"

COVERS_FILE="constants/index.ts"
ANCHOR="  unicornwings: '/assets/covers/unicorn-wing-races-cover.webp',"
NEW_ENTRY="  unicorn: '/assets/covers/$FOUND',"

if grep -qF "unicorn: '/assets/covers/" "$COVERS_FILE"; then
  echo "GAME_COVERS already has a 'unicorn' entry — skipping."
elif grep -qF "$ANCHOR" "$COVERS_FILE"; then
  perl -0777 -pi -e "s{\Q$ANCHOR\E}{$ANCHOR\n$NEW_ENTRY}" "$COVERS_FILE"
  echo "Added unicorn cover entry to $COVERS_FILE."
else
  echo "Couldn't find the expected anchor line in $COVERS_FILE — check manually."
  exit 1
fi

echo "Done."
