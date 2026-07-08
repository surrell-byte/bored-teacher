import { type Coin, type Platform } from '../systems/types';

export const PLATFORMS: Platform[] = [
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
];

const COIN_POSITIONS = [
  [140, 300],
  [310, 240],
  [460, 300],
  [590, 220],
  [230, 160],
  [420, 140],
  [710, 160],
  [70, 180],
  [640, 280],
] as const;

export function createCoins(): Coin[] {
  return COIN_POSITIONS.map(([x, y]) => ({ x, y, collected: false }));
}
