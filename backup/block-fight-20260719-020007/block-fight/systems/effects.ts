import { type GameState } from './types';

/** Bursts a ring of small particles outward from a point — used for hit sparks. */
export function spawnParticles(state: GameState, x: number, y: number, count: number, color: string) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = 2 + Math.random() * 3.5;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 18 + Math.random() * 6,
      maxLife: 24,
      color,
      size: 2 + Math.random() * 2,
    });
  }
}

/** Spawns a floating combat-text label (e.g. "+50", "-1") that drifts up and fades. */
export function spawnFloatingText(state: GameState, x: number, y: number, text: string, color: string) {
  state.floatingTexts.push({ x, y, vy: -1.4, life: 40, maxLife: 40, text, color });
}

/** Advances all active particles and floating texts by one simulation frame. */
export function updateEffects(state: GameState) {
  state.particles = state.particles.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.25;
    particle.vx *= 0.94;
    particle.life -= 1;
    return particle.life > 0;
  });

  state.floatingTexts = state.floatingTexts.filter(text => {
    text.y += text.vy;
    text.vy *= 0.96;
    text.life -= 1;
    return text.life > 0;
  });
}
