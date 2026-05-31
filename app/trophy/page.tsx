'use client';
// app/trophy/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/lib/gameState';
import { ACHIEVEMENT_CATEGORIES } from '@/lib/achievements';
import type { HubState } from '@/lib/gameState';




const TIERS = [
  { name: 'Beginner', icon: '🌱', min: 0,    max: 500,  sub: 'Keep playing!' },
  { name: 'Bronze',   icon: '🥉', min: 500,  max: 1500, sub: 'Getting warmed up.' },
  { name: 'Silver',   icon: '🥈', min: 1500, max: 3000, sub: 'Building momentum.' },
  { name: 'Gold',     icon: '🥇', min: 3000, max: 5000, sub: 'Strong results!' },
  { name: 'Platinum', icon: '💎', min: 5000, max: 8000, sub: 'Elite performer.' },
  { name: 'Diamond',  icon: '🌟', min: 8000, max: 1e9,  sub: 'Mastery achieved.' },
];

function getTier(totalScore: number) {
  return TIERS.find((t, i) => totalScore < t.max || i === TIERS.length - 1)!;
}

export default function TrophyPage() {
  const router = useRouter();
  const { state, earnedAchievementIds } = useGame();
  const [ready, setReady] = useState(false);

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

  const totalScore = Object.values(state.games).reduce((a, g) => a + g.highScore, 0);
  const tier       = getTier(totalScore);
  const nextTier   = TIERS[TIERS.indexOf(tier) + 1];
  const tierPct    = nextTier
    ? Math.min(100, Math.round(((totalScore - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;

  const allEarned   = earnedAchievementIds;
  const earnedCount = allEarned.size;
  const totalBadges = ACHIEVEMENT_CATEGORIES.flatMap(c => c.achievements).length;

  if (!ready) return null;

  return (
    <div className="trophy-page">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="shell-card" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        padding: 'clamp(20px, 4vw, 40px)',
        marginBottom: 20,
        borderRadius: 32,
        alignItems: 'center',
      }}>
        <div>
          <div className="trophy-hero-name">{state.avatar} {state.name}</div>
          {state.username && <div className="trophy-hero-handle">@{state.username}</div>}
          <div className="trophy-hero-stats">
            <div className="trophy-stat"><span className="trophy-stat-val">{earnedCount}</span><span className="trophy-stat-lbl">Badges</span></div>
            <div className="trophy-stat"><span className="trophy-stat-val">{state.level}</span><span className="trophy-stat-lbl">Level</span></div>
            <div className="trophy-stat"><span className="trophy-stat-val">{totalScore}</span><span className="trophy-stat-lbl">Total Score</span></div>
            <div className="trophy-stat"><span className="trophy-stat-val">{state.loginStreak || 0}</span><span className="trophy-stat-lbl">Day Streak</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: '4rem' }}>{tier.icon}</div>
          <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center' }}>{tier.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>{tier.sub}</div>
        </div>
      </div>

      {/* ── Tier progress ─────────────────────────────────── */}
      <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
          <span>{tier.icon} {tier.name}</span>
          {nextTier && <span>{nextTier.icon} {nextTier.name}</span>}
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${tierPct}%`, background: 'linear-gradient(90deg, var(--gold), var(--teal))', borderRadius: 8, transition: 'width 0.9s cubic-bezier(0.34,1.2,0.64,1)' }} />
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
          {nextTier ? `${nextTier.min - totalScore} pts to ${nextTier.name}` : '🌟 Maximum tier reached!'}
        </div>
      </div>

      {/* ── Achievement categories ────────────────────────── */}
      {ACHIEVEMENT_CATEGORIES.map(cat => {
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
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 3, color: earned ? 'var(--text)' : 'var(--muted)' }}>{a.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{a.description}</div>
                    {earned && <div style={{ marginTop: 6, fontSize: '0.68rem', color: a.color, fontWeight: 700 }}>✓ Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Summary ────────────────────────────────────────── */}
      <div className="shell-card" style={{ padding: 'clamp(16px, 3vw, 24px)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>Badge Progress</div>
          <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--gold)' }}>{earnedCount} / {totalBadges}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>Current Tier</div>
          <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.4rem' }}>{tier.icon} {tier.name}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>Login Streak</div>
          <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--coral)' }}>🔥 {state.loginStreak || 0} days</div>
        </div>
      </div>
    </div>
  );
}