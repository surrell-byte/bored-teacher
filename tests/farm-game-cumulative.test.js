const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('farm game tracks cumulative score across all levels', () => {
  const filePath = path.join(__dirname, '..', 'games', 'farm-game', 'FarmGame.jsx');
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(source, /let totalScore = 0;/);
  assert.match(source, /totalScore \+= currentScore;/);
  assert.match(source, /window\.__farmGameComplete\(finalScore|window\.__farmGameComplete\(totalScore/);
  assert.match(source, /const totalPossible = levels\.reduce/);
});
