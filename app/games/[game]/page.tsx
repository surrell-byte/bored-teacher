'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/lib/gameState';
import { auth, saveStudentScore } from '@/lib/firebase';
import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';
import { GAME_NAMES, GAME_ICONS, GAME_URLS } from '@/constants/index';

// ── React game component props and registry ──
type GameComponentProps = {
  onComplete: (score: number, accuracy: number) => void;
};

const GAME_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<GameComponentProps>> | undefined
> = {
  unicorn: lazy(() => import('@/games/unicorn-run/UnicornRun.jsx')),
  warriors: lazy(() => import('@/games/warriors-grammar-slam/WarriorsGrammarSlam.jsx')),
  memory: lazy(() => import('@/games/memory-game/MemoryMatch.jsx')),
  compound: lazy(() => import('@/games/compound-word-quest/CompoundWordQuest.jsx')),
  wordmatch: lazy(() => import('@/games/word-match/WordMatch.jsx')),
  missingfruit: lazy(() => import('@/games/missing-fruit/MissingFruit.jsx')),
  animalclass: lazy(() => import('@/games/animal-class-quest/AnimalClassQuest.jsx')),
  colourclash: lazy(() => import('@/games/colour-clash/ColourClash.jsx')),
  crimsonduel: lazy(() => import('@/games/crimson-color-duel/CrimsonColorDuel.jsx')),
  deepseaReveal: lazy(() => import('@/games/deep-sea-reveal/DeepSeaReveal.jsx')),
  emojimatch: lazy(() => import('@/games/emoji-match/EmojiMatch.jsx')),
  emojispelling: lazy(() => import('@/games/emoji-spelling-game/EmojiSpellingMaster.jsx')),
  familyquest: lazy(() => import('@/games/family-quest/FamilyQuest.jsx')),
  farmgame: lazy(() => import('@/games/farm-game/FarmGame.jsx')),
  findmyfood: lazy(() => import('@/games/find-my-food/FindMyFood.jsx')),
  flagmaster: lazy(() => import('@/games/flagmaster/Flagmaster.jsx')),
  foodwordhunt: lazy(() => import('@/games/food-word-hunt/FoodWordHunt.jsx')),
  fruitwordhunt: lazy(() => import('@/games/fruit-word-hunt/FruitWordHunt.jsx')),
  lakersracer: lazy(() => import('@/games/lakers-showtime-racer/LakersShowtimeRacer.jsx')),
  neonbridge: lazy(() => import('@/games/neon-bridge-of-destiny/NeonBridgeOfDestiny.jsx')),
  oceanquest: lazy(() => import('@/games/ocean-quest/OceanQuest.jsx')),
  pacman: lazy(() => import('@/games/pac-man/PacMan.jsx')),
  phonicsadventure: lazy(() => import('@/games/phonics-adventure/PhonicAdventure.jsx')),
  phonicsworld: lazy(() => import('@/games/phonics-world/PhonicWorld.jsx')),
  shuttlecock: lazy(() => import('@/games/shuttlecock-smash/ShuttlecockSmash.jsx')),
  tornado: lazy(() => import('@/games/tornado/Tornado.jsx')),
  wgrandprix: lazy(() => import('@/games/w-grand-prix/WGrandPrix.jsx')),
  connect4: lazy(() => import('@/games/connect-4/Connect4.jsx')),
  monkeytree: lazy(() => import('@/games/monkey-tree-climb/MonkeyTreeClimb.jsx')),
  blockfight: lazy(() => import('@/games/block-fight/BlockFight')),
};

// ── Types ─────────────────────────────────────────────────────
interface GameResult {
  score: number;
  accuracy: number;
  gameId: string;
}

// ── Result modal (unchanged from original) ────────────────────
function ResultModal({ result, gameName, onContinue }: {
  result: GameResult; gameName: string; onContinue: () => void;
}) {
  const xpEarned    = Math.round(result.accuracy / 2);
  const coinsEarned = Math.round(result.accuracy / 10);
  const pct         = Math.min(100, result.accuracy);
  const color       = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)';
  const feedback    = pct >= 90 ? '🌟 Outstanding!' : pct >= 80 ? '🔥 Excellent work!': pct >= 70 ? '👍 Good job!' : pct >= 50 ? '💪 Keep practising!' : '📚 Review the material and try again.';
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

// ── Page ──────────────────────────────────────────────────────
export default function GamePage() {
  const router  = useRouter();
  const params  = useParams();
  const gameId  = (params?.game as string) ?? '';
  const { state, setState, updateGameStats, addXP } = useGame();

  const [result, setResult]   = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);

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
    router.push('/hub');
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
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Floating back-to-hub button */}
      <Link
        href="/hub"
        className="lb-back-btn"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 20,
          textDecoration: 'none',
        }}
      >
        ←Hub
      </Link>

      {/* Game area */}
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
            <GameComp onComplete={handleComplete} />
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
            src={`/${legacyUrl}`}
            title={gameName}
            style={{ flex: '1 1 0', minHeight: 0, border: 'none', width: '100%', display: 'block' }}
            onLoad={() => setLoading(false)}
            allow="autoplay"
          />
        </>
      )}

      {result && <ResultModal result={result} gameName={gameName} onContinue={handleContinue} />}
    </div>
  );
}