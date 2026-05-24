'use client';
// app/trophy/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { useGame } from '@/lib/gameState';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { GAME_KEYS } from '@/lib/constants';
import type { HubState } from '@/lib/gameState';

// ── Badge definitions ─────────────────────────────────────────

function gameTotal(s: HubState, field: 'completions') {
  return Object.values(s.games).reduce((a, g) => a + (g[field] || 0), 0);
}

interface Badge {
  id: string; icon: string; color: string; name: string; desc: string;
  check: (s: HubState) => boolean;
}
interface BadgeCategory { label: string; badges: Badge[] }

const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    label: '🎮 Gameplay',
    badges: [
      { id: 'first_play',   icon: '🎮', color: 'var(--teal)',   name: 'First Steps',       desc: 'Complete your first game',         check: s => gameTotal(s, 'completions') >= 1 },
      { id: 'play_5',       icon: '🗂️', color: 'var(--blue)',   name: 'Getting Started',   desc: 'Complete 5 different games',       check: s => Object.values(s.games).filter(g => g.completions > 0).length >= 5 },
      { id: 'play_10',      icon: '📚', color: 'var(--blue)',   name: 'Dedicated',          desc: 'Complete 10 different games',      check: s => Object.values(s.games).filter(g => g.completions > 0).length >= 10 },
      { id: 'play_all',     icon: '🌍', color: 'var(--gold)',   name: 'All-Rounder',        desc: 'Play every single game',           check: s => GAME_KEYS.every(k => (s.games[k]?.completions ?? 0) > 0) },
      { id: 'complete_50',  icon: '🏅', color: 'var(--coral)',  name: 'Champion',           desc: '50 total game completions',        check: s => gameTotal(s, 'completions') >= 50 },
      { id: 'complete_100', icon: '💫', color: 'var(--gold)',   name: 'Legend',             desc: '100 total game completions',       check: s => gameTotal(s, 'completions') >= 100 },
    ],
  },
  {
    label: '🎯 Accuracy',
    badges: [
      { id: 'acc_70',  icon: '🎯', color: 'var(--green)',  name: 'Decent Shot',       desc: '70%+ accuracy in any game',        check: s => Object.values(s.games).some(g => g.highScore >= 70) },
      { id: 'acc_80',  icon: '🔥', color: 'var(--coral)',  name: 'Sharp',             desc: '80%+ accuracy in any game',        check: s => Object.values(s.games).some(g => g.highScore >= 80) },
      { id: 'acc_90',  icon: '⚡', color: 'var(--gold)',   name: 'On Fire',           desc: '90%+ accuracy in any game',        check: s => Object.values(s.games).some(g => g.highScore >= 90) },
      { id: 'perfect', icon: '💯', color: 'var(--gold)',   name: 'Perfectionist',     desc: '100% accuracy in any game',        check: s => Object.values(s.games).some(g => g.highScore >= 100) },
      { id: 'avg_80',  icon: '📊', color: 'var(--teal)',   name: 'Consistently Good', desc: '80%+ avg accuracy (5+ games)',     check: s => { const sc = Object.values(s.games).filter(g => g.highScore > 0); return sc.length >= 5 && sc.reduce((a, g) => a + g.highScore, 0) / sc.length >= 80; } },
    ],
  },
  {
    label: '⭐ Progression',
    badges: [
      { id: 'level_5',   icon: '⭐', color: 'var(--green)',  name: 'Rising Star',  desc: 'Reach Level 5',  check: s => s.level >= 5 },
      { id: 'level_10',  icon: '🌟', color: 'var(--blue)',   name: 'Veteran',      desc: 'Reach Level 10', check: s => s.level >= 10 },
      { id: 'level_20',  icon: '🏆', color: 'var(--gold)',   name: 'Elite',        desc: 'Reach Level 20', check: s => s.level >= 20 },
      { id: 'coins_500', icon: '🪙', color: 'var(--gold)',   name: 'Coin Hoarder', desc: 'Collect 500 coins', check: s => s.coins >= 500 },
      { id: 'streak_7',  icon: '🔥', color: 'var(--coral)',  name: 'Week Warrior', desc: '7-day login streak', check: s => (s.loginStreak || 0) >= 7 },
      { id: 'streak_30', icon: '🌈', color: 'var(--purple)', name: 'Monthly',      desc: '30-day login streak', check: s => (s.loginStreak || 0) >= 30 },
    ],
  },
  {
    label: '🌟 Mastery',
    badges: [
      { id: 'master_vocab',   icon: '📖', color: 'var(--blue)',   name: 'Word Master',    desc: '85%+ in any vocab game',    check: s => ['unicorn','wordmatch','colourclash','emojimatch','familyquest'].some(k => (s.games[k]?.highScore ?? 0) >= 85) },
      { id: 'master_grammar', icon: '✍️', color: 'var(--green)',  name: 'Grammar Guru',   desc: '85%+ in any grammar game',  check: s => ['warriors','neonbridge','memory'].some(k => (s.games[k]?.highScore ?? 0) >= 85) },
      { id: 'master_science', icon: '🔬', color: 'var(--teal)',   name: 'Science Whiz',   desc: '85%+ in any science game',  check: s => ['animal','animalclass','oceanquest','deepseaReveal','farmquiz'].some(k => (s.games[k]?.highScore ?? 0) >= 85) },
      { id: 'master_phonics', icon: '🔊', color: 'var(--coral)',  name: 'Phonics Pro',    desc: '85%+ in any phonics game',  check: s => ['phonicsadventure','phonicsworld'].some(k => (s.games[k]?.highScore ?? 0) >= 85) },
      { id: 'polymath',       icon: '🧠', color: 'var(--gold)',   name: 'Polymath',       desc: '85%+ in 10+ different games', check: s => Object.values(s.games).filter(g => g.highScore >= 85).length >= 10 },
    ],
  },
];

const TIERS = [
  { name: 'Beginner',     icon: '🌱', min: 0,    max: 500,  sub: 'Keep playing!' },
  { name: 'Bronze',       icon: '🥉', min: 500,  max: 1500, sub: 'Getting warmed up.' },
  { name: 'Silver',       icon: '🥈', min: 1500, max: 3000, sub: 'Building momentum.' },
  { name: 'Gold',         icon: '🥇', min: 3000, max: 5000, sub: 'Strong results!' },
  { name: 'Platinum',     icon: '💎', min: 5000, max: 8000, sub: 'Elite performer.' },
  { name: 'Diamond',      icon: '🌟', min: 8000, max: 1e9,  sub: 'Mastery achieved.' },
];

function getTier(totalScore: number) {
  return TIERS.find((t, i) => totalScore < t.max || i === TIERS.length - 1)!;
}

export default function TrophyPage() {
  const router  = useRouter();
  const { state } = useGame();
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

  const allEarned = new Set(
    BADGE_CATEGORIES.flatMap(cat => cat.badges.filter(b => b.check(state)).map(b => b.id))
  );
  const earnedCount = allEarned.size;
  const totalBadges = BADGE_CATEGORIES.flatMap(c => c.badges).length;

  if (!ready) return null;

  return (
    <div className="trophy-page">
      <Navbar />
      <Toast />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="trophy-hero shell-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, padding: '36px 40px', marginBottom: 20, borderRadius: 32 }}>
        <div className="trophy-hero-info">
          <div className="trophy-hero-name">{state.avatar} {state.name}</div>
          {state.username && <div className="trophy-hero-handle">@{state.username}</div>}
          <div className="trophy-hero-stats">
            <div className="trophy-stat"><span className="trophy-stat-val">{earnedCount}</span><span className="trophy-stat-lbl">Badges</span></div>
            <div className="trophy-stat"><span className="trophy-stat-val">{state.level}</span><span className="trophy-stat-lbl">Level</span></div>
            <div className="trophy-stat"><span className="trophy-stat-val">{totalScore}</span><span className="trophy-stat-lbl">Total Score</span></div>
            <div className="trophy-stat"><span className="trophy-stat-val">{state.loginStreak || 0}</span><span className="trophy-stat-lbl">Day Streak</span></div>
          </div>
        </div>
        <div className="trophy-tier-display" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 120 }}>
          <div style={{ fontSize: '4rem' }}>{tier.icon}</div>
          <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center' }}>{tier.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>{tier.sub}</div>
        </div>
      </div>

      {/* ── Tier progress ─────────────────────────────────── */}
      <div className="tier-progress shell-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
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

      {/* ── Badge categories ──────────────────────────────── */}
      {BADGE_CATEGORIES.map(cat => {
        const catEarned = cat.badges.filter(b => allEarned.has(b.id)).length;
        return (
          <div key={cat.label} className="shell-card" style={{ padding: '24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display, Syne)', fontWeight: 800, fontSize: '1rem' }}>{cat.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{catEarned} / {cat.badges.length}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {cat.badges.map(b => {
                const earned = allEarned.has(b.id);
                return (
                  <div
                    key={b.id}
                    className={`badge-card ${earned ? 'earned' : 'locked'}`}
                    style={{
                      padding: '16px', borderRadius: 16, textAlign: 'center',
                      border: `1.5px solid ${earned ? b.color : 'var(--border)'}`,
                      background: earned ? `color-mix(in srgb, ${b.color} 10%, transparent)` : 'var(--surface-soft)',
                      opacity: earned ? 1 : 0.5,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 6, filter: earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 3, color: earned ? 'var(--text)' : 'var(--muted)' }}>{b.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{b.desc}</div>
                    {earned && <div style={{ marginTop: 6, fontSize: '0.68rem', color: b.color, fontWeight: 700 }}>✓ Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Summary ────────────────────────────────────────── */}
      <div className="shell-card" style={{ padding: '20px 24px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
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