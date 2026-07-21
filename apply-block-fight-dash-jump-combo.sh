#!/usr/bin/env bash
# Applies the Block Fight dash / double jump / kill-combo patch.
# Requires the combat-feel patch to already be applied (this one builds on it).
#
# Usage: run from the project root, with the zip in the same directory
#   ./apply-block-fight-dash-jump-combo.sh

set -euo pipefail

ZIP="block-fight-dash-jump-combo.zip"
TARGET_DIR="games/block-fight"

if [ ! -f "$ZIP" ]; then
  echo "❌ $ZIP not found. Put it in the project root (next to package.json) and re-run."
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR not found — run this script from the bored-teacher-react project root."
  exit 1
fi

if ! grep -q "hitStop" "$TARGET_DIR/systems/types.ts" 2>/dev/null; then
  echo "⚠️  $TARGET_DIR doesn't look like it has the combat-feel patch applied yet."
  echo "    Run apply-block-fight-combat-feel.sh first, then this script."
  exit 1
fi

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/block-fight-$STAMP"

echo "📦 Backing up $TARGET_DIR to $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -R "$TARGET_DIR" "$BACKUP_DIR"

echo "🧩 Applying dash / double-jump / combo patch..."
unzip -oq "$ZIP" -d .

echo "✅ Files updated:"
unzip -Z1 "$ZIP" | sed 's/^/  /'

echo ""
echo "New controls: C to dash, Space/↑ again mid-air for a double jump."
echo "Run 'npm run dev' and open Block Fight to test."
echo "If anything looks wrong, restore with: cp -R $BACKUP_DIR/block-fight games/"
