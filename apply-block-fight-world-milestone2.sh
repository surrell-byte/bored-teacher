#!/bin/bash
# Milestone 2 (World) — Village hub, Forest, Mines, gates, NPC, secret wall, save point
# Run from the project root: bash apply-block-fight-world-milestone2.sh
set -e

TARGET="games/block-fight"

if [ ! -d "$TARGET" ]; then
  echo "Error: run this script from your project root (expects $TARGET to exist)."
  exit 1
fi

echo "Applying Milestone 2 (World) to $TARGET ..."

mkdir -p "$TARGET/systems" "$TARGET/hooks" "$TARGET/data" "$TARGET/components"

cat > "$TARGET/systems/types.ts" << 'FILE_EOF'
export type GameStatus = 'playing' | 'dead' | 'win';

export type WorldId = 'village' | 'forest' | 'mines';

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Platform = readonly [x: number, y: number, w: number, h: number];

export type Player = Rect & {
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  attackTimer: number;
  hp: number;
  invincible: number;
  jumpsUsed: number;
  dashTimer: number;
  dashCooldown: number;
};

export type Enemy = Rect & {
  vx: number;
  vy: number;
  alive: boolean;
  dying: boolean;
  deathTimer: number;
  platIdx: number;
  /** Base patrol speed (magnitude) — preserved separately from vx so chase can override direction/speed freely. */
  baseSpeed: number;
  /** True once the enemy has noticed the player and is actively chasing. */
  aggro: boolean;
};

export type Coin = {
  x: number;
  y: number;
  collected: boolean;
};

/** A travel point between worlds — walk into it to switch, if unlocked. */
export type Gate = Rect & {
  targetWorld: WorldId;
  label: string;
  locked: boolean;
};

/** A breakable wall hiding a reward — chip it down with attacks. */
export type SecretWall = Rect & {
  hp: number;
  maxHp: number;
  broken: boolean;
  hitCooldown: number;
};

/** A stationary hub character with a message that reflects current progress. */
export type Npc = Rect & {
  message: string;
};

export type SavePoint = Rect;

/** A short banner message (world cleared, secret found, game saved, gate locked...). */
export type Toast = {
  text: string;
  life: number;
  maxLife: number;
  color: string;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export type FloatingText = {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
  /** Crit labels render bigger, bolder, and with a glow. */
  crit?: boolean;
};

export type GameState = {
  player: Player;
  worldId: WorldId;
  unlocked: Record<WorldId, boolean>;
  enemies: Enemy[];
  coins: Coin[];
  gates: Gate[];
  secretWalls: SecretWall[];
  npc: Npc | null;
  savePoint: SavePoint | null;
  /** True while the player is standing on the save point, so we save once per visit, not every frame. */
  justSaved: boolean;
  toast: Toast | null;
  /** Frames left before a cleared combat world hands control back to the village (or triggers the win screen). */
  worldClearTimer: number;
  score: number;
  shake: number;
  hitStop: number;
  /** Frames remaining of post-hitstop slow motion (crit only) — simulation runs at half rate while this is active. */
  slowMo: number;
  /** Screen-flash overlay strength, 0..1, decays each frame — crit only. */
  flashAlpha: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  coyoteTime: number;
  jumpBuffer: number;
  dashBuffer: number;
  comboCount: number;
  comboTimer: number;
  gameState: GameStatus;
};

export type GameUi = {
  score: number;
  hp: number;
  state: GameStatus;
  worldName: string;
};

export type ControlsState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  dash: boolean;
};
FILE_EOF

cat > "$TARGET/systems/combat.ts" << 'FILE_EOF'
import { type GameState, type Rect } from './types';

/** The player's active attack hitbox — a box extending in front of them while attackTimer is running. */
export function getAttackHitbox(player: GameState['player']): Rect {
  return {
    x: player.x + (player.facing > 0 ? player.w : -24),
    y: player.y + 4,
    w: 24,
    h: player.h - 8,
  };
}
FILE_EOF

cat > "$TARGET/systems/save.ts" << 'FILE_EOF'
import { type WorldId } from './types';

const SAVE_KEY = 'block-fight-save-v1';

export type SaveData = {
  unlocked: Record<WorldId, boolean>;
  score: number;
};

/** Reads saved progress from localStorage. Returns null if there's nothing saved, or storage isn't usable. */
export function loadSave(): SaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData> | null;
    if (!parsed || !parsed.unlocked) return null;
    return {
      // Village and Forest are always available; only Mines is ever gated behind a save.
      unlocked: { village: true, forest: true, mines: !!parsed.unlocked.mines },
      score: typeof parsed.score === 'number' ? parsed.score : 0,
    };
  } catch {
    return null;
  }
}

/** Writes current unlocks + score to localStorage. Best-effort — failures (private browsing, quota) are ignored. */
export function saveProgress(data: SaveData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Saving is a nice-to-have, not worth crashing the run over.
  }
}
FILE_EOF

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
  gates: [],
  // Sits just above platform 8 (the small [50,200,60,16] ledge) — reachable with a jump, blocks nothing
  // important, so most players will only find it if they're poking around.
  secretWalls: [{ x: 50, y: 150, w: 32, h: 30, hp: 3 }],
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
  gates: [],
  secretWalls: [],
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

  // Gates (village only) — walking into one travels to that world, if it's unlocked.
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

cat > "$TARGET/systems/spawning.ts" << 'FILE_EOF'
import { PLAYER_MAX_HP, PLAYER_START } from './constants';
import { type GameState, type GameUi, type WorldId } from './types';
import {
  instantiateCoins,
  instantiateEnemies,
  instantiateGates,
  instantiateNpc,
  instantiateSavePoint,
  instantiateSecretWalls,
  WORLDS,
} from '../data/worlds';
import { loadSave } from './save';

const DEFAULT_UNLOCKED: Record<WorldId, boolean> = { village: true, forest: true, mines: false };
const START_WORLD: WorldId = 'village';

export function createInitialState(): GameState {
  const save = loadSave();
  const unlocked = save?.unlocked ?? { ...DEFAULT_UNLOCKED };
  const world = WORLDS[START_WORLD];

  return {
    player: {
      x: world.playerStart.x,
      y: world.playerStart.y,
      w: PLAYER_START.w,
      h: PLAYER_START.h,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      attackTimer: 0,
      hp: PLAYER_MAX_HP,
      invincible: 0,
      jumpsUsed: 0,
      dashTimer: 0,
      dashCooldown: 0,
    },
    worldId: START_WORLD,
    unlocked,
    enemies: instantiateEnemies(world),
    coins: instantiateCoins(world),
    gates: instantiateGates(world, unlocked),
    secretWalls: instantiateSecretWalls(world),
    npc: instantiateNpc(world, unlocked),
    savePoint: instantiateSavePoint(world),
    justSaved: false,
    toast: null,
    worldClearTimer: 0,
    score: save?.score ?? 0,
    shake: 0,
    hitStop: 0,
    slowMo: 0,
    flashAlpha: 0,
    particles: [],
    floatingTexts: [],
    coyoteTime: 0,
    jumpBuffer: 0,
    dashBuffer: 0,
    comboCount: 0,
    comboTimer: 0,
    gameState: 'playing',
  };
}

export function createInitialUi(): GameUi {
  const save = loadSave();
  return { score: save?.score ?? 0, hp: PLAYER_MAX_HP, state: 'playing', worldName: WORLDS[START_WORLD].theme.name };
}
FILE_EOF

cat > "$TARGET/systems/effects.ts" << 'FILE_EOF'
import { CRIT_FLASH_DECAY } from './constants';
import { type GameState } from './types';

/** Bursts a ring of small particles outward from a point — used for hit sparks. */
export function spawnParticles(state: GameState, x: number, y: number, count: number, color: string) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = 2 + Math.random() * 3.5;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 18 + Math.random() * 6,
      maxLife: 24,
      color,
      size: 2 + Math.random() * 2,
    });
  }
}

/** Spawns a floating combat-text label (e.g. "+50", "-1") that drifts up and fades. */
export function spawnFloatingText(state: GameState, x: number, y: number, text: string, color: string, crit = false) {
  state.floatingTexts.push({
    x,
    y,
    vy: crit ? -1.9 : -1.4,
    life: crit ? 52 : 40,
    maxLife: crit ? 52 : 40,
    text,
    color,
    crit,
  });
}

/** Sets (or replaces) the current banner message — world cleared, secret found, saved, locked gate, etc. */
export function setToast(state: GameState, text: string, color: string) {
  state.toast = { text, life: 150, maxLife: 150, color };
}

/** Advances all active particles and floating texts by one simulation frame. */
export function updateEffects(state: GameState) {
  state.particles = state.particles.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.25;
    particle.vx *= 0.94;
    particle.life -= 1;
    return particle.life > 0;
  });

  state.floatingTexts = state.floatingTexts.filter(text => {
    text.y += text.vy;
    text.vy *= 0.96;
    text.life -= 1;
    return text.life > 0;
  });

  if (state.flashAlpha > 0) {
    state.flashAlpha = Math.max(0, state.flashAlpha - CRIT_FLASH_DECAY);
  }

  if (state.toast) {
    state.toast.life -= 1;
    if (state.toast.life <= 0) state.toast = null;
  }
}
FILE_EOF

cat > "$TARGET/systems/rendering.ts" << 'FILE_EOF'
import { WORLDS, type WorldTheme } from '../data/worlds';
import {
  type Coin,
  type Enemy,
  type FloatingText,
  type Gate,
  type GameState,
  type Npc,
  type Particle,
  type Platform,
  type Player,
  type SavePoint,
  type SecretWall,
} from './types';

function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[], theme: WorldTheme) {
  platforms.forEach(([px, py, pw, ph]) => {
    ctx.fillStyle = theme.platformFill;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = theme.platformTop;
    ctx.fillRect(px, py, pw, 4);
  });
}

function drawSecretWalls(ctx: CanvasRenderingContext2D, walls: SecretWall[]) {
  walls.forEach(wall => {
    if (wall.broken) return;
    // Cracked stone look, with visible cracks widening as it takes damage.
    ctx.fillStyle = '#57534e';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    const damage = 1 - wall.hp / wall.maxHp;
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w * 0.3, wall.y);
    ctx.lineTo(wall.x + wall.w * (0.3 + damage * 0.3), wall.y + wall.h * 0.6);
    ctx.moveTo(wall.x + wall.w * 0.7, wall.y + wall.h);
    ctx.lineTo(wall.x + wall.w * (0.7 - damage * 0.3), wall.y + wall.h * 0.4);
    ctx.stroke();
  });
}

function drawGates(ctx: CanvasRenderingContext2D, gates: Gate[]) {
  gates.forEach(gate => {
    const cx = gate.x + gate.w / 2;
    ctx.globalAlpha = gate.locked ? 0.5 : 0.9;
    ctx.fillStyle = gate.locked ? '#475569' : '#a78bfa';
    ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
    ctx.fillStyle = gate.locked ? '#64748b' : '#ede9fe';
    ctx.fillRect(gate.x + 6, gate.y + 6, gate.w - 12, gate.h - 12);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = gate.locked ? '#94a3b8' : '#e9d5ff';
    ctx.fillText(gate.locked ? `🔒 ${gate.label}` : gate.label, cx, gate.y - 8);
    ctx.textAlign = 'left';
  });
}

function drawSavePoint(ctx: CanvasRenderingContext2D, savePoint: SavePoint, frame: number) {
  const pulse = 0.6 + 0.4 * Math.sin(frame / 12);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#5eead4';
  ctx.beginPath();
  ctx.arc(savePoint.x + savePoint.w / 2, savePoint.y + savePoint.h / 2, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#134e4a';
  ctx.beginPath();
  ctx.arc(savePoint.x + savePoint.w / 2, savePoint.y + savePoint.h / 2, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawNpc(ctx: CanvasRenderingContext2D, npc: Npc, player: Player) {
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(npc.x, npc.y, npc.w, npc.h);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(npc.x + 8, npc.y + 7, 12, 6);

  const dx = player.x + player.w / 2 - (npc.x + npc.w / 2);
  const dy = player.y + player.h / 2 - (npc.y + npc.h / 2);
  const near = Math.abs(dx) < 90 && Math.abs(dy) < 60;
  if (!near) return;

  const boxWidth = 220;
  const boxX = Math.min(Math.max(npc.x + npc.w / 2 - boxWidth / 2, 8), 800 - boxWidth - 8);
  const boxY = npc.y - 54;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(boxX, boxY, boxWidth, 44);
  ctx.strokeStyle = '#c4b5fd';
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX, boxY, boxWidth, 44);

  ctx.fillStyle = '#ede9fe';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  wrapText(ctx, npc.message, boxX + 10, boxY + 16, boxWidth - 20, 13);
  ctx.textAlign = 'left';
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  });
  if (line) ctx.fillText(line, x, lineY);
}

function drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[]) {
  coins.forEach(coin => {
    if (coin.collected) return;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(coin.x + 8, coin.y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(coin.x + 6, coin.y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]) {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const flashing = enemy.dying && enemy.deathTimer > 14;
    const bodyAlpha = enemy.dying ? Math.max(enemy.deathTimer / 18, 0) : 1;

    ctx.globalAlpha = bodyAlpha;

    // Aggro tell: a pulsing orange outline so the player can read "this one is chasing me" at a glance.
    if (enemy.aggro && !enemy.dying) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.strokeRect(enemy.x - 3, enemy.y - 3, enemy.w + 6, enemy.h + 6);
    }

    ctx.fillStyle = flashing ? '#fef2f2' : '#ef4444';
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = flashing ? '#ffffff' : '#fca5a5';
    ctx.fillRect(enemy.x + 4, enemy.y + 4, 8, 7);
    ctx.fillRect(enemy.x + 16, enemy.y + 4, 8, 7);
    ctx.fillStyle = flashing ? '#fecaca' : '#7f1d1d';
    ctx.fillRect(enemy.x + 8, enemy.y + 16, 12, 4);
    ctx.globalAlpha = 1;
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(particle => {
    ctx.globalAlpha = Math.max(particle.life / particle.maxLife, 0);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.textAlign = 'center';
  texts.forEach(text => {
    ctx.globalAlpha = Math.max(text.life / text.maxLife, 0);
    if (text.crit) {
      ctx.font = 'bold 22px sans-serif';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
    } else {
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const playerAlpha = player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0 ? 0.4 : 1;
  ctx.globalAlpha = playerAlpha;
  ctx.fillStyle = player.dashTimer > 0 ? '#818cf8' : '#6366f1';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#a5b4fc';
  const eyeX = player.facing > 0 ? player.x + 18 : player.x + 6;
  ctx.fillRect(eyeX, player.y + 7, 6, 6);
  if (player.attackTimer > 0) {
    ctx.fillStyle = '#fbbf24';
    const hitX = player.facing > 0 ? player.x + player.w : player.x - 20;
    ctx.fillRect(hitX, player.y + 4, 20, player.h - 8);
  }
  ctx.globalAlpha = 1;
}

function drawCombo(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.comboCount <= 1 || state.comboTimer <= 0) return;

  ctx.globalAlpha = Math.min(state.comboTimer / 20, 1);
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#f472b6';
  ctx.fillText(`x${state.comboCount} COMBO`, 780, 36);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawToast(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!state.toast) return;
  const alpha = Math.min(state.toast.life / 30, 1);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(150, 12, 500, 28);
  ctx.strokeStyle = state.toast.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(150, 12, 500, 28);
  ctx.fillStyle = state.toast.color;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.toast.text, 400, 31);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

let frameCounter = 0;

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
  frameCounter += 1;
  const world = WORLDS[state.worldId];
  const theme = world.theme;

  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, 800, 424);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  [[50, 30], [150, 60], [300, 20], [500, 45], [650, 25], [720, 55], [400, 35]].forEach(([x, y]) => {
    ctx.fillRect(x, y, 2, 2);
  });

  drawPlatforms(ctx, world.platforms, theme);
  drawSecretWalls(ctx, state.secretWalls);
  drawGates(ctx, state.gates);
  if (state.savePoint) drawSavePoint(ctx, state.savePoint, frameCounter);
  drawCoins(ctx, state.coins);
  drawEnemies(ctx, state.enemies);
  drawPlayer(ctx, state.player);
  if (state.npc) drawNpc(ctx, state.npc, state.player);
  drawParticles(ctx, state.particles);
  drawFloatingTexts(ctx, state.floatingTexts);

  ctx.restore();

  // Crit screen flash — drawn in screen space (after restore) so shake doesn't move the overlay.
  if (state.flashAlpha > 0) {
    ctx.globalAlpha = state.flashAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 424);
    ctx.globalAlpha = 1;
  }

  drawCombo(ctx, state);
  drawToast(ctx, state);
}
FILE_EOF

cat > "$TARGET/hooks/useCollision.ts" << 'FILE_EOF'
import { intersects } from '../systems/collisions';
import { type GameState, type GameUi } from '../systems/types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

export function updateCollectibles(state: GameState, setUi: UiSetter) {
  const player = state.player;

  state.coins.forEach(coin => {
    if (!coin.collected && intersects(player, { x: coin.x, y: coin.y, w: 16, h: 16 })) {
      coin.collected = true;
      state.score += 10;
      setUi(ui => ({ ...ui, score: state.score }));
    }
  });
}
FILE_EOF

cat > "$TARGET/hooks/useEnemies.ts" << 'FILE_EOF'
import {
  AGGRO_RANGE_X,
  AGGRO_RANGE_Y,
  CHASE_SPEED_MULT,
  COMBO_BASE_SCORE,
  COMBO_BONUS_PER_STACK,
  COMBO_MAX_STACKS,
  COMBO_WINDOW_FRAMES,
  CRIT_BASE_CHANCE,
  CRIT_CHANCE_PER_STACK,
  CRIT_FLASH_ALPHA,
  CRIT_HITSTOP_FRAMES,
  CRIT_KNOCKBACK_MULT,
  CRIT_MAX_CHANCE,
  CRIT_SCORE_MULT,
  CRIT_SHAKE,
  CRIT_SLOWMO_FRAMES,
  CRIT_SPARK_COUNT,
  DEAGGRO_RANGE_X,
  ENEMY_DEATH_FRAMES,
  ENEMY_DEATH_GRAVITY,
  HITSTOP_HURT_FRAMES,
  HITSTOP_KO_FRAMES,
  KNOCKBACK_ENEMY_VX,
  KNOCKBACK_ENEMY_VY,
  KNOCKBACK_PLAYER_VX,
  KNOCKBACK_PLAYER_VY,
  SHAKE_HIT,
  SHAKE_HURT,
  SPARK_COUNT_HIT,
  SPARK_COUNT_HURT,
} from '../systems/constants';
import { getAttackHitbox } from '../systems/combat';
import { intersects } from '../systems/collisions';
import { spawnFloatingText, spawnParticles } from '../systems/effects';
import { type GameState, type GameUi, type Platform } from '../systems/types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

export function updateEnemies(state: GameState, platforms: Platform[], setUi: UiSetter) {
  const player = state.player;

  state.enemies.forEach(enemy => {
    if (!enemy.alive) return;

    // Already-defeated enemies just play out their knockback arc and fade — no more collisions.
    if (enemy.dying) {
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      enemy.vy += ENEMY_DEATH_GRAVITY;
      enemy.vx *= 0.96;
      enemy.deathTimer -= 1;
      if (enemy.deathTimer <= 0) enemy.alive = false;
      return;
    }

    // --- Aggro detection, with hysteresis so enemies don't flicker in/out of chase at the range boundary ---
    const dxToPlayer = player.x + player.w / 2 - (enemy.x + enemy.w / 2);
    const dyToPlayer = Math.abs(player.y + player.h / 2 - (enemy.y + enemy.h / 2));
    const distXToPlayer = Math.abs(dxToPlayer);

    if (!enemy.aggro && distXToPlayer < AGGRO_RANGE_X && dyToPlayer < AGGRO_RANGE_Y) {
      enemy.aggro = true;
    } else if (enemy.aggro && distXToPlayer > DEAGGRO_RANGE_X) {
      enemy.aggro = false;
    }

    if (enemy.aggro) {
      // Chase: accelerate straight toward the player, faster than the idle patrol speed.
      enemy.vx = Math.sign(dxToPlayer || 1) * enemy.baseSpeed * CHASE_SPEED_MULT;
    }

    enemy.x += enemy.vx;
    const platform = platforms[enemy.platIdx];
    const [px, , pw] = platform;

    // Enemies never leave their home platform, chasing or not — an edge just turns a patroller around;
    // a chaser gets pinned at the edge for a frame and immediately re-aims next frame.
    if (enemy.x < px) {
      enemy.x = px;
      enemy.vx = enemy.aggro ? 0 : Math.abs(enemy.vx);
    }
    if (enemy.x + enemy.w > px + pw) {
      enemy.x = px + pw - enemy.w;
      enemy.vx = enemy.aggro ? 0 : -Math.abs(enemy.vx);
    }

    if (player.attackTimer > 0 && intersects(getAttackHitbox(player), enemy)) {
      enemy.dying = true;
      enemy.deathTimer = ENEMY_DEATH_FRAMES;

      // Kills within the combo window chain together for escalating score, juice, and crit odds.
      state.comboCount = Math.min(state.comboCount + 1, COMBO_MAX_STACKS);
      state.comboTimer = COMBO_WINDOW_FRAMES;
      const stack = state.comboCount;
      const bonusStacks = Math.min(stack - 1, 3);

      const critChance = Math.min(CRIT_BASE_CHANCE + (stack - 1) * CRIT_CHANCE_PER_STACK, CRIT_MAX_CHANCE);
      const isCrit = Math.random() < critChance;

      const basePoints = COMBO_BASE_SCORE + (stack - 1) * COMBO_BONUS_PER_STACK;
      const points = isCrit ? Math.round(basePoints * CRIT_SCORE_MULT) : basePoints;
      const knockbackMult = isCrit ? CRIT_KNOCKBACK_MULT : 1;

      enemy.vx = KNOCKBACK_ENEMY_VX * knockbackMult * player.facing;
      enemy.vy = KNOCKBACK_ENEMY_VY * knockbackMult;

      const sparkColor = isCrit ? '#fef08a' : stack > 1 ? '#f472b6' : '#fde68a';
      const label = stack > 1 ? `+${points} x${stack}` : `+${points}`;

      state.score += points;

      if (isCrit) {
        // Crits get a harder snap, then real slow motion (the sim runs at half rate) instead of just a longer freeze.
        state.shake = Math.max(state.shake, CRIT_SHAKE);
        state.hitStop = CRIT_HITSTOP_FRAMES;
        state.slowMo = CRIT_SLOWMO_FRAMES;
        state.flashAlpha = CRIT_FLASH_ALPHA;
        spawnParticles(state, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, CRIT_SPARK_COUNT, sparkColor);
        spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y - 14, 'CRIT!', '#fde047', true);
        spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y + 12, label, sparkColor);
      } else {
        state.shake = Math.max(state.shake, SHAKE_HIT + bonusStacks * 1.5);
        state.hitStop = HITSTOP_KO_FRAMES + bonusStacks;
        spawnParticles(state, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, SPARK_COUNT_HIT + bonusStacks * 2, sparkColor);
        spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y, label, sparkColor);
      }

      setUi(ui => ({ ...ui, score: state.score }));
      return;
    }

    if (player.invincible === 0 && intersects(player, enemy)) {
      player.hp--;
      player.invincible = 60;

      const pushDir = player.x + player.w / 2 < enemy.x + enemy.w / 2 ? -1 : 1;
      player.vx = KNOCKBACK_PLAYER_VX * pushDir;
      player.vy = KNOCKBACK_PLAYER_VY;

      state.shake = SHAKE_HURT;
      state.hitStop = HITSTOP_HURT_FRAMES;
      spawnParticles(state, player.x + player.w / 2, player.y + player.h / 2, SPARK_COUNT_HURT, '#f87171');
      spawnFloatingText(state, player.x + player.w / 2, player.y, '-1', '#f87171');
      setUi(ui => ({ ...ui, hp: player.hp }));
      if (player.hp <= 0) {
        state.gameState = 'dead';
        setUi(ui => ({ ...ui, state: 'dead', hp: 0 }));
      }
    }
  });
}
FILE_EOF

cat > "$TARGET/components/HUD.tsx" << 'FILE_EOF'
type HUDProps = {
  score: number;
  hp: number;
  worldName: string;
};

export default function HUD({ score, hp, worldName }: HUDProps) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>⭐ {score}</span>
        <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '1.3rem', letterSpacing: 2 }}>BLOCK FIGHT</span>
        <span style={{ color: '#f87171' }}>{Array.from({ length: 3 }, (_, index) => index < hp ? '❤️' : '🖤').join('')}</span>
      </div>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase' }}>{worldName}</span>
    </div>
  );
}
FILE_EOF

cat > "$TARGET/BlockFight.tsx" << 'FILE_EOF'
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameLayout } from '@/engine';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { updateEffects } from './systems/effects';
import { drawGame } from './systems/rendering';
import { createInitialState, createInitialUi } from './systems/spawning';
import { type GameState, type GameUi } from './systems/types';
import { getActivePlatforms, updateWorld } from './systems/worldTransition';
import { updateCollectibles } from './hooks/useCollision';
import { useControls } from './hooks/useControls';
import { updateEnemies } from './hooks/useEnemies';
import { updatePhysics } from './hooks/usePhysics';

type BlockFightProps = {
  onComplete?: (score: number, accuracy: number) => void;
};

export default function BlockFight({ onComplete }: BlockFightProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const [ui, setUi] = useState<GameUi>(createInitialUi);

    const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setUi(createInitialUi());
  }, []);

  const controlsRef = useControls(stateRef, restart);

  // Report the result back to the game page once the run ends.
  useEffect(() => {
    if (ui.state === 'win') onComplete?.(ui.score, 100);
    else if (ui.state === 'dead') onComplete?.(ui.score, 0);
  }, [ui.state, ui.score, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const ctx: CanvasRenderingContext2D = context;

    let animationId = 0;
    stateRef.current = createInitialState();

    function update() {
      const state = stateRef.current;
      if (!state || state.gameState !== 'playing') return;

      // Freeze the whole simulation for a few frames on impact — this is what gives hits "weight".
      if (state.hitStop > 0) {
        state.hitStop -= 1;
        return;
      }

      // Crit follow-through: real slow motion (simulation runs at half rate) rather than another freeze,
      // so the launch and particles are still visibly playing out, just stretched.
      if (state.slowMo > 0) {
        state.slowMo -= 1;
        if (state.slowMo % 2 === 0) return;
      }

      const platforms = getActivePlatforms(state);
      updatePhysics(state, controlsRef.current, platforms, setUi);
      if (state.gameState !== 'playing') return;

      updateEnemies(state, platforms, setUi);
      updateCollectibles(state, setUi);
      updateWorld(state, setUi);
      updateEffects(state);
    }

    function loop() {
      const state = stateRef.current;
      if (state) {
        update();
        drawGame(ctx, state);
      }
      animationId = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [controlsRef]);

  return (
    <GameLayout
      header={<HUD score={ui.score} hp={ui.hp} worldName={ui.worldName} />}
      controls={
        <p style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          ← → Move &nbsp;·&nbsp; ↑ / Space Jump (x2 in air) &nbsp;·&nbsp; X / Shift Attack &nbsp;·&nbsp; C Dash &nbsp;·&nbsp; R Restart
          <br />
          Walk into a village gate to travel &nbsp;·&nbsp; step on the glowing tile to save &nbsp;·&nbsp; some walls hide secrets
        </p>
      }
    >
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#020617', fontFamily: "'Segoe UI', sans-serif", padding: 16, borderRadius: 12,
      }}>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={424}
            style={{ border: '2px solid #1e293b', borderRadius: 12, display: 'block', maxWidth: '100%', height: 'auto' }}
          />

          {ui.state !== 'playing' && (
            <GameOver score={ui.score} state={ui.state} onRestart={restart} />
          )}
        </div>
      </div>
    </GameLayout>
  );
}
FILE_EOF

echo "Done. Changes applied:"
echo "  - systems/types.ts          (WorldId, Gate, SecretWall, Npc, SavePoint, Toast types)"
echo "  - systems/combat.ts         (new — shared attack-hitbox helper)"
echo "  - systems/save.ts           (new — localStorage load/save of unlocks + score)"
echo "  - data/worlds.ts            (new — Village / Forest / Mines world definitions)"
echo "  - systems/worldTransition.ts (new — gates, secret walls, save point, world-clear/win)"
echo "  - systems/spawning.ts       (builds initial state from the Village world + save data)"
echo "  - systems/effects.ts        (toast banner helper + decay)"
echo "  - systems/rendering.ts      (per-world theme, gates, NPC bubble, secret walls, toast)"
echo "  - hooks/useCollision.ts     (dropped the old single-level win condition)"
echo "  - hooks/useEnemies.ts       (uses the shared attack-hitbox helper)"
echo "  - components/HUD.tsx        (shows current world name)"
echo "  - BlockFight.tsx            (per-world platforms, updateWorld wired into the loop)"
echo ""
echo "Try it: you start in the Village. Talk to the NPC (walk up close), step on the"
echo "glowing save tile, then walk into the Forest gate. Clear every enemy + coin to"
echo "open the Mines gate back in the Village. There's a breakable wall hidden in the"
echo "Forest — a few hits on it reveals bonus coins."
