'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import GameLayout from './GameLayout';
import GameHeader from './GameHeader';
import { type GameStat } from './GameSidebar';
import ErrorBoundary from '@/engine/errors/ErrorBoundary';
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound/beep';

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
  gameId, title, icon, stats, controls, headerExtra, children, sessionKey = 0,
  completion, onContinue, onRestart, onMainMenu, onSessionEvent, themeVars, hidePauseControl = false, hideExitControl = false,
  themeOptions, themeValue, onThemeChange,
}: GameShellProps) {
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const shellRef = useRef<HTMLDivElement>(null);

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
    setSoundEnabled(soundOn);
  }, [soundOn]);

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

  const accuracy = completion ? Math.min(100, Math.max(0, completion.accuracy)) : 0;
  const completionStats: GameStat[] = completion ? [
    { label: 'Score', value: completion.score, icon: '🏆' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
  ] : [];
  const topBarStats = [...(stats ?? []), ...completionStats];

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
      <GameLayout
        header={
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
                          <span>{stat.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {themeOptions && themeValue && onThemeChange && (
                    <label className="game-shell-header-action" style={{ gap: 6 }}>
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
                  {headerExtra}
                  <button
                    type="button"
                    className="game-shell-header-action"
                    onClick={() => setSoundOn(value => !value)}
                    aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
                  >
                    {soundOn ? '🔊 Sound' : '🔇 Sound'}
                  </button>
                  {!hidePauseControl && <button type="button" className="game-shell-header-action" onClick={paused ? resume : pause} aria-pressed={paused}>
                    {paused ? 'Resume' : 'Pause'}
                  </button>}
                  <button type="button" className="game-shell-header-action" onClick={toggleFullscreen}>
                    {isFullscreen ? 'Exit full screen' : 'Full screen'}
                  </button>
                  {!hideExitControl && <Link className="game-shell-header-action" href="/games">Exit</Link>}
                                  {onMainMenu ? <button type="button" className="game-shell-header-action" onClick={onMainMenu}>Main menu</button> : !hideExitControl && <Link className="game-shell-header-action" href="/games">Exit</Link>}
                </>
              }
            />
            {controls && (
              <div className="game-shell-controls-bar">
                {controls}
              </div>
            )}
          </>
        }
      >
        <ErrorBoundary resetKey={sessionKey} onRetry={restart} onExit={() => window.location.assign('/games')}>
          <div className="game-shell-play-area" aria-busy={paused}>
            {children}
            {paused && (
              <section className="game-shell-overlay" role="dialog" aria-modal="true" aria-labelledby="game-paused-title">
                <div className="game-shell-overlay-card">
                  <span aria-hidden="true" className="game-shell-overlay-icon">⏸</span>
                  <h2 id="game-paused-title">Game paused</h2>
                  <p>Your progress in this round is still here.</p>
                  <div className="game-shell-overlay-actions">
                    <button type="button" className="game-shell-primary-action" onClick={resume}>Resume game</button>
                    <button type="button" className="game-shell-secondary-action" onClick={restart}>Restart round</button>
                  </div>
                </div>
              </section>
            )}
            {completion && (
              <section className="game-shell-overlay game-shell-completion" role="dialog" aria-modal="true" aria-labelledby="game-complete-title">
                <div className="game-shell-overlay-card">
                  <span aria-hidden="true" className="game-shell-overlay-icon">🏆</span>
                  <h2 id="game-complete-title">Round complete — {title}</h2>
                  <div className="game-shell-result-grid">
                    <span><b>{completion.score}</b>Score</span><span><b>{accuracy}%</b>Accuracy</span>
                    <span><b>+{Math.round(accuracy / 2)}</b>XP</span><span><b>+{Math.round(accuracy / 10)}</b>Coins</span>
                  </div>
                  <button type="button" className="game-shell-primary-action" onClick={onContinue}>Play again</button>
                </div>
              </section>
            )}
          </div>
        </ErrorBoundary>
      </GameLayout>
    </div>
  );
}
