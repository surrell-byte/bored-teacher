export const DUEL_BONUS_STREAK = 3;

export function resolveDuelPick(player, effect) {
  const isFreeze = effect.id === "freeze";
  const bonusApplied = player.bonusActive && !isFreeze;
  player.pts = Math.max(0, player.pts + effect.pts * (bonusApplied ? 2 : 1));

  if (isFreeze) {
    player.safeRounds = 0;
    player.bonusActive = false;
    player.bonusAnimating = false;
  } else if (bonusApplied) {
    player.safeRounds = 0;
    player.bonusActive = false;
    player.bonusAnimating = true;
  } else {
    player.safeRounds += 1;
    if (player.safeRounds >= DUEL_BONUS_STREAK) {
      player.safeRounds = 0;
      player.bonusActive = true;
    }
  }

  return { bonusApplied };
}

export function finishDuelBonusRound(player) {
  player.bonusAnimating = false;
}
