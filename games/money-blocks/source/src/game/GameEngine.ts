import { BlockType, GOAL, STARTING_MONEY } from './Constants';
import { GameBlock, generateBlocks } from './BlockGenerator';
import { applyBlockEffect, PlayerState, soundForOutcome } from './Rewards';
import { nextPlayer, PlayerSlot } from './Turns';
import { hasWon, richerPlayer } from './Scoring';

export interface Player extends PlayerState {
  avatar: string;
}

export type GamePhase = 'welcome' | 'setup' | 'playing' | 'ended';

export interface EndResult {
  reason: 'goal' | 'board-empty';
  winner: Player | null; // null => stalemate
}

export interface GameState {
  phase: GamePhase;
  blocks: GameBlock[];
  player1: Player;
  player2: Player;
  currentPlayer: PlayerSlot;
  message: string;
  lastEyebrow: string;
  lastAmountChange: number | null;
  lastActorName: string;
  isRevealing: boolean;
  isJackpot: boolean;
  endResult: EndResult | null;
}

export function createInitialState(): GameState {
  return {
    phase: 'welcome',
    blocks: generateBlocks(),
    player1: { displayName: 'Player One', money: STARTING_MONEY, shield: false, avatar: '🦁' },
    player2: { displayName: 'Player Two', money: STARTING_MONEY, shield: false, avatar: '🐯' },
    currentPlayer: 1,
    message: 'The table is set.\nPlayer One opens play.',
    lastEyebrow: 'Table Set',
    lastAmountChange: null,
    lastActorName: '',
    isRevealing: false,
    isJackpot: false,
    endResult: null,
  };
}

export type GameAction =
  | { type: 'GO_TO_SETUP' }
  | { type: 'START_GAME'; p1Name: string; p1Avatar: string; p2Name: string; p2Avatar: string }
  | { type: 'BEGIN_REVEAL'; blockId: string }
  | { type: 'RESOLVE_REVEAL'; blockId: string }
  | { type: 'RESET' };

function currentOf(state: GameState): Player {
  return state.currentPlayer === 1 ? state.player1 : state.player2;
}
function enemyOf(state: GameState): Player {
  return state.currentPlayer === 1 ? state.player2 : state.player1;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GO_TO_SETUP':
      return { ...state, phase: 'setup' };

    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        player1: { ...state.player1, displayName: action.p1Name, avatar: action.p1Avatar },
        player2: { ...state.player2, displayName: action.p2Name, avatar: action.p2Avatar },
      };

    case 'BEGIN_REVEAL': {
      const blocks = state.blocks.map((b) =>
        b.id === action.blockId ? { ...b, used: true } : b
      );
      return { ...state, blocks, isRevealing: true };
    }

    case 'RESOLVE_REVEAL': {
      const block = state.blocks.find((b) => b.id === action.blockId);
      if (!block) return { ...state, isRevealing: false };

      // Work on plain mutable copies, then write back immutably.
      const player: Player = { ...currentOf(state) };
      const enemy: Player = { ...enemyOf(state) };
      const outcome = applyBlockEffect(block.type as BlockType, player, enemy);
      soundForOutcome(block.type as BlockType, outcome); // sound id consumed by the audio hook layer

      const player1 = state.currentPlayer === 1 ? player : enemy;
      const player2 = state.currentPlayer === 1 ? enemy : player;

      const eyebrow =
        outcome.netChange > 0
          ? 'GAIN SECURED'
          : outcome.netChange < 0
          ? 'LOSS TAKEN'
          : block.type === 'purple'
          ? 'GUARD RAISED'
          : 'NO CHANGE';

      // Check win-by-goal first.
      if (hasWon(player1.money) || hasWon(player2.money)) {
        const winner = hasWon(player1.money) ? player1 : player2;
        return {
          ...state,
          player1,
          player2,
          isRevealing: false,
          phase: 'ended',
          lastEyebrow: eyebrow,
          lastAmountChange: outcome.netChange,
          lastActorName: player.displayName,
          isJackpot: outcome.isJackpot,
          message: outcome.message,
          endResult: { reason: 'goal', winner },
        };
      }

      const boardEmpty = state.blocks.every((b) => b.used);
      if (boardEmpty) {
        const winner = richerPlayer(player1, player2);
        return {
          ...state,
          player1,
          player2,
          isRevealing: false,
          phase: 'ended',
          lastEyebrow: eyebrow,
          lastAmountChange: outcome.netChange,
          lastActorName: player.displayName,
          isJackpot: outcome.isJackpot,
          message: outcome.message,
          endResult: { reason: 'board-empty', winner },
        };
      }

      const newCurrent = outcome.again ? state.currentPlayer : nextPlayer(state.currentPlayer);
      const actorName = player.displayName;
      const nextMessage = outcome.again
        ? `${outcome.message}\n${actorName} moves again.`
        : `${outcome.message}\n${(newCurrent === 1 ? player1 : player2).displayName} to move.`;

      return {
        ...state,
        player1,
        player2,
        currentPlayer: newCurrent,
        isRevealing: false,
        lastEyebrow: eyebrow,
        lastAmountChange: outcome.netChange,
        lastActorName: actorName,
        isJackpot: outcome.isJackpot,
        message: nextMessage,
      };
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

export { GOAL };

