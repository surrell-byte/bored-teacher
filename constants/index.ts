// constants/index.ts — shared constants for ESL Game Hub
//
// Game metadata now lives in constants/games.ts (single source of truth).
// Everything below is derived from that list so every consumer (Hub, Games
// list, game page, leaderboard, achievements) keeps working unchanged.
// To add/remove/edit a game, edit constants/games.ts only.

import { GAMES } from './games';
export type { GameDefinition } from './games';
export { GAMES } from './games';

export const GAME_KEYS = GAMES.map(g => g.id) as readonly string[];
export type GameKey = (typeof GAME_KEYS)[number];

export const NEW_GAME_KEYS = GAMES.filter(g => g.isNew).map(g => g.id) as readonly string[];

export const GAME_NAMES: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.name])
);

export const GAME_ICONS: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.icon])
);

export const GAME_DESC: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.description])
);

export const GAME_COVERS: Record<string, string> = {
  animalclass: '/assets/covers/animal-class-quest-cover.webp',
  blockfight: '/assets/covers/block-fight-cover.webp',
  colourclash: '/assets/covers/colour-clash-cover.webp',
  compound: '/assets/covers/compound-word-quest.webp',
  connect4: '/assets/covers/connect-4-cover.webp',
  countadd: '/assets/covers/count-and-add-cover.webp',
  deepseaReveal: '/assets/covers/deep-sea-reveal.webp',
  emojimatch: '/assets/covers/emoji-match-cover.webp',
  emojispelling: '/assets/covers/emoji-spelling-game-cover.webp',
  farmgame: '/assets/covers/farm-game-cover.webp',
  findmyfood: '/assets/covers/find-my-food-cover.webp',
  foodwordhunt: '/assets/covers/food-word-hunt-cover.webp',
  swampjump: '/assets/covers/froggy-hop-cover.webp',
  memory: '/assets/covers/memory-match-cover.webp',
  monkeytree: '/assets/covers/monkey-tree-climb-cover.webp',
  neonbridge: '/assets/covers/neon-bridge-cover.webp',
  oceanquest: '/assets/covers/ocean-quest-cover.webp',
  parachutedrop: '/assets/covers/parachute-drop-cover.webp',
  phonicsworld: '/assets/covers/phonics-world-cover.webp',
  redorblack: '/assets/covers/red-or-black-cover.webp',
  lakersracer: '/assets/covers/shakers-showtime-racer-cover.webp',
  shuttlecock: '/assets/covers/shuttlecock-smash-cover.webp',
  tornado: '/assets/covers/tornado-cover.webp',
  treasurechest: '/assets/covers/treasure-chest-showdown-cover.webp',
  wgrandprix: '/assets/covers/w-grand-prix.webp',
  wordmatch: '/assets/covers/word-match-cover.webp',
};

export const GAME_TAGS: Record<string, { label: string; color: string }> = Object.fromEntries(
  GAMES.map(g => [g.id, g.tag])
);

export const GAME_BADGE: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.badge])
);

export const GAME_DIFFICULTY: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.difficulty])
);

export const GAME_BAR_COLOR: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.barColor])
);

export const GAME_URLS: Record<string, string> = Object.fromEntries(
  GAMES.map(g => [g.id, g.url])
);

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

export const GAME_ORDER = [...GAME_KEYS];
