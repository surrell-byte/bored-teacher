'use client';

import { Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/lib/gameState';
import { auth, saveStudentScore } from '@/lib/firebase';
import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';
import { GAME_NAMES, GAME_ICONS } from '@/constants/index';
import { GAME_COMPONENTS } from '@/games/catalog.components';
import { GameShell } from '@/engine';
import DesktopControls from '@/components/ui/controls/DesktopControls';

// ── Types ─────────────────────────────────────────────────────
interface GameResult {
  score: number;
  accuracy: number;
  gameId: string;
}

// ── Page ──────────────────────────────────────────────────────
export default function GamePage() {
  const params  = useParams();
  const gameId  = (params?.game as string) ?? '';
  const { state, setState, updateGameStats, addXP } = useGame();

  const [result, setResult]   = useState<GameResult | null>(null);
  const [gameSession, setGameSession] = useState(0);

  const gameName  = GAME_NAMES[gameId] ?? 'Game';
  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';
  const GameComp  = GAME_COMPONENTS[gameId];

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
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflow: 'hidden' }}>
      <GameShell
        gameId={gameId}
        title={gameName}
        icon={gameIcon}
        sessionKey={gameSession}
        completion={result}
        onContinue={handleContinue}
        onRestart={handleContinue}
        controls={<DesktopControls />}
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
          <GameComp key={gameSession} onComplete={handleComplete} />
        </div>
      </Suspense>
      </GameShell>
    </div>
  );
}
