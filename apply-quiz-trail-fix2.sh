#!/usr/bin/env bash
# Fixes the Quiz Trail integration: the first patch registered the game's
# name/icon but never added it to GAME_KEYS — which is the list that
# actually drives what shows on the Hub and Games pages. This adds it
# there, plus its tag/badge/difficulty/bar-colour, so the card renders
# properly (it'll show with the icon-pattern cover, same as every other
# game — see note on covers below).
#
# Usage: put this file and quiz-trail-fix2.patch in the project root, then:
#   chmod +x apply-quiz-trail-fix2.sh
#   ./apply-quiz-trail-fix2.sh

set -euo pipefail

PATCH_FILE="quiz-trail-fix2.patch"

if [ ! -f "$PATCH_FILE" ]; then
  echo "❌ $PATCH_FILE not found. Put it in the project root and re-run."
  exit 1
fi
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found — run this script from the bored-teacher-react project root."
  exit 1
fi

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/quiz-trail-fix2-$STAMP"

echo "📦 Backing up constants/index.ts to $BACKUP_DIR"
mkdir -p "$BACKUP_DIR/constants"
cp constants/index.ts "$BACKUP_DIR/constants/index.ts"

echo "🔧 Patching constants/index.ts (GAME_KEYS, NEW_GAME_KEYS, GAME_TAGS, GAME_BADGE, GAME_DIFFICULTY, GAME_BAR_COLOR)..."
if git apply --check "$PATCH_FILE" 2>/dev/null; then
  git apply "$PATCH_FILE"
elif patch -p1 --dry-run -s -f < "$PATCH_FILE" >/dev/null 2>&1; then
  patch -p1 < "$PATCH_FILE"
else
  echo "⚠️  Patch didn't apply cleanly — constants/index.ts may not match what this patch expects."
  echo "    Restore from backup with: cp $BACKUP_DIR/constants/index.ts constants/index.ts"
  echo "    then add 'quiztrail' by hand to GAME_KEYS, NEW_GAME_KEYS, GAME_TAGS, GAME_BADGE,"
  echo "    GAME_DIFFICULTY, and GAME_BAR_COLOR in that file."
  exit 1
fi

echo "✅ Done. quiztrail added to GAME_KEYS and friends."
echo ""
echo "Restart the dev server (Ctrl+C, then npm run dev) and check the Hub/Games page."
echo ""
echo "About the covers: GAME_COVERS in constants/index.ts is currently empty ({}) in this"
echo "project, so every game — not just Quiz Trail — renders its icon-pattern placeholder"
echo "instead of a photo cover right now. If covers were showing for you before, that's"
echo "likely a separate, unrelated issue (dev-server cache, a local edit that got reverted,"
echo "etc.) — not something this patch touches. The repo already has move-game-covers.sh"
echo "and populate-game-covers.sh sitting at the root to wire GAME_COVERS up to the files"
echo "in public/assets/covers/, if you want to run those."
