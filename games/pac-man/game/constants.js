export const TILE_SIZE = 30;
export const MAZE = [
  '###############', '#.............#', '#.####.#.####.#', '#.#.........#.#',
  '#.#.#######.#.#', '#.#...#...#.#.#', '##....#.#....##', '###.#...#.#.###',
  '#.............#', '#.#.#######.#.#', '#.#.........#.#', '#.####.#.####.#',
  '#.............#', '###############',
];
export const ROWS = MAZE.length;
export const COLS = MAZE[0].length;
export const CANVAS_WIDTH = COLS * TILE_SIZE;
export const CANVAS_HEIGHT = ROWS * TILE_SIZE;
export const DIRECTIONS = { LEFT: [-1, 0], RIGHT: [1, 0], UP: [0, -1], DOWN: [0, 1] };
export const COLORS = { background: '#000', wall: '#1d4ed8', wallBorder: '#3b82f6', pellet: '#fbbf24', pacman: '#fbbf24', ghost: '#f87171' };
export const GAME_PHASES = { PLAYING: 'playing', WIN: 'win', GAME_OVER: 'dead' };
