#!/bin/bash
# Run this from your repo root.
set -e

SRC="public/assets/covers/_needs-review"
DST="public/assets/covers"

mv "$SRC/monkey-tree-climb-cover.webp" "$DST/monkey-tree-climb-cover.webp"
echo "moved monkey-tree-climb-cover.webp -> $DST"

mv "$SRC/red-or--black-cover.webp" "$DST/red-or-black-cover.webp"
echo "moved red-or--black-cover.webp -> $DST/red-or-black-cover.webp (typo fixed)"

echo "shark-survival-cover.webp left in $SRC (no matching game yet)"
