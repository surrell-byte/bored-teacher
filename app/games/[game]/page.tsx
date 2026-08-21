'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/lib/gameState';
import { auth, saveStudentScore } from '@/lib/firebase';
import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';
import { GAME_NAMES, GAME_ICONS } from '@/constants/index';
import { GAME_COMPONENTS } from '@/games/catalog.components';
import { GameShell } from '@/engine';
import Connect4HeaderActions from '@/components/ui/controls/Connect4HeaderActions';

// ── Types ─────────────────────────────────────────────────────
interface GameResult {
  score: number;
  accuracy: number;
  gameId: string;
}

const GAMES_WITH_WELCOME = new Set([
  'animalAdventureRace', 'connect4', 'farmgame', 'findmyfood', 'flagmaster',
  'finnthefox', 'hiddencolours', 'oceanquest', 'parachutedrop',
  'phonicsadventure', 'riddlebombs', 'tictacroll', 'tornado',
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
  const [showRouteWelcome, setShowRouteWelcome] = useState(!GAMES_WITH_WELCOME.has(gameId));

  useEffect(() => {
    setShowRouteWelcome(!GAMES_WITH_WELCOME.has(gameId));
  }, [gameId]);

  const gameName  = GAME_NAMES[gameId] ?? 'Game';
  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';
  const GameComp  = GAME_COMPONENTS[gameId];
  const isConnect4 = gameId === 'connect4';

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

    if (auth.currentUser && state.classId) {
      saveStudentScore(auth.currentUser.uid, state.classId, state.name, updatedGames).catch(() => {});
    }
    setResult({ score: scr, accuracy: acc, gameId });
  }

  function handleContinue() {
    setResult(null);
    setC4Hud(null);
    setGameSession(session => session + 1);
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
    <div style={{ position: 'fixed', inset: 0, background: '#080b12', overflow: 'hidden' }}>
      <GameShell
        gameId={gameId}
        title={gameName}
        icon={gameIcon}
        sessionKey={gameSession}
        completion={result}
        onContinue={handleContinue}
        onRestart={handleContinue}
        controls={null}
        headerExtra={
          <>
            {isConnect4 && c4Hud ? <Connect4HeaderActions hud={c4Hud} /> : null}
            <Link className="game-shell-header-action" href="/games">
              Back to Menu
            </Link>
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
              {...(isConnect4 ? { onHudUpdate: setC4Hud } : {})}
            />
          )}
        </div>
      </Suspense>
      </GameShell>
    </div>
  );
}
