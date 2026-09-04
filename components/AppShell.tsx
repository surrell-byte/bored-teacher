'use client';
// components/AppShell.tsx

import { usePathname } from 'next/navigation';
import { type ReactNode, useContext } from 'react';
import Navbar from './Navbar';
import Toast from './ui/Toast';
import AchievementToast from '@/features/achievements/components/AchievementToast';
import { GameContext } from '@/providers/GameProvider';
import { useEffect, useState } from 'react';

const NO_SHELL_PATHS = ['/', '/auth'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname   = usePathname() ?? '';
  const isGameRoute = pathname.startsWith('/games/');
  const showShell  = !NO_SHELL_PATHS.includes(pathname);
  
  // Safely get game context without throwing
  const gameContext = useContext(GameContext);
  const pendingAchievement = gameContext?.pendingAchievement ?? null;
  const clearPendingAchievement = gameContext?.clearPendingAchievement ?? (() => {});
  const [reward, setReward] = useState<any>(null);

  useEffect(() => {
    const handleReward = (event: Event) => setReward((event as CustomEvent).detail);
    window.addEventListener('esl-game-reward', handleReward);
    return () => window.removeEventListener('esl-game-reward', handleReward);
  }, []);

  return (
    <div className={`app-shell-wrap${showShell ? '' : ' no-shell'}`}>
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
    </div>
  );
}
