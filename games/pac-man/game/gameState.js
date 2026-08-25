import { COLORS, COLS, GAME_PHASES, ROWS } from './constants';
import { buildMaze } from './maze';

export function createPlayer() {
  return { x: 1, y: 1, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouthAngle: 0.2, mouthDirection: 1 };
}

export function createGhost() {
  return { x: COLS - 2, y: ROWS - 2, color: COLORS.ghost };
}

export function createGameState() {
  const { walls, pellets, totalPellets } = buildMaze();
  return { walls, pellets, totalPellets, eaten: 0, score: 0, lives: 3, player: createPlayer(), ghost: createGhost(), moveTimer: 0, ghostTimer: 0, phase: GAME_PHASES.PLAYING };
}
