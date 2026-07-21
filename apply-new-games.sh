#!/usr/bin/env bash
# apply-new-games.sh
# Adds 4 new legacy HTML games to the bored-teacher-react project:
#   - What Am I?      -> id: whatami       -> assets/legacy-games/what-am-i/index.html
#   - What's Missing?  -> id: whatsmissing  -> assets/legacy-games/whats-missing/index.html
#   - Tile Battle       -> id: tilebattle   -> assets/legacy-games/tile-battle/index.html
#   - Tic-Tac-Roll Premium -> id: tictacroll -> assets/legacy-games/tictacroll/index.html
#
# USAGE (run from the project ROOT, i.e. the folder containing package.json):
#   1. Put new-games-staging.zip in the project root (or pass its path as $1)
#   2. chmod +x apply-new-games.sh
#   3. ./apply-new-games.sh [path/to/new-games-staging.zip]

set -euo pipefail

ZIP_PATH="${1:-new-games-staging.zip}"
GAMES_TS="constants/games.ts"
COVERS_TS="constants/index.ts"
LEGACY_DIR="public/assets/legacy-games"

# --- sanity checks -----------------------------------------------------
if [ ! -f "package.json" ]; then
  echo "ERROR: run this script from the project root (no package.json found here)." >&2
  exit 1
fi

if [ ! -f "$ZIP_PATH" ]; then
  echo "ERROR: staging zip not found at '$ZIP_PATH'." >&2
  echo "       Download new-games-staging.zip from the chat and place it in the project root," >&2
  echo "       or pass its path: ./apply-new-games.sh /path/to/new-games-staging.zip" >&2
  exit 1
fi

if [ ! -f "$GAMES_TS" ]; then
  echo "ERROR: $GAMES_TS not found. Are you in the right project?" >&2
  exit 1
fi

echo "==> Backing up constants/games.ts and constants/index.ts"
cp "$GAMES_TS" "${GAMES_TS}.bak.$(date +%Y%m%d%H%M%S)"
cp "$COVERS_TS" "${COVERS_TS}.bak.$(date +%Y%m%d%H%M%S)"

echo "==> Extracting staged game files into $LEGACY_DIR"
mkdir -p "$LEGACY_DIR"
TMP_EXTRACT="$(mktemp -d)"
unzip -q "$ZIP_PATH" -d "$TMP_EXTRACT"

for slug in what-am-i whats-missing tile-battle tictacroll; do
  SRC="$TMP_EXTRACT/new-games-staging/$slug/index.html"
  DEST_DIR="$LEGACY_DIR/$slug"
  if [ ! -f "$SRC" ]; then
    echo "ERROR: expected $SRC in the zip but it was not found." >&2
    exit 1
  fi
  mkdir -p "$DEST_DIR"
  cp "$SRC" "$DEST_DIR/index.html"
  echo "    - copied $slug/index.html"
done

rm -rf "$TMP_EXTRACT"

echo "==> Registering games in $GAMES_TS"

python3 - "$GAMES_TS" <<'PYEOF'
import re, sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

new_entries = [
    "  { id: 'whatami', name: 'Field Guide: What Am I?', icon: '🔎', description: 'Study the clues and identify the mystery creature or object before you run out of guesses.', tag: { label: 'Vocabulary', color: 'tag-vocab' }, badge: 'Guess It', difficulty: 'Puzzle', barColor: 'var(--green)', url: 'assets/legacy-games/what-am-i/index.html', isNew: true },",
    "  { id: 'whatsmissing', name: \"What's Missing?\", icon: '🧐', description: 'Study the picture, then spot what disappeared to sharpen memory and observation skills.', tag: { label: 'Logic', color: 'tag-bio' }, badge: 'Spot It', difficulty: 'Puzzle', barColor: 'var(--blue)', url: 'assets/legacy-games/whats-missing/index.html', isNew: true },",
    "  { id: 'tilebattle', name: 'Tile Battle', icon: '🀄', description: 'Face off over a grid of tiles in a fast, competitive matching showdown.', tag: { label: 'Logic', color: 'tag-bio' }, badge: 'Battle', difficulty: 'Competitive', barColor: 'var(--red)', url: 'assets/legacy-games/tile-battle/index.html', isNew: true },",
    "  { id: 'tictacroll', name: 'Tic·Tac·Roll — Premium Edition', icon: '🎲', description: 'A polished twist on tic-tac-toe with dice rolls raising the stakes each turn.', tag: { label: 'Logic', color: 'tag-bio' }, badge: 'Strategy', difficulty: 'Competitive', barColor: 'var(--purple)', url: 'assets/legacy-games/tictacroll/index.html', isNew: true },",
]

# Skip any entries whose id already exists (idempotent re-runs)
existing_ids = set(re.findall(r"id:\s*'([^']+)'", content))
to_add = []
for entry in new_entries:
    m = re.search(r"id:\s*'([^']+)'", entry)
    gid = m.group(1)
    if gid in existing_ids:
        print(f"    - skipping '{gid}' (already present)")
    else:
        to_add.append(entry)

if not to_add:
    print("    - nothing to add, all games already registered")
else:
    marker = "];"
    idx = content.rfind(marker)
    if idx == -1:
        print("ERROR: could not find closing '];' of GAMES array", file=sys.stderr)
        sys.exit(1)
    insertion = "\n".join(to_add) + "\n"
    content = content[:idx] + insertion + content[idx:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    for entry in to_add:
        gid = re.search(r"id:\s*'([^']+)'", entry).group(1)
        print(f"    - added '{gid}'")
PYEOF

echo "==> Done."
echo ""
echo "New games added (using placeholder icons, no cover images):"
echo "  - What Am I?            -> /games/whatami"
echo "  - What's Missing?       -> /games/whatsmissing"
echo "  - Tile Battle           -> /games/tilebattle"
echo "  - Tic-Tac-Roll Premium  -> /games/tictacroll"
echo ""
echo "Next steps:"
echo "  1. Review the diff:  git diff constants/games.ts"
echo "  2. (Optional) add cover art .webp files to public/assets/covers/"
echo "     and register them in GAME_COVERS in constants/index.ts"
echo "  3. Run the dev server and check /games to confirm the new cards render:"
echo "     npm run dev"
echo "  4. Commit:  git add -A && git commit -m 'Add 4 new legacy games'"
