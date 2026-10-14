const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Know It All offers optional Chinese translations for all questions', () => {
  const component = read('games/know-it-all/KnowItAll.jsx');
  const translations = component.split('const QUESTION_TRANSLATIONS = [')[1].split('\n];')[0];

  assert.equal((translations.match(/\{ question:/g) || []).length, 25);
  assert.match(component, /const \[translatorMode, setTranslatorMode\] = useState\(false\)/);
  assert.match(component, /aria-pressed=\{translatorMode\}/);
  assert.match(component, /QUESTION_TRANSLATIONS\[current\]\.question/);
  assert.match(component, /QUESTION_TRANSLATIONS\[current\]\.options\[index\]/);
});

test('Look and Say validates question data and has a visible empty-state guard', () => {
  const component = read('games/look-and-say/LookAndSay.jsx');
  const styles = read('games/look-and-say/LookAndSay.css');

  assert.match(component, /const items = rawItems\.filter\(isValidItem\)/);
  assert.match(component, /if \(!item \|\| selected !== null \|\| !item\.choices\.includes\(choice\)\)/);
  assert.match(component, /Questions unavailable/);
  assert.match(styles, /\.look-and-say-game \.finish .*display: flex/);
});

test('portrait game controls and start actions remain visible and usable', () => {
  const lookAndSay = read('games/look-and-say/LookAndSay.css');
  const findMyFood = read('games/find-my-food/FindMyFood.jsx');
  const miniRacer = read('games/mini-racer/MiniRacer.jsx');
  const mobileShell = read('app/globals.css');

  assert.match(lookAndSay, /\.start-hotspot[\s\S]*background: #075985;[\s\S]*color: #fff/);
  assert.match(findMyFood, /className="ff-welcome-start-hotspot"/);
  assert.match(findMyFood, /className="ff-welcome-start-hotspot"[\s\S]*?>Start Game<\/button>/);
  assert.match(miniRacer, /aria-label="Steer left"[\s\S]*onPointerDown/);
  assert.match(miniRacer, /aria-label="Accelerate"[\s\S]*onPointerDown/);
  assert.match(mobileShell, /game-shell-topbar-stats > label\.game-shell-header-action[\s\S]*width: 116px/);
});

test('Alphabet Hunt merges incomplete future themes with a complete fallback', () => {
  const component = read('games/alphabet-hunt/AlphabetHunt.jsx');

  assert.match(component, /const DEFAULT_THEME =/);
  assert.match(component, /const resolveTheme = \(themeId\) => \(\{ \.\.\.DEFAULT_THEME, \.\.\.\(THEMES\[themeId\] \|\| \{\}\) \}\)/);
  assert.match(component, /const theme = resolveTheme\(themeId\)/);
});

test('Alphabet Hunt offers emoji and reverse letter modes before player setup', () => {
  const component = read('games/alphabet-hunt/AlphabetHunt.jsx');

  assert.match(component, /const \[gameMode, setGameMode\] = useState\('emoji'\)/);
  assert.match(component, /selectMode\('emoji'\)/);
  assert.match(component, /selectMode\('letter'\)/);
  assert.match(component, /const targetOptions = isLetterMode \? LETTERS : AVATARS/);
  assert.match(component, /const tileLabels = isLetterMode \? AVATARS : QWERTY_KEYS/);
  assert.match(component, /letter: label/);
  assert.match(component, /{targetOptions\.map\(/);
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
  assert.match(component, /linear-gradient\(145deg, #24558A 0%, #16385F 38%, #102744 100%\)/);
  assert.match(component, /border: 1px solid rgba\(101,207,255,0\.75\)/);
  assert.match(component, /linear-gradient\(145deg, #355D83 0%, #1C3B5D 45%, #10243D 100%\)/);
  assert.match(component, /#FF365F/);
  assert.match(component, /#FFC247/);
  assert.match(component, /\.c4-board-frame\.turn-p1, \.c4-board-frame\.turn-p2/);
  assert.match(component, /\.c4-cell\.win \{ animation: c4WinBurst 0\.45s ease-out forwards, c4WinPulse 0\.45s 0\.45s ease-in-out 1; \}/);
  assert.match(component, /font-size: clamp\(0\.95rem, 1\.35vw, 1\.2rem\); font-weight: 900; color: #fff/);
  assert.match(component, /text-shadow: 0 1px 3px rgba\(0,0,0,0\.98\)/);
  assert.match(component, /padding: screen === "game" \? 0 : "0\.8rem"/);
  assert.match(component, /@media \(max-width:600px\) and \(orientation:portrait\)/);
  assert.match(component, /\.c4-board-frame \{ --cell: min\(10\.5vw, 52px\); \}/);
  assert.match(component, /connect-4-welcome-phone-bg\.webp/);
  assert.match(component, /connect-4-general-phone-bg\.webp/);
  assert.match(component, /left:20%; top:62%; width:60%; height:14%;/);
});

test('Number Clouds menu label and game navbar controls stay grouped', () => {
  const component = read('games/number-clouds/NumberClouds.jsx');
  const styles = read('app/globals.css');

  assert.match(component, /<h1>Main Menu<\/h1>/);
  assert.match(styles, /\.game-shell\.game-shell--numberclouds \.game-header-default \{[\s\S]*?justify-content: flex-start/);
  assert.match(styles, /@media \(max-width: 639px\) \{\s+\.game-shell\.game-shell--numberclouds \.game-header-default \{ gap: 8px; \}/);
  assert.match(styles, /\.game-shell\.game-shell--numberclouds \.game-header-actions \.game-shell-topbar-stats \{\s+flex: 0 0 auto;\s+width: auto;/);
});

test('new game backgrounds follow screen state and reserve phone art for portrait phones', () => {
  const colourClash = read('games/colour-clash-2/ColourClash2.jsx');
  const zooGame = read('games/zoo-game/ZooGame.jsx');
  const zooStyles = read('games/zoo-game/styles/zooGame.css');
  const gameRoute = read('app/games/[game]/page.tsx');

  assert.match(colourClash, /data-screen="welcome"[\s\S]*colour-clash-2-welcome-bg\.webp/);
  assert.match(colourClash, /data-screen="setup"[\s\S]*colour-clash-2-user-input-bg\.webp/);
  assert.match(colourClash, /data-screen="how"[\s\S]*colour-clash-2-main-menu-bg\.webp/);
  assert.match(colourClash, /data-screen="game"[\s\S]*colour-clash-2-game-screen-bg\.webp/);
  assert.match(zooGame, /const \[showWelcome, setShowWelcome\] = useState\(true\)/);
  assert.match(zooGame, /aria-label="Start Zoo Game"/);
  assert.match(zooStyles, /@media \(max-width: 600px\) and \(orientation: portrait\)[\s\S]*zoo-game-welcome-phone-bg\.webp[\s\S]*top: 34%;[\s\S]*height: 10%/);
  assert.match(gameRoute, /'colourclash2', 'zoogame'/);
});

test('Colour Clash uses the approved palette and responsive high-visibility instructions', () => {
  const colourClash = read('games/colour-clash-2/ColourClash2.jsx');
  const allowedColours = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00C853', '#00FFFF', '#0000FF',
    '#8000FF', '#FF00FF', '#FF69B4', '#8B4513', '#FFFFFF', '#000000',
  ];
  const usedHexColours = [...new Set(colourClash.match(/#[0-9A-Fa-f]{6}/g))];

  assert.deepEqual(usedHexColours.sort(), allowedColours.slice().sort());
  assert.match(colourClash, /const COLOR_OPTIONS = \[[\s\S]*?"#FF69B4", "Hot Pink"[\s\S]*?"#8B4513", "Brown"[\s\S]*?"#FFFFFF", "White"[\s\S]*?"#000000", "Black"/);
  assert.match(colourClash, /\.cc \.how-content\{[^}]*grid-template-columns:minmax\(0,1\.35fr\) minmax\(240px,\.85fr\)/);
  assert.match(colourClash, /\.cc \.how-text\{[^}]*font-size:clamp\(1\.15rem,1\.8vw,1\.5rem\)/);
  assert.match(colourClash, /\.cc \.power-legend\{display:flex;flex-direction:column/);
  assert.match(colourClash, /\.cc\[data-screen="how"\] \.btn-primary\{[^}]*width:auto/);
  assert.match(colourClash, /\.cc\[data-screen="setup"\] \.btn-primary\{width:min\(664px,100%\)/);
  assert.match(colourClash, /\.cc\[data-screen="winner"\] \.btn\{width:min\(208px,100%\);justify-content:center\}/);
  assert.match(colourClash, /THEME_OPTIONS\.map\(\(\[id, name, swatch\]\) => <option[^>]*>\{swatch\} \{name\}<\/option>\)/);
  assert.match(colourClash, /\{COLOR_SWATCHES\[v\]\} \{l\}/);
  assert.match(colourClash, /\.cc \.tile\{[^}]*background:#000000/);
  assert.match(colourClash, /\.cc \.tile::before\{display:none\}/);
  assert.match(colourClash, /\.cc \.scoreboard\{[^}]*background:#000000/);
  assert.match(colourClash, /\.cc \.turn\{[^}]*background:#000000/);
  assert.match(colourClash, /\.cc \.how-screen h2\{[^}]*background:#000000/);
  assert.match(colourClash, /className="screen how-screen"/);
});

test('Sentence Builder removes the hero banner and keeps sentence rows within the viewport', () => {
  const sentenceBuilder = read('games/sentence-builder/SentenceBuilder.jsx');

  assert.doesNotMatch(sentenceBuilder, /<h1>Sentence Builder Pro<\/h1>/);
  assert.doesNotMatch(sentenceBuilder, /Master the Language/);
  assert.match(sentenceBuilder, /@scope \(\.sentencebuilder-root\)/);
  assert.doesNotMatch(sentenceBuilder, /(?:^|\n)\s*body(?:\s*::before)?\s*\{/);
  assert.match(sentenceBuilder, /width: min\(100%, 900px\);[\s\S]*max-height: calc\(100dvh - 80px\);[\s\S]*overflow-y: auto;/);
  assert.match(sentenceBuilder, /grid-template-columns: 22px auto minmax\(64px, 1fr\) auto minmax\(64px, 1fr\) auto minmax\(64px, 1fr\) auto/);
  assert.match(sentenceBuilder, /class="challenge-phrase">jumped out of a/);
  assert.match(sentenceBuilder, /class="challenge-phrase">and ate a/);
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
