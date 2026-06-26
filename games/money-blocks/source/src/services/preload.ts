import { THEME_BACKGROUNDS } from '../themes';

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // don't block the app on a missing asset
    img.src = src;
  });
}

/** Warms the browser cache for theme backgrounds so theme-switching feels instant. */
export async function preloadThemeBackgrounds(): Promise<void> {
  await Promise.all(Object.values(THEME_BACKGROUNDS).map(preloadImage));
}

/** Warms sound effects so the first reveal isn't delayed by a network fetch. */
export function preloadSounds(): void {
  ['cash', 'lose', 'jackpot'].forEach((name) => {
    const a = new Audio(`/src/assets/sounds/${name}.mp3`);
    a.preload = 'auto';
  });
}

