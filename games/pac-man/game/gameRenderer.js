import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, ROWS, TILE_SIZE } from './constants';

export function renderGame(ctx, state) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawMaze(ctx, state);
  drawGhost(ctx, state.ghost);
  drawPlayer(ctx, state.player);
}

function drawMaze(ctx, state) {
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < state.walls[y].length; x += 1) {
      if (state.walls[y][x]) {
        ctx.fillStyle = COLORS.wall; ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = COLORS.wallBorder; ctx.strokeRect(x * TILE_SIZE + 0.5, y * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      }
      if (state.pellets[y][x]) {
        ctx.fillStyle = COLORS.pellet; ctx.beginPath(); ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
}

function drawGhost(ctx, ghost) {
  const x = ghost.x * TILE_SIZE; const y = ghost.y * TILE_SIZE;
  ctx.fillStyle = ghost.color; ctx.beginPath();
  ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2 - 2, TILE_SIZE / 2 - 3, Math.PI, 0);
  ctx.lineTo(x + TILE_SIZE - 3, y + TILE_SIZE - 3); ctx.closePath(); ctx.fill();
}

function drawPlayer(ctx, player) {
  const x = player.x * TILE_SIZE; const y = player.y * TILE_SIZE; const angle = player.mouthAngle * Math.PI;
  let start = angle; let end = Math.PI * 2 - angle;
  if (player.dx === 0 && player.dy === -1) { start += Math.PI * 1.5; end += Math.PI * 1.5; }
  else if (player.dx === 0 && player.dy === 1) { start += Math.PI * 0.5; end += Math.PI * 0.5; }
  else if (player.dx === -1) { start += Math.PI; end += Math.PI; }
  ctx.fillStyle = COLORS.pacman; ctx.beginPath(); ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
  ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 3, start, end); ctx.closePath(); ctx.fill();
}
