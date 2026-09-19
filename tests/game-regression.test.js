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

test('Alphabet Hunt announces the actual winning player on the win screen', () => {
  const component = read('games/alphabet-hunt/AlphabetHunt.jsx');

  assert.match(component, /const \[winningPlayer, setWinningPlayer\] = useState\(null\)/);
  assert.match(component, /setWinningPlayer\(winner\)/);
  assert.match(component, /const winnerNumber = winningPlayer \?\? current/);
  assert.match(component, /const avatar = winnerNumber === 1 \? av1 : av2/);
});

test('Migrated games use direct React components without the legacy adapter', () => {
  const catalog = read('games/catalog.components.tsx');
  const data = read('games/whats-missing/whatsMissingData.js');

  assert.doesNotMatch(catalog, /games\/legacy\/LegacyGamePort/);
  assert.match(data, /WHATS_MISSING_CATEGORIES/);
  for (const componentPath of [
    'games/super-wings/SuperWings.jsx',
    'games/treasure-chest/TreasureChest.jsx',
    'games/unicorn-wings/UnicornWings.jsx',
    'games/higher-or-lower/HigherOrLower.jsx',
    'games/picture-race/PictureRace.jsx',
    'games/red-or-black/RedOrBlack.jsx',
  ]) {
    assert.match(read(componentPath), /RoundChallenge/);
  }
});

test('PowerPoint Slide adds a castle-door quiz game with a question screen and back button', () => {
  const catalog = read('games/catalog.components.tsx');
  const component = read('games/powerpoint-slide/PowerPointSlide.jsx');

  assert.match(catalog, /powerpointslide/);
  assert.match(component, /QUESTION/);
  assert.match(component, /BACK/);
  assert.match(component, /castle|door|wizard/i);
});

test('Tile Lanes is registered as a Teacher Pro game', () => {
  const catalog = read('games/catalog.data.ts');
  const access = read('config/game-access.ts');
  const component = read('games/catalog.components.tsx');

  assert.match(catalog, /tilelanes/);
  assert.match(access, /tilelanes/);
  assert.match(component, /tilelanes/);
});
