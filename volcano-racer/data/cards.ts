// The whole "content" of a turn is just this hand of cards.
// Add/rebalance a card here and every scene picks it up automatically.
import { Random } from '../../engine/utils/random';
import { QUICK_DASH_RANGE, BURNOUT_RANGE, SUPER_BOOST_RANGE } from '../config';

export type CardId = 'quick_dash' | 'burnout' | 'ice_cold' | 'super_boost';

export interface CardDefinition {
  id: CardId;
  label: string;
  description: string;
  color: string;
}

export const CARD_DEFS: Record<CardId, CardDefinition> = {
  quick_dash: {
    id: 'quick_dash',
    label: 'Quick Dash',
    description: 'Sprint forward',
    color: '#ff8f3c',
  },
  burnout: {
    id: 'burnout',
    label: 'Burnout',
    description: 'Spin out, lose ground',
    color: '#7a5c4f',
  },
  ice_cold: {
    id: 'ice_cold',
    label: 'Ice Cold',
    description: 'Frozen — skipped a round',
    color: '#4fc3f7',
  },
  super_boost: {
    id: 'super_boost',
    label: 'Super Boost',
    description: 'Checkpoint reward — rocket ahead!',
    color: '#ffd83c',
  },
};

/** The three cards every racer can always play. */
export const BASE_HAND: CardId[] = ['quick_dash', 'burnout', 'ice_cold'];

/** The hand a player currently sees: base three, plus Super Boost once unlocked. */
export function getHand(boostUnlocked: boolean): CardDefinition[] {
  const ids = boostUnlocked ? [...BASE_HAND, 'super_boost' as CardId] : BASE_HAND;
  return ids.map((id) => CARD_DEFS[id]);
}

/** How many tiles a card moves a racer. Negative = backward. Ice Cold moves nobody. */
export function rollCardDelta(id: CardId): number {
  switch (id) {
    case 'quick_dash':
      return Random.int(QUICK_DASH_RANGE[0], QUICK_DASH_RANGE[1]);
    case 'burnout':
      return -Random.int(BURNOUT_RANGE[0], BURNOUT_RANGE[1]);
    case 'ice_cold':
      return 0;
    case 'super_boost':
      return Random.int(SUPER_BOOST_RANGE[0], SUPER_BOOST_RANGE[1]);
  }
}
