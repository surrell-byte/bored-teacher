export const TREASURE_SHAPES = [
  { id: 'circle', name: 'Circle' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'square', name: 'Square' },
  { id: 'star', name: 'Star' },
  { id: 'diamond', name: 'Diamond' },
];

export function createTreasureBoard(random = Math.random) {
  const tiles = TREASURE_SHAPES.flatMap(({ id }) => Array(4).fill(id));
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [tiles[index], tiles[swapIndex]] = [tiles[swapIndex], tiles[index]];
  }
  return tiles.map((shapeId, index) => ({
    id: index,
    number: index + 1,
    shapeId,
    revealed: false,
  }));
}

export function scoreTreasureGuess(scores, playerIndex, guessedShape, hiddenShape, target = 3) {
  const correct = guessedShape === hiddenShape;
  const nextScores = scores.map((score, index) => (
    index === playerIndex && correct ? score + 1 : score
  ));

  return {
    correct,
    scores: nextScores,
    winnerIndex: nextScores.findIndex((score) => score >= target),
  };
}
