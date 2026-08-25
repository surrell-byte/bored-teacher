import { findNextStep } from './pathfinding';
import { canMove } from './maze';
import { createGhost, createPlayer } from './gameState';
import { GAME_PHASES } from './constants';

export function updateGame(state) {
  if (state.phase !== GAME_PHASES.PLAYING) return;
  updatePlayerAnimation(state);
  updatePlayerMovement(state);
  updateGhost(state);
  checkCollision(state);
}

function updatePlayerAnimation(state) {
  state.player.mouthAngle += 0.08 * state.player.mouthDirection;
  if (state.player.mouthAngle > 0.35 || state.player.mouthAngle < 0.02) state.player.mouthDirection *= -1;
}

function updatePlayerMovement(state) {
  state.moveTimer += 1;
  if (state.moveTimer < 5) return;
  state.moveTimer = 0;
  const player = state.player;
  const directions = [[player.nextDx, player.nextDy], [player.dx, player.dy]];
  for (const [dx, dy] of directions) {
    if (canMove(state.walls, player.x + dx, player.y + dy)) {
      player.x += dx; player.y += dy; player.dx = dx; player.dy = dy;
      break;
    }
  }
  if (state.pellets[player.y][player.x]) {
    state.pellets[player.y][player.x] = false;
    state.eaten += 1; state.score += 10;
    if (state.eaten === state.totalPellets) state.phase = GAME_PHASES.WIN;
  }
}

function updateGhost(state) {
  state.ghostTimer += 1;
  if (state.ghostTimer < 15) return;
  state.ghostTimer = 0;
  const step = findNextStep(state.walls, state.ghost.x, state.ghost.y, state.player.x, state.player.y);
  if (step) [state.ghost.x, state.ghost.y] = step;
}

function checkCollision(state) {
  if (state.player.x !== state.ghost.x || state.player.y !== state.ghost.y) return;
  state.lives -= 1;
  if (state.lives <= 0) {
    state.phase = GAME_PHASES.GAME_OVER;
    return;
  }
  state.player = createPlayer();
  state.ghost = createGhost();
}
