'use client';
// components/AppShell.tsx

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Toast from './Toast';
import AchievementToast from './AchievementToast';
import { useGame } from '@/lib/gameState';

const NO_SHELL = ['/auth', '/games/'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname   = usePathname() ?? '';
  const showShell  = !NO_SHELL.some(p => pathname.startsWith(p));
  const { pendingAchievement, clearPendingAchievement } = useGame();

  return (
    <>
      {showShell && <Navbar />}
      {showShell && <Toast />}
      {children}
      {/* Achievement popup — rendered outside the shell guard so it
          also fires on game pages when a result comes back */}
      {pendingAchievement && (
        <AchievementToast
          key={pendingAchievement.id}
          icon={pendingAchievement.icon}
          title={pendingAchievement.title}
          description={pendingAchievement.description}
          color={pendingAchievement.color}
          onDone={clearPendingAchievement}
        />
      )}
    </>
  );
}