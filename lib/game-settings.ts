export type GameSettings = {
  volume: number;
  brightness: number;
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  volume: 70,
  brightness: 100,
};

const GAME_SETTINGS_KEY = 'eslhub_game_settings';

export function getGameSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_GAME_SETTINGS;

  try {
    const raw = window.localStorage.getItem(GAME_SETTINGS_KEY);
    if (!raw) return DEFAULT_GAME_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      volume: Number.isFinite(parsed.volume) ? Math.min(100, Math.max(0, Number(parsed.volume))) : DEFAULT_GAME_SETTINGS.volume,
      brightness: Number.isFinite(parsed.brightness) ? Math.min(200, Math.max(40, Number(parsed.brightness))) : DEFAULT_GAME_SETTINGS.brightness,
    };
  } catch {
    return DEFAULT_GAME_SETTINGS;
  }
}

export function saveGameSettings(partial: Partial<GameSettings>): GameSettings {
  const next = { ...getGameSettings(), ...partial };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(next));
    applyGameSettings(next);
  }
  return next;
}

export function applyGameSettings(settings?: Partial<GameSettings>) {
  if (typeof document === 'undefined') return;
  const current = { ...DEFAULT_GAME_SETTINGS, ...getGameSettings(), ...(settings ?? {}) };
  document.documentElement.style.setProperty('--game-volume', String(current.volume / 100));
  document.documentElement.style.setProperty('--game-brightness', String(current.brightness / 100));
}
