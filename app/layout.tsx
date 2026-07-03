// app/layout.tsx
import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import './globals.css';
import { GameProvider } from '@/lib/gameState';
import PageTransition from '@/components/PageTransition';
import AppShell from '@/components/AppShell';
import AchievementPopup from '@/features/achievements/components/AchievementPopup';
import AppBackground from '@/components/AppBackground';

export const metadata: Metadata = {
  title: 'ESL Game Hub',
  description: 'Learn through play — vocabulary, grammar, word-building and more.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          <AppBackground />
          <AchievementPopup />
          <AppShell>
            <PageTransition>
              {children}
            </PageTransition>
          </AppShell>
        </GameProvider>
      </body>
    </html>
  );
}
