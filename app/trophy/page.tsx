'use client';
import './trophy.css';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/providers/GameProvider';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENTS, type Achievement } from '@/features/achievements/achievements';

function formatDate(iso: string | undefined) {
  if (!iso) return 'Earned';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Earned';
  }
}

export default function TrophyPage() {
  const router = useRouter();
  const { state, earnedAchievementIds } = useGame();
  const [ready, setReady]   = useState(false);
  const [tab, setTab]       = useState<'all' | string>('all');

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

  const totalScore  = Object.values(state.games).reduce((a, g) => a + g.highScore, 0);
  const allEarned   = earnedAchievementIds;
  const earnedCount = allEarned.size;
  const totalBadges = ACHIEVEMENTS.length;
  const completionPct = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;

  // Most recently earned achievement, by real earnedAt timestamp
  const recentAchievements = useMemo(() => {
    return ACHIEVEMENTS
      .filter(a => allEarned.has(a.id))
      .sort((a, b) => (state.earnedAt[b.id] || '').localeCompare(state.earnedAt[a.id] || ''))
      .slice(0, 6);
  }, [allEarned, state.earnedAt]);

  const latestAchievement: Achievement | null = recentAchievements[0] ?? null;

  const donutPct = totalBadges > 0 ? (earnedCount / totalBadges) * 360 : 0;

  const visibleCategories = tab === 'all'
    ? ACHIEVEMENT_CATEGORIES
    : ACHIEVEMENT_CATEGORIES.filter(c => c.label === tab);

  if (!ready) return null;

  return (
    <div className="trophy-page">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="shell-card trophy-hero-grid" style={{ padding: 'clamp(20px, 4vw, 40px)', marginBottom: 20, borderRadius: 32, gap: 24 }}>
        <div>
          <div className="hero-kicker">🏆 Trophy Room</div>
          <div className="trophy-hero-name">{state.avatar} {state.name}</div>
          {state.username && <div className="trophy-hero-handle">@{state.username}</div>}
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '48ch' }}>
            Celebrate your achievements and track your learning journey.
          </p>
        </div>

        <div>
          <div className="trophy-snapshot-title">Your Achievement Snapshot</div>
          <div className="trophy-snapshot-grid">
            <div className="trophy-snapshot-stat">
              <span className="hero-stat-icon">🏆</span>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--gold)' }}>{earnedCount}</div>
                <div className="hero-stat-lbl">Trophies Earned</div>
              </div>
            </div>
            <div className="trophy-snapshot-stat">
              <span className="hero-stat-icon">⭐</span>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--gold)' }}>{totalScore}</div>
                <div className="hero-stat-lbl">Total Points</div>
              </div>
            </div>
            <div className="trophy-snapshot-stat">
              <span className="hero-stat-icon">🔥</span>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--coral)' }}>{state.loginStreak || 0}</div>
                <div className="hero-stat-lbl">Day Streak</div>
              </div>
            </div>
            <div className="trophy-snapshot-stat">
              <span className="hero-stat-icon">🎯</span>
              <div>
                <div className="hero-stat-val" style={{ color: 'var(--teal)' }}>{completionPct}%</div>
                <div className="hero-stat-lbl">Completion</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="trophy-tabs" role="tablist" aria-label="Trophy categories">
        <button className={`pill-btn${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')} aria-pressed={tab === 'all'}>
          🏅 All Trophies
        </button>
        {ACHIEVEMENT_CATEGORIES.map(c => (
          <button
            key={c.label}
            className={`pill-btn${tab === c.label ? ' active' : ''}`}
            onClick={() => setTab(c.label)}
            aria-pressed={tab === c.label}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Recent Achievements ─────────────────────────────── */}
      {recentAchievements.length > 0 && (
        <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginBottom: 20 }}>
          <div className="hub-section-title" style={{ marginBottom: 14, fontSize: '1rem' }}>Recent Achievements</div>
          <div className="recent-ach-row">
            {recentAchievements.map(a => (
              <div key={a.id} className="recent-ach-card" style={{ borderColor: a.color }}>
                <div className="recent-ach-icon">{a.icon}</div>
                <div className="recent-ach-name">{a.name}</div>
                <div className="recent-ach-date">{formatDate(state.earnedAt[a.id])}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Collection donut + Latest Achievement ───────────── */}
      <div className="trophy-side-grid" style={{ marginBottom: 20 }}>
        <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <div className="hub-section-title" style={{ marginBottom: 16, fontSize: '1rem' }}>Trophy Collection</div>
          <div className="trophy-donut-wrap">
            <div
              className="trophy-donut"
              style={{ background: `conic-gradient(var(--gold) 0deg ${donutPct}deg, var(--border) ${donutPct}deg 360deg)` }}
            >
              <div className="trophy-donut-hole">
                <span className="trophy-donut-num">{earnedCount}</span>
                <span className="trophy-donut-lbl">Earned</span>
              </div>
            </div>
            <div className="trophy-donut-legend">
              <div className="trophy-legend-row"><span className="trophy-legend-dot" style={{ background: 'var(--gold)' }} />{earnedCount} Earned</div>
              <div className="trophy-legend-row"><span className="trophy-legend-dot" style={{ background: 'var(--border)' }} />{totalBadges - earnedCount} Locked</div>
              <div className="trophy-legend-total">Total: {totalBadges} Trophies</div>
            </div>
          </div>
        </div>

        <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <div className="hub-section-title" style={{ marginBottom: 16, fontSize: '1rem' }}>Latest Achievement</div>
          {latestAchievement ? (
            <div className="latest-ach" style={{ borderColor: latestAchievement.color }}>
              <div className="latest-ach-icon">{latestAchievement.icon}</div>
              <div className="latest-ach-name">{latestAchievement.name}</div>
              <div className="latest-ach-desc">{latestAchievement.description}</div>
              <div className="latest-ach-date">{formatDate(state.earnedAt[latestAchievement.id])}</div>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.86rem', textAlign: 'center', padding: '24px 12px' }}>
              Play a game to earn your first trophy!
            </div>
          )}
        </div>
      </div>

      {/* ── Trophy Categories overview ───────────────────────── */}
      <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginBottom: 20 }}>
        <div className="hub-section-title" style={{ marginBottom: 16, fontSize: '1rem' }}>Trophy Categories</div>
        <div className="trophy-cat-grid">
          {ACHIEVEMENT_CATEGORIES.map(cat => {
            const catEarned = cat.achievements.filter(a => allEarned.has(a.id)).length;
            const pct = Math.round((catEarned / cat.achievements.length) * 100);
            return (
              <div key={cat.label} className="trophy-cat-card">
                <div className="trophy-cat-label">{cat.label}</div>
                <div className="trophy-cat-count">{catEarned} / {cat.achievements.length} Earned</div>
                <div className="trophy-cat-bar">
                  <div className="trophy-cat-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Full badge grid, filtered by active tab ──────────── */}
      {visibleCategories.map(cat => {
        const catEarned = cat.achievements.filter(a => allEarned.has(a.id)).length;
        return (
          <div key={cat.label} className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1rem' }}>{cat.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{catEarned} / {cat.achievements.length}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {cat.achievements.map(a => {
                const earned = allEarned.has(a.id);
                return (
                  <div
                    key={a.id}
                    className={`badge-card ${earned ? 'earned' : 'locked'}`}
                    style={{
                      padding: 'clamp(12px, 2vw, 16px)',
                      borderRadius: 16,
                      textAlign: 'center',
                      border: `1.5px solid ${earned ? a.color : 'var(--border)'}`,
                      background: earned ? `color-mix(in srgb, ${a.color} 10%, transparent)` : 'var(--surface-soft)',
                      opacity: earned ? 1 : 0.5,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 6, filter: earned ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 3, color: earned ? 'var(--text)' : 'var(--muted)' }} className="badge-card-title">{a.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }} className="badge-card-desc">{a.description}</div>
                    {earned && <div style={{ marginTop: 6, fontSize: '0.68rem', color: a.color, fontWeight: 700 }}>✓ {formatDate(state.earnedAt[a.id])}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


