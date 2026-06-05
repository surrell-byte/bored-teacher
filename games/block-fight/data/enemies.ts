import { type Enemy } from '../engine/types';

const ENEMIES_INIT: Enemy[] = [
  { x: 300, y: 304, vx: 1.5, w: 28, h: 28, alive: true, platIdx: 2 },
  { x: 560, y: 224, vx: -1.2, w: 28, h: 28, alive: true, platIdx: 4 },
  { x: 200, y: 384, vx: 1.8, w: 28, h: 28, alive: true, platIdx: 0 },
  { x: 450, y: 304, vx: -1.5, w: 28, h: 28, alive: true, platIdx: 3 },
  { x: 620, y: 284, vx: 1.2, w: 28, h: 28, alive: true, platIdx: 5 },
];

export function createEnemies(): Enemy[] {
  return ENEMIES_INIT.map(enemy => ({ ...enemy }));
}
