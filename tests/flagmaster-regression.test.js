const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Flagmaster avoids an undefined ThemeToggle reference', () => {
  const flagmaster = fs.readFileSync(path.join(root, 'games/flagmaster/Flagmaster.jsx'), 'utf8');
  assert.doesNotMatch(flagmaster, /\bThemeToggle\b/);
});
