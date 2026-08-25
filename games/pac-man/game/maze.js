import { COLS, DIRECTIONS, MAZE, ROWS } from './constants';

export function buildMaze() {
  const walls = [];
  const pellets = [];
  let totalPellets = 0;

  for (let y = 0; y < ROWS; y += 1) {
    walls[y] = [];
    pellets[y] = [];
    for (let x = 0; x < COLS; x += 1) {
      walls[y][x] = MAZE[y][x] === '#';
      pellets[y][x] = MAZE[y][x] === '.';
      if (pellets[y][x]) totalPellets += 1;
    }
  }
  return { walls, pellets, totalPellets };
}

export function isInsideMaze(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS;
}

export function canMove(walls, x, y) {
  return isInsideMaze(x, y) && !walls[y][x];
}

export function getValidMoves(walls, x, y) {
  return Object.values(DIRECTIONS).filter(([dx, dy]) => canMove(walls, x + dx, y + dy));
}
