import { BLOCK_LAYOUT, BlockLayoutItem } from './Constants';
import { letterFromIndex } from '../utils/helpers';
import { LETTER_COLOR_MAP, tileGradient, textColorFor } from '../utils/colors';

export interface GameBlock extends BlockLayoutItem {
  id: string;
  letter: string;
  hex: string;
  gradient: string | null;
  textColor: string;
  /** True for the single special Rainbow tile (letter R) — an animated Black wild card. */
  isRainbow: boolean;
  used: boolean;
}

/** Builds the full set of blocks for a fresh board, each with a unique letter A-Z. */
export function generateBlocks(): GameBlock[] {
  return BLOCK_LAYOUT.map((data, index) => {
    const letter = letterFromIndex(index);
    const hex = LETTER_COLOR_MAP[letter];
    return {
      ...data,
      id: `block-${index}`,
      letter,
      hex,
      gradient: tileGradient(hex),
      textColor: textColorFor(hex),
      isRainbow: hex === 'rainbow',
      used: false,
    };
  });
}

