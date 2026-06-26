import React from 'react';
import { EndResult } from '../../game/GameEngine';
import { moneyText } from '../../utils/helpers';
import { Confetti } from '../Animations/Confetti';

interface WinnerScreenProps {
  endResult: EndResult;
  onPlayAgain: () => void;
}

/** Final screen shown once a player reaches the goal or the board empties. */
export function WinnerScreen({ endResult, onPlayAgain }: WinnerScreenProps) {
  const { reason, winner } = endResult;
  const isStalemate = winner === null;

  return (
    <div className="winner-overlay">
      {!isStalemate && <Confetti seed={winner.displayName} />}
      <div className="winner-eyebrow">{reason === 'goal' ? 'Table Closed' : 'Board Empty'}</div>
      <h1 className="winner-title">{isStalemate ? 'Stalemate' : 'Victory'}</h1>
      <div className="winner-rule" />
      {isStalemate ? (
        <div className="winner-name">The table closes even — no winner</div>
      ) : (
        <>
          <div className="winner-amount">{moneyText(winner.money)}</div>
          <div className="winner-name">{winner.displayName} holds the table</div>
        </>
      )}
      <button className="play-again" onClick={onPlayAgain}>Play Again</button>
    </div>
  );
}
