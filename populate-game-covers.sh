#!/usr/bin/env bash
# Replaces the empty GAME_COVERS object in constants/index.ts with the
# populated map, pointing at public/assets/covers/*.
#
# Run move-game-covers.sh FIRST so the files actually exist at these paths.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x populate-game-covers.sh
#   ./populate-game-covers.sh

set -euo pipefail

FILE="constants/index.ts"

if ! grep -qF 'export const GAME_COVERS: Record<string, string> = {};' "$FILE"; then
  echo "Couldn't find the exact empty GAME_COVERS line in $FILE."
  echo "It may have already been edited — check manually before re-running."
  exit 1
fi

perl -0777 -pi -e "s/export const GAME_COVERS: Record<string, string> = \{\};/export const GAME_COVERS: Record<string, string> = {\n  animalclass: '\/assets\/covers\/animal-class-quest-cover.webp',\n  blockfight: '\/assets\/covers\/block-fight-cover.webp',\n  colourclash: '\/assets\/covers\/colour-clash-cover.webp',\n  compound: '\/assets\/covers\/compound-word-quest.webp',\n  connect4: '\/assets\/covers\/connect-4-cover.webp',\n  countadd: '\/assets\/covers\/count-and-add-cover.webp',\n  deepseaReveal: '\/assets\/covers\/deep-sea-reveal.webp',\n  emojimatch: '\/assets\/covers\/emoji-match-cover.webp',\n  emojispelling: '\/assets\/covers\/emoji-spelling-game-cover.webp',\n  farmgame: '\/assets\/covers\/farm-game-cover.webp',\n  findmyfood: '\/assets\/covers\/find-my-food-cover.webp',\n  foodwordhunt: '\/assets\/covers\/food-word-hunt-cover.webp',\n  swampjump: '\/assets\/covers\/froggy-hop-cover.webp',\n  memory: '\/assets\/covers\/memory-match-cover.webp',\n  neonbridge: '\/assets\/covers\/neon-bridge-cover.webp',\n  oceanquest: '\/assets\/covers\/ocean-quest-cover.webp',\n  parachutedrop: '\/assets\/covers\/parachute-drop-cover.webp',\n  phonicsworld: '\/assets\/covers\/phonics-world-cover.webp',\n  lakersracer: '\/assets\/covers\/shakers-showtime-racer-cover.webp',\n  shuttlecock: '\/assets\/covers\/shuttlecock-smash-cover.webp',\n  tornado: '\/assets\/covers\/tornado-cover.webp',\n  treasurechest: '\/assets\/covers\/treasure-chest-showdown-cover.webp',\n  wgrandprix: '\/assets\/covers\/w-grand-prix.webp',\n  wordmatch: '\/assets\/covers\/word-match-cover.webp',\n};/" "$FILE"

echo "Updated $FILE. Diff:"
git diff -- "$FILE" 2>/dev/null || grep -n "GAME_COVERS" -A 26 "$FILE"
