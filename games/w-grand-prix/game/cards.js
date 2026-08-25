import { BASE_CARDS } from './constants';

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function drawCards(count = 3) {
  return shuffle([...BASE_CARDS, ...BASE_CARDS]).slice(0, count);
}
