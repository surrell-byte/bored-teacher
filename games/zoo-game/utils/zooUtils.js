export function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function article(word = '') {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

export function buildOptionSet(animals, currentIndex, correctName) {
  const pool = animals.filter((animal) => animal.name !== correctName);
  const shuffledPool = shuffleArray(pool);
  const extras = shuffledPool.slice(0, 3);
  const correctAnimal = animals[currentIndex] ?? { name: correctName };

  return shuffleArray([...extras, { ...correctAnimal, name: correctName }]);
}
