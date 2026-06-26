/** A single static block's properties as defined in the board layout grid. */
export interface BlockLayoutItem {
  col: number;
  row: number;
  type: BlockType;
}

/** The 5 types of blocks that can be revealed. */
export type BlockType = 'cash' | 'steal' | 'swap' | 'bomb' | 'wild';

/** Map from block type to the CSS class used on the revealed Tower face. */
export const BLOCK_REVEAL_CLASS: Record<BlockType, string> = {
  cash: 'block-cash',
  steal: 'block-steal',
  swap: 'block-swap',
  bomb: 'block-bomb',
  wild: 'block-wild',
};

/** Map from block type to the symbol shown on the revealed Tower face. */
export const BLOCK_SYMBOLS: Record<BlockType, string> = {
  cash: '$',
  steal: '!',
  swap: '⇄',
  bomb: '☠︎',
  wild: '?',
};

/**
 * The static grid layout of all 26 blocks, defined as an array of col/row/type
 * objects. This is the single source of truth for the board's shape and size.
 */
export const BLOCK_LAYOUT: BlockLayoutItem[] = [
  { col: 1, row: 2, type: 'cash' }, { col: 1, row: 3, type: 'cash' },
  { col: 2, row: 1, type: 'cash' }, { col: 2, row: 2, type: 'steal' }, { col: 2, row: 3, type: 'cash' }, { col: 2, row: 4, type: 'swap' },
  { col: 3, row: 1, type: 'cash' }, { col: 3, row: 2, type: 'cash' }, { col: 3, row: 3, type: 'cash' }, { col: 3, row: 4, type: 'cash' }, { col: 3, row: 5, type: 'cash' },
  { col: 4, row: 1, type: 'swap' }, { col: 4, row: 2, type: 'cash' }, { col: 4, row: 3, type: 'wild' }, { col: 4, row: 4, type: 'cash' }, { col: 4, row: 5, type: 'steal' },
  { col: 5, row: 1, type: 'cash' }, { col: 5, row: 2, type: 'cash' }, { col: 5, row: 3, type: 'cash' }, { col: 5, row: 4, 'type': 'cash' }, { col: 5, row: 5, type: 'cash' },
  { col: 6, row: 2, type: 'bomb' }, { col: 6, row: 3, type: 'cash' }, { col: 6, row: 4, type: 'bomb' },
  { col: 7, row: 2, type: 'cash' }, { col: 7, row: 3, type: 'cash' },
  // New blocks to make the board bigger
  { col: 1, row: 4, type: 'cash' },
  { col: 7, row: 4, type: 'cash' },
  { col: 2, row: 5, type: 'steal' },
  { col: 6, row: 5, type: 'swap' },
];