'use client';
// app/hub/page.tsx — Main game hub

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, loadUserState } from '@/lib/firebase';
import { useGame, xpForLevel } from '@/lib/gameState';
import {
  GAME_KEYS, GAME_NAMES, GAME_ICONS, GAME_TAGS, GAME_DIFFICULTY,
} from '@/lib/constants';
import GameCard from '@/components/GameCard';
import ManagePlayersModal from '@/components/ManagePlayersModal';

const TAG_FILTERS = [
  { label: '⚡ All Games',     value: 'all' },
  { label: '📚 Vocabulary',    value: 'Vocabulary' },
  { label: '✍️ Grammar',       value: 'Grammar' },
  { label: '🔗 Word Formation',value: 'Word Formation' },
  { label: '🔬 Science',        value: 'Science' },
  { label: '🔤 Phonics',       value: 'Phonics' },
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
  { label: '📋 Default',    value: 'default' },
  { label: '🏆 Best Score', value: 'score' },
  { label: '🎮 Most Played',value: 'played' },
  { label: '🔠 A–Z',        value: 'alpha' },
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
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { router.replace('/auth'); return; }
      // Read classId directly from Firestore — don't rely on context state timing,
      // since the local→remote merge in gameState.tsx may not have settled yet.
      const remote = await loadUserState(user.uid);
      if (!remote?.classId) {
        router.replace('/auth?needCode=1');
        return;
      }
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
    if (sort === 'score')  games.sort((a, b) => (state.games[b]?.highScore ?? 0) - (state.games[a]?.highScore ?? 0));
    if (sort === 'played') games.sort((a, b) => (state.games[b]?.completions ?? 0) - (state.games[a]?.completions ?? 0));
    if (sort === 'alpha')  games.sort((a, b) => (GAME_NAMES[a] ?? '').localeCompare(GAME_NAMES[b] ?? ''));
    return games;
  }, [search, tag, diff, sort, showPlayed, state.games]);

  // Show genuinely unplayed games first; fall back to highest scored
  const featuredGames = useMemo(() => {
    const unplayed = GAME_KEYS.filter(k => (state.games[k]?.completions ?? 0) === 0);
    return unplayed.length >= 4
      ? unplayed.slice(0, 4)
      : [...GAME_KEYS]
          .sort((a, b) => (state.games[b]?.highScore ?? 0) - (state.games[a]?.highScore ?? 0))
          .slice(0, 4);
  }, [state.games]);

  const totalPlayed = GAME_KEYS.filter(k => (state.games[k]?.completions ?? 0) > 0).length;
  const totalScore  = Object.values(state.games).reduce((a, g) => a + (g.highScore ?? 0), 0);
  const xpNeeded    = xpForLevel(state.level);
  const xpPct       = Math.min(100, Math.round((state.xp / xpNeeded) * 100));

  const hasActiveFilters = tag !== 'all' || diff !== 'All' || !!search || showPlayed;

  function clearFilters() {
    setTag('all'); setDiff('All'); setSearch(''); setShowPlayed(false); setFiltersOpen(false);
  }

  if (!ready) return null;

  return (
    <div className="hub-page">

      {/* ── Hero / stats bar ──────────────────────────────── */}
      <div className="hub-hero-grid">
        <div className="shell-card hub-welcome-card">
          <div className="hero-kicker">🎮 Game Library</div>
          <h1 className="hub-welcome-title">
            Welcome back, {state.name.split(' ')[0]} {state.avatar}
          </h1>
          <p className="hub-welcome-sub">
            {totalPlayed === 0
              ? "Pick a game and start your journey. Every round sharpens your English!"
              : `You've completed ${totalPlayed} of ${GAME_KEYS.length} games. Keep the streak going!`}
          </p>
          <div className="hub-xp-row">
            <span className="hub-xp-level">Lv {state.level}</span>
            <div className="hub-xp-bar" style={{ flex: 1 }}>
              <div className="hub-xp-fill progress-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="hub-xp-count">{state.xp} / {xpNeeded} XP</span>
          </div>
        </div>

        <div className="shell-card hub-stats-card">
          {[
            { label: 'Games Played', val: totalPlayed,            color: 'var(--teal)',  icon: '🎮' },
            { label: 'Total Score',  val: totalScore,             color: 'var(--gold)',  icon: '⭐' },
            { label: 'Coins',        val: state.coins,            color: 'var(--green)', icon: '🪙' },
            { label: 'Day Streak',   val: `${state.loginStreak || 0}🔥`, color: 'var(--coral)', icon: '📅' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} className="hero-stat">
              <div className="hero-stat-inner">
                <span className="hero-stat-icon">{icon}</span>
                <div>
                  <div className="hero-stat-val" style={{ color }}>{val}</div>
                  <div className="hero-stat-lbl">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.lastGame && GAME_NAMES[state.lastGame] && (
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
          {search && (
            <button className="hub-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              ✕
            </button>
          )}
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
        <button className="pill-btn" onClick={() => setShowManage(true)} style={{ marginLeft: 'auto' }}>
          👥 Manage Players
        </button>
      </div>

      {/* ── Mobile filter toggle ──────────────────────── */}
      <button
        className="hub-filters-toggle"
        onClick={() => setFiltersOpen(o => !o)}
        aria-expanded={filtersOpen}
        aria-controls="hub-filters-collapsible"
      >
        <span>🎛️ Filters {hasActiveFilters ? '•' : ''}</span>
        <span>{filtersOpen ? '▲' : '▼'}</span>
      </button>

      <div id="hub-filters-collapsible" className={`hub-filters-collapsible${filtersOpen ? ' open' : ''}`}>
        <div
          className="hub-tag-tabs"
          style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}
          role="group"
          aria-label="Filter by topic"
        >
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

      {/* ── Game count ────────────────────────────────── */}
      <div className="hub-game-count">
        <span className="hub-game-count-num">
          {filteredGames.length === GAME_KEYS.length ? GAME_KEYS.length : filteredGames.length}
        </span>
        <span>
          {filteredGames.length === GAME_KEYS.length ? 'games' : `of ${GAME_KEYS.length} games`}
        </span>
        {hasActiveFilters && (
          <button
            className="pill-btn"
            style={{ fontSize: '0.7rem', padding: '3px 10px', marginLeft: 'auto' }}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Game grid ─────────────────────────────────── */}
      {filteredGames.length === 0 ? (
        <div className="shell-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔍</div>
          <div className="hub-empty-title">No games match your filters</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
            Try a different search term, tag, or difficulty level.
          </div>
        </div>
      ) : (
        <>
          {!search && tag === 'all' && (
            <section className="hub-section">
              <h2 className="hub-section-title">
                {totalPlayed === 0 ? '🎮 Featured Games' : '🆕 New For You'}
              </h2>
              <div className="hub-featured-grid">
                {featuredGames.map(gameId => (
                  <GameCard key={gameId} gameId={gameId} onClick={handlePlay} />
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
