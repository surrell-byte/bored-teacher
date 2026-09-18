const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Plant & Vegetable Quiz uses six-round checkpoint progression and labels trivia correctly', () => {
  const component = read('games/plant-vegetable-quiz/PlantVegetableQuiz.jsx');

  assert.match(component, /ROUNDS_PER_LEVEL\s*=\s*6/);
  assert.match(component, /sessionStorage/i);
  assert.match(component, /roundComplete|Congratulations|Checkpoint/i);
  assert.match(component, /Plant and Veg Trivia/i);
  assert.match(component, /progressive|difficulty/i);
});
