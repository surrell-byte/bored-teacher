export function rewardGameCompletion(
  score: number,
  accuracy: number
) {
  let xp = 20;
  let coins = 10;

  if (accuracy === 100) {
    xp += 25;
    coins += 25;
  }

  return { xp, coins };
}