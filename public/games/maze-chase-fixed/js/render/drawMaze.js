// ═══════════════════════════════════════════════════════
//  RENDER — MAZE WALLS
// ═══════════════════════════════════════════════════════
import { TILE, COLORS } from '../utils/constants.js';
import { currentMap }   from '../game/state.js';

export function drawMaze(ctx) {
  const rows = currentMap.length;
  const cols = currentMap[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (currentMap[y][x] !== '#') continue;

      const grad = ctx.createLinearGradient(
        x * TILE, y * TILE,
        x * TILE + TILE, y * TILE + TILE,
      );
      grad.addColorStop(0, COLORS.WALL_A);
      grad.addColorStop(1, COLORS.WALL_B);
      ctx.fillStyle = grad;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);

      ctx.strokeStyle = COLORS.WALL_EDGE;
      ctx.lineWidth   = 1;
      ctx.strokeRect(x * TILE + 0.5, y * TILE + 0.5, TILE - 1, TILE - 1);
    }
  }
}
