import { type Platform, type Rect } from './types';

export function intersects(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function platformToRect([x, y, w, h]: Platform): Rect {
  return { x, y, w, h };
}

export function resolvePlatformCollisions<T extends Rect & { vx: number; vy: number; onGround: boolean }>(
  body: T,
  platforms: Platform[],
) {
  body.x += body.vx;
  for (const platform of platforms) {
    const rect = platformToRect(platform);
    if (intersects(body, rect)) {
      if (body.vx > 0) body.x = rect.x - body.w;
      else if (body.vx < 0) body.x = rect.x + rect.w;
      body.vx = 0;
    }
  }

  body.y += body.vy;
  body.onGround = false;
  for (const platform of platforms) {
    const rect = platformToRect(platform);
    if (intersects(body, rect)) {
      if (body.vy > 0) {
        body.y = rect.y - body.h;
        body.onGround = true;
        body.vy = 0;
      } else if (body.vy < 0) {
        body.y = rect.y + rect.h;
        body.vy = 0;
      }
    }
  }
}
