'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/lib/gameState';
import { auth, isCreatorUser, loadUserState, onAuthStateChanged, saveStudentScore } from '@/lib/firebase';
import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';
import { GAME_NAMES, GAME_ICONS } from '@/constants/index';
import { GAME_COMPONENTS } from '@/games/catalog.components';
import { GameShell } from '@/engine';
import Connect4HeaderActions from '@/components/ui/controls/Connect4HeaderActions';
import { TIC_TAC_ROLL_THEMES, type TicTacRollTheme } from '@/games/tictacroll/themes';
import { canAccessGame, COMING_SOON_GAME_IDS, TEACHER_PRO_GAME_IDS } from '@/config/game-access';

// ── Types ─────────────────────────────────────────────────────
interface GameResult {
  score: number;
  accuracy: number;
  gameId: string;
}

interface ColourClashHud {
  round: number;
  score: number;
  lives: number;
  totalLives: number;
  phase: 'showing' | 'input' | 'correct' | 'wrong' | 'idle' | 'gameover';
  sequenceLength: number;
  sequenceProgress: number;
}

interface AirPuckHud {
  mode: 'normal' | 'card';
  name: string;
  playerScore: number;
  aiScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  turn: string;
}

const GAMES_WITH_WELCOME = new Set([
  'airpuck', 'animalAdventureRace', 'connect4', 'farmgame', 'findmyfood', 'flagmaster', 'emojimatch',
  'finnthefox', 'hiddencolours', 'oceanquest', 'parachutedrop', 'weatherwizard',
  'phonicsadventure', 'riddlebombs', 'tictacroll', 'tornado', 'wordfusion', 'weatherwizard', 'victoryvet',
  'turbodash',
  'lookandsay',
  'snowyslopes',
  'numberclouds',
  'countadd',
  'moneyblocks',
  'emojisportsquiz',
  'generalknowledgequiz',
  'alphabethunt', 'buildtower', 'whatsmissing',
]);

// ── Page ──────────────────────────────────────────────────────
export default function GamePage() {
  const params  = useParams();
  const gameId  = (params?.game as string) ?? '';
  const { state, setState, updateGameStats, addXP } = useGame();

  const [result, setResult]   = useState<GameResult | null>(null);
  const [gameSession, setGameSession] = useState(0);
  const [airPuckHud, setAirPuckHud] = useState<AirPuckHud | null>(null);
  // Connect 4 hands its in-match HUD (player badges + reset/home) up here so
  // it can render inside the GameShell navbar instead of the play area.
  const [c4Hud, setC4Hud] = useState<any>(null);
  const [readingRescueHud, setReadingRescueHud] = useState<any>(null);
  const [riddleBombsHud, setRiddleBombsHud] = useState<any>(null);
  const [ticTheme, setTicTheme] = useState<TicTacRollTheme>(TIC_TAC_ROLL_THEMES[0]);
  const [flagDarkMode, setFlagDarkMode] = useState(false);
  const [zooTheme, setZooTheme] = useState('savanna');
   const isAlphabetHunt = gameId === 'alphabethunt';
   const [alphabetTheme, setAlphabetTheme] = useState('classroom');
  const [wordFusionTheme, setWordFusionTheme] = useState('ocean');
  const [showRouteWelcome, setShowRouteWelcome] = useState(!GAMES_WITH_WELCOME.has(gameId));
  const [clientReady, setClientReady] = useState(false);
  const [accessReady, setAccessReady] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [hasTeacherPro, setHasTeacherPro] = useState(false);
  const [countAddHud, setCountAddHud] = useState<any>(null);
  const [emojiSportsHud, setEmojiSportsHud] = useState<any>(null);
  const [weatherWizardHud, setWeatherWizardHud] = useState<any>(null);
  const [numberCloudsHud, setNumberCloudsHud] = useState<any>(null);
  const [snowySlopesHud, setSnowySlopesHud] = useState<any>(null);
  const [animalClassHud, setAnimalClassHud] = useState<any>(null);
  const [whatsMissingHud, setWhatsMissingHud] = useState<any>(null);
  const [whatsMissingTheme, setWhatsMissingTheme] = useState('green');
  const [moneyBlocksTheme, setMoneyBlocksTheme] = useState('black');
  const [findMyFoodTheme, setFindMyFoodTheme] = useState('safari');
  const [mathRacingHud, setMathRacingHud] = useState<any>(null);
  const [colourClashHud, setColourClashHud] = useState<ColourClashHud | null>(null);

  useEffect(() => {
    const assets: Record<string, string[]> = {
      buildtower: ['/assets/games/build-the-tower/build-the-tower-welcome-screen.png', '/assets/games/build-the-tower/build-the-tower-floating-islands-bg.png', '/assets/games/build-the-tower/build-the-tower-jungle-bg.png', '/assets/games/build-the-tower/build-the-tower-game-bg.png'],
      connect4: ['/assets/games/connect-4/connect-4-welcome.webp', '/assets/games/connect-4/connect-4-main-menu.webp', '/assets/games/connect-4/connect-4-user-input.webp', '/assets/games/connect-4/connect-4-game-screen.webp'],
      emojisportsquiz: ['/assets/games/sports-quiz/sports-quiz-welcome-bg.webp', '/assets/games/sports-quiz/sports-quiz-welcome-phone-bg.webp', '/assets/games/sports-quiz/vocab-game-bg.png', '/assets/games/sports-quiz/spelling-game-bg.png', '/assets/games/sports-quiz/sentence-game-bg.png'],
      tictacroll: ['/assets/images/tic-tac-roll-welcome-page-bg.webp', '/assets/images/tic-tac-roll-user-input-screen-bg.webp', '/assets/images/tic-tac-roll-welcome-bg.webp'],
      weatherwizard: ['/assets/games/weather-wizard/weather-wizards-welcome-bg.webp', '/assets/games/weather-wizard/weather-wizards-classroom-bg.webp', '/assets/games/weather-wizard/weather-wizards-summer-bg.webp', '/assets/games/weather-wizard/weather-wizards-spring-bg.webp', '/assets/games/weather-wizard/weather-wizards-astronomy-tower-bg.webp', '/assets/games/weather-wizard/weather-wizards-autumn-bg.webp', '/assets/games/weather-wizard/weather-wizards-winter-bg.webp', '/assets/games/weather-wizard/weather-wizards-courtyard-bg.webp'],
      zoogame: ['/assets/games/zoo-game/zoo-game-menu-bg.webp', '/assets/games/zoo-game/zoo-game-game-bg.webp', '/assets/games/zoo-game/zoo-game-user-input-bg.webp'],
      snowyslopes: ['/assets/games/snowy-slopes/snowy-slopes-welcome-bg.webp', '/assets/games/snowy-slopes/snowy-slopes-welcome-phone-bg.webp', '/assets/games/snowy-slopes/snowy-slopes-game-screen-bg.webp', '/assets/games/snowy-slopes/snowy-slopes-game-screen-phone-bg.webp'],
    };
    const queue = assets[gameId] || [];
    if (!queue.length) return;
    const load = (src: string) => { const image = new Image(); image.decoding = 'async'; image.src = src; image.decode?.().catch(() => {}); };
    load(queue[0]);
    const rest = queue.slice(1);
    const requestIdle = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback.bind(window)
      : null;
    const cancelIdle = typeof window.cancelIdleCallback === 'function'
      ? window.cancelIdleCallback.bind(window)
      : null;
    const idleId = requestIdle
      ? requestIdle(() => rest.forEach(load), { timeout: 1200 })
      : window.setTimeout(() => rest.forEach(load), 250);
    return () => {
      if (cancelIdle && typeof idleId === 'number') cancelIdle(idleId);
      else window.clearTimeout(idleId as number);
    };
  }, [gameId]);

  useEffect(() => {
    setShowRouteWelcome(!GAMES_WITH_WELCOME.has(gameId));
    setRouteError(null);
  }, [gameId]);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    const handleChunkError = () => {
      setRouteError('The game bundle was stale. Clearing the cached build and reloading…');
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('stale-game-bundle', 'true');
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const staleFlag = window.sessionStorage.getItem('stale-game-bundle');
    if (staleFlag === 'true') {
      window.sessionStorage.removeItem('stale-game-bundle');
      setTimeout(() => {
        window.location.reload();
      }, 250);
    }
  }, []);

  useEffect(() => onAuthStateChanged(user => {
    const creator = isCreatorUser(user);
    setIsCreator(creator);
    if (!user) {
      setHasTeacherPro(false);
      setCanPlay(false);
      setAccessReady(true);
      return;
    }
    void loadUserState(user.uid).then(profile => {
      const teacherPro = Boolean(profile?.teacherPro);
      setHasTeacherPro(teacherPro);
      setCanPlay((creator || canAccessGame(gameId)) && (!TEACHER_PRO_GAME_IDS.has(gameId) || creator || teacherPro));
      setAccessReady(true);
    });
  }), [gameId]);

  useEffect(() => {
    if (gameId !== 'countadd') return undefined;
    const handleHud = (event: Event) => setCountAddHud((event as CustomEvent).detail);
    window.addEventListener('count-add:hud', handleHud);
    return () => window.removeEventListener('count-add:hud', handleHud);
  }, [gameId]);

  const gameName  = GAME_NAMES[gameId] ?? 'Game';
  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';
  const GameComp  = GAME_COMPONENTS[gameId];
  const isAirPuck = gameId === 'airpuck';
  const isConnect4 = gameId === 'connect4';
  const isReadingRescue = gameId === 'finnthefox';
  const isTicTacRoll = gameId === 'tictacroll';
  const isFlagmaster = gameId === 'flagmaster';
  const isZooGame = gameId === 'zoogame';
  const isFruitWordHunt = gameId === 'fruitwordhunt';
  const isWordFusion = gameId === 'wordfusion';
  const isWeatherWizard = gameId === 'weatherwizard';
  const isVocabValley = gameId === 'vocabvalley';
  const isCountAdd = gameId === 'countadd';
  const isEmojiSports = gameId === 'emojisportsquiz';
  const isNumberClouds = gameId === 'numberclouds';
  const isSnowySlopes = gameId === 'snowyslopes';
  const isAnimalClass = gameId === 'animalclass';
  const isFindMyFood = gameId === 'findmyfood';
  const isEmojiMatch = gameId === 'emojimatch';
  const isWhatsMissing = gameId === 'whatsmissing';
  const isMoneyBlocks = gameId === 'moneyblocks';
  const isMathRacing = gameId === 'mathracing';
  const isColourClash = gameId === 'colourclash';
  const findMyFoodShellTheme = {
    forest: { nav: '#123B25', navRaised: '#39D353', navText: '#F4FFE9', navMuted: '#8BEA24', background: '#063B2A' },
    safari: { nav: '#4A2C18', navRaised: '#F4A62A', navText: '#FFF6D6', navMuted: '#E6C35A', background: '#8B5A2B' },
    ocean: { nav: '#063B5B', navRaised: '#18BFE8', navText: '#E8FFFF', navMuted: '#35E0D0', background: '#075985' },
    arctic: { nav: '#193B5A', navRaised: '#63D8FF', navText: '#F4FCFF', navMuted: '#A9E8FF', background: '#326B91' },
    dino: { nav: '#21451D', navRaised: '#58C93C', navText: '#F4FFE9', navMuted: '#9BE33F', background: '#174B35' },
  }[findMyFoodTheme] ?? { nav: '#4A2C18', navRaised: '#F4A62A', navText: '#FFF6D6', navMuted: '#E6C35A', background: '#8B5A2B' };
  const moneyBlocksShellTheme = {
    black: { nav: '#080809', navRaised: '#202127', navText: '#f0ece2', navMuted: '#aaa49b', background: '#080809' },
    gold: { nav: '#171109', navRaised: '#3a2912', navText: '#fff7df', navMuted: '#dfc681', background: '#171109' },
    white: { nav: '#f5f3ee', navRaised: '#ffffff', navText: '#1c1a17', navMuted: '#6b6560', background: '#f5f3ee' },
  }[moneyBlocksTheme] ?? { nav: '#080809', navRaised: '#202127', navText: '#f0ece2', navMuted: '#aaa49b', background: '#080809' };
  const isPlantVegetableQuiz = gameId === 'plantvegetablequiz';
  const zooShellTheme = {
    savanna: { nav: '#4a3728', navRaised: '#b8863a', navText: '#fff8e7', navMuted: '#fce9c8', background: '#d9c9a8' },
    ocean: { nav: '#16445a', navRaised: '#2f8da3', navText: '#effcff', navMuted: '#bde8ec', background: '#8ed1d5' },
    jungle: { nav: '#183d2c', navRaised: '#3c8150', navText: '#f2ffe9', navMuted: '#c9e6af', background: '#9fc27b' },
  }[zooTheme] ?? { nav: '#4a3728', navRaised: '#b8863a', navText: '#fff8e7', navMuted: '#fce9c8', background: '#d9c9a8' };

  // ── onComplete: called by React game components ──
  function handleComplete(score: number, accuracy: number) {
    const acc  = Math.min(100, Math.max(0, accuracy));
    const scr  = score;
    const prev = state.games[gameId] ?? { highScore: 0, completions: 0, lastAccuracy: 0, totalQuestions: 100 };

    const updatedRecord = {
      ...prev,
      highScore:    Math.max(prev.highScore, scr),
      completions:  prev.completions + 1,
      lastAccuracy: acc,
    };
    const updatedGames = { ...state.games, [gameId]: updatedRecord };

    updateGameStats(gameId, updatedRecord);
    addXP(Math.round(acc / 2));
    setState({ lastGame: gameId, coins: state.coins + Math.round(acc / 10) });
    syncCurrentPlayerToLeaderboard();

    const currentUser = auth?.currentUser;
    if (currentUser && state.classId) {
      saveStudentScore(currentUser.uid, state.classId, state.name, updatedGames).catch(() => {});
    }
    window.dispatchEvent(new CustomEvent('esl-game-reward', {
      detail: { id: `${gameId}-${Date.now()}`, icon: '🏆', title: `${gameName} complete`, description: `+${Math.round(acc / 2)} XP  •  +${Math.round(acc / 10)} coins  •  ${scr} points`, color: 'var(--gold)' },
    }));
  }

  function handleContinue() {
    setResult(null);
    setC4Hud(null);
    setAirPuckHud(null);
    setGameSession(session => session + 1);
  }

  function handleMainMenu() {
    setResult(null);
    setC4Hud(null);
    if (isAirPuck) {
      setAirPuckHud(null);
      window.dispatchEvent(new Event('air-puck:main-menu'));
    } else if (gameId === 'connect4') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('connect4:main-menu'));
    } else if (isColourClash) {
      setColourClashHud(null);
      if (showRouteWelcome) setShowRouteWelcome(false);
      else window.dispatchEvent(new Event('colour-clash:main-menu'));
    } else if (gameId === 'lookandsay') {
      window.dispatchEvent(new Event('look-and-say:main-menu'));
    } else if (gameId === 'bowlingbattle') {
      window.dispatchEvent(new Event('bowling-battle:main-menu'));
    } else if (gameId === 'generalknowledgequiz') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('general-knowledge-quiz:main-menu'));
    } else if (isWhatsMissing) {
      window.dispatchEvent(new Event('whats-missing:main-menu'));
    } else if (gameId === 'buildtower') {
      window.dispatchEvent(new Event('build-tower:main-menu'));
    } else if (isFindMyFood || isEmojiMatch) {
      window.dispatchEvent(new Event('find-my-food:main-menu'));
    } else if (isEmojiSports) {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('emoji-sports:main-menu'));
    } else if (isFlagmaster) {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('flagmaster:main-menu'));
    } else if (gameId === 'warriors') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('grammar-gym:main-menu'));
    } else if (isAnimalClass) {
      setAnimalClassHud(null);
      setShowRouteWelcome(false);
      setGameSession(session => session + 1);
    } else if (isZooGame) {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('zoo-game:main-menu'));
    } else if (isWeatherWizard || isNumberClouds) {
      setShowRouteWelcome(false);
      if (isWeatherWizard) {
        setWeatherWizardHud(null);
        window.dispatchEvent(new Event('weather-wizard:main-menu'));
      }
      else setGameSession(session => session + 1);
    } else if (gameId === 'snowyslopes' || gameId === 'countadd') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event(`${gameId === 'snowyslopes' ? 'snowy-slopes' : 'count-add'}:main-menu`));
    } else if (isTicTacRoll) {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('tictacroll:main-menu'));
    } else if (gameId === 'finnthefox') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('reading-rescue:main-menu'));
    } else if (gameId === 'riddlebombs') {
      setRiddleBombsHud(null);
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('riddle-bombs:main-menu'));
    } else if (gameId === 'phonicsadventure') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('phonics-adventure:main-menu'));
    } else if (gameId === 'phonicsworld') {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('phonics-world:main-menu'));
    } else {
      setShowRouteWelcome(true);
      setGameSession(session => session + 1);
    }
  }

  const requiresAccessCheck = TEACHER_PRO_GAME_IDS.has(gameId) || COMING_SOON_GAME_IDS.has(gameId);

  if (!accessReady && requiresAccessCheck) {
    return (
      <section className="route-game-welcome" aria-busy="true" role="status">
        <div className="route-game-welcome-card">
          <div className="route-game-welcome-icon" aria-hidden="true">{gameIcon}</div>
          <h1>{gameName}</h1>
          <p>Checking game access…</p>
        </div>
      </section>
    );
  }

  if (TEACHER_PRO_GAME_IDS.has(gameId) && !isCreator && !hasTeacherPro) {
    return (
      <div className="route-game-welcome">
        <div className="route-game-welcome-card">
          <div className="route-game-welcome-icon" aria-hidden="true">🔒</div>
          <p className="route-game-welcome-kicker">Teacher Pro game</p>
          <h1>{gameName}</h1>
          <p>This game is available to Teacher Pro accounts and creators.</p>
          <Link href="/subscription" className="pill-btn" style={{ textDecoration: 'none' }}>View Teacher Pro</Link>
        </div>
      </div>
    );
  }

  if (COMING_SOON_GAME_IDS.has(gameId) && !isCreator) {
    return (
      <div className="route-game-welcome">
        <div className="route-game-welcome-card">
          <div className="route-game-welcome-icon" aria-hidden="true">🚧</div>
          <p className="route-game-welcome-kicker">Coming soon</p>
          <h1>{gameName}</h1>
          <p>This game is still being finished. Check back when it is published.</p>
          <Link href="/games" className="pill-btn" style={{ textDecoration: 'none' }}>← Back to Games</Link>
        </div>
      </div>
    );
  }

  if (!GameComp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--text)' }}>
        <div style={{ fontSize: '3rem' }}>🎮</div>
        <h1 style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.4rem' }}>Game not found</h1>
        <p style={{ color: 'var(--muted)' }}>"{gameId}" doesn't match any game in the library.</p>
        <Link href="/hub" className="pill-btn" style={{ textDecoration: 'none' }}>← Back to Hub</Link>
      </div>
    );
  }

  if (routeError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
        <div style={{ maxWidth: 520, width: '100%', padding: 28, borderRadius: 20, border: '1px solid var(--border-bright)', background: 'var(--surface-strong)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔄</div>
          <h1 style={{ margin: '0 0 10px', fontSize: '1.7rem', fontFamily: 'var(--font-display, Syne)' }}>Refreshing the game</h1>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>{routeError}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'transparent', overflow: 'visible' }}>
      <GameShell
        gameId={gameId}
        title={gameName}
        icon={gameIcon}
        sessionKey={gameSession}
        completion={result}
        onContinue={handleContinue}
        onRestart={handleContinue}
        onMainMenu={handleMainMenu}
        hideMainMenuButton={gameId === 'dragonslingshot'}
        hidePauseControl={isFlagmaster || (isAirPuck && airPuckHud?.mode === 'card')}
        hideExitControl={false}
        controls={null}
        themeVars={isTicTacRoll ? { nav: ticTheme.surface, navRaised: ticTheme.bg, navText: ticTheme.text, navMuted: ticTheme.muted, background: ticTheme.bg } : isAlphabetHunt ? { nav: alphabetTheme === 'ocean' ? '#087f8c' : alphabetTheme === 'arcade' ? '#352354' : '#1b1b1f', navRaised: alphabetTheme === 'ocean' ? '#e5a83b' : alphabetTheme === 'arcade' ? '#ff71ce' : '#c98a2c', navText: '#fffaf0', navMuted: '#eee8da', background: alphabetTheme === 'ocean' ? '#dff4f2' : alphabetTheme === 'arcade' ? '#24183d' : '#eee8da' } : isWordFusion ? { nav: wordFusionTheme === 'forest' ? '#214c3c' : wordFusionTheme === 'sunset' ? '#7b3f2e' : '#245b6c', navRaised: wordFusionTheme === 'forest' ? '#75b798' : wordFusionTheme === 'sunset' ? '#e29b52' : '#8ed1d5', navText: '#fffaf0', navMuted: '#d6eeee', background: wordFusionTheme === 'forest' ? '#dcefe2' : wordFusionTheme === 'sunset' ? '#f4d4b5' : '#d9eef0' } : isZooGame ? zooShellTheme : isFruitWordHunt ? { nav: '#a5662a', navRaised: '#f7b05e', navText: '#fffbee', navMuted: '#fff0cf', background: '#ffe0b5' } : isFlagmaster ? { nav: flagDarkMode ? '#05070d' : '#0b1628', navRaised: flagDarkMode ? '#121a2c' : '#1a3358', navText: flagDarkMode ? '#d4daf0' : '#f9f3e3', navMuted: flagDarkMode ? '#aebbd2' : '#f0e6c8', background: flagDarkMode ? '#05070d' : '#f9f3e3' } : (isFindMyFood || isEmojiMatch) ? findMyFoodShellTheme : isMoneyBlocks ? moneyBlocksShellTheme : undefined}
        themeOptions={isTicTacRoll ? TIC_TAC_ROLL_THEMES.map(theme => ({ id: theme.id, name: theme.name })) : isAlphabetHunt ? [{ id: 'classroom', name: 'Classroom' }, { id: 'ocean', name: 'Ocean' }, { id: 'arcade', name: 'Arcade' }] : isWordFusion ? [{ id: 'ocean', name: 'Ocean' }, { id: 'forest', name: 'Forest' }, { id: 'sunset', name: 'Sunset' }] : isZooGame ? [{ id: 'savanna', name: 'Savanna' }, { id: 'ocean', name: 'Ocean' }, { id: 'jungle', name: 'Jungle' }] : isWhatsMissing ? [{ id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' }, { id: 'red', name: 'Red' }, { id: 'yellow', name: 'Yellow' }, { id: 'white', name: 'White' }, { id: 'black', name: 'Black' }] : isMoneyBlocks ? [{ id: 'black', name: 'Black' }, { id: 'gold', name: 'Gold' }, { id: 'white', name: 'White' }] : (isFindMyFood || isEmojiMatch) ? [{ id: 'forest', name: 'Enchanted Forest' }, { id: 'safari', name: 'African Safari' }, { id: 'ocean', name: 'Ocean Adventure' }, { id: 'arctic', name: 'Arctic Expedition' }, { id: 'dino', name: 'Dinosaur Island' }] : undefined}
        themeValue={isTicTacRoll ? ticTheme.id : isAlphabetHunt ? alphabetTheme : isWordFusion ? wordFusionTheme : isZooGame ? zooTheme : isWhatsMissing ? whatsMissingTheme : isMoneyBlocks ? moneyBlocksTheme : isFindMyFood ? findMyFoodTheme : undefined}
        onThemeChange={isTicTacRoll ? themeId => setTicTheme(TIC_TAC_ROLL_THEMES.find(theme => theme.id === themeId) ?? TIC_TAC_ROLL_THEMES[0]) : isAlphabetHunt ? setAlphabetTheme : isWordFusion ? setWordFusionTheme : isZooGame ? setZooTheme : isWhatsMissing ? setWhatsMissingTheme : isMoneyBlocks ? setMoneyBlocksTheme : isFindMyFood ? setFindMyFoodTheme : undefined}
        headerExtra={
          <>
            {isAirPuck && airPuckHud && (
              <span className="game-shell-topbar-stats" aria-label="Air Puck controls" style={{ maxWidth: '58vw' }}>
                <span className="game-shell-topbar-stat" aria-label={`${airPuckHud.name} ${airPuckHud.playerScore}, AI ${airPuckHud.aiScore}`}>
                  <b>🔵 {airPuckHud.playerScore}</b><span aria-hidden="true">:</span><b>🔴 {airPuckHud.aiScore}</b>
                </span>
                <label className="game-shell-header-action" style={{ gap: 3, minHeight: 34, padding: '5px 7px' }}>
                  <span aria-hidden="true">🎚</span>
                  <select
                    value={airPuckHud.difficulty}
                    onChange={event => window.dispatchEvent(new CustomEvent('air-puck:set-difficulty', { detail: event.target.value }))}
                    aria-label="Choose Air Puck difficulty"
                    style={{ border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 800, outline: 0, cursor: 'pointer' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <button className="game-shell-header-action" type="button" onClick={() => window.dispatchEvent(new Event('air-puck:restart'))} aria-label="Restart Air Puck match" title="Restart match" style={{ minHeight: 34, minWidth: 36, width: 36, padding: 5 }}>
                  <span aria-hidden="true">↻</span>
                </button>
              </span>
            )}
            {isColourClash && colourClashHud && (
              <span className="game-shell-topbar-stats" aria-label="Colour Clash game progress" style={{ flexWrap: 'wrap' }}>
                <span className="game-shell-topbar-stat"><b>Round {colourClashHud.round}</b></span>
                <span className="game-shell-topbar-stat"><b>⭐ {colourClashHud.score}</b></span>
                <span className="game-shell-topbar-stat"><b>{'❤️'.repeat(colourClashHud.lives)}{'🖤'.repeat(colourClashHud.totalLives - colourClashHud.lives)}</b></span>
                <span className="game-shell-topbar-stat"><b>{colourClashHud.phase === 'showing' ? '👀 Watch' : colourClashHud.phase === 'input' ? '👆 Repeat' : colourClashHud.phase === 'correct' ? '✅ Correct' : colourClashHud.phase === 'wrong' ? '❌ Wrong' : 'Get ready'}</b></span>
                <span className="game-shell-topbar-stat"><b>{colourClashHud.sequenceProgress}/{colourClashHud.sequenceLength}</b><span>Sequence</span></span>
              </span>
            )}
            {isVocabValley && <button className="game-shell-header-action" type="button" onClick={() => window.dispatchEvent(new Event('vocab-valley:trail-map'))} aria-label="Trail map" title="Trail map"><span aria-hidden="true">←</span><span className="game-shell-action-label">Trail map</span></button>}
            {isCountAdd && countAddHud && (
              <>
                <span className="game-shell-topbar-stats" aria-label="Count and Add progress">
                  <span className="game-shell-topbar-stat"><b>{Array.from({ length: 5 }, (_, index) => index < countAddHud.levelStars ? '⭐' : '☆').join('')}</b><span>Level {countAddHud.level}</span></span>
                  <span className="game-shell-topbar-stat"><b>{countAddHud.score}</b><span>Score</span></span>
                </span>
                <label className="game-shell-header-action" style={{ gap: 6 }}>
                  <span aria-hidden="true">🎯</span>
                  <select
                    value={countAddHud.difficulty}
                    onChange={event => window.dispatchEvent(new CustomEvent('count-add:set-difficulty', { detail: event.target.value }))}
                    aria-label="Choose Count and Add difficulty"
                    style={{ border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 800, outline: 0, cursor: 'pointer' }}
                  >
                    <option value="easy">🐣 Easy</option>
                    <option value="medium">🐥 Medium</option>
                    <option value="hard">🦅 Hard</option>
                    <option value="mixed">🎲 Mixed</option>
                  </select>
                </label>
              </>
            )}
            {gameId === 'riddlebombs' && riddleBombsHud?.phase === 'game' && (
              <span className="game-shell-topbar-stats" aria-label="Riddle Bombs progress">
                <span className="game-shell-topbar-stat"><b>{riddleBombsHud.streak}</b><span>Streak</span></span>
                <span className="game-shell-topbar-stat"><b>{riddleBombsHud.score}</b><span>Score</span></span>
                <span className="game-shell-topbar-stat"><b>{riddleBombsHud.question}/10</b><span>Riddle</span></span>
              </span>
            )}
            {isEmojiSports && emojiSportsHud && (
              <span className="game-shell-topbar-stats" aria-label="Sports Quiz progress">
                <span className="game-shell-topbar-stat"><b>⭐ {emojiSportsHud.score}</b><span>Score</span></span>
                <span className="game-shell-topbar-stat"><b>🔥 {emojiSportsHud.streak}</b><span>Streak</span></span>
              </span>
            )}
            {isWeatherWizard && weatherWizardHud && (
              <span className="game-shell-topbar-stats" aria-label="Weather Wizard progress">
                <span className="game-shell-topbar-stat"><b>{weatherWizardHud.question}</b><span>Progress</span></span>
              </span>
            )}
            {isNumberClouds && numberCloudsHud && (
              <span className="game-shell-topbar-stats" aria-label="Number Clouds progress">
                <span className="game-shell-topbar-stat"><b>⭐ {numberCloudsHud.score}</b><span>Score</span></span>
                <span className="game-shell-topbar-stat"><b>☁️ {numberCloudsHud.round}</b><span>Round</span></span>
                <span className="game-shell-topbar-stat"><b>🏆 {numberCloudsHud.best}</b><span>Best</span></span>
              </span>
            )}
            {isWhatsMissing && whatsMissingHud && (
              <span className="game-shell-topbar-stats" aria-label="What's Missing progress">
                <span className="game-shell-topbar-stat"><b>⭐ {whatsMissingHud.score}</b><span>Score</span></span>
                <span className="game-shell-topbar-stat"><b>🔥 {whatsMissingHud.streak}</b><span>Streak</span></span>
                <span className="game-shell-topbar-stat"><b>Round {whatsMissingHud.round}/10</b></span>
              </span>
            )}
            {isSnowySlopes && snowySlopesHud && (
              <span className="game-shell-topbar-stats" aria-label="Snowy Slopes progress">
                <span className="game-shell-topbar-stat"><b>❤️ {snowySlopesHud.lives}</b></span>
                <span className="game-shell-topbar-stat"><b>🪙 {snowySlopesHud.coins}</b></span>
                <span className="game-shell-topbar-stat"><b>⭐ {snowySlopesHud.xp}</b></span>
                <span className="game-shell-topbar-stat">
                  <b style={{ fontSize: '0.8rem' }}>Q{snowySlopesHud.questionIndex + 1}/{snowySlopesHud.totalQuestions}</b>
                </span>
              </span>
            )}
            {isMathRacing && mathRacingHud && (
              <span className="game-shell-topbar-stats" aria-label="Math Racing progress">
                <span className="game-shell-topbar-stat"><b>⭐ {mathRacingHud.score}</b><span>Score</span></span>
                <span className="game-shell-topbar-stat"><b>❓ {mathRacingHud.question}</b><span>Question</span></span>
              </span>
            )}
            {isReadingRescue && readingRescueHud?.active && (
              <span className="game-shell-topbar-stats" aria-label="Find the Letter lives remaining">
                <span className="game-shell-topbar-stat"><b aria-live="polite">{'❤️'.repeat(readingRescueHud.lives)}{'🖤'.repeat(3 - readingRescueHud.lives)}</b><span>Tries</span></span>
              </span>
            )}
            {isAnimalClass && animalClassHud && (
              <span className="game-shell-topbar-stats" aria-label="Animal Class Quest progress">
                <span className="game-shell-topbar-stat"><b>{animalClassHud.level}</b></span>
                <span className="game-shell-topbar-stat"><b>⭐ {animalClassHud.score}</b></span>
                <span className="game-shell-topbar-stat"><b>{animalClassHud.questionIndex + 1}/{animalClassHud.totalQuestions}</b></span>
              </span>
            )}
            {isConnect4 && c4Hud ? <Connect4HeaderActions hud={c4Hud} /> : null}
            {isTicTacRoll && (
              <>
                <button className="game-shell-header-action" type="button" onClick={() => window.dispatchEvent(new Event('tictacroll:new-game'))}>
                  <span aria-hidden="true">↻</span><span className="game-shell-action-label">New Game</span>
                </button>
              </>
            )}
            {isFindMyFood && (
              <>
                <button className="game-shell-header-action" type="button" onClick={() => window.dispatchEvent(new Event('find-my-food:new-game'))} aria-label="New game" title="New game"><span aria-hidden="true">↻</span><span className="game-shell-action-label">New game</span></button>
                <button className="game-shell-header-action" type="button" onClick={() => window.dispatchEvent(new Event('find-my-food:play-again'))} aria-label="Play again" title="Play again"><span aria-hidden="true">▶</span><span className="game-shell-action-label">Play again</span></button>
              </>
            )}
            {isFlagmaster && <button className="game-shell-header-action" type="button" onClick={() => setFlagDarkMode(value => !value)} aria-label="Toggle Flagmaster theme" title="Toggle Flagmaster theme"><span aria-hidden="true">{flagDarkMode ? '☀️' : '🌙'}</span><span className="game-shell-action-label">{flagDarkMode ? 'Light' : 'Dark'}</span></button>}
          </>
        }
        stats={isNumberClouds || isAirPuck ? [] : [
          { label: 'Best', value: state.games[gameId]?.highScore ?? 0, icon: '⭐' },
          { label: 'Coins', value: state.coins, icon: '🪙' },
        ]}
      >
      <Suspense fallback={
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>{gameIcon}</div>
              <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800 }}>Loading {gameName}…</div>
            </div>
          </div>
      }>
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>
          {showRouteWelcome ? (
            isNumberClouds ? (
              <section className="number-clouds-welcome" aria-labelledby="number-clouds-welcome-title" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
                <div style={{ width: 'min(860px, 90vw)', padding: '44px 28px 32px', borderRadius: 34, background: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 22px 60px rgba(19,74,94,0.18)', textAlign: 'center', backdropFilter: 'blur(7px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 'clamp(42px, 5vw, 62px)', fontWeight: 900, color: '#174f78', marginBottom: 8 }}>
                    <span aria-hidden="true">☁️</span>
                    <h1 id="number-clouds-welcome-title" style={{ margin: 0, letterSpacing: '-0.05em' }}>Number Clouds</h1>
                  </div>
                  <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', color: '#25628c', fontWeight: 900, marginBottom: 18 }}>Hop across the clouds!</div>
                  <p style={{ margin: '0 0 22px', color: '#2f5d7b', fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: 700 }}>Choose your flight path.</p>
                  <div style={{ display: 'grid', gap: 14, maxWidth: 760, margin: '0 auto' }}>
                    {['Level 1: Cloud Hopper', 'Level 2: Sky Explorer', 'Level 3: Cloud Master'].map((label, index) => (
                      <button key={label} type="button" onClick={() => setShowRouteWelcome(false)} style={{ width: '100%', padding: '18px 22px', borderRadius: 20, background: index === 0 ? 'linear-gradient(110deg,#eafff2,#c8f2dc)' : index === 1 ? 'linear-gradient(110deg,#fff8d9,#ffeaa0)' : 'linear-gradient(110deg,#e9f3ff,#c9e2ff)', border: '1px solid rgba(255,255,255,0.75)', color: '#174d75', fontSize: 'clamp(1.1rem, 2vw, 1.8rem)', fontWeight: 800, boxShadow: '0 8px 18px rgba(38,102,137,.12)', cursor: 'pointer' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : isPlantVegetableQuiz ? (
              <section aria-labelledby="plant-quiz-welcome-title" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 12px' }}>
                <div style={{ width: 'min(980px, 92vw)', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 30, boxShadow: '0 20px 50px rgba(11,31,26,0.16)', backdropFilter: 'blur(10px)', padding: '26px 24px 30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18, fontWeight: 800, color: '#f7fff4', fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}>
                    <span aria-hidden="true">🌱</span>
                    <h1 id="plant-quiz-welcome-title" style={{ margin: 0, fontSize: 'inherit', letterSpacing: '-0.04em' }}>Plant &amp; Vegetable Quiz</h1>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))', gap: 18, maxWidth: 820, margin: '0 auto' }}>
                    {[
                      { label: 'Learn the Words', icon: '📖', tone: '#dff4e6' },
                      { label: 'Choose the Answer', icon: '✅', tone: '#e1f0df' },
                      { label: 'Spell It', icon: '✏️', tone: '#eff7d6' },
                      { label: 'Plant and Veg Trivia', icon: '🧠', tone: '#e5f0ff' },
                    ].map((entry, index) => (
                      <button key={entry.label} type="button" onClick={() => setShowRouteWelcome(false)} style={{ border: '1px solid rgba(255,255,255,0.6)', background: entry.tone, borderRadius: 22, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#123d2a', fontWeight: 800, cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 24px rgba(14,53,37,0.08)' }}>
                        <span aria-hidden="true" style={{ fontSize: '2.3rem' }}>{entry.icon}</span>
                        <span style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2rem)', letterSpacing: '-0.04em' }}>{entry.label}</span>
                        <small style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>{index === 0 ? 'Level 1' : index === 1 ? 'Level 2' : index === 2 ? 'Level 3' : 'Level 4'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="route-game-welcome" aria-labelledby="route-game-welcome-title">
                <div className="route-game-welcome-card">
                  <div className="route-game-welcome-icon" aria-hidden="true">{gameIcon}</div>
                  <p className="route-game-welcome-kicker">Welcome to</p>
                  <h1 id="route-game-welcome-title">{gameName}</h1>
                  <p>Get ready to play, learn, and build your best score.</p>
                  <button type="button" className="game-shell-primary-action" onClick={() => setShowRouteWelcome(false)}>
                    Start Game
                  </button>
                </div>
              </section>
            )
          ) : !clientReady ? (
            <div role="status" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>{gameIcon}</div>
                <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800 }}>Loading {gameName}…</div>
              </div>
            </div>
          ) : (
            <GameComp
              key={gameSession}
              onComplete={handleComplete}
              profileName={auth?.currentUser ? state.name : ''}
              {...(gameId === 'riddlebombs' ? { onHudUpdate: setRiddleBombsHud } : {})}
              {...(isTicTacRoll ? { themeId: ticTheme.id, onThemeChange: setTicTheme } : {})}
              {...(isConnect4 ? { onHudUpdate: setC4Hud } : {})}
              {...(isReadingRescue ? { onHudUpdate: setReadingRescueHud } : {})}
              {...(isNumberClouds ? { onHudUpdate: setNumberCloudsHud } : {})}
              {...(isEmojiSports ? { onHudUpdate: setEmojiSportsHud } : {})}
              {...(isWeatherWizard ? { onHudUpdate: setWeatherWizardHud } : {})}
              {...(isSnowySlopes ? { onHudUpdate: setSnowySlopesHud } : {})}
              {...(isMathRacing ? { onHudUpdate: setMathRacingHud } : {})}
              {...(isColourClash ? { onHudUpdate: setColourClashHud } : {})}
              {...(isAirPuck ? { onHudUpdate: setAirPuckHud } : {})}
              {...(isAnimalClass ? { onHudUpdate: setAnimalClassHud } : {})}
              {...(isFlagmaster ? { darkMode: flagDarkMode, isCreator } : {})}
              {...(isZooGame ? { themeId: zooTheme } : {})}
              {...(isAlphabetHunt ? { themeId: alphabetTheme } : {})}
              {...(isWhatsMissing ? { themeId: whatsMissingTheme } : {})}
              {...(isMoneyBlocks ? { themeId: moneyBlocksTheme } : {})}
              {...(isFindMyFood || isEmojiMatch ? { themeId: findMyFoodTheme } : {})}
              {...(isWhatsMissing ? { onHudUpdate: setWhatsMissingHud } : {})}
            />
          )}
        </div>
      </Suspense>
      </GameShell>
    </div>
  );
}
