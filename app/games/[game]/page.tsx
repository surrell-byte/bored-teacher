'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/lib/gameState';
import { auth, onAuthStateChanged, saveStudentScore } from '@/lib/firebase';
import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';
import { GAME_NAMES, GAME_ICONS } from '@/constants/index';
import { GAME_COMPONENTS } from '@/games/catalog.components';
import { GameShell } from '@/engine';
import Connect4HeaderActions from '@/components/ui/controls/Connect4HeaderActions';
import { TIC_TAC_ROLL_THEMES, type TicTacRollTheme } from '@/games/tictacroll/themes';
import { canAccessGame, COMING_SOON_GAME_IDS } from '@/config/game-access';

// ── Types ─────────────────────────────────────────────────────
interface GameResult {
  score: number;
  accuracy: number;
  gameId: string;
}

const GAMES_WITH_WELCOME = new Set([
  'animalAdventureRace', 'connect4', 'farmgame', 'findmyfood', 'flagmaster',
  'finnthefox', 'hiddencolours', 'oceanquest', 'parachutedrop', 'weatherwizard',
  'phonicsadventure', 'riddlebombs', 'tictacroll', 'tornado', 'wordfusion', 'weatherwizard', 'victoryvet',
  'turbodash',
]);

// ── Page ──────────────────────────────────────────────────────
export default function GamePage() {
  const params  = useParams();
  const gameId  = (params?.game as string) ?? '';
  const { state, setState, updateGameStats, addXP } = useGame();

  const [result, setResult]   = useState<GameResult | null>(null);
  const [gameSession, setGameSession] = useState(0);
  // Connect 4 hands its in-match HUD (player badges + reset/home) up here so
  // it can render inside the GameShell navbar instead of the play area.
  const [c4Hud, setC4Hud] = useState<any>(null);
  const [ticTheme, setTicTheme] = useState<TicTacRollTheme>(TIC_TAC_ROLL_THEMES[0]);
  const [flagDarkMode, setFlagDarkMode] = useState(false);
  const [zooTheme, setZooTheme] = useState('savanna');
   const isAlphabetHunt = gameId === 'alphabethunt';
   const [alphabetTheme, setAlphabetTheme] = useState('classroom');
  const [wordFusionTheme, setWordFusionTheme] = useState('ocean');
  const [showRouteWelcome, setShowRouteWelcome] = useState(!GAMES_WITH_WELCOME.has(gameId));
  const [accessReady, setAccessReady] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    setShowRouteWelcome(!GAMES_WITH_WELCOME.has(gameId));
  }, [gameId]);

  useEffect(() => onAuthStateChanged(user => {
    setCanPlay(canAccessGame(gameId, user));
    setAccessReady(true);
  }), [gameId]);

  const gameName  = GAME_NAMES[gameId] ?? 'Game';
  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';
  const GameComp  = GAME_COMPONENTS[gameId];
  const isConnect4 = gameId === 'connect4';
  const isTicTacRoll = gameId === 'tictacroll';
  const isFlagmaster = gameId === 'flagmaster';
  const isZooGame = gameId === 'zoogame';
  const isFruitWordHunt = gameId === 'fruitwordhunt';
  const isWordFusion = gameId === 'wordfusion';
  const isWeatherWizard = gameId === 'weatherwizard';
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
    setGameSession(session => session + 1);
  }

  function handleMainMenu() {
    setResult(null);
    setC4Hud(null);
    if (isWeatherWizard) {
      setShowRouteWelcome(false);
      window.dispatchEvent(new Event('weather-wizard:main-menu'));
    } else {
      setShowRouteWelcome(true);
      setGameSession(session => session + 1);
    }
  }

  if (!accessReady) return null;

  if (COMING_SOON_GAME_IDS.has(gameId) && !canPlay) {
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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', overflow: 'hidden' }}>
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
        hidePauseControl={isFlagmaster}
        hideExitControl={isFlagmaster}
        controls={null}
        themeVars={isTicTacRoll ? { nav: ticTheme.surface, navRaised: ticTheme.bg, navText: ticTheme.text, navMuted: ticTheme.muted, background: ticTheme.bg } : isAlphabetHunt ? { nav: alphabetTheme === 'ocean' ? '#087f8c' : alphabetTheme === 'arcade' ? '#352354' : '#1b1b1f', navRaised: alphabetTheme === 'ocean' ? '#e5a83b' : alphabetTheme === 'arcade' ? '#ff71ce' : '#c98a2c', navText: '#fffaf0', navMuted: '#eee8da', background: alphabetTheme === 'ocean' ? '#dff4f2' : alphabetTheme === 'arcade' ? '#24183d' : '#eee8da' } : isWordFusion ? { nav: wordFusionTheme === 'forest' ? '#214c3c' : wordFusionTheme === 'sunset' ? '#7b3f2e' : '#245b6c', navRaised: wordFusionTheme === 'forest' ? '#75b798' : wordFusionTheme === 'sunset' ? '#e29b52' : '#8ed1d5', navText: '#fffaf0', navMuted: '#d6eeee', background: wordFusionTheme === 'forest' ? '#dcefe2' : wordFusionTheme === 'sunset' ? '#f4d4b5' : '#d9eef0' } : isZooGame ? zooShellTheme : isFruitWordHunt ? { nav: '#a5662a', navRaised: '#f7b05e', navText: '#fffbee', navMuted: '#fff0cf', background: '#ffe0b5' } : isFlagmaster ? { nav: flagDarkMode ? '#05070d' : '#0b1628', navRaised: flagDarkMode ? '#121a2c' : '#1a3358', navText: flagDarkMode ? '#d4daf0' : '#f9f3e3', navMuted: flagDarkMode ? '#aebbd2' : '#f0e6c8', background: flagDarkMode ? '#05070d' : '#0b1628' } : undefined}
        themeOptions={isTicTacRoll ? TIC_TAC_ROLL_THEMES.map(theme => ({ id: theme.id, name: theme.name })) : isAlphabetHunt ? [{ id: 'classroom', name: 'Classroom' }, { id: 'ocean', name: 'Ocean' }, { id: 'arcade', name: 'Arcade' }] : isWordFusion ? [{ id: 'ocean', name: 'Ocean' }, { id: 'forest', name: 'Forest' }, { id: 'sunset', name: 'Sunset' }] : isZooGame ? [{ id: 'savanna', name: 'Savanna' }, { id: 'ocean', name: 'Ocean' }, { id: 'jungle', name: 'Jungle' }] : undefined}
        themeValue={isTicTacRoll ? ticTheme.id : isAlphabetHunt ? alphabetTheme : isWordFusion ? wordFusionTheme : isZooGame ? zooTheme : undefined}
        onThemeChange={isTicTacRoll ? themeId => setTicTheme(TIC_TAC_ROLL_THEMES.find(theme => theme.id === themeId) ?? TIC_TAC_ROLL_THEMES[0]) : isAlphabetHunt ? setAlphabetTheme : isWordFusion ? setWordFusionTheme : isZooGame ? setZooTheme : undefined}
        headerExtra={
          <>
            {isConnect4 && c4Hud ? <Connect4HeaderActions hud={c4Hud} /> : null}
            {isTicTacRoll && (
              <>
                <button className="game-shell-header-action" type="button" onClick={() => window.dispatchEvent(new Event('tictacroll:new-game'))}>
                  New Game
                </button>
              </>
            )}
            {isFlagmaster && <button className="game-shell-header-action" type="button" onClick={() => setFlagDarkMode(value => !value)} aria-label="Toggle Flagmaster theme">{flagDarkMode ? '☀️ Light' : '🌙 Dark'}</button>}
          </>
        }
        stats={[
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
          ) : (
            <GameComp
              key={gameSession}
              onComplete={handleComplete}
              {...(isTicTacRoll ? { themeId: ticTheme.id, onThemeChange: setTicTheme } : {})}
              {...(isConnect4 ? { onHudUpdate: setC4Hud } : {})}
              {...(isFlagmaster ? { darkMode: flagDarkMode } : {})}
              {...(isZooGame ? { themeId: zooTheme } : {})}
               {...(isAlphabetHunt ? { themeId: alphabetTheme } : {})}
            />
          )}
        </div>
      </Suspense>
      </GameShell>
    </div>
  );
}
