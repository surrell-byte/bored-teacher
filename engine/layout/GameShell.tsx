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

type LegacyFullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type LegacyFullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

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
  const [fullscreenMessage, setFullscreenMessage] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [showExitNotice, setShowExitNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'requesting' | 'previewing' | 'recording' | 'stopping'>('idle');
  const [recordingMessage, setRecordingMessage] = useState('');
  const [recordingPreview, setRecordingPreview] = useState('');
  const [helpLanguage, setHelpLanguage] = useState<GameHelpLanguage>('off');
  const shellRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    recordingStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);
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

  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    else recordingStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const syncFullscreen = () => {
      const fullscreenDocument = document as LegacyFullscreenDocument;
      const activeElement = document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement;
      const active = activeElement === shellRef.current;
      setIsFullscreen(active);
      if (active) setFullscreenMessage('');
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
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
      const fullscreenDocument = document as LegacyFullscreenDocument;
      if (event.key === 'Escape' && (document.fullscreenElement || fullscreenDocument.webkitFullscreenElement)) return;
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

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    setRecordingState('stopping');
    setRecordingMessage('Finishing your gameplay recording…');
    recorder.stop();
  }, []);

  const cancelRecordingPreview = useCallback(() => {
    const stream = recordingStreamRef.current;
    recordingStreamRef.current = null;
    stream?.getTracks().forEach(track => track.stop());
    setRecordingPreview('');
    setRecordingState('idle');
    setRecordingMessage('Screen preview cancelled.');
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return;
    setRecordingMessage('');
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') {
      setRecordingMessage('MP4 screen recording is not supported in this browser.');
      return;
    }

    const mimeType = [
      'video/mp4;codecs=avc3.42E01E',
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4',
    ].find(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) {
      setRecordingMessage('This browser cannot record MP4. Try an up-to-date version of Chrome, Edge, or Safari.');
      return;
    }

    setRecordingState('requesting');
    setRecordingMessage('Choose this game tab in the browser prompt.');
    let stream: MediaStream | null = null;
    try {
      const captureOptions: DisplayMediaStreamOptions & { preferCurrentTab?: boolean } = {
        video: { displaySurface: 'browser', frameRate: { ideal: 30, max: 30 } },
        audio: false,
        preferCurrentTab: true,
      };
      stream = await navigator.mediaDevices.getDisplayMedia(captureOptions);
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('The selected screen did not provide a video track.');
      }

      const previewVideo = document.createElement('video');
      previewVideo.muted = true;
      previewVideo.playsInline = true;
      previewVideo.srcObject = stream;
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('The selected screen did not provide a video preview. Choose this game tab and try again.')), 10_000);
          previewVideo.onloadeddata = () => {
            window.clearTimeout(timeout);
            resolve();
          };
          previewVideo.onerror = () => {
            window.clearTimeout(timeout);
            reject(new Error('Could not preview the selected screen. Choose this game tab and try again.'));
          };
          void previewVideo.play().catch(error => {
            window.clearTimeout(timeout);
            reject(error);
          });
        });
        if (!previewVideo.videoWidth || !previewVideo.videoHeight) {
          throw new Error('The selected screen preview is blank. Choose this game tab and try again.');
        }
        const previewCanvas = document.createElement('canvas');
        const scale = Math.min(1, 480 / previewVideo.videoWidth);
        previewCanvas.width = Math.round(previewVideo.videoWidth * scale);
        previewCanvas.height = Math.round(previewVideo.videoHeight * scale);
        const previewContext = previewCanvas.getContext('2d');
        if (!previewContext) throw new Error('Could not create a preview of the selected screen.');
        previewContext.drawImage(previewVideo, 0, 0, previewCanvas.width, previewCanvas.height);
        setRecordingPreview(previewCanvas.toDataURL('image/jpeg', 0.78));
      } finally {
        previewVideo.pause();
        previewVideo.srcObject = null;
      }

      recordingStreamRef.current = stream;
      setRecordingState('previewing');
      setRecordingMessage('Check the preview before recording. If it does not show the game, cancel and choose this tab.');
      videoTrack.addEventListener('ended', () => {
        if (recordingStreamRef.current !== stream) return;
        const activeRecorder = recorderRef.current;
        if (activeRecorder && activeRecorder.state !== 'inactive') {
          activeRecorder.stop();
        } else {
          recordingStreamRef.current = null;
          setRecordingPreview('');
          setRecordingState('idle');
          setRecordingMessage('Screen sharing ended before recording started.');
        }
      }, { once: true });
    } catch (error) {
      recordingStreamRef.current = null;
      stream?.getTracks().forEach(track => track.stop());
      recorderRef.current = null;
      setRecordingPreview('');
      setRecordingState('idle');
      if (error instanceof DOMException && ['AbortError', 'NotAllowedError'].includes(error.name)) {
        setRecordingMessage('Screen sharing was cancelled. Choose this game tab to start recording.');
      } else {
        console.error('Could not start gameplay screen recording.', error);
        setRecordingMessage(error instanceof Error ? error.message : 'Could not preview the screen for recording.');
      }
    }
  }, [recordingState]);

  const beginRecording = useCallback(() => {
    const stream = recordingStreamRef.current;
    if (recordingState !== 'previewing' || !stream) return;
    try {
      const mimeType = [
        'video/mp4;codecs=avc3.42E01E',
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4',
      ].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        throw new Error('This browser cannot record MP4. Try an up-to-date version of Chrome, Edge, or Safari.');
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = event => {
        console.error('Gameplay screen recording failed.', event);
        setRecordingMessage('The recording failed. Try again or use your device’s screen recorder.');
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        recorderRef.current = null;
        recordingStreamRef.current = null;
        stream.getTracks().forEach(track => track.stop());
        setRecordingState('idle');
        setRecordingPreview('');
        if (!blob.size) {
          setRecordingMessage('No video was captured. Check the preview and record for a little longer.');
          return;
        }
        if (!blob.type.includes('mp4')) {
          console.error('The browser returned a non-MP4 gameplay recording.', { type: blob.type });
          setRecordingMessage('This browser did not produce an MP4. Try an up-to-date version of Chrome, Edge, or Safari.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${gameId}-gameplay-${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        const fileSize = blob.size >= 1_048_576
          ? `${(blob.size / 1_048_576).toFixed(1)} MB`
          : `${Math.max(1, Math.round(blob.size / 1024))} KB`;
        setRecordingMessage(`Gameplay recording downloaded as MP4 (${fileSize}).`);
      };
      recorder.start(1000);
      setRecordingPreview('');
      setRecordingState('recording');
      setRecordingMessage('Recording gameplay as MP4. Stop to download your video.');
    } catch (error) {
      recordingStreamRef.current = null;
      stream.getTracks().forEach(track => track.stop());
      recorderRef.current = null;
      setRecordingPreview('');
      setRecordingState('idle');
      console.error('Could not start MP4 gameplay recording.', error);
      setRecordingMessage(error instanceof Error ? error.message : 'Could not start MP4 screen recording.');
    }
  }, [gameId, recordingState]);

  const toggleFullscreen = useCallback(async () => {
    const fullscreenDocument = document as LegacyFullscreenDocument;
    const activeElement = document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement;
    try {
      if (activeElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (fullscreenDocument.webkitExitFullscreen) await fullscreenDocument.webkitExitFullscreen();
        else throw new Error('This browser does not provide a fullscreen exit method.');
        return;
      }

      const shell = shellRef.current as LegacyFullscreenElement | null;
      if (shell?.requestFullscreen) await shell.requestFullscreen({ navigationUI: 'hide' });
      else if (shell?.webkitRequestFullscreen) await shell.webkitRequestFullscreen();
      else {
        setFullscreenMessage('This browser cannot hide its controls on a web page. Use “Add to Home Screen” in your browser to launch the installed app without browser chrome.');
      }
    } catch (error) {
      console.error('Could not change game fullscreen mode.', error);
      setFullscreenMessage('Fullscreen was blocked by the browser. Try again from its game menu, or use “Add to Home Screen” for a browser-free launch.');
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
                  <button
                    type="button"
                    className={`game-shell-header-action game-shell-recorder-control${recordingState === 'recording' ? ' is-recording' : ''}`}
                    onClick={() => {
                      if (recordingState === 'recording') stopRecording();
                      else if (recordingState === 'previewing') cancelRecordingPreview();
                      else void startRecording();
                    }}
                    disabled={recordingState === 'requesting' || recordingState === 'stopping'}
                    aria-label={shellText(recordingState === 'recording' ? 'Stop gameplay recording' : recordingState === 'previewing' ? 'Cancel screen preview' : 'Record gameplay as MP4')}
                    aria-pressed={recordingState === 'recording'}
                    title={shellText(recordingState === 'recording' ? 'Stop gameplay recording' : recordingState === 'previewing' ? 'Cancel screen preview' : 'Record gameplay as MP4')}
                  >
                    <span aria-hidden="true">{recordingState === 'recording' ? '⏹' : recordingState === 'requesting' ? '◌' : '⏺'}</span>
                    <span className="game-shell-action-label">{shellLabel(recordingState === 'recording' ? 'Stop recording' : recordingState === 'requesting' ? 'Choose screen' : recordingState === 'previewing' ? 'Cancel preview' : 'Record MP4')}</span>
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
                        <button
                          type="button"
                          role="menuitem"
                          className={recordingState === 'recording' ? 'is-recording' : undefined}
                          disabled={recordingState === 'requesting' || recordingState === 'stopping'}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (recordingState === 'recording') stopRecording();
                            else if (recordingState === 'previewing') cancelRecordingPreview();
                            else void startRecording();
                          }}
                        >
                          <span aria-hidden="true">{recordingState === 'recording' ? '⏹' : recordingState === 'requesting' ? '◌' : '⏺'}</span>
                          <span>{shellLabel(recordingState === 'recording' ? 'Stop recording' : recordingState === 'requesting' ? 'Choose screen' : recordingState === 'previewing' ? 'Cancel preview' : 'Record MP4')}</span>
                          {recordingState === 'recording' && <small>REC</small>}
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
      {recordingState === 'previewing' && recordingPreview && (
        <section className="game-shell-recording-preview" role="dialog" aria-labelledby="game-shell-recording-preview-title">
          <h2 id="game-shell-recording-preview-title">Check the screen preview</h2>
          <p>Make sure this shows the game. If it is blank or shows another screen, cancel and choose this game tab.</p>
          <div
            className="game-shell-recording-preview-image"
            role="img"
            aria-label="Preview of the screen selected for recording"
            style={{ backgroundImage: `url("${recordingPreview}")` }}
          />
          <div className="game-shell-recording-preview-actions">
            <button type="button" className="game-shell-primary-action" onClick={beginRecording}>Start MP4 recording</button>
            <button type="button" className="game-shell-secondary-action" onClick={cancelRecordingPreview}>Cancel</button>
          </div>
        </section>
      )}
      {fullscreenMessage && (
        <div className="game-shell-fullscreen-message" role="status">
          <span>{fullscreenMessage}</span>
          <button type="button" onClick={() => setFullscreenMessage('')} aria-label="Dismiss fullscreen message">×</button>
        </div>
      )}
      {recordingMessage && (
        <div className={`game-shell-recording-status${recordingState === 'recording' ? ' is-active' : ''}`} role="status" aria-live="polite">
          <span aria-hidden="true">{recordingState === 'recording' ? '● ' : ''}</span>{recordingMessage}
        </div>
      )}
      </GameTranslationProvider>
    </div>
  );
}
