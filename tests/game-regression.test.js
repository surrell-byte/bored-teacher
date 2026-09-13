const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Look and Say validates question data and has a visible empty-state guard', () => {
  const component = read('games/look-and-say/LookAndSay.jsx');
  const styles = read('games/look-and-say/LookAndSay.css');

  assert.match(component, /const items = rawItems\.filter\(isValidItem\)/);
  assert.match(component, /if \(!item \|\| selected !== null \|\| !item\.choices\.includes\(choice\)\)/);
  assert.match(component, /Questions unavailable/);
  assert.match(styles, /\.look-and-say-game \.finish .*display: flex/);
});

test('Alphabet Hunt merges incomplete future themes with a complete fallback', () => {
  const component = read('games/alphabet-hunt/AlphabetHunt.jsx');

  assert.match(component, /const DEFAULT_THEME =/);
  assert.match(component, /const resolveTheme = \(themeId\) => \(\{ \.\.\.DEFAULT_THEME, \.\.\.\(THEMES\[themeId\] \|\| \{\}\) \}\)/);
  assert.match(component, /const theme = resolveTheme\(themeId\)/);
});

test('What’s Missing protects against undersized or invalid future data', () => {
  const component = read('games/legacy/LegacyGamePort.jsx');
  const data = read('games/legacy/whatsMissingData.js');

  assert.match(data, /WHATS_MISSING_CATEGORIES/);
  assert.match(component, /WHATS_MISSING_ITEMS\.filter\(item => typeof item === "string" && item\.trim\(\)\)/);
  assert.match(component, /const SAFE_MEMORY_ITEMS = MEMORY_ITEMS\.length >= 8 \? MEMORY_ITEMS : DEFAULT_MEMORY_ITEMS/);
  assert.match(component, /randomNumber\(0, items\.length - 1\)/);
});
