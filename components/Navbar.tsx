'use client';
// components/Navbar.tsx

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGame, logOut, xpForLevel } from '@/lib/gameState';
import { THEMES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const { state, applyTheme, showToast } = useGame();
  const router = useRouter();
  const [clock, setClock] = useState('--:--');
  const [showProfile, setShowProfile] = useState(false);

  // Live clock
  useEffect(() => {
    function tick() {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
    }
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    try {
      const isGuest = localStorage.getItem('guestUser') === 'true';
      if (!isGuest) await logOut();
      localStorage.removeItem('guestUser');
      localStorage.removeItem('currentUser');
    } catch (_) {}
    router.replace('/auth');
  }

  const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestUser') === 'true';

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <Link href="/hub" title="Home" style={{ display: 'inline-flex', lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo.png" alt="Bored Teacher" className="brand-logo" />
          </Link>
        </div>

        <div className="header-right-wrap">
          <div className="header-right">
            <button
              className="player-chip pill-btn"
              onClick={() => setShowProfile(true)}
              aria-label={`Edit profile for ${state.name}`}
            >
              {state.avatar} {state.name}
            </button>

            <div className="pill-btn live-clock" style={{ minWidth: 80, textAlign: 'center', color: 'var(--muted)', cursor: 'default' }} aria-label={`Current time: ${clock}`}>
              {clock}
            </div>

            <Link href="/leaderboard" className="pill-btn" style={{ textDecoration: 'none' }}>
              🏆 Leaderboard
            </Link>
            <Link href="/trophy" className="pill-btn" style={{ textDecoration: 'none' }}>
              🎖️ Trophy Room
            </Link>
            <Link href="/resources" className="pill-btn" style={{ textDecoration: 'none' }}>
              📚 Resources
            </Link>

            <button
              className="player-chip pill-btn"
              onClick={handleLogout}
              aria-label={isGuest ? 'Signed in as guest — click to sign out' : `Signed in as ${state.name} — click to sign out`}
              style={{ cursor: 'pointer', color: isGuest ? undefined : 'var(--green)' }}
            >
              {isGuest ? '🔓 Guest' : `🔐 ${state.name}`}
            </button>

            <select
              className="theme-select"
              value={state.theme}
              onChange={e => applyTheme(e.target.value)}
              aria-label="Choose colour theme"
            >
              {THEMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}