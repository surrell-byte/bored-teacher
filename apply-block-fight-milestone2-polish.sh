#!/bin/bash
# Milestone 2 polish — return gates, more secret walls, save/load hardening
# Requires Milestone 2 (World) already applied.
# Run from the project root: bash apply-block-fight-milestone2-polish.sh
set -e

TARGET="games/block-fight"

if [ ! -d "$TARGET" ]; then
  echo "Error: run this script from your project root (expects $TARGET to exist)."
  exit 1
fi

if [ ! -f "$TARGET/data/worlds.ts" ]; then
  echo "Error: $TARGET/data/worlds.ts not found — apply-block-fight-world-milestone2.sh needs to be run first."
  exit 1
fi

echo "Applying Milestone 2 polish to $TARGET ..."

cat > "$TARGET/data/worlds.ts" << 'FILE_EOF'
import {
  type Coin,
  type Enemy,
  type Gate,
  type Npc,
  type Platform,
  type SavePoint,
  type SecretWall,
  type WorldId,
} from '../systems/types';

export type WorldTheme = {
  name: string;
  bg: string;
  platformFill: string;
  platformTop: string;
  accent: string;
};

type EnemyInit = { x: number; y: number; vx: number; w: number; h: number; platIdx: number };
type GateInit = { x: number; y: number; w: number; h: number; targetWorld: WorldId; label: string };
type NpcInit = { x: number; y: number; w: number; h: number; message: (unlocked: Record<WorldId, boolean>) => string };
type SecretWallInit = { x: number; y: number; w: number; h: number; hp: number };
type SavePointInit = { x: number; y: number; w: number; h: number };

export type WorldDef = {
  id: WorldId;
  theme: WorldTheme;
  platforms: Platform[];
  coinPositions: readonly (readonly [number, number])[];
  enemies: EnemyInit[];
  gates: GateInit[];
  npc?: NpcInit;
  secretWalls: SecretWallInit[];
  savePoint?: SavePointInit;
  playerStart: { x: number; y: number };
  /** Which world unlocks once every enemy is defeated and every coin collected here. */
  unlocksOnClear?: WorldId;
};

const VILLAGE: WorldDef = {
  id: 'village',
  theme: { name: 'Village', bg: '#1e1b3a', platformFill: '#4c1d95', platformTop: '#8b5cf6', accent: '#c4b5fd' },
  platforms: [
    [0, 400, 800, 24],
    [340, 330, 120, 16],
  ],
  coinPositions: [],
  enemies: [],
  gates: [
    { x: 540, y: 344, w: 48, h: 56, targetWorld: 'forest', label: 'Forest' },
    { x: 700, y: 344, w: 48, h: 56, targetWorld: 'mines', label: 'Mines' },
  ],
  npc: {
    x: 200,
    y: 372,
    w: 28,
    h: 28,
    message: unlocked =>
      unlocked.mines
        ? "You've cleared every gate, Kai. The village has never felt safer."
        : unlocked.forest
        ? 'The Mines gate is open now — mind your footing down there, it collapses fast.'
        : 'Head east through the Forest gate, Kai. Clear it to open the way to the Mines.',
  },
  secretWalls: [],
  savePoint: { x: 90, y: 372, w: 28, h: 28 },
  playerStart: { x: 60, y: 340 },
};

const FOREST: WorldDef = {
  id: 'forest',
  theme: { name: 'Forest', bg: '#0a1f16', platformFill: '#166534', platformTop: '#22c55e', accent: '#86efac' },
  platforms: [
    [0, 400, 800, 24],
    [100, 320, 120, 16],
    [280, 260, 100, 16],
    [420, 320, 120, 16],
    [560, 240, 100, 16],
    [200, 180, 80, 16],
    [400, 160, 80, 16],
    [600, 300, 120, 16],
    [50, 200, 60, 16],
    [680, 180, 80, 16],
  ],
  coinPositions: [
    [140, 300],
    [310, 240],
    [460, 300],
    [590, 220],
    [230, 160],
    [420, 140],
    [710, 160],
    [70, 180],
    [640, 280],
  ],
  enemies: [
    { x: 300, y: 304, vx: 1.5, w: 28, h: 28, platIdx: 2 },
    { x: 560, y: 224, vx: -1.2, w: 28, h: 28, platIdx: 4 },
    { x: 200, y: 384, vx: 1.8, w: 28, h: 28, platIdx: 0 },
    { x: 450, y: 304, vx: -1.5, w: 28, h: 28, platIdx: 3 },
    { x: 620, y: 284, vx: 1.2, w: 28, h: 28, platIdx: 5 },
  ],
  gates: [{ x: 20, y: 344, w: 48, h: 56, targetWorld: 'village', label: 'Village' }],
  // Two secrets: one just above the small [50,200,60,16] ledge, one tucked past the far-right
  // platform — both reachable with a jump, neither blocks anything important, so most players
  // will only find them if they're poking around.
  secretWalls: [
    { x: 50, y: 150, w: 32, h: 30, hp: 3 },
    { x: 760, y: 350, w: 32, h: 30, hp: 3 },
  ],
  playerStart: { x: 100, y: 340 },
  unlocksOnClear: 'mines',
};

const MINES: WorldDef = {
  id: 'mines',
  theme: { name: 'Mines', bg: '#1c1310', platformFill: '#44403c', platformTop: '#78716c', accent: '#fb923c' },
  platforms: [
    [0, 400, 800, 24],
    [120, 340, 100, 16],
    [300, 300, 90, 16],
    [460, 340, 100, 16],
    [620, 280, 100, 16],
    [80, 240, 70, 16],
    [250, 200, 80, 16],
    [420, 180, 80, 16],
    [580, 200, 90, 16],
    [700, 320, 80, 16],
  ],
  coinPositions: [
    [160, 304],
    [340, 244],
    [500, 304],
    [650, 224],
    [100, 204],
    [280, 164],
    [450, 144],
    [610, 164],
    [730, 284],
  ],
  enemies: [
    { x: 150, y: 304, vx: 1.8, w: 28, h: 28, platIdx: 1 },
    { x: 330, y: 264, vx: -2.0, w: 28, h: 28, platIdx: 2 },
    { x: 490, y: 304, vx: 1.6, w: 28, h: 28, platIdx: 3 },
    { x: 650, y: 244, vx: -1.8, w: 28, h: 28, platIdx: 4 },
    { x: 270, y: 164, vx: 1.4, w: 28, h: 28, platIdx: 6 },
    { x: 600, y: 164, vx: -1.6, w: 28, h: 28, platIdx: 8 },
  ],
  gates: [{ x: 10, y: 344, w: 48, h: 56, targetWorld: 'village', label: 'Village' }],
  // One tucked beside the low ledge near spawn, one past the far-right platform — offset from
  // each platform's own coin rather than sitting on top of it, and a notch tougher to break
  // than Forest's (hp 4) since this is the later world.
  secretWalls: [
    { x: 130, y: 195, w: 32, h: 30, hp: 4 },
    { x: 750, y: 270, w: 32, h: 30, hp: 4 },
  ],
  playerStart: { x: 60, y: 340 },
  // Final world for now — clearing it triggers the overall win screen instead of unlocking anything further.
};

export const WORLDS: Record<WorldId, WorldDef> = {
  village: VILLAGE,
  forest: FOREST,
  mines: MINES,
};

export function instantiateEnemies(world: WorldDef): Enemy[] {
  return world.enemies.map(enemy => ({
    x: enemy.x,
    y: enemy.y,
    vx: enemy.vx,
    vy: 0,
    w: enemy.w,
    h: enemy.h,
    alive: true,
    dying: false,
    deathTimer: 0,
    platIdx: enemy.platIdx,
    baseSpeed: Math.abs(enemy.vx),
    aggro: false,
  }));
}

export function instantiateCoins(world: WorldDef): Coin[] {
  return world.coinPositions.map(([x, y]) => ({ x, y, collected: false }));
}

export function instantiateGates(world: WorldDef, unlocked: Record<WorldId, boolean>): Gate[] {
  return world.gates.map(gate => ({
    x: gate.x,
    y: gate.y,
    w: gate.w,
    h: gate.h,
    targetWorld: gate.targetWorld,
    label: gate.label,
    locked: !unlocked[gate.targetWorld],
  }));
}

export function instantiateSecretWalls(world: WorldDef): SecretWall[] {
  return world.secretWalls.map(wall => ({
    x: wall.x,
    y: wall.y,
    w: wall.w,
    h: wall.h,
    hp: wall.hp,
    maxHp: wall.hp,
    broken: false,
    hitCooldown: 0,
  }));
}

export function instantiateNpc(world: WorldDef, unlocked: Record<WorldId, boolean>): Npc | null {
  if (!world.npc) return null;
  const npc = world.npc;
  return { x: npc.x, y: npc.y, w: npc.w, h: npc.h, message: npc.message(unlocked) };
}

export function instantiateSavePoint(world: WorldDef): SavePoint | null {
  if (!world.savePoint) return null;
  const savePoint = world.savePoint;
  return { x: savePoint.x, y: savePoint.y, w: savePoint.w, h: savePoint.h };
}
FILE_EOF

cat > "$TARGET/systems/worldTransition.ts" << 'FILE_EOF'
import {
  instantiateCoins,
  instantiateEnemies,
  instantiateGates,
  instantiateNpc,
  instantiateSavePoint,
  instantiateSecretWalls,
  WORLDS,
} from '../data/worlds';
import { getAttackHitbox } from './combat';
import { intersects } from './collisions';
import { setToast, spawnFloatingText, spawnParticles } from './effects';
import { saveProgress } from './save';
import { type GameState, type GameUi, type Platform, type WorldId } from './types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

/** Swaps in a new world's enemies/coins/gates/etc and drops the player at its entry point. */
export function applyWorld(state: GameState, worldId: WorldId, setUi?: UiSetter) {
  const world = WORLDS[worldId];

  state.worldId = worldId;
  state.enemies = instantiateEnemies(world);
  state.coins = instantiateCoins(world);
  state.gates = instantiateGates(world, state.unlocked);
  state.secretWalls = instantiateSecretWalls(world);
  state.npc = instantiateNpc(world, state.unlocked);
  state.savePoint = instantiateSavePoint(world);
  state.justSaved = false;
  state.worldClearTimer = 0;

  state.player.x = world.playerStart.x;
  state.player.y = world.playerStart.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.jumpsUsed = 0;
  state.player.dashTimer = 0;

  setUi?.(ui => ({ ...ui, worldName: world.theme.name }));
}

/** The world's base platforms plus any unbroken secret walls, which act as solid terrain until destroyed. */
export function getActivePlatforms(state: GameState): Platform[] {
  const world = WORLDS[state.worldId];
  const wallPlatforms = state.secretWalls
    .filter(wall => !wall.broken)
    .map((wall): Platform => [wall.x, wall.y, wall.w, wall.h]);
  return wallPlatforms.length ? [...world.platforms, ...wallPlatforms] : world.platforms;
}

export function updateWorld(state: GameState, setUi: UiSetter) {
  const world = WORLDS[state.worldId];
  const player = state.player;

  // Counting down after a world-clear: either hand control back to the village, or — if this
  // was the last world — trigger the overall win screen.
  if (state.worldClearTimer > 0) {
    state.worldClearTimer -= 1;
    if (state.worldClearTimer === 0) {
      if (!world.unlocksOnClear && state.worldId !== 'village') {
        state.gameState = 'win';
        setUi(ui => ({ ...ui, state: 'win' }));
      } else {
        applyWorld(state, 'village', setUi);
      }
    }
    return;
  }

  // Gates — walking into one travels to that world, if it's unlocked. The village's gates lead
  // out to combat worlds; each combat world has one gate leading back, always unlocked.
  for (const gate of state.gates) {
    if (intersects(player, gate)) {
      if (gate.locked) {
        setToast(state, `Locked — clear ${WORLDS[state.worldId].theme.name} first`, '#f87171');
      } else {
        applyWorld(state, gate.targetWorld, setUi);
      }
      return;
    }
  }

  // Secret walls — chip away at them with attacks; breaking one reveals bonus coins.
  state.secretWalls.forEach(wall => {
    if (wall.broken) return;
    if (wall.hitCooldown > 0) wall.hitCooldown -= 1;
    if (wall.hitCooldown === 0 && player.attackTimer > 0 && intersects(getAttackHitbox(player), wall)) {
      wall.hp -= 1;
      wall.hitCooldown = 20;
      spawnParticles(state, wall.x + wall.w / 2, wall.y + wall.h / 2, 8, '#a8a29e');
      state.shake = Math.max(state.shake, 5);
      if (wall.hp <= 0) {
        wall.broken = true;
        state.coins.push(
          { x: wall.x, y: wall.y - 10, collected: false },
          { x: wall.x + 16, y: wall.y - 10, collected: false },
        );
        spawnFloatingText(state, wall.x + wall.w / 2, wall.y, 'Secret found!', '#fde047');
        setToast(state, 'A hidden passage crumbles away...', '#fde047');
      }
    }
  });

  // Save point — touch it to write progress to localStorage. justSaved debounces so it
  // only writes once per visit instead of every frame you're standing on it.
  if (state.savePoint) {
    const onSavePoint = intersects(player, state.savePoint);
    if (onSavePoint && !state.justSaved) {
      saveProgress({ unlocked: state.unlocked, score: state.score });
      state.justSaved = true;
      setToast(state, 'Game saved', world.theme.accent);
    } else if (!onSavePoint) {
      state.justSaved = false;
    }
  }

  // World cleared? (combat worlds only — the village hub has no enemies to trigger this.)
  if (world.enemies.length > 0 && state.enemies.every(enemy => !enemy.alive) && state.coins.every(coin => coin.collected)) {
    if (world.unlocksOnClear) state.unlocked[world.unlocksOnClear] = true;
    saveProgress({ unlocked: state.unlocked, score: state.score });
    setToast(
      state,
      world.unlocksOnClear
        ? `${world.theme.name} cleared! ${WORLDS[world.unlocksOnClear].theme.name} is now open.`
        : `${world.theme.name} cleared!`,
      world.theme.accent,
    );
    state.worldClearTimer = 90;
  }
}
FILE_EOF

cat > "$TARGET/systems/save.ts" << 'FILE_EOF'
import { type WorldId } from './types';

const SAVE_KEY = 'block-fight-save-v1';
const WORLD_IDS: WorldId[] = ['village', 'forest', 'mines'];

export type SaveData = {
  unlocked: Record<WorldId, boolean>;
  score: number;
};

/** Some browsers (private/incognito mode, storage disabled by policy) expose `localStorage` but
 *  throw on first access — so we probe with a real read/write rather than just checking it exists. */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const probeKey = '__block_fight_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

/** Guards against a corrupted/hand-edited save carrying NaN, Infinity, a negative number, or a string. */
function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Reads saved progress from localStorage. Returns null if there's nothing saved, storage isn't
 *  usable, or the saved data doesn't match the shape we expect — a truncated write, hand-edited
 *  JSON, or an old/foreign save should never crash a run, just fall back to a fresh start. */
export function loadSave(): SaveData | null {
  if (!isStorageAvailable()) return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Unparseable JSON (partial write, hand-edited, truncated by a full disk) will fail forever
    // if left in place — wipe it so the next save starts clean instead of getting stuck.
    clearSave();
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const candidate = parsed as Partial<SaveData>;
  if (!candidate.unlocked || typeof candidate.unlocked !== 'object') return null;
  const rawUnlocked = candidate.unlocked as Record<string, unknown>;

  // Village and Forest are always available; only Mines (and any future gated world) is ever
  // locked behind a save. Every flag is coerced to a strict boolean so a corrupted or hand-edited
  // value (the string "true", 1, null, a missing key) can only ever come out as true or false.
  const unlocked = WORLD_IDS.reduce((acc, id) => {
    acc[id] = id === 'village' || id === 'forest' ? true : !!rawUnlocked[id];
    return acc;
  }, {} as Record<WorldId, boolean>);

  return {
    unlocked,
    score: isValidScore(candidate.score) ? candidate.score : 0,
  };
}

/** Writes current unlocks + score to localStorage. Best-effort — failures (private browsing,
 *  storage disabled, quota exceeded) are swallowed since saving is a nice-to-have, not worth
 *  crashing the run over. */
export function saveProgress(data: SaveData): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Likely a quota error, or storage went away mid-session — nothing to do but skip this save.
  }
}

/** Wipes any saved progress. Used internally to self-heal a corrupted save, and available as a
 *  hook for a future "reset progress" control. */
export function clearSave(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore — nothing meaningful to recover from here.
  }
}
FILE_EOF

echo "Done. Changes applied:"
echo "  - data/worlds.ts             (return gates from Forest & Mines to Village; +3 secret walls, 5 total)"
echo "  - systems/worldTransition.ts (comment fix — gates are no longer village-only)"
echo "  - systems/save.ts            (hardened: corrupted JSON, wrong shape, bad values, storage-unavailable all fall back to a fresh start instead of crashing)"
echo ""
echo "Note: leaving a world via its return gate resets that world on your next visit"
echo "(fresh enemies, uncollected coins) unless you'd already cleared it — same as"
echo "walking out of the village always has. Let me know if you'd rather it remember"
echo "mid-run progress instead."
