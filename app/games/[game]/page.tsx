'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/lib/gameState';
import { auth, saveStudentScore } from '@/lib/firebase';
import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';
import { GAME_NAMES, GAME_ICONS, GAME_URLS } from '@/constants/index';
import { GAME_COMPONENTS } from '@/games/catalog.components';
import { GameShell } from '@/engine';

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
  const [loading, setLoading] = useState(true);
  const [gameSession, setGameSession] = useState(0);

  const gameName  = GAME_NAMES[gameId] ?? 'Game';
  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';
  const GameComp  = GAME_COMPONENTS[gameId];
  const legacyUrl = GAME_URLS[gameId];

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

  // ── postMessage: legacy iframe games ──
  useEffect(() => {
    if (GameComp) return; // skip listener if using React component
    function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'object') return;
      const { type, score, accuracy, gameId: gid } = e.data;
      if (type === 'gameComplete' || type === 'eslhub_result') {
        const acc = Math.min(100, Math.max(0, Number(accuracy) || 0));
        const scr = Number(score) || acc;
        const rid = (gid as string) || gameId;
        handleComplete(scr, acc);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gameId, GameComp]);

  function handleContinue() {
    setResult(null);
    setGameSession(session => session + 1);
  }

  if (!GameComp && !legacyUrl) {
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
        stats={[
          { label: 'Best', value: state.games[gameId]?.highScore ?? 0, icon: '⭐' },
          { label: 'Coins', value: state.coins, icon: '🪙' },
        ]}
      >
      {GameComp ? (
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
      ) : (
        <>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', pointerEvents:'none' }}>
              <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>{gameIcon}</div>
                <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800}}>Loading {gameName}…</div>
              </div>
            </div>
          )}
          <iframe
            key={gameSession}
            src={`/${legacyUrl}`}
            title={gameName}
            style={{ flex: '1 1 0', minHeight: 0, border: 'none', width: '100%', display: 'block' }}
            onLoad={() => setLoading(false)}
            allow="autoplay"
          />
        </>
      )}
      </GameShell>
    </div>
  );
}
