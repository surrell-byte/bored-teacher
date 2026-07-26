#!/usr/bin/env bash
# apply-catalog-refactor.sh
#
# Applies the game-catalog consolidation to your project.
#
# USAGE:
#   1. Put this script in the SAME folder as the 5 downloaded files:
#        catalog.data.ts  catalog.components.tsx  constants-index.ts
#        page.tsx         check-games.js
#   2. Run it, pointing at your project root:
#        bash apply-catalog-refactor.sh /path/to/bored-teacher-react
#      (or just `bash apply-catalog-refactor.sh` from inside the project root)

set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${1:-$(pwd)}"

echo "Source files:   $SRC_DIR"
echo "Project root:   $PROJECT_ROOT"
echo

# ---- sanity checks ----
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo "❌ No package.json found at $PROJECT_ROOT — pass your project root as the first argument:"
  echo "   bash apply-catalog-refactor.sh /path/to/bored-teacher-react"
  exit 1
fi

for f in catalog.data.ts catalog.components.tsx constants-index.ts page.tsx check-games.js; do
  if [ ! -f "$SRC_DIR/$f" ]; then
    echo "❌ Missing $f next to this script. Make sure all 5 downloaded files are in the same folder."
    exit 1
  fi
done

cd "$PROJECT_ROOT"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="backup/catalog-refactor-$STAMP"
mkdir -p "$BACKUP_DIR" "games" "scripts"

echo "Backing up existing files to $BACKUP_DIR ..."
[ -f "constants/index.ts" ]              && cp "constants/index.ts" "$BACKUP_DIR/constants-index.ts.bak"
[ -f "app/games/[game]/page.tsx" ]       && cp "app/games/[game]/page.tsx" "$BACKUP_DIR/page.tsx.bak"
[ -f "games/catalog.data.ts" ]           && cp "games/catalog.data.ts" "$BACKUP_DIR/catalog.data.ts.bak"
[ -f "games/catalog.components.tsx" ]    && cp "games/catalog.components.tsx" "$BACKUP_DIR/catalog.components.tsx.bak"
[ -f "scripts/check-games.js" ]          && cp "scripts/check-games.js" "$BACKUP_DIR/check-games.js.bak"

echo "Copying new files into place ..."
cp "$SRC_DIR/catalog.data.ts"          "games/catalog.data.ts"
cp "$SRC_DIR/catalog.components.tsx"   "games/catalog.components.tsx"
cp "$SRC_DIR/constants-index.ts"       "constants/index.ts"
cp "$SRC_DIR/page.tsx"                 "app/games/[game]/page.tsx"
cp "$SRC_DIR/check-games.js"           "scripts/check-games.js"

echo "Patching package.json scripts (adds check-games, wires it into build) ..."
node -e '
const fs = require("fs");
const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["check-games"] = "node scripts/check-games.js";
if (pkg.scripts.build && !pkg.scripts.build.includes("check-games")) {
  pkg.scripts.build = "npm run check-games && " + pkg.scripts.build;
}
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
'

echo
echo "Running the drift checker ..."
node scripts/check-games.js

echo
echo "✅ Done. Backups of the old files are in $BACKUP_DIR"
echo "   Review the diff, then commit."
