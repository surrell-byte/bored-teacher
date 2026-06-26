import React, { forwardRef } from 'react';
import { GameBlock } from '../../game/BlockGenerator';

interface BlockProps {
  block: GameBlock;
  /** True while this exact block is mid-reveal (hidden so the Tower overlay can take its place). */
  hidden: boolean;
  /** True while this block triggered the most recent jackpot pulse. */
  jackpotFlash: boolean;
  disabled: boolean;
  onReveal: (block: GameBlock) => void;
}

/** A single hidden tile on the board. Shows its mystery letter until revealed. */
export const Block = forwardRef<HTMLButtonElement, BlockProps>(function Block(
  { block, hidden, jackpotFlash, disabled, onReveal },
  ref
) {
  const classes = [
    'block',
    block.isRainbow ? 'rainbow-tile' : '',
    block.used ? 'used' : '',
    hidden ? 'hidden-during-reveal' : '',
    jackpotFlash ? 'jackpot-flash' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      style={{
        gridColumn: block.col,
        gridRow: block.row,
        background: block.isRainbow ? undefined : block.gradient ?? undefined,
        color: block.isRainbow ? undefined : block.textColor,
      }}
      disabled={disabled || block.used}
      onClick={() => onReveal(block)}
      aria-label={`Tile ${block.letter}`}
    >
      <span className="tile-letter">{block.letter}</span>
    </button>
  );
});
