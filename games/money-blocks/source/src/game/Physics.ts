export interface FlipGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Computes the centered, enlarged geometry used for the reveal-flip overlay. */
export function centeredFlipSize(viewportW: number, viewportH: number): FlipGeometry {
  const size = Math.min(viewportW, viewportH) * 0.36;
  return {
    left: viewportW / 2 - size / 2,
    top: viewportH / 2 - size / 2,
    width: size,
    height: size,
  };
}

export function rectGeometry(rect: DOMRect): FlipGeometry {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

// Timing constants for the reveal sequence (ms)
export const FLIP_GROW_MS = 600;
export const FLIP_HOLD_MS = 2000;
export const FLIP_SHRINK_MS = 600;

