#!/usr/bin/env bash
# Fix duplicate object keys in games/flagmaster/Flagmaster.jsx
#
# Bug: popularityCodes defines CU and SS twice each. In a JS object
# literal the later value silently wins, so:
#   CU:7 (line 30) is shadowed by CU:4 (line 40)  -> Cuba drops a full tier
#   SS:5 (line 37) is shadowed by SS:2 (line 45)  -> harmless but sloppy
#
# This removes the dead second occurrence of each, keeping the
# intended values (CU:7, SS:5).
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x fix-flagmaster-duplicate-keys.sh
#   ./fix-flagmaster-duplicate-keys.sh

set -euo pipefail

FILE="games/flagmaster/Flagmaster.jsx"

if [ ! -f "$FILE" ]; then
  echo "Error: $FILE not found. Run this script from the repo root." >&2
  exit 1
fi

cp "$FILE" "$FILE.bak"

# Remove the dead duplicate entries (perl -pi -e works identically on
# macOS and Linux, unlike sed -i which needs different flags per platform).
perl -pi -e 's/DO:4,CU:4,/DO:4,/' "$FILE"
perl -pi -e 's/LS:3,SS:2,AX:1,/LS:3,AX:1,/' "$FILE"

# Verify: each code should now appear exactly once, and the file should
# still contain CU:7 and SS:5 from the first (correct) definitions.
echo "Checking for remaining duplicates..."
node -e "
const fs = require('fs');
const src = fs.readFileSync('$FILE','utf8');
const body = src.match(/const popularityCodes = \{([\s\S]*?)\};/)[1];
const entries = [...body.matchAll(/([A-Z]{2}):(\d+)/g)];
const seen = {};
for (const [,code,val] of entries) (seen[code] ??= []).push(val);
const dupes = Object.entries(seen).filter(([,v]) => v.length > 1);
if (dupes.length) {
  console.error('Still duplicated:', dupes);
  process.exit(1);
}
console.log('OK: ' + entries.length + ' entries, all unique.');
console.log('CU =', seen.CU[0], '| SS =', seen.SS[0]);
"

echo "Done. Backup saved as $FILE.bak"
echo "Diff:"
diff "$FILE.bak" "$FILE" || true
