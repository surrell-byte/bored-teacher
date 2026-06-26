export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function percent(value: number, goal: number): number {
  return clamp((value / goal) * 100, 0, 100);
}

