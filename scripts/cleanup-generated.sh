#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"

rm -rf .next
rm -f tsconfig.tsbuildinfo
find . -maxdepth 3 -type d \( -name '.cache' -o -name '.turbo' -o -name '.parcel-cache' \) -prune -exec rm -rf {} +

printf '%s\n' 'Removed generated build and local tool caches. Source files, assets, backups, and node_modules were preserved.'
