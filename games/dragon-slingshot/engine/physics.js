export const WORLD = { width: 700, height: 420, sling: { x: 130, y: 305 }, gravity: 0.44, maxPull: 78, stiffness: 0.31 };

export function pointInBlock(dragon, block) {
  return dragon.x + 16 > block.x && dragon.x - 16 < block.x + block.w && dragon.y + 16 > block.y && dragon.y - 16 < block.y + block.h;
}

export function createLevel(level, dragonId) {
  return { level, dragonId, phase: 'aim', pull: { x: 0, y: 0 }, dragging: false, dragon: null, abilityUsed: false, score: 0 };
}

export function boundedPull(point) {
  const dx = point.x - WORLD.sling.x;
  const dy = point.y - WORLD.sling.y;
  const distance = Math.hypot(dx, dy);
  const multiplier = Math.min(distance, WORLD.maxPull) / (distance || 1);
  return { x: dx * multiplier, y: dy * multiplier };
}
