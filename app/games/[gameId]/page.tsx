'use client';
// app/games/[gameId]/page.tsx
// Wraps legacy HTML game files in a full-screen iframe.
// The game communicates back via postMessage when complete.

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame, xpForLevel } from '@/lib/gameState';
import { GAME_NAMES, GAME_ICONS, GAME_URLS, GAME_KEYS } from '@/lib/constants';

interface GameResult {
  score: number;
  accuracy: number;
  gameId: string;
}

function ResultModal({
  result, gameName, onContinue,
}: {
  result: GameResult; gameName: string; onContinue: () => void;
}) {
  const xpEarned    = Math.round(result.accuracy / 2);
  const coinsEarned = Math.round(result.accuracy / 10);
  const pct         = Math.min(100, result.accuracy);
  const color       = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)';
  const feedback    = pct >= 90 ? '🌟 Outstanding!' : pct >= 80 ? '🔥 Excellent work!' : pct >= 70 ? '👍 Good job!' : pct >= 50 ? '💪 Keep practising!' : '📚 Review the material and try again.';

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal aria-labelledby="perfTitle">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title" id="perfTitle">Round Complete — {gameName}</div>
        </div>
        <div className="result-grid">
          <div className="result-card"><div className="result-card-label">Score</div><div className="result-card-value">{result.score}</div></div>
          <div className="result-card"><div className="result-card-label">Accuracy</div><div className="result-card-value">{result.accuracy}%</div></div>
          <div className="result-card"><div className="result-card-label">XP Earned</div><div className="result-card-value" style={{ color: 'var(--gold)' }}>+{xpEarned}</div></div>
          <div className="result-card"><div className="result-card-label">Coins</div><div className="result-card-value" style={{ color: 'var(--green)' }}>+{coinsEarned}</div></div>
        </div>
        <div className="accuracy-bar">
          <div className="accuracy-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="result-feedback">{feedback}</div>
        <button className="btn-primary" onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
}

export default function GamePage() {
  const router   = useRouter();
  const params   = useParams();
  const gameId   = (params?.gameId as string) ?? '';
  const { state, setState, updateGameStats, addXP } = useGame();

  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);

  const gameName = GAME_NAMES[gameId] ?? 'Game';
  const gameIcon = GAME_ICONS[gameId] ?? '🎮';
  const gameUrl  = GAME_URLS[gameId];

  // Listen for postMessage from game iframes
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'object') return;
      const { type, score, accuracy, gameId: gid } = e.data;
      if (type === 'gameComplete' || type === 'eslhub_result') {
        const acc  = Math.min(100, Math.max(0, Number(accuracy) || 0));
        const scr  = Number(score) || acc;
        const rid  = (gid as string) || gameId;

        // Update stats
        const prev = state.games[rid] ?? { highScore: 0, completions: 0, lastAccuracy: 0, totalQuestions: 100 };
        updateGameStats(rid, {
          highScore:    Math.max(prev.highScore, scr),
          completions:  prev.completions + 1,
          lastAccuracy: acc,
        });
        addXP(Math.round(acc / 2));
        setState({ lastGame: rid, coins: state.coins + Math.round(acc / 10) });
        setResult({ score: scr, accuracy: acc, gameId: rid });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gameId, state, updateGameStats, addXP, setState]);

  function handleContinue() {
    setResult(null);
    router.push('/hub');
  }

  if (!gameUrl) {
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
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Thin topbar */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface-strong)', flexShrink: 0, zIndex: 10,
      }}>
        <Link href="/hub" className="lb-back-btn" style={{ textDecoration: 'none' }}>← Hub</Link>
        <span style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '0.95rem' }}>
          {gameIcon} {gameName}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <span>Lv {state.level}</span>
          <span>🪙 {state.coins}</span>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{gameIcon}</div>
            <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800 }}>Loading {gameName}…</div>
          </div>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        ref={iframeRef}
        src={`/${gameUrl}`}
        title={gameName}
        style={{ flex: 1, border: 'none', width: '100%' }}
        onLoad={() => setLoading(false)}
        allow="autoplay"
      />

      {/* Result modal */}
      {result && <ResultModal result={result} gameName={gameName} onContinue={handleContinue} />}
    </div>
  );
}
