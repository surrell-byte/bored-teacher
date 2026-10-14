'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import GameLayout from './GameLayout';
import GameHeader from './GameHeader';
import { type GameStat } from './GameSidebar';
import ErrorBoundary from '@/engine/errors/ErrorBoundary';
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound/beep';
import {
  getGameHelpTranslation,
  GameTranslationProvider,
  translateGameShellText,
  type GameHelpLanguage,
} from './GameTranslationContext';

export type GameSessionEvent = 'started' | 'paused' | 'resumed' | 'completed' | 'exited' | 'restarted';

export interface GameCompletion {
  score: number;
  accuracy: number;
}

export interface GameThemeOption {
  id: string;
  name: string;
}

export interface GameShellProps {
  /** Stable catalogue id used by session and analytics listeners. */
  gameId: string;
  title: string;
  icon?: ReactNode;
  stats?: GameStat[];
  controls?: ReactNode;
  /** Extra buttons rendered inline in the top bar, alongside stats/Pause/Full screen/Exit. */
  headerExtra?: ReactNode;
  /** Controls also available from the compact mobile game menu. */
  mobileMenuExtra?: ReactNode;
  themeOptions?: GameThemeOption[];
  themeValue?: string;
  onThemeChange?: (themeId: string) => void;
  children: ReactNode;
  /** Increment this when replacing a game instance (for example, after retry). */
  sessionKey?: string | number;
  completion?: GameCompletion | null;
  onContinue?: () => void;
  onRestart?: () => void;
  onMainMenu?: () => void;
  onSessionEvent?: (event: GameSessionEvent) => void;
  hidePauseControl?: boolean;
  hideExitControl?: boolean;
  hideMainMenuButton?: boolean;
  hideHeader?: boolean;
  themeVars?: {
    nav: string;
    navRaised: string;
    navText: string;
    navMuted: string;
    background?: string;
  };
}

/**
 * The universal, game-route boundary. It owns page-level concerns—pause,
 * fullscreen, lifecycle events, error recovery and completion presentation—
 * while each game remains responsible only for its own mechanics and UI.
 */
export default function GameShell({
  gameId, title, icon, stats, controls, headerExtra, mobileMenuExtra, children, sessionKey = 0,
  completion, onContinue, onRestart, onMainMenu, onSessionEvent, themeVars, hidePauseControl = false, hideExitControl = false, hideMainMenuButton = false, hideHeader = false,
  themeOptions, themeValue, onThemeChange,
}: GameShellProps) {
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showExitNotice, setShowExitNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpLanguage, setHelpLanguage] = useState<GameHelpLanguage>('off');
  const shellRef = useRef<HTMLDivElement>(null);
  const shellText = (text: string) => translateGameShellText(text, helpLanguage);
  const shellLabel = (english: string) => {
    const translation = getGameHelpTranslation(english, helpLanguage);
    return (
      <>
        <span>{english}</span>
        {translation && (
          <small
            className="game-shell-help-translation"
            lang={helpLanguage}
            style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.1 }}
          >
            {translation}
          </small>
        )}
      </>
    );
  };
  const shellOption = (english: string) => {
    const translation = getGameHelpTranslation(english, helpLanguage);
    return translation ? `${english} / ${translation}` : english;
  };

  const emit = useCallback((event: GameSessionEvent) => {
    onSessionEvent?.(event);
    window.dispatchEvent(new CustomEvent('esl-game-session', { detail: { gameId, event } }));
  }, [gameId, onSessionEvent]);

  useEffect(() => {
    emit('started');
    return () => emit('exited');
  }, [emit, sessionKey]);

  useEffect(() => {
    if (completion) emit('completed');
  }, [completion, emit]);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('gameHelpLanguage');
    if (savedLanguage === 'off' || savedLanguage === 'zh-CN' || savedLanguage === 'th') {
      setHelpLanguage(savedLanguage);
    }
  }, []);

  const changeHelpLanguage = useCallback((language: GameHelpLanguage) => {
    setHelpLanguage(language);
    localStorage.setItem('gameHelpLanguage', language);
  }, []);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const resume = useCallback(() => {
    setPaused(false);
    emit('resumed');
  }, [emit]);

  const pause = useCallback(() => {
    setPaused(true);
    emit('paused');
  }, [emit]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key.toLowerCase() !== 'p') return;
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape' && document.fullscreenElement) return;
      event.preventDefault();
      paused ? resume() : pause();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pause, paused, resume]);

  const restart = useCallback(() => {
    setPaused(false);
    onRestart?.();
    emit('restarted');
  }, [emit, onRestart]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shellRef.current?.requestFullscreen();
    } catch {
      // Some embedded browsers disallow fullscreen; play remains available.
    }
  }, []);

  const topBarStats = (stats ?? []).map(stat => ({
    ...stat,
    value: typeof stat.value === 'number' && Number.isFinite(stat.value) ? stat.value : 0,
  }));

  return (
    <div
      ref={shellRef}
      className={`game-shell game-shell--${gameId}`}
      data-game-id={gameId}
      data-paused={paused || undefined}
      style={themeVars ? {
        '--game-shell-nav': themeVars.nav,
        '--game-shell-nav-raised': themeVars.navRaised,
        '--game-shell-nav-text': themeVars.navText,
        '--game-shell-nav-muted': themeVars.navMuted,
        background: themeVars.background,
      } as React.CSSProperties : undefined}
    >
      <GameTranslationProvider value={{ language: helpLanguage, setLanguage: changeHelpLanguage }}>
      <GameLayout
        header={!hideHeader && (
          <>
            <GameHeader
              title={title}
              icon={icon}
              actions={
                <>
                  {topBarStats.length > 0 && (
                    <div className="game-shell-topbar-stats" aria-label="Game stats">
                      {topBarStats.map(stat => (
                        <span key={stat.label} className="game-shell-topbar-stat">
                          {stat.icon && <span aria-hidden="true">{stat.icon}</span>}
                          <b>{stat.value}</b>
                          <span className="game-shell-topbar-stat-label">{stat.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {themeOptions && themeValue && onThemeChange && (
                    <label className="game-shell-header-action game-shell-mobile-secondary" style={{ gap: 6 }}>
                      <span aria-hidden="true">🎨</span>
                      <select
                        value={themeValue}
                        onChange={event => onThemeChange(event.target.value)}
                        aria-label={`Choose ${title} theme`}
                        style={{ border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 800, outline: 0, cursor: 'pointer' }}
                      >
                        {themeOptions.map(theme => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                      </select>
                    </label>
                  )}
                  <label className="game-shell-header-action game-shell-mobile-secondary game-shell-help-language" style={{ gap: 6 }}>
                    <span aria-hidden="true">🌐</span>
                    <span className="game-shell-action-label">{shellLabel('Help')}</span>
                    <select
                      value={helpLanguage}
                      onChange={event => {
                        const language = event.target.value;
                        if (language === 'off' || language === 'zh-CN' || language === 'th') changeHelpLanguage(language);
                      }}
                      aria-label={shellText('Choose game help language')}
                      style={{ border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 800, outline: 0, cursor: 'pointer' }}
                    >
                      <option value="off">{shellOption('Off')}</option>
                      <option value="zh-CN">{shellOption('Chinese 🇨🇳')}</option>
                      <option value="th">{shellOption('Thai 🇹🇭')}</option>
                    </select>
                  </label>
                  {headerExtra}
                  <button
                    type="button"
                    className="game-shell-header-action game-shell-mobile-secondary"
                    onClick={() => setSoundOn(value => !value)}
                    aria-label={shellText(soundOn ? 'Mute sound' : 'Enable sound')}
                    title={shellText(soundOn ? 'Mute sound' : 'Enable sound')}
                  >
                    <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
                    <span className="game-shell-action-label">{shellLabel(soundOn ? 'Sound' : 'Sound off')}</span>
                  </button>
                  {!hidePauseControl && <button type="button" className="game-shell-header-action game-shell-mobile-secondary" onClick={paused ? resume : pause} aria-pressed={paused} aria-label={shellText(paused ? 'Resume game' : 'Pause game')} title={shellText(paused ? 'Resume game' : 'Pause game')}>
                    <span aria-hidden="true">{paused ? '▶' : '⏸'}</span>
                    <span className="game-shell-action-label">{shellLabel(paused ? 'Resume' : 'Pause')}</span>
                  </button>}
                  <button type="button" className="game-shell-header-action game-shell-mobile-secondary" onClick={toggleFullscreen} aria-label={shellText(isFullscreen ? 'Exit full screen' : 'Full screen')} title={shellText(isFullscreen ? 'Exit full screen' : 'Full screen')}>
                    <span aria-hidden="true">⛶</span>
                    <span className="game-shell-action-label">{shellLabel(isFullscreen ? 'Exit full screen' : 'Full screen')}</span>
                  </button>
                  {!hideMainMenuButton && onMainMenu && (
                    <button type="button" className="game-shell-header-action game-shell-mobile-secondary" onClick={onMainMenu} aria-label={shellText('Main menu')} title={shellText('Main menu')}>
                      <span aria-hidden="true">⌂</span>
                      <span className="game-shell-action-label">{shellLabel('Main menu')}</span>
                    </button>
                  )}
                  {!hideExitControl && (
                    <button
                      type="button"
                      className="game-shell-header-action game-shell-mobile-secondary"
                      onClick={() => setShowExitNotice(true)}
                      aria-label={shellText('Exit game')}
                      title={shellText('Exit game')}
                    >
                      <span aria-hidden="true">✕</span>
                      <span className="game-shell-action-label">{shellLabel('Exit')}</span>
                    </button>
                  )}
                  <div className="game-shell-mobile-menu-wrap">
                    <button
                      type="button"
                      className="game-shell-header-action game-shell-mobile-menu-toggle"
                      onClick={() => setMobileMenuOpen(open => !open)}
                      aria-label={shellText('Game menu')}
                      aria-expanded={mobileMenuOpen}
                      title="Game menu"
                    >
                      <span aria-hidden="true">⋮</span>
                    </button>
                    {mobileMenuOpen && (
                      <div className="game-shell-mobile-menu" role="menu">
                        {mobileMenuExtra}
                        <label className="game-shell-mobile-menu-theme">
                          <span aria-hidden="true">🌐</span>
                          <span>{shellText('Help language')}</span>
                          <select
                            value={helpLanguage}
                            onChange={event => {
                              const language = event.target.value;
                              if (language === 'off' || language === 'zh-CN' || language === 'th') changeHelpLanguage(language);
                            }}
                            aria-label={shellText('Choose game help language')}
                          >
                            <option value="off">{shellOption('Off')}</option>
                            <option value="zh-CN">{shellOption('Chinese 🇨🇳')}</option>
                            <option value="th">{shellOption('Thai 🇹🇭')}</option>
                          </select>
                        </label>
                        {themeOptions && themeValue && onThemeChange && <label className="game-shell-mobile-menu-theme">
                          <span aria-hidden="true">🎨</span>
                          <span>{shellText('Theme')}</span>
                          <select value={themeValue} onChange={event => onThemeChange(event.target.value)} aria-label={`Choose ${title} theme`}>
                            {themeOptions.map(theme => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                          </select>
                        </label>}
                        <button type="button" role="menuitem" onClick={() => setSoundOn(value => !value)}>
                          <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
                          <span>{shellLabel('Sound')}</span>
                          <small>{shellLabel(soundOn ? 'On' : 'Off')}</small>
                        </button>
                        {!hidePauseControl && <button type="button" role="menuitem" onClick={() => { setMobileMenuOpen(false); paused ? resume() : pause(); }}>
                          <span aria-hidden="true">{paused ? '▶' : '⏸'}</span>
                          <span>{shellLabel(paused ? 'Resume' : 'Pause')}</span>
                        </button>}
                        <button type="button" role="menuitem" onClick={() => { setMobileMenuOpen(false); void toggleFullscreen(); }}>
                          <span aria-hidden="true">⛶</span>
                          <span>{shellLabel(isFullscreen ? 'Exit fullscreen' : 'Fullscreen')}</span>
                        </button>
                        {onMainMenu && !hideMainMenuButton && <button type="button" role="menuitem" onClick={() => { setMobileMenuOpen(false); onMainMenu(); }}>
                          <span aria-hidden="true">⌂</span>
                          <span>{shellLabel('Main menu')}</span>
                        </button>}
                        {!hideExitControl && <button type="button" role="menuitem" className="danger" onClick={() => { setMobileMenuOpen(false); setShowExitNotice(true); }}>
                          <span aria-hidden="true">✕</span>
                          <span>{shellLabel('Exit game')}</span>
                        </button>}
                      </div>
                    )}
                  </div>
                </>
              }
            />
            {controls && (
              <div className="game-shell-controls-bar">
                {controls}
              </div>
            )}
          </>
        )}
      >
        <ErrorBoundary resetKey={sessionKey} onRetry={restart} onExit={() => window.location.assign('/games')}>
          <div className="game-shell-play-area" aria-busy={paused}>
            {children}
            {paused && (
              <section className="game-shell-overlay" role="dialog" aria-modal="true" aria-labelledby="game-paused-title">
                <div className="game-shell-overlay-card">
                  <span aria-hidden="true" className="game-shell-overlay-icon">⏸</span>
                  <h2 id="game-paused-title">{shellLabel('Game paused')}</h2>
                  <p>{shellLabel('Your progress in this round is still here.')}</p>
                  <div className="game-shell-overlay-actions">
                    <button type="button" className="game-shell-primary-action" onClick={resume}>{shellLabel('Resume game')}</button>
                    <button type="button" className="game-shell-secondary-action" onClick={restart}>{shellLabel('Restart round')}</button>
                  </div>
                </div>
              </section>
            )}
            {showExitNotice && (
              <section className="game-shell-overlay game-shell-exit-notice" role="dialog" aria-modal="true" aria-labelledby="game-exit-title">
                <div className="game-shell-overlay-card">
                  <span aria-hidden="true" className="game-shell-overlay-icon">🚪</span>
                  <h2 id="game-exit-title">{shellLabel('Leave this game?')}</h2>
                  <p>{shellLabel('Your current round will end and you will return to the games list.')}</p>
                  <div className="game-shell-overlay-actions">
                    <button type="button" className="game-shell-primary-action" onClick={() => window.location.assign('/games')}>{shellLabel('Leave game')}</button>
                    <button type="button" className="game-shell-secondary-action" onClick={() => setShowExitNotice(false)}>{shellLabel('Keep playing')}</button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </ErrorBoundary>
      </GameLayout>
      </GameTranslationProvider>
    </div>
  );
}
