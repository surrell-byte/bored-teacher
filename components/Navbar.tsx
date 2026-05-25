'use client';
// components/Navbar.tsx

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useGame, logOut } from '@/lib/gameState';
import { THEMES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const { state, applyTheme } = useGame();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestUser') === 'true';

  // Close dropdown on outside click (mouse + touch)
  useEffect(() => {
    function handler(e: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); }, []);

  async function handleLogout() {
    try {
      if (!isGuest) await logOut();
      localStorage.removeItem('guestUser');
      localStorage.removeItem('currentUser');
    } catch (_) {}
    router.replace('/auth');
  }

  return (
    <>
      <header className="topbar">
        {/* Logo */}
        <div className="brand">
          <Link href="/hub" aria-label="Go to home" style={{ display: 'inline-flex', lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo.png" alt="Bored Teacher" className="brand-logo" />
          </Link>
        </div>

        {/* Desktop nav links */}
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/leaderboard" className="pill-btn" style={{ textDecoration: 'none' }}>
            🏆 Leaderboard
          </Link>
          <Link href="/trophy" className="pill-btn" style={{ textDecoration: 'none' }}>
            🎖️ Trophy Room
          </Link>
          <Link href="/resources" className="pill-btn" style={{ textDecoration: 'none' }}>
            📚 Resources
          </Link>
        </nav>

        {/* Right side — profile dropdown + hamburger */}
        <div className="nav-right">
          {/* Profile dropdown — position:relative is the anchor */}
          <div
            className="profile-dropdown-wrap"
            ref={dropdownRef}
            style={{ position: 'relative' }}
          >
            <button
              className="pill-btn player-chip"
              onClick={() => setShowDropdown(d => !d)}
              aria-expanded={showDropdown}
              aria-haspopup="true"
              aria-label={`Profile menu for ${state.name}`}
            >
              {state.avatar} {state.name}{' '}
              <span style={{ fontSize: '0.6rem', opacity: 0.6, marginLeft: 2 }}>▾</span>
            </button>

            {showDropdown && (
              <div
                className="profile-dropdown dropdown-animated"
                role="menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 9999,
                  minWidth: 220,
                }}
              >
                <button
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => { setShowProfile(true); setShowDropdown(false); }}
                >
                  ✏️ Edit Profile
                </button>

                <div className="dropdown-divider" />

                <div className="dropdown-item dropdown-theme" role="menuitem">
                  <span>🎨 Theme</span>
                  <select
                    className="theme-select-inline"
                    value={state.theme}
                    onChange={e => applyTheme(e.target.value)}
                    aria-label="Choose colour theme"
                    onClick={e => e.stopPropagation()}
                  >
                    {THEMES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item dropdown-signout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  {isGuest ? '🔓 Leave Guest Mode' : '🚪 Sign Out'}
                </button>
              </div>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <Link href="/leaderboard" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
            🏆 Leaderboard
          </Link>
          <Link href="/trophy" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
            🎖️ Trophy Room
          </Link>
          <Link href="/resources" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
            📚 Resources
          </Link>
          <button className="mobile-nav-item" onClick={() => { setShowProfile(true); setMobileOpen(false); }}>
            ✏️ Edit Profile
          </button>
          <button className="mobile-nav-item mobile-signout" onClick={handleLogout}>
            {isGuest ? '🔓 Leave Guest Mode' : '🚪 Sign Out'}
          </button>
        </nav>
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}