#!/bin/bash
# Flags legacy games with root-absolute asset paths baked into their bundles.
# Root-absolute paths (leading /) break once a game is nested under
# /assets/legacy-games/<game>/ instead of served from site root.
found=0
for f in public/assets/legacy-games/*/assets/*.js public/assets/legacy-games/*/*.js; do
  [ -f "$f" ] || continue
  matches=$(grep -oE '"/[a-zA-Z0-9_./-]*\.(webp|png|jpg|jpeg|svg|mp3|wav|json)"' "$f" 2>/dev/null)
  if [ -n "$matches" ]; then
    echo "=== $f ==="
    echo "$matches"
    found=1
  fi
done
if [ "$found" -eq 1 ]; then
  echo ""
  echo "⚠️  Root-absolute asset paths found above — these will 404 once nested under legacy-games/<game>/."
  exit 1
else
  echo "✓ No root-absolute asset paths found in legacy games."
fi
