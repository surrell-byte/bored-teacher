#!/usr/bin/env bash
# apply-phase2-patch.sh
# Applies the Phase 2 retrofit: shared useStorage hook + shared beep/tone
# utility, wired into the 10 games that used raw localStorage and the
# 2 games that hand-rolled Web Audio oscillators. No other games touched.
#
# Run from the project root:
#   ./apply-phase2-patch.sh phase2-retrofit-storage-and-audio.patch

set -euo pipefail

PATCH_FILE="${1:-phase2-retrofit-storage-and-audio.patch}"

if [[ ! -f "package.json" ]]; then
  echo "Error: run this from the project root (package.json not found here)." >&2
  exit 1
fi

if [[ ! -f "$PATCH_FILE" ]]; then
  echo "Error: patch file '$PATCH_FILE' not found." >&2
  echo "Put it in the project root or pass its path as an argument." >&2
  exit 1
fi

echo "--- Dry run (checking the patch applies cleanly) ---"
patch -p1 --dry-run < "$PATCH_FILE"

echo ""
echo "--- Applying ---"
patch -p1 < "$PATCH_FILE"

echo ""
echo "Done. Review with 'git diff', then run your build/typecheck:"
echo "  npm run build"
