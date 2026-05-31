'use client';
// app/leaderboard/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/lib/gameState';
import Toast from '@/components/Toast';
import Navbar from '@/components/Navbar';
import {
  getSortedLeaderboard, addPlayersToLeaderboard, removePlayer, clearLeaderboard,
  saveLeaderboard, parseCSVToNames, syncCurrentPlayerToLeaderboard,
  type LBPlayerWithScore,
} from '@/lib/leaderboard';
import { GAME_KEYS, GAME_NAMES, GAME_ICONS } from '@/lib/constants';

const MEDALS = ['🥇', '🥈', '🥉'];

function Podium({ players }: { players: LBPlayerWithScore[] }) {
  const top = players.slice(0, 3);
  const order = [1, 0, 2];
  return (
    <div className="lb-podium">
      {order.map(i => {
        const p = top[i];
        if (!p) return <div key={i} className="podium-slot" />;
        const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div key={i} className="podium-slot">
            <div className={`podium-avatar rank-${i + 1}`}>
              {initials}
              <span className="podium-medal">{MEDALS[i]}</span>
            </div>
            <div className="podium-name">{p.name}</div>
            <div className="podium-score">{p.score.total} pts</div>
            <div className={`podium-block block-${i + 1}`} style={{ height: [120, 160, 90][i] }} />
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { state } = useGame();

  const [ready,    setReady]    = useState(false);
  const [players,  setPlayers]  = useState<LBPlayerWithScore[]>([]);
  const [selected, setSelected] = useState<LBPlayerWithScore | null>(null);
  const [activeGame, setActiveGame] = useState<string>('all');

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); loadPlayers(); return; }
    const unsub = onAuthStateChanged(user => {
      if (!user) { router.replace('/auth'); return; }
      setReady(true);
      loadPlayers();
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadPlayers() {
    syncCurrentPlayerToLeaderboard();
    setPlayers(getSortedLeaderboard());
  }

  const totalPlayers = players.length;
  const totalGames   = players.reduce((a, p) => a + p.score.gamesPlayed, 0);
  const highestScore = players[0]?.score.total ?? 0;

  if (!ready) return null;

  return (
    <div className="lb-page">
      <Navbar />
      <Toast />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 20,
        alignItems: 'start',
      }}>
        <div className="lb-hero-panel shell-card">
          <div className="lb-hero-eyebrow">Class Rankings</div>
          <div className="lb-hero-title">Leaderboard</div>
          <div className="lb-hero-sub">
            Track your students' progress across all games. Rankings update live as scores are posted.
          </div>
          <div className="lb-hero-stats">
            <div className="lb-hero-stat">
              <div className="lb-hero-stat-val">{totalPlayers}</div>
              <div className="lb-hero-stat-lab">Players</div>
            </div>
            <div className="lb-hero-stat">
              <div className="lb-hero-stat-val">{totalGames}</div>
              <div className="lb-hero-stat-lab">Games Played</div>
            </div>
            <div className="lb-hero-stat">
              <div className="lb-hero-stat-val">{highestScore}</div>
              <div className="lb-hero-stat-lab">Top Score</div>
            </div>
          </div>
        </div>
        <Podium players={players} />
      </div>

      {/* ── Game filter tabs ───────────────────────────────── */}
      <div className="shell-card" style={{ padding: '16px 20px', marginBottom: 16, overflowX: 'auto', display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
        <button
          className={`lb-tab${activeGame === 'all' ? ' active' : ''}`}
          onClick={() => setActiveGame('all')}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          🏆 Overall
        </button>
        {GAME_KEYS.map(k => (
          <button
            key={k}
            className={`lb-tab${activeGame === k ? ' active' : ''}`}
            onClick={() => setActiveGame(k)}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {GAME_ICONS[k]} {GAME_NAMES[k]}
          </button>
        ))}
      </div>

      {/* ── Rankings table ─────────────────────────────────── */}
      <div className="shell-card" style={{ padding: '0 0 16px' }}>
        {players.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>🏆</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No players yet</div>
            <div style={{ fontSize: '0.88rem' }}>Go to the Hub and click <strong>Manage Players</strong> to add your class.</div>
            <Link href="/hub" className="pill-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>← Back to Hub</Link>
          </div>
        ) : activeGame !== 'all' && players.every(p => !(p.games[activeGame]?.best)) ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>🎮</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No scores yet for {GAME_NAMES[activeGame]}</div>
            <div style={{ fontSize: '0.88rem' }}>No players have completed this game yet.</div>
            <button className="pill-btn" style={{ marginTop: 16 }} onClick={() => setActiveGame('all')}>← Back to Overall</button>
          </div>
        ) : (
          <div className="lb-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Player', activeGame === 'all' ? 'Total Score' : GAME_NAMES[activeGame], 'Avg %', 'Games'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const gameScore = activeGame !== 'all' ? (p.games[activeGame]?.best ?? 0) : null;
                  const display   = activeGame === 'all' ? p.score.total : gameScore;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(selected?.id === p.id ? null : p)}
                      style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)', background: selected?.id === p.id ? 'var(--surface-soft)' : undefined, transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '1.1rem' }}>{MEDALS[i] ?? `${i + 1}`}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display, Syne)', fontWeight: 800, color: 'var(--gold)' }}>
                        {display || '—'}{activeGame !== 'all' && display ? '%' : ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.score.avg}%</td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{p.score.gamesPlayed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Expanded player detail ──────────────────────────── */}
      {selected && (
        <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', fontWeight: 800 }}>
              📊 {selected.name}'s Game Breakdown
            </h2>
            <button className="lb-modal-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {GAME_KEYS.map(k => {
              const g    = selected.games[k];
              const best = g?.best ?? 0;
              return (
                <div key={k} style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--surface-soft)', border: '1px solid var(--border)', opacity: best > 0 ? 1 : 0.45 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--muted)' }}>{GAME_ICONS[k]} {GAME_NAMES[k]}</div>
                  <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold)' }}>{best > 0 ? `${best}%` : '—'}</div>
                  {g?.played ? <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{g.played}× played</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}