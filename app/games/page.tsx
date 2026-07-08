'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';
import {
  GAME_KEYS, NEW_GAME_KEYS, GAME_NAMES, GAME_ICONS, GAME_TAGS,
  GAME_DIFFICULTY, GAME_DESC,
} from '@/constants/index';
import GameCard from '@/components/cards/GameCard';
import ManagePlayersModal from '@/features/players/components/ManagePlayersModal';

const CATEGORY_OPTIONS = [
  'All Categories',
  ...Array.from(new Set(GAME_KEYS.map(k => GAME_TAGS[k]?.label).filter(Boolean))).sort(),
];

const DIFFICULTY_OPTIONS = [
  'All Difficulties',
  ...Array.from(new Set(GAME_KEYS.map(k => GAME_DIFFICULTY[k]).filter(Boolean))).sort(),
];

const SORT_OPTIONS = [
  { label: 'Sort: Newest',      value: 'newest' },
  { label: 'Sort: Best Score',  value: 'score' },
  { label: 'Sort: Most Played', value: 'played' },
  { label: 'Sort: A–Z',         value: 'alpha' },
];

export default function GamesPage() {
  const router = useRouter();
  const { state } = useGame();

  const [ready,      setReady]      = useState(false);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All Categories');
  const [difficulty, setDifficulty] = useState('All Difficulties');
  const [sort,       setSort]       = useState('newest');
  const [playedOnly, setPlayedOnly] = useState(false);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); return; }
    const unsub = onAuthStateChanged(user => {
      if (!user) { router.replace('/auth'); return; }
      setReady(true);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = useCallback((gameId: string) => {
    router.push(`/games/${gameId}`);
  }, [router]);

  const filteredGames = useMemo(() => {
    const q = search.toLowerCase().trim();
    let games = [...GAME_KEYS];
    if (playedOnly) games = games.filter(k => (state.games[k]?.completions ?? 0) > 0);
    if (category !== 'All Categories') games = games.filter(k => GAME_TAGS[k]?.label === category);
    if (difficulty !== 'All Difficulties') games = games.filter(k => GAME_DIFFICULTY[k] === difficulty);
    if (q) {
      games = games.filter(k => {
        const name = GAME_NAMES[k]?.toLowerCase() ?? '';
        const desc = GAME_DESC[k]?.toLowerCase() ?? '';
        const topic = GAME_TAGS[k]?.label?.toLowerCase() ?? '';
        return name.includes(q) || desc.includes(q) || topic.includes(q);
      });
    }
    if (sort === 'newest') {
      const newSet = new Set(NEW_GAME_KEYS as readonly string[]);
      games.sort((a, b) => Number(newSet.has(b)) - Number(newSet.has(a)));
    }
    if (sort === 'score')  games.sort((a, b) => (state.games[b]?.highScore ?? 0) - (state.games[a]?.highScore ?? 0));
    if (sort === 'played') games.sort((a, b) => (state.games[b]?.completions ?? 0) - (state.games[a]?.completions ?? 0));
    if (sort === 'alpha')  games.sort((a, b) => (GAME_NAMES[a] ?? '').localeCompare(GAME_NAMES[b] ?? ''));
    return games;
  }, [search, category, difficulty, sort, playedOnly, state.games]);

  const totalPlayed = GAME_KEYS.filter(k => (state.games[k]?.completions ?? 0) > 0).length;
  const totalScore  = Object.values(state.games).reduce((a, g) => a + (g.highScore ?? 0), 0);

  const hasActiveFilters = category !== 'All Categories' || difficulty !== 'All Difficulties' || !!search || playedOnly;

  function clearFilters() {
    setCategory('All Categories'); setDifficulty('All Difficulties'); setSearch(''); setPlayedOnly(false);
  }

  if (!ready) return null;

  return (
    <div className="hub-page">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="games-header-row">
        <div>
          <h1 className="hub-welcome-title" style={{ marginBottom: 4 }}>Games</h1>
          <p className="hub-welcome-sub" style={{ marginBottom: 0 }}>Learn, play, and master new skills</p>
        </div>
        <div className="games-stats-row">
          {[
            { icon: '🎮', val: totalPlayed,              lbl: 'Games Played', color: 'var(--teal)' },
            { icon: '⭐', val: totalScore,                lbl: 'Total Score',  color: 'var(--gold)' },
            { icon: '🪙', val: state.coins,               lbl: 'Coins',        color: 'var(--green)' },
            { icon: '🔥', val: state.loginStreak || 0,    lbl: 'Day Streak',   color: 'var(--coral)' },
          ].map(s => (
            <div key={s.lbl} className="games-stat-badge">
              <span className="hero-stat-icon">{s.icon}</span>
              <div>
                <div className="hero-stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="hero-stat-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search + played-only + manage players ──────────── */}
      <div className="hub-filter-row">
        <div className="hub-search">
          <span className="hub-search-icon">🔍</span>
          <input
            type="search"
            className="hub-search-input"
            placeholder="Search games…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search games"
          />
          {search && (
            <button className="hub-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
        <label className="games-checkbox-row">
          <input type="checkbox" checked={playedOnly} onChange={e => setPlayedOnly(e.target.checked)} />
          Played Only
        </label>
        <button className="pill-btn" onClick={() => setShowManage(true)} style={{ marginLeft: 'auto' }}>
          👥 Manage Players
        </button>
      </div>

      {/* ── Featured Games ──────────────────────────────────── */}
      {!search && category === 'All Categories' && !playedOnly && (
        <section className="hub-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 className="hub-section-title" style={{ marginBottom: 0 }}>⭐ Featured Games</h2>
          </div>
          <div className="hub-featured-grid">
            {NEW_GAME_KEYS.map(gameId => (
              <GameCard key={gameId} gameId={gameId} onClick={handlePlay} />
            ))}
          </div>
        </section>
      )}

      {/* ── All Games ────────────────────────────────────────── */}
      <section className="hub-section">
        <h2 className="hub-section-title">All Games</h2>

        <div className="games-select-row">
          <select className="games-select" value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="games-select" value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-label="Filter by difficulty">
            {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="games-select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort games">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="hub-game-count">
          <span className="hub-game-count-num">{filteredGames.length}</span>
          <span>{filteredGames.length === GAME_KEYS.length ? 'games' : `of ${GAME_KEYS.length} games`}</span>
          {hasActiveFilters && (
            <button className="pill-btn" style={{ fontSize: '0.7rem', padding: '3px 10px', marginLeft: 'auto' }} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {filteredGames.length === 0 ? (
          <div className="shell-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔍</div>
            <div className="hub-empty-title">No games match your filters</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
              Try a different search term, category, or difficulty level.
            </div>
          </div>
        ) : (
          <div className="games-list-grid">
            {filteredGames.map((gameId, i) => (
              <button
                key={gameId}
                className="games-list-tile card-stagger"
                style={{ '--stagger-i': i } as React.CSSProperties}
                onClick={() => handlePlay(gameId)}
              >
                <span className="games-list-icon">{GAME_ICONS[gameId] ?? '🎮'}</span>
                <span className="games-list-info">
                  <span className="games-list-title">{GAME_NAMES[gameId] ?? 'Game'}</span>
                  <span className="games-list-desc">{GAME_DESC[gameId] ?? ''}</span>
                  <span className="games-list-level">{GAME_DIFFICULTY[gameId] ?? ''}</span>
                </span>
                <span className="games-list-chevron">›</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {showManage && <ManagePlayersModal onClose={() => setShowManage(false)} />}
    </div>
  );
}

