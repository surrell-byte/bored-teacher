const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Know It All offers Chinese and Thai help through the shared game navbar', () => {
  const component = read('games/know-it-all/KnowItAll.jsx');
  const route = read('app/games/[game]/page.tsx');
  const shell = read('engine/layout/GameShell.tsx');
  const chineseTranslations = component.split('const QUESTION_TRANSLATIONS = [')[1].split('\n];')[0];
  const thaiTranslations = component.split('const THAI_QUESTION_TRANSLATIONS = [')[1].split('\n];')[0];

  assert.equal((chineseTranslations.match(/\{ question:/g) || []).length, 25);
  assert.equal((thaiTranslations.match(/\{ question:/g) || []).length, 25);
  assert.match(component, /useGameTranslation\(\)/);
  assert.match(component, /helpLanguage === "th" \? THAI_QUESTION_TRANSLATIONS : QUESTION_TRANSLATIONS/);
  assert.match(component, /lang=\{translationLang\}/);
  assert.match(shell, /Choose game help language/);
  assert.match(shell, /<GameTranslationProvider value=\{\{ language: helpLanguage, setLanguage: changeHelpLanguage \}\}>/);
  assert.match(shell, /localStorage\.getItem\('gameHelpLanguage'\)/);
  assert.match(shell, /localStorage\.setItem\('gameHelpLanguage', language\)/);
  assert.match(shell, /<option value="zh-CN">\{shellOption\('Chinese 🇨🇳'\)\}<\/option>/);
  assert.match(shell, /<option value="th">\{shellOption\('Thai 🇹🇭'\)\}<\/option>/);
  assert.doesNotMatch(route, /knowItAllHelpLanguage|knowItAllHelpControl|Choose Know It All help language/);
});

test('The shared help selector translates game-shell controls and Know It All setup guidance', () => {
  const component = read('games/know-it-all/KnowItAll.jsx');
  const context = read('engine/layout/GameTranslationContext.tsx');
  const shell = read('engine/layout/GameShell.tsx');

  assert.match(context, /export function GameHelpText/);
  assert.match(context, /25 Amazing Facts/);
  assert.match(context, /1 point per correct answer/);
  assert.match(shell, /shellLabel\(paused \? 'Resume' : 'Pause'\)/);
  assert.match(shell, /shellLabel\(isFullscreen \? 'Exit full screen' : 'Full screen'\)/);
  assert.match(component, /<GameHelpText english="Who’s taking the challenge\?" \/>/);
  assert.match(component, /<GameHelpText english="How to Play 25 Amazing Facts" as="span" \/>/);
  assert.match(component, /<GameHelpText english="Continue to main menu →" \/>/);
  assert.match(component, /<GameHelpText english="Check answer" \/>/);
  assert.match(component, /<GameHelpText english=\{current === total - 1 \? "See my results →" : "Next question →"\} \/>/);
  assert.match(component, /\.kq-root\[data-screen="how-to"\] \.app \{\s*min-height: calc\(100vh - 72px\);\s*align-content: center;/);
  assert.match(component, /\.kq-root\[data-screen="start"\] \.app \{\s*min-height: calc\(100vh - 72px\);\s*align-content: center;/);
  assert.match(component, /\.kq-root\[data-screen="quiz"\] \{\s*background-image: url\("\/assets\/games\/know-it-all\/know-it-all-game-bg\.webp"\);\s*background-attachment: fixed;/);
  assert.match(component, /const activeVisual = answered \? visual\.answer : visual\.question/);
});

test('Know It All splits questions from context art and switches to the answer image after checking', () => {
  const component = read('games/know-it-all/KnowItAll.jsx');
  const questions = component.split('const QUESTIONS = [')[1].split('\n];')[0];
  const visuals = component.split('const QUESTION_VISUALS = [')[1].split('\n];')[0];
  const imageSources = [...visuals.matchAll(/src: "([^"]+)"/g)].map(([, src]) => src);

  assert.equal((questions.match(/\{ category:/g) || []).length, 25);
  assert.equal((visuals.match(/\bquestion: \{/g) || []).length, 25);
  assert.equal((visuals.match(/\banswer: \{/g) || []).length, 25);
  assert.equal(imageSources.length, 50);
  imageSources.forEach(src => assert.ok(fs.existsSync(path.join(root, 'public', src.slice(1))), src));
  assert.match(component, /const visual = QUESTION_VISUALS\[current\]/);
  assert.match(component, /const activeVisual = answered \? visual\.answer : visual\.question/);
  assert.match(component, /aria-label=\{answered \? "Answer context image" : "Question context image"\}/);
  assert.match(component, /src=\{activeVisual\.src\}/);
  assert.match(component, /alt=\{activeVisual\.alt\}/);
  assert.match(component, /\.question-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.1fr\)\s+minmax\(280px,\s*0\.9fr\)/);
  assert.match(component, /\.question-content/);
  assert.match(component, /\.question-layout > \.question-visual \{ grid-column: 2; grid-row: 1; \}/);
  assert.match(component, /@media \(max-width: 760px\) and \(orientation: portrait\)[\s\S]*?\.question-content \{\s*display: contents;/);
  assert.match(component, /function createOptionOrders\(\)/);
  assert.match(component, /setOptionOrders\(createOptionOrders\(\)\)/);
  assert.match(component, /const selectedOption = selected === null \? null : optionOrders\[current\]\[selected\]/);
  assert.match(component, /const originalIndex = optionOrders\[current\]\[index\]/);
  assert.doesNotMatch(component, /<header className="topline">/);
  assert.match(visuals, /nile-question\.webp/);
  assert.match(visuals, /nile-answer\.webp/);
});

test('player badge, playtime tracking, and Emoji Spelling HUD use persistent profile data', () => {
  const constants = read('constants/index.ts');
  const provider = read('providers/GameProvider.tsx');
  const firebase = read('lib/firebase.ts');
  const appShell = read('components/AppShell.tsx');
  const trophy = read('app/trophy/page.tsx');
  const trophyStyles = read('app/trophy/trophy.css');
  const emojiGame = read('games/emoji-spelling-game/EmojiSpellingMaster.jsx');
  const styles = read('app/globals.css');
  const rules = read('firestore.rules');
  const profile = read('app/profile/page.tsx');
  const coverStyle = read('lib/use-cover-art-style.ts');

  assert.match(constants, /DEFAULT_PLAYER_AVATAR = '\/assets\/images\/avatars\/astro-explorer-avatar\.svg'/);
  assert.ok(fs.existsSync(path.join(root, 'public/assets/images/avatars/astro-explorer-avatar.svg')));
  assert.match(provider, /totalPlaySeconds: number/);
  assert.match(provider, /joinedAt: string/);
  assert.match(provider, /Math\.max\(local\.totalPlaySeconds \|\| 0, remote\.totalPlaySeconds \|\| 0\)/);
  assert.match(provider, /addUserPlayTime\(uid, wholeSeconds\)/);
  assert.match(firebase, /totalPlaySeconds: increment\(seconds\)/);
  assert.match(appShell, /pathname\.startsWith\('\/games\/'\)/);
  assert.match(appShell, /document\.visibilityState === 'visible'/);
  assert.match(appShell, /visibilitychange/);
  assert.match(trophy, /level <= 5\) return \{ name: 'Bronze'/);
  assert.match(trophy, /level <= 10\) return \{ name: 'Silver'/);
  assert.match(trophy, /level <= 15\) return \{ name: 'Gold'/);
  assert.match(trophy, /level <= 20\) return \{ name: 'Platinum'/);
  assert.match(trophy, /name: 'Diamond'/);
  assert.match(trophy, /Joined/);
  assert.match(trophy, /Game time/);
  assert.match(trophy, /Change avatar/);
  assert.match(trophyStyles, /\.trophy-player-badge--silver/);
  assert.match(trophyStyles, /\.trophy-player-badge--gold/);
  assert.match(trophyStyles, /\.trophy-player-badge--diamond/);
  assert.match(emojiGame, /PlayerAvatar value=\{player\.avatar\}/);
  assert.match(emojiGame, /\{playerName\}/);
  assert.doesNotMatch(emojiGame, /level\.toUpperCase\(\)/);
  assert.match(profile, /DEFAULT_PLAYER_AVATAR/);
  assert.match(rules, /'totalPlaySeconds'/);
  assert.match(styles, /emoji-spelling-welcome-bg\.webp'\) center \/ cover no-repeat/);
  assert.match(coverStyle, /Math\.max\(width, height \* aspectRatio\)/);
  assert.match(coverStyle, /ResizeObserver/);
  assert.match(emojiGame, /useCoverArtStyle\(menuStageRef, 1672 \/ 941, 941 \/ 1672/);
  assert.match(styles, /\.emoji-spelling-welcome-art \{[^}]*width: max\(100%, calc\(\(100svh - 61px\) \* 1\.777\)\)/);
  assert.match(styles, /\.esm-menu-controls \{[^}]*width: 100%; height: 100%/);
  assert.match(styles, /emoji-spelling-welcome-art \{ width: max\(100%, calc\(\(100svh - 61px\) \* 0\.563\)\)/);
  assert.match(styles, /emoji-spelling-welcome-bg-phone\.webp/);
});

test('Know It All uses stage backgrounds and portrait-specific artwork', () => {
  const component = read('games/know-it-all/KnowItAll.jsx');
  const route = read('app/games/[game]/page.tsx');
  const catalog = read('games/catalog.data.ts');
  const styles = read('app/globals.css');
  const gameEntry = catalog.split('knowitall: {')[1].split('\n  },')[0];
  const referencedAssets = [
    ...component.matchAll(/url\(["'](\/assets\/games\/know-it-all\/[^"')]+)["']\)/g),
    ...styles.matchAll(/url\(["'](\/assets\/games\/know-it-all\/[^"')]+)["']\)/g),
  ].map(([, src]) => src);

  assert.match(gameEntry, /cover: "\/assets\/covers\/know-it-all-cover\.webp"/);
  assert.ok(fs.existsSync(path.join(root, 'public/assets/covers/know-it-all-cover.webp')));
  assert.match(component, /data-screen=\{screen\}/);
  assert.match(component, /data-screen="player-info"\][^{]*\{[^}]*know-it-all-user-input-bg\.webp/);
  assert.match(component, /data-screen="start"\][^{]*\{[^}]*know-it-all-main-menu-bg\.webp/);
  assert.match(component, /data-screen="quiz"\][^{]*\{[^}]*know-it-all-game-bg\.webp/);
  assert.match(component, /data-screen="result"\][^{]*\{[^}]*know-it-all-victory-bg\.webp/);
  assert.match(component, /@media \(max-width: 760px\) and \(orientation: portrait\)/);
  assert.match(component, /\.question-layout > \.question-visual \{\s*grid-column: 2;\s*grid-row: 1;/);
  assert.match(component, /\.question-content \{\s*display: contents;/);
  assert.match(component, /\.question-intro \{\s*grid-row: 1;/);
  assert.match(component, /\.question-answers \{\s*grid-row: 3;/);
  assert.match(route, /know-it-all-route-welcome/);
  assert.match(route, /className="know-it-all-welcome-start"/);
  assert.match(route, /aria-label="Start Know It All"/);
  assert.match(styles, /know-it-all-route-welcome \{[^}]*background: url\('\/assets\/games\/know-it-all\/know-it-all-welcome-bg\.webp'\)/);
  assert.match(styles, /know-it-all-welcome-phone-bg\.webp/);
  referencedAssets.forEach(src => assert.ok(fs.existsSync(path.join(root, 'public', src.slice(1))), src));
});

test('Know It All presents player setup, menu, quiz, and results on its game page', () => {
  const component = read('games/know-it-all/KnowItAll.jsx');
  const route = read('app/games/[game]/page.tsx');

  assert.match(component, /const \[screen, setScreen\] = useState\("player-info"\)/);
  assert.match(component, /id="know-it-all-player-name"/);
  assert.match(component, /if \(playerName\.trim\(\)\) setScreen\("how-to"\)/);
  assert.match(component, /screen === "how-to"/);
  assert.match(component, /setScreen\("start"\)/);
  assert.match(component, /screen === "start"/);
  assert.match(component, /\{screen === "how-to" && \(\s*<section className="hero">/);
  assert.match(component, /\.kq-root\[data-screen="how-to"\] \{\s*background-image: url\("\/assets\/games\/know-it-all\/know-it-all-main-menu-bg\.webp"\)/);
  assert.match(component, /\.kq-root\[data-screen="player-info"\] \.app \{\s*min-height: calc\(100vh - 72px\);\s*align-content: center;/);
  assert.match(component, /screen === "quiz"/);
  assert.match(component, /screen === "result"/);
  assert.match(route, /const profileName = auth\?\.currentUser/);
  assert.match(route, /profileName=\{profileName\}/);
});

test('Quiz backgrounds stay fixed while answer feedback changes game content', () => {
  const sportsStyles = read('games/emoji-sports-quiz/EmojiSportsQuiz.css');
  const generalKnowledgeStyles = read('games/general-knowledge-quiz/general-knowledge-quiz.css');
  const sportsQuiz = read('games/emoji-sports-quiz/EmojiSportsQuiz.jsx');
  const generalKnowledgeQuiz = read('games/general-knowledge-quiz/GeneralKnowledgeQuiz.jsx');

  for (const mode of ['modes', 'emoji', 'spell', 'sentence']) {
    assert.match(sportsStyles, new RegExp(`\\.emoji-sports-page-${mode} \\{[^}]*background-attachment: fixed;`));
  }
  assert.match(generalKnowledgeStyles, /\.gk-quiz\.is-play\{[^}]*background-attachment:fixed/);
  assert.match(sportsQuiz, /setAnswered\(true\)/);
  assert.match(generalKnowledgeQuiz, /setLocked\(true\)/);
});

test('Know It All is featured on the hub and games catalogue', () => {
  const constants = read('constants/index.ts');
  const hub = read('app/hub/page.tsx');
  const games = read('app/games/page.tsx');

  assert.match(constants, /'knowitall',/);
  assert.match(hub, /FEATURED_GAME_IDS\.filter/);
  assert.match(games, /FEATURED_GAME_IDS\.filter/);
});

test('Colour Tunes uses its new stage backgrounds and cover without a Colour Clash menu title', () => {
  const component = read('games/colour-clash/ColourClash.jsx');
  const catalog = read('games/catalog.data.ts');
  const gameRoute = read('app/games/[game]/page.tsx');
  const styles = read('app/globals.css');
  const rootDir = path.join(root, 'public');
  const menu = component.split('if (screen === "menu")')[1].split('if (phase === "gameover")')[0];

  assert.match(catalog.split('colourclash: {')[1].split('\n  },')[0], /cover: "\/assets\/covers\/colour-tunes-cover\.webp"/);
  assert.ok(fs.existsSync(path.join(rootDir, 'assets/covers/colour-tunes-cover.webp')));
  assert.ok(fs.existsSync(path.join(rootDir, 'assets/games/colour-clash/colour-tunes-general-bg.webp')));
  assert.ok(fs.existsSync(path.join(rootDir, 'assets/games/colour-clash/colour-tunes-welcome-bg.webp')));
  assert.match(component, /colour-tunes-general-bg\.webp/);
  assert.doesNotMatch(menu, /COLOUR CLASH/);
  assert.match(gameRoute, /isColourClash \? \([\s\S]*?colour-tunes-route-welcome/);
  assert.match(styles, /game-shell--colourclash \.route-game-welcome\.colour-tunes-route-welcome \{[^}]*background: url\('\/assets\/games\/colour-clash\/colour-tunes-welcome-bg\.webp'\)/);
});

test('Toast notifications use opaque game-accent surfaces for readable contrast', () => {
  const appShell = read('components/AppShell.tsx');
  const styles = read('app/globals.css');

  assert.match(appShell, /GAME_BAR_COLOR\[gameId\]/);
  assert.match(appShell, /'--game-toast-accent'/);
  assert.match(styles, /\.toast \{[\s\S]*?background: #182438;/);
  assert.match(styles, /\.achievement-toast \{[\s\S]*?background: #182438;/);
  assert.match(styles, /\.achievement-toast--game \{[\s\S]*?background: color-mix\(in srgb, var\(--game-toast-accent, #475569\) 28%, #111827\)/);
  assert.match(styles, /\.game-route-wrap \.toast \{[\s\S]*?color: #fff;/);
});

test('Reading Rescue provides Chinese and Thai story translations but not in Find the Letter', () => {
  const component = read('games/finn-the-fox/ReadingRescue.jsx');
  const translations = read('games/finn-the-fox/readingRescueTranslations.js');
  const chinese = translations.split("'zh-CN': {")[1].split('  },\n  th: {')[0];
  const thai = translations.split('  th: {')[1].split('\n  },\n};')[0];

  assert.equal((chinese.match(/\{ title: '/g) || []).length, 33);
  assert.equal((thai.match(/\{ title: '/g) || []).length, 33);
  assert.match(component, /paginateStoryPages\(sourcePages, level\)/);
  assert.match(component, /paginateStoryPages\(story\.pages, level\)/);
  assert.match(component, /if \(phase === 'story'\)[\s\S]*ff-translation-controls/);
  assert.match(component, /READING_RESCUE_TRANSLATIONS\[storyLanguage\]\[level\]\[currentPage\.translationIndex\]/);
  assert.match(component, /className="ff-story-translation" lang=\{storyLanguage\}/);
  assert.match(component, /if \(phase === 'letter-game'\)[\s\S]*<FindTheLetter/);
});

test('Hub and games pages advertise the four newest catalog additions dynamically', () => {
  const catalog = read('games/catalog.data.ts');
  const hub = read('app/hub/page.tsx');
  const games = read('app/games/page.tsx');

  assert.match(catalog, /GAME_KEYS\.filter\(\(id\) => available\.has\(id\)\)\.slice\(-4\)\.reverse\(\)/);
  assert.match(hub, /getLatestGameKeys\(visibleGameIds\)/);
  assert.match(games, /getLatestGameKeys\(availableGameIds\)/);
  assert.match(games, /new Map\(\[\.\.\.GAME_KEYS\]\.reverse\(\)\.map/);
});

test('game menu ellipsis is centered inside its square navbar control', () => {
  const styles = read('app/globals.css');

  assert.match(styles, /\.game-shell \.game-header-actions \.game-shell-mobile-menu-toggle\s*\{[^}]*justify-content:\s*center;[^}]*align-items:\s*center;[^}]*padding:\s*0;/);
  assert.match(styles, /\.game-shell \.game-header-actions \.game-shell-mobile-menu-toggle > span\s*\{[^}]*line-height:\s*1;/);
});

test('account name is the default Player 1 name for games with name setup', () => {
  const consumers = [
    ['games/alphabet-hunt/AlphabetHunt.jsx', /useState\(profileName \|\| ''\)/],
    ['games/bowling-battle/BowlingBattle.jsx', /useState\(\[profileName, ""\]\)/],
    ['games/build-tower/BuildTower.jsx', /useState\(profileName \|\| ''\)/],
    ['games/colour-clash-2/ColourClash2.jsx', /n1: profileName/],
    ['games/connect-4/Connect4.jsx', /useState\(profileName \|\| "Crimson"\)/],
    ['games/farm-game/FarmGame.jsx', /nameInput\.value = profileName/],
    ['games/find-my-food/FindMyFood.jsx', /name: profileName \|\| "Player 1"/],
    ['games/find-the-word/FindTheWord.jsx', /name: profileName/],
    ['games/finn-the-fox/ReadingRescue.jsx', /useState\(profileName \|\| ''\)/],
    ['games/flagmaster/Flagmaster.jsx', /useState\(profileName\)/],
    ['games/general-knowledge-quiz/GeneralKnowledgeQuiz.jsx', /useState\(profileName \|\| ""\)/],
    ['games/grammar-hoop-slam/GrammarHoopSlam.jsx', /useState\(profileName\)/],
    ['games/lakers-showtime-racer/LakersShowtimeRacer.jsx', /profileName \|\| "Player 1"/],
    ['games/math-racing/MathRacing.jsx', /useState\(profileName \|\| ''\)/],
    ['games/money-blocks/MoneyBlocks.jsx', /1: profileName/],
    ['games/parachute-drop/ParachuteDrop.jsx', /name: profileName \|\| 'Leo'/],
    ['games/shuttlecock-smash/ShuttlecockSmash.jsx', /useState\(profileName\)/],
    ['games/tile-battle/TileBattle.jsx', /profileName \|\| "Player 1"/],
    ['games/tictacroll/TicTacRoll.tsx', /name: profileName \|\| "Player"/],
    ['games/turbo-dash/TurboDash.jsx', /useState\(\[profileName, ''\]\)/],
    ['games/unicorn-run/UnicornRun.jsx', /useState\(profileName\)/],
    ['games/victory-vet/VictoryVet.jsx', /useState\(profileName \|\| ""\)/],
    ['games/volcano-racer/VolcanoRacer.jsx', /useState\(\[profileName, ''\]\)/],
    ['games/w-grand-prix/WGrandPrix.jsx', /profileName \|\| 'Driver 1'/],
    ['games/word-fusion/WordFusion.jsx', /containerRef\.current\?\.querySelector\('#playerNameInput'\)[\s\S]*nameInput\.value = profileName/],
  ];

  consumers.forEach(([file, pattern]) => assert.match(read(file), pattern, file));
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

test('Emoji Spelling uses its stage artwork with portrait-specific phone backgrounds', () => {
  const component = read('games/emoji-spelling-game/EmojiSpellingMaster.jsx');
  const gameRoute = read('app/games/[game]/page.tsx');
  const styles = read('app/globals.css');
  const assetPaths = [
    'emoji-spelling-welcome-bg.webp',
    'emoji-spelling-welcome-bg-phone.webp',
    'emoji-spelling-main-menu-bg.webp',
    'emoji-spelling-main-menu-phone-bg.webp',
    'emoji-spelling-general-bg.webp',
    'emoji-spelling-general-bg-phone.webp',
  ];

  for (const asset of assetPaths) {
    const publicPath = `/assets/games/emoji-spelling-game/${asset}`;
    assert.ok(fs.existsSync(path.join(root, 'public', publicPath.slice(1))), `${asset} exists`);
    assert.ok(gameRoute.includes(publicPath), `${asset} is preloaded`);
  }

  assert.doesNotMatch(gameRoute.split('const GAMES_WITH_WELCOME = new Set([')[1].split(']);')[0], /'emojispelling'/);
  assert.match(gameRoute, /emoji-spelling-route-welcome[\s\S]*?aria-label="Start Emoji Spelling"/);
  assert.match(component, /className="esm-screen esm-screen--menu" data-screen="menu"/);
  assert.match(component, /className="esm-screen esm-screen--player-info" data-screen="player-info"/);
  assert.match(component, /className="esm-screen esm-screen--game" data-screen="game"/);
  assert.match(component, /className="esm-screen esm-screen--over" data-screen="over"/);
  assert.match(component, /setState\(\{ name, avatar: avatarInput \}\)/);
  assert.match(component, /PLAYER_AVATARS\.map\(avatar =>/);
  assert.match(component, /window\.addEventListener\("emoji-spelling:main-menu", showMainMenu\)/);
  assert.match(gameRoute, /gameId === 'emojispelling'[\s\S]*?setEmojiSpellingStartAtMenu\(true\)[\s\S]*?emoji-spelling:main-menu/);
  assert.match(gameRoute, /emojiSpellingStartAtMenu/);
  assert.match(component, /aria-pressed=\{menuLevel === lvl\}/);
  assert.match(component, /className=\{`esm-card\$\{feedback === "correct" \? " is-correct" : feedback === "wrong" \? " is-wrong" : ""\}`\}/);
  assert.match(component, /function getMissingChoices\(word, index\) \{[\s\S]*?shuffle\(\[answer, \.\.\.distractors\]\)/);
  assert.match(component, /setMissingChoices\(getMissingChoices\(qs\[0\]\.word, missingIndex\)\)/);
  assert.match(component, /setMissingChoices\(getMissingChoices\(questions\[nextIdx\]\.word, missingIndex\)\)/);
  assert.match(component, /className="esm-answer-grid esm-answer-grid--missing"/);
  assert.match(component, /className="esm-answer-grid esm-answer-grid--letters"/);
  assert.doesNotMatch(component, /shuffle\(\[current\.word\[missing\.index\]/);
  assert.match(styles, /\.game-shell--emojispelling \.route-game-welcome\.emoji-spelling-route-welcome[^}]*emoji-spelling-welcome-bg\.webp/);
  assert.match(styles, /\.esm-screen--menu \{[^}]*emoji-spelling-main-menu-bg\.webp/);
  assert.match(styles, /\.esm-screen--game, \.esm-screen--over, \.esm-screen--player-info \{[^}]*emoji-spelling-general-bg\.webp/);
  assert.match(styles, /\.esm-screen--game, \.esm-screen--over, \.esm-screen--player-info \{[^}]*emoji-spelling-general-bg-phone\.webp/);
  assert.match(styles, /\.esm-player-setup \{[^}]*background: rgb\(20 24 110 \/ 88%\)/);
  assert.match(styles, /\.esm-card\.is-correct \{[^}]*border-color: #22c55e;[^}]*box-shadow: 0 0 24px rgba\(34, 197, 94, 0\.16\);/);
  assert.match(styles, /\.esm-card\.is-wrong \{[^}]*border-color: #ef4444;[^}]*box-shadow: 0 0 24px rgba\(239, 68, 68, 0\.16\);/);
  assert.match(styles, /\.esm-card \{[^}]*background: rgb\(20 24 110 \/ 88%\)/);
  assert.match(styles, /\.esm-answer-grid \{[^}]*display: grid/);
  assert.match(styles, /\.esm-answer-grid button \{ aspect-ratio: 1; \}/);
  assert.match(styles, /\.esm-answer-grid--missing \{ grid-template-columns: repeat\(5, minmax\(0, 58px\)\); \}/);
  assert.match(styles, /\.esm-answer-grid--letters \{ grid-template-columns: repeat\(4, minmax\(0, 60px\)\); \}/);
  assert.match(styles, /\.esm-answer-grid button:active:not\(:disabled\)[^}]*transform: translateY\(2px\)/);
  assert.match(styles, /@media \(max-width: 420px\)[\s\S]*?\.esm-answer-grid--missing \{ grid-template-columns: repeat\(5, minmax\(0, 1fr\)\); \}/);
  assert.match(styles, /@media \(max-width: 760px\) and \(orientation: portrait\)[\s\S]*emoji-spelling-welcome-bg-phone\.webp[\s\S]*emoji-spelling-main-menu-phone-bg\.webp[\s\S]*emoji-spelling-general-bg-phone\.webp/);
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

test('Money Blocks keeps account cards in its shell viewport and centers responsive flip content', () => {
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
  assert.match(styles, /\.reveal-face\.back \{[\s\S]*align-items: center;[\s\S]*text-align: center/);
  assert.match(styles, /\.reveal-symbol \{ flex: 0 0 auto; max-width: 100%; font-size: 2\.15em/);
  assert.match(styles, /\.reveal-preview \{ width: 100%; max-height: 5em; overflow: hidden;[\s\S]*text-align: center/);
  assert.match(styles, /\.reveal-overlay\.centered \{[\s\S]*width: clamp\(240px, 36vmin, 400px\);[\s\S]*font-size: clamp\(24px, 3vmin, 38px\)/);
  assert.match(styles, /@media \(max-width: 600px\) \{[\s\S]*\.reveal-overlay\.centered \{[\s\S]*width: min\(84vw, 360px\);[\s\S]*height: min\(46vh, 380px\)/);
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

test('Colour Tunes start target, menu controls, and sequence counter stay usable', () => {
  const styles = read('app/globals.css');
  const component = read('games/colour-clash/ColourClash.jsx');

  assert.match(styles, /\.colour-tunes-welcome-start \{[^}]*top: 42%;[^}]*left: 50%;[^}]*width: min\(24vw, 280px\)/);
  assert.match(styles, /@media \(max-width: 760px\)\s*\{\s*\.colour-tunes-welcome-start \{ width: min\(62vw, 280px\); \}/);
  assert.match(component, /fontSize:"5rem"/);
  assert.match(component, /padding:"24px 30px"/);
  assert.match(component, /padding:"24px 68px"/);
  assert.match(component, /const firstIncorrectIndex = playerSeq\.findIndex\(\(colour, index\) => colour !== sequence\[index\]\)/);
  assert.match(component, /const sequenceProgress = phase === "showing"[\s\S]*?firstIncorrectIndex === -1[\s\S]*?firstIncorrectIndex/);
  assert.match(component, /Sequence \{sequenceProgress\}\/\{sequenceLength\}/);
});

test('Hub avatar is enlarged and public reviews require an attributed profile', () => {
  const hub = read('app/hub/page.tsx');
  const firebase = read('lib/firebase.ts');
  const reviewPanel = read('components/reviews/ReviewPanel.tsx');

  assert.match(hub, /<ProfileAvatar value=\{state\.avatar\} size=\{56\} className="hub-welcome-avatar" \/>/);
  assert.match(firebase, /export function hasPublicReviewIdentity/);
  assert.match(firebase, /review\.userId\?\.trim\(\)/);
  assert.match(firebase, /letterCount >= 2/);
  assert.match(firebase, /!\\?\['explorer', 'guest', 'creator'\]\.includes\(normalizedName\)/);
  assert.match(firebase, /\.filter\(item => Number\(item\.rating\) >= 4 && hasPublicReviewIdentity\(item\)\)/);
  assert.match(reviewPanel, /hasPublicReviewIdentity\(reviewer\)/);
  assert.match(reviewPanel, /No verified reviews yet\./);
  assert.match(reviewPanel, /<ProfileAvatar value=\{review\.avatar \?\? ''\} size=\{34\} alt="" className="hub-review-avatar" \/>/);
  assert.match(reviewPanel, /<strong>\{review\.userName\}<\/strong>/);
});

test('Hub restores the four original fallback reviews when there are no eligible public reviews', () => {
  const firebase = read('lib/firebase.ts');
  const fallbackReviews = firebase.slice(firebase.indexOf('const FALLBACK_REVIEWS:'), firebase.indexOf('export function hasPublicReviewIdentity'));
  const reviewLoader = firebase.slice(firebase.indexOf('export async function loadReviews()'), firebase.indexOf('export async function loadNotificationsForCreator()'));

  assert.match(fallbackReviews, /userName: 'Mina'.*comment: 'The new learning path feels calm, joyful, and classroom friendly\.'/);
  assert.match(fallbackReviews, /userName: 'Kai'.*comment: 'Loved the game choices and the helpful classroom flow\.'/);
  assert.match(fallbackReviews, /userName: 'Ari'.*comment: 'The activities are bright, easy to understand, and fun to revisit\.'/);
  assert.match(fallbackReviews, /userName: 'Sam'.*comment: 'A thoughtful learning space with games children actually want to play\.'/);
  assert.match(reviewLoader, /if \(!db\) return FALLBACK_REVIEWS/);
  assert.match(reviewLoader, /FALLBACK_REVIEWS\.filter\(fallback => !items\.some\(item => item\.comment === fallback\.comment\)\)/);
  assert.match(reviewLoader, /\.slice\(0, 4\)/);
  assert.match(reviewLoader, /\.filter\(item => Number\(item\.rating\) >= 4 && hasPublicReviewIdentity\(item\)\)/);
});

test('Hub reviews require creator approval before public display', () => {
  const firebase = read('lib/firebase.ts');
  const reviewPanel = read('components/reviews/ReviewPanel.tsx');
  const approvalPage = read('app/admin/reviews/page.tsx');
  const creatorPage = read('app/admin/page.tsx');
  const rules = read('firestore.rules');
  const submitter = firebase.slice(firebase.indexOf('export async function submitReview('), firebase.indexOf('export async function loadReviews()'));
  const reviewLoader = firebase.slice(firebase.indexOf('export async function loadReviews()'), firebase.indexOf('function reviewCreatedAt('));
  const reviewRules = rules.slice(rules.indexOf('match /reviews/{reviewId}'), rules.indexOf('match /notifications/{notificationId}'));

  assert.match(submitter, /approvalStatus: 'pending'/);
  assert.match(submitter, /approvedBy: null/);
  assert.match(submitter, /approvedAt: null/);
  assert.match(reviewLoader, /where\('approvalStatus', '==', 'approved'\)/);
  assert.match(reviewPanel, /It will appear on the hub after creator approval/);
  assert.match(reviewPanel, /Reviews are published after approval by the creator account/);
  assert.match(approvalPage, /loadPendingReviewsForCreator/);
  assert.match(approvalPage, /setReviewApproval\(review\.id, approvalStatus\)/);
  assert.match(approvalPage, /'approved'/);
  assert.match(approvalPage, /'rejected'/);
  assert.match(creatorPage, /href: '\/admin\/reviews'.*Review approvals/);
  assert.match(reviewRules, /allow read: if isCreator\(\) \|\| resource\.data\.approvalStatus == 'approved'/);
  assert.match(reviewRules, /request\.resource\.data\.approvalStatus == 'pending'/);
  assert.match(reviewRules, /allow update: if isCreator\(\)/);
  assert.match(reviewRules, /request\.resource\.data\.approvalStatus in \['approved', 'rejected'\]/);
});

test('Service worker never caches Next.js chunks and clears stale runtime caches in development', () => {
  const serviceWorker = read('public/sw.js');
  const registration = read('components/ServiceWorkerRegistration.tsx');

  assert.match(serviceWorker, /const CACHE_NAME = 'bored-teacher-runtime-v4'/);
  assert.match(serviceWorker, /if \(!isPublicAsset\) return/);
  assert.doesNotMatch(serviceWorker, /_next\/static/);
  assert.match(registration, /process\.env\.NODE_ENV !== 'production'/);
  assert.match(registration, /registration\.unregister\(\)/);
  assert.match(registration, /name\.startsWith\('bored-teacher-runtime-'\)/);
  assert.match(registration, /updateViaCache: 'none'/);
});

test('Profile editing opens the dedicated page and centers the avatar glyph', () => {
  const navbar = read('components/Navbar.tsx');
  const profileAvatar = read('components/profile/ProfileAvatar.tsx');
  const profilePage = read('app/profile/page.tsx');

  assert.match(navbar, /<Link\s+className="dropdown-item"\s+role="menuitem"\s+href="\/profile"/);
  assert.match(navbar, /<Link href="\/profile" className="mobile-nav-item"/);
  assert.doesNotMatch(navbar, /ProfileModal|setShowProfile\(|showProfile &&/);
  assert.match(profileAvatar, /display: 'inline-grid', placeItems: 'center'/);
  assert.match(profilePage, /className="profile-preview-avatar"/);
  assert.match(profilePage, /profile-avatar-option\$\{/);
});

test('Word Quest is registered and reports its completed three-round score', () => {
  const component = read('games/word-quest/WordQuest.jsx');
  const catalog = read('games/catalog.data.ts');
  const registry = read('games/catalog.components.tsx');

  assert.match(catalog, /wordquest:\s*\{[\s\S]*?name: "Word Quest"[\s\S]*?hasComponent: true,[\s\S]*?isNew: true/);
  assert.match(registry, /wordquest: lazyGame\('wordquest', \(\) => import\('@\/games\/word-quest\/WordQuest\.jsx'\)\)/);
  assert.match(component, /const MULTIPLE_CHOICE = \[/);
  assert.match(component, /const UNSCRAMBLE = \[/);
  assert.match(component, /const STORY = \{/);
  assert.match(component, /onComplete\?\.\(total, Math\.round\(\(total \/ 15\) \* 100\)\)/);
  assert.match(component, /if \(!completedRef\.current\)/);
  assert.match(component, /Play again/);
});

test('Quick Fire is registered with topic selection, streak scoring, and a timed round', () => {
  const component = read('games/quick-fire/QuickFire.jsx');
  const questions = JSON.parse(read('games/quick-fire/questions.json'));
  const styles = read('games/quick-fire/quick-fire.css');
  const catalog = read('games/catalog.data.ts');
  const registry = read('games/catalog.components.tsx');
  const themes = read('games/tictacroll/themes.ts');

  assert.match(catalog, /quickfirequiz:\s*\{[\s\S]*?name: "Quick Fire"[\s\S]*?hasComponent: true/);
  assert.match(registry, /quickfirequiz: lazyGame\('quickfirequiz', \(\) => import\('@\/games\/quick-fire\/QuickFire\.jsx'\)\)/);
  assert.match(component, /const ROUND_SECONDS = 30/);
  assert.match(component, /const POINTS_PER_CORRECT = 10/);
  assert.match(component, /import QUESTIONS from "\.\/questions\.json"/);
  assert.equal(Object.keys(questions).length, 5);
  assert.equal(Object.values(questions).reduce((total, topicQuestions) => total + topicQuestions.length, 0), 200);
  for (const topicQuestions of Object.values(questions)) {
    for (const question of topicQuestions) {
      assert.equal(question.options.length, 4);
      assert.ok(question.options.includes(question.answer));
    }
  }
  assert.match(component, /const STREAK_BONUS_INTERVAL = 3/);
  assert.match(component, /const STREAK_BONUS_POINTS = 5/);
  assert.match(component, /const TOPICS = \["Mixed", "General Knowledge", "Science", "Nature", "English", "Sports"\]/);
  assert.match(component, /aria-pressed=\{topic === item\}/);
  assert.match(component, /className="qf-timer-card"/);
  assert.match(component, /className="qf-panel qf-results-panel"/);
  assert.match(component, /onComplete\?\.\(score, accuracy\)/);
  assert.match(component, /if \(completedRef\.current\) return/);
  assert.doesNotMatch(component, /FAST THINKING\. BIG LEARNING|30-SECOND QUIZ/);
  assert.match(component, /useState\("players"\)/);
  assert.match(component, /Player 1 name/);
  assert.match(component, /Player 2 name/);
  assert.match(component, /createDistinctQuestionDecks\(questions\)/);
  assert.match(component, /setPhase\("handoff"\)/);
  assert.match(component, /setPhase\("tiebreak"\)/);
  assert.match(component, /Math\.floor\(Math\.random\(\) \* 6\) \+ 1/);
  assert.match(component, /const THEME_OPTIONS = \["kalahari", "dice", "night"\]/);
  assert.match(themes, /id: "night", name: "Desert Night"/);
  assert.doesNotMatch(styles, /\.qf-footer/);
  assert.match(styles, /\.qf-theme-grid/);
});

test('Quick Fire battle question decks never share prompts between players', async () => {
  const deckModule = await import('../games/quick-fire/question-decks.js');
  const { createDistinctQuestionDecks } = deckModule.default;
  const questions = Array.from({ length: 10 }, (_, index) => ({ question: `Question ${index}` }));
  const [playerOne, playerTwo] = createDistinctQuestionDecks(questions, () => 0.25);
  const playerOneQuestions = new Set(playerOne.map((question) => question.question));
  const playerTwoQuestions = new Set(playerTwo.map((question) => question.question));

  assert.equal(playerOne.length, 5);
  assert.equal(playerTwo.length, 5);
  assert.equal([...playerOneQuestions].filter((question) => playerTwoQuestions.has(question)).length, 0);
  assert.equal(new Set([...playerOneQuestions, ...playerTwoQuestions]).size, questions.length);
});

test('Da Rules links its cover and offers visible Chinese, Thai, and Spanish translation', () => {
  const page = read('app/games/da-rules/page.tsx');
  const gamesPage = read('app/games/page.tsx');
  const styles = read('app/globals.css');

  assert.match(page, /id="da-rules-language"/);
  assert.match(page, /<option value="th">Thai<\/option>/);
  assert.match(page, /<option value="zh-CN">Chinese<\/option>/);
  assert.match(page, /<option value="es">Spanish<\/option>/);
  assert.match(page, /Translate page/);
  assert.match(page, /https:\/\/translate\.google\.com\/translate/);
  assert.match(page, /hostname === 'localhost'[\s\S]*?Google Translate can't access a localhost page/);
  assert.match(page, /role="status"/);
  assert.match(page, /searchParams\.set\('u', window\.location\.href\)/);
  assert.match(gamesPage, /href="\/games\/da-rules"/);
  assert.ok(styles.includes("background-image: url('/assets/covers/da-rules-cover.webp')"));
  assert.ok(fs.existsSync(path.join(root, 'public/assets/covers/da-rules-cover.webp')));
});

test('Tic Tac Roll uses a pip die beside turn status and resolves roll-mode actions', () => {
  const component = read('games/tictacroll/TicTacRoll.tsx');
  const statusStart = component.indexOf('{/* Status Card */}');
  const boardStart = component.indexOf('{/* MAIN BOARD AREA */}', statusStart);
  const statusMarkup = component.slice(statusStart, boardStart);

  assert.match(component, /function Die\(\{ value, rolling, theme \}/);
  assert.match(component, /role="img" aria-label=\{`Die showing \$\{value\}`\}/);
  assert.match(component, /gridTemplateColumns: "repeat\(3, 1fr\)"/);
  assert.match(component, /@keyframes diceTumble/);
  assert.match(component, /const result = Math\.floor\(Math\.random\(\) \* 6\) \+ 1/);
  assert.match(component, /setTimeout\(\(\) => settleRoll\(result\), 900\)/);
  assert.match(component, /if \(gameMode === "roll" && canConvert\) \{[\s\S]*?if \(board\[idx\] !== \(currentPlayer === "X" \? "O" : "X"\)\) return;[\s\S]*?if \(board\[idx\] !== null\) return;/);
  assert.match(component, /case 2:[\s\S]*?setPhase\("play"\);[\s\S]*?Place your mark; opponent skips next turn/);
  assert.match(component, /No opponent tile to convert; place your mark/);
  assert.match(component, /disabled=\{!gameActive \|\| phase === "roll" \|\| \(canConvert \? !cell\.convertible : cell\.val !== null\)\}/);
  assert.match(component, /setPhase\("roll"\);[\s\S]*?setStatus\(\{ main: `\$\{getName\(player\)\} earned another turn!`, hint: "Roll again" \}\)/);
  assert.match(statusMarkup, /<Die value=\{rollVal\} rolling=\{rolling\} theme=\{theme\} \/>/);
  assert.match(statusMarkup, /↻ Play Again/);
  assert.doesNotMatch(component.slice(boardStart), /Play Again/);
  assert.match(component, /animation: rolling \? "diceTumble 0\.32s ease-in-out infinite"/);
});

test('Burger Run maps logical coordinates to responsive artwork and keeps collisions in world space', async () => {
  const { createRunnerViewport, runnerBoxesOverlap, worldToScreen } = await import('../games/burger-run/runner-coordinate.mjs');
  const desktopArt = { width: 1672, height: 940, laneYs: [560], laneBounds: [[0, 940]] };
  const desktop = createRunnerViewport({ width: 1280, height: 668, dpr: 1, art: desktopArt });
  const desktopHiDpi = createRunnerViewport({ width: 1280, height: 668, dpr: 2, art: desktopArt });
  const desktopGround = worldToScreen(0, desktop.laneGrounds[0], desktop);
  const desktopBackgroundScale = Math.max(1280 / desktopArt.width, 668 / desktopArt.height);

  assert.ok(Math.abs(desktopGround.y - ((668 - desktopArt.height * desktopBackgroundScale) / 2 + 560 * desktopBackgroundScale)) < 0.001);
  assert.equal(worldToScreen(180, 90, desktopHiDpi).x, worldToScreen(180, 90, desktop).x);
  assert.equal(worldToScreen(180, 90, desktopHiDpi).y, worldToScreen(180, 90, desktop).y);

  const mobileArt = { width: 940, height: 1672, laneYs: [1078], laneBounds: [[0, 1672]] };
  const mobile = createRunnerViewport({ width: 390, height: 800, dpr: 3, art: mobileArt });
  const mobileGround = worldToScreen(0, mobile.laneGrounds[0], mobile);
  const mobileBackgroundScale = Math.max(390 / mobileArt.width, 800 / mobileArt.height);
  assert.ok(Math.abs(mobileGround.y - ((800 - mobileArt.height * mobileBackgroundScale) / 2 + 1078 * mobileBackgroundScale)) < 0.001);
  assert.ok(mobile.viewLeft > 0);
  assert.ok(mobile.viewRight < 720);
  assert.equal((worldToScreen(120, 90, mobile).x - worldToScreen(100, 90, mobile).x) / mobile.scale, 20);
  assert.throws(() => createRunnerViewport({ width: 0, height: 800, art: mobileArt }), RangeError);

  const race = createRunnerViewport({
    width: 1280,
    height: 668,
    art: { width: 1672, height: 941, laneYs: [452, 900], laneBounds: [[0, 478], [478, 941]] },
  });
  const raceWide = createRunnerViewport({
    width: 1365,
    height: 711,
    art: { width: 1672, height: 941, laneYs: [452, 900], laneBounds: [[0, 478], [478, 941]] },
    fit: 'fill',
  });
  assert.equal(race.laneGrounds.length, 2);
  assert.ok(race.laneGrounds[1] > race.laneGrounds[0]);
  assert.deepEqual(race.laneBounds, [[0, 478 * 720 / 1672], [478 * 720 / 1672, 941 * 720 / 1672]]);
  assert.equal(raceWide.viewTop, 0);
  assert.equal(raceWide.viewBottom, raceWide.worldHeight);
  assert.equal(raceWide.offsetY, 0);
  assert.equal(raceWide.offsetX, 0);
  assert.equal(worldToScreen(0, 0, raceWide).x, 0);
  assert.equal(worldToScreen(720, raceWide.worldHeight, raceWide).x, raceWide.width);
  assert.equal(worldToScreen(0, raceWide.worldHeight, raceWide).y, raceWide.height);
  assert.notEqual(raceWide.scaleX, raceWide.scaleY);

  const player = { x: 48, y: 131, w: 46, h: 44 };
  const obstacle = { x: 68, y: 175, w: 24, h: 30 };
  assert.equal(runnerBoxesOverlap(player, obstacle), true);
  assert.equal(runnerBoxesOverlap({ ...player, x: 20 }, obstacle), false);
});

test('Burger Run Card Duel awards a one-round double-points bonus after three safe picks', async () => {
  const { finishDuelBonusRound, resolveDuelPick } = await import('../games/burger-run/duel-round.mjs');
  const player = { pts: 0, safeRounds: 0, bonusActive: false, bonusAnimating: false };
  const boost = { id: 'boost', pts: 100 };
  const turbo = { id: 'turbo', pts: 200 };
  const freeze = { id: 'freeze', pts: -100 };

  resolveDuelPick(player, boost);
  resolveDuelPick(player, boost);
  assert.equal(player.safeRounds, 2);
  assert.equal(player.bonusActive, false);
  resolveDuelPick(player, boost);
  assert.equal(player.pts, 300);
  assert.equal(player.safeRounds, 0);
  assert.equal(player.bonusActive, true);

  const { bonusApplied } = resolveDuelPick(player, turbo);
  assert.equal(bonusApplied, true);
  assert.equal(player.pts, 700);
  assert.equal(player.bonusActive, false);
  assert.equal(player.bonusAnimating, true);
  assert.equal(player.safeRounds, 0);
  finishDuelBonusRound(player);
  assert.equal(player.bonusAnimating, false);

  resolveDuelPick(player, boost);
  resolveDuelPick(player, boost);
  resolveDuelPick(player, boost);
  assert.equal(player.bonusActive, true);
  resolveDuelPick(player, freeze);
  assert.equal(player.pts, 900);
  assert.equal(player.safeRounds, 0);
  assert.equal(player.bonusActive, false);
  assert.equal(player.bonusAnimating, false);
});

test('Burger Run random helpers provide deterministic seeds and unbiased shuffle steps', async () => {
  const { createSeededRandom, shuffle } = await import('../games/burger-run/random.mjs');
  const source = [1, 2, 3, 4, 5];
  const first = shuffle(source, createSeededRandom(42));
  const second = shuffle(source, createSeededRandom(42));

  assert.deepEqual(first, second);
  assert.deepEqual([...first].sort(), source);
  assert.deepEqual(source, [1, 2, 3, 4, 5]);
  assert.deepEqual(shuffle([1, 2, 3], () => 0), [2, 3, 1]);
  assert.deepEqual(shuffle([1, 2, 3], () => 0.999999), [1, 2, 3]);
});

test('Emoji Category Sort has category rounds and all requested game screens', async () => {
  const { createEmojiCategoryRound, createEmojiWordQuestions, EMOJI_CATEGORIES, EMOJI_SORT_DIFFICULTIES } = await import('../games/emoji-category-sort/emoji-category-data.mjs');
  const component = read('games/emoji-category-sort/EmojiCategorySort.jsx');
  const catalog = read('games/catalog.data.ts');
  const componentCatalog = read('games/catalog.components.tsx');
  const route = read('app/games/[game]/page.tsx');
  const expectedSizes = { easy: 3, medium: 5, hard: 7 };

  for (const [difficulty, size] of Object.entries(expectedSizes)) {
    assert.equal(EMOJI_SORT_DIFFICULTIES[difficulty].items, size);
    const round = createEmojiCategoryRound(difficulty, () => 0.37);
    assert.equal(round.length, size);
    assert.equal(new Set(round.map((item) => item.id)).size, size);
    assert.ok(round.every((item) => EMOJI_CATEGORIES.some((category) => category.id === item.categoryId && category.items.some((entry) => entry.id === item.id))));
  }

  assert.throws(() => createEmojiCategoryRound('expert'), RangeError);
  assert.throws(() => createEmojiWordQuestions('expert'), RangeError);
  for (const category of EMOJI_CATEGORIES) {
    const questions = createEmojiWordQuestions(category.id, () => 0.37);
    assert.ok(category.items.length > 7, `${category.label} has an expanded word pool`);
    assert.equal(questions.length, category.items.length);
    assert.ok(questions.every((question) => (
      question.categoryId === category.id
      && question.choices.length === 4
      && new Set(question.choices.map((choice) => choice.id)).size === 4
      && question.choices.some((choice) => choice.id === question.id)
    )));
  }
  assert.ok(EMOJI_CATEGORIES.flatMap((category) => category.items).some((item) => item.word === 'Apple' && item.emoji === '🍎'));
  assert.ok(EMOJI_CATEGORIES.flatMap((category) => category.items).some((item) => item.word === 'Train' && item.emoji === '🚆'));
  assert.match(catalog, /emojicategories:\s*\{\s*name: "Emoji Category Sort"[\s\S]*?hasComponent: true/);
  const catalogKeys = [...catalog.matchAll(/^  ([a-z][\w]*): \{/gm)].map((match) => match[1]);
  assert.equal(catalogKeys.at(-1), 'emojicategories');
  assert.ok(catalogKeys.slice(-4).includes('emojicategories'));
  assert.match(componentCatalog, /emojicategories: lazyGame\('emojicategories', \(\) => import\('@\/games\/emoji-category-sort\/EmojiCategorySort\.jsx'\)\)/);
  assert.match(route, /'emojicategories'/);
  assert.match(component, /setScreen\("setup"\)/);
  assert.match(component, /setScreen\("menu"\)/);
  assert.match(component, /setScreen\("game"\)/);
  assert.match(component, /setScreen\("victory"\)/);
  assert.match(component, /setScreen\("how-to"\)/);
  assert.match(component, /onDragStart=/);
  assert.match(component, /onDrop=/);
  assert.match(component, /onClick=\{\(\) => sortSelectedItem\(category\.id\)\}/);
  assert.match(component, /createEmojiWordQuestions\(level\)/);
  assert.match(component, /className="ecs-word-choice ecs-jigsaw-piece"/);
  assert.match(component, /\.ecs-jigsaw-piece\{clip-path:/);
  assert.match(component, /onComplete\?\.\(nextScore, Math\.round\(\(round\.length \/ nextAttempts\) \* 100\)\)/);
});

test('Burger Run is registered with the catalog and reports game completion', () => {
  const component = read('games/burger-run/BurgerRun.jsx');
  const sprite = read('games/burger-run/burger-sprite.ts');
  const fullscreenShell = read('engine/layout/GameShell.tsx');
  const manifest = read('app/manifest.ts');
  const rootLayout = read('app/layout.tsx');
  const catalog = read('games/catalog.data.ts');
  const registry = read('games/catalog.components.tsx');
  const route = read('app/games/[game]/page.tsx');

  assert.match(catalog, /burgerrun:\s*\{[\s\S]*?name: "Burger Run"[\s\S]*?hasComponent: true,[\s\S]*?isNew: true/);
  assert.match(catalog, /burgerrun:\s*\{[\s\S]*?cover: "\/assets\/covers\/burger-run-cover\.webp"/);
  for (const asset of [
    'burger-run-welcome-phone-bg.webp',
    'burger-run-game-bg-p1.webp',
    'burger-run-game-2p-bg.webp',
    'burger-run-game-phone-bg.webp',
    'burger-run-game-bg-phone.webp',
  ]) {
    assert.ok(fs.existsSync(path.join(root, 'public/assets/games/burger-run', asset)), `${asset} is published`);
    assert.ok(route.includes(`/assets/games/burger-run/${asset}`), `${asset} is preloaded`);
  }
  assert.match(registry, /burgerrun: lazyGame\('burgerrun', \(\) => import\('@\/games\/burger-run\/BurgerRun\.jsx'\)\)/);
  assert.match(component, /export default function BurgerRun\(\{ onComplete, startAtMenu = false \}\)/);
  assert.match(component, /import BurgerSprite from "\.\/BurgerSprite"/);
  assert.match(component, /aria-label="Start Burger Run"[\s\S]*?className="burger-run-start-hitbox"[\s\S]*?onClick=\{go\}/);
  assert.match(component, /className="burger-run-splash-art"/);
  assert.match(component, /burger-run-start-hitbox\{position:absolute;z-index:1;left:50%;top:58\.5%;width:21%;height:11\.6%/);
  assert.match(component, /burger-run-splash-art \.burger-run-start-hitbox\{left:50\.8%;top:54\.5%;width:37\.2%;height:6\.9%\}/);
  assert.match(component, /width:max\(100%,calc\(\(100dvh - 61px\)\*\.5628\)\)/);
  assert.match(component, /burger-run-welcome-phone-bg\.webp/);
  assert.match(component, /burger-run-game-phone-bg\.webp/);
  assert.match(component, /burger-run-game-2p-bg\.webp/);
  assert.match(component, /const RUN_BACKGROUNDS = \{[\s\S]*?classic: \{\s*desktop: "burger-run-game-bg-p1\.webp",\s*mobile: "burger-run-game-phone-bg\.webp",\s*\},[\s\S]*?card: \{\s*desktop: "burger-run-game-bg-p1\.webp",\s*mobile: "burger-run-game-phone-bg\.webp",\s*\},[\s\S]*?race: \{\s*desktop: "burger-run-game-2p-bg\.webp",\s*mobile: "burger-run-game-bg-phone\.webp",\s*\},[\s\S]*?duel: \{\s*desktop: "burger-run-game-2p-bg\.webp",\s*mobile: "burger-run-game-bg-phone\.webp",/);
  assert.match(component, /data-burger-run-mode=\{mode\}/);
  assert.match(component, /const isTwoPlayerRun = mode === "race" \|\| mode === "duel"/);
  assert.match(component, /burger-run-play-screen-two-player/);
  assert.match(component, /burger-run-play-screen-single/);
  assert.doesNotMatch(component, /Dodge the cacti\. Outrun the birds\. Reach the finish\./);
  assert.doesNotMatch(component, /PRESS START/);
  assert.doesNotMatch(component, /<h1 className="text-5xl font-bold" style=\{\{ letterSpacing: "\.12em" \}\}>BURGER RUN<\/h1>/);
  assert.match(component, /scr === "splash"[\s\S]*?burger-run-welcome-bg\.webp/);
  assert.match(component, /scr === "win"[\s\S]*?burger-run-victory-bg\.webp/);
  assert.match(component, /burger-run-general-bg\.webp/);
  assert.match(component, /isPlaying \? ` burger-run-play-screen \$\{isTwoPlayerRun \? "burger-run-play-screen-two-player" : "burger-run-play-screen-single"\}` : ""/);
  assert.match(component, /"--burger-run-mobile-background": `url\("\/assets\/games\/burger-run\/\$\{gameplayBackground\.mobile\}"\)`/);
  assert.match(component, /burger-run-play-screen\{background-image:var\(--burger-run-mobile-background\)!important/);
  assert.match(component, /backgroundSize: isPlaying && isTwoPlayerRun \? "100% 100%" : "cover"/);
  assert.match(component, /DUEL_PORTRAIT_ART = \{ width: 941, height: 1671, laneYs: \[697, 1460\] \}/);
  assert.match(component, /DUEL_LANDSCAPE_ART = \{ width: 1672, height: 941, laneYs: \[452, 901\] \}/);
  assert.match(component, /classic: \{\s*desktop: \{ width: 1672, height: 940, laneYs: \[560\]/);
  assert.match(component, /race: \{\s*desktop: \{ width: 1672, height: 941, laneYs: \[452, 900\]/);
  assert.match(component, /fit: race && !portraitQuery\.matches \? "fill" : "cover"/);
  assert.match(component, /ctx\.setTransform\(viewport\.scaleX \* viewport\.dpr, 0, 0, viewport\.scaleY \* viewport\.dpr/);
  assert.match(component, /runnerBoxesOverlap\(b, o\)/);
  assert.match(component, /const controlsTop = viewport\.offsetY \+ viewport\.laneGrounds\[0\] \* viewport\.scaleY - 20/);
  assert.match(component, /const worldY = \(e\.clientY - rect\.top - viewport\.offsetY\) \/ viewport\.scaleY/);
  assert.match(component, /className="absolute z-10 flex w-full flex-col items-center gap-3"/);
  assert.doesNotMatch(component, /maxHeight: "calc\(100dvh - 230px\)"/);
  assert.match(component, /const scaleX = mobilePortrait\.current \? fitScale : cachedSize\.width \/ art\.width/);
  assert.match(component, /const scaleY = mobilePortrait\.current \? fitScale : cachedSize\.height \/ art\.height/);
  assert.match(component, /ctx\.setTransform\(art\.scaleX \* art\.dpr, 0, 0, art\.scaleY \* art\.dpr/);
  assert.match(component, /art\.scaleX \* art\.dpr, 0, 0, art\.scaleY \* art\.dpr/);
  assert.match(component, /canvas\.width = width;\s*canvas\.height = height/);
  assert.match(component, /portraitQuery\.addEventListener\("change", updatePortraitLayout\)/);
  assert.match(component, /resizeObserver\.observe\(canvas\.parentElement\)/);
  assert.match(component, /window\.addEventListener\("resize", invalidateCanvasSize\)/);
  assert.match(component, /if \(resizeCanvas\) resizeCanvas\(\)/);
  assert.match(component, /\.burger-run-duel-track\{position:absolute;inset:0;width:100%;height:100%;display:block/);
  assert.match(component, /\.burger-run-duel-controls\{position:absolute;top:46%;left:50%/);
  assert.match(component, /@media\(min-width:761px\)\{\.burger-run-duel-controls\{top:52%;height:48%\}\}/);
  assert.match(component, /\.burger-run-duel-controls\{top:46%;width:94%;height:52%/);
  assert.match(component, /\.burger-run-duel-cards button\{aspect-ratio:3\/4!important/);
  assert.match(component, /backgroundSize: isPlaying && isTwoPlayerRun \? "100% 100%" : "cover", backgroundPosition: "center"/);
  assert.match(component, /ctx\.clearRect\(0, 0, canvas\.width, canvas\.height\)/);
  assert.match(component, /ctx\.clearRect\(0, 0, art\.width, art\.height\)/);
  assert.match(component, /ctx\.scale\(1\.5, 1\.5\)/);
  assert.match(component, /ctx\.scale\(1\.45, 1\.45\)/);
  assert.match(component, /const drawCloud = \(x, y, size\) =>/);
  assert.match(component, /ctx\.strokeStyle = "#315f86"/);
  assert.match(component, /drawCloud\(art\.visibleLeft/);
  assert.match(component, /ctx\.fillRect\(finish\.left, finish\.top, 8, trackY - finish\.top\)/);
  assert.match(component, /ctx\.fillStyle = "#7cbd55"/);
  assert.doesNotMatch(component, /if \(i\) \{ ctx\.fillStyle = "rgba\(255,255,255,\.65\)"/);
  assert.doesNotMatch(component, /<Sub>18-step race · auto-jump hazards · cards control progress<\/Sub>/);
  assert.doesNotMatch(component, /<BurgerPic bun=\{p\.bun\} size=\{34\} \/> \{p\.name\}, pick a card!/);
  assert.doesNotMatch(component, /🍔/);
  assert.doesNotMatch(component, /\bburger\(/);
  const victory = component.slice(component.indexOf('function Win('), component.indexOf('/* ================= RUNNER'));
  assert.doesNotMatch(victory, /🏆/);
  assert.match(victory, /burger-run-victory-panel/);
  assert.match(component, /\.burger-run-victory-content\{position:absolute;inset:0;z-index:2;display:flex;align-items:flex-start/);
  assert.match(component, /\.burger-run-victory-content\{[^}]*padding:max\(18px,4vh\) 16px 0/);
  assert.match(component, /drawBurger\(ctx, L\.x - 20, L\.y/);
  assert.match(component, /className=\{`w-full\$\{race \? " burger-run-race-track" : ""\}`\}/);
  assert.match(component, /function PlayerStatusPanels\(\{ players \}\)/);
  assert.match(component, /className="burger-run-player-status-panels" aria-label="Player status"/);
  assert.match(component, /<BurgerPic bun=\{player\.bun\} size=\{58\} \/>/);
  assert.match(component, /className="burger-run-player-status-progress" role="progressbar"/);
  assert.match(component, /className=\{`burger-run-player-status-label\$\{player\.active \? " is-active" : ""\}\$\{player\.bonusActive \? " is-bonus" : ""\}`\}/);
  assert.match(component, /player\.bonusActive \? "2× BONUS!" : player\.active && player\.status === "Choose a card" \? "YOUR TURN · CHOOSE A CARD" : player\.status/);
  assert.match(component, /\.burger-run-player-status-label\.is-active\{background:#ffd166/);
  assert.match(component, /\.burger-run-control-buttons\{display:none!important\}/);
  assert.match(component, /@media\(max-width:640px\)\{\.burger-run-control-buttons\{display:flex!important\}\}/);
  assert.match(component, /onPointerCancel=\{\(e\) => \{[\s\S]*?activePointers\.current\.delete\(e\.pointerId\)/);
  assert.match(component, /addEventListener\("blur", clearDuck\)/);
  assert.match(component, /const frameDuration = 1000 \/ 60/);
  assert.match(component, /while \(accumulator >= frameDuration\)/);
  assert.match(component, /raceRandom: createSeededRandom/);
  assert.match(component, /g\.L\.forEach\(\(player\) => \{ if \(!player\.out\) player\.obs\.push\(\{ \.\.\.obstacle \}\); \}\)/);
  assert.match(component, /clearTimeout\(cardPickTimer\.current\)/);
  assert.match(component, /BEST_SCORE_KEY = "burger-run-best-scores"/);
  assert.match(component, /localStorage\.setItem\(BEST_SCORE_KEY/);
  assert.match(component, /resolveDuelPick\(p, x\)/);
  assert.match(component, /finishDuelBonusRound\(player\)/);
  assert.match(component, /player\.bonusActive \|\| player\.bonusAnimating/);
  assert.match(component, /className=\{`burger-run-player-status\$\{player\.active \? " is-active" : ""\}\$\{player\.bonusActive \? " is-bonus" : ""\}`\}/);
  assert.match(component, /@keyframes burger-run-bonus-flash/);
  assert.match(component, /\.burger-run-player-status\.is-bonus\{animation:burger-run-bonus-flash/);
  assert.match(component, /const flightHeight = bonusFlight \? 62 \+ Math\.sin\(s\.t \* 8\) \* 14 : 0/);
  assert.equal(component.match(/onStatus\(players\)/g)?.length, 2);
  assert.match(component, /if \(race\) return;/);
  assert.doesNotMatch(component, /const hudY = trackY \+ \(i === 1 \? 54 : -74\)/);
  assert.match(component, /\.burger-run-player-status\{display:flex;align-items:center;gap:12px;min-height:68px/);
  assert.match(component, /\.burger-run-player-status-panels\{position:absolute;z-index:5;top:8px/);
  assert.match(component, /WebkitLineClamp: 2/);
  assert.match(component, /WebkitLineClamp: 3/);
  assert.doesNotMatch(component, /maxHeight: "calc\(100dvh - 230px\)"/);
  assert.match(component, /className="burger-run-race-controls" aria-label="Keyboard controls"/);
  assert.match(component, /<kbd>W<\/kbd> Jump/);
  assert.match(component, /<kbd>S<\/kbd> Duck/);
  assert.match(component, /<kbd>↑<\/kbd> Jump/);
  assert.match(component, /<kbd>↓<\/kbd> Duck/);
  assert.match(component, /drawBurger\(ctx, x, y/);
  assert.match(component, /const GOAL = 15/);
  assert.match(component, /pl: \[mkP\(P\), mkP\(P2\)\]/);
  assert.doesNotMatch(component, /p\.pos = Math\.min\(GOAL, p\.pos \+ [^)]+dt\)/);
  assert.match(component, /p\.pos = Math\.min\(GOAL, Math\.max\(0, p\.pos \+ x\.mv \* \(bonusApplied \? 2 : 1\)\)\)/);
  assert.match(component, /bonusApplied = p\.bonusActive && x\.id !== "freeze"/);
  assert.match(component, /Move forward 3 steps", mv: 3/);
  assert.match(component, /Move forward 2 steps", mv: 2/);
  assert.match(component, /Move back 2 steps", mv: -2/);
  assert.match(component, /Stay frozen and skip your next turn", mv: 0/);
  assert.match(component, /function advanceDuelTurn\(state, currentTurn\)/);
  assert.match(component, /while \(state\.pl\[nextTurn\]\.skip\)/);
  assert.match(component, /state\.pl\[nextTurn\]\.skip = false;\s*state\.pl\[nextTurn\]\.frozen = false/);
  assert.match(component, /s\.turn = advanceDuelTurn\(s, turn\)/);
  assert.match(component, /const types = \["cactus", "dinosaur", "pterodactyl"\]/);
  assert.match(component, /hazard\.type === "pterodactyl"\) p\.duckUntil/);
  assert.match(component, /hazard\.x > runnerX \+ 170/);
  assert.match(component, /const passDuration = \(hazard\.x \+ 72 - runnerX\) \/ 190 \+ 0\.08/);
  assert.match(component, /p\.jumpUntil = s\.t \+ passDuration \+ 0\.25/);
  assert.match(component, /const GOAL = 15;/);
  assert.match(component, /const y = frozen \? trackY - 4 : trackY - 42/);
  assert.match(component, /const y = p\.frozen \? trackY - 55/);
  assert.match(component, /Math\.sin\(\(\(s\.t - p\.jumpFrom\) \/ \(p\.jumpUntil - p\.jumpFrom\)\) \* Math\.PI\) \* 72/);
  assert.match(component, /fillRect\(x - 8, y - 52, 64, 58\)/);
  assert.match(component, /const dashX = x - \(\(s\.t \* 100\) % 100\)/);
  assert.match(component, /const finish = \{ left: finishX - 14, right: finishX \+ 82, top: trackY - 96 \}/);
  assert.match(component, /const winning = s\.winning\?\.player === i/);
  assert.match(component, /const finishRun = winning \? Math\.min\(84, \(s\.t - s\.winning\.at\) \* 150\) : 0/);
  assert.match(component, /ctx\.shadowBlur = winning \? 28 : 12/);
  assert.match(component, /const gateColor = winning \? \(flash \? "#fff27a" : "#ff8a3d"\) : FG/);
  assert.match(component, /s\.t - s\.winning\.at >= 1\.6/);
  const cardDuel = component.slice(component.indexOf("function CardDuel"), component.indexOf("/* ================= APP"));
  assert.match(cardDuel, /<Btn sm onClick=\{onExit\}>☰ Menu<\/Btn>/);
  assert.match(component, /ctx\.fillRect\(finish\.left, finish\.top, 8, trackY - finish\.top\)/);
  assert.match(component, /ctx\.fillRect\(finish\.right, finish\.top, 8, trackY - finish\.top\)/);
  assert.match(component, /for \(let r = 0; r < 6; r\+\+\) for \(let c = 0; c < 8; c\+\+\)/);
  assert.match(component, /ctx\.fillStyle = winning[\s\S]*?\(\(r \+ c\) % 2 === 0 \? \(flash \? "#fff27a" : "#ff8a3d"\)/);
  assert.match(component, /: \(\(r \+ c\) % 2 === 0 \? "#fff3d6" : "#162438"\)/);
  assert.doesNotMatch(component, /18-step race · auto-jump hazards · cards control progress/);
  assert.doesNotMatch(cardDuel, /pick a card!/);
  assert.match(cardDuel, /<section className="burger-run-duel-controls">[\s\S]*?<div className="burger-run-duel-cards">/);
  assert.match(component, /className="burger-run-duel-controls"/);
  assert.match(component, /className="burger-run-duel-cards"/);
  assert.match(component, /<Card key=\{i\} suit=\{SUITS\[i\]\} compact/);
  assert.match(cardDuel, /s\.deal\.cards\.map/);
  assert.match(cardDuel, /s\.deal\.hintIndex === i/);
  assert.match(cardDuel, /aria-live="polite"/);
  assert.match(cardDuel, /pauseDuel\(!pausedRef\.current\)/);
  assert.match(cardDuel, /onBest\("duel", p\.pos\)/);
  assert.match(component, /SUIT_LABELS = \{ "♠": "Spades", "♥": "Hearts", "♦": "Diamonds", "♣": "Clubs" \}/);
  assert.match(component, /<small style=\{\{ fontSize: "clamp\(10px,2\.5vw,14px\)", fontWeight: 800, letterSpacing: "\.08em", textTransform: "uppercase" \}\}>\{SUIT_LABELS\[suit\]\}<\/small>/);
  assert.match(component, /@media\(max-width:760px\) and \(orientation:portrait\)\{\.burger-run-duel-controls\{top:46%/);
  assert.match(component, /maxWidth: isPlaying \? "none"/);
  assert.match(component, /startAtMenu \? "menu" : "splash"/);
  assert.match(component, /scr === "howto"/);
  assert.match(component, /How to Play Burger Run/);
  assert.match(component, /className="burger-run-info-grid"/);
  assert.match(component, /className="burger-run-player-setup"/);
  assert.match(component, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);gap:24px;width:100%/);
  assert.match(component, /@media\(max-width:640px\)\{\.burger-run-info[\s\S]*?\.burger-run-info-grid\{grid-template-columns:1fr/);
  assert.match(component, /className="burger-run-menu-grid"/);
  assert.match(component, /className="burger-run-menu-mode"/);
  assert.match(component, /maxWidth: isPlaying \? "none" : scr === "menu" \? "68rem"/);
  assert.match(component, /If both players are due to skip, each frozen turn is skipped before play resumes/);
  assert.match(component, /Race side by side to 1,200 points with three lives each/);
  for (const mode of ["Classic Run", "Solo Card Mode", "2P Card Duel", "2P Race"]) {
    assert.match(component, new RegExp(`>${mode}<`));
  }
  assert.match(route, /gameId === 'burgerrun'[\s\S]*?setBurgerRunStartAtMenu\(true\)[\s\S]*?setGameSession/);
  assert.match(route, /gameId === 'burgerrun' \? \{ startAtMenu: burgerRunStartAtMenu \}/);
  for (const color of ['Black', 'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Pink', 'Orange']) {
    assert.match(component, new RegExp(`name: "${color}"`));
  }
  assert.match(sprite, /pixel\(bun, 2, -40, 38, 8\)/);
  assert.match(component, /reportCompletion\(100, 100\)/);
  assert.match(component, /completionRef\.current\?\.\(sc\(l\), Math\.round\(\(sc\(l\) \/ GOAL\) \* 100\)\)/);
  assert.match(route, /<BurgerSprite bun="#e8a24a" size=\{48\} \/>/);
  assert.match(route, /'miniracer', 'burgerrun'/);
  assert.match(fullscreenShell, /webkitRequestFullscreen/);
  assert.match(fullscreenShell, /navigationUI: 'hide'/);
  assert.match(fullscreenShell, /cannot hide its controls/);
  assert.match(manifest, /display: 'fullscreen'/);
  assert.match(manifest, /app-icon-512\.png/);
  assert.match(rootLayout, /viewportFit: 'cover'/);
  assert.match(rootLayout, /appleWebApp:\s*\{\s*capable: true/);
});
