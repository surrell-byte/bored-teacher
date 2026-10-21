function createDistinctQuestionDecks(questions, random = Math.random) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }

  return [
    shuffled.filter((_, index) => index % 2 === 0),
    shuffled.filter((_, index) => index % 2 === 1),
  ];
}

module.exports = { createDistinctQuestionDecks };
