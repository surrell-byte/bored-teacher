import { type GameState, type Rect } from './types';

/** The player's active attack hitbox — a box extending in front of them while attackTimer is running. */
export function getAttackHitbox(player: GameState['player']): Rect {
  return {
    x: player.x + (player.facing > 0 ? player.w : -24),
    y: player.y + 4,
    w: 24,
    h: player.h - 8,
  };
}
