export const GOAL = 1_000_000;
export const STARTING_MONEY = 100_000;

export type BlockType = 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'black';

export interface BlockLayoutItem {
  type: BlockType;
  col: string; // CSS grid-column value, e.g. "1/4"
  row: string; // CSS grid-row value, e.g. "1/3"
}

export const BLOCK_LAYOUT: BlockLayoutItem[] = [
  { type: 'green', col: '1/4', row: '1/3' },
  { type: 'red', col: '4/6', row: '1/3' },
  { type: 'blue', col: '6/9', row: '1/3' },
  { type: 'yellow', col: '9/13', row: '1/3' },
  { type: 'purple', col: '1/3', row: '3/5' },
  { type: 'black', col: '3/7', row: '3/5' },
  { type: 'green', col: '7/9', row: '3/5' },
  { type: 'red', col: '9/13', row: '3/5' },
  { type: 'blue', col: '1/4', row: '5/7' },
  { type: 'yellow', col: '4/5', row: '5/7' },
  { type: 'purple', col: '5/8', row: '5/7' },
  { type: 'black', col: '8/11', row: '5/7' },
  { type: 'green', col: '11/13', row: '5/7' },
  { type: 'red', col: '1/5', row: '7/9' },
  { type: 'blue', col: '5/7', row: '7/9' },
  { type: 'yellow', col: '7/10', row: '7/9' },
  { type: 'purple', col: '10/13', row: '7/9' },
  { type: 'black', col: '1/4', row: '9/11' },
  { type: 'green', col: '4/7', row: '9/11' },
  { type: 'red', col: '7/8', row: '9/11' },
  { type: 'blue', col: '8/10', row: '9/11' },
  { type: 'yellow', col: '10/13', row: '9/11' },
  { type: 'purple', col: '1/4', row: '11/13' },
  { type: 'black', col: '4/7', row: '11/13' },
  { type: 'green', col: '7/11', row: '11/13' },
  { type: 'red', col: '11/13', row: '11/13' },
];

export const BLOCK_SYMBOLS: Record<BlockType, string> = {
  green: '💵',
  red: '💸',
  blue: '🥷',
  yellow: '💎',
  purple: '🛡️',
  black: '🎲',
};

export const BLOCK_REVEAL_CLASS: Record<BlockType, string> = {
  green: 'reveal-back-green',
  red: 'reveal-back-red',
  blue: 'reveal-back-blue',
  yellow: 'reveal-back-yellow',
  purple: 'reveal-back-purple',
  black: 'reveal-back-black',
};

export const AVATARS = [
  '🦁', '🐯', '🐺', '🦊', '🐻', '🐼', '🦅', '🦋', '🐲', '🦄',
  '👑', '💀', '🎩', '🤖', '👾', '🎭', '🌟', '⚡', '🔥', '💎',
];

// Theme keys/tokens/swatches live in `themes/index.ts` — that's the system
// actually wired up via ThemeContext + THEME_BACKGROUNDS. (This file used to
// duplicate a stray, unused theme-key list that didn't match it.)

