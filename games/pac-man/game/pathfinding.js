import { DIRECTIONS } from './constants';
import { canMove } from './maze';

export function findNextStep(walls, startX, startY, targetX, targetY) {
  if (startX === targetX && startY === targetY) return null;
  const queue = [{ x: startX, y: startY, firstStep: null }];
  let head = 0;
  const visited = new Set([`${startX},${startY}`]);

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    for (const [dx, dy] of Object.values(DIRECTIONS)) {
      const x = current.x + dx;
      const y = current.y + dy;
      if (!canMove(walls, x, y)) continue;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      const firstStep = current.firstStep ?? [x, y];
      if (x === targetX && y === targetY) return firstStep;
      visited.add(key);
      queue.push({ x, y, firstStep });
    }
  }
  return null;
}
