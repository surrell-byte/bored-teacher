import React, { createContext, useCallback, useContext, useReducer, ReactNode } from 'react';
import {
  createInitialState,
  GameState,
  gameReducer,
} from '../game/GameEngine';
import { GameBlock } from '../game/BlockGenerator';
import { BlockType } from '../game/Constants';
import { applyBlockEffect } from '../game/Rewards';
import { playSound } from '../services/audio';
import { FLIP_GROW_MS, FLIP_HOLD_MS } from '../game/Physics';

export interface GameContextValue {
  state: GameState;
  goToSetup: () => void;
  startGame: (p1Name: string, p1Avatar: string, p2Name: string, p2Avatar: string) => void;
  /** Reveals a block: flips immediately in state, resolves the outcome after the flip animation. */
  revealBlock: (block: GameBlock) => void;
  reset: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const goToSetup = useCallback(() => dispatch({ type: 'GO_TO_SETUP' }), []);

  const startGame = useCallback(
    (p1Name: string, p1Avatar: string, p2Name: string, p2Avatar: string) => {
      dispatch({ type: 'START_GAME', p1Name, p1Avatar, p2Name, p2Avatar });
    },
    []
  );

  const revealBlock = useCallback(
    (block: GameBlock) => {
      if (block.used || state.isRevealing) return;
      dispatch({ type: 'BEGIN_REVEAL', blockId: block.id });

      // Peek at the outcome early purely to choose which sound to play in
      // sync with the card flip; the reducer recomputes authoritative state.
      const player = state.currentPlayer === 1 ? { ...state.player1 } : { ...state.player2 };
      const enemy = state.currentPlayer === 1 ? { ...state.player2 } : { ...state.player1 };
      const preview = applyBlockEffect(block.type as BlockType, { ...player }, { ...enemy });

      window.setTimeout(() => {
        if (preview.isJackpot) playSound('jackpot');
        else if (preview.netChange > 0) playSound('cash');
        else if (preview.netChange < 0) playSound('lose');
      }, FLIP_GROW_MS);

      window.setTimeout(() => {
        dispatch({ type: 'RESOLVE_REVEAL', blockId: block.id });
      }, FLIP_GROW_MS + FLIP_HOLD_MS);
    },
    [state.isRevealing, state.currentPlayer, state.player1, state.player2]
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <GameContext.Provider value={{ state, goToSetup, startGame, revealBlock, reset }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}

