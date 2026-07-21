import { type Enemy } from '../systems/types';

const ENEMIES_INIT: Enemy[] = [
  { x: 300, y: 304, vx: 1.5, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 2, baseSpeed: 1.5, aggro: false },
  { x: 560, y: 224, vx: -1.2, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 4, baseSpeed: 1.2, aggro: false },
  { x: 200, y: 384, vx: 1.8, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 0, baseSpeed: 1.8, aggro: false },
  { x: 450, y: 304, vx: -1.5, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 3, baseSpeed: 1.5, aggro: false },
  { x: 620, y: 284, vx: 1.2, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 5, baseSpeed: 1.2, aggro: false },
];

export function createEnemies(): Enemy[] {
  return ENEMIES_INIT.map(enemy => ({ ...enemy }));
}
