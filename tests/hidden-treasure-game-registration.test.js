const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('Hidden Treasure is registered with its underwater game component and background', () => {
  const catalog = fs.readFileSync(path.join(root, 'games/catalog.data.ts'), 'utf8');
  const components = fs.readFileSync(path.join(root, 'games/catalog.components.tsx'), 'utf8');
  const component = fs.readFileSync(path.join(root, 'games/hidden-treasure/HiddenTreasure.jsx'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'games/hidden-treasure/hiddenTreasure.css'), 'utf8');

  assert.match(catalog, /hiddentreasure:\s*\{[\s\S]*?name:\s*"Hidden Treasure"[\s\S]*?hasComponent:\s*true/);
  assert.match(components, /hiddentreasure:\s*lazyGame\('hiddentreasure',\s*\(\)\s*=>\s*import\('@\/games\/hidden-treasure\/HiddenTreasure\.jsx'\)\)/);
  assert.match(component, /First player to find 3 shapes wins the round/);
  assert.match(component, /Choose a number/);
  assert.match(component, /What shape is hidden\?/);
  assert.match(styles, /\.ht-tile-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /background-image:\s*url\('\/assets\/games\/hidden-treasure\/hidden-treasure-underwater-bg\.webp'\)/);
  assert.ok(fs.existsSync(path.join(root, 'public/assets/games/hidden-treasure/hidden-treasure-underwater-bg.webp')));
});

test('Hidden Treasure creates a balanced numbered board and awards points only for correct guesses', async () => {
  const { createTreasureBoard, scoreTreasureGuess, TREASURE_SHAPES } = await import('../games/hidden-treasure/hiddenTreasureLogic.mjs');
  const board = createTreasureBoard(() => 0.5);

  assert.equal(board.length, 20);
  assert.deepEqual(board.map((tile) => tile.number), Array.from({ length: 20 }, (_, index) => index + 1));
  for (const { id } of TREASURE_SHAPES) {
    assert.equal(board.filter((tile) => tile.shapeId === id).length, 4);
  }

  const wrongGuess = scoreTreasureGuess([1, 0], 1, 'circle', 'star');
  assert.equal(wrongGuess.correct, false);
  assert.deepEqual(wrongGuess.scores, [1, 0]);
  assert.equal(wrongGuess.winnerIndex, -1);

  assert.deepEqual(scoreTreasureGuess([0, 0], 1, 'triangle', 'triangle'), {
    correct: true,
    scores: [0, 1],
    winnerIndex: -1,
  });
  assert.equal(scoreTreasureGuess([2, 0], 0, 'diamond', 'diamond').winnerIndex, 0);
});
