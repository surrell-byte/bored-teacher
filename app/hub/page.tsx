'use client';
// app/hub/page.tsx — Main game hub

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame, xpForLevel } from '@/lib/gameState';
import {
  GAME_KEYS, GAME_NAMES, GAME_ICONS, GAME_TAGS, GAME_DIFFICULTY,
} from '@/lib/constants';
import GameCard from '@/components/GameCard';
import ManagePlayersModal from '@/components/ManagePlayersModal';

const TAG_FILTERS = [
  { label: '⚡ All Games', value: 'all' },
  { label: '📖 Vocabulary',     value: 'Vocabulary' },
  { label: '✍️ Grammar',        value: 'Grammar' },
  { label: '🔗 Word Formation', value: 'Word Formation' },
  { label: '🔬 Science',        value: 'Science' },
  { label: '🔤 Phonics',        value: 'Phonics' },
  { label: '💡 Logic',          value: 'Logic' },
  { label: '🎨 Colours',        value: 'Colours' },
  { label: '🚩 Geography',      value: 'Geography' },
  { label: '📝 Spelling',       value: 'Spelling' },
  { label: '🧠 Memory',         value: 'Memory' },
];

const DIFFICULTY_FILTERS = [
  'All', 'Starter', 'Intermediate', 'Puzzle', 'Competitive', 'Mixed Skills', 'Arcade',
];

const SORT_OPTIONS = [
  { label: '📋 Default', value: 'default' },
  { label: '🏆 Best Score', value: 'score' },
  { label: '🎮 Most Played', value: 'played' },
  { label: '🔠 A–Z', value: 'alpha' },
];

export default function HubPage() {
  const router = useRouter();
  const { state, checkDailyReward, showToast } = useGame();

  const [ready,  setReady]  = useState(false);
  const [search, setSearch] = useState('');
  const [tag,    setTag]    = useState('all');
  const [diff,   setDiff]   = useState('All');
  const [sort,   setSort]   = useState('default');
  const [showManage, setShowManage] = useState(false);
  const [showPlayed, setShowPlayed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); checkDailyReward(); return; }
    const unsub = onAuthStateChanged((user) => {
      if (!user) { router.replace('/auth'); return; }
      setReady(true);
      checkDailyReward();
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
    if (showPlayed) games = games.filter(k => (state.games[k]?.completions ?? 0) > 0);
    if (tag !== 'all') games = games.filter(k => GAME_TAGS[k]?.label === tag);
    if (diff !== 'All') games = games.filter(k => GAME_DIFFICULTY[k] === diff);
    if (q) {
      games = games.filter(k =>
        GAME_NAMES[k]?.toLowerCase().includes(q) ||
        GAME_TAGS[k]?.label?.toLowerCase().includes(q) ||
        GAME_DIFFICULTY[k]?.toLowerCase().includes(q)
      );
    }
    if (sort === 'score') games.sort((a, b) => (state.games[b]?.highScore ?? 0) - (state.games[a]?.highScore ?? 0));
    else if (sort === 'played') games.sort((a, b) => (state.games[b]?.completions ?? 0) - (state.games[a]?.completions ?? 0));
    else if (sort === 'alpha') games.sort((a, b) => (GAME_NAMES[a] ?? '').localeCompare(GAME_NAMES[b] ?? ''));
    return games;
  }, [search, tag, diff, sort, showPlayed, state.games]);

  const totalPlayed = GAME_KEYS.filter(k => (state.games[k]?.completions ?? 0) > 0).length;
  const totalScore  = Object.values(state.games).reduce((a, g) => a + (g.highScore ?? 0), 0);
  const xpNeeded    = xpForLevel(state.level);
  const xpPct       = Math.min(100, Math.round((state.xp / xpNeeded) * 100));

  if (!ready) return null;

  return (
    <div className="hub-page">

      {/* ── Hero / stats bar ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(500px, 1.5fr) minmax(280px, .8fr)',
        gap: 16,
        marginTop: 20,
        marginBottom: 22,
      }}>
        {/* Welcome card */}
        <div className="shell-card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 28 }}>
          <div className="hero-kicker">
            🎮 Game Library
          </div>
          <h1 style={{ fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Welcome back, {state.name.split(' ')[0]} {state.avatar}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: '50ch', marginBottom: 20 }}>
            {totalPlayed === 0
              ? "Pick a game and start your journey. Every round sharpens your English!"
              : `You've completed ${totalPlayed} of ${GAME_KEYS.length} games. Keep the streak going!`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display, Syne)', fontSize: '0.78rem', fontWeight: 800, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
              Lv {state.level}
            </span>
            <div className="hub-xp-bar" style={{ flex: 1 }}>
              <div className="hub-xp-fill progress-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              {state.xp} / {xpNeeded} XP
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="shell-card" style={{
          padding: 'clamp(16px, 3vw, 24px)',
          borderRadius: 28,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          {[
            { label: 'Games Played', val: totalPlayed,            color: 'var(--teal)',  icon: '🎮' },
            { label: 'Total Score',  val: totalScore,             color: 'var(--gold)',  icon: '⭐' },
            { label: 'Coins',        val: state.coins,            color: 'var(--green)', icon: '🪙' },
            { label: 'Day Streak',   val: `${state.loginStreak || 0}🔥`, color: 'var(--coral)', icon: '📅' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} className="hero-stat">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display, Syne)', fontSize: '1.1rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.lastGame && (
        <div className="continue-card">
          <div className="continue-icon">
            {GAME_ICONS[state.lastGame] ?? '🎮'}
          </div>
          <div className="continue-content">
            <div className="continue-label">Continue Playing</div>
            <div className="continue-title">
              {GAME_NAMES[state.lastGame]}
            </div>
          </div>
          <button
            className="continue-btn"
            onClick={() => handlePlay(state.lastGame!)}
          >
            Resume →
          </button>
        </div>
      )}

      {/* ── Filter & search row ────────────────────────────── */}
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
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="theme-select"
          style={{ borderRadius: 999 }}
          aria-label="Sort games"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          className="pill-btn"
          onClick={() => setShowManage(true)}
          style={{ marginLeft: 'auto' }}
        >
          👥 Manage Players
        </button>
      </div>

      {/* ── Mobile filter toggle ──────────────────────────── */}
      <button
        className="hub-filters-toggle"
        onClick={() => setFiltersOpen(o => !o)}
        aria-expanded={filtersOpen}
        aria-controls="hub-filters-collapsible"
      >
        <span>🎛️ Filters {(tag !== 'all' || diff !== 'All' || showPlayed) ? '•' : ''}</span>
        <span>{filtersOpen ? '▲' : '▼'}</span>
      </button>

      <div id="hub-filters-collapsible" className={`hub-filters-collapsible${filtersOpen ? ' open' : ''}`}>
        <div className="hub-tag-tabs" style={{
          display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto',
          paddingBottom: 6, scrollbarWidth: 'none',
        }} role="group" aria-label="Filter by topic">
          {TAG_FILTERS.map(f => (
            <button
              key={f.value}
              className={`lb-tab${tag === f.value ? ' active' : ''}`}
              onClick={() => setTag(f.value)}
              style={{ flexShrink: 0 }}
              aria-pressed={tag === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Filter by difficulty">
          {DIFFICULTY_FILTERS.map(d => (
            <button
              key={d}
              className={`pill-btn${diff === d ? ' active' : ''}`}
              style={{ fontSize: '0.72rem', padding: '4px 12px' }}
              onClick={() => setDiff(d)}
              aria-pressed={diff === d}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          className={`pill-btn${showPlayed ? ' active' : ''}`}
          onClick={() => setShowPlayed(p => !p)}
          aria-pressed={showPlayed}
          style={{ alignSelf: 'flex-start' }}
        >
          ✓ Played only
        </button>
      </div>

      {/* ── Game count line ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
          {filteredGames.length === GAME_KEYS.length
            ? `${GAME_KEYS.length} games`
            : `${filteredGames.length} of ${GAME_KEYS.length} games`}
        </div>
        {(tag !== 'all' || diff !== 'All' || search || showPlayed) && (
          <button
            className="pill-btn"
            style={{ fontSize: '0.7rem', padding: '3px 10px' }}
            onClick={() => { setTag('all'); setDiff('All'); setSearch(''); setShowPlayed(false); setFiltersOpen(false); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Game grid ─────────────────────────────────────── */}
      {filteredGames.length === 0 ? (
        <div className="shell-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔍</div>
          <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>
            No games match your filters
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
            Try a different search term, tag, or difficulty level.
          </div>
        </div>
      ) : (
        <>
          {!search && tag === 'all' && (
            <section className="hub-section">
              <h2 className="hub-section-title">🔥 Recommended For You</h2>
              <div className="hub-featured-grid">
                {filteredGames.slice(0, 4).map((gameId) => (
                  <GameCard
                    key={gameId}
                    gameId={gameId}
                    onClick={handlePlay}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="hub-game-grid">
            {filteredGames.map((gameId, i) => (
              <div
                key={gameId}
                className="card-stagger"
                style={{ '--stagger-i': i } as React.CSSProperties}
              >
                <GameCard gameId={gameId} onClick={handlePlay} />
              </div>
            ))}
          </div>
        </>
      )}

      {showManage && <ManagePlayersModal onClose={() => setShowManage(false)} />}
    </div>
  );
}