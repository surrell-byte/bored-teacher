'use client';
// components/Navbar.tsx

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useGame, logOut } from '@/providers/GameProvider';
import { GAME_CATALOG, THEMES } from '@/constants/index';
import { usePathname, useRouter } from 'next/navigation';
import ProfileModal from '@/features/profiles/components/ProfileModal';
import { useResponsive } from '@/hooks/useResponsive';
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound/beep';
import { isCreatorUser, onAuthStateChanged } from '@/lib/firebase';
import ProfileAvatar from '@/components/profile/ProfileAvatar';

const NAV_ITEMS = [
  { href: '/hub',         label: 'Dashboard',   icon: '🏠' },
  { href: '/games',       label: 'Games',       icon: '🎮' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/resources',   label: 'Resources',   icon: '📚' },
  { href: '/blog',        label: 'Blog',        icon: '✍️' },
];
const MORE_ITEMS = [
  { href: '/multiplayer', label: 'Multiplayer', icon: '🕹️' },
  { href: '/shop', label: 'Shop', icon: '🛍️' },
  { href: '/trophy', label: 'Trophy Room', icon: '⭐' },
  { href: '/suggestions', label: 'Suggestions', icon: '💡' },
  { href: '/about', label: 'About', icon: 'ℹ️' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];
export default function Navbar() {
  const { state, applyTheme, earnedAchievementIds } = useGame();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gameSearchOpen, setGameSearchOpen] = useState(false);
  const [gameSearch, setGameSearch] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [creator, setCreator] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const gameSearchInputRef = useRef<HTMLInputElement>(null);
  const { isMobile, presentationMode, setPresentationMode } = useResponsive();

  // Presentation mode is only offered on screens big enough to matter for a
  // classroom display (tablet and up) — it has nothing to add on a phone.
  const showPresentationToggle = hydrated && !isMobile;

  const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestUser') === 'true';

  function isActive(href: string) {
    return href === '/hub' ? pathname === '/hub' : pathname.startsWith(href);
  }

  // Close dropdown on outside click (mouse + touch)
  useEffect(() => {
    function handler(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && moreRef.current && !moreRef.current.contains(target)) {
        setShowProfileMenu(false);
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    // This state change intentionally happens after hydration so responsive
    // controls cannot change the server-rendered navbar structure.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => onAuthStateChanged(user => setCreator(isCreatorUser(user))), []);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!gameSearchOpen) return undefined;
    gameSearchInputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGameSearchOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [gameSearchOpen]);

  const searchTerm = gameSearch.trim().toLowerCase();
  const gameResults = Object.entries(GAME_CATALOG).filter(([gameId, game]) => {
    const searchable = `${gameId} ${game.name} ${game.desc} ${game.tag.label} ${game.badge}`.toLowerCase();
    return !searchTerm || searchable.includes(searchTerm);
  }).slice(0, 12);

  function openGameSearch() {
    setMobileOpen(false);
    setGameSearchOpen(true);
  }

  function closeGameSearch() {
    setGameSearchOpen(false);
    setGameSearch('');
  }

  function chooseGame(gameId: string) {
    closeGameSearch();
    router.push(`/games/${gameId}`);
  }

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
              className={`nav-link${isActive(item.href) ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/trophy' && earnedAchievementIds.size > 0 && (
                <span className="nav-achievement-count">{earnedAchievementIds.size}</span>
              )}
            </Link>
          ))}
          {creator && (
            <Link href="/admin" className={`nav-link${pathname.startsWith('/admin') ? ' active' : ''}`} style={{ textDecoration: 'none' }}>
              <span className="nav-icon" aria-hidden="true">🛠️</span>
              <span>Creator View</span>
            </Link>
          )}
          <div className="nav-more-wrap" ref={moreRef}>
            <button className={`nav-link nav-more-button${showMoreMenu || MORE_ITEMS.some(item => isActive(item.href)) ? ' active' : ''}`} onClick={() => setShowMoreMenu(value => !value)} aria-expanded={showMoreMenu} type="button">⋯ More</button>
            {showMoreMenu && <div className="nav-more-menu" role="menu">{MORE_ITEMS.map(item => <Link key={item.href} href={item.href} className="dropdown-item" role="menuitem" onClick={() => setShowMoreMenu(false)}>{item.icon} {item.label}</Link>)}</div>}
          </div>
        </nav>

        {/* Right side — sound, profile dropdown, hamburger */}
        <div className="nav-right">
          <button
            className="notif-bell"
            aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
            type="button"
            onClick={() => setSoundOn(value => !value)}
            title={soundOn ? 'Sound on' : 'Sound off'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>

          {showPresentationToggle && (
            <button
              className={`presentation-toggle${presentationMode ? ' active' : ''}`}
              onClick={() => setPresentationMode(!presentationMode)}
              aria-pressed={presentationMode}
              aria-label={presentationMode ? 'Turn off presentation mode' : 'Turn on presentation mode for smartboards'}
              title={presentationMode ? 'Presentation mode: on' : 'Presentation mode (bigger text & tap targets for smartboards)'}
              type="button"
            >
              🖥️
            </button>
          )}

          {/* Profile dropdown — position:relative is the anchor */}
          <div
            className="profile-dropdown-wrap"
            ref={dropdownRef}
            style={{ position: 'relative' }}
          >
            <button
              className="player-chip-btn"
              onClick={() => router.push('/profile')}
              aria-expanded={false}
              aria-haspopup="true"
              aria-label={`Profile menu for ${state.name}`}
              type="button"
            >
              <span className="player-chip-top">
                <span className="player-chip-avatar"><ProfileAvatar value={state.avatar} /></span>
                <span className="player-chip-info">
                  <span className="player-chip-name">{state.name}</span>
                  <span className="player-chip-level">Level {state.level}</span>
                </span>
                <span style={{ fontSize: '0.6rem', opacity: 0.6, marginLeft: 2 }}>▾</span>
              </span>
            </button>

            {showProfileMenu && (
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
                  onClick={() => { setShowProfile(true); setShowProfileMenu(false); }}
                >
                  ✏️ Edit Profile
                </button>

                <button
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => { router.push('/subscription'); setShowProfileMenu(false); }}
                >
                  💳 Manage Subscription
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

          <button
            className="nav-game-search-toggle"
            type="button"
            onClick={openGameSearch}
            aria-label="Search games"
            title="Search games"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
          </button>

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
          {creator && <Link href="/admin" className={`mobile-nav-item${pathname.startsWith('/admin') ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>🛠️ Creator View</Link>}
          <div className="mobile-nav-item mobile-more-heading">More</div>
          {MORE_ITEMS.map(item => <Link key={item.href} href={item.href} className={`mobile-nav-item${isActive(item.href) ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>{item.icon} {item.label}</Link>)}

          <Link href="/profile" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>✏️ Edit Profile</Link>

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

          {showPresentationToggle && (
            <button
              className={`mobile-nav-item${presentationMode ? ' active' : ''}`}
              onClick={() => setPresentationMode(!presentationMode)}
              aria-pressed={presentationMode}
            >
              🖥️ Presentation Mode {presentationMode ? '(On)' : '(Off)'}
            </button>
          )}

          <button className="mobile-nav-item mobile-signout" onClick={handleLogout}>
            {isGuest ? '🔓 Leave Guest Mode' : '🚪 Sign Out'}
          </button>
        </nav>
      )}

      {gameSearchOpen && (
        <div className="game-search-backdrop" role="presentation" onMouseDown={closeGameSearch}>
          <section className="game-search-dialog" role="dialog" aria-modal="true" aria-labelledby="game-search-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="game-search-header">
              <h2 id="game-search-title">Find a game</h2>
              <button className="game-search-close" type="button" onClick={closeGameSearch} aria-label="Close game search">×</button>
            </div>
            <label className="sr-only" htmlFor="game-search-input">Search games</label>
            <div className="game-search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              <input ref={gameSearchInputRef} id="game-search-input" value={gameSearch} onChange={(event) => setGameSearch(event.target.value)} placeholder="Search games, skills, or topics" autoComplete="off" />
            </div>
            <div className="game-search-results" aria-live="polite">
              {gameResults.length ? gameResults.map(([gameId, game]) => (
                <button key={gameId} type="button" className="game-search-result" onClick={() => chooseGame(gameId)}>
                  <span className="game-search-result-icon" aria-hidden="true">{game.icon}</span>
                  <span><strong>{game.name}</strong><small>{game.tag.label} · {game.badge}</small></span>
                  <span className="game-search-result-arrow" aria-hidden="true">→</span>
                </button>
              )) : <p className="game-search-empty">No games match “{gameSearch}”.</p>}
            </div>
          </section>
        </div>
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
