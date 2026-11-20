'use client';
// components/AppShell.tsx

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useContext, useRef } from 'react';
import Navbar from './Navbar';
import Toast from './ui/Toast';
import AchievementToast from '@/features/achievements/components/AchievementToast';
import { GameContext } from '@/providers/GameProvider';
import { onAuthStateChanged } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { GAME_BAR_COLOR } from '@/constants/index';
import type { CSSProperties } from 'react';

const NO_SHELL_PATHS = ['/', '/auth'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname   = usePathname() ?? '';
  const router = useRouter();
  const isGameRoute = pathname.startsWith('/games/');
  const gameId = isGameRoute ? pathname.split('/')[2] : '';
  const shellStyle = isGameRoute
    ? { '--game-toast-accent': GAME_BAR_COLOR[gameId] ?? 'var(--purple)' } as CSSProperties
    : undefined;
  const showShell  = !NO_SHELL_PATHS.includes(pathname) && !isGameRoute;
  
  // Safely get game context without throwing
  const gameContext = useContext(GameContext);
  const pendingAchievement = gameContext?.pendingAchievement ?? null;
  const clearPendingAchievement = gameContext?.clearPendingAchievement ?? (() => {});
  const addPlayTime = gameContext?.addPlayTime;
  const [reward, setReward] = useState<any>(null);
  const [showSaveProgressPrompt, setShowSaveProgressPrompt] = useState(false);
  const savePromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isGameRoute || !addPlayTime) return;

    let isVisible = document.visibilityState === 'visible';
    let activeSince = Date.now();
    let elapsedMilliseconds = 0;

    function flushPlayTime() {
      const now = Date.now();
      if (isVisible) elapsedMilliseconds += Math.max(0, now - activeSince);
      activeSince = now;
      const seconds = Math.floor(elapsedMilliseconds / 1000);
      if (seconds > 0 && addPlayTime) {
        elapsedMilliseconds -= seconds * 1000;
        addPlayTime(seconds);
      }
    }

    function handleVisibilityChange() {
      flushPlayTime();
      isVisible = document.visibilityState === 'visible';
      activeSince = Date.now();
    }

    const timer = window.setInterval(flushPlayTime, 15_000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushPlayTime);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushPlayTime);
      flushPlayTime();
    };
  }, [isGameRoute, addPlayTime]);

  useEffect(() => {
    const handleReward = (event: Event) => {
      setReward((event as CustomEvent).detail);
      if (
        localStorage.getItem('guestUser') !== 'true'
        || sessionStorage.getItem('guestSaveProgressPromptShown') === 'true'
      ) return;

      if (savePromptTimerRef.current) clearTimeout(savePromptTimerRef.current);
      savePromptTimerRef.current = setTimeout(() => {
        savePromptTimerRef.current = null;
        if (localStorage.getItem('guestUser') !== 'true') return;
        sessionStorage.setItem('guestSaveProgressPromptShown', 'true');
        setShowSaveProgressPrompt(true);
      }, 5000);
    };
    window.addEventListener('esl-game-reward', handleReward);
    return () => {
      window.removeEventListener('esl-game-reward', handleReward);
      if (savePromptTimerRef.current) clearTimeout(savePromptTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname === '/' || pathname === '/auth' || pathname === '/auth/verify') return;
    if (localStorage.getItem('guestUser') === 'true') return;

    return onAuthStateChanged(user => {
      if (!user || user.emailVerified) return;
      router.replace(`/auth/verify?returnTo=${encodeURIComponent(pathname)}`);
    });
  }, [pathname, router]);

  return (
    <div className={`app-shell-wrap${showShell ? '' : ' no-shell'}${isGameRoute ? ' game-route-wrap' : ''}`} style={shellStyle}>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {showShell && <Navbar />}
      <Toast />

      <main id="main-content">
        {children}
      </main>

      {/* Achievement popup — rendered outside the shell guard so it
          also fires on game pages when a result comes back */}
      {pendingAchievement && (
        <AchievementToast
          key={pendingAchievement.id}
          className={isGameRoute ? 'achievement-toast--game' : undefined}
          icon={pendingAchievement.icon}
          title={pendingAchievement.name}
          description={pendingAchievement.description}
          color={pendingAchievement.color}
          onDone={clearPendingAchievement}
        />
      )}
      {reward && !pendingAchievement && (
        <AchievementToast
          key={reward.id}
          className={isGameRoute ? 'achievement-toast--game' : undefined}
          icon={reward.icon}
          title={reward.title}
          description={reward.description}
          color={reward.color}
          onDone={() => setReward(null)}
        />
      )}
      {showSaveProgressPrompt && (
        <section className="save-progress-prompt" role="dialog" aria-modal="true" aria-labelledby="save-progress-title">
          <div className="save-progress-card">
            <span className="save-progress-icon" aria-hidden="true">🏆</span>
            <p className="save-progress-eyebrow">NICE WORK!</p>
            <h2 id="save-progress-title">Keep your progress</h2>
            <p>Create a free account to save your progress and rewards across devices, or join a class.</p>
            <div className="save-progress-actions">
              <button
                type="button"
                className="save-progress-primary"
                onClick={() => {
                  setShowSaveProgressPrompt(false);
                  router.push('/auth?tab=register&reason=save-progress&returnTo=/hub');
                }}
              >
                Create a free account
              </button>
              <button type="button" className="save-progress-secondary" onClick={() => setShowSaveProgressPrompt(false)}>
                Keep playing as a guest
              </button>
            </div>
            <small>Guest progress stays saved on this device.</small>
          </div>
        </section>
      )}
    </div>
  );
}
