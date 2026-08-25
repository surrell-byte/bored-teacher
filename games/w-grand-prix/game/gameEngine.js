import { TRACK_TOTAL } from './constants';
import { SPECIALS } from './specials';

export function calculateMove({ position, card }) {
  let newPosition = Math.min(position + card.delta, TRACK_TOTAL);
  const messages = [`played ${card.label} (${card.desc})`];
  const special = SPECIALS[newPosition];

  if (special && newPosition < TRACK_TOTAL) {
    newPosition = Math.max(0, Math.min(newPosition + special.delta, TRACK_TOTAL));
    messages.push(`${special.label} -> now at ${newPosition}`);
  }

  return { position: newPosition, messages, finished: newPosition >= TRACK_TOTAL };
}
