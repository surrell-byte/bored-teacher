// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/lib/gameState';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'ESL Game Hub',
  description: 'Learn through play — vocabulary, grammar, word-building and more.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </GameProvider>
      </body>
    </html>
  );
}