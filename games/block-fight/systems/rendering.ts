import { type Coin, type Enemy, type GameState, type Platform, type Player } from './types';

function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]) {
  platforms.forEach(([px, py, pw, ph]) => {
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(px, py, pw, 4);
  });
}

function drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[]) {
  coins.forEach(coin => {
    if (coin.collected) return;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(coin.x + 8, coin.y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(coin.x + 6, coin.y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]) {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(enemy.x + 4, enemy.y + 4, 8, 7);
    ctx.fillRect(enemy.x + 16, enemy.y + 4, 8, 7);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(enemy.x + 8, enemy.y + 16, 12, 4);
  });
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const playerAlpha = player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0 ? 0.4 : 1;
  ctx.globalAlpha = playerAlpha;
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#a5b4fc';
  const eyeX = player.facing > 0 ? player.x + 18 : player.x + 6;
  ctx.fillRect(eyeX, player.y + 7, 6, 6);
  if (player.attackTimer > 0) {
    ctx.fillStyle = '#fbbf24';
    const hitX = player.facing > 0 ? player.x + player.w : player.x - 20;
    ctx.fillRect(hitX, player.y + 4, 20, player.h - 8);
  }
  ctx.globalAlpha = 1;
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState, platforms: Platform[]) {
  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 424);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  [[50, 30], [150, 60], [300, 20], [500, 45], [650, 25], [720, 55], [400, 35]].forEach(([x, y]) => {
    ctx.fillRect(x, y, 2, 2);
  });

  drawPlatforms(ctx, platforms);
  drawCoins(ctx, state.coins);
  drawEnemies(ctx, state.enemies);
  drawPlayer(ctx, state.player);

  ctx.restore();
}
