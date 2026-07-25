#!/usr/bin/env bash
# Applies the Quiz Trail integration:
#   - adds games/quiz-trail (new React game, converted from quiz.html)
#   - registers it in constants/games.ts, constants/index.ts,
#     and app/games/[game]/page.tsx
#
# Usage: put both files below in the project root (next to package.json), then:
#   chmod +x apply-quiz-trail.sh
#   ./apply-quiz-trail.sh

set -euo pipefail

NEW_FILES_ZIP="quiz-trail-new-files.zip"
PATCH_FILE="quiz-trail-integration.patch"

if [ ! -f "$NEW_FILES_ZIP" ]; then
  echo "❌ $NEW_FILES_ZIP not found. Put it in the project root and re-run."
  exit 1
fi
if [ ! -f "$PATCH_FILE" ]; then
  echo "❌ $PATCH_FILE not found. Put it in the project root and re-run."
  exit 1
fi
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found — run this script from the bored-teacher-react project root."
  exit 1
fi

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/quiz-trail-$STAMP"

echo "📦 Backing up files this patch touches to $BACKUP_DIR"
mkdir -p "$BACKUP_DIR/constants" "$BACKUP_DIR/app/games/[game]"
cp constants/games.ts "$BACKUP_DIR/constants/games.ts"
cp constants/index.ts "$BACKUP_DIR/constants/index.ts"
cp "app/games/[game]/page.tsx" "$BACKUP_DIR/app/games/[game]/page.tsx"
if [ -d "games/quiz-trail" ]; then
  cp -R "games/quiz-trail" "$BACKUP_DIR/quiz-trail-existing"
fi

echo "🧩 Adding games/quiz-trail..."
unzip -oq "$NEW_FILES_ZIP" -d .

echo "🔧 Patching constants/games.ts, constants/index.ts, app/games/[game]/page.tsx..."
if git apply --check "$PATCH_FILE" 2>/dev/null; then
  git apply "$PATCH_FILE"
elif patch -p1 --dry-run -s -f < "$PATCH_FILE" >/dev/null 2>&1; then
  patch -p1 < "$PATCH_FILE"
else
  echo "⚠️  Patch didn't apply cleanly (files may have changed since this patch was made)."
  echo "    Restore from backup with:"
  echo "      cp $BACKUP_DIR/constants/games.ts constants/games.ts"
  echo "      cp $BACKUP_DIR/constants/index.ts constants/index.ts"
  echo "      cp \"$BACKUP_DIR/app/games/[game]/page.tsx\" \"app/games/[game]/page.tsx\""
  echo "    then apply the 3 one-line additions from $PATCH_FILE by hand."
  exit 1
fi

echo "✅ Done. Files added/changed:"
echo "  games/quiz-trail/QuizTrail.jsx"
echo "  games/quiz-trail/data.js"
echo "  games/quiz-trail/config.ts"
echo "  games/quiz-trail/index.ts"
echo "  constants/games.ts"
echo "  constants/index.ts"
echo "  app/games/[game]/page.tsx"
echo ""
echo "Run 'npm run dev' and open /games/quiztrail (or find 'Quiz Trail' on the Hub) to test."
echo "If anything looks wrong, restore with:"
echo "  cp $BACKUP_DIR/constants/games.ts constants/games.ts"
echo "  cp $BACKUP_DIR/constants/index.ts constants/index.ts"
echo "  cp \"$BACKUP_DIR/app/games/[game]/page.tsx\" \"app/games/[game]/page.tsx\""
echo "  rm -rf games/quiz-trail"
