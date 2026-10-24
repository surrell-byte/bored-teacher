export const RUNNER_WORLD_WIDTH = 720;

export function createRunnerViewport({ width, height, dpr = 1, art, fit = "cover" }) {
  if (!(width > 0) || !(height > 0) || !(dpr > 0) || !(art?.width > 0) || !(art?.height > 0)) {
    throw new RangeError("Runner viewport dimensions and artwork dimensions must be positive.");
  }

  const worldHeight = art.height * RUNNER_WORLD_WIDTH / art.width;
  const backgroundScale = fit === "contain"
    ? Math.min(width / art.width, height / art.height)
    : fit === "fill"
      ? null
      : Math.max(width / art.width, height / art.height);
  const scaleX = fit === "fill" ? width / RUNNER_WORLD_WIDTH : backgroundScale * art.width / RUNNER_WORLD_WIDTH;
  const scaleY = fit === "fill" ? height / worldHeight : scaleX;
  const offsetX = fit === "fill" ? 0 : (width - art.width * backgroundScale) / 2;
  const offsetY = fit === "fill" ? 0 : (height - art.height * backgroundScale) / 2;
  const scale = scaleX;
  const viewLeft = Math.max(0, -offsetX / scaleX);
  const viewRight = Math.min(RUNNER_WORLD_WIDTH, (width - offsetX) / scaleX);
  const viewTop = Math.max(0, -offsetY / scaleY);
  const viewBottom = Math.min(worldHeight, (height - offsetY) / scaleY);

  return {
    width,
    height,
    dpr,
    scale,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    worldHeight,
    viewLeft,
    viewRight,
    viewTop,
    viewBottom,
    laneGrounds: art.laneYs.map((y) => y * RUNNER_WORLD_WIDTH / art.width),
    laneBounds: art.laneBounds.map(([top, bottom]) => [
      top * RUNNER_WORLD_WIDTH / art.width,
      bottom * RUNNER_WORLD_WIDTH / art.width,
    ]),
  };
}

export function worldToScreen(x, y, viewport) {
  return {
    x: viewport.offsetX + x * viewport.scaleX,
    y: viewport.offsetY + y * viewport.scaleY,
  };
}

export function runnerBoxesOverlap(player, obstacle) {
  return player.x < obstacle.x + obstacle.w - 3
    && player.x + player.w > obstacle.x + 3
    && player.y < obstacle.y - 3
    && player.y + player.h > obstacle.y - obstacle.h + 3;
}
