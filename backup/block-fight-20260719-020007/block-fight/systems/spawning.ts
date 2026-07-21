import { PLAYER_MAX_HP, PLAYER_START } from './constants';
import { type GameState, type GameUi } from './types';
import { createEnemies } from '../data/enemies';
import { createCoins } from '../data/levels';

export function createInitialState(): GameState {
  return {
    player: {
      ...PLAYER_START,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      attackTimer: 0,
      hp: PLAYER_MAX_HP,
      invincible: 0,
    },
    enemies: createEnemies(),
    coins: createCoins(),
    score: 0,
    shake: 0,
    hitStop: 0,
    particles: [],
    floatingTexts: [],
    coyoteTime: 0,
    jumpBuffer: 0,
    gameState: 'playing',
  };
}

export function createInitialUi(): GameUi {
  return { score: 0, hp: PLAYER_MAX_HP, state: 'playing' };
}
