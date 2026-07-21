#!/usr/bin/env bash
# Applies the Block Fight "core combat feel" patch:
# hit stop, knockback, screen shake, damage numbers, hit sparks.
#
# Usage: run from the project root, with the zip in the same directory
#   ./apply-block-fight-combat-feel.sh

set -euo pipefail

ZIP="block-fight-combat-feel.zip"
TARGET_DIR="games/block-fight"

if [ ! -f "$ZIP" ]; then
  echo "❌ $ZIP not found. Put it in the project root (next to package.json) and re-run."
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR not found — run this script from the bored-teacher-react project root."
  exit 1
fi

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/block-fight-$STAMP"

echo "📦 Backing up $TARGET_DIR to $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -R "$TARGET_DIR" "$BACKUP_DIR"

echo "🧩 Applying combat-feel patch..."
unzip -oq "$ZIP" -d .

echo "✅ Files updated:"
unzip -Z1 "$ZIP" | sed 's/^/  /'

echo ""
echo "Run 'npm run dev' and open Block Fight to test."
echo "If anything looks wrong, restore with: cp -R $BACKUP_DIR/block-fight games/"
