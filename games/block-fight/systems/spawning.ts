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
