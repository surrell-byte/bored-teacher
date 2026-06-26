export type PlayerSlot = 1 | 2;

export function nextPlayer(current: PlayerSlot): PlayerSlot {
  return current === 1 ? 2 : 1;
}

export function otherSlot(slot: PlayerSlot): PlayerSlot {
  return slot === 1 ? 2 : 1;
}

