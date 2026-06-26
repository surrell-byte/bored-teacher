import { GOAL } from './Constants';
import { moneyText } from '../utils/helpers';
import { percent } from '../utils/math';

export { moneyText };

export function progressPercent(money: number): number {
  return percent(money, GOAL);
}

export function hasWon(money: number): boolean {
  return money >= GOAL;
}

export interface PlayerLike {
  displayName: string;
  money: number;
}

/** Determines the richer player when the board empties with no million-dollar winner. */
export function richerPlayer<T extends PlayerLike>(a: T, b: T): T | null {
  if (a.money > b.money) return a;
  if (b.money > a.money) return b;
  return null; // stalemate
}

