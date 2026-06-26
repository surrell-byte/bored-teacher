import { BlockType } from './Constants';
import { randomFrom } from '../utils/random';
import { moneyText } from '../utils/helpers';

export interface PlayerState {
  displayName: string;
  money: number;
  shield: boolean;
}

export interface TurnOutcome {
  message: string;
  netChange: number;
  again: boolean;
  isJackpot: boolean;
}

/**
 * Applies the effect of revealing a given block type. Mutates player/enemy
 * money & shield in place and returns a description of what happened.
 */
export function applyBlockEffect(
  type: BlockType,
  player: PlayerState,
  enemy: PlayerState
): TurnOutcome {
  const moneyBefore = player.money;
  let message = '';
  let again = false;
  let isJackpot = false;

  const multiplier = randomFrom([1, 1, 1, 1, 2, 2, 3]);
  const multiplierNote = multiplier > 1 ? ` (×${multiplier})` : '';

  switch (type) {
    case 'green': {
      const gain = randomFrom([25000, 50000, 75000, 100000, 150000]) * multiplier;
      player.money += gain;
      message = `${player.displayName} books a gain of ${moneyText(gain)}${multiplierNote}.`;
      break;
    }
    case 'red': {
      const loss = randomFrom([25000, 50000, 75000, 100000]) * multiplier;
      player.money = Math.max(0, player.money - loss);
      message = `${player.displayName} takes a loss of ${moneyText(loss)}${multiplierNote}.`;
      break;
    }
    case 'blue': {
      let steal = randomFrom([25000, 50000, 75000, 100000]) * multiplier;
      if (enemy.shield) {
        enemy.shield = false;
        message = `${player.displayName} attempts a raid — blocked by the guard.`;
      } else {
        steal = Math.min(steal, enemy.money);
        enemy.money -= steal;
        player.money += steal;
        message = `${player.displayName} raids the vault for ${moneyText(steal)}${multiplierNote}.`;
      }
      break;
    }
    case 'yellow': {
      const reward = randomFrom<'double' | number>(['double', 250000, 500000]);
      if (reward === 'double') {
        player.money *= 2;
        message = `${player.displayName} doubles their holdings.`;
      } else {
        player.money += reward;
        message = `${player.displayName} draws a wild gain of ${moneyText(reward)}.`;
      }
      break;
    }
    case 'purple': {
      player.shield = true;
      message = `${player.displayName} is granted a guard.`;
      break;
    }
    case 'black': {
      const event = randomFrom([
        'swap', 'extra', 'jackpot', 'tax', 'robbery', 'inheritance', 'bankrupt',
      ]);
      if (event === 'swap') {
        const t = player.money;
        player.money = enemy.money;
        enemy.money = t;
        message = `${player.displayName} swaps fortunes with the table.`;
      } else if (event === 'extra') {
        message = `${player.displayName} is granted an encore move.`;
        again = true;
      } else if (event === 'jackpot') {
        player.money += 300000;
        message = `${player.displayName} hits the jackpot — ${moneyText(300000)}.`;
        isJackpot = true;
      } else if (event === 'tax') {
        player.money = Math.max(0, player.money - 200000);
        message = `${player.displayName} is audited for ${moneyText(200000)}.`;
      } else if (event === 'robbery') {
        player.money = Math.max(0, player.money - 150000);
        message = `${player.displayName} is robbed of ${moneyText(150000)}.`;
      } else if (event === 'inheritance') {
        player.money += 500000;
        message = `${player.displayName} receives an inheritance of ${moneyText(500000)}.`;
      } else if (event === 'bankrupt') {
        player.money = Math.floor(player.money * 0.5);
        message = `${player.displayName} is declared bankrupt — holdings halved.`;
      }
      break;
    }
  }

  return {
    message,
    netChange: player.money - moneyBefore,
    again,
    isJackpot,
  };
}

/** Picks which sound effect should play for a given turn outcome. */
export function soundForOutcome(type: BlockType, outcome: TurnOutcome): 'cash' | 'lose' | 'jackpot' | null {
  if (outcome.isJackpot) return 'jackpot';
  if (outcome.netChange > 0) return 'cash';
  if (outcome.netChange < 0) return 'lose';
  if (type === 'blue' && outcome.netChange === 0) return null; // blocked raid
  return null;
}

