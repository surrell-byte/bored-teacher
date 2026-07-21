import { WORLDS, type WorldTheme } from '../data/worlds';
import {
  type Coin,
  type Enemy,
  type FloatingText,
  type Gate,
  type GameState,
  type Npc,
  type Particle,
  type Platform,
  type Player,
  type SavePoint,
  type SecretWall,
} from './types';

function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[], theme: WorldTheme) {
  platforms.forEach(([px, py, pw, ph]) => {
    ctx.fillStyle = theme.platformFill;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = theme.platformTop;
    ctx.fillRect(px, py, pw, 4);
  });
}

function drawSecretWalls(ctx: CanvasRenderingContext2D, walls: SecretWall[]) {
  walls.forEach(wall => {
    if (wall.broken) return;
    // Cracked stone look, with visible cracks widening as it takes damage.
    ctx.fillStyle = '#57534e';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    const damage = 1 - wall.hp / wall.maxHp;
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w * 0.3, wall.y);
    ctx.lineTo(wall.x + wall.w * (0.3 + damage * 0.3), wall.y + wall.h * 0.6);
    ctx.moveTo(wall.x + wall.w * 0.7, wall.y + wall.h);
    ctx.lineTo(wall.x + wall.w * (0.7 - damage * 0.3), wall.y + wall.h * 0.4);
    ctx.stroke();
  });
}

function drawGates(ctx: CanvasRenderingContext2D, gates: Gate[]) {
  gates.forEach(gate => {
    const cx = gate.x + gate.w / 2;
    ctx.globalAlpha = gate.locked ? 0.5 : 0.9;
    ctx.fillStyle = gate.locked ? '#475569' : '#a78bfa';
    ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
    ctx.fillStyle = gate.locked ? '#64748b' : '#ede9fe';
    ctx.fillRect(gate.x + 6, gate.y + 6, gate.w - 12, gate.h - 12);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = gate.locked ? '#94a3b8' : '#e9d5ff';
    ctx.fillText(gate.locked ? `🔒 ${gate.label}` : gate.label, cx, gate.y - 8);
    ctx.textAlign = 'left';
  });
}

function drawSavePoint(ctx: CanvasRenderingContext2D, savePoint: SavePoint, frame: number) {
  const pulse = 0.6 + 0.4 * Math.sin(frame / 12);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#5eead4';
  ctx.beginPath();
  ctx.arc(savePoint.x + savePoint.w / 2, savePoint.y + savePoint.h / 2, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#134e4a';
  ctx.beginPath();
  ctx.arc(savePoint.x + savePoint.w / 2, savePoint.y + savePoint.h / 2, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawNpc(ctx: CanvasRenderingContext2D, npc: Npc, player: Player) {
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(npc.x, npc.y, npc.w, npc.h);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(npc.x + 8, npc.y + 7, 12, 6);

  const dx = player.x + player.w / 2 - (npc.x + npc.w / 2);
  const dy = player.y + player.h / 2 - (npc.y + npc.h / 2);
  const near = Math.abs(dx) < 90 && Math.abs(dy) < 60;
  if (!near) return;

  const boxWidth = 220;
  const boxX = Math.min(Math.max(npc.x + npc.w / 2 - boxWidth / 2, 8), 800 - boxWidth - 8);
  const boxY = npc.y - 54;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(boxX, boxY, boxWidth, 44);
  ctx.strokeStyle = '#c4b5fd';
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX, boxY, boxWidth, 44);

  ctx.fillStyle = '#ede9fe';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  wrapText(ctx, npc.message, boxX + 10, boxY + 16, boxWidth - 20, 13);
  ctx.textAlign = 'left';
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  });
  if (line) ctx.fillText(line, x, lineY);
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

    const flashing = enemy.dying && enemy.deathTimer > 14;
    const bodyAlpha = enemy.dying ? Math.max(enemy.deathTimer / 18, 0) : 1;

    ctx.globalAlpha = bodyAlpha;

    // Aggro tell: a pulsing orange outline so the player can read "this one is chasing me" at a glance.
    if (enemy.aggro && !enemy.dying) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.strokeRect(enemy.x - 3, enemy.y - 3, enemy.w + 6, enemy.h + 6);
    }

    ctx.fillStyle = flashing ? '#fef2f2' : '#ef4444';
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = flashing ? '#ffffff' : '#fca5a5';
    ctx.fillRect(enemy.x + 4, enemy.y + 4, 8, 7);
    ctx.fillRect(enemy.x + 16, enemy.y + 4, 8, 7);
    ctx.fillStyle = flashing ? '#fecaca' : '#7f1d1d';
    ctx.fillRect(enemy.x + 8, enemy.y + 16, 12, 4);
    ctx.globalAlpha = 1;
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(particle => {
    ctx.globalAlpha = Math.max(particle.life / particle.maxLife, 0);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.textAlign = 'center';
  texts.forEach(text => {
    ctx.globalAlpha = Math.max(text.life / text.maxLife, 0);
    if (text.crit) {
      ctx.font = 'bold 22px sans-serif';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
    } else {
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const playerAlpha = player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0 ? 0.4 : 1;
  ctx.globalAlpha = playerAlpha;
  ctx.fillStyle = player.dashTimer > 0 ? '#818cf8' : '#6366f1';
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

function drawCombo(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.comboCount <= 1 || state.comboTimer <= 0) return;

  ctx.globalAlpha = Math.min(state.comboTimer / 20, 1);
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#f472b6';
  ctx.fillText(`x${state.comboCount} COMBO`, 780, 36);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawToast(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!state.toast) return;
  const alpha = Math.min(state.toast.life / 30, 1);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(150, 12, 500, 28);
  ctx.strokeStyle = state.toast.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(150, 12, 500, 28);
  ctx.fillStyle = state.toast.color;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.toast.text, 400, 31);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

let frameCounter = 0;

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
  frameCounter += 1;
  const world = WORLDS[state.worldId];
  const theme = world.theme;

  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, 800, 424);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  [[50, 30], [150, 60], [300, 20], [500, 45], [650, 25], [720, 55], [400, 35]].forEach(([x, y]) => {
    ctx.fillRect(x, y, 2, 2);
  });

  drawPlatforms(ctx, world.platforms, theme);
  drawSecretWalls(ctx, state.secretWalls);
  drawGates(ctx, state.gates);
  if (state.savePoint) drawSavePoint(ctx, state.savePoint, frameCounter);
  drawCoins(ctx, state.coins);
  drawEnemies(ctx, state.enemies);
  drawPlayer(ctx, state.player);
  if (state.npc) drawNpc(ctx, state.npc, state.player);
  drawParticles(ctx, state.particles);
  drawFloatingTexts(ctx, state.floatingTexts);

  ctx.restore();

  // Crit screen flash — drawn in screen space (after restore) so shake doesn't move the overlay.
  if (state.flashAlpha > 0) {
    ctx.globalAlpha = state.flashAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 424);
    ctx.globalAlpha = 1;
  }

  drawCombo(ctx, state);
  drawToast(ctx, state);
}
