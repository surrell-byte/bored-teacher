import React, { useEffect, useRef, useState } from 'react';
import { Block } from '../Block/Block';
import { Tower } from '../Tower/Tower';
import { useGame } from '../../context/GameContext';
import { GameBlock } from '../../game/BlockGenerator';
import { FLIP_SHRINK_MS } from '../../game/Physics';

export function Board() {
  const { state, revealBlock } = useGame();
  const tileRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const revealingBlockRef = useRef<GameBlock | null>(null);
  const originRectRef = useRef<DOMRect | null>(null);

  // Tracks which tile's underlying grid cell should stay hidden while the
  // Tower overlay represents it — this stays true slightly longer than
  // `state.isRevealing` so the tile doesn't pop back in before the Tower's
  // own shrink-back animation has finished.
  const [hiddenBlockId, setHiddenBlockId] = useState<string | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const handleReveal = (block: GameBlock) => {
    if (block.used || state.isRevealing) return;
    const el = tileRefs.current.get(block.id);
    originRectRef.current = el ? el.getBoundingClientRect() : null;
    revealingBlockRef.current = block;
    setHiddenBlockId(block.id);
    revealBlock(block);
  };

  useEffect(() => {
    if (state.isRevealing) return;
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setHiddenBlockId(null), FLIP_SHRINK_MS);
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [state.isRevealing]);

  const towerBlock = state.isRevealing ? revealingBlockRef.current : null;
  const towerRect = state.isRevealing ? originRectRef.current : null;

  return (
    <div className="board">
      {state.blocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          hidden={hiddenBlockId === block.id}
          jackpotFlash={state.isJackpot && hiddenBlockId === block.id}
          disabled={state.phase !== 'playing'}
          onReveal={handleReveal}
          ref={(el) => {
            if (el) tileRefs.current.set(block.id, el);
            else tileRefs.current.delete(block.id);
          }}
        />
      ))}
      <Tower block={towerBlock} originRect={towerRect} />
    </div>
  );
}
