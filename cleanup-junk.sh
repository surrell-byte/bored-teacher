#!/usr/bin/env bash
# cleanup-junk.sh
# Safe, low-risk cleanup for bored-teacher-react.
# Only removes files that are clearly junk: CSS backups, a stray debug dump,
# and zip files that shouldn't be committed. Does NOT touch engine/, hooks/,
# providers/, services/, store/, config/, games/templates/, docs/examples/,
# or backup/ — those are left exactly as-is per your call.
#
# Run from the project root:
#   chmod +x cleanup-junk.sh
#   ./cleanup-junk.sh
#
# Add -n / --dry-run to just print what would happen without deleting anything.

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "-n" || "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "== DRY RUN — nothing will actually be deleted =="
fi

remove() {
  local target="$1"
  if [[ -e "$target" ]]; then
    if $DRY_RUN; then
      echo "would remove: $target"
    else
      rm -rf -- "$target"
      echo "removed: $target"
    fi
  fi
}

if [[ ! -f "package.json" ]]; then
  echo "Error: run this from the project root (package.json not found here)." >&2
  exit 1
fi

echo "--- Removing CSS backup files ---"
remove "app/globals.css.bak"
remove "app/globals.css.bak2"
remove "app/globals.css.bak3"

echo "--- Removing stray debug dump ---"
remove "debug-ui.txt"

echo "--- Removing stray zip files sitting in the repo root ---"
# Any top-level zip (e.g. project.zip, bored-teacher-react-review.zip) —
# these were accidental exports, not project source.
find . -maxdepth 1 -name "*.zip" -print0 | while IFS= read -r -d '' f; do
  remove "$f"
done

echo "--- Removing local TypeScript build cache (already gitignored, just clutter on disk) ---"
remove "tsconfig.tsbuildinfo"

echo "--- Updating .gitignore so these don't come back ---"
GITIGNORE=".gitignore"
touch "$GITIGNORE"
add_rule() {
  local rule="$1"
  if ! grep -qxF "$rule" "$GITIGNORE"; then
    if $DRY_RUN; then
      echo "would add to .gitignore: $rule"
    else
      echo "$rule" >> "$GITIGNORE"
      echo "added to .gitignore: $rule"
    fi
  fi
}
add_rule ""
add_rule "# junk cleanup"
add_rule "*.bak"
add_rule "*.bak2"
add_rule "*.bak3"
add_rule "debug-ui.txt"
add_rule "*.zip"

echo ""
echo "Done. Review 'git status' before committing."
