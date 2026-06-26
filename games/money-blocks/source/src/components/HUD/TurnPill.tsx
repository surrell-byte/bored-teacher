import React from 'react';
import { useGame } from '../../context/GameContext';

export function TurnPill() {
  const { state } = useGame();
  const name = state.currentPlayer === 1 ? state.player1.displayName : state.player2.displayName;

  return (
    <div className="turn-pill" id="turnDisplay">
      <span className="dot" /> {name} to move
    </div>
  );
}
