import React from 'react';
import { PlayerCard } from './PlayerCard';
import { Ledger } from './Ledger';
import { useGame } from '../../context/GameContext';

export function Scoreboard() {
  const { state } = useGame();
  const { player1, player2, currentPlayer, lastEyebrow, lastAmountChange, lastActorName, message } = state;

  return (
    <div className="side-panels">
      <PlayerCard
        name={player1.displayName}
        avatar={player1.avatar}
        money={player1.money}
        shield={player1.shield}
        active={currentPlayer === 1}
      />
      <Ledger
        eyebrow={lastEyebrow}
        amountChange={lastAmountChange}
        actorName={lastActorName}
        message={message}
      />
      <PlayerCard
        name={player2.displayName}
        avatar={player2.avatar}
        money={player2.money}
        shield={player2.shield}
        active={currentPlayer === 2}
      />
    </div>
  );
}
