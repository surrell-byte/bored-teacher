#!/usr/bin/env bash
# Moves the 3 covers still sitting in the repo root into
# public/assets/covers and wires them into GAME_COVERS.
#
# picture-race-cover.webp        -> picturerace   (Picture Race)
# sentence-builder-cover.webp    -> sentencebuilder (Sentence Builder)
# unicorn-trophy-race-cover.webp -> unicorn       (Unicorn Trophy Run)
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x move-new-covers-3.sh
#   ./move-new-covers-3.sh

set -euo pipefail

DEST="public/assets/covers"
mkdir -p "$DEST"

move() {
  local f="$1"
  if [ -f "$f" ]; then
    mv -v "$f" "$DEST/"
  else
    echo "skip (not found): $f"
  fi
}

move "picture-race-cover.webp"
move "sentence-builder-cover.webp"
move "unicorn-trophy-race-cover.webp"

COVERS_FILE="constants/index.ts"
ANCHOR="  warriors: '/assets/covers/grammar-hoop-slam-cover.webp',"
NEW_ENTRIES="  picturerace: '/assets/covers/picture-race-cover.webp',\n  sentencebuilder: '/assets/covers/sentence-builder-cover.webp',\n  unicorn: '/assets/covers/unicorn-trophy-race-cover.webp',"

if grep -qF "picturerace: '/assets/covers/" "$COVERS_FILE"; then
  echo "GAME_COVERS already has these entries — skipping constants/index.ts edit."
elif grep -qF "$ANCHOR" "$COVERS_FILE"; then
  perl -0777 -pi -e "s{\Q$ANCHOR\E}{$ANCHOR\n$NEW_ENTRIES}" "$COVERS_FILE"
  echo "Added picturerace, sentencebuilder, and unicorn cover entries to $COVERS_FILE."
else
  echo "Couldn't find the expected anchor line in $COVERS_FILE."
  echo "GAME_COVERS may have changed since — add these manually:"
  echo -e "$NEW_ENTRIES"
  exit 1
fi

echo
echo "Done."
