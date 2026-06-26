import React, { useEffect, useRef, useState } from 'react';
import { GameBlock } from '../../game/BlockGenerator';
import { BLOCK_SYMBOLS, BLOCK_REVEAL_CLASS } from '../../game/Constants';
import { centeredFlipSize, rectGeometry, FlipGeometry, FLIP_GROW_MS, FLIP_SHRINK_MS } from '../../game/Physics';

interface TowerProps {
  /** The block currently being revealed, or null when no reveal is in flight. */
  block: GameBlock | null;
  /** Bounding rect of the tile that was clicked, captured before it animates to center. */
  originRect: DOMRect | null;
}

/**
 * Fullscreen overlay that grows the clicked tile from its on-board position
 * to a centered, enlarged card, flips it to reveal the block's colour and
 * letter, holds briefly, then shrinks back down.
 *
 * `block`/`originRect` go back to null as soon as the reducer resolves the
 * reveal (end of the hold phase), but the shrink animation still needs to
 * play out after that — so this component keeps its own snapshot of the
 * last block/geometry and only clears it once the shrink timer completes,
 * rather than unmounting the instant the prop disappears.
 */
export function Tower({ block, originRect }: TowerProps) {
  const [activeBlock, setActiveBlock] = useState<GameBlock | null>(null);
  const [geometry, setGeometry] = useState<FlipGeometry | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [show, setShow] = useState(false);
  const lastRectRef = useRef<DOMRect | null>(null);

  // Start a new reveal whenever a fresh block/rect comes in.
  useEffect(() => {
    if (!block || !originRect) return;

    lastRectRef.current = originRect;
    setActiveBlock(block);
    setShow(true);
    setFlipped(false);
    setGeometry(rectGeometry(originRect));

    const growFrame = requestAnimationFrame(() => {
      setGeometry(centeredFlipSize(window.innerWidth, window.innerHeight));
    });
    const flipTimer = window.setTimeout(() => setFlipped(true), FLIP_GROW_MS * 0.55);

    return () => {
      cancelAnimationFrame(growFrame);
      window.clearTimeout(flipTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id]);

  // Once the engine clears the reveal (block prop goes back to null), play
  // the shrink-back animation before actually hiding the overlay.
  useEffect(() => {
    if (block || !activeBlock) return;

    const rect = lastRectRef.current;
    if (rect) setGeometry(rectGeometry(rect));

    const hideTimer = window.setTimeout(() => {
      setShow(false);
      setActiveBlock(null);
      setFlipped(false);
    }, FLIP_SHRINK_MS);

    return () => window.clearTimeout(hideTimer);
  }, [block, activeBlock]);

  return (
    <>
      <div className={`reveal-backdrop ${show ? 'show' : ''}`} />
      {activeBlock && geometry && (
        <div
          className="reveal-overlay"
          style={{
            left: geometry.left,
            top: geometry.top,
            width: geometry.width,
            height: geometry.height,
            opacity: show ? 1 : 0,
            pointerEvents: 'none',
          }}
        >
          <div className={`reveal-card ${flipped ? 'flipped' : ''}`}>
            <div className="reveal-face">
              <span className="tile-letter">{activeBlock.letter}</span>
            </div>
            <div
              className={`reveal-face back ${
                activeBlock.isRainbow ? 'rainbow-tile' : BLOCK_REVEAL_CLASS[activeBlock.type]
              }`}
            >
              {activeBlock.isRainbow ? '🌈' : BLOCK_SYMBOLS[activeBlock.type]}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
