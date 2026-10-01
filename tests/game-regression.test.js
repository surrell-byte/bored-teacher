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

test('Alphabet Hunt adds two avatar tiles per player and grants reveal credits per 1,000 net points', () => {
  const component = read('games/alphabet-hunt/AlphabetHunt.jsx');

  assert.match(component, /const AVATARS_TO_WIN = 7/);
  assert.match(component, /const EVENT_TILE_COUNT = 12/);
  assert.match(component, /const POINTS_PER_BONUS_REVEAL = 1000/);
  assert.match(component, /reachedMilestone - bonusMilestones\[player\]/);
  assert.match(component, /if \(usesBonusReveal\) setBonusReveals/);
  assert.equal((component.match(/Array\(AVATARS_TO_WIN\)/g) || []).length, 2);
  assert.match(component, /Found all seven/);
  assert.match(component, /Bonus reveals \{bonusReveals\[1\]\}/);
  assert.match(component, /Bonus reveals \{bonusReveals\[2\]\}/);
});

test('Connect 4 status cards flank a brighter board with readable cell coordinates', () => {
  const component = read('games/connect-4/Connect4.jsx');

  assert.match(component, /display: grid; align-items: center; justify-content: stretch;[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
  assert.match(component, /rgba\(38,112,184,0\.98\)/);
  assert.match(component, /font-size: clamp\(0\.95rem, 1\.35vw, 1\.2rem\); font-weight: 900; color: #fff/);
  assert.match(component, /text-shadow: 0 1px 3px rgba\(0,0,0,0\.98\)/);
  assert.match(component, /padding: screen === "game" \? 0 : "0\.8rem"/);
});

test('Sports Quiz start target follows the full-width artwork placeholder', () => {
  const styles = read('games/emoji-sports-quiz/EmojiSportsQuiz.css');

  assert.match(styles, /\.sports-welcome-start \{ position:absolute; inset-inline:0; bottom:0; width:100%; height:9%/);
  assert.match(styles, /\.sports-welcome-start \{ width:100%; height:9%; \}/);
});

test('Money Blocks keeps both account cards in its shell-height viewport and contains flip text', () => {
  const component = read('games/money-blocks/MoneyBlocks.jsx');
  const styles = read('games/money-blocks/MoneyBlocks.css');
  const original = read('money-blocks-final.html');

  assert.doesNotMatch(component, /className="theme-picker"/);
  assert.match(component, /className="reveal-preview"/);
  assert.match(styles, /@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces/);
  assert.match(styles, /font-family: "Inter", sans-serif/);
  assert.match(styles, /\.money-blocks \.setup-name-input \{[\s\S]*font: 500 1\.08rem/);
  assert.match(styles, /\.money-blocks \.avatar-btn \{[\s\S]*font-size: 1\.8rem/);
  assert.match(styles, /\.game \{[\s\S]*height: 100%;[\s\S]*max-height: 100%/);
  assert.match(styles, /\.reveal-preview \{ width: 100%; max-height: 3em; overflow: hidden/);
  assert.match(original, /font-family:'Fraunces', serif/);
  assert.match(original, /font-family:'Inter', sans-serif/);
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
