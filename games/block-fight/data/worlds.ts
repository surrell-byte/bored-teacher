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
