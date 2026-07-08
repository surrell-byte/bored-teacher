'use client';
// components/Navbar.tsx

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useGame, logOut, xpForLevel } from '@/providers/GameProvider';
import { THEMES } from '@/constants/index';
import { usePathname, useRouter } from 'next/navigation';
import ProfileModal from '@/features/profiles/components/ProfileModal';

const NAV_ITEMS = [
  { href: '/hub',         label: 'Dashboard',   icon: '🏠' },
  { href: '/games',       label: 'Games',       icon: '🎮' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/resources',   label: 'Resources',   icon: '📚' },
  { href: '/trophy',      label: 'Trophy Room', icon: '⭐' },
  { href: '/payment',     label: 'Payment',     icon: '💳' },
];

export default function Navbar() {
  const { state, applyTheme, earnedAchievementIds } = useGame();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestUser') === 'true';

  const xpMax = xpForLevel(state.level);
  const xpPct = Math.min(100, Math.round((state.xp / xpMax) * 100));

  function isActive(href: string) {
    return href === '/hub' ? pathname === '/hub' : pathname.startsWith(href);
  }

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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
        {/* Logo + wordmark */}
        <div className="brand">
          <Link href="/hub" aria-label="Go to home" style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0, textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo.png" alt="" className="brand-logo" />
            <span className="brand-word">
              <span className="brand-word-top">BORED</span>
              <span className="brand-word-bottom">TEACHER</span>
            </span>
          </Link>
        </div>

        {/* Desktop nav links */}
        <nav className="nav-links" aria-label="Main navigation">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`pill-btn${isActive(item.href) ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.icon} {item.label}
              {item.href === '/trophy' && earnedAchievementIds.size > 0 && (
                <span className="nav-achievement-count">{earnedAchievementIds.size}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right side — stats, bell, profile dropdown, hamburger */}
        <div className="nav-right">
          <span className="stat-pill stat-pill-coins" aria-label={`${state.coins} coins`}>
            <span className="stat-icon">🪙</span>{state.coins}
          </span>
          <span className="stat-pill stat-pill-xp" aria-label={`${state.xp} of ${xpMax} experience points`}>
            <span className="stat-icon">✨</span>{state.xp}/{xpMax} XP
          </span>

          <button className="notif-bell" aria-label="Notifications" type="button">
            🔔
          </button>

          {/* Profile dropdown — position:relative is the anchor */}
          <div
            className="profile-dropdown-wrap"
            ref={dropdownRef}
            style={{ position: 'relative' }}
          >
            <button
              className="player-chip-btn"
              onClick={() => setShowDropdown(d => !d)}
              aria-expanded={showDropdown}
              aria-haspopup="true"
              aria-label={`Profile menu for ${state.name}`}
              type="button"
            >
              <span className="player-chip-top">
                <span className="player-chip-avatar">{state.avatar}</span>
                <span className="player-chip-info">
                  <span className="player-chip-name">{state.name}</span>
                  <span className="player-chip-level">Level {state.level}</span>
                </span>
                <span style={{ fontSize: '0.6rem', opacity: 0.6, marginLeft: 2 }}>▾</span>
              </span>
              <span className="player-chip-xpbar">
                <span className="player-chip-xpfill" style={{ width: `${xpPct}%` }} />
              </span>
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
            type="button"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <div className="mobile-stats-row">
            <span className="stat-pill stat-pill-coins"><span className="stat-icon">🪙</span>{state.coins}</span>
            <span className="stat-pill stat-pill-xp"><span className="stat-icon">✨</span>{state.xp}/{xpMax} XP</span>
          </div>

          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item${isActive(item.href) ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}

          <button className="mobile-nav-item" onClick={() => { setShowProfile(true); setMobileOpen(false); }}>
            ✏️ Edit Profile
          </button>

          {/* Theme switcher — now on mobile too */}
          <div className="mobile-nav-item mobile-theme-row">
            <span>🎨 Theme</span>
            <select
              className="theme-select-inline"
              value={state.theme}
              onChange={e => applyTheme(e.target.value)}
              aria-label="Choose colour theme"
            >
              {THEMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <button className="mobile-nav-item mobile-signout" onClick={handleLogout}>
            {isGuest ? '🔓 Leave Guest Mode' : '🚪 Sign Out'}
          </button>
        </nav>
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
