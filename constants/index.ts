// constants/index.ts — shared constants for ESL Game Hub
//
// Game metadata (names, icons, covers, tags, difficulty, etc.) now lives in
// ONE place: games/catalog.data.ts (GAME_CATALOG). Everything below is just
// re-exported from there for backward compatibility with existing imports —
// don't edit these lists by hand, edit games/catalog.data.ts instead, and
// run `npm run check-games` after any change.

export {
  GAME_CATALOG,
  GAME_KEYS,
  GAME_ORDER,
  NEW_GAME_KEYS,
  GAME_NAMES,
  GAME_ICONS,
  GAME_DESC,
  GAME_COVERS,
  GAME_TAGS,
  GAME_BADGE,
  GAME_DIFFICULTY,
  GAME_BAR_COLOR,
  GAME_URLS,
} from '@/games/catalog.data';
export type { GameKey, GameCatalogEntry } from '@/games/catalog.data';

// ── Non-game constants (unrelated to the registry, stay here) ──

export const THEMES = [
  { value: 'chalkboard', label: '🍃 Chalkboard' },
  { value: 'sunset',     label: '🌅 Sunset' },
  { value: 'forest',     label: '🌲 Forest' },
  { value: 'ocean',      label: '🌊 Ocean' },
  { value: 'candy',      label: '🍭 Candy' },
  { value: 'space',      label: '🌌 Space' },
  { value: 'classroom',  label: '☀️ Classroom' },
  { value: 'crimson',    label: '🔴 Crimson' },
  { value: 'cobalt',     label: '🔵 Cobalt' },
  { value: 'lemon',      label: '🟡 Lemon' },
  { value: 'lime',       label: '🟢 Lime' },
];

export const AVATARS: Record<string, string[]> = {
  animals: ['🐶','🐱','🐸','🐻','🦊','🐼','🐨','🐯','🦁','🦄','🐲','🦋','🐬','🦅','🦉','🦓','🐺','🦝','🐙','🦈','🐧','🦩','🦚'],
  faces:   ['😎','🤩','🥳','😄','🤓','🧐','🤠','😜','🥸','😏','🤯','🫡','🧙','🥷','👩‍🏫','🧑‍🚀','🧜','🧚'],
  sports:  ['⚽','🏀','🏈','⚾','🎾','🏐','🏓','🎯','🏆','🥇','🎮','🕹️','🎲','🎭','🎪'],
  nature:  ['🌟','⚡','🔥','🌊','🌈','🌙','☀️','❄️','🌺','🍀','🌴','🦋','🌸','🍄','🌍'],
  food:    ['🍕','🍦','🍩','🍓','🍎','🍋','🌮','🍜','🧁','🍫','🍣','🍔','🥑','🍇','🧃'],
  objects: ['💎','🚀','⚔️','🎸','📚','🔭','🎨','🏰','🧲','💡','🎺','🔮','🧸','🎠','🛸'],
};

export const GAME_IMAGES: Record<string, string> = {
  tornado: '/assets/games/tornado.webp',
  pacman: '/assets/games/pacman.webp',
  oceanquest: '/assets/games/ocean.webp',
  warriors: '/assets/games/warriors.webp',
};
