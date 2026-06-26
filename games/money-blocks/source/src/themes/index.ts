import black from './black';
import white from './white';
import gold from './gold';
import blue from './blue';
import green from './green';

export type ThemeKey = 'black' | 'white' | 'gold' | 'blue' | 'green';

export interface ThemeTokens {
  key: ThemeKey;
  bg: string;
  panel: string;
  panelBorder: string;
  gold: string;
  goldBright: string;
  goldDeep: string;
  ivory: string;
  ivoryDim: string;
  bgTop: string;
  bgDeep: string;
  bgDeepEnd: string;
  vignette: string;
  boardBg: string;
  boardBorder: string;
}

export const THEMES: Record<ThemeKey, ThemeTokens> = {
  black,
  white,
  gold,
  blue,
  green,
};

export const THEME_LIST: ThemeTokens[] = [black, white, gold, blue, green];

/** Maps each theme to its background image asset for the page backdrop. */
export const THEME_BACKGROUNDS: Record<ThemeKey, string> = {
  black: '/src/assets/backgrounds/black.webp',
  white: '/src/assets/backgrounds/white.webp',
  gold: '/src/assets/backgrounds/gold.webp',
  blue: '/src/assets/backgrounds/blue.webp',
  green: '/src/assets/backgrounds/green.webp',
};

/** Applies a theme's tokens onto the document root as CSS custom properties. */
export function applyThemeToDocument(theme: ThemeTokens): void {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--panel-border', theme.panelBorder);
  root.style.setProperty('--gold', theme.gold);
  root.style.setProperty('--gold-bright', theme.goldBright);
  root.style.setProperty('--gold-deep', theme.goldDeep);
  root.style.setProperty('--ivory', theme.ivory);
  root.style.setProperty('--ivory-dim', theme.ivoryDim);
  root.style.setProperty('--bg-top', theme.bgTop);
  root.style.setProperty('--bg-deep', theme.bgDeep);
  root.style.setProperty('--bg-deep-end', theme.bgDeepEnd);
  root.style.setProperty('--vignette', theme.vignette);
  root.style.setProperty('--board-bg', theme.boardBg);
  root.style.setProperty('--board-border', theme.boardBorder);
}

