'use client';
// components/AppShell.tsx

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Toast from './ui/Toast';
import AchievementToast from '@/features/achievements/components/AchievementToast';
import { useGame } from '@/lib/gameState';

const NO_SHELL_PATHS = ['/', '/auth'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname   = usePathname() ?? '';
  const isGameRoute = pathname.startsWith('/games');
  const showShell  = !NO_SHELL_PATHS.includes(pathname) && !isGameRoute;
  const { pendingAchievement, clearPendingAchievement } = useGame();

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
          icon={pendingAchievement.icon}
          title={pendingAchievement.name}
          description={pendingAchievement.description}
          color={pendingAchievement.color}
          onDone={clearPendingAchievement}
        />
      )}
    </div>
  );
}
